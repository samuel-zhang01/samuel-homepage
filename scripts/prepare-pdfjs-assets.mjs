import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pdfJsRoot = join(repositoryRoot, "node_modules", "pdfjs-dist");
const publicRoot = join(repositoryRoot, "public", "_vendor", "pdfjs");
// Keep the full redistribution licence beside the unmodified browser files.
// This directory is generated from the locked dependency, not hand-vendored.
const assets = [
  { source: "build/pdf.min.mjs", destination: "pdf.min.mjs" },
  { source: "build/pdf.worker.min.mjs", destination: "pdf.worker.min.mjs" },
  { source: "LICENSE", destination: "LICENSE" },
];

await mkdir(publicRoot, { recursive: true });

for (const asset of assets) {
  const source = join(pdfJsRoot, asset.source);
  const destination = join(publicRoot, asset.destination);
  const sourceBytes = await readFile(source);
  let destinationBytes;
  try {
    destinationBytes = await readFile(destination);
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
  }
  if (!destinationBytes || !sourceBytes.equals(destinationBytes)) await copyFile(source, destination);
}

console.log("Prepared 2 browser-native PDF.js assets and their full Apache licence.");
