import { ARProvider } from "../../AR-provider";

class WebXRProvider extends ARProvider {

  public get tag() {
    return "webXR";
  }

  private xrSession: XRSession | null = null;

  // Enforce the singleton pattern
  private instance: WebXRProvider | null = null;

  constructor() {
    super();

    // Safeguard that we are not running inside the editor
    if (typeof (document) === 'undefined') {
      return;
    }

    if(this.instance !== null) {
      throw "WebXRProvider cannot be instantiated";
    }

    this.instance = this;

    WL.onXRSessionStart.push((session: XRSession) => {
      this.xrSession = session;
      console.log("Session starterd in webAR", this.onSessionStarted);
      this.onSessionStarted.forEach(cb => cb(this));
    });

    WL.onXRSessionEnd.push(() => {
      this.onSessionEnded.forEach(cb => cb(this));
      this.xrSession = null;
    });
  }

  public async startSession(params: string[] = ['local', 'hand-tracking', 'hit-test',]) {
    console.log("Starting session webAR");
    Module['webxr_request_session_func']('immersive-ar', ['local',], params);
  }

  public async endSession() {
    if (this.xrSession) {
      this.xrSession.end();
    }
  }

  public async load() {
    this.loaded = true;
    return Promise.resolve();
  }
}
const webXRProvider = new WebXRProvider();
export { WebXRProvider, webXRProvider }