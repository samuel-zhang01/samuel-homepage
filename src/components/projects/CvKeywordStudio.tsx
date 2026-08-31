"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./CvKeywordStudio.module.css";

type TemplateId =
  | "tech"
  | "consult"
  | "product"
  | "science"
  | "law"
  | "fintech"
  | "ai"
  | "ops";

type SignalCategory =
  | "Engineering"
  | "Modelling"
  | "Delivery"
  | "Collaboration"
  | "Governance";

type StudioTab = "inputs" | "analysis" | "evidence" | "output";
type PriorityLens = "all" | "core";

type SignalDefinition = {
  id: string;
  label: string;
  category: SignalCategory;
  variants: readonly string[];
  baseWeight: number;
  specificity: number;
  templates: readonly TemplateId[];
};

type SignalResult = SignalDefinition & {
  frequency: number;
  required: boolean;
  weight: number;
  matched: boolean;
  jobEvidence: string;
  cvEvidence: string | null;
  evidenceStrength: number;
  hasAction: boolean;
  hasMetric: boolean;
  hasOutcome: boolean;
};

type AnalysisReport = {
  signals: SignalResult[];
  matched: SignalResult[];
  missing: SignalResult[];
  weightedCoverage: number;
  evidenceQuality: number;
  structureScore: number;
  readiness: number;
  totalWeight: number;
  matchedWeight: number;
  categoryCoverage: Array<{
    category: SignalCategory;
    score: number;
    matched: number;
    total: number;
  }>;
};

type RewriteSuggestion = {
  id: string;
  kind: "rewrite" | "gap";
  label: string;
  reason: string;
  original: string;
  replacement: string;
  canStage: boolean;
};

const SAMPLE_CV = `ALEX MORGAN — FICTIONAL SAMPLE

PROFILE
Product-minded data scientist building reliable analytical tools for ambiguous questions.

SELECTED EXPERIENCE
• Built Python and SQL feature pipelines for 1.8 million synthetic records, reducing batch runtime by 38%.
• Trained and evaluated scikit-learn classification models; improved held-out recall from 0.71 to 0.84.
• Containerised a Docker inference service and introduced CI/CD checks, reducing release rollback time by 45%.
• Led weekly discovery sessions with product and operations stakeholders, translating findings into a prioritised roadmap.

PROJECTS
• Designed controlled experiments and communicated uncertainty through concise decision memos.

EDUCATION
MSc Data Science — Example University`;

const SAMPLE_JOB = `Northstar Systems is hiring an Applied Machine Learning Engineer to solve ambiguous operational problems with reliable products.

You will build production data pipelines with Python and SQL, train and evaluate machine-learning models with scikit-learn, and expose predictions through APIs. You will design experiments, partner with product and operations stakeholders, and communicate model trade-offs clearly.

Essential experience includes Docker, CI/CD and model monitoring. Cloud infrastructure is desirable. The team values technical documentation, responsible AI, measurable outcomes and pragmatic product delivery.`;

const TEMPLATE_PROFILES: Record<
  TemplateId,
  { label: string; file: string; emphasis: string; accent: string; soft: string }
> = {
  tech: {
    label: "Tech",
    file: "CVtemplateTech.tex",
    emphasis: "Systems, delivery and technical depth",
    accent: "#173f78",
    soft: "#dce9f8",
  },
  consult: {
    label: "Consult",
    file: "CVtemplateConsult.tex",
    emphasis: "Client outcomes and structured problem solving",
    accent: "#6c315d",
    soft: "#f1dfec",
  },
  product: {
    label: "Product",
    file: "CVtemplateProduct.tex",
    emphasis: "Discovery, prioritisation and measurable impact",
    accent: "#725416",
    soft: "#f4e7c3",
  },
  science: {
    label: "Science",
    file: "CVtemplateScience.tex",
    emphasis: "Methods, experiments and reproducibility",
    accent: "#285c52",
    soft: "#d8eee9",
  },
  law: {
    label: "Law",
    file: "CVtemplateLaw.tex",
    emphasis: "Analysis, precision and communication",
    accent: "#563c33",
    soft: "#eadfd9",
  },
  fintech: {
    label: "Fintech",
    file: "CVtemplateFintech.tex",
    emphasis: "Data products, controls and reliability",
    accent: "#1e5b47",
    soft: "#d9eee5",
  },
  ai: {
    label: "AI",
    file: "CVtemplateAI.tex",
    emphasis: "Model evaluation, deployment and governance",
    accent: "#3d3380",
    soft: "#e4e0f8",
  },
  ops: {
    label: "Ops",
    file: "CVtemplateOps.tex",
    emphasis: "Automation, resilience and process design",
    accent: "#7a3f21",
    soft: "#f2dfd2",
  },
};

