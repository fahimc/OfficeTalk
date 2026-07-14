# Codex instructions

- Run `node build.mjs` before inspecting or editing the demo.
- The generated working file is `rigged_office_character_demo.html`.
- Keep the delivered app self-contained in one HTML file with inline CSS, SVG and JavaScript.
- Preserve the rig hierarchy and joint parenting when changing poses.
- Keep dialogue/subtitle HTML outside the zoomed camera rig so text size and screen position remain stable.
- Keep multiple characters at consistent height and apply minimum spacing to prevent overlap.
- After editing the generated HTML, split it back into sequential `source/part-XX.htmlpart` files or replace the source archive with an equivalent maintainable structure.
- Test mobile portrait layout, camera zooms, scene changes, speaking, sitting and the director demo before finishing.
