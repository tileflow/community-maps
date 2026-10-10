// Adapted from Tileflow SDK; see NOTICE for origin and modifications.
import {
  boundaries,
  buildings,
  defineMap,
  disable,
  expr,
  field,
  labels,
  land,
  poi,
  refineRenderTarget,
  renderPass,
  roads,
  type TileflowDataExpressionInput,
  type TileflowLineCap,
  type TileflowLineJoin,
  type TileflowLineStyle,
  type TileflowNamedRenderStack,
  type TileflowRenderSelector,
  type TileflowRoadClassStyle,
  token,
  transit,
  water,
  withRenderStack,
  zoom,
} from '@tileflow/core';
import {terminalFonts, terminalIcons} from './assets';
import {mapboxRailTransitStyle} from '../../src/shared/mapbox-rail';
import {bindCommunityMapTheme, defineCommunityTheme} from '../../src/shared/theme-helpers';

const terminalPalette = {
  background: '#020D06',
  boundary: '#43DB60',
  building: '#05210E',
  buildingActive: '#082F15',
  buildingOutline: '#23933F',
  cyan: '#43DB60',
  cyanSoft: '#63F77B',
  cyanMuted: '#197234',
  acidGreen: '#43DB60',
  green: '#197234',
  halo: '#010704',
  land: '#05210E',
  labelCulture: '#B3FFC0',
  labelHalo: '#115827',
  labelMuted: '#B3FFC0',
  labelWater: '#87FF98',
  magenta: '#43DB60',
  magentaSoft: '#63F77B',
  neonCyan: '#63F77B',
  neonMagenta: '#63F77B',
  orange: '#43DB60',
  park: '#05210E',
  purple: '#63F77B',
  road: '#010704',
  roadBridge: '#082F15',
  roadCasing: '#23933F',
  roadTunnel: '#05210E',
  text: '#D9FFDE',
  textMuted: '#B3FFC0',
  water: '#05210E',
  waterDeep: '#010704',
  yellow: '#63F77B',
} as const;

function terminalColorForSemanticToken(name: string): string {
  const [group, role = ''] = name.split('.');
  switch (group) {
    case 'boundaries':
      return role === 'halo' ? terminalPalette.labelHalo : terminalPalette.boundary;
    case 'buildings':
      return role === 'outline' || role.endsWith('Outline')
        ? terminalPalette.buildingOutline
        : terminalPalette.building;
    case 'hydro':
      return role === 'label' || role === 'ferry' ? terminalPalette.cyanSoft : terminalPalette.water;
    case 'labels':
      if (role === 'halo' || role === 'waterHalo') return terminalPalette.labelHalo;
      if (role === 'muted' || role === 'neighborhood') return terminalPalette.labelMuted;
      if (role === 'water') return terminalPalette.labelWater;
      return terminalPalette.text;
    case 'landcover':
      return terminalPalette.park;
    case 'landuse':
      return role === 'recreation' || role === 'recreationOutline'
        ? terminalPalette.park
        : terminalPalette.land;
    case 'poi': {
      const accents: Readonly<Record<string, string>> = {
        'arts-entertainment': terminalPalette.labelCulture,
        'food-drink': terminalPalette.orange,
        halo: terminalPalette.labelHalo,
        landmark: terminalPalette.labelCulture,
        lodging: terminalPalette.magentaSoft,
        medical: terminalPalette.magentaSoft,
        'park-nature': terminalPalette.green,
        religion: terminalPalette.labelCulture,
        retail: terminalPalette.green,
        'sport-leisure': terminalPalette.green,
        transport: terminalPalette.neonMagenta,
      };
      return accents[role] ?? terminalPalette.cyanSoft;
    }
    case 'roads':
      if (name.includes('casing')) return terminalPalette.roadCasing;
      if (name.includes('tunnel')) return terminalPalette.roadTunnel;
      if (role === 'ferry') return terminalPalette.cyanMuted;
      if (role === 'rail' || role === 'railTransit') return terminalPalette.orange;
      if (role === 'cycleway' || role === 'parkPath') return terminalPalette.green;
      return terminalPalette.road;
    case 'surface':
      if (role === 'water') return terminalPalette.water;
      if (role === 'building') return terminalPalette.building;
      if (role === 'park') return terminalPalette.park;
      return terminalPalette.land;
    case 'transit':
      return terminalPalette.neonMagenta;
    case 'vegetation':
      return terminalPalette.park;
    default:
      throw new Error(`Terminal has no visual family for semantic token ${name}.`);
  }
}

const terminalSemanticColorRoles = {
  boundaries: ['admin', 'default', 'disputed', 'halo', 'major', 'maritime', 'regional'],
  buildings: [
    'active',
    'businessCorridor',
    'businessCorridorOutline',
    'civic',
    'commercial',
    'destination',
    'extrusion',
    'fill',
    'generic',
    'industrial',
    'outline',
    'residential',
    'shadow',
  ],
  hydro: [
    'depth.m0',
    'depth.m200',
    'depth.m2000',
    'depth.m7000',
    'ferry',
    'label',
    'water',
    'waterway',
  ],
  labels: [
    'country',
    'halo',
    'muted',
    'neighborhood',
    'overview',
    'poi',
    'primary',
    'road',
    'settlement',
    'strong',
    'water',
    'waterHalo',
  ],
  landcover: [
    'barren',
    'farmland',
    'flowerbed',
    'grass',
    'greenspace',
    'greenspaceDark',
    'ice',
    'meadow',
    'protected',
    'recreationGround',
    'rock',
    'sand',
    'scrub',
    'urbanPark',
    'villageGreen',
    'wetland',
    'wood',
  ],
  landuse: [
    'businessCorridor',
    'businessCorridorOutline',
    'cemetery',
    'civic',
    'commercial',
    'education',
    'government',
    'industrial',
    'medical',
    'parking',
    'parkingOutline',
    'railway',
    'recreation',
    'recreationOutline',
    'residential',
  ],
  poi: [
    'arts-entertainment',
    'education',
    'food-drink',
    'halo',
    'icon',
    'label',
    'landmark',
    'lodging',
    'medical',
    'park-nature',
    'public-services',
    'religion',
    'retail',
    'sport-leisure',
    'transport',
    'visitor-amenity',
  ],
  roads: [
    'bridge',
    'casing',
    'city.casing',
    'city.minor',
    'city.primary',
    'city.secondary',
    'city.tertiary',
    'city.tunnel',
    'city.tunnelCasing',
    'cycleway',
    'default',
    'default.casing',
    'default.tunnel',
    'ferry',
    'major',
    'minor',
    'motorway',
    'motorway.casing',
    'motorway.tunnel',
    'parkPath',
    'path',
    'path.casing',
    'path.transition',
    'path.tunnel',
    'primary',
    'rail',
    'railTransit',
    'secondary',
    'trunk',
    'trunk.casing',
    'trunk.tunnel',
    'tunnel',
  ],
  surface: ['background', 'building', 'land', 'park', 'water'],
  transit: ['primary'],
  vegetation: [
    'tree.bark',
    'tree.broadleaf.a',
    'tree.broadleaf.b',
    'tree.broadleaf.c',
    'tree.broadleaf.d',
    'tree.conifer.a',
    'tree.conifer.b',
    'tree.conifer.c',
  ],
} as const;

const terminalSemanticColors = Object.fromEntries(
  Object.entries(terminalSemanticColorRoles).flatMap(([group, roles]) =>
    roles.map((role) => {
      const name = `${group}.${role}`;
      return [name, terminalColorForSemanticToken(name)];
    }),
  ),
);

