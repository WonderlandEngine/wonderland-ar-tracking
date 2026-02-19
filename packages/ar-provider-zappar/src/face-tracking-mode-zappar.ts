import {Emitter, ViewComponent} from '@wonderlandengine/api';
import {
    ARFaceTrackingCamera,
    FaceAttachmentPoint,
    FaceFoundEvent,
    FaceLoadingEvent,
    FaceLostEvent,
    FaceTrackingMode,
    TrackingMode,
} from '@wonderlandengine/ar-tracking';
import type {ZapparNamespace} from './zappar-module.js';
import type {
    FaceAnchor,
    FaceLandmark,
    FaceLandmarkName,
    FaceMesh,
    FaceTracker,
} from '@zappar/zappar';
import {mat4, quat, vec3} from 'gl-matrix';
import type {ZapparProvider} from './zappar-provider.js';

type AttachmentMapping = Partial<Record<FaceAttachmentPoint, string>>;

export const AttachmentLandmarkKeys: AttachmentMapping = {
    [FaceAttachmentPoint.Forehead]: 'NOSE_BRIDGE',
    [FaceAttachmentPoint.EyeOuterCornerLeft]: 'EYE_LEFT',
    [FaceAttachmentPoint.EyeOuterCornerRight]: 'EYE_RIGHT',
    [FaceAttachmentPoint.EyeLeft]: 'EYE_LEFT',
    [FaceAttachmentPoint.EyeRight]: 'EYE_RIGHT',
    [FaceAttachmentPoint.EyeBrowCenterLeft]: 'EYEBROW_LEFT',
    [FaceAttachmentPoint.EyeBrowCenterRight]: 'EYEBROW_RIGHT',
    [FaceAttachmentPoint.EyeBrowInnerLeft]: 'EYEBROW_LEFT',
    [FaceAttachmentPoint.EyeBrowInnerRight]: 'EYEBROW_RIGHT',
    [FaceAttachmentPoint.EyeBrowOuterLeft]: 'EYEBROW_LEFT',
    [FaceAttachmentPoint.EyeBrowOuterRight]: 'EYEBROW_RIGHT',
    [FaceAttachmentPoint.EarLeft]: 'EAR_LEFT',
    [FaceAttachmentPoint.EarRight]: 'EAR_RIGHT',
    [FaceAttachmentPoint.NoseBridge]: 'NOSE_BRIDGE',
    [FaceAttachmentPoint.NoseTip]: 'NOSE_TIP',
    [FaceAttachmentPoint.CheekLeft]: 'EAR_LEFT',
    [FaceAttachmentPoint.CheekRight]: 'EAR_RIGHT',
    [FaceAttachmentPoint.Mouth]: 'MOUTH_CENTER',
    [FaceAttachmentPoint.MouthCornerLeft]: 'MOUTH_CENTER',
    [FaceAttachmentPoint.MouthCornerRight]: 'MOUTH_CENTER',
    [FaceAttachmentPoint.UpperLip]: 'LIP_TOP',
    [FaceAttachmentPoint.LowerLip]: 'LIP_BOTTOM',
    [FaceAttachmentPoint.Chin]: 'CHIN',
};

const AttachmentList = Object.values(FaceAttachmentPoint) as FaceAttachmentPoint[];
const FACE_LOCAL_Y_180 = quat.fromValues(0, 1, 0, 0);

function convertFaceLocalVectorToProviderSpace(x: number, y: number, z: number) {
    // Zappar face-local basis differs from our provider contract by a 180° yaw.
    return {x: -x, y, z: -z};
}

function convertFaceLocalRotationToProviderSpace(rotation: Readonly<quat>) {
    // If local coordinates are rotated by C, then world rotation must become R' = R * C
    // to preserve world-space geometry.
    const out = quat.create();
    quat.multiply(out, rotation as quat, FACE_LOCAL_Y_180);
    quat.normalize(out, out);
    return out;
}

export function buildFaceLoadingEventFromMesh(
    maxDetections: number,
    verticesArray: ArrayLike<number>,
    indicesArray: ArrayLike<number>,
    uvsArray: ArrayLike<number>
): FaceLoadingEvent {
    const indices: Array<{a: number; b: number; c: number}> = [];
    for (let i = 0; i < indicesArray.length; i += 3) {
        indices.push({
            a: indicesArray[i],
            b: indicesArray[i + 2],
            c: indicesArray[i + 1],
        });
    }

    const uvs: Array<{u: number; v: number}> = [];
    for (let i = 0; i < uvsArray.length; i += 2) {
        uvs.push({u: 1 - uvsArray[i], v: 1 - uvsArray[i + 1]});
    }

    return {
        maxDetections,
        pointsPerDetection: verticesArray.length / 3,
        indices: indices as unknown as FaceLoadingEvent['indices'],
        uvs: uvs as unknown as FaceLoadingEvent['uvs'],
    };
}

