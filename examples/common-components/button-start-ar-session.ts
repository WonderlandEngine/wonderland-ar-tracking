/**
 * ButtonStartARSession
 * Waits until the ARSession is ready and shows the default AR button.
 * AR button, when clicked, searches for the first component which is `instanceOf ARCamera`
 * and starts that components AR session
 */
import {Component} from '@wonderlandengine/api';
import {ARSession, ARCamera} from '@wonderlandengine/ar-tracking';

export class ButtonStartARSession extends Component {
    static TypeName = 'button-start-ar-session';

    start() {
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
            for (const c of this.object.getComponents()) {
                if (c instanceof ARCamera) {
                    (c as ARCamera).startSession();
                    break;
                }
            }
        });
    }
}
