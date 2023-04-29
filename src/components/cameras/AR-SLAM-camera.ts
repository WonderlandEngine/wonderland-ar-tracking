import {WorldTracking_XR8} from '../../frameworks/xr8/world-tracking-mode-xr8.js';
import {WorldTracking_WebXR} from '../../frameworks/WebXR/world-tracking-mode-webxr.js';

import {ITrackingMode} from '../../frameworks/trackingMode.js';
import {WebXRProvider} from '../../frameworks/WebXR/webxr-provider.js';
import {XR8Provider} from '../../frameworks/xr8/xr8-provider.js';
import {ARCamera} from './AR-Camera.js';

/**
 * AR SLAM Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Depending on the device it will choose to use either device native WebXR (`WebXRProvider`)
 * or 8th Wall SLAM implementation (`xr8Provider`)
 */
class ARSLAMCamera extends ARCamera {
    static TypeName = 'AR-SLAM-camera';

    private _trackingImpl!: ITrackingMode;

    override init = () => {
        /* Check if the device supports WebXR. If it does, use WebXRProvider */
        if (this.engine.arSupported) {
            const provider = WebXRProvider.registerTrackingProviderWithARSession(
                this.engine
            );
            this._trackingImpl = new WorldTracking_WebXR(provider, this);
        } else {
            const provider = XR8Provider.registerTrackingProviderWithARSession(this.engine);
            this._trackingImpl = new WorldTracking_XR8(provider, this);
        }
    };

    start() {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }

        if (!this.engine.arSupported) {
            (this._trackingImpl as WorldTracking_XR8).init();
        }
    }

    startSession = async () => {
        if (this.active) {
            this._trackingImpl!.startSession();
        }
    };

    endSession = async () => {
        if (this.active) {
            this._trackingImpl.endSession();
        }
    };

    onDeactivate(): void {
        this._trackingImpl.endSession();
    }

    update(dt: number) {
        this._trackingImpl.update?.(dt);
    }
}

export {ARSLAMCamera};
