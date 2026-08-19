import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const publicRoot = join(process.cwd(), "public");
const projectRoot = join(publicRoot, "projects");
const allowlist = new Map([
  ["Samuel-Zhang-Applied-AI-CV.pdf", {
    maximumBytes: 500_000,
    sha256: "4f5a51d820e4a52e354b07929271dc55706251b80c277586482135e9c7840c72",
    type: "pdf",
  }],
  ["Samuel-Zhang-Applied-AI-CV-en-US.pdf", {
    maximumBytes: 500_000,
    sha256: "c8e8c4c7d4c49b81b044d37b48612822f6cb0b373263cc10263f856cead828d8",
    type: "pdf",
  }],
  ["Samuel-Zhang-Applied-AI-CV-zh-CN.pdf", {
    maximumBytes: 500_000,
    sha256: "7fcd82fca925dfef7fa7b7fd8d91d566e056b2cfc31c6378d95ba393bc112324",
    type: "pdf",
  }],
  ["Samuel-Zhang-Applied-AI-CV-zh-TW.pdf", {
    maximumBytes: 500_000,
    sha256: "8528eb5e1b0cd95c658ac527f5ac3306c50983fbf73975539a41057f7270a79e",
    type: "pdf",
  }],
  ["GROWMAT Showcase External Highest Quality.pdf", {
    maximumBytes: 8_500_000,
    sha256: "dd32da42f53d19a5e27c5c6eff5bddea10b6cc0a2f4307def894e33628762312",
    type: "pdf",
  }],
  ["projects/neural-cfd-surrogates/cylinder-wake.png", {
    maximumBytes: 100_000,
    sha256: "fa110311db8a9a4e9cf44495032fd6b97517e8aa398a1267c5cbacd2398e1b4a",
    type: "png",
  }],
  ["projects/parliamo/practice-workbook.pdf", {
    maximumBytes: 200_000,
    sha256: "b47c7d6bcaeb19df38fccf1900900b3993e4b30afc9e71fa29bff55e1eadd4cb",
    type: "pdf",
  }],
  ["projects/parliamo/reading-workbook.pdf", {
    maximumBytes: 150_000,
    sha256: "6f8093133331c988cf55646b567222ae59958af7f11bf172c5abdd5910abdb51",
    type: "pdf",
  }],
  ["projects/study-rl/syllabus.pdf", {
    maximumBytes: 220_297,
    sha256: "6f75ff7c78a4f8c3836314eba7438b57678513961e29c6757ea00cc53823d91d",
    type: "pdf",
  }],
]);

const forbiddenPublicArtifacts = [
  "CVtemplateProduct.pdf",
  "Samuel-Zhang-Profile.pdf",
  "UndergradThesis.pdf",
];

for (const publicPath of forbiddenPublicArtifacts) {
  try {
    await lstat(join(publicRoot, publicPath));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") continue;
    throw error;
  }
  throw new Error(`Forbidden public artifact must remain absent: ${publicPath}`);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Public project artifacts may not be symlinks: ${path}`);
    }
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    if (entry.isFile()) files.push(path);
  }

  return files;
}

const files = await collectFiles(projectRoot);
const publicFiles = await collectFiles(publicRoot);
const guardedPublicExtension = /\.(?:pdf|docx?|xlsx?|csv|tsv|parquet|db|sqlite[^/]*|ipynb|pt|pth|ckpt|pem|key|zip|7z|tar|gz)$/i;
const sensitivePublicName = /(?:^|\/)(?:\.env(?:\.|$)|[^/]*(?:private|preshared)[-_]?key[^/]*|credentials?(?:\.|$)|secrets?(?:\.|$)|passwords?(?:\.|$)|keys\.json$)/i;
const privateKeyMarker = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
let totalBytes = 0;

for (const path of files) {
  const publicPath = relative(publicRoot, path).split(sep).join("/");
  if (!allowlist.has(publicPath)) {
    throw new Error(`Unreviewed public project artifact: ${publicPath}`);
  }
}

for (const path of publicFiles) {
  const publicPath = relative(publicRoot, path).split(sep).join("/");
  if (sensitivePublicName.test(publicPath)) {
    throw new Error(`Sensitive credential-shaped filename is forbidden in public/: ${publicPath}`);
  }
  if (guardedPublicExtension.test(publicPath) && !allowlist.has(publicPath)) {
    throw new Error(`Unreviewed public document, data, model, or key artifact: ${publicPath}`);
  }

  // Private-key PEM blocks can be hidden inside extensionless configuration,
  // JSON or copied runtime files. Scan every public byte stream for the stable
  // marker without attempting to print or otherwise inspect the key material.
  const bytes = await readFile(path);
  if (privateKeyMarker.test(bytes.toString("latin1"))) {
    throw new Error(`Private-key material is forbidden in public/: ${publicPath}`);
  }
}

for (const [publicPath, expected] of allowlist) {
  const path = join(publicRoot, ...publicPath.split("/"));

  const metadata = await lstat(path);
  if (!metadata.isFile()) throw new Error(`Artifact is not a regular file: ${publicPath}`);
  if (metadata.size > expected.maximumBytes) {
    throw new Error(
      `${publicPath} is ${metadata.size} bytes; reviewed maximum is ${expected.maximumBytes} bytes`,
    );
  }

  const bytes = await readFile(path);
  const isPdf = bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = pngHeader.every((value, index) => bytes[index] === value);
  if ((expected.type === "pdf" && !isPdf) || (expected.type === "png" && !isPng)) {
    throw new Error(`${publicPath} does not match its reviewed ${expected.type.toUpperCase()} type`);
  }

  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== expected.sha256) {
    throw new Error(`${publicPath} content changed; review and update its SHA-256 allowlist entry`);
  }

  totalBytes += metadata.size;
}

console.log(`Public artifact gate: ${allowlist.size} hash-pinned files, ${totalBytes} bytes.`);
