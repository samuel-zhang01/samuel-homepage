# Homepage audit — 4 October 2026

The audits, translation review and cleanup are complete. This is the verified release checkpoint for `main`, with fresh checks on **548 frozen release inputs**. This report replaces overlapping dated UI reviews and handoffs. Scientific provenance, licences, the System 7 design contract, Classic/Blue/Paper patterns and reusable QA checks remain maintained.

## Repairs

- Centralized canonical, language-alternate and sharing metadata for direct section routes. Unknown finite locale/section routes now render the translated recovery screen on the server and return HTTP 404, including with JavaScript disabled. Next 15.5.25's nested thrown `notFound()` produced an empty shell in the previous dynamic production layout; inline recovery plus middleware status avoids that failure without an experimental flag or dependency change.
- Restricted locale, section, bootstrap and translation maps to their own keys. Inputs such as `constructor`, `__proto__` and `toString` previously caused redirects, server errors or native Object text in descriptions; they now retain literal source text unless an explicit translation exists.
- Preserved pending editor values during backup restore, delayed initialization and concurrent saves; retained unreadable originals. Corrected native form reset, required-field focus and selector cancellation behavior.
- Made overflowing equations keyboard-focusable only while they need horizontal scrolling, fixed narrow metric wrapping and heading/navigation names, and gave 78 labelled control containers group semantics.
- Repaired Gitless lint discovery and ordinary/isolated/Docker preflight coverage. Exact exclusions protect local reference trees; generated vendor/search/math inputs regenerate during prebuild. No private originals or scientific media were deleted.

Copy changes keep product names, code, scientific notation, original PDFs/images and recorded source-language examples intact. The [translation workflow](PROJECT_COPY_WORKFLOW.md) defines these exceptions and the checks for dynamic labels and accessibility text. All 30 project dictionaries were reviewed; **542 locale values across 521 entries in 27 files** were corrected, alongside 39 shared locale values. Desktop summaries match project narratives. The review corrected physical mass versus image quality, rows versus columns, model parameters, finance replay actions and Taiwan terminology. Source gates passed **7,628 bilingual entries in 40 registered source files, 906 rendered locale cases and 868 narrative strings**. These counts describe registered coverage, not every possible interaction.

## Dependencies and output

The initial full audit found five high-severity paths through Next's lint plugin, `fast-glob`, `micromatch` and `braces`. The [reviewed braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) listed no patched version at review time. The scoped npm alias replaces only the plugin's `fast-glob` with **tinyglobby 0.2.17**; Next, its lint config and plugin remain **15.5.25**. [Notices](../THIRD_PARTY_NOTICES.md) preserve licences and attribution.

This replacement supports this repository's default root, not general `fast-glob` compatibility. The [pinned Next source](https://github.com/vercel/next.js/blob/v15.5.25/packages/eslint-plugin-next/src/utils/get-root-dirs.ts) calls `globSync` for configured roots; comparative fixtures found different symlink/globstar semantics. The [lint guard](../scripts/check-next-lint-dependency.mjs) rejects configured `settings.next.rootDir`, pins the reviewed versions, preserves all 21 Next rules and runs nine link regressions. A fresh isolated `npm ci` reproduced the lockfile; the full audit reported **0 vulnerabilities, 307 verified signatures and 58 attestations**, including the alias's registry identity and integrity.

The earlier build exceeded its unchanged 120-file budget at 124 files. Eagerly importing the small Finder and combining the always-mounted KnowledgeGraph with its existing lazy ProjectExplorer removed four unnecessary JS/CSS requests. Settings retains its lazy loading/failure boundary; scientific demos, PDFs, games and one shared math chunk remain deferred.

Fresh `npm run check:release` passed: lint, TypeScript, deployment/request fixtures, dependency verification, all source/scientific/locale gates, isolated compilation and output limits. The 548 application, configuration, script and public-source hashes remained unchanged through compilation and browser verification; the staged inputs match those hashes.

| Output | Actual | Remaining allowance |
| --- | ---: | ---: |
| Browser files | 120 | 0 files |
| Application browser bytes, excluding math | 5,131,792 | 111,088 bytes |
| One demand-loaded math chunk | 263,303 | 43,897 bytes |
| Initial JavaScript gzip | 265,348 | 11,132 bytes |
| Traced runtime files | 2,068 | 432 files |
| Application runtime bytes | 5,208,899 | 33,981 bytes |

