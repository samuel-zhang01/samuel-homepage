"use client";

import Image from "next/image";
import { System7Icon, type System7IconKind } from "./System7Icon";
import { projects } from "@/data/projects";
import { projectOrigins } from "@/data/projectOrigins";
import dynamic from "next/dynamic";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  localeCvAssets,
  localeOptions,
  localeSlug,
  normaliseLocale,
  type Locale,
} from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { desktopCopy } from "./desktopCopy";
import { projectMenuCopy } from "./projectMenuCopy";
import type { FinderApplication } from "./DesktopFinder";

const desktopText = { ...projectMenuCopy, ...desktopCopy };

function translateText(locale: Locale, source: string) {
  return projectText(locale, desktopText, source);
}

const SystemLocaleContext = createContext<Locale>("en-GB");
const ProjectOpenContext = createContext<((slug: string) => void) | null>(null);

function useSystemLocale() {
  return useContext(SystemLocaleContext);
}

function ClassicModuleLoading() {
  return <div className="classic-module-loading" aria-hidden="true"><span><i /></span></div>;
}

const PdfPreview = dynamic(() => import("@/components/PdfPreview"), {
  loading: ClassicModuleLoading,
});

const SnakeGame = dynamic(
  () => import("@/components/ArcadeClassicGames").then((module) => module.SnakeGame),
  { loading: ClassicModuleLoading },
);

const BrickBreakerGame = dynamic(
  () => import("@/components/ArcadeClassicGames").then((module) => module.BrickBreakerGame),
  { loading: ClassicModuleLoading },
);

const HplcPeakDock = dynamic(() => import("@/components/HplcPeakDock"), {
  loading: ClassicModuleLoading,
});

const ProductivityApps = dynamic(() => import("@/components/ProductivityApps"), {
  loading: ClassicModuleLoading,
});

const DesktopFinder = dynamic(() => import("./DesktopFinder"), { ssr: false });
const OrbitalLab = dynamic(() => import("./OrbitalLab"), { loading: ClassicModuleLoading });

const ProjectExplorer = dynamic(() => import("@/components/projects/ProjectExplorer"), {
  loading: function ProjectExplorerLoading() {
    const locale = useSystemLocale();
    return (
      <div className="projects-app classic-module-loading" role="status">
        <strong>{translateText(locale, "OPENING PROJECT ARCHIVE…")}</strong>
        <span aria-hidden="true"><i /></span>
      </div>
    );
  },
});

const ProjectDocument = dynamic(() => import("@/components/projects/ProjectDocument"), { loading: ClassicModuleLoading });

const SideQuestCabinetApp = dynamic(() => import("@/components/SideQuestCabinetApp"), {
  loading: function SideQuestLoading() {
    const locale = useSystemLocale();
    return (
      <div className="sidequest-app-loading" role="status">
        <span className="eyebrow">{translateText(locale, "OPENING FIELD OBJECT…")}</span>
        <strong>{translateText(locale, "Rewinding the RUN/HACK relay.")}</strong>
      </div>
    );
  },
});

export type AppId =
  | "about"
  | "coverd"
  | "experience"
  | "projects"
  | "project"
  | "sidequest"
  | "skills"
  | "education"
  | "documents"
  | "games"
  | "desk"
  | "notepad"
  | "sketch"
  | "tasks"
  | "focus"
  | "calendar"
  | "calculator"
  | "converter"
  | "palette"
  | "orbitals"
  | "contact"
  | "lab"
  | "scrapbook"
  | "secret";

type WindowState = {
  id: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  open: boolean;
  maximized: boolean;
};

type DesktopIcon = {
  id: AppId;
  label: string;
  icon: IconKind;
  description: string;
};

type IconKind = System7IconKind | "coverd";

type SystemMenuId = "apple" | "file" | "edit" | "view" | "special" | "language";
type DesktopPattern = "classic" | "blue" | "paper";
const PATTERN_STORAGE_KEY = "samuel-system7-pattern";

const SYSTEM_MENU_ELEMENT_IDS: Record<SystemMenuId, string> = {
  apple: "samuel-menu",
  file: "file-menu",
  edit: "edit-menu",
  view: "view-menu",
  special: "special-menu",
  language: "language-menu",
};

const TRANSLATED_ATTRIBUTES = ["aria-label", "title", "placeholder", "alt"] as const;

function localiseNode(node: ReactNode, locale: Locale): ReactNode {
  if (typeof node === "string") return translateText(locale, node);
  if (Array.isArray(node)) {
    // `Children.toArray` flattens nested JSX arrays and gives every element a
    // stable key before localisation clones it. This matters here because the
    // boundary sees both authored sibling lists and the output of mapped lists.
    return Children.toArray(node).map((child) => localiseNode(child, locale));
  }
  if (!isValidElement<Record<string, unknown>>(node)) return node;

  const translatedProps: Record<string, unknown> = {};
  for (const attribute of TRANSLATED_ATTRIBUTES) {
    const value = node.props[attribute];
    if (typeof value === "string") translatedProps[attribute] = translateText(locale, value);
  }
  if ("children" in node.props) {
    translatedProps.children = localiseNode(node.props.children as ReactNode, locale);
  }
  return cloneElement(node, translatedProps);
}

function TranslationBoundary({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <SystemLocaleContext.Provider value={locale}>
      {localiseNode(children, locale)}
    </SystemLocaleContext.Provider>
  );
}

function localiseGameMessage(locale: Locale, message: string): string {
  if (locale === "en-GB" || locale === "en-US") return translateText(locale, message);
  const lengthMatch = message.match(/^Please enter exactly (\d+) letters\.$/);
  if (lengthMatch) return locale === "zh-CN" ? `请输入恰好 ${lengthMatch[1]} 个字母。` : `請輸入恰好 ${lengthMatch[1]} 個字母。`;
  const attemptMatch = message.match(/^(\d+) attempts? remaining\.$/);
  if (attemptMatch) return locale === "zh-CN" ? `还剩 ${attemptMatch[1]} 次机会。` : `還剩 ${attemptMatch[1]} 次機會。`;
  const answerMatch = message.match(/^The answer was ([A-Z]+)\. (.+)$/);
  if (answerMatch) {
    const prefix = locale === "zh-CN" ? `答案是 ${answerMatch[1]}。` : `答案是 ${answerMatch[1]}。`;
    return `${prefix}${translateText(locale, answerMatch[2])}`;
  }
  return translateText(locale, message);
}

const BOOT_DURATION = 2800;
const BOOT_MESSAGES = [
  "Buying the last Apple computer on eBay…",
  "RAM prices too high — caching to paper instead…",
  "Asking Docker to please stay contained…",
  "Polishing one-bit icons by hand…",
  "Loading responsible AI responsibly…",
  "Finding Samuel somewhere between London and the home lab…",
  "Rewinding the startup chime…",
  "Almost ready. Pretending this took serious computing power…",
] as const;
const BOOT_PROGRESS = [8, 17, 29, 42, 56, 70, 85, 100] as const;

function isCompactCanvasViewport(): boolean {
  return window.innerWidth <= 720 || (window.innerHeight <= 520 && window.innerWidth <= 1000);
}

function fitWindowToViewport(item: WindowState, viewportWidth: number, viewportHeight: number): WindowState {
  const compactCanvas = viewportWidth <= 720 || (viewportHeight <= 520 && viewportWidth <= 1000);
  if (compactCanvas || item.maximized) return item;
  const minTop = window.matchMedia("(pointer: coarse)").matches ? 50 : 30;
  const maxWidth = Math.max(280, viewportWidth - 20);
  const maxHeight = Math.max(190, viewportHeight - minTop - 8);
  const width = Math.min(item.width, maxWidth);
  const height = Math.min(item.height, maxHeight);
  return {
    ...item,
    width,
    height,
    x: Math.min(Math.max(5, item.x), Math.max(5, viewportWidth - width - 5)),
    y: Math.min(Math.max(minTop, item.y), Math.max(minTop, viewportHeight - height - 7)),
  };
}

const INITIAL_WINDOWS: WindowState[] = [
  {
    id: "about",
    title: "About Samuel Zhang",
    x: 110,
    y: 60,
    width: 760,
    height: 650,
    z: 12,
    open: true,
    maximized: false,
  },
  {
    id: "coverd",
    title: "COVERD — Founder’s Desk",
    x: 112,
    y: 50,
    width: 850,
    height: 620,
    z: 11,
    open: false,
    maximized: false,
  },
  {
    id: "experience",
    title: "Career",
    x: 118,
    y: 62,
    width: 790,
    height: 590,
    z: 3,
    open: false,
    maximized: false,
  },
  {
    id: "projects",
    title: "Projects",
    x: 72,
    y: 48,
    width: 1160,
    height: 840,
    z: 4,
    open: false,
    maximized: false,
  },
  { id: "project", title: "Project", x: 102, y: 58, width: 1060, height: 720, z: 18, open: false, maximized: false },
  {
    id: "sidequest",
    title: "RUN/HACK — Field Journal",
    x: 54,
    y: 42,
    width: 1000,
    height: 690,
    z: 17,
    open: false,
    maximized: false,
  },
  {
    id: "skills",
    title: "Skills & Capabilities",
    x: 206,
    y: 92,
    width: 690,
    height: 520,
    z: 5,
    open: false,
    maximized: false,
  },
  {
    id: "education",
    title: "Education & Awards",
    x: 232,
    y: 84,
    width: 680,
    height: 532,
    z: 6,
    open: false,
    maximized: false,
  },
  {
    id: "documents",
    title: "Documents",
    x: 180,
    y: 48,
    width: 820,
    height: 630,
    z: 13,
    open: false,
    maximized: false,
  },
  {
    id: "games",
    title: "Desk Arcade",
    x: 164,
    y: 54,
    width: 760,
    height: 650,
    z: 15,
    open: false,
    maximized: false,
  },
  {
    id: "desk",
    title: "Desk Accessories",
    x: 140,
    y: 45,
    width: 820,
    height: 760,
    z: 18,
    open: false,
    maximized: false,
  },
  {
    id: "notepad",
    title: "Note Pad",
    x: 296,
    y: 58,
    width: 610,
    height: 540,
    z: 19,
    open: false,
    maximized: false,
  },
  {
    id: "sketch",
    title: "Sketch Pad",
    x: 110,
    y: 44,
    width: 780,
    height: 610,
    z: 20,
    open: false,
    maximized: false,
  },
  {
    id: "tasks",
    title: "Quick List",
    x: 260,
    y: 80,
    width: 590,
    height: 540,
    z: 21,
    open: false,
    maximized: false,
  },
  {
    id: "focus",
    title: "Focus Clock",
    x: 358,
    y: 68,
    width: 490,
    height: 590,
    z: 22,
    open: false,
    maximized: false,
  },
  {
    id: "calendar",
    title: "Pocket Calendar",
    x: 150,
    y: 50,
    width: 760,
    height: 600,
    z: 23,
    open: false,
    maximized: false,
  },
  {
    id: "calculator",
    title: "Desk Calculator",
    x: 310,
    y: 76,
    width: 650,
    height: 560,
    z: 24,
    open: false,
    maximized: false,
  },
  {
    id: "converter",
    title: "Unit Converter",
    x: 245,
    y: 88,
    width: 640,
    height: 520,
    z: 25,
    open: false,
    maximized: false,
  },
  {
    id: "palette",
    title: "Colour Studio",
    x: 200,
    y: 64,
    width: 700,
    height: 570,
    z: 26,
    open: false,
    maximized: false,
  },
  {
    id: "orbitals",
    title: "Orbital Lab",
    x: 60,
    y: 50,
    width: 1050,
    height: 730,
    z: 27,
    open: false,
    maximized: false,
  },
  {
    id: "contact",
    title: "Contact Samuel",
    x: 286,
    y: 122,
    width: 570,
    height: 420,
    z: 8,
    open: false,
    maximized: false,
  },
  {
    id: "lab",
    title: "Home Lab Network",
    x: 188,
    y: 86,
    width: 710,
    height: 520,
    z: 9,
    open: false,
    maximized: false,
  },
  {
    id: "scrapbook",
    title: "Interests & Notes",
    x: 218,
    y: 102,
    width: 660,
    height: 488,
    z: 10,
    open: false,
    maximized: false,
  },
  {
    id: "secret",
    title: "The Secret About Box",
    x: 294,
    y: 134,
    width: 500,
    height: 350,
    z: 16,
    open: false,
    maximized: false,
  },
];

const DESKTOP_ICONS: DesktopIcon[] = [
  { id: "about", label: "Start Here", icon: "profile", description: "Biography, current work, a recent field note and clear routes through the portfolio." },
  { id: "projects", label: "Projects", icon: "folder", description: "Selected products, research and technical builds." },
  { id: "coverd", label: "COVERD", icon: "coverd", description: "Samuel’s startup, product thesis and responsible-AI principles." },
  { id: "experience", label: "Experience", icon: "briefcase", description: "Professional history from emergency operations to applied AI." },
  { id: "documents", label: "Documents", icon: "pdf", description: "Read the Applied AI CV and learning material in one continuous reader." },
  { id: "games", label: "Desk Arcade", icon: "game", description: "Seven playful, local games with old-Mac mischief and small pieces of Samuel’s work." },
  { id: "desk", label: "Desk Accessories", icon: "accessories", description: "Eight everyday tools and a fast atomic-orbital lab, all in your browser." },
  { id: "orbitals", label: "Orbital Lab", icon: "orbital", description: "Explore atomic orbitals in a fast, browser-local ASCII laboratory." },
  { id: "skills", label: "Skills", icon: "controls", description: "Technical, product, research and leadership capabilities." },
  { id: "education", label: "Education", icon: "university", description: "Imperial, King’s College London and academic awards." },
  { id: "lab", label: "Home Lab", icon: "network", description: "Samuel’s self-hosted AI, storage and automation infrastructure." },
  { id: "scrapbook", label: "Interests", icon: "photos", description: "Photography, hiking, music, teaching and life outside work." },
  { id: "contact", label: "Contact", icon: "mail", description: "Email, LinkedIn and GitHub without leaving the desktop." },
];

const UTILITY_ICONS: Partial<Record<AppId, IconKind>> = {
  desk: "accessories",
  notepad: "note",
  sketch: "sketch",
  tasks: "tasks",
  focus: "clock",
  calendar: "calendar",
  calculator: "calculator",
  converter: "converter",
  palette: "palette",
  orbitals: "orbital",
};

const APP_ROUTES: Record<AppId, string> = {
  about: "",
  coverd: "coverd",
  experience: "experience",
  projects: "projects",
  project: "projects",
  sidequest: "sidequest",
  skills: "skills",
  education: "education",
  documents: "documents",
  games: "games",
  desk: "desk",
  notepad: "desk",
  sketch: "desk",
  tasks: "desk",
  focus: "desk",
  calendar: "desk",
  calculator: "desk",
  converter: "desk",
  palette: "desk",
  orbitals: "orbitals",
  contact: "contact",
  lab: "lab",
  scrapbook: "interests",
  secret: "about",
};

const experience = [
  {
    period: "May 2026 — Present",
    originId: "marsh",
    role: "Senior Coordinator — Digital Transformation Strategy Internship",
    company: "Marsh · Strategy & Corporate Development Group",
    location: "London",
    copy: "Conducted client-confidential applied-AI research in a regulated insurance setting, with documented evaluation, human oversight and deployment safeguards. Operational data, model design and findings remain private.",
    tag: "CURRENT",
  },
  {
    period: "Mar 2026 — Present",
    originId: "coverd",
    role: "Founder & Product Lead · Part-time",
    company: "COVERD",
    location: "London",
    copy: "Developed early company-aware voice-interview experiments, then evolved that research into COVERD’s current product: an ATS-connected recruitment-intelligence layer that reviews applications across specialist dimensions, enriches evidence with automated voice interviews and returns reasoned shortlists while recruiters keep the decision.",
    detail: "Led early discovery with four design partners and pivoted from candidate-side CV tooling. By April 2026, tested three voice-interview architectures across 20 candidate interviews; voice enrichment remains optional when application evidence is incomplete.",
    tag: "FOUNDER",
  },
  {
    period: "Oct 2024 — Apr 2026",
    originId: "pfizer",
    role: "Web Application Developer & Product Owner · Part-time",
    company: "Pfizer Analytical R&D",
    location: "London",
    copy: "Owned the roadmap and stakeholder adoption for GROWMAT, an internal enterprise product. Its external showcase documents the architecture and outcomes; live data, source code, credentials and non-public operating context remain private.",
    tag: "PRODUCT",
  },
  {
    period: "Sep 2023 — Aug 2024",
    originId: "pfizer-placement",
    role: "Data Analyst Undergraduate",
    company: "Pfizer Analytical R&D",
    location: "Sandwich",
    copy: "Built and delivered GROWMAT within a regulated R&D environment, improving an internal planning process and supporting wider product adoption. Its external showcase is public; live company data, source code, credentials and non-public operating context remain private. Also explored scientific modelling workflows for pharmaceutical research.",
    detail: "Worked across product discovery, full-stack delivery, reliability and change management. Pharmaceutical modelling datasets, parameters and results remain confidential.",
    tag: "DATA",
  },
  {
    period: "Jan 2023 — Apr 2025",
    originId: "kcl-teaching",
    role: "Coding Series Tutor & Curriculum Designer",
    company: "King’s College London",
    location: "London",
    copy: "Designed and delivered 20+ programming, data-analysis and introductory ML sessions for 80+ chemistry students. Organised a cross-industry data-science careers panel for 100+ attendees and mentored learners in using technical skills to widen their options.",
    tag: "EDUCATION",
  },
  {
    period: "Jun — Jul 2023",
    originId: "kcl-research-2023",
    role: "Summer Research Project",
    company: "King’s College London",
    location: "London",
    copy: "Completed a summer research project at King’s College London. The linked computational-chemistry material includes a later workstation setup for GPU-capable containers and GROMACS topology preparation.",
    tag: "RESEARCH",
  },
  {
    period: "Jun — Jul 2022",
    originId: "kcl-research-2022",
    role: "Undergraduate Research Fellow",
    company: "King’s College London",
    location: "London",
    copy: "Built MATLAB, Python and Excel tooling for rotational-spectroscopy analysis; named co-author on the 2025 International Symposium on Molecular Spectroscopy conference record.",
    tag: "RESEARCH",
  },
  {
    period: "Jul 2019 — Jul 2021",
    originId: "scdf",
    role: "Commander’s Personal Assistant / Sergeant",
    company: "Singapore Civil Defence Force",
    location: "Singapore",
    copy: "Built decision-support and workflow automation during COVID-19 emergency operations using public epidemiological data. Personnel records, operational processes, infrastructure and scale remain protected.",
    detail: "Supported senior leaders in time-critical operations, balancing incomplete information, rapid prioritisation and accountability across large-scale personnel operations.",
    tag: "SERVICE",
  },
];

