# Wildlands · Atlas de aventura

An independent adventure atlas inspired by the olive parchment, engraved terrain,
blue-gray lakes, pale paths and exploration markers in the supplied *Breath of the Wild*
map screenshots. Authored from a blank Tileflow definition for this comparison; no
Mapbox style JSON, layers, or settings are imported, and no existing Tileflow map is extended.

The original SVG artwork consists of three individual tree drawings, subtle paper marks,
and seven redrawn exploration symbols: a shrine, cooking pot, leaf mask, tunic,
camp and Triforce-style landmarks. **Each tree drawing is anchored to a Point feature in
Tileflow World's `tree` layer.** Woodland polygons receive a quiet olive fill; they never
generate tree locations or repeat a canopy pattern. Tree rows stored as lines are excluded
from this point-only illustration, and canopy sampling is not presented as individual trees.
Needleleaved trees use the pine drawing when the data identifies them. Other points use
one of two broadleaf drawings, chosen consistently by feature ID. Crown diameter scales the
drawing when supplied; missing measurements use a 6 m visual default. This does not claim
a measured species or size where the source has none.
POIs retain their real locations and categories: campgrounds, lodging, viewpoints, monuments
and food. Mapterhorn elevation supplies hillshade and contour lines.
POIs use the sparsest canonical density tier (`filter_rank <= 1`), compact 17–24 px pins
and 9.5–10.5 px labels. Landmarks appear first; parks begin at zoom 15, lodging/religion/
visitor amenities at 17, and food/sport at 18. Icon and name must fit together, with extra
collision spacing, so reducing their size does not simply admit more markers.
Roads have a brown casing wider than the pale stroke at every zoom, including bridges
and a subdued tunnel treatment. Real street names follow their roads in a compact,
legible face with brown halos. Lakes and ponds have a brown outer bank and a slate rim.
Hillshade, contours and elevation labels stop at zoom 14, exactly when building fills and
outlines begin. Both use a shared zoom boundary so terrain cannot overlap building detail.
The pinned semantic terrain API supports fixed zoom bounds; this is a zoom cutoff, not a fade.

```sh
npm run preview:wildlands
npm run build:wildlands
npx tileflow capture sanabria --config maps/wildlands/tileflow.config.ts
npx tileflow capture village --config maps/wildlands/tileflow.config.ts
npx tileflow capture trees --config maps/wildlands/tileflow.config.ts
npx tileflow capture streets --config maps/wildlands/tileflow.config.ts
```

The default view is Lake Sanabria, Spain, zoom 14.1. `overview` is a zoom-13.35 scene of
the same area; this Tileflow World release supplies the local POIs from zoom 14.
`village` is a close-up scene for checking paths, symbols and building detail without terrain.
`trees` shows individually mapped trees in Salamanca at zoom 17.4.
`streets` checks road casings, street names and the water outline near Madrid's Neptune fountain.
All five scenes use 1440 × 900 pixels. Geographic coverage continues beyond these scenes.

During interactive QA with the pinned preview runtime, revisiting contour tiles after zooming
occasionally logged `DataCloneError: ArrayBuffer ... is already detached`. Fresh scene captures
rendered successfully. The installed contour protocol returns the upstream cached buffer for
worker transfer; buffer reuse is a likely cause. This runtime issue is separate from the map's
semantic definition and has not been patched in this contribution. Reload to restore a fresh
preview if contour tiles stop appearing.

The pinned preview's generic `TREES` button only controls its native circle/3D layer;
it does not toggle semantic symbol render passes. These 2D illustrations remain visible.
The native circles are transparent so the preview cannot re-enable a second tree drawing.

Edit `index.ts` for the design, `assets/icons/` for the original illustrations, or
`tileflow.config.ts` for an application-specific extension. The public exports are
`wildlands`, `wildlandsIcons` and `wildlandsFonts`. Hylia Serif Beta by Artsy Omni supplies
the BOTW-inspired display lettering, with Noto Sans for missing characters and contour
measurements. Both fonts are local assets; see [font provenance and conditions](assets/fonts/README.md).
No geographic tiles are bundled.

Preview data: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright),
[OpenMapTiles](https://openmaptiles.org/), [Tileflow](https://tileflow.dev/copyright).
Elevation: © [Mapterhorn](https://mapterhorn.com/attribution).
The preview is a new render of this map. Preserve these credits when displaying it.

Design and original vector artwork created for Tileflow, October 2026, under the repository's
Apache-2.0 license; fonts retain their separate author conditions. The reference screenshots are not redistributed. This map includes no
extracted Nintendo artwork and is not affiliated with Nintendo.
