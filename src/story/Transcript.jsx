import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { Link } from '../router.jsx';

// "Read instead": the whole mode as plain text, with chapter headings and no voice.
export default function Transcript({ mode, other, go }) {
  return (
    <article className="transcript wrap" aria-labelledby={`${mode.id}-read-title`}>
      <div className="tr-sheet glass story-sheet">
        <div className="mode-crumbs">
          <button type="button" className="story-link" onClick={() => go({ id: null })}><ArrowLeft aria-hidden="true" />The story so far</button>
          <button type="button" className="story-link" onClick={() => go({ id: mode.id, read: false })}><Play aria-hidden="true" />Watch instead</button>
        </div>
        <h1 id={`${mode.id}-read-title`} className="page-title tr-title" tabIndex={-1}>{mode.title}</h1>
        <p className="tr-lead">{mode.blurb} The words, without the voice.</p>
        {mode.chapters.map(ch => (
          <section key={ch.id} className="tr-chapter" aria-labelledby={`read-${mode.id}-${ch.id}`}>
            <h2 id={`read-${mode.id}-${ch.id}`}><span className="ch-kicker">{ch.kicker}</span> {ch.title}</h2>
            {ch.voice.map(([, line], i) => <p key={i}>{line}</p>)}
          </section>
        ))}
        <div className="tr-end">
          <Link to="/contact" className="action action-primary">Say hello<ArrowRight aria-hidden="true" /></Link>
          {other && <button type="button" className="story-link" onClick={() => go({ id: other.id, read: true })}>Read {other.title}<ArrowRight aria-hidden="true" /></button>}
        </div>
      </div>
    </article>
  );
}
