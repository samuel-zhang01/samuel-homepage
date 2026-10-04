import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import ts from "typescript";

const origin = new URL(process.env.REVIEW_ORIGIN || "http://127.0.0.1:5188");
const canonicalOrigin = "https://me.samuelzhang.co.uk";
const reportDirectory = path.resolve(".codex/reports/deep-audit");
const report = { started: new Date().toISOString(), origin: origin.origin, routes: [], assets: [], challenges: [], failures: [], wireRequests: 0 };
const languageOptions = [
  ["", "en-GB"], ["en-gb", "en-GB"], ["en-us", "en-US"], ["zh-cn", "zh-CN"], ["zh-tw", "zh-TW"],
];
const htmlDecode = value => value.replace(/&(?:amp|quot|apos|lt|gt);|&#(?:x[\da-f]+|\d+);/gi, entity => {
  if (entity.startsWith("&#")) return String.fromCodePoint(Number.parseInt(entity.slice(entity[2].toLowerCase() === "x" ? 3 : 2, -1), entity[2].toLowerCase() === "x" ? 16 : 10));
  return { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" }[entity.toLowerCase()];
});
function attributes(tag) {
  return Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)=(?:"([^"]*)"|'([^']*)')/g), match => [match[1].toLowerCase(), htmlDecode(match[2] ?? match[3])]));
}
function request(route, { method = "GET", headers = {} } = {}) {
  const target = new URL(route, origin);
  assert.equal(target.origin, origin.origin, "The review must stay on its configured preview origin.");
  report.wireRequests += 1;
  return new Promise((resolve, reject) => {
    const req = (target.protocol === "https:" ? https : http).request(target, { method, headers }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
      response.on("error", reject);
    });
    req.setTimeout(20_000, () => req.destroy(new Error("Preview request timed out.")));
    req.on("error", reject);
    req.end();
  });
}
async function runGroup(collection, name, action) {
  try {
    const detail = await action();
    report[collection].push({ name, result: "PASS", ...detail });
  } catch (error) {
    const failure = { name, result: "FAIL", error: error.stack || String(error) };
    report[collection].push(failure);
    report.failures.push(failure);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function pool(items, action) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (cursor < items.length) await action(items[cursor++]);
  }));
}
function secureHeaders(headers) {
  const csp = headers["content-security-policy"];
  assert.ok(csp, "Missing CSP.");
  for (const rule of ["frame-ancestors 'none'", "script-src-attr 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) assert.ok(csp.includes(rule), rule);
  assert.ok(!csp.includes("'unsafe-eval'"), "Development evaluation leaked into the production CSP.");
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["x-powered-by"], undefined);
}
function pageMetadata(body, route, language) {
  const source = body.toString("utf8");
  assert.equal(attributes(source.match(/<html\b[^>]*>/i)?.[0] || "").lang, language);
  assert.ok(/<title>[^<]+<\/title>/.test(source), "Missing server title.");
  const links = Array.from(source.matchAll(/<link\b[^>]*>/gi), match => attributes(match[0]));
  const meta = Array.from(source.matchAll(/<meta\b[^>]*>/gi), match => attributes(match[0]));
  assert.equal(links.filter(link => link.rel === "canonical").length, 1, "Require exactly one server canonical.");
  assert.equal(new URL(links.find(link => link.rel === "canonical").href).href, new URL(`${canonicalOrigin}${route}`).href);
  assert.equal(new URL(meta.find(item => item.property === "og:url")?.content).href, new URL(`${canonicalOrigin}${route}`).href);
  assert.ok(meta.find(item => item.name === "description")?.content?.trim(), "Missing description.");
  const routeWithoutLocale = route.replace(/^\/(?:en-gb|en-us|zh-cn|zh-tw)(?=\/|\?|$)/, "");
  const suffix = routeWithoutLocale === "/" ? "" : routeWithoutLocale;
  for (const [code, prefix] of [["x-default", ""], ["en-GB", "/en-gb"], ["en-US", "/en-us"], ["zh-Hans", "/zh-cn"], ["zh-Hant", "/zh-tw"]]) {
    const expected = `${canonicalOrigin}${prefix}${suffix || (prefix ? "" : "/")}`;
    assert.equal(links.filter(link => link.rel === "alternate" && link.hreflang === code).length, 1, code);
    assert.equal(new URL(links.find(link => link.rel === "alternate" && link.hreflang === code).href).href, new URL(expected).href);
  }
}
async function loadCatalogue() {
  const source = await readFile("src/data/projects.ts", "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { projects } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  const sitemapSource = ts.createSourceFile("sitemap.ts", await readFile("src/app/sitemap.ts", "utf8"), ts.ScriptTarget.Latest, true);
  let sections;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(sitemapSource) === "sections") {
      const initializer = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
      assert.ok(ts.isArrayLiteralExpression(initializer));
      sections = initializer.elements.map(item => { assert.ok(ts.isStringLiteral(item)); return item.text; });
    }
    ts.forEachChild(node, visit);
  }
  visit(sitemapSource);
  assert.ok(sections?.length, "Cannot discover the sitemap's section inventory.");
  return { projects, sections };
}
async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Public symlink: ${target}`);
    if (entry.isDirectory()) files.push(...await collectFiles(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}
const mimePatterns = {
  ".pdf": /application\/pdf/, ".mjs": /(?:application|text)\/javascript/, ".js": /(?:application|text)\/javascript/,
  ".css": /text\/css/, ".json": /application\/json/, ".webp": /image\/webp/, ".png": /image\/png/,
  ".jpg": /image\/jpeg/, ".jpeg": /image\/jpeg/, ".svg": /image\/svg\+xml/, ".gif": /image\/gif/,
  ".woff2": /(?:font\/woff2|application\/font-woff2)/, ".ico": /image\/(?:x-icon|vnd.microsoft.icon)/,
};

try {
  const { projects, sections } = await loadCatalogue();
  const routes = languageOptions.flatMap(([slug, language]) => {
    const prefix = slug ? `/${slug}` : "";
    return [
      { route: prefix || "/", language },
      ...sections.map(section => ({ route: `${prefix}/${section}`, language })),
      ...projects.map(project => ({ route: `${prefix}/projects?project=${encodeURIComponent(project.slug)}`, language })),
    ];
  });
  await runGroup("challenges", "sitemap includes each current section and project in all five route forms", async () => {
    const response = await request("/sitemap.xml");
    assert.equal(response.status, 200);
    const locations = Array.from(response.body.toString().matchAll(/<loc>([^<]+)<\/loc>/g), match => htmlDecode(match[1]));
    assert.equal(new Set(locations).size, locations.length, "Duplicate sitemap URLs.");
    assert.deepEqual(locations.sort(), routes.map(({ route }) => `${canonicalOrigin}${route}`).sort());
    return { routeCount: routes.length, projects: projects.length, sections: sections.length };
  });
  await pool(routes, async ({ route, language }) => runGroup("routes", route, async () => {
    const response = await request(route);
    assert.equal(response.status, 200);
    assert.equal(response.headers["content-language"], language);
    assert.match(response.headers["content-type"], /text\/html/);
    secureHeaders(response.headers);
    pageMetadata(response.body, route, language);
    const head = await request(route, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert.equal(head.headers["content-language"], language);
    secureHeaders(head.headers);
    return { language, bytes: response.body.length, head: "PASS" };
  }));
  const files = await collectFiles("public");
  await pool(files, async file => runGroup("assets", `/${path.relative("public", file).split(path.sep).join("/")}`, async () => {
    const route = `/${path.relative("public", file).split(path.sep).map(encodeURIComponent).join("/")}`;
    const [response, source] = await Promise.all([request(route), readFile(file)]);
    assert.equal(response.status, 200);
    assert.equal(createHash("sha256").update(response.body).digest("hex"), createHash("sha256").update(source).digest("hex"), "Served asset bytes differ from the local curated/generated file.");
    const mime = mimePatterns[path.extname(file).toLowerCase()];
    if (mime) assert.match(response.headers["content-type"], mime);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    const head = await request(route, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert.equal(Number(head.headers["content-length"]), source.length);
    return { bytes: source.length, contentType: response.headers["content-type"], head: "PASS" };
  }));
  for (const [slug, language] of languageOptions) {
    const prefix = slug ? `/${slug}` : "";
    await runGroup("challenges", `${prefix || "/"}: missing section is a localized 404`, async () => {
      const response = await request(`${prefix}/audit-missing-item`);
      assert.equal(response.status, 404);
      secureHeaders(response.headers);
      assert.equal(response.headers["content-language"], language);
      const source = response.body.toString();
      assert.ok(source.includes('name="robots" content="noindex'));
      assert.equal(attributes(source.match(/<html\b[^>]*>/i)[0]).lang, language);
      assert.ok(/<main\b/.test(source), "404 recovery markup must be server-rendered, not present only in Flight data.");
      const head = await request(`${prefix}/audit-missing-item`, { method: "HEAD" });
      assert.equal(head.status, 404);
      assert.equal(head.body.length, 0);
      assert.equal(head.headers["content-language"], language);
    });
    await runGroup("challenges", `${prefix || "/"}: resume alias resolves to documents`, async () => {
      const response = await request(`${prefix}/resume`);
      assert.equal(response.status, 307);
      assert.equal(response.headers.location, `${prefix}/documents`);
    });
    for (const query of ["project=unknown-audit-slug", "project=mri&project=finance", "project=%3Cscript%3Ealert(1)%3C%2Fscript%3E", "view=pdf&artifact=%2F%2Fevil.invalid%2Fx.pdf"]) {
      await runGroup("challenges", `${prefix}/projects?${query}: invalid state retains the archive identity`, async () => {
        const response = await request(`${prefix}/projects?${query}`);
        assert.equal(response.status, 200);
        pageMetadata(response.body, `${prefix}/projects`, language);
        assert.ok(!response.body.toString().includes("<script>alert(1)</script>"));
      });
    }
  }
  for (const [alias, locale] of [["en_uk", "en-gb"], ["uk", "en-gb"], ["en_us", "en-us"], ["us", "en-us"], ["zh-hans", "zh-cn"], ["zh_cn", "zh-cn"], ["zh-hant", "zh-tw"], ["zh_tw", "zh-tw"], ["EN-GB", "en-gb"], ["En-US", "en-us"], ["ZH-CN", "zh-cn"], ["ZH-TW", "zh-tw"], ["%65n-us", "en-us"], ["%7ah-cn", "zh-cn"], ["%75k", "en-gb"]]) {
    for (const method of ["GET", "HEAD"]) await runGroup("challenges", `${method} ${alias}: redirect uses the validated canonical authority`, async () => {
      const response = await request(`/${alias}/settings?view=display`, { method, headers: { Host: "me.samuelzhang.co.uk", "X-Forwarded-Host": "evil.invalid" } });
      assert.equal(response.status, 308);
      assert.equal(response.headers.location, `${canonicalOrigin}/${locale}/settings?view=display`);
      assert.equal(response.headers["cross-origin-opener-policy"], "same-origin");
      assert.match(response.headers["strict-transport-security"], /^max-age=63072000;/);
    });
  }
  for (const host of ["evil.invalid", "me.samuelzhang.co.uk.evil.invalid", "[::1]evil.invalid", "localhost:65536", "010.0.0.1", "192.168.001.2"]) {
    for (const route of ["/en-gb/settings", "/en_us/settings", "/search/project-text-en-gb.json", "/Samuel-Zhang-Applied-AI-CV.pdf"]) await runGroup("challenges", `${route}: rejects untrusted authority ${host}`, async () => {
      const response = await request(route, { headers: { Host: host, "X-Forwarded-Host": "me.samuelzhang.co.uk" } });
      assert.equal(response.status, 421);
      assert.equal(response.headers["cache-control"], "no-store");
      assert.equal(response.headers.location, undefined);
    });
  }
  for (const route of ["/en-gb/settings", "/search/project-text-en-gb.json", "/Samuel-Zhang-Applied-AI-CV.pdf"]) {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) await runGroup("challenges", `${method} ${route}: read-only method guard`, async () => {
      const response = await request(route, { method });
      assert.equal(response.status, 405);
      assert.equal(response.headers.allow, "GET, HEAD, OPTIONS");
      assert.equal(response.headers["cache-control"], "no-store");
    });
    await runGroup("challenges", `OPTIONS ${route}: allowed methods`, async () => {
      const response = await request(route, { method: "OPTIONS" });
      assert.equal(response.status, 204);
      assert.equal(response.body.length, 0);
      assert.equal(response.headers.allow, "GET, HEAD, OPTIONS");
    });
  }
  for (const route of ["/xx-xz/projects", "/xx-xz/settings", "/xx-xz", "/zh-tw/a/b/c", "/audit.missing", "/zh-tw/audit.missing", "/projects/audit-missing-item", "/about/audit-missing-item", "/zh-cn/%61udit-missing-item", "/unknown-audit.pdf", "/search/unknown-audit.json", "/constructor", "/__proto__", "/toString", "/zh-tw/constructor", "/zh-tw/__proto__", "/zh-tw/toString"]) {
    await runGroup("challenges", `${route}: invalid dynamic route renders a recovery document`, async () => {
      const response = await request(route);
      assert.equal(response.status, 404);
      const source = response.body.toString();
      assert.ok(/<main\b[^>]*data-recovery-page=""/.test(source));
      assert.equal(attributes(source.match(/<html\b[^>]*>/i)[0]).lang, route.startsWith("/zh-tw/") ? "zh-TW" : route.startsWith("/zh-cn/") ? "zh-CN" : "en-GB");
      secureHeaders(response.headers);
      assert.ok(source.includes('name="robots" content="noindex'));
      const head = await request(route, { method: "HEAD" });
      assert.equal(head.status, 404);
      assert.equal(head.body.length, 0);
      assert.equal(head.headers["content-language"], response.headers["content-language"]);
    });
  }
  const configSource = ts.transpileModule(await readFile("next.config.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { default: config } = await import(`data:text/javascript;base64,${Buffer.from(configSource).toString("base64")}`);
  for (const { pathname } of config.images.localPatterns) {
    await runGroup("challenges", `${pathname}: reviewed image optimizer source succeeds`, async () => {
      const response = await request(`/_next/image?url=${encodeURIComponent(pathname)}&w=256&q=75`);
      assert.equal(response.status, 200);
      assert.match(response.headers["content-type"], /^image\//);
      assert.ok(response.body.length > 0);
      assert.equal(response.headers["x-content-type-options"], "nosniff");
    });
  }
  for (const query of ["url=https%3A%2F%2Fexample.org%2Fphoto.jpg&w=256&q=75", "url=%2Ffavicon.svg&w=256&q=75", "url=%2Fheadshot.jpg&w=3&q=75", "url=%2Fheadshot.jpg&w=256&q=90", "url=%2Fheadshot.jpg&w=256&q=500"]) {
    await runGroup("challenges", `image optimizer rejects unreviewed source/width/quality: ${query}`, async () => {
      const response = await request(`/_next/image?${query}`);
      assert.equal(response.status, 400);
    });
  }
} catch (error) {
  report.failures.push({ name: "Crawl setup", error: error.stack || String(error) });
} finally {
  report.finished = new Date().toISOString();
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(path.join(reportDirectory, "http-crawl.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Deep HTTP crawl: ${report.routes.length} route groups, ${report.assets.length} asset groups, ${report.challenges.length} challenge groups; ${report.failures.length} failures.`);
  if (report.failures.length) process.exitCode = 1;
}
