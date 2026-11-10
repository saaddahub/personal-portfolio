import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Captions, CaptionsOff, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { hush, preload, setMuted, soundStarted, speak, voiceProgress } from '../narrator.js';
import { REDUCED, clamp, seg } from './motion.js';
import { keyOf, keysOf, wake } from './voice.js';

/* The chapter contract, shared by every mode module (src/story/tour, src/story/mine):

   export default { id: 'tour' | 'mine', title, blurb, chapters: [Chapter, …] }
   Chapter: { id, kicker, title, height: '260vh', still: 0.6, voice: [[0.04, 'line'], [0.5, 'line']], Scene }

   Scene receives { onProgress }. Inside a useEffect it calls `const off = onProgress((p, now) => { … })` and returns
   off. The shell calls every subscriber each animation frame while the chapter is within about one viewport of the
   screen, with p = 0–1 progress through the chapter's sticky track. Under reduced motion p is fixed at
   chapter.still and delivered once. Scene renders inside a full-viewport sticky stage (100svh, overflow hidden) and
   should fill it. Voice beats light the captions and play `${mode.id}-${chapter.id}.${n}` through the narrator. */

const root = document.documentElement;

function paintCaption(el, frac) {
  const words = el.children, n = words.length;
  for (let i = 0; i < n; i++) words[i].style.opacity = (0.25 + 0.75 * clamp(frac * n - i)).toFixed(3);
}

