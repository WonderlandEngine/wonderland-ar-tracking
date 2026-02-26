import {TrackingMode, HitTestResult} from '@wonderlandengine/ar-tracking';
import {WebXRConfig, WebXRProvider} from './webxr-provider.js';
import {Component} from '@wonderlandengine/api';

/**
 * Implementation of SLAM (World Tracking) based on the WebXR Device API
 *
 * Depends on WEBXR_REQUIRED_FEATURES, WEBXR_OPTIONAL_FEATURES global variables.
 *
 * TODO: change this when it's moved to auto constants.
 */
export class WorldTracking_WebXR extends TrackingMode {
    private _config: WebXRConfig;
    private _hitTestSource: XRHitTestSource | null = null;

    constructor(provider: WebXRProvider, component: Component, config: WebXRConfig) {
        super(provider, component);
        this._config = config;
    }

    startSession() {
        this.provider.startSession(
            this._config.requiredFeatures,
            this._config.optionalFeatures
        );
    }

    endSession(): void {
        this.provider.endSession();
    }

    async setupHitTest(): Promise<void> {
        const provider = this.provider as WebXRProvider;
        const session = provider.xrSession;
        if (!session) {
            console.warn(
                '[WorldTracking_WebXR] setupHitTest called without an active XR session.'
            );
            return;
        }

        if (!session.requestHitTestSource) {
            console.warn(
                '[WorldTracking_WebXR] Hit-test feature is not available. ' +
                    "Add 'hit-test' to your WebXR optional features."
            );
            return;
        }

        const engine = this.provider.engine as unknown as {
            xr?: {referenceSpaceForType(type: string): XRReferenceSpace | undefined};
        };
        const viewerSpace = engine.xr?.referenceSpaceForType('viewer');
        if (!viewerSpace) {
            console.warn('[WorldTracking_WebXR] Viewer reference space not available.');
            return;
        }

        this._hitTestSource =
            (await session.requestHitTestSource({space: viewerSpace})) ?? null;
    }

    teardownHitTest(): void {
        this._hitTestSource?.cancel();
        this._hitTestSource = null;
    }

    getHitTestResult(): HitTestResult | null {
        if (!this._hitTestSource) return null;

        const engine = this.provider.engine as unknown as {
            xr?: {
                frame?: XRFrame;
                referenceSpaceForType(type: string): XRReferenceSpace | undefined;
            };
        };
        const frame = engine.xr?.frame;
        if (!frame) return null;

        const results = frame.getHitTestResults(this._hitTestSource);
        if (results.length === 0) return null;

        const viewerSpace = engine.xr!.referenceSpaceForType('viewer');
        if (!viewerSpace) return null;

        const pose = results[0].getPose(viewerSpace);
        if (!pose) return null;

        // Hit-test result is in viewer space; transform to world space via the
        // camera object's current world transform.
        const worldPos = this.component.object.transformPointWorld(
            new Array(3) as number[],
            [
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z,
            ]
        );

        return {position: {x: worldPos[0], y: worldPos[1], z: worldPos[2]}};
    }
}
