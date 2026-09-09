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
console.log("Project navigation gate: one document metadata owner; project route changes reach it.");
