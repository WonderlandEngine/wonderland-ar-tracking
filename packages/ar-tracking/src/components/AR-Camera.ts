import {Component} from '@wonderlandengine/api';

/**
 * Generic AR camera component.
 * All AR cameras should extend this
 */
export abstract class ARCamera extends Component {
    abstract startSession(): void;
    abstract endSession(): void;
}
