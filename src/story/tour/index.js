import { content } from '../../content.js';
import { lines } from './lines.js';
import { Layers, Netflix, Interviewer, Hospital, Hotel, Site, Closing } from './scenes.jsx';

// The Tour: the Showcase narrator walks the visitor through what Saad builds, each project taken apart into its
// layers. Voice lines are drafts for Saad to approve; clips arrive later as /showcase/audio/tour-<chapter>.<n>.mp3.
const title = id => content.projects.find(p => p.id === id).title;

export default {
  id: 'tour',
  title: 'The Tour',
  blurb: 'What Saad builds, taken apart layer by layer while the narrator talks.',
  chapters: [
    {
      id: 'layers', kicker: 'Before we start', title: 'Everything comes in layers', height: '260vh', still: 0.55, Scene: Layers,
      voice: lines.layers,
    },
    {
      id: 'netflix', kicker: 'Chapter one', title: title('netflix'), height: '360vh', still: 0.66, Scene: Netflix,
      voice: lines.netflix,
    },
    {
      id: 'interviewer', kicker: 'Chapter two', title: title('interviewer'), height: '320vh', still: 0.66, Scene: Interviewer,
      voice: lines.interviewer,
    },
    {
      id: 'hospital', kicker: 'Chapter three', title: title('hospital'), height: '320vh', still: 0.66, Scene: Hospital,
      voice: lines.hospital,
    },
    {
      id: 'hotel', kicker: 'Chapter four', title: title('hotel'), height: '320vh', still: 0.6, Scene: Hotel,
      voice: lines.hotel,
    },
    {
      id: 'site', kicker: 'Chapter five', title: 'This site', height: '360vh', still: 0.5, Scene: Site,
      voice: lines.site,
    },
    {
      id: 'end', kicker: 'The end', title: 'Your turn', height: '220vh', still: 0.75, Scene: Closing,
      voice: lines.end,
    },
  ],
};
