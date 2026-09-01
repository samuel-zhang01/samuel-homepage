"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type CSSProperties,
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
  const snakeSegments = state.snake.map((segment, index) => {
    const classNames = ["snake-game__segment"];
    if (index === 0) {
      classNames.push("snake-game__segment--head", `snake-game__segment--${state.direction}`);
    }
    return (
      <span
        key={`snake-segment-${index}`}
        className={classNames.join(" ")}
        data-snake-x={segment.x}
        data-snake-y={segment.y}
        style={{ "--snake-x": segment.x, "--snake-y": segment.y } as CSSProperties}
      />
    );
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
        <div
          className={`snake-game__playfield${state.status === "running" ? " is-running" : ""}`}
          aria-hidden="true"
        >
          <span className="snake-game__grid" />
          {snakeSegments}
          <span
            key={`snake-food-${state.foodCursor}`}
            className="snake-game__food"
            data-snake-x={state.food.x}
            data-snake-y={state.food.y}
            style={{ "--snake-x": state.food.x, "--snake-y": state.food.y } as CSSProperties}
          />
        </div>
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

const BRICK_ARENA_WIDTH = 100;
const BRICK_ARENA_HEIGHT = 120;
const BRICK_BALL_RADIUS = 1.7;
const BRICK_PADDLE_WIDTH = 24;
const BRICK_PADDLE_HEIGHT = 3.2;
const BRICK_PADDLE_Y = 109;
const BRICK_PADDLE_SPEED = 72;

type BrickTile = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
};

function initialBricks(): BrickTile[] {
  const columns = 7;
  const rows = 5;
  const gap = 1.8;
  const sideInset = 4;
  const width = (BRICK_ARENA_WIDTH - sideInset * 2 - gap * (columns - 1)) / columns;

  return Array.from({ length: columns * rows }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    return {
      id: `${column}-${row}`,
      x: sideInset + column * (width + gap),
      y: 13 + row * 8.2,
      width,
      height: 5.4,
      row,
    };
  });
}

type BrickState = {
  ball: Point;
  velocity: Point;
  paddleX: number;
  bricks: BrickTile[];
  lives: number;
  score: number;
  status: PlayStatus;
};

type BrickAction =
  | { type: "step"; delta: number; paddleDirection: -1 | 0 | 1 }
  | { type: "nudge"; amount: -1 | 1 }
  | { type: "toggle" }
  | { type: "reset" };

