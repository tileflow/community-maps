import { defineMap } from "@tileflow/core";
import { superTileWorld } from "../../src/index";

export default defineMap({
  id: "super-tile-world",
  version: 1,
  extends: superTileWorld,
  scenes: {
    madrid: {
      theme: "light",
      camera: { type: "center", center: [-3.6875, 40.4167], zoom: 14.5 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
  },
});
