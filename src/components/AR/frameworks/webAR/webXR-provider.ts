import {ARProvider} from '../../AR-provider.js';

class WebXRProvider extends ARProvider {
    private _xrSession: XRSession | null = null;
    public get xrSession() {
        return this._xrSession;
    }

    // Enforce the singleton pattern
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

        WL.onXRSessionStart.push((session: XRSession) => {
            this._xrSession = session;
            this.onSessionStarted.forEach((cb) => cb(this));
        });

        WL.onXRSessionEnd.push(() => {
            this.onSessionEnded.forEach((cb) => cb(this));
        });
    }

    public async startSession(
        webxrRequiredFeatures: string[] = ['local'],
        webxrOptionalFeatures: string[] = ['local', 'hit-test']
    ) {
        WL.requestXRSession('immersive-ar', webxrRequiredFeatures, webxrOptionalFeatures);
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
