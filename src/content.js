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
      // Bottom to top. Drawn plates stand in until Saad's 3D product frame sequence arrives.
      layers: [
        { part: 'Chassis', label: 'Accessibility' },
        { part: 'Battery', label: 'Performance' },
        { part: 'Logic board', label: 'State and logic' },
        { part: 'Display', label: 'Interface' },
        { part: 'Glass', label: 'Visual design' },
      ],
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
