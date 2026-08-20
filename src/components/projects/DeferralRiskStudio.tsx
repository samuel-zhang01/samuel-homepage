"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./DeferralRiskStudio.module.css";

type StudioView = "decisions" | "tradeoff" | "tail" | "method";
type PolicyMode = "combined" | "confidence" | "entropy";
type Split = "train" | "test";

type ClaimRecord = {
  id: string;
  split: Split;
  truth: 0 | 1;
  prediction: 0 | 1;
  investigatorPrediction: 0 | 1;
  modelCorrect: boolean;
  investigatorCorrect: boolean;
  amount: number;
  premium: number;
  claimRatio: number;
  policyAgeDays: number;
  monthsAsCustomer: number;
  incidentHour: number;
  incidentType: string;
  severity: string;
  rawConfidence: number;
  confidence: number;
  fraudProbability: number;
  likelihoodRatios: readonly number[];
  posterior: number;
  entropy: number;
};

type PolicySettings = {
  mode: PolicyMode;
  entropyThreshold: number;
  confidenceThreshold: number;
  delta: number;
  lambda: number;
};

type Evaluation = {
  coverage: number;
  deferralRate: number;
  retainedCount: number;
  deferredCount: number;
  retainedAccuracy: number | null;
  systemAccuracy: number;
  cvar: number;
  tailCount: number;
  objective: number;
  entropyOnly: number;
  confidenceOnly: number;
  bothSignals: number;
  retained: ClaimRecord[];
  deferred: ClaimRecord[];
  tail: ClaimRecord[];
};

type CurvePoint = {
  coverage: number;
  accuracy: number;
  cvar: number;
  threshold: number;
};

const SOURCE_URL = "https://github.com/samuel-zhang01/IX-Safety-Latex/tree/00c5099469c98fb6271a1754d6cf565963df898a";
const PRIOR_FRAUD = 0.247;
const DEFAULT_ENTROPY = 0.9;
const DEFAULT_CONFIDENCE = 0.65;
const DEFAULT_DELTA = 0.1;
const DEFAULT_LAMBDA = 0.5;
const TEST_SIZE = 200;
const CORPUS_SIZE = 1000;

const VIEWS: readonly { id: StudioView; label: string; hint: string }[] = [
  { id: "decisions", label: "Decision desk", hint: "Inspect the OR gate" },
  { id: "tradeoff", label: "Coverage lab", hint: "Sweep selective risk" },
  { id: "tail", label: "CVaR ledger", hint: "Audit the worst decile" },
  { id: "method", label: "Research notes", hint: "Evidence and limits" },
];

const INCIDENT_TYPES = [
  "Single vehicle",
  "Multi-vehicle",
  "Vehicle theft",
  "Parked car",
] as const;

const SEVERITIES = ["Trivial", "Minor", "Major", "Total loss"] as const;

const BAYES_FEATURES = [
  "Total claim amount",
  "Policy age (days)",
  "Months as customer",
  "Incident hour",
] as const;

function mix32(value: number, salt: number) {
  let mixed = Math.imul(value + 1 + salt * 101, 0x45d9f3b);
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
  mixed ^= mixed >>> 16;
  return mixed >>> 0;
}

function unit(value: number, salt: number) {
  return mix32(value, salt) / 0xffffffff;
}

function selectExact(indices: readonly number[], count: number, salt: number) {
  return new Set(
    [...indices]
      .sort((left, right) => mix32(left, salt) - mix32(right, salt) || left - right)
      .slice(0, count),
  );
}

function binaryEntropy(probability: number) {
  const p = Math.min(1 - 1e-10, Math.max(1e-10, probability));
  return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
}

function bayesPosterior(prior: number, likelihoodRatios: readonly number[]) {
  let odds = prior / (1 - prior);
  likelihoodRatios.forEach((ratio) => {
    odds *= ratio;
  });
  return odds / (1 + odds);
}

const CALIBRATION_KNOTS = [
  [0.5, 0.52],
  [0.6, 0.59],
  [0.7, 0.66],
  [0.8, 0.76],
  [0.9, 0.88],
  [1, 0.97],
] as const;

function isotonicStandIn(raw: number) {
  const bounded = Math.min(1, Math.max(0.5, raw));
  for (let index = 1; index < CALIBRATION_KNOTS.length; index += 1) {
    const [rightX, rightY] = CALIBRATION_KNOTS[index];
    const [leftX, leftY] = CALIBRATION_KNOTS[index - 1];
    if (bounded <= rightX) {
      const position = (bounded - leftX) / (rightX - leftX);
      return leftY + position * (rightY - leftY);
    }
  }
  return CALIBRATION_KNOTS.at(-1)?.[1] ?? 0.97;
}

const TEST_INDICES = Array.from({ length: TEST_SIZE }, (_, index) => index);
const TRAIN_INDICES = Array.from({ length: CORPUS_SIZE - TEST_SIZE }, (_, index) => index + TEST_SIZE);
const TEST_FRAUD = selectExact(TEST_INDICES, 49, 11);
const TRAIN_FRAUD = selectExact(TRAIN_INDICES, 198, 13);

const DIFFICULTY_ORDER = [...TEST_INDICES].sort(
  (left, right) => mix32(left, 17) - mix32(right, 17) || left - right,
);
const DIFFICULTY_RANK = new Map(DIFFICULTY_ORDER.map((claimIndex, rank) => [claimIndex, rank]));
const CONFIDENCE_GROUP = DIFFICULTY_ORDER.slice(0, 46);
const ENTROPY_EXTENSION = DIFFICULTY_ORDER.slice(46, 72);
const RETAINED_GROUP = DIFFICULTY_ORDER.slice(72);

// These exact, deterministic counts reproduce the manuscript's aggregate test result:
// XGB 162/200; confidence policy 180/200; combined policy 179/200.
const MODEL_CORRECT_A = selectExact(CONFIDENCE_GROUP, 23, 23);
const MODEL_CORRECT_B = selectExact(ENTROPY_EXTENSION, 23, 29);
const MODEL_CORRECT_C = selectExact(RETAINED_GROUP, 116, 31);
const INVESTIGATOR_CORRECT_A = selectExact(CONFIDENCE_GROUP, 41, 37);
const INVESTIGATOR_CORRECT_B = selectExact(ENTROPY_EXTENSION, 22, 41);
const INVESTIGATOR_CORRECT_C = selectExact(RETAINED_GROUP, 109, 43);

