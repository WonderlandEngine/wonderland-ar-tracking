/**
 * ButtonEndARSession
 * Shows a simple HTML buttton when ARSession has started.
 * When clicked - kill any running AR session.
 */
import {Component} from '@wonderlandengine/api';
import {ARSession} from '@wonderlandengine/8thwall-tracking';

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
        this.engine.canvas.parentElement!.appendChild(this.xrEndButton);
        console.log("this.xrEndButton", this.xrEndButton);
        

        this.xrEndButton.addEventListener('click', () => {
            ARSession.getEngineSession(this.engine).stopARSession();
        });

        ARSession.getEngineSession(this.engine).onSessionStarted.add(() => {
            console.log("Session has started");
            this.xrEndButton.style.display = 'block';
        });

        ARSession.getEngineSession(this.engine).onSessionEnded.add(() => {
            this.xrEndButton.style.display = 'none';
        });
    }
}
