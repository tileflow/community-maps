# Super Tile World

A pixel-art overworld with layered shores, golden routes, destination sprites, and arcade lettering.
Designed by Tileflow with original artwork inspired by classic cartridge worlds.

![Super Tile World in Madrid](preview.webp)

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
This existing capture illustrates the original design; see [preview provenance](../../THIRD_PARTY_NOTICES.md).

From the repository root, run `npm ci`, then `npm run preview:super-tile-world`.
Edit `tileflow.config.ts` for the camera and overrides or `index.ts` for the complete design.
The map uses Tileflow World data and a single `light` theme. All sprites, patterns, and fonts are
packaged under `assets/`; [artwork notes](assets/README.md) and
[font provenance](assets/fonts/README.md) accompany them.

Exports: `superTileWorld`, `superTileWorldFonts`, `superTileWorldIcons`.
Map ID: `super-tile-world`. Sprite and pattern IDs use the `stw-` prefix.

This independent showcase is not affiliated with Nintendo. Its complete artwork and font
attribution is in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).

See [design notes](design.md) for the map’s visual structure.
