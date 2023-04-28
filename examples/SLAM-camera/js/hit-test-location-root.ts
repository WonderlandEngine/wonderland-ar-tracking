/**
 * Sets up a [WebXR Device API "Hit Test"](https://immersive-web.github.io/hit-test/)
 * and places the object to the hit location.
 *
 * Difference from the original 'hit-test-location' is that the reticle does not have to be a child of the camera.
 *
 * **Requirements:**
 *  - Specify `'hit-test'` in the required or optional features on the AR button in your html file.
 */

import {Component, Object as WLEObject} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession, WebXRProvider, ARProvider} from '@wonderlandengine/8thwall-tracking';

export class HitTestLocationRoot extends Component {
    public static TypeName = 'hit-test-location-root';

    /**
     * The ARSLAMCamera somewhere in the scene
     */
    @property.object()
    camera!: WLEObject;

    tempScaling = new Float32Array(3);
    private visible = false;

    private xrHitTestSource: XRHitTestSource | null = null;

    private tracking = false;
    init() {
        ARSession.getSessionForEngine(this.engine).onSessionStart.add(this.onSessionStart);
        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(this.onSessionEnd);
        this.tempScaling.set(this.object.getScalingLocal());
        this.object.setScalingLocal([0, 0, 0]);
    }

    update() {
        const wasVisible = this.visible;
        if (this.tracking && this.xrHitTestSource) {
            const frame = this.engine.xr?.frame;
            if (!frame) return;
            let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
            if (hitTestResults.length > 0) {
                let pose = hitTestResults[0].getPose(
                    this.engine.xr!.referenceSpaceForType('viewer')!
                );
                this.visible = !!pose;
                if (pose) {
                    const tw = this.camera.transformPointWorld(
                        new Array(3),
                        new Array(
                            pose.transform.position.x,
                            pose.transform.position.y,
                            pose.transform.position.z
                        )
                    );
                    this.object.setTranslationWorld(tw);
                }
            } else {
                this.visible = false;
            }
        }

        if (this.visible != wasVisible) {
            if (!this.visible) {
                this.tempScaling.set(this.object.getScalingLocal());
                this.object.setScalingLocal([0, 0, 0]);
            } else {
                this.object.setScalingLocal(this.tempScaling);
                this.object.setDirty();
            }
        }
    }

    onSessionStart = (provider: ARProvider) => {
        if (provider instanceof WebXRProvider) {
            this.tracking = true;
            const session = (provider as WebXRProvider).xrSession!;

            if (session.requestHitTestSource === undefined) {
                console.error(
                    'hit-test-location: hit test feature not available. Deactivating component.'
                );
                this.active = false;
                return;
            }

            const viewerSpace = this.engine.xr!.referenceSpaceForType('viewer')!;
            session!
                .requestHitTestSource({space: viewerSpace})!
                .then((hitTestSource) => {
                    this.xrHitTestSource = hitTestSource;
                })
                .catch(console.error);
        }
    };

    onSessionEnd = (provider: ARProvider) => {
        if (provider instanceof WebXRProvider) {
            this.tracking = false;

            this.object.setScalingLocal([0, 0, 0]);
            this.visible = false;

            if (!this.xrHitTestSource) return;

            this.xrHitTestSource.cancel();
            this.xrHitTestSource = null;
        }
    };
}
