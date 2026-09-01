"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { translateText, type Locale } from "@/lib/i18n";

type GameProps = {
  locale: Locale;
};

type PlayStatus = "ready" | "running" | "paused" | "won" | "lost";

type Point = {
  x: number;
  y: number;
};

type Direction = "up" | "right" | "down" | "left";

const DIRECTIONS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

const SNAKE_BOARD_SIZE = 12;
const SNAKE_WIN_SCORE = 100;
const SNAKE_FOOD_SEQUENCE: readonly Point[] = [
  { x: 8, y: 6 },
  { x: 8, y: 2 },
  { x: 3, y: 2 },
  { x: 3, y: 9 },
  { x: 9, y: 9 },
  { x: 10, y: 4 },
  { x: 6, y: 4 },
  { x: 6, y: 10 },
  { x: 1, y: 10 },
  { x: 1, y: 5 },
  { x: 10, y: 1 },
  { x: 5, y: 8 },
];

type SnakeState = {
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction;
  food: Point;
  foodCursor: number;
  score: number;
  status: PlayStatus;
};

type SnakeAction =
  | { type: "tick" }
  | { type: "turn"; direction: Direction }
  | { type: "toggle" }
  | { type: "reset" };

function pointsMatch(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function initialSnakeState(): SnakeState {
  return {
    snake: [
      { x: 4, y: 6 },
      { x: 3, y: 6 },
      { x: 2, y: 6 },
    ],
    direction: "right",
    queuedDirection: "right",
    food: SNAKE_FOOD_SEQUENCE[0],
    foodCursor: 0,
    score: 0,
    status: "ready",
  };
}

function nextSnakeFood(snake: Point[], cursor: number) {
  for (let offset = 1; offset <= SNAKE_FOOD_SEQUENCE.length; offset += 1) {
    const nextCursor = (cursor + offset) % SNAKE_FOOD_SEQUENCE.length;
    const candidate = SNAKE_FOOD_SEQUENCE[nextCursor];
    if (!snake.some((segment) => pointsMatch(segment, candidate))) {
      return { food: candidate, foodCursor: nextCursor };
    }
  }
  return { food: SNAKE_FOOD_SEQUENCE[cursor], foodCursor: cursor };
}

function snakeReducer(state: SnakeState, action: SnakeAction): SnakeState {
  if (action.type === "reset") return initialSnakeState();

  if (action.type === "toggle") {
    if (state.status === "won" || state.status === "lost") return state;
    return {
      ...state,
      status: state.status === "running" ? "paused" : "running",
    };
  }

  if (action.type === "turn") {
    if (state.status === "won" || state.status === "lost") return state;
    if (state.queuedDirection !== state.direction) return state;
    if (OPPOSITE_DIRECTION[state.direction] === action.direction) return state;
    return {
      ...state,
      queuedDirection: action.direction,
      status: state.status === "ready" ? "running" : state.status,
    };
  }

  if (state.status !== "running") return state;

  const movement = DIRECTIONS[state.queuedDirection];
  const head = state.snake[0];
  const nextHead = { x: head.x + movement.x, y: head.y + movement.y };
  const ateFood = pointsMatch(nextHead, state.food);
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitWall =
    nextHead.x < 0 ||
    nextHead.x >= SNAKE_BOARD_SIZE ||
    nextHead.y < 0 ||
    nextHead.y >= SNAKE_BOARD_SIZE;
  const hitSnake = collisionBody.some((segment) => pointsMatch(segment, nextHead));

  if (hitWall || hitSnake) return { ...state, status: "lost" };

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) nextSnake.pop();

  if (!ateFood) {
    return {
      ...state,
      snake: nextSnake,
      direction: state.queuedDirection,
    };
  }

  const score = state.score + 10;
  const nextFood = nextSnakeFood(nextSnake, state.foodCursor);
  return {
    ...state,
    ...nextFood,
    snake: nextSnake,
    direction: state.queuedDirection,
    score,
    status: score >= SNAKE_WIN_SCORE ? "won" : "running",
  };
}

