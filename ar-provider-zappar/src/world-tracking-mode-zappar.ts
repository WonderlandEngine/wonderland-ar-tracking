import {TrackingMode} from '@wonderlandengine/ar-tracking';

/**
 * Implementation of SLAM (World Tracking) based on the WebXR Device API
 *
 * Depends on WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES global variables.
 *
 * TODO: change this when it's moved to auto constants.
 */

export class WorldTracking_Zappar extends TrackingMode {
    private pipeline: any;

    startSession() {
        this.loadZapparExternalLib();
        this.provider.startSession(window.WEBXR_REQUIRED_FEATURES, this.pipeline);
    }

    endSession(): void {
        this.provider.endSession();
    }

    loadZapparExternalLib() {
        const s = document.createElement('script');
        s.id = '__injected-WLE-zappar';
        s.crossOrigin = 'anonymous';
        s.src = 'https://libs.zappar.com/zappar-js/2.2.4/zappar.js';
        document.body.appendChild(s);
        s.onload = () => {
            console.log(window.Zappar);
            this.processCameraPipeline();
        };
    }

    processCameraPipeline() {
        this.pipeline = new Zappar.Pipeline();
        this.pipeline.glContextSet(this._engine.canvas.getContext('webgl2'));
        this.createFrameSource(this.pipeline);
    }

    createFrameSource(pipeline) {
        const deviceId = Zappar.cameraDefaultDeviceID();
        const source = new Zappar.CameraSource(pipeline, deviceId);
        //todo call it from within a userguester
        Zappar.permissionRequestUI().then((granted) => {
            if (granted) {
                // User granted the permissions so start the camera
                this.startSource(source);
            } else {
                // User denied the permissions so show Zappar's built-in 'permission denied' UI
                Zappar.permissionDeniedUI();
            }
        });
    }

    startSource(source) {
        source.start();

        document.addEventListener('visibilitychange', () => {
            switch (document.visibilityState) {
                case 'hidden':
                    source.pause();
                    break;
                case 'visible':
                    source.start();
                    break;
            }
        });
        this._engine.scene.onPreRender.add(this.onWLPreRender);
    }

    onWLPreRender() {
        if (!this.pipeline) return;
        this.pipeline.processGL();
        this.pipeline.frameUpdate();
        this.pipeline.cameraFrameUploadGL();

        const gl = this._engine.canvas.getContext('webgl2');
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(null);
        gl.activeTexture(gl.TEXTURE0);

        this.pipeline.cameraFrameDrawGL(1080, 720, true);
    }
}
