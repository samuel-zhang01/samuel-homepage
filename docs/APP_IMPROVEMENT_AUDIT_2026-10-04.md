# App improvement audit and execution plan

Date: 4 October 2026. Scope: this repository and isolated local previews. Preserve the System 7 visual language and Classic, Blue and Paper desktop themes. No production deployment is part of this audit.

## Review method

An independent adversarial reviewer challenges the changes; implementation agents cover the desktop, shared controls, and security/deployment. Scores are engineering judgements, not usability-study results or certifications. Browser evidence, source inspection, and untested assumptions are recorded separately. A passing build alone does not establish usability or cross-platform compatibility.

Priorities: P1 = data loss, security exposure or blocked core journey; P2 = significant usability, accessibility or reliability defect; P3 = refinement. Fix verified defects before optional visual work. Every round preserves existing themes, checks English UK/US and both Mandarin editions where changed, and considers keyboard, touch and reduced motion.

## Ten focused rounds

| Round | Work and expected outcome | Acceptance evidence | Status |
| --- | --- | --- | --- |
| 1. Baseline and fresh visit | Recheck September regressions; audit recruiter, researcher, casual/mobile visitor and returning desk-user journeys. Record adversarial findings and initial grades. | Existing regression results, source findings with locations, explicit coverage boundaries. | Partial verification; continue baseline retest |
| 2. Settings and discovery | Add a routed System 7 Settings control panel, reachable from the main menu and Find; retain all three desktop patterns and language menus. | Direct routes and menu work on desktop and 320px; each theme remains selectable. | Implemented; Chromium layout/menu/Find checked |
| 3. Preference reliability | Persist display choices defensively; handle corrupt/blocked storage, synchronise tabs, and offer a reset that does not remove desk data. | Reload, cross-tab, corrupt-storage, blocked-storage and reset checks. | Implemented; full preference retest pending |
| 4. Loading and recovery | Give lazy content informative, accessible skeletons that match the theme; retain usable recovery paths. | Loading under delayed requests; reduced-motion presentation; failure state inspection. | Implemented; failure injection pending |
| 5. Keyboard and assistive use | Challenge shared selectors, Finder and PDF access; repair focus/state mismatches. | Keyboard, form-reset, invalid state, navigation and source-document access checks. | Implemented; mounted-browser checks pending |
| 6. Motion and personal comfort | Add optional reduced interface effects, startup control and clock format; preserve meaningful simulation controls. | OS reduced motion and app preference; startup skip; live clock-format changes. | Implemented; retest pending |
| 7. Language and wording | Translate new settings, loading and recovery labels; check UK/US differences and both Mandarin editions; keep source-evidence caveats. | Locale gates, direct locale routes, visible and accessible copy review. | Implemented; locale gate checked; final review pending |
| 8. Responsive and platform polish | Inspect narrow/short screens, touch targets, theme samples, long labels and overflow; exercise additional browser engines when available. | 320×568, 390×844, desktop and landscape checks; browser/version evidence. | 16 Chromium layouts checked; other engines pending |
| 9. Security and deployability | Recheck headers, request guards, dependency advisories, environment parsing and rollback; fix evidenced release defects. | Deployment and middleware checks, dependency audit, lint and isolated production build. | 50 request / 26 deploy checks pass; tooling advisory blocks release |
| 10. Adversarial retest | Independently challenge final implementation, rerun affected and historical regressions, grade with evidence and document residual work. | Final review findings, fixes, scores, limitations and reproducible commands. | Pending independent final review |

These are distinct implementation/review passes, not ten claims of a perfect redesign. Additional defects discovered during testing are fed back into the relevant round. Completion requires evidence; unavailable checks stay explicitly unverified.

## Fresh-user journeys and alternative implementations

| Visitor / possible direction | Useful first task | Keep / improve | Trade-off and next decision |
| --- | --- | --- | --- |
| Recruiter or hiring manager | Selected work → contribution → CV/contact | Keep direct project links and concise selected-work entry; avoid requiring desktop knowledge. | Consider an optional linear reading view later, sharing the same content and themes. Validate with actual visitors before adding a second navigation system. |
| Researcher or technical reviewer | Project explanation → evidence → interactive demo/PDF | Preserve recorded versus calculated evidence, source access, and resumable demo state. | A dedicated teaching mode could group experiments into lessons; requires editorial scope rather than cosmetic changes. |
| First mobile visitor | Open a useful destination, switch windows, change language | Keep one active surface, reachable main menu and direct settings route. | A compact launcher can be evaluated later; do not remove the desktop theme to solve layout issues. |
| Returning desk-tools user | Resume notes/tasks and export a backup | Protect browser-local drafts, conflict recovery and clear storage wording. | Cloud sync or accounts would require authentication, conflict, privacy and operations design; not implied by this request. |
| Casual explorer | Games, orbital lab and visual projects | Keep playful motifs; allow skipping startup and reducing interface effects. | An installable/offline version needs explicit offline asset/update/storage design; the web manifest alone does not establish offline support. |

## Evidence and findings

This is an **unfinished audit checkpoint**, transferred at the owner’s request. Read [the handoff](AUDIT_HANDOFF_2026-10-04.md) for the exact goal, verified results, known failures, next actions and portable commands. Do not interpret implemented changes or preliminary scores as completion of all ten rounds.
