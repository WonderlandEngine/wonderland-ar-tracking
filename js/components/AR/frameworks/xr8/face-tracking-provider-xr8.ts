
import { ViewComponent } from "@wonderlandengine/api";
import { TrackingProvider } from "../trackingProvider";
import XR8Setup from "./xr8-setup";
import ARFaceTrackingCamera from "../../cameras/AR-face-tracking-camera";


class FaceTracking_XR8 extends TrackingProvider {
  public readonly name = "face_tracking_XR8";

  private view?: ViewComponent;  // cache camera
  private cachedPosition = [0, 0, 0]; // cache 8thwall cam position
  private cachedRotation = [0, 0, 0, -1]; // cache 8thwall cam rotation

  public readonly onFaceFound: Array<(event: any) => void> = [];
  public readonly onFaceUpdate: Array<(event: any) => void> = [];
  public readonly onFaceLost: Array<(event: any) => void> = [];

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
    const input = this.component.object.getComponent("input");
    if (input) {
      input.active = false; // 8thwall will handle the camera pose
    }

    this.view = this.component.object.getComponent("view")!;
  }

  public async startARSession() {
    const permissions = await XR8Setup.checkPermissions();
    
    if(!permissions) {
      return;
    }

    XR8.FaceController.configure({
      meshGeometry: [
        XR8.FaceController.MeshGeometry.FACE,
        XR8.FaceController.MeshGeometry.EYES,
        XR8.FaceController.MeshGeometry.MOUTH,
      ],
      coordinates: { mirroredDisplay: false },
    })

    XR8.addCameraPipelineModules([
      XR8.FaceController.pipelineModule(),
      this,
    ]);

    XR8.run({
      canvas: Module.canvas as HTMLCanvasElement,
      allowedDevices: XR8.XrConfig.device().ANY,
      ownRunLoop: false,
      cameraConfig: {
        direction: (ARFaceTrackingCamera.Properties.cameraDirection.values[(this.component as ARFaceTrackingCamera).cameraDirection]),
      },
    })
  }

  public stopARSession() {
    // TODO
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

export default FaceTracking_XR8;