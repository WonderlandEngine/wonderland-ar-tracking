export function wonderlandCameraFeed(settings) {
    var settings = settings || {};
    let flipY = settings.flipY;
    let mirroredDisplay = settings.mirroredDisplay;
    let renderTexture = null;
    let texOnUpdateProv = null;
    let fgTexturesAndMasks = [];
    let foregroundTexOnUpdateProv = null;
    let rendering = null;
    let viewport = {};
    let fgViewport = {};

    let material = settings.material;

    return {
        name: 'gltexturerenderer',
        onAttach: function ({videoWidth, videoHeight, canvasWidth, canvasHeight, config}) {
            const canvasWidth = settings.canvasWidth,
                canvasHeight = settings.canvasHeight,
                videoWidth = settings.videoWidth,
                videoHeight = settings.videoHeight,
                config = settings.config,
                sessionAttributes = settings.sessionAttributes;
            sessionAttributes = sessionAttributes;
            const verbose = !(null == config || !config.verbose);
            (rendering = zC({
                flipY: flipY,
                mirroredDisplay: mirroredDisplay,
                verbose: verbose,
            })),
                (viewport = jC({
                    videoWidth: videoWidth,
                    videoHeight: videoHeight,
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                })),
                (fgViewport = uC({
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                }));
        },
        onDetach: function () {
            rendering && rendering.destroy(),
                (rendering = null),
                (viewport = {}),
                (fgViewport = {}),
                (renderTexture = null),
                (fgTexturesAndMasks = []);
        },
        onUpdate: function (update) {
            const frameStartResult = update.frameStartResult,
                processGpuResult = update.processGpuResult,
                processCpuResult = update.processCpuResult;
            if (foregroundTexOnUpdateProv) {
                const tex = foregroundTexOnUpdateProv({
                    frameStartResult: frameStartResult,
                    processGpuResult: processGpuResult,
                    processCpuResult: processCpuResult,
                });
                tex && (fgTexturesAndMasks = tex);
            }
            if (texOnUpdateProv) {
                const tex = texOnUpdateProv({
                    frameStartResult: frameStartResult,
                    processGpuResult: processGpuResult,
                    processCpuResult: processCpuResult,
                });
                tex && (renderTexture = tex);
            } else {
                const tex = processCpuResult.reality
                    ? processCpuResult.reality.realityTexture
                    : frameStartResult.cameraTexture;
                tex && (renderTexture = tex);
            }
        },
        onProcessGpu: function () {
            return {
                viewport: viewport,
                shader: rendering.shader(),
            };
        },
        onRender: function () {
            sessionAttributes.fillsCameraTexture &&
                rendering.render({
                    renderTexture: renderTexture,
                    foregroundTexturesAndMasks: fgTexturesAndMasks,
                    viewport: viewport,
                    foregroundViewport: fgViewport,
                });
        },
        onCanvasSizeChange: function (sizes) {
            const vWidth = sizes.videoWidth,
                vHeight = sizes.videoHeight,
                cWidth = sizes.canvasWidth,
                cHeight = sizes.canvasHeight;
            (viewport = jC({
                videoWidth: vWidth,
                videoHeight: vHeight,
                canvasWidth: cWidth,
                canvasHeight: cHeight,
            })),
                (fgViewport = uC({
                    canvasWidth: cWidth,
                    canvasHeight: cHeight,
                }));
        },
        onVideoSizeChange: function (sizes) {
            var vWidth = sizes.videoWidth,
                vHeight = sizes.videoHeight,
                cWidth = sizes.canvasWidth,
                cHeight = sizes.canvasHeight;
            (viewport = jC({
                videoWidth: vWidth,
                videoHeight: vHeight,
                canvasWidth: cWidth,
                canvasHeight: cHeight,
            })),
                (fgViewport = uC({
                    canvasWidth: cWidth,
                    canvasHeight: cHeight,
                }));
        },
        configure: function (config) {
            if (!config) return;
            if (config.flipY !== undefined) flipY = config.flipY;
            if (config.mirroredDisplay !== undefined)
                mirroredDisplay = !!config.mirroredDisplay;
        },
        setTexOnUpdateProvider: function (prov) {
            texOnUpdateProv = prov;
        },
        setForegroundTexOnUpdateProvider: function (prov) {
            foregroundTexOnUpdateProv = prov;
        },
    };
}
