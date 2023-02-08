
import { ViewComponent } from '@wonderlandengine/api';
import { TrackingProvider } from '../trackingProvider';

import XR8Setup from './xr8-setup';

// Just some helper types to determine if an object has some props
type CanDisableSLAM = {
  EnableSLAM: boolean,
}

type CanUseAbsoluteScale = {
  UseAbsoluteScale: boolean
}

class WorldTracking_XR8 extends TrackingProvider {
  // consumed by 8thwall
  public readonly name = 'world_tracking_XR8';

  private view?: ViewComponent; // cache camera
  private cachedPosition = [0, 0, 0]; // cache 8thwall cam position
  private cachedRotation = [0, 0, 0, -1]; // cache 8thwall cam rotation

  public readonly onImageFound: Array<(event: any) => void> = [];
  public readonly onImageUpdate: Array<(event: any) => void> = [];
  public readonly onImageLost: Array<(event: any) => void> = [];

  // consumed by 8thwall
  public readonly listeners = [
    {
      event: 'reality.trackingstatus', process: (e) => {
        // console.log('reality status', e);
      },
    },
    {
      event: 'reality.imagefound', process: (event) => {
        this.onImageFound.forEach(callback => callback(event));
      }
    },
    {
      event: 'reality.imageupdated', process: (event) => {
        this.onImageUpdate.forEach(callback => callback(event));
      }
    },
    {
      event: 'reality.imagelost', process: (event) => {
        this.onImageLost.forEach(callback => callback(event));
      }
    },

  ];

  public init() {
    const input = this.component.object.getComponent('input');
    if (input) {
      input.active = false; // 8thwall will handle the camera pose
    }

    this.view = this.component.object.getComponent('view')!;

    const rot = this.component.object.rotationWorld;
    const pos = this.component.object.getTranslationWorld([]);

    this.cachedPosition[0] = pos[0];
    this.cachedPosition[1] = pos[1];
    this.cachedPosition[2] = pos[2];

    this.cachedRotation[0] = rot[0];
    this.cachedRotation[1] = rot[1];
    this.cachedRotation[2] = rot[2];
    this.cachedRotation[3] = rot[3];
  }

  public async startARSession() {
    const permissions = await XR8Setup.checkPermissions();
    if (!permissions) {
      return;
    }

    const componentEnablesSLAM = (this.component as Partial<CanDisableSLAM>).EnableSLAM;
    const componentUsesAbsoluteScale = (this.component as Partial<CanUseAbsoluteScale>).UseAbsoluteScale;

    XR8.XrController.configure({
      // enableLighting: true,
      disableWorldTracking: componentEnablesSLAM === undefined ? false : !componentEnablesSLAM, // invert componentEnablesSLAM
      scale: componentUsesAbsoluteScale === undefined ? 'responsive' : (componentUsesAbsoluteScale ? 'absolute' : 'responsive')
    });

    console.log('Whats the scale', componentUsesAbsoluteScale === undefined ? 'responsive' : (componentUsesAbsoluteScale ? 'absolute' : 'responsive'))
    console.log('Whats the world tracking', componentEnablesSLAM === undefined ? false : !componentEnablesSLAM);


    XR8.addCameraPipelineModules([
      XR8.XrController.pipelineModule(),
      this,
    ]);

    const options = {
      canvas: Module.canvas as HTMLCanvasElement,
      allowedDevices: XR8.XrConfig.device().ANY,
      ownRunLoop: false,
      cameraConfig: {
        direction: XR8.XrConfig.camera().BACK
      },
    };
    XR8Setup.run(options)
  }


  public stopARSession() {
    XR8.stop();
    console.log('Stoping XR8 world tracking');
    XR8.removeCameraPipelineModules([
      XR8.XrController.pipelineModule(),
      this,
    ])
  }

  /**
  * called by 8thwall
  */
  public onAttach = (_params) => {
    console.log('Attaching world tracking provider');
    // Sync the xr controller's 6DoF position and camera paremeters with our camera.
    // const rot = this.component.object.rotationWorld;
    // const pos = this.component.object.getTranslationWorld([]);
    XR8.XrController.updateCameraProjectionMatrix({
      origin: { x: this.cachedPosition[0], y: this.cachedPosition[1], z: this.cachedPosition[2] },
      facing: { x: this.cachedRotation[0], y: this.cachedRotation[1], z: this.cachedRotation[2], w: this.cachedRotation[3] },
      cam: { pixelRectWidth: Module.canvas.width, pixelRectHeight: Module.canvas.height, nearClipPlane: 0.01, farClipPlane: 100 }
    })
  }

  /**
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
      const projectionMatrix = this.view!.projectionMatrix;
      for (let i = 0; i < 16; i++) {
        if (Number.isFinite(intrinsics[i])) { // some processCpuResult.reality.intrinsics are set to Infinity, which WL brakes our projectionMatrix. So we just filter those elements out
          projectionMatrix[i] = intrinsics[i];
        }
      }
    }

    if (position && rotation) {
      this.component.object.rotationWorld = this.cachedRotation;
      this.component.object.setTranslationWorld(this.cachedPosition);
    }
  }
}

export default WorldTracking_XR8;