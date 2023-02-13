import ARProvider from "./AR-provider";

abstract class ARSession {

  public static readonly onARSessionRequested: Array<(event: Event) => void> = [];
  private static trackingProviders: Array<ARProvider> = [];
  private static currentTrackingProvider: ARProvider | null = null;

  public static readonly onSessionStarted: Array<(event: any) => void> = [];
  public static readonly onSessionEnded: Array<(event: any) => void> = [];

  public static async registerTrackingProvider(provider: ARProvider) {
    if (this.trackingProviders.includes(provider)) {
      return;
    }
    this.trackingProviders.push(provider);

    if (!WL.onSceneLoaded.includes(this.onWLSceneLoaded)) {
      WL.onSceneLoaded.push(this.checkSceneLoadProgress);
    }

    provider.onSessionStarted.push(this.onProviderSessionStarted);
    provider.onSessionEnded.push(this.onProviderSessionEnded);

    await provider.load();
    this.checkSceneLoadProgress();
  };

  private static checkSceneLoadProgress = () => {
    if (this.trackingProviders.every(p => p.loaded === true)) {
      this.onWLSceneLoaded();
    }
  }

  private static onWLSceneLoaded() {
    /*if (document.querySelector('#ar-button')) {
      return;
    }*/
    console.log('Scene is loaded');
    let xrButton = document.querySelector<HTMLElement>('#ar-button');
    if (xrButton === null) {
      console.error('No #ar-button found. Session will not start.');
      return;
    }

    xrButton.addEventListener('click', (event) => {
      this.requestARSession(event);
    });
  };

  private static requestARSession(event) {
    this.onARSessionRequested.forEach(cb => {
      cb(event);
    });
  }

  public static stopARSession() {
    if(this.currentTrackingProvider === null) {
      console.warn("No tracking session is active, nothing will happen");
    }

    this.currentTrackingProvider?.endSession();
    this.currentTrackingProvider = null;
  }

  private static onProviderSessionStarted = (provider: ARProvider) => {
    console.log("Provider session started");

    this.currentTrackingProvider = provider;

    let xrButton = document.querySelector<HTMLElement>('#ar-button');
    xrButton!.style.display = 'none';
    this.onSessionStarted.forEach(cb => cb(provider));
  }

  private static onProviderSessionEnded = (provider: ARProvider) => {
    console.log("Provider session ended");
    let xrButton = document.querySelector<HTMLElement>('#ar-button');
    xrButton!.style.display = 'block';
    this.onSessionEnded.forEach(cb => cb(provider));
  }
};

(window as any).ARSession = ARSession;
export default ARSession;