"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./InnovationModelsStudio.module.css";

type ViewId = "matrix" | "portfolio" | "transition" | "evidence";
type ModelId = "opportunist" | "enabler" | "advocate" | "producer";
type PortfolioPresetId = "plural" | "distributed" | "network" | "central";
type TransitionFocus = "explore" | "bridge" | "exploit" | "mismatch";

type InnovationModel = {
  id: ModelId;
  name: string;
  code: string;
  ownership: "Diffuse" | "Focused";
  authority: "Ad hoc" | "Dedicated";
  colour: string;
  mechanism: string;
  governanceQuestion: string;
  evidence: string;
};

type PortfolioPreset = {
  id: PortfolioPresetId;
  label: string;
  hint: string;
  weights: Record<ModelId, number>;
};

const AUDITED_REF = "4f337cd";
const MODEL_IDS: ModelId[] = ["opportunist", "enabler", "advocate", "producer"];

const VIEWS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "matrix", label: "Model atlas", hint: "two structural axes" },
  { id: "portfolio", label: "Portfolio", hint: "mix four pathways" },
  { id: "transition", label: "Transition lab", hint: "add time + sequence" },
  { id: "evidence", label: "Source map", hint: "claims + boundaries" },
];

const MODELS: Record<ModelId, InnovationModel> = {
  opportunist: {
    id: "opportunist",
    name: "Opportunist",
    code: "OPP",
    ownership: "Diffuse",
    authority: "Ad hoc",
    colour: "#54704c",
    mechanism: "Initiative can emerge throughout the organisation; each team negotiates time and resources case by case.",
    governanceQuestion: "Can promising local work survive long enough to earn sponsorship without a standing resource route?",
    evidence: "Exact lower-left position in the source Draw.io matrix: diffuse ownership with ad hoc resource authority.",
  },
  enabler: {
    id: "enabler",
    name: "Enabler",
    code: "ENB",
    ownership: "Diffuse",
    authority: "Dedicated",
    colour: "#2c6481",
    mechanism: "Initiative remains distributed, while a formal resource mechanism gives teams a repeatable route to support.",
    governanceQuestion: "What selection rule protects access without turning a distributed pathway into an unbounded fund?",
    evidence: "Exact upper-left position in the source Draw.io matrix: diffuse ownership with dedicated resource authority.",
  },
  advocate: {
    id: "advocate",
    name: "Advocate",
    code: "ADV",
    ownership: "Focused",
    authority: "Ad hoc",
    colour: "#865289",
    mechanism: "A focused team champions opportunities and brokers connections, but resources are assembled through negotiation.",
    governanceQuestion: "How much influence can a central champion retain when delivery authority remains elsewhere?",
    evidence: "Exact lower-right position in the source Draw.io matrix: focused ownership with ad hoc resource authority.",
  },
  producer: {
    id: "producer",
    name: "Producer",
    code: "PRO",
    ownership: "Focused",
    authority: "Dedicated",
    colour: "#a05e23",
    mechanism: "A focused venture function owns the pathway and controls dedicated resources for developing new initiatives.",
    governanceQuestion: "How does a formal venture engine stay connected to the core without crowding out informal discovery?",
    evidence: "Exact upper-right position in the source Draw.io matrix: focused ownership with dedicated resource authority.",
  },
};

const PORTFOLIO_PRESETS: PortfolioPreset[] = [
  { id: "plural", label: "Plural pathways", hint: "equal structural mix", weights: { opportunist: 25, enabler: 25, advocate: 25, producer: 25 } },
  { id: "distributed", label: "Distributed discovery", hint: "local routes dominate", weights: { opportunist: 55, enabler: 25, advocate: 10, producer: 10 } },
  { id: "network", label: "Resource-backed network", hint: "distributed + funded", weights: { opportunist: 15, enabler: 45, advocate: 10, producer: 30 } },
  { id: "central", label: "Central scale-up", hint: "focused routes dominate", weights: { opportunist: 10, enabler: 15, advocate: 25, producer: 50 } },
];

