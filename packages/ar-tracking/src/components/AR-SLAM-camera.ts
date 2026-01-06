import {ITrackingMode} from '../tracking-mode.js';
import {ARCamera} from './AR-Camera.js';
import {TrackingType} from '../tracking-type.js';
import {ARSession} from '../AR-session.js';

/**
 * AR SLAM Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Depending on the device it will choose to use either device native WebXR (`WebXRProvider`)
 * or 8th Wall SLAM implementation (`xr8Provider`)
 */
class ARSLAMCamera extends ARCamera {
    static TypeName = 'ar-slam-camera';

    private _trackingImpl!: ITrackingMode;
    private readonly _projectionMatrix = new Float32Array(16);

    init() {
        this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(
            TrackingType.SLAM,
            this
        );
    }

    start() {
        if (this._trackingImpl.init) this._trackingImpl.init();
    }

    startSession = async () => {
        if (this.active) {
            this._trackingImpl!.startSession();
        }
    };

    endSession = async () => {
        if (this.active) {
            this._trackingImpl.endSession();
        }
    };

    onDeactivate(): void {
        this._trackingImpl.endSession();
    }

    update(dt: number) {
        this._trackingImpl.update?.(dt);

        const cameraTransformWorld = this._trackingImpl.getCameraTransformWorld?.();
        if (cameraTransformWorld) {
            this.object.setTransformWorld(cameraTransformWorld);
        }

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

export {ARSLAMCamera};
