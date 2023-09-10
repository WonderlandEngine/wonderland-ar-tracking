import {Material, Emitter, ViewComponent} from '@wonderlandengine/api';
import {XR8ExtraPermissions, XR8Provider} from './xr8-provider.js';
import {
    ARSession,
    ImageScanningEvent,
    ImageTrackedEvent,
    TrackingMode,
    VPSMeshFoundEvent,
    VPSWayPointEvent,
} from '@wonderlandengine/ar-tracking';

/**
 * A helper type to determine if a camera wants to enable SLAM tracking
 */
type CanDisableSLAM = {
    enableSLAM: boolean;
};

/**
 * A helper type to determine if a camera wants to use an absolute scale
 */
type CanUseAbsoluteScale = {
    useAbsoluteScale: boolean;
};

/**
 * A helper type to determine if a camera wants to enable VPS tracking
 */
type UsesVPS = {
    usesVPS: boolean;
};

/**
 * Convert XR8ImageScanningEvent to general Wonderland ImageScanningEvent
 */
function toImageScanningEvent(event: XR8ImageScanningEvent): ImageScanningEvent {
    return {
        imageTargets: event.detail.imageTargets.map((target) => {
            return {
                ...target,
                type: target.type.toLowerCase() as ImageScanningEvent['imageTargets'][0]['type'],
            };
        }),
    };
}

/**
 * Convert XR8ImageTrackedEvent to general Wonderland ImageTrackedEvent
 */
function toImageTrackingEvent(event: XR8ImageTrackedEvent): ImageTrackedEvent {
    return {
        ...event.detail,
        type: event.detail.type.toLowerCase() as ImageTrackedEvent['type'],
    };
}

/**
 * 8th Wall tracking implementation that encapsulates
 * - SLAM tracking
 * - Image tracking
 * - VPS tracking
 *
 * Main task - to update the WL ViewComponent pose and projection matrix by the values provided
 * by 8th Wall on every frame and forward tracking related events to any subscribers.
 *
 * It acts as a 8th Wall camera pipeline, so some methods will be called by 8th Wall internally.
 */
export class WorldTracking_XR8 extends TrackingMode {
    /**
     * Required by the `XR8.addCameraPipelineModules`
     */
    readonly name = 'world-tracking-XR8';

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

    /**
     * ARCamera using this tracking mode might want to request some extra permissions
     */
    private _extraPermissions: XR8ExtraPermissions = [];

    readonly onTrackingStatus: Emitter<[event: XR8TrackingStatusEvent]> = new Emitter();

    readonly onImageScanning: Emitter<[event: ImageScanningEvent]> = new Emitter();
    readonly onImageFound: Emitter<[event: ImageTrackedEvent]> = new Emitter();
    readonly onImageUpdate: Emitter<[event: ImageTrackedEvent]> = new Emitter();
    readonly onImageLost: Emitter<[event: ImageTrackedEvent]> = new Emitter();

    readonly onMeshFound: Emitter<[event: VPSMeshFoundEvent]> = new Emitter();

    readonly onWaySpotFound: Emitter<[event: VPSWayPointEvent]> = new Emitter();
    readonly onWaySpotUpdated: Emitter<[event: VPSWayPointEvent]> = new Emitter();
    readonly onWaySpotLost: Emitter<[event: VPSWayPointEvent]> = new Emitter();

    /**
     * Consumed by 8th Wall.
     */
    readonly listeners = [
        {
            event: 'reality.trackingstatus',
            process: (event: XR8TrackingStatusEvent) => {
                this.onTrackingStatus.notify(event);
            },
        },

        //////////////////////////
        //// VPS Image Events ///
        ////////////////////////
        {
            event: 'reality.imagescanning',
            process: (event: XR8ImageScanningEvent) => {
                this.onImageScanning.notify(toImageScanningEvent(event));
            },
        },

        {
            event: 'reality.imagefound',
            process: (event: XR8ImageTrackedEvent) => {
                this.onImageFound.notify(toImageTrackingEvent(event));
            },
        },
        {
            event: 'reality.imageupdated',
            process: (event: XR8ImageTrackedEvent) => {
                this.onImageUpdate.notify(toImageTrackingEvent(event));
            },
        },
        {
            event: 'reality.imagelost',
            process: (event: XR8ImageTrackedEvent) => {
                this.onImageLost.notify(toImageTrackingEvent(event));
            },
        },

        //////////////////////////
        /// VPS Mesh Events /////
        ////////////////////////
        {
            event: 'reality.meshfound',
            process: (event: XR8VPSMeshFoundEvent) => {
                this.onMeshFound.notify(event.detail);
            },
        },

        // Seems like not implemented by xr8 yet
        {
            event: 'reality.meshupdated',
            process: (event: XR8VPSMeshUpdatedEvent) => {},
        },

        /*
            // Seems like not implemented by xr8 yet
            {
                event: 'reality.meshlost', process: (event: XR8VPSMeshLostEvent) => { }
            },
        */

        /*
        // TODO - this indicated that xr8 started looking for the feature points
        // However, I feel this is not really informative event since your app logic
        // will naturally expect that the scanning has started.
        {
            event: 'reality.projectwayspotscanning', process: (event: unknown) => {}
        },
        */

        //////////////////////////
        // VPS Waypoint Events //
        ////////////////////////
        {
            event: 'reality.projectwayspotfound',
            process: (event: XR8VPSWayPointEvent) => {
                this.onWaySpotFound.notify(event.detail);
            },
        },

        {
            event: 'reality.projectwayspotupdated',
            process: (event: XR8VPSWayPointEvent) => {
                this.onWaySpotUpdated.notify(event.detail);
            },
        },

        {
            event: 'reality.projectwayspotlost',
            process: (event: XR8VPSWayPointEvent) => {
                this.onWaySpotLost.notify(event.detail);
            },
        },
    ];

