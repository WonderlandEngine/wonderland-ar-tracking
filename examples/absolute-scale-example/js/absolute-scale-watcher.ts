import {Component, Type, Object as WLEObject, Mesh, Material} from '@wonderlandengine/api';
import {ARSession} from '../../../';
import {ARXR8SLAMCamera} from '../../../src/components/AR/cameras/AR-XR8-SLAM-camera';

import {vec3} from 'gl-matrix';
class AbsoluteScaleWatcher extends Component {
    public static TypeName = 'absolute-scale-watcher';
    public static Properties = {
        ARXR8SLAMCamera: {type: Type.Object},

        /* The mesh to spawn */
        mesh: {type: Type.Mesh},
        /* The material to spawn the mesh with */
        material: {type: Type.Material},
    };
    // injected by WL..
    ARXR8SLAMCamera!: WLEObject;

    // injected by WL..
    mesh!: Mesh;
    // injected by WL..
    material!: Material;

    private tracking = false;


    private camForward = vec3.create();
    private intersectionVec3 = vec3.create();
    private tmpWorldPosition = vec3.create();

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

        ARSession.onSessionEnded.push(() => {
            div.style.display = 'none';
            this.tracking = false;
        });

        camera.onTrackingStatus.push((event) => {
            if (event.detail.status === 'NORMAL') {
                div.style.display = 'none';
                this.tracking = true;
                this.object.scalingWorld = [1, 1, 1];
            } else {
                this.tracking = false;
                div.style.display = 'block';
                this.object.scalingWorld = [0, 0, 0];
            }
        });
    }

    update() {
        if (this.tracking) {
            this.ARXR8SLAMCamera.getForward(this.camForward);
          
            /* Intersect with origin XY plane. We always intersect if camera facing downwards */
            if(this.camForward[1] < 0) { 
                this.ARXR8SLAMCamera.getTranslationWorld(this.tmpWorldPosition);
                const t = -this.tmpWorldPosition[1] / this.camForward[1];
                vec3.add(this.intersectionVec3, this.tmpWorldPosition, vec3.scale(this.intersectionVec3, this.camForward, t));
                this.object.setTranslationWorld(this.intersectionVec3);
            }
        }
    }

    spawnMesh = () => {
        if (!this.tracking) {
            return;
        }

        /* Create a new object in the scene */
        const o = WL.scene!.addObject(null);
        /* Place new object at current cursor location */
        o.transformLocal = this.object.transformWorld;
        o.scale([0.25, 0.25, 0.25]);
        /* Move out of the floor, at 0.25 scale, the origin of
         * our cube is 0.25 above the floor */
        o.translate([0.0, 0.25, 0.0]);

        /* Add a mesh to render the object */
        const mesh = o.addComponent('mesh', {});
        mesh.material = this.material;
        mesh.mesh = this.mesh;
        mesh.active = true;
    };
}

WL.registerComponent(AbsoluteScaleWatcher);
