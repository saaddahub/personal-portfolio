# Turn a product video rendered on pure black into the Showcase frame sets (desktop 1920x1080, mobile 960x540).
# Also writes still.webp, the sharpened last frame used for the zoom.
# Usage: python scripts/prepare-frames.py <video.mp4> public/showcase/frames/<name> [--reverse]
# Needs ffmpeg (on PATH, or set FFMPEG to its path), Pillow and numpy. Update `frames` in src/content.js to the count it prints.
import os, sys, subprocess, tempfile
import numpy as np
from PIL import Image, ImageFilter

NIGHT = np.array([13, 10, 16], dtype=np.float32)  # --night in src/styles.css
SIZES = {'desktop': ((1920, 1080), 82), 'mobile': ((960, 540), 76)}

def lift(a):
    # Black becomes the page colour; brighter pixels move proportionally less, so the product itself is untouched.
    return a + NIGHT * (1 - a / 255)

assert np.allclose(lift(np.zeros(3)), NIGHT) and np.allclose(lift(np.full(3, 255.0)), 255)

video, out = sys.argv[1], sys.argv[2]
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run([os.environ.get('FFMPEG', 'ffmpeg'), '-loglevel', 'error', '-i', video, '-an', '-vsync', '0',
                    os.path.join(tmp, '%04d.png')], check=True)
    files = sorted(os.listdir(tmp))
    if '--reverse' in sys.argv: files.reverse()
    for name in SIZES: os.makedirs(os.path.join(out, name), exist_ok=True)
    for i, f in enumerate(files):
        a = lift(np.asarray(Image.open(os.path.join(tmp, f)).convert('RGB')).astype(np.float32))
        im = Image.fromarray(np.clip(a + 0.5, 0, 255).astype(np.uint8))
        for name, (size, q) in SIZES.items():
            (im if im.size == size else im.resize(size, Image.LANCZOS)).save(os.path.join(out, name, f'{i + 1:04d}.webp'), quality=q, method=6)
    # The zoomed close-up uses one full-size, lightly sharpened copy of the last frame.
    im.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2)).save(os.path.join(out, 'still.webp'), quality=92, method=6)
    print(len(files), 'frames')