export class FaceTracking_Zappar extends TrackingMode implements FaceTrackingMode {
    private _zappar: ZapparNamespace | null = null;
    private _view?: ViewComponent;
    private _faceTracker?: FaceTracker;
    private _faceMesh?: FaceMesh;
    private _resourcesReady = false;
    private _resourcesPromise: Promise<void> | null = null;

    private readonly _landmarks = new Map<FaceAttachmentPoint, FaceLandmark>();
    private readonly _sharedLandmarks = new Map<FaceLandmarkName, FaceLandmark>();

    private readonly _anchorNumericIds = new Map<string, number>();
    private _nextAnchorId = 0;

    private readonly _cameraMatrix = mat4.create();
    private readonly _cameraPosition = vec3.create();
    private readonly _cameraRotation = quat.create();
    private readonly _cameraScale = vec3.create();

    private readonly _scratchMatrix = mat4.create();
    private readonly _scratchPosition = vec3.create();
    private readonly _scratchRotation = quat.create();
    private readonly _scratchScale = vec3.create();
    private readonly _providerRotation = quat.create();

    private _loadingEvent: FaceLoadingEvent | null = null;

    readonly onFaceScanning: Emitter<[event: FaceLoadingEvent]> = new Emitter();
    readonly onFaceLoading: Emitter<[event: FaceLoadingEvent]> = new Emitter();
    readonly onFaceFound: Emitter<[event: FaceFoundEvent]> = new Emitter();
    readonly onFaceUpdate: Emitter<[event: FaceFoundEvent]> = new Emitter();
    readonly onFaceLost: Emitter<[event: FaceLostEvent]> = new Emitter();

    init(): void {
        this._view = this.component.object.getComponent('view') ?? undefined;

        const provider = this.provider as ZapparProvider;
        const faceComponent = this.component as unknown as Partial<ARFaceTrackingCamera>;
        if (typeof faceComponent.cameraDirection === 'number') {
            // ARFaceTrackingCamera enum is ['front', 'back']
            provider.setPreferredCameraUserFacing(faceComponent.cameraDirection === 0);
        } else {
            provider.setPreferredCameraUserFacing(true);
        }

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
        if (!this._resourcesReady || !this._faceTracker || !this._faceMesh) {
            return;
        }

        const Zappar = this._zappar;
        if (!Zappar) return;

        const provider = this.provider as ZapparProvider;
        const pipeline = provider.getPipeline();
        const mirrorPoses = pipeline.cameraFrameUserFacing();
        const viewNear = this._view?.near;
        const viewFar = this._view?.far;

        const projectionMatrix = Zappar.projectionMatrixFromCameraModel(
            pipeline.cameraModel(),
            this.component.engine.canvas.width,
            this.component.engine.canvas.height,
            typeof viewNear === 'number' ? viewNear : undefined,
            typeof viewFar === 'number' ? viewFar : undefined
        );

        if (this._view) {
            this._setProjectionMatrixWithEngineRemap(projectionMatrix);
        }

        const cameraPose = pipeline.cameraPoseDefault();
        this._applyCameraPose(cameraPose);

        for (const anchor of this._faceTracker.visible) {
            const event = this._buildFaceEvent(anchor, mirrorPoses);
            this.onFaceUpdate.notify(event);
        }
    }

    private async _prepareResources() {
        const provider = this.provider as ZapparProvider;
        this._zappar = await provider.ensureZapparNamespace();
        await provider.ensureFaceResources();

        if (this._resourcesReady) {
            return;
        }

        this._faceTracker = provider.getFaceTracker();
        this._faceMesh = provider.getFaceMesh();

        this._buildLandmarks();

        this._faceTracker.onVisible.bind(this._handleAnchorVisible);
        this._faceTracker.onNotVisible.bind(this._handleAnchorNotVisible);

        this._loadingEvent = this._buildLoadingEvent();
        if (this._loadingEvent) {
            this.onFaceScanning.notify(this._loadingEvent);
            this.onFaceLoading.notify(this._loadingEvent);
        }

        this._resourcesReady = true;
    }

