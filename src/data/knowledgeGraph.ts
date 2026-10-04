import type { Project, ProjectArea } from "./projects";
import type { ProjectOrigin } from "./projectOrigins";

export type KnowledgeKind = "topic" | "method" | "project" | "experience" | "education" | "skill" | "document";
export type KnowledgeSource = { id: string; title: string; href: string };
export type KnowledgeNode = {
  id: string; kind: KnowledgeKind; label: string; shortLabel: string;
  description: string; colour: string; topic: string;
  slug?: string; section?: "experience" | "education" | "skills" | "documents";
  anchor?: string; period?: string; artifactHref?: string; projectSlug?: string;
  /** Source records are public citations, never private file paths. */
  sources?: KnowledgeSource[];
};
export type KnowledgeEdge = {
  id: string; source: string; target: string;
  relation: "explores" | "uses" | "part-of" | "developed-in" | "related-context"
    | "evidenced-by" | "practised-in" | "concerns" | "documents" | "supports-record" | "covers";
  explanation: string;
  sourceIds?: string[];
};
export type KnowledgeGraphData = { version: 2; nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };
/** Structural inputs keep the builder independent of rendering and localisation.
 * Stable IDs and explicit references are the extension API for future agents. */
export type KnowledgeSkillRecord = {
  id: string; title: string; description: string;
  projectSlugs: readonly string[]; originIds: readonly string[];
  relatedProjectSlugs?: readonly string[];
  conceptIds: readonly string[]; sourceIds: readonly string[];
};
export type KnowledgeDocumentRecord = {
  id: string; title: string; description: string; src: string;
  projectSlug?: string; originIds?: readonly string[]; sourceIds: readonly string[];
};
export type KnowledgeProfileRecord = {
  id: string; label: string; description: string; section: "experience" | "education";
  period?: string; sourceIds: readonly string[]; conceptIds?: readonly string[];
};
export type KnowledgeProfileData = {
  skills?: readonly KnowledgeSkillRecord[];
  documents?: readonly KnowledgeDocumentRecord[];
  records?: readonly KnowledgeProfileRecord[];
  sources?: readonly KnowledgeSource[];
};
type Topic = { id: string; label: string; shortLabel: string; description: string; colour: string };
type Method = { id: string; label: string; topic: string; description: string };

export const knowledgeTopics: Topic[] = [
  { id: "reinforcement-learning", label: "Reinforcement learning", shortLabel: "Reinforcement learning", colour: "#126887", description: "Projects on agents that learn from feedback, including bandits, value updates, policy evaluation and language-model post-training." },
  { id: "scientific-ml", label: "Scientific machine learning", shortLabel: "Scientific ML", colour: "#67418c", description: "My work here uses machine learning with flow fields, medical images and microrobot microscopy. I show the models and how I assessed them." },
  { id: "chemistry", label: "Chemistry & molecular science", shortLabel: "Chemistry", colour: "#88590b", description: "I have worked with rotational spectra, fluid equations and orbital calculations. The projects show the measurements and assumptions behind each result." },
  { id: "decisions", label: "Decision systems", shortLabel: "Decision systems", colour: "#27694d", description: "These projects look at insurance lead allocation, human review and causal analysis, with the evidence for each choice kept visible." },
  { id: "products", label: "Products & tools", shortLabel: "Products & tools", colour: "#963758", description: "Apps for planning, learning and everyday tasks. Each project explains the data and rules behind the screen." },
  { id: "infrastructure", label: "Computing & infrastructure", shortLabel: "Computing & systems", colour: "#3e5482", description: "GPU setups, containers, local storage and backups that keep the work running." },
  { id: "data-science", label: "Data & model evaluation", shortLabel: "Data & evaluation", colour: "#76630b", description: "These projects check model results against data splits, leakage, calibration, regularisation and error measures." },
  { id: "human-systems", label: "People, organisations & AI", shortLabel: "People & organisations", colour: "#9b4824", description: "Projects about the people and organisations using technical systems: research ethics, capacity planning, product ownership and human review." },
];

