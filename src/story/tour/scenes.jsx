import { useEffect, useRef } from 'react';
import { stagger } from 'animejs';
import { ArrowRight } from 'lucide-react';
import { content } from '../../content.js';
import { PAGES, Link } from '../../router.jsx';
import { scene } from '../../scene.js';
import { REDUCED, rng, useScrub } from '../motion.js';
import { sample } from './sample.js';
import './tour.css';

/* The Tour's scenes. One grammar runs through all of them: a glass object materialises (blur and scale together),
   shows what it does, comes apart into its layers (interface, data, logic, stack) with each layer named, goes back
   together and hands off to the next chapter. Each chapter takes the object apart along a different path:
   lifted (Layers), a film strip (Netflix), a hand of cards (AI Interviewer), a network (Hospital), drawers in a
   lit building (Hotel), and a camera orbit round the live site (This site). */

const project = id => content.projects.find(p => p.id === id);
const em = n => `${n}em`;

function Face({ name, note, children, className = '' }) {
  return (
    <div className={`plate ${className}`}>
      <div className="plate-head"><span className="plate-name">{name}</span><span className="plate-note">{note}</span></div>
      <div className="plate-body">{children}</div>
    </div>
  );
}
const Chips = ({ items }) => <ul className="chips">{items.map(t => <li key={t}>{t}</li>)}</ul>;
const Tags = ({ items }) => (
  <ol className="tags">{items.map(([name, note]) => <li key={name} className="tag"><i aria-hidden="true" /><b>{name}</b><span>{note}</span></li>)}</ol>
);

/* Before we start: a blank slab lifts into its four layers, to teach the grammar the chapters reuse. */
const LAYERS = [['Interface', 'What you see and touch'], ['Data', 'What it knows'], ['Logic', 'What it decides'], ['Stack', 'What it stands on']];
const LZ = [7.2, 2.4, -2.4, -7.2];

