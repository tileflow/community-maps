import {
  buildings, defineMap, defineTheme, disable, expr, field, fixed, labels, land,
  landforms, poi, refineRenderTarget, renderPass, roads, token, vegetation, water, withRenderStack, zoom,
  type TileflowAreaStyle, type TileflowPoiCategory, type TileflowPoiCategoryStyle,
  type TileflowRoadClass, type TileflowRoadClassStyle, type TileflowSymbolStyle,
} from "@tileflow/core";
import { wildlandsFonts, wildlandsIcons } from "./assets";

// Authored from the supplied adventure-map references, without map inheritance.
const ink = token.color;
const metric = (value: number) => fixed(value, { reason: "Wildlands cartographic drawing scale" });
const curve = (stops: readonly (readonly [number, number])[]) =>
  zoom.linear(stops.map(([z, value]) => [z, metric(value)] as const));
// Terrain gives way to building detail at the same zoom boundary.
const buildingDetailZoom = 14;

export const wildlandsTheme = defineTheme({
  id: "wildlands-parchment", version: 1, colorScheme: "dark",
  tokens: {
    color: {
      "surface.background": "#59491F", "surface.land": "#59491F",
      "surface.water": "#35444A", "surface.park": "#514B28",
      "surface.building": "#3B3521", "roads.default": "#CAC38F",
      "roads.major": "#D3CC98", "roads.casing": "#403820",
      "labels.primary": "#C8B775", "labels.muted": "#AD9C62",
      "labels.halo": "#4B4022", "boundaries.default": "#716039",
      "land.wood": "#494329", "land.scrub": "#62552C", "land.grass": "#71623A",
      "land.farmland": "#726039", "land.rock": "#8A7B51", "land.sand": "#9B8955",
      "land.ice": "#B2A783", "land.settlement": "#65532D",
      "forest.ink": "#332F1C", "forest.light": "#635D35",
      "water.bank": "#484126", "water.shore": "#5C6867", "water.stream": "#465854",
      "terrain.shadow": "#352A16", "terrain.light": "#B7A577", "terrain.accent": "#6D592C",
      "terrain.contour": "#352F19", "terrain.index": "#302A17", "terrain.text": "#A29464",
      "building.outline": "#8B7950", "trail.ink": "#AFA979",
    },
    font: { regular: "HyliaSerifBeta-Regular", strong: "HyliaSerifBeta-Regular", fallback: "Noto Sans Regular" },
    image: {
      tree: "wildlands-tree", treeRound: "wildlands-tree-round", treePine: "wildlands-tree-pine",
      parchment: "wildlands-parchment",
      camp: "wildlands-camp", shelter: "wildlands-shelter", monument: "wildlands-monument",
      meal: "wildlands-meal", discovery: "wildlands-discovery", summit: "wildlands-summit", nature: "wildlands-nature",
    },
  },
  typography: { font: "HyliaSerifBeta-Regular", fallbacks: ["Noto Sans Regular"], transform: "uppercase" },
  lighting: { anchor: "viewport", color: "#F5E9BE", intensity: 0.12, position: [1, 315, 40] },
});

const area = (color: string, opacity = 1): TileflowAreaStyle => ({
  fill: { color: ink(color), opacity: metric(opacity) },
});

function road(width: number, trail = false): TileflowRoadClassStyle {
  const widths: readonly (readonly [number, number])[] = [
    [6, 0.3], [10, width * 0.32], [13, width], [16, width * 2], [19, width * 4],
  ];
  // Casing width is the full stroke beneath the road, not the thickness of its edge.
  const outlinedWidth = (extra = 0) => curve(widths.map(([z, fillWidth]) => [
    z, fillWidth + 2 * ((trail ? 0.8 : 1.4) + extra) * Math.min(1.4, Math.max(0.25, (z - 5) / 11)),
  ] as const));
  const stroke = {
    color: ink(trail ? "trail.ink" : "roads.default"),
    width: curve(widths),
    opacity: metric(trail ? 0.7 : 0.96),
    cap: "round" as const, join: "round" as const,
    ...(trail ? { dash: fixed([3, 2], { reason: "Dotted walking trails" }) } : {}),
  };
  const casing = { color: ink("roads.casing"), width: outlinedWidth(), opacity: metric(0.95),
    cap: "round" as const, join: "round" as const };
  return {
    surface: { fill: stroke, casing },
    bridge: { fill: stroke, casing: { ...casing, width: outlinedWidth(0.35) } },
    tunnel: { fill: { ...stroke, opacity: metric(0.3) }, casing: { ...casing, opacity: metric(0.4) } },
  };
}

