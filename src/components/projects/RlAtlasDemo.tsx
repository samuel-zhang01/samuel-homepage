"use client";

import { useMemo, useState } from "react";

import { DemoWindow } from "./DemoChrome";
import styles from "./RlAtlasDemo.module.css";

const TRACKS = [
  { id: "foundations", code: "T1", label: "Foundations", range: "01–04" },
  { id: "value", code: "T2", label: "Deep value", range: "05–06" },
  { id: "policy", code: "T3", label: "Policy methods", range: "07–10" },
  { id: "matching", code: "T4", label: "Bandits + matching", range: "11–12" },
  { id: "multi-agent", code: "T5", label: "Multi-agent", range: "13" },
  { id: "offline", code: "T6", label: "Offline RL", range: "14–15" },
  { id: "model-based", code: "T7", label: "Model-based", range: "16" },
  { id: "exploration", code: "T8", label: "Exploration + meta", range: "17" },
  { id: "llm", code: "T9", label: "LLM RL", range: "18–21" },
  { id: "safety", code: "T10", label: "Safety-critical", range: "22–24" },
  { id: "audit", code: "T11", label: "Applied audit", range: "25" },
] as const;

type TrackId = (typeof TRACKS)[number]["id"];
type Disclosure = "public" | "synthetic" | "restricted";
type EvidenceFilter = "all" | "attention" | "clean";
type DisclosureFilter = "all" | Disclosure;
type TrackFilter = "all" | TrackId;

type Week = {
  number: number;
  slug: string;
  shortTitle: string;
  title: string;
  track: TrackId;
  focus: string;
  methods: readonly string[];
  project: string;
  disclosure: Disclosure;
  notesPages: number;
  executed: boolean;
  notesPdfIssue?: string;
  readingPdfIssue?: string;
};

