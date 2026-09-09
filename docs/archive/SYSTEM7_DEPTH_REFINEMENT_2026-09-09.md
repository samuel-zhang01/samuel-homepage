# System 7 depth refinement

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

9 September 2026. The project browser keeps its search, filters, independent panes and smooth text while the surrounding structure gains clearer depth. This document covers the CSS refinement; icon generation and the full translation crawl have separate reviews.

## Evidence and direction

Compared the working browser with checkpoint `d65e1d1`, the earlier `e7fdb43` `ProjectExplorer.module.css`, and the [retained earlier archive screenshot](../assets/project-archive.png). The earlier interface used a ribbed tab backing, double rules, layered panels and hard shadows. Its compact, tracked labels and assorted tinted cards were not needed to recover that separation. The starting graph was particularly flat: its canvas, inspector, navigation, timeline and footer mostly shared white backgrounds and `box-shadow: none`.

Inspected actual Apple screenshots, downloading the primary manual and rendering the referenced pages locally after the web PDF screenshot service failed:

- [System 7.5 Upgrade Guide, Installer, printed p. 11 / PDF p. 17](https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF#page=17): a light grey control surface around a bounded white description, a striped title and one outlined default action.
- [Macintosh Guide Index, printed p. 35 / PDF p. 40](https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF#page=40): raised mode controls, clearly recessed side-by-side lists and inverted selection. This is the closest structural reference for the browser.
- [CPU Energy Saver, printed p. 63 / PDF p. 68](https://machut.net/files/manuals/mac_os_7/0307163ASYS75UPG.PDF#page=68): thin group boundaries and readable labels establish hierarchy without boxing every sentence.

Apple's [Macintosh Human Interface Guidelines, printed pp. 23–24 and 207](https://tecfa.unige.ch/tecfa/teaching/LME/lombard/HIGuidelines.pdf) describe Chicago for Roman button labels and script-appropriate fonts and vertical space for other writing systems. This mirror is a 1995 printing of the book first printed in November 1992. We retain the smooth platform font stacks and explicit Chinese fallbacks; the website's CSS sizes and relief are modern adaptations.

## Changes

- Shared chrome: recessed grey `#bcbcbc`, crisp `#777` inset/shadow edges and named well-frame/title-stripe tokens. Whites and pale greys retain distinct reading and supporting roles.
- Browser: subtle vertical ribs behind tabs, double header seam, stronger recessed pane borders and a complete bevel around the filter controls. Layout, selection and scrolling remain unchanged.
- Graph: a grey gutter separates the white canvas well and pale inspector; header, projection groups, browse disclosure and timeline use the shared relief. Search results receive a hard popup shadow. Topic toggle markers now use the shared checkmark without the old rectangle; pressed text is white on black and selected focus dots are dark on grey.
- Documents: a double header seam, separated tools metadata, fine rules over Development/Results, a raised Try it note and a grey frame around live experiments. Prose remains 15px with 1.55 line height; scientific palettes, images and equations retain their styles.
- Window titles: 13px with 1.4 line height to give Chinese glyphs more room within the existing bar.
- Follow-up mobile correction: live-demo anchors now use the measured sticky-toolbar height plus 16px, adapting to translated labels, narrow widths and browser zoom. The previous fixed margin concealed the start of the demo when the five-action toolbar wrapped into three rows.

Files: `src/app/system7.css`, the window-title rules in `src/app/globals.css`, and `KnowledgeGraph`, `ProjectLibrary`, `ProjectDocument`, `ProjectCaseBrief` CSS modules.

## Verification

Visual browser review in Chromium on the development preview:

- Before/after at 1440 × 1000 and 390 × 844; examined the browser list, selected Microrobot document and opened experiment.
- English UK/US at 1440px; English UK, Simplified Chinese and Traditional Chinese at 390px. All measured document/demo widths matched their scroll widths; the page itself had no horizontal overflow. No uncaught page errors in this matrix.
- Graph at 1440px and 390px English, 390px Traditional Chinese, 768px Simplified Chinese and 320px English. No viewport horizontal overflow or uncaught page errors. Topic navigation retains its intentional horizontal scrolling at narrow sizes.
- Verified 2D selected/focus and pointer-pressed states: dark text/focus on grey when selected, white text on black while pressed.
- Rechecked the corrected mobile demo jump in English and both Mandarin editions. The experiment starts below the sticky navigation and retains its full width.
- CSS-module gate resolved all 2,087 static class references; all 27 graph checks and `git diff --check` passed.

A live-reload collision during concurrent source edits briefly omitted document module styles in one English development-browser capture. A fresh-page repeat restored the expected styles, widths and scroll position. Final integrated production validation belongs to the parent review; these checks do not claim all projects or all interactive states, Safari/Firefox, or browser zoom coverage.

Retained depth-pass captures (made before the new icon family was integrated): [desktop graph](../reviews/system7-depth-2026-09-09/desktop-graph.png), [desktop browser](../reviews/system7-depth-2026-09-09/desktop-browser.png), [Traditional Chinese mobile document](../reviews/system7-depth-2026-09-09/mandarin-mobile-detail.png). Temporary scripts, measurements and additional captures are in `/tmp/s7-depth/` on this server.
