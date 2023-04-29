import {Component, Property, MeshComponent} from '@wonderlandengine/api';

/**
 * Spawn a mesh on XRSession 'select' event.
 *
 * For mobile AR, 'select' corresponds to a screen tap.
 */
export class SpawnMeshOnSelect extends Component {
    static TypeName = 'spawn-mesh-on-select';
    static Properties = {
        /* The mesh to spawn */
        mesh: Property.mesh(),
        /* The material to spawn the mesh with */
        material: Property.material(),
    };

    start() {
        /* Once a session starts, we want to bind event listeners
         * to the session */
        this.engine.onXRSessionStart.add(this.onXRSessionStart.bind(this));
    }

    onXRSessionStart(s) {
        /* We set this function up to get called when a session starts.
         * The 'select' event happens either on touch or when the trigger
         * button of a controller is pressed.
         * Once that event is triggered, we want spawnMesh() to be called. */
        s.addEventListener('select', this.spawnMesh.bind(this));
    }

    spawnMesh() {
        /* Create a new object in the scene */
        const spawnedObject = this.engine.scene.addObject();
        /* Place new object at current cursor location */
        spawnedObject
            .setTransformLocal(this.object.getTransformWorld())
            .scale([0.25, 0.25, 0.25])
            /* Move out of the floor, at 0.25 scale, the origin of
             * our cube is 0.25 above the floor */
            .translate([0.0, 0.25, 0.0]);

        /* Add a mesh to render the object */
        const mesh = spawnedObject.addComponent(MeshComponent);
        mesh.material = this.material;
        mesh.mesh = this.mesh;
        mesh.active = true;
    }
}