export default function Player({ mode, other, sound, setSound, go }) {
  const box = useRef(null), hero = useRef(null), segs = useRef(null);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  // What the frame loop needs from React, read live rather than re-subscribing every render.
  const live = useRef({ jumpUntil: 0 });
  Object.assign(live.current, { sound, playing, active });

  const rt = useMemo(() => mode.chapters.map(ch => {
    const c = { ch, beats: ch.voice.map(([at]) => at), subs: new Set(), sp: -1, b: -1, frac: -1, top: 0, len: 1, el: null, captions: [] };
    c.on = fn => {
      c.subs.add(fn);
      if (REDUCED) queueMicrotask(() => c.subs.has(fn) && fn(ch.still, performance.now()));
      return () => c.subs.delete(fn);
    };
    return c;
  }), [mode]);

  const togglePlay = () => setPlaying(v => !v);
  const toggleSound = () => { if (!sound) wake(mode); setSound(!sound); };
  const jumpTo = i => {
    live.current.jumpUntil = performance.now() + 1100; // autoplay waits while the page glides there
    scrollTo({ top: i < 0 ? 0 : rt[i].top + 1, behavior: REDUCED ? 'auto' : 'smooth' });
  };
  // Previous goes to the start of this chapter first, like any player, then to the one before.
  const jump = dir => {
    const i = live.current.active, c = rt[i];
    const to = dir > 0 ? i + 1 : c && c.sp > 0.08 ? i : i - 1;
    if (to < rt.length) jumpTo(Math.max(to, -1));
  };
  const begin = () => (REDUCED ? jumpTo(0) : setPlaying(true));

  useEffect(() => {
    if (sound) {
      if (soundStarted()) { preload(keysOf(mode)); setMuted(false); } else wake(mode);
      live.current.key = undefined; // speak the current line again
    } else { hush(); setMuted(true); }
  }, [sound, mode]);

  // Arriving through the mode transition, the sheet's contents rise in after it has grown into place.
  useEffect(() => {
    if (REDUCED || !root.dataset.storyVt) return;
    const a = animate(hero.current.parentNode.querySelectorAll('[data-rise]'), {
      opacity: [0, 1], translateY: ['1.25rem', '0rem'], filter: ['blur(10px)', 'blur(0px)'],
      delay: stagger(70, { start: 320 }), duration: 1100, ease: 'outExpo',
    });
    return () => a.revert();
  }, []);

  useEffect(() => {
    let raf = 0, wait = 0, act = -2, last = performance.now(), pos = -1, vel = 0, heroAt = -1;
    const L = live.current, bars = segs.current.children;
    const measure = () => {
      const y = scrollY;
      rt.forEach(c => { const r = c.el.getBoundingClientRect(); c.top = r.top + y; c.len = r.height; });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box.current);

    const tick = now => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05), h = innerHeight;
      last = now;
      let y = scrollY;

      // Autoplay: the page scrolls itself, about six seconds a line, and waits at the next beat while the
      // narrator is still talking. It eases in and out like a camera dolly rather than starting at full speed.
      if (L.playing && now > L.jumpUntil) {
        if (pos < 0) pos = y;
        const c = rt[L.active];
        let target = h * 0.9;
        if (c) {
          target = Math.max(c.len - h, 1) / Math.max(c.beats.length * 6.5, 10);
          const nb = c.beats[c.b + 1], vp = voiceProgress(keyOf(mode, c.ch, c.b));
          if (L.sound && nb !== undefined && c.sp >= nb - 0.004 && vp !== null && vp < 1) target = 0;
        }
        vel += (target - vel) * (1 - Math.exp(-dt * 2.5));
        pos += vel * dt;
        const max = root.scrollHeight - h;
        if (pos >= max - 1) { pos = max; setPlaying(false); }
        scrollTo(0, pos);
        y = pos;
      } else { pos = -1; vel = 0; }

      // The opening sheet recedes and softens as the first chapter comes up under it.
      const hp = REDUCED ? 0 : clamp(y / h);
      if (hp !== heroAt) {
        heroAt = hp;
        const s = hero.current.style;
        s.transform = hp ? `translateY(${(hp * -6).toFixed(2)}%) scale(${(1 - hp * 0.08).toFixed(4)})` : '';
        s.opacity = hp ? (1 - hp * 0.9).toFixed(3) : '';
      }

      let next = -1;
      for (let i = 0; i < rt.length; i++) {
        const c = rt[i], top = c.top - y, sp = clamp(-top / Math.max(c.len - h, 1));
        if (top <= h * 0.5 && top + c.len > h * 0.5) next = i;
        if (sp !== c.sp) { c.sp = sp; bars[i].style.setProperty('--p', sp.toFixed(4)); }
        if (top + c.len < -h || top > 2 * h) continue;
        const p = REDUCED ? c.ch.still : sp;
        if (!REDUCED) c.subs.forEach(fn => fn(p, now));

        // The current line is the last beat passed; under reduced motion every caption shows and the
        // narrator reads them in order instead.
        let b = REDUCED ? c.beats.findIndex((_, j) => voiceProgress(keyOf(mode, c.ch, j)) !== 1) : Math.max(c.beats.findLastIndex(at => at <= p), 0);
        if (b < 0) b = c.beats.length - 1;
        if (b !== c.b) { c.b = b; c.frac = -1; c.captions.forEach((el, j) => { el.dataset.on = REDUCED || j === b; }); }
        if (REDUCED) continue;
        const at = c.beats[b], end = c.beats[b + 1] ?? 1;
        const frac = voiceProgress(keyOf(mode, c.ch, b)) ?? seg(p, at, at + (end - at) / 2);
        if (frac !== c.frac) { c.frac = frac; paintCaption(c.captions[b], frac); }
      }

      if (next !== act) {
        act = next;
        rt.forEach((c, i) => c.el.toggleAttribute('data-active', i === next));
        // While a chapter plays the nav steps aside (nav.css); it returns on hover or focus.
        if (next >= 0) root.dataset.immersive = ''; else delete root.dataset.immersive;
        setActive(next);
      }
      const key = next >= 0 ? keyOf(mode, rt[next].ch, rt[next].b) : null;
      if (key !== L.key) {
        L.key = key;
        clearTimeout(wait);
        // A short wait, so scrolling straight through a line doesn't start and cut it.
        if (key && L.sound) wait = setTimeout(() => speak(key), 400); else hush();
      }
    };
    raf = requestAnimationFrame(tick);

    // Any hand on the scroll takes it back from autoplay.
    const takeBack = () => { if (L.playing) setPlaying(false); };
    const onKey = e => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === ' ') {
        if (REDUCED || t.closest('button, a, summary, [role="button"]')) return;
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        jump(e.key === 'ArrowRight' ? 1 : -1);
      } else if (e.key === 'm' || e.key === 'M') {
        document.querySelector('.tp-sound')?.click(); // the same path as pressing the button, so audio may start
      } else if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End)$/.test(e.key)) takeBack();
    };
    addEventListener('wheel', takeBack, { passive: true });
    addEventListener('touchstart', takeBack, { passive: true });
    addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wait);
      ro.disconnect();
      removeEventListener('wheel', takeBack);
      removeEventListener('touchstart', takeBack);
      removeEventListener('keydown', onKey);
      delete root.dataset.immersive;
      hush();
      setMuted(true); // nothing keeps talking once Story Mode is left, as on Home
    };
  }, [rt]);

  const chapters = useMemo(() => rt.map(c => <Chapter key={c.ch.id} c={c} modeId={mode.id} />), [rt]);
  const cur = rt[active];
  return (
    <div className="player" ref={box} data-captions={captions ? 'on' : 'off'}>
      <section className="mode-hero wrap" aria-labelledby={`${mode.id}-title`}>
        <div className="mode-sheet glass story-sheet" ref={hero}>
          <div className="mode-intro">
            <h1 id={`${mode.id}-title`} className="page-title mode-title" tabIndex={-1}>{mode.title}</h1>
            <p className="mode-lead" data-rise>{mode.blurb}</p>
            <div className="mode-actions" data-rise>
              <button type="button" className="story-btn" onClick={begin}><Play aria-hidden="true" />Begin</button>
              <button type="button" className="story-link" onClick={() => go({ id: mode.id, read: true })}>Read instead</button>
            </div>
            <p className="mode-hint" data-rise>{REDUCED ? 'Scroll at your own pace.' : 'Or scroll at your own pace.'} Captions stay on screen; the arrow keys move between chapters.</p>
          </div>
          <nav className="toc" aria-label="Chapters" data-rise>
            <ol>
              {rt.map((c, i) => (
                <li key={c.ch.id}>
                  <button type="button" onClick={() => jumpTo(i)}>
                    <span className="toc-kicker">{c.ch.kicker}</span>
                    <span className="toc-title">{c.ch.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="mode-crumbs" data-rise>
          <button type="button" className="story-link" onClick={() => go({ id: null })}><ArrowLeft aria-hidden="true" />The story so far</button>
          {other && <button type="button" className="story-link" onClick={() => go({ id: other.id, read: false })}>Switch to {other.title}<ArrowRight aria-hidden="true" /></button>}
        </div>
      </section>

      {chapters}

      <nav className="mode-end wrap" aria-label="After the story">
        <div className="mode-crumbs">
          <button type="button" className="story-link" onClick={() => go({ id: null })}><ArrowLeft aria-hidden="true" />The story so far</button>
          {other && <button type="button" className="story-link" onClick={() => go({ id: other.id, read: false })}>Now try {other.title}<ArrowRight aria-hidden="true" /></button>}
        </div>
      </nav>

      <div className="tp" role="group" aria-label="Story controls" data-shown={active >= 0} {...(active < 0 && { inert: '' })}>
        {!REDUCED && (
          <button type="button" className="tp-btn" aria-pressed={playing} aria-keyshortcuts="Space" title="Play (Space)" onClick={togglePlay}>
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}<span className="sr-only">Play</span>
          </button>
        )}
        <button type="button" className="tp-btn tp-sound" aria-pressed={sound} aria-keyshortcuts="M" title="Narration (M)" onClick={toggleSound}>
          {sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}<span className="sr-only">Narration</span>
        </button>
        <button type="button" className="tp-btn" aria-keyshortcuts="ArrowLeft" title="Previous chapter (←)" onClick={() => jump(-1)}>
          <ChevronLeft aria-hidden="true" /><span className="sr-only">Previous chapter</span>
        </button>
        <div
          className="tp-progress" role="progressbar" aria-label="Chapter" aria-valuemin={1} aria-valuemax={rt.length}
          aria-valuenow={Math.max(active + 1, 1)} aria-valuetext={cur ? `Chapter ${active + 1} of ${rt.length}: ${cur.ch.title}` : 'Not started'}
        >
          <span className="tp-label" aria-hidden="true">{cur?.ch.title}</span>
          <span className="tp-bars" ref={segs} aria-hidden="true">{rt.map((c, i) => <i key={c.ch.id} data-on={i === active || undefined} />)}</span>
        </div>
        <button type="button" className="tp-btn" aria-keyshortcuts="ArrowRight" title="Next chapter (→)" onClick={() => jump(1)} disabled={active >= rt.length - 1}>
          <ChevronRight aria-hidden="true" /><span className="sr-only">Next chapter</span>
        </button>
        <button type="button" className="tp-btn" aria-pressed={captions} title="Captions" onClick={() => setCaptions(!captions)}>
          {captions ? <Captions aria-hidden="true" /> : <CaptionsOff aria-hidden="true" />}<span className="sr-only">Captions</span>
        </button>
      </div>
    </div>
  );
}

const Chapter = memo(function Chapter({ c, modeId }) {
  const { ch } = c, id = `${modeId}-${ch.id}`;
  const attach = el => { c.el = el; if (el) c.captions = [...el.querySelectorAll('.ch-caption')]; };
  return (
    <section ref={attach} className={`ch ch-${ch.id}`} style={{ '--h': ch.height }} aria-labelledby={id}>
      <div className="ch-stage">
        <div className="ch-scene"><ch.Scene onProgress={c.on} /></div>
        <h2 id={id} className="ch-head"><span className="ch-kicker">{ch.kicker}</span> <span className="ch-title">{ch.title}</span></h2>
        <div className="ch-captions">
          {ch.voice.map(([, line], j) => (
            <p key={j} className="ch-caption" data-on={REDUCED || j === 0}>{line.split(' ').map((w, k) => <span key={k}>{w} </span>)}</p>
          ))}
        </div>
      </div>
    </section>
  );
});
