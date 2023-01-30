
import ARSetup from '../AR-setup';

import worldTracking8thWall from '../frameworks/8thwall/world-tracking-system-8thWall';
import WorldTracking_webAR from '../frameworks/webAR/world-tracking-system-webAR';

import { Setup8thwall } from '../8thwall-setup';
import { Component } from '@wonderlandengine/api';
import WorldTracking_8thWall from '../frameworks/8thwall/world-tracking-system-8thWall';
import {TrackingProvider, ITrackingProvider} from '../frameworks/trackingProvider';


if (WL.arSupported) {
  ARSetup.setUsage(ARSetup.ARUsage.SLAM, []);
} else {
  ARSetup.setUsage(ARSetup.ARUsage.SLAM, [Setup8thwall]);
}


class ARCamera extends Component {
  public static TypeName = 'AR-camera';
  public static Properties = {};
  
  private worldTrackingSystem?: ITrackingProvider;

  public start() {
    if (WL.arSupported) {
      this.worldTrackingSystem = new WorldTracking_webAR(this);
    } else {
      this.object.getComponent("input")!.active = false;  // 8thwall will handle the camera pose
      this.worldTrackingSystem = new WorldTracking_8thWall(this);
      (this.worldTrackingSystem as WorldTracking_8thWall).init();
    }

    ARSetup.onARStartClicked.push((_event) => {
      this.worldTrackingSystem!.startARSession();
    });

    //this.worldTrackingSystem.init(this);
    //ARSetup.addARSystem(this.worldTrackingSystem);
  }

  public update(dt) {
    this.worldTrackingSystem!.update?.(dt);
  }
}
WL.registerComponent(ARCamera);