function snakeStatusText(status: PlayStatus) {
  switch (status) {
    case "running":
      return "Running. Mind the walls.";
    case "paused":
      return "Paused. The snake is holding very still.";
    case "won":
      return "You cleared the whole lunch break. You win!";
    case "lost":
      return "Game over. Reset and try again.";
    default:
      return "Ready. Use Play or a direction to begin.";
  }
}

export function SnakeGame({ locale }: GameProps) {
  const [state, dispatch] = useReducer(snakeReducer, undefined, initialSnakeState);
  const t = useCallback((text: string) => translateText(locale, text), [locale]);

  useEffect(() => {
    if (state.status !== "running") return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 155);
    return () => window.clearInterval(timer);
  }, [state.status]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

    const keyDirections: Record<string, Direction | undefined> = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowRight: "right",
      d: "right",
      D: "right",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
    };
    const direction = keyDirections[event.key];
    if (direction) {
      event.preventDefault();
      dispatch({ type: "turn", direction });
    } else if (event.key === "p" || event.key === "P") {
      dispatch({ type: "toggle" });
    } else if (event.key === "r" || event.key === "R") {
      dispatch({ type: "reset" });
    }
  };

  const statusText = snakeStatusText(state.status);
  const cells = Array.from({ length: SNAKE_BOARD_SIZE * SNAKE_BOARD_SIZE }, (_, index) => {
    const point = { x: index % SNAKE_BOARD_SIZE, y: Math.floor(index / SNAKE_BOARD_SIZE) };
    const snakeIndex = state.snake.findIndex((segment) => pointsMatch(segment, point));
    const isFood = pointsMatch(state.food, point);
    const classNames = ["snake-game__cell"];
    if (snakeIndex >= 0) classNames.push("snake-game__cell--snake");
    if (snakeIndex === 0) classNames.push("snake-game__cell--head");
    if (isFood) classNames.push("snake-game__cell--food");
    return <span key={`${point.x}-${point.y}`} className={classNames.join(" ")} aria-hidden="true" />;
  });

  const turn = (direction: Direction) => dispatch({ type: "turn", direction });
  const toggleLabel = state.status === "running" ? "Pause" : state.status === "paused" ? "Resume" : "Play";

  return (
    <section
      className="snake-game"
      aria-labelledby="snake-game-title"
      aria-describedby="snake-game-keys"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="arcade-game__header">
        <div>
          <span className="eyebrow">{t("DESK ARCADE · CLASSIC")}</span>
          <h3 id="snake-game-title">{t("Snake")}</h3>
          <p>{t("Collect every byte. Avoid the edge of the desktop—and yourself.")}</p>
        </div>
        <dl className="arcade-game__scoreboard">
          <div><dt>{t("Score")}</dt><dd>{state.score}</dd></div>
          <div><dt>{t("Length")}</dt><dd>{state.snake.length}</dd></div>
        </dl>
      </header>

      <div
        className="snake-game__board"
        role="img"
        aria-label={`${t("Snake board")}. ${t(statusText)} ${t("Score")}: ${state.score}.`}
      >
        {cells}
      </div>

      <p className="arcade-game__status" aria-live="polite">{t(statusText)}</p>

      <div className="arcade-game__controls">
        <div className="snake-game__dpad" aria-label={t("Snake direction controls")}>
          <button type="button" className="snake-game__up" onClick={() => turn("up")} aria-label={t("Move up")}>↑</button>
          <button type="button" className="snake-game__left" onClick={() => turn("left")} aria-label={t("Move left")}>←</button>
          <button type="button" className="snake-game__down" onClick={() => turn("down")} aria-label={t("Move down")}>↓</button>
          <button type="button" className="snake-game__right" onClick={() => turn("right")} aria-label={t("Move right")}>→</button>
        </div>
        <div className="arcade-game__actions">
          <button
            type="button"
            onClick={() => dispatch({ type: "toggle" })}
            disabled={state.status === "won" || state.status === "lost"}
          >
            {t(toggleLabel)}
          </button>
          <button type="button" onClick={() => dispatch({ type: "reset" })}>{t("Reset")}</button>
        </div>
      </div>
      <p id="snake-game-keys" className="arcade-game__keys">{t("Keyboard: Arrow keys or WASD · P pause · R reset")}</p>
    </section>
  );
}

