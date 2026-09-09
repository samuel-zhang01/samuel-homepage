# Wider artwork, source-media and reliability sweep

9 September 2026. This is the current local review, following the [icon/depth/language pass](archive/SYSTEM7_REFINEMENT_2026-09-09.md). This review preceded the [repository cleanup and Git checkpoint](REPOSITORY_CLEANUP_2026-09-09.md); deployment remains separate.

## Artwork and colour

- Generated seven additional transparent icons with the built-in image-generation tool: MRI scanner, server network, molecular model, Minefield, Snake, Brick Breaker and playing cards. All passed alpha checks and were resized to 128px with nearest-neighbour sampling. [Exact prompts and delivery paths](SYSTEM7_WIDE_ICON_PROMPTS.json).
- Added seven editable SVG companions covering all arcade entries, including puzzle, word grid and spectrum symbols. The shared family now contains **39 SVGs and 11 PNG variants**, 122,039 bytes total. [Delivered family](reviews/wide-sweep-2026-09-09/icon-family.png); [asset directory](../public/system7-icons/).
- Replaced all seven arcade letter tiles and all 23 Home Lab service-code plates. Service pictograms represent functions rather than impersonating third-party logos. The existing COVERD brand asset now also appears on its project row and document.
- Unified the arcade navigation with the shared grey chrome, navy selected state and raised controls. Increased small arcade instructions, status and control labels to the shared readable sizes. Game-board colours retain their meanings.
- Replaced 45 nearly neutral cream/warm-grey backgrounds in 19 project CSS modules with the corresponding paper, surface, raised, chrome or recess token. Playback metadata and sliders use the shared muted/selection colours. Scientific colour maps, uncertainty colours and categorical states were excluded from this replacement.

## IX repository enrichment

The existing microscopy and CFD viewers already contain actual exported images and 150 GNN flow frames. FNO and U-Net forecasts are saved stills; the architecture animations and calculated experiments explain mechanisms without claiming to run trained models. Existing source records cover the pinned IX-DeepLearning and IX-FlowField repositories.

