import { useSyncExternalStore } from 'react';
import { channels, colourNames, messages, ui } from '../data/content';
import { sfx } from '../audio/sfx';
import { channelFromHash, clamp, nextChannel, readStorage, writeStorage } from './monitorState';

interface MonitorState {
  power: boolean; phase: 'off' | 'starting' | 'on' | 'stopping'; channel: number;
  colourMode: number; brightness: number; muted: boolean; storyMode: boolean;
  chapter: number; playing: boolean; booted: boolean; help: boolean; plain: boolean;
  osd: string; glitch: number; ended: boolean; textOnly: boolean; storyTint: boolean;
}
function storedNumber(key: string, fallback: number, max: number) {
  const raw = readStorage(localStorage, key);
  return raw !== null && Number.isFinite(Number(raw)) ? clamp(Number(raw), 0, max) : fallback;
}
let state: MonitorState = {
  power: false, phase: 'off', channel: channelFromHash(location.hash), colourMode: storedNumber('sa01-colour', 0, 4),
  brightness: storedNumber('sa01-brightness', 65, 100), muted: readStorage(localStorage, 'sa01-muted') !== 'false',
  storyMode: false, chapter: 0, playing: true, booted: readStorage(sessionStorage, 'sa01-boot') === 'true',
  help: false, plain: false, osd: '', glitch: 0, ended: false, textOnly: false, storyTint: true,
};
const listeners = new Set<() => void>();
const update = (patch: Partial<MonitorState>) => { state = { ...state, ...patch }; listeners.forEach(fn => fn()); };
let osdTimer: ReturnType<typeof setTimeout>;
let powerTimer: ReturnType<typeof setTimeout>;
export const monitor = {
  get: () => state,
  announce(message: string) { clearTimeout(osdTimer); update({ osd: message }); osdTimer = setTimeout(() => update({ osd: '' }), 1800); },
  burst() { update({ glitch: state.glitch + 1 }); sfx.play('static'); },
  tune(channel: number) {
    update({ storyMode: false, ended: false });
    const hash = '#' + (channels[channel]?.toLowerCase() ?? 'no-signal');
    if (location.hash === hash) monitor.syncHash(); else location.hash = hash;
  },
  syncHash() {
    const channel = channelFromHash(location.hash);
    if (channel === state.channel) return;
    update({ channel, storyMode: false }); monitor.burst();
    monitor.announce(messages.channel(channel, channels[channel] ?? ui.noSignal));
  },
  step(direction: number) { if (!state.power) return; if (state.storyMode) monitor.chapter(state.chapter + direction); else monitor.tune(nextChannel(state.channel, direction)); },
  colour() { const colourMode = (state.colourMode + 1) % 5; update({ colourMode, storyTint: false }); writeStorage(localStorage, 'sa01-colour', String(colourMode)); monitor.announce(messages.colour(colourNames[colourMode])); monitor.burst(); sfx.play('degauss'); },
  brightness(value: number) {
    const brightness = clamp(Math.round(value));
    if (Math.floor(brightness / 5) !== Math.floor(state.brightness / 5)) sfx.play('ratchet');
    update({ brightness }); writeStorage(localStorage, 'sa01-brightness', String(brightness));
    monitor.announce(messages.brightness(brightness));
  },
  mute() { const muted = !state.muted; update({ muted }); sfx.setMuted(muted); writeStorage(localStorage, 'sa01-muted', String(muted)); monitor.announce(messages.sound(muted)); sfx.play('blip'); },
  power() {
    clearTimeout(powerTimer);
    const power = !state.power;
    update({ power, phase: power ? 'starting' : 'stopping', storyMode: false, help: false });
    sfx.power(power); sfx.play(power ? 'degauss' : 'power');
    powerTimer = setTimeout(() => update({ phase: power ? 'on' : 'off' }), power ? 650 : 1050);
  },
  boot() { update({ booted: true }); writeStorage(sessionStorage, 'sa01-boot', 'true'); monitor.announce(ui.soundHint); },
  story(chapter = 0) {
    if (!state.power) monitor.power();
    if (location.hash !== '#story') { history.pushState(null, '', '#story'); }
    update({ storyMode: true, channel: 0, chapter: clamp(chapter, 0, 6), playing: true, ended: false, storyTint: true }); monitor.burst();
  },
  chapter(chapter: number) {
    if (chapter > 6) { update({ ended: true, playing: false }); sfx.play('chime'); return; }
    const next = clamp(chapter, 0, 6); update({ chapter: next, ended: false });
    writeStorage(sessionStorage, 'sa01-chapter', String(next)); monitor.burst(); sfx.play('tape');
  },
  play() { update({ playing: !state.playing }); },
  exit() { if (state.help) update({ help: false }); else if (state.storyMode) { update({ storyMode: false }); monitor.tune(1); } },
  help() { update({ help: !state.help }); },
  plain() { update({ plain: !state.plain }); monitor.announce(state.plain ? ui.plainOn : ui.effectsOn); },
  textOnly() { update({ textOnly: !state.textOnly }); },
};
export function useMonitor() { return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => state); }
