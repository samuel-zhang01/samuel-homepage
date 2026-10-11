# Interactive product and learning pass

## VideoMate browser lab

The source app was inspected through `VideoMate/README.md`, `docs/recovery-options.md` and its source/design files only. No operator media, private state, file dialogs or native processing jobs were accessed. The browser uses five generated symbolic fixtures, clearly identified in the interface.

Implemented in `VideoMateStudio.tsx`, its CSS module, `copy/videoMateCopy.ts` and the pure `videoMateLab.ts` helper:

- Selected queue and immutable run options; a changed option clears the previous result.
- Manual phase stepping and a timed run with pause, continue and reset. Files enter the new collection after verification and the final publication phase.
- Metadata-only Quick inspection and whole-recording Full inspection; Quick cannot certify file-wide health.
- Container-only remux, lossless preservation of decoded samples, and compatible MP4. The eligible index fixture uses encoded stream copy; damaged-frame remux fails decoding. Encoding never restores absent original content.
- Healthy files normally bypass unnecessary recovery; migration byte-checks healthy videos and companion notes. Converting healthy videos to MP4 is an explicit option.
- Missing-end fixture retains 39 of 60 seconds. Its 35% loss is withheld unless shortening is enabled and the limit permits it. Missing data remains visible after an accepted partial result.
- Migration defaults to exclusion with reported omissions. Unchanged unresolved copies can instead enter the collection or a separate review folder; these remain clearly identified as unresolved.
- System7 controls and canonical icons, concise purpose, optional native details, four-language copy and reduced-motion CSS.

Focused verification on 2026-10-11:

- `scripts/check-videomate-lab.mjs`: Quick/Full, remux vs re-encoding, FFV1/PCM sample preservation, 72 shortening-policy combinations, unresolved destinations, selected-queue snapshots and publication timing passed.
- Focused ESLint, TypeScript and CSS-module checks passed. The static bilingual-copy gate passed. The full rendered locale chain exposed an unrelated changed SchedulingStudio hook-order fixture and was reported to its owner.
- Desktop EN-GB: one selected index candidate remained unpublished at 75% and entered the new collection at 100%; remuxing damaged frames failed decoding; a timed preservation job traversed its phases.
- Desktop EN-US: paused progress remained at 6%, then continued from that position.
- Phone 390×844 EN-GB: Run is visible on entry; manually accepted shorter copy shows the original, retained 39 seconds, absent 21 seconds and review requirement.
- Phone 390×844 zh-TW: unresolved migration to a separate review folder, including translated checks, outcomes and selected controls.
- Phone 390×844 zh-CN: metadata-only inspection of damaged frames reports video unchecked and creates no replacement.

The phone outcome screenshot is stored under ignored `.codex/reports/interactive/videomate-shorter-phone.jpg`. Independent visitor grading is a separate checkpoint owned by the root agent; these checks do not claim native FFmpeg execution or a trained/recovered real file.

## Independent YASA visitor review

Reviewed the live booking playground without scheduling-repository assumptions: **desktop 9.4/10, 390×844 9.2/10, 320×740 9.1/10** for purpose, control feedback and System7 presentation. The opening explains that YASA turns shared availability into a confirmed meeting; the browser example and no-invitation status distinguish this from a real booking.

- Desktop: selected 09:15 with Riley, entered generated visitor details, and confirmed. The confirmation exposes the displayed time, required host, ICS download, reschedule and cancellation.
- 390px: changing the guest timezone to Tokyo offers 19:15 local time; guest details persist while rescheduling. A clean full reschedule changed 09:15 with Riley to 10:15 with Alex, showed “Your time has changed” and explicitly released the original 09:15 appointment.
- 320px: confirmed and cancelled an example booking. The cancellation result, calendar download and return-to-availability action remained readable and wrapped within the window.

One intervening development hot reload reset a reschedule attempt; the clean recheck completed successfully. No reproducible booking defect remained. The screenshot is `.codex/reports/interactive/yasa-reschedule-390.jpg`; no YASA code was changed in this review.

## Source-driven learning controls

Source review covered STUDY-RL Week 01 `project/agent.py`, Week 04 `project/agents.py`, and LLM practical lessons 02/04. The browser retains its generated reward fixtures, seeded replay and fixed-exploration teaching convention. It does not claim that its live LoRA/DPO calculations retrain the recorded language model.

