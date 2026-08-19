import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = resolve(projectRoot, "src/data/projects.ts");
const source = readFileSync(cataloguePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: cataloguePath,
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { projects } = await import(moduleUrl);

const errors = [];
const slugs = new Set();
const demoOwners = new Map();
const artifactOwners = new Map();
const expectedPhaseLabels = ["Start small", "Move forward", "Polish"];
const publicRoot = resolve(projectRoot, "public");

function fail(project, message) {
  errors.push(`${project.slug || "<missing slug>"}: ${message}`);
}

function localPublicFile(project, href, label) {
  let pathname;
  try {
    pathname = decodeURIComponent(href.split(/[?#]/, 1)[0]);
  } catch {
    fail(project, `${label} has invalid URL encoding: ${href}`);
    return;
  }
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    fail(project, `${label} must be a same-origin absolute path: ${href}`);
    return;
  }
  const target = resolve(publicRoot, `.${pathname}`);
  if (target !== publicRoot && !target.startsWith(`${publicRoot}${sep}`)) {
    fail(project, `${label} escapes public/: ${href}`);
    return;
  }
  if (!existsSync(target) || !statSync(target).isFile()) {
    fail(project, `${label} does not resolve to a public file: ${href}`);
  }
}

function reviewedArtifact(project, href, label) {
  if (/^https:\/\//i.test(href)) {
    try {
      const reference = new URL(href);
      if (reference.protocol !== "https:" || !reference.hostname) throw new Error("invalid HTTPS reference");
      return;
    } catch {
      fail(project, `${label} has an invalid HTTPS reference: ${href}`);
      return;
    }
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//")) {
    fail(project, `${label} must be a same-origin path or HTTPS reference: ${href}`);
    return;
  }
  localPublicFile(project, href, label);
}

for (const project of projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug ?? "")) {
    fail(project, "slug must be non-empty kebab-case");
  }
  if (slugs.has(project.slug)) fail(project, "duplicate slug");
  slugs.add(project.slug);

  if (!project.title?.trim() || !project.summary?.trim() || !project.detail?.trim()) {
    fail(project, "title, summary and detail are required");
  }
  if (!Array.isArray(project.tools) || project.tools.length < 2) {
    fail(project, "at least two concrete tools or methods are required");
  }
  if (!Array.isArray(project.highlights) || project.highlights.length < 2) {
    fail(project, "at least two evidence highlights are required");
  }
  if (!Array.isArray(project.phases) || project.phases.length !== 3) {
    fail(project, "build log must contain exactly three phases");
  } else {
    project.phases.forEach((phase, index) => {
      if (phase.label !== expectedPhaseLabels[index] || !phase.text?.trim()) {
        fail(project, `phase ${index + 1} must be ${expectedPhaseLabels[index]} with copy`);
      }
    });
  }

  if (project.access === "proprietary" && !project.privacyNote?.trim()) {
    fail(project, "private/redacted entries require an explicit privacy boundary");
  }
  if (project.access === "public-demo" && !project.demo) {
    fail(project, "public-demo entries must route to an interactive exhibit");
  }
  if (project.access === "open-source") {
    if (!project.sourceUrl || project.sourceLicence !== "explicit-open-source") {
      fail(project, "open-source entries require a source URL and an explicit licence declaration");
    }
  }
  if (project.sourceLicence === "explicit-open-source" && project.access !== "open-source") {
    fail(project, "explicitly licensed source should use the open-source access class");
  }
  if (project.sourceLicence && !project.sourceUrl) {
    fail(project, "source licence status requires a source URL");
  }
  if (project.sourceUrl) {
    if (!project.sourceUrl.startsWith("https://")) fail(project, "source URL must use HTTPS");
    if (project.sourceUrl.startsWith("https://github.com/") && !/\/(?:tree|blob)\/[0-9a-f]{40}(?:\/|$)/i.test(project.sourceUrl)) {
      fail(project, "GitHub source URL must pin an immutable 40-character commit");
    }
    if (project.access === "proprietary") fail(project, "proprietary entries cannot publish a source URL");
    if (!project.sourceLicence) fail(project, "public source links require an explicit licence-status field");
  }
  if (project.sourceLicence === "none-declared" && !/no (?:explicit )?licen[cs]e/i.test(project.privacyNote ?? "")) {
    fail(project, "unlicensed public source requires a visible no-licence disclosure");
  }
  if (project.websiteUrl && !project.websiteUrl.startsWith("https://")) {
    fail(project, "website URL must use HTTPS");
  }

  if (project.demo) {
    const owner = demoOwners.get(project.demo);
    if (owner) fail(project, `demo ${project.demo} is already owned by ${owner}`);
    demoOwners.set(project.demo, project.slug);
  }

  for (const artifact of project.artifacts ?? []) {
    reviewedArtifact(project, artifact.href, `artifact ${artifact.label}`);
    const owner = artifactOwners.get(artifact.href);
    if (owner) fail(project, `artifact ${artifact.href} is already attached to ${owner}`);
    artifactOwners.set(artifact.href, project.slug);
  }
  if (project.preview) localPublicFile(project, project.preview.src, "preview");
}

if (errors.length) {
  console.error("Project catalogue validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Project catalogue gate: ${projects.length} unique files, ${demoOwners.size} interactive exhibits, ${artifactOwners.size} reviewed artifacts.`,
);
