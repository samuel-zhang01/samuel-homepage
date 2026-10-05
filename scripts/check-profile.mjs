import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = realpathSync(resolve(root, "public"));
const require = createRequire(import.meta.url);

/** Execute the actual modules, including their relative and @/ dependencies.
 * Fresh loaders let extension fixtures exercise the adapter without editing files. */
function createLoader(overrides = new Map()) {
  const cache = new Map(overrides);
  function load(filename) {
    const absolute = resolve(root, filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const result = ts.transpileModule(readFileSync(absolute, "utf8"), {
      fileName: absolute,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    const evaluated = { exports: {} };
    cache.set(absolute, evaluated.exports);
    const localRequire = name => {
      if (!name.startsWith(".") && !name.startsWith("@/")) return require(name);
      const imported = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(absolute), name);
      return load(extname(imported) ? imported : `${imported}.ts`);
    };
    new Function("module", "exports", "require", result.outputText)(evaluated, evaluated.exports, localRequire);
    return evaluated.exports;
  }
  return load;
}

const load = createLoader();
const profile = load("src/data/profile.ts");
const documents = load("src/data/documents.ts");
const extensionFixture = process.env.PROFILE_SIXTH_DOCUMENT_FIXTURE === "1";
if (extensionFixture) {
  // Real reviewed public PDF bytes, a distinct library ID, a matching source and
  // no project association: exercise the entire gate as a future agent would.
  profile.profileSources.push({ id: "additional-cv-fixture", title: "Additional reviewed PDF fixture", kind: "project", href: "/Samuel-Zhang-Applied-AI-CV-zh-TW.pdf" });
  documents.supportingDocuments.push({ id: "additional-document-fixture", title: "Traditional Chinese CV fixture", meta: "Reviewed PDF fixture", src: "/Samuel-Zhang-Applied-AI-CV-zh-TW.pdf", description: "Synthetic extra library record using a reviewed local PDF", originIds: [], sourceIds: ["additional-cv-fixture"] });
}
const { projects } = load("src/data/projects.ts");
const { projectOrigins } = load("src/data/projectOrigins.ts");
const { profileProjectOrigins, mergeProfileProjectOrigins } = load("src/data/profileProjectOrigins.ts");
const { localeOptions, localeCvAssets } = load("src/lib/i18n.ts");
const { knowledgeTopics, knowledgeMethods, graphNodeHref } = load("src/data/knowledgeGraph.ts");
const { portfolioKnowledgeGraph, profileKnowledgeData } = load("src/data/profileKnowledgeGraph.ts");
const { getProfileText } = load("src/lib/profileCopy.ts");
const records = [...profile.profileExperiences, ...profile.profileEducation];
const sourceById = new Map(profile.profileSources.map(source => [source.id, source]));
const projectIds = new Set(projects.map(project => project.slug));
const originIds = new Set(profileProjectOrigins.map(record => record.id));
const conceptIds = new Set([...knowledgeTopics, ...knowledgeMethods].map(concept => concept.id));
const groupIds = new Set(profile.profileSkillGroups.map(group => group.id));
const baselineDocuments = documents.getDocumentLibrary("en-GB");
const nodeById = new Map(portfolioKnowledgeGraph.nodes.map(node => [node.id, node]));
const desktopFile = ts.createSourceFile("SystemSevenDesktop.tsx", readFileSync(resolve(root, "src/components/SystemSevenDesktop.tsx"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let checks = 0;
function check(name, action) { action(); checks++; console.log(`PASS ${name}`); }
function nonempty(value, context) { assert.ok(typeof value === "string" && value.trim(), `${context} needs nonempty text`); }
function idsUnique(items, context) {
  const ids = items.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length, `${context} IDs must be unique`);
}
function references(owner, values, valid, name, required = false) {
  assert.ok(Array.isArray(values), `${owner}: ${name} must be an array`);
  if (required) assert.ok(values.length, `${owner}: ${name} must cite evidence`);
  assert.equal(new Set(values).size, values.length, `${owner}: duplicate ${name}`);
  for (const value of values) assert.ok(valid.has(value), `${owner}: unknown ${name} ${value}`);
}
function localFile(href) {
  const parsed = new URL(href, "https://portfolio.invalid");
  assert.equal(parsed.origin, "https://portfolio.invalid", `Expected a local public file: ${href}`);
  const decoded = decodeURIComponent(parsed.pathname);
  const target = resolve(publicRoot, `.${decoded}`);
  assert.ok(target.startsWith(`${publicRoot}${sep}`), `Path escapes public/: ${href}`);
  assert.ok(existsSync(target), `Missing public file: ${href}`);
  assert.ok(lstatSync(target).isFile(), `Public evidence must be a file, not a directory or symlink: ${href}`);
  assert.ok(realpathSync(target).startsWith(`${publicRoot}${sep}`), `Evidence resolves outside public/: ${href}`);
  return target;
}

function executeDesktopDeclarations(names, bindings = {}) {
  const declarations = names.map(name => {
    const declaration = desktopFile.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
    assert.ok(declaration, `Missing desktop declaration ${name}`);
    return declaration.getText(desktopFile);
  });
  const compiled = ts.transpileModule(`${declarations.join("\n")}\nexport { ${names.join(", ")} };`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const evaluated = { exports: {} };
  new Function("module", "exports", "require", ...Object.keys(bindings), compiled)(evaluated, evaluated.exports, require, ...Object.values(bindings));
  return evaluated.exports;
}

check("Profile anchors, sources and skill groups have unique stable IDs", () => {
  idsUnique(profile.profileSources, "Sources");
  idsUnique(profile.profileSkillGroups, "Skill groups");
  const anchored = [...records, ...profile.profileSkills, ...baselineDocuments];
  idsUnique(anchored, "Desktop anchors");
  for (const item of anchored) assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Unsafe public anchor ${item.id}`);
});

check("Source URLs point to real public files, known desktop routes or HTTPS pages", () => {
  const routes = new Set(["", "experience", "education", "skills", "documents", "projects", "sidequest", "coverd", "lab", "interests"]);
  for (const source of profile.profileSources) {
    nonempty(source.title, source.id);
    assert.match(source.href, /^(?:https:\/\/|\/(?!\/))/, `${source.id}: invalid public source URL`);
    const parsed = new URL(source.href, "https://portfolio.invalid");
    if (parsed.origin !== "https://portfolio.invalid") { assert.equal(parsed.protocol, "https:"); continue; }
    if (/\.[a-z\d]+$/i.test(parsed.pathname)) { localFile(source.href); continue; }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (localeOptions.some(option => option.slug === segments[0])) segments.shift();
    assert.ok(routes.has(segments.join("/")), `${source.id}: unknown desktop route`);
    if (parsed.searchParams.has("project")) assert.ok(projectIds.has(parsed.searchParams.get("project")), `${source.id}: unknown cited project`);
  }
});

check("Every record, capability, award and document cites known evidence", () => {
  for (const record of records) {
    references(record.id, record.sourceIds, sourceById, "sourceIds", true);
    references(record.id, record.conceptIds ?? [], conceptIds, "conceptIds");
    references(record.id, record.projectSlugs ?? [], projectIds, "projectSlugs");
    references(record.id, record.relatedProjectSlugs ?? [], projectIds, "relatedProjectSlugs");
    const direct = new Set(record.projectSlugs ?? []);
    assert.ok(!(record.relatedProjectSlugs ?? []).some(slug => direct.has(slug)), `${record.id}: direct and related provenance conflict`);
  }
  for (const skill of profile.profileSkills) {
    nonempty(skill.title, skill.id); nonempty(skill.description, skill.id);
    assert.ok(groupIds.has(skill.group), `${skill.id}: unknown capability group`);
    references(skill.id, skill.sourceIds, sourceById, "sourceIds", true);
    references(skill.id, skill.projectSlugs, projectIds, "projectSlugs");
    references(skill.id, skill.relatedProjectSlugs ?? [], projectIds, "relatedProjectSlugs");
    assert.ok(!(skill.relatedProjectSlugs ?? []).some(slug => skill.projectSlugs.includes(slug)), `${skill.id}: direct evidence and related context conflict`);
    references(skill.id, skill.originIds, originIds, "originIds");
    references(skill.id, skill.conceptIds, conceptIds, "conceptIds");
    assert.ok(skill.projectSlugs.length || skill.originIds.length, `${skill.id}: capability needs concrete project or role evidence`);
  }
  for (const award of profile.profileAwards) references(award.title, award.sourceIds, sourceById, "sourceIds", true);
  for (const document of baselineDocuments) {
    nonempty(document.description, document.id);
    references(document.id, document.sourceIds, sourceById, "sourceIds", true);
    references(document.id, document.originIds, originIds, "originIds");
    if (document.projectSlug) assert.ok(projectIds.has(document.projectSlug), `${document.id}: unknown project`);
  }
});

check("All four locale libraries select their actual CV edition and existing PDFs", () => {
  for (const { locale } of localeOptions) {
    const library = documents.getDocumentLibrary(locale);
    assert.equal(library.length, documents.supportingDocuments.length + 1, `${locale}: data determines document count`);
    assert.equal(library[0].id, "ai-cv");
    assert.equal(library[0].title, localeCvAssets[locale].title);
    assert.equal(library[0].src, localeCvAssets[locale].src);
    assert.ok(library.some(document => document.id === "growmat-showcase"));
    assert.ok(library.some(document => document.id === "italian-practice"));
    assert.ok(library.some(document => document.id === "italian-reading"));
    for (const document of library) {
      const file = localFile(document.src);
      assert.match(file, /\.pdf$/i);
      assert.equal(readFileSync(file).subarray(0, 5).toString("ascii"), "%PDF-", `${document.id}: expected actual PDF bytes`);
    }
  }
  for (const id of ["ai-cv", "growmat-showcase", "study-rl", "italian-practice", "italian-reading"]) {
    assert.ok(baselineDocuments.some(document => document.id === id), `Reviewed baseline document ${id} remains discoverable`);
  }
  const showcase = documents.supportingDocuments.find(document => document.id === "growmat-showcase");
  assert.equal(showcase.src, projects.find(project => project.slug === "growmat").artifacts.find(artifact => artifact.kind === "PDF").href);
  assert.equal(showcase.src, sourceById.get("growmat-showcase").href, "Showcase references agree; byte digest is enforced by check:artifacts");
});

if (!extensionFixture) check("The complete profile gate accepts an additional valid library PDF", () => {
  const output = execFileSync(process.execPath, [fileURLToPath(import.meta.url)], {
    cwd: root,
    env: { ...process.env, PROFILE_SIXTH_DOCUMENT_FIXTURE: "1" },
    encoding: "utf8",
    timeout: 30000,
  });
  assert.ok(output.includes(`${baselineDocuments.length + 1} documents`), "The full source/path/graph/library gate must pass with an additional document, without rewriting count assertions");
});

check("Degree modules and reported results remain faithful to the supplied CV", () => {
  const cv = readFileSync(resolve(root, "others/Samuel-Zhang-Applied-AI-CV.tex"), "utf8");
  const normalise = text => text.replaceAll("’", "'").replaceAll("\\&", "&").replaceAll("&", "and").toLowerCase();
  const cvText = normalise(cv);
  for (const degree of profile.profileEducation.filter(degree => degree.sourceIds.includes("cv"))) {
    assert.ok(cvText.includes(normalise(degree.title)), `${degree.id}: degree title must appear in cited CV`);
    assert.ok(cvText.includes(normalise(degree.result)), `${degree.id}: result must appear in cited CV`);
    assert.ok(degree.modules.length, `${degree.id}: substantive subjects are required`);
    for (const subject of degree.modules) assert.ok(cvText.includes(normalise(subject)), `${degree.id}: unsupported CV module ${subject}`);
  }
  const imperial = profile.profileEducation.find(degree => degree.id === "imperial");
  const kcl = profile.profileEducation.find(degree => degree.id === "kcl");
  assert.equal(imperial.result, "Predicted Distinction", "Do not turn a prediction into a confirmed degree result");
  assert.equal(kcl.result, "First-Class Honours");
  assert.ok(imperial.modules.includes("Machine Learning in Medical Imaging"));
  assert.ok(kcl.modules.includes("Computational Chemistry"));
  const teaching = profile.profileExperiences.find(record => record.id === "kcl-teaching");
  for (const evidence of ["20+", "80+", "100+"]) {
    assert.ok(teaching.copy.includes(evidence)); assert.ok(cv.includes(evidence));
  }
  const research = profile.profileExperiences.find(record => record.id === "kcl-research-2023");
  assert.match(research.copy, /protein–membrane/);
  assert.match(research.copy, /later, in 2025/, "Later GROMACS work must retain its distinct provenance");
});

check("Citations open the correct locale document and leave project-page evidence as a project", () => {
  for (const { locale, slug } of localeOptions) {
    assert.equal(documents.getProfileSourceHref("cv", locale), `/${slug}/documents#ai-cv`);
    assert.equal(documents.getProfileSourceHref("growmat-showcase", locale), `/${slug}/documents#growmat-showcase`);
    assert.equal(documents.getProfileSourceHref("archive:parliamo-italian-learning", locale), `/${slug}/projects?project=parliamo-italian-learning`);
    assert.equal(documents.getProfileSourceHref("isms-2025", locale), sourceById.get("isms-2025").href);
    assert.equal(documents.getProfileSourceHref("does-not-exist", locale), undefined);
  }
  const external = { id: "external-collision-fixture", title: "Synthetic external fixture", kind: "project", href: "https://external.invalid/projects/study-rl/syllabus.pdf" };
  profile.profileSources.push(external);
  documents.supportingDocuments.push({ id: "external-document-fixture", title: "Synthetic document fixture", meta: "Fixture", description: "Fixture", src: "/projects/study-rl/syllabus.pdf", sourceIds: [external.id], originIds: [] });
  try {
    assert.equal(documents.getProfileSourceHref(external.id, "en-GB"), external.href, "A same-named PDF on another domain must remain external");
  } finally {
    profile.profileSources.pop();
    documents.supportingDocuments.pop();
  }
  const querySource = { id: "query-identity-fixture", title: "Synthetic query fixture", kind: "project", href: "/evidence.pdf?edition=reviewed&v=old" };
  const queryDocument = { id: "query-document-fixture", title: "Synthetic query document", meta: "Fixture", description: "Fixture", src: "/evidence.pdf?edition=other&v=new", sourceIds: [querySource.id], originIds: [] };
  profile.profileSources.push(querySource);
  documents.supportingDocuments.push(queryDocument);
  try {
    assert.equal(documents.getProfileSourceHref(querySource.id, "en-GB"), querySource.href, "A different edition query cannot replace the cited PDF");
    queryDocument.src = "/evidence.pdf?edition=reviewed&v=new";
    assert.equal(documents.getProfileSourceHref(querySource.id, "en-GB"), "/en-gb/documents#query-document-fixture", "The local cache revision does not change document identity");
  } finally {
    profile.profileSources.pop();
    documents.supportingDocuments.pop();
  }
  const externalLocale = { id: "external-locale-fixture", title: "Synthetic external locale fixture", kind: "project", href: "https://example.org/en-gb/source.pdf" };
  profile.profileSources.push(externalLocale);
  try {
    assert.equal(documents.getProfileSourceHref(externalLocale.id, "zh-TW"), externalLocale.href, "External paths containing a locale stay unchanged");
    assert.equal(documents.getProfileSourceHref("archive:growmat", "zh-TW"), "/zh-tw/projects?project=growmat", "Local project routes use the chosen portfolio locale");
  } finally { profile.profileSources.pop(); }
});

check("Direct and related provenance extend through the shared resolver without false attribution", () => {
  const fixture = { id: "provenance-fixture", label: "Synthetic provenance fixture", description: "Synthetic fixture", section: "experience", projectSlugs: ["stock-market-engine"], relatedProjectSlugs: ["gromacs-hpc"] };
  const origins = mergeProfileProjectOrigins(projectOrigins, [fixture]);
  const resolved = origins.find(origin => origin.id === fixture.id);
  assert.deepEqual(resolved.projects, ["stock-market-engine", "gromacs-hpc"]);
  assert.deepEqual(resolved.relatedProjects, ["gromacs-hpc"]);
  assert.ok(!resolved.relatedProjects.includes("stock-market-engine"));
  assert.throws(() => mergeProfileProjectOrigins(projectOrigins, [{ ...fixture, relatedProjectSlugs: ["stock-market-engine"] }]), /Conflicting project provenance/);
  assert.ok(profileProjectOrigins.find(origin => origin.id === "kcl-research-2023").relatedProjects.includes("gromacs-hpc"));
});

check("Desktop, graph and translations consume the same profile records and public anchors", () => {
  for (const record of records) {
    const node = nodeById.get(`experience:${record.id}`);
    assert.ok(node, `Missing graph profile record ${record.id}`);
    assert.equal(node.anchor, record.id);
  }
  for (const skill of profile.profileSkills) {
    const node = nodeById.get(`skill:${skill.id}`);
    assert.equal(graphNodeHref(node, "en-gb"), `/en-gb/skills#${skill.id}`);
    for (const locale of ["zh-CN", "zh-TW"]) assert.notEqual(getProfileText(locale, skill.description), skill.description, `${skill.id}: evidence needs Mandarin copy`);
  }
  for (const document of baselineDocuments) {
    const node = nodeById.get(`document:${document.id}`);
    assert.equal(node.artifactHref, document.src);
    assert.equal(graphNodeHref(node, "en-gb"), `/en-gb/documents#${document.id}`);
  }
});

check("Actual document renderer supports PDFs without projects and CV actions select the CV", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const bindings = {
    ...profile,
    localeSlug: load("src/lib/i18n.ts").localeSlug,
    translateText: (_locale, text) => text,
    TranslationBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
    Image: ({ src, alt, width, height, "aria-hidden": hidden }) => React.createElement("img", { src, alt, width, height, "aria-hidden": hidden }),
    PixelIcon: () => null,
    getApplicationIcon: () => "pdf",
    CvNavigation: () => null,
    PdfPreview: () => null,
    ProfileSourceLinks: () => null,
    CareerProjectLinks: () => null,
    useState: () => ["standalone-document-fixture", () => {}],
    useMemo: factory => factory(),
    useEffect: () => {},
    getDocumentLibrary: documents.getDocumentLibrary,
  };
  const { DocumentsApp, ExperienceApp, EducationApp } = executeDesktopDeclarations(["DocumentsApp", "ExperienceApp", "EducationApp"], bindings);
  documents.supportingDocuments.push({ id: "standalone-document-fixture", title: "Synthetic standalone PDF", meta: "Fixture", description: "No project association", src: "/projects/study-rl/syllabus.pdf", sourceIds: ["archive:study-rl"], originIds: [] });
  try {
    const html = renderToStaticMarkup(React.createElement(DocumentsApp, { locale: "en-GB" }));
    assert.ok(!html.includes("project=undefined"), "A standalone PDF must not generate an undefined project link");
    assert.ok(!html.includes("Open related project"), "Standalone PDFs omit the unrelated project action");
    assert.ok(html.includes("document%3Astandalone-document-fixture"), "Standalone PDF keeps its graph navigation");
  } finally { documents.supportingDocuments.pop(); }
  for (const { locale, slug } of localeOptions) {
    for (const Component of [ExperienceApp, EducationApp]) {
      const html = renderToStaticMarkup(React.createElement(Component, { locale }));
      assert.ok(html.includes(`href="/${slug}/documents#ai-cv">View CV</a>`), `${Component.name}: CV action must choose the CV even if another PDF is open`);
    }
  }
});

check("Actual fragment decoder accepts encoded anchors and preserves malformed fragments without throwing", () => {
  const { desktopFragmentId } = executeDesktopDeclarations(["desktopFragmentId"]);
  for (const [input, expected] of [["#recovery", "recovery"], ["#%72ecovery", "recovery"], ["#growmat%2Dshowcase", "growmat-showcase"], ["#%", "%"], ["#%E0%A4%A", "%E0%A4%A"], ["", ""]]) {
    assert.equal(desktopFragmentId(input), expected);
  }
});

check("A new record, role-backed skill and PDF reach the actual adapter without renderer edits", () => {
  const fixtureId = "profile-extension-fixture";
  const fixtureSource = { id: "fixture-citation", title: "Synthetic extension fixture", kind: "project", href: "/projects/study-rl/syllabus.pdf" };
  const extendedProfile = {
    ...profile,
    profileSources: [...profile.profileSources, fixtureSource],
    profileExperiences: [...profile.profileExperiences, { id: fixtureId, period: "Fixture date", role: "Fixture role", company: "Fixture organisation", location: "Fixture location", tag: "FIXTURE", copy: "Synthetic extension check", sourceIds: [fixtureSource.id], conceptIds: ["evaluation"] }],
    profileSkills: [...profile.profileSkills, { id: "fixture-capability", title: "Synthetic capability", description: "Synthetic capability evidence", group: "evaluation", projectSlugs: [], originIds: [fixtureId], conceptIds: ["evaluation"], sourceIds: [fixtureSource.id] }],
  };
  const extensionLoader = createLoader(new Map([[resolve(root, "src/data/profile.ts"), extendedProfile]]));
  const extensionDocuments = extensionLoader("src/data/documents.ts");
  const extensionDocumentCount = extensionDocuments.getDocumentLibrary("zh-TW").length;
  extensionDocuments.supportingDocuments.push({ id: "fixture-document", title: "Synthetic library fixture", meta: "Fixture", description: "Synthetic document extension", src: fixtureSource.href, originIds: [fixtureId], sourceIds: [fixtureSource.id] });
  assert.equal(extensionDocuments.getDocumentLibrary("zh-TW").length, extensionDocumentCount + 1);
  const graph = extensionLoader("src/data/profileKnowledgeGraph.ts").portfolioKnowledgeGraph;
  const newOrigin = extensionLoader("src/data/profileProjectOrigins.ts").profileProjectOrigins.find(origin => origin.id === fixtureId);
  assert.ok(newOrigin, "The desktop link resolver must retain new records with no project");
  assert.equal(newOrigin.section, "experience");
  assert.deepEqual(newOrigin.projects, []);
  assert.ok(graph.nodes.some(node => node.id === `experience:${fixtureId}`));
  assert.ok(graph.nodes.some(node => node.id === "skill:fixture-capability"));
  assert.ok(graph.nodes.some(node => node.id === "document:fixture-document"));
  assert.ok(graph.edges.some(edge => edge.source === "skill:fixture-capability" && edge.target === `experience:${fixtureId}` && edge.relation === "practised-in"));
  assert.ok(graph.edges.some(edge => edge.source === "document:fixture-document" && edge.target === `experience:${fixtureId}` && edge.relation === "supports-record"));
  const expectedCollections = new Map([["ExperienceApp", "profileExperiences"], ["EducationApp", "profileEducation"], ["SkillsApp", "profileSkillGroups"], ["DocumentsApp", "documentLibrary"]]);
  for (const [app, collection] of expectedCollections) {
    const renderer = desktopFile.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === app);
    assert.ok(renderer?.body, `Missing ${app} renderer`);
    let iteratesRecords = false;
    const visit = node => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "map" && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === collection) iteratesRecords = true;
      ts.forEachChild(node, visit);
    };
    visit(renderer);
    assert.ok(iteratesRecords, `${app} must render its shared collection rather than a fixed set of cards`);
  }
});

console.log(`${checks} profile checks passed: ${records.length} records, ${profile.profileSkills.length} evidence-backed capabilities, ${baselineDocuments.length} documents and ${profileKnowledgeData.sources.length} public sources.`);
