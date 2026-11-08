import { Fragment, useEffect, useRef, useState } from 'react';
import { Lock, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { content } from './content.js';
import { hush, setMuted, speak, startSound, voiceProgress } from './narrator.js';

// The Showcase: pinned chapters whose scenes are scrubbed by scroll position, narrated and captioned.
const sc = content.showcase;
const clamp = x => Math.min(Math.max(x, 0), 1);
const seg = (p, a, b) => clamp((p - a) / (b - a)); // local 0–1 progress through [a, b]
const ease = t => 1 - (1 - t) ** 4; // close to the site's cubic-bezier(0.16, 1, 0.3, 1)
const lerp = (a, b, t) => a + (b - a) * t;
const chapters = new Set();

function paintCaption(el, frac) {
  const words = el.children, n = words.length;
  for (let i = 0; i < n; i++) words[i].style.opacity = (0.25 + 0.75 * clamp(frac * n - i)).toFixed(3);
}

export default function Showcase() {
  const root = useRef(null), active = useRef(null);
  const [sound, setSound] = useState('off'); // off | on | muted
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, wait = 0, w = innerWidth, h = innerHeight, pill = true;
    const tick = now => {
      raf = requestAnimationFrame(tick);
      if (innerWidth !== w || innerHeight !== h) { w = innerWidth; h = innerHeight; chapters.forEach(c => { c.p = -1; }); }
      let next = null;
      for (const c of chapters) {
        const r = c.el.getBoundingClientRect();
        if (r.top <= h / 2 && r.bottom > h / 2) next = c;
        if (r.bottom < 0 || r.top > h) continue;
        // Reduced motion shows one composed still per chapter instead of scrubbing.
        const p = reduced ? c.still : clamp(-r.top / (r.height - h));
        if (p !== c.p) { c.p = p; c.render(p); }
        if (!reduced) c.frame?.(p, now);
        if (!c.caption) continue;
        const frac = voiceProgress(c.id) ?? (reduced ? 1 : seg(p, 0.04, 0.5));
        if (frac !== c.frac) { c.frac = frac; paintCaption(c.caption, frac); }
      }
      if (next !== active.current) {
        active.current = next;
        clearTimeout(wait);
        // A short wait so scrolling straight through a chapter doesn't start and cut its line.
        if (next) wait = setTimeout(() => speak(next.id), 400); else hush();
      }
      const show = root.current.getBoundingClientRect().bottom > h * 0.6;
      if (show !== pill) setShown((pill = show));
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(wait); };
  }, []);

  const turnOn = () => {
    startSound(Object.keys(sc));
    if (active.current) speak(active.current.id);
    setSound('on');
  };
  const toggleMute = () => {
    setMuted(sound === 'on');
    setSound(sound === 'on' ? 'muted' : 'on');
  };

  return (
    <div className="showcase" ref={root}>
      <Intro />
      <Interfaces />
      <Dashboards />
      <Backend />
      <Security />
      <div className="sound" data-shown={shown} {...(!shown && { inert: '' })}>
        {sound === 'off' ? (
          <button type="button" className="sound-btn" onClick={turnOn}><Volume2 aria-hidden="true" />Sound on</button>
        ) : (
          <>
            <button type="button" className="sound-btn" aria-pressed={sound === 'muted'} onClick={toggleMute}>
              {sound === 'muted' ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              <span className="sr-only">Mute narration</span>
            </button>
            <button type="button" className="sound-btn" onClick={() => active.current && speak(active.current.id, true)}>
              <RotateCcw aria-hidden="true" />
              <span className="sr-only">Replay this line</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Chapter({ id, height, still, render, frame, caption = true, children }) {
  const section = useRef(null), captionEl = useRef(null);
  useEffect(() => {
    const ch = { id, el: section.current, caption: captionEl.current, render, frame, still, p: -1, frac: -1 };
    chapters.add(ch);
    return () => chapters.delete(ch);
  }, []);
  return (
    <section ref={section} className={`sc sc-${id}`} style={{ '--h': height }} aria-labelledby={`${id}-title`}>
      <div className="sc-stage">
        <h2 id={`${id}-title`} className="sc-kicker">{sc[id].kicker}</h2>
        {children}
        {caption && <p ref={captionEl} className="sc-caption">{sc[id].line.split(' ').map((w, i) => <span key={i}>{w} </span>)}</p>}
      </div>
    </section>
  );
}

/* 1. Intro: the statement assembles letter by letter, then flies through the camera. */
const ACCENTS = { interfaces: 'frame', data: 'bars', systems: 'nodes' };
const ACCENT_ART = {
  frame: <path pathLength="1" d="M0 12V0h14M86 0h14v12M100 28v12H86M14 40H0V28" />,
  bars: <path pathLength="1" d="M8 52v-6M20 52v-10M32 52v-4M44 52v-12M56 52v-7M68 52v-14M80 52v-9M92 52v-11" />,
  nodes: <><path pathLength="1" d="M0-6L24-14L48-4L72-16L100-7" /><path className="dots" d="M0-6h.01M24-14h.01M48-4h.01M72-16h.01M100-7h.01" /></>,
};

function Intro() {
  const box = useRef(null), spark = useRef(null), q = useRef(null);
  const [lineA, lineB] = sc.intro.line.split(/(?<=\.) /);
  const total = lineA.replace(/ /g, '').length;
  let offset = 0;
  const wordsA = lineA.split(' ').map(w => { const at = offset; offset += w.length; return { w, end: offset, at }; });

  const render = p => {
    const el = box.current;
    const c = (q.current ??= {
      chars: [...el.querySelectorAll('.c')],
      accents: [...el.querySelectorAll('.accent')],
      words: [...el.querySelectorAll('.intro-b span')],
    });
    const n = c.chars.length;
    c.chars.forEach((ch, i) => {
      const t = ease(seg(p, 0.03 + (0.34 * i) / n, 0.11 + (0.34 * i) / n));
      ch.style.transform = t === 1 ? 'none' : `translateY(${(1 - t) * 105}%) rotate(${(1 - t) * 10}deg)`;
    });
    const merge = ease(seg(p, 0.46, 0.58));
    c.accents.forEach(a => { const at = +a.dataset.at; a.style.setProperty('--draw', (ease(seg(p, at, at + 0.1)) * (1 - merge)).toFixed(3)); });
    c.words.forEach((w, i) => {
      const t = ease(seg(p, 0.56 + i * 0.03, 0.66 + i * 0.03));
      w.style.opacity = t;
      w.style.transform = `translateY(${(1 - t) * 0.6}em)`;
    });
    c.words.at(-1).style.backgroundSize = `${ease(seg(p, 0.74, 0.84)) * 100}% 0.1em`;
    const exit = ease(seg(p, 0.84, 1));
    el.style.transform = `scale(${1 + exit * 2.2})`;
    el.style.opacity = 1 - exit;
    // The accents gather into a point of light, which steps aside for the second line and returns to lead into chapter 2.
    spark.current.style.transform = `scale(${merge * (1 - ease(seg(p, 0.58, 0.66))) + exit * 9})`;
    spark.current.style.opacity = 1 - seg(p, 0.92, 1);
  };

  return (
    <Chapter id="intro" height="300vh" still={0.82} render={render} caption={false}>
      <div className="intro" ref={box}>
        <p className="sr-only">{sc.intro.line}</p>
        <p className="intro-a" aria-hidden="true">
          {wordsA.map(({ w, end }, i) => {
            const kind = ACCENTS[w.replace(/\W/g, '').toLowerCase()];
            const chars = <span className="w">{[...w].map((ch, j) => <span className="c" key={j}>{ch}</span>)}</span>;
            return (
              <Fragment key={i}>
                {kind ? (
                  <span className="accent" data-at={0.05 + (0.34 * end) / total}>
                    {chars}
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none">{ACCENT_ART[kind]}</svg>
                  </span>
                ) : chars}{' '}
              </Fragment>
            );
          })}
        </p>
        <p className="intro-b" aria-hidden="true">
          {lineB.split(' ').map((w, i, all) => <Fragment key={i}><span className={i === all.length - 1 ? 'hl' : undefined}>{w}</span>{' '}</Fragment>)}
        </p>
      </div>
      <span className="intro-spark" ref={spark} aria-hidden="true" />
    </Chapter>
  );
}

/* 2. 3D product visuals: a device explodes into labelled layers, reassembles, and the camera dives into its screen.
   The plates stand in for Saad's 3D product frame sequence until it arrives. */
const KINDS = ['chassis', 'battery', 'board', 'display', 'glass']; // matches sc.interfaces.layers, bottom to top
const PLATE_ART = {
  chassis: <span className="keys" />,
  battery: <span className="cells">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</span>,
  board: (
    <svg viewBox="0 0 160 100" preserveAspectRatio="none">
      <g fill="none" stroke="currentColor" strokeWidth="0.8">
        <path d="M8 20H50V40H78M8 50H40V72H90V64M152 14H122V36H102M152 82H116V58H102M60 92V76H80M30 8V20M130 92V82" />
      </g>
      <rect x="78" y="30" width="24" height="34" rx="2" fill="currentColor" opacity="0.45" />
      <rect x="18" y="78" width="16" height="10" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="120" y="44" width="12" height="8" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  display: <span className="screen" />,
  glass: null,
};

function Interfaces() {
  const scene = useRef(null), q = useRef(null);
  const { layers } = sc.interfaces;

  const render = p => {
    const el = scene.current;
    const c = (q.current ??= {
      dev: el.querySelector('.dev'),
      plates: [...el.querySelectorAll('.plate')],
      pins: [...el.querySelectorAll('.plate-pin')],
      labels: [...el.querySelectorAll('.dev-labels li')].reverse(),
      list: el.querySelector('.dev-labels'),
      svg: el.querySelector('.dev-leaders'),
      leaders: [...el.querySelectorAll('.dev-leaders path')],
    });
    const tilt = ease(seg(p, 0.02, 0.22)) * (1 - ease(seg(p, 0.66, 0.84)));
    const spread = ease(seg(p, 0.12, 0.5)) * (1 - ease(seg(p, 0.64, 0.82)));
    const zoom = ease(seg(p, 0.86, 1));
    const gap = Math.min(innerWidth * 0.11, 96);
    c.dev.style.transform = `scale(${1 + zoom * 2.6}) rotateX(${tilt * 56}deg) rotateZ(${tilt * -36}deg)`;
    c.plates.forEach((pl, i) => { pl.style.transform = `translateZ(${i * 2 + (i - 2) * gap * spread}px)`; });
    el.style.opacity = 1 - seg(p, 0.94, 1);

    // Read every position first, then write, so the browser lays out once per frame.
    const wide = innerWidth >= 760, box = el.getBoundingClientRect();
    const left = c.list.getBoundingClientRect().left - box.left;
    const rects = wide ? c.labels.map((li, i) => [c.pins[i].getBoundingClientRect(), li.getBoundingClientRect()]) : [];
    if (wide) c.svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    c.labels.forEach((li, i) => {
      const t = seg(spread, 0.4 + i * 0.1, 0.6 + i * 0.1);
      li.style.opacity = t;
      li.style.transform = `translateX(${(1 - t) * 1.5}rem)`;
      if (!wide) return;
      const [a, b] = rects[i];
      const x1 = a.left - box.left, y1 = a.top - box.top, x2 = left - 14, y2 = b.top + b.height / 2 - box.top;
      c.leaders[i].setAttribute('d', `M${x1} ${y1}L${x2 - 36} ${y2}H${x2}`);
      c.leaders[i].style.strokeDashoffset = 1 - t;
    });
  };

  return (
    <Chapter id="interfaces" height="400vh" still={0.58} render={render}>
      <div className="dev-scene" ref={scene}>
        <div className="dev-view">
          <div className="dev">
            {layers.map((l, i) => <div key={l.part} className={`plate plate-${KINDS[i]}`}>{PLATE_ART[KINDS[i]]}<span className="plate-pin" /></div>)}
          </div>
        </div>
        <ol className="dev-labels">
          {[...layers].reverse().map(l => <li key={l.part}><span className="part">{l.part}</span><span className="label">{l.label}</span></li>)}
        </ol>
        <svg className="dev-leaders" aria-hidden="true">{layers.map(l => <path key={l.part} pathLength="1" />)}</svg>
      </div>
    </Chapter>
  );
}

/* 3. Dashboards: a deep 3D stack; each board comes forward, reveals, and flies off. The last folds into a wire. */
function Dashboards() {
  const stack = useRef(null), q = useRef(null);
  const { boards } = sc.dashboards, N = boards.length;

  const render = p => {
    const c = (q.current ??= { cards: [...stack.current.children] });
    const arrive = ease(seg(p, 0, 0.12)), fold = ease(seg(p, 0.8, 0.95));
    // Opacity stays on the cards: on the stack it would flatten the 3D and break their depth order.
    const fade = arrive * (1 - seg(p, 0.95, 1));
    stack.current.style.transform = `scale(${lerp(1.35, 1, arrive)}) scaleY(${1 - fold * 0.99})`;
    c.cards.forEach((card, i) => {
      let u = ((p - 0.12) / 0.66) * N - i;
      if (i === N - 1) u = Math.min(u, 0.7); // the last board stays to be folded
      const depth = Math.min(Math.max(-u, 0), 3), leave = ease(seg(u, 0.7, 1.15));
      card.style.transform = `translate3d(0, ${-depth * 7 - leave * 120}%, ${-depth * 140 + leave * 80}px) rotateX(${Math.min(depth, 1) * 22 - leave * 35}deg)`;
      card.style.opacity = fade * (1 - depth / 3.2) * (1 - seg(u, 0.72, 0.95)); // gone before the next board settles
      card.style.setProperty('--reveal', ease(seg(u, -0.1, 0.5)).toFixed(3));
    });
  };

  return (
    <Chapter id="dashboards" height="360vh" still={0.2} render={render}>
      <div className="boards">
        <div className="board-stack" ref={stack}>
          {boards.map((b, i) => (
            <article className="board-card" key={i}>
              <header><h3>{b.title}</h3><p>{b.note}</p></header>
              {b.image ? <img src={b.image} alt={`${b.title} dashboard`} loading="lazy" /> : (
                <div className="skel" aria-hidden="true">
                  <div className="skel-kpis"><span /><span /><span /></div>
                  <svg className="skel-line" viewBox="0 0 300 100" preserveAspectRatio="none"><path pathLength="1" d="M0 80C40 70 60 30 100 40S160 85 200 50S260 20 300 30" /></svg>
                  <div className="skel-bars">{Array.from({ length: 12 }, (_, j) => <span key={j} style={{ '--i': j, '--h': `${30 + ((j * 37) % 60)}%` }} />)}</div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </Chapter>
  );
}

/* 4. Backend: an edit in the admin travels through the system and lands on the live site. */
function Backend() {
  const root = useRef(null), q = useRef(null);
  const { field, from, to, stages } = sc.backend, N = stages.length;
  const step = 600 / N, xs = stages.map((_, i) => (i + 0.5) * step);
  // Identical S-curves between evenly spaced nodes, so node i sits at exactly i/(N-1) of the path length.
  const d = xs.slice(1).reduce((acc, x, i) => `${acc}C${xs[i] + step / 2} 12 ${xs[i] + step / 2} 68 ${x} 40`, `M${xs[0]} 40`);

  const render = p => {
    const el = root.current;
    const c = (q.current ??= {
      admin: el.querySelector('.be-admin'), site: el.querySelector('.be-site'),
      input: el.querySelector('.be-value'), save: el.querySelector('.be-save'),
      track: el.querySelector('.be-track'), trail: el.querySelector('.be-trail'), packet: el.querySelector('.be-packet'),
      nodes: [...el.querySelectorAll('.be-node')], labels: [...el.querySelectorAll('.be-stages li')],
      note: el.querySelector('.be-note'), heads: el.querySelectorAll('.be-head span'),
    });
    c.len ??= c.track.getTotalLength();
    const enter = ease(seg(p, 0, 0.12)), leave = ease(seg(p, 0.9, 1));
    c.admin.style.transform = `translateX(${(1 - enter) * -40}%)`;
    c.site.style.transform = `translateX(${(1 - enter) * 40}%)`;
    c.admin.style.opacity = c.site.style.opacity = enter;
    el.style.transform = `scale(${1 - leave * 0.1})`;
    el.style.opacity = 1 - leave;

    const ty = seg(p, 0.12, 0.32);
    const text = ty < 0.4 ? from.slice(0, Math.round(from.length * (1 - ty / 0.4))) : to.slice(0, Math.round((to.length * (ty - 0.4)) / 0.6));
    if (c.input.textContent !== text) c.input.textContent = text;
    const saved = p >= 0.36;
    c.save.dataset.state = saved ? 'saved' : p >= 0.32 ? 'pressed' : '';
    c.save.textContent = saved ? 'Saved' : 'Save';

    const t = seg(p, 0.37, 0.76), pt = c.track.getPointAtLength(t * c.len);
    c.packet.setAttribute('cx', pt.x);
    c.packet.setAttribute('cy', pt.y);
    c.packet.style.opacity = t > 0 && t < 1 ? 1 : 0;
    c.trail.style.strokeDashoffset = 1 - t;
    let stage = -1;
    c.nodes.forEach((node, i) => {
      const lit = t > 0 && t >= i / (N - 1) - 1e-6;
      node.dataset.lit = c.labels[i].dataset.lit = lit;
      if (lit) stage = i;
    });
    const note = stage < 0 ? '' : stages[stage][1];
    if (c.note.textContent !== note) c.note.textContent = note;

    const m = ease(seg(p, 0.76, 0.86));
    c.heads[0].style.opacity = 1 - m;
    c.heads[0].style.transform = `translateY(${-m * 0.5}em)`;
    c.heads[1].style.opacity = m;
    c.heads[1].style.transform = `translateY(${(1 - m) * 0.5}em)`;
    c.site.dataset.flash = m > 0 && m < 1;
  };

  return (
    <Chapter id="backend" height="320vh" still={0.88} render={render}>
      <div className="be" ref={root}>
        <div className="be-panel be-admin">
          <div className="be-bar" aria-hidden="true"><i /><i /><i /><span>Admin</span></div>
          <div className="be-body">
            <span className="be-label">{field}</span>
            <span className="be-input"><span className="be-value">{from}</span></span>
            <span className="be-save">Save</span>
          </div>
        </div>
        <div className="be-pipe" aria-hidden="true">
          <svg viewBox="0 0 600 80">
            <path className="be-track" d={d} />
            <path className="be-trail" d={d} pathLength="1" />
            {xs.map(x => <circle key={x} className="be-node" cx={x} cy="40" r="9" />)}
            <circle className="be-packet" r="6" cx={xs[0]} cy="40" />
          </svg>
          <ol className="be-stages" style={{ '--n': N }}>{stages.map(([name]) => <li key={name}>{name}</li>)}</ol>
        </div>
        <p className="be-note" />
        <div className="be-panel be-site">
          <div className="be-bar" aria-hidden="true"><i /><i /><i /><span>saadsalam.dev</span></div>
          <div className="be-body"><p className="be-head"><span>{from}</span><span>{to}</span></p></div>
        </div>
      </div>
    </Chapter>
  );
}

/* 5. Security: rings lock into place, then hold against a stream of requests; each threat stops at its layer. */
const RADII = sc.security.layers.map((_, i) => 180 - i * 28);
const CORE = 40;

function Security() {
  const canvas = useRef(null), rings = useRef(null), legend = useRef(null), lock = useRef(null), q = useRef(null);
  const { layers } = sc.security, N = layers.length;
  const sim = useRef({ parts: [], shocks: [], texts: [], heat: layers.map(() => 0), spawn: 0, last: 0, lastText: 0 });

  const render = p => {
    const c = (q.current ??= { rings: [...rings.current.querySelectorAll('.ring')], items: [...legend.current.children] });
    const collapse = ease(seg(p, 0.88, 0.98));
    c.rings.forEach((g, i) => {
      const drawn = ease(seg(p, 0.02 + i * 0.025, 0.12 + i * 0.025)), shut = ease(seg(p, 0.7 + i * 0.035, 0.8 + i * 0.035));
      g.lastChild.style.strokeDasharray = `${drawn * (0.86 + 0.14 * shut)} 1`;
      g.firstChild.style.opacity = drawn;
      g.style.transform = `rotate(${(1 - drawn) * -120 + shut * (i % 2 ? 150 : -150)}deg)`;
      c.items[i].style.opacity = drawn * (1 - collapse);
    });
    rings.current.style.transform = `scale(${1 - collapse * 0.8})`;
    rings.current.style.opacity = 1 - collapse;
    lock.current.style.opacity = collapse;
    lock.current.style.transform = `scale(${0.6 + 0.4 * collapse})`;
  };

  const frame = (p, now) => {
    const s = sim.current, cv = canvas.current, g = cv.getContext('2d');
    const dt = Math.min((now - (s.last || now)) / 1000, 0.05);
    s.last = now;
    const dpr = Math.min(devicePixelRatio, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const cr = cv.getBoundingClientRect(), rr = rings.current.getBoundingClientRect();
    const cx = rr.left + rr.width / 2 - cr.left, cy = rr.top + rr.height / 2 - cr.top, k = rr.width / 400;

    // Pressure builds with scroll; scrolling back calms the stream.
    const pressure = seg(p, 0.15, 0.6);
    s.spawn += pressure * (1 - seg(p, 0.66, 0.72)) * 50 * dt;
    const far = Math.hypot(w, h) / 2 + 20;
    for (; s.spawn >= 1; s.spawn--) {
      const bad = Math.random() < 0.65;
      s.parts.push({ a: Math.random() * Math.PI * 2, d: far, v: (110 + 170 * pressure) * (0.75 + Math.random() * 0.5), bad, ring: bad ? Math.floor(Math.random() * N) : -1 });
    }
    g.lineWidth = 1.5;
    for (let i = s.parts.length - 1; i >= 0; i--) {
      const pt = s.parts[i];
      pt.d -= pt.v * dt;
      const cos = Math.cos(pt.a), sin = Math.sin(pt.a), x = cx + cos * pt.d, y = cy + sin * pt.d;
      if (pt.d <= (pt.bad ? RADII[pt.ring] + 3 : CORE) * k) {
        s.parts.splice(i, 1);
        if (!pt.bad) continue;
        s.heat[pt.ring] = 1;
        s.shocks.push({ r: RADII[pt.ring] * k, life: 1 });
        if (now - s.lastText > 260) { s.lastText = now; s.texts.push({ x: x + cos * 16, y: y + sin * 16, text: layers[pt.ring][1], life: 1 }); }
        continue;
      }
      g.strokeStyle = g.fillStyle = pt.bad ? '#d9577e' : '#f4ede9';
      g.globalAlpha = 0.9;
      g.beginPath();
      g.moveTo(cx + cos * (pt.d + 18), cy + sin * (pt.d + 18));
      g.lineTo(x, y);
      g.stroke();
      g.beginPath();
      g.arc(x, y, pt.bad ? 2.4 : 1.8, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = '#f5a9c2';
    g.lineWidth = 2;
    s.shocks = s.shocks.filter(sh => {
      sh.life -= dt * 2.2;
      g.globalAlpha = Math.max(sh.life, 0) * 0.5;
      g.beginPath();
      g.arc(cx, cy, sh.r + (1 - sh.life) * 16 * k, 0, Math.PI * 2);
      g.stroke();
      return sh.life > 0;
    });
    g.font = '500 12px "Bricolage Grotesque", system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillStyle = '#ffdbe6';
    s.texts = s.texts.filter(tx => {
      tx.life -= dt * 1.2;
      g.globalAlpha = Math.max(tx.life, 0);
      g.fillText(tx.text, Math.min(Math.max(tx.x, 64), w - 64), tx.y);
      return tx.life > 0;
    });
    g.globalAlpha = 1;
    s.heat.forEach((heat, i) => {
      s.heat[i] = heat * Math.exp(-dt * 6);
      q.current.rings[i].style.setProperty('--heat', s.heat[i].toFixed(2));
      q.current.items[i].style.setProperty('--heat', s.heat[i].toFixed(2));
    });
  };

  return (
    <Chapter id="security" height="360vh" still={0.65} render={render} frame={frame}>
      <div className="sec">
        <canvas className="sec-canvas" ref={canvas} aria-hidden="true" />
        <div className="sec-view">
          <svg className="sec-rings" viewBox="-200 -200 400 400" ref={rings} aria-hidden="true">
            {layers.map(([name], i) => (
              <g key={name} className="ring">
                <circle className="ring-ticks" r={RADII[i] + 7} />
                <circle className="ring-line" r={RADII[i]} pathLength="1" />
              </g>
            ))}
            <circle className="sec-core" r={CORE} />
            <text className="sec-core-label" y="4" textAnchor="middle">Your data</text>
          </svg>
          <span className="sec-lock" ref={lock} aria-hidden="true"><Lock /></span>
        </div>
        <ul className="sec-legend" ref={legend}>
          {layers.map(([name, threat]) => <li key={name}><strong>{name}</strong><span>Stops: {threat}</span></li>)}
        </ul>
      </div>
    </Chapter>
  );
}
