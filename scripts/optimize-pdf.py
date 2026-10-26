"""Lossless PDF optimization: share repeated objects without changing images."""
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter

source, destination = (Path(value) for value in sys.argv[1:3])
if source.resolve() == destination.resolve():
    raise ValueError('Use different input and output paths')
original = PdfReader(source)
writer = PdfWriter(clone_from=source)
# Repeated masks and images become mergeable after their references are unified.
for _ in range(5):
    writer.compress_identical_objects()
writer.write(destination)
result = PdfReader(destination)
assert len(result.pages) == len(original.pages), 'Page count changed'
for before, after in zip(original.pages, result.pages):
    assert before.mediabox == after.mediabox, 'Page dimensions changed'
    assert before.extract_text() == after.extract_text(), 'Page text changed'
    before_links = [ref.get_object().get('/A', {}).get('/URI') for ref in before.get('/Annots', [])]
    after_links = [ref.get_object().get('/A', {}).get('/URI') for ref in after.get('/Annots', [])]
    assert before_links == after_links, 'Page links changed'
saved = 1 - destination.stat().st_size / source.stat().st_size
print(f'Lossless PDF: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes ({saved:.1%} smaller)')
