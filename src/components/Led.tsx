import { useMonitor } from '../store/useMonitor';
export function Led() { const { power, phase, booted, storyMode } = useMonitor(); return <span aria-hidden="true" className={`power-led ${phase === 'starting' || phase === 'stopping' || (power && !booted) ? 'amber' : power ? 'green' : ''} ${storyMode ? 'recording' : ''}`} />; }
