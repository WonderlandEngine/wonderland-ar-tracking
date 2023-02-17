import ARSession from '../AR-session';
import FaceTracking_XR8 from '../frameworks/xr8/face-tracking-mode-xr8';
import XR8Provider from '../frameworks/xr8/xr8-provider';
import { Component, Type } from '@wonderlandengine/api';

const WLEComponentTypeName = 'AR-face-tracking-camera';

ARSession.registerTrackingProvider(XR8Provider);
export default class ARFaceTrackingCamera extends Component {
  public static TypeName = WLEComponentTypeName;
  public static Properties = {
    cameraDirection: { type: Type.Enum, values: ['front', 'back'] as XR8CameraDirection[keyof XR8CameraDirection][], default: 'front' },
  };

  private trackingImpl = new FaceTracking_XR8(this);

  // will be set by WLE
  public cameraDirection: number = 0;

  public get onFaceFound() {
    return this.trackingImpl.onFaceFound;

  }
  public get onFaceUpdate() {
    return this.trackingImpl.onFaceUpdate;
  }

  public get onFaceLost() {
    return this.trackingImpl.onFaceLost;
  }

  public start() {
    if (!this.object.getComponent('view')) {
      throw new Error('AR-camera requires a view component');
    }

    this.trackingImpl.init();

    ARSession.onARSessionRequested.push(this.startARSession);
  }

  startARSession = () => {
    if (this.active) {
      this.trackingImpl.startSession();
    }
  }

  onDeactivate(): void {
    this.trackingImpl.endSession();
  }
}

WL.registerComponent(ARFaceTrackingCamera);

