/**
 * Sets up a [WebXR Device API "Hit Test"](https://immersive-web.github.io/hit-test/)
 * and places the object to the hit location.
 *
 * Difference from the original 'hit-test-location' is that the reticle does not have to be a child of the camera.
 *
 * **Requirements:**
 *  - Specify `'hit-test'` in the required or optional features on the AR button in your html file.
 */

import {Component, Object as WLEObject, Type} from '@wonderlandengine/api';
import {ARSession, WebXRProvider, ARProvider} from '@wonderlandengine/8thwall-tracking';

export class HitTestLocationRoot extends Component {
    public static TypeName = 'hit-test-location-root';
    public static Properties = {
        camera: {type: Type.Object},
    };

    // injected by WLE
    camera!: WLEObject;

    private _tempScaling = new Float32Array(3);
    private _visible = false;

    private _xrViewerSpace: XRReferenceSpace | null = null;
    private _xrHitTestSource: XRHitTestSource | null = null;

    private _tracking = false;
    init() {
        ARSession.onSessionStarted.push(this.onSessionStarted);
        ARSession.onSessionEnded.push(this.onSessionEnded);
        this._tempScaling.set(this.object.scalingLocal);
        this._visible = false;
        this.object.scale([0, 0, 0]);
    }

    update() {
        if (this._tracking && this._xrViewerSpace) {
            const wasVisible = this._visible;
            if (this._xrHitTestSource) {
                const frame = this.engine.xrFrame;
                if (!frame) return;

                let hitTestResults = frame.getHitTestResults(this._xrHitTestSource);

                if (hitTestResults.length > 0) {
                    let pose = hitTestResults[0].getPose(this._xrViewerSpace);
                    this._visible = true;
                    if (pose) {
                        // this is good;
                        const tw = this.camera.transformPointWorld(
                            new Array(3),
                            new Array(
                                pose.transform.position.x,
                                pose.transform.position.y,
                                pose.transform.position.z
                            )
                        );
                        this.object.setTranslationWorld(tw);
                    } else {
                        this._visible = false;
                    }

                    // TODO: how do I get the world ROTATION
                } else {
                    this._visible = false;
                }
            }

            if (this._visible != wasVisible) {
                if (!this._visible) {
                    this._tempScaling.set(this.object.scalingLocal);
                    this.object.scale([0, 0, 0]);
                } else {
                    this.object.scalingLocal.set(this._tempScaling);
                    this.object.setDirty();
                }
            }
        }
    }

    onSessionStarted = (provider: ARProvider) => {
        if (provider instanceof WebXRProvider) {
            this._tracking = true;
            (provider as WebXRProvider)
                .xrSession!.requestReferenceSpace('viewer')
                .then((refSpace: XRReferenceSpace) => {
                    this._xrViewerSpace = refSpace;
                    (provider as WebXRProvider).xrSession!.requestHitTestSource!({
                        space: this._xrViewerSpace!,
                    })!.then((hitTestSource: XRHitTestSource) => {
                        this._xrHitTestSource = hitTestSource;
                    });
                });
        }
    };

    onSessionEnded = (provider: ARProvider) => {
        if (provider instanceof WebXRProvider) {
            this._tracking = false;

            this.object.scale([0, 0, 0]);
            this._visible = false;

            if (!this._xrHitTestSource) return;

            this._xrHitTestSource.cancel();
            this._xrHitTestSource = null;
            this._xrViewerSpace = null;
        }
    };
}
