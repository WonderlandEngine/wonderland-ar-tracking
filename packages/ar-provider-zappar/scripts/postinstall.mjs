import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logPrefix = '[ar-provider-zappar:postinstall]';

function log(...args) {
    // Keep output minimal but actionable.
    console.log(logPrefix, ...args);
}

function warn(...args) {
    console.warn(logPrefix, ...args);
}

function copyOrThrow(src, dest) {
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    fs.copyFileSync(src, dest);
}

function safeLinkOrCopy(src, dest) {
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    try {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        fs.linkSync(src, dest);
    } catch {
        try {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
        } catch {
            // ignore
        }
        fs.copyFileSync(src, dest);
    }
}

function listFiles(dir) {
    try {
        return fs.readdirSync(dir, {withFileTypes: true});
    } catch {
        return [];
    }
}

function findFirstFile(dir, predicate) {
    for (const entry of listFiles(dir)) {
        if (!entry.isFile()) continue;
        if (predicate(entry.name)) return path.join(dir, entry.name);
    }
    return null;
}

function findWasmFromWorker(workerPath, umdDir) {
    try {
        const src = fs.readFileSync(workerPath, 'utf8');
        const match = src.match(/["']([^"']+\.wasm)["']/);
        if (!match) return null;

        const candidate = path.resolve(umdDir, match[1]);
        const relative = path.relative(umdDir, candidate);

        // Ensure we never resolve outside the umd directory.
        if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

        return fs.existsSync(candidate) ? candidate : null;
    } catch {
        return null;
    }
}

function resolveZapparRoot() {
    const providerRoot = path.resolve(__dirname, '..');
    const zapparPackageJson = require.resolve('@zappar/zappar/package.json', {
        paths: [providerRoot],
    });
    return path.dirname(zapparPackageJson);
}

function resolveZapparCvRoot() {
    const providerRoot = path.resolve(__dirname, '..');
    const zapparCvPackageJson = require.resolve('@zappar/zappar-cv/package.json', {
        paths: [providerRoot],
    });
    return path.dirname(zapparCvPackageJson);
}

function resolveProjectRoot() {
    // INIT_CWD is set by npm/yarn/pnpm for lifecycle scripts and points at the
    // consumer project that triggered the install.
    const initCwd = process.env.INIT_CWD;
    if (initCwd && initCwd.trim()) return path.resolve(initCwd);

    // Fallback (best effort): current working directory.
    return process.cwd();
}

function main() {
    const zapparRoot = resolveZapparRoot();
    const umdDir = path.join(zapparRoot, 'umd');

    const zapparCvRoot = resolveZapparCvRoot();
    const zapparCvLibDir = path.join(zapparCvRoot, 'lib');

    const projectRoot = resolveProjectRoot();
    const outDir = path.resolve(projectRoot, 'static', 'zappar-cv');

    const workerSource =
        findFirstFile(umdDir, (name) => name === 'zappar.worker.js') ??
        findFirstFile(umdDir, (name) => name === 'zappar-cv.worker.js') ??
        findFirstFile(zapparRoot, (name) => name === 'zappar.worker.js') ??
        findFirstFile(zapparRoot, (name) => name === 'zappar-cv.worker.js') ??
        null;

    if (!workerSource) {
        warn('Could not locate Zappar worker under', umdDir);
        warn('Zappar root:', zapparRoot);
        return;
    }

    const wasmCandidates = listFiles(umdDir)
        .filter((e) => e.isFile() && e.name.endsWith('.wasm'))
        .map((e) => path.join(umdDir, e.name));

    let wasmSource = wasmCandidates.length === 1 ? wasmCandidates[0] : null;
    wasmSource = wasmSource ?? findWasmFromWorker(workerSource, umdDir);
    wasmSource = wasmSource ?? (wasmCandidates.length > 0 ? wasmCandidates[0] : null);

    if (!wasmSource) {
        warn('Could not locate Zappar wasm under', umdDir);
        warn('Worker found at:', workerSource);
        return;
    }

    fs.mkdirSync(outDir, {recursive: true});

    const workerDest = path.join(outDir, 'zappar-cv.worker.js');
    copyOrThrow(workerSource, workerDest);

    const wasmBasename = path.basename(wasmSource);
    const wasmDest = path.join(outDir, wasmBasename);
    copyOrThrow(wasmSource, wasmDest);

    // Create a stable alias that the Wonderland provider code points at.
    safeLinkOrCopy(wasmDest, path.join(outDir, 'zappar-cv.wasm'));

    // Optional: copy any Zappar binary blobs shipped alongside the wasm.
    // (Harmless if unused; avoids runtime 404s if Zappar expects them.)
    for (const entry of listFiles(umdDir)) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.zbin')) continue;
        copyOrThrow(path.join(umdDir, entry.name), path.join(outDir, entry.name));
    }

    // Required for face tracking defaults (FaceTracker.loadDefaultModel / FaceMesh.loadDefault*).
    // These ship in @zappar/zappar-cv/lib but are fetched at runtime unless staged.
    const requiredFaceModelFiles = [
        'face_tracking_model.zbin',
        'face_mesh_face_model.zbin',
    ];

    for (const filename of requiredFaceModelFiles) {
        const src = path.join(zapparCvLibDir, filename);
        const dest = path.join(outDir, filename);
        if (!fs.existsSync(src)) {
            warn('Could not locate required Zappar face model:', filename);
            warn('Looked under:', zapparCvLibDir);
            continue;
        }
        copyOrThrow(src, dest);
    }

    log('Copied Zappar CV assets into', outDir);
}

try {
    main();
} catch (e) {
    // Postinstall should not hard-fail the whole install; consumers can still override.
    warn('Failed to stage Zappar CV assets:', e);
}
