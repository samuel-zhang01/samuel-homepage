import type { ProjectCopyTable } from "@/lib/projectCopy";

export const schedulingCopy = {
  "Mon": [
    "周一",
    "週一"
  ],
  "24 Aug": [
    "8 月 24 日",
    "8 月 24 日"
  ],
  "Tue": [
    "周二",
    "週二"
  ],
  "25 Aug": [
    "8 月 25 日",
    "8 月 25 日"
  ],
  "Wed": [
    "周三",
    "週三"
  ],
  "26 Aug": [
    "8 月 26 日",
    "8 月 26 日"
  ],
  "Thu": [
    "周四",
    "週四"
  ],
  "27 Aug": [
    "8 月 27 日",
    "8 月 27 日"
  ],
  "Fri": [
    "周五",
    "週五"
  ],
  "28 Aug": [
    "8 月 28 日",
    "8 月 28 日"
  ],
  "Individual": [
    "单人",
    "單人"
  ],
  "one host": [
    "一位主持人",
    "一位主持人"
  ],
  "Publish the selected host’s free windows after buffers and existing bookings are removed.": [
    "从所选主持人的可用时间中扣除缓冲和已有预约，再发布可预约时段。",
    "從所選主持人的可用時間中扣除緩衝和已有預約，再發布可預約時段。"
  ],
  "Round Robin": [
    "轮流分配",
    "輪流分配"
  ],
  "weighted union": [
    "加权并集",
    "加權並集"
  ],
  "Expose the union of host availability, then assign an eligible host using current load and weight.": [
    "汇总所有主持人的可用时间，再根据当前负载与权重分配符合条件的主持人。",
    "彙總所有主持人的可用時間，再根據當前負載與權重分配符合條件的主持人。"
  ],
  "Collective": [
    "共同参加",
    "共同參加"
  ],
  "intersection": [
    "交集",
    "交集"
  ],
  "Only expose a slot when every selected host is free for the complete buffered interval.": [
    "只有所有选中的主持人在包含缓冲的完整区间内都有空，才发布该时段。",
    "只有所有選中的主持人在包含緩衝的完整區間內都有空，才釋出該時段。"
  ],
  "First Available": [
    "优先可用",
    "優先可用"
  ],
  "priority union": [
    "按优先级取并集",
    "按優先順序取並集"
  ],
  "Expose the union of free slots and resolve each choice to the highest-priority eligible host.": [
    "汇总空闲时段，并将每次选择分配给符合条件且优先级最高的主持人。",
    "彙總空閒時段，並將每次選擇分配給符合條件且優先順序最高的主持人。"
  ],
  "Alex": [
    "Alex",
    "Alex"
  ],
  "Product": [
    "产品",
    "產品"
  ],
  "Morgan": [
    "Morgan",
    "Morgan"
  ],
  "Engineering": [
    "工程",
    "工程"
  ],
  "Riley": [
    "Riley",
    "Riley"
  ],
  "Research": [
    "研究",
    "研究"
  ],
  "The temporary reservation expired. Choose the slot again to revalidate it.": [
    "临时保留已过期。请重新选择该时段，以再次验证可用性。",
    "臨時保留已過期。請重新選擇該時段，以再次驗證可用性。"
  ],
  "Choose at least one host": [
    "请至少选择一位主持人",
    "請至少選擇一位主持人"
  ],
  "Every selected host is free": [
    "所有选中的主持人都有空",
    "所有選中的主持人都有空"
  ],
  "{0} outside buffered working window": [
    "{0} 不在包含缓冲的工作时间内",
    "{0} 不在包含緩衝的工作時間內"
  ],
  "{0} generated free intervals do not cover the anchor slot": [
    "{0} 生成的空闲区间未覆盖基准时段",
    "{0} 生成的空閒區間未覆蓋基準時段"
  ],
  "Outside working windows": [
    "不在工作时间内",
    "不在工作時間內"
  ],
  "Buffer crosses the working-window boundary": [
    "缓冲超出了工作时间边界",
    "緩衝超出了工作時間邊界"
  ],
  "Busy booking or temporary reservation": [
    "已有预约或临时保留",
    "已有預約或臨時保留"
  ],
  "{0} is free": [
    "{0} 有空",
    "{0} 有空"
  ],
  "{0} is busy": [
    "{0} 忙碌",
    "{0} 忙碌"
  ],
  "{0} has the lowest weighted load": [
    "{0} 的加权负载最低",
    "{0} 的加權負載最低"
  ],
  "{0} is the highest-priority free host": [
    "{0} 是优先级最高的空闲主持人",
    "{0} 是優先順序最高的空閒主持人"
  ],
  "No candidate slot at this time": [
    "此时没有候选时段",
    "此時沒有候選時段"
  ],
  "Reserved for this browser session": [
    "已为当前浏览器会话保留",
    "已為當前瀏覽器會話保留"
  ],
  "Availability changed during revalidation. No booking was created.": [
    "重新验证时可用性已变化，未创建预约。",
    "重新驗證時可用性已變化，未建立預約。"
  ],
  "Confirmed {0} {1}, {2} with {3}. The temporary reservation became a booking.": [
    "已确认 {0} {1} {2} 与 {3} 的预约。临时保留已转为正式预约。",
    "已確認 {0} {1} {2} 與 {3} 的預約。臨時保留已轉為正式預約。"
  ],
  "Competing request rejected: the temporary reservation already owns this host/slot key.": [
    "竞争请求被拒绝：当前临时保留已占用该主持人与时段的组合。",
    "競爭請求被拒絕：當前臨時保留已佔用該主持人與時段的組合。"
  ],
  "Competing request reached an unreserved host. Recheck the selected allocation before committing.": [
    "竞争请求到达了一位尚未被保留的主持人。提交前请重新检查分配结果。",
    "競爭請求到達了一位尚未被保留的主持人。提交前請重新檢查分配結果。"
  ],
  "YASA · AVAILABILITY ENGINE": [
    "YASA · 可用时间引擎",
    "YASA · 可用時間引擎"
  ],
  "Multi-host Scheduling Lab": [
    "多主持人排期实验室",
    "多主持人排期實驗室"
  ],
  "INTERACTIVE SCHEDULING": [
    "交互式排期",
    "互動式排期"
  ],
  "Explain how multi-host availability, time zones, buffers and collision protection become bookable slots.": [
    "了解多位主持人的可用时间、时区、缓冲和冲突保护如何共同生成可预约时段。",
    "瞭解多位主持人的可用時間、時區、緩衝和衝突保護如何共同生成可預約時段。"
  ],
  "Switch allocation policy, inspect a blocked slot, then reserve a free time and replay a collision.": [
    "切换分配策略，查看一个不可用时段，再保留一个空闲时段并模拟竞争请求。",
    "切換分配策略，檢視一個不可用時段，再保留一個空閒時段並模擬競爭請求。"
  ],
  "Host assignment and slot state update while final revalidation prevents a stale choice from becoming a double-booking.": [
    "观察主持人分配与时段状态的变化；最后的重新验证防止过时的选择造成重复预约。",
    "觀察主持人分配與時段狀態的變化；最後的重新驗證防止過時的選擇造成重複預約。"
  ],
  "bookable of": [
    "个可预约时段，共",
    "個可預約時段，共"
  ],
  "evaluated slots": [
    "个已评估时段",
    "個已評估時段"
  ],
  "All records synthetic · no Graph, email or database connection": [
    "所有记录均为合成示例 · 未连接 Graph、邮件或数据库",
    "所有記錄均為合成示例 · 未連線 Graph、郵件或資料庫"
  ],
  "Real scheduling rules, fictional calendars.": [
    "真实排期规则，虚构日历。",
    "真實排期規則，虛構日曆。"
  ],
  "This browser port mirrors the repository’s four scheduling modes, buffered working-window constraints, weighted allocation, IANA timezone display, temporary reservations and final revalidation.": [
    "此浏览器版本实现了项目的四种排期模式、包含缓冲的工作时间限制、加权分配、IANA 时区显示、临时保留与最终重新验证。",
    "此瀏覽器版本實現了專案的四種排期模式、包含緩衝的工作時間限制、加權分配、IANA 時區顯示、臨時保留與最終重新驗證。"
  ],
  "BOOKING JOURNEY": [
    "预约流程",
    "預約流程"
  ],
  "From public page to managed calendar event": [
    "从公开页面到日历事件管理",
    "從公開頁面到日曆事件管理"
  ],
  "The complete application connects a public booking page to calendar events and notifications. Explore its scheduling decisions here, using fictional calendars and local reservations.": [
    "完整应用连接公开预约页面、日历事件与通知。这里使用虚构日历和本地临时保留，帮助你探索其中的排期决策。",
    "完整應用連線公開預約頁面、日曆事件與通知。這裡使用虛構日曆和本地臨時保留，幫助你探索其中的排期決策。"
  ],
  "Public page": [
    "公开页面",
    "公開頁面"
  ],
  "event + attendee input": [
    "事件与参与者信息",
    "事件與參與者資訊"
  ],
  "Availability": [
    "可用时间",
    "可用時間"
  ],
  "windows − Graph busy − bookings": [
    "工作时间 − Graph 忙碌时间 − 已有预约",
    "工作時間 − Graph 忙碌時間 − 已有預約"
  ],
  "Reservation": [
    "临时保留",
    "臨時保留"
  ],
  "UTC host/slot key · 10 min": [
    "UTC 主持人/时段标识 · 10 分钟",
    "UTC 主持人/時段標識 · 10 分鐘"
  ],
  "Revalidation": [
    "重新验证",
    "重新驗證"
  ],
  "host free + database exclusion": [
    "主持人空闲检查与数据库冲突排除",
    "主持人空閒檢查與資料庫衝突排除"
  ],
  "Delivery": [
    "发送结果",
    "傳送結果"
  ],
  "Graph event · email · ICS": [
    "Graph 事件 · 邮件 · ICS",
    "Graph 事件 · 郵件 · ICS"
  ],
  "Scheduling mode": [
    "排期模式",
    "排期模式"
  ],
  "ALGORITHM": [
    "算法",
    "演算法"
  ],
  "Hosts in rotation": [
    "参与轮值的主持人",
    "參與輪值的主持人"
  ],
  "load": [
    "负载",
    "負載"
  ],
  "priority": [
    "优先级",
    "優先順序"
  ],
  "weight": [
    "权重",
    "權重"
  ],
  "Booking constraints": [
    "预约限制",
    "預約限制"
  ],
  "Duration": [
    "时长",
    "時長"
  ],
  "30 minutes": [
    "30 分钟",
    "30 分鐘"
  ],
  "45 minutes": [
    "45 分钟",
    "45 分鐘"
  ],
  "60 minutes": [
    "60 分钟",
    "60 分鐘"
  ],
  "Buffer each side": [
    "前后各留缓冲",
    "前後各留緩衝"
  ],
  "None": [
    "无",
    "無"
  ],
  "15 minutes": [
    "15 分钟",
    "15 分鐘"
  ],
  "Display timezone": [
    "显示时区",
    "顯示時區"
  ],
  "London": [
    "伦敦",
    "倫敦"
  ],
  "New York": [
    "纽约",
    "紐約"
  ],
  "Tokyo": [
    "东京",
    "東京"
  ],
  "Availability calculation summary": [
    "可用时间计算概况",
    "可用時間計算概況"
  ],
  "candidate slots": [
    "候选时段",
    "候選時段"
  ],
  "constraints removed": [
    "因限制而移除",
    "因限制而移除"
  ],
  "published slots": [
    "发布的时段",
    "釋出的時段"
  ],
  "reserved interval": [
    "实际保留区间",
    "實際保留區間"
  ],
  "03 · AVAILABILITY RESULT": [
    "03 · 可用时间结果",
    "03 · 可用時間結果"
  ],
  "24–28 August · London source dates": [
    "8 月 24–28 日 · 以伦敦日期为准",
    "8 月 24–28 日 · 以倫敦日期為準"
  ],
  "Bookable": [
    "可预约",
    "可預約"
  ],
  "Busy": [
    "忙碌",
    "忙碌"
  ],
  "Outside": [
    "范围外",
    "範圍外"
  ],
  "Keyboard:": [
    "键盘操作：",
    "鍵盤操作："
  ],
  "Tab enters the calendar once. Use": [
    "按 Tab 进入日历一次。使用",
    "按 Tab 進入日曆一次。使用"
  ],
  "across a time row,": [
    "在同一时间行中左右移动，使用",
    "在同一時間列中左右移動，使用"
  ],
  "within a day, and": [
    "在同一天内上下移动，使用",
    "在同一天內上下移動，使用"
  ],
  "for row edges.": [
    "跳至行首或行尾。",
    "跳至列首或列尾。"
  ],
  "moves to the first or last generated slot. Busy and outside cells remain readable; only bookable cells activate.": [
    "跳至首个或末个生成的时段。忙碌和范围外的单元格仍可读取，但只有可预约的单元格可以激活。",
    "跳至首個或末個生成的時段。忙碌和範圍外的單元格仍可讀取，但只有可預約的單元格可以啟用。"
  ],
  "Generated scheduling slots": [
    "生成的排期时段",
    "生成的排期時段"
  ],
  "LON": [
    "伦敦",
    "倫敦"
  ],
  "NYC": [
    "纽约",
    "紐約"
  ],
  "TYO": [
    "东京",
    "東京"
  ],
  "generated candidates removed — inspect reasons": [
    "个候选时段已移除 — 查看原因",
    "個候選時段已移除 — 檢視原因"
  ],
  "04 · ATOMIC BOOKING": [
    "04 · 原子预约",
    "04 · 原子預約"
  ],
  "Reserve & recheck": [
    "保留并重新检查",
    "保留並重新檢查"
  ],
  "TEMPORARY RESERVATION": [
    "临时保留",
    "臨時保留"
  ],
  "owns the host + slot key while this clock runs": [
    "倒计时期间占用该主持人与时段的组合",
    "倒計時期間佔用該主持人與時段的組合"
  ],
  "When": [
    "时间",
    "時間"
  ],
  "Hosts": [
    "主持人",
    "主持人"
  ],
  "Blocked": [
    "预留缓冲",
    "預留緩衝"
  ],
  "m before +": [
    "分钟前 +",
    "分鐘前 +"
  ],
  "m after": [
    "分钟后",
    "分鐘後"
  ],
  "Revalidate & confirm": [
    "重新验证并确认",
    "重新驗證並確認"
  ],
  "Try competing request": [
    "尝试竞争请求",
    "嘗試競爭請求"
  ],
  "Release hold": [
    "释放保留",
    "釋放保留"
  ],
  "Choose a bookable cell": [
    "选择一个可预约的单元格",
    "選擇一個可預約的單元格"
  ],
  "The engine will resolve hosts, claim a ten-minute reservation key and check the underlying calendars again before confirmation.": [
    "引擎会确定主持人，保留该时段十分钟，并在确认前再次检查相关日历。",
    "引擎會確定主持人，保留該時段十分鐘，並在確認前再次檢查相關日曆。"
  ],
  "Booking transaction stages": [
    "预约事务各阶段",
    "預約事務各階段"
  ],
  "Generate local windows": [
    "生成本地工作时间",
    "生成本地工作時間"
  ],
  "Subtract busy + buffers": [
    "扣除忙碌时间与缓冲",
    "扣除忙碌時間與緩衝"
  ],
  "Union/intersect hosts": [
    "对主持人时段取并集或交集",
    "對主持人時段取並集或交集"
  ],
  "Reserve, reverify, commit": [
    "保留、重新验证、提交",
    "保留、重新驗證、提交"
  ],
  "Explore daylight-saving gaps and repeated times": [
    "探索夏令时跳过与重复的时间",
    "探索夏令時跳過與重複的時間"
  ],
  "YASA scheduling": [
    "YASA 排期",
    "YASA 排期"
  ],
  "Explore shared availability": [
    "探索共同可用时间",
    "探索共同可用時間"
  ],
  "Booking simulation": [
    "预约流程模拟",
    "預約流程模擬"
  ]
,
  "I built a booking app that finds a meeting time for one host, any available host or a whole team.": ["我构建了一个预约应用，为一位主持人、任意可用主持人或整个团队寻找会议时间。", "我建置了一個預約應用程式，為一位主持人、任意有空的主持人或整個團隊尋找會議時間。"],
  "Switch from Round Robin to Collective. Compare the available times when one person is enough and when everyone must be free.": ["从 Round Robin 切换到 Collective，比较只需一人有空和全员必须有空时的可预约时间。", "從 Round Robin 切換到 Collective，比較只需一人有空和全員必須有空時的可預約時間。"],
  "Collective meetings have fewer possible times because every host must be available. Reservations and a final check protect a selected time from double-booking.": ["集体会议的可选时间更少，因为每位主持人都必须有空。预留与最终检查可以避免重复预约。", "集體會議的可選時間更少，因為每位主持人都必須有空。保留與最後檢查可以避免重複預約。"],
  "Book a meeting": ["预约会议", "預約會議"],
  "Browser example": ["浏览器示例", "瀏覽器範例"],
  "I built YASA to turn shared availability into a confirmed meeting.": ["我构建了 YASA，将大家的可用时间变成确认的会议。", "我建置了 YASA，將大家的可用時間變成確認的會議。"],
  "Pick a time, add guest details and confirm. Then change or cancel the booking.": ["选择时间、填写来宾信息并确认，然后尝试改期或取消。", "選擇時間、填寫來賓資料並確認，然後嘗試改期或取消。"],
  "Team review needs every required host. Optional hosts suggest better times without blocking a booking.": ["团队评审需要所有必到主持人都有空。可选主持人用于推荐更好的时间，不会阻止预约。", "團隊評審需要所有必到主持人都有空。選擇性主持人用來推薦更好的時間，不會阻止預約。"],
  "Fictional calendars · changes stay in this browser": ["虚构日历 · 更改仅保留在此浏览器中", "虛構行事曆 · 更改僅保留在此瀏覽器中"],
  "No invitation sent": ["未发送邀请", "未傳送邀請"],
  "YASA experience": ["YASA 体验", "YASA 體驗"],
  "Guest booking page": ["来宾预约页面", "來賓預約頁面"],
  "Explore scheduling rules": ["探索排期规则", "探索排期規則"],
  "Project chat": ["项目交流", "專案交流"],
  "Team review": ["团队评审", "團隊評審"],
  "Technical deep dive": ["技术深入交流", "技術深入交流"],
  "One host": ["一位主持人", "一位主持人"],
  "Project feedback": ["项目反馈", "專案回饋"],
  "Technical walkthrough": ["技术讲解", "技術講解"],
  "Collaboration": ["合作", "合作"],
  "Your example reservation expired. Pick a time again.": ["示例预留已过期，请重新选择时间。", "範例保留已到期，請重新選擇時間。"],
  "Enter your name.": ["请输入姓名。", "請輸入姓名。"],
  "Enter a valid email address.": ["请输入有效的邮箱地址。", "請輸入有效的電子郵件地址。"],
  "Choose a discussion topic.": ["请选择讨论主题。", "請選擇討論主題。"],
  "That time is no longer available. Your details are saved; choose another time.": ["该时间已不可用。已保留你的信息，请选择其他时间。", "該時間已無法預約。已保留你的資料，請選擇其他時間。"],
  "Pick a new time. Your original booking stays in place until you confirm the change.": ["请选择新时间。确认更改之前，原预约仍然有效。", "請選擇新時間。確認更改之前，原預約仍然有效。"],
  "The example booking is cancelled. Its required hosts are available again.": ["示例预约已取消，必到主持人的时间已释放。", "範例預約已取消，必到主持人的時間已釋放。"],
  "Another example guest took this time. Try confirming to see the final availability check.": ["另一位示例来宾占用了这个时间。尝试确认，查看最后一次可用性检查。", "另一位範例來賓占用了這個時間。嘗試確認，查看最後一次可用性檢查。"],
  "Example team · 16–20 November 2026": ["示例团队 · 2026 年 11 月 16–20 日", "範例團隊 · 2026 年 11 月 16–20 日"],
  "Reset example": ["重置示例", "重設範例"],
  "Booking progress": ["预约进度", "預約進度"],
  "Choose a time": ["选择时间", "選擇時間"],
  "Your details": ["你的信息", "你的資料"],
  "Confirmation": ["确认", "確認"],
  "What would you like to book?": ["你想预约什么？", "你想預約什麼？"],
  "Meeting type": ["会议类型", "會議類型"],
  "minutes": ["分钟", "分鐘"],
  "Host allocation": ["主持人分配", "主持人分配"],
  "Everyone required must be free. Optional hosts suggest better times.": ["所有必到主持人都必须有空；可选主持人用于推荐更好的时间。", "所有必到主持人都必須有空；選擇性主持人用來推薦更好的時間。"],
  "An available host with the lowest weighted load takes the meeting.": ["在有空的主持人中，按权重计算负荷最低的人接待会议。", "在有空的主持人中，按權重計算負荷最低的人接待會議。"],
  "The highest-priority available host takes the meeting.": ["有空且优先级最高的主持人接待会议。", "有空且優先順序最高的主持人接待會議。"],
  "Alex hosts this one-to-one meeting.": ["Alex 主持这场一对一会议。", "Alex 主持這場一對一會議。"],
  "Who needs to attend?": ["谁必须参加？", "誰必須參加？"],
  "{0} attendance: {1}": ["{0} 的参会要求：{1}", "{0} 的參會要求：{1}"],
  "Required": ["必到", "必到"],
  "Optional": ["可选", "選擇性"],
  "At least one host stays required. Optional invitations do not reserve time.": ["至少保留一位必到主持人。可选邀请不会占用时间。", "至少保留一位必到主持人。選擇性邀請不會占用時間。"],
  "15-minute buffers": ["前后各预留 15 分钟", "前後各保留 15 分鐘"],
  "Example video call": ["示例视频会议", "範例視訊會議"],
  "Use example details. Nothing is sent to a host, calendar or email service.": ["请使用示例信息。不会向主持人、日历或邮件服务发送任何内容。", "請使用範例資料。不會向主持人、行事曆或郵件服務傳送任何內容。"],
  "Checking example calendars…": ["正在检查示例日历…", "正在檢查範例行事曆…"],
  "Working hours · busy time · host assignment": ["工作时间 · 已占用时间 · 主持人分配", "工作時間 · 已占用時間 · 主持人分配"],
  "Choose a new time": ["选择新时间", "選擇新時間"],
  "available times this week": ["个本周可预约时间", "個本週可預約時間"],
  "Your timezone": ["你的时区", "你的時區"],
  "Choose a date": ["选择日期", "選擇日期"],
  "free": ["个可选", "個可選"],
  "No available times": ["没有可预约时间", "沒有可預約時間"],
  "Suggested times include the most available optional hosts for this day. Every other free time is still bookable.": ["推荐时间能让当天最多的可选主持人参加，其他空闲时间仍可预约。", "推薦時間能讓當天最多的選擇性主持人參加，其他空閒時間仍可預約。"],
  "Available meeting times": ["可预约会议时间", "可預約會議時間"],
  "Suggested": ["推荐", "推薦"],
  "Booked": ["不可用", "無法預約"],
  "optional hosts free": ["位可选主持人有空", "位選擇性主持人有空"],
  "Keep original booking": ["保留原预约", "保留原預約"],
  "Manage example bookings": ["管理示例预约", "管理範例預約"],
  "Held for": ["预留剩余", "保留剩餘"],
  "Required:": ["必到：", "必到："],
  "· Optional:": ["· 可选：", "· 選擇性："],
  "Your name *": ["你的姓名 *", "你的姓名 *"],
  "Email *": ["邮箱 *", "電子郵件 *"],
  "Company": ["公司", "公司"],
  "Discussion topic *": ["讨论主题 *", "討論主題 *"],
  "Discussion topic": ["讨论主题", "討論主題"],
  "Choose a topic": ["选择主题", "選擇主題"],
  "What would you like to cover?": ["你想讨论什么？", "你想討論什麼？"],
  "/400 characters": ["/400 字符", "/400 字元"],
  "Include a 15-minute reminder in the calendar file": ["在日历文件中添加提前 15 分钟的提醒", "在行事曆檔案中加入提前 15 分鐘的提醒"],
  "Confirm new time": ["确认新时间", "確認新時間"],
  "Confirm example booking": ["确认示例预约", "確認範例預約"],
  "Back to times": ["返回时间选择", "返回時間選擇"],
  "Try the final availability check": ["试试最后一次可用性检查", "試試最後一次可用性檢查"],
  "Simulate time being taken": ["模拟时间被占用", "模擬時間被占用"],
  "Booking cancelled": ["预约已取消", "預約已取消"],
  "Your time has changed": ["时间已更改", "時間已更改"],
  "You’re booked in this example": ["示例预约已确认", "範例預約已確認"],
  "Local confirmation · no invitation sent": ["本地确认 · 未发送邀请", "本機確認 · 未傳送邀請"],
  "Meeting": ["会议", "會議"],
  "Required hosts": ["必到主持人", "必到主持人"],
  "Optional hosts": ["可选主持人", "選擇性主持人"],
  "Guest": ["来宾", "來賓"],
  "Your notes": ["你的备注", "你的備註"],
  "Original time released:": ["已释放原时间：", "已釋放原時間："],
  "Download cancellation (.ics)": ["下载取消通知（.ics）", "下載取消通知（.ics）"],
  "Download calendar invite (.ics)": ["下载日历邀请（.ics）", "下載行事曆邀請（.ics）"],
  "Reschedule": ["改期", "改期"],
  "Cancel booking": ["取消预约", "取消預約"],
  "Download old cancellation (.ics)": ["下载原预约取消通知（.ics）", "下載原預約取消通知（.ics）"],
  "Back to availability": ["返回可用时间", "返回可用時間"],
  "The calendar file contains the displayed time in UTC and keeps optional attendance roles. Import it only if you want this example in your calendar.": ["日历文件以 UTC 保存所显示的时间，并保留可选参会角色。你可以选择是否将此示例导入日历。", "行事曆檔案以 UTC 儲存所顯示的時間，並保留選擇性參會角色。你可以選擇是否將此範例匯入行事曆。"],
  "{0}–{1}, {2}": ["{0}–{1}，{2}", "{0}–{1}，{2}"],
  "Meeting details": ["会议详情", "會議詳細資料"],
  "Unavailable": ["不可用", "無法預約"],
  "Available": ["可预约", "可預約"],
} as const satisfies ProjectCopyTable;
