# Project locale review — 9 September 2026

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

The project browser, canonical documents and representative interactive states were reviewed in Chromium against the local preview. The review corrected missing localized page metadata and two accessible-label interpolation gaps, then refined Traditional Chinese project terminology. No untranslated visitor-facing English sentences remained in the reviewed Mandarin states, except the deliberately preserved source material described below.

## Changes

- Canonical project page titles and descriptions now use the same narrative translation source as the document heading and summary. Browser tabs and shared-page metadata therefore follow the selected locale.
- Innovation model sliders previously announced lowercase internal values such as `diffuse` and `dedicated` inside Chinese sentences. Their value descriptions now use the reviewed model labels, including the opposite `Focused` / `Ad hoc` state.
- The regularisation graph now announces its translated model label instead of the internal `ridge` / `lasso` identifier.
- Project walkthrough introductions use Chinese sentence punctuation in both Mandarin editions.
- The CV experiment's two English source-text fields now explicitly preserve `lang="en"` and `translate="no"`; they previously inherited the interface language despite containing English matcher inputs.
- Refined 146 Traditional-only narrative entries with consistent terms such as 互動, 連結, 建置, 招募, 履歷, 匯出, 搜尋, 快取 and 取樣. Synced the 11 corresponding desktop-menu entries to prevent title/summary drift. Proper names, quantitative results and the Simplified translations were retained.
- Rebuilt all four project search indexes after the copy changes; the search freshness and translation-drift checks pass.
- The complete English crawl identified additional US spelling gaps in headings and prose, including `Optimisation`, `Regularisation`, `analyse`, `recognised`, `normalising`, `normalisation`, `realised` and `labelled`. The shared locale helper now regionalizes these forms; the affected US documents were checked again. The proper name **Singapore Civil Defence Force** and quoted English source documents keep their original spelling.

## Browser coverage

The canonical route format is `/{locale}/projects?project={slug}`. The final route matrix covers all 40 catalogue slugs in `en-gb`, `en-us`, `zh-cn` and `zh-tw`: **160 document routes**, all HTTP 200 with no page errors. Each page was loaded in Chromium at 1440 × 1100 with reduced motion, waiting for the document and lazy demo content before extracting text and accessible labels. Checks included response status, page errors, document headings, browser titles, visible text, `aria-label`, `aria-valuetext`, `title`, `alt` and placeholders. Code, equations and explicit source-language regions were treated separately from interface copy. All document titles contained their localized headings, and all HTML language tags matched the route. Nine affected US documents and the CV document in the other three locales were revisited after the final regional/source-language fixes; the detected spelling gaps were absent.

Additional browser states:

| Coverage | Locales | States reviewed |
| --- | --- | ---: |
| Initial split pane, no-result query, blocked full-text-search request, clear filters, Research filter, selected document, on-demand demo, new-tab target, 390px detail and back-to-list behavior | All four | 28 snapshots |
| Chapter choices and expanded explanatory details in innovation models, regularisation, finance, Italian learning, STUDY-RL, MRI, CFD, microrobots, environment planner, causal/OPE and home lab | Both Mandarin editions | 90 snapshots |
| Finance duplicate imports, changed provider identities, balance mismatch and empty statements, each through three import/replay attempts | Both Mandarin editions | 24 snapshots |
| Opposite innovation slider values, Ridge graph label, held booking slot and competing booking request | Both Mandarin editions | 8 snapshots |

The browser checks exercised actual localized controls. For example, the failed-search/empty state showed **暂时无法搜索全文，当前显示项目简介中的匹配结果。** / **暫時無法搜尋全文，目前顯示專案簡介中的符合結果。**, with localized counts, reset actions and empty-detail guidance. The new-tab links retained their current locale. At 390px, returning to the list restored the localized list and filter controls.

The 90 chapter/detail snapshots represent the choices present in each initial demo's navigation, followed by its expanded details. They do not imply that every combination of internal model controls was replayed in a browser.

## Deliberate source-language exceptions

- Product, organization and author names retain their spelling, including COVERD, GROWMAT, Ocean Depths Finance, Parliamo!, Samuel Zhang and named collaborators.
- Programming languages, package names, model identifiers, API names, units and scientific notation remain recognizable: for example PyTorch, U-Net, PC-SAFT, PSNR, `rFFT`, `mol m⁻³` and package filenames.
- The CV keyword experiment preserves the fictional English CV and job-description inputs because the matching rules operate on those exact English documents. Its translated explanation identifies this choice. The controls, analysis and feedback are localized.
- Italian practice prompts, vocabulary and example sentences remain Italian learning material; their surrounding controls and feedback are localized. Source-language regions are marked in the component implementation.
- Code snippets, authored equations, recorded model inputs/outputs, original notebooks/PDFs and external references retain their source language. This review did not rewrite linked scientific source files.
- Fictional merchant/person/service identifiers and diagram codes remain stable, including Alex/Morgan/Riley, bank/merchant names, `SYN-…`, `edge-a` and OPP/ENB/ADV/PRO. These are identifiers rather than untranslated interface instructions.

