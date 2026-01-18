/// <reference path="./types/global.d.ts" />

import {WonderlandEngine, Component, Emitter} from '@wonderlandengine/api';
import {mat4, quat, vec3} from 'gl-matrix';
import {
    ARProvider,
    ARSession,
    ITrackingMode,
    ImageScanningEvent,
    TrackingType,
} from '@wonderlandengine/ar-tracking';
import {loadZappar, setOptions as zapparSetOptions} from './zappar-module.js';
import {WorldTracking_Zappar} from './world-tracking-mode-zappar.js';
import {FaceTracking_Zappar} from './face-tracking-mode-zappar.js';
import {ImageTracking_Zappar} from './image-tracking-mode-zappar.js';
import type {
    CameraSource,
    FaceMesh,
    FaceTracker,
    ImageTracker,
    InstantWorldTracker,
    Pipeline,
} from '@zappar/zappar';

type ZapparImageTargetType = 'flat' | 'cylindrical' | 'conical';

export interface ZapparImageTargetOptions {
    name: string;
    type?: ZapparImageTargetType;
    physicalWidthInMeters?: number;
    metadata?: unknown;
}

interface ZapparImageTargetDescriptor {
    name: string;
    type: ZapparImageTargetType;
    geometry: ImageScanningEvent['imageTargets'][0]['geometry'];
    properties: ImageScanningEvent['imageTargets'][0]['properties'];
    metadata: unknown;
}

interface ZapparImageTarget {
    physicalScaleFactor?: number;
    topRadius?: number;
    bottomRadius?: number;
    sideLength?: number;
}

/**
 * ARProvider implementation backed by the Zappar Universal AR JavaScript SDK.
 */
export class ZapparProvider extends ARProvider {
    private static _cvWorkerConfigured = false;
    private static _cvWorker: Worker | null = null;

    /** Mirror Zappar THREE.js `CameraPoseMode` for SLAM pose output. */
    public slamPoseMode: 'default' | 'attitude' | 'anchor-origin' = 'anchor-origin';

    private _xrSession: XRSession | null = null;
    private _gl: WebGL2RenderingContext | null = null;
    private _zappar: Awaited<ReturnType<typeof loadZappar>> | null = null;
    private pipeline: Pipeline | null = null;
    private cameraSource: CameraSource | null = null;
    private instantTracker: InstantWorldTracker | null = null;
    private _faceTracker: FaceTracker | null = null;
    private _faceMesh: FaceMesh | null = null;
    private _faceResourcesPromise: Promise<void> | null = null;
    private _imageTracker: ImageTracker | null = null;
    private _imageTargetDescriptors: ZapparImageTargetDescriptor[] = [];
    private readonly _imageTargetsChanged = new Emitter();
    private cameraStarted = false;
    private hasInitializedAnchor = false;
    private _anchorWarmupFramesRemaining = 0;
    private preRenderRegistered = false;

    private _slamStateValid = false;
    private readonly _slamProjectionMatrix = new Float32Array(16);
    private readonly _slamAnchorMatrix = mat4.create();
    private _slamFrameNumber = 0;

    private _videoTextureUnit: number | null = null;
    private _videoTextureProgram: WebGLProgram | null = null;
    private _videoTextureUniform: WebGLUniformLocation | null = null;
    private _videoTextureTransformUniform: WebGLUniformLocation | null = null;
    private _videoTextureBindErrorLogged = false;

    private _missingCameraTextureFrames = 0;
    private _missingCameraTextureWarningLogged = false;

    private readonly _slamCameraMatrix = mat4.create();
    private readonly _slamCameraPosition = vec3.create();
    private readonly _slamCameraRotation = quat.create();

    private readonly _debugCameraPosition = vec3.create();
    private readonly _debugAnchorPosition = vec3.create();
    private readonly _debugCameraPositionDelta = vec3.create();
    private readonly _debugAnchorPositionDelta = vec3.create();
    private _debugLastSampleFrameNumber: number | null = null;
    private readonly _debugLastSampleCameraPosition = vec3.create();
    private readonly _debugLastSampleAnchorPosition = vec3.create();

    private _zapparDebugLogIntervalId: number | null = null;

    private _preRenderErrorLogged = false;

    static Name = 'Zappar';

    get name(): string {
        return ZapparProvider.Name;
    }

    get supportsInstantTracking(): boolean {
        return true;
    }

    get onImageTargetsChanged() {
        return this._imageTargetsChanged;
    }

    get xrSession() {
        return this._xrSession;
    }

    static registerTrackingProviderWithARSession(arSession: ARSession) {
        const provider = new ZapparProvider(arSession.engine);
        arSession.registerTrackingProvider(provider);
        return provider;
    }

