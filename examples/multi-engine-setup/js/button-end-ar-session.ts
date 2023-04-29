/**
 * ButtonEndARSession
 * Shows a simple HTML buttton when ARSession has started.
 * When clicked - kill any running AR session.
 */
import {Component} from '@wonderlandengine/api';
import {ARSession} from '@wonderlandengine/8thwall-tracking';

export class ButtonEndARSession extends Component {
    static TypeName = 'button-end-ar-session';

    xrEndButton!: HTMLButtonElement;

    start() {
        this.xrEndButton = document.createElement('button');
        this.xrEndButton.style.lineHeight = '40px';
        this.xrEndButton.style.position = 'absolute';
        this.xrEndButton.style.left = '0';
        this.xrEndButton.style.top = '0';
        this.xrEndButton.style.zIndex = '999';
        this.xrEndButton.style.display = 'none';
        this.xrEndButton.innerHTML = 'END AR SESSION';
        this.engine.canvas.parentElement!.appendChild(this.xrEndButton);

        this.xrEndButton.addEventListener('click', () => {
            ARSession.getSessionForEngine(this.engine).stopARSession();
        });

        ARSession.getSessionForEngine(this.engine).onSessionStart.add((provider) => {
            this.xrEndButton.style.display = 'block';
        });

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add((provider) => {
            this.xrEndButton.style.display = 'none';
        });
    }
}
