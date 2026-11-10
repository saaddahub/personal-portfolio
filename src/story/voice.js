import { preload, setMuted, startSound } from '../narrator.js';

// Narration keys are `${mode.id}-${chapter.id}.${n}`, one per voice beat, played from /showcase/audio/<key>.mp3.
export const keyOf = (mode, chapter, n) => `${mode.id}-${chapter.id}.${n}`;
export const keysOf = mode => mode.chapters.flatMap(ch => ch.voice.map((_, n) => keyOf(mode, ch, n)));

// Start (or reopen) the soundtrack and load this mode's lines. Call it from a click: browsers only let audio
// begin from a gesture. If the Showcase started the sound first, startSound returns early and preload loads ours.
export function wake(mode) {
  const keys = keysOf(mode);
  startSound(keys);
  preload(keys);
  setMuted(false);
}
