// Original Super Tile World geometry. glTF Y up, no textures or downloaded models.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const output = new URL("./models/", import.meta.url);
const mesh = (material) => ({
  material,
  positions: [],
  normals: [],
  indices: [],
});
const add = (a, b) => a.map((x, i) => x + b[i]);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function vertex(m, position, normal) {
  const index = m.positions.length / 3,
    length = Math.hypot(...normal);
  m.positions.push(...position);
  m.normals.push(...normal.map((n) => n / length));
  return index;
}
function triangle(m, a, b, c) {
  const p = (i) => m.positions.slice(i * 3, i * 3 + 3);
  const n = cross(sub(p(b), p(a)), sub(p(c), p(a)));
  const normal = [0, 1, 2].map(
    (i) => m.normals[a * 3 + i] + m.normals[b * 3 + i] + m.normals[c * 3 + i],
  );
  assert.ok(Math.hypot(...n) > 1e-9, "No degenerate tree triangles");
  m.indices.push(
    ...(n.reduce((sum, x, i) => sum + x * normal[i], 0) < 0
      ? [a, c, b]
      : [a, b, c]),
  );
}
function crown(m, center, radii, sides, rings) {
  const bottom = vertex(m, add(center, [0, -radii[1], 0]), [0, -1, 0]),
    rows = [];
  for (let j = 1; j < rings; j++) {
    const latitude = -Math.PI / 2 + (Math.PI * j) / rings;
    rows.push(
      Array.from({ length: sides }, (_, i) => {
        const longitude = (2 * Math.PI * i) / sides;
        const p = [
          Math.cos(latitude) * Math.cos(longitude),
          Math.sin(latitude),
          Math.cos(latitude) * Math.sin(longitude),
        ];
        return vertex(
          m,
          add(
            center,
            p.map((x, k) => x * radii[k]),
          ),
          p.map((x, k) => x / radii[k]),
        );
      }),
    );
  }
  const top = vertex(m, add(center, [0, radii[1], 0]), [0, 1, 0]);
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    triangle(m, bottom, rows[0][i], rows[0][next]);
    for (let j = 1; j < rows.length; j++) {
      triangle(m, rows[j - 1][i], rows[j][i], rows[j][next]);
      triangle(m, rows[j - 1][i], rows[j][next], rows[j - 1][next]);
    }
    triangle(m, rows.at(-1)[i], top, rows.at(-1)[next]);
  }
}
function trunk(m, height, radius, sides) {
  const rows = [0, height].map((y, row) =>
    Array.from({ length: sides }, (_, i) => {
      const angle = (2 * Math.PI * i) / sides,
        r = radius * (row ? 0.66 : 1);
      return vertex(
        m,
        [Math.cos(angle) * r, y, Math.sin(angle) * r],
        [Math.cos(angle), (radius * 0.34) / height, Math.sin(angle)],
      );
    }),
  );
  for (let i = 0; i < sides; i++) {
    const n = (i + 1) % sides;
    triangle(m, rows[0][i], rows[1][i], rows[1][n]);
    triangle(m, rows[0][i], rows[1][n], rows[0][n]);
  }
}
function tree(form, far) {
  const bark = mesh("bark"),
    leaves = mesh(form === "palm" ? "fronds" : "leaves");
  const sides = far ? 6 : 10,
    rings = far ? 3 : 6;
  trunk(
    bark,
    form === "palm" ? 0.88 : 0.66,
    form === "palm" ? 0.045 : 0.065,
    far ? 6 : 12,
  );
  if (form === "round" || form === "open") {
    const open = form === "open";
    crown(leaves, [0, 0.72, 0], [open ? 0.28 : 0.3, 0.28, 0.29], sides, rings);
    for (const sign of [-1, 1])
      crown(
        leaves,
        [sign * (open ? 0.26 : 0.19), open ? 0.6 : 0.59, 0.025],
        [open ? 0.25 : 0.2, open ? 0.23 : 0.21, 0.23],
        sides,
        rings,
      );
  } else if (form === "tall" || form === "columnar") {
    crown(
      leaves,
      [0, 0.64, 0],
      [form === "tall" ? 0.25 : 0.15, 0.36, form === "tall" ? 0.24 : 0.15],
      far ? 8 : 12,
      far ? 4 : 8,
    );
  } else if (form === "conifer") {
    // Rounded tiers keep the evergreen silhouette at both levels of detail.
    for (const [y, r, h] of [
      [0.45, 0.3, 0.18],
      [0.64, 0.235, 0.19],
      [0.82, 0.16, 0.18],
    ])
      crown(leaves, [0, y, 0], [r, h, r], sides, rings);
  } else {
    // Broad arched fronds with a central ridge, all actual triangles.
    for (let leaf = 0; leaf < 6; leaf++) {
      const angle = (leaf * Math.PI) / 3,
        radial = [Math.cos(angle), 0, Math.sin(angle)],
        tangent = [-Math.sin(angle), 0, Math.cos(angle)];
      const steps = far ? 2 : 4,
        rows = [];
      for (let step = 0; step <= steps; step++) {
        const t = step / steps,
          length = 0.04 + t * 0.47,
          y = 0.86 + 0.14 * Math.sin(t * Math.PI) - 0.14 * t;
        const width =
          step === 0 || step === steps ? 0.004 : 0.085 * Math.sin(t * Math.PI);
        rows.push(
          [-1, 0, 1].map((side) =>
            vertex(
              leaves,
              [
                radial[0] * length + tangent[0] * width * side,
                y - Math.abs(side) * 0.025,
                radial[2] * length + tangent[2] * width * side,
              ],
              [tangent[0] * side * 0.3, 1, tangent[2] * side * 0.3],
            ),
          ),
        );
      }
      for (let j = 1; j < rows.length; j++)
        for (let k = 0; k < 2; k++) {
          triangle(leaves, rows[j - 1][k], rows[j][k], rows[j][k + 1]);
          triangle(leaves, rows[j - 1][k], rows[j][k + 1], rows[j - 1][k + 1]);
        }
    }
  }
  return [bark, leaves];
}
function glb(parts, name) {
  const blocks = [],
    bufferViews = [],
    accessors = [];
  let offset = 0;
  const accessor = (array, type, componentType, target, bounds = {}) => {
    const bytes = Buffer.from(array.buffer),
      block = Buffer.alloc(Math.ceil(bytes.length / 4) * 4);
    bytes.copy(block);
    blocks.push(block);
    bufferViews.push({
      buffer: 0,
      byteOffset: offset,
      byteLength: bytes.length,
      target,
    });
    offset += block.length;
    accessors.push({
      bufferView: bufferViews.length - 1,
      componentType,
      count: array.length / (type === "VEC3" ? 3 : 1),
      type,
      ...bounds,
    });
    return accessors.length - 1;
  };
  const primitives = parts.map((m, material) => ({
    attributes: {
      POSITION: accessor(new Float32Array(m.positions), "VEC3", 5126, 34962, {
        min: [0, 1, 2].map((axis) =>
          Math.min(...m.positions.filter((_, i) => i % 3 === axis)),
        ),
        max: [0, 1, 2].map((axis) =>
          Math.max(...m.positions.filter((_, i) => i % 3 === axis)),
        ),
      }),
      NORMAL: accessor(new Float32Array(m.normals), "VEC3", 5126, 34962),
    },
    indices: accessor(new Uint16Array(m.indices), "SCALAR", 5123, 34963),
    material,
  }));
  const json = Buffer.from(
    JSON.stringify({
      asset: {
        version: "2.0",
        generator: "Super Tile World original tree artwork",
      },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ name, primitives }],
      materials: parts.map((m) => ({
        name: m.material,
        doubleSided: m.material === "fronds",
        pbrMetallicRoughness: {
          baseColorFactor: [1, 1, 1, 1],
          metallicFactor: 0,
          roughnessFactor: 0.85,
        },
      })),
      accessors,
      bufferViews,
      buffers: [{ byteLength: offset }],
    }),
  );
  const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32);
  json.copy(padded);
  const header = Buffer.alloc(20);
  [
    0x46546c67,
    2,
    28 + padded.length + offset,
    padded.length,
    0x4e4f534a,
  ].forEach((n, i) => header.writeUInt32LE(n, i * 4));
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(offset);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, padded, binaryHeader, ...blocks]);
}
export function buildTrees() {
  return ["round", "open", "tall", "conifer", "columnar", "palm"].flatMap(
    (form) =>
      [false, true].map((far) => {
        const parts = tree(form, far),
          triangles = parts.reduce((sum, m) => sum + m.indices.length / 3, 0);
        assert.ok(triangles <= (far ? 120 : 1000));
        return {
          name: `stw-${form}${far ? ".far" : ""}.glb`,
          bytes: glb(parts, form),
          triangles,
        };
      }),
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await mkdir(output, { recursive: true });
  for (const { name, bytes, triangles } of buildTrees()) {
    const path = new URL(name, output);
    if (process.argv.includes("--check"))
      assert.deepEqual(await readFile(path), bytes, `Regenerate ${name}`);
    else await writeFile(path, bytes);
    console.log(`${name}: ${triangles} triangles, ${bytes.length} bytes`);
  }
}
