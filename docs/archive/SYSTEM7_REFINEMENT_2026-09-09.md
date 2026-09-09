# Icons, depth and language refinement — 9 September 2026

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

This pass adds a shared 1990s icon family and restores clearer grey layers while preserving the searchable split-pane project browser and smooth text. It also repeats the complete four-language route crawl and checks representative interactive states. This is the latest local review; the [earlier integrated review](SYSTEM7_REVIEW_2026-09-09.md) records the preceding redesign and cleanup.

## Icon delivery

The editable assets are in [`public/system7-icons`](../../public/system7-icons): **32 SVG symbols plus four transparent 128 × 128 PNG variants**, 54,881 bytes in total. [View the complete family](../reviews/system7-refinement-2026-09-09/icon-family.png).

The built-in image-generation tool produced the folder, microscope, computer and finance PNGs. The folder established the reference style for subsequent generations: stepped charcoal outlines, pale grey and white surfaces, restrained periwinkle blue and ochre, shallow highlights, bevels and hard shadows. Computer and finance received a second generation pass to remove painted transparency grids. All four delivered PNGs were checked for actual alpha transparency, then resized with nearest-neighbour sampling. A generated book draft did not pass transparency QA; its companion SVG is used. Exact generation and refinement prompts are saved in [SYSTEM7_ICON_PROMPTS.json](../SYSTEM7_ICON_PROMPTS.json).

The SVGs are separately authored editable vector companions on a 32px coordinate grid. They are not automatic vectorizations of the generated images. `System7Icon` chooses PNG artwork for those four subjects at normal size and SVGs for 16px miniatures. The other subjects use SVG at every size. Desktop icons, app menus, Finder and compact project rows now share this family. The original COVERD logo and three full project-cover illustrations remain in their existing roles. Icons are decorative images; adjacent translated labels supply their names.

The asset named `star.svg` serves the desktop's existing `secret` icon kind. The more literal filename matched the repository's sensitive-file guard; the asset was renamed without relaxing that guard.

## Depth and typography

Compared the current browser with the earlier interface and actual Apple System 7.5 screenshots. The [depth review](SYSTEM7_DEPTH_REFINEMENT_2026-09-09.md) links the exact source pages and before/after evidence. The [design benchmark](../SYSTEM7_DESIGN_BENCHMARK.md) contains the final token and control contracts.

- White documents, pale supporting panels, grey chrome and darker recessed backing now have distinct roles. Crisp inset and raised edges, ribbed tab backing, title stripes and fine double seams restore separation.
- The graph's white canvas and pale inspector sit within a grey frame. Project metadata, Development and Results have clearer boundaries; live experiments have a grey surrounding frame.
- Prose keeps the smooth existing font stack at 15px with 1.55 line height. Window titles use 13px and 1.4 line height. Chinese fallbacks remain explicit, with no new client font download.
- Demo jumps measure the sticky toolbar rather than assuming a fixed height. Wrapped translated actions leave approximately 16px of space above the experiment at narrow widths.

## Language crawl and corrections

| Scope | Completed coverage |
| --- | --- |
| Project documents | All **40 projects × four locales = 160 routes**, including title, metadata, document language and loaded demo content |
| Main desktop/application routes | **60 route visits** across English UK/US and Simplified/Traditional Mandarin |
| Project states | **150 additional snapshots** covering browser filters and errors, chapters, details and dynamic feedback; 12 regional/source-language follow-ups |
| Shell states | **140 snapshots** across accessories, games, contact, journal, system menus and Finder; additional four-language mobile task flows |
| Orbital Lab | All **118 element names** in each Mandarin edition, including controls, accessible labels and ASCII exports |

Corrections include project-page metadata, Traditional Mandarin terminology, US spelling, slider labels, regularisation legends, Chinese punctuation, task-filter meanings and reopen actions, COVERD/home-lab labels and chemical element names. The existing locale gate now checks the new element catalogues and observed regional forms. Search indexes were rebuilt after the copy changes.

The [project locale review](LOCALE_PROJECT_REVIEW_2026-09-09.md) and [shell locale review](LOCALE_SHELL_REVIEW_2026-09-09.md) record precise coverage and limitations. English source PDFs, source quotations, Italian exercises, code, mathematical notation, units and proper names deliberately retain their original language; they are identified where relevant. These counts are route and representative-state coverage, not a claim that every possible game outcome, imported file or assistive technology was tested.

## Integrated verification

`npm run build:isolated`, full ESLint, TypeScript and whitespace checks passed. The isolated build includes all repository preparation, artifact, behavior, catalogue, graph, mathematics, localization and output-budget gates. It generated 83 pages. Final output: **118 browser files, 5.09 MiB**, including **257.1 KiB** demand-loaded mathematics; **249.5 KiB** initial JavaScript gzip; **4.79 MiB** traced application runtime. The icon files are additional public assets; the size above is the build's browser-file measurement.

The final compiled browser on port 5175 passed selection, history, search/empty/reset, discipline filtering, keyboard navigation, lazy inline demos, new-tab documents, graph connections, direct demo links, hidden-demo unmounting and mobile focus restoration. Narrow list/detail layouts were checked at 320, 390 and 768px, with both Mandarin editions reviewed. No uncaught page errors were recorded. The focus check waits for the application's animation-frame focus restoration; an initial immediate assertion ran before that frame.

Five final production layouts passed icon loading, decorative-label and outer-overflow checks; all 36 icon asset URLs returned HTTP 200. Twelve production demo-clearance checks passed across English UK and both Mandarin editions at 320/390px, for both inline launches and direct demo URLs. The measured experiment-to-toolbar gap ranged from 15.73 to 16.98px; the first demo heading remained visible in every case. The image harness uses intersection visibility so lazily loaded icons outside a scroll pane are not mistaken for broken visible artwork.

Retained production captures: [desktop](../reviews/system7-refinement-2026-09-09/desktop.png), [graph](../reviews/system7-refinement-2026-09-09/graph.png), [project browser](../reviews/system7-refinement-2026-09-09/project-browser.png), [Traditional Mandarin browser](../reviews/system7-refinement-2026-09-09/project-browser-zh-tw.png), [mobile document](../reviews/system7-refinement-2026-09-09/mobile-document-zh-tw.png), and [320px mobile demo](../reviews/system7-refinement-2026-09-09/mobile-demo-320.png). The family sheet uses the delivered assets directly; the other images capture the compiled application.

Full production image/loading and demo-clearance evidence is recorded alongside the local scripts in `/tmp/samuel-refinement-review/`. The review uses Chromium; no new cross-browser certification, Lighthouse score or exhaustive accessibility claim is made. Noto CJK and Unifont were installed on this server to inspect Chinese text, without changing the site's font payload. Visitor font availability still governs rare-character glyph coverage.

## Preview and handoff

Development preview: **http://localhost:5174/en-gb/projects**. The compiled review server uses port 5175. All changes remain local on top of `d65e1d1`; this pass did not create a commit, push or deployment. [continue.md](../../continue.md) is the next-session handoff.
