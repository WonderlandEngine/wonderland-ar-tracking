import ARSetup from '../AR-setup';
import FaceTracking_8thWall from '../frameworks/8thwall/face-tracking-system-8thwall';

ARSetup.setUsage(ARSetup.ARUsage.FACE_TRACKING);

WL.registerComponent("AR-face-camera", {}, {

  // TODO - this has to be defined before the getters (because apparently getters are evaluated ahead of time). Which is wrong, figure out how to make getter work at runtime.
  trackingSystem: FaceTracking_8thWall,

  get onFaceFound() {
    return this.trackingSystem.onFaceFound;
  },

  get onFaceUpdate() {
    return this.trackingSystem.onFaceUpdate;
  },

  get onFaceLost() {
    return this.trackingSystem.onFaceLost;
  },

  start: function () {
    this.object.getComponent("input").active = false; // 8thwall will handle the camera pose
    this.trackingSystem = FaceTracking_8thWall;
    this.trackingSystem.init(this);
    ARSetup.addARSystem(this.trackingSystem);
  },

  update: function (dt) {
    this.trackingSystem.update?.(dt);
  },

});