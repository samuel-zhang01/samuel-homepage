export type FocusState = {
  durationSeconds: number;
  remainingSeconds: number;
  endsAt: number | null;
  running: boolean;
  completedDate: string;
  completedCount: number;
};

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Settle wall-clock progress once, attributing completed sessions to their end date. */
export function advanceFocusState(state: FocusState, now = Date.now()): FocusState {
  const today = localDateKey(new Date(now));
  const expired = state.running && state.endsAt !== null && state.endsAt <= now;
  const completedToday = expired && localDateKey(new Date(state.endsAt!)) === today;
  const remainingSeconds = expired
    ? 0
    : state.running && state.endsAt !== null
      ? Math.max(0, Math.min(state.durationSeconds, Math.ceil((state.endsAt - now) / 1_000)))
      : state.remainingSeconds;
  const completedCount = Math.min(10_000, (state.completedDate === today ? state.completedCount : 0) + (completedToday ? 1 : 0));
  if (!expired && remainingSeconds === state.remainingSeconds && state.completedDate === today && completedCount === state.completedCount) return state;
  return {
    ...state,
    remainingSeconds,
    endsAt: expired ? null : state.endsAt,
    running: expired ? false : state.running,
    completedDate: today,
    completedCount,
  };
}

/** Accept a complete decimal value, including pasted scientific notation. */
export function parseConverterInput(input: string): number {
  const normalised = input.trim().replace(",", ".");
  const parsed = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalised)
    ? Number(normalised)
    : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function enterCalculatorDigit(display: string, waitingForOperand: boolean, digit: string): string {
  if (!/^\d$/.test(digit)) return display;
  if (display === "Error" || waitingForOperand || /e/i.test(display)) return digit;
  if (display.replace(/[-.]/g, "").length >= 12) return display;
  return display === "0" ? digit : `${display}${digit}`;
}

export function enterCalculatorDecimal(display: string, waitingForOperand: boolean): string {
  if (display === "Error" || waitingForOperand || /e/i.test(display)) return "0.";
  return display.includes(".") ? display : `${display}.`;
}
