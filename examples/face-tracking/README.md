# SLAM (World tracking) camera demo
Runs an AR session using WebXR Device AP where available with a fallback to 8th-wall implementation.

To successfully run in 
- make sure `API_TOKEN_XR8` is defined in the index.html file
```
<script>
  const API_TOKEN_XR8 = "your 8thwall project API token";
</script>
```

- Make sure the app is running on HTTPS.