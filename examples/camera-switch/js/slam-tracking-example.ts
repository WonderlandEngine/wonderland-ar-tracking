/**
 * class SlamTrackingExample
 *
 * A very basic SLAM tracking example.
 * Shows and hides the object when the tracking starts or stops
 *
 */
import {Component, Object as WLEObject, Type} from '@wonderlandengine/api';
import {ARSession, ARSLAMCamera} from '@wonderlandengine/8thwall-tracking';

export class SlamTrackingExample extends Component {
    public static TypeName = 'slam-tracking-example';
    public static Properties = {
        ARSlamCamera: {type: Type.Object},
    };
    // injected by WL..
    private ARSlamCamera!: WLEObject;

    start() {
        if (!this.ARSlamCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARSLAMCamera.TypeName}`
            );
            return;
        }

        const camera = this.ARSlamCamera.getComponent(ARSLAMCamera);

        if (!camera) {
            throw new Error(
                `${ARSLAMCamera.TypeName} was not found on ARImageTrackingCamera`
            );
        }

        ARSession.onSessionStarted.add(() => {
            if (camera.active) {
                this.object.scalingWorld = [1, 1, 1];
            }
        });

        ARSession.onSessionEnded.add(() => {
            this.object.scalingWorld = [0, 0, 0];
        });

        this.object.scalingWorld = [0, 0, 0];
    }
}
