/**
 * AbsoluteScaleWatcher
 * Demonstrates the use of absolute scale feature of the 8th Wall SLAM camera.
 * Absolute scale is the 8th Wall feature where the SLAM tracking provides the pose of the smartphone
 * in real dimensional units (aka meters) relative to the physical surface the camera is pointing at.
 * NOTE: it takes a while for the 8th Wall to resolve the this 'absolute' pose
 *
 * Basically when camera.onTrackingStatus is NORMAL - tracking in absolute scale
 * If camera.onTrackingStatus is anything else - tracking in relative (aka non physically correct dimensions)
 */
import {Component, Object as WLEObject, Mesh, Material} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {vec3} from 'gl-matrix';

import {ARSession} from '@wonderlandengine/8thwall-tracking';
import {ARXR8SLAMCamera} from '@wonderlandengine/8thwall-tracking';

export class AbsoluteScaleWatcher extends Component {
    public static TypeName = 'absolute-scale-watcher';

    /**
     * The ARXR8SLAMCamera somewhere in the scene
     */
    @property.object()
    ARXR8SLAMCamera!: WLEObject;

    /**
     * Mesh to spawn
     */
    @property.mesh()
    mesh!: Mesh;

    /**
     * Spawned mesh material
     */
    @property.material()
    material!: Material;

    private _tracking = false;

    private _camForward = vec3.create();
    private _intersectionVec3 = vec3.create();
    private _tmpWorldPosition = vec3.create();

    start() {
        if (!this.ARXR8SLAMCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARXR8SLAMCamera.TypeName}`
            );
            return;
        }
        const camera = this.ARXR8SLAMCamera.getComponent(ARXR8SLAMCamera);

        if (!camera) {
            throw new Error(`${ARXR8SLAMCamera.TypeName} was not found on ARXR8SLAMCamera`);
        }

        const div = document.createElement('div');
        div.style.position = 'absolute';

        div.style.padding = '10px 30px';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        div.style.textAlign = 'center';
        div.style.color = '#fff';
        div.style.fontSize = '20px';
        div.style.fontFamily = 'sans-serif';
        div.style.top = '50%';
        div.style.width = '100%';
        div.style.display = 'none';
        div.style.boxSizing = 'border-box';
        div.innerHTML =
            'Move your camera back and forth<br /> until the absolute scale can be detected. <br /> Depending on the device and lightning conditions - this might take some time.';
        document.body.appendChild(div);

        window.addEventListener('click', this.spawnMesh);

        ARSession.onSessionEnded.add(() => {
            div.style.display = 'none';
            this._tracking = false;
        });

        camera.onTrackingStatus.add((event) => {
            if (event.detail.status === 'NORMAL') {
                div.style.display = 'none';
                this._tracking = true;
                this.object.scalingWorld = [1, 1, 1];
            } else {
                this._tracking = false;
                div.style.display = 'block';
                this.object.scalingWorld = [0, 0, 0];
            }
        });
    }

    update() {
        if (this._tracking) {
            this.ARXR8SLAMCamera.getForward(this._camForward);

            /* Intersect with origin XY plane. We always intersect if camera facing downwards */
            if (this._camForward[1] < 0) {
                this.ARXR8SLAMCamera.getTranslationWorld(this._tmpWorldPosition);
                const t = -this._tmpWorldPosition[1] / this._camForward[1];
                vec3.add(
                    this._intersectionVec3,
                    this._tmpWorldPosition,
                    vec3.scale(this._intersectionVec3, this._camForward, t)
                );
                this.object.setTranslationWorld(this._intersectionVec3);
            }
        }
    }

    spawnMesh = () => {
        if (!this._tracking) {
            return;
        }

        /* Create a new object in the scene */
        const o = this.engine.scene.addObject(null);
        /* Place new object at current cursor location */
        o.transformLocal = this.object.transformWorld;
        o.scale([0.25, 0.25, 0.25]);
        /* Move out of the floor, at 0.25 scale, the origin of
         * our cube is 0.25 above the floor */
        o.translate([0.0, 0.25, 0.0]);

        /* Add a mesh to render the object */
        const mesh = o.addComponent('mesh', {});
        if (!mesh) {
            console.warn('Failed to add a mesh');
            return;
        }

        mesh.material = this.material;
        mesh.mesh = this.mesh;
        mesh.active = true;
    };
}
