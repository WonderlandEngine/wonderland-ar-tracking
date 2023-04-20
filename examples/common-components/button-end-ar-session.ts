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
        const rect = this.engine.canvas.getBoundingClientRect();
        this.xrEndButton = document.createElement('button');
        this.xrEndButton.style.lineHeight = '40px';
        this.xrEndButton.style.position = 'absolute';

        /**
         * Put the END AR SESSION button in the top left corner of the canvas
         */
        this.xrEndButton.style.left = rect.left + 'px';
        this.xrEndButton.style.top = (rect.top + window.scrollY) + 'px';
        
        this.xrEndButton.style.zIndex = '999';
        this.xrEndButton.style.display = 'none';
        this.xrEndButton.innerHTML = 'END AR SESSION';
        document.body.appendChild(this.xrEndButton);

        this.xrEndButton.addEventListener('click', () => {
            ARSession.getEngineSession(this.engine).stopARSession();
        });

        ARSession.getEngineSession(this.engine).onSessionStarted.add(() => {
            this.xrEndButton.style.display = 'block';
        });

        ARSession.getEngineSession(this.engine).onSessionEnded.add(() => {
            this.xrEndButton.style.display = 'none';
        });
    }
}
