import type { ProjectCopyTable } from "@/lib/projectCopy";

export const financeImportCopy = {
  "IMPORT IDENTITY · EXECUTED IN YOUR BROWSER": [
    "导入记录标识 · 在浏览器中实时计算",
    "匯入記錄標識 · 在瀏覽器中即時計算"
  ],
  "Follow each row into the ledger": [
    "追踪每条记录如何进入账本",
    "追蹤每條記錄如何進入賬本"
  ],
  "Run overlapping exports against an initially empty ledger. Every click computes row identities, attempts insertion and records the resulting balance.": [
    "从空账本开始，导入内容重叠的导出文件。每次点击都会计算记录标识、尝试插入，并记录最终余额。",
    "從空賬本開始，匯入內容重疊的匯出檔案。每次點選都會計算記錄標識、嘗試插入，並記錄最終餘額。"
  ],
  "Import edge cases": [
    "导入边界情况",
    "匯入邊界情況"
  ],
  "Staged export": [
    "待导入文件",
    "待匯入檔案"
  ],
  "Ready to replay": [
    "可重新播放",
    "可重新播放"
  ],
  "{0} parsed rows · opening {1} · declared closing {2}": [
    "已解析 {0} 条记录 · 期初余额 {1} · 声明的期末余额 {2}",
    "已解析 {0} 條記錄 · 期初餘額 {1} · 宣告的期末餘額 {2}"
  ],
  "The parsed transaction list is empty.": [
    "解析后的交易列表为空。",
    "解析後的交易列表為空。"
  ],
  "Import export {0} of {1}": [
    "导入第 {0} / {1} 个文件",
    "匯入第 {0} / {1} 個檔案"
  ],
  "Replay final export": [
    "重新导入最后一个文件",
    "重新匯入最後一個檔案"
  ],
  "Reset ledger": [
    "重置账本",
    "重置賬本"
  ],
  "Stored rows": [
    "已存储记录",
    "已儲存記錄"
  ],
  "import attempts": [
    "次导入尝试",
    "次匯入嘗試"
  ],
  "Retained ledger closing": [
    "保留账本的期末余额",
    "保留賬本的期末餘額"
  ],
  "£100 opening + stored movements": [
    "£100 期初余额 + 已存储的变动",
    "£100 期初餘額 + 已儲存的變動"
  ],
  "Latest insertion result": [
    "最近一次插入结果",
    "最近一次插入結果"
  ],
  "{0} added": [
    "新增 {0} 条",
    "新增 {0} 條"
  ],
  "Ready": [
    "就绪",
    "就緒"
  ],
  "{0} existing identities ignored": [
    "忽略了 {0} 个已有标识",
    "忽略了 {0} 個已有標識"
  ],
  "Import the staged export to begin": [
    "导入待处理文件以开始",
    "匯入待處理檔案以開始"
  ],
  "Parsed statement reconciliation": [
    "已解析账单的对账结果",
    "已解析賬單的對賬結果"
  ],
  "Calculated closing": [
    "计算的期末余额",
    "計算的期末餘額"
  ],
  "Declared closing": [
    "声明的期末余额",
    "宣告的期末餘額"
  ],
  "Residual": [
    "差额",
    "差額"
  ],
  "Reconciliation": [
    "对账",
    "對賬"
  ],
  "Pass": [
    "通过",
    "通過"
  ],
  "Failed · rows still stored": [
    "未通过 · 记录仍已存储",
    "未通過 · 記錄仍已儲存"
  ],
  "Retained ledger check": [
    "保留账本检查",
    "保留賬本檢查"
  ],
  "Opening + stored rows": [
    "期初余额 + 已存储记录",
    "期初餘額 + 已儲存記錄"
  ],
  "Declared − retained": [
    "声明余额 − 保留账本余额",
    "宣告餘額 − 保留賬本餘額"
  ],
  "Changed existing identities": [
    "内容有变化的已有标识",
    "內容有變化的已有標識"
  ],
  "Import row decisions": [
    "导入记录的处理决定",
    "匯入記錄的處理決定"
  ],
  "Latest import:": [
    "最近一次导入：",
    "最近一次匯入："
  ],
  "Identity choice": [
    "标识选择",
    "標識選擇"
  ],
  "Incoming": [
    "传入金额",
    "傳入金額"
  ],
  "Decision": [
    "处理决定",
    "處理決定"
  ],
  "Retained": [
    "保留金额",
    "保留金額"
  ],
  "Provider {0}": [
    "提供方标识 {0}",
    "提供方標識 {0}"
  ],
  "Content · occurrence {0}": [
    "内容 · 第 {0} 次出现",
    "內容 · 第 {0} 次出現"
  ],
  "Inserted": [
    "已插入",
    "已插入"
  ],
  "Ignored · changed content": [
    "已忽略 · 内容已变化",
    "已忽略 · 內容已變化"
  ],
  "Ignored · existing key": [
    "已忽略 · 标识已存在",
    "已忽略 · 標識已存在"
  ],
  "Zero rows reached the insertion loop.": [
    "没有记录进入插入循环。",
    "沒有記錄進入插入迴圈。"
  ],
  "Inspect the stored identities and import history": [
    "查看已存储标识与导入历史",
    "檢視已儲存標識與匯入歷史"
  ],
  "Each identity combines the fields used to recognise an existing transaction. Compare the incoming record with the retained ledger entry.": [
    "每个标识由识别已有交易所需的字段组成。比较新传入记录与账本中保留的记录。",
    "每個標識由識別已有交易所需的欄位組成。比較新傳入記錄與賬本中保留的記錄。"
  ],
  "{0}: {1} added, {2} ignored, reconciliation {3}.": [
    "{0}：新增 {1} 条，忽略 {2} 条，对账{3}。",
    "{0}：新增 {1} 條，忽略 {2} 條，對賬{3}。"
  ],
  "Amounts use whole pennies. A repeated identity retains the first stored row, while reconciliation flags stay visible for review. The other finance views use a separate 51-row example ledger.": [
    "金额按整数便士计算。遇到重复标识时，保留首条已存储记录，并持续显示对账标记供检查。其他财务视图使用另一份包含 51 条记录的示例账本。",
    "金額按整數便士計算。遇到重複標識時，保留首條已儲存記錄，並持續顯示對賬標記供檢查。其他財務檢視使用另一份包含 51 條記錄的示例賬本。"
  ],
  "Repeated charges": [
    "重复扣款",
    "重複扣款"
  ],
  "Which repeated charge belongs in the ledger?": [
    "哪些重复扣款应当保留在账本中？",
    "哪些重複扣款應當保留在賬本中？"
  ],
  "The occurrence counter starts at zero for each statement. Exact overlaps share keys; a third identical charge receives occurrence 2. This assumes compatible grouping across exports; partial exports of indistinguishable charges still need review.": [
    "每份账单的出现次数从零开始计数。完全重叠的记录使用相同标识；第三笔相同扣款的出现序号为 2。这依赖不同导出文件采用一致的分组方式；若只导出部分无法区分的扣款，仍需人工检查。",
    "每份賬單的出現次數從零開始計數。完全重疊的記錄使用相同標識；第三筆相同扣款的出現序號為 2。這依賴不同匯出檔案採用一致的分組方式；若只匯出部分無法區分的扣款，仍需人工檢查。"
  ],
  "Changed provider ID row": [
    "提供方标识相同，内容变化",
    "提供方標識相同，內容變化"
  ],
  "What happens when an export corrects an existing transaction?": [
    "导出文件修正已有交易时会发生什么？",
    "匯出檔案修正已有交易時會發生什麼？"
  ],
  "A provider ID takes precedence over the amount. The source keeps the first stored row even when the incoming amount changes. The changed-content marker here is an added review aid. Both parsed statements balance independently.": [
    "提供方标识的优先级高于金额。即使传入金额变化，原项目仍保留首条已存储记录。这里新增的内容变化标记用于辅助检查。两份解析后的账单各自都能对平。",
    "提供方標識的優先順序高於金額。即使傳入金額變化，原專案仍保留首條已儲存記錄。這裡新增的內容變化標記用於輔助檢查。兩份解析後的賬單各自都能對平。"
  ],
  "Balance mismatch": [
    "余额不符",
    "餘額不符"
  ],
  "Where does a failed reconciliation go?": [
    "对账失败后，记录会怎样处理？",
    "對賬失敗後，記錄會怎樣處理？"
  ],
  "The source records the reconciliation result and then attempts every insertion. A £10 difference therefore appears alongside a stored transaction. The flag is available for review after import.": [
    "原项目会记录对账结果，然后尝试插入每一条记录。因此，即使差额为 £10，交易仍会被存储。导入后可以检查这一标记。",
    "原專案會記錄對賬結果，然後嘗試插入每一條記錄。因此，即使差額為 £10，交易仍會被儲存。匯入後可以檢查這一標記。"
  ],
  "Empty statement": [
    "空账单",
    "空賬單"
  ],
  "What does a successful status establish for an empty statement?": [
    "空账单显示成功，究竟证明了什么？",
    "空賬單顯示成功，究竟證明了什麼？"
  ],
  "The source treats an empty transaction list as reconciled. Here the declared balance differs by £10 and the status still passes. Reviewing the residual alongside the status exposes this special case.": [
    "原项目将空交易列表视为对账通过。本例声明的余额相差 £10，但状态仍然通过。将差额与状态一起查看，才能发现这一特殊情况。",
    "原專案將空交易列表視為對賬通過。本例宣告的餘額相差 £10，但狀態仍然通過。將差額與狀態一起檢視，才能發現這一特殊情況。"
  ],
  "Fixture merchant": [
    "示例商户",
    "示例商戶"
  ],
  "Two same-day charges": [
    "同一天的两笔扣款",
    "同一天的兩筆扣款"
  ],
  "Exact overlapping export": [
    "完全重叠的导出文件",
    "完全重疊的匯出檔案"
  ],
  "Expanded export: three charges": [
    "扩展导出：三笔扣款",
    "擴展匯出：三筆扣款"
  ],
  "Original provider row": [
    "原始提供方记录",
    "原始提供方記錄"
  ],
  "Corrected amount, same provider ID": [
    "金额已修正，提供方标识相同",
    "金額已修正，提供方標識相同"
  ],
  "Empty statement with a balance change": [
    "余额变化的空账单",
    "餘額變化的空賬單"
  ],
  "Declared closing differs by £10": [
    "声明的期末余额相差 £10",
    "宣告的期末餘額相差 £10"
  ],
  "passed": [
    "通过",
    "通過"
  ],
  "failed": [
    "未通过",
    "未通過"
  ]
} satisfies ProjectCopyTable;
