# Rigged Office Character Demo

Codex-accessible source archive for the single-page rigged character, scene, camera, dialogue and director demo.

## Rebuild the HTML

From this folder, run:

```bash
node build.mjs
```

This creates:

```text
rigged_office_character_demo.html
```

The HTML source is stored in ordered chunks under `source/` only to make the upload reliable. The build script concatenates those files without altering their contents.

## Open locally

After building, open `rigged_office_character_demo.html` in Chrome or Edge.

## Codex prompt

```text
Open codex/rigged-office-character, run node build.mjs, inspect the generated rigged_office_character_demo.html, and continue improving the 2D character rig, scene blocking, camera system and fixed HTML dialogue overlay. Keep the app self-contained in one HTML file.
```