function isInAny(index: number, ...sets: readonly Set<number>[]) {
  return sets.some((set) => set.has(index));
}

function buildClaim(index: number): ClaimRecord {
  const split: Split = index < TEST_SIZE ? "test" : "train";
  const truth = (split === "test" ? TEST_FRAUD.has(index) : TRAIN_FRAUD.has(index)) ? 1 : 0;
  const difficultyRank = split === "test" ? (DIFFICULTY_RANK.get(index) ?? 199) : Math.floor(unit(index, 17) * 200);
  const confidenceBranch = split === "test" ? difficultyRank < 46 : unit(index, 47) < 0.23;
  const entropyBranch = split === "test"
    ? difficultyRank >= 22 && difficultyRank < 72
    : unit(index, 53) < 0.25;

  const targetPosterior = entropyBranch
    ? 0.38 + unit(index, 59) * 0.24
    : truth === 1
      ? 0.74 + unit(index, 61) * 0.2
      : 0.06 + unit(index, 67) * 0.2;
  const targetOdds = targetPosterior / (1 - targetPosterior);
  const priorOdds = PRIOR_FRAUD / (1 - PRIOR_FRAUD);
  const totalLikelihoodRatio = targetOdds / priorOdds;
  const likelihoodRatios = [0.28, 0.31, 0.23, 0.18].map((weight) =>
    Math.pow(totalLikelihoodRatio, weight),
  );
  const posterior = bayesPosterior(PRIOR_FRAUD, likelihoodRatios);
  const entropy = binaryEntropy(posterior);

  const rawConfidence = confidenceBranch
    ? 0.5 + unit(index, 71) * 0.18
    : 0.7 + unit(index, 73) * 0.28;
  const confidence = isotonicStandIn(rawConfidence);

  const modelCorrect = split === "test"
    ? isInAny(index, MODEL_CORRECT_A, MODEL_CORRECT_B, MODEL_CORRECT_C)
    : unit(index, 79) < 0.81;
  const investigatorCorrect = split === "test"
    ? isInAny(index, INVESTIGATOR_CORRECT_A, INVESTIGATOR_CORRECT_B, INVESTIGATOR_CORRECT_C)
    : unit(index, 83) < (entropy > 0.8 ? 0.9 : 0.85);
  const prediction = (modelCorrect ? truth : 1 - truth) as 0 | 1;
  const investigatorPrediction = (investigatorCorrect ? truth : 1 - truth) as 0 | 1;

  const premium = Math.round(433 + unit(index, 89) * 1615);
  const amount = Math.round(100 + unit(index, 97) * 114820);

  return {
    id: `SYN-${String(index + 1).padStart(4, "0")}`,
    split,
    truth,
    prediction,
    investigatorPrediction,
    modelCorrect,
    investigatorCorrect,
    amount,
    premium,
    claimRatio: amount / premium,
    policyAgeDays: Math.round(unit(index, 101) * 5800),
    monthsAsCustomer: Math.round(unit(index, 103) * 479),
    incidentHour: Math.floor(unit(index, 107) * 24),
    incidentType: INCIDENT_TYPES[Math.floor(unit(index, 109) * INCIDENT_TYPES.length)],
    severity: SEVERITIES[Math.floor(unit(index, 113) * SEVERITIES.length)],
    rawConfidence,
    confidence,
    fraudProbability: prediction === 1 ? confidence : 1 - confidence,
    likelihoodRatios,
    posterior,
    entropy,
  };
}

const SYNTHETIC_CORPUS = Array.from({ length: CORPUS_SIZE }, (_, index) => buildClaim(index));
const TEST_CLAIMS = SYNTHETIC_CORPUS.filter((claim) => claim.split === "test");
const SYNTHETIC_FRAUD_COUNT = SYNTHETIC_CORPUS.filter((claim) => claim.truth === 1).length;
const DEFAULT_SELECTED_CLAIM_ID = [...TEST_CLAIMS]
  .sort((left, right) => right.entropy - left.entropy || left.id.localeCompare(right.id))[0]?.id
  ?? "SYN-0001";

function shouldDefer(claim: ClaimRecord, settings: PolicySettings) {
  const entropyTrigger = claim.entropy > settings.entropyThreshold;
  const confidenceTrigger = claim.confidence < settings.confidenceThreshold;
  if (settings.mode === "entropy") return entropyTrigger;
  if (settings.mode === "confidence") return confidenceTrigger;
  return entropyTrigger || confidenceTrigger;
}

function evaluatePolicy(claims: readonly ClaimRecord[], settings: PolicySettings): Evaluation {
  const retained = claims.filter((claim) => !shouldDefer(claim, settings));
  const deferred = claims.filter((claim) => shouldDefer(claim, settings));
  const retainedCorrect = retained.filter((claim) => claim.modelCorrect).length;
  const systemCorrect = claims.filter((claim) =>
    shouldDefer(claim, settings) ? claim.investigatorCorrect : claim.modelCorrect,
  ).length;
  const sortedRetained = [...retained];
  // Put 0-1 errors first; among equal losses, expose the most uncertain cases first.
  sortedRetained.sort((left, right) =>
    Number(left.modelCorrect) - Number(right.modelCorrect)
      || right.entropy - left.entropy
      || left.id.localeCompare(right.id),
  );
  const tailCount = retained.length ? Math.max(1, Math.ceil(settings.delta * retained.length)) : 0;
  const tail = sortedRetained.slice(0, tailCount);
  const cvar = tailCount
    ? tail.reduce((total, claim) => total + (claim.modelCorrect ? 0 : 1), 0) / tailCount
    : 0;
  const systemAccuracy = systemCorrect / claims.length;
  const entropyOnly = claims.filter((claim) => claim.entropy > settings.entropyThreshold).length;
  const confidenceOnly = claims.filter((claim) => claim.confidence < settings.confidenceThreshold).length;
  const bothSignals = claims.filter((claim) =>
    claim.entropy > settings.entropyThreshold && claim.confidence < settings.confidenceThreshold,
  ).length;

  return {
    coverage: retained.length / claims.length,
    deferralRate: deferred.length / claims.length,
    retainedCount: retained.length,
    deferredCount: deferred.length,
    retainedAccuracy: retained.length ? retainedCorrect / retained.length : null,
    systemAccuracy,
    cvar,
    tailCount,
    objective: systemAccuracy - settings.lambda * cvar,
    entropyOnly,
    confidenceOnly,
    bothSignals,
    retained,
    deferred,
    tail,
  };
}

