import { quat2 } from 'gl-matrix';
/**
 * Sets up a [WebXR Device API "Hit Test"](https://immersive-web.github.io/hit-test/)
 * and places the object to the hit location.
 *
 * **Requirements:**
 *  - Specify `'hit-test'` in the required or optional features on the AR button in your html file.
 *    See [Wastepaperbin AR](/showcase/wpb-ar) as an example.
 */


WL.registerComponent('hit-test-location-new', {
    /* The mesh to spawn */
    camera: { type: WL.Type.Object },
    /* The material to spawn the mesh with */
    target: { type: WL.Type.Object },
}, {
    init: function () {
        WL.onXRSessionStart.push(this.xrSessionStart.bind(this));
        WL.onXRSessionEnd.push(this.xrSessionEnd.bind(this));

        this.tempScaling = new Float32Array(3);
        this.tempScaling.set(this.object.scalingLocal);
        this.visible = false;
        this.object.scale([0, 0, 0]);
    },
    update: function (dt: number) {
        const wasVisible = this.visible;
        if (this.xrHitTestSource) {
            const frame = Module['webxr_frame'];
            
            if (!frame) return;
            let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
            if (hitTestResults.length > 0) {
                let pose = hitTestResults[0].getPose(this.xrViewerSpace);
                this.visible = true;

                const t = new Float32Array(8);
                //quat2.fromMat4(this.object.transformLocal, pose.transform.matrix);
                quat2.fromMat4(t, pose.transform.matrix);
                this.object.transformLocal = t;
                this.object.setDirty();
                
                // this is good;
                // const tw = this.camera.transformPointWorld(new Array(3), new Array(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z));
                // this.target.setTranslationWorld(tw);

                //const tw = this.camera.toWorldSpaceTransform(t);                
                //this.target.transformWorld = tw;
                //console.log("pose", pose.transform.matrix, t, this.object.getTranslationLocal(new Array()), this.object.rotationLocal);
            } else {
                this.visible = false;
            }
        }

        if (this.visible != wasVisible) {
            if (!this.visible) {
                this.tempScaling.set(this.object.scalingLocal);
                this.object.scale([0, 0, 0]);
            } else {
                this.object.scalingLocal.set(this.tempScaling);
                this.object.setDirty();
            }
        }
    },
    xrSessionStart: function (session: XRSession) {
        console.log("Session starting");

        session.requestReferenceSpace('viewer').then(function (refSpac: XRReferenceSpace) {
            this.xrViewerSpace = refSpace;
            session.requestHitTestSource({ space: this.xrViewerSpace }).then(function (hitTestSource: XRHitTestSource) {
                this.xrHitTestSource = hitTestSource;
            }.bind(this)).catch(console.error);
        }.bind(this)).catch(console.error);
    },
    
    xrSessionEnd: function () {
        console.log("Session startendingng");
        if (!this.xrHitTestSource) return;
        this.xrHitTestSource.cancel();
        this.xrHitTestSource = null;
    },
});