const roadClasses: Partial<Record<TileflowRoadClass, TileflowRoadClassStyle>> = {
  motorway: road(4.1), trunk: road(3.8), primary: road(3.5), secondary: road(3),
  tertiary: road(2.5), minor: road(1.9), service: road(1.2), track: road(1.1, true),
  pathway: road(0.85, true), footway: road(0.85, true), cycleway: road(0.9, true),
  steps: road(0.8, true), pedestrian: road(1.2, true),
};

const roadNames = Object.fromEntries((Object.keys(roadClasses) as TileflowRoadClass[]).map(roadClass => {
  const major = ["motorway", "trunk", "primary", "secondary", "tertiary"].includes(roadClass);
  const path = ["track", "pathway", "footway", "cycleway", "steps", "pedestrian"].includes(roadClass);
  const style: TileflowSymbolStyle = {
    minZoom: major ? 12 : path ? 17 : 15,
    placement: "line", spacing: metric(300),
    text: {
      font: token.font("fallback"), transform: "none", color: ink("roads.default"),
      haloColor: ink("roads.casing"), haloWidth: metric(1.4), haloBlur: metric(0.2),
      size: curve([[12, 10], [16, path ? 10.5 : 11.5], [19, path ? 12 : 13.5]]),
      letterSpacing: metric(0.01), padding: metric(4), maxAngle: metric(35),
      keepUpright: true, allowOverlap: false,
    },
  };
  return [roadClass, style];
}));

function place(size: number, minZoom: number): TileflowSymbolStyle {
  return { minZoom, text: {
    font: token.font("regular"), color: ink("labels.primary"),
    haloColor: ink("labels.halo"), haloWidth: metric(1.2),
    size: curve([[6, size * 0.8], [14, size], [18, size * 1.12]]),
    letterSpacing: metric(0.055), maxWidth: metric(14), padding: metric(8),
  } };
}

function destination(image: string, minZoom = 14): TileflowPoiCategoryStyle {
  return {
    minZoom,
    icon: { image: token.image(image), size: curve([[14, 0.72], [17, 0.9], [20, 1]]),
      anchor: "bottom", padding: metric(16), allowOverlap: false },
    text: { font: token.font("regular"), color: ink("labels.primary"),
      haloColor: ink("labels.halo"), haloWidth: metric(0.7),
      size: curve([[14, 9.5], [17, 10], [20, 10.5]]), letterSpacing: metric(0.015),
      anchor: "top", offset: [metric(0), metric(0.4)], maxWidth: metric(14),
      optional: false, padding: metric(8) },
  };
}
const destinations: Partial<Record<TileflowPoiCategory, TileflowPoiCategoryStyle>> = {
  "park-nature": destination("nature", 15), lodging: destination("shelter", 17),
  landmark: { ...destination("monument"), icon: { ...destination("monument").icon,
    image: expr.match(expr.get(field("poiType")), [
      { labels: ["scenic_viewpoint", "cave", "waterfall"], value: token.image("discovery") },
    ], token.image("monument")) } }, "arts-entertainment": destination("monument"),
  religion: destination("monument", 17), "food-drink": destination("meal", 18),
  "visitor-amenity": destination("discovery", 17), "sport-leisure": destination("discovery", 18),
};
destinations.lodging = { ...destination("shelter", 17), icon: { ...destination("shelter", 17).icon,
  image: expr.match(expr.get(field("poiType")), [
    { labels: ["campground", "campsite", "caravan_site"], value: token.image("camp") },
  ], token.image("shelter")) } };

const treeArtwork = expr.match(expr.get(field("leafType")), [
  { labels: "needleleaved", value: expr.literal(token.image("treePine")) },
], expr.match(expr.modulo(expr.abs(expr.toNumber(expr.id(), 0)), 7), [
  { labels: [0, 2, 4], value: expr.literal(token.image("tree")) },
], expr.literal(token.image("treeRound"))));
// Measurements size the artwork when present; 6 m is a visual fallback, not a new tree observation.
const treeCrownScale = expr.divide(
  expr.min(expr.literal(metric(14)), expr.max(expr.literal(metric(3)),
    expr.toNumber(expr.coalesce(expr.get(field("diameterCrown")), expr.literal(metric(6))),
      expr.literal(metric(6))))), expr.literal(metric(6)),
);
const treeSize = expr.interpolate({ kind: "exponential", base: 2 }, expr.zoom(), [
  [14, expr.multiply(expr.literal(metric(0.09)), treeCrownScale)],
  [20, expr.multiply(expr.literal(metric(5.76)), treeCrownScale)],
]);

