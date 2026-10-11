# Independent science concept review

Reviewer: source-projects agent, independent of the new science concept implementation. Requested threshold: both visitor clarity and visual appeal ≥9.3/10 at desktop,390px and320px. A pass means a new visitor can explain what Samuel built, why the changed state matters, which first action to take and how to read the result. This is a qualitative adversarial review, not a measured user-study score.

## Round1 — rejected development rendering

2026-10-11, localhost3000, fresh Air-Quality Sensor Optimisation overview, actual `innerWidth=1466`. Opened Core idea and inspected the initial state. The new gallery/concept CSS modules did not load: `ProjectVisualShowcase_showcase__kWdLj` computed padding0 and both concept scene classes computed `display:block`. The browser showed concatenated plain text (`Benzene inputOnline`, `CO sensorOnline`) with no styled sensor diagram. Stylesheet links existed for the lazy ProjectDocument chunks, so successful chunk discovery did not establish successful styling.

Clarity8.0/10 and appearance5.0/10: rejected. The intended state text could be parsed with effort, but the visual explanation was absent. Root and the implementation owner were notified immediately. No implementation changes were made by this reviewer. Further scoring is held until the coordinator supplies a restarted development build or fresh compiled rendering; this failed round is retained here.

Screenshot: `.codex/reports/visual-concept-science/round1-air-quality-desktop-unstyled.png`.

## Review method and compiled scope

I reviewed the overview as a visitor who had not read the repositories: identify Samuel's purpose from the short introduction, open **Core idea** when a source-image gallery is present, and use **Next step** three times. I read the initial state and each changed state, then inspected the graphic, labels and interpretation. Every project below completed stages 0→3 at desktop, 390×844 and 320×740. The two phone matrices had `documentElement.scrollWidth === innerWidth`; internal window scrolling was needed to reach some stage explanations, with no outer horizontal overflow.

The initial working development server was restarted after the rejected style failure. Subsequent phone reviews used compiled snapshots 3210–3213. All fifteen desktop journeys were repeated on explicitly supplied compiled origins at 1466×858: fourteen unchanged scenes on 3212, and CV on 3213. Causal's named outcome and Insurance's check-state and responsive repairs were rechecked on 3211/3212. CV's final narrow typography recheck passed on 3213. The raw receipt records four state texts for each journey, viewport dimensions, and the explicit current URL before and after each final-origin journey.

One review-harness error is retained: a REPL helper closed over the old 3210 base even after its top-level variable was changed to 3211. Its two attempted 3211 rechecks were therefore invalid and are marked `invalid-origin` in the raw receipt. They do not establish a defect in 3211. The replacement helper takes origin as an argument and verifies the actual URL before and after reading the scoped project window. Review handles use a unique `visualScience*` prefix.

## Rejected rounds and repairs

| Round | Rejection | Repair and actual recheck |
| --- | --- | --- |
| 1 | Unstyled development sensor scene: clarity 8.0, appearance 5.0. | Fresh server and compiled styles restored the two named sensor states, available-design panel and result cards. Compiled 3212 desktop and 320 rechecks passed. |
| 2 | Causal percentages had no named outcome: clarity 9.0, appearance 9.5. | Owner named **Synthetic success rate**, named the composition stage **Experience mix**, and explicitly described 39 of 100 treated successes versus 71 of 100 controls. Explicit 3211 390 and 3212 desktop/320 rechecks passed. |
| 2 | Insurance's primary 69/64/72 scores had no interpretable scale: clarity 9.1, appearance 9.4. | Owner replaced the invented-looking primary numbers with **Checked / Unassessed**, retaining the three comparison areas and the authority gate. No stronger-match interpretation was invented. |
| 3 | Correctly compiled 3211 Insurance at 390 had oversized **Checked** labels overflowing adjacent cards: clarity 9.3, appearance 8.9. | Owner limited the typography/layout repair to insurance check cards: readable status text and label/status/check rows in narrow panes. Explicit 3212 desktop, 390 and 320 rechecks passed. |
| 4 | CV at 320 broke **Unassessed** into `Unassesse` / `d`: clarity 9.3, appearance 9.1. | Owner reduced only narrow CV status text to the normal interface size, retaining both named metrics. Explicit 3213 desktop/320 rechecks passed. The final status is one line at 13px, height 18.20px, within the 98.5px text box. |
| Shared controls | Coordinator found 32px controls in the original compiled player. | The repaired shared control variable and stage specificity produce 48.39px player buttons and 60–70.39px stage buttons in the final 390 Insurance scene. This reviewer measured the actual rectangles, exceeding the requested 44px minimum. |

