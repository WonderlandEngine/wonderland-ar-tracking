declare var WL: any;
declare var Module: any;

declare var API_TOKEN_XR8: string;

declare type XR8CameraPipelineModule = {
  name: string;
  onStart?: () => void;
  onException?: (error: string) => void;
}

declare type XR8DeviceType = {
  MOBILE: 'mobile',
  MOBILE_AND_HEADSETS: 'mobile-and-headsets',
  ANY: 'any'
}

declare type XR8CameraDirection = {
  FRONT: 'front',
  BACK: 'back',
}


declare type XR8FaceMeshFeatures = {
  FACE: 'face',
  MOUTH: 'mouth',
  EYES: 'eyes',
}

declare type XR8HitTestType = {
  FEATURE_POINT: 'FEATURE_POINT',
  ESTIMATED_SURFACE: 'ESTIMATED_SURFACE',
  DETECTED_SURFACE: 'DETECTED_SURFACE'
}


declare var XR8: {
  runPreRender: (time: number) => void;
  runRender: () => void;
  runPostRender: (time: number) => void;

  GlTextureRenderer: {
    pipelineModule: () => XR8CameraPipelineModule;
  };

  XrController: {
    pipelineModule: () => XR8CameraPipelineModule;
    hitTest: (x: number, y: number, includedTypes: XR8HitTestType[keyof XR8HitTestType][]) => { type: XR8HitTestType, position: { x: number, y: number, z: number }, rotation: { x: number, y: number, z: number }, distance: number }[];
    updateCameraProjectionMatrix: (options: {
      origin: { x: number, y: number, z: number },
      facing: { x: number, y: number, z: number, w: number },
      cam?: { pixelRectWidth?: number, pixelRectHeight?: number, nearClipPlane?: number, farClipPlane?: number }
    }) => void;

    configure: (options: {
      disableWorldTracking?: boolean,
      scale?: 'absolute' | 'responsive',
      enableLighting?: boolean,
      enableVps: boolean
    }) => void;
  };

  XrDevice: {
    isDeviceBrowserCompatible: () => boolean,
  };

  FaceController: {
    pipelineModule: () => XR8CameraPipelineModule;
    MeshGeometry: XR8FaceMeshFeatures,

    configure: (options: {
      meshGeometry: XR8FaceMeshFeatures[keyof XR8FaceMeshFeatures][],
      coordinates: { mirroredDisplay: boolean },
    }) => void;
  };

  XrConfig: {
    device: () => XR8DeviceType;
    camera: () => XR8CameraDirection;
  };

  addCameraPipelineModules: (modules: XR8CameraPipelineModule[]) => void;
  removeCameraPipelineModules: (modules: XR8CameraPipelineModule[]) => void;

  run: (options: {
    canvas: HTMLCanvasElement,
    webgl2?: boolean,
    ownRunLoop?: boolean,
    cameraConfig?: {
      direction: XR8CameraDirection[keyof XR8CameraDirection],
    },
    glContextConfig?: WebGLContextAttributes,
    allowedDevices?: XR8DeviceType[keyof XR8DeviceType],
    sessionConfiguration?: {
      disableXrTablet?: boolean,
      xrTabletStartsMinimized?: boolean,
      defaultEnvironment?: {
        disabled?: boolean,
        floorScale?: number,
        floorTexture?: any,
        floorColor?: string,
        fogIntensity?: number,
        skyTopColor?: string,
        skyBottomColor?: string,
        skyGradientStrength?: number
      }
    }
  }) => void;

  stop:() => void;
}