const BRICK_COLUMNS = 15;
const BRICK_ROWS = 18;
const BRICK_PADDLE_ROW = 16;
const BRICK_PADDLE_WIDTH = 3;

function initialBricks() {
  const bricks: string[] = [];
  for (let y = 2; y <= 5; y += 1) {
    for (let x = 1; x < BRICK_COLUMNS - 1; x += 1) {
      if ((x + y) % 7 !== 0) bricks.push(`${x}-${y}`);
    }
  }
  return bricks;
}

type BrickState = {
  ball: Point;
  velocity: Point;
  paddleX: number;
  bricks: string[];
  lives: number;
  score: number;
  status: PlayStatus;
};

type BrickAction =
  | { type: "tick" }
  | { type: "move"; amount: -1 | 1 }
  | { type: "toggle" }
  | { type: "reset" };

function initialBrickState(): BrickState {
  return {
    ball: { x: 7, y: 14 },
    velocity: { x: 1, y: -1 },
    paddleX: 6,
    bricks: initialBricks(),
    lives: 3,
    score: 0,
    status: "ready",
  };
}

function brickReducer(state: BrickState, action: BrickAction): BrickState {
  if (action.type === "reset") return initialBrickState();

  if (action.type === "toggle") {
    if (state.status === "won" || state.status === "lost") return state;
    return { ...state, status: state.status === "running" ? "paused" : "running" };
  }

  if (action.type === "move") {
    if (state.status === "won" || state.status === "lost") return state;
    const paddleX = Math.max(0, Math.min(BRICK_COLUMNS - BRICK_PADDLE_WIDTH, state.paddleX + action.amount));
    return { ...state, paddleX, status: state.status === "ready" ? "running" : state.status };
  }

  if (state.status !== "running") return state;

  let velocityX = state.velocity.x;
  let velocityY = state.velocity.y;
  let nextX = state.ball.x + velocityX;
  let nextY = state.ball.y + velocityY;

  if (nextX < 0 || nextX >= BRICK_COLUMNS) {
    velocityX *= -1;
    nextX = state.ball.x + velocityX;
  }
  if (nextY < 0) {
    velocityY = 1;
    nextY = state.ball.y + velocityY;
  }

  const overPaddle = nextX >= state.paddleX && nextX < state.paddleX + BRICK_PADDLE_WIDTH;
  if (velocityY > 0 && nextY === BRICK_PADDLE_ROW && overPaddle) {
    velocityY = -1;
    velocityX = nextX === state.paddleX ? -1 : nextX === state.paddleX + BRICK_PADDLE_WIDTH - 1 ? 1 : velocityX;
    nextY = state.ball.y + velocityY;
  }

  if (nextY >= BRICK_ROWS) {
    const lives = state.lives - 1;
    if (lives <= 0) return { ...state, lives: 0, status: "lost" };
    return {
      ...state,
      ball: { x: 7, y: 14 },
      velocity: { x: lives % 2 === 0 ? -1 : 1, y: -1 },
      lives,
      status: "ready",
    };
  }

  const brickKey = `${nextX}-${nextY}`;
  if (state.bricks.includes(brickKey)) {
    const bricks = state.bricks.filter((brick) => brick !== brickKey);
    velocityY *= -1;
    nextY = state.ball.y + velocityY;
    const score = state.score + 10;
    return {
      ...state,
      ball: { x: nextX, y: nextY },
      velocity: { x: velocityX, y: velocityY },
      bricks,
      score,
      status: bricks.length === 0 ? "won" : "running",
    };
  }

  return {
    ...state,
    ball: { x: nextX, y: nextY },
    velocity: { x: velocityX, y: velocityY },
  };
}

