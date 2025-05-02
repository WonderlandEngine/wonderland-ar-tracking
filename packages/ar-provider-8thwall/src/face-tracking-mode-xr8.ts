import {Emitter, ViewComponent} from '@wonderlandengine/api';
import {XR8Provider} from './xr8-provider.js';
import {
    ARFaceTrackingCamera,
    FaceAttachmentPoint,
    FaceFoundEvent,
    FaceLoadingEvent,
    FaceLostEvent,
    FaceTrackingMode,
    TrackingMode,
} from '@wonderlandengine/ar-tracking';

const AttachmentPointsMapping: {[value in XR8FaceAttachmentPoints]: FaceAttachmentPoint} = {
    leftCheek: FaceAttachmentPoint.CheekLeft,
    rightCheek: FaceAttachmentPoint.CheekRight,
    chin: FaceAttachmentPoint.Chin,
    leftEar: FaceAttachmentPoint.EarLeft,
    rightEar: FaceAttachmentPoint.EarRight,
    leftEye: FaceAttachmentPoint.EyeLeft,
    leftEyeOuterCorner: FaceAttachmentPoint.EyeOuterCornerLeft,
    rightEyeOuterCorner: FaceAttachmentPoint.EyeOuterCornerRight,
    rightEye: FaceAttachmentPoint.EyeRight,
    leftEyebrowInner: FaceAttachmentPoint.EyeBrowInnerLeft,
    rightEyebrowInner: FaceAttachmentPoint.EyeBrowInnerRight,
    leftEyebrowMiddle: FaceAttachmentPoint.EyeBrowCenterLeft,
    rightEyebrowMiddle: FaceAttachmentPoint.EyeBrowCenterRight,
    leftEyebrowOuter: FaceAttachmentPoint.EyeBrowOuterLeft,
    rightEyebrowOuter: FaceAttachmentPoint.EyeBrowOuterRight,
    forehead: FaceAttachmentPoint.Forehead,
    lowerLip: FaceAttachmentPoint.LowerLip,
    mouth: FaceAttachmentPoint.Mouth,
    mouthLeftCorner: FaceAttachmentPoint.MouthCornerLeft,
    mouthRightCorner: FaceAttachmentPoint.MouthCornerRight,
    noseBridge: FaceAttachmentPoint.NoseBridge,
    noseTip: FaceAttachmentPoint.NoseTip,
    upperLip: FaceAttachmentPoint.UpperLip,
};

/**
 * Convert XR8 face lost event to general Wonderland face lost event
 */
function toFaceFoundEvent(event: XR8FaceFoundEvent): FaceFoundEvent {
    const attachmentPoints: {
        [value in FaceAttachmentPoint]?: {
            position: {x: number; y: number; z: number};
        };
    } = Object.fromEntries(
        Object.entries(event.detail.attachmentPoints).map((v) => {
            const remapped = AttachmentPointsMapping[v[0] as XR8FaceAttachmentPoints];
            return [remapped, v[1]];
        })
    );

    const d = event.detail;
    // @ts-ignore
    d.attachmentPoints = attachmentPoints;
    // @ts-ignore
    return d as FaceFoundEvent;
}

/**
 * 8th Wall tracking implementation that encapsulates
 * - Face tracking
 *
 * Main task - to update the WL ViewComponent (aka Camera) pose and projection matrix by the values provided
 * by 8th Wall on every frame and forward tracking related events to any subscribers.
 *
 * It acts as a 8th Wall camera pipeline, so some methods will be called by 8th Wall internally.
 */
export class FaceTracking_XR8 extends TrackingMode implements FaceTrackingMode {
    /* Required by the `XR8.addCameraPipelineModules` */
    readonly name = 'face-tracking-XR8';

    /* Cache view component */
    private _view?: ViewComponent;

    /* Cache 8th Wall cam position */
    private _cachedPosition = [0, 0, 0];

    /* Cache 8th Wall cam rotation */
    private _cachedRotation = [0, 0, 0, -1];

