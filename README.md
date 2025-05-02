# Wonderland Engine AR Tracking

Integration of various AR tracking frameworks into Wonderland Engine.

The following libraries and tracking methods are supported:

- WebXR Device API: SLAM tracking.
- 8th Wall: SLAM tracking, image tracking, face tracking, VPS.

## Examples

Their code can be found under `/examples`.

### SLAM (World Tracking)

Runs an AR session using WebXR Device API where available with a fallback to 8th Wall
implementation.

<img width="288" src="examples/SLAM-camera/previews/SLAM-example.webp?raw=true" alt="SLAM tracking" />

---

### Image Tracking

<img width="288" src="examples/image-tracking/previews/image-target.webp?raw=true" alt="Simple Image target" />
<img width="288" src="examples/image-tracking/previews/flat-image-physical-size.webp?raw=true" alt="Physically correct image size" />
<img width="288" src="examples/image-tracking/previews/curved-image-target-video.webp?raw=true" alt="Curved image target with video" />

---

### Face Tracking

Allows tracking a face and attaching objects to different attachment points.

<img width="288"  src="examples/face-tracking/previews/face-tracking.webp?raw=true" alt="Face target" />

---

### 8th Wall VPS

VPS (Visual Positioning System) allows tracking a world mesh for a scanned location.

<img width="288"  src="examples/vps/previews/dynamic-mesh.webp?raw=true" alt="VPS Dynamically generated mesh" />

---

## Table of Contents

- [Setting Up](#setting-up)
- [Structure](#structure)
- [Examples](#examples)
    - [SLAM (World Tracking)](#slam-world-tracking)
    - [Image Tracking](#image-tracking)
    - [Face Tracking](#face-tracking)
    - [8th Wall VPS](#8th-wall-vps)

## Setting Up

1. Create a new Wonderland Engine AR project and package.

2. To install the framework and the WebXR Device API and 8thwall providers, use the following command in the project's root:

```sh
npm i --save @wonderlandengine/ar-tracking @wonderlandengine/ar-provider-webxr @wonderlandengine/ar-provider-8thwall
```

3. Add the following snippets into your entrypoint (usually `index.js`):

```js
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import {ARSession} from '@wonderlandengine/ar-tracking';
import {WebXRProvider} from '@wonderlandengine/ar-provider-webxr';
import {XR8Provider} from '@wonderlandengine/ar-provider-8thwall';

// ...
/* wle:auto-constants:end */

const arSession = ARSession.getSessionForEngine(engine);
WebXRProvider.registerTrackingProviderWithARSession(arSession, {optionalFeatures: [...], requiredFeatures: [...]});
XR8Provider.registerTrackingProviderWithARSession(arSession, {apiToken: /* ApiToken8THWall */});

/* wle:auto-register:start */
// ...
```

4. In case you are building a VPS experience, make sure to set
   `Project Settings > Editor > serverCOEP` to `unsafe-none`.

5. Make sure you are running on HTTPS (8th Wall requires it even on localhost!): Go to
   `Views > Preferences > Server` and "Generate Certificates", then check the SSL checkbox.

## API Overview

### ARSession

- Manages all AR sessions.
- Registers dependencies (i.e., providers)
- Handles global callbacks when AR sessions are started or ended

### ARProvider

AR provider is an abstract class that is extended by specialized AR framework providers.
The implementing providers should handle the loading, configuring and starting/stopping some tracking implementation.

E.g., `src/components/AR/frameworks/xr8/xr8-provider.ts` loads, configures and checks the required permissions for the 8th Wall library.

To integrate a new AR tracking framework, extend with a custom provider like so:

```ts
import {ARProvider} from '@wonderlandengine/ar-tracking';

export class CustomProvider extends ARProvider {
    async load() {
        // Make sure we're not in the editor
        if (!window.document) return;

        /* Load the AR tracking library and notify AR-Session when it's loaded.
         * You might want to take extra steps before calling resolve. For example tell the loaded library
         * what's your <canvas> element. */
        return new Promise<void>((resolve, _reject) => {
            const s = document.createElement('script');
            s.crossOrigin = 'anonymous';
            s.src = 'URL-TO-THE-TRACKING-LIBRARY.js';
            s.addEventListener('load', resolve);
        });
    }
}
```

### TrackingMode

Tracking modes hold the configuration and logic for how to handle the data coming from
the ARProvider for a specific type of tracking (World Tracking, Face Tracking, Image Tracking).

E.g, 8th Wall AR-provider may provide only camera pose if the tracking mode is
`world-tracking` and extra pose for a tracked if tracking mode is `face-tracking`.
Tracking modes are set by `AR-camera` and modify the camera's pose when ever a new
pose is resolved by the AR-provider.

### ARCamera

Base class for all AR cameras.

### src/components/AR/

Contains all supported AR camera components.

Should be attached to the main view (default view is `root/Player/NonVrCamera`).

There may be multiple cameras attached to the main view, but only one AR-Camera should
be active at any given time. Otherwise multiple active AR-cameras will start fighting
for setting the pose of the main view.

Usually we keep the code of AR-camera as short as possible and let other components
listed to camera's events:

```ts
export class FaceMaskExample extends Component {
    static TypeName = 'face-mask-example';

    /** The ARFaceTrackingCamera somewhere in the scene */
    @property.object()
    ARFaceTrackingCamera!: WLEObject;

    start() {
        camera.onFaceUpdate.add((event) => {
            const {transform} = event.detail;
        });
    }
}
```

