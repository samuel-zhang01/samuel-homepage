import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import { getProjectArchiveCopy } from "./projectArchiveI18n";
import styles from "./ProjectCaseBrief.module.css";

function evidenceLabel(project: Project) {
  if (project.access === "proprietary") return "PUBLIC BOUNDARY / SYNTHETIC OR HIGH-LEVEL EVIDENCE";
  if (project.access === "case-study") return "SOURCE-RECORDED METHOD / SAFE RECONSTRUCTION";
  return "SOURCE-RECORDED METHOD / BROWSER RECONSTRUCTION";
}

const suites = [
  {
    title: "Decision & RL Methods",
    description: "From learning exercises to policy evidence, causal adjustment and deferral limits.",
    slugs: ["study-rl", "sequential-decisions-lab", "causal-ope-lab", "safe-learning-to-defer"],
  },
  {
    title: "Scientific ML & Trust",
    description: "Architecture, uncertainty and evaluation provenance for scientific machine-learning systems.",
    slugs: ["microrobot-vision", "trustworthy-mri-reconstruction", "neural-cfd-surrogates", "safety-critical-ai", "deep-learning-environment-resolver"],
  },
  {
    title: "Sensor ML & Evaluation Audits",
    description: "Measurement, regularisation and the data-quality conditions required before model claims are credible.",
    slugs: ["air-quality-sensor-optimisation", "regularisation-lab", "cost-sensitive-cyber-detection"],
  },
  {
    title: "Molecular Modelling & Spectroscopy",
    description: "Equation models, solubility workflows, conformer evidence and supporting scientific tools.",
    slugs: ["pc-saft-thermodynamics", "drug-solubility", "molecular-recognition", "cprot-spectroscopy-plotter", "coding-series"],
  },
  {
    title: "Strategy & Venture Reasoning",
    description: "Structured reflection and synthetic evidence workbenches, presented as reasoning exercises rather than products.",
    slugs: ["innovation-models-reflection", "ai-venture-reasoning", "course-recommender-audit"],
  },
  {
    title: "Private Systems Audit",
    description: "Safe public audits of infrastructure and simulation work, with reproducibility boundaries left visible.",
    slugs: ["home-automation-stack", "gromacs-hpc", "stock-market-engine"],
  },
] as const;

export function ProjectCaseBrief({
  project,
  locale,
  onSelectProject,
}: {
  project: Project;
  locale: Locale;
  onSelectProject: (slug: string) => void;
}) {
  const copy = getProjectArchiveCopy(locale).detail.caseBrief;
  const suite = suites.find((candidate) => (candidate.slugs as readonly string[]).includes(project.slug));
  const related = suite
    ? suite.slugs
      .filter((slug) => slug !== project.slug)
      .map((slug) => projects.find((candidate) => candidate.slug === slug))
      .filter((candidate): candidate is Project => Boolean(candidate))
    : [];
  return (
    <section className={styles.brief} aria-labelledby={`case-brief-${project.slug}`}>
      <header className={styles.header}>
        <span>{copy.eyebrow}</span>
        <h4 id={`case-brief-${project.slug}`}>{copy.title}</h4>
        <p>{project.summary}</p>
        <Link className={styles.contact} href="/contact">{copy.discuss}</Link>
      </header>

      <div className={styles.grid}>
        <section>
          <span>{copy.purpose}</span>
          <p>{project.detail}</p>
        </section>
        <section>
          <span>{copy.progression}</span>
          <ol>
            {project.phases.map((phase) => <li key={phase.label}><strong>{getProjectArchiveCopy(locale).phases[phase.label]}.</strong> {phase.text}</li>)}
          </ol>
        </section>
      </div>

      <div className={styles.evidence}>
        <div>
          <span>{copy.evidence} / {evidenceLabel(project)}</span>
          <ul>
            {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </div>
        <aside>
          <span>{copy.walkthrough}</span>
          <p>{copy.walkthroughCopy}</p>
        </aside>
      </div>

      {project.privacyNote ? (
        <p className={styles.boundary}><strong>{copy.boundary}.</strong> {project.privacyNote}</p>
      ) : null}

      {suite && related.length > 0 ? (
        <section className={styles.related} aria-label={`${copy.relatedSuite}: ${suite.title}`}>
          <div>
            <span>{copy.relatedSuite} / {suite.title}</span>
            <p>{suite.description} {copy.relatedCopy}</p>
          </div>
          <div className={styles.relatedLinks}>
            {related.map((relatedProject) => (
              <button key={relatedProject.slug} type="button" onClick={() => onSelectProject(relatedProject.slug)}>
                {relatedProject.shortTitle ?? relatedProject.title} <b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
