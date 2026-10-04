import { useState, useRef, useEffect, useCallback, Component } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import './Admin.css';
import {
  Sliders,
  FolderPlus,
  User,
  Sparkles,
  HelpCircle,
  Share2,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  RotateCcw,
  Download,
  Upload,
  Check,
  Eye,
  Move,
  ExternalLink,
  Layers,
  Code,
  Layout,
  Lock,
  KeyRound
} from 'lucide-react';
import AdminLogin from './AdminLogin';
import ChangePasswordModal from './ChangePasswordModal';
import { isAuthenticated, logout } from './adminAuth';

// Error Boundary to prevent white/black screens
class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('AdminPortal error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', color: '#fff', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Admin Dashboard Encountered an Issue</h2>
          <pre style={{ background: '#161616', padding: '1rem', borderRadius: '8px', color: '#fca5a5' }}>
            {this.state.error?.toString()}
          </pre>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', background: '#fff', color: '#000', cursor: 'pointer', fontWeight: 600 }}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('saad_portfolio_cms_data_v1');
                window.location.reload();
              }}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #ef4444', cursor: 'pointer' }}
            >
              Reset Storage & Reload
            </button>
            <a
              href="/"
              style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', background: '#222', color: '#fff', textDecoration: 'none' }}
            >
              Return to Portfolio
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Tag / Comma-separated list input component that preserves spaces and commas during typing
const TagsListInput = ({
  value = [],
  onChange,
  placeholder = 'Add items separated by commas...',
  className = 'admin-input'
}) => {
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join(', ') : ''));
  const isInternalRef = useRef(false);

  // Sync external changes (e.g. initial load, reset to defaults, import JSON, or switching items)
  useEffect(() => {
    if (isInternalRef.current) {
      isInternalRef.current = false;
      return;
    }
    const externalStr = Array.isArray(value) ? value.join(', ') : '';
    const currentParsed = text.split(',').map((s) => s.trim()).filter(Boolean);
    if (currentParsed.join(', ') !== externalStr) {
      setText(externalStr);
    }
  }, [value, text]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    isInternalRef.current = true;

    // Parse items into array
    const parsed = newText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setText(parsed.join(', '));
    onChange(parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = text.trim();
      if (trimmed && !trimmed.endsWith(',')) {
        const nextText = trimmed + ', ';
        setText(nextText);
        isInternalRef.current = true;
        const parsed = nextText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        onChange(parsed);
      }
    }
  };

  const handleRemoveChip = (indexToRemove) => {
    const currentList = Array.isArray(value) ? value : [];
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    setText(updated.join(', '));
    isInternalRef.current = false;
    onChange(updated);
  };

  const currentChips = Array.isArray(value) ? value : [];

  return (
    <div className="tags-input-wrapper">
      <input
        type="text"
        className={className}
        value={text}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {currentChips.length > 0 && (
        <div className="tags-manager-row">
          {currentChips.map((chip, idx) => (
            <span key={idx} className="tag-chip">
              <span>{chip}</span>
              <button
                type="button"
                className="tag-chip-remove"
                onClick={() => handleRemoveChip(idx)}
                title={`Remove "${chip}"`}
                aria-label={`Remove "${chip}"`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 2px',
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPortalInner = ({ onExit, onLogout }) => {
  const {
    data,
    updateHero,
    updateSection,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
    toggleSectionVisibility,
    resetToDefaults,
    exportJson,
    importJson
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('hero');
  const [toastMessage, setToastMessage] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // New project local form state
  const [newProject, setNewProject] = useState({
    client: '',
    outcome: '',
    type: 'browser',
    url: '',
    liveUrl: '',
    tags: 'React, Vite',
    image: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Draggable slider handler for hero alignment
  const dragTrackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((clientX) => {
    if (!dragTrackRef.current) return;
    const rect = dragTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // map 0 -> -40% (left), 0.5 -> 0% (center), 1 -> +40% (right)
    const offset = Math.round((pos - 0.5) * 80);
    let align = 'center';
    if (pos < 0.33) align = 'left';
    else if (pos > 0.67) align = 'right';

    updateHero({
      alignment: align,
      dragOffsetPercent: offset
    });
  }, [updateHero]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDrag(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDrag]);

  // Handle adding project
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.client.trim()) return;

    const tagsArray = newProject.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addProject({
      client: newProject.client,
      outcome: newProject.outcome || 'New portfolio project',
      type: newProject.type,
      url: newProject.url,
      liveUrl: newProject.liveUrl,
      image: newProject.image,
      tags: tagsArray.length > 0 ? tagsArray : ['Portfolio']
    });

    setNewProject({
      client: '',
      outcome: '',
      type: 'browser',
      url: '',
      liveUrl: '',
      tags: 'React, Vite',
      image: ''
    });
    setShowAddProject(false);
    showToast('Project added successfully!');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importJson(event.target.result);
      if (res.success) {
        showToast('Portfolio configuration imported!');
      } else {
        alert('Invalid JSON file: ' + res.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={`admin-portal ${showSplitPreview ? 'admin-view-split' : ''}`}>
      <div className="admin-bg-glow"></div>

      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <span className="admin-badge">Admin Studio</span>
            <h1 className="admin-title">Saad Akhtar Portfolio Studio</h1>
            <span className="admin-status-pill">
              <span className="admin-status-dot"></span>
              Auto-saved
            </span>
          </div>

          <div className="admin-header-actions">
            <button
              className={`admin-btn ${showSplitPreview ? 'admin-btn-accent' : ''}`}
              onClick={() => setShowSplitPreview(!showSplitPreview)}
              title="Toggle Live Site Preview Side-by-Side"
            >
              <Eye size={15} />
              {showSplitPreview ? 'Close Preview' : 'Split Live Preview'}
            </button>

            <button
              className="admin-btn"
              onClick={exportJson}
              title="Download portfolio configuration as JSON"
            >
              <Download size={14} />
              Export
            </button>

            <label className="admin-btn" style={{ cursor: 'pointer' }} title="Import portfolio JSON configuration">
              <Upload size={14} />
              Import
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>

            <button
              className="admin-btn admin-btn-danger"
              onClick={() => {
                if (window.confirm('Reset all changes back to original default portfolio content?')) {
                  resetToDefaults();
                  showToast('Reset to original portfolio defaults');
                }
              }}
              title="Reset all content to original defaults"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              className="admin-btn"
              onClick={() => setShowChangePassword(true)}
              title="Change master admin passcode"
            >
              <KeyRound size={14} />
              Password
            </button>

            <button
              className="admin-btn"
              onClick={() => {
                if (onLogout) onLogout();
              }}
              title="Lock studio and log out"
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.25)' }}
            >
              <Lock size={14} />
              Lock Studio
            </button>

            <button
              className="admin-btn admin-btn-primary"
              onClick={() => {
                if (onExit) onExit();
                else {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
            >
              <ArrowLeft size={15} />
              View Portfolio
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="admin-body">
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-nav-category">Main Sections</div>

          <button
            className={`admin-tab-btn ${activeTab === 'hero' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('hero')}
          >
            <Sliders size={16} className="admin-tab-icon" />
            Hero & Drag Layout
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'projects' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderPlus size={16} className="admin-tab-icon" />
            Projects Manager
            <span className="admin-tab-count">{data.projects.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'sections' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            <Layers size={16} className="admin-tab-icon" />
            Sections Overview
          </button>

          <div className="admin-nav-category">Content & Narrative</div>

          <button
            className={`admin-tab-btn ${activeTab === 'about' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <User size={16} className="admin-tab-icon" />
            About & Bio
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'punchline' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('punchline')}
          >
            <Sparkles size={16} className="admin-tab-icon" />
            Punchline & Transition
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'stats' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <Layout size={16} className="admin-tab-icon" />
            Stats & Focus
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'process' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            <Code size={16} className="admin-tab-icon" />
            Experience & Journey
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'ctaSplit' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('ctaSplit')}
          >
            <Move size={16} className="admin-tab-icon" />
            Split CTA (Two Paths)
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'faq' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            <HelpCircle size={16} className="admin-tab-icon" />
            FAQ Section
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'socials' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('socials')}
          >
            <Share2 size={16} className="admin-tab-icon" />
            Final CTA & Socials
          </button>
        </aside>

        {/* Content Pane */}
        <main className="admin-main">
          {/* TAB: HERO & DRAG LAYOUT */}
          {activeTab === 'hero' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Sliders size={20} color="var(--color-accent-pastel-a)" />
                    Hero Section & Interactive Alignment
                  </h2>
                  <p className="admin-card-subtitle">
                    Customize your hero name, title lines, and drag the layout left or right.
                  </p>
                </div>
              </div>

              {/* DRAG ALIGNMENT CONTROLLER */}
              <div className="drag-controller-card">
                <span className="admin-label">Interactive Horizontal Layout & Drag Position</span>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Drag the slider handle to reposition the hero text block anywhere horizontally (Left, Center, or Right).
                </p>

                <div className="drag-track-container">
                  <div className="drag-track-labels">
                    <span>LEFT ALIGNED</span>
                    <span>CENTERED</span>
                    <span>RIGHT ALIGNED</span>
                  </div>

                  <div
                    className="drag-track"
                    ref={dragTrackRef}
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      handleDrag(e.clientX);
                    }}
                  >
                    <div className="drag-track-markers">
                      <span className="drag-marker"></span>
                      <span className="drag-marker center"></span>
                      <span className="drag-marker"></span>
                    </div>

                    <div
                      className="drag-handle"
                      style={{
                        left: `calc(${((data.hero.dragOffsetPercent || 0) + 40) / 80 * 100}% - 45px)`
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDragging(true);
                      }}
                    >
                      <Move size={13} />
                      {data.hero.alignment.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="drag-presets-row">
                  <button
                    className={`drag-preset-btn ${data.hero.alignment === 'left' ? 'is-active' : ''}`}
                    onClick={() => updateHero({ alignment: 'left', dragOffsetPercent: -30 })}
                  >
                    <ArrowLeft size={14} /> Snap Left
                  </button>
                  <button
                    className={`drag-preset-btn ${data.hero.alignment === 'center' ? 'is-active' : ''}`}
                    onClick={() => updateHero({ alignment: 'center', dragOffsetPercent: 0 })}
                  >
                    Snap Center
                  </button>
                  <button
                    className={`drag-preset-btn ${data.hero.alignment === 'right' ? 'is-active' : ''}`}
                    onClick={() => updateHero({ alignment: 'right', dragOffsetPercent: 30 })}
                  >
                    Snap Right <ArrowRight size={14} />
                  </button>
                </div>

                {/* Live Stage Preview Box */}
                <div className="hero-stage-preview">
                  <div
                    className="hero-stage-box"
                    style={{
                      transform: `translateX(${data.hero.dragOffsetPercent * 3.5}px)`,
                      textAlign: data.hero.alignment
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      <span style={{ color: '#fff' }}>{data.hero.nameFirst}</span>{' '}
                      <span style={{ color: 'var(--color-accent-pastel-a)' }}>{data.hero.nameLast}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      {data.hero.eyebrows.join(' • ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {data.hero.desc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="admin-card">
                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">First Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.hero.nameFirst}
                      onChange={(e) => updateHero({ nameFirst: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Last Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.hero.nameLast}
                      onChange={(e) => updateHero({ nameLast: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Eyebrow Badges (comma separated)</label>
                  <TagsListInput
                    value={data.hero.eyebrows || []}
                    onChange={(newEyebrows) => updateHero({ eyebrows: newEyebrows })}
                    placeholder="e.g. AI UNDERGRADUATE, FULL-STACK DEVELOPER"
                  />
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Hero Description / Tagline</label>
                  <textarea
                    className="admin-textarea"
                    value={data.hero.desc}
                    onChange={(e) => updateHero({ desc: e.target.value })}
                  />
                </div>

                <div className="admin-grid-2" style={{ marginTop: '1rem' }}>
                  <div className="section-overview-row">
                    <span className="section-row-name">Spotlight Pointer Glow</span>
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={data.hero.showSpotlight !== false}
                        onChange={(e) => updateHero({ showSpotlight: e.target.checked })}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  <div className="section-overview-row">
                    <span className="section-row-name">Ambient Particles Field</span>
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={data.hero.showParticles !== false}
                        onChange={(e) => updateHero({ showParticles: e.target.checked })}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROJECTS MANAGER */}
          {activeTab === 'projects' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <FolderPlus size={20} color="var(--color-accent-pastel-a)" />
                    Projects Manager
                  </h2>
                  <p className="admin-card-subtitle">
                    Add new projects, edit outcome lines, reorder projects left or right, and customize display cards.
                  </p>
                </div>

                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => setShowAddProject(!showAddProject)}
                >
                  <Plus size={16} />
                  {showAddProject ? 'Cancel' : 'Add New Project'}
                </button>
              </div>

              {/* Add Project Form Drawer */}
              {showAddProject && (
                <form className="admin-card" onSubmit={handleCreateProject} style={{ border: '1px solid var(--color-accent-pastel-a)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-accent-pastel-a)' }}>
                    Add Project Details
                  </h3>

                  <div className="admin-grid-2">
                    <div className="admin-field-group">
                      <label className="admin-label">Project Title / Client Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AI Financial Forecaster (Python & FastAPI)"
                        className="admin-input"
                        value={newProject.client}
                        onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      />
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Card Style</label>
                      <select
                        className="admin-select"
                        value={newProject.type}
                        onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                      >
                        <option value="browser">Browser Window Chrome (with URL bar)</option>
                        <option value="standard">Standard Minimal Card</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Outcome & Description</label>
                    <textarea
                      placeholder="Explain what the project does, key features, and engineering accomplishments..."
                      className="admin-textarea"
                      value={newProject.outcome}
                      onChange={(e) => setNewProject({ ...newProject, outcome: e.target.value })}
                    />
                  </div>

                  <div className="admin-grid-2">
                    <div className="admin-field-group">
                      <label className="admin-label">Display URL (for Browser mockup)</label>
                      <input
                        type="text"
                        placeholder="myproject.app"
                        className="admin-input"
                        value={newProject.url}
                        onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                      />
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Live App Link (optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        className="admin-input"
                        value={newProject.liveUrl}
                        onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-grid-2">
                    <div className="admin-field-group">
                      <label className="admin-label">Tags (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Tailwind"
                        className="admin-input"
                        value={newProject.tags}
                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                      />
                      {newProject.tags && (
                        <div className="tags-manager-row">
                          {newProject.tags
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((tag, idx) => (
                              <span key={idx} className="tag-chip">
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  className="tag-chip-remove"
                                  onClick={() => {
                                    const parsed = newProject.tags
                                      .split(',')
                                      .map((t) => t.trim())
                                      .filter(Boolean);
                                    const filtered = parsed.filter((_, i) => i !== idx);
                                    setNewProject({ ...newProject, tags: filtered.join(', ') });
                                  }}
                                  title={`Remove "${tag}"`}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 2px',
                                    color: 'inherit',
                                    font: 'inherit',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Image Preview URL (optional)</label>
                      <input
                        type="text"
                        placeholder="/images/netflix-visualiser.png or https://..."
                        className="admin-input"
                        value={newProject.image}
                        onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="admin-btn" onClick={() => setShowAddProject(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      <Check size={15} /> Save & Add to Portfolio
                    </button>
                  </div>
                </form>
              )}

              {/* Projects List with Reordering */}
              <div className="projects-admin-list">
                {data.projects.map((project, index) => (
                  <div key={project.id} className="project-admin-item">
                    <div className="project-admin-item-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="project-order-badge">#{index + 1}</span>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{project.client}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          ({project.type === 'browser' ? 'Browser Chrome' : 'Standard Card'})
                        </span>
                      </div>

                      <div className="project-admin-actions">
                        {/* Drag / Move Left / Move Right in the rail */}
                        <button
                          className="project-reorder-btn"
                          disabled={index === 0}
                          onClick={() => reorderProjects(index, index - 1)}
                          title="Move Left (Earlier in sequence)"
                        >
                          <ArrowLeft size={14} />
                        </button>

                        <button
                          className="project-reorder-btn"
                          disabled={index === data.projects.length - 1}
                          onClick={() => reorderProjects(index, index + 1)}
                          title="Move Right (Later in sequence)"
                        >
                          <ArrowRight size={14} />
                        </button>

                        <button
                          className="project-reorder-btn"
                          style={{ color: '#f87171' }}
                          onClick={() => {
                            if (window.confirm(`Delete project "${project.client}"?`)) {
                              deleteProject(project.id);
                              showToast('Project deleted');
                            }
                          }}
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="admin-grid-2">
                      <div className="admin-field-group">
                        <label className="admin-label">Title / Heading</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={project.client}
                          onChange={(e) => updateProject(project.id, { client: e.target.value })}
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-label">Card Style</label>
                        <select
                          className="admin-select"
                          value={project.type}
                          onChange={(e) => updateProject(project.id, { type: e.target.value })}
                        >
                          <option value="browser">Browser Window Chrome</option>
                          <option value="standard">Standard Minimal Card</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Outcome / Description</label>
                      <textarea
                        className="admin-textarea"
                        value={project.outcome}
                        onChange={(e) => updateProject(project.id, { outcome: e.target.value })}
                      />
                    </div>

                    <div className="admin-grid-3">
                      <div className="admin-field-group">
                        <label className="admin-label">Display URL</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={project.url || ''}
                          onChange={(e) => updateProject(project.id, { url: e.target.value })}
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-label">Live App URL</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={project.liveUrl || ''}
                          onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-label">Image Preview URL</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={project.image || ''}
                          onChange={(e) => updateProject(project.id, { image: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Tags (comma-separated)</label>
                      <TagsListInput
                        key={project.id}
                        value={project.tags || []}
                        onChange={(newTags) => updateProject(project.id, { tags: newTags })}
                        placeholder="e.g. React, Next.js, TypeScript"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SECTIONS OVERVIEW */}
          {activeTab === 'sections' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Layers size={20} color="var(--color-accent-pastel-a)" />
                    Sections Overview & Visibility
                  </h2>
                  <p className="admin-card-subtitle">
                    Toggle any section on or off. Everything on the portfolio is fully manageable here.
                  </p>
                </div>
              </div>

              <div className="admin-card">
                <div className="sections-overview-list">
                  {[
                    { key: 'hero', name: 'Hero Section', desc: 'Title, name, interactive spotlight, ambient particles' },
                    { key: 'punchline', name: 'Punchline Zoom Transition', desc: 'Sticky GSAP zoom transition with dotted text' },
                    { key: 'skillsGlobe', name: 'Interactive 3D Skills Globe', desc: 'Three.js interactive floating skill spheres' },
                    { key: 'stats', name: 'Stats & Focus Area', desc: 'Focus paragraph & animated countup metric cards' },
                    { key: 'githubActivity', name: 'GitHub Activity Calendar', desc: 'Real-time commit calendar and activity graph' },
                    { key: 'projects', name: 'Selected Projects Rail', desc: 'Horizontally scrollable projects showcase' },
                    { key: 'process', name: 'Experience & Journey', desc: '3D tilt cards for past roles & tutoring' },
                    { key: 'ctaSplit', name: 'Split Call to Action', desc: 'Dual-path selector: AI Research vs Full-Stack' },
                    { key: 'about', name: 'About Me & Degree', desc: 'UMT Lahore degree info, bio & photo' },
                    { key: 'faq', name: 'Frequently Asked Questions', desc: 'Interactive animated accordion' },
                    { key: 'finalCta', name: 'Final Collaboration CTA', desc: 'Collaboration invite & contact action' }
                  ].map((sec) => (
                    <div key={sec.key} className="section-overview-row">
                      <div className="section-row-info">
                        <span className={`section-dot ${data.sectionVisibility[sec.key] === false ? 'inactive' : ''}`}></span>
                        <div>
                          <div className="section-row-name">{sec.name}</div>
                          <div className="section-row-desc">{sec.desc}</div>
                        </div>
                      </div>

                      <label className="switch-label">
                        <input
                          type="checkbox"
                          checked={data.sectionVisibility[sec.key] !== false}
                          onChange={() => toggleSectionVisibility(sec.key)}
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT & BIO */}
          {activeTab === 'about' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <User size={20} color="var(--color-accent-pastel-a)" />
                    About & Bio Section
                  </h2>
                  <p className="admin-card-subtitle">
                    Manage your education, bio, and switch layout sides (Photo on left vs right).
                  </p>
                </div>
              </div>

              <div className="admin-card">
                {/* Photo position switcher */}
                <div className="admin-field-group">
                  <label className="admin-label">Layout Order (Drag / Switch sides)</label>
                  <div className="drag-presets-row">
                    <button
                      className={`drag-preset-btn ${data.about.photoOrder !== 'right' ? 'is-active' : ''}`}
                      onClick={() => updateSection('about', { photoOrder: 'left' })}
                    >
                      <ArrowLeft size={14} /> Photo Left, Text Right
                    </button>
                    <button
                      className={`drag-preset-btn ${data.about.photoOrder === 'right' ? 'is-active' : ''}`}
                      onClick={() => updateSection('about', { photoOrder: 'right' })}
                    >
                      Text Left, Photo Right <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Headline</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={data.about.headline}
                    onChange={(e) => updateSection('about', { headline: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Detailed Bio</label>
                  <textarea
                    className="admin-textarea"
                    rows={5}
                    value={data.about.desc}
                    onChange={(e) => updateSection('about', { desc: e.target.value })}
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">Button Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.about.buttonText || 'More about me'}
                      onChange={(e) => updateSection('about', { buttonText: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Button Target Link</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.about.buttonLink || '#contact'}
                      onChange={(e) => updateSection('about', { buttonLink: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PUNCHLINE & TRANSITIONS */}
          {activeTab === 'punchline' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Sparkles size={20} color="var(--color-accent-pastel-a)" />
                    Punchline & Scroll Transition
                  </h2>
                  <p className="admin-card-subtitle">
                    Edit the GSAP 3D zoom transition texts connecting the hero and skills sections.
                  </p>
                </div>
              </div>

              <div className="admin-card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Outgoing Punchline</h3>
                <div className="admin-grid-3">
                  <div className="admin-field-group">
                    <label className="admin-label">Prefix Text</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.punchline.outgoingPrefix}
                      onChange={(e) => updateSection('punchline', { outgoingPrefix: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Highlighted Dotted Word</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.punchline.outgoingHighlight}
                      onChange={(e) => updateSection('punchline', { outgoingHighlight: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Suffix Text</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.punchline.outgoingSuffix}
                      onChange={(e) => updateSection('punchline', { outgoingSuffix: e.target.value })}
                    />
                  </div>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1.25rem 0 0.75rem' }}>Incoming Punchline</h3>
                <div className="admin-field-group">
                  <label className="admin-label">Incoming Headline</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={data.punchline.incomingHeadline}
                    onChange={(e) => updateSection('punchline', { incomingHeadline: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Incoming Subtext</label>
                  <textarea
                    className="admin-textarea"
                    value={data.punchline.incomingSub}
                    onChange={(e) => updateSection('punchline', { incomingSub: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: STATS & FOCUS */}
          {activeTab === 'stats' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Layout size={20} color="var(--color-accent-pastel-a)" />
                    Stats & Focus Section
                  </h2>
                  <p className="admin-card-subtitle">
                    Customize your key statistics counters and personal focus statement.
                  </p>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">Caption Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.stats.caption}
                      onChange={(e) => updateSection('stats', { caption: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Section Headline</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.stats.headline}
                      onChange={(e) => updateSection('stats', { headline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Value Proposition Narrative</label>
                  <textarea
                    className="admin-textarea"
                    value={data.stats.valueProp}
                    onChange={(e) => updateSection('stats', { valueProp: e.target.value })}
                  />
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>Stat Counters</h3>
                <div className="admin-grid-2">
                  {data.stats.items.map((stat, sIdx) => (
                    <div key={stat.id || sIdx} className="project-admin-item">
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <label className="admin-label">Number Value</label>
                          <input
                            type="number"
                            className="admin-input"
                            value={stat.value}
                            onChange={(e) => {
                              const newItems = [...data.stats.items];
                              newItems[sIdx] = { ...newItems[sIdx], value: parseInt(e.target.value) || 0 };
                              updateSection('stats', { items: newItems });
                            }}
                          />
                        </div>

                        <div style={{ width: '70px' }}>
                          <label className="admin-label">Suffix</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={stat.suffix}
                            onChange={(e) => {
                              const newItems = [...data.stats.items];
                              newItems[sIdx] = { ...newItems[sIdx], suffix: e.target.value };
                              updateSection('stats', { items: newItems });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="admin-label">Counter Label</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={stat.label}
                          onChange={(e) => {
                            const newItems = [...data.stats.items];
                            newItems[sIdx] = { ...newItems[sIdx], label: e.target.value };
                            updateSection('stats', { items: newItems });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXPERIENCE & JOURNEY */}
          {activeTab === 'process' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Code size={20} color="var(--color-accent-pastel-a)" />
                    Experience & Professional Journey
                  </h2>
                  <p className="admin-card-subtitle">
                    Edit the 3D interactive tilt cards showcasing your work history and tutoring.
                  </p>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-field-group">
                  <label className="admin-label">Section Headline</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={data.process.headline}
                    onChange={(e) => updateSection('process', { headline: e.target.value })}
                  />
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1.25rem 0 0.75rem' }}>Experience Steps</h3>
                {data.process.steps.map((step, idx) => (
                  <div key={idx} className="project-admin-item">
                    <div className="admin-grid-2">
                      <div className="admin-field-group">
                        <label className="admin-label">Step Index</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={step.id}
                          onChange={(e) => {
                            const newSteps = [...data.process.steps];
                            newSteps[idx] = { ...newSteps[idx], id: e.target.value };
                            updateSection('process', { steps: newSteps });
                          }}
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-label">Role Title</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...data.process.steps];
                            newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                            updateSection('process', { steps: newSteps });
                          }}
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Description</label>
                      <textarea
                        className="admin-textarea"
                        value={step.description}
                        onChange={(e) => {
                          const newSteps = [...data.process.steps];
                          newSteps[idx] = { ...newSteps[idx], description: e.target.value };
                          updateSection('process', { steps: newSteps });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SPLIT CTA */}
          {activeTab === 'ctaSplit' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Move size={20} color="var(--color-accent-pastel-a)" />
                    Split Call to Action (Two Paths)
                  </h2>
                  <p className="admin-card-subtitle">
                    Edit the two choice pathways (AI Research vs Full Stack) and swap their positions.
                  </p>
                </div>

                <button
                  className="admin-btn admin-btn-accent"
                  onClick={() => {
                    updateSection('ctaSplit', { swapped: !data.ctaSplit.swapped });
                    showToast('Swapped Left and Right Cards!');
                  }}
                >
                  <Move size={14} /> Swap Left & Right Cards
                </button>
              </div>

              <div className="admin-card">
                <div className="admin-grid-2">
                  <div className="project-admin-item">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-accent-pastel-a)' }}>
                      Card 1 ({data.ctaSplit.swapped ? 'Right Side' : 'Left Side'})
                    </h3>
                    <div className="admin-field-group">
                      <label className="admin-label">Heading</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={data.ctaSplit.left.title}
                        onChange={(e) =>
                          updateSection('ctaSplit', {
                            left: { ...data.ctaSplit.left, title: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="admin-field-group">
                      <label className="admin-label">Description</label>
                      <textarea
                        className="admin-textarea"
                        value={data.ctaSplit.left.description}
                        onChange={(e) =>
                          updateSection('ctaSplit', {
                            left: { ...data.ctaSplit.left, description: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="admin-field-group">
                      <label className="admin-label">Button Text</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={data.ctaSplit.left.buttonText}
                        onChange={(e) =>
                          updateSection('ctaSplit', {
                            left: { ...data.ctaSplit.left, buttonText: e.target.value }
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="project-admin-item">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-accent-pastel-b)' }}>
                      Card 2 ({data.ctaSplit.swapped ? 'Left Side' : 'Right Side'})
                    </h3>
                    <div className="admin-field-group">
                      <label className="admin-label">Heading</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={data.ctaSplit.right.title}
                        onChange={(e) =>
                          updateSection('ctaSplit', {
                            right: { ...data.ctaSplit.right, title: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="admin-field-group">
                      <label className="admin-label">Description</label>
                      <textarea
                        className="admin-textarea"
                        value={data.ctaSplit.right.description}
                        onChange={(e) =>
                          updateSection('ctaSplit', {
                            right: { ...data.ctaSplit.right, description: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="admin-field-group">
                      <label className="admin-label">Button Text</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={data.ctaSplit.right.buttonText}
                        onChange={(e) =>
                          updateSection('ctaSplit', {
                            right: { ...data.ctaSplit.right, buttonText: e.target.value }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAQ */}
          {activeTab === 'faq' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <HelpCircle size={20} color="var(--color-accent-pastel-a)" />
                    FAQ Section
                  </h2>
                  <p className="admin-card-subtitle">
                    Add, edit, or delete questions and answers shown in the interactive accordion.
                  </p>
                </div>

                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    const newFaq = {
                      id: 'faq-' + Date.now(),
                      question: 'New Question?',
                      answer: 'Answer explanation here...'
                    };
                    updateSection('faq', { items: [...data.faq.items, newFaq] });
                    showToast('Question added');
                  }}
                >
                  <Plus size={15} /> Add Question
                </button>
              </div>

              <div className="admin-card">
                <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
                  <div className="admin-field-group">
                    <label className="admin-label">Caption</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.faq.caption}
                      onChange={(e) => updateSection('faq', { caption: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Section Headline</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.faq.headline}
                      onChange={(e) => updateSection('faq', { headline: e.target.value })}
                    />
                  </div>
                </div>

                {data.faq.items.map((item, idx) => (
                  <div key={item.id || idx} className="project-admin-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="project-order-badge">Question #{idx + 1}</span>
                      <button
                        className="project-reorder-btn"
                        style={{ color: '#f87171' }}
                        onClick={() => {
                          const updated = data.faq.items.filter((_, i) => i !== idx);
                          updateSection('faq', { items: updated });
                          showToast('Question deleted');
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Question</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={item.question}
                        onChange={(e) => {
                          const newItems = [...data.faq.items];
                          newItems[idx] = { ...newItems[idx], question: e.target.value };
                          updateSection('faq', { items: newItems });
                        }}
                      />
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Answer</label>
                      <textarea
                        className="admin-textarea"
                        value={item.answer}
                        onChange={(e) => {
                          const newItems = [...data.faq.items];
                          newItems[idx] = { ...newItems[idx], answer: e.target.value };
                          updateSection('faq', { items: newItems });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FINAL CTA & SOCIALS */}
          {activeTab === 'socials' && (
            <div className="admin-tab-content">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <Share2 size={20} color="var(--color-accent-pastel-a)" />
                    Final CTA, Contact & Social Links
                  </h2>
                  <p className="admin-card-subtitle">
                    Configure your direct email, collaboration headline, and floating social contacts.
                  </p>
                </div>
              </div>

              <div className="admin-card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Collaboration CTA</h3>
                <div className="admin-field-group">
                  <label className="admin-label">Headline</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={data.finalCta.headline}
                    onChange={(e) => updateSection('finalCta', { headline: e.target.value })}
                  />
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">Description</label>
                  <textarea
                    className="admin-textarea"
                    value={data.finalCta.desc}
                    onChange={(e) => updateSection('finalCta', { desc: e.target.value })}
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">Button Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.finalCta.buttonText}
                      onChange={(e) => updateSection('finalCta', { buttonText: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Primary Contact Email</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={data.finalCta.email}
                      onChange={(e) => updateSection('finalCta', { email: e.target.value })}
                    />
                  </div>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>Social Menu Links</h3>
                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">WhatsApp (wa.me URL)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.socials.whatsapp}
                      onChange={(e) => updateSection('socials', { whatsapp: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">GitHub URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.socials.github}
                      onChange={(e) => updateSection('socials', { github: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Instagram URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.socials.instagram}
                      onChange={(e) => updateSection('socials', { instagram: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Discord URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.socials.discord}
                      onChange={(e) => updateSection('socials', { discord: e.target.value })}
                    />
                  </div>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>Footer Details</h3>
                <div className="admin-grid-3">
                  <div className="admin-field-group">
                    <label className="admin-label">Footer Ghost Heading</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.footer.ghostName}
                      onChange={(e) => updateSection('footer', { ghostName: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Tagline</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.footer.tagline}
                      onChange={(e) => updateSection('footer', { tagline: e.target.value })}
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">Location</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={data.footer.location}
                      onChange={(e) => updateSection('footer', { location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Optional Live Preview Split Pane */}
        {showSplitPreview && (
          <aside className="admin-preview-pane">
            <div className="admin-preview-header">
              <span>Live Portfolio Preview</span>
              <a href="/" target="_blank" rel="noreferrer" className="admin-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                Open in new tab <ExternalLink size={12} />
              </a>
            </div>
            <iframe src="/" title="Live Site Preview" className="admin-preview-iframe" />
          </aside>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Floating Save Toast */}
      {toastMessage && (
        <div className="admin-toast">
          <Check size={16} color="var(--color-accent-signal)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

const AdminPortal = (props) => {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  return (
    <AdminErrorBoundary>
      {authenticated ? (
        <AdminPortalInner {...props} onLogout={handleLogout} />
      ) : (
        <AdminLogin
          onLoginSuccess={() => setAuthenticated(true)}
          onCancel={props.onExit}
        />
      )}
    </AdminErrorBoundary>
  );
};

export default AdminPortal;
