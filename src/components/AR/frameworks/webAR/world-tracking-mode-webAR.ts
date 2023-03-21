import {TrackingMode} from '../trackingMode.js';
import {webXRProvider} from './webXR-provider.js';

class WorldTracking_webAR extends TrackingMode {
    public startSession() {
        webXRProvider.startSession(WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES);
    }

    public endSession(): void {
        webXRProvider.endSession();
    }
}

export {WorldTracking_webAR};