Failed captures are retained as `round1-air-quality-desktop-unstyled.png`, `round2-causal-390-old3210.png`, `round2-insurance-390-old3210.png`, `round3-insurance-390-status-overflow.png`, and `round4-cv-320-status-wrap.png`. The old-origin recheck is documented as a process failure, not silently discarded.

## What the visitor actually changes

| Project slug | Observed four-stage journey and interpretation |
| --- | --- |
| `study-rl` | A risky move hits the cliff for −100; learning rate 0.1 changes the action value from 0 to −10. A nine-move detour earns −9. The caption distinguishes one worked update from learning a policy through repeated trials. |
| `sequential-decisions-lab` | Six binary observations initially favour B. UCB adds a separately coloured exploration bonus; B is selected, then a zero reward changes its mean to 2/3 and the next choice to A. Upper-bound scores are not displayed as probabilities. |
| `microrobot-vision` | The same microscope image leads to orientation and a saved depth-response map, then a real model-size comparison: 21.4M versus 1.5M parameters, 7.0% relative size and RMSE +0.0069. The map's independent colour scaling is stated. |
| `trustworthy-mri-reconstruction` | A saved reference leads to the illustration of 4/16 measurement lines, the saved reconstruction, then paired input/reconstruction error maps on a shared 0–0.15 scale. The scene makes no new model prediction. |
| `neural-cfd-surrogates` | Saved GNN fields progress through a 20-frame rollout; the visitor compares frames 1 and 20 within the same sequence. Individual colour scaling is stated, so the time comparison is not presented as an error score. |
| `air-quality-sensor-optimisation` | Two signals give RMSE 0.8286 at a hypothetical £3,500 cost; losing CO falls back to benzene-only, RMSE 0.9211 at £2,500; restoring it recovers the original design. Losing benzene gives no available prediction and dashes, not a fabricated score. |
| `cost-sensitive-cyber-detection` | Attack prevalence drops to 1% in 2,000 teaching flows, then threshold rises. At 0.99 the scene explicitly shows 14 caught attacks, six misses, eleven false alerts, 1,969 quiet flows, 25 alerts and 56% attacks among alerts. It separates these calculations from the contaminated original evaluation split. |
| `regularisation-lab` | Penalties shrink signed coefficients; LASSO at λ=0.45 removes the noise input. Changing that input from 0 to 3 leaves the prediction 0.830, while the unpenalised comparison becomes 0.710. This is exact orthonormal teaching arithmetic, separate from fitted source models. |
| `safety-critical-ai` | A fixed ±0.90 interval initially covers 36/40 generated residuals. Moving the population without widening the interval eventually leaves 0/40 covered at +2.00. A named residual axis and separate covered/outside marks explain what failed. |
| `safe-learning-to-defer` | An OR uncertainty gate sends 72 of 200 example claims to review and automates 128. Completing twenty reviews leaves 52 pending; ten more review slots leave 42 pending. Review capacity changes the queue, while the gate stays fixed. |
| `causal-ope-lab` | The constructed cohort moves from pooled 39% versus 71% success (−32 points), through unequal experience mixes and within-group comparisons, to equal-weight 60% versus 50% (+10 points). No measured treatment effect is claimed. |
| `ai-venture-reasoning` | A fictional £1.2M plan protects a £180k reserve, funds seven months and then increases burn by 60%. Available cash reaches −£18,400 without spending the protected reserve. The graphic explains budget feasibility, not market demand. |
| `insurance-lead-matching` | Trading is checked first; lead history and policy wording move from unassessed to checked. Verified authority changes the result to ready for broker review. The scene explicitly leaves insurer choice to the broker. |
| `cv-keyword-automator` | Python/SQL/Cloud requirements are compared with a concrete Python-and-SQL sentence. Two of three terms match; Cloud remains unassessed and needs a real example. The small draft includes the two supported keywords, with no browser model call. |
| `course-recommender-audit` | Six mock courses are filtered to two, then the original prototype order is contrasted with a declared browser rubric: category35/level25/time15/budget15/rating10. Result scores99.8 and91.9 have a named rule rather than an unexplained ranking. |

