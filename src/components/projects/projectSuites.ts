import type { Project } from "@/data/projects";

export type ProjectSuite = {
  id: string;
  title: string;
  description: string;
  slugs: readonly string[];
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
    description: "From conformer assignment to the plotting utility that made spectral evidence inspectable.",
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
    description: "Structured reflection and synthetic evidence workbenches, presented as reasoning exercises rather than products.",
    slugs: ["innovation-models-reflection", "ai-venture-reasoning"],
  },
  {
    id: "supporting-audits",
    title: "Supporting Prototype & Code Audits",
    description: "Small source projects presented as transparent audits of what the code does—and does not—establish.",
    slugs: ["course-recommender-audit", "cost-sensitive-cyber-detection", "stock-market-engine"],
  },
] as const;

export function getProjectSuite(project: Pick<Project, "slug">) {
  return projectSuites.find((suite) => suite.slugs.includes(project.slug));
}
