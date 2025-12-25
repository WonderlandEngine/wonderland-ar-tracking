import {Component} from '@wonderlandengine/api';
import {mat4, quat2} from 'gl-matrix';
import {ARProvider, ARSession} from '@wonderlandengine/ar-tracking';
import {ZapparProvider} from '@wonderlandengine/ar-provider-zappar';

/**
 * Applies Zappar Instant World Tracking anchor pose to this object.
 *
 * Attach this to a parent object of your scene content to visualize whether
 * the anchor pose is behaving correctly (rooted vs gyro-only feel).
 */
export class SlamAnchorZappar extends Component {
    static TypeName = 'slam-anchor-zappar';

    private _provider: ZapparProvider | null = null;
    private readonly _tmpTransform = quat2.create();

    start(): void {
        const arSession = ARSession.getSessionForEngine(this.engine);
        arSession.onSessionStart.add(this.onSessionStart);
        arSession.onSessionEnd.add(this.onSessionEnd);
    }

    update(): void {
        const provider = this._provider;
        if (!provider) return;

        const anchorPose = provider.slamAnchorPoseMatrix;
        if (!anchorPose) return;

        quat2.fromMat4(this._tmpTransform, anchorPose as mat4);
        this.object.setTransformWorld(this._tmpTransform);
    }

    private onSessionStart = (provider: ARProvider) => {
        this._provider = provider instanceof ZapparProvider ? provider : null;
    };

    private onSessionEnd = (provider: ARProvider) => {
        if (provider === this._provider) this._provider = null;
    };
}
