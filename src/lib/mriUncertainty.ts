/**
 * Synthetic eight-pixel counterexample for the MRI uncertainty exhibit.
 * Relative ECE follows compute_ece in notebook 03, cell 10, at
 * IX-Medical-Imaging revision 93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e.
 * None of these residuals or uncertainty values are recorded model outputs.
 */
const errors = [0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.36, 0.48] as const;

export function mriUncertaintySample(scale: number, reversed: boolean, removeCount: number) {
  if (!Number.isFinite(scale) || scale <= 0) throw new RangeError("Scale must be positive and finite");
  if (!Number.isInteger(removeCount) || removeCount < 0 || removeCount >= errors.length) {
    throw new RangeError("The removal budget must leave at least one pixel");
  }

  const uncertainty = errors.map((_, index) => errors[reversed ? errors.length - 1 - index : index] * scale);
  const uncertaintyMax = Math.max(...uncertainty) + 1e-10;
  const errorMax = Math.max(...errors) + 1e-10;
  const rows = errors.map((error, index) => ({
    id: index + 1,
    error,
    uncertainty: uncertainty[index],
    normalisedError: error / errorMax,
    normalisedUncertainty: uncertainty[index] / uncertaintyMax,
    removed: false,
  }));

  // The source uses 15 equal-width bins, inclusive lower / exclusive upper.
  let relativeEce = 0;
  for (let bin = 0; bin < 15; bin += 1) {
    const members = rows.filter((row) => row.normalisedUncertainty >= bin / 15 && row.normalisedUncertainty < (bin + 1) / 15);
    if (members.length > 0) {
      const gap = members.reduce((sum, row) => sum + row.normalisedUncertainty - row.normalisedError, 0);
      relativeEce += Math.abs(gap) / rows.length;
    }
  }

  const ranked = [...rows].sort((a, b) => b.uncertainty - a.uncertainty);
  for (const row of ranked.slice(0, removeCount)) row.removed = true;
  const retained = rows.filter((row) => !row.removed);
  const oracle = [...rows].sort((a, b) => b.error - a.error).slice(removeCount);
  const mse = (sample: typeof rows) => sample.reduce((sum, row) => sum + row.error ** 2, 0) / sample.length;

  return {
    rows,
    relativeEce,
    meanUncertainty: uncertainty.reduce((sum, value) => sum + value, 0) / rows.length,
    fullMse: mse(rows),
    retainedMse: mse(retained),
    oracleMse: mse(oracle),
    retainedCount: retained.length,
  };
}
