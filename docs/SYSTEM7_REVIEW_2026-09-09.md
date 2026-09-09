# System 7 redesign and integrated review — 9 September 2026

The portfolio now opens each project as a desktop document: its purpose and development are visible immediately, followed by the interactive work. The old suite entrance and cross-project chapter bar are removed from that path. Related work is reached through **Connections**, which returns to the graph with the relevant project selected.

This is an internal implementation and verification record. Repository provenance and test receipts belong here, not in the visitor's project description.

## Design basis

The [design benchmark](SYSTEM7_DESIGN_BENCHMARK.md) records the online research, exact manual pages, control vocabulary, typography, palette and accessibility adaptations. Primary references were Apple's [1992 Human Interface Guidelines](https://tecfa.unige.ch/tecfa/teaching/LME/lombard/HIGuidelines.pdf), [Macintosh Toolbox Essentials](https://developer.apple.com/library/archive/documentation/mac/pdf/MacintoshToolboxEssentials.pdf), and the [1994 System 7.5 Upgrade Guide](https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF). Original screenshots informed button states, default-action rings, pop-up menus, list selection and document structure.

The implementation uses white paper, gray chrome, black boundaries, hard shadows and one blue selection color. Shared sizes are 22 px titles, 18 px headings, 15 px prose, 13 px controls and 12 px supporting text. The CSS sizes, readable CJK fallbacks, touch targets and reduced-motion support are modern web adaptations; this is not a claim of exact historical emulation.

## Main changes

- **One control library:** `src/app/system7.css`, `DemoChrome` and `ClassicSelect` own the shared appearance and states. Project modules retain layout responsibilities. Competing button skins, decorative uppercase/tracking, tinted ordinary notes and colored paragraph stripes were removed from the migrated project surfaces. Scientific series and physical color maps retain their meaning.
- **Direct project documents:** the graph is the first project view, alongside Selected work and a searchable All projects folder tree. Each document includes context, readable prose, development, results, relevant CV connections and materials. The demo sits in that document; Explore the project scrolls to it. Privacy explanations remain available as a disclosure. GROWMAT links to its original PDF.
- **Navigation and graph:** native project windows cooperate with browser Back/Forward and the CV window. Connections selects the correct graph node. The graph retains 2D/3D, focused/all-work animation and reduced-motion handling. Compact headings, stronger overview edges, a larger initial window and an independently scrolling project library keep the graph, timeline and comparison views reachable.
- **Project explanations:** microrobot localization begins with recovering orientation/depth from microscope images; CFD explains forecasting physical fields. Internal file/checkpoint reconciliation, claim-provenance grids and audit receipts were replaced with useful method descriptions and result-specific qualifications. Recorded results and illustrative experiments remain distinguished.
- **Artwork:** three generated, reviewed WebP images represent microrobots, neural CFD and finance. Other project icons now use recognizable subjects such as a molecule, notebook, calendar, calculator, scanner, server or ledger. Generation prompts, source assets and delivery constraints are recorded in [PROJECT_ARTWORK.md](PROJECT_ARTWORK.md).
- **Scientific readability:** KaTeX renders authored mathematics; plot labels, legends, selected states and architecture spacing were corrected. Dense figures have their own labeled, keyboard-focusable horizontal scroll area on phones while prose reflows. The FNO animation, saved horizontal/vertical velocity and pressure playback, finance interactions and model comparisons remain available.
- **Mandarin:** explicit Simplified and Traditional Chinese copy covers project stories, controls, helpers, dynamic feedback, chart captions and accessible labels. Proper names, code, mathematics, Italian exercises and explicitly identified English source documents retain their necessary source language. [PROJECT_COPY_WORKFLOW.md](PROJECT_COPY_WORKFLOW.md) explains the translation boundary and checks.
- **CV accuracy:** a stale 2023 research bullet had incorrectly acquired the separately dated GROMACS work. The older CV source supports protein–membrane research in silico; that description was restored in all four maintained CV editions. All eight rendered PDF pages were inspected.

