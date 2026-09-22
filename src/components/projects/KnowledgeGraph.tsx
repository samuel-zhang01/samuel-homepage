"use client";

import dynamic from "next/dynamic";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { projects, isInteractiveProject } from "@/data/projects";
import { projectOrigins } from "@/data/projectOrigins";
import { buildKnowledgeGraph, KnowledgeGraphIndex, graphNodeHref, knowledgeTopics, type KnowledgeNode } from "@/data/knowledgeGraph";
import { clamp, initialGraphCamera, layoutKnowledgeGraph, layoutKnowledgeFocus, fitKnowledgeCamera, dragKnowledgeCamera, interpolateKnowledgeScene, pickKnowledgeNode, projectKnowledgePoint, visibleKnowledgeNodes, type KnowledgeScene, type GraphCamera, type ProjectedNode } from "@/lib/knowledgeGraphMath";
import { type Locale } from "@/lib/i18n";
import { getProjectText } from "@/lib/projectNarrative";
import styles from "./KnowledgeGraph.module.css";
import { ProjectWindowContext } from "./ProjectWindowContext";

const CatalogueAnalysis = dynamic(() => import("./PortfolioMap"), { loading: () => <p style={{ padding: 18 }}>…</p> });

const graph = buildKnowledgeGraph(projects, projectOrigins);
const positions = layoutKnowledgeGraph(graph);
const graphIndex = new KnowledgeGraphIndex(graph);
const nodeById = graphIndex.nodes;
const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
const canvasColours: Record<string, string> = {
  "reinforcement-learning": "#6f8c9b", "scientific-ml": "#91849f", chemistry: "#aa916d", decisions: "#7c998c",
  products: "#ab8994", infrastructure: "#929baa", "data-science": "#a39e70", "human-systems": "#ad907c",
};
const canvasColour = (node: KnowledgeNode) => node.kind === "experience" ? "#ffffff" : canvasColours[node.topic] ?? "#aaaaaa";
const kindLabels = { topic: "Subject", method: "Method", project: "Project", experience: "Work & education" };
const searchAliases: Record<string, string> = { "topic:reinforcement-learning": "RL agent reinforcement 强化学习 強化學習", "method:fourier-operators": "FNO Fourier neural operator spectral 傅里叶 神经算子 傅立葉 神經算子", "method:graph-networks": "GNN graph neural network 图神经网络 圖神經網路", "method:language-models": "LLM SFT DPO LoRA post-training 大语言模型 大語言模型", "method:inverse-problems": "MRI image reconstruction 磁共振 图像重建 磁振 影像重建", "experience:imperial": "IX I-X Imperial College London MSc 帝国理工 帝國理工", "experience:pfizer": "Pfizer 辉瑞 輝瑞" };
const graphTranslations: Record<string, string> = {
  "Open project": "打开项目",
  "Compare projects": "比较项目", "Explore dates, tools and model families": "探索日期、工具与模型系列", "3D view": "三维视图", "2D view": "二维视图", "Projection": "投影视图", "Drag to rotate. Shift-drag to pan. Use + / − to zoom. All connections are also available in the list.": "拖动旋转，按住 Shift 拖动平移。使用 + / − 缩放，也可以通过列表探索全部关联。", "Open GROWMAT showcase PDF": "打开 GROWMAT 展示 PDF", "Project graph": "项目关系图", "PROJECTS · IDEAS · EXPERIENCE": "项目 · 知识 · 经历", "Follow the connections.": "沿着关联探索。",
  "Choose a subject or a point in the timeline. Follow its connections to a project, then open the full story or demo.": "选择一个主题或时间线上的经历，沿着关联找到项目，再打开完整介绍或演示。",
  "Find a subject, project or experience": "查找主题、项目或经历", "Try Fourier, chemistry, Pfizer…": "试试傅里叶、化学、辉瑞…", "Search results": "搜索结果", "matches": "个结果",
  "All work": "全部项目", "Subject": "主题", "Method": "方法", "Project": "项目", "Education": "教育", "Work & education": "工作与教育", "Reinforcement learning": "强化学习", "Scientific ML": "科学机器学习", "Chemistry": "化学", "Decision systems": "决策系统", "Products & tools": "产品与工具", "Computing & systems": "计算与系统", "Data & evaluation": "数据与评估", "People & organisations": "人与组织",
  "Explore a subject": "探索主题", "Exploration path": "探索路径", "Map controls": "关系图控制", "Zoom out": "缩小", "Zoom in": "放大", "Fit view": "适应视图", "Show all work": "显示全部项目", "Focus connections": "聚焦关联", "visible nodes": "个可见节点",
  "Drag to pan. Use + / − to zoom. All connections are also available in the list.": "拖动平移，使用 + / − 缩放。也可以通过列表探索全部关联。",
  "Topics": "主题", "Projects": "项目", "Methods": "方法", "Selected node": "已选节点", "Open interactive demo": "打开互动演示", "Read project": "阅读项目", "About this project": "项目详情", "Open education record": "打开教育记录", "Open experience record": "打开经历记录",
  "Projects to explore": "探索相关项目", "Related subjects": "相关主题", "Methods in this work": "项目中的方法", "Why these connections?": "这些关联的依据是什么？", "Copy a link to this node": "复制此节点链接", "Link copied": "链接已复制",
  "Browse connections": "浏览关联", "Browse subjects": "浏览主题", "Show more connections": "显示更多关联", "Browse all connections": "浏览全部关联", "Try a broader subject such as chemistry, learning or computing.": "试试更广泛的主题，例如化学、学习或计算。",
  "A few starting points": "从这里开始", "Explore scientific ML": "探索科学机器学习", "Fourier operators, imaging and microrobots": "傅里叶算子、成像与微型机器人", "Follow the Imperial work": "探索帝国理工项目", "Coursework, research and experiments": "课程、研究与实验", "Start from experience": "从工作经历出发", "Pfizer → GROWMAT → workload planning": "辉瑞 → GROWMAT → 工作负荷规划",
  "Select any node to see its story and connected work.": "选择任一节点，查看其介绍及相关项目。", "subjects": "个主题", "projects": "个项目", "contexts": "段工作与教育经历",
  "Projects along the timeline": "时间线上的项目", "Expand the timeline": "展开时间线", "Open CV record": "打开履历记录", "View in graph": "在关系图中查看", "Topic links describe shared ideas. Timeline links explain where the work belongs.": "主题关联展现共同的知识；时间线关联说明项目所属的经历。", "Export graph data": "导出关系图数据",
  "Explores this subject": "探索此主题", "Uses this method": "使用此方法", "Part of this subject": "属于此主题", "Developed in this context": "在此经历中开展", "Related research context": "相关研究背景", "Project in this subject": "此主题下的项目", "Project using this method": "使用此方法的项目", "Method in this subject": "此主题中的方法", "Project from this experience": "此经历中的项目",
};


