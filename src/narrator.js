// The Showcase soundtrack: recorded narration over a soft music bed synthesized in the browser.
// Nothing makes a sound until startSound() runs from a click, because browsers block audio before that.

const MUSIC_LEVEL = 0.32, DUCKED = 0.3, INTRO_DELAY = 1.5;
// D, Bm, G, A: a slow, warm progression. Each chord swells for 12s and the next starts at 9s.
const CHORDS = [
  [146.83, 220.0, 277.18, 329.63],
  [123.47, 185.0, 220.0, 293.66],
  [98.0, 146.83, 185.0, 246.94],
  [110.0, 164.81, 220.0, 277.18],
];

let ctx, master, duck, voiceBus, startedAt = 0, current = null, wanted = null, timer = 0;
const buffers = {}, played = new Set();

export const soundStarted = () => !!ctx;

export function startSound(ids) {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.connect(ctx.destination);
  duck = ctx.createGain();
  duck.connect(master);
  voiceBus = ctx.createGain();
  voiceBus.connect(master);
  startedAt = ctx.currentTime;

  const music = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.connect(music).connect(duck);
  music.gain.setValueAtTime(0, startedAt);
  music.gain.linearRampToValueAtTime(MUSIC_LEVEL, startedAt + 2.5);
  let chord = 0;
  const swell = () => {
    if (ctx.state !== 'running') return; // a suspended clock would stack every missed chord on resume
    const t = ctx.currentTime;
    for (const f of CHORDS[chord++ % CHORDS.length]) for (const detune of [-5, 5]) {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.frequency.value = f;
      osc.detune.value = detune;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 3);
      g.gain.linearRampToValueAtTime(0, t + 12);
      osc.connect(g).connect(filter);
      osc.start(t);
      osc.stop(t + 12.1);
    }
  };
  swell();
  timer = setInterval(swell, 9000);

  for (const id of ids) {
    fetch(`/showcase/audio/${id}.wav`)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then(b => ctx.decodeAudioData(b))
      .then(buf => { buffers[id] = buf; if (wanted === id) speak(id); }) // asked for before it finished loading
      .catch(() => {}); // a missing clip leaves that chapter on captions alone
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? ctx.suspend() : ctx.resume()));
}

// Play a chapter's line once per visit. force replays it.
export function speak(id, force = false) {
  if (!ctx || current?.id === id) return;
  hush();
  wanted = id;
  const buf = buffers[id];
  if (!buf || (played.has(id) && !force)) return;
  const at = Math.max(ctx.currentTime + 0.15, startedAt + INTRO_DELAY);
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf;
  src.connect(g).connect(voiceBus);
  src.start(at);
  src.onended = () => { if (current?.src === src) current = null; };
  duck.gain.setTargetAtTime(DUCKED, at - 0.3, 0.15);
  duck.gain.setTargetAtTime(1, at + buf.duration, 0.5);
  played.add(id);
  current = { id, src, g, at, duration: buf.duration };
}

// Fade the current line out, for example when the visitor scrolls on to the next chapter.
export function hush() {
  wanted = null;
  if (!current) return;
  const now = ctx.currentTime;
  current.g.gain.setTargetAtTime(0, now, 0.15);
  current.src.stop(now + 0.8);
  duck.gain.cancelScheduledValues(now);
  duck.gain.setTargetAtTime(1, now, 0.4);
  current = null;
}

export function setMuted(muted) {
  if (ctx) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.08);
}

// How far through its line a chapter is (0–1), 1 once it has been heard, null if not playing.
export function voiceProgress(id) {
  if (current?.id === id) return Math.min(Math.max((ctx.currentTime - current.at) / current.duration, 0), 1);
  return played.has(id) ? 1 : null;
}

