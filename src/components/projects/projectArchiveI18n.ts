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
    latestEyebrow: string;
    latestDate: string;
    latestTitle: string;
    latestDescription: string;
    latestAction: string;
    latestImageAlt: string;
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
    skipToInteractive: string;
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
    description: "Products, experiments and research. Private work is clearly marked.",
    summaryAria: "Archive summary",
    files: "files",
    interactive: "experiences",
    suites: "suites",
    redacted: "redacted",
    languageNotice: "Interface and project text: English (UK). Original figures and files retain their source language.",
  },
  views: {
    aria: "Project Archive views",
    guided: "Highlights",
    guidedHint: "RUN/HACK · interactive projects",
    files: "All {count} Projects",
    filesHint: "Search and inspect the complete archive",
    map: "Knowledge graph",
    mapHint: "Explore topics, projects and experience",
  },
  guided: {
    heroEyebrow: "SAMUEL HD / PROJECTS / HIGHLIGHTS",
    heroTitle: "Start with a few projects",
    heroDescription: "Try a demo, read the RUN/HACK field note, or open the full project list.",
    statsAria: "Guided Archive summary",
    experiencesStat: "Guided experiences",
    suitesStat: "Project groups",
    filesStat: "Evidence files",
    startEyebrow: "FEATURED WORK · GOOD PLACES TO START",
    startTitle: "Pick a question",
    startDescription: "Each of these four questions leads to a project you can try in the browser.",
    latestEyebrow: "LATEST FIELD NOTE · RUNNING HACKATHON",
    latestDate: "29 AUG 2026",
    latestTitle: "What happens when only the runner can build?",
    latestDescription: "A rain-soaked 44 km team relay, more than 100 builders, a voice-built social running app and a second-place finish.",
    latestAction: "Read the RUN/HACK field journal",
    latestImageAlt: "Samuel and another participant using their phones while moving around the London Stadium Community Track.",
    shelvesEyebrow: "EXPLORE ALL WORK / SIX PROBLEM AREAS",
    shelvesTitle: "Browse by the problem being solved",
    shelvesDescription: "Open a section to see its projects and supporting material.",
    drawer: "Section",
    experience: "experience",
    experiences: "experiences",
    chapter: "chapter",
    chapters: "chapters",
    openDrawer: "Open section",
    closeDrawer: "Close section",
    showChapters: "Show chapters",
    hideChapters: "Hide chapters",
    recommended: "Recommended first chapter",
    readBrief: "Read case brief",
    runDemo: "Run interactive demo",
    referenceFile: "Reference file",
    supportingFiles: "Supporting files",
    supportingDescription: "Original outputs and protected stories remain available as reference files.",
    viewProject: "View project file",
    selected: "Selected file",
    reconciliationLead: "In the full list:",
    reconciliation: "All 41 project files have direct links. The full list includes interactive work, nine desktop apps and reference files.",
    shelves: {
      "products-operations": {
        title: "Build products people can use",
        description: "Working products for decisions based on documents, calendars, financial records and market evidence.",
      },
      "decision-intelligence": {
        title: "Decide with incomplete evidence",
        description: "Reinforcement learning, logged decisions, causal analysis and when a person should review a result.",
      },
      "scientific-ml": {
        title: "Know when machine learning is trustworthy",
        description: "How the scientific models work, where the data came from and what their tests can tell us.",
      },
      "molecular-computational": {
        title: "Understand molecules & physical systems",
        description: "Worked examples in spectral assignment, thermodynamic modelling and computational-chemistry kernels.",
      },
      "systems-reproducibility": {
        title: "Make technical systems reproducible",
        description: "GPU environments, infrastructure and small code audits, including where a result cannot yet be reproduced.",
      },
      "learning-strategy": {
        title: "Learn, explain & test new ventures",
        description: "Learning systems and reasoning tools that separate evidence a reader can check from unsupported claims.",
      },
    },
    startPaths: {
      insurance: {
        eyebrow: "DECISION EVIDENCE",
        title: "How can an insurance decision keep its evidence visible?",
        description: "Keep three evidence pillars separate, inspect missingness and compare the current method with a retired composite sandbox.",
      },
      mri: {
        eyebrow: "SCIENTIFIC ML",
        title: "When should an MRI reconstruction earn trust?",
        description: "Connect reconstruction, data consistency, uncertainty and downstream evaluation without treating one metric as proof.",
      },
      microrobot: {
        eyebrow: "VISION / ROBOTICS",
        title: "How can vision estimate a microrobot’s pose and depth?",
        description: "See how microscope images become pose and depth estimates, and where the research prototype still needs testing.",
      },
      molecular: {
        eyebrow: "MOLECULAR RESEARCH",
        title: "Can a synthetic spectrum identify the right conformer?",
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
    inspectable: "available",
    protected: "protected",
    emptyTitle: "No matching project files",
    emptyDescription: "Try another discipline or clear the search.",
    showAll: "Show all projects",
    resultsStatus: "{count} projects shown. {title} selected. Its project details are ready.",
  },
  detail: {
    skipToInteractive: "Skip to interactive lab ↓",
    interactiveDemoAria: "Interactive project view: {title}",
    detailsAria: "{title} project details",
    archiveMapAria: "Interactive project archive map",
    archiveMapTitle: "Portfolio Map",
    archiveMapEyebrow: "PROJECT ARCHIVE AT A GLANCE",
    backToProject: "← Project file",
    safePort: "INTERACTIVE PROJECT",
    privateBoundary: "Private system · public boundary applied",
    privacyNote: "Privacy note",
    derivedArtifact: "DERIVED ARTIFACT",
    technologiesAria: "Technologies and methods",
    buildLog: "BUILD LOG",
    buildJourney: "Small → useful → polished",
    evidence: "EVIDENCE",
    safeToShow: "What is safe to show",
    caseBrief: {
      eyebrow: "BEFORE YOU TRY IT",
      title: "What this project does",
      purpose: "CONTEXT & PURPOSE",
      audience: "WHO THIS IS FOR",
      problem: "PROBLEM",
      objective: "OBJECTIVE",
      contribution: "SAMUEL'S CONTRIBUTION",
      pipeline: "INPUT → METHOD → OUTPUT",
      progression: "WORK PROGRESSION",
      evidence: "WHAT THE EVIDENCE SHOWS",
      walkthrough: "30-SECOND WALKTHROUGH",
      walkthroughCopy: "Change an input and see what happens to the calculation. The method and evidence panels explain which results came from the original work and which are browser examples.",
      boundary: "BOUNDARY",
      relatedSuite: "RELATED SUITE",
      relatedCopy: "Open another chapter in this group. Each project has its own sources and limits.",
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
    languageNotice: "Interface and project text: English (US). Original figures and files retain their source language.",
  },
  guided: {
    ...enGB.guided,
    latestDate: "AUG 29, 2026",
    heroDescription: "Try a demo, read the RUN/HACK field note, or open the full project list.",
    reconciliation: "All 41 project files have direct links. The full list includes interactive work, nine desktop apps and reference files.",
    shelves: {
      ...enGB.guided.shelves,
      "molecular-computational": {
        ...enGB.guided.shelves["molecular-computational"],
        description: "Worked examples in spectral assignment, thermodynamic modeling and computational-chemistry kernels.",
      },
    },
  },
  layout: {
    ...enGB.layout,
    catalogueFocus: "Catalog focus",
  },
  detail: {
    ...enGB.detail,
    skipToInteractive: "Skip to interactive lab ↓",
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
    description: "这里有产品、实验与研究项目。非公开项目会明确标注。",
    summaryAria: "档案概览",
    files: "份档案",
    interactive: "个专题体验",
    suites: "个专题",
    redacted: "项已隐去",
    languageNotice: "界面与项目说明：简体中文。原始图表和文件保留源语言。",
  },
  views: {
    aria: "项目档案视图",
    guided: "精选",
    guidedHint: "RUN/HACK · 互动项目",
    files: "全部 {count} 个项目",
    filesHint: "搜索并查看完整项目档案",
    map: "知识图谱",
    mapHint: "探索项目、方法与经历",
  },
  guided: {
    heroEyebrow: "SAMUEL HD / 项目 / 精选",
    heroTitle: "先看看几个项目",
    heroDescription: "试用演示、阅读 RUN/HACK 现场记录，或打开完整项目列表。",
    statsAria: "引导式项目档案概览",
    experiencesStat: "引导式体验",
    suitesStat: "项目分组",
    filesStat: "项目档案",
    startEyebrow: "精选项目 · 建议从这里开始",
    startTitle: "选一个问题",
    startDescription: "这四个问题分别对应一个可以在浏览器里试用的项目。",
    latestEyebrow: "最新现场记录 · 跑步黑客松",
    latestDate: "2026 年 8 月 29 日",
    latestTitle: "如果只有正在跑步的人才能构建产品，会发生什么？",
    latestDescription: "雨中完成 44 公里团队接力，100 多名开发者参与，用语音构建一款社交跑步应用，并最终获得第二名。",
    latestAction: "阅读 RUN/HACK 现场记录",
    latestImageAlt: "Samuel 与另一位参与者在伦敦体育场社区跑道上一边移动，一边使用手机。",
    shelvesEyebrow: "浏览全部项目 / 六类问题",
    shelvesTitle: "按待解决的问题浏览",
    shelvesDescription: "打开一个分类，查看其中的项目和相关资料。",
    drawer: "分类",
    experience: "个体验",
    experiences: "个体验",
    chapter: "章",
    chapters: "章",
    openDrawer: "打开分类",
    closeDrawer: "关闭分类",
    showChapters: "显示章节",
    hideChapters: "收起章节",
    recommended: "建议先看此章节",
    readBrief: "阅读案例摘要",
    runDemo: "运行互动演示",
    referenceFile: "参考档案",
    supportingFiles: "补充资料",
    supportingDescription: "原始成果和不便公开的项目故事仍可在参考档案中查看。",
    viewProject: "查看项目档案",
    selected: "已选档案",
    reconciliationLead: "完整列表：",
    reconciliation: "全部 41 个项目都有独立链接。完整列表收录互动项目、九款桌面应用和参考资料。",
    shelves: {
      "products-operations": {
        title: "做出人们能用的产品",
        description: "基于文档、日历、财务记录与市场证据提供决策支持的产品。",
      },
      "decision-intelligence": {
        title: "在证据不完整时作出决策",
        description: "强化学习、历史决策记录、因果分析，以及何时该由人审阅结果。",
      },
      "scientific-ml": {
        title: "判断机器学习何时值得信任",
        description: "科学模型如何工作、数据从哪里来，以及测试结果能说明什么。",
      },
      "molecular-computational": {
        title: "理解分子与物理系统",
        description: "包含光谱归属、热力学建模与计算化学核心的实例。",
      },
      "systems-reproducibility": {
        title: "让技术系统可以复现",
        description: "GPU 环境、基础设施和小型代码审计，也包括尚无法复现的结果。",
      },
      "learning-strategy": {
        title: "学习、解释并检验新创业想法",
        description: "用学习系统与推理工具区分可核对的证据和缺乏支撑的主张。",
      },
    },
    startPaths: {
      insurance: {
        eyebrow: "决策证据",
        title: "保险决策如何保留可见证据？",
        description: "保持三类证据相互独立，检查缺失情况，并对比当前方法与已停用的组合评分沙盒。",
      },
      mri: {
        eyebrow: "科学机器学习",
        title: "MRI 重建在什么情况下值得信任？",
        description: "联合检查重建、数据一致性、不确定性与下游评估；单一指标不足以构成证明。",
      },
      microrobot: {
        eyebrow: "视觉 / 机器人",
        title: "视觉如何估计微型机器人的姿态与深度？",
        description: "看看显微图像如何用于估计姿态和深度，以及这个研究原型还需要哪些测试。",
      },
      molecular: {
        eyebrow: "分子研究",
        title: "合成光谱能否识别正确构象？",
        description: "把预测构象与 2–8 GHz 光谱曲线比较，并检查残差与谱线归属依据。",
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
    sortCurated: "精选顺序",
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
    skipToInteractive: "跳至互动实验室 ↓",
    interactiveDemoAria: "互动项目视图：{title}",
    detailsAria: "{title} 项目详情",
    archiveMapAria: "互动项目档案地图",
    archiveMapTitle: "项目地图",
    archiveMapEyebrow: "项目档案速览",
    backToProject: "← 返回项目档案",
    safePort: "互动项目",
    privateBoundary: "非公开系统 · 仅展示可公开内容",
    privacyNote: "隐私说明",
    derivedArtifact: "衍生成果",
    technologiesAria: "技术与方法",
    buildLog: "构建记录",
    buildJourney: "从小开始 → 实用 → 完善",
    evidence: "可展示证据",
    safeToShow: "获准公开的内容",
    caseBrief: {
      eyebrow: "试用前先看",
      title: "这个项目做什么",
      purpose: "背景与目标",
      audience: "适用对象",
      problem: "问题",
      objective: "目标",
      contribution: "SAMUEL 的贡献",
      pipeline: "输入 → 方法 → 输出",
      progression: "工作推进过程",
      evidence: "证据说明了什么",
      walkthrough: "30 秒导览",
      walkthroughCopy: "改变一个输入，看看计算结果如何变化。方法与证据面板会说明哪些结果来自原始工作，哪些只是浏览器中的示例。",
      boundary: "公开范围",
      relatedSuite: "相关专题",
      relatedCopy: "打开同组的另一章节。每个项目都有自己的来源和局限。",
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
    sourceNoLicence: "查看源码快照 · 未声明许可证",
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
    description: "這裡有產品、實驗與研究專案。非公開專案會清楚標示。",
    summaryAria: "檔案概覽",
    files: "份檔案",
    interactive: "個專題體驗",
    suites: "個專題",
    redacted: "項已隱去",
    languageNotice: "介面與專案說明：繁體中文。原始圖表與檔案保留來源語言。",
  },
  views: {
    aria: "專案檔案檢視",
    guided: "精選",
    guidedHint: "RUN/HACK · 互動專案",
    files: "全部 {count} 個專案",
    filesHint: "搜尋並查看完整專案檔案",
    map: "知識圖譜",
    mapHint: "探索專案、方法與經歷",
  },
  guided: {
    heroEyebrow: "SAMUEL HD / 專案 / 精選",
    heroTitle: "先看看幾個專案",
    heroDescription: "試用示範、閱讀 RUN/HACK 現場記錄，或開啟完整專案清單。",
    statsAria: "引導式專案檔案概覽",
    experiencesStat: "引導式體驗",
    suitesStat: "專案分組",
    filesStat: "專案檔案",
    startEyebrow: "精選專案 · 建議從這裡開始",
    startTitle: "選一個問題",
    startDescription: "這四個問題分別對應一個可以在瀏覽器裡試用的專案。",
    latestEyebrow: "最新現場記錄 · 跑步駭客松",
    latestDate: "2026 年 8 月 29 日",
    latestTitle: "如果只有正在跑步的人才能建構產品，會發生什麼？",
    latestDescription: "在雨中完成 44 公里團隊接力，100 多名開發者參與，以語音建構一款社交跑步應用程式，最終獲得第二名。",
    latestAction: "閱讀 RUN/HACK 現場記錄",
    latestImageAlt: "Samuel 與另一位參與者在倫敦體育場社區跑道上一邊移動，一邊使用手機。",
    shelvesEyebrow: "瀏覽全部專案 / 六類問題",
    shelvesTitle: "依待解決的問題瀏覽",
    shelvesDescription: "開啟一個分類，查看其中的專案和相關資料。",
    drawer: "分類",
    experience: "個體驗",
    experiences: "個體驗",
    chapter: "章",
    chapters: "章",
    openDrawer: "開啟分類",
    closeDrawer: "關閉分類",
    showChapters: "顯示章節",
    hideChapters: "收起章節",
    recommended: "建議先看此章節",
    readBrief: "閱讀案例摘要",
    runDemo: "執行互動展示",
    referenceFile: "參考檔案",
    supportingFiles: "補充資料",
    supportingDescription: "原始成果和不便公開的專案故事仍可在參考檔案中查看。",
    viewProject: "查看專案檔案",
    selected: "已選檔案",
    reconciliationLead: "完整清單：",
    reconciliation: "全部 41 個專案都有獨立連結。完整清單收錄互動專案、九款桌面應用程式和參考資料。",
    shelves: {
      "products-operations": {
        title: "做出人們能用的產品",
        description: "根據文件、行事曆、財務記錄與市場證據提供決策支援的產品。",
      },
      "decision-intelligence": {
        title: "在證據不完整時作出決策",
        description: "強化學習、歷史決策記錄、因果分析，以及何時該由人審閱結果。",
      },
      "scientific-ml": {
        title: "判斷機器學習何時值得信任",
        description: "科學模型如何運作、資料從哪裡來，以及測試結果能說明什麼。",
      },
      "molecular-computational": {
        title: "理解分子與物理系統",
        description: "包含光譜指認、熱力學建模與計算化學核心的實例。",
      },
      "systems-reproducibility": {
        title: "讓技術系統可以重現",
        description: "GPU 環境、基礎設施與小型程式碼稽核，也包括尚無法重現的結果。",
      },
      "learning-strategy": {
        title: "學習、解釋並檢驗新創想法",
        description: "運用學習系統與推理工具，區分可核對的證據與缺乏支持的主張。",
      },
    },
    startPaths: {
      insurance: {
        eyebrow: "決策證據",
        title: "保險決策如何保留可見證據？",
        description: "保持三類證據相互獨立，檢查資料缺漏，並比較目前方法與已停用的綜合評分沙盒。",
      },
      mri: {
        eyebrow: "科學機器學習",
        title: "MRI 重建在什麼情況下值得信任？",
        description: "串聯重建、資料一致性、不確定性與下游評估，而不把單一指標視為證明。",
      },
      microrobot: {
        eyebrow: "視覺 / 機器人",
        title: "視覺如何估計微型機器人的姿態與深度？",
        description: "看看顯微影像如何用於估計姿態與深度，以及這個研究原型還需要哪些測試。",
      },
      molecular: {
        eyebrow: "分子研究",
        title: "合成光譜能否識別正確構形？",
        description: "比對預測構形與 2–8 GHz 光譜曲線，並檢查殘差與譜線指認依據。",
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
    sortCurated: "精選順序",
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
    skipToInteractive: "跳至互動實驗室 ↓",
    interactiveDemoAria: "互動專案檢視：{title}",
    detailsAria: "{title} 專案詳情",
    archiveMapAria: "互動專案檔案地圖",
    archiveMapTitle: "專案地圖",
    archiveMapEyebrow: "專案檔案速覽",
    backToProject: "← 返回專案檔案",
    safePort: "互動專案",
    privateBoundary: "非公開系統 · 僅展示可公開內容",
    privacyNote: "隱私說明",
    derivedArtifact: "衍生成果",
    technologiesAria: "技術與方法",
    buildLog: "建置紀錄",
    buildJourney: "從小開始 → 實用 → 完善",
    evidence: "可展示證據",
    safeToShow: "獲准公開的內容",
    caseBrief: {
      eyebrow: "試用前先看",
      title: "這個專案做什麼",
      purpose: "背景與目標",
      audience: "適用對象",
      problem: "問題",
      objective: "目標",
      contribution: "SAMUEL 的貢獻",
      pipeline: "輸入 → 方法 → 輸出",
      progression: "工作推進過程",
      evidence: "證據說明了什麼",
      walkthrough: "30 秒導覽",
      walkthroughCopy: "變更一個輸入，看看計算結果如何改變。方法與證據面板會說明哪些結果來自原始工作，哪些只是瀏覽器中的例子。",
      boundary: "公開範圍",
      relatedSuite: "相關專題",
      relatedCopy: "開啟同組的另一章節。每個專案都有自己的來源與限制。",
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
    emptyDescription: "此專案未附帶外部材料。",
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
    sourceNoLicence: "查看原始碼快照 · 未聲明授權條款",
    viewRepository: "查看程式碼儲存庫",
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
    "PUBLIC REPO": "公開儲存庫",
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