Limits match the previous revision unchanged. Total browser output is 5,395,095 bytes, including the separately bounded math chunk. Math is absent from every initial page entry.

## Recorded compiled verification

These are fresh results after the translation and cleanup pass, against a copied standalone production build. Linux Playwright 1.63.0 ran Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6. No application or tracked QA source changed during verification. Raw results stay under ignored `.codex/reports/final-cleanup/`.

| Check | Fresh result |
| --- | --- |
| HTTP routes, exact public bytes/MIME, request/error challenges | 694 groups / 1,278 requests; zero failures |
| Complete browser crawl | 942/942 in each of Chromium, Firefox and WebKit; 2,826 journeys |
| Actual mounted recovery/hooks/controls | 15/15 per engine |
| Equation focus, native keyboard pan and resize | 8/8 per engine |
| Locale bootstrap poisoning/precedence | 12/12 per engine |
| Preferences / historical regressions | 7/7 and 12/12 per engine |
| Default-rule axe accessibility | 172 Chromium states; zero violations/page errors |

The crawl derived 41 projects, 28 demos, four catalogue PDFs, seven games, 12 catalogue app targets and 17 core routes from source. It covered all four locales at 1440px and 320px, all three patterns, no-JS essentials and 56 recovery journeys. Passing browser journeys had no captured page, asset or unexpected-request errors, including late events.

Focused Traditional Chinese interaction samples also passed: **3 Firefox desktop states** at 1440px (physical mass conversion, durable draft removal and SideQuest cheers), and **10 WebKit states** at 1440px/320px (grid row/column labels and keyboard input, spectroscopy reload, molecular bars, finance replay and MRI parameter labels). This is a sampled scope; the 906 source-render cases cover further deterministic copy/feedback states.

Axe recorded **22 incomplete results for 52 closed-combobox references**, each checked to identify one existing listbox. [W3C combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) permits references to hidden popups; these remain manual review results, not a screen-reader conformance claim. Equation observer cleanup was source-reviewed; consecutive invalid-TeX transitions and a second later font-loading cycle were not injected.

**One earlier WebKit dual-draft timeout remains unexplained because its failed context was disposed.** An unchanged focused rerun and 20 independent ordinary-debounce repetitions passed. The final 12-group historical suite requires observed native edits, exact editor values and unchanged canonical data before releasing held saves. Passing reruns do not establish a proven application fix for the lost timeout.

## Cleanup

The deeper audit moved 30 byte-identical check receipts (54,911 bytes) into [project-copy fixtures](../scripts/fixtures/project-copy-audits/README.md), removed 34 proven unused CSS classes in 12 modules (12,190 bytes at that patch stage), and removed two further dead graph heading rules. Its inventory reached 213/213 managed source files with no unresolved imports or unowned runtime assets. Computed icon selectors and scientific original filenames were retained.

Documentation cleanup pruned **196 redundant files (13,004,963 bytes)**: dated UI/release reports, duplicate screenshot batches and temporary review JSON. The icon-family sheet moved byte-for-byte into curated `docs/assets/`; unique original-source revisions and hashes were extracted into one source record. The docs tree is reduced from 211 files to 16. [Project source records](PROJECT_SOURCE_RECORD.md), [artwork/MRI provenance](PROJECT_ARTWORK.md), original icon prompts, [design references](SYSTEM7_DESIGN_BENCHMARK.md), workflow and curated tour media remain. Raw logs and new screenshots belong under ignored `.codex/reports/`; reusable checks remain in `scripts/`.

## Reproduce

Use Node 22 and locked dependencies. QA tools stay outside application dependencies:

```sh
npm ci
npm run check:release
qa_tools=$(mktemp -d)
npm install --prefix "$qa_tools" --no-save playwright@1.63.0 esbuild@0.28.2 axe-core@4.13.0
"$qa_tools/node_modules/.bin/playwright" install chromium firefox webkit
export PLAYWRIGHT_CORE_PATH="$qa_tools/node_modules/playwright"
```

Install Playwright's Linux system libraries if needed. Copy the compiled standalone, static files and public assets to a separate preview so another build cannot overwrite it:

