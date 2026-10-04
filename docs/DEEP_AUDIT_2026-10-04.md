# Homepage audit — 4 October 2026

The audits, translation review and cleanup are complete. This is the verified release checkpoint for `main`, with fresh checks on **548 frozen release inputs**. This report replaces overlapping dated UI reviews and handoffs. Scientific provenance, licences, the System 7 design contract, Classic/Blue/Paper patterns and reusable QA checks remain maintained.

## Repairs

- Centralized canonical, language-alternate and sharing metadata for direct section routes. Unknown finite locale/section routes now render the translated recovery screen on the server and return HTTP 404, including with JavaScript disabled. Next 15.5.25's nested thrown `notFound()` produced an empty shell in the previous dynamic production layout; inline recovery plus middleware status avoids that failure without an experimental flag or dependency change.
- Restricted locale, section, bootstrap and translation maps to their own keys. Inputs such as `constructor`, `__proto__` and `toString` previously caused redirects, server errors or native Object text in descriptions; they now retain literal source text unless an explicit translation exists.
- Preserved pending editor values during backup restore, delayed initialization and concurrent saves; retained unreadable originals. Corrected native form reset, required-field focus and selector cancellation behavior.
- Made overflowing equations keyboard-focusable only while they need horizontal scrolling, fixed narrow metric wrapping and heading/navigation names, and gave 78 labelled control containers group semantics.
- Repaired Gitless lint discovery and ordinary/isolated/Docker preflight coverage. Exact exclusions protect local reference trees; generated vendor/search/math inputs regenerate during prebuild. No private originals or scientific media were deleted.

Copy changes keep product names, code, scientific notation, original PDFs/images and recorded source-language examples intact. The [translation workflow](PROJECT_COPY_WORKFLOW.md) defines these exceptions and the checks for dynamic labels and accessibility text. All 30 project dictionaries were reviewed; **542 locale values across 521 entries in 27 files** were corrected, alongside 39 shared locale values. Desktop summaries match project narratives. The review corrected physical mass versus image quality, rows versus columns, model parameters, finance replay actions and Taiwan terminology. Source gates passed **7,628 bilingual entries in 40 registered source files, 906 rendered locale cases and 868 narrative strings**. These counts describe registered coverage, not every possible interaction.

## Dependencies and output

The initial full audit found five high-severity paths through Next's lint plugin, `fast-glob`, `micromatch` and `braces`. The [reviewed braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) listed no patched version at review time. The scoped npm alias replaces only the plugin's `fast-glob` with **tinyglobby 0.2.17**; Next, its lint config and plugin remain **15.5.25**. [Notices](../THIRD_PARTY_NOTICES.md) preserve licences and attribution.

This replacement supports this repository's default root, not general `fast-glob` compatibility. The [pinned Next source](https://github.com/vercel/next.js/blob/v15.5.25/packages/eslint-plugin-next/src/utils/get-root-dirs.ts) calls `globSync` for configured roots; comparative fixtures found different symlink/globstar semantics. The [lint guard](../scripts/check-next-lint-dependency.mjs) rejects configured `settings.next.rootDir`, pins the reviewed versions, preserves all 21 Next rules and runs nine link regressions. A fresh isolated `npm ci` reproduced the lockfile; the full audit reported **0 vulnerabilities, 307 verified signatures and 58 attestations**, including the alias's registry identity and integrity.

The earlier build exceeded its unchanged 120-file budget at 124 files. Eagerly importing the small Finder and combining the always-mounted KnowledgeGraph with its existing lazy ProjectExplorer removed four unnecessary JS/CSS requests. Settings retains its lazy loading/failure boundary; scientific demos, PDFs, games and one shared math chunk remain deferred.

Fresh `npm run check:release` passed: lint, TypeScript, deployment/request fixtures, dependency verification, all source/scientific/locale gates, isolated compilation and output limits. The 548 application, configuration, script and public-source hashes remained unchanged through compilation and browser verification; the staged inputs match those hashes.

| Output | Actual | Remaining allowance |
| --- | ---: | ---: |
| Browser files | 120 | 0 files |
| Application browser bytes, excluding math | 5,131,792 | 111,088 bytes |
| One demand-loaded math chunk | 263,303 | 43,897 bytes |
| Initial JavaScript gzip | 265,348 | 11,132 bytes |
| Traced runtime files | 2,068 | 432 files |
| Application runtime bytes | 5,208,899 | 33,981 bytes |

Limits match the previous revision unchanged. Total browser output is 5,395,095 bytes, including the separately bounded math chunk. Math is absent from every initial page entry.

## Recorded compiled verification

These are fresh results after the translation and cleanup pass, against a copied standalone production build. Linux Playwright 1.63.0 ran Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6. No application or tracked QA source changed during verification. Raw results stay under ignored `.codex/reports/final-cleanup/`.

| Check | Fresh result |
| --- | --- |
| HTTP routes, exact public bytes/MIME, request/error challenges | 694 groups / 1,278 requests; zero failures |
| Complete browser crawl | 942/942 in each of Chromium, Firefox and WebKit; 2,826 journeys |
| Actual mounted recovery/hooks/controls | 15/15 per engine |
| Equation focus, native keyboard pan and resize | 8/8 per engine |
| Locale bootstrap poisoning/precedence | 12/12 per engine |
| Preferences / historical regressions | 7/7 and 12/12 per engine |
| Default-rule axe accessibility | 172 Chromium states; zero violations/page errors |