    private _buildLandmarks() {
        const Zappar = this._zappar;
        if (!Zappar) return;

        this._landmarks.clear();
        this._sharedLandmarks.clear();

        for (const attachment of AttachmentList) {
            const key = AttachmentLandmarkKeys[attachment];
            if (!key) {
                continue;
            }

            const landmarkName = (
                Zappar.FaceLandmarkName as unknown as Record<string, FaceLandmarkName>
            )[key];
            if (landmarkName === undefined) continue;

            let landmark = this._sharedLandmarks.get(landmarkName);
            if (!landmark) {
                landmark = new Zappar.FaceLandmark(landmarkName);
                this._sharedLandmarks.set(landmarkName, landmark);
            }

            this._landmarks.set(attachment, landmark);
        }
    }

    private _buildLoadingEvent(): FaceLoadingEvent | null {
        if (!this._faceTracker || !this._faceMesh) {
            return null;
        }

        return buildFaceLoadingEventFromMesh(
            this._faceTracker.maxFaces,
            this._faceMesh.vertices,
            this._faceMesh.indices,
            this._faceMesh.uvs
        );
    }

    private _handleAnchorVisible = (anchor: FaceAnchor) => {
        if (!this._resourcesReady) {
            return;
        }

        const provider = this.provider as ZapparProvider;
        const pipeline = provider.getPipeline();
        const mirrorPoses = pipeline.cameraFrameUserFacing();

        const event = this._buildFaceEvent(anchor, mirrorPoses);
        this.onFaceFound.notify(event);
    };

    private _handleAnchorNotVisible = (anchor: FaceAnchor) => {
        const id = this._anchorNumericId(anchor.id);
        this.onFaceLost.notify({id});
    };

    private _buildFaceEvent(anchor: FaceAnchor, mirrorPoses: boolean): FaceFoundEvent {
        const provider = this.provider as ZapparProvider;
        const pipeline = provider.getPipeline();

        const cameraPose = pipeline.cameraPoseDefault();
        const anchorPose = anchor.pose(cameraPose, mirrorPoses);

        mat4.copy(this._scratchMatrix, anchorPose);
        mat4.getTranslation(this._scratchPosition, this._scratchMatrix);
        mat4.getRotation(this._scratchRotation, this._scratchMatrix);
        mat4.getScaling(this._scratchScale, this._scratchMatrix);
        quat.copy(
            this._providerRotation,
            convertFaceLocalRotationToProviderSpace(this._scratchRotation)
        );

        this._scratchScale[0] = Math.abs(this._scratchScale[0]);
        this._scratchScale[1] = Math.abs(this._scratchScale[1]);
        this._scratchScale[2] = Math.abs(this._scratchScale[2]);

        const scale =
            (this._scratchScale[0] + this._scratchScale[1] + this._scratchScale[2]) / 3;

        const anchorPosition = {
            x: this._scratchPosition[0],
            y: this._scratchPosition[1],
            z: this._scratchPosition[2],
        };

        this._faceMesh!.updateFromFaceAnchor(anchor, mirrorPoses);

        const verticesArray = this._faceMesh!.vertices;
        const normalsArray = this._faceMesh!.normals;

        const vertices: Array<{x: number; y: number; z: number}> = [];
        for (let i = 0; i < verticesArray.length; i += 3) {
            vertices.push(
                convertFaceLocalVectorToProviderSpace(
                    verticesArray[i],
                    verticesArray[i + 1],
                    verticesArray[i + 2]
                )
            );
        }

        const normals: Array<{x: number; y: number; z: number}> = [];
        for (let i = 0; i < normalsArray.length; i += 3) {
            normals.push(
                convertFaceLocalVectorToProviderSpace(
                    normalsArray[i],
                    normalsArray[i + 1],
                    normalsArray[i + 2]
                )
            );
        }

        const attachmentPoints = {} as Record<
            FaceAttachmentPoint,
            {position: {x: number; y: number; z: number}}
        >;

        for (const attachment of AttachmentList) {
            const landmark = this._landmarks.get(attachment);
            if (landmark) {
                landmark.updateFromFaceAnchor(anchor, mirrorPoses);
                mat4.copy(this._scratchMatrix, landmark.pose);
                mat4.getTranslation(this._scratchPosition, this._scratchMatrix);
                attachmentPoints[attachment] = {
                    position: convertFaceLocalVectorToProviderSpace(
                        this._scratchPosition[0],
                        this._scratchPosition[1],
                        this._scratchPosition[2]
                    ),
                };
            } else {
                attachmentPoints[attachment] = {
                    position: convertFaceLocalVectorToProviderSpace(0, 0, 0),
                };
            }
        }

        const id = this._anchorNumericId(anchor.id);

        return {
            id,
            vertices: vertices as unknown as FaceFoundEvent['vertices'],
            normals: normals as unknown as FaceFoundEvent['normals'],
            attachmentPoints: attachmentPoints as FaceFoundEvent['attachmentPoints'],
            transform: {
                position: {...anchorPosition},
                rotation: {
                    x: this._providerRotation[0],
                    y: this._providerRotation[1],
                    z: this._providerRotation[2],
                    w: this._providerRotation[3],
                },
                scale,
                scaledWidth: this._scratchScale[0],
                scaledHeight: this._scratchScale[1],
                scaledDepth: this._scratchScale[2],
            },
        };
    }