// Curated separately: character conversion cannot resolve terms such as
// 關係圖 / 傅立葉 or provide natural Traditional Chinese interface wording.
const traditionalGraphTranslations: Record<string, string> = {
  "Open project": "開啟專案",
  "Compare projects": "比較專案", "Explore dates, tools and model families": "探索日期、工具與模型系列", "3D view": "三維檢視", "2D view": "二維檢視", "Projection": "投影檢視", "Drag to rotate. Shift-drag to pan. Use + / − to zoom. All connections are also available in the list.": "拖曳旋轉，按住 Shift 拖曳平移。使用 + / − 縮放，也可以透過清單探索全部關聯。", "Open GROWMAT showcase PDF": "開啟 GROWMAT 展示 PDF", "Project graph": "專案關係圖", "PROJECTS · IDEAS · EXPERIENCE": "專案 · 知識 · 經歷", "Follow the connections.": "沿著關聯探索。",
  "Choose a subject or a point in the timeline. Follow its connections to a project, then open the full story or demo.": "選擇一個主題或時間軸上的經歷，沿著關聯找到專案，再開啟完整介紹或示範。",
  "Find a subject, project or experience": "尋找主題、專案或經歷", "Try Fourier, chemistry, Pfizer…": "試試傅立葉、化學、輝瑞…", "Search results": "搜尋結果", "matches": "個結果",
  "All work": "全部專案", "Subject": "主題", "Method": "方法", "Project": "專案", "Education": "教育", "Work & education": "工作與教育", "Reinforcement learning": "強化學習", "Scientific ML": "科學機器學習", "Chemistry": "化學", "Decision systems": "決策系統", "Products & tools": "產品與工具", "Computing & systems": "計算與系統", "Data & evaluation": "資料與評估", "People & organisations": "人與組織",
  "Explore a subject": "探索主題", "Exploration path": "探索路徑", "Map controls": "關係圖控制", "Zoom out": "縮小", "Zoom in": "放大", "Fit view": "符合檢視範圍", "Show all work": "顯示全部專案", "Focus connections": "聚焦關聯", "visible nodes": "個可見節點",
  "Drag to pan. Use + / − to zoom. All connections are also available in the list.": "拖曳平移，使用 + / − 縮放。也可以透過清單探索全部關聯。",
  "Topics": "主題", "Projects": "專案", "Methods": "方法", "Selected node": "已選節點", "Open interactive demo": "開啟互動示範", "Read project": "閱讀專案", "About this project": "專案詳情", "Open education record": "開啟教育記錄", "Open experience record": "開啟經歷記錄",
  "Projects to explore": "探索相關專案", "Related subjects": "相關主題", "Methods in this work": "專案中的方法", "Why these connections?": "這些關聯的依據是什麼？", "Copy a link to this node": "複製此節點連結", "Link copied": "連結已複製",
  "Browse connections": "瀏覽關聯", "Browse subjects": "瀏覽主題", "Show more connections": "顯示更多關聯", "Browse all connections": "瀏覽全部關聯", "Try a broader subject such as chemistry, learning or computing.": "試試更廣泛的主題，例如化學、學習或計算。",
  "A few starting points": "從這裡開始", "Explore scientific ML": "探索科學機器學習", "Fourier operators, imaging and microrobots": "傅立葉算子、成像與微型機器人", "Follow the Imperial work": "探索帝國理工專案", "Coursework, research and experiments": "課程、研究與實驗", "Start from experience": "從工作經歷出發", "Pfizer → GROWMAT → workload planning": "輝瑞 → GROWMAT → 工作負荷規劃",
  "Select any node to see its story and connected work.": "選擇任一節點，查看其介紹及相關專案。", "subjects": "個主題", "projects": "個專案", "contexts": "段工作與教育經歷",
  "Projects along the timeline": "時間軸上的專案", "Expand the timeline": "展開時間軸", "Open CV record": "開啟履歷記錄", "View in graph": "在關係圖中查看", "Topic links describe shared ideas. Timeline links explain where the work belongs.": "主題關聯呈現共同的知識；時間軸關聯說明專案所屬的經歷。", "Export graph data": "匯出關係圖資料",
  "Explores this subject": "探索此主題", "Uses this method": "使用此方法", "Part of this subject": "屬於此主題", "Developed in this context": "在此經歷中開展", "Related research context": "相關研究背景", "Project in this subject": "此主題下的專案", "Project using this method": "使用此方法的專案", "Method in this subject": "此主題中的方法", "Project from this experience": "此經歷中的專案",
};

