# Project depth and source audit — 9 September 2026

> Historical review of an earlier checkpoint. For the current implementation, language coverage and validation, see the [documentation index](../README.md). Counts and release conclusions below apply only to the recorded checkpoint.

The homepage now connects career records to project evidence and opens substantially deeper experiments. The System 7 desktop and existing deployment structure are preserved.

## Delivered changes

- Career and education origins link both ways, retain the exact project/demo URL and participate in project search and Portfolio Map relationships.
- Initial project pages show the problem, contribution and investigation. Demo pages open on the working experiment; context, pipeline, history and evidence remain expandable beneath it.
- GROWMAT gains a fictional workload, override and refresh-cycle experiment, bringing the archive to **40 files, 37 interactive chapters, 28 demo modules and 17 guided experiences**.
- Shared toolbar layout, chapter-strip contrast, wrapped link hit areas and studio text sizes were revised. Supporting reading and source labels previously at 7–9px now use 12px. New experiment bodies use 14–16px text.
- Demo URLs preserve `?project=<slug>&view=demo` through launch and reload. Cross-app links use document navigation to avoid a desktop metadata-observer race with client navigation.

## Experiments and evidence

| Project | Visitor action | What changes | Evidence basis |
|---|---|---|---|
| STUDY-RL / CliffWalking | Train Q-learning or SARSA; step one transition; inspect a state; evaluate | Real Q values, sampled returns, goal completion and greedy route | Week 04 / Gymnasium transition contracts |
| STUDY-RL / LLM answers | Select a recorded prompt or failure outcome | Base and SFT answers, format, exact match, termination | 32 synthetic held-out response pairs |
| STUDY-RL / LoRA | Take gradient steps and change learning rate | Adapter matrices, prediction, gradients and loss | Exact two-dimensional Lesson 02 exercise |
| STUDY-RL / DPO | Change policy/reference probabilities and beta | Preference probability, loss and gradient | Two-response Lesson 04 objective |
| GROWMAT | Change a fictional job, apply an override, advance refresh | Model estimate, next-cycle assignment, planning value | Owner-published external showcase, especially page 18 |
| Scheduling | Change spring/fall, duration and buffers; inspect a slot | UTC intervals, local clock labels and candidate count | Executed pure V2 source functions; opt-in default stated |
| Home lab | Inject failure and advance events | Lock ownership, operation result and reported outcome | Static backup/restore source; proposed guarded sequence separately labelled |
| MRI | Concentrate residuals; alter acquisition budget | MAE versus MSE/PSNR; retained lines and effective acceleration | Source loss and mask definitions; synthetic residual patch |
| CFD | Alter gain, horizon and input reset | Calculated autoregressive error trajectory | Source rollout structure; scalar teaching recurrence |
| Microrobot | Split frames or complete sequences | Shared source sequences and held-out units | Source split/provenance review; fictional frame assignments |
| Molecular recognition | Reverse prediction order and change tolerance | Match coverage, signed residual and RMS | Counterexample to the browser's ordered matching rule |
| Finance | Import overlapping rows, correct a provider amount, inspect failed and empty statements | Actual inserted/ignored rows, stored identities, retained balance and reconciliation flag | Seven isolated original-Python/SQLite attempts; invented debit-account fixtures |
| Reliability | Move a synthetic population after calibration | Interval membership and observed batch coverage | Explicit finite-sample rank and deterministic residual construction |

Recorded model results stay separate from calculated teaching examples. Browser experiments run locally and use synthetic data or reviewed synthetic source responses.

## Updated STUDY-RL record

Source revision `92e9b70e715eb75c019cc83dd6755f1955327e92` (6 September 2026):

- 25 executed notebooks, 25 teaching guides, 64 worked examples, 75 self-checks and 448 lecture pages.
- The teaching review records **279 passing tests and one Week 25 empirical-ordering failure**. Extended-reading PDF flags retain their historical status.
- LLM lab: five lessons, eight exercises, 35 executed cells and 83 recorded lightweight test passes.
- SmolLM2-135M-Instruct, Apple Silicon/MPS FP32: 30 SFT updates and 20 DPO updates; 2,442,240 trainable parameters of 136,957,248 including adapters.
- SFT strict format: 0→32/32; strict exact answer: 0→19/32; generation cutoffs: 10→0. Strict matching jointly requires correct content, format and termination.
- DPO evidence covers preference loss. Generated-answer quality for its final adapter remains unevaluated. CUDA/NF4 paths remain unmeasured.
- Syllabus replaced with source PDF SHA-256 `547619235e20ed7befaa7e868793b46cff7796b0b483e3e065626252f83d244e`.

