import {property} from '@wonderlandengine/api/decorators.js';

import {FaceTrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';

import {ARTrackingCameraBase} from './AR-tracking-camera-base.js';

/**
 * AR face tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `FaceTracking_XR8`
 */
export class ARFaceTrackingCamera extends ARTrackingCameraBase<FaceTrackingMode> {
    static TypeName = 'ar-face-tracking-camera';
    static InheritProperties = true;

    protected getTrackingType(): TrackingType {
        return TrackingType.Face;
    }

    @property.enum(['front', 'back'], 'front')
    cameraDirection!: number;

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

    protected validateStart(): void {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }
    }
}
