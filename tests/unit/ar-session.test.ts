import {describe, expect, it, vi} from 'vitest';
import type {WonderlandEngine, Component} from '@wonderlandengine/api';
import {Emitter} from '@wonderlandengine/api';
import {ARSession} from '../../packages/ar-tracking/src/AR-session.js';
import {ARProvider} from '../../packages/ar-tracking/src/AR-provider.js';
import {TrackingType} from '../../packages/ar-tracking/src/tracking-type.js';
import {ITrackingMode} from '../../packages/ar-tracking/src/tracking-mode.js';

class TestProvider extends ARProvider {
    private readonly types: Set<TrackingType>;
    private readonly instant: boolean;
    readonly name: string;
    endSessionCalls = 0;

    constructor(
        engine: WonderlandEngine,
        options: {name: string; types: TrackingType[]; supportsInstantTracking?: boolean}
    ) {
        super(engine);
        this.name = options.name;
        this.types = new Set(options.types);
        this.instant = options.supportsInstantTracking ?? false;
    }

    get supportsInstantTracking(): boolean {
        return this.instant;
    }

    async startSession(): Promise<void> {}

    async endSession(): Promise<void> {
        this.endSessionCalls++;
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    supports(type: TrackingType): boolean {
        return this.types.has(type);
    }

    createTracking(_type: TrackingType, component: Component): ITrackingMode {
        return {
            component,
            startSession: () => {},
            endSession: () => {},
        };
    }
}

function createMockEngine(): WonderlandEngine {
    return {
        onSceneLoaded: new Emitter<[]>(),
        onXRSessionStart: new Emitter<[session: XRSession]>(),
        onXRSessionEnd: new Emitter<[]>(),
        arSupported: true,
    } as unknown as WonderlandEngine;
}

describe('ARSession', () => {
    it('returns one session per engine', () => {
        const engine = createMockEngine();
        const first = ARSession.getSessionForEngine(engine);
        const second = ARSession.getSessionForEngine(engine);

        expect(first).toBe(second);
    });

    it('registers providers once and emits ready after scene and camera are ready', async () => {
        const engine = createMockEngine();
        const session = ARSession.getSessionForEngine(engine);
        const provider = new TestProvider(engine, {
            name: 'provider-a',
            types: [TrackingType.SLAM],
        });

        const readySpy = vi.fn();
        session.onARSessionReady.add(readySpy);

        await session.registerTrackingProvider(provider);
        await session.registerTrackingProvider(provider);

        session.registerARCameraComponent();
        session.markARCameraReady();

        expect(session.registeredProviders).toHaveLength(1);
        expect(readySpy).not.toHaveBeenCalled();

        engine.onSceneLoaded.notify();
        expect(readySpy).toHaveBeenCalledTimes(1);
    });

    it('selects preferred provider and exposes instant support flag', async () => {
        const engine = createMockEngine();
        const session = ARSession.getSessionForEngine(engine);

        const first = new TestProvider(engine, {
            name: 'first',
            types: [TrackingType.SLAM],
            supportsInstantTracking: false,
        });
        const second = new TestProvider(engine, {
            name: 'second',
            types: [TrackingType.SLAM],
            supportsInstantTracking: true,
        });

        await session.registerTrackingProvider(first);
        await session.registerTrackingProvider(second);

        expect(session.getPreferredARProvider(TrackingType.SLAM)).toBe(first);
        expect(session.supportsInstantTracking(TrackingType.SLAM)).toBe(false);
    });

    it('clears current provider after provider session end', async () => {
        const engine = createMockEngine();
        const session = ARSession.getSessionForEngine(engine);
        const provider = new TestProvider(engine, {
            name: 'provider-end',
            types: [TrackingType.SLAM],
        });

        await session.registerTrackingProvider(provider);

        provider.onSessionStart.notify(provider);
        provider.onSessionEnd.notify(provider);

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        session.stopARSession();

        expect(provider.endSessionCalls).toBe(0);
        warnSpy.mockRestore();
    });
});
