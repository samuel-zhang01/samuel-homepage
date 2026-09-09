# Explicit project localization

Project demos inherit `useProjectLocale()` from the project shell. Every component owns the translation of the JSX it returns. A parent cannot translate the future render of `<Child />`, so **wrap helper components as well as the top-level demo**.

```tsx
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { exampleCopy } from "./copy/exampleCopy";

function Chart({ label }: { label: string }) {
  return <ProjectCopy copy={exampleCopy}><figure aria-label={label}>…</figure></ProjectCopy>;
}
```

The scope translates rendered text, accessible descriptions, common host labels, MathEquation's optional accessible label, and DemoWindow's authored strings and footer. It never executes another component, mutates the DOM, translates TeX, changes source URLs, or modifies event handlers. `pre`, `code`, `kbd`, `samp`, `math`, `translate="no"`, and `data-copy-source` preserve genuine source text. Do not put ordinary explanatory prose in a source exclusion.

A local table has stable English source keys and explicit Simplified/Traditional values:

```ts
import type { ProjectCopyTable } from "@/lib/projectCopy";
export const exampleCopy = {
  "Run experiment": ["运行实验", "執行實驗"],
  "{0} of {1} samples": ["共 {1} 个样本，已选 {0} 个", "共 {1} 個樣本，已選 {0} 個"],
} satisfies ProjectCopyTable;
```

Tables belong beside their lazy demo in `src/components/projects/copy/`. Import only the relevant local table so initial desktop loading does not import every demo's copy. Shared desktop/common translations remain available as a fallback. English follows existing UK/US regionalisation.

Use a registered template for dynamic strings. Normal JSX adjacent text and number fragments are combined before matching. Explicit formatting is also available via `projectText(locale, table, "{count} samples", { count })`. A dynamic value which is itself user-facing copy must have its own translation. Inspect data-driven labels, option lists, chart text, hover text, SVG accessibility labels, empty/error states, conditionals and callback-generated feedback; a static scanner cannot prove full runtime coverage.

Inventory authored candidates:

```
node scripts/project-copy-inventory.mjs src/components/projects/ExampleStudio.tsx --output /tmp/example-copy.json
```

The AST inventory includes JSX, common label/description data fields, attributes and templates, with stable SHA-256-derived IDs and source locations. It omits source-code blocks and TeX. Review the output: technical identifiers and URLs are not prose. Add new visitor-facing data field names to the scanner when a data structure introduces a new copy field.

Each dictionary adds its own `exampleCopy.audit.json` to avoid shared registry conflicts:

```json
{
  "dictionary": "exampleCopy.ts",
  "exportName": "exampleCopy",
  "sources": ["src/components/projects/ExampleStudio.tsx"],
  "identities": {"PSNR": "Established image-quality metric acronym, preserved in both locales."}
}
```

`node scripts/check-project-copy.mjs` validates both locales, template placeholders, unexplained English identities and inventory coverage in registered files. It separately verifies immutable source/math, accessible prop and footer translation, explicit component boundaries and interpolation. The report intentionally names its registered coverage; unregistered files are pending work. A passing inventory is necessary, but every interactive view/state still needs visual/runtime review in both Mandarin editions.

Before translating, rewrite internal audit/notebook/path receipts into visitor-facing purpose, contribution, interpretation and limitations. Preserve genuine method distinctions and reported vs illustrative results. Keep source links available with useful labels. Prefer natural Mandarin; review Traditional terminology (for example 資料, 訊息, 原始碼, 執行) rather than treating character conversion as editorial review.

## Current language coverage and source figures

The maintained routes are en-GB, en-US, zh-CN and zh-TW. Both Mandarin editions have explicit project prose, controls, error/empty states, accessible labels and all 118 element names; English US applies reviewed regional spelling. New MRI recorded-image captions, alternative text and navigation are part of the MRI render gate.

Saved figures may contain original English labels. Retain scientific source pixels, identify that language in a translated caption, and supply a translated description and interpretation. Do not suppress the surrounding prose with `translate="no"`, and do not use image generation to translate or alter experimental evidence. Original PDFs, code, equations, proper names and source-language learning exercises retain their necessary text.

The [current review](WIDE_SWEEP_2026-09-09.md) records the latest changed-state and browser checks. The complete preceding four-language crawl is retained in [the project-language review](archive/LOCALE_PROJECT_REVIEW_2026-09-09.md) and [shell-language review](archive/LOCALE_SHELL_REVIEW_2026-09-09.md). Coverage is a recorded scope, not a claim about every possible interaction.
