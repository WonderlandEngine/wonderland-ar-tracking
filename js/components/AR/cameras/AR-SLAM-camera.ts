import { Component, init } from '@wonderlandengine/api';

import ARSetup from '../AR-setup';

import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-provider-xr8';
import WorldTracking_webAR from '../frameworks/webAR/world-tracking-provider-webAR';
import XR8Setup from '../frameworks/xr8/xr8-setup';

import { ITrackingProvider } from '../frameworks/trackingProvider';


if (WL.arSupported) {
  ARSetup.setUsage(ARSetup.ARUsage.SLAM, []);
} else {
  ARSetup.setUsage(ARSetup.ARUsage.SLAM, [XR8Setup]);
}

const WLEComponentTypeName = "AR-SLAM-camera";

export default class ARSLAMCamera extends Component {
  public static TypeName = WLEComponentTypeName;
  public static Properties = {};

  private worldTrackingProvider?: ITrackingProvider;

  init() {
    console.log("Initing world camera");
  }

  public start() {
    console.log("Starting World Camera");

    if (!this.object.getComponent("view")) {
      throw new Error("AR-camera requires a view component");
    }

    //if (WL.arSupported) {
    if (false) { // force xr8
      this.worldTrackingProvider = new WorldTracking_webAR(this);
    } else {
      this.worldTrackingProvider = new WorldTracking_XR8(this);
      (this.worldTrackingProvider as WorldTracking_XR8).init();
    }

    ARSetup.onARStartClicked.push((_event) => {
      this.worldTrackingProvider!.startARSession();
    });
  }

  onActivate(): void {
    console.log("Activating world camera");
  }

  onDeactivate(): void {
    console.log("Deactivating world camera");
    this.worldTrackingProvider!.stopARSession()
  }

  startARSession() {
    console.log("Starting world tracking session");
    this.worldTrackingProvider!.startARSession();
  }

  public update(dt) {
    this.worldTrackingProvider!.update?.(dt);
  }
}
WL.registerComponent(ARSLAMCamera);