import {Component, Object as WLEObject, Type} from '@wonderlandengine/api';
import {vec3} from 'gl-matrix';
import {ARSession, XR8Provider, ARProvider} from '../../..';

/**
 * Hit test location for XR8 implementation
 */
class HitTestLocationXR8 extends Component {
    public static TypeName = 'hit-test-location-xr8';
    public static Properties = {
        camera: {type: Type.Object},
    };

    // injected by WLE
    camera!: WLEObject;

    private tracking = false;

    private camForward = vec3.create();
    private intersectionVec3 = vec3.create();
    private tmpWorldPosition = vec3.create();

    init() {
        ARSession.onSessionStarted.push(this.onSessionStarted);
        ARSession.onSessionEnded.push(this.onSessionEnded);
    }

    update() {
        if (this.tracking) {
            this.camera.getForward(this.camForward);
          
            /* Intersect with origin XY plane. We always intersect if camera facing downwards */
            if(this.camForward[1] < 0) { 
                this.camera.getTranslationWorld(this.tmpWorldPosition);
                const t = -this.tmpWorldPosition[1] / this.camForward[1];
                vec3.add(this.intersectionVec3, this.tmpWorldPosition, vec3.scale(this.intersectionVec3, this.camForward, t));
                this.object.setTranslationWorld(this.intersectionVec3);
            }
        }
    }

    onSessionStarted = (provider: ARProvider) => {
        if (provider instanceof XR8Provider) {
            this.object.scalingWorld = [1, 1, 1];
            this.tracking = true;
        }
    };

    onSessionEnded = (provider: ARProvider) => {
        if (provider instanceof XR8Provider) {
            this.tracking = false;
            this.object.scalingWorld = [0, 0, 0];
        }
    };
}

WL.registerComponent(HitTestLocationXR8);
