/**
 * ButtonStartARSession
 * Waits until the ARSession is ready and shows the default AR button.
 * AR button, when clicked, searches for the first component which is `instanceOf ARCamera`
 * and starts that components AR session
 */
import {Component} from '@wonderlandengine/api';
import {ARSession} from '@wonderlandengine/ar-tracking';

export class ButtonStartARSession extends Component {
    static TypeName = 'button-start-ar-session';

    start() {
        ARSession.getSessionForEngine(this.engine).onARSessionReady.add(
            this.onARSessionReady.bind(this)
        );

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            const xrButton = document.querySelector<HTMLElement>('#ar-button');
            xrButton!.style.display = 'block';
        });
    }

    onARSessionReady() {
        const xrButton = document.querySelector<HTMLElement>('#ar-button');

        if (xrButton === null) {
            console.error('No #ar-button found. Session will not start.');
            return;
        }

        xrButton!.dataset.supported = 'true';

        xrButton.addEventListener('click', () => {
            xrButton!.style.display = 'none';

            const isCameraComponent = (component: unknown): component is {
                startSession: () => void;
                endSession: () => void;
            } => {
                return (
                    !!component &&
                    typeof (component as {startSession?: unknown}).startSession ===
                        'function' &&
                    typeof (component as {endSession?: unknown}).endSession ===
                        'function'
                );
            };

            for (const c of this.object.getComponents()) {
                if (isCameraComponent(c)) {
                    c.startSession();
                    break;
                }
            }
        });
    }
}
