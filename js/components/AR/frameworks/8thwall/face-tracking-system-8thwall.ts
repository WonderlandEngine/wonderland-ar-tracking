
import ARSetup from "../../AR-setup";


const FaceTracking_8thWall = {
  name: "face_tracking_8thwall",
  component: null,
  view: null, // cache camera
  cachedPosition: [0, 0, 0], // cache 8thwall cam position
  cachedRotation: [0, 0, 0, -1], // cache 8thwall cam rotation

  onFaceFound: [],
  onFaceUpdate: [],
  onFaceLost: [],


  init: function (component) {
    this.component = component;
    this.view = this.component.object.getComponent("view");
    this.onUpdate = this.onUpdate.bind(this);
    this.onAttach = this.onAttach.bind(this);

    this.listeners = [
      {
        event: 'facecontroller.facefound', process: (event) => {
          this.onFaceFound.forEach(callback => callback(event));
        }
      },
      {
        event: 'facecontroller.faceupdated', process: (event) => {
          this.onFaceUpdate.forEach(callback => callback(event));
        }
      },
      {
        event: 'facecontroller.facelost', process: (event) => {
          this.onFaceLost.forEach(callback => callback(event));
        }
      },
    ];
  },

  startARSession: function () {
    XR8.FaceController.configure({
      meshGeometry: [
        XR8.FaceController.MeshGeometry.FACE,
        XR8.FaceController.MeshGeometry.EYES,
        XR8.FaceController.MeshGeometry.MOUTH,
      ],
      coordinates: { mirroredDisplay: false },
    })

    XR8.addCameraPipelineModules([
      XR8.GlTextureRenderer.pipelineModule(),
      XR8.FaceController.pipelineModule(),
      this,
    ]);

    XR8.run({
      canvas: Module.canvas as HTMLCanvasElement,
      allowedDevices: XR8.XrConfig.device().ANY,
      ownRunLoop: false,
      cameraConfig: {
        direction: XR8.XrConfig.camera().FRONT,
      },
    })
  },

  stopARSession: function () {

  },

  /**
  * private, called by 8thwall
  */
  onStart: function () {
    ARSetup.enable8thwallCameraFeed();
  },

  /**
    * @param {*} params 
    * 
    * private, called by 8thwall
    */
  onAttach: function (_params) {
    WL.scene.colorClearEnabled = false;
  },

  /**
     * @param {*} e 
     * 
     * private, called by 8thwall
     */
  onUpdate: function (e) {
    const source = e.processCpuResult.facecontroller;
    if (!source)
      return;

    const { rotation, position, intrinsics } = source;

    this.cachedRotation[0] = rotation.x;
    this.cachedRotation[1] = rotation.y;
    this.cachedRotation[2] = rotation.z;
    this.cachedRotation[3] = rotation.w;

    this.cachedPosition[0] = position.x;
    this.cachedPosition[1] = position.y;
    this.cachedPosition[2] = position.z;

    if (intrinsics) {
      for (let i = 0; i < 16; i++) {
        if (Number.isFinite(intrinsics[i])) { // some processCpuResult.reality.intrinsics are set to Infinity, which WL brakes our projectionMatrix. So we just filter those elements out
          this.view.projectionMatrix[i] = intrinsics[i];
        }
      }
    }

    if (position && rotation) {
      this.component.object.rotationWorld = this.cachedRotation;
      this.component.object.setTranslationWorld(this.cachedPosition);
    }
  }
}

export default FaceTracking_8thWall;