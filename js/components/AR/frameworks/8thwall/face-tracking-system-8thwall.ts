
import { ViewComponent } from "@wonderlandengine/api";
import { TrackingProvider } from "../trackingProvider";
import Setup8thwall from "../../8thwall-setup";
import ARFaceCamera from "../../cameras/AR-face-camera";

class FaceTracking_8thWall extends TrackingProvider {
  public readonly name = "face_tracking_8thwall";

  private view?: ViewComponent;  // cache camera
  private cachedPosition = [0, 0, 0]; // cache 8thwall cam position
  private cachedRotation = [0, 0, 0, -1]; // cache 8thwall cam rotation

  public readonly onFaceFound: any[] = [];
  public readonly onFaceUpdate: any[] = [];
  public readonly onFaceLost: any[] = [];

  // consumed by 8thwall
  public readonly listeners = [
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

  public init() {
    this.view = this.component.object.getComponent("view")!;
  }

  public async startARSession() {
    await Setup8thwall.checkPermissions();
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
    

    console.log("Camera direction",  (this.component as any).cameraDirection);
    XR8.run({
      canvas: Module.canvas as HTMLCanvasElement,
      //allowedDevices: XR8.XrConfig.device().ANY,
      allowedDevices: XR8.XrConfig.device().ANY,
      ownRunLoop: false,
      cameraConfig: {
        direction: XR8.XrConfig.camera().FRONT,
      },
    })
  }

  public stopARSession() {

  }

  /**
  * called by 8thwall
  */
  public onStart = () => {
    Setup8thwall.enableCameraFeed();
  }

  /**
  * @param {*} params 
  * 
  * called by 8thwall
  */
  public onAttach = (_params) => {
    WL.scene.colorClearEnabled = false;
  }

  /**
   * @param {*} e 
   * 
   * called by 8thwall
   */
  public onUpdate = (e: any) => {
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

export default FaceTracking_8thWall;