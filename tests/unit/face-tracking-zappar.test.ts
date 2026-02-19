import {describe, expect, it} from 'vitest';
import {FaceAttachmentPoint} from '@wonderlandengine/ar-tracking';
import {
    AttachmentLandmarkKeys,
    buildFaceLoadingEventFromMesh,
} from '../../packages/ar-provider-zappar/src/face-tracking-mode-zappar.js';

describe('face-tracking Zappar helpers', () => {
    it('maps every face attachment point to a landmark key', () => {
        for (const attachmentPoint of Object.values(FaceAttachmentPoint)) {
            expect(AttachmentLandmarkKeys[attachmentPoint]).toBeTruthy();
        }

        expect(AttachmentLandmarkKeys[FaceAttachmentPoint.NoseTip]).toBe('NOSE_TIP');
        expect(AttachmentLandmarkKeys[FaceAttachmentPoint.Mouth]).toBe('MOUTH_CENTER');
        expect(AttachmentLandmarkKeys[FaceAttachmentPoint.Chin]).toBe('CHIN');
    });

    it('builds loading event indices/uvs and point count correctly', () => {
        const loadingEvent = buildFaceLoadingEventFromMesh(
            2,
            new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
            new Uint16Array([0, 1, 2]),
            new Float32Array([0, 0, 1, 0, 0, 1])
        );

        expect(loadingEvent.maxDetections).toBe(2);
        expect(loadingEvent.pointsPerDetection).toBe(3);
        expect(loadingEvent.indices).toEqual([{a: 0, b: 1, c: 2}]);
        expect(loadingEvent.uvs).toEqual([
            {u: 0, v: 0},
            {u: 1, v: 0},
            {u: 0, v: 1},
        ]);
    });
});
