import { useEffect, useState } from 'react';

// Story Mode ships in its own chunk. The router awaits loadStory() before the page transition starts,
// so the transition always captures the finished first screen.
let StoryMode = null;
export const loadStory = () => (StoryMode ? Promise.resolve() : import('../story/StoryMode.jsx').then(m => m.ready.then(() => { StoryMode = m.default; })));

export default function Story() {
  const [, setReady] = useState(!!StoryMode);
  useEffect(() => { if (!StoryMode) loadStory().then(() => setReady(true)); }, []);
  return StoryMode ? <StoryMode /> : null;
}
