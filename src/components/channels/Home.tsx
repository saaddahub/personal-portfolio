import { ui } from './../../data/content';
import { ArrowUpRight, Play } from 'lucide-react';
import { content } from '../../data/content';
import { monitor } from '../../store/useMonitor';
import { Typewriter } from '../story/Typewriter';
export function Home() {
  return <section className="home-channel"><div className="home-intro"><span className="terminal-prompt">{ui.cSaadPersonalSignalExe}</span><span className="signal-meter" aria-label={ui.strongSignal}>{ui.symbol7}</span></div>
    <div className="home-wordmark"><h1>{ui.saad}<br /><span>{ui.akhtar}<span className="wordmark-dot">{ui.symbol2}</span></span></h1><div className="orbit-emblem" aria-hidden="true"><i /><i /><span>{ui.sa}</span></div></div>
    <div className="role-line"><span>{ui.gt}</span><Typewriter text={content.role} /><span className="cursor">{ui.symbol8}</span></div><p className="home-pitch">{content.pitch}</p>
    <div className="home-bottom"><nav className="home-menu" aria-label={ui.channels}>{[[2, ui.aboutTheHuman], [3, ui.menuWork], [4, ui.toolsSkills], [5, ui.theJourney], [6, ui.makeContact]].map(([channel, title], index) => <button key={channel} onClick={() => monitor.tune(Number(channel))}><span className="menu-number">{ui.label0}{index + 1}</span><span>{title}</span><span className="dotted-leader" /><ArrowUpRight size={14} /></button>)}</nav>
      <button className="story-invitation" onClick={() => monitor.story()}><span className="tape-icon" aria-hidden="true"><i /><i /></span><span>{ui.thereSAStory}<br />{ui.behindTheSignal}</span><strong><Play size={13} fill="currentColor" />{ui.playTransmission}</strong><small>{ui.label7ChaptersAbout2Min}</small></button>
    </div><p className="availability"><i />{content.availability}<span>{content.location}</span></p>
  </section>;
}
