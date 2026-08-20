import type { Project, ProjectDemoId } from "@/data/projects";

export type ProjectStory = {
  audience: string;
  problem: string;
  objective: string;
  contribution: string;
  pipeline: string;
  walkthrough: string;
};

// Editorial records for every executable chapter. They stay separate from the
// catalogue card so the archive can explain the human problem before launching
// a dense workbench, while the source-grounded technical copy remains reusable.
export const projectStories: Record<ProjectDemoId, ProjectStory> = {
  "insurance-matching": {
    audience: "Specialty-insurance brokers reviewing a candidate market panel.",
    problem: "Relevant evidence arrives from incompatible, incomplete and time-sensitive sources; a single unexplained rank can conceal missingness and leakage.",
    objective: "Make each evidence pillar inspectable and preserve broker authority until a joint decision objective is validated.",
    contribution: "Formalised the risk/panel contract, built temporal ranking and historical-evidence paths, integrated wording evidence, provenance, nulls and review gates.",
    pipeline: "risk + candidate panel → three independent evidence agents → confidence / provenance / abstention → broker review",
    walkthrough: "Keep Evidence view active, select a market with a missing pillar, raise the minimum-signal gate, then inspect why it becomes unavailable. Open the retired composite only to see its sensitivity.",
  },
  "cv-keywords": {
    audience: "A candidate preparing a truthful, role-specific application.",
    problem: "Job language is easy to miss, but blindly injecting keywords creates unsupported claims and unreadable documents.",
    objective: "Route role language into a suitable template while keeping every claimed signal visible and evidence-backed.",
    contribution: "Built the original extraction/template/LaTeX workflow, then replaced hidden keyword placement with a safer browser evidence and rewrite review.",
    pipeline: "role description → deduplicated signals → CV evidence map → factual rewrite staging → LaTeX-safe output manifest",
    walkthrough: "Edit one CV sentence, run analysis, inspect a missing high-priority signal, stage a factual rewrite and verify how the output manifest changes.",
  },
  finance: {
    audience: "A household that wants local, auditable financial intelligence rather than cloud-first aggregation.",
    problem: "Statements from several providers disagree in format and can double-count transfers, recurring charges or balances.",
    objective: "Reconcile every import before deriving patterns, anomalies, transfers and investment views.",
    contribution: "Built provider parsers, reconciliation and idempotent import contracts, then exposed each derived calculation over a fictional ledger.",
    pipeline: "statement files → parse / normalise → deduplicate / reconcile → recurring + transfer + anomaly models → review views",
    walkthrough: "Start in Import audit, replay the staged batch to exercise deduplication, then change a recurring tolerance or transfer rule and trace the affected rows.",
  },
  scheduling: {
    audience: "Teams offering public booking while coordinating several hosts and calendars.",
    problem: "Availability must respect time zones, buffers, allocation policy and concurrent visitors without double-booking.",
    objective: "Generate explainable slots and protect the reservation-to-booking transition with a canonical uniqueness contract.",
    contribution: "Implemented four allocation modes, host-window generation, buffered conflicts, UTC reservations, final revalidation and integration boundaries.",
    pipeline: "public page → host windows + busy time → generated candidates → UTC reservation → revalidate → calendar / email / ICS",
    walkthrough: "Switch allocation mode, inspect an unavailable slot with the keyboard, reserve an available time, then replay a collision before confirming it.",
  },
  "italian-learning": {
    audience: "A beginner following an eight-week Italian A1 plan across intermittent connectivity.",
    problem: "A long curriculum becomes unusable when daily work, recall scheduling, writing evidence and offline state are disconnected.",
    objective: "Turn the verified course sequence into one dated daily loop with durable mastery evidence.",
    contribution: "Modelled 56 agendas and 28 hubs, built adaptive practice, spaced recall, writing feedback, CEFR lanes and conflict-safe D1/offline state.",
    pipeline: "dated plan → lesson hub → adaptive practice / recall → writing evidence → mastery + CEFR lanes → revision-safe sync",
    walkthrough: "Answer a Today question, review the mastery update, grade a Recall card, then open System architecture and trigger the revision-conflict recovery.",
  },
  "course-recommender": {
    audience: "A product team deciding whether a prototype deserves to be called a recommender.",
    problem: "Random ordering behind a polished form can masquerade as personalised ranking while UI, API and database contracts drift.",
    objective: "Audit the source baseline honestly and show what a decomposable, testable ranking contract would require.",
    contribution: "Replayed the random baseline deterministically, mapped six-versus-two field drift and added a clearly separated safety-improved scoring lens.",
    pipeline: "mock learner preferences → source gate / random order → contract audit → optional transparent scoring adaptation",
    walkthrough: "Run Source baseline twice with different observability seeds, inspect the reason strings, then open Source map to see where the six-field UI collapses to two API fields.",
  },
  "rl-atlas": {
    audience: "A technical learner or reviewer navigating a 24-week reinforcement-learning programme.",
    problem: "A large curriculum is hard to evaluate when notes, code, tests, figures and applied boundaries are scattered by week.",
    objective: "Expose the learning progression and evidence completeness without publishing assessed workbook content.",
    contribution: "Built and audited the weekly topology, test and artefact ledgers, safety thread and links into executable portfolio chapters.",
    pipeline: "foundations → value / policy methods → offline + model-based RL → bandits / OPE → safety + applied audit",
    walkthrough: "Select a track, inspect one week’s evidence ledger, filter for a method such as OPE, then open the connected Bandit or Causal/OPE chapter.",
  },
  bandits: {
    audience: "A learner comparing exploration policies under uncertain rewards.",
    problem: "A single lucky trajectory can make a policy look better and realised regret can be confused with mean-gap pseudo-regret.",
    objective: "Make decisions, updates, oracle accounting and multi-seed policy comparison reproducible and inspectable.",
    contribution: "Rebuilt the Week 01 mechanics with deterministic reward streams, exact ledgers and a browser comparison of epsilon-greedy, UCB1 and Thompson Sampling.",
    pipeline: "synthetic arms → forced observations → policy selection → reward / incremental update → two regret accounts → paired-seed comparison",
    walkthrough: "Step through the forced pulls, run 100 rounds, compare both regret traces, then inspect the twelve-seed UCB1/Thompson/epsilon bake-off.",
  },
  "microrobot-vision": {
    audience: "Researchers estimating microrobot class and depth from grayscale microscopy frames.",
    problem: "High headline accuracy can hide architecture provenance, checkpoint drift and correlated-frame leakage.",
    objective: "Compare trained model families while keeping task, tensor path, evaluation stage and generalisation caveats attached.",
    contribution: "Authored a residual CNN, adapted pretrained vision families, trained two heads and reconstructed exact architecture/checkpoint evidence.",
    pipeline: "oriented 224×224 frame → grayscale backbone → classification or depth head → metric snapshot → provenance / split audit",
    walkthrough: "Rotate the architecture view, select SimpleCNN and inspect its residual path, then compare definition parameters with the older local checkpoint and open the split caveat.",
  },
  "mri-trust": {
    audience: "MRI researchers deciding whether an accelerated reconstruction is reliable enough for downstream use.",
    problem: "A plausible image can still violate measured k-space, erase anatomy or present unjustified confidence.",
    objective: "Join reconstruction quality, data consistency, uncertainty and frozen downstream evaluation in one trust contract.",
    contribution: "Designed the residual U-Net and soft data-consistency cascades, ensemble/MC-dropout analysis and a source-honest interactive audit.",
    pipeline: "undersampled k-space → zero-filled input → residual U-Net → three soft-DC cascades → uncertainty + segmentation checks",
    walkthrough: "Move the acceleration and uncertainty controls, inspect the trust gate, then open Architecture and follow one encoder skip through reconstruction and data consistency.",
  },
  "cfd-surrogates": {
    audience: "Scientific-ML reviewers comparing surrogate families for flow-field prediction.",
    problem: "Model scores are easily misranked when architectures, splits, checkpoints and source revisions are not comparable.",
    objective: "Explain what each FNO, graph and U-Net experiment actually establishes without inventing a common leaderboard.",
    contribution: "Completed and trained multiple surrogate implementations, then reconciled exact tensor paths, parameters, checkpoints and split limitations.",
    pipeline: "mesh/grid flow state → FNO or message passing or encoder-decoder → future fields → per-run evaluation receipt",
    walkthrough: "Compare the FNO variants, switch spatial/FFT inspection, step through a graph processor block, then trace a U-Net skip and read why scores cannot form one leaderboard.",
  },
  reliability: {
    audience: "Model owners deciding when a scientific prediction should be accepted, recalibrated or escalated.",
    problem: "Point accuracy does not reveal uncertainty calibration, exchangeability failures or subgroup reliability.",
    objective: "Turn calibration and conformal diagnostics into explicit operating boundaries rather than universal guarantees.",
    contribution: "Reconstructed reliability diagrams, ECE and split-conformal sets with visible assumptions and covariate-shift failure analysis.",
    pipeline: "scores + labels → calibration bins → conformal calibration set → prediction set / abstention → shift diagnostics",
    walkthrough: "Change calibration and shift settings, inspect ECE and set size, then deliberately break exchangeability to see why nominal coverage is no longer guaranteed.",
  },
  "air-quality": {
    audience: "An environmental team choosing a compact sensor set and model under cost and transparency constraints.",
    problem: "Strong random-split fit does not answer which sensors matter, whether preprocessing is safe or whether performance survives time/site shift.",
    objective: "Connect source data QA and model results to an explicit sensor-budget decision.",
    contribution: "Audited the 7,674-row notebook pipeline, surfaced five source model results and built a separate browser Pareto decision lens.",
    pipeline: "time-indexed observations → train-only imputation / scaling → five regressors → source metrics → sensor cost / transparency frontier",
    walkthrough: "Read the missingness and split receipt, compare the five source models, then change the interpretability preference and sensor budget to move the browser-only decision.",
  },
  "cyber-threshold": {
    audience: "A security or model-risk reviewer assessing a cost-sensitive classifier claim.",
    problem: "Duplicate leakage, transform refitting and test-selected thresholds can turn an impressive curve into invalid evidence.",
    objective: "Make the historical workflow’s failure modes visible and specify the rerun required before any performance claim.",
    contribution: "Profiled exact duplicates and split overlap, traced preprocessing/threshold leakage and reframed the result as an audit rather than a benchmark.",
    pipeline: "10,000 coursework rows → duplicate / split audit → historical model outputs → cost lens → leakage-safe rerun specification",
    walkthrough: "Inspect duplicate overlap first, then alter the cost threshold only as a historical sensitivity view and finish on the required grouped/deduplicated validation plan.",
  },
  regularisation: {
    audience: "A learner interpreting how shrinkage changes a correlated air-quality regression.",
    problem: "A coefficient path can look authoritative even when its browser derivation and source-fitted model are different objects.",
    objective: "Expose soft-threshold mechanics and model-selection trade-offs without pretending to reproduce the notebook fit.",
    contribution: "Built an inspectable orthonormal-path reconstruction and attached it as a companion to the richer air-quality workflow.",
    pipeline: "standardised illustrative coefficients → lambda threshold → active set / path → bias-variance interpretation",
    walkthrough: "Raise lambda until a coefficient becomes zero, compare the path and active-set count, then return to the Air-Quality chapter for the source model evidence.",
  },
  "deferral-risk": {
    audience: "Fraud investigators deciding which cases an automated classifier must defer.",
    problem: "Optimising average accuracy alone can leave a dangerous retained tail or defer too much operational volume.",
    objective: "Make coverage, retained risk and CVaR trade-offs explicit while preserving human review.",
    contribution: "Co-developed the calibrated classifier/uncertainty study and reconstructed its reported operating-point arithmetic with deterministic fictional records.",
    pipeline: "claim features → calibrated fraud score + sequential uncertainty → OR deferral gate → retained/deferred risk ledger",
    walkthrough: "Move both deferral thresholds, compare system versus retained accuracy and CVaR, then inspect exactly which fictional claims cross each gate.",
  },
  "causal-ope": {
    audience: "A decision scientist separating intervention effects from evaluation of a new logged policy.",
    problem: "Causal adjustment and off-policy evaluation answer different questions, and both fail under weak overlap.",
    objective: "Make identification, propensities, support and estimator disagreement inspectable in two distinct chapters.",
    contribution: "Authored the causal fixture and rebuilt the tested Week 11 IPS/SNIPS/Direct/DR/SWITCH-DR contract over synthetic logs.",
    pipeline: "Local synthetic CSV → logged context-action-reward → valid adjustment or policy ratio → weighted / model-assisted estimate → ESS + support audit",
    walkthrough: "First open a collider path in the DAG, then switch to OPE, choose Challenger, reduce overlap and watch ESS and estimator disagreement change.",
  },
  "innovation-models": {
    audience: "Leaders deciding where exploratory ventures should sit inside an incumbent organisation.",
    problem: "Ownership and resource authority are often discussed abstractly, without testing portfolio concentration or transition timing.",
    objective: "Turn four corporate-entrepreneurship models into inspectable structure and scenario questions.",
    contribution: "Re-authored the assessed reflection as a synthetic matrix, portfolio calculator and timing lab with transparent heuristic boundaries.",
    pipeline: "ownership + authority → four-model topology → allocation mix / concentration → transition readiness questions",
    walkthrough: "Choose ownership and authority, rebalance the 100-token portfolio, then stress evidence, integration and runway in the Transition lab.",
  },
  "venture-reasoning": {
    audience: "A founder or reviewer testing whether a pitch claim, market number and capital ask form one evidence chain.",
    problem: "Polished venture prose can hide weak substantiation, top-down sizing and an ask disconnected from milestones.",
    objective: "Make claim coverage, bottom-up arithmetic and runway-to-evidence gates traceable.",
    contribution: "Separated the source’s human/LLM authorship boundary and independently rebuilt the reasoning pattern with fictional ventures.",
    pipeline: "venture claim → evidence contract → segment / pipeline arithmetic → ask + runway → milestone gate",
    walkthrough: "Strengthen one traction claim, stress the qualified pipeline, then reduce the ask and inspect the resulting milestone funding gap.",
  },
  thermodynamics: {
    audience: "A thermodynamics learner inspecting how molecular parameters shape a PC-SAFT state calculation.",
    problem: "Equation-of-state outputs are difficult to trust when mixing rules, units and derivative steps are hidden.",
    objective: "Expose the non-associating residual calculation term by term without claiming validated property prediction.",
    contribution: "Reimplemented the pinned MIT-licensed Clapeyron equations with invented fluids, visible mixing and an independently authored pressure derivative.",
    pipeline: "invented segment parameters + T / density / composition → diameters + mixing → hard-chain + dispersion → Z and pressure",
    walkthrough: "Change density and binary interaction, inspect the pressure/isotherm response, then open the equation tape to reconcile each intermediate term and unit conversion.",
  },
  "solubility-workflow": {
    audience: "A scientist reconciling solid–liquid equilibrium calculations with a laboratory reporting basis.",
    problem: "A solver’s mole-fraction answer is not directly comparable with mass-per-solvent observations, and fitted performance can leak without a held-out split.",
    objective: "Make the equilibrium root, basis conversion and synthetic calibration/holdout boundary explicit.",
    contribution: "Reconstructed the private workflow shape using invented Compound Q / Solvent L values and pinned public Clapeyron equations.",
    pipeline: "fusion properties + activity model + temperature → log-space SLE root → mole fraction → mg g⁻¹ solvent → split-aware audit",
    walkthrough: "Move temperature, inspect the root residual and convergence table, switch reporting basis, then fit the synthetic calibration rows and check the untouched holdout rows.",
  },
  "molecular-recognition": {
    audience: "Rotational spectroscopists assigning flexible macrocycle conformers from crowded spectra.",
    problem: "Many low-energy conformers produce nearby transitions, so assignment needs multiple line matches and theory/experiment reconciliation.",
    objective: "Explain the public 2–8 GHz Exaltenone/Muscone workflow without exposing experimental rows or unpublished structures.",
    contribution: "Contributed to the conformer-analysis pipeline and rebuilt a deterministic assignment challenge, atlas and method ledger from public evidence.",
    pipeline: "conformer search → predicted constants / transitions → CP-FTMW peaks → match / residual audit → candidate structure",
    walkthrough: "Offset the synthetic spectrum, compare E-01 with the decoy assignment, focus one matched transition, then rotate the conformer atlas and inspect the method boundary.",
  },
  spectroscopy: {
    audience: "A spectroscopy researcher turning a two-column instrument export into an inspectable figure.",
    problem: "Rapid frequency-window navigation and consistent export are tedious in general-purpose plotting tools.",
    objective: "Preserve the small desktop utility’s exact plotting controls as the tooling chapter of the molecular workflow.",
    contribution: "Built the MATLAB App Designer utility and reconstructed its viewport/export arithmetic over a deterministic synthetic trace.",
    pipeline: "two-column frequency / intensity file → labels + colour / grid → centre / pan / window → high-resolution export plan",
    walkthrough: "Load the synthetic trace, centre on a frequency, pan by 0.1 and 100 MHz, change the window and inspect the 600-DPI export dimensions.",
  },
  "dl-environment": {
    audience: "A developer preparing a cross-platform deep-learning environment with optional GPU acceleration.",
    problem: "OS, architecture, driver and framework compatibility branches can silently produce a CPU-only or partially broken install.",
    objective: "Make the source resolver’s branches and its reproducibility gaps inspectable before any command is run.",
    contribution: "Authored a 968-line installer, audited its target manifest and added a non-executing safety-improved planner with deterministic failure injection.",
    pipeline: "host facts → OS / architecture / CUDA resolver → package route + fallbacks → import / device probes → reconciliation",
    walkthrough: "Choose an Apple Silicon or CUDA host, inject one framework failure, compare Source and Guarded routes, then inspect the 19+4+1 target reconciliation.",
  },
  "home-lab-topology": {
    audience: "A self-hosting operator reviewing dependencies, backup intent and recovery evidence.",
    problem: "A Compose file can look operational while lacking health checks, immutable versions and verified restore evidence.",
    objective: "Audit one six-service infrastructure slice without claiming runtime availability or exposing the private repository.",
    contribution: "Mapped the Compose topology, dependency paths, scheduled database backup intent and missing recovery controls into a synthetic operations lab.",
    pipeline: "Compose manifest → service / network / mount graph → dependency fault drill → backup-capacity scenario → evidence gaps",
    walkthrough: "Trace the scheduler-to-database path, fail PostgreSQL, inspect declared blast paths, then size a backup scenario and read which recovery claims remain unverified.",
  },
  "stock-market-engine": {
    audience: "A reviewer learning what a small stochastic-price script actually implements.",
    problem: "Names such as ‘market engine’ invite unsupported claims about books, matching and persistence that the source does not contain.",
    objective: "Reproduce the single-stock impact mechanics and expose the original daily-window bug without inventing exchange behavior.",
    contribution: "Audited the Julia loops, built a seeded browser replay and separated legacy from corrected statistics.",
    pipeline: "sentiment + five traders × ten loops → buy/sell event → quantity-scaled random impact → price / volume ledger → window audit",
    walkthrough: "Run the seeded day, trigger the price-floor scenario, switch legacy versus corrected metric windows and inspect why only part of the event tape was originally measured.",
  },
  "chemistry-coding": {
    audience: "A chemistry learner connecting statistical mechanics, polymers, dynamics and quantum calculations to code.",
    problem: "Notebook outputs can obscure proposal bias, indexing conventions, integrator steps and what was actually recomputed.",
    objective: "Turn the recorded exercises and later extensions into inspectable scientific kernels with explicit attribution.",
    contribution: "Completed and iterated the calculations, added independent Julia/React extensions and corrected the public sampler, polymer and dynamics explanations.",
    pipeline: "model parameters → seeded configuration / analytic kernel → inspectable update or arithmetic → source-versus-browser audit",
    walkthrough: "Run the Metropolis sampler, compare polymer generation modes, step through velocity Verlet, then recompute one basis-set or cation–π energy difference.",
  },
};

export function getProjectStory(project: Project) {
  return project.demo ? projectStories[project.demo] : null;
}
