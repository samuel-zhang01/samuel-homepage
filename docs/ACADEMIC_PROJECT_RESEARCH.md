# Academic project research and visitor explanation

Reviewed 11 October 2026. This file records source findings for the portfolio edit, not visitor-facing copy. Local source paths identify the checked inputs. Confidential thesis materials stay local; do not publish contract rows, private documents or raw dissertation material. All visitor prose should describe Sam’s work in first person, as requested.

## neural-cfd-surrogates

**Checked:** IX-FlowField-UNet/README.md; FNO solution2_executed.ipynb and experiment scripts; GNN gnn-starter-code-release-v-1--AI.ipynb; existing extracted and hash-reviewed flow media and architecture records in the homepage. The FNO versions README lists proposed physics-loss/lightweight/multiscale experiments; that is not proof that every variant completed training.

**What I built:** “I trained three neural models to predict velocity and pressure around a cylinder, using Fourier features, graph messages and a U-Net.”

**Why:** A detailed CFD solver repeatedly computes evolving fields. A learned surrogate aims to predict the next field from previous ones, and the representation affects what it can learn. The data are a two-dimensional spatial mesh with three output channels: horizontal velocity u, vertical velocity v and pressure p; “three-dimensional field values” in the UNet README does not imply a 3D spatial domain.

**Real output:** 20 saved GNN autoregressive prediction frames and 30 simulation frames; four saved FNO/U-Net forecast figures. These sequences begin from different states. Images independently rescale colours; they support wake-shape/time inspection, not a pixelwise prediction-versus-truth error comparison. Playback fps is a display choice, not simulator time.

**Recorded results:** FNO baseline relative L2 0.0163, 3,990,575 trainable parameters; MeshGraphNet relative L2 0.0165, 8,323 parameters, ten residual processors; U-Net 1.2823 on a shifted 20-file evaluation, 50,542,531 parameters and 80×320 rasterised input. FNO/GNN evaluation sets were checked during training; U-Net's distribution differs. FNO 0.0163 and U-Net 1.2823 are directly visible notebook outputs. The current GNN notebook has empty output cells; 0.0165 remains the already-reviewed homepage value and was not newly rerun in this pass. Do not rank these as a common held-out benchmark or invent a speedup. Explain relative L2: 0 is an exact match, above 1 means error norm exceeds reference norm.

**Walkthrough:** Press Play flow, follow the alternating vertical-velocity wake behind the cylinder, pin a frame and compare its shape later in the same sequence. Then inspect numerical results and optionally the model architecture. Saved results should precede Fourier diagrams. Removed the invented flow-field drawing and artificial three-snapshot controls from the numerical results panel.

**Sources:** https://github.com/samuel-zhang01/IX-FlowField-FNO ; https://github.com/samuel-zhang01/IX-FlowField-GNN ; https://github.com/samuel-zhang01/IX-FlowField-UNet . Existing pinned links in the catalogue remain the reviewed references.

## trustworthy-mri-reconstruction

**Checked:** IX-Medical-Imaging/README.md, latex/main.pdf (first two pages), latex/main.tex and the already-public saved reconstruction figure. Git confirms latex/main.pdf, main.tex and fig4_reconstruction_comparison.png are tracked at 93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e.

**What I built:** “I built a cardiac MRI reconstruction model, then tested whether using fewer measurements preserves heart structures and reveals unreliable predictions.”

**Why:** Retaining fewer MRI measurements can reduce acquisition time in principle, but a plausible-looking reconstructed image may lose anatomy. I tested quality, data consistency, explainability, uncertainty, robustness and downstream cardiac segmentation instead of treating image appearance as sufficient.