    readonly onFaceScanning: Emitter<[event: FaceLoadingEvent]> = new Emitter<
        [event: FaceLoadingEvent]
    >();
    readonly onFaceLoading: Emitter<[event: FaceLoadingEvent]> = new Emitter<
        [event: FaceLoadingEvent]
    >();
    readonly onFaceFound: Emitter<[event: FaceFoundEvent]> = new Emitter<
        [event: FaceFoundEvent]
    >();
    readonly onFaceUpdate: Emitter<[event: FaceFoundEvent]> = new Emitter<
        [event: FaceFoundEvent]
    >();
    readonly onFaceLost: Emitter<[event: FaceLostEvent]> = new Emitter<
        [event: FaceLostEvent]
    >();

    /** Consumed by 8th Wall. */
    readonly listeners = [
        {
            /**
             * Fires when loading begins for additional face AR resources.
             */
            event: 'facecontroller.faceloading',
            process: (event: XR8FaceLoadingEvent) => {
                this.onFaceLoading.notify(event.detail);
            },
        },

        {
            /**
             * Fires when all face AR resources have been loaded and scanning has begun.
             */
            event: 'facecontroller.facescanning',
            process: (event: XR8FaceLoadingEvent) => {
                this.onFaceLoading.notify(event.detail);
            },
        },

        {
            event: 'facecontroller.facefound',
            process: (event: XR8FaceFoundEvent) => {
                this.onFaceFound.notify(toFaceFoundEvent(event));
            },
        },
        {
            event: 'facecontroller.faceupdated',
            process: (event: XR8FaceFoundEvent) => {
                this.onFaceUpdate.notify(toFaceFoundEvent(event));
            },
        },
        {
            event: 'facecontroller.facelost',
            process: (event: XR8FaceLostEvent) => {
                this.onFaceLost.notify(event.detail);
            },
        },
    ];

    /**
     * Called by any consuming AR camera.
     * Set's up the cached vars.
     */
    init() {
        const input = this.component.object.getComponent('input');
        if (input) {
            input.active = false; // 8th Wall will handle the camera pose
        }

        this._view = this.component.object.getComponent('view')!;

        this.provider.onSessionEnd.add(() => {
            XR8.removeCameraPipelineModules([XR8.FaceController.pipelineModule(), this]);
        });
    }

    /**
     * Configures XR8.XrController for the session,
     * sets itself as an XR8 camera pipeline module
     * and tells xr8Provider to start the session
     */
    async startSession() {
        const permissions = await (this.provider as XR8Provider).checkPermissions();

        if (!permissions) {
            return;
        }

        XR8.FaceController.configure({
            meshGeometry: [
                XR8.FaceController.MeshGeometry.FACE,
                XR8.FaceController.MeshGeometry.EYES,
                XR8.FaceController.MeshGeometry.MOUTH,
            ],
            coordinates: {mirroredDisplay: false},
        });

        // XR8.addCameraPipelineModules([XR8.FaceController.pipelineModule(), this]);

        const options = {
            canvas: this.component.engine.canvas as HTMLCanvasElement,
            allowedDevices: XR8.XrConfig.device().ANY,
            ownRunLoop: false,
            cameraConfig: {
                direction: ARFaceTrackingCamera.Properties.cameraDirection.values![
                    (this.component as ARFaceTrackingCamera).cameraDirection
                ] as XR8CameraDirection[keyof XR8CameraDirection],
            },
        };

        //xr8Provider.startSession(options);
        return this.provider.startSession(options, [
            XR8.FaceController.pipelineModule(),
            this,
        ]);
    }

    endSession() {
        this.provider.endSession();
    }

    /**
     * Called by 8th Wall internally.
     * Updates WL cameras projectionMatrix and pose
     *
     * @param e Camera projection matrix and pose provided by 8th Wall
     */
    onUpdate = (e: XR8CameraPipelineModuleUpdateArgs) => {
        const source = e.processCpuResult.facecontroller;

        if (!source) return;

        const {rotation, position, intrinsics} = source;

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
            this.component.object.setRotationWorld(this._cachedRotation);
            this.component.object.setPositionWorld(this._cachedPosition);
        }
    };
}
