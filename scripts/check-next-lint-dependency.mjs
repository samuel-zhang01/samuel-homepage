import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { ESLint } from "eslint";

// The scoped fast-glob alias removes braces from development dependencies.
// tinyglobby omits symlink directories for onlyDirectories, so this repository
// supports Next's default single-project root only. Check effective config,
// including file-specific overrides, before linting can silently miss routes.
const require = createRequire(import.meta.url);
const nextPlugin = require("@next/eslint-plugin-next");
const pluginRequire = createRequire(require.resolve("@next/eslint-plugin-next"));
const globPackage = pluginRequire("fast-glob/package.json");
assert.equal(globPackage.name, "tinyglobby", "Review the scoped Next lint dependency replacement.");
assert.equal(globPackage.version, "0.2.17", "Review and retest a new glob replacement version.");
assert.equal(typeof pluginRequire("fast-glob").globSync, "function");
// 15.5.28: all 52 distributed rule/helper files match 15.5.27 byte-for-byte.
assert.equal(require("@next/eslint-plugin-next/package.json").version, "15.5.28", "Review a new Next plugin's glob imports and rule behavior before retaining the override.");
assert.equal(require("@next/eslint-plugin-next/package.json").version, require("next/package.json").version);
assert.equal(require("eslint-config-next/package.json").version, require("next/package.json").version);

// GHSA-g3hv-75wg-m249: keep the parser's named minimatch API on its patched
// release without changing ESLint's unrelated v3 matcher or Next's glob adapter.
const nextConfigRequire = createRequire(require.resolve("eslint-config-next"));
const matcherCases = [
  ["eslint.config.mjs", "*.mjs", true],
  [".eslintrc.cjs", "*.cjs", true],
  ["src/app/page.tsx", "src/**/*.tsx", true],
  ["src/app/page.tsx", "src/**/*.ts", false],
  ["src/.generated/page.ts", "src/**/*.{ts,tsx}", true],
  ["src/app/page.tsx", "tests/**/*.tsx", false],
];
let parserMatcherChecks = 0;
for (const consumer of [
  createRequire(require.resolve("@typescript-eslint/parser")),
  createRequire(nextConfigRequire.resolve("@typescript-eslint/parser")),
  createRequire(createRequire(nextConfigRequire.resolve("@typescript-eslint/eslint-plugin")).resolve("@typescript-eslint/type-utils")),
]) {
  const estreeRequire = createRequire(consumer.resolve("@typescript-eslint/typescript-estree"));
  assert.equal(estreeRequire("minimatch/package.json").version, "11.0.1", "Review a changed parser matcher override.");
  const { minimatch } = estreeRequire("minimatch");
  for (const [file, pattern, expected] of matcherCases) {
    assert.equal(minimatch(file, pattern, { dot: true }), expected, `Parser default-project matching: ${file} / ${pattern}`);
    parserMatcherChecks += 1;
  }
}

function checkRootSettings(config, filename) {
  if (config?.settings?.next?.rootDir !== undefined) {
    throw new Error(`${filename}: configured settings.next.rootDir requires a new lint dependency review. The scoped tinyglobby override supports this app's default project root; symlink roots are not equivalent to fast-glob.`);
  }
}

const eslint = new ESLint();
// Use the same filesystem discovery and ignores as `eslint`, including ZIP
// downloads and Docker builders without .git. This pass only discovers files
// and parses them; the normal lint command still executes every configured rule.
const discoveredFiles = await new ESLint({ ruleFilter: () => false }).lintFiles(["."]);
const sourceFiles = discoveredFiles.map(({ filePath }) => path.relative(process.cwd(), filePath));
for (const result of discoveredFiles) {
  assert.equal(result.fatalErrorCount, 0, `${result.filePath}: source discovery could not parse this lint input.`);
}
let configChecks = 0;
for (const filename of sourceFiles) {
  const config = await eslint.calculateConfigForFile(filename);
  if (!config) continue;
  checkRootSettings(config, filename);
  configChecks += 1;
}

const applicationConfig = await eslint.calculateConfigForFile("src/app/layout.tsx");
for (const [rule, severity] of Object.entries(nextPlugin.configs["core-web-vitals"].rules)) {
  const expected = severity === "error" ? 2 : 1;
  assert.equal(applicationConfig.rules[rule]?.[0], expected, `${rule} must retain the reviewed Next rule coverage.`);
}
const unsupportedConfig = await new ESLint({ overrideConfig: { settings: { next: { rootDir: "apps/*" } } } })
  .calculateConfigForFile("src/app/layout.tsx");
assert.throws(() => checkRootSettings(unsupportedConfig, "configured-root fixture"), /requires a new lint dependency review/);

const fixtureRoot = await mkdtemp(path.join(tmpdir(), "samuel-next-lint-"));
let routeChecks = 0;
try {
  for (const route of ["review", "(research)/[subject]", "(research)/static-report"]) {
    const directory = path.join(fixtureRoot, "src", "app", route);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "page.tsx"), "export default function Page() { return null; }\n");
  }
  const fixtureLint = new ESLint({
    cwd: fixtureRoot,
    overrideConfigFile: true,
    overrideConfig: [{
      files: ["**/*.tsx"],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "@next/next": nextPlugin },
      rules: nextPlugin.configs["core-web-vitals"].rules,
    }],
  });
  for (const href of ["/review", "/static-report", "/an-example-subject"]) {
    const [result] = await fixtureLint.lintText(`export default function Page() { return <a href="${href}">Internal page</a>; }`, { filePath: "src/fixture.tsx" });
    assert.ok(result.messages.some((message) => message.ruleId === "@next/next/no-html-link-for-pages" && message.severity === 2), `Default App Router discovery missed ${href}`);
    routeChecks += 1;
  }
  for (const markup of [
    '<a href="https://example.org/review">External reference</a>',
    '<a href="/review" target="_blank">New tab</a>',
    '<Link href="/review">Internal page</Link>',
  ]) {
    const [result] = await fixtureLint.lintText(`export default function Page() { return ${markup}; }`, { filePath: "src/fixture.tsx" });
    assert.equal(result.messages.length, 0, JSON.stringify(result.messages));
    routeChecks += 1;
  }
  for (const depth of [100, 3500, 4900]) {
    const deeplyNested = "{".repeat(depth) + "a,b" + "}".repeat(depth);
    assert.doesNotThrow(() => pluginRequire("fast-glob").globSync(deeplyNested, { cwd: fixtureRoot, onlyDirectories: true }));
    routeChecks += 1;
  }
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log(`Next lint dependency gate: ${configChecks} effective configurations, configured-root rejection, all ${Object.keys(nextPlugin.rules).length} Next rules, ${routeChecks} App Router/link/deep-nesting and ${parserMatcherChecks} patched parser-matcher regressions passed.`);
