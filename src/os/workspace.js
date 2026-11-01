export const STORAGE_KEY = 'rowan.workspace.v1';
export const apps = ['welcome', 'portfolio', 'files', 'notes', 'terminal', 'sketch', 'games', 'media', 'preview', 'calculator', 'clock', 'settings', 'activity', 'trash', 'help'];
export const names = { welcome: 'Welcome', portfolio: 'Portfolio', files: 'Files', notes: 'Notes', terminal: 'Terminal', sketch: 'Sketch', games: 'Play', media: 'Media', preview: 'Preview', calculator: 'Calculator', clock: 'Clock', settings: 'Settings', activity: 'Activity', trash: 'Trash', help: 'Help' };
export const classicNames = { ...names, games: 'Games', files: 'Computer', notes: 'Notepad', terminal: 'Console', sketch: 'Paint', media: 'Media Player', preview: 'Image Viewer', settings: 'Control Panel', activity: 'Task Manager', trash: 'Recycle Bin' };
export function initialWorkspace() {
  return { version: 1, revision: 0, files: [
    { id: 'documents', parent: 'root', name: 'Documents', type: 'folder', content: '', revision: 1 },
    { id: 'welcome-file', parent: 'documents', name: 'Welcome.txt', type: 'text/plain', content: 'Welcome to your little corner of Rowan.\n\nThese files belong to this browser. Try editing this note, opening Terminal, or switching computers. Your documents travel with you.\n\nThe Portfolio app opens Saad’s original website. Local edits never change the published portfolio.\n\nKeep an export of anything important.', revision: 1 },
  ], drafts: {}, layouts: {}, settings: { brightness: 100, night: false, skip: false, sound: false, scene: 'studio' } };
}
export function validateWorkspace(value) {
  if (!value || value.version !== 1 || !Number.isInteger(value.revision) || !Array.isArray(value.files) || !value.settings || !value.layouts || !value.drafts) throw new Error('This workspace cannot be read. Your stored data has been left intact.');
  const ids = new Set(['root']);
  for (const f of value.files) {
    if (!f || typeof f.id !== 'string' || ids.has(f.id) || typeof f.parent !== 'string' || typeof f.content !== 'string' || typeof f.type !== 'string' || !Number.isInteger(f.revision)) throw new Error('Invalid file record. Stored data was preserved.');
    validateName(f.name); ids.add(f.id);
  }
  for (const f of value.files) {
    const seen = new Set([f.id]); let parent = f.parent;
    while (parent !== 'root') { const p = value.files.find(v => v.id === parent && v.type === 'folder'); if (!p || seen.has(parent)) throw new Error('Invalid folder structure. Stored data was preserved.'); seen.add(parent); parent = p.parent; }
  }
  return value;
}
export function validateName(name) {
  if (typeof name !== 'string' || !name.trim() || name.length > 120 || /[\\/\x00-\x1f]/.test(name) || ['.', '..'].includes(name)) throw new Error('Use a name of 1–120 characters without slashes.');
}
export function putFile(state, { id, parent = 'documents', name, content = '', type = 'text/plain', revision }) {
  validateName(name); name = name.trim();
  const old = state.files.find(f => f.id === id);
  if (old && revision !== undefined && old.revision !== revision) throw new Error('This file changed elsewhere. Save a copy to keep both versions.');
  if (parent !== 'root' && !state.files.some(f => f.id === parent && f.type === 'folder' && !f.trashed)) throw new Error('Destination folder is unavailable.');
  if (state.files.some(f => f.id !== id && f.parent === parent && !f.trashed && f.name.toLowerCase() === name.toLowerCase())) throw new Error('That name already exists in this folder. Choose another name.');
  let p = parent;
  while (p !== 'root') { if (p === id) throw new Error('A folder cannot contain itself.'); p = state.files.find(f => f.id === p)?.parent || 'root'; }
  const file = { ...old, id: id || crypto.randomUUID(), parent, name, type, content, revision: (old?.revision || 0) + 1, modified: Date.now() };
  return { ...state, files: [...state.files.filter(f => f.id !== file.id), file] };
}
export function pathOf(state, id) { if (id === 'root') return '/'; const f = state.files.find(v => v.id === id); return f ? `${pathOf(state, f.parent).replace(/\/$/, '')}/${f.name}` : '/'; }
export function resolvePath(state, path, cwd = 'documents') {
  const normalized = path.replace(/^C:\\HOME/i, '/').replaceAll('\\', '/').replace(/^~(?=\/|$)/, '/');
  let id = normalized.startsWith('/') ? 'root' : cwd;
  for (const part of normalized.split('/').filter(Boolean)) {
    if (part === '.') continue;
    if (part === '..') { id = state.files.find(f => f.id === id)?.parent || 'root'; continue; }
    const f = state.files.find(f => f.parent === id && !f.trashed && f.name.toLowerCase() === part.toLowerCase());
    if (!f) throw new Error(`Not found: ${part}`); id = f.id;
  }
  return id;
}
export function trashFile(state, id, restore = false) {
  const file = state.files.find(f => f.id === id); if (!file) throw new Error('File not found.');
  if (restore && state.files.some(f => f.id !== id && f.parent === file.parent && !f.trashed && f.name.toLowerCase() === file.name.toLowerCase())) throw new Error('A file with that name already exists. Rename it before restoring.');
  const ids = new Set([id]); let size;
  do { size = ids.size; state.files.forEach(f => { if (ids.has(f.parent)) ids.add(f.id); }); } while (size !== ids.size);
  return { ...state, files: state.files.map(f => ids.has(f.id) ? { ...f, trashed: !restore } : f) };
}
export function tokenize(line) {
  if (line.length > 4096) throw new Error('Command is too long.');
  const tokens = []; let word = '', quote = '', started = false;
  for (const c of line) {
    if (quote) { if (c === quote) quote = ''; else word += c; }
    else if (c === '"' || c === "'") { quote = c; started = true; }
    else if (/\s/.test(c) || c === '>') { if (started || word) tokens.push(word); word = ''; started = false; if (c === '>') tokens.push(c); }
    else { word += c; started = true; }
  }
  if (quote) throw new Error('Close the quoted filename.'); if (started || word) tokens.push(word); return tokens;
}
export function command(state, line, cwd = 'documents') {
  const [raw, ...args] = tokenize(line); const cmd = ({ dir: 'ls', type: 'cat', copy: 'cp', move: 'mv', ren: 'mv', del: 'rm', cls: 'clear', ver: 'about' })[raw] || raw;
  const result = { state, cwd, output: '', action: null };
  const file = path => state.files.find(f => f.id === resolvePath(state, path, cwd));
  const target = path => { const parts = path.replaceAll('\\', '/').split('/'); const name = parts.pop(); return { parent: parts.length ? resolvePath(state, parts.join('/') || '/', cwd) : cwd, name }; };
  if (!cmd) return result;
  if (cmd === 'help') result.output = 'ls [path] · cd path · pwd · cat file · mkdir name\ncp source destination · mv source destination · rm path\necho "text" > new-file.txt · open app-or-file · clear\nhistory · date · time · about · brightness 0–100 · era 98|26\nQuotes support spaces. Writes never overwrite an existing name. Files are local to this browser.';
  else if (cmd === 'about') result.output = 'Rowan — a personal computer in your browser.\nPortfolio by Saad Akhtar. No access to your host filesystem.';
  else if (cmd === 'pwd') result.output = pathOf(state, cwd);
  else if (cmd === 'ls') { const id = args[0] ? resolvePath(state, args[0], cwd) : cwd; result.output = state.files.filter(f => f.parent === id && !f.trashed).map(f => `${f.type === 'folder' ? '[folder]' : '        '} ${f.name}`).join('\n') || 'This folder is empty.'; }
  else if (cmd === 'cd') { const f = args[0] ? file(args[0]) : null; if (args[0] === '/') result.cwd = 'root'; else if (!args[0]) result.cwd = 'documents'; else if (f?.type === 'folder') result.cwd = f.id; else throw new Error('Choose a folder.'); }
  else if (cmd === 'cat') { const f = file(args[0] || ''); if (!f || !f.type.startsWith('text/')) throw new Error('Choose a text file.'); result.output = f.content; }
  else if (cmd === 'echo') { const at = args.indexOf('>'); if (at < 0) result.output = args.join(' '); else { if (at !== args.length - 2) throw new Error('Use echo "text" > filename.'); result.state = putFile(state, { ...target(args[at + 1]), content: args.slice(0, at).join(' ') }); result.output = 'File created.'; } }
  else if (cmd === 'mkdir') { if (args.length !== 1) throw new Error('Use mkdir "folder name".'); result.state = putFile(state, { ...target(args[0]), type: 'folder' }); }
  else if (cmd === 'rm') { if (!args[0]) throw new Error('Choose a file or folder.'); result.state = trashFile(state, resolvePath(state, args[0], cwd)); result.output = 'Moved to Trash.'; }
  else if (cmd === 'cp' || cmd === 'mv') { if (args.length !== 2) throw new Error('Supply source and destination paths.'); const f = file(args[0]); if (!f) throw new Error('Source not found.'); if (cmd === 'cp' && f.type === 'folder') throw new Error('Copy files individually; folder copying is not supported yet.'); result.state = putFile(state, { ...f, ...target(args[1]), id: cmd === 'cp' ? undefined : f.id }); }
  else if (cmd === 'open') { if (!args[0]) throw new Error('Supply an app or file.'); result.action = apps.includes(args[0]) ? { app: args[0] } : { file: resolvePath(state, args[0], cwd) }; }
  else if (cmd === 'clear') result.action = { clear: true };
  else if (cmd === 'date' || cmd === 'time') result.output = cmd === 'date' ? new Date().toLocaleDateString() : new Date().toLocaleTimeString();
  else if (cmd === 'brightness') { const n = Number(args[0]); if (args.length !== 1 || !Number.isFinite(n) || n < 0 || n > 100) throw new Error('Brightness must be between 0 and 100.'); result.state = { ...state, settings: { ...state.settings, brightness: n } }; }
  else if (cmd === 'era') { if (!['98', '26'].includes(args[0])) throw new Error('Use era 98 or era 26.'); result.action = { era: args[0] }; }
  else throw new Error(`Unknown command: ${raw}. Type help.`);
  return result;
}
export function calculate(expression) {
  const tokens = expression.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/]/g) || [];
  if (tokens.join('') !== expression.replace(/\s/g, '') || tokens.length > 100 || !tokens.length) throw new Error('Enter a valid arithmetic expression.');
  let i = 0;
  const atom = () => { const t = tokens[i++]; if (t === '-') return -atom(); if (t === '+') return atom(); if (t === '(') { const v = sum(); if (tokens[i++] !== ')') throw new Error('Close the parentheses.'); return v; } if (!t || !/^[\d.]/.test(t)) throw new Error('Expected a number.'); return Number(t); };
  const product = () => { let v = atom(); while (tokens[i] === '*' || tokens[i] === '/') { const op = tokens[i++], n = atom(); if (op === '/' && n === 0) throw new Error('Cannot divide by zero.'); v = op === '*' ? v * n : v / n; } return v; };
  const sum = () => { let v = product(); while (tokens[i] === '+' || tokens[i] === '-') { const op = tokens[i++], n = product(); v = op === '+' ? v + n : v - n; } return v; };
  const value = sum(); if (i !== tokens.length || !Number.isFinite(value)) throw new Error('Invalid or out-of-range result.'); return String(Number(value.toPrecision(12)));
}
export function clampBounds(bounds, width, height, inset = 0) { const padding = Math.max(0, Math.min(inset, (width - 1) / 2, (height - 1) / 2)); const w = Math.max(1, Math.min(bounds.w, width - 2 * padding)), h = Math.max(1, Math.min(bounds.h, height - 2 * padding)); return { x: Math.max(padding, Math.min(bounds.x, width - padding - w)), y: Math.max(padding, Math.min(bounds.y, height - padding - h)), w, h }; }
