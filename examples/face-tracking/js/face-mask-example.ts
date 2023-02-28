import { Component, Material, Mesh, MeshAttribute, MeshComponent, MeshIndexType, Object as WLEObject, Type } from '@wonderlandengine/api';
import { ARFaceTrackingCamera } from '../../..';

class FaceMaskExample extends Component {
  public static TypeName = 'face-mask-example';
  public static Properties = {
    ARFaceTrackingCamera: { type: Type.Object },  
    faceMaskMaterial: { type: Type.Material }, // MAterial to use for the generated mesh
  };

  // injected by WL..
  private ARFaceTrackingCamera!: WLEObject;

  // injected by WL..
  private faceMaskMaterial!: Material;


  private mesh: Mesh | null = null;
  private meshComp: MeshComponent | null = null;

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

    if (!this.mesh) {
      this.meshComp = this.object.addComponent('mesh', {})!;
      this.meshComp.material = this.faceMaskMaterial;
    }


    camera.onFaceLoading.push(event => {
      
      const { indices, uvs, pointsPerDetection } = event.detail;

      const indexData = indices.reduce((data: any, current: any) => {
        data.push(...Object.values(current));
        return data;
      }, []);

      this.mesh = new Mesh({
        vertexCount: pointsPerDetection,
        indexData,
        indexType: MeshIndexType.UnsignedInt,
      });

      const textureCoordinate = this.mesh!.attribute(MeshAttribute.TextureCoordinate)!;

      for (let i = 0; i < uvs.length; i++) {
        textureCoordinate.set(i, [uvs[i].u, uvs[i].v]);
      }

      this.meshComp!.mesh = this.mesh;
    });

    camera.onFaceFound.push(this.updateFaceMesh);

    camera.onFaceUpdate.push((event) => {

      this.updateFaceMesh(event);

      const { transform } = event.detail;
      
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
    })

    camera.onFaceLost.push((_event) => {
      this.object.scalingWorld = [0, 0, 0];
      cachedScale[0] = cachedScale[1] = cachedScale[2] = 0;
    });
  }

  private updateFaceMesh = (event: any) => {
    const { vertices, normals } = event.detail;

    const meshNormals = this.mesh!.attribute(MeshAttribute.Normal)!;
    const positions = this.mesh!.attribute(MeshAttribute.Position)!;
    const uvs = this.mesh!.attribute(MeshAttribute.TextureCoordinate)!;

    for (let i = 0; i < vertices.length; i++) {
      positions.set(i, [vertices[i].x, vertices[i].y, vertices[i].z]);
      meshNormals.set(i, [normals[i].x, normals[i].y, normals[i].z]);
    }
    this.mesh!.update();
  }
}

WL.registerComponent(FaceMaskExample);