import type { ProjectCopyTable } from "@/lib/projectCopy";

export const sourceExperimentsCopy = {
  "29 March 2026 · clocks forward": [
    "2026 年 3 月 29 日 · 时钟拨快一小时",
    "2026 年 3 月 29 日 · 時鐘撥快一小時"
  ],
  "25 October 2026 · clocks back": [
    "2026 年 10 月 25 日 · 时钟拨慢一小时",
    "2026 年 10 月 25 日 · 時鐘撥慢一小時"
  ],
  "Daylight-saving booking experiment": [
    "夏令时预约实验",
    "夏令時預約實驗"
  ],
  "YASA / DAYLIGHT-SAVING TIME": [
    "YASA / 夏令时切换",
    "YASA / 夏令時切換"
  ],
  "When 01:00 happens twice.": [
    "当 01:00 出现两次。",
    "當 01:00 出現兩次。"
  ],
  "Generate real intervals inside a London 00:00–03:00 window. Inspect the UTC identity behind each local clock label.": [
    "在伦敦当地时间 00:00–03:00 的窗口内生成实际预约时段，查看每个本地时间标签对应的 UTC 时刻。",
    "在倫敦當地時間 00:00–03:00 的視窗內生成實際預約時段，檢視每個本地時間標籤對應的 UTC 時刻。"
  ],
  "Clock change": [
    "时钟切换",
    "時鐘切換"
  ],
  "Meeting length": [
    "会议时长",
    "會議時長"
  ],
  "minutes": [
    "分钟",
    "分鐘"
  ],
  "Add 5 minutes before and 10 minutes after each meeting": [
    "每次会议前预留 5 分钟，后预留 10 分钟",
    "每次會議前預留 5 分鐘，後預留 10 分鐘"
  ],
  "Local availability": [
    "本地可预约时间",
    "本地可預約時間"
  ],
  "Real elapsed time": [
    "实际经过时间",
    "實際經過時間"
  ],
  "hours": [
    "小时",
    "小時"
  ],
  "Generated slots": [
    "生成的时段",
    "生成的時段"
  ],
  "Generated meeting slots": [
    "生成的会议时段",
    "生成的會議時段"
  ],
  "Select a slot to inspect its interval.": [
    "选择一个时段，查看实际起止时间。",
    "選擇一個時段，檢視實際起止時間。"
  ],
  "UTC start:": [
    "UTC 开始时间：",
    "UTC 開始時間："
  ],
  "UTC end:": [
    "UTC 结束时间：",
    "UTC 結束時間："
  ],
  "Elapsed meeting time:": [
    "会议实际时长：",
    "會議實際時長："
  ],
  "The autumn 01:00 BST and 01:00 GMT slots are an hour apart. In spring the local clock jumps from 00:59 to 02:00. Allocation and reservations use the real interval.": [
    "秋季的 01:00 BST 与 01:00 GMT 相差一小时。春季本地时钟则从 00:59 跳至 02:00。时段分配与预约使用实际经过的时间。",
    "秋季的 01:00 BST 與 01:00 GMT 相差一小時。春季本地時鐘則從 00:59 跳至 02:00。時段分配與預約使用實際經過的時間。"
  ],
  "How the time window becomes slots": [
    "如何将可用时间划分为预约时段",
    "如何將可用時間劃分為預約時段"
  ],
  "The London window spans two elapsed hours in spring and four in autumn. Meetings use real elapsed minutes within that UTC interval. A buffer reserves extra time before and after each meeting, reducing the number of available slots.": [
    "伦敦的这一时间窗口在春季实际持续两小时，在秋季持续四小时。会议按 UTC 区间内真实经过的分钟数安排。会前与会后的缓冲会额外占用时间，因此可预约时段会减少。",
    "倫敦的這一時間視窗在春季實際持續兩小時，在秋季持續四小時。會議按 UTC 區間內真實經過的分鐘數安排。會前與會後的緩衝會額外佔用時間，因此可預約時段會減少。"
  ],
  "The dump command fails": [
    "数据导出命令失败",
    "資料匯出命令失敗"
  ],
  "Check the lock file": [
    "检查锁文件",
    "檢查鎖檔案"
  ],
  "Create the lock file": [
    "创建锁文件",
    "建立鎖檔案"
  ],
  "Dump exits with a failure": [
    "导出以失败状态退出",
    "匯出以失敗狀態退出"
  ],
  "Append a success message": [
    "追加一条成功日志",
    "追加一條成功日誌"
  ],
  "Remove the lock file": [
    "移除锁文件",
    "移除鎖檔案"
  ],
  "Acquire an atomic lock": [
    "获取原子锁",
    "獲取原子鎖"
  ],
  "Run the dump into a temporary file": [
    "将数据导出到临时文件",
    "將資料匯出到臨時檔案"
  ],
  "Read the failing exit status": [
    "读取失败退出状态",
    "讀取失敗退出狀態"
  ],
  "Record failure and preserve the last verified backup": [
    "记录失败并保留上一次已验证的备份",
    "記錄失敗並保留上一次已驗證的備份"
  ],
  "Release the lock in cleanup": [
    "清理时释放锁",
    "清理時釋放鎖"
  ],
  "The process is interrupted": [
    "进程被中断",
    "程序被中斷"
  ],
  "Process exits before cleanup": [
    "进程在清理前退出",
    "程序在清理前退出"
  ],
  "Lock file remains": [
    "锁文件仍然存在",
    "鎖檔案仍然存在"
  ],
  "Next job keeps waiting": [
    "下一次任务持续等待",
    "下一次任務持續等待"
  ],
  "Register cleanup for handled exits": [
    "为可处理的退出情况注册清理操作",
    "為可處理的退出情況註冊清理操作"
  ],
  "Process receives a handled termination signal": [
    "进程收到可处理的终止信号",
    "程序收到可處理的終止訊號"
  ],
  "Exit handler releases the lock": [
    "退出处理程序释放锁",
    "退出處理程序釋放鎖"
  ],
  "Next job can start": [
    "下一次任务可以开始",
    "下一次任務可以開始"
  ],
  "Two jobs arrive together": [
    "两个任务同时到达",
    "兩個任務同時到達"
  ],
  "Job A sees an absent lock": [
    "任务 A 发现锁不存在",
    "任務 A 發現鎖不存在"
  ],
  "Job B sees an absent lock": [
    "任务 B 发现锁不存在",
    "任務 B 發現鎖不存在"
  ],
  "Job A creates the file": [
    "任务 A 创建文件",
    "任務 A 建立檔案"
  ],
  "Job B touches the same file": [
    "任务 B 更新同一个文件",
    "任務 B 更新同一個檔案"
  ],
  "Both jobs enter the backup section": [
    "两个任务都进入备份流程",
    "兩個任務都進入備份流程"
  ],
  "Job A requests an atomic lock": [
    "任务 A 请求原子锁",
    "任務 A 請求原子鎖"
  ],
  "Job A owns the lock": [
    "任务 A 获得锁",
    "任務 A 獲得鎖"
  ],
  "Job B requests the same lock": [
    "任务 B 请求同一把锁",
    "任務 B 請求同一把鎖"
  ],
  "Job B waits with a deadline": [
    "任务 B 在设定的时限内等待",
    "任務 B 在設定的時限內等待"
  ],
  "Only A enters the backup section": [
    "只有任务 A 进入备份流程",
    "只有任務 A 進入備份流程"
  ],
  "Backup failure experiment": [
    "备份故障实验",
    "備份故障實驗"
  ],
  "HOME LAB / BACKUP FAILURES": [
    "家庭实验室 / 备份故障",
    "家庭實驗室 / 備份故障"
  ],
  "Would the success log survive a failed backup?": [
    "备份失败后，日志还会显示成功吗？",
    "備份失敗後，日誌還會顯示成功嗎？"
  ],
  "Inject a failure and compare how two backup workflows handle locks, exit status and cleanup.": [
    "注入一次故障，比较两种备份流程如何处理锁、退出状态和清理操作。",
    "注入一次故障，比較兩種備份流程如何處理鎖、退出狀態和清理操作。"
  ],
  "Failure to inject": [
    "注入的故障",
    "注入的故障"
  ],
  "Advance one event": [
    "前进一步",
    "前進一步"
  ],
  "Reset replay": [
    "重新播放",
    "重新播放"
  ],
  "Basic backup sequence": [
    "基础备份流程",
    "基礎備份流程"
  ],
  "Ready to replay.": [
    "准备开始回放。",
    "準備開始回放。"
  ],
  "Guarded backup sequence": [
    "带保护的备份流程",
    "帶保護的備份流程"
  ],
  "Event {0} of 5. Follow the lock owner, exit status and reported result.": [
    "第 {0} / 5 个事件。观察锁的持有者、退出状态和记录的结果。",
    "第 {0} / 5 個事件。觀察鎖的持有者、退出狀態和記錄的結果。"
  ],
  "The basic sequence logs success after a failing dump. The guarded flow checks exit status before accepting the output.": [
    "基础流程在数据导出失败后仍记录成功。带保护的流程先检查退出状态，再接受输出文件。",
    "基礎流程在資料匯出失敗後仍記錄成功。帶保護的流程先檢查退出狀態，再接受輸出檔案。"
  ],
  "The lock can outlive an interrupted job. Cleanup for handled exits lets the next attempt proceed.": [
    "任务中断后，锁可能仍然存在。为可处理的退出执行清理，才能让下一次尝试继续。",
    "任務中斷後，鎖可能仍然存在。為可處理的退出執行清理，才能讓下一次嘗試繼續。"
  ],
  "Check-then-touch lets both jobs enter. An atomic operation establishes one owner.": [
    "先检查再创建文件，可能让两个任务同时进入。原子操作确保只有一个持有者。",
    "先檢查再建立檔案，可能讓兩個任務同時進入。原子操作確保只有一個持有者。"
  ],
  "How a guarded backup completes": [
    "带保护的备份如何完成",
    "帶保護的備份如何完成"
  ],
  "An atomic lock establishes one owner. The dump writes to a temporary file; its exit status determines whether that output becomes the next accepted backup. Cleanup releases the lock after handled exits.": [
    "原子锁确立唯一的持有者。数据先导出至临时文件，再由退出状态决定该文件是否成为下一份有效备份。可处理的退出会触发清理并释放锁。",
    "原子鎖確立唯一的持有者。資料先匯出至臨時檔案，再由退出狀態決定該檔案是否成為下一份有效備份。可處理的退出會觸發清理並釋放鎖。"
  ],
  "Abrupt power loss needs operating-system-managed locks or stale-lock recovery. Test a restore to check the backup itself. A retention count of 180 files covers a duration determined by successful backup frequency.": [
    "突然断电需要操作系统管理的锁，或失效锁恢复机制。应通过恢复测试检查备份本身是否可用。保留 180 个文件能覆盖多长时间，取决于成功备份的频率。",
    "突然斷電需要作業系統管理的鎖，或失效鎖恢復機制。應通過恢復測試檢查備份本身是否可用。保留 180 個檔案能覆蓋多長時間，取決於成功備份的頻率。"
  ],
  "MRI error and sampling experiments": [
    "MRI 误差与采样实验",
    "MRI 誤差與取樣實驗"
  ],
  "MRI / SYNTHETIC MECHANISM EXPERIMENTS": [
    "MRI / 合成机制实验",
    "MRI / 合成機制實驗"
  ],
  "Same squared error. Different spatial damage.": [
    "平方误差相同，空间损伤不同。",
    "平方誤差相同，空間損傷不同。"
  ],
  "Spread a fixed error budget across a patch or concentrate it in one pixel. Watch which metrics distinguish the patterns.": [
    "将固定的误差预算分散在一块区域中，或集中到一个像素上。观察哪些指标能区分这两种模式。",
    "將固定的誤差預算分散在一塊區域中，或集中到一個畫素上。觀察哪些指標能區分這兩種模式。"
  ],
  "Error pattern": [
    "误差模式",
    "誤差模式"
  ],
  "Sixteen small errors": [
    "十六个小误差",
    "十六個小誤差"
  ],
  "One concentrated error": [
    "一个集中误差",
    "一個集中誤差"
  ],
  "Base residual ·": [
    "基础残差 ·",
    "基礎殘差 ·"
  ],
  "4 × 4 residual patch": [
    "4 × 4 残差区域",
    "4 × 4 殘差區域"
  ],
  "Recomputed pixel metrics": [
    "重新计算的像素指标",
    "重新計算的畫素指標"
  ],
  "MSE": [
    "MSE",
    "MSE"
  ],
  "PSNR, unit peak": [
    "PSNR，峰值设为 1",
    "PSNR，峰值設為 1"
  ],
  "dB": [
    "dB",
    "dB"
  ],
  "MAE": [
    "MAE",
    "MAE"
  ],
  "At residual 0.10, both patterns have MSE 0.01 and PSNR 20 dB. MAE changes from 0.10 to 0.025. Spatial structure needs its own inspection.": [
    "当残差为 0.10 时，两种模式的 MSE 都是 0.01，PSNR 都是 20 dB，但 MAE 从 0.10 变为 0.025。空间结构仍需单独检查。",
    "當殘差為 0.10 時，兩種模式的 MSE 都是 0.01，PSNR 都是 20 dB，但 MAE 從 0.10 變為 0.025。空間結構仍需單獨檢查。"
  ],
  "Inspect the central sampling budget": [
    "查看中心采样预算",
    "檢視中心取樣預算"
  ],
  "Requested acceleration": [
    "请求的加速倍数",
    "請求的加速倍數"
  ],
  "For 256 phase-encoding lines and an 8% central calibration band: target {0} lines, central band {1} lines, retained {2} lines, effective R = {3}.": [
    "共 256 条相位编码线，中心校准带占 8%：目标为 {0} 条，中心带有 {1} 条，实际保留 {2} 条，有效 R = {3}。",
    "共 256 條相位編碼線，中心校準帶佔 8%：目標為 {0} 條，中心帶有 {1} 條，實際保留 {2} 條，有效 R = {3}。"
  ],
  "At R = 16, the 20 central lines already exceed the requested 16-line budget. The central band limits the achievable acceleration.": [
    "当 R = 16 时，中心的 20 条线已经超过请求的 16 条线预算。中心带限制了可实现的加速倍数。",
    "當 R = 16 時，中心的 20 條線已經超過請求的 16 條線預算。中心帶限制了可實現的加速倍數。"
  ],
  "The reconstruction objective combines L1 error with SSIM loss. The pixel experiment explains why spatial structure matters alongside an aggregate error metric; the sampling budget shows how the central calibration band limits acceleration.": [
    "重建目标结合了 L1 误差与 SSIM 损失。像素实验说明了为何除了整体误差指标，还应检查空间结构；采样预算则展示了中心校准带如何限制加速倍数。",
    "重建目標結合了 L1 誤差與 SSIM 損失。畫素實驗說明了為何除了整體誤差指標，還應檢查空間結構；取樣預算則展示了中心校準帶如何限制加速倍數。"
  ]
} satisfies ProjectCopyTable;
