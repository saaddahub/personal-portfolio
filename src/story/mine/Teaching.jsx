import { createDrawable } from 'animejs';
import { mine } from './content.js';
import { useScene, safe, seg, expo, inOut, lerp, clamp, TAU } from './kit.js';
import './mine.css';

// Chapter five. A line of ink writes a looping, cursive track across the night. Words ride it one after another,
// banking into the curves, swelling and sharpening as the loops bring them close, stretching with their speed.
// Each peels off at its own point and glides down into its place in a real, wrapped sentence, the topics he taught
// settle beneath it, and a hand-drawn underline finishes the thought. On the way out the words float up and away.
const c = mine.teaching;
// The track, in fractions of the usable box: an entry swoop, three loops, an exit.
const TRACK = [
  [-0.08, 0.82], [0.12, 0.98, 0.22, 0.18, 0.31, 0.32], [0.38, 0.46, 0.22, 0.64, 0.23, 0.42],
  [0.25, 0.14, 0.5, 0.08, 0.55, 0.38], [0.6, 0.68, 0.41, 0.72, 0.46, 0.48], [0.51, 0.24, 0.74, 0.16, 0.79, 0.44],
  [0.84, 0.72, 0.66, 0.74, 0.7, 0.52], [0.74, 0.3, 0.96, 0.28, 1.12, 0.36],
];
const SAMPLES = 480, SPEED = 2.4;

export default function Teaching({ onProgress }) {
  const ref = useScene(onProgress, build);
  const word = (t, cls) => <span key={t} className={`mine-word ${cls}`}>{t}</span>;
  return (
    <div className="mine-scene mine-teach" ref={ref}>
      <svg className="mine-teach-svg" aria-hidden="true">
        <path className="mine-teach-ink" />
        <path className="mine-teach-underline" />
      </svg>
      <div className="mine-teach-text">
        <p className="mine-teach-sentence">
          {c.sentence.map(t => word(t, 'mine-word-main'))}{' '}
          <span className="mine-teach-accent">{c.accent.map(t => word(t, 'mine-word-main'))}</span>
        </p>
        <p className="mine-teach-topics">{c.topics.map(t => word(t, 'mine-word-topic'))}</p>
        <p className="mine-teach-role"><span>{c.role}</span><span className="mine-dot" aria-hidden="true" /><span>{c.note}</span></p>
      </div>
    </div>
  );
}

