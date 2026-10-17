# Original showcase image sources

## Parliamo interface additions — 17 October 2026

Two direct Chromium screenshots show the published [Italian Learning Portal at `61625e2`](https://github.com/samuel-zhang01/Italian-Learning-Portal/tree/61625e27bab3d44d0ce4ae97edef1acf2a7f3b3d): its daily study notebook and lesson library. The app ran in an isolated temporary checkout with a fresh local database; only disposable browser-check progress was used. Existing learner history, recordings and course archive files were not accessed for these screenshots.

Both captures are 1440×1050 CSS pixels at device scale 1. The uncropped PNG pixels were encoded as lossless WebP with Sharp; no upscaling, illustration or retouching was applied. The existing System 7 gallery retains full-size inspection and the separate interactive recall example. Six reviewed caption, label and alt-text pairs cover simplified and traditional Chinese; both English locales use the source copy. Exact output hashes and byte limits are in `scripts/fixtures/project-showcase-media.mjs`.

| Output | Bytes |
| --- | --- |
| `parliamo-daily-notebook.webp` | 90,178 |
| `parliamo-lesson-library.webp` | 88,200 |

## Original image pass: scope and handling

This pass adds 18 actual source images for 13 project entries in `src/data/projectShowcaseImages.ts`: air quality, regularisation, cyber detection, safety/reliability, Safe-L2D, causal/OPE, sequential decisions, STUDY-RL, thermodynamics, CPROT, coding practice, GROWMAT and innovation reflection. Their translated labels, captions and alt text are in `projectShowcaseImagesCopy.ts` (54 CN/TW pairs; en-GB/en-US retain normal locale spelling). Source figure lettering remains unchanged. The common gallery offers full-size inspection when reduced-size labels need it.

No cover sheets, fabricated predictions, AI-generated illustrations, interpolated image frames, private records, unpublished instrument traces, thesis media or employer originals were added. Private repositories were inspected as expressly requested by the user; only selected aggregate/synthetic figures and public-compound examples are exported. Private source locations are provenance below, not visitor links. All exported files are lossless WebP; scientific colours and source text are unchanged. Cropping removes page margins or selects an intact individual panel; it does not change measurements, curves, axes or existing redaction.

Original PDFs were visually inspected using the PDF skill and Poppler. The public GROWMAT presentation was inspected as a read-only presentation. Notebook figures were decoded directly from saved PNG outputs, preserving their original pixels. The MATLAB window was extracted directly from the app's `metadata/appScreenshot.png`. The synthetic coursework SVG was rendered from the already-saved figure; its generating Python was read to confirm the split and synthetic inputs.

Repository visibility was checked using `gh repo view --json visibility,url` on 2026-10-11. `IX-Safety-Latex`, `STUDY-RL` and `CPROT-Spec-Fast-Plotter` are public; `IX-MachineLearning`, `Clapeyron.jl-Dev` and `Coding-Practice` are private. Public original links use pinned commits. Private-source images have no private repository URL in the site data.

## Source-specific interpretation

| Project | Exact original and contribution | Interpretation retained in caption |
| --- | --- | --- |
| Air quality | `IX-MachineLearning/Course Work/part 1.ipynb`, cell 22 output 1, LASSO cost–accuracy frontier | Five-fold CV error versus assumed sensor purchase cost. Stars are study design choices, not current vendor quotes or measured annual savings. |
| Regularisation | Same notebook, cell 14 output 0; left Ridge and right LASSO coefficient-path panels | These are actual fitted paths on the coursework sensor data. The red line is the CV-selected penalty. Ridge shrinks; LASSO can remove coefficients. |
| Cyber | `IX-MachineLearning/Course Work/part 2.ipynb`, cell 20 output 0, upper ROC panel | The original split had duplicate-row overlap. This historical comparison cannot establish prospective deployment accuracy. The lower cost panel was rejected for the first gallery because its billion-pound scale hides the useful threshold differences. |
| Safety/reliability | OneDrive `Courses/ML for Safety Critical Decision Making/Course Work/Coursework 2/figures/fig_q2_covariate_shift.svg`, upper-left panel; generating `.py` alongside it | Synthetic `make_regression` run: 4,000 samples, ten features, noise 15, seed 0, split calibration/test at the median of feature 0. This demonstrates changed input distributions; source residual panel still reports 90.4% coverage, so the caption does not claim failure simply from this split. It is an explanatory coursework run, not the unrelated saved CIFAR calibration table. |
| Safe-L2D | `IX-Safety-Latex/figures/coverage_accuracy_tradeoff.pdf`, accuracy panel, commit `00c5099469c98fb6271a1754d6cf565963df898a` | Automation fraction versus combined model/reviewer accuracy. Reviewer replies were simulated. Confidence filtering can outperform the more complex method; no superiority claim is made. |
| Causal/OPE | `STUDY-RL/week-11-contextual-bandits-ope/figs/fig_ope_bias.pdf`, commit `04936cf1cb694873e2857aa9a316ae520ad2c43a` | Mean±std over twelve synthetic insurance-bandit experiments. Logged policy epsilon 0.3, 4,000 logged samples, softmax target, known simulated value. This is the teaching simulator's estimate comparison, not real claims or a causal proof from an operational dataset. |
| Sequential decisions | `STUDY-RL/week-01-mdps-bandits/figs/fig_bernoulli_bakeoff.pdf`, same commit | Ten Bernoulli arms, 2,000 decisions, twenty seeded runs; lower accumulated regret means fewer missed rewards. The separate live browser uses three arms, explicitly stated. |
| STUDY-RL | `STUDY-RL/week-19-dpo-zoo/figs/fig_links.pdf`, same commit; generating `project/make_figures.py` | Actual saved teaching curves for logistic, squared and hinge preference objectives. These are formulas, not the 135M language-model training result. The saved accuracy bake-off was rejected as the hero because overlapping lines and unstable CPO excursions were hard to read. |
| Thermodynamics | `Clapeyron.jl-Dev/example-calculations/Bulk-Properties/--SAFT_eos.ipynb`, cells 28 output 0 and 20 output 0; commit `983d692c4dc2186dfca23e971bb8ad6549508e7e` | Default CO₂/water VLE plot at 323.15 K includes a broken composition axis. Optional methanol diagram compares seven models with public NIST measurements. Its original y-axis typo `K⁻¹` is explicitly identified in the caption; values are temperature in K. Neither figure is presented as a confidential compound result or solid–liquid drug solubility. The original Clapeyron project builds on the MIT-licensed upstream package; public experimental points are attributed to NIST in the notebook. |
| CPROT | `CPROT-Spec-Fast-Plotter/PlotterGUI.mlapp`, ZIP member `metadata/appScreenshot.png`, commit `9c6496d7b3c9f67dad163bf6f289de5e22ed3fd0` | Authentic MATLAB UI, empty graph, plus a focus view of frequency controls. No unpublished spectrum is loaded or substituted. |
| Coding practice | `Coding-Practice/interactive_3d_saw.png`, commit `2cedc409fad3ff0c9e49c4aba85095e4c643c02d`; related `CompChemWorkshops/Julia Calculator/self-avoiding 3d walk.jl` | Actual saved 150-step self-avoiding simulated lattice walk, not a measured molecular structure. |
| GROWMAT | Existing allowlisted `public/GROWMAT Showcase External Highest Quality.pdf`, pp 6 and 8 | Intact screenshots of the original workload manager and Spotfire workload/capacity views. Their existing published blur is preserved exactly. No employer repository, live dashboard or raw workbook was used. Page 7 was considered but rejected because the tiny screen-within-screen and console were less useful than the already-public page 6/8 panels. |
| Innovation | Existing allowlisted `public/projects/innovation/four-models.pdf` | Original saved diagram used for the reflection; only its huge white page margin is removed. The framework describes ownership/resource choices, not measured company performance. |

## Output dimensions and transforms

The path prefix for every output below is `public/projects/project-showcases/`. The exact SHA-256 and maximum byte limit for every new output is maintained in `scripts/fixtures/project-showcase-media.mjs` for the artifact gate. Combined output size is 553,856 bytes; no source upscaling was used. PDF renders preserve vector sharpness at the recorded raster dimensions.

| Output | Intrinsic pixels | Bytes | Transform |
| --- | --- | --- | --- |
| `air-quality-cost-frontier.webp` | 1605×590 | 24,088 | Uncropped source pixels |
| `regularisation-ridge.webp` | 895×590 | 23,410 | Crop x=0, y=0, w=895, h=590 |
| `regularisation-lasso.webp` | 894×590 | 22,158 | Crop x=895, y=0, w=894, h=590 |
| `cyber-roc-comparison.webp` | 789×395 | 21,396 | Crop x=0, y=0, w=789, h=395 |
| `safety-population-shift.webp` | 500×392 | 10,752 | Crop x=0, y=0, w=500, h=392 |
| `deferral-coverage-accuracy.webp` | 696×527 | 17,738 | Crop x=0, y=76, w=696, h=527 |
| `ope-synthetic-comparison.webp` | 1100×677 | 10,598 | Uncropped source pixels |
| `bandit-regret-comparison.webp` | 1100×660 | 27,108 | Uncropped source pixels |
| `preference-objectives.webp` | 1000×500 | 12,120 | Uncropped source pixels |
| `methanol-phase-envelope.webp` | 586×452 | 30,256 | Uncropped source pixels |
| `co2-water-phase-equilibrium.webp` | 599×448 | 25,396 | Uncropped source pixels |
| `cprot-matlab-window.webp` | 1139×570 | 13,264 | Uncropped source pixels |
| `cprot-frequency-controls.webp` | 889×218 | 4,620 | Crop x=250, y=352, w=889, h=218 |
| `growmat-workload-manager.webp` | 687×448 | 52,792 | Crop x=76, y=310, w=687, h=448 |
| `growmat-workload-visualiser.webp` | 687×448 | 91,822 | Crop x=841, y=310, w=687, h=448 |
| `growmat-capacity-forecast.webp` | 710×463 | 94,558 | Crop x=829, y=307, w=710, h=463 |
| `coding-self-avoiding-walk.webp` | 1000×800 | 54,522 | Uncropped source pixels |
| `innovation-four-models.webp` | 819×502 | 17,258 | White-margin crop: x=100, y=1145, w=819, h=502 from 2170×2800 render |

For reproducibility: source slide renders were 1600×900; Safe-L2D was 1400×603; OPE and bandit PDF renders were 1100px wide; preference curves were 1000×500. Innovation was rendered at 2170×2800 and white-margin trimmed. Final crops were visually inspected as source images and again in a contact sheet with ~300px panes. This checks the intended content, not only file decoding.

## Pinned input hashes

| Input | SHA-256 |
| --- | --- |
| IX-MachineLearning part 1 | `52341d2f9d029f0cfccb8283660369da7abc7ab9f939401d1532567741ad1f49` |
| IX-MachineLearning part 2 | `532f4c93fa6bded7e81eb56a9532c0cd2e67605e115059dc3acd79ffa952e6c3` |
| Safe-L2D saved PDF | `cb90bf0992d26e4ad34074c59fa5ef54a4bf52c4beee0cad090810b98a574e93` |
| Coursework shift SVG | `f0dc9a0b9e1d19fe882328819eb5d19a56f0444ce114ab6427241be80445d84f` |
| Coursework shift generating code | `b436566552e8c1d0d59aefcabf8243da29ae25d27d8fe3ff72a261dcaa67decf` |
| OPE PDF | `1f7e49454eaa740997838c073f668ceae11092936df78680b99107d4429ce63d` |
| Bandit PDF | `95a7320fa89ba1abb09f844a77687abd8cb53c9b56cb01d1ce3d367a06dfc316` |
| Preference PDF | `b50f21882adda587e8fd49b33eec081f234bcaba3353e8c831ba3b8d37f964b4` |
| Clapeyron notebook | `92770c74a73222a99891271d709dfcf3ad8f2805260964fdc8d1b01648f9d49b` |
| MATLAB app | `c6b9f623f7d7325c6ec0e3498949a197c1854ef18674a977f7ff8f978c561d19` |
| Self-avoiding walk | `1685fa548849c47d7fc1bd7ee9a5eb96ea0372f4fce9fb372ee4df0ce925d732` |
| GROWMAT public PDF | `dd32da42f53d19a5e27c5c6eff5bddea10b6cc0a2f4307def894e33628762312` |
| Innovation public PDF | `c69b6dd84f701c6b04d57a3657b5111ffd5b701befbe23806b1ca4b417a53fac` |

## Deliberately excluded candidates and limits

- COVID administration and operational spreadsheets contain staff/patient or employer context. No raw cells, working dashboard screenshots or operational figures were exported.
- Molecular-recognition instrument data/structures remain unpublished. The public ISMS record and synthetic browser scene are useful, but neither grants permission to expose unpublished traces.
- No saved solid–liquid drug-solubility figure was located. A methanol or CO₂/water vapour–liquid figure would misdescribe that project, so no solubility gallery entry was created from those plots.
- `IX-Safety-Latex`'s full causal DAG was inspected and rejected: cramped node text is difficult to understand at a narrow pane, and a hypothesised DAG is not an identified causal effect.
- `Stockmarket.jl` was inspected. It runs a toy buying/selling simulation; no saved source image was located. Julia lacked the original Plots dependency, so no replacement chart pretending to be a historical output was added.
- Full GROWMAT slides, report covers and dense multi-panel notebooks were considered and rejected as first images. The final crops keep the existing actual result or UI while reducing empty or unrelated surroundings.

## Verification and review boundary

The complete `check:project-copy` chain and scoped ESLint passed. All 18 decoded RGBA outputs exactly match the selected source pixels after the recorded crop/trim. TypeScript passed after the shared concept modules were supplied. The public artifact gate passed with all 18 new images hash-pinned (204 files in the integrated registry). The initial visual gate rejected the valid same-site GROWMAT PDF source link as “published original absent”; this is recorded for coordinator repair so same-site published PDFs can be verified without replacing them with guessed public URLs. Integration, common-gallery desktop/390/320 checks, artifact-hash gate and independent visitor scoring are performed by the coordinating agent after merge. The image pass does not claim a ≥9.3 score before that independent browser review. Failed candidates above remain recorded rather than being silently removed from the history.
