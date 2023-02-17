import { Component, Material, Mesh, MeshComponent, Object as WLEObject } from '@wonderlandengine/api';

import ARVPSCamera from '../AR/cameras/AR-VPS-camera';
// import meshData from './mesh-data.js';

class VPSMultiplayer extends Component {
  public static TypeName = 'vps-multiplayer-example';
  public static Properties = {
    VPSCamera: { type: WL.Type.Object },
    playerMesh: { type: WL.Type.Mesh },
    playerMaterial: { type: WL.Type.Material },

  };
  // injected by WL..
  private VPSCamera!: WLEObject;

  // injected by WL..
  private playerMesh!: Mesh;

  // injected by WL..
  private playerMaterial!: Material;

  private socket!: WebSocket;

  private id: string = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  private players: Map<string, WLEObject> = new Map();

  private mesh!: MeshComponent;

  start() {
    if (!this.VPSCamera) {
      console.warn(`${this.object.name}/${this.type} requires a ${ARVPSCamera.TypeName}`);
      return;
    }

    const camera = this.VPSCamera.getComponent(ARVPSCamera);

    if (!camera) {
      throw new Error(`${ARVPSCamera.TypeName} was not found on VPSCamera`)
    }
    this.mesh = this.object.getComponent('mesh')!;
    this.mesh.active = false;

    camera.onWaySpotFound.push(this.updateModelPose)
    camera.onWaySpotUpdated.push(this.updateModelPose)

    camera.onWaySpotLost.push(() => {
      //this.mesh.active = false;
    })

    camera.onMeshFound.push(this.createMesh)

    this.createWsClient();

    (window as any).ooobject = this.object;
  }

  private createWsClient = () => {
    // Create WebSocket connection.
    this.socket = new WebSocket('wss://10.10.4.46:443');

    // Connection opened
    this.socket.addEventListener('open', (event) => {
      this.socket.send(JSON.stringify({
        id: this.id,
        type: 'open',
      }));
    });

    // Listen for messages
    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === this.id) {
          return;
        }
       
        if (!this.players.has(data.id)) {
          console.log("Creating player", data);
          const player = WL.scene.addObject(this.object) as WLEObject;
          player.name = data.id;
          player.scalingLocal = [0.05, 0.05, 0.05];

          const mesh = player.addComponent('mesh', {});
          mesh.mesh = this.playerMesh;
          mesh.material = this.playerMaterial
          mesh.active = true;
          this.players.set(data.id, player);
        }

        const player = this.players.get(data.id)!;
        switch (data.type) {
          case 'pose':
              player.setTranslationLocal(Object.values(data.transform));
            break;
          case 'close':
            console.log("Received a close event", data.id);
            this.players.delete(data.id);
            player.destroy();
            break;
          default:
            break;
        }

        //console.log("OBject values", Object.values(data.transform))
        /*
        player.rotationLocal.set(rotation);
        player.setTranslationLocal(position);*/

      } catch (error) {
        console.error(error);
      }
    });
  }

  private createMesh = (data: unknown) => {
    console.log("Create mesh", data);
  }

  private updateModelPose = (event: any) => {
    console.log("Updating mode");
    //this.mesh.active = true;
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
  private tik = 0;
  update(delta: number): void {
    if(this.socket && this.socket.readyState === this.socket.OPEN) {
     /* if(this.tik++ < 100) {
        return;
      }

      this.tik = 0;*/
      //const cameraTransform = this.object.toLocalSpaceTransform(new Float32Array(8), this.VPSCamera.transformWorld);
      //const cameraTransform = this.object.toObjectSpaceTransform(new Float32Array(8), this.VPSCamera.transformWorld);
      const cameraPosition = this.object.transformPointInverseWorld(new Float32Array(3), this.VPSCamera.getTranslationWorld(new Float32Array(3)));

     // console.log("Camera posit", cameraPosition);

      const data = {
        id: this.id,
        type: 'pose',
        transform: cameraPosition    
      };
      
      this.socket.send(JSON.stringify(data));
    }
  }
}

WL.registerComponent(VPSMultiplayer);
