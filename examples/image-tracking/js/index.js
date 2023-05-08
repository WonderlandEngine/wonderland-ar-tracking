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
import {ARImageTrackingCamera} from '@wonderlandengine/ar-tracking';
import {VideoTexture} from '@wonderlandengine/components';
import {ButtonEndARSession} from './button-end-ar-session.js';
import {ButtonStartARSession} from './button-start-ar-session.js';
import {ImageTrackingExample} from './image-tracker.js';
import {PhysicalSizeImageTarget} from './physical-size-image-target.js';
import {VideoTextureImageTarget} from './video-texture-image-target.js';
/* wle:auto-imports:end */

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
    ProjectName: 'ImageTracking',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local',],
    WebXROptionalFeatures: ['local','hand-tracking','hit-test',],
};
/* wle:auto-constants:end */

window.API_TOKEN_XR8 =
    'sU7eX52Oe2ZL8qUKBWD5naUlu1ZrnuRrtM1pQ7ukMz8rkOEG8mb63YlYTuiOrsQZTiXKRe';
window.WEBXR_REQUIRED_FEATURES = Constants.WebXRRequiredFeatures;
window.WEBXR_OPTIONAL_FEATURES = Constants.WebXROptionalFeatures;

const engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);

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
        // #ar-button display handled by the ARSession
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

const arSession = ARSession.getSessionForEngine(engine);
WebXRProvider.registerTrackingProviderWithARSession(arSession);
XR8Provider.registerTrackingProviderWithARSession(arSession);

/* wle:auto-register:start */
engine.registerComponent(ARImageTrackingCamera);
engine.registerComponent(VideoTexture);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
engine.registerComponent(ImageTrackingExample);
engine.registerComponent(PhysicalSizeImageTarget);
engine.registerComponent(VideoTextureImageTarget);
/* wle:auto-register:end */

engine.scene.load(`${Constants.ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
