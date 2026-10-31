import { ui } from './../data/content';
import { Power } from 'lucide-react';
import { motion } from 'framer-motion';
import { monitor, useMonitor } from '../store/useMonitor';
export function PowerButton() { const { power } = useMonitor(); return <motion.button className="power-button" aria-label={ui.togglePower} aria-pressed={power} whileTap={{ y: 2 }} onClick={monitor.power}><Power size={23} strokeWidth={1.8} /></motion.button>; }
