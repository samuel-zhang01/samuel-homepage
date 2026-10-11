# Decision and deferral experiments — source and review notes

## Source mechanics inspected (11 October 2026)

I inspected the maintained local code and writing before adding browser experiments:

- `IX-MachineLearning/Course Work/Final.md`, the part-one notebook workflow, and `Week 4/lasso.py`: train-only KNN imputation and scaling; OLS, Ridge, LASSO and kernel regression; LASSO sensor selection; the hypothetical £2,500/£3,500 sensor designs; cost-sensitive classifier threshold selection. The named-run figures remain unchanged: 7,674 observations, 6,139/1,535 split, CV RMSE 0.9211 and 0.8286, separately evaluated full-model test RMSE 0.3874. The summary's rounded/different final digits do not justify changing those recorded fixtures.
- `STUDY-RL/week-11-contextual-bandits-ope/project/ope.py`: IPS, SNIPS, Direct, DR and SWITCH-DR; one ridge reward model per arm; DR adds target prediction plus weighted observed-minus-predicted reward; SWITCH uses Direct when the raw importance weight exceeds τ.
- `IX-Safety-CW3/detailed_solution.tex` and the existing causal chapter: backdoor adjustment, collider bias and the assumptions needed for a causal interpretation.
- `IX-Safety-Latex/sections/method.tex` and `IX-Safety-Group/latex/fraud_model_l2d.py`: entropy OR low calibrated confidence; CVaR on the worst ceil(δ×retained-count) losses; a simulated investigator with an assumed base accuracy, not measured professional adjudication. The revised OR rule takes precedence over the earlier AND presentation.

No native repository, original data, assessed text or scientific result fixture was modified. The 24-row browser OPE CSV and 200-row deterministic deferral reconstruction are retained.

## New exploration and interpretive limits

| Demo | New visitor experiment | Observable result | Boundary |
|---|---|---|---|
| Air quality | Turn off CO or benzene signals, change budget, restore/reset | CO outage removes balanced/full designs and selects the benzene-only record; benzene outage makes all three unavailable | Availability checks required inputs; it does not estimate failure-time RMSE or retrain |
| Cyber | Compare balanced 50% attack cohort with 1% attack day; adjust prevalence and threshold | At threshold 0.20: 50% gives 1,250 alerts/80% precision; 1% gives 514 alerts/3.9% precision, despite identical rate functions | Fictional rate functions and 2,000 flows; historical leakage-affected accuracy stays withheld |
| Regularisation | Change four standardised inputs and noise uncertainty; switch LASSO/Ridge; reset | Prediction is Σxβ. LASSO λ0.45 removes the noise coefficient and has zero sensitivity span; Ridge retains a nonzero span | Orthonormal teaching calculation; sensitivity range is explicitly not a confidence interval |
| Causal | Change experience imbalance; compare pooled rates with within-group weighting; toggle collider | Default pooled difference −32pp reverses to the constructed +10pp; collider adjustment suppresses a valid estimate | Constructed 200-person cohort; neither measured effect nor identification proof |
| OPE | Bias both reward predictions; inspect a selected logged decision; reset | +0.30 changes Direct 0.491→0.791 and DR 0.491→0.442; IPS remains 0.582; selected row exposes prediction+correction arithmetic | Probability-clamped sensitivity example; finite logs/overlap still limit correction |
| Deferral | Set review capacity to 20, add ten slots, inspect queue, restore full review | 128 automatic /20 reviewed /52 pending; 30 slots leaves 42 pending. Pending work is never forced back to automation | New browser capacity/priority extension. Resolved-case accuracy excludes pending claims; full-review89.5% remains separately labelled |

All new controls use native labelled inputs/buttons, touch targets and keyboard operation. Small state bars animate only width changes; reduced-motion disables these transitions. Optional source context is collapsed, and the new experiments lead their respective chapters. English UK/US retain regionalisation; both Mandarin editions have explicit new labels, help, dynamic templates, interpretation and empty states.

## Verification in progress

