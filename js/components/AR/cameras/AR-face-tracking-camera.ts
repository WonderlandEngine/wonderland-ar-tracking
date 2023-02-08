import ARSession from '../AR-session';
import FaceTracking_XR8 from '../frameworks/xr8/face-tracking-provider-xr8';
import XR8Setup from '../frameworks/xr8/xr8-setup';
import { Component, Type } from '@wonderlandengine/api';

const WLEComponentTypeName = 'AR-face-tracking-camera';

ARSession.setUsage(ARSession.ARUsage.FACE_TRACKING, [XR8Setup]);
export default class ARFaceTrackingCamera extends Component {
  public static TypeName = WLEComponentTypeName;
  public static Properties = {
    cameraDirection: { type: Type.Enum, values: ['front', 'back'] as XR8CameraDirection[keyof XR8CameraDirection][], default: 'front' },
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

  init() {
    console.log('Initing face camera');
  }

  public start() {
    console.log('Starting face Camera');

    if (!this.object.getComponent('view')) {
      throw new Error('AR-camera requires a view component');
    }

    this.trackingProvider.init();

    ARSession.onARStartClicked.push((_event) => {
      this.startARSession();
    });
  }

  onActivate(): void {
    console.log('Activating Face camera');
  }

  onDeactivate(): void {
    console.log('Deactivating Face camera');
    this.trackingProvider.stopARSession();
  }

  startARSession() {
    console.log('Starting face tracking session');
    this.trackingProvider.startARSession();
  }
}

WL.registerComponent(ARFaceTrackingCamera);

