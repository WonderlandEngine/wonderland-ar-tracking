/**
 * Visual Positioning System Camera.
 * Currently works only using 8thwall Lightship VPS system. (https://www.8thwall.com/docs/web/#lightship-vps)
 * 
 * WLE 20230215 - for this camera to run correctly,
 * clear the "Project Settings/Editor/serverCOEP" field.
 * Warning - it will disable the WASM thread support.
 */
import { ARSession } from '../AR-session';

import { Component } from '@wonderlandengine/api';

import XR8Provider from '../frameworks/xr8/xr8-provider';
import WorldTracking_XR8 from '../frameworks/xr8/world-tracking-mode-xr8';
import { ARCamera } from './AR-Camera';


ARSession.registerTrackingProvider(XR8Provider);

const WLEComponentTypeName = 'AR-VPS-camera';

class ARVPSCamera extends ARCamera {

  public static TypeName = WLEComponentTypeName;
  public static Properties = {

  };

  // WorldTracking_XR8 will check this
  public readonly UsesVPS = true;

  private trackingImpl = new WorldTracking_XR8(this);

  public get onWaySpotFound() {
    return this.trackingImpl.onWaySpotFound;

  }
  public get onWaySpotUpdated() {
    return this.trackingImpl.onWaySpotUpdated;
  }

  public get onWaySpotLost() {
    return this.trackingImpl.onWaySpotLost;
  }

  public get onMeshFound() {
    return this.trackingImpl.onMeshFound;
  }

  public start() {
    this.trackingImpl.init(["location"]);
    ARSession.onARSessionRequested.push(this.startSession);
  }

  startSession = async () => {
    if (this.active) {
      this.trackingImpl.startSession();
    }
  }

  endSession = async () => {
    if (this.active) {
      this.trackingImpl!.endSession();
    }
  }

  onDeactivate(): void {
    this.trackingImpl.endSession();
  }
}

WL.registerComponent(ARVPSCamera);

export { ARVPSCamera };

