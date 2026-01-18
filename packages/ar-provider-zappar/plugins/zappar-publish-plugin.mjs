// plugins/zappar-publish-plugin.mjs
import {EditorPlugin, ui, workspace, tools} from '@wonderlandengine/editor-api';
import {spawn} from 'child_process';
import fs from 'fs';
import path from 'path';

// Zappar logo (GitHub org avatar) as base64.
// Source: https://github.com/zappar-xr.png
const ZAPPAR_LOGO_JPEG_BASE64 =
    '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';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

function splitArgs(str) {
    if (!str) return [];
    const args = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while ((match = re.exec(str))) args.push(match[1] ?? match[2] ?? match[3]);
    return args;
}

function stripOutputArgs(args) {
    const out = [];
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-o' || a === '--output') {
            i++;
            continue;
        }
        out.push(a);
    }
    return out;
}

function resolveWorkspacePath(maybeRelativePath) {
    if (!maybeRelativePath) return '';
    return path.isAbsolute(maybeRelativePath)
        ? maybeRelativePath
        : path.join(workspace.root, maybeRelativePath);
}

function isImageFile(filePath) {
    return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export default class ZapparPublishPlugin extends EditorPlugin {
    constructor() {
        super();
        this.name = 'Zappar Publish Plugin';

        this._logoImage = null;

        this._cliAvailable = false;
        this._cliCommand = null;
        this._cliVersion = '';
        this._checkingCli = false;
        this._installingCli = false;

        this._projectId = '';
        this._version = '1.0.0';
        this._publishing = false;

        this._trainInputPath = '';
        this._trainExtraArgs = '';
        this._training = false;
        this._trainProgress = '';

        this._status = '';
        this._lastLog = '';

        this._deployFolder = workspace.deployPath;
        this._targetsFolder = path.join(workspace.root, 'static', 'zappar-targets');

        ui.loadImage(Buffer.from(ZAPPAR_LOGO_JPEG_BASE64, 'base64'))
            .then((img) => (this._logoImage = img))
            .catch((e) => console.warn('Failed to load Zappar logo:', e));

        this._checkCli();
    }

    draw() {
        if (this._logoImage) ui.image(this._logoImage, 96, 96);
        ui.label('Publish to ZapWorks (Zappar)');

        ui.separator();
        this._drawCliSection();
        ui.separator();
        this._drawPublishSection();
        ui.separator();
        this._drawTrainSection();

        if (this._status) {
            ui.separator();
            ui.label(this._status);
        }
        if (this._lastLog && ui.button('Log last output to console')) {
            console.log(this._lastLog);
        }
    }

    _drawCliSection() {
        ui.label('ZapWorks CLI');

        if (this._checkingCli) {
            ui.label('Checking for `zapworks`...');
            ui.spinner();
            return;
        }

        if (!this._cliAvailable) {
            ui.label('ZapWorks CLI not found.');
            ui.label('Install: `npm i -g @zappar/zapworks-cli`');
            if (ui.button('Install globally')) this._installCliGlobal();
            if (ui.button('Install locally (dev dependency)')) this._installCliLocal();
            if (ui.button('Re-check')) this._checkCli();
            return;
        }

        ui.label(
            `Found: ${this._cliCommand}${this._cliVersion ? ` (${this._cliVersion})` : ''}`
        );
        if (ui.button('Re-check')) this._checkCli();
    }

    _drawPublishSection() {
        ui.label('Publish');
        ui.label(`Deploy folder: ${this._deployFolder}`);

        const projectId = ui.inputText('ZapWorks Project ID', this._projectId);
        if (projectId !== null) this._projectId = projectId;
        const version = ui.inputText('Version', this._version);
        if (version !== null) this._version = version;

        const canRun = this._cliAvailable && !!this._projectId && !!this._version;
        if (!canRun) {
            ui.label('Enter Project ID + Version to enable publish actions.');
        }

        if (this._publishing) {
            ui.label('Publishing...');
            ui.spinner();
            return;
        }

        if (ui.button('Package Project')) {
            this._packageProject().catch((e) => this._setError(e, 'Packaging failed'));
        }

        if (ui.button('Upload (deploy/)')) this._upload({alsoPublish: false});
        if (ui.button('Publish')) this._publishOnly();
        if (ui.button('Upload & Publish')) this._upload({alsoPublish: true});
    }

    _drawTrainSection() {
        ui.label('Train image targets');
        ui.label(`Outputs to: ${this._targetsFolder}`);

        const inputPath = ui.inputText(
            'Image file or folder path',
            this._trainInputPath
        );
        if (inputPath !== null) this._trainInputPath = inputPath;

        const extra = ui.inputText('Extra train args (optional)', this._trainExtraArgs);
        if (extra !== null) this._trainExtraArgs = extra;

        if (this._training) {
            ui.label(this._trainProgress || 'Training...');
            ui.spinner();
            return;
        }

        if (ui.button('Train Targets')) this._trainTargets();
    }

    _getLocalCliPath() {
        const bin = process.platform === 'win32' ? 'zapworks.cmd' : 'zapworks';
        return path.join(workspace.root, 'node_modules', '.bin', bin);
    }

    _checkCli() {
        this._checkingCli = true;
        this._cliAvailable = false;
        this._cliCommand = null;
        this._cliVersion = '';
        this._status = '';

        const candidates = [];
        const local = this._getLocalCliPath();
        if (fs.existsSync(local)) candidates.push(local);
        candidates.push('zapworks');

        const tryNext = (i) => {
            if (i >= candidates.length) {
                this._checkingCli = false;
                this._cliAvailable = false;
                this._status = 'ZapWorks CLI not found.';
                return;
            }

            const cmd = candidates[i];
            const proc = spawn(cmd, ['--version'], {
                cwd: workspace.root,
                shell: true,
            });

            let buf = '';
            proc.stdout.on('data', (d) => (buf += d.toString()));
            proc.stderr.on('data', (d) => (buf += d.toString()));
            proc.on('close', (code) => {
                if (code === 0) {
                    this._checkingCli = false;
                    this._cliAvailable = true;
                    this._cliCommand = cmd;
                    this._cliVersion = buf.trim();
                    this._status = 'ZapWorks CLI ready.';
                } else {
                    tryNext(i + 1);
                }
            });
        };

        tryNext(0);
    }

    _installCliLocal() {
        this._installingCli = true;
        this._status = 'Installing ZapWorks CLI locally...';
        this._runProcess('npm', ['install', '@zappar/zapworks-cli', '--save-dev'])
            .then(() => this._checkCli())
            .catch((e) => this._setError(e, 'Local install failed'))
            .finally(() => (this._installingCli = false));
    }

    _installCliGlobal() {
        this._installingCli = true;
        this._status = 'Installing ZapWorks CLI globally...';
        this._runProcess('npm', ['install', '-g', '@zappar/zapworks-cli'])
            .then(() => this._checkCli())
            .catch((e) => this._setError(e, 'Global install failed'))
            .finally(() => (this._installingCli = false));
    }

    async _packageProject() {
        this._status = 'Packaging project...';
        await tools.packageProject();
        this._status = 'Packaging complete.';
    }

    _runProcess(command, args, {label} = {}) {
        return new Promise((resolve, reject) => {
            const proc = spawn(command, args, {
                cwd: workspace.root,
                shell: true,
            });

            let buf = '';
            const onData = (d) => {
                const s = d.toString();
                buf += s;
                this._lastLog = buf;
                if (label) this._status = `${label}: ${s.trim()}`;
            };

            proc.stdout.on('data', onData);
            proc.stderr.on('data', onData);
            proc.on('close', (code) => {
                this._lastLog = buf;
                if (code === 0) resolve(buf);
                else reject(new Error(`${command} exited with code ${code}`));
            });
        });
    }

    _runZapworks(args, {label} = {}) {
        if (!this._cliCommand) return Promise.reject(new Error('ZapWorks CLI unavailable'));
        return this._runProcess(this._cliCommand, args, {label});
    }

    _upload({alsoPublish}) {
        if (this._publishing) return;
        if (!this._cliAvailable) {
            this._status = 'ZapWorks CLI not available.';
            return;
        }
        if (!this._projectId || !this._version) {
            this._status = 'Missing Project ID or Version.';
            return;
        }

        this._publishing = true;
        (async () => {
            await this._packageProject();
            await this._runZapworks(
                [
                    'upload',
                    '--version',
                    this._version,
                    '--project',
                    this._projectId,
                    this._deployFolder,
                ],
                {label: 'Uploading'}
            );

            if (alsoPublish) {
                await this._runZapworks(
                    ['publish', '--version', this._version, '--project', this._projectId],
                    {label: 'Publishing'}
                );
            }

            this._status = alsoPublish ? 'Upload & publish complete.' : 'Upload complete.';
        })()
            .catch((e) => this._setError(e, 'Upload/publish failed'))
            .finally(() => (this._publishing = false));
    }

    _publishOnly() {
        if (this._publishing) return;
        if (!this._cliAvailable) {
            this._status = 'ZapWorks CLI not available.';
            return;
        }
        if (!this._projectId || !this._version) {
            this._status = 'Missing Project ID or Version.';
            return;
        }

        this._publishing = true;
        this._runZapworks(
            ['publish', '--version', this._version, '--project', this._projectId],
            {label: 'Publishing'}
        )
            .then(() => (this._status = 'Publish complete.'))
            .catch((e) => this._setError(e, 'Publish failed'))
            .finally(() => (this._publishing = false));
    }

    async _collectImages(input) {
        const resolved = resolveWorkspacePath(input);
        const stat = await fs.promises.stat(resolved);

        if (stat.isDirectory()) {
            const entries = await fs.promises.readdir(resolved, {withFileTypes: true});
            return entries
                .filter((e) => e.isFile())
                .map((e) => path.join(resolved, e.name))
                .filter(isImageFile);
        }

        return [resolved];
    }

    _trainTargets() {
        if (this._training) return;
        if (!this._cliAvailable) {
            this._status = 'ZapWorks CLI not available.';
            return;
        }
        if (!this._trainInputPath) {
            this._status = 'Provide an image path or folder path.';
            return;
        }

        this._training = true;
        this._trainProgress = '';

        (async () => {
            await fs.promises.mkdir(this._targetsFolder, {recursive: true});
            const images = await this._collectImages(this._trainInputPath);
            if (!images.length) {
                this._status = 'No .png/.jpg/.jpeg files found.';
                return;
            }

            const extraArgs = stripOutputArgs(splitArgs(this._trainExtraArgs));
            let ok = 0;
            let fail = 0;

            for (const img of images) {
                const base = path.parse(img).name;
                const out = path.join(this._targetsFolder, `${base}.zpt`);
                this._trainProgress = `Training ${path.basename(img)}...`;
                try {
                    await this._runZapworks(['train', img, ...extraArgs, '-o', out], {
                        label: 'Training',
                    });
                    ok++;
                } catch (e) {
                    console.error(e);
                    fail++;
                }
            }

            this._status = `Training complete. Success: ${ok}, Failed: ${fail}`;
        })()
            .catch((e) => this._setError(e, 'Training failed'))
            .finally(() => {
                this._training = false;
                this._trainProgress = '';
            });
    }

    _setError(error, prefix) {
        const msg = error?.message ?? String(error);
        this._status = prefix ? `${prefix}: ${msg}` : msg;
        console.error(error);
    }
}