```sh
audit_preview=$(mktemp -d)
cp -a .next-build/standalone/. "$audit_preview/"
mkdir -p "$audit_preview/.next-build"
cp -a .next-build/static "$audit_preview/.next-build/static"
cp -a .next-build/react-loadable-manifest.json "$audit_preview/.next-build/"
cp -a public "$audit_preview/public"
(cd "$audit_preview" && PORT=5189 HOSTNAME=127.0.0.1 NODE_ENV=production node server.js)
```

In a second shell, set `PLAYWRIGHT_CORE_PATH` to the same external installation, then run from the repository root. Clear coverage filters (`DEEP_GROUP`, `DEEP_LOCALES`, `DEEP_WIDTHS`, `DEEP_SLUGS`, `REVIEW_GROUP`, `LOCALE_PATTERN`, `AXE_GROUP`, `AXE_PROJECTS`) for complete matrices:

```sh
export REVIEW_ORIGIN="http://localhost:5189"
npm run check:deep:http
for engine in chromium firefox webkit; do
  BROWSER_ENGINE="$engine" npm run check:deep:browser
  BROWSER_ENGINE="$engine" npm run check:deep:recovery
  BROWSER_ENGINE="$engine" node scripts/check-deep-math.mjs
  BROWSER_ENGINE="$engine" node scripts/check-deep-locale.mjs
  BROWSER_ENGINE="$engine" node scripts/check-app-improvements.mjs
  BROWSER_ENGINE="$engine" node scripts/check-review-browser.mjs
done
BROWSER_ENGINE=chromium node scripts/check-deep-accessibility.mjs
npm run --silent audit:repository
```

The [adversarial browser runner](../scripts/check-adversarial-browser.mjs) retains additional chunk-failure, PDF retry, Finder failure, insecure-context and recovery fixtures. Its compiled Settings failure fixture requires `SETTINGS_CHUNK_PATH` for the reviewed build; screenshots default to ignored reports.

Stop the preview you started when finished. Browser coverage uses Linux Playwright engines and selected meaningful states; it does not certify physical devices, native zoom/readers, every simulation outcome, media rights or production deployment. Eight-key localStorage restore still uses best-effort rollback during a persistent storage outage. Future module extraction and native-device/visitor studies remain separate work.

## Final translation and cleanup pass

- Copy and release inputs are frozen and verified; scientific values, source keys and placeholders are preserved.
- Fresh strict release, HTTP, accessibility, full browser crawls and all targeted regression suites passed.
- Staged review found no private, credential, generated-output or temporary-review payloads.
- This checkpoint belongs on `origin/main`; Git history and remote tracking refs record publication state.

## Subsequent profile and visual refinement

This refinement follows the frozen release checkpoint above. Its source changes and focused checks are recorded separately; the earlier **2,826-journey browser matrix**, dependency audit and frozen hashes have not been rerun for these changes.

Profile windows, project documents and demos now share system-font headings and the **22/18/15/13/12px** title, section, prose, control and metadata scale. Inline/navigation icons use 16px, document/card/header icons 32px and desktop launchers 48px, with one canonical image per subject. Primary and sharing actions use neutral beveled faces; bold text identifies the primary destination and an outer ring identifies a default action. Warm reading paper, hard window shadows and meaningful scientific/finance palettes remain.

Selected work contains 14 projects. **Orbital Lab**, **Neural CFD Surrogates** and **Home Lab Infrastructure & Recovery** (`home-automation-stack`) join the shortlist; **CV Keyword Automator** remains in All projects. The five-document library contains the locale's Applied AI CV, the original **GROWMAT external showcase**, the reinforcement-learning syllabus and both Italian workbooks.

The profile now uses 10 shared work/education records and **18 evidence-backed capabilities**, with degree subjects, placement, research, awards and links to public projects and sources. The CV's reported results retain their qualifications. LinkedIn direct access returned HTTP 999, and no uploaded export was present; no new claims were taken from LinkedIn.

The schema-version-2 knowledge graph has **106 nodes and 387 edges**, covering all 41 projects alongside work, education, skills and documents. A new experience is declared once in the profile data. The shared resolver derives project provenance and graph connections from stable source, project and record references, while preserving the distinction between direct work and related later projects. [AGENTS.md](../AGENTS.md) directs future agents to extend these records, capability evidence and document references using the [maintenance workflow](KNOWLEDGE_GRAPH_WORKFLOW.md), then run the profile, graph and locale checks. Source identity must identify the actual PDF before it becomes document evidence.