export const knowledgeMethods: Method[] = [
  { id: "value-and-policy", label: "Values & policies", topic: "reinforcement-learning", description: "Estimate future return, choose actions and inspect the update rule that changes an agent’s behaviour." },
  { id: "bandits", label: "Exploration & bandits", topic: "reinforcement-learning", description: "Allocate repeated decisions between gathering information and using the evidence already available." },
  { id: "language-models", label: "Language-model training", topic: "reinforcement-learning", description: "Inspect supervised adaptation, low-rank updates, preference objectives and the answers generated by a trained model." },
  { id: "language-applications", label: "Language-model applications", topic: "decisions", description: "Use language models to interpret text, gather evidence and support a person’s decision." },
  { id: "language-processing", label: "Text processing & matching", topic: "products", description: "Extract terms, compare documents and connect relevant language with explicit rules." },
  { id: "fourier-operators", label: "Fourier operators", topic: "scientific-ml", description: "Transform a field into frequency components, learn spectral interactions and reconstruct a prediction in physical space." },
  { id: "graph-networks", label: "Graph message passing", topic: "scientific-ml", description: "Compute local messages between connected nodes and aggregate them to update a field on a mesh." },
  { id: "inverse-problems", label: "Imaging & inverse problems", topic: "scientific-ml", description: "Recover an image or latent physical property from indirect, incomplete or noisy measurements." },
  { id: "robotics", label: "Robotics & perception", topic: "scientific-ml", description: "Connect sensed observations, geometric state and a physical system’s motion." },
  { id: "uncertainty", label: "Uncertainty & calibration", topic: "data-science", description: "Compare confidence with observed outcomes and study how uncertainty changes a decision." },
  { id: "evaluation", label: "Splits, metrics & leakage", topic: "data-science", description: "Track which observations trained a model, which evaluated it and what each metric actually measures." },
  { id: "regularisation", label: "Regularisation & optimisation", topic: "data-science", description: "Control a model’s fit through penalties, optimisation choices and the trade-off between training error and generalisation." },
  { id: "causal-inference", label: "Causal & counterfactual reasoning", topic: "decisions", description: "Separate associations from effects and evaluate alternative decisions using explicitly stated assumptions." },
  { id: "human-review", label: "Human review & deferral", topic: "decisions", description: "Route evidence to a person, retain the basis of a recommendation and decide when a model should defer." },
  { id: "spectroscopy", label: "Spectroscopy", topic: "chemistry", description: "Connect measured frequencies and intensities to molecular structure through prediction, matching and visual analysis." },
  { id: "thermodynamics", label: "Thermodynamics", topic: "chemistry", description: "Calculate bulk properties and phase equilibria from molecular models and measured material properties." },
  { id: "quantum", label: "Quantum & molecular simulation", topic: "chemistry", description: "Explore wavefunctions, molecular motion and numerical experiments that connect microscopic structure to observable behaviour." },
  { id: "local-first", label: "Local data & persistence", topic: "products", description: "Keep a useful record across interactions, reconcile overlapping inputs and make the resulting state inspectable." },
  { id: "scheduling", label: "Scheduling & allocation", topic: "products", description: "Allocate people, time or capacity under explicit constraints, then examine conflicts and overrides." },
  { id: "learning-tools", label: "Learning tools", topic: "products", description: "Turn a curriculum or technical idea into something a learner can practise, inspect and revisit." },
  { id: "recovery", label: "Infrastructure & recovery", topic: "infrastructure", description: "Trace service dependencies, accelerator environments, backups and recovery steps through concrete failure cases." },
  { id: "innovation", label: "Innovation & venture design", topic: "human-systems", description: "Connect a proposed product to its evidence, organisational setting, adoption path and resource needs." },
  { id: "governance", label: "Ethics & governance", topic: "human-systems", description: "Examine affected people, responsibilities, uncertainty and oversight when a technical system is introduced." },
];

/** Concepts are curated relationships. Shared access labels and project status
 * have no bearing on semantic links. A new project can declare its concepts in
 * projects.ts; an area fallback keeps an unfinished record discoverable.
 */
