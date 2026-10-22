# Super Tile World trees

Original Tileflow artwork, licensed with this repository. No extracted game models, textures,
third-party geometry or raster tree sprites are used. Six forms each have a matching `.far.glb`.

Run `node maps/super-tile-world/assets/build-trees.mjs` from the repository root to regenerate.
`npm run check:models` verifies that the committed bytes match the source. The public SDK import
pipeline validates and packs both levels into the style, so there are no per-tree network loads.

| Form | Near triangles | Far triangles |
| --- | ---: | ---: |
| Round | 324 | 84 |
| Open | 324 | 84 |
| Tall | 192 | 60 |
| Conifer | 324 | 84 |
| Columnar | 192 | 60 |
| Palm | 120 | 60 |

All files use glTF 2.0, Y up, grounded origins, indexed triangles and smooth vertex normals.
There are no textures, animations, extensions or external files. Materials are `bark` plus
`leaves` (or `fronds` for palms); the map chooses their colors. The SDK normalizes height/crown
width, applies the geographic dimensions and chooses detail by distance. The far models preserve
the broad crown, oval, tier or frond arrangement instead of reverting to generic tree shapes.
