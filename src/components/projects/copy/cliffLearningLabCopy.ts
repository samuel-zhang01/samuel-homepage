import type { ProjectCopyTable } from "@/lib/projectCopy";

export const cliffLearningLabCopy = {
  "Train a reinforcement-learning agent": [
    "训练强化学习智能体",
    "訓練強化學習智慧代理"
  ],
  "Week 04 / learning in your browser": [
    "第 04 周／在浏览器中学习",
    "第 04 周／在瀏覽器中學習"
  ],
  "Learn the route above the cliff.": [
    "学习悬崖上方的路线。",
    "學習懸崖上方的路線。"
  ],
  "Every move updates a Q table. Train Q-learning or SARSA, inspect a state, then test the learned policy with exploration switched off.": [
    "每次移动都会更新 Q 表。训练 Q-learning 或 SARSA，查看一个状态，再关闭探索来测试学到的策略。",
    "每次移動都會更新 Q 表。訓練 Q-learning 或 SARSA，查看一個狀態，再關閉探索來測試學到的策略。"
  ],
  "Update rule": [
    "更新规则",
    "更新規則"
  ],
  "Q-learning · greedy next value": [
    "Q-learning · 下一状态的最大价值",
    "Q-learning · 下一狀態的最大價值"
  ],
  "SARSA · sampled next action": [
    "SARSA · 下一步抽样动作",
    "SARSA · 下一步抽樣動作"
  ],
  "Exploration": [
    "探索率",
    "探索率"
  ],
  "Learning rate": [
    "学习率",
    "學習率"
  ],
  "Repeatable seed": [
    "可重复的随机种子",
    "可重複的隨機種子"
  ],
  "Changing a training setting starts a fresh run. Try 100 episodes, inspect the return and test the route; compare the same seed with SARSA.": [
    "更改训练设置会开始新一轮实验。先训练 100 个回合，查看回报并测试路线；再用相同种子比较 SARSA。",
    "更改訓練設定會開始新一輪實驗。先訓練 100 個回合，查看回報並測試路線；再用相同種子比較 SARSA。"
  ],
  "Take one learning step": [
    "执行一步学习",
    "執行一步學習"
  ],
  "Train 100 episodes": [
    "训练 100 个回合",
    "訓練 100 個回合"
  ],
  "Reset run": [
    "重置实验",
    "重置實驗"
  ],
  "Completed episodes": [
    "已完成回合",
    "已完成回合"
  ],
  "Learning updates": [
    "学习更新次数",
    "學習更新次數"
  ],
  "Last": [
    "最近",
    "最近"
  ],
  "· mean return": [
    "· 平均回报",
    "· 平均回報"
  ],
  "Goals in that window": [
    "该区间内到达终点的次数",
    "該區間內到達終點的次數"
  ],
  "Inspect the learning state": [
    "查看学习状态",
    "查看學習狀態"
  ],
  "Live agent & Q values": [
    "当前智能体与 Q 值",
    "當前智慧代理與 Q 值"
  ],
  "Test greedy route": [
    "测试贪心路线",
    "測試貪心路線"
  ],
  "CliffWalking states": [
    "CliffWalking 状态",
    "CliffWalking 狀態"
  ],
  "Row {0}, column {1}{2}": [
    "第 {0} 行，第 {1} 列{2}",
    "第 {0} 行，第 {1} 列{2}"
  ],
  "S: start · G: goal · ×: cliff. Dark square: live agent. Shaded route: greedy evaluation. Select a safe cell to inspect its four learned values.": [
    "S：起点 · G：终点 · ×：悬崖。深色方格表示当前智能体，阴影路线表示贪心策略评估。选择安全格，查看四个动作的已学价值。",
    "S：起點 · G：終點 · ×：懸崖。深色方格表示當前智慧代理，陰影路線表示貪心策略評估。選擇安全格，查看四個動作的已學價值。"
  ],
  "Goal reached in {0} moves, return {1}, {2} cliff falls.": [
    "经过 {0} 步到达终点，回报为 {1}，坠崖 {2} 次。",
    "經過 {0} 步到達終點，回報為 {1}，墜崖 {2} 次。"
  ],
  "Evaluation reached the 200-move cap, return {0}, {1} cliff falls. More training or different exploration may improve this policy.": [
    "评估达到 200 步上限，回报为 {0}，坠崖 {1} 次。增加训练或调整探索率可能改善策略。",
    "評估達到 200 步上限，回報為 {0}，墜崖 {1} 次。增加訓練或調整探索率可能改善策略。"
  ],
  "State [": [
    "状态 [",
    "狀態 ["
  ],
  "Up": [
    "上",
    "上"
  ],
  "Down": [
    "下",
    "下"
  ],
  "Latest update": [
    "最近一次更新",
    "最近一次更新"
  ],
  "Latest Q-value update": [
    "最近一次 Q 值更新",
    "最近一次 Q 值更新"
  ],
  "Reward": [
    "奖励",
    "獎勵"
  ],
  "; next state": [
    "；下一状态",
    "；下一狀態"
  ],
  "Goal reached: continuation value is zero.": [
    "已到终点：后续价值为零。",
    "已到終點：後續價值為零。"
  ],
  "Continuation uses the action sampled for the next move.": [
    "后续价值使用为下一步抽样的动作。",
    "後續價值使用為下一步抽樣的動作。"
  ],
  "Continuation uses the largest next-state Q value.": [
    "后续价值使用下一状态中最大的 Q 值。",
    "後續價值使用下一狀態中最大的 Q 值。"
  ],
  "Take one learning step to inspect the reward, bootstrap target and updated value.": [
    "执行一步学习，查看奖励、自举目标和更新后的价值。",
    "執行一步學習，查看獎勵、自舉目標和更新後的價值。"
  ],
  "How training works": [
    "训练如何进行",
    "訓練如何進行"
  ],
  "The 4 × 12 grid follows deterministic Gymnasium CliffWalking dynamics: ordinary moves cost −1; a cliff fall costs −100 and returns to start; reaching the goal ends the episode. Actions clamp at the grid edges.": [
    "这个 4 × 12 网格采用确定性的 Gymnasium CliffWalking 动力学：普通移动的奖励为 −1；坠崖为 −100，并返回起点；到达终点则结束回合。动作不会越出网格边界。",
    "這個 4 × 12 網格採用確定性的 Gymnasium CliffWalking 動力學：普通移動的獎勵為 −1；墜崖為 −100，並返回起點；到達終點則結束回合。動作不會越出網格邊界。"
  ],
  "Both methods start with zero Q values and use": [
    "两种方法的初始 Q 值均为零，并使用",
    "兩種方法的初始 Q 值均為零，並使用"
  ],
  ". This browser uses a seeded random stream, fixed": [
    "。浏览器使用固定种子的随机数流，以及固定的",
    "。瀏覽器使用固定種子的隨機數流，以及固定的"
  ],
  "and": [
    "和",
    "和"
  ],
  ", and a 200-move collection cap. Continuation remains in the target at the cap; only the goal has a zero continuation value. SARSA carries its sampled action into the next move.": [
    "，每回合最多收集 200 步。达到步数上限时，目标仍包含后续价值；只有到达终点后该值才为零。SARSA 会在下一步执行此前抽样的动作。",
    "，每回合最多收集 200 步。達到步數上限時，目標仍包含後續價值；只有到達終點後該值才為零。SARSA 會在下一步執行此前抽樣的動作。"
  ],
  "Fixed exploration makes it easier to compare the two update rules with the same seed. Training returns include exploration; greedy evaluation measures the learned route separately.": [
    "固定探索率便于使用相同种子比较两种更新规则。训练回报包含探索行为；贪心评估则单独衡量已学路线。",
    "固定探索率便於使用相同種子比較兩種更新規則。訓練回報包含探索行為；貪心評估則單獨衡量已學路線。"
  ],
  "Row {0}, column {1}, cliff": [
    "第 {0} 行，第 {1} 列，悬崖",
    "第 {0} 列，第 {1} 欄，懸崖"
  ],
  "Row {0}, column {1}, goal": [
    "第 {0} 行，第 {1} 列，终点",
    "第 {0} 列，第 {1} 欄，終點"
  ],
  "Row {0}, column {1}, greedy action {2}": [
    "第 {0} 行，第 {1} 列，贪心动作 {2}",
    "第 {0} 列，第 {1} 欄，貪心動作 {2}"
  ],
  "Last {0} · mean return": [
    "最近 {0} 个回合 · 平均回报",
    "最近 {0} 個回合 · 平均回報"
  ],
  "Reward {0}; next state {1}.": [
    "奖励 {0}；下一状态 {1}。",
    "獎勵 {0}；下一狀態 {1}。"
  ]
} satisfies ProjectCopyTable;
