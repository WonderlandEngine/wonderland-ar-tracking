/**
 * ButtonStartARSession
 * Waits until the ARSession is ready and shows the default AR button.
 * AR button, when clicked, searches for the first component which is `instanceOf ARCamera`
 * and starts that components AR session
 */
import {Component} from '@wonderlandengine/api';
import {ARSession, ARCamera} from '../../';

export class ButtonStartARSession extends Component {
    public static TypeName = 'button-start-ar-session';

    init() {
        ARSession.getSessionForEngine(this.engine).onARSessionReady.add(
            this.onARSessionReady.bind(this)
        );

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            let xrButton = document.querySelector<HTMLElement>('#ar-button');
            xrButton!.style.display = 'block';
        });
    }

    onARSessionReady() {
        let xrButton = document.querySelector<HTMLElement>('#ar-button');

        if (xrButton === null) {
            console.error('No #ar-button found. Session will not start.');
            return;
        }

        xrButton!.dataset.supported = 'true';

        xrButton.addEventListener('click', () => {
            xrButton!.style.display = 'none';
            const components = this.object.getComponents();
            for (let i = 0; i < components.length; i++) {
                if (components[i] instanceof ARCamera) {
                    (components[i] as ARCamera).startSession();
                    break;
                }
            }
        });
    }
}
