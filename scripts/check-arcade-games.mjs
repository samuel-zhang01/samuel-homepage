import assert from "node:assert/strict";
import { arcade as a, deskArcade as d } from "./lib/arcade-test-fixtures.mjs";

let checks = 0;
function check(name, run) {
  try { run(); checks += 1; }
  catch (error) { throw new Error(`Arcade regression: ${name}`, { cause: error }); }
}
function inspectField(cells) {
  assert.equal(cells.length, 64);
  assert.equal(cells.filter(cell => cell.mine).length, 10);
  cells.forEach((cell, index) => {
    if (cell.mine) return;
    const row = Math.floor(index / 8), column = index % 8;
    const neighbours = cells.filter((other, otherIndex) => other.mine
      && Math.abs(Math.floor(otherIndex / 8) - row) <= 1 && Math.abs(otherIndex % 8 - column) <= 1);
    assert.equal(cell.adjacent, neighbours.length);
  });
}

check("sequential Minefields have valid adjacency and no fixed corner mine", () => {
  let firstCellMines = 0;
  const layouts = new Set();
  for (let seed = 91; seed < 1091; seed += 1) {
    const field = d.createMinefield(seed);
    inspectField(field);
    if (field[0].mine) firstCellMines += 1;
    layouts.add(field.map(cell => Number(cell.mine)).join(""));
  }
  assert.ok(firstCellMines > 50 && firstCellMines < 300, "The corner is neither a fixed mine nor always excluded");
  assert.ok(layouts.size > 990, "Nearby seeds produce distinct fields");
});
check("every possible first square is safe across 100 seeded fields", () => {
  for (let seed = 91; seed < 191; seed += 1) for (let square = 0; square < 64; square += 1) {
    const field = d.createMinefield(seed, square);
    inspectField(field);
    assert.equal(field[square].mine, false);
    assert.deepEqual(field, d.createMinefield(seed, square), "The safe layout remains deterministic");
  }
});
check("1000 Sliding Puzzle shuffles preserve all tiles and solvable parity", () => {
  for (let seed = 1991; seed < 2991; seed += 1) {
    const tiles = d.createPuzzle(seed);
    assert.deepEqual([...tiles].sort((left, right) => left - right), Array.from({ length: 16 }, (_, index) => index));
    let inversions = 0;
    for (let left = 0; left < 16; left += 1) for (let right = left + 1; right < 16; right += 1) {
      if (tiles[left] && tiles[right] && tiles[left] > tiles[right]) inversions += 1;
    }
    assert.equal((inversions + 4 - Math.floor(tiles.indexOf(0) / 4)) % 2, 1);
  }
});
check("SamWord accounts for repeated letters and every answer can win", () => {
  assert.deepEqual(d.scoreWordGuess("AAAAAA", "BANANA"), ["absent", "correct", "absent", "correct", "absent", "correct"]);
  assert.deepEqual(d.scoreWordGuess("NNNNNN", "BANANA"), ["absent", "absent", "correct", "absent", "correct", "absent"]);
  assert.deepEqual(d.scoreWordGuess("ANANAB", "BANANA"), Array(6).fill("present"));
  for (const entry of d.SAM_WORDS) assert.deepEqual(d.scoreWordGuess(entry.answer, entry.answer), Array(6).fill("correct"));
});
check("1000 Profile Pairs decks contain two cards per subject", () => {
  for (let seed = 1991; seed < 2991; seed += 1) {
    const deck = d.createMemoryDeck(seed);
    assert.equal(deck.length, 16);
    for (const pair of d.MEMORY_PAIRS) assert.equal(deck.filter(card => card.pairId === pair.id).length, 2);
  }
});
check("Snake pause, reversal protection, wall/self collisions and reset", () => {
  let state = a.initialSnakeState();
  assert.equal(a.snakeReducer(state, { type: "turn", direction: "left" }).status, "ready");
  state = a.snakeReducer(state, { type: "toggle" });
  const paused = a.snakeReducer(state, { type: "pause" });
  assert.deepEqual(a.snakeReducer(paused, { type: "tick" }), paused);
  state = a.snakeReducer(state, { type: "turn", direction: "up" });
  assert.equal(a.snakeReducer(state, { type: "turn", direction: "left" }).queuedDirection, "up");
  for (let tick = 0; tick < 20; tick += 1) state = a.snakeReducer(state, { type: "tick" });
  assert.equal(state.status, "lost");
  assert.deepEqual(a.snakeReducer(state, { type: "reset" }), a.initialSnakeState());
  const selfCollision = { ...a.initialSnakeState(), status: "running", snake: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 5, y: 3 }], direction: "up", queuedDirection: "right" };
  assert.equal(a.snakeReducer(selfCollision, { type: "tick" }).status, "lost");
});
check("Snake has a reachable 100-point complete game", () => {
  let state = a.snakeReducer(a.initialSnakeState(), { type: "toggle" });
  let ticks = 0;
  while (state.status === "running" && ticks < 1000) {
    const queue = [{ point: state.snake[0], path: [] }], seen = new Set();
    const occupied = new Set(state.snake.slice(1).map(point => `${point.x},${point.y}`));
    let route;
    while (queue.length) {
      const { point, path } = queue.shift();
      if (point.x === state.food.x && point.y === state.food.y) { route = path; break; }
      for (const [direction, movement] of Object.entries(a.DIRECTIONS)) {
        if (!path.length && a.OPPOSITE_DIRECTION[state.direction] === direction) continue;
        const next = { x: point.x + movement.x, y: point.y + movement.y }, key = `${next.x},${next.y}`;
        if (next.x < 0 || next.x >= 12 || next.y < 0 || next.y >= 12 || seen.has(key) || occupied.has(key)) continue;
        seen.add(key); queue.push({ point: next, path: [...path, direction] });
      }
    }
    assert.ok(route?.length, "A legal food route exists");
    for (const direction of route) {
      state = a.snakeReducer(state, { type: "turn", direction });
      state = a.snakeReducer(state, { type: "tick" }); ticks += 1;
      if (state.status !== "running") break;
    }
  }
  assert.equal(state.status, "won"); assert.equal(state.score, 100); assert.equal(state.snake.length, 13);
});
check("Brick Breaker pause, all three life losses and reset", () => {
  const initial = a.initialBrickState();
  let state = a.brickReducer(initial, { type: "toggle" });
  const paused = a.brickReducer(state, { type: "pause" });
  assert.deepEqual(a.brickReducer(paused, { type: "step", delta: 0.016, paddleDirection: 1 }), paused);
  for (let lives = 3; lives > 0; lives -= 1) {
    state = a.brickReducer({ ...state, lives, status: "running", ball: { x: 0, y: 118.2 }, velocity: { x: 0, y: 47 }, paddleX: 76 }, { type: "step", delta: 0.016, paddleDirection: 0 });
    assert.equal(state.lives, lives - 1); assert.equal(state.status, lives === 1 ? "lost" : "ready");
  }
  assert.deepEqual(a.brickReducer(state, { type: "reset" }), initial);
});
check("Brick Breaker can clear all 35 bricks without invalid positions", () => {
  let state = a.brickReducer(a.initialBrickState(), { type: "toggle" });
  for (let tick = 0; tick < 120 * 900 && state.status !== "won"; tick += 1) {
    if (state.status === "ready") state = a.brickReducer(state, { type: "toggle" });
    assert.notEqual(state.status, "lost");
    const distance = state.ball.x - (state.paddleX + 12);
    state = a.brickReducer(state, { type: "step", delta: 1 / 120, paddleDirection: Math.abs(distance) < 2 ? 0 : distance < 0 ? -1 : 1 });
    assert.ok(Number.isFinite(state.ball.x) && Number.isFinite(state.ball.y));
    assert.ok(state.paddleX >= 0 && state.paddleX <= 76);
  }
  assert.equal(state.status, "won"); assert.equal(state.score, 350); assert.equal(state.bricks.length, 0);
});
console.log(`Arcade behavior: ${checks} regressions passed.`);
