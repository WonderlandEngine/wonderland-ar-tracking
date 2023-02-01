import {TrackingProvider} from '../trackingProvider';


class WorldTracking_webAR extends TrackingProvider {
  public startARSession() {
    Module['webxr_request_session_func']('immersive-ar', ['local',], ['local', 'hand-tracking', 'hit-test',])
  }

  public stopARSession(): void {
    // WL.xrSession.end();
    console.log("This should top AR session");
  }
}

export default WorldTracking_webAR;