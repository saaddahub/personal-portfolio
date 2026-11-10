import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { content } from '../content.js';
import { Link } from '../router.jsx';
import { scene } from '../scene.js';
import './pages.css';

const projects = content.projects.filter(p => !p.hidden), { dashboards } = content;
const years = projects.filter(p => p.year).map(p => Number(p.year)); // a project without a year yet is left out of the range
const clamp = x => Math.min(Math.max(x, 0), 1);
const gustAt = el => { const b = el.getBoundingClientRect(); scene.current?.gust(b.top + b.height / 2); };

export default function Work() {
  const [open, setOpen] = useState(null);
  const opening = useRef(null), list = useRef(null), boards = useRef(null);

  useEffect(() => {
    if (!document.documentElement.classList.contains('motion')) return;
    let frame = 0;
    const lit = [];
    const update = () => {
      frame = 0;
      const vh = innerHeight;
      // The opening clears out before it scrolls up into the canopy.
      opening.current.style.opacity = Math.max(0, 1 - scrollY / (vh * 0.55)).toFixed(3);
      // Each row catches the light as it rises to the reading line, and the wind passes through it.
      [...list.current.children].forEach((row, i) => {
        const t = Math.round(clamp((vh * 0.95 - row.getBoundingClientRect().top) / (vh * 0.3)) * 1000) / 1000;
        if (t === lit[i]) return;
        if (lit[i] < 0.6 && t >= 0.6) gustAt(row.firstChild);
        lit[i] = t;
        row.style.setProperty('--lit', t);
      });
      // Dashboards tilt up into place as they scroll in.
      for (const item of boards.current?.children ?? []) {
        item.style.setProperty('--p', clamp((vh - item.getBoundingClientRect().top) / (vh * 0.75)).toFixed(3));
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <>
      <header className="open wrap work-open" ref={opening}>
        <h1 className="open-title page-title" data-drop="work">Selected work</h1>
        <p className="open-lead" data-reveal="rise">
          {projects.length} projects{years.length > 0 && `, ${Math.min(...years) === Math.max(...years) ? Math.max(...years) : `${Math.min(...years)}–${Math.max(...years)}`}`}. Open any row for the details.
        </p>
      </header>

      <section className="work-index wrap" aria-labelledby="work-index-title">
        <h2 id="work-index-title" className="sr-only">Projects</h2>
        <ul className="work-list" ref={list}>
          {projects.map(p => {
            const isOpen = open === p.id;
            return (
              <li key={p.id} className="work-row" data-open={isOpen}>
                <h3>
                  <button
                    type="button"
                    className="work-head"
                    aria-expanded={isOpen}
                    aria-controls={`panel-${p.id}`}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    onPointerEnter={e => { if (e.pointerType === 'mouse') gustAt(e.currentTarget); }}
                  >
                    <span className="work-title">{p.title}</span>
                    <span className="work-meta"><span>{p.year}</span><span>{p.status}</span></span>
                    <Plus className="work-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`panel-${p.id}`} className="work-panel" {...(!isOpen && { inert: '' })}>
                  <div className="work-panel-inner">
                    <div className="work-detail">
                      <div className="work-story work-in">
                        {p.description && <p className="work-description">{p.description}</p>}
                        {p.liveUrl && (
                          <p className="work-live">
                            <a className="action action-primary" href={p.liveUrl} target="_blank" rel="noreferrer">Visit the live project <ArrowUpRight aria-hidden="true" /></a>
                            <span className="work-host">{new URL(p.liveUrl).host}</span>
                          </p>
                        )}
                      </div>
                      <dl className="work-facts work-in" style={{ '--k': 1 }}>
                        {p.role && <div><dt>Role</dt><dd>{p.role}</dd></div>}
                        {p.stack.length > 0 && <div><dt>Built with</dt><dd><ul className="work-stack">{p.stack.map(s => <li key={s}>{s}</li>)}</ul></dd></div>}
                      </dl>
                      {p.image && (
                        <figure className="work-figure work-in" style={{ '--k': 2 }}>
                          <img src={p.image} alt={p.alt} loading="lazy" width="1416" height="797" />
                        </figure>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="dash wrap" aria-labelledby="dash-title">
        <h2 id="dash-title" className="pages-heading" data-reveal="fade">Dashboards</h2>
        {dashboards.length ? (
          <ul className="dash-list" ref={boards}>
            {dashboards.map((d, i) => (
              <li key={i} className="dash-item">
                <figure>
                  {d.image && <div className="dash-frame"><img src={d.image} alt={d.alt} loading="lazy" /></div>}
                  <figcaption className="dash-caption">
                    <h3>{d.title}</h3>
                    {d.note && <p>{d.note}</p>}
                    {d.url && <a className="action" href={d.url} target="_blank" rel="noreferrer">Open the dashboard <ArrowUpRight aria-hidden="true" /></a>}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-soon" data-reveal="fade" style={{ '--i': 1 }}>On the way. Screenshots and live links will be added here.</p>
        )}
      </section>

      <nav className="page-next wrap" aria-label="Next page" data-reveal="fade">
        <Link to="/about"><span className="page-next-kicker">Next</span><span className="page-next-title">About</span><ArrowRight aria-hidden="true" /></Link>
      </nav>
    </>
  );
}
