/**
 * Orbital Lab is an educational, non-relativistic, one-electron model (Z = 1).
 * Neutral-atom occupations do not turn these hydrogenic functions into a
 * many-electron calculation. Lengths are Bohr radii, not element-specific sizes.
 * The two phases are signs of a real wavefunction, never positive/negative charge.
 */
export const ORBITAL_SOURCES = {
  configurations: "https://math.nist.gov/DFTdata/atomdata/configuration.html",
  periodicTable: "https://www.nist.gov/pml/periodic-table-elements",
  elementIndex: "https://physics.nist.gov/PhysRefData/Elements/per_noframes.html",
  lawrencium: "https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?element=103",
  hydrogen: "https://farside.ph.utexas.edu/teaching/qm/Quantum/node44.html",
  harmonics: "https://farside.ph.utexas.edu/teaching/qmech/lectures/node76.html",
} as const;

export type Subshell = { n: number; l: number; electrons: number };
export type ElementRecord = {
  number: number;
  symbol: string;
  name: string;
  period: number;
  /** null means a detached lanthanoid/actinoid row, not a group assignment. */
  group: number | null;
  /** Display family: detached series use f, including their occupation exceptions. */
  block: "s" | "p" | "d" | "f";
  configuration: Subshell[];
  /** reference means listed by NIST, not necessarily measured experimentally. */
  configurationStatus: "reference" | "predicted" | "aufbau";
};

const ELEMENT_NAMES = [
  "H Hydrogen", "He Helium", "Li Lithium", "Be Beryllium", "B Boron", "C Carbon", "N Nitrogen", "O Oxygen", "F Fluorine", "Ne Neon",
  "Na Sodium", "Mg Magnesium", "Al Aluminium", "Si Silicon", "P Phosphorus", "S Sulfur", "Cl Chlorine", "Ar Argon",
  "K Potassium", "Ca Calcium", "Sc Scandium", "Ti Titanium", "V Vanadium", "Cr Chromium", "Mn Manganese", "Fe Iron", "Co Cobalt", "Ni Nickel", "Cu Copper", "Zn Zinc", "Ga Gallium", "Ge Germanium", "As Arsenic", "Se Selenium", "Br Bromine", "Kr Krypton",
  "Rb Rubidium", "Sr Strontium", "Y Yttrium", "Zr Zirconium", "Nb Niobium", "Mo Molybdenum", "Tc Technetium", "Ru Ruthenium", "Rh Rhodium", "Pd Palladium", "Ag Silver", "Cd Cadmium", "In Indium", "Sn Tin", "Sb Antimony", "Te Tellurium", "I Iodine", "Xe Xenon",
  "Cs Caesium", "Ba Barium", "La Lanthanum", "Ce Cerium", "Pr Praseodymium", "Nd Neodymium", "Pm Promethium", "Sm Samarium", "Eu Europium", "Gd Gadolinium", "Tb Terbium", "Dy Dysprosium", "Ho Holmium", "Er Erbium", "Tm Thulium", "Yb Ytterbium", "Lu Lutetium", "Hf Hafnium", "Ta Tantalum", "W Tungsten", "Re Rhenium", "Os Osmium", "Ir Iridium", "Pt Platinum", "Au Gold", "Hg Mercury", "Tl Thallium", "Pb Lead", "Bi Bismuth", "Po Polonium", "At Astatine", "Rn Radon",
  "Fr Francium", "Ra Radium", "Ac Actinium", "Th Thorium", "Pa Protactinium", "U Uranium", "Np Neptunium", "Pu Plutonium", "Am Americium", "Cm Curium", "Bk Berkelium", "Cf Californium", "Es Einsteinium", "Fm Fermium", "Md Mendelevium", "No Nobelium", "Lr Lawrencium", "Rf Rutherfordium", "Db Dubnium", "Sg Seaborgium", "Bh Bohrium", "Hs Hassium", "Mt Meitnerium", "Ds Darmstadtium", "Rg Roentgenium", "Cn Copernicium", "Nh Nihonium", "Fl Flerovium", "Mc Moscovium", "Lv Livermorium", "Ts Tennessine", "Og Oganesson",
] as const;

