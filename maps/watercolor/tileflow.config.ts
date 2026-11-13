import {
  aeroways,
  boundaries,
  defineMap,
  defineTheme,
  disable,
  expr,
  field,
  fixed,
  labels,
  land,
  landforms,
  poi,
  renderPass,
  roads,
  tileflowWorld,
  token,
  transit,
  water,
  withRenderStack,
  zoom,
  type TileflowAreaStyle,
  type TileflowRoadClassStyle,
  type TileflowSymbolStyle,
} from '@tileflow/core';
import {watercolorFonts, watercolorIcons} from './assets';

// This is the complete map. No other map, base theme or provider style is imported.
const palette = {
  paper: '#FBF7EF',
  white: '#FFFDF6',
  ink: '#343642',
  muted: '#595560',
  water: '#80C7CD',
  waterEdge: '#468EAD',
  waterInk: '#28556C',
  green: '#9DBA73',
  greenEdge: '#638D69',
  greenInk: '#385E43',
  urban: '#EAD2BD',
  building: '#B9ABC1',
  buildingEdge: '#8D7B9E',
  gold: '#E8CF86',
  sand: '#F0DEAC',
  ice: '#DEEBE8',
  rock: '#D8D0CE',
  coral: '#CB805E',
  amber: '#E2AB73',
  path: '#9E8979',
  boundary: '#AD8195',
} as const;
type Pigment = keyof typeof palette;
const c = (name: Pigment) => token.color(name);
const n = (value: number) =>
  fixed(value, {reason: 'Watercolor has one fixed printed appearance.'});
const z = (stops: readonly (readonly [number, number])[]) =>
  zoom.linear(stops.map(([level, value]) => [level, n(value)] as const));
const groundOpacity = (opacity: number) =>
  z([
    [8, 0],
    [9, opacity * 0.35],
    [10, opacity * 0.65],
    [11, opacity * 0.85],
    [12, opacity],
  ]);
const patternNames = [
  'paper',
  'water',
  'green',
  'urban',
  'building',
  'gold',
] as const;
type Wash = (typeof patternNames)[number];
const wash = (name: Wash) => token.image(name);

const theme = defineTheme({
  id: 'watercolor-pigment',
  version: 1,
  colorScheme: 'light',
  tokens: {
    color: {
      ...palette,
      'surface.background': palette.paper,
      'surface.land': palette.paper,
      'surface.water': palette.water,
      'surface.park': palette.green,
      'surface.building': palette.building,
      'boundaries.default': palette.boundary,
      'roads.default': palette.white,
      'roads.casing': palette.urban,
      'roads.major': palette.amber,
      'labels.primary': palette.ink,
      'labels.muted': palette.muted,
      'labels.halo': palette.white,
    },
    font: {regular: 'Lato Regular', bold: 'Lato Bold', italic: 'Lato Italic'},
    image: {
      ...Object.fromEntries(
        patternNames.map((name) => [name, `watercolor-${name}`]),
      ),
      marker: 'watercolor-marker',
      landmark: 'watercolor-landmark',
    },
  },
  typography: {
    font: token.font('regular'),
    letterSpacing: n(0.015),
    places: {font: token.font('bold')},
    roads: {font: token.font('regular')},
    poi: {font: token.font('regular')},
    water: {font: token.font('italic')},
  },
  lighting: {intensity: n(0)},
});

function paintedArea(
  pigment: Pigment,
  texture: Wash,
  edge: Pigment,
  opacity = 1,
): TileflowAreaStyle {
  return {
    fill: {
      color: c(pigment),
      pattern: wash(texture),
      minZoom: 8,
      opacity: groundOpacity(opacity),
    },
    outline: {
      color: c(edge),
      minZoom: 8,
      width: z([
        [8, 1],
        [10, 3],
        [13, 5],
      ]),
      blur: z([
        [8, 1],
        [10, 2.5],
        [13, 4],
      ]),
      opacity: groundOpacity(0.25),
    },
  };
}

function road(
  pigment: Pigment,
  minZoom: number,
  major = false,
): TileflowRoadClassStyle {
  const fill = {
    color: c(pigment),
    minZoom,
    opacity: n(0.95),
    blur: n(major ? 0.65 : 0.3),
  };
  const casing = {
    color: c(major ? 'coral' : 'urban'),
    minZoom,
    opacity: n(0.5),
    blur: n(1.4),
  };
  return {
    surface: {casing, fill},
    bridge: {casing: {...casing, color: c('paper'), opacity: n(0.92)}, fill},
    tunnel: {
      casing: {...casing, opacity: n(0.16)},
      fill: {...fill, opacity: n(0.4)},
    },
  };
}

