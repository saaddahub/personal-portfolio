import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What are your notable achievements?',
      answer: 'I won 1st Prize in a School-level Speech & Documentation competition (2019), hold Teacher Assistant Certificates for assisting peers, and am certified in core Python programming fundamentals.'
    },
    {
      question: 'What is your tech stack of choice?',
      answer: 'For full-stack development, I specialize in the MERN stack (MongoDB, Express.js, React, Node.js). For backend and AI, I frequently use Python, SQL, and C++.'
    },
    {
      question: 'Do you take on freelance projects?',
      answer: 'Yes! I have delivered over 10 freelance and personal web applications, often integrating AI-powered tools or optimizing workflows with prompt engineering.'
    },
    {
      question: 'What is your educational background?',
      answer: 'I completed my Intermediate in Medical Sciences in 2024. Currently, I am pursuing a BS in Artificial Intelligence at the University of Management and Technology (UMT), Lahore, graduating in 2028.'
    }
  ];

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
          <p className="text-caption text-muted">More about me</p>
          <h2 className="faq-headline">Frequently asked questions</h2>
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
