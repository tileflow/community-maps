import { cyberpunk as cyberpunkDefinition } from "../maps/cyberpunk";
import { terminal as terminalDefinition } from "../maps/terminal";
import { superTileWorld as superTileWorldDefinition } from "../maps/super-tile-world";
import { freezeCommunityMap } from "./shared/freeze";

export const cyberpunk = freezeCommunityMap(cyberpunkDefinition);
export const terminal = freezeCommunityMap(terminalDefinition);
export const superTileWorld = freezeCommunityMap(superTileWorldDefinition);

export { cyberpunkFonts, cyberpunkIcons } from "../maps/cyberpunk/assets";
export { terminalFonts, terminalIcons } from "../maps/terminal/assets";
export {
  superTileWorldFonts,
  superTileWorldIcons,
  superTileWorldModels,
} from "../maps/super-tile-world/assets";

import {baedeker as baedekerDefinition} from '../maps/baedeker';
export const baedeker = freezeCommunityMap(baedekerDefinition);
export * from '../maps/baedeker/assets';

import {blueprint as blueprintDefinition} from '../maps/blueprint';
export const blueprint = freezeCommunityMap(blueprintDefinition);
export * from '../maps/blueprint/assets';


import {map1777 as map1777Definition} from '../maps/map-1777';
export const map1777 = freezeCommunityMap(map1777Definition);
export * from '../maps/map-1777/assets';

import {siegfried as siegfriedDefinition} from '../maps/siegfried';
export const siegfried = freezeCommunityMap(siegfriedDefinition);
export * from '../maps/siegfried/assets';
export {siegfriedThemes} from '../maps/siegfried/siegfried-themes';
