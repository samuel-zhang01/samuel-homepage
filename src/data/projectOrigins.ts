export type ProjectOrigin = {
  id: string;
  label: string;
  context: string;
  section: "experience" | "education";
  /** CV dates; ongoing independent work deliberately has no invented start date. */
  period?: string;
  projects: string[];
  /** A subject or later-work connection, rather than direct role provenance. */
  relatedProjects?: string[];
};

/** CV-backed roles and explicit project context; shared dates alone do not imply employment. */
export const projectOrigins: ProjectOrigin[] = [
  { id: "marsh", label: "Marsh · Applied AI research", period: "May 2026 — Present", context: "Applied-AI research in a regulated insurance setting, with documented evaluation and broker review. The linked project uses fictional scenarios; client data and findings remain private.", section: "experience", projects: ["insurance-lead-matching"] },
  { id: "coverd", label: "COVERD · Founder & Product Lead", period: "Mar 2026 — Present", context: "Discovery with four design partners, three voice-interview architectures tested across 20 interviews by April 2026, and an ATS-connected product that preserves recruiter judgement.", section: "experience", projects: ["coverd-ai", "coverd-yasa", "cv-keyword-automator"], relatedProjects: ["cv-keyword-automator"] },
  { id: "imperial", label: "Imperial · MSc AI Applications & Innovation", period: "Sep 2025 — Sep 2026", context: "MSc study in deep learning, AI safety, medical imaging, climate applications and innovation management, connected to the corresponding research and coursework projects.", section: "education", projects: ["insurance-lead-matching", "causal-ope-lab", "microrobot-vision", "trustworthy-mri-reconstruction", "neural-cfd-surrogates", "air-quality-sensor-optimisation", "cost-sensitive-cyber-detection", "regularisation-lab", "safety-critical-ai", "safe-learning-to-defer", "innovation-models-reflection", "ai-venture-reasoning"] },
  { id: "pfizer", label: "Pfizer · Product ownership", period: "Oct 2024 — Apr 2026", context: "Continued GROWMAT product ownership after the placement: roadmap, stakeholder adoption and development of workload and capacity planning for analytical R&D.", section: "experience", projects: ["growmat"] },
  { id: "pfizer-placement", label: "Pfizer · Analytical R&D placement", period: "Sep 2023 — Aug 2024", context: "Built and delivered GROWMAT through product discovery, full-stack delivery, reliability and change management in a regulated R&D environment.", section: "experience", projects: ["growmat"] },
  { id: "kcl-research-2023", label: "King’s · Summer research project", period: "Jun — Jul 2023", context: "The 2023 research role provides related scientific context for the later GROMACS setup work completed in 2025. That separate project covers environment configuration and topology preparation; it is not presented as work completed during the 2023 role.", section: "experience", projects: ["gromacs-hpc"], relatedProjects: ["gromacs-hpc"] },
  { id: "kcl-teaching", label: "King’s · Coding Series Tutor", period: "Jan 2023 — Apr 2025", context: "Designed and delivered 20+ programming and data-analysis sessions for 80+ chemistry students. The linked computational-chemistry study archive supplies related subject context; its credited coursework is distinct from the tutor’s teaching curriculum.", section: "experience", projects: ["coding-series"], relatedProjects: ["coding-series"] },
  { id: "kcl-research-2022", label: "King’s · Undergraduate Research Fellow", period: "Jun — Jul 2022", context: "Built MATLAB, Python and Excel tools for rotational spectroscopy. The related molecular-recognition work names Samuel as a co-author in the 2025 ISMS conference record.", section: "experience", projects: ["molecular-recognition", "cprot-spectroscopy-plotter"] },
  { id: "kcl", label: "King’s · BSc Chemistry with Biomedicine", period: "Sep 2021 — May 2025", context: "First-Class Honours, a professional placement and study in computational chemistry, molecular biology, chemical biology and organic chemistry; also completed the Associate of King’s College London programme.", section: "education", projects: ["coding-series", "molecular-recognition", "cprot-spectroscopy-plotter", "growmat"] },
  { id: "scdf", label: "Singapore Civil Defence Force · National service", period: "Jul 2019 — Jul 2021", context: "Public-data decision support and workflow automation during pandemic-era emergency operations, alongside time-critical support for senior leaders.", section: "experience", projects: ["covid-decision-support"] },
  { id: "personal-projects", label: "Independent · Technical projects", period: "Ongoing", context: "The CV’s home-lab and Julia market-simulation projects connect to a wider independent practice in local applications, learning tools and infrastructure.", section: "experience", projects: ["home-automation-stack", "stock-market-engine", "ocean-depths-finance", "study-rl", "sequential-decisions-lab", "parliamo-italian-learning", "deep-learning-environment-resolver"] },
];

export function getProjectOrigins(slug: string) {
  return projectOrigins.filter((origin) => origin.projects.includes(slug));
}

export function projectOriginSearchText(slug: string) {
  return getProjectOrigins(slug).map((origin) => `${origin.label} ${origin.period ?? ""} ${origin.context}`).join(" ");
}
