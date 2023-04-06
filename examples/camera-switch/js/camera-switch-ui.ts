/**
 * XR8CameraSwitch
 * Creates several HTML buttons, which, when clicked, activates a corresponding AR tracking camera.
 */

import {Component} from '@wonderlandengine/api';
import {
    ARSession,
    ARFaceTrackingCamera,
    ARImageTrackingCamera,
    ARSLAMCamera,
} from '@wonderlandengine/8thwall-tracking';

export class XR8CameraSwitch extends Component {
    public static TypeName = 'xr8-camera-switch-example';

    private _faceTrackingCamera?: ARFaceTrackingCamera;
    private _imageTrackingCamera?: ARImageTrackingCamera;
    private _worldTrackingCamera?: ARSLAMCamera;

    start() {
        const html = `<div style="position: absolute; top: 0; left: 0; z-index: 999">
      <button style="line-height: 40px" id="XR8CameraSwitch-frontface">Turn on front face camera</button>
      <button style="line-height: 40px" id="XR8CameraSwitch-backface">Turn on back face camera</button>
      <button style="line-height: 40px"id="XR8CameraSwitch-image">Turn on image tracking camera</button>
      <button style="line-height: 40px" id="XR8CameraSwitch-world">Turn on world tracking camera</button>
      <button style="line-height: 40px" id="XR8CameraSwitch-kill">Kill session</button>
    </div>`;

        const container = document.createElement('div');
        container.innerHTML = html;

        document.body.appendChild(container);

        container
            .querySelector('#XR8CameraSwitch-frontface')
            ?.addEventListener('click', this.onFrontFaceCameraSelected);
        container
            .querySelector('#XR8CameraSwitch-backface')
            ?.addEventListener('click', this.onBackFaceCameraSelected);
        container
            .querySelector('#XR8CameraSwitch-image')
            ?.addEventListener('click', this.onImageCameraSelected);
        container
            .querySelector('#XR8CameraSwitch-world')
            ?.addEventListener('click', this.onWorldCameraSelected);
        container.querySelector('#XR8CameraSwitch-kill')?.addEventListener('click', () => {
            ARSession.stopARSession();
        });

        ARSession.onSessionEnded.add(() => {
            this._faceTrackingCamera!.active = false;
            this._imageTrackingCamera!.active = false;
            this._worldTrackingCamera!.active = false;
        });

        this._faceTrackingCamera = this.object.getComponent(ARFaceTrackingCamera)!;
        this._imageTrackingCamera = this.object.getComponent(ARImageTrackingCamera)!;
        this._worldTrackingCamera = this.object.getComponent(ARSLAMCamera)!;
    }

    onFrontFaceCameraSelected = () => {
        this._imageTrackingCamera!.active = false;
        this._worldTrackingCamera!.active = false;

        /**
         * TODO: this is a little bit dumb that we have to stop the camera
         * and restart it with only a change in the parameter.
         *
         * It should be possible just to change the param and seemlesly witch, at least with 8th Wall
         */
        this._faceTrackingCamera!.active = false;
        this._faceTrackingCamera!.cameraDirection = 0;

        this._faceTrackingCamera!.active = true;
        this._faceTrackingCamera!.startSession();
    };

    onBackFaceCameraSelected = () => {
        //this.faceTrackingCamera!.active = false;
        this._imageTrackingCamera!.active = false;
        this._worldTrackingCamera!.active = false;

        /**
         * TODO: this is a little bit dumb that we have to stop the camera
         * and restart it with only a change in the parameter.
         *
         * It should be possible just to change the param and seemlesly witch, at least with 8th Wall
         */
        this._faceTrackingCamera!.active = false;
        this._faceTrackingCamera!.cameraDirection = 1;

        this._faceTrackingCamera!.active = true;
        this._faceTrackingCamera!.startSession();
    };

    onImageCameraSelected = () => {
        this._faceTrackingCamera!.active = false;
        //this.imageTrackingCamera!.active = false;
        this._worldTrackingCamera!.active = false;

        if (!this._imageTrackingCamera!.active) {
            this._imageTrackingCamera!.active = true;
            this._imageTrackingCamera!.startSession();
        }
    };

    onWorldCameraSelected = () => {
        this._faceTrackingCamera!.active = false;
        this._imageTrackingCamera!.active = false;
        //this.worldTrackingCamera!.active = false;

        if (!this._worldTrackingCamera!.active) {
            this._worldTrackingCamera!.active = true;
            this._worldTrackingCamera!.startSession();
        }
    };
}
