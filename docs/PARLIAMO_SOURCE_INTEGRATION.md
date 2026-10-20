# Parliamo academy and daily-learning companion

Reviewed 20 October 2026. Source: [Italian Learning Portal](https://github.com/samuel-zhang01/Italian-Learning-Portal), deployed academy working snapshot over public base [`5fd6fdf259ee00fda07f8fc6501759d6695f19fb`](https://github.com/samuel-zhang01/Italian-Learning-Portal/tree/5fd6fdf259ee00fda07f8fc6501759d6695f19fb). The academy additions were uncommitted in the source checkout when reviewed: that base revision alone does **not** identify the expanded course. The exact principal source hashes below and the deployed JavaScript hash identify the reviewed snapshot. This homepage update does not publish source changes, alter repository visibility or add a licence. The repository remains public with no declared source licence.

Target starting revision: `797f9f8efcb4aef625785e19adbcc514aedd70ad`. Scope: refresh the existing portfolio project and publish through its protected VPS workflow. The independently hosted [learning portal](https://italian.samuelzhang.co.uk) was already deployed and verified before this homepage integration.

Current presentation, 20 October 2026: the owner's subsequent live-website policy makes the [complete learning portal](https://italian.samuelzhang.co.uk) the sole public demo destination, with one prominent black launch button. Legacy `view=demo` addresses open the project overview; screenshots, source links, graph identities and supplementary PDFs remain available. Application revision `5762f506adabb489ea9a11185319d2bdd2c81f2b` deployed this change through [workflow `39419253862`](https://github.com/samuel-zhang01/samuel-homepage/actions/runs/39419253862). The [live-website verification record](VERIFICATION.md#live-websites-as-the-sole-demo-destination--20-october-2026) records public acceptance and retained failures. Adaptation details below describe the earlier implementation and retained source code, not an additional current visitor action.

## Contribution and evidence

Parliamo turns supplied Italian class topics into original English–Italian practice for a learner around mid-A1. The academy adds explicit grammar teaching, worked examples, vocabulary and guided study plans around the existing 36 short missions. It distinguishes help used during practice from unassisted recall, while retaining browser-local drafts and progress. The portfolio explains these choices through original interface screenshots and a direct launch of the complete learning portal.

| Public claim | Source implementation or observed evidence | Qualification |
| --- | --- | --- |
| 36 stable core missions | `app/learning/curriculum.json`, `engine.ts` | Existing mission IDs and version-1 progress are retained |
| 28 grammar units and 224 controlled exercises | `grammar.json`, `academy.tsx` | 25 core A1 units and 3 marked stretch units; each has 4 teaching sections, 3 worked examples, 6 vocabulary entries and 8 exercises |
| Three programmes: intensive 14, supported 28, repair 10 study days | `grammar.json`, `selectProgramme`, `programmeDayReady` | A study day can span sittings; required units and core mission must be complete; changing programme restarts its checklist while preserving learning records |
| Daily choices from 5 to 60 minutes | `study.ts` — `sessionLayout`, `dailyRecipe` | Estimated time blocks, not measured time-to-proficiency; active sessions retain their original duration |
| Hints and corrections remain assisted | `academy-engine.ts` — `checkGrammarAnswer`, `grammarScore` | First-attempt evidence is immutable; a later blind recall can become independent; exact matching uses authored alternatives |
| Page companions for 48 sources / 936 physical pages | `companion.json`, `docs/source-coverage.json` | 730 practice cards and 206 reference cards; repeated sources reuse 113 original practice patterns, not 936 unique exercises |
| Personal word bank and review | `practice-tools.tsx`, `saveWord`, `reviewWord` | Search, saved examples and self-rated recall with 1/3/7-day intervals; ratings do not certify mastery |
| Selected grammar and tense diagnostics | `assessmentItems`, `answerAssessment` | Two 12-question checks preserve first submitted answers; they are preparation guidance, not an A2 certificate or a speaking/listening placement test |
| Gentle gamification | `study.ts` — `learningRewards`; `academyXP` | Idempotent activity credit, levels and badges; no penalty for needing help or missing a day |
| Browser-local learning records and backup | `portal.tsx`, `parseProgress`, `validateAcademy` | No account sync; validated import preview accepts up to 8 MB; open writing and companion responses are self-assessed |
| Public course deployment | Source `docs/deployment-2026-10-20.json` and eight public browser check groups | Only compiled static assets are published; source materials, learner databases and legacy APIs remain private |

Internal student, lecturer and interface acceptance reviews met the requested threshold, but they are not human learner studies or external certification. The source's detailed audit records limitations rather than asserting measured learning gains. Private class PDFs, slide images and completed independent homework are not portfolio assets.

## Snapshot identity

| Source file | SHA-256 |
| --- | --- |
| `app/learning/grammar.json` | `610582f95ede24f2cc6d3da63fb4f2159dc57ec706f7d83487ac16981f78edf8` |
| `app/learning/companion.json` | `fc1c02b727321f68e1ce24b5161e7c2ce8be9c9e4e6b49d81d475feb01875e2b` |
| `app/learning/enrichment.json` | `cc344c5745e6b40bae1cc513cabe968abd09f946129818e6820a6bfde9f13be7` |
| `app/learning/study.ts` | `fe21620db3a5df04879c356f974ff9b99d099eed8fdab24e9c1e9a4d3988c2c3` |
| `app/learning/academy-engine.ts` | `181247ca19b2a28c9495aef874a99de74756580248ad9002c2b789f0e0573569` |

Deployed course JavaScript: `index-CY15MBCK.js`, SHA-256 `41018cd67ab57f4405915e3de0d0d71b5679ab046934e90267441ac051f969c7`. The complete source-file hash manifest is retained with private task evidence, not shipped as application content.

## Historical portfolio adaptation

`ItalianLearningStudio.tsx` keeps the existing greeting mission and simulated daily review. Its added academy controls compare 30/45/60-minute recipes for the three programme samples using a compact adaptation of the source planner. A bounded grammar exercise exposes the difference between a first attempt, a correction with help and independent recall on a later simulated day. Practice lives only in this demo window; it neither imports nor modifies a learner's real portal history. The full course, word bank and page companions are reached through the separately labelled live-site link.

The portfolio does not embed the full 224-exercise catalogue or copy the private course materials. Original screenshots retain Parliamo's green/cream interface; the interactive adaptation retains the homepage's System 7 controls, typography, keyboard semantics and window navigation. Captures use synthetic learner state. Exact media hashes, sizes and transforms are recorded in [the media provenance record](VISUAL_SHOWCASE_SOURCES.md). English UK/US and reviewed simplified/traditional Mandarin cover narrative, dynamic states, gallery descriptions and accessible labels. Italian exercise prompts remain in the target language.

## Stable identities and relationships

- Catalogue: `parliamo-italian-learning`; graph: `project:parliamo-italian-learning`; source: `archive:parliamo-italian-learning`; demo: `italian-learning`.
- Keep the existing `products`, `learning-tools` and `local-first` associations, independent `personal-projects` provenance and elementary Italian profile link. No new employment, qualification or proficiency claim is introduced.
- Keep `italian-practice` and `italian-reading`, with their exact PDF activity URLs. These earlier downloadable workbooks are supplementary practice, separate from the expanded curriculum and private lesson files.
- Reuse the canonical book icon, suite membership, shared graph builder, lazy demo route, source links and gallery. No duplicate project, graph data model or runtime registry is added.
- Owning files: `src/data/projects.ts`, `src/components/projects/projectStories.ts`, `src/data/projectConceptProducts.ts`, `src/components/projects/ProjectConceptProducts.tsx`, `ItalianLearningStudio.tsx`, its CSS module, `src/lib/parliamoDaily.ts`, `src/data/projectShowcaseImages.ts`, registered copy tables and their maintained audit/media fixtures.

## Verification and later updates

Meaningful checks cover programme allocation totals and capacity limits, grammar hints/corrections/first-attempt retention, later recall, reset, and the retained greeting/delayed-review journey. Browser acceptance covers the compiled visitor flow, gallery and image inspection, keyboard actions, all four locales, desktop and narrow windows, source/workbook opening and the stable graph route. Actual scope and the exact released homepage revision belong in [VERIFICATION.md](VERIFICATION.md); do not infer successful deployment from this integration record alone.

Homepage revision `61a29961bec1b0c90bd3e96eb02531947f9aea00` was published by successful [protected workflow `39414136282`](https://github.com/samuel-zhang01/samuel-homepage/actions/runs/39414136282) on 20 October 2026. The [release verification record](VERIFICATION.md#parliamo-academy-refresh--20-october-2026) records public browser coverage, the retained transient resource failure and successful recheck, exact served-media comparisons and the verified evidence archive.

Future source additions should use the portal's repository-scoped `new-material` workflow, preserve stable mission IDs and progress, and verify the original app before refreshing affected portfolio examples and media. Compare against the source hashes above until the academy snapshot receives its own source commit. Deploy the homepage through `.github/workflows/deploy-vps.yml`; publishing the original learning app remains a separate release.
