import { createDrawable } from 'animejs';
import { mine } from './content.js';
import { useScene, safe, random, seg, expo, cubic, inOut, lerp, clamp, setter } from './kit.js';
import './mine.css';

// Chapter three, the signature. A heartbeat trace sweeps across a faint monitor grid, its phosphor trail fading
// behind a bright head. Then its peaks lift off one by one and become the nodes of a neural network: the line is
// pulled taut between them like a string, turns from blossom to mist, and lets go as the real connections draw in,
// layer by layer. A pulse runs through the network, and signals keep flowing while the scroll rests.
const c = mine.switch;
const LAYERS = [4, 6, 6, 4]; // 20 nodes: one for every P, Q, R, S and T peak of four beats
// One beat: [x as a fraction of the beat, y as a fraction of the R amplitude (up is negative), is it a node]
const BEAT = [
  [0, 0, 0], [0.12, 0, 0], [0.15, -0.09, 0], [0.18, -0.13, 1], [0.21, -0.09, 0], [0.24, 0, 0], [0.31, 0.1, 1],
  [0.355, -1, 1], [0.4, 0.3, 1], [0.46, 0, 0], [0.58, 0, 0], [0.63, -0.17, 0], [0.68, -0.24, 1], [0.73, -0.17, 0], [0.8, 0, 0],
];
const SIGNALS = 14;
const EDGES = LAYERS.slice(1).reduce((n, m, j) => n + m * LAYERS[j], 0);
const NODES = LAYERS.reduce((a, b) => a + b, 0);

export default function Switch({ onProgress }) {
  const ref = useScene(onProgress, build);
  return (
    <div className="mine-scene mine-switch" ref={ref}>
      <svg className="mine-switch-svg" aria-hidden="true">
        <defs>
          <pattern id="mine-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#f4ede9" strokeOpacity="0.07" />
          </pattern>
          <radialGradient id="mine-grid-fade">
            <stop offset="0.3" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="mine-grid-mask"><rect width="100%" height="100%" fill="url(#mine-grid-fade)" /></mask>
          <linearGradient id="mine-trail" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
          <radialGradient id="mine-glow">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect className="mine-switch-grid" width="100%" height="100%" fill="url(#mine-grid)" mask="url(#mine-grid-mask)" />
        <g className="mine-switch-edges">
          {Array.from({ length: EDGES }, (_, i) => <line key={i} />)}
        </g>
        <g className="mine-switch-trace">
          <path className="mine-switch-trace-glow" />
          <path className="mine-switch-trace-core" />
        </g>
        <g className="mine-switch-nodes">
          {Array.from({ length: NODES }, (_, i) => (
            <g key={i} className="mine-switch-node"><circle r="20" fill="url(#mine-glow)" /><circle r="5.5" /><circle r="2" /></g>
          ))}
        </g>
        <g className="mine-switch-signals">
          {Array.from({ length: SIGNALS }, (_, i) => <circle key={i} r="2.4" />)}
        </g>
        <g className="mine-switch-head"><circle r="16" fill="url(#mine-glow)" /><circle r="2.8" /></g>
      </svg>
      <div className="mine-safe">
        <p className="mine-switch-label mine-switch-from"><span>{c.from.name}</span><span>{c.from.note}</span></p>
        <p className="mine-switch-label mine-switch-to"><span>{c.to.name}</span><span>{c.to.note}</span></p>
      </div>
    </div>
  );
}

