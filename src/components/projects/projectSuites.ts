import type { Project } from "@/data/projects";

export type ProjectSuite = {
  id: string;
  title: string;
  description: string;
  slugs: readonly string[];
};

export type ProjectShelfId =
  | "products-operations"
  | "decision-intelligence"
  | "scientific-ml"
  | "molecular-computational"
  | "systems-reproducibility"
  | "learning-strategy";

export type GuidedStartId = "finance" | "insurance" | "mri" | "molecular";

export type ProjectGuidedExperienceReference =
  | { kind: "suite"; id: string; recommendedSlug: string }
  | { kind: "project"; slug: string };

export type ProjectShelfSpec = {
  id: ProjectShelfId;
  code: string;
  experiences: readonly ProjectGuidedExperienceReference[];
  supportingSlugs?: readonly string[];
};

// These are editorial workspaces, not bundles: each chapter stays independently
// lazy-loaded and retains its canonical ?project= deep link.
export const projectSuites: readonly ProjectSuite[] = [
  {
    id: "decision-rl",
    title: "Decision & RL Methods",
    description: "From learning exercises to policy evidence, causal adjustment and deferral limits.",
    slugs: ["study-rl", "sequential-decisions-lab", "causal-ope-lab", "safe-learning-to-defer"],
  },
  {
    id: "scientific-ml",
    title: "Scientific ML & Trust",
    description: "Architecture, uncertainty and evaluation provenance for scientific machine-learning systems.",
    slugs: ["microrobot-vision", "trustworthy-mri-reconstruction", "neural-cfd-surrogates", "safety-critical-ai"],
  },
  {
    id: "systems-reproducibility",
    title: "Systems & Reproducibility",
    description: "Environment setup, operational evidence and recovery boundaries for private systems.",
    slugs: ["deep-learning-environment-resolver", "home-automation-stack", "gromacs-hpc"],
  },
  {
    id: "air-quality",
    title: "Air-Quality ML Decision Lab",
    description: "Sensor selection and regularisation experiments viewed as one environmental decision workflow.",
    slugs: ["air-quality-sensor-optimisation", "regularisation-lab"],
  },
  {
    id: "molecular-recognition",
    title: "Molecular Recognition Workbench",
    description: "From conformer assignment to the plotting utility used to examine spectral evidence.",
    slugs: ["molecular-recognition", "cprot-spectroscopy-plotter"],
  },
  {
    id: "thermodynamics",
    title: "Thermodynamic Modelling Suite",
    description: "A state-evaluation workbench and a distinct solid–liquid equilibrium workflow with explicit model boundaries.",
    slugs: ["pc-saft-thermodynamics", "drug-solubility"],
  },
  {
    id: "strategy-venture",
    title: "Strategy & Venture Reasoning",
    description: "Structured reflection and synthetic-evidence workbenches for practising explicit reasoning.",
    slugs: ["innovation-models-reflection", "ai-venture-reasoning"],
  },
  {
    id: "supporting-audits",
    title: "Supporting Prototype & Code Audits",
    description: "Small source projects presented as audits of what the code establishes and where its limits lie.",
    slugs: ["course-recommender-audit", "cost-sensitive-cyber-detection", "stock-market-engine"],
  },
] as const;

// The guided archive is a disjoint editorial index: every canonical project
// appears exactly once, either as an experience chapter or as supporting evidence.
export const projectShelfSpecs: readonly ProjectShelfSpec[] = [
  {
    id: "products-operations",
    code: "P/O",
    experiences: [
      { kind: "project", slug: "insurance-lead-matching" },
      { kind: "project", slug: "cv-keyword-automator" },
      { kind: "project", slug: "ocean-depths-finance" },
      { kind: "project", slug: "coverd-yasa" },
    ],
    supportingSlugs: ["coverd-ai", "growmat"],
  },
  {
    id: "decision-intelligence",
    code: "D/R",
    experiences: [
      { kind: "suite", id: "decision-rl", recommendedSlug: "causal-ope-lab" },
    ],
    supportingSlugs: ["covid-decision-support"],
  },
  {
    id: "scientific-ml",
    code: "S/ML",
    experiences: [
      { kind: "suite", id: "scientific-ml", recommendedSlug: "trustworthy-mri-reconstruction" },
      { kind: "suite", id: "air-quality", recommendedSlug: "air-quality-sensor-optimisation" },
    ],
  },
  {
    id: "molecular-computational",
    code: "M/C",
    experiences: [
      { kind: "suite", id: "molecular-recognition", recommendedSlug: "molecular-recognition" },
      { kind: "suite", id: "thermodynamics", recommendedSlug: "pc-saft-thermodynamics" },
      { kind: "project", slug: "coding-series" },
    ],
  },
  {
    id: "systems-reproducibility",
    code: "SYS",
    experiences: [
      { kind: "suite", id: "systems-reproducibility", recommendedSlug: "deep-learning-environment-resolver" },
      { kind: "suite", id: "supporting-audits", recommendedSlug: "course-recommender-audit" },
    ],
  },
  {
    id: "learning-strategy",
    code: "L/V",
    experiences: [
      { kind: "project", slug: "parliamo-italian-learning" },
      { kind: "suite", id: "strategy-venture", recommendedSlug: "ai-venture-reasoning" },
    ],
  },
] as const;

export const projectStartPaths: readonly { id: GuidedStartId; slug: string }[] = [
  { id: "finance", slug: "ocean-depths-finance" },
  { id: "insurance", slug: "insurance-lead-matching" },
  { id: "mri", slug: "trustworthy-mri-reconstruction" },
  { id: "molecular", slug: "molecular-recognition" },
] as const;

export function getProjectSuite(project: Pick<Project, "slug">) {
  return projectSuites.find((suite) => suite.slugs.includes(project.slug));
}
