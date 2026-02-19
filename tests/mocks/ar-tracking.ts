import {Component} from '@wonderlandengine/api';

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
    indices: Array<{a: number; b: number; c: number}>;
    uvs: Array<{u: number; v: number}>;
}

export interface FaceFoundEvent {}
export interface FaceLostEvent {}
export interface FaceTrackingMode {}

export class TrackingMode {
    provider: unknown;
    component: Component;

    constructor(provider: unknown, component: Component) {
        this.provider = provider;
        this.component = component;
    }
}