CV review covered the public source workflow in `CV-Keyword-Automator`: structured keyword extraction, normalisation/deduplication and LaTeX escaping. No personal CVs or templates were read. The browser retains an explicitly identified, local 18-term English rule. Course review covered the [original frontend](https://github.com/samuel-zhang01/Demo-Course-Recommender/blob/main/frontend/src/components/CourseRecommender.tsx) and FastAPI module at source revision `f80fa51ccd7f847521fed87dd54c647a989c1c9a`. The read-only clone and metadata are at `/Users/samuel/GitHub/Demo-Course-Recommender`; it was moved out of the homepage checkout. The original random ordering and browser weighted rubric remain distinct.

New interactions:

- CliffWalking: manual or paced single updates, pause/continue, saved Q-learning/SARSA runs and greedy evaluation. Changing settings starts a new run. A failed greedy test now explains why exploratory training can still reach the goal and suggests more training without promising success; algorithm comparisons require equal episode counts.
- LoRA/DPO: ten paced numerical updates, pause/reset and a loss trajectory. LoRA preserves the frozen base; DPO updates the policy logit against a fixed reference. The 32 saved before/after model outputs remain unchanged.
- Bandits: epsilon-greedy, UCB1 and Bernoulli Thompson policies in the single-run console; paced replay, pause/continue and previous-round navigation. A per-arm score display explains the last choice and shows its observed reward and updated estimate. All policies receive the declared browser initial observations. Gaussian UCB uses the known-noise variant; Beta-Bernoulli Thompson is unavailable for Gaussian rewards.
- CV: editing a sentence immediately changes local weighted matching, highlighted terms and newly found/lost matches. Running analysis keeps a previous/current comparison. Highlights describe wording, not verification of new experience or an ATS score.
- Courses: save a ranking, edit interests/weights and inspect rank movement for all six examples. Restoring the snapshot reproduces the original preferences and ranks; the first four are the shortlist.

Verification on 2026-10-11: TypeScript, scoped ESLint, CSS references, static bilingual copy and the original learning mechanics gate passed. `check-interactive-learning.mjs` passed seeded policy score/regret invariants, DPO finite-difference gradients and loss decrease, one-step/batch equivalence, changed CV matching and course snapshot restoration, plus eight new Mandarin render states. The learning locale gate now covers 350 rendered states, including new policy, saved-run and loss-trace states.

Browser journeys passed on desktop: UCB decisions and paced pause; Q-learning/SARSA saved comparisons; LoRA ten-step trace and DPO single update; CV removal of Python/SQL changed 10/18 and 62% to 8/18 and 49%; course category changes moved the sample leader and restored exactly. Phone 390 Mandarin views showed course rank movement and CV live highlight/11-of-18 matching. Phone 320 showed readable Bandit choice scores and the saved Cliff table with horizontal keyboard guidance; no document overflow was observed. Exact Try labels were repaired to match their Mandarin controls.

Development hot reloads during concurrent edits reset several fresh-route interactions. Settled repeats succeeded. Final compiled interaction review is required separately, and independent grades are recorded after cross-review; this implementation check is not a self-awarded visitor grade. Screenshots are in ignored `.codex/reports/interactive/`: `course-rank-movement-390.jpg`, `cv-live-match-390.jpg`, `bandit-decision-320.jpg`, and `cliff-comparison-320.jpg`.

### Independent wording repair

The newcomer review rejected the unexplained SARSA result: 100 episodes could reach the goal during exploratory training while the greedy test looped. The conditional failure explanation now names that distinction, recommends further training and preserves the equal-episode rule for algorithm comparisons. A source reviewer confirmed a further 100 episodes reached the goal for seed 7; the interface does not promise this for other settings.

The CV reviewer also rejected remaining audit-like labels despite the successful live editing flow. Eighteen visible phrases were replaced across the four locales: “evidence checks” became sentence checks, “evidence/proof quality” became sentence clarity, “CV evidence” became Matching CV sentence, and empty/build states now describe running analysis. The method explains my workflow and each term's matching sentence; missing-term prompts request an action, scope and outcome that actually happened. Internal data fields, weighting and numerical results remain unchanged. Focused ESLint, 8,385-copy inventory, 350 locale states and the numerical interaction gate passed after this wording repair. Final independent scores are recorded separately by the reviewer.
