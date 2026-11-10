import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { addEventListener() {} };
const { tighten } = await import('../src/narrator.js');

// A fake mono AudioBuffer: just enough of the interface tighten() uses.
const buffer = data => ({ sampleRate: 1000, getChannelData: () => data });
const make = n => buffer(new Float32Array(n));

test('tighten shrinks long silences and keeps every bit of speech', () => {
  const sr = 1000, d = new Float32Array(3 * sr); // 1 s silence, 0.5 s speech, 1 s silence, 0.5 s speech
  d.fill(0.5, 1000, 1500);
  d.fill(0.5, 2500, 3000);
  const out = tighten(buffer(d), make).getChannelData(0);
  assert.equal(out.filter(x => x).length, 1000, 'all speech kept');
  assert.ok(out.length < 1700, `silence trimmed (${out.length} samples)`);
});

test('tighten leaves a silent clip alone', () => {
  const b = buffer(new Float32Array(500));
  assert.equal(tighten(b, make), b);
});