const SOURCE_LEDGER = [
  {
    state: "source",
    label: "SOURCE",
    title: "Four-model topology",
    detail: "The Draw.io artifact places Opportunist, Enabler, Advocate and Producer against organisational ownership and resource authority.",
  },
  {
    state: "source",
    label: "SOURCE",
    title: "Exploration / exploitation tension",
    detail: "The reflection connects incumbent disruption, organisational ambidexterity and different routes for supporting corporate entrepreneurship.",
  },
  {
    state: "source",
    label: "SOURCE",
    title: "Framework critique",
    detail: "The assessment argues that static structure omits support horizon, transition timing, politics and discoveries outside formal pathways.",
  },
  {
    state: "adapted",
    label: "ADAPTED",
    title: "Portfolio calculator",
    detail: "Normalised experiment tokens, concentration and effective-model calculations are new browser mechanics with visible formulas. They are not claims from the paper.",
  },
  {
    state: "adapted",
    label: "ADAPTED",
    title: "Transition question generator",
    detail: "The readiness and pressure equations operationalise the critique for discussion; their equal weights and thresholds are illustrative.",
  },
  {
    state: "excluded",
    label: "EXCLUDED",
    title: "Assessed narrative",
    detail: "Authorship identifiers, first-person employment detail, named organisational observations and original prose are not served.",
  },
];

function resolveModel(ownership: number, authority: number): ModelId {
  if (ownership < 50 && authority < 50) return "opportunist";
  if (ownership < 50 && authority >= 50) return "enabler";
  if (ownership >= 50 && authority < 50) return "advocate";
  return "producer";
}

function setModelCoordinates(model: ModelId) {
  const ownership = MODELS[model].ownership === "Focused" ? 75 : 25;
  const authority = MODELS[model].authority === "Dedicated" ? 75 : 25;
  return { ownership, authority };
}

