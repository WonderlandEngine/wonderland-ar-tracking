import {WonderlandEngine} from '@wonderlandengine/api';
import {ARProvider} from './AR-provider.js';

/**
 * ARSession - master control for the AR session.
 * - loads dependencies (aka providers)
 * - handles global callbacks when AR session is started, ended
 * - can end any running AR session.
 */
abstract class ARSession {
    /**
     * tracking provider is basically a lib which has some tracking capabilities, so device native webXR, 8th Wall, mind-ar-js, etc
     */

    private static _trackingProviders: Array<ARProvider> = [];

    /**
     * Current running provider when AR session is running
     */
    private static _currentTrackingProvider: ARProvider | null = null;

    public static readonly onARSessionReady: Array<() => void> = [];

    public static readonly onSessionStarted: Array<(trackingProvider: ARProvider) => void> =
        [];
    public static readonly onSessionEnded: Array<(trackingProvider: ARProvider) => void> =
        [];

    private static _sceneHasLoaded = false;
    private static _arSessionIsReady = false;

    public static get arSessionReady() {
        return this._arSessionIsReady;
    }

    /**
     * Registers tracking provider. Makes sure it is loaded
     * and hooks into providers onSessionStarted, onSessionLoaded events.
     */
    public static async registerTrackingProvider(
        engine: WonderlandEngine,
        provider: ARProvider
    ) {
        if (!engine.onSceneLoaded.includes(this.onWLSceneLoaded)) {
            engine.onSceneLoaded.push(this.onWLSceneLoaded);
        }

        if (this._trackingProviders.includes(provider)) {
            return;
        }

        this._trackingProviders.push(provider);
        provider.engine = engine;

        provider.onSessionStarted.push(this.onProviderSessionStarted);
        provider.onSessionEnded.push(this.onProviderSessionEnded);

        await provider.load();
        this.checkProviderLoadProgress();
    }

    /**
     * Loops through all providers to check if they are loaded.
     * If that's the case and the WL scene itself is loaded -
     * notify all the subscribers about the `onARSessionReady`
     */
    private static checkProviderLoadProgress = () => {
        // prevent from calling onARSessionReady twice
        if (this._arSessionIsReady === true) {
            return;
        }

        if (
            this._trackingProviders.every((p) => p.loaded === true) &&
            this._sceneHasLoaded
        ) {
            this._arSessionIsReady = true;
            this.onARSessionReady.forEach((cb) => cb());
        }
    };

    private static onWLSceneLoaded = () => {
        this._sceneHasLoaded = true;
        this.checkProviderLoadProgress();
    };

    /**
     * stops a running AR session (if any)
     */
    public static stopARSession() {
        if (this._currentTrackingProvider === null) {
            console.warn('No tracking session is active, nothing will happen');
        }

        this._currentTrackingProvider?.endSession();
        this._currentTrackingProvider = null;
    }

    /**
     * Some AR provider started AR session
     * @param provider to be passed into onSessionStarted callback function
     */
    private static onProviderSessionStarted = (provider: ARProvider) => {
        this._currentTrackingProvider = provider;
        this.onSessionStarted.forEach((cb) => cb(provider));
    };

    /**
     * Some AR ended AR session
     * @param provider to be passed into onSessionEnded callback function
     */
    private static onProviderSessionEnded = (provider: ARProvider) => {
        this.onSessionEnded.forEach((cb) => cb(provider));
    };
}

// (window as any).ARSession = ARSession;
export {ARSession};
