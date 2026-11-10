// Everything a visitor reads. Edit here; the page has no other copy.
const email = 'saadsalam659@gmail.com';

export const content = {
  name: ['Saad', 'Akhtar'],
  role: 'Full-stack developer and AI student in Lahore.',
  pitch: 'Useful interfaces, thoughtful systems, built with curiosity.',
  // The Showcase. A dry British narrator talks about Saad as you scroll. voice: [scroll progress, line] beats;
  // each line plays from public/showcase/audio/<chapter>.<n>.mp3 and is shown as the caption.
  // Rerun scripts/narrate.py after editing any line. The voice lines are drafts for Saad to approve or rewrite.
  showcase: {
    intro: {
      kicker: 'About me',
      line: 'I work where interfaces, data, and systems meet. I like software that feels considered.', // Saad's own words, on screen
      voice: [
        [0.02, 'Right then. This is Saad. He builds software in Lahore. I just do the talking.'],
        [0.5, 'Interfaces, data and systems. Most people pick one. He wanted all three. Greedy.'],
      ],
    },
    interfaces: {
      kicker: '3D product visuals',
      voice: [
        [0.03, 'Keep scrolling. He’s taking a keyboard apart. Relax, it’s a render. No keys were harmed.'],
        [0.5, 'Every layer, numbered and named. Keycaps, switches, the circuit board. He does love a label.'],
        [0.72, 'Closer now. The little bits matter most. That tiny crystal keeps the time. Bless it.'],
      ],
      // Frames from Saad's Flow video, in playback order (assembled first). Made with scripts/prepare-frames.py.
      product: {
        path: '/showcase/frames/keyboard',
        frames: 190,
        still: '/showcase/frames/keyboard/still.webp', // the last frame, full size and sharpened, used for the zoom
        alt: 'A mechanical keyboard with yellow switches coming apart into its keycaps, switches, frame, circuit board and case.',
        // Callouts, measured on the last frame in 1920x1080 frame pixels. side: which way the label reaches;
        // dy: nudges a label up or down to clear a neighbour.
        parts: [
          { x: 465, y: 262, side: 'l', name: 'Keycaps', note: 'Two-tone, 75% layout' },
          { x: 1458, y: 205, side: 'r', name: 'Rotary knob', note: 'Volume and media' },
          { x: 505, y: 470, side: 'l', name: 'Yellow switches', note: 'One under every key' },
          { x: 425, y: 610, side: 'l', name: 'Top frame', note: 'Holds the switches in place' },
          { x: 1452, y: 800, side: 'r', name: 'Circuit board', note: 'Turns presses into signals' },
          { x: 1484, y: 915, side: 'r', name: 'Bottom case', note: 'Closes it all up' },
        ],
        // Then the camera moves in on the right-hand side for the small parts.
        zoom: { x: 1250, y: 600, scale: 1.8 },
        details: [
          { x: 1297, y: 423, side: 'r', name: 'Keycap', note: 'Sits on the switch stem' },
          { x: 1307, y: 600, side: 'r', name: 'Yellow switch', note: 'Springs back after every press' },
          { x: 1072, y: 612, side: 'l', name: 'Stabiliser', note: 'Keeps long keys level' },
          { x: 1425, y: 737, side: 'r', name: 'USB port', note: 'Power and data' },
          { x: 1210, y: 727, side: 'l', dy: -26, name: 'Clock crystal', note: 'Keeps the timing exact' },
          { x: 940, y: 745, side: 'r', dy: 34, name: 'Microcontroller', note: 'Reads every keypress' },
        ],
      },
    },
    dashboards: {
      kicker: 'Dashboards',
      voice: [
        [0.03, 'Dashboards. Numbers, made friendly. They answer the question before you’ve asked it.'],
        [0.14, 'That’s the entire Netflix catalogue, charted. He called it research. I’m not arguing.'],
        [0.45, 'These two are for PNLF. I’d explain the charts, but I’m only the voice.'],
      ],
      boards: [
        { title: 'Netflix Data Visualiser', note: 'Genres, release trends and ratings across the catalogue.', image: '/images/netflix-visualiser.jpg' },
        { title: 'PNLF dashboard', note: 'Screenshot on the way.' },
        { title: 'PNLF dashboard', note: 'Screenshot on the way.' },
      ],
    },
    backend: {
      kicker: 'Backend',
      voice: [
        [0.04, 'Now, the bit nobody sees. Watch one small edit in the admin.'],
        [0.4, 'Checked, saved, cache cleared, live. Nobody had to redeploy anything. Lovely.'],
      ],
      field: 'Contact headline',
      from: 'Get in touch.',
      to: 'Say hello.',
      stages: [
        ['Admin', 'A signed-in editor changes one field.'],
        ['API', 'One endpoint receives the change.'],
        ['Validation', 'The input is checked before anything is written.'],
        ['Database', 'contact.headline: “Get in touch.” → “Say hello.”'],
        ['Cache', 'The old page is cleared, so nobody sees stale copy.'],
        ['Site', 'The live site shows the new headline.'],
      ],
    },
    security: {
      kicker: 'Security',
      voice: [
        [0.04, 'Security. Five layers, and each one says no to something different.'],
        [0.3, 'Here come the bad requests. Every one stops at its layer. Politely. Firmly.'],
        [0.8, 'That’s the tour. The proper work is just below. I’ll be quiet now. Promise.'],
      ],
      // Outermost first. Saad to confirm each layer is one his projects actually use.
      layers: [
        ['HTTPS', 'Eavesdropping'],
        ['Rate limiting', 'Too many requests'],
        ['Authentication', 'Stolen token'],
        ['Authorisation', 'Someone else’s data'],
        ['Input validation', 'SQL injection'],
      ],
    },
  },
  projects: [
    {
      id: 'pnlf',
      title: 'Pakistan’s National Students Forum',
      year: '', // [year, from Saad]
      status: '', // [status, from Saad]
      stack: [], // [built with, from Saad]
      role: '', // [role, from Saad]
      description: '', // [one line, from Saad]
    },
    {
      id: 'interviewer',
      title: 'AI Interviewer',
      year: '2026',
      status: 'In the lab',
      stack: ['Python', 'LLM', 'Prompt design'],
      role: 'Product and development',
      description: 'Role-specific interview practice with questions that respond to the conversation and feedback on every answer. A quieter place to make your first mistakes.',
    },
    {
      id: 'imc',
      title: 'IMC, Islam Medical Complex',
      year: '', // [year, from Saad]
      status: '', // [status, from Saad]
      stack: [], // [built with, from Saad]
      role: '', // [role, from Saad]
      description: '', // [one line, from Saad]
    },
    {
      id: 'netflix',
      title: 'Netflix Data Visualiser',
      year: '2026',
      status: 'Live',
      stack: ['Python', 'Pandas', 'Streamlit'],
      role: 'Data analysis and development',
      description: 'A closer look at what we watch. An interactive exploration of genres, release trends, content ratings and the geography of the Netflix catalogue.',
      liveUrl: 'https://netflix-analysis-pandas.streamlit.app',
      image: '/images/netflix-visualiser.jpg',
      alt: 'Netflix Data Visualiser dashboard with charts of genres and release years',
    },
    {
      id: 'hospital',
      title: 'Hospital Database',
      year: '2025',
      status: 'Complete',
      stack: ['MySQL', 'SQL', 'ERD'],
      role: 'Database design',
      description: 'A normalized relational model connecting patients, staff, appointments and billing, with the multi-join queries a front desk actually needs.',
      hidden: true, // not on the Work page; the Tour still uses its data
    },
    {
      id: 'hotel',
      title: 'Hotel Management System',
      year: '2025',
      status: 'Archived',
      stack: ['C++', 'OOP', 'File I/O'],
      role: 'Architecture and development',
      description: 'Rooms, bookings, customers and services in a modular C++ system. An exercise in making the architecture as orderly as the reception desk.',
      hidden: true, // not on the Work page; the Tour still uses its data
    },
    {
      id: 'blossom',
      title: 'This site',
      year: '2026',
      status: 'Live',
      stack: ['React', 'Canvas', 'Lenis'],
      role: 'Design and development',
      description: 'A procedural cherry tree that grows on every visit, and petals carried by a wind you steer with your pointer and your scroll.',
      liveUrl: 'https://saadsalam.dev',
      hidden: true, // not on the Work page; the Tour still uses its data
    },
  ],
  // Dashboards on the Work page, each tilting up into view as it scrolls in. Empty until Saad sends them; until
  // then the page says they are on the way. One entry per dashboard, in display order:
  // { title, note (one line), image: '/images/<file>' in public/, alt (required with image), url (optional live link) }
  dashboards: [],
  about: [
    'I’m Saad, a developer in Lahore studying Artificial Intelligence at the University of Management and Technology. I build full-stack products and the data tools behind them, and I’m spending this year going deep on machine learning.',
    'Most of my time goes into building things, taking them apart, and finding a simpler way to put them back together. Good documentation, I maintain, counts as a love language.',
  ],
  currently: [
    ['Building', 'Small tools with a useful point of view.'],
    ['Learning', 'Machine learning, one experiment at a time.'],
    ['Listening', 'Late-night instrumentals.'],
  ],
  experience: [
    { years: '2024–2028', title: 'BS Artificial Intelligence', place: 'University of Management and Technology, Lahore', description: 'Data structures, object-oriented programming, databases and machine learning.' },
    { years: '2025–now', title: 'Independent developer', place: 'Personal and freelance projects', description: 'Full-stack interfaces and AI-assisted tools, followed from the first sketch to the last awkward edge case.' },
    { years: '2024–2025', title: 'Private tutor', place: 'English and communication', description: 'Helping students find a clearer voice through conversation, vocabulary and structured practice.' },
    { years: '2019', title: 'First prize, speech and documentation', place: 'School competition', description: 'An early lesson that explaining an idea is part of making it work.' },
  ],
  availability: 'Open to internships, research roles and collaborative projects. Email is the quickest way to reach me.',
  email,
  // The Socials list that ends the Contact page, in this order: { label, handle (shown under it), url }.
  // Confirmed links only. LinkedIn goes in once its URL is confirmed.
  socials: [
    { label: 'GitHub', handle: 'saaddahub', url: 'https://github.com/saaddahub' },
    { label: 'Email', handle: email, url: `mailto:${email}` },
  ],
};