function path(minZoom: number): TileflowRoadClassStyle {
  const style = road('white', minZoom);
  return {
    ...style,
    surface: {
      casing: {color: c('path'), opacity: n(0.35), blur: n(0.8), minZoom},
      fill: {color: c('white'), opacity: n(0.85), minZoom},
    },
  };
}

const roadName = {
  placement: 'line',
  minZoom: 12,
  priority: 70,
  spacing: n(330),
  text: {
    font: token.font('regular'),
    color: c('ink'),
    haloColor: c('white'),
    haloWidth: n(1.3),
    haloBlur: n(0.5),
    padding: n(3),
    maxAngle: n(35),
    size: z([
      [12, 11],
      [16, 13],
      [19, 15],
    ]),
  },
} satisfies TileflowSymbolStyle;

function place(size: number, minZoom = 0): TileflowSymbolStyle {
  return {
    minZoom,
    text: {
      font: token.font('bold'),
      color: c('ink'),
      haloColor: c('white'),
      haloWidth: n(1.5),
      haloBlur: n(0.6),
      padding: n(5),
      size: n(size),
      letterSpacing: n(0.03),
    },
  };
}

const poiText = {
  font: token.font('regular'),
  color: c('ink'),
  haloColor: c('white'),
  haloWidth: n(1.3),
  haloBlur: n(0.5),
  maxWidth: n(9),
  size: z([
    [13, 11.5],
    [16, 13],
    [19, 14],
  ]),
};
const poiIcon = {image: token.image('marker'), size: n(0.65)};
const categories = [
  'landmark',
  'park-nature',
  'arts-entertainment',
  'transport',
  'religion',
  'education',
  'medical',
  'public-services',
  'food-drink',
  'lodging',
  'retail',
  'sport-leisure',
  'visitor-amenity',
] as const;
const waterName = {
  text: {
    font: token.font('italic'),
    color: c('waterInk'),
    haloColor: c('white'),
    haloWidth: n(1.2),
    haloBlur: n(0.5),
    letterSpacing: n(0.045),
    size: z([
      [5, 13],
      [12, 14],
      [17, 16],
    ]),
  },
} satisfies TileflowSymbolStyle;

