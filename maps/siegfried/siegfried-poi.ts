import {expr, field, poi, zoom, type TileflowPoiCategory, type TileflowPoiCategoryStyle} from '@tileflow/core';
import {siegfriedVisual as visual} from './siegfried-themes';

const symbols = visual.symbol;
const categorySymbols = {
  landmark: symbols.landmark,
  transport: symbols.transport,
  religion: symbols.worship,
  'arts-entertainment': symbols.museum,
  education: symbols.education,
  medical: symbols.medical,
  'public-services': symbols.services,
  lodging: symbols.lodging,
  'park-nature': symbols.park,
  'visitor-amenity': symbols.viewpoint,
  'food-drink': symbols.food,
  retail: symbols.shop,
  'sport-leisure': symbols.sport,
} satisfies Record<TileflowPoiCategory, unknown>;

/** One ranked placement layer keeps names and pictograms together across categories. */
export const siegfriedPoi = poi({
  categories: Object.keys(categorySymbols) as TileflowPoiCategory[],
  color: 'uniform',
  minZoom: 12,
  density: 1,
  densityByCategory: {landmark: 2, transport: 2, 'park-nature': 2},
  detailZoom: 17.5,
  icons: true,
  labels: true,
  placement: {
    order: 'importance',
    coupleIconAndLabel: true,
    iconPadding: 3,
    textPadding: 3,
    iconOnlyTypes: ['drinking_water', 'spring'],
  },
  styles: Object.fromEntries(Object.entries(categorySymbols).map(([category, fallback]) => [
    category,
    {
      icon: {
        image: expr.match(expr.get(field('type')), [
          {labels: ['christian_place_of_worship', 'church', 'cathedral', 'chapel'], value: symbols.church},
          {labels: ['train_station'], value: symbols.station},
          {labels: ['ferry_terminal'], value: symbols.ferry},
          {labels: ['alpine_hut', 'wilderness_hut', 'shelter'], value: symbols.refuge},
          {labels: ['ruins', 'archaeological_site'], value: symbols.ruins},
          {labels: ['scenic_viewpoint', 'viewpoint', 'observation_tower'], value: symbols.viewpoint},
          {labels: ['drinking_water', 'spring', 'fountain'], value: symbols.water},
        ], fallback),
        color: visual.color.ink,
        haloColor: visual.color.paper,
        haloWidth: 0.65,
        size: zoom.linear([[12, 1.15], [16, 1.3], [19, 1.4]]),
      },
      text: {
        color: visual.color.ink,
        font: visual.font.regular,
        haloColor: visual.color.paper,
        haloWidth: 1.6,
        haloBlur: 0.05,
        letterSpacing: 0.005,
        lineHeight: 1.15,
        maxWidth: 10,
        radialOffset: 0.9,
        variableAnchors: ['left', 'right', 'top', 'bottom'],
        size: zoom.linear([[12, 12], [16, 13], [19, 14]]),
      },
    } satisfies TileflowPoiCategoryStyle,
  ])),
});
