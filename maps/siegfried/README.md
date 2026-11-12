# Siegfried

An Alpine atlas with engraved roads, blue shore shading, readable serif labels and monochrome
landmark symbols, with coordinated light and dark themes.

## Preview and extend

From the repository root, run `npm ci` and `npm run preview:siegfried`.
Edit `tileflow.config.ts` for the camera and scenes, `index.ts` for the design, and `assets/` for artwork.

```ts
import {defineMap} from '@tileflow/core';
import {siegfried} from '@tileflow/community-maps';

export default defineMap({
  id: 'my-siegfried',
  version: 1,
  extends: siegfried,
  view: {center: [-3.7038, 40.4168], zoom: 14},
});
```

The shared export is immutable; extend it instead of mutating it.
Validate with `npx tileflow validate --config maps/siegfried/tileflow.config.ts`.

## Cartographic choices

Large regional names use Cormorant Garamond. Streets, small settlements, water names and POIs use
the small-text optical cut of Source Serif, packaged under the compatible name **Siegfried Text**.
Child maps that explicitly referenced the former Cormorant Regular or Italic face should use
Siegfried Text Regular or Italic, or supply their own font provider.
Town, village and neighborhood names persist into their intended detail zooms. Labels use local
names and collision placement; POI symbols and their names are placed together in rank order.
The 19 original SDF pictograms take the theme's key ink, with a paper halo over dark buildings.
Landmarks, stations and parks receive more space than everyday amenities; additional ranks enter
at z16 and z17.5. These modern categories interpret the historical visual language.

Roads have a paper interior with fine ink borders, including a visible interior for small streets.
Buildings fade in from z15, the earliest level supported by the current World building renderer.
At smaller scales, a faint wash follows actual residential landuse. Dark buildings use less ink
coverage so their footprints do not overwhelm names.

Water uses a light blue wash and fine horizontal engraving. Three soft, inset bands shade lake
and ocean shores. This is a screen-space shoreline treatment, not bathymetric depth. Rivers and
intermittent water avoid those bands. Shore geometry, including internal edges in the source,
comes from World; a style cannot repair a source polygon or deduplicate source POIs.

Rock and glacier patterns are fine repeated textures, not terrain-oriented hachures. Contours
retain an Alpine 30 m interval at detail zooms. For a lowland sheet inspired by the historical
10 m series, override `terrain.contours.thresholds` with an appropriate local cadence.
The bundled fonts cover Latin, Greek and Cyrillic; they are not a complete worldwide script set.

## Visual checks

The example config includes eight reproducible scenes covering regional names, lake shores,
urban detail, mobile DPR 2, dark mode, Lucerne, the Matterhorn and Madrid. Capture all with:

```sh
npx tileflow capture --config maps/siegfried/tileflow.config.ts --all --out-dir .tileflow/siegfried-captures
```

## Source and attribution

Originally moved from `@tileflow/maps`; the map ID and light/dark theme names are preserved.
The code and original Tileflow artwork retain Apache-2.0. Fonts retain the licenses shipped beside
them. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright),
OpenMapTiles and Tileflow. See [complete asset notices](../../THIRD_PARTY_NOTICES.md).

The local preview uses public [Mapterhorn elevation](https://mapterhorn.com/attribution/).
The exported design keeps its configurable Tileflow Terrain default. Geographic tiles are requested
at runtime and are not bundled.