**Real output/results:** Residual four-level U-Net plus three learned soft data-consistency steps on retrospectively undersampled MM-WHS cardiac images. Reported R=4 aggregate PSNR 31.90 dB, SSIM 0.889; R=8 PSNR 29.59 dB, SSIM 0.837. Removing DC at inference drops PSNR to 23.84 dB (about 8.1 dB loss). MC Dropout uses 30 passes, uncertainty/error Pearson r=0.59; ensemble has three models and ECE=0.017. At R=4 segmentation Dice 0.617 vs 0.672 on reference inputs (about 92% preserved), against 0.332 zero-filled. These are research measures, not clinical diagnostic accuracy or a prospective scanning trial.

**Walkthrough:** First show saved reference/zero-filled/reconstructed panels and their absolute errors. Read left to right and compare R=4 with R=8. Then open Reconstruction, change acquisition budget and examine the corresponding reported averages. Per-example PSNR in the saved figure differs from the aggregate 236-slice measures. Synthetic phantoms belong in optional mechanism views with that distinction explicit.

**Public authored report:** https://github.com/samuel-zhang01/IX-Medical-Imaging/blob/93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e/latex/main.pdf . It names Samuel as author. Added a report link beside the full-size saved figure. No new raw MRI data or weights copied.

## microrobot-vision

**Checked:** IX-DeepLearning/Course Work/README.md, Report/DeepLearning_Report.tex, deployment/model-architectures.md and existing extracted microscope/Grad-CAM media. Git tracks Report/DeepLearning_Report.pdf and its source at 19dacbe70dedb5700a30a51084f5c7e8fb91205a.

**What I built:** “I trained five image models to recognise a microrobot’s pitch-roll pose and estimate depth from a single microscope image.”

**Why:** Tracking and controlling a microscopic robot requires orientation and depth, but monocular images have no stereo view, low contrast and optical defocus. The object outline and diffraction fringes carry useful information.

**Real work/output:** The report describes 2,000 grayscale OMTR images, 40 observed pose classes and 60:20:20 stratified image split. The saved inventory contains 2,002 frames; use “about 2,000” for a broad introduction if the exact data count matters. Custom residual SimpleCNN; ResNet18/34 and MobileNetV3 grayscale transfer adaptation; ViT comparison. Rotation/blur augmentation would change labels or destroy optical depth cues; translation jitter preserves them. Saved microscope inputs and computed ResNet34 Grad-CAM panels are much more informative than a drawn microrobot or an invented heatmap.

**Results:** Five-model table: SimpleCNN 98.25% pose / 0.0478 depth RMSE, ResNet18 97.50% / 0.0256, ResNet34 98.50% / 0.0256, MobileNetV3 97.50% / 0.0325, ViT 98.25% / 0.0265. A separately retrained ResNet34 table gives 100% and 0.0204. Its abstract says depth RMSE 0.204 and prose mislabels 0.0141 as RMSE (the table assigns 0.0141 to MAE). Do not collapse these into one benchmark. Test-monitored epoch choice and related frames crossing image-level splits limit generalisation. Normalised depth RMSE is not millimetres.

**Walkthrough:** Start on real microscope inputs. Switch Pose/Depth and adjust the recorded heatmap overlay. Warm colours show positive response location, not calibrated confidence; each map is independently normalised. The saved depth panels have target values but no numerical predictions, so do not fabricate depth errors. Next compare task quality against model size. Removed the cartoon microrobot, fake micrometre scale and Grad-CAM-style visual from the benchmark panel.

**Public authored report:** https://github.com/samuel-zhang01/IX-DeepLearning/blob/19dacbe70dedb5700a30a51084f5c7e8fb91205a/Course%20Work/Report/DeepLearning_Report.pdf . Source includes report and real figure exports; prefer a useful report label over “artifact”.

## safe-learning-to-defer

**Checked:** IX-Safety-Latex/sections/abstract.tex and experiments.tex, local source CSV/report paths, plus matching OneDrive ML for Safety Critical Decision Making/Group Project/IX-Safety-Group presentation and explanation files. The public repo revision is 00c5099469c98fb6271a1754d6cf565963df898a.

