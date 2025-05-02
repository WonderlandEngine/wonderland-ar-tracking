# 8th Wall VPS (visual positioning system) camera demo

![Preview](previews/dynamic-mesh.webp?raw=true 'Dynamically generated mesh')

To successfully run in

- Select 8thwall as a framework in the editor `Project Settings -> VR & AR -> framework`.
- Paste in your 8th Wall API key.
- Make sure the app is running on HTTPS.
- clear the editor `Project Settings -> Editor -> serverCOEP` value

- Assign waypoints to the project on the 8th Wall platform projects geospatial-browser.

- If you'll be using dynamically generated meshes, set the 'VERTEX_COLORS' attribute to pipeline of that material.

- Make sure the app is running on HTTPS.

# Try out the private scans

- Install Niantic Wayfarer app (Play store on Android, might still be via TestFlight on iOS).
- Sign in with your account.
- Create a new scan and upload it as a private scan.
- Goto geospatial-browser in your project on the 8th Wall platforms and assign a newly uploaded scan to your project.
- More details at the [official 8th Wall docs ](https://www.8thwall.com/docs/web/#lightship-vps)

# Some notes

If you need better quality scanned models, you can download the scans as .glb files from the geospatial-browser. You can show/hide those models depending on the detected waypoints.
Alternatively, the scanned mesh can be generated dynamically from the data received from the 8th Wall. However, this mesh is lower quality and currently 8th Wall can send any mesh from the detected waypoints and there is no way knowing to which waypoint the mesh belongs..
