# Wonderland Engine AR Tracking - Zappar Provider

Implementation of a Zappar-based AR tracking provider for the [Wonderland Engine AR framework](https://www.npmjs.com/package/@wonderlandengine/ar-tracking).

Learn more about Wonderland Engine at [https://wonderlandengine.com](https://wonderlandengine.com).

## Usage

Install this provider into your Wonderland Engine project:

```sh
npm i --save @wonderlandengine/ar-provider-zappar
```

For instructions on configuring AR sessions, refer to the
[repository README](https://github.com/WonderlandEngine/wonderland-ar-tracking#readme).

This package depends on `@zappar/zappar`; make sure your bundler is configured
to serve the `zcv.wasm` asset as described in the
[Zappar installation guide](https://docs.zap.works/universal-ar/javascript/getting-started/installation/).

> **Note:** The provider currently keeps tracking active but does not draw the
> Zappar camera feed to the Wonderland canvas. If you require a background
> video, composite it manually in your application.

## Supported Tracking Modes

The Zappar provider implements SLAM, face tracking, and image tracking. These
map to the standard Wonderland Engine components supplied by
`@wonderlandengine/ar-tracking` (`ARSLAMCamera`, `ARFaceTrackingCamera`, and
`ARImageTrackingCamera`).

- Face tracking loads Zappar's default model and mesh. Attachment points that
  have no exact landmark are approximated to the closest available Zappar
  landmark.

## Recording a Zappar Sequence (Camera + Motion)

If you want accurate offline replay (especially for SLAM), recording **only** an
MP4 is usually not enough. Zappar can also record a **sequence** that contains
camera frames **and** device motion data.

Record on a phone/tablet (where the IMU matches the camera movement), then copy
the saved file to your desktop for replay.

### Quick Record Script (DevTools Console)

This repo already exposes the current pipeline as `window.ZapparPipeline`.

1. Start your AR session normally.
2. Open DevTools on the capture device (or use remote debugging).
3. Paste the following:

```js
// Start recording (pre-alloc ~20 seconds @ 30fps)
window.ZapparPipeline.sequenceRecordClear();
window.ZapparPipeline.sequenceRecordStart(30 * 20);

// When you're done recording, run this to stop + download the sequence:
window.ZapparPipeline.sequenceRecordStop();
const data = window.ZapparPipeline.sequenceRecordData(); // Uint8Array
const blob = new Blob([data], {type: 'application/octet-stream'});
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'zappar-sequence.bin';
a.click();
URL.revokeObjectURL(a.href);
```

Notes:

- Sequence recording captures camera + IMU, so it’s best done on a mobile device.
- You can replay sequences using Zappar’s `SequenceSource` API (preferred over MP4 replay for correct tracking).

### Registering Image Targets

To use image tracking, register each Zappar `.zpt` target file with the
provider before the session starts:

```ts
import {
    ZapparProvider,
    ZapparImageTargetOptions,
} from '@wonderlandengine/ar-provider-zappar';
import {ARSession} from '@wonderlandengine/ar-tracking';

const session = ARSession.getSessionForEngine(engine);
const provider = ZapparProvider.registerTrackingProviderWithARSession(session);

const posterTarget: ZapparImageTargetOptions = {
    name: 'poster',
    physicalWidthInMeters: 0.25,
};

await provider.registerImageTarget('/static/targets/poster.zpt', posterTarget);
```

Once registered, the provider emits image scanning and tracking events via
`ARImageTrackingCamera`.