export function Layers({ onProgress }) {
  const ref = useScrub(onProgress, (tl, $) => {
    const rig = $('.rig'), plates = $('.plate'), tags = $('.tag');
    tl.add(plates, { opacity: [0, 1], scale: [0.86, 1], filter: ['blur(16px)', 'blur(0px)'], duration: 150 }, stagger(18, { from: 'last' }))
      .add(rig, { rotateX: [0, 56], rotateZ: [0, -36], duration: 200, ease: 'inOutCubic' }, 140)
      .add(plates, { translateZ: (_, i) => [em(LZ[i] * 0.04), em(LZ[i])], duration: 220 }, stagger(24, { start: 320 }))
      .add(tags, { opacity: [0, 1], translateX: ['-1em', '0em'], translateY: (_, i) => ['0em', em(-LZ[i] * 0.83)], duration: 220 }, stagger(24, { start: 320 }))
      .add($('.gl-line'), { scaleX: [0, 1], duration: 80 }, stagger(14, { start: 520 }))
      .add($('.gl-dot'), { opacity: [0.15, 1], duration: 50 }, stagger(5, { start: 520, from: 'random' }))
      .add($('.gl-path'), { strokeDashoffset: [1, 0], duration: 140, ease: 'inOutCubic' }, 540)
      .add($('.gl-bar'), { translateX: ['-30%', '0%'], opacity: [0.2, 1], duration: 90 }, stagger(20, { start: 560 }))
      .add(plates, { translateZ: (_, i) => em(LZ[i] * 0.04), duration: 140, ease: 'inOutCubic' }, stagger(14, { start: 760, from: 'last' }))
      .add(tags, { opacity: 0, translateY: '0em', duration: 120, ease: 'inOutCubic' }, stagger(14, { start: 760, from: 'last' }))
      .add(rig, { rotateX: 72, rotateZ: -52, translateY: ['0em', '-5em'], duration: 140, ease: 'inCubic' }, 860)
      .add(plates, { opacity: 0, filter: 'blur(14px)', duration: 120, ease: 'inQuad' }, stagger(10, { start: 880 }));
  });
  return (
    <div className="scene sc-layers" ref={ref}>
      <div className="xv">
        <div className="rig" aria-hidden="true">
          <div className="plate">
            <div className="gl gl-win"><i className="gl-top" /><i className="gl-line" /><i className="gl-line" /><i className="gl-line" /><i className="gl-pill" /></div>
          </div>
          <div className="plate"><div className="gl gl-data">{Array.from({ length: 24 }, (_, i) => <i key={i} className="gl-dot" />)}</div></div>
          <div className="plate">
            <svg className="gl gl-logic" viewBox="0 0 120 70" fill="none">
              <path className="gl-path" pathLength="1" d="M14 52L44 18L76 46L106 16" />
              {[[14, 52], [44, 18], [76, 46], [106, 16]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" />)}
            </svg>
          </div>
          <div className="plate"><div className="gl gl-stack">{[0, 1, 2].map(i => <i key={i} className="gl-bar" />)}</div></div>
        </div>
      </div>
      <Tags items={LAYERS} />
    </div>
  );
}

/* Chapter one, Netflix: the catalogue arrives as scattered tiles that sort themselves into a chart, the chart
   becomes the real dashboard, and the dashboard's layers run past like frames on a film strip. */
const NF = project('netflix'), COLS = 12, ROWS = 8;

export function Netflix({ onProgress }) {
  const ref = useScrub(onProgress, (tl, $) => {
    const r = rng(11), tiles = $('.nf-tile'), plates = $('.plate'), rig = $('.rig');
    const sc = tiles.map(() => [(r() * 2 - 1) * 12, (r() * 2 - 1) * 7, 0.45 + r() * 0.9, 0.3 + r() * 0.5]);
    const on = i => Math.floor(i / COLS) < sample.netflixColumns[i % COLS];
    tl.add(tiles, {
      opacity: (_, i) => [0, sc[i][3]], scale: (_, i) => [0, sc[i][2]],
      translateX: (_, i) => [em(sc[i][0] * 1.35), em(sc[i][0])], translateY: (_, i) => [em(sc[i][1] * 1.35), em(sc[i][1])], duration: 140,
    }, stagger(1.2, { from: 'random' }))
      .add(tiles, {
        translateX: (_, i) => em(((i % COLS) - (COLS - 1) / 2) * 1.12), translateY: (_, i) => em(((ROWS - 1) / 2 - Math.floor(i / COLS)) * 1.12),
        scale: (_, i) => (on(i) ? 1 : 0.35), opacity: (_, i) => (on(i) ? 1 : 0), duration: 140, ease: 'inOutCubic',
      }, stagger(0.9, { start: 110, from: 'random' }))
      .add(tiles, { opacity: 0, scale: 0.3, duration: 60, ease: 'inQuad' }, stagger(0.4, { start: 380, from: 'center' }))
      .add(plates[0], { opacity: [0, 1], scale: [0.88, 1], filter: ['blur(18px)', 'blur(0px)'], duration: 110 }, 400)
      .add(plates, { translateX: (_, i) => ['0%', `${i * 108}%`], rotateY: [0, -10], duration: 140, ease: 'inOutCubic' }, stagger(15, { start: 500 }))
      .add(plates.slice(1), { opacity: [0, 1], duration: 80 }, stagger(15, { start: 515 }))
      .add(rig, { translateX: ['0%', '-324%'], duration: 220, ease: 'inOutSine' }, 640)
      .add(plates, { translateX: '0%', rotateY: 0, duration: 70, ease: 'inOutCubic' }, 870)
      .add(rig, { translateX: '0%', duration: 70, ease: 'inOutCubic' }, 870)
      .add(plates.slice(1), { opacity: 0, duration: 50 }, 890)
      .add(rig, { rotateX: [0, 70], translateY: ['0%', '-50%'], duration: 70, ease: 'inCubic' }, 930)
      .add(plates[0], { opacity: 0, duration: 60, ease: 'inQuad' }, 940);
  });
  const hot = i => sample.netflixColumns[i % COLS] >= 7;
  return (
    <div className="scene sc-nf" ref={ref}>
      <div className="nf-field" aria-hidden="true">{Array.from({ length: COLS * ROWS }, (_, i) => <i key={i} className="nf-tile" data-hot={hot(i) || undefined} />)}</div>
      <div className="xv">
        <div className="rig">
          <Face name="Interface" note="A Streamlit dashboard" className="nf-shot">
            <img src={NF.image} alt={NF.alt} width="1416" height="797" loading="lazy" decoding="async" />
          </Face>
          <Face name="Data" note="The Netflix catalogue">
            <div className="mini-bars" aria-hidden="true">{sample.netflixColumns.map((v, i) => <i key={i} style={{ '--v': v / ROWS }} />)}</div>
          </Face>
          <Face name="Logic" note="Pandas, shaping the data">
            <Chips items={['Genres', 'Release trends', 'Content ratings', 'Geography']} />
          </Face>
          <Face name="Stack" note={`${NF.status}, ${NF.year}`}><Chips items={NF.stack} /></Face>
        </div>
      </div>
    </div>
  );
}

/* Chapter two, AI Interviewer: a practice conversation plays out on a glass card, then the card fans out like a
   hand of cards to show what sits behind it. */
const AI = project('interviewer'), ANG = [-15, -5, 5, 15];

export function Interviewer({ onProgress }) {
  const ref = useScrub(onProgress, (tl, $) => {
    const rig = $('.rig'), cards = $('.plate');
    tl.add(rig, { translateX: ['40%', '0%'], rotateY: [-40, 0], duration: 130 }, 0)
      .add(cards, { opacity: [0, 1], filter: ['blur(14px)', 'blur(0px)'], duration: 120 }, stagger(12))
      .add($('.ai-role'), { opacity: [0, 1], translateY: ['0.6em', '0em'], duration: 60 }, 110)
      .add($('.ai-msg'), { opacity: [0, 1], translateY: ['0.8em', '0em'], scale: [0.94, 1], duration: 70 }, stagger(62, { start: 150 }))
      .add($('.ai-typing'), { opacity: [0, 1], duration: 16 }, 180)
      .add($('.ai-typing'), { opacity: 0, duration: 16 }, 204)
      .add(cards, { rotateZ: (_, i) => [0, ANG[i]], translateX: (_, i) => ['0%', `${(i - 1.5) * 26}%`], translateY: ['0%', '-3%'], duration: 160, ease: 'inOutCubic' }, 440)
      .add(rig, { scale: [1, 0.9], duration: 160, ease: 'inOutCubic' }, 440)
      .add($('.ai-token'), { opacity: [0.2, 1], duration: 40 }, stagger(9, { start: 600 }))
      .add($('.ai-orbit'), { rotateZ: [0, 360], duration: 200, ease: 'inOutSine' }, 600)
      .add($('.ai-node'), { opacity: [0.35, 1], duration: 30 }, stagger(50, { start: 600 }))
      .add(cards, { rotateZ: 0, translateX: '0%', translateY: '0%', duration: 100, ease: 'inOutCubic' }, 800)
      .add(rig, { scale: 1, duration: 100, ease: 'inOutCubic' }, 800)
      .add(rig, { translateX: '-45%', rotateY: 40, duration: 110, ease: 'inCubic' }, 890)
      .add(cards, { opacity: 0, filter: 'blur(14px)', duration: 90, ease: 'inQuad' }, stagger(8, { start: 905 }));
  });
  const answer = sample.interview.find(([who]) => who === 'a')[1];
  return (
    <div className="scene sc-ai" ref={ref}>
      <div className="xv">
        <div className="rig">
          <Face name="Stack" note={`${AI.status}, ${AI.year}`}><Chips items={AI.stack} /></Face>
          <Face name="Logic" note="Follow-ups and feedback">
            <div className="ai-ring" aria-hidden="true">
              <span className="ai-orbit"><i /></span>
              {['Role', 'Question', 'Answer', 'Feedback'].map((n, i) => <span key={n} className="ai-node" style={{ '--i': i }}>{n}</span>)}
            </div>
          </Face>
          <Face name="Data" note="The conversation so far">
            <p className="ai-tokens" aria-hidden="true">{answer.split(' ').map((w, i) => <span key={i} className="ai-token">{w}</span>)}</p>
          </Face>
          <Face name="Interface" note="A practice interview" className="ai-chat">
            <span className="ai-role">{sample.interviewRole}</span>
            {sample.interview.map(([who, text], i) => (
              <p key={i} className="ai-msg" data-who={who}>{text}</p>
            ))}
            <span className="ai-typing" aria-hidden="true"><i /><i /><i /></span>
          </Face>
        </div>
      </div>
    </div>
  );
}

/* Chapter three, Hospital Database: the slab bursts into a network of its layers, the relations draw in, and one
   front-desk question travels interface → logic → data and back with its answer. */
const DB = project('hospital');
const POS = [[0, -105], [-80, 0], [80, 0], [0, 105]]; // % of a plate: interface, logic, data, stack
const PT = [[0, -65.6], [-80, 0], [80, 0], [0, 65.6]]; // the same centres in the line drawing's units
const LINKS = [[0, 1], [1, 2], [2, 0], [3, 1], [3, 2]];

export function Hospital({ onProgress }) {
  const ref = useScrub(onProgress, (tl, $) => {
    const rig = $('.rig'), plates = $('.plate'), dot = $('.db-pulse');
    const hop = (to, at, d) => tl.add(dot, { translateX: PT[to][0], translateY: PT[to][1], duration: d, ease: 'inOutCubic' }, at);
    tl.add(plates, { opacity: [0, 1], rotateX: [55, 0], translateY: ['-40%', '0%'], filter: ['blur(14px)', 'blur(0px)'], duration: 130 }, stagger(14, { from: 'last' }))
      .add(plates, { translateX: (_, i) => `${POS[i][0]}%`, translateY: (_, i) => `${POS[i][1]}%`, duration: 200, ease: 'inOutCubic' }, stagger(16, { start: 150 }))
      .add($('.db-line'), { strokeDashoffset: [1, 0], duration: 110, ease: 'inOutCubic' }, stagger(24, { start: 360 }))
      .add(dot, { translateX: [PT[0][0], PT[0][0]], translateY: [PT[0][1], PT[0][1]], opacity: [0, 1], duration: 20 }, 470);
    hop(1, 490, 70);
    tl.add($('.db-step'), { opacity: [0.3, 1], duration: 30 }, stagger(18, { start: 560 }));
    hop(2, 620, 60);
    tl.add($('.db-table'), { opacity: [0.4, 1], duration: 30 }, stagger(10, { start: 670 }));
    hop(0, 700, 70);
    tl.add(dot, { opacity: 0, duration: 20 }, 770)
      .add($('.db-cell'), { opacity: [0.15, 1], duration: 30 }, stagger(6, { start: 760 }))
      .add($('.db-line'), { strokeDashoffset: 1, duration: 70, ease: 'inOutCubic' }, 800)
      .add(plates, { translateX: '0%', translateY: '0%', duration: 90, ease: 'inOutCubic' }, 810)
      .add(rig, { rotateY: [0, 90], duration: 100, ease: 'inCubic' }, 900)
      .add(plates, { opacity: 0, duration: 70, ease: 'inQuad' }, 930);
  });
  return (
    <div className="scene sc-db" ref={ref}>
      <div className="xv">
        <div className="rig">
          <svg className="db-lines" viewBox="-150 -110 300 220" aria-hidden="true">
            {LINKS.map(([a, b]) => <path key={`${a}${b}`} className="db-line" pathLength="1" d={`M${PT[a][0]} ${PT[a][1]}L${PT[b][0]} ${PT[b][1]}`} />)}
            <circle className="db-pulse" r="4.5" />
          </svg>
          <Face name="Interface" note="Front-desk queries">
            <div className="db-grid" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} className="db-cell" />)}</div>
          </Face>
          <Face name="Logic" note="Multi-join queries">
            <ul className="db-steps">{['FROM appointments', 'JOIN patients', 'JOIN staff', 'JOIN billing'].map(s => <li key={s} className="db-step">{s}</li>)}</ul>
          </Face>
          <Face name="Data" note="Normalised tables">
            <ul className="db-tables">{['Patients', 'Staff', 'Appointments', 'Billing'].map(s => <li key={s} className="db-table">{s}</li>)}</ul>
          </Face>
          <Face name="Stack" note={`${DB.status}, ${DB.year}`}><Chips items={DB.stack} /></Face>
        </div>
      </div>
    </div>
  );
}

