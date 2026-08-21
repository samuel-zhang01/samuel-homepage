import { lstat, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const outputRoot = resolve(process.cwd(), process.argv[2] || process.env.NEXT_DIST_DIR?.trim() || ".next");
const staticRoot = join(outputRoot, "static");
const standaloneRoot = join(outputRoot, "standalone");

const credentialMarkers = [
  {
    label: "private-key material",
    pattern: /-----BEGIN (?:(?:[A-Z0-9][A-Z0-9 -]*) )?PRIVATE KEY-----|-----BEGIN PGP PRIVATE KEY BLOCK-----/,
  },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "GitHub token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{36,255}|github_pat_[A-Za-z0-9_]{22,255})\b/ },
  { label: "GitLab token", pattern: /\bglpat-[A-Za-z0-9_-]{20,}\b/ },
  { label: "Google API key", pattern: /\bAIza[A-Za-z0-9_-]{35}\b/ },
  { label: "npm token", pattern: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { label: "Anthropic API key", pattern: /\bsk-ant-[A-Za-z0-9_-]{32,}\b/ },
  { label: "OpenAI API key", pattern: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b/ },
  { label: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { label: "Stripe live secret", pattern: /\bsk_live_[A-Za-z0-9]{20,}\b/ },
];

const textExtension = /\.(?:css|html?|js|json|mjs|rsc|svg|txt|xml)$/i;
const forbiddenRuntimeName = /(?:^|\/)(?:\.env(?:\.|$)|[^/]+\.(?:key|p12|pem|pfx))$/i;
const forbiddenRawArtifact = /\.(?:ckpt|csv|db|ipynb|onnx|parquet|pt|pth|safetensors|sqlite[^/]*|tsv)$/i;

async function requireRegularFile(path, label) {
  let metadata;
  try {
    metadata = await lstat(path);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(`${label} is missing: ${relative(process.cwd(), path)}`);
    }
    throw error;
  }
  if (!metadata.isFile()) throw new Error(`${label} is not a regular file: ${relative(process.cwd(), path)}`);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    if (entry.isFile()) files.push(path);
  }

  return files;
}

async function scanForCredentials(path, publicPath) {
  if (!textExtension.test(path)) return;
  const content = await readFile(path, "latin1");
  const matched = credentialMarkers.find(({ pattern }) => pattern.test(content));
  if (matched) throw new Error(`${matched.label} found in production output: ${publicPath}`);
}

await requireRegularFile(join(outputRoot, "BUILD_ID"), "Next.js build marker");
await requireRegularFile(join(standaloneRoot, "server.js"), "standalone server");

const staticFiles = await collectFiles(staticRoot);
const standaloneFiles = await collectFiles(standaloneRoot);
let staticBytes = 0;
let applicationRuntimeBytes = 0;

for (const path of staticFiles) {
  const publicPath = relative(outputRoot, path).split(sep).join("/");
  const metadata = await lstat(path);
  staticBytes += metadata.size;
  if (path.endsWith(".map")) {
    throw new Error(`Browser source map is forbidden in production output: ${publicPath}`);
  }
  if (forbiddenRawArtifact.test(path)) {
    throw new Error(`Raw data or model artifact is forbidden in browser output: ${publicPath}`);
  }
  await scanForCredentials(path, publicPath);
}

for (const path of standaloneFiles) {
  const publicPath = relative(standaloneRoot, path).split(sep).join("/");
  if (forbiddenRuntimeName.test(`/${publicPath}`)) {
    throw new Error(`Credential-shaped file is forbidden in standalone output: ${publicPath}`);
  }
  if (forbiddenRawArtifact.test(path)) {
    throw new Error(`Raw data or model artifact is forbidden in standalone output: ${publicPath}`);
  }

  // Third-party packages can contain documentation and fixtures that are not
  // browser-addressable. Scan application-owned runtime bundles and the entire
  // browser output, while filename gates still cover every traced dependency.
  if (!publicPath.split("/").includes("node_modules")) {
    applicationRuntimeBytes += (await lstat(path)).size;
    await scanForCredentials(path, publicPath);
  }
}

const formatMiB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
console.log(
  `Production output gate: ${staticFiles.length} browser files (${formatMiB(staticBytes)}), `
  + `${standaloneFiles.length} traced runtime files; application runtime ${formatMiB(applicationRuntimeBytes)}.`,
);