// Graph concepts are independent of catalogue prose and have their own reviewed copy.
const graphMetadataTranslations: Record<string, readonly [string, string]> = {
  "Independent": ["独立实践", "獨立實踐"],
  "How agents learn through action, feedback and repeated decisions. Follow value functions, exploration, policy evaluation and language-model post-training.": [
    "智能体如何通过行动、反馈和反复决策学习。探索价值函数、探索策略、策略评估与语言模型后训练。",
    "智慧代理如何透過行動、回饋和反覆決策學習。探索價值函數、探索策略、策略評估與語言模型後訓練。"
  ],
  "Scientific machine learning": [
    "科学机器学习",
    "科學機器學習"
  ],
  "Learning the behaviour of physical systems: fluid fields, medical images and microrobots. Explore model structure alongside the experiments used to assess it.": [
    "学习物理系统的行为，包括流场、医学影像和微型机器人。结合评估实验，探索模型结构。",
    "學習物理系統的行為，包括流場、醫學影像和微型機器人。結合評估實驗，探索模型結構。"
  ],
  "Chemistry & molecular science": [
    "化学与分子科学",
    "化學與分子科學"
  ],
  "From molecular spectra and phase equilibria to quantum orbitals. Follow the measurements, calculations and tools behind a chemical interpretation.": [
    "从分子光谱、相平衡到量子轨道，探索化学解释背后的测量、计算与工具。",
    "從分子光譜、相平衡到量子軌域，探索化學解釋背後的測量、計算與工具。"
  ],
  "Models that support a consequential choice: allocating insurance leads, deferring uncertain cases, estimating effects and reviewing operational evidence.": [
    "支持重要决策的模型：分配保险业务线索、转交不确定案件、估计因果效应，以及审阅运营证据。",
    "支援重要決策的模型：分配保險業務線索、轉交不確定案件、估計因果效應，以及審閱營運證據。"
  ],
  "Software people use to organise work, learn, plan and create. Trace a working interaction back to its data, rules and product context.": [
    "帮助人们组织工作、学习、规划和创作的软件。从实际交互追溯其数据、规则与产品背景。",
    "幫助人們組織工作、學習、規劃和創作的軟體。從實際互動追溯其資料、規則與產品背景。"
  ],
  "Computing & infrastructure": [
    "计算与基础设施",
    "計算與基礎設施"
  ],
  "The environments and services that make experiments and products usable: accelerators, containers, local storage and recovery procedures.": [
    "让实验和产品能够运行的环境与服务：加速器、容器、本地存储和恢复流程。",
    "讓實驗和產品能夠執行的環境與服務：加速器、容器、本機儲存和復原流程。"
  ],
  "Data & model evaluation": [
    "数据与模型评估",
    "資料與模型評估"
  ],
  "How datasets become evidence. Inspect split design, leakage, regularisation, calibration, error measures and the assumptions behind a reported result.": [
    "数据集如何成为证据。检查数据划分、泄漏、正则化、校准、误差指标，以及研究结果背后的假设。",
    "資料集如何成為證據。檢查資料劃分、洩漏、正則化、校準、誤差指標，以及研究結果背後的假設。"
  ],
  "People, organisations & AI": [
    "人与组织及人工智能",
    "人與組織及人工智慧"
  ],
  "The organisational side of technical work: research ethics, innovation, capacity planning, product ownership and human review.": [
    "技术工作的组织层面：研究伦理、创新、产能规划、产品责任与人工审阅。",
    "技術工作的組織層面：研究倫理、創新、產能規劃、產品責任與人工審閱。"
  ],
  "Values & policies": [
    "价值与策略",
    "價值與策略"
  ],
  "Estimate future return, choose actions and inspect the update rule that changes an agent’s behaviour.": [
    "估计未来回报，选择行动，并检查改变智能体行为的更新规则。",
    "估計未來回報，選擇行動，並檢查改變智慧代理行為的更新規則。"
  ],
  "Exploration & bandits": [
    "探索与多臂老虎机",
    "探索與多臂老虎機"
  ],
  "Allocate repeated decisions between gathering information and using the evidence already available.": [
    "在反复决策中，分配收集新信息与利用已有证据的机会。",
    "在反覆決策中，分配收集新資訊與利用已有證據的機會。"
  ],
  "Language-model training": [
    "语言模型训练",
    "語言模型訓練"
  ],
  "Inspect supervised adaptation, low-rank updates, preference objectives and the answers generated by a trained model.": [
    "查看监督适配、低秩更新、偏好目标，以及训练后模型生成的回答。",
    "查看監督適配、低秩更新、偏好目標，以及訓練後模型產生的回答。"
  ],
  "Language-model applications": [
    "语言模型应用",
    "語言模型應用"
  ],
  "Use language models to interpret text, gather evidence and support a person’s decision.": [
    "使用语言模型解释文本、收集证据，并支持人的决策。",
    "使用語言模型解釋文字、收集證據，並支援人的決策。"
  ],
  "Text processing & matching": [
    "文本处理与匹配",
    "文字處理與匹配"
  ],
  "Extract terms, compare documents and connect relevant language with explicit rules.": [
    "提取词语、比较文档，并通过明确规则关联相关语言内容。",
    "擷取詞語、比較文件，並透過明確規則關聯相關語言內容。"
  ],
  "Fourier operators": [
    "傅里叶算子",
    "傅立葉算子"
  ],
  "Transform a field into frequency components, learn spectral interactions and reconstruct a prediction in physical space.": [
    "将物理场变换为频率分量，学习频谱交互，再重建物理空间中的预测。",
    "將物理場轉換為頻率分量，學習頻譜互動，再重建物理空間中的預測。"
  ],
  "Graph message passing": [
    "图消息传递",
    "圖訊息傳遞"
  ],
  "Compute local messages between connected nodes and aggregate them to update a field on a mesh.": [
    "计算相连节点之间的局部消息，并汇总这些消息以更新网格上的物理场。",
    "計算相連節點之間的局部訊息，並彙整這些訊息以更新網格上的物理場。"
  ],
  "Imaging & inverse problems": [
    "成像与逆问题",
    "成像與逆問題"
  ],
  "Recover an image or latent physical property from indirect, incomplete or noisy measurements.": [
    "从间接、不完整或含噪测量中，恢复图像或潜在物理性质。",
    "從間接、不完整或含雜訊測量中，還原影像或潛在物理性質。"
  ],
  "Robotics & perception": [
    "机器人与感知",
    "機器人與感知"
  ],
  "Connect sensed observations, geometric state and a physical system’s motion.": [
    "连接传感观测、几何状态与物理系统的运动。",
    "連結感測觀測、幾何狀態與物理系統的運動。"
  ],
  "Uncertainty & calibration": [
    "不确定性与校准",
    "不確定性與校準"
  ],
  "Compare confidence with observed outcomes and study how uncertainty changes a decision.": [
    "比较置信度与实际观测结果，并研究不确定性如何改变决策。",
    "比較信心度與實際觀測結果，並研究不確定性如何改變決策。"
  ],
  "Splits, metrics & leakage": [
    "数据划分、指标与泄漏",
    "資料劃分、指標與洩漏"
  ],
  "Track which observations trained a model, which evaluated it and what each metric actually measures.": [
    "追踪哪些观测用于训练、哪些用于评估，以及每项指标实际衡量什么。",
    "追蹤哪些觀測用於訓練、哪些用於評估，以及每項指標實際衡量什麼。"
  ],
  "Regularisation & optimisation": [
    "正则化与优化",
    "正則化與最佳化"
  ],
  "Control a model’s fit through penalties, optimisation choices and the trade-off between training error and generalisation.": [
    "通过惩罚项、优化方法，以及训练误差与泛化之间的权衡，控制模型拟合。",
    "透過懲罰項、最佳化方法，以及訓練誤差與泛化之間的取捨，控制模型擬合。"
  ],
  "Causal & counterfactual reasoning": [
    "因果与反事实推理",
    "因果與反事實推理"
  ],
  "Separate associations from effects and evaluate alternative decisions using explicitly stated assumptions.": [
    "区分关联与因果效应，并在明确假设下评估其他决策。",
    "區分關聯與因果效應，並在明確假設下評估其他決策。"
  ],
  "Human review & deferral": [
    "人工审阅与转交",
    "人工審閱與轉交"
  ],
  "Route evidence to a person, retain the basis of a recommendation and decide when a model should defer.": [
    "将证据交给人审阅，保留建议依据，并决定模型何时应当转交。",
    "將證據交給人審閱，保留建議依據，並決定模型何時應當轉交。"
  ],
  "Connect measured frequencies and intensities to molecular structure through prediction, matching and visual analysis.": [
    "通过预测、匹配和可视化分析，将测量频率及强度与分子结构联系起来。",
    "透過預測、匹配和視覺化分析，將測量頻率及強度與分子結構聯繫起來。"
  ],
  "Thermodynamics": [
    "热力学",
    "熱力學"
  ],
  "Calculate bulk properties and phase equilibria from molecular models and measured material properties.": [
    "根据分子模型和实测材料性质，计算宏观性质与相平衡。",
    "根據分子模型和實測材料性質，計算巨觀性質與相平衡。"
  ],
  "Quantum & molecular simulation": [
    "量子与分子模拟",
    "量子與分子模擬"
  ],
  "Explore wavefunctions, molecular motion and numerical experiments that connect microscopic structure to observable behaviour.": [
    "探索波函数、分子运动与数值实验，将微观结构联系到可观测行为。",
    "探索波函數、分子運動與數值實驗，將微觀結構聯繫到可觀測行為。"
  ],
  "Local data & persistence": [
    "本地数据与持久化",
    "本機資料與持續儲存"
  ],
  "Keep a useful record across interactions, reconcile overlapping inputs and make the resulting state inspectable.": [
    "在交互之间保留有用记录，协调重叠输入，并让最终状态可以检查。",
    "在互動之間保留有用記錄，協調重疊輸入，並讓最終狀態可以檢查。"
  ],
  "Scheduling & allocation": [
    "排程与分配",
    "排程與分配"
  ],
  "Allocate people, time or capacity under explicit constraints, then examine conflicts and overrides.": [
    "在明确约束下分配人员、时间或产能，再检查冲突与人工调整。",
    "在明確約束下分配人員、時間或產能，再檢查衝突與人工調整。"
  ],
  "Learning tools": [
    "学习工具",
    "學習工具"
  ],
  "Turn a curriculum or technical idea into something a learner can practise, inspect and revisit.": [
    "将课程或技术概念转化为学习者可以练习、检查和复习的内容。",
    "將課程或技術概念轉化為學習者可以練習、檢查和複習的內容。"
  ],
  "Infrastructure & recovery": [
    "基础设施与恢复",
    "基礎設施與復原"
  ],
  "Trace service dependencies, accelerator environments, backups and recovery steps through concrete failure cases.": [
    "通过具体故障案例，追踪服务依赖、加速器环境、备份和恢复步骤。",
    "透過具體故障案例，追蹤服務相依性、加速器環境、備份和復原步驟。"
  ],
  "Innovation & venture design": [
    "创新与创业设计",
    "創新與創業設計"
  ],
  "Connect a proposed product to its evidence, organisational setting, adoption path and resource needs.": [
    "将拟议产品与其证据、组织背景、采用路径和资源需求联系起来。",
    "將擬議產品與其證據、組織背景、採用路徑和資源需求聯繫起來。"
  ],
  "Ethics & governance": [
    "伦理与治理",
    "倫理與治理"
  ],
  "Examine affected people, responsibilities, uncertainty and oversight when a technical system is introduced.": [
    "在引入技术系统时，审视受影响的人、责任、不确定性与监督。",
    "在引入技術系統時，審視受影響的人、責任、不確定性與監督。"
  ]
};

