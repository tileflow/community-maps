import { defineMap } from "@tileflow/core";
import { cyberpunk } from "../../src/index";

export default defineMap({
  id: "cyberpunk",
  version: 1,
  extends: cyberpunk,
  scenes: {
    world: {
      theme: "dark",
      camera: { type: "center", center: [0, 20], zoom: 1 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    iberia: {
      theme: "dark",
      camera: { type: "center", center: [-3.7038, 40.4168], zoom: 5 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    network: {
      theme: "dark",
      camera: { type: "center", center: [-3.7038, 40.4168], zoom: 9 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    districts: {
      theme: "dark",
      camera: { type: "center", center: [-3.717546, 40.423407], zoom: 12.9 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    madrid: {
      theme: "dark",
      camera: { type: "center", center: [-3.7038, 40.4168], zoom: 14.2 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    "gran-via": {
      theme: "dark",
      camera: {
        type: "center",
        center: [-3.7034, 40.42005],
        zoom: 16.5,
        bearing: 0,
        pitch: 0,
      },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    retiro: {
      theme: "dark",
      camera: {
        type: "center",
        center: [-3.6909, 40.4115],
        zoom: 16.8,
        bearing: 0,
        pitch: 0,
      },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
    regional: {
      theme: "dark",
      camera: { type: "center", center: [-3.7038, 40.4168], zoom: 11 },
      viewport: { width: 1280, height: 800, dpr: 1 },
    },
  },
});
