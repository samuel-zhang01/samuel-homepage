import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

/** The desktop owns document metadata. A second title observer in Projects can
 * create a self-sustaining mutation loop and block the first interaction.
 * Check the ownership boundary directly so this crash stays covered even in
 * environments where a browser runner is unavailable.
 */
const explorerPath = new URL("../src/components/projects/ProjectExplorer.tsx", import.meta.url);
const desktopPath = new URL("../src/components/SystemSevenDesktop.tsx", import.meta.url);
const explorerText = await readFile(explorerPath, "utf8");
const desktopText = await readFile(desktopPath, "utf8");
const explorer = ts.createSourceFile(explorerPath.pathname, explorerText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const desktop = ts.createSourceFile(desktopPath.pathname, desktopText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const problems = [];
const assignmentTokens = new Set([
  ts.SyntaxKind.EqualsToken, ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken, ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
]);
function isDocumentTitle(node) {
  return /^(?:(?:window|globalThis)\.)?document(?:\.title|\[(["'])title\1\])$/.test(node.getText(explorer));
}
function visit(node) {
  if (ts.isBinaryExpression(node) && assignmentTokens.has(node.operatorToken.kind) && isDocumentTitle(node.left)) problems.push("ProjectExplorer writes document.title");
  if (ts.isNewExpression(node) && /(?:^|\.)MutationObserver$/.test(node.expression.getText(explorer))) problems.push("ProjectExplorer installs a MutationObserver");
  if (ts.isJsxOpeningElement(node) && node.tagName.getText(explorer) === "title") problems.push("ProjectExplorer renders a competing title element");
  ts.forEachChild(node, visit);
}
visit(explorer);
assert.deepEqual(problems, [], "Keep metadata synchronization in SystemSevenDesktop; Projects announces route changes.");
assert.ok(explorerText.includes('"samuel-project-route-change"'), "Projects must announce route changes to the metadata owner.");
assert.ok(desktopText.includes('addEventListener("samuel-project-route-change"'), "The desktop must listen for project route changes.");

// Execute the production route handlers with native URL/history semantics.
// This catches journeys that look correct until a reload or browser Back.
function productionHandler(name, bindings, sourceFile = explorer) {
  let source;
  function find(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) source = node.getText(sourceFile);
    if (ts.isVariableDeclaration(node) && node.name.getText(sourceFile) === name && node.initializer) source = `const ${name} = ${node.initializer.getText(sourceFile)};`;
    ts.forEachChild(node, find);
  }
  find(sourceFile);
  assert.ok(source, `Missing production handler: ${name}`);
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  return new Function(...Object.keys(bindings), `${compiled}\nreturn ${name};`)(...Object.values(bindings));
}

function routeHarness(search) {
  let address = new URL(`/en-gb/projects${search}`, "https://example.com");
  const window = {
    get location() { return address; },
    history: { state: {}, pushState(_state, _title, value) { address = new URL(value, address); }, replaceState(_state, _title, value) { address = new URL(value, address); } },
    dispatchEvent() {},
  };
  return { window, readView: productionHandler("viewFromAddress", { window }), updateAddress: productionHandler("updateAddress", { window }) };
}

for (const [search, expected] of [
  ["", "guided"],
  ["?node=topic%3Ascientific-ml", "map"],
  ["?view=map&node=topic%3Ascientific-ml", "map"],
  ["?view=files&node=topic%3Ascientific-ml", "files"],
  ["?view=list&node=topic%3Ascientific-ml", "files"],
  ["?view=guided&node=topic%3Ascientific-ml", "guided"],
]) {
  assert.equal(routeHarness(search).readView(), expected, `Explicit view must survive a legacy graph node: ${search}`);
}

for (const next of ["files", "guided"]) {
  const route = routeHarness("?view=map&node=topic%3Ascientific-ml&q=robot&area=Research");
  let visibleView = "map";
  let selectedNode = "topic:scientific-ml";
  const chooseView = productionHandler("chooseView", {
    setView: value => { visibleView = value; }, node: selectedNode, setNode: value => { selectedNode = value; },
    projects: [], selectedSlug: null, setSelectedSlug() {}, setMapVisited() {}, updateAddress: route.updateAddress,
  });
  chooseView(next);
  assert.equal(visibleView, next);
  assert.equal(selectedNode, null);
  assert.equal(route.window.location.searchParams.has("node"), false, "Leaving the graph must remove its routing node");
  assert.equal(route.readView(), next, "Reload/Back must reopen the visible project view");
  assert.equal(route.window.location.searchParams.get("q"), "robot", "Switching views must preserve project filters");
}

const shortcutRoute = routeHarness("?view=map&node=topic%3Ascientific-ml&selected=course-recommender");
let shortcutView;
let shortcutNode = "topic:scientific-ml";
const shortcut = productionHandler("shortcut", {
  window: shortcutRoute.window, HTMLElement: class {},
  rootRef: { current: { closest: () => ({ classList: { contains: () => true } }) } }, searchRef: { current: { focus() {} } },
  requestAnimationFrame: callback => callback(),
  setView: value => { shortcutView = value; }, setNode: value => { shortcutNode = value; }, setSelectedSlug() {},
});
shortcut({ key: "/", target: {}, preventDefault() {} });
assert.equal(shortcutView, "files");
assert.equal(shortcutNode, null);
assert.equal(shortcutRoute.window.location.searchParams.has("node"), false);
assert.equal(shortcutRoute.window.location.searchParams.has("selected"), false);
assert.equal(shortcutRoute.readView(), "files", "Project search shortcut must survive reload from a selected graph node");

const connectionRoute = routeHarness("?view=files&selected=course-recommender");
const tabs = ["guided", "files", "map"];
let focusedTab;
const showConnections = productionHandler("showConnections", {
  setNode() {}, setView() {}, setMapVisited() {}, setSelectedSlug() {}, updateAddress: connectionRoute.updateAddress,
  requestAnimationFrame: callback => callback(), tabs,
  tabsRef: { current: tabs.map(tab => ({ focus: () => { focusedTab = tab; } })) },
});
showConnections("course-recommender");
assert.equal(connectionRoute.readView(), "map");
assert.equal(connectionRoute.window.location.searchParams.get("node"), "project:course-recommender");
assert.equal(focusedTab, "map", "Connections must move keyboard focus to the active graph tab");

for (const [origin, search, archiveOpen, expected] of [
  ["projects", "?view=files&selected=course-recommender&q=course", true, "archive"],
  ["projects", "?view=files&selected=another-project", true, "document"],
  ["projects", "?view=map&node=project%3Acourse-recommender", true, "document"],
  ["projects", "?view=files&selected=course-recommender", false, "document"],
  ["project", "?view=files&selected=course-recommender", true, "document"],
]) {
  let destination;
  let activityClosed = false;
  const returnFromActivity = productionHandler("returnFromActivity", {
    activity: { slug: "course-recommender", kind: "demo" },
    activityOrigin: { current: origin }, routeStateByApp: { current: { projects: { search } } },
    windows: [{ id: "projects", open: archiveOpen }],
    closeApp: id => { assert.equal(id, "projectActivity"); destination = "archive"; activityClosed = true; },
    openProjectDocument: slug => { assert.equal(slug, "course-recommender"); destination = "document"; },
    setWindows: update => { activityClosed = !update([{ id: "projectActivity", open: true }])[0].open; },
  }, desktop);
  returnFromActivity();
  assert.equal(destination, expected, `Back to project must return to its existing overview when available: ${origin}, ${search}, open=${archiveOpen}`);
  assert.equal(activityClosed, true, "Back to project must close the activity in every origin case");
}

console.log("Project navigation gate: one metadata owner; stable views and graph focus; activities return to their originating overview.");