function buildCurve(claims: readonly ClaimRecord[], settings: PolicySettings): CurvePoint[] {
  const thresholds = Array.from({ length: 18 }, (_, index) =>
    settings.mode === "confidence" ? 0.5 + index * (0.36 / 17) : 0.5 + index * (0.49 / 17),
  );
  return thresholds
    .map((threshold) => {
      const trial = evaluatePolicy(claims, {
        ...settings,
        entropyThreshold: settings.mode === "confidence" ? settings.entropyThreshold : threshold,
        confidenceThreshold: settings.mode === "confidence" ? threshold : settings.confidenceThreshold,
      });
      return {
        coverage: trial.coverage,
        accuracy: trial.systemAccuracy,
        cvar: trial.cvar,
        threshold,
      };
    })
    .sort((left, right) => left.coverage - right.coverage || left.threshold - right.threshold);
}

function percent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function money(value: number) {
  return `£${value.toLocaleString("en-GB")}`;
}

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

function policyLabel(mode: PolicyMode) {
  if (mode === "confidence") return "Confidence only";
  if (mode === "entropy") return "Entropy only";
  return "Combined OR";
}

export function DeferralRiskStudio() {
  const [view, setView] = useState<StudioView>("decisions");
  const [mode, setMode] = useState<PolicyMode>("combined");
  const [entropyThreshold, setEntropyThreshold] = useState(DEFAULT_ENTROPY);
  const [confidenceThreshold, setConfidenceThreshold] = useState(DEFAULT_CONFIDENCE);
  const [delta, setDelta] = useState(DEFAULT_DELTA);
  const [lambda, setLambda] = useState(DEFAULT_LAMBDA);
  const [selectedClaimId, setSelectedClaimId] = useState(DEFAULT_SELECTED_CLAIM_ID);

  const settings = useMemo<PolicySettings>(() => ({
    mode,
    entropyThreshold,
    confidenceThreshold,
    delta,
    lambda,
  }), [confidenceThreshold, delta, entropyThreshold, lambda, mode]);
  const evaluation = useMemo(() => evaluatePolicy(TEST_CLAIMS, settings), [settings]);
  const curve = useMemo(() => buildCurve(TEST_CLAIMS, settings), [settings]);
  const selectedClaim = TEST_CLAIMS.find((claim) => claim.id === selectedClaimId) ?? TEST_CLAIMS[0];
  const isReportedSettings = mode === "combined"
    && entropyThreshold === DEFAULT_ENTROPY
    && confidenceThreshold === DEFAULT_CONFIDENCE
    && delta === DEFAULT_DELTA
    && lambda === DEFAULT_LAMBDA;

  const reset = () => {
    setMode("combined");
    setEntropyThreshold(DEFAULT_ENTROPY);
    setConfidenceThreshold(DEFAULT_CONFIDENCE);
    setDelta(DEFAULT_DELTA);
    setLambda(DEFAULT_LAMBDA);
  };

  return (
    <DemoWindow
      appName="SAFE-L2D LAB"
      title="Fraud-risk deferral workbench"
      status={isReportedSettings ? "PAPER POINT LOADED" : "SYNTHETIC POLICY ACTIVE"}
      statusTone="safe"
      className={styles.studio}
      footer={(
        <div className={styles.footerLine}>
          <span>1,000 fictional records · 200-row test bench · seed locked</span>
          <span>{policyLabel(mode)} · {evaluation.retainedCount} automated / {evaluation.deferredCount} reviewed</span>
        </div>
      )}
    >
      <section className={styles.researchBanner} aria-label="Research and licensing disclosure">
        <div className={styles.researchIcon} aria-hidden="true">§</div>
        <div>
          <strong>Fictional research simulator — never adjudicate a real claim with this page.</strong>
          <p>
            Records are synthetic and contain no claimant data; the 200-row outcomes are deliberately shaped to expose
            the reported aggregate arithmetic, not to independently validate it. The repository is publicly inspectable,
            but the inspected source snapshot has <em>no explicit licence</em>; public visibility does not grant reuse rights.
          </p>
        </div>
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">Inspect source ↗</a>
      </section>

      <nav className={styles.viewTabs} aria-label="Safe deferral studio views">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? styles.activeView : ""}
            aria-pressed={view === item.id}
            onClick={() => setView(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className={styles.labCanvas}>
        <section className={styles.policyPanel} aria-labelledby="policy-controls-title">
          <div className={styles.panelHeading}>
            <div>
              <span>POLICY CONSOLE</span>
              <h3 id="policy-controls-title">Choose what the classifier may decide</h3>
            </div>
            <MacButton type="button" onClick={reset}>Restore paper point</MacButton>
          </div>

          <div className={styles.modeSwitch} aria-label="Deferral policy comparison">
            {(["combined", "confidence", "entropy"] as const).map((policyMode) => (
              <button
                key={policyMode}
                type="button"
                aria-pressed={mode === policyMode}
                className={mode === policyMode ? styles.activeMode : ""}
                onClick={() => setMode(policyMode)}
              >
                {policyLabel(policyMode)}
              </button>
            ))}
          </div>

          <div className={styles.sliderGrid}>
            <label htmlFor="safe-l2d-entropy">
              <span>Bayesian entropy τ</span>
              <output htmlFor="safe-l2d-entropy">{entropyThreshold.toFixed(2)} bits</output>
              <input
                id="safe-l2d-entropy"
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={entropyThreshold}
                disabled={mode === "confidence"}
                onChange={(event) => setEntropyThreshold(Number(event.target.value))}
              />
              <small>Defer when H(π) &gt; τ</small>
            </label>
            <label htmlFor="safe-l2d-confidence">
              <span>Calibrated confidence κ</span>
              <output htmlFor="safe-l2d-confidence">{confidenceThreshold.toFixed(2)}</output>
              <input
                id="safe-l2d-confidence"
                type="range"
                min="0.5"
                max="0.85"
                step="0.01"
                value={confidenceThreshold}
                disabled={mode === "entropy"}
                onChange={(event) => setConfidenceThreshold(Number(event.target.value))}
              />
              <small>Defer when max calibrated p &lt; κ</small>
            </label>
            <label htmlFor="safe-l2d-lambda">
              <span>CVaR penalty λ</span>
              <output htmlFor="safe-l2d-lambda">{lambda.toFixed(1)}× tail risk</output>
              <input
                id="safe-l2d-lambda"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={lambda}
                onChange={(event) => setLambda(Number(event.target.value))}
              />
              <small>Current-policy score = system accuracy − λ · CVaR; this control does not optimise a threshold.</small>
            </label>
            <fieldset className={styles.deltaSwitch}>
              <legend>Worst-tail share δ</legend>
              <div>
                {[0.05, 0.1, 0.2].map((riskLevel) => (
                  <button
                    key={riskLevel}
                    type="button"
                    aria-pressed={delta === riskLevel}
                    className={delta === riskLevel ? styles.activeMode : ""}
                    onClick={() => setDelta(riskLevel)}
                  >
                    {Math.round(riskLevel * 100)}%
                  </button>
                ))}
              </div>
              <small>The manuscript fixes δ at 10%.</small>
            </fieldset>
          </div>

          <div className={styles.ruleReadout} aria-live="polite">
            <code>
              defer = {mode !== "confidence" ? `H(π) > ${entropyThreshold.toFixed(2)}` : "entropy off"}
              {mode === "combined" ? " OR " : " · "}
              {mode !== "entropy" ? `confidence < ${confidenceThreshold.toFixed(2)}` : "confidence off"}
            </code>
            <span>
              {evaluation.entropyOnly} entropy hits · {evaluation.confidenceOnly} confidence hits · {evaluation.bothSignals} overlap
            </span>
          </div>
        </section>

        <section className={styles.metricStrip} aria-label="Calculated policy metrics" aria-live="polite">
          <article className={styles.metricCard}>
            <span>Classifier coverage</span>
            <strong>{percent(evaluation.coverage, 0)}</strong>
            <small>{evaluation.retainedCount} of {TEST_SIZE} claims automated</small>
          </article>
          <article className={styles.metricCard}>
            <span>System accuracy</span>
            <strong>{percent(evaluation.systemAccuracy)}</strong>
            <small>Model + deterministic investigator outcomes</small>
          </article>
          <article className={styles.metricCard}>
            <span>Retained accuracy</span>
            <strong>{evaluation.retainedAccuracy === null ? "—" : percent(evaluation.retainedAccuracy)}</strong>
            <small>Classifier-handled claims only</small>
          </article>
          <article className={styles.metricCard}>
            <span>CVaR<sub>{Math.round(delta * 100)}</sub></span>
            <strong>{evaluation.cvar.toFixed(3)}</strong>
            <small>{evaluation.tailCount} retained tail samples</small>
          </article>
          <article className={`${styles.metricCard} ${styles.objectiveCard}`}>
            <span>Current-policy risk score</span>
            <strong>{evaluation.objective.toFixed(3)}</strong>
            <small>{percent(evaluation.systemAccuracy)} − {lambda.toFixed(1)} × {evaluation.cvar.toFixed(3)}</small>
          </article>
        </section>

        {isReportedSettings ? (
          <div className={styles.matchBanner} role="status">
            <strong>Reported operating point reconstructed:</strong>
            <span>89.5% system accuracy at 64% coverage · 95% CI [85.0%, 93.5%] · +8.5pp vs XGBoost</span>
          </div>
        ) : null}

        {view === "decisions" ? (
          <DecisionDesk
            settings={settings}
            evaluation={evaluation}
            selectedClaim={selectedClaim}
            onSelectClaim={setSelectedClaimId}
          />
        ) : null}
        {view === "tradeoff" ? (
          <CoverageLab settings={settings} evaluation={evaluation} curve={curve} />
        ) : null}
        {view === "tail" ? (
          <TailLedger settings={settings} evaluation={evaluation} onSelectClaim={(claimId) => {
            setSelectedClaimId(claimId);
            setView("decisions");
          }} />
        ) : null}
        {view === "method" ? <ResearchNotes /> : null}
      </div>
    </DemoWindow>
  );
}

function DecisionDesk({
  settings,
  evaluation,
  selectedClaim,
  onSelectClaim,
}: {
  settings: PolicySettings;
  evaluation: Evaluation;
  selectedClaim: ClaimRecord;
  onSelectClaim: (claimId: string) => void;
}) {
  const queue = useMemo(() => [...TEST_CLAIMS].sort((left, right) => {
    const leftDeferred = Number(shouldDefer(left, settings));
    const rightDeferred = Number(shouldDefer(right, settings));
    return rightDeferred - leftDeferred
      || right.entropy - left.entropy
      || left.confidence - right.confidence
      || left.id.localeCompare(right.id);
  }).slice(0, 12), [settings]);

  const trace = selectedClaim.likelihoodRatios.reduce<{ prior: number; posterior: number }[]>((steps, ratio) => {
    const prior = steps.at(-1)?.posterior ?? PRIOR_FRAUD;
    return [...steps, { prior, posterior: bayesPosterior(prior, [ratio]) }];
  }, []);
  const selectedDeferred = shouldDefer(selectedClaim, settings);

  return (
    <div className={styles.viewStack}>
      <section className={styles.pipeline} aria-label="Safe L2D decision pipeline">
        <article>
          <span>01</span><strong>KDE evidence</strong><small>Four paper features → likelihood ratios</small>
        </article>
        <i aria-hidden="true">›</i>
        <article>
          <span>02</span><strong>Two uncertainties</strong><small>Bayesian entropy + isotonic confidence</small>
        </article>
        <i aria-hidden="true">›</i>
        <article>
          <span>03</span><strong>OR rejector</strong><small>Either unsafe signal can defer</small>
        </article>
        <i aria-hidden="true">›</i>
        <article>
          <span>04</span><strong>Route</strong><small>Classifier decides or investigator reviews</small>
        </article>
      </section>

      <div className={styles.decisionGrid}>
        <section className={styles.plotPanel} aria-labelledby="uncertainty-map-title">
          <div className={styles.sectionHeading}>
            <div><span>TEST SET · N=200</span><h3 id="uncertainty-map-title">Uncertainty decision map</h3></div>
            <div className={styles.legend} aria-hidden="true"><i /> retained <i /> deferred</div>
          </div>
          <UncertaintyMap settings={settings} selectedClaim={selectedClaim} />
          <p className={styles.chartNote}>Entropy is computed from a sequential Bayesian posterior. Confidence is a monotone isotonic-style stand-in, not a fitted production calibrator.</p>
        </section>

        <section className={styles.claimInspector} aria-labelledby="claim-inspector-title">
          <div className={styles.sectionHeading}>
            <div><span>SELECTED SYNTHETIC CLAIM</span><h3 id="claim-inspector-title">{selectedClaim.id}</h3></div>
            <span className={selectedDeferred ? styles.deferBadge : styles.retainBadge}>
              {selectedDeferred ? "DEFER TO REVIEW" : "MODEL DECIDES"}
            </span>
          </div>
          <dl className={styles.claimFacts}>
            <div><dt>Claim</dt><dd>{money(selectedClaim.amount)}</dd></div>
            <div><dt>Premium</dt><dd>{money(selectedClaim.premium)}</dd></div>
            <div><dt>Ratio</dt><dd>{selectedClaim.claimRatio.toFixed(1)}×</dd></div>
            <div><dt>Incident</dt><dd>{selectedClaim.incidentType}</dd></div>
            <div><dt>Severity</dt><dd>{selectedClaim.severity}</dd></div>
            <div><dt>Truth</dt><dd>{selectedClaim.truth ? "Fraud" : "Legitimate"}</dd></div>
          </dl>

          <div className={styles.bayesTrace}>
            <div className={styles.traceHeader}>
              <strong>Sequential Bayes trace</strong>
              <span>prior {PRIOR_FRAUD.toFixed(3)} → posterior {selectedClaim.posterior.toFixed(3)}</span>
            </div>
            {trace.map((step, index) => (
              <div key={BAYES_FEATURES[index]} className={styles.traceRow}>
                <span>{BAYES_FEATURES[index]}</span>
                <code>LR {selectedClaim.likelihoodRatios[index].toFixed(2)}</code>
                <div><i style={{ "--trace-fill": `${step.posterior * 100}%` } as CSSProperties} /></div>
                <strong>{step.posterior.toFixed(3)}</strong>
              </div>
            ))}
          </div>

          <div className={styles.signalPair}>
            <article className={selectedClaim.entropy > settings.entropyThreshold ? styles.signalHot : ""}>
              <span>H(π)</span><strong>{selectedClaim.entropy.toFixed(3)} bits</strong>
              <small>{selectedClaim.entropy > settings.entropyThreshold ? "crosses τ" : "within τ"}</small>
            </article>
            <article className={selectedClaim.confidence < settings.confidenceThreshold ? styles.signalHot : ""}>
              <span>cal. confidence</span><strong>{selectedClaim.confidence.toFixed(3)}</strong>
              <small>raw {selectedClaim.rawConfidence.toFixed(3)}</small>
            </article>
          </div>
        </section>
      </div>

      <section className={styles.queuePanel} aria-labelledby="review-queue-title">
        <div className={styles.sectionHeading}>
          <div><span>OR-GATE PRIORITY</span><h3 id="review-queue-title">Synthetic claim queue</h3></div>
          <span>{evaluation.deferredCount} routed to review</span>
        </div>
        <div className={styles.tableScroll} tabIndex={0} aria-label="Scrollable synthetic claim queue">
          <table>
            <thead><tr><th scope="col">Claim</th><th scope="col">Amount</th><th scope="col">Posterior</th><th scope="col">Entropy</th><th scope="col">Confidence</th><th scope="col">Trigger</th><th scope="col">Route</th></tr></thead>
            <tbody>
              {queue.map((claim) => {
                const entropyHit = claim.entropy > settings.entropyThreshold;
                const confidenceHit = claim.confidence < settings.confidenceThreshold;
                const deferred = shouldDefer(claim, settings);
                return (
                  <tr key={claim.id} className={claim.id === selectedClaim.id ? styles.selectedRow : ""}>
                    <td><button type="button" onClick={() => onSelectClaim(claim.id)} aria-pressed={claim.id === selectedClaim.id}>{claim.id}</button></td>
                    <td>{money(claim.amount)}</td>
                    <td>{percent(claim.posterior)}</td>
                    <td>{claim.entropy.toFixed(3)}</td>
                    <td>{claim.confidence.toFixed(3)}</td>
                    <td>{entropyHit && confidenceHit ? "both" : entropyHit ? "entropy" : confidenceHit ? "confidence" : "—"}</td>
                    <td><span className={deferred ? styles.deferCell : styles.retainCell}>{deferred ? "review" : "auto"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function UncertaintyMap({ settings, selectedClaim }: { settings: PolicySettings; selectedClaim: ClaimRecord }) {
  const width = 620;
  const height = 280;
  const left = 52;
  const top = 20;
  const plotWidth = 540;
  const plotHeight = 210;
  const x = (entropy: number) => left + clamp(entropy, 0, 1) * plotWidth;
  const y = (confidence: number) => top + (1 - (clamp(confidence, 0.5, 1) - 0.5) / 0.5) * plotHeight;
  const deferredCount = TEST_CLAIMS.filter((claim) => shouldDefer(claim, settings)).length;

  return (
    <svg
      className={styles.uncertaintyMap}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Entropy versus calibrated confidence for 200 fictional test claims. ${deferredCount} are deferred by the current ${policyLabel(settings.mode)} policy.`}
    >
      <rect x={left} y={top} width={plotWidth} height={plotHeight} className={styles.plotBack} />
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={`x-${tick}`}>
          <line x1={x(tick)} x2={x(tick)} y1={top} y2={top + plotHeight} className={styles.gridLine} />
          <text x={x(tick)} y={top + plotHeight + 19} textAnchor="middle">{tick.toFixed(2)}</text>
        </g>
      ))}
      {[0.5, 0.65, 0.8, 0.95].map((tick) => (
        <g key={`y-${tick}`}>
          <line x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} className={styles.gridLine} />
          <text x={left - 9} y={y(tick) + 3} textAnchor="end">{tick.toFixed(2)}</text>
        </g>
      ))}
      {settings.mode !== "confidence" ? (
        <line x1={x(settings.entropyThreshold)} x2={x(settings.entropyThreshold)} y1={top} y2={top + plotHeight} className={styles.thresholdLine} />
      ) : null}
      {settings.mode !== "entropy" ? (
        <line x1={left} x2={left + plotWidth} y1={y(settings.confidenceThreshold)} y2={y(settings.confidenceThreshold)} className={styles.thresholdLine} />
      ) : null}
      {TEST_CLAIMS.map((claim) => (
        <circle
          key={claim.id}
          cx={x(claim.entropy)}
          cy={y(claim.confidence)}
          r={claim.id === selectedClaim.id ? 5.5 : 3.1}
          className={claim.id === selectedClaim.id
            ? styles.selectedDot
            : shouldDefer(claim, settings) ? styles.deferredDot : styles.retainedDot}
        />
      ))}
      <text x={left + plotWidth / 2} y={height - 7} textAnchor="middle" className={styles.axisLabel}>Bayesian posterior entropy H(π), bits</text>
      <text transform={`translate(13 ${top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" className={styles.axisLabel}>Calibrated classifier confidence</text>
    </svg>
  );
}

function CoverageLab({ settings, evaluation, curve }: { settings: PolicySettings; evaluation: Evaluation; curve: CurvePoint[] }) {
  const chartWidth = 660;
  const chartHeight = 300;
  const left = 58;
  const top = 24;
  const plotWidth = 560;
  const plotHeight = 220;
  const x = (coverage: number) => left + clamp((coverage - 0.2) / 0.8, 0, 1) * plotWidth;
  const y = (accuracy: number) => top + (1 - clamp((accuracy - 0.75) / 0.25, 0, 1)) * plotHeight;
  const path = curve.map((point, index) => `${index ? "L" : "M"} ${x(point.coverage).toFixed(1)} ${y(point.accuracy).toFixed(1)}`).join(" ");

  return (
    <div className={styles.viewStack}>
      <div className={styles.tradeoffGrid}>
        <section className={styles.plotPanel} aria-labelledby="coverage-chart-title">
          <div className={styles.sectionHeading}>
            <div><span>THRESHOLD SWEEP · FICTIONAL TEST BENCH</span><h3 id="coverage-chart-title">Coverage versus system accuracy</h3></div>
            <span>{policyLabel(settings.mode)}</span>
          </div>
          <svg
            className={styles.coverageChart}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label={`Calculated coverage accuracy curve for the ${policyLabel(settings.mode)} policy. Current point is ${percent(evaluation.coverage)} coverage and ${percent(evaluation.systemAccuracy)} system accuracy.`}
          >
            <rect x={left} y={top} width={plotWidth} height={plotHeight} className={styles.plotBack} />
            {[0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
              <g key={`cx-${tick}`}>
                <line x1={x(tick)} x2={x(tick)} y1={top} y2={top + plotHeight} className={styles.gridLine} />
                <text x={x(tick)} y={top + plotHeight + 20} textAnchor="middle">{Math.round(tick * 100)}%</text>
              </g>
            ))}
            {[0.75, 0.8, 0.85, 0.9, 0.95, 1].map((tick) => (
              <g key={`cy-${tick}`}>
                <line x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} className={styles.gridLine} />
                <text x={left - 9} y={y(tick) + 3} textAnchor="end">{Math.round(tick * 100)}%</text>
              </g>
            ))}
            <path d={path} className={styles.curveLine} />
            {curve.map((point) => <circle key={`${point.threshold}-${point.coverage}`} cx={x(point.coverage)} cy={y(point.accuracy)} r="3" className={styles.curveDot} />)}
            <circle cx={x(evaluation.coverage)} cy={y(evaluation.systemAccuracy)} r="6" className={styles.currentPoint} />
            <circle cx={x(0.64)} cy={y(0.895)} r="5" className={styles.reportedPoint} />
            <circle cx={x(0.77)} cy={y(0.9)} r="5" className={styles.baselinePoint} />
            <circle cx={x(1)} cy={y(0.81)} r="5" className={styles.xgbPoint} />
            <text x={x(0.64) + 8} y={y(0.895) - 9} className={styles.annotation}>Safe-L2D report</text>
            <text x={x(0.77) + 8} y={y(0.9) + 17} className={styles.annotation}>confidence report</text>
            <text x={x(1) - 7} y={y(0.81) - 10} textAnchor="end" className={styles.annotation}>XGB report</text>
            <text x={left + plotWidth / 2} y={chartHeight - 8} textAnchor="middle" className={styles.axisLabel}>Classifier coverage (not deferred)</text>
            <text transform={`translate(14 ${top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" className={styles.axisLabel}>System accuracy</text>
          </svg>
          <p className={styles.chartNote}>The line recomputes all 200 synthetic outcomes while sweeping the active threshold. The three labelled comparison points are fixed manuscript results, not re-estimates.</p>
        </section>

        <aside className={styles.benchmarkPanel} aria-label="Reported benchmark results">
          <div className={styles.sectionHeading}><div><span>FIXED REPORTED RESULTS</span><h3>What the small study actually found</h3></div></div>
          <article className={styles.benchmarkHero}>
            <span>Safe-L2D-Fraud</span>
            <strong>89.5%</strong>
            <p>system accuracy at <b>64% coverage</b></p>
            <small>95% CI [85.0%, 93.5%] · 36% deferred</small>
          </article>
          <div className={styles.benchmarkPair}>
            <article><span>Confidence baseline</span><strong>90.0%</strong><small>23% deferred · CVaR 0.938</small></article>
            <article><span>XGBoost</span><strong>81.0%</strong><small>0% deferred · +8.5pp gap</small></article>
          </div>
          <div className={styles.cautionBox}>
            <strong>No demonstrated win over confidence-only.</strong>
            <p>The bootstrap intervals overlap. The 0.923 vs 0.938 CVaR direction is not statistically significant; confidence-only is slightly more accurate while reviewing fewer claims.</p>
          </div>
        </aside>
      </div>

      <section className={styles.policyComparison} aria-labelledby="policy-comparison-title">
        <div className={styles.sectionHeading}><div><span>SAME 200 FICTIONAL OUTCOMES</span><h3 id="policy-comparison-title">Policy comparison at paper thresholds</h3></div></div>
        <div className={styles.comparisonCards}>
          {([
            { mode: "combined", label: "Combined OR", detail: "H(π) > .90 OR confidence < .65" },
            { mode: "confidence", label: "Confidence", detail: "confidence < .65" },
            { mode: "entropy", label: "Entropy", detail: "H(π) > .90" },
          ] as const).map((candidate) => {
            const result = evaluatePolicy(TEST_CLAIMS, {
              ...settings,
              mode: candidate.mode,
              entropyThreshold: DEFAULT_ENTROPY,
              confidenceThreshold: DEFAULT_CONFIDENCE,
              delta: DEFAULT_DELTA,
            });
            return (
              <article key={candidate.mode} className={candidate.mode === settings.mode ? styles.activeComparison : ""}>
                <span>{candidate.label}</span><strong>{percent(result.systemAccuracy)}</strong>
                <p>{percent(result.coverage, 0)} coverage · {result.deferredCount} reviews</p>
                <small>{candidate.detail}</small>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TailLedger({
  settings,
  evaluation,
  onSelectClaim,
}: {
  settings: PolicySettings;
  evaluation: Evaluation;
  onSelectClaim: (claimId: string) => void;
}) {
  const tailErrors = evaluation.tail.filter((claim) => !claim.modelCorrect).length;
  return (
    <div className={styles.viewStack}>
      <div className={styles.tailGrid}>
        <section className={styles.tailPanel} aria-labelledby="tail-risk-title">
          <div className={styles.sectionHeading}>
            <div><span>EMPIRICAL 0–1 LOSS</span><h3 id="tail-risk-title">Worst-{Math.round(settings.delta * 100)}% retained tail</h3></div>
            <span>{tailErrors} errors / {evaluation.tailCount} rows</span>
          </div>
          <div className={styles.tailFormula}>
            <div><span>Sort retained losses</span><code>ℓ(1) ≥ ℓ(2) ≥ … ≥ ℓ(Nᵣ)</code></div>
            <b aria-hidden="true">→</b>
            <div><span>Take k = ceil(δ · Nᵣ)</span><code>ceil({settings.delta.toFixed(2)} × {evaluation.retainedCount}) = {evaluation.tailCount}</code></div>
            <b aria-hidden="true">→</b>
            <div><span>Average the tail</span><code>{tailErrors} / {evaluation.tailCount || 1} = {evaluation.cvar.toFixed(3)}</code></div>
          </div>
          <div className={styles.lossRail} role="img" aria-label={`${evaluation.tailCount} claims are in the tail, containing ${tailErrors} classifier errors.`}>
            {Array.from({ length: Math.min(evaluation.retainedCount, 64) }, (_, index) => {
              const projectedTail = Math.ceil((evaluation.tailCount / Math.max(1, evaluation.retainedCount)) * 64);
              return <i key={index} className={index < projectedTail ? styles.tailSegment : ""} />;
            })}
          </div>
          <div className={styles.lossRailLabels}><span>highest loss / CVaR tail</span><span>remaining retained predictions</span></div>
          <p className={styles.chartNote}>CVaR is calculated only on classifier-handled claims, matching the paper. With binary loss it is the error share in the worst k rows—not a monetary-loss estimate.</p>
        </section>

        <aside className={styles.objectivePanel} aria-labelledby="deferral-objective-title">
          <div className={styles.sectionHeading}><div><span>RISK-SENSITIVE SCORE</span><h3 id="deferral-objective-title">Current threshold score</h3></div></div>
          <div className={styles.objectiveEquation}>
            <strong>{evaluation.objective.toFixed(3)}</strong>
            <code>{evaluation.systemAccuracy.toFixed(3)} − {settings.lambda.toFixed(1)} × {evaluation.cvar.toFixed(3)}</code>
          </div>
          <dl>
            <div><dt>Accuracy reward</dt><dd>{evaluation.systemAccuracy.toFixed(3)}</dd></div>
            <div><dt>Tail penalty</dt><dd>−{(settings.lambda * evaluation.cvar).toFixed(3)}</dd></div>
            <div><dt>Automation</dt><dd>{evaluation.retainedCount}/{TEST_SIZE}</dd></div>
          </dl>
          <div className={styles.cautionBox}>
            <strong>Capacity is not in this objective.</strong>
            <p>A real queue needs review-budget, asymmetric-cost, fairness and service-level constraints. The source calls constrained online deferral future work.</p>
          </div>
        </aside>
      </div>

      <section className={styles.queuePanel} aria-labelledby="tail-ledger-title">
        <div className={styles.sectionHeading}>
          <div><span>AUDITABLE SORT ORDER</span><h3 id="tail-ledger-title">Claims contributing to empirical CVaR</h3></div>
          <span>Click a claim to inspect its Bayes trace</span>
        </div>
        <div className={styles.tableScroll} tabIndex={0} aria-label="Scrollable CVaR tail ledger">
          <table>
            <thead><tr><th scope="col">Rank</th><th scope="col">Claim</th><th scope="col">Amount</th><th scope="col">Truth</th><th scope="col">Model</th><th scope="col">0–1 loss</th><th scope="col">Entropy</th><th scope="col">Confidence</th></tr></thead>
            <tbody>
              {evaluation.tail.map((claim, index) => (
                <tr key={claim.id}>
                  <td>{index + 1}</td>
                  <td><button type="button" onClick={() => onSelectClaim(claim.id)}>{claim.id}</button></td>
                  <td>{money(claim.amount)}</td>
                  <td>{claim.truth ? "fraud" : "legit"}</td>
                  <td>{claim.prediction ? "fraud" : "legit"}</td>
                  <td><strong className={claim.modelCorrect ? styles.zeroLoss : styles.oneLoss}>{claim.modelCorrect ? "0" : "1"}</strong></td>
                  <td>{claim.entropy.toFixed(3)}</td>
                  <td>{claim.confidence.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.significancePanel}>
        <div><span>SAFE-L2D</span><strong>0.923</strong><small>reported CVaR₀.₁</small></div>
        <i aria-hidden="true">Δ 0.015</i>
        <div><span>CONFIDENCE BASELINE</span><strong>0.938</strong><small>reported CVaR₀.₁</small></div>
        <p><strong>Directional, not significant.</strong> At 64% coverage, ceil(0.10 × 128) = 13 claims determine the entire Safe-L2D tail estimate.</p>
      </section>
    </div>
  );
}

function ResearchNotes() {
  return (
    <div className={styles.viewStack}>
      <section className={styles.provenancePanel}>
        <div className={styles.sectionHeading}><div><span>SOURCE FIDELITY</span><h3>What this exhibit reproduces—and what it does not</h3></div></div>
        <div className={styles.provenanceGrid}>
          <article><span>Benchmark shape</span><strong>{CORPUS_SIZE.toLocaleString("en-GB")} claims / {TEST_SIZE} test</strong><p>{SYNTHETIC_FRAUD_COUNT} of {CORPUS_SIZE} fictional labels are fraud: exactly 24.7%. The paper warns that this prevalence is inflated relative to production.</p></article>
          <article><span>Investigator model</span><strong>85% base accuracy</strong><p>The source uses a seeded synthetic expert with a slight bonus on high-entropy claims. It does not measure a real investigation team.</p></article>
          <article><span>Classifier path</span><strong>XGBoost → 3-fold isotonic</strong><p>This browser uses fixed synthetic scores plus a monotone calibration stand-in. It does not ship, train or execute the repository’s fitted weights.</p></article>
          <article><span>Bayesian path</span><strong>KDE likelihood ratios → H(π)</strong><p>The browser does not fit KDEs: it supplies fixed fictional likelihood ratios, performs real odds updates across the four code-named features, then computes binary entropy in bits.</p></article>
        </div>
      </section>

      <section className={styles.methodColumns}>
        <article>
          <span className={styles.kicker}>SOURCE PIPELINE</span>
          <h3>Two-stage selective prediction</h3>
          <ol>
            <li><b>Train.</b> Fit XGBoost, then calibrate class probabilities with 3-fold isotonic regression.</li>
            <li><b>Update.</b> Begin with π₀ = 0.247 and multiply odds by KDE class-conditional likelihood ratios.</li>
            <li><b>Reject.</b> Defer when entropy exceeds τ <em>or</em> classifier confidence falls below κ.</li>
            <li><b>Score.</b> Inspect a selected τ and subtract λ times empirical CVaR on non-deferred 0–1 losses; this browser control does not choose an optimum.</li>
          </ol>
          <div className={styles.formulaCard}>
            <code>H(π) = −π log₂π − (1−π) log₂(1−π)</code>
            <code>r(x) = 𝟙[H(π)&gt;τ] ∨ 𝟙[max σ(g(x))&lt;κ]</code>
            <code>J(τ) = Acc_system − λ · CVaRδ(retained loss)</code>
          </div>
        </article>
        <article>
          <span className={styles.kicker}>INTERPRETATION GUARDRAILS</span>
          <h3>Why this is not deployment evidence</h3>
          <ul>
            <li>The 200-claim test set has only about 49 fraud cases; confidence intervals are wide and overlap.</li>
            <li>The naive-Bayes conditional-independence assumption can understate uncertainty for correlated features.</li>
            <li>The practitioner DAG is hypothesised, not identified causally or stress-tested for misspecification.</li>
            <li>Distribution, prior and calibration drift were discussed but not empirically evaluated.</li>
            <li>The CVaR objective uses symmetric 0–1 loss, not the 5–10× false-negative costs relevant to fraud operations.</li>
            <li>MC Dropout and deep-ensemble uncertainty baselines were not compared.</li>
          </ul>
        </article>
      </section>

      <section className={styles.opePanel}>
        <div className={styles.opeBadge} aria-hidden="true">OPE</div>
        <div>
          <span className={styles.kicker}>OFF-POLICY EVALUATION</span>
          <h3>Methodological illustration, not counterfactual proof</h3>
          <p>The repository computes Direct Method, SNIPS with importance weights clipped at 10, and Doubly Robust estimates, but it has no historical investigator decisions. Its behaviour policy is simulated with logistic regression, while the reward model and behaviour policy are learned from the same data. That circularity violates the known-behaviour-policy premise, so the ranking must not be read as real-world policy value.</p>
        </div>
      </section>

      <section className={styles.licencePanel}>
        <div>
          <span className={styles.kicker}>PUBLIC SOURCE · RIGHTS RESERVED BY DEFAULT</span>
          <h3>No explicit licence found in the inspected repository snapshot</h3>
          <p>You may inspect the paper, Python modules, notebook and generated figures on GitHub. Public access alone is not an open-source licence. This exhibit therefore paraphrases the method and independently renders fictional data; it does not redistribute the paper PDF, dataset, figures or trained artefacts.</p>
        </div>
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">Open IX-Safety-Latex ↗</a>
      </section>
    </div>
  );
}

export default DeferralRiskStudio;
