import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const sourcePath = new URL("../src/lib/orbitals.ts", import.meta.url);
const compiled = ts.transpileModule(await readFile(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: sourcePath.pathname,
}).outputText;
const {
  elements, getOrbitalSamples, getRadialDistribution, orbitalLabel, orbitalNodes,
  radialWavefunction, realSphericalHarmonic, ORBITAL_PROBABILITY_EXTENT,
} = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

let checks = 0;
function check(name, run) {
  try {
    run();
    checks += 1;
  } catch (error) {
    throw new Error(`Orbital regression: ${name}`, { cause: error });
  }
}
function near(actual, expected, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected} by ${Math.abs(actual - expected)}`);
}
function integrate(fn, end, steps = 8_000) {
  const dx = end / steps;
  let sum = fn(0) + fn(end);
  for (let i = 1; i < steps; i += 1) sum += fn(i * dx) * (i % 2 ? 4 : 2);
  return sum * dx / 3;
}

check("all118 unique element identifiers are ordered", () => {
  assert.equal(elements.length, 118);
  assert.equal(new Set(elements.map((e) => e.symbol)).size, 118);
  assert.equal(new Set(elements.map((e) => e.name)).size, 118);
  elements.forEach((element, i) => assert.equal(element.number, i + 1));
});
for (const element of elements) {
  check(`${element.symbol} has a neutral, valid occupation and table location`, () => {
    assert.equal(element.configuration.reduce((sum, shell) => sum + shell.electrons, 0), element.number);
    const keys = element.configuration.map(({ n, l }) => `${n}:${l}`);
    assert.equal(new Set(keys).size, keys.length);
    for (const { n, l, electrons } of element.configuration) {
      assert.ok(Number.isInteger(n) && n >= 1 && n <= 7 && l >= 0 && l <= 3 && l < n);
      assert.ok(Number.isInteger(electrons) && electrons > 0 && electrons <= 2 * (2 * l + 1));
    }
    assert.ok(element.period >= 1 && element.period <= 7);
    assert.ok(element.group === null || (element.group >= 1 && element.group <= 18));
    assert.equal(element.configurationStatus, element.number <= 104 ? "reference" : "aufbau");
  });
}
const occupation = (symbol, shell) => {
  const [n, letter] = shell;
  return elements.find((e) => e.symbol === symbol).configuration.find((s) => s.n === Number(n) && s.l === "spdf".indexOf(letter))?.electrons ?? 0;
};
for (const [symbol, expected] of [
  ["Cr", { "3d": 5, "4s": 1 }], ["Cu", { "3d": 10, "4s": 1 }],
  ["Nb", { "4d": 4, "5s": 1 }], ["Mo", { "4d": 5, "5s": 1 }],
  ["Ru", { "4d": 7, "5s": 1 }], ["Rh", { "4d": 8, "5s": 1 }],
  ["Pd", { "4d": 10, "5s": 0 }], ["Ag", { "4d": 10, "5s": 1 }],
  ["La", { "4f": 0, "5d": 1, "6s": 2 }], ["Ce", { "4f": 1, "5d": 1, "6s": 2 }],
  ["Gd", { "4f": 7, "5d": 1, "6s": 2 }], ["Lu", { "4f": 14, "5d": 1, "6s": 2 }],
  ["Pt", { "5d": 9, "6s": 1 }], ["Au", { "5d": 10, "6s": 1 }],
  ["Ac", { "5f": 0, "6d": 1, "7s": 2 }], ["Th", { "5f": 0, "6d": 2, "7s": 2 }],
  ["Pa", { "5f": 2, "6d": 1, "7s": 2 }], ["U", { "5f": 3, "6d": 1, "7s": 2 }],
  ["Np", { "5f": 4, "6d": 1, "7s": 2 }], ["Cm", { "5f": 7, "6d": 1, "7s": 2 }],
  ["Lr", { "5f": 14, "6d": 0, "7s": 2, "7p": 1 }], ["Rf", { "5f": 14, "6d": 2, "7s": 2 }],
]) {
  check(`${symbol} retains its reference configuration, not naive filling`, () => {
    Object.entries(expected).forEach(([shell, electrons]) => assert.equal(occupation(symbol, shell), electrons));
  });
}
check("periodic layout has no duplicated main-table or detached cells", () => {
  const main = elements.filter((e) => e.group !== null).map((e) => `${e.period}:${e.group}`);
  assert.equal(new Set(main).size, main.length);
  assert.deepEqual(elements.filter((e) => e.group === null).map((e) => e.number), [
    ...Array.from({ length: 15 }, (_, i) => i + 57), ...Array.from({ length: 15 }, (_, i) => i + 89),
  ]);
  for (const symbol of ["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"]) {
    assert.equal(elements.find((e) => e.symbol === symbol).group, 18);
  }
});

check("known radial functions and node locations match closed forms", () => {
  for (const r of [0, 0.5, 1, 2, 5]) {
    near(radialWavefunction(1, 0, r), 2 * Math.exp(-r));
    near(radialWavefunction(2, 0, r), (2 - r) * Math.exp(-r / 2) / (2 * Math.sqrt(2)));
    near(radialWavefunction(2, 1, r), r * Math.exp(-r / 2) / (2 * Math.sqrt(6)));
  }
  near(radialWavefunction(2, 0, 2), 0);
  near(radialWavefunction(3, 1, 6), 0);
  near(radialWavefunction(3, 0, (9 - 3 * Math.sqrt(3)) / 2), 0);
  near(radialWavefunction(3, 0, (9 + 3 * Math.sqrt(3)) / 2), 0);
});

for (let n = 1; n <= 7; n += 1) {
  for (let l = 0; l < Math.min(n, 4); l += 1) {
    const end = 6 * n * n + 30 * n;
    check(`${n}${"spdf"[l]} radial probability is normalised and has correct nodes`, () => {
      near(integrate((r) => (r * radialWavefunction(n, l, r)) ** 2, end), 1, 1e-7);
      let crossings = 0;
      let previousSign = Math.sign(radialWavefunction(n, l, 0.001));
      for (let i = 1; i <= 12_000; i += 1) {
        const sign = Math.sign(radialWavefunction(n, l, end * i / 12_000));
        if (sign && sign !== previousSign) crossings += 1;
        if (sign) previousSign = sign;
      }
      assert.equal(crossings, n - l - 1);
      assert.deepEqual(orbitalNodes(n, l), { radial: n - l - 1, angular: l, total: n - 1 });
    });
    for (let other = n + 1; other <= 7; other += 1) {
      check(`${n}${"spdf"[l]} and ${other}${"spdf"[l]} radial functions are orthogonal`, () => {
        near(integrate((r) => r * r * radialWavefunction(n, l, r) * radialWavefunction(other, l, r), 6 * other * other + 30 * other, 16_000), 0, 1e-7);
      });
    }
    check(`${n}${"spdf"[l]} distribution and sampling extent retain99.5% probability`, () => {
      const curve = getRadialDistribution(n, l, 160);
      assert.equal(curve.length, 161);
      assert.equal(curve[0].r, 0);
      assert.equal(curve[0].probability, 0);
      assert.ok(curve.every((p) => Number.isFinite(p.r) && Number.isFinite(p.probability) && p.probability >= 0));
      near(integrate((r) => (r * radialWavefunction(n, l, r)) ** 2, curve.at(-1).r), ORBITAL_PROBABILITY_EXTENT, 4e-6);
    });
    for (let m = -l; m <= l; m += 1) {
      check(`${n},${l},${m} generates finite, bounded, correctly phased deterministic points`, () => {
        const samples = getOrbitalSamples(n, l, m, 400);
        assert.strictEqual(getOrbitalSamples(n, l, m, 400), samples);
        assert.equal(samples.points.length, 400);
        for (const point of samples.points) {
          const r = Math.hypot(point.x, point.y, point.z);
          assert.ok(Number.isFinite(r) && r > 0 && r <= samples.radius + 1e-9);
          assert.equal(point.weight, 1);
          const wave = radialWavefunction(n, l, r) * realSphericalHarmonic(l, m, point.z / r, Math.atan2(point.y, point.x));
          assert.equal(point.phase, wave < 0 ? -1 : 1);
        }
        assert.ok(orbitalLabel(n, l, m).startsWith(String(n)));
      });
    }
  }
}

// Product quadrature: Gauss–Legendre in cos(theta), uniform periodic phi.
// Its implementation is independent of the associated-Legendre model code.
function gaussLegendre(order) {
  return Array.from({ length: order }, (_, i) => {
    let root = Math.cos(Math.PI * (i + 0.75) / (order + 0.5));
    let derivative;
    for (let iteration = 0; iteration < 20; iteration += 1) {
      let p0 = 1;
      let p1 = root;
      for (let degree = 2; degree <= order; degree += 1) {
        const next = ((2 * degree - 1) * root * p1 - (degree - 1) * p0) / degree;
        p0 = p1;
        p1 = next;
      }
      derivative = order * (root * p1 - p0) / (root * root - 1);
      const delta = p1 / derivative;
      root -= delta;
      if (Math.abs(delta) < 1e-14) break;
    }
    return { root, weight: 2 / ((1 - root * root) * derivative * derivative) };
  });
}
const sphere = gaussLegendre(12).flatMap(({ root, weight }) => Array.from({ length: 32 }, (_, j) => ({
  z: root, phi: j * 2 * Math.PI / 32, weight: weight * 2 * Math.PI / 32,
})));
const basis = Array.from({ length: 4 }, (_, l) => Array.from({ length: 2 * l + 1 }, (_, i) => [l, i - l])).flat();
for (let a = 0; a < basis.length; a += 1) {
  for (let b = a; b < basis.length; b += 1) {
    check(`real angular basis ${basis[a]} / ${basis[b]} is orthonormal`, () => {
      const value = sphere.reduce((sum, p) => sum + p.weight
        * realSphericalHarmonic(...basis[a], p.z, p.phi) * realSphericalHarmonic(...basis[b], p.z, p.phi), 0);
      near(value, a === b ? 1 : 0, 1e-10);
    });
  }
}
check("real p/d/f components have their named angular nodes and parity", () => {
  near(realSphericalHarmonic(1, 0, 0, 0), 0); // pz: z=0
  near(realSphericalHarmonic(1, 1, 0, Math.PI / 2), 0); // px: x=0
  near(realSphericalHarmonic(2, -2, 0, 0), 0); // dxy: y=0
  near(realSphericalHarmonic(2, 0, 1 / Math.sqrt(3), 0), 0); // dz² cone
  near(realSphericalHarmonic(2, 2, 0, Math.PI / 4), 0); // dx²-y² planes
  near(realSphericalHarmonic(3, 0, Math.sqrt(3 / 5), 0), 0); // fz³ cone
  near(realSphericalHarmonic(3, -2, 0, Math.PI / 4), 0); // fxyz: z=0
  for (const [l, m] of basis) {
    near(realSphericalHarmonic(l, m, -0.3, 0.7 + Math.PI), (-1) ** l * realSphericalHarmonic(l, m, 0.3, 0.7));
  }
});
check("density samples follow known angular and radial moments", () => {
  const sample = getOrbitalSamples(2, 1, 0, 12_000);
  const meanCosSquared = sample.points.reduce((sum, p) => sum + p.z ** 2 / (p.x ** 2 + p.y ** 2 + p.z ** 2), 0) / sample.points.length;
  near(meanCosSquared, 3 / 5, 0.015);
  const s = getOrbitalSamples(1, 0, 0, 12_000);
  const meanRadius = s.points.reduce((sum, p) => sum + Math.hypot(p.x, p.y, p.z), 0) / s.points.length;
  // Full1s mean is1.5a0; finite99.5% tails make this slightly smaller.
  near(meanRadius, 1.5, 0.06);
  assert.ok(s.points.every((point) => point.phase === 1));
});
check("invalid quantum numbers and unbounded workloads are rejected", () => {
  for (const args of [[0, 0, 0], [8, 0, 0], [2, 2, 0], [5, 4, 0], [2, 1, 2], [2.5, 1, 0], [2, 1, NaN]]) {
    assert.throws(() => getOrbitalSamples(...args), RangeError);
  }
  for (const count of [0, 99, 12_001, NaN, Infinity, 500.5]) assert.throws(() => getOrbitalSamples(1, 0, 0, count), RangeError);
  assert.throws(() => radialWavefunction(1, 0, -1), RangeError);
  assert.throws(() => radialWavefunction(1, 0, Infinity), RangeError);
  assert.equal(radialWavefunction(7, 3, Number.MAX_VALUE), 0);
  assert.throws(() => realSphericalHarmonic(1, 0, 1.01, 0), RangeError);
  assert.throws(() => getRadialDistribution(1, 0, 1_000_000), RangeError);
});
const modelUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const surfaceSource = ts.transpileModule(await readFile(new URL("../src/lib/orbitalSurface.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace('"./orbitals"', JSON.stringify(modelUrl));
const { buildOrbitalSurface, SURFACE_GRID, SURFACE_DENSITY_FRACTION } = await import(`data:text/javascript;base64,${Buffer.from(surfaceSource).toString("base64")}`);
check("surface work and level are explicitly bounded", () => {
  assert.equal(SURFACE_GRID, 80);
  assert.equal(SURFACE_DENSITY_FRACTION, .01);
  assert.throws(() => buildOrbitalSurface(8, 0, 0), RangeError);
  assert.throws(() => buildOrbitalSurface(2, 1, 2), RangeError);
});
for (const [n, l, m] of [[1, 0, 0], [2, 1, 0], [3, 2, 0], [4, 3, 0], [2, 0, 0], [3, 1, -1], [7, 0, 0], [7, 3, 3]]) {
  const surface = buildOrbitalSurface(n, l, m);
  const vertices = surface.vertices;
  check(`${n}/${l}/${m} has finite, nonempty, bounded triangle geometry`, () => {
    assert.ok(vertices.length > 21 && vertices.length < 500_000 * 21);
    assert.equal(vertices.length % 21, 0);
    assert.ok(vertices.every(Number.isFinite));
    assert.ok(surface.level > 0 && Number.isFinite(surface.level));
    for (let i = 0; i < vertices.length; i += 7) {
      for (let axis = 0; axis < 3; axis++) assert.ok(Math.abs(vertices[i + axis]) <= 1.00001);
      near(Math.hypot(vertices[i + 3], vertices[i + 4], vertices[i + 5]), 1, .0001);
      assert.ok(vertices[i + 6] === 1 || vertices[i + 6] === -1);
    }
  });
  check(`${n}/${l}/${m} surface vertices use the analytic wavefunction phase`, () => {
    // Sample a bounded subset, independently re-evaluating the model in a0.
    const stride = Math.max(1, Math.floor(vertices.length / 7 / 200)) * 7;
    for (let i = 0; i < vertices.length; i += stride) {
      const [x, y, z] = vertices.slice(i, i + 3).map((value) => value * surface.radius);
      const r = Math.hypot(x, y, z);
      const psi = radialWavefunction(n, l, r) * realSphericalHarmonic(l, m, r ? z / r : 1, Math.atan2(y, x));
      assert.equal(Math.sign(psi), vertices[i + 6]);
    }
  });
  if (n === 1) check("1s surface radius and normals match its known spherical level", () => {
    const expectedRadius = -Math.log(SURFACE_DENSITY_FRACTION) / 2;
    for (let i = 0; i < vertices.length; i += 7) {
      const r = Math.hypot(vertices[i], vertices[i + 1], vertices[i + 2]);
      near(r * surface.radius, expectedRadius, .02);
      assert.ok((vertices[i] * vertices[i + 3] + vertices[i + 1] * vertices[i + 4] + vertices[i + 2] * vertices[i + 5]) / r > .99);
    }
  });
}
const animationSource = ts.transpileModule(await readFile(new URL("../src/lib/orbitalAnimation.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { advanceOrbitalRotation, runOrbitalAnimation } = await import(`data:text/javascript;base64,${Buffer.from(animationSource).toString("base64")}`);
for (const hz of [60, 120, 144]) check(`rotation speed is time-based at ${hz} Hz`, () => {
  let camera = { yaw: 0, pitch: -.25 };
  for (let frame = 0; frame < hz * 6; frame++) camera = advanceOrbitalRotation(camera, 1000 / hz);
  near(camera.yaw, 2.625, 1e-10);
  assert.equal(camera.pitch, -.25);
});
check("rotation clamps suspension gaps and rejects invalid elapsed time", () => {
  const camera = Object.freeze({ yaw: 0, pitch: .5 });
  near(advanceOrbitalRotation(camera, 5000).yaw, .04375);
  for (const elapsed of [-10, NaN, Infinity]) assert.deepEqual(advanceOrbitalRotation(camera, elapsed), camera);
  assert.equal(camera.yaw, 0);
});
check("animation schedules once per repaint and cancels even request ID zero", () => {
  const queue = new Map(); let id = 0; const elapsed = [];
  const request = (fn) => { queue.set(id, fn); return id++; };
  const cancel = (id) => queue.delete(id);
  const cancelFirst = runOrbitalAnimation((delta) => elapsed.push(delta), request, cancel);
  cancelFirst(); assert.equal(queue.size, 0);
  const stop = runOrbitalAnimation((delta) => elapsed.push(delta), request, cancel);
  for (const time of [100, 108, 116]) { const [key, fn] = queue.entries().next().value; queue.delete(key); fn(time); assert.equal(queue.size, 1); }
  assert.deepEqual(elapsed, [0, 8, 8]);
  const late = queue.values().next().value;
  stop(); assert.equal(queue.size, 0);
  late(124); assert.deepEqual(elapsed, [0, 8, 8]);
});
console.log(`Orbital gate: ${checks} element, quantum-function, surface, animation, probability and workload regressions passed.`);
