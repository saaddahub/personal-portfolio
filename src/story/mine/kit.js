import { useEffect, useRef } from 'react';

// Shared by the My Story scenes: one set of easings and one way to hook a scene to the shell's scroll progress.
export const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
export const seg = (p, a, b) => clamp((p - a) / (b - a)); // local 0–1 progress through [a, b]
export const lerp = (a, b, t) => a + (b - a) * t;
export const expo = t => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)); // the house ease, cubic-bezier(0.16, 1, 0.3, 1)
export const cubic = t => 1 - (1 - t) ** 3;
export const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const TAU = Math.PI * 2;

// Seeded randomness, so a scatter is the same on every visit and scrolling back retraces it exactly.
export function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// The usable box inside the stage: clear of the shell's chapter title (top) and caption strip (bottom).
export function safe(w, h) {
  const g = clamp(w * 0.04, 20, 40);
  const top = Math.min(96, h * 0.16), bottom = Math.min(120, h * 0.2);
  return { x: g, y: top, w: w - 2 * g, h: h - top - bottom };
}

// build(root, width, height) → { render(p, now), destroy?() }. Scenes are pure functions of p, so rebuilding on a
// resize and repainting the last progress is seamless.
export function useScene(onProgress, build) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let scene, last, w = 0, h = 0, timer = 0;
    const make = () => {
      scene?.destroy?.();
      w = el.clientWidth;
      h = el.clientHeight;
      scene = build(el, w, h);
      if (last) scene.render(last[0], last[1]);
    };
    make();
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === w && el.clientHeight === h) return;
      clearTimeout(timer);
      timer = setTimeout(make, 150);
    });
    ro.observe(el);
    const off = onProgress((p, now) => {
      last = [p, now];
      scene.render(p, now);
    });
    return () => { off?.(); ro.disconnect(); clearTimeout(timer); scene?.destroy?.(); };
    // The shell's subscription is made once per mount, by contract.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

// Writes a style only when it changed: most frames move a handful of things, not all of them.
export function setter(el) {
  const cache = {};
  return (prop, value) => {
    if (cache[prop] === value) return;
    cache[prop] = value;
    if (prop[0] === '-') el.style.setProperty(prop, value);
    else el.style[prop] = value;
  };
}
