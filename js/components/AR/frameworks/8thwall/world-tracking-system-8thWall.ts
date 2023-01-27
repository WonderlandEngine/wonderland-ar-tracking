
import ARSetup from "../../AR-setup";

const WorldTracking_8thWall = {
  name: "world_tracking_8thwall",
  component: null,
  view: null, // cache camera
  cachedPosition: [0, 0, 0], // cache 8thwall cam position
  cachedRotation: [0, 0, 0, -1], // cache 8thwall cam rotation

  init: function (component) {
    this.component = component;
    this.view = this.component.object.getComponent("view");
    this.onUpdate = this.onUpdate.bind(this);
    this.onAttach = this.onAttach.bind(this);
  },

  listeners: [
    {
      event: 'reality.trackingstatus', process: (e) => {
        // console.log("reality status", e);
      }
    },
  ],

  startARSession: function () {
    XR8.XrController.configure({
      // enableLighting: true,
      // disableWorldTracking: false,
      //scale: 'absolute'
    });

    XR8.addCameraPipelineModules([
      XR8.GlTextureRenderer.pipelineModule(),
      XR8.XrController.pipelineModule(),
      this,
    ]);

    XR8.run({
      canvas: Module.canvas as HTMLCanvasElement,
      allowedDevices: XR8.XrConfig.device().ANY,
      ownRunLoop: false,
      cameraConfig: {
        direction: XR8.XrConfig.camera().BACK,
      },
    })
  },


  stopARSession: function () {
    // TODO: 
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
    // Sync the xr controller's 6DoF position and camera paremeters with our camera.
    const rot = this.component.object.rotationWorld;
    const pos = this.component.object.getTranslationWorld([]);
    XR8.XrController.updateCameraProjectionMatrix({
      origin: { x: pos[0], y: pos[1], z: pos[2] },
      facing: { x: rot[0], y: rot[1], z: rot[2], w: rot[3] },
      cam: { pixelRectWidth: Module.canvas.width, pixelRectHeight: Module.canvas.height, nearClipPlane: 0.01, farClipPlane: 100 }
    })
    //Factory.add8thwallCameraFeed();
  },

  /**
     * @param {*} e 
     * 
     * private, called by 8thwall
     */
  onUpdate: function (e) {
    const source = e.processCpuResult.reality;
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
  },
}

export default WorldTracking_8thWall;