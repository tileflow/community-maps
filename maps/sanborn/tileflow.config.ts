import {
  addresses,
  aeroways,
  boundaries,
  buildings,
  defineMap,
  defineTheme,
  disable,
  expr,
  field,
  fixed,
  labels,
  land,
  poi,
  renderPass,
  roads,
  token,
  transit,
  water,
  withRenderStack,
  zoom,
  type TileflowAreaStyle,
  type TileflowRoadClassStyle,
  type TileflowSymbolStyle,
} from '@tileflow/core';
import {sanbornFonts, sanbornIcons} from './assets';

// One printed sheet, with no base map, lighting variations, or inherited design.
// These are cartographic tints for mapped uses, not claims about construction materials.
const paper = defineTheme({
  id: 'sanborn-paper',
  version: 1,
  colorScheme: 'light',
  tokens: {
    color: {
      'surface.background': '#F8F2DF',
      'surface.land': '#F8F2DF',
      'surface.building': '#F4DC78',
      'surface.park': '#E0E5C8',
      'surface.water': '#B5D8DA',
      'roads.default': '#FFFBED',
      'roads.major': '#FFFBED',
      'roads.casing': '#81745D',
      'boundaries.default': '#AF574F',
      'labels.primary': '#28271F',
      'labels.muted': '#655F4F',
      'labels.halo': '#FFFBED',
      'building.yellow': '#F4DC78',
      'building.pink': '#ECA2AD',
      'building.blue': '#A9CDD9',
      'building.green': '#B6C694',
      'building.grey': '#D0CEC4',
      'building.ink': '#403C32',
      'block.yellow': '#F2E8BD',
      'block.pink': '#EED8D1',
      'block.blue': '#D5E2DE',
      'block.green': '#D8DFC1',
      'block.outline': '#B6A991',
      'water.ink': '#527D86',
      'rail.ink': '#454038',
      'park.ink': '#75815B',
    },
    font: {
      'type.regular': 'Sanborn Text Regular',
      'type.semibold': 'Sanborn Text Semibold',
      'type.italic': 'Sanborn Text Italic',
    },
    image: {'park.trees': 'sanborn-park'},
  },
  typography: {
    font: 'Sanborn Text Regular',
    places: {font: 'Sanborn Text Semibold'},
    roads: {font: 'Sanborn Text Semibold'},
    poi: {font: 'Sanborn Text Regular'},
    water: {font: 'Sanborn Text Italic'},
  },
});

const c = token.color;
const f = token.font;
const n = (value: number) =>
  fixed(value, {reason: 'Fixed printed Sanborn linework and lettering.'});
const ramp = (stops: readonly (readonly [number, number])[]) =>
  zoom.linear(stops.map(([level, value]) => [level, n(value)] as const));

function area(color: string, minZoom = 7, outline = 'block.outline'): TileflowAreaStyle {
  return {
    fill: {color: c(color), opacity: n(1), minZoom},
    outline: {color: c(outline), width: n(0.55), opacity: n(0.65), minZoom: 13},
  };
}

function street(minZoom: number, width: number): TileflowRoadClassStyle {
  const casing = {color: c('roads.casing'), opacity: n(0.7), minZoom};
  const fill = {
    color: c('roads.default'),
    minZoom,
    width: ramp([
      [8, width * 0.04],
      [12, width * 0.18],
      [16, width],
      [20, width * 5],
    ]),
  };
  return {
    surface: {casing, fill},
    bridge: {casing: {...casing, color: c('building.ink')}, fill},
    tunnel: {
      casing: {...casing, opacity: n(0.3), dash: [n(3), n(2)]},
      fill: {...fill, opacity: n(0.5)},
    },
  };
}

const streetName: TileflowSymbolStyle = {
  placement: 'line',
  priority: 85,
  spacing: n(330),
  text: {
    color: c('labels.primary'),
    font: f('type.semibold'),
    haloColor: c('labels.halo'),
    haloWidth: n(1.8),
    haloBlur: n(0),
    size: ramp([
      [12, 11],
      [15, 13],
      [18, 16],
    ]),
    letterSpacing: n(0.09),
    maxAngle: n(28),
    padding: n(4),
    transform: 'uppercase',
    allowOverlap: false,
    ignorePlacement: false,
  },
};

