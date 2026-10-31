import { useEffect, useRef } from 'react';

const edgeMaps = [
  ['left', '#ff8000', '#808000'],
  ['right', '#808000', '#008000'],
];

export default function AnalogEdges() {
  const surface = useRef(null);

  useEffect(() => {
    const host = surface.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let settle;
    const stop = () => {
      clearTimeout(settle);
      host.classList.remove('is-tracking');
    };
    const track = () => {
      if (reduced.matches || document.hidden) return;
      host.classList.add('is-tracking');
      clearTimeout(settle);
      settle = setTimeout(stop, 700);
    };
    window.addEventListener('scroll', track, { passive: true });
    document.addEventListener('visibilitychange', stop);
    reduced.addEventListener('change', stop);
    return () => {
      stop();
      window.removeEventListener('scroll', track);
      document.removeEventListener('visibilitychange', stop);
      reduced.removeEventListener('change', stop);
    };
  }, []);

  return (
    <div className="analog-edges" ref={surface} aria-hidden="true">
      <svg width="0" height="0" focusable="false">
        <defs>
          {edgeMaps.map(([side, start, end]) => (
            <filter key={side} id={`analog-${side}`} x="0" y="0" width="1" height="1"
              primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
              <feImage width="1" height="1" preserveAspectRatio="none" result="map"
                href={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><defs><linearGradient id="g"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs><path fill="url(#g)" d="M0 0h100v100H0z"/></svg>`)}`} />
              <feDisplacementMap in="SourceGraphic" in2="map" scale=".55"
                xChannelSelector="R" yChannelSelector="G" result="zoom" />
              <feGaussianBlur in="zoom" stdDeviation=".028 .0007" result="soft" />
              <feOffset in="soft" dx=".018" result="red-offset" />
              <feColorMatrix in="red-offset" type="matrix" result="red"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feOffset in="soft" dx="-.018" result="blue-offset" />
              <feColorMatrix in="blue-offset" type="matrix" result="blue"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
              <feColorMatrix in="soft" type="matrix" result="green"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" />
            </filter>
          ))}
        </defs>
      </svg>
      {edgeMaps.map(([side]) => (
        <div key={side} className={`analog-side analog-side--${side}`}>
          <span className="analog-edge analog-edge--soft" />
          <span className="analog-edge analog-edge--optical" />
          <span className="analog-edge analog-edge--tracking" />
        </div>
      ))}
    </div>
  );
}
