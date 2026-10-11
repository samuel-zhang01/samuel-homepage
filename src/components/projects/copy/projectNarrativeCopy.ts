import type { ProjectCopyTable } from "@/lib/projectCopy";

/** Reviewed project descriptions and career context; names and scientific quantities stay intact. */
export const projectNarrativeCopy = {
  "I built Ultra Convert so I can select different file types in Finder and convert them together. I can also build rules from matching and action blocks: convert an image, rename it and run the same sequence whenever a new file arrives in a watched folder. Originals stay in place; outputs get separate, collision-safe names.": ["我制作 Ultra Convert，让我在 Finder 中选择不同类型的文件，一起转换。我还可以用匹配与操作积木建立规则：转换图片、重命名，并在监控文件夹有新文件时自动执行同一流程。原始文件保留，输出使用独立且避免冲突的名称。", "我製作 Ultra Convert，讓我在 Finder 中選擇不同類型的檔案，一起轉換。我也能以匹配與操作積木建立規則：轉換圖片、重新命名，並在監看資料夾有新檔案時自動執行同一流程。原始檔案保留，輸出使用獨立且避免衝突的名稱。"],
  "Convert a mixed Finder selection in one batch": ["在同一批次转换 Finder 中的混合文件", "在同一批次轉換 Finder 中的混合檔案"],
  "Build puzzle-style rules: match → convert → rename": ["积木式规则：匹配 → 转换 → 重命名", "積木式規則：匹配 → 轉換 → 重新命名"],
  "Watch folders for new arrivals; keep originals and avoid overwrites": ["监控新文件；保留原始文件并避免覆盖", "監看新檔案；保留原始檔案並避免覆寫"],
  "Rules and Finder actions use example files. The image tab really converts PNG, JPEG and WebP in your browser; your image stays on this device. Install the Mac app for other formats and folder automation.": ["规则与 Finder 操作用示例文件。图片标签可在浏览器中真正转换 PNG、JPEG 和 WebP；图片始终保留在此设备。其他格式和文件夹自动处理需要安装 Mac 应用。", "規則與 Finder 操作使用範例檔案。圖片分頁可在瀏覽器中實際轉換 PNG、JPEG 與 WebP；圖片始終留在此裝置。其他格式與資料夾自動處理需安裝 Mac 應用程式。"],
  "I built VideoMate to recover readable video and organise a checked collection. It can repair a broken container without re-encoding, preserve recoverable frames in FFV1/PCM, or make a portable MP4. For migrations I can copy supporting files, exclude unwanted ones and send uncertain videos to review. A new copy joins the collection only after it passes verification; the original stays untouched.": ["我制作 VideoMate，用于恢复可读取的视频并整理经过检查的集合。它可以不重新编码就修复损坏的容器，以 FFV1/PCM 保留可恢复画面，或生成通用 MP4。迁移时，我可以复制配套文件、排除不需要的文件，并将不确定的视频交由复核。新副本通过验证后才加入集合；原始文件保持不变。", "我製作 VideoMate，用於復原可讀取的影片並整理經過檢查的集合。它可以不重新編碼就修復損壞的容器，以 FFV1/PCM 保留可復原畫面，或製作通用 MP4。遷移時，我可以複製配套檔案、排除不需要的檔案，並將不確定的影片交由複核。新副本通過驗證後才加入集合；原始檔案保持不變。"],
  "Inspect the whole video; verify each new copy before publishing": ["检查完整视频；发布前验证每个新副本", "檢查完整影片；發佈前驗證每個新副本"],
  "Repair a broken index or recover readable frames": ["修复损坏索引或恢复可读取画面", "修復損壞索引或復原可讀取畫面"],
  "Move a collection with copy, exclude and review decisions": ["通过复制、排除和复核整理新集合", "透過複製、排除與複核整理新集合"],
  "Pause and resume local work while preserving originals": ["暂停和继续本地处理，同时保留原始文件", "暫停與繼續本機處理，同時保留原始檔案"],
  "The playground animates five example files and their checks; it does not run FFmpeg or process your videos. The desktop app works locally and is available as a source preview.": ["演示展示五个示例文件及其检查过程；不会运行 FFmpeg 或处理你的影片。桌面应用在本地运行，目前提供源代码预览。", "示範呈現五個範例檔案及其檢查流程；不會執行 FFmpeg 或處理你的影片。桌面應用程式在本機運作，目前提供原始碼預覽。"],
  "Individual, round-robin, collective and first-available meetings": ["单人、轮询、集体和优先可用会议", "單人、輪詢、集體與優先可用會議"],
  "Show the same meeting in each guest’s time zone": ["按每位访客的时区显示同一场会议", "依每位訪客的時區顯示同一場會議"],
  "Reserve a time, answer booking questions and recheck conflicts": ["预留时间、回答预约问题，再次检查冲突", "保留時段、回答預約問題，再次檢查衝突"],
  "Download an ICS invitation, reschedule or cancel": ["下载 ICS 邀请、改期或取消", "下載 ICS 邀請、改期或取消"],
  "Change the puzzle rule, save it and drop a new example file into the watched folder. Reorder Convert and Rename to see why action order matters. Try Finder actions, or convert and download an image in the image tab.": ["修改积木规则，保存后向监控文件夹投放新示例文件。调整转换与重命名顺序，查看操作顺序的作用。试用 Finder 操作，或在图片标签中转换并下载图片。", "修改積木規則，儲存後向監看資料夾放入新範例檔案。調整轉換與重新命名順序，查看操作順序的影響。試用 Finder 操作，或在圖片分頁轉換並下載圖片。"],
  "Select Broken MP4 index and play the repair. Step through inspection, the candidate and verification: the new collection stays empty until the copy passes. Try damaged frames with remux, or adjust the shortening limit for an incomplete recording.": ["选择损坏的 MP4 索引并播放修复流程。逐步检查、生成候选副本并验证：副本通过前，新集合保持为空。尝试用重新封装修复损坏画面，或调整不完整录制的缩短限制。", "選擇損壞的 MP4 索引並播放修復流程。逐步檢查、產生候選副本並驗證：副本通過前，新集合保持空白。嘗試以重新封裝修復損壞畫面，或調整不完整錄製的縮短限制。"],
  "Choose a meeting time and guest time zone, answer the booking questions and confirm. Download the calendar invitation, then reschedule or cancel. Try a competing booking to see the final conflict check protect the time.": ["选择会议时间和访客时区，回答预约问题并确认。下载日历邀请，然后改期或取消。尝试竞争预约，查看最终冲突检查如何保护该时段。", "選擇會議時段與訪客時區，回答預約問題並確認。下載行事曆邀請，然後改期或取消。嘗試競爭預約，查看最終衝突檢查如何保護該時段。"],
  "Batch converter": ["批量转换器", "批次轉換器"],
  "Folder rules": ["文件夹规则", "資料夾規則"],
  "Ultra Convert’s real Mac window with a photo, recording and document ready to convert": ["Ultra Convert 的真实 Mac 窗口，已准备好转换图片、录音和文档", "Ultra Convert 的真實 Mac 視窗，已準備好轉換圖片、錄音與文件"],
  "The real Mac app, using three generated example files. Choose formats and review the destination before converting.": ["真实 Mac 应用，使用三个生成的示例文件。转换前选择格式并检查保存位置。", "真實 Mac 應用程式，使用三個產生的範例檔案。轉換前選擇格式並檢查儲存位置。"],
  "Ultra Convert’s real puzzle rule editor with Convert and Rename action blocks": ["Ultra Convert 的真实积木规则编辑器，包含转换与重命名操作", "Ultra Convert 的真實積木規則編輯器，包含轉換與重新命名操作"],
  "The real folder-rule editor: match images, convert to WebP, then rename. This sample rule is disabled and uses a temporary folder.": ["真实文件夹规则编辑器：匹配图片、转换为 WebP，再重命名。此示例规则已停用，并使用临时文件夹。", "真實資料夾規則編輯器：匹配圖片、轉換為 WebP，再重新命名。此範例規則已停用，並使用暫存資料夾。"],
  "YASA’s live booking page showing a meeting calendar and available times": ["YASA 在线预约页面，显示会议日历和可用时间", "YASA 線上預約頁面，顯示會議行事曆與可用時段"],
  "My live YASA booking page, captured on 11 October 2026. The playground below lets you explore the booking flow without sending a real booking.": ["我的在线 YASA 预约页面，截图于 2026 年 10 月 11 日。下方演示可探索预约流程，不会发送真实预约。", "我的線上 YASA 預約頁面，截圖於 2026 年 10 月 11 日。下方示範可探索預約流程，不會傳送真實預約。"],

  "VideoMate": ["VideoMate", "VideoMate"],
  "LOCAL VIDEO REPAIR AND RE-ENCODING": ["本地视频修复与重新编码", "本機影片修復與重新編碼"],
  "VideoMate is a native, offline GUI and CLI for inspecting damaged video, recovering readable material and building verified mixed-folder migrations. It preserves originals, checks integrity with software decoding and publishes candidates only after independent verification. Eligible repairs and HEVC migration use qualified GPU encoders with software fallback. The browser companion models these choices with fictional inputs; no visitor media is uploaded or processed.": ["VideoMate 是本地离线图形界面与命令行工具，用于检查受损视频、恢复可读取内容并构建经过验证的混合文件夹迁移。它保留原始文件，通过软件解码检查完整性，并且只在独立验证后发布候选结果。符合条件的修复和 HEVC 迁移会使用合格的 GPU 编码器，并提供软件回退。浏览器演示用虚构输入展示这些选择；不会上传或处理访客媒体。", "VideoMate 是本機離線圖形介面與命令列工具，用於檢查受損影片、復原可讀取內容並建立經過驗證的混合資料夾遷移。它保留原始檔案，透過軟體解碼檢查完整性，且只在獨立驗證後發佈候選結果。符合條件的修復與 HEVC 遷移會使用合格的 GPU 編碼器，並提供軟體備援。瀏覽器示範用虛構輸入展示這些選擇；不會上傳或處理訪客媒體。"],
  "Tkinter": ["Tkinter 图形界面", "Tkinter 圖形介面"],
  "FFmpeg / FFprobe": ["FFmpeg / FFprobe 媒体工具", "FFmpeg / FFprobe 媒體工具"],
  "Hardware encoding": ["硬件编码", "硬體編碼"],
  "Offline desktop app": ["离线桌面应用", "離線桌面應用程式"],
  "Software-decoded inspection and independent output verification": ["软件解码检查与独立的输出验证", "軟體解碼檢查與獨立的輸出驗證"],
  "GPU-qualified HEVC migration with software fallback": ["经 GPU 资格检查的 HEVC 迁移及软件回退", "經 GPU 資格檢查的 HEVC 遷移及軟體備援"],
  "Original-preserving recovery, migration and private resume": ["保留原始文件的修复、迁移和私有续传", "保留原始檔案的修復、遷移與私人續傳"],
  "Native GUI and CLI; platform qualification is still in progress": ["原生图形界面和命令行；平台验证仍在进行中", "原生圖形介面與命令列；平台驗證仍在進行中"],
  "local selection → full software decode → copy, remux or qualified encode → independent output verification → published result or review": ["本地选择 → 完整软件解码 → 复制、重新封装或合格编码 → 独立输出验证 → 发布结果或交由复核", "本機選擇 → 完整軟體解碼 → 複製、重新封裝或合格編碼 → 獨立輸出驗證 → 發佈結果或交由複核"],
  "CONNECTED ACCOUNTS, A CLEARER FINANCIAL PICTURE": ["连接账户，清晰掌握财务","連接帳戶，清晰掌握財務"],
  "A personal finance workspace for net worth, connected bank accounts, two trading platforms and recurring-payment checks.": ["个人财务工作台：查看净资产、已连接银行账户和两个交易平台，并检查定期付款。","個人財務工作台：查看淨資產、已連接銀行帳戶和兩個交易平台，並檢查定期付款。"],
  "Ledger brings Lunch Flow bank feeds and read-only SnapTrade investment connections together with retained PDF and CSV statement history. Net worth combines bank balances, broker cash, holdings and credit debt without counting connected and imported accounts twice. Spending, transaction review, recurring-payment checks and planning turn that account history into useful decisions. The blue-themed demo showcases five bank and credit accounts and two trading platforms, Trading 212 and Moomoo, using fictional balances and transactions. Toggle accounts in net worth, inspect investment values, find price changes in regular bills or explore the import and transfer checks.": ["Ledger 将 Lunch Flow 银行数据和只读 SnapTrade 投资连接与 PDF、CSV 账单历史整合。净资产汇总银行余额、券商现金、持仓和信用卡债务，避免重复计算已连接和导入账户。支出、交易复核、定期付款检查和规划让账户历史帮助财务决策。蓝色主题演示使用虚构余额和交易，展示五个银行及信用卡账户，以及 Trading 212 和 Moomoo 两个交易平台。可切换净资产账户、查看投资价值、发现定期账单价格变化，或探索导入与转账检查。","Ledger 將 Lunch Flow 銀行資料和只讀 SnapTrade 投資連接與 PDF、CSV 帳單歷史整合。淨資產彙總銀行餘額、券商現金、持倉和信用卡債務，避免重複計算已連接和匯入帳戶。支出、交易複核、定期付款檢查和規劃讓帳戶歷史幫助財務決策。藍色主題演示使用虛構餘額和交易，展示五個銀行及信用卡帳戶，以及 Trading 212 和 Moomoo 兩個交易平台。可切換淨資產帳戶、查看投資價值、發現定期帳單價格變化，或探索匯入與轉帳檢查。"],
  "Net worth across five bank and credit accounts": ["五个银行及信用卡账户的净资产","五個銀行及信用卡帳戶的淨資產"],
  "Two trading platforms: Trading 212 and Moomoo": ["两个交易平台：Trading 212 和 Moomoo","兩個交易平台：Trading 212 和 Moomoo"],
  "Recurring bills, price changes and spending review": ["定期账单、价格变化和支出复核","定期帳單、價格變化和支出複核"],
  "Fictional data with interactive account and investment filters": ["虚构数据与交互式账户及投资筛选","虛構資料與互動式帳戶及投資篩選"],
  "Orbital Lab": [
    "原子轨道实验室",
    "原子軌域實驗室"
  ],
  "A SMALL QUANTUM LABORATORY": [
    "一间小型量子实验室",
    "一間小型量子實驗室"
  ],
  "Explore atomic orbitals in ASCII, a probability point cloud or a smooth 3D surface.": [
    "用字符图、概率点云或平滑的三维曲面探索原子轨道。",
    "用 ASCII 字元、機率點雲或平滑三維曲面探索原子軌域。"
  ],
  "Browse all 118 elements and explore their electron configurations through real angular orbital components. Phase colours show the wavefunction sign, while point clouds sample probability density. Radial plots and central slices connect the 3D shapes to the mathematics. The hydrogen-like model is educational; it does not calculate a full many-electron atom.": [
    "浏览全部 118 种元素，通过实角向轨道分量探索电子排布。相位颜色表示波函数的正负号，点云则按概率密度采样。径向曲线和中心切片把三维形状与数学联系起来。这是用于教学的类氢原子模型，不计算完整的多电子原子。",
    "瀏覽全部 118 種元素，透過實角向軌域分量探索電子組態。相位顏色表示波函數的正負號，點雲則按機率密度取樣。徑向曲線和中央切片把三維形狀與數學聯繫起來。這是用於教學的類氫原子模型，不計算完整的多電子原子。"
  ],
  "TypeScript": [
    "TypeScript",
    "TypeScript"
  ],
  "WebGL": [
    "WebGL",
    "WebGL"
  ],
  "Web Workers": [
    "Web Workers",
    "Web Workers"
  ],
  "Hydrogen-like orbitals": [
    "类氢原子轨道",
    "類氫原子軌域"
  ],
  "118 elements with electron configurations": [
    "118 种元素及其电子排布",
    "118 種元素及其電子組態"
  ],
  "ASCII, density and surface views": [
    "字符、概率密度与曲面视图",
    "ASCII 字元、機率密度與曲面視圖"
  ],
  "Radial probability and model caveats": [
    "径向概率和模型适用范围",
    "徑向機率和模型適用範圍"
  ],
  "Calculations run in this browser. This is an educational atomic model, not a quantum-chemistry solver.": [
    "计算在浏览器内完成。这是原子结构教学模型，不是量子化学求解器。",
    "計算在瀏覽器內完成。這是原子結構教學模型，不是量子化學求解器。"
  ],
  "Education": [
    "教育",
    "教育"
  ],
  "Active": [
    "持续开发",
    "持續開發"
  ],
  "Note Pad": [
    "记事本",
    "記事本"
  ],
  "EIGHT QUICK PAGES": [
    "随手记，八页就够",
    "隨手記，八頁就夠"
  ],
  "Jot something down, turn the page and find it here next time.": [
    "记下想法，翻到下一页，下次打开还能找到。",
    "記下想法，翻到下一頁，下次打開還能找到。"
  ],
  "Eight ruled pages save notes in this browser. Insert the date, export a text copy, or include the notebook in a Desk Accessories backup.": ["八页横线纸将笔记保存在此浏览器中。可插入日期、导出文本副本，或将笔记本纳入桌面小工具备份。", "八頁橫線紙將筆記儲存在此瀏覽器中。可插入日期、匯出文字副本，或將筆記本納入桌面小工具備份。"],
  "Local storage": [
    "本地存储",
    "本機儲存"
  ],
  "Text export": [
    "文本导出",
    "文字匯出"
  ],
  "Eight ruled pages": [
    "八页横线笔记纸",
    "八頁橫線筆記紙"
  ],
  "Date insertion and text export": [
    "插入日期与文本导出",
    "插入日期與文字匯出"
  ],
  "Saved locally in this browser; no account or cloud synchronisation. Export a backup before clearing browser data.": [
    "内容保存在此浏览器本地，无须账号，也不与云端同步。清除浏览器数据前请先导出备份。",
    "內容保存在此瀏覽器本地，無須帳號，也不與雲端同步。清除瀏覽器資料前請先匯出備份。"
  ],
  "Products": [
    "产品",
    "產品"
  ],
  "Shipped": [
    "已交付",
    "已交付"
  ],
  "Sketch Pad": [
    "绘图板",
    "繪圖板"
  ],
  "INK WITHOUT THE MESS": [
    "随手画，不留墨迹",
    "隨手畫，不留墨跡"
  ],
  "Draw with mouse, trackpad or touch; undo freely and export a PNG.": [
    "用鼠标、触控板或手指绘图，随时撤销并导出 PNG。",
    "用滑鼠、觸控板或手指繪圖，隨時撤銷並匯出 PNG。"
  ],
  "A small drawing surface with ink colours, stroke sizes and undo. Pointer input works with mouse or touch, the drawing stays local, and PNG export turns a quick sketch into a file.": [
    "小巧的画布提供多种颜色、笔触粗细和撤销功能。鼠标与触摸都能绘图，画作保存在本地，也可以导出为 PNG 文件。",
    "小巧的畫布提供多種顏色、筆觸粗細和撤銷功能。滑鼠與觸控都能繪圖，畫作保存在本地，也可以匯出為 PNG 檔案。"
  ],
  "Canvas 2D": [
    "Canvas 2D",
    "Canvas 2D"
  ],
  "Pointer Events": [
    "Pointer Events",
    "Pointer Events"
  ],
  "Mouse and touch drawing": [
    "鼠标与触摸绘图",
    "滑鼠與觸控繪圖"
  ],
  "Undo and PNG export": [
    "撤销与 PNG 导出",
    "撤銷與 PNG 匯出"
  ],
  "Quick List": [
    "快速清单",
    "快速清單"
  ],
  "A TINY COMMAND CENTRE": [
    "小小的任务指挥台",
    "小小的任務指揮台"
  ],
  "Capture tasks, mark priorities and keep the list across visits.": [
    "记录待办、标记优先事项，并保留清单以便下次使用。",
    "記錄待辦、標記優先事項，並保留清單供下次使用。"
  ],
  "A compact task list with priorities, completion controls and filters. Keep the next few jobs visible without turning a checklist into a project-management system.": [
    "紧凑的任务清单提供优先级、完成状态和筛选功能。把接下来要做的几件事放在眼前，无须使用复杂的项目管理系统。",
    "緊湊的任務清單提供優先級、完成狀態和篩選功能。把接下來要做的幾件事放在眼前，無須使用複雜的專案管理系統。"
  ],
  "Accessible forms": [
    "无障碍表单",
    "無障礙表單"
  ],
  "Priorities and completion filters": [
    "优先级与完成状态筛选",
    "優先級與完成狀態篩選"
  ],
  "Local task persistence": [
    "本地保存任务",
    "本地保存任務"
  ],
  "Focus Clock": [
    "专注时钟",
    "專注時鐘"
  ],
  "A FRIENDLIER ALARM CLOCK": [
    "更贴心的专注时钟",
    "更貼心的專注時鐘"
  ],
  "Run a focus sprint, take a short break and keep a tiny daily tally.": [
    "专注一小段时间，休息片刻，再看看今天完成了几轮。",
    "專注一小段時間，休息片刻，再看看今天完成了幾輪。"
  ],
  "A deadline-based focus timer with pause, reset and a daily completion tally. Elapsed time is derived from the clock rather than counting browser ticks; background tabs may still delay the audible alert.": [
    "以截止时间计算进度的专注计时器，支持暂停、重置和每日完成次数。经过的时间由时钟计算，而非累计浏览器计时回调；后台标签页仍可能延迟声音提醒。",
    "以截止時間計算進度的專注計時器，支持暫停、重置和每日完成次數。經過的時間由時鐘計算，而非累計瀏覽器計時回呼；後臺分頁仍可能延遲聲音提醒。"
  ],
  "Web Audio": [
    "Web Audio",
    "Web Audio"
  ],
  "Deadline-based timing": [
    "基于结束时刻的计时",
    "基於結束時刻的計時"
  ],
  "Focus and break presets": [
    "专注与休息预设",
    "專注與休息預設"
  ],
  "Pause, resume and daily tally": [
    "暂停、继续与每日计数",
    "暫停、繼續與每日計數"
  ],
  "Pocket Calendar": [
    "便携日历",
    "隨身日曆"
  ],
  "DATES WITH A MEMORY": [
    "为每个日子留一笔",
    "為每個日子留一筆"
  ],
  "Plan by day with a private note saved to this browser.": [
    "按日规划，私人笔记保存在此浏览器中。",
    "按日規劃，私人筆記儲存在此瀏覽器中。"
  ],
  "Browse months, return to today and attach a short note to a calendar date. Notes use local calendar dates and remain on this device; this is a day notebook, not an external calendar integration.": [
    "浏览月份、返回今天，并为某个日期附上简短笔记。笔记按本地日历日期保存于设备中；这是每日记事本，不连接外部日历服务。",
    "瀏覽月份、返回今天，並為某個日期附上簡短筆記。筆記按本地日曆日期保存於設備中；這是每日記事本，不連接外部日曆服務。"
  ],
  "Local dates": [
    "本地日期",
    "本機日期"
  ],
  "Month navigation and today shortcut": [
    "月份导航与返回今天",
    "月份導覽與返回今天"
  ],
  "Notes attached to local dates": [
    "与本地日期关联的笔记",
    "與本地日期關聯的筆記"
  ],
  "Desk Calculator": [
    "桌面计算器",
    "桌面計算器"
  ],
  "WITH PAPER TAPE": [
    "附带计算纸带",
    "附帶計算紙帶"
  ],
  "Make a quick calculation and keep the latest workings in view.": [
    "快速计算，让最近的运算过程一直可见。",
    "快速計算，讓最近的運算過程一直可見。"
  ],
  "A four-function desk calculator with keyboard entry, memory controls and a paper tape of recent calculations. Copy the result and review earlier workings without leaving the desktop.": [
    "四则运算桌面计算器，支持键盘输入、记忆功能和最近计算的纸带记录。无需离开桌面，即可复制结果并查看之前的运算。",
    "四則運算桌面計算器，支持鍵盤輸入、記憶功能和最近計算的紙帶記錄。無需離開桌面，即可複製結果並查看之前的運算。"
  ],
  "Keyboard input": [
    "键盘输入",
    "鍵盤輸入"
  ],
  "Keyboard and memory controls": [
    "键盘输入与记忆功能",
    "鍵盤輸入與記憶功能"
  ],
  "Paper tape and result copying": [
    "计算纸带与结果复制",
    "計算紙帶與結果複製"
  ],
  "Unit Converter": [
    "单位换算器",
    "單位換算器"
  ],
  "MEASURE TWICE": [
    "单位换算，心中有数",
    "單位換算，心中有數"
  ],
  "Convert everyday length, mass, temperature and data units.": [
    "换算常用的长度、质量、温度和数据单位。",
    "換算常用的長度、質量、溫度和資料單位。"
  ],
  "Choose a quantity, select source and destination units, swap the direction and copy the answer. Data sizes use decimal factors: one kilobyte is 1,000 bytes.": [
    "选择物理量、原单位和目标单位，可以交换方向并复制答案。数据容量采用十进制：1 千字节等于 1,000 字节。",
    "選擇物理量、原單位和目標單位，可以交換方向並複製答案。資料容量採用十進制：1 千位元組等於 1,000 位元組。"
  ],
  "Unit conversion": [
    "单位换算",
    "單位換算"
  ],
  "Accessible controls": [
    "无障碍控件",
    "無障礙控制項"
  ],
  "Length, mass, temperature and data": [
    "长度、质量、温度与数据",
    "長度、質量、溫度與資料"
  ],
  "Explicit decimal data units": [
    "明确采用十进制数据单位",
    "明確採用十進制資料單位"
  ],
  "Colour Studio": [
    "色彩工作室",
    "色彩工作室"
  ],
  "COLOUR WITH CONTRAST": [
    "让颜色与对比度一起工作",
    "讓顏色與對比度一起工作"
  ],
  "Build accessible palettes, check contrast and save favourite swatches.": [
    "创建易于阅读的配色，检查对比度并保存常用色样。",
    "建立易於閱讀的配色，檢查對比度並保存常用色樣。"
  ],
  "Compare foreground and background colours, inspect the contrast ratio and keep favourite swatches. The result describes that colour pair; it is not an accessibility audit of an entire interface.": [
    "比较前景色和背景色，查看对比度并保存常用色样。结果只描述这一组颜色，不能代表整个界面的无障碍水平。",
    "比較前景色和背景色，查看對比度並保存常用色樣。結果只描述這一組顏色，不能代表整個介面的無障礙水平。"
  ],
  "Relative luminance": [
    "相对亮度",
    "相對亮度"
  ],
  "Foreground and background comparison": [
    "前景色与背景色比较",
    "前景色與背景色比較"
  ],
  "Contrast ratio and saved swatches": [
    "对比度与色样保存",
    "對比度與色樣保存"
  ],
  "coverd.ai": [
    "coverd.ai",
    "coverd.ai"
  ],
  "RESPONSIBLE RECRUITMENT INTELLIGENCE": [
    "负责任的招聘智能",
    "負責任的招募智能"
  ],
  "COVERD reviews applications from an applicant tracking system and gives recruiters a shortlist with supporting reasons. Recruiters make the final decision.": ["COVERD 审查申请人追踪系统中的申请，并向招聘人员提供附有理由的候选名单。最终决定由招聘人员作出。", "COVERD 審查應徵者追蹤系統中的申請，並向招募人員提供附有理由的候選名單。最終決定由招募人員作出。"],
  "I founded COVERD to help recruiters review applications consistently while retaining the reasons behind each assessment. The product sits over an existing ATS and combines specialist review of skills, experience, domain knowledge, trajectory, communication and culture. Optional automated voice interviews add context, and the system returns a shortlist with supporting reasons for recruiter review.": [
    "我创立 COVERD，帮助招聘人员一致地审阅申请，并保留每项判断的依据。产品连接现有 ATS，综合评估技能、经验、行业知识、职业发展、沟通和文化适配。可选的自动语音面试补充背景信息，系统再提供附有理由的候选名单，供招聘人员审阅。",
    "我創立 COVERD，幫助招募人員一致地審閱申請，並保留每項判斷的依據。產品連接現有 ATS，綜合評估技能、經驗、行業知識、職業發展、溝通和文化適配。可選的自動語音面試補充背景資訊，系統再提供附有理由的候選名單，供招募人員審閱。"
  ],
  "Multi-agent AI": [
    "多智能体 AI",
    "多智慧代理 AI"
  ],
  "ATS integration": [
    "ATS 集成",
    "ATS 集成"
  ],
  "Automated voice interviews": [
    "自动语音面试",
    "自動語音面試"
  ],
  "Evidence synthesis": [
    "信息依据整合",
    "資訊依據整合"
  ],
  "Responsible AI": [
    "负责任的 AI",
    "負責任的 AI"
  ],
  "Six specialist review dimensions": [
    "六个专业审阅维度",
    "六個專業審閱維度"
  ],
  "CV review with optional voice interviews": [
    "简历审阅与可选语音面试",
    "履歷審閱與可選語音面試"
  ],
  "Reasoned shortlists within existing ATS workflows": [
    "在现有 ATS 流程中提供有理由的候选名单",
    "在現有 ATS 流程中提供有理由的候選名單"
  ],
  "Recruiters retain decision authority": [
    "招聘人员保留决策权",
    "招募人員保留決策權"
  ],
  "Candidate records, production prompts and internal implementation remain private.": [
    "候选人记录、生产提示词和内部实现均保持私密。",
    "候選人記錄、生產提示詞和內部實現均保持私密。"
  ],
  "GROWMAT": [
    "GROWMAT",
    "GROWMAT"
  ],
  "INTERNAL ENTERPRISE PRODUCT": [
    "企业内部产品",
    "企業內部產品"
  ],
  "A seven-component workload modelling platform designed to replace a fragile spreadsheet workflow with scheduled calculation, governed editing and live capacity views.": [
    "由七个组件组成的工作量建模平台，以定时计算、受控编辑和实时产能视图替代脆弱的电子表格流程。",
    "由七個元件組成的工作量建模平台，以定時計算、受控編輯和實時產能視圖替代脆弱的電子表格流程。"
  ],
  "GROWMAT replaces a slow, conflict-prone workload spreadsheet with a connected planning system. Scheduled acquisition feeds PostgreSQL; a Julia service calculates workload and due-date projections; a Next.js scheduler supports governed edits; and Spotfire shows capacity, overdue work and future demand. The seven components support a two-hour calculation and visualisation cycle, with backup and recovery tooling for continued operation.": [
    "GROWMAT 用互相连接的规划系统替代缓慢且容易冲突的工作量电子表格。定时采集将数据写入 PostgreSQL；Julia 服务计算工作量和到期时间；Next.js 排程界面支持受控修改；Spotfire 展示产能、逾期任务和未来需求。七个组件每两小时完成一轮计算与可视化，并配备备份和恢复工具以支持持续运行。",
    "GROWMAT 用互相連接的規劃系統替代緩慢且容易衝突的工作量電子表格。定時採集將資料寫入 PostgreSQL；Julia 服務計算工作量和到期時間；Next.js 排程介面支持受控修改；Spotfire 展示產能、逾期任務和未來需求。七個元件每兩小時完成一輪計算與可視化，並配備備份和恢復工具以支持持續執行。"
  ],
  "Next.js": [
    "Next.js",
    "Next.js"
  ],
  "Julia": [
    "Julia",
    "Julia"
  ],
  "PostgreSQL": [
    "PostgreSQL",
    "PostgreSQL"
  ],
  "Docker": [
    "Docker",
    "Docker"
  ],
  "Dataiku": [
    "Dataiku",
    "Dataiku"
  ],
  "Spotfire": [
    "Spotfire",
    "Spotfire"
  ],
  "Ofelia": [
    "Ofelia",
    "Ofelia"
  ],
  "7 interlinked components": [
    "七个互相连接的组件",
    "七個互相連接的元件"
  ],
  "10 source datasets into 11 governed tables": [
    "十个来源数据集汇入十一张受控数据表",
    "十個來源資料集匯入十一張受控資料表"
  ],
  "Two-hour calculation and visualisation refresh": [
    "每两小时刷新计算与可视化",
    "每兩小時刷新計算與可視化"
  ],
  "Daily backup with 180-day retention": [
    "每日备份，保留 180 天",
    "每日備份，保留 180 天"
  ],
  "The original product showcase is available here. Live business data, credentials and source code remain private.": [
    "这里提供原始产品展示。实时业务数据、凭据和源代码均保持私密。",
    "這裡提供原始產品展示。實時業務資料、憑據和原始碼均保持私密。"
  ],
  "Open the original GROWMAT showcase PDF": [
    "打开 GROWMAT 原始展示 PDF",
    "打開 GROWMAT 原始展示 PDF"
  ],
  "Insurance Lead-Market Matching": [
    "保险承保市场匹配",
    "保險承保市場匹配"
  ],
  "APPLIED AI FOR INSURANCE PLACEMENT": [
    "面向保险承保安排的应用 AI",
    "面向保險承保安排的應用 AI"
  ],
  "Decision support for brokers comparing candidate markets through risk ranking, historical placement patterns and policy-wording analysis.": [
    "通过风险排序、历史承保模式和保单条款分析，帮助经纪人比较候选承保市场。",
    "透過風險排序、歷史承保模式和保單條款分析，幫助經紀人比較候選承保市場。"
  ],
  "LightGBM / LambdaRank": [
    "LightGBM / LambdaRank",
    "LightGBM / LambdaRank"
  ],
  "Python + FastAPI": [
    "Python + FastAPI",
    "Python + FastAPI"
  ],
  "React + TypeScript": [
    "React + TypeScript",
    "React + TypeScript"
  ],
  "Node / Express": [
    "Node / Express",
    "Node / Express"
  ],
  "Temporal validation": [
    "按时间切分验证",
    "按時間切分驗證"
  ],
  "Empirical Bayes": [
    "经验贝叶斯",
    "經驗貝氏"
  ],
  "Temporal learning-to-rank for risk and market pairs": [
    "针对风险与市场组合的时间序列学习排序",
    "針對風險與市場組合的時間序列學習排序"
  ],
  "Historical placement context and cold-start fallbacks": [
    "历史承保背景与冷启动处理",
    "歷史承保背景與冷啟動處理"
  ],
  "Market-specific wording comparison": [
    "面向具体市场的条款比较",
    "面向具體市場的條款比較"
  ],
  "Confidence, missing information and broker review": [
    "置信度、缺失信息与经纪人审阅",
    "信心度、缺失資訊與經紀人審閱"
  ],
  "All displayed risks, markets and scores are fictional. Client placements, policy documents and trained models remain private.": [
    "显示的风险、市场和分数均为虚构。客户承保记录、保单文件和训练后的模型保持私密。",
    "顯示的風險、市場和分數均為虛構。客戶承保記錄、保單文件和訓練後的模型保持私密。"
  ],
  "Applied AI": [
    "应用人工智能",
    "應用人工智慧"
  ],
  "Research": [
    "研究",
    "研究"
  ],
  "CV Keyword Automator": [
    "简历关键词自动化",
    "履歷關鍵詞自動化"
  ],
  "DOCUMENT INTELLIGENCE WORKFLOW": [
    "智能文档工作流",
    "智能文檔工作流"
  ],
  "Review how a CV supports a job’s requirements before preparing an application.": ["准备求职申请前，检查简历中的经历如何支持岗位要求。", "準備求職申請前，檢查履歷中的經歷如何支持職位要求。"],
  "I built a Python workflow that extracts job requirements, selects a pre-authored CV template and compiles a PDF with LaTeX. The browser demo uses fictional text to show which suggested changes the sample CV supports.": ["我开发了 Python 工作流，提取岗位要求、选择预先编写的简历模板，并用 LaTeX 编译 PDF。浏览器演示使用虚构文本，展示示例简历支持哪些修改建议。", "我開發了 Python 工作流程，擷取職位要求、選擇預先編寫的履歷範本，並用 LaTeX 編譯 PDF。瀏覽器示範使用虛構文字，展示範例履歷支持哪些修改建議。"],
  "Python": [
    "Python",
    "Python"
  ],
  "NLP": [
    "NLP",
    "NLP"
  ],
  "LaTeX": [
    "LaTeX",
    "LaTeX"
  ],
  "Document generation": [
    "文档生成",
    "文檔生成"
  ],
  "Role-specific CV templates": [
    "针对不同岗位的简历模板",
    "針對不同職缺的履歷模板"
  ],
  "Job-language extraction and document compilation": [
    "岗位用语提取与文档编译",
    "職缺用語提取與文檔編譯"
  ],
  "Interactive review of supporting experience": [
    "交互核对相关经历",
    "互動核對相關經歷"
  ],
  "The demo uses invented text. Original CVs, applications and personal files are never shipped.": [
    "演示使用虚构文本，不包含原始简历、申请材料或个人文件。",
    "示範使用虛構文字，不包含原始履歷、申請材料或個人檔案。"
  ],
  "Im I Broke?": [
    "Im I Broke?",
    "Im I Broke?"
  ],
  "FastAPI": [
    "FastAPI",
    "FastAPI"
  ],
  "React": [
    "React",
    "React"
  ],
  "SQLite": [
    "SQLite",
    "SQLite"
  ],
  "Statement parsers": [
    "账单解析器",
    "帳單解析器"
  ],
  "Reconciliation": [
    "账目核对",
    "帳目核對"
  ],
  "Transfer matching": [
    "转账匹配",
    "轉帳匹配"
  ],
  "The demo uses fictional transactions and account labels. No personal statements or bank identifiers are published.": [
    "演示使用虚构交易和账户名称，不发布个人账单或银行标识。",
    "演示使用虛構交易和帳戶名稱，不發佈個人帳單或銀行標識。"
  ],
  "COVERD-YASA Scheduling": [
    "COVERD-YASA 排期",
    "COVERD-YASA 排期"
  ],
  "YASA": [
    "YASA",
    "YASA"
  ],
  "TEAM SCHEDULING AND BOOKING": [
    "团队排期与预约",
    "團隊排期與預約"
  ],
  "A self-hosted scheduling platform with four allocation modes, timezone-safe availability, calendar sync and race-resistant booking.": [
    "自托管预约平台，提供四种分配方式、正确换算时区的可用时间、日历同步与并发预约防护。",
    "自架預約平台，提供四種分配方式、正確換算時區的可預約時間、行事曆同步與併發預約防護。"
  ],
  "I built a self-hosted booking product with individual, weighted round-robin, collective and first-available allocation. Host-local working hours, calendar conflicts, buffers, notice periods and daily caps determine which times are offered. A UTC reservation and final database conflict check protect confirmation from competing bookings. Microsoft Graph and Teams integration, email, ICS invitations and signed management links support the wider booking lifecycle. The browser uses fictional calendars to make those scheduling decisions explorable. The reservation uses a canonical UTC key with a ten-minute expiry; a database overlap constraint provides a second safeguard against simultaneous bookings.": [
    "我构建了自托管预约产品，支持个人、加权轮询、集体和首位可用四种分配方式。主持人的本地工作时段、日历冲突、缓冲时间、提前通知和每日上限共同决定可选时间。UTC 预留和最终数据库冲突检查避免竞争预订。Microsoft Graph 与 Teams、电子邮件、ICS 邀请和签名管理链接支持完整预约流程。浏览器使用虚构日历，让排期决策可以交互探索。预留使用统一的 UTC 键，十分钟后到期；数据库的时间重叠约束提供第二层保护，防止并发预约冲突。",
    "我建置了自代管預約產品，支持個人、加權輪詢、集體和首位可用四種分配方式。主持人的本地工作時段、日曆衝突、緩衝時間、提前通知和每日上限共同決定可選時間。UTC 預留和最終資料庫衝突檢查避免競爭預約。Microsoft Graph 與 Teams、電子郵件、ICS 邀請和簽名管理連結支持完整預約流程。瀏覽器使用虛構日曆，讓排期決策可以互動探索。預留使用統一的 UTC 鍵，十分鐘後到期；資料庫的時間重疊約束提供第二層保護，防止並行預約衝突。"
  ],
  "Microsoft Graph": [
    "Microsoft Graph",
    "Microsoft Graph"
  ],
  "Redis": [
    "Redis",
    "Redis"
  ],
  "Four host-allocation modes": [
    "四种主持人分配方式",
    "四種主持人分配方式"
  ],
  "Time-zone, daylight-saving and buffer-aware availability": [
    "考虑时区、夏令时和缓冲的可用时间",
    "考慮時區、夏令時和緩衝的可用時間"
  ],
  "Reservations and final overlap checks": [
    "时间预留与最终重叠检查",
    "時間預留與最終重疊檢查"
  ],
  "Calendar events, invitations and booking-management links": [
    "日历事件、邀请和预约管理链接",
    "日曆事件、邀請和預約管理連結"
  ],
  "The interactive example uses fictional people and calendars and sends no bookings or messages.": [
    "交互示例使用虚构人物和日历，不发送预约或消息。",
    "互動示例使用虛構人物和日曆，不發送預約或消息。"
  ],
  "Systems": [
    "系统",
    "系統"
  ],
  "Parliamo! Italian Learning Portal": [
    "Parliamo! 意大利语学习门户",
    "Parliamo! 意大利語學習門戶"
  ],
  "Parliamo!": [
    "Parliamo!",
    "Parliamo!"
  ],
  "A DAILY ITALIAN LEARNING ROUTINE": [
    "每天都能坚持的意大利语学习",
    "每天都能堅持的意大利語學習"
  ],
  "A bilingual Italian A1 portal that turns a 56-day curriculum into daily lessons, adaptive practice and spaced vocabulary review.": [
    "双语意大利语 A1 门户，将 56 天课程变成每日学习、自适应练习和间隔词汇复习。",
    "雙語意大利語 A1 門戶，將 56 天課程變成每日學習、自適應練習和間隔詞彙複習。"
  ],
  "I organised a 5,070-minute study plan into 56 daily agendas and 28 lesson hubs, supported by a 753-record content library. The portal combines exercises, vocabulary recall, writing, speech and recording work with progress across listening, reading, interaction, spoken production and writing. Local caching keeps practice usable offline, while revision checks help recover synchronisation conflicts. The browser uses example attempts to demonstrate the learning and recovery workflows; its task-coverage feedback is not a judgement of language correctness. The full product records actual study time, confidence and checkpoints alongside seven mastery dimensions. Four-way recall feedback updates review intervals, and a recoverable HTTP 409/rebase flow protects offline edits; daily SQLite backups and integrity checks support persistence.": [
    "我将 5,070 分钟学习计划编排为 56 份每日安排和 28 个课程中心，并建立包含 753 条记录的内容库。门户将练习、词汇复习、写作、口语和录音任务结合起来，分别跟踪听力、阅读、互动、口语表达和写作。本地缓存支持离线练习，版本检查帮助恢复同步冲突。浏览器以示例作答展示学习与恢复流程；任务覆盖反馈不等同于语言正确性判断。完整产品还记录实际学习时长、信心和检查点，并维护七个掌握度维度。四档回忆反馈更新复习间隔，可恢复的 HTTP 409 冲突与重新合并流程保护离线编辑；每日 SQLite 备份和完整性检查支持数据持久保存。",
    "我將 5,070 分鐘學習計劃編排為 56 份每日安排和 28 個課程中心，並建立包含 753 條記錄的內容庫。門戶將練習、詞彙複習、寫作、口語和錄音任務結合起來，分別跟蹤聽力、閱讀、互動、口語表達和寫作。本地快取支持離線練習，版本檢查幫助恢復同步衝突。瀏覽器以示例作答展示學習與恢復流程；任務覆蓋回饋不等同於語言正確性判斷。完整產品還記錄實際學習時長、信心和檢查點，並維護七個掌握度維度。四級回憶回饋更新複習間隔，可恢復的 HTTP 409 衝突與重新合併流程保護離線編輯；每日 SQLite 備份和完整性檢查支援資料持久保存。"
  ],
  "React 19": [
    "React 19",
    "React 19"
  ],
  "Vinext": [
    "Vinext",
    "Vinext"
  ],
  "Cloudflare D1": [
    "Cloudflare D1",
    "Cloudflare D1"
  ],
  "Drizzle ORM": [
    "Drizzle ORM",
    "Drizzle ORM"
  ],
  "Spaced repetition": [
    "间隔复习",
    "間隔複習"
  ],
  "56 days and 5,070 planned study minutes": [
    "56 天、5,070 分钟计划学习时间",
    "56 天、5,070 分鐘計劃學習時間"
  ],
  "753 content records, including 211 exercises and 360 vocabulary cards": [
    "753 条内容，包括 211 道练习和 360 张词汇卡",
    "753 條內容，包括 211 道練習和 360 張詞彙卡"
  ],
  "Progress across five language skills": [
    "五项语言技能的进度跟踪",
    "五項語言技能的進度跟蹤"
  ],
  "Offline practice and conflict recovery": [
    "离线练习与冲突恢复",
    "離線練習與衝突恢復"
  ],
  "The example uses disposable learner state. Personal study history, recordings and underlying course materials remain private.": [
    "示例使用可丢弃的学习状态。个人学习记录、录音和原始课程材料保持私密。",
    "示例使用可丟棄的學習狀態。個人學習記錄、錄音和原始課程材料保持私密。"
  ],
  "Open the Italian practice workbook": [
    "打开意大利语练习册",
    "打開意大利語練習冊"
  ],
  "Open the bilingual reading workbook": [
    "打开双语阅读练习册",
    "打開雙語閱讀練習冊"
  ],
  "Course Recommendation Prototype": [
    "课程推荐原型",
    "課程推薦原型"
  ],
  "Course Recommender": [
    "课程推荐",
    "課程推薦"
  ],
  "PREFERENCE-BASED COURSE DISCOVERY": [
    "依据偏好的课程探索",
    "依據偏好的課程探索"
  ],
  "Redis / RQ": [
    "Redis / RQ",
    "Redis / RQ"
  ],
  "Docker Compose": [
    "Docker Compose",
    "Docker Compose"
  ],
  "Explainable scoring": [
    "可解释评分",
    "可解釋評分"
  ],
  "Four-step learner-preference flow": [
    "四步学习偏好流程",
    "四步學習偏好流程"
  ],
  "Six example courses with preference filters": [
    "六门示例课程与偏好筛选",
    "六門示例課程與偏好篩選"
  ],
  "Repeatable random and weighted comparisons": [
    "可重复的随机与加权比较",
    "可重複的隨機與加權比較"
  ],
  "Visible score contributions and sensitivity to one changed preference": [
    "可见的分数贡献及单项偏好敏感性",
    "可見的分數貢獻及單項偏好敏感性"
  ],
  "The demo uses example courses and non-identifying preferences. It does not save a learner profile; the linked public code has no explicit licence.": [
    "演示使用示例课程和不含身份信息的偏好，不保存学习者档案；链接的公开代码没有明确许可。",
    "演示使用示例課程和不含身份資訊的偏好，不保存學習者檔案；連結的公開程式碼沒有明確許可。"
  ],
  "Archive": [
    "已归档",
    "已歸檔"
  ],
  "STUDY-RL": [
    "STUDY-RL",
    "STUDY-RL"
  ],
  "REINFORCEMENT LEARNING + LLM POST-TRAINING": [
    "强化学习与大语言模型后训练",
    "強化學習與大語言模型後訓練"
  ],
  "A practical curriculum connecting reinforcement-learning mathematics, working algorithms and language-model post-training.": [
    "连接强化学习数学、可运行算法和语言模型后训练的实践课程。",
    "連接強化學習數學、可執行演算法和語言模型後訓練的實踐課程。"
  ],
  "PyTorch": [
    "PyTorch",
    "PyTorch"
  ],
  "Jupyter": [
    "Jupyter",
    "Jupyter"
  ],
  "Gymnasium": [
    "Gymnasium",
    "Gymnasium"
  ],
  "LoRA": [
    "LoRA",
    "LoRA"
  ],
  "SFT": [
    "SFT",
    "SFT"
  ],
  "DPO": [
    "DPO",
    "DPO"
  ],
  "pytest": [
    "pytest",
    "pytest"
  ],
  "25 modules with executable notebooks and teaching guides": [
    "25 个模块，配有可执行笔记本和教学指南",
    "25 個模組，配有可執行筆記本和教學指南"
  ],
  "64 worked examples and 75 self-checks": [
    "64 个例题与 75 项自测",
    "64 個例題與 75 項自測"
  ],
  "Live Q-learning, SARSA, LoRA and DPO exercises": [
    "实时 Q-learning、SARSA、LoRA 和 DPO 练习",
    "實時 Q-learning、SARSA、LoRA 和 DPO 練習"
  ],
  "32 recorded before-and-after fine-tuning answers": [
    "32 组微调前后的记录答案",
    "32 組微調前後的記錄答案"
  ],
  "Curriculum syllabus": [
    "课程大纲",
    "課程大綱"
  ],
  "Sequential Decisions Lab": [
    "序贯决策实验室",
    "序貫決策實驗室"
  ],
  "Bandit Lab": [
    "多臂老虎机实验室",
    "多臂老虎機實驗室"
  ],
  "EXPLORATION × EXPLOITATION": [
    "探索与利用",
    "探索與利用"
  ],
  "A browser-native policy laboratory for seeing how epsilon-greedy, UCB1 and Beta-Bernoulli Thompson Sampling learn from uncertain rewards.": [
    "浏览器策略实验室，展示 epsilon-greedy、UCB1 和 Beta-Bernoulli Thompson Sampling 如何从不确定奖励中学习。",
    "瀏覽器策略實驗室，展示 epsilon-greedy、UCB1 和 Beta-Bernoulli Thompson Sampling 如何從不確定獎勵中學習。"
  ],
  "This companion to STUDY-RL turns exploration and exploitation into a step-by-step experiment. Visitors replay seeded Bernoulli or Gaussian reward environments, inspect policy choices and updated estimates, and compare epsilon-greedy, UCB1 and Thompson Sampling across twelve paired synthetic runs. Separate regret traces distinguish the expected cost of an action from the noise in the realised rewards. The calculation keeps action-path pseudo-regret separate from realised counterfactual regret, with forced initial observations and incremental value updates available step by step.": [
    "这项 STUDY-RL 配套工具把探索与利用变为逐步实验。访客可以重放带种子的 Bernoulli 或 Gaussian 奖励环境，检查策略选择与估计更新，并在十二组配对合成实验中比较 epsilon-greedy、UCB1 和 Thompson Sampling。分开的遗憾曲线区分动作的期望代价与实际奖励的随机波动。计算将动作路径伪遗憾与已实现的反事实遗憾分开，并逐步展示强制初始观测和增量价值更新。",
    "這項 STUDY-RL 配套工具把探索與利用變為逐步實驗。訪客可以重放帶種子的 Bernoulli 或 Gaussian 獎勵環境，檢查策略選擇與估計更新，並在十二組配對合成實驗中比較 epsilon-greedy、UCB1 和 Thompson Sampling。分開的遺憾曲線區分動作的期望代價與實際獎勵的隨機波動。計算將動作路徑偽遺憾與已實現的反事實遺憾分開，並逐步展示強制初始觀測和增量價值更新。"
  ],
  "Reinforcement learning": [
    "强化学习",
    "強化學習"
  ],
  "Epsilon-greedy": [
    "ε-贪心",
    "ε-貪心"
  ],
  "UCB1": [
    "UCB1",
    "UCB1"
  ],
  "Thompson Sampling": [
    "Thompson 采样",
    "Thompson 取樣"
  ],
  "Step through seeded policy decisions": [
    "逐步检查带种子的策略决策",
    "逐步檢查帶種子的策略決策"
  ],
  "Compare expected and realised reward gaps": [
    "比较期望奖励差距与实际奖励差距",
    "比較期望獎勵差距與實際獎勵差距"
  ],
  "Twelve paired policy-comparison runs": [
    "十二组配对策略比较",
    "十二組配對策略比較"
  ],
  "Inspect estimates and updates after each action": [
    "检查每次动作后的估计与更新",
    "檢查每次動作後的估計與更新"
  ],
  "All arms, probabilities and rewards are fictional and generated locally for learning.": [
    "所有选项、概率和奖励均为虚构，并在本地生成用于学习。",
    "所有選項、機率和獎勵均為虛構，並在本地生成用於學習。"
  ],
  "Microrobot Pose & Depth": [
    "微型机器人姿态与深度",
    "微型機器人姿態與深度"
  ],
  "COMPUTER VISION MODEL STUDY": [
    "计算机视觉模型研究",
    "計算機視覺模型研究"
  ],
  "I built a custom CNN and adapted ResNet18, ResNet34, MobileNetV3 and ViT to predict 40 pitch–roll classes or a continuous depth value from 224×224 images. The developed residual CNN has 4,154,856 pose-classification parameters. The interactive architecture view follows features through each model and changes the output head between tasks. Saved microscopy, pose predictions and Grad-CAM maps help explain the results. The original image-level split can mix related frames between training and testing; a fictional sequence exercise shows why unseen recordings provide a stronger evaluation. The model atlas distinguishes partially pretrained and newly initialised layers, and compares declared tensor shapes and parameter counts with older saved checkpoints.": [
    "我构建了自定义 CNN，并将 ResNet18、ResNet34、MobileNetV3 和 ViT 改造为从 224×224 图像预测 40 种俯仰—横滚类别或连续深度值。开发后的残差 CNN 姿态分类模型包含 4,154,856 个参数。交互架构视图沿各模型追踪特征，并可切换两种任务的输出头。保存的显微图像、姿态预测和 Grad-CAM 图帮助解释结果。原有按图像切分可能把相关帧分散到训练集和测试集；虚构序列实验说明为何完整未见过的录像能提供更有力的评估。模型图谱区分部分预训练层与新初始化层，并将定义中的张量形状和参数量与较早保存的检查点比较。",
    "我建置了自訂 CNN，並將 ResNet18、ResNet34、MobileNetV3 和 ViT 改造為從 224×224 圖像預測 40 種俯仰—橫滾類別或連續深度值。開發後的殘差 CNN 姿態分類模型包含 4,154,856 個參數。互動架構視圖沿各模型追蹤特徵，並可切換兩種任務的輸出頭。保存的顯微圖像、姿態預測和 Grad-CAM 圖幫助解釋結果。原有按圖像切分可能把相關影格分散到訓練集和測試集；虛構序列實驗說明為何完整未見過的錄影能提供更有力的評估。模型圖譜區分部分預訓練層與新初始化層，並將定義中的張量形狀和參數量與較早保存的檢查點比較。"
  ],
  "ResNet": [
    "ResNet",
    "ResNet"
  ],
  "MobileNet": [
    "MobileNet",
    "MobileNet"
  ],
  "ViT": [
    "ViT",
    "ViT"
  ],
  "Grad-CAM": [
    "Grad-CAM",
    "Grad-CAM"
  ],
  "Custom residual CNN and four pretrained-model adaptations": [
    "自定义残差 CNN 与四种预训练模型改造",
    "自訂殘差 CNN 與四種預訓練模型改造"
  ],
  "40 orientation classes and continuous depth estimation": [
    "40 种方向类别与连续深度估计",
    "40 種方向類別與連續深度估計"
  ],
  "Interactive model stages, shapes and parameter counts": [
    "交互查看模型阶段、形状和参数数量",
    "互動查看模型階段、形狀和參數數量"
  ],
  "Same-image pose/depth Grad-CAM comparison": [
    "同一图像的姿态与深度 Grad-CAM 比较",
    "同一圖像的姿態與深度 Grad-CAM 比較"
  ],
  "Selected recorded microscopy and response maps are shown alongside illustrative diagrams. Full datasets and trained weights remain private.": [
    "展示部分记录的显微图像与响应图，并配合说明性示意图。完整数据集和训练权重保持私密。",
    "展示部分記錄的顯微圖像與響應圖，並配合說明性示意圖。完整資料集和訓練權重保持私密。"
  ],
  "Machine Learning": [
    "机器学习",
    "機器學習"
  ],
  "Trustworthy MRI Reconstruction": [
    "可信 MRI 重建",
    "可信 MRI 重建"
  ],
  "MRI Trust Lab": [
    "MRI 可信性实验室",
    "MRI 可信性實驗室"
  ],
  "UNCERTAINTY-AWARE MEDICAL IMAGING": [
    "考虑不确定性的医学影像",
    "考慮不確定性的醫學影像"
  ],
  "I designed a four-level residual U-Net with three learnable soft data-consistency steps for retrospectively undersampled cardiac MRI. The study compares MC-dropout and deep ensembles, tests adversarial perturbations and MR-to-CT shift, and measures the effect on eight-class segmentation. At R=4×, the reported reconstruction reaches 31.90 dB PSNR and 0.889 SSIM. Synthetic browser experiments connect acquisition budget, error distribution and uncertainty ranking to the resulting measures. Training used Optuna-selected loss and dropout settings; robustness tests include single-step FGSM and iterative PGD attacks, measured against the zero-filled baseline.": [
    "我为回顾性欠采样心脏 MRI 设计了四层残差 U-Net 和三个可学习的软数据一致性步骤。研究比较 MC-dropout 与深度集成，测试对抗扰动和 MR 到 CT 的分布变化，并衡量对八类分割的影响。在 R=4× 时，报告的重建结果达到 31.90 dB PSNR 和 0.889 SSIM。浏览器合成实验将采集预算、误差分布和不确定性排序与相应指标联系起来。训练采用 Optuna 选择的损失和 dropout 设置；稳健性测试包括单步 FGSM 与迭代 PGD 攻击，并与零填充基线比较。",
    "我為回顧性欠取樣心臟 MRI 設計了四層殘差 U-Net 和三個可學習的軟資料一致性步驟。研究比較 MC-dropout 與深度集成，測試對抗擾動和 MR 到 CT 的分布變化，並衡量對八類分割的影響。在 R=4× 時，報告的重建結果達到 31.90 dB PSNR 和 0.889 SSIM。瀏覽器合成實驗將採集預算、誤差分布和不確定性排序與相應指標聯繫起來。訓練採用 Optuna 選擇的損失和 dropout 設定；穩健性測試包括單步 FGSM 與迭代 PGD 攻擊，並與零填充基線比較。"
  ],
  "U-Net": [
    "U-Net",
    "U-Net"
  ],
  "FFT / k-space": [
    "FFT / k 空间",
    "FFT / k 空間"
  ],
  "MC Dropout": [
    "MC Dropout",
    "MC Dropout"
  ],
  "Deep Ensembles": [
    "深度集成",
    "深度集成"
  ],
  "Optuna": [
    "Optuna",
    "Optuna"
  ],
  "7,756,580-parameter residual U-Net + three soft-DC scalars": [
    "7,756,580 参数残差 U-Net 与三个软数据一致性标量",
    "7,756,580 參數殘差 U-Net 與三個軟資料一致性純量"
  ],
  "31.90 dB PSNR and 0.889 SSIM at R=4×": [
    "R=4× 时 PSNR 31.90 dB、SSIM 0.889",
    "R=4× 時 PSNR 31.90 dB、SSIM 0.889"
  ],
  "Soft-DC ablation causes an 8.1 dB collapse": [
    "移除软数据一致性后下降 8.1 dB",
    "移除軟資料一致性後下降 8.1 dB"
  ],
  "Ensemble ECE 0.017; MC Dropout error correlation r=0.590": [
    "集成 ECE 0.017；MC Dropout 误差相关系数 r=0.590",
    "集成 ECE 0.017；MC Dropout 誤差相關係數 r=0.590"
  ],
  "92% downstream Dice preservation at R=4×": [
    "R=4× 时保留下游 Dice 的 92%",
    "R=4× 時保留下游 Dice 的 92%"
  ],
  "The demo includes a saved reconstruction figure from the public study repository, reported aggregate results and synthetic illustrations. It does not load raw MRI datasets or trained model weights. This educational research demonstration is not a diagnostic tool. The linked public code has no explicit licence.": [
    "演示包含来自公开研究仓库的已保存重建图、报告中的汇总结果和合成示意。它不会加载原始 MRI 数据集或已训练模型的权重。这是教学研究演示，并非诊断工具。链接中的公开代码没有明确许可。",
    "示範包含來自公開研究儲存庫的已儲存重建圖、報告中的彙總結果和合成示意。它不會載入原始 MRI 資料集或已訓練模型的權重。這是教學研究示範，並非診斷工具。連結中的公開程式碼沒有明確授權。"
  ],
  "Neural CFD Surrogates": [
    "神经网络 CFD 代理模型",
    "神經網路 CFD 代理模型"
  ],
  "CFD × 3": [
    "CFD × 3",
    "CFD × 3"
  ],
  "FNO × MESHGRAPHNET × U-NET": [
    "FNO × MESHGRAPHNET × U-NET",
    "FNO × MESHGRAPHNET × U-NET"
  ],
  "I completed and trained three neural approaches to predicting velocity and pressure. The Fourier operator maps ten input frames to ten future frames, MeshGraphNet predicts repeatedly on the original mesh, and U-Net predicts the next rasterised field. The browser explains their representations with an animated Fourier walkthrough, graph processors and selectable skip connections. Saved GNN sequences include 20 rollout frames and 30 simulation frames showing horizontal velocity, vertical velocity and pressure. Runs use different evaluation conditions, including a shifted U-Net result, so they do not form a common accuracy ranking. The architecture atlas also reconciles tensor shapes and checkpoint compatibility, keeping saved results attached to the implementation and evaluation conditions that produced them.": [
    "我完成并训练了三种预测速度和压力的神经网络方法。Fourier 算子把十帧输入映射为未来十帧，MeshGraphNet 在原始网格上反复预测，U-Net 则预测下一帧栅格化场。浏览器通过 Fourier 动画、图处理模块和可选跳跃连接解释表示方式。保存的 GNN 序列包含 20 帧递推预测与 30 帧模拟，展示水平速度、垂直速度和压力。各实验评估条件不同，U-Net 还使用了发生分布变化的数据，因此这些结果不能构成统一的准确度排名。架构图谱还核对张量形状与检查点兼容性，使保存的结果始终对应到产生它们的实现和评估条件。",
    "我完成並訓練了三種預測速度和壓力的神經網路方法。Fourier 算子把十影格輸入映射為未來十影格，MeshGraphNet 在原始網格上反覆預測，U-Net 則預測下一影格柵格化場。瀏覽器透過 Fourier 動畫、圖處理模組和可選跳躍連接解釋表示方式。保存的 GNN 序列包含 20 個遞推預測影格與 30 個模擬影格，展示水平速度、垂直速度和壓力。各實驗評估條件不同，U-Net 還使用了發生分布變化的資料，因此這些結果不能構成統一的準確度排名。架構圖譜還核對張量形狀與檢查點相容性，使保存的結果始終對應到產生它們的實作和評估條件。"
  ],
  "FNO": [
    "FNO",
    "FNO"
  ],
  "MeshGraphNet": [
    "MeshGraphNet",
    "MeshGraphNet"
  ],
  "CFD": [
    "CFD",
    "CFD"
  ],
  "Baseline FNO: 3.99M parameters, relative L2 0.0163": [
    "基线 FNO：399 万参数，相对 L2 误差 0.0163",
    "基線 FNO：399 萬參數，相對 L2 誤差 0.0163"
  ],
  "MeshGraphNet: 8,323 parameters, relative L2 0.0165": [
    "MeshGraphNet：8,323 参数，相对 L2 误差 0.0165",
    "MeshGraphNet：8,323 參數，相對 L2 誤差 0.0165"
  ],
  "U-Net: 50.54M parameters and a separate shifted evaluation": [
    "U-Net：5,054 万参数，使用单独的分布变化评估",
    "U-Net：5,054 萬參數，使用單獨的分布變化評估"
  ],
  "Vertical-velocity playback and same-sequence frame comparison": [
    "垂直速度播放与同序列帧比较",
    "垂直速度播放與同序列影格比較"
  ],
  "Residual and multi-scale Fourier design experiments": [
    "残差与多尺度 Fourier 设计实验",
    "殘差與多尺度 Fourier 設計實驗"
  ],
  "Selected recorded fields and model diagrams are available here. Full simulation datasets and trained weights remain private.": [
    "这里提供部分记录场和模型示意图。完整模拟数据集和训练权重保持私密。",
    "這裡提供部分記錄場和模型示意圖。完整模擬資料集和訓練權重保持私密。"
  ],
  "Precomputed coloured flow field around a cylinder and downstream wake": [
    "预先计算的圆柱周围及下游尾流彩色流场",
    "預先計算的圓柱周圍及下游尾流彩色流場"
  ],
  "Precomputed cylinder-wake field from the FNO experiment · qualitative view": [
    "FNO 实验中预先计算的圆柱尾流场 · 定性视图",
    "FNO 實驗中預先計算的圓柱尾流場 · 定性視圖"
  ],
  "Air-Quality Sensor Optimisation": [
    "空气质量传感器优化",
    "空氣品質感測器最佳化"
  ],
  "Air Quality ML": [
    "空气质量机器学习",
    "空氣品質機器學習"
  ],
  "COST-AWARE REGRESSION": [
    "考虑成本的回归",
    "考慮成本的迴歸"
  ],
  "Predicting carbon-monoxide concentration while balancing regression accuracy, interpretability and a hypothetical sensor budget.": [
    "预测一氧化碳浓度，同时平衡回归精度、可解释性和假设的传感器预算。",
    "預測一氧化碳濃度，同時平衡迴歸精度、可解釋性和假設的感測器預算。"
  ],
  "I used 7,674 ambient observations to predict CO(GT) from eleven sensor and environmental signals. Imputation and scaling were fitted on the training partition before comparing OLS, Ridge, LASSO and polynomial and RBF kernel models. A later exercise connects selected signals with assumed hardware prices. The browser presents the five recorded models and lets visitors explore sensor-cost and interpretability choices. The random 80/20 split does not establish performance at a future time or a new site.": [
    "我使用 7,674 次环境观测，根据十一项传感器及环境信号预测 CO(GT)。在训练集上拟合缺失值填补与缩放，再比较 OLS、Ridge、LASSO、多项式和 RBF 核模型。后续练习将选定信号与假设硬件价格连接起来。浏览器展示五种记录模型，并支持探索传感器成本和可解释性选择。随机 80/20 切分不能证明未来时间或新地点的性能。",
    "我使用 7,674 次環境觀測，根據十一項感測器及環境訊號預測 CO(GT)。在訓練集上擬合缺失值填補與縮放，再比較 OLS、Ridge、LASSO、多項式和 RBF 核模型。後續練習將選定訊號與假設硬體價格連接起來。瀏覽器展示五種記錄模型，並支持探索感測器成本和可解釋性選擇。隨機 80/20 切分不能證明未來時間或新地點的性能。"
  ],
  "scikit-learn": [
    "scikit-learn",
    "scikit-learn"
  ],
  "KNN imputation": [
    "KNN 缺失值填补",
    "KNN 缺失值填補"
  ],
  "Ridge / LASSO": [
    "Ridge / LASSO",
    "Ridge / LASSO"
  ],
  "Kernel ridge": [
    "核岭回归",
    "核嶺迴歸"
  ],
  "Data preparation": [
    "数据准备",
    "資料準備"
  ],
  "7,674 observations: 6,139 training and 1,535 test": [
    "7,674 次观测：6,139 条训练、1,535 条测试",
    "7,674 次觀測：6,139 條訓練、1,535 條測試"
  ],
  "Training-only imputation and scaling": [
    "仅在训练集拟合填补与缩放",
    "僅在訓練集擬合填補與縮放"
  ],
  "Five regression-model comparisons": [
    "五种回归模型比较",
    "五種迴歸模型比較"
  ],
  "Illustrative sensor-cost and interpretability trade-offs": [
    "说明性的传感器成本与可解释性权衡",
    "說明性的感測器成本與可解釋性權衡"
  ],
  "Recorded coursework results and illustrative cost assumptions are labelled separately. Raw observations are not included.": [
    "课程记录结果与说明性成本假设分别标注，不包含原始观测数据。",
    "課程記錄結果與說明性成本假設分別標註，不包含原始觀測資料。"
  ],
  "Cost-Sensitive Cyber Detection": [
    "成本敏感的网络威胁检测",
    "成本敏感的網路威脅檢測"
  ],
  "Cyber Detection": [
    "网络威胁检测",
    "網路威脅檢測"
  ],
  "NETWORK-FLOW CLASSIFICATION": [
    "网络流量分类",
    "網路流量分類"
  ],
  "Comparing network-flow classifiers and alert thresholds when missed attacks and false alarms carry different costs.": [
    "在漏报攻击与误报成本不同的情况下，比较网络流量分类器与告警阈值。",
    "在漏報攻擊與誤報成本不同的情況下，比較網路流量分類器與告警閾值。"
  ],
  "I compared logistic and kernel classifiers, ROC behaviour and an expected-cost threshold model on 10,000 labelled network-flow rows. The work illustrates how operational priorities change the alert threshold. Later review found 4,904 duplicate rows beyond their first occurrence and 54.2% exact test-to-training overlap, alongside preprocessing and threshold-selection leakage. The recorded curves therefore explain the historical workflow, but require a clean, separate evaluation before they can support a detection-performance claim. A valid rerun needs deduplication or grouped splitting, transforms fitted only on training data, threshold choice on validation data and an untouched final test.": [
    "我在 10,000 条标记网络流量记录上比较逻辑回归与核分类器、ROC 表现和期望成本阈值模型，展示业务优先级如何改变告警阈值。后续检查发现首次出现之外还有 4,904 条重复记录，测试集与训练集精确重叠达到 54.2%，同时存在预处理和阈值选择泄漏。因此记录曲线可以解释当时的流程，但要支持检测性能结论，仍需干净、独立的评估。有效的重跑需要去重或按组划分，仅在训练数据上拟合变换，在验证数据上选择阈值，并保留未经使用的最终测试集。",
    "我在 10,000 條標記網路流量記錄上比較邏輯迴歸與核分類器、ROC 表現和期望成本閾值模型，展示業務優先級如何改變告警閾值。後續檢查發現首次出現之外還有 4,904 條重複記錄，測試集與訓練集精確重疊達到 54.2%，同時存在預處理和閾值選擇洩漏。因此記錄曲線可以解釋當時的流程，但要支持檢測性能結論，仍需乾淨、獨立的評估。有效的重跑需要去重或按組劃分，僅在訓練資料上擬合轉換，在驗證資料上選擇門檻，並保留未經使用的最終測試集。"
  ],
  "Data analysis": [
    "数据分析",
    "資料分析"
  ],
  "Logistic regression": [
    "逻辑回归",
    "邏輯迴歸"
  ],
  "SVM": [
    "SVM",
    "SVM"
  ],
  "ROC analysis": [
    "ROC 分析",
    "ROC 分析"
  ],
  "10,000 labelled network-flow examples": [
    "10,000 条标记网络流量示例",
    "10,000 條標記網路流量示例"
  ],
  "Logistic and kernel classifier comparison": [
    "逻辑回归 与核分类器比较",
    "邏輯迴歸 與核分類器比較"
  ],
  "False-alarm versus missed-attack cost controls": [
    "误报与漏报攻击的成本控制",
    "誤報與漏報攻擊的成本控制"
  ],
  "Evaluation limitations made clear alongside the results": [
    "结果旁明确说明评估限制",
    "結果旁明確說明評估限制"
  ],
  "The historical results are not a validated operational detector. Duplicate handling and a clean evaluation are needed before using its performance estimates.": [
    "历史结果不代表经过验证的实际检测系统。使用性能估计前，需要处理重复记录并重新进行干净评估。",
    "歷史結果不代表經過驗證的實際檢測系統。使用性能估計前，需要處理重複記錄並重新進行乾淨評估。"
  ],
  "Regularisation Paths · Air-Quality Companion": [
    "正则化路径：空气质量配套实验",
    "正則化路徑：空氣品質配套實驗"
  ],
  "Regularisation Paths": [
    "正则化路径",
    "正則化路徑"
  ],
  "INTERACTIVE ML FOUNDATIONS": [
    "交互机器学习基础",
    "互動機器學習基礎"
  ],
  "The mathematical companion to the Air-Quality ML Decision Lab, isolating how L1 and L2 penalties alter standardised coefficient paths.": [
    "空气质量机器学习实验的数学配套，单独展示 L1 和 L2 惩罚如何改变标准化系数路径。",
    "空氣品質機器學習實驗的數學配套，單獨展示 L1 和 L2 懲罰如何改變標準化係數路徑。"
  ],
  "Ridge spreads shrinkage across the coefficients, while LASSO can set some coefficients to zero. In the air-quality study, the recorded choices were Ridge alpha 8.6975 and LASSO alpha 0.0010, with ten of eleven LASSO features retained. The browser uses a simpler orthonormal synthetic design so visitors can follow the exact shrinkage and soft-threshold calculations as the penalty changes.": [
    "Ridge 对各系数进行收缩，LASSO 则可以把部分系数降为零。空气质量研究记录的选择是 Ridge alpha 8.6975 和 LASSO alpha 0.0010，其中 LASSO 保留了十一项中的十项特征。浏览器使用更简单的正交归一合成设计，让访客随惩罚强度变化逐步理解精确的收缩和软阈值计算。",
    "Ridge 對各系數進行收縮，LASSO 則可以把部分系數降為零。空氣品質研究記錄的選擇是 Ridge alpha 8.6975 和 LASSO alpha 0.0010，其中 LASSO 保留了十一項中的十項特徵。瀏覽器使用更簡單的正交歸一合成設計，讓訪客隨懲罰強度變化逐步理解精確的收縮和軟閾值計算。"
  ],
  "Data visualisation": [
    "数据可视化",
    "資料視覺化"
  ],
  "Interactive Ridge and LASSO coefficient paths": [
    "交互 Ridge 与 LASSO 系数路径",
    "互動 Ridge 與 LASSO 係數路徑"
  ],
  "Exact shrinkage in a controlled example": [
    "受控示例中的精确收缩",
    "受控示例中的精確收縮"
  ],
  "Connection to the recorded air-quality model comparison": [
    "连接记录的空气质量模型比较",
    "連接記錄的空氣品質模型比較"
  ],
  "Safety-Critical AI Studies": [
    "安全关键 AI 研究",
    "安全關鍵 AI 研究"
  ],
  "UNCERTAINTY, CALIBRATION & CONFORMAL PREDICTION": [
    "不确定性、校准与共形预测",
    "不確定性、校準與共形預測"
  ],
  "Studying when model confidence can be trusted through uncertainty estimates, probability calibration and conformal prediction.": [
    "通过不确定性估计、概率校准和共形预测，研究何时可以信任模型置信度。",
    "透過不確定性估計、機率校準和共形預測，研究何時可以信任模型信心度。"
  ],
  "My computational study moves from bootstrap and Bayesian uncertainty to temperature scaling and split-conformal prediction. Temperature scaling reduced ECE from 0.03994 to 0.03792 but slightly worsened test negative log-likelihood, showing that calibration measures can disagree. A recorded exchangeable-data experiment achieved 95.75% empirical coverage. The interactive companion explores why changing the input distribution can break that coverage guarantee.": [
    "我的计算研究从自助重采样与贝叶斯不确定性，扩展到温度缩放和分割共形预测。温度缩放使 ECE 从 0.03994 降至 0.03792，但测试负对数似然略有恶化，说明校准指标可能给出不同结论。一个满足可交换性的记录实验达到 95.75% 经验覆盖率。交互配套工具探索输入分布变化为何可能破坏覆盖保证。",
    "我的計算研究從自助重抽樣與貝氏不確定性，擴展到溫度縮放和分割共形預測。溫度縮放使 ECE 從 0.03994 降至 0.03792，但測試負對數似然略有惡化，說明校準指標可能給出不同結論。一個滿足可交換性的記錄實驗達到 95.75% 經驗覆蓋率。互動配套工具探索輸入分布變化為何可能破壞覆蓋保證。"
  ],
  "Bayesian modelling": [
    "贝叶斯建模",
    "貝氏建模"
  ],
  "Calibration": [
    "校准",
    "校準"
  ],
  "Conformal prediction": [
    "共形预测",
    "共形預測"
  ],
  "ECE 0.03994 → 0.03792": [
    "ECE 从 0.03994 降至 0.03792",
    "ECE 從 0.03994 降至 0.03792"
  ],
  "95.75% empirical coverage under exchangeability": [
    "可交换条件下经验覆盖率 95.75%",
    "可交換條件下經驗覆蓋率 95.75%"
  ],
  "Covariate-shift limitation made explicit": [
    "明确说明协变量分布变化的限制",
    "明確說明協變量分布變化的限制"
  ],
  "Safe Learning to Defer for Insurance Fraud Detection": [
    "保险欺诈检测中的安全学习转交",
    "保險欺詐檢測中的安全學習轉交"
  ],
  "Safe-L2D": [
    "Safe-L2D",
    "Safe-L2D"
  ],
  "RISK-SENSITIVE SELECTIVE PREDICTION": [
    "考虑风险的选择性预测",
    "考慮風險的選擇性預測"
  ],
  "Combining fraud predictions with human review by balancing automated coverage, uncertainty and costly errors.": [
    "平衡自动处理覆盖率、不确定性和高成本误判，将欺诈预测与人工审阅结合起来。",
    "平衡自動處理覆蓋率、不確定性和高成本誤判，將欺詐預測與人工審閱結合起來。"
  ],
  "I co-developed a study with Miltiades Georgantzis and Sulieman Ibsais, combining isotonic-calibrated XGBoost, sequential Bayesian uncertainty and a confidence-or-entropy deferral rule. A CVaR-aware threshold score considers the worst retained losses as well as average performance. The reported operating point gives 89.5% system accuracy at 64% coverage. Fictional claims in the browser let visitors inspect the arithmetic and the small tail sample; they do not provide independent validation.": [
    "我与 Miltiades Georgantzis 和 Sulieman Ibsais 合作研究了保序校准的 XGBoost、序贯贝叶斯不确定性和置信度或熵触发的转交规则。考虑 CVaR 的阈值评分同时关注最严重的保留损失与平均表现。报告的工作点在 64% 覆盖率下达到 89.5% 系统准确率。浏览器中的虚构理赔用于检查计算和很小的尾部样本，并不提供独立验证。",
    "我與 Miltiades Georgantzis 和 Sulieman Ibsais 合作研究了保序校準的 XGBoost、序貫貝氏不確定性和信心度或熵觸發的轉交規則。考慮 CVaR 的閾值評分同時關注最嚴重的保留損失與平均表現。報告的工作點在 64% 覆蓋率下達到 89.5% 系統準確率。瀏覽器中的虛構理賠用於檢查計算和很小的尾部樣本，並不提供獨立驗證。"
  ],
  "XGBoost": [
    "XGBoost",
    "XGBoost"
  ],
  "Bayesian KDE": [
    "贝叶斯核密度估计",
    "貝氏核密度估計"
  ],
  "Isotonic calibration": [
    "保序校准",
    "保序校準"
  ],
  "Learning to defer": [
    "学习转交",
    "學習轉交"
  ],
  "CVaR": [
    "CVaR",
    "CVaR"
  ],
  "89.5% reported system accuracy at 64% coverage": [
    "报告系统准确率 89.5%，覆盖率 64%",
    "報告系統準確率 89.5%，覆蓋率 64%"
  ],
  "Adjustable confidence and uncertainty deferral": [
    "可调整置信度与不确定性转交阈值",
    "可調整信心度與不確定性轉交閾值"
  ],
  "Inspect the 13-sample CVaR tail": [
    "检查由 13 个样本组成的 CVaR 尾部",
    "檢查由 13 個樣本組成的 CVaR 尾部"
  ],
  "Compare automated coverage with human-review volume": [
    "比较自动处理覆盖率与人工审阅量",
    "比較自動處理覆蓋率與人工審閱量"
  ],
  "Every claim shown in the interactive example is fictional. The linked public study has no explicit licence.": [
    "交互示例中的理赔均为虚构。链接的公开研究没有明确许可。",
    "互動示例中的理賠均為虛構。連結的公開研究沒有明確許可。"
  ],
  "Causal Adjustment & OPE Lab": [
    "因果调整与离策略评估实验室",
    "因果調整與離策略評估實驗室"
  ],
  "Causal & OPE": [
    "因果与 OPE",
    "因果與 OPE"
  ],
  "CAUSAL GRAPHS · LOGGED POLICIES · OFF-POLICY EVALUATION": [
    "因果图、已记录策略与离策略评估",
    "因果圖、已記錄策略與離策略評估"
  ],
  "A two-chapter decision lab separating causal adjustment from counterfactual policy evaluation over logged bandit feedback.": [
    "由两个章节组成的决策实验室，区分因果调整与基于已记录老虎机反馈的反事实策略评估。",
    "由兩個章節組成的決策實驗室，區分因果調整與基於已記錄老虎機回饋的反事實策略評估。"
  ],
  "The first chapter uses twelve synthetic observations to explain confounding, collider bias, adjustment and overlap in a treatment-effect question. The second adapts the STUDY-RL policy-evaluation methods to 24 synthetic logged decisions with known action probabilities. Visitors compare IPS, SNIPS, Direct, doubly robust and SWITCH-DR estimates, then change the target policy, overlap and weight clipping. Effective sample size and per-row weights show when a result depends heavily on only a few observations. The recorded policy-evaluation methods come from STUDY-RL Week 11 and fit one ridge reward model per action. The interactive SWITCH threshold controls when the doubly robust correction is replaced by the direct model estimate.": [
    "第一章用十二条合成观测解释治疗效应问题中的混杂、碰撞点偏差、调整和重叠。第二章将 STUDY-RL 策略评估方法用于 24 条动作概率已知的合成决策记录。访客比较 IPS、SNIPS、Direct、双重稳健和 SWITCH-DR 估计，并改变目标策略、重叠及权重截断。有效样本量与逐行权重显示结果何时高度依赖少数观测。记录的策略评估方法来自 STUDY-RL 第 11 周，并为每个动作拟合一个岭回归奖励模型。交互式 SWITCH 阈值控制何时用直接模型估计替代双重稳健修正项。",
    "第一章用十二條合成觀測解釋治療效應問題中的混雜、碰撞點偏差、調整和重疊。第二章將 STUDY-RL 策略評估方法用於 24 條動作機率已知的合成決策記錄。訪客比較 IPS、SNIPS、Direct、雙重穩健和 SWITCH-DR 估計，並改變目標策略、重疊及權重截斷。有效樣本量與逐行權重顯示結果何時高度依賴少數觀測。記錄的策略評估方法來自 STUDY-RL 第 11 週，並為每個動作擬合一個嶺迴歸獎勵模型。互動式 SWITCH 門檻控制何時用直接模型估計替代雙重穩健修正項。"
  ],
  "Causal DAGs": [
    "因果有向无环图",
    "因果有向無環圖"
  ],
  "Hájek IPW": [
    "Hájek 逆概率加权",
    "Hájek 逆機率加權"
  ],
  "IPS / SNIPS": [
    "IPS / SNIPS",
    "IPS / SNIPS"
  ],
  "Direct / DR / SWITCH-DR": [
    "Direct / DR / SWITCH-DR",
    "Direct / DR / SWITCH-DR"
  ],
  "Effective sample size": [
    "有效样本量",
    "有效樣本量"
  ],
  "Clickable confounder and collider paths": [
    "可点击的混杂与碰撞点路径",
    "可點擊的混雜與碰撞點路徑"
  ],
  "Separate logged and proposed policies": [
    "区分已记录策略与拟采用策略",
    "區分已記錄策略與擬採用策略"
  ],
  "Five off-policy value estimators": [
    "五种离策略价值估计量",
    "五種離策略價值估計量"
  ],
  "Inspect overlap, clipping and effective sample size": [
    "检查重叠、截断和有效样本量",
    "檢查重疊、截斷和有效樣本量"
  ],
  "All observations and logged decisions in the browser are synthetic teaching examples.": [
    "浏览器中的所有观测和决策记录均为合成教学示例。",
    "瀏覽器中的所有觀測和決策記錄均為合成教學示例。"
  ],
  "Four Models of Corporate Innovation": [
    "企业创新的四种模式",
    "企業創新的四種模式"
  ],
  "4 Models": [
    "四种模式",
    "四種模式"
  ],
  "INNOVATION MANAGEMENT REFLECTION": [
    "创新管理思考",
    "創新管理思考"
  ],
  "Innovation strategy": [
    "创新战略",
    "創新戰略"
  ],
  "Organisational ambidexterity": [
    "组织双元性",
    "組織雙元性"
  ],
  "Corporate entrepreneurship": [
    "企业内部创业",
    "企業內部創業"
  ],
  "Portfolio concentration": [
    "资源组合集中度",
    "資源組合集中度"
  ],
  "Scenario modelling": [
    "情境建模",
    "情境建模"
  ],
  "Interactive ownership and resource-authority matrix": [
    "责任归属与资源权限的交互矩阵",
    "責任歸屬與資源權限的互動矩陣"
  ],
  "Four organisational models": [
    "四种组织模式",
    "四種組織模式"
  ],
  "100-token innovation portfolio": [
    "100 单位创新资源组合",
    "100 單位創新資源組合"
  ],
  "Transition questions about evidence, integration and runway": [
    "关于证据、整合和资金续航的转型问题",
    "關於證據、整合和資金續航的轉型問題"
  ],
  "The interactive organisations and projects are fictional. Original assessed prose remains private.": [
    "交互组织与项目均为虚构。原始课程评估文章保持私密。",
    "互動組織與專案均為虛構。原始課程評估文章保持私密。"
  ],
  "VENTURE DESIGN, CRITIQUE AND FUNDING": [
    "创业设计、评议与融资",
    "創業設計、評議與融資"
  ],
  "Venture critique": [
    "创业提案评议",
    "創業提案評議"
  ],
  "Runway modelling": [
    "资金续航建模",
    "資金續航建模"
  ],
  "Six venture claims with adjustable supporting evidence": [
    "六项创业主张及可调整的支持证据",
    "六項創業主張及可調整的佐證"
  ],
  "Bottom-up market and customer-pipeline calculations": [
    "自下而上的市场与客户转化计算",
    "自下而上的市場與客戶轉化計算"
  ],
  "Funding, runway and milestone comparison": [
    "融资、资金续航与里程碑比较",
    "融資、資金續航與里程碑比較"
  ],
  "Three fictional business scenarios": [
    "三个虚构商业情境",
    "三個虛構商業情境"
  ],
  "All businesses, claims and numeric inputs in the demo are fictional. Original assessed work and real venture details remain private.": [
    "演示中的企业、主张和数值输入均为虚构。原始评估作业和真实创业细节保持私密。",
    "演示中的企業、主張和數值輸入均為虛構。原始評估作業和真實創業細節保持私密。"
  ],
  "PC-SAFT Thermodynamics Workbench": [
    "PC-SAFT 热力学工作台",
    "PC-SAFT 熱力學工作臺"
  ],
  "PC-SAFT Lab": [
    "PC-SAFT 实验室",
    "PC-SAFT 實驗室"
  ],
  "EQUATION-OF-STATE SCIENTIFIC COMPUTING": [
    "状态方程科学计算",
    "狀態方程科學計算"
  ],
  "Clapeyron.jl": [
    "Clapeyron.jl",
    "Clapeyron.jl"
  ],
  "PC-SAFT": [
    "PC-SAFT",
    "PC-SAFT"
  ],
  "PyPlot": [
    "PyPlot",
    "PyPlot"
  ],
  "Numerical thermodynamics": [
    "数值热力学",
    "數值熱力學"
  ],
  "Julia workflows for bulk properties and phase equilibrium": [
    "用于体相性质与相平衡的 Julia 工作流",
    "用於體相性質與相平衡的 Julia 工作流"
  ],
  "Hard-chain and dispersion energy contributions": [
    "硬链与色散能贡献",
    "硬鏈與色散能貢獻"
  ],
  "Interactive binary-mixture sensitivity": [
    "二元混合物交互敏感性分析",
    "二元混合物互動敏感性分析"
  ],
  "Pressure–density curves with typeset equations": [
    "配有数学排版的压力—密度曲线",
    "配有數學排版的壓力—密度曲線"
  ],
  "The browser uses invented fluid parameters and publicly attributed equations. Compound-specific research and experimental data remain private.": [
    "浏览器使用虚构流体参数和公开署名的方程。具体化合物研究和实验数据保持私密。",
    "瀏覽器使用虛構流體參數和公開署名的方程。具體化合物研究和實驗資料保持私密。"
  ],
  "Solid–Liquid Solubility Workflow": [
    "固液溶解度工作流",
    "固液溶解度工作流"
  ],
  "Solubility Workflow": [
    "溶解度工作流",
    "溶解度工作流"
  ],
  "SOLID–LIQUID EQUILIBRIUM": [
    "固液平衡",
    "固液平衡"
  ],
  "SolidHfus": [
    "SolidHfus",
    "SolidHfus"
  ],
  "Margules activity model": [
    "Margules 活度模型",
    "Margules 活度模型"
  ],
  "Numerical root finding": [
    "数值求根",
    "數值求根"
  ],
  "TypeScript / React": [
    "TypeScript / React",
    "TypeScript / React"
  ],
  "Activity-corrected equilibrium calculation": [
    "带活度修正的平衡计算",
    "帶活度修正的平衡計算"
  ],
  "Visible root-finding convergence": [
    "可见的求根收敛过程",
    "可見的求根收斂過程"
  ],
  "Mole fraction and mg per gram of solvent conversion": [
    "摩尔分数与每克溶剂毫克数换算",
    "摩爾分數與每克溶劑毫克數換算"
  ],
  "Fictional calibration and holdout experiment": [
    "虚构校准与留出实验",
    "虛構校準與留出實驗"
  ],
  "The example uses invented compounds, parameters and observations. It demonstrates the method without publishing private experimental results or claiming predictive validation.": [
    "示例使用虚构化合物、参数和观测，只展示方法，不发布私人实验结果，也不声称已完成预测验证。",
    "示例使用虛構化合物、參數和觀測，只展示方法，不發佈私人實驗結果，也不聲稱已完成預測驗證。"
  ],
  "Molecular Recognition Pipeline": [
    "分子识别流程",
    "分子識別流程"
  ],
  "Molecular Recognition": [
    "分子识别",
    "分子識別"
  ],
  "CP-FTMW · MACROCYCLIC MUSKS": [
    "CP-FTMW 与大环麝香分子",
    "CP-FTMW 與大環麝香分子"
  ],
  "Combining rotational spectroscopy and molecular modelling to distinguish flexible Exaltenone and Muscone conformations.": [
    "结合转动光谱与分子建模，区分柔性的 Exaltenone 和 Muscone 构象。",
    "結合轉動光譜與分子建模，區分柔性的 Exaltenone 和 Muscone 構象。"
  ],
  "CP-FTMW spectroscopy": [
    "CP-FTMW 光谱",
    "CP-FTMW 光譜"
  ],
  "MATLAB": [
    "MATLAB",
    "MATLAB"
  ],
  "Conformer search": [
    "构象搜索",
    "構象搜尋"
  ],
  "Spectral assignment": [
    "谱线指认",
    "譜線指認"
  ],
  "Co-authored research presented at ISMS 2025": [
    "共同作者研究发表于 ISMS 2025 会议",
    "共同作者研究發表於 ISMS 2025 會議"
  ],
  "Conformer search and 2–8 GHz rotational spectroscopy": [
    "构象搜索与 2–8 GHz 转动光谱",
    "構象搜尋與 2–8 GHz 轉動光譜"
  ],
  "20+ Exaltenone and 30+ Muscone conformations reported by the group": [
    "团队报告 20+ 种 Exaltenone 和 30+ 种 Muscone 构象",
    "團隊報告 20+ 種 Exaltenone 和 30+ 種 Muscone 構象"
  ],
  "Interactive spectral matching and conformer views": [
    "交互谱线匹配与构象视图",
    "互動譜線匹配與構象視圖"
  ],
  "The interactive spectra and geometries are synthetic. Unpublished structures and experimental records remain private; the conference record links the public research context.": [
    "交互光谱和几何结构均为合成。未发表结构和实验记录保持私密；会议记录提供公开研究背景。",
    "互動光譜和幾何結構均為合成。未發表結構和實驗記錄保持私密；會議記錄提供公開研究背景。"
  ],
  "2025 ISMS conference record": [
    "2025 年 ISMS 会议记录",
    "2025 年 ISMS 會議記錄"
  ],
  "CPROT Spectroscopy Plotter": [
    "CPROT 光谱绘图工具",
    "CPROT 光譜繪圖工具"
  ],
  "Spec Plotter": [
    "光谱绘图",
    "光譜繪圖"
  ],
  "MATLAB SCIENTIFIC PLOTTING UTILITY": [
    "MATLAB 科学绘图工具",
    "MATLAB 科學繪圖工具"
  ],
  "A compact MATLAB App Designer tool for turning two-column spectroscopy exports into presentation-ready plots with precise frequency navigation and high-resolution export.": [
    "小巧的 MATLAB App Designer 工具，将两列光谱导出数据变为可展示的图表，支持精确频率导航与高分辨率导出。",
    "小巧的 MATLAB App Designer 工具，將雙欄光譜匯出資料變為可展示的圖表，支持精確頻率導覽與高解析度匯出。"
  ],
  "MATLAB App Designer": [
    "MATLAB App Designer",
    "MATLAB App Designer"
  ],
  "MATLAB exportgraphics": [
    "MATLAB exportgraphics",
    "MATLAB exportgraphics"
  ],
  "Scientific visualisation": [
    "科学可视化",
    "科學視覺化"
  ],
  "Desktop GUI": [
    "桌面图形界面",
    "桌面圖形介面"
  ],
  "Single two-column numeric trace workflow": [
    "单条两列数值谱线工作流",
    "單條雙欄數值譜線流程"
  ],
  "Fine/coarse centring plus ±0.1/10/100 MHz pan": [
    "精细/粗略居中及 ±0.1/10/100 MHz 平移",
    "精細/粗略居中及 ±0.1/10/100 MHz 平移"
  ],
  "PNG/JPG/TIF/PDF/EPS export with 600-DPI default": [
    "PNG/JPG/TIF/PDF/EPS 导出，默认 600 DPI",
    "PNG/JPG/TIF/PDF/EPS 匯出，預設 600 DPI"
  ],
  "Responsive two-panel desktop layout": [
    "响应式双面板桌面布局",
    "響應式雙面板桌面佈局"
  ],
  "The browser uses a generated spectrum. Experimental files are not published here; the linked public utility has no explicit licence.": [
    "浏览器使用生成的光谱，不发布实验文件；链接的公开工具没有明确许可。",
    "瀏覽器使用生成的光譜，不發佈實驗文件；連結的公開工具沒有明確許可。"
  ],
  "Accelerator Environment Planner": [
    "加速计算环境规划器",
    "加速計算環境規劃器"
  ],
  "DL Environment": [
    "深度学习环境",
    "深度學習環境"
  ],
  "REPRODUCIBLE ML INFRASTRUCTURE": [
    "可重复的机器学习基础设施",
    "可重複的機器學習基礎設施"
  ],
  "Automating scientific Python and deep-learning setup across operating systems, processor architectures and CPU/GPU configurations.": [
    "跨操作系统、处理器架构及 CPU/GPU 配置，自动搭建科学 Python 与深度学习环境。",
    "跨操作系統、處理器架構及 CPU/GPU 配置，自動搭建科學 Python 與深度學習環境。"
  ],
  "I built a Bash installer that detects the host and accelerator, creates a Python 3.13 Conda environment and installs a scientific package set with PyTorch, TensorFlow and the Hugging Face CLI. Platform-specific routes and fallbacks are followed by import and device checks. The browser planner lets visitors choose example hosts, simulate installation failures and compare more cautious architecture and verification checks. It runs no installer and does not guarantee current compatibility for every historical package route. The historical target manifest contains 19 core-package targets, four framework targets and one CLI target. Failure injection shows how fallback branches and Bash set -e affect completion, while the comparison view adds manifest and runtime-device checks.": [
    "我编写 Bash 安装器，检测主机与加速器，创建 Python 3.13 Conda 环境，并安装 PyTorch、TensorFlow、Hugging Face CLI 和科学软件包。按平台选择的安装路线与回退步骤之后，会检查导入和设备。浏览器规划器让访客选择示例主机、模拟安装失败，并比较更谨慎的架构与验证检查。它不运行安装程序，也不保证所有历史软件包路线今天仍然兼容。历史目标清单包含 19 个核心软件包目标、四个框架目标和一个 CLI 目标。故障注入展示回退分支与 Bash set -e 如何影响完成情况，对比视图还增加清单核对与运行时设备检查。",
    "我編寫 Bash 安裝器，檢測主機與加速器，建立 Python 3.13 Conda 環境，並安裝 PyTorch、TensorFlow、Hugging Face CLI 和科學套件。按平台選擇的安裝路線與替代路徑步驟之後，會檢查匯入和設備。瀏覽器規劃器讓訪客選擇示例主機、模擬安裝失敗，並比較更謹慎的架構與驗證檢查。它不執行安裝程式，也不保證所有歷史套件路線今天仍然兼容。歷史目標清單包含 19 個核心套件目標、四個框架目標和一個 CLI 目標。故障注入展示備援分支與 Bash set -e 如何影響完成情況，對比視圖還增加清單核對與執行時裝置檢查。"
  ],
  "Bash": [
    "Bash",
    "Bash"
  ],
  "Conda": [
    "Conda",
    "Conda"
  ],
  "TensorFlow": [
    "TensorFlow",
    "TensorFlow"
  ],
  "CUDA / MPS": [
    "CUDA / MPS",
    "CUDA / MPS"
  ],
  "Dependency management": [
    "依赖管理",
    "依賴管理"
  ],
  "OS, architecture and accelerator-aware setup": [
    "根据操作系统、架构和加速器安排安装",
    "根據操作系統、架構和加速器安排安裝"
  ],
  "PyTorch and TensorFlow installation fallbacks": [
    "PyTorch 与 TensorFlow 安装回退",
    "PyTorch 與 TensorFlow 安裝替代方案"
  ],
  "Scientific packages and Hugging Face CLI": [
    "科学软件包与 Hugging Face CLI",
    "科學套件與 Hugging Face CLI"
  ],
  "Simulated failures and import/device verification": [
    "模拟失败及导入/设备验证",
    "模擬失敗及匯入/設備驗證"
  ],
  "The planner uses fictional host profiles and performs no installation, system probing or network requests.": [
    "规划器使用虚构主机配置，不执行安装、系统探测或网络请求。",
    "規劃器使用虛構主機配置，不執行安裝、系統探測或網路請求。"
  ],
  "WSL 2 + GROMACS GPU Setup Notes": [
    "WSL 2 与 GROMACS GPU 环境笔记",
    "WSL 2 與 GROMACS GPU 環境筆記"
  ],
  "GROMACS Setup": [
    "GROMACS 环境",
    "GROMACS 環境"
  ],
  "GPU CONTAINER ENVIRONMENT NOTES": [
    "GPU 容器环境笔记",
    "GPU 容器環境筆記"
  ],
  "Preparing a Windows workstation for GPU-capable scientific containers and an initial GROMACS topology calculation.": [
    "为 Windows 工作站配置 GPU 科学计算容器，并完成初始 GROMACS 拓扑准备。",
    "為 Windows 工作站配置 GPU 科學計算容器，並完成初始 GROMACS 拓撲準備。"
  ],
  "I configured WSL 2, CUDA, NVIDIA Container Toolkit and Docker, then completed a containerised GROMACS topology-preparation step on a small tutorial structure. The work documents how the environment layers fit together and the preparation stage reached. It does not include a completed molecular-dynamics run or a simulation-performance result. The completed preprocessing command is gmx pdb2gmx. The retained record lacks a pinned container image, run protocol and trajectory or energy outputs, so it documents setup progress rather than a reproducible end-to-end simulation.": [
    "我配置 WSL 2、CUDA、NVIDIA Container Toolkit 和 Docker，随后在容器中对小型教学结构完成 GROMACS 拓扑准备。工作记录了各环境层如何协作及已完成的准备阶段，不包括完整分子动力学运行或模拟性能结果。已完成的预处理命令是 gmx pdb2gmx。保留记录中缺少固定版本的容器镜像、运行方案以及轨迹或能量输出，因此它记录的是环境准备进展，而非可复现的端到端模拟。",
    "我配置 WSL 2、CUDA、NVIDIA Container Toolkit 和 Docker，隨後在容器中對小型教學結構完成 GROMACS 拓撲準備。工作記錄了各環境層如何協作及已完成的準備階段，不包括完整分子動力學執行或模擬性能結果。已完成的前處理命令是 gmx pdb2gmx。保留記錄中缺少固定版本的容器映像、執行方案以及軌跡或能量輸出，因此它記錄的是環境準備進展，而非可重現的端到端模擬。"
  ],
  "GROMACS": [
    "GROMACS",
    "GROMACS"
  ],
  "CUDA": [
    "CUDA",
    "CUDA"
  ],
  "WSL 2": [
    "WSL 2",
    "WSL 2"
  ],
  "NVIDIA Container Toolkit": [
    "NVIDIA Container Toolkit",
    "NVIDIA Container Toolkit"
  ],
  "WSL 2, CUDA and container setup": [
    "WSL 2、CUDA 与容器配置",
    "WSL 2、CUDA 與容器配置"
  ],
  "Containerised GROMACS topology preparation": [
    "容器内 GROMACS 拓扑准备",
    "容器內 GROMACS 拓撲準備"
  ],
  "Documented environment and preprocessing workflow": [
    "记录环境与预处理工作流",
    "記錄環境與預處理工作流"
  ],
  "This is an environment-setup case study. The linked public notes have no explicit licence.": [
    "这是环境搭建案例。链接的公开笔记没有明确许可。",
    "這是環境搭建案例。連結的公開筆記沒有明確許可。"
  ],
  "Home Lab Infrastructure & Recovery": [
    "家庭实验室基础设施与恢复",
    "家庭實驗室基礎設施與恢復"
  ],
  "Home Lab": [
    "家庭实验室",
    "家庭實驗室"
  ],
  "SELF-HOSTED SERVICES AND RECOVERY": [
    "自托管服务与恢复",
    "自代管服務與恢復"
  ],
  "Building and maintaining a containerised home lab with connected services, scheduled database backups and recovery tooling.": [
    "构建并维护容器化家庭实验室，连接各项服务，定时备份数据库并配备恢复工具。",
    "建置並維護容器化家庭實驗室，連接各項服務，定時備份資料庫並配備恢復工具。"
  ],
  "Shell": [
    "Shell",
    "Shell"
  ],
  "Dependency graphs": [
    "依赖关系图",
    "依賴關係圖"
  ],
  "Six-service interactive topology": [
    "六个服务的交互拓扑",
    "六個服務的互動拓撲"
  ],
  "Dependency tracing and simulated failures": [
    "依赖追踪与故障模拟",
    "依賴追蹤與故障模擬"
  ],
  "Scheduled database backups and restore tooling": [
    "定时数据库备份及恢复工具",
    "定時資料庫備份及恢復工具"
  ],
  "Backup-capacity and retention experiments": [
    "备份容量与保留期实验",
    "備份容量與保留期實驗"
  ],
  "The demo uses fictional service names and exposes no private addresses or credentials. It is a topology and recovery-planning example, not live monitoring.": [
    "演示使用虚构服务名，不暴露私人地址或凭据。它用于拓扑和恢复规划，不是实时监控。",
    "演示使用虛構服務名，不暴露私人地址或憑據。它用於拓撲和恢復規劃，不是實時監控。"
  ],
  "Stochastic Market Impact Simulator": [
    "随机市场冲击模拟器",
    "隨機市場衝擊模擬器"
  ],
  "Market Impact Lab": [
    "市场冲击实验室",
    "市場衝擊實驗室"
  ],
  "STOCHASTIC PRICE SIMULATION": [
    "随机价格模拟",
    "隨機價格模擬"
  ],
  "A Julia toy model exploring how sentiment, trade size and random impact combine into a single-stock price path.": [
    "Julia 简化模型，探索情绪、交易规模和随机冲击如何共同形成单只股票的价格路径。",
    "Julia 簡化模型，探索情緒、交易規模和隨機衝擊如何共同形成單隻股票的價格路徑。"
  ],
  "I wrote a simulation in which five traders act across ten loops per day, producing 50 buy/sell events. Perturbed sentiment affects direction, quantity scales the random impact and a $0.01 floor limits sell-side price changes. The browser adds seeded replay, price and volume traces, and a comparison between the original partial-day statistics and a corrected full-day window. It illustrates the chosen event rules rather than predicting a real market. Before applying direction and the price floor, the requested impact is quantity × a sampled random value × an impact coefficient. The original daily statistics use ten saved prices, covering nine transitions; the corrected window uses all 50 transitions in the day.": [
    "我编写的模拟中，五名交易者每天进行十轮操作，产生 50 个买卖事件。受扰动的情绪影响方向，数量放大随机价格冲击，卖出时价格受 0.01 美元下限约束。浏览器加入带种子重放、价格与成交量曲线，并比较原始部分时段统计与修正后的全日窗口。它解释所选事件规则，不预测真实市场。在应用买卖方向和价格下限之前，请求的冲击幅度为数量 × 抽样随机值 × 冲击系数。原始日统计使用十个保存的价格，涵盖九次变化；修正窗口覆盖当天全部 50 次变化。",
    "我編寫的模擬中，五名交易者每天進行十輪操作，產生 50 個買賣事件。受擾動的情緒影響方向，數量放大隨機價格衝擊，賣出時價格受 0.01 美元下限約束。瀏覽器加入帶種子重放、價格與成交量曲線，並比較原始部分時段統計與修正後的全日窗口。它解釋所選事件規則，不預測真實市場。在套用買賣方向和價格下限之前，請求的衝擊幅度為數量 × 抽樣隨機值 × 衝擊係數。原始日統計使用十個保存的價格，涵蓋九次變化；修正視窗涵蓋當天全部 50 次變化。"
  ],
  "Random / Statistics": [
    "Random / Statistics",
    "Random / Statistics"
  ],
  "Plots": [
    "Plots",
    "Plots"
  ],
  "50 buy/sell events per simulated day": [
    "每个模拟日 50 个买卖事件",
    "每個模擬日 50 個買賣事件"
  ],
  "Adjustable sentiment and quantity-scaled impact": [
    "可调整情绪与数量相关冲击",
    "可調整情緒與數量相關衝擊"
  ],
  "Seeded price and volume replay": [
    "带种子的价格与成交量重放",
    "帶種子的價格與成交量重放"
  ],
  "Partial-day versus full-day statistics": [
    "部分时段与全日统计比较",
    "部分時段與全日統計比較"
  ],
  "All prices, traders and transactions are synthetic. The simulator is an educational model, not investment advice or a market forecast.": [
    "价格、交易者和交易均为合成。模拟器是教学模型，不是投资建议或市场预测。",
    "價格、交易者和交易均為合成。模擬器是教學模型，不是投資建議或市場預測。"
  ],
  "COVID-19 Decision Support": [
    "COVID-19 决策支持",
    "COVID-19 決策支援"
  ],
  "RESTRICTED EMERGENCY-OPERATIONS WORK": [
    "受限的应急行动工作",
    "受限的應急行動工作"
  ],
  "Decision support and workflow automation developed for pandemic-era emergency operations.": [
    "为疫情时期的应急行动开发决策支持和流程自动化。",
    "為疫情時期的應急行動開發決策支援和流程自動化。"
  ],
  "During national service, I built decision support from public epidemiological information and automated parts of emergency-operations workflows. The work connected changing data with planning and activation needs under time pressure. Only the public contribution and outcome-level context are shared.": [
    "在国民服役期间，我利用公开流行病学信息构建决策支持，并自动化部分应急行动流程。在时间压力下，这项工作把变化中的数据与规划和启动需求联系起来。这里只分享公开贡献和成果层面的背景。",
    "在國民服役期間，我利用公開流行病學資訊建置決策支援，並自動化部分應急行動流程。在時間壓力下，這項工作把變化中的資料與規劃和啟動需求聯繫起來。這裡只分享公開貢獻和成果層面的背景。"
  ],
  "Decision support": [
    "决策支持",
    "決策支援"
  ],
  "Statistical modelling": [
    "统计建模",
    "統計建模"
  ],
  "Workflow automation": [
    "流程自动化",
    "流程自動化"
  ],
  "Operations": [
    "运维",
    "運維"
  ],
  "Public-data analysis for emergency operations": [
    "服务应急行动的公开数据分析",
    "服務應急行動的公開資料分析"
  ],
  "Planning and activation workflow automation": [
    "规划与启动流程自动化",
    "規劃與啟動流程自動化"
  ],
  "High-pressure operational use": [
    "高压运营场景中的应用",
    "高壓運營場景中的應用"
  ],
  "Operational and personnel details are not published.": [
    "不公开行动和人员细节。",
    "不公開行動和人員細節。"
  ],
  "Computational Chemistry Coding Labs": [
    "计算化学编程实验",
    "計算化學編程實驗"
  ],
  "Chemistry Labs": [
    "化学编程实验",
    "化學編程實驗"
  ],
  "SCIENTIFIC COMPUTING THROUGH EXPERIMENTS": [
    "通过实验学习科学计算",
    "透過實驗學習科學計算"
  ],
  "Computational chemistry exercises and extensions that turn sampling, polymer shape, molecular motion and quantum-energy ideas into working experiments.": [
    "将采样、高分子形状、分子运动与量子能量思想变为可运行实验的计算化学习题及扩展。",
    "將取樣、高分子形狀、分子運動與量子能量思想變為可執行實驗的計算化學習題及擴展。"
  ],
  "I completed and extended scientific-computing notebooks covering Lennard-Jones Metropolis sampling, ideal and self-avoiding polymer walks, velocity-Verlet dynamics, basis-set convergence and cation–π energies. Later Julia and React experiments extend that work. The browser lets visitors replay a seeded sampler, rotate three polymer models, step through a four-particle periodic trajectory and inspect energy drift, then compare recorded quantum-chemistry calculations. The polymer comparison separates the archived ideal-chain sampler, an isotropic control and self-avoiding lattice walks. The dynamics example uses periodic minimum-image distances with velocity-Verlet updates.": [
    "我完成并扩展了科学计算笔记本，内容包括 Lennard-Jones Metropolis 采样、理想和自回避高分子行走、velocity-Verlet 动力学、基组收敛和阳离子–π 能量，之后又用 Julia 和 React 扩展实验。浏览器支持带种子的采样、三种高分子模型旋转、四粒子周期轨迹逐步积分与能量漂移检查，以及记录的量子化学计算比较。聚合物比较区分归档的理想链采样器、各向同性对照和自回避格点行走。动力学示例使用周期性最小镜像距离与 velocity-Verlet 更新。",
    "我完成並擴展了科學計算筆記本，內容包括 Lennard-Jones Metropolis 取樣、理想和自迴避高分子行走、velocity-Verlet 動力學、基組收斂和陽離子–π 能量，之後又用 Julia 和 React 擴展實驗。瀏覽器支持帶種子的取樣、三種高分子模型旋轉、四粒子週期軌跡逐步積分與能量漂移檢查，以及記錄的量子化學計算比較。聚合物比較區分歸檔的理想鏈取樣器、各向同性對照和自迴避格點行走。動力學範例使用週期性最小映像距離與 velocity-Verlet 更新。"
  ],
  "Monte Carlo": [
    "蒙特卡洛",
    "蒙特卡洛"
  ],
  "Molecular simulation concepts": [
    "分子模拟概念",
    "分子模擬概念"
  ],
  "Seeded Lennard-Jones Metropolis sampling": [
    "带种子的 Lennard-Jones Metropolis 采样",
    "帶種子的 Lennard-Jones Metropolis 取樣"
  ],
  "Three rotatable polymer models": [
    "三种可旋转高分子模型",
    "三種可旋轉高分子模型"
  ],
  "Velocity-Verlet trajectory and energy-drift inspection": [
    "Velocity-Verlet 轨迹与能量漂移检查",
    "Velocity-Verlet 軌跡與能量漂移檢查"
  ],
  "Basis-set and cation–π energy comparisons": [
    "基组与阳离子–π 能量比较",
    "基組與陽離子–π 能量比較"
  ],
  "The browser uses newly implemented calculations and selected recorded numerical results. Course exercises and methods retain their attribution; assessed materials remain private.": [
    "浏览器使用新实现的计算与部分记录的数值结果。课程练习和方法保留署名，评估材料保持私密。",
    "瀏覽器使用新實現的計算與部分記錄的數值結果。課程練習和方法保留署名，評估材料保持私密。"
  ],
  "Brokers must match a risk to suitable markets using placement history, market appetite and policy wording that can be incomplete or out of date.": [
    "经纪人需要根据可能不完整或已经过时的承保历史、市场偏好和保单条款，为风险匹配适合的市场。",
    "經紀人需要根據可能不完整或已經過時的承保歷史、市場偏好和保單條款，為風險匹配適合的市場。"
  ],
  "risk and candidate markets → ranking, history and wording analysis → provenance, confidence and abstention → broker review": [
    "风险与候选市场 → 排序、历史与条款分析 → 来源、置信度与暂缓判断 → 经纪人审阅",
    "風險與候選市場 → 排序、歷史與條款分析 → 來源、信心程度與暫緩判斷 → 經紀人審閱"
  ],
  "Select a fictional market, compare its three signals, then raise the minimum-information requirement to see when the system asks for more review.": [
    "选择一个虚构市场，比较其三个信号，再提高最低信息要求，观察系统何时请求进一步审阅。",
    "選擇一個虛構市場，比較其三個訊號，再提高最低資訊要求，觀察系統何時請求進一步審閱。"
  ],
  "Adapting a CV to each role takes time, and important experience can be overlooked when the job description uses different language.": [
    "为每个岗位调整简历需要时间；当职位说明使用不同措辞时，相关经验也可能被忽略。",
    "為每個職缺調整履歷需要時間；當職位說明使用不同措辭時，相關經驗也可能被忽略。"
  ],
  "job description → role language → template and relevant experience → reviewed wording → application document": [
    "职位说明 → 岗位用语 → 模板与相关经历 → 审阅措辞 → 申请文档",
    "職位說明 → 職缺用語 → 模板與相關經歷 → 審閱措辭 → 申請文檔"
  ],
  "Edit an example CV sentence, analyse the job description, and review a missing requirement before accepting a factual rewrite.": [
    "编辑示例简历中的一句话，分析职位说明，先审阅尚未覆盖的要求，再接受事实性改写。",
    "編輯示例履歷中的一句話，分析職位說明，先審閱尚未覆蓋的要求，再接受事實性改寫。"
  ],
  "Different bank formats, overlapping exports and transfers between accounts make it difficult to see what was actually earned or spent.": [
    "银行格式不同、导出时间重叠和账户间转账，使实际收入与支出难以看清。",
    "銀行格式不同、匯出時間重疊和帳戶間轉帳，使實際收入與支出難以看清。"
  ],
  "I built provider parsers, transaction deduplication, balance checks and analytical views using FastAPI, SQLite and React. The demo uses a fictional ledger and lets visitors examine how repeated imports and changed transaction details are handled.": [
    "我使用 FastAPI、SQLite 和 React 构建提供方解析器、交易去重、余额检查和分析视图。演示使用虚构账目，让访客检查重复导入及交易详情变化的处理方式。",
    "我使用 FastAPI、SQLite 和 React 建置提供方解析器、交易去重、餘額檢查和分析視圖。演示使用虛構帳目，讓訪客檢查重複匯入及交易詳情變化的處理方式。"
  ],
  "statements → normalisation, duplicate and balance checks → recurring, transfer and anomaly analysis → spending and investment views": [
    "账单 → 标准化、重复与余额检查 → 周期、转账与异常分析 → 支出与投资视图",
    "帳單 → 標準化、重複與餘額檢查 → 週期、轉帳與異常分析 → 支出與投資視圖"
  ],
  "Import an example statement twice to check that repeated rows are recognised, then explore recurring payments, transfers and the investment view.": [
    "将示例账单导入两次，检查重复记录是否被识别，再探索定期付款、转账和投资视图。",
    "將示例帳單匯入兩次，檢查重複記錄是否被識別，再探索定期付款、轉帳和投資視圖。"
  ],
  "A valid meeting time must work across time zones, busy calendars and allocation rules, even when two visitors try to book it together.": [
    "有效的会议时间必须同时满足时区、忙碌日历和分配规则，即使两位访客同时尝试预约。",
    "有效的會議時間必須同時滿足時區、忙碌日曆和分配規則，即使兩位訪客同時嘗試預約。"
  ],
  "I implemented individual, weighted round-robin, collective and first-available scheduling, with local working hours, buffers, UTC reservations and final conflict checks. The product also connects calendar events, email and booking-management links.": [
    "我实现了个人、加权轮询、集体和首位可用排期，加入本地工作时段、缓冲、UTC 预留和最终冲突检查。产品还连接日历事件、邮件和预约管理链接。",
    "我實現了個人、加權輪詢、集體和首位可用排期，加入本地工作時段、緩衝、UTC 預留和最終衝突檢查。產品還連接日曆事件、郵件和預約管理連結。"
  ],
  "working hours and busy calendars → host allocation → UTC reservation with ten-minute expiry → database conflict check → calendar, email and ICS": [
    "工作时段与繁忙日历 → 主持人分配 → 十分钟到期的 UTC 预留 → 数据库冲突检查 → 日历、邮件与 ICS",
    "工作時段與忙碌行事曆 → 主持人分配 → 十分鐘到期的 UTC 預留 → 資料庫衝突檢查 → 行事曆、郵件與 ICS"
  ],
  "Change the allocation mode, inspect why a slot is unavailable, then reserve an available time and try a competing booking.": [
    "切换分配方式，检查某个时间为何不可用，再预留可用时段并尝试一次竞争预约。",
    "切換分配方式，檢查某個時間為何不可用，再預留可用時段並嘗試一次競爭預約。"
  ],
  "Daily lessons, vocabulary review and writing practice become hard to sustain when they are scattered across separate materials.": [
    "每日课程、词汇复习和写作练习分散在不同材料中时，很难长期坚持。",
    "每日課程、詞彙複習和寫作練習分散在不同材料中時，很難長期堅持。"
  ],
  "I organised 56 daily agendas and 28 lesson hubs, built adaptive practice and spaced repetition, and added progress tracking across five language-skill areas. Local caching and revision checks preserve learner work when synchronisation conflicts occur.": [
    "我编排了 56 份每日计划和 28 个课程中心，构建自适应练习与间隔复习，并分别跟踪五项语言技能。本地缓存和版本检查在同步冲突时保护学习成果。",
    "我編排了 56 份每日計劃和 28 個課程中心，建置自適應練習與間隔複習，並分別跟蹤五項語言技能。本地快取和版本檢查在同步衝突時保護學習成果。"
  ],
  "daily plan → adaptive practice and four-way recall → mastery and five language-skill evidence lanes → revision-safe synchronisation": [
    "每日计划 → 自适应练习与四档回忆 → 掌握度与五项语言技能证据 → 版本安全同步",
    "每日計畫 → 自適應練習與四級回憶 → 掌握度與五項語言技能證據 → 版本安全同步"
  ],
  "Answer a practice question, inspect the progress update, grade a vocabulary card and explore how the app recovers a conflicting saved revision.": [
    "回答一道练习题，查看进度更新，给词汇卡评分，再探索应用如何恢复冲突的保存版本。",
    "回答一道練習題，查看進度更新，給詞彙卡評分，再探索應用如何恢復衝突的保存版本。"
  ],
  "A course catalogue can offer many options without making it clear which ones suit a learner’s interests and constraints.": [
    "课程目录可能提供许多选择，却未说明哪些课程适合学习者的兴趣与条件。",
    "課程目錄可能提供許多選擇，卻未說明哪些課程適合學習者的興趣與條件。"
  ],
  "I built a four-step course-discovery prototype with a React interface and supporting API services. Its initial ranking was random; the browser companion adds an illustrative weighted comparison so visitors can examine how preference choices affect the order.": [
    "我构建了四步课程发现原型，包含 React 界面与配套 API 服务。初始排序是随机的；浏览器配套工具加入说明性加权比较，让访客检查偏好如何影响排序。",
    "我建置了四步課程發現原型，包含 React 介面與配套 API 服務。初始排序是隨機的；瀏覽器配套工具加入說明性加權比較，讓訪客檢查偏好如何影響排序。"
  ],
  "learner preferences → browser filters and random ordering → separate API contract check → illustrative weighted comparison": [
    "学习偏好 → 浏览器筛选与随机排序 → 独立 API 契约检查 → 示意性加权比较",
    "學習偏好 → 瀏覽器篩選與隨機排序 → 獨立 API 契約檢查 → 示意性加權比較"
  ],
  "Choose preferences, compare two random orderings, then change one weight in the illustrative ranking and inspect which courses move.": [
    "选择偏好，比较两次随机排序，再调整说明性排序中的一个权重，检查哪些课程移动了位置。",
    "選擇偏好，比較兩次隨機排序，再調整說明性排序中的一個權重，檢查哪些課程移動了位置。"
  ],
  "An agent must learn from the consequences of its actions while balancing uncertain rewards, delayed outcomes and limited feedback.": [
    "智能体必须从行动后果中学习，同时应对不确定奖励、延迟结果和有限反馈。",
    "智能體必須從行動後果中學習，同時應對不確定獎勵、延遲結果和有限回饋。"
  ],
  "bandits and value updates → policy and deep RL → offline and model-based learning → language-model post-training → applied decision problems": [
    "多臂老虎机与价值更新 → 策略和深度强化学习 → 离线与基于模型的学习 → 语言模型后训练 → 实际决策问题",
    "多臂老虎機與價值更新 → 策略和深度強化學習 → 離線與基於模型的學習 → 語言模型後訓練 → 實際決策問題"
  ],
  "Train 100 CliffWalking episodes, inspect a value update and test the learned route. Then compare recorded answers before and after fine-tuning and try the LoRA and DPO controls.": [
    "训练 100 轮 CliffWalking，检查一次价值更新并测试学到的路线。再比较微调前后的记录答案，尝试 LoRA 和 DPO 控制。",
    "訓練 100 輪 CliffWalking，檢查一次價值更新並測試學到的路線。再比較微調前後的記錄答案，嘗試 LoRA 和 DPO 控制。"
  ],
  "Trying an unfamiliar option may reveal a better reward, but spending too long exploring can sacrifice good choices already known.": [
    "尝试陌生选项可能发现更好的奖励，但探索过久也可能错过已经知道的好选择。",
    "嘗試陌生選項可能發現更好的獎勵，但探索過久也可能錯過已經知道的好選擇。"
  ],
  "I built a browser companion to the first STUDY-RL module with epsilon-greedy, UCB1 and Thompson Sampling, seeded rewards and twelve paired runs for comparison.": [
    "我为 STUDY-RL 第一模块构建了浏览器配套工具，包含 epsilon-greedy、UCB1、Thompson Sampling、带种子的奖励和十二组配对比较。",
    "我為 STUDY-RL 第一模組建置了瀏覽器配套工具，包含 epsilon-greedy、UCB1、Thompson Sampling、帶種子的獎勵和十二組配對比較。"
  ],
  "available actions → policy choice → reward → updated estimates → regret and repeated-run comparison": [
    "可选动作 → 策略选择 → 奖励 → 估计更新 → 遗憾与重复实验比较",
    "可選動作 → 策略選擇 → 獎勵 → 估計更新 → 遺憾與重複實驗比較"
  ],
  "Step through the first observations, run 100 rounds and compare the policies. Inspect both expected reward gaps and the noisier realised reward trace.": [
    "逐步观察最初几次探索，运行 100 轮并比较策略，同时检查期望奖励差距和波动更大的实际奖励曲线。",
    "逐步觀察最初幾次探索，執行 100 輪並比較策略，同時檢查期望獎勵差距和波動更大的實際獎勵曲線。"
  ],
  "orientation-corrected image → grayscale backbone → pose or depth head → checkpoint, error and split checks": [
    "方向校正图像 → 灰度主干网络 → 姿态或深度输出头 → 检查点、误差与数据划分检查",
    "方向校正圖像 → 灰階主幹網路 → 姿態或深度輸出頭 → 檢查點、誤差與資料劃分檢查"
  ],
  "undersampled k-space → zero-filled image → residual U-Net → three soft data-consistency steps → uncertainty and segmentation checks": [
    "欠采样 k 空间 → 零填充图像 → 残差 U-Net → 三步软数据一致性 → 不确定性与分割检查",
    "欠取樣 k 空間 → 零填充圖像 → 殘差 U-Net → 三步軟資料一致性 → 不確定性與分割檢查"
  ],
  "previous mesh or grid flow fields → spectral, graph or convolutional model → future velocity and pressure → single-step and rollout evaluation": [
    "过去的网格或栅格流场 → 频谱、图或卷积模型 → 未来速度与压力 → 单步与滚动预测评估",
    "過去的網格或柵格流場 → 頻譜、圖或卷積模型 → 未來速度與壓力 → 單步與滾動預測評估"
  ],
  "A confident prediction can still be wrong, and a model that works on familiar data may become unreliable as the inputs change.": [
    "高置信度预测仍可能出错；在熟悉数据上表现良好的模型，也可能随输入变化而变得不可靠。",
    "高信心度預測仍可能出錯；在熟悉資料上表現良好的模型，也可能隨輸入變化而變得不可靠。"
  ],
  "I studied bootstrap and Bayesian uncertainty, temperature scaling and split-conformal prediction through computational exercises. The work records a small ECE improvement and 95.75% empirical coverage under exchangeability, alongside cases where calibration or shift worsens other measures.": [
    "我通过计算练习研究 自助重采样 与 贝叶斯 不确定性、温度缩放和分割共形预测。工作记录了小幅 ECE 改善及可交换条件下 95.75% 经验覆盖率，同时保留校准或分布变化使其他指标恶化的情况。",
    "我透過計算練習研究 自助重抽樣 與 貝氏 不確定性、溫度縮放和分割共形預測。工作記錄了小幅 ECE 改善及可交換條件下 95.75% 經驗覆蓋率，同時保留校準或分布變化使其他指標惡化的情況。"
  ],
  "model scores and labels → uncertainty and calibration → prediction sets → coverage and distribution-shift checks": [
    "模型分数与标签 → 不确定性和校准 → 预测集合 → 覆盖率与分布变化检查",
    "模型分數與標籤 → 不確定性和校準 → 預測集合 → 覆蓋率與分布變化檢查"
  ],
  "Change calibration and shift settings, compare the confidence curve and prediction-set size, then inspect how coverage changes when the calibration data no longer represent the new inputs.": [
    "改变校准和分布变化设置，比较置信度曲线与预测集合大小，再检查校准数据不再代表新输入时覆盖率如何变化。",
    "改變校準和分布變化設定，比較信心度曲線與預測集合大小，再檢查校準資料不再代表新輸入時覆蓋率如何變化。"
  ],
  "Using every available sensor can be expensive, while a small or opaque model may miss important patterns in pollution measurements.": [
    "使用所有传感器可能成本过高，而小型或不透明模型可能遗漏重要污染模式。",
    "使用所有感測器可能成本過高，而小型或不透明模型可能遺漏重要汙染模式。"
  ],
  "I analysed 7,674 ambient observations, fitted training-only imputation and scaling, and compared OLS, Ridge, LASSO and two kernel models. A later exercise connects selected signals to assumed hardware prices; the random split does not establish future-time or new-site performance.": [
    "我分析了 7,674 次环境观测，仅在训练集拟合填补与缩放，并比较 OLS、Ridge、LASSO 和两种核模型。后续练习把选定信号连接到假设硬件价格；随机切分不能证明未来时间或新地点的性能。",
    "我分析了 7,674 次環境觀測，僅在訓練集擬合填補與縮放，並比較 OLS、Ridge、LASSO 和兩種核模型。後續練習把選定訊號連接到假設硬體價格；隨機切分不能證明未來時間或新地點的性能。"
  ],
  "sensor and environmental observations → missing-value handling and scaling → five regression models → error and sensor-cost comparison": [
    "传感器与环境观测 → 缺失处理和缩放 → 五种回归模型 → 误差与传感器成本比较",
    "感測器與環境觀測 → 缺失處理和縮放 → 五種迴歸模型 → 誤差與感測器成本比較"
  ],
  "Compare the five recorded models, inspect which measurements are missing, then adjust the sensor budget and interpretability preference in the illustrative decision view.": [
    "比较五种记录模型，检查缺失测量，再在说明性决策视图中调整传感器预算和可解释性偏好。",
    "比較五種記錄模型，檢查缺失測量，再在說明性決策視圖中調整感測器預算和可解釋性偏好。"
  ],
  "A detection threshold controls which network flows trigger attention, balancing missed threats against the cost of investigating benign traffic.": [
    "检测阈值决定哪些网络流量需要关注，在漏掉威胁与调查正常流量的成本之间取舍。",
    "檢測閾值決定哪些網路流量需要關注，在漏掉威脅與調查正常流量的成本之間取捨。"
  ],
  "I compared logistic and kernel classifiers on 10,000 labelled network-flow rows. Later review found repeated rows across the split, preprocessing leakage and test-selected thresholds, so the historical curves are useful for learning the workflow but do not establish held-out detection performance.": [
    "我在 10,000 条标记网络流量记录上比较逻辑回归与核分类器。后续检查发现切分两侧的重复记录、预处理泄漏和测试集选阈值，因此历史曲线可用于学习流程，却不能证明独立测试中的检测性能。",
    "我在 10,000 條標記網路流量記錄上比較邏輯迴歸與核分類器。後續檢查發現切分兩側的重複記錄、預處理洩漏和測試集選閾值，因此歷史曲線可用於學習流程，卻不能證明獨立測試中的檢測性能。"
  ],
  "network-flow features → classifier score → alert threshold → false alarms, missed attacks and expected cost": [
    "网络流量特征 → 分类器分数 → 告警阈值 → 误报、漏报与期望成本",
    "網路流量特徵 → 分類器分數 → 告警閾值 → 誤報、漏報與期望成本"
  ],
  "Change the relative cost of a missed attack and a false alarm, observe how the preferred threshold moves, and read why these historical results require a cleaner evaluation.": [
    "调整漏报攻击和误报的相对成本，观察优选阈值如何移动，再阅读这些历史结果为何需要更干净的评估。",
    "調整漏報攻擊和誤報的相對成本，觀察優選閾值如何移動，再閱讀這些歷史結果為何需要更乾淨的評估。"
  ],
  "Correlated or weak predictors can make a regression model unstable and encourage it to fit noise.": [
    "相关或弱预测变量可能让回归模型不稳定，并鼓励模型拟合噪声。",
    "相關或弱預測變量可能讓迴歸模型不穩定，並鼓勵模型擬合雜訊。"
  ],
  "I compared regularised regressions in the air-quality study and built a browser companion with an orthonormal synthetic example, where the shrinkage calculations can be followed exactly.": [
    "我在空气质量研究中比较正则化回归，并建立正交归一合成示例的浏览器配套工具，让收缩计算可以精确追踪。",
    "我在空氣品質研究中比較正則化迴歸，並建立正交歸一合成示例的瀏覽器配套工具，讓收縮計算可以精確追蹤。"
  ],
  "illustrative standardised coefficients → chosen penalty strength → shrinkage or soft threshold → coefficient paths and active features": [
    "说明性标准化系数 → 惩罚强度 → 收缩或软阈值 → 系数路径与有效特征",
    "說明性標準化係數 → 懲罰強度 → 收縮或軟閾值 → 係數路徑與有效特徵"
  ],
  "Raise the penalty until a LASSO coefficient reaches zero, compare it with Ridge, then open the air-quality project to see the recorded model comparison.": [
    "提高惩罚，直到一个 LASSO 系数归零，与 Ridge 比较，再打开空气质量项目查看记录的模型比较。",
    "提高懲罰，直到一個 LASSO 係數歸零，與 Ridge 比較，再打開空氣品質專案查看記錄的模型比較。"
  ],
  "Automating too many uncertain cases can leave costly errors unreviewed, while sending everything to a person overwhelms the review process.": [
    "自动处理过多不确定案例可能留下高成本误判，而全部交给人工则会压垮审阅流程。",
    "自動處理過多不確定案例可能留下高成本誤判，而全部交給人工則會壓垮審閱流程。"
  ],
  "claim features → calibrated score and uncertainty → deferral rule → automated decisions or human review → coverage and tail risk": [
    "理赔特征 → 校准分数与不确定性 → 转交规则 → 自动决定或人工审阅 → 覆盖率与尾部风险",
    "理賠特徵 → 校準分數與不確定性 → 轉交規則 → 自動決定或人工審閱 → 覆蓋率與尾部風險"
  ],
  "Observed outcomes mix the effects of decisions with the circumstances that caused those decisions to be made.": [
    "观测结果混合了决策本身的效果，以及促使该决策被作出的背景因素。",
    "觀測結果混合了決策本身的效果，以及促使該決策被作出的背景因素。"
  ],
  "I built a synthetic causal example and adapted the STUDY-RL off-policy estimators into an interactive lab. It compares IPS, SNIPS, Direct, doubly robust and SWITCH-DR estimates while making overlap and sample-weight concentration visible.": [
    "我构建合成因果示例，并把 STUDY-RL 离策略估计方法改造成交互实验室。它比较 IPS、SNIPS、Direct、双重稳健和 SWITCH-DR，同时显示重叠与样本权重集中程度。",
    "我建置合成因果示例，並把 STUDY-RL 離策略估計方法改造成互動實驗室。它比較 IPS、SNIPS、Direct、雙重穩健和 SWITCH-DR，同時顯示重疊與樣本權重集中程度。"
  ],
  "observations or logged context, action, reward and propensity → adjustment or ridge reward model → effect and value estimates → overlap and effective sample size": [
    "观测或记录的情境、动作、奖励与倾向概率 → 调整或岭回归奖励模型 → 效应与价值估计 → 重叠与有效样本量",
    "觀測或記錄的情境、動作、獎勵與傾向機率 → 調整或嶺迴歸獎勵模型 → 效應與價值估計 → 重疊與有效樣本量"
  ],
  "Explore a confounder and a collider in the causal graph, then switch to policy evaluation and reduce overlap to see the estimates become less stable.": [
    "在因果图中探索混杂因素和碰撞点，再切换策略评估并降低重叠，观察估计如何变得不稳定。",
    "在因果圖中探索混雜因素和碰撞點，再切換策略評估並降低重疊，觀察估計如何變得不穩定。"
  ],
  "New ventures need resources and freedom to explore, but they also need a workable relationship with the existing organisation.": [
    "新业务需要资源和探索自由，也必须与现有组织形成可行的关系。",
    "新業務需要資源和探索自由，也必須與現有組織形成可行的關係。"
  ],
  "ownership and resource authority → organisational model → portfolio allocation, concentration and effective model count → transition questions": [
    "所有权与资源权限 → 组织模型 → 组合分配、集中度与有效模型数量 → 转型问题",
    "所有權與資源權限 → 組織模型 → 組合分配、集中度與有效模型數量 → 轉型問題"
  ],
  "A promising pitch still needs credible demand, a realistic route to customers and enough funding to reach the next useful milestone.": [
    "有吸引力的路演仍需要可信需求、现实的获客路线，以及足够资金来达到下一个有用里程碑。",
    "有吸引力的路演仍需要可信需求、現實的獲客路線，以及足夠資金來達到下一個有用里程碑。"
  ],
  "Strengthen a traction claim, lower the sales-conversion assumption and change the funding ask to see whether the next milestone remains achievable.": [
    "增强一项进展主张，降低销售转化假设并改变融资要求，观察下一里程碑是否仍然可达。",
    "增強一項進展主張，降低銷售轉化假設並改變融資要求，觀察下一里程碑是否仍然可達。"
  ],
  "Predicting pressure and phase behaviour requires a model that connects temperature, density and composition with molecular size and attraction.": [
    "预测压力与相行为，需要把温度、密度和组成与分子大小和吸引力联系起来的模型。",
    "預測壓力與相行為，需要把溫度、密度和組成與分子大小和吸引力聯繫起來的模型。"
  ],
  "molecular parameters and state → effective diameters and Lorentz–Berthelot mixing → hard-chain and dispersion Helmholtz terms → compressibility and pressure": [
    "分子参数与状态 → 有效直径和 Lorentz–Berthelot 混合 → 硬链与色散亥姆霍兹能项 → 压缩因子与压力",
    "分子參數與狀態 → 有效直徑和 Lorentz–Berthelot 混合 → 硬鏈與色散亥姆霍茲能項 → 壓縮因子與壓力"
  ],
  "Change density and mixture interaction strength, inspect the pressure curve, then follow the equations to see which energy contribution changes.": [
    "改变密度和混合物相互作用，检查压力曲线，再沿方程观察哪一项能量贡献发生变化。",
    "改變密度和混合物相互作用，檢查壓力曲線，再沿方程觀察哪一項能量貢獻發生變化。"
  ],
  "Solubility depends on both the solid’s fusion thermodynamics and interactions in the liquid, and model outputs must be converted into laboratory reporting units.": [
    "溶解度既取决于固体熔融热力学，也取决于液体中的相互作用；模型输出还必须换算为实验报告单位。",
    "溶解度既取決於固體熔融熱力學，也取決於液體中的相互作用；模型輸出還必須換算為實驗報告單位。"
  ],
  "I built Julia solid–liquid equilibrium workflows using fusion-property and liquid-phase models in Clapeyron. The public companion uses invented compounds to demonstrate a log-space solver, mole-to-mass conversion and separate calibration and holdout rows.": [
    "我在 Clapeyron 中使用熔融性质和液相模型建立 Julia 固液平衡工作流。公开配套工具用虚构化合物展示对数空间求解、摩尔到质量转换，以及分开的校准和留出数据。",
    "我在 Clapeyron 中使用熔融性質和液相模型建立 Julia 固液平衡工作流。公開配套工具用虛構化合物展示對數空間求解、摩爾到質量轉換，以及分開的校準和留出資料。"
  ],
  "fusion properties, liquid interactions and temperature → equilibrium concentration → reporting-unit conversion → calibration and holdout comparison": [
    "熔融性质、液相相互作用与温度 → 平衡浓度 → 报告单位换算 → 校准与留出比较",
    "熔融性質、液相相互作用與溫度 → 平衡濃度 → 報告單位換算 → 校準與留出比較"
  ],
  "Change temperature, inspect the solver residual, switch between mole fraction and mg per gram of solvent, then fit the fictional calibration rows and compare the holdout.": [
    "改变温度，检查求解残差，在摩尔分数和每克溶剂毫克数之间切换，再拟合虚构校准数据并比较留出结果。",
    "改變溫度，檢查求解殘差，在摩爾分數和每克溶劑毫克數之間切換，再擬合虛構校準資料並比較留出結果。"
  ],
  "Macrocyclic molecules can adopt many conformations whose spectral lines overlap, making a single peak insufficient to identify a structure.": [
    "大环分子可以形成许多谱线重叠的构象，单个谱峰不足以确定结构。",
    "大環分子可以形成許多譜線重疊的構象，單個譜峰不足以確定結構。"
  ],
  "conformer search → predicted spectroscopic parameters → CP-FTMW measurements → multiple line matches → candidate structure": [
    "构象搜索 → 预测光谱参数 → CP-FTMW 测量 → 多谱线匹配 → 候选结构",
    "構象搜尋 → 預測光譜參數 → CP-FTMW 測量 → 多譜線匹配 → 候選結構"
  ],
  "Compare a candidate with a decoy, offset the synthetic spectrum and inspect several matched lines. Then rotate the conformer view and test how matching order changes coverage.": [
    "比较候选结构与干扰项，平移合成光谱并检查多条匹配线，再旋转构象视图，测试匹配顺序如何改变覆盖率。",
    "比較候選結構與干擾項，平移合成光譜並檢查多條匹配線，再旋轉構象視圖，測試匹配順序如何改變覆蓋率。"
  ],
  "Inspecting narrow frequency windows and producing consistent plots can take repeated manual work in a general-purpose plotting tool.": [
    "在通用绘图工具中检查狭窄频率窗口并生成一致图表，往往需要重复手动操作。",
    "在通用繪圖工具中檢查狹窄頻率窗口並生成一致圖表，往往需要重複手動操作。"
  ],
  "I built a MATLAB App Designer utility with titles, axis labels, colours, exact frequency panning and high-resolution export. The browser reproduces the plotting controls using a generated trace.": [
    "我构建 MATLAB App Designer 工具，支持标题、坐标标签、颜色、精确频率平移与高分辨率导出。浏览器使用生成谱线重现这些绘图控制。",
    "我建置 MATLAB App Designer 工具，支持標題、座標標籤、顏色、精確頻率平移與高解析度匯出。瀏覽器使用生成譜線重現這些繪圖控制。"
  ],
  "frequency and intensity columns → labels and plot settings → selected frequency window → exported figure": [
    "频率与强度列 → 标签和绘图设置 → 选定频率窗口 → 导出图表",
    "頻率與強度欄 → 標籤和繪圖設定 → 選定頻率視窗 → 匯出圖表"
  ],
  "Centre the trace on a frequency, pan by 0.1 and 100 MHz, change the visible range and inspect the export dimensions.": [
    "把谱线居中到某个频率，以 0.1 和 100 MHz 平移，改变显示范围并检查导出尺寸。",
    "把譜線居中到某個頻率，以 0.1 和 100 MHz 平移，改變顯示範圍並檢查匯出尺寸。"
  ],
  "Operating systems, processor architectures and accelerator drivers require different installation routes, and a completed install may still lack usable GPU support.": [
    "操作系统、处理器架构和加速器驱动要求不同安装路线，而安装完成后仍可能无法使用 GPU。",
    "操作系統、處理器架構和加速器驅動要求不同安裝路線，而安裝完成後仍可能無法使用 GPU。"
  ],
  "I built a Bash installer for a Python 3.13 Conda environment, scientific packages, PyTorch, TensorFlow and the Hugging Face CLI. The browser planner explains those branches and lets visitors simulate failures without installing anything.": [
    "我编写 Bash 安装器，配置 Python 3.13 Conda、科学软件包、PyTorch、TensorFlow 和 Hugging Face CLI。浏览器规划器解释这些分支，让访客模拟失败而不安装任何东西。",
    "我編寫 Bash 安裝器，配置 Python 3.13 Conda、科學套件、PyTorch、TensorFlow 和 Hugging Face CLI。瀏覽器規劃器解釋這些分支，讓訪客模擬失敗而不安裝任何東西。"
  ],
  "host and accelerator → platform and CUDA/MPS route → 19 core, four framework and one CLI target → fallbacks → import and device checks": [
    "主机与加速器 → 平台和 CUDA/MPS 路径 → 19 个核心、四个框架与一个 CLI 目标 → 回退 → 导入与设备检查",
    "主機與加速器 → 平台和 CUDA/MPS 路徑 → 19 個核心、四個框架與一個 CLI 目標 → 備援 → 匯入與裝置檢查"
  ],
  "Choose an Apple Silicon or CUDA example, simulate a framework failure and compare the resulting package and verification route.": [
    "选择 Apple Silicon 或 CUDA 示例，模拟框架失败，再比较产生的软件包与验证路线。",
    "選擇 Apple Silicon 或 CUDA 示例，模擬框架失敗，再比較產生的套件與驗證路線。"
  ],
  "Applications depend on networks, databases and scheduled jobs; a failure can affect several services and make recovery difficult.": [
    "应用依赖网络、数据库和定时任务；一次故障可能影响多项服务，并让恢复变得困难。",
    "應用依賴網路、資料庫和定時任務；一次故障可能影響多項服務，並讓恢復變得困難。"
  ],
  "Compose services, networks and mounts → declared dependency paths → simulated failure → backup capacity → recovery and health-check gaps": [
    "Compose 服务、网络与挂载 → 声明的依赖路径 → 模拟故障 → 备份容量 → 恢复与健康检查缺口",
    "Compose 服務、網路與掛載 → 宣告的依賴路徑 → 模擬故障 → 備份容量 → 恢復與健康檢查缺口"
  ],
  "Trace the scheduler-to-database connection, fail the database and inspect the affected paths, then change backup size and retention to estimate storage.": [
    "追踪调度器与数据库的连接，使数据库发生故障并检查受影响路径，再调整备份大小和保留期以估算存储。",
    "追蹤調度器與資料庫的連接，使資料庫發生故障並檢查受影響路徑，再調整備份大小和保留期以估算儲存。"
  ],
  "Buy/sell direction, trade size and random impact can combine to produce price paths that are difficult to understand from a formula alone.": [
    "买卖方向、交易规模和随机冲击结合后产生的价格路径，仅看公式往往难以理解。",
    "買賣方向、交易規模和隨機衝擊結合後產生的價格路徑，僅看公式往往難以理解。"
  ],
  "I wrote a Julia single-stock simulation with sentiment-biased events and random, quantity-scaled price impact. The browser adds seeded replay and compares the original partial-day statistics with a corrected full-day window; it is a toy model rather than a market forecast.": [
    "我编写 Julia 单股模拟，包含受情绪影响的事件和随数量变化的随机价格冲击。浏览器加入种子重放，比较原始部分日统计与修正后的全日窗口；它是简化模型，不是市场预测。",
    "我編寫 Julia 單股模擬，包含受情緒影響的事件和隨數量變化的隨機價格衝擊。瀏覽器加入種子重放，比較原始部分日統計與修正後的全日窗口；它是簡化模型，不是市場預測。"
  ],
  "sentiment and five traders × ten loops → quantity-scaled random price impact → 50-event ledger → original and full-day statistics": [
    "情绪与五名交易者 × 十轮 → 按数量缩放的随机价格冲击 → 50 个事件的账本 → 原始与全日统计",
    "情緒與五名交易者 × 十輪 → 按數量縮放的隨機價格衝擊 → 50 個事件的帳本 → 原始與全日統計"
  ],
  "Run a seeded day, change sentiment or the price-floor scenario, then compare the event trace and the two daily-statistic windows.": [
    "运行一个带种子的模拟日，改变情绪或价格下限情境，再比较事件曲线与两种日统计窗口。",
    "執行一個帶種子的模擬日，改變情緒或價格下限情境，再比較事件曲線與兩種日統計窗口。"
  ],
  "Ideas such as thermal sampling, polymer shape and molecular motion become clearer when their update rules and numerical consequences can be explored.": [
    "能够探索更新规则和数值后果时，热采样、高分子形状和分子运动等概念会更清楚。",
    "能夠探索更新規則和數值後果時，熱取樣、高分子形狀和分子運動等概念會更清楚。"
  ],
  "I completed and extended scientific-computing course exercises, then added Julia and React experiments. The browser combines seeded Lennard-Jones sampling, three polymer models, a four-particle velocity-Verlet trajectory and recorded basis-set and cation–π calculations.": [
    "我完成并扩展科学计算课程练习，之后加入 Julia 和 React 实验。浏览器组合带种子的 Lennard-Jones 采样、三种高分子模型、四粒子 velocity-Verlet 轨迹，以及记录的基组和阳离子–π 计算。",
    "我完成並擴展科學計算課程練習，之後加入 Julia 和 React 實驗。瀏覽器組合帶種子的 Lennard-Jones 取樣、三種高分子模型、四粒子 velocity-Verlet 軌跡，以及記錄的基組和陽離子–π 計算。"
  ],
  "molecular model and parameters → sampling, integration or energy calculation → configurations and readouts → physical interpretation": [
    "分子模型与参数 → 采样、积分或能量计算 → 构型与数值 → 物理解释",
    "分子模型與參數 → 取樣、積分或能量計算 → 構型與數值 → 物理解釋"
  ],
  "Run the Metropolis sampler, compare polymer shapes, step through velocity Verlet and inspect energy drift, then calculate a basis-set or cation–π energy difference.": [
    "运行 Metropolis 采样器，比较高分子形状，逐步执行 velocity Verlet 并检查能量漂移，再计算基组或阳离子–π 能量差。",
    "執行 Metropolis 取樣器，比較高分子形狀，逐步執行 velocity Verlet 並檢查能量漂移，再計算基組或陽離子–π 能量差。"
  ],
  "Application evidence and interview context arrive in separate systems, making a shortlist difficult to explain.": [
    "申请材料和面试背景分散在不同系统中，使候选名单难以解释。",
    "申請材料和麵試背景分散在不同系統中，使候選名單難以解釋。"
  ],
  "I founded COVERD and led work on application review and company-aware voice interviews within recruiters’ existing applicant tracking systems.": ["我创立 COVERD，并带领团队在招聘人员现有的申请人追踪系统中开发申请审查和结合公司背景的语音面试。", "我創立 COVERD，並帶領團隊在招募人員現有的應徵者追蹤系統中開發申請審查及結合公司背景的語音面試。"],
  "ATS applications → specialist evidence review → voice enrichment → reasoned shortlist → recruiter decision": [
    "ATS 申请 → 专业材料审阅 → 语音信息补充 → 有理由的候选名单 → 招聘人员决定",
    "ATS 申請 → 專業材料審閱 → 語音資訊補充 → 有理由的候選名單 → 招募人員決定"
  ],
  "Open the COVERD product file and trace one application through evidence review, voice enrichment and the human decision boundary.": [
    "打开 COVERD 产品页面，沿一份申请追踪材料审阅、语音补充和人工决策。",
    "打開 COVERD 產品頁面，沿一份申請追蹤材料審閱、語音補充和人工決策。"
  ],
  "Running GPU-assisted molecular simulation on a Windows workstation requires the Linux, driver and container layers to work together.": [
    "在 Windows 工作站上运行 GPU 辅助分子模拟，需要 Linux、驱动与容器层共同工作。",
    "在 Windows 工作站上執行 GPU 輔助分子模擬，需要 Linux、驅動與容器層共同工作。"
  ],
  "I configured WSL 2, CUDA and Docker and completed a containerised GROMACS topology-preparation step. This work covers environment setup and preprocessing, not a full molecular-dynamics run.": [
    "我配置 WSL 2、CUDA 和 Docker，完成容器内的 GROMACS 拓扑准备。这项工作涵盖环境配置和预处理，并非完整分子动力学运行。",
    "我配置 WSL 2、CUDA 和 Docker，完成容器內的 GROMACS 拓撲準備。這項工作涵蓋環境配置和預處理，並非完整分子動力學執行。"
  ],
  "WSL 2 and GPU configuration → container execution → GROMACS topology preparation": [
    "WSL 2 与 GPU 配置 → 容器运行 → GROMACS 拓扑准备",
    "WSL 2 與 GPU 配置 → 容器執行 → GROMACS 拓撲準備"
  ],
  "Read how the environment layers fit together and what the completed topology-preparation step produces.": [
    "阅读环境各层如何协作，以及已完成的拓扑准备步骤产生什么。",
    "閱讀環境各層如何協作，以及已完成的拓撲準備步驟產生什麼。"
  ],
  "Rapidly changing public epidemiological information needed to support operational decisions.": [
    "快速变化的公开流行病学信息需要用于支持行动决策。",
    "快速變化的公開流行病學資訊需要用於支持行動決策。"
  ],
  "I built public-data decision support and workflow automation during COVID-19 emergency operations in national service.": [
    "我在国民服役期间，为 COVID-19 应急行动构建公开数据决策支持和流程自动化。",
    "我在國民服役期間，為 COVID-19 應急行動建置公開資料決策支援和流程自動化。"
  ],
  "public epidemiological data → analysis and workflow support → human operational review": [
    "公开流行病学数据 → 分析与流程支持 → 人工行动审阅",
    "公開流行病學資料 → 分析與流程支援 → 人工行動審閱"
  ],
  "Read the public account of the analysis and operational contribution.": [
    "阅读关于分析工作和行动贡献的公开说明。",
    "閱讀關於分析工作和行動貢獻的公開說明。"
  ],
  "Marsh · Applied AI research": [
    "Marsh · 应用 AI 研究",
    "Marsh · 應用 AI 研究"
  ],
  "May 2026 — Present": [
    "2026 年 5 月—至今",
    "2026 年 5 月—至今"
  ],
  "I carry out applied-AI research in a regulated insurance setting, with documented evaluation and broker review. The linked project uses fictional scenarios; client data and findings remain private.": [
    "我在受监管的保险环境中开展应用 AI 研究，记录评估过程并保留经纪人审核。关联项目使用虚构情境；客户数据和研究发现不公开。",
    "我在受監管的保險環境中開展應用 AI 研究，記錄評估過程並保留經紀人審核。關聯專案使用虛構情境；客戶資料和研究發現不公開。"
  ],
  "COVERD · Founder & Product Lead": [
    "COVERD · 创始人兼产品负责人",
    "COVERD · 創始人兼產品負責人"
  ],
  "Mar 2026 — Present": [
    "2026 年 3 月—至今",
    "2026 年 3 月—至今"
  ],
  "I worked with four design partners on discovery and tested three voice-interview architectures across 20 interviews by April 2026. My ATS-connected product preserves recruiter judgement.": [
    "截至 2026 年 4 月，我与四家设计合作伙伴开展需求探索，并在 20 场面试中测试了三种语音面试架构。我的产品连接 ATS，并保留招聘人员的判断权。",
    "截至 2026 年 4 月，我與四家設計合作夥伴開展需求探索，並在 20 場面試中測試了三種語音面試架構。我的產品連接 ATS，並保留招募人員的判斷權。"
  ],
  "Imperial · MSc AI Applications & Innovation": [
    "帝国理工 · AI 应用与创新硕士",
    "帝國理工 · AI 應用與創新碩士"
  ],
  "Sep 2025 — Sep 2026": [
    "2025 年 9 月—2026 年 9 月",
    "2025 年 9 月—2026 年 9 月"
  ],
  "My MSc studies cover deep learning, AI safety, medical imaging, climate applications and innovation management, connected to the corresponding research and coursework projects.": [
    "我的硕士学习涵盖深度学习、AI 安全、医学影像、气候应用和创新管理，并与相应研究及课程项目关联。",
    "我的碩士學習涵蓋深度學習、AI 安全、醫學影像、氣候應用和創新管理，並與相應研究及課程專案關聯。"
  ],
  "Pfizer · Product ownership": [
    "Pfizer · 产品负责人",
    "Pfizer · 產品負責人"
  ],
  "Oct 2024 — Apr 2026": [
    "2024 年 10 月—2026 年 4 月",
    "2024 年 10 月—2026 年 4 月"
  ],
  "I continued GROWMAT product ownership after my placement, leading its roadmap, stakeholder adoption and development of workload and capacity planning for analytical R&D.": [
    "实习结束后，我继续负责 GROWMAT 产品，推进路线图、利益相关方采用，以及分析研发的工作量与产能规划功能。",
    "實習結束後，我繼續負責 GROWMAT 產品，推進路線圖、利害關係人採用，以及分析研發的工作量與產能規劃功能。"
  ],
  "Pfizer · Analytical R&D placement": [
    "Pfizer · 分析研发实习",
    "Pfizer · 分析研發實習"
  ],
  "Sep 2023 — Aug 2024": [
    "2023 年 9 月—2024 年 8 月",
    "2023 年 9 月—2024 年 8 月"
  ],
  "I built and delivered GROWMAT through product discovery, full-stack delivery, reliability and change management in a regulated R&D environment.": [
    "我在受监管的研发环境中构建并交付 GROWMAT，负责产品需求探索、全栈交付、可靠性和变更管理。",
    "我在受監管的研發環境中建置並交付 GROWMAT，負責產品需求探索、全端交付、可靠性和變更管理。"
  ],
  "King’s · Summer research project": [
    "伦敦国王学院 · 暑期研究项目",
    "倫敦國王學院 · 暑期研究專案"
  ],
  "Jun — Jul 2023": [
    "2023 年 6—7 月",
    "2023 年 6—7 月"
  ],
  "My 2023 research role provides related scientific context for the GROMACS setup work I completed in 2025. That separate project covers environment configuration and topology preparation; it was not part of my 2023 role.": [
    "我在 2023 年的研究经历为 2025 年完成的 GROMACS 配置工作提供相关科学背景。后者是独立项目，涵盖环境配置和拓扑准备，不属于我在 2023 年的研究工作。",
    "我在 2023 年的研究經歷為 2025 年完成的 GROMACS 配置工作提供相關科學背景。後者是獨立專案，涵蓋環境配置和拓撲準備，不屬於我在 2023 年的研究工作。"
  ],
  "King’s · Coding Series Tutor": [
    "伦敦国王学院 · 编程系列导师",
    "倫敦國王學院 · 編程系列導師"
  ],
  "Jan 2023 — Apr 2025": [
    "2023 年 1 月—2025 年 4 月",
    "2023 年 1 月—2025 年 4 月"
  ],
  "I designed and delivered 20+ programming and data-analysis sessions for 80+ chemistry students. My linked computational-chemistry study archive supplies related subject context; its credited coursework is distinct from my teaching curriculum.": [
    "我为 80 多名化学学生设计并讲授了 20 多场编程与数据分析课程。关联的计算化学学习档案提供相关学科背景；其中注明来源的课程作业与我的教学课程不同。",
    "我為 80 多名化學學生設計並講授了 20 多場程式設計與資料分析課程。關聯的計算化學學習檔案提供相關學科背景；其中註明來源的課程作業與我的教學課程不同。"
  ],
  "King’s · Undergraduate Research Fellow": [
    "伦敦国王学院 · 本科研究员",
    "倫敦國王學院 · 本科研究員"
  ],
  "Jun — Jul 2022": [
    "2022 年 6—7 月",
    "2022 年 6—7 月"
  ],
  "I built MATLAB, Python and Excel tools for rotational spectroscopy. The related molecular-recognition work names me as a co-author in the 2025 ISMS conference record.": [
    "我为转动光谱构建 MATLAB、Python 和 Excel 工具。相关分子识别研究在 2025 年 ISMS 会议记录中列我为共同作者。",
    "我為轉動光譜建置 MATLAB、Python 和 Excel 工具。相關分子識別研究在 2025 年 ISMS 會議記錄中列我為共同作者。"
  ],
  "King’s · BSc Chemistry with Biomedicine": [
    "伦敦国王学院 · 化学与生物医学学士",
    "倫敦國王學院 · 化學與生物醫學學士"
  ],
  "Sep 2021 — May 2025": [
    "2021 年 9 月—2025 年 5 月",
    "2021 年 9 月—2025 年 5 月"
  ],
  "I graduated with First-Class Honours after a professional placement and study in computational chemistry, molecular biology, chemical biology and organic chemistry. I also completed the Associate of King’s College London programme.": [
    "我完成专业实习，并学习计算化学、分子生物学、化学生物学和有机化学，以一等荣誉毕业。我也完成了伦敦国王学院院士课程（AKC）。",
    "我完成專業實習，並學習計算化學、分子生物學、化學生物學和有機化學，以一等榮譽畢業。我也完成了倫敦國王學院院士課程（AKC）。"
  ],
  "Singapore Civil Defence Force · National service": [
    "新加坡民防部队 · 国民服役",
    "新加坡民防部隊 · 國民服役"
  ],
  "Jul 2019 — Jul 2021": [
    "2019 年 7 月—2021 年 7 月",
    "2019 年 7 月—2021 年 7 月"
  ],
  "I built public-data decision support and workflow automation during pandemic-era emergency operations, alongside time-critical support for senior leaders.": [
    "我在疫情期间的应急行动中构建公开数据决策支持和流程自动化，并为高层领导提供时效紧迫的支持。",
    "我在疫情期間的應急行動中建置公開資料決策支援和流程自動化，並為高層領導提供時效緊迫的支援。"
  ],
  "Independent · Technical projects": [
    "独立实践 · 技术项目",
    "獨立實踐 · 技術專案"
  ],
  "Ongoing": [
    "持续进行",
    "持續進行"
  ],
  "Career and education connections": [
    "职业与教育关联",
    "職業與教育關聯"
  ],
  "Open source": [
    "开源",
    "開源"
  ],
  "OPEN": [
    "开源",
    "開源"
  ],
  "Code or learning materials have an explicit public licence.": [
    "代码或学习材料具有明确的公开许可。",
    "程式碼或學習材料具有明確的公開許可。"
  ],
  "Public demo": [
    "公开演示",
    "公開演示"
  ],
  "DEMO": [
    "演示",
    "演示"
  ],
  "A safe interactive version runs in this portfolio.": [
    "此作品集中提供可安全使用的交互版本。",
    "此作品集中提供可安全使用的互動版本。"
  ],
  "Case study": [
    "案例研究",
    "案例研究"
  ],
  "STUDY": [
    "研究",
    "研究"
  ],
  "Selected methods and outcomes are available without sensitive source material.": [
    "公开部分方法和成果，不包含敏感原始材料。",
    "公開部分方法和成果，不包含敏感原始材料。"
  ],
  "Private / redacted": [
    "私密／已删减",
    "私密／已刪減"
  ],
  "LOCKED": [
    "私密",
    "私密"
  ],
  "Private data and source stay locked; only approved context, artifacts or synthetic demonstrations are shown.": [
    "私人数据和源代码保持私密，只展示获准公开的背景、资料或合成演示。",
    "私人資料和原始碼保持私密，只展示獲准公開的背景、資料或合成演示。"
  ],
  "Development": [
    "开发过程",
    "開發過程"
  ],
  "I wrote a 25-module reinforcement-learning curriculum with runnable notebooks and worked examples. It starts with learning which option to choose, then moves to agents that plan ahead and language models that learn from preferences. Here you can train an agent to cross a cliff-side grid and see why two algorithms learn different routes. My small-model fine-tuning experiment answered 19 of 32 held-out synthetic prompts correctly, compared with 0 before training; that measures exact answers on this exercise.": ["我编写了包含可运行笔记本和例题的 25 单元强化学习课程。从学习如何选择开始，逐步讲到规划行动的智能体和从偏好中学习的语言模型。在这里，你可以训练智能体穿越悬崖边的网格，观察两种算法为何学出不同路线。我的小模型微调实验在 32 道留出的合成题中答对 19 道，训练前为 0 道；这一结果衡量的是该练习中的精确答案。","我編寫了包含可執行筆記本和例題的 25 單元強化學習課程。從學習如何選擇開始，逐步講到規劃行動的智能體和從偏好中學習的語言模型。在這裡，你可以訓練智能體穿越懸崖邊的網格，觀察兩種演算法為何學出不同路線。我的小模型微調實驗在 32 道留出的合成題中答對 19 道，訓練前為 0 道；這一結果衡量的是該練習中的精確答案。"],
  "I wrote 25 modules that turn reinforcement-learning equations into experiments you can run. The browser lets you train a cliff-walking agent, compare its route with another algorithm, and explore how fine-tuning changes a small language model’s answers.": ["我编写了 25 个单元，把强化学习公式变成可以运行的实验。浏览器中可以训练沿悬崖行走的智能体，比较不同算法的路线，并探索微调如何改变小语言模型的答案。","我編寫了 25 個單元，把強化學習公式變成可以執行的實驗。瀏覽器中可以訓練沿懸崖行走的智能體，比較不同演算法的路線，並探索微調如何改變小語言模型的答案。"],
  "Choose what you want to learn and see how course filters and ranking change your shortlist.": ["选择你想学的内容，看看课程筛选和排序如何改变候选清单。","選擇你想學的內容，看看課程篩選和排序如何改變候選清單。"],
  "I built a four-step course finder with React and FastAPI to turn a learner’s preferences into a shortlist. The early prototype filtered courses but shuffled their order at random. This demo puts that behaviour beside a simple weighted ranking: change the importance of cost, time or subject fit and see why a course moves. It explains the design question I was working on: what makes a recommendation useful to the person receiving it?": ["我用 React 和 FastAPI 搭建了四步课程搜索流程，把学习者的偏好转成候选清单。早期原型能筛选课程，但顺序是随机的。这个演示把原始方式与简单的加权排序放在一起：改变费用、时间或主题匹配的重要性，观察课程为何移动。这解释了我当时在思考的设计问题：怎样的推荐才对使用者有用？","我用 React 和 FastAPI 搭建了四步課程搜尋流程，把學習者的偏好轉成候選清單。早期原型能篩選課程，但順序是隨機的。這個示範把原始方式與簡單的加權排序放在一起：改變費用、時間或主題匹配的重要性，觀察課程為何移動。這解釋了我當時在思考的設計問題：怎樣的推薦才對使用者有用？"],
  "Who gets to try a new idea, and who pays for it? My reflection on four ways companies organise innovation.": ["谁可以尝试新想法，又由谁提供资源？我对企业组织创新的四种方式的反思。","誰可以嘗試新想法，又由誰提供資源？我對企業組織創新的四種方式的反思。"],
  "I wrote this Imperial reflection to understand why useful ideas sometimes stall inside large companies. I compared four arrangements for ownership and funding, then related them to my experience developing automation at Pfizer. My main argument is that time matters too: an idea needs support long enough to become something people can use. The interactive matrix lets you explore the four arrangements before reading my original diagram.": ["我在帝国理工的这篇反思中研究了为什么有用的想法会在大公司中停滞。我比较了四种责任归属和资金安排，并结合自己在辉瑞开发自动化工具的经历。我的主要观点是时间同样重要：一个想法需要持续支持，才能变成真正可用的工具。先在交互矩阵中探索四种安排，再阅读我的原始图表。","我在帝國理工的這篇反思中研究了為什麼有用的想法會在大公司中停滯。我比較了四種責任歸屬和資金安排，並結合自己在輝瑞開發自動化工具的經歷。我的主要觀點是時間同樣重要：一個想法需要持續支持，才能變成真正可用的工具。先在互動矩陣中探索四種安排，再閱讀我的原始圖表。"],
  "I compared the Opportunist, Enabler, Advocate and Producer models in an Imperial reflection, using my Pfizer automation work to question what the two-axis framework leaves out. I built this matrix so you can see how responsibility and funding change the way a new idea is supported.": ["我在帝国理工的反思中比较了机会型、赋能型、倡导型和生产型四种模式，并用自己在辉瑞的自动化工作讨论双轴框架遗漏了什么。我构建了这个矩阵，展示责任和资金如何改变新想法获得支持的方式。","我在帝國理工的反思中比較了機會型、賦能型、倡導型和生產型四種模式，並用自己在輝瑞的自動化工作討論雙軸框架遺漏了什麼。我建構了這個矩陣，展示責任和資金如何改變新想法獲得支持的方式。"],
  "Give an idea a dedicated budget, then give it a named owner. Watch the selected model change from Opportunist to Enabler to Producer. These are different ways to support an idea, not a league table of good and bad companies.": ["先给想法配置专用预算，再指定负责人。观察选中的模式从机会型变成赋能型，再变成生产型。它们是支持想法的不同方式，并不是企业好坏的排名。","先給想法配置專用預算，再指定負責人。觀察選中的模式從機會型變成賦能型，再變成生產型。它們是支持想法的不同方式，並不是企業好壞的排名。"],
  "Venture Planning": ["创业规划","創業規劃"],
  "Work out whether a business idea can reach its next milestone before its money runs out.": ["算一算商业想法能否在资金用完前达到下一个里程碑。","算一算商業想法能否在資金用完前達到下一個里程碑。"],
  "I wrote and critiqued venture proposals to understand how customer demand, a route to market and a funding request fit together. This companion makes the arithmetic tangible: choose an example business, change its customer conversion and spending, and see how many months it has to reach a milestone. The example businesses are invented so you can explore the reasoning without needing a finance background.": ["我撰写并评议创业提案，研究客户需求、市场进入方式和融资需求如何配合。这个演示把计算变得直观：选择示例企业，改变客户转化率和开支，看看还有多少个月可以实现目标。示例企业是虚构的，便于没有财务背景的人探索这些思路。","我撰寫並評議創業提案，研究客戶需求、市場進入方式和融資需求如何配合。這個示範把計算變得直觀：選擇範例企業，改變客戶轉換率和開支，看看還有多少個月可以實現目標。範例企業是虛構的，便於沒有財務背景的人探索這些思路。"],
  "I wrote and critiqued venture proposals, then built this calculator to test their assumptions. It connects the customers a business can realistically reach with its sales, monthly spending and funding needs.": ["我撰写并评议创业提案，随后制作了这个计算器来检验其中的假设。它把企业实际能接触到的客户与销售额、月开支和融资需求联系起来。","我撰寫並評議創業提案，隨後製作了這個計算器來檢驗其中的假設。它把企業實際能接觸到的客戶與銷售額、月開支和融資需求聯繫起來。"],
  "potential customers → expected sales → monthly costs → available funding → months to the next milestone": ["潜在客户 → 预期销售额 → 月成本 → 可用资金 → 达成下一目标所需月份","潛在客戶 → 預期銷售額 → 月成本 → 可用資金 → 達成下一目標所需月份"],
  "I built a small MATLAB App Designer utility because preparing spectroscopy figures meant repeating the same plotting steps. It lets me set labels and colours, move to an exact frequency window and export a high-resolution figure. The browser reproduces those controls with a generated spectrum. Try panning across it to understand how I inspect a dense measurement without redrawing the whole plot.": ["我制作了一个 MATLAB App Designer 小工具，因为整理光谱图时总要重复相同的操作。它可以设置标签和颜色、定位精确的频率窗口，并导出高分辨率图表。浏览器用生成的光谱复现了这些控制。试着平移，了解我如何在不用重画整张图的情况下检查密集测量。","我製作了一個 MATLAB App Designer 小工具，因為整理光譜圖時總要重複相同的操作。它可以設定標籤和顏色、定位精確的頻率視窗，並匯出高解析度圖表。瀏覽器用生成的光譜重現了這些控制。試著平移，瞭解我如何在不用重畫整張圖的情況下檢查密集量測。"],
  "Explore how molecular size and attraction change a fluid’s pressure and phase behaviour.": ["探索分子尺寸和吸引力如何改变流体的压力和相态。","探索分子尺寸和吸引力如何改變流體的壓力和相態。"],
  "I used Julia and Clapeyron to calculate fluid properties and phase equilibrium from a molecular model called PC-SAFT. The question is simple: how do the size of molecules and their attraction to each other change a liquid or gas? Here you can change those assumptions and see the pressure curve respond. The example fluids illustrate the equations; the original Julia work also explores mixtures and critical points.": ["我用 Julia 和 Clapeyron，根据 PC-SAFT 分子模型计算流体性质和相平衡。问题很直观：分子的尺寸和彼此的吸引力如何改变液体或气体？在这里可以改变这些假设，观察压力曲线的变化。示例流体用于解释公式；原始 Julia 工作还研究了混合物和临界点。","我用 Julia 和 Clapeyron，根據 PC-SAFT 分子模型計算流體性質和相平衡。問題很直觀：分子的尺寸和彼此的吸引力如何改變液體或氣體？在這裡可以改變這些假設，觀察壓力曲線的變化。範例流體用於解釋公式；原始 Julia 工作還研究了混合物和臨界點。"],
  "Calculate how temperature and solvent interactions change the amount of a solid that dissolves.": ["计算温度和溶剂相互作用如何改变固体的溶解量。","計算溫度和溶劑交互作用如何改變固體的溶解量。"],
  "I built Julia calculations for solid–liquid equilibrium: how much of a solid can dissolve in a solvent at a given temperature. The workflow combines melting properties with liquid interactions, then converts the answer into units a laboratory can use. In this demo, warm an example mixture and watch both the dissolved fraction and mg per gram of solvent change. You can also fit a few example measurements and check whether the model predicts the remaining ones.": ["我用 Julia 计算固液平衡：在指定温度下，固体能在溶剂中溶解多少。流程把熔融性质和液体相互作用结合，再把结果换算成实验室常用单位。在演示中给示例混合物升温，观察溶解比例和每克溶剂中的毫克数如何变化。还可以拟合部分示例测量，检查模型能否预测其余测量。","我用 Julia 計算固液平衡：在指定溫度下，固體能在溶劑中溶解多少。流程把熔融性質和液體交互作用結合，再把結果換算成實驗室常用單位。在示範中給範例混合物升溫，觀察溶解比例和每克溶劑中的毫克數如何變化。還可以擬合部分範例量測，檢查模型能否預測其餘量測。"],
  "I analysed rotational spectra of Exaltenone and Muscone at King’s College London, comparing predicted molecular shapes with measured lines. I built this browser explanation to show why several matching lines are needed before I can assign a shape to a spectrum.": ["我在伦敦国王学院分析了 Exaltenone 和 Muscone 的转动光谱，将预测的分子构象与测量谱线比较。我制作这个浏览器演示，解释为什么需要匹配多条谱线才能确定分子构象。","我在倫敦國王學院分析了 Exaltenone 和 Muscone 的轉動光譜，將預測的分子構象與量測譜線比較。我製作這個瀏覽器示範，解釋為什麼需要匹配多條譜線才能確定分子構象。"],
  "I run a containerised home lab for my applications, databases, automation and backups. I built it to keep services under my control and to understand what happens when one dependency fails. This demo shows a small example of that setup: stop its database, follow the services that lose their connection, then explore how backup size and retention affect storage. The example explains the design without exposing my live machines or configuration.": ["我运行一个容器化家庭实验室，管理自己的应用、数据库、自动化和备份。我搭建它是为了自主控制服务，并理解某个依赖故障后会发生什么。演示展示了一小部分示例架构：停止数据库，查看哪些服务失去连接，再探索备份大小和保留时间如何影响存储需求。示例能解释设计，同时不暴露我的真实设备或配置。","我執行一個容器化家庭實驗室，管理自己的應用程式、資料庫、自動化和備份。我搭建它是為了自主控制服務，並理解某個相依項目故障後會發生什麼。示範展示了一小部分範例架構：停止資料庫，查看哪些服務失去連線，再探索備份大小和保留時間如何影響儲存需求。範例能解釋設計，同時不暴露我的真實設備或設定。"],
  "I built my home lab to host applications and automate recurring work. This small browser model lets you follow a request from scheduler to API to database and see why a failure in one service affects another.": ["我搭建家庭实验室来托管应用并自动完成重复任务。这个小型浏览器模型可以追踪请求从调度器经过 API 到数据库的过程，理解一个服务的故障为什么会影响另一个。","我搭建家庭實驗室來託管應用程式並自動完成重複任務。這個小型瀏覽器模型可以追蹤請求從排程器經過 API 到資料庫的過程，理解一個服務的故障為什麼會影響另一個。"],
  "I trained three neural networks to predict how fluid moves around a cylinder, then compared their flow predictions.": ["我训练了三种神经网络，预测流体如何绕过圆柱，并比较它们的流场预测。","我訓練了三種神經網路，預測流體如何繞過圓柱，並比較它們的流場預測。"],
  "I trained three models to predict the next flow field around a cylinder. They learn the same physical problem in different ways: one works with waves, one with a mesh, and one with a grid of pixels. Here you can play their saved predictions and see how the wake behind the cylinder changes.": ["我训练了三种模型，预测圆柱周围下一时刻的流场。它们用不同方式学习同一个物理问题：一种处理波，一种处理网格节点，另一种处理像素网格。在这里可以播放保存的预测，观察圆柱后方的尾流如何变化。","我訓練了三種模型，預測圓柱周圍下一時刻的流場。它們用不同方式學習同一個物理問題：一種處理波，一種處理網格節點，另一種處理像素網格。在這裡可以播放儲存的預測，觀察圓柱後方的尾流如何變化。"],
  "Calculating a detailed fluid simulation takes time. I wanted to see how well a trained model could predict the next state, and where its predictions would start to fail.": ["详细计算流体模拟需要时间。我想了解训练后的模型能多准确地预测下一状态，以及预测会从哪里开始失效。","詳細計算流體模擬需要時間。我想瞭解訓練後的模型能多準確地預測下一狀態，以及預測會從哪裡開始失效。"],
  "I reconstructed heart MRI from fewer measurements and checked whether the important structures survived.": ["我用更少的测量重建心脏 MRI，并检查重要结构是否保留下来。","我用更少的量測重建心臟 MRI，並檢查重要結構是否保留下來。"],
  "Taking fewer MRI measurements could shorten a scan, but it leaves gaps in the image. I wanted to recover the heart’s structure while identifying places where the model might be wrong.": ["减少 MRI 测量可能缩短扫描时间，但图像会出现缺失。我想恢复心脏结构，同时找出模型可能出错的位置。","減少 MRI 量測可能縮短掃描時間，但影像會出現缺失。我想復原心臟結構，同時找出模型可能出錯的位置。"],
  "Compare the fully measured image, the incomplete image and my reconstruction in the first saved figure. Look at the heart’s edges. Then change the measurement budget in the browser experiment to see why a shorter scan makes reconstruction harder.": ["在第一张保存的图中，比较完整测量图像、不完整图像和我的重建结果，注意心脏边缘。再在浏览器实验中改变测量预算，了解扫描越短为什么重建越难。","在第一張儲存的圖中，比較完整量測影像、不完整影像和我的重建結果，注意心臟邊緣。再在瀏覽器實驗中改變量測預算，瞭解掃描越短為什麼重建越難。"],
  "I used microscope images to estimate a tiny robot’s tilt and depth, so its position can be tracked.": ["我用显微镜图像估计微型机器人的倾斜角度和深度，以便追踪位置。","我用顯微鏡影像估計微型機器人的傾斜角度和深度，以便追蹤位置。"],
  "I trained image models to read a microrobot’s orientation and depth from a grayscale microscope image. My coursework compared a network I designed with four adapted image models across 2,000 images and 40 orientations. Here you can inspect actual microscope images, see where the models focused, and compare their recorded errors.": ["我训练图像模型，从灰度显微镜图像中读取微型机器人的朝向和深度。课程项目用 2,000 张图像和 40 种朝向，比较我设计的网络与四种改造后的图像模型。在这里可以查看真实显微镜图像、模型关注的位置，并比较记录的误差。","我訓練影像模型，從灰階顯微鏡影像中讀取微型機器人的朝向和深度。課程專案用 2,000 張影像和 40 種朝向，比較我設計的網路與四種改造後的影像模型。在這裡可以查看真實顯微鏡影像、模型關注的位置，並比較記錄的誤差。"],
  "A tiny robot is hard to guide if I cannot tell how it is tilted or how far it sits below the microscope. I wanted an image model to estimate both from the same type of picture.": ["如果无法判断微型机器人的倾斜角度和它在显微镜下的深度，就很难引导它。我想用图像模型从同一类图像中估计两者。","如果無法判斷微型機器人的傾斜角度和它在顯微鏡下的深度，就很難引導它。我想用影像模型從同一類影像中估計兩者。"],
  "Start with the microscope image. Compare the two recorded attention maps to see where each model looked, then switch between pose and depth results. A good orientation score and a small depth error answer different parts of the tracking problem.": ["先查看显微镜图像，比较两张记录的关注图，观察各模型看了哪里，再切换朝向和深度结果。高朝向识别分数与低深度误差回答的是追踪问题的不同部分。","先查看顯微鏡影像，比較兩張記錄的關注圖，觀察各模型看了哪裡，再切換朝向和深度結果。高朝向辨識分數與低深度誤差回答的是追蹤問題的不同部分。"],
  "I built a fraud-classification study that lets a model pass difficult cases to a human reviewer. I compared always deciding automatically with handing over the least reliable predictions. The useful question is how much review is needed to reduce costly mistakes, rather than simply making the accuracy number bigger.": ["我制作了一个欺诈分类研究，让模型把困难案例交给人工审核。我比较了全部自动决定和移交最不可靠预测两种方式。真正有用的问题是需要多少人工审核才能减少代价高昂的错误，而不是只追求更高的准确率。","我製作了一個詐欺分類研究，讓模型把困難案例交給人工審核。我比較了全部自動決定和移交最不可靠預測兩種方式。真正有用的問題是需要多少人工審核才能減少代價高昂的錯誤，而不是只追求更高的準確率。"],
  "Increase the number of cases sent for review. Watch automatic coverage fall and the mistakes among accepted predictions change. Then increase the cost of a missed fraud to see why the same review policy may no longer make sense.": ["增加送交审核的案例数，观察自动处理比例下降，以及保留预测中的错误如何变化。再提高漏判欺诈的代价，看看同一审核策略为何可能不再适合。","增加送交審核的案例數，觀察自動處理比例下降，以及保留預測中的錯誤如何變化。再提高漏判詐欺的代價，看看同一審核策略為何可能不再適合。"],
  "For my MSc thesis, I studied how an insurance broker could narrow a large set of possible insurers to a useful shortlist. I built models that learn from past placements, a view of historical lead shares, and tools for comparing policy wording. I tested what changes when the model can only use information available before a placement. The prototype keeps these views separate so the broker can understand their different purposes; its historical ranking results describe past lead selections, not a guarantee of future suitability.": ["在硕士论文中，我研究保险经纪人如何从大量可能的承保机构中筛出有用的候选清单。我制作了学习历史承保记录的模型、历史主承保份额视图，以及比较保单条款的工具。我测试了模型只能使用承保前已知信息时的变化。原型把这些视图分别呈现，让经纪人理解不同用途；历史排序结果描述过去的主承保选择，并不保证未来适用性。","在碩士論文中，我研究保險經紀人如何從大量可能的承保機構中篩出有用的候選清單。我製作了學習歷史承保記錄的模型、歷史主承保份額檢視，以及比較保單條款的工具。我測試了模型只能使用承保前已知資訊時的變化。原型把這些檢視分別呈現，讓經紀人理解不同用途；歷史排序結果描述過去的主承保選擇，並不保證未來適用性。"],
  "I studied insurer selection for my MSc thesis and built a broker-facing prototype. It brings together a ranking learned from past placements, each insurer’s lead history, and relevant policy wording. I keep the three views separate so a broker can understand why an insurer appears and decide what to investigate next.": ["我在硕士论文中研究承保机构选择，并制作了面向经纪人的原型。它结合从历史承保中学习的排序、各机构的主承保记录，以及相关保单条款。我把三个视图分别呈现，便于经纪人理解机构出现的原因，并决定下一步调查什么。","我在碩士論文中研究承保機構選擇，並製作了面向經紀人的原型。它結合從歷史承保中學習的排序、各機構的主承保記錄，以及相關保單條款。我把三個檢視分別呈現，便於經紀人理解機構出現的原因，並決定下一步調查什麼。"],
  "Ultra Convert": ["Ultra Convert","Ultra Convert"],
  "CONVERT FILES FROM FINDER": ["在 Finder 中转换文件","在 Finder 中轉換檔案"],
  "My Mac app for converting images, audio, video, documents and data in one reviewed batch.": ["我的 Mac 应用，把图片、音频、视频、文档和数据放在同一批次中检查并转换。","我的 Mac 應用程式，把圖片、音訊、影片、文件和資料放在同一批次中檢查並轉換。"],
  "I built Ultra Convert to stop switching between separate tools for everyday file conversions. I can select a mixed batch in Finder, choose an output format for each category and review where the new files will go. It preserves originals, avoids overwriting existing outputs and remembers my format choices. The current Apple Silicon preview is installed with the release ZIP and its installer; the README explains the setup.": ["我制作 Ultra Convert，是为了日常文件转换时不用在不同工具间来回切换。我可以在 Finder 中选择混合文件，为每类文件指定输出格式，并检查新文件的保存位置。它保留原始文件，避免覆盖已有结果，并记住格式选择。目前的 Apple Silicon 预览版通过发布 ZIP 和安装程序安装；README 说明了设置步骤。","我製作 Ultra Convert，是為了日常檔案轉換時不用在不同工具間來回切換。我可以在 Finder 中選擇混合檔案，為每類檔案指定輸出格式，並檢查新檔案的儲存位置。它保留原始檔案，避免覆寫已有結果，並記住格式選擇。目前的 Apple Silicon 預覽版透過發布 ZIP 和安裝程式安裝；README 說明了設定步驟。"],
  "The browser walkthrough uses example filenames and shows the conversion choices. To convert your files, install the separate Mac app.": ["浏览器演示使用示例文件名，展示转换选择。要转换自己的文件，请安装独立的 Mac 应用。","瀏覽器示範使用範例檔名，展示轉換選擇。要轉換自己的檔案，請安裝獨立的 Mac 應用程式。"],
  "Get the Mac preview": ["获取 Mac 预览版","取得 Mac 預覽版"],
  "Converting a photo, a recording and a document usually sends me through three different apps. I wanted one place to review the whole batch before creating the new files.": ["转换照片、录音和文档通常需要三个不同的应用。我想在一个地方检查整个批次，然后生成新文件。","轉換照片、錄音和文件通常需要三個不同的應用程式。我想在一個地方檢查整個批次，然後產生新檔案。"],
  "I built a Mac app that turns a Finder selection into one conversion queue. It recognises each file category, explains the available output formats and shows where the new files will be saved. Try the example batch to see a photo, recording and document prepared together.": ["我制作了一个 Mac 应用，把 Finder 选择变成一个转换队列。它识别每种文件类别，解释可用输出格式，并显示新文件的保存位置。试试示例批次，看看照片、录音和文档如何一起准备转换。","我製作了一個 Mac 應用程式，把 Finder 選擇變成一個轉換佇列。它辨識每種檔案類別，解釋可用輸出格式，並顯示新檔案的儲存位置。試試範例批次，看看照片、錄音和文件如何一起準備轉換。"],
  "Finder selection → recognise file categories → choose formats → review destinations → create separate converted files": ["Finder 选择 → 识别文件类别 → 选择格式 → 检查目标位置 → 生成单独的转换文件","Finder 選擇 → 辨識檔案類別 → 選擇格式 → 檢查目標位置 → 產生單獨的轉換檔案"],
  "Open the mixed batch, choose an image format and switch the destination. Preview the results to see each new filename beside its original. The real Mac app performs the conversions; this walkthrough shows the choices first.": ["打开混合批次，选择图片格式，再切换目标位置。预览结果，查看每个新文件名与对应原始文件。真正执行转换的是 Mac 应用；这个演示先介绍选择方式。","開啟混合批次，選擇圖片格式，再切換目標位置。預覽結果，查看每個新檔名與對應原始檔案。真正執行轉換的是 Mac 應用程式；這個示範先介紹選擇方式。"],
  "Get the source preview": ["获取源码预览版","取得原始碼預覽版"],
  "My offline app for checking damaged videos, making playable copies and moving a collection into a new folder.": ["我的离线应用，用于检查受损视频、制作可播放副本，并把视频集合迁移到新文件夹。","我的離線應用程式，用於檢查受損影片、製作可播放副本，並把影片集合遷移到新資料夾。"],
  "This browser walkthrough uses five invented files. The separate desktop app processes files locally; its public release is currently a source preview.": ["这个浏览器演示使用五个虚构文件。独立桌面应用在本地处理文件；当前公开发布的是源码预览版。","這個瀏覽器示範使用五個虛構檔案。獨立桌面應用程式在本機處理檔案；目前公開發布的是原始碼預覽版。"],
  "I built VideoMate to answer three questions about a video collection: what still plays, what can be recovered, and what should go into a new collection. It creates checked copies and leaves originals in place. The walkthrough lets you compare those choices on five example files.": ["我制作 VideoMate 来回答关于视频集合的三个问题：哪些还能播放、哪些可以恢复，以及哪些应该放入新集合。它生成经过检查的副本，原始文件保持不动。演示通过五个示例文件来比较这些选择。","我製作 VideoMate 來回答關於影片集合的三個問題：哪些還能播放、哪些可以復原，以及哪些應該放入新集合。它產生經過檢查的副本，原始檔案保持不動。示範透過五個範例檔案來比較這些選擇。"],
  "A video can look like a normal file and still stop partway through. I wanted to find out what was readable, recover it where possible and keep uncertain results out of a finished collection.": ["视频看起来可能正常，却在中途停止播放。我想查明哪些内容可读、尽可能恢复，并把不确定的结果排除在最终集合之外。","影片看起來可能正常，卻在中途停止播放。我想查明哪些內容可讀、盡可能復原，並把不確定的結果排除在最終集合之外。"],
  "Choose Repair and select Broken MP4 index, then show the recovery outcomes. Compare it with Missing end of recording: fixing an index can restore access to existing content, while absent recording data cannot be recreated.": ["选择“修复”和“损坏的 MP4 索引”，然后显示恢复结果。与“缺失的录制结尾”比较：修复索引可以重新访问已有内容，但无法重建不存在的录制数据。","選擇「修復」和「損壞的 MP4 索引」，然後顯示復原結果。與「缺失的錄製結尾」比較：修復索引可以重新存取已有內容，但無法重建不存在的錄製資料。"],
  "SwiftUI": ["SwiftUI","SwiftUI"],
  "Finder Quick Actions": ["Finder 快速操作","Finder 快速動作"],
  "One batch for images, audio, video, documents and data": ["同一批次转换图片、音频、视频、文档和数据","同一批次轉換圖片、音訊、影片、文件和資料"],
  "Finder actions and per-category output formats": ["Finder 操作与分类输出格式","Finder 動作與分類輸出格式"],
  "Separate results while preserving original files": ["单独保存结果并保留原始文件","另外儲存結果並保留原始檔案"],
  "Market sizing": ["市场规模估算","市場規模估算"],
  "Read my original four-model diagram": ["阅读我的原始四模型图","閱讀我的原始四模型圖"],
  "Swift": ["Swift","Swift"],
  "AppKit": ["AppKit","AppKit"],
  "Read my microrobot vision report": ["阅读我的微型机器人视觉报告","閱讀我的微型機器人視覺報告"],
  "I built a model that fills in a heart MRI when only part of its measurements are available. I kept the reconstruction tied to the measurements actually taken, then tested image quality, uncertainty and how well the heart could still be outlined. The saved images in the demo show what that looked like.": ["我构建了一个模型，在只获得部分测量数据时补全心脏 MRI。我让重建结果遵循实际采集的测量，再测试图像质量、不确定性，以及心脏轮廓是否仍能准确识别。演示中的已保存图像展示了这些结果。","我建立了一個模型，在只取得部分量測資料時補全心臟 MRI。我讓重建結果遵循實際採集的量測，再測試影像品質、不確定性，以及心臟輪廓是否仍能準確辨識。示範中的已儲存影像展示了這些結果。"],
  "Press Play flow and follow the wake behind the cylinder. Switch between the saved model outputs to see the flows each network predicted. Then open How the models work to see why working with waves, a mesh or pixels changes what each network learns.": ["点击“播放流场”，观察圆柱后方的尾流。切换已保存的模型输出，查看各网络预测的流动。然后打开“模型如何工作”，了解波、网格和像素表示如何改变网络学习的内容。","點擊「播放流場」，觀察圓柱後方的尾流。切換已儲存的模型輸出，查看各網路預測的流動。然後開啟「模型如何運作」，了解波、網格和像素表示如何改變網路學習的內容。"],
  "I used Julia to study how molecular size and attraction change a fluid’s pressure. This browser exposes that part of the model with two example fluids: change their interaction and watch the pressure respond.": ["我用 Julia 研究分子大小和吸引力如何改变流体压力。浏览器用两种示例流体展示模型的这一部分：改变它们的相互作用，观察压力如何响应。","我用 Julia 研究分子大小和吸引力如何改變流體壓力。瀏覽器用兩種範例流體展示模型的這一部分：改變它們的交互作用，觀察壓力如何回應。"],
  "I analysed molecular shapes by combining conformational searches, theoretical spectra and 2–8 GHz microwave measurements. The study considered more than 20 Exaltenone and more than 30 Muscone conformations. In this browser I use example spectra and structures to explain how matching spectral lines helps distinguish candidate shapes.": ["我结合构象搜索、理论光谱和 2–8 GHz 微波测量来分析分子形状。研究考察了超过 20 种 Exaltenone 构象和超过 30 种 Muscone 构象。在浏览器中，我用示例光谱和结构解释如何通过匹配谱线区分候选形状。","我結合構象搜尋、理論光譜和 2–8 GHz 微波量測來分析分子形狀。研究考察了超過 20 種 Exaltenone 構象和超過 30 種 Muscone 構象。在瀏覽器中，我用範例光譜和結構解釋如何透過匹配譜線區分候選形狀。"],
  "My MATLAB app for inspecting spectral peaks and making clear figures from laboratory measurements.": ["我用 MATLAB 开发的应用，用于查看光谱峰并将实验室测量绘制成清晰的图表。","我用 MATLAB 開發的應用，用於檢視光譜峰並將實驗室量測繪製成清楚的圖表。"],
  "I build local apps, learning tools and infrastructure for tasks I want to make easier in my own work.": ["我开发本地应用、学习工具和基础设施，让自己工作中的任务更容易完成。","我開發本機應用、學習工具和基礎設施，讓自己工作中的任務更容易完成。"],
} satisfies ProjectCopyTable;
