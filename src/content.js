// Everything a visitor reads. Edit here; the page has no other copy.
export const content = {
  name: ['Saad', 'Akhtar'],
  role: 'Full-stack developer and AI student in Lahore.',
  pitch: 'Useful interfaces, thoughtful systems, built with curiosity.',
  // The Showcase. Each chapter's line is both its narration (public/showcase/audio/<id>.wav) and its caption.
  // Only the intro is Saad's own wording; the other lines are drafts for him to approve or rewrite.
  showcase: {
    intro: {
      kicker: 'About me',
      line: 'I work where interfaces, data, and systems meet. I like software that feels considered.',
    },
    interfaces: {
      kicker: '3D product visuals',
      line: 'I render products in 3D, down to the last component, so you can see how they are made. Every layer has a reason to be there.',
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
      line: 'Data should answer a question before you have to ask it. These are dashboards I have built.',
      boards: [
        { title: 'Netflix Data Visualiser', note: 'Genres, release trends and ratings across the catalogue.', image: '/images/netflix-visualiser.jpg' },
        { title: 'PNLF dashboard', note: 'Screenshot on the way.' },
        { title: 'PNLF dashboard', note: 'Screenshot on the way.' },
      ],
    },
    backend: {
      kicker: 'Backend',
      line: 'Behind every screen is a system that keeps it honest. I build the backend too, so changing the site is a decision, not a deployment.',
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
      line: 'Security is not a feature you add at the end. It is every layer saying no to the wrong thing, quietly, every time.',
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
      id: 'interviewer',
      title: 'AI Interviewer',
      year: '2026',
      status: 'In the lab',
      stack: ['Python', 'LLM', 'Prompt design'],
      role: 'Product and development',
      description: 'Role-specific interview practice with questions that respond to the conversation and feedback on every answer. A quieter place to make your first mistakes.',
    },
    {
      id: 'hospital',
      title: 'Hospital Database',
      year: '2025',
      status: 'Complete',
      stack: ['MySQL', 'SQL', 'ERD'],
      role: 'Database design',
      description: 'A normalized relational model connecting patients, staff, appointments and billing, with the multi-join queries a front desk actually needs.',
    },
    {
      id: 'hotel',
      title: 'Hotel Management System',
      year: '2025',
      status: 'Archived',
      stack: ['C++', 'OOP', 'File I/O'],
      role: 'Architecture and development',
      description: 'Rooms, bookings, customers and services in a modular C++ system. An exercise in making the architecture as orderly as the reception desk.',
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
    },
  ],
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
  email: 'saadsalam659@gmail.com',
  // Add LinkedIn here once the profile URL is confirmed.
  links: [
    { label: 'GitHub', url: 'https://github.com/saaddahub' },
  ],
};
