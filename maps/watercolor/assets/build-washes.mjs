import {mkdir, rm, writeFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';

// Original seamless pigment and paper textures, generated without external assets or libraries.
// Periodic, warped noise supplies soft washes; narrower deposits and grain suggest drying paint.
const directory = new URL('./icons/', import.meta.url);
await mkdir(directory, {recursive: true});
const size = 256;
let seed = 0;
const random = () => {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const palettes = {
  paper: ['#FBF7EF', '#E0D9CC', '#FFFDF9', '#EAE0CD'],
  water: ['#83C6CF', '#4E87AB', '#C0E3D7', '#73B3BB'],
  green: ['#A5BF78', '#6D9567', '#D5DC9E', '#91B06F'],
  urban: ['#EAD1BD', '#C3ABB8', '#F8E5CA', '#DDAE97'],
  building: ['#BAAFC6', '#8C85A7', '#DFD2D5', '#B9A0B6'],
  gold: ['#E8D18E', '#C1AD72', '#F9E6B6', '#C8C082'],
};
const clamp = (value) => Math.max(0, Math.min(1, value));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * clamp(t));
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function noise(period) {
  const grid = Array.from({length: period * period}, random);
  return (x, y) => {
    const gx = x * period,
      gy = y * period;
    const ix = Math.floor(gx),
      iy = Math.floor(gy);
    const sx = gx - ix,
      sy = gy - iy;
    const tx = sx * sx * (3 - 2 * sx),
      ty = sy * sy * (3 - 2 * sy);
    const at = (a, b) =>
      grid[
        (((b % period) + period) % period) * period +
          (((a % period) + period) % period)
      ];
    return (
      (at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty) +
      (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty
    );
  };
}
const crcTable = Array.from({length: 256}, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++)
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const value of body) crc = crcTable[(crc ^ value) & 255] ^ (crc >>> 8);
  const length = Buffer.alloc(4),
    checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, body, checksum]);
}
function png(pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
for (const [index, [name, pigments]] of Object.entries(palettes).entries()) {
  seed = 42017 + index * 7349;
  const [base, dark, pale, second] = pigments.map(rgb);
  const fields = [3, 5, 9, 18, 40, 96].map(noise);
  const pixels = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const u = x / size,
        v = y / size;
      const wx = u + (fields[0](u, v) - 0.5) * 0.18;
      const wy = v + (fields[1](u, v) - 0.5) * 0.18;
      const wash =
        fields[1](wx, wy) * 0.54 +
        fields[2](wx, wy) * 0.3 +
        fields[3](wx, wy) * 0.16;
      const pool = fields[2](wx + 0.31, wy + 0.42);
      const granulation = fields[4](u, v) * 0.6 + fields[5](u, v) * 0.4;
      const rim = Math.exp(-Math.pow((wash - 0.5) / 0.024, 2));
      let color = mix(
        base,
        wash > 0.5 ? dark : pale,
        Math.abs(wash - 0.5) * 2.7,
      );
      color = mix(color, second, clamp((pool - 0.3) * 0.48));
      color = mix(color, dark, rim * 0.07 + clamp((granulation - 0.5) * 0.22));
      const grain = (random() - 0.5) * 13 + (granulation - 0.5) * 9;
      if (name === 'paper') color = mix(base, color, 0.16);
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      for (let channel = 0; channel < 3; channel++)
        pixels[offset + channel] = Math.max(
          0,
          Math.min(
            255,
            Math.round(color[channel] + grain * (name === 'paper' ? 0.3 : 1)),
          ),
        );
    }
  await writeFile(
    new URL(`watercolor-${name}.pattern.png`, directory),
    png(pixels),
  );
  await rm(new URL(`watercolor-${name}.pattern.svg`, directory), {force: true});
}
