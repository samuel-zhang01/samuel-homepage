// Verify installed/browser artwork, its metadata and maskable clipping safety.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const root = resolve(process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const read = file => readFileSync(resolve(root, file));
const profile = read("public/system7-icons/profile.png");
const rgba = bytes => sharp(bytes).ensureAlpha().raw().toBuffer();
const expectedProfile = size => sharp(profile).resize(size, size, { kernel: "nearest" }).ensureAlpha().raw().toBuffer();

// Integer enlargement applies Sharp's alpha round-trip without fractional
// sampling. At an exact source-pixel boundary either neighbour is equally near;
// libvips can choose differently across native builds when reducing 128 to 48.
// Compare whole RGBA pixels, never a colour or alpha tolerance. The ICO digest
// below also rejects changes between the two otherwise valid boundary choices.
const canonicalPixels = await expectedProfile(256);
function assertNearestIcoPixels(pixels, size) {
  assert.equal(pixels.length, size * size * 4, "ICO frame contains complete RGBA pixels");
  const neighbours = coordinate => {
    const numerator = (coordinate * 2 + 1) * 256;
    const denominator = size * 2;
    const nearest = Math.floor(numerator / denominator);
    return numerator % denominator === 0 ? [nearest - 1, nearest] : [nearest];
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const pixel = pixels.subarray((y * size + x) * 4, (y * size + x + 1) * 4);
    assert.ok(neighbours(y).some(sourceY => neighbours(x).some(sourceX => {
      const at = (sourceY * 256 + sourceX) * 4;
      return pixel.equals(canonicalPixels.subarray(at, at + 4));
    })), `ICO ${size}px frame pixel ${x},${y} uses exact canonical nearest-neighbour RGBA artwork`);
  }
}

for (const [file, size] of [
  ["public/favicon.png", 128], ["src/app/icon.png", 128],
  ["public/apple-touch-icon.png", 180], ["public/icon-192.png", 192], ["public/icon-512.png", 512],
]) {
  const bytes = read(file);
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, "png", `${file}: real PNG`);
  assert.equal(metadata.width, size, `${file}: declared width`);
  assert.equal(metadata.height, size, `${file}: declared height`);
  assert.equal(metadata.hasAlpha, true, `${file}: preserves transparent icon background`);
  const pixels = await rgba(bytes);
  assert.deepEqual(pixels, await expectedProfile(size), `${file}: shares canonical profile artwork, using nearest-neighbour scaling`);
  assert.ok(pixels.some((alpha, at) => at % 4 === 3 && alpha === 0), `${file}: transparent outside the artwork`);
  if (size === 128) assert.deepEqual(bytes, profile, `${file}: exact canonical image`);
}

const maskable = read("public/icon-512-maskable.png");
const maskMetadata = await sharp(maskable).metadata();
assert.equal(maskMetadata.format, "png", "Maskable icon is PNG");
assert.equal(maskMetadata.width, 512, "Maskable width matches manifest");
assert.equal(maskMetadata.height, 512, "Maskable height matches manifest");
const maskPixels = await rgba(maskable);
const background = [133, 135, 168];
let subjectPixels = 0;
for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
  const at = (y * 512 + x) * 4;
  assert.equal(maskPixels[at + 3], 255, `Maskable pixel ${x},${y} is opaque`);
  if (background.some((channel, i) => maskPixels[at + i] !== channel)) {
    subjectPixels++;
    // W3C's guaranteed maskable region is the centred circle of radius 40%.
    assert.ok(Math.hypot(x + .5 - 256, y + .5 - 256) <= 204.8, `Maskable artwork at ${x},${y} would be clipped`);
  }
}
assert.ok(subjectPixels > 10_000, "Maskable icon contains visible profile artwork");
const maskExpected = await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 133, g: 135, b: 168, alpha: 1 } } })
  .composite([{ input: await sharp(profile).resize(288, 288, { kernel: "nearest" }).png().toBuffer(), left: 112, top: 112 }]).ensureAlpha().raw().toBuffer();
assert.deepEqual(maskPixels, maskExpected, "Maskable icon uses the canonical profile rather than another drawing");

