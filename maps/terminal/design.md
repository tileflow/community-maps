# Terminal design

`terminal` is a self-contained monochrome green-screen root. It explicitly owns its sparse HUD
geometry, reviewed phosphor-green ramp, modules, semantic render passes, and theme. It
omits a bright road centerline and building circuit texture, and uses compact square destination
nodes through `[terminalIcons]`. A translucent scanline and dot pattern covers the roads and
everything beneath them, so bright strokes break into the phosphor rows of an old CRT without baking
that texture into the map data; boundaries, buildings and text render afterwards and stay crisp.
`[terminalFonts]` owns Terminal's packaged Oxanium faces for uppercase labels, independently of
Cyberpunk's font provider.
