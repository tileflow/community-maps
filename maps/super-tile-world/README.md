# Super Tile World

A toy-like 3D overworld with striped bells, rounded and layered trees, sunlit buildings, layered shores, golden routes,
and arcade lettering. Original Tileflow artwork, inspired by playful platform-game worlds.

![Super Tile World in Madrid](preview.webp)

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
Captured from the current 3D example scene; see [preview provenance](../../THIRD_PARTY_NOTICES.md).

From the repository root, run `npm ci`, then `npm run preview:super-tile-world`.
Edit `tileflow.config.ts` for the camera and overrides or `index.ts` for the complete design.
The map uses Tileflow World data and a single `light` theme. All sprites, patterns, and fonts are
packaged under `assets/`; [artwork notes](assets/README.md) and
[font provenance](assets/fonts/README.md) accompany them.

Exports: `superTileWorld`, `superTileWorldFonts`, `superTileWorldIcons`, `superTileWorldModels`.
Map ID: `super-tile-world`. Sprite and pattern IDs use the `stw-` prefix.

This independent showcase is not affiliated with Nintendo. Its complete artwork and font
attribution is in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).

The map requires Core alpha.38 or newer. The example opens an angled Madrid scene;
its models render through Tileflow’s 3D scene. Trees follow the geographic tree data and
remain real geometry at overhead pitch. Renderers without 3D vegetation retain the colored
park and forest ground, without falling back to tree sprites.

See [design notes](design.md) for the map’s visual structure.