function place(
  minZoom: number,
  maxZoom: number,
  size: number,
  spacing = 0.12,
): TileflowSymbolStyle {
  return {
    minZoom,
    maxZoom,
    priority: 100,
    text: {
      color: c('labels.primary'),
      font: f('type.semibold'),
      haloColor: c('labels.halo'),
      haloWidth: n(2),
      haloBlur: n(0),
      size: n(size),
      letterSpacing: n(spacing),
      maxWidth: n(10),
      padding: n(8),
      transform: 'uppercase',
      allowOverlap: false,
    },
  };
}

const waterName: TileflowSymbolStyle = {
  text: {
    color: c('water.ink'),
    font: f('type.italic'),
    haloColor: c('surface.water'),
    haloWidth: n(1.8),
    haloBlur: n(0),
    size: ramp([
      [8, 12],
      [16, 16],
    ]),
    letterSpacing: n(0.06),
    maxWidth: n(10),
    padding: n(5),
    allowOverlap: false,
  },
};

function annotation(minZoom: number, prominent = false): TileflowSymbolStyle {
  return {
    minZoom,
    text: {
      color: c('labels.primary'),
      font: f(prominent ? 'type.semibold' : 'type.regular'),
      haloColor: c('labels.halo'),
      haloWidth: n(1.8),
      haloBlur: n(0),
      size: ramp([
        [14, prominent ? 12.5 : 11.5],
        [17, prominent ? 14 : 12.5],
        [20, 15],
      ]),
      letterSpacing: n(prominent ? 0.025 : 0),
      lineHeight: n(1.2),
      maxWidth: n(11),
      padding: n(5),
      allowOverlap: false,
      ignorePlacement: false,
      anchor: 'center',
      justify: 'center',
    },
  };
}

const buildingTint = expr.match(
  expr.coalesce(expr.get(field('use')), expr.get(field('tone')), 'generic'),
  [
    {
      labels: ['apartments', 'commercial', 'retail', 'office', 'hotel', 'active'],
      value: c('building.pink'),
    },
    {
      labels: [
        'industrial',
        'warehouse',
        'manufacture',
        'civic',
        'public',
        'hospital',
        'school',
        'university',
      ],
      value: c('building.blue'),
    },
    {
      labels: [
        'church',
        'cathedral',
        'chapel',
        'mosque',
        'synagogue',
        'temple',
        'religious',
        'destination',
      ],
      value: c('building.green'),
    },
    {labels: ['garage', 'garages', 'shed', 'roof', 'carport'], value: c('building.grey')},
  ],
  c('building.yellow'),
);

