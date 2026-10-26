import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const modules = new Map();
function load(relative) {
  const filename = resolve(root, relative);
  if (modules.has(filename)) return modules.get(filename);
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const compiledModule = { exports: {} };
  const localRequire = (name) => name.startsWith(".")
    ? load(resolve(dirname(filename), `${name}.ts`))
    : require(name);
  new Function("module", "exports", "require", outputText)(compiledModule, compiledModule.exports, localRequire);
  modules.set(filename, compiledModule.exports);
  return compiledModule.exports;
}

const { projects, hasEmbeddedProjectDemo } = load("src/data/projects.ts");
const { resolveProjectActivity, projectActivitySearch } = load("src/lib/projectActivity.ts");
let checks = 0;
function check(name, callback) { callback(); checks += 1; console.log(`PASS ${name}`); }
const growmat = projects.find((project) => project.slug === "growmat");
const showcase = growmat.artifacts.find((artifact) => artifact.kind === "PDF").href;

check("Only embedded demos resolve; live websites and other projects open their overview", () => {
  for (const project of projects) {
    assert.deepEqual(resolveProjectActivity(project.slug, "demo"), hasEmbeddedProjectDemo(project) ? { slug: project.slug, kind: "demo" } : null);
  }
});

check("Browser View keeps installation and source destinations; obsolete demo links fall back to its overview", () => {
  const project = projects.find(project => project.slug === "browser-view");
  assert.equal(project.demo, undefined);
  assert.ok(project.downloadUrl.endsWith("/browser-view/releases/tag/v0.3.0"));
  assert.equal(resolveProjectActivity(project.slug, "demo"), null);
  assert.throws(() => projectActivitySearch({ slug: project.slug, kind: "demo" }), /Unknown project activity/);
});

check("A live website replaces an embedded demo, including future catalogue additions", () => {
  assert.equal(hasEmbeddedProjectDemo({ demo: "italian-learning" }), true);
  assert.equal(hasEmbeddedProjectDemo({ demo: "italian-learning", websiteUrl: "https://example.com" }), false);
  assert.equal(hasEmbeddedProjectDemo({ websiteUrl: "https://example.com" }), false);
  for (const project of projects.filter(project => project.websiteUrl)) {
    assert.equal(resolveProjectActivity(project.slug, "demo"), null);
    assert.throws(() => projectActivitySearch({ slug: project.slug, kind: "demo" }), /Unknown project activity/);
  }
});

check("PDF viewers accept only the selected project's exact declared PDF href", () => {
  for (const project of projects) for (const artifact of project.artifacts ?? []) {
    assert.deepEqual(resolveProjectActivity(project.slug, "pdf", artifact.href), artifact.kind === "PDF"
      ? { slug: project.slug, kind: "pdf", artifactHref: artifact.href }
      : null);
  }
  assert.equal(resolveProjectActivity("study-rl", "pdf", showcase), null);
  assert.equal(resolveProjectActivity("growmat", "pdf", decodeURIComponent(showcase)), null);
  for (const artifact of [undefined, null, "", "0", "../private.pdf", "https://example.com/unlisted.pdf", `${showcase}?alternate=1`]) {
    assert.equal(resolveProjectActivity("growmat", "pdf", artifact), null);
  }
});

check("Invalid projects and unrelated views fall back to the overview", () => {
  for (const slug of [undefined, "", "unknown-project"]) {
    assert.equal(resolveProjectActivity(slug, "demo"), null);
    assert.equal(resolveProjectActivity(slug, "pdf", showcase), null);
  }
  for (const view of [undefined, null, "", "files", "map", "PDF", "unknown"]) {
    assert.equal(resolveProjectActivity("growmat", view, showcase), null);
  }
});

check("Shared demo and PDF links reopen the same activity in every locale", () => {
  const requests = projects.flatMap((project) => [
    ...(hasEmbeddedProjectDemo(project) ? [{ slug: project.slug, kind: "demo" }] : []),
    ...(project.artifacts ?? []).filter((artifact) => artifact.kind === "PDF")
      .map((artifact) => ({ slug: project.slug, kind: "pdf", artifactHref: artifact.href })),
  ]);
  for (const request of requests) for (const prefix of ["", "/en-gb", "/en-us", "/zh-cn", "/zh-tw"]) {
    const shared = new URL(`${prefix}/projects${projectActivitySearch(request)}`, "https://example.com");
    assert.deepEqual(resolveProjectActivity(shared.searchParams.get("project"), shared.searchParams.get("view"), shared.searchParams.get("artifact")), request);
    assert.equal(shared.hash, "");
    assert.equal(shared.searchParams.size, request.kind === "pdf" ? 3 : 2);
  }
  const encodedShowcase = projectActivitySearch({ slug: "growmat", kind: "pdf", artifactHref: showcase });
  assert.ok(encodedShowcase.includes("%2520"), "Already encoded file spaces must survive query decoding unchanged");
});

check("The share helper refuses links to unavailable activities", () => {
  assert.throws(() => projectActivitySearch({ slug: "growmat", kind: "demo" }), /Unknown project activity/);
  assert.throws(() => projectActivitySearch({ slug: "growmat", kind: "pdf" }), /Unknown project activity/);
  assert.throws(() => projectActivitySearch({ slug: "growmat", kind: "pdf", artifactHref: "/unlisted.pdf" }), /Unknown project activity/);
});

console.log(`${checks} project activity checks passed.`);