const WEEKS: readonly Week[] = [
  {
    number: 1,
    slug: "mdps-bandits",
    shortTitle: "MDPs",
    title: "MDPs & bandits",
    track: "foundations",
    focus: "Formalise sequential decisions, policies, returns and regret before moving into control.",
    methods: ["MDPs", "ε-greedy", "UCB", "Thompson sampling"],
    project: "Bernoulli and contextual bandit testbed",
    disclosure: "public",
    notesPages: 16,
    executed: true,
    notesPdfIssue: "Overfull box (max 6.6pt); cutoff heuristic flagged page 15.",
  },
  {
    number: 2,
    slug: "bellman-dp",
    shortTitle: "Bellman",
    title: "Bellman equations & dynamic programming",
    track: "foundations",
    focus: "Turn recursive value identities into exact planning algorithms for known environments.",
    methods: ["Policy evaluation", "Value iteration", "Policy iteration", "Dynamic programming"],
    project: "Gridworld and car-rental planning",
    disclosure: "public",
    notesPages: 14,
    executed: true,
    notesPdfIssue: "Cutoff heuristic flagged page 13.",
  },
  {
    number: 3,
    slug: "monte-carlo",
    shortTitle: "Monte Carlo",
    title: "Monte Carlo methods",
    track: "foundations",
    focus: "Estimate values from complete sampled returns without a model of the environment.",
    methods: ["First-visit MC", "Exploring starts", "Importance sampling", "Control"],
    project: "Blackjack prediction and control",
    disclosure: "public",
    notesPages: 14,
    executed: true,
    notesPdfIssue: "Cutoff heuristic flagged page 13.",
  },
  {
    number: 4,
    slug: "td-sarsa-q",
    shortTitle: "TD control",
    title: "TD, SARSA & Q-learning",
    track: "foundations",
    focus: "Bootstrap from live transitions and compare on-policy with off-policy temporal-difference control.",
    methods: ["TD(0)", "SARSA", "Q-learning", "Expected SARSA"],
    project: "Cliff Walking and Taxi control",
    disclosure: "public",
    notesPages: 14,
    executed: false,
  },
  {
    number: 5,
    slug: "dqn",
    shortTitle: "DQN",
    title: "Deep Q-Networks",
    track: "value",
    focus: "Stabilise value learning with replay, target networks and practical deep-RL diagnostics.",
    methods: ["DQN", "Experience replay", "Target networks", "Double DQN"],
    project: "LunarLander DQN training run",
    disclosure: "public",
    notesPages: 14,
    executed: true,
  },
  {
    number: 6,
    slug: "rainbow-bbf",
    shortTitle: "Rainbow",
    title: "Rainbow, BBF & distributional RL",
    track: "value",
    focus: "Decompose the modern value-learning stack and measure which combined improvements matter.",
    methods: ["Rainbow", "C51", "Prioritised replay", "NoisyNets"],
    project: "Rainbow component ablation",
    disclosure: "public",
    notesPages: 15,
    executed: true,
  },
  {
    number: 7,
    slug: "policy-gradients",
    shortTitle: "REINFORCE",
    title: "Policy gradients & REINFORCE",
    track: "policy",
    focus: "Optimise a parameterised policy directly and control the variance of gradient estimates.",
    methods: ["Policy-gradient theorem", "REINFORCE", "Baselines", "Entropy bonus"],
    project: "CartPole and Acrobot policy gradients",
    disclosure: "public",
    notesPages: 16,
    executed: true,
    notesPdfIssue: "Cutoff heuristic flagged page 15.",
  },
  {
    number: 8,
    slug: "a2c-gae-trpo",
    shortTitle: "A2C / GAE",
    title: "A2C, GAE & TRPO",
    track: "policy",
    focus: "Connect actor–critic learning, advantage estimation and trust-region policy updates.",
    methods: ["A2C", "GAE", "Natural gradient", "TRPO"],
    project: "Continuous LunarLander actor–critic",
    disclosure: "public",
    notesPages: 16,
    executed: true,
    notesPdfIssue: "Overfull box (max 26.1pt); cutoff heuristic flagged pages 6 and 15.",
  },
  {
    number: 9,
    slug: "ppo",
    shortTitle: "PPO",
    title: "PPO & implementation details",
    track: "policy",
    focus: "Build clipped policy optimisation and examine the implementation details that determine stability.",
    methods: ["Clipped objective", "Value clipping", "Advantage normalisation", "Diagnostics"],
    project: "BipedalWalker PPO agent",
    disclosure: "public",
    notesPages: 15,
    executed: true,
    notesPdfIssue: "Cutoff heuristic flagged page 14.",
    readingPdfIssue: "Extended reading has an overfull box (max 27.5pt).",
  },
  {
    number: 10,
    slug: "sac-td3",
    shortTitle: "SAC / TD3",
    title: "SAC, TD3 & CrossQ",
    track: "policy",
    focus: "Compare entropy-regularised and deterministic off-policy control in continuous action spaces.",
    methods: ["SAC", "TD3", "CrossQ", "Automatic entropy tuning"],
    project: "Pendulum and Hopper continuous control",
    disclosure: "public",
    notesPages: 14,
    executed: true,
    notesPdfIssue: "Cutoff heuristic flagged page 13.",
  },
  {
    number: 11,
    slug: "contextual-bandits-ope",
    shortTitle: "Bandits / OPE",
    title: "Contextual bandits & off-policy evaluation",
    track: "matching",
    focus: "Learn contextual choices while evaluating new policies from logged, policy-biased feedback.",
    methods: ["LinUCB", "LinTS", "IPS / SNIPS", "Doubly robust OPE"],
    project: "Synthetic insurance-lead bandit",
    disclosure: "synthetic",
    notesPages: 20,
    executed: true,
    notesPdfIssue: "Overfull box (max 39.3pt).",
  },
  {
    number: 12,
    slug: "rl-ranking-matching",
    shortTitle: "Fair ranking",
    title: "RL ranking & fair matching",
    track: "matching",
    focus: "Treat ranking as a logged decision process with counterfactual evaluation and fairness constraints.",
    methods: ["Counterfactual LTR", "Slate policies", "Exposure fairness", "Two-sided matching"],
    project: "Synthetic applicant-ranking environment",
    disclosure: "synthetic",
    notesPages: 35,
    executed: true,
    notesPdfIssue: "Two overfull boxes (max 72.5pt); cutoff heuristic flagged page 5.",
  },
  {
    number: 13,
    slug: "multi-agent-alphazero",
    shortTitle: "MARL",
    title: "Multi-agent RL & AlphaZero",
    track: "multi-agent",
    focus: "Study coordination, competition and planning when multiple learning policies share an environment.",
    methods: ["MAPPO", "MADDPG", "QMIX", "AlphaZero"],
    project: "MAPPO plus Tic-Tac-Toe self-play",
    disclosure: "public",
    notesPages: 25,
    executed: true,
  },
  {
    number: 14,
    slug: "offline-rl-1",
    shortTitle: "Offline RL",
    title: "Offline RL fundamentals",
    track: "offline",
    focus: "Learn policies from fixed datasets while controlling extrapolation beyond logged support.",
    methods: ["CQL", "IQL", "AWR", "TD3+BC"],
    project: "IQL and CQL comparison",
    disclosure: "public",
    notesPages: 13,
    executed: true,
  },
  {
    number: 15,
    slug: "decision-transformer-diffusion",
    shortTitle: "DT / diffusion",
    title: "Decision Transformers & diffusion policies",
    track: "offline",
    focus: "Reframe offline decision-making as sequence modelling and generative trajectory prediction.",
    methods: ["Decision Transformer", "Return conditioning", "Diffusion policy", "Sequence models"],
    project: "Return-conditioned Decision Transformer",
    disclosure: "public",
    notesPages: 12,
    executed: true,
  },
  {
    number: 16,
    slug: "model-based",
    shortTitle: "World models",
    title: "Model-based RL",
    track: "model-based",
    focus: "Plan through learned dynamics and latent world models rather than relying only on real experience.",
    methods: ["Dreamer V3", "MuZero", "TD-MPC2", "Latent dynamics"],
    project: "Dreamer-lite world model",
    disclosure: "public",
    notesPages: 12,
    executed: true,
    notesPdfIssue: "Overfull box (max 30.7pt).",
  },
  {
    number: 17,
    slug: "exploration-meta",
    shortTitle: "Explore / meta",
    title: "Exploration & meta-RL",
    track: "exploration",
    focus: "Generate intrinsic motivation and adapt policies quickly across related tasks.",
    methods: ["RND", "ICM", "MAML", "In-context RL"],
    project: "RND exploration plus MAML adaptation",
    disclosure: "public",
    notesPages: 12,
    executed: true,
  },
  {
    number: 18,
    slug: "rlhf-ppo-llm",
    shortTitle: "RLHF",
    title: "RLHF & PPO for language models",
    track: "llm",
    focus: "Trace the alignment pipeline from preferences and reward modelling to constrained policy updates.",
    methods: ["Preference data", "Reward models", "PPO", "KL control"],
    project: "From-scratch RLHF loop and TRL recipe",
    disclosure: "public",
    notesPages: 26,
    executed: true,
    notesPdfIssue: "Overfull box (max 43.3pt); cutoff heuristic flagged page 5.",
  },
  {
    number: 19,
    slug: "dpo-zoo",
    shortTitle: "DPO zoo",
    title: "DPO, IPO, KTO, ORPO & SimPO",
    track: "llm",
    focus: "Compare direct preference objectives that avoid an explicit online RL training loop.",
    methods: ["DPO", "IPO", "KTO", "ORPO / SimPO"],
    project: "Preference-optimisation bake-off",
    disclosure: "public",
    notesPages: 26,
    executed: true,
  },
  {
    number: 20,
    slug: "grpo-rloo-rlvr",
    shortTitle: "GRPO / RLVR",
    title: "GRPO, RLOO, RLVR & process rewards",
    track: "llm",
    focus: "Use grouped baselines and verifiable rewards to improve reasoning without a large learned critic.",
    methods: ["GRPO", "RLOO", "RLVR", "Process reward models"],
    project: "Verifier-rewarded mathematics task",
    disclosure: "public",
    notesPages: 20,
    executed: true,
    notesPdfIssue: "Overfull box (max 7.4pt); cutoff heuristic flagged page 4.",
  },
  {
    number: 21,
    slug: "reward-hacking-oversight",
    shortTitle: "Oversight",
    title: "Reward hacking & scalable oversight",
    track: "llm",
    focus: "Probe specification gaming and design oversight that remains useful as capabilities increase.",
    methods: ["Reward hacking", "Constitutional feedback", "Oversight", "Regularisation"],
    project: "Reward-hacking lab and CAI study",
    disclosure: "public",
    notesPages: 16,
    executed: true,
  },
  {
    number: 22,
    slug: "cmdp-cpo-lagrangian",
    shortTitle: "CMDPs",
    title: "CMDPs, CPO & PPO-Lagrangian",
    track: "safety",
    focus: "Represent safety as explicit constraints and optimise reward subject to measurable cost budgets.",
    methods: ["CMDPs", "CPO", "Lagrangian methods", "PPO-Lag"],
    project: "Constrained PPO environment",
    disclosure: "public",
    notesPages: 17,
    executed: true,
  },
  {
    number: 23,
    slug: "safe-exploration-shielding-robust",
    shortTitle: "Shielding",
    title: "Safe exploration, shielding & robust RL",
    track: "safety",
    focus: "Interpose formal safety rules and stress policies against uncertainty before deployment.",
    methods: ["LTL shielding", "Robust MDPs", "Risk sensitivity", "Safe exploration"],
    project: "Temporal-logic safety shield",
    disclosure: "public",
    notesPages: 15,
    executed: true,
  },
  {
    number: 24,
    slug: "capstone-safe-matching",
    shortTitle: "Safe matching",
    title: "Capstone: safe candidate matching",
    track: "safety",
    focus: "Join offline learning, constrained online policy updates and auditing in a synthetic matching system.",
    methods: ["Offline IQL", "PPO-Lagrangian", "Fairness audit", "Release gates"],
    project: "Synthetic safe-matching CLI",
    disclosure: "synthetic",
    notesPages: 15,
    executed: true,
  },
  {
    number: 25,
    slug: "restricted-applied-audit",
    shortTitle: "Applied audit",
    title: "RL enhancement audit",
    track: "audit",
    focus: "Map a real decision system to the preceding RL toolbox through a read-only, deployment-gated audit.",
    methods: ["Read-only audit", "Off-policy evaluation", "Constrained reranking", "Go / no-go gates"],
    project: "Sanitised synthetic audit harness",
    disclosure: "restricted",
    notesPages: 29,
    executed: true,
    notesPdfIssue: "Five overfull boxes (max 10.9pt).",
  },
];