## Repository validation

`npm run check:project-copy`, `npm run check:locales`, `npm run prepare:search`, `npm run check:search` and `git diff --check` pass. The existing copy checks cover 7,364 bilingual entries in 39 registered source files, plus 862 catalogue/story/origin strings across all 40 projects. They also exercise helper-component and dynamic-state localization through the existing rendered-tree fixture suites. These automated checks supplement the browser matrix; their fixtures are not counted as additional browser visits.

The parent integration review records the final production build, lint and overall visual checks. This is a bounded review of rendered defaults, selected interaction states and known source exceptions, not a claim that every possible user input or scientific state has been exhaustively tested.

## Evidence

Local working evidence is under `/tmp/samuel-refinement-review/`:

- `project-locales-crawl.json` and `crawl-project-locales.cjs`: canonical route snapshots and repeatable Chromium crawler.
- `project-state-crawl.json` and `project-state-crawl.cjs`: 90 chapter/expanded-detail snapshots.
- `project-feedback-crawl.json` and `project-feedback-crawl.cjs`: 32 import, accessible-value and booking feedback snapshots.
- `project-browser-states.json` and `project-browser-states.cjs`: 28 browser/filter/narrow-layout snapshots, plus four locale screenshots.
- `project-tw-terminology.json`: the 146 Traditional narrative edits reviewed in this pass.
- `project-regional-followup.json` and `project-regional-followup.cjs`: twelve affected regional/source-language document rechecks, merged back into the 160-route matrix.
- `project-cv-source-language.json`: explicit `lang="en"` / `translate="no"` checks on both CV source textareas in all four locales.

These are local audit receipts and are not exposed in the visitor interface.

## Completed route matrix

Every cell below represents a successful canonical document load with its localized heading and browser title verified.

| Project slug | en-GB | en-US | zh-CN | zh-TW |
| --- | --- | --- | --- | --- |
| `orbital-lab` | Pass | Pass | Pass | Pass |
| `desk-note-pad` | Pass | Pass | Pass | Pass |
| `desk-sketch-pad` | Pass | Pass | Pass | Pass |
| `desk-quick-list` | Pass | Pass | Pass | Pass |
| `desk-focus-clock` | Pass | Pass | Pass | Pass |
| `desk-pocket-calendar` | Pass | Pass | Pass | Pass |
| `desk-calculator` | Pass | Pass | Pass | Pass |
| `desk-unit-converter` | Pass | Pass | Pass | Pass |
| `desk-colour-studio` | Pass | Pass | Pass | Pass |
| `coverd-ai` | Pass | Pass | Pass | Pass |
| `growmat` | Pass | Pass | Pass | Pass |
| `insurance-lead-matching` | Pass | Pass | Pass | Pass |
| `cv-keyword-automator` | Pass | Pass | Pass | Pass |
| `ocean-depths-finance` | Pass | Pass | Pass | Pass |
| `coverd-yasa` | Pass | Pass | Pass | Pass |
| `parliamo-italian-learning` | Pass | Pass | Pass | Pass |
| `course-recommender-audit` | Pass | Pass | Pass | Pass |
| `study-rl` | Pass | Pass | Pass | Pass |
| `sequential-decisions-lab` | Pass | Pass | Pass | Pass |
| `microrobot-vision` | Pass | Pass | Pass | Pass |
| `trustworthy-mri-reconstruction` | Pass | Pass | Pass | Pass |
| `neural-cfd-surrogates` | Pass | Pass | Pass | Pass |
| `air-quality-sensor-optimisation` | Pass | Pass | Pass | Pass |
| `cost-sensitive-cyber-detection` | Pass | Pass | Pass | Pass |
| `regularisation-lab` | Pass | Pass | Pass | Pass |
| `safety-critical-ai` | Pass | Pass | Pass | Pass |
| `safe-learning-to-defer` | Pass | Pass | Pass | Pass |
| `causal-ope-lab` | Pass | Pass | Pass | Pass |
| `innovation-models-reflection` | Pass | Pass | Pass | Pass |
| `ai-venture-reasoning` | Pass | Pass | Pass | Pass |
| `pc-saft-thermodynamics` | Pass | Pass | Pass | Pass |
| `drug-solubility` | Pass | Pass | Pass | Pass |
| `molecular-recognition` | Pass | Pass | Pass | Pass |
| `cprot-spectroscopy-plotter` | Pass | Pass | Pass | Pass |
| `gromacs-hpc` | Pass | Pass | Pass | Pass |
| `deep-learning-environment-resolver` | Pass | Pass | Pass | Pass |
| `home-automation-stack` | Pass | Pass | Pass | Pass |
| `stock-market-engine` | Pass | Pass | Pass | Pass |
| `covid-decision-support` | Pass | Pass | Pass | Pass |
| `coding-series` | Pass | Pass | Pass | Pass |
