/** Small teaching calculations; these do not replace any saved study result. */
export function rolloutErrors(gain: number, steps: number, feedback: boolean) {
  const errors = [0];
  for (let step = 0; step < steps; step++) errors.push((feedback ? gain * errors[step] : 0) + .01);
  return errors;
}

export function visionTradeoff(current: { parameters: string; poseAccuracy: string; depthRmse: string }, reference: { parameters: string; poseAccuracy: string; depthRmse: string }) {
  return {
    parameterPercent: 100 * parseFloat(current.parameters) / parseFloat(reference.parameters),
    poseDifference: parseFloat(current.poseAccuracy) - parseFloat(reference.poseAccuracy),
    depthDifference: parseFloat(current.depthRmse) - parseFloat(reference.depthRmse),
  };
}
