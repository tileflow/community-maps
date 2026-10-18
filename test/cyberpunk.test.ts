import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync } from "node:fs";
import {
  createExpression,
  featureFilter,
  validateStyleMin,
} from "@maplibre/maplibre-gl-style-spec";
import {
  readTileflowVegetationDisplay,
  resolveMap,
  resolveTileflowVegetationRepresentation,
} from "@tileflow/core";
import { createStyleWithInspection } from "@tileflow/core/build";
import { cyberpunk } from "../src";
const iconIds = readdirSync(
  new URL("../maps/cyberpunk/assets/icons/", import.meta.url),
)
  .filter((name) => name.endsWith(".svg"))
  .map((name) => name.replace(/(?:\.pattern)?\.svg$/u, ""));

function compiledLayerForTarget(
  compiled: ReturnType<typeof createStyleWithInspection>,
  target: string,
) {
  const match = compiled.inspection.layers.find(({ contributions }) =>
    contributions.some((c) => c.target === target),
  );
  return match
    ? (compiled.style.layers[match.index] as {
        filter?: unknown;
        minzoom?: number;
        layout?: Record<string, unknown>;
        paint?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
      })
    : undefined;
}

test("Cyberpunk HUD consumes canonical POI density and size ranks", () => {
  const resolved = resolveMap(cyberpunk);
  assert.equal(resolved.modules?.poi?.density, 2);
  assert.deepEqual(resolved.modules?.poi?.categories, [
    "transport",
    "arts-entertainment",
  ]);

  const compiled = createStyleWithInspection(cyberpunk, {
    preparedAssets: {
      icons: {
        ids: iconIds,
        sprite: "/icons/cyberpunk",
      },
    },
  });
  const ring = compiledLayerForTarget(
    compiled,
    "poi.render.destinationScanRing",
  );
  const sign = compiledLayerForTarget(compiled, "poi.render.destinationSign");
  const light = compiledLayerForTarget(
    compiled,
    "poi.render.destinationLightPool",
  );
  const culture = compiledLayerForTarget(
    compiled,
    "poi.arts-entertainment.label",
  );

  assert.ok(ring, "Cyberpunk lost its destination scan ring");
  assert.ok(sign, "Cyberpunk must label real destinations with category signs");
  assert.ok(light, "Important destinations must retain their ground light");
  assert.deepEqual(ring?.filter, sign?.filter);
  const filter = JSON.stringify(sign?.filter);
  for (const signal of ["filter_rank", "size_rank"])
    assert.ok(filter.includes(signal));
  assert.doesNotMatch(filter, /"class"|"subclass"|"rank"/u);
  assert.equal(sign?.layout?.["icon-allow-overlap"], false);
  assert.equal(sign?.layout?.["icon-ignore-placement"], false);
  assert.equal(sign?.layout?.["text-allow-overlap"], false);
  assert.ok(sign?.layout?.["symbol-sort-key"]);
  assert.equal(
    culture,
    undefined,
    "Sign labels must not duplicate semantic POI labels",
  );

  const matches = (zoom: number, properties: Record<string, unknown>) =>
    featureFilter(sign?.filter as never, "poi.filter").filter({ zoom }, {
      type: 1,
      properties,
    } as never);
  assert.equal(
    matches(14, { category: "landmark", filter_rank: 0, size_rank: 0 }),
    true,
  );
  assert.equal(
    matches(14, { category: "transport", filter_rank: 1, size_rank: 16 }),
    true,
  );
  // Local businesses enter at street scale, without crowding the city overview.
  assert.equal(
    matches(14, { category: "retail", filter_rank: 0, size_rank: 0 }),
    false,
  );
  assert.equal(
    matches(16, { category: "retail", filter_rank: 2, size_rank: 16 }),
    false,
  );
  assert.equal(
    matches(17, { category: "retail", filter_rank: 2, size_rank: 10 }),
    true,
  );
  const receivesLight = featureFilter(
    light?.filter as never,
    "poi.filter",
  ).filter;
  assert.equal(
    receivesLight({ zoom: 17 }, {
      type: 1,
      properties: {
        category: "landmark",
        filter_rank: 0,
        size_rank: 3,
      },
    } as never),
    true,
  );
  assert.equal(
    receivesLight({ zoom: 17 }, {
      type: 1,
      properties: {
        category: "retail",
        filter_rank: 0,
        size_rank: 3,
      },
    } as never),
    false,
  );
  assert.equal(
    matches(20, { category: "transport", filter_rank: 3, size_rank: 16 }),
    false,
  );
  assert.equal(
    matches(20, { category: "transport", filter_rank: 2, size_rank: 17 }),
    false,
  );
  assert.equal(matches(20, { category: "transport", rank: 1 }), false);
  assert.deepEqual(validateStyleMin(compiled.style as never), []);
});

