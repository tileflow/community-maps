// Adapted from Tileflow SDK; see NOTICE for origin and modifications.
import {
  boundaries,
  defineMap,
  disable,
  expr,
  field,
  fixed,
  labels,
  land,
  poi,
  refineRenderTarget,
  renderPass,
  roads,
  type TileflowDataExpressionInput,
  type TileflowFixedValue,
  type TileflowLineCap,
  type TileflowLineJoin,
  type TileflowLineStyle,
  type TileflowNamedRenderStack,
  type TileflowRenderSelector,
  type TileflowRoadClassStyle,
  token,
  transit,
  vegetation,
  water,
  withRenderStack,
  zoom,
} from "@tileflow/core";
import { cyberpunkFonts, cyberpunkIcons } from "./assets";
import { mapboxRailTransitStyle } from "../../src/shared/mapbox-rail";
import {
  bindCommunityMapTheme,
  defineCommunityTheme,
} from "../../src/shared/theme-helpers";

const cyberpunkPalette = {
  background: "#060B18",
  boundary: "#E82098",
  building: "#11182B",
  buildingActive: "#1A2138",
  buildingOutline: "#45608C",
  cyan: "#147DFF",
  cyanSoft: "#6C8CCB",
  cyanMuted: "#33486F",
  acidGreen: "#2CF58A",
  destinationInk: "#FFF06A",
  activityInk: "#FF5CCF",
  natureInk: "#6CC5AA",
  green: "#168F96",
  halo: "#03050B",
  land: "#09142A",
  labelCulture: "#B69BFF",
  labelHalo: "#030A17",
  labelMuted: "#B9CDEF",
  labelWater: "#8EBBFF",
  magenta: "#E82098",
  magentaSoft: "#F24CB6",
  neonCyan: "#43E4FF",
  neonMagenta: "#FF5CCF",
  orange: "#FF9F1C",
  park: "#0D2828",
  purple: "#7657FF",
  road: "#010208",
  roadBridge: "#0A2146",
  roadCasing: "#45608C",
  roadTunnel: "#06152E",
  text: "#EAF6FF",
  textMuted: "#93A7C4",
  water: "#071E31",
  waterDeep: "#01040C",
  yellow: "#F8EF42",
} as const;

function cyberpunkColorForSemanticToken(name: string): string {
  const [group, role = ""] = name.split(".");
  switch (group) {
    case "boundaries":
      return role === "halo"
        ? cyberpunkPalette.labelHalo
        : cyberpunkPalette.boundary;
    case "buildings":
      return role === "outline" || role.endsWith("Outline")
        ? cyberpunkPalette.buildingOutline
        : cyberpunkPalette.building;
    case "hydro":
      return role === "label" || role === "ferry"
        ? cyberpunkPalette.cyanSoft
        : cyberpunkPalette.water;
    case "labels":
      if (role === "halo" || role === "waterHalo")
        return cyberpunkPalette.labelHalo;
      if (role === "muted" || role === "neighborhood")
        return cyberpunkPalette.labelMuted;
      if (role === "water") return cyberpunkPalette.labelWater;
      return cyberpunkPalette.text;
    case "landcover":
      return cyberpunkPalette.park;
    case "landuse":
      return role === "recreation" || role === "recreationOutline"
        ? cyberpunkPalette.park
        : cyberpunkPalette.land;
    case "poi": {
      const accents: Readonly<Record<string, string>> = {
        "arts-entertainment": cyberpunkPalette.labelCulture,
        "food-drink": cyberpunkPalette.orange,
        halo: cyberpunkPalette.labelHalo,
        landmark: cyberpunkPalette.labelCulture,
        lodging: cyberpunkPalette.magentaSoft,
        medical: cyberpunkPalette.magentaSoft,
        "park-nature": cyberpunkPalette.green,
        religion: cyberpunkPalette.labelCulture,
        retail: cyberpunkPalette.green,
        "sport-leisure": cyberpunkPalette.green,
        transport: cyberpunkPalette.neonMagenta,
      };
      return accents[role] ?? cyberpunkPalette.cyanSoft;
    }
    case "roads":
      if (name.includes("casing")) return cyberpunkPalette.roadCasing;
      if (name.includes("tunnel")) return cyberpunkPalette.roadTunnel;
      if (role === "ferry") return cyberpunkPalette.cyanMuted;
      if (role === "rail" || role === "railTransit")
        return cyberpunkPalette.orange;
      if (role === "cycleway" || role === "parkPath")
        return cyberpunkPalette.green;
      return cyberpunkPalette.road;
    case "surface":
      if (role === "water") return cyberpunkPalette.water;
      if (role === "building") return cyberpunkPalette.building;
      if (role === "park") return cyberpunkPalette.park;
      return cyberpunkPalette.land;
    case "transit":
      return cyberpunkPalette.neonMagenta;
    case "vegetation":
      return cyberpunkPalette.park;
    default:
      throw new Error(
        `Cyberpunk has no visual family for semantic token ${name}.`,
      );
  }
}

const cyberpunkSemanticColorRoles = {
  boundaries: [
    "admin",
    "default",
    "disputed",
    "halo",
    "major",
    "maritime",
    "regional",
  ],
  buildings: [
    "active",
    "businessCorridor",
    "businessCorridorOutline",
    "civic",
    "commercial",
    "destination",
    "extrusion",
    "fill",
    "generic",
    "industrial",
    "outline",
    "residential",
    "shadow",
  ],
  hydro: [
    "depth.m0",
    "depth.m200",
    "depth.m2000",
    "depth.m7000",
    "ferry",
    "label",
    "water",
    "waterway",
  ],
  labels: [
    "country",
    "halo",
    "muted",
    "neighborhood",
    "overview",
    "poi",
    "primary",
    "road",
    "settlement",
    "strong",
    "water",
    "waterHalo",
  ],
  landcover: [
    "barren",
    "farmland",
    "flowerbed",
    "grass",
    "greenspace",
    "greenspaceDark",
    "ice",
    "meadow",
    "protected",
    "recreationGround",
    "rock",
    "sand",
    "scrub",
    "urbanPark",
    "villageGreen",
    "wetland",
    "wood",
  ],
  landuse: [
    "businessCorridor",
    "businessCorridorOutline",
    "cemetery",
    "civic",
    "commercial",
    "education",
    "government",
    "industrial",
    "medical",
    "parking",
    "parkingOutline",
    "railway",
    "recreation",
    "recreationOutline",
    "residential",
  ],
  poi: [
    "arts-entertainment",
    "education",
    "food-drink",
    "halo",
    "icon",
    "label",
    "landmark",
    "lodging",
    "medical",
    "park-nature",
    "public-services",
    "religion",
    "retail",
    "sport-leisure",
    "transport",
    "visitor-amenity",
  ],
  roads: [
    "bridge",
    "casing",
    "city.casing",
    "city.minor",
    "city.primary",
    "city.secondary",
    "city.tertiary",
    "city.tunnel",
    "city.tunnelCasing",
    "cycleway",
    "default",
    "default.casing",
    "default.tunnel",
    "ferry",
    "major",
    "minor",
    "motorway",
    "motorway.casing",
    "motorway.tunnel",
    "parkPath",
    "path",
    "path.casing",
    "path.transition",
    "path.tunnel",
    "primary",
    "rail",
    "railTransit",
    "secondary",
    "trunk",
    "trunk.casing",
    "trunk.tunnel",
    "tunnel",
  ],
  surface: ["background", "building", "land", "park", "water"],
  transit: ["primary"],
  vegetation: [
    "tree.bark",
    "tree.broadleaf.a",
    "tree.broadleaf.b",
    "tree.broadleaf.c",
    "tree.broadleaf.d",
    "tree.conifer.a",
    "tree.conifer.b",
    "tree.conifer.c",
  ],
} as const;

const cyberpunkSemanticColors = Object.fromEntries(
  Object.entries(cyberpunkSemanticColorRoles).flatMap(([group, roles]) =>
    roles.map((role) => {
      const name = `${group}.${role}`;
      return [name, cyberpunkColorForSemanticToken(name)];
    }),
  ),
);

const cyberpunkBuildingHeight2d = expr.toNumber(
  expr.coalesce(expr.get(field("renderHeight")), 0),
  0,
);
const cyberpunkBuildingTone2d = expr.coalesce(
  expr.get(field("buildingTone")),
  "",
);
const cyberpunkPublishedImportanceTier = expr.toNumber(
  expr.coalesce(expr.get(field("importanceTier")), 0),
  0,
);
const cyberpunkBuildingIsDestination = expr.eq(
  cyberpunkBuildingTone2d,
  "destination",
);
const cyberpunkBuildingHasColorFamily = expr.match<string, boolean>(
  cyberpunkBuildingTone2d,
  [{ labels: ["active", "commercial", "destination"], value: true }],
  false,
);
const cyberpunkBuildingLegacyImportanceTier = expr.case<number>(
  [
    {
      when: cyberpunkBuildingIsDestination,
      value: expr.step(cyberpunkBuildingHeight2d, 2, [[36, 3]]),
    },
    {
      when: cyberpunkBuildingHasColorFamily,
      value: expr.step(cyberpunkBuildingHeight2d, 1, [[24, 2]]),
    },
    { when: expr.gte(cyberpunkBuildingHeight2d, 36), value: 1 },
  ],
  0,
);
const cyberpunkBuildingImportanceTier = expr.case<number>(
  [
    {
      // A tall ordinary block must not compete with a mapped destination.
      when: expr.has(field("importanceTier")),
      value: cyberpunkPublishedImportanceTier,
    },
  ],
  cyberpunkBuildingLegacyImportanceTier,
);
const cyberpunkBuildingIsSelectedDestination = expr.all(
  cyberpunkBuildingIsDestination,
  expr.gte(cyberpunkBuildingImportanceTier, 3),
);
const cyberpunkBuildingGhostFill = expr.case<string>(
  [
    { when: cyberpunkBuildingIsSelectedDestination, value: "#302915" },
    { when: cyberpunkBuildingIsDestination, value: "#201F20" },
    { when: cyberpunkBuildingHasColorFamily, value: "#24122D" },
  ],
  "#101D30",
);
// The volume carries a dark tint; only the footprint contours use neon ink.
const cyberpunkBuildingReliefMaterial = expr.case<string>(
  [
    { when: cyberpunkBuildingIsDestination, value: "#51472E" },
    { when: cyberpunkBuildingHasColorFamily, value: "#3C2549" },
  ],
  "#24354C",
);
const cyberpunkBuildingGhostCore = expr.case<string>(
  [
    {
      when: cyberpunkBuildingIsDestination,
      value: cyberpunkPalette.destinationInk,
    },
    {
      when: cyberpunkBuildingHasColorFamily,
      value: cyberpunkPalette.activityInk,
    },
  ],
  "#477AB3",
);
const cyberpunkBuildingGhostCoreOpacity = expr.step(
  cyberpunkBuildingImportanceTier,
  0.27,
  [
    [1, 0.46],
    [2, 0.68],
    [3, 0.9],
    [4, 1],
  ],
);

