import {TrackingMode} from '../trackingMode';
import WebXRProvider from './webXR-provider';


class WorldTracking_webAR extends TrackingMode {
  public startSession() {
    console.log("Starting webXR world tracking");
    WebXRProvider.startSession(['local', 'hand-tracking', 'hit-test',]);
  }

  public endSession(): void {
    // WL.xrSession.end();
    console.log("stoping webXR world tracking");
    WebXRProvider.endSession();
  }
}

export default WorldTracking_webAR;