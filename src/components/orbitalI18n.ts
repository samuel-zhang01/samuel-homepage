import type { Locale } from "@/lib/i18n";

const english = {
  title: "Orbital Lab", strap: "ATOMIC STUDIES · NO. 01", intro: "A little quantum mechanics, drawn one character at a time.",
  element: "Element", previous: "Previous element", next: "Next element", configuration: "Neutral-atom configuration",
  reference: "Reference compilation", illustrative: "Illustrative Aufbau filling", subshell: "Inspect a subshell", component: "Real orbital component",
  density: "PROBABILITY CLOUD", phase: "Phase ink", slice: "Central slice", rotate: "Auto-rotate", pause: "Pause rotation", reset: "Reset view",
  left: "Turn left", right: "Turn right", up: "Tilt up", down: "Tilt down", save: "Save ASCII…", saved: "ASCII study exported.",
  drag: "Drag to turn. Arrow keys also rotate the view.", positive: "+ phase", negative: "− phase", scale: "Hydrogen-like model · Z = 1 · a₀ units",
  radial: "Radial nodes", angular: "Angular nodes", total: "Total nodes", radialTitle: "RADIAL PROBABILITY", radius: "Radius / a₀",
  periodic: "Periodic table", tableHint: "Choose an element; scroll the table sideways on small screens.", lanthanoids: "Lanthanoids", actinoids: "Actinoids",
  model: "What is being modelled?", modelBody: "These are analytic one-electron hydrogen-like orbitals, sampled from |ψ|². Selecting an element shows its neutral configuration, then lets you study occupied subshell shapes at Z = 1. It does not solve that many-electron atom or a molecule.",
  phaseBody: "The two inks show wavefunction sign, not electric charge. For nonzero m, the real components are sine/cosine combinations, not states with a single Lz value. Node counts describe the analytic orbital; projection may hide a node.",
  scaleBody: "Each cloud is fitted to the viewing frame, so sizes across orbitals are not directly comparable. A slice shows points close to the fixed model z = 0 plane; it is not a new orbital.",
  configBody: "Configurations through element 104 follow a NIST reference compilation, including its exceptions. Heavier elements use an explicitly illustrative filling rule, not a claim of their measured or relativistic ground states. Element names retain the English reference labels.",
  sources: "Sources & model notes", sourceNist: "NIST atomic reference data", sourceMath: "Hydrogenic wavefunctions", empty: "No points in this slice.",
  occupancy: "Subshell electrons", capacity: "Capacity", unpaired: "Orbital boxes · Hund filling illustration", boxNote: "The boxes illustrate filling within this subshell; they are not a computed many-electron wavefunction.",
  motion: "Rotation is off initially and pauses when this app or browser tab is hidden.", canvas: "ASCII orbital probability cloud", componentHint: "Choose a real angular basis component; occupancies apply to the whole subshell.",
  projectionBody: "The cloud contains the inner 99.5% of radial probability. Overlapping points use the majority phase for their ink; this projection does not calculate quantum interference. The graph shows P(r) = r²|R(r)|², not local three-dimensional density.",
  viewOrbital: "View orbital", radialAxis: "P(r) = r²|R(r)|²",
  sliceNote: "Thin slab near model z = 0, not an exact plane. Contrast is rescaled for this view.",
} as const;

type Copy = { [K in keyof typeof english]: string };
const simplified: Copy = {
  title: "原子轨道实验室", strap: "原子研究 · 01", intro: "用一个个字符，描绘一点量子力学。",
  element: "元素", previous: "上一个元素", next: "下一个元素", configuration: "中性原子的电子排布",
  reference: "参考资料汇编", illustrative: "示意性构造原理填充", subshell: "查看一个亚层", component: "实原子轨道分量",
  density: "概率云", phase: "相位双色", slice: "中央切片", rotate: "自动旋转", pause: "暂停旋转", reset: "重置视角",
  left: "向左转", right: "向右转", up: "向上倾斜", down: "向下倾斜", save: "保存 ASCII…", saved: "已导出 ASCII 轨道图。",
  drag: "拖动可旋转，也可使用方向键。", positive: "正相位", negative: "负相位", scale: "类氢模型 · Z = 1 · 单位 a₀",
  radial: "径向节点", angular: "角向节点", total: "节点总数", radialTitle: "径向概率", radius: "半径 / a₀",
  periodic: "元素周期表", tableHint: "选择元素；小屏幕上可横向滚动周期表。", lanthanoids: "镧系元素", actinoids: "锕系元素",
  model: "这里模拟的是什么？", modelBody: "这里展示解析的单电子类氢轨道，按 |ψ|² 采样。选中元素后，可查看其中性电子排布，并在 Z = 1 的模型下研究已占据亚层的形状。这并未求解该多电子原子或分子。",
  phaseBody: "两种颜色表示波函数的正负号，而非电荷。m 非零时，实分量是正弦或余弦组合，不是具有单一 Lz 值的态。节点数描述解析轨道；投影可能遮住节点。",
  scaleBody: "每个概率云都会缩放以适合画框，因此不能直接比较不同轨道的大小。切片显示固定模型 z = 0 平面附近的采样点，并非一个新轨道。",
  configBody: "前 104 号元素的排布依据 NIST 参考资料汇编，并保留其中的例外。更重的元素仅采用明确标注的示意性填充规则，不声称是其测得的或相对论基态。元素名称保留英文参考标签。",
  sources: "来源与模型说明", sourceNist: "NIST 原子参考数据", sourceMath: "类氢波函数", empty: "此切片没有采样点。",
  occupancy: "亚层电子数", capacity: "容量", unpaired: "轨道方框 · 洪特规则填充示意", boxNote: "方框仅说明这个亚层的电子填充，不是计算得出的多电子波函数。",
  motion: "初始不自动旋转；此应用或浏览器标签页隐藏时会暂停。", canvas: "ASCII 原子轨道概率云", componentHint: "选择实角向基函数分量；电子数属于整个亚层。",
  projectionBody: "概率云取样范围包含径向概率的内侧 99.5%。采样点重叠时，颜色取多数点的相位；此投影不计算量子干涉。曲线表示 P(r) = r²|R(r)|²，而非局部三维概率密度。",
  viewOrbital: "查看轨道", radialAxis: "P(r) = r²|R(r)|²",
  sliceNote: "模型 z = 0 附近的薄层，并非精确平面。此视图会重新调整对比度。",
};