function build(root, w, h) {
  const S = safe(w, h);
  const svgEl = root.querySelector('svg');
  svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const X = v => (S.x + v * S.w).toFixed(1), Y = v => (S.y + v * S.h).toFixed(1);
  const d = TRACK.map((pt, i) => (i ? `C${X(pt[0])} ${Y(pt[1])} ${X(pt[2])} ${Y(pt[3])} ${X(pt[4])} ${Y(pt[5])}` : `M${X(pt[0])} ${Y(pt[1])}`)).join('');
  const ink = root.querySelector('.mine-teach-ink');
  ink.setAttribute('d', d);

  // The track as a lookup table, so no frame ever has to measure the path.
  const len = ink.getTotalLength(), lut = [];
  for (let i = 0; i <= SAMPLES; i++) { const pt = ink.getPointAtLength((i / SAMPLES) * len); lut.push([pt.x, pt.y]); }
  const at = s => {
    const f = clamp(s) * SAMPLES, i = Math.min(Math.floor(f), SAMPLES - 1), k = f - i;
    const [x0, y0] = lut[i], [x1, y1] = lut[i + 1];
    return [lerp(x0, x1, k), lerp(y0, y1, k), Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI)];
  };

  // Each word's resting place is wherever the browser laid it out; flight is an offset from there.
  const box = root.getBoundingClientRect();
  const els = [...root.querySelectorAll('.mine-word')];
  els.forEach(el => { el.style.transform = ''; });
  const n = els.length;
  const words = els.map((el, i) => {
    const r = el.getBoundingClientRect();
    const a = 0.06 + i * 0.028, leave = lerp(0.95, 0.5, i / (n - 1));
    return { el, i, a, leave, pl: a + leave / SPEED, sx: r.left - box.left + r.width / 2, sy: r.top - box.top + r.height / 2, px: null, py: null };
  });

  const accent = root.querySelector('.mine-teach-accent').getBoundingClientRect();
  const ux0 = accent.left - box.left, ux1 = accent.right - box.left, uy = accent.bottom - box.top + 2;
  const underline = root.querySelector('.mine-teach-underline');
  underline.setAttribute('d', `M${ux0.toFixed(1)} ${(uy + 3).toFixed(1)}C${lerp(ux0, ux1, 0.3).toFixed(1)} ${(uy - 2).toFixed(1)} ${lerp(ux0, ux1, 0.7).toFixed(1)} ${(uy + 5).toFixed(1)} ${(ux1 + 6).toFixed(1)} ${(uy - 1).toFixed(1)}`);
  const [inkD, lineD] = createDrawable([ink, underline]);
  const role = root.querySelector('.mine-teach-role');
  let last = -1, stretched = false;

  return {
    render(p) {
      if (p === last && !stretched) return; // a stretched word still has to relax back
      last = p;
      stretched = false;
      inkD.setAttribute('draw', `0 ${inOut(seg(p, 0.02, 0.2)).toFixed(4)}`);
      ink.style.opacity = (0.6 * (1 - seg(p, 0.58, 0.7))).toFixed(3);
      lineD.setAttribute('draw', `${inOut(seg(p, 0.84, 0.92)).toFixed(4)} ${inOut(seg(p, 0.62, 0.7)).toFixed(4)}`);
      const m = expo(seg(p, 0.62, 0.72)) * (1 - seg(p, 0.82, 0.88));
      role.style.opacity = m.toFixed(3);
      role.style.transform = `translateY(${((1 - m) * 10).toFixed(1)}px)`;

      for (const wd of words) {
        const s = (p - wd.a) * SPEED;
        let x, y, ang, sc, blur, op;
        if (s <= 0) { wd.el.style.opacity = '0'; wd.px = null; continue; }
        const [lx, ly, la] = at(Math.min(s, wd.leave));
        const depth = 0.5 + 0.5 * Math.sin(Math.min(s, wd.leave) * TAU * 2.2 + wd.i);
        const g = expo(seg(p, wd.pl, wd.pl + 0.12)); // the glide from the track down to its place
        if (g > 0) {
          // A cubic from the leave point, carried forward along the track's direction, settling from just above.
          const [, , ta] = at(wd.leave), k = 120, rad = (ta * Math.PI) / 180;
          const c1x = lx + Math.cos(rad) * k, c1y = ly + Math.sin(rad) * k, c2x = wd.sx, c2y = wd.sy - 70, u = 1 - g;
          x = u * u * u * lx + 3 * u * u * g * c1x + 3 * u * g * g * c2x + g * g * g * wd.sx;
          y = u * u * u * ly + 3 * u * u * g * c1y + 3 * u * g * g * c2y + g * g * g * wd.sy;
          const da = ((((0 - la) % 360) + 540) % 360) - 180;
          ang = la + da * g;
        } else { x = lx; y = ly; ang = la; }
        sc = lerp(0.72 + 0.42 * depth, 1, g);
        blur = lerp((1 - depth) * 2.6, 0, g);
        op = lerp(0.5 + 0.5 * depth, 1, g) * clamp(s * 12);
        // Motion stretch from the real on-screen speed: gone the moment the scroll stops.
        const v = wd.px === null ? 0 : Math.hypot(x - wd.px, y - wd.py);
        wd.px = x; wd.py = y;
        const stretch = 1 + Math.min(v * 0.01, 0.4);
        if (stretch > 1.001) stretched = true;
        const out = seg(p, 0.84 + wd.i * 0.008, 0.94 + wd.i * 0.008);
        y -= expo(out) * 70;
        blur += out * 6;
        op *= 1 - out;
        wd.el.style.transform = `translate(${(x - wd.sx).toFixed(1)}px,${(y - wd.sy).toFixed(1)}px) rotate(${ang.toFixed(1)}deg) scale(${(sc * stretch).toFixed(3)},${sc.toFixed(3)})`;
        wd.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
        wd.el.style.opacity = op.toFixed(3);
      }
    },
  };
}
