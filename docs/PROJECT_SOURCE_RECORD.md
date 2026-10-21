# Project source record

The dated records below pin source revisions, file hashes and recorded outcomes. The September records preserve provenance after earlier UI reviews were consolidated; later refreshes identify their own source snapshots. Historical results do not claim new model training or current test counts. See [the current audit](VERIFICATION.md), [the artwork guide](PROJECT_ARTWORK.md) and [third-party notices](../THIRD_PARTY_NOTICES.md).


## CV Studio public workspace — 21 October 2026

The existing `cv-keyword-automator`, `project:cv-keyword-automator` and
`archive:cv-keyword-automator` identities now present **CV Studio** at
https://cv-studio.samuelzhang.co.uk. No duplicate project or graph was added.
The source remains private: `samuel-zhang01/Jacques-Oeuf`, public deployment
revision `c37c3a29e9b0e321a660759c9ff74d28b433a704`.
Original repository credits include Samuel and additional contributors; this
refresh describes the integrated workflow and public deployment without claiming
sole authorship of the original team project.

The source paths behind the public claims are
`web-react-integrate/src/features/keywords/` (local import, analysis and export),
`src/context/WorkspaceContext.jsx` (shared draft), backend
`api/routes/generation.py` and `services/public_templates.py` (isolated generation
and eight neutral visitor-text styles), `api/public_workspace.py` and
`services/workspace.py` (signed browser workspaces), and the existing profile,
file and ATS services. `scripts/test_public_workspaces.py` supplies 12 synthetic
security regressions; the existing generation, API and WebSocket suites supply
53 contracts. The source frontend suite has 26 unit tests and 58 browser journeys.

The public deployment starts with empty profiles and never copies the personal
installation's inputs, templates, documents, storage or credentials. Reviewed
keywords support CV generation without an AI call; optional AI extraction and
cover letters require the visitor's own Anthropic key for that request. Text
matching is not a hiring or ATS prediction. Server storage is browser-bound,
expires after inactivity and has no account recovery or cross-device sync. AI
provider calls were not purchased or exercised during publication acceptance.

The portfolio's sole demo destination is the shared black **Open live website**
button. The existing concept remains a small illustrative scene; the embedded
reconstruction is not presented alongside the live app. Two original screenshots
show local keyword review and a real synthetic PDF. Existing topic, capability
and related-context relationships are retained through the shared builder.
Catalogue, story, menu and gallery copy is reviewed in all four locales.

Owned integration files are `src/data/projects.ts`,
`src/components/projects/projectStories.ts`, their narrative/menu translation
tables, `src/data/projectShowcaseImages.ts`, its translation table and the
maintained media fixture. Media provenance is recorded in
[VISUAL_SHOWCASE_SOURCES.md](VISUAL_SHOWCASE_SOURCES.md). Verification and release
scope is recorded in [VERIFICATION.md](VERIFICATION.md) and `continue.md`. Portfolio
content revision `efb7ab5535b8f58144580792493f7ebfd2632afe` is live through protected
workflow `39626832029`; its 12 scoped public visitor journeys pass.


## STUDY-RL teaching portal refresh — 20 October 2026

