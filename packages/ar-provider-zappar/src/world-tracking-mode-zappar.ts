/// <reference path="./types/global.d.ts" />

import {Component} from '@wonderlandengine/api';
import {mat4, quat2} from 'gl-matrix';
import {TrackingMode} from '@wonderlandengine/ar-tracking';
import {ZapparProvider} from './zappar-provider.js';

/**
 * SLAM tracking implementation backed by Zappar.
 */
export class WorldTracking_Zappar extends TrackingMode {
    private readonly _cameraTransform = quat2.create();

    constructor(provider: ZapparProvider, component: Component) {
        super(provider, component);
    }

    init(): void {
        const input = this.component.object.getComponent('input');
        if (input) {
            // Camera pose will be driven by the AR tracking implementation.
            input.active = false;
        }
    }

    startSession(): void {
        void (this.provider as ZapparProvider).startSession();
    }

    endSession(): void {
        void (this.provider as ZapparProvider).endSession();
    }

    getCameraTransformWorld(): ArrayLike<number> | null {
        const provider = this.provider as ZapparProvider;
        return provider.hasSlamTrackingState ? this._cameraTransform : null;
    }

    getCameraProjectionMatrix(out: Float32Array): boolean {
        const provider = this.provider as ZapparProvider;
        const projection = provider.slamProjectionMatrix;
        if (!projection) return false;
        out.set(projection);
        return true;
    }

    update(): void {
        const provider = this.provider as ZapparProvider;
        const pose = provider.slamCameraPoseMatrix;
        if (!pose) return;

        // Zappar's THREE.js wrapper treats pipeline.cameraPose*(...) matrices as a camera world transform.
        // Wonderland stores transforms as dual quaternions (8 floats): [rotation quat, translation dual part].
        quat2.fromMat4(this._cameraTransform, pose);
    }
}
