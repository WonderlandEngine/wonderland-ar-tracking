import {ARSession} from '../AR-session.js';

import {xr8Provider} from '../frameworks/xr8/xr8-provider.js';
import {WorldTracking_XR8} from '../frameworks/xr8/world-tracking-mode-xr8.js';
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
    public static TypeName = 'AR-VPS-camera';

    /**
     * make sure noone can overwrite this
     */
    public get usesVPS() {
        return true;
    }

    private _trackingImpl = new WorldTracking_XR8(this);

    public get onWaySpotFound() {
        return this._trackingImpl.onWaySpotFound;
    }
    public get onWaySpotUpdated() {
        return this._trackingImpl.onWaySpotUpdated;
    }

    public get onWaySpotLost() {
        return this._trackingImpl.onWaySpotLost;
    }

    public get onMeshFound() {
        return this._trackingImpl.onMeshFound;
    }

    init() {
        ARSession.registerTrackingProvider(this.engine, xr8Provider);
    }

    public start() {
        this._trackingImpl.init(['location']);
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