The crawl derived 41 projects, 28 demos, four catalogue PDFs, seven games, 12 catalogue app targets and 17 core routes from source. It covered all four locales at 1440px and 320px, all three patterns, no-JS essentials and 56 recovery journeys. Passing browser journeys had no captured page, asset or unexpected-request errors, including late events.

Focused Traditional Chinese interaction samples also passed: **3 Firefox desktop states** at 1440px (physical mass conversion, durable draft removal and SideQuest cheers), and **10 WebKit states** at 1440px/320px (grid row/column labels and keyboard input, spectroscopy reload, molecular bars, finance replay and MRI parameter labels). This is a sampled scope; the 906 source-render cases cover further deterministic copy/feedback states.

Axe recorded **22 incomplete results for 52 closed-combobox references**, each checked to identify one existing listbox. [W3C combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) permits references to hidden popups; these remain manual review results, not a screen-reader conformance claim. Equation observer cleanup was source-reviewed; consecutive invalid-TeX transitions and a second later font-loading cycle were not injected.

**One earlier WebKit dual-draft timeout remains unexplained because its failed context was disposed.** An unchanged focused rerun and 20 independent ordinary-debounce repetitions passed. The final 12-group historical suite requires observed native edits, exact editor values and unchanged canonical data before releasing held saves. Passing reruns do not establish a proven application fix for the lost timeout.

## Cleanup

The deeper audit moved 30 byte-identical check receipts (54,911 bytes) into [project-copy fixtures](../scripts/fixtures/project-copy-audits/README.md), removed 34 proven unused CSS classes in 12 modules (12,190 bytes at that patch stage), and removed two further dead graph heading rules. Its inventory reached 213/213 managed source files with no unresolved imports or unowned runtime assets. Computed icon selectors and scientific original filenames were retained.

Documentation cleanup pruned **196 redundant files (13,004,963 bytes)**: dated UI/release reports, duplicate screenshot batches and temporary review JSON. The icon-family sheet moved byte-for-byte into curated `docs/assets/`; unique original-source revisions and hashes were extracted into one source record. The docs tree is reduced from 211 files to 16. [Project source records](PROJECT_SOURCE_RECORD.md), [artwork/MRI provenance](PROJECT_ARTWORK.md), original icon prompts, [design references](SYSTEM7_DESIGN_BENCHMARK.md), workflow and curated tour media remain. Raw logs and new screenshots belong under ignored `.codex/reports/`; reusable checks remain in `scripts/`.

## Reproduce

Use Node 22 and locked dependencies. QA tools stay outside application dependencies:

```sh
npm ci
npm run check:release
qa_tools=$(mktemp -d)
npm install --prefix "$qa_tools" --no-save playwright@1.63.0 esbuild@0.28.2 axe-core@4.13.0
"$qa_tools/node_modules/.bin/playwright" install chromium firefox webkit
export PLAYWRIGHT_CORE_PATH="$qa_tools/node_modules/playwright"
```

Install Playwright's Linux system libraries if needed. Copy the compiled standalone, static files and public assets to a separate preview so another build cannot overwrite it:

```sh
audit_preview=$(mktemp -d)
cp -a .next-build/standalone/. "$audit_preview/"
mkdir -p "$audit_preview/.next-build"
cp -a .next-build/static "$audit_preview/.next-build/static"
cp -a public "$audit_preview/public"
(cd "$audit_preview" && PORT=5189 HOSTNAME=127.0.0.1 NODE_ENV=production node server.js)
```

In a second shell, set `PLAYWRIGHT_CORE_PATH` to the same external installation, then run from the repository root. Clear coverage filters (`DEEP_GROUP`, `DEEP_LOCALES`, `DEEP_WIDTHS`, `DEEP_SLUGS`, `REVIEW_GROUP`, `LOCALE_PATTERN`, `AXE_GROUP`, `AXE_PROJECTS`) for complete matrices:

```sh
export REVIEW_ORIGIN="http://localhost:5189"
npm run check:deep:http
for engine in chromium firefox webkit; do
  BROWSER_ENGINE="$engine" npm run check:deep:browser
  BROWSER_ENGINE="$engine" npm run check:deep:recovery
  BROWSER_ENGINE="$engine" node scripts/check-deep-math.mjs
  BROWSER_ENGINE="$engine" node scripts/check-deep-locale.mjs
  BROWSER_ENGINE="$engine" node scripts/check-app-improvements.mjs
  BROWSER_ENGINE="$engine" node scripts/check-review-browser.mjs
done
BROWSER_ENGINE=chromium node scripts/check-deep-accessibility.mjs
npm run --silent audit:repository
```

The [adversarial browser runner](../scripts/check-adversarial-browser.mjs) retains additional chunk-failure, PDF retry, Finder failure, insecure-context and recovery fixtures. Its compiled Settings failure fixture requires `SETTINGS_CHUNK_PATH` for the reviewed build; screenshots default to ignored reports.

Stop the preview you started when finished. Browser coverage uses Linux Playwright engines and selected meaningful states; it does not certify physical devices, native zoom/readers, every simulation outcome, media rights or production deployment. Eight-key localStorage restore still uses best-effort rollback during a persistent storage outage. Future module extraction and native-device/visitor studies remain separate work.

## Final translation and cleanup pass

- Copy and release inputs are frozen and verified; scientific values, source keys and placeholders are preserved.
- Fresh strict release, HTTP, accessibility, full browser crawls and all targeted regression suites passed.
- Staged review found no private, credential, generated-output or temporary-review payloads.
- This checkpoint belongs on `origin/main`; Git history and remote tracking refs record publication state.
