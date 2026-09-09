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
  const localRequire = (name) => name.startsWith('.')
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
const graph = data.buildKnowledgeGraph(projects, projectOrigins);
let count = 0;
function check(name, test) { test(); count++; console.log(`PASS ${name}`); }
const ids = new Set(graph.nodes.map((node) => node.id));
const byId = new Map(graph.nodes.map((node) => [node.id, node]));

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
  const contracts = { explores: ['project', 'topic'], uses: ['project', 'method'], 'part-of': ['method', 'topic'], 'developed-in': ['project', 'experience'], 'related-context': ['project', 'experience'] };
  for (const edge of graph.edges) assert.deepEqual([byId.get(edge.source).kind, byId.get(edge.target).kind], contracts[edge.relation]);
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
  const catalogue = structuredClone(projects), origins = structuredClone(projectOrigins);
  const before = JSON.stringify({ catalogue, origins });
  data.buildKnowledgeGraph(catalogue, origins);
  assert.equal(JSON.stringify({ catalogue, origins }), before);
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
check('3D focus preserves overview geometry and depth; optional 2D remains flat', () => {
  const overview = math.layoutKnowledgeGraph(graph);
  for (const selectedId of ['topic:scientific-ml', 'project:neural-cfd-surrogates', 'experience:imperial']) {
    const visible = math.visibleKnowledgeNodes(graph, selectedId, true, true);
    const focused = math.layoutKnowledgeFocus(graph, selectedId, visible);
    const origin = overview.get(selectedId);
    assert.ok([...focused.values()].some((point) => Math.abs(point.z) > 10), selectedId);
    for (const [id, point] of focused) {
      const original = overview.get(id);
      assert.deepEqual(point, { x: original.x - origin.x, y: original.y - origin.y, z: original.z - origin.z });
    }
    const flat = math.layoutKnowledgeFocus(graph, selectedId, visible, true);
    assert.ok([...flat.values()].every((point) => point.z === 0));
  }
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
check('Intermediate projected motion remains continuous and retains pairwise 3D geometry', () => {
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
  const original = separation(from);
  for (const progress of [.1, .5, .9]) {
    const frame = math.interpolateKnowledgeScene(from, to, progress);
    for (const [axis, value] of Object.entries(separation(frame))) assert.ok(Math.abs(value - original[axis]) < 1e-10);
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
  for (const node of graph.nodes.filter((entry) => entry.kind === 'experience')) assert.equal(data.graphNodeHref(node, 'en-gb'), `/en-gb/${node.section}#${node.anchor}`);
});
check('Graph export contains navigation metadata with no private paths or repository history', () => {
  const encoded = JSON.stringify(graph);
  assert.equal(JSON.parse(encoded).version, 1);
  assert.ok(!/\/Users\/|\.git\/|BEGIN OPENSSH PRIVATE KEY|\b[0-9a-f]{40}\b/.test(encoded));
});
console.log(`${count} graph checks passed; ${projects.length} projects, ${graph.nodes.length} nodes, ${graph.edges.length} edges.`);
