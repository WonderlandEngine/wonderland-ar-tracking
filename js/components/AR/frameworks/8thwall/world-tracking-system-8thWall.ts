
import { ViewComponent } from "@wonderlandengine/api";
import { TrackingProvider } from "../trackingProvider";

import Setup8thwall from "../../8thwall-setup";

class WorldTracking_8thWall extends TrackingProvider {
  // consumed by 8thwall
  public readonly name = "world_tracking_8thwall";

  private view?: ViewComponent; // cache camera
  private cachedPosition = [0, 0, 0]; // cache 8thwall cam position
  private cachedRotation = [0, 0, 0, -1]; // cache 8thwall cam rotation

  // consumed by 8thwall
  public readonly listeners = [
    {
      event: 'reality.trackingstatus', process: (e) => {
        // console.log("reality status", e);
      }
    }
  ];

  public init() {
    this.view = this.component.object.getComponent("view")!;
    //this.onUpdate = this.onUpdate.bind(this);
    //this.onAttach = this.onAttach.bind(this);
  }

  public async startARSession() {
    console.log("Wtarting AR session");
    const me = await Setup8thwall.checkPermissions();
    console.log("What a me", me);

    XR8.XrController.configure({
      // enableLighting: true,
      disableWorldTracking: false,
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
  }


  public stopARSession() {
    // TODO: 
  }

  /**
  * called by 8thwall
  */
  public onStart = () => {
    Setup8thwall.enableCameraFeed()
  }

  /**
  * @param {*} params 
  * 
  * called by 8thwall
  */
  public onAttach = (_params) => {
    // Sync the xr controller's 6DoF position and camera paremeters with our camera.
    const rot = this.component.object.rotationWorld;
    const pos = this.component.object.getTranslationWorld([]);
    XR8.XrController.updateCameraProjectionMatrix({
      origin: { x: pos[0], y: pos[1], z: pos[2] },
      facing: { x: rot[0], y: rot[1], z: rot[2], w: rot[3] },
      cam: { pixelRectWidth: Module.canvas.width, pixelRectHeight: Module.canvas.height, nearClipPlane: 0.01, farClipPlane: 100 }
    })
    //Factory.add8thwallCameraFeed();
  }

  /**
   * @param {*} e 
   * 
   * called by 8thwall
   */
  public onUpdate = (e) => {
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
          this.view!.projectionMatrix[i] = intrinsics[i];
        }
      }
    }

    if (position && rotation) {
      this.component.object.rotationWorld = this.cachedRotation;
      this.component.object.setTranslationWorld(this.cachedPosition);
    }
  }
}

export default WorldTracking_8thWall;