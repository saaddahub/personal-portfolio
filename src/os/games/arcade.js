const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
export function createArcade(kind) {
  return { kind, ball: { x: 300, y: kind === 'pong' ? 170 : 270, vx: 190, vy: -230 }, paddle: kind === 'pong' ? 170 : 300, opponent: 170, score: 0, cpuScore: 0, lives: 3, status: 'ready', bricks: Array(32).fill(true) };
}
export function stepArcade(game, input, dt) {
  if (game.status !== 'playing') return game;
  dt = Math.min(Math.max(dt, 0), .025);
  const b = game.ball, previous = { x: b.x, y: b.y };
  if (game.kind === 'breakout') {
    game.paddle = clamp(input.pointer ?? game.paddle + (Number(!!input.right) - Number(!!input.left)) * 430 * dt, 48, 552);
  } else {
    game.paddle = clamp(input.pointer ?? game.paddle + (Number(!!input.down) - Number(!!input.up)) * 380 * dt, 34, 306);
    game.opponent = clamp(game.opponent + clamp(b.y - game.opponent, -190 * dt, 190 * dt), 34, 306);
  }
  b.x += b.vx * dt; b.y += b.vy * dt;
  if (b.y < 7) { b.y = 7; b.vy = Math.abs(b.vy); }
  if (game.kind === 'pong') {
    if (b.y > 333) { b.y = 333; b.vy = -Math.abs(b.vy); }
    if (b.vx < 0 && previous.x >= 40 && b.x <= 40 && Math.abs(b.y - game.paddle) < 40) {
      b.x = 40; b.vx = Math.min(460, Math.abs(b.vx) + 15); b.vy = (b.y - game.paddle) * 6;
    }
    if (b.vx > 0 && previous.x <= 560 && b.x >= 560 && Math.abs(b.y - game.opponent) < 40) { b.x = 560; b.vx = -Math.abs(b.vx); b.vy = (b.y - game.opponent) * 6; }
    if (b.x < -10 || b.x > 610) {
      if (b.x > 610) game.score++; else game.cpuScore++;
      game.status = game.score >= 7 ? 'won' : game.cpuScore >= 7 ? 'lost' : 'ready';
      game.ball = { x: 300, y: 170, vx: b.x > 610 ? -230 : 230, vy: 115 };
    }
  } else {
    if (b.x < 7 || b.x > 593) { b.x = clamp(b.x, 7, 593); b.vx *= -1; }
    if (b.vy > 0 && previous.y <= 300 && b.y >= 300 && Math.abs(b.x - game.paddle) < 55) {
      b.y = 300; b.vy = -Math.abs(b.vy); b.vx = (b.x - game.paddle) * 6;
    }
    for (let i = 0; i < 32; i++) {
      if (!game.bricks[i]) continue;
      const x = 24 + i % 8 * 70, y = 34 + Math.floor(i / 8) * 25;
      if (b.x > x - 7 && b.x < x + 62 + 7 && b.y > y - 7 && b.y < y + 17 + 7) {
        game.bricks[i] = false; game.score += 10;
        if (previous.y < y - 7 || previous.y > y + 24) b.vy *= -1; else b.vx *= -1;
        break;
      }
    }
    if (game.bricks.every(n => !n)) game.status = 'won';
    if (b.y > 355) { game.lives--; game.status = game.lives > 0 ? 'ready' : 'lost'; game.ball = { x: 300, y: 270, vx: 150, vy: -230 }; }
  }
  return game;
}
