# Prepare a product frame sequence for the Showcase: reverse it, swap the cream studio background for the
# site's night colour, and write desktop (1600x900) and mobile (960x540) WebP sets.
# Usage: python scripts/prepare-frames.py <dir of ezgif-frame-001.jpg...> public/showcase/frames/<name> <count>
# Needs Pillow and numpy. Tuned for a light, even backdrop; check a few frames before shipping a new product.
# The grey keycaps are almost the same tint as the shaded floor, so colour alone can't separate them.
# Instead: the lit floor is anything close to the backdrop colour (this also catches holes enclosed by the
# product), and shadows join it only where they connect to the floor through smooth gradients with the same
# tint. Keycap outlines are sharp steps, so growth stops there.
import sys, os
import numpy as np
from PIL import Image, ImageFilter

NIGHT = np.array([13, 10, 16], dtype=np.float32)
LUMA = np.array([0.299, 0.587, 0.114], dtype=np.float32)

def dilate(m):
    o = m.copy()
    o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
    return o

def grow(seed, allow, limit=4000):
    r = seed.copy()
    for i in range(limit):
        n = dilate(r) & allow | r
        if i % 16 == 15 and n.sum() == r.sum(): return n
        r = n
    return r

def bg_mask(a):
    h, w, _ = a.shape
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    kf = (a @ bg) / (bg @ bg)
    tint = np.linalg.norm(a - kf[..., None] * bg, axis=2)
    D = np.linalg.norm(a - bg, axis=2)
    # Floor seen through holes the product encloses: nearly exactly the backdrop. Lit keycaps are 20+ away.
    hole = (D < 16) & (tint < 5) | (kf > 1.0) & (tint < 14)  # thin gaps glow brighter than the floor; keycaps never do
    hole = dilate(~dilate(~hole))  # drop single-pixel specks

    # The rest works at half resolution, for speed.
    s = np.asarray(Image.fromarray(a.astype(np.uint8)).resize((w // 2, h // 2), Image.BOX)).astype(np.float32)
    k = (s @ bg) / (bg @ bg)
    resid = np.linalg.norm(s - k[..., None] * bg, axis=2)
    d = np.linalg.norm(s - bg, axis=2)
    y = s @ LUMA
    grad = np.zeros_like(y)
    grad[:, :-1] = np.abs(np.diff(y, axis=1))
    grad[:-1] = np.maximum(grad[:-1], np.abs(np.diff(y, axis=0)))
    # Lit floor reachable from the frame edge, then the soft shadows that fade smoothly out of it.
    floor_like = (d < 25) & (resid < 6)
    edge = np.zeros_like(floor_like); edge[[0, -1]] = True; edge[:, [0, -1]] = True
    floor = grow(edge & (d < 12) & (resid < 6), floor_like)  # keycaps leaving the frame touch the edge too
    smooth = (resid < 8) & (k > 0.3) & (grad < 7)
    shade = grow(floor, smooth)
    # Floor seen through gaps is shaded near its edges; let it spread a few pixels, never far enough to fill a keycap.
    shade |= grow(hole[::2, ::2][: h // 2, : w // 2], smooth, limit=5)
    m = np.repeat(np.repeat(shade, 2, 0), 2, 1)[:h, :w] | hole

    # Eat a few pixels into the dark contact shadow; on a black backdrop dark product edges lose nothing.
    dark = (a @ LUMA) < 100
    for _ in range(3): m = dilate(m) & (dark | m) | m
    # The contact shadow right under the product falls off too steeply to count as smooth: climb up into it
    # from the floor below, whatever the gradient.
    # A shadow only darkens toward the product, so stop wherever the next pixel up gets brighter.
    lum = a @ LUMA
    band = (tint < 14) & (kf > 0.3)
    band[:-1] &= lum[:-1] <= lum[1:] + 3
    for _ in range(60): m[:-1] |= m[1:] & band[:-1]
    # And a few pixels into the light anti-aliased fringe the sharp steps left behind.
    fringe = (tint < 12) & (kf > 0.3)
    for _ in range(3): m = dilate(m) & (fringe | m) | m
    return m

def process(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    m = bg_mask(a).astype(np.uint8) * 255
    m = np.asarray(Image.fromarray(m).filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32) / 255
    out = a * (1 - m[..., None]) + NIGHT * m[..., None]
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)), m

if __name__ == '__main__':
    src_dir, out_dir, count = sys.argv[1], sys.argv[2], int(sys.argv[3])
    sizes = {'desktop': ((1600, 900), 78), 'mobile': ((960, 540), 72)}
    for name in sizes: os.makedirs(os.path.join(out_dir, name), exist_ok=True)
    for i in range(count):
        # The source plays backwards: original frame `count` becomes 0001.
        im, _ = process(os.path.join(src_dir, f'ezgif-frame-{count - i:03d}.jpg'))
        for name, (size, q) in sizes.items():
            im.resize(size, Image.LANCZOS).save(os.path.join(out_dir, name, f'{i + 1:04d}.webp'), quality=q, method=6)
        if i % 20 == 0: print('frame', i + 1, flush=True)
    print('done', flush=True)
