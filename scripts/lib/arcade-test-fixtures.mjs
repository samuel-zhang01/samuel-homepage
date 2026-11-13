import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Exercise the production reducers and generators without a React harness or a
// second implementation of their rules. Browser fixtures reuse these seeded
// generators for known solutions; they are not independent scientific models.
function sourceFunctions(file, names) {
  const url = new URL(`../../${file}`, import.meta.url);
  const source = ts.createSourceFile(file, readFileSync(url, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const statements = source.statements.filter(statement => names.includes(statement.name?.text)
    || statement.declarationList?.declarations.some(declaration => names.includes(declaration.name.text)));
  assert.equal(statements.length, names.length, `${file}: every requested production helper exists`);
  const compiled = ts.transpileModule(statements.map(statement => statement.getText(source)).join("\n"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  }).outputText;
  return new Function(`${compiled}\nreturn { ${names.join(",")} };`)();
}

export const arcade = sourceFunctions("src/components/ArcadeClassicGames.tsx", [
  "DIRECTIONS", "OPPOSITE_DIRECTION", "SNAKE_BOARD_SIZE", "SNAKE_WIN_SCORE", "SNAKE_FOOD_SEQUENCE",
  "pointsMatch", "initialSnakeState", "nextSnakeFood", "snakeReducer", "BRICK_ARENA_WIDTH",
  "BRICK_ARENA_HEIGHT", "BRICK_BALL_RADIUS", "BRICK_PADDLE_WIDTH", "BRICK_PADDLE_HEIGHT",
  "BRICK_PADDLE_Y", "BRICK_PADDLE_SPEED", "initialBricks", "initialBrickState", "brickReducer",
]);

export const deskArcade = sourceFunctions("src/components/SystemSevenDesktop.tsx", [
  "seededRandom", "createMinefield", "createPuzzle", "scoreWordGuess", "SAM_WORDS", "MEMORY_PAIRS", "createMemoryDeck",
]);

export const peakDock = sourceFunctions("src/components/HplcPeakDock.tsx", [
  "DIFFICULTIES", "COMPONENT_COLOURS", "DIFFICULTY_SALTS", "INITIAL_DIFFICULTY", "INITIAL_SEED",
  "TRACE_TIMES", "BASELINE", "AMPLITUDE_MIN", "AMPLITUDE_MAX", "createPrng", "randomBetween",
  "randomSignedMagnitude", "gaussian", "traceAt", "clampRetentionTime", "clampAmplitude", "generateSample", "makeDockState",
]);
