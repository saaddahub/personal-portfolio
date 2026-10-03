import { createContext, useContext, useState, useEffect } from 'react';

export const DEFAULT_PORTFOLIO_DATA = {
  hero: {
    nameFirst: 'Saad',
    nameLast: 'Akhtar',
    eyebrows: ['AI UNDERGRADUATE', 'FULL-STACK DEVELOPER'],
    desc: 'Creative Developer based in Lahore, Pakistan.',
    alignment: 'left', // 'left', 'center', 'right'
    dragOffsetPercent: 0, // -50 to 50
    showSpotlight: true,
    showParticles: true
  },
  punchline: {
    outgoingPrefix: 'Building at the intersection of ',
    outgoingHighlight: 'data,',
    outgoingSuffix: ' systems, and design.',
    incomingHeadline: 'I help founders shape their product.',
    incomingSub: 'Bridging the gap between AI research and scalable full-stack development.'
  },
  about: {
    headline: 'BS Artificial Intelligence at UMT, Lahore.',
    desc: 'Currently pursuing my degree (2024-2028) with a 3.4 CGPA. My interests lie in AI Research, Machine Learning, Fashion, and Content Creation. I have a strong foundation in OOP and Data Structures, and a proven track record in web development and competitive speaking.',
    photoOrder: 'left', // 'left' means photo first, 'right' means text first
    buttonText: 'More about me',
    buttonLink: '#contact'
  },
  stats: {
    caption: 'About me',
    headline: 'My Focus',
    valueProp: "I am passionate about Object-Oriented Programming, Database Design, AI Fundamentals, and Web Development. I'm currently expanding my skill set by diving deep into Machine Learning.",
    items: [
      { id: 'stat-1', value: 10, suffix: '+', label: 'Projects Completed' },
      { id: 'stat-2', value: 5, suffix: '+', label: 'Frameworks Mastered' },
      { id: 'stat-3', value: 4, suffix: '', label: 'Languages' },
      { id: 'stat-4', value: 2028, suffix: '', label: 'Graduation Year' }
    ]
  },
  projects: [
    {
      id: 'proj-1',
      client: 'Netflix Data Visualiser (Python & Data Science)',
      outcome: 'Interactive exploratory data analysis and visualization dashboard for Netflix movies and TV shows. Analyzes genre distribution, release trends, content ratings, and international analytics.',
      image: '/images/netflix-visualiser.png',
      url: 'netflix-analysis-pandas.streamlit.app',
      liveUrl: 'https://netflix-analysis-pandas.streamlit.app',
      type: 'browser',
      tags: ['Python', 'Pandas', 'Data Science', 'Streamlit'],
      visible: true
    },
    {
      id: 'proj-2',
      client: 'Hotel Management System (C++)',
      outcome: 'Modular C++ project with separate headers for rooms, bookings, customers, and services. Implemented OOP principles including inheritance, encapsulation, and file I/O operations.',
      type: 'standard',
      image: '',
      url: '',
      liveUrl: '',
      tags: ['C++', 'OOP', 'Data Structures'],
      visible: true
    },
    {
      id: 'proj-3',
      client: 'Hospital Management System DB (MySQL)',
      outcome: 'Designed complete relational schema with ERD covering patients, staff, appointments, and billing. Applied normalization principles and wrote complex multi-join queries.',
      url: 'hospital-db.mysql',
      liveUrl: '',
      type: 'browser',
      image: '',
      tags: ['MySQL', 'Relational DB', 'ERD'],
      visible: true
    },
    {
      id: 'proj-4',
      client: 'AI Interviewer (Python)',
      outcome: 'Built an AI-driven interviewer that generates role-specific questions and evaluates candidate responses using prompt engineering for dynamic flows.',
      type: 'standard',
      image: '',
      url: '',
      liveUrl: '',
      tags: ['Python', 'AI/LLM', 'Prompt Eng'],
      visible: true
    },
    {
      id: 'proj-5',
      client: 'Demo Website / Portfolio (MERN)',
      outcome: 'Built and deployed a full-stack demo site integrating a React frontend with a Node.js/Express backend connected to MongoDB.',
      url: 'mern-portfolio.demo',
      liveUrl: '',
      type: 'browser',
      image: '',
      tags: ['React', 'Node.js', 'MongoDB'],
      visible: true
    }
  ],
  process: {
    caption: 'Experience',
    headline: 'My professional journey\nand entrepreneurial ventures.',
    steps: [
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
    ]
  },
  ctaSplit: {
    swapped: false,
    left: {
      title: 'Interested in AI Research?',
      description: 'I am currently exploring Machine Learning and seeking opportunities to collaborate on research projects.',
      buttonText: 'Contact me',
      buttonLink: '#contact'
    },
    right: {
      title: 'Need a Full-Stack Developer?',
      description: "Proficient in the MERN stack and Python. I've delivered over 10 freelance and personal web applications.",
      buttonText: 'Hire me',
      buttonLink: '#contact'
    }
  },
  faq: {
    caption: 'More about me',
    headline: 'Frequently asked questions',
    items: [
      {
        id: 'faq-1',
        question: 'What are your notable achievements?',
        answer: 'I won 1st Prize in a School-level Speech & Documentation competition (2019), hold Teacher Assistant Certificates for assisting peers, and am certified in core Python programming fundamentals.'
      },
      {
        id: 'faq-2',
        question: 'What is your tech stack of choice?',
        answer: 'For full-stack development, I specialize in the MERN stack (MongoDB, Express.js, React, Node.js). For backend and AI, I frequently use Python, SQL, and C++.'
      },
      {
        id: 'faq-3',
        question: 'Do you take on freelance projects?',
        answer: 'Yes! I have delivered over 10 freelance and personal web applications, often integrating AI-powered tools or optimizing workflows with prompt engineering.'
      },
      {
        id: 'faq-4',
        question: 'What is your educational background?',
        answer: 'I completed my Intermediate in Medical Sciences in 2024. Currently, I am pursuing a BS in Artificial Intelligence at the University of Management and Technology (UMT), Lahore, graduating in 2028.'
      }
    ]
  },
  finalCta: {
    headline: 'Ready to collaborate?',
    desc: "I'm currently open to internships, research roles, and collaborative projects. If you're looking for an AI enthusiast or a full-stack developer to join your team, let's talk.",
    buttonText: 'Get in touch',
    email: 'saadsalam659@email.com'
  },
  footer: {
    ghostName: 'SAAD AKHTAR',
    tagline: 'AI undergraduate and full-stack developer.',
    location: 'Lahore, Pakistan',
    copyrightName: 'Saad Akhtar'
  },
  socials: {
    instagram: 'https://instagram.com/saaddagram',
    github: 'https://github.com/saaddahub',
    discord: 'https://discord.com/saaddacord',
    whatsapp: 'https://wa.me/923706599919',
    email: 'saadsalam659@gmail.com'
  },
  sectionVisibility: {
    hero: true,
    punchline: true,
    skillsGlobe: true,
    stats: true,
    githubActivity: true,
    projects: true,
    process: true,
    ctaSplit: true,
    about: true,
    faq: true,
    finalCta: true
  }
};

