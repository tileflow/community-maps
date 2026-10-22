import { defineMap } from "@tileflow/core";
import { superTileWorld } from "../../src/index";

export default defineMap({
  id: "super-tile-world",
  version: 1,
  extends: superTileWorld,
  scenes: {
    madrid: {
      theme: "light",
      camera: {
        type: "center",
        center: [-3.6914, 40.4178],
        zoom: 16.6,
        pitch: 48,
        bearing: -18,
      },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
  },
});
