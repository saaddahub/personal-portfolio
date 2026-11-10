// Liquid glass: real refraction for the glass surfaces (the tab bar, its lens, Story Mode's sheets and transport).
// Each surface is modelled as a slab of glass (n = 1.5) with a rounded, convex rim. A displacement map is computed
// per surface from Snell's law across that rim, and the page behind is resampled through it with a slight split
// per colour channel, the way real glass disperses light. The centre stays flat and clear; light bends at the edge.
// Only Chromium can run an SVG filter as a backdrop-filter; other browsers keep the plain frosted blur from CSS.

// The tab bar's lens is left out: it sits inside the bar, which is itself glass, so it has no page behind it to bend.
const SELECTOR = [
  '.nav-glass', '.sound', '.sc-caption', '.seq-tag', '.be-panel', '.board-card', '.mail-copy', '.social-go', // the main pages
  '.story .glass', '.tp', '.ch-caption', '.story-pill', '.mine-card', // Story Mode
].join(', ');
const N = 1.5, SVGNS = 'http://www.w3.org/2000/svg';
const chromium = !!navigator.userAgentData?.brands?.some(b => b.brand === 'Chromium');

// The rounded rectangle's signed distance (negative inside), for pixel centre (x, y).
const sdf = (x, y, w, h, r) => {
  const qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

// How far light is displaced at depth t (0 at the rim, 1 where the rim meets the flat face), for a convex
// squircle profile of the given thickness, as a fraction of the largest displacement.
export function bend(t, thickness, bezel) {
  const u = 1 - Math.min(Math.max(t, 1e-3), 1);
  const slope = (u ** 3 / (1 - u ** 4) ** 0.75) * (thickness / bezel);
  const theta = Math.atan(slope), refracted = Math.asin(Math.sin(theta) / N);
  return Math.tan(theta - refracted);
}

// Encodes the displacement as R (x) and G (y) around 128, pointing inward so the rim magnifies what is behind it.
export function displacementMap(w, h, r, bezel, thickness) {
  const data = new Uint8ClampedArray(w * h * 4), max = bend(1e-3, thickness, bezel);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = x + 0.5, py = y + 0.5, d = sdf(px, py, w, h, r), i = (y * w + x) * 4;
    let dx = 0, dy = 0;
    if (d < 0 && -d < bezel) {
      const gx = sdf(px + 1, py, w, h, r) - sdf(px - 1, py, w, h, r), gy = sdf(px, py + 1, w, h, r) - sdf(px, py - 1, w, h, r);
      const len = Math.hypot(gx, gy) || 1, m = bend(-d / bezel, thickness, bezel) / max;
      dx = (-gx / len) * m; dy = (-gy / len) * m;
    }
    data[i] = 128 + dx * 127; data[i + 1] = 128 + dy * 127; data[i + 2] = 128; data[i + 3] = 255;
  }
  return data;
}

// The reflection on the glass itself: a light from the upper left catches the rim where it faces that light,
// a fainter glint returns on the opposite edge, a hairline of light runs round the very edge, and a soft sheen
// lies over the top half. White, with the strength in alpha, so it can be laid over the refracted backdrop.
const LIGHT = [-0.6, -0.8];
export function specularMap(w, h, r, bezel) {
  const data = new Uint8ClampedArray(w * h * 4), band = bezel * 0.6;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = x + 0.5, py = y + 0.5, d = sdf(px, py, w, h, r), i = (y * w + x) * 4;
    if (d >= 0) continue;
    let a = py < h / 2 ? 0.07 * (1 - py / (h / 2)) ** 2 : 0;
    const depth = -d;
    if (depth < band) {
      const gx = sdf(px + 1, py, w, h, r) - sdf(px - 1, py, w, h, r), gy = sdf(px, py + 1, w, h, r) - sdf(px, py - 1, w, h, r);
      const len = Math.hypot(gx, gy) || 1, facing = (gx / len) * LIGHT[0] + (gy / len) * LIGHT[1], u = 1 - depth / band;
      a += Math.max(0, facing) ** 1.5 * u ** 2 * 0.9 + Math.max(0, -facing) ** 2 * u ** 3 * 0.38 + (depth < 1.5 ? 0.22 : 0);
    }
    data[i] = 255; data[i + 1] = 247; data[i + 2] = 250; data[i + 3] = Math.min(1, a) * 255;
  }
  return data;
}

