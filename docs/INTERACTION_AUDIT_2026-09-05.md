# System 7 interaction follow-up

Audit date: 5 September 2026 (Europe/London)

This follow-up builds on the [4 September release audit](RELEASE_AUDIT.md).
Three independent reviewers covered Desk Accessories, archive interactions,
and RUN/HACK/design. The integration pass used the local site in Edge through
computer use, plus separate disposable browser profiles for destructive-data
and cross-tab tests. Existing visitor data was not used as test fixtures.

## Changes visitors can use

- **File → Find…**, or **⌘K / Ctrl+K**, opens a native modal with classic
  striped chrome. It searches 21 applications and all 31 project files by
  multiple keywords, including translated summaries and normalized fullwidth
  or accented text. Arrow keys choose, Return opens and Escape returns focus.
- The menu-bar clock opens Pocket Calendar. Its date picker supports arrows,
  Home/End, month paging and Shift + Page Up/Down for year paging, with one
  calendar date in the Tab order.
- Classic, Blue and Paper desktop patterns persist and follow changes from
  other tabs in the same browser.
- RUN/HACK replay has pause/resume, rewind and single-point stepping. Hidden
  chapters, inner demos and browser tabs pause it; reduced motion starts it in
  manual mode. Repeated cheers use a fresh animation without growing a feed.
- Archive search understands multiple terms and translated summaries; its
  newest-first sort respects abbreviated ranges such as `2023—26`.
- Portfolio Map uses Geneva/Monaco instead of decorative serif headings,
  improves tiny labels and supports keyboard tab navigation.

## Defects found by repeat checks

- Old Note Pad, Focus Clock and Calculator tabs could overwrite a newer saved
  state when closed. They now observe cross-tab updates before subsequent
  flushes. Storage clearing also refreshes the other accessories.
- A sleeping timer could count yesterday's completion as today's. Completion
  is settled once against the actual end date, with bounded countdown/tally
  values and explicit wake-up handling.
- Converter character stripping silently changed scientific notation such as
  `1e3` into `13`. It now accepts complete decimal/scientific values and rejects
  invalid input without manufacturing a different number.
- Calculator digit/decimal input after a scientific-format result could form
  an invalid number. Input transitions now use shared, tested helpers. Rapid
  calculations also receive unique tape IDs.
- Calendar note clearing now requires a second click. Backup restoration
  validates its payload and asks before replacing existing accessory data.
- A fast Sketch Pad release could omit its final coordinate. Pointer-up now
  captures the release location while cancellation uses the pending point.
- A Finder-open race focused a filtered-empty archive node immediately before
  React removed it. Detail focus now runs after the requested project commits;
  a 20-cycle stress test preserved focus throughout.
- Tab navigation could enter a covered desktop window without raising it.
  Focus capture now brings that window forward. Archive `/` shortcuts also
  respect the active window and open modals.
- Coarse-pointer controls were taller than the phone's top and bottom bars.
  The bars, dropdowns, content offsets and tablet window bounds now account for
  44 px controls. Fine-pointer desktop chrome keeps its compact presentation.
- Chinese timeline accessible names contained English MORNING/RESULT prefixes;
  those and all newly introduced control strings now use the locale layer.

## Verification

- `npm run check:release`: dependency audit, registry signatures, ESLint,
  artifact/data/catalogue/style/locale gates and isolated production build.
- `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` and `git diff --check`.
- New `npm run check:desk`: 28 deterministic timer, converter and calculator
  regressions against the same helpers used in the application. It runs in
  both standard and isolated pre-build workflows without a new dependency.
- Finder: English, Simplified Chinese and Traditional Chinese at 320, 390 and
  1440 px; autofocus, initial scroll, empty states, keyboard selection, modal
  containment, Escape restoration, cold archive mount and filtered-archive
  recovery. Production-browser smoke also checked chunk delivery and hydration.
- Archive: all six map views at 390 and 1440 px; URL restoration, sorting,
  translated/fullwidth search, valid ARIA references and tool-filter state.
- RUN/HACK: 320, 390 and 1280 px; playback, stepping, finish, repeated cheers,
  hidden-state pause, reduced-motion mode and translated accessible names.
- Accessories: cross-tab note/tape/timer propagation, closing an older tab,
  storage clearing, backup cancel/restore, calendar navigation, numeric input
  and 390 px bounds in isolated profiles.
- Shell: 320 × 700, 390 × 844 and 844 × 390 layouts, pattern reload and real
  cross-tab changes, calendar click/Enter and keyboard raising of covered
  windows. At 1024 × 1366, coarse-pointer menu alignment, window drag/zoom
  bounds and switching pointer modes also passed; fine-pointer desktop
  dimensions stayed unchanged.
- Production HTTP: eight core/locale routes returned 200 with common security
  headers; untrusted Host returned 421, POST returned 405 and OPTIONS returned
  204. The canonical Host received HSTS and same-origin opener policy. The
  Host probes used raw HTTP after Node fetch did not preserve its override.

No runtime exceptions or horizontal document overflow were observed in those
browser checks. This is a measured matrix, not exhaustive browser certification.

The release gates reported zero known dependency vulnerabilities, 308 verified
package signatures and 47 attestations. Locale coverage is 216 archive keys
across four locales, 641 core strings, 47 project-summary/suite strings and
279 RUN/HACK source strings; 282 RUN/HACK translations passed the
Traditional-Chinese residue check. All 2,190 project CSS references resolve.
The final production checkpoint generates 78 static paths: 100 browser files
(3.39 MiB), 2,044 traced runtime files and 3.17 MiB of application runtime,
within the existing output budgets. The final tablet changes were followed by
a fresh isolated build and strict TypeScript check.

## Boundaries and deployment

- Cross-tab storage follows the latest observed save. It is not concurrent
  collaborative editing, conflict merging or cross-device synchronization.
  Exported backups remain the portable-copy mechanism.
- Archive chrome and summaries are localized. The previously disclosed
  British-English boundary for project titles, technical narratives,
  analytical map copy and interactive labs is unchanged.
- The new Find module is lazy-loaded. There are no new runtime dependencies,
  API services, account requirements or visitor-device permissions.
- The independent browser scripts were one-off audit fixtures, not an added
  portable CI browser suite. The 28 pure regressions are preserved in the repo.
- Production rollout is blocked: the configured server rejected noninteractive
  SSH authentication, and the public `/en-gb/desk` route still returned 404.
  This audit does not claim that the new source is live. Deployment requires
  restoring access, then running the existing rollback-capable deployment and
  public-origin verification workflow.
