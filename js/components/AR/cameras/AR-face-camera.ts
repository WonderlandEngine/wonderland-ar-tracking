import ARSetup from '../AR-setup';
import FaceTracking_8thWall from '../frameworks/8thwall/face-tracking-system-8thwall';
import  Setup8thwall from '../8thwall-setup';
import { Component } from '@wonderlandengine/api';

ARSetup.setUsage(ARSetup.ARUsage.FACE_TRACKING, [Setup8thwall]);

class ARFaceCamera extends Component {
  public static TypeName = 'AR-face-camera';
  public static Properties = {};

  private trackingSystem = new FaceTracking_8thWall(this);

  public get onFaceFound () {
    return this.trackingSystem.onFaceFound;

  }
  public get onFaceUpdate() {
    return this.trackingSystem.onFaceUpdate;
  }

  public get onFaceLost() {
    return this.trackingSystem.onFaceLost;
  }

  public start() {
    this.object.getComponent("input")!.active = false; // 8thwall will handle the camera pose
    this.trackingSystem.init();

    ARSetup.onARStartClicked.push((_event) => {
      this.trackingSystem.startARSession();
    });
    //ARSetup.addARSystem(this.trackingSystem);
  }
}


WL.registerComponent(ARFaceCamera);
