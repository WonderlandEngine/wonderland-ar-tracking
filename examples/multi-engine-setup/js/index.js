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
import {HitTestLocation} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {WasdControlsComponent} from '@wonderlandengine/components';
import {ButtonEndARSession} from './button-end-ar-session.js';
import {ButtonStartARSession} from './button-start-ar-session.js';
import {FaceAttachmentPointExample} from './face-attachment-point-example.js';
import {SpawnMeshOnSelect} from './spawn-mesh-on-select.js';
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import * as API from '@wonderlandengine/api'; // Deprecated: Backward compatibility.

/* wle:auto-constants:start */
const ProjectName = 'engine-1';
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
    canvas: 'canvas-2'
});
Object.assign(engine, API); // Deprecated: Backward compatibility.
window.WL = engine; // Deprecated: Backward compatibility.

engine.xrFramebufferScaleFactor = WebXRFramebufferScaleFactor;
engine.onSceneLoaded.once(() => {
    const el = document.getElementById('version-2');
    if (el) setTimeout(() => el.remove(), 2000);
});


const engine2 = await loadRuntime(RuntimeBaseName, {
    physx: WithPhysX,
    loader: WithLoader,
    canvas: 'canvas-3'
});

engine2.xrFramebufferScaleFactor = WebXRFramebufferScaleFactor;
engine2.onSceneLoaded.once(() => {
    const el = document.getElementById('version-3');
    if (el) setTimeout(() => el.remove(), 2000);
});


/* WebXR setup. */

function setupButtonsXR() {
    /* Setup AR / VR buttons */
    const arButton = document.getElementById('ar-button-2');
    if (arButton) {
        arButton.dataset.supported = engine.arSupported;
       // arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }

    const arButton2 = document.getElementById('ar-button-3');
    if (arButton2) {
        arButton2.dataset.supported = engine.arSupported;
       // arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('load', setupButtonsXR);
} else {
    setupButtonsXR();
}

/* wle:auto-register:start */
engine.registerComponent(ARFaceTrackingCamera);
engine.registerComponent(HitTestLocation);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(WasdControlsComponent);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
engine.registerComponent(FaceAttachmentPointExample);
engine.registerComponent(SpawnMeshOnSelect);
/* wle:auto-register:end */

engine.scene.load(`${ProjectName}.bin`);

engine2.registerComponent(ARFaceTrackingCamera);
engine2.registerComponent(HitTestLocation);
engine2.registerComponent(MouseLookComponent);
engine2.registerComponent(WasdControlsComponent);
engine2.registerComponent(ButtonEndARSession);
engine2.registerComponent(ButtonStartARSession);
engine2.registerComponent(FaceAttachmentPointExample);
engine2.registerComponent(SpawnMeshOnSelect);

engine2.scene.load(`${ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
