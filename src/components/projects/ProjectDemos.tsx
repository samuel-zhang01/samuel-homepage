"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

import type { ProjectDemoId } from "@/data/projects";
import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./ProjectDemos.module.css";

export { DemoWindow, MacButton } from "./DemoChrome";

export const PROJECT_DEMO_IDS = [
  "cv-keywords",
  "finance",
  "bandits",
  "scheduling",
] as const satisfies readonly ProjectDemoId[];

export type CoreProjectDemoId = (typeof PROJECT_DEMO_IDS)[number];

export type { ProjectDemoId } from "@/data/projects";

const SAMPLE_CV = `Product-minded data scientist with experience shipping internal analytics tools.

• Built Python and SQL pipelines for repeatable data analysis.
• Trained and evaluated machine-learning models using scikit-learn.
• Presented experimental results to technical and non-technical partners.
• Delivered containerised applications with Docker and Git.`;

const SAMPLE_JOB = `We are looking for an applied machine-learning engineer who can solve ambiguous problems with reliable products. The role uses Python, SQL, scikit-learn and Docker. You will design experiments, communicate with stakeholders, deploy services, and monitor model performance. Experience with cloud infrastructure is useful.`;

const KEYWORD_LIBRARY = [
  { label: "Python", group: "Engineering", variants: ["python"] },
  { label: "SQL", group: "Engineering", variants: ["sql", "postgresql", "postgres"] },
  { label: "Docker", group: "Engineering", variants: ["docker", "containerised", "containerized"] },
  { label: "Cloud", group: "Engineering", variants: ["cloud", "aws", "azure", "gcp"] },
  { label: "Machine learning", group: "Modelling", variants: ["machine learning", "machine-learning", "ml model"] },
  { label: "scikit-learn", group: "Modelling", variants: ["scikit-learn", "sklearn"] },
  { label: "Model monitoring", group: "Modelling", variants: ["model monitoring", "monitor model", "drift monitoring"] },
  { label: "Experiment design", group: "Research", variants: ["design experiments", "experiment design", "experimental"] },
  { label: "Stakeholder communication", group: "Collaboration", variants: ["stakeholder", "non-technical", "communicate"] },
  { label: "Deployment", group: "Delivery", variants: ["deploy", "deployment", "shipping", "shipped"] },
] as const;

type KeywordReport = {
  requested: (typeof KEYWORD_LIBRARY)[number][];
  matched: (typeof KEYWORD_LIBRARY)[number][];
  missing: (typeof KEYWORD_LIBRARY)[number][];
  score: number;
};

function includesVariant(text: string, variants: readonly string[]) {
  const normalisedText = text.toLocaleLowerCase();
  return variants.some((variant) => normalisedText.includes(variant));
}

function analyseKeywords(cv: string, job: string): KeywordReport {
  const requested = KEYWORD_LIBRARY.filter((keyword) => includesVariant(job, keyword.variants));
  const matched = requested.filter((keyword) => includesVariant(cv, keyword.variants));
  const missing = requested.filter((keyword) => !includesVariant(cv, keyword.variants));
  const score = requested.length === 0 ? 0 : Math.round((matched.length / requested.length) * 100);

  return { requested, matched, missing, score };
}

