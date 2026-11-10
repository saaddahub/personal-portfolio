import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { content } from '../content.js';
import { Link } from '../router.jsx';
import { scene } from '../scene.js';
import './pages.css';

// The first paragraph is Saad's voice: pinned, its words light in reading order as the visitor scrolls.
const [voice, ...rest] = content.about;
const words = voice.split(' ');
const clamp = x => Math.min(Math.max(x, 0), 1);
// One cherry petal, notched at the tip, drawn from the flower's centre.
const PETAL = 'M0 0C-3.6-2.2-4.6-7.4-1.7-10.4L0-9 1.7-10.4C4.6-7.4 3.6-2.2 0 0Z';

export default function About() {
  const opening = useRef(null), track = useRef(null), text = useRef(null), branch = useRef(null);

  useEffect(() => {
    if (!document.documentElement.classList.contains('motion')) return;
    let frame = 0, lastLit = -1, ready = false;
    const update = () => {
      frame = 0;
      const vh = innerHeight;
      opening.current.style.opacity = Math.max(0, 1 - scrollY / (vh * 0.6)).toFixed(3);

      const r = track.current.getBoundingClientRect();
      // Finish lighting a little before the pin lets go, so the whole thought holds for a moment.
      const lit = Math.round(clamp(-r.top / (r.height - vh)) * 1.3 * words.length * 100) / 100;
      if (lit !== lastLit) {
        lastLit = lit;
        [...text.current.children].forEach((w, i) => { w.style.opacity = (0.16 + 0.84 * clamp(lit - i)).toFixed(3); });
      }

      // The branch grows down to the reading line; each moment blooms as it is reached, with a breath of wind.
      const b = branch.current.getBoundingClientRect(), front = vh * 0.72;
      branch.current.style.setProperty('--grow', clamp((front - b.top) / b.height).toFixed(4));
      for (const li of branch.current.children) {
        const bud = li.children[1].getBoundingClientRect(), y = bud.top + bud.height / 2, on = String(y < front);
        if (on === li.dataset.open) continue;
        li.dataset.open = on;
        if (ready && on === 'true') scene.current?.gust(y);
      }
      ready = true;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <>
      <header className="open wrap about-open" ref={opening}>
        <h1 className="open-title page-title" data-drop="about">About</h1>
        <p className="open-lead" data-reveal="rise">{content.role}</p>
        <dl className="about-now">
          {content.currently.map(([label, note], i) => (
            <div key={label} data-reveal="rise" style={{ '--i': i + 1 }}><dt>{label}</dt><dd>{note}</dd></div>
          ))}
        </dl>
      </header>

      <div className="voice" ref={track}>
        <div className="voice-stage wrap">
          <p className="voice-text" ref={text}>{words.map((w, i) => <span key={i}>{w} </span>)}</p>
        </div>
      </div>
      <div className="voice-after wrap">
        {rest.map(t => <p className="about-text" data-reveal="fade" key={t.slice(0, 16)}>{t}</p>)}
      </div>

      <section className="path wrap" aria-labelledby="path-title">
        <h2 id="path-title" className="pages-heading" data-reveal="fade">So far</h2>
        <ol className="timeline" ref={branch}>
          {content.experience.map(e => (
            <li key={e.title}>
              <span className="timeline-years">{e.years}</span>
              <svg className="timeline-bud" viewBox="-12 -12 24 24" aria-hidden="true">
                {[0, 1, 2, 3, 4].map(k => <path key={k} className="petal" d={PETAL} style={{ '--a': `${k * 72}deg`, '--k': k }} />)}
                <circle className="heart" r="1.8" />
              </svg>
              <div className="timeline-body">
                <h3>{e.title}</h3>
                <p className="timeline-place">{e.place}</p>
                <p>{e.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <nav className="page-next wrap" aria-label="Next page" data-reveal="fade">
        <Link to="/contact"><span className="page-next-kicker">Next</span><span className="page-next-title">Say hello</span><ArrowRight aria-hidden="true" /></Link>
      </nav>
    </>
  );
}