**What I built:** “I designed a fraud-screening policy that can ask a person for help when the model is unsure, while controlling its worst mistakes.”

**Why:** Forcing a prediction on every claim creates avoidable failures. Deferral trades automatic coverage against investigator workload. My modular policy combines calibrated classifier confidence and Bayesian entropy, with CVaR describing the worst retained losses.

**Results:** 1,000-claim benchmark, 80:20 stratified split; about 49 fraud cases in the 200-row test set. Combined policy 89.5% system accuracy at 64% automation coverage/36% deferral, confidence baseline 90.0% at 77% coverage/23% deferral. Simulated investigator base accuracy is 85%, not measured professional performance. Combined CVaR 0.923 vs confidence-only 0.938, not statistically significant; roughly 13 retained tail cases determine the estimate. Main contribution is the adjustable modular risk policy, not superiority on accuracy. The base-rate 24.7% and uncertain dataset provenance limit operational applicability.

**Walkthrough:** Raise minimum classifier confidence: more claims go to review and automated coverage drops. Compare retained errors and tail risk as well as total accuracy. The browser desk uses deterministic fictional rows to explain the arithmetic; report values should be separately labelled. Research notes explain Bayesian feature updates and the simpler baseline. Replace “evidence”, “audit ledger” and exhibit language with what the policy does and what I learned.

**Source differences:** The OneDrive v2 presentation uses entropy AND low confidence and describes an additional CVaR deferral trigger; the revised paper and maintained code use OR and a risk objective/monitor. The presentation also overstates OPE validation relative to the revised limitations. Use the revised paper/code mechanics.

**Source:** https://github.com/samuel-zhang01/IX-Safety-Latex/tree/00c5099469c98fb6271a1754d6cf565963df898a . Do not manufacture real investigator logs: the source’s OPE behaviour policy is itself simulated.

## air-quality-sensor-optimisation / regularisation-lab

**Checked:** IX-MachineLearning/Course Work/Final.md and part 1 files; identical course copy also appears in OneDrive/Courses/Others/Machine Learning/IX-MachineLearning. Task is CO(GT), measured in mg/m³, predicted from sensor and meteorological readings on a historical Italian-city dataset. 7,674 cleaned observations; split then KNN imputation/scaling.

**What I built:** “I compared models for estimating carbon monoxide, then explored which sensors a small monitor should include under a fixed budget.”

**Results:** Linear/Ridge/LASSO test R² around 0.906; polynomial kernel around 0.917; RBF kernel 0.9279 (CV 0.9189). Ridge alpha 8.6975; LASSO alpha 0.0010 retains 10 of 11 inputs. Final.md summary and execution blocks differ slightly in the last digits, so the maintained UI’s specific run should remain named. Sensor costs and browser model preference are hypothetical planning assumptions, not measured procurement outcomes.

**Walkthrough:** Lower budget and see configurations disappear; then favour interpretability to compare simpler coefficients with nonlinear predictive improvement. Optional regularisation lab raises lambda: Ridge smoothly shrinks all coefficients, LASSO zeros some. Its orthonormal toy fit is an exact teaching calculation, not a replay of the coursework fit.

## cost-sensitive-cyber-detection / causal-ope-lab / safety-critical-ai

**Checked:** IX-MachineLearning/Course Work/part 2 and Final.md, existing source audit/results records; IX-Safety-CW3 detailed/condensed solutions and OneDrive safety coursework/lecture notes.

**Cyber contribution:** “I studied how the cost of missed attacks and false alarms changes the point where a classifier raises an alert.” The 10,000-row coursework data contain 4,904 duplicate rows; 1,084 of 2,000 seeded test rows recur in train. Test-based threshold selection and fitted transforms need correction before a detection-performance claim. Keep these details available but explain the decision question before the audit. Try increasing missed-attack cost and lowering threshold; show both errors, not an unsupported headline score.

