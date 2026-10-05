# Project source record

These source revisions, file hashes and recorded outcomes were inspected on 9 September 2026. They preserve provenance after the dated UI reviews were consolidated. They are historical source records, not claims of new model training or current test counts. See [the current audit](VERIFICATION.md), [the artwork guide](PROJECT_ARTWORK.md) and [third-party notices](../THIRD_PARTY_NOTICES.md).

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
