# Image tracking camera demo

## Simple image target example

![Preview](previews/image-target.webp?raw=true 'Simple Image target')

To test - point your camera at `textures/image-target-1-white.png`

---

<br/>

## Dynamic textured mesh (plane) generation to render a correctly sized image onto the tracked target

![Preview](previews/flat-image-physical-size.webp?raw=true 'Physically correct image size')

To test - point your camera at `textures/image-target-2-white.png`

---

<br/>

## Dynamic textured mesh (plane) generation to render a correctly sized image onto the curved target

![Preview](previews/curved-image-target-video.webp?raw=true 'Curved image target with video')

To test - point your camera at `previews/fanta.jpeg` for a quick & dirty test. To test how it really works - point your camera at the standard 0.5L "Fanta" bottle. Otherwise, print it out and stick on a bottle with a circumference of around 333mm.

---

<br/>

This example is wired to use the Zappar provider.

To successfully run:

- Install dependencies: `npm i`
- Ensure Zappar CV assets are served at `/zappar-cv/zappar-cv.worker.js` and the corresponding `.wasm`.
    - Wonderland serves `static/` at `/`, and the Zappar provider's `postinstall` copies the required files into `static/zappar-cv/` automatically.
- Generate Zappar image targets (`.zpt`) for the images in `textures/` and place them under `static/targets/`:
    - `static/targets/image-target-1-white.zpt`
    - `static/targets/image-target-2-white.zpt`
    - `static/targets/fanta.zpt`
- Run on HTTPS (camera access requires a secure context).

Notes:

- The object components in `ImageTracking.wlp` still use the `imageId` field; for Zappar this is treated as the **registered target name**.
- The “physical size” demo relies on target geometry. Flat targets work with `physicalWidthInMeters`, but cylindrical/conical targets should be authored with correct dimensions in Zappar.
