# Mobile PDF reader fixes — 9 September 2026

The reported GROWMAT screenshot exposed three related problems: oversized stacked controls crowded out the document, the counter could announce the next page before it was being read, and zoomed pages could overflow without making the full page reachable.

## Changes

- Project PDF windows use a short document title and one mobile action row: Project, Share PDF and a download icon with a translated accessible label. Targets remain at least 44px. Demo navigation uses the same compact layout.
- Reader controls show the page count, zoom buttons and a visible **Fit width** reset. English UK/US and both Mandarin editions have appropriate labels. Shared System 7 typography, surfaces and bevels remain consistent.
- Page width comes from the reader's actual inner width and padding. Narrow readers no longer inherit a hard minimum page size. At fit width the whole page is visible; above 100% the page can be panned from its left edge to its right edge.
- The page counter follows the page at the reading line rather than the nearest page heading. Page aspect ratios are resolved before displaying the document, so lazy canvas rendering does not shift later pages. Zoom and resize retain the same passage, including mixed page sizes.
- Hidden desktop windows keep their last usable geometry. Repeated fit clicks cannot leave a stale scroll anchor. Source changes reset the document and position; cancelled renders finish releasing a canvas before another render uses it.
- These reader fixes also apply to the CVs in Documents. PDF.js and canvas rendering remain deferred; no new runtime package or font was added.

## Verification

- Native Edge computer use at 320px: GROWMAT title and actions remain compact; the first page correctly reads **Page 1 of 24** at 120%; keyboard scrolling reaches the enlarged page's right edge; **Fit width** restores 100% while retaining page 5 and the passage being read; switching to the project window and back retains the PDF's position.
- Native Edge computer use of the compiled Traditional Chinese Documents app at 440px: the two-page CV renders at fit width, with translated page and fit controls.
- Compiled HTTP sweep: **20/20 routes** passed (16 project PDF views and four Documents pages). Each returned 200, the expected language/window and no server error. All four catalogue PDF assets returned 200 with a PDF content type and signature. Report: `/tmp/homepage-polish-pdf-crawl.json`.
- Six new `npm run check:pdf` regressions cover padding, narrow and hidden readers, page counting, reading-line offsets, mixed page geometry, preserved passages and scroll bounds. The check runs in both build workflows.
- ESLint, all prebuild repository gates, production compilation and the build-output gate passed. Output remains within the existing limits: 118 browser files / 5.11 MiB, 251.2 KiB initial JavaScript gzip and 4.81 MiB application runtime.

The browser checks used Edge's responsive viewport, not physical phones. Route checks are reported separately from interactive computer-use checks. Temporary build and verification logs are under `/tmp/homepage-reader-*`; the compiled review runs from `.next-reader`.
