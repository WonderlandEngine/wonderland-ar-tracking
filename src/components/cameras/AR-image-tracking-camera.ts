import {property} from '@wonderlandengine/api/decorators.js';

import {XR8Provider} from '../../frameworks/xr8/xr8-provider.js';
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
    static TypeName = 'AR-image-tracking-camera';

    @property.bool(false) // Improves tracking, reduces performance
    enableSLAM!: number;

    private _trackingImpl!: WorldTracking_XR8;

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
        const provider = XR8Provider.registerTrackingProviderWithARSession(this.engine);
        this._trackingImpl = new WorldTracking_XR8(provider, this);
    }

    start() {
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
