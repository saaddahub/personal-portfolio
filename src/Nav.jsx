import { useLayoutEffect, useRef, useState } from 'react';
import { Link, PAGES, usePath } from './router.jsx';

// The glass tab bar. A lens of brighter glass sits under the current page's tab; when the page changes, its
// leading edge runs ahead and the trailing edge follows, so it stretches toward the new tab like a drop of liquid.
export default function Nav({ dawn }) {
  const path = usePath(), tabs = useRef(null), last = useRef(null);
  const [lens, setLens] = useState(null);

  useLayoutEffect(() => {
    const place = () => {
      const a = tabs.current.querySelector('[aria-current="page"]');
      if (!a) return;
      const l = a.offsetLeft, r = tabs.current.clientWidth - l - a.offsetWidth;
      setLens({ l, r, dir: last.current && l < last.current ? 'back' : 'forward' });
      last.current = l;
    };
    place();
    const ro = new ResizeObserver(place); // the font arriving or the window resizing moves the tabs
    ro.observe(tabs.current);
    return () => ro.disconnect();
  }, [path]);

  return (
    <header className="nav" data-dawn-tone={dawn}>
      <Link to="/" className="nav-mark" aria-label="Saad Akhtar, home">SA</Link>
      <nav className="nav-glass" aria-label="Main">
        <ul
          className="nav-tabs"
          ref={tabs}
          data-dir={lens?.dir}
          style={lens ? { '--l': `${lens.l}px`, '--r': `${lens.r}px` } : undefined}
        >
          <li className="nav-lens" aria-hidden="true" data-ready={!!lens} />
          {PAGES.map(([to, label]) => (
            <li key={to}>
              <Link to={to} aria-current={path === to ? 'page' : undefined} data-story={to === '/story' || undefined}>
                {to === '/story' && <Spark />}
                <span className="nav-label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

const Spark = () => (
  <svg className="nav-spark" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 0c.6 4.2 3.2 6.9 8 8-4.8 1.1-7.4 3.8-8 8-.6-4.2-3.2-6.9-8-8 4.8-1.1 7.4-3.8 8-8Z" />
  </svg>
);
