# Archive and detailed Find follow-up

5 September 2026. Current-source validation, not a claim of server deployment.

## What changed

- Orbital Lab and all eight desk accessories have individual archive records.
  Eight tools form a Desk Accessories suite; Orbital Lab sits on the molecular
  shelf. Their actions open the existing desktop windows, not copied demos.
- The archive now derives 40 files, 36 runnable entries and 16 guided experiences
  from shared metadata. Research demos remain 27 lazy-loaded modules. Catalogue
  checks require exactly one executable record per native app.
- Native app records have translated titles, descriptions, capabilities, build
  phases and privacy/model notes. Research narratives keep their existing source
  language, and the interface explicitly states that boundary.
- Find offers an optional square System 7 checkbox for detailed search. The
  generated per-language index includes public metadata, case briefs, build logs
  and static demo/app wording, including inactive tabs and alternative states.
  It preserves inline JSX phrases, entities, units and template fragments.
- A source declaration graph isolates related components instead of attaching
  every shared-module string to every project. Entire unrelated translation
  dictionaries, shader code, storage keys and private files are excluded.
- Indexes are prepared before dev/build, not bundled into initial JavaScript.
  They are about 371–446 KiB per locale before transport compression and load
  only when requested. A failed fetch leaves basic Find usable and offers retry.
- Search displays a relevant excerpt, uses English plus localized aliases and
  preserves keyboard navigation. Escape now closes Find immediately even when
  the native search input contains text.

## Scope and limits

This is a static public-text index, not a crawler or private desktop search.
Linked PDFs, external sites, local notes/drawings, imported files and arbitrary
runtime values are not indexed. Fixed wording around computed values is indexed;
unbounded generated values are not invented. A browser-local cache lasts for the
loaded page; reload after regenerating indexes in an existing development session.

## Verification

- 17 search-generation tests: coverage, inactive-state wording, English/Mandarin
  aliases, sibling isolation, explicit display labels, template fragments, JSX
  whitespace/entities, size bounds, deterministic output and stale-file rejection.
- 14 Find helper tests: normalization, validated document shapes, unknown/duplicate
  rejection, size bounds, excerpts and text-only handling.
- Production browser Find matrix: four locales × 320/1440 px. Confirmed no index
  fetch for basic search; a phrase present only in deeper orbital explanatory
  copy becomes discoverable with Detailed search; toggling again reuses the
  loaded index. Translated app/archive results, Escape and overflow checks pass.
- A simulated index HTTP 503 kept basic search working; retry recovered after the
  failure was removed. No query or private notes are sent to a search service.
- Archive launch matrix: nine native apps × four locales × 320/1440 px, **72**
  successful launches with no document overflow or script errors.
- The About source/download action passed a further eight locale/width cases;
  its repository URL, safe external-link attributes and translated text were
  checked. The production PDF.js licence endpoint returned the full licence.
- Full release checks pass, including 479 orbital, 28 desk, 20 classic-control
  regressions; 17 simulated deployment scenarios; catalogue, locale, artifact,
  lint, type and production-output gates. Dependency audit reports zero known
  vulnerabilities at the checked threshold, with 308 verified registry signatures.
- Production output: 102 browser files, 3.52 MiB; 2,049 traced runtime files,
  3.31 MiB application runtime; initial route JavaScript approximately 216 kB.
  This is around 4 kB more initial JavaScript than the earlier render-only build.

Browser checks use Edge/Chromium with touch/high-DPI emulation, not physical iOS
or exhaustive assistive-technology certification. Public-source licensing and
full-history privacy are separate from website release validation.
