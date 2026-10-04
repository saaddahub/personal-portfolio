import { ArrowUpRight, Plus, Folder, Layers, Eye, Check, ArrowRight, Download, Sliders, User, Share2, Image } from 'lucide-react';

export default function AdminOverview({ data, lastSaved, saveError, onNavigate, onAddProject, onExport }) {
  const visible = data.projects.filter(project => project.visible !== false).length;
  const sections = Object.values(data.sectionVisibility).filter(Boolean).length;
  const checks = [
    { label: 'Introduction', ready: Boolean(data.hero.nameFirst.trim() && data.hero.desc.trim()), tab: 'hero' },
    { label: 'Featured work', ready: visible > 0, tab: 'projects' },
    { label: 'Contact details', ready: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.finalCta.email), tab: 'socials' },
  ];
  const completed = checks.filter(item => item.ready).length;

  return (
    <div className="studio-overview">
      <div className="studio-page-heading">
        <div><div className="studio-breadcrumb">Workspace <span>/</span> Overview</div><h2>Welcome back, {data.hero.nameFirst}<span className="studio-heading-dot">.</span></h2><p>Here's where your portfolio stands.</p></div>
        <button className="studio-action" onClick={onAddProject}><Plus size={16} /> Add project</button>
      </div>

      <div className="studio-metrics">
        {[
          { icon: Folder, value: data.projects.length, label: 'Projects', detail: 'In your collection', tab: 'projects' },
          { icon: Eye, value: visible, label: 'Visible projects', detail: `${data.projects.length - visible} hidden from visitors`, tab: 'projects' },
          { icon: Layers, value: sections, label: 'Active sections', detail: `${Object.keys(data.sectionVisibility).length} sections available`, tab: 'sections' },
        ].map(({ icon: Icon, value, label, detail, tab }, index) => (
          <button className="studio-metric" key={label} onClick={() => onNavigate(tab)} style={{ '--order': index }}>
            <div className="studio-metric-top"><span>{label}</span><Icon size={17} /></div>
            <strong>{String(value).padStart(2, '0')}</strong>
            <div className="studio-metric-bottom"><span>{detail}</span><ArrowUpRight size={16} /></div>
          </button>
        ))}
      </div>

      <div className="studio-overview-grid">
        <section className="studio-panel studio-projects-panel">
          <div className="studio-panel-heading"><div><h3>Project collection</h3><p>The work that tells your story.</p></div><button className="studio-text-action" onClick={() => onNavigate('projects')}>Manage all <ArrowRight size={14} /></button></div>
          <div className="studio-project-rows">
            {data.projects.slice(0, 4).map((project, index) => (
              <button className="studio-project-row" key={project.id} onClick={() => onNavigate('projects')}>
                <span className="studio-project-thumbnail">
                  <Image size={19} aria-hidden="true" />
                  {project.image && <img src={project.image} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} />}
                </span>
                <span className="studio-project-copy"><strong>{project.client || 'Untitled project'}</strong><small>{project.tags.slice(0, 3).join(' · ') || 'Add project details'}</small></span>
                <span className={`studio-visibility ${project.visible === false ? 'is-hidden' : ''}`}><i />{project.visible === false ? 'Hidden' : 'Visible'}</span>
                <span className="studio-row-number">{String(index + 1).padStart(2, '0')}</span>
                <ArrowUpRight size={16} className="studio-row-arrow" />
              </button>
            ))}
            {data.projects.length === 0 && <div className="studio-empty"><Folder size={25} /><p>Your collection is ready for its first project.</p><button className="studio-text-action" onClick={onAddProject}>Add a project <Plus size={14} /></button></div>}
          </div>
          <div className="studio-collection-footer"><span>{Math.min(4, data.projects.length)} of {data.projects.length} projects</span><button className="studio-text-action" onClick={onAddProject}><Plus size={14} /> Add to collection</button></div>
        </section>

        <section className="studio-panel studio-status-panel">
          <div className="studio-panel-heading"><div><h3>Content check</h3><p>A few essentials, covered.</p></div><span className="studio-completion">{completed}/{checks.length}</span></div>
          <div className="studio-readiness-track"><span style={{ width: `${completed / checks.length * 100}%` }} /></div>
          {checks.map(check => <button className="studio-check-row" key={check.label} onClick={() => onNavigate(check.tab)}><span className={check.ready ? 'studio-check-mark is-ready' : 'studio-check-mark'}>{check.ready ? <Check size={12} /> : <Plus size={12} />}</span><span>{check.label}</span><small>{check.ready ? 'Ready' : 'To do'}</small></button>)}
          <div className="studio-backup-note"><Download size={17} /><div><strong>Keep a copy of your work</strong><p>Edits are saved in this browser. Download a backup whenever you need.</p><button className="studio-text-action" onClick={onExport}>Export backup <ArrowUpRight size={13} /></button></div></div>
        </section>
      </div>

      <div className="studio-quick-heading"><h3>Quick edits</h3><span>Pick up where inspiration takes you.</span></div>
      <div className="studio-quick-grid">
        {[
          { icon: Sliders, label: 'Introduction', detail: 'Name, headline & layout', tab: 'hero' },
          { icon: User, label: 'About you', detail: 'Your bio & background', tab: 'about' },
          { icon: Share2, label: 'Contact & socials', detail: 'Keep your links up to date', tab: 'socials' },
        ].map(({ icon: Icon, label, detail, tab }) => <button className="studio-quick-card" key={tab} onClick={() => onNavigate(tab)}><span className="studio-quick-icon"><Icon size={18} /></span><span><strong>{label}</strong><small>{detail}</small></span><ArrowUpRight size={16} /></button>)}
      </div>
      <div className="studio-save-line"><span className={saveError ? 'studio-save-error' : 'studio-save-indicator'} />{saveError ? 'Backup recommended — local save failed' : lastSaved ? `Saved locally at ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Preparing workspace'}</div>
    </div>
  );
}
