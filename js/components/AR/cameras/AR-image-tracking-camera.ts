import ARSession from '../AR-session';

import { Component, Type } from '@wonderlandengine/api';

import XR8Provider from '../frameworks/xr8/xr8-provider';
import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-mode-xr8';


ARSession.registerTrackingProvider(XR8Provider);

const WLEComponentTypeName = 'AR-image-tracking-camera';

export default class ARImageTrackingCamera extends Component {

  public static TypeName = WLEComponentTypeName;
  public static Properties = {
    EnableSLAM: {type: Type.Bool, default: false,} // Imrpoves tracking, reduces performance
  };

  private trackingImpl = new WorldTracking_XR8(this);
  
  // will be set by WLE
  public readonly cameraDirection: number;


  public get onImageFound () {
    return this.trackingImpl.onImageFound;

  }
  public get onImageUpdate() {
    return this.trackingImpl.onImageUpdate;
  }

  public get onImageLost() {
    return this.trackingImpl.onImageLost;
  }
  init() {
    
  }

  public start() {
    console.log('Starting image Camera');
    this.trackingImpl.init();
    ARSession.onARSessionRequested.push(this.startARSession);
  }

  startARSession = () => {
    if (this.active) {
      console.log('Starting image tracking session');
      this.trackingImpl.startSession();
    }
  }

  onActivate(): void {
    console.log('Activating image camera');
  }

  onDeactivate(): void {
    console.log('Deactivating image camera');
    this.trackingImpl.endSession();
  }
}

WL.registerComponent(ARImageTrackingCamera);

