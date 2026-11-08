// Night-blossom scene: a seeded cherry tree that grows and sways on one canvas,
// and petals carried by a wind the visitor steers on another.

const UP = -Math.PI / 2;
const BLOOM = ['#ffe6ee', '#ffd3e0', '#f8c3d4', '#f5a9c2', '#f5a9c2', '#ec8fae', '#e2789b', '#d9658a'];
// Clusters deep inside the crown catch less light.
const BLOOM_DEEP = ['#c97893', '#b8637f', '#a8566f', '#d98aa4', '#9c4b66'];
const NIGHT_PETALS = ['#ffe3ec', '#f8c3d4', '#f5a9c2', '#ee9ab6'];
const DAWN_PETALS = ['#e58aa5', '#d9577e', '#c94a72', '#f09bb5'];
const PETAL_PATH = 'M0 1C-.9 .25-.62-.95-.15-.92L0-.72L.15-.92C.62-.95.9 .25 0 1Z';
// Dark plum-brown trunk warming to pinkish twigs near the blossoms.
const BARK = Array.from({ length: 9 }, (_, d) => {
  const k = (d / 8) ** 0.85;
  return `rgb(${Math.round(44 + 112 * k)},${Math.round(24 + 66 * k)},${Math.round(32 + 84 * k)})`;
});

export function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Branches, blossom glows and blossom dots, each tagged with its distance from the root
// so growth can be drawn as a single advancing front.
// The one tree every visitor sees, chosen for how it composes on desktop and phone.
export const SEED = 21;

export function generateTree(width, height, seed = SEED, density = 1) {
  // Separate streams so tuning blossom density never reshapes the branches.
  const r = rng(seed), rb = rng(seed ^ 0x9e3779b9);
  const portrait = height > width;
  const size = portrait ? Math.min(width * 0.78, height * 0.38) : Math.min(height * 0.8, width * 0.6);
  const trunk = portrait ? 0.62 : 0.3, fan = portrait ? 0.04 : 0.22, narrow = portrait ? 0.6 : 1;
  const baseX = width * (portrait ? 0.6 : 0.66);
  const baseY = height;
  const segments = [], glows = [], dots = [];

  const cluster = (x, y, dist, scale) => {
    const rad = size * (0.026 + rb() * 0.03) * scale;
    const deep = rb() < 0.35; // part of the crown sits behind the rest
    glows.push({ x, y, rad: rad * 2.2, dist, alpha: deep ? 0.04 : 0.085 });
    const n = Math.round((11 + rb() * 15) * scale * density);
    const palette = deep ? BLOOM_DEEP : BLOOM;
    for (let i = 0; i < n; i++) {
      const a = rb() * Math.PI * 2, s = Math.sqrt(rb()) * rad;
      dots.push({
        x: x + Math.cos(a) * s,
        y: y + Math.sin(a) * s * 0.78 - rad * 0.15,
        r: size * (0.0015 + rb() * 0.0029) * (deep ? 0.85 : 1),
        c: palette[Math.floor(rb() * palette.length)],
        alpha: deep ? 0.6 : 0.9,
        dist: dist + rb() * size * 0.12,
      });
    }
  };

  const branch = (x, y, angle, len, w, depth, dist) => {
    const steps = depth < 2 ? 6 : depth < 4 ? 4 : 3, wEnd = w * (depth < 1 ? 0.7 : 0.72);
    // Each limb bends one way along its length instead of zigzagging,
    // and outer limbs arch down under their own weight.
    const bend = (r() - 0.5) * (depth < 2 ? 0.05 : 0.18);
    const sag = depth >= 3 ? 0.028 * (depth - 2) : 0;
    let a = angle, px = x, py = y, d = dist;
    for (let i = 0; i < steps; i++) {
      a += bend + (r() - 0.5) * (depth < 2 ? 0.08 : 0.2) + sag * Math.cos(a);
      const l = len / steps, nx = px + Math.cos(a) * l, ny = py + Math.sin(a) * l;
      segments.push({ x1: px, y1: py, x2: nx, y2: ny, w0: w + (wEnd - w) * (i / steps), w1: w + (wEnd - w) * ((i + 1) / steps), d0: d, d1: d + l, depth, seed: r() });
      px = nx; py = ny; d += l;
      if (depth >= 3 && i < steps - 1 && r() < 0.3) cluster(px, py, d, 0.45);
    }
    if (depth >= 8 || len < size * 0.02) return cluster(px, py, d, 0.65);
    const kids = depth < 1 ? 2 : r() < 0.3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const side = kids === 3 ? k - 1 : k === 0 ? -1 : 1;
      // Push deeper branches away from vertical so the canopy spreads like an umbrella.
      // The first fork always opens wide enough that the two main limbs never cross.
      const open = depth === 0 ? 0.42 + r() * 0.22 : 0.28 + r() * 0.36;
      const spread = a + side * open * narrow + (a - UP) * (depth >= 2 ? fan : 0.05);
      branch(px, py, Math.max(UP - 1.5, Math.min(UP + 1.5, spread)), len * (0.7 + r() * 0.12), wEnd * (kids === 3 ? 0.78 : 0.86), depth + 1, d);
    }
  };

  branch(baseX, baseY, UP - 0.12, size * trunk, size * 0.068, 0, 0);
  segments.sort((p, q) => p.d0 - q.d0);
  glows.sort((p, q) => p.dist - q.dist);
  dots.sort((p, q) => p.dist - q.dist);
  const maxDist = Math.max(dots.at(-1)?.dist ?? 0, ...segments.map(s => s.d1));
  return { segments, glows, dots, maxDist, baseX, baseY, size };
}

