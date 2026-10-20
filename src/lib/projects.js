export const WORK_COLORS = ['#d5c4ef', '#e9a184', '#c3d497', '#91bdc7', '#e8cf7a', '#d2a8b5', '#a7b5dd'];
export function projectColor(project, index = 0) {
  return /^#[0-9a-f]{6}$/i.test(project.accent || '') ? project.accent : WORK_COLORS[index % WORK_COLORS.length];
}
export const projectPath = id => '/work/' + encodeURIComponent(id);
export function externalLink(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