const traditional: Copy = {
  title: "原子軌域實驗室", strap: "原子研究 · 01", intro: "用一個個字元，描繪一點量子力學。",
  element: "元素", previous: "上一個元素", next: "下一個元素", configuration: "中性原子的電子組態",
  reference: "參考資料彙編", illustrative: "示意性遞建原理填充", subshell: "查看一個副殼層", component: "實原子軌域分量",
  density: "機率雲", phase: "相位雙色", slice: "中央切片", rotate: "自動旋轉", pause: "暫停旋轉", reset: "重設視角",
  left: "向左轉", right: "向右轉", up: "向上傾斜", down: "向下傾斜", save: "儲存 ASCII…", saved: "已匯出 ASCII 軌域圖。",
  drag: "拖曳可旋轉，也可使用方向鍵。", positive: "正相位", negative: "負相位", scale: "類氫模型 · Z = 1 · 單位 a₀",
  radial: "徑向節點", angular: "角向節點", total: "節點總數", radialTitle: "徑向機率", radius: "半徑 / a₀",
  periodic: "元素週期表", tableHint: "選擇元素；小螢幕上可橫向捲動週期表。", lanthanoids: "鑭系元素", actinoids: "錒系元素",
  model: "這裡模擬的是什麼？", modelBody: "這裡呈現解析的單電子類氫軌域，依 |ψ|² 取樣。選取元素後，可查看其中性電子組態，並在 Z = 1 的模型下研究已佔據副殼層的形狀。這並未求解該多電子原子或分子。",
  phaseBody: "兩種顏色代表波函數的正負號，而非電荷。m 非零時，實分量是正弦或餘弦組合，不是具有單一 Lz 值的態。節點數描述解析軌域；投影可能遮住節點。",
  scaleBody: "每個機率雲都會縮放以符合畫框，因此不能直接比較不同軌域的大小。切片顯示固定模型 z = 0 平面附近的取樣點，並非一個新軌域。",
  configBody: "前 104 號元素的組態依據 NIST 參考資料彙編，並保留其中的例外。更重的元素僅採用明確標示的示意性填充規則，不宣稱是其測得的或相對論基態。元素名稱保留英文參考標籤。",
  sources: "來源與模型說明", sourceNist: "NIST 原子參考資料", sourceMath: "類氫波函數", empty: "此切片沒有取樣點。",
  occupancy: "副殼層電子數", capacity: "容量", unpaired: "軌域方框 · 洪德規則填充示意", boxNote: "方框僅說明這個副殼層的電子填充，不是計算所得的多電子波函數。",
  motion: "初始不自動旋轉；此應用程式或瀏覽器分頁隱藏時會暫停。", canvas: "ASCII 原子軌域機率雲", componentHint: "選擇實角向基底分量；電子數屬於整個副殼層。",
  projectionBody: "機率雲取樣範圍包含徑向機率的內側 99.5%。取樣點重疊時，顏色取多數點的相位；此投影不計算量子干涉。曲線表示 P(r) = r²|R(r)|²，而非局部三維機率密度。",
  viewOrbital: "查看軌域", radialAxis: "P(r) = r²|R(r)|²",
  sliceNote: "模型 z = 0 附近的薄層，並非精確平面。此檢視會重新調整對比度。",
};

export const orbitalCopies: Record<Locale, Copy> = { "en-GB": english, "en-US": { ...english, model: "What is being modeled?" }, "zh-CN": simplified, "zh-TW": traditional };
