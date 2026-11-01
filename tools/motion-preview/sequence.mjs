export const FPS = 60;
export const DURATION = 12;
export const FRAME_COUNT = FPS * DURATION;
export const clamp = value => Math.max(0, Math.min(1, value));
export const ease = value => { const t = clamp(value); return clamp(t * t * t * (t * (t * 6 - 15) + 10)); };

export function shotAt(t) {
  if (t < 2.05) return { era: 0, progress: 0, chooser: ease((t - .15) / .35), selected: t >= 1.85 ? 0 : -1, phase: 'Choose your computer' };
  if (t < 3.65) return { era: 0, progress: ease((t - 2.05) / 1.6), chooser: 1 - ease((t - 2.05) / .12), selected: 0, phase: 'Entering Rowan 98' };
  if (t < 5.3) return { era: 0, progress: 1, chooser: 0, selected: 0, phase: 'Rowan 98' };
  if (t < 6.15) return { era: 0, progress: 1 - ease((t - 5.3) / .85), chooser: 0, selected: -1, phase: 'Change computer' };
  if (t < 7.55) return { era: 1, progress: 0, chooser: ease((t - 6.15) / .25), selected: t >= 7.35 ? 1 : -1, phase: 'Choose your computer' };
  if (t < 9.15) return { era: 1, progress: ease((t - 7.55) / 1.6), chooser: 1 - ease((t - 7.55) / .12), selected: 1, phase: 'Entering Rowan' };
  return { era: 1, progress: 1, chooser: 0, selected: 1, phase: 'Rowan' };
}

export const handoffAt = progress => ease((progress - .91) / .09);
