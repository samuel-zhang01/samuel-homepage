# Independent product concept visitor review

Review of the 27 product and scientific-utility Core idea scenes authored by another agent. I operated the visible browser interface rather than grading my own components. The source context is recorded in `docs/VISUAL_CONCEPT_PRODUCTS.md`.

## Scope and preserved failed rounds

- All 27 routes: manual Start again → Next step three times, observing each of four captions and the changing scene. Desktop 1466×858 and phone 390×844 completed on compiled `http://127.0.0.1:3210`; all 27 routes at 320×740 completed on compiled 3211, following the coordinated final viewport phase. Screenshot receipts use `.codex/reports/product-concept-{slug}-{width}.png`; ignored screenshots and raw transcripts are local review material.
- Initial dev session: lazy CSS was absent, labels concatenated. Appearance was not graded. A fresh preview restart restored computed `display:grid`; all matrix work then used compiled snapshots.
- Rejected Sketch Pad desktop appearance 9.1 (clarity 9.4): the full-width SVG grew about 500px high and buried the stage/caption controls. The owner constrained the intact 360×160 drawing to at most 240px high. Phone 390 recheck on compiled 3211 passed, compiled 3213 wide recheck passed at 9.4 / 9.4; the drawing measured 540×240px.
- Rejected Note Pad visual direction: its decorative 7px double left rail violated the requested sidebar removal. The owner replaced it with a normal 1px solid frame. Compiled 3211 phone 390 and compiled 3213 desktop rechecks confirmed the 1px solid frame and all four stages.
- Shared player controls initially inherited 32px sizing on desktop. Root repaired specificity to 44px controls and 60px stages. Compiled 3211 phone 390 measured 48.39px controls / 60px stages; compiled 3213 desktop recheck measured 44px controls and tabs / 60px stages.
- Two attempts labelled “390-repaired” accidentally used the older 3210 origin because a review helper had captured the previous base. These were invalidated. Two initial 3211 attempts were also invalidated while the visible first-visit phone guide blocked input. After dismissing Got it, exact stage changes, origin and viewport were confirmed. New helper receives its origin explicitly; final narrow captures check URL and innerWidth both before and after.

- COVERD at 320px: appearance 9.2 / clarity 9.3 rejected: Communication touched its status dot in the narrow two-column card. The owner stacks all six cards at ≤260px scene width and protects status space. Fresh dev 3000 recheck confirmed all four stages and clear separated status rows (9.4 / 9.3); Final compiled 3213 recheck passed at 9.4 / 9.3; Communication and its status dot are separated by 115px, with all six rows retained.

## Journey matrix

Each rating is **clarity / appearance**. These are the independent agent’s judgments of the compact explanation and browser framing, not scores from an external user study. Each accepted result must meet 9.3 in both measures. Desktop and 390 use compiled 3210; 320 uses compiled 3211, with affected repair rechecks explicitly recorded above. The browser matrix is English (UK); four-locale rendering and explicit CN/TW inventory are separate code gates, not a claim of four-locale browser testing for every route.

