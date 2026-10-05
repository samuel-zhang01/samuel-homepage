# Project copy audit receipts

The 30 `*.audit.json` files register translation dictionaries, component/data sources and explained source-language identities for [the project-copy gate](../../check-project-copy.mjs). Rendered localisation checks also read their identity declarations. They are validation input, separate from the runtime dictionaries under `src/components/projects/copy/`, and remain active consumers in the repository ownership inventory.

On 4 October 2026 the 30 receipts moved here without byte changes. Their `dictionary` values still resolve within `src/components/projects/copy/`; their `sources` and `dataSources` remain repository-relative. See [the translation workflow](../../../docs/PROJECT_COPY_WORKFLOW.md) before updating a receipt or dictionary together.

| Field | Contract |
| --- | --- |
| `dictionary` | Dictionary filename relative to `src/components/projects/copy/` |
| `exportName` | The dictionary's named export |
| `sources` | Repository-relative component paths with explicit `ProjectCopy` render scopes |
| `dataSources` | Optional repository-relative data paths whose authored strings are also inventoried |
| `identities` | Source strings mapped to reviewed reasons for keeping proper names, code or scientific identifiers unchanged |

When adding or changing project copy, update the relevant dictionary and receipt together. Keep explicit Simplified/Traditional Chinese pairs, preserve template placeholders and explain each untranslated identity. Do not register ordinary explanatory prose as a source-language exception. Shared desktop strings, such as the Contact/YASA call-booking label, belong in `src/lib/i18n.ts` rather than an unrelated demo dictionary.

From the repository root, run:

```bash
npm run check:project-copy
npm run check:locales
npm run audit:repository
```

The copy gate scans this directory for `*.audit.json`; an empty registry fails. It validates registered exports, bilingual entries, placeholders, identity explanations and authored-source coverage. The full command also runs rendered MRI, learning, physical-science and project-narrative localisation checks. Passing these gates establishes their registered scope; review changed interactive states in both Mandarin editions and at a narrow viewport as described in [the verification guide](../../../docs/VERIFICATION.md).

Keep reusable receipts here. Temporary screenshots and QA logs belong under ignored `.codex/reports/`; archive completed evidence outside the checkout with verified hashes.
