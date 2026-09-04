import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pdfJsRoot = join(repositoryRoot, "node_modules", "pdfjs-dist", "build");
const publicRoot = join(repositoryRoot, "public", "_vendor", "pdfjs");
const assets = ["pdf.min.mjs", "pdf.worker.min.mjs"];

await mkdir(publicRoot, { recursive: true });

for (const asset of assets) {
  const source = join(pdfJsRoot, asset);
  const destination = join(publicRoot, asset);
  const sourceBytes = await readFile(source);
  let destinationBytes;
  try {
    destinationBytes = await readFile(destination);
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
  }
  if (!destinationBytes || !sourceBytes.equals(destinationBytes)) await copyFile(source, destination);
}

console.log(`Prepared ${assets.length} browser-native PDF.js assets.`);
