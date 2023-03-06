import { Component, Object as WLEObject, Type, MeshComponent, Mesh, MeshIndexType, MeshAttribute, Material } from '@wonderlandengine/api';
import { ARImageTrackingCamera, ARSession } from '../../..';
import { generateCylinderGeometry } from './geometries/CylinderGeomtery';
import { generatePlaneGeomtry } from './geometries/PlaneGeometry';

class VideoTextureImageTarget extends Component {

  public static TypeName = 'video-texture-image-target-example';
  public static Properties = {
    ARImageTrackingCamera: { type: Type.Object },
    imageId: { type: Type.String }, // tracked image ID
    meshMaterial: { type: Type.Material }, // which material to assign to the generated mesh
  };

  // injected by WL..
  private ARImageTrackingCamera!: WLEObject;

  // injected by WL..
  private meshMaterial!: Material;

  // injected by WL..
  private imageId!: string;

  // allocate some arrays
  private cachedPosition = new Array<number>(3);
  private cachedRotation = new Array<number>(4);
  private cachedScale = new Array<number>(3);

  // generated mesh components and it's geometry
  private mesh: Mesh | null = null;
  private meshComp: MeshComponent | null = null;

  // cache videoTexture component
  private videoTextureComp!: Component & { video: HTMLVideoElement };

  // Sometimes the tracking is lost just for a fraction of the second before it's tracked again.
  // In this case we allow sometime before we hide the mesh to reduce the flickering
  private imageLostTimeout = 0;

  start() {
    if (!this.ARImageTrackingCamera) {
      console.warn(`${this.object.name}/${this.type} requires a ${ARImageTrackingCamera.TypeName}`);
      return;
    }

    const camera = this.ARImageTrackingCamera.getComponent(ARImageTrackingCamera);

    if (!camera) {
      throw new Error(`${ARImageTrackingCamera.TypeName} was not found on ARImageTrackingCamera`)
    }

    this.videoTextureComp = this.object.getComponent("video-texture-fixed") as any; // video-texture component is not updated to match @wonderlandengine/api 0.9.8 ("@wonderlandengine/components": "^0.9.2"),

    camera.onImageScanning.push(this.onImageScanned);

    camera.onImageFound.push(this.onImageFound);

    camera.onImageUpdate.push(this.onImageUpdated);

    camera.onImageLost.push((event: XR8ImageTrackedEvent) => {
      if (event.detail.name === this.imageId) {
        this.imageLostTimeout = setTimeout(() => {
          this.meshComp!.active = false;
          this.videoTextureComp.video.pause();
        }, 250);
      }
    });

    ARSession.onSessionEnded.push(() => {
      clearTimeout(this.imageLostTimeout);

      if (this.meshComp) {
        this.meshComp.destroy();
        this.mesh!.destroy();

        this.meshComp = null;
        this.mesh = null;
        this.videoTextureComp.video.pause();
      }
    })
  }

  private createCylinderMesh = (imageData: XR8ImageScanningEvent["detail"]["imageTargets"][0]) => {
    const { geometry } = imageData;
    const length = geometry.arcLengthRadians!;
    return generateCylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, 50, 1, true, ((2 * Math.PI - length) / 2) + Math.PI, length)
  }

  private createFlatMesh = (imageData: XR8ImageScanningEvent["detail"]["imageTargets"][0]) => {
    const { geometry } = imageData;
    return generatePlaneGeomtry(geometry.scaleWidth!, geometry.scaledHeight!);
  }

  private onImageScanned = (event: XR8ImageScanningEvent) => {
    const imageData = event.detail.imageTargets.find(target => target.name === this.imageId);
    if (!imageData) {
      console.error('ImageTarget not found: ', this.imageId);
      return;
    }

    let geometryData;
    if (imageData.type === 'FLAT') {
      geometryData = this.createFlatMesh(imageData);
    }
    else {
      geometryData = this.createCylinderMesh(imageData)
    }

    const { indices, vertices, normals, uvs } = geometryData;

    this.meshComp = this.object.addComponent('mesh', {})!;
    this.meshComp.material = this.meshMaterial;

    this.mesh = new Mesh(this.engine, {
      vertexCount: vertices.length / 3,
      indexData: indices,
      indexType: MeshIndexType.UnsignedInt,
    });

    const meshPositions = this.mesh!.attribute(MeshAttribute.Position)!;
    const meshNormals = this.mesh!.attribute(MeshAttribute.Normal)!;
    const meshUvs = this.mesh!.attribute(MeshAttribute.TextureCoordinate)!;
    for (let i = 0; i < vertices.length; i += 3) {
      meshPositions.set(i / 3, [vertices[i], vertices[i + 1], vertices[i + 2]]);
      meshNormals.set(i / 3, [normals[i], normals[i + 1], normals[i + 2]]);
    }

    for (let i = 0; i < uvs.length; i += 2) {
      meshUvs.set(i / 2, [uvs[i], uvs[i + 1]]);
    }

    this.meshComp.mesh = this.mesh;
    this.meshComp.active = false; // hide until found
  }


  private onImageFound = (event: XR8ImageTrackedEvent) => {
    if (event.detail.name === this.imageId) {
      this.meshComp!.active = true;
      this.onImageUpdated(event);

      //this.videoTextureComp.video.playsInline = true; // might be needed on native video-texture if not fixed yet ("@wonderlandengine/components": "^0.9.2"),
      this.videoTextureComp.video.play();
    }
  }

  private onImageUpdated = (event: XR8ImageTrackedEvent) => {
    if (event.detail.name !== this.imageId) {
      return;
    }

    clearTimeout(this.imageLostTimeout);

    const { rotation, position, scale } = event.detail;

    this.cachedRotation[0] = rotation.x;
    this.cachedRotation[1] = rotation.y;
    this.cachedRotation[2] = rotation.z;
    this.cachedRotation[3] = rotation.w;

    this.cachedPosition[0] = position.x;
    this.cachedPosition[1] = position.y;
    this.cachedPosition[2] = position.z;

    this.cachedScale[0] = scale;
    this.cachedScale[1] = scale;
    this.cachedScale[2] = scale;

    this.object.rotationWorld.set(this.cachedRotation);
    this.object.setTranslationWorld(this.cachedPosition);
    this.object.scalingWorld.set(this.cachedScale);
  }
}
WL.registerComponent(VideoTextureImageTarget);