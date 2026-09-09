# Project browser: split panes and layered chrome

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

9 September 2026. This pass follows the user's request to retain the refined navigation and smoother typography while restoring the earlier left-to-right project browser, several shades of grey and restrained old-school 3D effects.

## Delivered behavior

- The knowledge graph remains the entry view. Its Open project action now selects the project in the browser.
- All projects and Selected work share a compact left-hand list with persistent search, discipline filter, count and clear action. The right-hand document scrolls independently. A selected row remains visible when arriving from the graph or a saved browser address.
- Project selection updates `?view=files|guided&selected=slug`; `q` and `area` preserve filters. Selection and view changes create history entries; typing and filter edits replace the current entry. Browser Back/Forward restores the view, filters and selected project.
- Existing `?project=slug` documents, CV/Finder links and native applications remain available. Open in new tab is a real link to the complete document. Website, repository and PDF links retain their individual destinations; GROWMAT retains its showcase PDF.
- Open live demo mounts and reveals the experiment in the right pane. Hidden embedded experiments unmount, including when returning to the mobile list or focusing another desktop application. Direct `?project=slug&view=demo` links now reveal the experiment reliably during lazy loading.
- Below a 760px browser-container width, the list and detail become separate views with Back to list. Selection and browser-history changes restore focus to the visible pane. Search results never leave a detail for a project outside the filtered result set on screen.
- Named neutral surfaces distinguish white documents, pale headers, raised controls, toolbar chrome and the recessed frame around both panes. Crisp bevels and modest hard shadows add depth. Font stacks, scientific colors and existing graph animations are preserved.
- New visible text and accessible names have explicit Simplified and Traditional Mandarin translations.

## Validation

Passed `npm run lint`, `npx tsc --noEmit`, `git diff --check`, and the isolated production build with its repository gates. The build covers project search/navigation, catalogue/data/artifacts, controls, scientific media, equations, localization and output validation.

Chromium browser checks on the local development preview passed:

- Selecting two projects, Back/Forward, no additional document window, metadata and real new-tab opening.
- Search, discipline selection, no-result detail, clear filters, keyboard selection, switching an unfeatured selection into Selected work.
- Project → Connections → Back with search and selection intact; graph → project pane.
- On-demand CFD demo mounting, independent list/document scrolling, direct demo-link positioning.
- List/detail/back layouts at 768px, 390px and 320px, with no viewport or detail-pane horizontal overflow.
- Mobile browser-history focus restoration and hidden-demo unmounting.
- Simplified and Traditional Mandarin desktop/mobile UI labels and overflow checks.
- Opening a native application and returning with selection/filters intact; GROWMAT's PDF response and new-tab link; readable search-index failure fallback without stale details.
- After hydration, `/` switches from graph to project search; arrow keys cross open folder boundaries, and Home/End reach the first/last row.
- No uncaught browser errors during the matrix.

The shared controls were also checked in Chromium across normal, default, hovered, pressed, selected, disabled and expanded-select states. This is representative Chromium validation, not an exhaustive retest of every experiment or Safari/Firefox.

## Visual review

- [Desktop browser and CFD document](../reviews/project-browser-2026-09-09/desktop.png)
- [390px project list](../reviews/project-browser-2026-09-09/mobile-list.png)
- [390px Traditional Mandarin detail](../reviews/project-browser-2026-09-09/mandarin-detail.png)

The complete temporary browser matrix and additional screenshots are under `/tmp/samuel-project-review/` on this server. These files are session evidence; the three images above are retained in the repository.

Preview: `http://localhost:5174/en-gb/projects`. Direct browser: `http://localhost:5174/en-gb/projects?view=files`.