## Interaction and language checks

On the compiled STUDY-RL phone scene, **Enter** on Start again reset reward/action value; **Space** on the risky-move stage changed reward to −100. Play changed to Pause; Pause restored Play without changing the selected state. A subsequent automatic run reached the final nine-move detour and stopped, with Next step disabled. A wait selector expired before the final state was observed; the next scoped DOM read confirmed the final pressed stage and stopped playback. This timing receipt is not treated as a product failure.

Compiled 3213 locale spots covered all four causal stages in Simplified Chinese, all four insurance stages in Traditional Chinese, and the exact regularization result in US English. The named causal success rate, explicit initial counts, broker authority result and technical values remained readable and correctly localized. The broader four-locale scene inventory is covered by the maintained render/copy gates; this browser review does not claim to manually visit every locale/state combination.

At320 the STUDY-RL Goal label is very small, but its DOM text bounds (right271.28) fit the destination cell (right273); it is not clipped. Saved microscope and MRI comparisons are necessarily small at this width; the source gallery's detail view remains the route for inspecting original pixels. The partially scrolled top action strip on phones is ordinary static content beneath the fixed titlebar: measured nav top41, content top100, scrollTop59, and `position:static`. No middle control was obstructed. These are limits of the narrow presentation, not hidden claims of identical desktop legibility.

## Capture receipt

Ignored review directory: `.codex/reports/visual-concept-science/`. `journeys.json` preserves initial, rejected, invalid-origin and corrected state receipts. Successful representative captures use `SLUG-desktop.png`, `SLUG-390.png` and `SLUG-320.png`; Mandarin/US spots use locale suffixes. Final ratings below use the repaired rendering only and retain both separate criteria; they are reviewer judgments, not sampled visitor measurements.

## Final 45-journey ratings

Each cell is **clarity / appearance**, out of ten. All 45 repaired project/viewport journeys satisfy both requested thresholds of 9.3. Each journey included all four states, not just the opening screenshot. The matrix uses 390×844 and 320×740 phone viewports. Final desktop repeats used 1466×858. Earlier successful desktop receipts at 1466×905 are also retained.

| Project slug | Desktop | 390px phone | 320px phone |
| --- | --- | --- | --- |
| `study-rl` | 9.5 / 9.4 | 9.4 / 9.3 | 9.4 / 9.3 |
| `sequential-decisions-lab` | 9.5 / 9.5 | 9.4 / 9.4 | 9.3 / 9.3 |
| `microrobot-vision` | 9.5 / 9.6 | 9.4 / 9.5 | 9.4 / 9.3 |
| `trustworthy-mri-reconstruction` | 9.5 / 9.5 | 9.4 / 9.4 | 9.3 / 9.3 |
| `neural-cfd-surrogates` | 9.4 / 9.5 | 9.4 / 9.4 | 9.3 / 9.3 |
| `air-quality-sensor-optimisation` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 |
| `cost-sensitive-cyber-detection` | 9.5 / 9.4 | 9.4 / 9.3 | 9.4 / 9.3 |
| `regularisation-lab` | 9.5 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 |
| `safety-critical-ai` | 9.5 / 9.4 | 9.5 / 9.4 | 9.4 / 9.3 |
| `safe-learning-to-defer` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 |
| `causal-ope-lab` | 9.4 / 9.5 | 9.4 / 9.4 | 9.4 / 9.4 |
| `ai-venture-reasoning` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 |
| `insurance-lead-matching` | 9.4 / 9.4 | 9.4 / 9.4 | 9.4 / 9.4 |
| `cv-keyword-automator` | 9.4 / 9.4 | 9.4 / 9.4 | 9.4 / 9.4 |
| `course-recommender-audit` | 9.4 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 |

The final 320 CV player controls measure 44px high; stage controls measure 70.39–88.59px. All source and UI files remained frozen during these final reviews. This reviewer changed only this receipt after reporting defects to the implementation owner. The viewport override was reset; the browser returned to 1466×858.

QA was subsequently archived and verified outside the checkout. The archive path and SHA-256 manifest are recorded in [the completed tracking file](VISUAL_SHOWCASE_REFINEMENT.md); the original ignored receipt paths above are member names in that archive.
