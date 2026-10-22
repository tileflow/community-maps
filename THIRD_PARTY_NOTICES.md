# Asset and preview notices

## Tileflow source and artwork

Cyberpunk, Terminal, and Super Tile World were extracted from the corresponding map definitions and original
Tileflow icon/pattern artwork in `@tileflow/maps`. Their source and artwork retain Apache-2.0.
See [NOTICE](NOTICE) for origin and modifications. No geographic tile archive is included.

## Wildlands

Wildlands is a new standalone Tileflow map with original SVG symbols, individual tree drawings,
and a paper pattern, inspired by user-supplied Breath of the Wild map references. No Nintendo artwork,
Mapbox style, or reference screenshot is included. Code and artwork follow Apache-2.0.
Its new Sanabria preview uses Tileflow World/OpenStreetMap and Mapterhorn elevation;
see [Wildlands credits](maps/wildlands/README.md). Wildlands packages the unmodified Hylia Serif
Beta v0.009 font by Omni Jacala (Artsy Omni) and Noto Sans Regular. Hylia Serif is a fan
approximation of BOTW lettering and retains its author's conditions, including no redistribution
for profit; it is not Apache-2.0 or SIL OFL. Noto Sans is SIL OFL 1.1. See
[font provenance and notices](maps/wildlands/assets/fonts/README.md).

## Oxanium fonts

Cyberpunk and Terminal include the unmodified Oxanium Medium and SemiBold TTFs, copyright 2019 The Oxanium
Project Authors, under the SIL Open Font License 1.1. Each font directory includes the complete
`LICENSE.txt`, upstream revision, and file hashes:

- [Cyberpunk fonts](maps/cyberpunk/assets/fonts/README.md)
- [Terminal fonts](maps/terminal/assets/fonts/README.md)

Upstream: <https://github.com/sevmeyer/oxanium>, revision
`a8f39e0c71186190027a093e9001459410192d1e`.

## Preview images and map data

The Terminal `preview.webp` image is an existing Tileflow capture of the original design,
relabeled for this collection. It shows Madrid and is not a newly generated capture of the
current Tileflow World service.

The Super Tile World preview was captured on 2026-10-22 from its Madrid scene with
Core alpha.38 and Dev alpha.35: center −3.6914, 40.4178, zoom 16.6, pitch 48° and bearing −18°.
It shows the original rounded tree geometry and buildings rendered through the SDK 3D scene
with Tileflow World data. Visible map attribution is retained.

The Cyberpunk preview is a new capture of its `gran-via` scene, rendered on 2026-10-18 with Tileflow
World data at zoom 16.5, bearing 0 and pitch 0, with the static flat-tree fallback. Its blue-grey crossing sprite is an adaptation of
Tileflow's original Streets crosswalk artwork. Its category sign pictograms are original Tileflow
SVG drawings; no reference-game artwork was copied. The map artwork retains Apache-2.0; the underlying
OpenStreetMap data is © OpenStreetMap contributors, available under the Open Database License.

Preserve visible attribution to [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
when displaying these previews. Runtime maps must preserve the attribution of their selected
geographic data and other services.

## Super Tile World artwork and fonts

The `superTileWorld` map, sixteen SVG sprites, seven SVG patterns and six original 3D tree forms
(with matching far models) are original Tileflow code and artwork. Its icons take visual
inspiration from _Super Mario World_; its rounded toy-world volumes are inspired by
_Super Mario 3D World_. This
package includes no extracted game sprites, Nintendo logo, source map, or downloaded icon artwork.
Super Mario World and Super Mario 3D World are Nintendo trademarks; this independent showcase has no affiliation with or
endorsement from Nintendo. The asset research references are recorded in
`maps/super-tile-world/assets/README.md`.

Super Tile World packages three unmodified static upstream font files and one renamed derivative in its own
`maps/super-tile-world/assets/fonts/` directory:

- `PixelifySans-Regular.ttf` and `PixelifySans-SemiBold.ttf` are from the official
  [Pixelify Sans project](https://github.com/eifetx/Pixelify-Sans/tree/39df74aba80df8157546034b878e8be1eb565ced),
  pinned to revision `39df74aba80df8157546034b878e8be1eb565ced`. Its complete SIL Open Font
  License 1.1 notice is preserved as `LICENSE-PixelifySans.txt`.
- `TileWorldArcade-Regular.ttf` is a name-table-only derivative of `PressStart2P-Regular.ttf`
  from the official Google Fonts
  [Press Start 2P directory](https://github.com/google/fonts/tree/e06fe11c39051bddaef73ec338a9d1c8175723f1/ofl/pressstart2p),
  pinned to revision `e06fe11c39051bddaef73ec338a9d1c8175723f1`. The derivative is named
  “Tile World Arcade” to satisfy the upstream reserved-font-name requirement and to give browser
  canvas rendering a compatible family name. Glyph outlines, metrics, and character mappings
  remain unchanged. Its complete SIL Open Font License 1.1 notice, including the upstream
  reserved font name, is preserved as `LICENSE-PressStart2P.txt`.
- `NotoSans-Regular.ttf` is from the official Noto
  [static hinted Noto Sans directory](https://github.com/notofonts/noto-fonts/tree/c971829a87e7920f960e7277c3dafd9bedd3c601/hinted/ttf/NotoSans),
  pinned to revision `c971829a87e7920f960e7277c3dafd9bedd3c601`. Its complete SIL Open Font
  License 1.1 notice is preserved as `LICENSE-NotoSans.txt`.

`LICENSE.txt` combines all three complete font-family notices and licenses for the generic local
font preparation pipeline. The adjacent `fonts/README.md` records the pinned source files,
verified OpenType full names, and the derivative's exact name-table changes. No font is subsetted;
Pixelify Sans and Noto Sans remain unmodified upstream files.