**Causal/OPE contribution:** “I built worked examples that separate estimating an intervention effect from evaluating a new policy using logged decisions.” The browser has causal paths and a deterministic logged-policy CSV, with IPS, SNIPS, direct, DR and SWITCH-DR mechanics. Try reducing policy overlap; larger importance weights lower effective sample size and make estimates unstable. Do not describe these synthetic calculations as a deployed policy outcome.

**Reliability contribution:** “I tested how model confidence, calibration and prediction intervals behave when the data change.” Existing coursework outputs: calibration ECE 0.03994→0.03792, Brier 0.183854→0.183823, NLL 0.547396→0.547561. Calibration improves some measures but slightly worsens NLL. Conformal target/empirical coverage: 80%/81.00%, 90%/89.88%, 95%/95.75%; wider intervals accompany stronger nominal protection. Start with this practical trade-off and keep distribution-shift synthetic experiment separate.

## insurance-lead-matching (reference only)

**Checked locally:** IX-Marsh-Thesis/README.md, tex/frontmatter/abstract.tex and tables/chapter5_benchmark_numbers.tex. README states confidentiality/distribution restrictions. No dissertation PDF, contract excerpt, private data or new raw thesis figure was copied to the homepage.

**Contribution:** “I built Lead Match to help brokers review possible lead markets, using historical placement patterns and differences in contract wording.” Choosing a lead market shapes coverage, price and terms. The prototype joins acquisition, historical ranking and wording review inside a local Broker Workbench.

**Interpretation:** Current thesis benchmark is retrospective recovery of recorded leads in completed 2026 panels. LambdaRank 84.28% vs prior-year department lead-rate baseline 76.85% on 6,748 panels; 70.08% vs55.95% on 3,546 mixed lead/follower panels. A separately selected 35-field model without final placement/renewal/claim-aggregate fields reaches 55.47% on mixed panels, with no established advantage over history. Final-terms timing violations and development reuse of the cohort mean the stronger result cannot establish suitability when selecting an initial lead. Public opening copy should emphasise the broker task, history versus live appetite distinction, wording comparison and human decision. Any publication of current numerical findings requires the existing confidentiality boundary to remain satisfied.

## Other source findings

KCL-3rd-yr-Lit-Review contains an authored AlphaFold literature review (Report-Journal/main.pdf/main.tex) and two presentations. It compares structure-prediction methods and drug-discovery applications; do not describe it as a newly trained protein-prediction model. Its cover sheet has personal assessment identifiers, so avoid copying the entire PDF directly without an intentional clean public version.

OneDrive’s “Visual Intelligence in Dissolution HTS.pptx” is an authored proposal for edge-based visual dissolution monitoring. Its EfficientNet/Raspberry Pi pipeline, sub-100ms aim and GMP approval roadmap are proposed steps, not achieved results. Do not add a deployed product claim.

IX-Applications-of-Robotics contains ROS simulator/container setup with Gazebo/RViz, TurtleBot3, Flatland, ARIAC and UUV options. Much of the container README is inherited devrt material; mere presence in Sam’s repo does not make him author of those upstream simulators. No new robotics project claim added without authored implementation/results.

## Implementation and verification scope

Changed first-view order and explanations in CFD, microscopy and MRI showcases; removed invented CFD/microrobot benchmark drawings; added a public MRI-report link; rewrote safety, air-quality and cyber control interpretation; translated every new authored string for zh-CN and zh-TW (English regionalisation remains shared). No source images, model weights, raw data or published numerical fixtures changed.

Passed: scoped ESLint on seven changed demo components; scientific-media gate (21 checks, 172 saved images, model/task translations and recorded active-result checks); MRI/source localisation gate (42 rendered cases); source-experiment gate (8 checks); CSS module-reference gate. MRI paper page 1 was rendered and visually inspected read-only; temporary output is ignored under .codex/reports/source-review. Full integration/browser/adversarial verification belongs in docs/VERIFICATION.md and continue.md after root’s final combined changes. This scoped verification does not claim every possible interactive browser state was checked.
