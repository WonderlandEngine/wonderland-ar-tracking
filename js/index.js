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
import '@wonderlandengine/components';
import './../../../../../../../Applications/WonderlandEditor.app/Contents/Resources/js/editor-components-bundle.js';
import './hit-test-location-new.ts';
import './spawn-mesh-on-select.js';