    /**
     * Called by any consuming AR camera.
     * Set's up the cached vars.
     *
     * @param extraPermissions
     */
    init(extraPermissions: XR8ExtraPermissions = []) {
        this._extraPermissions = extraPermissions;

        const input = this.component.object.getComponent('input');
        if (input) {
            input.active = false; // 8th Wall will handle the camera pose
        }

        this._view = this.component.object.getComponent('view')!;

        this.component.object.getRotationWorld(this._cachedPosition);
        this.component.object.getPositionWorld(this._cachedRotation);

        ARSession.getSessionForEngine(this.component.engine).onSessionEnd.add(() => {
            XR8.removeCameraPipelineModules([XR8.XrController.pipelineModule(), this]);
        });
    }

    /**
     * Configures XR8.XrController for the session, sets itself as an XR8 camera
     * pipeline module and tells xr8Provider to start the session.
     *
     * @param params Extra parameters to initialize the 8thwall provider with.
     */
    async startSession(params: {backgroundMaterial?: Material} = {}) {
        const permissions = await (this.provider as XR8Provider).checkPermissions(
            this._extraPermissions
        );
        if (!permissions) {
            return;
        }

        const componentEnablesSLAM = (this.component as Partial<CanDisableSLAM>).enableSLAM;
        const componentUsesAbsoluteScale = (this.component as Partial<CanUseAbsoluteScale>)
            .useAbsoluteScale;
        const componentUsesVPS = !!(this.component as Partial<UsesVPS>).usesVPS;

        XR8.XrController.configure({
            // enableLighting: true,
            disableWorldTracking:
                componentEnablesSLAM === undefined ? false : !componentEnablesSLAM, // invert componentEnablesSLAM
            scale:
                componentUsesAbsoluteScale === undefined
                    ? 'responsive'
                    : componentUsesAbsoluteScale
                    ? 'absolute'
                    : 'responsive',
            enableVps: componentUsesVPS,
        });

        const options = {
            canvas: this.component.engine.canvas as HTMLCanvasElement,
            allowedDevices: XR8.XrConfig.device().MOBILE,
            ownRunLoop: false,
            cameraConfig: {
                direction: XR8.XrConfig.camera().BACK,
            },
            backgroundMaterial: params.backgroundMaterial,
        };
        return this.provider.startSession(options, [
            XR8.XrController.pipelineModule(),
            this,
        ]);
    }

    endSession() {
        this.provider.endSession();
    }

    /**
     * Called by 8th Wall internally when the tracking is about to start.
     * `XR8.XrController.updateCameraProjectionMatrix` is a method to
     * tell 8th Wall what is our initial camera position.
     */
    onAttach = (_params: unknown) => {
        XR8.XrController.updateCameraProjectionMatrix({
            origin: {
                x: this._cachedPosition[0],
                y: this._cachedPosition[1],
                z: this._cachedPosition[2],
            },
            facing: {
                x: this._cachedRotation[0],
                y: this._cachedRotation[1],
                z: this._cachedRotation[2],
                w: this._cachedRotation[3],
            },
            cam: {
                pixelRectWidth: this.component.engine.canvas!.width,
                pixelRectHeight: this.component.engine.canvas!.height,
                nearClipPlane: this._view?.near || 0.01,
                farClipPlane: this._view?.far || 100,
            },
        });
    };

    /**
     * Called by 8th Wall internally.
     * Updates WL cameras projectionMatrix and pose
     *
     * @param e Camera projection matrix and pose provided by 8th Wall
     */
    onUpdate = (e: XR8CameraPipelineModuleUpdateArgs) => {
        const source = e.processCpuResult.reality;
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
