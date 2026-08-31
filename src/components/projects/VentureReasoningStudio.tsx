"use client";

import { type CSSProperties, useMemo, useState } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./VentureReasoningStudio.module.css";

type ViewId = "claims" | "market" | "ask" | "ledger";
type ScenarioId = "kiln" | "shelf" | "harbour";
type ClaimId = "problem" | "difference" | "market" | "traction" | "delivery" | "funding";
type EvidenceLevel = 0 | 1 | 2 | 3;
type MilestoneId = "problem-proof" | "operational-pilot" | "paid-repeatability" | "scale-readiness";

type Scenario = {
  id: ScenarioId;
  code: string;
  name: string;
  category: string;
  accent: string;
  customer: string;
  job: string;
  distinction: string;
  claims: Record<ClaimId, string>;
  levels: Record<ClaimId, EvidenceLevel>;
  market: {
    accounts: number;
    sites: number;
    monthlyPrice: number;
    penetration: number;
    closeRate: number;
    monthlyChurn: number;
    grossMargin: number;
  };
  funding: {
    ask: number;
    monthlyBurn: number;
    reserve: number;
    milestone: MilestoneId;
  };
};

type MarketInputs = Scenario["market"];
type FundingInputs = Scenario["funding"];

const VIEWS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "claims", label: "Claim desk", hint: "assertion → proof" },
  { id: "market", label: "Market math", hint: "bottom-up arithmetic" },
  { id: "ask", label: "Ask planner", hint: "capital → evidence gate" },
  { id: "ledger", label: "Source ledger", hint: "what this proves" },
];

const CLAIMS: Array<{
  id: ClaimId;
  code: string;
  label: string;
  weight: number;
  investorQuestion: string;
  nextEvidence: string;
}> = [
  {
    id: "problem",
    code: "P01",
    label: "Customer problem",
    weight: 15,
    investorQuestion: "Whose costly job is being observed, and what would falsify the problem hypothesis?",
    nextEvidence: "Segmented interviews, workflow observation and a recorded baseline—not a polished anecdote.",
  },
  {
    id: "difference",
    code: "D02",
    label: "Defensible difference",
    weight: 20,
    investorQuestion: "Which alternative is displaced, and is the advantage measured against that alternative?",
    nextEvidence: "A controlled task comparison with named baselines, failure cases and switching constraints.",
  },
  {
    id: "market",
    code: "M03",
    label: "Market construction",
    weight: 15,
    investorQuestion: "Can the opportunity be rebuilt from reachable customers, units and price?",
    nextEvidence: "An account-level segment definition and price evidence that reconcile to the stated total.",
  },
  {
    id: "traction",
    code: "T04",
    label: "Traction signal",
    weight: 25,
    investorQuestion: "Does behaviour demonstrate repeated value, or only interest in a demo?",
    nextEvidence: "Cohorted usage, paid conversion or renewal evidence with denominator and observation window.",
  },
  {
    id: "delivery",
    code: "R05",
    label: "Delivery reality",
    weight: 10,
    investorQuestion: "What data, integration, safety or adoption dependency could prevent delivery?",
    nextEvidence: "A pilot pre-mortem with owners, exit criteria, escalation path and observed operating limits.",
  },
  {
    id: "funding",
    code: "A06",
    label: "Ask and milestone",
    weight: 15,
    investorQuestion: "Which falsifiable evidence gate will this capital reach, and with what headroom?",
    nextEvidence: "A burn-linked milestone budget, contingency policy and explicit next financing decision.",
  },
];

const EVIDENCE_LEVELS: Array<{
  id: EvidenceLevel;
  short: string;
  label: string;
  factor: number;
  description: string;
}> = [
  { id: 0, short: "CLAIM", label: "Assertion only", factor: 0, description: "A sentence exists, but no supporting artifact is attached." },
  { id: 1, short: "SIGNAL", label: "Directional signal", factor: 0.35, description: "Qualitative or early evidence points in a direction without a stable denominator." },
  { id: 2, short: "MEASURE", label: "Measured", factor: 0.7, description: "A defined measure, sample and observation window are available for review." },
  { id: 3, short: "CHECKED", label: "Corroborated", factor: 1, description: "The measure is independently checkable or repeated outside the founding team." },
];

