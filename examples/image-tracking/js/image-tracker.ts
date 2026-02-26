/**
 * class ImageTrackingExample
 *
 * A very basic image tracking example.
 * Moves the object of the component to tracked image position.
 *
 */
import {Component, Object as WLEObject} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {
    ARSession,
    ARImageTrackingCamera,
    ImageTrackedEvent,
} from '@wonderlandengine/ar-tracking';

export class ImageTrackingExample extends Component {
    static TypeName = 'image-tracking-example';

    /**
     * The ARImageTrackingCamera somewhere in the scene
     */
    @property.object()
    ARImageTrackingCamera!: WLEObject;

    /**
     * Image target name.
     *
     * - For 8th Wall this used to be the target id.
     * - For Zappar this must match the filename stem of the `.zpt` file and
     *   the `name` passed to `registerTarget`.
     */
    @property.string()
    imageId!: string;

    /**
     * URL of the Zappar `.zpt` target file, relative to the page root.
     * Leave empty on non-Zappar providers; `registerTarget` is a no-op when
     * the active provider does not implement it.
     */
    @property.string('')
    url!: string;

    /**
     * Physical width of the tracked image in metres.
     * Set to `0` to use Zappar's internal scale from the `.zpt` file.
     */
    @property.float(0)
    physicalWidthInMeters!: number;

    // allocate some arrays
    private _cachedPosition = new Array<number>(3);
    private _cachedRotation = new Array<number>(4);
    private _cachedScale = new Array<number>(3);

    start() {
        if (!this.ARImageTrackingCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARImageTrackingCamera.TypeName}`
            );
            return;
        }

        const camera = this.ARImageTrackingCamera.getComponent(
            ARImageTrackingCamera.TypeName
        ) as ARImageTrackingCamera | null;

        if (!camera) {
            throw new Error(
                `${ARImageTrackingCamera.TypeName} was not found on ARImageTrackingCamera`
            );
        }

        if (this.url) {
            camera
                .registerTarget(this.url, {
                    name: this.imageId,
                    physicalWidthInMeters:
                        this.physicalWidthInMeters > 0
                            ? this.physicalWidthInMeters
                            : undefined,
                })
                .catch((e) =>
                    console.error(
                        `${this.type}: failed to register image target '${this.imageId}' from '${this.url}'`,
                        e
                    )
                );
        }

        camera.onImageFound.add(this.onImageFound);

        camera.onImageUpdate.add(this.onImageUpdated);

        camera.onImageLost.add((event: ImageTrackedEvent) => {
            if (event.name === this.imageId) {
                this.object.setScalingWorld([0, 0, 0]);
            }
        });

        ARSession.getSessionForEngine(this.engine as any).onSessionEnd.add(() => {
            this.object.setScalingWorld([0, 0, 0]);
        });

        this.object.setScalingWorld([0, 0, 0]);
    }

    private onImageFound = (event: ImageTrackedEvent) => {
        if (event.name === this.imageId) {
            this.onImageUpdated(event);
        }
    };

    private onImageUpdated = (event: ImageTrackedEvent) => {
        if (event.name !== this.imageId) {
            return;
        }

        const {rotation, position, scale} = event;

        this._cachedRotation[0] = rotation.x;
        this._cachedRotation[1] = rotation.y;
        this._cachedRotation[2] = rotation.z;
        this._cachedRotation[3] = rotation.w;

        this._cachedPosition[0] = position.x;
        this._cachedPosition[1] = position.y;
        this._cachedPosition[2] = position.z;

        this._cachedScale[0] = scale;
        this._cachedScale[1] = scale;
        this._cachedScale[2] = scale;

        this.object.setRotationWorld(this._cachedRotation);
        this.object.setPositionWorld(this._cachedPosition);
        this.object.setScalingWorld(this._cachedScale);
    };
}
