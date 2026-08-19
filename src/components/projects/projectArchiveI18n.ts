import type {
  Project,
  ProjectAccess,
  ProjectArea,
  ProjectArtifact,
  ProjectPhase,
} from "@/data/projects";
import type { Locale } from "@/lib/i18n";

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
    redacted: string;
    languageNotice: string;
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
  };
  markers: {
    demo: string;
    live: string;
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
    interactive: "interactive",
    redacted: "redacted",
    languageNotice: "Project titles and source-grounded descriptions remain in British English; archive controls follow your selected language.",
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
  },
  markers: { demo: "DEMO", live: "LIVE" },
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
    interactive: "个可互动",
    redacted: "项已隐去",
    languageNotice: "项目标题与经来源核实的说明保留英式英语；档案界面使用您选择的语言。",
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
  },
  markers: { demo: "演示", live: "在线" },
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
    interactive: "個可互動",
    redacted: "項已隱去",
    languageNotice: "專案標題與經來源核實的說明保留英式英語；檔案介面使用您選擇的語言。",
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
  },
  markers: { demo: "展示", live: "線上" },
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