    private constructor(engine: WonderlandEngine) {
        super(engine);

        if (typeof document === 'undefined') {
            return;
        }

        engine.onXRSessionStart.add((session: XRSession) => {
            this._xrSession = session;
            this.onSessionStart.notify(this);
        });

        engine.onXRSessionEnd.add(() => {
            this.onSessionEnd.notify(this);
        });
    }

    async startSession(): Promise<void> {
        this._slamStateValid = false;
        this._missingCameraTextureFrames = 0;
        this._missingCameraTextureWarningLogged = false;
        // Warm-up for the InstantWorldTracker anchor (~2 seconds at 60fps).
        this._anchorWarmupFramesRemaining = 120;
        await this.ensureZapparLoaded();
        await this._zappar!.loadedPromise();
        this.ensurePipeline();
        await this.ensureCameraRunning();

        this.startZapparDebugLogging();

        // For instant tracking providers, we should emit session start here.
        // (Unlike WebXR, there is no XRSessionStart event.)
        this.onSessionStart.notify(this);

        if (this.instantTracker) {
            this.instantTracker.enabled = true;
        }
    }

    private startZapparDebugLogging(): void {
        if (this._zapparDebugLogIntervalId !== null) return;

        const canAccessWindow =
            typeof window !== 'undefined' &&
            typeof (window as unknown as {setInterval?: unknown}).setInterval ===
                'function';

        if (canAccessWindow) {
            this._zapparDebugLogIntervalId = window.setInterval(() => {
                const debug = (window as Window & {ZapparDebug?: unknown}).ZapparDebug;
                // Keep this intentionally simple: user asked to log ZapparDebug.
                console.log('[ZapparDebug]', debug ?? null);
            }, 2000);
            return;
        }

        // WL Editor / non-browser fallback
        const canAccessGlobalIntervals = typeof globalThis.setInterval === 'function';
        if (canAccessGlobalIntervals) {
            const globalAny = globalThis as {
                ZapparDebug?: unknown;
                setInterval: typeof setInterval;
            };
            this._zapparDebugLogIntervalId = globalAny.setInterval(() => {
                console.log('[ZapparDebug]', globalAny.ZapparDebug ?? null);
            }, 2000) as unknown as number;
        }
    }

    private stopZapparDebugLogging(): void {
        if (this._zapparDebugLogIntervalId === null) return;

        const id = this._zapparDebugLogIntervalId;
        this._zapparDebugLogIntervalId = null;

        if (typeof window !== 'undefined' && typeof window.clearInterval === 'function') {
            window.clearInterval(id);
            return;
        }

        if (typeof globalThis.clearInterval === 'function') {
            globalThis.clearInterval(id as unknown as ReturnType<typeof setInterval>);
        }
    }

    private async ensureZapparLoaded(): Promise<void> {
        if (this._zappar) return;

        // Must be called before Zappar initializes, otherwise the CV worker option
        // may be ignored and Zappar CV will fall back to requesting `./worker`.
        await this.configureCvWorkerIfNeeded();
        this._zappar = await loadZappar();
    }

    /** Used by tracking modes that need the Zappar namespace. */
    async ensureZapparNamespace(): Promise<Awaited<ReturnType<typeof loadZappar>>> {
        await this.ensureZapparLoaded();
        return this._zappar!;
    }

