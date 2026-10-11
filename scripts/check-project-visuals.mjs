import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { runInNewContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import ts from "typescript";
import { projectShowcaseMedia } from "./fixtures/project-showcase-media.mjs";

const root = process.cwd(), nativeRequire = createRequire(import.meta.url), cache = new Map();
function load(filename) {
  const absolute = path.resolve(root, filename);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  if (absolute.endsWith(".json")) return JSON.parse(readFileSync(absolute, "utf8"));
  const evaluated = { exports: {} }; cache.set(absolute, evaluated);
  const code = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: absolute,
  }).outputText;
  runInNewContext(code, { module: evaluated, exports: evaluated.exports, console, URL,
    require(specifier) {
      if (specifier.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      if (specifier === "next/image") return { __esModule: true, default: props => React.createElement("img", Object.fromEntries(Object.entries(props).filter(([name]) => !["unoptimized", "priority", "fill"].includes(name)))) };
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return nativeRequire(specifier);
      const resolved = specifier.startsWith("@/") ? path.resolve(root, "src", specifier.slice(2)) : path.resolve(path.dirname(absolute), specifier);
      const file = [resolved, `${resolved}.ts`, `${resolved}.tsx`, path.join(resolved, "index.ts")].find(candidate => existsSync(candidate));
      assert.ok(file, `Unresolved visual helper ${specifier} from ${filename}`); return load(file);
    },
  }, { filename: absolute });
  return evaluated.exports;
}
const { projects } = load("src/data/projects.ts");
const { projectConceptScience } = load("src/data/projectConceptScience.ts");
const { projectConceptProducts } = load("src/data/projectConceptProducts.ts");
const { projectShowcaseImages } = load("src/data/projectShowcaseImages.ts");
const { ProjectConceptScience } = load("src/components/projects/ProjectConceptScience.tsx");
const { ProjectConceptProducts } = load("src/components/projects/ProjectConceptProducts.tsx");
const { projectText } = load("src/lib/projectCopy.ts");
const { projectConceptScienceCopy } = load("src/components/projects/copy/projectConceptScienceCopy.ts");
const { projectConceptProductsCopy } = load("src/components/projects/copy/projectConceptProductsCopy.ts");
const { projectShowcaseImagesCopy } = load("src/components/projects/copy/projectShowcaseImagesCopy.ts");
const ids = new Set(projects.map(project => project.slug));
const sceneIds = [...Object.keys(projectConceptScience), ...Object.keys(projectConceptProducts)];
assert.equal(new Set(sceneIds).size, sceneIds.length, "Concept ownership must be disjoint");
assert.deepEqual([...new Set(sceneIds)].sort(), [...ids].sort(), "Every catalogue project needs its own visual task");
let renderedStates = 0;
for (const [registry, Component, copy] of [[projectConceptScience, ProjectConceptScience, projectConceptScienceCopy], [projectConceptProducts, ProjectConceptProducts, projectConceptProductsCopy]]) {
  for (const [slug, concept] of Object.entries(registry)) {
    assert.equal(concept.steps.length, 4, `${slug}: four deliberate stages`);
    assert.equal(new Set(concept.steps.map(item => item.name)).size, 4, `${slug}: distinguish stage actions`);
    for (const locale of ["en-GB", "en-US", "zh-CN", "zh-TW"]) {
      for (const text of [concept.title, ...concept.steps.flatMap(item => [item.name, item.caption]), ...(concept.note ? [concept.note] : [])]) {
        assert.ok(text.trim(), `${slug}: empty explanation`);
        if (locale.startsWith("zh")) assert.notEqual(projectText(locale, copy, text), text, `${slug}: missing ${locale} concept copy: ${text}`);
      }
      const states = Array.from({ length: 4 }, (_, step) => renderToStaticMarkup(React.createElement(Component, { slug, step, locale })));
      assert.ok(states.every(markup => markup.length > 80), `${slug}: scene missing`);
      assert.notEqual(states[0], states[3], `${slug}: advancing must change the visible scene`);
      for (const markup of states) {
        for (const match of markup.matchAll(/src="([^"]+)"/g)) {
          const source = match[1]; assert.ok(source.startsWith("/"), `${slug}: only reviewed local scene images`);
          assert.ok(existsSync(path.join(root, "public", source)), `${slug}: image absent: ${source}`);
        }
        assert.ok(!/\b(?:NaN|Infinity|undefined)\b/.test(markup), `${slug}: invalid visible value`);
      }
      renderedStates += states.length;
    }
  }
}
const entries = new Map(projectShowcaseMedia);
const used = new Set(); let images = 0, bytes = 0;
for (const [slug, gallery] of Object.entries(projectShowcaseImages)) {
  assert.ok(ids.has(slug), `Unknown image project: ${slug}`);
  assert.ok(gallery.length, `${slug}: empty gallery`);
  for (const image of gallery) {
    const filename = image.src.replace(/^\//, ""), absolute = path.join(root, "public", filename);
    const data = readFileSync(absolute), metadata = await sharp(data).metadata();
    assert.equal(metadata.width, image.width, `${slug}: original image width`);
    assert.equal(metadata.height, image.height, `${slug}: original image height`);
    assert.ok(image.alt && image.caption && image.label, `${slug}: meaningful image context`);
    if (filename.startsWith("projects/project-showcases/")) {
      const allowance = entries.get(filename); assert.ok(allowance, `${filename}: missing publication allowlist`);
      assert.equal(createHash("sha256").update(data).digest("hex"), allowance.sha256, `${filename}: saved source pixels changed`);
      assert.ok(data.length <= allowance.maximumBytes, `${filename}: transfer budget`); used.add(filename);
    }
    if (image.source) {
      const local = image.source.startsWith("/") && !image.source.startsWith("//");
      assert.ok(local || /^https:\/\//.test(image.source), `${slug}: original source is a published local file or reviewed HTTPS page`);
      if (local) assert.ok(existsSync(path.join(root, "public", decodeURIComponent(image.source.split(/[?#]/)[0]))), `${slug}: published original absent`);
    }
    for (const locale of ["zh-CN", "zh-TW"]) for (const text of [image.alt, image.caption, image.label]) assert.notEqual(projectText(locale, projectShowcaseImagesCopy, text), text, `${slug}: missing ${locale} image explanation`);
    images++; bytes += data.length;
  }
}
assert.deepEqual([...used].sort(), [...entries.keys()].sort(), "Every new published image has a visual consumer");
assert.ok(bytes < 5_000_000, "The new overview images must stay below 5MB combined");
console.log(`Project visuals: ${sceneIds.length} distinct project concepts, ${renderedStates} four-locale scene states, ${images} contextual images with exact dimensions/pixels; ${(bytes / 1024 / 1024).toFixed(2)} MiB combined image payload. Browser framing and visitor scores are reviewed separately.`);