const TRACK_BY_ID = Object.fromEntries(TRACKS.map((track) => [track.id, track])) as Record<
  TrackId,
  (typeof TRACKS)[number]
>;

const DISCLOSURE_META: Record<Disclosure, { label: string; shortLabel: string; note: string }> = {
  public: {
    label: "Public curriculum bundle",
    shortLabel: "PUBLIC",
    note: "Educational notes, toy environments and implementation evidence are safe to describe. No personal records are used here.",
  },
  synthetic: {
    label: "Public · synthetic data only",
    shortLabel: "SYNTHETIC",
    note: "The application thread is represented with generated examples. No insurance lead, applicant or production event data is exposed.",
  },
  restricted: {
    label: "Restricted applied audit",
    shortLabel: "RESTRICTED",
    note: "Only the learning objective, method classes and synthetic harness are shown. Production code, paths, records and operational details remain withheld.",
  },
};

type ArtifactState = "recorded" | "attention" | "missing" | "present";

type Artifact = {
  label: string;
  state: ArtifactState;
  value: string;
  detail: string;
};

function weekHasAttention(week: Week) {
  return !week.executed || Boolean(week.notesPdfIssue || week.readingPdfIssue);
}

function getArtifacts(week: Week): Artifact[] {
  return [
    {
      label: "Lecture notes",
      state: week.notesPdfIssue ? "attention" : "recorded",
      value: week.notesPdfIssue ? "CHECK MARGINS" : "RECORDED OK",
      detail: `${week.notesPages} pages${week.notesPdfIssue ? " · margin scan flagged" : " · PDF present"}`,
    },
    {
      label: "Extended reading",
      state: week.readingPdfIssue ? "attention" : "recorded",
      value: week.readingPdfIssue ? "CHECK MARGINS" : "RECORDED OK",
      detail: week.readingPdfIssue ?? "PDF present in QA snapshot",
    },
    {
      label: "Source workbook",
      state: "present",
      value: "PRESENT",
      detail: "Graded Jupyter workbook is indexed",
    },
    {
      label: "Executed workbook",
      state: week.executed ? "recorded" : "missing",
      value: week.executed ? "RECORDED OK" : "NOT FOUND",
      detail: week.executed
        ? "Execution artifact recorded by QA"
        : "QA table contains “–”; source workbook still exists",
    },
    {
      label: "Test suite",
      state: "recorded",
      value: "RECORDED OK",
      detail: "Smoke and solution tests recorded as passing",
    },
    {
      label: "Mini-project",
      state: "present",
      value: "PRESENT",
      detail: week.project,
    },
  ];
}

