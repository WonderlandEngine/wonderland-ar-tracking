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
import {HitTestLocation} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {WasdControlsComponent} from '@wonderlandengine/components';
import {SpawnMeshOnSelect} from './spawn-mesh-on-select.js';
/* wle:auto-imports:end */

import {ARImageTrackingCamera} from '@wonderlandengine/ar-tracking';
import {ImageTrackingExample} from '../../image-tracking/js/image-tracker.js';
import {PhysicalSizeImageTarget} from '../../image-tracking/js/physical-size-image-target.js';
import {VideoTextureImageTarget} from '../../image-tracking/js/video-texture-image-target.js';
import {VideoTexture} from '@wonderlandengine/components';

import {loadRuntime} from '@wonderlandengine/api';
import {ARSession} from '@wonderlandengine/ar-tracking';
import {WebXRProvider} from '@wonderlandengine/ar-provider-webxr';
import {XR8Provider} from '@wonderlandengine/ar-provider-8thwall';

/* wle:auto-constants:start */
const RuntimeOptions = {
    physx: false,
    loader: false,
    xrFramebufferScaleFactor: 1,
    canvas: 'canvas',
};
const Constants = {
    ProjectName: 'MobileAr',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local',],
    WebXROptionalFeatures: ['local','hand-tracking','hit-test',],
};
/* wle:auto-constants:end */

window.API_TOKEN_XR8 =
    'sU7eX52Oe2ZL8qUKBWD5naUlu1ZrnuRrtM1pQ7ukMz8rkOEG8mb63YlYTuiOrsQZTiXKRe';
window.WEBXR_REQUIRED_FEATURES = Constants.WebXRRequiredFeatures;
window.WEBXR_OPTIONAL_FEATURES = Constants.WebXROptionalFeatures;

const engine = await loadRuntime(Constants.RuntimeBaseName, {
    ...RuntimeOptions,
    canvas: 'canvas-2',
});

engine.onSceneLoaded.once(() => {
    const el = document.getElementById('version-2');
    if (el) setTimeout(() => el.remove(), 2000);
});

const engine2 = await loadRuntime(Constants.RuntimeBaseName, {
    ...RuntimeOptions,
    canvas: 'canvas-3',
});

engine2.onSceneLoaded.once(() => {
    const el = document.getElementById('version-3');
    if (el) setTimeout(() => el.remove(), 2000);
});

const arSession = ARSession.getSessionForEngine(engine);
WebXRProvider.registerTrackingProviderWithARSession(arSession);
XR8Provider.registerTrackingProviderWithARSession(arSession);

/* wle:auto-register:start */
engine.registerComponent(HitTestLocation);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(WasdControlsComponent);
engine.registerComponent(SpawnMeshOnSelect);
/* wle:auto-register:end */

engine.scene.load(`${Constants.ProjectName}.bin`);

engine2.registerComponent(ARImageTrackingCamera);
engine2.registerComponent(VideoTexture);
engine2.registerComponent(ButtonEndARSession);
engine2.registerComponent(ButtonStartARSession);
engine2.registerComponent(ImageTrackingExample);
engine2.registerComponent(PhysicalSizeImageTarget);
engine2.registerComponent(VideoTextureImageTarget);

engine2.scene.load(`ImageTracking.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
