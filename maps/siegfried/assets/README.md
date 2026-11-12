# Siegfried assets

This directory contains original Tileflow vector patterns and locally packaged fonts for the
official `siegfried` map. The visual system is informed by swisstopo's public history, examples,
and 1873 and 1947 legends for the Siegfried Map, but no historical scan, legend artwork, or swisstopo data is
included or redistributed. `siegfried` is an official Tileflow map; it is not affiliated with or
endorsed by swisstopo.

Nine motifs were drawn specifically for Tileflow. Each has a light source and an independently
calibrated dark source, for 18 SVG files in one deterministic sprite atlas. The light runtime IDs
are:

- `siegfried-forest`
- `siegfried-glacier`
- `siegfried-gravel`
- `siegfried-orchard`
- `siegfried-paper-grain`
- `siegfried-rock`
- `siegfried-scree`
- `siegfried-water-lines`
- `siegfried-wetland`

The dark variants use the parallel IDs `siegfried-dark-forest`, `siegfried-dark-glacier`,
`siegfried-dark-gravel`, `siegfried-dark-orchard`, `siegfried-dark-paper-grain`,
`siegfried-dark-rock`, `siegfried-dark-scree`, `siegfried-dark-water-lines`, and
`siegfried-dark-wetland`. They preserve the same semantic motifs and geometry but use reduced
internal opacity against charcoal paper. This dark treatment is an original nocturnal
engraver's-proof interpretation; it is not presented as a historical Siegfried printing.

Nineteen original `siegfried-poi-*.svg` pictograms cover landmarks, churches, other places of
worship, museums, stations, transport stops, ferries, lodging, refuges, ruins, viewpoints, medical care, education, public
services, food, shops, parks, water and sport. `icons/tileflow.icons.json` declares them as SDF
artwork so the same silhouette uses each theme's ink. They interpret historical engraving with
modern categories, rather than reproducing swisstopo's conventional signs. Like the patterns,
this Tileflow artwork is Apache-2.0. The SVGs retain the transparent padding required by the SDK.

The `fonts/` directory packages Cormorant Garamond SemiBold for large lettering and three
small-text optical faces derived from Source Serif for functional labels. Their pinned revisions,
compatible derivative names, input hashes and reproducible preparation are documented in
[fonts/README.md](fonts/README.md). Both complete SIL Open Font License 1.1 notices are included
in `fonts/LICENSE.txt` and in separate source-specific license files.

References:

- <https://www.swisstopo.admin.ch/en/siegfried-map>
- <https://www.swisstopo.admin.ch/dam/en/sd-web/4OmbRYHBFpcd/Zeichenerklaerung-Siegfriedkarte-EN.pdf>
- <https://www.swisstopo.admin.ch/dam/en/sd-web/yuIzlsThEgLP/signs%20siegfried%20map%201947-EN.pdf>
- <https://github.com/CatharsisFonts/Cormorant/tree/cc1bfb51ce6568cb3abf9199ab718d543f6fa189>
- <https://github.com/adobe-fonts/source-serif/tree/80d3f8894c09c937bebfa9011247d2e1c79fd6f4>