- Dedicated pure helper check: 10 cohort, sensitivity, confounding, probability-bound, review-priority and preservation assertions passed.
- Scoped ESLint passed for both components/dictionaries, helper and test script.
- CSS-module reference gate passed 2,327 references after the new styles.
- Copy inventory reported no missing DecisionDemos/DeferralRisk entries; other agents' active dictionaries prevented a whole-tree pass at the time of the check.
- Whole-tree TypeScript passed once after the first implementation. A repeat later found only concurrent BanditStudio issues (missing optimism/posterior labels and unused t); these were sent to root. This does not claim the final combined tree passed.
- Desktop UK changed-state checks passed: sensor fall-back/unavailable, rare-attack precision, keyboard noise/Ridge changes, within-group comparison, reward-model perturbation/row arithmetic, limited-review/pending counts.
- Phone and locale review is continuing. Shared development overlays from concurrent coverage/bandit dictionary appends temporarily interrupted it; those receipts are retained here as a scope qualification.

## Final owned-batch review (17:55 UTC+1)

The code is frozen after these repairs: native slider accessible names; restored-input wording for unavailable designs; dark capacity heading on white paper; immediate prediction and IPS/Direct/DR readouts near their controls; optional additional inputs/cost assumptions; and explicit “cross-validation” labels to prevent the shared English-US CV→résumé substitution from corrupting scientific labels.

The five journeys were reviewed in UK English at desktop, US English at 320px, and both Mandarin editions in changed states at 390/320px. Mandarin scope covers sensor outage/reset, rare-attack precision, Ridge/noise prediction/reset, within-group comparison, reward-model perturbation/row arithmetic, and limited-review pending cases. These are representative changed-state checks, not every possible combination.

| Journey | Desktop | 390px | 320px | Visitor action and observed result |
|---|---:|---:|---:|---|
| Air quality |9.4|9.3|9.2|CO outage → lean0.9211; benzene outage → no invented replacement score; reset → balanced0.8286|
| Cyber |9.4|9.3|9.2|Rare1% day →514alerts/3.9% precision; threshold0.99 →25alerts/56.0% precision, with misses shown in the matrix|
| Regularisation |9.4|9.2|9.2|Ridge+noise3 → prediction0.490 vs unpenalised0.710; LASSO reset → zero noise sensitivity|
| Causal/OPE |9.4|9.2|9.2|Pooled−32pp → within-group+10pp; modelbias+0.30 → Direct0.791/DR0.442 with IPS0.582 unchanged|
| Deferral |9.4|9.3|9.2|20reviewslots →128automated/20reviewed/52pending; ten more slots →42pending; no unsafe fallback decision|

At320px the reviewed experiment containers have equal client/scroll widths (Air 268/268, Cyber 290/290, regularisation 268/268, causal 268/268, deferral 250/250). Existing wide scientific graphs/log tables remain explicit, keyboard-focusable horizontal panes rather than widening the app. Both buttons and native keyboard Home/End/Arrow changes were exercised. All temporary browser overrides will be reset after root's shared320px review.

Saved screenshots are under ignored `.codex/reports/decision-*.png`; they include the320px US prediction/alert/OPE/capacity journeys and390px Mandarin outage/causal/capacity states. The source/fixture numbers are unchanged.

Final focused checks: 10 meaningful helper assertions; scoped ESLint; scoped diff whitespace; project copy gate 8,358 bilingual entries/45 sources; CSS reference gate 2,338 references. The final whole-tree TypeScript run also passed (session 90887), while root owns combined build/lint/release verification. The earlier concurrent overlay/TypeScript receipts remain above.

## Independent review of root's three interactive journeys

This cross-review used the rendered controls as a newcomer, without changing the components. Actual viewports were1466×854desktop,390×844and320×844. The browser override was reset to1466×854after the final check.

