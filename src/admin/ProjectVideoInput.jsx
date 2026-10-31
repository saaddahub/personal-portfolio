import { useId, useState } from 'react';
import { externalLink } from '../lib/projects';

export default function ProjectVideoInput({ value = '', onChange }) {
  const id = useId();
  const [failed, setFailed] = useState('');
  const source = externalLink(value);
  const error = value.trim() && !source ? 'Use a complete http:// or https:// video URL.' : source && failed === source ? 'This video could not load. Use a direct MP4 or WebM link.' : '';
  return (
    <div className="admin-field-group">
      <label className="admin-label" htmlFor={id}>Project video (optional)</label>
      <input id={id} className="admin-input" type="url" value={value} onChange={event => onChange(event.target.value)} placeholder="https://example.com/project.webm" aria-invalid={Boolean(error)} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} />
      <p className="project-image-help" id={`${id}-help`}>Direct MP4 or WebM link. Videos play muted in the slideshow; the project image remains the cover.</p>
      {source && <video key={source} src={source} className="project-image-editor-preview" controls muted playsInline preload="metadata" onError={() => setFailed(source)} />}
      {error && <p id={`${id}-error`} className="project-image-error" role="alert">{error}</p>}
    </div>
  );
}
