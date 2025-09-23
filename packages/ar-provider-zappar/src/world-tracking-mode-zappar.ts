/// <reference path="./types/global.d.ts" />

import {ZapparProvider} from './zappar-provider.js';
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

    endSession(): void {
        (this.provider as ZapparProvider).endSession();
    }
    async startSession(): Promise<void> {
        await this.loadZapparExternalLib();
        return (this.provider as ZapparProvider).startSession(
            window.WEBXR_REQUIRED_FEATURES,
            this.pipeline
        );
    }

    update(): void {
        (this.provider as ZapparProvider).animate();
    }

    loadZapparExternalLib(): Promise<void> {
        // Check if the script element already exists
        const existingScript = document.getElementById('__injected-WLE-zappar');

        if (existingScript) {
            // If script element already exists, no need to create a new one
            console.log('Zappar script is already loaded.');
            this.processCameraPipeline();
            return Promise.resolve(); // Resolve the promise immediately
        }

        // If script element does not exist, create a new one
        const s = document.createElement('script');
        s.id = '__injected-WLE-zappar';
        s.crossOrigin = 'anonymous';
        s.src = 'https://libs.zappar.com/zappar-js/2.2.4/zappar.js';
        document.body.appendChild(s);

        // Return a promise that resolves when Zappar is loaded
        return new Promise<void>((resolve) => {
            s.onload = () => {
                console.log(window.Zappar);
                this.processCameraPipeline();
                resolve(); // Resolve the promise
            };
        });
    }

    processCameraPipeline(): void {
        console.log('hell0000.... ');
        console.log(this.component.engine);
        this.pipeline = new Zappar.Pipeline();
        const gl = this.component.engine.canvas.getContext('webgl2');
        if (!gl) return;
        this.pipeline.glContextSet(gl);
        this.createFrameSource(this.pipeline);
    }

    createFrameSource(pipeline: any): void {
        const deviceId = Zappar.cameraDefaultDeviceID();
        const source = new Zappar.CameraSource(pipeline, deviceId);
        //todo call it from within a userguester
        Zappar.permissionRequestUI().then((granted: boolean) => {
            if (granted) {
                // User granted the permissions so start the camera
                this.startSource(source);
            } else {
                // User denied the permissions so show Zappar's built-in 'permission denied' UI
                Zappar.permissionDeniedUI();
            }
        });
    }

    startSource(source: any): void {
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
        this.component.engine.scene.onPreRender.add(this.onWLPreRender);
    }

    private onWLPreRender = () => {
        if (!this.pipeline) return;
        this.pipeline.processGL();
        this.pipeline.frameUpdate();
        this.pipeline.cameraFrameUploadGL();

        const gl = this.component.engine.canvas.getContext('webgl2');
        if (!gl) return;
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(null);
        gl.activeTexture(gl.TEXTURE0);

        this.pipeline.cameraFrameDrawGL(1080, 720, true);
    };
}
