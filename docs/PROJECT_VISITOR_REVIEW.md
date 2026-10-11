# Visitor comprehension review

Review date: 11 October 2026. Reviewed the running development app at `http://127.0.0.1:3000` in a separate Edge tab. The review uses only the page's explanations to answer the questions below; a visitor is not expected to open a repository first. The reviewer authored the shared project-shell changes but did not author the project-specific demo explanations being assessed. These are scoped adversarial judgments, not results from external user testing.

## Questions and pass mark

The user's pass mark is **9/10 for each reviewed project**. A visit must make clear what Samuel built or investigated, why it matters, one purposeful action and how to interpret its outcome, the relationship between recorded work and browser examples, and how to use/download/read further. Technical detail can follow this explanation.

## First pass

Reviewed each overview and demo at the ordinary desktop viewport and 390×844. Exercised CFD playback, MRI 4×/8× selection, microrobot task switching, spectrum panning/export preview and the thermodynamics mixture-interaction control. Phone panes and the document remained contained in the six reviewed demo routes. Live edits occasionally left CSS missing in the development browser; a full reload restored the stylesheet before visual judgment.

| Project | First journey grade | Specific gap | Repair requested |
| --- | ---: | --- | --- |
| Neural CFD Surrogates | 8.4 | Overview opens with architecture acronyms and asks for architecture actions although the first demo shows recorded flow. The demo itself explains its question and saved playback clearly. | Lead with predicting flow around a cylinder; guide Play flow before model designs. |
| Trustworthy MRI Reconstruction | 8.3 | Overview describes U-Net/MC-dropout and asks for skip connections before the saved comparison figure. An additional banner repeats scope text ahead of the figure. | Lead with heart structures/fewer measurements; guide saved figure first. Source agent removed the repeated banner during review. |
| Microrobot Pose & Depth | 8.6 | Overview leads with model names and architecture/split actions; default demo is a microscope-image comparison. The changed demo and numerical benchmark explain pose/depth and model trade-offs well. | Lead with identifying orientation/depth from one image; guide task switch and overlay first. |
| Four Models of Corporate Innovation | 7.7 | Good plain overview becomes “exploratory ventures inside an incumbent” and “readiness heuristics” in the demo. Its first instruction assumes Opportunist although the default is Enabler. | Plain ownership/funding explanation, meaningful slider endpoints and an instruction matching the initial state. |
| CPROT Spectroscopy Plotter | 8.9 | Example trace is already loaded but instructions say to load it. Phone pan buttons show only arrow glyphs, hiding the promised 0.1/100 MHz step sizes. | Guide the loaded example and export preview; show numeric pan steps and units. |
| PC-SAFT Thermodynamics Workbench | 8.5 | Demo offers several variables and “equation tape” without explaining a specific effect. On phones the pressure result is below seven parameter sliders. | Guide one attraction-strength comparison; explain the pressure change and show a live pressure reading near the control. |

## Observed outcomes

- CFD: Play flow advances the recorded frame number and visible cylinder wake. The page states these are saved graph-model predictions and that the browser does not run the trained model again.
- MRI: selecting 8× changes the reported PSNR from 31.90 to 29.59 dB and retained schematic lines from 16/64 to 8/64. The saved example figure and aggregate metrics are distinguished; the interactive phantom is identified as synthetic.
- Microrobot: switching pose/depth changes the response-map task. Pose shows labelled/predicted angles; depth states that numeric predictions are unavailable for the saved panel. The benchmark defines pose accuracy and normalised depth RMSE and explains the size/quality trade-off.
- Spectroscopy: a +0.1 MHz pan changes the visible frequency bounds while retaining a 70 MHz window. The export preview connects paper size and DPI to 4,500×2,100 pixels at 600 DPI.
- Thermodynamics: raising the binary interaction coefficient from 0.02 to 0.03 changes the computed pressure from 1.219 to 1.274 MPa with other inputs fixed. Invented fluids and the pressure calculation are identified separately from real compound predictions.

## Final pass

