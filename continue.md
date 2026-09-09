# Continue here

Updated: 9 September 2026. Current implementation, checks and handoff.

## Latest PDF reader follow-up

- Fixed the reported mobile GROWMAT reader: one compact action row, descriptive document title, accurate page counter, visible **Fit width** reset and reachable horizontal overflow when zoomed.
- The shared reader now measures actual padding, reserves each page's real aspect ratio, preserves the reading position through zoom/resizing and ignores hidden-window measurements. Canvas cancellation waits before reusing the canvas. The CV reader receives the same fixes.
- Full prebuild gates, ESLint, six new PDF geometry regressions, production compilation and output checks passed. Native Edge computer use covered the 320px GROWMAT reader, 120% zoom, horizontal keyboard panning, fit reset, window switching and the 440px Traditional Chinese CV reader. See [PDF reader fixes](docs/PDF_READER_FIXES_2026-09-09.md).
- The newest compiled reader build is `.next-reader`; preview uses port 5190, with port 5180 refreshed to the same build after validation. Development remains on port 5174. Earlier preview ports and output measurements below describe their dated checkpoints.

## Current result

- The project browser starts with the knowledge graph. Selected work / All projects use a searchable, filterable left pane and independently scrolling right-hand document. Open live demo loads experiments on demand; Open in new tab opens the full document. Mobile Back to list restores the row and focus. History, graph connections and CV links remain available.
- Shared System 7 tokens provide distinct grey layers, crisp bevels, recessed wells and title stripes. Smooth prose fonts and Chinese fallbacks are preserved. The latest pass removed 45 inconsistent near-neutral backgrounds across 19 project modules and brought arcade navigation into the shared chrome.
- Icons now share **39 editable SVG symbols and 11 transparent PNG variants** (50 files, 122,039 bytes). Seven newly generated icons cover MRI, chemistry, infrastructure and four arcade subjects. All seven arcade letter tiles and 23 Home Lab service plates use recognisable pictograms. COVERD retains its actual brand asset, including its project row/document.
- Scientific viewers retain recorded CFD/microscopy media and useful teaching animations. MRI now adds a Recorded images view with the pinned IX repository's reconstruction comparison, translated captions/alt text, a contained full-size image and source links. Its example PSNR is separate from the study's aggregate metrics. Synthetic interactive phantoms remain explicitly identified. There are **172 reviewed scientific images**, including 150 GNN flow frames.
- Both Mandarin editions have project prose, controls, feedback and accessible labels. All 118 element names, selectors and orbital exports are localized. The latest MRI view adds reviewed CN/TW copy. English US uses reviewed regional spelling. Original figure labels, PDFs, source quotations, code, formulas, names and source-language exercises retain their necessary text with context.
- Fixed game selection retaining a scrolled-down pane. Snake and Brick Breaker pause in hidden browser tabs and require Resume. CFD playback suspends its timer while hidden, preserves the frame and resumes one timer on return; Pause/unmount clean up the listener and timer. Demo jumps measure wrapped toolbar height.
- Updated Next.js / eslint-config-next to **15.5.25**, Sharp to **0.35.4** and js-yaml to **4.3.2** after the registry audit found newly reported issues. Updated lockfile and dependency notices.
- Moved 17 dated review/audit reports into `docs/archive/`, repaired relative links and marked their conclusions historical. README now describes current navigation, media, icon and translation behavior. [Current documentation index](docs/README.md).

## Latest cohesion and cleanup round

- Replaced the 27-way demo switch with an exhaustive typed component registry. The search builder reads the same registry; lazy imports and locale propagation remain intact.
- Removed unused old project-card CSS, mobile overrides and two unused CSS markers. Repaired the loading indicator’s ineffective animation and kept reduced-motion support. Prose boundaries use shared grey tokens.
- Enabled TypeScript unused-local and unused-parameter checks. The import scan found no orphaned application modules; middleware/type declarations remain valid entry points.
- Full `npm run check:release` passed, including dependency audit/signatures, lint, all gates, TypeScript with unused-code checks, and the isolated build. Final compiled QA on port **5177** passed 80 project visits, 8 four-language/width lifecycle combinations and 15 navigation assertions. Logs: `/tmp/samuel-cleanup/`.
- Moved the optional media checklist into the documented future backlog. See [repository cleanup](docs/REPOSITORY_CLEANUP_2026-09-09.md).

