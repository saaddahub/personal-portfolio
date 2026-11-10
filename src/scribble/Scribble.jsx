import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { arrow, loop, loopBox, rng, underline } from './ink.js';
import { createPortal } from 'react-dom';
import './scribble.css';

// Hand-drawn crayon notes that write themselves next to something on the page. Decorative only: whatever they
// point at must already be findable without them.
//
//   <Scribble anchor=".sound" kind="circle" side="nw" text={'I talk,\nif you let me'} show={…} />
//
// anchor  CSS selector of the thing to point at (fixed elements are followed as fixed)
// kind    arrow: note + arrow to the anchor · circle: loop round it (+ arrow from the note)
//         underline: line under it · note: just the words
// side    where the note sits: n ne e se s sw w nw · gap [x, y] px away from the anchor (or a nudge along it)
// bend    bow of the arrow, as a share of its length; negative bows the other way
// seed    picks the wobble, tilt and bounce · delay  seconds after `show` first turns true
// avoid   selector of things it must not cover; where it would, or where it would leave the screen, it stays away
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY = 'scribbles-seen';
const seen = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; } };

// Each note plays once a session: after the visitor acts on it or moves on, it stays away.
// fresh: not yet seen when the page opened · on: fresh and not finished on this visit.
export function useOnce(id) {
  const [fresh] = useState(() => !seen().includes(id));
  const [done, setDone] = useState(false);
  const finish = useCallback(() => {
    setDone(true);
    try { sessionStorage.setItem(KEY, JSON.stringify([...new Set([...seen(), id])])); } catch { /* storage blocked: it returns next visit */ }
  }, [id]);
  return { fresh, on: fresh && !done, finish };
}

let probe;
function measure(text, size, bounce) {
  probe ??= Object.assign(document.createElement('span'), { className: 'scribble-probe' });
  if (!probe.isConnected) document.body.append(probe);
  probe.style.fontSize = `${size}px`;
  probe.style.fontVariationSettings = `'INFM' 100, 'BNCE' ${bounce}`;
  probe.textContent = text;
  return probe.getBoundingClientRect().width;
}

const isFixed = el => { for (; el; el = el.parentElement) if (getComputedStyle(el).position === 'fixed') return true; return false; };
const near = (r, [x, y]) => [Math.min(Math.max(x, r.x), r.x + r.w), Math.min(Math.max(y, r.y), r.y + r.h)];
const hits = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const EDGE = 18; // soft leading edge of the writing, px