On short mobile screens, the English Documents header previously consumed the full pane and left the loaded CV reader at zero height. The preview now scrolls, context actions stay in a horizontal row and the PDF reader retains a 240px minimum height. The final browser run verifies an actual regional CV canvas in both Documents and the Resume alias at **320×568**.

Focused verification passed **24 mobile journeys at 320px across all four locales**, **34 graph checks**, **9 profile checks** and the maintained locale/copy gates. The final maintained Chromium crawl passed **96/96 journeys** in `en-gb` and `zh-tw` at **1440×1000** and **320×568**: 68 section visits, 20 demo interactions and 8 native-application journeys. The project filter covered VideoMate, Neural CFD Surrogates, Home Lab, Ocean Depths Finance, Trustworthy MRI Reconstruction and Orbital Lab. Every demo changed its selected state and displayed content; the native journeys exercised Orbital's canvas and Home Lab's service filter. No page errors, failed assets or requests, or document/pane overflow were recorded. This filter produced no project-PDF jobs; CV rendering was covered by the section visits.

Accessibility checks passed **34 core states and 12 expanded skill, graph and GROWMAT states**, with **zero axe violations across 46 audits**. Two closed Orbital combobox results remain incomplete in axe; the maintained browser runner separately verifies that their referenced listboxes exist and have unique IDs. Four locale/width profiles passed the linked skill → project → back → CV journey, graph export with schema v2 and **106/387** counts, graph navigation to skills and education, and graph → GROWMAT rendered canvas → close with the original node restored. Keyboard disclosures and Tab links also passed without page errors.

The final isolated production build passed all prebuild gates, optimized compilation, lint and TypeScript checks, generating **88 pages**. Output contains **120 browser files, 5.17 MiB total**, with **261.0 KiB initial JavaScript gzip** and **4.97 MiB application runtime** within the maintained budgets; 2,067 files were traced. The artifact gate's exact, hash-pinned Secret star exception still rejects credential-shaped filenames elsewhere, credential content inside that image and substituted image bytes. Screenshots and raw focused results stay under ignored `.codex/reports/profile-refinement/`. These scoped checks do not replace the earlier three-engine matrix or a native-device and screen-reader study.

## Adversarial re-audit of the refinement

The re-audit challenged evidence claims, future records, keyboard focus, history and the smallest supported desktop windows. The earlier focused checks inspected viewport sizes but did not resize a window inside a wide desktop, or combine document focus with browser history. A copied production build retained the failing behavior while fixes were developed separately.

| Reproduced finding | Repair |
| --- | --- |
| Tab from GROWMAT to another library button changed the selected PDF while the address still identified GROWMAT. | Focus alone no longer selects a document; activation and history restore the matching document and fragment. |
| Career's **View CV** reopened a previously selected Italian workbook. | Career and education use an explicit `#ai-cv` destination. |
| Following a graph source made its document button permanently `tabindex="-1"`. | Anchor focus preserves an already tabbable target. |
| Back to `/skills#%` threw `URI malformed`; encoded valid anchors also needed consistent resolution. | One guarded fragment decoder serves focus, document and skill navigation. |
| A future document without a project rendered a `?project=undefined` action; one with a project but no registered PDF activity produced a graph action that did nothing. | Optional project actions require an association. Graph PDF actions require an actual matching catalogue artifact; library-only PDFs open their document record. |
| External citation paths containing `/en-gb/` changed when the portfolio locale changed. | External URLs retain their exact identity; only local portfolio routes receive locale substitution. |
| Coursework and illustrative venture reasoning were presented as direct teaching and product-discovery evidence. | These projects now provide separately labelled related context. Role, project and source evidence remains explicit. Portfolio comparisons also distinguish related research, work and education context. |
| The profile gate required exactly five documents and rejected a valid sixth PDF. | Required reviewed baseline IDs remain checked, while counts derive from the library. A fixture executes the entire gate with a sixth local document and no project. |
| At **320×240** inside a wide desktop, Documents collapsed its reader and trapped later library items; About and Career overflowed horizontally. | Responsive rules use the actual content container. Short library panes scroll; narrow document panes retain a usable reader and reachable context actions. |
| At **320×240** and **640×240**, project headers and filters could leave Selected work and All projects with a zero-height catalogue. | Short project windows use one scrolling list surface, retaining both pointer access and End/Enter access to the final project. |
| Switching away from a stalled CV emitted an unhandled worker `Worker was terminated` error even while the replacement document painted correctly. Rapid switching also exposed an unhandled cancellation in GROWMAT's range reader. | Each reader now owns an abortable download and supplies bytes through PDF.js's public data API. Owned workers handle the exact expected cancellation within their own realm after a disposal marker, release their Blob URLs, and terminate within a bounded cleanup period. Active failures retain the error state, source link and retry. |

