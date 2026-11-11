# Asset and preview notices

## Tileflow source and artwork

Cyberpunk, Terminal, and Super Tile World were extracted from the corresponding map definitions and original
Tileflow icon/pattern artwork in `@tileflow/maps`. Their source and artwork retain Apache-2.0.
See [NOTICE](NOTICE) for origin and modifications. No geographic tile archive is included.

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
the development SDK containing procedural building surfaces: center −3.6914, 40.4178,
zoom 16.6, pitch 48° and bearing −18°. It shows the original rounded tree geometry,
brick joints, painted building cornices, soft lawn bands and cream shores rendered through the SDK 3D scene with
Tileflow World data. This is a renderer capture, not an AI-generated illustration.
Visible map attribution is retained.

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

## 1777 cabinet atlas reference

The `map1777` map and its eleven SVG material patterns (each in four palettes) are
original Tileflow code and artwork. Their visual reference is the eighteenth-century cabinet
atlas held by KBR, particularly its watercolor washes, field strokes, tree marks, red
footprints and serif lettering:

- [Cabinet atlas detail published by KBR](https://www.kbr.be/wp-content/uploads/2026/05/detail-van-de-kabinetskaart.png)

No historical scan, source pixel or atlas geospatial data is included. The map uses current
Tileflow World data and the separately licensed Cormorant Garamond fonts documented below.
This package does not redistribute third-party atlas assets, code, style files or textures.


## Baedeker map references and terrain data

The `baedeker` map and its eight SVG patterns are original Tileflow code and artwork. Their visual
grammar was informed by late-nineteenth- and early-twentieth-century Baedeker travel maps and town
plans engraved by Wagner & Debes.

- Baedeker / Karl Wagner & Debes collection:
  <https://www.antiquemapsandprints.com/collections/baedeker-karl-wagner-debes?srsltid=AfmBOoqG_2Q_Zje0wPPVYjShDjDZe5aIgH_h08XcPkpu7zFaPvF6n5hq>
- Maps by Karl Baedeker of Italy:
  <https://commons.wikimedia.org/wiki/Category:Maps_by_Karl_Baedeker_of_Italy>
- Moscow I, Wagner & Debes, 1914:
  <https://imperiia.omeka.fas.harvard.edu/document/2461>
- Amiens, Baedeker, 1908:
  <https://commons.wikimedia.org/wiki/File:Amiens_%E2%80%94_Plan_extrait_du_guide_B%C3%A6deker_%E2%80%9CNord-Ouest_de_la_France%E2%80%9E_1908.jpg>
- Berlin-Westend, Baedeker, 1914:
  <https://commons.wikimedia.org/wiki/File:Baedeker,_Plan_von_Westend,_1914.jpg>

This package does not include or redistribute a historical scan, raster pixel, historical
typeface, legend artwork, geospatial data, or source map from either reference. The package
contains Tileflow-authored style code and original patterns plus the separately licensed Cormorant
Garamond files documented below. `baedeker` is an official Tileflow map; it is not affiliated with
or endorsed by Baedeker or Wagner & Debes.

At runtime, Baedeker derives contour vectors in the browser from Tileflow Terrain tiles, which
carry Mapterhorn terrain data. No terrain tile is packaged or redistributed by `@tileflow/maps`. Mapterhorn publishes the full
catalog of its constituent open terrain sources and their individual attribution and license terms
at <https://mapterhorn.com/attribution/>. The compiled Style carries that link as source
attribution.


## Blueprint artwork and terrain data

The Blueprint map (ID `blueprint`) and its four SVG patterns and one SVG technical symbol are original Tileflow
code and artwork. Its architectural-blueprint direction uses general drafting conventions; this
package does not include or redistribute an architectural drawing, CAD file, municipal plan,
survey sheet, font, source image, or third-party symbol artwork.

At runtime, Blueprint derives contour vectors in the browser from Tileflow Terrain tiles, which
carry Mapterhorn terrain data. No terrain tile is packaged or redistributed by `@tileflow/maps`. Mapterhorn publishes the full
catalog of its constituent open terrain sources and their individual attribution and license terms
at <https://mapterhorn.com/attribution/>. The compiled Style carries that link as source
attribution.


## Siegfried Map reference and terrain data

The `siegfried` map and its nine light/dark SVG motif pairs are original Tileflow code and artwork informed by
swisstopo's history, published examples, and 1873 conventional signs for the Siegfried Map. This
package does not include or redistribute swisstopo scans, raster pixels, legend artwork, fonts,
historical geospatial data, or map data. swisstopo is the source of the historical visual reference,
not of any packaged asset bytes. `siegfried` is an official Tileflow map; it is not affiliated with
or endorsed by swisstopo. Its dark theme is an original nocturnal engraver's-proof interpretation,
not a reproduced or historically documented swisstopo colourway.

- Historical reference: <https://www.swisstopo.admin.ch/en/siegfried-map>
- 1873 conventional signs: <https://www.swisstopo.admin.ch/dam/en/sd-web/4OmbRYHBFpcd/Zeichenerklaerung-Siegfriedkarte-EN.pdf>

At runtime, Siegfried derives contour vectors in the browser from Tileflow Terrain tiles, which
carry Mapterhorn terrain data. No terrain tile is packaged or redistributed by `@tileflow/maps`. Mapterhorn publishes the full
catalog of its constituent open terrain sources and their individual attribution and license terms
at <https://mapterhorn.com/attribution/>. The compiled Style carries that link as source
attribution.


## Cormorant Garamond

Baedeker, 1777 and Siegfried each include their own unmodified Cormorant Garamond Regular,
SemiBold and Italic font files under `maps/baedeker/assets/fonts/`, `maps/map-1777/assets/fonts/` and
`maps/siegfried/assets/fonts/`, respectively. These copies are pinned to upstream revision `cc1bfb51ce6568cb3abf9199ab718d543f6fa189`. Cormorant is
copyright 2015 the Cormorant Project Authors and is distributed under the SIL Open Font License
1.1 included beside each map's font files as `LICENSE.txt`.
