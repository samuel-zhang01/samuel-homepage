import type { ProjectCopyTable } from "@/lib/projectCopy";

export const projectConceptScienceCopy = {
  "Learn from a costly choice": [
    "从代价高的选择中学习",
    "從代價高的選擇中學習"
  ],
  "Start at the cliff": [
    "从悬崖边出发",
    "從懸崖邊出發"
  ],
  "An agent chooses a move, observes a reward and updates its estimate.": [
    "智能体选择移动、观察奖励，并更新估计。",
    "智慧體選擇移動、觀察獎勵，並更新估計。"
  ],
  "Try the risky move": [
    "尝试冒险移动",
    "嘗試冒險移動"
  ],
  "Moving right from the start hits the cliff: reward −100 and a return to the start.": [
    "从起点向右移动会跌落悬崖：奖励为 −100，并回到起点。",
    "從起點向右移動會跌落懸崖：獎勵為 −100，並回到起點。"
  ],
  "Update the action value": [
    "更新动作价值",
    "更新動作價值"
  ],
  "With learning rate 0.1 and initial values zero, this one Q-learning update gives −10.": [
    "学习率为 0.1、初始价值为零时，这一次 Q-learning 更新得到 −10。",
    "學習率為 0.1、初始價值為零時，這一次 Q-learning 更新得到 −10。"
  ],
  "Compare a safer route": [
    "比较安全路径",
    "比較安全路徑"
  ],
  "The displayed detour avoids the cliff in nine moves. Learning a policy still needs repeated trials.": [
    "图示绕行路径用九步避开悬崖。学习策略仍需多次尝试。",
    "圖示繞行路徑用九步避開懸崖。學習策略仍需多次嘗試。"
  ],
  "A smaller teaching grid, using the same update rule as my reinforcement-learning code.": [
    "这是较小的教学网格，使用与我的强化学习代码相同的更新规则。",
    "這是較小的教學網格，使用與我的強化學習程式相同的更新規則。"
  ],
  "Choose, observe, revise": [
    "选择、观察、修正",
    "選擇、觀察、修正"
  ],
  "Observe three options": [
    "观察三个选项",
    "觀察三個選項"
  ],
  "Each option starts with two observed rewards. The means alone favour B.": [
    "每个选项已有两个观测奖励。只看均值时，B 最好。",
    "每個選項已有兩個觀測獎勵。只看均值時，B 最好。"
  ],
  "Allow for uncertainty": [
    "考虑不确定性",
    "考慮不確定性"
  ],
  "UCB1 adds an exploration bonus to each observed mean.": [
    "UCB1 为每个观测均值加上探索奖励。",
    "UCB1 為每個觀測均值加上探索獎勵。"
  ],
  "Choose the upper bound": [
    "选择上界最高者",
    "選擇上界最高者"
  ],
  "B has the largest upper-bound score, so this round tries B.": [
    "B 的上界分数最高，因此这一轮尝试 B。",
    "B 的上界分數最高，因此這一輪嘗試 B。"
  ],
  "Update after a miss": [
    "未获奖励后更新",
    "未獲獎勵後更新"
  ],
  "B returns zero. Its mean becomes 2/3; on the next round A has the larger upper bound.": [
    "B 返回零。它的均值变为 2/3；下一轮 A 的上界更高。",
    "B 回傳零。它的均值變為 2/3；下一輪 A 的上界更高。"
  ],
  "A six-observation binary-reward example; these are calculated choices, not measured project performance.": [
    "这是六次观测的二元奖励示例；这里是计算出的选择，不是项目实测表现。",
    "這是六次觀測的二元獎勵範例；這裡是計算出的選擇，不是專案實測表現。"
  ],
  "One microscope image, two questions": [
    "一张显微图像，两个问题",
    "一張顯微影像，兩個問題"
  ],
  "Read the shared image": [
    "观察同一张图像",
    "觀察同一張影像"
  ],
  "I used the same type of microscope image to estimate tilt and depth.": [
    "我用同一类型的显微图像估计倾斜与深度。",
    "我用同一類型的顯微影像估計傾斜與深度。"
  ],
  "Estimate orientation": [
    "估计朝向",
    "估計朝向"
  ],
  "This saved pose example has label and prediction 27: 60° pitch, 0° roll.": [
    "这个保存的姿态示例，标签与预测均为 27：俯仰 60°、横滚 0°。",
    "這個保存的姿態範例，標籤與預測均為 27：俯仰 60°、橫滾 0°。"
  ],
  "Inspect the depth response": [
    "查看深度响应",
    "查看深度反應"
  ],
  "The depth model emphasises different regions. The recorded target is 0.36 on a normalised scale.": [
    "深度模型关注不同区域。记录的目标在归一化尺度上为 0.36。",
    "深度模型關注不同區域。記錄的目標在正規化尺度上為 0.36。"
  ],
  "Compare model size": [
    "比较模型大小",
    "比較模型大小"
  ],
  "MobileNetV3 uses 7.0% of the depth-model parameters, with 0.0069 more RMSE than ResNet34.": [
    "MobileNetV3 的深度模型参数量为 7.0%，RMSE 比 ResNet34 高 0.0069。",
    "MobileNetV3 的深度模型參數量為 7.0%，RMSE 比 ResNet34 高 0.0069。"
  ],
  "Saved study images and results. Response-map colour is independently scaled; it is not confidence.": [
    "这是保存的研究图像与结果。响应图颜色各自缩放，不代表置信度。",
    "這是保存的研究影像與結果。反應圖顏色各自縮放，不代表信心程度。"
  ],
  "Recover structure from fewer measurements": [
    "从较少测量中恢复结构",
    "從較少量測中恢復結構"
  ],
  "Start with the reference": [
    "从参考图像开始",
    "從參考影像開始"
  ],
  "The reference shows the heart when all measurements are available.": [
    "参考图像显示测量完整时的心脏。",
    "參考影像顯示量測完整時的心臟。"
  ],
  "Keep one in four lines": [
    "保留四分之一的线",
    "保留四分之一的線"
  ],
  "Keeping about one in four measurement lines leaves visible aliasing in this saved slice.": [
    "保留约四分之一的测量线后，这张保存的切片出现可见混叠。",
    "保留約四分之一的量測線後，這張保存的切片出現可見混疊。"
  ],
  "Recover the heart": [
    "恢复心脏结构",
    "恢復心臟結構"
  ],
  "My saved reconstruction improves this example from 27.0 to 29.6 dB PSNR.": [
    "我保存的重建把此示例的 PSNR 从 27.0 提高到 29.6 dB。",
    "我保存的重建把此範例的 PSNR 從 27.0 提高到 29.6 dB。"
  ],
  "Inspect what is still wrong": [
    "查看剩余错误",
    "查看剩餘誤差"
  ],
  "Both error maps use 0–0.15 intensity units. Bright tissue boundaries still need attention.": [
    "两张误差图都使用 0–0.15 强度单位。明亮的组织边界仍需注意。",
    "兩張誤差圖都使用 0–0.15 強度單位。明亮的組織邊界仍需注意。"
  ],
  "Crops of my unchanged report figure; example-slice values, not new browser inference.": [
    "这是我未修改的报告图局部；数值属于示例切片，不是浏览器新推理。",
    "這是我未修改的報告圖局部；數值屬於範例切片，不是瀏覽器新推論。"
  ],
  "Predict the changing wake": [
    "预测变化的尾流",
    "預測變化的尾流"
  ],
  "Start from a flow field": [
    "从流场开始",
    "從流場開始"
  ],
  "The graph network stores velocity and pressure at nodes of a fixed mesh.": [
    "图网络在固定网格的节点上记录速度与压力。",
    "圖網路在固定網格的節點上記錄速度與壓力。"
  ],
  "Predict the next fields": [
    "预测后续流场",
    "預測後續流場"
  ],
  "The saved prediction changes the transverse-velocity pattern behind the cylinder.": [
    "保存的预测改变圆柱后方的横向速度分布。",
    "保存的預測改變圓柱後方的橫向速度分布。"
  ],
  "Feed predictions forward": [
    "将预测作为后续输入",
    "將預測作為後續輸入"
  ],
  "Each predicted field becomes an input for the next prediction. Errors can travel with it.": [
    "每个预测流场都成为下一次预测的输入，误差也可能随之传递。",
    "每個預測流場都成為下一次預測的輸入，誤差也可能隨之傳遞。"
  ],
  "Compare the final wake": [
    "比较最终尾流",
    "比較最終尾流"
  ],
  "Compare saved frames 1 and 20 within the same sequence. The wake changes as the rollout continues.": [
    "比较同一序列中保存的第 1 与第 20 帧。滚动预测过程中，尾流不断变化。",
    "比較同一序列中保存的第 1 與第 20 影格。滾動預測過程中，尾流不斷變化。"
  ],
  "Actual saved predictions. Each frame has its own colour scaling; this is a time comparison, not an error score.": [
    "这是实际保存的预测。每帧颜色单独缩放；此处比较时间变化，不是误差评分。",
    "這是實際保存的預測。每影格顏色單獨縮放；此處比較時間變化，不是誤差評分。"
  ],
  "What if a sensor goes offline?": [
    "传感器离线会怎样？",
    "感測器離線會怎樣？"
  ],
  "Use both signals": [
    "使用两个信号",
    "使用兩個訊號"
  ],
  "The balanced design uses benzene and the CO sensor: cross-validation RMSE 0.8286.": [
    "均衡方案使用苯与 CO 传感器：交叉验证 RMSE 为 0.8286。",
    "均衡方案使用苯與 CO 感測器：交叉驗證 RMSE 為 0.8286。"
  ],
  "Lose the CO sensor": [
    "CO 传感器离线",
    "CO 感測器離線"
  ],
  "Without the CO signal, only the benzene-only design remains: RMSE 0.9211.": [
    "缺少 CO 信号后，仅剩苯单输入方案：RMSE 为 0.9211。",
    "缺少 CO 訊號後，僅剩苯單輸入方案：RMSE 為 0.9211。"
  ],
  "Restore the signal": [
    "恢复信号",
    "恢復訊號"
  ],
  "Restoring CO makes the balanced design available again.": [
    "恢复 CO 后，均衡方案再次可用。",
    "恢復 CO 後，均衡方案再次可用。"
  ],
  "Lose the shared input": [
    "共同输入缺失",
    "共同輸入缺失"
  ],
  "Both designs need benzene. If it is absent, I show no available prediction rather than invent a score.": [
    "两个方案都需要苯；它缺失时，我显示没有可用预测，而不虚构分数。",
    "兩個方案都需要苯；它缺失時，我顯示沒有可用預測，而不虛構分數。"
  ],
  "Coursework validation scores; sensor prices and the outage are a hypothetical planning example.": [
    "验证分数来自课程项目；传感器价格与离线情景是假设规划示例。",
    "驗證分數來自課程專案；感測器價格與離線情境是假設規劃範例。"
  ],
  "The same detector, a different day": [
    "同一检测器，不同的一天",
    "同一偵測器，不同的一天"
  ],
  "Start with frequent attacks": [
    "从攻击较多的情景开始",
    "從攻擊較多的情境開始"
  ],
  "In 2,000 fictional flows with 50% attacks, threshold 0.20 produces 1,250 alerts.": [
    "2,000 条虚构流量中，攻击占 50%；阈值 0.20 会产生 1,250 次告警。",
    "2,000 筆虛構流量中，攻擊占 50%；閾值 0.20 會產生 1,250 次警示。"
  ],
  "Make attacks rare": [
    "让攻击变少",
    "讓攻擊變少"
  ],
  "At 1% attacks, the same threshold produces 514 alerts, but only 3.9% are real attacks.": [
    "攻击占 1% 时，同一阈值产生 514 次告警，但仅 3.9% 属于真实攻击。",
    "攻擊占 1% 時，同一閾值產生 514 次警示，但僅 3.9% 屬於真實攻擊。"
  ],
  "Raise the threshold": [
    "提高阈值",
    "提高閾值"
  ],
  "A higher threshold reduces the review queue and can miss more attacks.": [
    "更高的阈值减少待审告警，也可能漏掉更多攻击。",
    "更高的閾值減少待審警示，也可能漏掉更多攻擊。"
  ],
  "Inspect the missed attacks": [
    "查看漏报攻击",
    "查看漏報攻擊"
  ],
  "At threshold 0.99, there are 25 alerts and six missed attacks. Fewer alerts alone is not success.": [
    "阈值 0.99 时，有 25 次告警和六次漏报。告警更少不等于成功。",
    "閾值 0.99 時，有 25 次警示和六次漏報。警示更少不等於成功。"
  ],
  "Calculated teaching rates, not measured detection performance from my contaminated original split.": [
    "这里使用计算的教学比率，不是我原始受污染划分上的实测检测表现。",
    "這裡使用計算的教學比率，不是我原始受污染切分上的實測偵測表現。"
  ],
  "Remove a noisy input": [
    "移除噪声输入",
    "移除雜訊輸入"
  ],
  "Give every input a weight": [
    "为每个输入赋权",
    "為每個輸入賦權"
  ],
  "A prediction adds each input multiplied by its coefficient. The noise coefficient begins at −0.19.": [
    "预测将各输入与系数相乘后求和。噪声系数初始为 −0.19。",
    "預測將各輸入與係數相乘後加總。雜訊係數初始為 −0.19。"
  ],
  "Shrink all weights": [
    "缩小所有权重",
    "縮小所有權重"
  ],
  "Ridge divides each coefficient by 1 + λ. Every input still contributes.": [
    "Ridge 将各系数除以 1 + λ。每个输入仍有贡献。",
    "Ridge 將各係數除以 1 + λ。每個輸入仍有貢獻。"
  ],
  "Remove weak inputs": [
    "移除弱输入",
    "移除弱輸入"
  ],
  "With λ = 0.45, LASSO sets the noise coefficient to zero.": [
    "λ = 0.45 时，LASSO 将噪声系数置零。",
    "λ = 0.45 時，LASSO 將雜訊係數設為零。"
  ],
  "Change the noise": [
    "改变噪声",
    "改變雜訊"
  ],
  "Change the noise input from zero to three. The LASSO prediction stays 0.830 because that input is unused.": [
    "将噪声输入从零改为三。LASSO 预测仍为 0.830，因为该输入未被使用。",
    "將雜訊輸入從零改為三。LASSO 預測仍為 0.830，因為該輸入未被使用。"
  ],
  "Exact shrinkage on an orthonormal teaching design; separate from my fitted air-quality models.": [
    "这是正交标准化教学设计上的精确收缩计算，与我拟合的空气质量模型分开。",
    "這是正交標準化教學設計上的精確收縮計算，與我擬合的空氣品質模型分開。"
  ],
  "Keep the interval. Move the cases.": [
    "保持区间，移动样本",
    "保持區間，移動樣本"
  ],
  "Calibrate an interval": [
    "校准区间",
    "校準區間"
  ],
  "A radius of 0.90 contains 36 of these 40 synthetic residuals.": [
    "半径 0.90 包含这 40 个合成残差中的 36 个。",
    "半徑 0.90 包含這 40 個合成殘差中的 36 個。"
  ],
  "Add systematic error": [
    "加入系统误差",
    "加入系統誤差"
  ],
  "The new population shifts by +0.50, while the calibrated interval stays fixed.": [
    "新群体偏移 +0.50，而校准区间保持不变。",
    "新群體偏移 +0.50，而校準區間保持不變。"
  ],
  "Count what falls outside": [
    "统计落在区间外的样本",
    "統計落在區間外的樣本"
  ],
  "At shift +1.00, only 18 of 40 outcomes are covered by the same interval.": [
    "偏移 +1.00 时，同一区间仅覆盖 40 个结果中的 18 个。",
    "偏移 +1.00 時，同一區間僅涵蓋 40 個結果中的 18 個。"
  ],
  "Shift further": [
    "进一步偏移",
    "進一步偏移"
  ],
  "At shift +2.00, none are covered. Calibration does not guarantee coverage after population change.": [
    "偏移 +2.00 时，没有结果被覆盖。群体变化后，校准不能保证覆盖率。",
    "偏移 +2.00 時，沒有結果被涵蓋。群體變化後，校準不能保證涵蓋率。"
  ],
  "A generated residual experiment; my saved coursework coverage results are a separate evaluation.": [
    "这是生成残差的实验；我保存的课程项目覆盖率结果属于另一项评估。",
    "這是生成殘差的實驗；我保存的課程專案涵蓋率結果屬於另一項評估。"
  ],
  "Uncertain claims need a review queue": [
    "不确定的理赔需要审核队列",
    "不確定的理賠需要審核佇列"
  ],
  "Score 200 example claims": [
    "评分 200 个示例理赔",
    "評分 200 個範例理賠"
  ],
  "The model supplies predictions and uncertainty; it has not decided which claims to automate.": [
    "模型提供预测与不确定性；尚未决定哪些理赔可自动处理。",
    "模型提供預測與不確定性；尚未決定哪些理賠可自動處理。"
  ],
  "Apply the OR gate": [
    "应用 OR 门控",
    "套用 OR 閘控"
  ],
  "High entropy OR low calibrated confidence sends 72 claims to review; 128 remain automated.": [
    "高熵或低校准置信度将 72 个理赔送审，128 个保留自动处理。",
    "高熵或低校準信心程度將 72 個理賠送審，128 個保留自動處理。"
  ],
  "Review twenty cases": [
    "审核二十个样本",
    "審核二十個樣本"
  ],
  "Twenty reviews leave 52 pending. Unreviewed claims stay pending; they do not return to automation.": [
    "审核二十个后，52 个仍待处理。未审核的理赔保持待处理，不返回自动处理。",
    "審核二十個後，52 個仍待處理。未審核的理賠保持待處理，不返回自動處理。"
  ],
  "Add ten review slots": [
    "增加十个审核名额",
    "增加十個審核名額"
  ],
  "Thirty completed reviews leave 42 pending. Capacity changes the queue, not the rejection rule.": [
    "完成三十个审核后，42 个仍待处理。容量改变队列，不改变拒绝规则。",
    "完成三十個審核後，42 個仍待處理。容量改變佇列，不改變拒絕規則。"
  ],
  "The same generated 200-claim baseline as the live demo; no real insurance decisions are made.": [
    "这与实时演示使用同一个生成的 200 理赔基准；不作出真实保险决策。",
    "這與即時示範使用同一個生成的 200 理賠基準；不作出真實保險決策。"
  ],
  "Why the pooled answer can reverse": [
    "合并结果为何会反转",
    "合併結果為何會反轉"
  ],
  "Pool both groups": [
    "合并两组",
    "合併兩組"
  ],
  "The pooled comparison says treatment is worse by 32 percentage points.": [
    "合并比较显示，处理组差 32 个百分点。",
    "合併比較顯示，處理組差 32 個百分點。"
  ],
  "Inspect who was treated": [
    "检查谁接受处理",
    "檢查誰接受處理"
  ],
  "85% of treated people are less experienced; only 15% of the controls are. The groups differ before treatment.": [
    "处理组中 85% 经验较少，对照组仅 15%；处理前两组就不同。",
    "處理組中 85% 經驗較少，對照組僅 15%；處理前兩組就不同。"
  ],
  "Compare within groups": [
    "在组内比较",
    "在組內比較"
  ],
  "Within each experience group, the constructed treatment effect is +10 percentage points.": [
    "在各经验组内，预设处理效果均为 +10 个百分点。",
    "在各經驗組內，預設處理效果均為 +10 個百分點。"
  ],
  "Use equal group weights": [
    "使用相等组权重",
    "使用相等組權重"
  ],
  "Equal weighting recovers +10 points. The graph in the full demo states the assumptions required.": [
    "相等权重恢复 +10 个百分点；完整演示的图说明所需假设。",
    "相等權重恢復 +10 個百分點；完整示範的圖說明所需假設。"
  ],
  "A constructed 200-person cohort illustrating confounding, not a measured treatment effect.": [
    "这是用于展示混杂的虚构 200 人样本，不是实测处理效果。",
    "這是用於展示混雜的虛構 200 人樣本，不是實測處理效果。"
  ],
  "Can the cash reach the pilot?": [
    "资金能支持到试点吗？",
    "資金能支持到試點嗎？"
  ],
  "Start with the ask": [
    "从融资额开始",
    "從融資額開始"
  ],
  "The fictional plan raises £1.2 million for an operational pilot.": [
    "虚构计划为运营试点筹集 120 万英镑。",
    "虛構計畫為營運試點籌集 120 萬英鎊。"
  ],
  "Protect the reserve": [
    "保护预留资金",
    "保護預留資金"
  ],
  "A 15% reserve protects £180,000, leaving £1.02 million available.": [
    "15% 的预留保护 180,000 英镑，剩余可用资金为 102 万英镑。",
    "15% 的預留保護 180,000 英鎊，剩餘可用資金為 102 萬英鎊。"
  ],
  "Fund seven months": [
    "支持七个月",
    "支持七個月"
  ],
  "A £120,000 pilot cost and seven £82,000 monthly burns leave £326,000.": [
    "120,000 英镑试点费用，加上七个月每月 82,000 英镑支出，剩余 326,000 英镑。",
    "120,000 英鎊試點費用，加上七個月每月 82,000 英鎊支出，剩餘 326,000 英鎊。"
  ],
  "Stress the burn": [
    "提高支出压力",
    "提高支出壓力"
  ],
  "Increasing monthly burn by 60% leaves −£18,400 at month seven. The protected reserve is not spent.": [
    "月支出增加 60% 后，第七个月剩余 −18,400 英镑。受保护预留未被动用。",
    "月支出增加 60% 後，第七個月剩餘 −18,400 英鎊。受保護預留未被動用。"
  ],
  "Deterministic fictional budget arithmetic; it does not establish market demand or financing prospects.": [
    "这是确定性的虚构预算计算，不证明市场需求或融资前景。",
    "這是確定性的虛構預算計算，不證明市場需求或融資前景。"
  ],
  "Complete the checks before broker review": [
    "完成检查后再由经纪人审核",
    "完成檢查後再由經紀人審核"
  ],
  "Inspect the candidate": [
    "查看候选市场",
    "查看候選市場"
  ],
  "This candidate starts with only trading assessed. Unassessed checks are not zero scores.": [
    "此候选仅已评估交易维度。未评估的检查不等于零分。",
    "此候選僅已評估交易維度。未評估的檢查不等於零分。"
  ],
  "Check lead history": [
    "检查历史主承保",
    "檢查歷史主承保"
  ],
  "Adding example lead history completes a second, independent check.": [
    "添加示例主承保历史后，完成第二项独立检查。",
    "加入範例主承保歷史後，完成第二項獨立檢查。"
  ],
  "Compare policy wording": [
    "比较保单条款",
    "比較保單條款"
  ],
  "The wording check completes three assessments, but authority is still unverified.": [
    "条款检查完成三项评估，但权限仍未验证。",
    "條款檢查完成三項評估，但權限仍未驗證。"
  ],
  "Confirm authority": [
    "确认权限",
    "確認權限"
  ],
  "Verified authority permits broker review. The checks do not automatically choose an insurer.": [
    "验证权限后可交由经纪人审核。这些检查不会自动选择保险公司。",
    "驗證權限後可交由經紀人審核。這些檢查不會自動選擇保險公司。"
  ],
  "Market 06 uses synthetic descriptors 69, 64 and 72; no composite recommendation is calculated.": [
    "市场 06 使用合成描述值 69、64 与 72；不计算综合推荐。",
    "市場 06 使用合成描述值 69、64 與 72；不計算綜合推薦。"
  ],
  "Match the job to work I can describe": [
    "将职位要求对应到可描述的经历",
    "將職位要求對應到可描述的經歷"
  ],
  "Read the requirement": [
    "阅读职位要求",
    "閱讀職位要求"
  ],
  "The example job asks for Python, SQL and cloud experience.": [
    "示例职位要求 Python、SQL 与云平台经验。",
    "範例職位要求 Python、SQL 與雲端平台經驗。"
  ],
  "Find the matching sentence": [
    "找到对应句子",
    "找到對應句子"
  ],
  "The example sentence describes Python and SQL pipelines: two of the three terms match.": [
    "示例句子描述 Python 与 SQL 流水线：三个词中匹配两个。",
    "範例句子描述 Python 與 SQL 管線：三個詞中符合兩個。"
  ],
  "Keep the gap visible": [
    "保持缺口可见",
    "保持缺口可見"
  ],
  "Cloud remains a question. A keyword cannot create experience that was never described.": [
    "云平台经验仍是问题。关键词不能创造未被描述的经历。",
    "雲端平台經驗仍是問題。關鍵詞不能創造未被描述的經歷。"
  ],
  "Prepare a truthful draft": [
    "准备真实的草稿",
    "準備真實的草稿"
  ],
  "Use the matching work in the draft and ask for a real example before adding the missing term.": [
    "在草稿中使用对应经历；补上缺失词之前，应先提供真实示例。",
    "在草稿中使用對應經歷；補上缺失詞之前，應先提供真實範例。"
  ],
  "A literal three-term browser example. My native workflow extracts keywords and prepares LaTeX; this scene makes no model call.": [
    "这是浏览器中的三个词文字匹配示例。我的原工作流提取关键词并准备 LaTeX；此场景不调用模型。",
    "這是瀏覽器中的三個詞文字符合範例。我的原工作流程提取關鍵詞並準備 LaTeX；此場景不呼叫模型。"
  ],
  "A ranking needs a reason": [
    "排名需要理由",
    "排名需要理由"
  ],
  "Start with six examples": [
    "从六个示例开始",
    "從六個範例開始"
  ],
  "The prototype catalog contains six mock courses, not a live course directory.": [
    "原型目录包含六个模拟课程，不是实时课程目录。",
    "原型目錄包含六個模擬課程，不是即時課程目錄。"
  ],
  "Filter by interest and level": [
    "按兴趣与级别筛选",
    "按興趣與程度篩選"
  ],
  "Programming or AI interests at intermediate level leave two eligible examples.": [
    "选择编程或 AI 兴趣、中级难度后，仅剩两个符合条件的示例。",
    "選擇程式設計或 AI 興趣、中級難度後，僅剩兩個符合條件的範例。"
  ],
  "Inspect the prototype order": [
    "检查原型排序",
    "檢查原型排序"
  ],
  "The source frontend assigns random scores after filtering. Order alone does not explain fit.": [
    "原始前端在筛选后赋予随机分数；顺序本身不能解释匹配程度。",
    "原始前端在篩選後賦予隨機分數；順序本身不能解釋符合程度。"
  ],
  "Declare the ranking rule": [
    "声明排名规则",
    "聲明排名規則"
  ],
  "My browser rubric declares its weights: the two example scores are 99.8 and 91.9.": [
    "我的浏览器规则明确权重：两个示例分数为 99.8 与 91.9。",
    "我的瀏覽器規則明確權重：兩個範例分數為 99.8 與 91.9。"
  ],
  "The weighted teaching rubric is a browser addition, separate from the original random-order prototype.": [
    "加权教学规则是浏览器新增内容，与原始随机排序原型分开。",
    "加權教學規則是瀏覽器新增內容，與原始隨機排序原型分開。"
  ],
  "A four-stage visual explanation": [
    "四阶段视觉说明",
    "四階段視覺說明"
  ],
  "Start": [
    "起点",
    "起點"
  ],
  "Goal": [
    "目标",
    "目標"
  ],
  "Cliff": [
    "悬崖",
    "懸崖"
  ],
  "Reward": [
    "奖励",
    "獎勵"
  ],
  "Learning rate": [
    "学习率",
    "學習率"
  ],
  "Action value": [
    "动作价值",
    "動作價值"
  ],
  "Nine-move detour": [
    "九步绕行",
    "九步繞行"
  ],
  "Observed mean": [
    "观测均值",
    "觀測均值"
  ],
  "Exploration bonus": [
    "探索奖励",
    "探索獎勵"
  ],
  "Upper bound": [
    "上界",
    "上界"
  ],
  "Next choice": [
    "下一次选择",
    "下一次選擇"
  ],
  "Chosen option": [
    "本轮选择",
    "本輪選擇"
  ],
  "Shared microscope image": [
    "同一显微图像",
    "同一顯微影像"
  ],
  "Pose response": [
    "姿态响应",
    "姿態反應"
  ],
  "Depth response": [
    "深度响应",
    "深度反應"
  ],
  "Model parameters": [
    "模型参数",
    "模型參數"
  ],
  "Reference image": [
    "参考图像",
    "參考影像"
  ],
  "Retained measurements": [
    "保留测量",
    "保留量測"
  ],
  "Reconstruction": [
    "重建",
    "重建"
  ],
  "Input error": [
    "输入误差",
    "輸入誤差"
  ],
  "Reconstruction error": [
    "重建误差",
    "重建誤差"
  ],
  "Measurement lines": [
    "测量线",
    "量測線"
  ],
  "First saved field": [
    "首个保存流场",
    "首個保存流場"
  ],
  "Current saved field": [
    "当前保存流场",
    "目前保存流場"
  ],
  "Frame {0} / 20": [
    "第 {0} 帧 / 20",
    "第 {0} 影格 / 20"
  ],
  "Benzene input": [
    "苯输入",
    "苯輸入"
  ],
  "CO sensor": [
    "CO 传感器",
    "CO 感測器"
  ],
  "Online": [
    "在线",
    "線上"
  ],
  "Offline": [
    "离线",
    "離線"
  ],
  "Available design": [
    "可用方案",
    "可用方案"
  ],
  "Balanced": [
    "均衡",
    "均衡"
  ],
  "Benzene only": [
    "仅苯输入",
    "僅苯輸入"
  ],
  "No available prediction": [
    "没有可用预测",
    "沒有可用預測"
  ],
  "Planning cost": [
    "规划成本",
    "規劃成本"
  ],
  "Validation RMSE": [
    "验证 RMSE",
    "驗證 RMSE"
  ],
  "Attack share": [
    "攻击比例",
    "攻擊比例"
  ],
  "Threshold": [
    "阈值",
    "閾值"
  ],
  "Caught attacks": [
    "检出的攻击",
    "檢出的攻擊"
  ],
  "Missed attacks": [
    "漏报攻击",
    "漏報攻擊"
  ],
  "False alarms": [
    "误报",
    "誤報"
  ],
  "Correct quiet flows": [
    "正确无告警流量",
    "正確無警示流量"
  ],
  "Alerts to review": [
    "待审告警",
    "待審警示"
  ],
  "Real attacks among alerts": [
    "告警中的真实攻击",
    "警示中的真實攻擊"
  ],
  "Traffic proxy": [
    "交通代理变量",
    "交通代理變數"
  ],
  "Temperature": [
    "温度",
    "溫度"
  ],
  "Humidity": [
    "湿度",
    "濕度"
  ],
  "Noise feature": [
    "噪声输入",
    "雜訊輸入"
  ],
  "Input × coefficient": [
    "输入 × 系数",
    "輸入 × 係數"
  ],
  "Prediction": [
    "预测",
    "預測"
  ],
  "No penalty": [
    "无惩罚",
    "無懲罰"
  ],
  "Covered": [
    "区间内",
    "區間內"
  ],
  "Outside": [
    "区间外",
    "區間外"
  ],
  "Fixed radius": [
    "固定半径",
    "固定半徑"
  ],
  "Population shift": [
    "群体偏移",
    "群體偏移"
  ],
  "{0} of 40 covered": [
    "覆盖 40 个中的 {0} 个",
    "涵蓋 40 個中的 {0} 個"
  ],
  "Residual = observed − predicted": [
    "残差 = 观测 − 预测",
    "殘差 = 觀測 − 預測"
  ],
  "Awaiting routing": [
    "等待分流",
    "等待分流"
  ],
  "Automated": [
    "自动处理",
    "自動處理"
  ],
  "Needs review": [
    "需要审核",
    "需要審核"
  ],
  "Reviewed": [
    "已审核",
    "已審核"
  ],
  "Pending": [
    "待处理",
    "待處理"
  ],
  "High entropy": [
    "高熵",
    "高熵"
  ],
  "Low confidence": [
    "低置信度",
    "低信心程度"
  ],
  "OR": [
    "或",
    "或"
  ],
  "Treated": [
    "处理组",
    "處理組"
  ],
  "Control": [
    "对照组",
    "對照組"
  ],
  "Less experienced": [
    "经验较少",
    "經驗較少"
  ],
  "More experienced": [
    "经验较多",
    "經驗較多"
  ],
  "Success rate": [
    "成功率",
    "成功率"
  ],
  "Pooled difference": [
    "合并差异",
    "合併差異"
  ],
  "Adjusted difference": [
    "调整后差异",
    "調整後差異"
  ],
  "{0} percentage points": [
    "{0} 个百分点",
    "{0} 個百分點"
  ],
  "Cash available": [
    "可用现金",
    "可用現金"
  ],
  "Protected reserve": [
    "受保护预留",
    "受保護預留"
  ],
  "Baseline plan": [
    "基准计划",
    "基準計畫"
  ],
  "Burn +60%": [
    "支出 +60%",
    "支出 +60%"
  ],
  "Month seven": [
    "第七个月",
    "第七個月"
  ],
  "Trading": [
    "交易",
    "交易"
  ],
  "Lead history": [
    "主承保历史",
    "主承保歷史"
  ],
  "Policy wording": [
    "保单条款",
    "保單條款"
  ],
  "Unassessed": [
    "未评估",
    "未評估"
  ],
  "Authority unverified": [
    "权限未验证",
    "權限未驗證"
  ],
  "Authority verified": [
    "权限已验证",
    "權限已驗證"
  ],
  "Review held": [
    "暂缓审核",
    "暫緩審核"
  ],
  "Ready for broker review": [
    "可交由经纪人审核",
    "可交由經紀人審核"
  ],
  "Job requirement": [
    "职位要求",
    "職位要求"
  ],
  "Matching sentence": [
    "对应句子",
    "對應句子"
  ],
  "Built Python and SQL pipelines.": [
    "构建了 Python 与 SQL 流水线。",
    "建構了 Python 與 SQL 管線。"
  ],
  "Cloud experience still needs a real example.": [
    "云平台经验仍需要真实示例。",
    "雲端平台經驗仍需要真實範例。"
  ],
  "Matched terms": [
    "匹配词",
    "符合詞"
  ],
  "Cloud": [
    "云平台",
    "雲端平台"
  ],
  "Mock courses": [
    "模拟课程",
    "模擬課程"
  ],
  "Eligible courses": [
    "符合条件的课程",
    "符合條件的課程"
  ],
  "Random source order": [
    "原始随机排序",
    "原始隨機排序"
  ],
  "Declared weighted score": [
    "声明的加权分数",
    "聲明的加權分數"
  ],
  "Python programming": [
    "Python 编程",
    "Python 程式設計"
  ],
  "Machine learning": [
    "机器学习",
    "機器學習"
  ],
  "Algorithms": [
    "算法",
    "演算法"
  ],
  "Web development": [
    "网页开发",
    "網頁開發"
  ],
  "Marketing": [
    "营销",
    "行銷"
  ],
  "Finance": [
    "金融",
    "金融"
  ],
  "Category 35 · level 25 · time 15 · budget 15 · rating 10": [
    "类别 35 · 级别 25 · 时间 15 · 预算 15 · 评分 10",
    "類別 35 · 程度 25 · 時間 15 · 預算 15 · 評分 10"
  ],
  "Relative model size": [
    "相对模型大小",
    "相對模型大小"
  ],
  "Depth error change": [
    "深度误差变化",
    "深度誤差變化"
  ],
  "Recorded depth target": [
    "记录的深度目标",
    "記錄的深度目標"
  ],
  "Labelled orientation": [
    "标注朝向",
    "標註朝向"
  ],
  "Label / prediction": [
    "标签 / 预测",
    "標籤 / 預測"
  ],
  "Illustrated lines": [
    "示意线",
    "示意線"
  ],
  "Shared error scale": [
    "共同误差尺度",
    "共同誤差尺度"
  ],
  "Image match score": [
    "图像匹配分数",
    "影像符合分數"
  ],
  "Response hidden": [
    "响应暂隐藏",
    "反應暫隱藏"
  ]
} satisfies ProjectCopyTable;