const SIGNALS: readonly SignalDefinition[] = [
  { id: "python", label: "Python", category: "Engineering", variants: ["python"], baseWeight: 5, specificity: 1, templates: ["tech", "science", "fintech", "ai", "ops"] },
  { id: "sql", label: "SQL", category: "Engineering", variants: ["sql", "postgresql", "postgres"], baseWeight: 5, specificity: 1, templates: ["tech", "product", "science", "fintech", "ai", "ops"] },
  { id: "pipelines", label: "Data pipelines", category: "Engineering", variants: ["data pipelines", "feature pipelines", "etl", "data pipeline"], baseWeight: 4, specificity: 1, templates: ["tech", "science", "fintech", "ai", "ops"] },
  { id: "api", label: "APIs", category: "Engineering", variants: ["apis", "api", "rest service", "restful"], baseWeight: 4, specificity: 2, templates: ["tech", "fintech", "ai"] },
  { id: "cloud", label: "Cloud infrastructure", category: "Engineering", variants: ["cloud infrastructure", "cloud", "aws", "azure", "gcp"], baseWeight: 3, specificity: 1, templates: ["tech", "fintech", "ai", "ops"] },
  { id: "ml", label: "Machine learning", category: "Modelling", variants: ["machine learning", "machine-learning", "ml models", "ml model"], baseWeight: 5, specificity: 1, templates: ["tech", "science", "fintech", "ai"] },
  { id: "sklearn", label: "scikit-learn", category: "Modelling", variants: ["scikit-learn", "sklearn"], baseWeight: 5, specificity: 2, templates: ["tech", "science", "ai"] },
  { id: "evaluation", label: "Model evaluation", category: "Modelling", variants: ["model evaluation", "evaluate machine", "evaluate models", "evaluated"], baseWeight: 4, specificity: 1, templates: ["science", "fintech", "ai"] },
  { id: "experiments", label: "Experiment design", category: "Modelling", variants: ["design experiments", "experiment design", "controlled experiments", "experimentation"], baseWeight: 4, specificity: 1, templates: ["consult", "product", "science", "ai"] },
  { id: "monitoring", label: "Model monitoring", category: "Modelling", variants: ["model monitoring", "monitor models", "monitoring models", "drift monitoring"], baseWeight: 4, specificity: 2, templates: ["tech", "fintech", "ai", "ops"] },
  { id: "docker", label: "Docker", category: "Delivery", variants: ["docker", "containerised", "containerized"], baseWeight: 4, specificity: 2, templates: ["tech", "fintech", "ai", "ops"] },
  { id: "cicd", label: "CI/CD", category: "Delivery", variants: ["ci/cd", "ci cd", "continuous integration", "deployment pipeline"], baseWeight: 4, specificity: 2, templates: ["tech", "fintech", "ai", "ops"] },
  { id: "product", label: "Product delivery", category: "Delivery", variants: ["product delivery", "reliable products", "shipping products", "delivered products"], baseWeight: 3, specificity: 1, templates: ["consult", "product", "tech", "fintech", "ai", "ops"] },
  { id: "outcomes", label: "Measurable outcomes", category: "Delivery", variants: ["measurable outcomes", "business impact", "measured impact", "quantifiable"], baseWeight: 3, specificity: 1, templates: ["consult", "product", "fintech", "ops"] },
  { id: "stakeholders", label: "Stakeholder partnership", category: "Collaboration", variants: ["stakeholders", "stakeholder", "cross-functional", "partner with product", "partner with operations"], baseWeight: 4, specificity: 1, templates: ["consult", "product", "law", "fintech", "ops"] },
  { id: "communication", label: "Technical communication", category: "Collaboration", variants: ["communicate model", "technical communication", "communicated uncertainty", "decision memos", "communicate trade-offs"], baseWeight: 4, specificity: 1, templates: ["consult", "product", "science", "law", "fintech", "ai"] },
  { id: "documentation", label: "Technical documentation", category: "Governance", variants: ["technical documentation", "documentation", "documented"], baseWeight: 3, specificity: 1, templates: ["tech", "science", "law", "fintech", "ai", "ops"] },
  { id: "responsible-ai", label: "Responsible AI", category: "Governance", variants: ["responsible ai", "model governance", "algorithmic fairness", "bias testing"], baseWeight: 4, specificity: 2, templates: ["consult", "science", "law", "fintech", "ai"] },
] as const;

const CATEGORIES: readonly SignalCategory[] = [
  "Engineering",
  "Modelling",
  "Delivery",
  "Collaboration",
  "Governance",
];

const REQUIRED_HINTS = [
  "essential",
  "required",
  "must",
  "you will",
  "responsible for",
  "need",
] as const;

const ACTION_VERBS = [
  "built",
  "engineered",
  "trained",
  "evaluated",
  "designed",
  "delivered",
  "led",
  "introduced",
  "improved",
  "reduced",
  "deployed",
  "containerised",
  "containerized",
] as const;

const OUTCOME_HINTS = [
  "reducing",
  "reduced",
  "improved",
  "increased",
  "saved",
  "lifted",
  "resulting",
  "cut",
  "cutting",
  "grew",
  "accelerated",
] as const;

const SAFE_REWRITES = [
  {
    id: "pipeline-impact",
    needle: "Built Python and SQL feature pipelines for 1.8 million synthetic records, reducing batch runtime by 38%.",
    replacement: "Engineered Python and SQL feature pipelines for 1.8 million synthetic records, cutting batch runtime by 38%.",
    label: "Lead with engineering ownership",
    reason: "Preserves the original scale and measured result while replacing a generic opening verb.",
  },
  {
    id: "model-impact",
    needle: "Trained and evaluated scikit-learn classification models; improved held-out recall from 0.71 to 0.84.",
    replacement: "Improved held-out recall from 0.71 to 0.84 by training and evaluating scikit-learn classification models.",
    label: "Front-load the model outcome",
    reason: "Moves an existing evaluation result forward without inventing a metric or method.",
  },
  {
    id: "delivery-impact",
    needle: "Containerised a Docker inference service and introduced CI/CD checks, reducing release rollback time by 45%.",
    replacement: "Reduced release rollback time by 45% by containerising a Docker inference service and introducing CI/CD checks.",
    label: "Connect delivery work to impact",
    reason: "Keeps the exact deployment evidence and makes its operational result easier to scan.",
  },
] as const;

