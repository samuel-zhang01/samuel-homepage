/** Compact, disposable adaptation of Parliamo 5fd6fdf, app/learning/engine.ts. */
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
