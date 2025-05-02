import {Emitter, RetainEmitter, WonderlandEngine, Component} from '@wonderlandengine/api';
import {ARProvider} from './AR-provider.js';
import {ITrackingMode} from './tracking-mode.js';
import {TrackingType} from './tracking-type.js';

/**
 * ARSession
 *
 * - Manages all AR sessions.
 * - Registers dependencies (i.e., providers)
 * - Handles global callbacks when AR sessions are started or ended
 */
export class ARSession {
    private static engines: WeakMap<WonderlandEngine, ARSession> = new WeakMap();

    /** A tracking provider is a library that provides tracking capabilities, e.g.,
     * WebXR Device API, 8th Wall, mind-ar-js, etc.
     */
    private _trackingProviders: Array<ARProvider> = [];

    /** Current running provider when AR session is running */
    private _currentTrackingProvider: ARProvider | null = null;

    /** Emits and event when the AR session is ready */
    readonly onARSessionReady: RetainEmitter = new RetainEmitter();

    /** Emits and event when an AR session was started */
    readonly onSessionStart: RetainEmitter<[trackingProvider: ARProvider]> =
        new RetainEmitter();

    /** Emits and event when an AR session was ended */
    readonly onSessionEnd: Emitter<[trackingProvider: ARProvider]> = new Emitter();

    private _engine: WonderlandEngine;
    private _sceneHasLoaded = false;
    private _arSessionIsReady = false;

    /** Wonderland Engine instance this AR session is running on */
    get engine() {
        return this._engine;
    }

    /**
     * @returns a shallow copy of all registered providers
     */
    get registeredProviders(): ReadonlyArray<ARProvider> {
        return [...this._trackingProviders];
    }

    /**
     * Retrieve tracking implementation for given type.
     *
     * @returns The tracking instance or `null` if no provider was
     *     able to provide given tracking type
     */
    getTrackingProvider(type: TrackingType, component: Component): ITrackingMode {
        for (const p of this._trackingProviders) {
            if (p.supports(type)) return p.createTracking(type, component);
        }

        throw new Error('No AR provider found for tracking type ' + type);
    }

    /** Get registered {@link ARProvider} based on {@link ARProvider#name}. */
    getARProviderByName(name: string): ARProvider | null {
        for (const p of this._trackingProviders) {
            if (p.name === name) return p;
        }

        return null;
    }

    /**
     * Get or create an AR session attached to given engine
     *
     * @param engine The engine to retrieve the AR session for.
     * @returns The current AR session, or creates one if none exists.
     */
    static getSessionForEngine(engine: WonderlandEngine) {
        if (!this.engines.has(engine)) {
            this.engines.set(engine, new ARSession(engine));
        }
        return this.engines.get(engine)!;
    }

    /* Private, as ARSession instances should be created with getSessionForEngine */
    private constructor(engine: WonderlandEngine) {
        this._engine = engine;
    }

    /**
     * Registers tracking provider.
     *
     * Makes sure it is loaded and hooks into providers onSessionStart,
     * onSessionLoaded events.
     */
    async registerTrackingProvider(provider: ARProvider) {
        if (this._trackingProviders.includes(provider)) {
            return;
        }

        if (!this._engine.onSceneLoaded.has(this.onWLSceneLoaded)) {
            this._engine.onSceneLoaded.add(this.onWLSceneLoaded);
        }

        this._trackingProviders.push(provider);

        provider.onSessionStart.add(this.onProviderSessionStart);
        provider.onSessionEnd.add(this.onProviderSessionEnd);

        await provider.load();
        this.checkProviderLoadProgress();
    }

    /* Loop through all providers to check if they are loaded.
     * If that's the case and the WL scene itself is loaded -
     * notify all the subscribers about the `onARSessionReady` */
    private checkProviderLoadProgress = () => {
        // Avoid calling onARSessionReady twice
        if (this._arSessionIsReady === true) return;

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

    /** Stop a running AR session (if any) */
    stopARSession() {
        if (this._currentTrackingProvider === null) {
            console.warn('No tracking session is active, nothing will happen');
        }

        this._currentTrackingProvider?.endSession();
        this._currentTrackingProvider = null;
    }

    /* Called by AR providers when they started an AR session.
     * @param provider The provider to pass to onSessionStart */
    private onProviderSessionStart = (provider: ARProvider) => {
        this._currentTrackingProvider = provider;
        this.onSessionStart.notify(provider);
    };

    /**
    /* Called by AR providers when they ended an AR session.
     * @param provider The provider to pass to onSessionEnd */
    private onProviderSessionEnd = (provider: ARProvider) => {
        this.onSessionStart.reset();
        this.onSessionEnd.notify(provider);
    };
}