const TABS: readonly { id: StudioTab; step: string; label: string; detail: string }[] = [
  { id: "inputs", step: "01", label: "Brief", detail: "Role + CV" },
  { id: "analysis", step: "02", label: "Match", detail: "Weighted signals" },
  { id: "evidence", step: "03", label: "Refine", detail: "Proof + rewrites" },
  { id: "output", step: "04", label: "Build", detail: "Template bundle" },
] as const;

function normalise(value: string) {
  return value
    .toLocaleLowerCase("en-GB")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsVariant(text: string, variant: string) {
  const haystack = ` ${normalise(text)} `;
  const needle = ` ${normalise(variant)} `;
  return haystack.includes(needle);
}

function countVariant(text: string, variant: string) {
  const haystack = ` ${normalise(text)} `;
  const needle = ` ${normalise(variant)} `;
  let count = 0;
  let cursor = 0;

  while (needle.trim() && haystack.indexOf(needle, cursor) !== -1) {
    count += 1;
    cursor = haystack.indexOf(needle, cursor) + needle.length;
  }

  return count;
}

function sentences(text: string) {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.replace(/^[•*-]\s*/, "").trim())
    .filter(Boolean);
}

function matchingSentence(text: string, variants: readonly string[]) {
  return sentences(text).find((sentence) => variants.some((variant) => containsVariant(sentence, variant))) ?? "";
}

function shorten(value: string, max = 164) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function inspectEvidence(evidence: string | null) {
  if (!evidence) {
    return { strength: 0, hasAction: false, hasMetric: false, hasOutcome: false };
  }
  const clean = normalise(evidence);
  const hasAction = ACTION_VERBS.some((verb) => containsVariant(clean, verb));
  const directionalMetric = /\bfrom\s+(?:[£$€]\s*)?\d+(?:[.,]\d+)?(?:\s?%)?\s+to\s+(?:[£$€]\s*)?\d+(?:[.,]\d+)?(?:\s?%)?\b/i.test(evidence);
  const measuredValue = /[£$€]\s*\d+(?:[.,]\d+)?/i.test(evidence)
    || /\b\d+(?:[.,]\d+)?\s?%/i.test(evidence)
    || /\b\d+(?:[.,]\d+)?\s?(?:×|x)\b/i.test(evidence)
    || /\b\d+(?:[.,]\d+)?\s+(?:million|thousand|records?|users?|customers?|hours?|minutes?|seconds?|days?|weeks?|models?|experiments?|deployments?|requests?|transactions?)\b/i.test(evidence);
  const hasMetric = directionalMetric || measuredValue;
  const hasOutcome = directionalMetric || OUTCOME_HINTS.some((hint) => containsVariant(clean, hint));
  return {
    strength: 35 + (hasAction ? 25 : 0) + (hasMetric ? 25 : 0) + (hasOutcome ? 15 : 0),
    hasAction,
    hasMetric,
    hasOutcome,
  };
}

function calculateStructureScore(cv: string) {
  const checks = [
    /\b(profile|summary)\b/i,
    /\b(experience|employment)\b/i,
    /\b(projects?|skills?)\b/i,
    /\b(education|qualifications?)\b/i,
  ];
  return checks.reduce((total, pattern) => total + (pattern.test(cv) ? 25 : 0), 0);
}

function analyse(cv: string, job: string, lens: PriorityLens): AnalysisReport {
  const jobSentences = sentences(job);
  const extracted = SIGNALS.flatMap((signal): SignalResult[] => {
    const frequency = Math.max(...signal.variants.map((variant) => countVariant(job, variant)));
    if (frequency === 0) return [];

    const jobEvidence = matchingSentence(job, signal.variants);
    const required = jobSentences.some((sentence) => (
      signal.variants.some((variant) => containsVariant(sentence, variant))
      && REQUIRED_HINTS.some((hint) => containsVariant(sentence, hint))
    ));

    if (lens === "core" && !required && signal.baseWeight < 5) return [];

    const cvEvidence = matchingSentence(cv, signal.variants) || null;
    const weight = signal.baseWeight
      + signal.specificity
      + Math.min(Math.max(frequency - 1, 0), 2)
      + (required ? 2 : 0);

    const evidence = inspectEvidence(cvEvidence);

    return [{
      ...signal,
      frequency,
      required,
      weight,
      matched: Boolean(cvEvidence),
      jobEvidence,
      cvEvidence,
      evidenceStrength: evidence.strength,
      hasAction: evidence.hasAction,
      hasMetric: evidence.hasMetric,
      hasOutcome: evidence.hasOutcome,
    }];
  }).sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));

  const totalWeight = extracted.reduce((sum, signal) => sum + signal.weight, 0);
  const matched = extracted.filter((signal) => signal.matched);
  const missing = extracted.filter((signal) => !signal.matched);
  const matchedWeight = matched.reduce((sum, signal) => sum + signal.weight, 0);
  const weightedCoverage = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);
  const evidenceWeight = matched.reduce((sum, signal) => sum + signal.weight, 0);
  const evidenceQuality = evidenceWeight === 0
    ? 0
    : Math.round(matched.reduce((sum, signal) => sum + signal.weight * signal.evidenceStrength, 0) / evidenceWeight);
  const structureScore = calculateStructureScore(cv);
  const readiness = Math.round(weightedCoverage * 0.6 + evidenceQuality * 0.3 + structureScore * 0.1);

  const categoryCoverage = CATEGORIES.map((category) => {
    const categorySignals = extracted.filter((signal) => signal.category === category);
    const categoryWeight = categorySignals.reduce((sum, signal) => sum + signal.weight, 0);
    const categoryMatchedWeight = categorySignals
      .filter((signal) => signal.matched)
      .reduce((sum, signal) => sum + signal.weight, 0);
    return {
      category,
      score: categoryWeight === 0 ? 0 : Math.round((categoryMatchedWeight / categoryWeight) * 100),
      matched: categorySignals.filter((signal) => signal.matched).length,
      total: categorySignals.length,
    };
  }).filter((item) => item.total > 0);

  return {
    signals: extracted,
    matched,
    missing,
    weightedCoverage,
    evidenceQuality,
    structureScore,
    readiness,
    totalWeight,
    matchedWeight,
    categoryCoverage,
  };
}

