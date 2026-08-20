import type {
  Project,
  ProjectAccess,
  ProjectArea,
  ProjectArtifact,
  ProjectPhase,
} from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import type { GuidedStartId, ProjectShelfId } from "./projectSuites";

type ProjectStatus = Project["status"];
type PhaseLabel = ProjectPhase["label"];
type ArtifactKind = ProjectArtifact["kind"];
export type ProjectArchiveCopy = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
    summaryAria: string;
    files: string;
    interactive: string;
    suites: string;
    redacted: string;
    languageNotice: string;
  };
  views: {
    aria: string;
    guided: string;
    guidedHint: string;
    files: string;
    filesHint: string;
    map: string;
    mapHint: string;
  };
  guided: {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    statsAria: string;
    experiencesStat: string;
    suitesStat: string;
    filesStat: string;
    startEyebrow: string;
    startTitle: string;
    startDescription: string;
    shelvesEyebrow: string;
    shelvesTitle: string;
    shelvesDescription: string;
    drawer: string;
    experience: string;
    experiences: string;
    chapter: string;
    chapters: string;
    openDrawer: string;
    closeDrawer: string;
    showChapters: string;
    hideChapters: string;
    recommended: string;
    readBrief: string;
    runDemo: string;
    referenceFile: string;
    supportingFiles: string;
    supportingDescription: string;
    viewProject: string;
    selected: string;
    reconciliationLead: string;
    reconciliation: string;
    shelves: Record<ProjectShelfId, { title: string; description: string }>;
    startPaths: Record<GuidedStartId, { eyebrow: string; title: string; description: string }>;
  };
  filters: {
    searchAria: string;
    searchPlaceholder: string;
    clearSearch: string;
    disciplineAria: string;
    allDisciplines: string;
    accessAria: string;
    allAccess: string;
    sortAria: string;
    sortCurated: string;
    sortRecent: string;
    sortTitle: string;
    featured: string;
    accessKey: string;
    clearFilters: string;
  };
  layout: {
    aria: string;
    label: string;
    catalogueFocus: string;
    balanced: string;
    detailFocus: string;
  };
  catalogue: {
    aria: string;
    objects: string;
    archiveMap: string;
    inspectable: string;
    protected: string;
    emptyTitle: string;
    emptyDescription: string;
    showAll: string;
    resultsStatus: string;
  };
  detail: {
    interactiveDemoAria: string;
    detailsAria: string;
    archiveMapAria: string;
    archiveMapTitle: string;
    archiveMapEyebrow: string;
    backToProject: string;
    safePort: string;
    privateBoundary: string;
    privacyNote: string;
    derivedArtifact: string;
    technologiesAria: string;
    buildLog: string;
    buildJourney: string;
    evidence: string;
    safeToShow: string;
    caseBrief: {
      eyebrow: string;
      title: string;
      purpose: string;
      audience: string;
      problem: string;
      objective: string;
      contribution: string;
      pipeline: string;
      progression: string;
      evidence: string;
      walkthrough: string;
      walkthroughCopy: string;
      boundary: string;
      relatedSuite: string;
      relatedCopy: string;
      discuss: string;
      workspace: string;
      chapter: string;
      openChapter: string;
    };
  };
  markers: {
    demo: string;
    live: string;
    suite: string;
  };
  actions: {
    panelAria: string;
    commands: string;
    launchTitle: string;
    launchDescription: string;
    liveDemo: string;
    ready: string;
    newWindow: string;
    opensNewWindow: string;
    systemSeven: string;
    inDesktop: string;
    emptyTitle: string;
    emptyDescription: string;
    shareTitle: string;
    shareDescription: string;
    directAddress: string;
    copied: string;
    copyLink: string;
    share: string;
    openLink: string;
    inNewWindow: string;
    defaultDemo: string;
    defaultSystemApp: string;
    visitCoverd: string;
    visitWebsite: string;
    sourceNoLicence: string;
    viewRepository: string;
    openLab: string;
    openSuite: string;
    suiteChapter: string;
    openCoverdBrief: string;
    openSystemFile: string;
    shareMessage: string;
    status: {
      idle: string;
      copied: string;
      shared: string;
      manual: string;
    };
  };
  access: Record<ProjectAccess, { label: string; short: string; description: string }>;
  areas: Record<ProjectArea, string>;
  statuses: Record<ProjectStatus, string>;
  phases: Record<PhaseLabel, string>;
  artifactKinds: Record<ArtifactKind, string>;
  resourceKinds: Record<string, string>;
};

