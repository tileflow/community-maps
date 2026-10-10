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
} from "../maps/super-tile-world/assets";
