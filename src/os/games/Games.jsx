import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Flag, Pause, Play, RotateCcw, Undo2 } from 'lucide-react';
import Arcade from './Arcade.jsx';
import { library, shuffle, minefield, revealMines, snakeStep, emptyCell, slideTile, slidingPuzzle, moveMerge, addMergeTile, toggleLights, lightsPuzzle, starPoints, starEdges, traceStar, orbitHit } from './logic.js';
import './games.css';

export function GameGlyph({ name, size = 64 }) {
  return <svg width={size} height={size} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    {name === 'mines' ? <><circle cx="40" cy="40" r="16" fill="currentColor" />{[0, 45, 90, 135].map(a => <path key={a} d="M40 12v56" transform={`rotate(${a} 40 40)`} />)}<rect x="33" y="31" width="6" height="6" fill="var(--game-paper, #e7e5da)" stroke="none" /></> :
      name === 'snake' ? <><path d="M16 58h32V42H24V25h34" strokeWidth="10" strokeLinejoin="miter" /><rect x="55" y="18" width="13" height="13" fill="currentColor" /><circle cx="62" cy="22" r="1.5" fill="var(--game-paper, #e7e5da)" stroke="none" /><rect x="56" y="50" width="9" height="9" /></> :
        name === 'breakout' ? <>{[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={12 + i % 3 * 20} y={15 + Math.floor(i / 3) * 14} width="16" height="9" fill={i % 2 ? 'none' : 'currentColor'} />)}<path d="m38 54 10-15" /><rect x="28" y="64" width="29" height="4" fill="currentColor" /><circle cx="38" cy="54" r="4" fill="currentColor" /></> :
          name === 'pong' ? <><path d="M14 18v24m52-4v24M40 10v60" strokeDasharray="6 5" /><path d="M14 18v24m52-4v24" strokeWidth="6" /><rect x="46" y="30" width="7" height="7" fill="currentColor" /></> :
            name === 'memory' ? <><rect x="13" y="18" width="25" height="39" /><rect x="43" y="24" width="25" height="39" /><path d="m25 29 7 9-7 9-7-9z" fill="currentColor" /><path d="m55 35 7 9-7 9-7-9z" fill="currentColor" /></> :
              name === 'fifteen' || name === 'merge' ? <>{[0, 1, 2, 3].map(i => <rect key={i} x={14 + i % 2 * 28} y={14 + Math.floor(i / 2) * 28} width="23" height="23" rx={name === 'merge' ? 5 : 0} fill={i === 3 ? 'none' : 'currentColor'} opacity={i === 2 ? .45 : 1} />)}</> :
                name === 'orbit' ? <><circle cx="40" cy="40" r="25" opacity=".4" /><path d="M40 15a25 25 0 0 1 25 25" strokeWidth="6" /><circle cx="17" cy="49" r="5" fill="currentColor" /><circle cx="40" cy="40" r="3" /></> :
                  name === 'lights' || name === 'sequence' ? <>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={16 + i % 3 * 18} y={16 + Math.floor(i / 3) * 18} width="12" height="12" rx="3" fill={[1, 3, 4, 7].includes(i) ? 'currentColor' : 'none'} opacity={i === 4 ? 1 : .5} />)}</> :
                    name === 'constellation' ? <><path d="m16 54 14-37 35 14-12 34-37-11 49-23M30 17l23 48" opacity=".5" />{[[16, 54], [30, 17], [65, 31], [53, 65]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill="currentColor" />)}</> :
                      <>{[0, 1, 2, 3].map(i => <circle key={i} cx={26 + i % 2 * 28} cy={26 + Math.floor(i / 2) * 28} r="12" fill="currentColor" opacity={i === 1 ? .45 : 1} />)}</>}
  </svg>;
}

