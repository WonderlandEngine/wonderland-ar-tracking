export class Emitter<TArgs extends unknown[] = unknown[]> {
    private listeners: Array<(...args: TArgs) => void> = [];

    add(listener: (...args: TArgs) => void) {
        this.listeners.push(listener);
    }

    remove(listener: (...args: TArgs) => void) {
        this.listeners = this.listeners.filter((item) => item !== listener);
    }

    has(listener: (...args: TArgs) => void) {
        return this.listeners.includes(listener);
    }

    notify(...args: TArgs) {
        for (const listener of [...this.listeners]) {
            listener(...args);
        }
    }

    reset() {
        this.listeners = [];
    }
}

export class RetainEmitter<TArgs extends unknown[] = []> extends Emitter<TArgs> {}

export class Component {
    engine: WonderlandEngine;
    object: {getComponent: (type: string) => unknown; setTransformWorld?: (value: unknown) => void};
    active = true;

    constructor(engine: WonderlandEngine) {
        this.engine = engine;
        this.object = {
            getComponent: () => null,
        };
    }
}

export class WonderlandEngine {
    onSceneLoaded = new Emitter<[]>();
    onXRSessionStart = new Emitter<[session: XRSession]>();
    onXRSessionEnd = new Emitter<[]>();
    arSupported = true;
    isReverseZEnabled = false;
    wasm = {
        _wl_view_component_remapProjectionMatrix: () => {},
    };
    canvas = {
        width: 1,
        height: 1,
        getContext: () => null,
    } as HTMLCanvasElement;
    scene = {
        colorClearEnabled: true,
        onPreRender: new Emitter<[]>(),
        onPostRender: new Emitter<[]>(),
    };

    requestXRSession(
        _mode: 'immersive-ar',
        _requiredFeatures: string[],
        _optionalFeatures: string[]
    ) {}
}