| Project | Desktop | 390px phone | 320px phone | Observed action and outcome |
|---|---|---|---|---|
| `ultra-convert` | 9.5 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 | Portrait.png settles; the first PNG → WebP rule produces Converted/Portrait.webp while the original remains. |
| `videomate` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 | Example.mkv appears at Rebuild; decoding, stream and timing checks pass at Verify while the collection stays empty; Keep both publishes one checked copy. |
| `orbital-lab` | 9.5 / 9.5 | 9.4 / 9.5 | 9.3 / 9.4 | The 1s curve keeps its shape as the region grows to one, two and three Bohr radii; final cumulative probability is 93.8%, explicitly distinct from an electron trajectory. |
| `desk-note-pad` | 9.4 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 | Date insertion changes page 1; page 2 has its own content; Return restores page 1 and note-1.txt. |
| `desk-sketch-pad` | 9.4 / 9.4 | 9.4 / 9.4 | 9.3 / 9.4 | A second ink stroke appears; Undo removes only that stroke; Export leaves one stroke and PNG ready. |
| `desk-quick-list` | 9.4 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 | The priority mark appears on Review the notes; completion preserves its row; Active removes the finished task and leaves two unfinished tasks. |
| `desk-focus-clock` | 9.4 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | Start, Pause and Continue change timer state; Finish reaches 00:00 and daily tally 1, with a compressed-time note. |
| `desk-pocket-calendar` | 9.4 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 | Selecting another date changes its local note; Return to today restores 11 October and its reminder. |
| `desk-calculator` | 9.4 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 | 12.5 × 4 produces 50; the tape keeps the expression, memory 50 appears, and the final copy status changes. |
| `desk-unit-converter` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 | 20°C → 68°F and the swapped conversion preserve temperature; decimal 1,000 kB → 1 MB stays labelled. |
| `desk-colour-studio` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.4 | Pale text darkens to #11177A; calculated contrast becomes 14.71:1; the saved swatch appears. |
| `coverd-ai` | 9.4 / 9.4 | 9.4 / 9.3 | 9.4 / 9.3 | Six views begin unmarked; the dashboard statement supplies Skills and Experience; the maintenance follow-up adds Trajectory; the recruiter retains the final decision. |
| `growmat` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | Moving job A changes its day before recalculation; Monday and Tuesday change from 117% / 33% to 67% / 83%, with 3 FTE/day capacity and fictional inputs stated. |
| `ocean-depths-finance` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 | A £200 card payment changes cash £2,400 → £2,200 and debt £400 → £200; net worth stays £6,600. A charge £20 → £24 shows +20%; repeated imported rows are skipped. |
| `coverd-yasa` | 9.5 / 9.4 | 9.4 / 9.3 | 9.3 / 9.3 | 09:00 stays occupied; 09:15 progresses from selected to conflict checked to confirmed; this example sends no invitation. |
| `parliamo-italian-learning` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | Recall hides the translation; Reveal shows the booking and an Italian example; Good schedules three days and +4 XP; Review later preserves that schedule. |
| `innovation-models-reflection` | 9.4 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | Opportunist → Enabler → Producer → Advocate moves the highlighted responsibility/resource quadrant; the final choice has a focused owner and negotiated resources. |
| `pc-saft-thermodynamics` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | At 330 K, kAB 0.02 → 0.20 weakens attraction; same-density pressure rises 1.113 → 1.145 MPa against a preserved reference curve. |
| `drug-solubility` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | 298 / 318 / 338 / 358 K raises the amount 72.27 / 144.97 / 282.58 / 562.06 mg/g; final mole fraction is 0.16589, with invented compounds stated. |
| `molecular-recognition` | 9.4 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | Candidate shapes become predicted lines; generated observations add background peaks; final residuals are −42 / +16 / +53 kHz. |
| `cprot-spectroscopy-plotter` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | The wide generated trace narrows to 400 MHz centred on 5,175 MHz; labels appear; the final MATLAB export convention is 600 DPI. |
| `deep-learning-environment-resolver` | 9.5 / 9.3 | 9.4 / 9.3 | 9.3 / 9.3 | The host and Conda route progress to imports and runtime checks; PyTorch MPS and TensorFlow CPU remain separately visible. |
| `gromacs-hpc` | 9.4 / 9.3 | 9.4 / 9.3 | 9.3 / 9.3 | WSL 2 → GPU container → prepared topology produces gmx pdb2gmx; the final status explicitly stops before dynamics. |
| `home-automation-stack` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | A failed pending dump does not replace the last verified backup; the final stage restores into a separate target and marks the example check. |
| `stock-market-engine` | 9.5 / 9.4 | 9.4 / 9.4 | 9.4 / 9.3 | Seeded event counts 1 → 10 → 25 → 50 extend the price path; final price is 90.246, full-day return −9.75% versus original partial-window return −1.96%. |
| `covid-decision-support` | 9.3 / 9.3 | 9.3 / 9.3 | 9.3 / 9.3 | Public information, changing planning questions, a brief and human review progressively mark the completed inputs; the public contribution boundary remains explicit. |
| `coding-series` | 9.5 / 9.4 | 9.4 / 9.4 | 9.3 / 9.3 | Proposal −0.8 from −1.0 at temperature 0.4 has acceptance probability 0.607; draw 0.700 rejects; the final chain repeats −1.0, −1.0 instead of deleting the rejected step. |

All 81 matrix journeys actually operated the four stages; every step’s expected caption was observed. Scene widths were 1008px / 298px / 228px within 1080px / 338px / 268px players, with no child or outer horizontal overflow. Final 320px controls measured at least 44px; stage buttons were 60–70.39px depending on wrapping. Phone screenshots verified the exact URL and innerWidth before and after capture; desktop screenshots matched the current route title and computed 1466px viewport. The 320px layout requires ordinary vertical scrolling; no score assumes the whole project and all stages fit on one phone screen.

## Final freeze

All 27 × 3 = 81 product concept journeys meet 9.3 in both clarity and appearance after the recorded repairs. The final affected rechecks used compiled 3213: desktop 1466×858 for Note Pad, Sketch Pad and shared control geometry; phone 320×740 for COVERD. No product implementation was edited by this reviewer. Source science scene fixes and their separate independent scores are recorded in `docs/VISUAL_CONCEPT_SCIENCE.md` and `docs/VISUAL_CONCEPT_SCIENCE_REVIEW.md`.

The local archive input is `.codex/reports/product-concept-*.png` plus `.codex/reports/product-concept-browser-review.json`. The transcript contains 100 receipts, including repeat checks and six explicitly invalidated attempts: two cached-origin attempts, two phone-guide attempts on compiled 3211, one phone-guide attempt on dev 3000, and one phone-guide attempt on compiled 3213. Invalid attempts are retained with `reviewValid:false` and do not contribute to the matrix. The phone guide was visibly dismissed and the complete stage journey repeated in each affected origin. The final viewport override was reset to normal (1466×858).

QA was subsequently archived and verified outside the checkout. The archive path and SHA-256 manifest are recorded in [the completed tracking file](VISUAL_SHOWCASE_REFINEMENT.md); the original ignored receipt paths above are member names in that archive.
