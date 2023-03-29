import {Component} from '@wonderlandengine/api';

/**
 * Generic AR camera component.
 * All AR cameras should extend this
 */
abstract class ARCamera extends Component {
    abstract startSession(): Promise<void>;
    abstract endSession(): Promise<void>;
}

export {ARCamera};
