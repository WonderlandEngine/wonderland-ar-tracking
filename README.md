# General AR system which currently support 8th Wall tracking and webXR device API

-   Currently supported webXR features - SLAM tracking.
-   Currently supported 8th Wall features - SLAM tracking, image tracking, face tracking, VPS.

## Setting up
- Create a WLP AR project and build it.
- Run `npm i @wonderlandengine/8thwall-tracking`.
- Open the file configured in editor `Project Settings -> JavaScript -> entryPoint`
- Copy those lines after the `/* wle:auto-constants:end */` line:
```
window.API_TOKEN_XR8 = ApiToken8THWall;
window.WEBXR_REQUIRED_FEATURES = WebXRRequiredFeatures;
window.WEBXR_OPTIONAL_FEATURES = WebXROptionalFeatures;
```
- In case you are building a VPS experience, make sure you clear the editor `Project Settings -> Editor-> serverCOEP` field.

- Make sure you are running on HTTPS (event on localhost)
## Structure

### **`src/AR-session.ts`**

-   master control for the AR session.
-   registers dependencies (aka providers)
-   handles global callbacks when AR session is started, ended

```ts
class ARSLAMCamera extends ARCamera {
    public static TypeName = 'AR-SLAM-camera';

    private _trackingImpl!: ITrackingMode;

    public override init = () => {
        /**
         * check if the device supports webXR
         * if it does - use webXRProvider
         */
        if (this.engine.arSupported) {
            ARSession.registerTrackingProvider(this.engine, webXRProvider);
            this._trackingImpl = new WorldTracking_WebAR(this);
        } else {
            ARSession.registerTrackingProvider(this.engine, xr8Provider);
            this._trackingImpl = new WorldTracking_XR8(this);
        }

        /**
         * Listen to when all providers are loaded and ready to be used
         **/
        ARSession.getSessionForEngine(this.engine).onARSessionReady.add(() => {});

        /**
         * Listen to when any tracking provider started a tracking session
         **/
        ARSession.getSessionForEngine(this.engine).onSessionStart.add((trackingProvider: ARProvider) => {});

        /**
         * Listen to when running tracking provider ended a tracking session
         **/
        ARSession.getSessionForEngine(this.engine).onSessionEnd.add((trackingProvider: ARProvider) => {});
    };

    /**
     *  Start AR session manually, for example on button click
     */
    startSession() {
        if (this.active) {
            this._trackingImpl!.startSession();
        }
    }

    /**
     *  Stop any running tracking provider
     */
    endSession() {
        if (this.active) {
            this._trackingImpl!.endSession();
        }
    }
}
```

### **`src/AR-provider`**

AR provider should handle the loading, configuring and starting/stopping some tracking implementation.
For example src/components/AR/frameworks/xr8/xr8-provider.ts loads, configures and checks the required permissions for the 8th Wall library.

```ts
class CustomProvider extends ARProvider {

    public async load() {
        // Make sure we're no in the editor
        if (!window.document) {
            return;
        }

        /**
         * Load the AR tracking library and notify AR-Session when it's loaded.
         * You might want to take extra steps before calling resolve. For example tell the loaded library
         * what's your <canvas> element.
         */
        return new Promise<void>((resolve, _reject) => {
            const s = document.createElement('script');
            s.crossOrigin = 'anonymous';
            s.src = 'URL-TO-THE-TRACKING-LIBRARY.js';
            s.addEventListener("load", resolve);
        });
}
```

### **`src/frameworks/trackingMode.ts`**

Tracking modes holds the configuration and logic how to handle the data coming from the AR-provider.
For example 8th Wall AR-provider can provide only camera pose if the tracking mode is `world-tracking` and extra pose for a tracked if tracking mode is `face-tracking`.
Tracking modes are set by `AR-camera` and are modifying camera's pose when ever a new pose is resolved by the AR-provider.

### **`src/components/cameras/AR-Camera`**

Base class for all AR-cameras.

### **`src/components/AR/cameras/*.*`**

All supported AR camera components. Should be attached to the main view (default view is `root/Player/NonVrCamera`).
There can be multiple cameras attached to the main view, but only one AR-Camera should be active at any given time. Otherwise multiple active AR-cameras will start fighting who sets the pose of the main view.
Usually we keep the code of AR-camera as short as possible and let other components listed to camera's events

```ts
export class FaceMaskExample extends Component {
    public static TypeName = 'face-mask-example';

    /**
     * The ARFaceTrackingCamera somewhere in the scene
     */
    @property.object()
    ARFaceTrackingCamera!: WLEObject;

    start() {
       camera.onFaceUpdate.add((event) => {
            const {transform} = event.detail;
       });
    }
}
```

## Examples

Can be found under `/examples`.
### SLAM (World tracking) camera demo. Runs an AR session using WebXR Device API where available with a fallback to 8th Wall implementation.
<img width="288" src="examples/SLAM-camera/previews/SLAM-example.webp?raw=true" alt="SLAM tracking" />

----
### Image target example
<img width="288" src="examples/image-tracking/previews/image-target.webp?raw=true" alt="Simple Image target" />
<img width="288" src="examples/image-tracking/previews/flat-image-physical-size.webp?raw=true" alt="Physically correct image size" />
<img width="288" src="examples/image-tracking/previews/curved-image-target-video.webp?raw=true" alt="Curved image target with video" />

----
### Face tracking example
<img width="288"  src="examples/face-tracking/previews/face-tracking.webp?raw=true" alt="Face target" />

----
### 8th Wall VPS (visual positioning system) camera demo
<img width="288"  src="examples/vps/previews/dynamic-mesh.webp?raw=true" alt="VPS Dynamically generated mesh" />

---

