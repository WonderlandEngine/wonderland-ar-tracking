/**
 * VPSExample
 * Demonstrates how to put an object on the detected waypoint.
 *
 * This example creates <div id="_debugText" /> to output some logs when waypoints are found or lost
 */

import {Component, Object as WLEObject, Type} from '@wonderlandengine/api';
import {ARSession, ARVPSCamera} from '@wonderlandengine/8thwall-tracking';

export class VPSExample extends Component {
    public static TypeName = 'vps-example';
    public static Properties = {
        VPSCamera: {type: Type.Object},
        waypointName: {type: Type.String}, // Material to use for the generated mesh
    };

    // injected by WL..
    private VPSCamera!: WLEObject;

    // injected by WL..
    private waypointName!: string;

    // private static toggleMeshButton: HTMLButtonElement;
    private static _debugText: HTMLDivElement;

    start() {
        if (!this.VPSCamera) {
            console.warn(
                `${this.object.name}/${this.type} requires a ${ARVPSCamera.TypeName}`
            );
            return;
        }

        const camera = this.VPSCamera.getComponent(ARVPSCamera);

        if (!camera) {
            throw new Error(`${ARVPSCamera.TypeName} was not found on VPSCamera`);
        }

        if (!VPSExample._debugText) {
            VPSExample._debugText = document.createElement('div');
            VPSExample._debugText.id = 'vps-example-debug-text';
            VPSExample._debugText.style.fontSize = '14px';
            VPSExample._debugText.style.position = 'absolute';
            VPSExample._debugText.style.bottom = '0';
            VPSExample._debugText.style.left = '0';
            VPSExample._debugText.style.color = 'white';
            VPSExample._debugText.style.textShadow = '2px 2px 4px #FFFF00';
        }

        ARSession.onSessionStarted.add(() => {
            document.body.appendChild(VPSExample._debugText);
            VPSExample._debugText.innerHTML = 'Looking for a waypoint';
        });

        ARSession.onSessionEnded.add(() => {
            VPSExample._debugText.remove();
        });

        camera.onWaySpotFound.push(this.wayspotFound);
        camera.onWaySpotUpdated.push(this.updateModelPose);
        camera.onWaySpotLost.push(() => {
            VPSExample._debugText.innerHTML += '<br />Way spot lost';
        });
    }

    private wayspotFound = (event: XR8VPSWayPointEvent) => {
        if (event.detail.name !== this.waypointName) return;
        VPSExample._debugText.innerHTML += '<br />Way spot found: ' + event.detail.name;
        this.updateModelPose(event);
    };

    private updateModelPose = (event: XR8VPSWayPointEvent) => {
        if (event.detail.name !== this.waypointName) return;

        VPSExample._debugText.innerHTML += '<br />Way spot updated: ' + event.detail.name;

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
