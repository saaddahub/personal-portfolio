import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../audio/sfx';
export function KeyButton({ children, label, onPress, repeat = false, className = '' }: { children: ReactNode; label: string; onPress: () => void; repeat?: boolean; className?: string }) {
  const delay = useRef<ReturnType<typeof setTimeout>>(); const interval = useRef<ReturnType<typeof setInterval>>();
  const stop = () => { clearTimeout(delay.current); clearInterval(interval.current); };
  useEffect(() => stop, []);
  return <motion.button className={`key-button ${className}`} aria-label={label} whileTap={{ y: 2 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}
    onClick={() => { sfx.play('button'); onPress(); }} onPointerDown={event => { if (repeat) { event.currentTarget.setPointerCapture(event.pointerId); delay.current = setTimeout(() => { onPress(); interval.current = setInterval(onPress, 130); }, 400); } }} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>{children}</motion.button>;
}
