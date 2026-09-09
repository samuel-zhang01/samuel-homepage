# System 7 Mandarin review — 9 September 2026

Internal development record. Browser review used the local development server at `http://localhost:5174`, a dedicated Edge CUA tab (`2036625056`, session “Mandarin document QA”), and full navigation to each route. The project document was awaited before DOM inspection and capture. This review covers the document metadata and the product states below; it does not imply that every possible interactive state was visually inspected.

## All 80 project documents

All 40 slugs below were reviewed at both `/zh-cn/projects?project=<slug>` and `/zh-tw/projects?project=<slug>`. The DOM review included titles, summaries, area/year labels, technology lists, development steps, results, exploration prompts, career/education connection copy, and material-link labels. Embedded demo content was excluded from this metadata count.

```text
orbital-lab                         desk-note-pad
 desk-sketch-pad                    desk-quick-list
 desk-focus-clock                   desk-pocket-calendar
 desk-calculator                    desk-unit-converter
 desk-colour-studio                 coverd-ai
 growmat                            insurance-lead-matching
 cv-keyword-automator                ocean-depths-finance
 coverd-yasa                        parliamo-italian-learning
 course-recommender-audit            study-rl
 sequential-decisions-lab            microrobot-vision
 trustworthy-mri-reconstruction      neural-cfd-surrogates
 air-quality-sensor-optimisation     cost-sensitive-cyber-detection
 regularisation-lab                 safety-critical-ai
 safe-learning-to-defer              causal-ope-lab
 innovation-models-reflection        ai-venture-reasoning
 pc-saft-thermodynamics              drug-solubility
 molecular-recognition              cprot-spectroscopy-plotter
 deep-learning-environment-resolver  gromacs-hpc
 home-automation-stack              stock-market-engine
 covid-decision-support             coding-series
```

Results: **80 unique routes, 1,368 metadata text occurrences, 1,032 distinct rendered strings**. Both locales were verified from each document's `lang` attribute. No untranslated prose was found. English-only entries were product names, software/API names or technical acronyms. At the 1,466 px desktop viewport, every document measured 1,452 px for both client and scroll width; the page also stayed within the viewport.

**Screenshot evidence:** 80 initial viewport screenshots were captured, but only **ten representative images were visually inspected**: Simplified Chinese COVERD, Course, MRI, Home Lab and Finance; Traditional Chinese Focus Clock, Microrobot, CFD, GROMACS and COVID decision support. They were emitted as image artifacts in the CUA tool conversation. All capture bytes are held in that CUA session's `documentScreenshots` array (initial indices 0–79), alongside the `documentAudit` DOM records. They are session artifacts, not committed image files or permanent repository attachments.

Six affected documents were then reloaded after copy polish, producing six further captures (indices 80–85). The Traditional Chinese deferral document was visually inspected again, so the review contains eleven emitted visual inspections in total, including this follow-up. The six reloads again showed no overflow.

## Corrections and checks

Only `src/components/projects/copy/projectNarrativeCopy.ts` changed during this final metadata pass: corrected Traditional Chinese `併為` to `並為`, added spacing before the AKC proper name, and removed stray spaces inside translated statistical terms. No demo source, numerical result or English source narrative changed.

Checks rerun after these edits:

- `node scripts/check-project-narrative-copy.mjs`: 862 authored visible strings across 40 projects, 27 interactive stories, 3 case studies and 11 career connections have explicit CN/TW runtime coverage.
- `node scripts/check-project-copy.mjs`: 7,363 bilingual entries in 39 registered source files passed, including template interpolation, accessible properties, footers, source exclusions, immutable math and component boundaries. Unregistered demos remain outside that gate's count.
- `node scripts/check-mri-localisation.mjs`: all **438 rendered state/locale cases** passed. These deterministic component renders supplement browser review; they are not 438 browser screenshots.

The 438 cases comprise MRI/source (38), scheduling/import (46), finance (20), home lab (20), stock simulation (18), course recommendation (24), Italian learning (30), environment planning (128), CV editing (72), coverage shift (18), and portfolio comparisons (24).

## Earlier product browser checks in this work session

- All seven MRI views in Simplified Chinese; all five Finance views and all four CV tabs in Traditional Chinese; all four Environment views in both locales: 24 desktop view/locale checks. No demo overflow or math fallback appeared in these checked views.
- MRI and CV at 390 × 844: page width 390 px and demo client/scroll width 358 px. Fields remained readable. MRI's narrow-screen tab navigation deliberately scrolls horizontally inside its own container.
- Course selected and hovered cards were checked after the contrast correction: category and title use white text on the dark blue selection background; white chips retain dark text.
- MRI figure accessibility labels were checked after translating the nested model description. Environment and Course desktop tab rows were aligned to four columns. Plain-language app headers and explicit CN/TW status labels were rechecked after full reloads.

## Deliberate language boundaries

UI, explanatory prose, feedback, ordinary tool descriptions and accessible labels are translated explicitly. Product/research names, software libraries, named algorithms, API identifiers, units, LaTeX mathematics, source commands and file/code examples retain their necessary spelling. Italian exercise material is explicitly marked as Italian; translating it would remove the language-learning task. CV source-document quotations and sample English job/CV documents remain source material because the demonstrated lexical rules operate on English; the surrounding instructions, analysis and feedback explain this in Mandarin. These specific exceptions do not justify leaving general research-demo prose in English.