function buildSuggestions(cv: string, report: AnalysisReport): RewriteSuggestion[] {
  const rewrites: RewriteSuggestion[] = SAFE_REWRITES
    .filter((rewrite) => cv.includes(rewrite.needle))
    .map((rewrite) => ({
      id: rewrite.id,
      kind: "rewrite",
      label: rewrite.label,
      reason: rewrite.reason,
      original: rewrite.needle,
      replacement: rewrite.replacement,
      canStage: true,
    }));

  const gaps: RewriteSuggestion[] = report.missing.slice(0, 3).map((signal) => ({
    id: `gap-${signal.id}`,
    kind: "gap",
    label: `Validate “${signal.label}”`,
    reason: "The role asks for this signal, but the supplied CV contains no supporting sentence.",
    original: "No evidence located in the CV snapshot.",
    replacement: `If true, add: [action] ${signal.label.toLocaleLowerCase("en-GB")} for [scope], resulting in [verified outcome].`,
    canStage: false,
  }));

  return [...rewrites, ...gaps];
}

function applyRewrites(cv: string, suggestions: RewriteSuggestion[], staged: ReadonlySet<string>) {
  return suggestions.reduce((draft, suggestion) => (
    suggestion.canStage && staged.has(suggestion.id)
      ? draft.replace(suggestion.original, suggestion.replacement)
      : draft
  ), cv);
}

function extractBullets(cv: string) {
  return cv
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("•"))
    .map((line) => line.replace(/^•\s*/, ""));
}

