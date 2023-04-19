import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession} from '../../AR-session.js';

import {XR8Provider /*xr8Provider*/} from '../../frameworks/xr8/xr8-provider.js';
import {WorldTracking_XR8} from '../../frameworks/xr8/world-tracking-mode-xr8.js';
import {ARCamera} from './AR-Camera.js';

/**
 * AR image tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `WorldTracking_XR8`
 */
class ARImageTrackingCamera extends ARCamera {
    public static TypeName = 'AR-image-tracking-camera';

    @property.bool(false) // Improves tracking, reduces performance
    enableSLAM!: number;

    private _trackingImpl!: WorldTracking_XR8;

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
        const provider = XR8Provider.registerTrackingProviderWithARSession(this.engine);
        this._trackingImpl = new WorldTracking_XR8(provider, this);
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
