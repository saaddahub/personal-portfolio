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
const buffers = {}, played = new Set(), requested = new Set();

export const soundStarted = () => !!ctx;

// Lines are keyed `<chapter>.<n>`, matching public/showcase/audio/<chapter>.<n>.mp3.
const chapterOf = key => key.split('.')[0];

export function startSound(keys) {
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

  preload(keys);
  document.addEventListener('visibilitychange', () => (document.hidden ? ctx.suspend() : ctx.resume()));
}

// Fetch and decode clips once the sound has started. startSound() returns early once a context exists, so
// pages that start later (Story Mode) load their own lines here. Each key is fetched once.
export function preload(keys) {
  if (!ctx) return;
  for (const key of keys) {
    if (requested.has(key)) continue;
    requested.add(key);
    fetch(`/showcase/audio/${key}.mp3`)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then(b => ctx.decodeAudioData(b))
      .then(buf => { buffers[key] = tighten(buf); if (wanted === key) speak(key); }) // asked for before it finished loading
      .catch(() => {}); // a missing clip leaves that line on captions alone
  }
}

// The TTS voice leaves about a second of silence after every sentence, which is what makes it sound read aloud.
// Keep only PAD of silence on each side of speech, so pauses shrink to 2 x PAD and the delivery stays quick.
const PAD = 0.17, QUIET = 0.004;
export function tighten(buf, make = (n, sr) => ctx.createBuffer(1, n, sr)) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, win = Math.round(sr * 0.01), pad = Math.round(sr * PAD);
  const keep = [];
  for (let i = 0; i < d.length; i += win) {
    let peak = 0;
    for (let j = i; j < Math.min(i + win, d.length); j++) peak = Math.max(peak, Math.abs(d[j]));
    if (peak < QUIET) continue;
    const a = Math.max(i - pad, 0), b = Math.min(i + win + pad, d.length), last = keep.at(-1);
    if (last && a <= last[1]) last[1] = b; else keep.push([a, b]);
  }
  if (!keep.length) return buf;
  const out = make(keep.reduce((n, [a, b]) => n + b - a, 0), sr), o = out.getChannelData(0);
  let at = 0;
  for (const [a, b] of keep) { o.set(d.subarray(a, b), at); at += b - a; }
  return out;
}

// Play a line once per visit. A line from the same chapter waits for the current one to finish, so the narrator
// never talks over himself; a line from another chapter cuts it. force replays, cutting whatever is playing.
export function speak(key, force = false) {
  if (!ctx || current?.key === key) return;
  wanted = key;
  if (current && !force && chapterOf(current.key) === chapterOf(key)) return; // onended plays it next
  hush();
  wanted = key;
  const buf = buffers[key];
  if (!buf || (played.has(key) && !force)) return;
  const at = Math.max(ctx.currentTime + 0.15, startedAt + INTRO_DELAY);
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf;
  src.connect(g).connect(voiceBus);
  src.start(at);
  src.onended = () => {
    if (current?.src !== src) return;
    current = null;
    if (wanted && wanted !== key) speak(wanted); // the visitor scrolled on to another line while this one played
  };
  duck.gain.setTargetAtTime(DUCKED, at - 0.3, 0.15);
  duck.gain.setTargetAtTime(1, at + buf.duration, 0.5);
  played.add(key);
  current = { key, src, g, at, duration: buf.duration };
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

// How far through a line the narrator is (0–1), 1 once it has been heard, null if not playing.
export function voiceProgress(key) {
  if (current?.key === key) return Math.min(Math.max((ctx.currentTime - current.at) / current.duration, 0), 1);
  return played.has(key) ? 1 : null;
}