function escapeCount(value: string) {
  return [...value].filter((character) => "\\{}$&#_%~^".includes(character)).length;
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(value, 100))}%`;
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  return (
    <div
      className={styles.scoreRing}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      style={{ "--score": `${value * 3.6}deg` } as CSSProperties}
    >
      <span>{value}</span>
      <small>/100</small>
    </div>
  );
}

function TabButton({
  tab,
  active,
  onSelect,
  onKeyDown,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      id={`cv-studio-tab-${tab.id}`}
      className={`${styles.stepTab} ${active ? styles.activeStep : ""}`}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`cv-studio-panel-${tab.id}`}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <span>{tab.step}</span>
      <strong>{tab.label}</strong>
      <small>{tab.detail}</small>
    </button>
  );
}

export function CvKeywordStudio() {
  const [cvText, setCvText] = useState(SAMPLE_CV);
  const [jobText, setJobText] = useState(SAMPLE_JOB);
  const [role, setRole] = useState("Applied Machine Learning Engineer");
  const [company, setCompany] = useState("Northstar Systems · fictional");
  const [analysed, setAnalysed] = useState({
    cv: SAMPLE_CV,
    job: SAMPLE_JOB,
    role: "Applied Machine Learning Engineer",
    company: "Northstar Systems · fictional",
  });
  const [activeTab, setActiveTab] = useState<StudioTab>("inputs");
  const [template, setTemplate] = useState<TemplateId>("ai");
  const [lens, setLens] = useState<PriorityLens>("all");
  const [stagedRewrites, setStagedRewrites] = useState<Set<string>>(() => new Set());
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<string>("python");
  const [runNumber, setRunNumber] = useState(1);
  const [announcement, setAnnouncement] = useState("Safe sample loaded. Ready to analyse.");

  const report = useMemo(
    () => analyse(analysed.cv, analysed.job, lens),
    [analysed, lens],
  );
  const suggestions = useMemo(
    () => buildSuggestions(analysed.cv, report),
    [analysed.cv, report],
  );
  const draftCv = useMemo(
    () => applyRewrites(analysed.cv, suggestions, stagedRewrites),
    [analysed.cv, stagedRewrites, suggestions],
  );
  const previewBullets = useMemo(() => extractBullets(draftCv), [draftCv]);
  const isDirty = cvText !== analysed.cv
    || jobText !== analysed.job
    || role !== analysed.role
    || company !== analysed.company;
  const buildReady = Boolean(analysed.cv.trim() && analysed.job.trim() && report.signals.length);
  const selected = report.signals.find((signal) => signal.id === selectedSignal) ?? report.signals[0];
  const templateProfile = TEMPLATE_PROFILES[template];
  const templateSignals = report.signals.filter((signal) => signal.templates.includes(template));
  const templateMatched = templateSignals.filter((signal) => signal.matched).length;
  const stagedCount = stagedRewrites.size;
  const studioStyle = {
    "--studio-accent": templateProfile.accent,
    "--studio-accent-soft": templateProfile.soft,
  } as CSSProperties;

  function runAnalysis() {
    if (!cvText.trim() || !jobText.trim()) return;
    setAnalysed({ cv: cvText, job: jobText, role, company });
    setStagedRewrites(new Set());
    setRunNumber((current) => current + 1);
    setActiveTab("analysis");
    setAnnouncement("Analysis complete. Weighted matching and evidence checks are current.");
  }

  function loadSample() {
    setCvText(SAMPLE_CV);
    setJobText(SAMPLE_JOB);
    setRole("Applied Machine Learning Engineer");
    setCompany("Northstar Systems · fictional");
    setAnalysed({
      cv: SAMPLE_CV,
      job: SAMPLE_JOB,
      role: "Applied Machine Learning Engineer",
      company: "Northstar Systems · fictional",
    });
    setTemplate("ai");
    setLens("all");
    setStagedRewrites(new Set());
    setSelectedSignal("python");
    setIncludeCoverLetter(false);
    setRunNumber((current) => current + 1);
    setActiveTab("inputs");
    setAnnouncement("The fictional source-faithful sample has been restored.");
  }

  function clearWorkspace() {
    setCvText("");
    setJobText("");
    setRole("");
    setCompany("");
    setAnalysed({ cv: "", job: "", role: "", company: "" });
    setStagedRewrites(new Set());
    setSelectedSignal("");
    setActiveTab("inputs");
    setAnnouncement("Workspace cleared. No browser storage was used.");
  }

  function toggleRewrite(id: string) {
    setStagedRewrites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? TABS.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    const nextTab = TABS[nextIndex];
    setActiveTab(nextTab.id);
    document.getElementById(`cv-studio-tab-${nextTab.id}`)?.focus();
  }

  return (
    <DemoWindow
      appName="CV Keyword Studio"
      title="Role-tailored CV build lab"
      status={isDirty ? "EDITING · RUN TO REFRESH" : "ANALYSIS CURRENT"}
      statusTone={isDirty ? "working" : "safe"}
      className={styles.studio}
      footer={
        <>
          <span>Run #{runNumber} · {report.signals.length}/40 unique signals</span>
          <span>{stagedCount} factual rewrite{stagedCount === 1 ? "" : "s"} staged · memory only</span>
        </>
      }
    >
      <div style={studioStyle}>
        <p className={styles.liveRegion} role="status" aria-live="polite">{announcement}</p>

        <aside className={styles.privacyBanner} aria-label="Demonstration privacy boundary">
          <span className={styles.shield} aria-hidden="true">✓</span>
          <div>
            <strong>Fictional data. Local deterministic demo.</strong>
            <p>No upload, API call, storage, hiring decision, or personal document is used. The original workflow used model-assisted extraction and LaTeX; this browser edition exposes a smaller rule set so every calculation can be inspected.</p>
          </div>
          <span className={styles.memoryBadge}>SESSION MEMORY ONLY</span>
        </aside>

        <div className={styles.commandStrip}>
          <div className={styles.commandGroup}>
            <MacButton onClick={runAnalysis} primary disabled={!isDirty || !cvText.trim() || !jobText.trim()}>
              Run analysis
            </MacButton>
            <MacButton onClick={loadSample}>Restore sample</MacButton>
            <MacButton onClick={clearWorkspace}>Clear</MacButton>
          </div>
          <label className={styles.lensControl}>
            <span>Extraction lens</span>
            <select value={lens} onChange={(event) => setLens(event.target.value as PriorityLens)}>
              <option value="all">Balanced · all detected</option>
              <option value="core">Core · essential / weight 5</option>
            </select>
          </label>
        </div>

        <nav className={styles.stepTabs} role="tablist" aria-label="CV build workflow">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onSelect={() => setActiveTab(tab.id)}
              onKeyDown={handleTabKeyDown}
            />
          ))}
        </nav>

        {activeTab === "inputs" ? (
          <section
            id="cv-studio-panel-inputs"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="cv-studio-tab-inputs"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span>INPUT SNAPSHOT</span>
                <h3>Start with role context and sanitised evidence</h3>
              </div>
              <p>Edits remain local until “Run analysis” snapshots them.</p>
            </div>

            <div className={styles.metaGrid}>
              <label>
                <span>Target role</span>
                <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Product Analyst" />
              </label>
              <label>
                <span>Company / context</span>
                <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Use a fictional label" />
              </label>
            </div>

            <div className={styles.editorGrid}>
              <label className={styles.editorPanel}>
                <span className={styles.editorHeading}>
                  <span><b>01</b> Sanitised CV evidence</span>
                  <small>{cvText.length.toLocaleString("en-GB")} chars</small>
                </span>
                <textarea
                  value={cvText}
                  onChange={(event) => setCvText(event.target.value)}
                  spellCheck="true"
                  aria-describedby="cv-studio-cv-help"
                />
                <small id="cv-studio-cv-help">Use skills and achievements only; remove names, contacts and confidential details.</small>
              </label>
              <label className={styles.editorPanel}>
                <span className={styles.editorHeading}>
                  <span><b>02</b> Job description</span>
                  <small>{jobText.length.toLocaleString("en-GB")} chars</small>
                </span>
                <textarea
                  value={jobText}
                  onChange={(event) => setJobText(event.target.value)}
                  spellCheck="true"
                  aria-describedby="cv-studio-job-help"
                />
                <small id="cv-studio-job-help">Signals are normalised, deduplicated and capped at 40 in the production workflow.</small>
              </label>
            </div>

            <div className={styles.inputChecks} aria-label="Input validation checks">
              <span className={cvText.trim() ? styles.pass : styles.wait}><b>{cvText.trim() ? "✓" : "–"}</b> CV text present</span>
              <span className={jobText.trim() ? styles.pass : styles.wait}><b>{jobText.trim() ? "✓" : "–"}</b> Role brief present</span>
              <span className={styles.pass}><b>✓</b> No file upload</span>
              <span className={styles.pass}><b>✓</b> No network request</span>
            </div>
          </section>
        ) : null}

        {activeTab === "analysis" ? (
          <section
            id="cv-studio-panel-analysis"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="cv-studio-tab-analysis"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span>WEIGHTED MATCH REPORT</span>
                <h3>Coverage is useful only when evidence is visible</h3>
              </div>
              <p>Editing aid, never a candidate rank or hiring recommendation.</p>
            </div>

            <div className={styles.scoreGrid}>
              <article className={styles.primaryScore}>
                <ScoreRing value={report.readiness} label="Document editing readiness" />
                <div>
                  <span>EDITING READINESS</span>
                  <strong>{report.readiness >= 80 ? "Strong evidence base" : report.readiness >= 60 ? "Good base, clear gaps" : "Needs substantiation"}</strong>
                  <p>60% weighted coverage + 30% evidence quality + 10% section structure.</p>
                </div>
              </article>
              <article className={styles.metricCard}>
                <span>WEIGHTED COVERAGE</span>
                <strong>{report.weightedCoverage}%</strong>
                <p>{report.matchedWeight} of {report.totalWeight} priority points</p>
              </article>
              <article className={styles.metricCard}>
                <span>EVIDENCE QUALITY</span>
                <strong>{report.evidenceQuality}%</strong>
                <p>action + metric + outcome checks</p>
              </article>
              <article className={styles.metricCard}>
                <span>STRUCTURE</span>
                <strong>{report.structureScore}%</strong>
                <p>profile · experience · skills/projects · education</p>
              </article>
            </div>

            <div className={styles.analysisGrid}>
              <article className={styles.panel}>
                <div className={styles.panelTitle}>
                  <div><span>WEIGHT MAP</span><strong>Coverage by signal family</strong></div>
                  <small>{report.matched.length}/{report.signals.length} matched</small>
                </div>
                <div className={styles.categoryBars}>
                  {report.categoryCoverage.map((item) => (
                    <div className={styles.categoryRow} key={item.category}>
                      <span>{item.category}</span>
                      <div className={styles.barTrack} aria-hidden="true"><i style={{ width: formatPercent(item.score) }} /></div>
                      <b>{item.score}%</b>
                      <small>{item.matched}/{item.total}</small>
                    </div>
                  ))}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelTitle}>
                  <div><span>PRIORITY QUEUE</span><strong>Highest-value gaps</strong></div>
                  <small>{report.missing.length} to validate</small>
                </div>
                <ol className={styles.gapList}>
                  {report.missing.slice(0, 5).map((signal) => (
                    <li key={signal.id}>
                      <span className={styles.gapRank}>+{signal.weight}</span>
                      <div><strong>{signal.label}</strong><small>{signal.required ? "Essential wording" : "Supporting signal"} · {signal.category}</small></div>
                    </li>
                  ))}
                  {!report.missing.length ? <li className={styles.emptyState}>No detected gaps. Review proof quality next.</li> : null}
                </ol>
              </article>
            </div>

            <article className={`${styles.panel} ${styles.signalPanel}`}>
              <div className={styles.panelTitle}>
                <div><span>EXTRACTED SIGNALS</span><strong>Term-by-term calculation</strong></div>
                <small>base + specificity + repetition + essential boost</small>
              </div>
              <div className={styles.signalTableWrap}>
                <table className={styles.signalTable}>
                  <thead><tr><th>Signal</th><th>Family</th><th>Priority</th><th>Weight</th><th>CV evidence</th></tr></thead>
                  <tbody>
                    {report.signals.map((signal) => (
                      <tr key={signal.id} className={selectedSignal === signal.id ? styles.selectedRow : ""}>
                        <th scope="row">
                          <button type="button" onClick={() => { setSelectedSignal(signal.id); setActiveTab("evidence"); }}>
                            {signal.label}
                          </button>
                        </th>
                        <td>{signal.category}</td>
                        <td>{signal.required ? <span className={styles.coreTag}>CORE</span> : "Support"}</td>
                        <td><b>{signal.weight}</b><small>{signal.baseWeight}+{signal.specificity}+{Math.min(Math.max(signal.frequency - 1, 0), 2)}+{signal.required ? 2 : 0}</small></td>
                        <td>{signal.matched ? <span className={styles.foundTag}>✓ Found</span> : <span className={styles.missingTag}>— Missing</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "evidence" ? (
          <section
            id="cv-studio-panel-evidence"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="cv-studio-tab-evidence"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span>EVIDENCE MAPPER</span>
                <h3>Trace role language to proof, then edit truthfully</h3>
              </div>
              <p>Missing terms are coaching prompts, never auto-inserted claims.</p>
            </div>

            <div className={styles.evidenceGrid}>
              <aside className={styles.signalRail} aria-label="Detected role signals">
                <div className={styles.railHeading}><strong>Role signals</strong><small>{report.signals.length} detected</small></div>
                {report.signals.map((signal) => (
                  <button
                    key={signal.id}
                    type="button"
                    className={selected?.id === signal.id ? styles.activeSignal : ""}
                    onClick={() => setSelectedSignal(signal.id)}
                  >
                    <span className={signal.matched ? styles.signalDotFound : styles.signalDotMissing} aria-hidden="true" />
                    <span><strong>{signal.label}</strong><small>{signal.category}</small></span>
                    <b>{signal.weight}</b>
                  </button>
                ))}
              </aside>

              <article className={styles.evidenceDetail} aria-live="polite">
                {selected ? (
                  <>
                    <header>
                      <div>
                        <span className={selected.matched ? styles.foundTag : styles.missingTag}>{selected.matched ? "✓ EVIDENCE LOCATED" : "— NO CV EVIDENCE"}</span>
                        <h4>{selected.label}</h4>
                        <p>{selected.category} · weight {selected.weight} · seen {selected.frequency}× in role brief</p>
                      </div>
                      <div className={styles.miniMeter}>
                        <span style={{ width: formatPercent(selected.evidenceStrength) }} />
                        <b>{selected.evidenceStrength}% proof quality</b>
                      </div>
                    </header>
                    <div className={styles.quotePair}>
                      <div><span>ROLE EVIDENCE</span><blockquote>{shorten(selected.jobEvidence, 240)}</blockquote></div>
                      <div><span>CV EVIDENCE</span><blockquote className={!selected.cvEvidence ? styles.noEvidence : ""}>{selected.cvEvidence ? shorten(selected.cvEvidence, 240) : "No matching sentence. Validate experience before adding this term."}</blockquote></div>
                    </div>
                    <div className={styles.proofChecks}>
                      <span className={selected.cvEvidence ? styles.checkOn : ""}><b>{selected.cvEvidence ? "✓" : "–"}</b> Relevant sentence</span>
                      <span className={selected.hasAction ? styles.checkOn : ""}><b>{selected.hasAction ? "✓" : "–"}</b> Action verb</span>
                      <span className={selected.hasMetric ? styles.checkOn : ""}><b>{selected.hasMetric ? "✓" : "–"}</b> Metric</span>
                      <span className={selected.hasOutcome ? styles.checkOn : ""}><b>{selected.hasOutcome ? "✓" : "–"}</b> Outcome</span>
                    </div>
                  </>
                ) : <p className={styles.emptyState}>Run an analysis to inspect evidence.</p>}
              </article>
            </div>

            <article className={`${styles.panel} ${styles.rewritePanel}`}>
              <div className={styles.panelTitle}>
                <div><span>TRUTH-PRESERVING REWRITE DESK</span><strong>Stage improvements for the output preview</strong></div>
                <small>{stagedCount} staged</small>
              </div>
              <div className={styles.suggestionList}>
                {suggestions.map((suggestion) => {
                  const isStaged = stagedRewrites.has(suggestion.id);
                  return (
                    <article key={suggestion.id} className={suggestion.kind === "gap" ? styles.gapSuggestion : ""}>
                      <header>
                        <span>{suggestion.kind === "rewrite" ? "SAFE REWRITE" : "EVIDENCE GAP"}</span>
                        <strong>{suggestion.label}</strong>
                      </header>
                      <p>{suggestion.reason}</p>
                      <div className={styles.rewriteDiff}>
                        <div><span>{suggestion.kind === "rewrite" ? "BEFORE" : "OBSERVED"}</span><p>{suggestion.original}</p></div>
                        <span aria-hidden="true">→</span>
                        <div><span>{suggestion.kind === "rewrite" ? "STAGED DRAFT" : "COACHING PROMPT"}</span><p>{suggestion.replacement}</p></div>
                      </div>
                      {suggestion.canStage ? (
                        <button
                          type="button"
                          className={`${styles.stageButton} ${isStaged ? styles.stagedButton : ""}`}
                          aria-pressed={isStaged}
                          onClick={() => toggleRewrite(suggestion.id)}
                        >
                          {isStaged ? "✓ Staged in preview" : "+ Stage factual rewrite"}
                        </button>
                      ) : <span className={styles.manualOnly}>MANUAL VALIDATION REQUIRED</span>}
                    </article>
                  );
                })}
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "output" ? (
          <section
            id="cv-studio-panel-output"
            className={styles.tabPanel}
            role="tabpanel"
            aria-labelledby="cv-studio-tab-output"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span>ROLE-SPECIFIC BUILD</span>
                <h3>Preview the selected LaTeX route and output bundle</h3>
              </div>
              <p>Visual simulation only; this page does not compile or download a personal CV.</p>
            </div>

            <fieldset className={styles.templatePicker}>
              <legend>Choose one of the original workflow&apos;s eight template routes</legend>
              <div>
                {(Object.entries(TEMPLATE_PROFILES) as Array<[TemplateId, (typeof TEMPLATE_PROFILES)[TemplateId]]>).map(([id, profile]) => (
                  <button
                    key={id}
                    type="button"
                    className={template === id ? styles.activeTemplate : ""}
                    aria-pressed={template === id}
                    onClick={() => setTemplate(id)}
                  >
                    <span aria-hidden="true" style={{ background: profile.accent }} />
                    <strong>{profile.label}</strong>
                    <small>.tex</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className={styles.outputGrid}>
              <article className={styles.buildPanel}>
                <div className={styles.panelTitle}>
                  <div><span>BUILD CONFIGURATION</span><strong>{templateProfile.file}</strong></div>
                  <span className={buildReady ? styles.validTag : styles.blockedTag}>{buildReady ? "VALID" : "WAITING"}</span>
                </div>
                <dl className={styles.buildStats}>
                  <div><dt>Template focus</dt><dd>{templateProfile.emphasis}</dd></div>
                  <div><dt>Relevant signals</dt><dd>{templateMatched}/{templateSignals.length || 0} evidenced</dd></div>
                  <div><dt>Keyword payload</dt><dd>{report.signals.length} unique · JSON shape checked</dd></div>
                  <div><dt>LaTeX escaping</dt><dd>{escapeCount(report.signals.map((signal) => signal.label).join(", "))} reserved characters</dd></div>
                  <div><dt>Staged edits</dt><dd>{stagedCount} fact-preserving rewrite{stagedCount === 1 ? "" : "s"}</dd></div>
                </dl>

                <label className={styles.coverToggle}>
                  <input type="checkbox" checked={includeCoverLetter} onChange={(event) => setIncludeCoverLetter(event.target.checked)} />
                  <span aria-hidden="true" />
                  <div><strong>Include cover-letter route</strong><small>Mirrors the optional production flag; no text is generated here.</small></div>
                </label>

                <div className={styles.pipeline} aria-label="Build pipeline simulation">
                  <div className={styles.pipelineStep}><span>1</span><div><strong>Parse</strong><small>UTF-8 input snapshot</small></div><b>{buildReady ? "DONE" : "WAIT"}</b></div>
                  <div className={styles.pipelineStep}><span>2</span><div><strong>Validate</strong><small>unique strings · max 40</small></div><b>{buildReady ? "DONE" : "WAIT"}</b></div>
                  <div className={styles.pipelineStep}><span>3</span><div><strong>Escape</strong><small>LaTeX reserved characters</small></div><b>{buildReady ? "DONE" : "WAIT"}</b></div>
                  <div className={styles.pipelineStep}><span>4</span><div><strong>Typeset</strong><small>LuaLaTeX simulation</small></div><b>{buildReady ? "READY" : "BLOCKED"}</b></div>
                </div>
              </article>

              <article className={styles.documentPreview} aria-label="Fictional CV output preview">
                <div className={styles.paperToolbar}>
                  <span>PREVIEW · PAGE 1 / 1</span>
                  <span>{templateProfile.label.toUpperCase()} PROFILE</span>
                </div>
                {buildReady ? <div className={styles.paper}>
                  <header>
                    <span>FICTIONAL CANDIDATE</span>
                    <h4>Alex Morgan</h4>
                    <p>{analysed.role || "Target role"} · London, UK</p>
                  </header>
                  <section>
                    <h5>Profile</h5>
                    <p>Product-minded data scientist building reliable analytical tools for ambiguous questions.</p>
                  </section>
                  <section>
                    <h5>{template === "science" ? "Selected Research & Experience" : template === "product" ? "Product Experience" : "Selected Experience"}</h5>
                    <ul>
                      {previewBullets.slice(0, 5).map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h5>Role alignment</h5>
                    <p className={styles.keywordLine}>{report.matched.slice(0, 9).map((signal) => signal.label).join(" · ") || "Run analysis to populate evidenced signals"}</p>
                  </section>
                  <footer>Demonstration preview · fictional content · not a generated file</footer>
                </div> : <div className={styles.buildEmpty} role="status"><span aria-hidden="true">□</span><strong>No validated snapshot</strong><p>Return to Brief, add CV evidence and a role description, then run the analysis before inspecting output.</p></div>}
              </article>
            </div>

            <article className={`${styles.panel} ${styles.manifest}`}>
              <div className={styles.panelTitle}>
                <div><span>OUTPUT MANIFEST</span><strong>YYYYMMDD {analysed.role || "Role"} from {analysed.company || "Company"}/</strong></div>
                <small>{buildReady ? `${includeCoverLetter ? 4 : 2} dated outputs · 1 workspace file` : "Build waiting for a validated snapshot"}</small>
              </div>
              <div className={styles.fileGrid}>
                <div><span className={styles.fileIcon}>PDF</span><p><strong>CV.pdf</strong><small>role-tailored document</small></p><b>{buildReady ? "READY" : "WAITING"}</b></div>
                <div><span className={styles.txtIcon}>TXT</span><p><strong>Job Description.txt</strong><small>source snapshot</small></p><b>{buildReady ? "READY" : "WAITING"}</b></div>
                {includeCoverLetter ? <div><span className={styles.pdfAltIcon}>PDF</span><p><strong>Cover Letter.pdf</strong><small>optional compiled route</small></p><b>{buildReady ? "SIMULATED" : "WAITING"}</b></div> : null}
                {includeCoverLetter ? <div><span className={styles.texIcon}>TEX</span><p><strong>Cover Letter Main.tex</strong><small>escaped source body</small></p><b>{buildReady ? "SIMULATED" : "WAITING"}</b></div> : null}
                <div><span className={styles.texIcon}>TEX</span><p><strong>Keywords Placement.tex</strong><small>legacy workspace artifact · no active template include</small></p><b>{buildReady ? "UNEMBEDDED" : "WAITING"}</b></div>
              </div>
            </article>
          </section>
        ) : null}

        <details className={styles.methodology}>
          <summary>Methodology, provenance &amp; limitations</summary>
          <div>
            <p><strong>Source-derived, safety-improved adaptation:</strong> job description → ranked keyword payload → role-specific LaTeX template → LuaLaTeX PDF → dated output folder, with an optional cover-letter route. The working repository validates strict JSON, deduplicates up to 40 terms, escapes LaTeX control characters, and offers Tech, Consult, Product, Science, Law, Fintech, AI and Ops templates. Its former hidden keyword-injection mechanism has now been removed from every active template; this port likewise turns each signal into visible, reviewable evidence.</p>
            <p><strong>Browser adaptation:</strong> this showcase replaces external model inference with a deterministic 18-signal dictionary. Weight = base relevance + specificity + up to 2 repetition points + 2 points for essential wording. Proof quality separately checks a relevant sentence, an action verb, a measured unit/percentage or directional result, and an explicit outcome phrase; bare version numbers do not count as impact. Editing readiness is document feedback only, not an ATS emulator, employability score, or automated hiring decision.</p>
            <p><strong>Integrity boundary:</strong> a missing signal is never inserted automatically. Only three rewrites grounded verbatim in the fictional sample can be staged, and every generated coaching prompt contains explicit placeholders for evidence that must be verified.</p>
          </div>
        </details>
      </div>
    </DemoWindow>
  );
}

export default CvKeywordStudio;
