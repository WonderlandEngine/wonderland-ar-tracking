import {property} from '@wonderlandengine/api/decorators.js';

import {ImageTrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';
import {ARTrackingCameraBase} from './AR-tracking-camera-base.js';

/**
 * AR image tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `WorldTracking_XR8`
 */
export class ARImageTrackingCamera extends ARTrackingCameraBase<ImageTrackingMode> {
    static TypeName = 'ar-image-tracking-camera';
    protected trackingType = TrackingType.Image;

    @property.bool(false) // Improves tracking, reduces performance
    enableSLAM!: number;

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
}
