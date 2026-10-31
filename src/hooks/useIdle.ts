import { useEffect, useState } from 'react';
export function useIdle(active: boolean) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!active) { setIdle(false); return; }
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => { setIdle(false); clearTimeout(timer); timer = setTimeout(() => setIdle(true), 60000); };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(event => window.addEventListener(event, reset, { passive: true })); reset();
    return () => { clearTimeout(timer); events.forEach(event => window.removeEventListener(event, reset)); };
  }, [active]);
  return idle;
}
