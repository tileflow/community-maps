# Super Tile World trees

Original Tileflow artwork, licensed with this repository. No extracted game models, textures,
third-party geometry or raster tree sprites are used. Six forms each have a matching `.far.glb`.

Run `node maps/super-tile-world/assets/build-trees.mjs` from the repository root to regenerate.
`npm run check:models` verifies that the committed bytes match the source. The public SDK import
pipeline validates and packs both levels into the style, so there are no per-tree network loads.

| Form | Near triangles | Far triangles |
| --- | ---: | ---: |
| Round bell | 368 | 120 |
| Broad bell | 368 | 120 |
| Tall bell | 368 | 120 |
| Conifer | 248 | 84 |
| Columnar | 208 | 84 |
| Palm | 120 | 60 |

All files use glTF 2.0, Y up, grounded origins, indexed triangles, smooth vertex normals and per-vertex band shades.
There are no textures, animations, extensions or external files. Materials are `bark` plus
`leaves` (or `fronds` for palms); the map chooses their colors. The SDK normalizes height/crown
width, applies the geographic dimensions and chooses detail by distance. The far models preserve
the bell silhouette, tier or frond arrangement instead of reverting to generic tree shapes.

The bell forms were studied from [Super Bell Hill gameplay](https://www.youtube.com/watch?v=k9zyhiBKqw4)
and [in-game screenshots](https://www.nintendocastle.com/super-mario-3d-world-stamps/world-1/):
a continuous domed crown, a flared collar, alternating horizontal bands and a pale trunk.
The reference images and game models are not included. The map paints the broadleaf forms gold
and keeps evergreen and palm forms green.
