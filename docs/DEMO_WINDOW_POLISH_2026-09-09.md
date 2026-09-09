# Demo windows and visual polish — 9 September 2026

Live demos now open in a dedicated System 7 desktop window. The project overview and its list/filter context stay available behind it. The blue **Open live demo** action appears first in project navigation and is repeated beside the suggested exercise. GROWMAT has the matching **Open showcase PDF** action; all four catalogue PDFs use the shared continuous PDF reader.

## Navigation and sharing

- Demo and PDF windows use existing move, resize, maximise, close and mobile window-switcher controls. Their titles distinguish them from project overviews.
- Share project/demo/PDF actions have a distinct pale-blue treatment and copied confirmation. Clipboard failure exposes a selectable address.
- `?project=…&view=demo` links open a demo directly. PDF links add `view=pdf&artifact=…`; the artifact must exactly match a PDF in that project's catalogue. Unknown activities fall back to the overview.
- Ordinary internal career, education and project links preserve the desktop. Browser Back/Forward restores those views; closing a launched activity raises its originating window and restores focus.
- PDF error/browser-tool escape links remain direct document links. Modified clicks and downloads retain their normal browser behavior.
- Demo state survives switching windows. Scheduling, FNO and flow playback pause when their window or browser tab is inactive; closing the activity discards its unsaved state.

## Visual changes

Primary actions use white on blue, sharing uses a pale-blue surface, document/demo headings use a cool tint, and context sections use warm paper. Ordinary controls retain the classic raised gray style. Primary-button contrast is 7.78:1; sharing contrast is 11.33:1. Primary, sharing and viewer toolbar controls have 44px minimum targets. These contrast values describe the declared CSS colours, not a full accessibility certification.

The existing locale-aware font stacks and shared 22/18/15/13/12px type scale remain the basis. Toolbar, list, PDF, spectroscopy and thermodynamics labels now use those shared tokens; scientific code and numerical output retain intentional monospace. No font package was added. The small project artwork inset is bounded, fixing a blank icon slot on narrow screens.

## Verification

- Full ESLint, TypeScript, project navigation/activity, catalogue, data/artifact, scientific-media, desk/control, graph, math, style, search and locale/copy gates passed through the isolated build workflow. Final source changes were followed by lint, a new production compile and output validation.
- Five activity-route tests cover valid/invalid demos and PDFs, encoded paths, and locale share-link round trips. Scientific-media now has 19 checks, including focus/visibility playback preservation and manual-pause behavior.
- Existing rendered localization suites passed for MRI, scheduling/import, finance, learning, physical science and project narratives. New window controls have explicit Simplified and Traditional Chinese copy.
- Compiled HTTP crawl: **284/284 passed** — 160 overview routes, 108 demo routes and 16 PDF routes across English UK/US and Simplified/Traditional Chinese. Checks required HTTP 200, matching document language, expected window markup and no server error digest. This is route/render validation, not 284 manual interaction tests.
- Native Edge computer use exercised desktop MRI launch and sharing; GROWMAT PDF rendering and share-link reload; Chinese PDF controls; experience → showcase → browser Back/Forward → window Close; and compiled project/demo/PDF layouts at 320px and 390px. Closing the compiled embedded demo restored the selected project and its launch-button focus. PDF zoom changed from 100% to 120%.
- The first regular-profile development visit showed a hydration warning identifying Dashlane-injected attributes. The remaining review used an InPrivate window. The compiled review displayed no application error overlay; browser intervention/DevTools improvement notices were not treated as application failures.

Final output: **118 browser files, 5.11 MiB**, including **257.1 KiB** demand-loaded mathematics; **251.2 KiB initial JavaScript gzip**, 2,058 traced runtime files and **4.81 MiB** application runtime. Existing output caps were retained. The activity shell shares the deferred project-document entry, keeping narrative translations and demo implementations off initial routes.

Temporary logs and the compiled HTTP crawl JSON are under `/tmp/homepage-polish-*`. Local previews used ports 5174 (development) and 5180 (compiled production). No production deployment or remote push was performed. Physical phones, all game outcomes, every possible demo input and assistive-technology certification remain outside this pass.
