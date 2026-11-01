export const library = {
  '98': [
    { id: 'mines', name: 'Minesweeper', description: 'A little logic. Ten hidden mines.', kind: 'Logic', glyph: 'mines' },
    { id: 'snake', name: 'Snake', description: 'One more apple. One less escape.', kind: 'Arcade', glyph: 'snake' },
    { id: 'breakout', name: 'Breakout', description: 'Clear the wall, keep the ball.', kind: 'Arcade', glyph: 'breakout' },
    { id: 'pong', name: 'Pong', description: 'You, the computer, first to seven.', kind: 'Arcade', glyph: 'pong' },
    { id: 'memory', name: 'Memory', description: 'Twelve cards. Six connections.', kind: 'Memory', glyph: 'memory' },
    { id: 'fifteen', name: 'Fifteen', description: 'Put every little thing in order.', kind: 'Puzzle', glyph: 'fifteen' },
  ],
  '26': [
    { id: 'orbit', name: 'Orbit', description: 'Find the moment. Catch the light.', kind: 'Timing', glyph: 'orbit' },
    { id: 'merge', name: 'Merge', description: 'Small moves, bigger possibilities.', kind: 'Strategy', glyph: 'merge' },
    { id: 'lights', name: 'Lights', description: 'A constellation, quietly switched off.', kind: 'Logic', glyph: 'lights' },
    { id: 'sequence', name: 'Sequence', description: 'A pattern to hold in your mind.', kind: 'Memory', glyph: 'sequence' },
    { id: 'constellation', name: 'Constellation', description: 'Every connection. A single line.', kind: 'Puzzle', glyph: 'constellation' },
    { id: 'chromatic', name: 'Chromatic', description: 'Something here is a little different.', kind: 'Perception', glyph: 'chromatic' },
  ],
};

export function shuffle(items, random = Math.random) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [next[i], next[j]] = [next[j], next[i]]; }
  return next;
}
export function neighbors(index, width, diagonal = true) {
  const result = [];
  for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
    if ((!x && !y) || (!diagonal && Math.abs(x) + Math.abs(y) !== 1)) continue;
    const nx = index % width + x, ny = Math.floor(index / width) + y;
    if (nx >= 0 && nx < width && ny >= 0 && ny < width) result.push(ny * width + nx);
  }
  return result;
}
export function minefield(first, width = 8, count = 10, random = Math.random) {
  const safe = new Set([first, ...neighbors(first, width)]);
  const mines = new Set(shuffle(Array.from({ length: width * width }, (_, i) => i).filter(i => !safe.has(i)), random).slice(0, count));
  return Array.from({ length: width * width }, (_, i) => mines.has(i) ? -1 : neighbors(i, width).filter(n => mines.has(n)).length);
}
export function revealMines(board, revealed, flags, start, width = 8) {
  const next = new Set(revealed), queue = [start];
  while (queue.length) {
    const i = queue.pop();
    if (next.has(i) || flags.has(i)) continue;
    next.add(i);
    if (board[i] === 0) queue.push(...neighbors(i, width));
  }
  return next;
}
export function snakeStep(snake, direction, food, width = 14) {
  const x = snake[0] % width + direction[0], y = Math.floor(snake[0] / width) + direction[1];
  const head = y * width + x, ate = head === food;
  if (x < 0 || y < 0 || x >= width || y >= width || snake.slice(0, ate ? undefined : -1).includes(head)) return { snake, dead: true, ate: false };
  return { snake: [head, ...snake.slice(0, ate ? undefined : -1)], dead: false, ate };
}
export function emptyCell(occupied, size, random = Math.random) {
  const free = Array.from({ length: size }, (_, i) => i).filter(i => !occupied.includes(i));
  return free.length ? free[Math.floor(random() * free.length)] : -1;
}
export function slideTile(board, index) {
  const blank = board.indexOf(0);
  if (!neighbors(blank, 4, false).includes(index)) return board;
  const next = [...board]; [next[blank], next[index]] = [next[index], next[blank]]; return next;
}
export function slidingPuzzle(random = Math.random) {
  let board = [...Array.from({ length: 15 }, (_, i) => i + 1), 0], previous = -1;
  for (let i = 0; i < 150; i++) {
    const blank = board.indexOf(0), moves = neighbors(blank, 4, false).filter(n => n !== previous);
    board = slideTile(board, moves[Math.floor(random() * moves.length)]); previous = blank;
  }
  if (board.every((n, i) => n === (i + 1) % 16)) return slideTile(board, 14);
  return board;
}
export function moveMerge(board, direction) {
  const next = [...board]; let score = 0;
  for (let line = 0; line < 4; line++) {
    const indices = Array.from({ length: 4 }, (_, i) => direction === 'left' ? line * 4 + i : direction === 'right' ? line * 4 + 3 - i : direction === 'up' ? i * 4 + line : (3 - i) * 4 + line);
    const values = indices.map(i => board[i]).filter(Boolean), merged = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) { merged.push(values[i] * 2); score += values[i] * 2; i++; } else merged.push(values[i]);
    }
    indices.forEach((index, i) => { next[index] = merged[i] || 0; });
  }
  return { board: next, score, changed: next.some((n, i) => n !== board[i]) };
}
export function addMergeTile(board, random = Math.random) {
  const index = emptyCell(board.flatMap((n, i) => n ? [i] : []), 16, random);
  if (index < 0) return board;
  const next = [...board]; next[index] = random() < .9 ? 2 : 4; return next;
}
export function toggleLights(board, index) {
  const next = [...board]; [index, ...neighbors(index, 5, false)].forEach(i => { next[i] = !next[i]; }); return next;
}
export function lightsPuzzle(random = Math.random) {
  let board = Array(25).fill(false);
  for (const i of shuffle(Array.from({ length: 25 }, (_, i) => i), random).slice(0, 12)) board = toggleLights(board, i);
  return board.some(Boolean) ? board : toggleLights(board, 12);
}
export const starPoints = [[150, 25], [258, 88], [258, 212], [150, 275], [42, 212], [42, 88]];
export const starEdges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 2], [2, 4], [4, 0]];
export function traceStar(path, next) {
  if (!path.length) return [next];
  const last = path.at(-1), edge = starEdges.findIndex(([a, b]) => a === last && b === next || b === last && a === next);
  if (edge < 0 || path.slice(1).some((p, i) => path[i] === last && p === next || path[i] === next && p === last)) return path;
  return [...path, next];
}
export function orbitHit(angle, target, tolerance) {
  return Math.abs(Math.atan2(Math.sin(angle - target), Math.cos(angle - target))) <= tolerance;
}