export const projectConcepts: Record<string, string[]> = {
  "orbital-lab": ["chemistry", "quantum", "learning-tools"],
  "desk-note-pad": ["products", "local-first"], "desk-sketch-pad": ["products", "local-first"],
  "desk-quick-list": ["products", "local-first"], "desk-focus-clock": ["products", "local-first"],
  "desk-pocket-calendar": ["products", "scheduling", "local-first"], "desk-calculator": ["products", "learning-tools"],
  "desk-unit-converter": ["products", "learning-tools"], "desk-colour-studio": ["products", "learning-tools"],
  "coverd-ai": ["human-systems", "products", "human-review", "language-applications", "governance"],
  "growmat": ["products", "human-systems", "scheduling"],
  "insurance-lead-matching": ["decisions", "human-review", "evaluation", "language-applications"],
  "cv-keyword-automator": ["products", "human-review", "language-processing"],
  "ocean-depths-finance": ["products", "local-first", "evaluation"],
  "coverd-yasa": ["products", "scheduling", "recovery"],
  "parliamo-italian-learning": ["products", "learning-tools", "local-first"],
  "course-recommender-audit": ["data-science", "learning-tools", "evaluation"],
  "study-rl": ["reinforcement-learning", "value-and-policy", "bandits", "language-models"],
  "sequential-decisions-lab": ["reinforcement-learning", "bandits", "evaluation"],
  "microrobot-vision": ["scientific-ml", "robotics", "inverse-problems", "evaluation"],
  "trustworthy-mri-reconstruction": ["scientific-ml", "inverse-problems", "uncertainty", "evaluation"],
  "neural-cfd-surrogates": ["scientific-ml", "fourier-operators", "graph-networks", "evaluation"],
  "air-quality-sensor-optimisation": ["data-science", "evaluation", "regularisation"],
  "cost-sensitive-cyber-detection": ["data-science", "evaluation", "human-review"],
  "regularisation-lab": ["data-science", "regularisation"],
  "safety-critical-ai": ["data-science", "uncertainty", "evaluation"],
  "safe-learning-to-defer": ["decisions", "human-review", "uncertainty"],
  "causal-ope-lab": ["decisions", "causal-inference", "bandits"],
  "innovation-models-reflection": ["human-systems", "innovation"],
  "ai-venture-reasoning": ["human-systems", "innovation", "evaluation"],
  "pc-saft-thermodynamics": ["chemistry", "thermodynamics"],
  "drug-solubility": ["chemistry", "thermodynamics"],
  "molecular-recognition": ["chemistry", "spectroscopy"],
  "cprot-spectroscopy-plotter": ["chemistry", "spectroscopy", "products"],
  "deep-learning-environment-resolver": ["infrastructure", "recovery"],
  "gromacs-hpc": ["infrastructure", "quantum", "recovery"],
  "home-automation-stack": ["infrastructure", "recovery", "local-first"],
  "stock-market-engine": ["data-science", "evaluation"],
  "covid-decision-support": ["decisions", "human-systems", "human-review"],
  "coding-series": ["chemistry", "quantum", "regularisation"],
};

const areaFallback: Record<ProjectArea, string> = { Products: "products", "Applied AI": "decisions", "Machine Learning": "data-science", Research: "scientific-ml", Systems: "infrastructure", Education: "products" };

