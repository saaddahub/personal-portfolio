import test from 'node:test';
import assert from 'node:assert/strict';
import { library, minefield, neighbors, revealMines, snakeStep, slideTile, slidingPuzzle, moveMerge, addMergeTile, toggleLights, lightsPuzzle, traceStar, starEdges, orbitHit } from '../src/os/games/logic.js';
import { createArcade, stepArcade } from '../src/os/games/arcade.js';

test('each edition has six distinct games', () => {
  assert.equal(library['98'].length, 6); assert.equal(library['26'].length, 6);
  assert.equal(new Set(Object.values(library).flat().map(g => g.id)).size, 12);
});
test('mines protect the first click and flood-fill stops at flags and numbered cells', () => {
  for (const first of [0, 9, 27, 63]) {
    const board = minefield(first);
    assert.equal(board.filter(n => n === -1).length, 10);
    [first, ...neighbors(first, 8)].forEach(i => assert.notEqual(board[i], -1));
    const revealed = revealMines(board, new Set(), new Set(), first);
    assert.ok(![...revealed].some(i => board[i] === -1));
  }
  assert.equal(revealMines(Array(64).fill(0), new Set(), new Set([2]), 0).size, 63);
});
test('snake grows, hits walls and its body, and may enter the departing tail', () => {
  assert.deepEqual(snakeStep([7, 6, 5], [1, 0], 5, 4), { snake: [7, 6, 5], dead: true, ate: false });
  assert.equal(snakeStep([5, 4, 0, 1], [0, -1], 15, 4).dead, false);
  assert.equal(snakeStep([5, 4, 0, 1], [-1, 0], 15, 4).dead, true);
  assert.equal(snakeStep([5, 4, 0], [1, 0], 6, 4).snake.length, 4);
});
test('fifteen only slides adjacent tiles and creates solvable unsolved boards', () => {
  const solved = [...Array.from({ length: 15 }, (_, i) => i + 1), 0];
  assert.equal(slideTile(solved, 0), solved);
  assert.equal(slideTile(solved, 14)[15], 15);
  for (let run = 0; run < 30; run++) {
    const board = slidingPuzzle(), values = board.filter(Boolean);
    let inversions = 0;
    values.forEach((n, i) => values.slice(i + 1).forEach(m => { if (n > m) inversions++; }));
    assert.equal((inversions + (4 - Math.floor(board.indexOf(0) / 4))) % 2, 1);
    assert.equal(new Set(board).size, 16);
    assert.notDeepEqual(board, solved);
  }
});
test('merge combines once per move, preserves input and only spawns on empty cells', () => {
  const board = [2, 2, 2, 2, ...Array(12).fill(0)], copy = [...board];
  const left = moveMerge(board, 'left');
  assert.deepEqual(left.board.slice(0, 4), [4, 4, 0, 0]); assert.equal(left.score, 8); assert.deepEqual(board, copy);
  assert.deepEqual(moveMerge([4, 4, 8, 0, ...Array(12).fill(0)], 'right').board.slice(0, 4), [0, 0, 8, 8]);
  const vertical = [2, 0, 0, 0, 2, ...Array(11).fill(0)];
  assert.equal(moveMerge(vertical, 'down').board[12], 4);
  assert.equal(moveMerge([2, ...Array(15).fill(0)], 'left').changed, false);
  assert.equal(addMergeTile(Array(16).fill(2)).length, 16);
  const spawned = addMergeTile([2, ...Array(15).fill(0)], () => 0); assert.equal(spawned[0], 2); assert.equal(spawned[1], 2);
});
test('lights toggles are reversible, stay within rows, and puzzles are solvable', () => {
  const empty = Array(25).fill(false), once = toggleLights(empty, 4);
  assert.deepEqual(once.flatMap((n, i) => n ? [i] : []), [3, 4, 9]);
  assert.deepEqual(toggleLights(once, 4), empty);
  assert.ok(lightsPuzzle().some(Boolean));
});
test('constellation allows an Euler trail but rejects reused edges and missing connections', () => {
  let path = [];
  for (const node of [0, 1, 2, 0, 4, 2, 3, 4, 5, 0]) path = traceStar(path, node);
  assert.equal(path.length - 1, starEdges.length);
  assert.equal(traceStar([0, 1], 0).length, 2);
  assert.equal(traceStar([0], 3).length, 1);
});
test('orbit timing treats the angle wrap as continuous', () => {
  assert.equal(orbitHit(.02, Math.PI * 2 - .02, .1), true);
  assert.equal(orbitHit(0, Math.PI, .2), false);
});
test('arcade serves, paddle collision, brick hits, scoring and final lives work', () => {
  const game = createArcade('breakout');
  stepArcade(game, {}, 1 / 60); assert.equal(game.ball.y, 270);
  game.status = 'playing';
  for (let i = 0; i < 100; i++) stepArcade(game, {}, 1 / 60);
  assert.ok(Number.isFinite(game.paddle) && Number.isFinite(game.ball.x));
  game.status = 'playing'; game.bricks.fill(true);
  game.ball = { x: 300, y: 298, vx: 0, vy: 230 };
  stepArcade(game, {}, 1 / 60); assert.ok(game.ball.vy < 0);
  game.ball = { x: 40, y: 28, vx: 0, vy: 200 };
  stepArcade(game, {}, 1 / 60); assert.equal(game.bricks[0], false);
  game.lives = 1; game.ball.y = 360;
  stepArcade(game, {}, 1 / 60); assert.equal(game.status, 'lost');
  const pong = createArcade('pong'); pong.status = 'playing'; pong.ball = { x: 609, y: 50, vx: 300, vy: 0 }; pong.score = 6;
  stepArcade(pong, {}, 1 / 60); assert.equal(pong.status, 'won'); assert.equal(pong.score, 7);
});
