/** Render actual MRI/helper return trees with deterministic hooks; browser layout is checked separately. */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const React = require("react");
const cache = new Map();
let locale = "zh-CN", states = {}, currentComponent = "", hookIndex = 0;
function load(file) {
  const absolute = resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute);
  const evaluated = { exports: {} };
  cache.set(absolute, evaluated.exports);
  let source = readFileSync(absolute, "utf8");
  if (/VentureReasoningStudio|InsuranceMatchingDemo/.test(absolute)) source += "\nexport { SCENARIOS as __scenarios };";
  if (/CvKeywordStudio/.test(absolute)) source += "\nexport { analyse, SAMPLE_CV, SAMPLE_JOB, containsVariant };";
  if (/CourseRecommenderStudio/.test(absolute)) source += "\nexport { rankCourses, rankAllAdapted, sourceReplayPool, DEFAULT_PREFERENCES, DEFAULT_WEIGHTS, COURSES };";
  if (/BanditStudio\.tsx$/.test(absolute)) source += "\nexport { simulateBandit, scenarios };";
  const output = ts.transpileModule(source, { fileName: absolute, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  runInNewContext(output, { module: evaluated, exports: evaluated.exports, require(name) {
    if (name === "react") return { ...React, useContext: () => locale,
      useState: (initial) => [states[currentComponent]?.[hookIndex++] ?? (typeof initial === "function" ? initial() : initial), () => {}],
      useRef: (initial) => ({ current: initial }), useEffect: () => {}, useCallback: (callback) => callback,
      useId: () => `${currentComponent}-test`, useMemo: (calculate) => calculate() };
    if (name.endsWith(".csv")) return { __esModule: true, default: readFileSync(resolve(dirname(absolute), name), "utf8") };
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name === "../ClassicSelect") return { __esModule: true, default: (props) => React.createElement("select", props) };
    if (name === "./MathEquation") return { MathEquation: (props) => React.createElement("span", { "aria-label": props.label }) }; // Its label/TeX contract has separate tests.
    if (name.startsWith(".") || name.startsWith("@/")) {
      const path = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(absolute), name);
      return load(path + (existsSync(`${path}.tsx`) ? ".tsx" : ".ts"));
    }
    return require(name);
  } }, { filename: absolute });
  return evaluated.exports;
}
const bandit=load('src/components/projects/BanditStudio.tsx');
const cv=load('src/components/projects/CvKeywordStudio.tsx');
const course=load('src/components/projects/CourseRecommenderStudio.tsx');
const mechanics=load('src/lib/learningMechanics.ts');
const cliff=load('src/lib/cliffLearning.ts');
const near=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<tolerance, `${actual} differs from ${expected}`);
for(const scenario of Object.values(bandit.scenarios)) for(const policy of scenario.kind==='bernoulli'?['epsilon','ucb1','thompson']:['epsilon','ucb1']) {
 const run=bandit.simulateBandit(scenario,.1,23,100,policy);
 assert.deepEqual(run,bandit.simulateBandit(scenario,.1,23,100,policy),'Seeded choices reproduce exactly');
 assert.equal(run.stats.reduce((total,stat)=>total+stat.pulls,0),100);
 for(const stat of run.stats)near(stat.estimate,stat.reward/stat.pulls);
 for(const event of run.events.slice(scenario.arms.length)) {
  assert.ok(event.scores.every(Number.isFinite));
  if(policy!=='epsilon')assert.equal(event.armIndex,event.scores.indexOf(Math.max(...event.scores)));
  if(policy==='thompson')assert.ok(event.scores.every(score=>score>0&&score<1));
 }
 if(policy==='ucb1') {
  const before=bandit.simulateBandit(scenario,.1,23,99,policy),last=run.events.at(-1);
  for(let index=0;index<scenario.arms.length;index++)near(last.scores[index],before.stats[index].estimate+Math.sqrt(2*(scenario.kind==='gaussian'?scenario.sigma**2:1)*Math.log(100)/before.stats[index].pulls));
 }
 near(run.trace.at(-1).expectedRegret,run.stats.reduce((sum,stat,index)=>sum+stat.pulls*(Math.max(...scenario.arms.map(arm=>arm.mean))-scenario.arms[index].mean),0));
}
for(const policy of [.05,.5,.95])for(const reference of [.1,.5,.9])for(const beta of [.1,.5,3]) {
 const theta=Math.log(policy/(1-policy)),h=1e-5,prob=x=>1/(1+Math.exp(-x));
 near(mechanics.dpoPreference(policy,reference,beta).gradient,(mechanics.dpoPreference(prob(theta+h),reference,beta).loss-mechanics.dpoPreference(prob(theta-h),reference,beta).loss)/(2*h),1e-8);
 const next=mechanics.stepDpoPolicy(policy,reference,beta);
 assert.ok(next>policy&&next<1);
 assert.ok(mechanics.dpoPreference(next,reference,beta).loss<mechanics.dpoPreference(policy,reference,beta).loss);
}
for(const invalid of [0,1,NaN])assert.throws(()=>mechanics.stepDpoPolicy(invalid,.5,.5),{name:"RangeError"});
const settings={method:'q-learning',alpha:.5,epsilon:.1,seed:7};
let manual=cliff.createCliffAgent(settings);for(let step=0;step<100;step++)manual=cliff.trainCliff(manual,settings,1,'steps');
assert.deepEqual(manual,cliff.trainCliff(cliff.createCliffAgent(settings),settings,100,'steps'),'Animated one-step training equals batch training');
const original=cv.analyse(cv.SAMPLE_CV,cv.SAMPLE_JOB,'all');
const edited=cv.SAMPLE_CV.replace('Python and SQL','reliable analytical');
const changed=cv.analyse(edited,cv.SAMPLE_JOB,'all');
assert.ok(original.matched.some(signal=>signal.id==='python'));assert.ok(!changed.matched.some(signal=>signal.id==='python'));
assert.equal(original.matched.length-changed.matched.length,2);assert.ok(changed.weightedCoverage<original.weightedCoverage);
assert.equal(cv.containsVariant('Pythonic syntax','Python'),false,'A longer word is not a keyword match');
const snapshot=structuredClone(course.DEFAULT_PREFERENCES);
const ranking=course.rankAllAdapted(snapshot,course.DEFAULT_WEIGHTS);
assert.equal(ranking[0].course.id,2);
const moved=course.rankAllAdapted({...snapshot,categories:['Programming']},course.DEFAULT_WEIGHTS);
assert.notEqual(moved[0].course.id,2);
assert.deepEqual(snapshot,structuredClone(course.DEFAULT_PREFERENCES),'Comparisons preserve the saved preferences');
assert.deepEqual(ranking,course.rankAllAdapted(snapshot,course.DEFAULT_WEIGHTS),'Restoring a snapshot reproduces its rank');
const identities=new Set(['Tech','Consult','Product','Science','Law','FinTech','AI','Ops','AI/ML','Web Dev','SQL','CI/CD','API','Python','Docker','scikit-learn']);
for(const path of ['cvKeywordCopy','courseCopy'])for(const name of Object.keys(JSON.parse(readFileSync(resolve(root,`scripts/fixtures/project-copy-audits/${path}.audit.json`),'utf8')).identities))identities.add(name);
let strings=[];function inspect(node){if(Array.isArray(node)){node.forEach(inspect);return;}if(typeof node==='string'){strings.push(node.trim());return;}if(!node?.props)return;if(typeof node.type==='function'){const previous=currentComponent,previousIndex=hookIndex;currentComponent=node.type.name;hookIndex=0;inspect(node.type(node.props));currentComponent=previous;hookIndex=previousIndex;return;}if(['pre','code','math','kbd'].includes(node.type)||node.props.translate==='no'||node.props['data-copy-source'])return;for(const key of ['aria-label','title','placeholder'])if(node.props[key])inspect(node.props[key]);inspect(node.props.children);}
let cases=0;
function check(component,overrides,label){states=overrides;strings=[];inspect(React.createElement(component));cases++;const untranslated=strings.filter(value=>/[A-Za-z]{2}/.test(value)&&!/[\u3400-\u9fff]/.test(value)&&!identities.has(value)&&!value.split(/\s*[·/]\s*/).every(part=>identities.has(part)));assert.deepEqual([...new Set(untranslated)],[],label);}
for(locale of ['zh-CN','zh-TW']) {
 const input=Array(14).fill(undefined);input[0]=edited;input[5]='inputs';check(cv.CvKeywordStudio,{CvKeywordStudio:input},`${locale}/CV/live edit`);
 const comparison=Array(14).fill(undefined);comparison[0]=edited;comparison[4]={cv:edited,job:cv.SAMPLE_JOB,role:'Example role',company:'Example company'};comparison[13]=original;check(cv.CvKeywordStudio,{CvKeywordStudio:comparison},`${locale}/CV/version comparison`);
 for(const mode of ['adapted','source'])check(course.CourseRecommenderStudio,{CourseRecommenderStudio:['recommend',mode,{...snapshot,categories:['Programming']},course.DEFAULT_WEIGHTS,4,2,{mode:'adapted',preferences:snapshot,weights:course.DEFAULT_WEIGHTS,seed:4,ranking}]},`${locale}/Course/rank movement/${mode}`);
}
console.log(`Interactive learning: seeded policy scores/regret, DPO numerical gradients and decreasing loss, manual-vs-batch learning, CV changed-text matching, snapshot rank restoration and ${cases} new Mandarin states passed.`);
