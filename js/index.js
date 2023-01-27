/// <reference path="../index.d.ts" />

/**
 * This is the entry point of your standalone application.
 *
 * You should register the component you need here, e.g,
 *
 * ```
 * import { MyComponent } from './my-component.js';
 *
 * WL.registerComponent(MyComponent);
 * ```
 */

/* Register all default components. */
//import '@wonderlandengine/components';
// import '@wonderlandengine/components/8thwall-camera.js';
import '@wonderlandengine/components/cursor-target.js';
import '@wonderlandengine/components/cursor.js';
import '@wonderlandengine/components/debug-object.js';
import '@wonderlandengine/components/device-orientation-look.js';
import '@wonderlandengine/components/finger-cursor.js';
import '@wonderlandengine/components/fixed-foveation.js';
import '@wonderlandengine/components/hand-tracking.js';
import '@wonderlandengine/components/hit-test-location.js';
import '@wonderlandengine/components/howler-audio-listener.js';
import '@wonderlandengine/components/howler-audio-source.js';
import '@wonderlandengine/components/image-texture.js';
import '@wonderlandengine/components/mouse-look.js';
import '@wonderlandengine/components/target-framerate.js';
import '@wonderlandengine/components/teleport.js';
import '@wonderlandengine/components/two-joint-ik-solver.js';
import '@wonderlandengine/components/video-texture.js';
import '@wonderlandengine/components/vr-mode-active-switch.js';
import '@wonderlandengine/components/vrm.js';
import '@wonderlandengine/components/wasd-controls.js';

import './spawn-mesh-on-select.js';

import './hit-test-location-new';

import './components/AR/cameras/AR-camera';
import './components/AR/cameras/AR-face-camera';

import './clown-nose';




