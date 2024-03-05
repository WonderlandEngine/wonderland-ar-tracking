import {WonderlandEngine, Component, ViewComponent} from '@wonderlandengine/api';
import {
    ARProvider,
    ARSession,
    ITrackingMode,
    TrackingType,
} from '@wonderlandengine/ar-tracking';
import {WorldTracking_Zappar} from './world-tracking-mode-zappar.js';

/**
 * ARProvider implementation for device native WebXR API
 */
export class ZapparProvider extends ARProvider {
    private _xrSession: XRSession | null = null;
    private addOnce: Boolean = true;
    private hasPlaced: Boolean = false;
    private dynamicCanvas: any = null;
    pipeline: any;
    instantTracker: any;

    get xrSession() {
        return this._xrSession;
    }

    static registerTrackingProviderWithARSession(arSession: ARSession) {
        const provider = new ZapparProvider(arSession.engine);
        arSession.registerTrackingProvider(provider);
        return provider;
    }

    private constructor(engine: WonderlandEngine) {
        super(engine);

        // Safeguard that we are not running inside the editor
        if (typeof document === 'undefined') {
            return;
        }

        engine.onXRSessionStart.add((session: XRSession) => {
            this._xrSession = session;
            this.onSessionStart.notify(this);
        });

        engine.onXRSessionEnd.add(() => {
            this.onSessionEnd.notify(this);
        });
    }

    async startSession(webxrRequiredFeatures: string[] = ['local'], pipeline: any) {
        this.pipeline = pipeline;

        await this.loadZapparExternalLib(); // Wait for the Zappar script to be loaded
    }

    loadZapparExternalLib(): Promise<void> {
        // Check if the script element already exists
        const existingScript = document.getElementById('__injected-WLE-zappar');

        if (existingScript) {
            // If script element already exists, no need to create a new one
            console.log('Zappar script is already loaded.');
            this.processCameraPipeline();
            return Promise.resolve();
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
                resolve();
            };
        });
    }
    update() {
        console.log(this.instantTracker, this.pipeline);
    }

    animate(instantTracker: any = this.instantTracker, pipeline: any = this.pipeline) {
        if (!pipeline) return;
        if (!instantTracker) return;

        //console.log('animating..');
        //console.log(instantTracker, pipeline);

        //console.log(this.instantTracker, this.pipeline);
        // Zappar's library uses this function to prepare camera frames for processing
        // Note this function will change some WebGL state (including the viewport), so you must change it back
        pipeline.processGL();

        // gl.viewport(...);

        // This function allows to us to use the tracking data from the most recently processed camera frame
        pipeline.frameUpdate();

        // Draw the camera to the screen - width and height here should be those of your canvas
        pipeline.cameraFrameDrawGL(this.engine.canvas.width, this.engine.canvas.height);

        // Upload the current camera frame to a WebGL texture for us to draw
        pipeline.cameraFrameUploadGL();

        const glTexture = pipeline.cameraFrameTextureGL();
        console.log(pipeline.cameraFrameTextureGL()); //debug why its undefined ?

        //write code to update glTexture to a dynamically created html element
        console.log(pipeline);
        // Create the dynamicCanvas if it doesn't exist
        if (this.dynamicCanvas === undefined || this.dynamicCanvas === null) {
            this.dynamicCanvas = document.createElement('canvas');
            document.body.appendChild(this.dynamicCanvas);
        }

        // Assuming you have a WebGL context for dynamicCanvas
        const dynamicCanvasContext = this.dynamicCanvas.getContext('2d');
        // Update the dynamicCanvas with the WebGL texture
        this.updateDynamicCanvas(dynamicCanvasContext, glTexture);

        if (!this.hasPlaced) instantTracker.setAnchorPoseFromCameraOffset(0, 0, -5);

        let model = pipeline.cameraModel();
        let projectionMatrix = Zappar.projectionMatrixFromCameraModel(
            model,
            this.engine.canvas.width,
            this.engine.canvas.height
        );
        let cameraPoseMatrix = pipeline.cameraPoseDefault();
        let anchorPoseMatrix = instantTracker.anchor.pose(cameraPoseMatrix);
        window.arr = [projectionMatrix, cameraPoseMatrix, anchorPoseMatrix];
        window.pipeline = pipeline._z;

        // Render content using projectionMatrix, cameraPoseMatrix and anchorPoseMatrix

        this.engine.scene.activeViews[0].projectionMatrix.set(projectionMatrix);

        //console.log('this is the view comp ');

        // Ask the browser to call this function again next frame
        //requestAnimationFrame(this.animate);
    }

    updateDynamicCanvas(context, texture) {
        //console.log(this.dynamicCanvas);
        //console.log(texture);
        // Assuming texture.width and texture.height are the dimensions of the WebGL texture
        this.dynamicCanvas.width = texture.width;
        this.dynamicCanvas.height = texture.height;

        // Update the dynamicCanvas content with the WebGL texture
        context.drawImage(texture, 0, 0, texture.width, texture.height);
    }

    processCameraPipeline() {
        console.log('hell0000.... ');
        console.log(this.engine);
        this.pipeline = new Zappar.Pipeline();
        window.ZapparPipeline = this.pipeline;
        this.pipeline.glContextSet(this.engine.canvas.getContext('webgl2'));
        this.createFrameSource(this.pipeline);
    }

    createFrameSource(pipeline) {
        const deviceId = Zappar.cameraDefaultDeviceID();
        const source = new Zappar.CameraSource(pipeline, deviceId);
        //todo call it from within a userguester
        Zappar.permissionRequestUI().then((granted) => {
            if (granted) {
                // User granted the permissions so start the camera
                this.startSource(source, pipeline);
            } else {
                // User denied the permissions so show Zappar's built-in 'permission denied' UI
                Zappar.permissionDeniedUI();
            }
        });
    }

    startSource(source, pipeline) {
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
        source.start();

        let instantTracker = new Zappar.InstantWorldTracker(this.pipeline);
        console.warn('instant Tracker is :::: ');
        console.log(instantTracker);
        window.addEventListener('click', () => {
            this.hasPlaced = true;
        });
        this.instantTracker = instantTracker;

        if (this.addOnce) {
            //this._engine.scene.onPostRender.add(this.animate);
            this.addOnce = false;
        }
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

    async endSession() {
        if (this._xrSession) {
            try {
                await this._xrSession.end();
            } catch {
                // Session was ended for some
            }
            this._xrSession = null;
        }
    }

    async load() {
        this.loaded = true;
        return Promise.resolve();
    }

    /** Whether this provider supports given tracking type */
    supports(type: TrackingType): boolean {
        if (!this.engine.arSupported) return false;
        switch (type) {
            case TrackingType.SLAM:
                return true;
            default:
                return false;
        }
    }

    /** Create a tracking implementation */
    createTracking(type: TrackingType, component: Component): ITrackingMode {
        switch (type) {
            case TrackingType.SLAM:
                return new WorldTracking_Zappar(this, component);
            default:
                throw new Error('Tracking mode ' + type + ' not supported.');
        }
    }
}