function translateGraph(locale: Locale, source: string) {
  if (locale === "zh-CN" && graphMetadataTranslations[source]) return graphMetadataTranslations[source][0];
  if (locale === "zh-TW" && graphMetadataTranslations[source]) return graphMetadataTranslations[source][1];
  const translated = graphTranslations[source];
  if (locale === "zh-CN" && translated) return translated;
  if (locale === "zh-TW" && traditionalGraphTranslations[source]) return traditionalGraphTranslations[source];
  return getProjectText(locale, source);
}

function graphConnectionText(locale: Locale, edge: (typeof graph.edges)[number]) {
  if (locale !== "zh-CN" && locale !== "zh-TW") return edge.explanation;
  if (edge.relation === "developed-in" || edge.relation === "related-context") return translateGraph(locale, edge.explanation);
  const source = nodeById.get(edge.source)!;
  const target = nodeById.get(edge.target)!;
  const from = translateGraph(locale, source.label);
  const to = translateGraph(locale, target.label);
  if (edge.relation === "part-of") return locale === "zh-CN" ? `${from}是探索${to}的一条路径。` : `${from}是探索${to}的一條路徑。`;
  if (edge.relation === "uses") return `${from}包含${to}。${translateGraph(locale, target.description)}`;
  const through = edge.explanation.match(/ through (.+)\.$/)?.[1];
  const method = through && graph.nodes.find((node) => node.kind === "method" && node.label.toLowerCase() === through);
  if (method) return locale === "zh-CN"
    ? `${from}通过${translateGraph(locale, method.label)}关联到${to}。`
    : `${from}透過${translateGraph(locale, method.label)}關聯到${to}。`;
  return `${from}探索${to}。`;
}

function relationLabel(selected: KnowledgeNode, node: KnowledgeNode, relation: string) {
  if (relation === "related-context") return "Related research context";
  if (node.kind === "project") return selected.kind === "experience" ? "Project from this experience" : selected.kind === "method" ? "Project using this method" : "Project in this subject";
  if (node.kind === "experience") return "Developed in this context";
  if (node.kind === "method") return selected.kind === "topic" ? "Method in this subject" : "Uses this method";
  return selected.kind === "method" ? "Part of this subject" : "Explores this subject";
}

