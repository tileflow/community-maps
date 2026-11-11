import {defineMap} from '@tileflow/core';
import {siegfried} from './index';

const terrain = siegfried.terrain;
export default defineMap({
  id: 'siegfried',
  version: 1,
  extends: siegfried,
  ...(terrain && typeof terrain === 'object' ? {terrain: {
    ...terrain, url: 'https://tiles.mapterhorn.com/tilejson.json', tileSize: 512, maxZoom: 12,
    contours: {...terrain.contours, demUrl: 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'},
  }} : {}),
});
