/** Exercise physical-science return trees across real control states and both Mandarin editions. */
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
  const output = ts.transpileModule(readFileSync(absolute, "utf8"), { fileName: absolute, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  runInNewContext(output, { module: evaluated, exports: evaluated.exports, require(name) {
    if (name === "react") return { ...React, useContext: () => locale,
      useState: (initial) => [states[currentComponent]?.[hookIndex++] ?? (typeof initial === "function" ? initial() : initial), () => {}],
      useRef: (initial) => ({ current: initial }), useEffect: () => {}, useCallback: (callback) => callback,
      useId: () => `${currentComponent}-test`, useMemo: (calculate) => calculate() };
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name === "../ClassicSelect") return { __esModule: true, default: (props) => React.createElement("select", props) };
    if (name === "./MathEquation") return { MathEquation: () => null }; // Its label/TeX contract has separate tests.
    if (name.startsWith(".") || name.startsWith("@/")) {
      const path = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(absolute), name);
      return load(path + (existsSync(`${path}.tsx`) ? ".tsx" : ".ts"));
    }
    return require(name);
  } }, { filename: absolute });
  return evaluated.exports;
}
const identity = new Set(["spectrum", "png", "jpg", "tif", "pdf", "eps", "mol m⁻³", "g mol⁻¹", "kJ mol⁻¹"]);
for (const name of ['spectroscopy', 'thermodynamics', 'solubility', 'chemistry', 'molecular']) {
 const manifest = JSON.parse(readFileSync(resolve(root, 'src/components/projects/copy/' + name + 'Copy.audit.json'), 'utf8'));
 for(const key of Object.keys(manifest.identities)) identity.add(key);
}
let strings = [];
function inspect(node) {
  if (Array.isArray(node)) { node.forEach(inspect); return; }
  if (typeof node === "string") { strings.push(node.replace(/\s+/g, " ").trim()); return; }
  if (!node?.props) return;
  if (typeof node.type === "function") {
    const previousName = currentComponent, previousIndex = hookIndex;
    currentComponent = node.type.name;
    hookIndex = 0;
    const rendered = node.type(node.props);
    currentComponent = previousName;
    hookIndex = previousIndex;
    inspect(rendered);
    return;
  }
  if (["code", "pre", "math", "kbd"].includes(node.type) || node.props.translate === "no") return;
  for (const key of ["aria-label", "aria-description", "title", "alt", "placeholder"]) if (node.props[key]) inspect(node.props[key]);
  inspect(node.props.children);
}
function assertMandarin(component, context) {
  strings = [];
  inspect(React.createElement(component));
  assert.ok(strings.filter((value) => /[\u3400-\u9fff]/.test(value)).length >= 10, `${context}: the demo should render Mandarin prose and labels`);
  const untranslated = strings.filter((value) => /[A-Za-z]{2}/.test(value) && !/[\u3400-\u9fff]/.test(value)
    && !/^[+−\-\d.e]+ (?:mg g⁻¹|J mol⁻¹)$/.test(value) && !/^[±+−\-\d.]+ kHz$/.test(value) && !identity.has(value) && !/^[+−\-\d,.]+ MHz$/.test(value) && !/^[\d,]+ × [\d,]+ px$/.test(value) && !/^[+−\-\d.]+ dB$/.test(value) && !/^\d\d:\d\d (?:BST|GMT)/.test(value)
    && !/^2026-\d\d-\d\dT/.test(value));
  if (process.env.COPY_REPORT) { if(untranslated.length) console.log(JSON.stringify({context, untranslated:[...new Set(untranslated)]})); } else assert.deepEqual([...new Set(untranslated)], [], `${context}: unexpected English UI text`);
}

