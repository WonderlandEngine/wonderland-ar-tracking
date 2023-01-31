import { Component } from '@wonderlandengine/api';

import ARSetup from '../AR-setup';

import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-provider-xr8';
import WorldTracking_webAR from '../frameworks/webAR/world-tracking-provider-webAR';
import XR8Setup from '../frameworks/xr8/xr8-setup';

import { ITrackingProvider } from '../frameworks/trackingProvider';


if (WL.arSupported) {
  ARSetup.setUsage(ARSetup.ARUsage.SLAM, []);
} else {
  ARSetup.setUsage(ARSetup.ARUsage.SLAM, [XR8Setup]);
}


class ARCamera extends Component {
  public static TypeName = 'AR-camera';
  public static Properties = {};

  private worldTrackingProvider?: ITrackingProvider;

  public start() {
    if (WL.arSupported) {
      this.worldTrackingProvider = new WorldTracking_webAR(this);
    } else {
      this.object.getComponent("input")!.active = false;  // 8thwall will handle the camera pose
      this.worldTrackingProvider = new WorldTracking_XR8(this);
      (this.worldTrackingProvider as WorldTracking_XR8).init();
    }

    ARSetup.onARStartClicked.push((_event) => {
      this.worldTrackingProvider!.startARSession();
    });

    //this.worldTrackingSystem.init(this);
    //ARSetup.addARSystem(this.worldTrackingSystem);
  }

  public update(dt) {
    this.worldTrackingProvider!.update?.(dt);
  }
}
WL.registerComponent(ARCamera);