The graph remains **schema v2, 106 nodes and 387 edges**. The [maintenance workflow](KNOWLEDGE_GRAPH_WORKFLOW.md) now documents direct versus related capability context, exact external citation identity and the difference between a document association and a registered project activity. Historical curated origin labels and associations still require explicit review when correcting an old record; declaring new records once remains supported.

The reader's download boundary avoids two cancellation defects in the pinned PDF.js 5.4.624 without changing vendor files or filtering page-level errors. Preview startup now waits for the full PDF; the largest library file, GROWMAT, is **8,312,640 bytes (7.93 MiB)**. Rendering pages remains visibility-based. This changes incremental startup, while preserving original downloads and the browser's native PDF link.

The maintained [profile interaction runner](../scripts/check-profile-browser.mjs) exercises document Tab/Enter behavior, explicit CV destinations, Back/Forward, native modified clicks, locale editions, encoded and malformed anchors, keyboard skill origins and short mobile documents. The [window resize runner](../scripts/check-project-window-resize.mjs) drives the real keyboard resize control to **320×240** and **640×240**, then reaches the first and last catalogue projects, graph controls, final profile links and a painted, scrollable PDF. These checks run against a copied production build with external Playwright tools:

```sh
export PLAYWRIGHT_CORE_PATH=/path/to/external/node_modules/playwright
export REVIEW_ORIGIN=http://127.0.0.1:5194
for engine in chromium firefox webkit; do
  BROWSER_ENGINE="$engine" node scripts/check-profile-browser.mjs
done
PROJECT_RESIZE_ENGINES=chromium,firefox,webkit npm run check:resize
PDF_READER_ENGINES=chromium,firefox,webkit node scripts/check-pdf-reader-browser.mjs
```

The [PDF worker runner](../scripts/check-pdf-reader-browser.mjs) holds actual PDF and worker-module requests, switches through the real library, blocks a termination acknowledgement, injects an active worker exception with the same cancellation message, and tests worker-module and PDF-request failure followed by retry. It checks painted canvas pixels, worker termination, Blob URL revocation and timer cleanup. Its held-PDF case fails against the preserved pre-repair build with the original worker stack, then passes against the final build. Cancellation cases require no page or console errors; the deliberately injected active fault remains observable and must enter the error UI before a successful retry.

The reader/layout checkpoint uses a copied standalone preview on port 5194. Chromium **153.0.8010.12**, Firefox **155.0** and WebKit **26.6** run through externally installed Playwright. Application source remained fixed throughout these runs. The subsequent graph-only history change and its separate verification are recorded below.

| Reader/layout re-audit check | Result |
| --- | --- |
| Profile/navigation regression | **33/33**, 11 per engine; zero page errors or failed requests |
| Actual desktop window resize and content reachability | **84/84**, 28 per engine; zero page errors, reachable final projects/links and painted, scrollable PDFs |
| Real PDF cancellation, resource disposal, failure and retry | **21/21**, seven per engine |
| Existing PDF main-module import-failure recovery | **3/3**, one per engine |
| Optional Find delay/failure dismissal and late delivery | **8/8** Chromium cases; zero axe violations or incomplete results |
| Core accessibility and expanded skills/graph/GROWMAT | **34 + 12 = 46 audits**, zero axe violations |
| Profile and graph source regressions | **12 profile and 38 graph checks** |
| Request security fixtures | **72** host, method, locale, transport and CSP challenges |
| Dependency advisory audit | **0 vulnerabilities** in a fresh `npm audit --json`; signature verification was not rerun |
| Isolated production compilation | **88 pages**, lint, TypeScript and all prebuild gates passed |

Two closed Orbital combobox checks remain incomplete in axe; the maintained runner verifies their listbox references. Four locale/width profiles again passed skill → project → Back → CV, graph export and navigation, education anchors, GROWMAT canvas rendering and return to the original graph node, and keyboard disclosures. These remain sampled browser checks, without a native screen-reader conformance claim.

