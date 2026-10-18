# Cyberpunk design

`cyberpunk` is a self-contained dark city map with a 2D base and optional low relief. Its road hierarchy, building signals,
category signs, semantic render passes, theme, World data selection, `[cyberpunkIcons]`
and `[cyberpunkFonts]` are declared directly; it does not import or extend `streets`.

The overview has its own scale hierarchy. Zooms 0–5 use subdued blue-teal land cover,
dark oceans with real bathymetric depth bands, coastal light and widely spaced geographic labels.
Country labels leave at zoom 5 so they cannot suppress capital names. National capitals use warm
yellow; other cities use cool white. Rank-filtered city rings and small halos appear from zoom 3
and fade out by 12. The markers refer to published settlement points, not invented network nodes.
Place names prefer published Latin transliterations, falling back to local names.

Principal road ink admits importance tier 4 first, tier 3 at zoom 6, tier 2 at 9 and tier 1 at 12,
with a road-class fallback for generalized data lacking importance. Fine secondary borders and
delayed ferry routes avoid competing with that network. At zooms 11–14, residential surfaces,
jade parks and muted blue local roads carry the city while district names orient the viewer.
These surface and road changes blend back into the existing close-up treatment at zoom 15;
they do not increase building brightness or change the independent 3D trees.

Architecture uses precise magenta and gold outlines over translucent footprints. Important
buildings receive a broad soft halo and a second sharp contour. Interiors stay plain: no repeated
circuit texture or decorative dotted trace. The buildings' real outlines and courtyards supply
the detail. Importance controls brightness, not hue. The destination family uses yellow, local
commercial activity magenta, and green spaces jade; the signs and their labels share those inks.
World publishes broad building tones without a POI-to-building identifier. A mixed-use building
can therefore retain a different family from a particular tenant; the map does not fabricate a join.

The standard building module is disabled so Core cannot substitute full-height models. The land
render stack draws the original footprints and a native extrusion pass above buildings, using
public semantic feature bindings. Its `building` visibility group follows the preview 3D switch.
Height is `clamp(renderHeight × 0.32, 4, 14)` metres for every visible building, regardless of
importance. `hide3d` parts remain suppressed to avoid duplicate structures. This deliberately
stylised, translucent relief uses dark, category-tinted surfaces; neon ink stays on the footprint
contours so broad roofs do not glow like signs. Vertical shading separates walls from roofs.
No full-height landmarks, decorative windows or 3D street lights are added.

Vegetation retains its original models. Explicit `mode: "3d"` keeps mapped trees independent
of the building/view control, including at pitch zero. Compact jade crowns use facets, a fine
turquoise contour and cool modelling light with restrained shadows. Conifers lean blue-green;
palms keep emerald fronds. Static renderers retain matching flat circles, and Trees OFF hides
both representations. No tree sprites or additional decorative trees are placed.

Road widths follow the Streets zoom hierarchy and physical roundabout measurements. Fine blue
edges make local streets readable; cyan and magenta glows distinguish principal routes. Tunnels
use restrained dashes and paths retain a narrower, muted teal treatment. Mapped sidewalk polygons
and a custom blue-grey crossing sprite appear only at close street zooms.

Commercial, civic, medical and industrial surfaces have distinct dark washes from mapped land use.
The washes are strongest at city scale and recede as buildings appear. The remaining data grid is
very faint and confined to commercial and industrial ground surfaces. Park edges are continuous and
restrained. Water outlines sit underneath the water fill so clipped vector tile polygon edges
do not become glowing seams. Small water-body labels enter at close zooms: World also classifies
fountains as lakes, making an early generic lake-label rule unsuitable in dense city centres.

One destination label pass uses the canonical POI density and size ranks, with collision-aware
pictograms on small chamfered plates. City zooms retain transport, culture, parks and major landmarks;
local destinations enter progressively. Point-only stations keep their place even at size rank 16.
A blurred light pool appears below roads around a small subset of major destinations. The selection
ring appears only for the active feature, retaining its family colour. The sign pass replaces
overlapping semantic category labels. Street labels
use a dark, narrow halo; local roads use smaller text than principal routes.

Visual references: the [official Night City gallery](https://www.cyberpunk.net/en/cyberpunk-2077),
especially [Above it all](https://cdn-l-cyberpunk.cdprojektred.com/cyberpunk2077/nightcity/Cyberpunk2077_Above_it_all_RGB%401x.jpg)
and [Immerse Yourself](https://cdn-l-cyberpunk.cdprojektred.com/cyberpunk2077/nightcity/Cyberpunk2077_Immerse_Yourself_RGB%401x.jpg).
The relevant cues are dark urban surfaces, concentrated neon and electric colour contrast,
interpreted as cartography. Further references are the [Night City art directors’ discussion](https://80.lv/articles/interview-how-cyberpunk-2077-s-night-city-was-built-almost-entirely-by-hand),
[Marta Leydy’s signage](https://leydy.artstation.com/projects/R3edvy),
[Benoit Perreault’s Deus Ex interfaces](https://www.benoitperreault.com/deusex) and
[Territory’s Blade Runner navigation graphics](https://territorystudio.com/project/blade-runner-2049/).
These inform hierarchy, original pictograms and controlled areas of light. No game artwork or
models are included.