Completed after the first-pass repairs, native app additions and final navigation-label corrections. Used the real `/en-gb/projects?project=…` overview and `&view=demo` links. Reread all eight final introductions at 390×844, confirmed that How it works starts collapsed, exercised each suggested action, and checked its displayed outcome. Desktop review used the ordinary 1,466×856 browser window; phone review used 390×844. All eight journeys clear the requested 9/10 threshold on both sizes.

| Project | Desktop | Phone | Why it passes now | Remaining friction reflected in the score |
| --- | ---: | ---: | --- | --- |
| Neural CFD Surrogates | 9.2 | 9.1 | Explains predicting fluid around a cylinder and the cost of a full simulation. Play flow advances the saved wake; the page identifies the graph model, recorded playback and colour rescaling. The overview now uses the actual How the models work tab name. | Scientific fields take a scroll to reach on a phone; results and model details still require more reading. |
| Trustworthy MRI Reconstruction | 9.3 | 9.1 | Explains recovering heart structure from fewer measurements. The first view uses the actual saved comparison figure with a reading order; Reconstruct offers the 4×/8× comparison. Saved examples, aggregate scores and generated phantom are distinguished. The duplicate banner is gone. | The wide saved figure is small on a phone, with an explicit full-size link. The alternate reconstruction view is technically dense after its plain introduction. |
| Microrobot Pose & Depth | 9.3 | 9.1 | Explains the tracking problem and the two image-reading tasks. The same actual microscope input can be compared across pose/depth response maps. Labels, positive-response colour and unavailable numeric depth predictions are explained. The benchmark gives numerical results and their meaning rather than invented scientific drawings. | Images stack on a phone, so comparing three panels takes scrolling. The evaluation caveat is lengthy but secondary. |
| Four Models of Corporate Innovation | 9.2 | 9.1 | Ownership and budget have plain endpoint explanations. The initial state now matches the instruction: 32/32 gives Opportunist; a standing budget gives Enabler; a named team gives Producer. The page says the framework is descriptive rather than a ranking, and identifies the fictional company and Samuel’s separate support-time reflection. | The full comparison table needs horizontal scrolling on a phone. The direct slider journey does not depend on it. |
| CPROT Spectroscopy Plotter | 9.3 | 9.2 | Explains inspecting measurements and preparing consistent figures. The actual −0.1/+0.1 controls match the instruction. A pan changes the frequency bounds without changing the 70 MHz width; the DPI preview gives a concrete pixel size and explains it. The generated trace is labelled. | Plot controls precede the chart on a phone; this is a purposeful plotting utility rather than a one-button demonstration. |
| PC-SAFT Thermodynamics Workbench | 9.3 | 9.2 | Leads with molecular size, attraction and pressure. One change to Binary kAB weakens attraction and raises pressure. The live pressure result is directly beside the control on a phone. The overview identifies example fluids; equations and phase-workflow context follow the useful comparison. | The complete equation/calculation section is long and technical, but the first action and its pressure result can be understood before it. |
| Ultra Convert | 9.4 | 9.2 | The first page says what the Mac app converts, why a mixed batch is useful, and where new copies go. The visible preview action produces concrete filenames; switching tasks or settings clears old results. A Mac-preview download, installation guide and user guide are prominent; preview/platform/setup status is clear. | Phone task choices and download links use a short scroll before the preview action. The browser is an explained example workflow, so installing the separate app is needed for real files. |
| VideoMate | 9.5 | 9.4 | Inspect, Repair and Migrate each have a human question. The recovery action is near the task choice and produces clear per-file outcomes. Broken index and missing recording data explain two materially different decisions. Original preservation and the source-preview installation route are clear. | Desktop installers remain in development, accurately described beside the source-start link. |

### Repairs verified

The shared overview now places What I built, Why I built it and Try it before optional methods. The repeated objective paragraph and generic Development/phases are removed. Tool names, repository links and extra actions follow the explanation. Native app download/start links also appear in the top toolbar. The demo shell keeps purpose, action and expected outcome before its controls on a phone. English, Simplified Chinese and Traditional Chinese have explicit shared labels; English variants retain regional wording.