const enGB: ProjectArchiveCopy = {
  header: {
    eyebrow: "SAMUEL HD / PROJECTS / INDEX",
    title: "Project Archive",
    description: "Products, experiments and research—shown at the boundary each project permits.",
    summaryAria: "Archive summary",
    files: "files",
    interactive: "experiences",
    suites: "suites",
    redacted: "redacted",
    languageNotice: "Project titles and source-grounded descriptions remain in British English; archive controls follow your selected language.",
  },
  views: {
    aria: "Project Archive views",
    guided: "Guided Workspaces",
    guidedHint: "Six shelves · 14 experiences",
    files: "All {count} Files",
    filesHint: "Search and inspect every source record",
    map: "Portfolio Map",
    mapHint: "Relationships, tools and evidence",
  },
  guided: {
    heroEyebrow: "SAMUEL HD / PROJECTS / GUIDED WORKSPACES",
    heroTitle: "Choose a route through the work",
    heroDescription: "Start with one short walkthrough, then open a themed shelf. Suites organise related chapters without merging their evidence or changing any project address.",
    statsAria: "Guided Archive summary",
    experiencesStat: "Guided experiences",
    suitesStat: "Editorial suites",
    filesStat: "Evidence files",
    startEyebrow: "START HERE · ABOUT 30 SECONDS",
    startTitle: "Pick one question",
    startDescription: "Four useful entry points; each opens a real, self-contained chapter.",
    shelvesEyebrow: "CABINET / SIX THEMED DRAWERS",
    shelvesTitle: "Browse by the problem being solved",
    shelvesDescription: "Open one shelf, then inspect an experience and its individual evidence files.",
    drawer: "Drawer",
    experience: "experience",
    experiences: "experiences",
    chapter: "chapter",
    chapters: "chapters",
    openDrawer: "Open drawer",
    closeDrawer: "Close drawer",
    showChapters: "Show chapters",
    hideChapters: "Hide chapters",
    recommended: "Recommended first chapter",
    readBrief: "Read case brief",
    runDemo: "Run interactive demo",
    referenceFile: "Reference file",
    supportingFiles: "Supporting files",
    supportingDescription: "Original outputs and protected stories remain visible without being padded into artificial demos.",
    viewProject: "View project file",
    selected: "Selected file",
    reconciliationLead: "Nothing is hidden:",
    reconciliation: "14 guided experiences organise all 27 interactive chapters; four non-demo files remain inspectable; all 31 canonical project links stay intact.",
    shelves: {
      "products-operations": {
        title: "Products & Operations",
        description: "Working products that turn documents, calendars, financial records and market evidence into reviewable decisions.",
      },
      "decision-intelligence": {
        title: "Decision Intelligence & RL",
        description: "A connected route from reinforcement-learning foundations to logged-policy evidence, causal adjustment and safe human deferral.",
      },
      "scientific-ml": {
        title: "Scientific ML & Trust",
        description: "Architectures, uncertainty, evaluation provenance and sensor trade-offs for scientific machine-learning systems.",
      },
      "molecular-computational": {
        title: "Molecular & Computational Science",
        description: "Inspectable paths through spectral assignment, thermodynamic modelling and computational-chemistry kernels.",
      },
      "systems-reproducibility": {
        title: "Systems & Reproducibility",
        description: "Environment resolution, infrastructure boundaries and small code audits that make the limits of reproducibility explicit.",
      },
      "learning-strategy": {
        title: "Learning, Strategy & Ventures",
        description: "Learning systems and reasoning tools that separate inspectable evidence from attractive but unsupported claims.",
      },
    },
    startPaths: {
      finance: {
        eyebrow: "PRODUCT / CONTROL ROOM",
        title: "Reconcile a fictional household ledger",
        description: "Trace cash flow, recurring patterns, transfers, import decisions and account reconciliation from one synthetic ledger.",
      },
      insurance: {
        eyebrow: "DECISION EVIDENCE",
        title: "Review an insurance market decision",
        description: "Keep three evidence pillars separate, inspect missingness and compare the current method with a retired composite sandbox.",
      },
      mri: {
        eyebrow: "SCIENTIFIC ML",
        title: "Interrogate an MRI trust gate",
        description: "Connect reconstruction, data consistency, uncertainty and downstream evaluation without treating one metric as proof.",
      },
      molecular: {
        eyebrow: "MOLECULAR RESEARCH",
        title: "Assign a synthetic spectrum",
        description: "Compare predicted conformers with a 2–8 GHz trace and inspect residual assignment evidence.",
      },
    },
  },
  filters: {
    searchAria: "Search projects",
    searchPlaceholder: "Search titles, methods, tools…",
    clearSearch: "Clear search",
    disciplineAria: "Filter by discipline",
    allDisciplines: "All disciplines",
    accessAria: "Filter by access",
    allAccess: "All access levels",
    sortAria: "Sort projects",
    sortCurated: "Curated order",
    sortRecent: "Newest first",
    sortTitle: "Title A–Z",
    featured: "Featured",
    accessKey: "Access key…",
    clearFilters: "Clear filters",
  },
  layout: {
    aria: "Project archive layout",
    label: "Layout",
    catalogueFocus: "Catalogue focus",
    balanced: "Balanced",
    detailFocus: "Detail focus",
  },
  catalogue: {
    aria: "Project files",
    objects: "{shown} of {total} objects",
    archiveMap: "Portfolio map · 6 views",
    inspectable: "inspectable",
    protected: "protected",
    emptyTitle: "No matching project files",
    emptyDescription: "Try another discipline or clear the search.",
    showAll: "Show all projects",
    resultsStatus: "{count} projects shown. {title} selected. Its project details are ready.",
  },
  detail: {
    interactiveDemoAria: "Interactive project view: {title}",
    detailsAria: "{title} project details",
    archiveMapAria: "Interactive project archive map",
    archiveMapTitle: "Portfolio Map",
    archiveMapEyebrow: "SOURCE-DERIVED ARCHIVE OVERVIEW",
    backToProject: "← Project file",
    safePort: "SAFE INTERACTIVE PORT",
    privateBoundary: "Private system · public boundary applied",
    privacyNote: "Privacy note",
    derivedArtifact: "DERIVED ARTIFACT",
    technologiesAria: "Technologies and methods",
    buildLog: "BUILD LOG",
    buildJourney: "Small → useful → polished",
    evidence: "EVIDENCE",
    safeToShow: "What is safe to show",
    caseBrief: {
      eyebrow: "CASE BRIEF / READ BEFORE INTERACTING",
      title: "What this project is trying to establish",
      purpose: "CONTEXT & PURPOSE",
      audience: "WHO THIS IS FOR",
      problem: "PROBLEM",
      objective: "OBJECTIVE",
      contribution: "SAMUEL'S CONTRIBUTION",
      pipeline: "INPUT → METHOD → OUTPUT",
      progression: "WORK PROGRESSION",
      evidence: "EVIDENCE CONTRACT",
      walkthrough: "30-SECOND WALKTHROUGH",
      walkthroughCopy: "Change one visible input, read the calculation or trace that changes with it, then use the method or evidence panel to distinguish the source record from this safe browser reconstruction.",
      boundary: "BOUNDARY",
      relatedSuite: "RELATED SUITE",
      relatedCopy: "Open a connected chapter without losing this project’s individual evidence boundary.",
      discuss: "Discuss this work →",
      workspace: "SUITE WORKSPACE",
      chapter: "CHAPTER {chapter} / {total}",
      openChapter: "Open suite chapter",
    },
  },
  markers: { demo: "DEMO", live: "LIVE", suite: "SUITE" },
  actions: {
    panelAria: "Actions for {title}",
    commands: "PROJECT COMMANDS",
    launchTitle: "Launch & inspect",
    launchDescription: "Open the working surface or its supporting evidence.",
    liveDemo: "LIVE DEMO",
    ready: "READY",
    newWindow: "NEW WINDOW",
    opensNewWindow: " (opens in a new window)",
    systemSeven: "SYSTEM 7",
    inDesktop: "IN DESKTOP",
    emptyTitle: "This project file is the public destination.",
    emptyDescription: "No external material is attached to this entry.",
    shareTitle: "Share this project",
    shareDescription: "Deep link to this exact project without losing the current language route.",
    directAddress: "DIRECT ADDRESS",
    copied: "Copied",
    copyLink: "Copy link",
    share: "Share…",
    openLink: "Open link",
    inNewWindow: " in a new window",
    defaultDemo: "Run interactive demo",
    defaultSystemApp: "Open related System 7 file",
    visitCoverd: "Visit COVERD",
    visitWebsite: "Visit project website",
    sourceNoLicence: "Inspect source snapshot · no licence",
    viewRepository: "View repository",
    openLab: "Open {title}",
    openSuite: "Open {title}",
    suiteChapter: "SUITE CHAPTER {chapter} / {total}",
    openCoverdBrief: "Open COVERD product brief",
    openSystemFile: "Open related System 7 file",
    shareMessage: "Explore {title} in Samuel Zhang's project archive.",
    status: {
      idle: "A direct link reopens this exact project and preserves the current language route.",
      copied: "Direct project link copied to the clipboard.",
      shared: "Project shared from your device.",
      manual: "Link selected. Press Ctrl+C or ⌘C to copy it.",
    },
  },
  access: {
    "open-source": {
      label: "Open source",
      short: "OPEN",
      description: "Code or learning materials have an explicit public licence.",
    },
    "public-demo": {
      label: "Public demo",
      short: "DEMO",
      description: "A safe interactive version runs in this portfolio.",
    },
    "case-study": {
      label: "Case study",
      short: "STUDY",
      description: "Selected methods and outcomes are available without sensitive source material.",
    },
    proprietary: {
      label: "Private / redacted",
      short: "LOCKED",
      description: "Private data and source stay locked; only approved context, artefacts or synthetic demonstrations are shown.",
    },
  },
  areas: {
    Products: "Products",
    "Applied AI": "Applied AI",
    "Machine Learning": "Machine Learning",
    Research: "Research",
    Systems: "Systems",
    Education: "Education",
  },
  statuses: { Shipped: "Shipped", Active: "Active", Research: "Research", Archive: "Archive" },
  phases: { "Start small": "Start small", "Move forward": "Move forward", Polish: "Polish" },
  artifactKinds: { PDF: "PDF", NOTEBOOK: "NOTEBOOK", "CASE STUDY": "CASE STUDY", SOURCE: "SOURCE" },
  resourceKinds: {
    OPEN: "OPEN",
    "LIVE WEBSITE": "LIVE WEBSITE",
    PDF: "PDF",
    NOTEBOOK: "NOTEBOOK",
    "CASE STUDY": "CASE STUDY",
    SOURCE: "SOURCE",
    "PUBLIC REPO": "PUBLIC REPO",
  },
};

