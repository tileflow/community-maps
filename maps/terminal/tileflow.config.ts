import {defineMap} from '@tileflow/core';
import {terminal} from '../../src/index';

export default defineMap({
  id: 'terminal',
  version: 1,
  extends: terminal,
  scenes: {
    madrid: {
      theme: 'dark',
      camera: {type: 'center', center: [-3.7038, 40.4168], zoom: 14.2},
      viewport: {width: 1280, height: 800, dpr: 1},
    },
  },
});
