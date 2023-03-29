import {TrackingMode} from '../trackingMode.js';
import {webXRProvider} from './webXR-provider.js';

/**
 * device native webXR API implementation that encapsulates
 * - SLAM tracking
 *
 * Depends on WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES global variables.
 *
 * TODO: change this when it's moved to auto constants.
 */
class WorldTracking_webAR extends TrackingMode {
    public startSession() {
        webXRProvider.startSession(WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES);
    }

    public endSession(): void {
        webXRProvider.endSession();
    }
}

export {WorldTracking_webAR};