These are recorded repository results. The current audit reran isolated numerical contracts and browser code; full original model training and private service suites were outside this pass.

## Original repositories inspected

The user authorised cloning into `/Users/samuel/GitHub`. Eight missing originals were cloned; private scientific repositories use source-focused sparse working trees.

| Newly cloned original | Revision |
|---|---|
| COVERD-YASA | `68a3b1bd0cbe03bb17acece0e1e68d74dd3851e7` |
| IX-Medical-Imaging | `93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e` |
| CPROT-Spec-Fast-Plotter | `9c6496d7b3c9f67dad163bf6f289de5e22ed3fd0` |
| IX-FlowField-FNO | `a2b1ae00a51ac075e53d7a18720bec35226185be` |
| IX-FlowField-GNN | `4833a1a110f697fcbe469d5f9304eed4b8245bd0` |
| IX-FlowField-UNet | `1d745a8d038c6729709c8ab654088c32142ecefb` |
| IX-DeepLearning | `19dacbe70dedb5700a30a51084f5c7e8fb91205a` |
| Clapeyron.jl-Dev | `983d692c4dc2186dfca23e971bb8ad6549508e7e` |

Existing STUDY-RL, Home-Automation-Stack, AEGIS-ATS, COVERD-AGI, Coding-Practice and relevant local CV tooling were also inspected. GROWMAT is grounded in its public PDF. `web-react-integrate` identifies itself as Jacques-Oeuf CV tooling and has no Git metadata; it was kept separate from GROWMAT and from pinned source claims.

The user supplied the finance original at `/Users/samuel/GitHub/Bank Statements/finance-app`. It has no Git metadata. The import review is pinned by SHA-256:

- `backend/app/ingest.py`: `8d010ce1a81d0d9033f121cf0b5e5cbf6924f8f0f2013edee5e743031fcbb39a`
- `backend/app/parsers/base.py`: `fd527a99f1a3cf9430dae3b0fbf6ef82e3becb2e76c3107ca6916e63cd130c1c`
- `backend/app/db.py`: `392b993294d7d9c1b10839ca405524c4d663417b4dd99be120fd1d892325d1bb`

Selected source functions ran against an isolated in-memory SQLite database with invented rows. Repeated-charge imports added 2, 0 and 1 rows. A provider-ID correction retained the first amount; failed reconciliation still inserted the row; an empty statement received a successful flag despite a residual. The browser now performs real identity comparisons and stateful insertion, with an added changed-content review marker clearly identified. Amounts use integer pennies and the displayed identities expose the source hash inputs. This covers parsed debit-account rows; the browser does not parse statement files. Other finance tabs retain their separate fictional ledger.

Prominent finance scale counts from an earlier handover were replaced with freshly verified code contracts. Wording now distinguishes reconciliation flags, insertion and separate analytical views. Private statement files, financial databases, account data, operational configuration, credentials, original datasets, fitted parameters and model weights remain in their original locations.

## Verification

- `npm run check:learning`: 148 source transition fixtures; seeded training; terminal/collection-cap semantics; Q-learning updated-state selection; SARSA next-action carry; immutable evaluation; LoRA/DPO arithmetic; coverage stress; 32 recorded answer checks; career references.
- Independent control audit: 54 allowed configurations × 500 episodes stayed finite; seed 7 Q-learning found a 13-move route, while early SARSA failure remained visible.
- `npm run check:experiments`: nine portable suites exercise the actual components. Independent source-experiment audit: 12 DST combinations matched the original pure functions; three acquisition budgets matched MRI source. Nine interaction/numerical suites covered matching, splits, rollout, backup and workload state. The finance suite also checks seven original-source fixture attempts, exact SHA-1 identities, immutable state and all four visible import scenarios.
- Existing catalogue, source-artifact hashes, search isolation, localisation, desktop, controls, orbital and CSS-module gates pass.
- Desktop and 390px browser checks cover career/deep-link round trips, actual learning controls and new experiment states. Finance checks cover all four import scenarios, replay, reset and history; archive-view changes and refresh preserve the selected RL demo. A further crawl exercised a primary interaction in 18 existing demos; page width remained contained throughout. Diagrams and wide tables use contained horizontal scrolling where needed.

- Final `npm run lint` and `npm run build:isolated` pass. The production checkpoint generates 83 static pages; dynamic project routes retain direct demo initialization. Browser assets total 3.61 MiB across 107 files.

The source review is an editorial and implementation audit. Reported original training results retain their original evaluation scope; the new numerical demos expose the assumptions behind their examples.
