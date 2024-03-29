import {Emitter, WonderlandEngine, Component} from '@wonderlandengine/api';
import {ITrackingMode} from './tracking-mode.js';
import {TrackingType} from './tracking-type.js';

/**
 * ARProvider defines the core behavior how an AR provider should look like.
 * AR provider should handle the loading, configuring and starting/stopping some tracking implementation.
 * For example src/components/AR/frameworks/xr8/xr8-provider.ts loads, configures and checks the required permissions for the 8th Wall library.
 */
abstract class ARProvider {
    protected _engine!: WonderlandEngine;

    get engine() {
        return this._engine;
    }

    protected constructor(engine: WonderlandEngine) {
        this._engine = engine;
    }

    /**
     * onSessionStart - array of callbacks to be called when the tracking implementation has started tracking.
     * It is NOT necessary called immediately after startSession is called
     */
    readonly onSessionStart: Emitter<any> = new Emitter();

    /**
     * onSessionEnd - array of callbacks to be called when the tracking implementation has stoped tracking.
     * It is NOT necessary called immediately after endSession is called
     */
    readonly onSessionEnd: Emitter<any> = new Emitter();

    // Tracking implementation has beed loaded
    loaded = false;

    /**
     * startSession - initiate tracking of the tracking impl.
     * @param args - any extra params the tracking implementation might need to start tracking
     */
    abstract startSession(...args: any[]): Promise<void>;

    /**
     * endSession - stops tracking
     */
    abstract endSession(): Promise<void>;

    /**
     * Load the tracking implementation.
     * In case of WebXR implementation, this will resolve immediately
     */
    abstract load(): Promise<void>;

    /** Whether this provider supports given tracking type */
    abstract supports(type: TrackingType): boolean;

    /** Create a tracking implementation */
    abstract createTracking(type: TrackingType, component: Component): ITrackingMode;
}

export {ARProvider};
