import {property} from '@wonderlandengine/api/decorators.js';

import {FaceTracking_XR8} from '../../frameworks/xr8/face-tracking-mode-xr8.js';
import {XR8Provider} from '../../frameworks/xr8/xr8-provider.js';

import {ARCamera} from './AR-Camera.js';

/**
 * AR face tracking Camera component.
 *
 * Should be attached the object which has a ViewComponent.
 *
 * Currently only works with 8th Wall tracking `FaceTracking_XR8`
 */
class ARFaceTrackingCamera extends ARCamera {
    static TypeName = 'AR-face-tracking-camera';

    @property.enum(
        ['front', 'back'] as XR8CameraDirection[keyof XR8CameraDirection][],
        'front'
    )
    cameraDirection!: number;

    private _trackingImpl!: FaceTracking_XR8;

    get onFaceLoading() {
        return this._trackingImpl.onFaceLoading;
    }

    get onFaceFound() {
        return this._trackingImpl.onFaceFound;
    }

    get onFaceUpdate() {
        return this._trackingImpl.onFaceUpdate;
    }

    get onFaceLost() {
        return this._trackingImpl.onFaceLost;
    }

    init() {
        const provider = XR8Provider.registerTrackingProviderWithARSession(this.engine);
        this._trackingImpl = new FaceTracking_XR8(provider, this);
    }

    start() {
        if (!this.object.getComponent('view')) {
            throw new Error('AR-camera requires a view component');
        }
        this._trackingImpl.init();
    }

    startSession = async () => {
        if (this.active) {
            this._trackingImpl.startSession();
        }
    };

    endSession = async () => {
        if (this.active) {
            this._trackingImpl!.endSession();
        }
    };

    onDeactivate(): void {
        this._trackingImpl.endSession();
    }
}

export {ARFaceTrackingCamera};
