import { test } from 'node:test';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { scopePortfolioCss } from '../src/lib/scopePortfolioCss.js';

test('original typography, themes and viewport sizing stay inside the portfolio', async () => {
  const result = await postcss([scopePortfolioCss()]).process("@import url('https://example.com/fonts.css'); :root:has(.portfolio-surface){--color-bg:#141310} html, body{font-family:serif} [data-theme='light']{color:black} .hero{height:100vh;width:90vw}", { from: '/app/src/index.css' });
  assert.ok(result.css.startsWith('@import'));
  assert.ok(result.css.includes('@scope (.portfolio-surface)'));
  assert.ok(result.css.includes(':scope{--color-bg:#141310}'));
  assert.ok(result.css.includes(':scope, :scope{font-family:serif}'));
  assert.ok(result.css.includes(":scope[data-theme='light']"));
  assert.ok(result.css.includes('height:100cqh;width:90cqw'));
});
test('CRT screen styles stop at the original portfolio boundary', async () => {
  const result = await postcss([scopePortfolioCss()]).process('.screen h1{color:green}', { from: '/app/src/styles/screen.css' });
  assert.ok(result.css.includes('@scope (:root) to (.portfolio-surface)'));
  const hardware = await postcss([scopePortfolioCss()]).process('.control-panel{color:olive}', { from: '/app/src/styles/monitor.css' });
  assert.equal(hardware.css, '.control-panel{color:olive}');
});
