import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-build/**",
      ".next-*/**",
      "out/**",
      "build/**",
      "hackathon/**",
      // Copied verbatim from the pinned pdfjs-dist package at build time.
      // Lint our loader, not the generated third-party vendor payload.
      "public/_vendor/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