export function CvKeywordDemo() {
  const [cvText, setCvText] = useState(SAMPLE_CV);
  const [jobText, setJobText] = useState(SAMPLE_JOB);
  const [analysedText, setAnalysedText] = useState({ cv: SAMPLE_CV, job: SAMPLE_JOB });
  const report = useMemo(
    () => analyseKeywords(analysedText.cv, analysedText.job),
    [analysedText],
  );
  const isDirty = cvText !== analysedText.cv || jobText !== analysedText.job;

  function runAnalysis() {
    setAnalysedText({ cv: cvText, job: jobText });
  }

  function resetSample() {
    setCvText(SAMPLE_CV);
    setJobText(SAMPLE_JOB);
    setAnalysedText({ cv: SAMPLE_CV, job: SAMPLE_JOB });
  }

  function clearAll() {
    setCvText("");
    setJobText("");
    setAnalysedText({ cv: "", job: "" });
  }

  return (
    <DemoWindow
      appName="Keyword Assistant"
      title="CV Keyword Automator"
      status="LOCAL-ONLY ANALYSIS"
      purpose="Compare role language with explicit CV evidence without creating unsupported claims."
      tryThis="Edit the role text and run the analysis."
      watchFor="Requested signals and evidence gaps update locally."
      statusTone="safe"
      footer={
        <>
          <span>{report.requested.length} role signals found</span>
          <span>{isDirty ? "Changes waiting to be analysed" : "Analysis is current"}</span>
        </>
      }
    >
      <div className={styles.notice} role="note">
        <span className={styles.noticeIcon} aria-hidden="true">✓</span>
        <div>
          <strong>Private by design</strong>
          <p>This demonstration runs entirely in your browser. Text is neither uploaded nor saved.</p>
        </div>
      </div>

      <div className={styles.editorGrid}>
        <label className={styles.fieldPanel}>
          <span className={styles.fieldHeading}>
            <strong>1. Sanitised CV text</strong>
            <span>{cvText.length} characters</span>
          </span>
          <textarea
            value={cvText}
            onChange={(event) => setCvText(event.target.value)}
            spellCheck="true"
            aria-describedby="cv-input-help"
          />
          <small id="cv-input-help">Paste skills and experience only. Remove names and contact details first.</small>
        </label>

        <label className={styles.fieldPanel}>
          <span className={styles.fieldHeading}>
            <strong>2. Job description</strong>
            <span>{jobText.length} characters</span>
          </span>
          <textarea
            value={jobText}
            onChange={(event) => setJobText(event.target.value)}
            spellCheck="true"
          />
          <small>Role signals are detected against a documented keyword library shown below.</small>
        </label>
      </div>

      <div className={styles.actionRow}>
        <MacButton onClick={runAnalysis} primary disabled={!isDirty || !cvText.trim() || !jobText.trim()}>
          Analyse match
        </MacButton>
        <MacButton onClick={resetSample}>Load safe sample</MacButton>
        <MacButton onClick={clearAll}>Clear text</MacButton>
      </div>

      <section className={styles.resultPanel} aria-live="polite" aria-label="Keyword analysis results">
        <div className={styles.scoreCard}>
          <div
            className={styles.scoreDial}
            role="meter"
            aria-label="Keyword coverage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={report.score}
            style={{ background: `conic-gradient(#11177a ${report.score}%, #d3d3ce 0)` }}
          >
            <span>{report.score}%</span>
          </div>
          <div>
            <span className={styles.resultLabel}>KEYWORD COVERAGE</span>
            <strong>{report.matched.length} of {report.requested.length} signals</strong>
            <p>Use this as an editing prompt, not as a hiring or candidate-ranking decision.</p>
          </div>
        </div>

        <div className={styles.keywordColumns}>
          <div>
            <span className={styles.resultLabel}>FOUND IN BOTH</span>
            <div className={styles.chipList}>
              {report.matched.length ? report.matched.map((keyword) => (
                <span className={styles.matchChip} key={keyword.label}>✓ {keyword.label}</span>
              )) : <em>None yet</em>}
            </div>
          </div>
          <div>
            <span className={styles.resultLabel}>WORTH REVIEWING</span>
            <div className={styles.chipList}>
              {report.missing.length ? report.missing.map((keyword) => (
                <span className={styles.missingChip} key={keyword.label}>+ {keyword.label}</span>
              )) : <em>No gaps in the detected set</em>}
            </div>
          </div>
        </div>
      </section>
    </DemoWindow>
  );
}

type StatementTransaction = {
  id: number;
  age: number;
  date: string;
  merchant: string;
  category: "Income" | "Housing" | "Food" | "Transport" | "Tools" | "Other";
  amount: number;
  confidence: number;
};

const SYNTHETIC_TRANSACTIONS: StatementTransaction[] = [
  { id: 1, age: 2, date: "28 JUL", merchant: "ACME STUDIO PAYROLL", category: "Income", amount: 4850, confidence: 99 },
  { id: 2, age: 4, date: "26 JUL", merchant: "NORTHSTAR LETTINGS", category: "Housing", amount: -1425, confidence: 98 },
  { id: 3, age: 7, date: "23 JUL", merchant: "JUNCTION MARKET", category: "Food", amount: -73.24, confidence: 94 },
  { id: 4, age: 12, date: "18 JUL", merchant: "CITYLINE TRANSIT", category: "Transport", amount: -42.5, confidence: 97 },
  { id: 5, age: 18, date: "12 JUL", merchant: "MODEL HOSTING LAB", category: "Tools", amount: -96, confidence: 89 },
  { id: 6, age: 27, date: "03 JUL", merchant: "RIVER CAFE", category: "Food", amount: -31.8, confidence: 92 },
  { id: 7, age: 36, date: "24 JUN", merchant: "ACME STUDIO PAYROLL", category: "Income", amount: 4850, confidence: 99 },
  { id: 8, age: 39, date: "21 JUN", merchant: "NORTHSTAR LETTINGS", category: "Housing", amount: -1425, confidence: 98 },
  { id: 9, age: 51, date: "09 JUN", merchant: "CLOUD COMPUTE CO", category: "Tools", amount: -128.4, confidence: 91 },
  { id: 10, age: 64, date: "27 MAY", merchant: "CITYLINE TRANSIT", category: "Transport", amount: -39.2, confidence: 96 },
  { id: 11, age: 72, date: "19 MAY", merchant: "JUNCTION MARKET", category: "Food", amount: -88.14, confidence: 95 },
  { id: 12, age: 86, date: "05 MAY", merchant: "REFERENCE REFUND", category: "Other", amount: 125, confidence: 84 },
];

