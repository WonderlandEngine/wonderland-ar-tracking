import {Component, Property} from '@wonderlandengine/api';
import {ZapparProvider} from '@wonderlandengine/ar-provider-zappar';
/**
 * zappar-update
 */
export class ZapparUpdate extends Component {
    static TypeName = 'zappar-update';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0),
    };

    start() {
        console.log('start() with param', this.param);
    }

    update(dt) {}
}
