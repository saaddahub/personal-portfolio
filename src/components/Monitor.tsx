import { ui, messages } from './../data/content';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bezel } from './Bezel';
import { ControlPanel } from './ControlPanel';
import { monitor } from '../store/useMonitor';
import { sfx } from '../audio/sfx';

export function Monitor() {
  const reduced = useReducedMotion(); const screws = useRef(new Set<number>());
  const [knock, setKnock] = useState(false); const restoreTimer = useRef<ReturnType<typeof setTimeout>>();
  const angles = useRef(Array.from({ length: 4 }, () => Math.random() * 90));
  useEffect(() => {
    const land = setTimeout(() => sfx.play('land'), reduced ? 0 : 1450);
    const power = setTimeout(() => { if (!monitor.get().power) monitor.power(); }, reduced ? 50 : 2200);
    return () => { clearTimeout(land); clearTimeout(power); clearTimeout(restoreTimer.current); };
  }, [reduced]);
  function screw(index: number) {
    sfx.play('button'); screws.current.add(index);
    if (screws.current.size === 4) {
      screws.current.clear(); const previous = monitor.get().channel; monitor.tune(99); monitor.announce(ui.serviceModeNiceCuriosity);
      clearTimeout(restoreTimer.current); restoreTimer.current = setTimeout(() => { if (monitor.get().channel === 99) monitor.tune(previous); }, 5000);
    }
  }
  return <motion.div className="monitor-arrival" initial={reduced ? { opacity: 0 } : { x: '-120vw', rotateY: 10, rotateZ: -1.5, scale: .94, filter: 'blur(8px)' }}
    animate={reduced ? { opacity: 1 } : { x: [null, 12, 0], rotateY: 0, rotateZ: 0, scale: 1, filter: 'blur(0px)' }}
    transition={{ duration: reduced ? .25 : 1.75, ease: [.16, 1, .3, 1], x: { times: [0, .8, 1], duration: 1.75 } }}>
    <div className="monitor-dolly">
      <motion.section aria-label={ui.sa01PersonalMonitor} className="monitor-shell" animate={reduced ? {} : { x: knock ? [0, -3, 3, 0] : 0 }} transition={{ duration: .22 }} onAnimationComplete={() => setKnock(false)}
        onClick={event => { if (event.target === event.currentTarget) { setKnock(true); sfx.play('land'); monitor.burst(); } }}>
        <div className="plastic-texture" aria-hidden="true" /><div className="shell-seam" aria-hidden="true" />
        <div className="top-vents left-vents" aria-hidden="true" /><div className="top-vents right-vents" aria-hidden="true" />
        {angles.current.map((angle, index) => <motion.button key={index} className={`screw screw-${index}`} aria-label={messages.screw(index + 1)} initial={{ rotate: angle }} whileTap={{ rotate: angle + 90 }} onClick={() => screw(index)}><i /></motion.button>)}
        <div className="tube-model" aria-hidden="true">{ui.trinitronInspiredRgbPhosphorDisplay}</div>
        <Bezel />
        <ControlPanel />
        <div className="shell-bottom" aria-hidden="true"><span>{ui.highResolutionLowExpectations}</span><span>{ui.sa01SerialN0001}</span></div>
      </motion.section>
      <div className="monitor-neck" aria-hidden="true" /><div className="monitor-base" aria-hidden="true" /><div className="contact-shadow" aria-hidden="true" />
    </div>
  </motion.div>;
}
