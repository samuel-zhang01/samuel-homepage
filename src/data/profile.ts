import { projects } from "./projects";

export type ProfileSource = {
  id: string;
  title: string;
  kind: "cv" | "showcase" | "conference" | "project";
  href: string;
};

export type ProfileExperience = {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  tag: string;
  copy: string;
  detail?: string;
  sourceIds: string[];
  conceptIds?: string[];
  projectSlugs?: string[];
  relatedProjectSlugs?: string[];
};

export type ProfileEducation = {
  id: string;
  mark: string;
  title: string;
  institution: string;
  period: string;
  result: string;
  modules: string[];
  description: string;
  achievements: string[];
  sourceIds: string[];
  conceptIds?: string[];
  projectSlugs?: string[];
  relatedProjectSlugs?: string[];
};

export type ProfileSkill = {
  id: string;
  title: string;
  group: string;
  description: string;
  projectSlugs: string[];
  /** Subject context is useful navigation, but does not demonstrate the skill. */
  relatedProjectSlugs?: string[];
  originIds: string[];
  conceptIds: string[];
  sourceIds: string[];
};

/** Every claim has a reviewable source. Project links point to the public archive,
 * where source material, simulations and disclosure limits remain distinguishable. */
export const profileSources: ProfileSource[] = [
  { id: "cv", title: "Applied AI CV", kind: "cv", href: "/Samuel-Zhang-Applied-AI-CV.pdf" },
  { id: "growmat-showcase", title: "GROWMAT external showcase", kind: "showcase", href: "/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf" },
  { id: "isms-2025", title: "2025 ISMS conference record", kind: "conference", href: "https://isms.illinois.edu/2025/schedule/schedule_session.php?sID=1669" },
  { id: "run-hack", title: "RUN/HACK field journal", kind: "project", href: "/en-gb/sidequest" },
  ...projects.map(project => ({ id: `archive:${project.slug}`, title: project.shortTitle ?? project.title, kind: "project" as const, href: `/en-gb/projects?project=${project.slug}` })),
];

/** CV-backed chronology. Stable IDs also anchor the desktop and knowledge graph. */
export const profileExperiences: ProfileExperience[] = [
  {
    period: "May 2026 — Present",
    id: "marsh",
    sourceIds: ["cv"],
    role: "Senior Coordinator — Digital Transformation Strategy Internship",
    company: "Marsh · Strategy & Corporate Development Group",
    location: "London",
    copy: "Conducted client-confidential applied-AI research in a regulated insurance setting, with documented evaluation, human oversight and deployment safeguards. Operational data, model design and findings remain private.",
    tag: "CURRENT",
  },
  {
    period: "Mar 2026 — Present",
    id: "coverd",
    sourceIds: ["cv"],
    role: "Founder & Product Lead · Part-time",
    company: "COVERD",
    location: "London",
    copy: "Developed early company-aware voice-interview experiments, then evolved that research into COVERD’s current product: an ATS-connected recruitment-intelligence layer that reviews applications across specialist dimensions, enriches evidence with automated voice interviews and returns reasoned shortlists while recruiters keep the decision.",
    detail: "Led early discovery with four design partners and pivoted from candidate-side CV tooling. By April 2026, tested three voice-interview architectures across 20 candidate interviews; voice enrichment remains optional when application evidence is incomplete.",
    tag: "FOUNDER",
  },
  {
    period: "Oct 2024 — Apr 2026",
    id: "pfizer",
    sourceIds: ["cv", "growmat-showcase"],
    role: "Web Application Developer & Product Owner · Part-time",
    company: "Pfizer Analytical R&D",
    location: "London",
    copy: "Owned the roadmap and stakeholder adoption for GROWMAT, an internal enterprise product. Its external showcase documents the architecture and outcomes; live data, source code, credentials and non-public operating context remain private.",
    tag: "PRODUCT",
  },
  {
    period: "Sep 2023 — Aug 2024",
    id: "pfizer-placement",
    sourceIds: ["cv", "growmat-showcase"],
    role: "Data Analyst Undergraduate",
    company: "Pfizer Analytical R&D",
    location: "Sandwich",
    copy: "Built and delivered GROWMAT within a regulated R&D environment, improving an internal planning process and supporting wider product adoption. Its external showcase is public; live company data, source code, credentials and non-public operating context remain private. Also explored scientific modelling workflows for pharmaceutical research.",
    detail: "Worked across product discovery, full-stack delivery, reliability and change management. Pharmaceutical modelling datasets, parameters and results remain confidential.",
    tag: "DATA",
  },
  {
    period: "Jan 2023 — Apr 2025",
    id: "kcl-teaching",
    sourceIds: ["cv"],
    role: "Coding Series Tutor & Curriculum Designer",
    company: "King’s College London",
    location: "London",
    copy: "Designed and delivered 20+ programming, data-analysis and introductory ML sessions for 80+ chemistry students. Organised a cross-industry data-science careers panel for 100+ attendees and mentored learners in using technical skills to widen their options.",
    tag: "EDUCATION",
  },
  {
    period: "Jun — Jul 2023",
    id: "kcl-research-2023",
    sourceIds: ["cv"],
    role: "Summer Research Project",
    company: "King’s College London",
    location: "London",
    copy: "Studied protein–membrane interactions in silico and used the analysis to refine experimental design. The related GROMACS environment and topology-preparation project was completed later, in 2025.",
    tag: "RESEARCH",
  },
  {
    period: "Jun — Jul 2022",
    id: "kcl-research-2022",
    sourceIds: ["cv", "isms-2025"],
    role: "Undergraduate Research Fellow",
    company: "King’s College London",
    location: "London",
    copy: "Built MATLAB, Python and Excel tooling for rotational-spectroscopy analysis; named co-author on the 2025 International Symposium on Molecular Spectroscopy conference record.",
    tag: "RESEARCH",
  },
  {
    period: "Jul 2019 — Jul 2021",
    id: "scdf",
    sourceIds: ["cv"],
    role: "Commander’s Personal Assistant / Sergeant",
    company: "Singapore Civil Defence Force",
    location: "Singapore",
    copy: "Built decision-support and workflow automation during COVID-19 emergency operations using public epidemiological data. Personnel records, operational processes, infrastructure and scale remain protected.",
    detail: "Supported senior leaders in time-critical operations, balancing incomplete information, rapid prioritisation and accountability across large-scale personnel operations.",
    tag: "SERVICE",
  },
];