const terminalBuildingHeight2d = expr.toNumber(expr.coalesce(expr.get(field('renderHeight')), 0), 0);
const terminalBuildingTone2d = expr.coalesce(expr.get(field('buildingTone')), '');
const terminalImportanceTierField = field('importanceTier');
const terminalPublishedImportanceTier = expr.toNumber(
  expr.coalesce(expr.get(terminalImportanceTierField), 0),
  0,
);
const terminalBuildingIsDestination = expr.eq(terminalBuildingTone2d, 'destination');
const terminalBuildingHasColorFamily = expr.match<string, boolean>(
  terminalBuildingTone2d,
  [{labels: ['active', 'commercial', 'destination'], value: true}],
  false,
);
const terminalBuildingPublishedTierWithProminence = expr.let(
  't',
  terminalPublishedImportanceTier,
  expr.case<number>(
    [
      {
        when: expr.all(
          expr.gte(expr.var<number>('t'), 1),
          expr.lte(expr.var<number>('t'), 2),
          expr.gte(
            terminalBuildingHeight2d,
            expr.match<number, number>(expr.var<number>('t'), [{labels: 1, value: 24}], 36),
          ),
        ),
        value: expr.add(expr.var<number>('t'), 1),
      },
    ],
    expr.var<number>('t'),
  ),
);
const terminalBuildingLegacyImportanceTier = expr.case<number>(
  [
    {
      when: terminalBuildingIsDestination,
      value: expr.step(terminalBuildingHeight2d, 2, [[36, 3]]),
    },
    {
      when: terminalBuildingHasColorFamily,
      value: expr.step(terminalBuildingHeight2d, 1, [[24, 2]]),
    },
    {when: expr.gte(terminalBuildingHeight2d, 36), value: 1},
  ],
  0,
);
const terminalBuildingImportanceTier = expr.case<number>(
  [
    {
      // Semantics establishes relevance. Physical prominence may add at most one
      // visual step, while an ordinary tall building is capped at a faint tier 1.
      when: expr.has(terminalImportanceTierField),
      value: terminalBuildingPublishedTierWithProminence,
    },
  ],
  terminalBuildingLegacyImportanceTier,
);
const terminalBuildingIsSelectedDestination = terminalBuildingIsDestination;
const terminalBuildingGhostFill = expr.case<string>(
  [
    {
      when: terminalBuildingIsSelectedDestination,
      value: expr.step(terminalBuildingImportanceTier, '#05210E', [
        [1, '#05210E'],
        [2, '#082F15'],
        [3, '#0C421D'],
        [4, '#0C421D'],
      ]),
    },
  ],
  expr.step(terminalBuildingImportanceTier, '#05210E', [
    [1, '#05210E'],
    [2, '#082F15'],
    [3, '#0C421D'],
    [4, '#115827'],
  ]),
);
const terminalBuildingGhostCore = expr.case<string>(
  [
    {
      when: terminalBuildingIsSelectedDestination,
      value: expr.step(terminalBuildingImportanceTier, '#23933F', [
        [1, '#30B94E'],
        [2, '#43DB60'],
        [3, '#63F77B'],
        [4, '#87FF98'],
      ]),
    },
  ],
  expr.step(terminalBuildingImportanceTier, '#23933F', [
    [1, '#30B94E'],
    [2, '#43DB60'],
    [3, '#63F77B'],
    [4, '#87FF98'],
  ]),
);
const terminalBuildingGhostCoreOpacity = expr.case<number>(
  [
    {
      when: terminalBuildingIsSelectedDestination,
      value: expr.step(terminalBuildingImportanceTier, 0.18, [
        [1, 0.46],
        [2, 0.64],
        [3, 0.82],
        [4, 0.96],
      ]),
    },
  ],
  expr.step(terminalBuildingImportanceTier, 0.18, [
    [1, 0.52],
    [2, 0.68],
    [3, 0.84],
    [4, 0.96],
  ]),
);

const terminalRoadClass = expr.coalesce(expr.get(field('class')), '');
const terminalRoadImportanceTier = expr.case<number>(
  [{when: expr.has(terminalImportanceTierField), value: terminalPublishedImportanceTier}],
  expr.match<string, number>(
    terminalRoadClass,
    [
      {labels: ['motorway', 'trunk'], value: 4},
      {labels: 'primary', value: 3},
      {labels: 'secondary', value: 2},
      {labels: 'tertiary', value: 1},
    ],
    0,
  ),
);

const terminalPoiCategory = expr.coalesce(expr.get(field('poiCategory')), '');
const terminalPoiFilterRank = expr.toNumber(expr.get(field('poiFilterRank')), 6);
const terminalPoiSizeRank = expr.toNumber(expr.get(field('poiSizeRank')), 17);
const terminalPoiImportanceTier = expr.match<string, number>(
  terminalPoiCategory,
  [
    {labels: 'landmark', value: 4},
    {labels: 'transport', value: 3},
    {
      labels: ['arts-entertainment', 'park-nature', 'public-services', 'sport-leisure'],
      value: 2,
    },
  ],
  1,
);
const terminalHudPoiImportanceTier = terminalPoiImportanceTier;
const terminalPoiPlacementPriority = expr.add(
  expr.multiply(terminalPoiFilterRank, 17),
  terminalPoiSizeRank,
);
const terminalPoiImportanceColor = expr.match<number, string>(
  terminalPoiImportanceTier,
  [
    {labels: 4, value: terminalPalette.yellow},
    {labels: 3, value: terminalPalette.neonMagenta},
    {labels: 2, value: terminalPalette.magentaSoft},
  ],
  terminalPalette.cyanSoft,
);
const terminalPoiIsActive = expr.toBoolean(expr.featureState('active'), false);

type WidthStops = readonly (readonly [number, number])[];