function compose(el, box, { kind, text, side, gap, bend, seed, avoid }) {
  const fixed = isFixed(el);
  box.style.position = fixed ? 'fixed' : 'absolute';
  const base = fixed || !box.offsetParent ? { left: 0, top: 0 } : box.offsetParent.getBoundingClientRect();
  const a = el.getBoundingClientRect();
  if (!a.width) return null;
  const A = { x: a.left - base.left, y: a.top - base.top, w: a.width, h: a.height }, c = [A.x + A.w / 2, A.y + A.h / 2];
  const rand = rng(seed);
  const size = Math.round(Math.min(22, Math.max(18, innerWidth / 68))), lh = Math.round(size * 1.18), bounce = Math.round(30 + rand() * 50);
  const width = Math.max(2.6, size * 0.14); // the crayon runs a touch heavier than the letters
  const words = text ? text.split('\n') : [], widths = words.map(l => measure(l, size, bounce));
  const W = Math.max(0, ...widths), H = words.length * lh;
  const sx = side.includes('e') ? 1 : side.includes('w') ? -1 : 0, sy = side.includes('s') ? 1 : side.includes('n') ? -1 : 0;
  const nx = sx > 0 ? A.x + A.w + gap[0] : sx < 0 ? A.x - gap[0] - W : c[0] - W / 2 + gap[0];
  const ny = sy > 0 ? A.y + A.h + gap[1] : sy < 0 ? A.y - gap[1] - H : c[1] - H / 2 + gap[1];
  const lines = words.map((t, i) => ({ text: t, x: nx + (rand() - 0.5) * 6, y: ny + i * lh, w: widths[i] }));

  const before = [], after = [];
  let edge = (dx, dy) => Math.min(dx ? A.w / 2 / Math.abs(dx) : Infinity, dy ? A.h / 2 / Math.abs(dy) : Infinity);
  if (kind === 'circle') {
    const o = loopBox(A);
    before.push(...loop(A, rand, { width }));
    edge = (dx, dy) => 1.08 / Math.hypot(dx / o.rx, dy / o.ry); // to the loop's outer pass, not the box
  }
  if (kind === 'underline') before.push(...underline(A, rand, { width }));
  if (lines.length && (kind === 'arrow' || kind === 'circle')) {
    // From the line nearest the anchor toward the anchor's centre, stopping short at its edge.
    const l = lines[sy < 0 ? lines.length - 1 : 0], start = near({ x: l.x - 4, y: l.y + lh * 0.15, w: l.w + 8, h: lh * 0.7 }, c);
    const dx = start[0] - c[0], dy = start[1] - c[1], s = edge(dx, dy), end = [c[0] + dx * s, c[1] + dy * s];
    const len = Math.hypot(start[0] - end[0], start[1] - end[1]), ux = (end[0] - start[0]) / len, uy = (end[1] - start[1]) / len;
    if (len > 44) after.push(...arrow([start[0] + ux * 7, start[1] + uy * 7], [end[0] - ux * 12, end[1] - uy * 12], rand, { bend, width }));
  }

  // The order a hand works in: mark the thing, write the note, then draw the arrow; durations follow length.
  let t = 0;
  const strokes = [];
  const draw = s => { const d = Math.min(Math.max(s.len / 460, 0.08), 0.7); strokes.push({ ...s, d: t, t: d }); t += d + (s.len < 30 ? 0.05 : 0.1); };
  before.forEach(draw);
  lines.forEach(l => { l.d = t; l.t = 0.1 + l.text.length * 0.045; t += l.t + 0.1; });
  after.forEach(draw);

  const ink = strokes.map(s => s.box).concat(lines.map(l => [l.x - 6, l.y - 4, l.x + l.w + 6, l.y + lh + 6]));
  const x0 = Math.min(...ink.map(b => b[0])), y0 = Math.min(...ink.map(b => b[1])), x1 = Math.max(...ink.map(b => b[2])), y1 = Math.max(...ink.map(b => b[3]));
  // Off the screen or over something that matters: better not drawn than squeezed.
  const seenBox = { left: x0 + base.left, top: y0 + base.top, right: x1 + base.left, bottom: y1 + base.top };
  if (seenBox.left < 6 || seenBox.right > innerWidth - 6 || (fixed && (seenBox.top < -2 || seenBox.bottom > innerHeight - 4))) return null;
  if (avoid && [...document.querySelectorAll(avoid)].some(e => { const r = e.getBoundingClientRect(); return r.width && hits(seenBox, r); })) return null;
  const pad = 16;
  return {
    x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2,
    strokes, lines, size, lh, bounce,
    rot: (rand() - 0.5) * 6, cx: nx + W / 2, cy: ny + H / 2,
  };
}

