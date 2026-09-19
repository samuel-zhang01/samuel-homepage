import type { ProjectCopyTable } from "@/lib/projectCopy";

export const financeCopy = {
  "HSBC Current •01": ["汇丰活期账户 •01","滙豐活期賬戶 •01"],
  "Revolut Joint •12": ["Revolut 联名账户 •12","Revolut 聯名賬戶 •12"],
  "HSBC Credit •07": ["汇丰信用卡 •07","滙豐信用卡 •07"],
  "Lloyds Current •34": ["劳埃德活期账户 •34","勞埃德活期賬戶 •34"],
  "Trading 212 •21": ["Trading 212 投资账户 •21","Trading 212 投資賬戶 •21"],
  "American Express •08": ["美国运通信用卡 •08","美國運通信用卡 •08"],
  "Amex": ["美国运通","美國運通"],
  "American Express PDF": ["美国运通 PDF","美國運通 PDF"],
  "Moomoo •32": ["Moomoo 投资账户 •32","Moomoo 投資賬戶 •32"],
  "Moomoo": ["Moomoo 证券","Moomoo 證券"],
  "Moomoo PDF": ["Moomoo 月结单 PDF","Moomoo 月結單 PDF"],
  "Net worth": ["净资产","淨資產"],
  "Your whole financial picture": ["完整财务概览","完整財務概覽"],
  "Connected accounts": ["已连接账户","已連接賬戶"],
  "5 bank accounts · 2 brokers": ["5 个银行账户 · 2 家券商","5 個銀行賬戶 · 2 家券商"],
  "Holdings + broker cash": ["持仓 + 券商现金","持倉 + 券商現金"],
  "Spending": ["支出","支出"],
  "Recurring payments": ["定期付款","定期付款"],
  "NET WORTH": ["净资产","淨資產"],
  "Bank balances + investments − credit debt": ["银行余额 + 投资 − 信用卡债务","銀行餘額 + 投資 − 信用卡債務"],
  "Example snapshot · 18 Aug 2026 · GBP": ["示例快照 · 2026 年 8 月 18 日 · 英镑","示例快照 · 2026 年 8 月 18 日 · 英鎊"],
  "BANK BALANCES": ["银行余额","銀行餘額"],
  "Positive bank balances": ["银行账户正余额","銀行賬戶正餘額"],
  "INVESTMENTS": ["投资","投資"],
  "CREDIT DEBT": ["信用卡债务","信用卡債務"],
  "Deducted from net worth": ["从净资产中扣除","從淨資產中扣除"],
  "CHOOSE YOUR ACCOUNTS": ["选择账户","選擇賬戶"],
  "What counts towards net worth?": ["哪些账户计入净资产？","哪些賬戶計入淨資產？"],
  "Balances are counted once. Imported history and a connected account must not become two separate assets.": ["每笔余额只计算一次。导入历史和已连接账户不得作为两项资产重复计算。","每筆餘額只計算一次。導入歷史和已連接賬戶不得作為兩項資產重複計算。"],
  "ONE PLACE FOR YOUR MONEY": ["集中管理资金","集中管理資金"],
  "From balances to better decisions": ["从余额到财务决策","從餘額到財務決策"],
  "Bank and credit accounts": ["银行及信用卡账户","銀行及信用卡賬戶"],
  "Lunch Flow feeds, pending payments and retained statement history.": ["Lunch Flow 数据、待处理付款和保留的历史账单。","Lunch Flow 數據、待處理付款和保留的歷史賬單。"],
  "Trading platforms": ["交易平台","交易平臺"],
  "Trading 212 and Moomoo: read-only investment connections, holdings and account values.": ["Trading 212 和 Moomoo：只读投资连接、持仓与账户价值。","Trading 212 和 Moomoo：只讀投資連接、持倉與賬戶價值。"],
  "Recurring payment checker": ["定期付款检查","定期付款檢查"],
  "Find regular bills, estimate monthly commitments and flag changing prices.": ["发现定期账单、估算每月付款并标记价格变化。","發現定期賬單、估算每月付款並標記價格變化。"],
  "EXAMPLE CONNECTIONS": ["示例连接","示例連接"],
  "5 bank accounts · 2 trading platforms": ["5 个银行账户 · 2 个交易平台","5 個銀行賬戶 · 2 個交易平臺"],
  "All accounts": ["全部账户","全部賬戶"],
  "Bank accounts": ["银行账户","銀行賬戶"],
  "SnapTrade · read-only": ["SnapTrade · 只读","SnapTrade · 只讀"],
  "Lunch Flow · bank feed": ["Lunch Flow · 银行数据","Lunch Flow · 銀行數據"],
  "Sample connection states only. The real app caches account activity, tracks connection health and preserves imported statement history.": ["仅展示示例连接状态。实际应用缓存账户活动、跟踪连接状态并保留导入的账单历史。","僅展示示例連接狀態。實際應用緩存賬戶活動、跟蹤連接狀態並保留導入的賬單歷史。"],
  "Both platforms": ["两个平台","兩個平臺"],
  "ACCOUNT VALUE": ["账户价值","賬戶價值"],
  "BROKER CASH": ["券商现金","券商現金"],
  "Included in account value": ["已计入账户价值","已計入賬戶價值"],
  "OPEN POSITION GAIN": ["未平仓盈亏","未平倉盈虧"],
  "Sample prices, before fees": ["示例价格，未扣费用","示例價格，未扣費用"],
  "READ-ONLY PORTFOLIO": ["只读投资组合","只讀投資組合"],
  "Holdings": ["持仓","持倉"],
  "Security": ["证券","證券"],
  "Shares": ["股数","股數"],
  "Cost": ["成本","成本"],
  "Market value": ["市值","市值"],
  "No holdings in this example account; its cash still contributes to net worth.": ["此示例账户没有持仓；其现金仍计入净资产。","此示例賬戶沒有持倉；其現金仍計入淨資產。"],
  "The real investment workspace also includes saved activity, orders, allocation and dated snapshots. Example securities and prices here are fictional.": ["实际投资界面还提供已保存的活动、订单、资产配置和历史快照。此处证券与价格均为虚构。","實際投資界面還提供已保存的活動、訂單、資產配置和歷史快照。此處證券與價格均為虛構。"],
  "All seven accounts": ["全部七个账户","全部七個賬戶"],
  "Bank balances reconcile": ["银行余额核对一致","銀行餘額核對一致"],
  "Example ledger: balance checks": ["示例账本：余额检查","示例賬本：餘額檢查"],
  "Your money, connected": ["连接你的财务","連接你的財務"],
  "Bring bank balances, investments, debt and recurring payments into one financial picture.": ["将银行余额、投资、债务和定期付款汇集为完整财务概览。","將銀行餘額、投資、債務和定期付款彙集為完整財務概覽。"],
  "Toggle accounts in Net worth, inspect both trading platforms, then check recurring payments for price changes.": ["在净资产中切换账户，查看两个交易平台，再检查定期付款中的价格变化。","在淨資產中切換賬戶，查看兩個交易平臺，再檢查定期付款中的價格變化。"],
  "Debt reduces net worth; broker cash and holdings count once. Every amount here is fictional.": ["债务会减少净资产；券商现金和持仓只计算一次。此处所有金额均为虚构。","債務會減少淨資產；券商現金和持倉只計算一次。此處所有金額均為虛構。"],
  "Explore Ledger’s connected-finance workflow with fictional balances. No live bank connections or private data.": ["通过虚构余额体验 Ledger 的账户连接流程。不连接真实银行，也不使用私人数据。","通過虛構餘額體驗 Ledger 的賬戶連接流程。不連接真實銀行，也不使用私人數據。"],
  "Flagged records: {0}, including duplicate evidence": [
    "已标记记录：{0} 条，包含疑似重复的依据",
    "已標記紀錄：{0} 筆，包含疑似重複的依據"
  ],
  "Harbour Current •01": [
    "Harbour 活期账户 •01",
    "Harbour 活期賬戶 •01"
  ],
  "Harbour": [
    "Harbour",
    "Harbour"
  ],
  "Tide Joint •12": [
    "Tide 联名账户 •12",
    "Tide 聯名賬戶 •12"
  ],
  "Tide": [
    "Tide",
    "Tide"
  ],
  "Northstar Credit •07": [
    "Northstar 信用卡 •07",
    "Northstar 信用卡 •07"
  ],
  "Northstar": [
    "Northstar",
    "Northstar"
  ],
  "Quay Current •34": [
    "Quay 活期账户 •34",
    "Quay 活期賬戶 •34"
  ],
  "Quay": [
    "Quay",
    "Quay"
  ],
  "Atlas Invest •21": [
    "Atlas 投资账户 •21",
    "Atlas 投資賬戶 •21"
  ],
  "Atlas": [
    "Atlas",
    "Atlas"
  ],
  "ACME DESIGN PAYROLL": [
    "ACME DESIGN 工资",
    "ACME DESIGN 工資"
  ],
  "NORTHSTAR LETTINGS": [
    "NORTHSTAR LETTINGS",
    "NORTHSTAR LETTINGS"
  ],
  "JUNCTION MARKET": [
    "JUNCTION MARKET",
    "JUNCTION MARKET"
  ],
  "CLOUD LEDGER": [
    "CLOUD LEDGER",
    "CLOUD LEDGER"
  ],
  "CITYLINE TRANSIT": [
    "CITYLINE TRANSIT",
    "CITYLINE TRANSIT"
  ],
  "CARD SETTLEMENT TO NORTHSTAR": [
    "向 NORTHSTAR 偿还信用卡",
    "向 NORTHSTAR 償還信用卡"
  ],
  "CARD SETTLEMENT FROM HARBOUR": [
    "来自 HARBOUR 的信用卡还款",
    "來自 HARBOUR 的信用卡還款"
  ],
  "RIVERSIDE GROCER": [
    "RIVERSIDE GROCER",
    "RIVERSIDE GROCER"
  ],
  "STREAMLINE MEDIA": [
    "STREAMLINE MEDIA",
    "STREAMLINE MEDIA"
  ],
  "STUDIO GYM": [
    "STUDIO GYM",
    "STUDIO GYM"
  ],
  "RIVER CAFE": [
    "RIVER CAFE",
    "RIVER CAFE"
  ],
  "PORTFOLIO FUNDING TO ATLAS": [
    "向 ATLAS 投资账户入金",
    "向 ATLAS 投資賬戶入金"
  ],
  "PORTFOLIO FUNDING FROM HARBOUR": [
    "来自 HARBOUR 的投资入金",
    "來自 HARBOUR 的投資入金"
  ],
  "ARCADE ELECTRONICS": [
    "ARCADE ELECTRONICS",
    "ARCADE ELECTRONICS"
  ],
  "QUAY ENERGY": [
    "QUAY ENERGY",
    "QUAY ENERGY"
  ],
  "MARKET BUY NOVA": [
    "市价买入 NOVA",
    "市價買入 NOVA"
  ],
  "DIVIDEND NOVA": [
    "NOVA 股息",
    "NOVA 股息"
  ],
  "PAPER & PINE": [
    "PAPER & PINE",
    "PAPER & PINE"
  ],
  "MARKET BUY TIDE": [
    "市价买入 TIDE",
    "市價買入 TIDE"
  ],
  "DIVIDEND TIDE": [
    "TIDE 股息",
    "TIDE 股息"
  ],
  "MAKER SUPPLY": [
    "MAKER SUPPLY",
    "MAKER SUPPLY"
  ],
  "ONLINE BANK PAYMENT": [
    "网银转账付款",
    "網銀轉賬付款"
  ],
  "BANK CREDIT RECEIVED": [
    "收到银行入账",
    "收到銀行入賬"
  ],
  "CANAL KITCHEN": [
    "CANAL KITCHEN",
    "CANAL KITCHEN"
  ],
  "DESK NOTES": [
    "DESK NOTES",
    "DESK NOTES"
  ],
  "MARKET BUY QUAY": [
    "市价买入 QUAY",
    "市價買入 QUAY"
  ],
  "DIVIDEND QUAY": [
    "QUAY 股息",
    "QUAY 股息"
  ],
  "HOMEWARE MINI": [
    "HOMEWARE MINI",
    "HOMEWARE MINI"
  ],
  "Overview": [
    "概览",
    "概覽"
  ],
  "Reconciled cash flow": [
    "已对账的现金流",
    "已對賬的現金流"
  ],
  "Ledger": [
    "账本",
    "賬本"
  ],
  "Why each category": [
    "分类依据",
    "分類依據"
  ],
  "Patterns": [
    "规律",
    "規律"
  ],
  "Cadence detector": [
    "周期检测器",
    "週期檢測器"
  ],
  "Transfers": [
    "转账",
    "轉賬"
  ],
  "Cross-account matching": [
    "跨账户匹配",
    "跨賬戶匹配"
  ],
  "Import checks": [
    "导入检查",
    "匯入檢查"
  ],
  "Parser + dedupe pipeline": [
    "解析与去重流程",
    "解析與去重流程"
  ],
  "Income": [
    "收入",
    "收入"
  ],
  "Housing": [
    "住房",
    "住房"
  ],
  "Groceries": [
    "食品杂货",
    "食品雜貨"
  ],
  "Eating out": [
    "外出用餐",
    "外出用餐"
  ],
  "Transport": [
    "交通",
    "交通"
  ],
  "Shopping": [
    "购物",
    "購物"
  ],
  "Bills & utilities": [
    "账单与公共服务",
    "賬單與公共服務"
  ],
  "Subscriptions": [
    "订阅",
    "訂閱"
  ],
  "Health & education": [
    "健康与教育",
    "健康與教育"
  ],
  "Transfers & payments": [
    "转账与还款",
    "轉賬與還款"
  ],
  "Investments": [
    "投资",
    "投資"
  ],
  "Investment income": [
    "投资收益",
    "投資收益"
  ],
  "ACCOUNT MOVE": [
    "账户间转移",
    "賬戶間轉移"
  ],
  "PORTFOLIO FUNDING": [
    "投资账户入金",
    "投資賬戶入金"
  ],
  "CARD SETTLEMENT": [
    "信用卡还款",
    "信用卡還款"
  ],
  "SELF TRANSFER": [
    "本人账户转账",
    "本人賬戶轉賬"
  ],
  "Unusually large for {0}": [
    "相较于{0}类别，金额异常偏高",
    "相較於{0}類別，金額異常偏高"
  ],
  "Possible duplicate charge": [
    "疑似重复扣款",
    "疑似重複扣款"
  ],
  "weekly": [
    "每周",
    "每週"
  ],
  "fortnightly": [
    "每两周",
    "每兩週"
  ],
  "monthly": [
    "每月",
    "每月"
  ],
  "bi-monthly": [
    "每两个月",
    "每兩個月"
  ],
  "quarterly": [
    "每季度",
    "每季度"
  ],
  "annual": [
    "每年",
    "每年"
  ],
  "price_change": [
    "价格变化",
    "價格變化"
  ],
  "active": [
    "有效",
    "有效"
  ],
  "Cash-flow scope": [
    "现金流范围",
    "現金流範圍"
  ],
  "Analysis period": [
    "分析周期",
    "分析週期"
  ],
  "30 days": [
    "30 天",
    "30 天"
  ],
  "90 days": [
    "90 天",
    "90 天"
  ],
  "Account scope": [
    "账户范围",
    "賬戶範圍"
  ],
  "All five accounts": [
    "全部五个账户",
    "全部五個賬戶"
  ],
  "Anchor": [
    "基准日期",
    "基準日期"
  ],
  "· date windows are fixed and reproducible": [
    "· 日期窗口固定，结果可复现",
    "· 日期視窗固定，結果可復現"
  ],
  "SCOPE POSITION": [
    "所选账户净值",
    "所選賬戶淨值"
  ],
  "At anchor; cash + holdings, debt negative": [
    "截至基准日期；现金加持仓，债务计为负数",
    "截至基準日期；現金加持倉，債務計為負數"
  ],
  "HOUSEHOLD INFLOWS": [
    "家庭现金流入",
    "家庭現金流入"
  ],
  "{0}-day eligible ledger": [
    "{0} 天内符合条件的账本记录",
    "{0} 天內符合條件的賬本記錄"
  ],
  "HOUSEHOLD OUTFLOWS": [
    "家庭现金流出",
    "家庭現金流出"
  ],
  "{0}% of eligible inflows": [
    "占符合条件流入的 {0}%",
    "佔符合條件流入的 {0}%"
  ],
  "NET CASH FLOW": [
    "净现金流",
    "淨現金流"
  ],
  "ROWS IN SCOPE": [
    "范围内记录",
    "範圍內記錄"
  ],
  "{0} excluded from budget": [
    "{0} 条不计入预算",
    "{0} 條不計入預算"
  ],
  "ONE LEDGER · ONE RESULT": [
    "同一账本 · 一致结果",
    "同一賬本 · 一致結果"
  ],
  "Income versus spending": [
    "收入与支出",
    "收入與支出"
  ],
  "Spend": [
    "支出",
    "支出"
  ],
  "{0}-day cash-flow chart. Income {1}, spending {2}.": [
    "{0} 天现金流图。收入 {1}，支出 {2}。",
    "{0} 天現金流圖。收入 {1}，支出 {2}。"
  ],
  "{0} income {1}": [
    "{0} 收入 {1}",
    "{0} 收入 {1}"
  ],
  "{0} spending {1}": [
    "{0} 支出 {1}",
    "{0} 支出 {1}"
  ],
  "Chart Σ income": [
    "图表收入合计",
    "圖表收入合計"
  ],
  "Chart Σ spend": [
    "图表支出合计",
    "圖表支出合計"
  ],
  "✓ HERO CARDS RECONCILE": [
    "✓ 汇总卡片已对平",
    "✓ 彙總卡片已對平"
  ],
  "! CHECK FAILED": [
    "! 检查未通过",
    "! 檢查未通過"
  ],
  "DETERMINISTIC INTELLIGENCE": [
    "确定性规则分析",
    "確定性規則分析"
  ],
  "Explainable signals": [
    "可解释的信号",
    "可解釋的訊號"
  ],
  "transfer groups neutralised": [
    "组转账已抵销",
    "組轉賬已抵銷"
  ],
  "moved once between accounts; both legs stay outside income and spending.": [
    "在账户间转移一次；两端记录均不计入收入与支出。",
    "在賬戶間轉移一次；兩端記錄均不計入收入與支出。"
  ],
  "Review queue has evidence": [
    "待检查记录有具体依据",
    "待檢查記錄有具體依據"
  ],
  "No anomalies at this threshold": [
    "此阈值下没有异常",
    "此閾值下沒有異常"
  ],
  "Category z-score and two-day duplicate checks are clear.": [
    "类别 z 分数与两日内重复扣款检查均未发现异常。",
    "類別 z 分數與兩日內重複扣款檢查均未發現異常。"
  ],
  "Four bank adapters reconcile": [
    "四种银行适配器均已对账",
    "四種銀行解析器均已對賬"
  ],
  "Opening + normalised movements = closing. The investment CSV is treated as a cash ledger.": [
    "期初余额 + 标准化资金变动 = 期末余额。投资 CSV 按现金账本处理。",
    "期初餘額 + 標準化資金變動 = 期末餘額。投資 CSV 按現金賬本處理。"
  ],
  "LIABILITY-AWARE": [
    "考虑负债",
    "考慮負債"
  ],
  "Account reconciliation": [
    "账户对账",
    "賬戶對賬"
  ],
  "debt normalised negative": [
    "债务统一显示为负数",
    "債務統一顯示為負數"
  ],
  "ELIGIBLE OUTFLOWS ONLY": [
    "仅含符合条件的流出",
    "僅含符合條件的流出"
  ],
  "Category mix": [
    "类别构成",
    "類別構成"
  ],
  "TRANSACTION DETAILS": [
    "交易详情",
    "交易詳情"
  ],
  "Synthetic ledger": [
    "合成示例账本",
    "合成示例賬本"
  ],
  "rows": [
    "条记录",
    "條記錄"
  ],
  "Search": [
    "搜索",
    "搜尋"
  ],
  "Merchant, category, account…": [
    "商户、类别、账户…",
    "商戶、類別、賬戶…"
  ],
  "Category": [
    "类别",
    "類別"
  ],
  "All categories": [
    "全部类别",
    "全部類別"
  ],
  "Budget treatment": [
    "预算处理",
    "預算處理"
  ],
  "All rows": [
    "全部记录",
    "全部記錄"
  ],
  "Household cash flow": [
    "家庭现金流",
    "家庭現金流"
  ],
  "Transfers + investment churn": [
    "转账与投资资金流转",
    "轉賬與投資資金流轉"
  ],
  "Date": [
    "日期",
    "日期"
  ],
  "Account": [
    "账户",
    "賬戶"
  ],
  "Description": [
    "描述",
    "描述"
  ],
  "Model": [
    "处理模型",
    "處理模型"
  ],
  "Amount": [
    "金额",
    "金額"
  ],
  "CASH FLOW": [
    "现金流",
    "現金流"
  ],
  "EXCLUDED": [
    "已排除",
    "已排除"
  ],
  "No rows match this query.": [
    "没有记录符合当前查询。",
    "沒有記錄符合當前查詢。"
  ],
  "Filtered household income": [
    "筛选后的家庭收入",
    "篩選後的家庭收入"
  ],
  "Filtered household spend": [
    "筛选后的家庭支出",
    "篩選後的家庭支出"
  ],
  "Net": [
    "净额",
    "淨額"
  ],
  "WHY THIS ROW?": [
    "为何这样处理？",
    "為何這樣處理？"
  ],
  "Why this record?": [
    "这条记录的依据",
    "這條記錄的依據"
  ],
  "Normalised merchant": [
    "标准化商户",
    "標準化商戶"
  ],
  "Transfer group": [
    "转账分组",
    "轉賬分組"
  ],
  "Not matched": [
    "未匹配",
    "未匹配"
  ],
  "Anomaly evidence": [
    "异常依据",
    "異常依據"
  ],
  "No flag at selected threshold": [
    "在所选阈值下没有标记",
    "在所選閾值下沒有標記"
  ],
  "TRANSACTION IDENTITY": [
    "交易标识",
    "交易標識"
  ],
  "A provider transaction ID identifies a row when available. Otherwise its date, amount, description and occurrence within the statement form the duplicate check.": [
    "有提供方交易标识时，用它识别记录。否则，使用日期、金额、描述及其在账单中出现的次数进行重复检查。",
    "有提供方交易標識時，用它識別記錄。否則，使用日期、金額、描述及其在賬單中出現的次數進行重複檢查。"
  ],
  "Select a transaction.": [
    "选择一笔交易。",
    "選擇一筆交易。"
  ],
  "LIVE PARAMETERS": [
    "可调参数",
    "可調引數"
  ],
  "Reset": [
    "重置",
    "重置"
  ],
  "Minimum occurrences": [
    "最少出现次数",
    "最少出現次數"
  ],
  "Required regularity": [
    "最低规律性",
    "最低規律性"
  ],
  "Price-change threshold": [
    "价格变化阈值",
    "價格變化閾值"
  ],
  "Monthly tolerance": [
    "月度容差",
    "月度容差"
  ],
  "days": [
    "天",
    "天"
  ],
  "Outgoing rows group by normalised merchant. Median day gaps map to weekly, fortnightly, monthly, bi-monthly, quarterly or annual centres; irregular groups are rejected.": [
    "支出记录按标准化商户分组。相邻日期间隔的中位数用于判断每周、每两周、每月、每两个月、每季度或每年的周期；不规律的组会被排除。",
    "支出記錄按標準化商戶分組。相鄰日期間隔的中位數用於判斷每週、每兩週、每月、每兩個月、每季度或每年的週期；不規律的組會被排除。"
  ],
  "PATTERNS": [
    "识别的规律",
    "識別的規律"
  ],
  "90-day synthetic corpus": [
    "90 天合成示例数据",
    "90 天合成示例資料"
  ],
  "MONTHLY EQUIVALENT": [
    "折算月度金额",
    "折算月度金額"
  ],
  "Sum of typical amounts times 30.4 days divided by cadence in days": [
    "将各组典型金额乘以 30.4 天，再除以周期天数后求和",
    "將各組典型金額乘以 30.4 天，再除以週期天數後求和"
  ],
  "PRICE CHANGES": [
    "价格变化",
    "價格變化"
  ],
  "Recent median differs > {0}": [
    "近期中位数偏差 > {0}",
    "近期中位數偏差 > {0}"
  ],
  "EXPLAINABLE RESULT SET": [
    "可解释的结果",
    "可解釋的結果"
  ],
  "Recurring candidates": [
    "周期性支出候选",
    "週期性支出候選"
  ],
  "pass": [
    "项通过",
    "項通過"
  ],
  "Merchant": [
    "商户",
    "商戶"
  ],
  "Cadence": [
    "周期",
    "週期"
  ],
  "Median gap": [
    "间隔中位数",
    "間隔中位數"
  ],
  "Typical": [
    "典型金额",
    "典型金額"
  ],
  "Monthly equivalent": [
    "折算月度金额",
    "折算月度金額"
  ],
  "Evidence": [
    "依据",
    "依據"
  ],
  "Status": [
    "状态",
    "狀態"
  ],
  "PRICE CHANGE": [
    "价格变化",
    "價格變化"
  ],
  "ACTIVE": [
    "有效",
    "有效"
  ],
  "No candidates pass these settings. Loosen the cadence tolerance or evidence thresholds.": [
    "没有候选符合这些设置。请放宽周期容差或证据阈值。",
    "沒有候選符合這些設定。請放寬週期容差或證據閾值。"
  ],
  "CONFIGURABLE PRECISION": [
    "可调匹配精度",
    "可調匹配精度"
  ],
  "Cross-account matcher": [
    "跨账户匹配器",
    "跨賬戶匹配器"
  ],
  "Date window": [
    "日期窗口",
    "日期視窗"
  ],
  "day": [
    "天",
    "天"
  ],
  "Require descriptor evidence": [
    "要求描述文字依据",
    "要求描述文字依據"
  ],
  "Generic “account move”, “funding” or “settlement” tokens. Amount equality remains mandatory.": [
    "检查“账户转移”“入金”或“结算”等通用描述。金额相等仍是必要条件。",
    "檢查“賬戶轉移”“入金”或“結算”等通用描述。金額相等仍是必要條件。"
  ],
  "SCORE": [
    "评分",
    "評分"
  ],
  "Transfer matching score": [
    "转账匹配评分",
    "轉賬匹配評分"
  ],
  "Greedy one-to-one matching prevents an incoming row from being reused. Same-account pairs are rejected.": [
    "贪心一对一匹配防止重复使用同一条入账记录，并排除同一账户内部的配对。",
    "貪心一對一匹配防止重複使用同一條入賬記錄，並排除同一賬戶內部的配對。"
  ],
  "MATCHES": [
    "匹配数",
    "匹配數"
  ],
  "MOVED ONCE": [
    "单次转移金额",
    "單次轉移金額"
  ],
  "LEDGER LEGS": [
    "账本两端记录",
    "賬本兩端記錄"
  ],
  "ROUTE EVIDENCE": [
    "转账路径依据",
    "轉賬路徑依據"
  ],
  "Matched money flows": [
    "已匹配的资金流",
    "已匹配的資金流"
  ],
  "excluded from budget": [
    "不计入预算",
    "不計入預算"
  ],
  "d gap · score": [
    "天间隔 · 评分",
    "天間隔 · 評分"
  ],
  "descriptor evidence": [
    "有描述依据",
    "有描述依據"
  ],
  "amount/date only": [
    "仅凭金额与日期",
    "僅憑金額與日期"
  ],
  "No pairs pass this configuration.": [
    "没有配对符合当前设置。",
    "沒有配對符合當前設定。"
  ],
  "Each card represents two ledger rows but counts the moved amount once. The accounting exclusion removes both legs, preventing artificial income and spending.": [
    "每张卡片对应两条账本记录，但转移金额只计算一次。会计处理时排除两端记录，避免虚增收入与支出。",
    "每張卡片對應兩條賬本記錄，但轉移金額只計算一次。會計處理時排除兩端記錄，避免虛增收入與支出。"
  ],
  "PENNY-CLOSE CONTROL": [
    "便士级余额检查",
    "便士級餘額檢查"
  ],
  "Separate 51-row ledger: balance checks": [
    "独立的 51 条记录账本：余额检查",
    "獨立的 51 條記錄賬本：餘額檢查"
  ],
  "Adapter": [
    "适配器",
    "解析器"
  ],
  "Rows": [
    "记录数",
    "記錄數"
  ],
  "Opening": [
    "期初",
    "期初"
  ],
  "Σ movement": [
    "资金变动合计",
    "資金變動合計"
  ],
  "Closing": [
    "期末",
    "期末"
  ],
  "Difference": [
    "差额",
    "差額"
  ],
  "Control": [
    "检查",
    "檢查"
  ],
  "CASH LEDGER": [
    "现金账本",
    "現金賬本"
  ],
  "✓ RECONCILED": [
    "✓ 已对账",
    "✓ 已對賬"
  ],
  "CHECK": [
    "检查",
    "檢查"
  ],
  "Debit / current / joint": [
    "借记 / 活期 / 联名账户",
    "借記 / 活期 / 聯名賬戶"
  ],
  "use opening + signed row amounts = closing.": [
    "使用期初余额 + 带正负号的交易金额 = 期末余额。",
    "使用期初餘額 + 帶正負號的交易金額 = 期末餘額。"
  ],
  "Credit": [
    "信用卡",
    "信用卡"
  ],
  "is normalised for the portfolio so debt is negative; statement debits and credits are verified before that presentation transform.": [
    "在账户组合中统一将债务显示为负数；账单借方与贷方先经过验证，再进行这一显示转换。",
    "在賬戶組合中統一將債務顯示為負數；賬單借方與貸方先經過驗證，再進行這一顯示轉換。"
  ],
  "Investment CSV": [
    "投资 CSV",
    "投資 CSV"
  ],
  "has no carried statement balance. Its closing cash is opening zero or staged cash + signed actions; market holdings are valued separately.": [
    "不含结转的账单余额。其期末现金为零起始现金或预设现金，加上带正负号的交易变动；市场持仓另行估值。",
    "不含結轉的賬單餘額。其期末現金為零起始現金或預設現金，加上帶正負號的交易變動；市場持倉另行估值。"
  ],
  "Finance App — Ocean Depths": [
    "财务应用 — 深海",
    "財務應用 — 深海"
  ],
  "Bank Statement Intelligence Control Room": [
    "银行账单分析控制室",
    "銀行賬單分析控制室"
  ],
  "SYNTHETIC · LOCAL-FIRST": [
    "合成数据 · 本地运行",
    "合成數據 · 本地執行"
  ],
  "Trace statement identity, reconciliation status and the calculations behind a household ledger.": [
    "追踪账单标识、对账状态与家庭账本背后的计算。",
    "追蹤賬單標識、對賬狀態與家庭賬本背後的計算。"
  ],
  "Import two repeated charges, replay the export, then inspect a corrected amount under the same provider ID.": [
    "导入两笔重复扣款，重新导入同一文件，再查看提供方标识相同但金额修正后的情况。",
    "匯入兩筆重複扣款，重新匯入同一檔案，再檢視提供方標識相同但金額修正後的情況。"
  ],
  "Import receipts expose stored and skipped rows; separate controls explore recurring and transfer rules over the fictional ledger.": [
    "导入结果展示保留与跳过的记录；其他控制项在虚构账本上探索周期识别和转账规则。",
    "匯入結果展示保留與跳過的記錄；其他控制項在虛構賬本上探索週期識別和轉賬規則。"
  ],
  "invented ledger rows ·": [
    "条虚构账本记录 ·",
    "條虛構賬本記錄 ·"
  ],
  "fictional accounts · no file access": [
    "个虚构账户 · 不访问文件",
    "個虛構賬戶 · 不訪問檔案"
  ],
  "Holdings: cost": [
    "持仓：成本",
    "持倉：成本"
  ],
  "· marked": [
    "· 估值",
    "· 估值"
  ],
  "Example accounts and transactions": [
    "示例账户与交易",
    "示例賬戶與交易"
  ],
  "Import, reconcile and categorise a fictional household ledger.": [
    "导入、对账并分类一份虚构家庭账本。",
    "匯入、對賬並分類一份虛構家庭賬本。"
  ],
  "STATEMENT IMPORT RULES": [
    "账单导入规则",
    "賬單匯入規則"
  ],
  "The rules behind the ledger": [
    "账本背后的规则",
    "賬本背後的規則"
  ],
  "Import statements into an empty ledger, or explore spending patterns across 51 example transactions.": [
    "向空账本导入账单，或探索 51 笔示例交易中的支出规律。",
    "向空賬本匯入賬單，或探索 51 筆示例交易中的支出規律。"
  ],
  "Provider adapters": [
    "提供方适配器",
    "提供方解析器"
  ],
  "Balance tolerance": [
    "余额容差",
    "餘額容差"
  ],
  "Identity paths": [
    "标识方式",
    "標識方式"
  ],
  "Repeated rows": [
    "重复记录",
    "重複記錄"
  ],
  "Occurrence key": [
    "出现次数标识",
    "出現次數標識"
  ],
  "Transfer window": [
    "转账窗口",
    "轉賬視窗"
  ],
  "3 days": [
    "3 天",
    "3 天"
  ],
  "Recurring minimum": [
    "周期识别最低要求",
    "週期識別最低要求"
  ],
  "3 dates": [
    "3 个日期",
    "3 個日期"
  ],
  "Finance intelligence views": [
    "财务分析视图",
    "財務分析檢視"
  ],
  "Category anomaly threshold": [
    "类别异常阈值",
    "類別異常閾值"
  ],
  "row": [
    "条记录",
    "條記錄"
  ],
  "flagged, including duplicate evidence": [
    "已标记，包含疑似重复的依据",
    "已標記，包含疑似重複的依據"
  ],
  "18 Aug 2026": [
    "2026 年 8 月 18 日",
    "2026 年 8 月 18 日"
  ],
  "Internal move": [
    "内部转账",
    "內部轉賬"
  ],
  "Portfolio churn": [
    "投资资金流转",
    "投資資金流轉"
  ],
  "current": [
    "活期",
    "活期"
  ],
  "joint": [
    "联名",
    "聯名"
  ],
  "investment": [
    "投资",
    "投資"
  ],
  "auto": [
    "自动",
    "自動"
  ],
  "parser": [
    "解析器",
    "解析器"
  ],
  "rule": [
    "规则",
    "規則"
  ],
  "HSBC Debit PDF": [
    "HSBC 借记账单 PDF",
    "HSBC 借記賬單 PDF"
  ],
  "HSBC Credit PDF": [
    "HSBC 信用卡账单 PDF",
    "HSBC 信用卡賬單 PDF"
  ],
  "Lloyds PDF": [
    "Lloyds 账单 PDF",
    "Lloyds 賬單 PDF"
  ],
  "Revolut PDF": [
    "Revolut 账单 PDF",
    "Revolut 賬單 PDF"
  ],
  "Trading 212 CSV": [
    "Trading 212 交易 CSV",
    "Trading 212 交易 CSV"
  ],
  "22–30D": [
    "前 22–30 天",
    "前 22–30 天"
  ],
  "15–21D": [
    "前 15–21 天",
    "前 15–21 天"
  ],
  "8–14D": [
    "前 8–14 天",
    "前 8–14 天"
  ],
  "0–7D": [
    "前 0–7 天",
    "前 0–7 天"
  ],
  "61–90D": [
    "前 61–90 天",
    "前 61–90 天"
  ],
  "31–60D": [
    "前 31–60 天",
    "前 31–60 天"
  ],
  "0–30D": [
    "前 0–30 天",
    "前 0–30 天"
  ],
  "Northstar Lettings": [
    "Northstar Lettings",
    "Northstar Lettings"
  ],
  "Junction Market": [
    "Junction Market",
    "Junction Market"
  ],
  "Cloud Ledger": [
    "Cloud Ledger",
    "Cloud Ledger"
  ],
  "Cityline Transit": [
    "Cityline Transit",
    "Cityline Transit"
  ],
  "Riverside Grocer": [
    "Riverside Grocer",
    "Riverside Grocer"
  ],
  "Streamline Media": [
    "Streamline Media",
    "Streamline Media"
  ],
  "Studio Gym": [
    "Studio Gym",
    "Studio Gym"
  ],
  "River Cafe": [
    "River Cafe",
    "River Cafe"
  ],
  "Arcade Electronics": [
    "Arcade Electronics",
    "Arcade Electronics"
  ],
  "Quay Energy": [
    "Quay Energy",
    "Quay Energy"
  ],
  "Paper & Pine": [
    "Paper & Pine",
    "Paper & Pine"
  ],
  "Maker Supply": [
    "Maker Supply",
    "Maker Supply"
  ],
  "Canal Kitchen": [
    "Canal Kitchen",
    "Canal Kitchen"
  ],
  "Desk Notes": [
    "Desk Notes",
    "Desk Notes"
  ],
  "Homeware Mini": [
    "Homeware Mini",
    "Homeware Mini"
  ],
  "NOVA": [
    "NOVA",
    "NOVA"
  ],
  "TIDE": [
    "TIDE",
    "TIDE"
  ],
  "QUAY": [
    "QUAY",
    "QUAY"
  ],
  "Acme Design Payroll": [
    "Acme Design 工资",
    "Acme Design 薪資"
  ],
  "Card Settlement": [
    "信用卡还款",
    "信用卡還款"
  ],
  "Portfolio Funding": [
    "投资账户入金",
    "投資帳戶入金"
  ],
  "Account Move": [
    "账户间转移",
    "帳戶間轉移"
  ],
  "Ocean Depths Finance": [
    "Ocean Depths Finance",
    "Ocean Depths Finance"
  ],
  "Explore the household ledger": [
    "探索家庭账本",
    "探索家庭賬本"
  ],
  "Fictional ledger · local": [
    "虚构账本 · 本地运行",
    "虛構賬本 · 本地執行"
  ],
  "Recorded application scale": ["应用历史规模", "應用歷史規模"],
  "What the application reconciled": ["应用完成了哪些对账工作", "應用完成了哪些對帳工作"],
  "My earlier application handover recorded these aggregate counts. They describe that historical dataset; the interactive examples here use a separate fictional ledger.": ["我此前的应用交接记录了这些汇总数量。它们描述当时的数据集；此处的交互示例使用独立的虚构账本。", "我此前的應用交接記錄了這些彙總數量。它們描述當時的資料集；此處的互動示例使用獨立的虛構帳本。"],
  "Transactions": ["交易", "交易"],
  "Accounts": ["账户", "帳戶"],
  "Statements reconciled": ["已完成对账的账单", "已完成對帳的帳單"],
  "Recurring patterns": ["周期性模式", "週期性模式"],
  "Transfer groups": ["转账组", "轉帳組"],
  "Anomaly records": ["异常记录", "異常記錄"]
} as const satisfies ProjectCopyTable;
