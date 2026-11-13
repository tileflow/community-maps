import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {createStyle, resolveMap} from '@tileflow/core';
import {validateStyleMin} from '@maplibre/maplibre-gl-style-spec';
import {createTileflowBuildArtifacts, disposeTileflowBuildArtifacts} from '@tileflow/dev/artifacts';
import {sanborn} from '../src';

test('Sanborn is an independent flat map with one portable appearance', () => {
  const resolved = resolveMap(sanborn);
  assert.equal('extends' in sanborn, false);
  assert.equal(Object.isFrozen(sanborn), true);
  assert.deepEqual(Object.keys(resolved.themes), ['paper']);
  assert.equal(resolved.defaultTheme, 'paper');
  assert.deepEqual(resolved.timeOfDay, {});
  assert.equal(resolved.terrain, undefined);
  assert.equal(resolved.modules?.buildings?.mode, 'flat');
  assert.equal(resolved.camera?.pitchLimit?.maxPitch, 0);
  const style = createStyle(sanborn, {
    preparedAssets: {icons: {ids: ['sanborn-park'], sprite: '/sanborn/sprite'}},
  });
  assert.deepEqual(validateStyleMin(style as never), []);
  assert.equal(
    style.layers.some((layer) => layer.type === 'fill-extrusion'),
    false,
  );
  assert.equal(
    Object.values(style.sources).some((source) => source.type === 'raster-dem'),
    false,
  );
});

test('Sanborn prepares its own fonts, licence and original artwork', async () => {
  const artifacts = await createTileflowBuildArtifacts({
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    config: 'maps/sanborn/tileflow.config.ts',
    assetBaseUrl: '/sanborn',
    styleBaseUrl: '/sanborn',
  });
  try {
    assert.deepEqual(Object.keys(artifacts.styles), ['sanborn']);
    assert.deepEqual(Object.keys(artifacts.styles.sanborn!), ['paper']);
    const fonts = artifacts.assets.filter((asset) => asset.fileName.endsWith('.ttf'));
    assert.equal(fonts.length, 3);
    assert.ok(fonts.every((asset) => asset.fileName.startsWith('fonts/sanborn-text-')));
    assert.ok(artifacts.assets.some((asset) => asset.fileName.startsWith('fonts/licenses/')));
    assert.ok(artifacts.assets.some((asset) => asset.fileName.endsWith('sprite.png')));
    assert.doesNotMatch(JSON.stringify(artifacts.manifest), /\/Users\/|node_modules/);
  } finally {
    await disposeTileflowBuildArtifacts(artifacts);
  }
});
