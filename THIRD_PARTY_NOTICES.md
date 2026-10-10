# Asset and preview notices

## Tileflow source and artwork

Cyberpunk, Terminal, and Super Tile World were extracted from the corresponding map definitions and original
Tileflow icon/pattern artwork in `@tileflow/maps`. Their source and artwork retain Apache-2.0.
See [NOTICE](NOTICE) for origin and modifications. No geographic tile archive is included.

## Oxanium

Cyberpunk and Terminal include the unmodified Oxanium Medium and SemiBold TTFs, copyright 2019 The Oxanium
Project Authors, under the SIL Open Font License 1.1. Each font directory includes the complete
`LICENSE.txt`, upstream revision, and file hashes:

- [Cyberpunk fonts](maps/cyberpunk/assets/fonts/README.md)
- [Terminal fonts](maps/terminal/assets/fonts/README.md)

Upstream: <https://github.com/sevmeyer/oxanium>, revision
`a8f39e0c71186190027a093e9001459410192d1e`.

## Preview images and map data

The three `preview.webp` images are existing Tileflow captures of the original designs, relabeled
for this collection. They show Madrid and illustrate the appearance; they are not newly generated
captures of the current Tileflow World service. The map artwork retains Apache-2.0; the underlying
OpenStreetMap data is © OpenStreetMap contributors, available under the Open Database License.

Preserve visible attribution to [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
when displaying these previews. Runtime maps must preserve the attribution of their selected
geographic data and other services.

## Super Tile World artwork and fonts

The `superTileWorld` map, sixteen SVG sprites, and seven SVG patterns are original Tileflow code
and artwork. Its pixel-art overworld takes visual inspiration from _Super Mario World_. This
package includes no extracted game sprites, Nintendo logo, source map, or downloaded icon artwork.
Super Mario World is a Nintendo trademark; this independent showcase has no affiliation with or
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
