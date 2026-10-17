import type { ProjectCopyTable } from "@/lib/projectCopy";

export const projectShowcaseImagesCopy = {
  "Daily study notebook": [
    "每日学习手册",
    "每日學習手冊"
  ],
  "Lesson library": [
    "课程库",
    "課程庫"
  ],
  "Parliamo dashboard with four timed study steps, bilingual actions and a green progress strip.": [
    "Parliamo 首页展示四个带预计用时的学习步骤、双语按钮和绿色进度栏。",
    "Parliamo 首頁展示四個附預計用時的學習步驟、雙語按鈕和綠色進度欄。"
  ],
  "Parliamo lesson library with topic search, course filters and cards showing unmeasured skills.": [
    "Parliamo 课程库提供主题搜索、课程筛选，以及标示尚未测评技能的课程卡片。",
    "Parliamo 課程庫提供主題搜尋、課程篩選，以及標示尚未評量技能的課程卡片。"
  ],
  "The daily notebook turns the eight-week plan into four timed study blocks. This screenshot uses disposable demo progress from a local installation.": [
    "每日学习手册将八周计划分成四个带预计用时的学习环节。截图来自本地安装，使用可丢弃的演示学习记录。",
    "每日學習手冊將八週計畫分成四個附預計用時的學習環節。截圖來自本機安裝，使用可捨棄的示範學習紀錄。"
  ],
  "The library groups 28 lesson hubs by course and topic. Skills stay unmeasured until practice provides evidence; this is a local demo installation.": [
    "课程库按课程和主题整理 28 个单元。技能需经练习验证才会显示测评结果；截图来自本地演示安装。",
    "課程庫按課程和主題整理 28 個單元。技能須經練習驗證才會顯示評量結果；截圖來自本機示範安裝。"
  ],
  "Sensor cost vs error": [
    "传感器成本与误差",
    "感測器成本與誤差"
  ],
  "Saved LASSO plot showing prediction error falling as the assumed sensor budget increases.": [
    "保存的 LASSO 图：假设传感器预算增加时，预测误差逐渐下降。",
    "儲存的 LASSO 圖：假設感測器預算增加時，預測誤差逐漸下降。"
  ],
  "My notebook compares sensor combinations by assumed purchase cost and five-fold prediction error. The stars mark cheaper and more accurate options; these are study costs, not current quotes.": [
    "我的笔记本用假设采购成本和五折预测误差比较传感器组合。星号标出低成本和高精度方案；这些是研究中的成本假设，并非当前报价。",
    "我的筆記本用假設採購成本和五折預測誤差比較感測器組合。星號標出低成本和高準確度方案；這些是研究中的成本假設，並非目前報價。"
  ],
  "Ridge: shrink the weights": [
    "Ridge：缩小权重",
    "Ridge：縮小權重"
  ],
  "Saved Ridge coefficient paths; stronger regularisation draws the coloured weights towards zero.": [
    "保存的 Ridge 系数路径：正则化增强时，彩色权重曲线逐渐接近零。",
    "儲存的 Ridge 係數路徑：正則化增強時，彩色權重曲線逐漸接近零。"
  ],
  "Each line is one sensor coefficient in my saved fit. Move right to increase the penalty: Ridge reduces the weights without abruptly selecting a small subset. The red line marks the cross-validation choice.": [
    "每条线代表我保存的拟合中的一个传感器系数。向右表示惩罚增强：Ridge 缩小权重，而不会突然只留下少数变量。红线标出交叉验证选定的值。",
    "每條線代表我儲存的擬合中的一個感測器係數。向右表示懲罰增強：Ridge 縮小權重，而不會突然只留下少數變數。紅線標出交叉驗證選定的值。"
  ],
  "LASSO: select a smaller set": [
    "LASSO：选择更少变量",
    "LASSO：選擇更少變數"
  ],
  "Saved LASSO coefficient paths; most coloured weights become exactly zero as the penalty increases.": [
    "保存的 LASSO 系数路径：惩罚增强时，多数彩色权重变成零。",
    "儲存的 LASSO 係數路徑：懲罰增強時，多數彩色權重變成零。"
  ],
  "The same sensor data with LASSO. Increasing the penalty removes coefficients completely, creating smaller sensor sets. This is the calculation behind the cost-versus-error comparison.": [
    "对同一传感器数据使用 LASSO。惩罚增强时，一些系数完全归零，留下更小的传感器组合。这正是成本与误差比较背后的计算。",
    "對同一感測器資料使用 LASSO。懲罰增強時，一些係數完全歸零，留下更小的感測器組合。這正是成本與誤差比較背後的計算。"
  ],
  "Detection trade-off": [
    "检测取舍",
    "偵測取捨"
  ],
  "Historical ROC curves for five classifiers, plotting caught attacks against false alarms.": [
    "五种分类器的历史 ROC 曲线，比较检出的攻击与误报。",
    "五種分類器的歷史 ROC 曲線，比較偵測出的攻擊與誤報。"
  ],
  "My saved comparison makes the false-alarm trade-off visible. Duplicate rows overlapped the original train/test split, so these curves explain the experiment and cannot establish deployment accuracy.": [
    "我保存的比较图展示了误报的取舍。原训练集与测试集之间存在重复行，因此这些曲线只能解释该实验，不能证明部署后的准确率。",
    "我儲存的比較圖展示了誤報的取捨。原訓練集與測試集之間存在重複資料列，因此這些曲線只能解釋該實驗，不能證明部署後的準確率。"
  ],
  "A different test population": [
    "不同的测试群体",
    "不同的測試群體"
  ],
  "Synthetic coursework histograms showing calibration values on one side of a split and test values on the other.": [
    "合成课程实验的直方图：校准数据位于分割点一侧，测试数据位于另一侧。",
    "合成課程實驗的直方圖：校準資料位於分割點一側，測試資料位於另一側。"
  ],
  "In my synthetic coursework example, I split calibration and test cases by one feature. Their distributions visibly differ. That mismatch prompts a coverage check; it does not by itself prove the intervals failed.": [
    "在我的合成课程实验中，我用一个特征分开校准与测试样本。两者分布明显不同，需要重新检查覆盖率；仅凭分布差异，并不能证明预测区间失效。",
    "在我的合成課程實驗中，我用一個特徵分開校準與測試樣本。兩者分布明顯不同，需要重新檢查涵蓋率；僅憑分布差異，並不能證明預測區間失效。"
  ],
  "Automation vs review": [
    "自动处理与人工复核",
    "自動處理與人工複核"
  ],
  "Saved accuracy-versus-coverage curves comparing Safe-L2D, L2D, confidence filtering and no deferral.": [
    "保存的准确率与自动处理比例曲线，比较 Safe-L2D、L2D、置信度筛选和不转交复核。",
    "儲存的準確率與自動處理比例曲線，比較 Safe-L2D、L2D、信心程度篩選和不轉交複核。"
  ],
  "Move right for more automated decisions and less review. My saved benchmark compares the resulting combined accuracy; the simpler confidence baseline can perform better. Reviewer answers were simulated.": [
    "向右表示更多自动决策、更少复核。我的基准结果比较了由此产生的整体准确率；更简单的置信度基线有时表现更好。复核人员的答案是模拟的。",
    "向右表示更多自動決策、更少複核。我的基準結果比較了由此產生的整體準確率；更簡單的信心程度基線有時表現更好。複核人員的答案是模擬的。"
  ],
  "Estimate a different policy": [
    "估计另一种策略",
    "估計另一種策略"
  ],
  "Five policy-value estimates from twelve synthetic experiments, with a dashed line for the known simulated value.": [
    "十二次合成实验中的五种策略价值估计，虚线表示已知的模拟真实值。",
    "十二次合成實驗中的五種策略價值估計，虛線表示已知的模擬真實值。"
  ],
  "My teaching experiment compares five ways to reuse logged decisions. The dashed line is the known simulated policy value; bars and whiskers show the mean and spread across twelve runs. No real claims are shown.": [
    "我的教学实验比较五种复用历史决策的方法。虚线表示已知的模拟策略价值；柱形和误差线表示十二次运行的均值与波动。图中没有真实理赔记录。",
    "我的教學實驗比較五種重用歷史決策的方法。虛線表示已知的模擬策略價值；柱形和誤差線表示十二次執行的平均值與波動。圖中沒有真實理賠紀錄。"
  ],
  "Learning which arm to choose": [
    "学习选择哪个选项",
    "學習選擇哪個選項"
  ],
  "Four bandit strategies accumulate different amounts of regret over two thousand choices in a saved ten-arm simulation.": [
    "保存的十选项模拟中，四种策略在两千次选择后积累了不同的遗憾值。",
    "儲存的十選項模擬中，四種策略在兩千次選擇後累積了不同的遺憾值。"
  ],
  "My ten-arm simulation compares four exploration strategies over twenty seeded runs. Lower regret means fewer missed rewards. The shaded bands show variation between runs; the browser uses a smaller three-arm example.": [
    "我的十选项模拟用二十次固定随机种子运行比较四种探索策略。遗憾值越低，错失的奖励越少。阴影表示运行间的波动；浏览器演示使用较小的三选项示例。",
    "我的十選項模擬用二十次固定隨機種子執行比較四種探索策略。遺憾值越低，錯失的獎勵越少。陰影表示執行間的波動；瀏覽器示範使用較小的三選項範例。"
  ],
  "How preference penalties differ": [
    "偏好惩罚有何不同",
    "偏好懲罰有何不同"
  ],
  "Three loss functions from my reinforcement-learning notes, plotted against the margin between preferred and rejected answers.": [
    "我的强化学习笔记中的三种损失函数，横轴为偏好答案与被拒答案的分数差。",
    "我的強化學習筆記中的三種損失函數，橫軸為偏好答案與被拒答案的分數差。"
  ],
  "This original teaching figure shows how three objectives penalise the same answer preference. The horizontal axis is the preferred-minus-rejected margin. These are formula curves, not measured language-model scores.": [
    "这张原始教学图展示三种目标函数如何对同一答案偏好施加惩罚。横轴为偏好答案减去被拒答案的分数差。这是公式曲线，并非语言模型实测成绩。",
    "這張原始教學圖展示三種目標函數如何對同一答案偏好施加懲罰。橫軸為偏好答案減去被拒答案的分數差。這是公式曲線，並非語言模型實測成績。"
  ],
  "Methanol: liquid and vapour": [
    "甲醇：液体与蒸气",
    "甲醇：液體與蒸氣"
  ],
  "Saved methanol density–temperature phase envelope comparing seven equations of state with public NIST experimental points.": [
    "保存的甲醇密度与温度相包络线，比较七种状态方程与 NIST 公开实验数据点。",
    "儲存的甲醇密度與溫度相包絡線，比較七種狀態方程與 NIST 公開實驗資料點。"
  ],
  "My Clapeyron example compares seven fluid models with public methanol measurements. The two branches are vapour and liquid. Temperature is in kelvin; the original axis mistakenly prints K⁻¹. This is separate from private compound studies.": [
    "我的 Clapeyron 示例将七种流体模型与公开的甲醇测量值进行比较。两条分支分别为蒸气和液体。温度单位为开尔文；原图坐标轴误写为 K⁻¹。此图与私人化合物研究分开。",
    "我的 Clapeyron 範例將七種流體模型與公開的甲醇量測值進行比較。兩條分支分別為蒸氣和液體。溫度單位為開爾文；原圖座標軸誤寫為 K⁻¹。此圖與私人化合物研究分開。"
  ],
  "CO₂ and water: two phases": [
    "CO₂ 与水：两相",
    "CO₂ 與水：兩相"
  ],
  "Saved pressure–composition curves for carbon dioxide and water at 323.15 kelvin; the composition axis contains a break.": [
    "保存的 323.15 开尔文下二氧化碳与水的压力与组成曲线；组成轴使用断轴。",
    "儲存的 323.15 開爾文下二氧化碳與水的壓力與組成曲線；組成軸使用斷軸。"
  ],
  "Another saved Clapeyron calculation compares four models for CO₂–water equilibrium at 323.15 K. The broken horizontal axis shows both dilute and nearly pure compositions. This is vapour–liquid equilibrium, not a drug-solubility result.": [
    "另一份保存的 Clapeyron 计算比较四种模型在 323.15 K 下的 CO₂ 与水平衡。横轴断开以同时显示稀溶液和接近纯组分的组成。这是汽液平衡，并非药物溶解度结果。",
    "另一份儲存的 Clapeyron 計算比較四種模型在 323.15 K 下的 CO₂ 與水平衡。橫軸斷開以同時顯示稀溶液和接近純組分的組成。這是汽液平衡，並非藥物溶解度結果。"
  ],
  "Original MATLAB app": [
    "原始 MATLAB 应用",
    "原始 MATLAB 應用"
  ],
  "Original MATLAB spectroscopy plotting window with file-loading, frequency, title and export controls around an empty graph.": [
    "原始 MATLAB 光谱绘图窗口，空白图表周围包含文件加载、频率、标题和导出控件。",
    "原始 MATLAB 光譜繪圖視窗，空白圖表周圍包含檔案載入、頻率、標題和匯出控制項。"
  ],
  "The original window saved inside my MATLAB app: load a trace, choose a frequency window, label the axes and save a figure. The graph is empty here; unpublished experimental traces are not displayed.": [
    "这是我的 MATLAB 应用中保存的原始窗口：加载谱线、选择频率范围、标注坐标轴并保存图片。这里的图表为空白，没有展示未发表的实验谱线。",
    "這是我的 MATLAB 應用中儲存的原始視窗：載入譜線、選擇頻率範圍、標註座標軸並儲存圖片。這裡的圖表為空白，沒有展示未發表的實驗譜線。"
  ],
  "Frequency-window controls": [
    "频率范围控件",
    "頻率範圍控制項"
  ],
  "Original MATLAB controls for frequency centre, range, coarse and fine adjustment, and left/right panning.": [
    "原始 MATLAB 控件：频率中心、范围、粗细调整以及左右平移。",
    "原始 MATLAB 控制項：頻率中心、範圍、粗細調整以及左右平移。"
  ],
  "A closer view of the original controls I built for moving through a long spectrum. Centre and range select the visible MHz window; the arrow buttons pan it.": [
    "近距离查看我为浏览长光谱制作的原始控件。中心频率和范围决定可见的 MHz 窗口；箭头按钮用于平移。",
    "近距離查看我為瀏覽長光譜製作的原始控制項。中心頻率和範圍決定可見的 MHz 視窗；箭頭按鈕用於平移。"
  ],
  "A self-avoiding walk": [
    "不自交的随机游走",
    "不自交的隨機漫步"
  ],
  "Original saved three-dimensional self-avoiding walk with 150 steps, coloured from its start to its end.": [
    "原始保存的三维不自交随机游走，共 150 步，颜色从起点渐变到终点。",
    "原始儲存的三維不自交隨機漫步，共 150 步，顏色從起點漸變到終點。"
  ],
  "One of my Julia experiments: a 150-step path that cannot revisit an occupied lattice point. The colour follows progress from Start to End. This is a simulated chain, not a measured molecular structure.": [
    "我的一个 Julia 实验：一条 150 步的路径，不能再次进入已占用的格点。颜色表示从 Start 到 End 的进展。这是模拟链，并非实测分子结构。",
    "我的一個 Julia 實驗：一條 150 步的路徑，不能再次進入已佔用的格點。顏色表示從 Start 到 End 的進展。這是模擬鏈，並非實測分子結構。"
  ],
  "The original workload manager": [
    "原始工作量管理器",
    "原始工作量管理器"
  ],
  "Original GROWMAT web scheduling interface from the public showcase, with operational fields already blurred.": [
    "来自公开展示的原始 GROWMAT 网页排程界面，其中业务字段已被模糊处理。",
    "來自公開展示的原始 GROWMAT 網頁排程介面，其中業務欄位已被模糊處理。"
  ],
  "The GROWMAT web interface I built for viewing and editing the workload. Team filters, manual-job entry and spreadsheet export sit above the schedule. This is the already-redacted public showcase image.": [
    "这是我制作的 GROWMAT 网页界面，用于查看和编辑工作量。排程上方提供团队筛选、手动添加任务和电子表格导出。这是公开展示中已经脱敏的图片。",
    "這是我製作的 GROWMAT 網頁介面，用於檢視和編輯工作量。排程上方提供團隊篩選、手動新增工作和試算表匯出。這是公開展示中已經去識別化的圖片。"
  ],
  "The original Spotfire dashboard": [
    "原始 Spotfire 仪表盘",
    "原始 Spotfire 儀表板"
  ],
  "Original GROWMAT Spotfire dashboard showing scheduled work, project totals and team workload from the public showcase.": [
    "公开展示中的原始 GROWMAT Spotfire 仪表盘，显示排程工作、项目总量和团队工作量。",
    "公開展示中的原始 GROWMAT Spotfire 儀表板，顯示排程工作、專案總量和團隊工作量。"
  ],
  "My Spotfire view turns scheduled jobs into workload by date, project and team. Linked charts let an analyst narrow the view and inspect the matching schedule. Confidential fields were blurred in the published slide.": [
    "我的 Spotfire 视图按日期、项目和团队汇总排程任务。联动图表让分析人员缩小范围，查看对应排程。发布的幻灯片已模糊处理机密字段。",
    "我的 Spotfire 檢視按日期、專案和團隊彙總排程工作。連動圖表讓分析人員縮小範圍，檢視對應排程。發布的投影片已模糊處理機密欄位。"
  ],
  "Capacity and upcoming work": [
    "产能与即将到来的工作",
    "產能與即將到來的工作"
  ],
  "Original GROWMAT Spotfire capacity and workload charts from page eight of the public showcase.": [
    "公开展示第八页中的原始 GROWMAT Spotfire 产能与工作量图表。",
    "公開展示第八頁中的原始 GROWMAT Spotfire 產能與工作量圖表。"
  ],
  "This public showcase view compares workload with available capacity and breaks it down over time. The original app also offered overdue, near-due and next-month views so an analyst could spot pressure before a deadline.": [
    "这份公开展示将工作量与可用产能进行比较，并按时间细分。原应用还提供逾期、临近到期和下个月视图，让分析人员在截止日前发现压力。",
    "這份公開展示將工作量與可用產能進行比較，並按時間細分。原應用還提供逾期、即將到期和下個月檢視，讓分析人員在截止日前發現壓力。"
  ],
  "Four ways to organise innovation": [
    "组织创新的四种方式",
    "組織創新的四種方式"
  ],
  "My original four-model diagram places Enabler, Producer, Opportunist and Advocate by resource authority and organisational ownership.": [
    "我的原始四模型图按资源权限和组织所有权排列促进者、生产者、机会主义者和倡导者。",
    "我的原始四模型圖按資源權限和組織所有權排列促進者、生產者、機會主義者和倡導者。"
  ],
  "My original diagram separates who owns innovation from how firmly resources are assigned. It is the framework I used for the reflection; it describes organisational choices rather than ranking company performance.": [
    "我的原始图将创新由谁负责与资源分配有多明确分开。这是我进行反思时使用的框架，描述的是组织选择，而非公司绩效排名。",
    "我的原始圖將創新由誰負責與資源分配有多明確分開。這是我進行反思時使用的框架，描述的是組織選擇，而非公司績效排名。"
  ]
} satisfies ProjectCopyTable;
