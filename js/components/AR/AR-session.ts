import ARProvider from "./AR-provider";

/**
 * ARSession - master control for the AR session.
 * - loads dependencies (aka providers)
 * - handles global callbacks when AR session is started, ended
 * - can end any running AR session.
 * - renders AR button when the scene is loaded 
 * 
 * TODO - refactor checkSceneLoadProgress whenever we can control when the WL.onSceneLoaded is fired.
 * Currently we listen to WL.onSceneLoaded AND to each registered provide's loading to decide when to show the AR button.
 * Instead, we want to show the engines native 'loading' screen until all the providers are loaded  
 */
abstract class ARSession {

  public static readonly onARSessionRequested: Array<() => void> = [];

  // tracking provider is basically a lib which has some tracking capabilities, so device native webXR, 8thwall, mind-ar-js, etc
  private static trackingProviders: Array<ARProvider> = [];

  // current running provider
  private static currentTrackingProvider: ARProvider | null = null;

  public static readonly onARSessionReady: Array<() => void> = [];

  public static readonly onSessionStarted: Array<(trackingProvider: ARProvider) => void> = [];
  public static readonly onSessionEnded: Array<(trackingProvider: any) => ARProvider> = [];

  /**
   * registers tracking provider. Makes sure it is loaded
   * and hooks into providers onSessionStarted, onSessionLoaded events.
   * 
   */
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


  // called after scene is loaded AND whenever each provider finished loading
  private static checkSceneLoadProgress = () => {
    if (this.trackingProviders.every(p => p.loaded === true)) {
      this.onWLSceneLoaded();
    }
  }

  // WL scene AND all registered providers finished loading
  private static onWLSceneLoaded() {
    /*if (document.querySelector('#ar-button')) {
      return;
    }*/
    /*let xrButton = document.querySelector<HTMLElement>('#ar-button');
    if (xrButton === null) {
      console.error('No #ar-button found. Session will not start.');
      return;
    }

    xrButton.addEventListener('click', (event) => {
      this.requestARSession();
    });*/

    this.onARSessionReady.forEach(cb => cb());
  };

  // AR button clicked, any AR-camera object might handle it
  /*private static requestARSession() {
    this.onARSessionRequested.forEach(cb => {
      cb();
    });
  }*/



  // stops a running AR session (if any)
  public static stopARSession() {
    if (this.currentTrackingProvider === null) {
      console.warn("No tracking session is active, nothing will happen");
    }

    this.currentTrackingProvider?.endSession();
    this.currentTrackingProvider = null;
  }

  // some provider started AR session
  private static onProviderSessionStarted = (provider: ARProvider) => {
    this.currentTrackingProvider = provider;

    let xrButton = document.querySelector<HTMLElement>('#ar-button');
    xrButton!.style.display = 'none';
    this.onSessionStarted.forEach(cb => cb(provider));
  }

  // some provider ended AR session
  private static onProviderSessionEnded = (provider: ARProvider) => {
    let xrButton = document.querySelector<HTMLElement>('#ar-button');
    xrButton!.style.display = 'block';
    this.onSessionEnded.forEach(cb => cb(provider));
  }
};

// (window as any).ARSession = ARSession;
export { ARSession };