import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isAdmin } from '../lib/supabase';
import { savePortfolioSnapshot, readRecoveryDraft } from '../lib/portfolioPersistence';

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

// Validate known fields before accepting saved or imported content.
export function normalizePortfolio(input, defaults = DEFAULT_PORTFOLIO_DATA, path = 'portfolio') {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(path + ' must be an object');
  const result = { ...defaults };
  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in input)) continue;
    const next = input[key];
    const location = path + '.' + key;
    if (Array.isArray(value)) {
      if (!Array.isArray(next)) throw new Error(location + ' must be a list');
      result[key] = next.map((item, index) => {
        if (value[0] && typeof value[0] === 'object') {
          const normalized = normalizePortfolio(item, value[0], location);
          if ('id' in normalized && !item.id) normalized.id = key + '-' + index;
          return normalized;
        }
        if (typeof item !== typeof value[0]) throw new Error(location + ' contains an invalid item');
        return item;
      });
      if (result[key].some((item, index, list) => item?.id && list.findIndex(other => other.id === item.id) !== index)) throw new Error(location + ' contains duplicate IDs');
    } else if (value && typeof value === 'object') {
      result[key] = normalizePortfolio(next, value, location);
    } else {
      if (typeof next !== typeof value || (typeof next === 'number' && !Number.isFinite(next))) throw new Error(location + ' has an invalid value');
      result[key] = next;
    }
  }
  return result;
}

const PENDING_KEY = 'saad_portfolio_pending_v2';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [data, renderData] = useState(DEFAULT_PORTFOLIO_DATA);
  const current = useRef(DEFAULT_PORTFOLIO_DATA);
  const baseline = useRef(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  const revision = useRef(null);
  const ready = useRef(false);
  const saving = useRef(null);
  const generation = useRef(0);
  const [adminSession, setAdminSession] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [recoveryDraft, setRecoveryDraft] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!supabase) { setCloudError('Supabase is not configured.'); return; }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setAdminSession(isAdmin(session)));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (adminSession === null || !supabase) return;
    const epoch = ++generation.current;
    ready.current = false;
    setCloudReady(false);
    async function load() {
      try {
        const { data: row, error } = await supabase.from('portfolio_content').select('data,updated_at').eq('id', 'main').maybeSingle();
        if (error) throw error;
        if (epoch !== generation.current) return;
        const published = row ? normalizePortfolio(row.data) : DEFAULT_PORTFOLIO_DATA;
        current.current = published;
        baseline.current = JSON.stringify(published);
        revision.current = row?.updated_at ?? null;
        renderData(published);
        setDirty(false);
        setLastSaved(row ? Date.parse(row.updated_at) : null);
        try { setRecoveryDraft(adminSession ? readRecoveryDraft(localStorage, published, normalizePortfolio) : null); }
        catch { setSaveError('Browser storage is unavailable. Cloud saving still works.'); }
        setCloudError('');
        ready.current = true;
        setCloudReady(true);
      } catch (error) {
        if (epoch === generation.current) setCloudError('Could not load saved work: ' + error.message + '. Editing is paused to protect existing content.');
      }
    }
    load();
    return () => { generation.current += 1; ready.current = false; };
  }, [adminSession, reloadKey]);

  // Back up every user edit immediately. Loading content never writes a draft.
  const setData = useCallback((update) => {
    if (!ready.current || !adminSession) return;
    const next = typeof update === 'function' ? update(current.current) : update;
    current.current = next;
    renderData(next);
    setDirty(JSON.stringify(next) !== baseline.current);
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ data: next, updatedAt: Date.now() }));
      setSaveError('');
    } catch {
      setSaveError('Browser backup failed. Keep this tab open until the cloud save completes, or export a backup.');
    }
  }, [adminSession]);

  const publishPortfolio = useCallback(async () => {
    if (!ready.current || !adminSession || !supabase) return false;
    if (saving.current) return saving.current;
    if (JSON.stringify(current.current) === baseline.current && revision.current) return true;
    const epoch = generation.current;
    setPublishing(true);
    setCloudError('');
    const task = (async () => {
      try {
        // Keep saving if another edit arrived while the previous request was running.
        do {
          const snapshot = current.current;
          const encoded = JSON.stringify(snapshot);
          if (encoded === baseline.current && revision.current) return true;
          const savedRevision = await savePortfolioSnapshot(supabase, snapshot, revision.current);
          if (epoch !== generation.current) return false;
          revision.current = savedRevision;
          baseline.current = encoded;
          setLastSaved(Date.parse(savedRevision));
          const pending = JSON.stringify(current.current) !== encoded;
          setDirty(pending);
          if (!pending) {
            // Don't remove another tab's pending work.
            try {
              localStorage.setItem('saad_portfolio_legacy_reviewed_v2', 'true');
              const stored = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
              if (stored && JSON.stringify(stored.data) === encoded) localStorage.removeItem(PENDING_KEY);
            } catch { /* Cloud save is confirmed even if local cleanup fails. */ }
          }
        } while (JSON.stringify(current.current) !== baseline.current);
        return true;
      } catch (error) {
        if (epoch === generation.current) setCloudError('Not saved to cloud: ' + error.message + '. Keep this tab open, retry, or export a backup.');
        return false;
      } finally {
        saving.current = null;
        setPublishing(false);
      }
    })();
    saving.current = task;
    return task;
  }, [adminSession]);

  useEffect(() => {
    if (!dirty || !cloudReady || cloudError || !adminSession) return;
    const timer = setTimeout(() => { void publishPortfolio(); }, 800);
    return () => clearTimeout(timer);
  }, [data, dirty, cloudReady, cloudError, adminSession, publishPortfolio]);

  useEffect(() => {
    const warn = event => {
      if (!dirty && !publishing) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const retry = () => { if (dirty) void publishPortfolio(); };
    window.addEventListener('beforeunload', warn);
    window.addEventListener('online', retry);
    return () => { window.removeEventListener('beforeunload', warn); window.removeEventListener('online', retry); };
  }, [dirty, publishing, publishPortfolio]);

  const recoverDraft = () => {
    if (!recoveryDraft) return;
    setData(recoveryDraft);
    setRecoveryDraft(null);
  };
  const saveStatus = cloudError ? 'Cloud save unavailable' : publishing ? 'Saving to cloud…' : !cloudReady ? 'Loading saved work…' : dirty ? 'Unsaved changes' : lastSaved ? 'Saved to cloud' : 'No cloud save yet';

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
          id: 'proj-' + crypto.randomUUID(),
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
      const normalized = normalizePortfolio(parsed);
      setData(normalized);
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
        lastSaved,
        saveError, cloudReady, cloudError, publishing, publishPortfolio, dirty, saveStatus, recoveryDraft, recoverDraft, retryLoad: () => setReloadKey(key => key + 1)
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
