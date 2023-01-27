WL.registerComponent("clown-nose", {
  ARFaceCamera: { type: WL.Type.Object },
  nose: { type: WL.Type.Object },
}, {
  cachedPosition: new Array(3),
  cachedRotation: new Array(4),
  cachedScale: new Array(3),


  start: function () {

    const camera = this.ARFaceCamera.getComponent("AR-face-camera");
    camera.onFaceUpdate.push((event) => {
      //console.log("Event", event, this);

      const { transform, attachmentPoints } = event.detail

      this.cachedRotation[0] = transform.rotation.x;
      this.cachedRotation[1] = transform.rotation.y;
      this.cachedRotation[2] = transform.rotation.z;
      this.cachedRotation[3] = transform.rotation.w;

      this.cachedPosition[0] = transform.position.x;
      this.cachedPosition[1] = transform.position.y;
      this.cachedPosition[2] = transform.position.z;


      this.cachedScale[0] = transform.scale / 10;
      this.cachedScale[1] = transform.scale / 10;
      this.cachedScale[2] = transform.scale / 10;

      //
      // console.log(attachmentPoints.noseBridge.position);

      this.object.rotationWorld = this.cachedRotation;
      this.object.setTranslationWorld(this.cachedPosition);
      this.object.scalingWorld = this.cachedScale;

      this.nose.setTranslationLocal([attachmentPoints.noseBridge.position.x, attachmentPoints.noseBridge.position.y, attachmentPoints.noseBridge.position.z])
    })
  }
});