const enUS: ProjectArchiveCopy = {
  ...enGB,
  header: {
    ...enGB.header,
    languageNotice: "Project titles and source-grounded descriptions remain in British English; archive controls use your selected US English.",
  },
  guided: {
    ...enGB.guided,
    heroDescription: "Start with one short walkthrough, then open a themed shelf. Suites organize related chapters without merging their evidence or changing any project address.",
    reconciliation: "14 guided experiences organize all 27 interactive chapters; four non-demo files remain inspectable; all 31 canonical project links stay intact.",
    shelves: {
      ...enGB.guided.shelves,
      "molecular-computational": {
        ...enGB.guided.shelves["molecular-computational"],
        description: "Inspectable paths through spectral assignment, thermodynamic modeling and computational-chemistry kernels.",
      },
    },
  },
  actions: {
    ...enGB.actions,
    sourceNoLicence: "Inspect source snapshot · no license",
  },
  access: {
    ...enGB.access,
    "open-source": {
      ...enGB.access["open-source"],
      description: "Code or learning materials have an explicit public license.",
    },
    proprietary: {
      ...enGB.access.proprietary,
      description: "Private data and source stay locked; only approved context, artifacts or synthetic demonstrations are shown.",
    },
  },
};

const zhCN: ProjectArchiveCopy = {
  header: {
    eyebrow: "SAMUEL HD / 项目 / 索引",
    title: "项目档案",
    description: "产品、实验与研究——仅展示每个项目获准公开的部分。",
    summaryAria: "档案概览",
    files: "份档案",
    interactive: "个专题体验",
    suites: "个专题",
    redacted: "项已隐去",
    languageNotice: "项目标题与经来源核实的说明保留英式英语；档案界面使用您选择的语言。",
  },
  views: {
    aria: "项目档案视图",
    guided: "引导式工作区",
    guidedHint: "六个主题 · 14 个体验",
    files: "全部 {count} 份档案",
    filesHint: "搜索并查看每一份来源记录",
    map: "项目地图",
    mapHint: "关联、工具与证据",
  },
  guided: {
    heroEyebrow: "SAMUEL HD / 项目 / 引导式工作区",
    heroTitle: "选择一条探索路径",
    heroDescription: "先从一个简短导览开始，再打开一个主题抽屉。专题只组织相关章节，不会合并各自的证据，也不会改变任何项目地址。",
    statsAria: "引导式项目档案概览",
    experiencesStat: "引导式体验",
    suitesStat: "策展专题",
    filesStat: "证据档案",
    startEyebrow: "从这里开始 · 约 30 秒",
    startTitle: "选择一个问题",
    startDescription: "四个实用入口；每个入口都会打开一个真实且独立的章节。",
    shelvesEyebrow: "陈列柜 / 六个主题抽屉",
    shelvesTitle: "按待解决的问题浏览",
    shelvesDescription: "打开一个抽屉，再查看其中的体验及各自的证据档案。",
    drawer: "抽屉",
    experience: "个体验",
    experiences: "个体验",
    chapter: "章",
    chapters: "章",
    openDrawer: "打开抽屉",
    closeDrawer: "关闭抽屉",
    showChapters: "显示章节",
    hideChapters: "收起章节",
    recommended: "建议先看此章节",
    readBrief: "阅读案例摘要",
    runDemo: "运行互动演示",
    referenceFile: "参考档案",
    supportingFiles: "支撑档案",
    supportingDescription: "原始成果与受保护的项目故事保持可见，不会被勉强包装成演示。",
    viewProject: "查看项目档案",
    selected: "已选档案",
    reconciliationLead: "没有内容被隐藏：",
    reconciliation: "14 个引导式体验组织全部 27 个互动章节；四份非演示档案仍可查看；31 个项目直达链接全部保持不变。",
    shelves: {
      "products-operations": {
        title: "产品与运营",
        description: "把文档、日历、财务记录与市场证据转化为可审查决策的实际产品。",
      },
      "decision-intelligence": {
        title: "决策智能与强化学习",
        description: "从强化学习基础延伸到日志策略证据、因果调整与安全的人机分工。",
      },
      "scientific-ml": {
        title: "科学机器学习与可信性",
        description: "围绕科学机器学习系统的架构、不确定性、评估溯源与传感器权衡。",
      },
      "molecular-computational": {
        title: "分子与计算科学",
        description: "以可检查的方式串联光谱归属、热力学建模与计算化学核心。",
      },
      "systems-reproducibility": {
        title: "系统与可复现性",
        description: "通过环境解析、基础设施边界与小型代码审计，明确可复现性能够证明和不能证明的内容。",
      },
      "learning-strategy": {
        title: "学习、战略与创业",
        description: "用学习系统与推理工具区分可检查证据和看似吸引人但缺乏支撑的主张。",
      },
    },
    startPaths: {
      finance: {
        eyebrow: "产品 / 控制台",
        title: "核对一份虚构家庭账本",
        description: "从同一份合成账本追踪现金流、周期模式、转账、导入决策与账户核对。",
      },
      insurance: {
        eyebrow: "决策证据",
        title: "审查一次保险市场决策",
        description: "保持三类证据相互独立，检查缺失情况，并对比当前方法与已停用的组合评分沙盒。",
      },
      mri: {
        eyebrow: "科学机器学习",
        title: "检查 MRI 可信关卡",
        description: "连接重建、数据一致性、不确定性与下游评估，而不是把单一指标当作证明。",
      },
      molecular: {
        eyebrow: "分子研究",
        title: "归属一条合成光谱",
        description: "把预测构象与 2–8 GHz 轨迹进行比较，并检查残差归属证据。",
      },
    },
  },
  filters: {
    searchAria: "搜索项目",
    searchPlaceholder: "搜索标题、方法或工具…",
    clearSearch: "清除搜索",
    disciplineAria: "按领域筛选",
    allDisciplines: "所有领域",
    accessAria: "按公开级别筛选",
    allAccess: "所有公开级别",
    sortAria: "项目排序",
    sortCurated: "策展顺序",
    sortRecent: "最新优先",
    sortTitle: "标题 A–Z",
    featured: "精选",
    accessKey: "公开级别说明…",
    clearFilters: "清除筛选",
  },
  layout: {
    aria: "项目档案布局",
    label: "布局",
    catalogueFocus: "列表优先",
    balanced: "均衡",
    detailFocus: "详情优先",
  },
  catalogue: {
    aria: "项目档案列表",
    objects: "显示 {shown} / {total} 项",
    archiveMap: "项目地图 · 6 个视图",
    inspectable: "项可查看",
    protected: "项受保护",
    emptyTitle: "没有匹配的项目档案",
    emptyDescription: "请选择其他领域或清除搜索条件。",
    showAll: "显示全部项目",
    resultsStatus: "当前显示 {count} 个项目。已选择 {title}，其项目详情已就绪。",
  },
  detail: {
    interactiveDemoAria: "互动项目视图：{title}",
    detailsAria: "{title} 项目详情",
    archiveMapAria: "互动项目档案地图",
    archiveMapTitle: "项目地图",
    archiveMapEyebrow: "由项目档案推导的总览",
    backToProject: "← 返回项目档案",
    safePort: "安全互动移植版",
    privateBoundary: "非公开系统 · 已应用公开边界",
    privacyNote: "隐私说明",
    derivedArtifact: "衍生成果",
    technologiesAria: "技术与方法",
    buildLog: "构建记录",
    buildJourney: "从小开始 → 实用 → 完善",
    evidence: "可展示证据",
    safeToShow: "获准公开的内容",
    caseBrief: {
      eyebrow: "案例摘要 / 互动前请先阅读",
      title: "此项目希望说明什么",
      purpose: "背景与目标",
      audience: "适用对象",
      problem: "问题",
      objective: "目标",
      contribution: "SAMUEL 的贡献",
      pipeline: "输入 → 方法 → 输出",
      progression: "工作推进过程",
      evidence: "证据范围",
      walkthrough: "30 秒导览",
      walkthroughCopy: "改变一个可见输入，查看随之变化的计算或轨迹，然后通过方法或证据面板区分来源记录与这个安全的浏览器重构版。",
      boundary: "公开边界",
      relatedSuite: "相关专题",
      relatedCopy: "打开相关章节，同时保留此项目独立的证据边界。",
      discuss: "讨论此项目 →",
      workspace: "专题工作区",
      chapter: "第 {chapter} / {total} 章",
      openChapter: "打开专题章节",
    },
  },
  markers: { demo: "演示", live: "在线", suite: "专题" },
  actions: {
    panelAria: "{title} 的项目操作",
    commands: "项目操作",
    launchTitle: "打开与查看",
    launchDescription: "打开可操作界面或支撑材料。",
    liveDemo: "互动演示",
    ready: "就绪",
    newWindow: "新窗口",
    opensNewWindow: "（将在新窗口中打开）",
    systemSeven: "SYSTEM 7",
    inDesktop: "在桌面中",
    emptyTitle: "此项目档案即为公开展示页面。",
    emptyDescription: "此条目未附带外部材料。",
    shareTitle: "分享此项目",
    shareDescription: "创建此项目的直达链接，同时保留当前语言路径。",
    directAddress: "直达地址",
    copied: "已复制",
    copyLink: "复制链接",
    share: "分享…",
    openLink: "打开链接",
    inNewWindow: "（在新窗口中）",
    defaultDemo: "运行互动演示",
    defaultSystemApp: "打开相关 System 7 档案",
    visitCoverd: "访问 COVERD",
    visitWebsite: "访问项目网站",
    sourceNoLicence: "查看来源快照 · 未声明许可证",
    viewRepository: "查看代码仓库",
    openLab: "打开 {title}",
    openSuite: "打开 {title}",
    suiteChapter: "专题章节 {chapter} / {total}",
    openCoverdBrief: "打开 COVERD 产品简介",
    openSystemFile: "打开相关 System 7 档案",
    shareMessage: "在 Samuel Zhang 的项目档案中查看 {title}。",
    status: {
      idle: "直达链接会重新打开此项目，并保留当前语言路径。",
      copied: "项目直达链接已复制到剪贴板。",
      shared: "已通过您的设备分享此项目。",
      manual: "链接已选中。请按 Ctrl+C 或 ⌘C 复制。",
    },
  },
  access: {
    "open-source": {
      label: "开源",
      short: "开源",
      description: "代码或学习材料附有明确的公开许可证。",
    },
    "public-demo": {
      label: "公开演示",
      short: "演示",
      description: "此作品集中提供经过安全处理的互动版本。",
    },
    "case-study": {
      label: "案例研究",
      short: "案例",
      description: "在不公开敏感源材料的前提下展示部分方法与成果。",
    },
    proprietary: {
      label: "非公开 / 已隐去",
      short: "受限",
      description: "非公开数据与源代码保持封闭；仅展示获准公开的背景、成果或合成演示。",
    },
  },
  areas: {
    Products: "产品",
    "Applied AI": "应用人工智能",
    "Machine Learning": "机器学习",
    Research: "研究",
    Systems: "系统",
    Education: "教育",
  },
  statuses: { Shipped: "已交付", Active: "进行中", Research: "研究中", Archive: "已归档" },
  phases: { "Start small": "从小开始", "Move forward": "继续推进", Polish: "完善打磨" },
  artifactKinds: { PDF: "PDF", NOTEBOOK: "笔记本", "CASE STUDY": "案例研究", SOURCE: "源代码" },
  resourceKinds: {
    OPEN: "打开",
    "LIVE WEBSITE": "在线网站",
    PDF: "PDF",
    NOTEBOOK: "笔记本",
    "CASE STUDY": "案例研究",
    SOURCE: "源代码",
    "PUBLIC REPO": "公开仓库",
  },
};

