import {Component, Emitter} from '@wonderlandengine/api';
import {ARProvider} from './AR-provider.js';

export interface TrackingStatusEvent {}

/**
 * AR cameras will carry a tracking mode (SLAM, Face tracking, image tracking, etc)
 */
export interface ITrackingMode {
    readonly component: Component;
    update?: (delta: number) => void;

    init?(features?: string[]): void;
    startSession: () => void;
    endSession: () => void;
}

export abstract class TrackingMode implements ITrackingMode {
    readonly component: Component;
    readonly provider: ARProvider;

    constructor(provider: ARProvider, component: Component) {
        this.component = component;
        this.provider = provider;
    }
    abstract startSession(): void;
    abstract endSession(): void;
}

/**
 * Face attachment point enum
 *
 * Values are sorted by position on the face from top to bottom,
 * as these will appear in the Wonderland Editor in this order.
 */
export enum FaceAttachmentPoint {
    Forehead = 'forehead',
    EyeOuterCornerLeft = 'eye outer corner left',
    EyeOuterCornerRight = 'eye outer corner right',
    EyeBrowInnerLeft = 'eyebrow inner left',
    EyeBrowInnerRight = 'eyebrow inner right',
    EyeBrowCenterLeft = 'eyebrow center left',
    EyeBrowCenterRight = 'eyebrow center right',
    EyeBrowOuterLeft = 'eyebrow outer left',
    EyeBrowOuterRight = 'eyebrow outer right',
    EarLeft = 'ear left',
    EarRight = 'ear right',
    EyeLeft = 'eye left',
    EyeRight = 'eye right',
    NoseBridge = 'nose bridge',
    NoseTip = 'nose tip',
    CheekLeft = 'cheek left',
    CheekRight = 'cheek right',
    Mouth = 'mouth',
    MouthCornerLeft = 'mouth corner left',
    MouthCornerRight = 'mouth corner right',
    UpperLip = 'upper lip',
    LowerLip = 'lower lip',
    Chin = 'chin',
}

export interface FaceLoadingEvent {
    maxDetections: number;
    pointsPerDetection: number;
    indices: [{a: number; b: number; c: number}];
    uvs: [{u: number; v: number}];
}

export interface FaceFoundEvent {
    id: number;
    vertices: [{x: number; y: number; z: number}];
    normals: [{x: number; y: number; z: number}];

    attachmentPoints: {
        [value in FaceAttachmentPoint]: {
            position: {x: number; y: number; z: number};
        };
    };

    transform: {
        position: {x: number; y: number; z: number};
        rotation: {x: number; y: number; z: number; w: number};
        scale: number; // A scale factor that should be applied to objects attached to this face.
        scaledWidth: number; // Approximate width of the head in the scene when multiplied by scale.
        scaledHeight: number; // Approximate height of the head in the scene when multiplied by scale.
        scaledDepth: number; // Approximate depth of the head in the scene when multiplied by scale.
    };
}

export interface FaceLostEvent {
    id: number;
}

export interface FaceTrackingMode extends ITrackingMode {
    readonly onFaceScanning: Emitter<[event: FaceLoadingEvent]>;
    readonly onFaceLoading: Emitter<[event: FaceLoadingEvent]>;
    readonly onFaceFound: Emitter<[event: FaceFoundEvent]>;
    readonly onFaceUpdate: Emitter<[event: FaceFoundEvent]>;
    readonly onFaceLost: Emitter<[event: FaceLostEvent]>;
}

export interface VPSMeshFoundEvent {
    id: string;
    position: {x: number; y: number; z: number};
    rotation: {x: number; y: number; z: number; w: number};
    geometry: {
        index: {
            array: Uint32Array;
            itemSize: 1;
        };
        attributes: [
            {
                name: 'position';
                array: Float32Array;
                itemSize: 3;
            },
            {
                name: 'color';
                array: Float32Array;
                itemSize: 3;
            }
        ];
    };
}

export interface VPSMeshUpdatedEvent {
    id: string;
    position: {x: number; y: number; z: number};
    rotation: {x: number; y: number; z: number; w: number};
}

export interface VPSMeshLostEvent {
    id: string;
}

export interface VPSWayPointEvent {
    name: string;
    position: {x: number; y: number; z: number};
    rotation: {x: number; y: number; z: number; w: number};
}

export interface VPSTrackingMode extends ITrackingMode {
    readonly onMeshFound: Emitter<[event: VPSMeshFoundEvent]>;

    readonly onWaySpotFound: Emitter<[event: VPSWayPointEvent]>;
    readonly onWaySpotUpdated: Emitter<[event: VPSWayPointEvent]>;
    readonly onWaySpotLost: Emitter<[event: VPSWayPointEvent]>;
}

export interface ImageScanningEvent {
    imageTargets: {
        name: string; // image name
        type: 'FLAT' | 'CYLINDRICAL' | 'CONICAL';
        metadata: any | null;

        geometry: {
            arcLengthRadians?: number;
            arcStartRadians?: number;
            height?: number;
            radiusBottom?: number;
            radiusTop?: number;
            scaleWidth?: number; // The width of the image in the scene, when multiplied by scale.
            scaledHeight?: number; // 	The height of the image in the scene, when multiplied by scale.
        };

        properties?: {
            height: number;
            width: number;
            isRotated: boolean;
            left: number;
            top: number;
            moveable: boolean;
            originalHeight: number;
            originalWidth: number;
            physicalWidthInMeters: number | null;
        } | null;
    }[];
}

export interface ImageTrackedEvent {
    name: string; // image name
    position: {x: number; y: number; z: number}; // position of the tracked image
    rotation: {x: number; y: number; z: number; w: number}; // rotation of the tracked image
    scale: number; // A scale factor that should be applied to object attached to this image.
    scaleWidth: number; // The width of the image in the scene, when multiplied by scale.
    scaledHeight: number; // 	The height of the image in the scene, when multiplied by scale.
    type: 'FLAT' | 'CYLINDRICAL' | 'CONICAL';

    height?: number; //	Height of the curved target.
    radiusTop?: number; //Radius of the curved target at the top.
    radiusBottom?: number; //	Radius of the curved target at the bottom.
    arcStartRadians?: number; // Starting angle in radians.
    arcLengthRadians?: number; //	Central angle in radians.
}

export interface ImageTrackingMode extends ITrackingMode {
    readonly onImageScanning: Emitter<[event: ImageScanningEvent]>;
    readonly onImageFound: Emitter<[event: ImageTrackedEvent]>;
    readonly onImageUpdate: Emitter<[event: ImageTrackedEvent]>;
    readonly onImageLost: Emitter<[event: ImageTrackedEvent]>;
}
