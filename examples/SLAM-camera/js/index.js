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
import {SlamAnchorZappar as SlamAnchorZappar1} from './slam-anchor-zappar.js';
import {ARSLAMCamera} from '@wonderlandengine/ar-tracking';
import {ButtonEndARSession} from './button-end-ar-session.js';
import {ButtonStartARSession} from './button-start-ar-session.js';
import {HitTestLocationRoot} from './hit-test-location-root.js';
import {HitTestLocationXR8} from './hit-test-location-xr8.js';
import {SpawnMeshOnReticle} from './spawn-mesh-on-reticle.js';
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import {ARSession, ARCamera, TrackingType} from '@wonderlandengine/ar-tracking';
import {WebXRProvider} from '@wonderlandengine/ar-provider-webxr';
import {XR8Provider} from '@wonderlandengine/ar-provider-8thwall';
import {ZapparProvider} from '@wonderlandengine/ar-provider-zappar';

/* wle:auto-constants:start */
const Constants = {
    ProjectName: 'SLAMCamera',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local',],
    WebXROptionalFeatures: ['local','hit-test',],
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

window.API_TOKEN_XR8 =
    'sU7eX52Oe2ZL8qUKBWD5naUlu1ZrnuRrtM1pQ7ukMz8rkOEG8mb63YlYTuiOrsQZTiXKRe';
window.WEBXR_REQUIRED_FEATURES = Constants.WebXRRequiredFeatures;
window.WEBXR_OPTIONAL_FEATURES = Constants.WebXROptionalFeatures;

// Prefer configuring replay/patches from JS (not HTML). This keeps the example
// embeddable in other shells that don't use the exported index.html.
if (typeof window !== 'undefined') {
    if (!window.__ZAPPAR_SEQUENCE_URL__) {
        window.__ZAPPAR_SEQUENCE_URL__ = 'zappar-sequence.bin';
    }

    // Hardcode a 90° UV rotate fix for the video background shader.
    // This is intentionally string-based so it works without re-exporting the .bin.
    (function () {
        const patchProto = (proto) => {
            if (!proto || typeof proto.shaderSource !== 'function') return;
            const original = proto.shaderSource;
            proto.shaderSource = function (shader, source) {
                try {
                    if (typeof source === 'string' && source.includes('videoTexture')) {
                        source = source.replace(
                            /float\s+tRatio\s*=\s*float\s*\(\s*texSize\.x\s*\)\s*\/\s*float\s*\(\s*texSize\.y\s*\)\s*;/g,
                            'float tRatio = float(texSize.y)/float(texSize.x);'
                        );

                        if (!source.includes('uv = uv.yx')) {
                            source = source.replace(
                                /uv\.y\s*=\s*1\.0\s*-\s*uv\.y\s*;/g,
                                'uv = uv.yx;\n    uv.y = 1.0 - uv.y;'
                            );
                        }
                    }
                } catch {
                    /* never block shader compilation */
                }

                return original.call(this, shader, source);
            };
        };

        patchProto(
            typeof WebGL2RenderingContext !== 'undefined'
                ? WebGL2RenderingContext.prototype
                : null
        );
        patchProto(
            typeof WebGLRenderingContext !== 'undefined'
                ? WebGLRenderingContext.prototype
                : null
        );
    })();
}

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

    // #ar-button display handled by the ARSession

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
ZapparProvider.registerTrackingProviderWithARSession(arSession);
/*
if (engine.arSupported) {
    WebXRProvider.registerTrackingProviderWithARSession(arSession);
} else {
    ZapparProvider.registerTrackingProviderWithARSession(arSession);
}
*/

/*
 * If the preferred SLAM provider can run without an immersive WebXR session
 * (e.g. Zappar Instant World Tracking), auto-start and hide the AR button.
 */
arSession.onARSessionReady.add(() => {
    if (!arSession.supportsInstantTracking(TrackingType.SLAM)) return;

    const arButton = document.getElementById('ar-button');
    if (arButton) arButton.style.display = 'none';

    const startSlamCamera = () => {
        const view = engine.scene.activeViews[0];
        const components = view?.object?.getComponents?.() ?? [];
        for (const c of components) {
            if (c instanceof ARCamera) {
                c.startSession();
                return true;
            }
        }
        return false;
    };

    // Run now, then retry shortly after components have started.
    if (startSlamCamera()) return;
    setTimeout(startSlamCamera, 0);
    setTimeout(startSlamCamera, 250);
});

/* wle:auto-register:start */
engine.registerComponent(SlamAnchorZappar1);
engine.registerComponent(ARSLAMCamera);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
engine.registerComponent(HitTestLocationRoot);
engine.registerComponent(HitTestLocationXR8);
engine.registerComponent(SpawnMeshOnReticle);
/* wle:auto-register:end */

engine.scene.load(`${Constants.ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
