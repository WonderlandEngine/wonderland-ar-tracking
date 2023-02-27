import { Component, Object as WLEObject, Type, MeshComponent } from '@wonderlandengine/api';
import { ARImageTrackingCamera } from '../../../';

class ImageTrackingExample extends Component {

  public static TypeName = 'image-tracking-example';
  public static Properties = {
    ARImageTrackingCamera: { type: Type.Object },
    imageId: { type: Type.String },
  };
  // injected by WL..
  private ARImageTrackingCamera!: WLEObject;

  // injected by WL..
  private imageId!: string;


  // allocate some arrays
  private cachedPosition = new Array<number>(3);
  private cachedRotation = new Array<number>(4);
  private cachedScale = new Array<number>(3);


  private mesh: MeshComponent | null = null;


  start() {
    if (!this.ARImageTrackingCamera) {
      console.warn(`${this.object.name}/${this.type} requires a ${ARImageTrackingCamera.TypeName}`);
      return;
    }

    const camera = this.ARImageTrackingCamera.getComponent(ARImageTrackingCamera);

    if (!camera) {
      throw new Error(`${ARImageTrackingCamera.TypeName} was not found on ARImageTrackingCamera`)
    }

    //const mesh = this.object.getComponent(MeshComponent) // <-- fails, issue reported 
    this.mesh = this.object.getComponent('mesh');
    if (!this.mesh) {
      return;
    }

    

    // hide by default
    this.mesh.active = false;


    camera.onImageFound.push(this.onImageFound);

    camera.onImageUpdate.push(this.onImageUpdated);

    camera.onImageLost.push((event: XR8ImageTrackedEvent) => {
      if (event.detail.name === this.imageId) {
       this.mesh!.active = false;
      }
    });
  }

  private onImageFound = (event: XR8ImageTrackedEvent) => {
    if (event.detail.name === this.imageId) {
      this.mesh!.active = true;
      this.onImageUpdated(event);
    }
  }

  private onImageUpdated = (event: XR8ImageTrackedEvent) => {
    if (event.detail.name !== this.imageId) {
      return
    }

    const { rotation, position, scale } = event.detail

    this.cachedRotation[0] = rotation.x;
    this.cachedRotation[1] = rotation.y;
    this.cachedRotation[2] = rotation.z;
    this.cachedRotation[3] = rotation.w;

    this.cachedPosition[0] = position.x;
    this.cachedPosition[1] = position.y;
    this.cachedPosition[2] = position.z;

    this.cachedScale[0] = scale / 10;
    this.cachedScale[1] = scale / 10;
    this.cachedScale[2] = scale / 10;

    this.object.rotationWorld.set(this.cachedRotation);
    this.object.setTranslationWorld(this.cachedPosition);
    this.object.scalingWorld.set(this.cachedScale);
  }
}
WL.registerComponent(ImageTrackingExample);