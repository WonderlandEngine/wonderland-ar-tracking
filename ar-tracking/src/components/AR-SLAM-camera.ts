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

    override init = () => {
        this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(
            TrackingType.SLAM,
            this
        );
    };

    start() {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }

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
    }
}

export {ARSLAMCamera};