/* Chapter four, Hotel Management System: a hotel at night builds floor by floor, its windows light up as rooms are
   booked, then the floors pull open like drawers to show each layer, and the lights go out one by one. */
const HT = project('hotel');

export function Hotel({ onProgress }) {
  const ref = useScrub(onProgress, (tl, $) => {
    const floors = $('.ht-floor'), sign = $('.ht-sign'), glows = $('.ht-win b'), house = $('.ht-house'), r = rng(4);
    const lit = glows.map(() => (r() < 0.72 ? 1 : 0.1)); // most rooms booked, a few still free
    tl.add(floors, {
      opacity: [0, 1], translateX: (_, i) => [i % 2 ? '60%' : '-60%', '0%'], translateY: ['-30%', '0%'], filter: ['blur(12px)', 'blur(0px)'], duration: 140,
    }, stagger(40, { from: 'last' }))
      .add(sign, { opacity: [0, 1], duration: 30 }, 230)
      .add(sign, { opacity: 0.3, duration: 10 }, 262)
      .add(sign, { opacity: 1, duration: 14 }, 276)
      .add(glows, { opacity: (_, i) => [0, lit[i]], duration: 30 }, stagger(6, { start: 300, from: 'random' }))
      .add(floors, { translateY: (_, i) => `${(i - 1.5) * 22}%`, rotateX: [0, -16], duration: 160, ease: 'inOutCubic' }, stagger(15, { start: 480 }))
      .add(sign, { translateY: ['0%', '-140%'], duration: 160, ease: 'inOutCubic' }, 470)
      .add(house, { rotateY: [0, 12], duration: 240, ease: 'inOutSine' }, 620)
      .add(floors, { translateY: '0%', rotateX: 0, duration: 90, ease: 'inOutCubic' }, stagger(10, { start: 790, from: 'last' }))
      .add(sign, { translateY: '0%', duration: 90, ease: 'inOutCubic' }, 800)
      .add(house, { rotateY: 0, duration: 90, ease: 'inOutCubic' }, 860)
      .add(glows, { opacity: 0, duration: 20 }, stagger(3, { start: 870, from: 'last' }))
      .add(house, { translateY: ['0%', '25%'], duration: 80, ease: 'inQuad' }, 920)
      .add([...floors, ...sign], { opacity: 0, duration: 70, ease: 'inQuad' }, 930);
  });
  const win = (label, i) => <span key={i} className="ht-win"><b aria-hidden="true" />{label}</span>;
  return (
    <div className="scene sc-ht" ref={ref}>
      <div className="xv">
        <div className="ht-house">
          <p className="ht-sign" aria-hidden="true">Hotel</p>
          <Face name="Interface" note="Rooms and bookings" className="ht-floor">{sample.rooms.map(win)}</Face>
          <Face name="Logic" note="One module for each" className="ht-floor">{['Rooms', 'Bookings', 'Customers', 'Services'].map(win)}</Face>
          <Face name="Data" note="Kept in files" className="ht-floor">{[0, 1, 2, 3, 4, 5].map(i => win(<i className="ht-rec" aria-hidden="true" />, i))}</Face>
          <Face name="Stack" note={`${HT.status}, ${HT.year}`} className="ht-floor ht-ground">
            {win('', 0)}<Chips items={HT.stack} />{win('', 1)}
          </Face>
        </div>
      </div>
    </div>
  );
}

