# Super Tile World design

`superTileWorld` is an independent pixel-art showcase named “Super Tile World”, inspired by the
playful overworld of Super Mario World. It translates real geographic features into a game board:
raised green landscapes, layered blue shores, golden routes, block-like buildings, and destination
sprites. Transit stations become warp pipes, landmarks become castles or stars, and everyday
places use a coordinated vocabulary of mushrooms, question blocks, coins, hearts, and flags.
Its own semantic render stacks define the composition; it does not import an existing map or
post-process screenshots. The normal World geography remains interactive at every zoom.
Building colors use the published World `building_tone`, not an unpublished building-kind field.

The map declares `[superTileWorldIcons]` for sixteen original SVG sprites and seven repeating
pixel patterns, plus `[superTileWorldFonts]` for local Pixelify Sans Regular and SemiBold detail
lettering, Tile World Arcade Regular display lettering, and Noto Sans Regular fallback. The small-scale world, district board,
and close street views use different geometry and label densities. The result intentionally
prioritizes an expressive showcase over navigation. Asset sources and licenses are documented in
`assets/README.md` and `THIRD_PARTY_NOTICES.md`.

| Zoom  | Showcase treatment                                                                            |
| ----- | --------------------------------------------------------------------------------------------- |
| 0–9   | Pixel display lettering, broad colored landscapes, forest tiles, and layered shores.          |
| 10–14 | City castles and settlement nodes, dotted golden routes, raised gardens, and district blocks. |
| 15–16 | Building footprints, street labels, and selected destination sprites.                         |
| 17–19 | Brick roof texture, pedestrian coin trails, point trees, and supporting destinations.         |
| 20+   | Address detail and larger close-view lettering; decorative coin trails retire.                |

Platform depth uses ordered, translated 2D fills rather than terrain or building extrusion.
Optional tree sprites inherit the vegetation anchor, so sources without tree capability omit
them. POI sprites and names share collision placement. Their selectors retain category,
filter ranks 0–5, size ranks 0–16, and the producer's minimum zoom. Before z17, featured categories
admit filter ranks up to 2 and supporting categories stop at 1. At z17, all categories admit ranks
up to 3; from z18 they admit ranks up to 5, allowing ordinary shops and food destinations to join
the close street view. Generic transit facilities enter at z18, while real stations can appear earlier. Unranked or invalid candidates are not turned into
fictional destinations. Airports have a separate airship label, and small secondary culture POIs
wait until z17. Every decision follows schema-bound fields rather than geographic exceptions.
