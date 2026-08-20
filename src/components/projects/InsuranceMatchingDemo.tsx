"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./InsuranceMatchingDemo.module.css";

const PILLARS = [
  {
    key: "trading",
    short: "Trading",
    label: "Historical trading",
    colour: "#11177a",
    description: "A risk-to-market ranking signal derived from lagged placement patterns.",
  },
  {
    key: "appetite",
    short: "Lead share",
    label: "Historical lead share",
    colour: "#16705a",
    description: "Availability-attested, recency-aware lead/follow evidence—not a statement of current appetite.",
  },
  {
    key: "quality",
    short: "Quality",
    label: "Wording / quality",
    colour: "#a65f00",
    description: "Included only when evidence is market-conditional; otherwise it stays unassessed.",
  },
] as const;

type PillarKey = (typeof PILLARS)[number]["key"];
type Weights = Record<PillarKey, number>;
type Signals = Record<PillarKey, number | null>;
type Evidence = Record<PillarKey, string>;
type Normalisation = "calibrated" | "panel";
type MinimumSignals = 1 | 2 | 3;
type WorkbenchMode = "evidence" | "retired-composite";

type Candidate = {
  id: string;
  name: string;
  descriptor: string;
  signals: Signals;
  evidence: Evidence;
  reliability: number;
  authorityVerified: boolean;
  coldStart?: boolean;
};

type Scenario = {
  id: string;
  code: string;
  name: string;
  line: string;
  territory: string;
  placement: string;
  brief: string;
  candidates: Candidate[];
};

type RankedCandidate = Candidate & {
  rank: number | null;
  score: number;
  normalised: Record<PillarKey, number | null>;
  effectiveWeights: Record<PillarKey, number>;
  contributions: Record<PillarKey, number>;
  coverage: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceValue: number;
  eligible: boolean;
  holds: string[];
};

const DEFAULT_WEIGHTS: Weights = { trading: 45, appetite: 35, quality: 20 };

const WEIGHT_PRESETS: { id: string; label: string; weights: Weights }[] = [
  { id: "balanced", label: "Balanced", weights: { trading: 40, appetite: 35, quality: 25 } },
  { id: "evidence", label: "History first", weights: { trading: 60, appetite: 30, quality: 10 } },
  { id: "wording", label: "Wording lens", weights: { trading: 30, appetite: 25, quality: 45 } },
];

