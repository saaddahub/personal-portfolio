import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { sfx } from '../../audio/sfx';
export function Typewriter({ text, skip = false, paused = false, onDone }: { text: string; skip?: boolean; paused?: boolean; onDone?: () => void }) {
  const reduced = useReducedMotion(); const [count, setCount] = useState(0); const [hidden, setHidden] = useState(document.hidden); const done = useRef(onDone); done.current = onDone;
  useEffect(() => { const change = () => setHidden(document.hidden); document.addEventListener('visibilitychange', change); return () => document.removeEventListener('visibilitychange', change); }, []);
  useEffect(() => { setCount(0); }, [text]);
  useEffect(() => {
    if (skip || reduced) { setCount(text.length); done.current?.(); return; }
    if (count >= text.length) { done.current?.(); return; }
    if (paused || hidden) return;
    const previous = text[count - 1] ?? '';
    const timer = setTimeout(() => { setCount(v => v + 1); if (count % 3 === 0) sfx.play('type'); }, /[.,!?]/.test(previous) ? 190 : 17 + Math.random() * 20);
    return () => clearTimeout(timer);
  }, [text, count, skip, paused, reduced, hidden]);
  return <span className="typewriter" aria-label={text}><span aria-hidden="true">{text.slice(0, count).split(/(\[[^\]]+\]|signal|craft|say hi)/gi).map((part, i) => /^(\[|signal|craft|say hi)/i.test(part) ? <mark key={i}>{part}</mark> : part)}</span></span>;
}
