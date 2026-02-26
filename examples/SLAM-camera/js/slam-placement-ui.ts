import {Component} from '@wonderlandengine/api';
import {ARProvider, ARSession} from '@wonderlandengine/ar-tracking';
import {ZapparProvider} from '@wonderlandengine/ar-provider-zappar';
import type {WorldTrackerUI as WorldTrackerUIType} from '@zappar/zappar';

/**
 * Zappar Instant World Tracking placement UI.
 *
 * Uses Zappar's own {@link WorldTrackerUI} to show the scanning animation while
 * the user moves the device to find a surface, then dismisses it on first tap.
 *
 * The placement tap is intercepted in the capture phase so it is consumed
 * before any bubble-phase listeners (e.g. SpawnMeshOnReticle on `window`).
 *
 * Only activates for {@link ZapparProvider} sessions; other providers are
 * silently ignored so the component is safe to leave on any multi-provider
 * scene.
 */
export class SlamPlacementUI extends Component {
    static TypeName = 'slam-placement-ui';

    private _ui: WorldTrackerUIType | null = null;
    private _provider: ZapparProvider | null = null;

    start(): void {
        const arSession = ARSession.getSessionForEngine(this.engine);
        arSession.onSessionStart.add(this._onSessionStart);
        arSession.onSessionEnd.add(this._onSessionEnd);

        // Disable the update loop until we have an active placement UI.
        this.active = false;
    }

    update(): void {
        this._ui?.update();
    }

    private _onSessionStart = async (provider: ARProvider): Promise<void> => {
        if (!(provider instanceof ZapparProvider)) return;
        this._provider = provider;
        provider.startUserPlacement();

        const {WorldTrackerUI} = await import('@zappar/zappar');
        const ui = new WorldTrackerUI(this.engine.canvas as HTMLCanvasElement);
        document.body.appendChild(ui.dom);
        ui.show();
        this._ui = ui;
        this.active = true;

        // Use capture phase so this fires before SpawnMeshOnReticle's
        // bubble-phase `window.onclick` listener. stopPropagation() prevents
        // the tap from reaching other listeners.
        window.addEventListener('click', this._onTap, {capture: true, once: true});
    };

    private _onSessionEnd = (provider: ARProvider): void => {
        if (provider !== this._provider) return;
        this._dismiss();
        this._provider = null;
    };

    private _onTap = (e: Event): void => {
        e.stopPropagation();
        this._provider?.placeInstantAnchor();
        this._dismiss();
    };

    private _dismiss(): void {
        window.removeEventListener('click', this._onTap, {capture: true});
        if (this._ui) {
            this._ui.hide();
            this._ui.dom.remove();
            this._ui = null;
        }
        this.active = false;
    }

    onDestroy(): void {
        this._dismiss();
    }
}
