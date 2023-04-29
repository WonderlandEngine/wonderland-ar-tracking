import {Component} from '@wonderlandengine/api';
import { ARProvider } from '../AR-provider.js';

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
    readonly provider: ARProvider;

    constructor(provider: ARProvider, component: Component) {
        this.component = component;
        this.provider = provider;
    }
    abstract startSession(): void;
    abstract endSession(): void;
}
