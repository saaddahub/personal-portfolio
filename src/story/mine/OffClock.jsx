import { createDrawable } from 'animejs';
import { mine } from './content.js';
import { useScene, safe, random, seg, expo, inOut, lerp, clamp, setter } from './kit.js';
import './mine.css';

// Chapter six. A city at dusk along the bottom of the stage, its windows lit. A scope's crosshair drifts over the
// night and locks onto each thing he loves in turn, pulling it into focus while the rest go soft. Building by
// building the city goes dark, and as the last lights flicker out, blossom branches climb over the rooftops. The
// world ends, and the plants win.
const c = mine.offclock;
// Where each target sits in the usable box (fractions), clear of the skyline below.
const SPOTS = [[0.2, 0.14], [0.66, 0.08], [0.84, 0.34], [0.38, 0.36], [0.16, 0.56], [0.64, 0.56]];
const BRANCHES = 3, BLOOMS = 9;

export default function OffClock({ onProgress }) {
  const ref = useScene(onProgress, build);
  return (
    <div className="mine-scene mine-off" ref={ref}>
      <div className="mine-off-haze" aria-hidden="true" />
      <svg className="mine-off-city" aria-hidden="true" />
      <ul className="mine-off-targets">
        {c.targets.map(t => <li key={t.name}><span>{t.name}</span><span>{t.note}</span></li>)}
      </ul>
      <svg className="mine-off-reticle" viewBox="-60 -60 120 120" aria-hidden="true">
        <circle r="34" className="mine-off-ring" />
        <g className="mine-off-ticks"><path d="M0-48V-24M0 24V48M-48 0H-24M24 0H48" /></g>
        <circle r="2" className="mine-off-dot" />
      </svg>
    </div>
  );
}

