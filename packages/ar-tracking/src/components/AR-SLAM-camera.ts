import {ITrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';
import {ARTrackingCameraBase} from './AR-tracking-camera-base.js';

/**
 * AR SLAM Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Depending on the device it will choose to use either device native WebXR (`WebXRProvider`)
 * or 8th Wall SLAM implementation (`xr8Provider`)
 */
export class ARSLAMCamera extends ARTrackingCameraBase<ITrackingMode> {
    static TypeName = 'ar-slam-camera';

    protected getTrackingType(): TrackingType {
        return TrackingType.SLAM;
    }

    private readonly _projectionMatrix = new Float32Array(16);

    update(dt: number) {
        super.update(dt);

        const view = this.object.getComponent('view');
        if (view) {
            const hasProjectionMatrix = this._trackingImpl.getCameraProjectionMatrix?.(
                this._projectionMatrix
            );
            if (hasProjectionMatrix) {
                view._setProjectionMatrix(this._projectionMatrix);
                const ndcDepthIsZeroToOne = false;
                this.engine.wasm._wl_view_component_remapProjectionMatrix(
                    view._id,
                    this.engine.isReverseZEnabled,
                    ndcDepthIsZeroToOne
                );
            }
        }
    }
}