function initialBrickState(): BrickState {
  return {
    ball: { x: 50, y: 105.4 },
    velocity: { x: 31, y: -47 },
    paddleX: (BRICK_ARENA_WIDTH - BRICK_PADDLE_WIDTH) / 2,
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

  if (action.type === "nudge") {
    if (state.status === "won" || state.status === "lost") return state;
    const paddleX = Math.max(
      0,
      Math.min(BRICK_ARENA_WIDTH - BRICK_PADDLE_WIDTH, state.paddleX + action.amount * 5),
    );
    return { ...state, paddleX, status: state.status === "ready" ? "running" : state.status };
  }

  if (state.status !== "running") return state;

  const delta = Math.max(0, Math.min(action.delta, 0.035));
  const substeps = Math.max(1, Math.ceil(delta / 0.008));
  const stepDelta = delta / substeps;
  let ballX = state.ball.x;
  let ballY = state.ball.y;
  let velocityX = state.velocity.x;
  let velocityY = state.velocity.y;
  let paddleX = state.paddleX;
  let bricks = state.bricks;
  let score = state.score;

  for (let step = 0; step < substeps; step += 1) {
    paddleX = Math.max(
      0,
      Math.min(
        BRICK_ARENA_WIDTH - BRICK_PADDLE_WIDTH,
        paddleX + action.paddleDirection * BRICK_PADDLE_SPEED * stepDelta,
      ),
    );

    let nextX = ballX + velocityX * stepDelta;
    let nextY = ballY + velocityY * stepDelta;

    if (nextX - BRICK_BALL_RADIUS <= 0 && velocityX < 0) {
      nextX = BRICK_BALL_RADIUS;
      velocityX = Math.abs(velocityX);
    } else if (nextX + BRICK_BALL_RADIUS >= BRICK_ARENA_WIDTH && velocityX > 0) {
      nextX = BRICK_ARENA_WIDTH - BRICK_BALL_RADIUS;
      velocityX = -Math.abs(velocityX);
    }
    if (nextY - BRICK_BALL_RADIUS <= 0 && velocityY < 0) {
      nextY = BRICK_BALL_RADIUS;
      velocityY = Math.abs(velocityY);
    }

    const overPaddle =
      nextX + BRICK_BALL_RADIUS >= paddleX &&
      nextX - BRICK_BALL_RADIUS <= paddleX + BRICK_PADDLE_WIDTH;
    const crossedPaddle =
      ballY + BRICK_BALL_RADIUS <= BRICK_PADDLE_Y + 0.8 &&
      nextY + BRICK_BALL_RADIUS >= BRICK_PADDLE_Y;

    if (velocityY > 0 && crossedPaddle && overPaddle) {
      const hitPosition = Math.max(
        -1,
        Math.min(1, (nextX - (paddleX + BRICK_PADDLE_WIDTH / 2)) / (BRICK_PADDLE_WIDTH / 2)),
      );
      const targetSpeed = 58;
      velocityX = Math.max(-50, Math.min(50, hitPosition * 44 + velocityX * 0.18));
      if (Math.abs(velocityX) < 8) velocityX = velocityX < 0 ? -8 : 8;
      velocityY = -Math.sqrt(Math.max(28 * 28, targetSpeed * targetSpeed - velocityX * velocityX));
      nextY = BRICK_PADDLE_Y - BRICK_BALL_RADIUS;
    }

    const hitBrick = bricks.find(
      (brick) =>
        nextX + BRICK_BALL_RADIUS >= brick.x &&
        nextX - BRICK_BALL_RADIUS <= brick.x + brick.width &&
        nextY + BRICK_BALL_RADIUS >= brick.y &&
        nextY - BRICK_BALL_RADIUS <= brick.y + brick.height,
    );

    if (hitBrick) {
      const cameFromTop = ballY + BRICK_BALL_RADIUS <= hitBrick.y && velocityY > 0;
      const cameFromBottom = ballY - BRICK_BALL_RADIUS >= hitBrick.y + hitBrick.height && velocityY < 0;
      const cameFromLeft = ballX + BRICK_BALL_RADIUS <= hitBrick.x && velocityX > 0;
      const cameFromRight = ballX - BRICK_BALL_RADIUS >= hitBrick.x + hitBrick.width && velocityX < 0;

      if (cameFromTop) {
        nextY = hitBrick.y - BRICK_BALL_RADIUS;
        velocityY = -Math.abs(velocityY);
      } else if (cameFromBottom) {
        nextY = hitBrick.y + hitBrick.height + BRICK_BALL_RADIUS;
        velocityY = Math.abs(velocityY);
      } else if (cameFromLeft) {
        nextX = hitBrick.x - BRICK_BALL_RADIUS;
        velocityX = -Math.abs(velocityX);
      } else if (cameFromRight) {
        nextX = hitBrick.x + hitBrick.width + BRICK_BALL_RADIUS;
        velocityX = Math.abs(velocityX);
      } else {
        velocityY *= -1;
      }

      bricks = bricks.filter((brick) => brick.id !== hitBrick.id);
      score += 10;
    }

    ballX = nextX;
    ballY = nextY;

    if (ballY + BRICK_BALL_RADIUS >= BRICK_ARENA_HEIGHT) {
      const lives = state.lives - 1;
      if (lives <= 0) {
        return {
          ...state,
          ball: { x: ballX, y: BRICK_ARENA_HEIGHT - BRICK_BALL_RADIUS },
          paddleX,
          bricks,
          score,
          lives: 0,
          status: "lost",
        };
      }
      return {
        ...state,
        ball: { x: 50, y: 105.4 },
        velocity: { x: lives % 2 === 0 ? -31 : 31, y: -47 },
        paddleX,
        bricks,
        score,
        lives,
        status: "ready",
      };
    }
  }

  return {
    ...state,
    ball: { x: ballX, y: ballY },
    velocity: { x: velocityX, y: velocityY },
    paddleX,
    bricks,
    score,
    status: bricks.length === 0 ? "won" : "running",
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
  const paddleDirectionRef = useRef<-1 | 0 | 1>(0);
  const lastFrameRef = useRef<number | null>(null);
  const t = useCallback((text: string) => translateText(locale, text), [locale]);

  useEffect(() => {
    if (state.status !== "running") {
      lastFrameRef.current = null;
      return;
    }

    let animationFrame = 0;
    const advance = (time: number) => {
      const previousTime = lastFrameRef.current;
      lastFrameRef.current = time;
      if (previousTime !== null) {
        dispatch({
          type: "step",
          delta: (time - previousTime) / 1000,
          paddleDirection: paddleDirectionRef.current,
        });
      }
      animationFrame = window.requestAnimationFrame(advance);
    };

    animationFrame = window.requestAnimationFrame(advance);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      lastFrameRef.current = null;
    };
  }, [state.status]);

  useEffect(() => {
    const stopPaddle = () => {
      paddleDirectionRef.current = 0;
    };
    window.addEventListener("pointerup", stopPaddle);
    window.addEventListener("pointercancel", stopPaddle);
    window.addEventListener("blur", stopPaddle);
    return () => {
      window.removeEventListener("pointerup", stopPaddle);
      window.removeEventListener("pointercancel", stopPaddle);
      window.removeEventListener("blur", stopPaddle);
    };
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      event.preventDefault();
      paddleDirectionRef.current = -1;
      if (!event.repeat) dispatch({ type: "nudge", amount: -1 });
    } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      event.preventDefault();
      paddleDirectionRef.current = 1;
      if (!event.repeat) dispatch({ type: "nudge", amount: 1 });
    } else if (event.key === "p" || event.key === "P") {
      dispatch({ type: "toggle" });
    } else if (event.key === "r" || event.key === "R") {
      dispatch({ type: "reset" });
    }
  };

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (
      (paddleDirectionRef.current === -1 && ["ArrowLeft", "a", "A"].includes(event.key)) ||
      (paddleDirectionRef.current === 1 && ["ArrowRight", "d", "D"].includes(event.key))
    ) {
      paddleDirectionRef.current = 0;
    }
  };

  const statusText = brickStatusText(state.status);
  const toggleLabel = state.status === "running" ? "Pause" : state.status === "paused" ? "Resume" : "Play";
  const ballDiameter = BRICK_BALL_RADIUS * 2;
  const ballStyle = {
    width: `${ballDiameter}%`,
    height: `${(ballDiameter / BRICK_ARENA_HEIGHT) * 100}%`,
    transform: `translate3d(${((state.ball.x - BRICK_BALL_RADIUS) / ballDiameter) * 100}%, ${((state.ball.y - BRICK_BALL_RADIUS) / ballDiameter) * 100}%, 0)`,
  };
  const paddleStyle = {
    width: `${BRICK_PADDLE_WIDTH}%`,
    height: `${(BRICK_PADDLE_HEIGHT / BRICK_ARENA_HEIGHT) * 100}%`,
    transform: `translate3d(${(state.paddleX / BRICK_PADDLE_WIDTH) * 100}%, ${(BRICK_PADDLE_Y / BRICK_PADDLE_HEIGHT) * 100}%, 0)`,
  };
  const startPaddle = (direction: -1 | 1) => {
    paddleDirectionRef.current = direction;
    dispatch({ type: "nudge", amount: direction });
  };
  const stopPaddle = (direction: -1 | 1) => {
    if (paddleDirectionRef.current === direction) paddleDirectionRef.current = 0;
  };

  return (
    <section
      className="brick-game"
      aria-labelledby="brick-game-title"
      aria-describedby="brick-game-keys"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => {
        paddleDirectionRef.current = 0;
      }}
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

      <div className="brick-game__machine">
        <div className="brick-game__machine-bar" aria-hidden="true">
          <span>PIXELWORKS 7</span>
          <span className={`brick-game__lamp${state.status === "running" ? " is-live" : ""}`} />
        </div>
        <div
          className="brick-game__board"
          role="img"
          aria-label={`${t("Brick Breaker board")}. ${t(statusText)} ${t("Score")}: ${state.score}. ${t("Lives")}: ${state.lives}.`}
        >
          <span className="brick-game__scanlines" aria-hidden="true" />
          {state.bricks.map((brick) => (
            <span
              key={brick.id}
              className={`brick-game__brick brick-game__brick--${brick.row}`}
              style={{
                left: `${brick.x}%`,
                top: `${(brick.y / BRICK_ARENA_HEIGHT) * 100}%`,
                width: `${brick.width}%`,
                height: `${(brick.height / BRICK_ARENA_HEIGHT) * 100}%`,
              }}
              aria-hidden="true"
            />
          ))}
          <span className="brick-game__ball" style={ballStyle} aria-hidden="true" />
          <span className="brick-game__paddle" style={paddleStyle} aria-hidden="true" />
        </div>
      </div>

      <p className="arcade-game__status" aria-live="polite">{t(statusText)}</p>
      <div className="arcade-game__controls arcade-game__controls--brick">
        <div className="brick-game__move-controls" aria-label={t("Paddle controls")}>
          <button
            type="button"
            onPointerDown={() => startPaddle(-1)}
            onPointerUp={() => stopPaddle(-1)}
            onPointerCancel={() => stopPaddle(-1)}
            onPointerLeave={() => stopPaddle(-1)}
            onClick={(event) => {
              if (event.detail === 0) dispatch({ type: "nudge", amount: -1 });
            }}
            aria-label={t("Move paddle left")}
          >
            ← {t("Left")}
          </button>
          <button
            type="button"
            onPointerDown={() => startPaddle(1)}
            onPointerUp={() => stopPaddle(1)}
            onPointerCancel={() => stopPaddle(1)}
            onPointerLeave={() => stopPaddle(1)}
            onClick={(event) => {
              if (event.detail === 0) dispatch({ type: "nudge", amount: 1 });
            }}
            aria-label={t("Move paddle right")}
          >
            {t("Right")} →
          </button>
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