export default function Games({ era, active = true }) {
  const [selected, setSelected] = useState(null), [round, setRound] = useState(0), panel = useRef(null);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => { const changed = () => setVisible(!document.hidden); document.addEventListener('visibilitychange', changed); return () => document.removeEventListener('visibilitychange', changed); }, []);
  const game = library[era].find(g => g.id === selected);
  useEffect(() => { if (game) (panel.current?.querySelector('[tabindex="0"]') || panel.current)?.focus({ preventScroll: true }); }, [game, round]);
  const choose = id => { setSelected(id); setRound(0); };
  const gameProps = { active: active && visible, key: `${selected}-${round}` };
  const view = !game ? null : selected === 'mines' ? <Mines {...gameProps} /> : selected === 'snake' ? <Snake {...gameProps} /> : ['breakout', 'pong'].includes(selected) ? <Arcade kind={selected} {...gameProps} /> : selected === 'memory' ? <Memory {...gameProps} /> : selected === 'fifteen' ? <Fifteen {...gameProps} /> : selected === 'orbit' ? <Orbit {...gameProps} /> : selected === 'merge' ? <Merge {...gameProps} /> : selected === 'lights' ? <Lights {...gameProps} /> : selected === 'sequence' ? <Sequence {...gameProps} /> : selected === 'constellation' ? <Constellation {...gameProps} /> : <Chromatic {...gameProps} />;
  return <div className={`os-games ${era === '98' ? 'games-classic' : 'games-modern'}`}>
    {game ? <><header className="games-toolbar"><button onClick={() => setSelected(null)}><ArrowLeft size={16} /> All games</button><strong>{game.name}</strong><button onClick={() => setRound(n => n + 1)} aria-label="New game"><RotateCcw size={16} /><span>New game</span></button></header><div className="game-stage" ref={panel} tabIndex={-1}>{!active && <div className="game-inactive" role="status">Game paused · return to this window to play</div>}{view}</div></> : <>
      <header className="games-library-heading"><div><h1>{era === '98' ? 'Games' : <>A little <em>play.</em></>}</h1><p>{era === '98' ? 'Six classics. No installation required.' : 'A change of pace, a different kind of focus.'}</p></div><span>{era === '98' ? 'Rowan 98' : 'Rowan collection'}</span></header>
      <div className="games-library">{library[era].map(g => <button key={g.id} onClick={() => choose(g.id)} aria-label={`Play ${g.name}`}><span className={`game-art game-art-${g.id}`}><GameGlyph name={g.glyph} /></span><span className="game-description"><strong>{g.name}</strong><small>{g.description}</small><span>{g.kind}</span></span><ArrowRight size={18} /></button>)}</div>
      <footer className="games-library-footer">{era === '98' ? 'Select a game to begin.' : 'Six small worlds. Stay a while.'}<span>Keyboard & touch</span></footer>
    </>}
  </div>;
}

function useTick(callback, delay, active) {
  const latest = useRef(callback);
  useEffect(() => { latest.current = callback; }, [callback]);
  useEffect(() => { if (!active || !delay) return; const timer = setInterval(() => { if (!document.hidden) latest.current(); }, delay); return () => clearInterval(timer); }, [delay, active]);
}
function Outcome({ children }) { return <p className="game-outcome" role="status">{children}</p>; }
function DirectionPad({ move }) {
  return <div className="game-dpad">{[['up', ArrowUp], ['left', ArrowLeft], ['down', ArrowDown], ['right', ArrowRight]].map(([d, Icon]) => <button key={d} onClick={() => move(d)} aria-label={`Move ${d}`}><Icon size={20} /></button>)}</div>;
}

function Mines({ active }) {
  const [board, setBoard] = useState(null), [revealed, setRevealed] = useState(new Set()), [flags, setFlags] = useState(new Set()), [flagging, setFlagging] = useState(false), [lost, setLost] = useState(false), [time, setTime] = useState(0);
  const won = revealed.size === 54 && !lost;
  useTick(() => setTime(n => n + 1), board && !lost && !won ? 1000 : null, active);
  const flag = i => { if (lost || won || revealed.has(i)) return; setFlags(old => { const next = new Set(old); if (next.has(i)) next.delete(i); else if (next.size < 10) next.add(i); return next; }); };
  const reveal = i => {
    if (flagging) return flag(i);
    if (lost || won || flags.has(i) || revealed.has(i)) return;
    const field = board || minefield(i); if (!board) setBoard(field);
    if (field[i] === -1) { setLost(true); return; }
    setRevealed(revealMines(field, revealed, flags, i));
  };
  return <><div className="game-score"><span>{10 - flags.size} mines · {String(time).padStart(3, '0')} sec</span><button aria-pressed={flagging} onClick={() => setFlagging(!flagging)}><Flag size={15} />{flagging ? 'Flagging' : 'Flag mode'}</button></div><div className="game-mine-grid" role="group" aria-label="Minesweeper board">{Array.from({ length: 64 }, (_, i) => { const shown = revealed.has(i), mine = lost && board[i] === -1; return <button key={i} className={`${shown ? 'revealed' : ''} ${mine ? 'exploded' : ''}`} data-number={shown ? board[i] : undefined} onClick={() => reveal(i)} onContextMenu={e => { e.preventDefault(); flag(i); }} aria-label={`Row ${Math.floor(i / 8) + 1}, column ${i % 8 + 1}: ${mine ? 'mine' : flags.has(i) ? 'flagged' : shown ? `${board[i]} nearby mines` : 'unopened'}`} disabled={won || lost}>{mine ? <GameGlyph name="mines" size={19} /> : flags.has(i) ? <Flag size={16} fill="#bd282b" /> : shown && board[i] > 0 ? board[i] : ''}</button>; })}</div><Outcome>{lost ? 'A mine. New game, fresh start.' : won ? 'All clear. Nicely done.' : 'First click is safe. Read the numbers, find the mines.'}</Outcome><p className="game-instructions">Click to reveal. Right-click or use Flag mode to mark a mine.</p></>;
}

