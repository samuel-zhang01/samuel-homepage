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
const { MriTrustStudio } = load("src/components/projects/MriTrustStudio.tsx");
const { SchedulingDstExperiment, BackupFailureExperiment } = load("src/components/projects/SourceExperiments.tsx");
const identity = new Set([
  ...Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/mriCopy.audit.json"), "utf8")).identities),
  "MSE", "MAE", "dB", "Alex", "Morgan", "Riley", "dB，ε=", "PSNR（dB）", "PGD-7 PSNR", "FGSM PSNR",
]);
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
    && !identity.has(value) && !/^[+−\-\d.]+ dB$/.test(value) && !/^\d\d:\d\d (?:BST|GMT)/.test(value)
    && !/^2026-\d\d-\d\dT/.test(value));
  assert.deepEqual([...new Set(untranslated)], [], `${context}: unexpected English UI text`);
}
let cases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["experiments", "reconstruction", "architecture", "uncertainty", "robustness", "segmentation", "audit"]) {
    for (const variant of [0, 1]) {
      states = {
        MriTrustStudio: [view], ReconstructionView: variant ? [8, "zero", .5] : [4, "dc", .72],
        ArchitectureView: [variant ? "output" : "bottleneck", variant ? 0 : 3, variant ? 3 : 1],
        UncertaintyView: [variant ? "ensemble" : "dropout"],
        UncertaintyRankingExperiment: [variant ? 8 : 1, Boolean(variant), variant ? 0 : 4],
        RobustnessView: [variant ? "shift" : "attacks", "PGD-7", 2, variant ? "CT" : "MR"],
        AuditView: [variant ? "Integrated gradients" : "Grad-CAM"], MriErrorExperiment: [variant ? "localised" : "diffuse", .1, variant ? 16 : 4],
      };
      assertMandarin(MriTrustStudio, `${locale}/${view}/${variant}`);
      cases += 1;
    }
  }
  for (const day of ["spring", "autumn"]) {
    states = { SchedulingDstExperiment: [day, 30, true, Date.parse(day === "spring" ? "2026-03-29T00:30Z" : "2026-10-25T00:30Z")] };
    assertMandarin(SchedulingDstExperiment, `${locale}/DST/${day}`);
    cases += 1;
  }
  for (const scenario of ["dump", "interrupted", "race"]) {
    states = { BackupFailureExperiment: [scenario, 5] };
    assertMandarin(BackupFailureExperiment, `${locale}/backup/${scenario}`);
    cases += 1;
  }
}
console.log(`MRI/source localization: ${cases} rendered view/state/locale cases, including helper components, charts, selected-slot timestamps, failures and dynamic metric labels passed.`);

const { SchedulingStudio } = load("src/components/projects/SchedulingStudio.tsx");
const { FinanceImportExperiment } = load("src/components/projects/FinanceImportExperiment.tsx");
const { emptyImportState, financeImportBatches, applyStatement } = load("src/lib/financeImport.ts");
let productCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const mode of ["individual", "round-robin", "collective", "first-available"]) {
    for (const timezone of ["Europe/London", "America/New_York", "Asia/Tokyo"]) {
      states = { SchedulingStudio: [mode, ["host-a", "host-b", "host-c"], 60, 15, timezone] };
      assertMandarin(SchedulingStudio, `${locale}/scheduling/${mode}/${timezone}`);
      productCases += 1;
    }
  }
  for (const scenario of ["occurrence", "provider", "balance", "empty"]) {
    let importState = emptyImportState();
    const batches = financeImportBatches(scenario);
    for (let step = 0; step <= batches.length; step += 1) {
      states = { FinanceImportExperiment: [scenario, importState, step] };
      assertMandarin(FinanceImportExperiment, `${locale}/finance-import/${scenario}/${step}`);
      if (step < batches.length) importState = applyStatement(importState, batches[step]);
      productCases += 1;
    }
  }
}
console.log(`Scheduling/import localization: ${productCases} rendered mode/timezone/statement/locale cases passed.`);

const { FinanceStudio } = load("src/components/projects/FinanceStudio.tsx");
for (const name of Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/financeCopy.audit.json"), "utf8")).identities)) identity.add(name);
let financeCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["overview", "ledger", "recurring", "transfers", "import"]) {
    for (const variant of [0, 1]) {
      states = { FinanceStudio: [view, variant ? 30 : 90, "all", variant ? 2 : 3],
        LedgerView: ["all", "all", "", variant ? "tx-015" : "tx-001"],
        TransfersView: [variant ? 1 : 3, Boolean(variant)] };
      assertMandarin(FinanceStudio, `${locale}/finance/${view}/${variant}`);
      financeCases += 1;
    }
  }
}
console.log(`Finance localization: ${financeCases} rendered view/range/locale cases passed.`);