export function buildKnowledgeGraph(catalogue: Project[], origins: ProjectOrigin[], profile: KnowledgeProfileData = {}): KnowledgeGraphData {
  const nodes: KnowledgeNode[] = knowledgeTopics.map((topic) => ({ ...topic, id: `topic:${topic.id}`, kind: "topic", topic: topic.id }));
  const edges: KnowledgeEdge[] = [];
  const edgeIds = new Set<string>();
  const nodeIds = new Set(nodes.map((node) => node.id));
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const topicMap = new Map(knowledgeTopics.map((topic) => [topic.id, topic]));
  const methodMap = new Map(knowledgeMethods.map((method) => [method.id, method]));
  const sourceMap = new Map((profile.sources ?? []).map((source) => [source.id, source]));
  if (sourceMap.size !== (profile.sources ?? []).length) throw new Error("Duplicate knowledge source ID");
  const sourceRecords = (ids: readonly string[]) => [...new Set(ids)].map((id) => {
    const source = sourceMap.get(id);
    if (!source) throw new Error(`Unknown knowledge source ${id}`);
    if (!/^(?:https:\/\/|\/(?!\/))/.test(source.href)) throw new Error(`Invalid public knowledge source URL: ${id}`);
    return { id: source.id, title: source.title, href: source.href };
  });
  const addNode = (node: KnowledgeNode) => {
    if (nodeIds.has(node.id)) throw new Error(`Duplicate knowledge node ${node.id}`);
    nodeIds.add(node.id); nodeMap.set(node.id, node); nodes.push(node);
  };
  const addEdge = (source: string, target: string, relation: KnowledgeEdge["relation"], explanation: string, sourceIds?: readonly string[]) => {
    if (!nodeIds.has(source) || !nodeIds.has(target)) throw new Error(`Unknown knowledge reference ${source} → ${target}`);
    const id = `${source}~${relation}~${target}`;
    if (!edgeIds.has(id)) {
      edgeIds.add(id);
      edges.push({ id, source, target, relation, explanation, ...(sourceIds?.length ? { sourceIds: sourceRecords(sourceIds).map((record) => record.id) } : {}) });
    }
  };
  const conceptTopic = (concept: string) => {
    if (topicMap.has(concept)) return concept;
    const method = methodMap.get(concept);
    if (!method) throw new Error(`Unknown knowledge concept ${concept}`);
    return method.topic;
  };
  const linkConcepts = (id: string, concepts: readonly string[], explanation: string, sourceIds?: readonly string[]) => {
    for (const concept of concepts) {
      const topic = conceptTopic(concept);
      addEdge(id, `topic:${topic}`, "concerns", explanation, sourceIds);
      if (methodMap.has(concept)) addEdge(id, `method:${concept}`, "concerns", explanation, sourceIds);
    }
  };
  for (const method of knowledgeMethods) {
    addNode({ ...method, id: `method:${method.id}`, kind: "method", shortLabel: method.label, colour: topicMap.get(method.topic)!.colour });
    addEdge(`method:${method.id}`, `topic:${method.topic}`, "part-of", method.description);
  }
  const projectMap = new Map<string, KnowledgeNode>();
  const conceptsByProject = new Map<string, readonly string[]>();
  for (const project of catalogue) {
    const declared = project.concepts ?? projectConcepts[project.slug] ?? [];
    const concepts = declared.length ? declared : [areaFallback[project.area]];
    const topic = conceptTopic(concepts[0]);
    const id = `project:${project.slug}`;
    const node: KnowledgeNode = { id, kind: "project", label: project.title, shortLabel: project.shortTitle ?? project.title, description: project.summary, slug: project.slug, period: project.year, topic, colour: topicMap.get(topic)!.colour };
    addNode(node); projectMap.set(project.slug, node); conceptsByProject.set(project.slug, concepts);
    for (const concept of concepts) {
      if (topicMap.has(concept)) addEdge(id, `topic:${concept}`, "explores", project.summary);
      else if (methodMap.has(concept)) {
        const method = methodMap.get(concept)!;
        addEdge(id, `method:${concept}`, "uses", method.description);
        addEdge(id, `topic:${method.topic}`, "explores", project.summary);
      } else throw new Error(`Unknown knowledge concept ${concept} on ${project.slug}`);
    }
  }
  const profileRecords = new Map((profile.records ?? []).map((record) => [record.id, record]));
  if (profileRecords.size !== (profile.records ?? []).length) throw new Error("Duplicate knowledge profile record ID");
  const originMap = new Map(origins.map((origin) => [origin.id, origin]));
  if (originMap.size !== origins.length) throw new Error("Duplicate knowledge origin ID");
  for (const origin of origins) for (const slug of origin.relatedProjects ?? []) {
    if (!origin.projects.includes(slug)) throw new Error(`Related knowledge project ${slug} missing from ${origin.id}`);
  }
  const recordsBySource = new Map<string, Set<string>>();
  const skillsBySource = new Map<string, Set<KnowledgeSkillRecord>>();
  const indexSource = <T,>(index: Map<string, Set<T>>, sourceIds: readonly string[], record: T) => {
    for (const sourceId of sourceIds) {
      const entries = index.get(sourceId) ?? new Set<T>();
      entries.add(record); index.set(sourceId, entries);
    }
  };
  // Retain existing experience: IDs, including education, so shared links survive.
  for (const recordId of new Set([...originMap.keys(), ...profileRecords.keys()])) {
    const origin = originMap.get(recordId), record = profileRecords.get(recordId);
    if (origin && record && origin.section !== record.section) throw new Error(`Conflicting knowledge section ${recordId}`);
    const section = record?.section ?? origin!.section;
    const label = record?.label ?? origin!.label;
    const description = record?.description ?? origin!.context;
    const sourceIds = record?.sourceIds ?? [];
    indexSource(recordsBySource, sourceIds, recordId);
    const firstProject = origin?.projects.map((slug) => projectMap.get(slug)).find(Boolean);
    const concepts = record?.conceptIds ?? [];
    const topic = concepts.length ? conceptTopic(concepts[0]) : firstProject?.topic ?? "human-systems";
    const id = `experience:${recordId}`;
    addNode({ id, kind: section, label, shortLabel: label.split(" · ")[0], description, section, anchor: recordId, period: record?.period ?? origin?.period, topic, colour: "#303030", sources: sourceRecords(sourceIds) });
    if (origin) for (const slug of origin.projects) {
      const project = projectMap.get(slug);
      if (!project) throw new Error(`Unknown knowledge project ${slug} on ${origin.id}`);
      const related = !!origin.relatedProjects?.includes(slug);
      addEdge(project.id, id, related ? "related-context" : "developed-in", origin.context, sourceIds);
      // Only direct provenance supports subjects practised during a record.
      if (!related) for (const concept of conceptsByProject.get(slug) ?? []) {
        addEdge(id, `topic:${conceptTopic(concept)}`, "covers", origin.context, sourceIds);
      }
    }
    linkConcepts(id, concepts, description, sourceIds);
  }
  for (const skill of profile.skills ?? []) {
    indexSource(skillsBySource, skill.sourceIds, skill);
    if (!skill.projectSlugs.length && !skill.originIds.length && !skill.sourceIds.length) throw new Error(`Knowledge skill lacks evidence: ${skill.id}`);
    const directProjectSlugs = new Set(skill.projectSlugs);
    const linkedProjects = skill.projectSlugs.map((slug) => {
      const node = projectMap.get(slug);
      if (!node) throw new Error(`Unknown knowledge project ${slug} on skill ${skill.id}`);
      return node;
    });
    const relatedProjects = (skill.relatedProjectSlugs ?? []).map((slug) => {
      if (directProjectSlugs.has(slug)) throw new Error(`Conflicting skill project evidence ${skill.id}: ${slug}`);
      const node = projectMap.get(slug);
      if (!node) throw new Error(`Unknown knowledge project ${slug} on skill ${skill.id}`);
      return node;
    });
    const topic = skill.conceptIds.length ? conceptTopic(skill.conceptIds[0]) : linkedProjects[0]?.topic ?? "human-systems";
    const id = `skill:${skill.id}`;
    addNode({ id, kind: "skill", label: skill.title, shortLabel: skill.title, description: skill.description, section: "skills", anchor: skill.id, topic, colour: topicMap.get(topic)!.colour, sources: sourceRecords(skill.sourceIds) });
    for (const project of linkedProjects) addEdge(id, project.id, "evidenced-by", skill.description, skill.sourceIds);
    for (const project of relatedProjects) addEdge(id, project.id, "related-context", skill.description, skill.sourceIds);
    for (const originId of skill.originIds) addEdge(id, `experience:${originId}`, "practised-in", skill.description, skill.sourceIds);
    linkConcepts(id, skill.conceptIds, skill.description, skill.sourceIds);
  }
  // A source identifies the PDF itself only when its public URL does. A shared
  // case-study citation can describe several attachments and is not sufficient.
  const sourceIdentity = (href: string) => {
    const url = new URL(href, "https://portfolio.invalid");
    url.hash = "";
    if (href.startsWith("/")) url.searchParams.delete("v"); // Known local PDF cache revision.
    return url.href;
  };
  const sourceIdentities = new Map([...sourceMap].map(([id, source]) => [id, sourceIdentity(source.href)]));
  for (const document of profile.documents ?? []) {
    const project = document.projectSlug ? projectMap.get(document.projectSlug) : undefined;
    if (document.projectSlug && !project) throw new Error(`Unknown knowledge project ${document.projectSlug} on document ${document.id}`);
    if (!/\.pdf(?:[?#]|$)/i.test(document.src) || !/^(?:https:\/\/|\/(?!\/))/.test(document.src)) throw new Error(`Invalid public knowledge document URL: ${document.id}`);
    const firstOrigin = document.originIds?.map((originId) => nodeMap.get(`experience:${originId}`)).find(Boolean);
    const topic = project?.topic ?? firstOrigin?.topic ?? "human-systems";
    const id = `document:${document.id}`;
    addNode({ id, kind: "document", label: document.title, shortLabel: document.title, description: document.description, section: "documents", anchor: document.id, topic, colour: topicMap.get(topic)!.colour, artifactHref: document.src, projectSlug: document.projectSlug, sources: sourceRecords(document.sourceIds) });
    if (project) addEdge(id, project.id, "documents", document.description, document.sourceIds);
    const documentIdentity = sourceIdentity(document.src);
    const identityIds = document.sourceIds.filter(sourceId => sourceIdentities.get(sourceId) === documentIdentity);
    const recordIds = new Set(document.originIds ?? []);
    for (const sourceId of identityIds) for (const recordId of recordsBySource.get(sourceId) ?? []) recordIds.add(recordId);
    for (const originId of recordIds) addEdge(id, `experience:${originId}`, "supports-record", document.description, document.sourceIds);
    const skillEvidence = new Map<KnowledgeSkillRecord, string[]>();
    for (const sourceId of identityIds) for (const skill of skillsBySource.get(sourceId) ?? []) {
      const evidenceIds = skillEvidence.get(skill) ?? [];
      evidenceIds.push(sourceId); skillEvidence.set(skill, evidenceIds);
    }
    for (const [skill, evidenceIds] of skillEvidence) addEdge(`skill:${skill.id}`, id, "evidenced-by", skill.description, evidenceIds);
  }
  return { version: 2, nodes, edges };
}

export type KnowledgeConnection = { edge: KnowledgeEdge; node: KnowledgeNode };

/** Read-only graph index. Build once per catalogue, then traverse a node's
 * connections in O(degree). Rendering remains capped independently of size. */
export class KnowledgeGraphIndex {
  readonly nodes: ReadonlyMap<string, KnowledgeNode>;
  private readonly connections = new Map<string, KnowledgeConnection[]>();

  constructor(graph: KnowledgeGraphData) {
    this.nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    for (const edge of graph.edges) {
      const source = this.nodes.get(edge.source), target = this.nodes.get(edge.target);
      if (!source || !target) throw new Error(`Broken graph connection: ${edge.id}`);
      for (const [id, node] of [[source.id, target], [target.id, source]] as const) {
        const entries = this.connections.get(id) ?? [];
        entries.push({ edge, node }); this.connections.set(id, entries);
      }
    }
  }

  neighbours(id: string): readonly KnowledgeConnection[] {
    return this.connections.get(id) ?? [];
  }
}

export function graphNeighbours(graph: KnowledgeGraphData, id: string) {
  return new KnowledgeGraphIndex(graph).neighbours(id);
}

export function graphNodeHref(node: KnowledgeNode, localeSlug: string) {
  return node.section && node.anchor
    ? `/${localeSlug}/${node.section}#${node.anchor}`
    : `/${localeSlug}/projects?view=map&node=${encodeURIComponent(node.id)}`;
}
