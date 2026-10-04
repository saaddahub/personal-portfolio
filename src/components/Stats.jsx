import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import './Stats.css';

const StatCounter = ({ value, suffix }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.floor(latest));

  useEffect(() => {
    if (prefersReducedMotion) {
      count.set(value);
      return;
    }
    
    if (isInView) {
      const controls = animate(count, value, {
        duration: 1.8,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [count, value, isInView, prefersReducedMotion]);

  return (
    <div className="stat-number" ref={ref}>
      <motion.span className="stat-num-val">{rounded}</motion.span>
      <span className="stat-suffix">{suffix}</span>
    </div>
  );
};

import { usePortfolio } from '../context/PortfolioContext';

const Stats = () => {
  const { data } = usePortfolio();
  const statsData = data.stats;
  const stats = statsData.items || [];

  return (
    <section className="stats-section" id="about">
      {/* Background Glow for value prop */}
      <div className="section-glow"></div>
      
      <div className="container">
        <div className="stats-header">
          <p className="text-caption text-muted">{statsData.caption || 'About me'}</p>
          <h2 className="stats-headline">{statsData.headline || 'My Focus'}</h2>
        </div>
        
        <motion.div 
          className="stats-value-prop"
          initial={{ opacity: 0, filter: "blur(6px)", y: 20 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <p>
            {statsData.valueProp}
          </p>
        </motion.div>
        
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.id || i} 
              className="stat-card"
              initial={{ opacity: 0, filter: "blur(6px)", y: 20 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.1 }}
            >
              <StatCounter value={stat.value} suffix={stat.suffix} />
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
