import {defineMap} from '@tileflow/core';
import {siegfried} from './index';

const terrain = siegfried.terrain;
export default defineMap({
  id: 'siegfried',
  version: 1,
  extends: siegfried,
  scenes: {
    'zurich-overview': {
      theme: 'light',
      camera: {type: 'center', center: [8.543, 47.368], zoom: 11},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    'zurich-shore': {
      theme: 'light',
      camera: {type: 'center', center: [8.543, 47.368], zoom: 14},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    'zurich-detail': {
      theme: 'light',
      camera: {type: 'center', center: [8.543, 47.368], zoom: 16},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    'zurich-mobile': {
      theme: 'light',
      camera: {type: 'center', center: [8.543, 47.368], zoom: 15},
      viewport: {width: 390, height: 844, dpr: 2},
    },
    'zurich-dark': {
      theme: 'dark',
      camera: {type: 'center', center: [8.543, 47.368], zoom: 16},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    lucerne: {
      theme: 'light',
      camera: {type: 'center', center: [8.311, 47.044], zoom: 12.5},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    matterhorn: {
      theme: 'light',
      camera: {type: 'center', center: [7.6586, 45.9763], zoom: 13.25},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    madrid: {
      theme: 'light',
      camera: {type: 'center', center: [-3.7038, 40.4168], zoom: 15},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
  },
  ...(terrain && typeof terrain === 'object' ? {terrain: {
    ...terrain, url: 'https://tiles.mapterhorn.com/tilejson.json', tileSize: 512, maxZoom: 12,
    contours: {...terrain.contours, demUrl: 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'},
  }} : {}),
});
