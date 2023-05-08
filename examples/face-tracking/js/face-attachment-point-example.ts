/**
 * FaceAttachmentPointExample
 * A basic example demonstrating how to attach object to a face feature
 */
import {Component, Object as WLEObject} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {ARFaceTrackingCamera, FaceAttachmentPoint} from '@wonderlandengine/ar-tracking';

const FaceAttachmentPoints = Object.values(FaceAttachmentPoint);

export class FaceAttachmentPointExample extends Component {
    static TypeName = 'face-attachment-point-example';

    /**
     * The ARFaceTrackingCamera somewhere in the scene
     */
    @property.object()
    ARFaceTrackingCamera!: WLEObject;

    /**
     * To which feature of the face should the object be attached
     */
    @property.enum(FaceAttachmentPoints)
    attachmentPoint: number = 0;

    /**
     * Object which should be attached to the face feature
     */
    @property.object()
    attachedObject!: WLEObject;

    start() {
        if (!this.ARFaceTrackingCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARFaceTrackingCamera.TypeName}`
            );
            return;
        }
        const camera = this.ARFaceTrackingCamera.getComponent(ARFaceTrackingCamera);
        if (!camera) {
            throw new Error(
                `${ARFaceTrackingCamera.TypeName} was not found on ARFaceTrackingCamera`
            );
        }

        // allocate some arrays
        const cachedPosition = new Float32Array(3);
        const cachedRotation = new Float32Array(4);
        const cachedScale = new Float32Array(3);

        /* Set scaling to zero */
        this.object.setScalingWorld(cachedScale);

        camera.onFaceUpdate.add((data) => {
            // data.attachmentPoints are filled with positions of all available positions of the face features
            const {transform, attachmentPoints} = data;

            cachedRotation[0] = transform.rotation.x;
            cachedRotation[1] = transform.rotation.y;
            cachedRotation[2] = transform.rotation.z;
            cachedRotation[3] = transform.rotation.w;

            cachedPosition[0] = transform.position.x;
            cachedPosition[1] = transform.position.y;
            cachedPosition[2] = transform.position.z;

            cachedScale.fill(transform.scale);

            this.object.setRotationWorld(cachedRotation);
            this.object.setPositionWorld(cachedPosition);
            this.object.setScalingWorld(cachedScale);

            const attachmentPoint =
                attachmentPoints[FaceAttachmentPoints[this.attachmentPoint]].position;
            this.attachedObject.setTranslationLocal([
                attachmentPoint.x,
                attachmentPoint.y,
                attachmentPoint.z,
            ]);
        });

        camera.onFaceLost.add((_event) => {
            cachedScale.fill(0);
            this.object.setScalingWorld(cachedScale);
        });
    }
}
