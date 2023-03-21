/**
 * FaceMaskExample
 * Demonstrates how to create a dynamic mesh of the face.
 * Indices and uvs are provides by 8th Wall right away by 8th wall. Even if no face is tracked yet.
 * Indices ans uvs don't change throughout the experience.
 * 
 * Vertices and normals are updated on every 8th Wall frame.
 */
import {
    Component,
    Material,
    Mesh,
    MeshAttribute,
    MeshComponent,
    MeshIndexType,
    Object as WLEObject,
    Type,
} from '@wonderlandengine/api';

import {ARFaceTrackingCamera} from '@wonderlandengine/8thwall-tracking';

export class FaceMaskExample extends Component {
    public static TypeName = 'face-mask-example';
    public static Properties = {
        ARFaceTrackingCamera: {type: Type.Object},

        // Material to use for the generated mesh
        faceMaskMaterial: {type: Type.Material},
    };

    // injected by WL..
    private ARFaceTrackingCamera!: WLEObject;

    // injected by WL..
    private faceMaskMaterial!: Material;

    // We'll fill this with the mesh data provided by xr8
    private _mesh: Mesh | null = null;

    // component to hold the mesh
    private _meshComp: MeshComponent | null = null;

    start() {
        if (!this.ARFaceTrackingCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARFaceTrackingCamera.TypeName}`
            );
            return;
        }
        const camera = this.ARFaceTrackingCamera.getComponent(ARFaceTrackingCamera);
        if (!camera) {
            throw new Error(
                `${ARFaceTrackingCamera.TypeName} was not found on ARFaceTrackingCamera`
            );
        }

        // allocate some arrays
        const cachedPosition = new Array<number>(3);
        const cachedRotation = new Array<number>(4);
        const cachedScale = [0, 0, 0];

        this.object.scalingWorld = [0, 0, 0];

        if (!this._mesh) {
            this._meshComp = this.object.addComponent('mesh', {})!;
            this._meshComp.material = this.faceMaskMaterial;
        }

        camera.onFaceLoading.push((event) => {
            // XR8 provides us with initial vertices, indices and uvs of the face mesh.
            // We'll be updating the positions and normals of the face mesh in the onFaceUpdate loop
            const {indices, uvs, pointsPerDetection} = event.detail;

            // Covert from {x: number, y: number, z: number} to Array<number> = [x, y, z]
            const indexData = indices.reduce((data: any, current: any) => {
                data.push(...Object.values(current));
                return data;
            }, []);

            // Create mesh
            this._mesh = new Mesh(this.engine, {
                vertexCount: pointsPerDetection,
                indexData,
                indexType: MeshIndexType.UnsignedInt,
            });

            // UV's won't change, fill them right away
            const textureCoordinate = this._mesh!.attribute(
                MeshAttribute.TextureCoordinate
            )!;
            for (let i = 0; i < uvs.length; i++) {
                textureCoordinate.set(i, [uvs[i].u, uvs[i].v]);
            }

            this._meshComp!.mesh = this._mesh;
        });

        camera.onFaceFound.push(this.updateFaceMesh);

        camera.onFaceUpdate.push((event) => {
            this.updateFaceMesh(event);

            const {transform} = event.detail;

            cachedRotation[0] = transform.rotation.x;
            cachedRotation[1] = transform.rotation.y;
            cachedRotation[2] = transform.rotation.z;
            cachedRotation[3] = transform.rotation.w;

            cachedPosition[0] = transform.position.x;
            cachedPosition[1] = transform.position.y;
            cachedPosition[2] = transform.position.z;

            const scale = transform.scale;

            cachedScale[0] = scale;
            cachedScale[1] = scale;
            cachedScale[2] = scale;

            this.object.rotationWorld.set(cachedRotation);
            this.object.setTranslationWorld(cachedPosition);
            this.object.scalingWorld.set(cachedScale);
        });

        camera.onFaceLost.push((_event) => {
            this.object.scalingWorld = [0, 0, 0];
            cachedScale[0] = cachedScale[1] = cachedScale[2] = 0;
        });
    }

    // Update positions, normals of the face mesh
    private updateFaceMesh = (event: any) => {
        const {vertices, normals} = event.detail;

        const meshNormals = this._mesh!.attribute(MeshAttribute.Normal)!;
        const positions = this._mesh!.attribute(MeshAttribute.Position)!;

        for (let i = 0; i < vertices.length; i++) {
            positions.set(i, [vertices[i].x, vertices[i].y, vertices[i].z]);
            meshNormals.set(i, [normals[i].x, normals[i].y, normals[i].z]);
        }
        this._mesh!.update();
    };
}

// WL.registerComponent(FaceMaskExample);
