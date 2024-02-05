import {WonderlandEngine, Component} from '@wonderlandengine/api';
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
export class WebXRProvider extends ARProvider {
    private _xrSession: XRSession | null = null;
    get xrSession() {
        return this._xrSession;
    }

    static registerTrackingProviderWithARSession(arSession: ARSession) {
        const provider = new WebXRProvider(arSession.engine);
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
        // this._engine.requestXRSession(
        //     'immersive-ar',
        //     webxrRequiredFeatures,
        //     webxrOptionalFeatures
        // );
        //run world tracking with given parameters

        // Not shown - initialization, camera setup & permissions

        let instantTracker = new Zappar.InstantWorldTracker(pipeline);

        let hasPlaced = false;

        window.addEventListener('click', () => {
            hasPlaced = true;
        });

        // Ask the browser to call this function again next frame
        //requestAnimationFrame(animate);

        // Zappar's library uses this function to prepare camera frames for processing
        // Note this function will change some WebGL state (including the viewport), so you must change it back
        pipeline.processGL();

        // gl.viewport(...);

        // This function allows to us to use the tracking data from the most recently processed camera frame
        pipeline.frameUpdate();

        // Upload the current camera frame to a WebGL texture for us to draw
        pipeline.cameraFrameUploadGL();

        // Draw the camera to the screen - width and height here should be those of your canvas
        pipeline.cameraFrameDrawGL(this.engine.canvas.width, this.engine.canvas.height);

        if (!hasPlaced) instantTracker.setAnchorPoseFromCameraOffset(0, 0, -5);

        let model = pipeline.cameraModel();
        let projectionMatrix = Zappar.projectionMatrixFromCameraModel(
            model,
            this.engine.canvas.width,
            this.engine.canvas.height
        );
        let cameraPoseMatrix = pipeline.cameraPoseDefault();
        let anchorPoseMatrix = instantTracker.anchor.pose(cameraPoseMatrix);

        // Render content using projectionMatrix, cameraPoseMatrix and anchorPoseMatrix
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