const cyberpunkRoadClass = expr.coalesce(expr.get(field("class")), "");
const cyberpunkRoadImportanceTier = expr.case<number>(
  [
    {
      when: expr.has(field("importanceTier")),
      value: cyberpunkPublishedImportanceTier,
    },
  ],
  expr.match<string, number>(
    cyberpunkRoadClass,
    [
      { labels: ["motorway", "trunk"], value: 4 },
      { labels: "primary", value: 3 },
      { labels: "secondary", value: 2 },
      { labels: "tertiary", value: 1 },
    ],
    0,
  ),
);

const cyberpunkPoiCategory = expr.coalesce(expr.get(field("poiCategory")), "");
const cyberpunkPoiFilterRank = expr.toNumber(
  expr.get(field("poiFilterRank")),
  6,
);
const cyberpunkPoiSizeRank = expr.toNumber(expr.get(field("poiSizeRank")), 17);
const cyberpunkPoiPlacementPriority = expr.add(
  expr.multiply(cyberpunkPoiFilterRank, 17),
  cyberpunkPoiSizeRank,
);
// World publishes broad building tones, without an individual POI/building ID.
// Keep the destination, activity and green-space families coherent across domains.
const cyberpunkPoiImportanceColor = expr.match<string, string>(
  cyberpunkPoiCategory,
  [
    {
      labels: [
        "landmark",
        "transport",
        "arts-entertainment",
        "education",
        "religion",
        "medical",
        "public-services",
      ],
      value: cyberpunkPalette.destinationInk,
    },
    {
      labels: ["lodging", "retail", "food-drink"],
      value: cyberpunkPalette.activityInk,
    },
    {
      labels: ["park-nature", "sport-leisure"],
      value: cyberpunkPalette.natureInk,
    },
  ],
  "#9BBAD4",
);
const cyberpunkPoiSign = expr.match<string, TileflowFixedValue<string>>(
  cyberpunkPoiCategory,
  [
    {
      labels: "transport",
      value: fixed("cyberpunk-sign-transit", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: "medical",
      value: fixed("cyberpunk-sign-medical", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: "lodging",
      value: fixed("cyberpunk-sign-hotel", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: ["arts-entertainment", "education", "religion"],
      value: fixed("cyberpunk-sign-culture", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: "food-drink",
      value: fixed("cyberpunk-sign-food", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: "retail",
      value: fixed("cyberpunk-sign-shop", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: ["park-nature", "sport-leisure"],
      value: fixed("cyberpunk-sign-park", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
    {
      labels: "landmark",
      value: fixed("cyberpunk-sign-landmark", {
        reason: "Original category pictogram shared by Cyberpunk destinations.",
      }),
    },
  ],
  fixed("cyberpunk-sign-place", {
    reason: "Original category pictogram shared by Cyberpunk destinations.",
  }),
);
const cyberpunkPoiIsActive = expr.toBoolean(expr.featureState("active"), false);

type WidthStops = readonly (readonly [number, number])[];

const roadBorderTotalWidth = 1;
const roadWidthInterpolationBase = 1.5;
const expresswayWidthScale = 1.06;
const tunnelBorderDash = [3, 3] as const;
const tunnelBorderWidth = 0.65;
const roadClearanceExtraAtZ15 = expr.toNumber(
  expr.coalesce(expr.get(field("circularClearanceExtraAtZoom15")), 0),
  0,
);
const roadNeedsStructuralButtCap = expr.any(
  expr.eq(expr.get(field("brunnel")), "tunnel"),
  expr.eq(expr.get(field("class")), "steps"),
  expr.eq(expr.get(field("subclass")), "steps"),
);
const roadNeedsControlledSurfaceButtCap = expr.all(
  expr.match<string, boolean>(
    expr.get(field("brunnel")),
    [{ labels: ["tunnel", "bridge"], value: false }],
    true,
  ),
  expr.eq(expr.get(field("foot")), "no"),
  expr.match<string, boolean>(
    expr.get(field("class")),
    [
      {
        labels: [
          "motorway",
          "trunk",
          "primary",
          "motorway_construction",
          "trunk_construction",
          "primary_construction",
        ],
        value: true,
      },
    ],
    false,
  ),
);
const roadLineCap = expr.step<TileflowLineCap>(
  expr.zoom(),
  expr.case<TileflowLineCap>(
    [{ when: roadNeedsStructuralButtCap, value: "butt" }],
    "round",
  ),
  [
    [
      17,
      expr.case<TileflowLineCap>(
        [
          {
            when: expr.any(
              roadNeedsStructuralButtCap,
              roadNeedsControlledSurfaceButtCap,
              expr.gt(roadClearanceExtraAtZ15, 0),
            ),
            value: "butt",
          },
        ],
        "round",
      ),
    ],
  ],
);
const roadLineJoin = zoom.step<TileflowLineJoin>([
  [3, "miter"],
  [14, "round"],
]);
const pathLineCap = zoom.step<TileflowLineCap>([
  [12, "butt"],
  [16, "round"],
]);
const pathLineJoin = zoom.step<TileflowLineJoin>([
  [12, "miter"],
  [16, "round"],
]);
const pathCasingStrokeWidth = zoom.exponential(1.5, [
  [15, 0],
  [15.5, 0.5],
  [18, 1],
  [22, 2],
]);

const pathTunnelCasingWidth = zoom.linear([
  [15, 0],
  [15.5, tunnelBorderWidth],
  [22, tunnelBorderWidth],
]);

const streetsRoadWidths = {
  minor: [
    [3, 0],
    [12, 0.5],
    [18, 20],
    [22, 200],
  ],
  motorway: [
    [3, 0.8],
    [12, 3.2],
    [18, 30],
    [22, 300],
  ],
  primary: [
    [3, 0.8],
    [12, 3],
    [18, 28],
    [22, 280],
  ],
  secondary: [
    [3, 0],
    [12, 2.2],
    [18, 26],
    [22, 260],
  ],
  service: [
    [3, 0],
    [12, 0],
    [14, 0],
    [15, 2.2],
    [18, 10],
    [22, 100],
  ],
  tertiary: [
    [3, 0],
    [12, 2.2],
    [18, 26],
    [22, 260],
  ],
  track: [
    [3, 0],
    [12, 0],
    [14, 0],
    [15, 2.2],
    [18, 10],
    [22, 100],
  ],
  trunk: [
    [3, 0.8],
    [12, 3.2],
    [18, 30],
    [22, 300],
  ],
} as const satisfies Record<string, WidthStops>;

const mapboxMajorRampWidthStops = [
  [3, 0],
  [12, 0.8],
  [18, 20],
  [22, 200],
] as const satisfies WidthStops;
const mapboxArterialRampWidthStops = [
  [3, 0],
  [12, 0.4],
  [18, 18],
  [22, 180],
] as const satisfies WidthStops;
const mapboxPathWidthStops = [
  [12, 0],
  [18, 6],
  [22, 80],
] as const satisfies WidthStops;
const streetsParkPathWidthStops = [
  [12, 0],
  [15, 0.75],
  [16, 1],
  [18, 2],
  [22, 20],
] as const satisfies WidthStops;

function roadWidth(
  widths: WidthStops,
  oneWayScale: number,
  casing = false,
  clearance = true,
  rampWidths?: WidthStops,
) {
  const augmentedWidths = [...widths].sort(([left], [right]) => left - right);
  const widthOutput = (
    level: number,
    width: number,
  ): TileflowDataExpressionInput<number> => {
    const ordinaryWidth =
      oneWayScale === 1
        ? width
        : expr.match<number, number>(
            expr.get(field("oneway")),
            [{ labels: [1, -1], value: width * oneWayScale }],
            width,
          );
    const rampWidth = rampWidths?.find(
      ([rampLevel]) => rampLevel === level,
    )?.[1];
    const surfaceWidth =
      rampWidth === undefined
        ? ordinaryWidth
        : expr.case<number>(
            [{ when: expr.eq(expr.get(field("ramp")), 1), value: rampWidth }],
            ordinaryWidth,
          );
    if (!casing) return surfaceWidth;
    return typeof surfaceWidth === "number"
      ? surfaceWidth + roadBorderTotalWidth
      : expr.add(surfaceWidth, roadBorderTotalWidth);
  };
  const widthStops = augmentedWidths.map(
    ([level, width]) => [level, widthOutput(level, width)] as const,
  );
  const firstWidthStop = widthStops[0];
  if (firstWidthStop === undefined)
    throw new Error("Road widths require at least one zoom stop.");
  const baseWidth = expr.interpolate(
    { base: roadWidthInterpolationBase, kind: "exponential" },
    expr.zoom(),
    [firstWidthStop, ...widthStops.slice(1)],
  );
  const clearanceWidth = clearance
    ? expr.add(
        baseWidth,
        expr.step(expr.zoom(), 0, [
          [
            17,
            expr.multiply(
              roadClearanceExtraAtZ15,
              expr.interpolate({ base: 2, kind: "exponential" }, expr.zoom(), [
                [17, 4],
                [22, 128],
              ]),
            ),
          ],
        ]),
      )
    : baseWidth;
  return clearanceWidth;
}

function roadCasingStrokeWidth() {
  return zoom.linear([
    [14, 0.3],
    [15.5, 0.7],
    [18, 0.85],
    [22, 1.2],
  ]);
}

const tunnelRoadCasingWidth = zoom.linear([
  [15, 0],
  [15.5, tunnelBorderWidth],
  [22, tunnelBorderWidth],
]);

function cyberpunkRoadStyle(
  edgeColor: string,
  widths: WidthStops,
  options: {
    casingMinZoom?: number;
    edgeOpacity?: number;
    minZoom?: number;
    neon?: boolean;
    rampWidths?: WidthStops;
    tunnelVisible?: boolean;
  } = {},
): TileflowRoadClassStyle {
  const {
    casingMinZoom = 14,
    edgeOpacity = 1,
    minZoom,
    neon = false,
    rampWidths,
    tunnelVisible = true,
  } = options;
  const zoomRange = minZoom === undefined ? {} : { minZoom };
  const opacity = zoom.linear([
    [3, 0],
    [3.5, 1],
  ]);
  const fill = {
    ...zoomRange,
    cap: roadLineCap,
    color: zoom.linear([
      [8, neon ? "#0A182B" : "#14283D"],
      [13, neon ? "#091628" : "#1C3449"],
      [15, cyberpunkPalette.road],
    ]),
    join: roadLineJoin,
    opacity,
    width: roadWidth(widths, 1, false, false, rampWidths),
  };
  const casing = {
    ...zoomRange,
    minZoom: Math.max(minZoom ?? 0, casingMinZoom),
    blur: neon ? 1.35 : 0,
    cap: roadLineCap,
    color: edgeColor,
    gapWidth: fill.width,
    join: roadLineJoin,
    opacity: edgeOpacity,
    width: roadCasingStrokeWidth(),
  };

  return {
    surface: { casing, fill },
    bridge: {
      casing: {
        ...casing,
        blur: 0.15,
        opacity: Math.min(1, edgeOpacity + 0.15),
        width: zoom.linear([
          [13, 0.45],
          [16, 1],
          [18, 1.3],
          [22, 1.8],
        ]),
      },
      fill: {
        ...fill,
        color: cyberpunkPalette.roadBridge,
      },
    },
    tunnel: tunnelVisible
      ? {
          casing: {
            ...casing,
            color: edgeColor,
            cap: "butt",
            blur: 0,
            dash: tunnelBorderDash,
            gapWidth: fill.width,
            opacity: edgeOpacity * 0.45,
            width: tunnelRoadCasingWidth,
          },
          fill: {
            ...fill,
            color: cyberpunkPalette.roadTunnel,
            opacity: zoom.linear([
              [3, 0],
              [3.5, 0.8],
            ]),
          },
          hatch: { visible: false },
        }
      : {
          casing: { visible: false },
          fill: { visible: false },
          hatch: { visible: false },
          shadow: { visible: false },
        },
  };
}

function cyberpunkPathRoadStyle(
  color: string,
  widths: WidthStops,
  options: {
    casingColor?: string;
    casingGapWidth?: TileflowLineStyle["gapWidth"];
    casingMinZoom?: number;
    casingWidth?: TileflowLineStyle["width"];
    dash?: TileflowLineStyle["dash"];
    fillOpacity?: TileflowLineStyle["opacity"];
    minZoom?: number;
    steps?: boolean;
    underlay?: TileflowLineStyle;
    width?: TileflowLineStyle["width"];
  } = {},
): TileflowRoadClassStyle {
  const zoomRange =
    options.minZoom === undefined ? {} : { minZoom: options.minZoom };
  const cap = options.steps ? ("butt" as const) : pathLineCap;
  const tunnelCap = "butt" as const;
  const join = options.steps ? ("round" as const) : pathLineJoin;
  const fillWidth = options.width ?? roadWidth(widths, 1, false, false);
  const fill = {
    ...zoomRange,
    cap,
    color,
    ...(options.dash ? { dash: options.dash } : {}),
    join,
    opacity: options.fillOpacity ?? 1,
    width: fillWidth,
  };
  const casing = {
    ...zoomRange,
    minZoom: Math.max(options.minZoom ?? 0, options.casingMinZoom ?? 15),
    cap,
    color: options.casingColor ?? cyberpunkPalette.roadCasing,
    gapWidth: options.casingGapWidth ?? fill.width,
    join,
    opacity: 1,
    width: options.casingWidth ?? pathCasingStrokeWidth,
  };

  return {
    surface: {
      ...(options.underlay ? { shadow: options.underlay } : {}),
      casing,
      fill,
    },
    bridge: {
      ...(options.underlay ? { shadow: options.underlay } : {}),
      casing,
      fill,
    },
    tunnel: {
      ...(options.underlay
        ? { shadow: { ...options.underlay, cap: tunnelCap } }
        : {}),
      casing: {
        ...casing,
        cap: tunnelCap,
        color: cyberpunkPalette.roadCasing,
        dash: tunnelBorderDash,
        gapWidth: fill.width,
        opacity: 1,
        width: pathTunnelCasingWidth,
      },
      fill: {
        ...fill,
        cap: tunnelCap,
        color: "#06152E",
        dash: [1, 0],
        opacity: 1,
      },
      hatch: { visible: false },
    },
  };
}

const unpavedPathCondition = expr.eq(expr.get(field("surface")), "unpaved");
const contextualPathLineWidth = expr.interpolate<number>(
  { base: 1.5, kind: "exponential" },
  expr.zoom(),
  [
    [12, expr.case<number>([{ when: unpavedPathCondition, value: 0 }], 0)],
    [15, expr.case<number>([{ when: unpavedPathCondition, value: 0.75 }], 1)],
    [16, expr.case<number>([{ when: unpavedPathCondition, value: 1 }], 1.5)],
    [17, expr.case<number>([{ when: unpavedPathCondition, value: 1.4 }], 3)],
    [18, expr.case<number>([{ when: unpavedPathCondition, value: 2 }], 4)],
    [19, expr.case<number>([{ when: unpavedPathCondition, value: 3.7 }], 8)],
    [20, expr.case<number>([{ when: unpavedPathCondition, value: 7.5 }], 16)],
    [22, expr.case<number>([{ when: unpavedPathCondition, value: 20 }], 60)],
  ],
);
const contextualPathCasingWidth = expr.interpolate<number>(
  { base: 1.5, kind: "exponential" },
  expr.zoom(),
  [
    [15, expr.case<number>([{ when: unpavedPathCondition, value: 0 }], 0)],
    [15.5, expr.case<number>([{ when: unpavedPathCondition, value: 0 }], 0.5)],
    [18, expr.case<number>([{ when: unpavedPathCondition, value: 0 }], 1)],
    [22, expr.case<number>([{ when: unpavedPathCondition, value: 0 }], 2)],
  ],
);
const contextualPathClasses = [
  "pathway",
  "footway",
  "steps",
  "pedestrian",
] as const;

const cyberpunkOverviewLandcoverColor = expr.match<string, string>(
  expr.get(field("class")),
  [
    { labels: "barren", value: "#14233C" },
    { labels: "crop", value: "#142B3B" },
    { labels: "grass", value: "#143037" },
    { labels: "shrub", value: "#16313A" },
    { labels: "snow", value: "#29465E" },
    { labels: "trees", value: "#0E2B32" },
    { labels: "urban", value: "#443052" },
  ],
  "rgba(0, 0, 0, 0)",
);

const cyberpunkRoadLabelIds = [
  "labels.roads.motorway",
  "labels.roads.trunk",
  "labels.roads.primary",
  "labels.roads.secondary",
  "labels.roads.tertiary",
  "labels.roads.minor",
  "labels.roads.service",
] as const;

const cyberpunkPrimaryPlaceLabelIds = [
  "labels.places.country",
  "labels.places.city",
] as const;

// Oxanium's packaged alphabet is Latin; use the producer's transliteration when supplied.
const cyberpunkPlaceName = expr.coalesce(
  expr.get(field("nameLatin")),
  expr.get(field("name")),
  expr.get(field("nameEnglish")),
  "",
);

const cyberpunkSecondaryPlaceLabelIds = [
  "labels.places.other",
  "labels.places.neighborhood",
  "labels.places.village",
  "labels.places.town",
  "labels.places.state",
  "labels.places.continent",
] as const;

function cyberpunkRenderOperationName(
  prefix: string,
  ...parts: string[]
): string {
  return `${prefix}${parts
    .flatMap((part) => part.split(/[^A-Za-z0-9]+/u))
    .filter(Boolean)
    .map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`)
    .join("")}`;
}

function cyberpunkLabelRenderStack(): TileflowNamedRenderStack {
  return Object.fromEntries([
    ...cyberpunkRoadLabelIds.map(
      (target) =>
        [
          cyberpunkRenderOperationName(
            "roadLabel",
            target.split(".").at(-1) ?? "",
          ),
          refineRenderTarget({
            renderer: "symbol",
            requirements: ["roads"],
            target,
            style: {
              spacing: zoom.linear([
                [12, 350],
                [16, 500],
                [20, 800],
              ]),
              text: {
                haloWidth: 0.9,
                color:
                  target.endsWith("minor") || target.endsWith("service")
                    ? "#8DA9C6"
                    : "#C9E4F7",
                size: zoom.linear([
                  [10, 9],
                  [
                    16,
                    target.endsWith("minor") || target.endsWith("service")
                      ? 10.5
                      : 12,
                  ],
                  [
                    19,
                    target.endsWith("minor") || target.endsWith("service")
                      ? 12
                      : 14,
                  ],
                ]),
              },
            },
          }),
        ] as const,
    ),
    ...cyberpunkPrimaryPlaceLabelIds.map(
      (target) =>
        [
          cyberpunkRenderOperationName(
            "placeLabel",
            target.split(".").at(-1) ?? "",
          ),
          refineRenderTarget({
            renderer: "symbol",
            target,
            style: target.endsWith("country")
              ? {
                  maxZoom: 5,
                  text: {
                    field: cyberpunkPlaceName,
                    haloWidth: 1.5,
                    color: "#91CEDF",
                    letterSpacing: 0.18,
                    size: zoom.linear([
                      [1, 10],
                      [3, 13],
                      [5, 16],
                    ]),
                    opacity: zoom.linear([
                      [1, 0.9],
                      [3.5, 0.9],
                      [5, 0],
                    ]),
                  },
                }
              : {
                  text: {
                    field: cyberpunkPlaceName,
                    haloWidth: 1.6,
                    haloBlur: 0.4,
                    anchor: "left",
                    offset: [0.7, 0],
                    color: expr.case<string>(
                      [
                        {
                          when: expr.eq(
                            expr.toNumber(expr.get(field("capital")), 0),
                            2,
                          ),
                          value: "#FFF0A6",
                        },
                      ],
                      "#D7F4FF",
                    ),
                    letterSpacing: 0.1,
                    size: zoom.linear([
                      [2, 10],
                      [5, 12],
                      [9, 16],
                      [12, 19],
                    ]),
                    opacity: zoom.linear([
                      [2, 0.85],
                      [6, 1],
                      [12, 1],
                      [14.5, 0],
                    ]),
                  },
                },
          }),
        ] as const,
    ),
    ...cyberpunkSecondaryPlaceLabelIds.map(
      (target) =>
        [
          cyberpunkRenderOperationName(
            "placeLabel",
            target.split(".").at(-1) ?? "",
          ),
          refineRenderTarget({
            renderer: "symbol",
            target,
            style: {
              ...(target.endsWith("state") ? { maxZoom: 8 } : {}),
              text: {
                field: cyberpunkPlaceName,
                color: target.endsWith("continent")
                  ? "#6299BA"
                  : target.endsWith("state")
                    ? "#8394B4"
                    : cyberpunkPalette.labelMuted,
                ...(target.endsWith("continent")
                  ? {
                      letterSpacing: 0.28,
                      size: zoom.linear([
                        [0, 12],
                        [2, 17],
                      ]),
                    }
                  : {}),
                ...(target.endsWith("state")
                  ? {
                      letterSpacing: 0.15,
                      size: 10,
                      opacity: zoom.linear([
                        [4, 0.5],
                        [6, 0.7],
                        [8, 0],
                      ]),
                    }
                  : {}),
                haloWidth: 1.1,
                ...(target.endsWith("neighborhood")
                  ? {
                      color: "#AFD7E6",
                      letterSpacing: 0.2,
                      size: zoom.linear([
                        [11, 11],
                        [14, 15],
                        [16, 17],
                      ]),
                      opacity: zoom.linear([
                        [11, 0.65],
                        [14, 0.95],
                        [16, 0.5],
                        [17, 0],
                      ]),
                    }
                  : {}),
              },
            },
          }),
        ] as const,
    ),
  ]);
}

function cyberpunkSettlementRenderStack(): TileflowNamedRenderStack {
  const cityRank = (rank: number): TileflowRenderSelector => ({
    kind: "all",
    selectors: [
      { kind: "geometry", geometry: "point" },
      { kind: "compare", field: "class", operator: "eq", value: "city" },
      {
        kind: "any",
        selectors: [
          {
            kind: "compare",
            field: "capital",
            operator: "eq",
            value: 2,
            coerce: "number",
            fallback: 0,
          },
          {
            kind: "all",
            selectors: [
              { kind: "has", field: "rank" },
              {
                kind: "compare",
                field: "rank",
                operator: "lte",
                value: rank,
                coerce: "number",
                fallback: 99,
              },
            ],
          },
        ],
      },
    ],
  });
  const selector: TileflowRenderSelector = {
    kind: "step",
    fallback: cityRank(2),
    stops: [
      { zoom: 5, selector: cityRank(4) },
      { zoom: 7, selector: cityRank(5) },
    ],
  };
  const cityColor = expr.case<string>(
    [
      {
        when: expr.eq(expr.toNumber(expr.get(field("capital")), 0), 2),
        value: "#FFF0A6",
      },
    ],
    "#64D8EA",
  );
  return {
    settlementHalo: renderPass({
      feature: "place",
      renderer: "circle",
      placement: "below-labels",
      selector,
      style: {
        minZoom: 3,
        maxZoom: 12,
        color: cityColor,
        blur: 0.8,
        radius: zoom.linear([
          [3, 4],
          [7, 8],
          [10, 10],
        ]),
        opacity: zoom.linear([
          [3, 0],
          [4, 0.16],
          [9, 0.16],
          [12, 0],
        ]),
      },
    }),
    settlementNode: renderPass({
      feature: "place",
      renderer: "circle",
      placement: { above: "labels.render.settlementHalo" },
      selector,
      style: {
        minZoom: 3,
        maxZoom: 12,
        color: "#081426",
        strokeColor: cityColor,
        strokeWidth: 1.1,
        strokeOpacity: zoom.linear([
          [3, 0],
          [4, 0.9],
          [10, 0.9],
          [12, 0],
        ]),
        radius: zoom.linear([
          [3, 1.6],
          [7, 2.4],
          [10, 3],
        ]),
        opacity: zoom.linear([
          [3, 0],
          [4, 1],
          [10, 1],
          [12, 0],
        ]),
      },
    }),
  };
}

function cyberpunkPathRenderStack(): TileflowNamedRenderStack {
  return Object.fromEntries(
    contextualPathClasses.flatMap((roadClass) =>
      (["surface", "bridge"] as const).flatMap((structure) => [
        [
          cyberpunkRenderOperationName("path", roadClass, structure, "fill"),
          refineRenderTarget({
            renderer: "line",
            target: `roads.classes.${roadClass}.${structure}.fill`,
            style: {
              color: roadClass === "steps" ? "#41687B" : "#173742",
              ...(roadClass === "steps" ? { dash: [0.18, 0.15] as const } : {}),
              width: contextualPathLineWidth,
            },
          }),
        ],
        [
          cyberpunkRenderOperationName("path", roadClass, structure, "casing"),
          refineRenderTarget({
            renderer: "line",
            target: `roads.classes.${roadClass}.${structure}.casing`,
            style: {
              color: "#285366",
              opacity: 0.6,
              gapWidth: roadClass === "steps" ? 0 : contextualPathLineWidth,
              width:
                roadClass === "steps"
                  ? contextualPathLineWidth
                  : contextualPathCasingWidth,
            },
          }),
        ],
      ]),
    ),
  );
}

function cyberpunkRoadImportanceSelector(
  minimum: 1 | 2 | 3 | 4,
  unobstructed: boolean,
): TileflowRenderSelector {
  const legacyClasses = {
    4: ["motorway", "trunk"],
    1: ["motorway", "trunk", "primary", "secondary", "tertiary"],
    2: ["motorway", "trunk", "primary", "secondary"],
    3: ["motorway", "trunk", "primary"],
  }[minimum];
  return {
    kind: "all",
    selectors: [
      { kind: "geometry", geometry: "line" },
      {
        kind: "any",
        selectors: [
          {
            kind: "all",
            selectors: [
              { kind: "has", field: "importanceTier" },
              {
                kind: "compare",
                field: "importanceTier",
                operator: "gte",
                value: minimum,
                coerce: "number",
                fallback: 0,
              },
            ],
          },
          {
            kind: "all",
            selectors: [
              {
                kind: "not",
                selector: { kind: "has", field: "importanceTier" },
              },
              {
                kind: "in",
                field: "class",
                values: legacyClasses,
                fallback: "",
              },
            ],
          },
        ],
      },
      ...(unobstructed
        ? ([
            {
              kind: "compare",
              field: "ramp",
              operator: "ne",
              value: 1,
              coerce: "number",
              fallback: 0,
            },
            {
              kind: "compare",
              field: "brunnel",
              operator: "ne",
              value: "tunnel",
              fallback: "",
            },
          ] satisfies TileflowRenderSelector[])
        : []),
    ],
  };
}

function cyberpunkPrincipalRoadRenderStack(): TileflowNamedRenderStack {
  const principalRoadColor = expr.match<string, string>(
    cyberpunkRoadClass,
    [{ labels: ["trunk", "secondary"], value: cyberpunkPalette.neonMagenta }],
    cyberpunkPalette.neonCyan,
  );
  const roadWidthScale = expr.match<number, number>(
    cyberpunkRoadImportanceTier,
    [
      { labels: 4, value: 1 },
      { labels: 3, value: 0.9 },
      { labels: 2, value: 0.72 },
      { labels: 1, value: 0.7 },
    ],
    0,
  );
  const roadCoreOpacity = expr.match<number, number>(
    cyberpunkRoadImportanceTier,
    [
      { labels: 4, value: 0.94 },
      { labels: 3, value: 0.82 },
      { labels: 2, value: 0.62 },
      { labels: 1, value: 0.58 },
    ],
    0,
  );
  const roadCoreStructureAttenuation = expr.case<number>(
    [
      { when: expr.eq(expr.get(field("brunnel")), "tunnel"), value: 0.32 },
      { when: expr.eq(expr.get(field("ramp")), 1), value: 0.55 },
    ],
    1,
  );
  // National routes first; secondary roads and local avenues enter as the map opens up.
  const overviewSelector = (
    minimum: 1 | 2 | 3,
    unobstructed: boolean,
  ): TileflowRenderSelector => ({
    kind: "step",
    fallback: cyberpunkRoadImportanceSelector(4, unobstructed),
    stops: [
      { zoom: 6, selector: cyberpunkRoadImportanceSelector(3, unobstructed) },
      {
        zoom: 9,
        selector: cyberpunkRoadImportanceSelector(
          Math.max(2, minimum) as 2 | 3,
          unobstructed,
        ),
      },
      {
        zoom: 12,
        selector: cyberpunkRoadImportanceSelector(minimum, unobstructed),
      },
    ],
  });
  return {
    principalNeonAura: renderPass({
      placement: { above: "roads.classes.motorway.surface.fill" },
      feature: "road",
      renderer: "line",
      selector: overviewSelector(3, true),
      style: {
        blur: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [8, 2],
          [10, 3.5],
          [12, 8],
          [16, 12],
          [18, 14],
          [22, 18],
        ]),
        cap: "round",
        color: principalRoadColor,
        join: "round",
        minZoom: 8,
        opacity: expr.match<number, number>(
          cyberpunkRoadImportanceTier,
          [
            { labels: 4, value: 0.24 },
            { labels: 3, value: 0.17 },
          ],
          0,
        ),
        width: expr.interpolate(
          { base: 1.5, kind: "exponential" },
          expr.zoom(),
          [
            [8, 0],
            [10, 0.35],
            [11, 0.9],
            [12, expr.multiply(2.5, roadWidthScale)],
            [15, expr.multiply(7, roadWidthScale)],
            [16, expr.multiply(13.5, roadWidthScale)],
            [18, expr.multiply(24, roadWidthScale)],
            [22, expr.multiply(70, roadWidthScale)],
          ],
        ),
      },
    }),
    principalNeonGlow: renderPass({
      placement: { above: "roads.render.principalNeonAura" },
      feature: "road",
      renderer: "line",
      selector: overviewSelector(1, true),
      style: {
        blur: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [6, 0.8],
          [8, 1.5],
          [10, 2.5],
          [12, 4],
          [16, 5],
          [18, 6.5],
          [22, 9],
        ]),
        cap: "round",
        color: principalRoadColor,
        join: "round",
        minZoom: 6,
        opacity: expr.match<number, number>(
          cyberpunkRoadImportanceTier,
          [
            { labels: 4, value: 0.54 },
            { labels: 3, value: 0.42 },
            { labels: 2, value: 0.26 },
            { labels: 1, value: 0.16 },
          ],
          0,
        ),
        width: expr.interpolate(
          { base: 1.5, kind: "exponential" },
          expr.zoom(),
          [
            [6, 0],
            [8, 0.18],
            [10, 0.55],
            [12, expr.multiply(1.3, roadWidthScale)],
            [15, expr.multiply(3.6, roadWidthScale)],
            [16, expr.multiply(7.2, roadWidthScale)],
            [18, expr.multiply(12, roadWidthScale)],
            [22, expr.multiply(34, roadWidthScale)],
          ],
        ),
      },
    }),
    principalNeonCore: renderPass({
      placement: { above: "roads.render.principalNeonGlow" },
      feature: "road",
      renderer: "line",
      selector: overviewSelector(1, false),
      style: {
        blur: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [3, 0.2],
          [8, 0.35],
          [10, 0.5],
          [12, 0.75],
          [18, 0.35],
        ]),
        cap: "round",
        color: principalRoadColor,
        join: "round",
        minZoom: 3,
        opacity: expr.multiply(roadCoreOpacity, roadCoreStructureAttenuation),
        width: expr.interpolate(
          { base: 1.5, kind: "exponential" },
          expr.zoom(),
          [
            [3, 0],
            [4, 0.4],
            [8, expr.multiply(0.95, roadWidthScale)],
            [10, expr.multiply(1.2, roadWidthScale)],
            [12, expr.multiply(1.4, roadWidthScale)],
            [15, expr.multiply(2.4, roadWidthScale)],
            [16, expr.multiply(3, roadWidthScale)],
            [18, expr.multiply(5, roadWidthScale)],
            [22, expr.multiply(15, roadWidthScale)],
          ],
        ),
      },
    }),
  };
}

function cyberpunkBuildingImportanceSelector(
  minimum: 2 | 3,
): TileflowRenderSelector {
  return {
    kind: "all",
    selectors: [
      { kind: "geometry", geometry: "polygon" },
      {
        kind: "any",
        selectors: [
          {
            kind: "all",
            selectors: [
              { kind: "has", field: "importanceTier" },
              {
                kind: "compare",
                field: "importanceTier",
                operator: "gte",
                value: minimum,
                coerce: "number",
                fallback: 0,
              },
            ],
          },
          {
            kind: "all",
            selectors: [
              {
                kind: "not",
                selector: { kind: "has", field: "importanceTier" },
              },
              {
                kind: "compare",
                field: "buildingTone",
                operator: "eq",
                value: "destination",
                fallback: "",
              },
              ...(minimum === 3
                ? [
                    {
                      kind: "compare",
                      field: "renderHeight",
                      operator: "gte",
                      value: 36,
                      coerce: "number",
                      fallback: 0,
                    } as const,
                  ]
                : []),
            ],
          },
        ],
      },
    ],
  };
}

function cyberpunkBuildingRenderStack(): TileflowNamedRenderStack {
  const activitySelector = cyberpunkBuildingImportanceSelector(2);
  return {
    cityFootprints: renderPass({
      placement: "above-roads",
      feature: "building",
      renderer: "fill",
      selector: { kind: "geometry", geometry: "polygon" },
      style: {
        minZoom: 14,
        color: cyberpunkBuildingGhostFill,
        opacity: zoom.linear([
          [14, 0],
          [15, 0.56],
        ]),
      },
    }),
    cityOutline: renderPass({
      placement: { above: "land.render.cityFootprints" },
      feature: "building",
      renderer: "line",
      selector: { kind: "geometry", geometry: "polygon" },
      style: {
        minZoom: 14,
        color: cyberpunkBuildingGhostCore,
        opacity: cyberpunkBuildingGhostCoreOpacity,
        width: zoom.linear([
          [14, 0.25],
          [15, 0.55],
          [16, 0.75],
          [18, 0.9],
          [22, 1.8],
        ]),
      },
    }),
    cityRelief: renderPass({
      placement: "above-buildings",
      feature: "building",
      renderer: "extrusion",
      selector: {
        kind: "all",
        selectors: [
          { kind: "geometry", geometry: "polygon" },
          {
            kind: "compare",
            field: "hide3d",
            operator: "ne",
            value: 1,
            coerce: "number",
            fallback: 0,
          },
        ],
      },
      style: {
        minZoom: 15,
        visibilityGroup: "building",
        // Low relief with enough wall depth to remain readable at neighbourhood zooms.
        height: expr.min(
          14,
          expr.max(4, expr.multiply(cyberpunkBuildingHeight2d, 0.32)),
        ),
        base: 0,
        color: cyberpunkBuildingReliefMaterial,
        opacity: 0.42,
        verticalGradient: true,
      },
    }),
    ghostAura: renderPass({
      placement: { above: "land.render.cityOutline" },
      feature: "building",
      renderer: "line",
      selector: activitySelector,
      style: {
        blur: 3,
        cap: "round",
        color: cyberpunkBuildingGhostCore,
        join: "round",
        minZoom: 15,
        opacity: expr.match<number, number>(
          cyberpunkBuildingImportanceTier,
          [
            { labels: 4, value: 0.42 },
            { labels: 3, value: 0.23 },
            { labels: 2, value: 0.2 },
          ],
          0,
        ),
        width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [15, 3],
          [16, 6],
          [18, 9],
          [22, 18],
        ]),
      },
    }),
    ghostGlow: renderPass({
      placement: { above: "land.render.ghostAura" },
      feature: "building",
      renderer: "line",
      selector: activitySelector,
      style: {
        blur: 0.05,
        cap: "round",
        color: cyberpunkBuildingGhostCore,
        gapWidth: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [15, 0.7],
          [16, 1.1],
          [18, 1.8],
          [22, 4],
        ]),
        join: "round",
        minZoom: 15,
        opacity: expr.case<number>(
          [
            {
              when: cyberpunkBuildingIsSelectedDestination,
              value: expr.match<number, number>(
                cyberpunkBuildingImportanceTier,
                [
                  { labels: 4, value: 0.62 },
                  { labels: 3, value: 0.44 },
                  { labels: 2, value: 0.23 },
                ],
                0,
              ),
            },
          ],
          expr.match<number, number>(
            cyberpunkBuildingImportanceTier,
            [
              { labels: 4, value: 0.56 },
              { labels: 3, value: 0.42 },
              { labels: 2, value: 0.2 },
            ],
            0,
          ),
        ),
        width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [15, 0.35],
          [16, 0.5],
          [18, 0.8],
          [22, 1.6],
        ]),
      },
    }),
  };
}

function cyberpunkPoiSelector(
  maxRank: number,
  maxSize: number,
): TileflowRenderSelector {
  return {
    kind: "all",
    selectors: [
      { kind: "geometry", geometry: "point" },
      { kind: "has", field: "poiFilterRank" },
      {
        kind: "compare",
        field: "poiFilterRank",
        operator: "gte",
        value: 0,
        coerce: "number",
        fallback: 6,
      },
      {
        kind: "compare",
        field: "poiFilterRank",
        operator: "lte",
        value: maxRank,
        coerce: "number",
        fallback: 6,
      },
      { kind: "has", field: "poiSizeRank" },
      {
        kind: "compare",
        field: "poiSizeRank",
        operator: "gte",
        value: 0,
        coerce: "number",
        fallback: 17,
      },
      {
        kind: "compare",
        field: "poiSizeRank",
        operator: "lte",
        value: maxSize,
        coerce: "number",
        fallback: 17,
      },
    ],
  };
}

function cyberpunkDestinationRenderStack(): TileflowNamedRenderStack {
  // City scale shows anchors; local destinations enter only as streets separate.
  const cityAnchor: TileflowRenderSelector = {
    kind: "all",
    selectors: [
      cyberpunkPoiSelector(1, 16),
      {
        kind: "any",
        selectors: [
          {
            kind: "compare",
            field: "poiCategory",
            operator: "eq",
            value: "transport",
          },
          {
            kind: "all",
            selectors: [
              {
                kind: "in",
                field: "poiCategory",
                values: ["landmark", "arts-entertainment", "park-nature"],
              },
              {
                kind: "compare",
                field: "poiSizeRank",
                operator: "lte",
                value: 8,
                coerce: "number",
                fallback: 17,
              },
            ],
          },
        ],
      },
    ],
  };
  const hudPoiSelector: TileflowRenderSelector = {
    kind: "step",
    fallback: cityAnchor,
    stops: [
      {
        zoom: 15.5,
        selector: {
          kind: "any",
          selectors: [cyberpunkPoiSelector(1, 16), cyberpunkPoiSelector(2, 12)],
        },
      },
      { zoom: 17, selector: cyberpunkPoiSelector(2, 16) },
    ],
  };
  const lightSelector: TileflowRenderSelector = {
    kind: "all",
    selectors: [
      cyberpunkPoiSelector(1, 16),
      {
        kind: "any",
        selectors: [
          {
            kind: "compare",
            field: "poiCategory",
            operator: "eq",
            value: "transport",
          },
          {
            kind: "all",
            selectors: [
              {
                kind: "in",
                field: "poiCategory",
                values: ["landmark", "arts-entertainment", "medical"],
              },
              {
                kind: "compare",
                field: "poiSizeRank",
                operator: "lte",
                value: 6,
                coerce: "number",
                fallback: 17,
              },
            ],
          },
        ],
      },
    ],
  };
  return {
    destinationLightPool: renderPass({
      placement: "below-roads",
      feature: "poi",
      renderer: "circle",
      selector: lightSelector,
      style: {
        minZoom: 14,
        color: cyberpunkPoiImportanceColor,
        blur: 1,
        radius: zoom.linear([
          [14, 12],
          [16, 36],
          [18, 72],
          [20, 100],
        ]),
        opacity: zoom.linear([
          [14, 0],
          [15, 0.13],
          [17, 0.2],
          [20, 0.14],
        ]),
        pitchAlignment: "map",
        pitchScale: "map",
      },
    }),
    destinationScanRing: renderPass({
      placement: "below-labels",
      feature: "poi",
      renderer: "circle",
      selector: hudPoiSelector,
      style: {
        minZoom: 13,
        color: "rgba(0, 0, 0, 0)",
        radius: zoom.linear([
          [13, 9],
          [17, 14],
          [20, 18],
        ]),
        strokeColor: cyberpunkPoiImportanceColor,
        strokeOpacity: expr.case(
          [{ when: cyberpunkPoiIsActive, value: 0.9 }],
          0,
        ),
        strokeWidth: 1,
      },
    }),
    destinationSign: renderPass({
      placement: "below-labels",
      feature: "poi",
      renderer: "symbol",
      selector: hudPoiSelector,
      style: {
        minZoom: 13,
        priority: expr.subtract(0, cyberpunkPoiPlacementPriority),
        icon: {
          image: cyberpunkPoiSign,
          allowOverlap: false,
          ignorePlacement: false,
          padding: 7,
          optional: false,
          size: zoom.linear([
            [13, 0.68],
            [16, 0.82],
            [18, 0.95],
            [21, 1.1],
          ]),
          opacity: zoom.linear([
            [13, 0.65],
            [15, 0.95],
          ]),
        },
        text: {
          field: expr.coalesce(expr.get(field("name")), ""),
          font: "Oxanium Medium",
          transform: "uppercase",
          color: cyberpunkPoiImportanceColor,
          anchor: "top",
          offset: [0, 1.45],
          allowOverlap: false,
          ignorePlacement: false,
          optional: true,
          haloColor: cyberpunkPalette.labelHalo,
          haloWidth: 1.15,
          letterSpacing: 0.055,
          maxWidth: 11,
          padding: 6,
          size: zoom.linear([
            [13, 9],
            [16, 10.5],
            [19, 11.5],
          ]),
          opacity: zoom.linear([
            [13, 0.6],
            [15, 0.92],
          ]),
        },
      },
    }),
  };
}

function cyberpunkWaterRenderStack(): TileflowNamedRenderStack {
  const polygonSelector = { kind: "geometry", geometry: "polygon" } as const;
  return {
    shoreAura: renderPass({
      placement: { below: "water.render.shoreCore" },
      feature: "water",
      renderer: "line",
      selector: polygonSelector,
      style: {
        blur: 2,
        color: cyberpunkPalette.neonCyan,
        minZoom: 0,
        opacity: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [0, 0.08],
          [4, 0.13],
          [8, 0.16],
        ]),
        width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [0, 1.8],
          [4, 2.5],
          [8, 1],
          [14, 3],
          [18, 7],
        ]),
      },
    }),
    shoreCore: renderPass({
      placement: { below: "water.bodies.fill" },
      feature: "water",
      renderer: "line",
      selector: polygonSelector,
      style: {
        blur: 0.15,
        color: cyberpunkPalette.neonCyan,
        minZoom: 0,
        opacity: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [0, 0.65],
          [4, 0.7],
          [8, 0.58],
        ]),
        width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [0, 1.5],
          [4, 1.6],
          [8, 0.3],
          [14, 0.7],
          [18, 1.5],
        ]),
      },
    }),
  };
}

function cyberpunkLandRenderStack(): TileflowNamedRenderStack {
  const polygonSelector = { kind: "geometry", geometry: "polygon" } as const;
  return {
    sectorWash: renderPass({
      placement: { above: "land.landuse.residential.fill" },
      feature: "landuse",
      renderer: "fill",
      selector: {
        kind: "all",
        selectors: [
          polygonSelector,
          {
            kind: "in",
            field: "class",
            values: [
              "business_area",
              "commercial",
              "retail",
              "industrial",
              "railway",
              "education",
              "school",
              "university",
              "hospital",
              "medical",
              "government",
            ],
          },
        ],
      },
      style: {
        minZoom: 10,
        color: expr.match<string, string>(
          expr.get(field("class")),
          [
            {
              labels: ["business_area", "commercial", "retail"],
              value: "#35152F",
            },
            { labels: ["industrial", "railway"], value: "#29272C" },
            { labels: ["education", "school", "university"], value: "#22203F" },
            { labels: ["hospital", "medical"], value: "#321D30" },
          ],
          "#142D39",
        ),
        opacity: zoom.linear([
          [10, 0],
          [12, 0.62],
          [15, 0.48],
          [18, 0.3],
        ]),
      },
    }),
    businessGrid: renderPass({
      placement: { above: "land.render.sectorWash" },
      feature: "landuse",
      renderer: "fill",
      selector: {
        kind: "all",
        selectors: [
          polygonSelector,
          {
            kind: "in",
            field: "class",
            values: ["business_area", "commercial", "retail", "industrial"],
            fallback: "",
          },
        ],
      },
      style: {
        minZoom: 15,
        opacity: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [15, 0],
          [16, 0.035],
          [18, 0.065],
          [22, 0.08],
        ]),
        pattern: "cyberpunk-data-grid",
      },
    }),
    sectorTrace: renderPass({
      placement: { above: "land.render.businessGrid" },
      feature: "landuse",
      renderer: "line",
      selector: {
        kind: "all",
        selectors: [
          polygonSelector,
          {
            kind: "in",
            field: "class",
            values: [
              "business_area",
              "commercial",
              "retail",
              "industrial",
              "education",
              "school",
              "university",
              "hospital",
              "medical",
            ],
            fallback: "",
          },
        ],
      },
      style: {
        blur: 0,
        color: expr.match<string, string>(
          expr.coalesce(expr.get(field("class")), ""),
          [
            {
              labels: ["business_area", "commercial", "retail"],
              value: cyberpunkPalette.activityInk,
            },
            { labels: ["industrial", "railway"], value: "#BC915B" },
            {
              labels: ["hospital", "medical"],
              value: cyberpunkPalette.destinationInk,
            },
            {
              labels: ["education", "school", "university"],
              value: cyberpunkPalette.destinationInk,
            },
          ],
          "#7657FF",
        ),
        minZoom: 11,
        opacity: zoom.linear([
          [11, 0.12],
          [14, 0.25],
          [18, 0.16],
        ]),
        width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [11, 0.3],
          [16, 0.7],
          [20, 1.2],
        ]),
      },
    }),
    urbanParkTrace: renderPass({
      placement: { above: "land.landcover.urbanPark.fill" },
      feature: "landcover",
      renderer: "line",
      selector: {
        kind: "all",
        selectors: [
          polygonSelector,
          { kind: "compare", field: "class", operator: "eq", value: "grass" },
          { kind: "in", field: "subclass", values: ["park", "garden"] },
        ],
      },
      style: {
        blur: 0.1,
        color: cyberpunkPalette.natureInk,
        minZoom: 11,
        opacity: 0.35,
        width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
          [11, 0.35],
          [16, 0.9],
          [20, 1.5],
        ]),
      },
    }),
  };
}

function cyberpunkTransitStyle() {
  const base = mapboxRailTransitStyle("#C19A66");
  return {
    ...base,
    ferry: { minZoom: 9, opacity: 0.22 },
    rail: {
      ...base.rail,
      surface: {
        ...base.rail?.surface,
        minZoom: 11,
        opacity: zoom.linear([
          [11, 0.4],
          [14, 0.7],
          [18, 0.85],
        ]),
      },
      bridge: {
        ...base.rail?.bridge,
        minZoom: 11,
        color: "#E6BD83",
        opacity: 0.85,
      },
      tunnel: {
        minZoom: 14,
        color: "#85765E",
        width: 0.7,
        dash: [4, 4],
        opacity: 0.35,
      },
    },
    railHatching: {
      ...base.railHatching,
      surface: {
        ...base.railHatching?.surface,
        opacity: zoom.linear([
          [15, 0],
          [17, 0.45],
        ]),
      },
      bridge: {
        ...base.railHatching?.bridge,
        opacity: zoom.linear([
          [15, 0],
          [17, 0.55],
        ]),
      },
    },
    serviceRail: {
      ...base.serviceRail,
      surface: { ...base.serviceRail?.surface, minZoom: 15, opacity: 0.32 },
      bridge: { ...base.serviceRail?.bridge, minZoom: 15, opacity: 0.42 },
    },
  };
}

const circularRoadRadiusAtZ15 = expr.toNumber(
  expr.get(field("circularRadiusAtZoom15")),
  0,
);
const circularRoadRadiusMetres = expr.toNumber(
  expr.get(field("circularRadiusMeters")),
  0,
);
const circularRoadOuterRadiusMetres = expr.toNumber(
  expr.get(field("circularOuterRadiusMeters")),
  0,
);
const circularRoadInnerRadiusMetres = expr.toNumber(
  expr.get(field("circularInnerRadiusMeters")),
  0,
);
const hasPhysicalCircularRadii = expr.all(
  expr.gt(circularRoadRadiusMetres, 0),
  expr.gt(circularRoadOuterRadiusMetres, circularRoadInnerRadiusMetres),
  expr.gte(circularRoadInnerRadiusMetres, 0),
);
const circularRoadBaseWidth = expr.match<string, number>(
  expr.coalesce(expr.get(field("class")), "minor"),
  [
    { labels: "motorway", value: 6 },
    { labels: "trunk", value: 5.5 },
    { labels: "primary", value: 5 },
    { labels: "secondary", value: 4.5 },
    { labels: "tertiary", value: 4 },
    { labels: "service", value: 2.5 },
    { labels: "track", value: 2 },
  ],
  3,
);

function circularRoadLegacyScale(level: number) {
  const interpolationBase = 1.35;
  const progress =
    (interpolationBase ** (level - 15) - 1) /
    (interpolationBase ** (22 - 15) - 1);
  return 1 + progress * 1.2;
}

function circularRoadWidthAtLevel(
  level: number,
): TileflowDataExpressionInput<number> {
  const scale = circularRoadLegacyScale(level);
  return level === 15
    ? circularRoadBaseWidth
    : expr.multiply(circularRoadBaseWidth, scale);
}

function circularRoadCenterlineRadiusAtLevel(level: number) {
  return level === 15
    ? circularRoadRadiusAtZ15
    : expr.multiply(circularRoadRadiusAtZ15, 2 ** (level - 15));
}

function circularRoadInnerRadiusAtLevel(level: number, casing: boolean) {
  const centerlineRadius = circularRoadCenterlineRadiusAtLevel(level);
  const physicalInnerRadius = expr.multiply(
    centerlineRadius,
    expr.divide(circularRoadInnerRadiusMetres, circularRoadRadiusMetres),
  );
  const fallbackInnerRadius = expr.subtract(
    centerlineRadius,
    expr.divide(circularRoadWidthAtLevel(level), 2),
  );
  const innerRadius = expr.case<number>(
    [{ when: hasPhysicalCircularRadii, value: physicalInnerRadius }],
    fallbackInnerRadius,
  );
  return expr.max(
    0,
    casing ? expr.subtract(innerRadius, roadBorderTotalWidth / 2) : innerRadius,
  );
}

function circularRoadInnerRadius(casing: boolean) {
  return expr.interpolate({ kind: "linear" }, expr.zoom(), [
    [15, circularRoadInnerRadiusAtLevel(15, casing)],
    [16, circularRoadInnerRadiusAtLevel(16, casing)],
    [17, circularRoadInnerRadiusAtLevel(17, casing)],
    [18, circularRoadInnerRadiusAtLevel(18, casing)],
    [19, circularRoadInnerRadiusAtLevel(19, casing)],
    [20, circularRoadInnerRadiusAtLevel(20, casing)],
    [21, circularRoadInnerRadiusAtLevel(21, casing)],
    [22, circularRoadInnerRadiusAtLevel(22, casing)],
  ]);
}

function circularRoadStrokeWidthAtLevel(level: number, casing: boolean) {
  const fallbackWidth = circularRoadWidthAtLevel(level);
  const centerlineRadius = circularRoadCenterlineRadiusAtLevel(level);
  const physicalWidth = expr.multiply(
    centerlineRadius,
    expr.divide(
      expr.subtract(
        circularRoadOuterRadiusMetres,
        circularRoadInnerRadiusMetres,
      ),
      circularRoadRadiusMetres,
    ),
  );
  const physicalOutput = casing
    ? expr.add(physicalWidth, roadBorderTotalWidth)
    : physicalWidth;
  const fallbackOutput = casing
    ? expr.add(fallbackWidth, roadBorderTotalWidth)
    : fallbackWidth;
  return expr.case<number>(
    [{ when: hasPhysicalCircularRadii, value: physicalOutput }],
    fallbackOutput,
  );
}

function circularRoadStrokeWidth(casing: boolean) {
  return expr.interpolate({ kind: "linear" }, expr.zoom(), [
    [15, circularRoadStrokeWidthAtLevel(15, casing)],
    [16, circularRoadStrokeWidthAtLevel(16, casing)],
    [17, circularRoadStrokeWidthAtLevel(17, casing)],
    [18, circularRoadStrokeWidthAtLevel(18, casing)],
    [19, circularRoadStrokeWidthAtLevel(19, casing)],
    [20, circularRoadStrokeWidthAtLevel(20, casing)],
    [21, circularRoadStrokeWidthAtLevel(21, casing)],
    [22, circularRoadStrokeWidthAtLevel(22, casing)],
  ]);
}

const circularRoadRadius = circularRoadInnerRadius(false);
const circularRoadCasingRadius = circularRoadInnerRadius(true);
const circularRoadWidth = circularRoadStrokeWidth(false);
const circularRoadCasingWidth = circularRoadStrokeWidth(true);
const roundaboutNeonColor = expr.match<string, string>(
  expr.coalesce(expr.get(field("class")), "minor"),
  [
    { labels: ["trunk", "secondary"], value: cyberpunkPalette.magenta },
    { labels: ["motorway", "primary"], value: cyberpunkPalette.cyan },
  ],
  cyberpunkPalette.roadCasing,
);

export const cyberpunkTheme = defineCommunityTheme({
  id: "cyberpunk-dark",
  version: 1,
  colorScheme: "dark",
  extraColors: cyberpunkSemanticColors,
  fonts: { default: "Oxanium Medium", places: "Oxanium SemiBold" },
  colors: {
    background: cyberpunkPalette.background,
    boundary: cyberpunkPalette.boundary,
    building: cyberpunkPalette.building,
    land: cyberpunkPalette.land,
    park: cyberpunkPalette.park,
    road: cyberpunkPalette.road,
    roadCasing: cyberpunkPalette.roadCasing,
    roadMajor: cyberpunkPalette.road,
    text: cyberpunkPalette.text,
    textHalo: cyberpunkPalette.labelHalo,
    textMuted: cyberpunkPalette.labelMuted,
    water: cyberpunkPalette.water,
  },
  modules: {
    boundaries: {
      admin: cyberpunkPalette.roadCasing,
      disputed: cyberpunkPalette.magenta,
      major: cyberpunkPalette.magenta,
      maritime: "#274A99",
    },
    buildings: {
      active: cyberpunkPalette.buildingActive,
      businessCorridor: "#071733",
      businessCorridorOutline: cyberpunkPalette.magenta,
      civic: "#071733",
      commercial: cyberpunkPalette.buildingActive,
      destination: "#071733",
      extrusion: "#071733",
      fill: cyberpunkPalette.building,
      generic: cyberpunkPalette.building,
      highRise: "#071733",
      highRiseOutline: cyberpunkPalette.purple,
      industrial: "#071733",
      lowRise: "#071733",
      lowRiseOutline: cyberpunkPalette.buildingOutline,
      outline: cyberpunkPalette.buildingOutline,
      residential: "#071733",
    },
    hydro: {
      ferry: cyberpunkPalette.roadCasing,
      label: cyberpunkPalette.cyanSoft,
      water: cyberpunkPalette.water,
      waterway: cyberpunkPalette.roadCasing,
    },
    labels: {
      country: cyberpunkPalette.text,
      halo: cyberpunkPalette.labelHalo,
      muted: cyberpunkPalette.labelMuted,
      neighborhood: cyberpunkPalette.labelMuted,
      poi: "#8EB8FF",
      primary: cyberpunkPalette.text,
      road: cyberpunkPalette.labelMuted,
      settlement: cyberpunkPalette.text,
      water: cyberpunkPalette.labelWater,
    },
    landcover: {
      farmland: "#071B43",
      flowerbed: "#10312E",
      grass: "#0F2527",
      ice: "#123469",
      meadow: "#102A2A",
      protected: "#102F2D",
      recreationGround: "#0D2928",
      rock: "#061737",
      sand: "#101C42",
      scrub: "#102826",
      urbanPark: cyberpunkPalette.park,
      villageGreen: "#10302D",
      wetland: "#082229",
      wood: "#0A2425",
    },
    landuse: {
      cemetery: "#081F47",
      civic: "#071A3F",
      commercial: "#19152F",
      education: "#171C35",
      government: "#102333",
      industrial: "#181C29",
      medical: "#25172D",
      military: "#121638",
      parking: "#020A20",
      recreation: "#0D2928",
      residential: "#0A172A",
    },
    poi: {
      "arts-entertainment": cyberpunkPalette.labelCulture,
      education: cyberpunkPalette.cyanSoft,
      "food-drink": "#FF8A3D",
      halo: cyberpunkPalette.labelHalo,
      icon: cyberpunkPalette.cyan,
      label: cyberpunkPalette.text,
      landmark: cyberpunkPalette.labelCulture,
      lodging: cyberpunkPalette.magentaSoft,
      medical: "#FF4D6D",
      "park-nature": cyberpunkPalette.green,
      "public-services": cyberpunkPalette.cyanSoft,
      religion: cyberpunkPalette.labelCulture,
      retail: cyberpunkPalette.green,
      "sport-leisure": cyberpunkPalette.green,
      transport: cyberpunkPalette.neonMagenta,
      "visitor-amenity": cyberpunkPalette.cyanSoft,
    },
    roads: {
      bridge: cyberpunkPalette.roadBridge,
      casing: cyberpunkPalette.roadCasing,
      ferry: cyberpunkPalette.cyanMuted,
      minor: cyberpunkPalette.road,
      motorway: cyberpunkPalette.road,
      path: "#06152E",
      primary: cyberpunkPalette.road,
      rail: cyberpunkPalette.orange,
      secondary: cyberpunkPalette.road,
      trunk: cyberpunkPalette.road,
      tunnel: cyberpunkPalette.roadTunnel,
    },
  },
  typography: {
    font: "Oxanium Medium",
    letterSpacing: 0.045,
    places: { font: "Oxanium SemiBold", letterSpacing: 0.09 },
    poi: { font: "Oxanium Medium", letterSpacing: 0.055 },
    roads: { font: "Oxanium Medium", letterSpacing: 0.04 },
    transform: "uppercase",
    water: { font: "Oxanium Medium", letterSpacing: 0.065 },
  },
  lighting: {
    anchor: "viewport",
    color: "#FFE6F6",
    intensity: 0.22,
    position: [1.15, 210, 40],
    // Cool modelling light for the tree crowns; flat cartography keeps its ink colours.
    sun: {
      azimuth: 315,
      altitude: 48,
      color: "#8FE7EB",
      intensity: 0.42,
      shadowIntensity: 0.12,
    },
    ambient: { color: "#A0D2E7", intensity: 0.58 },
  },
});

export const cyberpunk = bindCommunityMapTheme(
  defineMap({
    id: "cyberpunk",
    version: 1,
    name: "Cyberpunk",
    data: {
      generation: "v1",
      selection: { kind: "current", product: "world-v1" },
      type: "tileflow-world",
    },
    fonts: [cyberpunkFonts],
    icons: [cyberpunkIcons],
    themes: { dark: cyberpunkTheme },
    defaultTheme: "dark",
    modules: {
      addresses: disable(),
      aeroways: disable(),
      boundaries: withRenderStack(
        boundaries({
          admin2: {
            color: "#7477B4",
            dash: [10, 0],
            minZoom: 1,
            opacity: 1,
            width: zoom.linear([
              [3, 0.5],
              [12, 2],
            ]),
          },
          admin4: {
            color: "#8667A6",
            dash: [3, 3],
            minZoom: 4,
            opacity: zoom.linear([
              [4, 0],
              [6, 0.5],
              [10, 0.38],
              [13, 0.16],
            ]),
            width: zoom.linear([
              [4, 0.45],
              [10, 0.8],
              [14, 1],
            ]),
          },
          disputed: {
            color: token.color("boundaries.admin"),
            dash: expr.step<readonly number[]>(
              expr.zoom(),
              expr.literal<readonly number[]>([3, 2, 5]),
              [[7, expr.literal<readonly number[]>([2, 1.5])]],
            ),
            minZoom: 1,
            opacity: 1,
            width: zoom.linear([
              [3, 0.5],
              [12, 2],
            ]),
          },
          maritime: { visible: false },
        }),
        {
          admin2Background: renderPass({
            placement: { below: "boundaries.admin4" },
            feature: "boundary",
            renderer: "line",
            selector: {
              kind: "all",
              selectors: [
                {
                  kind: "compare",
                  field: "adminLevel",
                  operator: "eq",
                  value: 2,
                  coerce: "number",
                  fallback: 0,
                },
                {
                  kind: "compare",
                  field: "maritime",
                  operator: "ne",
                  value: 1,
                  coerce: "number",
                  fallback: 0,
                },
              ],
            },
            style: {
              blur: expr.interpolate({ kind: "linear" }, expr.zoom(), [
                [3, 0],
                [12, 2],
              ]),
              color: token.color("boundaries.halo"),
              minZoom: 1,
              opacity: expr.interpolate({ kind: "linear" }, expr.zoom(), [
                [3, 0],
                [4, 0.5],
              ]),
              width: expr.interpolate({ kind: "linear" }, expr.zoom(), [
                [3, 4],
                [12, 8],
              ]),
            },
          }),
        },
      ),
      // The city stack authors native low relief; omit the standard building module
      // so the runtime cannot replace it with full-height buildings or landmark models.
      buildings: disable(),
      labels: withRenderStack(
        labels({
          aerodromeCodes: "none",
          junctions: false,
          language: "local",
          places: "all",
          roadClasses: [
            "motorway",
            "trunk",
            "primary",
            "secondary",
            "tertiary",
            "minor",
            "service",
          ],
          roads: "all",
          shields: "none",
          water: "major",
          styles: {
            water: {
              // World also classifies small fountains as lakes: defer point
              // names so they do not compete with districts at city zooms.
              other: {
                minZoom: 15.5,
                text: {
                  color: "#789CB5",
                  haloWidth: 0.8,
                  size: zoom.linear([
                    [15.5, 10],
                    [19, 12],
                  ]),
                  maxWidth: 9,
                  padding: 6,
                },
              },
              line: {
                placement: "line-center",
                text: {
                  color: "#789CB5",
                  haloWidth: 0.8,
                  size: zoom.linear([
                    [5, 11],
                    [16, 13],
                  ]),
                },
              },
              ocean: {
                text: { color: "#789CB5", haloWidth: 0, letterSpacing: 0.2 },
              },
            },
          },
        }),
        { ...cyberpunkLabelRenderStack(), ...cyberpunkSettlementRenderStack() },
      ),
      land: withRenderStack(
        land({
          background: { color: cyberpunkPalette.land },
          landuse: {
            residential: {
              fill: {
                color: zoom.linear([
                  [8, "#29243E"],
                  [12, "#20243B"],
                  [15, "#0A172A"],
                ]),
                opacity: zoom.linear([
                  [8, 0.76],
                  [12, 0.8],
                  [15, 0.62],
                ]),
              },
            },
          },
          landcover: {
            wood: {
              fill: {
                opacity: zoom.linear([
                  [8, 0.48],
                  [12, 0.65],
                  [15, 0.88],
                ]),
              },
            },
            protected: {
              fill: {
                opacity: zoom.linear([
                  [8, 0.3],
                  [12, 0.45],
                  [15, 0.88],
                ]),
              },
            },
            urbanPark: {
              fill: {
                color: zoom.linear([
                  [8, "#103A37"],
                  [13, "#103B36"],
                  [15, cyberpunkPalette.park],
                ]),
                opacity: 0.78,
              },
            },
          },
          globalLandcover: {
            color: cyberpunkOverviewLandcoverColor,
            maxZoom: 9,
            minZoom: 0,
            opacity: zoom.linear([
              [0, 0.9],
              [6, 0.75],
              [7, 0.45],
              [8, 0.15],
              [9, 0],
            ]),
          },
        }),
        { ...cyberpunkLandRenderStack(), ...cyberpunkBuildingRenderStack() },
      ),
      roads: withRenderStack(
        roads({
          streetLights: { enabled: false },
          crossings: {
            image: "cyberpunk-crosswalk",
            minZoom: 16.5,
            opacity: zoom.linear([
              [16.5, 0],
              [17.5, 0.7],
            ]),
          },
          areas: {
            pedestrian: {
              fill: { visible: false },
              outline: { visible: false },
            },
            pier: { fill: { visible: false }, outline: { visible: false } },
            road: { fill: { visible: false }, outline: { visible: false } },
          },
          classes: {
            motorway: cyberpunkRoadStyle(
              cyberpunkPalette.cyan,
              streetsRoadWidths.motorway,
              {
                minZoom: 3,
                neon: true,
                rampWidths: mapboxMajorRampWidthStops,
              },
            ),
            trunk: cyberpunkRoadStyle(
              cyberpunkPalette.magenta,
              streetsRoadWidths.trunk,
              {
                minZoom: 3,
                neon: true,
                rampWidths: mapboxMajorRampWidthStops,
              },
            ),
            primary: cyberpunkRoadStyle(
              cyberpunkPalette.cyan,
              streetsRoadWidths.primary,
              {
                minZoom: 6,
                neon: true,
                rampWidths: mapboxArterialRampWidthStops,
              },
            ),
            secondary: cyberpunkRoadStyle(
              cyberpunkPalette.magenta,
              streetsRoadWidths.secondary,
              {
                minZoom: 8,
                neon: true,
                rampWidths: mapboxArterialRampWidthStops,
              },
            ),
            tertiary: cyberpunkRoadStyle(
              cyberpunkPalette.cyanSoft,
              streetsRoadWidths.tertiary,
              {
                edgeOpacity: 0.62,
                minZoom: 8,
                rampWidths: mapboxArterialRampWidthStops,
              },
            ),
            minor: cyberpunkRoadStyle(
              cyberpunkPalette.cyan,
              streetsRoadWidths.minor,
              {
                edgeOpacity: 0.64,
                minZoom: 12,
              },
            ),
            service: cyberpunkRoadStyle(
              cyberpunkPalette.cyanMuted,
              streetsRoadWidths.service,
              {
                casingMinZoom: 15,
                edgeOpacity: 0.44,
                minZoom: 14,
                tunnelVisible: false,
              },
            ),
            track: cyberpunkRoadStyle(
              cyberpunkPalette.cyanMuted,
              streetsRoadWidths.track,
              {
                casingMinZoom: 15,
                edgeOpacity: 0.4,
                minZoom: 14,
              },
            ),
            pathway: cyberpunkPathRoadStyle(
              cyberpunkPalette.road,
              streetsParkPathWidthStops,
              {
                casingColor: cyberpunkPalette.roadCasing,
                casingWidth: 0,
                minZoom: 12,
              },
            ),
            footway: cyberpunkPathRoadStyle(
              cyberpunkPalette.road,
              streetsParkPathWidthStops,
              {
                casingColor: cyberpunkPalette.roadCasing,
                casingWidth: 0,
                minZoom: 12,
              },
            ),
            cycleway: cyberpunkPathRoadStyle(
              cyberpunkPalette.cyan,
              mapboxPathWidthStops,
              {
                casingColor: cyberpunkPalette.roadCasing,
                casingGapWidth: roadWidth(
                  mapboxPathWidthStops,
                  1,
                  false,
                  false,
                ),
                fillOpacity: zoom.linear([
                  [15, 0],
                  [16, 1],
                ]),
                minZoom: 15,
                underlay: {
                  cap: pathLineCap,
                  color: cyberpunkPalette.road,
                  join: pathLineJoin,
                  minZoom: 12,
                  opacity: 1,
                  width: roadWidth(mapboxPathWidthStops, 1, false, false),
                },
                width: zoom.linear([
                  [12, 0],
                  [18, 2],
                  [22, 20],
                ]),
              },
            ),
            steps: cyberpunkPathRoadStyle(
              cyberpunkPalette.road,
              streetsParkPathWidthStops,
              {
                casingColor: cyberpunkPalette.roadCasing,
                casingMinZoom: 14,
                casingWidth: 0,
                dash: [0.18, 0.15],
                minZoom: 14,
                steps: true,
              },
            ),
            pedestrian: cyberpunkPathRoadStyle(
              cyberpunkPalette.road,
              streetsParkPathWidthStops,
              {
                casingColor: cyberpunkPalette.roadCasing,
                casingMinZoom: 14,
                casingWidth: 0,
                minZoom: 12,
              },
            ),
          },
          detail: "all",
          extras: { paths: true },
          hierarchy: "clear",
          modifiers: {
            construction: {
              surface: {
                casing: {
                  color: cyberpunkPalette.roadCasing,
                  dash: [1.5, 1],
                  opacity: 0.82,
                },
                fill: {
                  color: cyberpunkPalette.road,
                  dash: [1.5, 1],
                  opacity: 0.96,
                },
              },
            },
            expressway: { widthScale: expresswayWidthScale },
            indoor: {
              surface: { casing: { dash: [1, 0] }, fill: { dash: [1, 0] } },
            },
            ramp: { enabled: false },
            unpaved: {
              surface: {
                casing: {
                  color: cyberpunkPalette.roadCasing,
                  dash: [1, 0],
                  opacity: 0.72,
                },
                fill: {
                  color: cyberpunkPalette.road,
                  dash: [1, 0],
                  opacity: 0.96,
                },
              },
            },
          },
          oneWayMarkers: false,
          outline: "strong",
          restrictions: {
            access: {
              widthScale: 1,
              surface: {
                casing: {
                  color: cyberpunkPalette.roadCasing,
                  dash: [1, 0],
                  opacity: 0.62,
                },
                fill: {
                  color: cyberpunkPalette.road,
                  dash: [1, 0],
                  opacity: 1,
                },
              },
            },
            toll: { surface: { casing: { opacity: 1 } } },
          },
          roundabouts: {
            casing: {
              color: "rgba(0, 0, 0, 0)",
              minZoom: 15,
              pitchAlignment: "map",
              pitchScale: "map",
              radius: circularRoadCasingRadius,
              strokeColor: roundaboutNeonColor,
              strokeWidth: circularRoadCasingWidth,
            },
            fill: {
              color: "rgba(0, 0, 0, 0)",
              minZoom: 15,
              pitchAlignment: "map",
              pitchScale: "map",
              radius: circularRoadRadius,
              strokeColor: cyberpunkPalette.road,
              strokeWidth: circularRoadWidth,
            },
          },
          serviceTypes: {
            alley: { enabled: false },
            crossover: { enabled: false },
            driveway: { enabled: false },
            parkingAisle: { enabled: false },
            yard: { enabled: false },
          },
          sidewalks: {
            outline: { visible: false },
            pattern: { visible: false },
            surface: {
              color: "#326C86",
              minZoom: 17,
              opacity: zoom.linear([
                [17, 0],
                [18, 0.16],
              ]),
            },
          },
          weight: "regular",
        }),
        {
          ...cyberpunkPathRenderStack(),
          ...cyberpunkPrincipalRoadRenderStack(),
        },
      ),
      transit: transit(cyberpunkTransitStyle()),
      landforms: disable(),
      poi: withRenderStack(
        poi({
          categories: ["transport", "arts-entertainment"],
          color: "category",
          density: 2,
          icons: false,
          labels: false,
          minZoom: 15,
          placement: {
            order: "categories",
            coupleIconAndLabel: false,
            iconPadding: 4,
            textPadding: 4,
          },
        }),
        cyberpunkDestinationRenderStack(),
      ),
      vegetation: vegetation({
        // Explicit 3d keeps trees independent of the preview's building/view toggle.
        mode: "3d",
        fallback: "flat",
        flat: {
          minZoom: 15,
          color: "#164C47",
          opacity: zoom.linear([
            [15, 0],
            [16, 0.9],
          ]),
          radius: zoom.linear([
            [15, 1.2],
            [18, 3.4],
            [20, 7],
          ]),
          strokeColor: "#38BFA7",
          strokeWidth: 0.65,
          strokeOpacity: 0.7,
        },
        threeDimensional: {
          barkColor: "#254451",
          broadleafColors: ["#0C443F", "#125C50", "#19735E", "#238E74"],
          coniferColors: ["#103D48", "#175565", "#247580"],
          palmColors: ["#125449", "#1C7360", "#2C9278"],
          finish: "faceted",
          edges: 0.7,
          edgeColor: "#2D9F95",
          heightScale: 0.9,
          crownScale: 0.9,
        },
      }),
      water: withRenderStack(
        water({
          bodies: {
            fill: {
              color: zoom.linear([
                [0, "#040C18"],
                [7, "#061527"],
                [15, cyberpunkPalette.water],
              ]),
            },
          },
          bathymetry: {
            color: expr.interpolate(
              { kind: "linear" },
              expr.toNumber(expr.get(field("bathymetryMinDepth")), 0),
              [
                [-11000, "#030914"],
                [-2000, "#061324"],
                [-200, "#0A2636"],
                [0, "#103346"],
              ],
            ),
            opacity: zoom.linear([
              [0, 0.55],
              [6, 0.45],
              [9, 0.2],
              [10, 0],
            ]),
          },
          waterways: {
            river: {
              color: zoom.linear([
                [6, "#24576A"],
                [13, "#3D8490"],
                [16, cyberpunkPalette.roadCasing],
              ]),
            },
            stream: {
              opacity: zoom.linear([
                [10, 0.25],
                [13, 0.5],
                [16, 1],
              ]),
            },
          },
        }),
        cyberpunkWaterRenderStack(),
      ),
    },
    projection: "mercator",
    terrain: "none",
    view: {
      bearing: 0,
      center: [-3.69275, 40.40866],
      pitch: 0,
      zoom: 15,
    },
  }),
);
