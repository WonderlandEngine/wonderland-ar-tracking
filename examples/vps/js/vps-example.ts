import { Component, Mesh, MeshComponent, Material, Object as WLEObject, Type, MeshIndexType, MeshAttribute } from '@wonderlandengine/api';
import { ARSession } from '../../../src/components/AR/AR-session';

import { ARVPSCamera } from '../../../src/components/AR/cameras/AR-VPS-camera';
// import meshData from './mesh-data.js';

class VPSExample extends Component {
  public static TypeName = 'vps-example';
  public static Properties = {
    VPSCamera: { type: Type.Object },
    generatedMeshMaterial: { type: Type.Material }, // MAterial to use for the generated mesh
  };

  // injected by WL..
  private VPSCamera!: WLEObject;

  // injected by WL..
  private generatedMeshMaterial!: Material;

  // injected by WL..
  private positionIndicator!: Material;

  private mesh: Mesh | null = null;
  private meshComp: MeshComponent | null = null;


  private toggleMeshButton!: HTMLButtonElement;
  private debugText!: HTMLDivElement;

  start() {
    if (!this.VPSCamera) {
      console.warn(`${this.object.name}/${this.type} requires a ${ARVPSCamera.TypeName}`);
      return;
    }

    const camera = this.VPSCamera.getComponent(ARVPSCamera);

    if (!camera) {
      throw new Error(`${ARVPSCamera.TypeName} was not found on VPSCamera`)
    }

    this.toggleMeshButton = document.createElement("button");
    this.toggleMeshButton.innerHTML = "Toggle Mesh";
    this.toggleMeshButton.style.lineHeight = "40px";
    this.toggleMeshButton.style.position = "absolute";
    this.toggleMeshButton.style.top = "0";
    this.toggleMeshButton.style.right = "0";

    this.toggleMeshButton.addEventListener('click', () => {
      if (this.meshComp) {
        this.meshComp.active = !this.meshComp.active;
      }
    });

    this.debugText = document.createElement("div");
    this.debugText.style.fontSize = "14px";
    this.debugText.style.position = "absolute";
    this.debugText.style.bottom = "0";
    this.debugText.style.left = "0";
    this.debugText.style.color = "white";
    this.debugText.style.textShadow = "2px 2px 4px #FFFF00";

    ARSession.onSessionStarted.push(() => {
      document.body.appendChild(this.toggleMeshButton);
      document.body.appendChild(this.debugText);
      this.debugText.innerHTML = "Looking for a waypoint";
    })

    ARSession.onSessionEnded.push(() => {
      this.toggleMeshButton.remove();
      this.debugText.remove();

      if (this.meshComp) {
        this.meshComp.destroy();
        this.mesh!.destroy();

        this.meshComp = null;
        this.mesh = null;
      }
    })


    camera.onWaySpotFound.push(this.wayspotFound)
    camera.onWaySpotUpdated.push(this.updateModelPose)
    camera.onWaySpotLost.push(() => {
      //this.mesh.active = false;
      this.debugText.innerHTML += "<br />Way spot lost";
    })

    camera.onMeshFound.push(this.createMesh)
  }

  private createMesh = (meshData: any) => {
    this.debugText.innerHTML += "<br />Mesh received";
    this.meshComp = this.object.addComponent('mesh', {})!;
    this.meshComp.material = this.generatedMeshMaterial;

    const vertexData = meshData.detail.geometry.attributes[0].array;
    const colorData = meshData.detail.geometry.attributes[1].array;
    const indexData = meshData.detail.geometry.index.array;

    this.mesh = new Mesh({
      vertexCount: vertexData.length,
      indexData,
      indexType: MeshIndexType.UnsignedInt,
    });


    const positions = this.mesh.attribute(MeshAttribute.Position)!;
    // const normals = mesh.attribute(WL.MeshAttribute.Normal);
    const colors = this.mesh.attribute(MeshAttribute.Color)!;

    let ci = 0;
    for (let i = 0; i < colorData.length; i += 3) {
      colors.set(ci, [colorData[i], colorData[i + 1], colorData[i + 2], 1.0]);
      ci++;
    }

    for (let i = 0; i < vertexData.length; i += 3) {
      positions.set(i / 3, [vertexData[i], vertexData[i + 1], vertexData[i + 2]]);
    }


    this.meshComp.mesh = this.mesh;

    const { position, rotation } = meshData.detail
    const cachedPosition = [];
    const cachedRotation = [];

    cachedRotation[0] = rotation.x;
    cachedRotation[1] = rotation.y;
    cachedRotation[2] = rotation.z;
    cachedRotation[3] = rotation.w;

    cachedPosition[0] = position.x;
    cachedPosition[1] = position.y;
    cachedPosition[2] = position.z;

    this.object.rotationWorld.set(cachedRotation);
    this.object.setTranslationWorld(cachedPosition);
  }

  private wayspotFound = (event: any) => {
    this.debugText.innerHTML += "<br />Way spot found";
    this.updateModelPose(event);
  }

  private updateModelPose = (event: any) => {
    this.debugText.innerHTML += "<br />Way spot updated";
    const { position, rotation } = event.detail
    const cachedPosition = [];
    const cachedRotation = [];

    cachedRotation[0] = rotation.x;
    cachedRotation[1] = rotation.y;
    cachedRotation[2] = rotation.z;
    cachedRotation[3] = rotation.w;

    cachedPosition[0] = position.x;
    cachedPosition[1] = position.y;
    cachedPosition[2] = position.z;

    this.object.rotationWorld.set(cachedRotation);
    this.object.setTranslationWorld(cachedPosition);

  }
}

WL.registerComponent(VPSExample);
