"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AppId =
  | "about"
  | "coverd"
  | "finder"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "resume"
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
  | "disk"
  | "photos"
  | "game"
  | "pdf"
  | "mail"
  | "secret";

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
    x: 166,
    y: 78,
    width: 676,
    height: 532,
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
    id: "finder",
    title: "Portfolio Index",
    x: 86,
    y: 116,
    width: 610,
    height: 430,
    z: 2,
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
    title: "Selected Projects",
    x: 148,
    y: 70,
    width: 820,
    height: 584,
    z: 4,
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
    id: "resume",
    title: "Résumé & Profile",
    x: 246,
    y: 58,
    width: 650,
    height: 606,
    z: 7,
    open: false,
    maximized: false,
  },
  {
    id: "documents",
    title: "CV & Papers",
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
  { id: "finder", label: "Portfolio Index", icon: "disk", description: "A directory of everything available in this portfolio." },
  { id: "experience", label: "Experience", icon: "briefcase", description: "Professional history from emergency operations to applied AI." },
  { id: "projects", label: "Projects", icon: "folder", description: "Selected products, research and technical builds." },
  { id: "skills", label: "Skills", icon: "controls", description: "Technical, product, research and leadership capabilities." },
  { id: "education", label: "Education", icon: "university", description: "Imperial, King’s College London and academic awards." },
  { id: "resume", label: "Résumé", icon: "document", description: "A concise, in-browser professional profile." },
  { id: "documents", label: "CV & Papers", icon: "pdf", description: "Full CV, thesis and GROWMAT documents in the built-in reader." },
  { id: "games", label: "Desk Arcade", icon: "game", description: "Four small games with profile-themed easter eggs." },
  { id: "lab", label: "Home Lab", icon: "network", description: "Samuel’s self-hosted AI, storage and automation infrastructure." },
  { id: "scrapbook", label: "Interests", icon: "photos", description: "Photography, hiking, music, teaching and life outside work." },
  { id: "contact", label: "Contact", icon: "mail", description: "Email, LinkedIn and GitHub without leaving the desktop." },
];

const finderItems: Array<{
  id: AppId;
  name: string;
  kind: IconKind;
  meta: string;
}> = [
  { id: "coverd", name: "COVERD — Founder’s Desk", kind: "coverd", meta: "Flagship venture" },
  { id: "experience", name: "Experience", kind: "briefcase", meta: "7 roles" },
  { id: "projects", name: "Selected Projects", kind: "folder", meta: "9 items" },
  { id: "skills", name: "Skills & Capabilities", kind: "controls", meta: "6 groups" },
  { id: "education", name: "Education & Awards", kind: "university", meta: "2 folders" },
  { id: "lab", name: "Home Lab Network", kind: "network", meta: "Online" },
  { id: "scrapbook", name: "Interests & Notes", kind: "photos", meta: "9 clippings" },
  { id: "resume", name: "Résumé & Profile", kind: "document", meta: "In-browser profile" },
  { id: "documents", name: "CV & Papers", kind: "pdf", meta: "3 documents" },
  { id: "games", name: "Desk Arcade", kind: "game", meta: "4 games" },
  { id: "contact", name: "Contact Samuel", kind: "mail", meta: "3 channels" },
];

const experience = [
  {
    period: "May 2026 — Present",
    role: "AI Intern — Data & Machine Learning",
    company: "Marsh Risk",
    location: "London",
    copy: "Investigating how historical placement data and contract wording can support evidence-bounded decisions in the London insurance market—preserving provenance, uncertainty and the limits of what each source can prove.",
    tag: "CURRENT",
  },
  {
    period: "Mar 2026 — Present",
    role: "Founder",
    company: "coverd.ai",
    location: "London",
    copy: "Building the AI interviewer that interviews the company first: an adaptive system that updates a role-specific belief graph as evidence arrives, then chooses the next useful question.",
    tag: "FOUNDER",
  },
  {
    period: "Nov 2025 — Present",
    role: "Co-founder",
    company: "Stealth AI Startup",
    location: "London",
    copy: "Developing recruitment technology focused on bias reduction and responsible AI.",
    tag: "VENTURE",
  },
  {
    period: "Oct 2024 — Apr 2026",
    role: "Web Application Developer · Product Owner",
    company: "Pfizer",
    location: "London",
    copy: "Owned GROWMAT from business discovery to adoption: connecting technical capability with real staff availability, choosing maintainable tools over fashionable ones, and earning stakeholder trust through a highly polished product.",
    tag: "PRODUCT",
  },
  {
    period: "Sep 2023 — Aug 2024",
    role: "Data Analyst Undergraduate",
    company: "Pfizer Analytical R&D",
    location: "Sandwich",
    copy: "Built enterprise resource and analytics systems delivering a 1200% efficiency gain, 120+ person-hours saved monthly, 99.9% uptime, and an 80% performance improvement across 40+ analysts.",
    tag: "DATA",
  },
  {
    period: "2022 — 2025",
    role: "STEM Outreach Officer · Coding Tutor",
    company: "KCL Chemistry Society",
    location: "London",
    copy: "Designed 20+ programming and data-analysis sessions for 80+ students with 90% satisfaction; secured Royal Society of Chemistry endorsement—and later watched one student earn an offer from Microsoft.",
    tag: "EDUCATION",
  },
  {
    period: "Jun — Jul 2023",
    role: "Royal Society Summer Fellow",
    company: "King’s College London",
    location: "London",
    copy: "Architected GPU-accelerated GROMACS infrastructure for molecular simulations, improving performance by 70% while researching protein–membrane interactions in silico.",
    tag: "RESEARCH",
  },
  {
    period: "Jun — Jul 2022",
    role: "Undergraduate Research Fellow",
    company: "King’s College London",
    location: "London",
    copy: "Created MATLAB, Python and Excel pipelines for rotational spectroscopy, reducing processing time by 40% and establishing a workflow adopted by the research group.",
    tag: "RESEARCH",
  },
  {
    period: "Jul 2019 — Jul 2021",
    role: "HR NSF · Commander's Personal Assistant",
    company: "Singapore Civil Defence Force",
    location: "Singapore",
    copy: "Built predictive COVID-19 resource planning and emergency activation systems for 1,200+ personnel. Sergeant-level service taught me to seek missing information quickly, prioritise ruthlessly and own decisions made under uncertainty.",
    tag: "SERVICE",
  },
];

