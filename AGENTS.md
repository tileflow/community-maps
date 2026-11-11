# Community map contributor guidance

- Keep each map's source, assets, example configuration, and README under `maps/<id>/`.
- Use public Tileflow APIs and the exact dependency versions recorded in `package-lock.json`.
- Do not add documentation/planning directories, internal design notes or private repository links.
- Keep source and artwork attribution, license files, and font provenance with their resources.
- Do not add private infrastructure, credentials, geographic tile archives, or machine-specific paths.
- Land changes through a pull request to protected `main`; the `Check maps and package` check must pass.
- Open pull requests as drafts while the change itself is unfinished, saying in a `## Draft until`
  section of the description what remains (work in its scope, or an open maintainer decision that
  would change the code), and mark them ready for review when they are complete and can be merged as they are, even if they
  wait for other work. Do not push after marking ready; convert back to
  draft first (`gh pr ready --undo`). Maintainers merge ready pull requests together in batches, so
  do not merge `main` into a ready pull request or enable auto-merge on it. A dependency never keeps
  a complete pull request in draft: state each in the description as
  `Depends on: tileflow/<repo>#<number>` (ready or draft, in any repository, including the pull
  request it is stacked on) or `Depends on: <release, deploy or data>`; maintainers hold it until
  they land. Neither a conflict with another open pull request nor a consequence maintainers should
  know (changed baselines, a slower default) keeps it in draft; the description states the
  consequence. When it edits the same code as another open pull request (check with
  `git merge-tree --write-tree --name-only HEAD <their head>`), list each in a `## Conflicts`
  section, one per line: `tileflow/<repo>#<number>: <files>; <how to resolve>`. Maintainers resolve
  conflicts when they batch; do not merge `main` or the other branch to resolve them. Editing the
  description after ready is allowed; it is not a push.
- Run `npm run check:ci` for the fast type and model checks. Use `npm run check` when package, SDK,
  or asset-preparation changes need full validation. Inspect a rendered preview for visual changes.
- Keep the root gallery, public exports, map IDs, and README examples synchronized.
- This package is distributed through GitHub. npm publication is not part of its contribution workflow.
