import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
async function loadSource(relativePath, environment = "") {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: relativePath,
  }).outputText.replace('from "next/server"', `from ${JSON.stringify(pathToFileURL(require.resolve("next/server")).href)}`);
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}#${environment}`);
}

const { middleware, config } = await loadSource("../src/middleware.ts");
const previousEnvironment = process.env.NODE_ENV;
let checks = 0;
function check(name, run) {
  try { run(); checks++; } catch (cause) { throw new Error(`Request security regression: ${name}`, { cause }); }
}
function request(path = "/", { host = "me.samuelzhang.co.uk", method = "GET", headers = {} } = {}) {
  return new NextRequest(`https://me.samuelzhang.co.uk${path}`, { method, headers: { ...headers, ...(host === null ? {} : { host }) } });
}

try {
  process.env.NODE_ENV = "production";
  for (const host of ["me.samuelzhang.co.uk", "ME.SAMUELZHANG.CO.UK:443", "localhost:3000", "127.0.0.1:3000", "[::1]:3000", "10.0.0.8:5174", "172.16.0.1", "172.31.255.255", "192.168.1.2"]) {
    check(`trusted authority ${host}`, () => assert.equal(middleware(request("/", { host })).status, 200));
  }
  for (const host of [null, "evil.invalid", "me.samuelzhang.co.uk.evil.invalid", "172.15.1.1", "172.32.1.1", "192.168.256.1", "10.0.0.999", "010.0.0.1", "10.0.0.08", "192.168.001.2", "[::1]evil.invalid", "[::1]:evil", "me.samuelzhang.co.uk:evil", "localhost:65536"]) {
    check(`untrusted or malformed authority ${host}`, () => {
      const response = middleware(request("/", { host }));
      assert.equal(response.status, 421);
      assert.equal(response.headers.get("cache-control"), "no-store");
    });
  }
  for (const host of ["010.0.0.1", "10.0.0.08", "192.168.001.2"]) {
    check(`ambiguous IPv4 authority ${host} cannot redirect or throw`, () => {
      const response = middleware(request("/uk/settings", { host }));
      assert.equal(response.status, 421);
      assert.equal(response.headers.get("location"), null);
    });
  }
  check("forwarded hostname cannot bypass Host validation", () => assert.equal(middleware(request("/", { host: "evil.invalid", headers: { "x-forwarded-host": "me.samuelzhang.co.uk" } })).status, 421));
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    check(`${method} cannot mutate public routes`, () => {
      const response = middleware(request("/desk", { method }));
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), "GET, HEAD, OPTIONS");
      assert.equal(response.headers.get("cache-control"), "no-store");
    });
  }
  check("OPTIONS states supported methods without granting cross-origin access", () => {
    const response = middleware(request("/", { method: "OPTIONS" }));
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
    assert.equal(response.headers.get("allow"), "GET, HEAD, OPTIONS");
  });
  for (const [slug, language] of [["en-gb", "en-GB"], ["en-us", "en-US"], ["zh-cn", "zh-CN"], ["zh-tw", "zh-TW"]]) {
    check(`server locale ${slug} replaces spoofed request language`, () => {
      const response = middleware(request(`/${slug}/desk`, { headers: { "x-samuel-locale": "evil" } }));
      assert.equal(response.headers.get("content-language"), language);
      assert.equal(response.headers.get("x-middleware-request-x-samuel-locale"), language);
    });
  }
  for (const [alias, slug] of [["uk", "en-gb"], ["en_us", "en-us"], ["zh-hans", "zh-cn"], ["zh-hant", "zh-tw"]]) {
    check(`locale alias ${alias} preserves its route and query`, () => {
      const response = middleware(request(`/${alias}/projects?project=finance&view=guided`));
      assert.equal(response.status, 308);
      assert.equal(response.headers.get("location"), `https://me.samuelzhang.co.uk/${slug}/projects?project=finance&view=guided`);
    });
  }
  for (const upstream of ["http://127.0.0.1:3000", "https://untrusted.invalid"]) {
    check(`locale redirect replaces unrelated upstream ${upstream}`, () => {
      const response = middleware(new NextRequest(`${upstream}/uk/settings?view=display`, {
        headers: { host: "me.samuelzhang.co.uk", "x-forwarded-host": "untrusted.invalid" },
      }));
      assert.equal(response.status, 308);
      assert.equal(response.headers.get("location"), "https://me.samuelzhang.co.uk/en-gb/settings?view=display");
    });
  }
  check("LAN locale redirect retains the validated authority and port", () => {
    const response = middleware(new NextRequest("http://127.0.0.1:3000/zh-hant/desk?view=notes", {
      headers: { host: "192.168.1.2:5174", "x-forwarded-host": "untrusted.invalid" },
    }));
    assert.equal(response.headers.get("location"), "http://192.168.1.2:5174/zh-tw/desk?view=notes");
  });
  check("canonical response receives transport headers", () => {
    const response = middleware(request());
    assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin");
    assert.match(response.headers.get("strict-transport-security"), /^max-age=63072000/);
  });
  check("LAN response does not claim HTTPS transport", () => {
    const response = middleware(request("/", { host: "192.168.1.2" }));
    assert.equal(response.headers.get("strict-transport-security"), null);
    assert.equal(response.headers.get("cross-origin-opener-policy"), null);
  });
  const matcher = new RegExp(`^${config.matcher[0]}$`);
  check("documents, search data and routes pass the request guard", () => {
    for (const path of ["/", "/desk", "/zh-tw/projects", "/cv.pdf", "/search/project-text-en-gb.json"]) assert.ok(matcher.test(path), path);
  });
  check("internal image requests and framework static assets retain their exception", () => {
    for (const path of ["/headshot.jpg", "/_next/image", "/_next/static/chunks/app.js"]) assert.ok(!matcher.test(path), path);
  });
  const productionConfig = (await loadSource("../next.config.ts", "production")).default;
  const productionHeaders = (await productionConfig.headers())[0].headers;
  check("production CSP blocks evaluated scripts, framing and inline handlers", () => {
    const csp = productionHeaders.find(header => header.key === "Content-Security-Policy").value;
    assert.ok(!csp.includes("'unsafe-eval'"));
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(csp.includes("script-src-attr 'none'"));
    assert.ok(csp.includes("object-src 'none'"));
  });
  check("image optimizer accepts only reviewed local assets", () => {
    assert.deepEqual(productionConfig.images.remotePatterns, []);
    assert.deepEqual(productionConfig.images.qualities, [75]);
    assert.ok(productionConfig.images.localPatterns.length > 0);
    assert.ok(productionConfig.images.localPatterns.every(pattern => !pattern.pathname.includes("*")));
  });
  process.env.NODE_ENV = "development";
  check("development allows local test hostnames without transport headers", () => {
    const response = middleware(request("/", { host: "preview.invalid" }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("strict-transport-security"), null);
  });
  console.log(`Request security gate: ${checks} Host, method, locale, transport and CSP regressions passed.`);
} finally {
  if (previousEnvironment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousEnvironment;
}