export const SUBSHELL_LETTERS = ["s", "p", "d", "f"] as const;
const FILL_ORDER: ReadonlyArray<readonly [number, number]> = [
  [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2],
  [4, 1], [5, 0], [4, 2], [5, 1], [6, 0], [4, 3], [5, 2],
  [6, 1], [7, 0], [5, 3], [6, 2], [7, 1],
];

// Deviations from simple Madelung filling. H–U checked against NIST's neutral
// table; Np–Rf against NIST's individual Elemental Data Index records (2026-09-05).
// Only explicitly changed occupations are listed; zero removes an empty shell.
const REFERENCE_EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { "3d": 5, "4s": 1 }, 29: { "3d": 10, "4s": 1 },
  41: { "4d": 4, "5s": 1 }, 42: { "4d": 5, "5s": 1 },
  44: { "4d": 7, "5s": 1 }, 45: { "4d": 8, "5s": 1 },
  46: { "4d": 10, "5s": 0 }, 47: { "4d": 10, "5s": 1 },
  57: { "4f": 0, "5d": 1 }, 58: { "4f": 1, "5d": 1 },
  64: { "4f": 7, "5d": 1 },
  78: { "5d": 9, "6s": 1 }, 79: { "5d": 10, "6s": 1 },
  89: { "5f": 0, "6d": 1 }, 90: { "5f": 0, "6d": 2 },
  91: { "5f": 2, "6d": 1 }, 92: { "5f": 3, "6d": 1 },
  93: { "5f": 4, "6d": 1 }, 96: { "5f": 7, "6d": 1 },
  // Modern NIST assignment, not the obsolete 6d1 lawrencium configuration.
  103: { "6d": 0, "7p": 1 },
};

function configurationFor(number: number): Subshell[] {
  let remaining = number;
  return FILL_ORDER.map(([n, l]) => {
    const filled = Math.min(remaining, 2 * (2 * l + 1));
    remaining -= filled;
    const electrons = REFERENCE_EXCEPTIONS[number]?.[`${n}${SUBSHELL_LETTERS[l]}`] ?? filled;
    return { n, l, electrons };
  }).filter(({ electrons }) => electrons > 0).sort((a, b) => a.n - b.n || a.l - b.l);
}

/**
 * NIST does not give neutral configurations beyond Rf in its reference table.
 * For 105–118 we expose a clearly labelled *illustrative Aufbau filling*, not
 * an asserted ground state. In particular, it omits relativistic exceptions.
 */
export const elements: ElementRecord[] = ELEMENT_NAMES.map((entry, index) => {
  const number = index + 1;
  const [symbol, name] = entry.split(" ");
  const period = [2, 10, 18, 36, 54, 86, 118].findIndex((end) => number <= end) + 1;
  const detached = (number >= 57 && number <= 71) || (number >= 89 && number <= 103);
  const starts = [0, 1, 3, 11, 19, 37, 55, 87];
  const position = number - starts[period] + 1;
  const group = detached ? null : period === 1 ? (number === 1 ? 1 : 18)
    : period < 4 ? (position <= 2 ? position : position + 10)
      : period >= 6 && position > 17 ? position - 14 : position;
  return {
    number, symbol, name, period, group,
    block: detached ? "f" : number === 2 || group! <= 2 ? "s" : group! >= 13 ? "p" : "d",
    configuration: configurationFor(number),
    configurationStatus: number <= 104 ? "reference" : "aufbau",
  };
});

function validateOrbital(n: number, l: number, m = 0) {
  if (!Number.isInteger(n) || n < 1 || n > 7 || !Number.isInteger(l) || l < 0 || l > 3 || l >= n
    || !Number.isInteger(m) || Math.abs(m) > l) {
    throw new RangeError("Orbital model supports integer 1 ≤ n ≤ 7, 0 ≤ l ≤ 3, l < n and |m| ≤ l.");
  }
}

function factorial(n: number) {
  let result = 1;
  for (let k = 2; k <= n; k += 1) result *= k;
  return result;
}

