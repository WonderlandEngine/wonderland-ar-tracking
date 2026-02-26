import {Component, MeshComponent, Object3D} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';
import {ARProvider} from '../AR-provider.js';
import {ARSession} from '../AR-session.js';
import {HitTestResult} from '../tracking-mode.js';
import {ARSLAMCamera} from './AR-SLAM-camera.js';

/**
 * Provider-agnostic hit-test reticle for SLAM-based AR.
 *
 * Works with any tracking provider that implements
 * {@link ITrackingMode.setupHitTest} / {@link ITrackingMode.getHitTestResult}:
 *
 * - **WebXR Device API** — uses `XRHitTestSource` (requires `hit-test` in
 *   optional features).
 * - **8th Wall** — ray–ground-plane intersection (no extra setup needed).
 * - **Zappar** — ray–plane intersection against `WorldTracker` detected planes
 *   (requires `@zappar/zappar >= 4.x`).
 *
 * **Setup**
 * 1. Attach this component to a reticle / cursor object that optionally has a
 *    {@link MeshComponent} for visual feedback.
 * 2. Set the `camera` property to the scene object carrying {@link ARSLAMCamera}.
 * 3. Use {@link SpawnMeshOnReticle} (or equivalent) on the same object to
 *    place content at the hit position on tap/select.
 *
 * Replaces the provider-specific `hit-test-location-root`,
 * `hit-test-location-xr8`, and `hit-test-location-zappar` components.
 */
export class HitTestLocation extends Component {
    static TypeName = 'ar-hit-test-location';

    /** Scene object that carries the {@link ARSLAMCamera} component. */
    @property.object()
    camera!: Object3D;

    private _slamCamera: ARSLAMCamera | null = null;
    private _mesh: MeshComponent | null = null;

    private readonly _posBuffer: number[] = [0, 0, 0];

    start(): void {
        const arSession = ARSession.getSessionForEngine(this.engine);
        arSession.onSessionStart.add(this._onSessionStart);
        arSession.onSessionEnd.add(this._onSessionEnd);

        this._mesh = this.object.getComponent(MeshComponent) ?? null;
        if (this._mesh) this._mesh.active = false;

        // Disable the update loop until a session is running.
        this.active = false;
    }

    update(): void {
        if (!this._slamCamera) return;

        const result: HitTestResult | null = this._slamCamera.getHitTestResult();
        if (result) {
            this._posBuffer[0] = result.position.x;
            this._posBuffer[1] = result.position.y;
            this._posBuffer[2] = result.position.z;
            this.object.setPositionWorld(this._posBuffer);
            if (this._mesh) this._mesh.active = true;
        } else {
            if (this._mesh) this._mesh.active = false;
        }
    }

    private _onSessionStart = async (_provider: ARProvider): Promise<void> => {
        if (!this.camera) {
            console.warn(
                `[${this.type}] '${this.object.name}': 'camera' property is not set.`
            );
            return;
        }

        const slamCamera = this.camera.getComponent(ARSLAMCamera);
        if (!slamCamera) {
            // Not a SLAM session (e.g. image tracking) — silently skip.
            return;
        }

        this._slamCamera = slamCamera;

        try {
            await slamCamera.setupHitTest();
        } catch (e) {
            console.error(`[${this.type}] setupHitTest failed:`, e);
            this._slamCamera = null;
            return;
        }

        this.active = true;
    };

    private _onSessionEnd = (_provider: ARProvider): void => {
        this._slamCamera?.teardownHitTest();
        this._slamCamera = null;
        this.active = false;
        if (this._mesh) this._mesh.active = false;
    };
}
