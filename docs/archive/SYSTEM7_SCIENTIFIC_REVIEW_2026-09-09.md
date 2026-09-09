# Scientific demo visual review — 9 September 2026

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

This review used a dedicated Edge CUA tab on the local development server at `http://127.0.0.1:5174`. Desktop captures use the browser's approximately 1466 × 854 viewport; mobile captures use 390 × 844. The viewport override was reset after testing. This is scoped interaction and visual evidence, not a production deployment review.

## Actual browser coverage

- **Microscopy:** all four project views (architecture, microscopy/Grad-CAM, visual benchmark, sequence split). Inspected SimpleCNN and ResNet34, switched to depth regression, selected a residual stage, and exercised auto-rotate/pause. Compared pose/depth maps for the same sample 3 with the shared blend slider. Verified the sequence split retains 12/12 frames while reducing shared sequences to 0/6 with three held out.
- **CFD architecture:** all four FNO designs, manual Fourier stages and play/pause, diagram/table modes, MeshGraphNet processor 10, and a U-Net skip selection. Reviewed the final FNO captions and GNN equation spacing visually.
- **CFD results:** velocity playback, a pinned frame 1 versus frame 20 comparison, simulation selection clearing the reference, saved residual-FNO forecast selection, and the recorded benchmark. The ordinal offset is +19; prediction and simulation remain distinct sequences with different starting states.
- **Rollout experiment:** switched from feedback to resetting each step. The final error changes from 0.2430 to 0.0100 at 20 steps and gain 1.02. Revisited the corrected Taiwan Mandarin equation at mobile width.
- **Reliability:** switched to the recorded After calibration state and selected 95% target coverage. The observed coverage is 95.75% and interval width is 57.39. The NLL readout remains 0.547561; the explanation preserves its slight deterioration despite marginal ECE/Brier improvements.
- **Model lineage:** reached Compare projects after the root library-scroll correction, then inspected Development with a CFD filter, Parameter scale, and Design guide. The logarithmic parameter plot and comparison table remained readable.
- **Mandarin mobile:** Simplified Chinese microscopy architecture and same-input comparison; Taiwan Mandarin FNO architecture, vertical velocity with pinned reference, and rollout reset. Both project documents reported `documentElement.scrollWidth === innerWidth === 390`. Dense architecture canvases/tables intentionally support horizontal scrolling within their own regions.
- The browser's latest warning/error log was empty. Some development hot reloads discarded styles or view state; affected captures were replaced after a full reload.

## Corrections made during this review

- Replaced blue/dark microscopy identity, selected-stage and canvas surfaces with paper, gray grid/axes, black labels and soft semantic tensor colours. Selected table rows now use neutral gray with a thin black outline. Tensor geometry and animation are preserved.
- Increased tensor-stage spacing and label width to prevent collisions. Added a translated horizontal-scroll hint and keyboard-focusable canvas region for narrow screens.
- Separated FNO captions from muted diagram groups, centred their labels, enlarged mobile SVG text, and added sufficient vertical space. Separated GNN residual formulas from numeric dimension readouts.
- Changed the illustrative scientific scene mattes to paper while retaining meaningful physical colour maps. Adjusted the reliability plot's left margin and legend so labels do not collide with ticks or lines.
- Replaced the lineage heading's oversized Georgia type with the shared System 7 UI font.
- Translated two missed recorded-metric labels, corrected the Mandarin INPUT label, and moved the rollout reset explanation out of TeX into translated prose. The mobile equation is now fully visible.
- Corrected the neural-CFD project detail and its CN/TW counterparts: saved GNN frames show horizontal velocity, vertical velocity and pressure, rather than error views.

No simulation, architecture parameter count, recorded metric, source image or numerical experiment was changed by these visual corrections.

## Useful screenshots

The files are local, temporary review artifacts under `/tmp/scientific-browser-qa/`; they are not public site assets. Older captures without a `fixed` suffix may document an intermediate issue. Use the following reviewed captures:

| Capture | What it shows |
| --- | --- |
| `microscopy-architecture-desktop-fixed.png` | Paper tensor canvas and separated stage labels |
| `microscopy-same-input-comparison.png` | Shared original with pose/depth maps |
| `microscopy-sequence-split.png` | Complete-sequence holdout |
| `cfd-fno-labels-fixed.png` | Readable desktop Fourier diagram captions |
| `cfd-gnn-equation-spacing-fixed.png` | GNN equations separated from dimension labels |
| `cfd-vertical-velocity-reference.png` | Same-sequence frame comparison |
| `reliability-calibration-labels-fixed.png` | Corrected calibration chart margins and legend |
| `reliability-95-percent-coverage.png` | Selected coverage and recorded results |
| `microscopy-cn-mobile-comparison.png` | Full-width Chinese microscope comparison |
| `microscopy-cn-mobile-architecture.png` | Paper tensor canvas at mobile width |
| `cfd-tw-mobile-fno-fixed.png` | Enlarged Taiwan Mandarin Fourier labels |
| `cfd-tw-mobile-vertical-velocity.png` | Mobile frame 1/20 comparison |
| `cfd-tw-mobile-rollout-reset-fixed.png` | Fully visible equation and translated explanation |
| `model-lineage-development-cfd.png` | Filtered experiment milestones |
| `model-lineage-parameter-scale.png` | Logarithmic architecture-size comparison |
| `model-lineage-design-guide.png` | Paper design table and final System 7 heading |

The microscopy mobile architecture capture predates the new scroll hint, and the desktop FNO caption capture predates the additional mobile text spacing. Their geometry and contrast remain representative; the final mobile Fourier capture includes the later spacing correction.

## Scoped verification

Final runs passed:

- `node scripts/check-scientific-media.mjs`: 17 groups, including 180 exact saved images, complete changing flow sequences, interaction state, both Mandarin editions and unchanged architecture counts.
- `node scripts/check-source-experiments.mjs`: 8 numerical/control groups.
- `node scripts/check-project-copy.mjs`: 7,364 registered bilingual entries at this run.
- `node scripts/check-math-equations.mjs`: 345 authored/static and dynamic-template checks.
- `node scripts/check-project-css-modules.mjs`: 2,239 resolved static references.
- `node scripts/check-project-narrative-copy.mjs`: 862 visible strings, 40 projects, 27 stories, 3 case studies and 11 career connections.
- Scoped ESLint, `npx tsc --noEmit`, and owned-file whitespace checks.

The deeper state matrix is covered by the runtime tests; every combination was not separately photographed in the browser. The parent task owns the final production build and broader route review.
