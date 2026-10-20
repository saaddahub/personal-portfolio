import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Upload, Trash2, Link, LoaderCircle } from 'lucide-react';
import { loadProjectImage, uploadProjectImage, validateImageLink } from './projectImage';
import './ProjectImageInput.css';

export default function ProjectImageInput({ value = '', onChange, onBusyChange, name = 'project' }) {
  const id = useId();
  const inputRef = useRef(null);
  const operation = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState('');
  const [failedSource, setFailedSource] = useState(null);
  const [message, setMessage] = useState('');
  const uploaded = value.startsWith('data:image/');

  useEffect(() => () => { operation.current += 1; onBusyChange?.(false); }, [onBusyChange]);

  const updateBusy = (next) => { setBusy(next); onBusyChange?.(next); };
  const applyImage = async (getSource, success) => {
    const current = ++operation.current;
    setError('');
    setMessage('');
    updateBusy(true);
    try {
      const source = await getSource();
      if (operation.current !== current) return;
      setFailedSource(null);
      onChange(source);
      setMessage(success);
    } catch (failure) {
      if (operation.current === current) setError(failure.message || 'Could not add that image. Please try another.');
    } finally {
      if (operation.current === current) updateBusy(false);
    }
  };
  const upload = (file) => {
    if (!file || busy) return;
    applyImage(() => uploadProjectImage(file), 'Image uploaded. Existing projects save automatically; for a new project, finish by clicking Save & Add to Portfolio.');
  };

  return (
    <div className="project-image-field" aria-busy={busy}>
      <span className="admin-label" id={`${id}-label`}>Project image</span>
      <div className={`project-image-drop ${dragging ? 'is-dragging' : ''}`}
        onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }}
        onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
        onDrop={event => {
          event.preventDefault(); setDragging(false);
          if (event.dataTransfer.files.length > 1) { setError('Choose one image at a time.'); return; }
          upload(event.dataTransfer.files[0]);
        }}>
        {value && failedSource !== value ? (
          <img key={value} className="project-image-editor-preview" src={value} alt={`Preview for ${name}`} onError={() => setFailedSource(value)} />
        ) : (
          <div className="project-image-empty"><ImagePlus size={26} aria-hidden="true" /><p>{value ? 'Image unavailable' : 'Add a picture of your project'}</p><span>{value ? 'Replace it or try another link.' : 'Drop an image here or choose a file below.'}</span></div>
        )}
        {busy && <div className="project-image-processing" role="status"><LoaderCircle size={20} /> Preparing image…</div>}
      </div>
      <div className="project-image-actions">
        <button type="button" className="admin-btn" disabled={busy} onClick={() => inputRef.current?.click()}><Upload size={15} />{value ? 'Replace image' : 'Choose image'}</button>
        {value && <button type="button" className="admin-btn admin-btn-danger" disabled={busy} onClick={() => { operation.current += 1; onChange(''); setFailedSource(null); setError(''); setMessage('Image removed.'); }}><Trash2 size={14} /> Remove</button>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Choose image for ${name}`} hidden onChange={event => { upload(event.target.files?.[0]); event.target.value = ''; }} />
      </div>
      <p className="project-image-help">JPG, PNG or WebP · Up to 10 MB. Large images are resized automatically.</p>
      <details className="project-image-link">
        <summary><Link size={13} /> Use an image link instead</summary>
        <label htmlFor={`${id}-url`}>Direct image URL</label>
        <div className="project-image-link-row"><input id={`${id}-url`} className="admin-input" type="text" value={link} disabled={busy} placeholder={value && !uploaded ? value : 'https://example.com/project.jpg'} onChange={event => setLink(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') event.preventDefault(); }} /><button type="button" className="admin-btn" disabled={busy || !link.trim()} onClick={() => applyImage(async () => { const source = validateImageLink(link); await loadProjectImage(source); return source; }, 'Image link applied.')}>Use link</button></div>
      </details>
      {error && <p className="project-image-error" role="alert">{error}</p>}
      {value && failedSource === value && <p className="project-image-error" role="alert">This image could not load. Use a direct image link or upload a file.</p>}
      <span className="project-image-feedback" role="status" aria-live="polite">{message}</span>
    </div>
  );
}
