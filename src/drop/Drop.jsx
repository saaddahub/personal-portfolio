import { useEffect, useRef, useState } from 'react';
import { content } from '../content.js';
import { preload, soundStarted, speak, voiceLevel } from '../narrator.js';
import { afterNavigate } from '../router.jsx';
import { RING, blobPath, chase, poke, ripple, stretch } from './physics.js';
import { FACES, IDLE, MOODS } from './faces.jsx';
import { OUTFITS, SPECS } from './outfits.jsx';
import './drop.css';

// The guide: a drop of water made of the site's glass, with a face. It sits beside whatever the narrator is
// saying (the Showcase and Story captions), glides up to each page's title to say that page's line, and rests in
// the corner in between. Hover over it and it pulls a new face every time; now and then it goes shy instead,
// blushes and scoots off. It ripples with the voice, dents against the screen's edges, sloshes when you scroll
// fast, blinks, follows the cursor with its eyes, and splashes when the page changes.

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const radius = () => (innerWidth < 640 ? 38 : 52);
const SPOKEN = new Set(); // each page's line once per visit
const keyOf = id => `drop-${id}.0`;
// A face it has not pulled recently, so every hover brings something new.
const pick = (list, recent) => { const pool = list.filter(x => !recent.includes(x)); return pool[Math.floor(Math.random() * pool.length)]; };

function aim(r) {
  const h = innerHeight, w = innerWidth;
  // Beside a caption the narrator is reading, as if the drop were saying it.
  for (const el of document.querySelectorAll('.sc-caption[data-on="true"], .ch-caption[data-on="true"]')) {
    const q = el.getBoundingClientRect();
    if (!q.width || q.top < 70 || q.bottom > h) continue;
    return q.left > r * 2 + 28 ? { x: q.left - r - 18, y: q.top + q.height / 2, caption: true } : { x: q.left + r + 6, y: q.top - r - 12, caption: true };
  }
  // Above a page's title while it is on screen, to say that page's line.
  for (const el of document.querySelectorAll('[data-drop]')) {
    const q = el.getBoundingClientRect();
    if (q.bottom < 100 || q.top > h * 0.75) continue;
    return { x: Math.min(q.left + r + 2, w - r - 12), y: Math.max(100, q.top - r - 22), id: el.dataset.drop };
  }
  return { x: r + 22, y: h - r - 26 }; // resting in the corner, out of the way
}

