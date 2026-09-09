/** Two-response teaching model from STUDY-RL Lesson 04, not a language model. */
export function dpoPreference(policy: number, reference: number, beta: number) {
  const margin = Math.log(policy / (1 - policy)) - Math.log(reference / (1 - reference));
  const logit = beta * margin;
  const probability = 1 / (1 + Math.exp(-logit));
  return { margin, probability, loss: Math.max(0, -logit) + Math.log1p(Math.exp(-Math.abs(logit))), gradient: -beta * (1 - probability) };
}

export type LoraState = { a: [number, number]; b: [number, number]; step: number };
export const initialLoraState: LoraState = { a: [1, -1], b: [0, 0], step: 0 };
export function inspectLora(state: LoraState) {
  const activation = 2 * state.a[0] + state.a[1];
  const output = [2 + state.b[0] * activation, 1 + state.b[1] * activation];
  const error = [output[0] - 3, output[1]];
  const upstream = error[0] * state.b[0] + error[1] * state.b[1];
  return { output, loss: (error[0] ** 2 + error[1] ** 2) / 2, gradA: [2 * upstream, upstream], gradB: [error[0] * activation, error[1] * activation] };
}
export function stepLora(state: LoraState, rate: number): LoraState {
  const { gradA, gradB } = inspectLora(state);
  return { a: [state.a[0] - rate * gradA[0], state.a[1] - rate * gradA[1]], b: [state.b[0] - rate * gradB[0], state.b[1] - rate * gradB[1]], step: state.step + 1 };
}

/** Deterministic synthetic residuals: a stress test, not measured source coverage. */
export function shiftedCoverage(target: number, shift: number) {
  if (target <= 0 || target > .99 || !Number.isFinite(target) || !Number.isFinite(shift)) throw new RangeError("Choose coverage above 0 and at most 0.99, with a finite shift.");
  const calibration = Array.from({ length: 99 }, (_, i) => (i + 1) / 100);
  const rank = Math.min(calibration.length, Math.ceil((calibration.length + 1) * target));
  const radius = calibration[rank - 1];
  const rows = Array.from({ length: 40 }, (_, i) => {
    const residual = (i - 19.5) / 20 + shift;
    return { residual, covered: Math.abs(residual) <= radius };
  });
  return { radius, rank, rows, covered: rows.filter((row) => row.covered).length, total: rows.length };
}
