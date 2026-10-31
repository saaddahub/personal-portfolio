import { ui, messages } from './../data/content';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { monitor, useMonitor } from '../store/useMonitor';
import { knobValue } from '../store/monitorState';
export function Knob() {
  const { brightness } = useMonitor(); const dragging = useRef(false);
  const move = (event: React.PointerEvent<HTMLDivElement>) => { const bounds = event.currentTarget.getBoundingClientRect(); monitor.brightness(knobValue(event.clientX - bounds.left - bounds.width / 2, event.clientY - bounds.top - bounds.height / 2)); };
  return <div className="knob-ticks"><div className="knob" role="slider" tabIndex={0} aria-label={ui.brightness2} aria-valuenow={brightness} aria-valuemin={0} aria-valuemax={100} aria-valuetext={messages.percent(brightness)} aria-orientation="vertical"
    onPointerDown={event => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); move(event); }} onPointerMove={event => { if (dragging.current) move(event); }} onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }} onLostPointerCapture={() => { dragging.current = false; }}
    onWheel={event => { event.stopPropagation(); monitor.brightness(brightness + (event.deltaY < 0 ? 5 : -5)); }} onDoubleClick={() => monitor.brightness(65)}
    onKeyDown={event => { if (['ArrowUp', 'ArrowRight', ']', 'ArrowDown', 'ArrowLeft', '[', 'Home', 'End'].includes(event.key)) { event.preventDefault(); event.stopPropagation(); monitor.brightness(event.key === 'Home' ? 0 : event.key === 'End' ? 100 : brightness + (['ArrowUp', 'ArrowRight', ']'].includes(event.key) ? 5 : -5)); } }}>
    <motion.div className="knob-face" animate={{ rotate: brightness * 2.7 - 135 }} transition={{ type: 'spring', stiffness: 180, damping: 22 }}><i /></motion.div>
  </div></div>;
}
