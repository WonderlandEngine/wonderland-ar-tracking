/**
 * HitTestLocationXR8
 * Hit test location for XR8 implementation.
 * When 8th Wall SLAM tracking is active, checks where the ray going from camera
 * intersects with the imaginary XY plane.
 *
 * In case of intersection, positions the this.object at the intersection point
 */

import {Component, Object as WLEObject} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {vec3} from 'gl-matrix';
import {ARSession, ARProvider} from '@wonderlandengine/ar-tracking';
import {XR8Provider} from '@wonderlandengine/ar-provider-8thwall';

export class HitTestLocationXR8 extends Component {
    static TypeName = 'hit-test-location-xr8';

    /**
     * The ARSLAMCamera somewhere in the scene
     */
    @property.object()
    camera!: WLEObject;

    private _tracking = false;

    private _camForward = vec3.create();
    private _intersectionVec3 = vec3.create();
    private _tmpWorldPosition = vec3.create();

    init() {
        ARSession.getSessionForEngine(this.engine).onSessionStart.add(this.onSessionStart);
        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(this.onSessionEnd);
    }

    update() {
        if (this._tracking) {
            this.camera.getForwardWorld(this._camForward);
            /* Intersect with origin XY plane. We always intersect if camera facing downwards */
            if (this._camForward[1] < 0) {
                this.camera.getPositionWorld(this._tmpWorldPosition);
                const t = -this._tmpWorldPosition[1] / this._camForward[1];
                vec3.add(
                    this._intersectionVec3,
                    this._tmpWorldPosition,
                    vec3.scale(this._intersectionVec3, this._camForward, t)
                );
                this.object.setPositionWorld(this._intersectionVec3);
            }
        }
    }

    onSessionStart = (provider: ARProvider) => {
        if (provider instanceof XR8Provider) {
            this.object.setScalingWorld([1, 1, 1]);
            this._tracking = true;
        }
    };

    onSessionEnd = (provider: ARProvider) => {
        if (provider instanceof XR8Provider) {
            this._tracking = false;
            this.object.setScalingWorld([0, 0, 0]);
        }
    };
}
