/**
 * Sets up a [WebXR Device API "Hit Test"](https://immersive-web.github.io/hit-test/)
 * and places the object to the hit location.
 *
 * Difference from the original 'hit-test-location' is that the reticle does not have to be a child of the camera.
 *
 * **Requirements:**
 *  - Specify `'hit-test'` in the required or optional features on the AR button in your html file.
 */

import {Component, MeshComponent, Object as WLEObject} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession, ARProvider} from '@wonderlandengine/ar-tracking';
import {WebXRProvider} from '@wonderlandengine/ar-provider-webxr';

export class HitTestLocationRoot extends Component {
    static TypeName = 'hit-test-location-root';

    /**
     * The ARSLAMCamera somewhere in the scene
     */
    @property.object()
    camera!: WLEObject;

    private xrHitTestSource: XRHitTestSource | null = null;

    private mesh!: MeshComponent;
    start() {
        const arSession = ARSession.getSessionForEngine(this.engine);
        arSession.onSessionStart.add(this.onSessionStart);
        arSession.onSessionEnd.add(this.onSessionEnd);

        this.mesh = this.object.getComponent<MeshComponent>(MeshComponent)!;
        /**
         * Hide the mesh until the hitpoint is found
         */
        this.mesh.active = false;

        /** Stop update loop until the hitpoint is found */
        this.active = false;
    }

    update() {
        const frame = this.engine.xr?.frame;
        if (!frame) return;

        const hitTestResults = frame.getHitTestResults(this.xrHitTestSource!);
        if (hitTestResults.length > 0) {
            const pose = hitTestResults[0].getPose(
                this.engine.xr!.referenceSpaceForType('viewer')!
            );

            if (pose) {
                const tw = this.camera.transformPointWorld(new Array(3), [
                    pose.transform.position.x,
                    pose.transform.position.y,
                    pose.transform.position.z,
                ]);
                this.object.setPositionWorld(tw);
                this.mesh.active = true;
                return;
            }
        }

        /** No hitTest or no pose - disable the mesh */
        this.mesh.active = false;
    }

    onSessionStart = (provider: ARProvider) => {
        if (provider instanceof WebXRProvider) {
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
                    this.active = true;
                })
                .catch(console.error);
        }
    };

    onSessionEnd = (provider: ARProvider) => {
        if (provider instanceof WebXRProvider) {
            this.active = false;
            this.mesh.active = false;

            if (!this.xrHitTestSource) return;

            this.xrHitTestSource.cancel();
            this.xrHitTestSource = null;
        }
    };
}
