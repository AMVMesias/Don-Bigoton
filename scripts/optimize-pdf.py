"""Lossless PDF optimization and optional desktop-style book spreads."""
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter, Transformation

source, destination = (Path(value) for value in sys.argv[1:3])
if source.resolve() == destination.resolve():
    raise ValueError('Use different input and output paths')
original = PdfReader(source)
book_spreads = '--book-spreads' in sys.argv[3:]
groups = [[page] for page in original.pages]
if book_spreads:
    if len(original.pages) != 10:
        raise ValueError('Book spread export expects ten magazine pages')
    groups = [[original.pages[0]]]
    groups.extend([original.pages[index], original.pages[index + 1]] for index in range(1, 9, 2))
    groups.append([original.pages[-1]])
    writer = PdfWriter()
    if original.metadata:
        writer.add_metadata({key: str(value) for key, value in original.metadata.items() if value is not None})
    for group in groups:
        if len(group) == 1:
            writer.add_page(group[0])
            continue
        left, right = group
        spread = writer.add_blank_page(width=float(left.mediabox.width + right.mediabox.width), height=max(float(left.mediabox.height), float(right.mediabox.height)))
        spread.merge_transformed_page(left, Transformation())
        spread.merge_transformed_page(right, Transformation().translate(tx=float(left.mediabox.width)))
else:
    writer = PdfWriter(clone_from=source)
# Repeated masks and images become mergeable after their references are unified.
for _ in range(5):
    writer.compress_identical_objects()
writer.write(destination)
result = PdfReader(destination)
assert len(result.pages) == len(groups), 'Unexpected PDF sheet count'
for group, after in zip(groups, result.pages):
    assert abs(sum(float(before.mediabox.width) for before in group) - float(after.mediabox.width)) < .01, 'Sheet width changed'
    assert max(float(before.mediabox.height) for before in group) == float(after.mediabox.height), 'Sheet height changed'
    before_text = ' '.join(before.extract_text() for before in group).split()
    assert before_text == after.extract_text().split(), 'Page text changed'
    before_links = [ref.get_object().get('/A', {}).get('/URI') for before in group for ref in before.get('/Annots', [])]
    after_links = [ref.get_object().get('/A', {}).get('/URI') for ref in after.get('/Annots', [])]
    assert before_links == after_links, 'Page links changed'
saved = 1 - destination.stat().st_size / source.stat().st_size
print(f'Lossless PDF: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes ({saved:.1%} smaller)')
