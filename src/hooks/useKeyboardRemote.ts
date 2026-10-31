import { useEffect } from 'react';
import { monitor } from '../store/useMonitor';
import { sfx } from '../audio/sfx';
export function useKeyboardRemote() {
  useEffect(() => {
    const unlock = () => sfx.unlock(monitor.get().muted);
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement && event.target.isContentEditable)) return;
      const state = monitor.get();
      if (event.key === 'Tab') return;
      if (state.power && !state.booted) { monitor.boot(); return; }
      if (event.target instanceof HTMLElement && event.target.closest('[role="slider"]')) return;
      const k = event.key.toLowerCase();
      if (k === 'p') monitor.power();
      else if (k === 'm') monitor.mute();
      else if (k === '?') monitor.help();
      else if (k === 'escape') monitor.exit();
      else if (!state.power) return;
      else if (k === 'arrowleft' || k === 'arrowright') monitor.step(k === 'arrowright' ? 1 : -1);
      else if (k === 'arrowup' || k === 'arrowdown' || k === '[' || k === ']') monitor.brightness(state.brightness + (k === 'arrowup' || k === ']' ? 5 : -5));
      else if (k === 'c') monitor.colour();
      else if (k === 's') monitor.story();
      else if (/^[0-6]$/.test(k)) monitor.tune(Number(k));
      else return;
      event.preventDefault();
    };
    window.addEventListener('pointerdown', unlock, { capture: true }); window.addEventListener('keydown', unlock, { capture: true }); window.addEventListener('keydown', key);
    return () => { window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); window.removeEventListener('keydown', key); };
  }, []);
}