export const sanborn = defineMap({
  id: 'sanborn',
  name: 'Sanborn',
  version: 1,
  data: {
    type: 'tileflow-world',
    generation: 'v1',
    selection: {kind: 'current', product: 'world-v1'},
  },
  fonts: [sanbornFonts],
  icons: [sanbornIcons],
  models: [],
  themes: {paper},
  defaultTheme: 'paper',
  timeOfDay: {},
  projection: 'mercator',
  sky: false,
  atmosphere: false,
  camera: {adaptivePerspective: false, pitchLimit: {maxZoom: 24, maxPitch: 0}},
  view: {center: [-90.0645, 29.9589], zoom: 16.3, pitch: 0, bearing: 0},
  modules: {
    land: withRenderStack(
      land({
        background: {color: c('surface.background')},
        globalLandcover: {visible: false},
        activityAreas: {fill: {visible: false}, outline: {visible: false}},
        landuse: {
          residential: area('block.yellow'),
          commercial: area('block.pink'),
          industrial: area('block.blue'),
          railway: area('block.blue'),
          civic: area('block.blue'),
          education: area('block.blue'),
          government: area('block.blue'),
          medical: area('block.blue'),
          military: area('block.pink'),
          recreation: area('block.green'),
          cemetery: area('block.green'),
          parking: area('surface.land', 14),
        },
        landcover: {
          farmland: area('block.yellow'),
          grass: area('surface.park'),
          wood: area('block.green'),
          meadow: area('surface.park'),
          urbanPark: area('surface.park'),
          recreationGround: area('surface.park'),
          villageGreen: area('surface.park'),
          scrub: area('block.green'),
          flowerbed: area('block.pink', 15),
          wetland: area('block.blue'),
          sand: area('block.yellow'),
          rock: area('building.grey'),
          ice: area('roads.default'),
          protected: {fill: {visible: false}, outline: {visible: false}},
        },
      }),
      {
        gardenTrees: renderPass({
          feature: 'landuse',
          renderer: 'fill',
          placement: 'above-land',
          selector: {field: 'class', kind: 'in', values: ['park', 'garden', 'cemetery']},
          style: {pattern: token.image('park.trees'), opacity: n(0.65), minZoom: 14},
        }),
      },
    ),
    water: water({
      bodies: area('surface.water', 0, 'water.ink'),
      intermittent: {bodies: {fill: {color: c('surface.water'), opacity: n(0.5)}}},
      waterways: {
        river: {
          color: c('surface.water'),
          width: ramp([
            [8, 0.7],
            [14, 2],
            [18, 7],
          ]),
        },
        canal: {
          color: c('surface.water'),
          width: ramp([
            [10, 0.7],
            [16, 3],
          ]),
        },
        stream: {
          color: c('water.ink'),
          width: ramp([
            [13, 0.5],
            [18, 1.2],
          ]),
        },
        other: {color: c('water.ink'), width: n(0.7)},
      },
    }),
    buildings: buildings({
      mode: 'flat',
      flat: {
        fill: {color: buildingTint, opacity: n(1), minZoom: 14},
        outline: {
          color: c('building.ink'),
          width: ramp([
            [14, 0.5],
            [16, 0.9],
            [18, 1.2],
          ]),
          opacity: n(0.95),
          minZoom: 14,
        },
      },
      extrusion: {visible: false},
      threeDimensional: {landmarks: false, models: [], shadows: false, windows: false},
    }),
    roads: roads({
      detail: 'all',
      hierarchy: 'subtle',
      weight: 'regular',
      outline: 'subtle',
      oneWayMarkers: false,
      extras: {paths: true},
      classes: {
        motorway: street(4, 16),
        trunk: street(5, 15),
        primary: street(6, 14),
        secondary: street(8, 13),
        tertiary: street(10, 12),
        minor: street(12, 11),
        service: street(14, 5),
        pedestrian: street(13, 8),
        footway: street(14, 2),
        pathway: street(14, 2),
        cycleway: street(14, 2),
        track: street(13, 3),
        steps: street(16, 2),
      },
      areas: {
        pedestrian: area('roads.default', 13),
        road: area('roads.default', 13),
        pier: area('surface.land', 12, 'water.ink'),
      },
      sidewalks: {
        surface: {color: c('surface.land'), opacity: n(1), minZoom: 17},
        outline: {color: c('block.outline'), width: n(0.45), minZoom: 17},
      },
    }),
    transit: transit({
      rail: {
        surface: {
          color: c('rail.ink'),
          width: ramp([
            [9, 0.7],
            [16, 1.4],
          ]),
          minZoom: 9,
        },
        bridge: {color: c('rail.ink'), width: n(1.6), minZoom: 10},
        tunnel: {
          color: c('rail.ink'),
          width: n(0.7),
          dash: [n(3), n(3)],
          opacity: n(0.45),
          minZoom: 14,
        },
      },
      railHatching: {surface: {color: c('rail.ink'), width: n(0.8), minZoom: 14}},
      ferry: {color: c('water.ink'), width: n(1), dash: [n(4), n(3)], minZoom: 11},
      cableway: {visible: false},
    }),
    aeroways: aeroways({
      area: area('block.blue', 10),
      runway: {
        casing: {color: c('building.ink'), opacity: n(0.7)},
        fill: {color: c('roads.default')},
      },
      taxiway: {fill: {color: c('roads.default'), opacity: n(0.7)}},
      runwayRef: {visible: false},
    }),
    boundaries: boundaries({
      admin2: {color: c('boundaries.default'), width: n(1), dash: [n(5), n(3)], maxZoom: 10},
      admin4: {color: c('boundaries.default'), width: n(0.65), dash: [n(3), n(3)], maxZoom: 11},
      disputed: {color: c('boundaries.default'), width: n(0.7), dash: [n(2), n(3)], maxZoom: 10},
      maritime: {visible: false},
    }),
    labels: labels({
      language: 'local',
      places: 'all',
      roads: 'all',
      shields: 'none',
      junctions: false,
      aerodromeCodes: 'none',
      styles: {
        places: {
          continent: place(0, 3, 17, 0.22),
          country: place(1, 8, 18, 0.16),
          city: place(4, 13.5, 21),
          town: place(7, 14.5, 17),
          village: place(9, 15, 14),
          neighborhood: place(12, 16, 15, 0.16),
        },
        roads: {
          motorway: {...streetName, minZoom: 9},
          trunk: {...streetName, minZoom: 10},
          primary: {...streetName, minZoom: 11},
          secondary: {...streetName, minZoom: 12},
          tertiary: {...streetName, minZoom: 13},
          minor: {...streetName, minZoom: 14},
          pedestrian: {...streetName, minZoom: 15},
          service: {...streetName, minZoom: 17},
          footway: {...streetName, minZoom: 17},
          pathway: {...streetName, minZoom: 17},
          cycleway: {...streetName, minZoom: 17},
          track: {...streetName, minZoom: 16},
          steps: {...streetName, minZoom: 18},
        },
        water: {ocean: waterName, line: waterName, other: waterName, waterway: waterName},
      },
    }),
    poi: poi({
      categories: [
        'landmark',
        'religion',
        'public-services',
        'education',
        'medical',
        'transport',
        'arts-entertainment',
        'park-nature',
        'lodging',
        'food-drink',
        'retail',
      ],
      color: 'uniform',
      density: 2,
      minZoom: 14,
      icons: false,
      labels: true,
      placement: {coupleIconAndLabel: false, order: 'categories', textPadding: 5},
      styles: {
        landmark: annotation(14, true),
        religion: annotation(14.5, true),
        'public-services': annotation(15, true),
        education: annotation(15, true),
        medical: annotation(15, true),
        transport: annotation(15, true),
        'arts-entertainment': annotation(15.5),
        'park-nature': annotation(14.5),
        lodging: annotation(16.5),
        'food-drink': annotation(17),
        retail: annotation(17.5),
      },
    }),
    addresses: addresses({
      labels: {
        minZoom: 18,
        text: {
          color: c('labels.muted'),
          font: f('type.regular'),
          haloColor: c('labels.halo'),
          haloWidth: n(1),
          size: n(11),
          padding: n(3),
          allowOverlap: false,
        },
      },
    }),
    landforms: disable(),
    vegetation: disable(),
    nautical: disable(),
  },
  scenes: {
    'new-orleans': {
      theme: 'paper',
      camera: {type: 'center', center: [-90.0645, 29.9589], zoom: 16.3, pitch: 0, bearing: 0},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    'new-orleans-detail': {
      theme: 'paper',
      camera: {type: 'center', center: [-90.0654, 29.9574], zoom: 18, pitch: 0, bearing: 0},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    'new-orleans-mobile': {
      theme: 'paper',
      camera: {type: 'center', center: [-90.0645, 29.9589], zoom: 16.3, pitch: 0, bearing: 0},
      viewport: {width: 390, height: 844, dpr: 2},
    },
    'new-orleans-overview': {
      theme: 'paper',
      camera: {type: 'center', center: [-90.075, 29.965], zoom: 12.5, pitch: 0, bearing: 0},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    madrid: {
      theme: 'paper',
      camera: {type: 'center', center: [-3.7018, 40.4168], zoom: 16.3, pitch: 0, bearing: 0},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
    'san-francisco': {
      theme: 'paper',
      camera: {type: 'center', center: [-122.4095, 37.7973], zoom: 16.3, pitch: 0, bearing: 0},
      viewport: {width: 1440, height: 1000, dpr: 1},
    },
  },
});

export default sanborn;