test("Cyberpunk offers capped relief with independent 3D trees and close-up detail", () => {
  const resolved = resolveMap(cyberpunk);
  assert.equal(resolved.modules?.buildings?.enabled, false);
  assert.equal(resolved.modules?.buildings?.threeDimensional, undefined);
  assert.equal(resolved.modules?.vegetation?.mode, "3d");
  assert.equal(resolved.modules?.roads?.streetLights?.enabled, false);
  assert.equal(resolved.view?.pitch, 0);
  const compiled = createStyleWithInspection(cyberpunk, {
    preparedAssets: {
      icons: {
        ids: iconIds,
        sprite: "/icons/cyberpunk",
      },
    },
  });
  const outlines = compiledLayerForTarget(compiled, "land.render.cityOutline");
  const signs = compiledLayerForTarget(compiled, "poi.render.destinationSign");
  const buildingInk = createExpression(
    outlines?.paint?.["line-color"],
    "building ink",
  );
  const poiInk = createExpression(signs?.paint?.["text-color"], "POI ink");
  assert.equal(buildingInk.result, "success");
  assert.equal(poiInk.result, "success");
  if (buildingInk.result === "success" && poiInk.result === "success") {
    for (const [building_tone, category] of [
      ["destination", "arts-entertainment"],
      ["destination", "medical"],
      ["destination", "landmark"],
      ["destination", "transport"],
      ["commercial", "lodging"],
      ["active", "retail"],
      ["active", "food-drink"],
    ]) {
      assert.equal(
        buildingInk.value.evaluate({ zoom: 17 }, {
          type: 3,
          properties: { building_tone, importance_tier: 2 },
        } as never),
        poiInk.value.evaluate({ zoom: 17 }, {
          type: 1,
          properties: { category },
        } as never),
        `${category} must use the matching building family's ink`,
      );
    }
  }
  const vegetation = readTileflowVegetationDisplay(compiled.style.metadata);
  assert.ok(vegetation);
  assert.equal(
    resolveTileflowVegetationRepresentation(vegetation, {
      viewMode: "2d",
      supports3D: true,
    }),
    "3d",
    "Trees must keep their models while buildings/view mode stay flat",
  );
  assert.equal(
    resolveTileflowVegetationRepresentation(vegetation, {
      viewMode: "2d",
      supports3D: false,
    }),
    "flat",
    "Static renderers must retain the styled flat crowns",
  );
  assert.equal(
    resolveTileflowVegetationRepresentation(vegetation, {
      viewMode: "2d",
      supports3D: true,
      visible: false,
    }),
    "none",
    "Trees OFF must hide both models and fallback crowns",
  );
  // Native relief must not be replaced by full-height runtime models.
  assert.equal(compiled.style.metadata?.["tileflow:buildings"], undefined);
  const relief = compiledLayerForTarget(compiled, "land.render.cityRelief");
  assert.ok(relief);
  assert.equal(relief.layout?.visibility, "none");
  assert.equal(relief.metadata?.["tileflow:3d-toggle"], "building");
  const height = createExpression(
    relief.paint?.["fill-extrusion-height"],
    "height",
  );
  assert.equal(height.result, "success");
  if (height.result === "success") {
    for (const [render_height, expected] of [
      [0, 4],
      [5, 4],
      [25, 8],
      [300, 14],
    ]) {
      assert.equal(
        height.value.evaluate({ zoom: 17 }, {
          type: 3,
          properties: { render_height },
        } as never),
        expected,
      );
    }
  }
  const visible = featureFilter(
    relief.filter as never,
    "building.filter",
  ).filter;
  assert.equal(
    visible({ zoom: 17 }, {
      type: 3,
      properties: { render_height: 5 },
    } as never),
    true,
    "Ordinary buildings also receive relief",
  );
  assert.equal(
    visible({ zoom: 17 }, { type: 3, properties: { hide_3d: true } } as never),
    false,
  );
  assert.ok(compiledLayerForTarget(compiled, "land.render.cityOutline"));
  assert.ok(
    compiledLayerForTarget(compiled, "roads.classes.minor.surface.fill"),
  );
  const waterNames = compiledLayerForTarget(compiled, "labels.water.other");
  assert.ok(waterNames);
  assert.ok(
    (waterNames.minzoom ?? 0) >= 15,
    "Fountain names must not overwhelm districts at city scale",
  );
  const targetIndex = (target: string) =>
    compiled.inspection.layers.findIndex((layer) =>
      layer.contributions.some(
        (contribution) => contribution.target === target,
      ),
    );
  assert.ok(
    targetIndex("poi.render.destinationLightPool") <
      targetIndex("roads.classes.minor.surface.fill"),
    "Ground light must stay below road ink",
  );
  const shore = targetIndex("water.render.shoreCore");
  assert.ok(
    shore >= 0 && shore < targetIndex("water.bodies.fill"),
    "Opaque water must cover clipped polygon edges to avoid glowing tile seams",
  );
  assert.deepEqual(validateStyleMin(compiled.style as never), []);
});