type Props = {
  active: boolean; locale: Locale; initialNode?: string;
  onSelectionChange: (id: string | null) => void;
  onOpenProject: (slug: string, demo: boolean, nodeId: string | null) => void;
};

export function KnowledgeGraph({ active, locale, initialNode, onSelectionChange, onOpenProject }: Props) {
  const openActivity = useContext(ProjectWindowContext);
  const t = useCallback((source: string) => translateGraph(locale, source), [locale]);
  const validInitial = initialNode && nodeById.has(initialNode) ? initialNode : null;
  const [selectedId, setSelectedId] = useState<string | null>(validInitial);
  const [trail, setTrail] = useState<string[]>(validInitial ? [validInitial] : []);
  const [query, setQuery] = useState("");
  const [local, setLocal] = useState(!!validInitial);
  const [flat, setFlat] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 800, height: 490 });
  const [canvasReady, setCanvasReady] = useState(true);
  const [copied, setCopied] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [resultLimit, setResultLimit] = useState(12);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<HTMLDetailsElement>(null);
  const timelineRef = useRef<HTMLDetailsElement>(null);
  const selectionCallback = useRef(onSelectionChange);
  selectionCallback.current = onSelectionChange;
  const drag = useRef<{ x: number; y: number; camera: GraphCamera; moved: boolean; pan: boolean } | null>(null);
  const projectedRef = useRef<ProjectedNode[]>([]);
  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const selectedProject = selected?.slug ? projectBySlug.get(selected.slug) : undefined;
  const showcasePdf = selectedProject?.slug === "growmat" && !isInteractiveProject(selectedProject) ? selectedProject.artifacts?.find((artifact) => artifact.kind === "PDF") : undefined;
  const neighbours = useMemo(() => selectedId ? graphIndex.neighbours(selectedId) : [], [selectedId]);
  const neighbourIds = useMemo(() => new Set(neighbours.map((entry) => entry.node.id)), [neighbours]);
  const shown = useMemo(() => visibleKnowledgeNodes(graph, selectedId, !!selectedId, local), [selectedId, local]);
  // Keep coordinates for hidden nodes too, so they can fade through the same
  // spatial camera move instead of appearing at a new location halfway in.
  const currentPositions = useMemo(() => {
    if (!local || !selectedId) return positions;
    const focused = layoutKnowledgeFocus(graph, selectedId, shown, flat);
    const origin = positions.get(selectedId)!;
    return new Map([...positions].map(([id, point]) => [id, focused.get(id) ?? (flat ? point : { x: point.x - origin.x, y: point.y - origin.y, z: point.z - origin.z })]));
  }, [flat, local, selectedId, shown]);
  const opacity = useMemo(() => new Map(graph.nodes.map((node) => [node.id, shown.has(node.id) ? 1 : 0])), [shown]);
  const [scene, setScene] = useState<KnowledgeScene>(() => ({ camera: initialGraphCamera, positions: currentPositions, opacity }));
  const sceneRef = useRef(scene);
  const frameRef = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const framed = useRef(false);
  const { camera } = scene;

  const stopMotion = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);
  const displayScene = useCallback((next: KnowledgeScene) => {
    sceneRef.current = next;
    setScene(next);
  }, []);
  const moveTo = useCallback((target: KnowledgeScene, animate = true) => {
    stopMotion();
    if (!animate || reducedMotion.current) { displayScene(target); return; }
    const start = sceneRef.current;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 720);
      displayScene(interpolateKnowledgeScene(start, target, progress));
      frameRef.current = progress < 1 ? requestAnimationFrame(step) : null;
    };
    frameRef.current = requestAnimationFrame(step);
  }, [displayScene, stopMotion]);
  const setCamera = useCallback((next: GraphCamera | ((current: GraphCamera) => GraphCamera)) => {
    stopMotion();
    const current = sceneRef.current;
    displayScene({ ...current, opacity, camera: typeof next === "function" ? next(current.camera) : next });
  }, [displayScene, opacity, stopMotion]);
  const localeSlug = locale.toLowerCase();
  const timeline = useMemo(() => graph.nodes.filter((node) => node.kind === "experience").sort((a, b) => Number(b.period?.match(/\d{4}/)?.[0] ?? 9999) - Number(a.period?.match(/\d{4}/)?.[0] ?? 9999)), []);
  const searchResults = useMemo(() => {
    const needle = query.normalize("NFKD").toLowerCase().trim();
    if (!needle) return [];
    return graph.nodes.filter((node) => `${node.label} ${t(node.label)} ${t(node.shortLabel)} ${node.description} ${node.period ?? ""} ${node.slug ?? ""} ${searchAliases[node.id] ?? ""} ${node.slug ? projectBySlug.get(node.slug)?.tools.join(" ") ?? "" : ""}`.normalize("NFKD").toLowerCase().includes(needle))
      .sort((a, b) => Number(b.label.toLowerCase().includes(needle)) - Number(a.label.toLowerCase().includes(needle)));
  }, [query, t]);

  const fit = useCallback(() => {
    moveTo({ positions: currentPositions, opacity, camera: fitKnowledgeCamera([...shown].map((id) => currentPositions.get(id)!), size.width, size.height, flat, sceneRef.current.camera) });
  }, [currentPositions, flat, moveTo, opacity, shown, size]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = preference.matches; if (preference.matches) fit(); };
    reducedMotion.current = preference.matches;
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [fit]);

  // Run only for navigation/resize, never as a continuous background loop.
  // A fresh selection rebases from the scene currently visible on screen.
  useEffect(() => {
    if (!active) { stopMotion(); return; }
    moveTo({ positions: currentPositions, opacity, camera: fitKnowledgeCamera([...shown].map((id) => currentPositions.get(id)!), size.width, size.height, flat, sceneRef.current.camera) }, framed.current);
    framed.current = true;
    return stopMotion;
  }, [active, currentPositions, flat, moveTo, opacity, shown, size, stopMotion]);

  function writeSelection(id: string | null) {
    if (!active || !/\/projects\/?$/i.test(window.location.pathname)) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", "map"); url.searchParams.delete("project"); url.searchParams.delete("from");
    if (id) url.searchParams.set("node", id); else url.searchParams.delete("node");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
  }

  function select(id: string, append = true) {
    if (!nodeById.has(id)) return;
    setSelectedId(id); onSelectionChange(id); setQuery(""); setResultLimit(12); setLocal(true);
    if (append) setTrail((current) => [...current.filter((item) => item !== id), id].slice(-6));
    writeSelection(id); setCopied(false);
  }

  function reset() {
    setSelectedId(null); onSelectionChange(null); setTrail([]); setLocal(false); setQuery(""); setResultLimit(12); writeSelection(null); setCopied(false);
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (window.getComputedStyle(stage).position !== "relative") return;
      const width = clamp(entry.contentRect.width, 1, 4096), height = clamp(entry.contentRect.height, 1, 1600);
      if (width < 100 || height < 100) return;
      setSize((current) => current.width === width && current.height === height ? current : { width, height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const sync = () => {
      const url = new URL(window.location.href);
      if (!/\/projects\/?$/.test(url.pathname)) return;
      if (url.searchParams.get("view") !== "map" && url.searchParams.has("project")) return;
      const id = url.searchParams.get("node");
      const valid = id && nodeById.has(id) ? id : null;
      setSelectedId(valid); setLocal(!!valid); selectionCallback.current(valid);
      if (valid) setTrail((current) => current.at(-1) === valid ? current : [...current.filter((entry) => entry !== valid), valid].slice(-6));
      else setTrail([]);
    };
    sync(); window.addEventListener("popstate", sync); window.addEventListener("samuel-project-graph", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("samuel-project-graph", sync); };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) { setCanvasReady(false); return; }
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(size.width * ratio), height = Math.round(size.height * ratio);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size.width, size.height);
    const points: ProjectedNode[] = graph.nodes.filter((node) => (scene.opacity.get(node.id) ?? 0) > .01).map((node) => {
      const point = projectKnowledgePoint(scene.positions.get(node.id)!, camera, size.width, size.height, flat);
      const depthScale = flat ? 1 : clamp(1000 / Math.max(350, 1000 + point.z), .7, 1.45);
      return { ...point, node, radius: (node.kind === "topic" ? 13 : node.kind === "experience" ? 8 : node.kind === "method" ? 5 : 5.5) * depthScale * Math.sqrt(camera.zoom) };
    }).sort((a, b) => b.z - a.z);
    projectedRef.current = points.filter((point) => (scene.opacity.get(point.node.id) ?? 0) > .5 && shown.has(point.node.id));
    const projectedById = new Map(points.map((point) => [point.node.id, point]));
    for (const edge of graph.edges) {
      const from = projectedById.get(edge.source), to = projectedById.get(edge.target);
      if (!from || !to) continue;
      const focused = edge.source === selectedId || edge.target === selectedId;
      context.strokeStyle = focused ? "#222222cc" : selectedId ? "#88888855" : "#555555aa";
      context.globalAlpha = Math.min(scene.opacity.get(from.node.id) ?? 0, scene.opacity.get(to.node.id) ?? 0) * (flat ? 1 : clamp(1 - (from.z + to.z) / 1400, .4, 1));
      context.lineWidth = focused ? 1.4 : 1;
      context.setLineDash(edge.relation === "developed-in" || edge.relation === "related-context" ? [3, 4] : []);
      context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
    }
    context.setLineDash([]);
    for (const point of points) {
      const chosen = point.node.id === selectedId;
      const colour = canvasColour(point.node);
      const relevant = !selectedId || chosen || neighbourIds.has(point.node.id);
      context.globalAlpha = (scene.opacity.get(point.node.id) ?? 0) * (relevant ? 1 : .25) * (flat ? 1 : clamp(1 - point.z / 750, .45, 1));
      context.fillStyle = colour;
      if (chosen || point.node.id === hoverId) {
        context.strokeStyle = "#000000"; context.lineWidth = 1.5;
        context.beginPath(); context.arc(point.x, point.y, point.radius + 6, 0, Math.PI * 2); context.stroke();
      }
      context.beginPath();
      if (point.node.kind === "experience") {
        context.moveTo(point.x, point.y - point.radius); context.lineTo(point.x + point.radius, point.y); context.lineTo(point.x, point.y + point.radius); context.lineTo(point.x - point.radius, point.y); context.closePath();
      } else context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = chosen ? "#000000" : "#555555";
      context.lineWidth = chosen ? 1.2 : .6;
      context.stroke();
    }
    context.globalAlpha = 1;
    const canvasFont = window.getComputedStyle(canvas).fontFamily;
    const labelBoxes: { x: number; y: number; w: number; h: number }[] = [];
    const labelled = [...points].sort((a, b) => Number(b.node.id === selectedId || b.node.id === hoverId) - Number(a.node.id === selectedId || a.node.id === hoverId) || Number(b.node.kind === "topic") - Number(a.node.kind === "topic"));
    for (const point of labelled) {
      const visibility = scene.opacity.get(point.node.id) ?? 0;
      if (visibility < .2) continue;
      context.globalAlpha = visibility;
      const priority = point.node.id === selectedId || point.node.id === hoverId;
      if (!priority && point.node.kind !== "topic" && !(local && neighbourIds.has(point.node.id))) continue;
      const full = t(point.node.shortLabel);
      const label = full.length > 31 && !priority ? `${full.slice(0, 29)}…` : full;
      context.font = `${priority || point.node.kind === "topic" ? "600" : "400"} ${point.node.kind === "topic" ? 15 : 13}px ${canvasFont}`;
      const maxWidth = Math.max(80, size.width - 24);
      const w = Math.min(context.measureText(label).width + 12, maxWidth);
      const candidates = [
        { x: point.x - w / 2, y: point.y + point.radius + 8 },
        { x: point.x - w / 2, y: point.y - point.radius - 28 },
        { x: point.x + point.radius + 8, y: point.y - 10 },
        { x: point.x - point.radius - w - 8, y: point.y - 10 },
      ].map((place) => ({ x: clamp(place.x, 6, size.width - w - 6), y: clamp(place.y, 8, size.height - 25) }));
      const available = candidates.find(({ x, y }) => !labelBoxes.some((box) => x < box.x + box.w + 4 && x + w + 4 > box.x && y < box.y + box.h + 3 && y + 26 > box.y));
      if (!priority && !available && point.node.kind !== "topic") continue;
      const { x, y } = available ?? candidates[0];
      labelBoxes.push({ x, y, w, h: 23 });
      point.labelBounds = { x, y: y - 2, width: w, height: 23 };
      context.fillStyle = priority ? "#dddddd" : "#ffffffed"; context.fillRect(x, y - 2, w, 23);
      context.fillStyle = priority || point.node.kind === "topic" ? "#000000" : "#333333";
      context.textBaseline = "top"; context.fillText(label, x + 6, y + 2, maxWidth - 12);
    }
  }, [active, camera, flat, hoverId, local, neighbourIds, scene, selectedId, shown, size, t]);

  const candidateNodes = query.trim() ? searchResults : selected ? neighbours.map((entry) => entry.node) : graph.nodes.filter((node) => node.kind === "topic");
  const listNodes = [...candidateNodes].sort((a, b) => Number(b.kind === "project") - Number(a.kind === "project"));
  function browseConnections() { setNavigatorOpen(true); setResultLimit(graph.nodes.length); requestAnimationFrame(() => navigatorRef.current?.scrollIntoView({ block: "nearest" })); }
  async function share() { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); } catch { setCopied(false); } }
  function exportGraph() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "samuel-project-graph.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className={`system7-project ${styles.graph}`} aria-label={t("Project graph")} lang={locale}>
    <header className={styles.header}>
      <div><p>{t("Choose a subject or a point in the timeline. Follow its connections to a project, then open the full story or demo.")}</p></div>
      <div className={styles.searchContainer}><label className={styles.search}><span>{t("Find a subject, project or experience")}</span><input type="search" value={query} placeholder={t("Try Fourier, chemistry, Pfizer…")} onChange={(event) => { setQuery(event.target.value); setResultLimit(12); }} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); if (event.key === "Enter" && searchResults[0]) { event.preventDefault(); select(searchResults[0].id); } }} /></label>
        {query.trim() && <div className={styles.searchResults} aria-label={t("Search results")}><span aria-live="polite">{searchResults.length} {t("matches")}</span>{searchResults.slice(0, 8).map((result) => <button key={result.id} onClick={() => select(result.id)}><strong>{t(result.label)}</strong><small>{t(kindLabels[result.kind])}</small></button>)}{searchResults.length === 0 && <p>{t("Try a broader subject such as chemistry, learning or computing.")}</p>}{searchResults.length > 8 && <button onClick={browseConnections}>{t("Browse all connections")} ↓</button>}</div>}
      </div>
    </header>
    <nav className={styles.topics} aria-label={t("Explore a subject")}>
      <button className="mac-button" onClick={reset} aria-pressed={!selected}>{t("All work")}</button>
      {knowledgeTopics.map((topic) => <button className="mac-button" key={topic.id} style={{ "--topic-colour": canvasColours[topic.id] } as React.CSSProperties} aria-pressed={selectedId === `topic:${topic.id}`} onClick={() => select(`topic:${topic.id}`)}>{t(topic.shortLabel)}</button>)}
    </nav>
    <div className={styles.workspace}>
      <div className={styles.visual}>
        <nav className={styles.breadcrumb} aria-label={t("Exploration path")}><button onClick={reset}>{t("All work")}</button>{trail.map((id, index) => <span key={id}><span aria-hidden="true">›</span><button aria-current={index === trail.length - 1 ? "location" : undefined} onClick={() => { select(id, false); setTrail(trail.slice(0, index + 1)); }}>{t(nodeById.get(id)!.shortLabel)}</button></span>)}</nav>
        <div className={styles.toolbar} aria-label={t("Map controls")}>
          <div role="group" aria-label={t("Projection")}><button className="mac-button" aria-label={t("3D view")} aria-pressed={!flat} onClick={() => setFlat(false)}>3D</button><button className="mac-button" aria-label={t("2D view")} aria-pressed={flat} onClick={() => setFlat(true)}>2D</button></div>
          <div><button className="mac-button" aria-label={t("Zoom out")} onClick={() => setCamera((current) => ({ ...current, zoom: clamp(current.zoom / 1.2, .45, 3.5) }))}>−</button><button className="mac-button" aria-label={t("Zoom in")} onClick={() => setCamera((current) => ({ ...current, zoom: clamp(current.zoom * 1.2, .45, 3.5) }))}>+</button><button className="mac-button" onClick={fit}>{t("Fit view")}</button></div>
          {selected && <button className="mac-button" onClick={() => setLocal((value) => !value)}>{t(local ? "Show all work" : "Focus connections")}</button>}
          <button className="mac-button" onClick={() => { if (timelineRef.current) { timelineRef.current.open = true; timelineRef.current.scrollIntoView({ block: "start" }); } }}>{t("Projects along the timeline")} ↓</button>
        </div>
        <div className={styles.stage} ref={stageRef}>
          <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas}
            onPointerDown={(event) => { stopMotion(); displayScene({ ...sceneRef.current, opacity }); drag.current = { x: event.clientX, y: event.clientY, camera: sceneRef.current.camera, moved: false, pan: event.shiftKey || flat }; event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              if (drag.current) {
                const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y;
                if (Math.hypot(dx, dy) > 5) drag.current.moved = true;
                if (drag.current.moved) setCamera(dragKnowledgeCamera(drag.current.camera, dx, dy, drag.current.pan));
              } else setHoverId(pickKnowledgeNode(projectedRef.current, event.clientX - bounds.left, event.clientY - bounds.top)?.node.id ?? null);
            }}
            onPointerUp={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              if (drag.current && !drag.current.moved) { const picked = pickKnowledgeNode(projectedRef.current, event.clientX - bounds.left, event.clientY - bounds.top); if (picked) select(picked.node.id); }
              drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => { drag.current = null; }} onPointerLeave={() => setHoverId(null)} />
          {!canvasReady && <p className={styles.canvasFallback}>{t("Select any node to see its story and connected work.")}</p>}
          <div className={styles.legend}><span>● {t("Topics")}</span><span>● {t("Projects")}</span><span>◇ {t("Work & education")}</span>{selected && <span>· {t("Methods")}</span>}</div>
          <div className={styles.stageStatus}>{flat ? "2D" : "3D"} · {shown.size} {t("visible nodes")}</div>
        </div>
        <p className={styles.gestureHelp}>{t(flat ? "Drag to pan. Use + / − to zoom. All connections are also available in the list." : "Drag to rotate. Shift-drag to pan. Use + / − to zoom. All connections are also available in the list.")}</p>
        <details ref={navigatorRef} className={styles.navigator} open={navigatorOpen || !!query} onToggle={(event) => setNavigatorOpen(event.currentTarget.open)}>
          <summary>{query ? `${searchResults.length} ${t("matches")}` : selected ? `${t("Browse connections")} · ${neighbours.length}` : t("Browse subjects")}</summary>
          <div className={styles.nodeList}>{listNodes.slice(0, resultLimit).map((node) => <button key={node.id} onClick={() => select(node.id)}><span>{t(kindLabels[node.kind])}{node.period ? ` · ${t(node.period)}` : ""}</span><strong>{t(node.label)}</strong><span aria-hidden="true">→</span></button>)}</div>
          {listNodes.length > resultLimit && <button className="mac-button" onClick={() => setResultLimit((value) => value + 20)}>{t("Show more connections")}</button>}
          {query && searchResults.length === 0 && <p>{t("Try a broader subject such as chemistry, learning or computing.")}</p>}
        </details>
      </div>
      <aside className={styles.inspector} aria-label={t("Selected node")} aria-live="polite">
        {selected ? <>
          <div className={styles.nodeType}><i style={{ background: canvasColour(selected) }} />{t(selected.kind === "experience" && selected.section === "education" ? "Education" : kindLabels[selected.kind])}</div>
          <h3>{t(selected.label)}</h3>{selected.period && <p className={styles.projectYear}>{t(selected.period)}</p>}<p>{t(selected.description)}</p>
          {selectedProject && <>
            <p className={styles.projectYear}>{selectedProject.tools.map(t).join(" · ")}</p>
            {showcasePdf
              ? <button className={`s7-button is-primary ${styles.primaryAction}`} onClick={() => openActivity?.({ slug: selectedProject.slug, kind: "pdf", artifactHref: showcasePdf.href })}>{t("Open GROWMAT showcase PDF")} <span aria-hidden="true">↗</span></button>
              : <button className={`s7-button is-primary ${styles.primaryAction}`} onClick={() => onOpenProject(selectedProject.slug, false, selectedId)}>{t("Open project")} <span aria-hidden="true">↗</span></button>}
            {showcasePdf && <button className={styles.textAction} onClick={() => onOpenProject(selectedProject.slug, false, selectedId)}>{t("Open project")} →</button>}
          </>}
          {selected.kind === "experience" && <a className={`s7-button is-primary ${styles.primaryAction}`} href={graphNodeHref(selected, localeSlug)}>{t(selected.section === "education" ? "Open education record" : "Open experience record")} <span aria-hidden="true">↗</span></a>}
          <div className={styles.connections}>
            {(["experience", "project", "topic", "method"] as const).map((kind) => {
              const entries = neighbours.filter((entry) => entry.node.kind === kind);
              if (!entries.length) return null;
              return <section key={kind}><h4>{t(kind === "experience" ? "Work & education" : kind === "project" ? "Projects to explore" : kind === "topic" ? "Related subjects" : "Methods in this work")} <span>{entries.length}</span></h4>
                {entries.slice(0, 6).map(({ node, edge }) => <button key={edge.id} onClick={() => select(node.id)} title={graphConnectionText(locale, edge)}><strong>{t(node.label)}</strong><span>{node.period ? `${t(node.period)} · ` : ""}{t(relationLabel(selected, node, edge.relation))} →</span></button>)}
                {entries.length > 6 && <button className={styles.textAction} onClick={browseConnections}>{t("Browse all connections")} ↓</button>}
              </section>;
            })}
          </div>
          <section className={styles.edgeNotes}><h4>{t("Why these connections?")}</h4>{neighbours.map(({ node, edge }) => <p key={edge.id}><strong>{t(node.label)}</strong><br />{graphConnectionText(locale, edge)}</p>)}</section>
          <button className={`s7-button is-share ${styles.shareAction}`} onClick={share}>{t(copied ? "Link copied" : "Copy a link to this node")}</button>
        </> : <>
          <div className={styles.nodeType}>{t("Project graph")}</div><h3>{t("A few starting points")}</h3><p>{t("Select any node to see its story and connected work.")}</p>
          <div className={styles.startRoutes}>
            <button onClick={() => select("topic:scientific-ml")}><strong>{t("Explore scientific ML")}</strong><span>{t("Fourier operators, imaging and microrobots")} →</span></button>
            <button onClick={() => select("experience:imperial")}><strong>{t("Follow the Imperial work")}</strong><span>{t("Coursework, research and experiments")} →</span></button>
            <button onClick={() => select("experience:pfizer")}><strong>{t("Start from experience")}</strong><span>{t("Pfizer → GROWMAT → workload planning")} →</span></button>
          </div>
          <p className={styles.smallNote}>{projects.length} {t("projects")} · {knowledgeTopics.length} {t("subjects")} · {timeline.length} {t("contexts")}</p>
        </>}
      </aside>
    </div>
    <details ref={timelineRef} className={styles.timeline} id="project-graph-timeline">
      <summary><strong>{t("Projects along the timeline")}</strong><span>{t("Work & education")} · {timeline.length}</span></summary>
      <div className={styles.timelineRows}>{timeline.map((node) => {
        const linked = graphIndex.neighbours(node.id).filter((entry) => entry.node.kind === "project");
        return <article key={node.id}>
          <div className={styles.timelineDate}>{t(node.period ?? "")}</div>
          <div className={styles.timelineRecord}><button onClick={() => { select(node.id); stageRef.current?.scrollIntoView({ block: "start" }); }} className={styles.timelineTitle}>{t(node.label)} ↗</button><p>{t(node.description)}</p><div className={styles.timelineProjects}>{linked.map(({ node: project, edge }) => <button key={project.id} onClick={() => { select(project.id); stageRef.current?.scrollIntoView({ block: "start" }); }} title={graphConnectionText(locale, edge)}>{t(project.shortLabel)} <small>{t(project.period ?? "")}</small> →</button>)}</div><a href={graphNodeHref(node, localeSlug)}>{t("Open CV record")} →</a></div>
        </article>;
      })}</div>
    </details>
    <details className={styles.timeline} onToggle={(event) => setAnalysisOpen(event.currentTarget.open)}>
      <summary><strong>{t("Compare projects")}</strong><span>{t("Explore dates, tools and model families")}</span></summary>
      {analysisOpen && <CatalogueAnalysis onSelectProject={(slug) => onOpenProject(slug, false, selectedId)} initialSlug={selectedProject?.slug} locale={locale} />}
    </details>
    <footer className={styles.footer}><span>{t("Topic links describe shared ideas. Timeline links explain where the work belongs.")}</span><button className="mac-button" onClick={exportGraph}>{t("Export graph data")} ↓</button></footer>
  </section>;
}
