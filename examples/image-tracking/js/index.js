/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 *     - `wle:auto-constants:start` and `wle:auto-constants:end`: The project's constants,
 *        such as the project's name, whether it should use the physx runtime, etc...
 *     - `wle:auto-benchmark:start` and `wle:auto-benchmark:end`: Append the benchmarking code
 */

/* wle:auto-imports:start */
import {ARImageTrackingCamera} from '@wonderlandengine/8thwall-tracking';
import {VideoTexture} from '@wonderlandengine/components';
import {ButtonEndARSession} from './../../common-components/button-end-ar-session.js';
import {ButtonStartARSession} from './../../common-components/button-start-ar-session.js';
import {ImageTrackingExample} from './image-tracker.js';
import {PhysicalSizeImageTarget} from './physical-size-image-target.js';
import {VideoTextureImageTarget} from './video-texture-image-target.js';
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import * as API from '@wonderlandengine/api'; // Deprecated: Backward compatibility.

/* wle:auto-constants:start */
const ProjectName = 'ImageTracking';
const RuntimeBaseName = 'WonderlandRuntime';
const WithPhysX = false;
const WithLoader = false;
const WebXRFramebufferScaleFactor = 1;
const WebXRRequiredFeatures = ['local',];
const WebXROptionalFeatures = ['local','hand-tracking','hit-test',];
const ApiToken8THWall = 'sU7eX52Oe2ZL8qUKBWD5naUlu1ZrnuRrtM1pQ7ukMz8rkOEG8mb63YlYTuiOrsQZTiXKRe';
/* wle:auto-constants:end */

window.API_TOKEN_XR8 = ApiToken8THWall;
window.WEBXR_REQUIRED_FEATURES = WebXRRequiredFeatures;
window.WEBXR_OPTIONAL_FEATURES = WebXROptionalFeatures;

const engine = await loadRuntime(RuntimeBaseName, {
    physx: WithPhysX,
    loader: WithLoader,
});
Object.assign(engine, API); // Deprecated: Backward compatibility.
window.WL = engine; // Deprecated: Backward compatibility.

engine.xrFramebufferScaleFactor = WebXRFramebufferScaleFactor;
engine.onSceneLoaded.once(() => {
    const el = document.getElementById('version');
    if (el) setTimeout(() => el.remove(), 2000);
});

/* WebXR setup. */

function requestSession(mode) {
    engine
        .requestXRSession(mode, WebXRRequiredFeatures, WebXROptionalFeatures)
        .catch((e) => console.error(e));
}

function setupButtonsXR() {
    /* Setup AR / VR buttons */
    const arButton = document.getElementById('ar-button');
    if (arButton) {
        arButton.dataset.supported = engine.arSupported;
        // arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }
    const vrButton = document.getElementById('vr-button');
    if (vrButton) {
        vrButton.dataset.supported = engine.vrSupported;
        vrButton.addEventListener('click', () => requestSession('immersive-vr'));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('load', setupButtonsXR);
} else {
    setupButtonsXR();
}

/* wle:auto-register:start */
engine.registerComponent(ARImageTrackingCamera);
engine.registerComponent(VideoTexture);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
engine.registerComponent(ImageTrackingExample);
engine.registerComponent(PhysicalSizeImageTarget);
engine.registerComponent(VideoTextureImageTarget);
/* wle:auto-register:end */

engine.scene.load(`${ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
