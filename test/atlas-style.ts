import {createStyle as compileStyle, type MapLibreStyle} from '@tileflow/core';
import {createStyleWithInspection as inspectStyle} from '@tileflow/core/build';
import type {FilterSpecification} from '@maplibre/maplibre-gl-style-spec-v5';

// Core's portable output intentionally leaves renderer properties open. The atlas tests inspect
// MapLibre properties after validating the compiled style, with explicit dictionary access.
export type AtlasLayer = {
  id: string;
  metadata?: unknown;
  type: string;
  source?: string;
  'source-layer'?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: FilterSpecification;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};
export type AtlasStyle = Omit<MapLibreStyle, 'layers'> & {layers: AtlasLayer[]};
export function createStyle(...args: Parameters<typeof compileStyle>): AtlasStyle {
  return compileStyle(...args) as AtlasStyle;
}
export function createStyleWithInspection(...args: Parameters<typeof inspectStyle>) {
  const compiled = inspectStyle(...args);
  return {...compiled, style: compiled.style as AtlasStyle};
}