const zhTW: ProjectArchiveCopy = {
  header: {
    eyebrow: "SAMUEL HD / 專案 / 索引",
    title: "專案檔案",
    description: "產品、實驗與研究——僅展示每個專案獲准公開的部分。",
    summaryAria: "檔案概覽",
    files: "份檔案",
    interactive: "個專題體驗",
    suites: "個專題",
    redacted: "項已隱去",
    languageNotice: "專案標題與經來源核實的說明保留英式英語；檔案介面使用您選擇的語言。",
  },
  views: {
    aria: "專案檔案檢視",
    guided: "引導式工作區",
    guidedHint: "六個主題 · 14 個體驗",
    files: "全部 {count} 份檔案",
    filesHint: "搜尋並查看每一份來源記錄",
    map: "專案地圖",
    mapHint: "關聯、工具與證據",
  },
  guided: {
    heroEyebrow: "SAMUEL HD / 專案 / 引導式工作區",
    heroTitle: "選擇一條探索路徑",
    heroDescription: "先從一個簡短導覽開始，再開啟一個主題抽屜。專題只組織相關章節，不會合併各自的證據，也不會變更任何專案網址。",
    statsAria: "引導式專案檔案概覽",
    experiencesStat: "引導式體驗",
    suitesStat: "策展專題",
    filesStat: "證據檔案",
    startEyebrow: "從這裡開始 · 約 30 秒",
    startTitle: "選擇一個問題",
    startDescription: "四個實用入口；每個入口都會開啟一個真實且獨立的章節。",
    shelvesEyebrow: "陳列櫃 / 六個主題抽屜",
    shelvesTitle: "依待解決的問題瀏覽",
    shelvesDescription: "開啟一個抽屜，再查看其中的體驗及各自的證據檔案。",
    drawer: "抽屜",
    experience: "個體驗",
    experiences: "個體驗",
    chapter: "章",
    chapters: "章",
    openDrawer: "開啟抽屜",
    closeDrawer: "關閉抽屜",
    showChapters: "顯示章節",
    hideChapters: "收起章節",
    recommended: "建議先看此章節",
    readBrief: "閱讀案例摘要",
    runDemo: "執行互動展示",
    referenceFile: "參考檔案",
    supportingFiles: "支撐檔案",
    supportingDescription: "原始成果與受保護的專案故事保持可見，不會被勉強包裝成展示。",
    viewProject: "查看專案檔案",
    selected: "已選檔案",
    reconciliationLead: "沒有內容被隱藏：",
    reconciliation: "14 個引導式體驗組織全部 27 個互動章節；四份非展示檔案仍可查看；31 個專案直達連結全部保持不變。",
    shelves: {
      "products-operations": {
        title: "產品與營運",
        description: "把文件、行事曆、財務記錄與市場證據轉化為可審查決策的實際產品。",
      },
      "decision-intelligence": {
        title: "決策智慧與強化學習",
        description: "從強化學習基礎延伸至記錄策略證據、因果調整與安全的人機分工。",
      },
      "scientific-ml": {
        title: "科學機器學習與可信度",
        description: "聚焦科學機器學習系統的架構、不確定性、評估溯源與感測器取捨。",
      },
      "molecular-computational": {
        title: "分子與計算科學",
        description: "以可檢查的方式串聯光譜指認、熱力學建模與計算化學核心。",
      },
      "systems-reproducibility": {
        title: "系統與可重現性",
        description: "透過環境解析、基礎設施邊界與小型程式碼稽核，明確說明可重現性可以及無法證明的內容。",
      },
      "learning-strategy": {
        title: "學習、策略與新創",
        description: "運用學習系統與推理工具，區分可檢查的證據與看似吸引人但缺乏支持的主張。",
      },
    },
    startPaths: {
      finance: {
        eyebrow: "產品 / 控制台",
        title: "核對一份虛構家庭帳本",
        description: "從同一份合成帳本追蹤現金流、週期模式、轉帳、匯入決策與帳戶核對。",
      },
      insurance: {
        eyebrow: "決策證據",
        title: "審查一項保險市場決策",
        description: "保持三類證據相互獨立，檢查資料缺漏，並比較目前方法與已停用的綜合評分沙盒。",
      },
      mri: {
        eyebrow: "科學機器學習",
        title: "檢查 MRI 可信關卡",
        description: "串聯重建、資料一致性、不確定性與下游評估，而不把單一指標視為證明。",
      },
      molecular: {
        eyebrow: "分子研究",
        title: "解析一條合成光譜",
        description: "比對預測構形與 2–8 GHz 軌跡，並檢查殘差指認證據。",
      },
    },
  },
  filters: {
    searchAria: "搜尋專案",
    searchPlaceholder: "搜尋標題、方法或工具…",
    clearSearch: "清除搜尋",
    disciplineAria: "依領域篩選",
    allDisciplines: "所有領域",
    accessAria: "依公開層級篩選",
    allAccess: "所有公開層級",
    sortAria: "專案排序",
    sortCurated: "策展順序",
    sortRecent: "最新優先",
    sortTitle: "標題 A–Z",
    featured: "精選",
    accessKey: "公開層級說明…",
    clearFilters: "清除篩選",
  },
  layout: {
    aria: "專案檔案版面配置",
    label: "版面配置",
    catalogueFocus: "清單優先",
    balanced: "平衡",
    detailFocus: "詳情優先",
  },
  catalogue: {
    aria: "專案檔案清單",
    objects: "顯示 {shown} / {total} 項",
    archiveMap: "專案地圖 · 6 個檢視",
    inspectable: "項可查看",
    protected: "項受保護",
    emptyTitle: "沒有符合條件的專案檔案",
    emptyDescription: "請選擇其他領域或清除搜尋條件。",
    showAll: "顯示全部專案",
    resultsStatus: "目前顯示 {count} 個專案。已選擇 {title}，其專案詳情已就緒。",
  },
  detail: {
    interactiveDemoAria: "互動專案檢視：{title}",
    detailsAria: "{title} 專案詳情",
    archiveMapAria: "互動專案檔案地圖",
    archiveMapTitle: "專案地圖",
    archiveMapEyebrow: "由專案檔案推導的總覽",
    backToProject: "← 返回專案檔案",
    safePort: "安全互動移植版",
    privateBoundary: "非公開系統 · 已套用公開邊界",
    privacyNote: "隱私說明",
    derivedArtifact: "衍生成果",
    technologiesAria: "技術與方法",
    buildLog: "建置紀錄",
    buildJourney: "從小開始 → 實用 → 完善",
    evidence: "可展示證據",
    safeToShow: "獲准公開的內容",
    caseBrief: {
      eyebrow: "案例摘要 / 互動前請先閱讀",
      title: "此專案希望說明什麼",
      purpose: "背景與目標",
      audience: "適用對象",
      problem: "問題",
      objective: "目標",
      contribution: "SAMUEL 的貢獻",
      pipeline: "輸入 → 方法 → 輸出",
      progression: "工作推進過程",
      evidence: "證據範圍",
      walkthrough: "30 秒導覽",
      walkthroughCopy: "變更一個可見輸入，查看隨之改變的計算或軌跡，然後透過方法或證據面板區分來源記錄與這個安全的瀏覽器重構版。",
      boundary: "公開邊界",
      relatedSuite: "相關專題",
      relatedCopy: "開啟相關章節，同時保留此專案獨立的證據邊界。",
      discuss: "討論此專案 →",
      workspace: "專題工作區",
      chapter: "第 {chapter} / {total} 章",
      openChapter: "開啟專題章節",
    },
  },
  markers: { demo: "展示", live: "線上", suite: "專題" },
  actions: {
    panelAria: "{title} 的專案操作",
    commands: "專案操作",
    launchTitle: "開啟與查看",
    launchDescription: "開啟可操作介面或支援材料。",
    liveDemo: "互動展示",
    ready: "就緒",
    newWindow: "新視窗",
    opensNewWindow: "（將在新視窗中開啟）",
    systemSeven: "SYSTEM 7",
    inDesktop: "在桌面中",
    emptyTitle: "此專案檔案即為公開展示頁面。",
    emptyDescription: "此項目未附帶外部材料。",
    shareTitle: "分享此專案",
    shareDescription: "建立此專案的直接連結，同時保留目前語言路徑。",
    directAddress: "直接網址",
    copied: "已複製",
    copyLink: "複製連結",
    share: "分享…",
    openLink: "開啟連結",
    inNewWindow: "（在新視窗中）",
    defaultDemo: "執行互動展示",
    defaultSystemApp: "開啟相關 System 7 檔案",
    visitCoverd: "造訪 COVERD",
    visitWebsite: "造訪專案網站",
    sourceNoLicence: "查看來源快照 · 未聲明授權條款",
    viewRepository: "查看程式碼倉庫",
    openLab: "開啟 {title}",
    openSuite: "開啟 {title}",
    suiteChapter: "專題章節 {chapter} / {total}",
    openCoverdBrief: "開啟 COVERD 產品簡介",
    openSystemFile: "開啟相關 System 7 檔案",
    shareMessage: "在 Samuel Zhang 的專案檔案中查看 {title}。",
    status: {
      idle: "直接連結會重新開啟此專案，並保留目前語言路徑。",
      copied: "專案直接連結已複製到剪貼簿。",
      shared: "已透過您的裝置分享此專案。",
      manual: "連結已選取。請按 Ctrl+C 或 ⌘C 複製。",
    },
  },
  access: {
    "open-source": {
      label: "開放原始碼",
      short: "開源",
      description: "程式碼或學習材料附有明確的公開授權條款。",
    },
    "public-demo": {
      label: "公開展示",
      short: "展示",
      description: "此作品集中提供經過安全處理的互動版本。",
    },
    "case-study": {
      label: "案例研究",
      short: "案例",
      description: "在不公開敏感來源材料的前提下展示部分方法與成果。",
    },
    proprietary: {
      label: "非公開 / 已隱去",
      short: "受限",
      description: "非公開資料與原始碼保持封閉；僅展示獲准公開的背景、成果或合成展示。",
    },
  },
  areas: {
    Products: "產品",
    "Applied AI": "應用人工智慧",
    "Machine Learning": "機器學習",
    Research: "研究",
    Systems: "系統",
    Education: "教育",
  },
  statuses: { Shipped: "已交付", Active: "進行中", Research: "研究中", Archive: "已歸檔" },
  phases: { "Start small": "從小開始", "Move forward": "繼續推進", Polish: "完善打磨" },
  artifactKinds: { PDF: "PDF", NOTEBOOK: "筆記本", "CASE STUDY": "案例研究", SOURCE: "原始碼" },
  resourceKinds: {
    OPEN: "開啟",
    "LIVE WEBSITE": "線上網站",
    PDF: "PDF",
    NOTEBOOK: "筆記本",
    "CASE STUDY": "案例研究",
    SOURCE: "原始碼",
    "PUBLIC REPO": "公開倉庫",
  },
};

const copyByLocale: Record<Locale, ProjectArchiveCopy> = {
  "en-GB": enGB,
  "en-US": enUS,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

export function getProjectArchiveCopy(locale: Locale = "en-GB") {
  return copyByLocale[locale];
}

export function formatProjectArchiveCopy(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  ));
}

export function localiseResourceKind(locale: Locale, kind?: string) {
  const normalised = kind?.trim().toLocaleUpperCase("en-GB") || "OPEN";
  return getProjectArchiveCopy(locale).resourceKinds[normalised] ?? normalised;
}
