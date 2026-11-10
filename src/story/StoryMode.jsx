import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { MODES, loadModes } from './modes.js';
import Player from './Player.jsx';
import Transcript from './Transcript.jsx';
import { REDUCED } from './motion.js';
import { wake } from './voice.js';
import { scene } from '../scene.js';
import './story.css';

// Story Mode, the /story page: a choice between two narrated modes, each a run of scroll-driven chapters.
// Mode modules follow the chapter contract documented in Player.jsx.
const root = document.documentElement;
// My Story arrives as its own chunk; src/pages/Story.jsx waits for this before the page transition starts.
export const ready = loadModes();

export default function StoryMode() {
  const [view, setView] = useState({ id: null, read: false });
  const [sound, setSound] = useState(true);
  const left = useRef(null), first = useRef(true);

  useEffect(() => () => { delete root.dataset.immersive; delete root.dataset.storyVt; }, []);

  // A new view takes focus at its heading; back at the choice, focus returns to the mode the visitor left.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = view.id ? document.querySelector('.story .page-title') : document.querySelector(`[data-card='${left.current}'] .mode-go`);
    el?.focus({ preventScroll: true });
  }, [view]);

  // Every change of view is an in-page view transition: the chosen sheet grows into the mode, the page title
  // flies to its new place and the rest of the page cross-fades (story.css). Reduced motion swaps in place.
  const go = (next, card) => {
    const from = view, named = [];
    const name = (el, n) => { if (el) { el.style.viewTransitionName = n; named.push(el); } };
    const onScreen = el => el && el.getBoundingClientRect().bottom > 0;
    const kind = !from.id ? 'open' : !next.id ? 'back' : from.id === next.id ? 'swap' : 'switch';
    if (!next.id) left.current = from.id;
    if (next.id && !next.read && sound) wake(MODES.find(m => m.id === next.id)); // inside the click, so audio may start
    const update = () => {
      flushSync(() => setView(next));
      scrollTo(0, 0);
      if (kind === 'switch') return;
      name(next.id ? document.querySelector('.story-sheet') : document.querySelector(`[data-card='${from.id}']`), 'story-sheet');
    };
    if (!document.startViewTransition || REDUCED) return update();

    if (kind === 'open') {
      name(card, 'story-sheet');
      document.querySelectorAll('.mode-card').forEach(el => el !== card && name(el, 'story-other'));
    } else if (kind !== 'switch') {
      const sheet = document.querySelector('.story-sheet');
      if (onScreen(sheet)) name(sheet, 'story-sheet');
    }
    // A title scrolled far out of view would streak across the whole story; let the new one simply arrive.
    const title = document.querySelector('.story .page-title');
    if (!onScreen(title)) name(title, 'none');
    root.dataset.storyVt = kind === 'switch' && MODES.findIndex(m => m.id === next.id) < MODES.findIndex(m => m.id === from.id) ? 'switch-back' : kind;
    scene.current?.gust(innerHeight * 0.55);
    const t = document.startViewTransition(update);
    t.ready.catch(() => {}); // a second press mid-transition skips the first; that is fine
    t.finished.finally(() => {
      delete root.dataset.storyVt;
      named.forEach(el => { el.style.viewTransitionName = ''; });
    });
  };

  const mode = MODES.find(m => m.id === view.id);
  const other = MODES.find(m => m.id !== view.id);
  return (
    <div className="story">
      {!mode ? (
        <Chooser sound={sound} setSound={setSound} onChoose={go} enter={!left.current} />
      ) : view.read ? (
        <Transcript mode={mode} other={other} go={go} />
      ) : (
        <Player key={mode.id} mode={mode} other={other} sound={sound} setSound={setSound} go={go} />
      )}
    </div>
  );
}

function Chooser({ sound, setSound, onChoose, enter }) {
  return (
    <section className="chooser wrap" aria-labelledby="story-title" data-enter={enter || undefined}>
      <div className="chooser-head">
        <h1 id="story-title" className="page-title chooser-title" data-drop="story" tabIndex={-1}>The story so far</h1>
        <div className="chooser-aside">
          <p className="chooser-lead">Two ways in, both narrated and captioned. You can switch at any point.</p>
          <button type="button" className="story-pill" aria-pressed={sound} onClick={() => setSound(!sound)}>
            {sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            Narration
          </button>
        </div>
      </div>
      <ul className="modes">
        {MODES.map((m, i) => <ModeCard key={m.id} m={m} i={i} onChoose={onChoose} />)}
      </ul>
    </section>
  );
}

function ModeCard({ m, i, onChoose }) {
  const card = useRef(null);
  // The light on the glass follows a mouse, and the sheet leans a few degrees toward it.
  const lean = e => {
    if (e.pointerType !== 'mouse' || REDUCED) return;
    const r = card.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, s = card.current.style;
    s.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    s.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    s.setProperty('--rx', `${((x - 0.5) * 6).toFixed(2)}deg`);
    s.setProperty('--ry', `${((0.5 - y) * 6).toFixed(2)}deg`);
  };
  const settle = () => ['--rx', '--ry'].forEach(v => card.current.style.removeProperty(v));
  return (
    <li className="mode" style={{ '--i': i }}>
      <div className="mode-card glass" data-card={m.id} ref={card} onPointerMove={lean} onPointerLeave={settle}>
        <Preview id={m.id} />
        <h2 className="mode-name">{m.title}</h2>
        <p className="mode-blurb">{m.blurb}</p>
        <div className="mode-foot">
          <button type="button" className="mode-go" onClick={() => onChoose({ id: m.id, read: false }, card.current)}>
            Begin<span className="sr-only"> {m.title}</span>
            <ArrowRight aria-hidden="true" />
          </button>
          <span className="mode-meta">{m.chapters.length} chapters</span>
          <button type="button" className="mode-read" onClick={() => onChoose({ id: m.id, read: true }, card.current)}>
            Read instead<span className="sr-only">: {m.title}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

// Small drawings for each mode: The Tour's layers part on hover; My Story's path draws itself.
function Preview({ id }) {
  if (id === 'tour') {
    return (
      <div className="pv pv-tour" aria-hidden="true">
        <div className="pv-rig">{[0, 1, 2, 3].map(i => <i key={i} style={{ '--i': i }} />)}</div>
      </div>
    );
  }
  return (
    <div className="pv pv-mine" aria-hidden="true">
      <svg viewBox="0 0 240 90" fill="none">
        <path pathLength="1" d="M4 70C40 70 46 22 84 26S124 76 158 60 196 14 236 18" />
        {[[4, 70], [84, 26], [158, 60], [236, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" style={{ '--i': i }} />)}
      </svg>
    </div>
  );
}