const CASH_FLOW_30 = [
  { label: "W1", income: 0, spend: 310 },
  { label: "W2", income: 4850, spend: 1425 },
  { label: "W3", income: 0, spend: 212 },
  { label: "W4", income: 0, spend: 164 },
];

const CASH_FLOW_90 = [
  { label: "MAY", income: 4975, spend: 1701 },
  { label: "JUN", income: 4850, spend: 1719 },
  { label: "JUL", income: 4850, spend: 1669 },
];

function pounds(value: number, showSign = false) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    signDisplay: showSign ? "always" : "auto",
  }).format(value);
}

export function FinanceIntelligenceDemo() {
  const [range, setRange] = useState<30 | 90>(30);
  const [category, setCategory] = useState<"All" | StatementTransaction["category"]>("All");
  const [query, setQuery] = useState("");
  const filteredTransactions = useMemo(() => {
    const cleanQuery = query.trim().toLocaleLowerCase();
    return SYNTHETIC_TRANSACTIONS.filter((transaction) => (
      transaction.age <= range
      && (category === "All" || transaction.category === category)
      && (!cleanQuery || transaction.merchant.toLocaleLowerCase().includes(cleanQuery))
    ));
  }, [category, query, range]);
  const rangeTransactions = useMemo(
    () => SYNTHETIC_TRANSACTIONS.filter((transaction) => transaction.age <= range),
    [range],
  );
  const income = rangeTransactions.reduce((sum, transaction) => sum + Math.max(0, transaction.amount), 0);
  const spend = Math.abs(rangeTransactions.reduce((sum, transaction) => sum + Math.min(0, transaction.amount), 0));
  const net = income - spend;
  const outflowShare = income === 0 ? 0 : Math.round((spend / income) * 100);
  const recurring = range === 30 ? 1649 : 4947;
  const cashFlow = range === 30 ? CASH_FLOW_30 : CASH_FLOW_90;
  const maxFlow = Math.max(...cashFlow.flatMap((period) => [period.income, period.spend]));

  return (
    <DemoWindow
      appName="Statement Intelligence"
      title="Bank Statement Explorer"
      status="100% SYNTHETIC DATA"
      purpose="Explore how normalised statement rows support auditable household-finance views."
      tryThis="Change the date or transaction filters."
      watchFor="The visible ledger and summaries update over fictional data."
      statusTone="safe"
      footer={
        <>
          <span>{filteredTransactions.length} of {rangeTransactions.length} entries shown</span>
          <span>No bank data, credentials, or personal details</span>
        </>
      }
    >
      <div className={`${styles.notice} ${styles.syntheticNotice}`} role="note">
        <span className={styles.noticeIcon} aria-hidden="true">S</span>
        <div>
          <strong>Safe portfolio mode</strong>
          <p>Every name, amount, balance and transaction below is invented for this interface.</p>
        </div>
      </div>

      <div className={styles.toolbar} aria-label="Statement filters">
        <div className={styles.segmented} aria-label="Statement period">
          <button className={range === 30 ? styles.selectedSegment : ""} onClick={() => setRange(30)} aria-pressed={range === 30}>30 days</button>
          <button className={range === 90 ? styles.selectedSegment : ""} onClick={() => setRange(90)} aria-pressed={range === 90}>90 days</button>
        </div>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
            <option>All</option>
            <option>Income</option>
            <option>Housing</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Tools</option>
            <option>Other</option>
          </select>
        </label>
        <label className={styles.searchField}>
          <span>Find merchant</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type to filter…" />
        </label>
      </div>

      <div className={styles.metricGrid}>
        <article>
          <span>INFLOWS</span>
          <strong>{pounds(income)}</strong>
          <small>{range}-day synthetic total</small>
        </article>
        <article>
          <span>OUTFLOWS</span>
          <strong>{pounds(spend)}</strong>
          <small>{outflowShare}% of inflows</small>
        </article>
        <article className={styles.highlightMetric}>
          <span>NET CASH FLOW</span>
          <strong>{pounds(net, true)}</strong>
          <small>After classified spending</small>
        </article>
        <article>
          <span>RECURRING</span>
          <strong>{pounds(recurring)}</strong>
          <small>{range === 30 ? 3 : 7} patterns detected</small>
        </article>
      </div>

      <div className={styles.financeSplit}>
        <section className={styles.insetPanel} aria-labelledby="cash-flow-heading">
          <div className={styles.panelHeading}>
            <div><span>MODEL VIEW</span><h3 id="cash-flow-heading">Cash-flow rhythm</h3></div>
            <div className={styles.chartLegend}><span className={styles.incomeKey}>In</span><span className={styles.spendKey}>Out</span></div>
          </div>
          <div className={styles.cashChart} role="img" aria-label={`Synthetic inflow and outflow chart for ${range} days`}>
            {cashFlow.map((period) => (
              <div className={styles.cashPeriod} key={period.label}>
                <div className={styles.barPair}>
                  <span className={styles.incomeBar} style={{ height: `${Math.max(3, (period.income / maxFlow) * 100)}%` }} title={`Income ${pounds(period.income)}`} />
                  <span className={styles.spendBar} style={{ height: `${Math.max(3, (period.spend / maxFlow) * 100)}%` }} title={`Spend ${pounds(period.spend)}`} />
                </div>
                <strong>{period.label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.insetPanel} aria-labelledby="signals-heading">
          <div className={styles.panelHeading}>
            <div><span>EXPLAINABLE OUTPUT</span><h3 id="signals-heading">Detected signals</h3></div>
          </div>
          <ul className={styles.signalList}>
            <li><span className={styles.signalGood}>OK</span><div><strong>Income is regular</strong><p>Two monthly payments match in amount and timing.</p></div></li>
            <li><span className={styles.signalInfo}>i</span><div><strong>Tools spend changed</strong><p>The latest synthetic hosting charge is 25% below the prior one.</p></div></li>
            <li><span className={styles.signalGood}>OK</span><div><strong>No duplicate charges</strong><p>Merchant, amount and date checks found no likely duplicates.</p></div></li>
          </ul>
        </section>
      </div>

      <section className={styles.tablePanel} aria-labelledby="ledger-heading">
        <div className={styles.panelHeading}>
          <div><span>AUTOMATED CLASSIFICATION</span><h3 id="ledger-heading">Synthetic ledger</h3></div>
          {(category !== "All" || query) && <MacButton onClick={() => { setCategory("All"); setQuery(""); }}>Reset filter</MacButton>}
        </div>
        <div className={styles.tableScroller}>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Confidence</th><th>Amount</th></tr></thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td><strong>{transaction.merchant}</strong></td>
                  <td><span className={styles.categoryTag}>{transaction.category}</span></td>
                  <td><span className={styles.confidence}>{transaction.confidence}%</span></td>
                  <td className={transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount}>{pounds(transaction.amount, true)}</td>
                </tr>
              ))}
              {!filteredTransactions.length && <tr><td colSpan={5} className={styles.emptyTable}>No synthetic entries match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </DemoWindow>
  );
}

type BanditArm = {
  id: string;
  label: string;
  hint: string;
  chance: number;
  reward: number;
};

type BanditStat = {
  pulls: number;
  wins: number;
  reward: number;
};

type BanditEvent = {
  id: number;
  armId: string;
  armLabel: string;
  reward: number;
  mode: "initialise" | "explore" | "exploit";
};

const BANDIT_ENVIRONMENTS = {
  campaigns: [
    { id: "a", label: "Concept A", hint: "Minimal", chance: 0.14, reward: 1 },
    { id: "b", label: "Concept B", hint: "Social proof", chance: 0.23, reward: 1 },
    { id: "c", label: "Concept C", hint: "Product-led", chance: 0.31, reward: 1 },
    { id: "d", label: "Concept D", hint: "Editorial", chance: 0.18, reward: 1 },
  ],
  treatments: [
    { id: "a", label: "Route A", hint: "Baseline", chance: 0.42, reward: 1 },
    { id: "b", label: "Route B", hint: "Short", chance: 0.56, reward: 1 },
    { id: "c", label: "Route C", hint: "Guided", chance: 0.49, reward: 1 },
    { id: "d", label: "Route D", hint: "Adaptive", chance: 0.63, reward: 1 },
  ],
} satisfies Record<string, BanditArm[]>;

type BanditEnvironment = keyof typeof BANDIT_ENVIRONMENTS;

function emptyBanditStats(arms: BanditArm[]): Record<string, BanditStat> {
  return Object.fromEntries(arms.map((arm) => [arm.id, { pulls: 0, wins: 0, reward: 0 }]));
}

function chooseArm(
  arms: BanditArm[],
  stats: Record<string, BanditStat>,
  epsilon: number,
  random: () => number,
) {
  const unexplored = arms.find((arm) => stats[arm.id].pulls === 0);
  if (unexplored) return { arm: unexplored, mode: "initialise" as const };
  if (random() < epsilon) {
    return { arm: arms[Math.floor(random() * arms.length)], mode: "explore" as const };
  }

  const arm = [...arms].sort((left, right) => {
    const leftMean = stats[left.id].reward / stats[left.id].pulls;
    const rightMean = stats[right.id].reward / stats[right.id].pulls;
    return rightMean - leftMean;
  })[0];

  return { arm, mode: "exploit" as const };
}

function simulateBandit(
  arms: BanditArm[],
  startingStats: Record<string, BanditStat>,
  epsilon: number,
  count: number,
  eventOffset: number,
  random: () => number,
) {
  const stats = Object.fromEntries(
    Object.entries(startingStats).map(([id, stat]) => [id, { ...stat }]),
  ) as Record<string, BanditStat>;
  const events: BanditEvent[] = [];

  for (let round = 0; round < count; round += 1) {
    const { arm, mode } = chooseArm(arms, stats, epsilon, random);
    const won = random() < arm.chance;
    const reward = won ? arm.reward : 0;
    stats[arm.id].pulls += 1;
    stats[arm.id].wins += won ? 1 : 0;
    stats[arm.id].reward += reward;
    events.push({
      id: eventOffset + round + 1,
      armId: arm.id,
      armLabel: arm.label,
      reward,
      mode,
    });
  }

  return { stats, events };
}

export function RlBanditDemo() {
  const [environment, setEnvironment] = useState<BanditEnvironment>("campaigns");
  const arms = BANDIT_ENVIRONMENTS[environment];
  const [epsilon, setEpsilon] = useState(20);
  const [stats, setStats] = useState<Record<string, BanditStat>>(() => emptyBanditStats(arms));
  const [history, setHistory] = useState<BanditEvent[]>([]);
  const [revealOdds, setRevealOdds] = useState(false);
  const randomState = useRef(1_973_111);
  const totalPulls = Object.values(stats).reduce((sum, stat) => sum + stat.pulls, 0);
  const totalReward = Object.values(stats).reduce((sum, stat) => sum + stat.reward, 0);
  const bestArm = [...arms].sort((left, right) => right.chance - left.chance)[0];
  const expectedOracleReward = totalPulls * bestArm.chance * bestArm.reward;
  const expectedPolicyReward = arms.reduce(
    (sum, arm) => sum + stats[arm.id].pulls * arm.chance * arm.reward,
    0,
  );
  const observedRate = totalPulls === 0 ? 0 : (totalReward / totalPulls) * 100;

  function randomUnit() {
    randomState.current = (randomState.current * 16_807) % 2_147_483_647;
    return (randomState.current - 1) / 2_147_483_646;
  }

  function runRounds(count: number) {
    const result = simulateBandit(arms, stats, epsilon / 100, count, totalPulls, randomUnit);
    setStats(result.stats);
    setHistory((current) => [...result.events, ...current].slice(0, 8));
  }

  function reset(nextEnvironment: BanditEnvironment = environment) {
    randomState.current = nextEnvironment === "campaigns" ? 1_973_111 : 2_026_082;
    setStats(emptyBanditStats(BANDIT_ENVIRONMENTS[nextEnvironment]));
    setHistory([]);
  }

  function changeEnvironment(nextEnvironment: BanditEnvironment) {
    setEnvironment(nextEnvironment);
    reset(nextEnvironment);
  }

  return (
    <DemoWindow
      appName="STUDY-RL Lab"
      title="Multi-Armed Bandit Playground"
      status={totalPulls ? `${totalPulls} SIMULATED ROUNDS` : "READY TO LEARN"}
      purpose="Show how an epsilon-greedy policy learns which uncertain option pays best."
      tryThis="Pull arms or run a batch of simulated rounds."
      watchFor="Value estimates and exploration history change after every reward."
      statusTone={totalPulls ? "working" : "ready"}
      footer={
        <>
          <span>Policy: ε-greedy</span>
          <span>Simulation only · no live decisions</span>
        </>
      }
    >
      <div className={styles.rlIntro}>
        <div>
          <span className={styles.eyebrow}>REINFORCEMENT LEARNING, MADE TANGIBLE</span>
          <p>Balance exploration of uncertain choices with exploitation of the best observed choice. Each pull produces a simulated binary reward.</p>
        </div>
        <div className={styles.rlControls}>
          <label>
            <span>Scenario</span>
            <select value={environment} onChange={(event) => changeEnvironment(event.target.value as BanditEnvironment)}>
              <option value="campaigns">Creative concepts</option>
              <option value="treatments">Learning routes</option>
            </select>
          </label>
          <label className={styles.rangeControl}>
            <span>Exploration ε <strong>{epsilon}%</strong></span>
            <input type="range" min="0" max="100" step="5" value={epsilon} onChange={(event) => setEpsilon(Number(event.target.value))} />
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={revealOdds} onChange={(event) => setRevealOdds(event.target.checked)} />
            <span>Reveal hidden odds</span>
          </label>
        </div>
      </div>

      <div className={styles.banditMetrics}>
        <div><span>ROUNDS</span><strong>{totalPulls}</strong></div>
        <div><span>REWARDS</span><strong>{totalReward}</strong></div>
        <div><span>OBSERVED RATE</span><strong>{observedRate.toFixed(1)}%</strong></div>
        <div><span>EXPECTED REGRET</span><strong>{Math.max(0, expectedOracleReward - expectedPolicyReward).toFixed(1)}</strong></div>
      </div>

      <section className={styles.armGrid} aria-label="Bandit arms and estimates">
        {arms.map((arm) => {
          const stat = stats[arm.id];
          const estimate = stat.pulls === 0 ? 0 : (stat.reward / stat.pulls) * 100;
          const maxPulls = Math.max(1, ...Object.values(stats).map((item) => item.pulls));
          return (
            <article className={styles.armCard} key={arm.id}>
              <div className={styles.armHeader}>
                <span className={styles.armLetter}>{arm.id.toUpperCase()}</span>
                <div><strong>{arm.label}</strong><small>{arm.hint}</small></div>
              </div>
              <div className={styles.estimateValue}>
                <strong>{stat.pulls ? `${estimate.toFixed(1)}%` : "—"}</strong>
                <span>estimated reward</span>
              </div>
              <div className={styles.pullTrack} role="img" aria-label={`${arm.label} selected ${stat.pulls} times`}>
                <span style={{ width: `${(stat.pulls / maxPulls) * 100}%` }} />
              </div>
              <div className={styles.armMeta}>
                <span>{stat.pulls} pulls</span>
                <span>{stat.wins} wins</span>
              </div>
              <div className={`${styles.trueOdds} ${revealOdds ? styles.oddsRevealed : ""}`}>
                True odds: <strong>{revealOdds ? `${Math.round(arm.chance * 100)}%` : "••%"}</strong>
              </div>
            </article>
          );
        })}
      </section>

      <div className={styles.rlActionBar}>
        <div className={styles.actionRow}>
          <MacButton primary onClick={() => runRounds(1)}>Pull one arm</MacButton>
          <MacButton onClick={() => runRounds(25)}>Run 25 rounds</MacButton>
          <MacButton onClick={() => reset()}>Reset study</MacButton>
        </div>
        <p><strong>Current policy:</strong> initialise each arm once, then explore randomly {epsilon}% of the time; otherwise choose the strongest observed estimate. Resetting replays the same seeded study.</p>
      </div>

      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {totalPulls ? `${totalPulls} rounds complete with ${totalReward} rewards.` : "Study ready."}
      </p>
      <section className={styles.historyPanel} aria-labelledby="history-heading">
        <div className={styles.panelHeading}>
          <div><span>EVENT STREAM</span><h3 id="history-heading">Recent decisions</h3></div>
        </div>
        {history.length ? (
          <ol className={styles.eventList}>
            {history.map((event) => (
              <li key={event.id}>
                <span>#{String(event.id).padStart(3, "0")}</span>
                <strong>{event.armLabel}</strong>
                <em>{event.mode}</em>
                <b className={event.reward ? styles.rewardWon : styles.rewardMiss}>{event.reward ? "+1 reward" : "0 reward"}</b>
              </li>
            ))}
          </ol>
        ) : <p className={styles.emptyState}>Pull an arm to begin the study.</p>}
      </section>
    </DemoWindow>
  );
}

type DayId = "mon" | "tue" | "wed" | "thu" | "fri";

type AvailabilityWindow = {
  day: DayId;
  start: number;
  end: number;
};

type SyntheticCandidate = {
  id: string;
  name: string;
  role: string;
  timezone: string;
  availability: AvailabilityWindow[];
};

type Interviewer = {
  id: string;
  name: string;
  team: string;
};

type Booking = {
  id: number;
  candidateId: string;
  interviewerId: string;
  day: DayId;
  start: number;
  duration: number;
  title: string;
};

const DAYS: { id: DayId; name: string; date: string }[] = [
  { id: "mon", name: "Mon", date: "24 Aug" },
  { id: "tue", name: "Tue", date: "25 Aug" },
  { id: "wed", name: "Wed", date: "26 Aug" },
  { id: "thu", name: "Thu", date: "27 Aug" },
  { id: "fri", name: "Fri", date: "28 Aug" },
];

const TIMES = [540, 600, 660, 720, 780, 840, 900, 960];

const SYNTHETIC_CANDIDATES: SyntheticCandidate[] = [
  {
    id: "candidate-014",
    name: "Candidate 014",
    role: "Product Data Scientist",
    timezone: "Europe/London",
    availability: [
      { day: "mon", start: 540, end: 720 },
      { day: "tue", start: 780, end: 1020 },
      { day: "wed", start: 600, end: 900 },
      { day: "fri", start: 540, end: 780 },
    ],
  },
  {
    id: "candidate-027",
    name: "Candidate 027",
    role: "Machine Learning Engineer",
    timezone: "Europe/London",
    availability: [
      { day: "mon", start: 780, end: 1020 },
      { day: "tue", start: 540, end: 720 },
      { day: "thu", start: 600, end: 1020 },
      { day: "fri", start: 840, end: 1020 },
    ],
  },
  {
    id: "candidate-052",
    name: "Candidate 052",
    role: "Responsible AI Researcher",
    timezone: "Europe/London",
    availability: [
      { day: "tue", start: 660, end: 960 },
      { day: "wed", start: 540, end: 780 },
      { day: "thu", start: 780, end: 1020 },
      { day: "fri", start: 600, end: 900 },
    ],
  },
];

const INTERVIEWERS: Interviewer[] = [
  { id: "interviewer-a", name: "Panel A", team: "Product & Data" },
  { id: "interviewer-b", name: "Panel B", team: "Machine Learning" },
  { id: "interviewer-c", name: "Panel C", team: "Responsible AI" },
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: 1, candidateId: "candidate-027", interviewerId: "interviewer-a", day: "tue", start: 600, duration: 60, title: "Technical interview" },
  { id: 2, candidateId: "candidate-014", interviewerId: "interviewer-b", day: "wed", start: 660, duration: 60, title: "Portfolio review" },
  { id: 3, candidateId: "candidate-052", interviewerId: "interviewer-a", day: "fri", start: 660, duration: 60, title: "Values interview" },
];

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function intervalsOverlap(startA: number, durationA: number, startB: number, durationB: number) {
  return startA < startB + durationB && startB < startA + durationA;
}

