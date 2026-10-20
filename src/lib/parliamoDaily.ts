/**
 * Disposable adaptations of Parliamo's daily and academy engines.
 * Reviewed 20 October 2026: app/learning/{engine,study,academy-engine}.ts.
 * The academy additions were reviewed in the working tree beyond 5fd6fdf.
 */
export function matchesItalian(input: string, answer: string) {
  const normalise = (s: string) => s.trim().normalize("NFC").toLocaleLowerCase("it")
    .replace(/[’‘]/g, "'").replace(/[.!?,;:]+$/g, "").replace(/\s+/g, " ").trim();
  return normalise(input) === normalise(answer);
}
export function planDailySample(minutes: number, due: number, active = true) {
  const reviews = active ? Math.min(due, Math.floor(minutes / 2)) : 0;
  const missions = active ? Math.floor((minutes - reviews * 2) / 5) : 0;
  return { reviews, missions, used: reviews * 2 + missions * 5, waiting: due - reviews };
}
export const nextDailyInterval = (interval: number, correct: boolean) =>
  correct ? (interval < 3 ? 3 : interval < 7 ? 7 : 14) : 1;
export type DailyAttempt = {
  answers: string[]; checked: boolean[]; first: (boolean | null)[];
  output: string; rubric: boolean[]; completed: boolean;
};
export const newDailyAttempt = (): DailyAttempt => ({
  answers: ["", ""], checked: [false, false], first: [null, null],
  output: "", rubric: [false, false], completed: false,
});
export function checkDailyAnswer(attempt: DailyAttempt, index: number): DailyAttempt {
  if (attempt.completed || attempt.checked[index] || !attempt.answers[index]?.trim()) return attempt;
  const correct = matchesItalian(attempt.answers[index], ["chiamo", "ti"][index]);
  return { ...attempt,
    checked: attempt.checked.map((value, i) => i === index ? correct : value),
    first: attempt.first.map((value, i) => i === index ? value ?? correct : value),
  };
}
export function finishDailyMission(attempt: DailyAttempt): DailyAttempt {
  if (attempt.completed || !attempt.checked.every(Boolean) || !attempt.rubric.every(Boolean)
    || attempt.output.trim().split(/\s+/).length < 3) return attempt;
  return { ...attempt, completed: true };
}

export type SampleProgramme = "supported" | "intensive" | "repair";
export type AcademyBudget = 30 | 45 | 60;
const firstDayUnits: Record<SampleProgramme, number> = {
  supported: 1,
  intensive: 2,
  repair: 2,
};

/** Source dailyRecipe restricted to the three displayed budgets and first study day. */
export function planAcademySample(minutes: AcademyBudget, programme: SampleProgramme) {
  const unitCount = firstDayUnits[programme];
  const grammarMinutes = minutes >= 60
    ? Math.min(unitCount, 3) * 15
    : minutes >= 45 ? Math.min(unitCount, 2) * 15 : 15;
  const workshopCount = Math.min(unitCount, Math.max(1, Math.floor(grammarMinutes / 15)));
  const guided = Math.min(30, minutes - grammarMinutes);
  const extra = minutes - guided - grammarMinutes;
  return {
    guided,
    workshops: Array.from({ length: workshopCount }, () => grammarMinutes / workshopCount),
    tense: Math.min(10, extra),
    companion: Math.max(0, extra - 10),
    waitingUnits: unitCount - workshopCount,
    total: minutes,
  };
}

export type GrammarSampleAttempt = {
  day: number;
  answer: string;
  correct: boolean;
  assisted: boolean;
};
export type GrammarSample = {
  day: number;
  answer: string;
  hintDay: number | null;
  supportSeen: boolean;
  attempts: GrammarSampleAttempt[];
};
export const newGrammarSample = (): GrammarSample => ({
  day: 1, answer: "", hintDay: null, supportSeen: false, attempts: [],
});
export const hintGrammarSample = (state: GrammarSample): GrammarSample =>
  ({ ...state, hintDay: state.day, supportSeen: true });

/** Original portal item past-avere-2: "Noi ___ lavorato ieri." */
export function checkGrammarSample(state: GrammarSample): GrammarSample {
  if (!state.answer.trim() || state.answer.length > 500) return state;
  const last = state.attempts.at(-1);
  const freshRecall = !!last && last.day < state.day;
  const assisted = state.hintDay === state.day || (!freshRecall &&
    (state.supportSeen || state.attempts.some(attempt => !attempt.correct)));
  if (last?.day === state.day && last.answer === state.answer && last.assisted === assisted) return state;
  const attempt = {
    day: state.day, answer: state.answer,
    correct: matchesItalian(state.answer, "abbiamo"), assisted,
  };
  const history = [...state.attempts, attempt];
  return {
    ...state, supportSeen: state.supportSeen || assisted,
    attempts: history.length > 12 ? [history[0], ...history.slice(-11)] : history,
  };
}

/** Source grammar queue: supported/error attempts return in one day, independent success in three. */
export function nextGrammarSample(state: GrammarSample): GrammarSample {
  const last = state.attempts.at(-1);
  if (!last || last.day !== state.day) return state;
  return {
    ...state,
    day: state.day + (last.correct && !last.assisted ? 3 : 1),
    answer: "",
  };
}