/* Chapter five, this site: the page you are reading pulls back, tips over and separates into its real layers,
   drawn live from the canvases behind it, while the camera circles round. */
const SITE = project('blossom');
const SITE_LAYERS = [
  ['The night', 'One colour, plum-black'],
  ['The tree', 'Canvas, grown from a seed'],
  ['The petals', 'Canvas, on a wind you steer'],
  ['The pages', 'React'],
  ['The scroll', 'Lenis'],
];
const SZ = [-8, -4, 0, 4, 8];

export function Site({ onProgress }) {
  const tree = useRef(null), petals = useRef(null);
  const ref = useScrub(onProgress, (tl, $) => {
    const rig = $('.rig'), layers = $('.st-layer'), tags = $('.tag');
    tl.add(rig, { scale: [1.45, 1], duration: 150 }, 0)
      .add(layers, { opacity: [0, 1], filter: ['blur(18px)', 'blur(0px)'], duration: 140 }, stagger(14))
      .add(rig, { rotateX: [0, 60], rotateZ: [0, -32], scale: 0.8, duration: 170, ease: 'inOutCubic' }, 150)
      .add(layers, { translateZ: (_, i) => [em(i * 0.02), em(SZ[i])], duration: 180 }, stagger(20, { start: 310 }))
      .add(tags, { opacity: [0, 1], translateX: ['-1em', '0em'], translateY: (_, i) => ['0em', em(-SZ[i] * 0.866)], duration: 180 }, stagger(20, { start: 310 }))
      .add($('.st-thumb'), { translateY: ['0%', '300%'], duration: 400, ease: 'inOutSine' }, 400)
      .add(rig, { rotateZ: 26, duration: 250, ease: 'inOutSine' }, 480)
      .add(layers, { translateZ: (_, i) => em(i * 0.02), duration: 120, ease: 'inOutCubic' }, stagger(12, { start: 740, from: 'last' }))
      .add(tags, { opacity: 0, translateY: '0em', duration: 110, ease: 'inOutCubic' }, stagger(12, { start: 740, from: 'last' }))
      .add(rig, { rotateX: 0, rotateZ: 0, scale: 1, duration: 120, ease: 'inOutCubic' }, 770)
      .add(rig, { scale: 2.6, duration: 110, ease: 'inQuad' }, 890)
      .add(layers, { opacity: 0, duration: 90, ease: 'inQuad' }, 905);

    // The tree and petal layers are the real canvases behind this page, copied in each frame the layer is on screen.
    const src = { tree: document.querySelector('canvas.tree'), petals: document.querySelector('canvas.petals') };
    const fit = cv => {
      const k = Math.min(devicePixelRatio, 1.5), w = Math.round(cv.clientWidth * k), h = Math.round(cv.clientHeight * k);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; return true; }
    };
    let n = 0;
    return p => {
      if (p <= 0 || p >= 1) return;
      const both = fit(tree.current) | fit(petals.current);
      if (src.tree && (both || n++ % 12 === 0)) { const g = tree.current.getContext('2d'); g.clearRect(0, 0, tree.current.width, tree.current.height); g.drawImage(src.tree, 0, 0, tree.current.width, tree.current.height); }
      if (src.petals) { const g = petals.current.getContext('2d'); g.clearRect(0, 0, petals.current.width, petals.current.height); g.drawImage(src.petals, 0, 0, petals.current.width, petals.current.height); }
    };
  });
  return (
    <div className="scene sc-site" ref={ref} style={{ '--ar': (innerWidth / innerHeight).toFixed(3) }}>
      <div className="xv">
        <div className="rig" aria-hidden="true">
          <div className="st-layer st-night" />
          <div className="st-layer"><canvas ref={tree} /></div>
          <div className="st-layer"><canvas ref={petals} /></div>
          <div className="st-layer st-page">
            <span className="st-nav">{PAGES.map(([to, label]) => <i key={to}>{label}</i>)}</span>
            <span className="st-name">{content.name.join(' ')}</span>
            <span className="st-role">{content.role}</span>
          </div>
          <div className="st-layer st-scroll"><i className="st-thumb" /></div>
        </div>
      </div>
      <Tags items={SITE_LAYERS} />
      <p className="sr-only">{SITE.description} Built with {SITE.stack.join(', ')}.</p>
    </div>
  );
}

