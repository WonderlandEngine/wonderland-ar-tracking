# 8thwall VPS (visual positioning system) camera demo

To successfully run in 
- make sure `API_TOKEN_XR8` is defined in the index.html file
```
<script>
  const API_TOKEN_XR8 = "your 8thwall project API token";
</script>
```
- clear the Project Settings/Editor/serverCOEP value

- Assign waypoints to the project on the 8thwall platform projects geospatial-browser.

- If you'll be using dynamically generated meshes, set the 'VERTEX_COLORS' attribute to pipeline of that material.

- Make sure the app is running on HTTPS.




# Try out the private scans

- Install Niantic Wayfarer app (Play store on Android, might still be via TestFlight on iOS).
- Sign in with your account.
- Create a new scan and upload it as a private scan.
- Goto geospatial-browser in your project on the 8thwall platforms and assign a newly uploaded scan to your project.
- More details at the [official 8thwall docs ](https://www.8thwall.com/docs/web/#lightship-vps)

# Some notes
If you need better quality scaned models, you can download the scans as .glb files from the geospatial-browser. You can show/hide those models depending on the detected waypoints.
Alternatively, the scanned mesh can be generated dynamically from the data received from the 8thwall. However, this mesh is lower quality and currently 8thwall is only sending you the mesh of the very first waypoint detected. 
