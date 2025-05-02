import {ARSession} from '../AR-session.js';
import {VPSTrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';
import {ARCamera} from './AR-Camera.js';

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
class ARVPSCamera extends ARCamera {
    static TypeName = 'ar-vps-camera';

    /**
     * make sure noone can overwrite this
     */
    get usesVPS() {
        return true;
    }

    private _trackingImpl!: VPSTrackingMode;

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

    init() {
        this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(
            TrackingType.VPS,
            this
        ) as VPSTrackingMode;
    }

    start() {
        if (this._trackingImpl.init) this._trackingImpl.init(['location']);
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
}

export {ARVPSCamera};
