import {WonderlandEngine} from '@wonderlandengine/api';
import {ARProvider} from '../../AR-provider.js';

/**
 * ARProvider implementation for device native webXR API
 */
class WebXRProvider extends ARProvider {
    private _xrSession: XRSession | null = null;
    public get xrSession() {
        return this._xrSession;
    }

    /**
     * We override the parent ARProvider engine setter
     * since we want to listen to native WLE engine.onXRSessionStart
     * and engine.onXRSessionEnd callbacks.
     */
    public override set engine(engine: WonderlandEngine) {
        super.engine = engine;

        engine.onXRSessionStart.push((session: XRSession) => {
            this._xrSession = session;
            this.onSessionStarted.notify(this);
        });

        engine.onXRSessionEnd.push(() => {
            this.onSessionEnded.notify(this);
        });
    }

    /**
     * We don't want the user to manually instantiate the WebXRProvider.
     * The instance WebXRProvider is created at the bottom of this file once
     * and if we detect that someone is trying to create a second instance of WebXRProvider - we throw an error
     */
    private _instance: WebXRProvider | null = null;

    constructor() {
        super();

        // Safeguard that we are not running inside the editor
        if (typeof document === 'undefined') {
            return;
        }

        if (this._instance !== null) {
            throw 'WebXRProvider cannot be instantiated';
        }

        this._instance = this;
    }

    public async startSession(
        webxrRequiredFeatures: string[] = ['local'],
        webxrOptionalFeatures: string[] = ['local', 'hit-test']
    ) {
        this._engine.requestXRSession(
            'immersive-ar',
            webxrRequiredFeatures,
            webxrOptionalFeatures
        );
    }

    public async endSession() {
        if (this._xrSession) {
            try {
                await this._xrSession.end();
            } catch {
                // Session was ended for some
            }

            this._xrSession = null;
        }
    }

    public async load() {
        this.loaded = true;
        return Promise.resolve();
    }
}
const webXRProvider = new WebXRProvider();
export {WebXRProvider, webXRProvider};
