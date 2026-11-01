import test from 'node:test';
import assert from 'node:assert/strict';
import { initialWorkspace, putFile, command, calculate, tokenize, validateWorkspace, trashFile, clampBounds, resolvePath } from '../src/os/workspace.js';
test('terminal and editor share real files across classic and modern paths', () => {
  let state = initialWorkspace();
  state = command(state, 'echo "Hello Rowan" > "My note.txt"').state;
  assert.equal(command(state, 'type "C:\\HOME\\Documents\\My note.txt"').output, 'Hello Rowan');
  assert.equal(command(state, 'cat "/Documents/My note.txt"').output, 'Hello Rowan');
  state = command(state, 'mv "My note.txt" "Renamed.txt"').state;
  state = command(state, 'cp Renamed.txt Copy.txt').state;
  state = command(state, 'rm Renamed.txt').state;
  assert.equal(command(state, 'cat Copy.txt').output, 'Hello Rowan');
  assert.throws(() => command(state, 'cat Renamed.txt'), /Not found/);
  state = trashFile(state, state.files.find(f => f.name === 'Renamed.txt').id, true);
  assert.equal(command(state, 'cat Renamed.txt').output, 'Hello Rowan');
});
test('writes reject stale revisions, duplicate names and folder cycles', () => {
  let state = initialWorkspace(); const original = state.files[1];
  state = putFile(state, { ...original, content: 'updated' });
  assert.throws(() => putFile(state, { ...original, content: 'stale' }), /changed elsewhere/);
  assert.throws(() => putFile(state, { name: 'Welcome.txt' }), /already exists/);
  assert.throws(() => putFile(state, { ...state.files[0], parent: 'documents' }), /contain itself/);
  assert.throws(() => putFile(state, { name: '../escape' }), /slashes/);
  assert.throws(() => validateWorkspace({ ...state, files: [{ ...original, parent: original.id }] }), /folder structure/);
});
test('folder deletion, root paths and quoted parsing are deterministic', () => {
  const state = initialWorkspace(), deleted = trashFile(state, 'documents');
  assert.ok(deleted.files.every(f => f.trashed));
  assert.equal(resolvePath(state, 'C:\\HOME'), 'root');
  assert.equal(command(state, 'cd /').cwd, 'root');
  assert.deepEqual(tokenize('echo "two words" > "a b.txt"'), ['echo', 'two words', '>', 'a b.txt']);
  assert.throws(() => tokenize('cat "unfinished'), /Close/);
  assert.throws(() => command(state, 'echo hi > Welcome.txt'), /already exists/);
});
test('calculator obeys precedence and never executes JavaScript', () => {
  assert.equal(calculate('2 + 3 * (4 - 1)'), '11');
  assert.equal(calculate('-.5 * 8'), '-4');
  assert.throws(() => calculate('1 / 0'), /zero/);
  assert.throws(() => calculate('alert(1)'), /valid/);
  assert.throws(() => calculate('1 2'), /Invalid/);
});
test('window bounds retain reachable controls after resize', () => {
  assert.deepEqual(clampBounds({ x: 900, y: -20, w: 600, h: 400 }, 320, 568), { x: 0, y: 0, w: 320, h: 400 });
  assert.equal(validateWorkspace(initialWorkspace()).version, 1);
  const curved = clampBounds({ x: 500, y: 0, w: 900, h: 600 }, 850, 360, 14);
  assert.deepEqual(curved, { x: 14, y: 14, w: 822, h: 332 });
});