/* The end: a point of light opens into a glass card addressed to Saad, and a gust carries the petals past it. */
const HELLO = 'Say hello.';

export function Closing({ onProgress }) {
  const card = useRef(null);
  const ref = useScrub(onProgress, (tl, $) => {
    tl.add($('.end-spark'), { scale: [0, 1], opacity: [0, 1], duration: 140 }, 0)
      .add($('.end-spark'), { scale: 26, opacity: 0, duration: 200, ease: 'inOutCubic' }, 170)
      .add(card.current, {
        opacity: [0, 1], scale: [0.6, 1], filter: ['blur(20px)', 'blur(0px)'], clipPath: ['circle(0% at 50% 50%)', 'circle(80% at 50% 50%)'], duration: 220,
      }, 180)
      .add($('.end-title span'), { opacity: [0, 1], translateY: ['0.6em', '0em'], duration: 90 }, stagger(14, { start: 300 }))
      .add($('.end-more'), { opacity: [0, 1], translateY: ['1rem', '0rem'], duration: 120 }, stagger(30, { start: 470 }));
    let gusted = false, open = null;
    return p => {
      // One gust each time the card opens, re-armed when the visitor scrolls back above it.
      if (p > 0.18 && !gusted) { gusted = true; scene.current?.gust(innerHeight * 0.45); }
      if (p < 0.1) gusted = false;
      const o = p > 0.42;
      if (o !== open) { open = o; card.current.toggleAttribute('inert', !o); }
    };
  });
  // Under reduced motion the card is simply there.
  useEffect(() => { if (REDUCED) card.current.removeAttribute('inert'); }, []);
  return (
    <div className="scene sc-end" ref={ref}>
      <span className="end-spark" aria-hidden="true" />
      <div className="end-card glass" ref={card}>
        <p className="end-title"><span className="sr-only">{HELLO}</span>{[...HELLO].map((ch, i) => <span key={i} aria-hidden="true">{ch}</span>)}</p>
        <p className="end-text end-more">{content.availability}</p>
        <Link to="/contact" className="action action-primary end-more">Write to Saad<ArrowRight aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
