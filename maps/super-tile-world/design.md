# Super Tile World design

`superTileWorld` is an independent toy-world showcase inspired by the rounded volumes and
cheerful colors of Super Mario 3D World. It keeps its original golden routes, arcade typography,
layered shores and destination icons, while giving the landscape real three-dimensional trees.
The normal World geography remains interactive; colors use the published `building_tone` field.

Ground decoration follows the same toy scale: broad mown bands on grass, rounded patches and
two small three-flower clusters per meadow tile. Translucent pattern shapes preserve the
underlying park/grass colors; bands enter mapped grass at z11. Urban land is warm cream
(`#EFE4C2`), while building colors and the blue water fill stay unchanged. Rivers and lakes
have an earth outer edge, a cream bank and a soft turquoise waterline, scaled with zoom.
Mapped sand and rock share low-contrast horizontal strata; rock uses warm ochre rather than
the lavender reserved for destinations. All details follow existing geographic polygons.

The map declares its own icons, fonts and models. All artwork belongs to this map directory.
Six original GLB forms have smooth normals and matching near/far geometry: a bell crown,
a lobed deciduous crown, a layered leafy crown, a three-tier evergreen, a narrow column and an arched palm.
The bell profile follows the domed top, flared lower rim, broad horizontal bands and pale trunk
visible in Super Bell Hill screenshots. Foliage is predominantly green, with lime-to-yellow
accents among the bell crowns; conifers and palms retain green palettes. The deciduous crown references 3D World’s rounded
foliage; the layered crown references 3D Land’s overlapping leaf skirts. All geometry is authored here, without extracted models.
They use the SDK's instanced vegetation renderer and shared sunlight/shadows. Near meshes use
120–480 triangles; far meshes use 60–120. There are no leaf textures or billboard planes.
See [model sources](assets/models/README.md) for reproducible generation and budgets.

Trees come from geographic points and rows, following any supplied form or species. Unknown
forms use a 5:3:2 round/open/tall mix. Round and open forms each choose between bell and
lobed crowns, while tall forms use layered foliage; stable model variants keep nearby trees
from sharing one silhouette even when their data gives the same broadleaf form. Grass polygons are not permission to scatter
fictional trees. Missing tree data leaves quiet ground detail. The meadow and forest patterns
contain only grass, flowers and leaf marks, never miniature trees or hills. The retained
`stw-tree` asset is available to existing consumers but is not referenced by this design.

Vegetation selects `mode: "3d"`, including overhead views, and `fallback: "none"`. A renderer
without 3D vegetation still has legible park and forest polygons. A runtime trees-off control
hides the models without revealing tree sprites underneath. The example scene opens over
Madrid at z16.6, pitch 48°, bearing −18°, so buildings and trees can be seen together.

Building footprints remain the portable 2D base. When attached, Tileflow's 3D scene uses real
footprints/heights, sun lighting, a 1 m exterior corner radius, restrained edge light (0.22),
contact shadows and subtle brightness variation (0.06). Warm apricot blocks, red civic buildings,
purple major destinations and blue industry keep the semantic palette readable. Architectural
models use cream surfaces, red roofs, gold accents and blue glass. Ordinary buildings retain a
single base color, with procedural brick joints on walls, a quieter square grid on roofs and a
light cornice band. The oversized 10 × 5 m bricks and low-contrast roof joints preserve the
toy-like scale. These decorative surfaces require the updated Core surface-material API; they
add no image textures or brick geometry. Roof grids stay fixed during camera movement, and
fine detail fades with distance. The cornice changes surface shading without projecting beyond
the footprint. Separate wall/roof base colors remain outside this design.
No fictional roof shape or height is inferred when World does not supply one. Translated fake
building sides and repeated brick overlays have been retired; park edges remain gently raised.

| Zoom | Treatment |
| --- | --- |
| 0–9 | Display lettering, broad colored landscapes, sparse floor marks and layered shores. |
| 10–14 | City castles, dotted golden routes, raised gardens and district blocks. |
| 15–16 | Smooth 3D tree forms and buildings when the scene is enabled; street labels and selected destinations. |
| 17–19 | Pedestrian coin trails, closer tree geometry and supporting destinations. |
| 20+ | Address detail and larger lettering; decorative coin trails retire. |

Underground roads use fine earth-colored dashes with square-cut ends and no continuous casing.
Their width is independent of the surface road hierarchy and capped at close zooms, keeping
parallel tunnel carriageways quiet beneath parks. Major tunnels enter at z13; local tunnels
wait until z15 or their class's later minimum zoom. Golden routes, level dots and coin trails
belong to surface roads and bridges; coins never decorate underground paths. Tunnel portals
are not inferred from tile-clipped line endpoints.

POI icons and names share collision placement. Their selectors retain category, filter ranks 0–5,
size ranks 0–16 and producer minimum zoom. Before z17, featured categories admit filter ranks
up to 2 and supporting categories stop at 1. At z17, all categories admit ranks up to 3; from z18
up to 5, allowing ordinary shops and food destinations into close street views. Generic transit
facilities enter at z18; real stations can appear earlier. Unranked candidates are not invented
as destinations. Airports have a separate airship label; small culture POIs wait until z17.

World’s current release has pier polygons but no `transportation_outline` source layer. Pier
fill remains enabled; its optional outline is disabled so the browser does not request a missing
source layer. This keeps Gallery’s real load-error reporting intact.
