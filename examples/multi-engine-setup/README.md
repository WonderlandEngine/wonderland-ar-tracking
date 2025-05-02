# Multi-engine setup

<img width="288" src="previews/screenshot.png?raw=true" alt="Multiple players" />

Demonstrates 8th Wall usage with multiple scenes rendering on the same page.

There are 3 players with different combinations (same runtime & different scenes, different runtime & with a scene) sharing the 8th Wall lib.
Note, that only one tracking session can be running a the same time. Trying to run a tracking session on a player while some other player is already tracking, will do nothing and issue a console.warn

To successfully run in

- Open and build `../image-tracking` example
- Then copy all the `ImageTracking*` files from `image-tracking/deploy` to the `multi-engine-setup/deploy` folder</p>
- Select 8thwall as a framework in the editor `Project Settings -> VR & AR -> framework`.
- Paste in your 8th Wall API key.
- Make sure the app is running on HTTPS.
