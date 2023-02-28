import { Component, Material, Mesh, MeshAttribute, MeshComponent, MeshIndexType, Object as WLEObject, Type } from '@wonderlandengine/api';
import { ARFaceTrackingCamera } from '../../..';

class GlassesExample extends Component {
  public static TypeName = 'glasses-example';
  public static Properties = {
    ARFaceTrackingCamera: { type: Type.Object },
    glasses: { type: Type.Object },
  };

  // injected by WL..
  private ARFaceTrackingCamera!: WLEObject;

  // injected by WL..
  private glasses!: WLEObject;


  start() {
    if (!this.ARFaceTrackingCamera) {
      console.warn(`${this.object.name}/${this.type} requires a ${ARFaceTrackingCamera.TypeName}`);
      return;
    }
    const camera = this.ARFaceTrackingCamera.getComponent(ARFaceTrackingCamera);
    if (!camera) {
      throw new Error(`${ARFaceTrackingCamera.TypeName} was not found on ARFaceTrackingCamera`)
    }

    // allocate some arrays
    const cachedPosition = new Array<number>(3);
    const cachedRotation = new Array<number>(4);
    const cachedScale = [0, 0, 0];

    this.object.scalingWorld = [0, 0, 0];

    camera.onFaceUpdate.push((event) => {

      const { transform, attachmentPoints } = event.detail;
      
      cachedRotation[0] = transform.rotation.x;
      cachedRotation[1] = transform.rotation.y;
      cachedRotation[2] = transform.rotation.z;
      cachedRotation[3] = transform.rotation.w;

      cachedPosition[0] = transform.position.x;
      cachedPosition[1] = transform.position.y;
      cachedPosition[2] = transform.position.z;

      const scale = transform.scale;
      //const scale = transform.scale / 10;

      cachedScale[0] = scale;
      cachedScale[1] = scale;
      cachedScale[2] = scale;

      this.object.rotationWorld.set(cachedRotation);
      this.object.setTranslationWorld(cachedPosition);
      this.object.scalingWorld.set(cachedScale);

      //this.nose.setTranslationWorld([attachmentPoints.noseTip.position.x, attachmentPoints.noseTip.position.y, attachmentPoints.noseTip.position.z]);
      this.glasses.setTranslationLocal([attachmentPoints.noseBridge.position.x, attachmentPoints.noseBridge.position.y, attachmentPoints.noseBridge.position.z])
      // console.log(attachmentPoints);
    })

    camera.onFaceLost.push((_event) => {
      this.object.scalingWorld = [0, 0, 0];
      cachedScale[0] = cachedScale[1] = cachedScale[2] = 0;
    });
  }
}

WL.registerComponent(GlassesExample);