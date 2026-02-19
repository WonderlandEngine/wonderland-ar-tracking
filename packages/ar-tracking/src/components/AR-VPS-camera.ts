import {VPSTrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';
import {ARTrackingCameraBase} from './AR-tracking-camera-base.js';

/**
 * AR VPS tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `WorldTracking_XR8`.
 *
 * Check 8th Wall Lightship VPS system for details. (https://www.8thwall.com/docs/web/#lightship-vps)
 *
 * IMPORTANT: for this camera to run correctly,
 * clear the "Project Settings/Editor/serverCOEP" field.
 * Warning - it will disable the WASM thread support.
 */
export class ARVPSCamera extends ARTrackingCameraBase<VPSTrackingMode> {
    static TypeName = 'ar-vps-camera';

    protected getTrackingType(): TrackingType {
        return TrackingType.VPS;
    }

    /**
     * make sure noone can overwrite this
     */
    get usesVPS() {
        return true;
    }

    get onWaySpotFound() {
        return this._trackingImpl.onWaySpotFound;
    }
    get onWaySpotUpdated() {
        return this._trackingImpl.onWaySpotUpdated;
    }

    get onWaySpotLost() {
        return this._trackingImpl.onWaySpotLost;
    }

    get onMeshFound() {
        return this._trackingImpl.onMeshFound;
    }

    protected getTrackingInitFeatures(): string[] {
        return ['location'];
    }
}
