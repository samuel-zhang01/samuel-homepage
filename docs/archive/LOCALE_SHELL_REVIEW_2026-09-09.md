# Desktop and accessory language review — 9 September 2026

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

The desktop/app route crawl completed in all four maintained locales. The reviewed pages and interactive states have translated visitor prose and control labels; names, chemical symbols, keyboard notation and identified source documents keep their necessary original spelling. The review also corrected several context and regional-spelling issues that a missing-key check alone did not catch.

## Changes

- The Orbital Lab now supplies all 118 chemical element names in Simplified and Traditional Mandarin in the element selector, selected-element card, periodic-table accessible names and tooltips, and exported ASCII studies. Taiwan-specific names are explicit, including 矽, 鎝, 鎦, 砈, 鍅, 錼 and 鈽. The English US edition uses Aluminum, Cesium and “Color key”. The obsolete note claiming that the interface retains English element names was removed.
- COVERD’s evidence label now reads “简历 + 语音” / “履歷 + 語音”. The home-lab service labels translate “Air Quality” and “Lab” while retaining Aranet and Odoo.
- Quick List uses “To do” / “待办” / “待辦” for unfinished tasks. Its previous “Open” label inherited the global translation for opening an application. The completed-task checkbox now says “重新标为待办” / “重新標為待辦”.
- The shared US-English formatter now covers the observed licence, organise/organisation, normalising/normalisation, recognise, optimise/optimisation, Regularisation, labelled, realised and analyse gaps, with the required capitalized forms. The analyse replacement uses word boundaries so the noun “analyses” stays intact. The companion project review supplied several of these observed inflections.
- The supporting reinforcement-learning syllabus is identified as an English PDF in Documents; its archival source content is retained. Maintained CVs continue to select their corresponding locale asset.
- The existing locale gate now also requires 118 distinct Chinese element names per Mandarin edition and checks the observed US-English forms.

## Browser coverage

Chromium 151 via Playwright; preview at `http://127.0.0.1:5174`; fresh isolated contexts, reduced motion, 1440 × 1000 for the route and state matrix. Final route crawl: **60/60 visits**, all HTTP 200, expected document language, no captured page errors and no outer-page horizontal overflow.

| Scope | Coverage |
| --- | --- |
| Main routes, each in en-GB, en-US, zh-CN, zh-TW | Locale home, about, contact, COVERD, desk, documents, education, experience, games, interests, home lab, orbitals, RUN/HACK, skills, projects |
| Rendered content | Body text, visible-element aria-label/title/placeholder/alt attributes, document title, description, document language, page errors and outer overflow |
| Accessories, each locale | Orbital Lab plus all eight everyday accessories; invalid backup feedback |
| Arcade, each locale | All seven games; English word-game invalid-entry feedback |
| Navigation, each locale | Three contact tabs, four RUN/HACK chapters, six system menus, Finder default/empty/name-search/detailed-search states |
| Interactive state captures | **140 snapshots**; final state crawl had no harness failures |
| Changed scientific labels | All 118 periodic-table accessible names in each Mandarin edition; Aluminium/Aluminum and Chinese aluminium selections; element 118; localized ASCII download and feedback in all four locales |
| Changed task semantics | At **390 × 844**, all four locales: add a task → To do → complete → Completed → reopen → To do; no outer horizontal overflow |

The initial development-server crawl was discarded after the server restarted. One initial English Documents visit exceeded its wait; a direct retry and the complete final route crawl succeeded. Early state-harness clicks were refined to wait for hydration and the selected app; Finder uses a native `dialog`. The mobile task harness uses click plus row-removal assertions because completing a task removes its checkbox from the selected filter. These harness issues are not counted as successful product checks.

## Evidence and checks

- [Traditional Mandarin Orbital Lab, including element 118](../reviews/locale-shell-2026-09-09/orbital-zh-tw.png)
- [Simplified Mandarin task filter at 390px](../reviews/locale-shell-2026-09-09/tasks-zh-cn-390.png)
- [Traditional Mandarin task filter at 390px](../reviews/locale-shell-2026-09-09/tasks-zh-tw-390.png)
- Full local records: `/tmp/samuel-refinement-review/shell-routes-final.json`, `shell-english-candidates-final.json`, `shell-states.json`, `shell-refinement-checks.json`, `task-locale-checks.json` and `element-font-coverage.json`. The executable crawl/check scripts are in that same temporary directory.
- `npm run check:locales`, `npm run check:desk`, scoped ESLint and `npx tsc --noEmit` passed. The desktop behavior gate covered 28 existing timer, converter and calculator regressions. The parent review owns the integrated build and final design checks.

## Name references and limits

Chemical names were checked against [Ptable’s Simplified edition](https://ptable.com/?lang=zh-hans) and [Traditional edition](https://ptable.com/?lang=zh-hant), with Taiwan-specific forms cross-checked against [Tunghai University teaching notes](https://physexp.thu.edu.tw/~mengwen/note/shs-note.pdf). In particular, the latter gives Taiwan’s 鍅 for francium. The [Chinese Academy of Sciences account of the four newly named elements](https://isl.cas.cn/kxcbn/kpwz/202306/t20230629_6798114.html) explains the names of elements 113, 115, 117 and 118.

Noto CJK and Unifont were installed on this review server for language rendering. No font downloads were added to the site. The installed Noto Sans CJK font contains all **214 distinct characters** across the two 118-name catalogues; its serif companion lacks 𫟷, so fallback still matters. Element 118 was visually checked after restarting the browser with the fonts installed. A visitor’s own font set determines rare-character rendering; chemical symbols and atomic numbers remain present alongside each name.

This is a route-and-representative-state review, not a proof of every reachable interaction. It does not exhaust game win/loss states, storage-quota failures, every imported file, every accessibility technology, browsers other than Chromium, or the content of source PDFs rendered on canvas. The English RL syllabus, proper names, product names, source-language exercises, code, formulas, units and keyboard notation are intentional exceptions. Full project-document and demo coverage is recorded separately in the companion locale project review. No deployment or external messages were made.
