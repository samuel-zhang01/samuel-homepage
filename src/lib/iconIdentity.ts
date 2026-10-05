import type { AppId } from "@/components/SystemSevenDesktop";
import type { System7IconKind } from "@/lib/system7Icons";

// One identity per application, independent of the surface or rendered size.
export const applicationIconKinds = {
  about: "profile", coverd: "coverd", experience: "briefcase", projects: "folder",
  project: "document", projectActivity: "document", sidequest: "runner",
  skills: "controls", education: "university", documents: "pdf", games: "game",
  desk: "accessories", settings: "controls", notepad: "note", sketch: "sketch",
  tasks: "tasks", focus: "clock", calendar: "calendar", calculator: "calculator",
  converter: "converter", palette: "palette", orbitals: "orbital", contact: "mail",
  lab: "network", scrapbook: "photos", secret: "secret",
} as const satisfies Record<AppId, System7IconKind>;

// Explicit catalogue entries keep new projects from silently acquiring a folder
// or an unrelated scientific icon through a slug/discipline heuristic.
export const projectIconKinds = {
  videomate: "videomate",
  "orbital-lab": applicationIconKinds.orbitals,
  "desk-note-pad": applicationIconKinds.notepad,
  "desk-sketch-pad": applicationIconKinds.sketch,
  "desk-quick-list": applicationIconKinds.tasks,
  "desk-focus-clock": applicationIconKinds.focus,
  "desk-pocket-calendar": applicationIconKinds.calendar,
  "desk-calculator": applicationIconKinds.calculator,
  "desk-unit-converter": applicationIconKinds.converter,
  "desk-colour-studio": applicationIconKinds.palette,
  "coverd-ai": applicationIconKinds.coverd,
  growmat: "chart",
  "insurance-lead-matching": "shield",
  "cv-keyword-automator": "document",
  "ocean-depths-finance": "finance",
  "coverd-yasa": "calendar",
  "parliamo-italian-learning": "book",
  "course-recommender-audit": "book",
  "study-rl": "book",
  "sequential-decisions-lab": "chart",
  "microrobot-vision": "microscope",
  "trustworthy-mri-reconstruction": "mri",
  "neural-cfd-surrogates": "flow",
  "air-quality-sensor-optimisation": "chart",
  "cost-sensitive-cyber-detection": "shield",
  "regularisation-lab": "chart",
  "safety-critical-ai": "shield",
  "safe-learning-to-defer": "shield",
  "causal-ope-lab": "chart",
  "innovation-models-reflection": "briefcase",
  "ai-venture-reasoning": "finance",
  "pc-saft-thermodynamics": "molecule",
  "drug-solubility": "molecule",
  "molecular-recognition": "molecule",
  "cprot-spectroscopy-plotter": "spectrum",
  "deep-learning-environment-resolver": "computer",
  "gromacs-hpc": "computer",
  "home-automation-stack": applicationIconKinds.lab,
  "stock-market-engine": "finance",
  "covid-decision-support": "shield",
  "coding-series": "molecule",
} as const satisfies Record<string, System7IconKind>;

export const serviceIconKinds = {
  PX: "network", AI: "computer", DEV: "document", KVM: "computer",
  NPM: "network", WG: "shield", DNS: "shield", F2B: "shield", RDP: "computer",
  CT: "controls", CI: "tasks", HP: "folder", JOB: "calendar", SQL: "network",
  CO2: "chart", HA: "network", RAID: "network", NAS: "folder", NC: "folder",
  JF: "photos", KX: "book", ERP: "briefcase", ODO: "controls",
} as const satisfies Record<string, System7IconKind>;

export const arcadeIconKinds = {
  minefield: "minefield", snake: "snake", brickbreaker: "brickbreaker",
  puzzle: "puzzle", samword: "word", memory: "cards", spectrum: "spectrum",
} as const satisfies Record<string, System7IconKind>;

export const contactIconKinds = {
  call: projectIconKinds["coverd-yasa"], email: applicationIconKinds.contact,
  linkedin: "briefcase", github: "computer", coverd: applicationIconKinds.coverd,
} as const satisfies Record<string, System7IconKind>;

export function getApplicationIcon(id: AppId): System7IconKind {
  if (!Object.hasOwn(applicationIconKinds, id)) throw new Error(`Application icon is not registered: ${id}`);
  return applicationIconKinds[id];
}

export function getProjectIcon(slug: string): System7IconKind {
  if (!Object.hasOwn(projectIconKinds, slug)) throw new Error(`Project icon is not registered: ${slug}`);
  return projectIconKinds[slug as keyof typeof projectIconKinds];
}
