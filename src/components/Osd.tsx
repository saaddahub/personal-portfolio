import { ui } from './../data/content';
import { content } from '../data/content';
import { monitor, useMonitor } from '../store/useMonitor';
import { useEffect, useRef } from 'react';
export function Osd() {
  const { osd, help, plain } = useMonitor(); const close = useRef<HTMLButtonElement>(null); const prior = useRef<HTMLElement | null>(null);
  useEffect(() => { if (help) { prior.current = document.activeElement as HTMLElement; close.current?.focus(); } else prior.current?.focus(); }, [help]);
  return <><div className="osd" role="status" aria-live="polite">{osd}</div>{help && <div className="help-overlay" role="dialog" aria-modal="true" aria-label={ui.keyboardRemote} onKeyDown={event => { if (event.key === 'Tab') { const items = event.currentTarget.querySelectorAll<HTMLButtonElement>('button'); const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } }}><div className="help-head"><h2>{ui.remoteGuide}</h2><button ref={close} onClick={monitor.help}>{ui.close}</button></div><dl>{content.help.map(([key, label]) => <div key={key}><dt>{key}</dt><dd>{label}</dd></div>)}</dl><button onClick={monitor.plain}>{ui.symbol12}{plain ? ui.restoreCrtEffects : ui.plainModeEffectsOff}{ui.symbol13}</button></div>}</>;
}
