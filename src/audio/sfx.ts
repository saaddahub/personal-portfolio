type Sound = 'power' | 'degauss' | 'button' | 'ratchet' | 'static' | 'blip' | 'type' | 'tape' | 'land' | 'chime';
let context: AudioContext | undefined;
let master: GainNode | undefined;
let analyser: AnalyserNode | undefined;
let hum: OscillatorNode | undefined;
let humGain: GainNode | undefined;
let muted = true;
let powered = false;
function tone(frequency: number, duration: number, volume: number, end = frequency, delay = 0) {
  if (!context || !master) return;
  const oscillator = context.createOscillator(); const gain = context.createGain(); const now = context.currentTime + delay;
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, now); oscillator.frequency.exponentialRampToValueAtTime(Math.max(end, 1), now + duration);
  gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(gain).connect(master); oscillator.start(now); oscillator.stop(now + duration);
}
function noise(duration: number, volume: number) {
  if (!context || !master) return;
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource(); const filter = context.createBiquadFilter(); const gain = context.createGain();
  source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 1800; filter.Q.value = .5;
  gain.gain.setValueAtTime(volume, context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
  source.connect(filter).connect(gain).connect(master); source.start(); source.stop(context.currentTime + duration);
}
export const sfx = {
  unlock(isMuted: boolean) {
    muted = isMuted;
    try {
      if (!context) {
        context = new AudioContext(); master = context.createGain(); analyser = context.createAnalyser(); analyser.fftSize = 64;
        master.connect(analyser).connect(context.destination);
        hum = context.createOscillator(); humGain = context.createGain(); hum.frequency.value = 60;
        hum.connect(humGain).connect(master); hum.start(); humGain.gain.value = powered ? .012 : 0;
      }
      master!.gain.value = muted ? 0 : .28;
      if (context.state === 'suspended') void context.resume().catch(() => {});
    } catch { /* Browsers without Web Audio still provide a silent portfolio. */ }
  },
  setMuted(value: boolean) { muted = value; if (!context) sfx.unlock(value); if (context && master) master.gain.setTargetAtTime(value ? 0 : .28, context.currentTime, .03); },
  power(value: boolean) { powered = value; if (context && humGain) humGain.gain.setTargetAtTime(value ? .012 : 0, context.currentTime, .15); },
  analyser: () => analyser,
  play(sound: Sound) {
    if (!context || muted || context.state !== 'running') return;
    switch (sound) {
      case 'static': noise(.22, .12); break;
      case 'tape': noise(.28, .13); tone(320, .18, .08, 90); break;
      case 'degauss': tone(110, .55, .6, 35); tone(1800, .25, .025, 400); break;
      case 'land': tone(70, .22, .5, 30); break;
      case 'chime': tone(523, .3, .16); tone(659, .35, .14, 659, .12); tone(784, .4, .12, 784, .24); break;
      case 'power': tone(180, .07, .22, 70); break;
      case 'blip': tone(880, .08, .08, 600); break;
      case 'type': noise(.012, .025); break;
      case 'ratchet': noise(.018, .1); break;
      case 'button': tone(260, .035, .13, 90); break;
    }
  },
};