const MILESTONES: Array<{
  id: MilestoneId;
  code: string;
  label: string;
  months: number;
  fixedCost: number;
  proof: string;
}> = [
  { id: "problem-proof", code: "G1", label: "Problem proof", months: 4, fixedCost: 40_000, proof: "A narrow segment repeatedly demonstrates the costly workflow and commits to a test." },
  { id: "operational-pilot", code: "G2", label: "Operational pilot", months: 7, fixedCost: 120_000, proof: "A monitored pilot completes its workflow with defined reliability and escalation criteria." },
  { id: "paid-repeatability", code: "G3", label: "Paid repeatability", months: 12, fixedCost: 240_000, proof: "Multiple fictional customers convert and repeat under one declared pricing and success contract." },
  { id: "scale-readiness", code: "G4", label: "Scale readiness", months: 18, fixedCost: 420_000, proof: "Acquisition, delivery capacity and unit economics are measured well enough to test expansion." },
];

const SCENARIOS: Scenario[] = [
  {
    id: "kiln",
    code: "KS-7",
    name: "KilnSignal",
    category: "Industrial workflow · fictional",
    accent: "#9a4d2b",
    customer: "Small multi-site manufacturers with lean maintenance teams",
    job: "Turn fragmented shift notes into a cited maintenance hand-off before the next stoppage.",
    distinction: "A constrained evidence trail with a defined escalation route for maintenance questions.",
    claims: {
      problem: "Maintenance context is lost across shifts, extending the search for previous faults.",
      difference: "Every suggested diagnostic path is linked to an approved local note or marked unknown.",
      market: "The reachable segment is defined as accounts × sites × annual subscription.",
      traction: "A fictional prototype pack records interest, but contains no paid retention evidence.",
      delivery: "Local document access, safety escalation and operator adoption are explicit pilot gates.",
      funding: "Capital is intended to reach an operational pilot, with the budget still to be reconciled.",
    },
    levels: { problem: 2, difference: 1, market: 1, traction: 1, delivery: 2, funding: 0 },
    market: { accounts: 1800, sites: 1.8, monthlyPrice: 850, penetration: 5, closeRate: 22, monthlyChurn: 1.2, grossMargin: 76 },
    funding: { ask: 1_200_000, monthlyBurn: 82_000, reserve: 15, milestone: "operational-pilot" },
  },
  {
    id: "shelf",
    code: "SW-4",
    name: "ShelfWise",
    category: "Retail operations · fictional",
    accent: "#376849",
    customer: "Independent grocery groups balancing availability and fresh-food waste",
    job: "Surface an explainable ordering exception before a buyer commits the next replenishment cycle.",
    distinction: "Exception-first recommendations expose demand inputs and keep every order under buyer control.",
    claims: {
      problem: "Buyers repeatedly trade stock availability against waste with incomplete local demand context.",
      difference: "The workflow ranks only material exceptions and shows the inputs behind each recommendation.",
      market: "A store-level subscription model exposes the reachable revenue calculation.",
      traction: "Synthetic discovery sessions show workflow fit; no production deployment is represented.",
      delivery: "Data freshness, seasonal drift and override logging are treated as release conditions.",
      funding: "The proposed ask is tied to paid repeatability.",
    },
    levels: { problem: 2, difference: 2, market: 1, traction: 1, delivery: 2, funding: 1 },
    market: { accounts: 2400, sites: 3.2, monthlyPrice: 420, penetration: 7, closeRate: 18, monthlyChurn: 1.8, grossMargin: 71 },
    funding: { ask: 1_650_000, monthlyBurn: 96_000, reserve: 18, milestone: "paid-repeatability" },
  },
  {
    id: "harbour",
    code: "HD-9",
    name: "HarbourDesk",
    category: "Service operations · fictional",
    accent: "#315f7b",
    customer: "Regional property-service teams triaging high-volume repair requests",
    job: "Convert an incomplete request into a reviewable work order without hiding uncertainty from dispatch.",
    distinction: "The assistant abstains when location, safety or entitlement evidence is missing and routes the case to a person.",
    claims: {
      problem: "Incomplete repair requests create repeated clarification work before dispatch can begin.",
      difference: "A visible completeness contract and abstention route constrain what the assistant may infer.",
      market: "The segment is limited to reachable service teams and a per-team subscription assumption.",
      traction: "The fictional pack includes task trials, not customer revenue or renewal evidence.",
      delivery: "Integration permissions and urgent-repair escalation are first-class operating dependencies.",
      funding: "The plan links a small initial ask to problem proof before committing to a larger build.",
    },
    levels: { problem: 1, difference: 2, market: 1, traction: 0, delivery: 2, funding: 2 },
    market: { accounts: 3200, sites: 1.2, monthlyPrice: 620, penetration: 4, closeRate: 25, monthlyChurn: 1, grossMargin: 79 },
    funding: { ask: 520_000, monthlyBurn: 58_000, reserve: 20, milestone: "problem-proof" },
  },
];

