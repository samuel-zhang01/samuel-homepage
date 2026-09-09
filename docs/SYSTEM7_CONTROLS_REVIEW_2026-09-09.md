# System 7 controls review — 9 September 2026

Internal implementation and browser-review record. The historical references and full control specification are in [SYSTEM7_DESIGN_BENCHMARK.md](SYSTEM7_DESIGN_BENCHMARK.md). Paths below reflect the current `src/components/projects/` organization. This records the work reviewed by the graph/control agent; it is not a claim that every page, browser or accessibility scenario was tested.

## Shared control decisions

- `src/app/system7.css` owns `.s7-button` and its `.mac-button` compatibility alias. Normal actions have a white face, black boundary and hard shadow. Default actions have a black outer ring separated by white; pressed actions invert; keyboard focus remains separate. Persistent toggles use a checkmark and inset surface. Blue identifies selected content, rows and options.
- `DemoChrome.tsx/.module.css` and `ClassicSelect.module.css` consume the shared vocabulary. Selects retain their combobox/listbox behavior, current value, triangle, checked selection and viewport-aware popup. Component modules retain layout responsibilities; broad `!important` overrides are not the migration strategy.
- Shared sizes are 22px titles, 18px headings, 15px prose, 13px UI and 12px supporting text. Chicago/Geneva-style local stacks have readable platform and CJK fallbacks. These CSS sizes and 44px compact/coarse-pointer targets are modern adaptations, not historical Macintosh measurements.
- Paper, chrome, shadow, ink and muted text use `#fff`, `#ddd`, `#aaa`, `#000` and `#555`; selected content uses `#11177a` with white text. Ordinary notes are neutral. Scientific color maps, model series, canvas content, equations and meaningful physical-device displays retain their own visual meaning.
- Project-module normalization preserved layout and scientific rendering while removing competing control skins, tiny prose, decorative tracking and tinted audit notices. Follow-up browser checks were necessary: inherited child text colors can defeat an otherwise correct selected-row background.

## Learning and risk browser coverage

Reviewed actual interactive views on the development site at `http://127.0.0.1:5174`, using a separate Edge CUA tab. Desktop coverage included these nine components and their major alternate states:

| Component | Observed views/actions |
|---|---|
| `BanditStudio` | Default policy, 100 additional rounds, regret and method views. |
| `RlAtlasDemo` | Default atlas, week/track labels and navigation into its learning examples. |
| `CliffLearningLab` | Default training, 100 additional episodes and greedy-route view. |
| `LlmPostTrainingLab` | Recorded answers, LoRA and DPO views. |
| `DeferralRiskStudio` | Decision, coverage, tail and method views. |
| `InsuranceMatchingDemo` | Evidence and composite views; alternate candidate selection. |
| `InnovationModelsStudio` | Matrix, portfolio, transition and evidence views. |
| `VentureReasoningStudio` | Claims, market, ask and ledger views. |
| `DecisionDemos` | Air-data QA, model and planner; cyber matrix; LASSO/Ridge; causal default and selected Z; off-policy evaluation. |

At **390 × 844**, reviewed Traditional Chinese deferral decision/coverage, Simplified Chinese insurance evidence/composite and candidate switching, and Traditional Chinese RL atlas/training plus all LLM tabs. A phone training click was interrupted by development HMR; the 100-episode action is verified on desktop, not claimed as a completed phone action.

Concrete follow-up fixes:

- `RlAtlasDemo.module.css`: supporting track text now uses the shared muted token. `RlAtlasDemo.tsx` explicitly localizes values inside the week accessible-name template, fixing mixed English/Chinese QA-status fragments.
- `DeferralRiskStudio.module.css`: selected and hovered queue cells use white text on blue.
- `InsuranceMatchingDemo.module.css`: selected-row score labels and bar legends use white text on blue.
- `VentureReasoningStudio.module.css`: scenario metadata has sufficient contrast; selected contribution labels inherit the selected text color.
- `DecisionDemos.module.css`: selected policy labels and their direct spans remain white in off-policy evaluation.
- `DecisionDemos.tsx`: visitor-facing name/status are “Decision Lab” and “Interactive examples.” `InnovationModelsStudio.tsx` says “Fictional scenarios.” `BanditStudio.tsx` describes a synthetic Gaussian reward experiment with fixed means and noise rather than an internal source-alignment exercise. Corresponding English/CN/TW copy tables were updated; simulation limitations remain.

After these fixes, the reviewed text scans found no remaining contrast failures, sub-12px ordinary text or page overflow. The scan used computed foreground and nearest opaque ancestor background; it excluded SVG, canvas, code, equations and disabled controls. It complements screenshots and does not measure every composited visual or prove whole-site accessibility.

## Graph metadata and relationship copy

`KnowledgeGraph.tsx` gained **59 explicit CN/TW translation pairs**: 58 missing topic/method labels or descriptions, plus the generic “Independent” context label. Existing catalogue translations remain the fallback through `getProjectText`.

