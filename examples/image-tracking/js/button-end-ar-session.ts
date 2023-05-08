/**
 * ButtonEndARSession
 * Shows a simple HTML buttton when ARSession has started.
 * When clicked - kill any running AR session.
 */
import {Component} from '@wonderlandengine/api';
import {ARSession} from '@wonderlandengine/ar-tracking';

export class ButtonEndARSession extends Component {
    static TypeName = 'button-end-ar-session';

    xrEndButton!: HTMLButtonElement;

    start() {
        const rect = this.engine.canvas.getBoundingClientRect();
        this.xrEndButton = document.createElement('button');
        this.xrEndButton.style.lineHeight = '40px';
        this.xrEndButton.style.position = 'absolute';

        /**
         * Put the END AR SESSION button in the top left corner of the canvas
         */
        this.xrEndButton.style.left = rect.left + 'px';
        this.xrEndButton.style.top = rect.top + window.scrollY + 'px';

        this.xrEndButton.style.zIndex = '999';
        this.xrEndButton.style.display = 'none';
        this.xrEndButton.innerHTML = 'END AR SESSION';
        document.body.appendChild(this.xrEndButton);

        this.xrEndButton.addEventListener('click', () => {
            ARSession.getSessionForEngine(this.engine).stopARSession();
        });

        ARSession.getSessionForEngine(this.engine).onSessionStart.add(() => {
            this.xrEndButton.style.display = 'block';
        });

        ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
            this.xrEndButton.style.display = 'none';
        });
    }
}
