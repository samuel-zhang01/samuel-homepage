import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const componentRoot = resolve(projectRoot, "src/components/projects");
const sharedComponentRoot = resolve(projectRoot, "src/components");
const errors = [];
let checkedReferences = 0;

const componentPaths = [
  ...readdirSync(componentRoot)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => resolve(componentRoot, name)),
  resolve(sharedComponentRoot, "ProductivityApps.tsx"),
  resolve(sharedComponentRoot, "ProductivityExtras.tsx"),
];

for (const componentPath of componentPaths) {
  const file = basename(componentPath);
  const source = readFileSync(componentPath, "utf8");
  const styleImport = source.match(/import\s+styles\s+from\s+["']\.\/(.+?\.module\.css)["']/);
  if (!styleImport) continue;

  const stylesheetPath = resolve(dirname(componentPath), styleImport[1]);
  const stylesheet = readFileSync(stylesheetPath, "utf8");
  const declaredClasses = new Set(
    [...stylesheet.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]),
  );
  const referencedClasses = new Set(
    [...source.matchAll(/styles\.([A-Za-z_$][\w$]*)/g)].map((match) => match[1]),
  );

  for (const className of referencedClasses) {
    checkedReferences += 1;
    if (!declaredClasses.has(className)) {
      errors.push(`${file}: styles.${className} is absent from ${styleImport[1]}`);
    }
  }
}

if (errors.length) {
  console.error("Project CSS-module validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Project CSS-module gate: ${checkedReferences} static class references resolved.`);