const skillGroups = [
  {
    title: "Applied AI & Recruitment Systems",
    summary: "Designing AI products that keep application evidence, specialist evaluation, voice enrichment and final human decisions open to review.",
    evidence: "COVERD — an ATS-connected intelligence layer that reviews applications, retains evidence and returns reasoned shortlists; automated voice interviews add signal when needed.",
    items: [
      "Multi-agent orchestration & graph workflows",
      "Voice pipelines & cascade model design",
      "RAG, retrieval & knowledge refresh",
      "LLM, prompt & embedding evaluation",
      "Evidence-weighted belief updates",
      "Human-in-the-loop AI safeguards",
    ],
  },
  {
    title: "Software & Product Engineering",
    summary: "Building maintainable products end to end: interface, service logic, data model, integration, testing and deployment.",
    evidence: "COVERD — combines TypeScript/React product surfaces, Python AI services, ATS integrations, structured evidence and evaluation tooling.",
    items: [
      "Python services & asynchronous workflows",
      "TypeScript, React & Next.js",
      "API design & third-party integrations",
      "PostgreSQL schemas & data modelling",
      "Real-time interfaces & WebSockets",
      "Testing, debugging & code review",
      "Authentication, privacy & secure defaults",
      "Product analytics & observability",
    ],
  },
  {
    title: "Search, Data & Evaluation",
    summary: "Treating evaluation as an engineering discipline: stated baselines, provenance, failure analysis and clear limits.",
    evidence: "Client-confidential research uses documented evaluation, qualified recommendations and human oversight in a regulated setting.",
    items: [
      "Learning-to-rank & recommendation systems",
      "Document extraction & intelligence",
      "SQL, PostgreSQL & analytical pipelines",
      "Time-aware validation & lagged baselines",
      "Error analysis, provenance & abstention",
      "Quantitative and qualitative evaluation",
    ],
  },
  {
    title: "Infrastructure & Delivery",
    summary: "Operating the systems behind the product, with an emphasis on repeatability, recovery and sensible security.",
    evidence: "Home lab — connects Proxmox and Docker services for local AI, storage and automation, with scheduled PostgreSQL backups and recovery tooling.",
    items: [
      "Docker, Linux & Proxmox",
      "CI/CD & self-hosted GitHub Actions",
      "Cross-architecture builds & runners",
      "GPU compute & private AI hosting",
      "Networking, monitoring & hardening",
      "Backups, rollback & disaster recovery",
    ],
  },
  {
    title: "Scientific & Quantitative Computing",
    summary: "A chemistry-trained approach to modelling: design the experiment, test assumptions and let evidence change the implementation.",
    evidence: "Regulated R&D and academic research — applied scientific computing to modelling and molecular-research problems.",
    items: [
      "Statistical modelling & experiment design",
      "Julia, MATLAB & scientific Python",
      "Statistical thermodynamics",
      "Computational chemistry",
      "GROMACS environment setup & topology preprocessing",
      "Reproducible research workflows",
    ],
  },
  {
    title: "Product, Leadership & Adoption",
    summary: "Building trusted products for ambiguous technical problems through close listening, clear trade-offs and shared ownership.",
    evidence: "GROWMAT and COVERD — turned ambiguous needs into adopted products through discovery, roadmap ownership and stakeholder communication.",
    items: [
      "Customer discovery & problem framing",
      "Rapid prototyping & product strategy",
      "Roadmaps, prioritisation & trade-offs",
      "Stakeholder communication & live demos",
      "Responsible AI & adoption planning",
      "Teaching, mentoring & team enablement",
    ],
  },
];

function PixelIcon({ kind, small = false }: { kind: IconKind; small?: boolean }) {
  if (kind === "coverd") {
    return (
      <span className={`pixel-icon pixel-icon--coverd${small ? " pixel-icon--small" : ""}`} aria-hidden="true">
        <span className="coverd-icon-plate">
          <Image
            src="/coverd-logo-black-on-transparent.png"
            alt=""
            fill
            sizes={small ? "16px" : "32px"}
            loading="eager"
          />
        </span>
      </span>
    );
  }

  return (
    <span className={`pixel-icon pixel-icon--${kind}${small ? " pixel-icon--small" : ""}`} aria-hidden="true">
      <System7Icon kind={kind} miniature={small} />
    </span>
  );
}

const FINDER_APPLICATIONS: FinderApplication[] = INITIAL_WINDOWS
  .filter((item) => item.id !== "secret" && item.id !== "project")
  .map((item) => {
    const desktopItem = DESKTOP_ICONS.find((icon) => icon.id === item.id);
    return {
      id: item.id,
      title: item.title,
      description: desktopItem?.description ?? (item.id === "sidequest" ? "Latest field note · RUN/HACK" : item.id === "orbitals" ? "Explore atomic orbitals in a fast, browser-local ASCII laboratory." : "Desk Accessories"),
      icon: <PixelIcon kind={UTILITY_ICONS[item.id] ?? desktopItem?.icon ?? "runner"} small />,
    };
  });

function WindowChrome({
  windowState,
  active,
  onFocus,
  onClose,
  onZoom,
  onDragStart,
  onResizeStart,
  onResizeKeyDown,
  children,
  locale,
}: {
  windowState: WindowState;
  active: boolean;
  onFocus: () => void;
  onClose: () => void;
  onZoom: () => void;
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onResizeKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <TranslationBoundary locale={locale}><section
      className={`mac-window${active ? " is-active" : ""}${windowState.maximized ? " is-maximized" : ""}`}
      data-app-id={windowState.id}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.z,
      }}
      onPointerDown={() => { if (!active) onFocus(); }}
      onFocusCapture={() => { if (!active) onFocus(); }}
      aria-label={`${translateText(locale, windowState.title)} ${translateText(locale, "window")}`}
    >
      <div
        className="mac-titlebar"
        onPointerDown={onDragStart}
        onDoubleClick={onZoom}
      >
        <button className="window-box window-close" onClick={onClose} aria-label={`${translateText(locale, "Close")} ${translateText(locale, windowState.title)}`} />
        <h2>{windowState.title}</h2>
        <button
          className="window-box window-zoom"
          onClick={onZoom}
          aria-label={`${translateText(locale, windowState.maximized ? "Restore" : "Maximize")} ${translateText(locale, windowState.title)}`}
          aria-pressed={windowState.maximized}
        />
      </div>
      <div className="mac-window__content" tabIndex={0}>{children}</div>
      {!windowState.maximized && (
        <button
          type="button"
          className="window-resize-handle"
          onPointerDown={onResizeStart}
          onKeyDown={onResizeKeyDown}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          aria-label={`${translateText(locale, "Resize")} ${translateText(locale, windowState.title)}. ${translateText(locale, "Use arrow keys to resize.")}`}
          title={`${translateText(locale, "Resize")} ${translateText(locale, windowState.title)}`}
        />
      )}
    </section></TranslationBoundary>
  );
}

function AboutApp({ openApp, locale }: { openApp: (id: AppId) => void; locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="about-app">
      <div className="about-sidebar">
        <div className="portrait-frame">
          <Image src="/headshot.jpg" alt="Samuel Zhang" fill sizes="170px" priority />
        </div>
        <p className="portrait-caption">SAMUEL.ZHANG</p>
        <dl className="quick-facts">
          <div><dt>Location</dt><dd>London, UK</dd></div>
          <div><dt>Current</dt><dd>Senior Coordinator</dd></div>
          <div><dt>Venture</dt><dd>coverd.ai</dd></div>
          <div><dt>Direction</dt><dd>Product leadership</dd></div>
        </dl>
      </div>
      <div className="about-main">
        <div className="about-program">
          <PixelIcon kind="profile" />
          <div>
            <h1>Samuel Zhang</h1>
            <p className="hero-role">Applied AI Engineer · Product Builder · Founder</p>
          </div>
        </div>
        <p className="hero-copy">
          I build software around problems I have met in research and at work: planning laboratory capacity, helping recruiters understand applicants, and using machine learning where the cost of an error matters. My background spans chemistry, emergency operations and product development. Today I work on applied AI and lead COVERD.
        </p>
        <fieldset className="about-panel">
          <legend>Working style</legend>
          <p>Technically curious, attentive in a room, and happiest when helping other people do their best work.</p>
        </fieldset>
        <article className="latest-update-card" aria-labelledby="latest-update-title">
          <div className="latest-update-card__photo">
            <Image
              src="/hackathons/runhack/building-in-motion.jpg"
              alt="Samuel and another participant using their phones while moving around the London Stadium Community Track."
              fill
              sizes="(max-width: 720px) 100vw, 240px"
            />
          </div>
          <div className="latest-update-card__copy">
            <div className="latest-update-card__meta">
              <span>LATEST FIELD NOTE</span>
              <time dateTime="2026-08-29">29 AUG 2026</time>
            </div>
            <h2 id="latest-update-title">What happens when only the runner can build?</h2>
            <p>A rain-soaked 44 km team relay, more than 100 builders, a voice-built social running app and a second-place finish.</p>
            <button className="s7-button" type="button" onClick={() => openApp("sidequest")}>Read the RUN/HACK story →</button>
          </div>
        </article>
        <nav className="identity-switchboard" aria-label="Samuel’s cabinet of curiosities">
          <div className="identity-switchboard__heading">
            <span>CABINET OF CURIOSITIES</span>
            <b>Explore Samuel&apos;s work</b>
            <p>Each button opens one clear destination. Projects is the quickest tour.</p>
          </div>
          <button className="identity-drawer--projects" onClick={() => openApp("projects")}>
            <PixelIcon kind="folder" small />
            <span className="identity-copy identity-copy--product">
              <b>Selected projects</b>
              <span className="identity-detail">Products, applied AI, scientific research and interactive technical walkthroughs.</span>
              <span className="identity-drawer-prompt">OPEN PROJECTS →</span>
            </span>
          </button>
          <button onClick={() => openApp("coverd")}>
            <PixelIcon kind="coverd" small />
            <span className="identity-copy"><b>COVERD · Founder&apos;s desk</b><span className="identity-detail">The startup, product thesis and approach to evidence-led recruitment decisions.</span></span>
          </button>
          <button onClick={() => openApp("experience")}>
            <PixelIcon kind="briefcase" small />
            <span className="identity-copy"><b>Experience &amp; career</b><span className="identity-detail">Professional history across applied AI, product, research, teaching and public service.</span></span>
          </button>
          <button onClick={() => openApp("documents")}>
            <PixelIcon kind="pdf" small />
            <span className="identity-copy"><b>CV &amp; documents</b><span className="identity-detail">Read or download the current CV and supporting public documents.</span></span>
          </button>
          <button onClick={() => openApp("lab")}>
            <PixelIcon kind="network" small />
            <span className="identity-copy"><b>Home lab &amp; systems</b><span className="identity-detail">Self-hosted services, infrastructure boundaries and recovery lessons.</span></span>
          </button>
          <button onClick={() => openApp("scrapbook")}>
            <PixelIcon kind="photos" small />
            <span className="identity-copy"><b>Interests &amp; notes</b><span className="identity-detail">Music, photography, hiking, teaching and the stories behind the technical work.</span></span>
          </button>
        </nav>
        <section className="arcade-invite" aria-labelledby="arcade-invite-title">
          <div className="arcade-invite__mark" aria-hidden="true">
            <PixelIcon kind="game" />
            <span className="arcade-invite__count">7</span>
          </div>
          <div className="arcade-invite__copy">
            <span>AFTER HOURS · LOCAL PLAY</span>
            <h2 id="arcade-invite-title">Play a little.</h2>
            <p>Seven small games with hints of Samuel&apos;s work and old-Mac mischief. No account, no tracking, no stakes.</p>
            <ul className="arcade-invite__games" aria-label="Games in Desk Arcade">
              {ARCADE_GAMES.map((item) => (
                <li key={item.id}><b aria-hidden="true">{item.icon}</b><span>{item.label}</span></li>
              ))}
            </ul>
          </div>
          <button className="s7-button" type="button" onClick={() => openApp("games")}>Open Desk Arcade →</button>
        </section>
        <fieldset className="about-panel about-evidence">
          <legend>Selected work</legend>
          <dl>
            <div><dt><a href={`/${localeSlug(locale)}/projects?project=coverd-ai`}>COVERD</a></dt><dd>Public product covers ATS-connected review, six specialist dimensions, voice enrichment and reasoned shortlists.</dd></div>
            <div><dt><a href={`/${localeSlug(locale)}/projects?project=growmat`}>GROWMAT</a></dt><dd>External showcase covers architecture and outcomes; live data and source remain private.</dd></div>
            <div><dt><a href={`/${localeSlug(locale)}/experience#kcl-teaching`}>People</a></dt><dd>20+ teaching sessions for 80+ students and a careers panel for more than 100.</dd></div>
          </dl>
        </fieldset>
        <div className="button-row">
          <a className="mac-button" href={localeCvAssets[locale].src} download>Download CV</a>
          <button className="mac-button is-default" onClick={() => openApp("contact")}>Contact Samuel</button>
        </div>
        <fieldset className="about-panel">
          <legend>About this desktop</legend>
          <p>Browse the source, download the code and read the setup guide on GitHub. Check the licence and content notices before reuse.</p>
          <p>Personal, non-commercial use with credit. No sales; shared versions must stay free.</p>
          <a className="mac-button" href="https://github.com/samuel-zhang01/samuel-homepage" target="_blank" rel="noopener noreferrer">Source &amp; downloads ↗</a>
        </fieldset>
      </div>
    </div></TranslationBoundary>
  );
}