const projects: Array<{
  title: string;
  year: string;
  category: string;
  description: string;
  tools: string[];
  metric: string;
  app?: AppId;
}> = [
  {
    title: "coverd.ai",
    year: "2026",
    category: "Responsible AI · Founder",
    description:
      "The AI interviewer that interviews the company first—using a role-specific belief graph to adapt each interview, ask for missing evidence and return a cited evaluation.",
    tools: ["Adaptive interviews", "Belief graphs", "Voice AI", "Product"],
    metric: "4 DESIGN PARTNERS",
    app: "coverd",
  },
  {
    title: "GROWMAT",
    year: "2023—26",
    category: "Enterprise Product · Pfizer",
    description:
      "A resource, forecasting and analytics platform for pharmaceutical R&D, shaped through deep operational discovery and trust-building—not technology for technology’s sake.",
    tools: ["Next.js", "Julia", "PostgreSQL", "Docker"],
    metric: "1200% FASTER",
    app: "documents",
  },
  {
    title: "Insurance Lead Matching",
    year: "2026",
    category: "MSc Thesis · Marsh",
    description:
      "Research testing how historical placement data and contract wording can support decision-making without overstating what retrospective evidence can prove. Early work made the cost of scattered, inconsistent data impossible to ignore.",
    tools: ["Ranking", "Document AI", "Evaluation", "Governance"],
    metric: "EVIDENCE-BOUNDED AI",
    app: "resume",
  },
  {
    title: "Drug Solubility Modelling",
    year: "2023",
    category: "Scientific Programming · Pfizer",
    description:
      "Predictive modelling using statistical thermodynamics and Julia to reduce experimental testing requirements.",
    tools: ["Julia", "ML", "PC-SAFT", "Pharma"],
    metric: "R&D ACCELERATOR",
    app: "resume",
  },
  {
    title: "COVID-19 Decision Support",
    year: "2020",
    category: "Emergency Operations · SCDF",
    description:
      "Predictive analytics and cross-system workflow automation for emergency planning and 1,000+ frontline personnel.",
    tools: ["MATLAB", "Statistics", "Automation"],
    metric: "1000+ PEOPLE",
    app: "experience",
  },
  {
    title: "Molecular Recognition",
    year: "2022",
    category: "Research Fellowship · King's",
    description:
      "Automated Excel and MATLAB workflows combining microwave spectroscopy with computational predictions for chiral odorant research.",
    tools: ["MATLAB", "Spectroscopy", "Research"],
    metric: "KURF AWARD",
    app: "documents",
  },
  {
    title: "Home Automation & AI Infrastructure",
    year: "ONGOING",
    category: "Self-hosting · Systems",
    description:
      "Seven physical servers assembled and connected over four-plus years: Proxmox, Docker, cross-architecture workloads, self-hosted CI, private AI, networking, security, storage and observability.",
    tools: ["Docker", "Linux", "PostgreSQL", "GPU"],
    metric: "7 SERVERS",
    app: "lab",
  },
  {
    title: "Stock Market Simulation Engine",
    year: "2025",
    category: "Full-stack · Financial systems",
    description:
      "Market simulator with order-matching algorithms, Julia and SQL processing, live WebSocket order-book updates, and a responsive trading interface.",
    tools: ["Julia", "SQL", "WebSockets", "React"],
    metric: "REAL-TIME ENGINE",
  },
  {
    title: "Coding Series",
    year: "2023—25",
    category: "Teaching · Curriculum",
    description:
      "A department-backed programming and machine-learning course designed for chemistry students without a traditional computing background.",
    tools: ["Python", "Data analysis", "Teaching", "Outreach"],
    metric: "80+ STUDENTS",
    app: "experience",
  },
];

const skillGroups = [
  {
    title: "Artificial Intelligence",
    level: 91,
    items: ["PyTorch & TensorFlow", "CNNs & LLMs", "Scikit-learn", "Responsible AI"],
  },
  {
    title: "Product & Entrepreneurship",
    level: 93,
    items: ["Product ownership", "Design partnerships", "Stakeholder trust", "Evidence over hype"],
  },
  {
    title: "Data & Engineering",
    level: 90,
    items: ["Python & Julia", "SQL & PostgreSQL", "React & TypeScript", "APIs & data pipelines"],
  },
  {
    title: "Scientific Computing",
    level: 86,
    items: ["Statistical modelling", "GROMACS & HPC", "MATLAB", "Computational chemistry"],
  },
  {
    title: "Infrastructure",
    level: 82,
    items: ["Docker & Linux", "AWS & CI/CD", "GPU computing", "Self-hosting"],
  },
  {
    title: "Human Skills",
    level: 94,
    items: ["People leadership", "Conflict resolution", "Teaching & mentoring", "Cross-cultural teams"],
  },
];

function PixelIcon({ kind, small = false }: { kind: IconKind; small?: boolean }) {
  const common = {
    fill: "none",
    stroke: "#111",
    strokeWidth: 3,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };

  const artwork: Record<IconKind, React.ReactNode> = {
    profile: (
      <g {...common}>
        <circle cx="24" cy="14" r="8" fill="#f2ca59" />
        <path d="M8 44v-5c0-10 6-16 16-16s16 6 16 16v5z" fill="#d7d7d1" />
        <path d="M15 40h18" stroke="#11177a" strokeWidth="2" />
      </g>
    ),
    coverd: (
      <g strokeLinecap="square" strokeLinejoin="miter">
        <rect x="4" y="5" width="40" height="38" fill="#111" stroke="#111" strokeWidth="3" />
        <path d="M34 16c-2-3-5-5-9-5-8 0-13 6-13 13s5 13 13 13c4 0 7-2 9-5" fill="none" stroke="#fff" strokeWidth="5" />
        <rect x="36" y="34" width="4" height="4" fill="#db2f3d" />
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
    disk: (
      <g {...common}>
        <rect x="4" y="3" width="40" height="42" rx="2" fill="#c5c5c0" />
        <rect x="11" y="7" width="26" height="13" fill="#fff" />
        <rect x="11" y="28" width="26" height="13" fill="#eee" />
        <path d="M31 8v9M15 33h18M15 37h18" strokeWidth="2" />
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
  children,
}: {
  windowState: WindowState;
  active: boolean;
  onFocus: () => void;
  onClose: () => void;
  onZoom: () => void;
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`mac-window${active ? " is-active" : ""}${windowState.maximized ? " is-maximized" : ""}`}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.z,
      }}
      onPointerDown={onFocus}
      aria-label={`${windowState.title} window`}
    >
      <div
        className="mac-titlebar"
        onPointerDown={onDragStart}
        onDoubleClick={onZoom}
      >
        <button className="window-box window-close" onClick={onClose} aria-label={`Close ${windowState.title}`} />
        <h2>{windowState.title}</h2>
        <button className="window-box window-zoom" onClick={onZoom} aria-label={`Maximize ${windowState.title}`} />
      </div>
      <div className="mac-window__content">{children}</div>
      <div className="fake-scrollbar" aria-hidden="true">
        <span className="scroll-arrow scroll-arrow--up" />
        <span className="scroll-track" />
        <span className="scroll-arrow scroll-arrow--down" />
      </div>
      <span className="resize-corner" aria-hidden="true" />
    </section>
  );
}

