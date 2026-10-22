# Super Tile World trees

Original Tileflow artwork, licensed with this repository. No extracted game models, textures,
third-party geometry or raster tree sprites are used. Six forms each have a matching `.far.glb`.

Run `node maps/super-tile-world/assets/build-trees.mjs` from the repository root to regenerate.
`npm run check:models` verifies that the committed bytes match the source. The public SDK import
pipeline validates and packs both levels into the style, so there are no per-tree network loads.

| Form | Near triangles | Far triangles |
| --- | ---: | ---: |
| Round bell | 368 | 120 |
| Lobed deciduous crown | 384 | 108 |
| Layered leafy crown | 480 | 114 |
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
The reference images and game models are not included. The map gives broadleaf forms a predominantly green palette with occasional yellow accents,
and keeps evergreen and palm forms green.

The other broadleaf silhouettes were studied from the
[3D World deciduous tree](https://www.mariowiki.com/File:SM3DW_Asset_Model_Tree_(Deciduous).png)
and [3D Land layered tree](https://www.mariowiki.com/File:SM3DL_Asset_Model_Tree.png).
Their distinct crown profiles survive the SDK's height/width normalization. Round and open
forms each select between the bell and lobed model, so variation also appears within trees
with the same geographic form; tall forms use the leafy tiers. These are original meshes,
not copies of the referenced game assets.