const { HomeLabTopologyStudio } = load("src/components/projects/HomeLabTopologyStudio.tsx");
for (const name of Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/homeLabCopy.audit.json"), "utf8")).identities)) identity.add(name);
for (const alias of ["edge-a", "ops-a", "guard-a", "net-app", "access-a", "data-a", "schedule-a", "job-backup", "job-restore", "Guacamole → PostgreSQL"]) identity.add(alias);
let homeCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["backup", "topology", "failure", "capacity", "audit"]) {
    for (const variant of [0, 1]) {
      states = { HomeLabTopologyStudio: [view], TopologyView: [variant ? "table" : "map", variant ? "restore" : "database", variant ? "proxy" : "guacamole", "database", true], FailureLab: [variant ? "scheduler" : "database", variant ? 3 : 2] };
      assertMandarin(HomeLabTopologyStudio, `${locale}/home-lab/${view}/${variant}`);
      homeCases += 1;
    }
  }
}
console.log(`Home lab localization: ${homeCases} rendered topology/failure/capacity/history/locale cases passed.`);

const { StockMarketStudio } = load("src/components/projects/StockMarketStudio.tsx");
let stockCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["lab", "window", "evidence"]) {
    for (const variant of [0, 1, 2]) {
      states = { StockMarketStudio: [view, variant === 2 ? "floor" : "source", variant === 2 ? { seed: 17, initialPrice: .18, maxQuantity: 100, maxPriceImpact: .02 } : { seed: 2025, initialPrice: 100, maxQuantity: 100, maxPriceImpact: .01 }, variant === 0 ? 0 : 10, variant === 2 ? "legacy" : "corrected"] };
      assertMandarin(StockMarketStudio, `${locale}/stock-model/${view}/${variant}`);
      stockCases += 1;
    }
  }
}
console.log(`Stock-model localization: ${stockCases} rendered empty/day-close/floor/metric-window/locale cases passed.`);

const { CourseRecommenderStudio } = load("src/components/projects/CourseRecommenderStudio.tsx");
let courseCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["recommend", "explain", "counterfactual", "source"]) {
    for (const variant of [0, 1, 2]) {
      states = { CourseRecommenderStudio: [view, variant === 0 ? "adapted" : "source", variant === 2 ? { categories: ["Design"], difficulty: "Advanced", time: "flexible", budget: "free" } : { categories: ["Programming", "AI/ML"], difficulty: "Intermediate", time: "part-time", budget: "100-500" }, { category: 35, difficulty: 25, duration: 15, budget: 15, rating: 10 }, 4, 2] };
      assertMandarin(CourseRecommenderStudio, `${locale}/course-recommender/${view}/${variant}`);
      courseCases += 1;
    }
  }
}
console.log(`Course localization: ${courseCases} rendered scoring/baseline/empty-filter/counterfactual/locale cases passed.`);

const { ItalianLearningStudio } = load("src/components/projects/ItalianLearningStudio.tsx");
for (const name of Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/italianCopy.audit.json"), "utf8")).identities)) identity.add(name);
let italianCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["practice", "recall", "rubric", "evidence", "system"]) {
    for (const variant of [0, 1, 2]) {
      states = { ItalianLearningStudio: [view, variant !== 2], PracticeLab: ["daily", 0, ["listen-train", "grammar-nationality", "vocab-reservation", "reorder-hotel", "reading-cafe"], variant === 2 ? 5 : variant, "", [], variant === 1 ? false : null, false, 0, 1200], RecallLab: [variant, variant !== 0], EvidenceLab: [variant, 2, variant === 1 ? 8 : 4], SystemLab: [true, variant === 1 ? "conflict" : variant === 2 ? "synced" : "idle", variant === 2 ? 14 : 12, variant === 2 ? 14 : variant === 1 ? 13 : 12] };
      assertMandarin(ItalianLearningStudio, `${locale}/italian/${view}/${variant}`);
      italianCases += 1;
    }
  }
}
console.log(`Italian localization: ${italianCases} rendered practice/recall/rubric/evidence/sync/locale cases passed; Italian exercise material remains explicitly source-marked.`);

