# Project copy audit receipts

These JSON files register translation dictionaries, component/data sources and explained untranslated names for `scripts/check-project-copy.mjs`. Rendered localization checks also read their identity declarations. They are validation input, separate from the runtime dictionaries under `src/components/projects/copy/`.

On 4 October 2026 the 30 receipts moved here without byte changes. Their `dictionary` values still resolve within `src/components/projects/copy/`; their `sources` and `dataSources` remain repository-relative. See [the translation workflow](../../../docs/PROJECT_COPY_WORKFLOW.md) before updating a receipt or dictionary together.
