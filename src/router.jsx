import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

// Five pages on the History API. Every page change runs inside a view transition where the browser has one:
// the old page recedes, the new one opens out of the tab that was pressed, and the page title flies between them.
export const PAGES = [['/', 'Home'], ['/work', 'Work'], ['/story', 'Story'], ['/about', 'About'], ['/contact', 'Contact']];
const known = p => (PAGES.some(([path]) => path === p) ? p : '/');
const indexOf = p => PAGES.findIndex(([path]) => path === p);

let shown = known(location.pathname);
const subs = new Set(), afters = new Set();
// Lazily loaded pages register their loader here, so a transition never captures a half-loaded page.
export const loaders = {};
history.scrollRestoration = 'manual';

export const usePath = () => useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => shown);
// Runs right after the new page renders, inside the transition (scroll reset, the petal gust).
export const afterNavigate = fn => { afters.add(fn); return () => afters.delete(fn); };

const tab = p => document.querySelector(`.nav-tabs a[href="${p}"] .nav-label`);
const name = (el, n) => { if (el) el.style.viewTransitionName = n; };

function go(path, push, origin) {
  const from = shown, root = document.documentElement;
  if (path === from) return;
  root.dataset.dir = indexOf(path) < indexOf(from) ? 'back' : 'forward';
  // The new page opens from the pressed tab, or from the top centre for the back button.
  const o = origin?.getBoundingClientRect();
  root.style.setProperty('--vt-x', `${o ? o.left + o.width / 2 : innerWidth / 2}px`);
  root.style.setProperty('--vt-y', `${o ? o.top + o.height / 2 : 0}px`);

  const update = () => {
    if (push) history.pushState(null, '', path);
    name(tab(path), ''); // the title now belongs to the new page's heading
    shown = path;
    flushSync(() => subs.forEach(s => s()));
    afters.forEach(fn => fn(path));
    // Going to a page without a title (Home): the old title flies back into its own tab.
    if (!document.querySelector('.page-title')) name(tab(from), 'page-title');
  };

  Promise.resolve(loaders[path]?.()).catch(() => {}).then(() => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return update();
    // Coming from a page without a title: the pressed tab's label grows into the new page's heading.
    if (!document.querySelector('.page-title')) name(tab(path), 'page-title');
    root.dataset.vt = '';
    const t = document.startViewTransition(update);
    t.ready.catch(() => {}); // a newer transition (a fast second click) skips this one; that's expected, not an error
    t.finished.finally(() => { delete root.dataset.vt; name(tab(from), ''); name(tab(path), ''); });
  });
}

export const navigate = (path, origin) => go(known(path), true, origin);
addEventListener('popstate', () => go(known(location.pathname), false));

export function Link({ to, onClick, ...rest }) {
  return (
    <a
      href={to}
      {...rest}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to, e.currentTarget);
      }}
    />
  );
}