const SCENARIOS: Scenario[] = [
  {
    id: "property",
    code: "SYN-P01",
    name: "Coastal property renewal",
    line: "Commercial property",
    territory: "UK & Northern Europe",
    placement: "Renewal · layered",
    brief: "Complex property programme with catastrophe exposure and an incumbent panel.",
    candidates: [
      {
        id: "market-01",
        name: "Market 01 — Composite",
        descriptor: "Diversified composite market",
        signals: { trading: 86, appetite: 72, quality: 63 },
        evidence: {
          trading: "Strong synthetic peer-risk ranking with broad, recent panel support.",
          appetite: "Consistent synthetic lead participation in comparable property renewals.",
          quality: "A market-conditional synthetic wording assessment is available.",
        },
        reliability: 0.9,
        authorityVerified: true,
      },
      {
        id: "market-02",
        name: "Market 02 — Specialty",
        descriptor: "Property-specialty market",
        signals: { trading: 74, appetite: 84, quality: 71 },
        evidence: {
          trading: "Good synthetic placement history, with fewer exact territory peers.",
          appetite: "High recency-weighted synthetic lead share for this class and region.",
          quality: "Synthetic clause-role evidence suggests a close fit, pending human review.",
        },
        reliability: 0.82,
        authorityVerified: true,
      },
      {
        id: "market-03",
        name: "Market 03 — International",
        descriptor: "International specialty market",
        signals: { trading: 78, appetite: 61, quality: 88 },
        evidence: {
          trading: "Above-panel synthetic ranking on risk shape and prior interactions.",
          appetite: "Moderate synthetic participation; evidence is thinner for layered renewals.",
          quality: "Highest synthetic market-conditional wording alignment in this panel.",
        },
        reliability: 0.76,
        authorityVerified: true,
      },
      {
        id: "market-04",
        name: "Market 04 — Regional",
        descriptor: "Regional commercial market",
        signals: { trading: 59, appetite: 68, quality: null },
        evidence: {
          trading: "Mixed synthetic ranking evidence with narrower industry breadth.",
          appetite: "Recent synthetic lead/follow evidence exists at class level.",
          quality: "Unassessed: no market-conditional wording artifact is available.",
        },
        reliability: 0.6,
        authorityVerified: true,
      },
      {
        id: "market-05",
        name: "Market 05 — Programme",
        descriptor: "New programme entrant",
        signals: { trading: 50, appetite: 57, quality: 78 },
        evidence: {
          trading: "Cold-start estimate uses only the synthetic line-level prior.",
          appetite: "Sparse synthetic participation is smoothed toward the panel prior.",
          quality: "Synthetic market-conditional wording evidence is comparatively strong.",
        },
        reliability: 0.45,
        authorityVerified: true,
        coldStart: true,
      },
      {
        id: "market-06",
        name: "Market 06 — Review",
        descriptor: "Capacity under review",
        signals: { trading: 69, appetite: null, quality: null },
        evidence: {
          trading: "A synthetic trading descriptor exists, but corroborating pillars do not.",
          appetite: "Unassessed: no availability-attested history for this scenario.",
          quality: "Unassessed: no market-conditional wording artifact is available.",
        },
        reliability: 0.52,
        authorityVerified: false,
      },
    ],
  },
  {
    id: "casualty",
    code: "SYN-C02",
    name: "Cross-border casualty",
    line: "General liability",
    territory: "Europe & North America",
    placement: "New business · primary",
    brief: "Multi-territory liability placement with services and distribution exposures.",
    candidates: [
      {
        id: "market-01",
        name: "Market 01 — Composite",
        descriptor: "Diversified composite market",
        signals: { trading: 62, appetite: 54, quality: 68 },
        evidence: {
          trading: "Synthetic peer-risk ranking is positive but class breadth is moderate.",
          appetite: "Synthetic lead share is below this panel's centre for new casualty risks.",
          quality: "Synthetic wording evidence is available and broadly aligned.",
        },
        reliability: 0.69,
        authorityVerified: true,
      },
      {
        id: "market-02",
        name: "Market 02 — Specialty",
        descriptor: "Property-specialty market",
        signals: { trading: 57, appetite: 63, quality: null },
        evidence: {
          trading: "Synthetic history is usable, although exact class peers are limited.",
          appetite: "Moderate synthetic lead participation after recency weighting.",
          quality: "Unassessed: evidence is document-level, not market-conditional.",
        },
        reliability: 0.56,
        authorityVerified: true,
      },
      {
        id: "market-03",
        name: "Market 03 — International",
        descriptor: "International specialty market",
        signals: { trading: 89, appetite: 80, quality: 76 },
        evidence: {
          trading: "Top synthetic risk-to-market ranking with strong territory overlap.",
          appetite: "Broad and recent synthetic lead/follow support in comparable placements.",
          quality: "Synthetic market-conditional wording evidence is available.",
        },
        reliability: 0.91,
        authorityVerified: true,
      },
      {
        id: "market-04",
        name: "Market 04 — Regional",
        descriptor: "Regional commercial market",
        signals: { trading: 71, appetite: 77, quality: 58 },
        evidence: {
          trading: "Stable synthetic ranking with relevant class history.",
          appetite: "Synthetic recent lead participation is above the panel median.",
          quality: "Synthetic clause-role coverage is partial and needs specialist review.",
        },
        reliability: 0.75,
        authorityVerified: true,
      },
      {
        id: "market-05",
        name: "Market 05 — Programme",
        descriptor: "New programme entrant",
        signals: { trading: 50, appetite: 60, quality: 82 },
        evidence: {
          trading: "Cold-start estimate uses the synthetic casualty prior.",
          appetite: "Limited synthetic evidence is smoothed toward the class baseline.",
          quality: "Strong synthetic wording signal, but history remains shallow.",
        },
        reliability: 0.43,
        authorityVerified: true,
        coldStart: true,
      },
      {
        id: "market-06",
        name: "Market 06 — Review",
        descriptor: "Capacity under review",
        signals: { trading: 66, appetite: null, quality: null },
        evidence: {
          trading: "A synthetic trading descriptor exists without corroborating evidence.",
          appetite: "Unassessed: the evidence contract is not satisfied.",
          quality: "Unassessed: no market-conditional artifact is available.",
        },
        reliability: 0.48,
        authorityVerified: false,
      },
    ],
  },
  {
    id: "technology",
    code: "SYN-T03",
    name: "Technology E&O launch",
    line: "Technology errors & omissions",
    territory: "UK & global operations",
    placement: "New business · excess",
    brief: "Fast-growing software risk with contractual liability and cyber-adjacent wording needs.",
    candidates: [
      {
        id: "market-01",
        name: "Market 01 — Composite",
        descriptor: "Diversified composite market",
        signals: { trading: 55, appetite: 49, quality: 60 },
        evidence: {
          trading: "Synthetic risk-to-market rank is below the panel centre for this class.",
          appetite: "Limited synthetic lead participation in technology E&O.",
          quality: "A synthetic market-conditional assessment is available with caveats.",
        },
        reliability: 0.57,
        authorityVerified: true,
      },
      {
        id: "market-02",
        name: "Market 02 — Specialty",
        descriptor: "Property-specialty market",
        signals: { trading: 64, appetite: 58, quality: null },
        evidence: {
          trading: "Synthetic placement evidence transfers only partially to this class.",
          appetite: "Some recent synthetic participation, but exact peers are sparse.",
          quality: "Unassessed: no market-conditional wording artifact is available.",
        },
        reliability: 0.5,
        authorityVerified: true,
      },
      {
        id: "market-03",
        name: "Market 03 — International",
        descriptor: "International specialty market",
        signals: { trading: 81, appetite: 69, quality: 91 },
        evidence: {
          trading: "Strong synthetic ranking across class, territory, and risk-shape signals.",
          appetite: "Positive synthetic lead-share evidence with usable recency support.",
          quality: "Top synthetic market-conditional wording alignment in the panel.",
        },
        reliability: 0.87,
        authorityVerified: true,
      },
      {
        id: "market-04",
        name: "Market 04 — Regional",
        descriptor: "Regional commercial market",
        signals: { trading: 70, appetite: 65, quality: 73 },
        evidence: {
          trading: "Moderate synthetic history with a stable panel rank.",
          appetite: "Synthetic lead participation is credible but not deep.",
          quality: "Synthetic wording alignment is positive on core clause roles.",
        },
        reliability: 0.7,
        authorityVerified: true,
      },
      {
        id: "market-05",
        name: "Market 05 — Programme",
        descriptor: "New programme entrant",
        signals: { trading: 50, appetite: 76, quality: 85 },
        evidence: {
          trading: "Cold-start estimate uses only a synthetic line-level prior.",
          appetite: "Promising synthetic recent lead share, with limited effective support.",
          quality: "Strong synthetic wording evidence; broader validation is still required.",
        },
        reliability: 0.49,
        authorityVerified: true,
        coldStart: true,
      },
      {
        id: "market-06",
        name: "Market 06 — Review",
        descriptor: "Capacity under review",
        signals: { trading: 72, appetite: null, quality: null },
        evidence: {
          trading: "A synthetic trading descriptor exists without corroborating evidence.",
          appetite: "Unassessed: the evidence contract is not satisfied.",
          quality: "Unassessed: no market-conditional artifact is available.",
        },
        reliability: 0.46,
        authorityVerified: false,
      },
    ],
  },
];

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function formatEffectiveWeight(value: number) {
  return `${(value * 100).toFixed(2).replace(/0$/, "")}%`;
}

