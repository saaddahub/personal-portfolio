// My Story: Saad's own life, in seven chapters. Copy lives in content.js; each Scene is its choreography.
import { mine } from './content.js';
import Lahore from './Lahore.jsx';
import Voice from './Voice.jsx';
import Switch from './Switch.jsx';
import Umt from './Umt.jsx';
import Teaching from './Teaching.jsx';
import OffClock from './OffClock.jsx';
import Next from './Next.jsx';

const chapter = (id, Scene, height, still) => {
  const { kicker, title, voice } = mine[id];
  return { id, kicker, title, height, still, voice, Scene };
};

export default {
  id: 'mine',
  title: mine.title,
  blurb: mine.blurb,
  chapters: [
    chapter('lahore', Lahore, '320vh', 0.62),
    chapter('voice', Voice, '280vh', 0.66),
    chapter('switch', Switch, '360vh', 0.8),
    chapter('umt', Umt, '300vh', 0.66),
    chapter('teaching', Teaching, '300vh', 0.74),
    chapter('offclock', OffClock, '320vh', 0.8),
    chapter('next', Next, '340vh', 0.7),
  ],
};
