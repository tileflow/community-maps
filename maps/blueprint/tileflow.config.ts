import {defineMap} from '@tileflow/core';
import {blueprint} from './index';

const terrain = blueprint.terrain;
export default defineMap({
  id: 'blueprint',
  version: 1,
  extends: blueprint,
  ...(terrain && typeof terrain === 'object' ? {terrain: {
    ...terrain, url: 'https://tiles.mapterhorn.com/tilejson.json', tileSize: 512, maxZoom: 12,
    contours: {...terrain.contours, demUrl: 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'},
  }} : {}),
});
