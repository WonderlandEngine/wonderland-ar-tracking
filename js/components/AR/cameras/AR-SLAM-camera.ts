import { Component, init } from '@wonderlandengine/api';

import ARSession from '../AR-session';

import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-mode-xr8';
import WorldTracking_webAR from '../frameworks/webAR/world-tracking-mode-webAR';
import XR8Provider from '../frameworks/xr8/xr8-provider';

import { ITrackingMode } from '../frameworks/trackingMode';
import WebXRProvider from '../frameworks/webAR/webXR-provider';


if (WL.arSupported) {
  ARSession.registerTrackingProvider(WebXRProvider)
  //ARSession.setUsage(ARSession.ARUsage.SLAM, []);
} else {
  ARSession.registerTrackingProvider(XR8Provider)
  //ARSession.setUsage(ARSession.ARUsage.SLAM, [XR8Provider]);
}

const WLEComponentTypeName = 'AR-SLAM-camera';

export default class ARSLAMCamera extends Component {
  public static TypeName = WLEComponentTypeName;
  public static Properties = {};

  private trackingImpl?: ITrackingMode;

  init() {
    console.log('Initing world camera');
  }

  public start() {
    console.log('Starting World Camera');

    if (!this.object.getComponent('view')) {
      throw new Error('AR-camera requires a view component');
    }

    if (WL.arSupported) {
    //(if (false) { // force xr8
      this.trackingImpl = new WorldTracking_webAR(this);
    } else {
      this.trackingImpl = new WorldTracking_XR8(this);
      (this.trackingImpl as WorldTracking_XR8).init();
    }

    ARSession.onARSessionRequested.push(this.startARSession);
  }


  startARSession = () => {
    if (this.active) {
      console.log('Starting SLAM tracking session with provider', this.trackingImpl);
      this.trackingImpl!.startSession();
    }
  }

  onARSessionStarted(): void {

  }

  onActivate(): void {
    console.log('Activating world camera');
  }

  onDeactivate(): void {
    console.log('Deactivating world camera');
    this.trackingImpl!.endSession()
  }

  public update(dt) {
    this.trackingImpl!.update?.(dt);
  }
}
WL.registerComponent(ARSLAMCamera);

