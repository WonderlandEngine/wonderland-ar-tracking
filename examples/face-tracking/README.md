# Face tracking example

![Preview](previews/face-tracking.webp?raw=true 'Simple Image target')

- `js/face-attachment-point-example.ts` - attaches the point to one of tracked face feature points (nose, ears, eyes, lips, etc)

- `js/face-mask-example.ts` - renders a generated mesh of the face, to which you can attach any texture.

---

Run face tracking using the Zappar provider. Provides examples of face mesh rendering and the usage of face attachment points.

To successfully run:

- Install dependencies: `npm i`
- Ensure Zappar CV assets are served at `/zappar-cv/zappar-cv.worker.js` and the corresponding `.wasm`.
    - Wonderland serves `static/` at `/`, and the Zappar provider's `postinstall` copies the required files into `static/zappar-cv/` automatically.
- Run on HTTPS (camera access requires a secure context).
