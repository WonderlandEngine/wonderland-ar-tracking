import { ViewComponent } from '@wonderlandengine/api';
import { TrackingMode } from '../trackingMode.js';
import { xr8Provider } from './xr8-provider.js';
import { ARFaceTrackingCamera } from '../../cameras/AR-face-tracking-camera.js';

/**
 * 8th Wall tracking implementation that encapsulates
 * - Face tracking
 * 
 * Main task - to update the WL ViewComponent (aka Camera) pose and projection matrix by the values provided 
 * by 8th Wall on every frame and forward tracking related events to any subscribers.
 * 
 * It acts as a 8th Wall camera pipeline, so some methods will be called by 8th Wall internally.
 */
class FaceTracking_XR8 extends TrackingMode {
    /**
     * Required by the `XR8.addCameraPipelineModules`
     */
    public readonly name = 'face-tracking-XR8';

    /**
     * Cache view component
     */
    private _view?: ViewComponent;

    /**
     * Cache 8th Wall cam position
     */
    private _cachedPosition = [0, 0, 0];

    /**
     * Cache 8th Wall cam rotation
     */
    private _cachedRotation = [0, 0, 0, -1];

    public readonly onFaceScanning: Array<(event: XR8FaceLoadingEvent) => void> = [];
    public readonly onFaceLoading: Array<(event: XR8FaceLoadingEvent) => void> = [];
    public readonly onFaceFound: Array<(event: XR8FaceFoundEvent) => void> = [];
    public readonly onFaceUpdate: Array<(event: XR8FaceFoundEvent) => void> = [];
    public readonly onFaceLost: Array<(event: xr8FaceLostEvent) => void> = [];

    /**
    * Consumed by 8th Wall.
    */
    public readonly listeners = [
        {
            /**
             * Fires when loading begins for additional face AR resources.
             */
            event: 'facecontroller.faceloading',
            process: (event: XR8FaceLoadingEvent) => {
                this.onFaceLoading.forEach((callback) => callback(event));
            },
        },

        {
            /**
             * Fires when all face AR resources have been loaded and scanning has begun.
             */
            event: 'facecontroller.facescanning',
            process: (event: XR8FaceLoadingEvent) => {
                this.onFaceLoading.forEach((callback) => callback(event));
            },
        },

        {
            event: 'facecontroller.facefound',
            process: (event: XR8FaceFoundEvent) => {
                this.onFaceFound.forEach((callback) => callback(event));
            },
        },
        {
            event: 'facecontroller.faceupdated',
            process: (event: XR8FaceFoundEvent) => {
                this.onFaceUpdate.forEach((callback) => callback(event));
            },
        },
        {
            event: 'facecontroller.facelost',
            process: (event: xr8FaceLostEvent) => {
                this.onFaceLost.forEach((callback) => callback(event));
            },
        },
    ];

    /**
    * Called by any consuming AR camera.
    * Set's up the cached vars.
    */
    public init() {
        const input = this.component.object.getComponent('input');
        if (input) {
            input.active = false; // 8th Wall will handle the camera pose
        }

        this._view = this.component.object.getComponent('view')!;

        xr8Provider.onSessionEnded.push(() => {
            XR8.removeCameraPipelineModules([XR8.FaceController.pipelineModule(), this]);
        });
    }

    /**
     * Configures XR8.XrController for the session, 
     * sets itself as an XR8 camera pipeline module 
     * and tells xr8Provider to start the session
     */
    public async startSession() {
        const permissions = await xr8Provider.checkPermissions();

        if (!permissions) {
            return;
        }

        XR8.FaceController.configure({
            meshGeometry: [
                XR8.FaceController.MeshGeometry.FACE,
                XR8.FaceController.MeshGeometry.EYES,
                XR8.FaceController.MeshGeometry.MOUTH,
            ],
            coordinates: { mirroredDisplay: false },
        });

        XR8.addCameraPipelineModules([XR8.FaceController.pipelineModule(), this]);

        const options = {
            canvas: this.component.engine.canvas as HTMLCanvasElement,
            allowedDevices: XR8.XrConfig.device().ANY,
            ownRunLoop: false,
            cameraConfig: {
                direction:
                    ARFaceTrackingCamera.Properties.cameraDirection.values[
                    (this.component as ARFaceTrackingCamera).cameraDirection
                    ],
            },
        };

        xr8Provider.startSession(options);
    }

    public endSession() {
        xr8Provider.endSession();
    }

     /**
     * Called by 8th Wall internally.
     * Updates WL cameras projectionMatrix and pose
     * 
     * @param e Camera projection matrix and pose provided by 8th Wall
     */
    public onUpdate = (e: XR8CameraPipelineModuleUpdateArgs) => {
        const source = e.processCpuResult.facecontroller;

        if (!source) return;

        const { rotation, position, intrinsics } = source;

        this._cachedRotation[0] = rotation.x;
        this._cachedRotation[1] = rotation.y;
        this._cachedRotation[2] = rotation.z;
        this._cachedRotation[3] = rotation.w;

        this._cachedPosition[0] = position.x;
        this._cachedPosition[1] = position.y;
        this._cachedPosition[2] = position.z;

        if (intrinsics) {
            const projectionMatrix = this._view!.projectionMatrix;
            for (let i = 0; i < 16; i++) {
                if (Number.isFinite(intrinsics[i])) {
                    // some processCpuResult.reality.intrinsics are set to Infinity, which WL brakes our projectionMatrix. So we just filter those elements out
                    projectionMatrix[i] = intrinsics[i];
                }
            }
        }

        if (position && rotation) {
            this.component.object.rotationWorld = this._cachedRotation;
            this.component.object.setTranslationWorld(this._cachedPosition);
        }
    };
}

export { FaceTracking_XR8 };