The native-app review caught a primary action below the desktop fold. Both demos now put their preview/outcome action directly after task choices, and their results appear beside that action. Neither page pretends to run a native conversion or video recovery in the browser.

### Final interactions and readable outcomes

- **CFD:** Play flow changed the frame counter from 1 to 2 and continued advancing. The displayed wake is a saved graph-model prediction, with the 20 predicted frames and 30 simulation frames identified as sequences with different initial states.
- **MRI:** Reconstruct → R=8× changed PSNR from 31.90 to 29.59 dB, SSIM from 0.889 to 0.837 and the schematic retained lines from 16/64 to 8/64. The page keeps the real saved figure separate from this generated phantom/measurement illustration.
- **Microrobot:** Pose → Depth changed the recorded map and showed the 0.18 normalised target. It explicitly states that the saved panel has no numeric predicted depth, so a blue/zero-positive-response map is not presented as zero error. Compare tasks showed the same image and separate target explanations.
- **Innovation:** Resource authority 32 → 100 selected Enabler; organisational ownership 32 → 100 then selected Producer. The explanatory model text changed with the selected arrangement.
- **Spectroscopy:** +0.1 moved 5140.0–5210.0 MHz to 5140.1–5210.1 MHz. Export preview at 300 DPI displayed 2,250×1,050 pixels for the same 7.5×3.5 inch figure, compared with 4,500×2,100 at 600 DPI.
- **Thermodynamics:** Binary kAB 0.02 → 0.03 changed pressure from 1.219 to 1.274 MPa. Temperature, density and composition stayed fixed. The phone screenshot shows both the changed control and the live result together.
- **Ultra Convert:** The mixed batch produced Photo.webp, Recording.mp3 and Notes.docx. One new batch folder changed the result paths. Audio from a video cleared the prior result, then preview produced Clip.mp3 and Recording.mp3. The page identifies example filenames and local processing in the separate Mac app.
- **VideoMate:** Show recovery outcomes reported two new copies and one unresolved video. Broken MP4 index produced a checked playable copy; Missing end of recording produced no new copy and explained why absent bytes cannot be recreated. All five originals remained identified as unchanged.

### Responsive and locale checks

The document and active panes had zero horizontal overflow at 390×844 in all eight overview and demo routes. Intentional wide chart/table surfaces retain their local scroll instructions. At 320×568, Ultra Convert and VideoMate still completed their preview/outcome action, and MRI still switched to 8× with readable results and no pane/document overflow. A Traditional Chinese phone spot check confirmed the shared demo guidance labels, an Ultra Convert download label and an expandable translated How it works section. This is a locale spot check; the full locale/static gate belongs to the main verification pass.

### Screenshots

Browser captures are local ignored QA files in `.codex/reports/visitor-review/`:

- Eight `*-phone-overview.jpg` introductions and six `*-desktop-overview.jpg` science/small-project introductions.
- Desktop outcomes: `cfd-desktop-outcome.jpg`, `mri-desktop-figure.jpg`, `microrobot-desktop-outcome.jpg`, `innovation-desktop-outcome.jpg`, `spectroscopy-desktop-outcome.jpg`, `thermodynamics-desktop-outcome.jpg`, `ultraconvert-desktop-outcome.jpg`, `videomate-desktop-outcome.jpg`.
- Phone outcomes: corresponding `cfd`, `mri`, `microrobot`, `innovation`, `spectroscopy`, `thermodynamics`, `ultraconvert` and `videomate` `*-phone-outcome.jpg` captures; compact-phone spots use `*-320-outcome.jpg`.
- Localised spots: `innovation-zh-tw-320.jpg` and `shared-method-zh-tw-phone.jpg`.

These grades assess whether a fresh visitor can explain and use these particular journeys. They do not assert that an external participant test took place or that browser examples validate the underlying research. The remaining projects are covered separately by the source-project agent’s visitor review.
