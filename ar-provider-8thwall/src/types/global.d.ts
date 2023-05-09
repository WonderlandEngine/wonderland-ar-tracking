declare var API_TOKEN_XR8: string;

declare type XR8CameraPipelineModuleUpdateArgs = {
    processCpuResult: {
        reality: {
            rotation: {x: number; y: number; z: number; w: number};
            position: {x: number; y: number; z: number; w: number};
            intrinsics: number[];
        };

        facecontroller: {
            rotation: {x: number; y: number; z: number; w: number};
            position: {x: number; y: number; z: number; w: number};
            intrinsics: number[];
        };
    };
};

declare type XR8CameraPipelineModule = {
    name: string;
    onAttach?: (details: {
        framework: unknown;
        canvas: HTMLCanvasElement;
        GLctx: WebGLRenderingContext | WebGL2RenderingContext;
        computeCtx: WebGLRenderingContext | WebGL2RenderingContext;
        isWebgl2: boolean;
        orientation: number;
        videoWidth: number;
        videoHeight: number;
        canvasWidth: number;
        canvasHeight: number;
        status: ['requesting', 'hasStream', 'hasVideo', 'failed'];
        stream: MediaStream;
        video: HTMLVideoElement;
        version?: string;
        imageTargets?: [{imagePath: string; metadata: unknown; name: string}];
        config: unknown;
    }) => void;
    onDetach?: (...args: any) => void;
    onStart?: (event: XR8CameraPipelineModuleUpdateArgs) => void;
    onUpdate?: (e: XR8CameraPipelineModuleUpdateArgs) => void;
    onException?: (error: string) => void;
};

declare type XR8DeviceType = {
    MOBILE: 'mobile';
    MOBILE_AND_HEADSETS: 'mobile-and-headsets';
    ANY: 'any';
};

declare type XR8CameraDirection = {
    FRONT: 'front';
    BACK: 'back';
};

declare type XR8FaceMeshFeatures = {
    FACE: 'face';
    MOUTH: 'mouth';
    EYES: 'eyes';
};

declare enum XR8FaceAttachmentPoints {
    FOREHEAD = 'forehead',
    RIGHT_EYEBROW_INNER = 'rightEyebrowInner',
    RIGHT_EYEBROW_MIDDLE = 'rightEyebrowMiddle',
    RIGHT_EYEBROW_OUTER = 'rightEyebrowOuter',
    LEFT_EYEBROW_INNER = 'leftEyebrowInner',
    LEFT_EYEBROW_MIDDLE = 'leftEyebrowMiddle',
    LEFT_EYEBROW_OUTER = 'leftEyebrowOuter',
    LEFT_EAR = 'leftEar',
    RIGHT_EAR = 'rightEar',
    LEFT_CHEEK = 'leftCheek',
    RIGHT_CHEEK = 'rightCheek',
    NOSE_BRIDGE = 'noseBridge',
    NOSE_TIP = 'noseTip',
    LEFT_EYE = 'leftEye',
    RIGHT_EYE = 'rightEye',
    LEFT_EYE_OUTER_CORNER = 'leftEyeOuterCorner',
    RIGHT_EYE_OUTER_CORNER = 'rightEyeOuterCorner',
    UPPER_LIP = 'upperLip',
    LOWER_LIP = 'lowerLip',
    MOUTH = 'mouth',
    MOUTH_RIGHT_CORNER = 'mouthRightCorner',
    MOUTH_LEFT_CORNER = 'mouthLeftCorner',
    CHIN = 'chin',
}

declare type XR8HitTestType = {
    FEATURE_POINT: 'FEATURE_POINT';
    ESTIMATED_SURFACE: 'ESTIMATED_SURFACE';
    DETECTED_SURFACE: 'DETECTED_SURFACE';
};

declare type XR8TrackingStatusEvent = {
    name: 'reality.trackingstatus';
    detail: {
        status: 'LIMITED' | 'NORMAL';
        reason: 'INITIALIZING' | 'UNDEFINED';
    };
};

/**
 * XR8ImageScanningEvent is raised before any image is tracked.
 * This just gives you an opportunity to generate any geometries if you want (for example a cylinder or a cone around the tracked image surface)
 */
declare type XR8ImageScanningEvent = {
    name: 'reality.imagescanning';
    detail: {
        imageTargets: {
            /**
             * Image name the will be tracked
             */
            name: string;
            type: 'FLAT' | 'CYLINDRICAL' | 'CONICAL';
            metadata: any | null;

            geometry: {
                arcLengthRadians?: number;
                arcStartRadians?: number;
                height?: number;
                radiusBottom?: number;
                radiusTop?: number;

                /** The width of the image in the scene, when multiplied by scale. */
                scaleWidth?: number; 

                /** The height of the image in the scene, when multiplied by scale. */
                scaledHeight?: number;
            };

            properties?: {
                height: number;
                width: number;
                isRotated: boolean;
                left: number;
                top: number;
                moveable: boolean;
                originalHeight: number;
                originalWidth: number;
                physicalWidthInMeters: number | null;
            } | null;
        }[];
    };
};


declare type XR8ImageTrackedEvent = {
    /** Name of the event.*/
    name: 'reality.imagefound' | 'reality.imageupdated' | 'reality.imagelost';
    detail: {
         /* Name of the tracked image */
         name: string; 

         /* Position of the tracked image */
         position: {x: number; y: number; z: number};
 
         /* Rotation of the tracked image */
         rotation: {x: number; y: number; z: number; w: number};
 
         /* A scale factor that should be applied to object attached to this image. */
         scale: number;
 
         /* The width of the image in the scene, when multiplied by scale. */
         scaleWidth: number;
 
         /* The height of the image in the scene, when multiplied by scale. */
         scaledHeight: number;
 
         /* Type of the tracked image */
         type: 'FLAT' | 'CYLINDRICAL' | 'CONICAL';
 
         /* Height of the curved target. */
         height?: number;
 
         /* Radius of the curved target at the top. */
         radiusTop?: number;
 
         /* Radius of the curved target at the bottom. */
         radiusBottom?: number;
 
         /* Starting angle in radians. */
         arcStartRadians?: number;
 
         /* Central angle in radians. */
         arcLengthRadians?: number;
    };
};