/** Generalised Laguerre polynomial L_k^alpha(x), standard three-term recurrence. */
function laguerre(k: number, alpha: number, x: number) {
  if (k === 0) return 1;
  let previous = 1;
  let current = 1 + alpha - x;
  for (let j = 2; j <= k; j += 1) {
    const next = ((2 * j - 1 + alpha - x) * current - (j - 1 + alpha) * previous) / j;
    previous = current;
    current = next;
  }
  return current;
}

function radialUnchecked(n: number, l: number, r: number) {
  const rho = 2 * r / n;
  const decay = Math.exp(-rho / 2);
  // Very large finite radii can overflow rho or its polynomial. The decayed
  // tail is already below floating-point range; avoid the indeterminate 0×∞.
  if (decay === 0) return 0;
  const normalisation = Math.sqrt((2 / n) ** 3 * factorial(n - l - 1) / (2 * n * factorial(n + l)));
  return normalisation * decay * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho);
}

/** Normalised radial wavefunction R_nl(r), r in a0, Z=1. */
export function radialWavefunction(n: number, l: number, r: number) {
  validateOrbital(n, l);
  if (!Number.isFinite(r) || r < 0) throw new RangeError("Radius must be finite and non-negative.");
  return radialUnchecked(n, l, r);
}

function harmonicUnchecked(l: number, m: number, cosTheta: number, phi: number) {
  const k = Math.abs(m);
  // Associated Legendre recurrence without the Condon–Shortley phase, so px
  // has positive sign along +x. Overall phase is arbitrary and unobservable.
  let p = 1;
  const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
  for (let j = 1; j <= k; j += 1) p *= (2 * j - 1) * sinTheta;
  if (l > k) {
    let previous = p;
    p = cosTheta * (2 * k + 1) * p;
    for (let degree = k + 2; degree <= l; degree += 1) {
      const next = ((2 * degree - 1) * cosTheta * p - (degree + k - 1) * previous) / (degree - k);
      previous = p;
      p = next;
    }
  }
  const normalisation = Math.sqrt((2 * l + 1) * factorial(l - k) / (4 * Math.PI * factorial(l + k)));
  return normalisation * p * (m === 0 ? 1 : Math.SQRT2 * (m > 0 ? Math.cos(k * phi) : Math.sin(k * phi)));
}

/**
 * Normalised real/tesseral harmonic. Signed m is a *basis index*: positive is
 * cosine, negative sine. Nonzero components combine the ±|m| complex harmonics
 * and are not Lz eigenstates. cosTheta=z/r; phi=atan2(y,x), in radians.
 */
export function realSphericalHarmonic(l: number, m: number, cosTheta: number, phi: number) {
  validateOrbital(l + 1, l, m);
  if (!Number.isFinite(cosTheta) || Math.abs(cosTheta) > 1 || !Number.isFinite(phi)) {
    throw new RangeError("Angular coordinates must be finite with -1 ≤ cos(theta) ≤ 1.");
  }
  return harmonicUnchecked(l, m, cosTheta, phi);
}

export function orbitalNodes(n: number, l: number) {
  validateOrbital(n, l);
  return { radial: n - l - 1, angular: l, total: n - 1 };
}

const REAL_COMPONENTS = [
  ["s"],
  ["p_y", "p_z", "p_x"],
  ["d_xy", "d_yz", "d_z²", "d_xz", "d_x²−y²"],
  ["f_y(3x²−y²)", "f_xyz", "f_y(5z²−r²)", "f_z(5z²−3r²)", "f_x(5z²−r²)", "f_z(x²−y²)", "f_x(x²−3y²)"],
] as const;

export function orbitalLabel(n: number, l: number, m: number) {
  validateOrbital(n, l, m);
  return `${n}${REAL_COMPONENTS[l][m + l]}`;
}

export const ORBITAL_PROBABILITY_EXTENT = 0.995;
const RADIAL_STEPS = 2_048;
type RadialTable = { radii: number[]; cumulative: number[]; total: number; radius: number };
const radialCache = new Map<string, RadialTable>();

function inverseCdf(table: Pick<RadialTable, "radii" | "cumulative">, probability: number) {
  let low = 0;
  let high = table.cumulative.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >>> 1;
    if (table.cumulative[middle] < probability) low = middle;
    else high = middle;
  }
  const span = table.cumulative[high] - table.cumulative[low];
  const fraction = span > 0 ? (probability - table.cumulative[low]) / span : 0;
  return table.radii[low] + fraction * (table.radii[high] - table.radii[low]);
}