const SOURCE_LEDGER: Array<{
  state: "source" | "reconstructed" | "excluded" | "absent";
  label: string;
  title: string;
  detail: string;
}> = [
  {
    state: "source",
    label: "SOURCE STRUCTURE",
    title: "Draft → critique → revision",
    detail: "The assessed materials separate an LLM-produced venture explanation from a human critique of its suitability for an investor pitch.",
  },
  {
    state: "source",
    label: "SOURCE STRUCTURE",
    title: "Prompt, output and model disclosure",
    detail: "The submission retains the instruction, generated response and model identification as distinct artifacts with clear authorship boundaries.",
  },
  {
    state: "source",
    label: "SOURCE THEMES",
    title: "Specificity must meet proof",
    detail: "The critique tests differentiation, competition, market substantiation, founder context, traction and an ask tied to milestones.",
  },
  {
    state: "reconstructed",
    label: "BROWSER MODEL",
    title: "Evidence ladder and weighted claim score",
    detail: "The four evidence levels, factors and claim weights are new explanatory mechanics. They are visible assumptions, not a sourced investor rubric.",
  },
  {
    state: "reconstructed",
    label: "BROWSER MODEL",
    title: "Market and runway equations",
    detail: "Bottom-up revenue, pipeline, churn, reserve and milestone arithmetic are deterministic additions built for this exhibit.",
  },
  {
    state: "excluded",
    label: "NOT SERVED",
    title: "Assessed prose and actual venture material",
    detail: "Original answers, generated passages, names, product specifics, named comparisons and compiled submission files are not reproduced.",
  },
  {
    state: "absent",
    label: "NOT EVIDENCED",
    title: "Runtime product or validation claim",
    detail: "The folder contains no executable product, test suite, retained customer dataset or independently validated performance result.",
  },
  {
    state: "absent",
    label: "NOT EVIDENCED",
    title: "Licence and repository chronology",
    detail: "The local folder has no repository metadata and no declared licence; this page therefore exposes no source or download action.",
  },
];

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function integer(value: number) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);
}

function levelById(level: EvidenceLevel) {
  return EVIDENCE_LEVELS.find((item) => item.id === level) ?? EVIDENCE_LEVELS[0];
}