// One petal step: velocity relaxes toward the wind plus a flutter that depends on how flat the petal is.
export function stepPetal(p, dt, wx, wy) {
  p.flip += p.vf * dt;
  p.rot += p.vr * dt;
  const flat = Math.abs(Math.sin(p.flip));
  const k = 1 - Math.exp(-1.8 * dt);
  p.vx += (wx * p.z + Math.cos(p.flip) * 16 * p.z - p.vx) * k;
  p.vy += (wy + 38 * p.z * (0.55 + 0.45 * flat) - p.vy) * k;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
}

const wind = (x, y, t) => [
  -34 + 20 * Math.sin(t * 0.33) + 12 * Math.sin(t * 0.81 + 1.7) + 16 * Math.sin(y * 0.0055 + t * 0.9),
  10 * Math.sin(x * 0.0045 - t * 0.6),
];

// Draws the part of a limb between growth distances a and b. Called repeatedly while the tree
// grows, so every mark depends only on the segment and that span, never on draw order.
function drawSegment(ctx, s, a, b) {
  if (b <= a) return;
  const L = s.d1 - s.d0, t0 = (a - s.d0) / L, t1 = (b - s.d0) / L;
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
  const x0 = s.x1 + dx * t0, y0 = s.y1 + dy * t0, x1 = s.x1 + dx * t1, y1 = s.y1 + dy * t1;
  const w0 = s.w0 + (s.w1 - s.w0) * t0, w1 = s.w0 + (s.w1 - s.w0) * t1;
  if (w0 < 1.6) {
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(w0, 0.6);
    ctx.strokeStyle = BARK[s.depth];
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    return;
  }
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; } // n points at the lit side, up toward the blossoms

  // The limb itself: an exact taper, with a round joint so forks read as grown, not glued.
  ctx.fillStyle = BARK[s.depth];
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  ctx.closePath();
  ctx.moveTo(x1 + w1 / 2, y1); ctx.arc(x1, y1, w1 / 2, 0, Math.PI * 2);
  if (a === s.d0) { ctx.moveTo(x0 + w0 / 2, y0); ctx.arc(x0, y0, w0 / 2, 0, Math.PI * 2); }
  ctx.fill();

  if (w0 < 2.6) return;
  const w = (w0 + w1) / 2;
  const strip = (offset, width, color) => {
    ctx.lineWidth = width; ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0 + nx * w0 * offset, y0 + ny * w0 * offset);
    ctx.lineTo(x1 + nx * w1 * offset, y1 + ny * w1 * offset);
    ctx.stroke();
  };
  ctx.lineCap = 'butt';
  // Round the limb: shadow on the underside, a pink rim where the blossoms light it.
  strip(-0.27, w * 0.42, 'rgba(8,3,6,0.48)');
  strip(0.31, w * 0.16, 'rgba(240,164,192,0.24)');
  if (w < 6) return;

  // Cherry bark: a couple of dark fissures along the grain and pale horizontal lenticels.
  strip(-0.06 + s.seed * 0.08, 1, 'rgba(10,4,8,0.4)');
  strip(0.14 - s.seed * 0.06, 0.8, 'rgba(10,4,8,0.3)');
  const rr = rng(Math.floor(s.seed * 1e9));
  ctx.lineWidth = Math.min(2, w * 0.09);
  ctx.strokeStyle = 'rgba(206,150,164,0.3)';
  ctx.beginPath();
  for (let k = 0, count = Math.floor(len / (w * 0.5)); k < count; k++) {
    const tk = rr(), off = rr() * 0.4 - 0.25, span = 0.25 + rr() * 0.35;
    if (tk < t0 || tk >= t1) continue;
    const px = s.x1 + dx * tk, py = s.y1 + dy * tk, ww = s.w0 + (s.w1 - s.w0) * tk;
    ctx.moveTo(px + nx * ww * off, py + ny * ww * off);
    ctx.lineTo(px + nx * ww * (off + span), py + ny * ww * (off + span));
  }
  ctx.stroke();
}