const STORAGE_KEY = 'saad_portfolio_cms_data_v1';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge deep with default to ensure no missing keys
        return {
          ...DEFAULT_PORTFOLIO_DATA,
          ...parsed,
          hero: { ...DEFAULT_PORTFOLIO_DATA.hero, ...parsed.hero },
          punchline: { ...DEFAULT_PORTFOLIO_DATA.punchline, ...parsed.punchline },
          about: { ...DEFAULT_PORTFOLIO_DATA.about, ...parsed.about },
          stats: { ...DEFAULT_PORTFOLIO_DATA.stats, ...parsed.stats },
          projects: parsed.projects || DEFAULT_PORTFOLIO_DATA.projects,
          process: { ...DEFAULT_PORTFOLIO_DATA.process, ...parsed.process },
          ctaSplit: { ...DEFAULT_PORTFOLIO_DATA.ctaSplit, ...parsed.ctaSplit },
          faq: { ...DEFAULT_PORTFOLIO_DATA.faq, ...parsed.faq },
          finalCta: { ...DEFAULT_PORTFOLIO_DATA.finalCta, ...parsed.finalCta },
          footer: { ...DEFAULT_PORTFOLIO_DATA.footer, ...parsed.footer },
          socials: { ...DEFAULT_PORTFOLIO_DATA.socials, ...parsed.socials },
          sectionVisibility: { ...DEFAULT_PORTFOLIO_DATA.sectionVisibility, ...parsed.sectionVisibility }
        };
      }
    } catch (e) {
      console.error('Error loading portfolio data from localStorage', e);
    }
    return DEFAULT_PORTFOLIO_DATA;
  });

  const [lastSaved, setLastSaved] = useState(Date.now());

  // Automatically save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(Date.now());
    } catch (e) {
      console.error('Error saving portfolio data to localStorage', e);
    }
  }, [data]);

  const updateSection = (sectionKey, updateFnOrObj) => {
    setData((prev) => {
      const currentVal = prev[sectionKey];
      const newVal = typeof updateFnOrObj === 'function' ? updateFnOrObj(currentVal) : { ...currentVal, ...updateFnOrObj };
      return {
        ...prev,
        [sectionKey]: newVal
      };
    });
  };

  const updateHero = (heroUpdates) => {
    updateSection('hero', heroUpdates);
  };

  const addProject = (newProject) => {
    setData((prev) => ({
      ...prev,
      projects: [
        {
          id: 'proj-' + Date.now(),
          client: 'New Project',
          outcome: 'Description of the project outcome and key technologies used.',
          type: 'browser',
          url: 'project-demo.com',
          liveUrl: '',
          image: '',
          tags: ['React', 'JavaScript'],
          visible: true,
          ...newProject
        },
        ...prev.projects
      ]
    }));
  };

  const updateProject = (id, projectUpdates) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...projectUpdates } : p))
    }));
  };

  const deleteProject = (id) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
  };

  const reorderProjects = (fromIndex, toIndex) => {
    setData((prev) => {
      const list = [...prev.projects];
      if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return {
        ...prev,
        projects: list
      };
    });
  };

  const toggleSectionVisibility = (sectionKey) => {
    setData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionKey]: !prev.sectionVisibility[sectionKey]
      }
    }));
  };

  const resetToDefaults = () => {
    setData(DEFAULT_PORTFOLIO_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saad-portfolio-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      setData((prev) => ({
        ...prev,
        ...parsed
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        setData,
        updateSection,
        updateHero,
        addProject,
        updateProject,
        deleteProject,
        reorderProjects,
        toggleSectionVisibility,
        resetToDefaults,
        exportJson,
        importJson,
        lastSaved
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
