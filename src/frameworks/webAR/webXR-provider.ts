import {WonderlandEngine} from '@wonderlandengine/api';
import {ARProvider} from '../../AR-provider.js';
import {ARSession} from '../../AR-session.js';

/**
 * ARProvider implementation for device native webXR API
 */
class WebXRProvider extends ARProvider {
    private _xrSession: XRSession | null = null;
    public get xrSession() {
        return this._xrSession;
    }

    public static registerTrackingProviderWithARSession(engine: WonderlandEngine) {
        const provider = new WebXRProvider(engine);
        ARSession.getEngineSession(engine).registerTrackingProvider(provider);
        return provider;
    }

    private constructor(engine: WonderlandEngine) {
        super(engine);

        // Safeguard that we are not running inside the editor
        if (typeof document === 'undefined') {
            return;
        }

        engine.onXRSessionStart.add((session: XRSession) => {
            this._xrSession = session;
            this.onSessionStarted.notify(this);
        });

        engine.onXRSessionEnd.add(() => {
            this.onSessionEnded.notify(this);
        });
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

export {WebXRProvider};
