import { Component } from '@wonderlandengine/api';
import ARSession from '../AR/AR-session';
import ARFaceTrackingCamera from '../AR/cameras/AR-face-tracking-camera';
import ARImageTrackingCamera from '../AR/cameras/AR-image-tracking-camera';
import ARSLAMCamera from '../AR/cameras/AR-SLAM-camera';


class XR8CameraSwitch extends Component {
  public static TypeName = 'xr8-camera-switch-example';
  public static Properties = {
  };

  private faceTrackingCamera?: ARFaceTrackingCamera
  private imageTrackingCamera?: ARImageTrackingCamera
  private worldTrackingCamera?: ARSLAMCamera;

  start() {
    const html = `<div style="position: absolute; top: 0; left: 0; z-index: 999">
      <button style="line-height: 40px" id="XR8CameraSwitch-face">Turn on face camera</button>
      <button style="line-height: 40px"id="XR8CameraSwitch-image">Turn on image tracking camera</button>
      <button style="line-height: 40px" id="XR8CameraSwitch-world">Turn on world tracking camera</button>
      <button style="line-height: 40px" id="XR8CameraSwitch-kill">Kill session</button>
    </div>`

    const container = document.createElement("div");
    container.innerHTML = html;

    document.body.appendChild(container);

    container.querySelector('#XR8CameraSwitch-face')?.addEventListener('click', this.onFaceCameraSelected);
    container.querySelector('#XR8CameraSwitch-image')?.addEventListener('click', this.onImageCameraSelected);
    container.querySelector('#XR8CameraSwitch-world')?.addEventListener('click', this.onWorldCameraSelected);
    container.querySelector('#XR8CameraSwitch-kill')?.addEventListener('click', () => {
      console.log("clicked on the kill")
      ARSession.stopARSession();
    });

    this.faceTrackingCamera = this.object.getComponent(ARFaceTrackingCamera)!;
    this.imageTrackingCamera = this.object.getComponent(ARImageTrackingCamera)!;
    this.worldTrackingCamera = this.object.getComponent(ARSLAMCamera)!;
  }

  onFaceCameraSelected = () => {
    //this.faceTrackingCamera!.active = false;
    this.imageTrackingCamera!.active = false;
    this.worldTrackingCamera!.active = false;

    if(!this.faceTrackingCamera!.active) {
      this.faceTrackingCamera!.active = true;
      this.faceTrackingCamera!.startARSession();
    }
  }

  onImageCameraSelected = () => {
    this.faceTrackingCamera!.active = false;
    //this.imageTrackingCamera!.active = false;
    this.worldTrackingCamera!.active = false;

    if(!this.imageTrackingCamera!.active) {
      this.imageTrackingCamera!.active = true;
      this.imageTrackingCamera!.startARSession();
    }
  }

  onWorldCameraSelected = () => { 
    this.faceTrackingCamera!.active = false;
    this.imageTrackingCamera!.active = false;
    //this.worldTrackingCamera!.active = false;

    if(!this.worldTrackingCamera!.active) {
      this.worldTrackingCamera!.active = true;
      this.worldTrackingCamera!.startARSession();
    }
  }
}

WL.registerComponent(XR8CameraSwitch);