function AboutApp({ openApp }: { openApp: (id: AppId) => void }) {
  return (
    <div className="about-app">
      <div className="about-sidebar">
        <div className="portrait-frame">
          <Image src="/headshot.jpg" alt="Samuel Zhang" fill sizes="170px" priority />
        </div>
        <p className="portrait-caption">SAMUEL.ZHANG</p>
        <dl className="quick-facts">
          <div><dt>Location</dt><dd>London, UK</dd></div>
          <div><dt>Current</dt><dd>Marsh Risk</dd></div>
          <div><dt>Venture</dt><dd>coverd.ai</dd></div>
          <div><dt>Direction</dt><dd>Product leadership</dd></div>
        </dl>
      </div>
      <div className="about-main">
        <div className="eyebrow">ABOUT THIS MACINTOSH</div>
        <h1>Samuel Zhang</h1>
        <p className="hero-role">People-powered generalist · AI · product · founder.</p>
        <p className="hero-copy">
          My first product was a clickable Visual Basic periodic table for the IB. Nobody
          used it; building it was the revelation. Chemistry later taught me to design
          honest experiments, while SCDF, Pfizer, Marsh and COVERD taught me that useful
          systems depend on trust, attention and the right tool—not the loudest one.
        </p>
        <nav className="identity-switchboard" aria-label="Samuel’s cabinet of curiosities">
          <span>CABINET OF CURIOSITIES</span>
          <button onClick={() => openApp("coverd")}><PixelIcon kind="coverd" small /><b>Founder</b></button>
          <button onClick={() => openApp("projects")}><PixelIcon kind="briefcase" small /><b>Product</b></button>
          <button onClick={() => openApp("experience")}><PixelIcon kind="university" small /><b>Scientist</b></button>
          <button onClick={() => openApp("lab")}><PixelIcon kind="network" small /><b>Builder</b></button>
          <button onClick={() => openApp("scrapbook")}><PixelIcon kind="photos" small /><b>Musician</b></button>
        </nav>
        <div className="impact-grid">
          <div><strong>1200%</strong><span>efficiency gain</span></div>
          <div><strong>120+</strong><span>hours saved / month</span></div>
          <div><strong>99.9%</strong><span>system uptime</span></div>
        </div>
        <blockquote>
          “A people-centred generalist: technically curious, attentive in a room, and
          happiest when helping other people do their best work.”
        </blockquote>
        <div className="button-row">
          <button className="mac-button is-default" onClick={() => openApp("coverd")}>Explore COVERD</button>
          <button className="mac-button" onClick={() => openApp("projects")}>View Work</button>
          <button className="mac-button" onClick={() => openApp("resume")}>Open Résumé</button>
          <button className="mac-button" onClick={() => openApp("contact")}>Contact</button>
        </div>
      </div>
    </div>
  );
}

function CoverdApp() {
  const products = [
    {
      code: "01",
      title: "Company Interview",
      copy: "Starts with the company—not the candidate—to learn how the role really works, what success looks like and which gaps matter.",
    },
    {
      code: "02",
      title: "Belief Graph",
      copy: "Turns role knowledge into a working model of what is known, what remains uncertain and which evidence would be most useful next.",
    },
    {
      code: "03",
      title: "Adaptive Voice Interview",
      copy: "As the candidate answers, the model updates its beliefs and chooses increasingly useful follow-up questions instead of reading a fixed script.",
    },
    {
      code: "04",
      title: "Cited Evaluation",
      copy: "Gives recruiters a structured evaluation grounded in what the candidate actually said, with evidence they can inspect rather than a mysterious score.",
    },
    {
      code: "05",
      title: "Outcome Learning",
      copy: "Connects hiring outcomes back to the role model so the system can improve while recruiters remain responsible for every consequential decision.",
    },
  ];

  const pipeline = [
    ["01", "Interview the team", "Learn from managers and top performers before assessing anyone."],
    ["02", "Build the belief graph", "Represent what matters, what is known and where evidence is still missing."],
    ["03", "Adapt the interview", "Ask the next useful question, update the graph, and repeat until the evidence is sufficient."],
    ["04", "Cite the evidence", "Return a reviewable evaluation linked to the candidate’s own answers."],
    ["05", "Decide & learn", "Recruiters make the call; outcomes sharpen future role understanding."],
  ];

  return (
    <div className="coverd-app">
      <header className="coverd-hero">
        <div className="coverd-brand">
          <span className="coverd-kicker">BUILT AT IMPERIAL COLLEGE LONDON</span>
          <h3>COVERD<span>.</span></h3>
          <p>The AI interviewer that interviews the company first.</p>
          <div className="coverd-actions">
            <a className="coverd-link" href="#coverd-products">Explore the product ↓</a>
            <span>FOUNDED 2026 · LONDON</span>
          </div>
        </div>
        <div className="founder-note">
          <span>FOUNDER’S NOTE / SAM</span>
          <p>
            COVERD began on the candidate side, as an idea for tailoring CVs to job
            descriptions. The more we explored it, the clearer the real problem became:
            companies still struggled to distinguish meaningful evidence from polished
            applications. We pivoted away from building another ATS and toward a focused
            voice interview system that learns the company before questioning a candidate.
          </p>
        </div>
      </header>

      <section className="coverd-thesis">
        <div>
          <span className="eyebrow">THE THESIS</span>
          <h4>Understand the company.<br />Then interview the candidate.</h4>
        </div>
        <p>
          Generic interviews scale, but they miss the lived knowledge behind a role.
          COVERD interviews the company first and turns that context into a belief graph.
          During each candidate interview, answers update the graph and determine which
          question should come next. The experience should feel like an informed
          interviewer pursuing useful evidence—not a bot reading a script. Four design
          partners, including Imperial College London, are shaping the discovery and
          prototype; the others remain undisclosed.
        </p>
      </section>

      <section className="coverd-numbers">
        <div><strong>4</strong><span>active design partners</span></div>
        <div><strong>5</strong><span>paying-customer milestone</span></div>
        <div><strong>ADAPT</strong><span>belief-led interviews</span></div>
        <div><strong>CITED</strong><span>reviewable candidate evidence</span></div>
      </section>

      <section className="coverd-section" id="coverd-products">
        <div className="coverd-section__heading">
          <span>PRODUCT SYSTEM</span>
          <h4>Company context before candidate judgement.</h4>
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
          <h4>From organisational knowledge to a better interview.</h4>
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
          <p>Trust comes from evidence, appropriate uncertainty and a recognisably human conversation.</p>
        </div>
        <div className="coverd-principles">
          <article><strong>Context comes first</strong><p>The system learns the real work, team and success criteria before interviewing candidates.</p></article>
          <article><strong>Every evaluation cites evidence</strong><p>Recruiters can trace an assessment back to what was asked and what the candidate said.</p></article>
          <article><strong>Questions must earn their place</strong><p>Each follow-up should reduce a real uncertainty, not merely make an automated interview longer.</p></article>
          <article><strong>Uncertainty stays visible</strong><p>The product should surface missing evidence instead of turning every ambiguity into confidence.</p></article>
          <article><strong>Evidence beats elegance</strong><p>Three interview-agent architectures were tested with real users; results, not theoretical appeal, determined the direction.</p></article>
          <article><strong>Recruiters remain accountable</strong><p>AI carries repetition and context; people retain the judgement and responsibility.</p></article>
        </div>
        <div className="coverd-values">
          {["ROLE-SPECIFIC", "EVIDENCE-LED", "ADAPTIVE", "HUMAN-OWNED", "CANDIDATE-TRUSTED"].map((value) => <span key={value}>{value}</span>)}
        </div>
      </section>
    </div>
  );
}