function radialTable(n: number, l: number): RadialTable {
  const key = `${n}:${l}`;
  const cached = radialCache.get(key);
  if (cached) return cached;
  // Past the classical turning region, including a generous exponential tail.
  const limit = 4 * n * n + 20 * n;
  const step = limit / RADIAL_STEPS;
  const radii = [0];
  const cumulative = [0];
  let previous = 0;
  let total = 0;
  for (let i = 1; i <= RADIAL_STEPS; i += 1) {
    const r = i * step;
    const probability = (r * radialUnchecked(n, l, r)) ** 2;
    total += (probability + previous) * step / 2;
    radii.push(r);
    cumulative.push(total);
    previous = probability;
  }
  const radius = inverseCdf({ radii, cumulative }, total * ORBITAL_PROBABILITY_EXTENT);
  const table = { radii, cumulative, total, radius };
  radialCache.set(key, table); // At most 22 valid n/l combinations.
  return table;
}

/** P(r)=r²|R(r)|², not local 3-D density. Graph extends to the 99.5% radius. */
export function getRadialDistribution(n: number, l: number, steps = 160): Array<{ r: number; probability: number }> {
  validateOrbital(n, l);
  if (!Number.isInteger(steps) || steps < 8 || steps > 2_048) throw new RangeError("Choose 8–2048 radial intervals.");
  const { radius } = radialTable(n, l);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const r = radius * i / steps;
    return { r, probability: (r * radialUnchecked(n, l, r)) ** 2 };
  });
}

export type OrbitalPoint = { x: number; y: number; z: number; phase: 1 | -1; weight: number };
export type OrbitalSamples = { points: OrbitalPoint[]; radius: number };
const sampleCache = new Map<string, OrbitalSamples>();

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return (state + 0.5) / 4_294_967_296;
  };
}

/**
 * Deterministic equal-weight samples of |R Y_real|² dV inside the 99.5% radial
 * extent. These are probability samples, not electrons, trajectories, or an
 * isosurface. Density in a projection comes from counts, NOT squared weights.
 * Regeneration only happens on orbital changes; rotating reuses these points.
 */
export function getOrbitalSamples(n: number, l: number, m: number, count = 5_200): OrbitalSamples {
  validateOrbital(n, l, m);
  if (!Number.isInteger(count) || count < 100 || count > 12_000) throw new RangeError("Choose 100–12000 orbital samples.");
  const key = `${n}:${l}:${m}:${count}`;
  const cached = sampleCache.get(key);
  if (cached) return cached;
  const table = radialTable(n, l);
  const random = seededRandom(n * 65_537 + l * 1_009 + (m + 3) * 101 + 42);
  const points: OrbitalPoint[] = [];
  // Addition theorem bounds every real orthonormal harmonic by this value.
  const angularBound = (2 * l + 1) / (4 * Math.PI);
  // Rejection is capped even if a future formula regression destroys acceptance.
  for (let attempt = 0; points.length < count && attempt < count * 200; attempt += 1) {
    const cosTheta = 2 * random() - 1;
    const phi = 2 * Math.PI * random();
    const angular = harmonicUnchecked(l, m, cosTheta, phi);
    if (random() * angularBound > angular * angular) continue;
    const r = inverseCdf(table, random() * table.total * ORBITAL_PROBABILITY_EXTENT);
    const transverse = r * Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    points.push({
      x: transverse * Math.cos(phi), y: transverse * Math.sin(phi), z: r * cosTheta,
      phase: radialUnchecked(n, l, r) * angular < 0 ? -1 : 1,
      weight: 1,
    });
  }
  if (points.length !== count) throw new Error("Orbital sampling failed to converge.");
  const result = { points, radius: table.radius };
  // Bounded memory across prolonged exploration and caller-selected counts.
  if (sampleCache.size >= 12) sampleCache.delete(sampleCache.keys().next().value!);
  sampleCache.set(key, result);
  return result;
}
