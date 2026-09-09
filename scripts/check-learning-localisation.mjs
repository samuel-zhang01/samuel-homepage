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
const names = ["BanditStudio", "RlAtlasDemo", "DecisionDemos", "DeferralRiskStudio", "InsuranceMatchingDemo", "InnovationModelsStudio", "VentureReasoningStudio", "CliffLearningLab", "LlmPostTrainingLab"];
const modules = Object.fromEntries(names.map((name) => [name, load(`src/components/projects/${name}.tsx`)]));
const identity = new Set(names.flatMap((stem) => Object.keys(JSON.parse(readFileSync(resolve(root, `src/components/projects/copy/${stem[0].toLowerCase()}${stem.slice(1)}Copy.audit.json`), "utf8")).identities)));
let strings = [];
function inspect(node) {
  if (Array.isArray(node)) { node.forEach(inspect); return; }
  if (typeof node === "string") { strings.push(node.replace(/\s+/g, " ").trim()); return; }
  if (!node?.props) return;
  if (typeof node.type === "function") {
    const previousName = currentComponent, previousIndex = hookIndex;
    currentComponent = node.type.name; hookIndex = 0;
    const rendered = node.type(node.props);
    currentComponent = previousName; hookIndex = previousIndex;
    inspect(rendered); return;
  }
  if (["code", "pre", "math", "kbd"].includes(node.type) || node.props.translate === "no" || node.props["data-copy-source"]) return;
  for (const key of ["aria-label", "aria-description", "title", "alt", "placeholder"]) if (node.props[key]) inspect(node.props[key]);
  inspect(node.props.children);
}
const failures = new Map(); let cases = 0;
function check(component, overrides, context) {
  states = overrides; strings = [];
  inspect(React.createElement(component)); cases++;
  assert.ok(strings.some((s) => /[\u3400-\u9fff]/.test(s)), `${context}: renders Mandarin`);
  const untranslated = strings.filter((value) => /[A-Za-z]{2}/.test(value) && !/[\u3400-\u9fff]/.test(value) && !identity.has(value) && !/^(?:SYN-\d{4}|SYN-[PCT]\d{2}|(?:KS|SW|HD)-\d|[;；]\s*Hit@3)$/.test(value));
  for (const value of new Set(untranslated)) { if (!failures.has(context.split('/')[1])) failures.set(context.split('/')[1], new Set()); failures.get(context.split('/')[1]).add(value); }
}
const decision = modules.DecisionDemos;
const cliff = load('src/lib/cliffLearning.ts');
for (locale of ["zh-CN", "zh-TW"]) {
  for(const view of ['policy','regret','method']) for(const scenario of ['wide','close','gaussian']) for(const rounds of [0,100]) check(modules.BanditStudio.BanditStudio,{BanditStudio:[view,scenario,10,23,rounds,true]},`${locale}/Bandit/${view}/${scenario}/${rounds}`);
  for(let week=1;week<=25;week++) check(modules.RlAtlasDemo.RlAtlasDemo,{RlAtlasDemo:['atlas','','all','all','all',week]},`${locale}/RL/${week}`);
  check(modules.RlAtlasDemo.RlAtlasDemo,{RlAtlasDemo:['atlas','no-matching-topic']},`${locale}/RL/empty`);
  for(const surface of ['data','models','planner']) check(decision.AirQualityBudgetDemo,{AirQualityBudgetDemo:[surface]},`${locale}/Decision/air/${surface}`);
  for(const threshold of [0,20,100]) check(decision.CyberThresholdDemo,{CyberThresholdDemo:[threshold]},`${locale}/Decision/cyber/${threshold}`);
  for(const method of ['ridge','lasso']) check(decision.RegularisationLabDemo,{RegularisationLabDemo:[method]},`${locale}/Decision/regularisation/${method}`);
  for(const surface of ['causal','ope']) for(const variant of [false,true]) check(decision.CausalOpeDemo,{CausalOpeDemo:[surface,'collider',!variant,variant,variant?10:70,variant],OpeEstimatorWorkbench:[variant?'uniform':'challenger',variant?5:58,variant]},`${locale}/Decision/causal/${surface}/${variant}`);
  for(const view of ['decisions','tradeoff','tail','method']) for(const mode of ['combined','confidence','entropy']) check(modules.DeferralRiskStudio.DeferralRiskStudio,{DeferralRiskStudio:[view,mode]},`${locale}/Deferral/${view}/${mode}`);
  for(const scenario of modules.InsuranceMatchingDemo.__scenarios) for(const mode of ['evidence','retired-composite']) for(const selected of ['market-01','market-02','market-03','market-04','market-05','market-06']) check(modules.InsuranceMatchingDemo.InsuranceMatchingDemo,{InsuranceMatchingDemo:[mode,scenario.id,scenario.id,undefined,'panel',3,true,selected]},`${locale}/Insurance/${mode}/${scenario.id}/${selected}`);
  for(const view of ['matrix','portfolio','transition','evidence']) for(const variant of [0,1]) check(modules.InnovationModelsStudio.InnovationModelsStudio,{InnovationModelsStudio:[view],MatrixView:[variant?75:25,variant?75:25,18],PortfolioView:variant?['custom',{opportunist:0,enabler:0,advocate:0,producer:0}]:[],TransitionView:variant?[90,80,20,24]:[20,20,90,2]},`${locale}/Innovation/${view}/${variant}`);
  for(const scenario of modules.VentureReasoningStudio.__scenarios) for(const view of ['claims','market','ask','ledger']) for(const selected of (view==='claims'?['problem','difference','market','traction','delivery','funding']:['traction'])) check(modules.VentureReasoningStudio.VentureReasoningStudio,{VentureReasoningStudio:[view,scenario.id,{...scenario.levels},selected,{...scenario.market},{...scenario.funding}]},`${locale}/Venture/${view}/${scenario.id}`);
  for(const method of ['q-learning','sarsa']) for(const rounds of [0,100]) {const settings={method,alpha:.5,epsilon:.1,seed:7},agent=cliff.trainCliff(cliff.createCliffAgent(settings),settings,rounds,'episodes');check(modules.CliffLearningLab.CliffLearningLab,{CliffLearningLab:[settings,agent,36,'policy']},`${locale}/Cliff/${method}/${rounds}`);}
  for(const policy of [.3,.5,.8]) check(modules.LlmPostTrainingLab.LlmPostTrainingLab,{LlmPostTrainingLab:['dpo','all','add-00-08',policy,.5]},`${locale}/LLM/preference/${policy}`);
  for(const chapter of ['answers','lora','dpo']) for(const outcome of ['all','correct','incorrect','cutoff']) check(modules.LlmPostTrainingLab.LlmPostTrainingLab,{LlmPostTrainingLab:[chapter,outcome]},`${locale}/LLM/${chapter}/${outcome}`);
}
const report=Object.fromEntries([...failures].map(([name,values])=>[name,[...values]]));
assert.equal(failures.size,0,`Unexpected untranslated UI text: ${JSON.stringify(report,null,2)}`);
console.log(`Learning/decision localization: ${cases} rendered view/state/locale cases passed, covering nine source components and their helper trees. Recorded model inputs and outputs remain source-marked.`);