function matchesSearch(week: Week, query: string) {
  if (!query.trim()) return true;
  const track = TRACK_BY_ID[week.track];
  const haystack = [
    week.title,
    week.shortTitle,
    week.focus,
    week.project,
    week.methods.join(" "),
    track.label,
    `week ${week.number}`,
  ]
    .join(" ")
    .toLocaleLowerCase();

  return haystack.includes(query.trim().toLocaleLowerCase());
}

function formatWeek(number: number) {
  return String(number).padStart(2, "0");
}

export function RlAtlasDemo() {
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>("all");
  const [disclosureFilter, setDisclosureFilter] = useState<DisclosureFilter>("all");
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(1);

  const filteredWeeks = useMemo(
    () =>
      WEEKS.filter((week) => {
        const matchesTrack = trackFilter === "all" || week.track === trackFilter;
        const matchesDisclosure = disclosureFilter === "all" || week.disclosure === disclosureFilter;
        const matchesEvidence =
          evidenceFilter === "all" ||
          (evidenceFilter === "attention" ? weekHasAttention(week) : !weekHasAttention(week));

        return matchesTrack && matchesDisclosure && matchesEvidence && matchesSearch(week, query);
      }),
    [disclosureFilter, evidenceFilter, query, trackFilter],
  );

  const selectedWeek =
    filteredWeeks.find((week) => week.number === selectedWeekNumber) ?? filteredWeeks[0] ?? null;
  const visibleNumbers = new Set(filteredWeeks.map((week) => week.number));
  const flaggedPdfCount = WEEKS.reduce(
    (total, week) => total + Number(Boolean(week.notesPdfIssue)) + Number(Boolean(week.readingPdfIssue)),
    0,
  );
  const executedCount = WEEKS.filter((week) => week.executed).length;

  function resetFilters() {
    setQuery("");
    setTrackFilter("all");
    setEvidenceFilter("all");
    setDisclosureFilter("all");
  }

  return (
    <DemoWindow
      appName="RL Atlas 1.0"
      title="STUDY-RL Learning Atlas"
      status="QA SNAPSHOT · REVIEW"
      statusTone="working"
      className={styles.atlasWindow}
      footer={
        <>
          <span>{filteredWeeks.length} of 25 modules visible</span>
          <span>{selectedWeek ? `Selected: Week ${formatWeek(selectedWeek.number)}` : "No matching module"}</span>
        </>
      }
    >
      <div className={styles.atlasIntro}>
        <div className={styles.atlasMark} aria-hidden="true">
          <span>π</span>
          <i />
        </div>
        <div>
          <span className={styles.kicker}>BROWSER-NATIVE CURRICULUM MAP</span>
          <strong>Twenty-four core weeks. One bounded applied audit.</strong>
          <p>
            Browse the sequence, inspect repository evidence, and see exactly where the public learning
            boundary ends. This view does not execute training code or expose source datasets.
          </p>
        </div>
        <a
          className={styles.syllabusButton}
          href="/projects/study-rl/syllabus.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden="true">▤</span>
          Open syllabus PDF
          <small>Complete curriculum map ↗</small>
        </a>
      </div>

      <section className={styles.snapshotPanel} aria-labelledby="snapshot-heading">
        <div className={styles.snapshotHeading}>
          <span className={styles.sectionIcon} aria-hidden="true">✓</span>
          <div>
            <span className={styles.kicker}>REPOSITORY EVIDENCE</span>
            <h3 id="snapshot-heading">Bundle health, not learner completion</h3>
          </div>
        </div>
        <div className={styles.metricStrip}>
          <article>
            <span>MODULES INDEXED</span>
            <strong>25</strong>
            <small>24 core + 1 audit</small>
          </article>
          <article className={styles.metricCaution}>
            <span>EXECUTED NOTEBOOKS</span>
            <strong>{executedCount}/25</strong>
            <small>Week 04 missing</small>
          </article>
          <article>
            <span>TEST SUITES</span>
            <strong>25/25</strong>
            <small>recorded OK</small>
          </article>
          <article className={styles.metricCaution}>
            <span>PDF ATTENTION</span>
            <strong>{flaggedPdfCount}</strong>
            <small>documents flagged</small>
          </article>
          <article className={styles.metricNeutral}>
            <span>LEARNER PROGRESS</span>
            <strong>—</strong>
            <small>untracked template</small>
          </article>
        </div>
        <div className={styles.snapshotCaveat} role="note">
          <span aria-hidden="true">!</span>
          <p>
            <strong>Snapshot caveat:</strong> the checked-in QA tables include no generated-at time or commit.
            “Recorded OK” is historical evidence, not a live rerun. PDF flags are margin-scan heuristics and
            should be visually reviewed; the prose index’s “all notebooks execute” claim conflicts with the
            Week 04 row.
          </p>
        </div>
      </section>

      <div className={styles.filterBar} role="search" aria-label="Filter curriculum modules">
        <label className={styles.searchField}>
          <span>Find a method or project</span>
          <span className={styles.inputWrap}>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. PPO, matching, safety"
            />
          </span>
        </label>
        <label>
          <span>Track</span>
          <select value={trackFilter} onChange={(event) => setTrackFilter(event.target.value as TrackFilter)}>
            <option value="all">All 11 tracks</option>
            {TRACKS.map((track) => (
              <option key={track.id} value={track.id}>{track.code} · {track.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Evidence</span>
          <select
            value={evidenceFilter}
            onChange={(event) => setEvidenceFilter(event.target.value as EvidenceFilter)}
          >
            <option value="all">Any QA state</option>
            <option value="attention">Needs attention</option>
            <option value="clean">No recorded flags</option>
          </select>
        </label>
        <label>
          <span>Disclosure</span>
          <select
            value={disclosureFilter}
            onChange={(event) => setDisclosureFilter(event.target.value as DisclosureFilter)}
          >
            <option value="all">All boundaries</option>
            <option value="public">Public curriculum</option>
            <option value="synthetic">Synthetic only</option>
            <option value="restricted">Restricted audit</option>
          </select>
        </label>
        <button className={styles.resetButton} type="button" onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className={styles.atlasWorkspace}>
        <section className={styles.topologyPanel} aria-labelledby="topology-heading">
          <header className={styles.panelTitleBar}>
            <div>
              <span className={styles.kicker}>CURRICULUM TOPOLOGY</span>
              <h3 id="topology-heading">From decisions to deployment gates</h3>
            </div>
            <span>{filteredWeeks.length} shown</span>
          </header>
          <div className={styles.legend} aria-label="Map legend">
            <span><i className={styles.legendRecorded} /> QA recorded</span>
            <span><i className={styles.legendAttention} /> review evidence</span>
            <span><i className={styles.legendRestricted} /> restricted boundary</span>
          </div>

          {filteredWeeks.length > 0 ? (
            <ol className={styles.trackList}>
              {TRACKS.map((track) => {
                const trackWeeks = WEEKS.filter(
                  (week) => week.track === track.id && visibleNumbers.has(week.number),
                );
                if (trackWeeks.length === 0) return null;

                return (
                  <li className={`${styles.trackRow} ${track.id === "foundations" ? "" : styles[`track_${track.id}`]}`} key={track.id}>
                    <div className={styles.trackLabel}>
                      <span>{track.code}</span>
                      <strong>{track.label}</strong>
                      <small>WEEKS {track.range}</small>
                    </div>
                    <div className={styles.weekRail}>
                      {trackWeeks.map((week) => {
                        const isSelected = week.number === selectedWeek?.number;
                        const attention = weekHasAttention(week);
                        return (
                          <button
                            className={`${styles.weekNode} ${isSelected ? styles.weekNodeSelected : ""} ${
                              attention ? styles.weekNodeAttention : ""
                            } ${week.disclosure === "restricted" ? styles.weekNodeRestricted : ""}`}
                            key={week.number}
                            type="button"
                            onClick={() => setSelectedWeekNumber(week.number)}
                            aria-pressed={isSelected}
                            aria-label={`Week ${week.number}: ${week.title}. ${
                              attention ? "QA evidence needs attention." : "No recorded QA flags."
                            } ${DISCLOSURE_META[week.disclosure].label}.`}
                          >
                            <span>{formatWeek(week.number)}</span>
                            <small>{week.shortTitle}</small>
                            <i aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className={styles.emptyState}>
              <span aria-hidden="true">?</span>
              <strong>No modules match these filters</strong>
              <p>Clear one or more filters to restore the curriculum map.</p>
              <button type="button" onClick={resetFilters}>Show all 25 weeks</button>
            </div>
          )}
        </section>

        <aside className={styles.detailPanel} aria-label="Selected week evidence">
          {selectedWeek ? (
            <>
              <p className={styles.srOnly} aria-live="polite">
                Selected Week {selectedWeek.number}: {selectedWeek.title}
              </p>
              <header className={styles.weekHeader}>
                <span className={styles.weekStamp} aria-hidden="true">
                  <small>WEEK</small>
                  {formatWeek(selectedWeek.number)}
                </span>
                <div>
                  <span className={styles.weekTrack}>
                    {TRACK_BY_ID[selectedWeek.track].code} · {TRACK_BY_ID[selectedWeek.track].label}
                  </span>
                  <h3>{selectedWeek.title}</h3>
                </div>
              </header>

              <div className={`${styles.disclosureBanner} ${styles[`disclosure_${selectedWeek.disclosure}`]}`}>
                <span aria-hidden="true">{selectedWeek.disclosure === "restricted" ? "▣" : "◆"}</span>
                <strong>{DISCLOSURE_META[selectedWeek.disclosure].label}</strong>
              </div>

              <div className={styles.weekCopy}>
                <p>{selectedWeek.focus}</p>
                <div className={styles.methodList} aria-label="Methods covered">
                  {selectedWeek.methods.map((method) => <span key={method}>{method}</span>)}
                </div>
                <dl className={styles.projectLine}>
                  <dt>BUILD</dt>
                  <dd>{selectedWeek.project}</dd>
                </dl>
              </div>

              <section className={styles.artifactPanel} aria-labelledby="artifact-heading">
                <header>
                  <div>
                    <span className={styles.kicker}>ARTIFACT MANIFEST</span>
                    <h4 id="artifact-heading">What the snapshot actually records</h4>
                  </div>
                  <span className={styles.artifactCount}>6 ITEMS</span>
                </header>
                <ul>
                  {getArtifacts(selectedWeek).map((artifact) => (
                    <li key={artifact.label}>
                      <span className={`${styles.artifactState} ${styles[`artifact_${artifact.state}`]}`}>
                        <i aria-hidden="true" />
                        {artifact.value}
                      </span>
                      <div>
                        <strong>{artifact.label}</strong>
                        <small>{artifact.detail}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {selectedWeek.number === 4 && (
                <div className={styles.executionWarning} role="alert">
                  <span aria-hidden="true">!</span>
                  <p>
                    <strong>Execution artifact missing.</strong> The source workbook and passing tests are
                    present, but <code>qa_report.tsv</code> records “–” for the executed notebook. This atlas
                    does not upgrade that status from the broader README claim.
                  </p>
                </div>
              )}

              {(selectedWeek.notesPdfIssue || selectedWeek.readingPdfIssue) && (
                <div className={styles.pdfWarning} role="note">
                  <span aria-hidden="true">▤</span>
                  <div>
                    <strong>PDF review queue</strong>
                    {selectedWeek.notesPdfIssue && <p><b>Notes:</b> {selectedWeek.notesPdfIssue}</p>}
                    {selectedWeek.readingPdfIssue && <p><b>Reading:</b> {selectedWeek.readingPdfIssue}</p>}
                    <small>Automated geometry flags can include false positives; inspect the rendered page.</small>
                  </div>
                </div>
              )}

              <div className={`${styles.boundaryNote} ${selectedWeek.disclosure === "public" ? "" : styles[`boundary_${selectedWeek.disclosure}`]}`}>
                <span className={styles.boundaryIcon} aria-hidden="true">
                  {selectedWeek.disclosure === "restricted" ? "×" : "✓"}
                </span>
                <div>
                  <strong>Disclosure boundary</strong>
                  <p>{DISCLOSURE_META[selectedWeek.disclosure].note}</p>
                </div>
              </div>

              <footer className={styles.detailFooter}>
                <span>Source: checked-in index + QA tables</span>
                <a href="/projects/study-rl/syllabus.pdf" target="_blank" rel="noreferrer">
                  Syllabus PDF <span aria-hidden="true">↗</span>
                </a>
              </footer>
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <span aria-hidden="true">⌕</span>
              <strong>Nothing selected</strong>
              <p>The detail inspector will return when a module matches.</p>
            </div>
          )}
        </aside>
      </div>
    </DemoWindow>
  );
}
