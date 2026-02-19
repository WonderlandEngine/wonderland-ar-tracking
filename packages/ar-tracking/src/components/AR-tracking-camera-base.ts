import {ARSession} from '../AR-session.js';
import {ITrackingMode} from '../tracking-mode.js';
import {TrackingType} from '../tracking-type.js';
import {ARCamera} from './AR-Camera.js';

export abstract class ARTrackingCameraBase<
    TTrackingMode extends ITrackingMode,
> extends ARCamera {
    protected abstract getTrackingType(): TrackingType;
    protected _trackingImpl!: TTrackingMode;
    private _registeredWithSession = false;
    private _readyReported = false;

    init() {
        const arSession = ARSession.getSessionForEngine(this.engine);
        if (!this._registeredWithSession) {
            arSession.registerARCameraComponent();
            this._registeredWithSession = true;
        }

        this._trackingImpl = arSession.getTrackingProvider(
            this.getTrackingType(),
            this
        ) as TTrackingMode;
    }

    protected getTrackingInitFeatures(): string[] | undefined {
        return undefined;
    }

    protected validateStart(): void {}

    start() {
        this.validateStart();
        if (this._trackingImpl.init) {
            this._trackingImpl.init(this.getTrackingInitFeatures());
        }

        if (!this._readyReported) {
            ARSession.getSessionForEngine(this.engine).markARCameraReady();
            this._readyReported = true;
        }
    }

    startSession = () => {
        if (this.active) {
            this._trackingImpl.startSession();
        }
    };

    endSession = () => {
        if (this.active) {
            this._trackingImpl.endSession();
        }
    };

    onDeactivate(): void {
        this._trackingImpl.endSession();
    }

    update(dt: number) {
        this._trackingImpl.update?.(dt);

        const cameraTransformWorld = this._trackingImpl.getCameraTransformWorld?.();
        if (cameraTransformWorld) {
            this.object.setTransformWorld(cameraTransformWorld);
        }
    }
}
