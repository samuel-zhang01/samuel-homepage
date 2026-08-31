"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
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
  translateText,
  type Locale,
} from "@/lib/i18n";
import PdfPreview from "@/components/PdfPreview";
import projectExplorerStyles from "@/components/projects/ProjectExplorer.module.css";
import projectActionsStyles from "@/components/projects/ProjectActions.module.css";
import projectDemoRouterStyles from "@/components/projects/ProjectDemoRouter.module.css";
import projectCaseBriefStyles from "@/components/projects/ProjectCaseBrief.module.css";

const ProjectExplorer = dynamic(() => import("@/components/projects/ProjectExplorer"), {
  loading: () => (
    <div className={`projects-app ${projectExplorerStyles.archiveModuleLoading} ${projectActionsStyles.archiveCssAnchor} ${projectDemoRouterStyles.archiveCssAnchor} ${projectCaseBriefStyles.archiveCssAnchor}`}>
      <span className="eyebrow">OPENING PROJECT ARCHIVE…</span>
      <span className={projectExplorerStyles.archiveLoadingTrack} aria-hidden="true"><i /></span>
    </div>
  ),
});

const SideQuestCabinetApp = dynamic(() => import("@/components/SideQuestCabinetApp"), {
  loading: () => (
    <div className="sidequest-app-loading" role="status">
      <span className="eyebrow">OPENING FIELD OBJECT…</span>
      <strong>Rewinding the RUN/HACK relay.</strong>
    </div>
  ),
});

export type AppId =
  | "about"
  | "coverd"
  | "experience"
  | "projects"
  | "sidequest"
  | "skills"
  | "education"
  | "documents"
  | "games"
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

type IconKind =
  | "profile"
  | "coverd"
  | "computer"
  | "briefcase"
  | "folder"
  | "document"
  | "controls"
  | "university"
  | "network"
  | "photos"
  | "runner"
  | "game"
  | "pdf"
  | "mail"
  | "secret";

const TRANSLATED_ATTRIBUTES = ["aria-label", "title", "placeholder"] as const;

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
  return <>{localiseNode(children, locale)}</>;
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

const BOOT_DURATION = 5600;
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
    title: "Project Archive",
    x: 72,
    y: 48,
    width: 900,
    height: 670,
    z: 4,
    open: false,
    maximized: false,
  },
  {
    id: "sidequest",
    title: "RUN/HACK — SideQuest",
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
    x: 204,
    y: 72,
    width: 720,
    height: 560,
    z: 15,
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
  { id: "about", label: "Profile", icon: "profile", description: "Start here: biography, current work and highlights." },
  { id: "coverd", label: "COVERD", icon: "coverd", description: "Samuel’s startup, product thesis and responsible-AI principles." },
  { id: "experience", label: "Experience", icon: "briefcase", description: "Professional history from emergency operations to applied AI." },
  { id: "projects", label: "Projects", icon: "folder", description: "Selected products, research and technical builds." },
  { id: "sidequest", label: "RUN/HACK", icon: "runner", description: "A second-place running hackathon build: Strava evidence, subsequent runs, social challenges and live relay." },
  { id: "skills", label: "Skills", icon: "controls", description: "Technical, product, research and leadership capabilities." },
  { id: "education", label: "Education", icon: "university", description: "Imperial, King’s College London and academic awards." },
  { id: "documents", label: "Documents", icon: "pdf", description: "Current Applied AI CV and reviewed learning material in one continuous reader." },
  { id: "games", label: "Desk Arcade", icon: "game", description: "Seven local games with profile-themed puzzles and calculations." },
  { id: "lab", label: "Home Lab", icon: "network", description: "Samuel’s self-hosted AI, storage and automation infrastructure." },
  { id: "scrapbook", label: "Interests", icon: "photos", description: "Photography, hiking, music, teaching and life outside work." },
  { id: "contact", label: "Contact", icon: "mail", description: "Email, LinkedIn and GitHub without leaving the desktop." },
];

