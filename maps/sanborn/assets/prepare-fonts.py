"""Prepare the pinned Source Serif 4 Small Text faces without changing their outlines.

python prepare-fonts.py /path/to/upstream/TTF /path/to/output/fonts
Requires fonttools==4.55.3. The font family is renamed for OFL and canvas compatibility.
"""
import hashlib
import json
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

source, destination = map(Path, sys.argv[1:])
destination.mkdir(parents=True, exist_ok=True)
checksums = {}
for upstream, style in [('Regular', 'Regular'), ('Semibold', 'Semibold'), ('It', 'Italic')]:
    filename = f'SourceSerif4SmText-{upstream}.ttf'
    checksums[filename] = hashlib.sha256((source / filename).read_bytes()).hexdigest()
    font = TTFont(source / filename, recalcTimestamp=False)
    family = 'Sanborn Text'
    postscript = f'SanbornText-{style}'
    names = {
        1: family, 2: style, 3: f'Tileflow;{postscript};SourceSerif-4.005',
        4: f'{family} {style}', 6: postscript, 16: family, 17: style,
    }
    for record in font['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    font.save(destination / f'{postscript}.ttf')
(destination / 'upstream-sha256.json').write_text(json.dumps(checksums, indent=2) + '\n')