export const wildlands = defineMap({
  id: "wildlands", name: "Wildlands · Atlas de aventura", version: 1,
  data: { type: "tileflow-world", generation: "v1", selection: { kind: "current", product: "world-v1" } },
  themes: { parchment: wildlandsTheme }, defaultTheme: "parchment",
  fonts: [wildlandsFonts],
  icons: [wildlandsIcons], projection: "mercator",
  terrain: {
    mode: "hillshade", encoding: "terrarium",
    url: "https://tiles.mapterhorn.com/tilejson.json",
    attribution: 'Terrain © <a href="https://mapterhorn.com/attribution">Mapterhorn</a>',
    hillshade: {
      maxZoom: buildingDetailZoom,
      shadowColor: ink("terrain.shadow"), highlightColor: ink("terrain.light"),
      accentColor: ink("terrain.accent"), exaggeration: metric(0.32),
      illuminationDirection: metric(315), illuminationAnchor: "map",
    },
    contours: {
      demUrl: "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp", demMaxZoom: 12,
      sourceId: "wildlands-contours", minZoom: 8, maxZoom: 15, overzoom: 1,
      thresholds: { 8: [100, 500], 10: [50, 250], 12: [20, 100], 14: [10, 50] },
      minor: { maxZoom: buildingDetailZoom, color: ink("terrain.contour"), width: metric(0.55), opacity: metric(0.4) },
      index: { maxZoom: buildingDetailZoom, color: ink("terrain.index"), width: metric(0.85), opacity: metric(0.52) },
      labels: { minZoom: 13, maxZoom: buildingDetailZoom, color: ink("terrain.text"), haloColor: ink("labels.halo"),
        haloWidth: metric(0.5), font: token.font("fallback"), size: metric(9), spacing: metric(550), opacity: metric(0.7) },
    },
  },
  modules: {
    land: land({
      background: { color: ink("surface.background"), pattern: token.image("parchment") },
      globalLandcover: { color: ink("land.scrub"), opacity: metric(0.3), maxZoom: 10 },
      landcover: {
        wood: { fill: { color: ink("land.wood"), opacity: metric(0.55) },
          outline: { color: ink("forest.ink"), width: metric(0.5), opacity: metric(0.3) } },
        scrub: area("land.scrub", 0.65), grass: area("land.grass", 0.48),
        meadow: area("land.grass", 0.55), farmland: area("land.farmland", 0.6),
        rock: area("land.rock", 0.7), sand: area("land.sand", 0.65), ice: area("land.ice", 0.8),
        urbanPark: area("surface.park", 0.8), villageGreen: area("surface.park", 0.7),
        recreationGround: area("land.grass", 0.5), protected: area("land.scrub", 0.15),
        wetland: area("surface.park", 0.6), flowerbed: area("land.grass", 0.6),
      },
      landuse: Object.fromEntries(["cemetery", "civic", "commercial", "education", "government", "industrial", "medical", "military", "parking", "railway", "recreation", "residential"].map(key => [key, area("land.settlement", 0.4)])),
    }),
    water: withRenderStack(water({
      bodies: { fill: { color: ink("surface.water") }, outline: {
        color: ink("water.shore"), width: curve([[8, 0.7], [13, 1.5], [16, 2.5], [19, 4]]),
        opacity: metric(0.9), join: "round" } },
      waterways: {
        river: { color: ink("water.stream"), width: curve([[9, 0.5], [13, 1.8], [17, 5]]), opacity: metric(0.7) },
        stream: { color: ink("water.stream"), width: curve([[10, 0.3], [14, 0.8], [18, 2]]), opacity: metric(0.7) },
        canal: { color: ink("water.stream"), width: metric(1), opacity: metric(0.7) },
        other: { color: ink("water.stream"), width: metric(0.6), opacity: metric(0.5) },
      },
      intermittent: { bodies: area("surface.water", 0.7) },
    }), {
      shorelineBank: renderPass({
        renderer: "line", placement: { below: "water.bodies.fill" },
        style: { color: ink("water.bank"), width: curve([[8, 1.5], [13, 4], [16, 7], [19, 12]]),
          opacity: metric(0.9), join: "round", cap: "round" },
      }),
      // Lakes mask incoming waterway centerlines without hiding narrow rivers on land.
      riverUnderLakes: refineRenderTarget({ target: "water.waterways.river", placement: { below: "water.bodies.fill" } }),
      streamUnderLakes: refineRenderTarget({ target: "water.waterways.stream", placement: { below: "water.bodies.fill" } }),
      canalUnderLakes: refineRenderTarget({ target: "water.waterways.canal", placement: { below: "water.bodies.fill" } }),
      otherUnderLakes: refineRenderTarget({ target: "water.waterways.other", placement: { below: "water.bodies.fill" } }),
    }),
    roads: roads({ detail: "all", hierarchy: "subtle", outline: "subtle", oneWayMarkers: false,
      classes: roadClasses, extras: { paths: true },
      areas: { pedestrian: area("land.settlement"), road: area("land.settlement"), pier: area("roads.default") },
    }),
    buildings: buildings({ mode: "flat", flat: {
      fill: { minZoom: buildingDetailZoom, color: ink("surface.building"), opacity: metric(0.8) },
      outline: { minZoom: buildingDetailZoom, color: ink("building.outline"), width: metric(0.7) } }, businessCorridor: { fill: { visible: false } } }),
    vegetation: withRenderStack(vegetation({ mode: "flat", minZoom: 14,
      flat: { visible: false, opacity: metric(0), strokeOpacity: metric(0) } }), {
      // One drawing per mapped tree point. Woodland polygons never create tree positions.
      mappedTrees: renderPass({
        feature: "tree", renderer: "symbol", placement: "above-vegetation",
        selector: { kind: "geometry", geometry: "point" },
        style: { minZoom: 14, placement: "point", zOrder: "viewport-y",
          icon: { image: treeArtwork, size: treeSize, anchor: "bottom",
            allowOverlap: true, ignorePlacement: true, padding: metric(0),
            rotationAlignment: "viewport", pitchAlignment: "viewport" } },
      }),
    }),
    landforms: landforms({ elevation: true, classes: {
      peak: { minZoom: 11, icon: { image: token.image("summit"), size: metric(0.85), anchor: "bottom" },
        text: { color: ink("labels.primary"), haloColor: ink("labels.halo"), haloWidth: metric(1),
          size: metric(11), anchor: "top", offset: [metric(0), metric(0.4)] } },
    } }),
    labels: labels({ language: "local", places: "all", roads: "all", water: "all", shields: "none", junctions: false,
      styles: {
        roads: roadNames,
        places: { country: place(21, 2), state: place(16, 5), city: place(17, 5), town: place(15, 8),
          village: place(12, 10), neighborhood: place(11, 14), other: place(11, 12), continent: place(23, 0) },
        water: { ...Object.fromEntries(["line", "ocean", "other"].map(key => [key, {
          text: { color: ink("labels.primary"), haloColor: ink("surface.water"), haloWidth: metric(0.8),
            size: metric(14), letterSpacing: metric(0.065) },
        }])), waterway: { visible: false } },
        aerodrome: { visible: false },
      },
    }),
    poi: poi({ categories: Object.keys(destinations) as TileflowPoiCategory[], density: 1,
      minZoom: 14, icons: true, labels: true, styles: destinations,
      placement: { coupleIconAndLabel: true, iconPadding: 16, textPadding: 8 } }),
    addresses: disable(), aeroways: disable(), boundaries: disable(), transit: disable(), nautical: disable(),
  },
  view: { center: [-6.718, 42.125], zoom: 14.1, pitch: 0, bearing: 0 },
  scenes: {
    sanabria: { theme: "parchment", camera: { type: "center", center: [-6.718, 42.125], zoom: 14.1 }, viewport: { width: 1440, height: 900, dpr: 1 } },
    overview: { theme: "parchment", camera: { type: "center", center: [-6.718, 42.125], zoom: 13.35 }, viewport: { width: 1440, height: 900, dpr: 1 } },
    village: { theme: "parchment", camera: { type: "center", center: [-6.7247, 42.1132], zoom: 15.5 }, viewport: { width: 1440, height: 900, dpr: 1 } },
    trees: { theme: "parchment", camera: { type: "center", center: [-5.6692, 40.9553], zoom: 17.4 }, viewport: { width: 1440, height: 900, dpr: 1 } },
    streets: { theme: "parchment", camera: { type: "center", center: [-3.694888, 40.415535], zoom: 17.34 }, viewport: { width: 1440, height: 900, dpr: 1 } },
  },
});
