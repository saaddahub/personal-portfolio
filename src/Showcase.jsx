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
        if (r.top < h * 4) c.near?.(); // a few screens ahead: time to fetch heavy assets
        if (r.bottom < 0 || r.top > h) continue;
        // Reduced motion shows one composed still per chapter instead of scrubbing.
        const p = reduced ? c.still : clamp(-r.top / (r.height - h));
        if (p !== c.p) { c.p = p; c.render(p); }
        if (!reduced) c.frame?.(p, now);
        // The narrator's current line is the last beat the scroll has passed.
        const b = Math.max(c.beats.findLastIndex(at => at <= p), 0);
        if (b !== c.b) { c.b = b; c.frac = -1; c.captions.forEach((el, i) => { el.dataset.on = i === b; }); }
        const at = c.beats[b], end = c.beats[b + 1] ?? 1;
        const frac = voiceProgress(`${c.id}.${b}`) ?? (reduced ? 1 : seg(p, at, at + (end - at) / 2));
        if (frac !== c.frac) { c.frac = frac; paintCaption(c.captions[b], frac); }
      }
      const key = next && `${next.id}.${next.b}`;
      if (key !== active.current) {
        active.current = key;
        clearTimeout(wait);
        // A short wait so scrolling straight through a line doesn't start and cut it.
        if (key) wait = setTimeout(() => speak(key), 400); else hush();
      }
      const show = root.current.getBoundingClientRect().bottom > h * 0.6;
      if (show !== pill) setShown((pill = show));
    };
    raf = requestAnimationFrame(tick);
    // Leaving Home silences the Showcase: its sound controls live here, so nothing may keep playing elsewhere.
    return () => { cancelAnimationFrame(raf); clearTimeout(wait); hush(); setMuted(true); };
  }, []);

  const turnOn = () => {
    startSound(Object.entries(sc).flatMap(([id, c]) => c.voice.map((_, i) => `${id}.${i}`)));
    setMuted(false); // coming back to Home after the sound was silenced on the way out
    if (active.current) speak(active.current);
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
            <button type="button" className="sound-btn" onClick={() => active.current && speak(active.current, true)}>
              <RotateCcw aria-hidden="true" />
              <span className="sr-only">Replay this line</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Chapter({ id, height, still, render, frame, near, children }) {
  const section = useRef(null);
  useEffect(() => {
    const captions = [...section.current.querySelectorAll('.sc-caption')], beats = sc[id].voice.map(([at]) => at);
    const ch = { id, el: section.current, captions, beats, render, frame, near, still, p: -1, b: -1, frac: -1 };
    chapters.add(ch);
    return () => chapters.delete(ch);
  }, []);
  return (
    <section ref={section} className={`sc sc-${id}`} style={{ '--h': height }} aria-labelledby={`${id}-title`}>
      <div className="sc-stage">
        <h2 id={`${id}-title`} className="sc-kicker">{sc[id].kicker}</h2>
        {children}
        {sc[id].voice.map(([, text], i) => (
          <p key={i} className="sc-caption" data-on={i === 0}>{text.split(' ').map((w, j) => <span key={j}>{w} </span>)}</p>
        ))}
      </div>
    </section>
  );
}

/* 1. Intro: the statement assembles letter by letter. The three accents then gather into points of light that arc
   down, meet beside the last word and write "considered" as they glide through it, and the camera pushes through
   that word into chapter 2. */
const ACCENTS = { interfaces: 'frame', data: 'bars', systems: 'nodes' };
const ACCENT_ART = {
  frame: <path pathLength="1" d="M0 12V0h14M86 0h14v12M100 28v12H86M14 40H0V28" />,
  bars: <path pathLength="1" d="M8 52v-6M20 52v-10M32 52v-4M44 52v-12M56 52v-7M68 52v-14M80 52v-9M92 52v-11" />,
  nodes: <><path pathLength="1" d="M0-6L24-14L48-4L72-16L100-7" /><path className="dots" d="M0-6h.01M24-14h.01M48-4h.01M72-16h.01M100-7h.01" /></>,
};
// Where each accent collapses to, and its light sets off from, in the accent's 100x40 viewBox.
const ACCENT_FROM = { frame: [50, 40], bars: [50, 52], nodes: [48, -4] };
const MEET = 0.6, WRITTEN = 0.76; // the lights meet just before "considered", and have written it by WRITTEN
const gatherAt = (p, i) => seg(p, 0.455 + i * 0.01, 0.5 + i * 0.01) ** 2; // accelerating, like being drawn in
const glideAt = p => 1 - (1 - seg(p, MEET, WRITTEN)) ** 2; // the merged light slowing to rest as it writes
// Shows the stretch [a, b] of a trail path (user units), hidden when it has no length.
const dash = (path, a, b, on) => {
  const show = on && b - a > 0.5;
  path.style.opacity = show ? '' : 0;
  if (show) { path.style.strokeDasharray = `${(b - a).toFixed(1)} 99999`; path.style.strokeDashoffset = (-a).toFixed(1); }
};

function Intro() {
  const box = useRef(null), q = useRef(null);
  const [lineA, lineB] = sc.intro.line.split(/(?<=\.) /);
  const [, lead, word, stop] = lineB.match(/^(.*\s)(\S*?)(\W*)$/);
  const total = lineA.replace(/ /g, '').length;
  let offset = 0;
  const wordsA = lineA.split(' ').map(w => { const at = offset; offset += w.length; return { w, end: offset, at }; });

  // Layout positions (offsets ignore transforms), taken again whenever the viewport or the font changes.
  const measure = c => {
    const el = box.current, hl = c.hl, fs = parseFloat(getComputedStyle(hl).fontSize);
    const x0 = hl.offsetLeft - 0.2 * fs, y = hl.offsetTop + hl.offsetHeight * 0.9, w = hl.offsetWidth + 0.4 * fs;
    el.style.transformOrigin = `${hl.offsetLeft + hl.offsetWidth / 2}px ${hl.offsetTop + hl.offsetHeight / 2}px`;
    c.svg.setAttribute('viewBox', `0 0 ${el.offsetWidth} ${el.offsetHeight}`);
    c.paths = c.accents.map((a, i) => {
      const em = parseFloat(getComputedStyle(a).fontSize), [fx, fy] = ACCENT_FROM[a.dataset.kind];
      const dx = a.offsetLeft - 0.14 * em + (fx / 100) * (a.offsetWidth + 0.28 * em);
      const dy = a.offsetTop - 0.06 * em + (fy / 40) * (a.offsetHeight + 0.12 * em);
      // A thrown arc that lands from the upper left, so the light carries on along the baseline through the word.
      const d = Math.hypot(x0 - dx, y - dy), k = Math.max(0, Math.min(0.35 * d, (x0 + 16) / 0.82));
      const path = `M${dx} ${dy}C${dx + (x0 - dx) * 0.45} ${dy - 0.12 * d} ${x0 - 0.82 * k} ${y - 0.57 * k} ${x0} ${y}H${x0 + w}`;
      c.trails[i].forEach(t => t.setAttribute('d', path));
      return c.trails[i][1].getTotalLength() - w; // length of the flight, before the glide
    });
    Object.assign(c, { fs, w, live: true, risen: false, focus: -1, exit: -1 });
  };

  const render = p => {
    const el = box.current;
    const c = (q.current ??= {
      chars: [...el.querySelectorAll('.c')],
      accents: [...el.querySelectorAll('.accent')],
      lineB: el.querySelector('.intro-b'),
      hl: el.querySelector('.hl'),
      svg: el.querySelector('.intro-trails'),
      trails: [...el.querySelectorAll('.intro-trails g')].map(g => [...g.children]),
      lights: [...el.querySelectorAll('.intro-light')],
    });
    const key = `${innerWidth}x${innerHeight}:${document.fonts.status}`;
    if (c.key !== key) { c.key = key; measure(c); }

    if (p < 0.46 || !c.risen) {
      c.risen = p >= 0.46;
      const n = c.chars.length;
      c.chars.forEach((ch, i) => {
        const t = ease(seg(p, 0.03 + (0.34 * i) / n, 0.11 + (0.34 * i) / n));
        ch.style.transform = t === 1 ? 'none' : `translateY(${(1 - t) * 105}%) rotate(${(1 - t) * 10}deg)`;
      });
    }
    c.accents.forEach((a, i) => {
      const at = +a.dataset.at, g = gatherAt(p, i);
      a.style.setProperty('--draw', ease(seg(p, at, at + 0.1)).toFixed(3));
      a.lastChild.style.transform = g ? `scale(${1 - g})` : '';
    });

    // Line two racks into focus: the blur clears, and the lens breathes a little as it pulls.
    const r = seg(p, 0.49, 0.59), f = r * r * (3 - 2 * r);
    if (f !== c.focus) {
      c.focus = f;
      const s = c.lineB.style;
      s.opacity = ease(seg(p, 0.49, 0.55));
      s.filter = f > 0 && f < 1 ? `blur(${((1 - f) * 10).toFixed(2)}px)` : '';
      s.transform = f < 1 ? `scale(${1 + (1 - f) * 0.04})` : '';
    }

    // Distance light i has travelled along its path: accelerating through the flight, then gliding to rest through the word.
    const glide = glideAt(p);
    const travel = (i, at) => {
      const a = seg(at, 0.5 + i * 0.01, MEET);
      return a < 1 ? a * a * c.paths[i] : c.paths[i] + glideAt(at) * c.w;
    };
    const live = p > 0.45 && p < 0.83;
    if (live || c.live) {
      c.live = live;
      c.hl.style.setProperty('--x', `${(glide * c.w - 0.2 * c.fs).toFixed(1)}px`);
      c.hl.style.setProperty('--heat', (seg(p, MEET, MEET + 0.01) * (1 - seg(p, WRITTEN - 0.01, 0.82))).toFixed(3));
      const flare = Math.max(0, 1 - Math.abs(p - MEET) / 0.02), cool = seg(p, WRITTEN, 0.81), one = seg(p, MEET, MEET + 0.015);
      c.lights.forEach((l, i) => {
        const g = gatherAt(p, i), s = travel(i, p), [tail, head] = c.trails[i], pt = head.getPointAtLength(s);
        // The three add up where they meet, then carry on as one.
        l.style.opacity = live ? (g * (1 - cool) * (i ? 1 - one : 1)).toFixed(3) : 0;
        l.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px) scale(${((0.4 + 0.6 * g) * (1 + 0.35 * flare) * (1 - 0.4 * cool)).toFixed(3)})`;
        // Long-exposure streaks: the path covered over the last stretch of scroll, so they lengthen with speed and vanish at rest.
        dash(tail, travel(i, p - 0.035), s, live);
        dash(head, travel(i, p - 0.007), s, live);
      });
    }

    // The camera pushes through "considered", accelerating and losing focus as the words pass the lens.
    const x = seg(p, 0.84, 1);
    if (x !== c.exit) {
      c.exit = x;
      el.style.transform = x ? `scale(${1 + 3 * x * x})` : '';
      el.style.filter = x ? `blur(${(5 * x * x).toFixed(2)}px)` : '';
      el.style.opacity = x ? 1 - x * x * (3 - 2 * x) : '';
    }
  };

  return (
    <Chapter id="intro" height="300vh" still={0.82} render={render}>
      <div className="intro" ref={box}>
        <p className="sr-only">{sc.intro.line}</p>
        <p className="intro-a" aria-hidden="true">
          {wordsA.map(({ w, end }, i) => {
            const kind = ACCENTS[w.replace(/\W/g, '').toLowerCase()];
            const chars = <span className="w">{[...w].map((ch, j) => <span className="c" key={j}>{ch}</span>)}</span>;
            const [fx, fy] = ACCENT_FROM[kind] ?? [];
            return (
              <Fragment key={i}>
                {kind ? (
                  <span className="accent" data-kind={kind} data-at={0.05 + (0.34 * end) / total}>
                    {chars}
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ transformOrigin: `${fx}% ${fy * 2.5}%` }}>{ACCENT_ART[kind]}</svg>
                  </span>
                ) : chars}{' '}
              </Fragment>
            );
          })}
        </p>
        <p className="intro-b" aria-hidden="true">
          {lead}
          <span className="hl">
            <span className="hl-ink"><span>{word}</span>{stop}</span>
            <span className="hl-hot">{word}{stop}</span>
          </span>
        </p>
        <svg className="intro-trails" aria-hidden="true">
          {Object.keys(ACCENTS).map(k => <g key={k}><path className="tail" /><path className="head" /></g>)}
        </svg>
        {Object.keys(ACCENTS).map(k => <span key={k} className="intro-light" aria-hidden="true" />)}
      </div>
    </Chapter>
  );
}

/* 2. 3D product visuals: Saad's rendered product comes apart frame by frame as you scroll, its layers get
   numbered callouts, then the camera moves in on one side to label the small parts. */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

function Interfaces() {
  const wrap = useRef(null), canvas = useRef(null), lines = useRef(null), labels = useRef(null);
  const q = useRef({ imgs: [], hi: null, want: 0, cur: 0, drawn: -1, size: '', zoom: 0, zoomDrawn: -1 });
  const { product } = sc.interfaces, N = product.frames, STILL = 0.6, Z = product.zoom;
  const callouts = [...product.parts, ...product.details];
  const frameAt = p => Math.round(seg(p, 0.06, 0.5) * (N - 1));

  // Callout positions follow the drawn image: frame pixels (1920x1080) -> CSS pixels on the canvas.
  const place = () => {
    const { S, dx, dy, iw, ih, dpr } = q.current.view, cv = canvas.current, wide = cv.clientWidth >= 760;
    lines.current.setAttribute('viewBox', `0 0 ${cv.clientWidth} ${cv.clientHeight}`);
    callouts.forEach((c, i) => {
      const ax = (dx + (c.x / 1920) * iw * S) / dpr, ay = (dy + (c.y / 1080) * ih * S) / dpr;
      const dir = c.side === 'r' ? 1 : -1, ey = ay + (c.dy || 0), ex = ax + dir * 72;
      const [path, dot] = lines.current.children[i].children;
      path.setAttribute('d', `M${ax} ${ay}L${ax + dir * 28} ${ey}H${ex}`);
      dot.setAttribute('cx', ax);
      dot.setAttribute('cy', ay);
      const li = labels.current.children[i];
      if (wide) { li.style.transform = `translate(${ex + dir * 8}px, ${ey}px)`; return; }
      // Phones: the name sits just above its point, reaching away from the product's centre, kept on screen.
      const tw = li.firstChild.offsetWidth, x = Math.min(Math.max(dir > 0 ? ax - 8 : ax - tw + 8, 6), cv.clientWidth - tw - 6);
      li.style.transform = `translate(${x}px, ${ay + (c.dy || 0) * 0.5}px)`;
    });
  };

  // Draw frame i (or the nearest loaded one), fitted and centred, then moved in on the zoom point.
  const draw = i => {
    const s = q.current, cv = canvas.current;
    let f = -1;
    for (let d = 0; d < N && f < 0; d++) f = s.imgs[i - d] ? i - d : s.imgs[i + d] ? i + d : -1;
    const dpr = Math.min(devicePixelRatio, 2), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (f < 0 || (f === s.drawn && s.size === `${w}x${h}` && s.zoom === s.zoomDrawn)) return;
    if (s.size !== `${w}x${h}`) { cv.width = w; cv.height = h; s.size = `${w}x${h}`; }
    const img = f === N - 1 && s.hi ? s.hi : s.imgs[f], iw = img.naturalWidth, ih = img.naturalHeight;
    const k = Math.min((w / iw) * 1.1, h / ih); // the frames' empty margins may crop a little on narrow screens
    const fx = (Z.x / 1920) * iw, fy = (Z.y / 1080) * ih;
    // The zoom point glides from where it sits to just left of centre, leaving room for the labels on the right.
    const tx = lerp((w - iw * k) / 2 + fx * k, w * (cv.clientWidth >= 760 ? 0.45 : 0.5), s.zoom);
    const ty = lerp((h - ih * k) / 2 + fy * k, h * 0.5, s.zoom);
    // Never magnify past the image's real pixels (0.9 CSS px per image px): beyond that it only gets blurrier.
    // A higher-resolution still raises this ceiling, so the zoom grows by itself when one is supplied.
    const zMax = Math.max(1, Math.min(Z.scale, (0.9 * dpr) / k));
    const S = k * lerp(1, zMax, s.zoom), dx = tx - fx * S, dy = ty - fy * S;
    const g = cv.getContext('2d');
    g.imageSmoothingQuality = 'high'; // the default 'low' turns fine edges and legends jagged when scaling
    g.clearRect(0, 0, w, h);
    g.drawImage(img, dx, dy, iw * S, ih * S);
    s.drawn = f;
    s.zoomDrawn = s.zoom;
    s.view = { S, dx, dy, iw, ih, dpr };
    place();
  };

  // Called once the chapter is a few screens away: every 8th frame first, so a fast scroll always has a near frame, then the rest.
  const near = () => {
    const cv = canvas.current, s = q.current;
    if (s.loading) return;
    s.loading = true;
    const set = cv.clientWidth * Math.min(devicePixelRatio, 2) > 1100 ? 'desktop' : 'mobile';
    const hi = new Image();
    hi.src = product.still;
    hi.decode().then(() => { s.hi = hi; s.drawn = -1; draw(Math.round(s.cur)); }, () => {});
    const order = REDUCED ? [frameAt(STILL)] : [...Array(N).keys()].sort((a, b) => (a % 8 > 0) - (b % 8 > 0));
    for (const i of order) {
      const img = new Image();
      img.src = `${product.path}/${set}/${String(i + 1).padStart(4, '0')}.webp`;
      // decode() first, so drawing never stalls the frame on a decode.
      img.decode().then(() => {
        s.imgs[i] = img;
        const at = Math.round(s.cur);
        if (s.drawn < 0 || Math.abs(i - at) < Math.abs(s.drawn - at)) draw(at);
      }, () => {});
    }
  };

  // Timeline: build up (0-0.5), layer callouts (0.5-0.67), move in (0.66-0.78), detail callouts (0.78-0.95), out.
  const render = p => {
    const s = q.current, enter = ease(seg(p, 0, 0.06)), exit = ease(seg(p, 0.94, 1));
    wrap.current.style.transform = `scale(${lerp(0.86, 1, enter)})`;
    wrap.current.style.opacity = enter * (1 - exit);
    s.want = frameAt(p);
    s.zoom = ease(seg(p, 0.66, 0.78));
    const nParts = product.parts.length;
    callouts.forEach((c, i) => {
      const t = i < nParts
        ? seg(p, 0.51 + i * 0.02, 0.57 + i * 0.02) * (1 - seg(p, 0.63, 0.67))
        : seg(p, 0.78 + (i - nParts) * 0.02, 0.84 + (i - nParts) * 0.02) * (1 - seg(p, 0.92, 0.95));
      const [path, dot] = lines.current.children[i].children;
      path.style.strokeDashoffset = 1 - t;
      dot.style.opacity = t;
      labels.current.children[i].style.opacity = t;
    });
    if (REDUCED) { s.cur = s.want; draw(s.want); }
  };
  // Every animation frame, glide toward the scroll target: smooth even when the scroll position jumps.
  const frame = () => {
    const s = q.current;
    const settled = Math.abs(s.want - s.cur) < 0.02;
    s.cur = settled ? s.want : s.cur + (s.want - s.cur) * 0.35;
    draw(Math.round(s.cur));
  };

  const number = i => String(i < product.parts.length ? i + 1 : i - product.parts.length + 1).padStart(2, '0');
  return (
    <Chapter id="interfaces" height="560vh" still={STILL} render={render} frame={frame} near={near}>
      <div className="seq-wrap" ref={wrap}>
        <canvas className="seq" ref={canvas} role="img" aria-label={product.alt} />
        <svg className="seq-lines" ref={lines} aria-hidden="true">
          {callouts.map((c, i) => <g key={i}><path pathLength="1" /><circle r="3.5" /></g>)}
        </svg>
        <ol className="seq-labels" ref={labels}>
          {callouts.map((c, i) => (
            <li key={i} data-side={c.side}>
              <span className="seq-tag"><span className="seq-num">{number(i)}</span><span className="seq-name">{c.name}</span><span className="seq-note">{c.note}</span></span>
            </li>
          ))}
        </ol>
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
