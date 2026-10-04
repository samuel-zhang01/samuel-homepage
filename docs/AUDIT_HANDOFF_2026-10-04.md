# Continue the app improvement audit

Checkpoint: 4 October 2026. The owner requested a Git handoff to continue coding on another device. **The full ten-round objective remains unfinished.** This checkpoint includes implementation, portable browser scripts, screenshots, and the execution plan. It does not claim a completed release or final adversarial grading.

## Start here

1. Read [continue.md](../continue.md), then [the ten-round execution plan](APP_IMPROVEMENT_AUDIT_2026-10-04.md).
2. Inspect `git status`, this checkpoint's diff, and the actual app before making further changes.
3. Use Node 22. The old device's default Node 18 was too old; the repository requires Node >=20.16. Do not assume the previous machine's executable paths exist.
4. Install from the committed lockfile with `npm ci`. Start `npm run dev -- --port 5186`, then open `http://localhost:5186/en-gb/settings` and `http://localhost:5186/en-gb/desk`.
5. Resume the incomplete checks below, fix actual defects, then finish the remaining rounds and independent scorecard.

## Transfer this commit to another device

The commit is local on `main`. An incremental bundle named `samuel-homepage-handoff-2026-10-04.bundle` accompanies the checkpoint; copy it to the other device. It requires the existing baseline commit `ebc5525` (already on the configured remote at handoff). In a clone containing that baseline:

```bash
git fetch /path/to/samuel-homepage-handoff-2026-10-04.bundle HEAD
git switch -c audit-handoff FETCH_HEAD
```

Then tell the coding agent to read `continue.md`. If transferring through the remote instead, push this local commit from the original device and fetch it on the other device; no push has been performed by this task.

## Full goal and constraints

Audit and iteratively improve the homepage app across functionality, usability, UI/UX, animation and loading states, security, responsiveness, localization and wording, cross-platform compatibility, settings configurability, and deployability while preserving all existing themes. Produce a detailed execution plan, complete ten focused implementation/review rounds with adversarial review, and verify the final result.

The user specifically wants the existing themes kept. Preserve **Classic, Blue and Paper**, the System 7 window chrome, type hierarchy, beveled controls, icons and the current project/scientific evidence distinctions. Improve the experience for new visitors, returning desk users, researchers, recruiters, mobile visitors and keyboard users. Consider other implementation directions in the audit without building unsolicited cloud accounts, sync, or a replacement design.

Work autonomously within this scope. Use an independent adversarial reviewer to challenge the changes and grade all aspects honestly. Do not turn ten focused rounds into ten unsupported claims of independent testing. Do not mark the goal complete until the documented requirements are verified. This handoff transfers the work; it does not complete or cancel the original goal. No production deployment or remote push has been performed as part of this checkpoint.

## Implemented changes in this checkpoint

| Area | Implementation | Main files |
| --- | --- | --- |
| Settings | Dedicated routed window, reachable from the main menu and Find. Existing themes, four languages, 12/24-hour clock, startup preference, reduced interface effects, backup entry and display-only reset. | `src/components/DesktopSettings.tsx`, `DesktopSettings.module.css`, `desktopSettingsCopy.ts`, `src/app/settings/page.tsx`, locale section route |
| Preferences | Defensive schema reading, legacy theme-key compatibility, cross-tab updates, and session-only fallback if storage fails. Later choices preserve earlier session choices after quota/permission failures. | `src/hooks/useDesktopPreferences.ts`, `src/lib/desktopPreferences.ts` |
| Desktop accessibility/resilience | Announced themed loading placeholder, per-window render/chunk error boundary, modal background inertness, settings navigation integration. | `src/components/SystemSevenDesktop.tsx`, `WindowErrorBoundary.tsx`, `src/app/globals.css` |
| Shared controls | Uncontrolled ClassicSelect tracks native form reset; visible control receives invalid-state ARIA. Finder scrolls its own result panel and improves keyboard/high-contrast focus. | `ClassicSelect.tsx`, `DesktopFinder.tsx`, `DesktopFinder.module.css` |
| PDFs/demos | Static PDF page skeleton, preview retry, healthy-reader source-PDF link, localized demo error boundary and themed demo skeleton. Native source links bypass desktop PDF interception. | `PdfPreview.tsx`, `PdfPreview.module.css`, `projects/ProjectDemoRouter.*` |
| Saving | Secure-random identifier fallback when `randomUUID` is unavailable on HTTP LAN; corrupt pending/recovery records remain untouched while valid drafts commit; recovery-key/version validation and truthful save status. | `src/lib/deskPersistence.ts`, `src/hooks/useDeskPersistence.ts`, `ProductivityApps.tsx`, `ProductivityExtras.tsx` |
| No JavaScript | Localized CV/contact essentials and language links remain accessible without interactive startup. | `src/app/layout.tsx` |
| Security/deployment | Full Host authority validation, rejection of ambiguous zero-prefixed IPv4, validated-origin locale redirects, correct environment precedence, verification-flag validation, settings probes and adversarial request/deploy checks. | `src/middleware.ts`, `deploy.sh`, `scripts/check-request-security.mjs`, `check-deploy.mjs` |
| Tooling/locales | Scoped compatible TypeScript ESLint 8.55.0 overrides, refreshed transitive lock, explicit settings-copy locale validation, new `check:security` release gate. | `package.json`, `package-lock.json`, `scripts/check-locales.mjs` |

