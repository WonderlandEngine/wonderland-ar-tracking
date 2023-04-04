/**
 * HitTestLocationXR8
 * Hit test location for XR8 implementation.
 * When 8th Wall SLAM tracking is active, checks where the ray going from camera
 * intersects with the imaginary XY plane.
 *
 * In case of intersection, positions the this.object at the intersection point
 */

import {Component, Object as WLEObject, Type} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';
import {ARSession, XR8Provider, ARProvider} from '@wonderlandengine/8thwall-tracking';

export class HitTestLocationXR8 extends Component {
    public static TypeName = 'hit-test-location-xr8';
    public static Properties = {
        camera: {type: Type.Object},
    };

    // injected by WLE
    camera!: WLEObject;

    private _tracking = false;

    private _camForward = vec3.create();
    private _intersectionVec3 = vec3.create();
    private _tmpWorldPosition = vec3.create();

    init() {
        ARSession.onSessionStarted.add(this.onSessionStarted);
        ARSession.onSessionEnded.add(this.onSessionEnded);
    }

    update() {
        if (this._tracking) {
            this.camera.getForward(this._camForward);
            /* Intersect with origin XY plane. We always intersect if camera facing downwards */
            if (this._camForward[1] < 0) {
                this.camera.getTranslationWorld(this._tmpWorldPosition);
                const t = -this._tmpWorldPosition[1] / this._camForward[1];
                vec3.add(
                    this._intersectionVec3,
                    this._tmpWorldPosition,
                    vec3.scale(this._intersectionVec3, this._camForward, t)
                );
                this.object.setTranslationWorld(this._intersectionVec3);
            }
        }
    }

    onSessionStarted = (provider: ARProvider) => {
        if (provider instanceof XR8Provider) {
            this.object.scalingWorld = [1, 1, 1];
            this._tracking = true;
        }
    };

    onSessionEnded = (provider: ARProvider) => {
        if (provider instanceof XR8Provider) {
            this._tracking = false;
            this.object.scalingWorld = [0, 0, 0];
        }
    };
}
