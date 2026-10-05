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
// Installed/browser formats sample native pixels directly, using the same
// proportional 90% optical frame as System7Icon. There is no small sprite
// intermediate, interpolation, or modification of the canonical source PNG.
const profileMetadata = await sharp(profile).metadata();
assert.equal(profileMetadata.format, "png", "Profile source is PNG");
assert.ok(profileMetadata.width > 512 && profileMetadata.width === profileMetadata.height && profileMetadata.hasAlpha, "Profile source retains its authentic native resolution and alpha");
assert.equal(createHash("sha256").update(profile).digest("hex"), "6e495d0d9d64ed9c1086e133b5d7bbd1d6a5bfe34e8ed2629777a04decd1a71c", "Browser derivatives use the recovered native profile PNG");
const nativePixels = await rgba(profile);
const bounds = [profileMetadata.width, profileMetadata.height, -1, -1];
for (let y = 0; y < profileMetadata.height; y++) for (let x = 0; x < profileMetadata.width; x++) {
  if (nativePixels[(y * profileMetadata.width + x) * 4 + 3] < 16) continue;
  bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
  bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
}
const centre = [(bounds[0] + bounds[2] + 1) / 2, (bounds[1] + bounds[3] + 1) / 2];
const framedSpan = Math.max(bounds[2] - bounds[0] + 1, bounds[3] - bounds[1] + 1) / .9;
function expectedProfile(size) {
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sourceX = Math.floor(centre[0] + (x + .5 - size / 2) * framedSpan / size);
    const sourceY = Math.floor(centre[1] + (y + .5 - size / 2) * framedSpan / size);
    if (sourceX < 0 || sourceX >= profileMetadata.width || sourceY < 0 || sourceY >= profileMetadata.height) continue;
    const at = (sourceY * profileMetadata.width + sourceX) * 4;
    nativePixels.copy(pixels, (y * size + x) * 4, at, at + 4);
  }
  return pixels;
}

for (const [file, size] of [
  ["public/favicon.png", 128],
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
}

// The legacy endpoint redirects to the public derivative instead of embedding
// another copy of its PNG bytes in the application runtime.
const iconConfigModule = { exports: {} };
const compiledIconConfig = ts.transpileModule(read("next.config.ts").toString("utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function("module", "exports", compiledIconConfig)(iconConfigModule, iconConfigModule.exports);
assert.deepEqual(await iconConfigModule.exports.default.redirects(), [
  { source: "/icon.png", destination: "/favicon.png?v=6", permanent: false },
], "Legacy browser icon redirects temporarily to the reviewed public PNG without a route bundle");

const maskable = read("public/icon-512-maskable.png");
assert.equal(createHash("sha256").update(maskable).digest("hex"), "bb3b0fc5e21da32b8a80ac1c737ae8613ac03c5864393b26f59e09827dd52739", "Maskable icon matches the reviewed browser artwork exactly");
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
// Verify source-over composition with integer arithmetic, rather than asking
// the current native libvips build to reproduce another build's float rounding.
// At exact integer results, a semi-transparent blend can round one value down;
// the reviewed PNG has 13 such channels. The digest above rejects any byte
// change, including choosing another otherwise valid boundary value.
const maskSubject = expectedProfile(288);
for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
  const at = (y * 512 + x) * 4;
  const inside = x >= 112 && x < 400 && y >= 112 && y < 400;
  const sourceAt = inside ? ((y - 112) * 288 + x - 112) * 4 : 0;
  const alpha = inside ? maskSubject[sourceAt + 3] : 0;
  for (let channel = 0; channel < 3; channel++) {
    const source = inside ? maskSubject[sourceAt + channel] : 0;
    const numerator = source * alpha + background[channel] * (255 - alpha);
    const expected = Math.floor(numerator / 255);
    const value = maskPixels[at + channel];
    const roundedBoundary = alpha > 0 && alpha < 255 && numerator % 255 === 0 && value === expected - 1;
    assert.ok(value === expected || roundedBoundary, `Maskable pixel ${x},${y} channel ${channel} uses canonical source-over artwork`);
  }
}

const ico = read("public/favicon.ico");
// Reviewed derivative recorded in docs/SYSTEM7_ICON_PROMPTS.json. Keep the
// digest here too because deployment deliberately excludes authoring documents.
assert.equal(createHash("sha256").update(ico).digest("hex"), "449498b9487f38475bfc5d43c3b60d5ed8140d336e4317a483900c05654e3626", "ICO matches the reviewed browser artwork exactly");
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
  assert.deepEqual(await rgba(frame), expectedProfile(size), "ICO frame uses exact native RGBA source pixels and proportional optical framing");
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
  { src: "/icon-192.png?v=6", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icon-512.png?v=6", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icon-512-maskable.png?v=6", sizes: "512x512", type: "image/png", purpose: "maskable" },
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
assert.equal(property("manifest")?.text, "/manifest.webmanifest?v=6", "Manifest cache version matches icon revision");
const layoutIcons = new Function(`return (${property("icons").getText(layout)})`)();
assert.deepEqual(layoutIcons, {
  icon: [{ url: "/favicon.png?v=6", sizes: "128x128", type: "image/png" }, { url: "/favicon.ico?v=6", sizes: "16x16 32x32 48x48", type: "image/x-icon" }],
  shortcut: [{ url: "/favicon.ico?v=6", type: "image/x-icon" }],
  apple: [{ url: "/apple-touch-icon.png?v=6", sizes: "180x180", type: "image/png" }],
  other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg?v=6", color: "#11177a" }],
}, "Browser metadata points to the same verified profile identity");
for (const file of ["src/app/icon.svg", "public/favicon.svg", "public/favicon-maskable.svg"]) assert.equal(existsSync(resolve(root, file)), false, `${file}: obsolete alternate icon was removed`);
console.log(`Site icons verified: four transparent profile PNGs, the legacy icon redirect, three ICO frames, ${subjectPixels.toLocaleString("en-GB")} maskable subject pixels inside the safe circle, ${ink} Safari ink pixels and v6 browser/PWA metadata.`);