Reduced interface effects cover CSS transitions/loading effects and shell scrolling. Interactive scientific demos retain their own playback controls; this is stated in settings. Reset includes startup, clock, pattern and effects, and keeps language and desk data.

## Evidence at transfer

| Check | Result and scope |
| --- | --- |
| `npm run lint` | Passed again against the handoff implementation, after the final copy-module extraction. |
| `npx tsc --noEmit` | Passed on the handoff implementation. |
| `npm run check:locales` | Passed again at handoff, including the new settings dictionary. |
| Desk persistence helper | 14 merge/conflict/recovery/failure cases passed. Browser verification of real insecure HTTP remains incomplete. |
| `npm run check:security` | 50 Host/method/locale/transport/CSP cases passed. Source/request fixtures, not a penetration test. |
| `npm run check:deploy` | 26 scenarios passed with mocked Docker/npm and real temporary Git repositories. Not a real production deployment. |
| Dependency runtime audit | `npm audit --omit=dev --json` reported zero vulnerabilities. |
| Registry signatures | 320 verified signatures and 57 verified attestations. |
| Full dependency audit | **Failed: 5 high-severity tooling paths**, rooted in `braces` through the Next ESLint plugin. Strict gate remains enabled. |
| Production build | Full configured preflight chain passed, and Next production compilation succeeded. The run did not reach a verified terminal success/output-check result before transfer; rerun `npm run build:isolated`. |
| Settings browser checks | Chromium passed 16 locale/viewport combinations (four locales × 1440×1000, 320×568, 390×844, 844×390), plus main-menu/Find discovery and mobile-guide keyboard containment. Screenshots are committed. |
| Settings preference checks | Initial run asserted a radio before hydration settled. The runner now waits for the persisted checked state and asserts actual stored data. The focused rerun did not produce a complete result before transfer; all remaining preference groups need rerunning. |
| Historical browser regression | An earlier warm run passed eight groups: cross-tab drafts, independent edits, close/pagehide, IndexedDB fallback, selected-work navigation/icons, CV demo lifetime and Mandarin mobile demo controls. MRI's exact image locator then timed out. The transfer rerun did not finish. Treat the complete suite as pending. |
| Additional browsers / final grading | Independent scripts prepared; final Chromium failure injection, WebKit/Firefox and final grades remain pending. No Safari/iOS/Android native-device result is claimed. |

The source-review baseline scores were provisional: functionality 7, ease/discovery 6.5, visual/theme cohesion 8, accessibility 6.5, responsiveness 7.5, loading/motion 6, security/privacy 7.5, localization 7.5, cross-platform evidence 5.5, deployability 8, settings 2 (out of 10). They were based on source and historical evidence, not a new usability study. Establish final scores after the unfinished runtime checks, and reassess deployability in light of the current audit blocker.

Screenshots: [desktop settings](reviews/app-improvements-2026-10-04/en-gb-1440.png), [320px settings](reviews/app-improvements-2026-10-04/en-gb-320.png), [Traditional Chinese settings](reviews/app-improvements-2026-10-04/zh-tw-390.png). The other 13 locale/viewport screenshots live beside them.

## Resume in this order