function rankScenario(
  scenario: Scenario,
  weights: Weights,
  normalisation: Normalisation,
  minimumSignals: MinimumSignals,
  holdUnverified: boolean,
): RankedCandidate[] {
  const extents = PILLARS.reduce((accumulator, pillar) => {
    const values = scenario.candidates
      .map((candidate) => candidate.signals[pillar.key])
      .filter((value): value is number => value !== null);
    accumulator[pillar.key] = {
      minimum: Math.min(...values),
      maximum: Math.max(...values),
    };
    return accumulator;
  }, {} as Record<PillarKey, { minimum: number; maximum: number }>);

  const totalConfiguredWeight = PILLARS.reduce((sum, pillar) => sum + weights[pillar.key], 0);

  const scored = scenario.candidates.map<RankedCandidate>((candidate) => {
    const available = PILLARS.filter((pillar) => candidate.signals[pillar.key] !== null);
    const availableWeight = available.reduce((sum, pillar) => sum + weights[pillar.key], 0);
    const normalised = {} as Record<PillarKey, number | null>;
    const effectiveWeights = {} as Record<PillarKey, number>;
    const contributions = {} as Record<PillarKey, number>;

    PILLARS.forEach((pillar) => {
      const value = candidate.signals[pillar.key];
      if (value === null) {
        normalised[pillar.key] = null;
        effectiveWeights[pillar.key] = 0;
        contributions[pillar.key] = 0;
        return;
      }

      const { minimum, maximum } = extents[pillar.key];
      const transformed = normalisation === "calibrated"
        ? value
        : maximum === minimum
          ? 50
          : ((value - minimum) / (maximum - minimum)) * 100;
      const effectiveWeight = availableWeight === 0 ? 0 : weights[pillar.key] / availableWeight;
      normalised[pillar.key] = transformed;
      effectiveWeights[pillar.key] = effectiveWeight;
      contributions[pillar.key] = transformed * effectiveWeight;
    });

    const score = PILLARS.reduce((sum, pillar) => sum + contributions[pillar.key], 0);
    const coverage = totalConfiguredWeight === 0 ? 0 : (availableWeight / totalConfiguredWeight) * 100;
    const confidenceValue = clamp(candidate.reliability * (0.55 + 0.45 * coverage / 100) * 100, 0, 100);
    const confidence = confidenceValue >= 78 ? "HIGH" : confidenceValue >= 58 ? "MEDIUM" : "LOW";
    const holds: string[] = [];

    if (holdUnverified && !candidate.authorityVerified) {
      holds.push("authority / capacity check");
    }
    if (available.length < minimumSignals) {
      holds.push(`only ${available.length} of 3 signals assessed`);
    }

    return {
      ...candidate,
      rank: null,
      score,
      normalised,
      effectiveWeights,
      contributions,
      coverage,
      confidence,
      confidenceValue,
      eligible: holds.length === 0,
      holds,
    };
  });

  const sorted = [...scored].sort((left, right) => {
    if (left.eligible !== right.eligible) return left.eligible ? -1 : 1;
    if (right.score !== left.score) return right.score - left.score;
    return left.name.localeCompare(right.name);
  });
  let rank = 0;
  return sorted.map((candidate) => {
    if (!candidate.eligible) return candidate;
    rank += 1;
    return { ...candidate, rank };
  });
}