function MatrixView() {
  const [ownership, setOwnership] = useState(32);
  const [authority, setAuthority] = useState(68);
  const [horizon, setHorizon] = useState(18);
  const selectedId = resolveModel(ownership, authority);
  const selected = MODELS[selectedId];

  function chooseModel(id: ModelId) {
    const next = setModelCoordinates(id);
    setOwnership(next.ownership);
    setAuthority(next.authority);
  }

  return (
    <div className={styles.matrixView}>
      <section className={styles.scenarioControls}>
        <div>
          <span>SYNTHETIC ORGANISATION</span>
          <strong>Aster Works · initiative pathway</strong>
          <p>Move the structural axes; support horizon is displayed separately because it is a critique of the original two-axis model.</p>
        </div>
        <label><span>Organisational ownership <b>{ownership < 50 ? "Diffuse" : "Focused"} · {ownership}</b></span>
          <input type="range" min="0" max="100" value={ownership} aria-valuetext={`${ownership}; ${ownership < 50 ? "diffuse" : "focused"} ownership`} onChange={(event) => setOwnership(Number(event.target.value))} />
        </label>
        <label><span>Resource authority <b>{authority < 50 ? "Ad hoc" : "Dedicated"} · {authority}</b></span>
          <input type="range" min="0" max="100" value={authority} aria-valuetext={`${authority}; ${authority < 50 ? "ad hoc" : "dedicated"} authority`} onChange={(event) => setAuthority(Number(event.target.value))} />
        </label>
        <label><span>Support horizon <b>{horizon} months</b></span>
          <input type="range" min="3" max="36" step="3" value={horizon} aria-valuetext={`${horizon} months`} onChange={(event) => setHorizon(Number(event.target.value))} />
        </label>
      </section>

      <div className={styles.matrixWorkspace}>
        <section className={styles.matrixPanel}>
          <div className={styles.panelHeading}><span>2×2</span><strong>FOUR-MODEL STRUCTURAL ATLAS</strong><em>NO MODEL RANKING</em></div>
          <div className={styles.matrixShell}>
            <span className={styles.yAxisTitle}>RESOURCE AUTHORITY</span>
            <span className={styles.yTop}>DEDICATED</span>
            <span className={styles.yBottom}>AD HOC</span>
            <div className={styles.quadrantGrid}>
              {["enabler", "producer", "opportunist", "advocate"].map((id) => {
                const model = MODELS[id as ModelId];
                return (
                  <button
                    type="button"
                    key={model.id}
                    aria-pressed={selectedId === model.id}
                    style={{ "--model-colour": model.colour } as CSSProperties}
                    onClick={() => chooseModel(model.id)}
                  >
                    <span>{model.code}</span><strong>{model.name}</strong><small>{model.ownership} · {model.authority}</small>
                  </button>
                );
              })}
              <i
                className={styles.matrixCursor}
                style={{ "--cursor-x": `${ownership}%`, "--cursor-y": `${100 - authority}%`, "--model-colour": selected.colour } as CSSProperties}
                aria-hidden="true"
              />
            </div>
            <span className={styles.xLeft}>DIFFUSE</span>
            <span className={styles.xRight}>FOCUSED</span>
            <span className={styles.xAxisTitle}>ORGANISATIONAL OWNERSHIP</span>
          </div>
          <div className={styles.horizonStrip}>
            <span>ADDED QUESTION · SUPPORT HORIZON</span>
            <div><i style={{ width: `${(horizon / 36) * 100}%` }} /><b style={{ left: `${(horizon / 36) * 100}%` }}>{horizon}m</b></div>
            <p>The source critiques the matrix for omitting how long an organisation will protect an initiative. Horizon does not alter the source quadrant.</p>
          </div>
        </section>

        <aside className={styles.modelInspector} aria-live="polite">
          <div className={styles.modelIdentity} style={{ "--model-colour": selected.colour } as CSSProperties}>
            <span>RESOLVED STRUCTURE · {selected.code}</span>
            <h3>{selected.name}</h3>
            <strong>{selected.ownership} ownership · {selected.authority} authority</strong>
          </div>
          <section>
            <span>MECHANISM</span><p>{selected.mechanism}</p>
          </section>
          <section>
            <span>GOVERNANCE QUESTION</span><p>{selected.governanceQuestion}</p>
          </section>
          <dl>
            <div><dt>Ownership input</dt><dd>{ownership} / 100</dd></div>
            <div><dt>Authority input</dt><dd>{authority} / 100</dd></div>
            <div><dt>Support horizon</dt><dd>{horizon} months</dd></div>
            <div><dt>Model score</dt><dd>not defined</dd></div>
          </dl>
          <small>{selected.evidence}</small>
        </aside>
      </div>

      <section className={styles.comparisonTable} role="region" aria-label="Four-model structural comparison" tabIndex={0}>
        <div className={styles.panelHeading}><span>≠</span><strong>STRUCTURAL COMPARISON</strong><em>DESCRIPTIVE, NOT PRESCRIPTIVE</em></div>
        <div className={styles.comparisonHeader}><span>Model</span><span>Ownership</span><span>Authority</span><span>Standing pathway</span></div>
        {MODEL_IDS.map((id) => {
          const model = MODELS[id];
          return <button type="button" key={id} aria-pressed={selectedId === id} onClick={() => chooseModel(id)}><strong>{model.name}</strong><span>{model.ownership}</span><span>{model.authority}</span><span>{model.authority === "Dedicated" ? "Resource route" : "Negotiated route"}</span></button>;
        })}
      </section>
    </div>
  );
}

