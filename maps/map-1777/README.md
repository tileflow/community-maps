# 1777

An eighteenth-century print vocabulary with four times of day and optional 3D.

## Preview and extend

From the repository root, run `npm ci` and `npm run preview:map-1777`.
Edit `tileflow.config.ts` for the camera and scenes, `index.ts` for the design, and `assets/` for artwork.

```ts
import {defineMap} from '@tileflow/core';
import {map1777} from '@tileflow/community-maps';

export default defineMap({
  id: 'my-map-1777',
  version: 1,
  extends: map1777,
  view: {center: [-3.7038, 40.4168], zoom: 14},
});
```

The shared export is immutable; extend it instead of mutating it.
Validate with `npx tileflow validate --config maps/map-1777/tileflow.config.ts`.

## Source and attribution

Moved from `@tileflow/maps`; the map ID, themes, original artwork and font files are preserved.
The code and original Tileflow artwork retain Apache-2.0. Fonts retain the licenses shipped beside
them. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright),
OpenMapTiles and Tileflow. See [complete asset notices](../../THIRD_PARTY_NOTICES.md).
