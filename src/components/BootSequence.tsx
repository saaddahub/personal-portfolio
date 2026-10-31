import { ui } from './../data/content';
import { useEffect, useState } from 'react';
import { content } from '../data/content';
import { monitor } from '../store/useMonitor';
import { sfx } from '../audio/sfx';
export function BootSequence() {
  const [count, setCount] = useState(0);
  useEffect(() => { const timer = setInterval(() => { setCount(v => v + 1); sfx.play('type'); }, 320); const done = setTimeout(monitor.boot, 3200); return () => { clearInterval(timer); clearTimeout(done); }; }, []);
  return <div className="boot-sequence" onClick={monitor.boot}><pre>{content.boot.slice(0, count + 1).join('\n')}<span className="cursor">{ui.symbol}</span></pre><button onClick={monitor.boot}>{ui.skipBootAnyKey}</button></div>;
}
