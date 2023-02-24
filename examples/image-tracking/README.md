# SLAM (World tracking) camera demo
Runs an AR session using WebXR Device AP where available with a fallback to 8th-wall implementation.

To successfully run in 
- make sure `API_TOKEN_XR8` is defined in the index.html file
```
<script>
  const API_TOKEN_XR8 = "your 8thwall project API token";
</script>
```
- Add one or more FLAT image targets to your 8thwall project on 8thwall.com.
- For each tracked image add an object with a `js/image-tracker.ts` component in the editor. Set the `imageId` to be the name of the image as displayed in the 8thwall project.
- Make sure the app is running on HTTPS.