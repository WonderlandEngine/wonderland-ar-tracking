/**
 * FaceAttachmentPointExample
 * A quick example demonstrating tracking of a face feature
 */
import {Component, Object as WLEObject} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession, ARFaceTrackingCamera} from '@wonderlandengine/ar-tracking';

/**
 * Possible attachment points
 */
const ATTACHMENT_POINTS = [
    'forehead',
    'rightEyebrowInner',
    'rightEyebrowMiddle',
    'rightEyebrowOuter',
    'leftEyebrowInner',
    'leftEyebrowMiddle',
    'leftEyebrowOuter',
    'leftEar',
    'rightEar',
    'leftCheek',
    'rightCheek',
    'noseBridge',
    'noseTip',
    'leftEye',
    'rightEye',
    'leftEyeOuterCorner',
    'rightEyeOuterCorner',
    'upperLip',
    'lowerLip',
    'mouth',
    'mouthRightCorner',
    'mouthLeftCorner',
    'chin',
];

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
    @property.enum(ATTACHMENT_POINTS)
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
        const cachedPosition = new Array<number>(3);
        const cachedRotation = new Array<number>(4);
        const cachedScale = [0, 0, 0];

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            this.object.scalingWorld = [0, 0, 0];
            cachedScale[0] = cachedScale[1] = cachedScale[2] = 0;
        });

        this.object.scalingWorld = [0, 0, 0];

        camera.onFaceUpdate.add((event) => {
            // event.detail.attachmentPoints are filled with positions of all available positions of the face features
            const {transform, attachmentPoints} = event.detail;

            cachedRotation[0] = transform.rotation.x;
            cachedRotation[1] = transform.rotation.y;
            cachedRotation[2] = transform.rotation.z;
            cachedRotation[3] = transform.rotation.w;

            cachedPosition[0] = transform.position.x;
            cachedPosition[1] = transform.position.y;
            cachedPosition[2] = transform.position.z;

            const scale = transform.scale;

            cachedScale[0] = scale;
            cachedScale[1] = scale;
            cachedScale[2] = scale;

            this.object.rotationWorld.set(cachedRotation);
            this.object.setTranslationWorld(cachedPosition);
            this.object.scalingWorld.set(cachedScale);

            const attachmentPoint =
                attachmentPoints[
                    ATTACHMENT_POINTS[this.attachmentPoint] as keyof typeof attachmentPoints
                ].position;
            this.attachedObject.setTranslationLocal([
                attachmentPoint.x,
                attachmentPoint.y,
                attachmentPoint.z,
            ]);
        });

        camera.onFaceLost.add((_event) => {
            this.object.scalingWorld = [0, 0, 0];
            cachedScale[0] = cachedScale[1] = cachedScale[2] = 0;
        });
    }
}
