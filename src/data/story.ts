export interface StoryChapter {
  id: number; title: string; timecode: string; lines: string[];
  scene: 'static' | 'room' | 'code' | 'wireframe' | 'builds' | 'now' | 'stars';
  mood: number; durationHint: number;
}
// EDIT ME — bracketed details are deliberately unfinished personal facts.
export const story: StoryChapter[] = [
  { id: 0, title: 'STATIC', timecode: '00:00', scene: 'static', mood: 2, durationHint: 14, lines: ['Somewhere in [CITY], [YEAR].', 'A kid and a [FIRST DEVICE].', 'A faint signal. Just enough to follow.'] },
  { id: 1, title: 'ORIGIN', timecode: '00:14', scene: 'room', mood: 1, durationHint: 17, lines: ['I didn’t start with a plan. I started with a question.', 'What happens if I press this?', 'Then something I made worked. A very small thing. It felt enormous.'] },
  { id: 2, title: 'FIRST LINE', timecode: '00:31', scene: 'code', mood: 2, durationHint: 16, lines: ['My first line of [LANGUAGE] was not elegant.', 'Neither was the error message.', 'But a blank screen had become something I could change. That was the hook.'] },
  { id: 3, title: 'THE GRIND', timecode: '00:47', scene: 'wireframe', mood: 3, durationHint: 18, lines: ['University. Side projects. Tabs that should have been closed hours ago.', 'I learned to read the error. Then the documentation. Occasionally in that order.', 'Somewhere between [A HARD LESSON] and the next attempt, things began to click.'] },
  { id: 4, title: 'BUILDS', timecode: '01:05', scene: 'builds', mood: 0, durationHint: 20, lines: ['A data visualiser, to find the story inside a catalogue.', 'A database, to put a little order into a complicated place.', 'An AI interviewer, to make practice feel like a conversation.', 'Small problems. Real decisions. A little more craft each time.'] },
  { id: 5, title: 'NOW', timecode: '01:25', scene: 'now', mood: 0, durationHint: 17, lines: ['Right now: studying AI, building interfaces, asking better questions.', 'I care about the last ten percent. The empty state. The keyboard shortcut. The button that feels right.', 'Useful is good. Useful and considered is better.'] },
  { id: 6, title: 'NEXT / TRANSMIT', timecode: '01:42', scene: 'stars', mood: 2, durationHint: 17, lines: ['I don’t have the whole map yet.', 'I want to build things that make someone’s day a little easier. With people who care how they’re made.', 'If you’re still watching, say hi.'] },
];