- Project tool lines translate each tool label; “Dependency management” now appears as “依賴管理” in Traditional Chinese.
- Relationship explanations use translated project/topic/method names while retaining the authored relationship meaning and relevant method route. Experience context continues to use the existing translated origin data.
- Actual Traditional Chinese Environment Planner graph inspection confirmed “計算與基礎設施,” “基礎設施與復原,” and the translated dependency-management tool label. No graph animation or navigation logic was changed in this copy pass.

## Desktop accessories: actual application windows

Each app was launched using its project page’s **Open application** action, then inspected in the actual app window. Desktop screenshots were captured for all eight.

| App | Exercised action and observed result |
|---|---|
| Note Pad | Next page opened page 2 of 8 with the correct empty editor/status. |
| Sketch Pad | Selected System blue ink; selected state changed without altering the drawing. |
| Quick List | Selected Completed; appropriate empty-state text appeared. |
| Focus Clock | Started and paused the timer; left it paused. |
| Pocket Calendar | Advanced from September to October 2026; note pane remained intact. |
| Desk Calculator | `7 + 5 = 12` appeared on the paper tape. |
| Unit Converter | Swapped metres/feet and observed the inverse result. |
| Colour Studio | Selected the existing yellow swatch; the recommendation correctly changed to black text with a 12.52:1 ratio. |

Phone checks at **390 × 844** covered Traditional Chinese Calendar (month navigation and selected-date layout), Simplified Chinese Calculator (`9 × 9 = 81`, preserving the earlier tape entry), and Traditional Chinese Converter (temperature category and °C → °F → K, including the open selector). Controls, date names, units and accessible labels were inspected in their localized states.

Only `src/components/ProductivityApps.module.css` changed in this accessory pass:

- Set the converter result-unit suffix to the shared 12px size.
- Darkened enabled dates outside the current month to the shared muted color.
- Connected calculator memory/tape controls and converter selects to the shared control-height token; tape actions also have a matching minimum width.
- Applied compact touch sizing at widths up to 520px as well as coarse pointers; widened calendar navigation and gave date rows 44px minimum height.
- Let stacked calendar rows size to their content, so the sixth date row remains inside its panel and the note pane starts below it.

Fresh-load checks confirmed the calendar containment fix, readable selected states, no page overflow and no remaining tiny ordinary text. The intentionally poor contrast sample in Colour Studio is part of its comparison; the recommendation remains readable. No notes, drawings, tasks or saved swatches were deleted. Calculator QA added two tape entries in the otherwise empty test session. The viewport override was reset after review.

## Validation record

These are observed results from this review sequence. Counts are stage-specific and may increase as other agents extend the repository; they are not substitutes for the final integrated production build.

| Check | Observed result |
|---|---|
| `node scripts/check-learning-localisation.mjs` | 316 cases passed. |
| `node scripts/check-project-copy.mjs` | 7,355 bilingual entries across 39 registered files passed at the learning/copy handoff. |
| `node scripts/check-knowledge-graph.mjs` | 27 checks passed; graph then contained 40 projects, 82 nodes and 188 edges. |
| One-off AST/VM graph-copy smoke check | 518 CN/TW topic, method, relationship and dependency-label assertions passed; supplementary temporary check, not a committed gate. |
| `node scripts/check-desk-behavior.mjs` | 28 timer, converter and calculator regressions passed. |
| `node scripts/check-project-css-modules.mjs` | Final accessory pass: 2,239 static class references resolved. |
| `node -e "const fs=require('fs');require('postcss').parse(fs.readFileSync('src/components/ProductivityApps.module.css','utf8'));console.log('ProductivityApps CSS parsed');"` | Final accessory stylesheet parsed successfully. |
| `npx eslint src/components/projects/RlAtlasDemo.tsx src/components/projects/DecisionDemos.tsx src/components/projects/InnovationModelsStudio.tsx src/components/projects/BanditStudio.tsx src/components/projects/KnowledgeGraph.tsx` | Passed again when preparing this record, using the reorganized paths. |

## Screenshot record and review limits

Screenshots are **embedded CUA tool/session artifacts**, captured with `nodeRepl.emitImage(await appTab.getScreenshot())`; no separate PNG archive was written to the repository. The main Edge review tab was `2036625053` (“🧪 Learning Demo QA”).

Captured states include desktop bandit policy, trained cliff, deferral controls and cyber matrix; phone deferral, corrected insurance selection, cliff controls and LoRA; the Traditional Chinese Environment Planner graph; all eight desktop accessories; and final phone calendar, calculator and converter states, including the converter popup. Earlier pre-fix captures and transient unstyled HMR captures also exist in the session and should not be mistaken for final results.

Development HMR occasionally unloaded a lazily loaded stylesheet or reset a demo. Final checks used fresh page loads and verified that the actual app/demo had opened after hydration. This review did not rerun the root agent’s subsequent library scrolling, compact header, default-window-size or stronger-graph-edge changes, and does not claim coverage of those later changes.
