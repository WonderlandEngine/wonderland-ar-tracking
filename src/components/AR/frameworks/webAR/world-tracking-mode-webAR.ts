import { TrackingMode } from '../trackingMode';
import { webXRProvider } from './webXR-provider';

class WorldTracking_webAR extends TrackingMode {
  public startSession() {
    webXRProvider.startSession(['local', 'hand-tracking', 'hit-test',]);
  }

  public endSession(): void {
    webXRProvider.endSession();
  }
}

export default WorldTracking_webAR;