Final output is **120 browser files, 5.18 MiB including the deferred math chunk, 260.9 KiB initial JavaScript gzip, 2,067 traced runtime files and 4.97 MiB application runtime**. All maintained limits pass. Fresh raw results are under ignored `.codex/reports/profile-adversarial/`, `.codex/reports/profile-interaction/*-5194.json`, `.codex/reports/pdf-reader-cleanup/production-5194/`, `.codex/reports/deep-audit/accessibility-chromium-adversarial-final.json` and `.codex/reports/profile-refinement/production-evidence.json`. Before-repair evidence remains separate. The earlier complete 2,826-journey crawl and dependency signatures are historical checkpoints, rather than fresh evidence for these changes.

The additional challenges also confirmed two practical limits. After the optional Find chunk fails, dismissal restores the desktop and launcher focus; restoring connectivity and reopening Find still requires **Reload Page**, as its error message states. A synthetic graph of 50,032 nodes and 175,023 edges retained a late-added skill in the visible selection, but construction/index/layout took approximately 507ms and coordinate interpolation approximately 22.9ms per frame on this test host. Drawing caps do not bound all work: animation and edge scanning still grow with the full graph. These measurements do not establish a supported large-graph capacity; the current graph contains 106 nodes.

### Graph history follow-up

The parallel icon audit's WebKit quota finding prompted an additional measured review. On the preserved 5194 build, ten graph selections made **20 replacements**; a faster selection/reset burst failed at **101 writes**, including **50 redundant writes**. Repeated Enter on the already-current **All work** control failed in **1.92s** with **99 action writes that all retained the same URL**. Graph and Finder search edits made no history writes. Archive search made one genuine replacement per changed input.

`ProjectExplorer` and `KnowledgeGraph` now guard identical-URL replacements. A graph selection makes one changed-address replacement; repeated selection or reset makes none. Existing archive-tab Back entries and Back/Forward state remain intact. The larger desktop open-window history flow was not refactored, and genuine URL changes remain subject to the browser's quota.

The copied history-fix build on port **5195** passed **33/33 navigation journeys and 9/9 native-history regressions** across the same three engines, with zero page errors in the passing runs. Seventy-five genuine, unpaced graph changes used exactly **75 replacements** in **3.79s Chromium, 7.41s Firefox and 9.50s WebKit**. Four English/Traditional Chinese desktop/phone profiles again passed graph export, skill/project/CV navigation, education anchors, GROWMAT painting and return to the selected node, and **12 expanded axe audits with zero violations**. Its isolated build, prebuild gates, types, lint and output limits also passed. Reader and layout source was unchanged; their 84 resize, 21 worker and 34 core accessibility receipts remain scoped to 5194.

One concurrent Chromium navigation run timed out waiting for the second native modified-click tab. No page or request error was recorded and the Control-click tab opened; the unchanged isolated full rerun passed 11/11. The failed receipt is retained as `.codex/reports/profile-interaction/chromium-5195-concurrent-popup-failure.json`. The rerun does not establish the timeout's cause or a proven application fix.

WebKit's genuine-write limit remains measurable: **102 archive search edits in 8.81s** reproduced it. Deduplicating graph writes does not remove that platform constraint. Positive history receipts are `.codex/reports/history-interaction/*-5195.json`; 5194 measurements remain under `.codex/reports/history-5194/`. The maintained [native-history runner](../scripts/check-history-browser.mjs) requires external Playwright and a compiled preview:

```sh
export REVIEW_ORIGIN=http://127.0.0.1:5195
for engine in chromium firefox webkit; do
  BROWSER_ENGINE="$engine" node scripts/check-profile-browser.mjs
  BROWSER_ENGINE="$engine" node scripts/check-history-browser.mjs
done
```

## System 7 icon unification

The icon audit found competing PNG/SVG drawings for the same subject, separately drawn accessory icons, generic fallbacks, inconsistent icon frames and project cover art used as launch icons. These are replaced by **42 canonical transparent 128px PNG subjects**, totalling **149,954 bytes**: 31 new built-in image generations and 11 preferred original PNGs preserved byte for byte. Book and Desk Accessories received a second generation after small-size review. [The curated family sheet](assets/system7-icon-family.png) shows each subject at 64px, 32px and 16px; [the consolidated prompt manifest](SYSTEM7_ICON_PROMPTS.json) retains generation and delivery hashes.