## Latest content and UX follow-up

- Added reviewed audience/aim context and an expandable Samuel’s contribution section for the 30 projects with editorial stories. All content uses existing CN/TW records. Utility pages retain their current descriptions.
- Exercise instructions now launch the shared demo. Closing explains unsaved changes, unmounts the demo, returns to the overview and restores launch-button focus. New controls are translated; shared components own the behavior.
- Added a restrained inset context strip, narrower prose, CJK-friendly heading leading and shared locale-aware fonts for seven older interface-heading groups.
- Production build/all gates, ESLint, four-locale × two-width lifecycle checks and the existing navigation regression suite passed. Reviewed seven arcade selections. See [content/UX review](docs/CONTENT_UX_REVIEW_2026-09-09.md). Temporary QA is in `/tmp/samuel-content-review/`; latest compiled server is port **5176** (dev stays 5174). No exhaustive new all-state crawl or timing benchmark is claimed.

## Preview and validation

- Development preview: **http://localhost:5174/en-gb/projects**. Restart with `npm run dev -- --port 5174`. The latest compiled cleanup review used port 5177.
- Current production build, ESLint, TypeScript, repository gates and whitespace checks passed. `npm run audit:dependencies` reports zero known vulnerabilities at the configured threshold, 312 verified registry signatures and 48 verified attestations as of this review.
- Compiled browser checks: **70 changed-state checks** across four locales, plus **80 project route visits** covering all 40 projects at 1440px English UK and 390px Traditional Mandarin. No captured page errors, document/page overflow or KaTeX errors in that route sweep. New MRI imagery is absent from network requests until its view opens.
- The prior complete four-language crawl covered 160 project documents and 60 main app routes, plus project/shell state matrices. Its reports remain in the archive; the latest follow-up is not another exhaustive four-language crawl of every possible state.
- Current build output: **118 browser files / 5.10 MiB**, including 257.1 KiB demand-loaded math; **249.8 KiB initial JavaScript gzip**; 4.80 MiB traced application runtime. Public icon/scientific assets have separate measured sizes and checks.
- [Latest sweep and screenshots](docs/WIDE_SWEEP_2026-09-09.md), [icon family](docs/reviews/wide-sweep-2026-09-09/icon-family.png), [generation prompts](docs/SYSTEM7_WIDE_ICON_PROMPTS.json), [MRI source record](docs/MRI_RECORDED_FIGURE.json).
- Temporary executable QA, measurements and logs: `/tmp/samuel-wide-sweep/`. Earlier evidence: `/tmp/samuel-refinement-review/`. Durable screenshots are under `docs/reviews/`. Chromium was used; no new Lighthouse result or exhaustive cross-browser/accessibility claim is made.

## Workspace and next session

- The Git checkpoint containing this handoff includes the reviewed artwork, layout, language, content and cleanup work since `d65e1d1`. Check `git status` and `git log` for subsequent changes. No deployment command was run.
- Earlier cleanup/CV restoration is recorded in the archived integrated review. Historical `/Users/samuel/` recovery paths refer to the previous workstation, not this server.
- Noto CJK and Unifont were installed only on this server for review; no new client font payload was added.
- Requested implementation and iterative review are complete. Use the current preview and design benchmark as the baseline for further feedback.
- Preserve source-media attribution and the separation of generated artwork, recorded results and calculated examples. Keep maintenance receipts in documentation rather than visitor-facing product copy.
- For future changes, update both Mandarin editions, rebuild search indexes after copy edits and test relevant selected/empty/error/mobile states. Useful checks: `npm run lint`, `npm run build:isolated`, `npm run audit:dependencies`, `npx tsc --noEmit`, `git diff --check`.
