export type ZapparNamespace = typeof import('@zappar/zappar');
type ZapparCore = typeof import('@zappar/zappar/lib/zappar.js');

declare const WL_EDITOR: boolean | undefined;

function ensureEditorWindow(): void {
    if (typeof window !== 'undefined') return;
    if (typeof WL_EDITOR === 'undefined' || !WL_EDITOR) return;

    const globalObject = globalThis as typeof globalThis & {
        window?: Window & typeof globalThis;
    };

    if (!globalObject.window) {
        globalObject.window = globalObject as Window & typeof globalThis;
    }

    const ensuredWindow = globalObject.window as Partial<Window> & {
        location?: Location;
    };

    if (!ensuredWindow.location) {
        ensuredWindow.location = {href: ''} as unknown as Location;
    }
}

let zapparPromise: Promise<ZapparNamespace> | null = null;
let zapparCorePromise: Promise<ZapparCore> | null = null;

export function loadZappar(): Promise<ZapparNamespace> {
    if (!zapparPromise) {
        zapparPromise = (async () => {
            ensureEditorWindow();
            return import('@zappar/zappar');
        })();
    }
    return zapparPromise;
}

async function loadZapparCore(): Promise<ZapparCore> {
    if (!zapparCorePromise) {
        zapparCorePromise = (async () => {
            ensureEditorWindow();
            return import('@zappar/zappar/lib/zappar.js');
        })();
    }
    return zapparCorePromise;
}

export async function setOptions(
    opts: Parameters<ZapparCore['setOptions']>[0]
): Promise<void> {
    const [core, main] = await Promise.all([loadZapparCore(), loadZappar()]);
    core.setOptions(opts);

    /* If the main module also has setOptions (it might be re-exported), call it too.
     * This helps if the bundler has duplicated the zappar module instance. */
    if ((main as any).setOptions && (main as any).setOptions !== core.setOptions) {
        (main as any).setOptions(opts);
    }
}
