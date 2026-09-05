import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Real temporary Git repositories; Docker/npm are simulated. Never touches a
// running service, installs dependencies, or contacts a remote network service.
const source = resolve("deploy.sh");
const root = mkdtempSync(join(tmpdir(), "homepage-deploy-check-"));
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
let checks = 0;
try {
  for (const scenario of ["success", "local", "dirty", "untracked", "ahead", "branch", "install", "build", "health", "first", "headers", "not-found", "port", "lookup", "inspect", "empty-image", "public", "public-redirect"]) {
    const dir = join(root, scenario);
    const checkout = join(dir, "checkout");
    const remote = join(dir, "origin.git");
    const bin = join(dir, "bin");
    mkdirSync(bin, { recursive: true });
    mkdirSync(checkout);
    git(dir, "init", "--bare", remote);
    git(checkout, "init", "-b", "main");
    git(checkout, "config", "user.name", "Deployment test");
    git(checkout, "config", "user.email", "test@example.invalid");
    copyFileSync(source, join(checkout, "deploy.sh"));
    writeFileSync(join(checkout, ".gitignore"), ".env\n");
    writeFileSync(join(checkout, "fixture.txt"), "initial\n");
    git(checkout, "add", ".");
    git(checkout, "commit", "-m", "Fixture");
    git(checkout, "remote", "add", "origin", remote);
    git(checkout, "push", "-u", "origin", "main");
    writeFileSync(join(checkout, ".env"), "VERIFY_PUBLIC_ORIGIN=0\n");
    if (scenario === "success") {
      const publisher = join(dir, "publisher");
      git(dir, "clone", "--branch", "main", remote, publisher);
      git(publisher, "config", "user.name", "Deployment test");
      git(publisher, "config", "user.email", "test@example.invalid");
      writeFileSync(join(publisher, "fixture.txt"), "updated\n");
      // A fetched script must be re-executed, not just read by the old shell.
      const updated = readFileSync(source, "utf8").replace("set -euo pipefail", 'set -euo pipefail\necho "UPDATED_SCRIPT"');
      writeFileSync(join(publisher, "deploy.sh"), updated);
      git(publisher, "add", ".");
      git(publisher, "commit", "-m", "Update fixture and script");
      git(publisher, "push");
    }
    if (scenario === "dirty" || scenario === "ahead") writeFileSync(join(checkout, "fixture.txt"), "local edit\n");
    if (scenario === "untracked") writeFileSync(join(checkout, "untracked.txt"), "keep me\n");
    if (scenario === "ahead") { git(checkout, "commit", "-am", "Unpublished local work"); }
    if (scenario === "branch") git(checkout, "checkout", "-b", "review");
    if (scenario === "port") writeFileSync(join(checkout, ".env"), "HOMEPAGE_PORT=invalid\n");
    if (scenario.startsWith("public")) writeFileSync(join(checkout, ".env"), "VERIFY_PUBLIC_ORIGIN=1\n");
    const shim = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2).join(' ');
const scenario = process.env.DEPLOY_TEST_SCENARIO;
fs.appendFileSync(process.env.DEPLOY_TEST_LOG, tool + ' ' + args + '\\n');
const marker = process.env.DEPLOY_TEST_MARKER;
if (tool === 'curl') {
 const headers = 'HTTP/1.1 200 OK\\nContent-Security-Policy: default-src \\'self\\'\\nCross-Origin-Opener-Policy: same-origin\\nCross-Origin-Resource-Policy: same-origin\\nStrict-Transport-Security: max-age=31536000\\nX-Content-Type-Options: nosniff\\nX-Frame-Options: DENY';
 const url = process.argv.at(-1);
 if (args.includes('__EFFECTIVE_URL__')) {
  if (args.includes('__HTTP_CODE__')) console.log('__HTTP_CODE__:200');
  console.log('__EFFECTIVE_URL__:' + (scenario === 'public-redirect' && url.endsWith('/orbitals') ? 'https://other.example.invalid/orbitals' : url));
 } else console.log(headers + '\\n__HTTP_CODE__:200');
 process.exit(0);
}
if (tool === 'npm') process.exit(scenario === 'install' && args.startsWith('ci ') ? 1 : 0);
if (args.startsWith('compose build') && scenario === 'build') process.exit(1);
if (args.startsWith('compose ps -q') && scenario === 'lookup') process.exit(1);
if (args.startsWith('inspect') && args.includes('.Image')) {
 if (scenario === 'inspect') process.exit(1);
 if (scenario === 'empty-image') process.exit(0);
}
if (args.startsWith('compose up')) fs.writeFileSync(marker, 'started');
if (args.startsWith('compose ps -q')) console.log(fs.existsSync(marker) ? 'candidate' : (scenario === 'first' ? '' : 'previous'));
if (args.startsWith('inspect')) console.log(args.includes('.Image') ? 'sha256:previous' : (['health', 'first'].includes(scenario) ? 'unhealthy' : 'healthy'));
if (args.startsWith('exec')) {
 if (args.includes('untrusted.invalid')) { console.log('HTTP/1.1 421 Misdirected Request'); process.exit(1); }
 if (args.includes('__finder_missing_item__')) { console.log('HTTP/1.1 ' + (scenario === 'not-found' ? '200 OK' : '404 Not Found')); process.exit(scenario === 'not-found' ? 0 : 1); }
 if (args.includes('--server-response')) console.log('HTTP/1.1 200 OK\\n' + (scenario === 'headers' ? '' : 'Content-Security-Policy: default-src \\'self\\'\\nCross-Origin-Opener-Policy: same-origin\\nCross-Origin-Resource-Policy: same-origin\\nStrict-Transport-Security: max-age=31536000\\nX-Content-Type-Options: nosniff\\nX-Frame-Options: DENY'));
}
`;
    for (const tool of ["docker", "npm", "curl"]) writeFileSync(join(bin, tool), shim, { mode: 0o755 });
    const logPath = join(dir, "commands.log");
    writeFileSync(logPath, "");
    const result = spawnSync("bash", [join(checkout, "deploy.sh"), ...(scenario === "local" ? ["--local"] : [])], {
      cwd: dir, encoding: "utf8", timeout: 20_000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, DEPLOY_TEST_SCENARIO: scenario, DEPLOY_TEST_LOG: logPath, DEPLOY_TEST_MARKER: join(dir, "started"), HOMEPAGE_PUBLIC_ORIGIN: "https://me.samuelzhang.co.uk", HOMEPAGE_PORT: "5174", VERIFY_PUBLIC_ORIGIN: "0" },
    });
    assert.ifError(result.error);
    const log = readFileSync(logPath, "utf8");
    const output = result.stdout + result.stderr;
    assert.equal(result.status, ["success", "local", "public"].includes(scenario) ? 0 : 1, `${scenario}: ${output}`);
    if (scenario === "success" || scenario === "local") {
      assert.match(log, /npm ci --include=dev --no-fund --no-audit/);
      assert.match(log, /npm run check:orbitals/);
      for (const locale of ["en-gb", "en-us", "zh-cn", "zh-tw"]) assert.ok(log.includes(`/${locale}/orbitals`));
      assert.ok(log.includes("/__finder_missing_item__"));
      assert.ok(!log.includes("docker tag"));
      assert.equal(readFileSync(join(checkout, ".env"), "utf8"), "VERIFY_PUBLIC_ORIGIN=0\n");
    }
    if (scenario === "success") {
      assert.equal(readFileSync(join(checkout, "fixture.txt"), "utf8"), "updated\n");
      assert.match(output, /UPDATED_SCRIPT/);
    }
    if (["dirty", "untracked", "ahead", "branch", "install", "build", "port", "lookup", "inspect", "empty-image"].includes(scenario)) assert.ok(!log.includes("compose up"), scenario);
    if (["health", "headers", "not-found", "public-redirect"].includes(scenario)) {
      assert.match(log, /docker tag sha256:previous samuel-homepage:production/);
      assert.match(log, /compose up -d --no-build --force-recreate/);
    }
    if (scenario === "first") assert.match(log, /compose rm --stop --force samuel-homepage/);
    if (scenario === "dirty") assert.equal(readFileSync(join(checkout, "fixture.txt"), "utf8"), "local edit\n");
    checks++;
    console.log(`PASS deployment: ${scenario}`);
  }
  console.log(`${checks} deployment scenarios passed (mocked Docker/npm, real local Git).`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
