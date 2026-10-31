import { ui } from './../../data/content';
import type { StoryChapter } from '../../data/story';
import { Typewriter } from './Typewriter';
export function Chapter({ chapter, skip, paused, onDone }: { chapter: StoryChapter; skip: boolean; paused: boolean; onDone: () => void }) {
  return <div className="chapter"><h1 className="chapter-title">{ui.ch0}{chapter.id} <span>{chapter.title}</span></h1><p className="chapter-script"><Typewriter text={chapter.lines.join('\n\n')} skip={skip} paused={paused} onDone={onDone} /><span className="cursor">{ui.symbol14}</span></p></div>;
}
