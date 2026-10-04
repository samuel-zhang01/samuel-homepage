# Artwork and source media

Interface icons use one generated System 7 family. Scientific figures, project screenshots and personal photographs remain content, with their original meaning and source records intact.

## Shared desktop and app icons

The current family contains **42 transparent 128px PNG icons**, totalling **149,954 bytes**, in [`public/system7-icons`](../public/system7-icons/). [View every subject at 64, 32 and 16 pixels](assets/system7-icon-family.png). The built-in image-generation tool produced 31 new subjects using the existing generated folder as the style reference; the 11 preferred original PNGs are preserved byte for byte. Book and Desk Accessories received a second generation pass after their 16px review. Dark stepped outlines, grey/white faces and muted periwinkle/ochre details establish the family.

[`SYSTEM7_ICONS`](../src/lib/system7Icons.ts) owns each image path. [`iconIdentity`](../src/lib/iconIdentity.ts) explicitly maps 26 applications, 41 projects, seven games, 23 Home Lab services and three contact services. Desktop shortcuts, menus, title bars, the window switcher, Finder, accessory launchers, project artwork and interior navigation use the same image at every size. Orbital Lab has one orbital icon throughout. Shared slots are 16px for inline/navigation icons, 32px for document/card/header icons and 48px for desktop launchers; large boot and empty-state illustrations retain their deliberate sizes. A new app/project needs an explicit entry; missing identities fail validation rather than silently acquiring a generic folder.

The old SVG miniatures, bespoke accessory drawings, project cover thumbnails and VideoMate mark have been removed from identity surfaces and delivery assets. COVERD's actual wordmark remains in its product content. Browser, Apple and PWA icons derive from the shared profile image; Safari's required monochrome mask is a pixel projection of the same artwork.

[Exact prompts, source hashes and delivery hashes](SYSTEM7_ICON_PROMPTS.json) record all 42 icons in one manifest. New artwork is resized with nearest-neighbour sampling onto a logical 32px canvas, with a 24px artwork field and transparent margins, then delivered at 128px. Generated alpha is preserved. Existing sprites retain their original delivery bytes. Temporary drafts and generation receipts stay outside the tracked documentation.

Run `npm run check:icons` to verify real PNG decoding, alpha, dimensions, complete identity coverage, shared normal/miniature paths, project artwork, favicon frames and maskable safety. The compiled browser audit is `scripts/check-system7-browser.mjs`; it checks actual images and app/project identities across the supported locales and desktop/phone layouts.

With an isolated production build and preview running, set `PLAYWRIGHT_CORE_PATH` to an external Playwright installation and `REVIEW_ORIGIN` to that preview. Run `BROWSER_ENGINE=chromium node scripts/check-system7-browser.mjs`, then repeat for Firefox and WebKit. `BROWSER_ENGINE=chromium node scripts/check-finder-labels.mjs` checks the actual application titles, descriptions, localized and English search aliases, visible icon decoding and dismissal focus; repeat it for Firefox and WebKit. `node scripts/check-finder-loading.mjs` exercises delayed and failed optional chunks, visible dismissal, Escape, focus restoration and late delivery; it also audits the dialogs when `axe-core` is installed alongside Playwright. All runners save raw results under ignored `.codex/reports/`. The full icon inventory uses a recorded 250ms navigation delay; unpaced history-write stress is a separate check with the limitation documented in the current audit.

## Saved scientific images

App icons are illustration. Scientific image viewers use separately reviewed saved source outputs. The current inventory includes 150 GNN flow frames, FNO/U-Net stills, microscopy inputs and Grad-CAM views, plus the MRI reconstruction comparison: **172 scientific images** in total. `scripts/fixtures/scientific-media.mjs` pins their bytes and dimensions.

The [MRI figure record](MRI_RECORDED_FIGURE.json) identifies the exact IX repository revision, source file, hashes and delivery conversion. The saved figure's example metrics remain distinct from the reconstruction study's aggregate results. English labels embedded in source images remain intact; surrounding captions and controls are translated. Do not generate, retouch or relabel illustrative images as experimental evidence. The original scientific figure is resized/re-encoded only, with its panels and labels intact.


## Retired artwork

The conceptual Microrobot, CFD and Finance covers and their original prompts remain in Git history. Their former delivery files were `public/project-art/{microrobot,neural-cfd,finance}.webp`; VideoMate's former mark was `public/project-art/videomate-mark.svg`. The shared icon family replaces these identity assets. Those illustrations were never experimental evidence; the separate scientific originals and source records remain intact.
