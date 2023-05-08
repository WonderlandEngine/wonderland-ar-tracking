/**
 * PhysicalSizeImageTarget
 * Renders a textured plane or a cylinder that exactly matches the dimensions of the detected image.
 * for the cylindrical targets, make sure the dimensions are set correctly on the 8th Wall platform.
 */
import {
    Component,
    Object as WLEObject,
    MeshComponent,
    Mesh,
    MeshIndexType,
    MeshAttribute,
    Material,
} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {quat, vec3} from 'gl-matrix';

import {ARSession, ARImageTrackingCamera, ImageScanningEvent, ImageTrackedEvent} from '@wonderlandengine/ar-tracking';
import {generateCylinderGeometry} from './geometries/cylinder-geomtery.js';
import {generatePlaneGeomtry} from './geometries/plane-geometry.js';

export class PhysicalSizeImageTarget extends Component {
    static TypeName = 'physical-size-image-target-example';

    /**
     * The ARImageTrackingCamera somewhere in the scene
     */
    @property.object()
    ARImageTrackingCamera!: WLEObject;

    /**
     * Image id from the 8th Wall platform
     */
    @property.string()
    imageId!: string;

    /**
     * Object which should be attached to the face feature
     */
    @property.material()
    meshMaterial!: Material;

    // allocate some arrays
    private _cachedPosition = new Float32Array(4);
    private _cachedScale = new Array<number>(3);

    // Because the tracking might not be super stable - sometimes it feels like the the tracked image is a bit "jumping" around.
    // We can try to fix if by caching the tracked pose and interpolating the mesh pose on each frame.
    // This does introduce some calculations on each frame, but might make the experience a bit more pleasant
    private _cachedTrackedRotation = quat.create();
    private _cachedTrackedPosition = vec3.create();

    // generated mesh components and it's geometry
    private _mesh: Mesh | null = null;
    private _meshComp: MeshComponent | null = null;

    // Sometimes the tracking is lost just for a fraction of the second before it's tracked again.
    // In this case we allow sometime before we hide the mesh to reduce the flickering.
    private _imageLostTimeout = 0;

    start() {
        if (!this.ARImageTrackingCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARImageTrackingCamera.TypeName}`
            );
            return;
        }

        const camera = this.ARImageTrackingCamera.getComponent(ARImageTrackingCamera);

        if (!camera) {
            throw new Error(
                `${ARImageTrackingCamera.TypeName} was not found on ARImageTrackingCamera`
            );
        }

        camera.onImageScanning.add(this.onImageScanned);

        camera.onImageFound.add(this.onImageFound);

        camera.onImageUpdate.add(this.onImageUpdated);

        camera.onImageLost.add((event) => {
            if (event.name === this.imageId) {
                this._imageLostTimeout = setTimeout(() => {
                    this._meshComp!.active = false;
                }, 250);
            }
        });

        if (!this._meshComp) {
            this._meshComp = this.object.addComponent('mesh', {})!;
            this._meshComp.material = this.meshMaterial;
        }

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            clearTimeout(this._imageLostTimeout);
            this._meshComp!.active = false;
        });
    }

    private createCylinderMesh = (
        imageData: ImageScanningEvent['imageTargets'][0]
    ) => {
        const {geometry} = imageData;
        const length = geometry.arcLengthRadians!;
        return generateCylinderGeometry(
            geometry.radiusTop,
            geometry.radiusBottom,
            geometry.height,
            50,
            1,
            true,
            (2 * Math.PI - length) / 2 + Math.PI,
            length
        );
    };

    private createFlatMesh = (
        imageData: ImageScanningEvent['imageTargets'][0]
    ) => {
        const {geometry} = imageData;
        return generatePlaneGeomtry(geometry.scaleWidth!, geometry.scaledHeight!);
    };

    private onImageScanned = (event: ImageScanningEvent) => {
        const imageData = event.imageTargets.find(
            (target) => target.name === this.imageId
        );
        if (!imageData) {
            console.error('ImageTarget not found: ', this.imageId);
            return;
        }

        let geometryData;
        if (imageData.type === 'FLAT') {
            geometryData = this.createFlatMesh(imageData);
        } else {
            geometryData = this.createCylinderMesh(imageData);
        }

        const {indices, vertices, normals, uvs} = geometryData;

        // this._meshComp = this.object.addComponent('mesh', {})!;
        //  this._meshComp.material = this.meshMaterial;

        this._mesh = new Mesh(this.engine, {
            vertexCount: vertices.length / 3,
            indexData: indices,
            indexType: MeshIndexType.UnsignedInt,
        });

        const meshPositions = this._mesh!.attribute(MeshAttribute.Position)!;
        const meshNormals = this._mesh!.attribute(MeshAttribute.Normal)!;
        const meshUvs = this._mesh!.attribute(MeshAttribute.TextureCoordinate)!;
        for (let i = 0; i < vertices.length; i += 3) {
            meshPositions.set(i / 3, [vertices[i], vertices[i + 1], vertices[i + 2]]);
            meshNormals.set(i / 3, [normals[i], normals[i + 1], normals[i + 2]]);
        }

        for (let i = 0; i < uvs.length; i += 2) {
            meshUvs.set(i / 2, [uvs[i], uvs[i + 1]]);
        }

        this._meshComp!.mesh = this._mesh;
        this._meshComp!.active = false; // hide until found
    };

    private onImageFound = (event: ImageTrackedEvent) => {
        if (event.name === this.imageId) {
            this._meshComp!.active = true;
            this.onImageUpdated(event);

            quat.lerp(
                this.object.rotationWorld,
                this.object.rotationWorld,
                this._cachedTrackedRotation,
                1
            );
            vec3.lerp(
                this._cachedPosition,
                this._cachedPosition,
                this._cachedTrackedPosition,
                1
            );
            this.object.setPositionWorld(this._cachedPosition);
        }
    };

    private onImageUpdated = (event: ImageTrackedEvent) => {
        if (event.name !== this.imageId) {
            return;
        }

        clearTimeout(this._imageLostTimeout);

        const {rotation, position, scale} = event;

        quat.set(
            this._cachedTrackedRotation,
            rotation.x,
            rotation.y,
            rotation.z,
            rotation.w
        );
        vec3.set(this._cachedTrackedPosition, position.x, position.y, position.z);

        this._cachedScale[0] = scale;
        this._cachedScale[1] = scale;
        this._cachedScale[2] = scale;

        this.object.setScalingWorld(this._cachedScale);
    };

    update() {
        if (this._meshComp?.active === false) {
            return;
        }

        const rotationWorld = this.object.getRotationWorld()
        quat.lerp(
            rotationWorld,
            rotationWorld,
            this._cachedTrackedRotation,
            0.9
        );
        vec3.lerp(
            this._cachedPosition,
            this._cachedPosition,
            this._cachedTrackedPosition,
            0.9
        );

        this.object.setRotationWorld(rotationWorld);
        this.object.setPositionWorld(this._cachedPosition);
    }
}