## Browser and screenshot coverage

The main development review used local port 5174. A separate compiled Next.js server on port 5177 was used for the production route and navigation checks. Temporary Host-preserving proxies let the isolated browser reach those local servers; application middleware was unchanged.

| Area | Actual coverage |
| --- | --- |
| English project documents | Initial desktop screenshots captured for all 40 projects. Root and specialist reviews inspected representative document and demo surfaces across all project families; this is not 40 exhaustive full-document image reviews. |
| Mandarin documents | All 80 CN/TW routes inspected for metadata, locale and width: 1,368 text occurrences, 1,032 distinct strings. Eighty initial captures; ten representative images visually inspected, plus one post-polish follow-up. |
| Compiled route sweep | All 40 English project routes opened; active windows showed no horizontal page overflow and no KaTeX error nodes. Computed ordinary-text contrast scans found no actionable failures; faint decorative empty-slot dots in Scheduling were excluded from the conclusion. |
| Graph and project navigation | Focused/all-work in 2D and 3D; visible transition frames; correct project selection; project → Connections → Back → Forward. CV → project → close returns to the career window. Compare projects and the timeline are reachable through the library scroller. |
| Search | Lazy text index requested on first query. Berendsen resolves to Computational Chemistry Coding Labs; keyboard shortcut/focus and result opening checked. Corrected the singular label to “1 project.” |
| Scientific ML | Microrobot's four views, shared image/pose/depth comparison, rotation and sequence split; four FNO variants, GNN and U-Net; velocity reference frames; rollout and reliability controls; all three model-lineage views. |
| Physical science | Thermodynamic controls, equations and plots; all four solubility views; all four molecular-recognition views; all five chemistry tabs; spectroscopy plotting controls and export-preview dialog. |
| Products and learning | MRI, Finance, CV, Environment and the nine learning/risk components received dedicated view/state reviews. Details and limits are in the scoped reports below. |
| Actual desktop apps | All eight accessories launched and exercised; Orbital Lab and SideQuest reviewed; document reader, Finder and Contact inspected; representative Minefield and Snake interactions. |
| Narrow screens | 390 px CN/TW scientific and product pages, physical-science plots and selected accessories; 768 px CN solubility equations; 320 px TW focused graph with reduced motion. The reviewed pages fit the viewport; dense plots/tables scroll inside their own regions. |

The compiled desktop graph/navigation session captured no console warnings or errors. Route scans are a complement to visual inspection: their contrast calculation uses the nearest opaque ancestor and excludes SVG/canvas, equations, code and disabled controls. They do not establish universal accessibility or performance across browsers.

### Scoped records and images

- [Controls, learning, graph copy and accessories](SYSTEM7_CONTROLS_REVIEW_2026-09-09.md)
- [Mandarin document and product review](SYSTEM7_MANDARIN_REVIEW_2026-09-09.md)
- [Scientific demos and saved-media review](SYSTEM7_SCIENTIFIC_REVIEW_2026-09-09.md)
- [Desktop windows and compiled CV review](SYSTEM7_DESKTOP_REVIEW_2026-09-09.md)

Root screenshots are browser tool artifacts, including `system7-graph-opening-final.png`, `system7-graph-zh-tw-320-reduced-motion.png`, `system7-production-solubility-reading-links.png`, `system7-production-spectroscopy-export-dialog.png` and `system7-chemistry-final-white-chamber.png`. They are not committed image attachments. Agent reports identify their CUA captures and local `/tmp/scientific-browser-qa/`, `/tmp/desktop-browser-qa/` and `/tmp/cv-research-correction/` files. Intermediate captures may show issues subsequently corrected; the records distinguish them.

## Final verification