export default function Drop() {
  const body = useRef(null), svg = useRef(null), face = useRef(null), wear = useRef(null), mirror = useRef(null), bubble = useRef(null);
  const [line, setLine] = useState(null);
  const [mood, setMood] = useState('chill');
  const [outfit, setOutfit] = useState('none');

  useEffect(() => {
    const el = body.current, rim = svg.current.querySelector('.drop-rim'), eyes = face.current, bub = bubble.current;
    const s = { x: radius() + 22, y: innerHeight + 80, vx: 0, vy: 0 }; // rises in from below the screen
    const w = new Array(RING).fill(0), v = new Array(RING).fill(0);
    const pointer = { x: -1e4, y: -1e4 };
    let raf = 0, last = performance.now(), r = 0, lastScroll = scrollY, showing = null, hideAt = 0;
    let nextBreath = 0, nextBlink = performance.now() + 2500, nextShy = performance.now() + 25000, nextQuirk = performance.now() + 9000, moodUntil = 0, shakeUntil = 0;
    let hovered = false, current = 'chill', shyFrom = null, dressed = 'none';
    const pokes = []; // when the cursor last landed on it, to tell playing from pestering
    const recent = [];
    const dpr = Math.min(devicePixelRatio || 1, 2), mctx = mirror.current.getContext('2d');
    let fresnel = null;

    const feel = (m, ms) => { current = m; setMood(m); moodUntil = performance.now() + ms; };
    const size = () => {
      r = radius();
      el.style.width = el.style.height = wear.current.style.width = wear.current.style.height = `${r * 2}px`;
      svg.current.setAttribute('viewBox', `0 0 ${r * 2} ${r * 2}`);
      face.current.parentNode.setAttribute('transform', `scale(${(r * 2) / 100})`); // the face box covers the whole drop
      const px = Math.round(r * 2 * dpr);
      mirror.current.width = mirror.current.height = px;
      // Fresnel: glass reflects little where you look straight into it and nearly everything at a grazing angle.
      fresnel = mctx.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
      fresnel.addColorStop(0, 'rgba(0,0,0,0.5)');
      fresnel.addColorStop(0.6, 'rgba(0,0,0,0.7)');
      fresnel.addColorStop(0.9, 'rgba(0,0,0,0.95)');
      fresnel.addColorStop(1, 'rgba(0,0,0,1)');
    };
    size();

    const frame = now => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 30), t = now / 1000;
      last = now;
      const goal = aim(r);
      const dx = pointer.x - s.x, dy = pointer.y - s.y, d = Math.hypot(dx, dy);

      // Hover: a new look every time the cursor lands on it. Now and then it goes shy instead, and poked three
      // times in a few seconds it has had enough: it scowls, shakes and backs off.
      const over = d < r * 1.05;
      if (over && !hovered) {
        pokes.push(now);
        while (pokes.length && now - pokes[0] > 5000) pokes.shift();
        if (pokes.length >= 3 && current !== 'irritated') {
          feel('irritated', 2600);
          pokes.length = 0;
          shakeUntil = now + 520;
          shyFrom = { x: dx / (d || 1), y: dy / (d || 1) };
          s.vx -= shyFrom.x * 420; s.vy -= shyFrom.y * 420;
        } else if (recent.at(-1) !== 'shy' && Math.random() < 0.18) {
          recent.push('shy'); if (recent.length > 4) recent.shift();
          feel('shy', 2200);
          shyFrom = { x: dx / (d || 1), y: dy / (d || 1) };
          s.vx -= shyFrom.x * 700; s.vy -= shyFrom.y * 700; // scoots off
          poke(v, Math.atan2(dy, dx), -1.4);
        } else {
          const next = pick(MOODS, recent);
          recent.push(next); if (recent.length > 4) recent.shift();
          feel(next, 3600);
          poke(v, -Math.PI / 2, 0.45); // a small, unbothered acknowledgement
        }
      }
      hovered = over;
      // Left alone it gets bored: a side-eye, an eye-roll, heavy lids. And once in a long while, a shy moment.
      if (now > nextQuirk) { if (current === 'chill' && !showing) feel(IDLE[Math.floor(Math.random() * IDLE.length)], 1700); nextQuirk = now + 8000 + Math.random() * 7000; }
      if (now > nextShy) { if (current === 'chill' && !showing) { feel('shy', 1700); shyFrom = null; } nextShy = now + 25000 + Math.random() * 20000; }
      if (now > moodUntil && current !== 'chill' && !showing) feel('chill', 0);

      let ax = goal.x, ay = goal.y; // where it is heading, after reacting to the cursor
      if (REDUCED) { s.x = goal.x; s.y = goal.y; } else {
        // Curious about a cursor nearby (leans in), still while being hovered, keeps its distance while shy.
        const pull = (current === 'shy' || current === 'irritated') && shyFrom ? -0.25 : over ? 0 : d < 220 ? 0.12 : 0;
        ax = goal.x + dx * pull; ay = goal.y + dy * pull;
        // Shades on or feeling funky: it bobs to its own beat. Otherwise a slow drift.
        const groove = current === 'cool' || current === 'funky' ? Math.abs(Math.sin(t * 6.2)) * -7 : Math.sin(t * 1.7) * 3;
        chase(s, ax, ay + groove, dt);

        // The screen's edges are walls: the drop dents against them and rebounds.
        const lo = [r + 4, r + 4], hi = [innerWidth - r - 4, innerHeight - r - 4];
        if (s.x < lo[0] || s.x > hi[0]) { poke(v, s.x < lo[0] ? Math.PI : 0, -Math.min(Math.abs(s.vx) / 500, 1.6)); s.x = Math.max(lo[0], Math.min(hi[0], s.x)); s.vx *= -0.35; }
        if (s.y < lo[1] || s.y > hi[1]) { poke(v, s.y < lo[1] ? -Math.PI / 2 : Math.PI / 2, -Math.min(Math.abs(s.vy) / 500, 1.6)); s.y = Math.max(lo[1], Math.min(hi[1], s.y)); s.vy *= -0.35; }

        // The voice makes the surface shiver; a fast scroll makes it slosh; at rest it breathes now and then.
        const loud = voiceLevel();
        if (loud > 0.04) poke(v, Math.random() * Math.PI * 2, loud * 0.9);
        const ds = scrollY - lastScroll;
        if (Math.abs(ds) > 18) poke(v, ds > 0 ? -Math.PI / 2 : Math.PI / 2, Math.min(Math.abs(ds) / 260, 0.9));
        if (now > nextBreath) { poke(v, Math.random() * Math.PI * 2, 0.35); nextBreath = now + 1800 + Math.random() * 2200; }
        ripple(w, v, dt);
      }
      lastScroll = scrollY;

      // Draw: stretched along the way it is travelling, its rim drawn from the rippling surface.
      const st = REDUCED ? 0 : stretch(s.vx, s.vy), a = Math.atan2(s.vy, s.vx);
      const jolt = now < shakeUntil ? Math.sin(now * 0.09) * 4 * ((shakeUntil - now) / 520) : 0; // an irritated shudder
      el.style.transform = wear.current.style.transform = `translate(${(s.x - r + jolt).toFixed(1)}px, ${(s.y - r).toFixed(1)}px) rotate(${a.toFixed(3)}rad) scale(${(1 + st).toFixed(3)}, ${(1 - st * 0.6).toFixed(3)}) rotate(${(-a).toFixed(3)}rad)`;
      const path = blobPath(w.map(x => Math.max(-0.1, Math.min(0.1, x))), r * 0.9, r * 2);
      el.style.clipPath = `path('${path}')`;
      rim.setAttribute('d', path);

      // Reflection: the tree and the petals around the drop, gathered from a wide view and squeezed into the ball
      // the way a glass sphere reflects its whole surroundings, faint at the centre and strong toward the rim.
      const px = mirror.current.width, span = r * 10, tree = document.querySelector('.tree'), petals = document.querySelector('.petals');
      mctx.globalCompositeOperation = 'source-over';
      mctx.clearRect(0, 0, px, px);
      for (const cv of [tree, petals]) {
        if (!cv?.width) continue;
        const q = cv.getBoundingClientRect(), kx = cv.width / q.width, ky = cv.height / q.height;
        mctx.globalAlpha = cv === tree ? Number(tree.style.opacity || 1) : 1; // the tree fades out as the page scrolls
        mctx.drawImage(cv, (s.x - span / 2 - q.left) * kx, (s.y - span / 2 - q.top) * ky, span * kx, span * ky, 0, 0, px, px);
      }
      mctx.globalAlpha = 0.85;
      mctx.globalCompositeOperation = 'lighter'; // glass throws back light brighter than the night around it
      mctx.drawImage(mirror.current, 0, 0);
      mctx.globalAlpha = 1;
      mctx.globalCompositeOperation = 'destination-in';
      mctx.fillStyle = fresnel;
      mctx.fillRect(0, 0, px, px);

      // The eyes: they follow a cursor within reach, look where it is going otherwise, look away when shy, and blink.
      const near = d < 420, shy = current === 'shy';
      const lx = shy ? (shyFrom ? -shyFrom.x : 0.8) * 9 : near ? (dx / Math.max(d, 1)) * Math.min(d / 30, 9) : Math.max(-6, Math.min(6, s.vx / 110));
      const ly = shy ? 6 : near ? (dy / Math.max(d, 1)) * Math.min(d / 30, 7) : Math.max(-5, Math.min(5, s.vy / 130));
      // Eyes sit on a curved surface: looking toward an edge, they slide that way and foreshorten.
      eyes.setAttribute('transform', `translate(${(50 + lx).toFixed(2)} ${(48 + ly).toFixed(2)}) scale(${(1 - Math.abs(lx) / 34).toFixed(3)} ${(1 - Math.abs(ly) / 40).toFixed(3)}) translate(-50 -48)`);
      if (now > nextBlink) { eyes.dataset.blink = ''; setTimeout(() => delete eyes.dataset.blink, 130); nextBlink = now + 2200 + Math.random() * 3800; }

      // Dressed for the part: a storyteller granny in Story Mode, black tie whenever it is speaking, bare otherwise.
      const want = location.pathname === '/story' ? 'granny' : showing || goal.caption ? 'coat' : 'none';
      if (want !== dressed) { dressed = want; setOutfit(want); poke(v, -Math.PI / 2, 0.8); }

      // Say a page's line once the drop has arrived above that page's title.
      const arrived = Math.hypot(ax - s.x, ay - s.y) < 14 && Math.hypot(s.vx, s.vy) < 90;
      if (goal.id && arrived && !SPOKEN.has(goal.id) && content.drop[goal.id]) {
        SPOKEN.add(goal.id);
        showing = goal.id;
        hideAt = now + 6500;
        setLine(content.drop[goal.id]);
        feel('talk', 6500);
        poke(v, -Math.PI / 2, 0.9); // a little hop as it starts to talk
        if (soundStarted()) { preload([keyOf(goal.id)]); speak(keyOf(goal.id)); }
      }
      if (showing && (goal.id !== showing || now > hideAt)) { showing = null; setLine(null); }
      if (showing) {
        const right = s.x + r + 14 + bub.offsetWidth < innerWidth - 12;
        bub.style.transform = `translate(${(right ? s.x + r + 14 : s.x - r - 14 - bub.offsetWidth).toFixed(1)}px, ${(s.y - bub.offsetHeight / 2).toFixed(1)}px)`;
      }
    };

    const onMove = e => { pointer.x = e.clientX; pointer.y = e.clientY; };
    const onLeave = e => { if (!e.relatedTarget) pointer.x = pointer.y = -1e4; };
    // A page change: a splash and a hop, then it heads for the new page's title.
    const off = afterNavigate(() => { for (let i = 0; i < RING; i++) v[i] += (Math.random() - 0.5) * 4; s.vy -= 520; showing = null; setLine(null); feel('surprised', 1000); lastScroll = scrollY; });
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave);
    addEventListener('resize', size);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); off(); removeEventListener('pointermove', onMove); document.removeEventListener('pointerout', onLeave); removeEventListener('resize', size); };
  }, []);

  return (
    <div className="drop" aria-hidden="true">
      <div className="drop-body" ref={body} data-mood={mood}>
        <canvas ref={mirror} className="drop-mirror" />
        <svg ref={svg}>
          <path className="drop-rim" />
          <g>
            <g ref={face} className="drop-face"><g key={mood} className="drop-expr">{FACES[mood]}</g>{outfit === 'granny' && SPECS}</g>
          </g>
        </svg>
      </div>
      <svg ref={wear} className="drop-wear" viewBox="0 0 100 100">
        <defs><clipPath id="drop-round"><circle cx="50" cy="50" r="45" /></clipPath></defs>
        {OUTFITS[outfit] && <g key={outfit} className="wear-in">{OUTFITS[outfit]}</g>}
      </svg>
      <p className="drop-bubble" ref={bubble} data-on={!!line}>{line}</p>
    </div>
  );
}
