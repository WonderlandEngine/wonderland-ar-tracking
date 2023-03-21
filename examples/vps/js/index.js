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

import { loadRuntime } from '@wonderlandengine/api';
import * as API from '@wonderlandengine/api'; // Deprecated: Backward compatibility.

/* wle:auto-imports:start */
import {ARFaceTrackingCamera, ARImageTrackingCamera, ARSLAMCamera, ARVPSCamera, ARXR8SLAMCamera} from '@wonderlandengine/8thwall-tracking';
import {VPSExample} from './vps-example.ts';
import {VPSMeshExample} from './vps-mesh-example.ts';
import {ButtonEndARSession} from './../../common-components/button-end-ar-session.ts';
import {ButtonStartARSession} from './../../common-components/button-start-ar-session.ts';
/* wle:auto-imports:end */

/* wle:auto-constants:start */
const ProjectName = 'Vps';
const RuntimeBaseName = 'WonderlandRuntime';
const WithPhysX = false;
const WithLoader = false;
/* wle:auto-constants:end */

const engine = await loadRuntime(RuntimeBaseName, {
    physx: WithPhysX,
    loader: WithLoader
});
Object.assign(engine, API); // Deprecated: Backward compatibility.
window.WL = engine; // Deprecated: Backward compatibility.

engine.onSceneLoaded.push(() => {
    const el = document.getElementById('version');
    if (el) setTimeout(() => el.remove(), 2000);
});

const arButton = document.getElementById('ar-button');
if (arButton) {
    arButton.dataset.supported = engine.arSupported;
}
const vrButton = document.getElementById('vr-button');
if (vrButton) {
    vrButton.dataset.supported = engine.vrSupported;
}

/* wle:auto-register:start */
engine.registerComponent(ARFaceTrackingCamera, ARImageTrackingCamera, ARSLAMCamera, ARVPSCamera, ARXR8SLAMCamera);
engine.registerComponent(VPSExample);
engine.registerComponent(VPSMeshExample);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
/* wle:auto-register:end */

engine.scene.load(`${ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */

