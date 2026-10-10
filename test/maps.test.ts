import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { createStyle, defineMap, resolveMap } from "@tileflow/core";
import {
  createTileflowBuildArtifacts,
  disposeTileflowBuildArtifacts,
} from "@tileflow/dev";
import { cyberpunk, terminal, superTileWorld } from "../src";

const root = fileURLToPath(new URL("../", import.meta.url));

for (const map of [cyberpunk, terminal, superTileWorld]) {
  test(`${map.id} compiles with its own artwork and can be extended`, async () => {
    const files = await readdir(
      new URL(`../maps/${map.id}/assets/icons/`, import.meta.url),
    );
    const ids = files.map((file) => file.replace(/(?:\.pattern)?\.svg$/u, ""));
    const style = createStyle(map, {
      preparedAssets: { icons: { ids, sprite: `/maps/${map.id}/sprite` } },
    });
    assert.deepEqual(validateStyleMin(style as never), []);
    assert.ok(style.layers.length > 50);
    assert.equal(Object.isFrozen(map), true);
    assert.doesNotMatch(JSON.stringify(style), /neon-grid|matrix|cyber-/iu);
    for (const id of ids)
      assert.ok(JSON.stringify(style).includes(id), `Missing artwork ${id}`);

    const custom = resolveMap(
      defineMap({
        id: "custom-city",
        version: 1,
        extends: map,
        view: { center: [-0.1276, 51.5072], zoom: 12 },
      }),
    );
    assert.equal(custom.id, "custom-city");
    assert.deepEqual(custom.view?.center, [-0.1276, 51.5072]);
    assert.equal(
      map.name,
      {
        cyberpunk: "Cyberpunk",
        terminal: "Terminal",
        "super-tile-world": "Super Tile World",
      }[map.id],
    );
  });

  test(`${map.id} prepares icons, original fonts, and font licenses`, async () => {
    const artifacts = await createTileflowBuildArtifacts({
      cwd: root,
      config: `maps/${map.id}/tileflow.config.ts`,
      assetBaseUrl: "/tileflow",
      styleBaseUrl: "/tileflow",
    });
    try {
      assert.ok(
        artifacts.assets.some(({ fileName }) =>
          fileName.endsWith("sprite.png"),
        ),
      );
      assert.ok(
        artifacts.assets.some(({ fileName }) =>
          fileName.startsWith("fonts/licenses/"),
        ),
      );
      const fonts = artifacts.assets.filter(({ fileName }) =>
        fileName.endsWith(".ttf"),
      );
      assert.equal(fonts.length, map.id === "super-tile-world" ? 3 : 2);
      for (const [file, expected] of map.id === "super-tile-world"
        ? []
        : [
            [
              "Oxanium-Medium.ttf",
              "d0676de4894cd22591b4bb538dae5b8e06c44e0fb943300a7cff3945fe643689",
            ],
            [
              "Oxanium-SemiBold.ttf",
              "e2d77ec4ee67b0152166adf5d6393360550a012c2066e0d4589053e14a733cdc",
            ],
          ]) {
        const bytes = await readFile(
          new URL(`../maps/${map.id}/assets/fonts/${file}`, import.meta.url),
        );
        assert.equal(
          createHash("sha256").update(bytes).digest("hex"),
          expected,
        );
      }
      assert.ok(
        artifacts.styles[map.id]?.[map.defaultTheme ?? "light"]?.metadata?.[
          "tileflow:fontFaces"
        ],
      );
      assert.doesNotMatch(
        JSON.stringify(artifacts.manifest),
        /\/Users\/|node_modules|neon-grid|matrix/iu,
      );
    } finally {
      await disposeTileflowBuildArtifacts(artifacts);
    }
  });
}
