import tour from './tour/index.js';

// The modes on the choice screen. My Story loads as its own chunk (alongside this one, before the page opens), so
// each mode's scenes stay in their own bundle.
export const MODES = [tour];
let loading;
export const loadModes = () => (loading ??= import('./mine/index.js').then(m => { MODES.push(m.default); }, () => {}));
