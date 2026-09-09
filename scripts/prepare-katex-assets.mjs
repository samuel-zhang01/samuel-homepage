import assert from "node:assert/strict";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(root, "node_modules", "katex");
const { version } = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
const publicUrl = `/_vendor/katex/${version}`;
const destination = join(root, "public", publicUrl);
const original = await readFile(join(packageRoot, "dist", "katex.css"), "utf8");
const fontNames = [...new Set([...original.matchAll(/url\(fonts\/([^)]*\.woff2)\)/g)].map((match) => match[1]))];
assert.ok(fontNames.length > 0, "KaTeX must include locally available WOFF2 fonts");
// Modern-browser contract: preserve upstream styling but omit legacy WOFF/TTF.
const css = original.replace(/src:\s*url\(fonts\/([^)]*\.woff2)\)[^;]*;/g, (_, filename) => `src: url("${publicUrl}/fonts/${filename}") format("woff2");`);
assert.ok(!/url\([^)]*\.(?:woff|ttf)["')]/.test(css), "No unused legacy font formats");
assert.equal([...css.matchAll(/url\(/g)].length, fontNames.length, "Every stylesheet asset must be a reviewed local font");
await mkdir(join(destination, "fonts"), { recursive: true });
let fontBytes = 0;
for (const filename of fontNames) {
  const source = join(packageRoot, "dist", "fonts", filename);
  await copyFile(source, join(destination, "fonts", filename));
  fontBytes += (await stat(source)).size;
}
await copyFile(join(packageRoot, "LICENSE"), join(destination, "LICENSE"));
const generated = join(root, "src", "components", "projects", "katex.generated.css");
const nextContent = `/* Generated from locked KaTeX ${version}; MIT licence: ${publicUrl}/LICENSE. */\n${css}`;
let previous;
try { previous = await readFile(generated, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (previous !== nextContent) await writeFile(generated, nextContent);
console.log(`KaTeX ${version}: ${fontNames.length} local WOFF2 fonts (${(fontBytes / 1024).toFixed(1)} KiB), ${(Buffer.byteLength(css) / 1024).toFixed(1)} KiB CSS; no CDN or legacy font formats.`);
