#!/usr/bin/env node
/** Portable source-executing regression checks.
 * Pass the homepage root, or place this file inside its scripts/ directory.
 * This loads the actual TypeScript modules through the project's compiler.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');
const modules = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  if (modules.has(filename)) return modules.get(filename);
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const compiledModule = { exports: {} };
  const localRequire = (name) => name.startsWith('@/') ? load(`src/${name.slice(2)}.ts`) : name.startsWith('.')
    ? load(path.relative(root, path.resolve(path.dirname(filename), `${name}.ts`)))
    : require(name);
  new Function('module', 'exports', 'require', outputText)(compiledModule, compiledModule.exports, localRequire);
  modules.set(filename, compiledModule.exports);
  return compiledModule.exports;
}

const { projects } = load('src/data/projects.ts');
const { projectOrigins } = load('src/data/projectOrigins.ts');
const data = load('src/data/knowledgeGraph.ts');
const math = load('src/lib/knowledgeGraphMath.ts');
const { portfolioKnowledgeGraph: graph, profileKnowledgeData: profile } = load('src/data/profileKnowledgeGraph.ts');
const { knowledgeRelationLabel, knowledgeGraphExtensionCopy } = load('src/lib/knowledgeGraphRelations.ts');
const { mergeProfileProjectOrigins } = load('src/data/profileProjectOrigins.ts');
let count = 0;
function check(name, test) { test(); count++; console.log(`PASS ${name}`); }
const ids = new Set(graph.nodes.map((node) => node.id));
const byId = new Map(graph.nodes.map((node) => [node.id, node]));

/** Exercise the real component's rendered controls and callbacks. Browser-only
 * effects are inert; data, activity resolution, JSX and translations are real. */
function renderGraph(graphData, initialNode, locale, openActivity) {
  const React = require('react');
  const filename = path.join(root, 'src/components/projects/KnowledgeGraph.tsx');
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  const evaluated = { exports: {} };
  const hooks = { ...React,
    useCallback: fn => fn, useMemo: fn => fn(), useEffect: () => {},
    useState: value => [typeof value === 'function' ? value() : value, () => {}],
    useRef: value => ({ current: value }), useId: () => 'fixture-id', useContext: () => openActivity,
  };
  const localRequire = name => {
    if (name === 'react') return hooks;
    if (name === 'next/dynamic') return () => () => null;
    if (name.endsWith('.css')) return {};
    if (name === './ProjectWindowContext') return { ProjectWindowContext: {} };
    if (name === '@/data/profileKnowledgeGraph') return { portfolioKnowledgeGraph: graphData };
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
    return require(name);
  };
  new Function('module', 'exports', 'require', outputText)(evaluated, evaluated.exports, localRequire);
  const elements = [];
  const walk = value => {
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (React.isValidElement(value)) { elements.push(value); walk(value.props.children); }
  };
  walk(evaluated.exports.KnowledgeGraph({ active: false, initialNode, locale, onOpenProject: () => {} }));
  const text = value => Array.isArray(value) ? value.map(text).join('') : React.isValidElement(value) ? text(value.props.children) : value == null || typeof value === 'boolean' ? '' : String(value);
  return elements.map(element => ({ ...element, text: text(element.props.children) }));
}

// Capture the actual comparison calculation without running its optional UI.
function loadPortfolioComparison() {
  const filename = path.join(root, 'src/components/projects/PortfolioMap.tsx');
  const { outputText } = ts.transpileModule(`${fs.readFileSync(filename, 'utf8')}\nexport { relationship as auditRelationship };`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
  });
  const evaluated = { exports: {} };
  const localRequire = name => {
    if (name.endsWith('.css') || ['../ClassicSelect', './ProjectTranslationBoundary', './ModelLineageMap'].includes(name)) return {};
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(filename), `${name}.ts`)));
    return require(name);
  };
  new Function('module', 'exports', 'require', outputText)(evaluated, evaluated.exports, localRequire);
  return evaluated.exports.auditRelationship;
}

