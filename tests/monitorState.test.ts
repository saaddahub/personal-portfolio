import assert from 'node:assert/strict';
import { test } from 'node:test';
import { channelFromHash, nextChannel, clamp, knobValue, readStorage, writeStorage } from '../src/store/monitorState.ts';

test('hash channels are shareable and unknown signals remain unknown', () => {
  assert.equal(channelFromHash(''), 1);
  ['story', 'home', 'about', 'projects', 'skills', 'experience', 'contact'].forEach((name, i) => assert.equal(channelFromHash(`#${name}`), i));
  assert.equal(channelFromHash('#HOME'), 1);
  assert.equal(channelFromHash('#work'), 3);
  assert.equal(channelFromHash('#services'), 5);
  assert.equal(channelFromHash('#about-me'), 2);
  assert.equal(channelFromHash('#not-a-channel'), 99);
});
test('channel scanning wraps in both directions, including no signal', () => {
  assert.equal(nextChannel(6, 1), 0); assert.equal(nextChannel(0, -1), 6);
  assert.equal(nextChannel(99, 1), 1); assert.equal(nextChannel(99, -1), 6);
});
test('knob maps a 270 degree sweep without exceeding brightness limits', () => {
  assert.equal(knobValue(0, -1), 50); assert.equal(knobValue(-1, 1), 0); assert.equal(knobValue(1, 1), 100);
  assert.equal(clamp(-30), 0); assert.equal(clamp(130), 100);
});
test('storage denial never breaks navigation', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } } as unknown as Storage;
  assert.equal(readStorage(denied, 'test'), null); assert.doesNotThrow(() => writeStorage(denied, 'test', 'value'));
});
