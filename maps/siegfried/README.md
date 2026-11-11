# Siegfried

An Alpine atlas with engraved textures, contours and coordinated light and dark themes.

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

## Source and attribution

Moved from `@tileflow/maps`; the map ID, themes, original artwork and font files are preserved.
The code and original Tileflow artwork retain Apache-2.0. Fonts retain the licenses shipped beside
them. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright),
OpenMapTiles and Tileflow. See [complete asset notices](../../THIRD_PARTY_NOTICES.md).

The local preview uses public [Mapterhorn elevation](https://mapterhorn.com/attribution/).
The exported design keeps its configurable Tileflow Terrain default. Geographic tiles are requested
at runtime and are not bundled.
