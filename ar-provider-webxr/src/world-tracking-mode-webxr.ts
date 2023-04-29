import {TrackingMode} from '@wonderlandengine/ar-tracking';

/**
 * Implementation of SLAM (World Tracking) based on the WebXR Device API
 *
 * Depends on WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES global variables.
 *
 * TODO: change this when it's moved to auto constants.
 */
export class WorldTracking_WebXR extends TrackingMode {
    startSession() {
        this.provider.startSession(
            window.WEBXR_REQUIRED_FEATURES,
            window.WEBXR_OPTIONAL_FEATURES
        );
    }

    endSession(): void {
        this.provider.endSession();
    }
}