    private async configureCvWorkerIfNeeded(): Promise<void> {
        if (ZapparProvider._cvWorkerConfigured) return;

        // Hard-coded paths for local development
        const workerUrl = './zappar-cv/zappar-cv.worker.js';
        const wasmUrl = './zappar-cv/zappar-cv.wasm';

        const debugWorker =
            typeof window !== 'undefined' &&
            (window as unknown as {__ZAPPAR_WORKER_DEBUG__?: boolean})
                .__ZAPPAR_WORKER_DEBUG__;

        if (debugWorker) {
            console.log('[ZapparProvider] configureCvWorkerIfNeeded()', {
                workerUrl,
                wasmUrl,
                hasWorkerGlobal: typeof Worker !== 'undefined',
            });
        }

        if (typeof Worker === 'undefined') return;

        try {
            if (debugWorker) {
                console.log('[ZapparProvider] Creating CV worker:', workerUrl);
            }
            const worker = new Worker(workerUrl);

            // Keep a reference for debugging / inspection.
            ZapparProvider._cvWorker = worker;
            if (typeof window !== 'undefined') {
                (window as unknown as {__ZapparCvWorker?: Worker}).__ZapparCvWorker =
                    worker;
            }

            // Diagnostics: if the worker fails to load/respond, the pipeline can get stuck with
            // `frameNumber() === 0` and no camera texture.
            const resolvedWorkerUrl =
                typeof window !== 'undefined'
                    ? new URL(workerUrl, window.location.href).toString()
                    : workerUrl;
            const resolvedWasmUrl =
                typeof window !== 'undefined'
                    ? new URL(wasmUrl, window.location.href).toString()
                    : wasmUrl;

            console.log('[ZapparProvider] CV worker created', {
                workerUrl,
                resolvedWorkerUrl,
                wasmUrl,
                resolvedWasmUrl,
            });

            let workerMessagesSeen = 0;
            worker.addEventListener('message', (event: MessageEvent) => {
                workerMessagesSeen++;
                if (workerMessagesSeen === 1) {
                    console.log(
                        '[ZapparProvider] CV worker first message received',
                        event.data
                    );
                    return;
                }

                // Keep a couple more messages for context, but avoid spamming.
                if (workerMessagesSeen <= 5) {
                    console.log('[ZapparProvider] CV worker message', {
                        index: workerMessagesSeen,
                        data: event.data,
                    });
                }
            });
            worker.addEventListener('error', (event: ErrorEvent) => {
                console.warn('[ZapparProvider] CV worker error', event);
            });
            worker.addEventListener('messageerror', (event: MessageEvent) => {
                console.warn('[ZapparProvider] CV worker messageerror', event);
            });

            // If the worker never sends anything (not even the initial "loaded"), call it out.
            // This usually means the worker script or wasm URL is 404, blocked, or CSP/COEP issues.
            if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
                window.setTimeout(() => {
                    if (workerMessagesSeen > 0) return;
                    console.warn(
                        '[ZapparProvider] CV worker produced no messages (timeout)',
                        {
                            workerUrl,
                            resolvedWorkerUrl,
                            wasmUrl,
                            resolvedWasmUrl,
                        }
                    );
                }, 5000);
            }

            if (wasmUrl) {
                if (debugWorker) {
                    console.log('[ZapparProvider] Sending WASM URL to worker:', wasmUrl);
                }
                worker.postMessage({
                    t: 'wasm',
                    url: new URL(wasmUrl, window.location.href).toString(),
                });
            }

            await zapparSetOptions({worker});
            ZapparProvider._cvWorkerConfigured = true;

            if (debugWorker) {
                console.log('[ZapparProvider] CV worker configured');
            }
        } catch (e) {
            console.warn('[ZapparProvider] Failed to create CV worker:', e);
        }
    }

    private ensurePipeline(): void {
        if (this.pipeline) return;

        if (!this._zappar) {
            throw new Error('Zappar is not loaded yet. Call startSession() first.');
        }

        const Zappar = this._zappar;

        const gl = this.engine.canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('Zappar requires a WebGL2 context.');
        }

        this._gl = gl;

        const pipeline = new Zappar.Pipeline();
        pipeline.glContextSet(gl);
        this.pipeline = pipeline;

        if (typeof window !== 'undefined') {
            (window as Window & {ZapparPipeline?: Pipeline}).ZapparPipeline = pipeline;
        } else if (typeof WL_EDITOR !== 'undefined' && WL_EDITOR) {
            (globalThis as {ZapparPipeline?: Pipeline}).ZapparPipeline = pipeline;
        }

        if (typeof window !== 'undefined') {
            console.log('[ZapparProvider] Using device camera source');
        }
        const deviceId = Zappar.cameraDefaultDeviceID();
        this.cameraSource = new Zappar.CameraSource(pipeline, deviceId);
        this.instantTracker = new Zappar.InstantWorldTracker(pipeline);

        if (!this.preRenderRegistered) {
            this.engine.scene.onPreRender.add(this.onPreRender);
            this.preRenderRegistered = true;
        }
    }

    getPipeline(): Pipeline {
        if (!this.pipeline) {
            throw new Error('Zappar pipeline not initialized. Call startSession() first.');
        }
        return this.pipeline;
    }

    async ensureFaceResources(): Promise<void> {
        if (this._faceResourcesPromise) {
            await this._faceResourcesPromise;
            return;
        }

        await this.ensureZapparLoaded();
        const Zappar = this._zappar!;

        await Zappar.loadedPromise();
        this.ensurePipeline();

        this._faceResourcesPromise = (async () => {
            const faceTracker = new Zappar.FaceTracker(this.pipeline!);

            // Zappar's default loaders fetch model files relative to `import.meta.url` of the
            // module that contains them. After bundling, that usually points at the app bundle
            // in the deploy root, which causes 404s.
            //
            // We stage these assets into `static/zappar-cv/` via this package's postinstall.
            // Load explicitly from there, and fall back to the SDK defaults for flexibility.
            try {
                await faceTracker.loadModel('./zappar-cv/face_tracking_model.zbin');
            } catch (e) {
                console.warn(
                    '[ZapparProvider] Failed to load face tracking model from ./zappar-cv; falling back to Zappar defaults.',
                    e
                );
                await faceTracker.loadDefaultModel();
            }
            const faceMesh = new Zappar.FaceMesh();
            try {
                await faceMesh.load(
                    './zappar-cv/face_mesh_face_model.zbin',
                    true,
                    true,
                    true,
                    false
                );
            } catch (e) {
                console.warn(
                    '[ZapparProvider] Failed to load face mesh model from ./zappar-cv; falling back to Zappar defaults.',
                    e
                );
                await faceMesh.loadDefaultFace(true, true, true);
            }
            this._faceTracker = faceTracker;
            this._faceMesh = faceMesh;
        })();

        await this._faceResourcesPromise;
    }

    getFaceTracker(): FaceTracker {
        if (!this._faceTracker) {
            throw new Error(
                'Face tracker not initialized. Call ensureFaceResources() first.'
            );
        }
        this._faceTracker.enabled = true;
        return this._faceTracker;
    }

    getFaceMesh(): FaceMesh {
        if (!this._faceMesh) {
            throw new Error('Face mesh not initialized. Call ensureFaceResources() first.');
        }
        return this._faceMesh;
    }

    ensureImageTracker(): ImageTracker {
        this.ensurePipeline();

        if (!this._zappar) {
            throw new Error('Zappar is not loaded yet. Call startSession() first.');
        }

        const Zappar = this._zappar;
        if (!this._imageTracker) {
            this._imageTracker = new Zappar.ImageTracker(this.pipeline!);
        }
        this._imageTracker.enabled = true;
        return this._imageTracker;
    }

    async registerImageTarget(
        source: string | ArrayBuffer,
        options: ZapparImageTargetOptions
    ): Promise<void> {
        if (!options.name) {
            throw new Error('Image target registration requires a name.');
        }

        // Allow registering targets before an AR session starts.
        // This is useful so image targets are known for ImageScanningEvent
        // and so apps can prefetch/prepare targets without requesting camera access.
        await this.ensureZapparLoaded();
        await this._zappar!.loadedPromise();
        this.ensurePipeline();

        const Zappar = this._zappar!;
        if (!this._imageTracker) {
            this._imageTracker = new Zappar.ImageTracker(this.pipeline!);
        }
        this._imageTracker.enabled = true;

        await this._imageTracker.loadTarget(source);

        const targets = this._imageTracker.targets as unknown as ZapparImageTarget[];
        const targetIndex = targets.length - 1;
        const target = targets[targetIndex];

        const inferredType = options.type ?? this._inferImageTargetType(target);
        const geometry = this._buildImageTargetGeometry(
            target,
            options.physicalWidthInMeters
        );
        const descriptor: ZapparImageTargetDescriptor = {
            name: options.name,
            type: inferredType,
            geometry,
            properties: null,
            metadata: options.metadata ?? null,
        };

        this._imageTargetDescriptors[targetIndex] = descriptor;
        this._imageTargetsChanged.notify();
    }

    private _inferImageTargetType(target: ZapparImageTarget): ZapparImageTargetType {
        if (target.topRadius !== undefined || target.bottomRadius !== undefined) {
            if (
                target.topRadius !== undefined &&
                target.bottomRadius !== undefined &&
                Math.abs(target.topRadius - target.bottomRadius) > 1e-5
            ) {
                return 'conical';
            }
            return 'cylindrical';
        }
        return 'flat';
    }

    private _buildImageTargetGeometry(
        target: ZapparImageTarget,
        physicalWidth?: number
    ): ImageScanningEvent['imageTargets'][0]['geometry'] {
        const geometry: ImageScanningEvent['imageTargets'][0]['geometry'] = {};

        const hasPhysicalScale = target.physicalScaleFactor !== undefined;
        const planarScale = hasPhysicalScale
            ? target.physicalScaleFactor
            : physicalWidth !== undefined
              ? physicalWidth
              : undefined;

        if (planarScale !== undefined) {
            geometry.scaleWidth = planarScale;
            geometry.scaledHeight = planarScale;
        }

        const radiusFactor = hasPhysicalScale ? (target.physicalScaleFactor ?? 1) : 1;

        if (target.topRadius !== undefined) {
            geometry.radiusTop = target.topRadius * radiusFactor;
        }

        if (target.bottomRadius !== undefined) {
            geometry.radiusBottom = target.bottomRadius * radiusFactor;
        }

        if (target.sideLength !== undefined) {
            geometry.height = target.sideLength * radiusFactor;
        }

        return geometry;
    }

    getImageScanningEvent(): ImageScanningEvent {
        return {
            imageTargets: this._imageTargetDescriptors.map((descriptor) => ({
                name: descriptor.name,
                type: descriptor.type,
                metadata: descriptor.metadata ?? null,
                geometry: descriptor.geometry,
                properties: descriptor.properties,
            })),
        };
    }

    getImageTargetDescriptors(): ReadonlyArray<ZapparImageTargetDescriptor> {
        return [...this._imageTargetDescriptors];
    }

    getImageTargetDescriptor(index: number): ZapparImageTargetDescriptor | undefined {
        return this._imageTargetDescriptors[index];
    }

    private async ensureCameraRunning(): Promise<void> {
        if (!this.cameraSource || this.cameraStarted) return;

        await this.ensureZapparLoaded();
        const Zappar = this._zappar!;

        await Zappar.loadedPromise();

        const granted = await Zappar.permissionRequestUI();
        if (!granted) {
            Zappar.permissionDeniedUI();
            return;
        }
        this.cameraSource.start();

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.onVisibilityChange);
        }
        this.cameraStarted = true;
    }

    private onVisibilityChange = () => {
        if (!this.cameraSource || typeof document === 'undefined') return;
        switch (document.visibilityState) {
            case 'hidden':
                this.cameraSource.pause();
                break;
            case 'visible':
                this.cameraSource.start();
                break;
        }
    };

    private onPreRender = () => {
        if (!this.pipeline) return;

        const gl = this._gl;
        if (!gl) {
            this.pipeline.processGL();
            this.pipeline.cameraFrameUploadGL();
            this.pipeline.frameUpdate();
            return;
        }

        const previousPackBuffer = gl.getParameter(
            gl.PIXEL_PACK_BUFFER_BINDING
        ) as WebGLBuffer | null;
        const previousUnpackBuffer = gl.getParameter(
            gl.PIXEL_UNPACK_BUFFER_BINDING
        ) as WebGLBuffer | null;

        if (previousPackBuffer) gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        if (previousUnpackBuffer) gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);

        try {
            // Mirror Zappar THREE.js update order:
            // - tracking: processGL() -> frameUpdate()
            // - texture upload: cameraFrameUploadGL() is performed separately (cameraTexture.ts)
            this.pipeline.processGL();
            this.pipeline.frameUpdate();

            // Update SLAM state every frame (one loop in the provider).
            this.updateTracking();

            // Upload the latest camera frame to a WebGL texture (for background rendering).
            this.pipeline.cameraFrameUploadGL();

            // Bind the Zappar camera texture for Wonderland's sky material.
            // Wonderland Engine will handle drawing; we only ensure that:
            // - `videoTexture` sampler uniform points to the last texture unit
            // - that texture unit is bound to the Zappar camera texture
            this.bindVideoTextureForSkyMaterial();
        } catch (error) {
            // Ensure exceptions aren't swallowed by the engine render loop.
            // Log once per session to avoid spamming every frame.
            if (!this._preRenderErrorLogged) {
                this._preRenderErrorLogged = true;
                console.error('[ZapparProvider] onPreRender pipeline error', error);
            }

            // Avoid consumers using stale matrices.
            this._slamStateValid = false;
        } finally {
            if (previousPackBuffer) {
                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, previousPackBuffer);
            }
            if (previousUnpackBuffer) {
                gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, previousUnpackBuffer);
            }
        }
    };

    /** Latest projection matrix for the SLAM camera (valid only if {@link hasSlamTrackingState} is true). */
    get slamProjectionMatrix(): Readonly<Float32Array> | null {
        return this._slamStateValid ? this._slamProjectionMatrix : null;
    }

    /** Latest camera pose matrix for the SLAM camera (valid only if {@link hasSlamTrackingState} is true). */
    get slamCameraPoseMatrix(): Readonly<mat4> | null {
        return this._slamStateValid ? this._slamCameraMatrix : null;
    }

    /** Latest anchor pose matrix (valid only if {@link hasSlamTrackingState} is true). */
    get slamAnchorPoseMatrix(): Readonly<mat4> | null {
        return this._slamStateValid ? this._slamAnchorMatrix : null;
    }

    get hasSlamTrackingState(): boolean {
        return this._slamStateValid;
    }

    get slamFrameNumber(): number {
        return this._slamFrameNumber;
    }

    private bindVideoTextureForSkyMaterial(): void {
        try {
            const pipeline = this.pipeline;
            const gl = this._gl;
            if (!pipeline || !gl) return;

            const cameraTexture = pipeline.cameraFrameTextureGL();
            if (!cameraTexture) {
                this._missingCameraTextureFrames++;
                if (
                    !this._missingCameraTextureWarningLogged &&
                    this._missingCameraTextureFrames > 30
                ) {
                    this._missingCameraTextureWarningLogged = true;
                    console.warn('[ZapparProvider] No camera texture available yet');
                }
                return;
            }

            // Got a texture: reset missing-texture diagnostics.
            this._missingCameraTextureFrames = 0;
            this._missingCameraTextureWarningLogged = false;

            // Choose the last texture unit to avoid colliding with engine bindings.
            if (this._videoTextureUnit === null) {
                const maxFragmentUnits = gl.getParameter(
                    gl.MAX_TEXTURE_IMAGE_UNITS
                ) as number;
                const maxCombinedUnits = gl.getParameter(
                    gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
                ) as number;
                const maxUnits = Math.min(maxFragmentUnits | 0, maxCombinedUnits | 0);
                this._videoTextureUnit = Math.max(0, maxUnits - 1);
            }

            // Grab the engine's sky material pipeline program (provided by WLE).
            const skyMaterial = this.engine.scene.skyMaterial;
            if (!skyMaterial) return;

            const pipelineName = skyMaterial.pipeline;
            const enginePipeline = this.engine.pipelines.findByName(pipelineName);
            const program = enginePipeline?.webglProgram;
            if (!program) return;

            // Ensure the sampler uniform points at our dedicated unit.
            if (this._videoTextureProgram !== program) {
                this._videoTextureProgram = program;
                this._videoTextureUniform = gl.getUniformLocation(program, 'videoTexture');
                this._videoTextureTransformUniform = gl.getUniformLocation(
                    program,
                    'videoTextureTransform'
                );
            }

            if (this._videoTextureUniform || this._videoTextureTransformUniform) {
                const prevProgram = gl.getParameter(
                    gl.CURRENT_PROGRAM
                ) as WebGLProgram | null;
                gl.useProgram(program);

                if (this._videoTextureUniform) {
                    gl.uniform1i(this._videoTextureUniform, this._videoTextureUnit);
                }

                if (this._videoTextureTransformUniform) {
                    const mirror = pipeline.cameraFrameUserFacing();
                    const m = pipeline.cameraFrameTextureMatrix(
                        this.engine.canvas.width,
                        this.engine.canvas.height,
                        mirror
                    );
                    gl.uniformMatrix4fv(this._videoTextureTransformUniform, false, m);
                }
                gl.useProgram(prevProgram);
            }

            // Bind the texture for the upcoming render. Do not unbind it, we need it
            // to still be bound when the sky material draws.
            const prevActiveTex = gl.getParameter(gl.ACTIVE_TEXTURE) as number;
            gl.activeTexture(gl.TEXTURE0 + this._videoTextureUnit);
            gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
            gl.activeTexture(prevActiveTex);
        } catch (error) {
            if (!this._videoTextureBindErrorLogged) {
                this._videoTextureBindErrorLogged = true;
                const skyMaterial = this.engine.scene.skyMaterial;
                console.error('[ZapparProvider] bindVideoTextureForSkyMaterial exception', {
                    error,
                    pipelineName: skyMaterial?.pipeline,
                    hasGl: !!this._gl,
                    hasZapparPipeline: !!this.pipeline,
                    videoTextureUnit: this._videoTextureUnit,
                });
            }
        }
    }

    updateTracking(): void {
        if (!this.pipeline || !this.instantTracker) return;

        if (!this._zappar) return;

        const Zappar = this._zappar;
        const mirrorPoses = this.pipeline.cameraFrameUserFacing();

        // Let Zappar continuously refine a stable surface point briefly, then lock.
        // If we lock immediately at startup, we can end up with effectively 3DoF behavior.
        // If we *never* lock, the origin follows the camera and the camera appears frozen.
        if (this._anchorWarmupFramesRemaining > 0) {
            this.instantTracker.setAnchorPoseFromCameraOffset(0, 0, -5);
            this._anchorWarmupFramesRemaining--;
            this.hasInitializedAnchor = true;
        } else if (!this.hasInitializedAnchor) {
            this.instantTracker.setAnchorPoseFromCameraOffset(0, 0, -5);
            this.hasInitializedAnchor = true;
        }

        // Use the active view's near/far when available; incorrect near/far can make tracking feel
        // visually "unrooted" even if the pose is correct.
        const activeView = this.engine.scene.activeViews[0];
        if (!activeView) return;
        const zNear = activeView.near;
        const zFar = activeView.far;

        const projectionMatrix = Zappar.projectionMatrixFromCameraModel(
            this.pipeline.cameraModel(),
            this.engine.canvas.width,
            this.engine.canvas.height,
            zNear,
            zFar
        );

        let origin: Float32Array | undefined;
        let cameraPoseMatrix: Float32Array;

        // Match zappar-threejs `CameraPoseMode` behavior.
        switch (this.slamPoseMode) {
            case 'default':
                cameraPoseMatrix = this.pipeline.cameraPoseDefault();
                break;
            case 'attitude':
                cameraPoseMatrix = this.pipeline.cameraPoseWithAttitude(mirrorPoses);
                break;
            case 'anchor-origin':
            default:
                // For SLAM camera movement, we treat the InstantWorld anchor as the world origin.
                origin = this.instantTracker.anchor.poseCameraRelative(mirrorPoses);
                cameraPoseMatrix = this.pipeline.cameraPoseWithOrigin(origin);
                break;
        }

        const anchorPoseMatrix = this.instantTracker.anchor.pose(
            cameraPoseMatrix,
            mirrorPoses
        );

        // Diagnostics: track whether translation is meaningfully changing over time.
        // Zappar matrices are column-major; translation lives at indices 12..14.
        this._debugCameraPosition[0] = cameraPoseMatrix[12];
        this._debugCameraPosition[1] = cameraPoseMatrix[13];
        this._debugCameraPosition[2] = cameraPoseMatrix[14];
        this._debugAnchorPosition[0] = anchorPoseMatrix[12];
        this._debugAnchorPosition[1] = anchorPoseMatrix[13];
        this._debugAnchorPosition[2] = anchorPoseMatrix[14];

        const currentFrameNumber = this.pipeline.frameNumber();
        if (this._debugLastSampleFrameNumber === null) {
            this._debugLastSampleFrameNumber = currentFrameNumber;
            vec3.copy(this._debugLastSampleCameraPosition, this._debugCameraPosition);
            vec3.copy(this._debugLastSampleAnchorPosition, this._debugAnchorPosition);
            vec3.zero(this._debugCameraPositionDelta);
            vec3.zero(this._debugAnchorPositionDelta);
        } else {
            vec3.sub(
                this._debugCameraPositionDelta,
                this._debugCameraPosition,
                this._debugLastSampleCameraPosition
            );
            vec3.sub(
                this._debugAnchorPositionDelta,
                this._debugAnchorPosition,
                this._debugLastSampleAnchorPosition
            );

            // Refresh the baseline every ~2 seconds worth of frames at 60fps.
            // This matches the ZapparDebug interval logger, so deltas are easy to interpret.
            if (currentFrameNumber - this._debugLastSampleFrameNumber >= 120) {
                this._debugLastSampleFrameNumber = currentFrameNumber;
                vec3.copy(this._debugLastSampleCameraPosition, this._debugCameraPosition);
                vec3.copy(this._debugLastSampleAnchorPosition, this._debugAnchorPosition);
            }
        }

        this._slamProjectionMatrix.set(projectionMatrix);
        mat4.copy(this._slamCameraMatrix, cameraPoseMatrix);
        mat4.copy(this._slamAnchorMatrix, anchorPoseMatrix);
        this._slamFrameNumber = currentFrameNumber;
        this._slamStateValid = true;

        const motionPermissionGranted =
            typeof (Zappar as any).permissionGranted === 'function' &&
            (Zappar as any).Permission?.MOTION !== undefined
                ? (Zappar as any).permissionGranted((Zappar as any).Permission.MOTION)
                : undefined;

        if (typeof window !== 'undefined') {
            (
                window as Window & {
                    ZapparDebug?: {
                        projectionMatrix: unknown;
                        cameraPoseMatrix: unknown;
                        anchorPoseMatrix: unknown;
                        originMatrix?: unknown;
                        frameNumber?: unknown;
                        instantTrackerEnabled?: unknown;
                        slamPoseMode?: unknown;
                        mirrorPoses?: unknown;
                        motionPermissionGranted?: unknown;
                        cameraPosition?: unknown;
                        anchorPosition?: unknown;
                        cameraPositionDelta?: unknown;
                        anchorPositionDelta?: unknown;
                        cameraPositionDeltaLength?: unknown;
                        anchorPositionDeltaLength?: unknown;
                    };
                }
            ).ZapparDebug = {
                projectionMatrix,
                cameraPoseMatrix,
                anchorPoseMatrix,
                originMatrix: origin,
                frameNumber: this._slamFrameNumber,
                instantTrackerEnabled: this.instantTracker.enabled,
                slamPoseMode: this.slamPoseMode,
                mirrorPoses,
                motionPermissionGranted,
                cameraPosition: [
                    this._debugCameraPosition[0],
                    this._debugCameraPosition[1],
                    this._debugCameraPosition[2],
                ],
                anchorPosition: [
                    this._debugAnchorPosition[0],
                    this._debugAnchorPosition[1],
                    this._debugAnchorPosition[2],
                ],
                cameraPositionDelta: [
                    this._debugCameraPositionDelta[0],
                    this._debugCameraPositionDelta[1],
                    this._debugCameraPositionDelta[2],
                ],
                anchorPositionDelta: [
                    this._debugAnchorPositionDelta[0],
                    this._debugAnchorPositionDelta[1],
                    this._debugAnchorPositionDelta[2],
                ],
                cameraPositionDeltaLength: vec3.length(this._debugCameraPositionDelta),
                anchorPositionDeltaLength: vec3.length(this._debugAnchorPositionDelta),
            };
        } else if (typeof WL_EDITOR !== 'undefined' && WL_EDITOR) {
            (
                globalThis as {
                    ZapparDebug?: {
                        projectionMatrix: unknown;
                        cameraPoseMatrix: unknown;
                        anchorPoseMatrix: unknown;
                        originMatrix?: unknown;
                        frameNumber?: unknown;
                        instantTrackerEnabled?: unknown;
                        slamPoseMode?: unknown;
                        mirrorPoses?: unknown;
                        motionPermissionGranted?: unknown;
                        cameraPosition?: unknown;
                        anchorPosition?: unknown;
                        cameraPositionDelta?: unknown;
                        anchorPositionDelta?: unknown;
                        cameraPositionDeltaLength?: unknown;
                        anchorPositionDeltaLength?: unknown;
                    };
                }
            ).ZapparDebug = {
                projectionMatrix,
                cameraPoseMatrix,
                anchorPoseMatrix,
                originMatrix: origin,
                frameNumber: this._slamFrameNumber,
                instantTrackerEnabled: this.instantTracker.enabled,
                slamPoseMode: this.slamPoseMode,
                mirrorPoses,
                motionPermissionGranted,
                cameraPosition: [
                    this._debugCameraPosition[0],
                    this._debugCameraPosition[1],
                    this._debugCameraPosition[2],
                ],
                anchorPosition: [
                    this._debugAnchorPosition[0],
                    this._debugAnchorPosition[1],
                    this._debugAnchorPosition[2],
                ],
                cameraPositionDelta: [
                    this._debugCameraPositionDelta[0],
                    this._debugCameraPositionDelta[1],
                    this._debugCameraPositionDelta[2],
                ],
                anchorPositionDelta: [
                    this._debugAnchorPositionDelta[0],
                    this._debugAnchorPositionDelta[1],
                    this._debugAnchorPositionDelta[2],
                ],
                cameraPositionDeltaLength: vec3.length(this._debugCameraPositionDelta),
                anchorPositionDeltaLength: vec3.length(this._debugAnchorPositionDelta),
            };
        }
    }

    async endSession(): Promise<void> {
        this.stopZapparDebugLogging();
        this._preRenderErrorLogged = false;

        if (this.cameraSource && this.cameraStarted) {
            this.cameraSource.pause();
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', this.onVisibilityChange);
            }
            this.cameraStarted = false;
        }

        if (this.preRenderRegistered) {
            this.engine.scene.onPreRender.remove(this.onPreRender);
            this.preRenderRegistered = false;
        }

        this._videoTextureProgram = null;
        this._videoTextureUniform = null;
        this._videoTextureTransformUniform = null;
        this._videoTextureUnit = null;

        if (this._faceTracker) {
            this._faceTracker.enabled = false;
        }

        if (this._imageTracker) {
            this._imageTracker.enabled = false;
        }

        if (this.instantTracker) {
            this.instantTracker.enabled = false;
        }

        if (this._xrSession) {
            try {
                await this._xrSession.end();
            } catch {
                /* session already closed */
            }
            this._xrSession = null;
        }

        this.hasInitializedAnchor = false;
        this._anchorWarmupFramesRemaining = 0;
        this._slamStateValid = false;

        this.onSessionEnd.notify(this);
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    /** Whether this provider supports given tracking type */
    supports(type: TrackingType): boolean {
        switch (type) {
            case TrackingType.SLAM:
            case TrackingType.Face:
            case TrackingType.Image:
                return true;
            default:
                return false;
        }
    }

    /** Create a tracking implementation */
    createTracking(type: TrackingType, component: Component): ITrackingMode {
        switch (type) {
            case TrackingType.SLAM:
                return new WorldTracking_Zappar(this, component);
            case TrackingType.Face:
                return new FaceTracking_Zappar(this, component);
            case TrackingType.Image:
                return new ImageTracking_Zappar(this, component);
            default:
                throw new Error('Tracking mode ' + type + ' not supported.');
        }
    }
}