function CoverdApp({ locale }: { locale: Locale }) {
  const products = [
    {
      code: "01",
      title: "ATS Intelligence Layer",
      copy: "Connects to an existing applicant-tracking workflow so teams keep the system they already use while COVERD adds structured evaluation.",
    },
    {
      code: "02",
      title: "Six Specialist Reviews",
      copy: "Examines skills, experience, domain knowledge, trajectory, communication and culture as separate evidence dimensions, each with its own rationale.",
    },
    {
      code: "03",
      title: "Voice Enrichment",
      copy: "Automated voice interviews and follow-ups can add evidence when an application alone leaves important questions unresolved.",
    },
    {
      code: "04",
      title: "Candidate Compass",
      copy: "Maps the applicant pool into a shortlist, review set and rejection set so recruiters can examine the whole pipeline at once.",
    },
    {
      code: "05",
      title: "Reasons & Review",
      copy: "Retains the evidence behind each assessment, flags uncertainty for human review and shows recruiters the basis for every judgement.",
    },
    {
      code: "06",
      title: "Outcome Learning",
      copy: "Uses aggregated hiring outcomes to improve role understanding while recruiters remain responsible for every consequential decision.",
    },
  ];

  const pipeline = [
    ["01", "Connect the ATS", "Keep the existing recruiting workflow and add an intelligence layer over the incoming application pool."],
    ["02", "Read every application", "Apply the same structured review to every candidate without reviewer-fatigue shortcuts."],
    ["03", "Separate the evidence", "Run specialist assessments across six dimensions and retain the reasons behind each result."],
    ["04", "Enrich when useful", "Use voice interviews, portfolio review or follow-ups when the existing record leaves material gaps."],
    ["05", "Shortlist with reasons", "Return a reviewable pipeline; recruiters examine uncertainty and make the final decision."],
  ];

  return (
    <TranslationBoundary locale={locale}><div className="coverd-app">
      <header className="coverd-hero">
        <div className="coverd-brand">
          <span className="coverd-kicker">RECRUITMENT INTELLIGENCE LAYER</span>
          <div className="coverd-wordmark">
            <Image
              src="/coverd-logo-black-on-transparent.png"
              alt=""
              width={58}
              height={58}
              sizes="(max-width: 720px) 42px, 58px"
              priority
            />
            <h3>COVERD<span>.</span></h3>
          </div>
          <p>Every applicant reviewed. A defensible shortlist with reasons.</p>
          <div className="coverd-actions">
            <a className="coverd-link s7-button" href="https://coverd.ai/" target="_blank" rel="noopener noreferrer">Visit coverd.ai ↗</a>
            <span>FOUNDED 2026 · LONDON</span>
          </div>
        </div>
        <div className="founder-note">
          <span>CURRENT PRODUCT / AUG 2026</span>
          <p>
            COVERD began with candidate-side CV tooling and company-aware voice-interview
            experiments. That research now feeds a broader product: an intelligence layer
            over an existing ATS that evaluates applications, preserves evidence, enriches
            profiles when needed and returns a reasoned shortlist for recruiter review.
          </p>
        </div>
      </header>

      <section className="coverd-thesis">
        <div>
          <span className="eyebrow">THE THESIS</span>
          <h4>Review every applicant.<br />Keep people in control.</h4>
        </div>
        <p>
          Application volume makes consistent review difficult. COVERD applies specialist
          evaluation across six dimensions, keeps the evidence behind each assessment and
          adds automated voice interviews when another signal would help. The result is a
          ranked pipeline that recruiters can inspect. It does not replace recruiter judgement. Candidate
          records, prompts and production internals remain outside this public portfolio.
        </p>
      </section>

      <section className="coverd-numbers">
        <div><strong>6</strong><span>specialist dimensions</span></div>
        <div><strong>ATS</strong><span>existing workflow</span></div>
        <div><strong>CV + VOICE</strong><span>evidence paths</span></div>
        <div><strong>HUMAN</strong><span>decision owner</span></div>
      </section>

      <section className="coverd-section" id="coverd-products">
        <div className="coverd-section__heading">
          <span>PRODUCT SYSTEM</span>
          <h4>One review layer across the hiring pipeline.</h4>
        </div>
        <div className="coverd-product-grid">
          {products.map((product) => (
            <article key={product.code}>
              <span>{product.code}</span>
              <h5>{product.title}</h5>
              <p>{product.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="coverd-section coverd-section--pipeline">
        <div className="coverd-section__heading">
          <span>OPERATING MODEL</span>
          <h4>From application volume to a reasoned shortlist.</h4>
        </div>
        <div className="coverd-pipeline">
          {pipeline.map(([number, title, copy]) => (
            <article key={number}>
              <b>{number}</b>
              <div><h5>{title}</h5><p>{copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="coverd-ethics">
        <div className="coverd-ethics__intro">
          <span className="eyebrow">RESPONSIBLE BY DESIGN</span>
          <h4>Hiring intelligence people can inspect.</h4>
          <p>Trust comes from evidence, visible uncertainty, candidate agency and accountable human decisions.</p>
        </div>
        <div className="coverd-principles">
          <article><strong>Every score has a reason</strong><p>Recruiters receive the evidence, reasoning and supporting record behind each assessment.</p></article>
          <article><strong>Candidate agency matters</strong><p>The public product commits to evaluation visibility, correction requests and consent withdrawal.</p></article>
          <article><strong>Enrichment is purposeful</strong><p>Voice interviews and follow-ups should address a specific evidence gap and earn their place in the workflow.</p></article>
          <article><strong>Uncertainty triggers review</strong><p>Low-confidence or conflicting evidence is routed to human attention, with the uncertainty left visible.</p></article>
          <article><strong>Consistency is testable</strong><p>Specialist dimensions, audit trails and fairness testing give recruiters a reviewable process.</p></article>
          <article><strong>Recruiters remain accountable</strong><p>AI carries repetition and context; people retain the judgement and responsibility.</p></article>
        </div>
        <div className="coverd-values">
          {["ATS-CONNECTED", "EVIDENCE-LED", "VOICE-ENRICHED", "HUMAN-OWNED", "CANDIDATE-FIRST"].map((value) => <span key={value}>{value}</span>)}
        </div>
      </section>
    </div></TranslationBoundary>
  );
}

function CareerProjectLinks({ originId, locale }: { originId: string; locale: Locale }) {
  const openProject = useContext(ProjectOpenContext);
  const origin = projectOrigins.find((item) => item.id === originId);
  if (!origin) return null;
  const t = (text: string) => translateText(locale, text);
  const projectLinks = origin.projects.map((slug) => {
      const project = projects.find((item) => item.slug === slug);
      const pdf = !project?.demo ? project?.artifacts?.find((artifact) => artifact.kind === "PDF") : undefined;
      return project ? <a key={slug} onClick={event => { if (!pdf && openProject && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); openProject(slug); } }} href={pdf?.href ?? `/${localeSlug(locale)}/projects?project=${slug}`} target={pdf ? "_blank" : undefined} rel={pdf ? "noopener noreferrer" : undefined}>
        <span>{t(pdf ? "Open showcase PDF" : "Open project")}</span><strong>{t(project.shortTitle ?? project.title)} →</strong>
      </a> : null;
    });
  return <nav className="career-projects" aria-label={t("Explore the work")} lang={locale}>
    <a href={`/${localeSlug(locale)}/projects?view=map&node=${encodeURIComponent(`experience:${originId}`)}`}><span>{t("Related ideas and projects")}</span><strong>{t("Explore connections")} →</strong></a>
    {projectLinks.slice(0, 4)}
    {projectLinks.length > 4 ? <details className="career-projects-more">
      <summary>{t("More related projects")} ({projectLinks.length - 4})</summary>
      <div className="career-projects">{projectLinks.slice(4)}</div>
    </details> : null}
  </nav>;
}

function CvNavigation({ locale }: { locale: Locale }) {
  return <nav className="button-row" aria-label={translateText(locale, "Explore the CV")}>
    <a className="mac-button" href={`/${localeSlug(locale)}/experience`}>{translateText(locale, "Experience & career")}</a>
    <a className="mac-button" href={`/${localeSlug(locale)}/education`}>{translateText(locale, "Education & awards")}</a>
    <a className="mac-button" href={`/${localeSlug(locale)}/projects?view=map`}>{translateText(locale, "Explore connections")}</a>
  </nav>;
}

function ExperienceApp({ locale }: { locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="experience-app">
      <header className="document-header">
        <div>
          <span className="eyebrow">PROFESSIONAL HISTORY</span>
          <h3>Building useful intelligence.</h3>
        </div>
        <a className="mac-button" href={`/${localeSlug(locale)}/documents`}>View CV</a>
      </header>
      <div className="career-list">
        {experience.map((item) => (
          <article className="career-record" id={item.originId} key={`${item.company}-${item.period}`}>
            <div className="career-period">
              <span>{item.period}</span>
              <em>{item.location}</em>
            </div>
            <div className="career-copy">
              <div className="record-heading">
                <div><h4>{item.role}</h4><p>{item.company}</p></div>
                <span>{item.tag}</span>
              </div>
              <p>{item.copy}</p>
              {item.detail ? <p>{item.detail}</p> : null}
              {item.originId ? <CareerProjectLinks originId={item.originId} locale={locale} /> : null}
            </div>
          </article>
        ))}
      </div>
      <section className="about-panel" id="personal-projects">
        <h4>Selected independent technical projects</h4>
        <p>The CV highlights a private Proxmox/Docker home lab and a Julia stochastic market-impact simulator. The linked archive also includes personal finance, language learning and reinforcement-learning tools.</p>
        <CareerProjectLinks originId="personal-projects" locale={locale} />
      </section>
    </div></TranslationBoundary>
  );
}


function SkillsApp({ locale }: { locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="skills-app">
      <div className="control-panel-intro">
        <PixelIcon kind="controls" />
        <div><h3>Skills in practice.</h3><p>A broader engineering toolkit, connected to the products and systems where Samuel has used it.</p></div>
      </div>
      <div className="control-groups">
        {skillGroups.map((group) => (
          <fieldset className="control-group" key={group.title}>
            <legend>{group.title}</legend>
            <p className="skill-summary">{group.summary}</p>
            <ul className="skill-items">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="skill-evidence"><strong>USED IN PRACTICE</strong>{group.evidence}</p>
          </fieldset>
        ))}
      </div>
    </div></TranslationBoundary>
  );
}

function EducationApp({ locale }: { locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="education-app">
      <header className="document-header">
        <div><span className="eyebrow">EDUCATION</span><h3>Science, computation &amp; enterprise.</h3></div>
        <a className="mac-button" href={`/${localeSlug(locale)}/documents`}>View CV</a>
      </header>
      <section className="degree-card degree-card--imperial" id="imperial">
        <div className="degree-mark">ICL</div>
        <div><span>Sep 2025—Sep 2026</span><h4>MSc AI Applications &amp; Innovation</h4><p>Imperial College London · Predicted Distinction</p><small>Deep Learning · AI Safety · Innovation Management · ML in Medical Imaging · ML in Climate Change</small></div>
      </section>
      <CareerProjectLinks originId="imperial" locale={locale} />
      <section className="degree-card" id="kcl">
        <div className="degree-mark">KCL</div>
        <div><span>Sep 2021—May 2025</span><h4>BSc Chemistry with Biomedicine</h4><p>King&apos;s College London · First-Class Honours</p><small>Professional placement · Computational Chemistry · Molecular Biology · Chemical Biology · Organic Chemistry · Associate of King&apos;s College London</small></div>
      </section>
      <CareerProjectLinks originId="kcl" locale={locale} />
      <div className="education-columns">
        <section>
          <h4>Honours &amp; awards</h4>
          <ul>
            <li>RUN/HACK 2026 — Second place</li>
            <li>King&apos;s Research Experience Award</li>
            <li>Associate of King&apos;s College London (AKC)</li>
            <li>SCDF Service Excellence Award</li>
            <li>SCDF 1st Division HQ Wall of Fame</li>
            <li>EARCOS Global Citizenship Award</li>
          </ul>
        </section>
        <section>
          <h4>Languages</h4>
          <dl className="language-list">
            <div><dt>English</dt><dd>Native / bilingual</dd></div>
            <div><dt>Mandarin</dt><dd>Native / bilingual</dd></div>
            <div><dt>Italian</dt><dd>Elementary</dd></div>
          </dl>
        </section>
      </div>
    </div></TranslationBoundary>
  );
}

function ContactApp({ openApp, locale }: { openApp: (id: AppId) => void; locale: Locale }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [activeService, setActiveService] = useState<"internet" | "email" | "linkedin">("internet");
  const copyResetTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
  }, []);

  const handleServiceTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const services = ["internet", "email", "linkedin"] as const;
    const currentIndex = services.indexOf(activeService);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % services.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + services.length) % services.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = services.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextService = services[nextIndex];
    setActiveService(nextService);
    window.requestAnimationFrame(() => document.getElementById(`contact-tab-${nextService}`)?.focus());
  };

  const copyEmail = async () => {
    const email = "sam.xiaojian.zhang@outlook.com";
    let copySucceeded = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(email);
        copySucceeded = true;
      }
    } catch {
      // Firefox and Safari can deny clipboard access outside a trusted gesture.
    }
    if (!copySucceeded) {
      const previouslyFocused = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      const input = document.createElement("textarea");
      input.value = email;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      try {
        input.select();
        copySucceeded = document.execCommand("copy");
      } catch {
        copySucceeded = false;
      } finally {
        input.remove();
        if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
      }
    }
    setCopyState(copySucceeded ? "copied" : "failed");
    if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
    copyResetTimer.current = window.setTimeout(() => {
      setCopyState("idle");
      copyResetTimer.current = null;
    }, 2_500);
  };

  const copyLabel = copyState === "copied"
    ? translateText(locale, "Address Copied!")
    : copyState === "failed"
      ? translateText(locale, "Copy Failed")
      : translateText(locale, "Copy Email");

  return (
    <TranslationBoundary locale={locale}><div className="chooser-app">
      <div className="chooser-columns">
        <div className="chooser-list" role="tablist" aria-label="Contact services" onKeyDown={handleServiceTabsKeyDown}>
          <button id="contact-tab-internet" type="button" role="tab" tabIndex={activeService === "internet" ? 0 : -1} aria-selected={activeService === "internet"} aria-controls="contact-service-panel" className={activeService === "internet" ? "is-selected" : ""} onClick={() => setActiveService("internet")}><PixelIcon kind="network" small />Internet</button>
          <button id="contact-tab-email" type="button" role="tab" tabIndex={activeService === "email" ? 0 : -1} aria-selected={activeService === "email"} aria-controls="contact-service-panel" className={activeService === "email" ? "is-selected" : ""} onClick={() => setActiveService("email")}><PixelIcon kind="document" small />Electronic Mail</button>
          <button id="contact-tab-linkedin" type="button" role="tab" tabIndex={activeService === "linkedin" ? 0 : -1} aria-selected={activeService === "linkedin"} aria-controls="contact-service-panel" className={activeService === "linkedin" ? "is-selected" : ""} onClick={() => setActiveService("linkedin")}><PixelIcon kind="computer" small />LinkedIn</button>
        </div>
        <div id="contact-service-panel" className="chooser-detail" role="tabpanel" aria-labelledby={`contact-tab-${activeService}`}>
          <div className="contact-machine"><PixelIcon kind="computer" /><span className="machine-light" /></div>
          <h3>{activeService === "internet" ? "Samuel Zhang" : activeService === "email" ? "Electronic Mail" : "LinkedIn"}</h3>
          <p>{activeService === "email"
            ? "Email is the most direct way to start a useful conversation."
            : activeService === "linkedin"
              ? "Open Samuel’s professional profile for experience, projects and shared connections."
              : "Available for conversations about applied AI, responsible technology, product leadership, and ambitious early-stage ventures."}</p>
          {activeService === "internet" && (
            <div className="contact-links">
              <button className="mac-button is-default" aria-live="polite" onClick={copyEmail}>{copyLabel}</button>
              <a className="mac-button" href="https://www.linkedin.com/in/samuel-xj-zhang/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="mac-button" href="https://github.com/samuel-zhang01" target="_blank" rel="noreferrer">GitHub</a>
              <button className="mac-button" onClick={() => openApp("coverd")}>COVERD</button>
            </div>
          )}
          {activeService === "email" && (
            <div className="contact-links">
              <a className="mac-button is-default" href="mailto:sam.xiaojian.zhang@outlook.com">Write Email</a>
              <button className="mac-button" aria-live="polite" onClick={copyEmail}>{copyLabel}</button>
            </div>
          )}
          {activeService === "linkedin" && (
            <div className="contact-links">
              <a className="mac-button is-default" href="https://www.linkedin.com/in/samuel-xj-zhang/" target="_blank" rel="noreferrer">Open LinkedIn</a>
            </div>
          )}
          <dl><div><dt>Location:</dt><dd>London, UK</dd></div><div><dt>Network:</dt><dd>Open to useful conversations</dd></div></dl>
        </div>
      </div>
      <div className="chooser-status"><span className="status-dot" /> AppleTalk Active</div>
    </div></TranslationBoundary>
  );
}

const supportingDocuments = [
  {
    id: "study-rl",
    title: "Reinforcement Learning Study Syllabus",
    meta: "Learning atlas · English PDF",
    src: "/projects/study-rl/syllabus.pdf",
  },
];

function DocumentsApp({ locale }: { locale: Locale }) {
  const [activeDocumentId, setActiveDocumentId] = useState("ai-cv");
  const documentLibrary = useMemo(() => [
    { id: "ai-cv", ...localeCvAssets[locale] },
    ...supportingDocuments,
  ], [locale]);
  const activeDocument = documentLibrary.find((document) => document.id === activeDocumentId) ?? documentLibrary[0];

  return (
    <TranslationBoundary locale={locale}><div className="documents-app">
      <aside className="documents-library">
        <div className="documents-library__title">
          <PixelIcon kind="pdf" />
          <div><span>LIBRARY</span><strong>{documentLibrary.length} documents</strong></div>
        </div>
        {documentLibrary.map((document) => (
          <button
            key={document.id}
            className={activeDocument.id === document.id ? "is-active" : ""}
            onClick={() => setActiveDocumentId(document.id)}
          >
            <PixelIcon kind="document" small />
            <span><strong>{document.title}</strong><small>{document.meta}</small></span>
          </button>
        ))}
      </aside>
      <section className="documents-preview">
        {activeDocument.id === "ai-cv" ? <CvNavigation locale={locale} /> : <nav className="button-row" aria-label={translateText(locale, "Explore the work")}><a className="mac-button" href={`/${localeSlug(locale)}/projects?project=study-rl&view=demo`}>{translateText(locale, "Explore learning experiments")} →</a></nav>}
        <div className="documents-toolbar">
          <span>{activeDocument.title}</span>
          <span className="documents-toolbar__hint">Scroll continuously to read every page; zoom when needed.</span>
          <a href={activeDocument.src} download>{activeDocument.id === "ai-cv" ? "Download CV" : "Save a copy"}</a>
        </div>
        <PdfPreview
          key={activeDocument.id}
          src={activeDocument.src}
          title={translateText(locale, activeDocument.title)}
          locale={locale}
        />
        <p className="documents-fallback">
          Prefer your browser&apos;s full PDF tools? <a href={activeDocument.src}>Open this document in the current tab</a>.
        </p>
      </section>
    </div></TranslationBoundary>
  );
}

type MineCell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

function mineCellLabel(locale: Locale, cell: MineCell, index: number) {
  if (locale === "zh-CN") {
    if (cell.flagged && !cell.revealed) return `格子 ${index + 1}，已标记`;
    if (!cell.revealed) return `格子 ${index + 1}，未揭开`;
    if (cell.mine) return `格子 ${index + 1}，地雷`;
    return cell.adjacent
      ? `格子 ${index + 1}，相邻 ${cell.adjacent} 枚地雷`
      : `格子 ${index + 1}，已揭开，无相邻地雷`;
  }
  if (locale === "zh-TW") {
    if (cell.flagged && !cell.revealed) return `格子 ${index + 1}，已標記`;
    if (!cell.revealed) return `格子 ${index + 1}，未揭開`;
    if (cell.mine) return `格子 ${index + 1}，地雷`;
    return cell.adjacent
      ? `格子 ${index + 1}，相鄰 ${cell.adjacent} 顆地雷`
      : `格子 ${index + 1}，已揭開，無相鄰地雷`;
  }
  if (cell.flagged && !cell.revealed) return `Cell ${index + 1}, flagged`;
  if (!cell.revealed) return `Cell ${index + 1}, hidden`;
  if (cell.mine) return `Cell ${index + 1}, mine`;
  return cell.adjacent
    ? `Cell ${index + 1}, ${cell.adjacent} adjacent mines`
    : `Cell ${index + 1}, revealed, no adjacent mines`;
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646;
}

function createMinefield(seed = 91): MineCell[] {
  const size = 8;
  const random = seededRandom(seed);
  const mines = new Set<number>();
  while (mines.size < 10) mines.add(Math.floor(random() * size * size));

  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    let adjacent = 0;
    for (let y = -1; y <= 1; y += 1) {
      for (let x = -1; x <= 1; x += 1) {
        const nextRow = row + y;
        const nextColumn = column + x;
        if (nextRow >= 0 && nextRow < size && nextColumn >= 0 && nextColumn < size && mines.has(nextRow * size + nextColumn)) adjacent += 1;
      }
    }
    return { mine: mines.has(index), revealed: false, flagged: false, adjacent };
  });
}