1. **Reestablish terminal checks.** Run lint, TypeScript, desk/security/deploy/locale checks and the isolated build. Investigate failures; do not count the incomplete previous build as passing.
2. **Preference correctness.** Run all seven `check-app-improvements.mjs` groups. Verify persisted 12-hour clock/startup/effects after hydration, cross-tab themes, reset preserving real notes, blocked storage and quota errors. Verify original View-menu themes still synchronize with settings.
3. **Historical regressions.** Run the complete `check-review-browser.mjs`. Investigate the MRI Recorded images locator failure: confirm the correct view opens, the actual image source and its 2200px natural width, and both Mandarin limitations. Do not simply relax the test to hide a broken interaction. Finish game pause and PDF window/navigation groups.
4. **Independent adversarial browser review.** Run `check-adversarial-browser.mjs`, review its JSON results, and fix real defects. Exercise Finder focus/empty/error/retry, ClassicSelect mounted behavior, raw PDF navigation, PDF retry, delayed/failed lazy chunks, local error boundaries, reduced motion, narrow and short layouts. Its syntax is checked; the full runner is not yet validated. Add meaningful form-reset coverage if the runner does not already prove it.
5. **Real HTTP and recovery.** Add/finish a dedicated browser regression for non-secure HTTP (not merely removing `navigator.locks` on localhost). Use a disposable origin/context, verify `isSecureContext === false`, then Note Pad/Quick List edits across tabs and reload. Confirm retained malformed records do not block valid edits and status remains truthful. Confirm four-language no-JS essentials. Retained raw corrupt drafts currently have a status, but assess whether an explicit recovery download is needed.
6. **Cross-platform and polish.** Repeat relevant journeys on Chromium, Firefox and WebKit using installed engines; record unavailable engines honestly. Review screenshots, 200% zoom, touch targets, focus visibility and long Chinese labels. Keep theme identity. Gather actual fresh-user observations if available; do not invent them.
7. **Dependency blocker.** Review [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and the current registry. At this checkpoint the available `braces` version is affected. `npm audit fix --force` suggests a Next lint-config downgrade that loses modern App Router rule coverage; it was deliberately not applied. Do not disable audit or silently omit dev dependencies from the existing release gate. Find a reviewed compatible remediation or document the external blocker and prevent release until addressed.
8. **Finish the ten rounds.** Update the plan with per-round changes, test evidence, independent findings, final scores, remaining nonblocking recommendations, and an explicit deployment readiness decision. Update README/docs index/handoff. Mark complete only when the objective's required work is actually verified.

## Portable commands

```bash
node --version                    # use Node 22
npm ci
npm run lint
npx tsc --noEmit
npm run check:desk
npm run check:security
npm run check:deploy
npm run check:locales
npm run build:isolated
npm run audit:dependencies        # currently blocked by the tooling advisory
npm run dev -- --port 5186
```

Browser scripts use an external Playwright installation, keeping QA dependencies out of the app's runtime. Existing Playwright can be used; otherwise install it into a separate directory:

```bash
npm install --prefix ../samuel-homepage-qa --no-save playwright
../samuel-homepage-qa/node_modules/.bin/playwright install chromium firefox webkit
export PLAYWRIGHT_CORE_PATH="$(cd ../samuel-homepage-qa && pwd)/node_modules/playwright"
export REVIEW_ORIGIN=http://localhost:5186
mkdir -p .codex/reports/app-audit

node scripts/check-app-improvements.mjs
node scripts/check-review-browser.mjs
node scripts/check-adversarial-browser.mjs

BROWSER_ENGINE=webkit node scripts/check-app-improvements.mjs
BROWSER_ENGINE=firefox node scripts/check-adversarial-browser.mjs
```

Omit `BROWSER_EXECUTABLE_PATH` to use Playwright's installed Chromium; set it only if using a known system Chromium. Browser scripts create disposable contexts and must not attach to a user's everyday browser profile. `REVIEW_GROUP` filters the first two scripts; `ADVERSARIAL_GROUP` filters the adversarial script. Initial development compilation can exceed 15 seconds, so navigation uses a 60-second limit.

Generated `.next*`, `node_modules`, `public/search/*`, vendor/math assets, and raw `.codex/reports/` logs are ignored and are not transferred by Git. The build/dev preparation scripts regenerate assets. Previous process handles and preview URLs are not proof that a server is still running on a new device. The copied adversarial runner now uses configured Playwright/browser paths rather than the old machine's hardcoded paths.

## Prompt for the next coding agent

> Read `continue.md`, `docs/AUDIT_HANDOFF_2026-10-04.md`, and `docs/APP_IMPROVEMENT_AUDIT_2026-10-04.md`. Continue the unfinished ten-round homepage improvement goal, preserving Classic, Blue and Paper and the System 7 design. Audit the current worktree and real test evidence before relying on previous claims. Use an independent adversarial reviewer, resolve the listed pending checks/defects, review cross-platform behavior and release readiness, then update the scorecard and handoff. Work autonomously; do not mark completion on partial checks or ignore the strict dependency-audit blocker. Do not deploy without authorization.
