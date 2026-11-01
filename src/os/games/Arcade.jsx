import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play } from 'lucide-react';
import { createArcade, stepArcade } from './arcade.js';

export default function Arcade({ kind, active }) {
  const canvas = useRef(null), game = useRef(createArcade(kind)), input = useRef({}), [readout, setReadout] = useState({ score: 0, cpuScore: 0, lives: 3, status: 'ready' });
  const running = useRef(active);
  useEffect(() => { running.current = active; }, [active]);
  useEffect(() => {
    const ctx = canvas.current.getContext('2d'); let raf, then = performance.now(), stamp = '';
    const draw = now => {
      raf = requestAnimationFrame(draw);
      const dt = (now - then) / 1000; then = now;
      const g = game.current;
      if (!running.current || document.hidden) return;
      stepArcade(g, input.current, dt);
      const nextStamp = `${g.score}/${g.cpuScore}/${g.lives}/${g.status}`;
      if (stamp !== nextStamp) { stamp = nextStamp; setReadout({ score: g.score, cpuScore: g.cpuScore, lives: g.lives, status: g.status }); }
      ctx.fillStyle = '#111d24'; ctx.fillRect(0, 0, 600, 340);
      ctx.fillStyle = '#e6e7c7';
      if (kind === 'pong') {
        for (let y = 10; y < 340; y += 22) ctx.fillRect(299, y, 2, 9);
        ctx.fillRect(24, g.paddle - 32, 8, 64); ctx.fillRect(568, g.opponent - 32, 8, 64);
      } else {
        const colors = ['#d4654f', '#e6ad54', '#9bbb75', '#67acb4'];
        g.bricks.forEach((on, i) => { if (on) { ctx.fillStyle = colors[Math.floor(i / 8)]; ctx.fillRect(24 + i % 8 * 70, 34 + Math.floor(i / 8) * 25, 62, 17); } });
        ctx.fillStyle = '#e6e7c7'; ctx.fillRect(g.paddle - 46, 308, 92, 8);
      }
      ctx.fillStyle = '#fff8d3'; ctx.fillRect(g.ball.x - 5, g.ball.y - 5, 10, 10);
    };
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf);
  }, [kind]);
  useEffect(() => { if (!active) { input.current = {}; if (game.current.status === 'playing') game.current.status = 'paused'; } }, [active]);
  const toggle = () => { const g = game.current; if (['lost', 'won'].includes(g.status)) game.current = createArcade(kind); game.current.status = game.current.status === 'playing' ? 'paused' : 'playing'; canvas.current.focus({ preventScroll: true }); };
  const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  const move = e => { const r = canvas.current.getBoundingClientRect(); input.current.pointer = kind === 'pong' ? (e.clientY - r.top) / r.height * 340 : (e.clientX - r.left) / r.width * 600; };
  return <div className="game-arcade" onKeyDown={e => { if (keys[e.key]) { e.preventDefault(); input.current.pointer = undefined; input.current[keys[e.key]] = true; } else if (e.code === 'Space' && e.target === canvas.current) { e.preventDefault(); toggle(); } }} onKeyUp={e => { if (keys[e.key]) input.current[keys[e.key]] = false; }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) { input.current = {}; if (game.current.status === 'playing') game.current.status = 'paused'; } }}>
    <div className="game-score"><span>{kind === 'pong' ? `You ${readout.score} : ${readout.cpuScore} Computer` : `Score ${readout.score} · ${readout.lives} lives`}</span><button onClick={toggle}>{readout.status === 'playing' ? <Pause size={15} /> : <Play size={15} />}{readout.status === 'playing' ? 'Pause' : readout.status === 'ready' ? 'Serve' : readout.status === 'paused' ? 'Resume' : 'Play again'}</button></div>
    <div className="game-canvas-wrap"><canvas ref={canvas} width="600" height="340" tabIndex={0} aria-label={`${kind === 'pong' ? 'Pong' : 'Breakout'} playfield. ${kind === 'pong' ? 'Up and down' : 'Left and right'} arrows move. Space serves or pauses.`} onPointerMove={move} onPointerDown={e => { move(e); canvas.current.focus(); }} />{readout.status !== 'playing' && <span className="game-arcade-message" role="status">{readout.status === 'won' ? 'You win.' : readout.status === 'lost' ? 'Good game. Another?' : readout.status === 'paused' ? 'Paused' : 'Ready when you are.'}</span>}</div>
    <div className="game-touch-controls">{(kind === 'pong' ? [['up', ArrowUp], ['down', ArrowDown]] : [['left', ArrowLeft], ['right', ArrowRight]]).map(([key, Icon]) => <button key={key} aria-label={`Move ${key}`} onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); input.current.pointer = undefined; input.current[key] = true; }} onPointerUp={() => { input.current[key] = false; }} onPointerCancel={() => { input.current[key] = false; }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') input.current[key] = true; }} onKeyUp={() => { input.current[key] = false; }}><Icon size={20} /></button>)}</div>
    <p className="game-instructions">{kind === 'pong' ? 'Move with ↑ ↓ or your pointer. First to seven wins.' : 'Move with ← → or your pointer. Clear all 32 bricks.'} Space serves or pauses.</p>
  </div>;
}
