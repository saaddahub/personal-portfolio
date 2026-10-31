import { ui, messages } from './../../data/content';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { story } from '../../data/story';
import { monitor, useMonitor } from '../../store/useMonitor';
import { writeStorage } from '../../store/monitorState';
import { Chapter } from './Chapter';
import { scenes } from './scenes';

export default function StoryMode() {
  const state = useMonitor(); const reduced = useReducedMotion(); const [elapsed, setElapsed] = useState(0); const [skip, setSkip] = useState(false); const [typed, setTyped] = useState(false);
  const [hidden, setHidden] = useState(document.hidden); const touch = useRef(0); const chapter = story[state.chapter]; const textOnly = state.textOnly || reduced;
  useEffect(() => { setElapsed(0); setSkip(false); setTyped(false); writeStorage(sessionStorage, 'sa01-chapter', String(state.chapter)); }, [state.chapter]);
  useEffect(() => { const visible = () => setHidden(document.hidden); document.addEventListener('visibilitychange', visible); return () => document.removeEventListener('visibilitychange', visible); }, []);
  useEffect(() => {
    if (!state.playing || state.ended || hidden) return;
    const timer = setInterval(() => setElapsed(v => v + .25), 250); return () => clearInterval(timer);
  }, [state.playing, state.ended, hidden]);
  useEffect(() => { if (elapsed >= chapter.durationHint && typed && state.playing && !state.ended) monitor.chapter(state.chapter + 1); }, [elapsed, chapter.durationHint, typed, state.playing, state.ended, state.chapter]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => { if (event.code !== 'Space' || event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement) return; event.preventDefault(); if (!typed) setSkip(true); else monitor.play(); };
    window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard);
  }, [typed]);
  const seconds = Math.floor(story.slice(0, state.chapter).reduce((sum, ch) => sum + ch.durationHint, 0) + elapsed);
  const timecode = `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const Scene = scenes[chapter.scene];
  return <section className={`story-mode ${textOnly ? 'text-only-story' : ''} ${state.playing ? '' : 'tape-paused'}`}>
    <div className="letterbox top-letterbox" /><header className="story-status"><span className="rec-label">{ui.rec}<b>{state.playing ? ui.play : ui.pause}</b></span><span>{timecode}</span><button onClick={monitor.exit}>{ui.exit}</button></header>
    {state.ended ? <div className="story-end"><div className="end-bars" /><p>{ui.tape01Complete}</p><h1>{ui.endOf}<br />{ui.transmission}<span className="cursor">{ui.symbol8}</span></h1><p>{ui.ifYouReStillWatchingSayHi}</p><div className="terminal-actions"><button onClick={() => monitor.story()}>{ui.replay}</button><button onClick={() => monitor.tune(3)}>{ui.seeProjects}</button><button onClick={() => monitor.tune(6)}>{ui.contactMe}</button></div></div> : <div className="story-stage" onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { const difference = event.changedTouches[0].clientX - touch.current; if (Math.abs(difference) > 50) { monitor.step(difference < 0 ? 1 : -1); } }} onClick={event => { if ((event.target as HTMLElement).closest('button')) return; if (!typed) setSkip(true); else monitor.chapter(state.chapter + 1); }}>
      {!textOnly && <div className="story-scene" key={`scene-${state.chapter}`}><Scene active={state.playing && !hidden} elapsed={elapsed} /></div>}
      <Chapter key={state.chapter} chapter={chapter} skip={skip || !!textOnly} paused={!state.playing || hidden} onDone={() => setTyped(true)} />
    </div>}
    <footer className="story-transport"><div className="transport-controls"><button onClick={() => monitor.step(-1)} aria-label={ui.previousChapter}>{ui.symbol15}</button><button onClick={() => { if (!typed) setSkip(true); else monitor.play(); }}>{!typed ? ui.skipTyping : state.playing ? ui.pause2 : ui.play2}</button><button onClick={() => monitor.step(1)} aria-label={ui.nextChapter}>{ui.symbol16}</button><button className="text-only-toggle" aria-pressed={!!textOnly} onClick={monitor.textOnly}>{ui.textOnly}{ textOnly ? ' ✓' : ''}{ui.symbol13}</button></div><div className="tape-progress">{story.map(ch => <button key={ch.id} aria-label={messages.chapter(ch.id, ch.title)} aria-current={ch.id === state.chapter ? 'step' : undefined} className={ch.id <= state.chapter ? 'played' : ''} onClick={() => monitor.chapter(ch.id)} style={{ '--progress': ch.id < state.chapter ? 1 : ch.id === state.chapter ? Math.min(1, elapsed / chapter.durationHint) : 0 } as React.CSSProperties}><i /><span>{ui.label0}{ch.id}</span></button>)}</div></footer><div className="tracking-line" /><div className="letterbox bottom-letterbox" />
  </section>;
}
