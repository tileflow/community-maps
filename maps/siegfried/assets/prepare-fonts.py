"""Rename the three pinned Source Serif optical faces for CSS canvas compatibility.

Usage: python prepare-fonts.py /path/to/upstream/TTF /path/to/output/fonts
Requires fonttools==4.55.3. Outlines, metrics and hinting are not changed.
"""
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

source, destination = map(Path, sys.argv[1:])
destination.mkdir(parents=True, exist_ok=True)
for upstream, style in [('Regular', 'Regular'), ('Semibold', 'Semibold'), ('It', 'Italic')]:
    font = TTFont(source / f'SourceSerif4SmText-{upstream}.ttf', recalcTimestamp=False)
    family = 'Siegfried Text'
    postscript = f'SiegfriedText-{style}'
    names = {
        1: family, 2: style, 3: f'Tileflow;{postscript};SourceSerif-4.005',
        4: f'{family} {style}', 6: postscript, 16: family, 17: style,
    }
    for record in font['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    font.save(destination / f'{postscript}.ttf')
