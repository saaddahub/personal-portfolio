import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const footerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-big-text-wrapper">
            <motion.h1 
              className="footer-ghost-name"
              style={prefersReducedMotion ? {} : { y, opacity }}
            >
              SAAD AKHTAR
            </motion.h1>
          </div>
          
          <div className="footer-info">
            <p className="footer-tagline">AI undergraduate and full-stack developer.</p>
            <div className="footer-social-wrapper">
              
            </div>
          </div>
          
          <div className="footer-divider"></div>
          
          <div className="footer-bottom">
            <p className="text-caption text-muted">© {new Date().getFullYear()} Saad Akhtar. All rights reserved.</p>
            <p className="text-caption text-muted">Lahore, Pakistan</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
