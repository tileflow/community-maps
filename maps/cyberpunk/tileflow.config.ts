import { defineMap } from "@tileflow/core";
import { cyberpunk } from "../../src/index";

export default defineMap({
  id: "cyberpunk",
  version: 1,
  extends: cyberpunk,
  scenes: {
    madrid: {
      theme: "dark",
      camera: { type: "center", center: [-3.7038, 40.4168], zoom: 14.2 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
  },
});
