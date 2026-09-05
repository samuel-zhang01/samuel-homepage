import { getRadialDistribution, radialWavefunction, realSphericalHarmonic } from "./orbitals";

export type OrbitalSurface = { vertices: Float32Array; level: number; radius: number };
export const SURFACE_GRID = 80;
export const SURFACE_DENSITY_FRACTION = .01;

// A fixed, bounded marching-tetrahedra grid. Coordinates are normalised only
// for display; the scalar field is the same analytic Z=1 wavefunction as ASCII.
// Each vertex contains position, outward density-gradient normal and phase.
export function buildOrbitalSurface(n: number, l: number, m: number): OrbitalSurface {
  const radial = getRadialDistribution(n, l, 2_048);
  realSphericalHarmonic(l, m, 1, 0); // Validate even before entering the grid.
  // A high-n s orbital can have a tiny, high-density core. Meshing its entire
  // probability-cloud extent would skip radial nodes. Bound the mesh by the
  // actual requested isovalue instead, keeping the core spatially resolved.
  let angularPeak = 0;
  for (let theta = 0; theta <= 64; theta++) for (let phi = 0; phi < 128; phi++) {
    angularPeak = Math.max(angularPeak, realSphericalHarmonic(l, m, theta / 32 - 1, phi * Math.PI / 64) ** 2);
  }
  const radialDensity = radial.map(({ r }) => radialWavefunction(n, l, r) ** 2);
  const peak = Math.max(...radialDensity) * angularPeak;
  const level = peak * SURFACE_DENSITY_FRACTION;
  let last = radial.length - 1;
  while (last > 0 && radialDensity[last] * angularPeak < level) last--;
  const radius = radial[Math.min(last + 1, radial.length - 1)].r * 1.08;
  const size = SURFACE_GRID + 1;
  const count = size ** 3;
  const density = new Float32Array(count);
  const phase = new Int8Array(count);
  const step = 2 / SURFACE_GRID;
  const index = (x: number, y: number, z: number) => x + size * (y + size * z);
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const px = (x * step - 1) * radius;
    const py = (y * step - 1) * radius;
    const pz = (z * step - 1) * radius;
    const r = Math.hypot(px, py, pz);
    const psi = radialWavefunction(n, l, r) * realSphericalHarmonic(l, m, r ? pz / r : 1, Math.atan2(py, px));
    const i = index(x, y, z);
    density[i] = psi * psi;
    phase[i] = psi < 0 ? -1 : 1;
  }
  const normals = new Float32Array(count * 3);
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = index(x, y, z) * 3;
    normals[i] = density[index(Math.max(0, x - 1), y, z)] - density[index(Math.min(size - 1, x + 1), y, z)];
    normals[i + 1] = density[index(x, Math.max(0, y - 1), z)] - density[index(x, Math.min(size - 1, y + 1), z)];
    normals[i + 2] = density[index(x, y, Math.max(0, z - 1))] - density[index(x, y, Math.min(size - 1, z + 1))];
  }
  const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  // Common 0–6 body diagonal keeps the faces shared by neighbouring cubes consistent.
  const tetrahedra = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
  const vertices: number[] = [];
  for (let z = 0; z < SURFACE_GRID; z++) for (let y = 0; y < SURFACE_GRID; y++) for (let x = 0; x < SURFACE_GRID; x++) {
    const ids = corners.map(([dx, dy, dz]) => index(x + dx, y + dy, z + dz));
    if (ids.every((id) => density[id] < level) || ids.every((id) => density[id] >= level)) continue;
    const edge = (a: number, b: number) => {
      const ai = ids[a], bi = ids[b];
      const insidePhase = phase[density[ai] >= level ? ai : bi];
      // Interpolate signed amplitude so an edge cannot jump across a node to
      // the opposite phase merely because both squared values are small.
      const psiA = phase[ai] * Math.sqrt(density[ai]);
      const psiB = phase[bi] * Math.sqrt(density[bi]);
      const t = (insidePhase * Math.sqrt(level) - psiA) / (psiB - psiA);
      const normal = [0, 1, 2].map((axis) => normals[ai * 3 + axis] * (1 - t) + normals[bi * 3 + axis] * t);
      const length = Math.hypot(...normal) || 1;
      return [
        ...[x, y, z].map((base, axis) => (base + corners[a][axis] * (1 - t) + corners[b][axis] * t) * step - 1),
        ...normal.map((value) => value / length), insidePhase,
      ];
    };
    for (const tetra of tetrahedra) {
      const inside = tetra.filter((corner) => density[ids[corner]] >= level);
      const outside = tetra.filter((corner) => density[ids[corner]] < level);
      if (!inside.length || !outside.length) continue;
      if (inside.length === 1 || outside.length === 1) {
        const [tip] = inside.length === 1 ? inside : outside;
        const rest = inside.length === 1 ? outside : inside;
        for (const corner of rest) vertices.push(...edge(tip, corner));
      } else {
        const a = edge(inside[0], outside[0]), b = edge(inside[0], outside[1]);
        const c = edge(inside[1], outside[0]), d = edge(inside[1], outside[1]);
        vertices.push(...a, ...b, ...c, ...b, ...d, ...c);
      }
    }
  }
  return { vertices: new Float32Array(vertices), radius, level };
}
