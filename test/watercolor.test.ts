import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import test from 'node:test';
import {validateStyleMin} from '@maplibre/maplibre-gl-style-spec';
import {
  auditTileflowMapThemeValues,
  createStyle,
  resolveMap,
} from '@tileflow/core';
import {watercolor, watercolorFonts, watercolorIcons} from '../src';

test('Watercolor compiles independently as one top-down appearance with a globe and no scene resources', async () => {
  const resolved = resolveMap(watercolor);
  assert.ok(Object.isFrozen(watercolor));
  assert.equal('extends' in watercolor, false);
  assert.deepEqual(resolved.fonts, [watercolorFonts]);
  assert.deepEqual(resolved.icons, [watercolorIcons]);
  assert.deepEqual(Object.keys(resolved.themes), ['watercolor']);
  assert.equal(resolved.timeOfDay, undefined);
  assert.deepEqual(auditTileflowMapThemeValues(resolved), []);

  const files = await readdir(
    new URL('../maps/watercolor/assets/icons/', import.meta.url),
  );
  const ids = files.map((file) =>
    file.replace(/(?:\.pattern)?\.(?:svg|png)$/u, ''),
  );
  const style = createStyle(watercolor, {
    preparedAssets: {icons: {ids, sprite: '/watercolor/sprite'}},
  });
  assert.deepEqual(validateStyleMin(style as never), []);
  assert.deepEqual(style.projection, {type: 'globe'});
  assert.equal(style.sky, undefined);
  assert.equal(style.terrain, undefined);
  for (const key of [
    'buildings',
    'vegetation',
    'vegetation-display',
    'atmosphere',
    'street-lights',
  ])
    assert.equal(style.metadata?.[`tileflow:${key}`], undefined, key);
  assert.deepEqual(style.metadata?.['tileflow:camera'], {
    version: 1,
    adaptivePerspective: false,
    pitchLimit: {maxZoom: 24, maxPitch: 0},
  });
  assert.ok(!style.layers.some((layer) => layer.type === 'fill-extrusion'));
  assert.ok(
    style.layers.some(
      (layer) => layer.type === 'fill' && layer['source-layer'] === 'building',
    ),
  );
  assert.ok(
    style.layers.some(
      (layer) =>
        layer.type === 'symbol' && layer['source-layer'] === 'poi_label',
    ),
  );
});
