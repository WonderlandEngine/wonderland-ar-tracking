import { Component, Type, Object as WLEObject } from '@wonderlandengine/api';
import { ARSession } from '../../../';
import { ARXR8SLAMCamera } from '../../../src/components/AR/cameras/AR-XR8-SLAM-camera';

class AbsoluteScaleWatcher extends Component {
  public static TypeName = 'absolute-scale-watcher';
  public static Properties = {
    ARXR8SLAMCamera: { type: Type.Object },
  };
  // injected by WL..
  private ARXR8SLAMCamera!: WLEObject;

  start() {

    if (!this.ARXR8SLAMCamera) {
      console.warn(`${this.object.name}/${this.type} requires a ${ARXR8SLAMCamera.TypeName}`);
      return;
    }
    const camera = this.ARXR8SLAMCamera.getComponent(ARXR8SLAMCamera);

    if (!camera) {
      throw new Error(`${ARXR8SLAMCamera.TypeName} was not found on ARXR8SLAMCamera`)
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
    div.innerHTML = 'Move your camera back and forth<br /> until the absolute scale can be detected';
    document.body.appendChild(div);

    ARSession.onSessionEnded.push(() => {
      div.style.display = 'block';
    });

    camera.onTrackingStatus.push((event) => {
      console.log("On tracking status got it here", event);

      if (event.detail.status === 'NORMAL') {
        div.style.display = 'none';
      } else {
        div.style.display = 'block';
      }
    })
  }
}

WL.registerComponent(AbsoluteScaleWatcher);