import {Emitter, RetainEmitter, WonderlandEngine} from '@wonderlandengine/api';
import {ARProvider} from './AR-provider.js';

/**
 * ARSession
 * - Manages all AR sessions.
 * - Registers dependencies (i.e., providers)
 * - Handles global callbacks when AR sessions are started or ended
 */

class ARSession {
    private static engines: WeakMap<WonderlandEngine, ARSession> = new WeakMap();
    private engine: WonderlandEngine;

    /**
     * tracking provider is basically a lib which has some tracking capabilities, so device native webXR, 8th Wall, mind-ar-js, etc
     */
    private _trackingProviders: Array<ARProvider> = [];

    /**
     * Current running provider when AR session is running
     */
    private _currentTrackingProvider: ARProvider | null = null;

    public readonly onARSessionReady: RetainEmitter = new RetainEmitter();

    public readonly onSessionStart: Emitter<[trackingProvider: ARProvider]> = new Emitter();

    public readonly onSessionEnd: Emitter<[trackingProvider: ARProvider]> = new Emitter();

    private _sceneHasLoaded = false;
    private _arSessionIsReady = false;

    /**
     * @returns a shallow copy of all registered providers
     */
    public get registeredProviders(): ReadonlyArray<ARProvider> {
        return [...this._trackingProviders];
    }

    public static getSessionForEngine(engine: WonderlandEngine) {
        if (!this.engines.has(engine)) {
            this.engines.set(engine, new ARSession(engine));
        }
        return this.engines.get(engine)!;
    }

    private constructor(engine: WonderlandEngine) {
        this.engine = engine;
    }

    /**
     * Registers tracking provider. Makes sure it is loaded
     * and hooks into providers onSessionStart, onSessionLoaded events.
     */
    public async registerTrackingProvider(provider: ARProvider) {
        if (this._trackingProviders.includes(provider)) {
            return;
        }

        if (!this.engine.onSceneLoaded.has(this.onWLSceneLoaded)) {
            this.engine.onSceneLoaded.add(this.onWLSceneLoaded);
        }

        this._trackingProviders.push(provider);

        provider.onSessionStart.add(this.onProviderSessionStart);
        provider.onSessionEnd.add(this.onProviderSessionEnd);

        await provider.load();
        this.checkProviderLoadProgress();
    }

    /**
     * Loops through all providers to check if they are loaded.
     * If that's the case and the WL scene itself is loaded -
     * notify all the subscribers about the `onARSessionReady`
     */
    private checkProviderLoadProgress = () => {
        // prevent from calling onARSessionReady twice

        if (this._arSessionIsReady === true) {
            return;
        }

        if (
            this._trackingProviders.every((p) => p.loaded === true) &&
            this._sceneHasLoaded
        ) {
            this._arSessionIsReady = true;
            this.onARSessionReady.notify();
        }
    };

    private onWLSceneLoaded = () => {
        this._sceneHasLoaded = true;
        this.checkProviderLoadProgress();
    };

    /**
     * stops a running AR session (if any)
     */
    public stopARSession() {
        if (this._currentTrackingProvider === null) {
            console.warn('No tracking session is active, nothing will happen');
        }

        this._currentTrackingProvider?.endSession();
        this._currentTrackingProvider = null;
    }

    /**
     * Some AR provider started AR session
     * @param provider to be passed into onSessionStart callback function
     */
    private onProviderSessionStart = (provider: ARProvider) => {
        this._currentTrackingProvider = provider;
        this.onSessionStart.notify(provider);
    };

    /**
     * Some AR ended AR session
     * @param provider to be passed into onSessionEnd callback function
     */
    private onProviderSessionEnd = (provider: ARProvider) => {
        this.onSessionEnd.notify(provider);
    };
}

// (window as any).ARSession = ARSession;
export {ARSession};