function FinderApp({ openApp }: { openApp: (id: AppId) => void }) {
  return (
    <div className="finder-app">
      <div className="finder-meta"><span>{finderItems.length} items</span><span>Portfolio Index</span><span>42.0 MB available</span></div>
      <div className="finder-grid">
        {finderItems.map((item) => (
          <button key={item.id} className="finder-item" onDoubleClick={() => openApp(item.id)} onClick={() => openApp(item.id)}>
            <PixelIcon kind={item.kind} />
            <strong>{item.name}</strong>
            <span>{item.meta}</span>
          </button>
        ))}
      </div>
      <div className="finder-status">Click an item once to open it.</div>
    </div>
  );
}

function ExperienceApp() {
  return (
    <div className="experience-app">
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
    </div>
  );
}

function ProjectsApp({ openApp }: { openApp: (id: AppId) => void }) {
  return (
    <div className="projects-app">
      <header className="document-header">
        <div><span className="eyebrow">SELECTED FILES</span><h3>Projects with measurable consequences.</h3></div>
        <span className="file-stamp">{projects.length} OBJECTS</span>
      </header>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.title}>
            <div className="project-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="project-card__head">
              <div><span>{project.category}</span><h4>{project.title}</h4></div>
              <time>{project.year}</time>
            </div>
            <p>{project.description}</p>
            <div className="project-tools">{project.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
            <div className="project-card__foot">
              <strong>{project.metric}</strong>
              {project.app && <button onClick={() => openApp(project.app!)}>Open in System →</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SkillsApp() {
  return (
    <div className="skills-app">
      <div className="control-panel-intro">
        <PixelIcon kind="controls" />
        <div><h3>Capabilities</h3><p>Six connected systems. Adjustments are saved automatically.</p></div>
      </div>
      <div className="control-groups">
        {skillGroups.map((group) => (
          <fieldset className="control-group" key={group.title}>
            <legend>{group.title}</legend>
            <div className="skill-meter" aria-label={`${group.title}: ${group.level}%`}>
              <span style={{ width: `${group.level}%` }} />
            </div>
            <div className="skill-items">
              {group.items.map((item) => (
                <label key={item}><input type="checkbox" checked readOnly /><span>{item}</span></label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

function EducationApp() {
  return (
    <div className="education-app">
      <header className="document-header">
        <div><span className="eyebrow">EDUCATION</span><h3>Science, computation &amp; enterprise.</h3></div>
        <PixelIcon kind="university" />
      </header>
      <section className="degree-card degree-card--imperial">
        <div className="degree-mark">ICL</div>
        <div><span>2025—2026</span><h4>MSc AI Applications &amp; Innovation</h4><p>Imperial College London · Distinction</p><small>Deep learning · AI safety · medical imaging · climate ML · venture building</small></div>
      </section>
      <section className="degree-card">
        <div className="degree-mark">KCL</div>
        <div><span>2021—2025</span><h4>BSc Chemistry with Biomedicine &amp; Placement</h4><p>King&apos;s College London</p><small>First-class honours · computational chemistry · pharmaceutical placement</small></div>
      </section>
      <div className="education-columns">
        <section>
          <h4>Honours &amp; awards</h4>
          <ul>
            <li>Associate of King&apos;s College London</li>
            <li>SCIS Academic Excellence Award (valedictorian)</li>
            <li>King&apos;s Research Experience Award</li>
            <li>SCDF 1st Division HQ Wall of Fame</li>
            <li>SCDF Service Excellence &amp; Best Trainee Awards</li>
            <li>EARCOS Global Citizenship Award</li>
          </ul>
        </section>
        <section>
          <h4>Languages</h4>
          <dl className="language-list">
            <div><dt>English</dt><dd>Native / bilingual</dd></div>
            <div><dt>Chinese</dt><dd>Native / bilingual</dd></div>
            <div><dt>Italian</dt><dd>Elementary</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function ResumeApp({ openApp }: { openApp: (id: AppId) => void }) {
  return (
    <div className="resume-app">
      <div className="simpletext-toolbar"><span>Times</span><span>11 pt</span><span>A4</span><button onClick={() => openApp("documents")}>Preview original PDF</button></div>
      <article className="resume-paper">
        <header><div><h3>Samuel Zhang</h3><p>People-centred generalist · Applied AI · Product · Founder</p></div><address>London, United Kingdom<br />sam.xiaojian.zhang@outlook.com<br />linkedin.com/in/samuel-xj-zhang</address></header>
        <hr />
        <section>
          <h4>Profile</h4>
          <p>A people-centred generalist who moves between AI research, product leadership, engineering and stakeholder conversations. From an unused Visual Basic periodic table to enterprise products and adaptive AI interviews, the through-line is an evidence-first approach: understand the problem, earn trust, test what works and help the people around the system thrive.</p>
        </section>
        <section>
          <h4>Current</h4>
          <div>
            <p><strong>Marsh Risk — AI Intern, Data &amp; Machine Learning</strong><br /><em>May 2026—Present · London</em><br />Investigating how historical placement data and contract wording can support evidence-bounded decisions while preserving provenance, uncertainty and the limits of retrospective evidence.</p>
            <p><strong>coverd.ai — Founder</strong><br /><em>Mar 2026—Present · London</em><br />Building the AI interviewer that interviews the company first. The bootstrapped prototype uses a role-specific belief graph to select adaptive questions and produce cited evaluations; four design partners, including Imperial College London, are shaping discovery and testing.</p>
          </div>
        </section>
        <section>
          <h4>Pfizer</h4>
          <div>
            <p><strong>Product Owner &amp; Web Application Developer</strong><br /><em>Oct 2024—Apr 2026</em></p>
            <ul>
              <li>Led GROWMAT from user research and senior-director pitch through roadmap, agile delivery, deployment and department-wide adoption.</li>
              <li>Connected technical capability with operational availability, chose maintainable tools over fashionable ones and built stakeholder trust through a polished, dependable product.</li>
              <li>Improved scheduling efficiency by 1200%, saving 120+ person-hours monthly across 40+ analysts.</li>
              <li>Created continuous analytics for project timelines, compliance, performance and workload modelling with 99.9% uptime and an 80% performance improvement.</li>
              <li>Produced API specifications, user manuals and video training for long-term maintainability.</li>
            </ul>
            <p><strong>Data Analyst Undergraduate, Analytical R&amp;D</strong><br /><em>Sep 2023—Aug 2024</em></p>
            <ul>
              <li>Developed pharmaceutical solubility modelling using statistical thermodynamics, Julia and machine-learning libraries.</li>
              <li>Worked across Pfizer, MIT and Imperial to bridge open-source fluid thermodynamics with pharmaceutical development.</li>
            </ul>
          </div>
        </section>
        <section>
          <h4>Research &amp; teaching</h4>
          <div>
            <p><strong>KCL Coding Series — Tutor &amp; Curriculum Designer</strong><br />Designed 20+ sessions for 80+ students, achieved 90% satisfaction and secured Royal Society of Chemistry endorsement. One former student later earned an offer from Microsoft.</p>
            <p><strong>Royal Society Summer Fellowship</strong><br />Built GPU-accelerated GROMACS workflows with a 70% performance improvement for protein–membrane research.</p>
            <p><strong>King’s Undergraduate Research Fellowship</strong><br />Engineered MATLAB, Excel and Python spectroscopy pipelines that reduced analysis time by 40%.</p>
          </div>
        </section>
        <section>
          <h4>Public service</h4>
          <div>
            <p><strong>Singapore Civil Defence Force — Commander’s PA</strong><br /><em>Jul 2019—Jul 2021</em></p>
            <ul>
              <li>Created MATLAB-based COVID-19 resource planning from public epidemiological data.</li>
              <li>Automated emergency activation attendance for 1,200+ personnel and reduced response time by more than 300%.</li>
              <li>Received the Service Excellence Award, 1st Division HQ Wall of Fame recognition and promotion to Sergeant.</li>
            </ul>
          </div>
        </section>
        <section>
          <h4>Education</h4>
          <p><strong>Imperial College London</strong> — MSc AI Applications &amp; Innovation, 2025–2026<br />Deep Learning · AI Safety · Innovation · Medical Imaging · Climate ML<br /><br /><strong>King&apos;s College London</strong> — BSc Chemistry with Biomedicine &amp; Placement, First-Class Honours, 2021–2025</p>
        </section>
        <section>
          <h4>Technical</h4>
          <p><strong>ML:</strong> PyTorch, TensorFlow, Scikit-learn, CNNs, LLMs, stochastic modelling<br /><strong>Programming:</strong> Python, Julia, SQL, JavaScript, TypeScript, MATLAB, React<br /><strong>Data:</strong> pipelines, statistical modelling, A/B testing, Power BI, Pandas, NumPy<br /><strong>Infrastructure:</strong> Docker, AWS, Linux, PostgreSQL, HPC, GPU computing, CI/CD</p>
        </section>
        <section>
          <h4>Selected projects</h4>
          <p><strong>Home Automation &amp; AI Infrastructure:</strong> Seven servers and 23 systems spanning Proxmox, Docker, 42 GB VRAM GPU compute, self-hosted CI, cross-architecture workloads, networking, security and a 96 TB raw / 72 TB usable backup array.<br /><br /><strong>Stock Market Simulation Engine:</strong> Julia/SQL order matching with real-time WebSocket order-book visualisation.</p>
        </section>
        <section>
          <h4>Creative life</h4>
          <p>Euphonium player with King’s College London Brass Band at UniBrass 2021 and 2022, including a fourth-place result; involved in <em>Thoroughly Modern Millie</em>, <em>Tombalek</em> and <em>Curtains</em> across performance and drums; and a former wedding photographer who now photographs for the love of the craft.</p>
        </section>
        <section>
          <h4>Awards</h4>
          <p>Associate of King’s College · King’s Research Experience Award · SCDF Service Excellence Award · SCDF 1st Division HQ Wall of Fame · EARCOS Global Citizenship Award</p>
        </section>
      </article>
    </div>
  );
}

function ContactApp({ openApp }: { openApp: (id: AppId) => void }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    const email = "sam.xiaojian.zhang@outlook.com";
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(email);
    } else {
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
    <div className="chooser-app">
      <div className="chooser-columns">
        <div className="chooser-list" role="listbox" aria-label="Contact services">
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
    </div>
  );
}

const documentLibrary = [
  {
    id: "profile",
    title: "Samuel Zhang — Profile",
    meta: "Curriculum vitae · 70 KB",
    src: "/Samuel-Zhang-Profile.pdf",
  },
  {
    id: "thesis",
    title: "Molecular Recognition Thesis",
    meta: "Undergraduate research · 6.5 MB",
    src: "/UndergradThesis.pdf",
  },
  {
    id: "growmat",
    title: "GROWMAT Product Showcase",
    meta: "Enterprise case study · 8.3 MB",
    src: "/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf",
  },
];

function DocumentsApp() {
  const [activeDocument, setActiveDocument] = useState(documentLibrary[0]);

  return (
    <div className="documents-app">
      <aside className="documents-library">
        <div className="documents-library__title">
          <PixelIcon kind="pdf" />
          <div><span>LIBRARY</span><strong>{documentLibrary.length} documents</strong></div>
        </div>
        {documentLibrary.map((document) => (
          <button
            key={document.id}
            className={activeDocument.id === document.id ? "is-active" : ""}
            onClick={() => setActiveDocument(document)}
          >
            <PixelIcon kind="document" small />
            <span><strong>{document.title}</strong><small>{document.meta}</small></span>
          </button>
        ))}
      </aside>
      <section className="documents-preview">
        <div className="documents-toolbar">
          <span>{activeDocument.title}</span>
          <span className="documents-toolbar__hint">Use the reader controls to zoom, search and print.</span>
          <a href={activeDocument.src} download>Save a copy</a>
        </div>
        <iframe
          key={activeDocument.id}
          src={`${activeDocument.src}#view=FitH&toolbar=1&navpanes=0`}
          title={`Preview of ${activeDocument.title}`}
        />
        <p className="documents-fallback">
          If your browser cannot render PDFs, <a href={activeDocument.src}>open this document in the current tab</a>.
        </p>
      </section>
    </div>
  );
}

type MineCell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

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
  { answer: "COVERD", clue: "Samuel’s recruitment intelligence startup.", fact: "COVERD uses a role-specific belief graph to choose adaptive questions while keeping hiring decisions human-owned." },
  { answer: "PFIZER", clue: "Where GROWMAT began its enterprise life.", fact: "At Pfizer, Samuel’s systems delivered a 1200% efficiency gain and saved 120+ hours each month." },
  { answer: "PYTHON", clue: "A language threading through Samuel’s research, teaching and AI work.", fact: "Samuel has taught programming and data analysis to more than 80 students." },
  { answer: "LONDON", clue: "The city connecting King’s, Imperial, Marsh and COVERD.", fact: "Samuel’s work spans research, insurance, education and responsible AI across London." },
] as const;

const MEMORY_PAIRS = [
  { id: "coverd", left: "COVERD", right: "HIRING AI", fact: "Samuel’s startup builds responsible recruitment intelligence." },
  { id: "growmat", left: "1200%", right: "GROWMAT", fact: "The efficiency gain delivered by Samuel’s Pfizer platform." },
  { id: "gpu", left: "42 GB", right: "LOCAL AI", fact: "Private model training and inference run in Samuel’s home lab." },
  { id: "scdf", left: "SCDF", right: "1,200 PEOPLE", fact: "Emergency planning systems supported personnel in Singapore." },
  { id: "teaching", left: "80+ STUDENTS", right: "CODING", fact: "Samuel designed an accessible programming and data curriculum." },
  { id: "science", left: "JULIA", right: "SOLUBILITY", fact: "Scientific models helped reduce experimental testing requirements." },
  { id: "infra", left: "DOCKER", right: "HOME LAB", fact: "A private, monitored stack powers AI, storage and automation." },
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

function GamesApp({ openApp }: { openApp: (id: AppId) => void }) {
  const [game, setGame] = useState<"minefield" | "puzzle" | "samword" | "memory">("minefield");
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
  const memoryTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current);
  }, []);

  const resetMines = () => {
    setMinefield(createMinefield(Date.now()));
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
    setPuzzle(createPuzzle(Date.now()));
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

  const resetMemory = () => {
    if (memoryTimer.current) window.clearTimeout(memoryTimer.current);
    setMemoryDeck(createMemoryDeck(Date.now()));
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

  return (
    <div className="games-app">
      <aside className="games-sidebar">
        <div className="games-logo"><PixelIcon kind="game" /><span>Desk<br />Arcade</span></div>
        <button className={game === "minefield" ? "is-active" : ""} onClick={() => setGame("minefield")}><span className="game-mini-icon">M</span>Minefield</button>
        <button className={game === "puzzle" ? "is-active" : ""} onClick={() => setGame("puzzle")}><span className="game-mini-icon">15</span>Sliding Puzzle</button>
        <button className={game === "samword" ? "is-active" : ""} onClick={() => setGame("samword")}><span className="game-mini-icon">SZ</span>SamWord</button>
        <button className={game === "memory" ? "is-active" : ""} onClick={() => setGame("memory")}><span className="game-mini-icon">8</span>Profile Pairs</button>
        <p>Four tiny distractions.<br />No tracking. No coins.<br />One suspicious password.</p>
      </aside>
      <section className="game-stage">
        {game === "minefield" && (
          <>
            <div className="game-header">
              <div><span>DESK ACCESSORY 01</span><h3>Minefield</h3></div>
              <div className={`game-face game-face--${mineStatus}`}>{mineStatus === "lost" ? "x_x" : mineStatus === "won" ? "^_^" : ":)"}</div>
            </div>
            <div className="mine-toolbar">
              <strong>{mineStatus === "playing" ? `${10 - flagged} mines` : mineStatus === "won" ? "You cleared it!" : "A small administrative error."}</strong>
              <button className={flagMode ? "is-active" : ""} onClick={() => setFlagMode((current) => !current)}>F Flag mode</button>
              <button onClick={resetMines}>New field</button>
            </div>
            <div className="minefield" aria-label="Minefield game board">
              {minefield.map((cell, index) => (
                <button
                  key={index}
                  className={`${cell.revealed ? "is-revealed" : ""}${cell.mine && cell.revealed ? " is-mine" : ""}`}
                  onClick={() => revealCell(index)}
                  onContextMenu={(event) => { event.preventDefault(); flagCell(index); }}
                  aria-label={`Cell ${index + 1}${cell.flagged ? ", flagged" : ""}`}
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
            <div className="puzzle-message">{puzzleSolved ? "Solved. The Macintosh is impressed." : "Put the numbers back in order."}</div>
            <div className="puzzle-board" aria-label="Sliding number puzzle">
              {puzzle.map((tile, index) => (
                <button key={`${tile}-${index}`} className={tile === 0 ? "is-empty" : ""} onClick={() => moveTile(index)} disabled={tile === 0}>
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
            <div className="samword-grid" aria-label="SamWord guesses">
              {Array.from({ length: 6 }, (_, rowIndex) => {
                const guess = wordGuesses[rowIndex] ?? "";
                const score = guess ? scoreWordGuess(guess, activeWord.answer) : [];
                return (
                  <div className="samword-row" key={rowIndex}>
                    {Array.from({ length: activeWord.answer.length }, (_, columnIndex) => (
                      <span className={score[columnIndex] ? `is-${score[columnIndex]}` : ""} key={columnIndex}>
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
                autoComplete="off"
                disabled={wordSolved || wordGuesses.length >= 6}
              />
              <button className="mac-button" type="submit" disabled={wordSolved || wordGuesses.length >= 6}>Enter</button>
              <button className="mac-button" type="button" onClick={nextWord}>Next file</button>
            </form>
            <p className={`samword-message${wordSolved ? " is-solved" : ""}`}>{wordMessage}</p>
          </>
        )}
        {game === "memory" && (
          <>
            <div className="game-header">
              <div><span>PROFILE ACCESSORY 04</span><h3>Profile Pairs</h3></div>
              <div className="puzzle-counter">{memoryTurns}<small>TURNS</small></div>
            </div>
            <p className="memory-intro">Match each clue to the part of Samuel’s profile it belongs to.</p>
            <div className="memory-grid" aria-label="Samuel profile matching game">
              {memoryDeck.map((card, index) => {
                const visible = memoryOpen.includes(index) || memoryMatched.has(card.pairId);
                return (
                  <button
                    key={`${card.pairId}-${index}`}
                    className={`${visible ? "is-visible" : ""}${memoryMatched.has(card.pairId) ? " is-matched" : ""}`}
                    onClick={() => flipMemory(index)}
                    aria-label={visible ? card.label : `Hidden profile card ${index + 1}`}
                  >
                    <span>{visible ? card.label : "?"}</span>
                  </button>
                );
              })}
            </div>
            <div className="memory-status">
              <span>{memoryMatched.size === MEMORY_PAIRS.length ? "You now know suspiciously much about Samuel." : `${memoryMatched.size} of ${MEMORY_PAIRS.length} connections found`}</span>
              <button className="mac-button" onClick={resetMemory}>Shuffle cards</button>
            </div>
            {memoryFact && (
              <p className="memory-fact">{memoryFact}</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function SecretApp() {
  return (
    <div className="secret-app">
      <div className="secret-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="flying-toaster" aria-hidden="true"><span /><i /><b /></div>
      <PixelIcon kind="secret" />
      <span className="eyebrow">UNREASONABLE CORNER DETECTED</span>
      <h3>Welcome, power user.</h3>
      <p>You found the part of the portfolio that contributes nothing to conversion metrics.</p>
      <blockquote>“The best interface is one with at least one completely unnecessary secret.”</blockquote>
      <small>System note: OpenClaw did not, in fact, complete Samuel’s entire life. Results remain inconclusive.</small>
    </div>
  );
}

function ServiceIcon({ code, tone }: { code: string; tone: string }) {
  return <span className={`service-pixel-icon service-pixel-icon--${tone}`} aria-hidden="true">{code}</span>;
}

function LabApp() {
  const [filter, setFilter] = useState("All");
  const services = [
    { group: "Compute", code: "PX", tone: "violet", name: "Proxmox", host: "Virtualisation cluster", description: "Runs isolated VMs and Linux containers for the heavier parts of the lab." },
    { group: "Compute", code: "AI", tone: "blue", name: "Local AI GPU", host: "42 GB VRAM", description: "Private model training and inference exposed through an Open WebUI workspace." },
    { group: "Compute", code: "DEV", tone: "navy", name: "Code Servers", host: "Browser IDEs", description: "GPU-connected VS Code environments for remote development and experiments." },
    { group: "Compute", code: "KVM", tone: "grey", name: "GLKVM", host: "Physical console", description: "Out-of-band keyboard, video and mouse access when a server stops responding." },
    { group: "Network", code: "NPM", tone: "green", name: "Nginx Proxy Manager", host: "TLS gateway", description: "Routes public domains to private services and manages HTTPS certificates." },
    { group: "Network", code: "WG", tone: "blue", name: "WireGuard", host: "Private access", description: "Encrypted remote entry to the home network without exposing internal tools." },
    { group: "Network", code: "DNS", tone: "red", name: "Pi-hole", host: "Network protection", description: "Network-wide DNS filtering for adverts, trackers and unwanted domains." },
    { group: "Network", code: "F2B", tone: "orange", name: "Fail2ban", host: "Intrusion response", description: "Watches service logs and automatically blocks repeated hostile requests." },
    { group: "Network", code: "RDP", tone: "violet", name: "Guacamole", host: "Remote desktop", description: "Browser-based access to SSH, VNC and remote desktop sessions." },
    { group: "Operations", code: "CT", tone: "blue", name: "Portainer", host: "Container operations", description: "A visual control room for container health, deployments, images and networks." },
    { group: "Operations", code: "CI", tone: "green", name: "GitHub Actions Runner", host: "Self-hosted CI", description: "Runs deployment jobs across Samuel’s own hardware, coordinates different CPU architectures and avoids substantial hosted-runner costs." },
    { group: "Operations", code: "HP", tone: "navy", name: "Homepage", host: "Service directory", description: "The live control surface at homepage.samuelzhang.co.uk for links, status and metrics." },
    { group: "Operations", code: "JOB", tone: "orange", name: "Ofelia", host: "Job scheduler", description: "Runs automated database backups and recurring maintenance inside Docker." },
    { group: "Data", code: "SQL", tone: "blue", name: "PostgreSQL", host: "Application data", description: "Stores environmental telemetry, product data and historical measurements." },
    { group: "Data", code: "CO2", tone: "green", name: "Aranet Air Quality", host: "BLE → SQL → Grafana", description: "Collects CO₂, temperature, humidity and pressure over Bluetooth for live dashboards." },
    { group: "Data", code: "HA", tone: "amber", name: "Home Assistant", host: "Automation hub", description: "Connects sensors, energy data and smart-home devices into one event-driven system." },
    { group: "Storage", code: "72", tone: "green", name: "UGREEN NAS", host: "96 TB raw · 72 TB usable", description: "Six-bay RAID 5 storage for media, datasets and automated recovery after earlier failures made the value of backups unforgettable." },
    { group: "Storage", code: "NAS", tone: "grey", name: "Synology Cloud", host: "Files & photos", description: "Private file sync, photo management and resilient network storage." },
    { group: "Storage", code: "NC", tone: "blue", name: "Nextcloud", host: "Private cloud", description: "Self-hosted document access and synchronisation across personal devices." },
    { group: "Media", code: "JF", tone: "violet", name: "Jellyfin", host: "Home cinema", description: "A private media library and streaming service with live playback monitoring." },
    { group: "Media", code: "KX", tone: "amber", name: "Kiwix", host: "Offline knowledge", description: "Serves offline Wikipedia and reference libraries without an internet connection." },
    { group: "Apps", code: "ERP", tone: "green", name: "Frappe / ERPNext", host: "Business systems lab", description: "A containerised environment for exploring open-source ERP and workflow software." },
    { group: "Apps", code: "ODO", tone: "violet", name: "Odoo Lab", host: "Application sandbox", description: "A separate test stack for business application and database experiments." },
  ];
  const groups = ["All", "Compute", "Network", "Operations", "Data", "Storage", "Media", "Apps"];
  const visibleServices = filter === "All" ? services : services.filter((service) => service.group === filter);

  return (
    <div className="lab-app">
      <header className="document-header">
        <div><span className="eyebrow">PERSONAL INFRASTRUCTURE</span><h3>A small internet, built at home.</h3></div>
        <span className="online-badge">● {services.length} SYSTEMS</span>
      </header>
      <div className="lab-summary">
        <p>
          Built over four-plus years, before “vibe coding” made infrastructure feel
          approachable: seven servers ranging from hand-built machines to Raspberry Pis,
          Proxmox installed from scratch, and a daunting climb through networking,
          security and cross-architecture compatibility. One ill-fated attempt to host a
          large file erased a database and its Compose configuration; the lab now has
          monitored, scheduled backups and 72 TB of usable RAID storage.
        </p>
        <dl>
          <div><dt>GPU memory</dt><dd>42 GB</dd></div>
          <div><dt>Server fleet</dt><dd>7</dd></div>
          <div><dt>Backup storage</dt><dd>72 TB usable</dd></div>
          <div><dt>Running systems</dt><dd>{services.length}</dd></div>
        </dl>
      </div>
      <div className="lab-filters" aria-label="Filter infrastructure">
        {groups.map((group) => (
          <button key={group} className={filter === group ? "is-active" : ""} onClick={() => setFilter(group)}>{group}</button>
        ))}
      </div>
      <div className="service-grid">
        {visibleServices.map((service) => (
          <article className="service-card" key={service.name}>
            <ServiceIcon code={service.code} tone={service.tone} />
            <div className="service-card__copy">
              <div><h4>{service.name}</h4><span><i />ONLINE</span></div>
              <strong>{service.host}</strong>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ScrapbookApp() {
  const interests = [
    ["Hiking & climbing", "A pair of boots, a windbreaker, and somewhere new."],
    ["Photography", "Two years photographing weddings professionally; now the camera is for landscapes, food, people and the pleasure of looking carefully."],
    ["Euphonium", "Played with King’s College London Brass Band at UniBrass in 2021 and 2022, including a fourth-place result."],
    ["Musical theatre", "Thoroughly Modern Millie, the Singaporean Society’s original Tombalek, and Curtains—across performance and drums."],
    ["Multiculturalism", "Singapore, Shanghai, and London shape how I work."],
    ["Teaching & people", "I am energised by rooms full of people. One student I taught Python later earned an offer from Microsoft; their success remains one of my proudest outcomes."],
    ["Curiosity", "Science, systems, music, people and an unreasonable number of random facts. Being a generalist is the point."],
    ["First software", "A clickable Visual Basic periodic table built for IB Chemistry. It found almost no users and revealed exactly how much I loved making software."],
    ["Hardware catalogue", "Ask me for a processor part number and I may answer. A decade of architectures, prices and improbable component combinations lives rent-free in my head."],
  ];
  return (
    <div className="scrapbook-app">
      <header className="document-header"><div><span className="eyebrow">INTERESTS &amp; NOTES</span><h3>The creative life behind the technical work.</h3></div><PixelIcon kind="photos" /></header>
      <div className="scrap-grid">
        {interests.map(([title, copy], index) => (
          <article key={title} className={`scrap-note scrap-note--${(index % 3) + 1}`}><span>{index + 1}</span><h4>{title}</h4><p>{copy}</p></article>
        ))}
      </div>
    </div>
  );
}

function AppContent({ id, openApp }: { id: AppId; openApp: (id: AppId) => void }) {
  switch (id) {
    case "about": return <AboutApp openApp={openApp} />;
    case "coverd": return <CoverdApp />;
    case "finder": return <FinderApp openApp={openApp} />;
    case "experience": return <ExperienceApp />;
    case "projects": return <ProjectsApp openApp={openApp} />;
    case "skills": return <SkillsApp />;
    case "education": return <EducationApp />;
    case "resume": return <ResumeApp openApp={openApp} />;
    case "documents": return <DocumentsApp />;
    case "games": return <GamesApp openApp={openApp} />;
    case "contact": return <ContactApp openApp={openApp} />;
    case "lab": return <LabApp />;
    case "scrapbook": return <ScrapbookApp />;
    case "secret": return <SecretApp />;
  }
}

export default function SystemSevenDesktop({
  initialApp = "about",
  skipBoot = false,
}: {
  initialApp?: AppId;
  skipBoot?: boolean;
}) {
  const [windows, setWindows] = useState(() =>
    INITIAL_WINDOWS.map((windowState) => ({
      ...windowState,
      open: windowState.id === initialApp,
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
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!booting) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBootMessageIndex(0);
    const finishTimer = window.setTimeout(() => setBooting(false), reduceMotion ? 700 : BOOT_DURATION);
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
  }, [booting]);

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

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
    const move = (event: PointerEvent) => {
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
    const stop = () => { dragState.current = null; };
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
  const openWindows = useMemo(() => windows.filter((item) => item.open), [windows]);
  const selectedDesktopItem = DESKTOP_ICONS.find((item) => item.id === selectedIcon);

  const focusWindow = (id: AppId) => {
    const nextZ = ++zCounter.current;
    setActiveId(id);
    setWindows((current) => current.map((item) => item.id === id ? { ...item, z: nextZ } : item));
  };

  const openApp = useCallback((id: AppId) => {
    const nextZ = ++zCounter.current;
    setWindows((current) => current.map((item) => item.id === id ? { ...item, open: true, z: nextZ } : item));
    setActiveId(id);
    setSelectedIcon(id);
    setOpenMenu(null);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const closeApp = (id: AppId) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, open: false } : item));
    const remaining = windows.filter((item) => item.open && item.id !== id).sort((a, b) => b.z - a.z);
    setActiveId(remaining[0]?.id ?? "finder");
  };

  const toggleZoom = (id: AppId) => {
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
      <main className="boot-screen" onClick={() => setBooting(false)}>
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
      </main>
    );
  }

  return (
    <main
      className={`system-desktop desktop-pattern--${pattern}`}
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
            <button className={openMenu === "apple" ? "is-open apple-menu" : "apple-menu"} onClick={() => setOpenMenu(openMenu === "apple" ? null : "apple")} aria-label="Samuel menu">
              <svg className="human-mark" viewBox="0 0 18 18" aria-hidden="true" shapeRendering="crispEdges">
                <circle cx="9" cy="5" r="3" />
                <path d="M3 17v-3c0-3.2 2.4-5 6-5s6 1.8 6 5v3z" />
              </svg>
            </button>
            {openMenu === "apple" && (
              <div className="menu-dropdown apple-dropdown">
                <button onClick={() => openApp("about")}><PixelIcon kind="computer" small />About Samuel Zhang…</button>
                <button onClick={() => openApp("coverd")}><PixelIcon kind="coverd" small />COVERD — Founder&apos;s Desk</button>
                <hr />
                <button onClick={() => openApp("skills")}><PixelIcon kind="controls" small />Skills &amp; Capabilities</button>
                <button onClick={() => openApp("documents")}><PixelIcon kind="pdf" small />CV &amp; Papers</button>
                <button onClick={() => openApp("games")}><PixelIcon kind="game" small />Desk Arcade</button>
                <button onClick={() => openApp("contact")}><PixelIcon kind="mail" small />Contact Samuel</button>
                <button onClick={() => openApp("scrapbook")}><PixelIcon kind="photos" small />Interests &amp; Notes</button>
                <hr />
                <button onClick={restart}>Restart…</button>
              </div>
            )}
          </div>
          <strong className="active-application">{activeTitle === "Finder" ? "Finder" : activeTitle}</strong>
          <div className="menu-root">
            <button className={openMenu === "file" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "file" ? null : "file")}>File</button>
            {openMenu === "file" && <div className="menu-dropdown"><button onClick={() => openApp("finder")}>Open Portfolio Index</button><button onClick={() => openApp("resume")}>Open Résumé</button><button onClick={() => openApp("documents")}>Open CV &amp; Papers</button><hr /><button onClick={closeActive}>Close Window <kbd>⌘W</kbd></button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button className={openMenu === "edit" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")}>Edit</button>
            {openMenu === "edit" && <div className="menu-dropdown"><button className="is-disabled">Undo <kbd>⌘Z</kbd></button><hr /><button className="is-disabled">Cut <kbd>⌘X</kbd></button><button className="is-disabled">Copy <kbd>⌘C</kbd></button><button className="is-disabled">Paste <kbd>⌘V</kbd></button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button className={openMenu === "view" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "view" ? null : "view")}>View</button>
            {openMenu === "view" && <div className="menu-dropdown"><button onClick={() => setPattern("classic")}>{pattern === "classic" ? "✓ " : ""}Classic Pattern</button><button onClick={() => setPattern("blue")}>{pattern === "blue" ? "✓ " : ""}Blue Pattern</button></div>}
          </div>
          <div className="menu-root menu-optional">
            <button className={openMenu === "special" ? "is-open" : ""} onClick={() => setOpenMenu(openMenu === "special" ? null : "special")}>Special</button>
            {openMenu === "special" && <div className="menu-dropdown"><button onClick={() => openApp("games")}>Desk Arcade</button><hr /><button onClick={() => { setWindows((current) => current.map((item) => ({ ...item, open: false }))); setOpenMenu(null); }}>Hide All Windows</button><button onClick={() => openApp("secret")}>About This Secret…</button><button onClick={restart}>Restart</button></div>}
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
          <button className="menu-clock" onDoubleClick={() => { openApp("secret"); showToast("Time is an implementation detail."); }}>{clock}</button>
        </div>
      </nav>

      <div className="desktop-icons" aria-label="Desktop items">
        {DESKTOP_ICONS.map((item) => (
          <button
            key={item.id}
            className={`desktop-icon${selectedIcon === item.id ? " is-selected" : ""}`}
            title={`${item.label}: ${item.description}`}
            aria-label={`${item.label}. ${item.description} Double-click to open.`}
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
        >
          <AppContent id={windowState.id} openApp={openApp} />
        </WindowChrome>
      ))}

      <div className={`desktop-hint${selectedDesktopItem ? " has-selection" : ""}`}>
        {selectedDesktopItem ? (
          <>
            <strong>{selectedDesktopItem.label}</strong>
            <span>{selectedDesktopItem.description} Double-click to open.</span>
          </>
        ) : (
          <span>Select an icon to learn what it opens · Double-click to launch · Drag title bars to move windows</span>
        )}
      </div>
      <div className="window-switcher" role="navigation" aria-label="Open applications">
        {openWindows.map((item) => (
          <button key={item.id} className={activeId === item.id ? "is-active" : ""} onClick={() => focusWindow(item.id)} aria-label={`Show ${item.title}`}>
            <PixelIcon kind={DESKTOP_ICONS.find((icon) => icon.id === item.id)?.icon ?? "document"} small />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
      {mobileGuide && (
        <aside className="mobile-window-guide" role="dialog" aria-label="Using windows on mobile">
          <div className="mobile-window-guide__title">
            <span className="mobile-guide-window-box" aria-hidden="true" />
            <strong>Windows on a small screen</strong>
          </div>
          <p>
            Tap the small square at a window’s top-left to close it. Mobile windows stay
            full-screen, so dragging is disabled; use the bar along the bottom to switch
            between anything that is open.
          </p>
          <button onClick={dismissMobileGuide}>Got it</button>
        </aside>
      )}
      {toast && <div className="system-toast" role="status"><PixelIcon kind="computer" small /><span>{toast}</span></div>}
    </main>
  );
}