[`System7Icon`](../src/components/System7Icon.tsx) renders one image at every size. [`system7Icons`](../src/lib/system7Icons.ts) and [`iconIdentity`](../src/lib/iconIdentity.ts) explicitly cover **26 applications, 41 projects, seven games, 23 Home Lab services and three contact services**. Orbital Lab has the same subject in accessories, Finder, project cards, menu/window chrome and the application. Reviewed app/project associations share identities; Coding Series retains its molecule identity when linking to the career window. Shared slots are **16px inline/navigation, 32px document/card/header and 48px desktop**; boot and empty-state illustrations retain their intentional larger sizes. Thirteen CSS modules were normalized, and obsolete frames, shadows and identity glyphs were removed. Scientific diagrams, meaningful domain colours, photographs and the actual COVERD wordmark remain content.

Cleanup removed **46 obsolete art assets**: 39 SVG miniature variants, three unused WebP covers, the separate VideoMate SVG and three retired favicon SVGs. The duplicate wide-icon prompt file was consolidated. Favicons, Apple/PWA icons, the safe-zone maskable image and Safari's monochrome mask derive from the canonical profile subject. The maintained source gates verify real PNG decoding, transparency, dimensions, hashes, normal/miniature identity, complete registries, 82 project artwork renders, 92 localized Finder rows and favicon frame/maskable safety. New entries require explicit identities; unknown and prototype-property inputs cannot silently select a generic image.

Three functional findings were repaired during the visual audit. Lazy-loading the shared optional Finder/Settings module keeps initial delivery within the existing budgets. Delayed and failed Find dialogs have visible dismissal and Escape, and restore launcher focus after dialog cleanup. At 320px, Desk Accessories' recovery footer now spans both grid columns instead of consuming the action column. A final Finder-only copy repair uses the reviewed desktop dictionary for application titles and descriptions, including Chinese Settings; full text remains available even where the compact row visually ellipsizes it.

| Fresh icon verification | Result |
| --- | --- |
| Complete identity crawl: Chromium, Firefox, WebKit; four locales; 1440×1000 and 320×568 | 760 states per engine / **2,280 total**, 47,688 canonical DOM observations and **39,636 visible decoded PNG observations**; zero image/page errors or outer-pane overflow |
| Exact public assets, routes and HTTP challenges | **681 groups / 1,252 requests**, zero failures; all 42 delivered PNG hashes and MIME types matched |
| Classic, Blue and Paper | **24 pattern states**, coherent subject/size/rendering and Orbital identities |
| Computed icon roles across 13 normalized CSS modules | **52 role groups / 344 samples**, canonical pixelated images at reviewed sizes |
| Compiled Desk Accessories at 320px | Four locales, readable contained controls and reachable footer |
| Final Finder titles, descriptions, aliases and focus | **24 profiles** across three engines, **1,104 visible fields**, **552 PNG decodes** and **858 search checks**; zero page/image errors |
| Final delayed/failed optional Finder chunks | **8/8** cases, visible dismissal and Escape, cleared inert state, restored focus and no late reopening; axe 4.13.0 reported zero violations or incomplete results |

The full icon matrix covers **582 frozen source inputs**. The final Finder-only repair, source guard and focused runner produce **583 inputs**; strict release passed again, including lint, types, translations, scientific media, deployment/security checks, dependency audit, optimized compilation and output gates. Dependency audit found **zero vulnerabilities**, with 307 signatures and 58 attestations verified. Output contains **120 browser files, 5.17 MiB total**, **260.7 KiB initial JavaScript gzip** and **4.97 MiB application runtime**, with 2,067 traced files. Budget limits were not increased. The earlier 2,826-journey release matrix was not repeated for this icon task. Later concurrent profile/graph source changes were preserved and excluded from the frozen icon build; their separate receipts remain applicable to their stated scope. These verification scopes remain separate when the changes are committed together; Git history records publication state.

**Unpaced navigation exposed a pre-existing WebKit history-write quota failure.** The failed run retained `SecurityError: Attempt to use history.replaceState() more than 100 times per 10 seconds`; instrumentation found repeated history writes for one navigation. The icon inventory now explicitly records a **250ms navigation delay**, and that paced inventory passed. Pacing does not repair the underlying history-write behavior; no history refactor or swallowed exception was introduced. Keep the failed/instrumented receipts and this limitation alongside the earlier unexplained dual-draft timeout.