export const profileEducation: ProfileEducation[] = [
  {
    id: "imperial", mark: "ICL", title: "MSc AI Applications & Innovation",
    institution: "Imperial College London", period: "Sep 2025 — Sep 2026",
    result: "Predicted Distinction",
    modules: ["Deep Learning", "AI Safety", "Innovation Management", "Machine Learning in Medical Imaging", "Machine Learning in Climate Change"],
    description: "Applied AI study connecting model development, safety and the practical work of introducing new technology. The linked archive includes medical imaging, scientific machine learning, evaluation and venture-design projects.",
    achievements: ["Degree result recorded in the CV as Predicted Distinction.", "Research and coursework span microrobot perception, MRI reconstruction, fluid-flow surrogates and decisions under uncertainty."],
    sourceIds: ["cv", "archive:microrobot-vision", "archive:trustworthy-mri-reconstruction", "archive:neural-cfd-surrogates"],
  },
  {
    id: "kcl", mark: "KCL", title: "BSc Chemistry with Biomedicine",
    institution: "King’s College London", period: "Sep 2021 — May 2025",
    result: "First-Class Honours",
    modules: ["Computational Chemistry", "Molecular Biology", "Chemical Biology", "Organic Chemistry"],
    description: "A chemistry degree with biomedicine and a professional placement in Pfizer Analytical R&D. Scientific-computing coursework grew into experiments in sampling, molecular dynamics, polymer models and quantum chemistry.",
    achievements: ["Professional placement at Pfizer, followed by part-time GROWMAT product ownership.", "King’s Research Experience Award and the Associate of King’s College London programme.", "Undergraduate research in rotational spectroscopy, followed by a protein–membrane research project."],
    sourceIds: ["cv", "archive:coding-series", "isms-2025", "growmat-showcase"],
  },
];

export const profileSkillGroups = [
  { id: "applied-ai", title: "Applied AI & Recruitment Systems", summary: "Application evidence, specialist evaluation and human decisions connected in one product." },
  { id: "engineering", title: "Software & Product Engineering", summary: "Interfaces, services and data models shaped around an inspectable workflow." },
  { id: "evaluation", title: "Search, Data & Evaluation", summary: "Baselines, provenance and failure analysis that explain what a model can support." },
  { id: "infrastructure", title: "Infrastructure & Delivery", summary: "Connected services, repeatable environments and explicit recovery limits." },
  { id: "scientific", title: "Scientific & Quantitative Computing", summary: "Computational models grounded in chemistry, experiment design and numerical checks." },
  { id: "product", title: "Product, Leadership & Adoption", summary: "Discovery, product ownership and teaching that help people use technical work." },
];

/** Curated evidence links, not keyword-based endorsements. New records can reuse
 * these IDs or add capabilities with explicit project, role and source references. */
