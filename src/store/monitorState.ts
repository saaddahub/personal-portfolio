export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
export function channelFromHash(hash: string): number {
  if (!hash || hash === '#') return 1;
  const name = hash.slice(1).toLowerCase();
  if (name === 'work') return 3;
  if (name === 'services') return 5;
  if (name === 'about-me') return 2;
  const index = ['story', 'home', 'about', 'projects', 'skills', 'experience', 'contact'].indexOf(name);
  return index < 0 ? 99 : index;
}
export const nextChannel = (channel: number, direction: number) => channel === 99 ? (direction > 0 ? 1 : 6) : (channel + direction + 7) % 7;
export const knobValue = (x: number, y: number) => Math.round((clamp(Math.atan2(x, -y) * 180 / Math.PI, -135, 135) + 135) / 270 * 100);
export function readStorage(storage: Storage, key: string): string | null { try { return storage.getItem(key); } catch { return null; } }
export function writeStorage(storage: Storage, key: string, value: string) { try { storage.setItem(key, value); } catch { /* Storage is optional in private browsing. */ } }
