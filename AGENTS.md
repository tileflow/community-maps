# Community map contributor guidance

- Keep each map's source, assets, example configuration, and README under `maps/<id>/`.
- Use public Tileflow APIs and the exact dependency versions recorded in `package-lock.json`.
- Do not add documentation/planning directories, internal design notes or private repository links.
- Keep source and artwork attribution, license files, and font provenance with their resources.
- Do not add private infrastructure, credentials, geographic tile archives, or machine-specific paths.
- Run `npm run check` before submitting changes. Inspect a rendered preview for visual changes.
- Keep the root gallery, public exports, map IDs, and README examples synchronized.
- This package is distributed through GitHub. npm publication is not part of its contribution workflow.