export function CoverdYasaDemo() {
  const [candidateId, setCandidateId] = useState(SYNTHETIC_CANDIDATES[0].id);
  const [interviewerId, setInterviewerId] = useState(INTERVIEWERS[0].id);
  const [duration, setDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayId; start: number } | null>(null);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [confirmation, setConfirmation] = useState("");
  const candidate = SYNTHETIC_CANDIDATES.find((item) => item.id === candidateId) ?? SYNTHETIC_CANDIDATES[0];
  const interviewer = INTERVIEWERS.find((item) => item.id === interviewerId) ?? INTERVIEWERS[0];

  function getSlotState(day: DayId, start: number) {
    const inCandidateWindow = candidate.availability.some((window) => (
      window.day === day && start >= window.start && start + duration <= window.end
    ));
    if (!inCandidateWindow) return { state: "unavailable" as const, reason: "Candidate unavailable" };

    const collision = bookings.find((booking) => (
      booking.day === day
      && intervalsOverlap(start, duration, booking.start, booking.duration)
      && (booking.candidateId === candidateId || booking.interviewerId === interviewerId)
    ));

    if (collision) {
      const isCandidateConflict = collision.candidateId === candidateId;
      return {
        state: "conflict" as const,
        reason: isCandidateConflict ? "Candidate already booked" : `${interviewer.name} already booked`,
      };
    }

    return { state: "available" as const, reason: "Available" };
  }

  function changeCandidate(nextCandidateId: string) {
    setCandidateId(nextCandidateId);
    setSelectedSlot(null);
    setConfirmation("");
  }

  function changeInterviewer(nextInterviewerId: string) {
    setInterviewerId(nextInterviewerId);
    setSelectedSlot(null);
    setConfirmation("");
  }

  function changeDuration(nextDuration: number) {
    setDuration(nextDuration);
    setSelectedSlot(null);
    setConfirmation("");
  }

  function selectSlot(day: DayId, start: number) {
    if (getSlotState(day, start).state !== "available") return;
    setSelectedSlot({ day, start });
    setConfirmation("");
  }

  function bookInterview() {
    if (!selectedSlot || getSlotState(selectedSlot.day, selectedSlot.start).state !== "available") return;
    const day = DAYS.find((item) => item.id === selectedSlot.day) ?? DAYS[0];
    const newBooking: Booking = {
      id: Math.max(0, ...bookings.map((booking) => booking.id)) + 1,
      candidateId,
      interviewerId,
      day: selectedSlot.day,
      start: selectedSlot.start,
      duration,
      title: "Interview",
    };
    setBookings((current) => [...current, newBooking]);
    setConfirmation(`${candidate.name} booked with ${interviewer.name} on ${day.name} ${day.date} at ${formatTime(selectedSlot.start)}.`);
    setSelectedSlot(null);
  }

  const selectedDay = selectedSlot ? DAYS.find((day) => day.id === selectedSlot.day) : null;
  const visibleBookings = bookings.filter((booking) => booking.candidateId === candidateId || booking.interviewerId === interviewerId);

  return (
    <DemoWindow
      appName="COVERD · YASA"
      title="Availability & Interview Scheduler"
      status="SYNTHETIC SANDBOX"
      purpose="Explain how candidate and host constraints become conflict-safe interview slots."
      tryThis="Change the candidate or select a free slot."
      watchFor="Relevant holds and bookable times update together."
      statusTone="safe"
      footer={
        <>
          <span>{visibleBookings.length} relevant calendar holds</span>
          <span>Timezone: {candidate.timezone}</span>
        </>
      }
    >
      <div className={`${styles.notice} ${styles.syntheticNotice}`} role="note">
        <span className={styles.noticeIcon} aria-hidden="true">S</span>
        <div>
          <strong>Demonstration records only</strong>
          <p>Candidate labels, roles, panels and appointments are synthetic. No personal calendar is connected.</p>
        </div>
      </div>

      <div className={styles.schedulerControls}>
        <label>
          <span>Candidate</span>
          <select value={candidateId} onChange={(event) => changeCandidate(event.target.value)}>
            {SYNTHETIC_CANDIDATES.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}
          </select>
        </label>
        <label>
          <span>Interview panel</span>
          <select value={interviewerId} onChange={(event) => changeInterviewer(event.target.value)}>
            {INTERVIEWERS.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.team}</option>)}
          </select>
        </label>
        <label>
          <span>Duration</span>
          <select value={duration} onChange={(event) => changeDuration(Number(event.target.value))}>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </label>
      </div>

      <div className={styles.schedulerLayout}>
        <section className={styles.calendarPanel} aria-labelledby="availability-heading">
          <div className={styles.panelHeading}>
            <div><span>WEEK OF 24 AUGUST · LONDON</span><h3 id="availability-heading">Mutual availability</h3></div>
            <div className={styles.slotLegend}>
              <span className={styles.availableKey}>Available</span>
              <span className={styles.conflictKey}>Conflict</span>
              <span className={styles.unavailableKey}>Unavailable</span>
            </div>
          </div>

          <div className={styles.calendarScroller}>
            <div className={styles.calendarGrid}>
              <span className={styles.cornerCell}>TIME</span>
              {DAYS.map((day) => <strong className={styles.dayHeading} key={day.id}><span>{day.name}</span><small>{day.date}</small></strong>)}
              {TIMES.map((time) => (
                <div className={styles.calendarRow} key={time}>
                  <span className={styles.timeLabel}>{formatTime(time)}</span>
                  {DAYS.map((day) => {
                    const slot = getSlotState(day.id, time);
                    const isSelected = selectedSlot?.day === day.id && selectedSlot.start === time;
                    return (
                      <button
                        key={day.id}
                        className={`${styles.slotButton} ${styles[slot.state]} ${isSelected ? styles.selectedSlot : ""}`}
                        disabled={slot.state !== "available"}
                        onClick={() => selectSlot(day.id, time)}
                        aria-label={`${day.name} ${day.date} at ${formatTime(time)}: ${slot.reason}`}
                        aria-pressed={isSelected}
                        title={slot.reason}
                      >
                        <span aria-hidden="true">{slot.state === "available" ? (isSelected ? "✓" : "") : slot.state === "conflict" ? "×" : "·"}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className={styles.bookingPanel} aria-labelledby="booking-heading">
          <div className={styles.panelHeading}>
            <div><span>CONFLICT-SAFE BOOKING</span><h3 id="booking-heading">Review interview</h3></div>
          </div>
          <dl className={styles.bookingDetails}>
            <div><dt>Candidate</dt><dd><strong>{candidate.name}</strong><span>{candidate.role}</span></dd></div>
            <div><dt>Panel</dt><dd><strong>{interviewer.name}</strong><span>{interviewer.team}</span></dd></div>
            <div><dt>Slot</dt><dd>{selectedSlot && selectedDay ? <><strong>{selectedDay.name} {selectedDay.date}</strong><span>{formatTime(selectedSlot.start)}–{formatTime(selectedSlot.start + duration)}</span></> : <em>Select an available square</em>}</dd></div>
          </dl>
          <MacButton primary onClick={bookInterview} disabled={!selectedSlot}>Book synthetic interview</MacButton>
          <p className={styles.conflictMessage}><span aria-hidden="true">✓</span> Candidate and panel conflicts are checked before a booking can be created.</p>
          {confirmation && <p className={styles.confirmation} role="status"><strong>Booked.</strong> {confirmation}</p>}

          <div className={styles.upcomingBookings}>
            <span className={styles.resultLabel}>RELEVANT CALENDAR HOLDS</span>
            {visibleBookings.slice(-4).map((booking) => {
              const day = DAYS.find((item) => item.id === booking.day) ?? DAYS[0];
              const bookingCandidate = SYNTHETIC_CANDIDATES.find((item) => item.id === booking.candidateId)?.name ?? "Candidate";
              return (
                <div key={booking.id}>
                  <span>{day.name}<strong>{formatTime(booking.start)}</strong></span>
                  <p><strong>{booking.title}</strong><small>{bookingCandidate}</small></p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </DemoWindow>
  );
}

const DEMO_COMPONENTS: Record<CoreProjectDemoId, () => ReactNode> = {
  "cv-keywords": CvKeywordDemo,
  finance: FinanceIntelligenceDemo,
  bandits: RlBanditDemo,
  scheduling: CoverdYasaDemo,
};

export function ProjectDemo({ demoId }: { demoId: CoreProjectDemoId }) {
  const Demo = DEMO_COMPONENTS[demoId];
  return <Demo />;
}

export default ProjectDemo;
