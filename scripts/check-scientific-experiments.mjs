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

// Exercise the actual clock hook, including browser events and effect cleanup.
// A numerical step is counted separately from its scheduled callback so a
// hidden document cannot advance and a resumed document cannot gain two clocks.
const clockCode = ts.transpileModule(readFileSync(new URL('../src/components/projects/useScientificExperimentClock.ts',import.meta.url),'utf8'), {
  compilerOptions:{ target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS },
}).outputText;
function clockHarness({ reduced = false, hidden = false } = {}) {
  const states = [], effects = [], pending = [], timers = new Map();
  const visibilityListeners = new Set(), motionListeners = new Set();
  let stateIndex=0, effectIndex=0, dirty=false, active=true, playing=false, nextTimer=1, steps=0;
  const document={ hidden,
    addEventListener(name,callback) { assert.equal(name,'visibilitychange'); visibilityListeners.add(callback); },
    removeEventListener(name,callback) { assert.equal(name,'visibilitychange'); visibilityListeners.delete(callback); },
  };
  const preference={ matches:reduced,
    addEventListener(name,callback) { assert.equal(name,'change'); motionListeners.add(callback); },
    removeEventListener(name,callback) { assert.equal(name,'change'); motionListeners.delete(callback); },
  };
  const react={
    useState(initial) {
      const index=stateIndex++;
      if (!(index in states)) states[index]=typeof initial==='function' ? initial() : initial;
      return [states[index],next=>{
        const value=typeof next==='function' ? next(states[index]) : next;
        if (!Object.is(states[index],value)) { states[index]=value; dirty=true; }
      }];
    },
    useEffect(callback,dependencies) {
      const index=effectIndex++, previous=effects[index];
      if (!previous || dependencies.some((value,i)=>!Object.is(value,previous.dependencies[i]))) {
        pending.push(()=>{ previous?.cleanup?.(); effects[index]={ dependencies,cleanup:callback() }; });
      }
    },
  };
  const evaluated={ exports:{} };
  runInNewContext(clockCode,{ module:evaluated,exports:evaluated.exports,document,
    require(name) {
      if (name==='react') return react;
      if (name==='./ProjectDemoActivityContext') return { useProjectDemoActive:()=>active };
      throw new Error(`Unexpected clock dependency: ${name}`);
    },
    window:{
      matchMedia(query) { assert.equal(query,'(prefers-reduced-motion: reduce)'); return preference; },
      setTimeout(callback,milliseconds) { assert.equal(milliseconds,250); const id=nextTimer++; timers.set(id,callback); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
  });
  function render(nextPlaying=playing) {
    playing=nextPlaying;
    for (let attempt=0;attempt<5;attempt++) {
      stateIndex=0; effectIndex=0; dirty=false;
      const allowed=evaluated.exports.useScientificExperimentClock(playing,()=>{ steps++; });
      while (pending.length) pending.shift()();
      if (!dirty) return allowed;
    }
    throw new Error('Scientific clock did not settle');
  }
  return {
    render,
    tick() { for (const [id,callback] of [...timers]) { timers.delete(id); callback(); } render(); },
    hide(value) { document.hidden=value; for (const callback of visibilityListeners) callback(); render(); },
    reduce(value) { preference.matches=value; for (const callback of motionListeners) callback(); render(); },
    focus(value) { active=value; render(); },
    dispose() { effects.forEach(effect=>effect?.cleanup?.()); },
    get timerCount() { return timers.size; },
    get listenerCount() { return visibilityListeners.size+motionListeners.size; },
    get steps() { return steps; },
  };
}
const clock=clockHarness();
assert.equal(clock.render(),true);
assert.equal(clock.timerCount,0,'No automatic playback on first render');
clock.render(true); assert.equal(clock.timerCount,1);
clock.tick(); assert.equal(clock.steps,1); assert.equal(clock.timerCount,1);
for (let cycle=0;cycle<3;cycle++) {
  clock.hide(true); assert.equal(clock.timerCount,0,'Backgrounding cancels the pending step');
  clock.tick(); assert.equal(clock.steps,1,'A hidden experiment cannot advance');
  clock.hide(false); assert.equal(clock.timerCount,1,'Returning resumes exactly one pending step');
}
clock.focus(false); assert.equal(clock.timerCount,0);
clock.tick(); assert.equal(clock.steps,1);
clock.focus(true); assert.equal(clock.timerCount,1);
clock.reduce(true); assert.equal(clock.timerCount,0);
clock.tick(); assert.equal(clock.steps,1);
clock.reduce(false); assert.equal(clock.timerCount,1);
clock.render(false); assert.equal(clock.timerCount,0);
clock.hide(true); clock.hide(false); assert.equal(clock.timerCount,0,'Visibility cannot override a manual pause');
clock.render(true); clock.dispose();
assert.equal(clock.timerCount,0,'Unmount cancels playback');
assert.equal(clock.listenerCount,0,'Unmount removes visibility and preference listeners');
const initiallyReduced=clockHarness({ reduced:true });
assert.equal(initiallyReduced.render(true),false); assert.equal(initiallyReduced.timerCount,0); initiallyReduced.dispose();
const initiallyHidden=clockHarness({ hidden:true });
initiallyHidden.render(true); assert.equal(initiallyHidden.timerCount,0); initiallyHidden.hide(false); assert.equal(initiallyHidden.timerCount,1); initiallyHidden.dispose();
console.log('Scientific experiments: independent rollout formula, authentic model-size/quality units, fixed-radius coverage, and actual clock visibility, reduced-motion, pause/resume and cleanup checks passed.');