let defs = null, count = 0;
function filterFor(el) {
  if (!defs) {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    defs = document.createElementNS(SVGNS, 'defs');
    svg.append(defs);
    document.body.append(svg);
  }
  const id = `liquid-${++count}`, f = document.createElementNS(SVGNS, 'filter');
  f.id = id;
  f.setAttribute('color-interpolation-filters', 'sRGB');
  const channel = (c, k) => `<feDisplacementMap in="frost" in2="map" scale="0" data-k="${k}" xChannelSelector="R" yChannelSelector="G" result="d${c}"/>
    <feColorMatrix in="d${c}" type="matrix" values="${['1 0 0 0 0  0 0 0 0 0  0 0 0 0 0', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0'][c]}  0 0 0 1 0" result="c${c}"/>`;
  f.innerHTML = `<feImage result="map" preserveAspectRatio="none" x="0" y="0"/>
    <feImage result="spec" preserveAspectRatio="none" x="0" y="0"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="frost"/>
    ${channel(0, 1.08)}${channel(1, 0.9)}${channel(2, 0.72)}
    <feBlend in="c0" in2="c1" mode="screen" result="c01"/><feBlend in="c01" in2="c2" mode="screen" result="rgb"/>
    <feColorMatrix in="rgb" type="saturate" values="1.45" result="glass"/>
    <feBlend in="spec" in2="glass" mode="screen"/>`;
  defs.append(f);
  return f;
}

function attach(el) {
  const f = filterFor(el), [img, shine] = f.querySelectorAll('feImage'), maps = f.querySelectorAll('feDisplacementMap');
  const canvas = document.createElement('canvas'), g = canvas.getContext('2d');
  let settle = 0, built = '';
  const build = (w, h) => {
    const key = `${w}x${h}`;
    if (key === built || w < 8 || h < 8) return;
    built = key;
    const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, h / 2, w / 2);
    const bezel = Math.max(6, Math.min(r * 1.25, h * 0.42, 46)), thickness = bezel * 2;
    canvas.width = w; canvas.height = h;
    g.putImageData(new ImageData(displacementMap(w, h, r, bezel, thickness), w, h), 0, 0);
    img.setAttribute('href', canvas.toDataURL());
    g.putImageData(new ImageData(specularMap(w, h, r, bezel), w, h), 0, 0);
    shine.setAttribute('href', canvas.toDataURL());
    // Peak displacement grows with the rim: a deep rim bends light further.
    maps.forEach(m => m.setAttribute('scale', (bezel * 1.7 * m.dataset.k).toFixed(1)));
  };
  // While a surface resizes (the lens stretching between tabs) the current map stretches with it; the exact map
  // is rebuilt once the size settles.
  const fit = () => {
    const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
    for (const im of [img, shine]) { im.setAttribute('width', w); im.setAttribute('height', h); } // the filter itself keeps its default region: a fixed one renders nothing
    clearTimeout(settle);
    settle = setTimeout(() => build(w, h), built ? 160 : 0);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  el.dataset.liquid = '';
  el.style.backdropFilter = `url(#${f.id})`;
  return () => { ro.disconnect(); clearTimeout(settle); f.remove(); el.style.backdropFilter = ''; delete el.dataset.liquid; };
}

export function startGlass() {
  if (!chromium || matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
  const live = new Map();
  const scan = () => {
    for (const el of document.querySelectorAll(SELECTOR)) if (!live.has(el)) live.set(el, attach(el));
    for (const [el, off] of live) if (!el.isConnected) { off(); live.delete(el); }
  };
  let queued = 0;
  new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; scan(); }); })
    .observe(document.body, { childList: true, subtree: true });
  scan();
}