function WeightSlider({
  pillar,
  value,
  total,
  onChange,
}: {
  pillar: (typeof PILLARS)[number];
  value: number;
  total: number;
  onChange: (value: number) => void;
}) {
  const helpId = useId();
  const normalised = total === 0 ? "0.0%" : formatEffectiveWeight(value / total);

  return (
    <label className={styles.weightField}>
      <span className={styles.weightHeading}>
        <span>
          <i style={{ backgroundColor: pillar.colour }} aria-hidden="true" />
          <strong>{pillar.label}</strong>
        </span>
        <output>{normalised}</output>
      </span>
      <input
        type="range"
        min={5}
        max={80}
        step={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-describedby={helpId}
      />
      <small id={helpId}>{pillar.description}</small>
    </label>
  );
}

function ConfidenceBadge({ value }: { value: RankedCandidate["confidence"] }) {
  return <span className={`${styles.confidence} ${styles[value.toLocaleLowerCase()]}`}>{value}</span>;
}

function RankDelta({ current, comparison }: { current: number | null; comparison: number | null }) {
  if (current === null || comparison === null) return <span className={styles.deltaHeld}>HELD</span>;
  const difference = current - comparison;
  if (difference === 0) return <span className={styles.deltaFlat}>—</span>;
  return (
    <span className={difference > 0 ? styles.deltaUp : styles.deltaDown}>
      {difference > 0 ? "↑" : "↓"} {Math.abs(difference)}
    </span>
  );
}

export function InsuranceMatchingDemo() {
  const [workbenchMode, setWorkbenchMode] = useState<WorkbenchMode>("evidence");
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [comparisonId, setComparisonId] = useState(SCENARIOS[1].id);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [normalisation, setNormalisation] = useState<Normalisation>("calibrated");
  const [minimumSignals, setMinimumSignals] = useState<MinimumSignals>(2);
  const [holdUnverified, setHoldUnverified] = useState(true);
  const [selectedId, setSelectedId] = useState("market-01");
  const [reviewReason, setReviewReason] = useState("Broker context requires discussion");
  const [pinned, setPinned] = useState<{ scenarioId: string; candidateId: string; reason: string } | null>(null);

  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];
  const comparison = SCENARIOS.find((item) => item.id === comparisonId) ?? SCENARIOS[1];
  const totalWeight = PILLARS.reduce((sum, pillar) => sum + weights[pillar.key], 0);

  const ranked = useMemo(
    () => rankScenario(scenario, weights, normalisation, minimumSignals, holdUnverified),
    [holdUnverified, minimumSignals, normalisation, scenario, weights],
  );
  const comparisonRanked = useMemo(
    () => rankScenario(comparison, weights, normalisation, minimumSignals, holdUnverified),
    [comparison, holdUnverified, minimumSignals, normalisation, weights],
  );
  const evidenceOrdered = useMemo(() => {
    const scored = rankScenario(scenario, DEFAULT_WEIGHTS, "calibrated", minimumSignals, holdUnverified);
    const byId = new Map(scored.map((candidate) => [candidate.id, candidate]));
    return scenario.candidates.map((candidate) => ({ ...byId.get(candidate.id)!, rank: null }));
  }, [holdUnverified, minimumSignals, scenario]);
  const displayedCandidates = workbenchMode === "evidence" ? evidenceOrdered : ranked;
  const selected = displayedCandidates.find((candidate) => candidate.id === selectedId) ?? displayedCandidates[0];
  const rankedCount = displayedCandidates.filter((candidate) => candidate.eligible).length;
  const heldCount = displayedCandidates.length - rankedCount;
  const topWhatIfCandidate = ranked.find((candidate) => candidate.rank === 1);
  const resultStatus = workbenchMode === "evidence"
    ? `${rankedCount} markets evidence-ready; ${heldCount} gated. Broker order preserved.`
    : `${rankedCount} markets ranked; ${heldCount} gated. Top what-if result: ${topWhatIfCandidate?.name ?? "none"}.`;

  const activePreset = WEIGHT_PRESETS.find((preset) =>
    PILLARS.every((pillar) => preset.weights[pillar.key] === weights[pillar.key]),
  )?.id;

  function updateWeight(key: PillarKey, value: number) {
    setWeights((current) => ({ ...current, [key]: value }));
  }

  function chooseScenario(nextScenarioId: string) {
    setScenarioId(nextScenarioId);
    if (nextScenarioId === comparisonId) {
      const nextComparison = SCENARIOS.find((item) => item.id !== nextScenarioId);
      if (nextComparison) setComparisonId(nextComparison.id);
    }
  }

  function togglePinned(candidate: RankedCandidate) {
    const isPinned = pinned?.scenarioId === scenario.id && pinned.candidateId === candidate.id;
    if (isPinned) {
      setPinned(null);
      return;
    }
    if (!candidate.eligible) return;
    setPinned(isPinned ? null : { scenarioId: scenario.id, candidateId: candidate.id, reason: reviewReason });
  }

  return (
    <DemoWindow
      appName="Lead Match Workbench"
      title="Insurance lead-market evidence lab"
      status={workbenchMode === "evidence" ? "CURRENT DESIGN · BROKER ORDER" : "RETIRED COMPOSITE · WHAT-IF"}
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>Deterministic browser calculation · no API calls</span>
          <span>{rankedCount} evidence-ready · {heldCount} gated</span>
        </>
      }
    >
      <aside className={styles.disclosure} role="note" aria-label="Confidentiality boundary">
        <span className={styles.disclosureIcon} aria-hidden="true">SYN</span>
        <div>
          <strong>Real workflow shape. Entirely fictional demonstration data.</strong>
          <p>
            Market names, risks, values, thresholds, weights and explanations below are synthetic. The what-if
            composite is not the source application&apos;s ordering policy. No client, placement, employee, financial,
            insurer-result or internal-system data is shipped to this page.
          </p>
        </div>
      </aside>

      <section className={styles.sourceRecord} aria-label="Source-recorded evaluation contracts">
        <div className={styles.sourceRecordIntro}>
          <span>SOURCE-RECORDED EVIDENCE / TWO SEPARATE CONTRACTS</span>
          <p>These aggregate study results are context for the workbench, not values used by its fictional markets. They measure different targets and must not be combined into one headline score.</p>
        </div>
        <article>
          <span>RISK-TO-MARKET RANKING</span>
          <strong>148,140 rows · 37,844 UMRs · 46 features</strong>
          <p>Temporal Hit@1 <b>0.758</b> versus random <b>0.596</b>; Hit@3 <b>0.945</b>. The final record also notes incumbency-dominated behaviour, so this is not a generic recommendation claim.</p>
        </article>
        <article>
          <span>PLACEMENT-OUTCOME EVALUATION</span>
          <strong>70,598 labelled rows</strong>
          <p>Holdout Hit@1 <b>0.569</b> versus random <b>0.231</b>. This is a separate placement contract, not a validation of the synthetic browser scenarios or the retired composite.</p>
        </article>
      </section>

      <section className={styles.modeChooser} aria-labelledby="workbench-mode-title">
        <div>
          <span>SOURCE-FIDELITY SWITCH</span>
          <strong id="workbench-mode-title">Choose what the workbench demonstrates</strong>
          <p>The current design keeps Trading, historical lead share and Wording separate. The weighted composite is retained only as an inspectable sensitivity experiment showing why premature aggregation is risky.</p>
        </div>
        <div className={styles.modeButtons}>
          <button type="button" className={workbenchMode === "evidence" ? styles.modeActive : ""} aria-pressed={workbenchMode === "evidence"} onClick={() => setWorkbenchMode("evidence")}>
            <span>✓ CURRENT</span><strong>Evidence view</strong><small>Preserve broker order</small>
          </button>
          <button type="button" className={workbenchMode === "retired-composite" ? styles.modeRetiredActive : ""} aria-pressed={workbenchMode === "retired-composite"} onClick={() => setWorkbenchMode("retired-composite")}>
            <span>⚠ RETIRED</span><strong>Composite sandbox</strong><small>Explore sensitivity only</small>
          </button>
        </div>
      </section>

      <ol className={styles.pipeline} aria-label="Matching workflow">
        <li><span>01</span><strong>Risk + panel</strong><small>scenario contract</small></li>
        <li><span>02</span><strong>Evidence agents</strong><small>LambdaRank · Bayes · wording</small></li>
        <li><span>03</span><strong>{workbenchMode === "evidence" ? "Evidence packets" : "What-if score"}</strong><small>{workbenchMode === "evidence" ? "pillars stay separate" : "weights re-normalise"}</small></li>
        <li><span>04</span><strong>Guardrails</strong><small>authority & coverage</small></li>
        <li><span>05</span><strong>Broker review</strong><small>decision stays human</small></li>
      </ol>

      <section className={styles.scenarioSection} aria-labelledby="scenario-title">
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <p>OPPORTUNITY</p>
            <h3 id="scenario-title">Choose a synthetic placement</h3>
          </div>
        </div>
        <div className={styles.scenarioTabs} role="group" aria-label="Synthetic placement scenarios">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === scenario.id ? styles.activeScenario : styles.scenarioButton}
              aria-pressed={item.id === scenario.id}
              onClick={() => chooseScenario(item.id)}
            >
              <span>{item.code}</span>
              <strong>{item.name}</strong>
              <small>{item.line}</small>
            </button>
          ))}
        </div>
        <div className={styles.scenarioBrief}>
          <div>
            <span>RISK BRIEF</span>
            <p>{scenario.brief}</p>
          </div>
          <dl>
            <div><dt>Line</dt><dd>{scenario.line}</dd></div>
            <div><dt>Territory</dt><dd>{scenario.territory}</dd></div>
            <div><dt>Placement</dt><dd>{scenario.placement}</dd></div>
          </dl>
        </div>
      </section>

      <div className={styles.workbench}>
        <section className={styles.controls} aria-labelledby="controls-title">
          <div className={styles.sectionHeading}>
            <span>02</span>
            <div>
              <p>{workbenchMode === "evidence" ? "EVIDENCE CONTRACT" : "RETIRED MODEL LAB"}</p>
              <h3 id="controls-title">{workbenchMode === "evidence" ? "Inspect the abstention gates" : "Tune the what-if ranking lens"}</h3>
            </div>
          </div>

          {workbenchMode === "retired-composite" ? (
            <>
              <div className={styles.retiredWarning} role="note"><strong>Retired prototype calculation</strong><span>These controls do not reproduce the current application&apos;s ordering policy.</span></div>
              <fieldset className={styles.presetFieldset}>
                <legend>Weight preset</legend>
                <div className={styles.segmented}>
                  {WEIGHT_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" aria-pressed={activePreset === preset.id} className={activePreset === preset.id ? styles.segmentActive : ""} onClick={() => setWeights(preset.weights)}>{preset.label}</button>
                  ))}
                </div>
              </fieldset>
              <div className={styles.weightStack}>
                {PILLARS.map((pillar) => <WeightSlider key={pillar.key} pillar={pillar} value={weights[pillar.key]} total={totalWeight} onChange={(value) => updateWeight(pillar.key, value)} />)}
              </div>
              <fieldset className={styles.normalisationFieldset}>
                <legend>Score transform</legend>
                <label><input type="radio" name="insurance-normalisation" checked={normalisation === "calibrated"} onChange={() => setNormalisation("calibrated")} /><span><strong>Calibrated scale</strong><small>Use each synthetic 0–100 pillar value directly.</small></span></label>
                <label><input type="radio" name="insurance-normalisation" checked={normalisation === "panel"} onChange={() => setNormalisation("panel")} /><span><strong>Panel min–max</strong><small>Stretch each pillar to the current candidate panel.</small></span></label>
              </fieldset>
            </>
          ) : (
            <div className={styles.currentModelNote} role="note">
              <span>NO AGGREGATE</span>
              <strong>Three agents return evidence, confidence, provenance and null states.</strong>
              <p>The candidate list stays in the broker-supplied order while the shared decision objective remains unvalidated. Missing evidence is shown—not silently filled.</p>
            </div>
          )}

          <fieldset className={styles.guardrailFieldset}>
            <legend>Evidence guardrails</legend>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={holdUnverified}
                onChange={(event) => setHoldUnverified(event.target.checked)}
              />
              <span><strong>Hold unverified authority</strong><small>Make unresolved capacity unavailable for broker pinning.</small></span>
            </label>
            <label className={styles.selectRow}>
              <span><strong>Minimum assessed signals</strong><small>Fail closed when evidence is too thin.</small></span>
              <select
                value={minimumSignals}
                onChange={(event) => setMinimumSignals(Number(event.target.value) as MinimumSignals)}
              >
                <option value={1}>1 of 3</option>
                <option value={2}>2 of 3</option>
                <option value={3}>3 of 3</option>
              </select>
            </label>
          </fieldset>

          {workbenchMode === "retired-composite" && <div className={styles.equation} aria-label="Retired composite score formula">
            <span>NULL-SAFE COMPOSITE</span>
            <code>S<sub>m</sub> = Σ w<sub>j,m</sub> · N(x<sub>j,m</sub>)</code>
            <p>Missing pillars receive no invented value. Available weights are re-normalised per market.</p>
          </div>}
        </section>

        <section className={styles.ranking} aria-labelledby="ranking-title">
          <div className={styles.rankingHeader}>
            <div className={styles.sectionHeading}>
              <span>03</span>
              <div>
                <p>{workbenchMode === "evidence" ? "BROKER-CONTROLLED PANEL" : "RETIRED RECOMMENDATION SET"}</p>
                <h3 id="ranking-title">{workbenchMode === "evidence" ? "Separate evidence · received order" : "What-if ranked candidate panel"}</h3>
              </div>
            </div>
            <div className={styles.rankSummary}>
              <strong>{workbenchMode === "evidence" ? "NO AUTO-RANK" : "RANKED PANEL · WHAT-IF"}</strong>
              <span>{workbenchMode === "evidence" ? "current source behavior" : normalisation === "panel" ? "relative panel view" : "calibrated view"}</span>
            </div>
          </div>
          <p className={styles.resultStatus} aria-live="polite" aria-atomic="true">{resultStatus}</p>

          <div className={styles.columnLabels} aria-hidden="true">
            <span>{workbenchMode === "evidence" ? "ORDER / MARKET" : "RANK / MARKET"}</span><span>{workbenchMode === "evidence" ? "SEPARATE EVIDENCE" : "EVIDENCE COMPOSITE"}</span><span>{workbenchMode === "evidence" ? "AGGREGATE" : "SCORE"}</span><span>REVIEW</span>
          </div>

          <div className={styles.rankList}>
            {displayedCandidates.map((candidate, index) => {
              const isSelected = selected.id === candidate.id;
              const isPinned = pinned?.scenarioId === scenario.id && pinned.candidateId === candidate.id;
              const barStyle = {
                "--trading": `${candidate.contributions.trading}%`,
                "--appetite": `${candidate.contributions.appetite}%`,
                "--quality": `${candidate.contributions.quality}%`,
              } as CSSProperties;

              return (
                <article
                  key={candidate.id}
                  className={`${styles.rankRow} ${isSelected ? styles.selectedRow : ""} ${!candidate.eligible ? styles.heldRow : ""}`}
                >
                  <button
                    type="button"
                    className={styles.marketButton}
                    onClick={() => setSelectedId(candidate.id)}
                    aria-pressed={isSelected}
                    aria-label={`Inspect ${candidate.name}`}
                  >
                    <span className={styles.rankNumber}>{workbenchMode === "evidence" ? String(index + 1).padStart(2, "0") : candidate.rank === null ? "—" : candidate.rank}</span>
                    <span className={styles.marketIdentity}>
                      <strong>{candidate.name}</strong>
                      <small>{candidate.descriptor}</small>
                      <span className={styles.marketBadges}>
                        <ConfidenceBadge value={candidate.confidence} />
                        <i>{Math.round(candidate.coverage)}% weighted pillar coverage</i>
                        {candidate.coldStart ? <i className={styles.coldStart}>COLD START</i> : null}
                      </span>
                    </span>
                  </button>

                  <div className={styles.compositeCell}>
                    {workbenchMode === "evidence" ? (
                      <div className={styles.evidencePills} aria-label="Separate evidence signals">
                        {PILLARS.map((pillar) => <span key={pillar.key} style={{ borderColor: pillar.colour }}><small>{pillar.short}</small><strong>{candidate.normalised[pillar.key]?.toFixed(0) ?? "—"}</strong></span>)}
                      </div>
                    ) : (
                      <div className={styles.stackBar} style={barStyle} aria-hidden="true"><span className={styles.tradingBar} /><span className={styles.appetiteBar} /><span className={styles.qualityBar} /></div>
                    )}
                    <span className={styles.barLegend}>{candidate.eligible ? workbenchMode === "evidence" ? "independent values · not combined" : "weighted contribution" : candidate.holds.join(" · ")}</span>
                  </div>

                  <div className={styles.scoreCell}>
                    <strong>{workbenchMode === "evidence" ? "—" : candidate.score.toFixed(1)}</strong>
                    <small>{workbenchMode === "evidence" ? "RETIRED" : "/ 100"}</small>
                  </div>

                  <button
                    type="button"
                    className={isPinned ? styles.pinnedButton : styles.pinButton}
                    onClick={() => togglePinned(candidate)}
                    disabled={!candidate.eligible && !isPinned}
                    aria-pressed={isPinned}
                    aria-label={isPinned ? `Remove ${candidate.name} from broker review` : `Pin ${candidate.name} for broker review`}
                  >
                    {isPinned ? "✓ Pinned" : "Pin"}
                  </button>
                </article>
              );
            })}
          </div>

          <div className={styles.legend} aria-label="Evidence legend">
            {PILLARS.map((pillar) => (
              <span key={pillar.key}><i style={{ backgroundColor: pillar.colour }} />{pillar.short}</span>
            ))}
            <span><i className={styles.emptyLegend} />{workbenchMode === "evidence" ? "Not assessed" : "Unused score range"}</span>
          </div>
        </section>
      </div>

      <section className={styles.explainPanel} aria-labelledby="explain-title">
        <div className={styles.explainHeader}>
          <div className={styles.sectionHeading}>
            <span>04</span>
            <div>
              <p>INSPECTOR</p>
              <h3 id="explain-title">{workbenchMode === "evidence" ? `Evidence packet for ${selected.name}` : `Why ${selected.name} is ${selected.rank ? `#${selected.rank}` : "held"}`}</h3>
            </div>
          </div>
          <div className={styles.scoreStamp}>
            <span>{workbenchMode === "evidence" ? "AGGREGATE RETIRED" : "WHAT-IF COMPOSITE"}</span>
            <strong>{workbenchMode === "evidence" ? "—" : selected.score.toFixed(1)}</strong>
          </div>
        </div>

        <div className={styles.explainGrid}>
          <div className={styles.contributionTable}>
            <div className={styles.explainLabels} aria-hidden="true">
              <span>SIGNAL</span><span>INPUT</span><span>{workbenchMode === "evidence" ? "STATUS" : "EFFECTIVE WEIGHT"}</span><span>{workbenchMode === "evidence" ? "AGGREGATE" : "CONTRIBUTION"}</span>
            </div>
            {PILLARS.map((pillar) => {
              const input = selected.normalised[pillar.key];
              const contribution = selected.contributions[pillar.key];
              return (
                <div className={styles.contributionRow} key={pillar.key}>
                  <div className={styles.signalName}>
                    <i style={{ backgroundColor: pillar.colour }} aria-hidden="true" />
                    <strong>{pillar.label}</strong>
                  </div>
                  <span data-label="INPUT">{input === null ? "NOT ASSESSED" : input.toFixed(1)}</span>
                  <span data-label={workbenchMode === "evidence" ? "STATUS" : "EFFECTIVE WEIGHT"}>{workbenchMode === "evidence" ? input === null ? "ABSTAIN" : "SEPARATE" : input === null ? "0.0%" : formatEffectiveWeight(selected.effectiveWeights[pillar.key])}</span>
                  <strong data-label={workbenchMode === "evidence" ? "AGGREGATE" : "CONTRIBUTION"}>{workbenchMode === "evidence" ? "NOT COMBINED" : input === null ? "—" : `+${contribution.toFixed(1)}`}</strong>
                  <p>{selected.evidence[pillar.key]}</p>
                </div>
              );
            })}
            <div className={styles.calculationLine}>
              <span>{workbenchMode === "evidence" ? "DECISION CONTRACT" : "RETIRED CALCULATION"}</span>
              <code>{workbenchMode === "evidence" ? "TRADING ∥ LEAD SHARE ∥ WORDING → BROKER REVIEW" : `${PILLARS.filter((pillar) => selected.normalised[pillar.key] !== null).map((pillar) => `${formatEffectiveWeight(selected.effectiveWeights[pillar.key])}×${selected.normalised[pillar.key]?.toFixed(1)}`).join(" + ")} = ${selected.score.toFixed(1)}`}</code>
            </div>
          </div>

          <aside className={styles.reviewCard} aria-labelledby="review-title">
            <span className={styles.cardKicker}>HUMAN OVERRIDE LOG</span>
            <h4 id="review-title">Review without rewriting the model</h4>
            <p>
              A broker pin adds context to the {workbenchMode === "evidence" ? "received panel" : "what-if shortlist"} but never hides an evidence gate.
            </p>
            <label>
              <span>Review reason</span>
              <select value={reviewReason} onChange={(event) => setReviewReason(event.target.value)}>
                <option>Broker context requires discussion</option>
                <option>Explore alternative panel construction</option>
                <option>Relationship context not modelled</option>
                <option>Specialist wording review requested</option>
              </select>
            </label>
            <MacButton
              primary
              onClick={() => togglePinned(selected)}
              disabled={!selected.eligible && !(pinned?.scenarioId === scenario.id && pinned.candidateId === selected.id)}
            >
              {pinned?.scenarioId === scenario.id && pinned.candidateId === selected.id
                ? "Remove review pin"
                : "Pin for broker review"}
            </MacButton>
            {!selected.eligible ? (
              <div className={styles.holdNotice} role="status">
                <strong>Review gate active</strong>
                <span>{selected.holds.join("; ")}. Resolve the evidence gate before pinning.</span>
              </div>
            ) : pinned?.scenarioId === scenario.id ? (
              <div className={styles.pinNotice} role="status">
                <strong>{pinned.candidateId === selected.id ? "This market is pinned" : "Another market is pinned"}</strong>
                <span>{pinned.reason}</span>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {workbenchMode === "retired-composite" && <section className={styles.comparisonPanel} aria-labelledby="comparison-title">
        <div className={styles.comparisonHeader}>
          <div className={styles.sectionHeading}>
            <span>05</span>
            <div>
              <p>SENSITIVITY VIEW</p>
              <h3 id="comparison-title">Compare the same market universe</h3>
            </div>
          </div>
          <label className={styles.compareSelect}>
            <span>Compare against</span>
            <select value={comparison.id} onChange={(event) => setComparisonId(event.target.value)}>
              {SCENARIOS.filter((item) => item.id !== scenario.id).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.compareTable} role="table" aria-label={`Rank comparison between ${scenario.name} and ${comparison.name}`}>
          <div className={styles.compareRow} role="row">
            <strong role="columnheader">MARKET</strong>
            <strong role="columnheader">{scenario.code}</strong>
            <strong role="columnheader">{comparison.code}</strong>
            <strong role="columnheader">MOVE</strong>
          </div>
          {ranked.map((candidate) => {
            const other = comparisonRanked.find((item) => item.id === candidate.id);
            return (
              <div className={styles.compareRow} role="row" key={candidate.id}>
                <span role="cell"><strong>{candidate.name}</strong><small>{candidate.descriptor}</small></span>
                <span role="cell">{candidate.rank ? `#${candidate.rank}` : "HELD"}<small>{candidate.score.toFixed(1)}</small></span>
                <span role="cell">{other?.rank ? `#${other.rank}` : "HELD"}<small>{other?.score.toFixed(1) ?? "—"}</small></span>
                <span role="cell"><RankDelta current={candidate.rank} comparison={other?.rank ?? null} /></span>
              </div>
            );
          })}
        </div>
        <p className={styles.compareCaption}>
          Same weights and guardrails; only the synthetic risk context changes. Rank movement exposes whether a
          market is generally strong or specifically aligned to the opportunity.
        </p>
      </section>}

      <details className={styles.modelCard}>
        <summary>
          <span><strong>Methodology & disclosure card</strong><small>What mirrors the research—and what is illustrative</small></span>
          <span aria-hidden="true">OPEN</span>
        </summary>
        <div className={styles.modelCardGrid}>
          <section>
            <span className={styles.groundedLabel}>SOURCE-GROUNDED CONCEPTS</span>
            <ul>
              <li>A risk-layer candidate contract with broker-supplied market order and three separate evidence agents.</li>
              <li>Historical trading performance as a LightGBM/LambdaRank risk-to-market signal with temporal evidence discipline.</li>
              <li>Availability-attested, recency-aware lead-share evidence and explicit confidence.</li>
              <li>Wording as inspectable evidence inside Quality—not a duplicate fourth vote.</li>
              <li>Cold-start fallbacks, market identity checks, null handling and broker review boundaries.</li>
              <li>The current audited implementation retires the cross-pillar composite until a shared objective is validated.</li>
            </ul>
          </section>
          <section>
            <span className={styles.illustrativeLabel}>ILLUSTRATIVE IN THIS PUBLIC DEMO</span>
            <ul>
              <li>Every risk, market identity, explanation, signal value and confidence level.</li>
              <li>The retired-sandbox adjustable weights, panel min–max transform and displayed composite equation.</li>
              <li>Every rank re-ordering and Top-3 outcome; these are sensitivity probes, not the current application&apos;s policy.</li>
              <li>The authority flag, evidence thresholds, review reasons and ranking outcomes.</li>
              <li>No model weights, training rows, source documents, internal endpoints or performance tables are included.</li>
            </ul>
          </section>
        </div>
        <p className={styles.modelBoundary}>
          This is an interaction model for explaining the research architecture. It is not underwriting advice,
          current appetite, available capacity, a quote, or an insurer recommendation.
        </p>
      </details>
    </DemoWindow>
  );
}
