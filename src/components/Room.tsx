import { ui } from './../data/content';
import { useEffect, useRef, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Monitor } from './Monitor';
import { content } from '../data/content';
import { story } from '../data/story';
import { monitor, useMonitor } from '../store/useMonitor';
import { useHashChannel } from '../hooks/useHashChannel';
import { useKeyboardRemote } from '../hooks/useKeyboardRemote';

export function Room() {
  const state = useMonitor(); const reduced = useReducedMotion(); const room = useRef<HTMLElement>(null);
  useHashChannel(); useKeyboardRemote();
  const mode = state.storyMode && state.storyTint ? story[state.chapter].mood : state.colourMode;
  useEffect(() => {
    const hidden = () => room.current?.classList.toggle('tab-hidden', document.hidden);
    document.addEventListener('visibilitychange', hidden); return () => document.removeEventListener('visibilitychange', hidden);
  }, []);
  return <main ref={room} className={`room colour-${mode} ${state.power ? 'powered' : ''} ${state.storyMode ? 'story-room' : ''} ${reduced ? 'reduced' : ''} ${state.plain ? 'plain' : ''}`} style={{ '--brightness': state.brightness / 100 } as CSSProperties}
    onPointerMove={event => {
      if (reduced) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--mouse-x', String((event.clientX / bounds.width - .5) * 2));
      event.currentTarget.style.setProperty('--mouse-y', String((event.clientY / bounds.height - .5) * 2));
    }}>
    <button className="skip-plain" onClick={() => { if (!state.plain) monitor.plain(); document.getElementById('tube-content')?.focus(); }}>{ui.skipEffectsPlainReadingMode}</button>
    <div className="room-grain" aria-hidden="true" /><div className="light-spill" aria-hidden="true" />
    <div className="lamp-glow" aria-hidden="true" /><div className="desk" aria-hidden="true"><div className="desk-reflection" /></div>
    <div className="room-top"><span>{ui.sa01PersonalComputing}</span><span>{ui.est2026}</span></div>
    <Monitor />
    <motion.footer className="room-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 1.8 }}><span>{content.footer[0]}</span><span>{content.footer[1]}</span></motion.footer>
    <div className="remote-hint"><button onClick={monitor.help}>{ui.remoteGuide2}</button><span>{ui.designedToBeTuned}</span></div>
  </main>;
}
