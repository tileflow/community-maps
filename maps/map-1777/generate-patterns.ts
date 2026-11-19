import {readdir, readFile, writeFile} from 'node:fs/promises';
import {map1777Pigment} from './map-1777-pigments';

// Run from this checkout: npx tsx maps/map-1777/generate-patterns.ts
const directory = new URL('./assets/icons/', import.meta.url);
const originals = (await readdir(directory)).filter(
  (file) => file.endsWith('.svg') && !/^map-1777-(dawn|dusk|night)-/.test(file),
);
for (const file of originals) {
  const svg = await readFile(new URL(file, directory), 'utf8');
  for (const moment of ['dawn', 'dusk', 'night'] as const) {
    const variant = svg.replace(/#[\da-f]{6}/gi, (color) => map1777Pigment(color, moment));
    await writeFile(new URL(file.replace('map-1777-', `map-1777-${moment}-`), directory), variant);
  }
}
