import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = resolve(projectRoot, "src/data/projects.ts");
async function importTypeScriptModule(path) {
  const source = readFileSync(path, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: path,
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
  return import(moduleUrl);
}

const { projects, isInteractiveProject } = await importTypeScriptModule(cataloguePath);
const {
  projectShelfSpecs,
  projectStartPaths,
  projectSuites,
} = await importTypeScriptModule(resolve(projectRoot, "src/components/projects/projectSuites.ts"));
const { projectStories } = await importTypeScriptModule(resolve(projectRoot, "src/components/projects/projectStories.ts"));

const errors = [];
const slugs = new Set();
const demoOwners = new Map();
const artifactOwners = new Map();
const expectedPhaseLabels = ["Start small", "Move forward", "Polish"];
const nativeAppIds = ["orbitals", "notepad", "sketch", "tasks", "focus", "calendar", "calculator", "converter", "palette"];
for (const appId of nativeAppIds) {
  const entries = projects.filter((project) => project.systemApp === appId);
  if (entries.length !== 1 || !isInteractiveProject(entries[0]) || entries[0].demo) {
    errors.push(`<native apps>: ${appId} needs exactly one executable archive entry, using its existing app instead of a duplicate demo`);
  }
}
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
  if (project.access === "public-demo" && !isInteractiveProject(project)) {
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

const suiteMembership = new Map();
for (const suite of projectSuites) {
  if (!suite.id?.trim() || !suite.title?.trim() || !suite.description?.trim()) {
    errors.push("<suite>: id, title and description are required");
  }
  if (!Array.isArray(suite.slugs) || suite.slugs.length < 2) {
    errors.push(`${suite.id || "<suite>"}: a suite requires at least two project chapters`);
    continue;
  }
  for (const slug of suite.slugs) {
    if (!slugs.has(slug)) errors.push(`${suite.id}: unknown project chapter ${slug}`);
    const owner = suiteMembership.get(slug);
    if (owner) errors.push(`${suite.id}: ${slug} is already assigned to suite ${owner}`);
    suiteMembership.set(slug, suite.id);
  }
}

const requiredStoryFields = ["audience", "problem", "objective", "contribution", "pipeline", "walkthrough"];
for (const [demo, slug] of demoOwners) {
  const story = projectStories[demo];
  if (!story) {
    errors.push(`${slug}: demo ${demo} requires a structured case story`);
    continue;
  }
  for (const field of requiredStoryFields) {
    if (!story[field]?.trim()) errors.push(`${slug}: case story field ${field} is required`);
  }
}
for (const demo of Object.keys(projectStories)) {
  if (!demoOwners.has(demo)) errors.push(`<stories>: orphan story for unknown demo ${demo}`);
}

const experienceIds = new Set(
  projects.filter(isInteractiveProject).map(({ slug }) => suiteMembership.has(slug) ? `suite:${suiteMembership.get(slug)}` : `project:${slug}`),
);
if (experienceIds.size !== 16) {
  errors.push(`<catalogue>: expected 16 curated experiences, found ${experienceIds.size}`);
}

const guidedShelfIds = new Set();
const guidedSuiteIds = [];
const guidedStandaloneSlugs = [];
const guidedVisibleSlugs = [];
let guidedExperienceCount = 0;

for (const shelf of projectShelfSpecs) {
  if (!shelf.id?.trim() || !shelf.code?.trim()) {
    errors.push("<guided>: every shelf requires an id and code");
  }
  if (guidedShelfIds.has(shelf.id)) errors.push(`<guided>: duplicate shelf ${shelf.id}`);
  guidedShelfIds.add(shelf.id);
  if (!Array.isArray(shelf.experiences) || shelf.experiences.length === 0) {
    errors.push(`${shelf.id || "<guided>"}: shelf requires at least one experience`);
    continue;
  }

  for (const experience of shelf.experiences) {
    guidedExperienceCount += 1;
    if (experience.kind === "suite") {
      const suite = projectSuites.find((candidate) => candidate.id === experience.id);
      if (!suite) {
        errors.push(`${shelf.id}: unknown guided suite ${experience.id}`);
        continue;
      }
      guidedSuiteIds.push(suite.id);
      guidedVisibleSlugs.push(...suite.slugs);
      if (!suite.slugs.includes(experience.recommendedSlug)) {
        errors.push(`${shelf.id}: recommended chapter ${experience.recommendedSlug} is not in ${suite.id}`);
      } else if (!projects.some((project) => project.slug === experience.recommendedSlug && isInteractiveProject(project))) {
        errors.push(`${shelf.id}: recommended chapter ${experience.recommendedSlug} is not interactive`);
      }
      continue;
    }

    if (experience.kind !== "project" || !slugs.has(experience.slug)) {
      errors.push(`${shelf.id}: unknown guided project ${experience.slug || "<missing>"}`);
      continue;
    }
    if (!projects.some((project) => project.slug === experience.slug && isInteractiveProject(project))) {
      errors.push(`${shelf.id}: standalone experience ${experience.slug} is not interactive`);
    }
    guidedStandaloneSlugs.push(experience.slug);
    guidedVisibleSlugs.push(experience.slug);
  }

  for (const slug of shelf.supportingSlugs ?? []) {
    const project = projects.find((candidate) => candidate.slug === slug);
    if (!project) {
      errors.push(`${shelf.id}: unknown supporting file ${slug}`);
      continue;
    }
    if (isInteractiveProject(project)) errors.push(`${shelf.id}: interactive project ${slug} cannot be demoted to supporting evidence`);
    guidedVisibleSlugs.push(slug);
  }
}

const expectedStandaloneSlugs = projects
  .filter((project) => isInteractiveProject(project) && !suiteMembership.has(project.slug))
  .map((project) => project.slug);
const sameMembers = (left, right) => (
  left.length === right.length && left.every((item) => right.includes(item))
);

if (guidedShelfIds.size !== 6) errors.push(`<guided>: expected 6 shelves, found ${guidedShelfIds.size}`);
if (guidedExperienceCount !== 16) errors.push(`<guided>: expected 16 experiences, found ${guidedExperienceCount}`);
if (!sameMembers(guidedSuiteIds, projectSuites.map((suite) => suite.id))) {
  errors.push("<guided>: every editorial suite must appear exactly once");
}
if (!sameMembers(guidedStandaloneSlugs, expectedStandaloneSlugs)) {
  errors.push("<guided>: standalone experiences do not match unsuited interactive projects");
}
if (
  guidedVisibleSlugs.length !== projects.length
  || new Set(guidedVisibleSlugs).size !== projects.length
  || !projects.every((project) => guidedVisibleSlugs.includes(project.slug))
) {
  errors.push("<guided>: every canonical project must appear exactly once");
}

const startIds = new Set(projectStartPaths.map((path) => path.id));
const startSlugs = new Set(projectStartPaths.map((path) => path.slug));
if (projectStartPaths.length !== 4 || startIds.size !== 4 || startSlugs.size !== 4) {
  errors.push("<guided>: Start Here requires four distinct routes");
}
for (const path of projectStartPaths) {
  if (!projects.find((project) => project.slug === path.slug)?.demo) {
    errors.push(`<guided>: Start Here route ${path.slug} must open an interactive project`);
  }
}

if (errors.length) {
  console.error("Project catalogue validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Project catalogue gate: ${projects.length} unique files, ${projects.filter(isInteractiveProject).length} interactive exhibits, ${experienceIds.size} curated experiences across ${guidedShelfIds.size} guided shelves, ${artifactOwners.size} reviewed artifacts.`,
);
