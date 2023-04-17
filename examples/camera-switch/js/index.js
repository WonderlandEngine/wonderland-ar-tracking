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
import {ARFaceTrackingCamera} from '@wonderlandengine/8thwall-tracking';
import {ARImageTrackingCamera} from '@wonderlandengine/8thwall-tracking';
import {ARSLAMCamera} from '@wonderlandengine/8thwall-tracking';
import {XR8CameraSwitch} from './camera-switch-ui.js';
import {FaceAttachmentPointExample} from './face-attachment-point-example.js';
import {ImageTrackingExample} from './image-tracker.js';
import {SlamTrackingExample} from './slam-tracking-example.js';
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import * as API from '@wonderlandengine/api'; // Deprecated: Backward compatibility.

/* wle:auto-constants:start */
const ProjectName = 'CameraSwitch';
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
        //arButton.addEventListener('click', () => requestSession('immersive-ar'));
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
engine.registerComponent(ARFaceTrackingCamera);
engine.registerComponent(ARImageTrackingCamera);
engine.registerComponent(ARSLAMCamera);
engine.registerComponent(XR8CameraSwitch);
engine.registerComponent(FaceAttachmentPointExample);
engine.registerComponent(ImageTrackingExample);
engine.registerComponent(SlamTrackingExample);
/* wle:auto-register:end */

engine.scene.load(`${ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
