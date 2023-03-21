import {Component, WonderlandEngine} from '@wonderlandengine/api';
import { ARSession } from '../AR-session';

abstract class ARCamera extends Component {

    abstract startSession(): Promise<void>;
    abstract endSession(): Promise<void>;
}

export {ARCamera};
