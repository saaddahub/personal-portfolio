import { useCallback, useEffect, useRef, useState } from 'react';
import { initialWorkspace, STORAGE_KEY, validateWorkspace } from './workspace.js';

export function useWorkspace() {
  const [initial] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return { state: raw ? validateWorkspace(JSON.parse(raw)) : initialWorkspace(), error: '' }; }
    catch (e) { return { state: initialWorkspace(), error: `${e.message} Temporary workspace — export your work before leaving.` }; }
  });
  const [state, setState] = useState(initial.state), current = useRef(state);
  const [error, setError] = useState(initial.error), blocked = useRef(Boolean(initial.error));
  const update = useCallback(fn => {
    const before = current.current;
    const next = typeof fn === 'function' ? fn(before) : fn;
    if (next === before) return true;
    let saved = false;
    try {
      if (blocked.current) throw new Error('Storage is unavailable or changed in another tab. Export this workspace before reloading.');
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && JSON.parse(raw).revision !== before.revision) { blocked.current = true; throw new Error('Another tab changed this workspace. Your edits remain here; export them before reloading.'); }
      next.revision = before.revision + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); saved = true; setError('');
    } catch (e) { next.revision = before.revision; setError(`${e.message} Changes are kept in this tab only.`); }
    current.current = next; setState(next); return saved;
  }, []);
  useEffect(() => { const changed = e => { if (e.key === STORAGE_KEY) { blocked.current = true; setError('Another tab changed the workspace. Export your work before reloading; this tab will not overwrite it.'); } }; window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed); }, []);
  useEffect(() => { const leaving = e => { if (error || Object.keys(current.current.drafts).length) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', leaving); return () => window.removeEventListener('beforeunload', leaving); }, [error]);
  return { state, update, error, current };
}
export function download(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