function build(root, w, h) {
  const S = safe(w, h);
  const r = random(23);
  const city = root.querySelector('.mine-off-city');
  city.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // The skyline: silhouettes along the bottom, each with its own group of lit windows.
  const ground = h - Math.min(h * 0.04, 30);
  let markup = '', x = -10;
  const roofs = [];
  for (let b = 0; x < w + 10; b++) {
    const bw = 28 + r() * 64, bh = h * (0.08 + r() * r() * 0.3), top = ground - bh;
    markup += `<rect class="mine-off-bldg" x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${(bh + 40).toFixed(1)}"/>`;
    if (r() < 0.3) markup += `<path class="mine-off-mast" d="M${(x + bw / 2).toFixed(1)} ${top.toFixed(1)}v-${(10 + r() * 22).toFixed(1)}"/>`;
    let win = '';
    for (let wy = top + 8; wy < ground - 8; wy += 10) {
      for (let wx = x + 6; wx < x + bw - 6; wx += 9) if (r() < 0.32) win += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="3.5" height="5"/>`;
    }
    markup += `<g class="mine-off-lit">${win}</g>`;
    roofs.push({ x: x + bw / 2, y: top, bw });
    x += bw + 2 + r() * 6;
  }
  // Branches climb from three rooftops spread across the city, with blooms along them.
  const picks = [0.18, 0.52, 0.84].map(f => roofs.reduce((a, b) => (Math.abs(b.x - f * w) < Math.abs(a.x - f * w) ? b : a)));
  picks.forEach((rf, i) => {
    const dir = i % 2 ? -1 : 1, rise = Math.min(h * 0.36, 260), x0 = rf.x, y0 = rf.y;
    markup += `<path class="mine-off-branch" d="M${x0.toFixed(1)} ${y0.toFixed(1)}C${(x0 + dir * 10).toFixed(1)} ${(y0 - rise * 0.4).toFixed(1)} ${(x0 + dir * rise * 0.5).toFixed(1)} ${(y0 - rise * 0.55).toFixed(1)} ${(x0 + dir * rise * 0.42).toFixed(1)} ${(y0 - rise).toFixed(1)}"/>`;
  });
  city.innerHTML = markup + Array.from({ length: BRANCHES * BLOOMS }, () => '<circle class="mine-off-bloom" r="1"/>').join('');

  const lit = [...city.querySelectorAll('.mine-off-lit')].map(el => ({ set: setter(el), at: 0.22 + r() * 0.5, f: r() * 40 }));
  const branchEls = [...city.querySelectorAll('.mine-off-branch')];
  const branches = createDrawable(branchEls);
  const blooms = [...city.querySelectorAll('.mine-off-bloom')].map((el, i) => {
    const b = Math.floor(i / BLOOMS), path = branchEls[b], f = 0.25 + ((i % BLOOMS) / (BLOOMS - 1)) * 0.75;
    const pt = path.getPointAtLength(path.getTotalLength() * f);
    const size = 3 + r() * 5;
    return { set: setter(el), b, f, x: pt.x + (r() - 0.5) * 14, y: pt.y + (r() - 0.5) * 14, size };
  });

  // Targets: centred on their spots, but kept inside the box however long the words are.
  const targets = [...root.querySelectorAll('.mine-off-targets li')].map((el, i) => {
    const tw = el.offsetWidth, th = el.offsetHeight;
    const tx = clamp(S.x + SPOTS[i][0] * S.w, S.x + tw / 2, S.x + S.w - tw / 2);
    const ty = S.y + SPOTS[i][1] * S.h + th / 2;
    el.style.left = `${(tx - tw / 2).toFixed(1)}px`;
    el.style.top = `${(ty - th / 2).toFixed(1)}px`;
    return { set: setter(el), x: tx, y: ty };
  });
  const n = targets.length, t0 = 0.08, step = 0.11; // each target holds the crosshair for one step
  const reticle = setter(root.querySelector('.mine-off-reticle'));
  const ticks = setter(root.querySelector('.mine-off-ticks'));
  const haze = setter(root.querySelector('.mine-off-haze'));
  let last = -1;

  return {
    render(p, now) {
      const moved = p !== last;
      last = p;
      const out = seg(p, 0.88, 0.98);
      // Where the crosshair is: travelling for the first 40% of each step, locked for the rest.
      const u = clamp((p - t0) / step, 0, n - 1), k = Math.floor(u), f = u - k;
      const move = inOut(seg(f, 0, 0.4)), lock = k >= n - 1 ? 1 : seg(f, 0.4, 0.55) * (1 - seg(f, 0.9, 1));
      const a = targets[k], b = targets[Math.min(k + 1, n - 1)];
      const sway = 1 - lock * 0.7; // a held breath steadies the scope
      const rx = lerp(a.x, b.x, move) + Math.sin(now * 0.0011) * 6 * sway;
      const ry = lerp(a.y, b.y, move) + Math.sin(now * 0.0017 + 1) * 4 * sway;
      const arrive = expo(seg(p, 0.02, 0.1));
      reticle('transform', `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px) scale(${lerp(1.5, 1, arrive).toFixed(3)})`);
      reticle('opacity', (arrive * (1 - out)).toFixed(3));
      if (!moved) return;
      ticks('transform', `scale(${lerp(1.25, 0.85, lock).toFixed(3)})`);
      targets.forEach((t, i) => {
        const seen = expo(seg(p, t0 + (i - 0.6) * step, t0 + (i - 0.1) * step)); // appears as the scope arrives
        const focus = i === k ? lock : i === k + 1 ? move * 0.5 : 0;
        t.set('opacity', (seen * (0.32 + 0.68 * focus) * (1 - out)).toFixed(3));
        t.set('filter', focus > 0.98 ? 'none' : `blur(${((1 - focus) * 3 * seen).toFixed(2)}px)`);
        t.set('transform', `scale(${lerp(0.94, 1, focus).toFixed(3)})`);
      });
      // The city goes dark building by building, each window group flickering before it goes out.
      let on = 0;
      for (const l of lit) {
        const q = seg(p, l.at, l.at + 0.035);
        const v = q <= 0 ? 1 : q >= 1 ? 0 : (1 - q) * (Math.sin(q * l.f) > 0 ? 1 : 0.25);
        l.set('opacity', v.toFixed(2));
        on += v;
      }
      haze('opacity', (0.35 + 0.65 * (on / lit.length)).toFixed(3));
      // As the last lights go, blossom reclaims the rooftops.
      branches.forEach((br, i) => br.setAttribute('draw', `0 ${inOut(seg(p, 0.56 + i * 0.05, 0.8 + i * 0.05)).toFixed(4)}`));
      for (const bl of blooms) {
        const g = expo(seg(p, 0.56 + bl.b * 0.05 + bl.f * 0.24, 0.62 + bl.b * 0.05 + bl.f * 0.24));
        bl.set('transform', `translate(${bl.x.toFixed(1)}px,${bl.y.toFixed(1)}px) scale(${(g * bl.size).toFixed(2)})`);
      }
    },
  };
}