const experience = [
  {
    period: "May 2026 — Present",
    role: "Senior Coordinator — Digital Transformation Strategy Internship",
    company: "Marsh · Strategy & Corporate Development Group",
    location: "London",
    copy: "Conducted client-confidential applied-AI research in a regulated insurance setting, with documented evaluation, human oversight and deployment safeguards. Operational data, model design and findings remain private.",
    tag: "CURRENT",
  },
  {
    period: "Mar 2026 — Present",
    role: "Founder & Product Lead · Part-time",
    company: "COVERD",
    location: "London",
    copy: "Developed early company-aware voice-interview experiments, then evolved that research into COVERD’s current product: an ATS-connected recruitment-intelligence layer that reviews applications across specialist dimensions, enriches evidence with automated voice interviews and returns reasoned shortlists while recruiters keep the decision.",
    tag: "FOUNDER",
  },
  {
    period: "Oct 2024 — Apr 2026",
    role: "Web Application Developer & Product Owner · Part-time",
    company: "Pfizer Analytical R&D",
    location: "London",
    copy: "Owned the roadmap and stakeholder adoption for GROWMAT, an internal enterprise product. Its external showcase documents the architecture and outcomes; live data, source code, credentials and non-public operating context remain private.",
    tag: "PRODUCT",
  },
  {
    period: "Sep 2023 — Aug 2024",
    role: "Data Analyst Undergraduate",
    company: "Pfizer Analytical R&D",
    location: "Sandwich",
    copy: "Built and delivered GROWMAT within a regulated R&D environment, improving an internal planning process and supporting wider product adoption. Its external showcase is public; live company data, source code, credentials and non-public operating context remain private. Also explored scientific modelling workflows for pharmaceutical research.",
    tag: "DATA",
  },
  {
    period: "Jan 2023 — Apr 2025",
    role: "Coding Series Tutor & Curriculum Designer",
    company: "King’s College London",
    location: "London",
    copy: "Designed and delivered 20+ programming, data-analysis and introductory ML sessions for 80+ chemistry students. Organised a cross-industry data-science careers panel for 100+ attendees and mentored learners in using technical skills to widen their options.",
    tag: "EDUCATION",
  },
  {
    period: "Jun — Jul 2023",
    role: "Summer Research Fellow",
    company: "King’s College London",
    location: "London",
    copy: "Configured and documented a GPU-capable WSL 2/CUDA/Docker environment and completed a containerised GROMACS topology-preparation checkpoint, with reproducibility gaps explicitly audited.",
    tag: "RESEARCH",
  },
  {
    period: "Jun — Jul 2022",
    role: "Undergraduate Research Fellow",
    company: "King’s College London",
    location: "London",
    copy: "Built MATLAB, Python and Excel tooling for rotational-spectroscopy analysis; named co-author on the 2025 International Symposium on Molecular Spectroscopy conference record.",
    tag: "RESEARCH",
  },
  {
    period: "Jul 2019 — Jul 2021",
    role: "Commander’s Personal Assistant / Sergeant",
    company: "Singapore Civil Defence Force",
    location: "Singapore",
    copy: "Built decision-support and workflow automation during COVID-19 emergency operations using public epidemiological data. Personnel records, operational processes, infrastructure and scale remain protected.",
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
    evidence: "Home lab — maintains a private Proxmox/Docker fleet; the public audit exposes one six-service Compose slice, a scheduled PostgreSQL backup job and explicit recovery gaps.",
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
            sizes={small ? "18px" : "34px"}
            loading="eager"
          />
        </span>
      </span>
    );
  }

  const common = {
    fill: "none",
    stroke: "#111",
    strokeWidth: 3,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };

  const artwork: Record<Exclude<IconKind, "coverd">, React.ReactNode> = {
    profile: (
      <g {...common}>
        <circle cx="24" cy="14" r="8" fill="#f2ca59" />
        <path d="M8 44v-5c0-10 6-16 16-16s16 6 16 16v5z" fill="#d7d7d1" />
        <path d="M15 40h18" stroke="#11177a" strokeWidth="2" />
      </g>
    ),
    computer: (
      <g {...common}>
        <rect x="5" y="3" width="38" height="35" rx="2" fill="#d7d7d1" />
        <rect x="10" y="8" width="28" height="20" fill="#fff" />
        <path d="M17 17h2m9 0h2m-12 6c3 2 9 2 12 0" />
        <path d="M16 38v5h16v-5" fill="#aaa" />
      </g>
    ),
    folder: (
      <g {...common}>
        <path d="M3 14h16l4-6h10l4 6h8v29H3z" fill="#f2ca59" />
        <path d="M3 18h42" stroke="#fff2ad" />
        <path d="M7 38h34" stroke="#b68921" />
      </g>
    ),
    briefcase: (
      <g {...common}>
        <path d="M16 14V8h16v6" />
        <rect x="4" y="14" width="40" height="29" rx="1" fill="#c8b078" />
        <path d="M4 25h40M20 23v6h8v-6" />
        <path d="M9 39h30" stroke="#8c7544" strokeWidth="2" />
      </g>
    ),
    document: (
      <g {...common}>
        <path d="M9 3h22l9 9v33H9z" fill="#fff" />
        <path d="M31 3v10h9" fill="#aaa" />
        <path d="M15 21h19M15 27h19M15 33h15M15 39h17" strokeWidth="2" />
      </g>
    ),
    controls: (
      <g {...common}>
        <rect x="4" y="5" width="40" height="38" fill="#d7d7d1" />
        <path d="M13 11v26M24 11v26M35 11v26" />
        <rect x="9" y="17" width="8" height="7" fill="#fff" />
        <rect x="20" y="29" width="8" height="7" fill="#fff" />
        <rect x="31" y="14" width="8" height="7" fill="#fff" />
      </g>
    ),
    university: (
      <g {...common}>
        <path d="M3 16 24 4l21 12z" fill="#d8d8d2" />
        <path d="M7 20h34M5 42h38" />
        <path d="M10 20v20M19 20v20M29 20v20M38 20v20" strokeWidth="4" />
      </g>
    ),
    network: (
      <g {...common}>
        <path d="M24 16v9M11 30v-5h26v5" />
        <rect x="17" y="3" width="14" height="13" fill="#d8d8d2" />
        <rect x="4" y="30" width="14" height="13" fill="#fff" />
        <rect x="30" y="30" width="14" height="13" fill="#fff" />
        <path d="M20 12h8M7 39h8M33 39h8" strokeWidth="2" />
      </g>
    ),
    photos: (
      <g {...common}>
        <path d="M5 8h37v33H5z" fill="#fff" />
        <circle cx="31" cy="17" r="4" fill="#f2ca59" />
        <path d="m8 36 10-12 7 7 5-5 9 10" fill="#7da574" />
        <path d="M2 12V4h36" stroke="#888" />
      </g>
    ),
    runner: (
      <g {...common}>
        <path d="M5 39h38" stroke="#777" strokeWidth="2" />
        <circle cx="28" cy="9" r="5" fill="#f2ca59" />
        <path d="m24 15-7 11 10 5 5-12z" fill="#d7ff55" />
        <path d="m21 20-9 2-5 7m19 2-8 10m9-10 11 8m-5-18 8 4" />
        <path d="M7 12h9M4 17h11" stroke="#67a8b8" strokeWidth="2" />
      </g>
    ),
    game: (
      <g {...common}>
        <path d="M13 17h22l8 18-5 7-10-8h-8l-10 8-5-7z" fill="#d7d7d1" />
        <path d="M16 23v10M11 28h10" />
        <rect x="31" y="23" width="4" height="4" fill="#f26b3d" />
        <rect x="36" y="29" width="4" height="4" fill="#3458a5" />
        <path d="M20 17V8h8" />
      </g>
    ),
    pdf: (
      <g {...common}>
        <path d="M8 3h23l9 9v33H8z" fill="#fff" />
        <path d="M31 3v10h9" fill="#aaa" />
        <rect x="4" y="24" width="32" height="14" fill="#b74343" />
        <path d="M9 28h5c4 0 4 6 0 6H9zm12 0v6m0-6h7m-7 3h5" stroke="#fff" strokeWidth="2" />
      </g>
    ),
    mail: (
      <g {...common}>
        <rect x="4" y="9" width="40" height="31" fill="#fff" />
        <path d="m6 12 18 15 18-15M6 38l13-14m23 14L29 24" strokeWidth="2" />
        <path d="M9 43h30" stroke="#777" strokeWidth="2" />
      </g>
    ),
    secret: (
      <g {...common}>
        <path d="m24 3 5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z" fill="#f2ca59" />
        <path d="M18 21h2m8 0h2m-11 6c3 2 7 2 10 0" strokeWidth="2" />
      </g>
    ),
  };

  return (
    <span className={`pixel-icon pixel-icon--${kind}${small ? " pixel-icon--small" : ""}`} aria-hidden="true">
      <svg className="pixel-icon__svg" viewBox="0 0 48 48" shapeRendering="crispEdges">
        {artwork[kind]}
      </svg>
    </span>
  );
}

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
      onPointerDown={onFocus}
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
          I&apos;m an applied AI engineer and founder. I build products for ambiguous, domain-heavy
          problems. My current work covers responsible AI research and COVERD, an ATS-connected
          recruitment product that can add evidence through automated voice interviews. I previously
          delivered GROWMAT, an internal enterprise product documented in an external showcase;
          live company data, source code, credentials and non-public operating context remain private.
        </p>
        <fieldset className="about-panel">
          <legend>Working style</legend>
          <p>Technically curious, attentive in a room, and happiest when helping other people do their best work.</p>
        </fieldset>
        <nav className="identity-switchboard" aria-label="Samuel’s cabinet of curiosities">
          <div className="identity-switchboard__heading">
            <b>CABINET OF CURIOSITIES</b>
            <p>Choose a drawer to open the corresponding part of the portfolio.</p>
          </div>
          <button onClick={() => openApp("coverd")}>
            <PixelIcon kind="coverd" small />
            <span className="identity-copy"><b>Founder</b><span className="identity-detail">Building COVERD: ATS-connected applicant review, voice enrichment, reasoned shortlists and human-owned decisions.</span></span>
          </button>
          <button className="identity-drawer--projects" onClick={() => openApp("projects")}>
            <PixelIcon kind="briefcase" small />
            <span className="identity-copy identity-copy--product">
              <b>Product</b>
              <span className="identity-detail">Building polished tools from messy operational knowledge, with enough care that people adopt and keep using them.</span>
              <span className="identity-drawer-prompt">OPEN PROJECT ARCHIVE →</span>
            </span>
          </button>
          <button onClick={() => openApp("sidequest")}>
            <PixelIcon kind="runner" small />
            <span className="identity-copy"><b>Runner-builder</b><span className="identity-detail">Second place at RUN/HACK after a 5K race, a 44K team relay and a voice-built social running product.</span></span>
          </button>
          <button onClick={() => openApp("experience")}>
            <PixelIcon kind="university" small />
            <span className="identity-copy"><b>Scientist</b><span className="identity-detail">Chemistry-trained thinking: expose uncertainty, test assumptions against evidence and learn from failed experiments.</span></span>
          </button>
          <button onClick={() => openApp("lab")}>
            <PixelIcon kind="network" small />
            <span className="identity-copy"><b>Builder</b><span className="identity-detail">A private Proxmox/Docker lab with self-hosted services, cross-architecture CI and recovery lessons made explicit.</span></span>
          </button>
          <button onClick={() => openApp("scrapbook")}>
            <PixelIcon kind="photos" small />
            <span className="identity-copy"><b>Musician &amp; maker</b><span className="identity-detail">Fourth-place UniBrass euphonium, three musicals and a former life photographing weddings.</span></span>
          </button>
        </nav>
        <fieldset className="about-panel about-evidence">
          <legend>Selected evidence</legend>
          <dl>
            <div><dt>COVERD</dt><dd>Public product covers ATS-connected review, six specialist dimensions, voice enrichment and reasoned shortlists.</dd></div>
            <div><dt>GROWMAT</dt><dd>External showcase covers architecture and outcomes; live data and source remain private.</dd></div>
            <div><dt>People</dt><dd>20+ teaching sessions for 80+ students and a careers panel for more than 100.</dd></div>
          </dl>
        </fieldset>
        <div className="button-row">
          <button className="mac-button is-default" onClick={() => openApp("coverd")}>Explore COVERD</button>
          <button className="mac-button" onClick={() => openApp("projects")}>View Work</button>
          <button className="mac-button" onClick={() => openApp("documents")}>View CV</button>
          <a className="mac-button" href={localeCvAssets[locale].src} download>Download CV</a>
          <button className="mac-button" onClick={() => openApp("contact")}>Contact</button>
        </div>
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
            <a className="coverd-link" href="https://coverd.ai/" target="_blank" rel="noopener noreferrer">Visit coverd.ai ↗</a>
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