export default defineMap({
  id: 'watercolor',
  name: 'Watercolor',
  version: 1,
  data: tileflowWorld(),
  fonts: [watercolorFonts],
  icons: [watercolorIcons],
  models: [],
  themes: {watercolor: theme},
  defaultTheme: 'watercolor',
  projection: 'globe',
  terrain: 'none',
  atmosphere: false,
  sky: false,
  camera: {adaptivePerspective: false, pitchLimit: {maxZoom: 24, maxPitch: 0}},
  view: {center: [-0.133, 51.505], zoom: 13.2, pitch: 0, bearing: 0},
  modules: {
    addresses: disable(),
    nautical: disable(),
    vegetation: disable(),
    buildings: disable(),
    land: withRenderStack(
      land({
        background: {color: c('paper'), pattern: wash('paper')},
        // World supplies continuous physical cover through z10. Keep its washes under
        // the detailed OSM polygons, fading out before the source stops at z11.
        globalLandcover: {
          minZoom: 0,
          maxZoom: 11,
          color: expr.match(
            field('class'),
            [
              {labels: ['trees', 'grass', 'shrub'], value: c('green')},
              {labels: 'crop', value: c('gold')},
              {labels: 'urban', value: c('urban')},
              {labels: 'barren', value: c('sand')},
              {labels: 'snow', value: c('ice')},
            ],
            c('paper'),
          ),
          pattern: expr.match(
            field('class'),
            [
              {labels: ['trees', 'grass', 'shrub'], value: wash('green')},
              {labels: 'crop', value: wash('gold')},
              {labels: 'urban', value: wash('urban')},
            ],
            wash('paper'),
          ),
          opacity: z([
            [0, 0.58],
            [6, 0.65],
            [8, 0.65],
            [9, 0.5],
            [10, 0.28],
            [11, 0],
          ]),
        },
        landcover: {
          wood: paintedArea('green', 'green', 'greenEdge'),
          urbanPark: paintedArea('green', 'green', 'greenEdge'),
          grass: paintedArea('green', 'green', 'greenEdge', 0.75),
          meadow: paintedArea('green', 'green', 'greenEdge', 0.8),
          scrub: paintedArea('green', 'green', 'greenEdge', 0.65),
          villageGreen: paintedArea('green', 'green', 'greenEdge', 0.85),
          recreationGround: paintedArea('green', 'green', 'greenEdge', 0.8),
          protected: {fill: {visible: false}, outline: {visible: false}},
          farmland: paintedArea('gold', 'gold', 'path', 0.8),
          flowerbed: paintedArea('gold', 'gold', 'coral'),
          sand: {fill: {color: c('sand'), opacity: groundOpacity(0.85)}},
          ice: {fill: {color: c('ice'), opacity: groundOpacity(1)}},
          rock: {fill: {color: c('rock'), opacity: groundOpacity(0.7)}},
          wetland: paintedArea('water', 'water', 'greenEdge', 0.4),
        },
        landuse: {
          residential: paintedArea('urban', 'urban', 'path', 0.75),
          commercial: paintedArea('urban', 'urban', 'coral', 0.9),
          civic: paintedArea('urban', 'urban', 'coral'),
          education: paintedArea('gold', 'gold', 'path', 0.55),
          government: paintedArea('urban', 'urban', 'coral'),
          medical: paintedArea('urban', 'urban', 'coral', 0.8),
          industrial: paintedArea('building', 'building', 'buildingEdge', 0.4),
          military: paintedArea('building', 'building', 'buildingEdge', 0.25),
          parking: {fill: {color: c('paper'), opacity: groundOpacity(0.6)}},
          railway: {fill: {color: c('rock'), opacity: groundOpacity(0.3)}},
          cemetery: paintedArea('green', 'green', 'greenEdge', 0.75),
          recreation: paintedArea('green', 'green', 'greenEdge', 0.8),
        },
        activityAreas: {fill: {visible: false}, outline: {visible: false}},
      }),
      {
        // Paint footprints directly so no building scene, landmarks or extrusion fallback exists.
        buildingWash: renderPass({
          feature: 'building',
          renderer: 'fill',
          placement: 'below-roads',
          style: {
            color: c('building'),
            pattern: wash('building'),
            minZoom: 14,
            opacity: z([
              [14, 0],
              [15, 0.62],
              [17, 0.85],
            ]),
          },
        }),
        buildingEdges: renderPass({
          feature: 'building',
          renderer: 'line',
          placement: 'below-roads',
          style: {
            color: c('buildingEdge'),
            minZoom: 15,
            opacity: n(0.45),
            width: n(0.6),
            blur: n(0.5),
          },
        }),
      },
    ),
    water: withRenderStack(
      water({
        bodies: {
          fill: {color: c('water'), pattern: wash('water')},
          outline: {
            color: c('waterEdge'),
            width: n(2.5),
            blur: n(1.8),
            opacity: n(0.55),
          },
        },
        waterways: Object.fromEntries(
          ['river', 'canal', 'stream', 'other'].map((name) => [
            name,
            {color: c('waterEdge'), opacity: n(0.7), blur: n(0.75)},
          ]),
        ),
      }),
      {
        shorelineBloom: renderPass({
          feature: 'water',
          renderer: 'line',
          placement: 'below-water',
          style: {color: c('water'), width: n(9), blur: n(7), opacity: n(0.4)},
        }),
      },
    ),
    roads: roads({
      detail: 'all',
      hierarchy: 'clear',
      outline: 'subtle',
      weight: 'regular',
      extras: {paths: true},
      oneWayMarkers: false,
      streetLights: {enabled: false},
      classes: {
        motorway: road('amber', 5, true),
        trunk: road('amber', 6, true),
        primary: road('amber', 7, true),
        secondary: road('white', 9, true),
        tertiary: road('white', 11),
        minor: road('white', 12),
        service: road('white', 15),
        pedestrian: path(13),
        footway: path(14),
        pathway: path(14),
        track: path(13),
        cycleway: path(14),
        steps: path(16),
      },
      areas: {
        pedestrian: {fill: {color: c('paper')}},
        pier: {
          fill: {color: c('paper')},
          outline: {color: c('waterEdge'), width: n(0.6)},
        },
        road: {fill: {color: c('white'), opacity: n(0.8)}},
      },
    }),
    boundaries: boundaries({
      admin2: {
        color: c('boundary'),
        width: n(1.4),
        opacity: n(0.6),
        dash: fixed([4, 3], {
          reason: 'Printed administrative boundary rhythm.',
        }),
      },
      admin4: {color: c('boundary'), width: n(0.8), opacity: n(0.35)},
      maritime: {visible: false},
    }),
    aeroways: aeroways({
      area: {fill: {color: c('rock'), opacity: n(0.35)}},
      runway: {
        fill: {color: c('white')},
        casing: {color: c('buildingEdge'), opacity: n(0.35)},
      },
      taxiway: {
        fill: {color: c('white')},
        casing: {color: c('buildingEdge'), opacity: n(0.2)},
      },
      runwayRef: {visible: false},
    }),
    transit: transit({
      rail: {
        surface: {
          color: c('buildingEdge'),
          width: n(1),
          opacity: n(0.6),
          minZoom: 11,
        },
        bridge: {color: c('buildingEdge'), width: n(1), opacity: n(0.6)},
        tunnel: {visible: false},
      },
      railHatching: {
        surface: {visible: false},
        bridge: {visible: false},
        tunnel: {visible: false},
      },
      serviceRail: {
        surface: {visible: false},
        bridge: {visible: false},
        tunnel: {visible: false},
      },
      ferry: {
        color: c('waterInk'),
        opacity: n(0.3),
        width: n(0.7),
        minZoom: 12,
        dash: fixed([3, 6], {
          reason: 'Quiet ferry routes beneath the water labels.',
        }),
      },
    }),
    landforms: landforms({
      elevation: false,
      classes: {
        peak: {
          ...place(12, 11),
          text: {...place(12).text, font: token.font('italic')},
        },
      },
    }),
    labels: labels({
      language: 'local',
      places: 'all',
      roads: 'all',
      water: 'all',
      shields: 'none',
      junctions: false,
      aerodromeCodes: 'none',
      collisionPriority: 'navigation',
      roadGrouping: 'network',
      styles: {
        places: {
          continent: {
            ...place(23),
            text: {
              ...place(23).text,
              size: z([
                [0, 11],
                [2, 17],
                [3, 23],
              ]),
              opacity: z([
                [0.8, 0],
                [1.5, 1],
              ]),
            },
          },
          country: {
            ...place(20, 1.8),
            text: {
              ...place(20).text,
              size: z([
                [1.8, 11],
                [3, 14],
                [5, 20],
              ]),
              opacity: z([
                [1.8, 0],
                [2.8, 1],
              ]),
            },
          },
          state: place(16),
          city: place(18),
          town: place(15),
          village: place(13),
          neighborhood: {
            ...place(12, 12),
            text: {...place(12).text, color: c('muted')},
          },
          other: place(12, 13),
        },
        roads: Object.fromEntries(
          [
            'motorway',
            'trunk',
            'primary',
            'secondary',
            'tertiary',
            'minor',
            'service',
            'pedestrian',
            'footway',
            'pathway',
            'track',
            'cycleway',
            'steps',
          ].map((name) => [
            name,
            {
              ...roadName,
              minZoom: [
                'service',
                'steps',
                'footway',
                'pathway',
                'track',
                'cycleway',
              ].includes(name)
                ? 16
                : 12,
            },
          ]),
        ),
        water: {
          ocean: waterName,
          line: waterName,
          waterway: waterName,
          other: waterName,
        },
      },
    }),
    poi: poi({
      categories,
      color: 'uniform',
      density: 2,
      minZoom: 13,
      icons: true,
      labels: true,
      densityByCategory: {
        landmark: 3,
        'park-nature': 3,
        retail: 1,
        'food-drink': 1,
      },
      placement: {
        order: 'importance',
        prominentRank: 1,
        coupleIconAndLabel: true,
        iconPadding: 2,
        textPadding: 4,
      },
      styles: Object.fromEntries(
        categories.map((category) => [
          category,
          {
            text: {
              ...poiText,
              color: c(category === 'park-nature' ? 'greenInk' : 'ink'),
            },
            icon:
              category === 'landmark'
                ? {...poiIcon, image: token.image('landmark')}
                : poiIcon,
          },
        ]),
      ),
    }),
  },
  scenes: {
    globe: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-4, 35], zoom: 1.8},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    iberia: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-4, 40], zoom: 5.8},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    regional: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-4.6, 40.3], zoom: 8},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    landscape: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-4.6, 40.3], zoom: 10},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    london: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-0.133, 51.505], zoom: 13.2},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    detail: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-0.129, 51.511], zoom: 16.1},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    coast: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-122.465, 37.79], zoom: 12.7},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    countryside: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-2.93, 54.36], zoom: 11.1},
      viewport: {width: 1440, height: 900, dpr: 1},
    },
    mobile: {
      theme: 'watercolor',
      camera: {type: 'center', center: [-0.133, 51.505], zoom: 14.2},
      viewport: {width: 390, height: 844, dpr: 2},
    },
  },
});
