/** Pure calculations for fictional browser experiments; not coursework performance. */
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function cyberCohort(threshold: number, attackPercent = 50) {
  const attacks = Math.round(2_000 * clamp(attackPercent, 0, 100) / 100);
  const benign = 2_000 - attacks;
  const falsePositiveRate = clamp(0.257 * (1 - threshold ** 2.2), 0, 1);
  const truePositiveRate = clamp(1 - 0.005 * (threshold / 0.5) ** 6, 0.55, 1);
  const fp = Math.round(falsePositiveRate * benign);
  const tp = Math.round(truePositiveRate * attacks);
  return { attacks, benign, tn: benign - fp, fp, fn: attacks - tp, tp };
}

export function shrinkCoefficient(beta: number, lambda: number, method: "ridge" | "lasso") {
  if (method === "ridge") return beta / (1 + lambda);
  const magnitude = Math.max(Math.abs(beta) - lambda, 0);
  return magnitude === 0 ? 0 : Math.sign(beta) * magnitude;
}

export function predictionSensitivity(coefficients: readonly number[], inputs: readonly number[], noise: number) {
  const prediction = coefficients.reduce((sum, beta, index) => sum + beta * (inputs[index] ?? 0), 0);
  const radius = Math.abs(coefficients.at(-1) ?? 0) * Math.abs(noise);
  return { prediction, low: prediction - radius, high: prediction + radius, span: radius * 2 };
}

export function biasedReward(q0: number, q1: number, bias: number) {
  return { q0: clamp(q0 + bias, 0, 1), q1: clamp(q1 + bias, 0, 1) };
}

/** Within both groups treatment adds 10pp; selection imbalance can reverse pooled rates. */
export function confoundingCohort(imbalance: number) {
  const experiencedTreated = Math.round(50 - clamp(imbalance, 0, 40));
  const groups = [
    { key: "less", treated: 100 - experiencedTreated, control: experiencedTreated, treatedRate: 0.3, controlRate: 0.2 },
    { key: "more", treated: experiencedTreated, control: 100 - experiencedTreated, treatedRate: 0.9, controlRate: 0.8 },
  ];
  const observed = groups.reduce((sum, group) => sum + group.treated * group.treatedRate, 0) / 100
    - groups.reduce((sum, group) => sum + group.control * group.controlRate, 0) / 100;
  return { groups, observed, adjusted: 0.1 };
}

/** Pending work stays unresolved. Capacity does not send unsafe cases back to the model. */
export function allocateReview<T extends { id: string; entropy: number; confidence: number }>(deferred: readonly T[], capacity: number) {
  const queue = [...deferred].sort((a, b) => b.entropy - a.entropy || a.confidence - b.confidence || a.id.localeCompare(b.id));
  const slots = clamp(Math.floor(capacity), 0, queue.length);
  return { completed: queue.slice(0, slots), pending: queue.slice(slots) };
}