function Snake({ active }) {
  const [game, setGame] = useState({ snake: [104, 103, 102], food: 110, score: 0, status: 'ready' }), direction = useRef([1, 0]), pending = useRef([1, 0]);
  const vectors = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
  const move = d => { const v = vectors[d]; if (v[0] !== -direction.current[0] || v[1] !== -direction.current[1]) pending.current = v; };
  useTick(() => setGame(g => {
    direction.current = pending.current;
    const next = snakeStep(g.snake, direction.current, g.food);
    if (next.dead) return { ...g, status: 'lost' };
    const food = next.ate ? emptyCell(next.snake, 196) : g.food;
    return { ...g, snake: next.snake, food, score: g.score + Number(next.ate), status: food < 0 ? 'won' : 'playing' };
  }), game.status === 'playing' ? Math.max(85, 165 - game.score * 4) : null, active);
  const toggle = () => setGame(g => ({ ...g, status: g.status === 'playing' ? 'paused' : 'playing' }));
  return <div className="game-snake" tabIndex={0} aria-label="Snake. Arrow keys steer; space pauses." onKeyDown={e => { const d = e.key.replace('Arrow', '').toLowerCase(); if (vectors[d]) { e.preventDefault(); move(d); } else if (e.code === 'Space' && e.target === e.currentTarget && !['lost', 'won'].includes(game.status)) { e.preventDefault(); toggle(); } }}>
    <div className="game-score"><span>Apples {game.score}</span><button onClick={toggle} disabled={['lost', 'won'].includes(game.status)}>{game.status === 'playing' ? <Pause size={15} /> : <Play size={15} />}{game.status === 'playing' ? 'Pause' : game.status === 'ready' ? 'Start' : 'Resume'}</button></div><svg className="game-snake-field" viewBox="0 0 280 280" aria-label={`Snake length ${game.snake.length}, score ${game.score}`} role="img"><rect width="280" height="280" fill="#b7c398" />{game.snake.map((p, i) => <rect key={p} x={p % 14 * 20 + 1} y={Math.floor(p / 14) * 20 + 1} width="18" height="18" fill={i === 0 ? '#1b3222' : '#3d5736'} />)}<rect x={game.food % 14 * 20 + 3} y={Math.floor(game.food / 14) * 20 + 3} width="14" height="14" fill="#903d2d" /></svg><Outcome>{game.status === 'lost' ? 'End of the line. Try a new game.' : game.status === 'won' ? 'Every square. Incredible.' : game.status === 'ready' ? 'Take a breath. Then press Start.' : game.status === 'paused' ? 'Paused' : 'Keep growing. Keep moving.'}</Outcome><DirectionPad move={move} /><p className="game-instructions">Arrow keys or the buttons steer. Avoid the edges and your own tail.</p>
  </div>;
}

