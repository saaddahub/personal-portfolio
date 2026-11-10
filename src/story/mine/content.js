// My Story: every word in Saad's own chapters. The scenes only arrange these; edit the copy here and nowhere else.
// Facts are Saad's own, approved for the site. voice: [scroll progress 0–1, line] beats, read by the same dry
// narrator as the Showcase.
import { content } from '../../content.js';

export const mine = {
  title: 'My Story',
  blurb: 'Where he’s from, and how he got here.',

  lahore: {
    kicker: 'Chapter one',
    title: 'Lahore',
    word: 'Lahore', // the letters that fall like petals and assemble
    place: 'Lahore, Pakistan',
    note: 'Born here',
    voice: [
      [0.04, 'Lahore. Gardens, kites in spring, and trees that blush pink when the kachnar blooms.'],
      [0.24, 'Saad was born here, twenty-two years ago. The only son, which explains a great deal.'],
      [0.44, 'His parents guarded him closely, guided him well, and did more for him than he can easily repay.'],
      [0.64, 'He was never one for a crowd. Screens were better company. Phones, computers, anything with a battery.'],
      [0.84, 'He loved design, too. Acting on it, he admits, could wait. It waited for years.'],
    ],
  },

  voice: {
    kicker: 'Chapter two',
    title: 'A voice worth hearing',
    year: '2019',
    prize: 'First prize',
    event: 'School speech and documentation competition',
    voice: [
      [0.04, 'In 2019, there was a school competition. Speech and documentation, of all things.'],
      [0.38, 'The quiet boy took first prize. For talking. I’ve spent a whole career trying to pull that off.'],
      [0.68, 'An early lesson, and a lasting one. Explaining an idea is part of making it work.'],
    ],
  },

  switch: {
    kicker: 'Chapter three',
    title: 'From medicine to machines',
    from: { name: 'Medical Sciences', note: 'Intermediate, 2024' },
    to: { name: 'Artificial Intelligence', note: 'BS, 2024–2028' },
    voice: [
      [0.03, 'His parents hoped for a doctor. So he studied medicine, right to the end of college.'],
      [0.28, 'Intermediate in medical sciences, 2024. And then the medical admission didn’t come.'],
      [0.5, 'Rather than sulk, he went after what he’d wanted all along. Computers.'],
      [0.76, 'Signals in, decisions out. The heart of the matter hasn’t changed much, has it?'],
    ],
  },

  umt: {
    kicker: 'Chapter four',
    title: 'University of Management and Technology',
    degree: 'BS Artificial Intelligence',
    place: 'Lahore',
    years: '2024–2028',
    subjects: ['Data structures', 'Object-oriented programming', 'Databases', 'Machine learning'],
    tools: ['Design', 'Frontend', 'Backend', 'Claude Code', 'Codex'], // what he builds with now
    voice: [
      [0.04, 'And so, his favourite degree. Artificial intelligence, at the University of Management and Technology.'],
      [0.34, 'Data structures, object-oriented programming, databases, machine learning. The proper foundations.'],
      [0.6, 'Meanwhile he builds: frontends, backends and the design in between.'],
      [0.76, 'Claude Code and Codex do some of the typing. He does the deciding.'],
    ],
  },

  teaching: {
    kicker: 'Chapter five',
    title: 'Teaching',
    // The sentence the words settle into (from his tutoring entry). The accent words are underlined as one.
    sentence: ['Helping', 'students', 'find', 'a'],
    accent: ['clearer', 'voice.'],
    topics: ['English', 'Fluency', 'Vocabulary'],
    role: 'Private tutor, 2024–2025',
    note: 'Teacher Assistant certificates',
    voice: [
      [0.04, 'He taught, too. English, fluency and vocabulary, one student at a time.'],
      [0.38, 'Helping other people find a clearer voice turned out to sharpen his own.'],
      [0.68, 'There are Teacher Assistant certificates to prove it. He’d want me to mention that.'],
    ],
  },

  offclock: {
    kicker: 'Chapter six',
    title: 'Off the clock',
    // The crosshair locks onto each of these in turn, in this order.
    targets: [
      { name: 'Valorant', note: 'Most nights' },
      { name: 'GTA', note: 'Console' },
      { name: 'Tekken', note: 'Console' },
      { name: 'The Last of Us', note: 'Favourite' },
      { name: 'Wild documentaries', note: 'Watching' },
      { name: 'Zombie apocalypse films', note: 'Genre of the moment' },
    ],
    voice: [
      [0.04, 'Off the clock, he plays. Valorant, mostly, and GTA and Tekken on the console.'],
      [0.3, 'His favourite is The Last of Us. Of course it is. The world ends, and the plants win.'],
      [0.56, 'Then wild documentaries, and films where civilisation falls over. Zombies preferred.'],
      [0.8, 'For someone so shy, he’s remarkably well prepared for the end of the world.'],
    ],
  },

  next: {
    kicker: 'Chapter seven',
    title: 'What comes next',
    to: 'To',
    name: 'Saad Akhtar',
    place: 'Lahore, Pakistan',
    message: 'Designing and building software, end to end. Learning machine learning.',
    availability: 'Open to internships, research roles and collaborative projects.',
    email: content.email,
    subject: 'Hello, Saad',
    send: 'Send',
    hint: 'Or flick the card upwards',
    postmark: 'Lahore',
    voice: [
      [0.03, 'Now, the honest bit. He’s shy, a little underconfident, and consistency is the bug he’s still fixing.'],
      [0.2, 'The work ships anyway. Which, between us, is the part that counts.'],
      [0.38, 'Next: machine learning, and software designed and built end to end.'],
      [0.54, 'He doesn’t have the whole map yet. Very few interesting people do.'],
      [0.7, 'If you’re building something that matters, and you care how it’s made, he’d like to hear from you.'],
      [0.86, 'That postcard is addressed to him. Flick it upwards, and I’ll see that it gets there.'],
    ],
  },
};
