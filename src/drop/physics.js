// The drop's body: a point on a spring that chases its target, and a ring of points around it that wobble
// like a water surface held together by tension. Pure functions, stepped once per animation frame.

export const RING = 18; // points round the rim; enough for a smooth wobble, few enough to step cheaply

// Semi-implicit Euler on a damped spring. Under-damped on purpose: the drop overshoots a touch and settles.
export function chase(s, tx, ty, dt, k = 90, zeta = 0.62) {
  const c = 2 * Math.sqrt(k) * zeta;
  s.vx += (k * (tx - s.x) - c * s.vx) * dt;
  s.vy += (k * (ty - s.y) - c * s.vy) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  return s;
}

// Speed becomes stretch along the direction of travel (and thinning across it), capped so it never tears.
export const stretch = (vx, vy) => Math.min(Math.hypot(vx, vy) / 2400, 0.32);

// Surface tension: each rim point springs back to round and pulls on its neighbours, so a poke travels round
// the drop as a ripple and dies away.
export function ripple(w, v, dt, tension = 260, couple = 90, damp = 7) {
  const n = w.length;
  for (let i = 0; i < n; i++) {
    const nb = w[(i + n - 1) % n] + w[(i + 1) % n] - 2 * w[i];
    v[i] += (-tension * w[i] + couple * nb - damp * v[i]) * dt;
  }
  for (let i = 0; i < n; i++) w[i] = Math.max(-0.35, Math.min(0.35, w[i] + v[i] * dt));
}

// A poke at angle a: the rim there is pushed in (negative) or bulges out (positive), fading with distance.
export function poke(v, a, strength) {
  const n = v.length;
  for (let i = 0; i < n; i++) {
    const d = Math.cos((i / n) * Math.PI * 2 - a);
    v[i] += strength * Math.max(0, d) ** 3;
  }
}

// The rim as a smooth closed SVG path (Catmull-Rom through the points), centred in a box of size `box`.
export function blobPath(w, r, box) {
  const n = w.length, c = box / 2;
  const pts = w.map((o, i) => { const a = (i / n) * Math.PI * 2; return [c + Math.cos(a) * r * (1 + o), c + Math.sin(a) * r * (1 + o)]; });
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}
