import {ARSession} from '../../AR-session.js';

import {WorldTracking_XR8} from '../../frameworks/xr8/world-tracking-mode-xr8.js';
import {WorldTracking_webAR} from '../../frameworks/webAR/world-tracking-mode-webAR.js';

import {ITrackingMode} from '../../frameworks/trackingMode.js';
import {webXRProvider} from '../../frameworks/webAR/webXR-provider.js';
import {xr8Provider} from '../../frameworks/xr8/xr8-provider.js';
import {ARCamera} from './AR-Camera.js';

/**
 * AR SLAM Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Depending on the device it will choose to use either device native webXR (`webXRProvider`)
 * or 8th Wall SLAM implementation (`xr8Provider`)
 */
class ARSLAMCamera extends ARCamera {
    public static TypeName = 'AR-SLAM-camera';

    private _trackingImpl!: ITrackingMode;

    public override init = () => {
        /**
         * check if the device supports webXR
         * if it does - use webXRProvider
         */
        if (this.engine.arSupported) {
            //if (false) { // force xr8
            ARSession.registerTrackingProvider(this.engine, webXRProvider);
            this._trackingImpl = new WorldTracking_webAR(this);
        } else {
            ARSession.registerTrackingProvider(this.engine, xr8Provider);
            this._trackingImpl = new WorldTracking_XR8(this);
        }
    };

    public start() {
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

        ARSession.onARSessionReady.add(() => {

        });
    };

    endSession = async () => {
        if (this.active) {
            this._trackingImpl.endSession();
        }
    };

    onDeactivate(): void {
        this._trackingImpl.endSession();
    }

    public update(dt: number) {
        this._trackingImpl.update?.(dt);
    }
}

export {ARSLAMCamera};
