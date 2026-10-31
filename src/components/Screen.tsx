import { ui } from './../data/content';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { monitor, useMonitor } from '../store/useMonitor';
import { channels } from '../data/content';
import { useIdle } from '../hooks/useIdle';
import { BootSequence } from './BootSequence';
import { PowerAnimation } from './PowerAnimation';
import { StaticBurst } from './StaticBurst';
import { TestCard } from './TestCard';
import { Osd } from './Osd';
import { StoryLauncher } from './story/StoryLauncher';
import { sfx } from '../audio/sfx';

const StoryMode = lazy(() => import('./story/StoryMode'));
const PortfolioScreen = lazy(() => import('./PortfolioScreen'));
export function Screen() {
  const state = useMonitor(); const reduced = useReducedMotion(); const canvas = useRef<HTMLCanvasElement>(null);
  const [degrade, setDegrade] = useState(0); const [jitter, setJitter] = useState(false);
  const idle = useIdle(state.power && state.booted && !state.storyMode); const View = state.channel === 0 ? StoryLauncher : TestCard;
  useEffect(() => {
    if (!state.power || reduced || state.plain || (state.storyMode && state.textOnly)) return;
    let frame = 0, previous = 0, elapsed = 0, frames = 0; let lastNoise = 0;
    const ctx = canvas.current?.getContext('2d'); const noise = ctx?.createImageData(160, 120);
    const draw = (time: number) => {
      if (!document.hidden) {
        if (previous) { elapsed += time - previous; frames++; }
        if (elapsed >= 2000) { if (elapsed / frames > 24) setDegrade(v => Math.min(3, v + 1)); elapsed = 0; frames = 0; }
        if (degrade < 3 && ctx && noise && time - lastNoise >= 83) {
          lastNoise = time;
          for (let i = 0; i < noise.data.length; i += 4) { const value = Math.random() * 255; noise.data[i] = value; noise.data[i + 1] = value; noise.data[i + 2] = value; noise.data[i + 3] = 255; }
          ctx.putImageData(noise, 0, 0);
        }
        previous = time;
      } else previous = 0;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, [state.power, reduced, state.plain, degrade, state.storyMode, state.textOnly]);
  useEffect(() => {
    if (!state.power || reduced || state.plain || (state.storyMode && state.textOnly)) { setJitter(false); return; }
    let timer: ReturnType<typeof setTimeout>; let reset: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => { if (!document.hidden) { setJitter(true); reset = setTimeout(() => setJitter(false), 80); } schedule(); }, 15000 + Math.random() * 25000); }; schedule();
    return () => { clearTimeout(timer); clearTimeout(reset); };
  }, [state.power, reduced, state.plain, state.storyMode, state.textOnly]);
  const [motionAccess, setMotionAccess] = useState(false);
  async function enableTilt() {
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    try { if (orientation.requestPermission && await orientation.requestPermission() !== 'granted') { monitor.announce(ui.motionAccessDeclined); return; } setMotionAccess(true); monitor.announce(ui.glassMotionEnabled); } catch { monitor.announce(ui.motionSensorUnavailable); }
  }
  useEffect(() => {
    if (!motionAccess || reduced) return;
    const move = (event: DeviceOrientationEvent) => { const root = canvas.current?.closest<HTMLElement>('.room'); root?.style.setProperty('--mouse-x', String(Math.max(-1, Math.min(1, (event.gamma ?? 0) / 30)))); root?.style.setProperty('--mouse-y', String(Math.max(-1, Math.min(1, ((event.beta ?? 45) - 45) / 30)))); };
    window.addEventListener('deviceorientation', move); return () => window.removeEventListener('deviceorientation', move);
  }, [motionAccess, reduced]);
  return <div className={`screen phase-${state.phase} degrade-${degrade} ${jitter ? 'jitter' : ''} ${state.storyMode ? 'story-screen' : ''}`} onClick={() => { if (Math.random() > .8) sfx.play('type'); }}>
    <svg width="0" height="0" className="filter-definitions" aria-hidden="true"><defs><filter id="barrel" x="-3%" y="-3%" width="106%" height="106%"><feImage href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cdefs%3E%3CradialGradient id='r'%3E%3Cstop stop-color='%23808080'/%3E%3Cstop offset='1' stop-color='%23b0b0b0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='256' height='256' fill='url(%23r)'/%3E%3C/svg%3E" result="map" /><feDisplacementMap in="SourceGraphic" in2="map" scale="12" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
    <div className="picture" aria-hidden={!state.power}>
      {(state.power || state.phase === 'stopping') && <>
        {!state.booted ? <BootSequence /> : state.storyMode ? <Suspense fallback={<div className="signal-lock">{ui.loadingTape}</div>}><StoryMode /></Suspense> : state.channel > 0 && state.channel < 7 ? <Suspense fallback={<div className="signal-lock">{ui.openingArchive}</div>}><PortfolioScreen /></Suspense> : <>
          <header className="screen-header"><span>{ui.sa01PersonalSignal}</span><span><i className="on-air-dot" />{ui.onAir}<b>{String(state.channel).padStart(2, '0')}</b></span></header>
          <div id="tube-content" className="tube-content" tabIndex={-1}>
            <AnimatePresence mode="sync" initial={false}><motion.div className="channel-view" key={state.channel} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, skewX: -2 }} animate={{ opacity: 1, y: 0, skewX: 0 }} exit={{ opacity: 0, filter: 'blur(2px)' }} transition={{ duration: .18 }}><View /></motion.div></AnimatePresence>
          </div>
          <footer className="screen-footer"><span>{ui.ch}{String(state.channel).padStart(2, '0')}{ui.symbol10}{channels[state.channel] ?? ui.noSignal}</span><button onClick={monitor.help}>{ui.help}</button><span>{ui.tuneIn}</span></footer>
        </>}
        {idle && <div className="screensaver"><div>{ui.sa013}<span>{ui.aPersonalSignal}</span></div></div>}
        <Osd />
      </>}
    </div>
    <div className="effects" aria-hidden="true"><div className="bloom" /><div className="refresh-bar" /><div className="scanlines" /><div className="rgb-mask" /><canvas ref={canvas} width="160" height="120" className="screen-noise" /><div className="vignette" /></div>
    <div className="glass" aria-hidden="true"><div className="window-reflection" /><div className="secondary-reflection" /><div className="specular" /><div className="glass-smudge" /></div>
    {state.power && !(state.storyMode && state.textOnly) && <StaticBurst signal={state.glitch} />}<PowerAnimation phase={state.phase} />
    {!state.power && <div className="off-mark">{ui.personalSignalStandby}</div>}
    {!reduced && typeof DeviceOrientationEvent !== 'undefined' && !motionAccess && matchMedia(ui.pointerCoarse).matches && <button className="motion-access" onClick={enableTilt} aria-label={ui.enableGlassMotionUsingDeviceTilt}>{ui.tilt}</button>}
  </div>;
}