function createPuzzle(seed = 1991) {
  const random = seededRandom(seed);
  const tiles = Array.from({ length: 16 }, (_, index) => (index + 1) % 16);
  let blank = 15;
  for (let move = 0; move < 180; move += 1) {
    const row = Math.floor(blank / 4);
    const column = blank % 4;
    const neighbours = [
      row > 0 ? blank - 4 : -1,
      row < 3 ? blank + 4 : -1,
      column > 0 ? blank - 1 : -1,
      column < 3 ? blank + 1 : -1,
    ].filter((index) => index >= 0);
    const next = neighbours[Math.floor(random() * neighbours.length)];
    [tiles[blank], tiles[next]] = [tiles[next], tiles[blank]];
    blank = next;
  }
  return tiles;
}

const SAM_WORDS = [
  { answer: "COVERD", clue: "Samuel’s recruitment intelligence startup.", fact: "COVERD connects to existing ATS workflows, reviews applications across specialist dimensions and keeps recruiters responsible for the decision." },
  { answer: "PFIZER", clue: "Where Samuel worked on a private enterprise product.", fact: "At Pfizer, Samuel delivered GROWMAT; its external showcase is public while live data and source remain private." },
  { answer: "PYTHON", clue: "A language threading through Samuel’s research, teaching and AI work.", fact: "Samuel has taught programming and data analysis to more than 80 students." },
  { answer: "LONDON", clue: "The city connecting King’s, Imperial, Marsh and COVERD.", fact: "Samuel’s work spans research, insurance, education and responsible AI across London." },
  { answer: "DOCKER", clue: "The container tool linking shipped products, the home lab and reproducible environments.", fact: "Samuel uses Docker for product services, deployments and a home lab that connects data, automation and everyday tools." },
  { answer: "BANDIT", clue: "A sequential-decision problem balancing exploration with exploitation.", fact: "The Sequential Decisions Lab compares epsilon-greedy, UCB1 and Thompson Sampling over paired synthetic seeds." },
  { answer: "CAUSAL", clue: "The adjustment lens kept separate from off-policy evaluation.", fact: "The Causal Adjustment and OPE Lab distinguishes intervention questions from evaluation of a new logged policy." },
  { answer: "POLICY", clue: "What the OPE workbench evaluates without deploying it.", fact: "The local OPE fixture exposes propensity support, effective sample size and estimator disagreement before any policy claim." },
  { answer: "SENSOR", clue: "What the air-quality decision lab tries to choose economically.", fact: "The Air-Quality ML Decision Lab joins source data QA and model results to an explicit sensor-budget trade-off." },
  { answer: "NEURAL", clue: "A family of scientific models whose internal structure Samuel opens for inspection.", fact: "Samuel explores neural networks for locating microrobots, reconstructing MRI images and approximating fluid flow." },
  { answer: "BROKER", clue: "The human who retains authority in the insurance decision-support workflow.", fact: "The insurance matching work keeps evidence pillars separate and leaves their final synthesis to broker judgement." },
  { answer: "MARKET", clue: "A candidate destination for an insurance risk—and the subject of a tiny Julia simulator.", fact: "Samuel’s projects include insurance-market decision support and a small stochastic model of stock-price impact." },
  { answer: "SOLUTE", clue: "The dissolved component in the solid–liquid equilibrium workbench.", fact: "The solubility exhibit solves an invented solute workflow in log-composition space and reconciles mole and mass reporting bases." },
  { answer: "ENERGY", clue: "A quantity tracked while simulating molecular motion.", fact: "The computational-chemistry exhibit reports deterministic velocity-Verlet energy drift so integrator error stays visible." },
  { answer: "CAMERA", clue: "A tool from Samuel’s former professional life that is now kept for friends and nature.", fact: "Samuel previously photographed weddings professionally and now keeps photography playful and personal." },
  { answer: "HIKING", clue: "An unhurried interest involving boots, conversation and somewhere new.", fact: "Samuel values long walks for curiosity, shared conversation and the story on the way home." },
  { answer: "LAMBDA", clue: "A symbol connecting regularisation paths and an insurance ranking model.", fact: "The archive discusses lambda shrinkage in the air-quality companion and LambdaRank in insurance decision support." },
  { answer: "TENSOR", clue: "The object followed through several rotatable model-architecture diagrams.", fact: "The scientific models show how tensors pass through layers, skip connections and steps that preserve measured data." },
  { answer: "RECALL", clue: "The spaced-practice loop inside the Italian learning portal.", fact: "Parliamo structures a 56-day plan around adaptive practice, four-way spaced recall and progress records." },
  { answer: "CARBON", clue: "The element named in the air-quality telemetry’s CO₂ signal.", fact: "Samuel’s home telemetry includes Bluetooth air-quality measurements flowing into SQL-backed dashboards." },
] as const;

function validateSamWords() {
  const answers = new Set<string>();
  for (const entry of SAM_WORDS) {
    if (!/^[A-Z]{6}$/.test(entry.answer)) {
      throw new Error(`SamWord answer must contain exactly six A–Z letters: ${entry.answer}`);
    }
    if (answers.has(entry.answer)) throw new Error(`Duplicate SamWord answer: ${entry.answer}`);
    if (!entry.clue.trim() || !entry.fact.trim()) throw new Error(`SamWord entry needs a clue and fact: ${entry.answer}`);
    answers.add(entry.answer);
  }
}

validateSamWords();

type ArcadeGameId = "minefield" | "snake" | "brickbreaker" | "puzzle" | "samword" | "memory" | "spectrum";

const ARCADE_GAMES: readonly { id: ArcadeGameId; icon: System7IconKind; label: string; description: string }[] = [
  { id: "minefield", icon: "minefield", label: "Minefield", description: "Clear the desk. Mind the paperwork." },
  { id: "snake", icon: "snake", label: "Snake", description: "Eat pixels, dodge the walls, become inconveniently long." },
  { id: "brickbreaker", icon: "brickbreaker", label: "Brick Breaker", description: "One paddle, one ball and a very breakable filing cabinet." },
  { id: "puzzle", icon: "puzzle", label: "Sliding Puzzle", description: "Put every number back where it belongs." },
  { id: "samword", icon: "word", label: "SamWord", description: "Six letters, profile clues and one suspicious password." },
  { id: "memory", icon: "cards", label: "Profile Pairs", description: "Match the work to the story behind it." },
  { id: "spectrum", icon: "spectrum", label: "Peak Dock", description: "Fit randomised HPLC–UV peaks across three difficulty levels." },
] as const;

const MEMORY_PAIRS = [
  { id: "coverd", left: "ATS LAYER", right: "COVERD", fact: "COVERD reviews applications across specialist dimensions and uses voice interviews as an enrichment path." },
  { id: "growmat", left: "EXTERNAL", right: "GROWMAT", fact: "GROWMAT has an external showcase; source code, live data and credentials remain private." },
  { id: "gpu", left: "PRIVATE", right: "LOCAL AI", fact: "Samuel’s private home-lab inventory includes local model-training and inference systems." },
  { id: "scdf", left: "SCDF", right: "OPERATIONS", fact: "Emergency planning systems supported protected operations in Singapore." },
  { id: "teaching", left: "80+ STUDENTS", right: "CODING", fact: "Samuel designed an accessible programming and data curriculum." },
  { id: "science", left: "SCIENCE", right: "MODELLING", fact: "Scientific computing supported research inside a regulated environment." },
  { id: "infra", left: "DOCKER", right: "HOME LAB", fact: "Samuel’s home lab connects local AI, storage and automation. Its interactive map follows six connected Docker services." },
  { id: "air", left: "CO₂", right: "GRAFANA", fact: "Bluetooth air-quality telemetry flows into SQL dashboards." },
] as const;

type MemoryCard = {
  pairId: string;
  label: string;
  fact: string;
};