check('Every canonical project has exactly one discoverable topic-connected node', () => {
  assert.equal(graph.nodes.filter((node) => node.kind === 'project').length, projects.length);
  for (const project of projects) {
    assert.equal(graph.nodes.filter((node) => node.slug === project.slug).length, 1);
    assert.ok(graph.edges.some((edge) => edge.source === `project:${project.slug}` && edge.relation === 'explores'));
  }
});
check('Unique nodes and edges, complete endpoints, no self-links', () => {
  assert.equal(ids.size, graph.nodes.length);
  assert.equal(new Set(graph.edges.map((edge) => edge.id)).size, graph.edges.length);
  for (const edge of graph.edges) {
    assert.ok(ids.has(edge.source) && ids.has(edge.target), edge.id);
    assert.notEqual(edge.source, edge.target);
    assert.ok(edge.explanation.trim());
  }
});
check('Relations connect appropriate node kinds and origins contain only canonical projects', () => {
  const contracts = {
    explores: [['project'], ['topic']], uses: [['project'], ['method']], 'part-of': [['method'], ['topic']],
    'developed-in': [['project'], ['experience', 'education']],
    'evidenced-by': [['skill'], ['project', 'document']], 'practised-in': [['skill'], ['experience', 'education']],
    concerns: [['skill', 'experience', 'education'], ['topic', 'method']], covers: [['experience', 'education'], ['topic']],
    documents: [['document'], ['project']], 'supports-record': [['document'], ['experience', 'education']],
  };
  for (const edge of graph.edges) {
    if (edge.relation === 'related-context') {
      const pair = [byId.get(edge.source).kind, byId.get(edge.target).kind];
      assert.ok((pair[0] === 'project' && ['experience', 'education'].includes(pair[1])) || (pair[0] === 'skill' && pair[1] === 'project'), edge.id);
      continue;
    }
    assert.ok(contracts[edge.relation]?.[0].includes(byId.get(edge.source).kind), edge.id);
    assert.ok(contracts[edge.relation]?.[1].includes(byId.get(edge.target).kind), edge.id);
  }
  for (const origin of projectOrigins) for (const slug of origin.projects) assert.ok(projects.some((project) => project.slug === slug), `${origin.id}:${slug}`);
  const gromacs = graph.edges.find((edge) => edge.source === 'project:gromacs-hpc' && edge.target === 'experience:kcl-research-2023');
  assert.equal(gromacs?.relation, 'related-context');
});
check('Taxonomy identifiers and method parents stay valid as concepts grow', () => {
  assert.equal(new Set(data.knowledgeTopics.map((topic) => topic.id)).size, data.knowledgeTopics.length);
  assert.equal(new Set(data.knowledgeMethods.map((method) => method.id)).size, data.knowledgeMethods.length);
  const topics = new Set(data.knowledgeTopics.map((topic) => topic.id));
  for (const method of data.knowledgeMethods) {
    assert.ok(topics.has(method.topic), method.id);
    assert.ok(!topics.has(method.id), `${method.id} conflicts with a topic`);
  }
  for (const node of graph.nodes) assert.ok(topics.has(node.topic), node.id);
});
check('Application and text-processing links stay distinct from language-model training', () => {
  const targets = (slug) => new Set(graph.edges.filter((edge) => edge.source === `project:${slug}`).map((edge) => edge.target));
  for (const slug of ['coverd-ai', 'insurance-lead-matching']) {
    assert.ok(targets(slug).has('method:language-applications'), slug);
    assert.ok(!targets(slug).has('method:language-models'), slug);
    assert.ok(!targets(slug).has('topic:reinforcement-learning'), slug);
  }
  assert.ok(targets('cv-keyword-automator').has('method:language-processing'));
  assert.ok(!targets('cv-keyword-automator').has('method:language-models'));
  assert.ok(targets('study-rl').has('method:language-models'));
});
check('New projects work with area fallback and optional explicit concepts', () => {
  const added = { ...projects[0], slug: 'new-project-fixture', area: 'Systems' };
  delete added.concepts;
  const fallback = data.buildKnowledgeGraph([added], []);
  assert.ok(fallback.nodes.some((node) => node.id === 'project:new-project-fixture'));
  assert.ok(fallback.edges.some((edge) => edge.source === 'project:new-project-fixture' && edge.target === 'topic:infrastructure'));
  const declared = data.buildKnowledgeGraph([{ ...added, concepts: ['fourier-operators'] }], []);
  assert.ok(declared.edges.some((edge) => edge.target === 'method:fourier-operators' && edge.source === 'project:new-project-fixture'));
  assert.ok(declared.edges.some((edge) => edge.target === 'topic:scientific-ml' && edge.source === 'project:new-project-fixture'));
  const repeated = data.buildKnowledgeGraph([{ ...added, concepts: ['scientific-ml', 'fourier-operators', 'fourier-operators'] }], []);
  assert.equal(new Set(repeated.edges.map((edge) => edge.id)).size, repeated.edges.length);
});
check('Graph construction leaves project and origin input records unchanged', () => {
  const catalogue = structuredClone(projects), origins = structuredClone(projectOrigins), profileData = structuredClone(profile);
  const before = JSON.stringify({ catalogue, origins, profileData });
  data.buildKnowledgeGraph(catalogue, origins, profileData);
  assert.equal(JSON.stringify({ catalogue, origins, profileData }), before);
});
check('Unknown concepts are rejected instead of silently disappearing', () => {
  assert.throws(() => data.buildKnowledgeGraph([{ ...projects[0], concepts: ['unknown-concept'] }], []), /Unknown knowledge concept/);
});
check('Neighbour lookup is symmetric and includes exactly the incident edges', () => {
  for (const node of graph.nodes) {
    const neighbours = data.graphNeighbours(graph, node.id);
    assert.equal(neighbours.length, graph.edges.filter((edge) => edge.source === node.id || edge.target === node.id).length);
    for (const neighbour of neighbours) assert.ok(data.graphNeighbours(graph, neighbour.node.id).some((reverse) => reverse.node.id === node.id && reverse.edge.id === neighbour.edge.id));
  }
});
check('Timeline nodes retain CV dates and explicitly related projects keep that distinction', () => {
  for (const origin of projectOrigins) {
    const node = byId.get(`experience:${origin.id}`);
    assert.ok(node, origin.id);
    assert.equal(node.period, origin.period);
    for (const slug of origin.projects) {
      const edge = graph.edges.find((entry) => entry.source === `project:${slug}` && entry.target === node.id);
      assert.equal(edge?.relation, origin.relatedProjects?.includes(slug) ? 'related-context' : 'developed-in');
    }
  }
  for (const project of projects) assert.equal(byId.get(`project:${project.slug}`).period, project.year);
});
check('Every profile record, skill and document is represented with its cited evidence', () => {
  for (const record of profile.records) {
    const node = byId.get(`experience:${record.id}`);
    assert.equal(node.kind, record.section);
    assert.equal(node.description, record.description);
    assert.deepEqual(node.sources.map(source => source.id), [...new Set(record.sourceIds)]);
  }
  for (const skill of profile.skills) {
    const id = `skill:${skill.id}`;
    assert.equal(byId.get(id).kind, 'skill');
    for (const slug of skill.projectSlugs) assert.ok(graph.edges.some(edge => edge.source === id && edge.target === `project:${slug}` && edge.relation === 'evidenced-by'));
    for (const slug of skill.relatedProjectSlugs ?? []) assert.ok(graph.edges.some(edge => edge.source === id && edge.target === `project:${slug}` && edge.relation === 'related-context'));
    for (const originId of skill.originIds) assert.ok(graph.edges.some(edge => edge.source === id && edge.target === `experience:${originId}` && edge.relation === 'practised-in'));
  }
  for (const document of profile.documents) {
    const id = `document:${document.id}`;
    assert.equal(byId.get(id).artifactHref, document.src);
    assert.ok(data.graphNeighbours(graph, id).length, `${id} should connect to its sources' records or work`);
    if (document.projectSlug) assert.ok(graph.edges.some(edge => edge.source === id && edge.target === `project:${document.projectSlug}` && edge.relation === 'documents'));
    for (const originId of document.originIds) assert.ok(graph.edges.some(edge => edge.source === id && edge.target === `experience:${originId}` && edge.relation === 'supports-record'));
  }
  const cv = byId.get('document:ai-cv');
  assert.ok(data.graphNeighbours(graph, cv.id).some(entry => entry.node.id === 'experience:marsh'));
  assert.ok(data.graphNeighbours(graph, 'skill:data-modelling').some(entry => entry.node.id === 'document:growmat-showcase'));
});
check('New source-backed experiences and skills link without editing graph code', () => {
  const fixture = {
    sources: [{ id: 'fixture-note', title: 'Source note', href: '/fixture-note.pdf' }],
    records: [{ id: 'future-experience', label: 'Future experience', description: 'A sourced teaching record.', section: 'experience', period: '2027', sourceIds: ['fixture-note'], conceptIds: ['learning-tools'] }],
    skills: [{ id: 'future-skill', title: 'New teaching skill', description: 'A sourced teaching activity.', projectSlugs: [], originIds: ['future-experience'], conceptIds: ['learning-tools'], sourceIds: ['fixture-note'] }],
    documents: [{ id: 'future-note', title: 'New source note', description: 'Evidence for the teaching activity.', src: '/fixture-note.pdf', sourceIds: ['fixture-note'] }],
  };
  const result = data.buildKnowledgeGraph([], [], fixture);
  assert.ok(result.nodes.some(node => node.id === 'experience:future-experience'));
  for (const [source, target, relation] of [
    ['experience:future-experience', 'topic:products', 'concerns'],
    ['experience:future-experience', 'method:learning-tools', 'concerns'],
    ['skill:future-skill', 'experience:future-experience', 'practised-in'],
    ['skill:future-skill', 'document:future-note', 'evidenced-by'],
    ['document:future-note', 'experience:future-experience', 'supports-record'],
  ]) assert.ok(result.edges.some(edge => edge.source === source && edge.target === target && edge.relation === relation), `${source}:${relation}:${target}`);
  const originOnly = data.buildKnowledgeGraph([], [{ id: 'unpublished-work', label: 'Unpublished work', context: 'A public record with no publishable project.', section: 'experience', projects: [] }]);
  assert.ok(originOnly.nodes.some(node => node.id === 'experience:unpublished-work'));
});
check('Invalid or unsupported future records fail visibly without losing links', () => {
  const baseSkill = { id: 'fixture', title: 'Fixture', description: 'Fixture evidence.', projectSlugs: [], originIds: [], conceptIds: [], sourceIds: [] };
  assert.throws(() => data.buildKnowledgeGraph([], [], { skills: [baseSkill] }), /lacks evidence/);
  assert.throws(() => data.buildKnowledgeGraph([], [], { skills: [{ ...baseSkill, originIds: ['unknown'] }] }), /Unknown knowledge reference/);
  assert.throws(() => data.buildKnowledgeGraph([], [], { records: [{ id: 'fixture', label: 'Fixture', section: 'education', description: 'Fixture', sourceIds: ['unknown'] }] }), /Unknown knowledge source/);
  assert.throws(() => data.buildKnowledgeGraph([], [], { sources: [{ id: 'private', title: 'Private path', href: 'file:\/\/private.pdf' }], documents: [{ id: 'fixture', title: 'Fixture', description: 'Fixture', src: '/public.pdf', sourceIds: ['private'] }] }), /Invalid public knowledge source URL/);
  assert.throws(() => data.buildKnowledgeGraph([], [], { documents: [{ id: 'fixture', title: 'Fixture', description: 'Fixture', src: '/not-a-pdf', sourceIds: [] }] }), /Invalid public knowledge document URL/);
  assert.throws(() => data.buildKnowledgeGraph([projects[0], projects[0]], []), /Duplicate knowledge node/);
});
check('Related project context never becomes evidence that its subjects were practised in a role', () => {
  const edges = graph.edges.filter(edge => edge.source === 'experience:kcl-research-2023');
  assert.ok(!edges.some(edge => edge.relation === 'covers'));
  assert.ok(graph.edges.some(edge => edge.source === 'project:gromacs-hpc' && edge.target === 'experience:kcl-research-2023' && edge.relation === 'related-context'));
});
check('Teaching coursework remains related context while the role and CV substantiate teaching', () => {
  const teaching = byId.get('skill:teaching');
  const coursework = byId.get('project:coding-series');
  const connection = graph.edges.find(edge => edge.source === teaching.id && edge.target === coursework.id);
  assert.equal(connection?.relation, 'related-context');
  assert.equal(knowledgeRelationLabel(teaching, coursework, connection.relation), 'Related subject context');
  assert.equal(knowledgeRelationLabel(coursework, teaching, connection.relation), 'Related subject context');
  assert.ok(graph.edges.some(edge => edge.source === teaching.id && edge.target === 'experience:kcl-teaching' && edge.relation === 'practised-in'));
  assert.ok(graph.edges.some(edge => edge.source === teaching.id && edge.target === 'document:ai-cv' && edge.relation === 'evidenced-by'));
  const fixture = {
    sources: [{ id: 'teaching-note', title: 'Teaching record', href: '/teaching-note.pdf' }],
    records: [{ id: 'new-teaching-role', label: 'Future teaching role', description: 'A real teaching engagement.', section: 'experience', sourceIds: ['teaching-note'] }],
    skills: [{ id: 'new-teaching', title: 'New teaching capability', description: 'Teaching proven by the role, with subject context from a different archive.', projectSlugs: [], relatedProjectSlugs: ['coding-series'], originIds: ['new-teaching-role'], conceptIds: ['learning-tools'], sourceIds: ['teaching-note'] }],
  };
  const result = data.buildKnowledgeGraph(projects, [], fixture);
  const related = result.edges.filter(edge => edge.source === 'skill:new-teaching' && edge.target === coursework.id);
  assert.deepEqual(related.map(edge => edge.relation), ['related-context']);
  const conflicting = structuredClone(fixture); conflicting.skills[0].projectSlugs.push('coding-series');
  assert.throws(() => data.buildKnowledgeGraph(projects, [], conflicting), /Conflicting skill project evidence/);
  const unknown = structuredClone(fixture); unknown.skills[0].relatedProjectSlugs.push('missing-project');
  assert.throws(() => data.buildKnowledgeGraph(projects, [], unknown), /Unknown knowledge project/);
});
check('Assessed venture writing supplies context without claiming actual customer discovery or ownership', () => {
  const skill = byId.get('skill:product-discovery'), exercise = byId.get('project:ai-venture-reasoning');
  const connection = graph.edges.find(edge => edge.source === skill.id && edge.target === exercise.id);
  assert.equal(connection?.relation, 'related-context');
  for (const [selected, neighbour] of [[skill, exercise], [exercise, skill]]) assert.equal(knowledgeRelationLabel(selected, neighbour, connection.relation), 'Related subject context');
  for (const slug of ['coverd-ai', 'growmat']) assert.ok(graph.edges.some(edge => edge.source === skill.id && edge.target === `project:${slug}` && edge.relation === 'evidenced-by'));
  for (const origin of ['coverd', 'pfizer', 'pfizer-placement']) assert.ok(graph.edges.some(edge => edge.source === skill.id && edge.target === `experience:${origin}` && edge.relation === 'practised-in'));
});
check('Project comparisons distinguish direct work, education and related context in either direction', () => {
  const relationship = loadPortfolioComparison();
  const { portfolioCopy } = load('src/components/projects/copy/portfolioCopy.ts');
  const { projectText } = load('src/lib/projectCopy.ts');
  const get = slug => projects.find(project => project.slug === slug);
  for (const [left, right, prefix, originId] of [
    ['coverd-ai', 'cv-keyword-automator', 'Related research context', 'coverd'],
    ['coverd-ai', 'coverd-yasa', 'Work context', 'coverd'],
    ['microrobot-vision', 'trustworthy-mri-reconstruction', 'Education context', 'imperial'],
  ]) {
    const label = projectOrigins.find(origin => origin.id === originId).label;
    for (const [a, b] of [[left, right], [right, left]]) {
      const signals = relationship(get(a), get(b)).signals;
      const source = `${prefix} · ${label}`;
      assert.ok(signals.includes(source), `${a} / ${b}: ${source}`);
      assert.equal(signals.filter(signal => signal.endsWith(` · ${label}`)).length, 1);
      for (const locale of ['zh-CN', 'zh-TW']) {
        const translated = projectText(locale, portfolioCopy, source);
        const expected = portfolioCopy[`${prefix} · {0}`][locale === 'zh-CN' ? 0 : 1].replace('{0}', label);
        // The origin label may itself have a core translation; the relation
        // prefix must always retain the reviewed distinction.
        assert.ok(translated.startsWith(expected.split(' · ')[0]), `${locale}: ${source}`);
        assert.notEqual(translated, source);
      }
    }
  }
});
check('Document controls open only declared project PDFs and keep library-only additions navigable', () => {
  const fixture = {
    id: 'future-library-paper', title: 'Additional related paper', description: 'A reviewed library PDF linked to a project with no matching artifact.',
    src: '/Samuel-Zhang-Applied-AI-CV.pdf', projectSlug: 'neural-cfd-surrogates', originIds: ['imperial'], sourceIds: ['cv'],
  };
  const future = data.buildKnowledgeGraph(projects, projectOrigins, { ...profile, documents: [...profile.documents, fixture] });
  const { resolveProjectActivity } = load('src/lib/projectActivity.ts');
  for (const locale of ['en-GB', 'en-US', 'zh-CN', 'zh-TW']) {
    const actions = [];
    const fallback = renderGraph(future, 'document:future-library-paper', locale, request => actions.push(request));
    const documentLink = fallback.find(element => element.type === 'a' && element.props.href === `/${locale.toLowerCase()}/documents#${fixture.id}`);
    assert.ok(documentLink, `${locale}: a library-only paper needs a document-record action`);
    assert.ok(documentLink.props.className.includes('is-primary'));
    assert.ok(!fallback.some(element => element.type === 'button' && element.props.className?.includes('is-primary')), `${locale}: an undeclared PDF activity must not be offered`);
    assert.deepEqual(actions, []);
    const declared = renderGraph(future, 'document:growmat-showcase', locale, request => actions.push(request));
    const pdfButton = declared.find(element => element.type === 'button' && element.props.className?.includes('is-primary'));
    assert.ok(pdfButton, `${locale}: the declared showcase should open directly`);
    pdfButton.props.onClick();
    assert.deepEqual(actions, [{ slug: 'growmat', kind: 'pdf', artifactHref: '/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf' }]);
    assert.deepEqual(resolveProjectActivity(actions[0].slug, actions[0].kind, actions[0].artifactHref), actions[0]);
    const standalone = renderGraph(future, 'document:growmat-showcase', locale, null);
    assert.ok(standalone.some(element => element.type === 'a' && element.props.href === `/${locale.toLowerCase()}/documents#growmat-showcase`));
  }
});
check('Extension relation labels express both traversal directions and have CN/TW translations', () => {
  for (const [source, pair] of Object.entries(knowledgeGraphExtensionCopy)) {
    assert.equal(pair.length, 2);
    assert.ok(pair.every(value => value.trim() && value !== source), source);
    assert.ok(!/数据|项目|文档|记录/.test(pair[1]), `Traditional terminology: ${source}`);
  }
  for (const edge of graph.edges.filter(edge => ['evidenced-by', 'practised-in', 'documents', 'supports-record', 'covers', 'concerns'].includes(edge.relation))) {
    const a = byId.get(edge.source), b = byId.get(edge.target);
    for (const label of [knowledgeRelationLabel(a, b, edge.relation), knowledgeRelationLabel(b, a, edge.relation)]) assert.ok(knowledgeGraphExtensionCopy[label], `${edge.id}: ${label}`);
  }
  assert.equal(knowledgeRelationLabel(byId.get('skill:data-modelling'), byId.get('project:growmat'), 'evidenced-by'), 'Evidence for this skill');
  assert.equal(knowledgeRelationLabel(byId.get('project:growmat'), byId.get('skill:data-modelling'), 'evidenced-by'), 'Skill demonstrated in this project');
});
check('Adding an experience once updates direct and related project provenance without a duplicate origin', () => {
  const direct = { ...projects[0], slug: 'future-product', concepts: ['products', 'local-first'] };
  const related = { ...projects[0], slug: 'later-science', concepts: ['scientific-ml', 'inverse-problems'] };
  const records = [{ id: 'future-role', label: 'Future role', section: 'experience', description: 'Public source-backed role.', period: '2027', projectSlugs: [direct.slug], relatedProjectSlugs: [related.slug], sourceIds: ['fixture-source'] }];
  const before = JSON.stringify(records);
  const origins = mergeProfileProjectOrigins([], records);
  assert.equal(origins.length, 1);
  assert.deepEqual(origins[0].projects, [direct.slug, related.slug]);
  assert.deepEqual(origins[0].relatedProjects, [related.slug]);
  assert.equal(JSON.stringify(records), before);
  const future = data.buildKnowledgeGraph([direct, related], origins, { records, sources: [{ id: 'fixture-source', title: 'Source PDF', href: '/fixture.pdf' }] });
  const edgeToRole = slug => future.edges.find(edge => edge.source === `project:${slug}` && edge.target === 'experience:future-role');
  assert.equal(edgeToRole(direct.slug)?.relation, 'developed-in');
  assert.equal(edgeToRole(related.slug)?.relation, 'related-context');
  const subjects = future.edges.filter(edge => edge.source === 'experience:future-role' && edge.relation === 'covers').map(edge => edge.target);
  assert.ok(subjects.includes('topic:products'));
  assert.ok(!subjects.includes('topic:scientific-ml'), 'A later related project must not establish subjects practised in the role');
  assert.throws(() => mergeProfileProjectOrigins(origins, [{ ...records[0], projectSlugs: [related.slug], relatedProjectSlugs: [] }]), /Conflicting project provenance/);
  assert.throws(() => mergeProfileProjectOrigins([], [{ ...records[0], relatedProjectSlugs: [direct.slug] }]), /Conflicting project provenance/);
  const updated = mergeProfileProjectOrigins(origins, [{ ...records[0], period: '2027 — 2028', projectSlugs: undefined, relatedProjectSlugs: undefined }]);
  assert.equal(updated[0].period, '2027 — 2028');
  assert.equal(updated[0].context, origins[0].context);
});
check('A generic project citation or different external PDF does not prove its local attachment', () => {
  const fixtures = {
    sources: [
      { id: 'project-page', title: 'Generic case study', href: '/en-gb/projects?project=fixture' },
      { id: 'external-pdf', title: 'Different PDF on another host', href: 'https://example.org/evidence.pdf' },
      { id: 'exact-pdf', title: 'The cited PDF', href: '/evidence.pdf?v=previous-cache' },
    ],
    records: [{ id: 'fixture-record', label: 'Fixture record', section: 'experience', description: 'A sourced record.', sourceIds: ['project-page', 'external-pdf'] }],
    skills: [{ id: 'fixture-skill', title: 'Fixture skill', description: 'A skill cited to its case study.', projectSlugs: [], originIds: [], conceptIds: ['products'], sourceIds: ['project-page', 'external-pdf'] }],
    documents: [{ id: 'attachment', title: 'An attachment', description: 'A PDF associated with the project page.', src: '/evidence.pdf?v=current-cache', sourceIds: ['project-page', 'external-pdf', 'exact-pdf'] }],
  };
  const unrelated = data.buildKnowledgeGraph([], [], fixtures);
  assert.ok(!unrelated.edges.some(edge => edge.source === 'document:attachment' && edge.relation === 'supports-record'));
  assert.ok(!unrelated.edges.some(edge => edge.target === 'document:attachment' && edge.relation === 'evidenced-by'));
  const cited = structuredClone(fixtures);
  cited.records[0].sourceIds.push('exact-pdf');
  cited.skills[0].sourceIds.push('exact-pdf');
  const connected = data.buildKnowledgeGraph([], [], cited);
  assert.ok(connected.edges.some(edge => edge.source === 'document:attachment' && edge.target === 'experience:fixture-record' && edge.relation === 'supports-record'));
  const skillEvidence = connected.edges.find(edge => edge.source === 'skill:fixture-skill' && edge.target === 'document:attachment');
  assert.equal(skillEvidence?.relation, 'evidenced-by');
  assert.deepEqual(skillEvidence.sourceIds, ['exact-pdf']);
  const differentEdition = structuredClone(cited);
  differentEdition.documents[0].src = '/evidence.pdf?variant=different-edition';
  const editionGraph = data.buildKnowledgeGraph([], [], differentEdition);
  assert.ok(!editionGraph.edges.some(edge => edge.target === 'document:attachment' && edge.relation === 'evidenced-by'), 'A semantic query parameter may identify a different PDF edition');
});
check('Focused traversals stay centred with unique deterministic neighbour positions', () => {
  for (const node of graph.nodes) {
    const visible = math.visibleKnowledgeNodes(graph, node.id, true, true);
    const layout = math.layoutKnowledgeFocus(graph, node.id, visible);
    assert.deepEqual(layout.get(node.id), { x: 0, y: 0, z: 0 });
    assert.deepEqual(layout, math.layoutKnowledgeFocus(graph, node.id, visible));
    assert.equal(layout.size, visible.size);
    assert.equal(new Set([...layout.values()].map((point) => `${point.x},${point.y},${point.z}`)).size, visible.size);
    for (const point of layout.values()) assert.ok(Object.values(point).every(Number.isFinite));
  }
});
check('Focused views retain depth in 3D and distribute cross-topic neighbours evenly', () => {
  for (const selectedId of ['topic:human-systems', 'topic:scientific-ml', 'project:neural-cfd-surrogates', 'experience:imperial']) {
    const visible = math.visibleKnowledgeNodes(graph, selectedId, true, true);
    const focused = math.layoutKnowledgeFocus(graph, selectedId, visible);
    assert.ok([...focused.values()].some((point) => Math.abs(point.z) > 10), selectedId);
    const flat = math.layoutKnowledgeFocus(graph, selectedId, visible, true);
    assert.ok([...flat.values()].every((point) => point.z === 0));
  }
  const selectedId = 'topic:human-systems';
  const visible = math.visibleKnowledgeNodes(graph, selectedId, true, true);
  const neighbours = [...math.layoutKnowledgeFocus(graph, selectedId, visible)]
    .filter(([id]) => id !== selectedId).map(([, point]) => point);
  const distances = neighbours.map(point => Math.hypot(point.x, point.y, point.z));
  const rings = Math.ceil(neighbours.length / 14);
  assert.ok(Math.max(...distances) / Math.min(...distances) < 1.35 + (rings - 1) * .6, 'Neighbour distances stay bounded by the focused layout rings');
  const centre = neighbours.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  assert.ok(Math.hypot(centre.x, centre.y) / neighbours.length < Math.min(...distances) * .2, 'Neighbours balance around the selected node');
  assert.equal(new Set(neighbours.map(point => `${point.x >= 0},${point.y >= 0}`)).size, 4, 'Use all four quadrants');
});
check('Rotation changes orientation and depth while shift-drag only changes pan', () => {
  const base = { ...math.initialGraphCamera, panX: 17, panY: -9 };
  const rotated = math.dragKnowledgeCamera(base, 80, -40, false);
  assert.equal(rotated.panX, base.panX); assert.equal(rotated.panY, base.panY);
  assert.notEqual(rotated.yaw, base.yaw); assert.notEqual(rotated.pitch, base.pitch);
  assert.equal(math.dragKnowledgeCamera(base, 0, 99999, false).pitch, 1.2);
  assert.equal(math.dragKnowledgeCamera(base, 0, -99999, false).pitch, -1.2);
  const panned = math.dragKnowledgeCamera(base, 80, -40, true);
  assert.deepEqual(panned, { ...base, panX: 97, panY: -49 });
  const point = { x: 150, y: 90, z: 125 };
  const before = math.projectKnowledgePoint(point, base, 900, 500);
  const after = math.projectKnowledgePoint(point, rotated, 900, 500);
  assert.notEqual(before.x, after.x); assert.notEqual(before.z, after.z);
  const front = math.projectKnowledgePoint({ x: 50, y: 0, z: -200 }, { ...base, yaw: 0, pitch: 0 }, 900, 500);
  const back = math.projectKnowledgePoint({ x: 50, y: 0, z: 200 }, { ...base, yaw: 0, pitch: 0 }, 900, 500);
  assert.ok(front.scale > back.scale);
});
check('Fit view frames the visible 2D or 3D geometry at mobile and desktop sizes', () => {
  for (const flat of [false, true]) for (const selectedId of [null, 'project:neural-cfd-surrogates', 'experience:imperial']) {
    const visible = math.visibleKnowledgeNodes(graph, selectedId, !!selectedId, !!selectedId);
    const positions = selectedId ? math.layoutKnowledgeFocus(graph, selectedId, visible, flat) : math.layoutKnowledgeGraph(graph);
    const points = [...visible].map((id) => positions.get(id));
    for (const [width, height] of [[320, 350], [800, 490], [1400, 600]]) {
      const original = { ...math.initialGraphCamera, yaw: .7, pitch: -.4, zoom: 2, panX: 900, panY: -400 };
      const camera = math.fitKnowledgeCamera(points, width, height, flat, original);
      assert.equal(camera.yaw, original.yaw); assert.equal(camera.pitch, original.pitch);
      for (const point of points) {
        const projected = math.projectKnowledgePoint(point, camera, width, height, flat);
        assert.ok(projected.x > 0 && projected.x < width, `${selectedId}:${projected.x}/${width}`);
        assert.ok(projected.y > 0 && projected.y < height, `${selectedId}:${projected.y}/${height}`);
      }
    }
  }
});
const makeTransitionScene = (selectedId = null) => {
  const visible = math.visibleKnowledgeNodes(graph, selectedId, !!selectedId, !!selectedId);
  const positions = selectedId ? math.layoutKnowledgeFocus(graph, selectedId, ids) : math.layoutKnowledgeGraph(graph);
  return {
    camera: math.fitKnowledgeCamera([...visible].map((id) => positions.get(id)), 900, 500, false),
    positions,
    opacity: new Map([...ids].map((id) => [id, visible.has(id) ? 1 : 0])),
  };
};
check('Scene transitions preserve exact endpoints, clamp progress and leave inputs unchanged', () => {
  const from = makeTransitionScene(), to = makeTransitionScene('project:neural-cfd-surrogates');
  const before = structuredClone({ from, to });
  assert.equal(math.interpolateKnowledgeScene(from, to, 0), from);
  assert.equal(math.interpolateKnowledgeScene(from, to, -10), from);
  assert.equal(math.interpolateKnowledgeScene(from, to, 1), to);
  assert.equal(math.interpolateKnowledgeScene(from, to, 10), to);
  math.interpolateKnowledgeScene(from, to, .35);
  assert.deepEqual({ from, to }, before);
});
check('Camera zoom follows ratios while 3D positions and visibility ease between scenes', () => {
  const from = makeTransitionScene(), to = makeTransitionScene('project:neural-cfd-surrogates');
  from.camera = { yaw: -.8, pitch: -.2, zoom: .5, panX: -60, panY: 30 };
  to.camera = { yaw: .4, pitch: .6, zoom: 2, panX: 40, panY: -20 };
  const middle = math.interpolateKnowledgeScene(from, to, .5);
  assert.ok(Math.abs(middle.camera.zoom - 1) < 1e-12);
  assert.ok(Math.abs(middle.camera.yaw + .2) < 1e-12);
  assert.ok(Math.abs(middle.camera.pitch - .2) < 1e-12);
  assert.equal(middle.camera.panX, -10); assert.equal(middle.camera.panY, 5);
  const fades = { entering: 0, leaving: 0, staying: 0 };
  for (const id of ids) {
    const a = from.positions.get(id), b = to.positions.get(id), p = middle.positions.get(id);
    for (const axis of ['x', 'y', 'z']) assert.ok(Math.abs(p[axis] - (a[axis] + b[axis]) / 2) < 1e-12);
    const start = from.opacity.get(id), end = to.opacity.get(id);
    assert.equal(middle.opacity.get(id), (start + end) / 2);
    if (start < end) fades.entering++;
    if (start > end) fades.leaving++;
    if (start === 1 && end === 1) fades.staying++;
  }
  assert.ok(fades.entering > 0 && fades.leaving > 0 && fades.staying > 0);
  let previousZoom = from.camera.zoom;
  for (const progress of [.01, .1, .25, .5, .75, .9, .99]) {
    const frame = math.interpolateKnowledgeScene(from, to, progress);
    assert.ok(frame.camera.zoom > previousZoom && frame.camera.zoom < to.camera.zoom);
    previousZoom = frame.camera.zoom;
    for (const opacity of frame.opacity.values()) assert.ok(opacity >= 0 && opacity <= 1);
  }
});
check('Intermediate projected motion stays continuous while neighbours gather around the selection', () => {
  const from = makeTransitionScene(), to = makeTransitionScene('project:neural-cfd-surrogates');
  const id = 'project:neural-cfd-surrogates', otherId = 'experience:imperial';
  const project = (scene) => math.projectKnowledgePoint(scene.positions.get(id), scene.camera, 900, 500);
  const start = project(from), end = project(to);
  const middle = project(math.interpolateKnowledgeScene(from, to, .5));
  assert.ok(Math.hypot(middle.x - start.x, middle.y - start.y) > 1);
  assert.ok(Math.hypot(middle.x - end.x, middle.y - end.y) > 1);
  const before = project(math.interpolateKnowledgeScene(from, to, .5 - 1e-5));
  const after = project(math.interpolateKnowledgeScene(from, to, .5 + 1e-5));
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y) < .1);
  const separation = (scene) => {
    const a = scene.positions.get(id), b = scene.positions.get(otherId);
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  };
  const original = separation(from), target = separation(to);
  for (const progress of [.1, .5, .9]) {
    const frame = math.interpolateKnowledgeScene(from, to, progress);
    for (const [axis, value] of Object.entries(separation(frame))) {
      assert.ok(value >= Math.min(original[axis], target[axis]) - 1e-10);
      assert.ok(value <= Math.max(original[axis], target[axis]) + 1e-10);
    }
  }
});
check('An interrupted transition rebases from the displayed positions, camera and fades', () => {
  const overview = makeTransitionScene(), firstTarget = makeTransitionScene('project:neural-cfd-surrogates');
  const displayed = math.interpolateKnowledgeScene(overview, firstTarget, .37);
  const nextTarget = makeTransitionScene('experience:pfizer');
  assert.equal(math.interpolateKnowledgeScene(displayed, nextTarget, 0), displayed);
  assert.equal(math.interpolateKnowledgeScene(displayed, nextTarget, 1), nextTarget);
  const firstFrame = math.interpolateKnowledgeScene(displayed, nextTarget, .001);
  for (const id of ids) {
    const start = math.projectKnowledgePoint(displayed.positions.get(id), displayed.camera, 900, 500);
    const resumed = math.projectKnowledgePoint(firstFrame.positions.get(id), firstFrame.camera, 900, 500);
    assert.ok(Math.hypot(resumed.x - start.x, resumed.y - start.y) < .1, id);
    assert.ok(Math.abs(firstFrame.opacity.get(id) - displayed.opacity.get(id)) < 1e-5);
  }
});
check('Every node has a finite deterministic layout coordinate', () => {
  const first = math.layoutKnowledgeGraph(graph);
  assert.deepEqual(first, math.layoutKnowledgeGraph(graph));
  assert.equal(first.size, graph.nodes.length);
  for (const point of first.values()) for (const value of Object.values(point)) assert.ok(Number.isFinite(value));
});
check('Projection is finite across supported camera and viewport ranges', () => {
  for (const point of math.layoutKnowledgeGraph(graph).values()) {
    for (const width of [320, 800, 1600]) for (const zoom of [.45, 1, 3.5]) for (const yaw of [-3, 0, 3]) {
      const projected = math.projectKnowledgePoint(point, { yaw, pitch: 1.2, zoom, panX: 0, panY: 0 }, width, 580);
      assert.ok(Object.values(projected).every(Number.isFinite));
      assert.ok(projected.scale > 0);
    }
  }
  const camera = { yaw: .5, pitch: -.8, zoom: 1, panX: 10, panY: -8 };
  const origin = math.projectKnowledgePoint({ x: 0, y: 0, z: 0 }, camera, 800, 580);
  assert.equal(origin.x, 410); assert.equal(origin.y, 282);
});
check('2D projection ignores yaw, pitch, and depth but preserves pan and zoom', () => {
  const point = { x: 90, y: -50, z: 200 };
  const camera = { ...math.initialGraphCamera, panX: 3, panY: 7 };
  assert.deepEqual(math.projectKnowledgePoint(point, camera, 800, 580, true), math.projectKnowledgePoint({ ...point, z: -200 }, { ...camera, yaw: 2, pitch: -1 }, 800, 580, true));
});
check('Hit testing picks frontmost overlap and honours minimum touch radius', () => {
  const node = graph.nodes[0];
  const far = { node, x: 100, y: 100, z: 80, radius: 5, scale: 1 };
  const near = { ...far, node: graph.nodes[1], z: -80 };
  assert.equal(math.pickKnowledgeNode([far, near], 100, 100), near);
  assert.equal(math.pickKnowledgeNode([far], 114, 100), far);
  assert.equal(math.pickKnowledgeNode([far], 114.01, 100), undefined);
});
check('Labels are clickable without stealing a nearby node target', () => {
  const node = graph.nodes[0];
  const labelled = { node, x: 100, y: 100, z: 0, radius: 5, scale: 1, labelBounds: { x: 30, y: 120, width: 140, height: 23 } };
  const neighbour = { node: graph.nodes[1], x: 120, y: 130, z: 0, radius: 5, scale: 1 };
  assert.equal(math.pickKnowledgeNode([labelled], 40, 130), labelled);
  assert.equal(math.pickKnowledgeNode([labelled, neighbour], 120, 130), neighbour);
  assert.equal(math.pickKnowledgeNode([labelled], 40, 150), undefined);
});
check('Local views preserve selected nodes and respect method visibility', () => {
  for (const node of graph.nodes) for (const showMethods of [false, true]) {
    const visible = math.visibleKnowledgeNodes(graph, node.id, showMethods, true);
    assert.ok(visible.has(node.id));
    assert.ok(visible.size <= 120);
    for (const id of visible) {
      assert.ok(id === node.id || data.graphNeighbours(graph, node.id).some((entry) => entry.node.id === id));
      if (!showMethods && id !== node.id) assert.notEqual(byId.get(id).kind, 'method');
    }
  }
});
check('Large catalogues remain capped while a late selected project remains reachable', () => {
  const more = Array.from({ length: 1000 }, (_, index) => ({ ...projects[0], slug: `synthetic-${index}`, concepts: ['products', 'local-first'] }));
  const large = data.buildKnowledgeGraph([...projects, ...more], projectOrigins);
  const selected = 'project:synthetic-999';
  const visible = math.visibleKnowledgeNodes(large, selected, true, false, 120);
  assert.equal(visible.size, 120); assert.ok(visible.has(selected));
  for (const limit of [20, 60, 120]) assert.equal(math.visibleKnowledgeNodes(large, selected, true, false, limit).size, limit);
  const local = math.visibleKnowledgeNodes(large, selected, true, true, 120);
  assert.ok(local.has('method:local-first') && local.has('topic:products'));
  assert.equal(math.layoutKnowledgeGraph(large).size, large.nodes.length);
});
check('Node URLs preserve project IDs and separate work and education routes', () => {
  assert.equal(data.graphNodeHref(byId.get('project:study-rl'), 'en-gb'), '/en-gb/projects?view=map&node=project%3Astudy-rl');
  for (const node of graph.nodes.filter((entry) => entry.section && entry.anchor)) assert.equal(data.graphNodeHref(node, 'en-gb'), `/en-gb/${node.section}#${node.anchor}`);
});
check('Graph export contains navigation metadata with no private paths or repository history', () => {
  const encoded = JSON.stringify(graph);
  assert.equal(JSON.parse(encoded).version, 2);
  assert.ok(!/\/Users\/|\.git\/|BEGIN OPENSSH PRIVATE KEY|\b[0-9a-f]{40}\b/.test(encoded));
});
console.log(`${count} graph checks passed; ${projects.length} projects, ${graph.nodes.length} nodes, ${graph.edges.length} edges.`);