The subsequent [graph history follow-up](#graph-history-follow-up) removed duplicate and unchanged graph replacements with separate browser evidence. Genuine rapid URL changes still reach WebKit's native quota; that follow-up does not replace the icon matrix's historical scope.

Raw results, immutable-input hashes and screenshots remain under ignored `.codex/reports/icon-unification/`, with `verification-summary.json` identifying the full matrix and final Finder delta. All compiled application input hashes remained unchanged. A QA-only Finder runner refinement tightened actual visibility and search-result checks before focused execution; its supplemental hash is retained separately from the original release-input manifest and its final lint check passed. Reusable runners are [`check-system7-browser.mjs`](../scripts/check-system7-browser.mjs), [`check-finder-labels.mjs`](../scripts/check-finder-labels.mjs) and [`check-finder-loading.mjs`](../scripts/check-finder-loading.mjs); [the artwork guide](PROJECT_ARTWORK.md) gives their preview setup. Final live icon gates passed, and the inventory reached **224/224 managed sources** with no unresolved imports or unowned public runtime assets. Owned preview processes were stopped; temporary generation/diagnostic material is outside tracked documentation. Coverage remains bounded to the tested Linux browser engines and selected states, with physical-device and screen-reader studies separate.

## Combined publication checkpoint

Implementation commit `71f910c` combines the reviewed icon, profile, document, PDF-worker and graph-history changes. A fresh **`npm run check:release` passed on 587 frozen inputs**, with no compiled application or public-asset changes during verification. This reran deployment and request-security fixtures, Finder/source checks, dependency advisory and signature audit, lint, types, all prebuild gates, optimized compilation and output limits. Results include **zero vulnerabilities, 307 verified registry signatures, 58 attestations**, 12 profile checks and 38 graph checks. Output remains within unchanged limits: **120 browser files, 5.18 MiB total**, including 257.1 KiB demand-loaded math, **260.9 KiB initial JavaScript gzip**, 2,067 traced files and **4.97 MiB application runtime**.

The earlier browser receipts retain their individual scopes; this publication check does not claim a new complete browser matrix or remove their recorded limitations. Snapshot hashes and the fresh release log remain under ignored `.codex/reports/publication-2026-10-04/`. Final README/audit/handoff prose was updated after the build. Review also tightened the profile browser runner's exit condition to reject recorded unexpected request failures; that QA-only change passed targeted lint, and the existing passing receipts recorded zero request failures. Git records these final changes separately. The remote contains `main`; obsolete remote refs were pruned and the fully merged local review branch was removed. Git history and remote tracking refs record publication state.

## Docker deployment repair

The real ARM64 Alpine build reproduced a failure in `check:icons`: the checked-in 48px ICO frame and libvips' resized reference disagree at nearest-neighbour sampling boundaries. The generic Dockerfile line 21 error and npm update notice obscured that assertion. Inspection also found that `.dockerignore` excluded the canonical CV source now required by `check:profile`, although the two locale-validation CV sources were already included.

The builder context now explicitly includes that canonical CV alongside the two existing reviewed sources. `deploy.sh` checks profile and graph evidence before building and defaults to plain BuildKit output, preserving an explicit `BUILDKIT_PROGRESS` override. The optional `npm run check:deploy -- --docker-context` uses Docker's real ignore parser and a scratch export to verify the three CV sources, nine reviewed document/data inputs and exclusion of private, generated and unrelated authoring material. The runtime copy boundary remains unchanged.

The 48px ICO check now compares whole RGBA pixels with exact canonical nearest neighbours, permitting either equally near source pixel only at a rational sampling boundary. An exact reviewed ICO SHA-256 also rejects any change to the delivered file. Other image equality checks remain strict; no artwork or application source changed.

Fresh host verification passed **12 profile checks, 38 graph checks, the four-locale gate and 27 deployment scenarios**. The actual Docker context check passed; the same check against an archived pre-fix checkout failed specifically for the missing canonical CV. Build, icon regression and live deployment results are recorded below as they complete; earlier browser matrices retain their original scope. Raw repair evidence is under ignored `.codex/reports/deploy-fix-2026-10-04/`.