`npm run build:isolated` passed after the final search-label correction, including all preparation and repository gates, Next.js generation of 83 pages, and the output budget check. Full ESLint passed; the final changed component was linted again. `npx tsc --noEmit` and whitespace validation passed after removing temporary review-directory type includes.

| Gate | Result |
| --- | --- |
| Detailed project search / Finder | 17 / 14 checks |
| Desk behavior / classic select | 28 / 20 checks |
| Orbitals / learning mechanics | 479 / 148 checks |
| Scientific media | 17 groups; 180 saved images |
| Source experiments / finance import | 8 groups / 7 source fixture attempts |
| MRI uncertainty | 70 configurations |
| Graph | 27 checks; 40 projects, 82 nodes, 188 edges |
| Mathematics | 345 static and dynamic-template checks; local KaTeX fonts |
| Project copy | 7,364 bilingual entries in 39 registered sources |
| Narrative copy | 862 visible strings across 40 projects, 27 stories, 3 cases and 11 career contexts |
| Rendered localization | 438 product/MRI + 316 learning + 120 physical-science state/locale cases |
| Public artifacts / CSS modules | 192 hash-pinned files / 2,238 resolved static class references |

Rendered localization cases are deterministic component renders, not browser screenshots. Scientific gates check preserved data, arithmetic and interaction contracts; they do not turn illustrative examples into independently validated research results. Legacy unregistered components are explicitly outside the project-copy gate's count.

### Output size and loading

The final build contains **117 browser files, 5.08 MiB total**, including **257.1 KiB demand-loaded mathematics**. Initial JavaScript is **251.1 KiB gzip**; the traced application runtime is **4.60 MiB** across 2,058 traced files. Next.js reports approximately 256 kB first load in its route table, a different measurement from the gzip gate.

The browser budget is 5 MiB excluding mathematics, with separate 270 KiB initial-JavaScript gzip, 300 KiB math and 120-file limits. The previous total budget was increased to accommodate explicit, lazily loaded bilingual project copy. This is a measured cost, not a claim that the whole bundle became smaller. Menu copy is split from the full narrative dictionary; search data loads on demand. Search indexes contain 40 documents per locale and remain below their 2 MiB per-index limit. Generated artwork is constrained to compact WebP files, and original raster sources stay outside public assets.

No new Lighthouse score, frame-rate benchmark, exhaustive game playthrough, or cross-browser accessibility certification is claimed. Existing numerical checks and scoped visual review were used instead of repeatedly testing unchanged mechanics.

## Recovery and handoff

Before this redesign, the uncommitted work was protected under `/Users/samuel/GitHub/samuel-homepage-recovery/20260909-111448-before-design-reorientation` with an archive, diff and base reference. The comparison/restoration records retain the useful pre-change baseline and explain the retained enhancements. No destructive Git reset was used.

The user preview remains at **http://localhost:5174/en-gb/projects**. At the end of the design review, changes were local and uncommitted; no deployment or external publishing was performed.

### Requested cleanup and local checkpoint

The subsequent user request added [continue.md](../continue.md) as the short handoff and authorized a local Git commit. Import and asset-reference reviews identified seven unreachable UI/source files and fourteen unused/source-copy images. They were backed up outside the repository and removed; no live animation sequence, linked PDF, delivery artwork or README illustration was removed. The image reduction is 7,737,069 bytes (7.38 MiB), including 7,124,020 bytes of duplicate full-resolution artwork masters that had not been committed.

Post-cleanup `npm run build:isolated`, ESLint, TypeScript and whitespace checks passed. The live scientific inventory is now 171 images with 17 media checks; the public-artifact gate covers 183 files (12,905,164 bytes); the CSS gate resolves 2,079 references. Other validation counts and browser-output measurements above are unchanged. The unreachable source files were already absent from browser bundles, so their removal is repository cleanup rather than a browser-size improvement. Recovery manifests and removed files are under `/Users/samuel/GitHub/samuel-homepage-recovery/20260909-130213-before-used-file-cleanup/`.
