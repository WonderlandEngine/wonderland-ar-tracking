import ARSetup from '../AR-setup';
import FaceTracking_XR8 from '../frameworks/xr8/face-tracking-provider-xr8';
import XR8Setup from '../frameworks/xr8/xr8-setup';
import { Component, Type } from '@wonderlandengine/api';

const WLEComponentTypeName = "AR-face-tracking-camera";

ARSetup.setUsage(ARSetup.ARUsage.FACE_TRACKING, [XR8Setup]);
export default class ARFaceTrackingCamera extends Component {
  public static TypeName = WLEComponentTypeName;
  public static Properties = {
    cameraDirection: { type: Type.Enum, values: ["front", "back"] as XR8CameraDirection[keyof XR8CameraDirection][], default: "front" },
  };

  private trackingProvider = new FaceTracking_XR8(this);

  // will be set by WLE
  public readonly cameraDirection: number;

  public get onFaceFound() {
    return this.trackingProvider.onFaceFound;

  }
  public get onFaceUpdate() {
    return this.trackingProvider.onFaceUpdate;
  }

  public get onFaceLost() {
    return this.trackingProvider.onFaceLost;
  }

  public start() {
    if(!this.object.getComponent("view")) {
      throw new Error("AR-camera requires a view component");
    }

    this.trackingProvider.init();

    ARSetup.onARStartClicked.push((_event) => {
      this.trackingProvider.startARSession();
    });
  }
}

WL.registerComponent(ARFaceTrackingCamera);

