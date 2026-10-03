import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { data } = usePortfolio();
  const faqData = data.faq;
  const faqs = faqData.items || [];

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const springConfig = prefersReducedMotion 
    ? { duration: 0 } 
    : { type: "spring", stiffness: 120, damping: 20 };

  return (
    <section className="faq-section">
      <div className="container">
        <motion.div 
          className="faq-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <p className="text-caption text-muted">{faqData.caption || 'More about me'}</p>
          <h2 className="faq-headline">{faqData.headline || 'Frequently asked questions'}</h2>
        </motion.div>

        <motion.div 
          className="faq-list"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        >
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button 
                  className="faq-question" 
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                >
                  <h3>{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={springConfig}
                  >
                    <ChevronDown className="faq-chevron" size={24} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div 
                      className="faq-answer-wrapper"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={springConfig}
                    >
                      <div className="faq-answer-inner">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
