import {Type} from '@wonderlandengine/api';

import {ARSession} from '../AR-session.js';

import {xr8Provider} from '../frameworks/xr8/xr8-provider.js';
import {WorldTracking_XR8} from '../frameworks/xr8/world-tracking-mode-xr8.js';
import {ARCamera} from './AR-Camera.js';

class ARImageTrackingCamera extends ARCamera {
    public static TypeName = 'AR-image-tracking-camera';
    public static Properties = {
        EnableSLAM: {type: Type.Bool, default: false}, // Imrpoves tracking, reduces performance
    };

    private _trackingImpl = new WorldTracking_XR8(this);

    public get onImageScanning() {
        return this._trackingImpl.onImageScanning;
    }

    public get onImageFound() {
        return this._trackingImpl.onImageFound;
    }

    public get onImageUpdate() {
        return this._trackingImpl.onImageUpdate;
    }

    public get onImageLost() {
        return this._trackingImpl.onImageLost;
    }

    init() {
        ARSession.registerTrackingProvider(this.engine, xr8Provider);
    }

    public start() {
        this._trackingImpl.init();
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

export {ARImageTrackingCamera};
