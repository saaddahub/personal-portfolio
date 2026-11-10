import { mine } from './content.js';
import { useScene, random, seg, cubic, expo, lerp, clamp, setter, TAU } from './kit.js';
import './mine.css';

// Chapter one. The letters of "Lahore" fall through the air like petals: tumbling in 3D, swaying, out of focus
// while far from the lens, pink while they are still petals. They land, sharpen and turn to mist-white type, then
// a gust lifts them off to the right, one of them sweeping past the camera.
const c = mine.lahore;
const PETALS = 10;

export default function Lahore({ onProgress }) {
  const ref = useScene(onProgress, build);
  return (
    <div className="mine-scene mine-lahore" ref={ref}>
      <div className="mine-lahore-halo" />
      <p className="mine-lahore-word" aria-hidden="true">
        {[...c.word].map((ch, i) => <span key={i}>{ch}</span>)}
      </p>
      <p className="mine-lahore-meta"><span>{c.place}</span><span className="mine-dot" aria-hidden="true" /><span>{c.note}</span></p>
      <div className="mine-lahore-petals" aria-hidden="true">
        {Array.from({ length: PETALS }, (_, i) => <i key={i} />)}
      </div>
    </div>
  );
}

const PINK = [245, 169, 194], MIST = [244, 237, 233];

function build(root, w, h) {
  const r = random(11);
  const chars = [...root.querySelectorAll('.mine-lahore-word span')];
  const n = chars.length;
  const letters = chars.map((el, i) => {
    const side = r() < 0.5 ? -1 : 1;
    return {
      set: setter(el),
      a: 0.02 + r() * 0.13, // when this petal starts its fall (random order)
      x: (r() - 0.5) * w * 1.2, y: -h * (0.5 + r() * 0.4), z: -950 + r() * 1250,
      rx: side * (150 + r() * 220), ry: -side * (90 + r() * 200), rz: (r() - 0.5) * 260,
      sway: 40 + r() * 100, turns: 1 + r() * 1.2, phase: r() * TAU,
      b: 0.78 + (i / n) * 0.08 + r() * 0.02, // the exit gust takes them left to right
      ex: w * (0.5 + r() * 0.6), ey: -h * (0.1 + r() * 0.45),
      ez: i === 2 ? 760 : r() < 0.4 ? 300 + r() * 250 : -600 - r() * 600, // one letter brushes past the lens
      es: (r() < 0.5 ? -1 : 1) * (240 + r() * 420),
    };
  });

  // Foreground petals at several depths, focused on the word's plane: near and far ones are soft.
  const petals = [...root.querySelectorAll('.mine-lahore-petals i')].map((el, i) => {
    const d = i / (PETALS - 1); // 0 far … 1 nearest the lens
    const size = lerp(10, 70, d * d);
    el.style.width = `${size}px`;
    el.style.height = `${size * 0.72}px`;
    el.style.filter = `blur(${(Math.abs(d - 0.3) * 11).toFixed(1)}px)`;
    el.style.opacity = (0.35 + 0.5 * (1 - Math.abs(d - 0.4))).toFixed(2);
    return {
      set: setter(el), d,
      x: r() * w * 1.3 - w * 0.15, y: r() * h * 0.9 - h * 0.1,
      vx: w * (0.25 + d * 0.9), vy: h * (0.15 + r() * 0.3),
      amp: 20 + r() * 50, phase: r() * TAU, spin: 360 + r() * 720,
    };
  });

  const halo = setter(root.querySelector('.mine-lahore-halo'));
  const meta = setter(root.querySelector('.mine-lahore-meta'));
  let last = -1;

  return {
    render(p, now) {
      const moved = p !== last;
      last = p;
      let landed = 0;
      for (const l of letters) {
        const t = seg(p, l.a, l.a + 0.34), e = cubic(t), q = 1 - e; // q: how much of the fall is left
        const u = seg(p, l.b, l.b + 0.15), g = u * u; // the gust, gathering speed
        if (!moved && q + g < 0.001) continue; // settled letters need no repaint
        const flutter = (q + g) * Math.sin(now * 0.0022 + l.phase); // breathes only while in the air
        const x = l.x * q + l.sway * q * Math.sin(l.phase + t * l.turns * TAU) + l.ex * g;
        const y = l.y * q + flutter * 9 + l.ey * g;
        const z = Math.min(l.z * q + l.ez * g, 820);
        const rx = l.rx * q ** 1.4 + flutter * 16 + l.es * g * 0.5;
        const ry = l.ry * q ** 1.3 + l.es * g;
        const rz = l.rz * q ** 1.2 + flutter * 6 + l.es * g * 0.25;
        const blur = Math.abs(z) * 0.0065 + q * 1.4 + g * 5;
        l.set('transform', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`);
        l.set('filter', blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : 'none');
        l.set('opacity', (clamp(t * 5) * (1 - seg(u, 0.5, 1))).toFixed(3));
        const k = clamp(e * 1.25 - 0.25); // still a petal until it is nearly down
        l.set('color', `rgb(${PINK.map((v, j) => Math.round(lerp(v, MIST[j], k))).join(',')})`);
        landed += e * (1 - g);
      }
      if (moved) {
        const f = landed / letters.length;
        halo('opacity', (f * 0.9).toFixed(3));
        halo('transform', `translate(-50%,-50%) scale(${lerp(0.6, 1, f).toFixed(3)})`);
        const m = expo(seg(p, 0.42, 0.54)) * (1 - seg(p, 0.77, 0.83));
        meta('opacity', m.toFixed(3));
        meta('transform', `translateY(${((1 - m) * (p < 0.6 ? 12 : -8)).toFixed(1)}px)`);
        meta('filter', m < 0.99 ? `blur(${((1 - m) * 6).toFixed(1)}px)` : 'none');
      }
      for (const pt of petals) {
        const tt = p + Math.sin(now * 0.0004 + pt.phase) * 0.004; // a little air even when the scroll rests
        const x = ((pt.x + tt * pt.vx) % (w * 1.3) + w * 1.3) % (w * 1.3) - w * 0.15;
        const y = pt.y + tt * pt.vy + Math.sin(tt * 9 + pt.phase) * pt.amp;
        const a = tt * pt.spin + pt.phase * 57;
        pt.set('transform', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateX(${(a * 1.3).toFixed(1)}deg) rotateY(${(a * 0.6).toFixed(1)}deg) rotateZ(${a.toFixed(1)}deg)`);
      }
    },
  };
}
