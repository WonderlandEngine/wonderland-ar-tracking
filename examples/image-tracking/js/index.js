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
import {ButtonEndARSession} from './button-end-ar-session.js';
import {ButtonStartARSession} from './button-start-ar-session.js';
import {ImageTrackingExample} from './image-tracker.js';
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import {ARSession, TrackingType} from '@wonderlandengine/ar-tracking';
import {WebXRProvider} from '@wonderlandengine/ar-provider-webxr';
import {ZapparProvider} from '@wonderlandengine/ar-provider-zappar';

/* wle:auto-constants:start */
const Constants = {
    ProjectName: 'ImageTracking',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local'],
    WebXROptionalFeatures: ['local', 'hand-tracking', 'hit-test'],
};
const RuntimeOptions = {
    webgl2: true,
    webgpu: false,
    physx: false,
    loader: false,
    xrFramebufferScaleFactor: 1,
    loadUncompressedImagesAsBitmap: false,
    xrOfferSession: {
        mode: 'auto',
        features: Constants.WebXRRequiredFeatures,
        optionalFeatures: Constants.WebXROptionalFeatures,
    },
    canvas: 'canvas',
};
/* wle:auto-constants:end */

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

// Register Zappar as the image tracking provider.
// Note: image targets must be Zappar `.zpt` files served under `static/`.
// Set the `url` and `imageId` properties directly on scene tracker components
// (e.g. `image-tracking-example`, `physical-size-image-target-example`).
// Each component calls `camera.registerTarget(url, { name: imageId })` from
// its own `start()`, so no manual pre-registration is needed here.
ZapparProvider.registerTrackingProviderWithARSession(arSession);

/*
 * If image tracking can run without immersive WebXR (e.g. Zappar),
 * auto-start and hide the AR button.
 */
arSession.onARSessionReady.add(() => {
    if (!arSession.supportsInstantTracking(TrackingType.Image)) return;

    const arButton = document.getElementById('ar-button');
    if (arButton) arButton.style.display = 'none';

    const isCameraComponent = (component) => {
        return (
            component &&
            typeof component.startSession === 'function' &&
            typeof component.endSession === 'function'
        );
    };

    const startImageCamera = () => {
        const view = engine.scene.activeViews[0];
        const components = view?.object?.getComponents?.() ?? [];

        for (const component of components) {
            if (!isCameraComponent(component)) continue;
            if (
                component.type === 'ar-image-tracking-camera' ||
                component.constructor?.TypeName === 'ar-image-tracking-camera'
            ) {
                component.startSession();
                return true;
            }
        }

        for (const component of components) {
            if (!isCameraComponent(component)) continue;
            component.startSession();
            return true;
        }

        return false;
    };

    startImageCamera();
});

/* wle:auto-register:start */
engine.registerComponent(ARImageTrackingCamera);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
engine.registerComponent(ImageTrackingExample);
/* wle:auto-register:end */

engine.scene.load(`${Constants.ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