export function startScene({ treeCanvas, petalCanvas, reduced }) {
  const tctx = treeCanvas.getContext('2d'), pctx = petalCanvas.getContext('2d');
  const buffer = document.createElement('canvas'), bctx = buffer.getContext('2d');
  const petalPath = new Path2D(PETAL_PATH);
  const dawnEl = document.querySelector('[data-dawn]'), groundEl = document.querySelector('[data-ground]');
  const small = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
  const maxPetals = small ? 110 : 240;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const petals = [], settled = [];
  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
  let tree, active = [], si = 0, gi = 0, di = 0, front = 0, grown = false, tw = 0, th = 0, vw = 0, vh = 0;
  let raf = 0, last = performance.now(), start = last, emit = 0, gustX = 0, gustY = 0, lastScroll = scrollY, sway = 0;

  const fit = (c, w, h) => { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); };

  function growTo(D) {
    const P = front;
    while (si < tree.segments.length && tree.segments[si].d0 < D) active.push(tree.segments[si++]);
    active = active.filter(s => { drawSegment(bctx, s, Math.max(s.d0, P), Math.min(s.d1, D)); return s.d1 > D; });
    bctx.globalCompositeOperation = 'screen';
    for (; gi < tree.glows.length && tree.glows[gi].dist < D; gi++) {
      const g = tree.glows[gi], grad = bctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.rad);
      grad.addColorStop(0, `rgba(232,110,150,${g.alpha})`);
      grad.addColorStop(1, 'rgba(245,140,175,0)');
      bctx.fillStyle = grad;
      bctx.fillRect(g.x - g.rad, g.y - g.rad, g.rad * 2, g.rad * 2);
    }
    bctx.globalCompositeOperation = 'source-over';
    for (; di < tree.dots.length && tree.dots[di].dist < D; di++) {
      const o = tree.dots[di];
      bctx.globalAlpha = o.alpha;
      bctx.fillStyle = o.c;
      bctx.beginPath(); bctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); bctx.fill();
    }
    bctx.globalAlpha = 1;
    front = D;
  }

  function buildTree(instant) {
    const box = treeCanvas.getBoundingClientRect();
    tw = box.width; th = box.height;
    fit(treeCanvas, tw, th); fit(buffer, tw, th);
    tree = generateTree(tw, th, SEED, tw < 760 ? 0.7 : 1);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, tw, th);
    bctx.lineCap = 'round';
    active = []; si = gi = di = 0; front = 0;
    grown = instant;
    if (instant) growTo(Infinity);
  }

  function drawTree() {
    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.clearRect(0, 0, treeCanvas.width, treeCanvas.height);
    // Skew around the trunk base: the canopy moves, the roots stay put.
    tctx.setTransform(dpr, 0, sway * dpr, dpr, -sway * tree.baseY * dpr, 0);
    tctx.drawImage(buffer, 0, 0, tw, th);
  }

  function resizeView() {
    vw = innerWidth; vh = innerHeight;
    fit(petalCanvas, vw, vh);
  }

  const observer = new ResizeObserver(() => {
    const box = treeCanvas.getBoundingClientRect();
    if (Math.abs(box.width - tw) > 1 || Math.abs(box.height - th) > 120) { buildTree(true); drawTree(); }
  });

  resizeView();
  buildTree(reduced);
  observer.observe(treeCanvas);
  if (reduced) {
    drawTree();
    return { stop: () => observer.disconnect(), gust() {} };
  }

  function spawn(box, shaking, ds) {
    // Away from the tree, petals enter from wherever the scroll is bringing new air.
    let x = vw + 20, y = Math.random() * vh * 0.85;
    if (ds > 2) { x = Math.random() * vw; y = vh + 20; }
    else if (Math.random() < 0.6) { x = vw * (0.15 + Math.random() * 0.9); y = -20; }
    if (box && di > 0) {
      let o = tree.dots[Math.floor(Math.random() * di)];
      // When the visitor stirs the canopy, release petals near the pointer.
      for (let i = 0; shaking && i < 10; i++) {
        const c = tree.dots[Math.floor(Math.random() * di)];
        if (Math.hypot(box.left + c.x - pointer.x, box.top + c.y - pointer.y) < 150) { o = c; break; }
      }
      x = box.left + o.x + sway * (o.y - tree.baseY);
      y = box.top + o.y;
    }
    petals.push({
      x, y, vx: -10 - Math.random() * 20, vy: 8, z: 0.55 + Math.random() * 0.65,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 2.4,
      flip: Math.random() * Math.PI * 2, vf: 1.5 + Math.random() * 2.5,
      size: 4.5 + Math.random() * 4, c: Math.floor(Math.random() * 4),
    });
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05), t = (now - start) / 1000;
    last = now;
    const sy = scrollY, ds = sy - lastScroll, scrollSpeed = Math.abs(ds) / Math.max(dt, 0.001);
    lastScroll = sy;
    gustX = (gustX - Math.min(Math.abs(ds), 120) * 0.35) * Math.exp(-1.4 * dt);
    gustY = (gustY - Math.max(-60, Math.min(60, ds)) * 0.2) * Math.exp(-2 * dt);
    pointer.vx *= Math.exp(-6 * dt); pointer.vy *= Math.exp(-6 * dt);

    // The tree is a fixed layer that drifts up slower than the page and fades,
    // so its canopy lingers over the statement before the night takes it.
    const fade = Math.max(0, 1 - sy / (vh * 1.4));
    if (ds || !treeCanvas.style.opacity) {
      treeCanvas.style.transform = `translate3d(0,${(-sy * 0.45).toFixed(1)}px,0)`;
      treeCanvas.style.opacity = fade.toFixed(3);
    }
    const box = treeCanvas.getBoundingClientRect();
    const treeVisible = fade > 0.01;
    if (!grown) {
      const g = Math.min(Math.max((t - 0.25) / 1.9, 0), 1);
      growTo((1 - (1 - g) ** 3) * tree.maxDist);
      grown = g >= 1;
    }
    sway = (Math.sin(t * 0.55) * 0.6 + Math.sin(t * 1.31 + 0.8) * 0.25) * 0.006 + gustX * 0.00002;
    if (treeVisible) drawTree();

    const speed = Math.hypot(pointer.vx, pointer.vy);
    const shaking = treeVisible && speed > 250 && pointer.y < box.top + tree.baseY * 0.8;
    const fromTree = fade > 0.35;
    emit += ((fromTree ? (grown ? 6 : 2) : 5) + Math.min(scrollSpeed, 3000) * 0.004 + (shaking ? Math.min(speed, 2500) * 0.006 : 0)) * dt;
    for (; emit >= 1; emit--) if (petals.length < maxPetals) spawn(fromTree ? box : null, shaking, ds);

    const ground = groundEl?.getBoundingClientRect();
    const groundY = ground && ground.top < vh ? ground.top : Infinity;
    const dawnTop = dawnEl ? dawnEl.getBoundingClientRect().top : Infinity;
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.y -= ds * 0.45 * p.z; // petals hang in the air between the visitor and the page
      const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
      if (d2 < 32400) {
        // The pointer hands its velocity to the air around it.
        const d = Math.sqrt(d2) || 1, f = (1 - d / 180) ** 2 * dt * 6;
        p.vx += (pointer.vx * 0.5 + (dx / d) * 90) * f;
        p.vy += (pointer.vy * 0.5 + (dy / d) * 90) * f;
        p.vr += (pointer.vx > 0 ? 1 : -1) * f * 4;
      }
      const [wx, wy] = wind(p.x, p.y, t);
      stepPetal(p, dt, wx + gustX, wy + gustY);
      if (p.y >= groundY && p.y < groundY + 60) {
        settled.push({ x: p.x, y: groundY + Math.random() * 16 + sy, rot: p.rot, s: p.size * p.z, sx: 0.5 + 0.5 * Math.abs(Math.cos(p.flip)), c: p.c });
        if (settled.length > 380) settled.shift();
        petals.splice(i, 1);
        continue;
      }
      if (p.x < -80 || p.x > vw + 120 || p.y > vh + 80 || p.y < -240) { petals.splice(i, 1); continue; }
      const s = p.size * p.z, sx = s * (0.25 + 0.75 * Math.abs(Math.cos(p.flip)));
      const c = Math.cos(p.rot), n = Math.sin(p.rot);
      pctx.setTransform(c * sx * dpr, n * sx * dpr, -n * s * dpr, c * s * dpr, p.x * dpr, p.y * dpr);
      pctx.globalAlpha = 0.45 + 0.55 * Math.min(p.z, 1);
      pctx.fillStyle = (p.y > dawnTop ? DAWN_PETALS : NIGHT_PETALS)[p.c];
      pctx.fill(petalPath);
    }

    pctx.globalAlpha = 0.92;
    for (const q of settled) {
      const y = q.y - sy;
      if (y < -20 || y > vh + 20) continue;
      const c = Math.cos(q.rot), n = Math.sin(q.rot);
      pctx.setTransform(c * q.s * q.sx * dpr, n * q.s * q.sx * dpr, -n * q.s * dpr, c * q.s * dpr, q.x * dpr, y * dpr);
      pctx.fillStyle = DAWN_PETALS[q.c];
      pctx.fill(petalPath);
    }
    pctx.globalAlpha = 1;
  }

  const onMove = e => {
    const now = performance.now();
    if (pointer.t && now - pointer.t < 100) {
      const dtp = Math.max((now - pointer.t) / 1000, 0.008);
      pointer.vx = pointer.vx * 0.6 + ((e.clientX - pointer.x) / dtp) * 0.4;
      pointer.vy = pointer.vy * 0.6 + ((e.clientY - pointer.y) / dtp) * 0.4;
    }
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = now;
  };
  const onLeave = e => { if (!e.relatedTarget) { pointer.x = pointer.y = -1e4; pointer.t = 0; } };
  addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onLeave);
  addEventListener('resize', resizeView);
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      removeEventListener('resize', resizeView);
    },
    // A sideways gust along one horizontal band, used when a project row is hovered.
    gust(y) {
      for (const p of petals) {
        const d = Math.abs(p.y - y);
        if (d < 170) p.vx -= 240 * (1 - d / 170);
      }
      gustX -= 30;
    },
  };
}
