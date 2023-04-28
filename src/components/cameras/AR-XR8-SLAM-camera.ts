import {property} from '@wonderlandengine/api/decorators.js';

import {WorldTracking_XR8} from '../../frameworks/xr8/world-tracking-mode-xr8.js';

import {XR8Provider} from '../../frameworks/xr8/xr8-provider.js';
import {ARCamera} from './AR-Camera.js';

/**
 * AR SLAM Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * This camera will force the use of 8th Wall SLAM implementation (`xr8Provider`)
 */
class ARXR8SLAMCamera extends ARCamera {
    public static TypeName = 'AR-XR8-SLAM-camera';

    @property.bool(false)
    useAbsoluteScale!: boolean;

    private _trackingImpl!: WorldTracking_XR8;

    public get onTrackingStatus() {
        return this._trackingImpl!.onTrackingStatus;
    }

    init() {
        const provider = XR8Provider.registerTrackingProviderWithARSession(this.engine);
        this._trackingImpl = new WorldTracking_XR8(provider, this);
    }

    public start() {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }

        this._trackingImpl.init();
    }

    startSession = async () => {
        if (this.active) {
            this._trackingImpl!.startSession();
        }
    };

    endSession = async () => {
        if (this.active) {
            this._trackingImpl!.endSession();
        }
    };

    onDeactivate(): void {
        this._trackingImpl!.endSession();
    }
}

export {ARXR8SLAMCamera};
