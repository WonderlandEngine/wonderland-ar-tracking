import { quat2 } from 'gl-matrix';

const WorldTracking_webAR = {
  component: null,
  init: function (component) {
    this.component = component;
  },

  startARSession: function () {
    Module['webxr_request_session_func']('immersive-ar', ['local',], ['local', 'hand-tracking', 'hit-test',])
  }
}

export default WorldTracking_webAR;