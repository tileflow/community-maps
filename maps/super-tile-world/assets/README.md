# Super Tile World artwork

The 23 SVGs in `icons/` are original vector drawings made for the Super Tile World Tileflow
showcase. The original icon reference is the cheerful 16-bit overworld of _Super Mario World_: stepped
silhouettes, indigo contours, spotted mushroom roofs, striped green pipes, gold level nodes,
smiling hills, small castles, and sparse two-tone landscape details. No extracted game sprites,
existing map, Nintendo logo, or downloaded icon artwork is packaged here.

The POI drawings use a shared palette and a 2-pixel construction grid. Most POI artwork occupies
36–42 pixels of a transparent 48 × 48 authoring canvas. Tileflow normalizes ordinary icons to
24 × 24 CSS pixels in its sprite atlas. Use symbol size 1–1.2 for ordinary destinations and
1.3–1.7 for a few major landmarks. Silhouettes remain distinct at small sizes;
they are not all enclosed in interchangeable square badges. `stw-level-node` is the quiet
secondary location symbol. `stw-hill` remains a destination symbol; `stw-tree` is retained for existing consumers but
is no longer drawn as vegetation.

Every SVG is self-contained with explicit intrinsic dimensions. The transparent patterns own
only ground texture marks; the map style owns the base terrain color. Meadow grass and flowers,
and forest-floor leaf marks, remain sparse beneath the real 3D models. Neither pattern depicts
trees or hills. Pattern IDs remove the
`.pattern.svg` suffix:

| Runtime ID     | Intrinsic size | Drawing                                                                           |
| -------------- | -------------- | --------------------------------------------------------------------------------- |
| `stw-grass`    | 256 × 256      | Two broad translucent mown bands and two quiet grass tufts.                       |
| `stw-water`    | 128 × 128      | Two broken, stepped wave glints and two small water pixels.                       |
| `stw-forest`   | 128 × 128      | Two grass tufts and two subtle leaf marks.                      |
| `stw-brick`    | 32 × 32        | Offset warm brick courses with a light top edge.                                  |
| `stw-sand`     | 256 × 128      | Soft warm strata and two small grains, shared by mapped sand and rock.            |
| `stw-meadow`   | 256 × 256      | A lawn band, rounded green patches and two three-flower white/yellow clusters.    |
| `stw-farmland` | 128 × 128      | Two small, staggered three-stem crop groups.                                      |

POI and landscape runtime IDs are `stw-mushroom-house`, `stw-warp-pipe`, `stw-question-block`,
`stw-coin`, `stw-castle`, `stw-star`, `stw-mushroom`, `stw-heart`, `stw-flag`, `stw-tree`,
`stw-hill`, `stw-ghost-house`, `stw-airship`, `stw-book`, `stw-flower`, and `stw-level-node`.

Research references, inspected while developing this independent set:

- [Super Mario World overworld reference](https://www.snesmaps.com/maps/SuperMarioWorld/SMWOverworldMap.html).
- [ATeshGames' Super Mario World Style Tiles](https://opengameart.org/content/super-mario-world-style-tiles),
  a CC0 SVG tileset. Used to study the suitability of vector game tiles; its artwork is not included.
- [Pixelify Sans upstream](https://github.com/eifetx/Pixelify-Sans).
- [Press Start 2P in Google Fonts](https://github.com/google/fonts/tree/main/ofl/pressstart2p).
- [Super Bell Hill](https://mario.wiki.gallery/images/thumb/3/35/NM_SM3DW%2BBF_Super_Bell_Hill.png/1200px-NM_SM3DW%2BBF_Super_Bell_Hill.png),
  [3D World World 1](https://cdn.mos.cms.futurecdn.net/CWjYW2xsxQMqLHD5jDXKi4.jpg) and
  [World 4](https://mario.wiki.gallery/images/thumb/a/a3/SM3DW_4-Map_Luigi.jpg/1200px-SM3DW_4-Map_Luigi.jpg):
  references for broad lawn bands, grouped flowers, pale riverbanks and warm rock strata.
  The patterns here are newly drawn vectors; these screenshots are not included.

The font files under `fonts/` are separately licensed upstream assets. Their exact versions,
OpenType names, source links, and complete licenses are preserved beside them.

The six original [3D tree forms](models/README.md) mix striped bells, lobed crowns and layered
foliage, informed by Super Mario 3D World and 3D Land, alongside conifers, columns and palms.
They share short pale trunks and a soft toy-like finish. Their source is `build-trees.mjs`; all geometry is generated locally
without imported game assets. Near and far silhouettes match. The model colors are authored by
the map theme, with `bark`, `leaves` and `fronds` identifying their paintable parts.
