import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { content } from '../src/content.js';

test('every Showcase voice line has a clip, and its beats run in scroll order', () => {
  for (const [id, { voice }] of Object.entries(content.showcase)) {
    assert.ok(voice.length > 0, `${id} has lines`);
    voice.forEach(([at, text], i) => {
      assert.ok(at >= 0 && at < 1 && (i === 0 || at > voice[i - 1][0]), `${id}.${i} beat at ${at}`);
      assert.ok(text.trim(), `${id}.${i} has words`);
      assert.ok(existsSync(new URL(`../public/showcase/audio/${id}.${i}.mp3`, import.meta.url)), `${id}.${i}.mp3 exists (run scripts/narrate.py)`);
    });
  }
});

test('every Story Mode line has a clip too', async () => {
  const { lines } = await import('../src/story/tour/lines.js');
  const { mine } = await import('../src/story/mine/content.js');
  const keys = [
    ...Object.entries(lines).flatMap(([id, v]) => v.map((_, i) => `tour-${id}.${i}`)),
    ...Object.entries(mine).filter(([, c]) => c?.voice).flatMap(([id, c]) => c.voice.map((_, i) => `mine-${id}.${i}`)),
  ];
  assert.ok(keys.length > 20);
  for (const k of keys) assert.ok(existsSync(new URL(`../public/showcase/audio/${k}.mp3`, import.meta.url)), `${k}.mp3 (run scripts/narrate.py)`);
});

test('every line the water drop says has a clip', () => {
  for (const [id, text] of Object.entries(content.drop)) {
    assert.ok(text.trim(), `drop.${id} has words`);
    assert.ok(existsSync(new URL(`../public/showcase/audio/drop-${id}.0.mp3`, import.meta.url)), `drop-${id}.0.mp3 (run scripts/narrate.py)`);
  }
});
