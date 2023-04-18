/**
 * ButtonStartARSession
 * Waits until the ARSession is ready and shows the default AR button.
 * AR button, when clicked, searches for the first component which is `instanceOf ARCamera`
 * and starts that components AR session
 */
import {Component} from '@wonderlandengine/api';
import {ARSession, ARCamera} from '@wonderlandengine/8thwall-tracking';

export class ButtonStartARSession extends Component {
    public static TypeName = 'button-start-ar-session';

    init() {
        if (ARSession.arSessionReady) {
            this.onARSessionReady();
        } else {
            ARSession.onARSessionReady.add(this.onARSessionReady);
        }

        ARSession.onSessionEnded.add(() => {
            let xrButton = this.engine.canvas.parentElement!.querySelector<HTMLElement>('.ar-button');
            xrButton!.style.display = 'block';
        });
    }

    onARSessionReady = () => {
        let xrButton = this.engine.canvas.parentElement!.querySelector<HTMLElement>('.ar-button');
        console.log("AR session is ready");
        if (xrButton === null) {
            console.error('No #ar-button found. Session will not start.');
            return;
        }

        xrButton.style.display = 'block';

        xrButton.addEventListener('click', () => {
            xrButton!.style.display = 'none';
            const components = this.object.getComponents();
            console.log("COmponents", components)
            for (let i = 0; i < components.length; i++) {
                if (components[i] instanceof ARCamera) {
                    (components[i] as ARCamera).startSession();
                    break;
                }
            }
        });
    };
}