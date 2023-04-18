import {Component} from '@wonderlandengine/api';

/**
 * AR cameras will carry a tracking mode (SLAM, Face tracking, image tracking, etc)
 */
export interface ITrackingMode {
    readonly component: Component;
    update?: (delta: number) => void;
    startSession: () => void;
    endSession: () => void;
}

export abstract class TrackingMode implements ITrackingMode {
    readonly component: Component;

    constructor(component: Component) {
        this.component = component;
    }
    abstract startSession(): void;
    abstract endSession(): void;
}
