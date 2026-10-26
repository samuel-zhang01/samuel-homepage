import type { ProjectCopyTable } from "@/lib/projectCopy";
export const browserViewCopy = {
  "One browser, two views": [
    "一个浏览器，两个视图",
    "一個瀏覽器，兩個檢視"
  ],
  "Edit the note in the first viewer. Both views share the same page.": [
    "在第一个查看器编辑备注。两个视图共用同一页面。",
    "在第一個檢視器編輯備註。兩個檢視共用同一頁面。"
  ],
  "Interactive model with example data. It does not start Chromium or connect to an agent.": [
    "使用示例数据的交互模型，不启动 Chromium，也不连接智能体。",
    "使用範例資料的互動模型，不啟動 Chromium，也不連接代理。"
  ],
  "Shared browser session": [
    "共享浏览器会话",
    "共用瀏覽器工作階段"
  ],
  "Fixed desktop: 1440 × 1000 pixels": [
    "固定桌面：1440 × 1000 像素",
    "固定桌面：1440 × 1000 像素"
  ],
  "Agent: reopen task": [
    "智能体：重新打开任务",
    "代理：重新開啟任務"
  ],
  "Agent: mark reviewed": [
    "智能体：标记已审阅",
    "代理：標記已檢閱"
  ],
  "Reset session": [
    "重置会话",
    "重設工作階段"
  ],
  "Shared task: reviewed": [
    "共享任务：已审阅",
    "共用任務：已檢閱"
  ],
  "Shared task: awaiting review": [
    "共享任务：待审阅",
    "共用任務：待檢閱"
  ],
  "View only": [
    "仅查看",
    "僅供檢視"
  ],
  "Disconnect viewer": [
    "断开查看器",
    "中斷檢視器"
  ],
  "Reconnect viewer": [
    "重新连接查看器",
    "重新連接檢視器"
  ],
  "Connected to the shared page": [
    "已连接到共享页面",
    "已連接到共用頁面"
  ],
  "Example layout review": [
    "示例布局审阅",
    "範例版面檢閱"
  ],
  "Shared note": [
    "共享备注",
    "共用備註"
  ],
  "Write a note for the other viewer": [
    "给另一位查看者写条备注",
    "給另一位檢視者寫條備註"
  ],
  "Layout reviewed": [
    "布局已审阅",
    "版面已檢閱"
  ],
  "Input is blocked here. The agent and the other viewer can still make changes.": [
    "此处禁止输入，智能体和另一查看器仍可修改。",
    "此處禁止輸入，代理和另一檢視器仍可修改。"
  ],
  "Input from this viewer changes the shared page.": [
    "此查看器的输入会更改共享页面。",
    "此檢視器的輸入會變更共用頁面。"
  ],
  "Try disconnecting the second viewer, then let the agent change the task. Reconnect to recover the current page without clearing the note.": [
    "试着断开第二个查看器，再让智能体更改任务。重新连接即可恢复当前页面，备注不会清空。",
    "試著中斷第二個檢視器，再讓代理變更任務。重新連線即可恢復目前頁面，備註不會清空。"
  ],
  "Why a slow viewer does not grow an endless queue": [
    "为何缓慢的查看器不会造成无限队列",
    "為何緩慢的檢視器不會造成無限佇列"
  ],
  "The extension waits after four unacknowledged chunks. Acknowledging one frees a slot; a stall longer than 15 seconds disconnects that viewer.": [
    "四个数据块未获确认后，扩展暂停读取。确认一个便腾出一个槽位；停滞超过 15 秒会断开该查看器。",
    "四個資料區塊未獲確認後，擴充套件暫停讀取。確認一個便騰出一個槽位；停滯超過 15 秒會中斷該檢視器。"
  ],
  "Each slot here holds a full 64 KiB example chunk. Real chunks can be smaller. This separate model uses a manual clock.": [
    "此处每个槽位放置完整的 64 KiB 示例数据块，实际数据块可能更小。此独立模型使用手动时钟。",
    "此處每個槽位放置完整的 64 KiB 範例資料區塊，實際區塊可能更小。此獨立模型使用手動時鐘。"
  ],
  "Pending display chunks": [
    "等待确认的画面数据块",
    "等待確認的畫面資料區塊"
  ],
  "64 KiB pending": [
    "64 KiB 待确认",
    "64 KiB 待確認"
  ],
  "Empty slot": [
    "空槽位",
    "空槽位"
  ],
  "Stalled viewer disconnected · queue cleared": [
    "停滞查看器已断开 · 队列已清空",
    "停滯檢視器已中斷 · 佇列已清空"
  ],
  "256 KiB pending · reading paused": [
    "256 KiB 待确认 · 暂停读取",
    "256 KiB 待確認 · 暫停讀取"
  ],
  "Capacity available · reading can continue": [
    "有可用容量 · 可以继续读取",
    "有可用容量 · 可以繼續讀取"
  ],
  "Send 64 KiB": [
    "发送 64 KiB",
    "傳送 64 KiB"
  ],
  "Acknowledge oldest": [
    "确认最早的数据块",
    "確認最早的區塊"
  ],
  "Advance 16 seconds": [
    "推进 16 秒",
    "推進 16 秒"
  ],
  "Reset connection": [
    "重置连接",
    "重設連線"
  ],
  "The extension needs a Linux host. It streams one fixed virtual desktop; separate viewers are not separate monitors. The real canvas cannot expose the remote page to a local screen reader.": [
    "扩展需要 Linux 主机，传输一个固定虚拟桌面。不同查看器不代表不同显示器。实际画布无法向本地屏幕阅读器提供远程网页内容。",
    "擴充套件需要 Linux 主機，傳送一個固定虛擬桌面。不同檢視器不代表不同顯示器。實際畫布無法向本機螢幕閱讀器提供遠端網頁內容。"
  ],
  "Install Browser View": [
    "安装 Browser View",
    "安裝 Browser View"
  ],
  "Read the tested scope": [
    "查看测试范围",
    "查看測試範圍"
  ],
  "Editor viewer": [
    "编辑器查看器",
    "編輯器檢視器"
  ],
  "Second-screen viewer": [
    "第二屏幕查看器",
    "第二螢幕檢視器"
  ],
  "Disconnected · last visible state": [
    "已断开 · 最后可见状态",
    "已中斷 · 最後可見狀態"
  ]
} satisfies ProjectCopyTable;
