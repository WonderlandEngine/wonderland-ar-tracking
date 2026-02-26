/// <reference path="./types/global.d.ts" />

import {Component} from '@wonderlandengine/api';
import {mat4, quat2} from 'gl-matrix';
import {HitTestResult, TrackingMode} from '@wonderlandengine/ar-tracking';
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
        const provider = this.provider as ZapparProvider;
        provider.setPreferredCameraUserFacing(false);

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

    async setupHitTest(): Promise<void> {
        const provider = this.provider as ZapparProvider;
        const tracker = provider.enableWorldTracker();
        if (!tracker) {
            console.warn(
                '[WorldTracking_Zappar] World tracker (plane detection) is not available. ' +
                    'Ensure @zappar/zappar >= 4.x is installed.'
            );
        }
    }

    /**
     * Cast a ray from the camera through the screen centre and return the closest
     * intersection with any of the Zappar-detected plane anchors.
     */
    getHitTestResult(): HitTestResult | null {
        const provider = this.provider as ZapparProvider;
        const worldTracker = provider.worldTracker;
        if (!worldTracker) return null;

        const cameraPose = provider.slamCameraPoseMatrix;
        if (!cameraPose) return null;

        // Camera position and forward vector in world space.
        const cam = this.component.object;
        const pos = cam.getPositionWorld(new Array(3) as number[]);
        const fwd = cam.getForwardWorld(new Array(3) as number[]);

        let closestT = Infinity;
        let hit: HitTestResult | null = null;

        for (const plane of worldTracker.planes.values()) {
            // pose() returns a column-major 4×4 matrix.
            // Column 1 (elements [4,5,6]) = plane normal; column 3 (elements [12,13,14]) = plane origin.
            const m = plane.pose(cameraPose as unknown as Float32Array);

            const nx = m[4],
                ny = m[5],
                nz = m[6];
            const ox = m[12],
                oy = m[13],
                oz = m[14];

            const denom = fwd[0] * nx + fwd[1] * ny + fwd[2] * nz;
            // Skip planes nearly parallel to the ray.
            if (Math.abs(denom) < 1e-6) continue;

            const t =
                ((ox - pos[0]) * nx + (oy - pos[1]) * ny + (oz - pos[2]) * nz) / denom;
            if (t <= 0 || t >= closestT) continue;

            closestT = t;
            hit = {
                position: {
                    x: pos[0] + fwd[0] * t,
                    y: pos[1] + fwd[1] * t,
                    z: pos[2] + fwd[2] * t,
                },
            };
        }

        return hit;
    }
}
