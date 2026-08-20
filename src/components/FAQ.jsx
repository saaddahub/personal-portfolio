import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

  return (
    <section className="faq-section reveal-on-scroll">
      <div className="container">
        <div className="faq-header">
          <p className="text-caption text-muted">More about me</p>
          <h2 className="faq-headline">Frequently asked questions</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${openIndex === idx ? 'is-open' : ''}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleItem(idx)}
                aria-expanded={openIndex === idx}
              >
                <h3>{faq.question}</h3>
                <ChevronDown className="faq-chevron" size={24} />
              </button>
              
              <div className="faq-answer-wrapper">
                <div className="faq-answer-inner">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