function Memory({ active }) {
  const [deck] = useState(() => shuffle([...Array(6).keys(), ...Array(6).keys()])), [flipped, setFlipped] = useState([]), [matched, setMatched] = useState(new Set()), [moves, setMoves] = useState(0);
  useEffect(() => { if (flipped.length !== 2 || !active) return; const timer = setTimeout(() => { if (deck[flipped[0]] === deck[flipped[1]]) setMatched(old => new Set([...old, ...flipped])); setFlipped([]); }, 650); return () => clearTimeout(timer); }, [flipped, active, deck]);
  const shapes = ['orbit', 'merge', 'lights', 'constellation', 'pong', 'fifteen'];
  return <><div className="game-score"><span>{matched.size / 2} / 6 pairs</span><span>{moves} turns</span></div><div className="game-memory-grid">{deck.map((n, i) => { const visible = flipped.includes(i) || matched.has(i); return <button key={i} className={`${visible ? 'face-up' : ''} ${matched.has(i) ? 'matched' : ''}`} aria-label={`Card ${i + 1}${visible ? `, symbol ${n + 1}${matched.has(i) ? ', matched' : ''}` : ', face down'}`} disabled={matched.has(i)} onClick={() => { if (flipped.length >= 2 || flipped.includes(i)) return; if (flipped.length) setMoves(m => m + 1); setFlipped([...flipped, i]); }}>{visible ? <GameGlyph name={shapes[n]} size={40} /> : <span className="game-card-back" />}</button>; })}</div><Outcome>{matched.size === 12 ? `Every pair found in ${moves} turns.` : 'Turn two cards. Remember what you see.'}</Outcome></>;
}

function Fifteen() {
  const [board, setBoard] = useState(slidingPuzzle), [moves, setMoves] = useState(0), won = board.every((n, i) => n === (i + 1) % 16);
  const move = i => { if (won) return; const next = slideTile(board, i); if (next !== board) { setBoard(next); setMoves(n => n + 1); } };
  return <div tabIndex={0} className="game-puzzle" aria-label="Fifteen puzzle. Arrow keys move the empty square." onKeyDown={e => { const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[e.key]; if (delta) { e.preventDefault(); const index = board.indexOf(0) + delta; if (index >= 0 && index < 16) move(index); } }}><div className="game-score"><span>{moves} moves</span><span>1 → 15</span></div><div className="game-tile-grid game-fifteen">{board.map((n, i) => <button key={i} className={n ? '' : 'empty'} disabled={!n || won} onClick={() => move(i)} aria-label={n ? `Tile ${n}` : 'Empty space'}>{n || ''}</button>)}</div><Outcome>{won ? `Everything in place. ${moves} moves.` : 'Slide the numbers into order, with the empty space last.'}</Outcome><p className="game-instructions">Select a tile beside the empty space, or use the arrow keys.</p></div>;
}

function Orbit({ active }) {
  const [game, setGame] = useState({ score: 0, lives: 3, target: 1.5, status: 'ready', message: 'Catch the light as it passes the arc.' }), angle = useRef(0), dot = useRef(null), state = useRef(game);
  useEffect(() => { state.current = game; }, [game]);
  useEffect(() => {
    if (!active || game.status !== 'playing') return;
    let raf, previous = performance.now();
    const frame = now => { raf = requestAnimationFrame(frame); const dt = Math.min(now - previous, 32); previous = now; if (document.hidden) return; angle.current = (angle.current + dt * (.0014 + state.current.score * .00012)) % (Math.PI * 2); dot.current?.setAttribute('transform', `rotate(${angle.current * 180 / Math.PI} 150 150)`); };
    raf = requestAnimationFrame(frame); return () => cancelAnimationFrame(raf);
  }, [active, game.status]);
  const tolerance = Math.max(.12, .38 - game.score * .014), targetDegrees = game.target * 180 / Math.PI;
  const catchLight = () => {
    if (game.status !== 'playing') return setGame({ ...game, status: 'playing' });
    if (orbitHit(angle.current, game.target, tolerance)) setGame({ ...game, score: game.score + 1, target: (game.target + 1 + Math.random() * 3) % (Math.PI * 2), message: 'Perfect. Find the next moment.' });
    else setGame({ ...game, lives: game.lives - 1, status: game.lives === 1 ? 'lost' : 'playing', message: game.lives === 1 ? 'A good orbit. Try a new game.' : 'A little early. Or a little late.' });
  };
  return <div className="game-orbit" tabIndex={0} aria-label="Orbit. Press space when the moving light reaches the highlighted arc." onKeyDown={e => { if (e.code === 'Space' && e.target === e.currentTarget && game.status !== 'lost') { e.preventDefault(); catchLight(); } }}><div className="game-score"><span>{game.score} caught</span><span>{game.lives} chances</span></div><svg viewBox="0 0 300 300" className="game-orbit-field" aria-hidden="true"><circle cx="150" cy="150" r="106" className="orbit-track" /><circle cx="150" cy="150" r="106" className="orbit-target" strokeDasharray={`${tolerance * 212} ${Math.PI * 212}`} transform={`rotate(${targetDegrees - tolerance * 180 / Math.PI} 150 150)`} /><circle cx="150" cy="150" r="55" className="orbit-inner" /><g ref={dot}><circle cx="256" cy="150" r="9" className="orbit-dot" /></g><text x="150" y="161" textAnchor="middle">{game.score.toString().padStart(2, '0')}</text></svg><button className="game-action" onClick={catchLight} disabled={game.status === 'lost'}>{game.status === 'ready' ? 'Begin orbit' : 'Catch the light'}<span>Space</span></button><Outcome>{game.message}</Outcome></div>;
}

