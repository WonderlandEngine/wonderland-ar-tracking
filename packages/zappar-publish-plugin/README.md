# Zappar Publish Plugin

Wonderland Engine editor plugin to publish your packaged project (`deploy/`) to ZapWorks (Zappar) using the ZapWorks CLI.

## Installation

Install in your Wonderland project:

```sh
npm i --save-dev @wonderlandengine/zappar-publish-plugin
```

The plugin is auto-registered through the package's `wonderlandengine.plugins`
entry in `package.json`.

## Prerequisites

- ZapWorks credentials configured for your environment (as required by `@zappar/zapworks-cli`).
- A packaged Wonderland project ready to upload.
- (Optional) Image files if you want to train targets.

## Features

- Upload & publish via `zapworks upload` / `zapworks publish`
- Train image-tracking targets via `zapworks train` and output them to `static/zappar-targets/`

## Notes

- This plugin complements `@wonderlandengine/ar-provider-zappar`:
	- `ar-provider-zappar` handles runtime tracking in your app.
	- `zappar-publish-plugin` handles editor-side publish/train workflows.
