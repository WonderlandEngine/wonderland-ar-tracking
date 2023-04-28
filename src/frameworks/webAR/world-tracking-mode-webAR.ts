import {TrackingMode} from '../trackingMode.js';

/**
 * device native webXR API implementation that encapsulates
 * - SLAM tracking
 *
 * Depends on WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES global variables.
 *
 * TODO: change this when it's moved to auto constants.
 */
class WorldTracking_WebAR extends TrackingMode {
    public startSession() {
        this.provider.startSession(window.WEBXR_REQUIRED_FEATURES, window.WEBXR_OPTIONAL_FEATURES);
    }

    public endSession(): void {
        this.provider.endSession();
    }
}

export {WorldTracking_WebAR};
