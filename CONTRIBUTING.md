# Contributing

Share a map people can inspect, run, and adapt. Open an issue to discuss a design or submit a pull
request with the complete source and a preview.

## Add a map

Create `maps/<map-id>/` with:

- `index.ts`: the complete map definition using public `@tileflow/core` APIs.
- `assets.ts`: package-directory descriptors pointing to this map's assets.
- `assets/icons/` and, when needed, `assets/fonts/`: original or redistributable assets and licenses.
- `tileflow.config.ts`: a runnable configuration with a useful initial camera.
- `README.md`: description, author credit, usage, data requirements, and asset attribution.
- `preview.webp`: a representative capture with its map-data attribution recorded in the README.

Register the map and its assets in `src/index.ts`, add preview/build scripts in `package.json`,
and include it in the tests and root gallery. IDs use lowercase letters and hyphens; exports use
camelCase. Keep all resources inside the package so a fresh installation can resolve them.

Use artwork you created or have permission to redistribute under its stated license. Keep complete
third-party notices with the files they cover. Do not add credentials, private URLs, tile archives,
or artwork copied from games or other products without permission.

## Check your contribution

```sh
npm ci
npm run check
```

Preview your map at city and neighborhood zoom levels. Check label readability, collision behavior,
icon sizing, and font loading. Include a representative screenshot in your pull request and explain
which visual behavior changed. Automated checks cover map compilation, MapLibre style validation,
font/icon preparation, and use from a packed installation.

The dependency versions and lockfile are intentional. Update them together and verify a clean
installation when changing SDK versions. The package is distributed through GitHub; do not add an
npm publication workflow as part of a map contribution.
