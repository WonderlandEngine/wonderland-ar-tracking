/**
 * VPSMeshExample
 * Demonstrates how to render a Mesh from the data provided by the 8th Wall.
 * 8th Wall provides the vertices, index and color data for the simplified mesh of the waypoint.
 * So make sure your material supports vertex colors.
 */
import {
    Component,
    Mesh,
    MeshComponent,
    Material,
    Object as WLEObject,
    Type,
    MeshIndexType,
    MeshAttribute,
} from '@wonderlandengine/api';
import {ARSession, ARVPSCamera} from '@wonderlandengine/8thwall-tracking';

export class VPSMeshExample extends Component {
    public static TypeName = 'vps-mesh-example';
    public static Properties = {
        VPSCamera: {type: Type.Object},
        generatedMeshMaterial: {type: Type.Material}, // MAterial to use for the generated mesh
    };

    // injected by WL..
    private VPSCamera!: WLEObject;

    // injected by WL..
    private generatedMeshMaterial!: Material;

    private _mesh: Mesh | null = null;
    private _meshComp: MeshComponent | null = null;

    private _toggleMeshButton!: HTMLButtonElement;

    start() {
        if (!this.VPSCamera) {
            console.warn(`${this.object.name}/${this.type} requires a ${ARVPSCamera}`);
            return;
        }

        const camera = this.VPSCamera.getComponent(ARVPSCamera);

        if (!camera) {
            throw new Error(`${ARVPSCamera.TypeName} was not found on VPSCamera`);
        }

        this._toggleMeshButton = document.createElement('button');
        this._toggleMeshButton.innerHTML = 'Toggle Mesh';
        this._toggleMeshButton.id = 'toggle-vps-mesh-button';
        this._toggleMeshButton.style.lineHeight = '40px';
        this._toggleMeshButton.style.position = 'absolute';
        this._toggleMeshButton.style.top = '0';
        this._toggleMeshButton.style.right = '0';

        this._toggleMeshButton.addEventListener('click', () => {
            if (this._meshComp) {
                this._meshComp.active = !this._meshComp.active;
            }
        });

        ARSession.onSessionStarted.add(() => {
            document.body.appendChild(this._toggleMeshButton);
        });

        ARSession.onSessionEnded.add(() => {
            this._toggleMeshButton.remove();

            if (this._meshComp) {
                this._meshComp.destroy();
                this._mesh!.destroy();

                this._meshComp = null;
                this._mesh = null;
            }
        });

        camera.onMeshFound.add(this.createMesh);
    }

    /**
     * Just a heads up, 8th Wall sends only one mesh to the client
     * and it seems like at that the mesh is not connected to the waypoint in any way.
     */
    private createMesh = (event: XR8VPSMeshFoundEvent) => {
        // #vps-example-debug-text should be created by the ./vps-example.ts
        const debugText = document.querySelector('#vps-example-debug-text');
        if (debugText) {
            debugText.innerHTML += '<br />Mesh received: ' + event.detail.id;
        }

        this._meshComp = this.object.addComponent('mesh', {})!;
        this._meshComp.material = this.generatedMeshMaterial;

        const vertexData = event.detail.geometry.attributes[0].array;
        const colorData = event.detail.geometry.attributes[1].array;
        const indexData = event.detail.geometry.index.array;

        this._mesh = new Mesh(this.engine, {
            vertexCount: vertexData.length,
            indexData,
            indexType: MeshIndexType.UnsignedInt,
        });

        const positions = this._mesh.attribute(MeshAttribute.Position)!;
        // const normals = mesh.attribute(MeshAttribute.Normal);
        const colors = this._mesh.attribute(MeshAttribute.Color)!;

        let ci = 0;
        for (let i = 0; i < colorData.length; i += 3) {
            colors.set(ci, [colorData[i], colorData[i + 1], colorData[i + 2], 1.0]);
            ci++;
        }

        for (let i = 0; i < vertexData.length; i += 3) {
            positions.set(i / 3, [vertexData[i], vertexData[i + 1], vertexData[i + 2]]);
        }

        this._meshComp.mesh = this._mesh;

        const {position, rotation} = event.detail;
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
    };
}