| Journey | Desktop | 390px | 320px | Verified state change |
|---|---:|---:|---:|---|
| Venture budget replay |9.4|9.3|9.2|Save baseline, raise burn60%, run seven months: current−£18,400, saved+£326,000; reserve explicitly remains protected. Saving the stressed plan then returning burn to0% gives current£818,000 versus saved£768,800 at month1, proving the saved burn is retained.|
| Insurance missing checks |9.4|9.3|9.2|Market06 begins1/3 assessed and cannot pin. Load history/wording→3/3, still cannot pin before authority. Confirm authority→review pin, with values69/64/72separate and no aggregate choice. Undo clears added checks and removes the pin.|
| COVERD worked review |9.4|9.3|9.2|Play or manual step exposes six dimensions and applicant statements. A Trajectory follow-up changes the selected quote and reduces gaps to Working preferences. Removing deployment/maintenance wording produces Experience/Domain knowledge gaps. A Working preferences reply at390px reduces the remaining gap to Trajectory.|

No blocking issue was found. Purpose, one starting action, result interpretation and the human decision boundary are understandable in each journey. On phones the insurer panel requires scrolling through the received markets before the inspector; its named “Inspect Market06” and separate completion controls keep the route discoverable. All three retain visible synthetic/worked-example qualifications. COVERD accurately says that this editable literal-match playground does not call the product's AI agents.

COVERD's example export was downloaded and parsed as valid JSON: `example:true`, six review dimensions, five statements and one follow-up question; the added Trajectory answer is present. No real applicant data was entered. Screenshots are saved under `.codex/reports/root-{venture,insurance,coverd}-{desktop,390,320}.png`.

## Independent newcomer review of the decision batch

A separate agent reviewed the rendered demos before consulting the implementation: desktop 1466×857, phone 390×844 and phone 320×844. English UK and US journeys exercised the primary controls, changed calculations and result explanations. The question was whether a visitor could state what I built, why it matters, what to change and what the outcome means. Scores below reflect clarity, discoverability, feedback and the retained System7 presentation; they are qualitative visitor judgments, not scientific performance metrics.

| Journey | Desktop | 390px | 320px | Independently observed outcome |
|---|---:|---:|---:|---|
| Air quality | 9.4 | 9.3 | 9.2 | CO offline selects the lean recorded design, RMSE 0.9211 and £1,000 headroom. Benzene offline leaves no available recorded design, without inventing an error score. |
| Cyber | 9.4 | 9.3 | 9.2 | A 1% attack day gives 514 alerts, 20 true attack alerts and 494 false alarms: 3.9% precision at the unchanged threshold. The synthetic cohort is identified beside the result. |
| Regularisation | 9.4 | 9.2 | 9.1 | Ridge with noise input 3 gives prediction 0.490 versus unpenalised 0.710; its sensitivity span is 0.786. LASSO's removed noise input has zero span. The range is explicitly distinguished from a confidence interval. |
| Causal adjustment | 9.4 | 9.3 | 9.2 | Within-experience comparison changes the constructed pooled −32 percentage points to +10 points and explains the reversal. Graphical adjustment is qualified as a criterion, not proof. |
| Off-policy evaluation | 9.3 | 9.3 | 9.2 | Bias +0.30 gives Direct 0.791 and DR 0.442 while IPS remains 0.582. Selecting L-02 exposes target prediction 0.797 plus correction 0.205 = contribution 1.002. |
| Deferral | 9.4 | 9.3 | 9.3 | Twenty review slots leave 52 claims pending; ten more leave 42. At 30 slots, 141/158 resolved cases are correct (89.2%). Pending claims remain undecided and are excluded explicitly. |

The first OPE review scored 8.8: its shared Try instruction still asked for the causal chapter's experience-group controls after switching chapters. The owner repaired the conditional instruction and What to notice in all locales, then matched the exact L-01 spelling. Fresh desktop and both phone journeys passed after that repair. No other blocking defect remained. The 320px regularisation desk is vertically longer than the 390px view, but the slider, immediate prediction and sensitivity explanation remain readable and operable.

Development hydration briefly discarded the first immediately invoked sensor control after a fresh route navigation; the checked state was inspected and the settled repeat produced the correct result. These checks do not substitute for root's frozen production preview. Changed-state screenshots are in ignored `.codex/reports/interactive/decision-{air,cyber,regularisation,causal,ope,deferral}-result-390.jpg`, with matching 320px phone receipts. All temporary viewport overrides were reset to the normal 1466×857 window.
