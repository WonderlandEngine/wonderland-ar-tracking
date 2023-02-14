import ARProvider from "../../AR-provider";

class WebXRProvider extends ARProvider {

  private xrSession: XRSession | null = null;

  constructor() {
    super();

    // Safeguard that we are not running inside the editor
    if(typeof(document) === 'undefined') {
      return;
    }
    
    WL.onXRSessionStart.push((session: XRSession) => {
      this.xrSession = session;
      this.onSessionStarted.forEach(cb => cb(this));
    });

    WL.onXRSessionEnd.push(() => {
      this.onSessionEnded.forEach(cb => cb(this));
      this.xrSession = null;
    });
  }
  
  public async startSession(params: string[] = ['local', 'hand-tracking', 'hit-test',]) {
    Module['webxr_request_session_func']('immersive-ar', ['local',], params);
  }

  public async endSession() {
    if(this.xrSession) {
      this.xrSession.end();
    }
  }

  public async load() {
    this.loaded = true;
    return Promise.resolve();
  }
}

export default new WebXRProvider();