function PanelHeading({ code, title, note }: { code: string; title: string; note: string }) {
  return (
    <div className={styles.panelHeading}>
      <span>{code}</span><strong>{title}</strong><em>{note}</em>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.slider}>
      <span>{label}<b>{display}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ClaimDesk({
  scenario,
  levels,
  selectedClaimId,
  onSelectClaim,
  onSetLevel,
  onReset,
}: {
  scenario: Scenario;
  levels: Record<ClaimId, EvidenceLevel>;
  selectedClaimId: ClaimId;
  onSelectClaim: (id: ClaimId) => void;
  onSetLevel: (id: ClaimId, level: EvidenceLevel) => void;
  onReset: () => void;
}) {
  const contributions = CLAIMS.map((claim) => ({
    ...claim,
    level: levelById(levels[claim.id]),
    contribution: claim.weight * levelById(levels[claim.id]).factor,
  }));
  const score = contributions.reduce((sum, claim) => sum + claim.contribution, 0);
  const evidencedWeight = contributions.filter((claim) => claim.level.id > 0).reduce((sum, claim) => sum + claim.weight, 0);
  const corroborated = contributions.filter((claim) => claim.level.id === 3).length;
  const weakest = [...contributions].sort((left, right) => (
    left.level.factor - right.level.factor || right.weight - left.weight
  ))[0];
  const selected = contributions.find((claim) => claim.id === selectedClaimId) ?? contributions[0];

  return (
    <div className={styles.claimView}>
      <section className={styles.scoreStrip} aria-label="Illustrative claim evidence summary" aria-live="polite">
        <div><span>WEIGHTED PROOF</span><strong>{score.toFixed(1)}<small>/ 100</small></strong></div>
        <div><span>EVIDENCED WEIGHT</span><strong>{evidencedWeight}<small>%</small></strong></div>
        <div><span>CORROBORATED</span><strong>{corroborated}<small>/ 6</small></strong></div>
        <div className={styles.weakMetric}><span>MOST EXPOSED</span><strong>{weakest.code}</strong><small>{weakest.label}</small></div>
      </section>

      <div className={styles.claimWorkspace}>
        <section className={styles.claimRegister}>
          <PanelHeading code="01" title="CLAIM / EVIDENCE REGISTER" note="VISITOR-CONTROLLED" />
          <div className={styles.claimHeader} aria-hidden="true"><span>Claim</span><span>Evidence state</span><span>Contribution</span></div>
          <div className={styles.claimRows}>
            {contributions.map((claim) => (
              <article key={claim.id} className={selectedClaimId === claim.id ? styles.claimSelected : ""}>
                <button
                  type="button"
                  className={styles.claimIdentity}
                  aria-pressed={selectedClaimId === claim.id}
                  onClick={() => onSelectClaim(claim.id)}
                >
                  <span>{claim.code} · {claim.weight}%</span>
                  <strong>{claim.label}</strong>
                  <small>{scenario.claims[claim.id]}</small>
                </button>
                <div className={styles.levelPicker} role="group" aria-label={`${claim.label} evidence level`}>
                  {EVIDENCE_LEVELS.map((level) => (
                    <button
                      type="button"
                      key={level.id}
                      aria-pressed={levels[claim.id] === level.id}
                      title={level.label}
                      onClick={() => onSetLevel(claim.id, level.id)}
                    >
                      <span>{level.id}</span><small>{level.short}</small>
                    </button>
                  ))}
                </div>
                <div className={styles.contribution}>
                  <strong>{claim.contribution.toFixed(1)}</strong><span>/ {claim.weight}</span>
                  <i><b style={{ width: `${claim.level.factor * 100}%` }} /></i>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.equationBar}>
            <code>weighted proof = Σ(claim weight × evidence factor)</code>
            <MacButton onClick={onReset}>Reset fictional pack</MacButton>
          </div>
        </section>

        <aside className={styles.claimInspector} aria-live="polite">
          <PanelHeading code={selected.code} title="CHALLENGE CARD" note={`LEVEL ${selected.level.id}`} />
          <div className={styles.levelStamp} data-level={selected.level.id}>
            <span>{selected.level.short}</span>
            <strong>{selected.level.label}</strong>
            <p>{selected.level.description}</p>
          </div>
          <dl className={styles.claimMath}>
            <div><dt>Materiality weight</dt><dd>{selected.weight}%</dd></div>
            <div><dt>Evidence factor</dt><dd>{selected.level.factor.toFixed(2)}</dd></div>
            <div><dt>Contribution</dt><dd>{selected.weight} × {selected.level.factor.toFixed(2)} = <b>{selected.contribution.toFixed(1)}</b></dd></div>
          </dl>
          <section className={styles.challengeBox}>
            <span>INVESTOR QUESTION</span><p>{selected.investorQuestion}</p>
          </section>
          <section className={styles.nextEvidence}>
            <span>NEXT EVIDENCE TO CHECK</span><p>{selected.nextEvidence}</p>
          </section>
          <p className={styles.modelCaveat}>The exhibit shows every assumed weight and factor. It measures evidence coverage, not investment quality.</p>
        </aside>
      </div>
    </div>
  );
}

function MarketLab({ inputs, onChange }: { inputs: MarketInputs; onChange: (inputs: MarketInputs) => void }) {
  const targetLogos = Math.ceil(inputs.accounts * inputs.penetration / 100);
  const annualChurn = 1 - Math.pow(1 - inputs.monthlyChurn / 100, 12);
  const replacementLogos = Math.ceil(targetLogos * annualChurn);
  const winsRequired = targetLogos + replacementLogos;
  const qualifiedPipeline = Math.ceil(winsRequired / (inputs.closeRate / 100));
  const serviceableRevenue = inputs.accounts * inputs.sites * inputs.monthlyPrice * 12;
  const targetArr = targetLogos * inputs.sites * inputs.monthlyPrice * 12;
  const annualGrossProfit = targetArr * inputs.grossMargin / 100;
  const pipelineLoad = qualifiedPipeline / inputs.accounts;
  const chartMax = Math.max(inputs.accounts, qualifiedPipeline);
  const bars = [
    { label: "Reachable accounts", value: inputs.accounts, colour: "#6d7469" },
    { label: "Qualified pipeline", value: qualifiedPipeline, colour: "#315f7b" },
    { label: "Wins incl. replacement", value: winsRequired, colour: "#9a4d2b" },
    { label: "Year-end target logos", value: targetLogos, colour: "#376849" },
  ];

  function update<Key extends keyof MarketInputs>(key: Key, value: MarketInputs[Key]) {
    onChange({ ...inputs, [key]: value });
  }

  return (
    <div className={styles.marketView}>
      <section className={styles.marketControls}>
        <PanelHeading code="02" title="BOTTOM-UP ASSUMPTION DESK" note="FICTIONAL INPUTS" />
        <div className={styles.sliderGrid}>
          <Slider label="Reachable accounts" value={inputs.accounts} display={integer(inputs.accounts)} min={250} max={8000} step={50} onChange={(value) => update("accounts", value)} />
          <Slider label="Sites per account" value={inputs.sites} display={inputs.sites.toFixed(1)} min={1} max={8} step={0.1} onChange={(value) => update("sites", value)} />
          <Slider label="Monthly price / site" value={inputs.monthlyPrice} display={currency(inputs.monthlyPrice)} min={200} max={4000} step={50} onChange={(value) => update("monthlyPrice", value)} />
          <Slider label="Target penetration" value={inputs.penetration} display={`${inputs.penetration}%`} min={1} max={25} onChange={(value) => update("penetration", value)} />
          <Slider label="Qualified close rate" value={inputs.closeRate} display={`${inputs.closeRate}%`} min={5} max={60} onChange={(value) => update("closeRate", value)} />
          <Slider label="Monthly logo churn" value={inputs.monthlyChurn} display={`${inputs.monthlyChurn.toFixed(1)}%`} min={0} max={6} step={0.1} onChange={(value) => update("monthlyChurn", value)} />
          <Slider label="Gross margin" value={inputs.grossMargin} display={`${inputs.grossMargin}%`} min={35} max={95} onChange={(value) => update("grossMargin", value)} />
        </div>
      </section>

      <section className={styles.marketMetrics} aria-label="Calculated fictional market outputs" aria-live="polite">
        <div><span>SERVICEABLE REVENUE</span><strong>{compactCurrency(serviceableRevenue)}</strong><small>accounts × sites × price × 12</small></div>
        <div><span>TARGET ARR</span><strong>{compactCurrency(targetArr)}</strong><small>{targetLogos} target logos</small></div>
        <div><span>ANNUAL GROSS PROFIT</span><strong>{compactCurrency(annualGrossProfit)}</strong><small>{inputs.grossMargin}% assumption</small></div>
        <div data-alert={pipelineLoad > 1 ? "true" : "false"}><span>PIPELINE LOAD</span><strong>{(pipelineLoad * 100).toFixed(0)}%</strong><small>{qualifiedPipeline} / {integer(inputs.accounts)} accounts</small></div>
      </section>

      <div className={styles.marketWorkspace}>
        <figure className={styles.pipelineChart}>
          <PanelHeading code="FNL" title="ONE-YEAR LOGO FUNNEL" note="STATIC SNAPSHOT" />
          <div className={styles.bars}>
            {bars.map((bar) => (
              <div key={bar.label}>
                <span>{bar.label}</span>
                <div><i style={{ "--bar-width": `${Math.max(2, (bar.value / chartMax) * 100)}%`, "--bar-colour": bar.colour } as CSSProperties} /></div>
                <strong>{integer(bar.value)}</strong>
              </div>
            ))}
          </div>
          <figcaption>
            {pipelineLoad > 1
              ? `The required qualified pipeline exceeds the ${integer(inputs.accounts)}-account segment. Reduce penetration, improve conversion or broaden the evidenced segment.`
              : `${integer(qualifiedPipeline)} qualified opportunities consume ${(pipelineLoad * 100).toFixed(0)}% of the declared reachable segment.`}
          </figcaption>
        </figure>

        <section className={styles.equationSheet}>
          <PanelHeading code="Σ" title="RECONCILIATION SHEET" note="LIVE MATH" />
          <table>
            <caption>Traceable market calculation</caption>
            <tbody>
              <tr><th scope="row">Serviceable revenue</th><td>{integer(inputs.accounts)} × {inputs.sites.toFixed(1)} × {currency(inputs.monthlyPrice)} × 12</td><td>{currency(serviceableRevenue)}</td></tr>
              <tr><th scope="row">Year-end target</th><td>{integer(inputs.accounts)} × {inputs.penetration}%</td><td>{integer(targetLogos)} logos</td></tr>
              <tr><th scope="row">Annual churn</th><td>1 − (1 − {inputs.monthlyChurn.toFixed(1)}%)¹²</td><td>{(annualChurn * 100).toFixed(1)}%</td></tr>
              <tr><th scope="row">Replacement wins</th><td>{integer(targetLogos)} × {(annualChurn * 100).toFixed(1)}%</td><td>{integer(replacementLogos)}</td></tr>
              <tr><th scope="row">Qualified pipeline</th><td>{integer(winsRequired)} wins ÷ {inputs.closeRate}%</td><td>{integer(qualifiedPipeline)}</td></tr>
            </tbody>
          </table>
          <div className={styles.marketBoundary} role="note">
            <strong>BOUNDARY</strong>
            <p>This arithmetic does not establish willingness to pay, acquisition speed, cash collection, retention or market truth. Every number is visitor-controlled and fictional.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function AskPlanner({
  inputs,
  proofScore,
  weakestClaim,
  onChange,
}: {
  inputs: FundingInputs;
  proofScore: number;
  weakestClaim: string;
  onChange: (inputs: FundingInputs) => void;
}) {
  const milestone = MILESTONES.find((item) => item.id === inputs.milestone) ?? MILESTONES[0];
  const reserveAmount = inputs.ask * inputs.reserve / 100;
  const deployable = inputs.ask - reserveAmount;
  const operatingCost = inputs.monthlyBurn * milestone.months;
  const requiredBeforeReserve = operatingCost + milestone.fixedCost;
  const requiredHeadlineAsk = requiredBeforeReserve / (1 - inputs.reserve / 100);
  const headroom = deployable - requiredBeforeReserve;
  const runway = deployable / inputs.monthlyBurn;
  const fundingCoverage = deployable / requiredBeforeReserve;
  const clearsGate = headroom >= 0 && runway >= milestone.months;
  const timelineMax = Math.max(24, Math.ceil(runway + 2));

  function update<Key extends keyof FundingInputs>(key: Key, value: FundingInputs[Key]) {
    onChange({ ...inputs, [key]: value });
  }

  return (
    <div className={styles.askView}>
      <div className={styles.askTop}>
        <section className={styles.askControls}>
          <PanelHeading code="03" title="CAPITAL ASSUMPTIONS" note="NO VALUATION MODEL" />
          <div className={styles.askSliders}>
            <Slider label="Headline ask" value={inputs.ask} display={compactCurrency(inputs.ask)} min={300_000} max={3_000_000} step={50_000} onChange={(value) => update("ask", value)} />
            <Slider label="Monthly operating burn" value={inputs.monthlyBurn} display={compactCurrency(inputs.monthlyBurn)} min={30_000} max={180_000} step={2_000} onChange={(value) => update("monthlyBurn", value)} />
            <Slider label="Protected reserve" value={inputs.reserve} display={`${inputs.reserve}%`} min={5} max={35} onChange={(value) => update("reserve", value)} />
          </div>
        </section>

        <section className={styles.milestonePicker}>
          <PanelHeading code="GATE" title="NEXT FALSIFIABLE MILESTONE" note="SELECT ONE" />
          <div className={styles.milestoneButtons}>
            {MILESTONES.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={inputs.milestone === item.id}
                onClick={() => update("milestone", item.id)}
              >
                <span>{item.code} · {item.months}m</span><strong>{item.label}</strong><small>+ {compactCurrency(item.fixedCost)} gate cost</small>
              </button>
            ))}
          </div>
          <div className={styles.milestoneBrief} aria-live="polite">
            <div>
              <span>SELECTED EVIDENCE CONTRACT · {milestone.code}</span>
              <strong>{milestone.label}</strong>
              <p>{milestone.proof}</p>
            </div>
            <dl>
              <div><dt>Decision horizon</dt><dd>{milestone.months} months</dd></div>
              <div><dt>Gate-specific work</dt><dd>{compactCurrency(milestone.fixedCost)}</dd></div>
            </dl>
          </div>
        </section>
      </div>

      <section className={styles.runwayPanel} aria-live="polite">
        <PanelHeading code="RUN" title="ASK → RESERVE → EVIDENCE GATE" note={clearsGate ? "ARITHMETIC CLEARS" : "ARITHMETIC GAP"} />
        <div className={styles.runwayMetrics}>
          <div><span>DEPLOYABLE</span><strong>{compactCurrency(deployable)}</strong><small>after {compactCurrency(reserveAmount)} reserve</small></div>
          <div><span>RUNWAY</span><strong>{runway.toFixed(1)}m</strong><small>at stated operating burn</small></div>
          <div><span>GATE REQUIREMENT</span><strong>{compactCurrency(requiredBeforeReserve)}</strong><small>{milestone.months} months + fixed work</small></div>
          <div data-state={clearsGate ? "clear" : "gap"}><span>HEADROOM</span><strong>{headroom >= 0 ? "+" : "−"}{compactCurrency(Math.abs(headroom))}</strong><small>{(fundingCoverage * 100).toFixed(0)}% funded</small></div>
        </div>
        <figure className={styles.runwayTimeline}>
          <div className={styles.timelineTrack}>
            <i className={styles.deployableTrack} style={{ width: `${Math.min(100, (runway / timelineMax) * 100)}%` }} />
            <span className={styles.gateMarker} style={{ left: `${(milestone.months / timelineMax) * 100}%` }}><b>{milestone.code}</b><small>{milestone.months}m</small></span>
            <span className={styles.runwayMarker} style={{ left: `${Math.min(99, (runway / timelineMax) * 100)}%` }}><b>cash</b><small>{runway.toFixed(1)}m</small></span>
          </div>
          <figcaption>{clearsGate ? "The cash arithmetic reaches the selected gate; the gate’s real-world evidence is still unvalidated." : `The plan is short by ${compactCurrency(Math.abs(headroom))}; change the ask, burn, reserve or evidence gate.`}</figcaption>
        </figure>
      </section>

      <div className={styles.askBottom}>
        <section className={styles.askLedger}>
          <PanelHeading code="CALC" title="CAPITAL RECONCILIATION" note="TRACEABLE" />
          <dl>
            <div><dt>Operating plan</dt><dd>{milestone.months} × {currency(inputs.monthlyBurn)}<b>{currency(operatingCost)}</b></dd></div>
            <div><dt>Gate-specific work</dt><dd>{milestone.label}<b>{currency(milestone.fixedCost)}</b></dd></div>
            <div><dt>Required before reserve</dt><dd>operating + gate work<b>{currency(requiredBeforeReserve)}</b></dd></div>
            <div><dt>Reconciled headline ask</dt><dd>{currency(requiredBeforeReserve)} ÷ {(100 - inputs.reserve)}%<b>{currency(requiredHeadlineAsk)}</b></dd></div>
          </dl>
        </section>
        <aside className={styles.reviewQueue}>
          <PanelHeading code="VC?" title="REVIEW QUEUE" note="QUESTIONS, NOT VERDICTS" />
          <ol>
            <li><span>01</span><p><strong>Evidence exposure</strong>The fictional claim pack scores {proofScore.toFixed(1)}/100; inspect <b>{weakestClaim}</b> before adding pitch polish.</p></li>
            <li><span>02</span><p><strong>Milestone contract</strong>{milestone.proof}</p></li>
            <li><span>03</span><p><strong>Capital discipline</strong>{clearsGate ? `${compactCurrency(headroom)} remains after the stated gate and reserve policy.` : `${compactCurrency(Math.abs(headroom))} remains unreconciled under the current assumptions.`}</p></li>
          </ol>
        </aside>
      </div>
    </div>
  );
}

function SourceLedger() {
  const sourceCount = SOURCE_LEDGER.filter((item) => item.state === "source").length;
  const reconstructedCount = SOURCE_LEDGER.filter((item) => item.state === "reconstructed").length;
  const guardedCount = SOURCE_LEDGER.filter((item) => item.state === "excluded" || item.state === "absent").length;

  return (
    <div className={styles.ledgerView}>
      <section className={styles.auditHero}>
        <div>
          <span>PRIVATE ASSESSED MATERIAL · STRUCTURE ONLY</span>
          <h3>Reasoning is shown; submission text is not.</h3>
          <p>The local archive supports a human-in-the-loop critique pattern. This exhibit re-authors that pattern around fictional ventures and labels every added calculation.</p>
        </div>
        <dl>
          <div><dt>Themes tied to sources</dt><dd>{sourceCount}</dd></div>
          <div><dt>Browser reconstructions</dt><dd>{reconstructedCount}</dd></div>
          <div><dt>Excluded / absent</dt><dd>{guardedCount}</dd></div>
        </dl>
      </section>

      <section className={styles.ledgerPanel}>
        <PanelHeading code="AUD" title="SOURCE → EXHIBIT LEDGER" note="NO DOWNLOAD ACTION" />
        <div className={styles.ledgerRows}>
          {SOURCE_LEDGER.map((item) => (
            <article key={item.title} data-state={item.state}>
              <span>{item.label}</span>
              <div><strong>{item.title}</strong><p>{item.detail}</p></div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.boundaryGrid}>
        <section>
          <PanelHeading code="IN" title="SAFE TO DEMONSTRATE" note="RE-AUTHORED" />
          <ul><li>Human critique after an LLM draft</li><li>Claim-to-evidence separation</li><li>Fictional bottom-up market arithmetic</li><li>Fictional ask-to-milestone reconciliation</li></ul>
        </section>
        <section>
          <PanelHeading code="OUT" title="DELIBERATELY EXCLUDED" note="PRIVATE / UNSUPPORTED" />
          <ul><li>Any assessed sentence or generated passage</li><li>Actual venture, founder or competitor detail</li><li>Grades, feedback or personal identifiers</li><li>Product, traction or investment-performance claims</li></ul>
        </section>
        <section>
          <PanelHeading code="LIC" title="PROVENANCE LIMIT" note="NO LICENCE" />
          <p>The inspected folder is not itself a Git repository, exposes no remote history and declares no reuse licence. The demo has no source link, PDF link or archive download.</p>
        </section>
      </div>
    </div>
  );
}

export function VentureReasoningStudio() {
  const [view, setView] = useState<ViewId>("claims");
  const [scenarioId, setScenarioId] = useState<ScenarioId>(SCENARIOS[0].id);
  const [claimLevels, setClaimLevels] = useState<Record<ClaimId, EvidenceLevel>>({ ...SCENARIOS[0].levels });
  const [selectedClaimId, setSelectedClaimId] = useState<ClaimId>("traction");
  const [marketInputs, setMarketInputs] = useState<MarketInputs>({ ...SCENARIOS[0].market });
  const [fundingInputs, setFundingInputs] = useState<FundingInputs>({ ...SCENARIOS[0].funding });
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];

  const claimSummary = useMemo(() => {
    const rows = CLAIMS.map((claim) => ({
      ...claim,
      level: levelById(claimLevels[claim.id]),
    }));
    return {
      score: rows.reduce((sum, claim) => sum + claim.weight * claim.level.factor, 0),
      weakest: [...rows].sort((left, right) => left.level.factor - right.level.factor || right.weight - left.weight)[0],
    };
  }, [claimLevels]);

  function chooseScenario(id: ScenarioId) {
    const next = SCENARIOS.find((item) => item.id === id) ?? SCENARIOS[0];
    setScenarioId(next.id);
    setClaimLevels({ ...next.levels });
    setMarketInputs({ ...next.market });
    setFundingInputs({ ...next.funding });
    setSelectedClaimId("traction");
  }

  return (
    <DemoWindow
      appName="VENTURE REASONING DESK · PRIVATE CASE STUDY"
      title="Venture Proof Workbench"
      status="SYNTHETIC RECONSTRUCTION"
      statusTone="safe"
      className={styles.studio}
      footer={<><span>{scenario.name} · {view.toUpperCase()}</span><span>All ventures, inputs and outputs fictional · assessed prose excluded</span></>}
    >
      <section className={styles.provenanceBanner} role="note">
        <span>ASSESSED SOURCE</span>
        <p><strong>Authorship boundary:</strong> the archive’s critique structure is re-authored here; original answers and generated passages are never served.</p>
        <b>NO SOURCE / PDF ACTION</b>
      </section>

      <section className={styles.scenarioBar} aria-labelledby="venture-scenario-heading">
        <div>
          <span id="venture-scenario-heading">FICTIONAL VENTURE FILE</span>
          <strong>{scenario.name}</strong>
          <small>{scenario.code} · {scenario.category}</small>
        </div>
        <div className={styles.scenarioButtons} role="group" aria-label="Fictional venture scenario">
          {SCENARIOS.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={scenarioId === item.id}
              style={{ "--scenario-colour": item.accent } as CSSProperties}
              onClick={() => chooseScenario(item.id)}
            >
              <span>{item.code}</span><strong>{item.name}</strong>
            </button>
          ))}
        </div>
        <dl className={styles.scenarioContext}>
          <div><dt>Customer</dt><dd>{scenario.customer}</dd></div>
          <div><dt>Job</dt><dd>{scenario.job}</dd></div>
          <div><dt>Proposed distinction</dt><dd>{scenario.distinction}</dd></div>
        </dl>
      </section>

      <nav className={styles.viewTabs} aria-label="Venture reasoning views">
        {VIEWS.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-current={view === item.id ? "page" : undefined}
            onClick={() => setView(item.id)}
          >
            <span>0{index + 1}</span><strong>{item.label}</strong><small>{item.hint}</small>
          </button>
        ))}
      </nav>

      <div className={styles.canvas}>
        {view === "claims" && (
          <ClaimDesk
            scenario={scenario}
            levels={claimLevels}
            selectedClaimId={selectedClaimId}
            onSelectClaim={setSelectedClaimId}
            onSetLevel={(id, level) => setClaimLevels((current) => ({ ...current, [id]: level }))}
            onReset={() => setClaimLevels({ ...scenario.levels })}
          />
        )}
        {view === "market" && <MarketLab inputs={marketInputs} onChange={setMarketInputs} />}
        {view === "ask" && (
          <AskPlanner
            inputs={fundingInputs}
            proofScore={claimSummary.score}
            weakestClaim={`${claimSummary.weakest.code} ${claimSummary.weakest.label}`}
            onChange={setFundingInputs}
          />
        )}
        {view === "ledger" && <SourceLedger />}
      </div>
    </DemoWindow>
  );
}

export default VentureReasoningStudio;
