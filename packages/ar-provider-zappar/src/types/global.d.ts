interface Window {
    ZapparPipeline?: import('@zappar/zappar').Pipeline;
    ZapparDebug?: {
        projectionMatrix: unknown;
        cameraPoseMatrix: unknown;
        anchorPoseMatrix: unknown;
    };
    WEBXR_REQUIRED_FEATURES: string[];
    WEBXR_OPTIONAL_FEATURES: string[];
}

declare var WEBXR_REQUIRED_FEATURES: string[];
declare var WEBXR_OPTIONAL_FEATURES: string[];

declare const WL_EDITOR: boolean | undefined;