function build(root, w, h) {
  const S = safe(w, h);
  const svgEl = root.querySelector('svg');
  svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // The heartbeat, as vertices. Node vertices become network nodes; the rest are pulled onto the lines between them.
  const x0 = S.x + S.w * 0.02, bw = (S.w * 0.96) / 4.2, base = S.y + S.h * 0.56, amp = Math.min(S.h * 0.34, 180);
  const verts = [{ ex: x0, ey: base }];
  for (let b = 0; b < 4; b++) {
    for (const [fx, fy, node] of BEAT) verts.push({ ex: x0 + (0.1 + b + fx) * bw, ey: base + fy * amp, node: !!node });
  }
  verts.push({ ex: x0 + 4.2 * bw, ey: base });

  // The network. Layers run left to right; the snake order (down, up, down, up) keeps the taut line from crossing.
  const sp = Math.min((S.h * 0.8) / 5, 76, S.w * 0.16), netW = Math.min(S.w * 0.74, sp * 12);
  const cx = S.x + S.w / 2, cy = S.y + S.h * 0.5;
  const layerOf = [], places = [];
  LAYERS.forEach((m, j) => {
    const lx = cx - netW / 2 + (netW * j) / (LAYERS.length - 1);
    for (let r = 0; r < m; r++) {
      const row = j % 2 ? m - 1 - r : r;
      places.push({ x: lx, y: cy + (row - (m - 1) / 2) * sp, j, row });
    }
  });
  const nodes = verts.filter(v => v.node);
  nodes.forEach((v, k) => {
    Object.assign(v, places[k], { k, at: 0.34 + k * 0.0115, el: null });
    layerOf[v.j] = layerOf[v.j] || [];
    layerOf[v.j][v.row] = v;
  });
  // Each in-between vertex knows its neighbouring nodes and how far along it sits between them.
  verts.forEach((v, i) => {
    if (v.node) return;
    let a = i, b = i;
    while (a >= 0 && !verts[a].node) a--;
    while (b < verts.length && !verts[b].node) b++;
    v.a = verts[a] || verts[b];
    v.b = verts[b] || verts[a];
    v.f = v.a === v.b ? 0 : (v.ex - v.a.ex) / (v.b.ex - v.a.ex);
  });

  const trace = root.querySelector('.mine-switch-trace');
  const paths = [...trace.querySelectorAll('path')];
  const ecg = verts.map(v => `${v.ex.toFixed(1)} ${v.ey.toFixed(1)}`).join('L');
  paths.forEach(el => el.setAttribute('d', `M${ecg}`));
  const strokes = createDrawable(paths);
  const length = paths[1].getTotalLength();
  const trail = root.querySelector('#mine-trail');
  const trailStop = trail.firstElementChild;
  const head = setter(root.querySelector('.mine-switch-head'));

  const nodeEls = [...root.querySelectorAll('.mine-switch-node')];
  nodes.forEach((v, k) => { v.set = setter(nodeEls[k]); v.glow = setter(nodeEls[k].firstElementChild); });

  const lines = [...root.querySelectorAll('.mine-switch-edges line')];
  const edges = [];
  for (let j = 0; j < LAYERS.length - 1; j++) {
    layerOf[j].forEach((a, ra) => layerOf[j + 1].forEach((b, rb) => {
      const el = lines[edges.length];
      el.setAttribute('x1', a.x.toFixed(1)); el.setAttribute('y1', a.y.toFixed(1));
      el.setAttribute('x2', b.x.toFixed(1)); el.setAttribute('y2', b.y.toFixed(1));
      edges.push({ el, j, at: 0.6 + j * 0.045 + ra * 0.007 + rb * 0.002, draw: '', op: '' });
    }));
  }
  const drawables = createDrawable(lines);
  edges.forEach((e, i) => { e.proxy = drawables[i]; });

  const r = random(3);
  const signals = [...root.querySelectorAll('.mine-switch-signals circle')].map(el => ({
    set: setter(el), phase: r(), speed: 0.00022 + r() * 0.00012,
    route: LAYERS.map((m, j) => layerOf[j][Math.floor(r() * m)]),
  }));

  const grid = setter(root.querySelector('.mine-switch-grid'));
  const traceSet = setter(trace);
  const svgSet = setter(svgEl);
  const from = setter(root.querySelector('.mine-switch-from'));
  const to = setter(root.querySelector('.mine-switch-to'));
  const PINK = [245, 169, 194], MIST = [244, 237, 233];
  const reveal = (set, m, dy) => {
    set('opacity', m.toFixed(3));
    set('transform', `translateY(${((1 - m) * dy).toFixed(1)}px)`);
    set('filter', m < 0.99 ? `blur(${((1 - m) * 6).toFixed(1)}px)` : 'none');
  };
  let last = -1, lastDraw = '';

  return {
    render(p, now) {
      const moved = p !== last;
      last = p;
      const out = seg(p, 0.9, 1); // the exit: the whole network recedes
      const formed = seg(p, 0.7, 0.76) * (1 - out);
      if (moved) {
        // 1. The sweep.
        const draw = inOut(seg(p, 0.04, 0.3));
        const v = `0 ${draw.toFixed(4)}`;
        if (v !== lastDraw) { lastDraw = v; strokes.forEach(s => s.setAttribute('draw', v)); }
        const sweeping = draw > 0.001 && draw < 0.999;
        head('opacity', sweeping ? '1' : '0');
        if (sweeping) {
          const pt = paths[1].getPointAtLength(draw * length);
          head('transform', `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`);
          trail.setAttribute('x1', (pt.x - S.w * 0.6).toFixed(1));
          trail.setAttribute('x2', pt.x.toFixed(1));
        }
        trailStop.setAttribute('stop-opacity', lerp(0.12, 1, seg(p, 0.29, 0.37)).toFixed(3));
        grid('opacity', (seg(p, 0, 0.06) * (1 - seg(p, 0.36, 0.5))).toFixed(3));

        // 2. Node by node, the peaks lift into the network and the line is pulled taut behind them.
        for (const n of nodes) {
          const t = expo(seg(p, n.at, n.at + 0.11));
          n.t = t;
          n.cx = lerp(n.ex, n.x, t);
          n.cy = lerp(n.ey, n.y, t) - Math.sin(Math.PI * t) * S.h * 0.05;
        }
        let d = '';
        for (const vx of verts) {
          let x = vx.cx, y = vx.cy;
          if (!vx.node) {
            const m = Math.max(vx.a.t, vx.b.t);
            x = lerp(vx.ex, lerp(vx.a.cx, vx.b.cx, vx.f), m);
            y = lerp(vx.ey, lerp(vx.a.cy, vx.b.cy, vx.f), m);
          }
          d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        paths.forEach(el => el.setAttribute('d', d));
        const k = seg(p, 0.34, 0.6);
        traceSet('color', `rgb(${PINK.map((c0, i) => Math.round(lerp(c0, MIST[i], k))).join(',')})`);
        traceSet('opacity', (1 - seg(p, 0.62, 0.72)).toFixed(3));

        // 3. The connections draw in, layer by layer, bright while drawing; then a pulse runs through them.
        const pulse = seg(p, 0.74, 0.88) * 3.6 - 0.3;
        const bump = x => Math.max(0, 1 - Math.abs(x) * 2.2);
        for (const e of edges) {
          const t = seg(p, e.at, e.at + 0.06);
          const dv = `0 ${cubic(t).toFixed(4)}`;
          if (dv !== e.draw) { e.draw = dv; e.proxy.setAttribute('draw', dv); }
          const op = (t > 0 ? 0.22 + 0.6 * Math.sin(Math.PI * t) + 0.65 * bump(pulse - e.j - 0.5) : 0).toFixed(3);
          if (op !== e.op) { e.op = op; e.el.style.strokeOpacity = op; }
        }
        for (const n of nodes) {
          const s = n.t * (1 + 0.45 * Math.sin(Math.PI * n.t));
          n.set('transform', `translate(${n.cx.toFixed(1)}px,${n.cy.toFixed(1)}px) scale(${s.toFixed(3)})`);
          n.set('opacity', clamp(n.t * 3).toFixed(3));
          n.glow('opacity', clamp(Math.sin(Math.PI * n.t) * 0.9 + bump(pulse - n.j) * 0.9 + 0.15).toFixed(3));
        }

        reveal(from, expo(seg(p, 0.02, 0.1)) * (1 - seg(p, 0.36, 0.44)), p < 0.2 ? 12 : -10);
        reveal(to, expo(seg(p, 0.66, 0.76)) * (1 - out), 12);
        svgSet('opacity', (1 - out).toFixed(3));
        svgSet('transform', out ? `translateY(${(-out * h * 0.04).toFixed(1)}px) scale(${(1 - out * 0.08).toFixed(4)})` : 'none');
      }

      // Signals keep moving through the formed network, even while the scroll rests.
      for (const s of signals) {
        if (formed <= 0) { s.set('opacity', '0'); continue; }
        const u = ((now * s.speed + s.phase) % 1) * (LAYERS.length - 1);
        const j = Math.floor(u), f = inOut(u - j);
        const a = s.route[j], b = s.route[j + 1];
        s.set('transform', `translate(${lerp(a.cx, b.cx, f).toFixed(1)}px,${lerp(a.cy, b.cy, f).toFixed(1)}px)`);
        s.set('opacity', (formed * Math.sin(Math.PI * (u - j))).toFixed(3));
      }
    },
  };
}
