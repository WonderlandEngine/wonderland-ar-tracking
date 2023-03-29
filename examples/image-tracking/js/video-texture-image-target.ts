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

export class VideoTextureImageTarget extends Component {
    public static TypeName = 'video-texture-image-target-example';

    public static Properties = {};

    private _physicalSizeImageTarget!: PhysicalSizeImageTarget;

    // cache videoTexture component
    private _videoTextureComp!: Component & {video: HTMLVideoElement};

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

        this._videoTextureComp = this.object.getComponent('video-texture') as any; // video-texture component is not updated to match @wonderlandengine/api 0.9.8 ("@wonderlandengine/components": "^0.9.2"),

        camera.onImageFound.push(this.onImageFound);

        camera.onImageLost.push((event: XR8ImageTrackedEvent) => {
            if (event.detail.name === this._physicalSizeImageTarget.imageId) {
                this._imageLostTimeout = setTimeout(() => {
                    this._videoTextureComp.video.pause();
                }, 250);
            }
        });

        ARSession.onSessionEnded.push(() => {
            clearTimeout(this._imageLostTimeout);
            this._videoTextureComp.video.pause();
        });
    }

    private onImageFound = (event: XR8ImageTrackedEvent) => {
        if (event.detail.name === this._physicalSizeImageTarget.imageId) {
            //this.videoTextureComp.video.playsInline = true; // might be needed on native video-texture if not fixed yet ("@wonderlandengine/components": "^0.9.2"),
            this._videoTextureComp.video.play();
        }
    };
}