test("Cyberpunk overview admits roads by scale and only marks ranked real cities", () => {
  const compiled = createStyleWithInspection(cyberpunk, {
    preparedAssets: { icons: { ids: iconIds, sprite: "/icons/cyberpunk" } },
  });
  const network = compiledLayerForTarget(
    compiled,
    "roads.render.principalNeonCore",
  );
  const city = compiledLayerForTarget(compiled, "labels.render.settlementNode");
  assert.ok(network);
  assert.ok(city);
  const roadVisible = featureFilter(
    network.filter as never,
    "road.filter",
  ).filter;
  const cityVisible = featureFilter(
    city.filter as never,
    "place.filter",
  ).filter;
  // Generalised tiles may lack importance_tier: the class fallback must preserve the hierarchy.
  for (const properties of [
    { class: "primary" },
    { class: "primary", importance_tier: 3 },
  ]) {
    assert.equal(
      roadVisible({ zoom: 5 }, { type: 2, properties } as never),
      false,
    );
    assert.equal(
      roadVisible({ zoom: 6 }, { type: 2, properties } as never),
      true,
    );
  }
  for (const [roadClass, firstZoom] of [
    ["motorway", 3],
    ["secondary", 9],
    ["tertiary", 12],
  ] as const) {
    const feature = { type: 2, properties: { class: roadClass } } as never;
    assert.equal(roadVisible({ zoom: firstZoom }, feature), true);
    if (firstZoom > 3)
      assert.equal(roadVisible({ zoom: firstZoom - 1 }, feature), false);
  }
  assert.equal(
    roadVisible({ zoom: 16 }, {
      type: 2,
      properties: { class: "minor", importance_tier: 0 },
    } as never),
    false,
  );
  assert.equal(
    cityVisible({ zoom: 5 }, {
      type: 1,
      properties: { class: "city", capital: 2 },
    } as never),
    true,
  );
  assert.equal(
    cityVisible({ zoom: 5 }, {
      type: 1,
      properties: { class: "city", rank: 4 },
    } as never),
    true,
  );
  assert.equal(
    cityVisible({ zoom: 5 }, {
      type: 1,
      properties: { class: "city", rank: 12 },
    } as never),
    false,
  );
  assert.equal(
    cityVisible({ zoom: 5 }, {
      type: 1,
      properties: { class: "city" },
    } as never),
    false,
  );
  assert.equal(
    cityVisible({ zoom: 5 }, {
      type: 1,
      properties: { class: "village", rank: 1 },
    } as never),
    false,
  );
  assert.deepEqual(validateStyleMin(compiled.style as never), []);
});
