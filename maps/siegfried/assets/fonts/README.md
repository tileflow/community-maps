# Siegfried fonts

Cormorant Garamond SemiBold is unmodified, pinned to CatharsisFonts/Cormorant revision
`cc1bfb51ce6568cb3abf9199ab718d543f6fa189`. Its license is in `LICENSE-Cormorant.txt`.

Siegfried Text Regular, Semibold and Italic are renamed derivatives of Adobe's **Source Serif 4
Small Text**, pinned to adobe-fonts/source-serif revision
`80d3f8894c09c937bebfa9011247d2e1c79fd6f4` (release 4.005). The original input checksums are recorded
in `upstream-sha256.json`. Copyright and the full SIL OFL 1.1 are in `LICENSE-SourceSerif.txt`.
`LICENSE.txt` contains both complete licenses for the Tileflow font bundle.

Only name-table records 1, 2, 3, 4, 6, 16 and 17 were changed. The outlines, character coverage,
metrics and hinting are unchanged. The renamed family avoids the standalone number in the
upstream name: the current MapLibre canvas font path leaves that name unquoted, producing an
invalid CSS font shorthand. The derivative name also respects Adobe's reserved name “Source”.

To reproduce, download `TTF/SourceSerif4SmText-{Regular,Semibold,It}.ttf` from the pinned upstream
revision, verify the checksums, install `fonttools==4.55.3` in an isolated Python environment, and
run `python ../prepare-fonts.py /path/to/upstream/TTF .` from this directory. Font timestamps are
preserved. The exact full names used by the style are:

- Cormorant Garamond SemiBold
- Siegfried Text Regular
- Siegfried Text Semibold
- Siegfried Text Italic

Sources:

- <https://github.com/CatharsisFonts/Cormorant/tree/cc1bfb51ce6568cb3abf9199ab718d543f6fa189>
- <https://github.com/adobe-fonts/source-serif/tree/80d3f8894c09c937bebfa9011247d2e1c79fd6f4>
