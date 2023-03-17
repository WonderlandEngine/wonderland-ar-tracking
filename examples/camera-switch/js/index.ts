import '../../common-components';

import './camera-switch-ui.js';
import './face-attachment-point-example.js';
import './image-tracker.js';
import './slam-tracking-example.js';

import {ARFaceTrackingCamera} from '../../../src/components/AR/cameras/AR-face-tracking-camera.js';
import {ARImageTrackingCamera} from '../../../src/components/AR/cameras/AR-image-tracking-camera.js';
import {ARSLAMCamera} from '../../../src/components/AR/cameras/AR-SLAM-camera.js';

WL.registerComponent(ARFaceTrackingCamera);
WL.registerComponent(ARImageTrackingCamera);
WL.registerComponent(ARSLAMCamera);
