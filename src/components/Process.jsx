import { motion } from 'framer-motion';
import TiltCard from './TiltCard';
import './Process.css';

const Process = () => {
  const steps = [
    {
      id: '01',
      title: 'Private Tutor',
      description: 'Tutoring students in English language, fluency, and vocabulary development with structured lesson plans.'
    },
    {
      id: '02',
      title: 'Freelance Developer',
      description: 'Full-stack development using the MERN stack. Delivered 10+ freelance projects including AI-powered tools.'
    },
    {
      id: '03',
      title: 'AI Enthusiast',
      description: 'Applied prompt engineering to build and fine-tune AI-driven features and workflows across multiple projects.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18
      }
    }
  };

  return (
    <section className="process-section" id="services">
      <div className="container">
        <motion.div 
          className="process-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <p className="text-caption text-muted">Experience</p>
          <h2 className="process-headline">
            My professional journey<br />
            and entrepreneurial ventures.
          </h2>
        </motion.div>

        <motion.div 
          className="process-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step) => (
            <motion.div key={step.id} variants={itemVariants}>
              <TiltCard className="process-card">
                <div className="process-tag">
                  <span className="process-num">{step.id}</span>
                  <span className="process-title">{step.title}</span>
                </div>
                <p className="process-desc text-muted">
                  {step.description}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Process;