The homepage integration reviewed public source [`382be343e6b3a656cffe6712b7671e535f58c73e`](https://github.com/samuel-zhang01/STUDY-RL/tree/382be343e6b3a656cffe6712b7671e535f58c73e), published under MIT. The [teaching portal](https://study-rl.samuelzhang.co.uk) is the single course entry point: 26 weeks of English explanations, interactive plots and downloadable Jupyter notebooks, Python projects and shared dependencies. The site explains the read → predict → experiment → implement workflow and offers both individual files and complete weekly bundles. Coding continues locally in Jupyter. Week 25 uses the public synthetic audit; Week 26 is a synthetic causal-learning extension with explicit limitations. These teaching examples do not establish clinical validation or learning efficacy in a user study.

Samuel's supported contribution is independent curriculum authorship and course engineering. The existing `study-rl`, `project:study-rl`, `archive:study-rl` and syllabus identities are unchanged. The portfolio uses the shared sole-live-website launch policy and reviewed copy in all four locales. Historical atlas code is not presented as the complete course. The learning-tools and causal-inference connections and the teaching capability now cite the independent course; the graph does not imply that STUDY-RL was developed during the KCL teaching role. That role's separately sourced session/student counts retain their original meaning.

Owned integration records are `src/data/projects.ts`, `src/components/projects/projectStories.ts`, their reviewed narrative copy, `src/data/profile.ts`, profile copy and the existing graph concept mapping. Maintained graph and narrative checks assert the new provenance and quantitative wording. The current eight-page syllabus is copied byte-for-byte from this source: 225,241 bytes, SHA-256 `c4c0f59ccf965f3058dd32274cea1f80e83ad5b74f2a1d61a30d9300bba7e456`. The exact artifact allowance changes only for that PDF. The recorded 19/32 fine-tuning result below remains a historical experiment, not a fresh training run.

The initial deployed static artifact contains 2,119 files and has archive SHA-256 `79698088dc1a6a7cefa9d7c5c8bece261e296449c71e1f1488ae95432bec5872`. Its unchanged public `release.json` identifies the source revision and `workingTreeChanges: false`; `deployment.json` records the separate artifact identity. See [verification](VERIFICATION.md#study-rl-teaching-portal--20-october-2026) for browser scope and homepage release status.

The same-day public follow-up [`878d1fa364b67d925ced8c07e01383817793a856`](https://github.com/samuel-zhang01/STUDY-RL/commit/878d1fa364b67d925ced8c07e01383817793a856) repairs a narrow-screen heading float that clipped the portal's introduction and Start action. It replaces the float with a wrapping row and adds explicit width, containment and navigation regressions. Its deployed 2,119-file artifact has SHA-256 `7441f49fb57306b3bfe72038e79c4d672c91c7f2efe9ced94e188f8de62f2730`. An independent public check confirms that exact source revision at 320px with reduced motion, a 265px hero filling its available width, a contained heading/button and working Start navigation. This source-site repair changes no homepage application code or syllabus bytes.

## STUDY-RL record

Source revision `92e9b70e715eb75c019cc83dd6755f1955327e92` (6 September 2026):

- 25 executed notebooks, 25 teaching guides, 64 worked examples, 75 self-checks and 448 lecture pages.
- The teaching review records **279 passing tests and one Week 25 empirical-ordering failure**. Extended-reading PDF flags retain their historical status.
- LLM lab: five lessons, eight exercises, 35 executed cells and 83 recorded lightweight test passes.
- SmolLM2-135M-Instruct, Apple Silicon/MPS FP32: 30 SFT updates and 20 DPO updates; 2,442,240 trainable parameters of 136,957,248 including adapters.
- SFT strict format: 0→32/32; strict exact answer: 0→19/32; generation cutoffs: 10→0. Strict matching jointly requires correct content, format and termination.
- DPO evidence covers preference loss. Generated-answer quality for its final adapter remains unevaluated. CUDA/NF4 paths remain unmeasured.
- Syllabus replaced with source PDF SHA-256 `547619235e20ed7befaa7e868793b46cff7796b0b483e3e065626252f83d244e`.

These are recorded repository results. The 9 September audit reran isolated numerical contracts and browser code; full original model training and private service suites were outside that pass.

## Original repositories inspected

The 9 September source audit inspected the following revisions. Private scientific originals remained separate from the public application.

| Original repository | Revision |
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

The owner-supplied finance original has no Git metadata. The import review is pinned by SHA-256:

- `backend/app/ingest.py`: `8d010ce1a81d0d9033f121cf0b5e5cbf6924f8f0f2013edee5e743031fcbb39a`
- `backend/app/parsers/base.py`: `fd527a99f1a3cf9430dae3b0fbf6ef82e3becb2e76c3107ca6916e63cd130c1c`
- `backend/app/db.py`: `392b993294d7d9c1b10839ca405524c4d663417b4dd99be120fd1d892325d1bb`

Selected source functions ran against an isolated in-memory SQLite database with invented rows. Repeated-charge imports added 2, 0 and 1 rows. A provider-ID correction retained the first amount; failed reconciliation still inserted the row; an empty statement received a successful flag despite a residual. The browser now performs real identity comparisons and stateful insertion, with an added changed-content review marker clearly identified. Amounts use integer pennies and the displayed identities expose the source hash inputs. This covers parsed debit-account rows; the browser does not parse statement files. Other finance tabs retain their separate fictional ledger.

Prominent finance scale counts from an earlier handover were replaced with freshly verified code contracts. Wording now distinguishes reconciliation flags, insertion and separate analytical views. Private statement files, financial databases, account data, operational configuration, credentials, original datasets, fitted parameters and model weights remain in their original locations.