function Merge() {
  const [game, setGame] = useState(() => ({ board: addMergeTile(addMergeTile(Array(16).fill(0))), score: 0 })), [previous, setPrevious] = useState(null), touch = useRef(null);
  const won = game.board.includes(2048), ended = ['left', 'right', 'up', 'down'].every(d => !moveMerge(game.board, d).changed);
  const move = direction => { const result = moveMerge(game.board, direction); if (!result.changed || won) return; setPrevious(game); setGame({ board: addMergeTile(result.board), score: game.score + result.score }); };
  return <div className="game-puzzle game-merge" tabIndex={0} aria-label="Merge. Arrow keys combine matching numbers." onKeyDown={e => { const d = e.key.replace('Arrow', '').toLowerCase(); if (['left', 'right', 'up', 'down'].includes(d)) { e.preventDefault(); move(d); } }} onTouchStart={e => { touch.current = [e.touches[0].clientX, e.touches[0].clientY]; }} onTouchEnd={e => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current[0], dy = e.changedTouches[0].clientY - touch.current[1]; if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up'); touch.current = null; }}><div className="game-score"><span>Score {game.score}</span><button disabled={!previous} onClick={() => { setGame(previous); setPrevious(null); }}><Undo2 size={15} /> Undo</button></div><div className="game-tile-grid game-merge-board" role="img" aria-label={game.board.map(n => n || 'empty').join(', ')}>{game.board.map((n, i) => <span key={i} className={`merge-tile ${n ? 'filled' : ''}`} style={{ '--tile-depth': Math.min(10, Math.log2(n || 1)) }} data-value={n}>{n || ''}</span>)}</div><Outcome>{won ? '2048. Room for something bigger.' : ended ? 'No moves left. Undo, or begin again.' : 'Bring like numbers together. Reach 2048.'}</Outcome><DirectionPad move={move} /><p className="game-instructions">Arrow keys, swipe, or the buttons. Each move brings a new tile.</p></div>;
}

function Lights() {
  const [board, setBoard] = useState(lightsPuzzle), [moves, setMoves] = useState(0), won = !board.some(Boolean);
  return <><div className="game-score"><span>{board.filter(Boolean).length} lights on</span><span>{moves} moves</span></div><div className="game-lights-grid">{board.map((on, i) => <button key={i} aria-label={`Light ${i + 1}, ${on ? 'on' : 'off'}`} aria-pressed={on} disabled={won} className={on ? 'lit' : ''} onClick={() => { setBoard(toggleLights(board, i)); setMoves(m => m + 1); }}><span /></button>)}</div><Outcome>{won ? `Quiet at last. ${moves} moves.` : 'Switch them all off. Each touch changes its neighbors, too.'}</Outcome><p className="game-instructions">A light and its four adjacent neighbors change together. Every board is solvable.</p></>;
}

function Sequence({ active }) {
  const [sequence, setSequence] = useState(() => Array.from({ length: 3 }, () => Math.floor(Math.random() * 9))), [phase, setPhase] = useState('ready'), [flash, setFlash] = useState(-1), [cursor, setCursor] = useState(0), [replay, setReplay] = useState(0);
  useEffect(() => {
    if (phase !== 'watch' || !active) return;
    const timers = [setTimeout(() => setFlash(-1), 0)];
    sequence.forEach((n, i) => { timers.push(setTimeout(() => setFlash(n), 450 + i * 750)); timers.push(setTimeout(() => setFlash(-1), 900 + i * 750)); });
    timers.push(setTimeout(() => { setCursor(0); setPhase('repeat'); }, 500 + sequence.length * 750));
    return () => timers.forEach(clearTimeout);
  }, [sequence, phase, active, replay]);
  const tap = n => {
    if (phase !== 'repeat') return;
    if (sequence[cursor] !== n) { setPhase('lost'); return; }
    if (cursor === sequence.length - 1) { setPhase('success'); setCursor(cursor + 1); } else setCursor(cursor + 1);
  };
  return <><div className="game-score"><span>Pattern {sequence.length - 2}</span><span>{phase === 'repeat' ? `${cursor} / ${sequence.length}` : `${sequence.length} lights`}</span></div><div className="game-sequence-grid">{Array.from({ length: 9 }, (_, i) => <button key={i} className={flash === i ? 'lit' : ''} disabled={phase !== 'repeat' || !active} onClick={() => tap(i)} aria-label={`Pad ${i + 1}${flash === i ? ', illuminated' : ''}`}><span>{i + 1}</span></button>)}</div><Outcome>{phase === 'watch' ? 'Watch the pattern.' : phase === 'repeat' ? 'Your turn. Follow the same order.' : phase === 'lost' ? 'The pattern slipped away. Try it once more.' : phase === 'success' ? 'Remembered. Ready for one more?' : 'A few moments of attention.'}</Outcome>{phase !== 'repeat' && phase !== 'watch' && <button className="game-action" onClick={() => { if (phase === 'success') setSequence(s => [...s, Math.floor(Math.random() * 9)]); setCursor(0); setReplay(n => n + 1); setPhase('watch'); }}>{phase === 'success' ? 'Next pattern' : phase === 'lost' ? 'Try this pattern again' : 'Show the pattern'}</button>}<p className="game-instructions">Watch the illuminated pads, then select them in the same order. Each round adds one.</p></>;
}

function Constellation() {
  const [path, setPath] = useState([]), [message, setMessage] = useState('Choose any star. Draw every connection once.'), won = path.length - 1 === starEdges.length;
  const used = (a, b) => path.slice(1).some((p, i) => path[i] === a && p === b || path[i] === b && p === a);
  return <><div className="game-score"><span>{Math.max(0, path.length - 1)} / {starEdges.length} connections</span><button disabled={!path.length} onClick={() => { setPath(p => p.slice(0, -1)); setMessage('One step back. A new possibility.'); }}><Undo2 size={15} /> Undo</button></div><div className="game-stars"><svg viewBox="0 0 300 300" aria-hidden="true">{starEdges.map(([a, b]) => <line key={`${a}-${b}`} x1={starPoints[a][0]} y1={starPoints[a][1]} x2={starPoints[b][0]} y2={starPoints[b][1]} className={used(a, b) ? 'traced' : ''} />)}</svg>{starPoints.map(([x, y], i) => <button key={i} style={{ left: `${x / 3}%`, top: `${y / 3}%` }} className={path.at(-1) === i ? 'current' : ''} aria-label={`Star ${i + 1}${path.at(-1) === i ? ', current star' : ''}`} disabled={won} onClick={() => { const next = traceStar(path, i); if (next === path) setMessage('Follow a connecting line you have not drawn yet.'); else { setPath(next); setMessage('Keep the thread. Every line, only once.'); } }}>{i + 1}</button>)}</div><Outcome>{won ? 'Every star, connected. Beautifully done.' : message}</Outcome><p className="game-instructions">Select connected stars in one continuous trail. Lines cannot be reused. Undo is always there.</p></>;
}

function Chromatic() {
  const [game, setGame] = useState(() => nextColor(1, 3)), ended = game.lives === 0;
  function nextColor(level, lives) { const size = Math.min(6, 2 + Math.floor(level / 3)); return { level, lives, size, odd: Math.floor(Math.random() * size * size), hue: Math.floor(Math.random() * 360) }; }
  return <><div className="game-score"><span>Level {game.level}</span><span>{game.lives} chances</span></div><div className="game-chromatic-grid" style={{ gridTemplateColumns: `repeat(${game.size}, 1fr)` }}>{Array.from({ length: game.size ** 2 }, (_, i) => <button key={i} aria-label={`Color tile ${i + 1}`} disabled={ended} style={{ backgroundColor: `hsl(${game.hue} 36% ${i === game.odd ? 55 + Math.max(3, 18 - game.level) : 55}%)` }} onClick={() => setGame(i === game.odd ? nextColor(game.level + 1, game.lives) : { ...game, lives: game.lives - 1 })} />)}</div><Outcome>{ended ? `Your eye took you to level ${game.level}. Try a new game.` : 'One shade is different. Trust your eye.'}</Outcome><p className="game-instructions">Find the lighter tile. The difference gets smaller as you go. Three chances.</p></>;
}
