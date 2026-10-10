import assert from "node:assert/strict";
import test from "node:test";
import {
  featureFilter,
  validateStyleMin,
} from "@maplibre/maplibre-gl-style-spec";
import { resolveMap } from "@tileflow/core";
import { createStyleWithInspection } from "@tileflow/core/build";
import { cyberpunk } from "../src";
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
        layout?: Record<string, unknown>;
      })
    : undefined;
}

test("Cyberpunk HUD consumes canonical POI density and size ranks", () => {
  const resolved = resolveMap(cyberpunk);
  const renderOperationCount = Object.values(resolved.modules ?? {}).reduce(
    (count, module) =>
      count +
      (module && "renderStack" in module && module.renderStack
        ? Object.keys(module.renderStack).length
        : 0),
    0,
  );
  assert.equal(renderOperationCount, 49);
  assert.equal(resolved.modules?.poi?.density, 2);
  assert.deepEqual(resolved.modules?.poi?.categories, [
    "transport",
    "arts-entertainment",
  ]);

  const compiled = createStyleWithInspection(cyberpunk, {
    preparedAssets: {
      icons: {
        ids: [
          "cyberpunk-circuit",
          "cyberpunk-data-grid",
          "cyberpunk-target-brackets",
        ],
        sprite: "/icons/cyberpunk",
      },
    },
  });
  const ring = compiledLayerForTarget(
    compiled,
    "poi.render.destinationScanRing",
  );
  const core = compiledLayerForTarget(
    compiled,
    "poi.render.destinationBeaconCore",
  );
  const brackets = compiledLayerForTarget(
    compiled,
    "poi.render.destinationBrackets",
  );
  const culture = compiledLayerForTarget(
    compiled,
    "poi.arts-entertainment.label",
  );

  assert.ok(ring, "Cyberpunk lost its destination scan ring");
  assert.ok(core, "Cyberpunk lost its destination beacon core");
  assert.ok(brackets, "Cyberpunk lost its destination target brackets");
  assert.deepEqual(ring?.filter, core?.filter);
  assert.deepEqual(brackets?.filter, core?.filter);
  const filter = JSON.stringify(core?.filter);
  for (const signal of ["filter_rank", "size_rank"]) {
    assert.match(
      filter,
      new RegExp(signal.replaceAll("[", "\\[").replaceAll("]", "\\]")),
    );
  }
  assert.doesNotMatch(filter, /"class"|"subclass"|"rank"/u);
  assert.equal(brackets?.layout?.["icon-allow-overlap"], false);
  assert.equal(brackets?.layout?.["icon-ignore-placement"], false);
  assert.equal(brackets?.layout?.["text-allow-overlap"], false);
  assert.ok(brackets?.layout?.["symbol-sort-key"]);
  assert.match(JSON.stringify(culture?.filter), /filter_rank/u);

  const matches = (zoom: number, properties: Record<string, unknown>) =>
    featureFilter(core?.filter as never, "poi.filter").filter({ zoom }, {
      type: 1,
      properties,
    } as never);
  assert.equal(
    matches(14, { category: "landmark", filter_rank: 0, size_rank: 0 }),
    true,
  );
  assert.equal(
    matches(14, { category: "transport", filter_rank: 2, size_rank: 16 }),
    true,
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