const { EnvironmentPlannerStudio } = load("src/components/projects/EnvironmentPlannerStudio.tsx");
for (const name of Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/environmentCopy.audit.json"), "utf8")).identities)) identity.add(name);
for (const name of ["x86_64", "arm64", "CPU · CPU", "NVIDIA · CUDA 12.3", "Linux · x86_64; NVIDIA · CUDA 12.3", "Linux · x86_64; NVIDIA · CUDA 12.4"]) identity.add(name);
let environmentCases = 0;
const environmentProfiles = [
  { os: "linux", architecture: "x86_64", accelerator: "nvidia", cuda: "12.3", environmentPolicy: "new", allowNightly: false },
  { os: "linux", architecture: "arm64", accelerator: "nvidia", cuda: "unknown", environmentPolicy: "keep", allowNightly: false },
  { os: "macos", architecture: "arm64", accelerator: "apple", cuda: "unknown", environmentPolicy: "recreate", allowNightly: false },
  { os: "macos", architecture: "x86_64", accelerator: "cpu", cuda: "unknown", environmentPolicy: "new", allowNightly: false },
  { os: "windows", architecture: "x86_64", accelerator: "nvidia", cuda: "13.0", environmentPolicy: "new", allowNightly: true },
  { os: "windows", architecture: "arm64", accelerator: "nvidia", cuda: "14.0", environmentPolicy: "new", allowNightly: false },
  { os: "linux", architecture: "x86_64", accelerator: "nvidia", cuda: "12.4", environmentPolicy: "new", allowNightly: false },
  { os: "linux", architecture: "x86_64", accelerator: "cpu", cuda: "unknown", environmentPolicy: "new", allowNightly: false },
];
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["resolver", "failure", "manifest", "audit"]) {
    for (const mode of ["source", "adapted"]) {
      for (const [index, profile] of environmentProfiles.entries()) {
        states = { EnvironmentPlannerStudio: [view, mode, profile], FailureLab: [["core-package", "torch-primary", "tensorflow-runtime", "hf-bootstrap"][index % 4], index % 2 ? "lightgbm" : "numpy"] };
        assertMandarin(EnvironmentPlannerStudio, `${locale}/environment/${view}/${mode}/${index}`);
        environmentCases += 1;
      }
    }
  }
}
console.log(`Environment localization: ${environmentCases} rendered platform/architecture/CUDA/failure/locale cases passed.`);

const { CvKeywordStudio } = load("src/components/projects/CvKeywordStudio.tsx");
for (const name of Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/cvKeywordCopy.audit.json"), "utf8")).identities)) identity.add(name);
identity.add("API");
let cvCases = 0;
for (locale of ["zh-CN", "zh-TW"]) {
  for (const view of ["inputs", "analysis", "evidence", "output"]) {
    for (const [index, template] of ["tech", "consult", "product", "science", "law", "fintech", "ai", "ops"].entries()) {
      states = { CvKeywordStudio: [undefined, undefined, undefined, undefined, undefined, view, template, index % 2 ? "core" : "all", new Set(index % 2 ? ["pipeline-impact"] : []), Boolean(index % 2), index % 2 ? "monitoring" : "python"] };
      assertMandarin(CvKeywordStudio, `${locale}/cv-keyword/${view}/${template}`);
      cvCases += 1;
    }
    states = { CvKeywordStudio: ["", "", "", "", { cv: "", job: "", role: "", company: "" }, view] };
    assertMandarin(CvKeywordStudio, `${locale}/cv-keyword/${view}/empty`);
    cvCases += 1;
  }
}
console.log(`CV localization: ${cvCases} rendered template/evidence/staged/empty/locale cases passed; source-document quotations are explicitly preserved.`);

const { CoverageShiftExperiment } = load("src/components/projects/CoverageShiftExperiment.tsx");
let coverageCases = 0;
for (locale of ["zh-CN", "zh-TW"]) for (const shift of [0, .5, 2]) for (const target of [.8, .9, .95]) {
  states = { CoverageShiftExperiment: [shift, target] };
  assertMandarin(CoverageShiftExperiment, `${locale}/coverage-shift/${target}/${shift}`);
  coverageCases += 1;
}
console.log(`Coverage localization: ${coverageCases} rendered target/shift/locale cases passed.`);

const { PortfolioMap } = load("src/components/projects/PortfolioMap.tsx");
for (const name of Object.keys(JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/projectNarrativeCopy.audit.json"), "utf8")).identities)) identity.add(name);
identity.add("MRI");
let portfolioCases = 0;
for (locale of ["zh-CN", "zh-TW"]) for (const view of ["compare", "timeline", "matrix", "tools", "models", "ledger"]) for (const variant of [0, 1]) {
  states = { PortfolioMap: [view, view], TimelineView: [variant ? "ongoing" : "all", "all", "all"], ToolIndexView: [variant ? "missing-tool-example" : "", false], MatrixView: [variant ? { area: "Research", demo: true } : { area: "Products" }] };
  assertMandarin(() => React.createElement(PortfolioMap, { locale, onSelectProject: () => {} }), `${locale}/portfolio/${view}/${variant}`);
  portfolioCases += 1;
}
console.log(`Portfolio localization: ${portfolioCases} rendered comparison/timeline/matrix/tool/guide/locale cases passed.`);
