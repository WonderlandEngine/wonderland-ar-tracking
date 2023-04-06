/**
 * ButtonEndARSession
 * Shows a simple HTML buttton when ARSession has started.
 * When clicked - kill any running AR session.
 */
import {Component} from '@wonderlandengine/api';
import {ARSession} from '../../';

export class ButtonEndARSession extends Component {
    public static TypeName = 'button-end-ar-session';

    xrEndButton!: HTMLButtonElement;

    init() {
        this.xrEndButton = document.createElement('button');
        this.xrEndButton.style.lineHeight = '40px';
        this.xrEndButton.style.position = 'absolute';
        this.xrEndButton.style.left = '0';
        this.xrEndButton.style.top = '0';
        this.xrEndButton.style.zIndex = '999';
        this.xrEndButton.style.display = 'none';
        this.xrEndButton.innerHTML = 'END AR SESSION';
        document.body.appendChild(this.xrEndButton);

        this.xrEndButton.addEventListener('click', () => {
            ARSession.stopARSession();
        });

        ARSession.onSessionStarted.add(() => {
            this.xrEndButton.style.display = 'block';
        });

        ARSession.onSessionEnded.add(() => {
            this.xrEndButton.style.display = 'none';
        });
    }
}
