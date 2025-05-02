import {TrackingMode} from '@wonderlandengine/ar-tracking';
import {WebXRConfig, WebXRProvider} from './webxr-provider.js';
import {Component} from '@wonderlandengine/api';

/**
 * Implementation of SLAM (World Tracking) based on the WebXR Device API
 *
 * Depends on WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES global variables.
 *
 * TODO: change this when it's moved to auto constants.
 */
export class WorldTracking_WebXR extends TrackingMode {
    private _config: WebXRConfig;

    constructor(provider: WebXRProvider, component: Component, config: WebXRConfig) {
        super(provider, component);
        this._config = config;
    }

    startSession() {
        this.provider.startSession(
            this._config.requiredFeatures,
            this._config.optionalFeatures
        );
    }

    endSession(): void {
        this.provider.endSession();
    }
}
