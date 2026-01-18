import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession} from '../AR-session.js';
import {ImageTrackingMode, ITrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';
import {ARCamera} from './AR-Camera.js';

/**
 * AR image tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `WorldTracking_XR8`
 */
export class ARImageTrackingCamera extends ARCamera {
    static TypeName = 'ar-image-tracking-camera';

    @property.bool(false) // Improves tracking, reduces performance
    enableSLAM!: number;

    private _trackingImpl!: ImageTrackingMode;

    get onImageScanning() {
        return this._trackingImpl.onImageScanning;
    }

    get onImageFound() {
        return this._trackingImpl.onImageFound;
    }

    get onImageUpdate() {
        return this._trackingImpl.onImageUpdate;
    }

    get onImageLost() {
        return this._trackingImpl.onImageLost;
    }

    init() {
        this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(
            TrackingType.Image,
            this
        ) as ImageTrackingMode;
    }

    start() {
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
