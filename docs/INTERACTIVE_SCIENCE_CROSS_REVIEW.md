# Independent science visitor review

Reviewed on 11 October 2026 by the native-products agent, independently of the science implementation agent. Browser interactions used the Edge computer-use surface against the live development preview at `http://127.0.0.1:3000`. Actual viewport dimensions were checked: desktop 1466 × 857, phone 390 × 844 and phone 320 × 844. The viewport override was reset after the review.

The visitor task was to identify what Samuel studied, perform a purposeful action, and explain the changed result without reading repository code. Scores account for the visible introduction, discoverability, meaningful interaction, interpretation, keyboard operation and readability. They are review judgements, not automated usability measurements. All twelve reviewed journeys meet the requested 9/10 mark. The separate production-build and locale checks remain the release owner's responsibility.

| Experience and catalogue slug | Desktop | 390px phone | 320px phone |
| --- | ---: | ---: | ---: |
| MRI · `trustworthy-mri-reconstruction` | 9.4 | 9.3 | 9.2 |
| Fluid prediction · `neural-cfd-surrogates` | 9.4 | 9.2 | 9.1 |
| Microscope pose/depth · `microrobot-vision` | 9.4 | 9.3 | 9.2 |
| Reliability · `safety-critical-ai` | 9.3 | 9.2 | 9.1 |

Each route is `/en-gb/projects?project=SLUG&view=demo`. The review changed no science implementation files.

## MRI

The first screen explains recovering cardiac structure from fewer measurements and directs the visitor to the divider, 8× sampling and error view. At desktop, the divider responded to Home, switching 4× to 8× changed the pictured reconstruction score from 29.6 to 27.1 dB, and selecting retained measurements then the error view displayed the paired 25.8 → 27.1 dB comparison. Both error maps explicitly share the 0–0.15 intensity scale.

At 390px, the visible first-visit guide was dismissed using Got it before operating the demo. Selecting 8× and Show full result produced the labelled 0% / 100% view and explained that detail can be lost despite a plausible reconstruction. At 320px, Enter selected 8×, End moved the divider to 100% / 0%, and Enter opened the paired error maps. Labels wrapped within the controls; the saved-image section had equal client/scroll widths of 242px. The error pair remained side by side at this size, allowing direct visual comparison without page overflow.

The visible copy distinguishes the pictured slice from separate 236-slice averages and distinguishes saved images from the synthetic teaching views. The PSNR readout is not presented as a new browser inference result. No repair was required.

Screenshots: `.codex/reports/science-cross-mri-desktop.png`, `science-cross-mri-390.png`, `science-cross-mri-320.png`.

## Fluid prediction

The first screen states the cylinder-flow prediction problem and the motivation to explore alternatives to expensive simulations. Playing the saved graph-model sequence visibly advanced the frame number. Compare first and last stopped playback and displayed reference frame 1 alongside frame 20, with the +19 saved-frame offset. At 320px, changing to horizontal velocity also changed the fields and the interpretation text. The comparison states that these are two times within one sequence, not prediction-versus-truth measurements, and that saved colour scaling is independent.

The separate Rollout experiment gives a controllable explanation of feeding a prediction back into its next input. At gain 1.02 and length 20, the calculated final error was 0.2430. Advance one prediction moved from the completed view to step 1 with current error 0.0100; a second keyboard step at 320px produced 0.0202. Reset input error each step changed the final error to 0.0100 and the multiplier to 1.0×. Trace followed by Pause left a stopped state with a current-step readout. The full forecast endpoint remains separately labelled Final error while the current step has its own visible sentence.

At 390px the temporal comparison stacked both readable fields. At 320px the controls wrapped into a longer vertical flow, with the step result immediately below them; the experiment had equal client/scroll widths of 288px. The long control stack costs a small amount of scanning time, reflected in the phone score, but every control was reachable and its outcome understandable. No repair was required.

Screenshots: `.codex/reports/science-cross-cfd-desktop.png`, `science-cross-cfd-390.png`, `science-cross-cfd-320.png`.

## Microscope pose and depth

The first screen asks which way the tiny robot points and how deep it sits, rather than leading with architecture names. The same-image shortcut displayed the shared microscope input and separate pose/depth responses. Moving the shared blend from 65% to 0% or 100% changed the displayed overlay state. Sample 2 showed pose label/prediction 27/27 and target depth 0.36; sample 3 showed 39/39 and target 0.47. Sample 1 explicitly explains why a positively clipped depth map can be blue, without inferring zero error or an unusable model.

The benchmark shortcut selected MobileNetV3 against ResNet34. Pose comparison showed 1.6M versus 21.3M parameters, 7.5% relative size and −1.00 percentage point accuracy change. Switching to depth changed the recorded task-specific parameter counts to 1.5M versus 21.4M, relative size to 7.0%, and error change to +0.0069 normalised depth units. The readout explains that this error is not millimetres and parameter count is not measured device speed.

The 390px and 320px journeys both worked; the 320px shortcut, benchmark and task change were operated using Enter. At 320px the relative-size bars, error change and explanation were readable without outer overflow; that comparison section had equal client/scroll widths of 270px. The wider model matrix is secondary to the compact selected-model explanation. No repair was required.

Screenshots: `.codex/reports/science-cross-microscope-desktop.png`, `science-cross-microscope-390.png`, `science-cross-microscope-320.png`.

## Reliability and population change

The saved-result controls changed the selected target to 95%, showing 95.75% observed coverage and full width 57.39; selecting 80% on the phone showed the separate saved width 37.85. The After calibration control was usable. The copy keeps the small ECE/Brier improvement alongside the worsened test NLL rather than promising an improvement in every measure.

The separate synthetic population experiment makes its new calculation explicit. Saving the initial comparison recorded 36/40 covered at shift +0.00 and radius ±0.90. Four Step shift +0.25 actions, including keyboard Enter at 320px, changed shift to +1.00 and covered outcomes to 18/40 (45.0%), keeping the radius fixed. The saved/current comparison explains that the interval is unchanged. Taking the shift slider to End at 390px produced +2.00 and 0/40. Watch and Pause worked at desktop; changing requested coverage to 95% produced radius ±0.95 and explicitly stated that the interval was recalibrated. Reset population restored 90%, zero shift and 36/40 and cleared the comparison.

At 320px the result cards and saved/current sentence were readable and had equal outer client/scroll widths of 268px. The graph has a deliberate 620px internal plot in a 244px focusable pane. Its visible instruction says to swipe sideways or use arrow keys. Keyboard ArrowRight moved its scroll position from 0 to 5px, confirming the pane can actually be explored. This is a useful tradeoff for legible plot marks rather than hidden outer-page overflow. The saved results above create a longer scroll before the new experiment, reflected in the slightly lower phone score. No repair was required.

Screenshots: `.codex/reports/science-cross-reliability-desktop.png`, `science-cross-reliability-390.png`, `science-cross-reliability-320.png`.

## Shared input-lock check

The phone onboarding dialog was visible on the first 390px science navigation and dismissed before the controls were used. All subsequent phone inputs worked. After the final 320px MRI journey, resetting the viewport returned to 1466 × 857. No hidden guide, blocked control or translation remount was observed in these English journeys. This read-only review does not replace the release owner's specific compiled resize regression for the repaired desktop guide.
