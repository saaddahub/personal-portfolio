import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Command, Monitor } from 'lucide-react';
import './arrival.css';

export default function Arrival({ onSelect, skip, reduced, onSkip }) {
  const [selected, setSelected] = useState(null), timer = useRef(null), container = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const choose = era => {
    if (selected) return;
    setSelected(era);
    timer.current = setTimeout(() => onSelect(era), skip || reduced ? 0 : 420);
  };
  return <div className={`os-arrival arrival-studio ${selected ? 'arrival-committing' : ''}`} data-still={skip || reduced || undefined} data-selected={selected || undefined} ref={container}>
    <div className="arrival-light" aria-hidden="true" />
    <header><span className="os-arrival-brand">Saad <em>Akhtar</em><span className="arrival-brand-dot" /></span><a href="/read">Read portfolio <ArrowRight size={14} /></a></header>
    <div className="arrival-greeting"><h1 aria-label="Well, hello."><span className="arrival-word" aria-hidden="true">{'Well,'.split('').map((c, i) => <span key={i} style={{ '--letter': i }}>{c}</span>)}</span>{' '}<em className="arrival-word" aria-hidden="true">{'hello.'.split('').map((c, i) => <span key={i} style={{ '--letter': i + 5 }}>{c}</span>)}</em></h1><p>A familiar feeling. A new perspective.<br className="arrival-mobile-break" /> Make yourself at home.</p></div>
    <div className="arrival-monitor-labels" aria-hidden="true"><span>Rowan <b>98</b><small>A little nostalgia.</small></span><span>Rowan <b>2026</b><small>A little possibility.</small></span></div>
    <div className="arrival-popup-anchor"><section className="arrival-popup" role="dialog" aria-labelledby="arrival-choice-title" aria-describedby="arrival-choice-copy">
      <div className="arrival-popup-caption"><span className="arrival-caption-mark"><Command size={13} /> Rowan</span><span className="arrival-caption-dots" aria-hidden="true"><i /><i /><i /></span></div>
      <div className="arrival-popup-body"><div className="arrival-popup-title"><h2 id="arrival-choice-title">Where shall we <em>begin?</em></h2><p id="arrival-choice-copy">Choose an era. I’ll take you inside.</p></div>
        <div className="arrival-choices">{[['98', '1998', 'The familiar one.'], ['26', '2026', 'The next chapter.']].map(([era, year, description]) => <button key={era} disabled={Boolean(selected)} onClick={() => choose(era)} className={selected === era ? 'chosen' : ''} aria-label={`Enter Rowan ${year}`}><span className={`arrival-computer-symbol ${era === '98' ? 'crt' : 'thin'}`} aria-hidden="true"><Monitor size={30} strokeWidth={era === '98' ? 2.4 : 1.1} /></span><span><strong>{year}</strong><small>{description}</small></span><span className="arrival-choice-arrow">{selected === era ? <Check size={19} /> : <ArrowRight size={19} />}</span></button>)}</div>
        <div className="arrival-popup-footer"><label><input type="checkbox" checked={skip} onChange={e => onSkip(e.target.checked)} /> Skip intro motion</label><span>Same mind. Different time.</span></div>
      </div>
    </section></div>
    <div className="arrival-commit-label" role="status">{selected && <>See you in <em>{selected === '98' ? '1998.' : '2026.'}</em></>}</div>
  </div>;
}
