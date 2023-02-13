import {TrackingMode} from '../trackingMode';
import WebXRProvider from './webXR-provider';


class WorldTracking_webAR extends TrackingMode {
  public startSession() {
    WebXRProvider.startSession(['local', 'hand-tracking', 'hit-test',]);
  }

  public endSession(): void {
    WebXRProvider.endSession();
  }
}

export default WorldTracking_webAR;