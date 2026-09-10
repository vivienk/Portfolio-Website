"""Extract lossless, composited seventh-frame GIF posters. Requires Pillow."""

from pathlib import Path
import re

from PIL import Image


root = Path(__file__).resolve().parents[1]
carousel = (root / "modules/project-carousel.mjs").read_text()
previews = re.findall(r"image: '([^']+\.gif)', poster: '([^']+)'", carousel)

for source, destination in previews:
    output = root / destination.lstrip("/")
    output.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(root / source.lstrip("/")) as gif:
        # Pillow composites preceding frames and respects GIF disposal methods.
        # Frame 7 in the UI is zero-based index 6 in the decoder.
        gif.seek(6)
        gif.convert("RGBA").save(output, optimize=True)
    print(output.relative_to(root))
