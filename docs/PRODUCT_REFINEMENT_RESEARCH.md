# UltraConvert and VideoMate product refinement

Reviewed on 11 October 2026 for the homepage explanation pass. Samuel is the sole author; the visitor copy uses I/my. Source repositories were read for product behaviour, not reproduced as a catalogue of development records.

## UltraConvert

Sources: local `UltraConvert/README.md`, `src/Interface.swift`, `src/GettingStarted.swift`, `docs/UX-AUDIT.md`; public [repository](https://github.com/samuel-zhang01/UltraConvert) and [v1.6.0 release](https://github.com/samuel-zhang01/UltraConvert/releases/tag/v1.6.0) were checked on 11 October. Remote is the public repository.

Suggested catalogue:

- Slug/demo: `ultra-convert`; component `UltraConvertStudio`; icon kind `ultraconvert`.
- Title: **UltraConvert** (the app/source spelling).
- Subtitle: **Convert a mixed batch of files on my Mac.**
- Summary: **I built a native Mac app for everyday file conversion. Images, recordings, documents and other supported files share one review flow, with compatible formats and a clear destination.**
- Detail: **I can select files in the app or Finder, review an output format for each category, and create new copies beside the originals or in a fresh batch folder. Folder rules handle repeated tasks while the app stays open. Manual conversion always keeps originals; optional rule actions are explicit.**
- Source URL: `https://github.com/samuel-zhang01/UltraConvert`.
- Download URL: `https://github.com/samuel-zhang01/UltraConvert/releases/tag/v1.6.0`, labelled **Download the Mac preview**.
- Source-guide URL: `https://github.com/samuel-zhang01/UltraConvert#install`.
- Tools: Swift, AppKit, Python, native conversion tools, Finder Quick Actions, folder rules.

Suggested story:

- **What I built:** One Mac interface for a mixed batch, compatible targets, destination choice and useful format advice.
- **Why I built it:** Bring common conversions into one review flow instead of separate utilities and unclear outputs.
- **Try it:** Start with a PNG image, WAV recording and Markdown note. Change one output format, choose a destination, and preview the resulting files.
- **What the result means:** Each supported category has its own target; creating new copies does not replace the original files. Format advice explains why the target is useful and what it can change.
- **How it works:** A Swift/AppKit interface coordinates local engines through Python, with content recognition where possible. The browser is an illustrative preview; it does not execute these engines.

Release wording matters: v1.6.0 is a public Developer ID signed, Apple-notarized preview. The installer ZIP provisions a separate conversion runtime after Homebrew is installed; simply dragging its `.app` does not install engines. Stable v1.3.0 remains the default stable release. The fully bundled development DMG is unpublished. Do not label the public installer as self-contained or promise Intel/older-macOS qualification. Link to the release/guide rather than a guessed asset filename.

The component adds three task examples (mixed batch, web images, video-to-audio), reviewed format selectors, result placement, Finder explanation, an example folder rule, and optional setup/method details. It uses the source-owned canonical icon via System7Icon; root owns its registry/bounds/provenance.

## VideoMate

Read `VideoMate/AGENTS.md` before research. Read only source/design documentation. No operator media, directory inventory, filenames, state, diagnostics, history, reports or native operator sessions were inspected. No VideoMate processing, broad test suite or build was run.

Sources: local `VideoMate/README.md` and `docs/implementation-status.md`; public [repository](https://github.com/samuel-zhang01/VideoMate) was checked on 11 October. The local checkout has a private-history remote; the homepage must link to the public source snapshot above, never the private mirror.

Suggested catalogue:

- Keep slug/demo/icon `videomate` and component `VideoMateStudio`.
- Subtitle: **Recover readable video. Keep the original.**
- Summary: **I built an offline desktop app to inspect damaged video, recover a separate playable copy, and move a mixed collection into a new folder with clear review outcomes.**
- Detail: **VideoMate separates diagnosis, recovery and migration. A healthy file can be copied unchanged; a broken container can sometimes be rebuilt; damaged footage may produce a playable copy with losses. Missing source data cannot be invented. My interface shows what was kept, what changed and what still needs review.**
- Source URL: `https://github.com/samuel-zhang01/VideoMate`.
- Get-started URL: `https://github.com/samuel-zhang01/VideoMate#install-and-start`, labelled **Get started from source**.
- Tools: Python, Tk, FFmpeg, FFprobe, native GUI, CLI.

Suggested story:

- **What I built:** An offline desktop interface and command line with Inspect, Repair and Migrate tasks.
- **Why I built it:** Make the difference between damaged, recoverable and missing material understandable, with a clear next action and separate outputs.
- **Try it:** Select Repair and show the outcome for a broken MP4 index. Then select the damaged-frame and missing-tail examples; compare a playable copy with losses against a case with no acceptable recovery.
- **What the result means:** Playable does not mean identical to the original. Recovery keeps readable material and reports losses; migration combines checked repairs and unchanged copies while listing unresolved videos.
- **How it works:** FFmpeg/FFprobe inspect/decode locally. Each proposed recovered output receives separate checks before it is kept. Migration byte-checks unchanged copies.

Current source is 0.8.5 development preview. Native release qualification is unfinished. Source download/get-started is real; a fully qualified signed general-distribution binary should not be promised. Additional desktop features include approximate size targets, optional normalization, qualified hardware encoding/software fallback, private restart checkpoints and unresolved migration policies. Sensitive mode is local application privacy treatment, not encryption or an OS sandbox.

The browser uses five wholly invented sample cases, no uploads and no processing. The previous animated pipeline, evidence vocabulary, GPU switches and diagnostic-heavy first view are replaced by a task choice, one action and plain outcome explanations. The illustrative boundary is stated once beneath the interaction; details stay available below.

## Focused checks

- ESLint passed for both components and both dictionaries.
- CSS-module gate passed with all current static class references resolved.
- Project-copy audit passed after the shared catalogue update: 7,814 bilingual entries across 41 registered source files at the final product-check checkpoint. The earlier unrelated `Market sizing` copy miss was resolved in the shared work.
- TypeScript passed with `npx tsc --noEmit --incremental false` at the product-integration checkpoint; root owns the final full-checkout run.
- Edge Computer Use reviewed both product experiences at the normal desktop viewport and 390×844. English UK and US, Simplified Mandarin and Traditional Mandarin product instructions and changed outcomes were inspected. Temporary viewport overrides were reset and the isolated review tab was closed.
- VideoMate: Repair produced two example copies with one unresolved recording; selecting damaged frames disclosed loss, selecting the missing end explained why no acceptable new copy exists. Migrate produced four copies including healthy video and companion notes. Inspect produced findings with no replacement files. The primary task action was moved above the collection after the first screenshot showed it below the fold. Phone screenshots showed readable task controls and a fully readable selected outcome without horizontal overflow.
- UltraConvert: mixed, web-image and audio-extraction examples produced the stated output filenames. The native-style format picker worked with pointer and keyboard input; changes invalidated the prior preview and changed the format advice. Choosing PNG beside the example PNG showed `Photo (2).png`, matching the source engine's collision suffix. Choosing a new batch folder kept `Photo.png` and explained per-conversion result folders inside the batch. Preview/result now precedes the optional format adjustments so the default task is easy to try.
- A temporary development compile error in the concurrently edited shared Home Lab dictionary was reported to root and repaired. One stale Fast Refresh view briefly lacked the new product stylesheet; a fresh visit and subsequent Mandarin language switch rendered correctly. Final product screenshots showed the System 7 controls, icon sizes and paper/chrome layout.
- These are browser explanation checks, not native-app/media processing, independent human usability testing, screen-reader qualification or a cross-platform product-release claim. Root coordinates the separate adversarial visitor assessment and final commit/push.

## Final release-integration visitor review

Rechecked the combined checkout in Edge on 11 October 2026 after the Next 15.5.27 preview restart, at 1466×857 and 390×844. I approached each journey as a visitor asking what the app does, why I would use it, what to try and how to get the actual app. Scores below describe this agent review, not a human usability study. The rubric allocates two points each to purpose, sole-author contribution/reason, meaningful action/outcome, real source/install/status, and responsive visual/navigation clarity.

| Journey | Desktop | Phone | Observed result |
| --- | --- | --- | --- |
| Ultra Convert: Selected work → overview → demo → preview | 9.4/10 | 9.2/10 | Mixed batch produced `Photo.webp`, `Recording.mp3` and `Notes.docx`, with explicit separate-copy placement and original preservation. The phone overview exposes both demo and Mac-preview routes before the description; the demo needs a short scroll past its three task choices to the action. Result filenames and explanation remain readable together. |
| VideoMate: Selected work → overview → demo → Repair → missing recording | 9.4/10 | 9.4/10 | Repair displayed two new copies and one unresolved video. Broken MP4 index explains container rebuilding; Missing end explains absent bytes, no acceptable copy and an incomplete collection. The phone first screen includes purpose, source-preview status, task choices and the main action. |

Both selected-work entries use their canonical 32px identities; overview and product headings use 48px identities; the active menu identity uses 16px. Source-owned Ultra artwork is unchanged. Grey System 7 chrome, beveled controls and warm overview paper remained clear in phone screenshots without horizontal clipping. Back-to-project, phone app switcher and catalogue selection were exercised.

The overview Mac-preview CTA and product Download button both point to the real v1.6.0 release page. Its public instructions distinguish the Apple Silicon preview installer from its separately installed engines. VideoMate overview and product get-started buttons both point to the public README installation section, with source-preview status and unfinished installers stated. Public unauthenticated redirect-following HEAD requests returned HTTP 200 for both exact catalogue source revisions: Ultra `53c7e55f3c7ff995a1d88637fa57c12e0237d0e3` and Video `c671443c4cbdea5f47be488517956077d54dfaad`. No installer was executed and no media was processed.

A concurrently edited shared Home Lab dictionary briefly showed a syntax overlay during this final review. Its owning agent repaired it; fresh navigation then completed the above actions without the overlay. No product-component repair was necessary in this final integration round. Temporary viewport overrides were reset and the isolated review tab was closed after the additional six-project matrix finished.

## Interactive UltraConvert follow-up — 11 October 2026

The revised demo replaces the earlier static conversion walkthrough with three functioning experiences. The source review covered `UltraConvert/README.md`, `src/RuleFlow.swift`, `src/AutomationCore.swift` (conditions, validation and naming), `src/FolderWatcher.swift` (baseline, stable-file queue and serial processing), `src/AutomationRunner.swift`, `src/FormatCatalog.swift`, `src/AutomationIntegration.swift` and `src/Interaction.swift`. The Finder workflow is Quick Actions/Services plus the grouped format picker; the native preview does not ship a nested FinderSync context menu. No native repository files were changed.

- Folder rules: editable inbox, recursive matching, stable wait, ALL/ANY, five condition kinds, up to 12 conditions and eight ordered Convert/Rename actions, real filename-token calculations and destination/collision planning. Drag handles have keyboard/touch move buttons. Saving applies the draft and establishes a baseline; arrivals use the saved rule. A serial example queue visibly settles, checks, runs and publishes. Pause ignores new arrivals; resume does not create a hidden backlog. Run Existing Files is deliberate. Originals and existing outputs stay intact. An output inside the watched inbox, invalid naming and unsupported conversions stop publication. Document routing requires a conversion block for companion-resource preservation.
- Finder: selectable example files, right-click or explicit touch/keyboard menu, general actions and format shortcuts. A mixed WebP preset leaves Convert disabled until compatible per-category targets are chosen. Preparing a batch does not run it. The explicit sample conversion produces per-file names and the selected destination mode; originals remain listed.
- Image conversion: a generated landscape canvas is immediately usable. Browser Canvas actually exports PNG, JPEG and WebP; JPEG composites transparency onto white. Quality applies to lossy output. Changing input/format/quality invalidates stale download results; unsupported export MIME types are rejected. An optional local image picker uses `createImageBitmap`, with size/dimension limits and translated error states. Images do not enter an upload request. The browser subset is explicitly distinguished from native audio/video/document/data engines.

CUA review used the live development route `http://127.0.0.1:3000/en-gb/projects?project=ultra-convert&view=demo`, default desktop and 390×844 phone. The rule action-order test changed `Photo-webp.webp` to `Photo-png.webp`; saving processed the matching image and left nested/audio/video/document/data examples unchanged. A paused `Photo.png` arrival was ignored and resume reported a fresh baseline. Mandarin Traditional ALL changed to no match for a second filename condition; ANY restored a match. An unknown rename token produced a translated alert and disabled Save. Simplified and Traditional Finder/image screens and changed results were inspected; English UK and US product tabs were exercised. Phone initiation scrolls/focuses the running inbox, preserving visible outcomes without requiring a hunt through the editor. Keyboard Arrow Down/Return prepared the Finder destination action. Motion effects are disabled by `prefers-reduced-motion`.

Generated downloads were verified on disk: WebP 4,784 bytes (RIFF/WebP), PNG 720×420 RGBA (`Sample (2).png`, numbered to retain the original), and JPEG 720×420 (`Sample.jpg`, UI reports 10.7 KB). The local-file picker reached the extension file chooser, but automation could not supply the generated fixture because Edge's ChatGPT extension has file-URL access disabled. I left that permission unchanged. The source implementation and generated-canvas conversion were reviewed; selecting an arbitrary local file through the picker remains a manual verification item.

Verification: scoped ESLint passed for the component/dictionary/helper/focused test; `node scripts/check-ultra-convert-demo.mjs` passed 20 matching/order/naming/destination/preservation regressions; final project copy gate passed 7,943 entries in 42 registered sources; CSS gate passed 2,272 references; `npx tsc --noEmit` passed after concurrent edits settled; scoped whitespace check passed. Review screenshots: `.codex/reports/ultra-convert-interactive-desktop.png` and `.codex/reports/ultra-convert-interactive-phone.png`. Self-review: 9.3/10 desktop, 9.1/10 phone; independent parent cross-review follows. These scores cover the visible product experience and bounded sample engine, not all native conversion formats or OS watching.

Changed files for the product checkpoint: `UltraConvertStudio.tsx`, `UltraConvertStudio.module.css`, `copy/ultraConvertCopy.ts`, new `src/lib/ultraConvertDemo.ts`, new `scripts/check-ultra-convert-demo.mjs`, the existing `ultraConvertCopy.audit.json`, and this research appendix. Shared overview text must describe editable rules, reviewed Finder batches and real browser image export rather than the retired static mixed-batch preview.

Independent VideoMate interactive follow-up review (same date): desktop 9.4/10, 390 phone 9.2/10, 320 phone 9.1/10. Manual steps on only Broken MP4 index showed Candidate—not published and pending checks at phase 2 with an empty new collection; phase 4 published the independently checked remux. Damaged frames with Remux failed decode and stayed unpublished. A missing-end example with shorter copies allowed at 10% failed timing and stayed unpublished; raising the limit to 50% explicitly published 39 seconds with 21 seconds still missing and a loss-review label. Migrate with the review policy copied the unresolved original to a separate review folder, leaving the new collection empty. Quick inspection reported metadata read/video unchecked and made no outputs. At 320 pixels, the frame strips, two-column check grid, legend, guard/outcome and filename wrapped without horizontal overflow. Screenshot: `.codex/reports/videomate-cross-review-320.png`; viewport reset afterward. No blocking product repair. Optional polish sent to the owning designer: the finished Publish phase currently has a completion check even when publication was withheld; the candidate/outcome/output panel already states the blocked publication correctly.

Concurrent-check qualification: the scoped Ultra checks remain passing. The latest repeated whole-site TypeScript run caught a separate active `SecretApp.tsx`/`secretCopy.ts` export edit (`secretThoughts`), after an earlier whole-site run passed. Root coordinates the final stable release gate; this product review is not a receipt for the final concurrent tree.