const { SpectroscopyStudio } = load('src/components/projects/SpectroscopyStudio.tsx');
const { ThermodynamicsStudio } = load('src/components/projects/ThermodynamicsStudio.tsx');
const { DrugSolubilityStudio } = load('src/components/projects/DrugSolubilityStudio.tsx');
let cases=0;
for (locale of ['zh-CN','zh-TW']) {
 for(const loaded of [true,false]) for(const exportOpen of [true,false]) {
  states={SpectroscopyStudio:{0:loaded, 18:exportOpen}};
  assertMandarin(SpectroscopyStudio, locale+'/spectroscopy/'+loaded+'/'+exportOpen);cases++;
 }
 for(const parameters of [[330,3000,.5,.02],[250,6000,.75,-.2],[500,100,.1,.2]]) {
  states={ThermodynamicsStudio:parameters};
  assertMandarin(ThermodynamicsStudio,locale+'/thermodynamics/'+parameters.join('/'));cases++;
 }
 for(const view of ['solver','basis','validation','evidence']) for(const basis of ['mole','mass']) {
  states={DrugSolubilityStudio:[view,basis]};
  assertMandarin(DrugSolubilityStudio,locale+'/solubility/'+view+'/'+basis);cases++;
 }
}
console.log('Physical-science localisation: '+cases+' rendered view/state/locale cases passed.');

const { ChemistryCodingStudio } = load("src/components/projects/ChemistryCodingStudio.tsx");
let chemistryCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
 for (const lab of ["metropolis", "polymer", "dynamics", "quantum", "audit"]) {
  for (const method of ["equation", "algorithm", "record"]) {
   states = { ChemistryCodingStudio: [lab], MethodDrawer: [method] };
   assertMandarin(ChemistryCodingStudio, `${locale}/chemistry/${lab}/${method}`); chemistryCases++;
  }
 }
 for(const mode of ["notebook", "isotropic", "self-avoiding"]) {
  states = { ChemistryCodingStudio: ["polymer"], PolymerLab: [mode, 60, 22032025] };
  assertMandarin(ChemistryCodingStudio, `${locale}/polymer/${mode}`); chemistryCases++;
 }
}
console.log(`Chemistry localisation: ${chemistryCases} rendered lab/method/locale cases passed.`);

const { MolecularRecognitionStudio } = load("src/components/projects/MolecularRecognitionStudio.tsx");
let molecularCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
 for (const tab of ["assignment", "atlas", "method"]) for(const molecule of ["exaltenone", "muscone"]) {
  for (const view of tab === "assignment" ? ["spectrum", "matches", "equations"] : ["spectrum"]) {
   for(const candidate of [0,3]) {
    states = { MolecularRecognitionStudio: [tab, molecule, candidate, view] };
    assertMandarin(MolecularRecognitionStudio, `${locale}/molecular/${tab}/${molecule}/${view}/${candidate}`); molecularCases++;
   }
  }
 }
}
console.log(`Molecular recognition localisation: ${molecularCases} rendered tab/molecule/analysis/candidate/locale cases passed.`);

for(locale of ["zh-CN", "zh-TW"]) {
 for(const message of ["Pass 2: E-01 matched 4/8 lines with 41.2 kHz RMS.", "Pass 3: M-04 matched 0/8 lines. No RMS is defined."]) {
  states = { MolecularRecognitionStudio: {14: message} };
  assertMandarin(MolecularRecognitionStudio, `${locale}/molecular/feedback`);
 }
 for(const message of ["Fine half-range set to 0.10 MHz around 5175.00 MHz.", "X window shifted +100 MHz without changing its 70.00 MHz width.", "Upper Y bound shifted -0.001; the lower bound is unchanged.", "Direct X range applied: 5000.000 to 6000.000 MHz.", "Export preview prepared as PNG at 600 DPI. No file was written."]) {
  states = { SpectroscopyStudio: {20: message} };
  assertMandarin(SpectroscopyStudio, `${locale}/spectroscopy/feedback`);
 }
}
console.log("Physical-science localisation: 14 additional dynamic feedback cases passed.");