const ico = read("public/favicon.ico");
// Reviewed derivative recorded in docs/SYSTEM7_ICON_PROMPTS.json. Keep the
// digest here too because deployment deliberately excludes authoring documents.
assert.equal(createHash("sha256").update(ico).digest("hex"), "5191429d3801be542df3a8d11ef40e64c67f928bea5c2d08dc3c6ccad315f163", "ICO matches the reviewed browser artwork exactly");
assert.equal(ico.readUInt16LE(0), 0, "ICO reserved field");
assert.equal(ico.readUInt16LE(2), 1, "ICO image type");
assert.equal(ico.readUInt16LE(4), 3, "ICO has three actual image frames");
let nextOffset = 54;
for (const [index, size] of [16, 32, 48].entries()) {
  const at = 6 + index * 16;
  assert.equal(ico[at], size, "ICO frame width");
  assert.equal(ico[at + 1], size, "ICO frame height");
  assert.equal(ico.readUInt16LE(at + 4), 1, "ICO frame plane count");
  assert.equal(ico.readUInt16LE(at + 6), 32, "ICO frame depth");
  const length = ico.readUInt32LE(at + 8);
  const offset = ico.readUInt32LE(at + 12);
  assert.equal(offset, nextOffset, "ICO frame offsets are contiguous and do not overlap");
  assert.ok(length > 0 && offset + length <= ico.length, "ICO frame is complete");
  const frame = ico.subarray(offset, offset + length);
  const metadata = await sharp(frame).metadata();
  assert.equal(metadata.width, size, "Decoded ICO frame matches its declared width");
  assert.equal(metadata.height, size, "Decoded ICO frame matches its declared height");
  if (size === 48) assertNearestIcoPixels(await rgba(frame), size);
  else assert.deepEqual(await rgba(frame), await expectedProfile(size), "ICO frame uses canonical pixel artwork");
  nextOffset += length;
}
assert.equal(nextOffset, ico.length, "ICO has no trailing or unreferenced frames");

const safari = read("public/safari-pinned-tab.svg");
const safariSource = safari.toString("utf8");
assert.match(safariSource, /viewBox="0 0 32 32"/, "Safari icon retains the logical pixel grid");
assert.ok(!/<(?:image|script|foreignObject)\b|(?:href|url)\s*=/i.test(safariSource), "Safari icon contains no unrelated image or external dependency");
const safariPixels = await sharp(safari).resize(32, 32).ensureAlpha().raw().toBuffer();
const profilePixels = await expectedProfile(32);
let ink = 0;
for (let at = 0; at < profilePixels.length; at += 4) {
  const dark = profilePixels[at + 3] >= 128 && 299 * profilePixels[at] + 587 * profilePixels[at + 1] + 114 * profilePixels[at + 2] <= 180_000;
  assert.equal(safariPixels[at + 3], dark ? 255 : 0, "Safari monochrome plane preserves the profile's own pixels");
  if (dark) { ink++; assert.deepEqual([...safariPixels.subarray(at, at + 3)], [0, 0, 0], "Safari ink is monochrome black"); }
}
assert.ok(ink > 20, "Safari icon has visible monochrome artwork");

const manifestModule = { exports: {} };
const compiledManifest = ts.transpileModule(read("src/app/manifest.ts").toString("utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function("module", "exports", compiledManifest)(manifestModule, manifestModule.exports);
const manifest = manifestModule.exports.default();
assert.deepEqual(manifest.icons, [
  { src: "/icon-192.png?v=5", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icon-512.png?v=5", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icon-512-maskable.png?v=5", sizes: "512x512", type: "image/png", purpose: "maskable" },
], "Manifest exposes the verified PNG files with accurate dimensions and purposes");

const layoutText = read("src/app/layout.tsx").toString("utf8");
const layout = ts.createSourceFile("layout.tsx", layoutText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let metadata;
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "metadata") metadata = node.initializer;
  ts.forEachChild(node, visit);
}
visit(layout);
assert.ok(metadata && ts.isObjectLiteralExpression(metadata), "Layout declares metadata");
const property = name => metadata.properties.find(node => ts.isPropertyAssignment(node) && node.name.getText(layout) === name)?.initializer;
assert.equal(property("manifest")?.text, "/manifest.webmanifest?v=5", "Manifest cache version matches icon revision");
const layoutIcons = new Function(`return (${property("icons").getText(layout)})`)();
assert.deepEqual(layoutIcons, {
  icon: [{ url: "/favicon.png?v=5", sizes: "128x128", type: "image/png" }, { url: "/favicon.ico?v=5", sizes: "16x16 32x32 48x48", type: "image/x-icon" }],
  shortcut: [{ url: "/favicon.ico?v=5", type: "image/x-icon" }],
  apple: [{ url: "/apple-touch-icon.png?v=5", sizes: "180x180", type: "image/png" }],
  other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg?v=5", color: "#11177a" }],
}, "Browser metadata points to the same verified profile identity");
for (const file of ["src/app/icon.svg", "public/favicon.svg", "public/favicon-maskable.svg"]) assert.equal(existsSync(resolve(root, file)), false, `${file}: obsolete alternate icon was removed`);
console.log(`Site icons verified: five transparent profile PNGs, three ICO frames, ${subjectPixels.toLocaleString("en-GB")} maskable subject pixels inside the safe circle, ${ink} Safari ink pixels and v5 browser/PWA metadata.`);
