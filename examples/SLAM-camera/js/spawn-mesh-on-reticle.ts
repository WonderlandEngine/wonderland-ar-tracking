/**
 * Spawns a mesh at the position of this.object.
 * NOTE: in case of WebXR device api tracking (WebXRProvider), click event is raised by the XRSession.onselect event.
 * In case of xr8 tracking - click event is raised by window.onclick
 */
import {Component, Material, Mesh} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {ARSession, ARProvider, WebXRProvider} from '@wonderlandengine/8thwall-tracking';
export class SpawnMeshOnReticle extends Component {
    static TypeName = 'spawn-mesh-on-reticle';

    /**
     * The mesh to spawn
     */
    @property.mesh()
    mesh!: Mesh;

    /**
     * The material to spawn the mesh with
     */
    @property.material()
    material!: Material;

    start() {
        const arSession = ARSession.getSessionForEngine(this.engine);
        arSession.onSessionStart.add(this.onSessionStart.bind(this));
        arSession.onSessionEnd.add(this.onSessionEnd.bind(this));
    }

    onSessionStart(provider: ARProvider) {
        /* We set this function up to get called when a session starts.
         * The 'select' event happens either on touch or when the trigger
         * button of a controller is pressed.
         * Once that event is triggered, we want spawnMesh() to be called. */
        if (provider instanceof WebXRProvider) {
            (provider as WebXRProvider).xrSession!.addEventListener(
                'select',
                this.spawnMesh.bind(this)
            );
        } else {
            window.addEventListener('click', this.spawnMesh);
        }
    }

    onSessionEnd(provider: ARProvider) {
        if (provider instanceof WebXRProvider) {
            // Clean up - let the browser garbage collect the xrSession
            (provider as WebXRProvider).xrSession!.removeEventListener(
                'select',
                this.spawnMesh
            );
        } else {
            window.removeEventListener('click', this.spawnMesh.bind(this));
        }
    }

    spawnMesh() {
        /* Create a new object in the scene */
        const o = this.engine.scene.addObject(null);
        if (!o) {
            console.warn('Failed to add mesh to the scene');
            return;
        }
        /* Place new object at current cursor location */
        o.setTransformLocal(this.object.transformWorld);
        o.scale([0.25, 0.25, 0.25]);
        /* Move out of the floor, at 0.25 scale, the origin of
         * our cube is 0.25 above the floor */
        o.translate([0.0, 0.25, 0.0]);

        /* Add a mesh to render the object */
        const mesh = o.addComponent('mesh', {});
        if (!mesh) {
            console.warn('Failed to add mesh to the object');
            return;
        }
        mesh.material = this.material;
        mesh.mesh = this.mesh;
        mesh.active = true;
    }
}
