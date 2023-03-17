import {ARSession} from '../AR-session.js';

import {WorldTracking_XR8} from '../frameworks/xr8/world-tracking-mode-xr8.js';
import {WorldTracking_webAR} from '../frameworks/webAR/world-tracking-mode-webAR.js';

import {ITrackingMode} from '../frameworks/trackingMode.js';
import {webXRProvider} from '../frameworks/webAR/webXR-provider.js';
import {xr8Provider} from '../frameworks/xr8/xr8-provider.js';
import {ARCamera} from './AR-Camera.js';


// running on a browser?
if (window.document) {
    // WL.arSupported might not exist at this point. so we wait until WLE resolves it
    (function checkARSupport() {
        if (WL.arSupported === undefined) {
            setTimeout(checkARSupport, 1);
        } else {
            if (WL.arSupported) {
                ARSession.registerTrackingProvider(webXRProvider);
            } else {
                ARSession.registerTrackingProvider(xr8Provider);
            }
        }
    })();
}

class ARSLAMCamera extends ARCamera {
    public static TypeName = 'AR-SLAM-camera';
    public static Properties = {};

    private _trackingImpl!: ITrackingMode;

    public init() {
        if (this.engine.arSupported) {
            //if (false) { // force xr8
            this._trackingImpl = new WorldTracking_webAR(this);
        } else {
            this._trackingImpl = new WorldTracking_XR8(this);
        }
    }

    public start() {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }

        if (!WL.arSupported) {
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

    public update(dt: number) {
        this._trackingImpl.update?.(dt);
    }
}

export {ARSLAMCamera};
