import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
function load(relative) {
  const evaluated = { exports:{} };
  const code = ts.transpileModule(readFileSync(new URL(relative,import.meta.url),'utf8'), { compilerOptions:{ target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS } }).outputText;
  runInNewContext(code,{ module:evaluated,exports:evaluated.exports });
  return evaluated.exports;
}
const { rolloutErrors,visionTradeoff } = load('../src/lib/scientificExperiments.ts');
const { shiftedCoverage } = load('../src/lib/learningMechanics.ts');
const near = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-10, `${actual} should equal ${expected}`);
// A constant fresh error has an independent geometric-series solution.
for (const gain of [.98,1,1.02]) {
  const values = rolloutErrors(gain,20,true);
  const closedForm = gain===1 ? .2 : .01*(gain**20-1)/(gain-1);
  near(values[20],closedForm);
  assert.equal(values.length,21);
}
assert.ok(rolloutErrors(1.02,20,true)[20]>rolloutErrors(.98,20,true)[20]);
assert.deepEqual(Array.from(rolloutErrors(1.1,4,false)),[0,.01,.01,.01,.01]);
assert.deepEqual(Array.from(rolloutErrors(1.02,0,true)),[0]);
// Reported MobileNet/ResNet34 comparison, preserving the saved benchmark units.
const mobile={ parameters:'1.6M',poseAccuracy:'97.50%',depthRmse:'0.0325' };
const resnet={ parameters:'21.3M',poseAccuracy:'98.50%',depthRmse:'0.0256' };
const comparison=visionTradeoff(mobile,resnet);
near(comparison.parameterPercent,100*1.6/21.3);
near(comparison.poseDifference,-1);
near(comparison.depthDifference,.0069);
const depth=visionTradeoff({ ...mobile,parameters:"1.5M" },{ ...resnet,parameters:"21.4M" });
near(depth.parameterPercent,100*1.5/21.4);
near(depth.depthDifference,.0069);
const self=visionTradeoff(mobile,mobile);
assert.equal(self.parameterPercent,100);
assert.equal(self.poseDifference,0);
assert.equal(self.depthDifference,0);
// Calibrate once: shift changes the generated batch without widening its interval.
const baseline=shiftedCoverage(.9,0), shifted=shiftedCoverage(.9,1), outside=shiftedCoverage(.9,2);
assert.equal(baseline.covered,36);
assert.equal(shifted.covered,18);
assert.equal(outside.covered,0);
assert.equal(baseline.radius,shifted.radius);
assert.equal(shifted.radius,outside.radius);
assert.ok(shiftedCoverage(.95,0).radius>baseline.radius);
assert.equal(shifted.rows.length,40);
console.log('Scientific experiments: independent rollout formula, authentic model-size/quality units, fixed-radius shift coverage and reset boundaries passed.');
