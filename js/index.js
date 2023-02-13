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
import './../../../../../../../Applications/WonderlandEditor.app/Contents/Resources/js/editor-components-bundle.js';

import './spawn-mesh-on-select.js';

import './hit-test-location-new';

import './components/AR/cameras/AR-SLAM-camera';
import './components/AR/cameras/AR-face-tracking-camera';
import './components/AR/cameras/AR-image-tracking-camera';

import './components/examples/nose-tracking-example';
import './components/examples/image-tracking-example';
import './components/examples/xr8-camera-switch';
