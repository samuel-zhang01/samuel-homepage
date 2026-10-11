# Scientific demo interaction refinement

11 October 2026. This pass uses the original project implementations and existing public exports. It adds ways to compare saved results and inspect actual teaching calculations. No model is retrained or invoked in the browser, no raw MRI/microscopy dataset is published, and no confidential thesis content is added.

## MRI: inspect the reconstruction, not just a report figure

Checked `IX-Medical-Imaging/src/run_all_experiments.py` lines 706–737 and the existing `recorded-reconstruction.webp` (2200×948). The source places the full reference, zero-filled 4×/8× inputs and reconstructions in a five-panel row; its absolute-error row uses a common `hot` scale 0–0.15. The upper grayscale panels each retain their original display scaling. The source figure gives per-example PSNR 27.0→29.6 dB at 4× and 25.8→27.1 dB at 8×. These differ from the reported 236-slice aggregate.

The new saved-image viewer uses exact CSS windows onto this unchanged public figure. A keyboard-controlled divider reveals reference/result, measurement buttons select 4×/8×, and retained-measurement/reconstruction buttons switch the actual saved panel. A separate view shows both absolute-error maps with the common scale and explains brightness. Full reference/result shortcuts are equivalent to moving the divider to its endpoint. The original full figure and report remain available in a disclosure/link. Pixel windows are 420×420 at top y88/error y518; reference x7, 4× input x448/result x889, 8× input x1331/result x1773.

This is comparison of saved source images, not new prediction, new scoring or a clinical tool. Browser inspection verified the cardiac structures and error panels align with the source figure.

## CFD: compare a changing wake

Checked the original MeshGraphNet notebook architecture, existing 20-frame GNN predictions/30-frame simulation export and the reviewed FNO/U-Net outputs. MeshGraphNet feeds predicted fields into later predictions. The two saved sequences begin from different states and every field/frame was independently colour-scaled; neither time comparison nor visual comparison across sequences is an error metric.

Removed repeated opening paragraphs/titles before the real fields. One action now pins the first saved frame and selects the final saved frame in the same sequence. Existing explicit play/pause, frame steps, channel choices, speed selection and manual pinning remain. The comparison identifies its saved-frame offset and retains the colour/state limitation near the images.

The optional error-propagation exercise now traces the actual recurrence `e[t+1]=g*e[t]+0.01`, with explicit play/pause, advance-one-prediction and complete-curve controls. The current step/error and moving curve endpoint agree. Resetting the input error leaves every predicted step at 0.01; gain 1.02 produces 0.2430 after 20 steps. This is a teaching recurrence, not a measured CFD error sequence.

## Microscopy: one image, two targets; size against quality

Checked `IX-DeepLearning/Course Work/Report/DeepLearning_Report.tex`, including architecture/classification/regression tables and saved ResNet34 Grad-CAM exports. Default microscopy now places the real input and adjustable overlay together, including on a phone; the standalone heatmap is optional. A one-action comparison uses the same saved input for pose/depth responses. Heatmap blend changes the actual image opacity. Positive responses are individually normalised and are not confidence or a numerical depth prediction.

The benchmark has a compact-model action and a selectable reference. It calculates parameter-count ratio and pose percentage-point/depth-RMSE differences directly from the saved table. MobileNet versus ResNet34 gives 7.5% of pose-model parameters and −1.00 percentage point accuracy; the depth heads give 7.0% of parameters and +0.0069 normalised-depth error. Task-specific parameter values are source-backed: SimpleCNN 4.2M/4.1M, ResNet18 11.2M/11.3M, ResNet34 21.3M/21.4M, MobileNet 1.6M/1.5M, ViT 85.4M/85.6M (pose/depth). This repairs the earlier generic pose-size field in depth mode while preserving every existing accuracy/RMSE fixture. Parameter count is model size, not measured device speed.

