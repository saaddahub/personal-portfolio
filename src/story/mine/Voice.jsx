import { createDrawable } from 'animejs';
import { mine } from './content.js';
import { useScene, seg, expo, inOut, cubic, clamp, setter } from './kit.js';
import './mine.css';

// Chapter two. One continuous line of light, led by a glowing nib, draws a studio microphone: stand, yoke, capsule
// and grille. The capsule fills with glass and lights up, then sound rolls outward from it in waves of light on both
// sides, alive while the scroll rests. On the way out the line retracts into its own end and the waves fall silent.
const c = mine.voice;
const BARS = 14; // per side

// A single stroke: base, pole, left arm of the yoke, capsule outline, grille ribs, right arm, back to the pole.
const MIC = 'M120 440C150 440 176 444 182 452L58 452C64 444 90 440 120 440L120 300C74 300 60 268 60 226L60 170L72 170'
  + 'L72 88A48 48 0 0 1 168 88L168 182A48 48 0 0 1 72 182L72 164L168 164L168 146L72 146L72 128L168 128L168 110'
  + 'L72 110L72 92L168 92L168 170L180 170L180 226C180 268 166 300 120 300';

export default function Voice({ onProgress }) {
  const ref = useScene(onProgress, build);
  const side = s => (
    <div className="mine-voice-side" data-side={s}>
      {Array.from({ length: BARS }, (_, i) => <i key={i} />)}
    </div>
  );
  return (
    <div className="mine-scene mine-voice" ref={ref}>
      <div className="mine-voice-rig">
        <div className="mine-voice-bars" aria-hidden="true">{side('l')}<span className="mine-voice-gap" />{side('r')}</div>
        <svg className="mine-voice-mic" viewBox="0 0 240 480" aria-hidden="true">
          <defs>
            <linearGradient id="mine-mic-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4ede9" stopOpacity="0.16" />
              <stop offset="0.45" stopColor="#f4ede9" stopOpacity="0.04" />
              <stop offset="1" stopColor="#0d0a10" stopOpacity="0.5" />
            </linearGradient>
            <radialGradient id="mine-mic-light">
              <stop offset="0" stopColor="#ffdbe6" stopOpacity="0.55" />
              <stop offset="0.45" stopColor="#f5a9c2" stopOpacity="0.18" />
              <stop offset="1" stopColor="#d9577e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="mine-voice-light" cx="120" cy="128" r="96" fill="url(#mine-mic-light)" />
          <g className="mine-voice-body">
            <rect x="72" y="40" width="96" height="190" rx="48" fill="url(#mine-mic-glass)" />
            <path d="M86 78Q86 58 102 50" className="mine-voice-spec" />
          </g>
          <path className="mine-voice-glow" d={MIC} />
          <path className="mine-voice-line" d={MIC} />
          <circle className="mine-voice-pivot" cx="60" cy="170" r="5" />
          <circle className="mine-voice-pivot" cx="180" cy="170" r="5" />
          <g className="mine-voice-nib"><circle r="12" fill="url(#mine-mic-light)" /><circle r="2.6" /></g>
        </svg>
      </div>
      <div className="mine-voice-award">
        <p className="mine-voice-year">{c.year}</p>
        <p className="mine-voice-prize">{c.prize}</p>
        <p className="mine-voice-event">{c.event}</p>
      </div>
    </div>
  );
}

function build(root) {
  const line = root.querySelector('.mine-voice-line');
  const strokes = createDrawable([line, root.querySelector('.mine-voice-glow')]);
  const length = line.getTotalLength();
  const nib = setter(root.querySelector('.mine-voice-nib'));
  const body = setter(root.querySelector('.mine-voice-body'));
  const light = setter(root.querySelector('.mine-voice-light'));
  const pivots = [...root.querySelectorAll('.mine-voice-pivot')].map(setter);
  const award = [...root.querySelectorAll('.mine-voice-award p')].map(setter);
  // d: distance from the microphone, 0 beside it … 1 at the far edge. The left side is rendered edge-first.
  const bars = [...root.querySelectorAll('.mine-voice-side')].flatMap(s => [...s.children].map((el, i) => ({
    set: setter(el), d: s.dataset.side === 'l' ? (BARS - 1 - i) / (BARS - 1) : i / (BARS - 1), k: s.dataset.side === 'l' ? 0 : 1.3,
  })));
  let last = -1, drawn = '';

  return {
    render(p, now) {
      const moved = p !== last;
      last = p;
      const draw = inOut(seg(p, 0.04, 0.36)), erase = inOut(seg(p, 0.84, 0.97));
      if (moved) {
        const v = `${erase.toFixed(4)} ${draw.toFixed(4)}`;
        if (v !== drawn) { drawn = v; strokes.forEach(s => s.setAttribute('draw', v)); }
        const writing = draw > 0.001 && draw < 0.999;
        nib('opacity', writing ? '1' : '0');
        if (writing) {
          const pt = line.getPointAtLength(draw * length);
          nib('transform', `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`);
        }
        const fill = expo(seg(draw, 0.72, 1)) * (1 - erase);
        body('opacity', fill.toFixed(3));
        pivots.forEach(s => s('opacity', (seg(draw, 0.55, 0.7) * (1 - erase)).toFixed(3)));
        award.forEach((s, i) => {
          const m = expo(seg(p, 0.36 + i * 0.035, 0.47 + i * 0.035)) * (1 - seg(p, 0.81, 0.87));
          s('opacity', m.toFixed(3));
          s('transform', `translateY(${((1 - m) * (p < 0.6 ? 14 : -10)).toFixed(1)}px)`);
          s('filter', m < 0.99 ? `blur(${((1 - m) * 6).toFixed(1)}px)` : 'none');
        });
      }
      // Sound rolls outward from the capsule: travelling waves, rising from the mic out, falling from the edges in.
      let energy = 0, live = false;
      for (const b of bars) {
        const env = expo(seg(p, 0.4 + b.d * 0.1, 0.5 + b.d * 0.1)) * (1 - cubic(seg(p, 0.82 + (1 - b.d) * 0.06, 0.9 + (1 - b.d) * 0.06)));
        if (env < 0.001 && !moved) continue;
        live = live || env > 0.001;
        const wave = 0.6 * Math.sin(b.d * 7 - now * 0.0068 - p * 28 + b.k) + 0.4 * Math.sin(b.d * 13 - now * 0.0109 + b.k * 2);
        const s = Math.max(0.03, env * (0.3 + 0.7 * (1 - b.d) ** 1.4) * (0.55 + 0.45 * wave));
        b.set('transform', `scaleY(${s.toFixed(3)})`);
        b.set('opacity', (clamp(env * 2) * (0.4 + 0.6 * (1 - b.d))).toFixed(3));
        energy += s;
      }
      if (moved || live) {
        const on = expo(seg(draw, 0.8, 1)) * (1 - erase);
        light('opacity', clamp(on * 0.35 + (energy / bars.length) * 0.9).toFixed(3));
      }
    },
  };
}
