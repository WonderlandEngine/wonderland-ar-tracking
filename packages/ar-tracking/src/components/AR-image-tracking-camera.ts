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
    static InheritProperties = true;

    protected getTrackingType(): TrackingType {
        return TrackingType.Image;
    }

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

    /**
     * Pre-registers an image tracking target with the active provider.
     *
     * Delegates to {@link ImageTrackingMode.registerTarget} if the provider
     * implements it (e.g. Zappar requires `.zpt` files to be loaded before
     * tracking starts). Providers that do not need pre-registration will
     * silently ignore this call.
     *
     * Call from a response component's `start()` hook, passing the same
     * `name` that the component uses as its `imageId`.
     *
     * @param source URL or `ArrayBuffer` of the target file.
     * @param options.name Must match the `imageId` on tracker components.
     * @param options.physicalWidthInMeters Optional physical width in metres.
     */
    async registerTarget(
        source: string | ArrayBuffer,
        options: {name: string; physicalWidthInMeters?: number}
    ): Promise<void> {
        await this._trackingImpl.registerTarget?.(source, options);
    }
}
