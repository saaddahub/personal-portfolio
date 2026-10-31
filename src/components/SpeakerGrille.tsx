import { ui } from './../data/content';
import { useEffect, useRef } from 'react';
import { monitor, useMonitor } from '../store/useMonitor';
import { sfx } from '../audio/sfx';
export function SpeakerGrille() {
  const { muted, power } = useMonitor(); const grille = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (muted || !power) return;
    let frame = 0; const data = new Uint8Array(32); let last = 0;
    const draw = (now: number) => {
      if (!document.hidden && now - last > 70) { last = now; sfx.analyser()?.getByteFrequencyData(data); Array.from(grille.current?.children ?? []).forEach((bar, i) => (bar as HTMLElement).style.setProperty('--level', String(.35 + data[i % 32] / 255 * .65))); }
      frame = requestAnimationFrame(draw);
    }; frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, [muted, power]);
  return <button ref={grille} className={`speaker-grille ${!muted && power ? 'sound-on' : ''}`} aria-label={muted ? ui.enableSynthesizedSound : ui.muteSound} aria-pressed={!muted} onClick={monitor.mute}>{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</button>;
}
