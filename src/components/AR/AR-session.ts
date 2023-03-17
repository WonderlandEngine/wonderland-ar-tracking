import {ARProvider} from './AR-provider.js';

/**
 * ARSession - master control for the AR session.
 * - loads dependencies (aka providers)
 * - handles global callbacks when AR session is started, ended
 * - can end any running AR session.
 * - renders AR button when the scene is loaded
 *
 * TODO - refactor checkSceneLoadProgress whenever we can control when the WL.onSceneLoaded is fired.
 * Currently we listen to WL.onSceneLoaded AND to each registered provide's loading to decide when to show the AR button.
 * Instead, we want to show the engines native 'loading' screen until all the providers are loaded
 */
abstract class ARSession {
    // tracking provider is basically a lib which has some tracking capabilities, so device native webXR, 8th Wall, mind-ar-js, etc
    private static _trackingProviders: Array<ARProvider> = [];

    // current running provider
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

    static {
        if (window.document) {
            WL.onSceneLoaded.push(() => {
                this.onWLSceneLoaded();
            });
        }
    }
    /**
     * Registers tracking provider. Makes sure it is loaded
     * and hooks into providers onSessionStarted, onSessionLoaded events.
     */
    public static async registerTrackingProvider(provider: ARProvider) {
        if (this._trackingProviders.includes(provider)) {
            return;
        }
        this._trackingProviders.push(provider);

        provider.onSessionStarted.push(this.onProviderSessionStarted);
        provider.onSessionEnded.push(this.onProviderSessionEnded);

        await provider.load();
        this.checkProviderLoadProgress();
    }

    private static checkProviderLoadProgress = () => {
        // prevent from calling onARSessionReady twice
        if (this._arSessionIsReady === true) {
            return;
        }

        if (this._trackingProviders.every((p) => p.loaded === true) && this._sceneHasLoaded) {
            this._arSessionIsReady = true;
            this.onARSessionReady.forEach((cb) => cb());
        }
    };

    private static onWLSceneLoaded = () => {
        this._sceneHasLoaded = true;
        this.checkProviderLoadProgress();
    };

    // stops a running AR session (if any)
    public static stopARSession() {
        if (this._currentTrackingProvider === null) {
            console.warn('No tracking session is active, nothing will happen');
        }

        this._currentTrackingProvider?.endSession();
        this._currentTrackingProvider = null;
    }

    // some provider started AR session
    private static onProviderSessionStarted = (provider: ARProvider) => {
        this._currentTrackingProvider = provider;
        this.onSessionStarted.forEach((cb) => cb(provider));
    };

    // some provider ended AR session
    private static onProviderSessionEnded = (provider: ARProvider) => {
        this.onSessionEnded.forEach((cb) => cb(provider));
    };
}

// (window as any).ARSession = ARSession;
export {ARSession};
