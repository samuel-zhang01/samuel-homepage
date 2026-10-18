# Parliamo daily-learning companion

Reviewed 18 October 2026. Source: [Italian Learning Portal, `5fd6fdf259ee00fda07f8fc6501759d6695f19fb`](https://github.com/samuel-zhang01/Italian-Learning-Portal/tree/5fd6fdf259ee00fda07f8fc6501759d6695f19fb). Target starting revision: `6ec54a0265f3b7f42918f7d7ca76c598885a635f`. The user requested a full portfolio refresh and VPS publication. Public code has no declared licence; this update does not change licensing or repository visibility.

The portal helps a learner practise the supplied lessons through original tasks. A review of 47 PDFs/presentations (858 physical pages/slides, with OCR for sparse pages) corrected the legacy plan’s textbook edition and several topic assumptions. The 36 missions select useful outcomes; they do not reproduce every exercise, supply a complete A2 course, complete independent homework, or certify proficiency. Course 3 currently covers supplied revision material. Later syllabus topics await their source lessons. The private source documents are not deployed.

| Claim | Pinned source evidence | Qualification |
| --- | --- | --- |
| 36 original bilingual missions | `app/learning/curriculum.json`, `docs/material-review.json` | 20 foundation, 10 everyday, 6 Course 3 revision; page/slide references retained |
| Daily time and weekday planning | `app/learning/engine.ts` — `schedule`, `dailyMinutes` | Estimated five-minute missions and two-minute reviews; rest-day/overdue carry, remaining budget |
| Recall without inflated scores | `engine.ts`, `portal.tsx` | First attempts survive retries; completion and daily reviews are idempotent |
| Delayed recall | `recordReview` | First review after one day; successes extend to 3, 7, 14 days; miss returns after one day |
| Durable browser progress | `parseProgress`, persistence in `portal.tsx` | Local storage, saved drafts, validated backup import/export, explicit storage failure; no account sync |
| Material additions | `.agents/skills/new-material/SKILL.md`, `scripts/review_materials.py` | Scoped source-review workflow; stable mission IDs; new original EN/IT instruction and checks |
| Public static portal | `vite.static.config.ts`, `main.tsx`, `README.md` | HTTPS on the existing VPS; private archives and legacy database APIs excluded |
| Adversarial student audit | `docs/student-audit.json`, browser scripts, source tests | Simulated student scenarios, not a human user study |

## Portfolio adaptation

`ItalianLearningStudio.tsx` now presents a disposable, deterministic daily-learning example. It uses the first source mission (`say-hello`) and a compact adaptation in `src/lib/parliamoDaily.ts`: compare time budgets with two due reviews, try two greeting recall checks, write a personal introduction, self-check it, and advance simulated review days. It retains the first mistake after correction and requires output before completion. It does not save or import real learner progress, grade open-ended grammar, open private PDFs, or implement the full calendar. The direct website link opens the complete portal.

The concept gallery has four manually navigable stages: notice, recall, use, next-day review. It no longer claims XP or the legacy four-way rating system. Two actual screenshots preserve the source app’s green/cream design; the interactive example uses the host’s existing System 7 controls and typography. Exact media provenance is in `VISUAL_SHOWCASE_SOURCES.md`. English UK/US and reviewed simplified/traditional Mandarin cover the portfolio copy, dynamic states, captions and accessible labels. Italian exercise prompts intentionally remain Italian.

## Stable identities and connections

- Catalogue slug: `parliamo-italian-learning`; graph node: `project:parliamo-italian-learning`; source: `archive:parliamo-italian-learning`; demo: `italian-learning`.
- Existing `products`, `learning-tools`, `local-first` associations remain accurate. The existing independent-project provenance and elementary Italian profile link remain; no employment, education or proficiency claim is added.
- Existing supplementary workbook/document IDs and exact PDF activity URLs remain. They are earlier practice resources, not the new mission curriculum or the private class PDFs.
- Reuse the existing book icon, suite membership, shared graph resolver, lazy demo route and gallery. No duplicate project or graph catalogue.
- Runtime owners: `projects.ts`, `projectStories.ts`, `projectConceptProducts.ts`, `ProjectConceptProducts.tsx`, `ItalianLearningStudio.tsx`, `parliamoDaily.ts`, `projectShowcaseImages.ts`, and their registered copy tables/audit fixtures.

## Verification and next update

Pure checks cover budget boundaries, rest-day carry, Italian accent/apostrophe handling, empty attempts, retained first mistakes, output completion and repeated completion, and the interval sequence. Mandarin render checks include plan, rest day, teaching, retries, output, completion and both review outcomes. Browser checks and actual deployment results belong in the dated `VERIFICATION.md` entry.

Future source additions should use the portal’s repository-scoped `new-material` skill, preserve mission IDs, and rerun source and browser tests before publication. Refresh this entry only when the implemented learning journey or public screenshots change. Deploy the homepage through its existing protected `.github/workflows/deploy-vps.yml`; source-product static publishing is a separate release on the same VPS.
