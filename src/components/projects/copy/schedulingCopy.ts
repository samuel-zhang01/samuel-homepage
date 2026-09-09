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
    "在同一時間行中左右移動，使用"
  ],
  "within a day, and": [
    "在同一天内上下移动，使用",
    "在同一天內上下移動，使用"
  ],
  "for row edges.": [
    "跳至行首或行尾。",
    "跳至行首或行尾。"
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
    "缓冲",
    "緩衝"
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
} as const satisfies ProjectCopyTable;
