import { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

// The shared motion grammar for Story Mode scenes: every scene authors one anime.js timeline on a 0–1000 clock and
// the shell's scroll progress scrubs it. Ease is outExpo (the site's cubic-bezier(0.16, 1, 0.3, 1)) unless a tween
// is travelling, which uses inOutCubic so it leaves and lands without a jolt.
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const clamp = x => Math.min(Math.max(x, 0), 1);
export const seg = (p, a, b) => clamp((p - a) / (b - a));

// A seeded random stream, so illustrative scatters look the same on every visit.
export const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// build(tl, $) adds the scene's tweens; $(selector) finds elements inside the scene. It may return a per-frame
// function (p, now) for work a timeline can't do, such as drawing to a canvas.
export function useScrub(onProgress, build) {
  const root = useRef(null);
  useEffect(() => {
    const el = root.current;
    const tl = createTimeline({ autoplay: false, defaults: { ease: 'outExpo', duration: 120 } });
    const frame = build(tl, q => [...el.querySelectorAll(q)], el);
    // Render every tween once and come back, so the start state is written before the first frame is seen.
    tl.seek(tl.duration).seek(0);
    let last = -1;
    const off = onProgress((p, now) => {
      if (p !== last) { last = p; tl.seek(Math.min(p * 1000, tl.duration)); }
      frame?.(p, now);
    });
    return () => { off(); tl.revert(); };
  }, [onProgress]);
  return root;
}