function brickStatusText(status: PlayStatus) {
  switch (status) {
    case "running":
      return "Ball in play.";
    case "paused":
      return "Paused between pixels.";
    case "won":
      return "Desktop cleared. You win!";
    case "lost":
      return "Out of lives. Reset for another round.";
    default:
      return "Ready. Move or press Play to launch.";
  }
}

export function BrickBreakerGame({ locale }: GameProps) {
  const [state, dispatch] = useReducer(brickReducer, undefined, initialBrickState);
  const t = useCallback((text: string) => translateText(locale, text), [locale]);

  useEffect(() => {
    if (state.status !== "running") return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 105);
    return () => window.clearInterval(timer);
  }, [state.status]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      event.preventDefault();
      dispatch({ type: "move", amount: -1 });
    } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      event.preventDefault();
      dispatch({ type: "move", amount: 1 });
    } else if (event.key === "p" || event.key === "P") {
      dispatch({ type: "toggle" });
    } else if (event.key === "r" || event.key === "R") {
      dispatch({ type: "reset" });
    }
  };

  const statusText = brickStatusText(state.status);
  const cells = Array.from({ length: BRICK_COLUMNS * BRICK_ROWS }, (_, index) => {
    const point = { x: index % BRICK_COLUMNS, y: Math.floor(index / BRICK_COLUMNS) };
    const key = `${point.x}-${point.y}`;
    const isBall = pointsMatch(point, state.ball);
    const isPaddle =
      point.y === BRICK_PADDLE_ROW &&
      point.x >= state.paddleX &&
      point.x < state.paddleX + BRICK_PADDLE_WIDTH;
    const isBrick = state.bricks.includes(key);
    const classNames = ["brick-game__cell"];
    if (isBall) classNames.push("brick-game__cell--ball");
    if (isPaddle) classNames.push("brick-game__cell--paddle");
    if (isBrick) classNames.push("brick-game__cell--brick", `brick-game__cell--brick-${point.y - 2}`);
    return <span key={key} className={classNames.join(" ")} aria-hidden="true" />;
  });
  const toggleLabel = state.status === "running" ? "Pause" : state.status === "paused" ? "Resume" : "Play";

  return (
    <section
      className="brick-game"
      aria-labelledby="brick-game-title"
      aria-describedby="brick-game-keys"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="arcade-game__header">
        <div>
          <span className="eyebrow">{t("DESK ARCADE · CLASSIC")}</span>
          <h3 id="brick-game-title">{t("Brick Breaker")}</h3>
          <p>{t("Keep the ball above the menu bar and clear every colourful brick.")}</p>
        </div>
        <dl className="arcade-game__scoreboard">
          <div><dt>{t("Score")}</dt><dd>{state.score}</dd></div>
          <div><dt>{t("Lives")}</dt><dd>{state.lives}</dd></div>
        </dl>
      </header>

      <div
        className="brick-game__board"
        role="img"
        aria-label={`${t("Brick Breaker board")}. ${t(statusText)} ${t("Score")}: ${state.score}. ${t("Lives")}: ${state.lives}.`}
      >
        {cells}
      </div>

      <p className="arcade-game__status" aria-live="polite">{t(statusText)}</p>
      <div className="arcade-game__controls arcade-game__controls--brick">
        <div className="brick-game__move-controls" aria-label={t("Paddle controls")}>
          <button type="button" onClick={() => dispatch({ type: "move", amount: -1 })} aria-label={t("Move paddle left")}>← {t("Left")}</button>
          <button type="button" onClick={() => dispatch({ type: "move", amount: 1 })} aria-label={t("Move paddle right")}>{t("Right")} →</button>
        </div>
        <div className="arcade-game__actions">
          <button
            type="button"
            onClick={() => dispatch({ type: "toggle" })}
            disabled={state.status === "won" || state.status === "lost"}
          >
            {t(toggleLabel)}
          </button>
          <button type="button" onClick={() => dispatch({ type: "reset" })}>{t("Reset")}</button>
        </div>
      </div>
      <p id="brick-game-keys" className="arcade-game__keys">{t("Keyboard: Left/Right or A/D · P pause · R reset")}</p>
    </section>
  );
}
