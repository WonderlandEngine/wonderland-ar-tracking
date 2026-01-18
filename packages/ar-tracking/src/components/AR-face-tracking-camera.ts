import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession} from '../AR-session.js';
import {FaceTrackingMode, ITrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';

import {ARCamera} from './AR-Camera.js';

/**
 * AR face tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `FaceTracking_XR8`
 */
export class ARFaceTrackingCamera extends ARCamera {
    static TypeName = 'ar-face-tracking-camera';

    @property.enum(['front', 'back'], 'front')
    cameraDirection!: number;

    private _trackingImpl!: FaceTrackingMode;

    get onFaceLoading() {
        return this._trackingImpl.onFaceLoading;
    }

    get onFaceFound() {
        return this._trackingImpl.onFaceFound;
    }

    get onFaceUpdate() {
        return this._trackingImpl.onFaceUpdate;
    }

    get onFaceLost() {
        return this._trackingImpl.onFaceLost;
    }

    init() {
        this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(
            TrackingType.Face,
            this
        );
    }

    start() {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }
        if (this._trackingImpl.init) this._trackingImpl.init();
    }

    startSession = async () => {
        if (this.active) {
            this._trackingImpl.startSession();
        }
    };

    endSession = async () => {
        if (this.active) {
            this._trackingImpl!.endSession();
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
    }
}
