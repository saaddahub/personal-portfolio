import { animate, createDraggable } from 'animejs';
import { Send } from 'lucide-react';
import { mine } from './content.js';
import { scene } from '../../scene.js';
import { useScene, random, seg, expo, lerp, clamp, reduced, setter, TAU } from './kit.js';
import './mine.css';

// Chapter seven. A gust sweeps petals across the stage (and through the real blossom scene behind), carrying in a
// glass postcard addressed to Saad. It tumbles, flutters and settles. It can be picked up: drag it and it follows
// the finger with rubber-banded edges; let go and it springs home with the momentum you gave it. Flick it upwards
// and it flies off the top of the screen, opening an email to him. "Send" does the same for everyone else.
const c = mine.next;
const PETALS = 26;
const mailto = `mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`;

export default function Next({ onProgress }) {
  const ref = useScene(onProgress, build);
  return (
    <div className="mine-scene mine-next" ref={ref}>
      <div className="mine-next-petals" aria-hidden="true">{Array.from({ length: PETALS }, (_, i) => <i key={i} />)}</div>
      <div className="mine-card-fly">
        <div className="mine-card-toss">
          <article className="mine-card" aria-label={`${c.to} ${c.name}`}>
            <span className="mine-card-sheen" aria-hidden="true" />
            <div className="mine-card-message">
              <p className="mine-card-lead">{c.message}</p>
              <p className="mine-card-avail">{c.availability}</p>
            </div>
            <div className="mine-card-address">
              <div className="mine-card-stamp" aria-hidden="true">
                <svg viewBox="-20 -20 40 40">
                  {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-8" rx="5.5" ry="8.5" transform={`rotate(${a})`} />)}
                  <circle r="3" />
                </svg>
              </div>
              <svg className="mine-card-postmark" viewBox="0 0 120 64" aria-hidden="true">
                <circle cx="32" cy="32" r="26" />
                <circle cx="32" cy="32" r="19" />
                <text x="32" y="35.5" textAnchor="middle">{c.postmark}</text>
                <path d="M64 18q7-5 14 0t14 0t14 0t14 0M64 32q7-5 14 0t14 0t14 0t14 0M64 46q7-5 14 0t14 0t14 0t14 0" />
              </svg>
              <p className="mine-card-to"><span>{c.to}</span>{c.name}</p>
              <p className="mine-card-place">{c.place}</p>
              <p className="mine-card-email">{c.email}</p>
            </div>
            <div className="mine-card-foot">
              <a className="mine-card-send" href={mailto}>{c.send}<Send aria-hidden="true" /></a>
              <span className="mine-card-hint">{c.hint}</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function build(root, w, h) {
  const r = random(31);
  const petals = [...root.querySelectorAll('.mine-next-petals i')].map(el => {
    const d = r(), size = lerp(8, 30, d * d);
    el.style.width = `${size}px`;
    el.style.height = `${size * 0.7}px`;
    el.style.filter = d > 0.75 ? `blur(${((d - 0.75) * 16).toFixed(1)}px)` : 'none';
    return { set: setter(el), a: r() * 0.3, y: h * (0.1 + r() * 0.8), lift: h * (r() - 0.6) * 0.5, amp: 20 + r() * 60, ph: r() * TAU, spin: 540 + r() * 900, dur: 0.16 + (1 - d) * 0.12 };
  });
  const fly = setter(root.querySelector('.mine-card-fly'));
  const toss = root.querySelector('.mine-card-toss');
  const card = root.querySelector('.mine-card');
  const sheen = setter(root.querySelector('.mine-card-sheen'));
  const link = root.querySelector('.mine-card-send');
  let gusted = false, last = -1, sending = null;

  // Picking the card up. Off under reduced motion: Send still works.
  const drag = reduced() ? null : createDraggable(card, {
    container: root,
    snap: [0], // always home, by way of the release spring
    releaseStiffness: 180,
    releaseDamping: 21, // a damping ratio near 0.8: it bounces only because a flick came before
    onRelease: d => {
      // An upward flick sends it: fast, mostly upward, and already lifted a little.
      if (d.velocity < 0.6 || Math.sin(d.angle) > -0.55 || d.y > -20) return;
      const x0 = d.x, y0 = d.y, v = Math.max(d.velocity, 1);
      d.stop(); d.setX(0); d.setY(0); d.disable();
      const dist = h + 200 + y0;
      // The toss carries on at the finger's own speed (an out-quad starts at twice its average speed).
      sending = animate(toss, {
        x: [x0, x0 + Math.cos(d.angle) * dist * 0.4], y: [y0, -dist], rotate: [0, Math.cos(d.angle) * 24],
        duration: clamp((2 * dist) / v, 260, 700), ease: 'outQuad',
        onComplete: () => {
          link.click();
          sending = animate(toss, { x: [0, 0], y: [0, 0], rotate: 0, opacity: [0, 1], scale: [0.92, 1], filter: ['blur(10px)', 'blur(0px)'], duration: 700, delay: 500, ease: 'outExpo', onComplete: () => d.enable() });
        },
      });
    },
  });

  return {
    render(p, now) {
      // The gust also stirs the real petals behind the story, once each time it is scrolled into.
      if (p > 0.08 && p < 0.3 && !gusted) { gusted = true; [0.3, 0.5, 0.7].forEach(f => scene.current?.gust(h * f)); }
      if (p < 0.04) gusted = false;
      for (const pt of petals) {
        const u = seg(p, pt.a, pt.a + pt.dur);
        if (u <= 0 || u >= 1) { pt.set('opacity', '0'); continue; }
        const x = lerp(-0.1, 1.1, u) * w, y = pt.y + pt.lift * u + Math.sin(u * 7 + pt.ph) * pt.amp;
        const a = u * pt.spin + now * 0.05;
        pt.set('opacity', (Math.sin(Math.PI * u) * 0.9).toFixed(3));
        pt.set('transform', `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateX(${(a * 1.4).toFixed(1)}deg) rotateY(${(a * 0.7).toFixed(1)}deg) rotateZ(${a.toFixed(1)}deg)`);
      }
      if (p === last) return;
      last = p;
      // Carried in by the gust: from off the left edge, tumbling, fluttering, then settling with a slight tilt.
      const t = expo(seg(p, 0.1, 0.4)), q = 1 - t;
      const flutter = Math.sin(seg(p, 0.1, 0.4) * TAU * 2.5) * q;
      fly('transform', `perspective(1400px) translate3d(${(-q * w * 0.75).toFixed(1)}px,${(q * h * 0.08 + flutter * 18).toFixed(1)}px,0) rotateX(${(flutter * 18).toFixed(2)}deg) rotateY(${(q * 48).toFixed(2)}deg) rotateZ(${lerp(-16, -2, t).toFixed(2)}deg) scale(${lerp(0.88, 1, t).toFixed(4)})`);
      fly('opacity', clamp(t * 1.6).toFixed(3));
      fly('--mine-blur', `${(t * 22).toFixed(1)}px`); // glass materialises: blur and scale arrive together
      // Light slides across the glass as it turns to face the visitor.
      sheen('transform', `translateX(${lerp(-120, 120, seg(p, 0.22, 0.46)).toFixed(1)}%)`);
    },
    destroy() { drag?.revert(); sending?.revert(); },
  };
}
