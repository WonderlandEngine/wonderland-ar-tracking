import {Emitter, ViewComponent} from '@wonderlandengine/api';
import {TrackingMode} from '../trackingMode.js';
import {xr8Provider, XR8ExtraPermissions} from './xr8-provider.js';

/**
 * A helper type to determine if a camera wants to enable SLAM tracking
 */
type CanDisableSLAM = {
    EnableSLAM: boolean;
};

/**
 * A helper type to determine if a camera wants to use an absolute scale
 */
type CanUseAbsoluteScale = {
    UseAbsoluteScale: boolean;
};

/**
 * A helper type to determine if a camera wants to enable VPS tracking
 */
type UsesVPS = {
    usesVPS: boolean;
};

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
class WorldTracking_XR8 extends TrackingMode {
    /**
     * Required by the `XR8.addCameraPipelineModules`
     */
    public readonly name = 'world-tracking-XR8';

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

    public readonly onTrackingStatus: Emitter<[event: XR8TrackingStatusEvent]> =
        new Emitter();

    public readonly onImageScanning: Emitter<[event: XR8ImageScanningEvent]> =
        new Emitter();
    public readonly onImageFound: Emitter<[event: XR8ImageTrackedEvent]> = new Emitter();
    public readonly onImageUpdate: Emitter<[event: XR8ImageTrackedEvent]> = new Emitter();
    public readonly onImageLost: Emitter<[event: XR8ImageTrackedEvent]> = new Emitter();

    public readonly onMeshFound: Emitter<[event: XR8VPSMeshFoundEvent]> = new Emitter();

    public readonly onWaySpotFound: Emitter<[event: XR8VPSWayPointEvent]> = new Emitter();
    public readonly onWaySpotUpdated: Emitter<[event: XR8VPSWayPointEvent]> = new Emitter();
    public readonly onWaySpotLost: Emitter<[event: XR8VPSWayPointEvent]> = new Emitter();

    /**
     * Consumed by 8th Wall.
     */
    public readonly listeners = [
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
                this.onImageScanning.notify(event);
            },
        },

        {
            event: 'reality.imagefound',
            process: (event: XR8ImageTrackedEvent) => {
                this.onImageFound.notify(event);
            },
        },
        {
            event: 'reality.imageupdated',
            process: (event: XR8ImageTrackedEvent) => {
                this.onImageUpdate.notify(event);
            },
        },
        {
            event: 'reality.imagelost',
            process: (event: XR8ImageTrackedEvent) => {
                this.onImageLost.notify(event);
            },
        },

        //////////////////////////
        /// VPS Mesh Events /////
        ////////////////////////
        {
            event: 'reality.meshfound',
            process: (event: XR8VPSMeshFoundEvent) => {
                this.onMeshFound.notify(event);
            },
        },

        // Seems like not implemented by xr8 yet
        {
            event: 'reality.meshupdated',
            process: (event: XR8VPSMeshUpdatedEvent) => {
                //console.log("Mesh is updated");
            },
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
                this.onWaySpotFound.notify(event);
            },
        },

        {
            event: 'reality.projectwayspotupdated',
            process: (event: XR8VPSWayPointEvent) => {
                this.onWaySpotUpdated.notify(event);
            },
        },

        {
            event: 'reality.projectwayspotlost',
            process: (event: XR8VPSWayPointEvent) => {
                this.onWaySpotLost.notify(event);
            },
        },
    ];

    /**
     * Called by any consuming AR camera.
     * Set's up the cached vars.
     *
     * @param extraPermissions
     */
    public init(extraPermissions: XR8ExtraPermissions = []) {
        this._extraPermissions = extraPermissions;

        const input = this.component.object.getComponent('input');
        if (input) {
            input.active = false; // 8th Wall will handle the camera pose
        }

        this._view = this.component.object.getComponent('view')!;

        const rot = this.component.object.rotationWorld;
        const pos = this.component.object.getTranslationWorld([]);

        this._cachedPosition[0] = pos[0];
        this._cachedPosition[1] = pos[1];
        this._cachedPosition[2] = pos[2];

        this._cachedRotation[0] = rot[0];
        this._cachedRotation[1] = rot[1];
        this._cachedRotation[2] = rot[2];
        this._cachedRotation[3] = rot[3];

        xr8Provider.onSessionEnded.add(() => {
            XR8.removeCameraPipelineModules([XR8.XrController.pipelineModule(), this]);
        });
    }

    /**
     * Configures XR8.XrController for the session,
     * sets itself as an XR8 camera pipeline module
     * and tells xr8Provider to start the session
     */
    public async startSession() {
        const permissions = await xr8Provider.checkPermissions(this._extraPermissions);
        if (!permissions) {
            return;
        }

        const componentEnablesSLAM = (this.component as Partial<CanDisableSLAM>).EnableSLAM;
        const componentUsesAbsoluteScale = (this.component as Partial<CanUseAbsoluteScale>)
            .UseAbsoluteScale;
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

        XR8.addCameraPipelineModules([XR8.XrController.pipelineModule(), this]);

        const options = {
            canvas: this.component.engine.canvas as HTMLCanvasElement,
            allowedDevices: XR8.XrConfig.device().MOBILE,
            ownRunLoop: false,
            cameraConfig: {
                direction: XR8.XrConfig.camera().BACK,
            },
        };
        xr8Provider.startSession(options);
    }

    public endSession() {
        xr8Provider.endSession();
    }

    /**
     * Called by 8th Wall internally when the tracking is about to start.
     * `XR8.XrController.updateCameraProjectionMatrix` is a method to
     * tell 8th Wall what is our initial camera position.
     */
    public onAttach = (_params: unknown) => {
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
                nearClipPlane: 0.01,
                farClipPlane: 100,
            },
        });
    };

    /**
     * Called by 8th Wall internally.
     * Updates WL cameras projectionMatrix and pose
     *
     * @param e Camera projection matrix and pose provided by 8th Wall
     */
    public onUpdate = (e: XR8CameraPipelineModuleUpdateArgs) => {
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
            this.component.object.rotationWorld = this._cachedRotation;
            this.component.object.setTranslationWorld(this._cachedPosition);
        }
    };
}

export {WorldTracking_XR8};