function PortfolioView() {
  const [preset, setPreset] = useState<PortfolioPresetId | "custom">("plural");
  const [weights, setWeights] = useState<Record<ModelId, number>>(PORTFOLIO_PRESETS[0].weights);
  const total = MODEL_IDS.reduce((sum, id) => sum + weights[id], 0);
  const shares = useMemo(() => Object.fromEntries(MODEL_IDS.map((id) => [id, total ? (weights[id] / total) * 100 : 0])) as Record<ModelId, number>, [total, weights]);
  const dedicated = shares.enabler + shares.producer;
  const focused = shares.advocate + shares.producer;
  const concentration = MODEL_IDS.reduce((sum, id) => sum + (shares[id] / 100) ** 2, 0);
  const effectiveModels = concentration ? 1 / concentration : 0;
  const dominantShare = Math.max(...MODEL_IDS.map((id) => shares[id]));
  const dominantModels = MODEL_IDS.filter((id) => Math.abs(shares[id] - dominantShare) < 0.001);
  const dominantLabel = total === 0 ? "Unallocated" : dominantModels.length > 1 ? "Plural" : MODELS[dominantModels[0]].name;

  function applyPreset(id: PortfolioPresetId) {
    const next = PORTFOLIO_PRESETS.find((item) => item.id === id);
    if (!next) return;
    setPreset(id);
    setWeights(next.weights);
  }

  return (
    <div className={styles.portfolioView}>
      <div className={styles.portfolioBanner} role="note">
        <span>VISITOR-CONTROLLED SCENARIO</span>
        <p>Weights become a normalised 100-token structural portfolio. Tokens represent attention, not money, return or probability of success.</p>
        <strong>NO PERFORMANCE MODEL</strong>
      </div>

      <nav className={styles.presetTabs} aria-label="Portfolio presets">
        {PORTFOLIO_PRESETS.map((item) => <button type="button" key={item.id} aria-pressed={preset === item.id} onClick={() => applyPreset(item.id)}><strong>{item.label}</strong><span>{item.hint}</span></button>)}
      </nav>

      <div className={styles.portfolioWorkspace}>
        <section className={styles.allocationPanel}>
          <div className={styles.panelHeading}><span>100</span><strong>EXPERIMENT-TOKEN ALLOCATION</strong><em>NORMALISED FROM INPUT WEIGHTS</em></div>
          <div className={styles.allocationBar} aria-label="Normalised allocation across four innovation models">
            {MODEL_IDS.map((id) => <i key={id} style={{ width: `${shares[id]}%`, background: MODELS[id].colour }} title={`${MODELS[id].name}: ${shares[id].toFixed(1)} tokens`} />)}
          </div>
          <div className={styles.allocationLegend}>
            {MODEL_IDS.map((id) => <span key={id}><i style={{ background: MODELS[id].colour }} />{MODELS[id].name}<strong>{shares[id].toFixed(1)}</strong></span>)}
          </div>
          <div className={styles.weightControls}>
            {MODEL_IDS.map((id) => {
              const model = MODELS[id];
              return (
                <label key={id} style={{ "--model-colour": model.colour } as CSSProperties}>
                  <span><strong>{model.name}</strong><small>{model.ownership} / {model.authority}</small><b>{weights[id]} weight</b></span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[id]}
                    aria-valuetext={`${weights[id]} input weight; ${shares[id].toFixed(1)} normalised tokens`}
                    onChange={(event) => { setPreset("custom"); setWeights((current) => ({ ...current, [id]: Number(event.target.value) })); }}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <aside className={styles.portfolioMetrics}>
          <div className={styles.panelHeading}><span>Σ</span><strong>STRUCTURAL PROFILE</strong><em>TRACEABLE</em></div>
          <div className={styles.metricGrid}>
            <div><span>Dedicated authority</span><strong>{dedicated.toFixed(1)}%</strong><small>Enabler + Producer</small></div>
            <div><span>Focused ownership</span><strong>{focused.toFixed(1)}%</strong><small>Advocate + Producer</small></div>
            <div><span>Concentration HHI</span><strong>{concentration.toFixed(3)}</strong><small>Σ normalised share²</small></div>
            <div><span>Effective models</span><strong>{effectiveModels.toFixed(2)}</strong><small>1 ÷ HHI</small></div>
          </div>
          <section className={styles.dominantCard}>
            <span>LARGEST STRUCTURAL PATHWAY</span><strong>{dominantLabel}</strong><p>{total ? `${dominantShare.toFixed(1)} of 100 normalised experiment tokens.` : "All input weights are zero; no allocation is calculated."}</p>
          </section>
          <div className={styles.formulaTape} aria-label="Portfolio calculation formulas">
            <p><span>01</span><code>shareᵢ</code><strong>weightᵢ ÷ Σ weights × 100</strong></p>
            <p><span>02</span><code>dedicated</code><strong>Enabler + Producer</strong></p>
            <p><span>03</span><code>focused</code><strong>Advocate + Producer</strong></p>
            <p><span>04</span><code>HHI</code><strong>Σ (shareᵢ ÷ 100)²</strong></p>
            <p><span>05</span><code>effective</code><strong>1 ÷ HHI</strong></p>
          </div>
        </aside>
      </div>

      <section className={styles.allocationTable} role="region" aria-label="Portfolio allocation table" tabIndex={0}>
        <div className={styles.allocationHeader}><span>Model</span><span>Input weight</span><span>Normalised tokens</span><span>Ownership</span><span>Authority</span></div>
        {MODEL_IDS.map((id) => <div key={id}><strong>{MODELS[id].name}</strong><span>{weights[id]}</span><span>{shares[id].toFixed(1)}</span><span>{MODELS[id].ownership}</span><span>{MODELS[id].authority}</span></div>)}
      </section>
    </div>
  );
}

function TransitionView() {
  const [evidence, setEvidence] = useState(46);
  const [integration, setIntegration] = useState(34);
  const [urgency, setUrgency] = useState(62);
  const [runway, setRunway] = useState(18);
  const readiness = (evidence + integration) / 2;
  const runwayPressure = Math.max(0, 100 - (runway / 24) * 100);
  const pressure = (urgency + runwayPressure) / 2;

  const result = useMemo((): { focus: TransitionFocus; title: string; question: string } => {
    if (readiness < 60 && pressure >= 60) return { focus: "mismatch", title: "Evidence-pressure mismatch", question: "What decision can be delayed, reduced or staged while the weakest evidence gap is tested?" };
    if (readiness >= 60 && pressure >= 60) return { focus: "bridge", title: "Bridge is the live question", question: "Which interface between exploration and core operations can be tested before committing to scale?" };
    if (readiness >= 60) return { focus: "exploit", title: "Handoff can be examined", question: "What would falsify the assumption that the core is ready to absorb this initiative?" };
    return { focus: "explore", title: "Exploration remains the question", question: "Which uncertainty is most valuable to reduce before designing an operational handoff?" };
  }, [pressure, readiness]);

  function reset() {
    setEvidence(46); setIntegration(34); setUrgency(62); setRunway(18);
  }

  return (
    <div className={styles.transitionView}>
      <div className={styles.transitionBanner} role="note">
        <span>ILLUSTRATIVE EXTENSION</span>
        <p>The source asks when exploration should become exploitation but supplies no equation. This view uses that gap to generate questions, with its assumptions shown beside each result.</p>
        <strong>NOT A VALIDATED DECISION RULE</strong>
      </div>

      <div className={styles.transitionWorkspace}>
        <aside className={styles.transitionControls}>
          <div className={styles.panelHeading}><span>t</span><strong>SYNTHETIC INITIATIVE</strong><em>PROJECT ORBIT</em></div>
          <label><span>Evidence maturity <b>{evidence}</b></span><input type="range" min="0" max="100" value={evidence} onChange={(event) => setEvidence(Number(event.target.value))} /></label>
          <label><span>Integration readiness <b>{integration}</b></span><input type="range" min="0" max="100" value={integration} onChange={(event) => setIntegration(Number(event.target.value))} /></label>
          <label><span>Core urgency <b>{urgency}</b></span><input type="range" min="0" max="100" value={urgency} onChange={(event) => setUrgency(Number(event.target.value))} /></label>
          <label><span>Protected runway <b>{runway} months</b></span><input type="range" min="3" max="36" step="3" value={runway} aria-valuetext={`${runway} months`} onChange={(event) => setRunway(Number(event.target.value))} /></label>
          <div className={styles.stressButtons}>
            <button type="button" onClick={() => setRunway((value) => Math.max(3, value - 9))}>Compress runway</button>
            <button type="button" onClick={() => setIntegration((value) => Math.max(0, value - 25))}>Delay integration</button>
            <button type="button" onClick={() => setEvidence((value) => Math.min(100, value + 25))}>Strengthen evidence</button>
            <button type="button" className={styles.resetButton} onClick={reset}>Reset scenario</button>
          </div>
        </aside>

        <section className={styles.transitionPlanePanel}>
          <div className={styles.panelHeading}><span>↗</span><strong>READINESS × PRESSURE PLANE</strong><em>EQUAL-WEIGHT HEURISTIC</em></div>
          <div className={styles.transitionPlane}>
            <span className={styles.planeExplore}>KEEP EXPLORING?</span>
            <span className={styles.planeBridge}>DESIGN THE BRIDGE?</span>
            <span className={styles.planeMismatch}>PRESSURE MISMATCH?</span>
            <span className={styles.planeHandoff}>TEST THE HANDOFF?</span>
            <i style={{ "--plane-x": `${readiness}%`, "--plane-y": `${100 - pressure}%` } as CSSProperties}><b>{Math.round(readiness)} / {Math.round(pressure)}</b></i>
            <em className={styles.planeXAxis}>READINESS →</em>
            <em className={styles.planeYAxis}>PRESSURE →</em>
          </div>
          <div className={`${styles.transitionResult} ${styles[`result_${result.focus}`]}`} aria-live="polite">
            <span>QUESTION STATE</span><strong>{result.title}</strong><p>{result.question}</p>
          </div>
        </section>

        <aside className={styles.transitionMath}>
          <div className={styles.panelHeading}><span>fx</span><strong>CALCULATION TAPE</strong><em>VISIBLE ASSUMPTIONS</em></div>
          <div className={styles.transitionMetrics}>
            <div><span>Readiness</span><strong>{readiness.toFixed(1)}</strong><small>(evidence + integration) ÷ 2</small></div>
            <div><span>Runway pressure</span><strong>{runwayPressure.toFixed(1)}</strong><small>max(0, 100 − runway / 24 × 100)</small></div>
            <div><span>Transition pressure</span><strong>{pressure.toFixed(1)}</strong><small>(urgency + runway pressure) ÷ 2</small></div>
          </div>
          <ol className={styles.sequenceRail}>
            <li className={result.focus === "explore" || result.focus === "mismatch" ? styles.sequenceActive : undefined}><span>01</span><div><strong>Explore</strong><small>Reduce uncertainty.</small></div></li>
            <li className={result.focus === "bridge" || result.focus === "mismatch" ? styles.sequenceActive : undefined}><span>02</span><div><strong>Bridge</strong><small>Test interfaces and ownership.</small></div></li>
            <li className={result.focus === "exploit" ? styles.sequenceActive : undefined}><span>03</span><div><strong>Exploit</strong><small>Integrate and refine.</small></div></li>
          </ol>
          <p className={styles.transitionCaveat}>The 60-point boundaries, 24-month runway reference and equal weights are browser assumptions selected for legibility. Change in state is a prompt for inquiry, not a recommendation.</p>
        </aside>
      </div>
    </div>
  );
}

function EvidenceView() {
  return (
    <div className={styles.evidenceView}>
      <section className={styles.sourceStats}>
        <div><span>AUDITED REF</span><strong>{AUDITED_REF}</strong><small>remote-tracking main · 17 Oct 2025</small></div>
        <div><span>COMMIT HISTORY</span><strong>12</strong><small>12–17 Oct 2025</small></div>
        <div><span>TRACKED FILES</span><strong>14</strong><small>3 source-like · 10 generated</small></div>
        <div><span>CITED KEYS</span><strong>8</strong><small>10 bibliography entries</small></div>
        <div className={styles.sourceRisk}><span>DECLARED LICENCE</span><strong>NONE</strong><small>private case study</small></div>
      </section>

      <div className={styles.evidenceWorkspace}>
        <section className={styles.claimLedger}>
          <div className={styles.panelHeading}><span>✓</span><strong>CLAIM-BY-CLAIM PROVENANCE</strong><em>NO ASSESSED TEXT COPIED</em></div>
          {SOURCE_LEDGER.map((item) => <article key={item.title} className={styles[`ledger_${item.state}`]}><span>{item.label}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}
        </section>

        <aside className={styles.artifactPanel}>
          <div className={styles.panelHeading}><span>FILE</span><strong>ARTIFACT INVENTORY</strong><em>PRIVATE SOURCE</em></div>
          <div className={styles.artifactRows}>
            <div><span>TEX</span><strong>Reflection source</strong><small>1,251 TeX-counted words · 3 sections · 7 subsections</small></div>
            <div><span>DRAW</span><strong>Four-model diagram</strong><small>1 Draw.io source + 1 exported PDF</small></div>
            <div><span>BIB</span><strong>Reference ledger</strong><small>10 entries · 8 keys cited in text</small></div>
            <div><span>PDF</span><strong>Compiled assessment</strong><small>retained privately · never embedded here</small></div>
            <div><span>AUX</span><strong>Build artifacts</strong><small>LaTeX outputs retained in Git history</small></div>
          </div>
          <section className={styles.notSoftware}>
            <span>SOURCE TYPE BOUNDARY</span>
            <strong>Written analysis + diagram</strong>
            <p>No executable model, dataset, measured outcomes, application code or validated scoring rule exists in the audited repository.</p>
          </section>
        </aside>
      </div>

      <section className={styles.historyTimeline}>
        <div className={styles.panelHeading}><span>GIT</span><strong>SHORT ITERATION HISTORY</strong><em>SELECTED, SANITISED EVENTS</em></div>
        <ol>
          <li><time dateTime="2025-10-12">12 OCT</time><span>029b7fa</span><strong>Initial source enters version control</strong><small>Reflection, references and diagram build begin.</small></li>
          <li><time dateTime="2025-10-13">13 OCT</time><span>88b188e</span><strong>Assessment structure consolidates</strong><small>Bibliography reaches its final tracked revision.</small></li>
          <li><time dateTime="2025-10-15">15 OCT</time><span>b85eb2d</span><strong>Written analysis iterates</strong><small>The local checkout currently stops at this revision.</small></li>
          <li><time dateTime="2025-10-17">17 OCT</time><span>cb9dbb0</span><strong>Diagram revision</strong><small>The four-model source and export are updated.</small></li>
          <li><time dateTime="2025-10-17">17 OCT</time><span>{AUDITED_REF}</span><strong>Latest remote-tracking snapshot</strong><small>Text and compiled assessment reach the audited state.</small></li>
        </ol>
      </section>

      <section className={styles.boundaryGrid}>
        <div><span>PRIVATE SOURCE</span><p>The repository is private, so this exhibit exposes neither a source action nor the assessed PDF.</p></div>
        <div><span>LICENCE BOUNDARY</span><p>No LICENSE, COPYING or NOTICE file was found. Public visibility is not inferred, and reuse is not offered.</p></div>
        <div><span>PRIVACY BOUNDARY</span><p>Assessment identity and first-person organisational narrative are replaced by synthetic Aster Works and Project Orbit scenarios.</p></div>
        <div><span>METHOD BOUNDARY</span><p>Model quadrants are source-faithful; numerical portfolio and transition mechanics are explicitly illustrative.</p></div>
      </section>
    </div>
  );
}

export function InnovationModelsStudio() {
  const [view, setView] = useState<ViewId>("matrix");

  return (
    <DemoWindow
      appName="Innovation Models — Re-authored Case Study"
      title="Innovation Governance Workbench"
      status="SYNTHETIC SCENARIOS · READ ONLY"
      purpose="Make ownership and resource authority concrete when deciding how exploratory ventures should sit inside an incumbent."
      tryThis="Choose a governance model, rebalance the portfolio and stress the transition-readiness inputs."
      watchFor="Concentration and readiness heuristics move with visible weights; they structure a discussion rather than prescribe an answer."
      statusTone="safe"
      className={styles.studio}
      footer={<><span>Audited {AUDITED_REF} · private source · no licence · assessed prose excluded</span><span>4 models · 2 source axes · adapted heuristics with visible weights</span></>}
    >
      <div className={styles.provenanceBanner} role="note">
        <span>CONCEPTS RE-AUTHORED</span>
        <p>An interactive reconstruction of the source framework and its limitations. Company, project and numerical inputs are synthetic; no original assessment passage is reproduced.</p>
        <strong>NO SOURCE OR PDF LINK</strong>
      </div>

      <nav className={styles.viewTabs} aria-label="Innovation strategy workbench views">
        {VIEWS.map((item) => <button type="button" key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}><strong>{item.label}</strong><span>{item.hint}</span></button>)}
      </nav>

      <div className={styles.canvas}>
        {view === "matrix" ? <MatrixView /> : null}
        {view === "portfolio" ? <PortfolioView /> : null}
        {view === "transition" ? <TransitionView /> : null}
        {view === "evidence" ? <EvidenceView /> : null}
      </div>
    </DemoWindow>
  );
}

export default InnovationModelsStudio;
