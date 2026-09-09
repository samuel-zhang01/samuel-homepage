import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { renderToString } from "katex";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const options = { displayMode: true, output: "htmlAndMathml", strict: "error", throwOnError: true, trust: false, maxExpand: 500, maxSize: 20 };
const expressions = [];

async function componentFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? componentFiles(join(directory, entry.name)) : entry.name.endsWith(".tsx") ? [join(directory, entry.name)] : []))).flat();
}

function templateSamples(template) {
  if (ts.isNoSubstitutionTemplateLiteral(template)) return [template.rawText ?? template.text];
  // Exercise sign, decimal, zero and two-digit interpolation without evaluating UI code.
  // Branch-specific authored TeX is also visited independently by the AST walk.
  return ["0", "0.72", "-1.25", "10"].map((value) => (template.head.rawText ?? template.head.text)
    + template.templateSpans.map((span) => value + (span.literal.rawText ?? span.literal.text)).join(""));
}

for (const path of await componentFiles(join(root, "src", "components"))) {
  const source = await readFile(path, "utf8");
  if (!source.includes("MathEquation") || path.endsWith("/MathEquation.tsx")) continue;
  const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const record = (node, tex) => expressions.push({ tex, location: `${relative(root, path)}:${parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1}` });
  function visit(node) {
    if (ts.isTaggedTemplateExpression(node) && node.tag.getText(parsed) === "String.raw") {
      for (const tex of templateSamples(node.template)) record(node, tex);
    }
    if (ts.isJsxAttribute(node) && node.name.getText(parsed) === "tex" && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) record(node, node.initializer.text);
      if (ts.isJsxExpression(node.initializer)) {
        const expression = node.initializer.expression;
        if (expression && (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))) record(node, expression.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
}
assert.ok(expressions.length > 0, "The authored-equation inventory must not be empty");
const errors = [];
for (const { tex, location } of expressions) {
  try {
    assert.ok(!/\\(?:href|url|includegraphics|html\w+)\b/.test(tex), "Authored equations must not introduce links or HTML");
    const html = renderToString(tex, options);
    assert.match(html, /<math\b/, "Every equation keeps accessible MathML");
    assert.match(html, /class="katex-html" aria-hidden="true"/, "Visual duplicate is hidden from assistive technology");
  } catch (error) {
    errors.push(`${location}: ${error.message}\n  ${tex}`);
  }
}
assert.equal(errors.length, 0, errors.join("\n"));
assert.throws(() => renderToString(String.raw`\unsupportedEquationCommand{x}`, options));
assert.throws(() => renderToString(String.raw`\frac{1}{`, options));
const blockedLink = renderToString(String.raw`\href{https://example.invalid}{x}`, options);
assert.doesNotMatch(blockedLink, /<a\b|href="https:/, "Untrusted math cannot create navigation");

// Check the real component's safe failure and native-math rendering, including inline use.
const componentSource = await readFile(join(root, "src/components/projects/MathEquation.tsx"), "utf8");
const compiled = ts.transpileModule(componentSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
const evaluated = { exports: {} };
runInNewContext(compiled.outputText, {
  module: evaluated,
  exports: evaluated.exports,
  require(name) {
    if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name.endsWith(".css")) return {};
    return require(name);
  },
});
const inline = renderToStaticMarkup(React.createElement("p", null, "Value ", React.createElement(evaluated.exports.MathEquation, { tex: String.raw`\frac{1}{2}`, display: false })));
assert.match(inline, /<math\b/);
assert.doesNotMatch(inline, /<div\b|data-math-error/);
const fallback = renderToStaticMarkup(React.createElement(evaluated.exports.MathEquation, { tex: String.raw`\unsupportedEquationCommand{<script>}` }));
assert.match(fallback, /data-math-error="true"/);
assert.match(fallback, /&lt;script&gt;/);
assert.doesNotMatch(fallback, /<script>/);

const stylesheet = await readFile(join(root, "src/components/projects/katex.generated.css"), "utf8");
const fonts = [...stylesheet.matchAll(/url\("([^\"]+)"\)/g)].map((match) => match[1]);
assert.equal(fonts.length, 20, "Pinned KaTeX exposes 20 WOFF2 faces");
let fontBytes = 0;
for (const font of fonts) {
  assert.match(font, /^\/_vendor\/katex\/0\.18\.7\/fonts\/KaTeX_[\w-]+\.woff2$/);
  fontBytes += (await stat(join(root, "public", font))).size;
}
assert.ok(fontBytes < 300 * 1024, "Local mathematical fonts stay below 300 KiB");
console.log(`Math equations: ${expressions.length} authored/static and dynamic-template checks; strict syntax, MathML, blocked links, safe fallback, inline markup; 20 local WOFF2 fonts (${(fontBytes / 1024).toFixed(1)} KiB).`);
