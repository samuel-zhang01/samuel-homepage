# Content, typography and project reading flow

This follow-up adds context to project overviews and connects the suggested exercise to its demonstration. It builds on the [artwork and media sweep](WIDE_SWEEP_2026-09-09.md).

## Changes

- Projects with an editorial story now show **Who it helps** and **The aim**, with a native **Samuel’s contribution** disclosure. The content comes from the existing reviewed story records and their explicit Simplified/Traditional Chinese translations. This covers 27 interactive stories and three noninteractive case studies; utility pages without these records retain their existing descriptions.
- The exercise paragraph now has a **Try this exercise** button. It shares the document’s existing launch/scroll handler. Embedded demos still mount only on request.
- An open demo offers **Close demo and return to overview**, with an explanation that unsaved changes are cleared. Closing unmounts the demo, returns to the project heading and restores keyboard focus to its toolbar launch button. Reopening works without leaving the project or disturbing the left-hand filters. Both launch controls expose their expanded state.
- A quiet inset grey context strip separates purpose from the development/results sections. Narrative line length is capped at 72 characters’ width; section headings use 1.4 line height for translated text. At narrow widths the two context columns become one.
- Seven named interface-heading groups now use the shared, locale-aware text font: project cards, chooser detail, arcade current selection, arcade game headings, HPLC heading, classic game heading and the secret app heading. Intentional puzzle-tile numerals and the styled quotation retain their serif treatment.
- Shared `ProjectCaseBrief` and `ProjectDocument` own the content and lifecycle behavior; no per-project copies or new dependencies were introduced.

## Validation

- Isolated production build, all repository build gates (including TypeScript and translation checks), ESLint and whitespace checks passed.
- Production browser flow checked in four locales at 1440px and 390px: context, translated contribution disclosure, deferred exercise launch, expanded state, close/unmount, focus restoration, reopening and document/page overflow.
- Existing production navigation regression suite passed: search/filter reconciliation, history, keyboard navigation, graph, new-tab links, deferred demo mounting, deep links, independent panes, 768/390/320px layouts, Mandarin labels and mobile focus restoration. No captured uncaught browser errors.
- Seven arcade selections checked for the updated heading font and page overflow.
- Narrative translation gate covers 862 existing strings across 40 projects, 27 interactive stories, three case studies and 11 career connections. New control labels have explicit CN/TW entries and were exercised in the browser. This is a focused follow-up, not a new exhaustive crawl of every state.
- Rounded production output remains 118 browser files / 5.10 MiB, 249.8 KiB initial JavaScript gzip and 4.80 MiB traced application runtime. Closing releases mounted demo components; no new timing benchmark is claimed.

Screenshots: [desktop overview](reviews/content-2026-09-09/en-gb-1440.png), [Traditional Chinese phone context](reviews/content-2026-09-09/zh-tw-context.png), [arcade typography](reviews/content-2026-09-09/arcade-type.png).

Development preview remains `http://localhost:5174/en-gb/projects`. The compiled follow-up was reviewed on port 5176. Temporary scripts and logs: `/tmp/samuel-content-review/`. This review preceded the [repository cleanup and Git checkpoint](REPOSITORY_CLEANUP_2026-09-09.md).
