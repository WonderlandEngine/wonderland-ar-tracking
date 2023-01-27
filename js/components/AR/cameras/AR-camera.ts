
import ARSetup from '../AR-setup';

import worldTracking8thWall from '../frameworks/8thwall/world-tracking-system-8thWall';
import WorldTracking_webAR from '../frameworks/webAR/world-tracking-system-webAR';

ARSetup.setUsage(ARSetup.ARUsage.SLAM);

WL.registerComponent("AR-camera", {}, {
  worldTrackingSystem: null,
  start: function () {

    if (ARSetup.hasNativeWorldTrackingSupport()) {
      this.worldTrackingSystem = WorldTracking_webAR
    } else {
      this.object.getComponent("input").active = false;  // 8thwall will handle the camera pose
      this.worldTrackingSystem = worldTracking8thWall;
    }
    this.worldTrackingSystem.init(this);
    ARSetup.addARSystem(this.worldTrackingSystem);
  },

  update: function (dt) {
    this.worldTrackingSystem.update?.(dt);
  },
});