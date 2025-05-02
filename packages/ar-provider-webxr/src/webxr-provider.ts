import {WonderlandEngine, Component} from '@wonderlandengine/api';
import {
    ARProvider,
    ARSession,
    ITrackingMode,
    TrackingType,
} from '@wonderlandengine/ar-tracking';
import {WorldTracking_WebXR} from './world-tracking-mode-webxr.js';

export interface WebXRConfig {
    requiredFeatures: string[];
    optionalFeatures: string[];
}

/**
 * ARProvider implementation for device native WebXR API
 */
export class WebXRProvider extends ARProvider {
    private _xrSession: XRSession | null = null;
    get xrSession() {
        return this._xrSession;
    }

    static Name = 'WebXR Device API';
    get name() {
        return WebXRProvider.Name;
    }

    private _config: WebXRConfig;

    static registerTrackingProviderWithARSession(
        arSession: ARSession,
        config: WebXRConfig
    ) {
        const provider = new WebXRProvider(arSession.engine, config);
        arSession.registerTrackingProvider(provider);
        return provider;
    }

    private constructor(engine: WonderlandEngine, config: WebXRConfig) {
        super(engine);

        this._config = config;

        // Safeguard that we are not running inside the editor
        if (typeof document === 'undefined') {
            return;
        }

        engine.onXRSessionStart.add((session: XRSession) => {
            this._xrSession = session;
            this.onSessionStart.notify(this);
        });

        engine.onXRSessionEnd.add(() => {
            this.onSessionEnd.notify(this);
        });
    }

    async startSession(
        webxrRequiredFeatures: string[] = ['local'],
        webxrOptionalFeatures: string[] = ['local', 'hit-test']
    ) {
        this._engine.requestXRSession(
            'immersive-ar',
            webxrRequiredFeatures,
            webxrOptionalFeatures
        );
    }

    async endSession() {
        if (this._xrSession) {
            try {
                await this._xrSession.end();
            } catch {
                // Session was ended for some
            }
            this._xrSession = null;
        }
    }

    async load() {
        this.loaded = true;
        return Promise.resolve();
    }

    /** Whether this provider supports given tracking type */
    supports(type: TrackingType): boolean {
        if (!this.engine.arSupported) return false;
        switch (type) {
            case TrackingType.SLAM:
                return true;
            default:
                return false;
        }
    }

    /** Create a tracking implementation */
    createTracking(type: TrackingType, component: Component): ITrackingMode {
        switch (type) {
            case TrackingType.SLAM:
                return new WorldTracking_WebXR(this, component, this._config);
            default:
                throw new Error('Tracking mode ' + type + ' not supported.');
        }
    }
}