function ExperienceApp({ locale }: { locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="experience-app">
      <header className="document-header">
        <div>
          <span className="eyebrow">PROFESSIONAL HISTORY</span>
          <h3>Building useful intelligence.</h3>
        </div>
        <span className="file-stamp">2019—2026</span>
      </header>
      <div className="career-list">
        {experience.map((item) => (
          <article className="career-record" key={`${item.company}-${item.period}`}>
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
            </div>
          </article>
        ))}
      </div>
    </div></TranslationBoundary>
  );
}

function ProjectsApp({
  openApp,
  locale,
  initialSlug,
}: {
  openApp: (id: AppId) => void;
  locale: Locale;
  initialSlug?: string;
}) {
  return <ProjectExplorer initialSlug={initialSlug} locale={locale} onOpenApp={openApp} />;
}

function SkillsApp({ locale }: { locale: Locale }) {
  return (
    <TranslationBoundary locale={locale}><div className="skills-app">
      <div className="control-panel-intro">
        <PixelIcon kind="controls" />
        <div><h3>Capabilities, with receipts.</h3><p>A broader engineering toolkit, connected to the products and systems where Samuel has used it.</p></div>
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
        <PixelIcon kind="university" />
      </header>
      <section className="degree-card degree-card--imperial">
        <div className="degree-mark">ICL</div>
        <div><span>Sep 2025—Sep 2026</span><h4>MSc AI Applications &amp; Innovation</h4><p>Imperial College London · Predicted Distinction</p><small>Deep Learning · AI Safety · Innovation Management · ML in Medical Imaging · ML in Climate Change</small></div>
      </section>
      <section className="degree-card">
        <div className="degree-mark">KCL</div>
        <div><span>Sep 2021—May 2025</span><h4>BSc Chemistry with Biomedicine</h4><p>King&apos;s College London · First-Class Honours</p><small>Professional placement · Computational Chemistry · Molecular Biology · Chemical Biology · Organic Chemistry</small></div>
      </section>
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
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    const email = "sam.xiaojian.zhang@outlook.com";
    let copiedWithClipboard = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(email);
        copiedWithClipboard = true;
      }
    } catch {
      // Firefox and Safari can deny clipboard access outside a trusted gesture.
    }
    if (!copiedWithClipboard) {
      const input = document.createElement("textarea");
      input.value = email;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <TranslationBoundary locale={locale}><div className="chooser-app">
      <div className="chooser-columns">
        <div className="chooser-list" role="group" aria-label="Contact services">
          <button className="is-selected"><PixelIcon kind="network" small />Internet</button>
          <button><PixelIcon kind="document" small />Electronic Mail</button>
          <button><PixelIcon kind="computer" small />LinkedIn</button>
        </div>
        <div className="chooser-detail">
          <div className="contact-machine"><PixelIcon kind="computer" /><span className="machine-light" /></div>
          <h3>Samuel Zhang</h3>
          <p>Available for conversations about applied AI, responsible technology, product leadership, and ambitious early-stage ventures.</p>
          <div className="contact-links">
            <button className="mac-button is-default" onClick={copyEmail}>{copied ? "Address Copied!" : "Copy Email"}</button>
            <a className="mac-button" href="https://www.linkedin.com/in/samuel-xj-zhang/" target="_blank" rel="noreferrer">LinkedIn</a>
            <button className="mac-button" onClick={() => openApp("coverd")}>COVERD</button>
          </div>
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
    meta: "Reviewed learning atlas · PDF",
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
  { answer: "DOCKER", clue: "The container tool linking shipped products, the home lab and reproducible environments.", fact: "Samuel uses Docker across product systems, deployment workflows and a source-audited six-service home-lab slice." },
  { answer: "BANDIT", clue: "A sequential-decision problem balancing exploration with exploitation.", fact: "The Sequential Decisions Lab compares epsilon-greedy, UCB1 and Thompson Sampling over paired synthetic seeds." },
  { answer: "CAUSAL", clue: "The adjustment lens kept separate from off-policy evaluation.", fact: "The Causal Adjustment and OPE Lab distinguishes intervention questions from evaluation of a new logged policy." },
  { answer: "POLICY", clue: "What the OPE workbench evaluates without deploying it.", fact: "The local OPE fixture exposes propensity support, effective sample size and estimator disagreement before any policy claim." },
  { answer: "SENSOR", clue: "What the air-quality decision lab tries to choose economically.", fact: "The Air-Quality ML Decision Lab joins source data QA and model results to an explicit sensor-budget trade-off." },
  { answer: "NEURAL", clue: "A family of scientific models whose internal structure Samuel opens for inspection.", fact: "The archive traces neural architectures for microscopy, MRI reconstruction and CFD surrogates with provenance and evaluation limits." },
  { answer: "BROKER", clue: "The human who retains authority in the insurance decision-support workflow.", fact: "The insurance matching work keeps evidence pillars separate and leaves their final synthesis to broker judgement." },
  { answer: "MARKET", clue: "A candidate destination for an insurance risk—and the subject of a tiny Julia simulator.", fact: "Samuel’s archive includes both lead-market decision support and a source-audited stochastic market-impact simulation." },
  { answer: "SOLUTE", clue: "The dissolved component in the solid–liquid equilibrium workbench.", fact: "The solubility exhibit solves an invented solute workflow in log-composition space and reconciles mole and mass reporting bases." },
  { answer: "ENERGY", clue: "A quantity tracked in the chemistry lab’s molecular-dynamics receipt.", fact: "The computational-chemistry exhibit reports deterministic velocity-Verlet energy drift so integrator error stays visible." },
  { answer: "CAMERA", clue: "A tool from Samuel’s former professional life that is now kept for friends and nature.", fact: "Samuel previously photographed weddings professionally and now keeps photography playful and personal." },
  { answer: "HIKING", clue: "An unhurried interest involving boots, conversation and somewhere new.", fact: "Samuel values long walks for curiosity, shared conversation and the story on the way home." },
  { answer: "LAMBDA", clue: "A symbol connecting regularisation paths and an insurance ranking model.", fact: "The archive discusses lambda shrinkage in the air-quality companion and LambdaRank in insurance decision support." },
  { answer: "TENSOR", clue: "The object followed through several rotatable model-architecture diagrams.", fact: "Scientific ML chapters expose tensor paths, skip connections, data consistency and checkpoint provenance." },
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

type TriageRoute = "ready" | "review" | "abstain";

type TriageCase = {
  id: string;
  confidence: number;
  missingPillars: number;
  conflict: boolean;
};

const TRIAGE_CASES: readonly TriageCase[] = [
  { id: "Northstar", confidence: 92, missingPillars: 0, conflict: false },
  { id: "Harbour", confidence: 76, missingPillars: 0, conflict: true },
  { id: "Atlas", confidence: 54, missingPillars: 2, conflict: false },
  { id: "Meridian", confidence: 88, missingPillars: 1, conflict: false },
  { id: "Orchid", confidence: 91, missingPillars: 0, conflict: false },
  { id: "Tangent", confidence: 61, missingPillars: 0, conflict: false },
  { id: "Vela", confidence: 43, missingPillars: 0, conflict: true },
  { id: "Beacon", confidence: 84, missingPillars: 0, conflict: false },
] as const;

function expectedTriageRoute(item: TriageCase): TriageRoute {
  if (item.confidence < 60 || item.missingPillars >= 2) return "abstain";
  if (item.confidence >= 85 && item.missingPillars === 0 && !item.conflict) return "ready";
  return "review";
}

function triageReason(item: TriageCase) {
  const route = expectedTriageRoute(item);
  if (route === "ready") return "Complete, aligned evidence clears the inspection gate; the broker still decides.";
  if (route === "abstain") return "Low support triggers abstention and human review.";
  if (item.conflict) return "Conflicting evidence needs human reconciliation.";
  if (item.missingPillars > 0) return "A missing evidence pillar needs human review.";
  return "Confidence below the ready gate needs human review.";
}

const SPECTRUM_PEAKS = [2.48, 4.86, 7.12] as const;

function spectrumSignal(frequency: number) {
  const strongestPeak = Math.max(...SPECTRUM_PEAKS.map((peak) => (
    Math.exp(-0.5 * ((frequency - peak) / 0.065) ** 2)
  )));
  const baseline = 3 + 1.5 * Math.sin(frequency * 8.2);
  return Math.max(0, Math.min(100, Math.round(baseline + strongestPeak * 96)));
}

type SpectrumFeedback =
  | { kind: "initial" }
  | { kind: "captured"; frequency: number }
  | { kind: "duplicate" }
  | { kind: "miss"; distance: number }
  | { kind: "complete" };

type CapacityStageId = "intake" | "model" | "review";

const CAPACITY_STAGES: readonly { id: CapacityStageId; label: string; rate: number }[] = [
  { id: "intake", label: "Intake", rate: 4 },
  { id: "model", label: "Model", rate: 3 },
  { id: "review", label: "Review", rate: 2 },
] as const;

type ArcadeGameId = "minefield" | "puzzle" | "samword" | "memory" | "triage" | "spectrum" | "capacity";

const ARCADE_GAMES: readonly { id: ArcadeGameId; icon: string; label: string }[] = [
  { id: "minefield", icon: "M", label: "Minefield" },
  { id: "puzzle", icon: "15", label: "Sliding Puzzle" },
  { id: "samword", icon: "SZ", label: "SamWord" },
  { id: "memory", icon: "8", label: "Profile Pairs" },
  { id: "triage", icon: "AI", label: "Evidence Triage" },
  { id: "spectrum", icon: "GHz", label: "Spectrum Dial" },
  { id: "capacity", icon: "FTE", label: "Capacity Desk" },
] as const;

function formatTriageProgress(locale: Locale, reviewed: number, score: number) {
  if (locale === "zh-CN") return `${reviewed} / ${TRIAGE_CASES.length} 个案例 · ${score} 个正确`;
  if (locale === "zh-TW") return `${reviewed} / ${TRIAGE_CASES.length} 個案例 · ${score} 個正確`;
  return `${reviewed} of ${TRIAGE_CASES.length} cases · ${score} correct`;
}

function formatSpectrumValue(locale: Locale, frequency: number, strength: number) {
  if (locale === "zh-CN") return `${frequency.toFixed(2)} GHz；信号强度 ${strength}%`;
  if (locale === "zh-TW") return `${frequency.toFixed(2)} GHz；訊號強度 ${strength}%`;
  return `${frequency.toFixed(2)} GHz; ${strength}% signal`;
}

function formatSpectrumFeedback(locale: Locale, feedback: SpectrumFeedback) {
  if (feedback.kind === "initial") return translateText(locale, "Move the dial, then capture three synthetic peaks.");
  if (feedback.kind === "duplicate") return translateText(locale, "That peak is already in the notebook.");
  if (feedback.kind === "complete") return translateText(locale, "All three synthetic peaks captured. Assignment notebook complete.");
  if (feedback.kind === "captured") {
    if (locale === "zh-CN") return `已锁定 ${feedback.frequency.toFixed(2)} GHz 的峰。`;
    if (locale === "zh-TW") return `已鎖定 ${feedback.frequency.toFixed(2)} GHz 的峰。`;
    return `Peak locked at ${feedback.frequency.toFixed(2)} GHz.`;
  }
  if (locale === "zh-CN") return `未锁定。最近的峰相距 ${feedback.distance.toFixed(2)} GHz。`;
  if (locale === "zh-TW") return `未鎖定。最近的峰相距 ${feedback.distance.toFixed(2)} GHz。`;
  return `No lock. Nearest peak is ${feedback.distance.toFixed(2)} GHz away.`;
}

const MEMORY_PAIRS = [
  { id: "coverd", left: "ATS LAYER", right: "COVERD", fact: "COVERD reviews applications across specialist dimensions and uses voice interviews as an enrichment path." },
  { id: "growmat", left: "EXTERNAL", right: "GROWMAT", fact: "GROWMAT has an external showcase; source code, live data and credentials remain private." },
  { id: "gpu", left: "PRIVATE", right: "LOCAL AI", fact: "Samuel’s private home-lab inventory includes local model-training and inference systems." },
  { id: "scdf", left: "SCDF", right: "OPERATIONS", fact: "Emergency planning systems supported protected operations in Singapore." },
  { id: "teaching", left: "80+ STUDENTS", right: "CODING", fact: "Samuel designed an accessible programming and data curriculum." },
  { id: "science", left: "SCIENCE", right: "MODELLING", fact: "Scientific computing supported research inside a regulated environment." },
  { id: "infra", left: "DOCKER", right: "HOME LAB", fact: "A private infrastructure inventory spans AI, storage and automation; the public exhibit audits one six-service Compose slice." },
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
  const [triageIndex, setTriageIndex] = useState(0);
  const [triageChoice, setTriageChoice] = useState<TriageRoute | null>(null);
  const [triageScore, setTriageScore] = useState(0);
  const [spectrumFrequency, setSpectrumFrequency] = useState(2);
  const [capturedPeaks, setCapturedPeaks] = useState<Set<number>>(() => new Set());
  const [spectrumFeedback, setSpectrumFeedback] = useState<SpectrumFeedback>({ kind: "initial" });
  const [capacity, setCapacity] = useState<Record<CapacityStageId, number>>({ intake: 4, model: 4, review: 4 });
  const memoryTimer = useRef<number | null>(null);
  const mineSeed = useRef(91);
  const puzzleSeed = useRef(1991);
  const memorySeed = useRef(1991);

  useEffect(() => () => {
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current);
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

  const triageCase = TRIAGE_CASES[triageIndex];
  const routeTriageCase = (route: TriageRoute) => {
    if (!triageCase || triageChoice) return;
    setTriageChoice(route);
    if (route === expectedTriageRoute(triageCase)) setTriageScore((current) => current + 1);
  };

  const nextTriageCase = () => {
    setTriageIndex((current) => current + 1);
    setTriageChoice(null);
  };

  const resetTriage = () => {
    setTriageIndex(0);
    setTriageChoice(null);
    setTriageScore(0);
  };

  const handleTriageKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const routeByKey: Record<string, TriageRoute | undefined> = {
      "1": "ready",
      "2": "review",
      "3": "abstain",
    };
    const route = routeByKey[event.key];
    if (!route) return;
    event.preventDefault();
    routeTriageCase(route);
  };

  const signalStrength = spectrumSignal(spectrumFrequency);
  const adjustSpectrum = (delta: number) => {
    setSpectrumFrequency((current) => Math.max(2, Math.min(8, Number((current + delta).toFixed(2)))));
    setSpectrumFeedback({ kind: "initial" });
  };

  const captureSpectrumPeak = () => {
    const nearestIndex = SPECTRUM_PEAKS.reduce((best, peak, index) => (
      Math.abs(peak - spectrumFrequency) < Math.abs(SPECTRUM_PEAKS[best] - spectrumFrequency) ? index : best
    ), 0);
    const distance = Math.abs(SPECTRUM_PEAKS[nearestIndex] - spectrumFrequency);
    if (distance > 0.08) {
      setSpectrumFeedback({ kind: "miss", distance });
      return;
    }
    if (capturedPeaks.has(nearestIndex)) {
      setSpectrumFeedback({ kind: "duplicate" });
      return;
    }
    const next = new Set(capturedPeaks).add(nearestIndex);
    setCapturedPeaks(next);
    setSpectrumFeedback(next.size === SPECTRUM_PEAKS.length
      ? { kind: "complete" }
      : { kind: "captured", frequency: SPECTRUM_PEAKS[nearestIndex] });
  };

  const resetSpectrum = () => {
    setSpectrumFrequency(2);
    setCapturedPeaks(new Set());
    setSpectrumFeedback({ kind: "initial" });
  };

  const totalCapacityTokens = CAPACITY_STAGES.reduce((total, stage) => total + capacity[stage.id], 0);
  const stageCapacities = CAPACITY_STAGES.map((stage) => ({
    ...stage,
    output: capacity[stage.id] * stage.rate,
  }));
  const capacityThroughput = Math.min(...stageCapacities.map((stage) => stage.output));
  const capacityBottlenecks = stageCapacities
    .filter((stage) => stage.output === capacityThroughput)
    .map((stage) => stage.label);
  const capacitySolved = totalCapacityTokens === 12 && capacityThroughput >= 10;

  const adjustCapacity = (stageId: CapacityStageId, delta: number) => {
    setCapacity((current) => {
      const used = CAPACITY_STAGES.reduce((total, stage) => total + current[stage.id], 0);
      const nextValue = current[stageId] + delta;
      if (nextValue < 1 || nextValue > 10 || (delta > 0 && used >= 12)) return current;
      return { ...current, [stageId]: nextValue };
    });
  };

  const resetCapacity = () => setCapacity({ intake: 4, model: 4, review: 4 });

  return (
    <TranslationBoundary locale={locale}><div className="games-app">
      <aside className="games-sidebar">
        <div className="games-logo"><PixelIcon kind="game" /><span>Desk<br />Arcade</span></div>
        <nav className="games-menu" aria-label="Choose an arcade game">
          {ARCADE_GAMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={game === item.id ? "is-active" : ""}
              onClick={() => setGame(item.id)}
              aria-pressed={game === item.id}
            >
              <span className="game-mini-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <p>Seven tiny distractions.<br />Local only. No tracking.<br />One suspicious password.</p>
      </aside>
      <section className="game-stage">
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
        {game === "triage" && (
          <>
            <div className="game-header">
              <div><span>DECISION ACCESSORY 05</span><h3>Evidence Triage</h3></div>
              <div className="puzzle-counter">
                {Math.min(triageIndex + (triageChoice ? 1 : 0), TRIAGE_CASES.length)}
                <small>OF {TRIAGE_CASES.length}</small>
              </div>
            </div>
            <p className="triage-intro">
              Route fictional evidence without automating the human decision. Ready requires ≥85% confidence, no missing pillars and no conflict.
            </p>
            {triageCase ? (
              <div
                className="triage-console"
                tabIndex={0}
                onKeyDown={handleTriageKeys}
                aria-label="Evidence triage keyboard controls"
              >
                <div className="triage-case-header">
                  <span>FICTIONAL CASE</span>
                  <strong>{triageCase.id}</strong>
                  <small>{formatTriageProgress(locale, triageIndex + (triageChoice ? 1 : 0), triageScore)}</small>
                </div>
                <dl className="triage-signals">
                  <div>
                    <dt>Confidence</dt>
                    <dd>{triageCase.confidence}%</dd>
                    <span aria-hidden="true"><i style={{ width: `${triageCase.confidence}%` }} /></span>
                  </div>
                  <div><dt>Missing pillars</dt><dd>{triageCase.missingPillars}</dd></div>
                  <div><dt>Conflict</dt><dd>{triageCase.conflict ? "Yes" : "No"}</dd></div>
                </dl>
                <div className="triage-routes" role="group" aria-label="Choose an evidence route">
                  {(["ready", "review", "abstain"] as const).map((route, index) => {
                    const correctRoute = expectedTriageRoute(triageCase);
                    const selected = triageChoice === route;
                    const revealedCorrect = Boolean(triageChoice) && correctRoute === route;
                    return (
                      <button
                        key={route}
                        type="button"
                        className={`${selected ? "is-selected" : ""}${revealedCorrect ? " is-correct" : ""}${selected && route !== correctRoute ? " is-wrong" : ""}`}
                        onClick={() => routeTriageCase(route)}
                        disabled={Boolean(triageChoice)}
                        aria-pressed={selected}
                        aria-keyshortcuts={String(index + 1)}
                      >
                        <span>{index + 1}</span>{route.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                <p className="triage-key-help">Keys 1–3 also route the selected case.</p>
                <div className={`triage-feedback${triageChoice ? " is-revealed" : ""}`} role="status" aria-live="polite">
                  {triageChoice ? (
                    <>
                      <strong>{triageChoice === expectedTriageRoute(triageCase) ? "Correct." : "Not quite."}</strong>
                      <span>{triageReason(triageCase)}</span>
                      <button className="mac-button" type="button" onClick={nextTriageCase}>
                        {triageIndex === TRIAGE_CASES.length - 1 ? "Review score" : "Next case"}
                      </button>
                    </>
                  ) : (
                    <span>Choose the safest routing action.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="triage-complete" role="status">
                <span aria-hidden="true">✓</span>
                <h4>Desk audit complete.</h4>
                <p>{formatTriageProgress(locale, TRIAGE_CASES.length, triageScore)}</p>
                <small>Ready means evidence is complete enough for a broker to inspect; it never means an automated placement decision.</small>
                <button className="mac-button" type="button" onClick={resetTriage}>Run the cases again</button>
              </div>
            )}
          </>
        )}
        {game === "spectrum" && (
          <>
            <div className="game-header">
              <div><span>RESEARCH ACCESSORY 06</span><h3>Spectrum Dial</h3></div>
              <div className="puzzle-counter">{capturedPeaks.size}<small>OF {SPECTRUM_PEAKS.length}</small></div>
            </div>
            <p className="spectrum-intro">
              Tune a deterministic synthetic 2–8 GHz trace and capture all three peaks. No experimental rows are loaded.
            </p>
            <div className="spectrum-console">
              <div className="spectrum-readout" aria-live="polite">
                <output>{spectrumFrequency.toFixed(2)}<small>GHz</small></output>
                <div>
                  <span>Signal</span>
                  <strong>{signalStrength}%</strong>
                  <meter min="0" max="100" value={signalStrength}>{signalStrength}%</meter>
                </div>
              </div>
              <div className="spectrum-trace" aria-hidden="true">
                {SPECTRUM_PEAKS.map((peak, index) => (
                  <i
                    key={peak}
                    className={capturedPeaks.has(index) ? "is-captured" : ""}
                    style={{ left: `${((peak - 2) / 6) * 100}%` }}
                  />
                ))}
                <b style={{ left: `${((spectrumFrequency - 2) / 6) * 100}%` }} />
              </div>
              <div className="spectrum-scale" aria-hidden="true"><span>2.00</span><span>5.00</span><span>8.00 GHz</span></div>
              <label className="spectrum-slider">
                <span>Spectrum tuning frequency</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.01"
                  value={spectrumFrequency}
                  onChange={(event) => {
                    setSpectrumFrequency(Number(event.target.value));
                    setSpectrumFeedback({ kind: "initial" });
                  }}
                  aria-valuetext={formatSpectrumValue(locale, spectrumFrequency, signalStrength)}
                />
              </label>
              <div className="spectrum-actions">
                <button type="button" onClick={() => adjustSpectrum(-0.1)} aria-label="Decrease frequency by 0.10 GHz">−0.10</button>
                <button className="is-capture" type="button" onClick={captureSpectrumPeak}>Capture peak</button>
                <button type="button" onClick={() => adjustSpectrum(0.1)} aria-label="Increase frequency by 0.10 GHz">+0.10</button>
              </div>
              <p className="spectrum-feedback" role="status" aria-live="polite">
                {formatSpectrumFeedback(locale, spectrumFeedback)}
              </p>
              <div className="spectrum-notebook">
                <strong>Captured peaks</strong>
                <ol>
                  {SPECTRUM_PEAKS.map((peak, index) => (
                    <li key={peak} className={capturedPeaks.has(index) ? "is-captured" : ""}>
                      {capturedPeaks.has(index) ? `${peak.toFixed(2)} GHz` : "—"}
                    </li>
                  ))}
                </ol>
                <button className="mac-button" type="button" onClick={resetSpectrum}>Clear notebook</button>
              </div>
            </div>
          </>
        )}
        {game === "capacity" && (
          <>
            <div className="game-header">
              <div><span>PRODUCT ACCESSORY 07</span><h3>Capacity Desk</h3></div>
              <div className={`game-face ${capacitySolved ? "game-face--won" : ""}`} aria-label={capacitySolved ? "Capacity plan solved" : "Capacity plan in progress"}>
                {capacitySolved ? "^_^" : `${12 - totalCapacityTokens}`}
              </div>
            </div>
            <p className="capacity-intro">
              Reallocate exactly 12 fictional FTE tokens. Throughput is the smallest stage capacity; clear 10 cases without weakening review.
            </p>
            <div className="capacity-console">
              <div className="capacity-summary">
                <div><span>THROUGHPUT</span><strong>{capacityThroughput}</strong><small>cases / cycle</small></div>
                <div><span>TOKENS USED</span><strong>{totalCapacityTokens}</strong><small>of 12</small></div>
                <div><span>BOTTLENECK</span><strong>{capacityBottlenecks.map((label) => translateText(locale, label)).join(" + ")}</strong><small>lowest capacity</small></div>
              </div>
              <div className="capacity-stages">
                {stageCapacities.map((stage) => (
                  <section key={stage.id} className={stage.output === capacityThroughput ? "is-bottleneck" : ""}>
                    <header><strong>{stage.label}</strong><span>{stage.rate} cases / token</span></header>
                    <div className="capacity-meter" aria-hidden="true"><i style={{ width: `${Math.min(100, (stage.output / 16) * 100)}%` }} /></div>
                    <output>{stage.output}<small>capacity</small></output>
                    <div className="capacity-stepper" role="group" aria-label={`${stage.label} allocation`}>
                      <button type="button" onClick={() => adjustCapacity(stage.id, -1)} aria-label={`Decrease ${stage.label} allocation`} disabled={capacity[stage.id] <= 1}>−</button>
                      <strong>{capacity[stage.id]}<small>tokens</small></strong>
                      <button type="button" onClick={() => adjustCapacity(stage.id, 1)} aria-label={`Increase ${stage.label} allocation`} disabled={totalCapacityTokens >= 12}>+</button>
                    </div>
                  </section>
                ))}
              </div>
              <div className={`capacity-status${capacitySolved ? " is-solved" : ""}`} role="status" aria-live="polite">
                <span>{capacitySolved
                  ? "Balanced. Ten fictional cases clear every stage."
                  : totalCapacityTokens < 12
                    ? "Assign every token, then inspect the bottleneck."
                    : "Move one token away from excess capacity and protect the limiting stage."}</span>
                <button className="mac-button" type="button" onClick={resetCapacity}>Reset plan</button>
              </div>
              <p className="capacity-boundary">Fictional planning model; no employer data, storage or network calls.</p>
            </div>
          </>
        )}
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

function ServiceIcon({ code, tone }: { code: string; tone: string }) {
  return <span className={`service-pixel-icon service-pixel-icon--${tone}`} aria-hidden="true">{code}</span>;
}

function LabApp({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState("All");
  const services = [
    { group: "Compute", code: "PX", tone: "violet", name: "Proxmox", host: "Virtualisation cluster", description: "Runs isolated VMs and Linux containers for the heavier parts of the lab." },
    { group: "Compute", code: "AI", tone: "blue", name: "Local AI GPU", host: "Private GPU workspace", description: "A self-reported private-fleet entry for local model training and inference through an Open WebUI workspace." },
    { group: "Compute", code: "DEV", tone: "navy", name: "Code Servers", host: "Browser IDEs", description: "GPU-connected VS Code environments for remote development and experiments." },
    { group: "Compute", code: "KVM", tone: "grey", name: "GLKVM", host: "Physical console", description: "Out-of-band keyboard, video and mouse access when a server stops responding." },
    { group: "Network", code: "NPM", tone: "green", name: "Nginx Proxy Manager", host: "TLS gateway", description: "Routes public domains to private services and manages HTTPS certificates." },
    { group: "Network", code: "WG", tone: "blue", name: "WireGuard", host: "Private access", description: "Encrypted remote entry to the home network without exposing internal tools." },
    { group: "Network", code: "DNS", tone: "red", name: "Pi-hole", host: "Network protection", description: "Network-wide DNS filtering for adverts, trackers and unwanted domains." },
    { group: "Network", code: "F2B", tone: "orange", name: "Fail2ban", host: "Intrusion response", description: "Watches service logs and automatically blocks repeated hostile requests." },
    { group: "Network", code: "RDP", tone: "violet", name: "Guacamole", host: "Remote desktop", description: "Browser-based access to SSH, VNC and remote desktop sessions." },
    { group: "Operations", code: "CT", tone: "blue", name: "Portainer", host: "Container operations", description: "A visual control room for container health, deployments, images and networks." },
    { group: "Operations", code: "CI", tone: "green", name: "GitHub Actions Runner", host: "Self-hosted CI", description: "Runs deployment jobs across Samuel’s own hardware, coordinates different CPU architectures and avoids substantial hosted-runner costs." },
    { group: "Operations", code: "HP", tone: "navy", name: "Homepage", host: "Service directory", description: "A documented directory for service links and operational notes." },
    { group: "Operations", code: "JOB", tone: "orange", name: "Ofelia", host: "Job scheduler", description: "Runs automated database backups and recurring maintenance inside Docker." },
    { group: "Data", code: "SQL", tone: "blue", name: "PostgreSQL", host: "Application data", description: "Stores environmental telemetry, product data and historical measurements." },
    { group: "Data", code: "CO2", tone: "green", name: "Aranet Air Quality", host: "BLE → SQL → Grafana", description: "Documents a Bluetooth-to-dashboard path for CO₂, temperature, humidity and pressure." },
    { group: "Data", code: "HA", tone: "amber", name: "Home Assistant", host: "Automation hub", description: "Connects sensors, energy data and smart-home devices into one event-driven system." },
    { group: "Storage", code: "RAID", tone: "green", name: "Storage pool", host: "Private fleet inventory", description: "RAID storage supports private media and datasets. The public six-service audit documents backup intent and a restore script, but does not claim verified recovery." },
    { group: "Storage", code: "NAS", tone: "grey", name: "Synology Cloud", host: "Files & photos", description: "Private file sync, photo management and resilient network storage." },
    { group: "Storage", code: "NC", tone: "blue", name: "Nextcloud", host: "Private cloud", description: "Self-hosted document access and synchronisation across personal devices." },
    { group: "Media", code: "JF", tone: "violet", name: "Jellyfin", host: "Home cinema", description: "Documents a private media-library and playback-monitoring service." },
    { group: "Media", code: "KX", tone: "amber", name: "Kiwix", host: "Offline knowledge", description: "Serves offline Wikipedia and reference libraries without an internet connection." },
    { group: "Apps", code: "ERP", tone: "green", name: "Frappe / ERPNext", host: "Business systems lab", description: "A containerised environment for exploring open-source ERP and workflow software." },
    { group: "Apps", code: "ODO", tone: "violet", name: "Odoo Lab", host: "Application sandbox", description: "A separate test stack for business application and database experiments." },
  ];
  const groups = ["All", "Compute", "Network", "Operations", "Data", "Storage", "Media", "Apps"];
  const visibleServices = filter === "All" ? services : services.filter((service) => service.group === filter);

  return (
    <TranslationBoundary locale={locale}><div className="lab-app">
      <header className="document-header">
        <div><span className="eyebrow">PERSONAL INFRASTRUCTURE</span><h3>A small internet, built at home.</h3></div>
        <span className="online-badge">◆ {services.length} INVENTORY ENTRIES</span>
      </header>
      <div className="lab-summary">
        <p>
          This is a self-reported private-fleet inventory, not a live status page. The
          source-audited public exhibit covers one six-service Docker Compose snapshot:
          it declares a daily PostgreSQL backup job and includes a restore script, while
          availability, recovery success and the wider fleet remain unverified here.
        </p>
        <dl>
          <div><dt>Audited Compose slice</dt><dd>6 services</dd></div>
          <div><dt>Declared health checks</dt><dd>0</dd></div>
          <div><dt>Backup schedule</dt><dd>Daily intent</dd></div>
          <div><dt>Inventory entries</dt><dd>{services.length}</dd></div>
        </dl>
      </div>
      <div className="lab-filters" role="group" aria-label="Filter infrastructure">
        {groups.map((group) => (
          <button key={group} className={filter === group ? "is-active" : ""} aria-pressed={filter === group} onClick={() => setFilter(group)}>{group}</button>
        ))}
      </div>
      <div className="service-grid">
        {visibleServices.map((service) => (
          <article className="service-card" key={service.name}>
            <ServiceIcon code={service.code} tone={service.tone} />
            <div className="service-card__copy">
              <div><h4>{service.name}</h4><span><i />DOCUMENTED</span></div>
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
      detail: "The home lab began before ‘vibe coding’ made infrastructure approachable. It has included hand-built servers, Proxmox, mixed CPU architectures and one database-erasing lesson. The public project exhibit audits a six-service Compose snapshot and backup intent; it does not claim live fleet health or verified recovery.",
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
                className="scrap-note__toggle"
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
}: {
  id: AppId;
  openApp: (id: AppId) => void;
  locale: Locale;
  initialProjectSlug?: string;
}) {
  switch (id) {
    case "about": return <AboutApp openApp={openApp} locale={locale} />;
    case "coverd": return <CoverdApp locale={locale} />;
    case "experience": return <ExperienceApp locale={locale} />;
    case "projects": return <ProjectsApp openApp={openApp} locale={locale} initialSlug={initialProjectSlug} />;
    case "sidequest": return <SideQuestCabinetApp locale={locale} />;
    case "skills": return <SkillsApp locale={locale} />;
    case "education": return <EducationApp locale={locale} />;
    case "documents": return <DocumentsApp locale={locale} />;
    case "games": return <GamesApp openApp={openApp} locale={locale} />;
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
}: {
  initialApp?: AppId;
  skipBoot?: boolean;
  initialLocale?: Locale;
  initialProjectSlug?: string;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [windows, setWindows] = useState(() =>
    INITIAL_WINDOWS.map((windowState) => ({
      ...windowState,
      open: windowState.id === initialApp,
      // Direct project and SideQuest permalinks are working surfaces rather
      // than small desktop previews. Give their interactive evidence views the
      // available canvas immediately; apps opened later from the desktop keep
      // their classic floating-window sizes.
      maximized: (windowState.id === "projects" || windowState.id === "sidequest")
        && initialApp === windowState.id,
    })),
  );
  const [activeId, setActiveId] = useState<AppId>(initialApp);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [booting, setBooting] = useState(!skipBoot);
  const [bootMessageIndex, setBootMessageIndex] = useState(0);
  const [clock, setClock] = useState("--:--");
  const [pattern, setPattern] = useState<"classic" | "blue">("classic");
  const [memoryMagic, setMemoryMagic] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileGuide, setMobileGuide] = useState(false);
  const zCounter = useRef(20);
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
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileGuideButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusByApp = useRef<Partial<Record<AppId, HTMLElement>>>({});

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
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", closeMenus);
    return () => window.removeEventListener("keydown", closeMenus);
  }, []);

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, [locale]);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
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
      if (resize && window.innerWidth > 720) {
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
      if (!drag || window.innerWidth <= 720) return;
      setWindows((current) =>
        current.map((windowState) =>
          windowState.id === drag.id
            ? {
                ...windowState,
                x: Math.max(4, Math.min(window.innerWidth - 180, event.clientX - drag.offsetX)),
                y: Math.max(26, Math.min(window.innerHeight - 80, event.clientY - drag.offsetY)),
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

  const focusWindow = (id: AppId) => {
    const nextZ = ++zCounter.current;
    setActiveId(id);
    setWindows((current) => current.map((item) => item.id === id ? { ...item, z: nextZ } : item));
  };

  const openApp = useCallback((id: AppId) => {
    if (document.activeElement instanceof HTMLElement) returnFocusByApp.current[id] = document.activeElement;
    const nextZ = ++zCounter.current;
    setWindows((current) => current.map((item) => item.id === id ? { ...item, open: true, z: nextZ } : item));
    setActiveId(id);
    setSelectedIcon(id);
    setOpenMenu(null);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-app-id="${id}"] .window-close`)?.focus();
    });
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const chooseLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setOpenMenu(null);
    const url = new URL(window.location.href);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] && normaliseLocale(segments[0])) {
      segments[0] = localeSlug(nextLocale);
      url.pathname = `/${segments.join("/")}`;
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", nextLocale);
    }
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  };

  const closeApp = (id: AppId) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, open: false } : item));
    const remaining = windows.filter((item) => item.open && item.id !== id).sort((a, b) => b.z - a.z);
    setActiveId(remaining[0]?.id ?? "about");
    window.requestAnimationFrame(() => {
      const returnTarget = returnFocusByApp.current[id];
      if (returnTarget?.isConnected) returnTarget.focus();
      else if (remaining[0]) document.querySelector<HTMLButtonElement>(`[data-app-id="${remaining[0].id}"] .window-close`)?.focus();
    });
  };

  const focusLanguageOption = (position: "first" | "last") => {
    window.requestAnimationFrame(() => {
      const options = languageMenuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
      if (!options?.length) return;
      options[position === "first" ? 0 : options.length - 1].focus();
    });
  };

  const handleLanguageMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
    if (options.length === 0) return;
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
    else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      setOpenMenu(null);
      languageButtonRef.current?.focus();
      return;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    options[nextIndex]?.focus();
  };

  const toggleZoom = (id: AppId) => {
    // Small-screen windows already occupy the fixed usable canvas; toggling
    // the desktop maximize bit cannot produce a meaningful visual state.
    if (window.innerWidth <= 720) return;
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
    setWindows(INITIAL_WINDOWS.map((item) => ({ ...item, open: item.id === "about" })));
    setActiveId("about");
    setMemoryMagic(false);
    setToast(null);
    setBooting(true);
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
    if (!target || target.maximized) return;
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
    if (!target || target.maximized || window.innerWidth <= 720) return;
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
        <button>Click anywhere to skip startup</button>
      </main></TranslationBoundary>
    );
  }

  return (
    <TranslationBoundary locale={locale}><main
      className={`system-desktop desktop-pattern--${pattern}`}
      data-locale={locale}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedIcon(null);
          setOpenMenu(null);
        }
      }}
    >
      <nav className="system-menubar" aria-label="System menu bar">
        <div className="menu-cluster">
          <div className="menu-root">
            <button className={openMenu === "apple" ? "is-open apple-menu" : "apple-menu"} onClick={() => setOpenMenu(openMenu === "apple" ? null : "apple")} aria-label="Samuel menu" aria-controls="samuel-menu" aria-expanded={openMenu === "apple"}>
              <svg className="human-mark" viewBox="0 0 18 18" aria-hidden="true" shapeRendering="crispEdges">
                <circle cx="9" cy="5" r="3" />
                <path d="M3 17v-3c0-3.2 2.4-5 6-5s6 1.8 6 5v3z" />
              </svg>
            </button>
            {openMenu === "apple" && (
              <div className="menu-dropdown apple-dropdown" id="samuel-menu">
                <button onClick={() => openApp("about")}><PixelIcon kind="computer" small />About Samuel Zhang…</button>
                <button onClick={() => openApp("coverd")}><PixelIcon kind="coverd" small />COVERD — Founder’s Desk</button>
                <button onClick={() => openApp("sidequest")}><PixelIcon kind="runner" small />RUN/HACK — SideQuest</button>
                <hr />
                <button onClick={() => openApp("skills")}><PixelIcon kind="controls" small />Skills &amp; Capabilities</button>
                <button onClick={() => openApp("documents")}><PixelIcon kind="pdf" small />Documents</button>
                <button onClick={() => openApp("games")}><PixelIcon kind="game" small />Desk Arcade</button>
                <button onClick={() => openApp("contact")}><PixelIcon kind="mail" small />Contact Samuel</button>
                <button onClick={() => openApp("scrapbook")}><PixelIcon kind="photos" small />Interests &amp; Notes</button>
                <hr />
                <button onClick={restart}>Restart…</button>
              </div>
            )}
          </div>
          <strong className="active-application">{activeTitle}</strong>
          <div className="menu-root">
            <button className={openMenu === "file" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "file" ? null : "file")} aria-controls="file-menu" aria-expanded={openMenu === "file"}>File</button>
            {openMenu === "file" && <div className="menu-dropdown" id="file-menu"><button onClick={() => openApp("documents")}>Open Documents…</button><hr /><button onClick={closeActive}>Close Window <kbd>⌘W</kbd></button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button className={openMenu === "edit" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")} aria-controls="edit-menu" aria-expanded={openMenu === "edit"}>Edit</button>
            {openMenu === "edit" && <div className="menu-dropdown" id="edit-menu"><button className="is-disabled" disabled>Undo <kbd>⌘Z</kbd></button><hr /><button className="is-disabled" disabled>Cut <kbd>⌘X</kbd></button><button className="is-disabled" disabled>Copy <kbd>⌘C</kbd></button><button className="is-disabled" disabled>Paste <kbd>⌘V</kbd></button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button className={openMenu === "view" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "view" ? null : "view")} aria-controls="view-menu" aria-expanded={openMenu === "view"}>View</button>
            {openMenu === "view" && <div className="menu-dropdown" id="view-menu"><button onClick={() => setPattern("classic")}>{pattern === "classic" ? "✓ " : ""}Classic Pattern</button><button onClick={() => setPattern("blue")}>{pattern === "blue" ? "✓ " : ""}Blue Pattern</button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button className={openMenu === "special" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "special" ? null : "special")} aria-controls="special-menu" aria-expanded={openMenu === "special"}>Special</button>
            {openMenu === "special" && <div className="menu-dropdown" id="special-menu"><button onClick={() => openApp("games")}>Desk Arcade</button><hr /><button onClick={() => { setWindows((current) => current.map((item) => ({ ...item, open: false }))); setOpenMenu(null); }}>Hide All Windows</button><button onClick={() => openApp("secret")}>About This Secret…</button><button onClick={restart}>Restart</button></div>}
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
              ref={languageButtonRef}
              className={openMenu === "language" ? "is-open" : ""}
              onClick={() => setOpenMenu(openMenu === "language" ? null : "language")}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                event.preventDefault();
                setOpenMenu("language");
                focusLanguageOption(event.key === "ArrowDown" ? "first" : "last");
              }}
              aria-haspopup="menu"
              aria-expanded={openMenu === "language"}
              aria-controls={openMenu === "language" ? "language-menu" : undefined}
              aria-label={`${translateText(locale, "Language")}: ${activeLocaleOption.label}`}
              title="Language"
            >
              <span className="language-label">Language</span>
              <span className="language-short">文/A</span>
            </button>
            {openMenu === "language" && (
              <div ref={languageMenuRef} className="menu-dropdown language-dropdown" id="language-menu" role="menu" aria-label="Language" onKeyDown={handleLanguageMenuKeyDown}>
                {localeOptions.map((option) => (
                  <button
                    key={option.locale}
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
            aria-label={`${translateText(locale, "Current time")}: ${clock}`}
            onDoubleClick={() => { openApp("secret"); showToast("Time is an implementation detail."); }}
          >{clock}</button>
        </div>
      </nav>

      <div className="desktop-icons" role="group" aria-label="Desktop items">
        {DESKTOP_ICONS.map((item) => (
          <button
            key={item.id}
            className={`desktop-icon${selectedIcon === item.id ? " is-selected" : ""}`}
            title={`${translateText(locale, item.label)}: ${translateText(locale, item.description)}`}
            aria-label={`${translateText(locale, item.label)}. ${translateText(locale, item.description)} ${translateText(locale, "Double-click to open.")}`}
            aria-pressed={selectedIcon === item.id}
            onClick={() => setSelectedIcon(item.id)}
            onDoubleClick={() => openApp(item.id)}
            onPointerUp={(event) => { if (event.pointerType === "touch") openApp(item.id); }}
            onKeyDown={(event) => { if (event.key === "Enter") openApp(item.id); }}
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
          <AppContent id={windowState.id} openApp={openApp} locale={locale} initialProjectSlug={initialProjectSlug} />
        </WindowChrome>
      ))}

      <div className={`desktop-hint${selectedDesktopItem ? " has-selection" : ""}`}>
        {selectedDesktopItem ? (
          <>
            <strong>{translateText(locale, selectedDesktopItem.label)}</strong>
            <span>{translateText(locale, selectedDesktopItem.description)} {translateText(locale, "Double-click to open.")}</span>
          </>
        ) : (
          <span>Select an icon to learn what it opens · Double-click to launch · Drag title bars to move · Drag lower-right corners to resize</span>
        )}
      </div>
      <div className="window-switcher" role="navigation" aria-label="Open applications">
        {openWindows.map((item) => (
          <button key={item.id} className={activeId === item.id ? "is-active" : ""} onClick={() => focusWindow(item.id)} aria-label={`${translateText(locale, "Show")} ${translateText(locale, item.title)}`}>
            <PixelIcon kind={DESKTOP_ICONS.find((icon) => icon.id === item.id)?.icon ?? "document"} small />
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
              <strong id="mobile-guide-title">Windows on a small screen</strong>
            </div>
            <p id="mobile-guide-copy">
              Tap the small square at a window’s top-left to close it. Mobile windows stay
              full-screen, so dragging is disabled; use the bar along the bottom to switch
              between anything that is open.
            </p>
            <button ref={mobileGuideButtonRef} onClick={dismissMobileGuide}>Got it</button>
          </aside>
        </>
      )}
      {toast && <div className="system-toast" role="status"><PixelIcon kind="computer" small /><span>{toast}</span></div>}
    </main></TranslationBoundary>
  );
}
