/**
 * class SlamTrackingExample
 *
 * A very basic SLAM tracking example.
 * Shows and hides the object when the tracking starts or stops
 *
 */
import {Component, Object3D} from '@wonderlandengine/api';

import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession, ARSLAMCamera} from '@wonderlandengine/ar-tracking';

export class SlamTrackingExample extends Component {
    static TypeName = 'slam-tracking-example';

    /**
     * The ARSlamCamera somewhere in the scene
     */
    @property.object()
    ARSlamCamera!: Object3D;

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

        ARSession.getSessionForEngine(this.engine).onSessionStart.add(() => {
            if (camera.active) {
                this.object.setScalingWorld([1, 1, 1]);
            }
        });

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            this.object.setScalingWorld([0, 0, 0]);
        });
    }
}
