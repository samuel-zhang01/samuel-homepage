import type { ProjectCopyTable } from "../../../lib/projectCopy";

export const coverageShiftCopy = {
  "Coverage under distribution shift": [
    "分布偏移下的覆盖率",
    "分佈偏移下的覆蓋率"
  ],
  "SYNTHETIC EXPERIMENT / LIVE CALCULATION": [
    "合成实验／实时计算",
    "合成實驗／即時計算"
  ],
  "Keep the interval. Move the population.": [
    "保持区间，移动总体。",
    "保持區間，移動總體。"
  ],
  "Calibrate once, then add a systematic prediction error to a new batch. Count which outcomes still fall inside the interval.": [
    "先校准一次，再为新一批数据加入系统性预测误差。统计哪些结果仍落在区间内。",
    "先校準一次，再為新一批資料加入系統性預測誤差。統計哪些結果仍落在區間內。"
  ],
  "Requested coverage ·": [
    "目标覆盖率 ·",
    "目標覆蓋率 ·"
  ],
  "Population shift · +": [
    "总体偏移 · +",
    "總體偏移 · +"
  ],
  "residual units": [
    "残差单位",
    "殘差單位"
  ],
  "Calibrated radius": [
    "校准半径",
    "校準半徑"
  ],
  "Covered outcomes": [
    "覆盖的结果",
    "覆蓋的結果"
  ],
  "Batch coverage": [
    "批次覆盖率",
    "批次覆蓋率"
  ],
  "Residual equals observed minus predicted": [
    "残差等于观测值减去预测值",
    "殘差等於觀測值減去預測值"
  ],
  "Horizontal range: −1 to +3": [
    "横轴范围：−1 至 +3",
    "橫軸範圍：−1 至 +3"
  ],
  "{0} of 40 synthetic residuals are within the fixed interval. Circles are covered; crosses fall outside.": [
    "40 个合成残差中，有 {0} 个处于固定区间内。圆点表示被覆盖，叉号表示超出区间。",
    "40 個合成殘差中，有 {0} 個處於固定區間內。圓點表示被覆蓋，叉號表示超出區間。"
  ],
  "Baseline batch: inspect the outcomes near the interval edges, then increase the shift.": [
    "基准批次：检查区间边缘附近的结果，再增大偏移。",
    "基準批次：檢查區間邊緣附近的結果，再增大偏移。"
  ],
  "The radius stays fixed at {0} while the population moves. {1} outcomes now fall outside. Exchangeability is the assumption this stress test challenges.": [
    "总体移动时，半径保持为 {0}。现在有 {1} 个结果落在区间之外。这项压力测试考察的是可交换性假设。",
    "總體移動時，半徑保持為 {0}。現在有 {1} 個結果落在區間之外。這項壓力測試考察的是可交換性假設。"
  ],
  "Reset population": [
    "重置总体",
    "重置總體"
  ],
  "Inspect the calculation": [
    "查看计算",
    "檢視計算"
  ],
  "99 calibration absolute residuals run from 0.01 to 0.99. The finite-sample rank is": [
    "99 个校准绝对残差从 0.01 到 0.99。有限样本秩为",
    "99 個校準絕對殘差從 0.01 到 0.99。有限樣本秩為"
  ],
  "The 40 test residuals follow": [
    "40 个测试残差遵循",
    "40 個測試殘差遵循"
  ],
  "A point is covered when": [
    "满足以下条件的点被覆盖",
    "滿足以下條件的點被覆蓋"
  ],
  ", where R is the calibrated radius.": [
    "，其中 R 是校准半径。",
    "，其中 R 是校準半徑。"
  ],
  "This deliberately constructed batch illustrates coverage sensitivity. The fixed coursework results above remain a separate evidence record.": [
    "这批特意构造的数据说明覆盖率对偏移的敏感程度。上方课程研究的固定结果是独立的证据记录。",
    "這批特意構造的資料說明覆蓋率對偏移的敏感程度。上方課程研究的固定結果是獨立的證據記錄。"
  ]
} as const satisfies ProjectCopyTable;