export const profileSkills: ProfileSkill[] = [
  {
    id: "ai-orchestration", group: "applied-ai", title: "Multi-agent application review",
    description: "COVERD reviews applications across specialist dimensions and retains supporting evidence for recruiter inspection.",
    projectSlugs: ["coverd-ai"], originIds: ["coverd"], conceptIds: ["language-applications", "human-review"], sourceIds: ["cv", "archive:coverd-ai"],
  },
  {
    id: "voice-interviews", group: "applied-ai", title: "Voice interviews & evidence gathering",
    description: "Three voice-interview architectures were tested across 20 candidate interviews by April 2026; the current product uses optional interviews to fill application evidence gaps.",
    projectSlugs: ["coverd-yasa", "coverd-ai"], originIds: ["coverd"], conceptIds: ["language-applications"], sourceIds: ["cv", "archive:coverd-yasa"],
  },
  {
    id: "human-oversight", group: "applied-ai", title: "Human review & responsible AI",
    description: "Recruiters retain the final COVERD decision. Research and public decision experiments also examine uncertainty, oversight and when a model should defer.",
    projectSlugs: ["coverd-ai", "safe-learning-to-defer", "safety-critical-ai"], originIds: ["coverd", "marsh", "imperial"], conceptIds: ["human-review", "governance"], sourceIds: ["cv", "archive:safe-learning-to-defer", "archive:safety-critical-ai"],
  },
  {
    id: "full-stack", group: "engineering", title: "TypeScript, React & product interfaces",
    description: "GROWMAT connects a Next.js editing interface with workload calculations and governed data; independent applications explore local, inspectable state.",
    projectSlugs: ["growmat", "ocean-depths-finance"], originIds: ["pfizer", "pfizer-placement", "personal-projects"], conceptIds: ["products", "local-first"], sourceIds: ["growmat-showcase", "archive:ocean-depths-finance"],
  },
  {
    id: "python-services", group: "engineering", title: "Python services & APIs",
    description: "Python powers applied-AI services and VideoMate’s native video inspection and migration workflow. The public insurance project documents a FastAPI-based prototype.",
    projectSlugs: ["insurance-lead-matching", "videomate"], originIds: ["marsh", "personal-projects"], conceptIds: ["language-applications", "products"], sourceIds: ["cv", "archive:insurance-lead-matching", "archive:videomate"],
  },
  {
    id: "data-modelling", group: "engineering", title: "SQL, PostgreSQL & data modelling",
    description: "The GROWMAT showcase documents ten source datasets feeding eleven governed tables, scheduled calculations and capacity views.",
    projectSlugs: ["growmat", "home-automation-stack"], originIds: ["pfizer", "pfizer-placement"], conceptIds: ["scheduling", "infrastructure"], sourceIds: ["cv", "growmat-showcase"],
  },
  {
    id: "retrieval-ranking", group: "evaluation", title: "Retrieval, document intelligence & ranking",
    description: "The public insurance project explains temporal market ranking, historical placement context and wording analysis with clause citations. Its interactive examples use fictional inputs.",
    projectSlugs: ["insurance-lead-matching", "coverd-ai"], originIds: ["marsh", "coverd"], conceptIds: ["language-applications", "evaluation"], sourceIds: ["cv", "archive:insurance-lead-matching"],
  },
  {
    id: "validation", group: "evaluation", title: "Time-aware validation & error analysis",
    description: "Insurance ranking uses information available at the decision time. The scientific archive inspects calibration, uncertainty rankings and reconstruction errors.",
    projectSlugs: ["insurance-lead-matching", "trustworthy-mri-reconstruction", "regularisation-lab"], originIds: ["marsh", "imperial"], conceptIds: ["evaluation", "uncertainty", "regularisation"], sourceIds: ["archive:insurance-lead-matching", "archive:trustworthy-mri-reconstruction", "archive:regularisation-lab"],
  },
  {
    id: "causal-evaluation", group: "evaluation", title: "Causal & off-policy evaluation",
    description: "The off-policy laboratory compares causal assumptions, propensity weighting and evaluation methods through reproducible experiments.",
    projectSlugs: ["causal-ope-lab"], originIds: ["imperial"], conceptIds: ["causal-inference", "evaluation"], sourceIds: ["archive:causal-ope-lab"],
  },
  {
    id: "containers", group: "infrastructure", title: "Docker, Linux & Proxmox",
    description: "The private home lab connects local AI, storage and automation; its public audit follows six declared Docker services and their dependencies.",
    projectSlugs: ["home-automation-stack", "growmat"], originIds: ["personal-projects", "pfizer"], conceptIds: ["recovery", "infrastructure"], sourceIds: ["cv", "archive:home-automation-stack", "growmat-showcase"],
  },
  {
    id: "recovery", group: "infrastructure", title: "Backups, reliability & recovery",
    description: "GROWMAT documents scheduled backups and retention. The home-lab audit exposes restore-testing and recovery-evidence gaps rather than treating a backup schedule as proof of recovery.",
    projectSlugs: ["growmat", "home-automation-stack"], originIds: ["pfizer", "personal-projects"], conceptIds: ["recovery", "evaluation"], sourceIds: ["growmat-showcase", "archive:home-automation-stack"],
  },
  {
    id: "accelerators", group: "infrastructure", title: "Accelerator & scientific environments",
    description: "The environment planner checks accelerator compatibility. GROMACS work covers GPU-capable container setup and topology preprocessing, with its scope recorded separately from earlier research.",
    projectSlugs: ["deep-learning-environment-resolver", "gromacs-hpc"], originIds: ["personal-projects"], conceptIds: ["recovery", "quantum"], sourceIds: ["archive:deep-learning-environment-resolver", "archive:gromacs-hpc"],
  },
  {
    id: "scientific-programming", group: "scientific", title: "Julia, MATLAB & scientific Python",
    description: "The archive includes a Julia stochastic stock-market simulator, a MATLAB spectroscopy plotting utility and computational-chemistry notebooks and extensions.",
    projectSlugs: ["stock-market-engine", "cprot-spectroscopy-plotter", "coding-series"], originIds: ["personal-projects", "kcl-research-2022", "kcl"], conceptIds: ["spectroscopy", "quantum", "data-science"], sourceIds: ["cv", "archive:stock-market-engine", "archive:cprot-spectroscopy-plotter", "archive:coding-series"],
  },
  {
    id: "scientific-ml", group: "scientific", title: "Scientific machine learning",
    description: "MSc projects explore microrobot perception, MRI reconstruction and neural fluid-flow surrogates, with public explanations of model architecture and evaluation limits.",
    projectSlugs: ["microrobot-vision", "trustworthy-mri-reconstruction", "neural-cfd-surrogates"], originIds: ["imperial"], conceptIds: ["robotics", "inverse-problems", "fourier-operators", "graph-networks"], sourceIds: ["archive:microrobot-vision", "archive:trustworthy-mri-reconstruction", "archive:neural-cfd-surrogates"],
  },
  {
    id: "molecular-research", group: "scientific", title: "Spectroscopy & molecular simulation",
    description: "Undergraduate research included rotational-spectroscopy analysis and protein–membrane interactions in silico. The 2025 ISMS record names Samuel as a co-author on the molecular-recognition work.",
    projectSlugs: ["molecular-recognition", "coding-series"], originIds: ["kcl-research-2022", "kcl-research-2023", "kcl"], conceptIds: ["spectroscopy", "quantum"], sourceIds: ["cv", "isms-2025", "archive:coding-series"],
  },
  {
    id: "product-discovery", group: "product", title: "Customer discovery & product ownership",
    description: "COVERD discovery involved four design partners and a product pivot. GROWMAT work combined roadmap ownership, stakeholder adoption and delivery in regulated R&D.",
    projectSlugs: ["coverd-ai", "growmat"], relatedProjectSlugs: ["ai-venture-reasoning"], originIds: ["coverd", "pfizer", "pfizer-placement"], conceptIds: ["innovation", "governance"], sourceIds: ["cv", "growmat-showcase", "archive:coverd-ai"],
  },
  {
    id: "teaching", group: "product", title: "Teaching, curriculum design & mentoring",
    description: "Designed and delivered 20+ programming, data-analysis and introductory ML sessions for 80+ chemistry students, and organised a careers panel for 100+ students. The linked chemistry archive supplies related subject context.",
    projectSlugs: [], relatedProjectSlugs: ["coding-series"], originIds: ["kcl-teaching"], conceptIds: ["learning-tools"], sourceIds: ["cv"],
  },
  {
    id: "operational-decisions", group: "product", title: "Decision support under pressure",
    description: "National service combined public-data workflow automation during COVID-19 with time-critical support for senior leaders. Operational and personnel details remain protected.",
    projectSlugs: ["covid-decision-support"], originIds: ["scdf"], conceptIds: ["scheduling", "human-systems"], sourceIds: ["cv", "archive:covid-decision-support"],
  },
];

export const profileAwards = [
  { title: "RUN/HACK 2026 — Second place", sourceIds: ["run-hack"] },
  { title: "King’s Research Experience Award", sourceIds: ["cv"] },
  { title: "Associate of King’s College London (AKC)", sourceIds: ["cv"] },
  { title: "SCDF Service Excellence Award", sourceIds: ["cv"] },
  { title: "SCDF 1st Division HQ Wall of Fame", sourceIds: ["cv"] },
  { title: "EARCOS Global Citizenship Award", sourceIds: ["cv"] },
];

export const profileLanguages = [
  { title: "English", level: "Native / bilingual" },
  { title: "Mandarin", level: "Native / bilingual" },
  { title: "Italian", level: "Elementary", projectSlug: "parliamo-italian-learning" },
];