declare type XR8VPSMeshFoundEvent = {
    name: string;
    detail: {
        id: string;
        position: {x: number; y: number; z: number};
        rotation: {x: number; y: number; z: number; w: number};
        geometry: {
            index: {
                array: Uint32Array;
                itemSize: 1;
            };
            attributes: [
                {
                    name: 'position';
                    array: Float32Array;
                    itemSize: 3;
                },
                {
                    name: 'color';
                    array: Float32Array;
                    itemSize: 3;
                }
            ];
        };
    };
};

declare type XR8VPSMeshUpdatedEvent = {
    name: string;
    detail: {
        id: string;
        position: {x: number; y: number; z: number};
        rotation: {x: number; y: number; z: number; w: number};
    };
};

declare type XR8VPSMeshLostEvent = {
    name: string;
    detail: {
        id: string;
    };
};

declare type XR8VPSWayPointEvent = {
    name: string;
    detail: {
        name: string;
        position: {x: number; y: number; z: number};
        rotation: {x: number; y: number; z: number; w: number};
    };
};

declare type XR8FaceLoadingEvent = {
    name: string;
    detail: {
        maxDetections: number;
        pointsPerDetection: number;
        indices: [{a: number; b: number; c: number}];
        uvs: [{u: number; v: number}];
    };
};

declare type XR8FaceFoundEvent = {
    name: string;
    detail: {
        id: number;
        vertices: [{x: number; y: number; z: number}];
        normals: [{x: number; y: number; z: number}];

        attachmentPoints: {
            [value in XR8FaceAttachmentPoints]: {
                position: {x: number; y: number; z: number};
            };
        };

        transform: {
            position: {x: number; y: number; z: number};
            rotation: {x: number; y: number; z: number; w: number};
            
            /* A scale factor that should be applied to objects attached to this face. */
            scale: number;

            /* Approximate width of the head in the scene when multiplied by scale. */
            scaledWidth: number;

            /* Approximate height of the head in the scene when multiplied by scale. */
            scaledHeight: number;

            /* Approximate depth of the head in the scene when multiplied by scale. */
            scaledDepth: number;
        };
    };
};

declare type XR8FaceLostEvent = {
    name: string;
    detail: {
        id: number;
    };
};

declare var XR8: {
    /** Added by WLE, to track if any session is running across different WLE runtimes */
    WLE_sessionRunning: boolean;

    runPreRender: (time: number) => void;
    runRender: () => void;
    runPostRender: (time: number) => void;

    GlTextureRenderer: {
        pipelineModule: () => XR8CameraPipelineModule;
    };

    XrController: {
        pipelineModule: () => XR8CameraPipelineModule;
        hitTest: (
            x: number,
            y: number,
            includedTypes: XR8HitTestType[keyof XR8HitTestType][]
        ) => {
            type: XR8HitTestType;
            position: {x: number; y: number; z: number};
            rotation: {x: number; y: number; z: number};
            distance: number;
        }[];

        updateCameraProjectionMatrix: (options: {
            origin: {x: number; y: number; z: number};
            facing: {x: number; y: number; z: number; w: number};
            cam?: {
                pixelRectWidth?: number;
                pixelRectHeight?: number;
                nearClipPlane?: number;
                farClipPlane?: number;
            };
        }) => void;

        configure: (options: {
            disableWorldTracking?: boolean;
            scale?: 'absolute' | 'responsive';
            enableLighting?: boolean;
            enableVps: boolean;
        }) => void;
    };

    XrDevice: {
        isDeviceBrowserCompatible: () => boolean;
    };

    FaceController: {
        pipelineModule: () => XR8CameraPipelineModule;
        MeshGeometry: XR8FaceMeshFeatures;
        AttachmentPoints: XR8FaceAttachmentPoints[];

        configure: (options: {
            meshGeometry: XR8FaceMeshFeatures[keyof XR8FaceMeshFeatures][];
            coordinates: {mirroredDisplay: boolean};
        }) => void;
    };

    XrConfig: {
        device: () => XR8DeviceType;
        camera: () => XR8CameraDirection;
    };
    clearCameraPipelineModules: () => void;
    addCameraPipelineModules: (modules: XR8CameraPipelineModule[]) => void;
    removeCameraPipelineModules: (modules: XR8CameraPipelineModule[]) => void;

    run: (options: {
        canvas: HTMLCanvasElement;
        webgl2?: boolean;
        ownRunLoop?: boolean;
        cameraConfig?: {
            direction: XR8CameraDirection[keyof XR8CameraDirection];
        };
        glContextConfig?: WebGLContextAttributes;
        allowedDevices?: XR8DeviceType[keyof XR8DeviceType];
        sessionConfiguration?: {
            disableXrTablet?: boolean;
            xrTabletStartsMinimized?: boolean;
            defaultEnvironment?: {
                disabled?: boolean;
                floorScale?: number;
                floorTexture?: any;
                floorColor?: string;
                fogIntensity?: number;
                skyTopColor?: string;
                skyBottomColor?: string;
                skyGradientStrength?: number;
            };
        };
    }) => void;

    stop: () => void;
};
