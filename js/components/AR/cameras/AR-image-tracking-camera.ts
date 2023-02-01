import ARSetup from '../AR-setup';
import  XR8Setup from '../frameworks/xr8/xr8-setup';
import { Component, Type } from '@wonderlandengine/api';
import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-provider-xr8';

ARSetup.setUsage(ARSetup.ARUsage.IMAGE_TRACKING, [XR8Setup]);

const WLEComponentTypeName = "AR-image-tracking-camera";

export default class ARImageTrackingCamera extends Component {

  public static TypeName = WLEComponentTypeName;
  public static Properties = {
    EnableSLAM: {type: Type.Bool, default: false,} // Imrpoves tracking, reduces performance
  };

  private trackingProvider = new WorldTracking_XR8(this);
  
  // will be set by WLE
  public readonly cameraDirection: number;


  public get onImageFound () {
    return this.trackingProvider.onImageFound;

  }
  public get onImageUpdate() {
    return this.trackingProvider.onImageUpdate;
  }

  public get onImageLost() {
    return this.trackingProvider.onImageLost;
  }
  init() {
    
  }

  public start() {
    console.log("Starting image Camera");
    this.trackingProvider.init();

    ARSetup.onARStartClicked.push((_event) => {
      this.trackingProvider.startARSession();
    });
  }

  onActivate(): void {
    console.log("Activating image camera");
  }

  onDeactivate(): void {
    console.log("Deactivating image camera");
    this.trackingProvider.stopARSession();
  }

  startARSession() {
    console.log("Starting image tracking session");
    this.trackingProvider.startARSession();
  }
}

WL.registerComponent(ARImageTrackingCamera);