export default function Scribble({ anchor, kind = 'arrow', text = '', side = 'e', gap = [28, 0], bend = 0.25, seed = 1, delay = 0, show = true, accent = false, avoid, media = '(min-width: 760px)' }) {
  const box = useRef(null), id = useId().replace(/:/g, '');
  const [due, setDue] = useState(false);
  const [geo, setGeo] = useState(null);

  // Wait for its moment and for the handwriting face before measuring: anchors may still be arriving.
  useEffect(() => {
    if (!show || due) return;
    let live = true;
    const wait = setTimeout(() => document.fonts.load('20px "Shantell Sans"').catch(() => {}).then(() => live && setDue(true)), REDUCED ? 0 : delay * 1000);
    return () => { live = false; clearTimeout(wait); };
  }, [show, due, delay]);

  const key = `${anchor}|${kind}|${text}|${side}|${gap}|${bend}|${seed}|${avoid}|${media}`;
  useEffect(() => {
    const el = due && document.querySelector(anchor);
    if (!el) return;
    const mq = matchMedia(media);
    const place = () => setGeo(mq.matches ? compose(el, box.current, { kind, text, side, gap, bend, seed, avoid }) : null);
    place();
    const ro = new ResizeObserver(place); // the anchor's font arriving or its text changing moves it
    ro.observe(el);
    addEventListener('resize', place);
    mq.addEventListener('change', place);
    return () => { ro.disconnect(); removeEventListener('resize', place); mq.removeEventListener('change', place); };
  }, [due, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const g = geo;
  // Drawn at the top of the document, so a note can sit over the fixed glass tab bar instead of under its lens.
  return createPortal(
    <div ref={box} className="scribble" aria-hidden="true" data-accent={accent || undefined} data-gone={(g && !show) || undefined} style={g ? { left: g.x, top: g.y, width: g.w, height: g.h } : undefined}>
      {g && (
        <svg viewBox={`${g.x} ${g.y} ${g.w} ${g.h}`} width={g.w} height={g.h}>
          <defs>
            {/* Wax on a rough ground: ragged edges, grain where the crayon skipped, and a breath of night behind
                so the words still read where petals drift underneath. */}
            <filter id={`${id}w`} filterUnits="userSpaceOnUse" x={g.x} y={g.y} width={g.w} height={g.h} colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} result="rough" />
              <feDisplacementMap in="SourceGraphic" in2="rough" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="edge" />
              <feTurbulence type="fractalNoise" baseFrequency="0.7 1.5" numOctaves="3" seed={seed + 7} result="tooth" />
              <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.95" result="grain" />
              <feComposite in="edge" in2="grain" operator="in" result="wax" />
              <feMorphology in="SourceAlpha" operator="dilate" radius="2" />
              <feGaussianBlur stdDeviation="3.5" result="spread" />
              <feFlood floodColor="#0d0a10" floodOpacity="0.5" />
              <feComposite in2="spread" operator="in" result="shade" />
              <feMerge><feMergeNode in="shade" /><feMergeNode in="wax" /></feMerge>
            </filter>
            {g.strokes.map((s, i) => (
              <mask key={i} id={`${id}m${i}`} maskUnits="userSpaceOnUse" x={g.x} y={g.y} width={g.w} height={g.h}>
                <path className="scribble-trace" d={s.spine} pathLength="1" strokeWidth={s.width + 4} style={{ '--d': `${s.d}s`, '--t': `${s.t}s` }} />
              </mask>
            ))}
            {g.lines.map((l, i) => (
              <g key={i}>
                <linearGradient id={`${id}g${i}`}>
                  <stop offset={(l.w + 12) / (l.w + 12 + EDGE)} stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask id={`${id}t${i}`} maskUnits="userSpaceOnUse" x={g.x} y={g.y} width={g.w} height={g.h}>
                  <rect className="scribble-wipe" x={l.x - 6} y={l.y - 8} width={l.w + 12 + EDGE} height={g.lh + 16} fill={`url(#${id}g${i})`} style={{ '--d': `${l.d}s`, '--t': `${l.t}s`, '--from': `${-(l.w + 12 + EDGE)}px` }} />
                </mask>
              </g>
            ))}
          </defs>
          <g filter={`url(#${id}w)`}>
            {g.strokes.map((s, i) => <path key={i} className="scribble-mark" d={s.fill} mask={`url(#${id}m${i})`} />)}
            <g transform={`rotate(${g.rot.toFixed(2)} ${g.cx} ${g.cy})`} style={{ fontSize: g.size, fontVariationSettings: `'INFM' 100, 'BNCE' ${g.bounce}` }}>
              {g.lines.map((l, i) => <text key={i} x={l.x} y={l.y + g.size * 0.92} mask={`url(#${id}t${i})`}>{l.text}</text>)}
            </g>
          </g>
        </svg>
      )}
    </div>,
    document.body,
  );
}