This sweep inspected the public [IX-Medical-Imaging repository](https://github.com/samuel-zhang01/IX-Medical-Imaging/tree/93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e), its figure inventory, reconstruction-export code and the actual PNG. The MRI lab now has a **Recorded images** view containing the [saved reconstruction comparison](https://github.com/samuel-zhang01/IX-Medical-Imaging/blob/93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e/latex/figures/fig4_reconstruction_comparison.png): reference image, zero-filled inputs, U-Net reconstructions and error maps at R=4/R=8.

The complete figure is retained, without cropping or retouching, as a 2200 × 948 WebP (**363,946 bytes**, down from the 1,017,964-byte PNG). [Source/delivery hashes and transformation](MRI_RECORDED_FIGURE.json). The existing scientific-media and public-artifact gates pin the delivered bytes and dimensions. The inventory now contains **172 saved images** and remains within its existing combined budget.

The figure loads only when its view is selected. A labelled, keyboard-focusable horizontal region preserves legibility on phones; full-size and pinned-source links are available. English labels embedded in the source image remain intact, with translated alternative text, controls, captions and interpretation. Its example PSNR values are explicitly distinguished from the 236-slice aggregates in the reconstruction controls. No model inference, raw dataset, trained weights or new research result is claimed.

The interactive phantoms remain useful for changing acquisition or uncertainty assumptions. They retain their synthetic label; the overall MRI description now distinguishes them from recorded source images.

## Bugs and performance

- **Games running in hidden tabs:** Snake and Brick Breaker now pause on document visibility changes. Pausing is idempotent; returning to the tab leaves Resume available, preventing an unseen run from losing before the player returns.
- **Game selection retaining the old scroll position:** selecting another arcade game resets the independently scrolling game pane to its introduction.
- **Background CFD updates:** flow playback removes its timer while the browser tab is hidden, preserves the frame, and resumes one timer when visible. Explicit Pause and unmount remove the listener and timer. A regression check covers hidden/visible transitions, repeated visibility events and cleanup.
- **Media cost:** the new MRI image is requested on demand and compact icons are individually cached public assets. No new font payload or animation loop was added. This pass does not claim a new Lighthouse score or a universal frame-rate improvement.

## Dependency fixes

The current registry audit reported issues affecting the previously pinned packages. Updated within their existing version lines: **Next.js and eslint-config-next 15.5.25**, **Sharp 0.35.4**, and **js-yaml 4.3.2**. The lockfile and third-party notices were updated.

Published references: [Next.js Windows-hosting advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36), [Next.js AVIF advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [Sharp/libheif fix](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), and [js-yaml merge-budget fix](https://github.com/advisories/GHSA-2883-xcg3-v3hh). Their exposure conditions differ; the Windows-specific issue does not describe this Linux preview. The dependency update removes the reported vulnerable versions without changing deployment policy.

## Documentation and language maintenance

Moved **17 dated audit/review reports** into `docs/archive/`, repaired their relative links and marked their conclusions as historical. Useful source and recovery evidence is preserved. A current [documentation index](README.md) replaces the long competing review list in the root README. README navigation, colour, icon, source-media and translation descriptions now match the implementation; its desktop/project screenshots were refreshed.

New MRI prose and controls have explicit Simplified/Traditional Mandarin entries. Its new view is included in the rendered localization matrix. The prior complete crawl of 160 project routes and 60 main app routes remains documented in the archive; this follow-up specifically checks changed views and representative colour surfaces rather than mislabelling another full crawl as complete.

## Validation

The first browser pass completed **70 checks** across four locales: all seven arcade selections, Home Lab catalogue and category filters, both game pause cases, MRI source-image loading/alternative text/source links, and desktop/mobile containment. No page errors occurred. It verified zero MRI image requests before opening Recorded images and exactly one afterwards.

After the final dependency and typography changes, the compiled site repeated all **70 changed-state checks**, including game-pane scroll reset. A further **80 compiled project route visits** covered all 40 project documents/demos at 1440px English UK and 390px Traditional Mandarin. All returned HTTP 200 with the expected document language, no captured page errors, no document/outer-page horizontal overflow and no KaTeX error nodes. The source figure's intentional internal horizontal scrolling remains available on narrow screens.

Final `npm run build:isolated`, full ESLint, TypeScript and whitespace checks passed. The build includes the existing source/artifact, data, behavior, graph, mathematics, locale and copy gates: 18 scientific-media checks cover 172 images, and the copy gate covers 7,374 bilingual entries. `npm run audit:dependencies` reports **zero known vulnerabilities** at the configured threshold, **312 verified registry signatures** and **48 verified attestations** as of this run. Repository Markdown links were checked after the archive move, with no missing local targets.

Output remains within the existing gates: **118 browser files / 5.10 MiB**, including **257.1 KiB** demand-loaded mathematics; **249.8 KiB initial JavaScript gzip**; 2,058 traced runtime files and **4.80 MiB** application runtime. The preceding pass measured 249.5 KiB initial gzip. The new icon and MRI files are separate, cached public assets; this comparison is not a claim that all application bytes decreased.

Temporary executable checks, measurements and logs are under `/tmp/samuel-wide-sweep/` on this server. The review uses Chromium; arbitrary game outcomes, every imported file, all browsers and all assistive technologies remain outside its scope. The game visibility test dispatches controlled visibility changes in Chromium; the CFD timer test checks callback suspension and cleanup with deterministic timers.

Screenshots: [arcade](reviews/wide-sweep-2026-09-09/arcade.png), [Home Lab](reviews/wide-sweep-2026-09-09/home-lab.png), [Traditional Mandarin MRI](reviews/wide-sweep-2026-09-09/mri-zh-tw.png), [mobile MRI](reviews/wide-sweep-2026-09-09/mri-mobile-zh-tw.png), [desktop](reviews/wide-sweep-2026-09-09/desktop.png), [project browser](reviews/wide-sweep-2026-09-09/projects.png).
