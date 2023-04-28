/**
 * class VideoTextureImageTarget
 *
 * Handles playing and stopping the video of the VideoTexture component attached to the same object.
 * Video is played when the imageTarget it detected in the PhysicalSizeImageTarget component of the same object.
 * And stopped when the image is lost.
 */
import {Component} from '@wonderlandengine/api';
import {ARImageTrackingCamera, ARSession} from '@wonderlandengine/8thwall-tracking';
import {PhysicalSizeImageTarget} from './physical-size-image-target.js';
import {VideoTexture} from '@wonderlandengine/components';

export class VideoTextureImageTarget extends Component {
    public static TypeName = 'video-texture-image-target-example';

    private _physicalSizeImageTarget!: PhysicalSizeImageTarget;

    // cache videoTexture component
    private _videoTextureComp!: VideoTexture;

    // Sometimes the tracking is lost just for a fraction of the second before it's tracked again.
    // In this case we allow sometime before we hide the mesh to reduce the flickering.
    private _imageLostTimeout = 0;

    start() {
        const physicalSizeImageTarget = this.object.getComponent(PhysicalSizeImageTarget);
        if (!physicalSizeImageTarget) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${PhysicalSizeImageTarget.TypeName}`
            );
            return;
        }

        this._physicalSizeImageTarget = physicalSizeImageTarget;

        const camera =
            this._physicalSizeImageTarget.ARImageTrackingCamera.getComponent(
                ARImageTrackingCamera
            )!;

        this._videoTextureComp = this.object.getComponent('video-texture') as VideoTexture;

        camera.onImageFound.add(this.onImageFound);

        camera.onImageLost.add((event: XR8ImageTrackedEvent) => {
            if (event.detail.name === this._physicalSizeImageTarget.imageId) {
                this._imageLostTimeout = setTimeout(() => {
                    this._videoTextureComp.video!.pause();
                }, 250);
            }
        });

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            clearTimeout(this._imageLostTimeout);
            this._videoTextureComp.video!.pause();
        });
    }

    private onImageFound = (event: XR8ImageTrackedEvent) => {
        if (event.detail.name === this._physicalSizeImageTarget.imageId) {
            this._videoTextureComp.video!.play();
        }
    };
}