The random image split/test-monitored epoch limitation remains in the optional interpretation. The existing sequence-split exercise keeps equal frame counts while showing six overlapping source recordings versus three completely held-out recordings. Existing architecture-stage controls retain actual tensor/parameter records; this pass does not replace their source diagrams.

## Reliability: keep the interval and move the population

Checked the existing coursework/source records in `IX-Safety-CW3/ELEC70122_HW3_Solution_Detailed.tex` and the actual `shiftedCoverage` implementation. Saved calibration and conformal tables remain unchanged and are separate from the generated residual experiment.

The generated shift exercise now has explicit sweep/pause/manual-step controls and a saved comparison. Its 40 residuals move through an unchanged calibrated interval, with numerical axis labels, covered circles and outside crosses. At 90% requested coverage the radius remains 0.90; shifting from 0 to 1 changes 36/40 covered to 18/40, and shift 2 leaves 0/40. Changing requested coverage recalibrates the radius and the comparison explicitly says so. The formula is available in a disclosure. No new coursework/model-performance claim is inferred from the generated batch.

Both new animation clocks start only after an explicit action, stop for inactive/hidden demos and honour reduced-motion settings. Manual stepping remains available independently. Live announcements are suppressed during automatic motion and restored when paused.

## Validation and visitor journeys

- `node scripts/check-scientific-experiments.mjs`: independent geometric-series rollout result, fresh-input reset, authentic pose/depth model ratios/units, fixed-radius coverage counts and boundary cases passed.
- Scoped ESLint and TypeScript passed.
- `node scripts/check-project-copy.mjs`: all current registered bilingual copy passed (including accessible labels and the new helper boundary).
- `node scripts/check-project-css-modules.mjs`: all current referenced classes resolved.
- `node scripts/check-mri-localisation.mjs`: existing locale chains plus 36 new rendered Mandarin model-comparison, partial-trace and saved-shift cases passed. MRI image/error states include the new helper.
- Desktop: MRI divider keyboard 51%, 4×→8×, retained-only and common-scale error panels; CFD first/final frame 0/19, play advanced then pause, manual rollout step 1 and paused trace step 18, reset error 0.01; microscope same-input comparison/blend 0%, compact pose 7.5%/−1pp and depth +0.0069; reliability step 0.25 saved baseline 36/current 33, explicit sweep paused at 0.80 current 22 with radius 0.90.

- 390×844: saved MRI full-result shortcut and keyboard divider, 8× common-scale error pair (viewer width/scrollWidth 312/312); CFD first/final then one-frame-left comparison; microscope input/overlay pair at 100% blend and real depth benchmark (1.5M/21.4M, 7.0% relative size); shift stepped 0→1, 36→18 covered with radius 0.90.
- 320×844: Taiwan Mandarin MRI 8× error comparison (viewer width/scrollWidth 242/242), English CFD comparison and manual rollout step 1, same-input microscope pose/depth pair with source labels, safety manual step/save comparison 33/40. Native buttons, labels and images remain contained. Full benchmark tables and the 40-point residual chart intentionally pan inside their own marked regions; the phone window does not need horizontal scrolling.

| Project | Desktop self-review | 390 phone | 320 phone | Visitor can explain |
| --- | --- | --- | --- | --- |
| MRI | 9.4 | 9.3 | 9.2 | I recovered heart structure from fewer measurements; drag/compare the actual slice and inspect remaining errors. |
| CFD | 9.3 | 9.2 | 9.1 | I predicted a changing cylinder wake; compare saved frames and see how feedback can amplify a small error. |
| Microscopy | 9.4 | 9.3 | 9.2 | I estimated tilt/depth from microscope images; compare task responses and the real small-model tradeoff. |
| Reliability | 9.2 | 9.1 | 9.1 | I checked confidence and interval coverage; keep calibration fixed and see changing cases leave the interval. |

The independent adversarial reviewer supplies the release grade. These are interface/implementation checks, not a claim of prospective research validation. Viewport restored to desktop 1466×854 after review.
