import { ARSession } from '../AR-session';

import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-mode-xr8';
import WorldTracking_webAR from '../frameworks/webAR/world-tracking-mode-webAR';


import { ITrackingMode } from '../frameworks/trackingMode';
import { webXRProvider } from '../frameworks/webAR/webXR-provider';
import { xr8Provider } from '../frameworks/xr8/xr8-provider';
import { ARCamera } from './AR-Camera';

// running on a browser?
if (window.document) {
  WL.onXRSupported.push((type: string, supported: boolean) => {
    if (type === 'ar') {
      if (supported) {
        ARSession.registerTrackingProvider(webXRProvider)
      } else {
        ARSession.registerTrackingProvider(xr8Provider)
      }
    }
  });
}

const WLEComponentTypeName = 'AR-SLAM-camera';

class ARSLAMCamera extends ARCamera {
  public static TypeName = WLEComponentTypeName;
  public static Properties = {};

  private trackingImpl?: ITrackingMode;

  public start() {

    if (!this.object.getComponent('view')) {
      throw new Error('AR-camera requires a view component');
    }
    //if (WL.arSupported) {
    if (false) { // force xr8
      this.trackingImpl = new WorldTracking_webAR(this);
    } else {
      this.trackingImpl = new WorldTracking_XR8(this);
      (this.trackingImpl as WorldTracking_XR8).init();
    }
  }

  startSession = async () => {
    if (this.active) {
      this.trackingImpl!.startSession();
    }
  }

  endSession = async () => {
    if (this.active) {
      this.trackingImpl!.endSession();
    }
  }

  onDeactivate(): void {
    this.trackingImpl!.endSession()
  }

  public update(dt: number) {
    this.trackingImpl!.update?.(dt);
  }
}

WL.registerComponent(ARSLAMCamera);


export { ARSLAMCamera }

