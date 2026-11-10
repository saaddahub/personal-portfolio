import { createTimeline } from 'animejs';
import { mine } from './content.js';
import { useScene } from './kit.js';
import './mine.css';

// Chapter four. A deck of glass tiles sits on a tilted table, face down. The top card turns over in place (the
// degree), then the rest are dealt outward from the centre, each lifting, flipping and landing with its shadow
// tightening beneath it, while the table levels to face you. A band of light passes over the finished grid. On the
// way out the tiles lie back row by row, like a deck being put down.
const c = mine.umt;
// [column, row, width, height] on the wide 6×4 grid, then on the narrow 4×6 grid.
const NAME = [[3, 2, 2, 2], [2, 3, 2, 2]];
const SUBJECTS = [
  [[3, 1, 2, 1], [1, 1, 2, 1]], [[1, 2, 2, 1], [3, 2, 2, 1]], [[5, 2, 2, 1], [1, 5, 2, 1]], [[3, 4, 2, 1], [3, 6, 2, 1]],
];
const EMPTY_WIDE = [[1, 1], [2, 1], [5, 1], [6, 1], [1, 3], [2, 3], [5, 3], [6, 3], [1, 4], [2, 4], [5, 4], [6, 4]];
const EMPTY_NARROW = [[3, 1], [4, 1], [1, 2], [2, 2], [1, 3], [4, 3], [1, 4], [4, 4], [3, 5], [4, 5], [1, 6], [2, 6]];
const TOOL_AT = [1, 6, 8, 11, 3]; // which empty tiles carry the tools he builds with

const place = ([[c1, r1, w1, h1], [c2, r2, w2, h2]]) => ({ '--c': c1, '--r': r1, '--w': w1, '--h': h1, '--nc': c2, '--nr': r2, '--nw': w2, '--nh': h2 });

function Tile({ kind, at, children }) {
  return (
    <li className={`mine-tile mine-tile-${kind}`} style={place(at)}>
      <div className="mine-tile-shadow" aria-hidden="true" />
      <div className="mine-tile-card">
        <div className="mine-tile-face">
          <span className="mine-tile-sheen" aria-hidden="true" />
          {children}
        </div>
        <div className="mine-tile-back" aria-hidden="true" />
      </div>
    </li>
  );
}

export default function Umt({ onProgress }) {
  const ref = useScene(onProgress, build);
  return (
    <div className="mine-scene mine-umt" ref={ref}>
      <div className="mine-umt-table">
        <ul className="mine-umt-grid">
          <Tile kind="name" at={NAME}>
            <span className="mine-tile-title">{c.degree}</span>
            <span className="mine-tile-note">{c.place}</span>
            <span className="mine-tile-years">{c.years}</span>
          </Tile>
          {c.subjects.map((s, i) => <Tile key={s} kind="subject" at={SUBJECTS[i]}><span className="mine-tile-title">{s}</span></Tile>)}
          {EMPTY_WIDE.map((wide, i) => {
            const tool = c.tools[TOOL_AT.indexOf(i)];
            return (
              <Tile key={i} kind={tool ? 'tool' : 'empty'} at={[[...wide, 1, 1], [...EMPTY_NARROW[i], 1, 1]]}>
                {tool && <span className="mine-tile-tool">{tool}</span>}
              </Tile>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function build(root, w, h) {
  const grid = root.querySelector('.mine-umt-grid');
  const tiles = [...grid.children];
  const cards = tiles.map(t => t.querySelector('.mine-tile-card'));
  const shadows = tiles.map(t => t.querySelector('.mine-tile-shadow'));
  const sheens = tiles.map(t => t.querySelector('.mine-tile-sheen'));
  // Layout is read once: each tile's offset from the grid's centre, which is where the deck sits.
  const gw = grid.offsetWidth, gh = grid.offsetHeight, cell = Math.min(...tiles.map(t => t.offsetHeight));
  const geo = tiles.map(t => {
    const dx = gw / 2 - (t.offsetLeft + t.offsetWidth / 2), dy = gh / 2 - (t.offsetTop + t.offsetHeight / 2);
    return { dx, dy, dist: Math.hypot(dx, dy), col: t.offsetLeft / gw, row: Math.floor(t.offsetTop / cell + 0.01) };
  });
  const far = Math.max(...geo.map(g => g.dist)) || 1;
  const rank = geo.map((g, i) => i).sort((a, b) => geo[a].dist - geo[b].dist);
  geo.forEach(g => { g.d = g.dist / far; });
  rank.forEach((i, k) => { geo[i].z0 = (tiles.length - k) * 1.6; geo[i].rz = ((k * 7919) % 9) - 4; }); // a slightly messy deck

  const deal = (_, i) => 40 + geo[i].d * 190;
  const tl = createTimeline({ autoplay: false, defaults: { ease: 'outExpo' } })
    // The table levels from a steep tilt to face the visitor, then drifts so light can travel across it.
    .add(grid, { rotateX: [52, 0], y: [h * 0.06, 0], scale: [0.84, 1], duration: 560, ease: 'outCubic' }, 0)
    .add(grid, { rotateY: [0, -5], rotateX: [0, 4], duration: 260, ease: 'inOutSine' }, 560)
    // Dealt outward from the centre: travel on the tile, flip and lift on the card, the shadow on the table.
    .add(tiles, { x: [(_, i) => geo[i].dx, 0], y: [(_, i) => geo[i].dy, 0], duration: 380, delay: deal }, 0)
    .add(cards, {
      rotateY: [180, 0],
      rotateZ: [(_, i) => geo[i].rz, 0],
      z: [{ from: (_, i) => geo[i].z0, to: (_, i) => 70 + geo[i].d * 90, duration: 150, ease: 'outQuad' }, { to: 0, duration: 230 }],
      duration: 380,
      delay: deal,
      ease: 'inOutCubic',
    }, 0)
    .add(shadows, {
      opacity: [{ from: 0.55, to: 0.12, duration: 150, ease: 'outQuad' }, { to: 0.5, duration: 230 }],
      scale: [{ from: 1, to: 1.35, duration: 150, ease: 'outQuad' }, { to: 1, duration: 230 }],
      delay: deal,
    }, 0)
    .add(sheens, { x: ['-130%', '130%'], duration: 380, delay: deal, ease: 'inOutSine' }, 0)
    .add(sheens, { x: ['-130%', '130%'], duration: 240, delay: (_, i) => geo[i].col * 120, ease: 'inOutSine' }, 580)
    // Put down: row by row from the top, each tile lies back on its bottom edge and goes dark.
    .add(cards, { rotateX: [0, 78], z: [0, -60], opacity: [1, 0], duration: 170, delay: (_, i) => geo[i].row * 22, ease: 'inCubic' }, 800)
    .add(shadows, { opacity: 0, duration: 170, delay: (_, i) => geo[i].row * 22, ease: 'inCubic' }, 800)
    .add(grid, { scale: [1, 0.94], y: [0, -h * 0.04], duration: 260, ease: 'inQuad' }, 800);

  let last = -1;
  return {
    render(p) {
      if (p === last) return;
      last = p;
      tl.seek(p * tl.duration);
    },
    destroy() { tl.revert(); },
  };
}