    private _applyCameraPose(matrix: Float32Array) {
        mat4.copy(this._cameraMatrix, matrix);
        mat4.getTranslation(this._cameraPosition, this._cameraMatrix);
        mat4.getRotation(this._cameraRotation, this._cameraMatrix);
        mat4.getScaling(this._cameraScale, this._cameraMatrix);

        this.component.object.setPositionWorld(this._cameraPosition);
        this.component.object.setRotationWorld(this._cameraRotation);
    }

    private _setProjectionMatrixWithEngineRemap(matrix: Float32Array) {
        const debugWindow = globalThis as {
            __WLE_ZAPPAR_DEBUG__?: boolean;
            __WLE_ZAPPAR_LAST_PROJECTION_REMAP__?: {
                mode: string;
                viewId: number | null;
                reverseZ: boolean;
                status: 'applied' | 'skipped';
                reason?: string;
            };
        };

        const view = this._view as unknown as {
            _setProjectionMatrix?: (value: Float32Array) => void;
            projectionMatrix: Float32Array;
            _id?: number;
        };

        if (!view) {
            if (debugWindow.__WLE_ZAPPAR_DEBUG__) {
                debugWindow.__WLE_ZAPPAR_LAST_PROJECTION_REMAP__ = {
                    mode: 'face',
                    viewId: null,
                    reverseZ: false,
                    status: 'skipped',
                    reason: 'no-view',
                };
            }
            return;
        }

        if (typeof view._setProjectionMatrix === 'function') {
            view._setProjectionMatrix(matrix);
        } else {
            view.projectionMatrix.set(matrix);
        }

        const engineAny = this.component.engine as unknown as {
            wasm: {
                _wl_view_component_remapProjectionMatrix: (
                    viewId: number,
                    reverseZ: boolean,
                    ndcDepthIsZeroToOne: boolean
                ) => void;
            };
            isReverseZEnabled: boolean;
        };

        if (typeof view._id !== 'number') {
            if (debugWindow.__WLE_ZAPPAR_DEBUG__) {
                debugWindow.__WLE_ZAPPAR_LAST_PROJECTION_REMAP__ = {
                    mode: 'face',
                    viewId: null,
                    reverseZ: engineAny.isReverseZEnabled,
                    status: 'skipped',
                    reason: 'missing-view-id',
                };
            }
            return;
        }

        if (
            typeof engineAny.wasm?._wl_view_component_remapProjectionMatrix === 'function'
        ) {
            const ndcDepthIsZeroToOne = false;
            engineAny.wasm._wl_view_component_remapProjectionMatrix(
                view._id,
                engineAny.isReverseZEnabled,
                ndcDepthIsZeroToOne
            );

            if (debugWindow.__WLE_ZAPPAR_DEBUG__) {
                debugWindow.__WLE_ZAPPAR_LAST_PROJECTION_REMAP__ = {
                    mode: 'face',
                    viewId: view._id,
                    reverseZ: engineAny.isReverseZEnabled,
                    status: 'applied',
                };
            }
            return;
        }

        if (debugWindow.__WLE_ZAPPAR_DEBUG__) {
            debugWindow.__WLE_ZAPPAR_LAST_PROJECTION_REMAP__ = {
                mode: 'face',
                viewId: view._id,
                reverseZ: engineAny.isReverseZEnabled,
                status: 'skipped',
                reason: 'missing-wasm-remap-function',
            };
        }
    }

    private _anchorNumericId(anchorId: string): number {
        let id = this._anchorNumericIds.get(anchorId);
        if (id === undefined) {
            id = this._nextAnchorId++;
            this._anchorNumericIds.set(anchorId, id);
        }
        return id;
    }
}
