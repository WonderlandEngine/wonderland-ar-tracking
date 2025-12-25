import {Emitter, ViewComponent} from '@wonderlandengine/api';
import {
    ImageScanningEvent,
    ImageTrackedEvent,
    ImageTrackingMode,
    TrackingMode,
} from '@wonderlandengine/ar-tracking';
import type {ZapparNamespace} from './zappar-module.js';
import type {ImageAnchor, ImageTracker} from '@zappar/zappar';
import {mat4, quat, vec3} from 'gl-matrix';
import {ZapparProvider} from './zappar-provider.js';

export class ImageTracking_Zappar extends TrackingMode implements ImageTrackingMode {
    private _zappar: ZapparNamespace | null = null;
    private _view?: ViewComponent;
    private _imageTracker?: ImageTracker;
    private _resourcesReady = false;
    private _resourcesPromise: Promise<void> | null = null;
    private _targetsSubscriptionAdded = false;

    private readonly _cameraMatrix = mat4.create();
    private readonly _cameraPosition = vec3.create();
    private readonly _cameraRotation = quat.create();
    private readonly _cameraScale = vec3.create();

    private readonly _scratchMatrix = mat4.create();
    private readonly _scratchPosition = vec3.create();
    private readonly _scratchRotation = quat.create();
    private readonly _scratchScale = vec3.create();

    private readonly _lastAnchorEvents = new Map<string, ImageTrackedEvent>();

    readonly onImageScanning: Emitter<[event: ImageScanningEvent]> = new Emitter();
    readonly onImageFound: Emitter<[event: ImageTrackedEvent]> = new Emitter();
    readonly onImageUpdate: Emitter<[event: ImageTrackedEvent]> = new Emitter();
    readonly onImageLost: Emitter<[event: ImageTrackedEvent]> = new Emitter();

    init(): void {
        this._view = this.component.object.getComponent('view') ?? undefined;

        const input = this.component.object.getComponent('input');
        if (input) {
            input.active = false;
        }

        if (!this._resourcesPromise) {
            this._resourcesPromise = this._prepareResources();
        }
    }

    startSession(): void {
        void (this.provider as ZapparProvider).startSession();
    }

    endSession(): void {
        (this.provider as ZapparProvider).endSession();
    }

    update(): void {
        if (!this._resourcesReady || !this._imageTracker) {
            return;
        }

        const Zappar = this._zappar;
        if (!Zappar) return;

        const provider = this.provider as ZapparProvider;
        const pipeline = provider.getPipeline();

        const projectionMatrix = Zappar.projectionMatrixFromCameraModel(
            pipeline.cameraModel(),
            this.component.engine.canvas.width,
            this.component.engine.canvas.height
        );

        if (this._view) {
            this._view.projectionMatrix.set(projectionMatrix);
        }

        const cameraPose = pipeline.cameraPoseDefault();
        this._applyCameraPose(cameraPose);

        for (const anchor of this._imageTracker.visible) {
            const event = this._buildImageEvent(anchor);
            this.onImageUpdate.notify(event);
        }
    }

    private async _prepareResources() {
        const provider = this.provider as ZapparProvider;
        this._zappar = await provider.ensureZapparNamespace();
        this._imageTracker = provider.ensureImageTracker();

        if (!this._targetsSubscriptionAdded) {
            provider.onImageTargetsChanged.add(this._handleTargetsChanged);
            this._targetsSubscriptionAdded = true;
        }

        this._imageTracker.onVisible.bind(this._handleAnchorVisible);
        this._imageTracker.onNotVisible.bind(this._handleAnchorNotVisible);

        this._emitScanningEvent();
        this._resourcesReady = true;
    }

    private _handleTargetsChanged = () => {
        if (!this._resourcesReady) {
            return;
        }
        this._emitScanningEvent();
    };

    private _emitScanningEvent() {
        const provider = this.provider as ZapparProvider;
        const event = provider.getImageScanningEvent();
        if (event.imageTargets.length > 0) {
            this.onImageScanning.notify(event);
        }
    }

    private _handleAnchorVisible = (anchor: ImageAnchor) => {
        if (!this._resourcesReady) {
            return;
        }
        const event = this._buildImageEvent(anchor);
        this.onImageFound.notify(event);
    };

    private _handleAnchorNotVisible = (anchor: ImageAnchor) => {
        const last = this._lastAnchorEvents.get(anchor.id);
        if (!last) {
            this.onImageLost.notify({
                name: anchor.id,
                position: {x: 0, y: 0, z: 0},
                rotation: {x: 0, y: 0, z: 0, w: 1},
                scale: 1,
                scaleWidth: 1,
                scaledHeight: 1,
                type: 'flat',
            });
            this._lastAnchorEvents.delete(anchor.id);
            return;
        }

        this.onImageLost.notify(last);
        this._lastAnchorEvents.delete(anchor.id);
    };

    private _buildImageEvent(anchor: ImageAnchor): ImageTrackedEvent {
        const provider = this.provider as ZapparProvider;
        const pipeline = provider.getPipeline();
        const cameraPose = pipeline.cameraPoseDefault();
        const anchorPose = anchor.pose(cameraPose, false);

        mat4.copy(this._scratchMatrix, anchorPose);
        mat4.getTranslation(this._scratchPosition, this._scratchMatrix);
        mat4.getRotation(this._scratchRotation, this._scratchMatrix);
        mat4.getScaling(this._scratchScale, this._scratchMatrix);

        const scale =
            (this._scratchScale[0] + this._scratchScale[1] + this._scratchScale[2]) / 3;

        const descriptor = this._guessDescriptor(anchor);
        const geometry = descriptor?.geometry;

        const event: ImageTrackedEvent = {
            name: descriptor?.name ?? anchor.id,
            position: {
                x: this._scratchPosition[0],
                y: this._scratchPosition[1],
                z: this._scratchPosition[2],
            },
            rotation: {
                x: this._scratchRotation[0],
                y: this._scratchRotation[1],
                z: this._scratchRotation[2],
                w: this._scratchRotation[3],
            },
            scale,
            scaleWidth: geometry?.scaleWidth ?? scale,
            scaledHeight: geometry?.scaledHeight ?? scale,
            type: descriptor?.type ?? 'flat',
            height: geometry?.height,
            radiusTop: geometry?.radiusTop,
            radiusBottom: geometry?.radiusBottom,
            arcStartRadians: geometry?.arcStartRadians,
            arcLengthRadians: geometry?.arcLengthRadians,
        };

        this._lastAnchorEvents.set(anchor.id, event);
        return event;
    }

    private _guessDescriptor(anchor: ImageAnchor) {
        const provider = this.provider as ZapparProvider;
        const descriptors = provider.getImageTargetDescriptors();

        if (descriptors.length === 0) {
            return undefined;
        }

        const direct = descriptors.find((descriptor) => descriptor.name === anchor.id);
        if (direct) {
            return direct;
        }

        const numeric = Number.parseInt(anchor.id, 10);
        if (!Number.isNaN(numeric) && descriptors[numeric]) {
            return descriptors[numeric];
        }

        return descriptors[0];
    }

    private _applyCameraPose(matrix: Float32Array) {
        mat4.copy(this._cameraMatrix, matrix);
        mat4.getTranslation(this._cameraPosition, this._cameraMatrix);
        mat4.getRotation(this._cameraRotation, this._cameraMatrix);
        mat4.getScaling(this._cameraScale, this._cameraMatrix);

        this.component.object.setPositionWorld(this._cameraPosition);
        this.component.object.setRotationWorld(this._cameraRotation);
    }
}
