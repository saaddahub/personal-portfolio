// Crayon marks as filled outlines, generated from a seed. Each line trembles the way a hand does, and its width
// follows the pressure of a crayon: it lands blunt, wanders a little along the way, and thins as it lifts.

// Mulberry32: a small seeded generator, so the same seed always draws the same mark.
export function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };

// Smooth noise over t in [0, 1]: random values in [-1, 1] at `knots` even steps, eased between.
function wander(rand, knots) {
  const v = Array.from({ length: knots + 1 }, () => rand() * 2 - 1);
  return t => {
    const x = Math.min(Math.max(t, 0), 1) * knots, i = Math.min(knots - 1, Math.floor(x));
    return v[i] + (v[i + 1] - v[i]) * smooth(0, 1, x - i);
  };
}

const r1 = n => Math.round(n * 10) / 10;
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
const normalAt = (p, i) => { const [x, y] = unit(p[Math.max(i - 1, 0)], p[Math.min(i + 1, p.length - 1)]); return [-y, x]; };
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const quad = (a, c, b, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
});

// One stroke through `pts`. Returns the outline to fill, the centre line (run a little past both ends) that a
// mask traces to draw it on, its length and its widest width, and the box it covers.
export function stroke(pts, rand, { width = 3, tremor = 1, lift = 0.3, tip = 0.35 } = {}) {
  const n = pts.length, at = [0];
  for (let i = 1; i < n; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = at[n - 1] || 1;
  const shake = wander(rand, Math.max(2, Math.round(len / 70))), fine = wander(rand, Math.max(3, Math.round(len / 8))), press = wander(rand, 3);
  // The tremor eases out at both ends, so a stroke still starts and lands exactly where it was aimed.
  const p = pts.map((q, i) => {
    const t = at[i] / len, [nx, ny] = normalAt(pts, i);
    const o = tremor * (shake(t) * Math.min(1.8, len * 0.014) + fine(t) * 0.3) * smooth(0, 0.12, t) * smooth(0, 0.12, 1 - t);
    return [q[0] + nx * o, q[1] + ny * o];
  });
  const w = p.map((_, i) => {
    const t = at[i] / len;
    return width * (0.6 + 0.4 * smooth(0, 0.08, t)) * (1 - (1 - tip) * smooth(1 - lift, 1, t)) * (0.85 + 0.15 * press(t));
  });
  const left = [], right = [];
  p.forEach((q, i) => {
    const [nx, ny] = normalAt(p, i), h = w[i] / 2;
    left.push([q[0] + nx * h, q[1] + ny * h]);
    right.push([q[0] - nx * h, q[1] - ny * h]);
  });
  const [ex, ey] = unit(p[n - 2], p[n - 1]), [sx, sy] = unit(p[1], p[0]);
  const ring = [...left, [p[n - 1][0] + ex * w[n - 1] * 0.6, p[n - 1][1] + ey * w[n - 1] * 0.6], ...right.reverse(), [p[0][0] + sx * w[0] * 0.6, p[0][1] + sy * w[0] * 0.6]];
  // A closed curve through the midpoints, so the outline stays soft without a point every pixel.
  let fill = `M${ring.at(-1).map(r1)}`;
  ring.forEach((q, i) => { fill += `Q${q.map(r1)} ${mid(q, ring[(i + 1) % ring.length]).map(r1)}`; });
  const reach = width * 1.5;
  const spine = `M${[p[0][0] + sx * reach, p[0][1] + sy * reach].map(r1)}L${p.map(q => q.map(r1)).join(' ')} ${[p[n - 1][0] + ex * reach, p[n - 1][1] + ey * reach].map(r1)}`;
  const xs = ring.map(q => q[0]), ys = ring.map(q => q[1]);
  return { fill: `${fill}Z`, spine, len, width: Math.max(...w), box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
}

// An arrow from a to b: a bowed shaft, then the head as two quick flicks back from the tip, a little uneven.
// `bend` bows the shaft to the left of its travel (negative: to the right), as a fraction of its length.
export function arrow(a, b, rand, { bend = 0.25, width = 3 } = {}) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, [nx, ny] = normalAt([a, b], 0);
  const k = bend * (0.85 + rand() * 0.3) * len, c = [(a[0] + b[0]) / 2 + nx * k, (a[1] + b[1]) / 2 + ny * k];
  const shaft = stroke(quad(a, c, b, Math.max(12, Math.round(len / 4))), rand, { width, lift: 0.2, tip: 0.6 });
  const back = Math.atan2(c[1] - b[1], c[0] - b[0]), size = Math.min(Math.max(len * 0.14, 10), 15);
  const wing = side => {
    const ang = back + side * (0.4 + rand() * 0.16), l = size * (0.85 + rand() * 0.3);
    const from = [b[0] + (rand() - 0.5) * 1.6, b[1] + (rand() - 0.5) * 1.6], to = [b[0] + Math.cos(ang) * l, b[1] + Math.sin(ang) * l];
    const [wx, wy] = normalAt([from, to], 0), m = mid(from, to);
    return stroke(quad(from, [m[0] + wx * side * l * 0.08, m[1] + wy * side * l * 0.08], to, 8), rand, { width: width * 0.95, tremor: 0.4, lift: 0.75, tip: 0.25 });
  };
  const first = rand() < 0.5 ? 1 : -1; // either flick may come first; the second goes to the other side
  return [shaft, wing(first), wing(-first)];
}

// The ellipse a loop runs round a box {x, y, w, h}: wide enough at the ends to clear a pill's rounded corners.
export const loopBox = r => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: r.w / 2 + 10 + r.h * 0.12, ry: r.h / 2 + 4 + r.h * 0.06 });

// A loop around a box: a little more than one turn, spiralling outward so its ends overlap untidily.
export function loop(r, rand, { width = 3 } = {}) {
  const { cx, cy, rx, ry } = loopBox(r);
  const turn = (1.1 + rand() * 0.08) * Math.PI * 2, start = -2.2 + rand() * 0.5, tilt = (rand() - 0.5) * 0.1, wob = wander(rand, 5);
  const n = Math.round(((rx + ry) * turn) / 8), cos = Math.cos(tilt), sin = Math.sin(tilt);
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, a = start - t * turn, s = 0.95 + 0.1 * t + 0.04 * wob(t);
    const x = rx * s * Math.cos(a), y = ry * s * Math.sin(a);
    return [cx + x * cos - y * sin, cy + x * sin + y * cos];
  });
  return [stroke(pts, rand, { width, lift: 0.18, tip: 0.3 })];
}

// One quick line under a box, running past both ends and rising slightly as the wrist turns.
export function underline(r, rand, { width = 3 } = {}) {
  const y = r.y + r.h + 5, x0 = r.x - 4 - rand() * 4, x1 = r.x + r.w + 4 + rand() * 8, rise = 2 + rand() * 3;
  const n = Math.max(10, Math.round((x1 - x0) / 5));
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [x0 + (x1 - x0) * t, y - rise * t + Math.sin(Math.PI * t) * 1.5];
  });
  return [stroke(pts, rand, { width, lift: 0.35, tip: 0.2 })];
}
