import type { ProjectCopyTable } from "@/lib/projectCopy";

export const llmPostTrainingLabCopy = {
  "LLM post-training laboratory": [
    "大语言模型后训练实验室",
    "大語言模型後訓練實驗室"
  ],
  "STUDY-RL / Practical lab": [
    "STUDY-RL／实践实验室",
    "STUDY-RL／實踐實驗室"
  ],
  "What did the model actually learn?": [
    "模型到底学会了什么？",
    "模型到底學會了什麼？"
  ],
  "Inspect a real small-model run, then work through the updates behind it.": [
    "查看一次真实的小模型训练记录，再亲手探索背后的更新过程。",
    "查看一次真實的小模型訓練記錄，再親手探索背後的更新過程。"
  ],
  "Post-training experiments": [
    "后训练实验",
    "後訓練實驗"
  ],
  "01 · Inspect answers": [
    "01 · 查看回答",
    "01 · 查看回答"
  ],
  "02 · Train an adapter": [
    "02 · 训练适配器",
    "02 · 訓練適配器"
  ],
  "03 · Change a preference": [
    "03 · 调整偏好",
    "03 · 調整偏好"
  ],
  "Recorded run / 32 held-out prompts": [
    "训练记录／32 个留出提示词",
    "訓練記錄／32 個留出提示詞"
  ],
  "A well-formatted answer can still be wrong.": [
    "格式正确的回答仍可能算错。",
    "格式正確的回答仍可能算錯。"
  ],
  "Start with 0 + 8. Compare the requested format with the expected answer, then inspect the other failures.": [
    "先看 0 + 8。比较要求的格式与预期答案，再查看其他错误。",
    "先看 0 + 8。比較要求的格式與預期答案，再查看其他錯誤。"
  ],
  "Strict format": [
    "严格格式合规",
    "嚴格格式合規"
  ],
  "Starting model → SFT": [
    "初始模型 → SFT",
    "初始模型 → SFT"
  ],
  "Strict exact answer": [
    "严格答案正确率",
    "嚴格答案正確率"
  ],
  "13 SFT answers still wrong": [
    "SFT 后仍有 13 个错误回答",
    "SFT 後仍有 13 個錯誤回答"
  ],
  "Generation cutoffs": [
    "生成被截断",
    "生成被截斷"
  ],
  "12-token generation limit": [
    "最多生成 12 个词元",
    "最多生成 12 個詞元"
  ],
  "Inspect an outcome": [
    "筛选结果",
    "篩選結果"
  ],
  "All 32 prompts": [
    "全部 32 个提示词",
    "全部 32 個提示詞"
  ],
  "13 incorrect SFT answers": [
    "13 个 SFT 错误回答",
    "13 個 SFT 錯誤回答"
  ],
  "19 correct SFT answers": [
    "19 个 SFT 正确回答",
    "19 個 SFT 正確回答"
  ],
  "10 starting-model cutoffs": [
    "10 个初始模型截断回答",
    "10 個初始模型截斷回答"
  ],
  "Recorded prompt": [
    "记录中的提示词",
    "記錄中的提示詞"
  ],
  "Expected:": [
    "预期：",
    "預期："
  ],
  "matching records": [
    "条匹配记录",
    "條匹配記錄"
  ],
  "Starting instruction-tuned model": [
    "初始指令微调模型",
    "初始指令微調模型"
  ],
  "Reloaded SFT adapter": [
    "重新加载的 SFT 适配器",
    "重新加載的 SFT 適配器"
  ],
  "Requested format": [
    "要求的格式",
    "要求的格式"
  ],
  "Pass": [
    "通过",
    "通過"
  ],
  "Fail": [
    "未通过",
    "未通過"
  ],
  "Strict exact match": [
    "严格完全匹配",
    "嚴格完全匹配"
  ],
  "Termination": [
    "生成终止",
    "生成終止"
  ],
  "Stopped": [
    "已停止",
    "已停止"
  ],
  "Token cutoff": [
    "达到词元上限",
    "達到詞元上限"
  ],
  "These are recorded greedy outputs on synthetic addition. The starting model was already instruction-tuned. Strict matching requires correct arithmetic, the requested format and termination together. Use the next two tabs to train a small adapter and explore the preference objective.": [
    "这里展示的是合成加法任务上的贪心生成记录。初始模型已经过指令微调。严格匹配要求算术、格式和终止行为同时正确。使用后两个标签页训练小型适配器，并探索偏好目标。",
    "這裡展示的是合成加法任務上的貪心生成記錄。初始模型已經過指令微調。嚴格匹配要求算術、格式和終止行為同時正確。使用後兩個標籤頁訓練小型適配器，並探索偏好目標。"
  ],
  "Training results": [
    "训练结果",
    "訓練結果"
  ],
  "SmolLM2-135M-Instruct · Apple Silicon/MPS · FP32 · rank-8 LoRA. 2,442,240 trainable parameters out of 136,957,248 including adapters (1.7832%). Addition splits: 192 train / 32 validation / 32 test; reversed operand pairs stay in the same split.": [
    "SmolLM2-135M-Instruct · Apple Silicon/MPS · FP32 · 秩为 8 的 LoRA。含适配器共 136,957,248 个参数，其中 2,442,240 个可训练（1.7832%）。加法数据划分为 192 条训练、32 条验证和 32 条测试；操作数顺序相反的样本保留在同一划分中。",
    "SmolLM2-135M-Instruct · Apple Silicon/MPS · FP32 · 秩為 8 的 LoRA。含適配器共 136,957,248 個參數，其中 2,442,240 個可訓練（1.7832%）。加法資料劃分為 192 條訓練、32 條驗證和 32 條測試；操作數順序相反的樣本保留在同一劃分中。"
  ],
  "Validation objectives before and after training": [
    "训练前后的验证目标",
    "訓練前後的驗證目標"
  ],
  "Run": [
    "训练项",
    "訓練項"
  ],
  "Updates": [
    "更新次数",
    "更新次數"
  ],
  "Before → after": [
    "训练前 → 训练后",
    "訓練前 → 訓練後"
  ],
  "SFT completion-token NLL": [
    "SFT 补全文本词元负对数似然",
    "SFT 補全文本詞元負對數似然"
  ],
  "DPO preference-pair loss": [
    "DPO 偏好对损失",
    "DPO 偏好對損失"
  ],
  "The DPO result measures the preference-pair objective. Generated-answer quality after DPO remains unevaluated.": [
    "DPO 结果衡量的是偏好对目标。DPO 后生成答案的质量尚未评估。",
    "DPO 結果衡量的是偏好對目標。DPO 後生成答案的質量尚未評估。"
  ],
  "Live calculation / lesson 02": [
    "实时计算／第 02 课",
    "實時計算／第 02 課"
  ],
  "Train a small adapter. Keep the base frozen.": [
    "训练小型适配器，冻结基础权重。",
    "訓練小型適配器，凍結基礎權重。"
  ],
  "Predict": [
    "预测",
    "預測"
  ],
  "from input": [
    "，输入为",
    "，輸入為"
  ],
  ". Step once: B learns immediately, while A’s first gradient is zero because B starts at zero.": [
    "。执行一步：B 会立即学习；由于 B 的初值为零，A 的首次梯度为零。",
    "。執行一步：B 會立即學習；由於 B 的初值為零，A 的首次梯度為零。"
  ],
  "Learning rate ·": [
    "学习率 ·",
    "學習率 ·"
  ],
  "Take one gradient step": [
    "执行一步梯度更新",
    "執行一步梯度更新"
  ],
  "Reset adapter": [
    "重置适配器",
    "重置適配器"
  ],
  "Optimizer step": [
    "优化器步数",
    "最佳化器步數"
  ],
  "Prediction": [
    "预测值",
    "預測值"
  ],
  "Adapter prediction": [
    "适配器预测值",
    "適配器預測值"
  ],
  "squared-error loss": [
    "平方误差损失",
    "平方誤差損失"
  ],
  "Parameters now": [
    "当前参数",
    "當前參數"
  ],
  "Frozen base matrix": [
    "冻结的基础矩阵",
    "凍結的基礎矩陣"
  ],
  "Current low-rank adapter factors": [
    "当前低秩适配器因子",
    "當前低秩適配器因子"
  ],
  "LoRA weight update": [
    "LoRA 权重更新",
    "LoRA 權重更新"
  ],
  "Gradients for the next step": [
    "下一步的梯度",
    "下一步的梯度"
  ],
  "Next gradient for A": [
    "A 的下一步梯度",
    "A 的下一步梯度"
  ],
  "Next gradient for B": [
    "B 的下一步梯度",
    "B 的下一步梯度"
  ],
  "Gradient-descent parameter update": [
    "梯度下降参数更新",
    "梯度下降參數更新"
  ],
  "This exact two-dimensional teaching example uses scale 1 and one training pair. At rate 0.10, the first step changes the loss from 1 to 0.81. It explains the update mechanics; it is separate from the measured language-model run.": [
    "这个二维教学算例采用缩放系数 1 和一对训练样本。学习率为 0.10 时，第一步将损失从 1 降至 0.81。它用于解释更新机制，与上面的实测语言模型训练独立。",
    "這個二維教學算例採用縮放係數 1 和一對訓練樣本。學習率為 0.10 時，第一步將損失從 1 降至 0.81。它用於解釋更新機制，與上面的實測語言模型訓練獨立。"
  ],
  "Live calculation / lesson 04": [
    "实时计算／第 04 课",
    "實時計算／第 04 課"
  ],
  "A preference is relative to a frozen reference.": [
    "偏好相对于冻结的参考模型定义。",
    "偏好相對於凍結的參考模型定義。"
  ],
  "Raise the chosen-answer probability, then move the reference above it. The same policy can now be penalised. Match the reference to recover the": [
    "先提高首选回答的概率，再将参考概率调得更高。相同策略此时可能受到惩罚。让策略与参考一致，即可恢复",
    "先提高首選回答的概率，再將參考概率調得更高。相同策略此時可能受到懲罰。讓策略與參考一致，即可恢復"
  ],
  "baseline.": [
    "的基准损失。",
    "的基準損失。"
  ],
  "Policy chosen probability ·": [
    "策略的首选回答概率 ·",
    "策略的首選回答概率 ·"
  ],
  "Reference chosen probability ·": [
    "参考模型的首选回答概率 ·",
    "參考模型的首選回答概率 ·"
  ],
  "Preference strength": [
    "偏好强度",
    "偏好強度"
  ],
  "Match the reference": [
    "与参考一致",
    "與參考一致"
  ],
  "Reset preference": [
    "重置偏好",
    "重置偏好"
  ],
  "Preference probability": [
    "偏好概率",
    "偏好概率"
  ],
  "DPO pair loss": [
    "DPO 偏好对损失",
    "DPO 偏好對損失"
  ],
  "Gradient": [
    "梯度",
    "梯度"
  ],
  "Policy preference margin relative to the reference": [
    "相对于参考模型的策略偏好差值",
    "相對於參考模型的策略偏好差值"
  ],
  "DPO pair loss and gradient": [
    "DPO 偏好对损失及梯度",
    "DPO 偏好對損失及梯度"
  ],
  "Policy and reference agree: the preference probability is 0.5 and the loss is": [
    "策略与参考一致：偏好概率为 0.5，损失为",
    "策略與參考一致：偏好概率為 0.5，損失為"
  ],
  "The policy favours the chosen response more than the reference does; the loss falls below": [
    "策略对首选回答的偏好强于参考模型；损失低于",
    "策略對首選回答的偏好強於參考模型；損失低於"
  ],
  "The reference favours the chosen response more strongly than the policy; the loss rises above": [
    "参考模型对首选回答的偏好强于策略；损失高于",
    "參考模型對首選回答的偏好強於策略；損失高於"
  ],
  "A two-response probability model for inspecting the DPO objective. Real training uses completion log-probabilities over preference pairs. Changing this reference slider chooses a new toy scenario; the reference stays frozen during each actual training run.": [
    "这个双回答概率模型用于查看 DPO 目标。真实训练采用偏好对的补全文本对数概率。调整参考滑块会创建新的教学场景；在实际的每次训练中，参考模型保持冻结。",
    "這個雙回答概率模型用於查看 DPO 目標。真實訓練採用偏好對的補全文本對數概率。調整參考滑塊會創建新的教學場景；在實際的每次訓練中，參考模型保持凍結。"
  ]
} satisfies ProjectCopyTable;
