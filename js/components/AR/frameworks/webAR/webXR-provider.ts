import ARProvider from "../../AR-provider";

class WebXRProvider extends ARProvider {

  private xrSession: XRSession | null = null;

  constructor() {
    super();

    WL.onXRSessionStart.push((session) => {
      console.log("webXR session started", session, this);
      this.xrSession = session;
      this.onSessionStarted.forEach(cb => cb(this));
    });

    WL.onXRSessionEnd.push(() => {
      console.log("webXR session ended");
      this.onSessionEnded.forEach(cb => cb(this));
    });
  }
  
  public async startSession(params: string[] = ['local', 'hand-tracking', 'hit-test',]) {
    console.log('Starting XR session with params', params);
    Module['webxr_request_session_func']('immersive-ar', ['local',], params);
  }

  public async endSession() {
    console.log('Stopping webXR session', this.xrSession);

    if(this.xrSession) {
      this.xrSession.end();
      this.xrSession = null;
    }
  }

  public async load() {
    this.loaded = true;
    return Promise.resolve();
  }
}

export default new WebXRProvider();