const roadBorderTotalWidth = 1;
const roadWidthInterpolationBase = 1.5;
const expresswayWidthScale = 1.06;
const tunnelBorderDash = [8, 5] as const;
const tunnelBorderWidth = 1;
const roadClearanceExtraAtZ15 = expr.toNumber(
  expr.coalesce(expr.get(field('circularClearanceExtraAtZoom15')), 0),
  0,
);
const roadNeedsStructuralButtCap = expr.any(
  expr.eq(expr.get(field('brunnel')), 'tunnel'),
  expr.eq(expr.get(field('class')), 'steps'),
  expr.eq(expr.get(field('subclass')), 'steps'),
);
const roadNeedsControlledSurfaceButtCap = expr.all(
  expr.match<string, boolean>(
    expr.get(field('brunnel')),
    [{labels: ['tunnel', 'bridge'], value: false}],
    true,
  ),
  expr.eq(expr.get(field('foot')), 'no'),
  expr.match<string, boolean>(
    expr.get(field('class')),
    [
      {
        labels: [
          'motorway',
          'trunk',
          'primary',
          'motorway_construction',
          'trunk_construction',
          'primary_construction',
        ],
        value: true,
      },
    ],
    false,
  ),
);
const roadLineCap = expr.step<TileflowLineCap>(
  expr.zoom(),
  expr.case<TileflowLineCap>([{when: roadNeedsStructuralButtCap, value: 'butt'}], 'round'),
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
            value: 'butt',
          },
        ],
        'round',
      ),
    ],
  ],
);
const roadLineJoin = zoom.step<TileflowLineJoin>([
  [3, 'miter'],
  [14, 'round'],
]);
const pathLineCap = zoom.step<TileflowLineCap>([
  [12, 'butt'],
  [16, 'round'],
]);
const pathLineJoin = zoom.step<TileflowLineJoin>([
  [12, 'miter'],
  [16, 'round'],
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

const terminalRoadWidths = {
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
const terminalParkPathWidthStops = [
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
  const widthOutput = (level: number, width: number): TileflowDataExpressionInput<number> => {
    const ordinaryWidth =
      oneWayScale === 1
        ? width
        : expr.match<number, number>(
            expr.get(field('oneway')),
            [{labels: [1, -1], value: width * oneWayScale}],
            width,
          );
    const rampWidth = rampWidths?.find(([rampLevel]) => rampLevel === level)?.[1];
    const surfaceWidth =
      rampWidth === undefined
        ? ordinaryWidth
        : expr.case<number>(
            [{when: expr.eq(expr.get(field('ramp')), 1), value: rampWidth}],
            ordinaryWidth,
          );
    if (!casing) return surfaceWidth;
    return typeof surfaceWidth === 'number'
      ? surfaceWidth + roadBorderTotalWidth
      : expr.add(surfaceWidth, roadBorderTotalWidth);
  };
  const widthStops = augmentedWidths.map(
    ([level, width]) => [level, widthOutput(level, width)] as const,
  );
  const firstWidthStop = widthStops[0];
  if (firstWidthStop === undefined) throw new Error('Road widths require at least one zoom stop.');
  const baseWidth = expr.interpolate(
    {base: roadWidthInterpolationBase, kind: 'exponential'},
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
              expr.interpolate({base: 2, kind: 'exponential'}, expr.zoom(), [
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
    [15, 0],
    [15.5, 0.5],
    [22, 0.5],
  ]);
}

const tunnelRoadCasingWidth = zoom.linear([
  [15, 0],
  [15.5, tunnelBorderWidth],
  [22, tunnelBorderWidth],
]);

function terminalRoadStyle(
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
    casingMinZoom = 15,
    edgeOpacity = 1,
    minZoom,
    neon = false,
    rampWidths,
    tunnelVisible = true,
  } = options;
  const zoomRange = minZoom === undefined ? {} : {minZoom};
  const opacity = zoom.linear([
    [3, 0],
    [3.5, 1],
  ]);
  const fill = {
    ...zoomRange,
    cap: roadLineCap,
    color: terminalPalette.road,
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
    surface: {casing, fill},
    bridge: {
      casing,
      fill: {
        ...fill,
        color: terminalPalette.roadBridge,
      },
    },
    tunnel: tunnelVisible
      ? {
          casing: {
            ...casing,
            color: edgeColor,
            dash: tunnelBorderDash,
            gapWidth: fill.width,
            opacity: edgeOpacity,
            width: tunnelRoadCasingWidth,
          },
          fill: {
            ...fill,
            color: terminalPalette.roadTunnel,
            opacity: zoom.linear([
              [3, 0],
              [3.5, 0.8],
            ]),
          },
          hatch: {visible: false},
        }
      : {
          casing: {visible: false},
          fill: {visible: false},
          hatch: {visible: false},
          shadow: {visible: false},
        },
  };
}

function terminalPathRoadStyle(
  color: string,
  widths: WidthStops,
  options: {
    casingColor?: string;
    casingGapWidth?: TileflowLineStyle['gapWidth'];
    casingMinZoom?: number;
    casingWidth?: TileflowLineStyle['width'];
    dash?: TileflowLineStyle['dash'];
    fillOpacity?: TileflowLineStyle['opacity'];
    minZoom?: number;
    steps?: boolean;
    underlay?: TileflowLineStyle;
    width?: TileflowLineStyle['width'];
  } = {},
): TileflowRoadClassStyle {
  const zoomRange = options.minZoom === undefined ? {} : {minZoom: options.minZoom};
  const cap = options.steps ? ('butt' as const) : pathLineCap;
  const tunnelCap = 'butt' as const;
  const join = options.steps ? ('round' as const) : pathLineJoin;
  const fillWidth = options.width ?? roadWidth(widths, 1, false, false);
  const fill = {
    ...zoomRange,
    cap,
    color,
    ...(options.dash ? {dash: options.dash} : {}),
    join,
    opacity: options.fillOpacity ?? 1,
    width: fillWidth,
  };
  const casing = {
    ...zoomRange,
    minZoom: Math.max(options.minZoom ?? 0, options.casingMinZoom ?? 15),
    cap,
    color: options.casingColor ?? terminalPalette.roadCasing,
    gapWidth: options.casingGapWidth ?? fill.width,
    join,
    opacity: 1,
    width: options.casingWidth ?? pathCasingStrokeWidth,
  };

  return {
    surface: {...(options.underlay ? {shadow: options.underlay} : {}), casing, fill},
    bridge: {...(options.underlay ? {shadow: options.underlay} : {}), casing, fill},
    tunnel: {
      ...(options.underlay ? {shadow: {...options.underlay, cap: tunnelCap}} : {}),
      casing: {
        ...casing,
        cap: tunnelCap,
        color: terminalPalette.roadCasing,
        dash: tunnelBorderDash,
        gapWidth: fill.width,
        opacity: 1,
        width: pathTunnelCasingWidth,
      },
      fill: {...fill, cap: tunnelCap, color: '#05210E', dash: [1, 0], opacity: 1},
      hatch: {visible: false},
    },
  };
}

const unpavedPathCondition = expr.eq(expr.get(field('surface')), 'unpaved');
const contextualPathLineWidth = expr.interpolate<number>(
  {base: 1.5, kind: 'exponential'},
  expr.zoom(),
  [
    [12, expr.case<number>([{when: unpavedPathCondition, value: 0}], 0)],
    [15, expr.case<number>([{when: unpavedPathCondition, value: 0.75}], 1)],
    [16, expr.case<number>([{when: unpavedPathCondition, value: 1}], 1.5)],
    [17, expr.case<number>([{when: unpavedPathCondition, value: 1.4}], 3)],
    [18, expr.case<number>([{when: unpavedPathCondition, value: 2}], 6)],
    [19, expr.case<number>([{when: unpavedPathCondition, value: 3.7}], 12)],
    [20, expr.case<number>([{when: unpavedPathCondition, value: 7.5}], 22)],
    [22, expr.case<number>([{when: unpavedPathCondition, value: 20}], 60)],
  ],
);
const contextualPathCasingWidth = expr.interpolate<number>(
  {base: 1.5, kind: 'exponential'},
  expr.zoom(),
  [
    [15, expr.case<number>([{when: unpavedPathCondition, value: 0}], 0)],
    [15.5, expr.case<number>([{when: unpavedPathCondition, value: 0}], 0.5)],
    [18, expr.case<number>([{when: unpavedPathCondition, value: 0}], 1)],
    [22, expr.case<number>([{when: unpavedPathCondition, value: 0}], 2)],
  ],
);
const contextualPathClasses = ['pathway', 'footway', 'steps', 'pedestrian'] as const;

const terminalOverviewLandcoverColor = expr.match<string, string>(
  expr.get(field('class')),
  [
    {labels: 'barren', value: '#082F15'},
    {labels: 'crop', value: '#0C421D'},
    {labels: 'grass', value: '#082F15'},
    {labels: 'shrub', value: '#082F15'},
    {labels: 'snow', value: '#197234'},
    {labels: 'trees', value: '#082F15'},
    {labels: 'urban', value: '#115827'},
  ],
  'rgba(0, 0, 0, 0)',
);

const terminalRoadLabelIds = [
  'labels.roads.motorway',
  'labels.roads.trunk',
  'labels.roads.primary',
  'labels.roads.secondary',
  'labels.roads.tertiary',
  'labels.roads.minor',
  'labels.roads.service',
] as const;

const terminalPrimaryPlaceLabelIds = ['labels.places.country', 'labels.places.city'] as const;

const terminalSecondaryPlaceLabelIds = [
  'labels.places.other',
  'labels.places.neighborhood',
  'labels.places.village',
  'labels.places.town',
  'labels.places.state',
  'labels.places.continent',
] as const;

function terminalRenderOperationName(prefix: string, ...parts: string[]): string {
  return `${prefix}${parts
    .flatMap((part) => part.split(/[^A-Za-z0-9]+/u))
    .filter(Boolean)
    .map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`)
    .join('')}`;
}

function terminalLabelRenderStack(): TileflowNamedRenderStack {
  return Object.fromEntries([
    ...terminalRoadLabelIds.map(
      (target) =>
        [
          terminalRenderOperationName('roadLabel', target.split('.').at(-1) ?? ''),
          refineRenderTarget({
            renderer: 'symbol',
            requirements: ['roads'],
            target,
            style: {
              text: {
                haloWidth: 1.6,
                size: expr.interpolate({kind: 'linear'}, expr.zoom(), [
                  [10, 9],
                  [16, 13],
                ]),
              },
            },
          }),
        ] as const,
    ),
    ...terminalPrimaryPlaceLabelIds.map(
      (target) =>
        [
          terminalRenderOperationName('placeLabel', target.split('.').at(-1) ?? ''),
          refineRenderTarget({renderer: 'symbol', target, style: {text: {haloWidth: 1.4}}}),
        ] as const,
    ),
    ...terminalSecondaryPlaceLabelIds.map(
      (target) =>
        [
          terminalRenderOperationName('placeLabel', target.split('.').at(-1) ?? ''),
          refineRenderTarget({
            renderer: 'symbol',
            target,
            style: {text: {color: terminalPalette.labelMuted, haloWidth: 1.1}},
          }),
        ] as const,
    ),
  ]);
}

function terminalPoiLabelRenderStack(): TileflowNamedRenderStack {
  return Object.fromEntries(
    (['poi.transport.label', 'poi.arts-entertainment.label'] as const).map((target) => [
      terminalRenderOperationName('poiLabel', target.split('.').at(-2) ?? ''),
      refineRenderTarget({renderer: 'symbol', target, style: {text: {haloWidth: 1.2}}}),
    ]),
  );
}

function terminalPathRenderStack(): TileflowNamedRenderStack {
  return Object.fromEntries(
    contextualPathClasses.flatMap((roadClass) =>
      (['surface', 'bridge'] as const).flatMap((structure) => [
        [
          terminalRenderOperationName('path', roadClass, structure, 'fill'),
          refineRenderTarget({
            renderer: 'line',
            target: `roads.classes.${roadClass}.${structure}.fill`,
            style: {
              color: roadClass === 'steps' ? '#05210E' : terminalPalette.road,
              ...(roadClass === 'steps' ? {dash: [0.18, 0.15] as const} : {}),
              width: contextualPathLineWidth,
            },
          }),
        ],
        [
          terminalRenderOperationName('path', roadClass, structure, 'casing'),
          refineRenderTarget({
            renderer: 'line',
            target: `roads.classes.${roadClass}.${structure}.casing`,
            style: {
              color: terminalPalette.roadCasing,
              gapWidth: roadClass === 'steps' ? 0 : contextualPathLineWidth,
              width: roadClass === 'steps' ? contextualPathLineWidth : contextualPathCasingWidth,
            },
          }),
        ],
      ]),
    ),
  );
}

function terminalRoadImportanceSelector(minimum: 2 | 3): TileflowRenderSelector {
  const legacyClasses = {
    2: ['motorway', 'trunk', 'primary', 'secondary'],
    3: ['motorway', 'trunk', 'primary'],
  }[minimum];
  return {
    kind: 'all',
    selectors: [
      {kind: 'geometry', geometry: 'line'},
      {
        kind: 'any',
        selectors: [
          {
            kind: 'all',
            selectors: [
              {kind: 'has', field: 'importanceTier'},
              {
                kind: 'compare',
                field: 'importanceTier',
                operator: 'gte',
                value: minimum,
                coerce: 'number',
                fallback: 0,
              },
            ],
          },
          {
            kind: 'all',
            selectors: [
              {kind: 'not', selector: {kind: 'has', field: 'importanceTier'}},
              {kind: 'in', field: 'class', values: legacyClasses, fallback: ''},
            ],
          },
        ],
      },
      {
        kind: 'compare',
        field: 'ramp',
        operator: 'ne',
        value: 1,
        coerce: 'number',
        fallback: 0,
      },
      {kind: 'compare', field: 'brunnel', operator: 'ne', value: 'tunnel', fallback: ''},
    ],
  };
}

function terminalPrincipalRoadRenderStack(): TileflowNamedRenderStack {
  const principalRoadColor = expr.match<string, string>(
    terminalRoadClass,
    [{labels: ['trunk', 'secondary'], value: terminalPalette.neonMagenta}],
    terminalPalette.neonCyan,
  );
  const roadWidthScale = expr.match<number, number>(
    terminalRoadImportanceTier,
    [
      {labels: 4, value: 1},
      {labels: 3, value: 0.9},
      {labels: 2, value: 0.72},
      {labels: 1, value: 0.48},
    ],
    0,
  );
  return {
    principalNeonAura: renderPass({
      placement: {above: 'roads.classes.motorway.surface.fill'},
      feature: 'road',
      renderer: 'line',
      selector: terminalRoadImportanceSelector(3),
      style: {
        blur: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [8, 2],
          [10, 3.5],
          [12, 8],
          [16, 12],
          [18, 14],
          [22, 18],
        ]),
        cap: 'round',
        color: principalRoadColor,
        join: 'round',
        minZoom: 8,
        opacity: expr.match<number, number>(
          terminalRoadImportanceTier,
          [
            {labels: 4, value: 0.24},
            {labels: 3, value: 0.17},
          ],
          0,
        ),
        width: expr.interpolate({base: 1.5, kind: 'exponential'}, expr.zoom(), [
          [8, 0],
          [10, 0.35],
          [11, 0.9],
          [12, expr.multiply(2.5, roadWidthScale)],
          [15, expr.multiply(7, roadWidthScale)],
          [16, expr.multiply(13.5, roadWidthScale)],
          [18, expr.multiply(24, roadWidthScale)],
          [22, expr.multiply(70, roadWidthScale)],
        ]),
      },
    }),
    principalNeonGlow: renderPass({
      placement: {above: 'roads.render.principalNeonAura'},
      feature: 'road',
      renderer: 'line',
      selector: terminalRoadImportanceSelector(2),
      style: {
        blur: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [6, 0.8],
          [8, 1.5],
          [10, 2.5],
          [12, 4],
          [16, 5],
          [18, 6.5],
          [22, 9],
        ]),
        cap: 'round',
        color: principalRoadColor,
        join: 'round',
        minZoom: 6,
        opacity: expr.match<number, number>(
          terminalRoadImportanceTier,
          [
            {labels: 4, value: 0.54},
            {labels: 3, value: 0.42},
            {labels: 2, value: 0.26},
          ],
          0,
        ),
        width: expr.interpolate({base: 1.5, kind: 'exponential'}, expr.zoom(), [
          [6, 0],
          [8, 0.18],
          [10, 0.55],
          [12, expr.multiply(1.3, roadWidthScale)],
          [15, expr.multiply(3.6, roadWidthScale)],
          [16, expr.multiply(7.2, roadWidthScale)],
          [18, expr.multiply(12, roadWidthScale)],
          [22, expr.multiply(34, roadWidthScale)],
        ]),
      },
    }),
  };
}

function terminalBuildingImportanceSelector(minimum: 2 | 3): TileflowRenderSelector {
  const hasPublishedTier = {kind: 'has', field: 'importanceTier'} as const;
  const heightAtLeast = (value: number): TileflowRenderSelector => ({
    kind: 'compare',
    field: 'renderHeight',
    operator: 'gte',
    value,
    coerce: 'number',
    fallback: 0,
  });
  const publishedBranch: TileflowRenderSelector = {
    kind: 'all',
    selectors: [
      hasPublishedTier,
      {
        kind: 'any',
        selectors:
          minimum === 3
            ? [
                {
                  kind: 'compare',
                  field: 'importanceTier',
                  operator: 'gte',
                  value: 3,
                  coerce: 'number',
                  fallback: 0,
                },
                {
                  kind: 'all',
                  selectors: [
                    {
                      kind: 'compare',
                      field: 'importanceTier',
                      operator: 'eq',
                      value: 2,
                      coerce: 'number',
                      fallback: 0,
                    },
                    heightAtLeast(36),
                  ],
                },
              ]
            : [
                {
                  kind: 'compare',
                  field: 'importanceTier',
                  operator: 'gte',
                  value: 2,
                  coerce: 'number',
                  fallback: 0,
                },
                {
                  kind: 'all',
                  selectors: [
                    {
                      kind: 'compare',
                      field: 'importanceTier',
                      operator: 'eq',
                      value: 1,
                      coerce: 'number',
                      fallback: 0,
                    },
                    heightAtLeast(24),
                  ],
                },
              ],
      },
    ],
  };
  const legacyBranch: TileflowRenderSelector = {
    kind: 'all',
    selectors: [
      {kind: 'not', selector: hasPublishedTier},
      ...(minimum === 3
        ? ([
            {
              kind: 'compare',
              field: 'buildingTone',
              operator: 'eq',
              value: 'destination',
              fallback: '',
            },
            heightAtLeast(36),
          ] satisfies TileflowRenderSelector[])
        : ([
            {
              kind: 'any',
              selectors: [
                {
                  kind: 'compare',
                  field: 'buildingTone',
                  operator: 'eq',
                  value: 'destination',
                  fallback: '',
                },
                {
                  kind: 'all',
                  selectors: [
                    {
                      kind: 'in',
                      field: 'buildingTone',
                      values: ['active', 'commercial', 'destination'],
                      fallback: '',
                    },
                    heightAtLeast(24),
                  ],
                },
              ],
            },
          ] satisfies TileflowRenderSelector[])),
    ],
  };
  return {
    kind: 'all',
    selectors: [
      {kind: 'geometry', geometry: 'polygon'},
      {kind: 'any', selectors: [publishedBranch, legacyBranch]},
    ],
  };
}

function terminalBuildingRenderStack(): TileflowNamedRenderStack {
  const strongSelector = terminalBuildingImportanceSelector(3);
  const activitySelector = terminalBuildingImportanceSelector(2);
  return {
    ghostAura: renderPass({
      placement: {above: 'buildings.flat.fill'},
      feature: 'building',
      renderer: 'line',
      selector: strongSelector,
      style: {
        blur: 0.8,
        cap: 'round',
        color: expr.case<string>(
          [{when: terminalBuildingIsSelectedDestination, value: terminalPalette.yellow}],
          terminalPalette.neonMagenta,
        ),
        join: 'round',
        minZoom: 15,
        opacity: expr.match<number, number>(
          terminalBuildingImportanceTier,
          [
            {labels: 4, value: 0.22},
            {labels: 3, value: 0.13},
          ],
          0,
        ),
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 3],
          [16, 4],
          [18, 6],
          [22, 10],
        ]),
      },
    }),
    ghostGlow: renderPass({
      placement: {above: 'buildings.render.ghostAura'},
      feature: 'building',
      renderer: 'line',
      selector: activitySelector,
      style: {
        blur: 0.05,
        cap: 'round',
        color: expr.case<string>(
          [{when: terminalBuildingIsSelectedDestination, value: terminalPalette.yellow}],
          terminalPalette.neonMagenta,
        ),
        gapWidth: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 0.7],
          [16, 1.1],
          [18, 1.8],
          [22, 4],
        ]),
        join: 'round',
        minZoom: 15,
        opacity: expr.case<number>(
          [
            {
              when: terminalBuildingIsSelectedDestination,
              value: expr.match<number, number>(
                terminalBuildingImportanceTier,
                [
                  {labels: 4, value: 0.62},
                  {labels: 3, value: 0.44},
                  {labels: 2, value: 0.24},
                ],
                0,
              ),
            },
          ],
          expr.match<number, number>(
            terminalBuildingImportanceTier,
            [
              {labels: 4, value: 0.64},
              {labels: 3, value: 0.48},
              {labels: 2, value: 0.28},
            ],
            0,
          ),
        ),
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 0.35],
          [16, 0.5],
          [18, 0.8],
          [22, 1.6],
        ]),
      },
    }),
    signalTrace: renderPass({
      placement: {above: 'buildings.render.ghostGlow'},
      feature: 'building',
      renderer: 'line',
      selector: strongSelector,
      style: {
        blur: 0,
        cap: 'butt',
        color: expr.case<string>(
          [{when: terminalBuildingIsSelectedDestination, value: '#B3FFC0'}],
          '#D9FFDE',
        ),
        dash: [0.45, 1.25],
        join: 'round',
        minZoom: 15,
        offset: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15.5, -1],
          [18, -1.8],
          [22, -4],
        ]),
        opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 0],
          [
            15.75,
            expr.match<number, number>(
              terminalBuildingImportanceTier,
              [
                {labels: 4, value: 0.62},
                {labels: 3, value: 0.4},
              ],
              0,
            ),
          ],
        ]),
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15.5, 0.55],
          [18, 0.9],
          [22, 1.8],
        ]),
      },
    }),
  };
}

function terminalDestinationRenderStack(): TileflowNamedRenderStack {
  const hudPoiSelector = {
    kind: 'all',
    selectors: [
      {kind: 'geometry', geometry: 'point'},
      {kind: 'has', field: 'poiFilterRank'},
      {
        kind: 'compare',
        field: 'poiFilterRank',
        operator: 'gte',
        value: 0,
        coerce: 'number',
        fallback: 6,
      },
      {
        kind: 'compare',
        field: 'poiFilterRank',
        operator: 'lte',
        value: 2,
        coerce: 'number',
        fallback: 6,
      },
      {kind: 'has', field: 'poiSizeRank'},
      {
        kind: 'compare',
        field: 'poiSizeRank',
        operator: 'gte',
        value: 0,
        coerce: 'number',
        fallback: 17,
      },
      {
        kind: 'compare',
        field: 'poiSizeRank',
        operator: 'lte',
        value: 16,
        coerce: 'number',
        fallback: 17,
      },
    ],
  } as const satisfies TileflowRenderSelector;
  const beaconScale = expr.match<number, number>(
    terminalPoiImportanceTier,
    [
      {labels: 4, value: 1.4},
      {labels: 3, value: 1.2},
      {labels: 2, value: 1},
      {labels: 1, value: 0.78},
    ],
    0,
  );
  return {
    destinationScanRing: renderPass({
      placement: {below: 'poi.transport.label'},
      feature: 'poi',
      renderer: 'circle',
      selector: hudPoiSelector,
      style: {
        color: 'rgba(0, 0, 0, 0)',
        minZoom: 15,
        priority: terminalPoiPlacementPriority,
        radius: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 6],
          [16, 8],
          [18, 14],
          [22, 24],
        ]),
        strokeColor: expr.case<string>(
          [{when: terminalPoiIsActive, value: terminalPalette.acidGreen}],
          expr.match<number, string>(
            terminalHudPoiImportanceTier,
            [
              {labels: 4, value: terminalPalette.yellow},
              {labels: 3, value: terminalPalette.neonMagenta},
            ],
            terminalPalette.neonCyan,
          ),
        ),
        strokeOpacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 0],
          [
            16,
            expr.case<number>(
              [{when: terminalPoiIsActive, value: 1}],
              expr.match<number, number>(
                terminalHudPoiImportanceTier,
                [
                  {labels: 4, value: 0.7},
                  {labels: 3, value: 0.52},
                ],
                0.28,
              ),
            ),
          ],
        ]),
        strokeWidth: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 0.5],
          [18, 1],
          [22, 1.6],
        ]),
      },
    }),
    destinationBeaconCore: renderPass({
      placement: {above: 'poi.render.destinationScanRing'},
      feature: 'poi',
      renderer: 'circle',
      selector: hudPoiSelector,
      style: {
        blur: expr.match<number, number>(
          terminalPoiImportanceTier,
          [
            {labels: 4, value: 0.14},
            {labels: 3, value: 0.1},
            {labels: 2, value: 0.06},
          ],
          0,
        ),
        color: terminalPoiImportanceColor,
        minZoom: 14,
        opacity: expr.match<number, number>(
          terminalPoiImportanceTier,
          [
            {labels: 4, value: 0.96},
            {labels: 3, value: 0.9},
            {labels: 2, value: 0.74},
            {labels: 1, value: 0.46},
          ],
          0,
        ),
        pitchAlignment: 'map',
        pitchScale: 'map',
        priority: terminalPoiPlacementPriority,
        radius: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [14, expr.multiply(1.25, beaconScale)],
          [16, expr.multiply(2.5, beaconScale)],
          [18, expr.multiply(4.5, beaconScale)],
          [22, expr.multiply(9, beaconScale)],
        ]),
        strokeColor: terminalPalette.halo,
        strokeOpacity: 0.9,
        strokeWidth: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [14, 0.5],
          [18, 1],
          [22, 2],
        ]),
      },
    }),
    destinationPoiNode: renderPass({
      placement: {above: 'poi.arts-entertainment.label'},
      feature: 'poi',
      renderer: 'symbol',
      selector: hudPoiSelector,
      style: {
        icon: {
          allowOverlap: false,
          image: 'terminal-poi-node',
          ignorePlacement: false,
          opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
            [15, 0],
            [
              16,
              expr.match<number, number>(
                terminalHudPoiImportanceTier,
                [
                  {labels: 4, value: 0.9},
                  {labels: 3, value: 0.74},
                ],
                0.52,
              ),
            ],
          ]),
          padding: 4,
          size: expr.interpolate({kind: 'linear'}, expr.zoom(), [
            [15, 0.72],
            [16, 1],
            [18, 1.35],
            [22, 1.75],
          ]),
        },
        minZoom: 15,
        priority: expr.subtract(0, terminalPoiPlacementPriority),
        text: {
          allowOverlap: false,
          anchor: 'top',
          color: expr.case<string>(
            [{when: terminalPoiIsActive, value: terminalPalette.acidGreen}],
            expr.match<number, string>(
              terminalHudPoiImportanceTier,
              [
                {labels: 4, value: terminalPalette.yellow},
                {labels: 3, value: terminalPalette.neonMagenta},
              ],
              terminalPalette.neonCyan,
            ),
          ),
          field: expr.coalesce(expr.get(field('name')), ''),
          font: 'Oxanium Medium',
          haloColor: terminalPalette.labelHalo,
          haloWidth: 1.2,
          ignorePlacement: false,
          letterSpacing: 0.055,
          offset: [0, 1.35],
          opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
            [15, 0],
            [16, 0.82],
          ]),
          optional: true,
          padding: 4,
          size: 10,
          transform: 'uppercase',
        },
      },
    }),
  };
}

function terminalWaterRenderStack(): TileflowNamedRenderStack {
  const polygonSelector = {kind: 'geometry', geometry: 'polygon'} as const;
  return {
    shoreAura: renderPass({
      placement: {above: 'water.bodies.fill'},
      feature: 'water',
      renderer: 'line',
      selector: polygonSelector,
      style: {
        blur: 2,
        color: terminalPalette.neonCyan,
        minZoom: 6,
        opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [6, 0],
          [8, 0.16],
        ]),
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [8, 1],
          [14, 3],
          [18, 7],
        ]),
      },
    }),
    shoreCore: renderPass({
      placement: {above: 'water.render.shoreAura'},
      feature: 'water',
      renderer: 'line',
      selector: polygonSelector,
      style: {
        blur: 0.15,
        color: terminalPalette.neonCyan,
        minZoom: 6,
        opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [6, 0],
          [8, 0.58],
        ]),
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [8, 0.3],
          [14, 0.7],
          [18, 1.5],
        ]),
      },
    }),
  };
}

function terminalLandRenderStack(): TileflowNamedRenderStack {
  const polygonSelector = {kind: 'geometry', geometry: 'polygon'} as const;
  return {
    businessGrid: renderPass({
      placement: {above: 'land.landuse.residential.fill'},
      feature: 'landuse',
      renderer: 'fill',
      selector: {
        kind: 'all',
        selectors: [
          polygonSelector,
          {kind: 'compare', field: 'class', operator: 'eq', value: 'business_area', fallback: ''},
        ],
      },
      style: {
        minZoom: 15,
        opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [15, 0],
          [16, 0.08],
          [18, 0.12],
          [22, 0.16],
        ]),
        pattern: 'terminal-data-grid',
      },
    }),
    sectorTrace: renderPass({
      placement: {above: 'land.render.businessGrid'},
      feature: 'landuse',
      renderer: 'line',
      selector: {
        kind: 'all',
        selectors: [
          polygonSelector,
          {
            kind: 'in',
            field: 'class',
            values: [
              'business_area',
              'commercial',
              'retail',
              'industrial',
              'education',
              'school',
              'university',
              'hospital',
              'medical',
            ],
            fallback: '',
          },
        ],
      },
      style: {
        blur: 0,
        color: expr.match<string, string>(
          expr.coalesce(expr.get(field('class')), ''),
          [
            {labels: ['business_area', 'commercial', 'retail'], value: '#43DB60'},
            {labels: ['hospital', 'medical'], value: '#63F77B'},
            {labels: ['education', 'school', 'university'], value: '#87FF98'},
          ],
          '#63F77B',
        ),
        dash: [1.2, 1.8],
        minZoom: 11,
        opacity: 0.34,
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [11, 0.3],
          [16, 0.7],
          [20, 1.2],
        ]),
      },
    }),
    urbanParkTrace: renderPass({
      placement: {above: 'land.landcover.urbanPark.fill'},
      feature: 'landcover',
      renderer: 'line',
      selector: {
        kind: 'all',
        selectors: [
          polygonSelector,
          {kind: 'compare', field: 'class', operator: 'eq', value: 'grass'},
          {kind: 'in', field: 'subclass', values: ['park', 'garden']},
        ],
      },
      style: {
        blur: 0.1,
        color: '#30B94E',
        dash: [2.5, 1.5],
        minZoom: 11,
        opacity: 0.5,
        width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
          [11, 0.35],
          [16, 0.9],
          [20, 1.5],
        ]),
      },
    }),
  };
}

const circularRoadRadiusAtZ15 = expr.toNumber(expr.get(field('circularRadiusAtZoom15')), 0);
const circularRoadRadiusMetres = expr.toNumber(expr.get(field('circularRadiusMeters')), 0);
const circularRoadOuterRadiusMetres = expr.toNumber(
  expr.get(field('circularOuterRadiusMeters')),
  0,
);
const circularRoadInnerRadiusMetres = expr.toNumber(
  expr.get(field('circularInnerRadiusMeters')),
  0,
);
const hasPhysicalCircularRadii = expr.all(
  expr.gt(circularRoadRadiusMetres, 0),
  expr.gt(circularRoadOuterRadiusMetres, circularRoadInnerRadiusMetres),
  expr.gte(circularRoadInnerRadiusMetres, 0),
);
const circularRoadBaseWidth = expr.match<string, number>(
  expr.coalesce(expr.get(field('class')), 'minor'),
  [
    {labels: 'motorway', value: 6},
    {labels: 'trunk', value: 5.5},
    {labels: 'primary', value: 5},
    {labels: 'secondary', value: 4.5},
    {labels: 'tertiary', value: 4},
    {labels: 'service', value: 2.5},
    {labels: 'track', value: 2},
  ],
  3,
);

function circularRoadLegacyScale(level: number) {
  const interpolationBase = 1.35;
  const progress = (interpolationBase ** (level - 15) - 1) / (interpolationBase ** (22 - 15) - 1);
  return 1 + progress * 1.2;
}

function circularRoadWidthAtLevel(level: number): TileflowDataExpressionInput<number> {
  const scale = circularRoadLegacyScale(level);
  return level === 15 ? circularRoadBaseWidth : expr.multiply(circularRoadBaseWidth, scale);
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
    [{when: hasPhysicalCircularRadii, value: physicalInnerRadius}],
    fallbackInnerRadius,
  );
  return expr.max(0, casing ? expr.subtract(innerRadius, roadBorderTotalWidth / 2) : innerRadius);
}

function circularRoadInnerRadius(casing: boolean) {
  return expr.interpolate({kind: 'linear'}, expr.zoom(), [
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
      expr.subtract(circularRoadOuterRadiusMetres, circularRoadInnerRadiusMetres),
      circularRoadRadiusMetres,
    ),
  );
  const physicalOutput = casing ? expr.add(physicalWidth, roadBorderTotalWidth) : physicalWidth;
  const fallbackOutput = casing ? expr.add(fallbackWidth, roadBorderTotalWidth) : fallbackWidth;
  return expr.case<number>(
    [{when: hasPhysicalCircularRadii, value: physicalOutput}],
    fallbackOutput,
  );
}

function circularRoadStrokeWidth(casing: boolean) {
  return expr.interpolate({kind: 'linear'}, expr.zoom(), [
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
  expr.coalesce(expr.get(field('class')), 'minor'),
  [
    {labels: ['trunk', 'secondary'], value: terminalPalette.magenta},
    {labels: ['motorway', 'primary'], value: terminalPalette.cyan},
  ],
  terminalPalette.roadCasing,
);

export const terminalTheme = defineCommunityTheme({
  id: 'terminal-dark',
  version: 1,
  colorScheme: 'dark',
  extraColors: terminalSemanticColors,
  fonts: {default: 'Oxanium Medium', places: 'Oxanium SemiBold'},
  colors: {
    background: terminalPalette.background,
    boundary: terminalPalette.boundary,
    building: terminalPalette.building,
    land: terminalPalette.land,
    park: terminalPalette.park,
    road: terminalPalette.road,
    roadCasing: terminalPalette.roadCasing,
    roadMajor: terminalPalette.road,
    text: terminalPalette.text,
    textHalo: terminalPalette.labelHalo,
    textMuted: terminalPalette.labelMuted,
    water: terminalPalette.water,
  },
  modules: {
    boundaries: {
      admin: terminalPalette.roadCasing,
      disputed: terminalPalette.magenta,
      major: terminalPalette.magenta,
      maritime: '#23933F',
    },
    buildings: {
      active: terminalPalette.buildingActive,
      businessCorridor: '#05210E',
      businessCorridorOutline: terminalPalette.magenta,
      civic: '#05210E',
      commercial: terminalPalette.buildingActive,
      destination: '#05210E',
      extrusion: '#05210E',
      fill: terminalPalette.building,
      generic: terminalPalette.building,
      highRise: '#05210E',
      highRiseOutline: terminalPalette.purple,
      industrial: '#05210E',
      lowRise: '#05210E',
      lowRiseOutline: terminalPalette.buildingOutline,
      outline: terminalPalette.buildingOutline,
      residential: '#05210E',
    },
    hydro: {
      ferry: terminalPalette.roadCasing,
      label: terminalPalette.cyanSoft,
      water: terminalPalette.water,
      waterway: terminalPalette.roadCasing,
    },
    labels: {
      country: terminalPalette.text,
      halo: terminalPalette.labelHalo,
      muted: terminalPalette.labelMuted,
      neighborhood: terminalPalette.labelMuted,
      poi: '#87FF98',
      primary: terminalPalette.text,
      road: terminalPalette.labelMuted,
      settlement: terminalPalette.text,
      water: terminalPalette.labelWater,
    },
    landcover: {
      farmland: '#082F15',
      flowerbed: '#082F15',
      grass: '#05210E',
      ice: '#115827',
      meadow: '#05210E',
      protected: '#05210E',
      recreationGround: '#05210E',
      rock: '#05210E',
      sand: '#082F15',
      scrub: '#05210E',
      urbanPark: terminalPalette.park,
      villageGreen: '#082F15',
      wetland: '#05210E',
      wood: '#05210E',
    },
    landuse: {
      cemetery: '#082F15',
      civic: '#082F15',
      commercial: '#082F15',
      education: '#082F15',
      government: '#082F15',
      industrial: '#05210E',
      medical: '#082F15',
      military: '#082F15',
      parking: '#031509',
      recreation: '#05210E',
      residential: '#082F15',
    },
    poi: {
      'arts-entertainment': terminalPalette.labelCulture,
      education: terminalPalette.cyanSoft,
      'food-drink': '#63F77B',
      halo: terminalPalette.labelHalo,
      icon: terminalPalette.cyan,
      label: terminalPalette.text,
      landmark: terminalPalette.labelCulture,
      lodging: terminalPalette.magentaSoft,
      medical: '#63F77B',
      'park-nature': terminalPalette.green,
      'public-services': terminalPalette.cyanSoft,
      religion: terminalPalette.labelCulture,
      retail: terminalPalette.green,
      'sport-leisure': terminalPalette.green,
      transport: terminalPalette.neonMagenta,
      'visitor-amenity': terminalPalette.cyanSoft,
    },
    roads: {
      bridge: terminalPalette.roadBridge,
      casing: terminalPalette.roadCasing,
      ferry: terminalPalette.cyanMuted,
      minor: terminalPalette.road,
      motorway: terminalPalette.road,
      path: '#05210E',
      primary: terminalPalette.road,
      rail: terminalPalette.orange,
      secondary: terminalPalette.road,
      trunk: terminalPalette.road,
      tunnel: terminalPalette.roadTunnel,
    },
  },
  typography: {
    font: 'Oxanium Medium',
    letterSpacing: 0.045,
    places: {font: 'Oxanium SemiBold', letterSpacing: 0.09},
    poi: {font: 'Oxanium Medium', letterSpacing: 0.055},
    roads: {font: 'Oxanium Medium', letterSpacing: 0.04},
    transform: 'uppercase',
    water: {font: 'Oxanium Medium', letterSpacing: 0.065},
  },
  lighting: {
    anchor: 'viewport',
    color: '#B3FFC0',
    intensity: 0.08,
    position: [1.15, 210, 40],
  },
});

export const terminal = bindCommunityMapTheme(
  defineMap({
    id: 'terminal',
    version: 1,
    name: 'Terminal',
    data: {
      generation: 'v1',
      selection: {kind: 'current', product: 'world-v1'},
      type: 'tileflow-world',
    },
    fonts: [terminalFonts],
    icons: [terminalIcons],
    themes: {dark: terminalTheme},
    defaultTheme: 'dark',
    modules: {
      addresses: disable(),
      aeroways: disable(),
      boundaries: withRenderStack(
        boundaries({
          admin2: {
            color: token.color('boundaries.admin'),
            dash: [10, 0],
            minZoom: 1,
            opacity: 1,
            width: zoom.linear([
              [3, 0.5],
              [12, 2],
            ]),
          },
          admin4: {
            color: token.color('boundaries.regional'),
            dash: [2, 0],
            minZoom: 2,
            opacity: zoom.linear([
              [2, 0],
              [3, 1],
            ]),
            width: zoom.linear([
              [3, 0.3],
              [12, 1.5],
            ]),
          },
          disputed: {
            color: token.color('boundaries.admin'),
            dash: expr.step<readonly number[]>(expr.zoom(), expr.literal([3, 2, 5]), [
              [7, expr.literal([2, 1.5])],
            ]),
            minZoom: 1,
            opacity: 1,
            width: zoom.linear([
              [3, 0.5],
              [12, 2],
            ]),
          },
          maritime: {visible: false},
        }),
        {
          admin2Background: renderPass({
            placement: {below: 'boundaries.admin4'},
            feature: 'boundary',
            renderer: 'line',
            selector: {
              kind: 'all',
              selectors: [
                {
                  kind: 'compare',
                  field: 'adminLevel',
                  operator: 'eq',
                  value: 2,
                  coerce: 'number',
                  fallback: 0,
                },
                {
                  kind: 'compare',
                  field: 'maritime',
                  operator: 'ne',
                  value: 1,
                  coerce: 'number',
                  fallback: 0,
                },
              ],
            },
            style: {
              blur: expr.interpolate({kind: 'linear'}, expr.zoom(), [
                [3, 0],
                [12, 2],
              ]),
              color: token.color('boundaries.halo'),
              minZoom: 1,
              opacity: expr.interpolate({kind: 'linear'}, expr.zoom(), [
                [3, 0],
                [4, 0.5],
              ]),
              width: expr.interpolate({kind: 'linear'}, expr.zoom(), [
                [3, 4],
                [12, 8],
              ]),
            },
          }),
        },
      ),
      buildings: withRenderStack(
        buildings({
          businessCorridor: {
            fill: {visible: false},
            outline: {visible: false},
          },
          flat: {
            fill: {
              color: terminalBuildingGhostFill,
              minZoom: 15,
              opacity: 0.56,
            },
            outline: {
              blur: 0,
              color: terminalBuildingGhostCore,
              minZoom: 15,
              opacity: terminalBuildingGhostCoreOpacity,
              width: zoom.linear([
                [15, 0.55],
                [16, 0.62],
                [18, 0.9],
                [22, 1.8],
              ]),
            },
          },
          mode: 'flat',
        }),
        terminalBuildingRenderStack(),
      ),
      labels: withRenderStack(
        labels({
          aerodromeCodes: 'none',
          junctions: false,
          language: 'local',
          places: 'all',
          roadClasses: [
            'motorway',
            'trunk',
            'primary',
            'secondary',
            'tertiary',
            'minor',
            'service',
          ],
          roads: 'all',
          shields: 'none',
          water: 'major',
        }),
        {
          ...terminalLabelRenderStack(),
          // Scanlines break the roads into phosphor rows; boundaries, buildings and text stay
          // above them.
          crtMask: renderPass({
            placement: 'above-roads',
            renderer: 'background',
            requirements: ['roads'],
            style: {opacity: 0.84, pattern: 'terminal-crt-scanlines'},
          }),
        },
      ),
      land: withRenderStack(
        land({
          background: {color: terminalPalette.land},
          globalLandcover: {
            color: terminalOverviewLandcoverColor,
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
        terminalLandRenderStack(),
      ),
      roads: withRenderStack(
        roads({
          areas: {
            pedestrian: {fill: {visible: false}, outline: {visible: false}},
            pier: {fill: {visible: false}, outline: {visible: false}},
            road: {fill: {visible: false}, outline: {visible: false}},
          },
          classes: {
            motorway: terminalRoadStyle(terminalPalette.cyan, terminalRoadWidths.motorway, {
              minZoom: 3,
              neon: true,
              rampWidths: mapboxMajorRampWidthStops,
            }),
            trunk: terminalRoadStyle(terminalPalette.magenta, terminalRoadWidths.trunk, {
              minZoom: 3,
              neon: true,
              rampWidths: mapboxMajorRampWidthStops,
            }),
            primary: terminalRoadStyle(terminalPalette.cyan, terminalRoadWidths.primary, {
              minZoom: 6,
              neon: true,
              rampWidths: mapboxArterialRampWidthStops,
            }),
            secondary: terminalRoadStyle(terminalPalette.magenta, terminalRoadWidths.secondary, {
              minZoom: 8,
              neon: true,
              rampWidths: mapboxArterialRampWidthStops,
            }),
            tertiary: terminalRoadStyle(terminalPalette.cyanSoft, terminalRoadWidths.tertiary, {
              edgeOpacity: 0.62,
              minZoom: 8,
              rampWidths: mapboxArterialRampWidthStops,
            }),
            minor: terminalRoadStyle(terminalPalette.cyan, terminalRoadWidths.minor, {
              edgeOpacity: 0.64,
              minZoom: 12,
            }),
            service: terminalRoadStyle(terminalPalette.cyanMuted, terminalRoadWidths.service, {
              casingMinZoom: 15,
              edgeOpacity: 0.44,
              minZoom: 14,
              tunnelVisible: false,
            }),
            track: terminalRoadStyle(terminalPalette.cyanMuted, terminalRoadWidths.track, {
              casingMinZoom: 15,
              edgeOpacity: 0.4,
              minZoom: 14,
            }),
            pathway: terminalPathRoadStyle(terminalPalette.road, terminalParkPathWidthStops, {
              casingColor: terminalPalette.roadCasing,
              casingWidth: 0,
              minZoom: 12,
            }),
            footway: terminalPathRoadStyle(terminalPalette.road, terminalParkPathWidthStops, {
              casingColor: terminalPalette.roadCasing,
              casingWidth: 0,
              minZoom: 12,
            }),
            cycleway: terminalPathRoadStyle(terminalPalette.cyan, mapboxPathWidthStops, {
              casingColor: terminalPalette.roadCasing,
              casingGapWidth: roadWidth(mapboxPathWidthStops, 1, false, false),
              fillOpacity: zoom.linear([
                [15, 0],
                [16, 1],
              ]),
              minZoom: 15,
              underlay: {
                cap: pathLineCap,
                color: terminalPalette.road,
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
            }),
            steps: terminalPathRoadStyle(terminalPalette.road, terminalParkPathWidthStops, {
              casingColor: terminalPalette.roadCasing,
              casingMinZoom: 14,
              casingWidth: 0,
              dash: [0.18, 0.15],
              minZoom: 14,
              steps: true,
            }),
            pedestrian: terminalPathRoadStyle(terminalPalette.road, terminalParkPathWidthStops, {
              casingColor: terminalPalette.roadCasing,
              casingMinZoom: 14,
              casingWidth: 0,
              minZoom: 12,
            }),
          },
          detail: 'all',
          extras: {paths: true},
          hierarchy: 'clear',
          modifiers: {
            construction: {
              surface: {
                casing: {color: terminalPalette.roadCasing, dash: [1.5, 1], opacity: 0.82},
                fill: {color: terminalPalette.road, dash: [1.5, 1], opacity: 0.96},
              },
            },
            expressway: {widthScale: expresswayWidthScale},
            indoor: {surface: {casing: {dash: [1, 0]}, fill: {dash: [1, 0]}}},
            ramp: {enabled: false},
            unpaved: {
              surface: {
                casing: {color: terminalPalette.roadCasing, dash: [1, 0], opacity: 0.72},
                fill: {color: terminalPalette.road, dash: [1, 0], opacity: 0.96},
              },
            },
          },
          oneWayMarkers: false,
          outline: 'strong',
          restrictions: {
            access: {
              widthScale: 1,
              surface: {
                casing: {color: terminalPalette.roadCasing, dash: [1, 0], opacity: 0.62},
                fill: {color: terminalPalette.road, dash: [1, 0], opacity: 1},
              },
            },
            toll: {surface: {casing: {opacity: 1}}},
          },
          roundabouts: {
            casing: {
              color: 'rgba(0, 0, 0, 0)',
              minZoom: 15,
              pitchAlignment: 'map',
              pitchScale: 'map',
              radius: circularRoadCasingRadius,
              strokeColor: roundaboutNeonColor,
              strokeWidth: circularRoadCasingWidth,
            },
            fill: {
              color: 'rgba(0, 0, 0, 0)',
              minZoom: 15,
              pitchAlignment: 'map',
              pitchScale: 'map',
              radius: circularRoadRadius,
              strokeColor: terminalPalette.road,
              strokeWidth: circularRoadWidth,
            },
          },
          serviceTypes: {
            alley: {enabled: false},
            crossover: {enabled: false},
            driveway: {enabled: false},
            parkingAisle: {enabled: false},
            yard: {enabled: false},
          },
          sidewalks: {
            outline: {visible: false},
            pattern: {visible: false},
            surface: {visible: false},
          },
          weight: 'regular',
        }),
        {
          ...terminalPathRenderStack(),
          ...terminalPrincipalRoadRenderStack(),
        },
      ),
      transit: transit(mapboxRailTransitStyle(terminalPalette.orange)),
      landforms: disable(),
      poi: withRenderStack(
        poi({
          categories: ['transport', 'arts-entertainment'],
          color: 'category',
          density: 2,
          icons: false,
          labels: true,
          minZoom: 15,
          placement: {
            coupleIconAndLabel: false,
            iconPadding: 4,
            textPadding: 4,
          },
        }),
        {
          ...terminalPoiLabelRenderStack(),
          ...terminalDestinationRenderStack(),
        },
      ),
      vegetation: disable(),
      // Keep hydrography driven solely by Terminal's dark theme.
      water: withRenderStack(water(), terminalWaterRenderStack()),
    },
    projection: 'mercator',
    terrain: 'none',
    view: {
      bearing: 0,
      center: [-3.6942, 40.4146],
      pitch: 0,
      zoom: 15.25,
    },
  }),
);