function createMemoryDeck(seed = 1991): MemoryCard[] {
  const random = seededRandom(seed);
  const deck = MEMORY_PAIRS.flatMap((pair) => [
    { pairId: pair.id, label: pair.left, fact: pair.fact },
    { pairId: pair.id, label: pair.right, fact: pair.fact },
  ]);
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

function scoreWordGuess(guess: string, answer: string) {
  const score = Array<"correct" | "present" | "absent">(answer.length).fill("absent");
  const remaining = new Map<string, number>();

  answer.split("").forEach((letter, index) => {
    if (guess[index] === letter) score[index] = "correct";
    else remaining.set(letter, (remaining.get(letter) ?? 0) + 1);
  });
  guess.split("").forEach((letter, index) => {
    if (score[index] === "correct") return;
    if ((remaining.get(letter) ?? 0) > 0) {
      score[index] = "present";
      remaining.set(letter, (remaining.get(letter) ?? 0) - 1);
    }
  });
  return score;
}

function describeWordGuess(
  locale: Locale,
  guess: string,
  score: Array<"correct" | "present" | "absent">,
) {
  const describeState = (state: "correct" | "present" | "absent") => {
    if (locale === "zh-CN") {
      return state === "correct" ? "位置正确" : state === "present" ? "答案中有这个字母，但位置不同" : "答案中没有这个字母";
    }
    if (locale === "zh-TW") {
      return state === "correct" ? "位置正確" : state === "present" ? "答案中有這個字母，但位置不同" : "答案中沒有這個字母";
    }
    return state === "correct" ? "correct position" : state === "present" ? "present elsewhere" : "not in the answer";
  };
  const details = score.map((state, index) => `${index + 1}: ${guess[index]}, ${describeState(state)}`).join("; ");
  if (locale === "zh-CN") return `猜词 ${guess}。${details}`;
  if (locale === "zh-TW") return `猜詞 ${guess}。${details}`;
  return `Guess ${guess}. ${details}`;
}

function GamesApp({ openApp, locale }: { openApp: (id: AppId) => void; locale: Locale }) {
  const [game, setGame] = useState<ArcadeGameId>("minefield");
  const [minefield, setMinefield] = useState(() => createMinefield());
  const [mineStatus, setMineStatus] = useState<"playing" | "won" | "lost">("playing");
  const [flagMode, setFlagMode] = useState(false);
  const [puzzle, setPuzzle] = useState(() => createPuzzle());
  const [moves, setMoves] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordInput, setWordInput] = useState("");
  const [wordGuesses, setWordGuesses] = useState<string[]>([]);
  const [wordMessage, setWordMessage] = useState("Six letters. All clues lead back to Samuel.");
  const [memoryDeck, setMemoryDeck] = useState(() => createMemoryDeck());
  const [memoryOpen, setMemoryOpen] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<Set<string>>(() => new Set());
  const [memoryTurns, setMemoryTurns] = useState(0);
  const [memoryFact, setMemoryFact] = useState("");
  const [gamesMenuCue, setGamesMenuCue] = useState<"left" | "right" | "both" | "none">("right");
  const memoryTimer = useRef<number | null>(null);
  const gamesMenuRef = useRef<HTMLElement | null>(null);
  const gameStageRef = useRef<HTMLElement | null>(null);
  useEffect(() => { if (gameStageRef.current) gameStageRef.current.scrollTop = 0; }, [game]);
  const mineSeed = useRef(91);
  const puzzleSeed = useRef(1991);
  const memorySeed = useRef(1991);

  useEffect(() => () => {
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current);
  }, []);

  useEffect(() => {
    const activeGameButton = gamesMenuRef.current?.querySelector<HTMLElement>(`[data-game-id="${game}"]`);
    activeGameButton?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [game]);

  useEffect(() => {
    const menu = gamesMenuRef.current;
    if (!menu) return;
    const updateCue = () => {
      const maximum = Math.max(0, menu.scrollWidth - menu.clientWidth);
      setGamesMenuCue(maximum <= 2
        ? "none"
        : menu.scrollLeft <= 2
          ? "right"
          : menu.scrollLeft >= maximum - 2
            ? "left"
            : "both");
    };
    const frame = window.requestAnimationFrame(updateCue);
    menu.addEventListener("scroll", updateCue, { passive: true });
    window.addEventListener("resize", updateCue);
    return () => {
      window.cancelAnimationFrame(frame);
      menu.removeEventListener("scroll", updateCue);
      window.removeEventListener("resize", updateCue);
    };
  }, []);

  const resetMines = () => {
    mineSeed.current += 1;
    setMinefield(createMinefield(mineSeed.current));
    setMineStatus("playing");
    setFlagMode(false);
  };

  const flagCell = (index: number) => {
    if (mineStatus !== "playing" || minefield[index].revealed) return;
    setMinefield((current) => current.map((cell, cellIndex) => cellIndex === index ? { ...cell, flagged: !cell.flagged } : cell));
  };

  const revealCell = (index: number) => {
    if (flagMode) {
      flagCell(index);
      return;
    }
    if (mineStatus !== "playing" || minefield[index].revealed || minefield[index].flagged) return;
    const next = minefield.map((cell) => ({ ...cell }));
    if (next[index].mine) {
      next.forEach((cell) => { if (cell.mine) cell.revealed = true; });
      setMinefield(next);
      setMineStatus("lost");
      return;
    }

    const queue = [index];
    const visited = new Set<number>();
    while (queue.length) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      next[current].revealed = true;
      if (next[current].adjacent !== 0) continue;
      const row = Math.floor(current / 8);
      const column = current % 8;
      for (let y = -1; y <= 1; y += 1) {
        for (let x = -1; x <= 1; x += 1) {
          const nextRow = row + y;
          const nextColumn = column + x;
          const nextIndex = nextRow * 8 + nextColumn;
          if (nextRow >= 0 && nextRow < 8 && nextColumn >= 0 && nextColumn < 8 && !next[nextIndex].mine && !next[nextIndex].flagged) queue.push(nextIndex);
        }
      }
    }
    const won = next.every((cell) => cell.mine || cell.revealed);
    setMinefield(next);
    if (won) setMineStatus("won");
  };

  const resetPuzzle = () => {
    puzzleSeed.current += 1;
    setPuzzle(createPuzzle(puzzleSeed.current));
    setMoves(0);
  };

  const moveTile = (index: number) => {
    const blank = puzzle.indexOf(0);
    const row = Math.floor(index / 4);
    const column = index % 4;
    const blankRow = Math.floor(blank / 4);
    const blankColumn = blank % 4;
    if (Math.abs(row - blankRow) + Math.abs(column - blankColumn) !== 1) return;
    setPuzzle((current) => {
      const next = [...current];
      [next[index], next[blank]] = [next[blank], next[index]];
      return next;
    });
    setMoves((current) => current + 1);
  };

  const movePuzzleWithArrow = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const blank = puzzle.indexOf(0);
    const row = Math.floor(blank / 4);
    const column = blank % 4;
    const targetByKey: Record<string, number | undefined> = {
      ArrowUp: row > 0 ? blank - 4 : undefined,
      ArrowDown: row < 3 ? blank + 4 : undefined,
      ArrowLeft: column > 0 ? blank - 1 : undefined,
      ArrowRight: column < 3 ? blank + 1 : undefined,
    };
    const target = targetByKey[event.key];
    if (target === undefined) return;
    event.preventDefault();
    moveTile(target);
  };

  const canMovePuzzleTile = (index: number) => {
    const blank = puzzle.indexOf(0);
    return Math.abs(Math.floor(index / 4) - Math.floor(blank / 4))
      + Math.abs((index % 4) - (blank % 4)) === 1;
  };

  const puzzleSolved = puzzle.every((tile, index) => tile === (index + 1) % 16);
  const flagged = minefield.filter((cell) => cell.flagged).length;
  const activeWord = SAM_WORDS[wordIndex];
  const wordSolved = wordGuesses.includes(activeWord.answer);

  const submitWord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const guess = wordInput.trim().toUpperCase();
    if (guess === "SAMUEL") {
      setWordMessage("Profile override accepted. Opening the unnecessary secret...");
      openApp("secret");
      setWordInput("");
      return;
    }
    if (guess.length !== activeWord.answer.length) {
      setWordMessage(`Please enter exactly ${activeWord.answer.length} letters.`);
      return;
    }
    if (!/^[A-Z]+$/.test(guess)) {
      setWordMessage("Letters only. System 7 is particular about paperwork.");
      return;
    }
    if (wordSolved || wordGuesses.length >= 6) return;
    const nextGuesses = [...wordGuesses, guess];
    setWordGuesses(nextGuesses);
    setWordInput("");
    setWordMessage(
      guess === activeWord.answer
        ? activeWord.fact
        : nextGuesses.length === 6
          ? `The answer was ${activeWord.answer}. ${activeWord.fact}`
          : `${6 - nextGuesses.length} attempt${6 - nextGuesses.length === 1 ? "" : "s"} remaining.`,
    );
  };

  const nextWord = () => {
    setWordIndex((current) => (current + 1) % SAM_WORDS.length);
    setWordInput("");
    setWordGuesses([]);
    setWordMessage("New profile file loaded. Six letters.");
  };

  const previousWord = () => {
    setWordIndex((current) => (current - 1 + SAM_WORDS.length) % SAM_WORDS.length);
    setWordInput("");
    setWordGuesses([]);
    setWordMessage("New profile file loaded. Six letters.");
  };

  const resetMemory = () => {
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current);
    memorySeed.current += 1;
    setMemoryDeck(createMemoryDeck(memorySeed.current));
    setMemoryOpen([]);
    setMemoryMatched(new Set());
    setMemoryTurns(0);
    setMemoryFact("");
  };

  const flipMemory = (index: number) => {
    if (memoryOpen.length >= 2 || memoryOpen.includes(index) || memoryMatched.has(memoryDeck[index].pairId)) return;
    if (memoryOpen.length === 0) {
      setMemoryOpen([index]);
      return;
    }

    const firstIndex = memoryOpen[0];
    const nextOpen = [firstIndex, index];
    setMemoryOpen(nextOpen);
    setMemoryTurns((current) => current + 1);
    const isMatch = memoryDeck[firstIndex].pairId === memoryDeck[index].pairId;
    memoryTimer.current = window.setTimeout(() => {
      if (isMatch) {
        setMemoryMatched((current) => new Set(current).add(memoryDeck[index].pairId));
        setMemoryFact(memoryDeck[index].fact);
      }
      setMemoryOpen([]);
      memoryTimer.current = null;
    }, isMatch ? 420 : 780);
  };

  const activeArcadeGame = ARCADE_GAMES.find((item) => item.id === game) ?? ARCADE_GAMES[0];

  return (
    <TranslationBoundary locale={locale}><div className="games-app" data-game={game}>
      <div className="games-sidebar">
        <div className="games-logo"><PixelIcon kind="game" /><span>Desk<br />Arcade</span></div>
        <nav ref={gamesMenuRef} className="games-menu" aria-label="Choose an arcade game">
          {ARCADE_GAMES.map((item) => (
            <button
              key={item.id}
              type="button"
              data-game-id={item.id}
              className={game === item.id ? "is-active" : ""}
              onClick={() => setGame(item.id)}
              aria-pressed={game === item.id}
            >
              <span className="game-mini-icon" aria-hidden="true"><System7Icon kind={item.icon} /></span>
              {item.label}
            </button>
          ))}
        </nav>
        {gamesMenuCue !== "none" && (
          <span className="games-scroll-cue" aria-hidden="true">
            {gamesMenuCue === "right" ? "MORE →" : gamesMenuCue === "left" ? "← GAMES" : "↔ GAMES"}
          </span>
        )}
        <p>Seven tiny distractions.<br />Local only. No tracking.<br />One suspicious password.</p>
      </div>
      <section ref={gameStageRef} className="game-stage">
        <div className="arcade-now-playing" aria-live="polite">
          <span><i aria-hidden="true" /> NOW PLAYING</span>
          <strong>{activeArcadeGame.label}</strong>
          <p>{activeArcadeGame.description}</p>
          <b aria-hidden="true"><System7Icon kind={activeArcadeGame.icon} /></b>
        </div>
        {game === "minefield" && (
          <>
            <div className="game-header">
              <div><span>DESK ACCESSORY 01</span><h3>Minefield</h3></div>
              <div className={`game-face game-face--${mineStatus}`}>{mineStatus === "lost" ? "x_x" : mineStatus === "won" ? "^_^" : ":)"}</div>
            </div>
            <div className="mine-toolbar">
              <strong aria-live="polite">{mineStatus === "playing"
                ? locale === "zh-CN" ? `${10 - flagged} 枚地雷` : locale === "zh-TW" ? `${10 - flagged} 顆地雷` : `${10 - flagged} mines`
                : mineStatus === "won" ? "You cleared it!" : "A small administrative error."}</strong>
              <button
                type="button"
                className={flagMode ? "is-active" : ""}
                aria-pressed={flagMode}
                onClick={() => setFlagMode((current) => !current)}
              >F Flag mode</button>
              <button type="button" onClick={resetMines}>New field</button>
            </div>
            <div className="minefield" role="group" aria-label="Minefield game board">
              {minefield.map((cell, index) => (
                <button
                  key={index}
                  className={`${cell.revealed ? "is-revealed" : ""}${cell.mine && cell.revealed ? " is-mine" : ""}`}
                  onClick={() => revealCell(index)}
                  onContextMenu={(event) => { event.preventDefault(); flagCell(index); }}
                  aria-label={mineCellLabel(locale, cell, index)}
                >
                  {cell.flagged && !cell.revealed ? "F" : cell.revealed && cell.mine ? "*" : cell.revealed && cell.adjacent ? cell.adjacent : ""}
                </button>
              ))}
            </div>
            <p className="game-help">Click to reveal · right-click or use Flag mode to mark a mine</p>
          </>
        )}
        {game === "puzzle" && (
          <>
            <div className="game-header">
              <div><span>DESK ACCESSORY 02</span><h3>Sliding Puzzle</h3></div>
              <div className="puzzle-counter">{moves}<small>MOVES</small></div>
            </div>
            <div className="puzzle-message" role="status">{puzzleSolved ? "Solved. The Macintosh is impressed." : "Put the numbers back in order."}</div>
            <div
              className="puzzle-board"
              role="group"
              tabIndex={0}
              onKeyDown={movePuzzleWithArrow}
              aria-label="Sliding number puzzle. Use arrow keys to move the empty space."
            >
              {puzzle.map((tile, index) => (
                <button
                  key={`${tile}-${index}`}
                  className={tile === 0 ? "is-empty" : ""}
                  onClick={() => moveTile(index)}
                  disabled={tile === 0 || !canMovePuzzleTile(index)}
                  aria-label={tile === 0
                    ? locale === "zh-CN" ? "空白拼图位置" : locale === "zh-TW" ? "空白拼圖位置" : "Empty puzzle space"
                    : locale === "zh-CN" ? `拼图块 ${tile}` : locale === "zh-TW" ? `拼圖塊 ${tile}` : `Puzzle tile ${tile}`}
                >
                  {tile || ""}
                </button>
              ))}
            </div>
            <div className="puzzle-actions"><button className="mac-button" onClick={resetPuzzle}>Shuffle again</button></div>
          </>
        )}
        {game === "samword" && (
          <>
            <div className="game-header">
              <div><span>PROFILE ACCESSORY 03</span><h3>SamWord</h3></div>
              <div className="word-counter">{wordIndex + 1}<small>OF {SAM_WORDS.length}</small></div>
            </div>
            <div className="samword-clue"><strong>CLUE</strong><span>{activeWord.clue}</span></div>
            <div className="samword-grid" role="group" aria-label="SamWord guesses">
              {Array.from({ length: 6 }, (_, rowIndex) => {
                const guess = wordGuesses[rowIndex] ?? "";
                const score = guess ? scoreWordGuess(guess, activeWord.answer) : [];
                return (
                  <div
                    className="samword-row"
                    key={rowIndex}
                    role={guess ? "img" : undefined}
                    aria-label={guess ? describeWordGuess(locale, guess, score) : undefined}
                  >
                    {Array.from({ length: activeWord.answer.length }, (_, columnIndex) => (
                      <span
                        className={score[columnIndex] ? `is-${score[columnIndex]}` : ""}
                        key={columnIndex}
                        aria-hidden={guess ? true : undefined}
                      >
                        {guess[columnIndex] ?? ""}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
            <form className="samword-form" onSubmit={submitWord}>
              <input
                value={wordInput}
                onChange={(event) => setWordInput(event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, activeWord.answer.length))}
                maxLength={activeWord.answer.length}
                aria-label="Six-letter guess"
                inputMode="text"
                spellCheck={false}
                autoComplete="off"
                disabled={wordSolved || wordGuesses.length >= 6}
              />
              <button className="mac-button" type="submit" disabled={wordSolved || wordGuesses.length >= 6}>Enter</button>
            </form>
            <div className="samword-file-actions" aria-label="SamWord file navigation">
              <button className="mac-button" type="button" onClick={previousWord}>Previous file</button>
              <button className="mac-button" type="button" onClick={nextWord}>Next file</button>
            </div>
            <p className={`samword-message${wordSolved ? " is-solved" : ""}`} role="status">{localiseGameMessage(locale, wordMessage)}</p>
          </>
        )}
        {game === "memory" && (
          <>
            <div className="game-header">
              <div><span>PROFILE ACCESSORY 04</span><h3>Profile Pairs</h3></div>
              <div className="puzzle-counter">{memoryTurns}<small>TURNS</small></div>
            </div>
            <p className="memory-intro">Match each clue to the part of Samuel’s profile it belongs to.</p>
            <div className="memory-grid" role="group" aria-label="Samuel profile matching game">
              {memoryDeck.map((card, index) => {
                const visible = memoryOpen.includes(index) || memoryMatched.has(card.pairId);
                return (
                  <button
                    key={`${card.pairId}-${index}`}
                    className={`${visible ? "is-visible" : ""}${memoryMatched.has(card.pairId) ? " is-matched" : ""}`}
                    onClick={() => flipMemory(index)}
                    aria-label={visible
                      ? translateText(locale, card.label)
                      : locale === "zh-CN" ? `隐藏的个人资料卡 ${index + 1}` : locale === "zh-TW" ? `隱藏的個人資料卡 ${index + 1}` : `Hidden profile card ${index + 1}`}
                  >
                    <span>{visible ? card.label : "?"}</span>
                  </button>
                );
              })}
            </div>
            <div className="memory-status">
              <span aria-live="polite">{memoryMatched.size === MEMORY_PAIRS.length
                ? "You now know suspiciously much about Samuel."
                : locale === "zh-CN" ? `已找到 ${memoryMatched.size} / ${MEMORY_PAIRS.length} 组配对` : locale === "zh-TW" ? `已找到 ${memoryMatched.size} / ${MEMORY_PAIRS.length} 組配對` : `${memoryMatched.size} of ${MEMORY_PAIRS.length} connections found`}</span>
              <button className="mac-button" onClick={resetMemory}>Shuffle cards</button>
            </div>
            {memoryFact && (
              <p className="memory-fact" role="status">{memoryFact}</p>
            )}
          </>
        )}
        {game === "snake" && <SnakeGame locale={locale} />}
        {game === "brickbreaker" && <BrickBreakerGame locale={locale} />}
        {game === "spectrum" && <HplcPeakDock locale={locale} />}
      </section>
    </div></TranslationBoundary>
  );
}

function SecretApp({ locale }: { locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="secret-app">
      <div className="secret-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="flying-toaster" aria-hidden="true"><span /><i /><b /></div>
      <PixelIcon kind="secret" />
      <span className="eyebrow">UNREASONABLE CORNER DETECTED</span>
      <h3>Welcome, power user.</h3>
      <p>You found the part of the portfolio that contributes nothing to conversion metrics.</p>
      <blockquote>“The best interface is one with at least one completely unnecessary secret.”</blockquote>
      <small>System note: OpenClaw did not, in fact, complete Samuel’s entire life. Results remain inconclusive.</small>
    </div></TranslationBoundary>
  );
}

// Generic service pictograms describe the function; product names keep their own identity.
const SERVICE_ICONS: Record<string, System7IconKind> = {
  PX: "network", AI: "computer", DEV: "document", KVM: "computer",
  NPM: "network", WG: "shield", DNS: "shield", F2B: "shield", RDP: "computer",
  CT: "controls", CI: "tasks", HP: "folder", JOB: "calendar", SQL: "network",
  CO2: "chart", HA: "network", RAID: "network", NAS: "folder", NC: "folder",
  JF: "photos", KX: "book", ERP: "briefcase", ODO: "controls",
};
function ServiceIcon({ code }: { code: string }) {
  return <span className="service-pixel-icon" aria-hidden="true"><System7Icon kind={SERVICE_ICONS[code] ?? "computer"} /></span>;
}

function LabApp({ locale }: { locale: Locale }) {
  const openProject = useContext(ProjectOpenContext);
  const [filter, setFilter] = useState("All");
  const services = [
    { group: "Compute", code: "PX", name: "Proxmox", host: "Virtualisation cluster", description: "Runs isolated VMs and Linux containers for the heavier parts of the lab." },
    { group: "Compute", code: "AI", name: "Local AI GPU", host: "Private GPU workspace", description: "Local model training and inference, with Open WebUI for everyday interaction." },
    { group: "Compute", code: "DEV", name: "Code Servers", host: "Browser IDEs", description: "GPU-connected VS Code environments for remote development and experiments." },
    { group: "Compute", code: "KVM", name: "GLKVM", host: "Physical console", description: "Out-of-band keyboard, video and mouse access when a server stops responding." },
    { group: "Network", code: "NPM", name: "Nginx Proxy Manager", host: "TLS gateway", description: "Routes public domains to private services and manages HTTPS certificates." },
    { group: "Network", code: "WG", name: "WireGuard", host: "Private access", description: "Encrypted remote entry to the home network without exposing internal tools." },
    { group: "Network", code: "DNS", name: "Pi-hole", host: "Network protection", description: "Network-wide DNS filtering for adverts, trackers and unwanted domains." },
    { group: "Network", code: "F2B", name: "Fail2ban", host: "Intrusion response", description: "Watches service logs and automatically blocks repeated hostile requests." },
    { group: "Network", code: "RDP", name: "Guacamole", host: "Remote desktop", description: "Browser-based access to SSH, VNC and remote desktop sessions." },
    { group: "Operations", code: "CT", name: "Portainer", host: "Container operations", description: "A visual control room for container health, deployments, images and networks." },
    { group: "Operations", code: "CI", name: "GitHub Actions Runner", host: "Self-hosted CI", description: "Runs deployment jobs across Samuel’s own hardware, coordinates different CPU architectures and avoids substantial hosted-runner costs." },
    { group: "Operations", code: "HP", name: "Homepage", host: "Service directory", description: "A documented directory for service links and operational notes." },
    { group: "Operations", code: "JOB", name: "Ofelia", host: "Job scheduler", description: "Runs automated database backups and recurring maintenance inside Docker." },
    { group: "Data", code: "SQL", name: "PostgreSQL", host: "Application data", description: "Stores environmental telemetry, product data and historical measurements." },
    { group: "Data", code: "CO2", name: "Aranet Air Quality", host: "BLE → SQL → Grafana", description: "Documents a Bluetooth-to-dashboard path for CO₂, temperature, humidity and pressure." },
    { group: "Data", code: "HA", name: "Home Assistant", host: "Automation hub", description: "Connects sensors, energy data and smart-home devices into one event-driven system." },
    { group: "Storage", code: "RAID", name: "Storage pool", host: "Private fleet inventory", description: "RAID storage for media and datasets, alongside database backup and recovery tooling. A successful restore still needs to be tested." },
    { group: "Storage", code: "NAS", name: "Synology Cloud", host: "Files & photos", description: "Private file sync, photo management and resilient network storage." },
    { group: "Storage", code: "NC", name: "Nextcloud", host: "Private cloud", description: "Self-hosted document access and synchronisation across personal devices." },
    { group: "Media", code: "JF", name: "Jellyfin", host: "Home cinema", description: "Documents a private media-library and playback-monitoring service." },
    { group: "Media", code: "KX", name: "Kiwix", host: "Offline knowledge", description: "Serves offline Wikipedia and reference libraries without an internet connection." },
    { group: "Apps", code: "ERP", name: "Frappe / ERPNext", host: "Business systems lab", description: "A containerised environment for exploring open-source ERP and workflow software." },
    { group: "Apps", code: "ODO", name: "Odoo Lab", host: "Application sandbox", description: "A separate test stack for business application and database experiments." },
  ];
  const groups = ["All", "Compute", "Network", "Operations", "Data", "Storage", "Media", "Apps"];
  const visibleServices = filter === "All" ? services : services.filter((service) => service.group === filter);

  return (
    <TranslationBoundary locale={locale}><div className="lab-app">
      <header className="document-header">
        <div><span className="eyebrow">PERSONAL INFRASTRUCTURE</span><h3>A small internet, built at home.</h3></div>
        <button className="s7-button" onClick={() => openProject?.("home-automation-stack")}>Explore service map ↗</button>
      </header>
      <div className="lab-summary">
        <p>
          My home lab brings together local AI, private storage, environmental sensors and everyday applications. Proxmox and Docker keep experiments separate, while a shared network connects the services. The project map explains six of those services and lets you explore what happens when a backup or dependency fails.
        </p>
        <dl>
          <div><dt>Interactive map</dt><dd>6 services</dd></div>
          <div><dt>Compute</dt><dd>Proxmox + Docker</dd></div>
          <div><dt>Database backups</dt><dd>Daily schedule</dd></div>
          <div><dt>Service catalogue</dt><dd>{services.length}</dd></div>
        </dl>
      </div>
      <div className="lab-filters" role="group" aria-label="Filter infrastructure">
        {groups.map((group) => (
          <button key={group} className="s7-button" aria-pressed={filter === group} onClick={() => setFilter(group)}>{group}</button>
        ))}
      </div>
      <div className="service-grid">
        {visibleServices.map((service) => (
          <article className="service-card" key={service.name}>
            <ServiceIcon code={service.code} />
            <div className="service-card__copy">
              <div><h4>{service.name}</h4></div>
              <strong>{service.host}</strong>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div></TranslationBoundary>
  );
}

function ScrapbookApp({ locale }: { locale: Locale }) {
  const interests = [
    {
      title: "Hiking & climbing",
      summary: "A pair of boots, a windbreaker, and somewhere new.",
      detail: "I like the unhurried conversations that happen on a long walk as much as the view at the end. A good route leaves enough room for curiosity, a little discomfort and a shared story on the way home.",
    },
    {
      title: "Photography",
      summary: "Former professional wedding photographer; now the camera is for nature, friends, and the smile on people’s faces.",
      detail: "Weddings taught me to notice the quiet person at the edge of the room, anticipate moments without interrupting them and help people feel comfortable. I stopped working professionally so photography could feel playful again.",
    },
    {
      title: "Euphonium",
      summary: "Played with King’s College London Brass Band at UniBrass in 2021 and 2022, including a fourth-place result.",
      detail: "Competitive brass banding is a peculiar combination of precision and trust: an entire band breathes together, listens closely and makes one sound. I love the discipline, but even more the feeling of contributing to someone else’s best performance.",
    },
    {
      title: "Musical theatre",
      summary: "Three productions across performance and drums, including one self-directed, written and composed.",
      detail: "Months of singing, dancing, line-learning and rehearsal collapse into a few seconds on stage. That slightly unreasonable exchange is exactly the appeal—and it is difficult to beat the energy of building something live with a cast and crew.",
    },
    {
      title: "Multiculturalism",
      summary: "Singapore, Shanghai, and London shape how I work.",
      detail: "Moving between cultures made me attentive to what a room assumes but never says aloud. It is useful in product work, teaching and friendship: listen first, translate carefully and leave space for another interpretation.",
    },
    {
      title: "Teaching & people",
      summary: "I am energised by rooms full of people. One student I taught Python later earned an offer from Microsoft; their success remains one of my proudest outcomes.",
      detail: "I care less about being the cleverest person in a room than helping the room become more capable. The best teaching moment is when someone stops needing the teacher—and then goes somewhere neither of you expected.",
    },
    {
      title: "Curiosity",
      summary: "Science, systems, music, people and an unreasonable number of random facts. Being a generalist is the point.",
      detail: "A satisfying evening can move from statistical thermodynamics to theatre orchestration, network topology and why a stranger chose their career. The connections between subjects are usually where the useful ideas hide.",
    },
    {
      title: "First software",
      summary: "A clickable Visual Basic periodic table built for IB Chemistry. It found almost no users and revealed exactly how much I loved making software.",
      detail: "Nobody asked for it and almost nobody used it. Still, making an idea respond to a click was the revelation: software could turn private curiosity into something another person might explore.",
    },
    {
      title: "Hardware catalogue",
      summary: "A private, evolving systems inventory—and an electricity bill that has become a recurring monitoring concern.",
      detail: "The home lab grew from hand-built servers into a mix of Proxmox machines, containers and CPU architectures. Losing a database was a memorable lesson: a backup schedule is only part of the job; you also need to practise restoring it.",
    },
  ];
  const [openInterest, setOpenInterest] = useState<number | null>(null);

  return (
    <TranslationBoundary locale={locale}><div className="scrapbook-app">
      <header className="document-header"><div><span className="eyebrow">INTERESTS &amp; NOTES</span><h3>The creative life behind the technical work.</h3></div><PixelIcon kind="photos" /></header>
      <p className="scrapbook-intro">Open a clipping to read the story behind it.</p>
      <div className="scrap-grid">
        {interests.map((interest, index) => {
          const isOpen = openInterest === index;
          const titleId = `interest-title-${index}`;
          const actionId = `interest-action-${index}`;
          const panelId = `interest-story-${index}`;

          return (
            <article
              key={interest.title}
              className={`scrap-note scrap-note--${(index % 3) + 1}${isOpen ? " is-open" : ""}`}
              aria-labelledby={titleId}
            >
              <span className="scrap-note__number" aria-hidden="true">{index + 1}</span>
              <h4 id={titleId}>{interest.title}</h4>
              <p className="scrap-note__summary">{interest.summary}</p>
              <div className="scrap-note__story" id={panelId} role="region" aria-labelledby={titleId} hidden={!isOpen}>
                <p>{interest.detail}</p>
              </div>
              <button
                className="scrap-note__toggle s7-button"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-labelledby={`${titleId} ${actionId}`}
                onClick={() => setOpenInterest(isOpen ? null : index)}
              >
                <span id={actionId}>{isOpen ? "Close note" : "Open note"}</span>
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
            </article>
          );
        })}
      </div>
    </div></TranslationBoundary>
  );
}

function AppContent({
  id,
  openApp,
  locale,
  initialProjectSlug,
  initialProjectDemo,
  onProjectBack,
  onProjectGraph,
  active,
}: {
  id: AppId;
  openApp: (id: AppId) => void;
  locale: Locale;
  initialProjectSlug?: string;
  initialProjectDemo?: boolean;
  onProjectBack: () => void;
  onProjectGraph: (slug: string) => void;
  active: boolean;
}) {
  switch (id) {
    case "about": return <AboutApp openApp={openApp} locale={locale} />;
    case "coverd": return <CoverdApp locale={locale} />;
    case "experience": return <ExperienceApp locale={locale} />;
    case "projects": return <ProjectExplorer active={active} locale={locale} onOpenApp={openApp} />;
    case "project": return initialProjectSlug ? <ProjectDocument key={initialProjectSlug} slug={initialProjectSlug} locale={locale} initialDemo={initialProjectDemo} onOpenApp={openApp} onBack={onProjectBack} onGraph={onProjectGraph} /> : null;
    case "sidequest": return <SideQuestCabinetApp locale={locale} />;
    case "skills": return <SkillsApp locale={locale} />;
    case "education": return <EducationApp locale={locale} />;
    case "documents": return <DocumentsApp locale={locale} />;
    case "games": return <GamesApp openApp={openApp} locale={locale} />;
    case "desk": return <ProductivityApps app="desk" openApp={openApp} locale={locale} />;
    case "notepad": return <ProductivityApps app="notepad" openApp={openApp} locale={locale} />;
    case "sketch": return <ProductivityApps app="sketch" openApp={openApp} locale={locale} />;
    case "tasks": return <ProductivityApps app="tasks" openApp={openApp} locale={locale} />;
    case "focus": return <ProductivityApps app="focus" openApp={openApp} locale={locale} />;
    case "calendar": return <ProductivityApps app="calendar" openApp={openApp} locale={locale} />;
    case "calculator": return <ProductivityApps app="calculator" openApp={openApp} locale={locale} />;
    case "converter": return <ProductivityApps app="converter" openApp={openApp} locale={locale} />;
    case "palette": return <ProductivityApps app="palette" openApp={openApp} locale={locale} />;
    case "orbitals": return <OrbitalLab locale={locale} active={active} />;
    case "contact": return <ContactApp openApp={openApp} locale={locale} />;
    case "lab": return <LabApp locale={locale} />;
    case "scrapbook": return <ScrapbookApp locale={locale} />;
    case "secret": return <SecretApp locale={locale} />;
  }
}

export default function SystemSevenDesktop({
  initialApp = "about",
  skipBoot = false,
  initialLocale = "en-GB",
  initialProjectSlug,
  initialProjectDemo = false,
}: {
  initialApp?: AppId;
  skipBoot?: boolean;
  initialLocale?: Locale;
  initialProjectSlug?: string;
  initialProjectDemo?: boolean;
}) {
  const initialProject = projects.find((project) => project.slug === initialProjectSlug);
  const initialWindowId: AppId = initialApp === "projects" && initialProject ? "project" : initialApp;
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [windows, setWindows] = useState(() =>
    INITIAL_WINDOWS.map((windowState) => ({
      ...windowState,
      title: windowState.id === "project" && initialProject ? initialProject.title : windowState.title,
      open: windowState.id === initialWindowId || (initialWindowId === "project" && windowState.id === "projects"),
      // Direct project and SideQuest permalinks are working surfaces rather
      // than small desktop previews. Give their interactive evidence views the
      // available canvas immediately; apps opened later from the desktop keep
      // their classic floating-window sizes.
      maximized: ["project", "projects", "sidequest", "orbitals"].includes(windowState.id)
        && initialWindowId === windowState.id,
    })),
  );
  const [activeId, setActiveId] = useState<AppId>(initialWindowId);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [openMenu, setOpenMenu] = useState<SystemMenuId | null>(null);
  const [booting, setBooting] = useState(!skipBoot);
  const [bootMessageIndex, setBootMessageIndex] = useState(0);
  const [clock, setClock] = useState("--:--");
  const [pattern, setPattern] = useState<DesktopPattern>("classic");
  const [finderOpen, setFinderOpen] = useState(false);
  const [requestedProjectSlug, setRequestedProjectSlug] = useState(initialProjectSlug);
  const [requestedProjectDemo, setRequestedProjectDemo] = useState(initialProjectDemo);
  const [memoryMagic, setMemoryMagic] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileGuide, setMobileGuide] = useState(false);
  const zCounter = useRef(Math.max(...INITIAL_WINDOWS.map((item) => item.z)));
  const dragState = useRef<{ id: AppId; offsetX: number; offsetY: number } | null>(null);
  const resizeState = useRef<{
    id: AppId;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    originX: number;
    originY: number;
  } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const menuButtonRefs = useRef<Partial<Record<SystemMenuId, HTMLButtonElement | null>>>({});
  const mobileGuideButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusByApp = useRef<Partial<Record<AppId, HTMLElement>>>({});
  const routeStateByApp = useRef<Partial<Record<AppId, { search: string; hash: string }>>>({
    projects: { search: "?view=map", hash: "" },
    project: { search: initialProject ? `?project=${encodeURIComponent(initialProject.slug)}${initialProjectDemo ? "&view=demo" : ""}` : "", hash: "" },
  });
  const finderReturnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadPattern = () => {
      try {
        const saved = window.localStorage.getItem(PATTERN_STORAGE_KEY);
        setPattern(saved === "blue" || saved === "paper" ? saved : "classic");
      } catch {
        // Desktop appearance still works for this visit without storage.
      }
    };
    const syncPattern = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === PATTERN_STORAGE_KEY || event.key === null)) loadPattern();
    };
    loadPattern();
    window.addEventListener("storage", syncPattern);
    return () => window.removeEventListener("storage", syncPattern);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const pathLocale = normaliseLocale(window.location.pathname.split("/")[1]);
    const queryLocale = normaliseLocale(new URLSearchParams(window.location.search).get("lang"));
    let storedLocale: Locale | null = null;
    try {
      storedLocale = normaliseLocale(window.localStorage.getItem("samuel-system7-locale"));
    } catch {
      // Explicit route and default locale still work when storage is unavailable.
    }
    // An explicit locale path is canonical and must not be overridden by a
    // stale preference from another route. Unlocalised routes may still use
    // ?lang= and then the stored preference.
    if (pathLocale) setLocale(pathLocale);
    else if (queryLocale) setLocale(queryLocale);
    else if (initialLocale === "en-GB" && storedLocale) setLocale(storedLocale);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem("samuel-system7-locale", locale);
    } catch {
      // Language switching remains available for this session.
    }
  }, [locale]);

  useEffect(() => {
    const clampWindowsToViewport = () => {
      setWindows((current) => {
        let changed = false;
        const next = current.map((item) => {
          const fitted = fitWindowToViewport(item, window.innerWidth, window.innerHeight);
          if (fitted.width === item.width && fitted.height === item.height && fitted.x === item.x && fitted.y === item.y) return item;
          changed = true;
          return fitted;
        });
        return changed ? next : current;
      });
    };
    clampWindowsToViewport();
    const pointerMode = window.matchMedia("(pointer: coarse)");
    pointerMode.addEventListener("change", clampWindowsToViewport);
    window.addEventListener("resize", clampWindowsToViewport);
    return () => {
      pointerMode.removeEventListener("change", clampWindowsToViewport);
      window.removeEventListener("resize", clampWindowsToViewport);
    };
  }, []);

  const completeBoot = useCallback(() => {
    try {
      window.sessionStorage.setItem("samuel-system7-boot", "seen");
    } catch {
      // The boot still completes when storage is unavailable.
    }
    setBooting(false);
  }, []);

  useEffect(() => {
    if (skipBoot) return;
    try {
      if (window.sessionStorage.getItem("samuel-system7-boot") === "seen") setBooting(false);
    } catch {
      // Keep the normal startup sequence when storage is unavailable.
    }
  }, [skipBoot]);

  useEffect(() => {
    if (!booting) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBootMessageIndex(0);
    const finishTimer = window.setTimeout(completeBoot, reduceMotion ? 700 : BOOT_DURATION);
    const messageTimer = reduceMotion
      ? null
      : window.setInterval(
          () => setBootMessageIndex((current) => Math.min(current + 1, BOOT_MESSAGES.length - 1)),
          BOOT_DURATION / BOOT_MESSAGES.length,
        );
    return () => {
      window.clearTimeout(finishTimer);
      if (messageTimer) window.clearInterval(messageTimer);
    };
  }, [booting, completeBoot]);

  useEffect(() => {
    if (!openMenu) return;
    const activeMenu = openMenu;
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpenMenu(null);
      window.requestAnimationFrame(() => menuButtonRefs.current[activeMenu]?.focus());
    };
    window.addEventListener("keydown", closeMenus);
    return () => window.removeEventListener("keydown", closeMenus);
  }, [openMenu]);

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, [locale]);

  useEffect(() => {
    const isMobile = isCompactCanvasViewport();
    if (!isMobile) return;
    try {
      if (window.sessionStorage.getItem("samuel-mobile-window-guide") !== "seen") setMobileGuide(true);
    } catch {
      setMobileGuide(true);
    }
  }, []);

  useEffect(() => {
    // The guide is not mounted while the boot screen owns the page. Wait for
    // that early-return branch to finish before moving keyboard focus.
    if (!mobileGuide || booting) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => mobileGuideButtonRef.current?.focus());
    const handleGuideKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        // This lightweight modal has one action. Keep keyboard users inside it
        // until they acknowledge or dismiss the guide.
        event.preventDefault();
        mobileGuideButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Escape") return;
      try {
        window.sessionStorage.setItem("samuel-mobile-window-guide", "seen");
      } catch {
        // The guide still closes when storage is unavailable.
      }
      setMobileGuide(false);
    };
    window.addEventListener("keydown", handleGuideKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleGuideKeyDown);
      const restoreTarget = previouslyFocused
        && previouslyFocused !== document.body
        && previouslyFocused.isConnected
        ? previouslyFocused
        : document.querySelector<HTMLButtonElement>(".apple-menu");
      restoreTarget?.focus();
    };
  }, [booting, mobileGuide]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const resize = resizeState.current;
      if (resize && !isCompactCanvasViewport()) {
        setWindows((current) => current.map((windowState) => {
          if (windowState.id !== resize.id || windowState.maximized) return windowState;
          const maximumWidth = Math.max(320, window.innerWidth - resize.originX - (window.innerWidth <= 900 ? 10 : 5));
          const maximumHeight = Math.max(240, window.innerHeight - resize.originY - 8);
          return {
            ...windowState,
            width: Math.max(320, Math.min(maximumWidth, resize.startWidth + event.clientX - resize.startX)),
            height: Math.max(240, Math.min(maximumHeight, resize.startHeight + event.clientY - resize.startY)),
          };
        }));
        return;
      }
      const drag = dragState.current;
      if (!drag || isCompactCanvasViewport()) return;
      setWindows((current) =>
        current.map((windowState) =>
          windowState.id === drag.id
            ? {
                ...windowState,
                x: Math.max(4, Math.min(window.innerWidth - 180, event.clientX - drag.offsetX)),
                y: Math.max(window.matchMedia("(pointer: coarse)").matches ? 50 : 26, Math.min(window.innerHeight - 80, event.clientY - drag.offsetY)),
              }
            : windowState,
        ),
      );
    };
    const stop = () => {
      dragState.current = null;
      resizeState.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const activeTitle = windows.find((item) => item.id === activeId && item.open)?.title ?? "Finder";
  const activeLocaleOption = localeOptions.find((option) => option.locale === locale) ?? localeOptions[0];
  const openWindows = useMemo(() => windows.filter((item) => item.open), [windows]);
  const selectedDesktopItem = DESKTOP_ICONS.find((item) => item.id === selectedIcon);

  const syncAddress = useCallback((id: AppId, nextLocale = locale, forceLocalePrefix = false) => {
    const currentUrl = new URL(window.location.href);
    const currentSearch = new URLSearchParams(currentUrl.search);
    currentSearch.delete("lang");
    const currentRouteState = {
      search: currentSearch.size ? `?${currentSearch.toString()}` : "",
      hash: currentUrl.hash,
    };

    if (activeId === "projects" || activeId === "project" || activeId === "sidequest") {
      routeStateByApp.current[activeId] = currentRouteState;
    }

    // The secret window is an overlay rather than a public destination. Keep
    // the visible page address while still allowing its language to change.
    if (id === "secret" && !forceLocalePrefix) return;

    const currentLocale = normaliseLocale(currentUrl.pathname.split("/")[1]);
    const localePrefix = forceLocalePrefix || currentLocale || nextLocale !== "en-GB"
      ? `/${localeSlug(nextLocale)}`
      : "";
    const currentPublicRoute = currentUrl.pathname
      .split("/")
      .filter(Boolean)
      .filter((segment, index) => !(index === 0 && normaliseLocale(segment)))
      .join("/");
    const appRoute = id === "secret" ? currentPublicRoute : APP_ROUTES[id];
    const nextPath = appRoute ? `${localePrefix}/${appRoute}` : localePrefix || "/";
    const savedRouteState = id === activeId ? currentRouteState : routeStateByApp.current[id];
    const nextSearch = id === "project" ? routeStateByApp.current.project?.search ?? "" : id === "projects" ? savedRouteState?.search ?? "" : "";
    const nextHash = id === "sidequest" ? savedRouteState?.hash ?? "" : (id === "experience" || id === "education") && currentPublicRoute === appRoute ? currentUrl.hash : "";
    const nextAddress = `${nextPath}${nextSearch}${nextHash}`;

    if (`${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}` !== nextAddress) {
      // Native history replacement keeps the System 7 desktop mounted. A
      // Next router navigation would recreate it and discard open windows.
      window.history.replaceState(window.history.state, "", nextAddress);
    }

    const nextWindowTitle = INITIAL_WINDOWS.find((item) => item.id === id)?.title;
    if (nextWindowTitle) {
      const nextUrl = new URL(nextAddress, currentUrl.origin);
      const requestedView = nextUrl.searchParams.get("view");
      const requestedSlug = nextUrl.searchParams.get("project");
      const selectedSlug = nextUrl.searchParams.get("selected");
      const graphView = requestedView === "map"
        || (!requestedSlug && !["guided", "list", "files"].includes(requestedView ?? ""));
      const requestedProject = (id === "project" || id === "projects") && !graphView
        ? projects.find((project) => project.slug === requestedSlug)
          ?? projects.find((project) => project.slug === selectedSlug)
        : undefined;
      const archiveTitle = translateText(nextLocale, "Project Archive");
      const pageTitle = id === "projects" || id === "project"
        ? requestedProject
          ? `${translateText(nextLocale, requestedProject.title)} — ${archiveTitle}`
          : graphView ? translateText(nextLocale, "Knowledge graph") : archiveTitle
        : translateText(nextLocale, nextWindowTitle);
      const translatedTitle = `${pageTitle} · Samuel Zhang`;
      if (document.title !== translatedTitle) document.title = translatedTitle;
      const deskAccessoryIds: AppId[] = ["notepad", "sketch", "tasks", "focus", "calendar", "calculator", "converter", "palette"];
      const metadataId: AppId = deskAccessoryIds.includes(id) ? "desk" : id;
      const sourceDescription = requestedProject?.summary ?? DESKTOP_ICONS.find((item) => item.id === metadataId)?.description
        ?? (metadataId === "sidequest"
          ? "A rain-soaked running hackathon field journal: the runner-only build rule, 44 team kilometres, a 100+ person track community and second-place app SideQuest."
          : metadataId === "orbitals" ? "Explore atomic orbitals in a fast, browser-local ASCII laboratory." : "");
      const translatedDescription = translateText(nextLocale, sourceDescription);
      const setMeta = (attribute: "name" | "property", key: string, value: string) => {
        let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute(attribute, key);
          document.head.appendChild(meta);
        }
        if (meta.content !== value) meta.content = value;
      };
      setMeta("name", "description", translatedDescription);
      setMeta("property", "og:title", translatedTitle);
      setMeta("property", "og:description", translatedDescription);
      setMeta("property", "og:locale", nextLocale.replace("-", "_"));
      setMeta("name", "twitter:title", translatedTitle);
      setMeta("name", "twitter:description", translatedDescription);
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      const canonicalUrl = new URL(nextPath, window.location.origin);
      if (requestedProject) canonicalUrl.searchParams.set("project", requestedProject.slug);
      const canonicalHref = canonicalUrl.href;
      if (canonical.href !== canonicalHref) canonical.href = canonicalHref;
      setMeta("property", "og:url", canonicalHref);
    }
  }, [activeId, locale]);

  useEffect(() => {
    const pathHasLocale = Boolean(normaliseLocale(window.location.pathname.split("/")[1]));
    const sync = () => syncAddress(activeId, locale, pathHasLocale || locale !== "en-GB");
    sync();
    const frame = window.requestAnimationFrame(sync);
    const headObserver = new MutationObserver(sync);
    // Next may stream or replace title/meta nodes after hydration. Watching
    // structural/text changes keeps the locale metadata stable without
    // reacting to our own guarded attribute updates.
    headObserver.observe(document.head, { childList: true, characterData: true, subtree: true });
    window.addEventListener("samuel-project-route-change", sync);
    return () => {
      window.removeEventListener("samuel-project-route-change", sync);
      window.cancelAnimationFrame(frame);
      headObserver.disconnect();
    };
  }, [activeId, locale, syncAddress]);

  const focusWindow = (id: AppId) => {
    const nextZ = ++zCounter.current;
    setActiveId(id);
    setWindows((current) => current.map((item) => item.id === id ? { ...item, z: nextZ } : item));
    syncAddress(id);
  };

  const openApp = useCallback((id: AppId) => {
    if (document.activeElement instanceof HTMLElement) returnFocusByApp.current[id] = document.activeElement;
    const nextZ = ++zCounter.current;
    setWindows((current) => current.map((item) => item.id === id ? { ...item, open: true, z: nextZ } : item));
    setActiveId(id);
    setSelectedIcon(id);
    setOpenMenu(null);
    syncAddress(id);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-app-id="${id}"] .window-close`)?.focus();
    });
  }, [syncAddress]);

  const openProjectDocument = useCallback((slug: string) => {
    const project = projects.find((item) => item.slug === slug);
    if (!project) return;
    setRequestedProjectSlug(slug);
    setRequestedProjectDemo(false);
    routeStateByApp.current.project = { search: `?project=${encodeURIComponent(slug)}`, hash: "" };
    setWindows(current => current.map(item => item.id === "project" ? { ...item, title: project.title } : item));
    // A single project document shares the desktop's native move, resize and
    // close controls. The archive remains open behind it with its graph state.
    if (activeId === "project") {
      const url = new URL(window.location.href);
      url.searchParams.delete("view"); url.searchParams.delete("node"); url.searchParams.set("project", slug);
      window.history.pushState(window.history.state, "", `${url.pathname}${url.search}`);
    }
    const previousAddress = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    openApp("project");
    const nextAddress = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (previousAddress !== nextAddress) {
      window.history.replaceState(window.history.state, "", previousAddress);
      window.history.pushState(window.history.state, "", nextAddress);
    }
  }, [activeId, openApp]);

  const returnToProjects = (slug?: string) => {
    routeStateByApp.current.projects = { search: slug ? `?view=map&node=${encodeURIComponent(`project:${slug}`)}` : "?view=files", hash: "" };
    setWindows(current => current.map(item => item.id === "project" ? { ...item, open: false } : item));
    const previousAddress = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    openApp("projects");
    const nextAddress = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (previousAddress !== nextAddress) {
      window.history.replaceState(window.history.state, "", previousAddress);
      window.history.pushState(window.history.state, "", nextAddress);
    }
    requestAnimationFrame(() => window.dispatchEvent(new Event("samuel-project-graph")));
  };

  useEffect(() => {
    const restoreProjectRoute = () => {
      const url = new URL(window.location.href);
      if (!/\/projects\/?$/.test(url.pathname)) return;
      const project = projects.find(item => item.slug === url.searchParams.get("project"));
      const id: AppId = project ? "project" : "projects";
      routeStateByApp.current[id] = { search: url.search, hash: url.hash };
      if (project) setRequestedProjectSlug(project.slug);
      setRequestedProjectDemo(Boolean(project) && url.searchParams.get("view") === "demo");
      setActiveId(id);
      const z = ++zCounter.current;
      setWindows(current => current.map(item => item.id === id ? { ...item, open: true, z, title: project ? project.title : item.title } : item.id === "project" && !project ? { ...item, open: false } : item));
    };
    window.addEventListener("popstate", restoreProjectRoute);
    return () => window.removeEventListener("popstate", restoreProjectRoute);
  }, []);

  const openFinder = useCallback(() => {
    if (booting || mobileGuide || finderOpen) return;
    finderReturnFocus.current = openMenu
      ? menuButtonRefs.current[openMenu] ?? null
      : document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenMenu(null);
    setFinderOpen(true);
  }, [booting, finderOpen, mobileGuide, openMenu]);

  const closeFinder = () => {
    setFinderOpen(false);
    window.requestAnimationFrame(() => {
      if (finderReturnFocus.current?.isConnected) finderReturnFocus.current.focus();
      else menuButtonRefs.current.file?.focus();
    });
  };

  const openFoundApplication = (id: AppId) => {
    setFinderOpen(false);
    openApp(id);
    if (finderReturnFocus.current) returnFocusByApp.current[id] = finderReturnFocus.current;
  };

  const openFoundProject = (slug: string) => {
    setFinderOpen(false);
    openProjectDocument(slug);
    if (finderReturnFocus.current) returnFocusByApp.current.project = finderReturnFocus.current;
  };

  useEffect(() => {
    const handleFindShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.shiftKey) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (booting || mobileGuide || document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
      event.preventDefault();
      openFinder();
    };
    window.addEventListener("keydown", handleFindShortcut);
    return () => window.removeEventListener("keydown", handleFindShortcut);
  }, [booting, mobileGuide, openFinder]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const restoreMenuTriggerFocus = (menuId: SystemMenuId) => {
    window.requestAnimationFrame(() => menuButtonRefs.current[menuId]?.focus());
  };

  const chooseLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setOpenMenu(null);
    syncAddress(activeId, nextLocale, true);
    restoreMenuTriggerFocus("language");
  };

  const choosePattern = (nextPattern: DesktopPattern) => {
    setPattern(nextPattern);
    try {
      window.localStorage.setItem(PATTERN_STORAGE_KEY, nextPattern);
    } catch {
      // The selected pattern remains available until the next reload.
    }
    setOpenMenu(null);
    restoreMenuTriggerFocus("view");
  };

  const hideAllWindows = () => {
    setWindows((current) => current.map((item) => ({ ...item, open: false })));
    setOpenMenu(null);
    restoreMenuTriggerFocus("special");
  };

  const closeApp = (id: AppId) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, open: false } : item));
    const remaining = windows.filter((item) => item.open && item.id !== id).sort((a, b) => b.z - a.z);
    const nextActiveId = remaining[0]?.id ?? "about";
    setActiveId(nextActiveId);
    syncAddress(nextActiveId);
    window.requestAnimationFrame(() => {
      const returnTarget = returnFocusByApp.current[id];
      if (returnTarget?.isConnected) returnTarget.focus();
      else if (remaining[0]) document.querySelector<HTMLButtonElement>(`[data-app-id="${remaining[0].id}"] .window-close`)?.focus();
    });
  };

  const focusMenuOption = (menuId: SystemMenuId, position: "first" | "last") => {
    window.requestAnimationFrame(() => {
      const menu = document.getElementById(SYSTEM_MENU_ELEMENT_IDS[menuId]);
      const options = menu?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)');
      if (!options?.length) return;
      options[position === "first" ? 0 : options.length - 1].focus();
    });
  };

  const toggleSystemMenu = (menuId: SystemMenuId) => {
    if (openMenu === menuId) {
      setOpenMenu(null);
      return;
    }
    setOpenMenu(menuId);
    focusMenuOption(menuId, "first");
  };

  const handleMenuButtonKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    menuId: SystemMenuId,
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpenMenu(menuId);
    focusMenuOption(menuId, event.key === "ArrowDown" ? "first" : "last");
  };

  const handleSystemMenuKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    menuId: SystemMenuId,
  ) => {
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)'),
    );
    if (options.length === 0) return;
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
    else if (event.key === "ArrowUp") nextIndex = currentIndex < 0 ? options.length - 1 : (currentIndex - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpenMenu(null);
      menuButtonRefs.current[menuId]?.focus();
      return;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    options[nextIndex]?.focus();
  };

  const toggleZoom = (id: AppId) => {
    // Small-screen windows already occupy the fixed usable canvas; toggling
    // the desktop maximize bit cannot produce a meaningful visual state.
    if (isCompactCanvasViewport()) return;
    setWindows((current) => current.map((item) => item.id === id ? { ...item, maximized: !item.maximized } : item));
    focusWindow(id);
  };

  const closeActive = () => {
    const active = windows.find((item) => item.id === activeId && item.open);
    if (active) closeApp(active.id);
    setOpenMenu(null);
  };

  const restart = () => {
    setOpenMenu(null);
    setWindows(INITIAL_WINDOWS.map((item) => fitWindowToViewport(
      { ...item, open: item.id === "about" },
      window.innerWidth,
      window.innerHeight,
    )));
    setActiveId("about");
    setMemoryMagic(false);
    setToast(null);
    setBooting(true);
    syncAddress("about");
  };

  const dismissMobileGuide = () => {
    try {
      window.sessionStorage.setItem("samuel-mobile-window-guide", "seen");
    } catch {
      // The guide still closes when storage is unavailable.
    }
    setMobileGuide(false);
  };

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>, id: AppId) => {
    if ((event.target as HTMLElement).closest("button")) return;
    const target = windows.find((item) => item.id === id);
    if (!target || target.maximized || isCompactCanvasViewport()) return;
    focusWindow(id);
    dragState.current = {
      id,
      offsetX: event.clientX - target.x,
      offsetY: event.clientY - target.y,
    };
  };

  const handleResizeStart = (event: React.PointerEvent<HTMLButtonElement>, id: AppId) => {
    event.preventDefault();
    event.stopPropagation();
    const target = windows.find((item) => item.id === id);
    if (!target || target.maximized || isCompactCanvasViewport()) return;
    const renderedWindow = event.currentTarget.closest<HTMLElement>(".mac-window")?.getBoundingClientRect();
    focusWindow(id);
    resizeState.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: renderedWindow?.width ?? target.width,
      startHeight: renderedWindow?.height ?? target.height,
      originX: renderedWindow?.left ?? target.x,
      originY: renderedWindow?.top ?? target.y,
    };
  };

  const resizeWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, id: AppId) => {
    const direction = event.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(direction)) return;
    event.preventDefault();
    const step = event.shiftKey ? 64 : 24;
    const renderedWindow = event.currentTarget.closest<HTMLElement>(".mac-window")?.getBoundingClientRect();
    setWindows((current) => current.map((windowState) => {
      if (windowState.id !== id || windowState.maximized) return windowState;
      const widthDelta = direction === "ArrowRight" ? step : direction === "ArrowLeft" ? -step : 0;
      const heightDelta = direction === "ArrowDown" ? step : direction === "ArrowUp" ? -step : 0;
      const originX = renderedWindow?.left ?? windowState.x;
      const originY = renderedWindow?.top ?? windowState.y;
      const currentWidth = renderedWindow?.width ?? windowState.width;
      const currentHeight = renderedWindow?.height ?? windowState.height;
      const maximumWidth = Math.max(320, window.innerWidth - originX - (window.innerWidth <= 900 ? 10 : 5));
      const maximumHeight = Math.max(240, window.innerHeight - originY - 8);
      return {
        ...windowState,
        width: Math.max(320, Math.min(maximumWidth, currentWidth + widthDelta)),
        height: Math.max(240, Math.min(maximumHeight, currentHeight + heightDelta)),
      };
    }));
  };

  useEffect(() => {
    const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let position = 0;
    const listen = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey
        || (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], dialog[open]'))) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      position = key === sequence[position] ? position + 1 : key === sequence[0] ? 1 : 0;
      if (position === sequence.length) {
        position = 0;
        openApp("secret");
        showToast("Cheat code accepted. Absolutely no extra lives awarded.");
      }
    };
    window.addEventListener("keydown", listen);
    return () => window.removeEventListener("keydown", listen);
  }, [openApp, showToast]);

  if (booting) {
    return (
      <TranslationBoundary locale={locale}><main className="boot-screen" data-locale={locale} onClick={completeBoot}>
        <div className="boot-computer"><div className="boot-face">:)</div><span /></div>
        <h1>Welcome to Samuel System 7</h1>
        <p className="boot-status" key={bootMessageIndex} aria-live="polite">{BOOT_MESSAGES[bootMessageIndex]}</p>
        <div
          className="boot-progress"
          role="progressbar"
          aria-label="Starting Samuel System 7"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={BOOT_PROGRESS[bootMessageIndex]}
        >
          <span style={{ width: `${BOOT_PROGRESS[bootMessageIndex]}%` }} />
        </div>
        <button type="button" onClick={completeBoot}>Enter the portfolio now</button>
      </main></TranslationBoundary>
    );
  }

  return (
    <TranslationBoundary locale={locale}><main
      className={`system-desktop desktop-pattern--${pattern}`}
      data-locale={locale}
      onPointerDown={(event) => {
        const target = event.target;
        if (target instanceof Element && !target.closest(".menu-root")) setOpenMenu(null);
        if (event.target === event.currentTarget) {
          setSelectedIcon(null);
        }
      }}
    >
      <nav className="system-menubar" aria-label="System menu bar">
        <div className="menu-cluster">
          <div className="menu-root">
            <button
              ref={(element) => { menuButtonRefs.current.apple = element; }}
              type="button"
              className={openMenu === "apple" ? "is-open apple-menu" : "apple-menu"}
              onClick={() => toggleSystemMenu("apple")}
              onKeyDown={(event) => handleMenuButtonKeyDown(event, "apple")}
              aria-label="Samuel menu"
              aria-haspopup="menu"
              aria-controls={openMenu === "apple" ? SYSTEM_MENU_ELEMENT_IDS.apple : undefined}
              aria-expanded={openMenu === "apple"}
            >
              <svg className="human-mark" viewBox="0 0 18 18" aria-hidden="true" shapeRendering="crispEdges">
                <circle cx="9" cy="5" r="3" />
                <path d="M3 17v-3c0-3.2 2.4-5 6-5s6 1.8 6 5v3z" />
              </svg>
              <span className="menu-label">Menu</span>
            </button>
            {openMenu === "apple" && (
              <div className="menu-dropdown apple-dropdown" id={SYSTEM_MENU_ELEMENT_IDS.apple} role="menu" aria-label="Samuel menu" onKeyDown={(event) => handleSystemMenuKeyDown(event, "apple")}>
                <button type="button" role="menuitem" onClick={() => openApp("about")}><PixelIcon kind="computer" small />About Samuel Zhang…</button>
                <button type="button" role="menuitem" onClick={() => openApp("projects")}><PixelIcon kind="folder" small />Projects</button>
                <button type="button" role="menuitem" onClick={() => openApp("coverd")}><PixelIcon kind="coverd" small />COVERD — Founder’s Desk</button>
                <button type="button" role="menuitem" onClick={() => openApp("experience")}><PixelIcon kind="briefcase" small />Career</button>
                <button type="button" role="menuitem" onClick={() => openApp("documents")}><PixelIcon kind="pdf" small />Documents</button>
                <button type="button" role="menuitem" onClick={() => openApp("desk")}><PixelIcon kind="accessories" small />Desk Accessories</button>
                <button type="button" role="menuitem" onClick={() => openApp("orbitals")}><PixelIcon kind="orbital" small />Orbital Lab</button>
                <button type="button" role="menuitem" onClick={() => openApp("contact")}><PixelIcon kind="mail" small />Contact Samuel</button>
                <hr />
                <button type="button" role="menuitem" onClick={openFinder}><PixelIcon kind="folder" small />Find…</button>
                <hr />
                <button type="button" role="menuitem" onClick={() => openApp("sidequest")}><PixelIcon kind="runner" small />Latest field note · RUN/HACK</button>
                <button type="button" role="menuitem" onClick={() => openApp("skills")}><PixelIcon kind="controls" small />Skills &amp; Capabilities</button>
                <button type="button" role="menuitem" onClick={() => openApp("education")}><PixelIcon kind="university" small />Education &amp; Awards</button>
                <button type="button" role="menuitem" onClick={() => openApp("lab")}><PixelIcon kind="network" small />Home Lab Network</button>
                <button type="button" role="menuitem" onClick={() => openApp("scrapbook")}><PixelIcon kind="photos" small />Interests &amp; Notes</button>
                <button type="button" role="menuitem" onClick={() => openApp("games")}><PixelIcon kind="game" small />Desk Arcade</button>
                <hr />
                <button type="button" role="menuitem" onClick={restart}>Restart…</button>
              </div>
            )}
          </div>
          <strong className="active-application">{activeTitle}</strong>
          <div className="menu-root">
            <button ref={(element) => { menuButtonRefs.current.file = element; }} type="button" className={openMenu === "file" ? "is-open" : ""} onClick={() => toggleSystemMenu("file")} onKeyDown={(event) => handleMenuButtonKeyDown(event, "file")} aria-haspopup="menu" aria-controls={openMenu === "file" ? SYSTEM_MENU_ELEMENT_IDS.file : undefined} aria-expanded={openMenu === "file"}>File</button>
            {openMenu === "file" && <div className="menu-dropdown" id={SYSTEM_MENU_ELEMENT_IDS.file} role="menu" aria-label="File" onKeyDown={(event) => handleSystemMenuKeyDown(event, "file")}><button type="button" role="menuitem" onClick={openFinder} aria-keyshortcuts="Meta+k Control+k">Find…</button><button type="button" role="menuitem" onClick={() => openApp("documents")}>Open Documents…</button><hr /><button type="button" role="menuitem" disabled={!openWindows.length} onClick={closeActive}>Close Window</button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button ref={(element) => { menuButtonRefs.current.edit = element; }} type="button" className={openMenu === "edit" ? "is-open" : ""} onClick={() => toggleSystemMenu("edit")} onKeyDown={(event) => handleMenuButtonKeyDown(event, "edit")} aria-haspopup="menu" aria-controls={openMenu === "edit" ? SYSTEM_MENU_ELEMENT_IDS.edit : undefined} aria-expanded={openMenu === "edit"}>Edit</button>
            {openMenu === "edit" && <div className="menu-dropdown" id={SYSTEM_MENU_ELEMENT_IDS.edit} role="menu" aria-label="Edit" onKeyDown={(event) => handleSystemMenuKeyDown(event, "edit")}><button type="button" role="menuitem" className="is-disabled" disabled>Undo <kbd>⌘Z</kbd></button><hr /><button type="button" role="menuitem" className="is-disabled" disabled>Cut <kbd>⌘X</kbd></button><button type="button" role="menuitem" className="is-disabled" disabled>Copy <kbd>⌘C</kbd></button><button type="button" role="menuitem" className="is-disabled" disabled>Paste <kbd>⌘V</kbd></button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button ref={(element) => { menuButtonRefs.current.view = element; }} type="button" className={openMenu === "view" ? "is-open" : ""} onClick={() => toggleSystemMenu("view")} onKeyDown={(event) => handleMenuButtonKeyDown(event, "view")} aria-haspopup="menu" aria-controls={openMenu === "view" ? SYSTEM_MENU_ELEMENT_IDS.view : undefined} aria-expanded={openMenu === "view"}>View</button>
            {openMenu === "view" && <div className="menu-dropdown" id={SYSTEM_MENU_ELEMENT_IDS.view} role="menu" aria-label="View" onKeyDown={(event) => handleSystemMenuKeyDown(event, "view")}><button type="button" role="menuitemradio" aria-checked={pattern === "classic"} onClick={() => choosePattern("classic")}>{pattern === "classic" ? "✓ " : ""}Classic Pattern</button><button type="button" role="menuitemradio" aria-checked={pattern === "blue"} onClick={() => choosePattern("blue")}>{pattern === "blue" ? "✓ " : ""}Blue Pattern</button><button type="button" role="menuitemradio" aria-checked={pattern === "paper"} onClick={() => choosePattern("paper")}>{pattern === "paper" ? "✓ " : ""}Paper Pattern</button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button ref={(element) => { menuButtonRefs.current.special = element; }} type="button" className={openMenu === "special" ? "is-open" : ""} onClick={() => toggleSystemMenu("special")} onKeyDown={(event) => handleMenuButtonKeyDown(event, "special")} aria-haspopup="menu" aria-controls={openMenu === "special" ? SYSTEM_MENU_ELEMENT_IDS.special : undefined} aria-expanded={openMenu === "special"}>Special</button>
            {openMenu === "special" && <div className="menu-dropdown" id={SYSTEM_MENU_ELEMENT_IDS.special} role="menu" aria-label="Special" onKeyDown={(event) => handleSystemMenuKeyDown(event, "special")}><button type="button" role="menuitem" onClick={() => openApp("games")}>Desk Arcade</button><hr /><button type="button" role="menuitem" onClick={hideAllWindows}>Hide All Windows</button><button type="button" role="menuitem" onClick={() => openApp("secret")}>About This Secret…</button><button type="button" role="menuitem" onClick={restart}>Restart</button></div>}
          </div>
        </div>
        <div className="menu-status">
          <button
            className="menu-memory"
            onClick={() => {
              setMemoryMagic((current) => !current);
              showToast(memoryMagic ? "Reality restored to 32 MB." : "Memory upgraded to an irresponsible amount.");
            }}
          >
            {memoryMagic ? "∞ MB" : "32 MB"}
          </button>
          <div className="menu-root menu-language">
            <button
              ref={(element) => { menuButtonRefs.current.language = element; }}
              type="button"
              className={openMenu === "language" ? "is-open" : ""}
              onClick={() => toggleSystemMenu("language")}
              onKeyDown={(event) => handleMenuButtonKeyDown(event, "language")}
              aria-haspopup="menu"
              aria-expanded={openMenu === "language"}
              aria-controls={openMenu === "language" ? "language-menu" : undefined}
              aria-label={`${translateText(locale, "Language")}: ${activeLocaleOption.label}`}
              title="Language"
            >
              <span className="language-label">Language: {activeLocaleOption.short}</span>
              <span className="language-short">{activeLocaleOption.short}</span>
            </button>
            {openMenu === "language" && (
              <div className="menu-dropdown language-dropdown" id={SYSTEM_MENU_ELEMENT_IDS.language} role="menu" aria-label="Language" onKeyDown={(event) => handleSystemMenuKeyDown(event, "language")}>
                {localeOptions.map((option) => (
                  <button
                    key={option.locale}
                    type="button"
                    onClick={() => chooseLocale(option.locale)}
                    lang={option.locale}
                    role="menuitemradio"
                    aria-checked={locale === option.locale}
                  >
                    <span className="language-check" aria-hidden="true">{locale === option.locale ? "✓" : ""}</span>
                    <span>{option.label}</span>
                    <small>{option.short}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="menu-clock"
            aria-label={`${translateText(locale, "Open Pocket Calendar")}. ${translateText(locale, "Current time")}: ${clock}`}
            title="Open Pocket Calendar"
            onClick={() => openApp("calendar")}
          >{clock}</button>
        </div>
      </nav>

      <div className="desktop-icons" role="group" aria-label="Desktop items">
        {DESKTOP_ICONS.map((item) => (
          <button
            key={item.id}
            className={`desktop-icon${selectedIcon === item.id ? " is-selected" : ""}`}
            title={`${translateText(locale, item.label)}: ${translateText(locale, item.description)}`}
            aria-label={`${translateText(locale, item.label)}. ${translateText(locale, item.description)} ${translateText(locale, "Click to open.")}`}
            aria-pressed={selectedIcon === item.id}
            onClick={() => { setSelectedIcon(item.id); openApp(item.id); }}
          >
            <span className="desktop-icon__graphic"><PixelIcon kind={item.icon} /></span>
            <span className="desktop-icon__label">{item.label}</span>
          </button>
        ))}
      </div>

      {windows.filter((windowState) => windowState.open).map((windowState) => (
        <WindowChrome
          key={windowState.id}
          windowState={windowState}
          active={activeId === windowState.id}
          onFocus={() => focusWindow(windowState.id)}
          onClose={() => closeApp(windowState.id)}
          onZoom={() => toggleZoom(windowState.id)}
          onDragStart={(event) => handleDragStart(event, windowState.id)}
          onResizeStart={(event) => handleResizeStart(event, windowState.id)}
          onResizeKeyDown={(event) => resizeWithKeyboard(event, windowState.id)}
          locale={locale}
        >
          <ProjectOpenContext.Provider value={openProjectDocument}><AppContent id={windowState.id} openApp={openApp} locale={locale} initialProjectSlug={requestedProjectSlug} initialProjectDemo={requestedProjectDemo} onProjectBack={() => returnToProjects()} onProjectGraph={returnToProjects} active={windowState.id === activeId} /></ProjectOpenContext.Provider>
        </WindowChrome>
      ))}

      <div className={`desktop-hint${selectedDesktopItem ? " has-selection" : ""}`}>
        {selectedDesktopItem ? (
          <>
            <strong>{translateText(locale, selectedDesktopItem.label)}</strong>
            <span>{translateText(locale, selectedDesktopItem.description)} {translateText(locale, "Click to open.")}</span>
          </>
        ) : (
          <span>Click an icon to open it · Use the menu for every destination · Drag title bars to move · Drag lower-right corners to resize</span>
        )}
      </div>
      <div className="window-switcher" role="navigation" aria-label="Open applications">
        {openWindows.map((item) => (
          <button key={item.id} className={activeId === item.id ? "is-active" : ""} onClick={() => focusWindow(item.id)} aria-label={`${translateText(locale, "Show")} ${translateText(locale, item.title)}`}>
            <PixelIcon kind={UTILITY_ICONS[item.id] ?? DESKTOP_ICONS.find((icon) => icon.id === item.id)?.icon ?? "document"} small />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
      {mobileGuide && (
        <>
          <div className="mobile-guide-backdrop" aria-hidden="true" />
          <aside className="mobile-window-guide" role="dialog" aria-modal="true" aria-labelledby="mobile-guide-title" aria-describedby="mobile-guide-copy">
            <div className="mobile-window-guide__title">
              <span className="mobile-guide-window-box" aria-hidden="true" />
              <strong id="mobile-guide-title">How to get around</strong>
            </div>
            <p id="mobile-guide-copy">
              Your current window is already open. Use Menu for every destination, tap an icon to open
              it, and use the bar along the bottom to switch between open windows. The small
              square at a window’s top-left closes it.
            </p>
            <button ref={mobileGuideButtonRef} onClick={dismissMobileGuide}>Got it</button>
          </aside>
        </>
      )}
      {finderOpen && <DesktopFinder applications={FINDER_APPLICATIONS} locale={locale} onClose={closeFinder} onOpenApplication={openFoundApplication} onOpenProject={openFoundProject} />}
      {toast && <div className="system-toast" role="status"><PixelIcon kind="computer" small /><span>{toast}</span></div>}
    </main></TranslationBoundary>
  );
}
