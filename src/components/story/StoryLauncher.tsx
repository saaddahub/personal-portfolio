import { ui } from './../../data/content';
import { Play } from 'lucide-react';
import { story } from '../../data/story';
import { monitor } from '../../store/useMonitor';
import { readStorage } from '../../store/monitorState';
export function StoryLauncher() {
  const saved = readStorage(sessionStorage, 'sa01-chapter'); const resume = saved === null ? -1 : Number(saved);
  return <section className="story-launcher"><div className="large-tape" aria-hidden="true"><i /><i /><span>{ui.sa01TransmissionVol01}</span></div><h1>{ui.transmission}<span className="cursor">{ui.symbol8}</span></h1><p>{ui.aShortStoryAboutCuriosityComputersAnd}</p><div className="terminal-actions"><button className="accent-button" onClick={() => monitor.story()}><Play size={15} />{ui.playFromTheBeginning}</button>{resume >= 0 && resume < 7 && <button onClick={() => monitor.story(resume)}>{ui.resumeTape0}{resume}{ui.symbol13}</button>}</div><div className="chapter-select">{story.map(chapter => <button key={chapter.id} onClick={() => monitor.story(chapter.id)}><span>{ui.label0}{chapter.id}</span>{chapter.title}<small>{chapter.timecode}</small></button>)}</div></section>;
}
