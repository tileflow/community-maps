// Original Super Tile World geometry. glTF Y up, no textures or downloaded models.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const output = new URL("./models/", import.meta.url);
const mesh = (material) => ({
  material,
  positions: [],
  normals: [],
  shades: [],
  indices: [],
});
const sub = (a, b) => a.map((x, i) => x - b[i]);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function vertex(m, position, normal, shade = 0.8) {
  const index = m.positions.length / 3,
    length = Math.hypot(...normal);
  m.positions.push(...position);
  m.normals.push(...normal.map((n) => n / length));
  m.shades.push(shade);
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
// Lathed crowns keep one uninterrupted silhouette, with broad bands and a flared rim.
// Adjacent bands share positions/normals but retain their own vertex shade at the seam.
function silhouette(
  m,
  profile,
  sides,
  width = 1,
  banded = false,
  far = false,
  lobes = 0,
) {
  const normalAt = (i, angle) => {
    if (profile[i][1] === 0) return [0, i === 0 ? -1 : 1, 0];
    const before = profile[Math.max(0, i - 1)],
      after = profile[Math.min(profile.length - 1, i + 1)];
    const slope =
      ((after[1] - before[1]) * width) / Math.max(0.001, after[0] - before[0]);
    const ripple = lobes ? (far ? 0.05 : 0.09) : 0;
    const phase = angle * lobes + profile[i][0] * 1.4;
    const tangent =
      (-ripple * lobes * Math.sin(phase)) / (1 + ripple * Math.cos(phase));
    return [
      Math.cos(angle) + tangent * Math.sin(angle),
      -slope,
      Math.sin(angle) - tangent * Math.cos(angle),
    ];
  };
  for (let j = 1; j < profile.length; j++) {
    const low = profile[j - 1],
      high = profile[j];
    const shade = banded ? (j % 2 ? 1 : 0.18) : 0.8;
    const rows = [j - 1, j].map((row) =>
      Array.from({ length: sides }, (_, i) => {
        const angle = (2 * Math.PI * i) / sides;
        const [y, radius] = profile[row];
        const scallop = lobes
          ? 1 + (far ? 0.05 : 0.09) * Math.cos(angle * lobes + y * 1.4)
          : far
            ? 1
            : 1 + 0.025 * Math.cos(angle * 5) * Math.max(0, (0.48 - y) / 0.25);
        return vertex(
          m,
          [
            Math.cos(angle) * radius * width * scallop,
            y,
            Math.sin(angle) * radius * width * scallop,
          ],
          normalAt(row, angle),
          shade,
        );
      }),
    );
    for (let i = 0; i < sides; i++) {
      const next = (i + 1) % sides;
      if (low[1] > 0) triangle(m, rows[0][i], rows[0][next], rows[1][next]);
      if (high[1] > 0) triangle(m, rows[0][i], rows[1][next], rows[1][i]);
    }
  }
}

function tree(form, far) {
  const bark = mesh("bark"),
    leaves = mesh(form === "palm" ? "fronds" : "leaves");
  if (form === "palm") trunk(bark, 0.88, 0.055, far ? 6 : 12);
  else
    silhouette(
      bark,
      [
        [0, 0.105],
        [0.055, 0.068],
        [0.31, 0.05],
      ],
      far ? 6 : 12,
      1,
      false,
      far,
    );
  if (form === "round") {
    // The collar and domed, almost cylindrical crown are the signature of a bell tree.
    const profile = [
      [0.24, 0],
      [0.25, 0.23],
      [0.31, 0.36],
      [0.39, 0.35],
      [0.48, 0.315],
      [0.61, 0.305],
      [0.74, 0.28],
      [0.86, 0.225],
      [0.95, 0.13],
      [1, 0],
    ];
    silhouette(leaves, profile, far ? 6 : 20, 1, true, far);
  } else if (form === "open") {
    // A broad, lobed pear crown: the deciduous silhouette from 3D World.
    // Its continuous outline stays distinct after the SDK normalizes crown width.
    silhouette(
      leaves,
      [
        [0.27, 0],
        [0.3, 0.22],
        [0.39, 0.32],
        [0.51, 0.35],
        [0.63, 0.32],
        [0.73, 0.29],
        [0.82, 0.24],
        [0.92, 0.16],
        [1, 0],
      ],
      far ? 6 : 24,
      1,
      false,
      far,
      5,
    );
  } else if (form === "tall") {
    // Three soft overlapping leaf skirts, informed by 3D Land's layered trees.
    // The stepped profile is geometry, not just bands painted on a bell.
    silhouette(
      leaves,
      [
        [0.26, 0],
        [0.27, 0.24],
        [0.34, 0.34],
        [0.43, 0.36],
        [0.5, 0.27],
        [0.51, 0.29],
        [0.65, 0.32],
        [0.73, 0.22],
        [0.74, 0.24],
        [0.9, 0.19],
        [1, 0],
      ],
      far ? 5 : 24,
      1,
      false,
      far,
      6,
    );
  } else if (form === "conifer") {
    const profile = [
      [0.24, 0],
      [0.28, 0.32],
      [0.5, 0.15],
      [0.51, 0.255],
      [0.72, 0.1],
      [0.73, 0.18],
      [1, 0],
    ];
    silhouette(leaves, profile, far ? 6 : 20, 1, true, far);
  } else if (form === "columnar") {
    const profile = [
      [0.24, 0],
      [0.3, 0.13],
      [0.46, 0.16],
      [0.65, 0.155],
      [0.8, 0.125],
      [0.93, 0.075],
      [1, 0],
    ];
    silhouette(leaves, profile, far ? 6 : 16, 1, true, far);
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
      COLOR_0: accessor(
        new Float32Array(m.shades.flatMap((shade) => [shade, shade, shade])),
        "VEC3",
        5126,
        34962,
      ),
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
