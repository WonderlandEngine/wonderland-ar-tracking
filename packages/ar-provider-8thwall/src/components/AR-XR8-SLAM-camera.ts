import {property} from '@wonderlandengine/api/decorators.js';

import {WorldTracking_XR8} from '../world-tracking-mode-xr8.js';
import {XR8Provider} from '../xr8-provider.js';
import {ARCamera, ARSession} from '@wonderlandengine/ar-tracking';

/**
 * AR SLAM Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * This camera will force the use of 8th Wall SLAM implementation (`xr8Provider`)
 */
class ARXR8SLAMCamera extends ARCamera {
    static TypeName = 'ar-xr8-slam-camera';

    @property.bool(false)
    useAbsoluteScale!: boolean;

    private _trackingImpl!: WorldTracking_XR8;

    get onTrackingStatus() {
        return this._trackingImpl!.onTrackingStatus;
    }

    init() {
        const provider = XR8Provider.registerTrackingProviderWithARSession(
            ARSession.getSessionForEngine(this.engine)
        );
        this._trackingImpl = new WorldTracking_XR8(provider, this);
    }

    start() {
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
