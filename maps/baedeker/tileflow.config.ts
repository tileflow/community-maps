import {defineMap} from '@tileflow/core';
import {baedeker} from './index';

const terrain = baedeker.terrain;
export default defineMap({
  id: 'baedeker',
  version: 1,
  extends: baedeker,
  ...(terrain && typeof terrain === 'object' ? {terrain: {
    ...terrain, url: 'https://tiles.mapterhorn.com/tilejson.json', tileSize: 512, maxZoom: 12,
    contours: {...terrain.contours, demUrl: 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'},
  }} : {}),
});
