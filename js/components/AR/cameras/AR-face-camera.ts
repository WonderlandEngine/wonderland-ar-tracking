import ARSetup from '../AR-setup';
import FaceTracking_XR8 from '../frameworks/xr8/face-tracking-provider-xr8';
import  XR8Setup from '../frameworks/xr8/xr8-setup';
import { Component, Type } from '@wonderlandengine/api';

ARSetup.setUsage(ARSetup.ARUsage.FACE_TRACKING, [XR8Setup]);
export default class ARFaceCamera extends Component {
  public static TypeName = 'AR-face-camera';
  public static Properties = {
    cameraDirection: { type: Type.Enum, values:["front", "back"] as XR8CameraDirection[keyof XR8CameraDirection][], default: "front"},
  };

  private trackingProvider = new FaceTracking_XR8(this);
  
  // will be set by WLE
  public readonly cameraDirection: number;

  // prevent users from using new()
  private constructor() {
    /** */
    super();
  }

  public get onFaceFound () {
    return this.trackingProvider.onFaceFound;

  }
  public get onFaceUpdate() {
    return this.trackingProvider.onFaceUpdate;
  }

  public get onFaceLost() {
    return this.trackingProvider.onFaceLost;
  }

  public start() {
    
    this.object.getComponent("input")!.active = false; // 8thwall will handle the camera pose
    this.trackingProvider.init();

    ARSetup.onARStartClicked.push((_event) => {
      this.trackingProvider.startARSession();
    });
    //ARSetup.addARSystem(this.trackingSystem);
  }
}

WL.registerComponent(ARFaceCamera);

