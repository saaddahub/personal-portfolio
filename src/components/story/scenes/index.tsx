import { ui } from './../../../data/content';
import { useEffect, useRef } from 'react';
import { content } from '../../../data/content';
import { Typewriter } from '../Typewriter';
interface SceneProps { active: boolean; elapsed: number }
function StaticScene() { return <div className="static-scene"><span>{ui.signalSearching}</span><i /><div className="signal-wave" /> <b>{ui.thereYouAre}</b></div>; }
function RoomScene() { return <div className="pixel-room"><div className="pixel-window" /><div className="pixel-clock">{ui.label0217}</div><div className="pixel-desk" /><div className="pixel-monitor"><span>{ui.gt2}</span></div><div className="pixel-person" /><div className="pixel-lamp" /><span className="scene-caption">{ui.somewhereALightIsStillOn}</span></div>; }
function CodeScene({ active }: SceneProps) { return <div className="code-scene"><div className="code-rain" aria-hidden="true">{ui.label010011011011001001}<br />{ui.label1010010100110001}<br />{ui.label011101000100010}</div><pre><Typewriter text={ui.theSmallestPossibleBeginningConstCuriosityTrue} paused={!active} /></pre></div>; }
function WireframeScene({ active }: SceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx) return;
    let frame = 0; let angle = .4; let previous = 0;
    const vertices = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x, y, z])));
    const draw = (now: number) => {
      if (!document.hidden && now - previous > 32) {
        previous = now; angle += active ? .008 : 0; ctx.clearRect(0, 0, 560, 240);
        const points = vertices.map(([x, y, z]) => { const xx = x * Math.cos(angle) - z * Math.sin(angle); const zz = x * Math.sin(angle) + z * Math.cos(angle); const yy = y * Math.cos(.45) - zz * Math.sin(.45); const depth = 4 + y * Math.sin(.45) + zz * Math.cos(.45); return [280 + xx * 245 / depth, 118 + yy * 245 / depth]; });
        ctx.strokeStyle = getComputedStyle(canvas.current!).getPropertyValue('--accent'); ctx.lineWidth = 1;
        vertices.forEach((v, i) => vertices.forEach((w, j) => { if (j > i && v.filter((n, k) => n !== w[k]).length === 1) { ctx.beginPath(); ctx.moveTo(points[i][0], points[i][1]); ctx.lineTo(points[j][0], points[j][1]); ctx.stroke(); } }));
      }
      frame = requestAnimationFrame(draw);
    }; frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, [active]);
  return <div className="wireframe-scene"><canvas width="560" height="240" ref={canvas} /><span>{ui.iteration}{Math.floor(Math.random() * 200) + 1}{ui.stillTurningItOver}</span></div>;
}
function BuildsScene({ elapsed }: SceneProps) { const project = content.projects[Math.min(2, Math.floor(elapsed / 6))]; return <div className="builds-scene" key={project.title}><span>{ui.selectedTransmissionsWorkArchive}</span><h2>{project.title}</h2><p>{project.stack.join(' / ')}</p><div className="build-tape"><i /><i /></div></div>; }
function NowScene() { return <div className="now-scene"><span className="now-disc" aria-hidden="true"><i /></span><div><span>{ui.currentlyInRotation}</span>{content.currently.map(([label, text]) => <p key={label}><b>{label}</b>{text}</p>)}</div></div>; }
function StarsScene({ active }: SceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx) return;
    const stars = Array.from({ length: 95 }, () => ({ x: Math.random() * 560, y: Math.random() * 240, z: Math.random() * 1.4 + .2 })); let frame = 0; let last = 0;
    const draw = (now: number) => { if (!document.hidden && now - last > 32) { last = now; ctx.clearRect(0, 0, 560, 240); ctx.fillStyle = getComputedStyle(canvas.current!).getPropertyValue('--accent'); stars.forEach(star => { if (active) star.y = (star.y + star.z * .2) % 240; ctx.globalAlpha = star.z / 1.6; ctx.fillRect(star.x, star.y, star.z, star.z); }); ctx.globalAlpha = 1; } frame = requestAnimationFrame(draw); }; frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, [active]);
  return <div className="stars-scene"><canvas ref={canvas} width="560" height="240" /><span className="horizon" /><b>{ui.theSignalContinues}<span className="cursor">{ui.symbol8}</span></b></div>;
}
export const scenes = { static: StaticScene, room: RoomScene, code: CodeScene, wireframe: WireframeScene, builds: BuildsScene, now: NowScene, stars: StarsScene };
