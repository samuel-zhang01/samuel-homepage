import type { ProjectCopyTable } from "@/lib/projectCopy";

/** Scientific methods and controls; explicit Mandarin pairs with reviewed Taiwan terminology. */
export const scientificCopy = {
  "Fourier operator": [
    "傅里叶算子",
    "傅里葉算子"
  ],
  "MeshGraphNet": [
    "MeshGraphNet",
    "MeshGraphNet"
  ],
  "U-Net": [
    "U-Net",
    "U-Net"
  ],
  "Baseline": [
    "基线模型",
    "基線模型"
  ],
  "Three-block FNO3d": [
    "三模块 FNO3d",
    "三模組 FNO3d"
  ],
  "The baseline learns updates to velocity and pressure using global Fourier features and a local pointwise path. The reported relative L2 is 0.0163; its evaluation set was also checked during training.": [
    "基线模型结合全局傅里叶特征与局部逐点路径，学习速度和压力的变化。记录的相对 L2 误差为 0.0163；训练过程中也检查了同一评估集。",
    "基線模型結合全局傅里葉特徵與局部逐點路徑，學習速度和壓力的變化。記錄的相對 L2 誤差為 0.0163；訓練過程中也檢查了同一評估集。"
  ],
  "Course model completed": [
    "完成课程模型",
    "完成課程模型"
  ],
  "TRAINED": [
    "已训练",
    "已訓練"
  ],
  "Four-block extension": [
    "四模块扩展",
    "四模組擴展"
  ],
  "Four-block enhanced FNO3d": [
    "四模块增强 FNO3d",
    "四模組增強 FNO3d"
  ],
  "This extension adds a fourth spectral block, layer normalisation and a deeper projection head. Explore how its shape differs from the baseline; no evaluation result is available for this exact configuration.": [
    "这个扩展增加了第四个频谱模块、层归一化和更深的输出投影层。比较它与基线模型的结构差异；这一具体配置没有可用的评估结果。",
    "這個擴展增加了第四個頻譜模組、層正規化和更深的輸出投影層。比較它與基線模型的結構差異；這一具體配置沒有可用的評估結果。"
  ],
  "Architecture variant": [
    "架构变体",
    "架構變體"
  ],
  "Design development": [
    "设计演进",
    "設計演進"
  ],
  "Later experiment": [
    "后续实验",
    "後續實驗"
  ],
  "Five-block residual FNO3d": [
    "五模块残差 FNO3d",
    "五模組殘差 FNO3d"
  ],
  "Wider blocks, more retained modes and residual connections increase the model’s capacity. The recorded relative L2 is 0.002549; the same evaluation set guided model selection, so this is not an independent final test.": [
    "更宽的模块、更多保留的频率模式以及残差连接提升了模型容量。记录的相对 L2 误差为 0.002549；同一评估集参与了模型选择，因此这不是独立的最终测试。",
    "更寬的模組、更多保留的頻率模式以及殘差連接提升了模型容量。記錄的相對 L2 誤差為 0.002549；同一評估集參與了模型選擇，因此這不是獨立的最終測試。"
  ],
  "Custom experiment": [
    "自定义实验",
    "自訂實驗"
  ],
  "Multi-scale design": [
    "多尺度设计",
    "多尺度設計"
  ],
  "Multi-scale gradient FNO3d": [
    "多尺度梯度 FNO3d",
    "多尺度梯度 FNO3d"
  ],
  "Each block combines three Fourier resolutions, adds a 1×1 skip path and applies group normalisation. The aim is to capture flow structure at several scales; a numerical evaluation is not available for this variant.": [
    "每个模块结合三种傅里叶分辨率，加入 1×1 跳跃路径，并进行组归一化，旨在捕捉不同尺度的流动结构。这个变体尚无数值评估结果。",
    "每個模組結合三種傅里葉解析度，加入 1×1 跳躍路徑，並進行組正規化，旨在捕捉不同尺度的流動結構。這個變體尚無數值評估結果。"
  ],
  "Custom design": [
    "自主设计",
    "自主設計"
  ],
  "EXPERIMENTAL": [
    "实验性设计",
    "實驗性設計"
  ],
  "1 · Spatial": [
    "1 · 空间域",
    "1 · 空間域"
  ],
  "Velocity and pressure enter on a regular H × W × T grid. Follow one operator block to see how global flow patterns are processed.": [
    "速度和压力以规则的 H × W × T 网格输入。沿着一个算子模块，观察模型如何处理全局流动模式。",
    "速度和壓力以規則的 H × W × T 網格輸入。沿著一個算子模組，觀察模型如何處理全局流動模式。"
  ],
  "2 · rFFT": [
    "2 · 实数傅里叶变换",
    "2 · 實數傅里葉變換"
  ],
  "The real Fourier transform expresses the field as spatial and temporal frequencies. Symmetry lets the final axis store only N/2 + 1 entries.": [
    "实数傅里叶变换将流场表示为空间和时间频率。利用对称性，最后一维只需保存 N/2 + 1 个值。",
    "實數傅里葉變換將流場表示為空間和時間頻率。利用對稱性，最後一維只需保存 N/2 + 1 個值。"
  ],
  "3 · Modes": [
    "3 · 频率模式",
    "3 · 頻率模式"
  ],
  "Learned weights act on four signed x/y frequency regions and a retained positive z/time slice. Keeping fewer modes controls the detail and computation.": [
    "学习到的权重作用于 x/y 的四个正负频率区域，以及保留的正 z/时间频率切片。减少保留模式，可控制细节程度和计算量。",
    "學習到的權重作用於 x/y 的四個正負頻率區域，以及保留的正 z/時間頻率切片。減少保留模式，可控制細節程度和計算量。"
  ],
  "4 · Inverse": [
    "4 · 逆变换",
    "4 · 逆變換"
  ],
  "The inverse transform returns to the grid. A local pointwise path and output head then combine the features into three flow fields.": [
    "逆变换将特征送回网格，再由局部逐点路径和输出层将特征组合为三个流场。",
    "逆變換將特徵送回網格，再由局部逐點路徑和輸出層將特徵組合為三個流場。"
  ],
  "The untouched stem feature is concatenated after the final 128→64 transposed-convolution output, then reduced from 128 to 64 channels by a 3×3 convolution.": [
    "保留的初始层特征与最后一次 128→64 转置卷积的输出拼接，再通过 3×3 卷积将 128 个通道压缩为 64 个。",
    "保留的初始層特徵與最後一次 128→64 轉置卷積的輸出拼接，再透過 3×3 卷積將 128 個通道壓縮為 64 個。"
  ],
  "The first downsampled feature is concatenated with the 256→128 transposed-convolution output; the following 3×3 convolution maps 256 channels to 128.": [
    "第一次下采样的特征与 256→128 转置卷积输出拼接，随后由 3×3 卷积将 256 个通道映射为 128 个。",
    "第一次下采樣的特徵與 256→128 轉置卷積輸出拼接，隨後由 3×3 卷積將 256 個通道映射為 128 個。"
  ],
  "The second encoder feature crosses the U at 20 × 80; concatenation temporarily forms 512 channels before the decoder convolution restores 256.": [
    "第二个编码器特征在 20 × 80 分辨率处跨越 U 形结构；拼接暂时形成 512 个通道，再由解码器卷积恢复为 256 个。",
    "第二個編碼器特徵在 20 × 80 解析度處跨越 U 形結構；拼接暫時形成 512 個通道，再由解碼器卷積恢復為 256 個。"
  ],
  "The deepest stored skip joins the first 1024→512 transposed-convolution output and is reduced from 1,024 concatenated channels to 512.": [
    "最深层保留的跳跃特征与首次 1024→512 转置卷积输出相连，拼接后的 1,024 个通道再压缩为 512 个。",
    "最深層保留的跳躍特徵與首次 1024→512 轉置卷積輸出相連，拼接後的 1,024 個通道再壓縮為 512 個。"
  ],
  "27 JAN — 02 FEB 2026": [
    "2026年1月27日—2月2日",
    "2026年1月27日—2月2日"
  ],
  "Rasterise flow fields and train an encoder–decoder": [
    "将流场栅格化并训练编码器—解码器",
    "將流場柵格化並訓練編碼器—解碼器"
  ],
  "Mesh fields are interpolated onto a regular grid, then passed through a four-level U-Net. Training and a shifted evaluation explore both the appeal of image-style processing and its limits on unfamiliar flow fields.": [
    "将网格流场插值到规则网格，再送入四层 U-Net。训练和分布变化评估共同展示了图像式处理的优势，以及面对陌生流场时的局限。",
    "將網格流場插值到規則網格，再送入四層 U-Net。訓練和分佈變化評估共同展示了影像式處理的優勢，以及面對陌生流場時的侷限。"
  ],
  "Course model adapted": [
    "改编课程模型",
    "改編課程模型"
  ],
  "16 FEB — 02 MAR 2026": [
    "2026年2月16日—3月2日",
    "2026年2月16日—3月2日"
  ],
  "Native-mesh message passing completed and run": [
    "完成并运行原始网格上的消息传递",
    "完成並執行原始網格上的訊息傳遞"
  ],
  "Node and edge features feed ten residual message-passing blocks. The completed model trains for 100 epochs and predicts later states by feeding each output back as the next input.": [
    "节点和边特征进入十个残差消息传递模块。模型训练 100 轮，并将每次预测作为下一步输入，逐步预测后续状态。",
    "節點和邊特徵進入十個殘差訊息傳遞模組。模型訓練 100 輪，並將每次預測作為下一步輸入，逐步預測後續狀態。"
  ],
  "02 — 04 MAR 2026": [
    "2026年3月2—4日",
    "2026年3月2—4日"
  ],
  "Train the Fourier baseline and extend the design": [
    "训练傅里叶基线并扩展设计",
    "訓練傅里葉基線並擴展設計"
  ],
  "A three-block Fourier model learns global field updates and records relative L2 0.0163. A four-block extension adds more input context and normalisation; its architecture is shown separately from the baseline result.": [
    "三模块傅里叶模型学习全局流场更新，记录的相对 L2 误差为 0.0163。四模块扩展增加输入信息和归一化；其架构与基线结果分别展示。",
    "三模組傅里葉模型學習全局流場更新，記錄的相對 L2 誤差為 0.0163。四模組擴展增加輸入資訊和正規化；其架構與基線結果分別展示。"
  ],
  "06 MAR 2026": [
    "2026年3月6日",
    "2026年3月6日"
  ],
  "Residual, physics, lightweight and multi-scale branches": [
    "残差、物理约束、轻量与多尺度分支",
    "殘差、物理約束、輕量與多尺度分支"
  ],
  "Further designs explore residual connections, physics terms, lighter models and several Fourier resolutions. The larger residual run has a recorded result; the other variants extend the design space.": [
    "后续设计探索残差连接、物理项、轻量模型和多种傅里叶分辨率。较大的残差模型有记录结果；其余变体扩展了可探索的设计范围。",
    "後續設計探索殘差連接、物理項、輕量模型和多種傅里葉解析度。較大的殘差模型有記錄結果；其餘變體擴展了可探索的設計範圍。"
  ],
  "Design exploration": [
    "设计探索",
    "設計探索"
  ],
  "FOURIER": [
    "傅里叶",
    "傅里葉"
  ],
  "GRAPH": [
    "图网络",
    "圖網路"
  ],
  "U-NET": [
    "U-NET",
    "U-NET"
  ],
  "EVALUATION": [
    "评估",
    "評估"
  ],
  "{0} architecture table": [
    "{0} 架构表",
    "{0} 架構表"
  ],
  "Stage": [
    "阶段",
    "階段"
  ],
  "Operation": [
    "操作",
    "操作"
  ],
  "Shape / width": [
    "形状 / 宽度",
    "形狀 / 寬度"
  ],
  "Role": [
    "角色",
    "角色"
  ],
  "Supply the flow state and any additional context": [
    "提供流动状态及额外上下文",
    "提供流動狀態及額外上下文"
  ],
  "Linear projection on the channel axis": [
    "沿通道轴进行线性投影",
    "沿通道軸進行線性投影"
  ],
  "Expand each location into a learned feature space": [
    "将每个位置映射到学习得到的特征空间",
    "將每個位置映射到學習得到的特徵空間"
  ],
  "Mix global flow patterns with local information": [
    "将全局流动模式与局部信息结合",
    "將全局流動模式與局部資訊結合"
  ],
  "Per-location linear head": [
    "逐位置线性输出层",
    "逐位置線性輸出層"
  ],
  "Turn hidden features back into velocity and pressure": [
    "将隐藏特征转换回速度和压力",
    "將隱藏特徵轉換回速度和壓力"
  ],
  "FNO spatial and spectral operation diagram": [
    "FNO 空间域与频谱操作示意图",
    "FNO 空間域與頻譜操作示意圖"
  ],
  "The index cells show retained Fourier regions only and do not encode learned coefficient values.": [
    "网格仅表示保留的傅里叶区域，不表示学习到的系数值。",
    "網格僅表示保留的傅里葉區域，不表示學習到的係數值。"
  ],
  "H × W × T · real field": [
    "H × W × T · 实数流场",
    "H × W × T · 實數流場"
  ],
  "rFFT": [
    "rFFT",
    "rFFT"
  ],
  "index map · four signed x/y corners · low z slice": [
    "索引图 · x/y 四个正负角区 · 低 z 频率切片",
    "索引圖 · x/y 四個正負角區 · 低 z 頻率切片"
  ],
  "Colour highlights the retained frequency regions. Use the flow-playback tab to inspect predicted fields.": [
    "颜色突出显示保留的频率区域。实际预测流场可在流动播放页中查看。",
    "顏色突出顯示保留的頻率區域。實際預測流場可在流動播放頁中查看。"
  ],
  "Model family 01": [
    "模型系列 01",
    "模型系列 01"
  ],
  "Fourier Neural Operator · learning global flow patterns": [
    "傅里叶神经算子 · 学习全局流动模式",
    "傅里葉神經算子 · 學習全局流動模式"
  ],
  "Choose an FNO design": [
    "选择 FNO 设计",
    "選擇 FNO 設計"
  ],
  "Representation": [
    "表示方式",
    "表示方式"
  ],
  "Design choice": [
    "设计选择",
    "設計選擇"
  ],
  "Recorded result": [
    "记录结果",
    "記錄結果"
  ],
  "{0} architecture pipeline": [
    "{0} 架构流程",
    "{0} 架構流程"
  ],
  "01 · INPUT": [
    "01 · 输入",
    "01 · 輸入"
  ],
  "channel-last field tensor": [
    "通道位于末维的场张量",
    "通道位於末維的場張量"
  ],
  "02 · LIFT": [
    "02 · 升维",
    "02 · 升維"
  ],
  "Linear → width": [
    "线性层 → 特征宽度",
    "線性層 → 特徵寬度"
  ],
  "per grid location": [
    "每个网格位置",
    "每個網格位置"
  ],
  "03 · OPERATOR": [
    "03 · 算子",
    "03 · 算子"
  ],
  "modes": [
    "频率模式",
    "頻率模式"
  ],
  "04 · HEAD": [
    "04 · 输出层",
    "04 · 輸出層"
  ],
  "three output fields": [
    "三个输出流场",
    "三個輸出流場"
  ],
  "Domain walkthrough": [
    "变换过程",
    "變換過程"
  ],
  "Inspect one operation at a time": [
    "逐步查看每项操作",
    "逐步查看每項操作"
  ],
  "Pause operator animation": [
    "暂停算子动画",
    "暫停算子動畫"
  ],
  "Play operator animation": [
    "播放算子动画",
    "播放算子動畫"
  ],
  "Spatial field → Fourier transform → learned mode weights → inverse transform. A schematic walkthrough; playback starts on request.": [
    "空间流场 → 傅里叶变换 → 学习的模式权重 → 逆变换。这是结构示意动画，点击播放后开始。",
    "空間流場 → 傅里葉變換 → 學習的模式權重 → 逆變換。這是結構示意動畫，點擊播放後開始。"
  ],
  "Select Fourier operation phase": [
    "选择傅里叶操作阶段",
    "選擇傅里葉操作階段"
  ],
  "Fourier corner": [
    "傅里叶角区",
    "傅里葉角區"
  ],
  "Select learned Fourier weight corner": [
    "选择傅里叶权重角区",
    "選擇傅里葉權重角區"
  ],
  "Selected:": [
    "已选择：",
    "已選擇："
  ],
  ". For": [
    "。对于",
    "。對於"
  ],
  ", the same signed-corner rule is applied at every spectral block": [
    "，每个频谱模块都遵循相同的正负角区规则",
    "，每個頻譜模組都遵循相同的正負角區規則"
  ],
  "and at each of the three scales": [
    "，三个尺度也分别遵循该规则",
    "，三個尺度也分別遵循該規則"
  ],
  "{0} · architecture": [
    "{0} · 架构",
    "{0} · 架構"
  ],
  "How to read this design": [
    "如何理解这个设计",
    "如何理解這個設計"
  ],
  "Parameters": [
    "参数",
    "參數"
  ],
  "Evaluation": [
    "评估",
    "評估"
  ],
  "Results use different evaluation conditions": [
    "结果采用不同的评估条件",
    "結果採用不同的評估條件"
  ],
  "[u, v, p] + wall/inlet/outlet/object masks": [
    "[u, v, p] + 壁面/入口/出口/障碍物掩膜",
    "[u, v, p] + 壁面/入口/出口/障礙物掩膜"
  ],
  "Describe the current flow and boundary type at each node": [
    "描述每个节点当前的流动及边界类型",
    "描述每個節點當前的流動及邊界類型"
  ],
  "2D positional difference + L2 norm": [
    "二维位置差 + L2 范数",
    "二維位置差 + L2 範數"
  ],
  "Describe the direction and distance to a neighbour": [
    "描述相邻节点的方向与距离",
    "描述相鄰節點的方向與距離"
  ],
  "Linear → ReLU → Linear → LayerNorm": [
    "Linear → ReLU → Linear → LayerNorm",
    "Linear → ReLU → Linear → LayerNorm"
  ],
  "Embed node and edge inputs in a shared feature width": [
    "将节点与边输入映射到相同的特征宽度",
    "將節點與邊輸入映射到相同的特徵寬度"
  ],
  "Edge MLP([source,target,edge]) + edge; scatter-add; Node MLP([node,sum]) + node": [
    "边 MLP([起点,终点,边]) + 原边特征；散射求和；节点 MLP([节点,求和结果]) + 原节点特征",
    "邊 MLP([起點,終點,邊]) + 原邊特徵；散射求和；節點 MLP([節點,求和結果]) + 原節點特徵"
  ],
  "Exchange local information while retaining the previous features": [
    "交换局部信息，同时保留上一阶段特征",
    "交換局部資訊，同時保留上一階段特徵"
  ],
  "Ten independently instantiated residual message-passing blocks": [
    "十个独立实例化的残差消息传递模块",
    "十個獨立實例化的殘差訊息傳遞模組"
  ],
  "Let information travel farther across the mesh": [
    "让信息传播到更远的网格位置",
    "讓資訊傳播到更遠的網格位置"
  ],
  "Linear → ReLU → Linear; decoded delta + input field": [
    "Linear → ReLU → Linear；解码变化量 + 输入流场",
    "Linear → ReLU → Linear；解碼變化量 + 輸入流場"
  ],
  "Predict a change in velocity and pressure": [
    "预测速度和压力的变化",
    "預測速度和壓力的變化"
  ],
  "MeshGraphNet message passing schematic at processor": [
    "MeshGraphNet 消息传递示意图，处理模块",
    "MeshGraphNet 訊息傳遞示意圖，處理模組"
  ],
  "An illustrative mesh explains how residual edge and node updates pass information between neighbours.": [
    "用示意网格说明：边和节点的残差更新如何在相邻节点间传递信息。",
    "用示意網格說明：邊和節點的殘差更新如何在相鄰節點間傳遞資訊。"
  ],
  "Edge update · processor": [
    "边更新 · 处理模块",
    "邊更新 · 處理模組"
  ],
  "30 → 10 → 10 · residual": [
    "30 → 10 → 10 · 残差",
    "30 → 10 → 10 · 殘差"
  ],
  "Node update · scatter add": [
    "节点更新 · 散射求和",
    "節點更新 · 散射求和"
  ],
  "20 → 10 → 10 · residual": [
    "20 → 10 → 10 · 残差",
    "20 → 10 → 10 · 殘差"
  ],
  "Illustrative mesh · neighbouring node updates": [
    "示意网格 · 相邻节点更新",
    "示意網格 · 相鄰節點更新"
  ],
  "Each width-10 processor passes information between neighbouring nodes. Stepping through the ten blocks shows how the network builds a wider spatial context; the drawing illustrates the process.": [
    "每个宽度为 10 的处理模块在相邻节点之间传递信息。逐步查看十个模块，理解网络如何扩大空间上下文；图形用于解释这一过程。",
    "每個寬度為 10 的處理模組在相鄰節點之間傳遞資訊。逐步查看十個模組，理解網路如何擴大空間上下文；圖形用於解釋這一過程。"
  ],
  "Model family 02": [
    "模型系列 02",
    "模型系列 02"
  ],
  "MeshGraphNet · learning from neighbouring mesh points": [
    "MeshGraphNet · 从相邻网格节点学习",
    "MeshGraphNet · 從相鄰網格節點學習"
  ],
  "NODE INPUT": [
    "节点输入",
    "節點輸入"
  ],
  "3 fields + 4 masks": [
    "3 个流场 + 4 个掩膜",
    "3 個流場 + 4 個掩膜"
  ],
  "EDGE INPUT": [
    "边输入",
    "邊輸入"
  ],
  "PROCESSORS": [
    "处理模块",
    "處理模組"
  ],
  "residual edge + node updates": [
    "边与节点的残差更新",
    "邊與節點的殘差更新"
  ],
  "PARAMETERS": [
    "参数",
    "參數"
  ],
  "trainable values": [
    "可训练数值",
    "可訓練數值"
  ],
  "EXAMPLE MESH": [
    "示例网格",
    "示例網格"
  ],
  "2,051 nodes": [
    "2,051 个节点",
    "2,051 個節點"
  ],
  "11,858 directed edge entries": [
    "11,858 条有向边记录",
    "11,858 條有向邊記錄"
  ],
  "Processor depth": [
    "处理深度",
    "處理深度"
  ],
  "Inspecting block": [
    "当前模块",
    "當前模組"
  ],
  "of 10": [
    "，共 10 个",
    "，共 10 個"
  ],
  "Previous processor block": [
    "上一个处理模块",
    "上一個處理模組"
  ],
  "Processor block": [
    "处理模块",
    "處理模組"
  ],
  "Next processor block": [
    "下一个处理模块",
    "下一個處理模組"
  ],
  "Ten processor blocks": [
    "十个处理模块",
    "十個處理模組"
  ],
  "EDGE + NODE": [
    "边 + 节点",
    "邊 + 節點"
  ],
  "MeshGraphNet · processor {0} selected": [
    "MeshGraphNet · 已选处理模块 {0}",
    "MeshGraphNet · 已選處理模組 {0}"
  ],
  "Edge residual": [
    "边残差",
    "邊殘差"
  ],
  "Edge messages concatenate source, target and current edge embeddings before the residual update.": [
    "边消息先拼接起点、终点及当前边的嵌入，再进行残差更新。",
    "邊訊息先拼接起點、終點及當前邊的嵌入，再進行殘差更新。"
  ],
  "Node residual": [
    "节点残差",
    "節點殘差"
  ],
  "Directed messages are summed at nodes; the decoded three-field delta is finally added to the input field.": [
    "有向消息在节点处求和；最终将解码得到的三个流场变化量加到输入流场上。",
    "有向訊息在節點處求和；最終將解碼得到的三個流場變化量加到輸入流場上。"
  ],
  "relative L2 0.0165": [
    "相对 L2 误差 0.0165",
    "相對 L2 誤差 0.0165"
  ],
  "The 500-file evaluation records relative L2 0.0165. That set was also checked during training; the U-Net result uses a different evaluation distribution.": [
    "500 文件评估记录的相对 L2 误差为 0.0165；训练时也检查了这个评估集。U-Net 的结果来自另一种评估分布。",
    "500 文件評估記錄的相對 L2 誤差為 0.0165；訓練時也檢查了這個評估集。U-Net 的結果來自另一種評估分佈。"
  ],
  "Conv2d 3→64, 3×3, stride 1, padding 1 → BatchNorm → LeakyReLU(0.2)": [
    "Conv2d 3→64，3×3，步长 1，填充 1 → BatchNorm → LeakyReLU(0.2)",
    "Conv2d 3→64，3×3，步長 1，填充 1 → BatchNorm → LeakyReLU(0.2)"
  ],
  "Extract local flow features without changing grid resolution": [
    "提取局部流动特征，同时保持网格分辨率",
    "提取局部流動特徵，同時保持網格解析度"
  ],
  "4×4 stride-2 Conv 64→128 → 3×3 Conv 128→128": [
    "4×4 步长 2 卷积 64→128 → 3×3 卷积 128→128",
    "4×4 步長 2 卷積 64→128 → 3×3 卷積 128→128"
  ],
  "Selected skip: preserve detail for Decoder 3": [
    "已选跳跃连接：为解码器 3 保留细节",
    "已選跳躍連接：為解碼器 3 保留細節"
  ],
  "Reduce resolution and preserve features for Decoder 3": [
    "降低分辨率，并为解码器 3 保留特征",
    "降低解析度，併為解碼器 3 保留特徵"
  ],
  "4×4 stride-2 Conv 128→256 → 3×3 Conv 256→256": [
    "4×4 步长 2 卷积 128→256 → 3×3 卷积 256→256",
    "4×4 步長 2 卷積 128→256 → 3×3 卷積 256→256"
  ],
  "Selected skip: preserve detail for Decoder 2": [
    "已选跳跃连接：为解码器 2 保留细节",
    "已選跳躍連接：為解碼器 2 保留細節"
  ],
  "Reduce resolution and preserve features for Decoder 2": [
    "降低分辨率，并为解码器 2 保留特征",
    "降低解析度，併為解碼器 2 保留特徵"
  ],
  "4×4 stride-2 Conv 256→512 → 3×3 Conv 512→512": [
    "4×4 步长 2 卷积 256→512 → 3×3 卷积 512→512",
    "4×4 步長 2 卷積 256→512 → 3×3 卷積 512→512"
  ],
  "Selected skip: preserve detail for Decoder 1": [
    "已选跳跃连接：为解码器 1 保留细节",
    "已選跳躍連接：為解碼器 1 保留細節"
  ],
  "Reduce resolution and preserve features for Decoder 1": [
    "降低分辨率，并为解码器 1 保留特征",
    "降低解析度，併為解碼器 1 保留特徵"
  ],
  "4×4 stride-2 Conv 512→1024 → 3×3 Conv 1024→1024": [
    "4×4 步长 2 卷积 512→1024 → 3×3 卷积 1024→1024",
    "4×4 步長 2 卷積 512→1024 → 3×3 卷積 1024→1024"
  ],
  "Build a compact representation of the full flow field": [
    "建立整个流场的紧凑表示",
    "建立整個流場的緊湊表示"
  ],
  "3×3 Conv 1024→1024 → BatchNorm → LeakyReLU(0.2)": [
    "3×3 卷积 1024→1024 → BatchNorm → LeakyReLU(0.2)",
    "3×3 卷積 1024→1024 → BatchNorm → LeakyReLU(0.2)"
  ],
  "Combine features at the coarsest spatial scale": [
    "在最粗的空间尺度上组合特征",
    "在最粗的空間尺度上組合特徵"
  ],
  "TransposeConv 1024→512 + concat skip → 3×3 Conv 1024→512": [
    "转置卷积 1024→512 + 拼接跳跃特征 → 3×3 卷积 1024→512",
    "轉置卷積 1024→512 + 拼接跳躍特徵 → 3×3 卷積 1024→512"
  ],
  "Selected bridge: merge Encoder 3 detail": [
    "已选桥接：融合编码器 3 的细节",
    "已選橋接：融合編碼器 3 的細節"
  ],
  "Upsample and merge Encoder 3 detail": [
    "上采样并融合编码器 3 的细节",
    "上採樣並融合編碼器 3 的細節"
  ],
  "TransposeConv 512→256 + concat skip → 3×3 Conv 512→256": [
    "转置卷积 512→256 + 拼接跳跃特征 → 3×3 卷积 512→256",
    "轉置卷積 512→256 + 拼接跳躍特徵 → 3×3 卷積 512→256"
  ],
  "Selected bridge: merge Encoder 2 detail": [
    "已选桥接：融合编码器 2 的细节",
    "已選橋接：融合編碼器 2 的細節"
  ],
  "Upsample and merge Encoder 2 detail": [
    "上采样并融合编码器 2 的细节",
    "上採樣並融合編碼器 2 的細節"
  ],
  "TransposeConv 256→128 + concat skip → 3×3 Conv 256→128": [
    "转置卷积 256→128 + 拼接跳跃特征 → 3×3 卷积 256→128",
    "轉置卷積 256→128 + 拼接跳躍特徵 → 3×3 卷積 256→128"
  ],
  "Selected bridge: merge Encoder 1 detail": [
    "已选桥接：融合编码器 1 的细节",
    "已選橋接：融合編碼器 1 的細節"
  ],
  "Upsample and merge Encoder 1 detail": [
    "上采样并融合编码器 1 的细节",
    "上採樣並融合編碼器 1 的細節"
  ],
  "TransposeConv 128→64 + concat stem → 3×3 Conv 128→64": [
    "转置卷积 128→64 + 拼接初始特征 → 3×3 卷积 128→64",
    "轉置卷積 128→64 + 拼接初始特徵 → 3×3 卷積 128→64"
  ],
  "Selected bridge: restore full-resolution stem detail": [
    "已选桥接：恢复全分辨率初始细节",
    "已選橋接：恢復全解析度初始細節"
  ],
  "Upsample and merge full-resolution stem detail": [
    "上采样并融合全分辨率初始细节",
    "上採樣並融合全解析度初始細節"
  ],
  "1×1 Conv2d 64→3": [
    "1×1 卷积 Conv2d 64→3",
    "1×1 卷積 Conv2d 64→3"
  ],
  "Return horizontal velocity, vertical velocity and pressure": [
    "输出水平速度、垂直速度和压力",
    "輸出水平速度、垂直速度和壓力"
  ],
  "Model family 03": [
    "模型系列 03",
    "模型系列 03"
  ],
  "U-Net · combining local detail and wider context": [
    "U-Net · 结合局部细节与广泛上下文",
    "U-Net · 結合局部細節與廣泛上下文"
  ],
  "INPUT GRID": [
    "输入网格",
    "輸入網格"
  ],
  "u · v · pressure": [
    "u · v · 压力",
    "u · v · 壓力"
  ],
  "DEPTH": [
    "深度",
    "深度"
  ],
  "4 + bottleneck": [
    "4 层 + 瓶颈",
    "4 層 + 瓶頸"
  ],
  "64 → 1,024 channels": [
    "64 → 1,024 个通道",
    "64 → 1,024 個通道"
  ],
  "SKIPS": [
    "跳跃连接",
    "跳躍連接"
  ],
  "4 concatenations": [
    "4 次拼接",
    "4 次拼接"
  ],
  "click a bridge below": [
    "点击下方的桥接",
    "點擊下方的橋接"
  ],
  "shifted split": [
    "分布变化评估集",
    "分佈變化評估集"
  ],
  "relative error 1.2823": [
    "相对误差 1.2823",
    "相對誤差 1.2823"
  ],
  "INPUT": [
    "输入",
    "輸入"
  ],
  "regular grid generated from mesh fields": [
    "由网格流场生成的规则栅格",
    "由網格流場生成的規則柵格"
  ],
  "3×3 stem": [
    "3×3 初始层",
    "3×3 初始層"
  ],
  "4×4 ↓2 then 3×3": [
    "4×4 下采样 2 倍，再进行 3×3 卷积",
    "4×4 下采樣 2 倍，再進行 3×3 卷積"
  ],
  "Highlight skip {0}: {1} to {2}": [
    "突出显示跳跃连接 {0}：{1} 至 {2}",
    "突出顯示跳躍連接 {0}：{1} 至 {2}"
  ],
  "SKIP": [
    "跳跃连接",
    "跳躍連接"
  ],
  "transpose 4×4 ↑2 · concat · 3×3": [
    "4×4 转置卷积上采样 2 倍 · 拼接 · 3×3 卷积",
    "4×4 轉置卷積上採樣 2 倍 · 拼接 · 3×3 卷積"
  ],
  "Encoder 4 → bottleneck → decoder 1": [
    "编码器 4 → 瓶颈 → 解码器 1",
    "編碼器 4 → 瓶頸 → 解碼器 1"
  ],
  "3×3 convolution at maximum channel depth": [
    "在最大通道深度处进行 3×3 卷积",
    "在最大通道深度處進行 3×3 卷積"
  ],
  "OUTPUT": [
    "输出",
    "輸出"
  ],
  "final 1×1 convolution": [
    "最终 1×1 卷积",
    "最終 1×1 卷積"
  ],
  "Selected bridge · skip": [
    "已选桥接 · 跳跃连接",
    "已選橋接 · 跳躍連接"
  ],
  "U-Net · skip {0} selected": [
    "U-Net · 已选跳跃连接 {0}",
    "U-Net · 已選跳躍連接 {0}"
  ],
  "What the shifted evaluation showed": [
    "分布变化评估说明了什么",
    "分佈變化評估說明了什麼"
  ],
  "Despite low validation losses during training, the U-Net recorded relative error 1.2823 on a different set of processed flow fields. Their consecutive-step values differed from the training distribution. This illustrates why a surrogate must be tested on the conditions where it will be used; these results cannot directly rank it against the FNO or graph model.": [
    "尽管训练时的验证损失较低，U-Net 在另一组处理后的流场上记录的相对误差仍为 1.2823。这些流场相邻时间步的数值与训练分布不同，说明替代模型需要在实际使用条件下测试；这些结果不能直接用于与 FNO 或图模型排名比较。",
    "儘管訓練時的驗證損失較低，U-Net 在另一組處理後的流場上記錄的相對誤差仍為 1.2823。這些流場相鄰時間步的數值與訓練分佈不同，說明替代模型需要在實際使用條件下測試；這些結果不能直接用於與 FNO 或圖模型排名比較。"
  ],
  "Project development": [
    "项目开发",
    "專案開發"
  ],
  "From grid prediction to spectral experiments": [
    "从网格预测到频谱实验",
    "從網格預測到頻譜實驗"
  ],
  "Select experiment history event": [
    "选择实验发展事件",
    "選擇實驗發展事件"
  ],
  "CFD Architecture Atlas": [
    "CFD 架构图谱",
    "CFD 架構圖譜"
  ],
  "Learning to predict fluid motion": [
    "学习预测流体运动",
    "學習預測流體運動"
  ],
  "Interactive architectures": [
    "交互式架构",
    "交互式架構"
  ],
  "Detailed fluid simulations are expensive. Explore three neural models that learn to predict velocity and pressure from previous flow fields.": [
    "精细流体模拟需要大量计算。探索三种神经模型，了解它们如何从之前的流场学习预测速度和压力。",
    "精細流體模擬需要大量計算。探索三種神經模型，瞭解它們如何從之前的流場學習預測速度和壓力。"
  ],
  "Animate the Fourier operator, step through mesh messages, or select a U-Net skip connection to see how each design carries information.": [
    "播放傅里叶算子动画、逐步查看网格消息，或选择 U-Net 跳跃连接，观察各设计如何传递信息。",
    "播放傅里葉算子動畫、逐步查看網格訊息，或選擇 U-Net 跳躍連接，觀察各設計如何傳遞資訊。"
  ],
  "Fourier modes capture broad patterns, graph messages follow the mesh, and U-Net skips preserve local detail. The diagrams explain the trained designs; flow playback is in the next tab.": [
    "傅里叶模式捕捉大范围规律，图消息沿网格传播，U-Net 跳跃连接保留局部细节。这里的图形解释训练模型的结构，下一页可播放流场。",
    "傅里葉模式捕捉大範圍規律，圖訊息沿網格傳播，U-Net 跳躍連接保留局部細節。這裡的圖形解釋訓練模型的結構，下一頁可播放流場。"
  ],
  "Interactive diagrams + recorded experiments": [
    "交互图解与记录实验",
    "交互圖解與記錄實驗"
  ],
  "The engineering question": [
    "工程问题",
    "工程問題"
  ],
  "How should a model represent a flow field? This work completed and adapted three course models, built the field-processing and training pipelines, and explored residual and multi-scale Fourier designs. Compare the paths below to see the trade-offs.": [
    "模型应如何表示流场？这项工作完成并改编了三个课程模型，构建流场处理与训练流程，并探索残差和多尺度傅里叶设计。比较下方的信息路径，理解各自的取舍。",
    "模型應如何表示流場？這項工作完成並改編了三個課程模型，構建流場處理與訓練流程，並探索殘差和多尺度傅里葉設計。比較下方的資訊路徑，理解各自的取捨。"
  ],
  "Learned flow models": [
    "学习型流场模型",
    "學習型流場模型"
  ],
  "Select CFD model family": [
    "选择 CFD 模型系列",
    "選擇 CFD 模型系列"
  ],
  "Architecture view mode": [
    "架构查看模式",
    "架構查看模式"
  ],
  "VIEW": [
    "视图",
    "視圖"
  ],
  "Interactive diagram": [
    "交互示意图",
    "交互示意圖"
  ],
  "Architecture table": [
    "架构表",
    "架構表"
  ],
  "What each design makes easier": [
    "各设计擅长处理什么",
    "各設計擅長處理什麼"
  ],
  "How the models work": [
    "模型如何工作",
    "模型如何工作"
  ],
  "Three ways to learn the evolution of a flow field": [
    "学习流场演化的三种方式",
    "學習流場演化的三種方式"
  ],
  "Vertical velocity & motion": [
    "垂直速度与运动",
    "垂直速度與運動"
  ],
  "Saved flow sequences + FNO and U-Net figures": [
    "保存的流动序列及 FNO、U-Net 图像",
    "保存的流動序列及 FNO、U-Net 影像"
  ],
  "Recorded results": [
    "记录结果",
    "記錄結果"
  ],
  "Compare each run with its own evaluation conditions": [
    "结合各自的评估条件比较实验",
    "結合各自的評估條件比較實驗"
  ],
  "Rollout experiment": [
    "递推预测实验",
    "遞推預測實驗"
  ],
  "Explore how autoregressive prediction compounds error": [
    "探索自回归预测如何累积误差",
    "探索自迴歸預測如何累積誤差"
  ],
  "Neural CFD project view": [
    "神经 CFD 项目视图",
    "神經 CFD 專案視圖"
  ],
  "Explore": [
    "探索",
    "探索"
  ],
  "From microscope images to orientation and depth": [
    "从显微图像估计方向和深度",
    "從顯微影像估計方向和深度"
  ],
  "Microscopy & Grad-CAM": [
    "显微图像与 Grad-CAM",
    "顯微影像與 Grad-CAM"
  ],
  "Inspect the image regions used for pose and depth": [
    "查看姿态与深度预测使用的图像区域",
    "查看姿態與深度預測使用的影像區域"
  ],
  "Visual benchmark": [
    "可视化基准",
    "視覺化基準"
  ],
  "Compare recorded pose and depth estimates": [
    "比较记录的姿态与深度估计",
    "比較記錄的姿態與深度估計"
  ],
  "Sequence split experiment": [
    "序列划分实验",
    "序列劃分實驗"
  ],
  "Compare frame-level and sequence-level evaluation": [
    "比较按帧和按序列进行评估",
    "比較按影格和按序列進行評估"
  ],
  "Microrobot project view": [
    "微型机器人项目视图",
    "微型機器人專案檢視"
  ],
  "Pose head": [
    "姿态输出头",
    "姿態輸出頭"
  ],
  "Linear({0}, 40) · logits": [
    "Linear({0}, 40) · 类别分数",
    "Linear({0}, 40) · 類別分數"
  ],
  "Choose among 40 combinations of pitch and roll to estimate the robot’s orientation.": [
    "从 40 种俯仰与横滚组合中选择，估计机器人的方向。",
    "從 40 種俯仰與滾轉組合中選擇，估計機器人的方向。"
  ],
  "Depth head": [
    "深度输出头",
    "深度輸出頭"
  ],
  "Linear({0}, 256) → ReLU → Dropout(0.3) → Linear(256, 1) → Sigmoid": [
    "Linear({0}, 256) → ReLU → Dropout(0.3) → Linear(256, 1) → Sigmoid",
    "Linear({0}, 256) → ReLU → Dropout(0.3) → Linear(256, 1) → Sigmoid"
  ],
  "Estimate one normalised depth value; Sigmoid constrains the output to [0,1].": [
    "估计一个归一化深度值；Sigmoid 将输出限制在 [0,1]。",
    "估計一個正規化深度值；Sigmoid 將輸出限制在 [0,1]。"
  ],
  "Microscopy input": [
    "显微图像输入",
    "顯微影像輸入"
  ],
  "Single-channel tensor": [
    "单通道张量",
    "單通道張量"
  ],
  "Give every model the same-sized grayscale view of the microrobot.": [
    "为每个模型提供同样大小的微型机器人灰度图像。",
    "為每個模型提供同樣大小的微型機器人灰度影像。"
  ],
  "Block 1": [
    "模块 1",
    "模組 1"
  ],
  "Conv 3×3, 1→32 · ReLU · MaxPool 4×4": [
    "3×3 卷积，1→32 · ReLU · 4×4 最大池化",
    "3×3 卷積，1→32 · ReLU · 4×4 最大池化"
  ],
  "Detect local image patterns and reduce the spatial resolution by four.": [
    "检测局部图像模式，并将空间分辨率降低至四分之一。",
    "檢測局部影像模式，並將空間解析度降低至四分之一。"
  ],
  "Block 2": [
    "模块 2",
    "模組 2"
  ],
  "Conv 3×3, 32→64 · Pool 2×2 · 1×1 skip add": [
    "3×3 卷积，32→64 · 2×2 池化 · 1×1 跳跃相加",
    "3×3 卷積，32→64 · 2×2 池化 · 1×1 跳躍相加"
  ],
  "Build richer features while a learned skip aligns the change from 32 to 64 channels.": [
    "学习更丰富的特征，同时利用可学习的跳跃连接对齐 32→64 的通道变化。",
    "學習更豐富的特徵，同時利用可學習的跳躍連接對齊 32→64 的通道變化。"
  ],
  "Block 3": [
    "模块 3",
    "模組 3"
  ],
  "Conv 3×3, 64→128 · Pool 2×2 · 1×1 skip add": [
    "3×3 卷积，64→128 · 2×2 池化 · 1×1 跳跃相加",
    "3×3 卷積，64→128 · 2×2 池化 · 1×1 跳躍相加"
  ],
  "Combine a wider field of view with a learned skip from 64 to 128 channels.": [
    "结合更广的感受野和 64→128 的可学习跳跃连接。",
    "結合更廣的感受野和 64→128 的可學習跳躍連接。"
  ],
  "Block 4": [
    "模块 4",
    "模組 4"
  ],
  "Conv 5×5, 128→128 · Pool 2×2 · identity add": [
    "5×5 卷积，128→128 · 2×2 池化 · 恒等相加",
    "5×5 卷積，128→128 · 2×2 池化 · 恆等相加"
  ],
  "Use a wider convolution to gather context while an identity skip preserves earlier features.": [
    "用更大的卷积核收集上下文，同时通过恒等跳跃连接保留早期特征。",
    "用更大的卷積核收集上下文，同時透過恆等跳躍連接保留早期特徵。"
  ],
  "Block 5": [
    "模块 5",
    "模組 5"
  ],
  "Conv 5×5, 128→128 · identity add": [
    "5×5 卷积，128→128 · 恒等相加",
    "5×5 卷積，128→128 · 恆等相加"
  ],
  "Refine the image features at the same resolution before the dense layers.": [
    "在进入全连接层之前，以相同分辨率细化图像特征。",
    "在進入全連接層之前，以相同解析度細化影像特徵。"
  ],
  "Dense representation": [
    "全连接表示",
    "全連線表示"
  ],
  "Flatten 6,272 → Linear 512 · ReLU": [
    "展平 6,272 → 线性层 512 · ReLU",
    "展平 6,272 → 線性層 512 · ReLU"
  ],
  "Combine the 7×7 spatial feature map into one representation for the task head.": [
    "将 7×7 空间特征图合成为供任务输出层使用的表示。",
    "將 7×7 空間特徵圖合成為供任務輸出層使用的表示。"
  ],
  "Linear(512, 40) · CrossEntropy logits": [
    "Linear(512, 40) · 交叉熵类别分数",
    "Linear(512, 40) · 交叉熵類別分數"
  ],
  "Produce 40 orientation scores, trained with cross-entropy.": [
    "产生 40 个方向分数，并通过交叉熵训练。",
    "產生 40 個方向分數，並透過交叉熵訓練。"
  ],
  "Linear(512, 1) · MSE target": [
    "Linear(512, 1) · 均方误差目标",
    "Linear(512, 1) · 均方誤差目標"
  ],
  "Predict depth directly with a linear output, trained with mean squared error.": [
    "通过线性输出直接预测深度，并使用均方误差训练。",
    "透過線性輸出直接預測深度，並使用均方誤差訓練。"
  ],
  "Use microscope intensity directly as a single image channel.": [
    "将显微图像的强度直接作为单个图像通道。",
    "將顯微影像的強度直接作為單個影像通道。"
  ],
  "Grayscale stem": [
    "灰度初始层",
    "灰度初始層"
  ],
  "Conv 7×7, 1→64, stride 2 · BatchNorm · ReLU · MaxPool": [
    "7×7 卷积，1→64，步长 2 · BatchNorm · ReLU · 最大池化",
    "7×7 卷積，1→64，步長 2 · BatchNorm · ReLU · 最大池化"
  ],
  "Convert grayscale patterns into 64 feature channels and reduce image resolution": [
    "将灰度模式转换为 64 个特征通道，并降低图像分辨率",
    "將灰度模式轉換為 64 個特徵通道，並降低影像解析度"
  ],
  "Residual stage {0}": [
    "残差阶段 {0}",
    "殘差階段 {0}"
  ],
  "{0} basic blocks · two 3×3 convolutions per block{1}": [
    "{0} 个基本模块 · 每个模块含两个 3×3 卷积{1}",
    "{0} 個基本模組 · 每個模組含兩個 3×3 卷積{1}"
  ],
  "Combine {0} residual blocks at this scale; skip paths help retain features through the deeper network.": [
    "在这个尺度组合 {0} 个残差模块；跳跃路径帮助特征穿过更深的网络。",
    "在這個尺度組合 {0} 個殘差模組；跳躍路徑幫助特徵穿過更深的網路。"
  ],
  "Global pool": [
    "全局池化",
    "全局池化"
  ],
  "Adaptive average pool": [
    "自适应平均池化",
    "自適應平均池化"
  ],
  "Average each feature channel over the image before making a single prediction.": [
    "对整幅图像中的各特征通道取平均，再输出单个预测。",
    "對整幅影像中的各特徵通道取平均，再輸出單個預測。"
  ],
  "Feed the same grayscale image into the compact model.": [
    "将相同的灰度图像输入紧凑模型。",
    "將相同的灰度影像輸入緊湊模型。"
  ],
  "Stem + early IR": [
    "初始层与早期倒残差",
    "初始層與早期倒殘差"
  ],
  "Conv 3×3 1→16 · inverted residual blocks 1–3": [
    "3×3 卷积 1→16 · 倒残差模块 1–3",
    "3×3 卷積 1→16 · 倒殘差模組 1–3"
  ],
  "Extract early patterns using inexpensive inverted residual blocks.": [
    "利用计算成本较低的倒残差模块提取早期模式。",
    "利用計算成本較低的倒殘差模組提取早期模式。"
  ],
  "SE bottlenecks": [
    "SE 瓶颈",
    "SE 瓶頸"
  ],
  "Inverted residual blocks 4–8 · 5×5 depthwise · squeeze/excitation": [
    "倒残差模块 4–8 · 5×5 深度卷积 · 压缩与激励",
    "倒殘差模組 4–8 · 5×5 深度卷積 · 壓縮與激勵"
  ],
  "Use depthwise filters for spatial detail and channel attention to emphasise useful features.": [
    "使用逐通道滤波器提取空间细节，并通过通道注意力突出有用特征。",
    "使用逐通道濾波器提取空間細節，並透過通道注意力突出有用特徵。"
  ],
  "Late bottlenecks": [
    "后期瓶颈",
    "後期瓶頸"
  ],
  "Inverted residual blocks 9–11 · final 1×1 projection": [
    "倒残差模块 9–11 · 最终 1×1 投影",
    "倒殘差模組 9–11 · 最終 1×1 投影"
  ],
  "Build higher-level features and expand their channel representation before pooling.": [
    "构建高层特征，并在池化前扩展通道表示。",
    "構建高層特徵，並在池化前擴展通道表示。"
  ],
  "Mobile embedding": [
    "紧凑图像嵌入",
    "緊湊影像嵌入"
  ],
  "Adaptive pool → Linear(576, 1024) · Hardswish · Dropout": [
    "自适应池化 → Linear(576, 1024) · Hardswish · Dropout",
    "自適應池化 → Linear(576, 1024) · Hardswish · Dropout"
  ],
  "Pool the image into a compact representation shared by either task head.": [
    "将图像池化为紧凑表示，供任一任务输出层使用。",
    "將影像池化為緊湊表示，供任一任務輸出層使用。"
  ],
  "Linear(1,024, 40)": [
    "Linear(1,024, 40)",
    "Linear(1,024, 40)"
  ],
  "Map the compact image representation to 40 orientation classes.": [
    "将紧凑图像表示映射到 40 个方向类别。",
    "將緊湊影像表示映射到 40 個方向類別。"
  ],
  "Linear(1,024, 1)": [
    "Linear(1,024, 1)",
    "Linear(1,024, 1)"
  ],
  "Map the image representation directly to one depth value.": [
    "将图像表示直接映射为一个深度值。",
    "將影像表示直接映射為一個深度值。"
  ],
  "Use one grayscale channel, matching the other models’ inputs.": [
    "使用单个灰度通道，与其他模型的输入保持一致。",
    "使用單個灰度通道，與其他模型的輸入保持一致。"
  ],
  "Patch projection": [
    "图块投影",
    "圖塊投影"
  ],
  "Conv 16×16, stride 16, 1→768 · averaged RGB weights": [
    "16×16 卷积，步长 16，1→768 · RGB 权重取平均",
    "16×16 卷積，步長 16，1→768 · RGB 權重取平均"
  ],
  "Divide the image into 16×16 patches and embed each patch in 768 features.": [
    "将图像分为 16×16 图块，每块嵌入为 768 个特征。",
    "將影像分為 16×16 圖塊，每塊嵌入為 768 個特徵。"
  ],
  "Token sequence": [
    "标记序列",
    "標記序列"
  ],
  "Prepend class token · add positional embedding": [
    "加入类别标记 · 添加位置嵌入",
    "加入類別標記 · 添加位置嵌入"
  ],
  "Keep track of patch position and add a token that will summarise the whole image.": [
    "保留图块位置信息，并加入一个用于汇总整幅图像的标记。",
    "保留圖塊位置資訊，並加入一個用於彙總整幅影像的標記。"
  ],
  "Transformer encoder": [
    "Transformer 编码器",
    "Transformer 編碼器"
  ],
  "12 encoder blocks · 12-head self-attention · MLP": [
    "12 个编码器模块 · 12 头自注意力 · MLP",
    "12 個編碼器模組 · 12 頭自注意力 · MLP"
  ],
  "Let each patch attend to other patches, building relationships across the image.": [
    "让每个图块关注其他图块，建立跨图像的关系。",
    "讓每個圖塊關注其他圖塊，建立跨影像的關係。"
  ],
  "Class token": [
    "类别标记",
    "類別標記"
  ],
  "Select encoded CLS representation": [
    "选择编码后的 CLS 表示",
    "選擇編碼後的 CLS 表示"
  ],
  "Read the whole-image summary for pose classification or depth estimation.": [
    "读取整幅图像的摘要，用于姿态分类或深度估计。",
    "讀取整幅影像的摘要，用於姿態分類或深度估計。"
  ],
  "SimpleCNN with residual skips": [
    "带残差跳连的 SimpleCNN",
    "帶殘差跳連的 SimpleCNN"
  ],
  "SimpleCNN": [
    "SimpleCNN",
    "SimpleCNN"
  ],
  "ResNet18 grayscale adaptation": [
    "ResNet18 灰度适配",
    "ResNet18 灰度適配"
  ],
  "ResNet18": [
    "ResNet18",
    "ResNet18"
  ],
  "ResNet34 grayscale adaptation": [
    "ResNet34 灰度适配",
    "ResNet34 灰度適配"
  ],
  "ResNet34": [
    "ResNet34",
    "ResNet34"
  ],
  "MobileNetV3-Small grayscale adaptation": [
    "MobileNetV3-Small 灰度适配",
    "MobileNetV3-Small 灰度適配"
  ],
  "MobileNetV3": [
    "MobileNetV3",
    "MobileNetV3"
  ],
  "Vision Transformer B/16 grayscale adaptation": [
    "Vision Transformer B/16 灰度适配",
    "Vision Transformer B/16 灰度適配"
  ],
  "ViT-B/16": [
    "ViT-B/16",
    "ViT-B/16"
  ],
  "04 DEC 2025": [
    "2025年12月4日",
    "2025年12月4日"
  ],
  "Frame the pose and depth prediction tasks": [
    "确定姿态和深度预测任务",
    "確定姿態和深度預測任務"
  ],
  "Define the microscopy problem, review related work and plan the comparison of orientation classifiers and depth estimators.": [
    "定义显微图像问题、回顾相关研究，并规划方向分类器与深度估计器的比较。",
    "定義顯微影像問題、回顧相關研究，並規劃方向分類器與深度估計器的比較。"
  ],
  "07 DEC 2025": [
    "2025年12月7日",
    "2025年12月7日"
  ],
  "Correct image orientation before training": [
    "训练前校正图像方向",
    "訓練前校正影像方向"
  ],
  "Correct image orientation metadata so the microscope image and its pose label stay aligned. Follow-up work refines the preprocessing.": [
    "校正图像方向元数据，使显微图像与姿态标签保持一致。后续工作进一步改进预处理。",
    "校正影像方向元資料，使顯微影像與姿態標籤保持一致。後續工作進一步改進預處理。"
  ],
  "08 DEC 2025": [
    "2025年12月8日",
    "2025年12月8日"
  ],
  "Inspect prediction errors and image attention": [
    "检查预测误差与图像注意力",
    "檢查預測誤差與影像注意力"
  ],
  "Compare training progress and errors for both tasks, then use Grad-CAM to inspect the image regions associated with orientation and depth predictions.": [
    "比较两个任务的训练进展和误差，再用 Grad-CAM 检查与方向和深度预测相关的图像区域。",
    "比較兩個任務的訓練進展和誤差，再用 Grad-CAM 檢查與方向和深度預測相關的影像區域。"
  ],
  "10 DEC 2025": [
    "2025年12月10日",
    "2025年12月10日"
  ],
  "Compare five model families": [
    "比较五种模型系列",
    "比較五種模型系列"
  ],
  "Bring together confusion matrices, depth residuals and learned-feature views for SimpleCNN, ResNet18, ResNet34, MobileNetV3 and ViT.": [
    "汇总 SimpleCNN、ResNet18、ResNet34、MobileNetV3 和 ViT 的混淆矩阵、深度残差与学习特征视图。",
    "彙總 SimpleCNN、ResNet18、ResNet34、MobileNetV3 和 ViT 的混淆矩陣、深度殘差與學習特徵視圖。"
  ],
  "13 DEC 2025": [
    "2025年12月13日",
    "2025年12月13日"
  ],
  "Select models and prepare a prediction workflow": [
    "选择模型并准备预测流程",
    "選擇模型並準備預測流程"
  ],
  "Use the recorded comparisons to select models, then prepare the image-loading and prediction workflow for handoff.": [
    "依据记录的比较结果选择模型，再准备图像加载和预测流程供交接使用。",
    "依據記錄的比較結果選擇模型，再準備影像載入和預測流程供交接使用。"
  ],
  "20 DEC 2025": [
    "2025年12月20日",
    "2025年12月20日"
  ],
  "Explain the final models and results": [
    "解释最终模型与结果",
    "解釋最終模型與結果"
  ],
  "Present the final ResNet analysis, roll–pitch orientation grid, architecture explanations and instructions for using the trained models.": [
    "展示最终 ResNet 分析、横滚—俯仰方向网格、架构说明及训练模型的使用方法。",
    "展示最終 ResNet 分析、滾轉—俯仰方向網格、架構說明及訓練模型的使用方法。"
  ],
  "Refine the image-loading workflow": [
    "改进图像加载流程",
    "改進影像載入流程"
  ],
  "Refine loading and preprocessing so new microscopy images can follow the same prediction workflow.": [
    "改进加载与预处理，使新的显微图像能够遵循同样的预测流程。",
    "改進載入與預處理，使新的顯微影像能夠遵循同樣的預測流程。"
  ],
  "Microrobot vision": [
    "微型机器人视觉",
    "微型機器人視覺"
  ],
  "Finding orientation and depth from microscope images": [
    "从显微图像判断方向与深度",
    "從顯微影像判斷方向與深度"
  ],
  "5 Models · 2 tasks": [
    "5 种模型 · 2 项任务",
    "5 種模型 · 2 項任務"
  ],
  "Guiding a microrobot requires knowing where it is and how it is tilted. This project uses microscope images to classify orientation and estimate depth.": [
    "引导微型机器人需要知道它的位置和倾斜方向。这个项目使用显微图像对方向分类，并估计深度。",
    "引導微型機器人需要知道它的位置和傾斜方向。這個專案使用顯微影像對方向分類，並估計深度。"
  ],
  "Switch between pose and depth, select a model, then click a stage to follow the image features into its prediction head.": [
    "切换姿态或深度任务、选择模型，再点击某个阶段，追踪图像特征如何进入预测输出层。",
    "切換姿態或深度任務、選擇模型，再點擊某個階段，追蹤影像特徵如何進入預測輸出層。"
  ],
  "The same image-processing backbone can serve two tasks. Compare the output head, model size and recorded performance as you switch.": [
    "同一图像处理主干可以服务于两项任务。切换时，比较输出层、模型大小及记录表现。",
    "同一影像處理主幹可以服務於兩項任務。切換時，比較輸出層、模型大小及記錄表現。"
  ],
  "5 Architectures · pose classification + depth estimation": [
    "5 种架构 · 姿态分类与深度估计",
    "5 種架構 · 姿態分類與深度估計"
  ],
  "Interactive architecture diagrams": [
    "交互式架构图",
    "交互式架構圖"
  ],
  "Project contribution": [
    "项目贡献",
    "專案貢獻"
  ],
  "Research context": [
    "研究背景",
    "研究背景"
  ],
  "Samuel built a custom CNN, adapted four pretrained image models to grayscale microscopy, and trained separate orientation and depth predictors. Image-orientation corrections, error plots and Grad-CAM comparisons helped examine what the models learned.": [
    "Samuel 构建了自定义 CNN，将四种预训练图像模型适配到灰度显微图像，并分别训练方向和深度预测器。图像方向校正、误差图与 Grad-CAM 比较帮助检查模型学到了什么。",
    "Samuel 構建了自訂 CNN，將四種預訓練影像模型適配到灰度顯微影像，並分別訓練方向和深度預測器。影像方向校正、誤差圖與 Grad-CAM 比較幫助檢查模型學到了什麼。"
  ],
  "Model selection": [
    "选择模型",
    "選擇模型"
  ],
  "CUSTOM CNN": [
    "自定义 CNN",
    "自訂 CNN"
  ],
  "PRETRAINED": [
    "预训练",
    "預訓練"
  ],
  "params": [
    "参数",
    "參數"
  ],
  "Model inspector": [
    "模型查看器",
    "模型查看器"
  ],
  "Task head": [
    "任务输出头",
    "任務輸出頭"
  ],
  "Pose · 40 class": [
    "姿态 · 40 类",
    "姿態 · 40 類"
  ],
  "Depth · regression": [
    "深度 · 回归",
    "深度 · 迴歸"
  ],
  "Trainable parameters": [
    "可训练参数",
    "可訓練參數"
  ],
  "Training recipe": [
    "训练配置",
    "訓練配置"
  ],
  "epochs ·": [
    "轮 ·",
    "輪 ·"
  ],
  "Turn": [
    "水平旋转",
    "水平旋轉"
  ],
  "Tilt": [
    "垂直倾斜",
    "垂直傾斜"
  ],
  "Explode": [
    "层间距",
    "層間距"
  ],
  "px": [
    "像素",
    "像素"
  ],
  "Reset view": [
    "重置视图",
    "重置檢視"
  ],
  "Pause rotation": [
    "暂停旋转",
    "暫停旋轉"
  ],
  "Auto rotate": [
    "自动旋转",
    "自動旋轉"
  ],
  "Selected tensor ·": [
    "所选张量 ·",
    "所選張量 ·"
  ],
  "Rotatable tensor graph": [
    "可旋转张量图",
    "可旋轉張量圖"
  ],
  "Select any stage": [
    "选择任意阶段",
    "選擇任意階段"
  ],
  "40 POSE LOGITS": [
    "40 个姿态类别分数",
    "40 個姿態類別分數"
  ],
  "Normalized depth": [
    "归一化深度",
    "正規化深度"
  ],
  "Residual / skip stages": [
    "残差 / 跳跃阶段",
    "殘差 / 跳躍階段"
  ],
  "Inspect {0}, output {1}": [
    "查看 {0}，输出 {1}",
    "查看 {0}，輸出 {1}"
  ],
  "tensor volume": [
    "张量体",
    "張量體"
  ],
  "residual / skip stage": [
    "残差 / 跳连阶段",
    "殘差 / 跳連階段"
  ],
  "selected for inspection": [
    "当前检查项",
    "當前檢查項"
  ],
  "Follow each stage of the model": [
    "逐阶段了解模型",
    "逐階段瞭解模型"
  ],
  "Aggregated stages": [
    "汇总阶段",
    "彙總階段"
  ],
  "{0} architecture table; scroll horizontally for all columns": [
    "{0} 架构表；横向滚动查看所有列",
    "{0} 架構表；橫向滾動查看所有列"
  ],
  "architecture": [
    "架构",
    "架構"
  ],
  "Output shape": [
    "输出形状",
    "輸出形狀"
  ],
  "Architecture total": [
    "架构总计",
    "架構總計"
  ],
  "all stages": [
    "所有阶段",
    "所有階段"
  ],
  "grouped estimate": [
    "分组估算",
    "分組估算"
  ],
  "Experiment comparison": [
    "实验比较",
    "實驗比較"
  ],
  "How accurately did the models estimate orientation?": [
    "模型估计方向有多准确？",
    "模型估計方向有多準確？"
  ],
  "How closely did they estimate depth?": [
    "深度估计与目标有多接近？",
    "深度估計與目標有多接近？"
  ],
  "Pose accuracy · higher is better": [
    "姿态准确率 · 越高越好",
    "姿態準確率 · 越高越好"
  ],
  "Normalised depth RMSE · lower is better": [
    "归一化深度 RMSE · 越低越好",
    "正規化深度 RMSE · 越低越好"
  ],
  "Scale shown: 96–100% test accuracy; higher is better.": [
    "显示范围为 96–100% 测试准确率；越高越好。",
    "顯示範圍為 96–100% 測試準確率；越高越好。"
  ],
  "Scale shown inversely over the reported 0.020–0.052 RMSE range; lower is better.": [
    "条形长度反向表示记录的 0.020–0.052 RMSE 范围；误差越低越好。",
    "條形長度反向表示記錄的 0.020–0.052 RMSE 範圍；誤差越低越好。"
  ],
  "Reading the comparison": [
    "理解比较结果",
    "理解比較結果"
  ],
  "Accuracy, depth error and model size answer different questions": [
    "准确率、深度误差和模型大小回答不同的问题",
    "準確率、深度誤差和模型大小回答不同的問題"
  ],
  "Pose accuracy measures the fraction of images assigned to the correct orientation. Depth RMSE measures the size of the depth errors in normalised units. The parameter chart shows how much model capacity each design uses.": [
    "姿态准确率表示被分到正确方向类别的图像比例。深度 RMSE 衡量归一化单位下的深度误差大小。参数图则显示各设计使用的模型容量。",
    "姿態準確率表示被分到正確方向類別的影像比例。深度 RMSE 衡量正規化單位下的深度誤差大小。參數圖則顯示各設計使用的模型容量。"
  ],
  "The bars use the recorded five-model comparison, before final retraining. Pose scores varied slightly between recorded evaluations; the depth results shown here use one comparison table consistently.": [
    "条形图使用最终重新训练之前记录的五模型比较。各次姿态评估结果略有差异；这里的深度结果统一来自同一张比较表。",
    "條形圖使用最終重新訓練之前記錄的五模型比較。各次姿態評估結果略有差異；這裡的深度結果統一來自同一張比較表。"
  ],
  "SimpleCNN scores describe an earlier version without the two learned projection skips shown in the developed architecture. The original image-level split may place related video frames in training and testing; the sequence experiment explores why that matters.": [
    "SimpleCNN 的分数对应早期版本，尚未加入现有架构中的两个可学习投影跳跃连接。原来的按图像划分可能让相关视频帧同时进入训练和测试；序列实验说明了这一点为何重要。",
    "SimpleCNN 的分數對應早期版本，尚未加入現有架構中的兩個可學習投影跳躍連接。原來的按影像劃分可能讓相關影片影格同時進入訓練和測試；序列實驗說明了這一點為何重要。"
  ],
  "From data correction to deployment handoff": [
    "从数据校正到部署交接",
    "從資料校正到部署交接"
  ],
  "04–20 DEC 2025": [
    "2025年12月4—20日",
    "2025年12月4—20日"
  ],
  "Filter experiment timeline": [
    "筛选实验时间线",
    "篩選實驗時間線"
  ],
  "What was built, adapted and tested": [
    "构建、适配与测试的内容",
    "構建、適配與測試的內容"
  ],
  "The five-block CNN and its residual skips were built for this project. It learns image features from scratch.": [
    "五模块 CNN 及其残差跳跃连接为本项目构建，从头学习图像特征。",
    "五模組 CNN 及其殘差跳躍連接為本專案構建，從頭學習影像特徵。"
  ],
  "Transfer learning": [
    "迁移学习",
    "遷移學習"
  ],
  "ResNet, MobileNet and ViT start from ImageNet-pretrained backbones. Grayscale inputs and new prediction heads adapt those existing architectures to microscopy.": [
    "ResNet、MobileNet 和 ViT 以 ImageNet 预训练主干为起点，再通过灰度输入和新的预测输出层适配到显微图像。",
    "ResNet、MobileNet 和 ViT 以 ImageNet 預訓練主幹為起點，再透過灰度輸入和新的預測輸出層適配到顯微影像。"
  ],
  "TWO TASKS": [
    "两项任务",
    "兩項任務"
  ],
  "Pose classification selects one of 40 pitch–roll combinations. Depth regression estimates one continuous value from the same kind of image.": [
    "姿态分类从 40 种俯仰—横滚组合中选择一种。深度回归则从同类图像估计一个连续值。",
    "姿態分類從 40 種俯仰—滾轉組合中選擇一種。深度迴歸則從同類影像估計一個連續值。"
  ],
  "Recorded pose and depth results show the trade-off between model size and prediction quality. The browser diagrams explain the models; they do not run a new prediction.": [
    "记录的姿态与深度结果展示模型大小和预测质量之间的取舍。浏览器图解用于解释模型，不会重新运行预测。",
    "記錄的姿態與深度結果展示模型大小和預測質量之間的取捨。瀏覽器圖解用於解釋模型，不會重新執行預測。"
  ],
  "New recordings": [
    "新录制数据",
    "新錄製資料"
  ],
  "The original 60/20/20 image split can mix correlated frames across sets. Testing on complete unseen recordings would better assess performance in a new experiment.": [
    "原来的 60/20/20 图像划分可能将相关帧分配到不同数据集。使用完整的新录制序列测试，更能评估模型在新实验中的表现。",
    "原來的 60/20/20 影像劃分可能將相關影格分配到不同資料集。使用完整的新錄製序列測試，更能評估模型在新實驗中的表現。"
  ],
  "Neural CFD surrogates": [
    "神经 CFD 替代模型",
    "神經 CFD 替代模型"
  ],
  "MRI reconstruction": [
    "MRI 重建",
    "MRI 重建"
  ],
  "Define the microscopy prediction tasks": [
    "定义显微图像预测任务",
    "定義顯微影像預測任務"
  ],
  "Frame the problem of estimating microrobot orientation and depth from grayscale images, and plan a comparison of several image-model families.": [
    "明确从灰度图像估计微型机器人方向和深度的问题，并规划多种图像模型系列的比较。",
    "明確從灰度影像估計微型機器人方向和深度的問題，並規劃多種影像模型系列的比較。"
  ],
  "Align image orientation metadata with pose labels so that preprocessing preserves the relationship between an image and the robot’s pitch and roll.": [
    "将图像方向元数据与姿态标签对齐，使预处理保留图像与机器人俯仰、横滚之间的对应关系。",
    "將影像方向元資料與姿態標籤對齊，使預處理保留影像與機器人俯仰、滾轉之間的對應關係。"
  ],
  "Inspect pose errors, depth errors and image attention": [
    "检查姿态误差、深度误差与图像注意力",
    "檢查姿態誤差、深度誤差與影像注意力"
  ],
  "Compare training progress, confusion matrices and depth residuals. Grad-CAM highlights image regions associated with each prediction, helping inspect model behaviour.": [
    "比较训练进展、混淆矩阵和深度残差。Grad-CAM 突出显示与各预测相关的图像区域，帮助检查模型行为。",
    "比較訓練進展、混淆矩陣和深度殘差。Grad-CAM 突出顯示與各預測相關的影像區域，幫助檢查模型行為。"
  ],
  "Compare five image-model families": [
    "比较五种图像模型系列",
    "比較五種影像模型系列"
  ],
  "Compare a custom CNN with ResNet18, ResNet34, MobileNetV3-Small and ViT-B/16 for orientation and depth estimation.": [
    "比较自定义 CNN 与 ResNet18、ResNet34、MobileNetV3-Small 和 ViT-B/16 在方向及深度估计上的表现。",
    "比較自訂 CNN 與 ResNet18、ResNet34、MobileNetV3-Small 和 ViT-B/16 在方向及深度估計上的表現。"
  ],
  "Use the recorded comparisons to choose models for precise estimation and compact inference, then prepare the image-loading and prediction workflow.": [
    "依据记录比较，选择用于精确估计和紧凑推理的模型，再准备图像加载及预测流程。",
    "依據記錄比較，選擇用於精確估計和緊湊推理的模型，再準備影像載入及預測流程。"
  ],
  "Explain the final experiments and architectures": [
    "解释最终实验与架构",
    "解釋最終實驗與架構"
  ],
  "Bring together the ResNet analysis, roll–pitch orientation grid, architecture descriptions and instructions for using the trained models.": [
    "汇总 ResNet 分析、横滚—俯仰方向网格、架构描述和训练模型的使用说明。",
    "彙總 ResNet 分析、滾轉—俯仰方向網格、架構描述和訓練模型的使用說明。"
  ],
  "Refine microscopy image loading": [
    "改进显微图像加载",
    "改進顯微影像載入"
  ],
  "Refine the image-loading and preprocessing workflow so new microscope images follow the same path into the prediction models.": [
    "改进图像加载与预处理流程，使新的显微图像沿着相同路径进入预测模型。",
    "改進影像載入與預處理流程，使新的顯微影像沿著相同路徑進入預測模型。"
  ],
  "Learn flow updates on a regular grid": [
    "在规则网格上学习流场更新",
    "在規則網格上學習流場更新"
  ],
  "Interpolate mesh fields onto a grid and train a four-level U-Net for 100 epochs. A separate shifted evaluation produces relative error 1.2823, highlighting sensitivity to unfamiliar flow conditions.": [
    "将网格流场插值到栅格，训练四层 U-Net 100 轮。独立的分布变化评估得到相对误差 1.2823，体现了模型对陌生流动条件的敏感性。",
    "將網格流場插值到柵格，訓練四層 U-Net 100 輪。獨立的分佈變化評估得到相對誤差 1.2823，體現了模型對陌生流動條件的敏感性。"
  ],
  "Predict flow directly on the mesh": [
    "直接在网格上预测流动",
    "直接在網格上預測流動"
  ],
  "Complete node and edge encoders, ten residual message-passing blocks and an autoregressive prediction loop. Neighbouring mesh points exchange information while retaining the original geometry.": [
    "完成节点与边编码器、十个残差消息传递模块和自回归预测循环。相邻网格点交换信息，同时保留原始几何结构。",
    "完成節點與邊編碼器、十個殘差訊息傳遞模組和自迴歸預測循環。相鄰網格點交換資訊，同時保留原始幾何結構。"
  ],
  "Learn global flow patterns with Fourier modes": [
    "通过傅里叶模式学习全局流动规律",
    "透過傅里葉模式學習全局流動規律"
  ],
  "Train a three-block Fourier model and record relative L2 0.0163. A separate four-block extension adds more input context and normalisation.": [
    "训练三模块傅里叶模型，记录相对 L2 误差 0.0163。另一个四模块扩展增加输入信息与归一化。",
    "訓練三模組傅里葉模型，記錄相對 L2 誤差 0.0163。另一個四模組擴展增加輸入資訊與正規化。"
  ],
  "04 — 06 MAR 2026": [
    "2026年3月4—6日",
    "2026年3月4—6日"
  ],
  "Explore residual and multi-scale Fourier designs": [
    "探索残差与多尺度傅里叶设计",
    "探索殘差與多尺度傅里葉設計"
  ],
  "Expand the design with wider residual blocks, physics terms, lightweight variants and several Fourier resolutions. The larger recorded run uses about 33.205 million parameters.": [
    "通过更宽的残差模块、物理项、轻量变体和多种傅里叶分辨率扩展设计。较大的记录实验使用约 3,320.5 万个参数。",
    "透過更寬的殘差模組、物理項、輕量變體和多種傅里葉解析度擴展設計。較大的記錄實驗使用約 3,320.5 萬個參數。"
  ],
  "03 APR 2026": [
    "2026年4月3日",
    "2026年4月3日"
  ],
  "Combine reconstruction with uncertainty and consistency checks": [
    "结合重建、不确定性与一致性检查",
    "結合重建、不確定性與一致性檢查"
  ],
  "Develop a residual reconstruction U-Net with three learnable data-consistency steps, then examine MC-dropout, ensembles and downstream segmentation. The model aims to recover useful images from incomplete measurements.": [
    "开发带三个可学习数据一致性步骤的残差重建 U-Net，并研究 MC-dropout、集成与下游分割。模型旨在从不完整测量中恢复有用的图像。",
    "開發帶三個可學習資料一致性步驟的殘差重建 U-Net，並研究 MC-dropout、集成與下游分割。模型旨在從不完整測量中恢復有用的影像。"
  ],
  "MobileNetV3-Small · classification": [
    "MobileNetV3-Small · 分类",
    "MobileNetV3-Small · 分類"
  ],
  "40-class pose classifier": [
    "40 类姿态分类器",
    "40 類姿態分類器"
  ],
  "A compact transfer-learning candidate for estimating orientation with fewer model parameters.": [
    "用于方向估计的紧凑迁移学习模型，参数量较小。",
    "用於方向估計的緊湊遷移學習模型，參數量較小。"
  ],
  "SimpleCNN · residual classification design": [
    "SimpleCNN · 残差分类设计",
    "SimpleCNN · 殘差分類設計"
  ],
  "The developed design includes two projected skips and two identity skips. Recorded pose scores refer to an earlier version without the two learned projection skips.": [
    "改进后的设计包含两个投影跳跃连接和两个恒等跳跃连接。记录的姿态分数对应尚未加入两个可学习投影跳跃连接的早期版本。",
    "改進後的設計包含兩個投影跳躍連接和兩個恆等跳躍連接。記錄的姿態分數對應尚未加入兩個可學習投影跳躍連接的早期版本。"
  ],
  "ResNet18 · classification": [
    "ResNet18 · 分类",
    "ResNet18 · 分類"
  ],
  "Fine-tuning reuses learned image features while the new input and output layers adapt them to microscopy.": [
    "微调复用已有图像特征，再用新的输入与输出层适配显微图像。",
    "微調複用已有影像特徵，再用新的輸入與輸出層適配顯微影像。"
  ],
  "ResNet34 · classification": [
    "ResNet34 · 分类",
    "ResNet34 · 分類"
  ],
  "A new one-channel input convolution accepts microscope intensity. Residual connections carry features through the deeper model.": [
    "新的单通道输入卷积接收显微图像强度，残差连接帮助特征穿过更深的网络。",
    "新的單通道輸入卷積接收顯微影像強度，殘差連接幫助特徵穿過更深的網路。"
  ],
  "ViT-B/16 · classification": [
    "ViT-B/16 · 分类",
    "ViT-B/16 · 分類"
  ],
  "The transformer can relate distant image regions. Its larger parameter count does not by itself imply better predictions.": [
    "Transformer 可以关联距离较远的图像区域；参数更多本身并不意味着预测更好。",
    "Transformer 可以關聯距離較遠的影像區域；參數更多本身並不意味著預測更好。"
  ],
  "MeshGraphNet · 10 processors": [
    "MeshGraphNet · 10 个处理模块",
    "MeshGraphNet · 10 個處理模組"
  ],
  "Native-mesh autoregressive flow surrogate": [
    "原始网格上的自回归流场替代模型",
    "原始網格上的自迴歸流場替代模型"
  ],
  "Node 7→10 and edge 3→10 encoders feed ten residual processors and a 10→3 decoder. Each prediction is added to the previous flow field.": [
    "节点 7→10 与边 3→10 编码器连接十个残差处理模块和 10→3 解码器，每次预测的变化量再加到之前的流场上。",
    "節點 7→10 與邊 3→10 編碼器連接十個殘差處理模組和 10→3 解碼器，每次預測的變化量再加到之前的流場上。"
  ],
  "FNO · three-block baseline": [
    "FNO · 三模块基线",
    "FNO · 三模組基線"
  ],
  "3-D spectral flow surrogate": [
    "三维频谱流场替代模型",
    "三維頻譜流場替代模型"
  ],
  "Three input fields are lifted to width 36, processed by three spectral blocks, then projected through a 36→128→3 head.": [
    "三个输入流场先升维至宽度 36，经过三个频谱模块，再由 36→128→3 输出层完成投影。",
    "三個輸入流場先升維至寬度 36，經過三個頻譜模組，再由 36→128→3 輸出層完成投影。"
  ],
  "FNO · four-block extension": [
    "FNO · 四模块扩展",
    "FNO · 四模組擴展"
  ],
  "Six-input 3-D spectral flow surrogate": [
    "六输入三维频谱流场替代模型",
    "六輸入三維頻譜流場替代模型"
  ],
  "The six inputs combine velocity and pressure with x/y position and obstacle distance. Each spectral block retains 8×8×4 modes; no evaluation result is paired with this exact design.": [
    "六个输入结合速度、压力、x/y 位置和障碍物距离。每个频谱模块保留 8×8×4 个模式；这一具体设计没有对应的评估结果。",
    "六個輸入結合速度、壓力、x/y 位置和障礙物距離。每個頻譜模組保留 8×8×4 個模式；這一具體設計沒有對應的評估結果。"
  ],
  "FNO · five-block residual experiment": [
    "FNO · 五模块残差实验",
    "FNO · 五模組殘差實驗"
  ],
  "Five-block residual spectral surrogate": [
    "五模块残差频谱替代模型",
    "五模組殘差頻譜替代模型"
  ],
  "Five width-48 blocks retain 12×12×5 modes. The count shown is the recorded run configuration; the evaluation set also guided model selection.": [
    "五个宽度为 48 的模块保留 12×12×5 个模式。参数数量对应记录实验的配置；同一评估集也参与了模型选择。",
    "五個寬度為 48 的模組保留 12×12×5 個模式。參數數量對應記錄實驗的配置；同一評估集也參與了模型選擇。"
  ],
  "Grid U-Net · four-level surrogate": [
    "网格 U-Net · 四层替代模型",
    "網格 U-Net · 四層替代模型"
  ],
  "3×80×320 grid-to-grid flow surrogate": [
    "3×80×320 网格到网格流场替代模型",
    "3×80×320 網格到網格流場替代模型"
  ],
  "Strided convolutions build a 64→128→256→512→1024 encoder. Four transposed-convolution stages restore the field resolution and merge the skip features.": [
    "步长卷积构建 64→128→256→512→1024 编码器，四个转置卷积阶段恢复流场分辨率，并融合跳跃特征。",
    "步長卷積構建 64→128→256→512→1024 編碼器，四個轉置卷積階段恢復流場解析度，並融合跳躍特徵。"
  ],
  "Segmentation U-Net · frozen evaluator": [
    "分割 U-Net · 冻结评估器",
    "分割 U-Net · 凍結評估器"
  ],
  "Eight-class downstream evaluator": [
    "八类下游评估器",
    "八類下游評估器"
  ],
  "Keeping this evaluator frozen helps examine whether reconstruction changes the downstream segmentation task.": [
    "固定这个评估器的参数，有助于检查重建变化是否影响下游分割任务。",
    "固定這個評估器的參數，有助於檢查重建變化是否影響下游分割任務。"
  ],
  "ReconUNet · reconstruction model": [
    "ReconUNet · 重建模型",
    "ReconUNet · 重建模型"
  ],
  "Residual 256×256 MRI reconstructor": [
    "256×256 残差 MRI 重建器",
    "256×256 殘差 MRI 重建器"
  ],
  "A symmetric 32→64→128→256→512 path processes the image. Three soft data-consistency steps bring it back towards the acquired measurements.": [
    "对称的 32→64→128→256→512 路径处理图像，再通过三个软数据一致性步骤，使结果更接近实际采集的测量。",
    "對稱的 32→64→128→256→512 路徑處理影像，再透過三個軟資料一致性步驟，使結果更接近實際採集的測量。"
  ],
  "Model experiment lineage": [
    "模型实验演进",
    "模型實驗演進"
  ],
  "VISION · FLUID MOTION · MRI · DEC 2025—APR 2026": [
    "视觉 · 流体运动 · MRI · 2025年12月—2026年4月",
    "視覺 · 流體運動 · MRI · 2025年12月—2026年4月"
  ],
  "How the model designs developed": [
    "模型设计如何发展",
    "模型設計如何發展"
  ],
  "Follow the experiments from microscopy to fluid prediction and MRI. Compare how each problem shapes the model’s input, information flow and size.": [
    "沿着显微图像、流体预测与 MRI 的实验发展，比较各问题如何决定模型的输入、信息流动和规模。",
    "沿著顯微影像、流體預測與 MRI 的實驗發展，比較各問題如何決定模型的輸入、資訊流動和規模。"
  ],
  "Model lineage summary": [
    "模型演进概览",
    "模型演進概覽"
  ],
  "Applications": [
    "应用领域",
    "應用領域"
  ],
  "Milestones": [
    "关键阶段",
    "關鍵階段"
  ],
  "Configurations": [
    "配置",
    "配置"
  ],
  "Parameter span": [
    "参数范围",
    "參數範圍"
  ],
  "Model lineage view": [
    "模型演进视图",
    "模型演進視圖"
  ],
  "Development": [
    "开发过程",
    "開發過程"
  ],
  "Parameter scale": [
    "参数规模",
    "參數規模"
  ],
  "Design guide": [
    "设计指南",
    "設計指南"
  ],
  "Filter model family": [
    "筛选模型系列",
    "篩選模型系列"
  ],
  "FAMILY": [
    "系列",
    "系列"
  ],
  "All": [
    "全部",
    "全部"
  ],
  "Vision": [
    "视觉",
    "視覺"
  ],
  "CFD": [
    "CFD",
    "CFD"
  ],
  "MRI": [
    "MRI",
    "MRI"
  ],
  "Experiment milestones": [
    "实验关键阶段",
    "實驗關鍵階段"
  ],
  "Activity": [
    "活动",
    "活動"
  ],
  "All activities": [
    "所有活动",
    "所有活動"
  ],
  "Select a milestone to see what changed and why it mattered. The dates show development order; the intervals do not measure effort.": [
    "选择一个阶段，了解变化及其意义。日期表示开发顺序，时间间隔并不代表工作量。",
    "選擇一個階段，瞭解變化及其意義。日期表示開發順序，時間間隔並不代表工作量。"
  ],
  "No matching milestones": [
    "没有匹配的阶段",
    "沒有匹配的階段"
  ],
  "Change the family or activity filter to see more milestones.": [
    "更改模型系列或活动筛选，查看更多阶段。",
    "更改模型系列或活動篩選，查看更多階段。"
  ],
  "Selected milestone": [
    "所选阶段",
    "所選階段"
  ],
  "Family": [
    "系列",
    "系列"
  ],
  "Open project architecture": [
    "打开项目架构",
    "打開專案架構"
  ],
  "Filtered view": [
    "筛选结果",
    "篩選結果"
  ],
  "0 MATCHES": [
    "0 项匹配",
    "0 項匹配"
  ],
  "No milestone selected": [
    "尚未选择阶段",
    "尚未選擇階段"
  ],
  "This family has no milestone for the chosen activity. Change either filter to explore its development.": [
    "这个系列没有符合当前活动的阶段。更改任一筛选项，继续探索其发展。",
    "這個系列沒有符合當前活動的階段。更改任一篩選項，繼續探索其發展。"
  ],
  "LOG₁₀ Axis · exact counts": [
    "以 10 为底的对数轴 · 精确数量",
    "以 10 為底的對數軸 · 精確數量"
  ],
  "Trainable parameter scale": [
    "可训练参数规模",
    "可訓練參數規模"
  ],
  "configurations": [
    "种配置",
    "種配置"
  ],
  "Model sizes span four orders of magnitude, so the chart uses a logarithmic axis. Each tenfold increase takes the same space. More parameters mean more learned values, not necessarily better predictions.": [
    "模型大小跨越四个数量级，因此图表使用对数坐标：每增加十倍，所占距离相同。参数更多意味着学习的数值更多，并不保证预测更好。",
    "模型大小跨越四個數量級，因此圖表使用對數座標：每增加十倍，所佔距離相同。參數更多意味著學習的數值更多，並不保證預測更好。"
  ],
  "Model family legend": [
    "模型系列图例",
    "模型系列圖例"
  ],
  "Selected configuration": [
    "所选配置",
    "所選配置"
  ],
  "trainable parameters": [
    "可训练参数",
    "可訓練參數"
  ],
  "Origin": [
    "设计来源",
    "設計來源"
  ],
  "Design": [
    "设计",
    "設計"
  ],
  "Open exact architecture": [
    "打开对应架构",
    "打開對應架構"
  ],
  "Start with the task": [
    "从任务出发",
    "從任務出發"
  ],
  "What must the model learn from its input?": [
    "模型必须从输入中学到什么？",
    "模型必須從輸入中學到什麼？"
  ],
  "Microscopy needs orientation and depth from an image. CFD needs a future flow field. MRI needs a useful reconstruction from incomplete measurements.": [
    "显微图像需要提供方向与深度；CFD 需要预测未来流场；MRI 需要从不完整测量中重建有用图像。",
    "顯微影像需要提供方向與深度；CFD 需要預測未來流場；MRI 需要從不完整測量中重建有用影像。"
  ],
  "Then check the result": [
    "再检查结果",
    "再檢查結果"
  ],
  "Does the model work under the intended conditions?": [
    "模型能否在预期条件下工作？",
    "模型能否在預期條件下工作？"
  ],
  "Accuracy, depth error and flow error measure different things. Compare each model on its own task, with evaluation conditions that match its use.": [
    "准确率、深度误差与流场误差衡量不同的内容。应在各自任务中，以符合实际用途的评估条件比较模型。",
    "準確率、深度誤差與流場誤差衡量不同的內容。應在各自任務中，以符合實際用途的評估條件比較模型。"
  ],
  "3 APPLICATIONS": [
    "3 个应用领域",
    "3 個應用領域"
  ],
  "How the problem shapes the architecture": [
    "问题如何决定架构",
    "問題如何決定架構"
  ],
  "Scrollable architecture design guide": [
    "可滚动的架构设计指南",
    "可滾動的架構設計指南"
  ],
  "Inputs, model roles and useful evaluation questions": [
    "输入、模型作用与值得检查的评估问题",
    "輸入、模型作用與值得檢查的評估問題"
  ],
  "Project": [
    "项目",
    "專案"
  ],
  "Input": [
    "输入",
    "輸入"
  ],
  "Prediction": [
    "预测值",
    "預測值"
  ],
  "What to check": [
    "需要检查什么",
    "需要檢查什麼"
  ],
  "Grayscale microscope image": [
    "灰度显微图像",
    "灰度顯微影像"
  ],
  "Orientation class or depth": [
    "方向类别或深度",
    "方向類別或深度"
  ],
  "Custom CNN or pretrained image backbone with a new task head": [
    "自定义 CNN，或带新任务输出层的预训练图像主干",
    "自訂 CNN，或帶新任務輸出層的預訓練影像主幹"
  ],
  "Pose accuracy, depth error and performance on unseen recordings": [
    "姿态准确率、深度误差及对新录制数据的表现",
    "姿態準確率、深度誤差及對新錄製資料的表現"
  ],
  "Neural CFD": [
    "神经 CFD",
    "神經 CFD"
  ],
  "Velocity and pressure on a mesh or grid": [
    "网格或栅格上的速度与压力",
    "網格或柵格上的速度與壓力"
  ],
  "Later velocity and pressure fields": [
    "后续的速度与压力流场",
    "後續的速度與壓力流場"
  ],
  "Graph messages, Fourier modes or U-Net skips": [
    "图消息、傅里叶模式或 U-Net 跳跃连接",
    "圖訊息、傅里葉模式或 U-Net 跳躍連接"
  ],
  "Single-step error, repeated prediction and unfamiliar flow conditions": [
    "单步误差、重复预测及陌生流动条件",
    "單步誤差、重複預測及陌生流動條件"
  ],
  "Incomplete frequency-space measurements": [
    "不完整的频域测量",
    "不完整的頻域測量"
  ],
  "Reconstructed image and uncertainty": [
    "重建图像与不确定性",
    "重建影像與不確定性"
  ],
  "Residual U-Net with data-consistency steps": [
    "带数据一致性步骤的残差 U-Net",
    "帶資料一致性步驟的殘差 U-Net"
  ],
  "Image quality, measurement agreement and downstream segmentation": [
    "图像质量、测量一致性和下游分割",
    "影像質量、測量一致性和下游分割"
  ],
  "01 · Image features": [
    "01 · 图像特征",
    "01 · 影像特徵"
  ],
  "Build local patterns into a whole-image estimate": [
    "从局部模式形成整幅图像的估计",
    "從局部模式形成整幅影像的估計"
  ],
  "Convolutions gather spatial patterns. Pooling and task heads turn those patterns into orientation or depth predictions.": [
    "卷积收集空间模式，池化和任务输出层再将其转换为方向或深度预测。",
    "卷積收集空間模式，池化和任務輸出層再將其轉換為方向或深度預測。"
  ],
  "02 · Transfer learning": [
    "02 · 迁移学习",
    "02 · 遷移學習"
  ],
  "Adapt existing visual features": [
    "适配已有视觉特征",
    "適配已有視覺特徵"
  ],
  "ImageNet-pretrained backbones provide a starting point; grayscale inputs and new heads adapt them to microscopy.": [
    "ImageNet 预训练主干提供起点，再通过灰度输入和新输出层适配显微图像。",
    "ImageNet 預訓練主幹提供起點，再透過灰度輸入和新輸出層適配顯微影像。"
  ],
  "03 · Mesh messages": [
    "03 · 网格消息",
    "03 · 網格訊息"
  ],
  "Keep the simulation geometry": [
    "保留模拟几何结构",
    "保留模擬幾何結構"
  ],
  "Graph models pass information between neighbouring mesh points without first converting the field into an image grid.": [
    "图模型直接在相邻网格点之间传递信息，无需先将流场转换为图像栅格。",
    "圖模型直接在相鄰網格點之間傳遞資訊，無需先將流場轉換為影像柵格。"
  ],
  "04 · Fourier modes": [
    "04 · 傅里叶模式",
    "04 · 傅里葉模式"
  ],
  "Mix information across a flow field": [
    "在整个流场中混合信息",
    "在整個流場中混合資訊"
  ],
  "Frequency components capture broad patterns; learned mode weights and local paths combine them into a field update.": [
    "频率分量捕捉大范围模式，学习到的模式权重与局部路径再将其组合为流场更新。",
    "頻率分量捕捉大範圍模式，學習到的模式權重與局部路徑再將其組合為流場更新。"
  ],
  "05 · Skip connections": [
    "05 · 跳跃连接",
    "05 · 跳躍連接"
  ],
  "Carry useful features through the network": [
    "在网络中传递有用特征",
    "在網路中傳遞有用特徵"
  ],
  "Residual additions and U-Net bridges help later stages use information from earlier ones.": [
    "残差相加与 U-Net 桥接帮助后续阶段使用早期信息。",
    "殘差相加與 U-Net 橋接幫助後續階段使用早期資訊。"
  ],
  "06 · Data consistency": [
    "06 · 数据一致性",
    "06 · 資料一致性"
  ],
  "Respect the acquired measurements": [
    "保持与实际测量一致",
    "保持與實際測量一致"
  ],
  "MRI consistency steps bring the reconstructed image back towards the measured frequency samples.": [
    "MRI 一致性步骤使重建图像更接近已测量的频域采样值。",
    "MRI 一致性步驟使重建影像更接近已測量的頻域採樣值。"
  ],
  "development milestones ·": [
    "个开发阶段 ·",
    "個開發階段 ·"
  ],
  "model configurations · 3 applications": [
    "种模型配置 · 3 个应用领域",
    "種模型配置 · 3 個應用領域"
  ],
  "Compare architecture size within the context of each task": [
    "结合各自任务比较架构大小",
    "結合各自任務比較架構大小"
  ],
  "Vertical velocity · v": [
    "垂直速度 · v",
    "垂直速度 · v"
  ],
  "Horizontal velocity · u": [
    "水平速度 · u",
    "水平速度 · u"
  ],
  "Pressure · p": [
    "压力 · p",
    "壓力 · p"
  ],
  "A Fourier neural operator processes a ten-frame input window and predicts the next ten frames. This image shows the horizontal-velocity forecast at index 9.": [
    "傅里叶神经算子处理十帧输入窗口，并预测接下来的十帧。这张图显示索引 9 处的水平速度预测。",
    "傅里葉神經算子處理十影格輸入窗口，並預測接下來的十影格。這張圖顯示索引 9 處的水平速度預測。"
  ],
  "Residual FNO": [
    "残差 FNO",
    "殘差 FNO"
  ],
  "Five residual Fourier blocks combine spectral interactions with a pointwise path. The saved image shows horizontal velocity at forecast index 9.": [
    "五个残差傅里叶模块结合频谱交互与逐点路径。保存图像显示预测索引 9 处的水平速度。",
    "五個殘差傅里葉模組結合頻譜交互與逐點路徑。保存影像顯示預測索引 9 處的水平速度。"
  ],
  "Position-encoded FNO": [
    "位置编码 FNO",
    "位置編碼 FNO"
  ],
  "Spatial and temporal coordinates join the flow channels before Fourier processing. This image shows horizontal velocity at forecast index 9.": [
    "空间与时间坐标在傅里叶处理前加入流场通道。图像显示预测索引 9 处的水平速度。",
    "空間與時間座標在傅里葉處理前加入流場通道。影像顯示預測索引 9 處的水平速度。"
  ],
  "An encoder–decoder predicts the next flow field on an 80 × 320 grid. Skip connections restore spatial detail as the decoder upsamples.": [
    "编码器—解码器在 80 × 320 网格上预测下一时刻流场。解码器上采样时，通过跳跃连接恢复空间细节。",
    "編碼器—解碼器在 80 × 320 網格上預測下一時刻流場。解碼器上採樣時，透過跳躍連接恢復空間細節。"
  ],
  "Neural CFD flow explorer": [
    "神经 CFD 流场查看器",
    "神經 CFD 流場查看器"
  ],
  "Fluid dynamics · neural field prediction": [
    "流体力学 · 神经流场预测",
    "流體力學 · 神經流場預測"
  ],
  "Neural CFD Surrogates": [
    "神经网络 CFD 代理模型",
    "神經網路 CFD 代理模型"
  ],
  "Follow the wake behind a cylinder, move through the predicted frames, and explore Fourier, graph and convolutional models.": [
    "沿着圆柱后方的尾流逐帧查看预测，探索傅里叶、图网络与卷积模型。",
    "沿著圓柱後方的尾流逐影格查看預測，探索傅里葉、圖網路與卷積模型。"
  ],
  "Explore CFD results": [
    "探索 CFD 结果",
    "探索 CFD 結果"
  ],
  "Flow in motion": [
    "流动动画",
    "流動動畫"
  ],
  "FNO & U-Net forecasts": [
    "FNO 与 U-Net 预测",
    "FNO 與 U-Net 預測"
  ],
  "GNN prediction": [
    "GNN 预测",
    "GNN 預測"
  ],
  "Simulation sequence": [
    "模拟序列",
    "模擬序列"
  ],
  "20 predicted frames": [
    "20 个预测帧",
    "20 個預測影格"
  ],
  "30 simulation frames": [
    "30 个模拟帧",
    "30 個模擬影格"
  ],
  "Flow field channel": [
    "流场通道",
    "流場通道"
  ],
  "All three fields": [
    "全部三个流场",
    "全部三個流場"
  ],
  "Pause flow": [
    "暂停流动",
    "暫停流動"
  ],
  "Play flow": [
    "播放流动",
    "播放流動"
  ],
  "Pause": [
    "暂停",
    "暫停"
  ],
  "Loading frames…": [
    "正在加载帧…",
    "正在載入影格…"
  ],
  "Previous frame": [
    "上一帧",
    "上一影格"
  ],
  "Frame": [
    "帧",
    "影格"
  ],
  "Flow frame": [
    "流场帧",
    "流場影格"
  ],
  "Next frame": [
    "下一帧",
    "下一影格"
  ],
  "Playback": [
    "播放",
    "播放"
  ],
  "Playback speed": [
    "播放速度",
    "播放速度"
  ],
  "4 fps": [
    "每秒 4 帧",
    "每秒 4 影格"
  ],
  "8 fps": [
    "每秒 8 帧",
    "每秒 8 影格"
  ],
  "20 fps": [
    "每秒 20 帧",
    "每秒 20 影格"
  ],
  "Pin current frame": [
    "固定当前帧",
    "固定目前影格"
  ],
  "Clear reference": [
    "清除参考帧",
    "清除參考影格"
  ],
  "Pin a frame, then scrub or play to inspect how the wake changes within this sequence.": [
    "固定一帧，然后拖动或播放，观察同一序列中尾流的变化。",
    "固定一個影格，然後拖動或播放，觀察同一序列中尾流的變化。"
  ],
  "Reference frame": [
    "参考帧",
    "參考影格"
  ],
  "Offset": [
    "帧间隔",
    "影格間隔"
  ],
  "saved-frame intervals": [
    "（保存帧）",
    "（已儲存影格）"
  ],
  "Reference": [
    "参考",
    "參考"
  ],
  "reference frame": [
    "参考帧",
    "參考影格"
  ],
  "{0}, {1} frame {2}, flow past a cylinder": [
    "{0}，{1}第 {2} 帧，圆柱绕流",
    "{0}，{1}第 {2} 影格，圓柱繞流"
  ],
  "What to inspect": [
    "观察重点",
    "觀察重點"
  ],
  "Follow the alternating transverse-velocity pattern behind the cylinder. It describes motion across the main flow direction; it is not a vorticity map.": [
    "观察圆柱后方交替出现的横向速度分布。它表示垂直于主流方向的运动，而不是涡量图。",
    "觀察圓柱後方交替出現的橫向速度分布。它表示垂直於主流方向的運動，而不是渦量圖。"
  ],
  "Follow the downstream velocity pattern around and behind the cylinder. Compare the position and shape of the wake across saved frames.": [
    "观察圆柱周围及后方的流向速度分布，比较各保存帧中尾流的位置与形状。",
    "觀察圓柱周圍及後方的流向速度分布，比較各已儲存影格中尾流的位置與形狀。"
  ],
  "Inspect the pressure pattern around the obstacle and through the wake. Per-frame colour scaling does not preserve an absolute pressure comparison.": [
    "观察障碍物周围与尾流中的压力分布。每帧独立缩放的颜色不能用于比较绝对压力。",
    "觀察障礙物周圍與尾流中的壓力分布。每個影格獨立縮放的顏色不能用於比較絕對壓力。"
  ],
  "The three channels show the same saved state. Compare where changes appear in transverse velocity, downstream velocity and pressure.": [
    "三个通道显示同一个保存状态。比较横向速度、流向速度和压力中变化出现的位置。",
    "三個通道顯示同一個已儲存狀態。比較橫向速度、流向速度和壓力中變化出現的位置。"
  ],
  "Both panels belong to the selected sequence. This is a temporal comparison, not a prediction-versus-truth error measurement. Changing sequence clears the reference; colours are independently scaled in each saved frame.": [
    "两幅图来自所选的同一序列。这是时间变化比较，不是预测与真值的误差测量。切换序列会清除参考帧；每个保存帧的颜色均独立缩放。",
    "兩幅圖來自所選的同一序列。這是時間變化比較，不是預測與真值的誤差測量。切換序列會清除參考影格；每個已儲存影格的顏色均獨立縮放。"
  ],
  "A frame could not load. Reload the project to try again.": [
    "某一帧无法加载。请重新打开项目后重试。",
    "某一影格無法載入。請重新打開專案後重試。"
  ],
  "Each prediction becomes the next input.": [
    "每次预测都成为下一步输入。",
    "每次預測都成為下一步輸入。"
  ],
  "A wake moves across the mesh.": [
    "尾流在网格上演化。",
    "尾流在網格上演化。"
  ],
  "The graph network updates velocity and pressure at mesh nodes, then feeds its predicted field into the next step. The triangular mesh stays fixed as the state evolves.": [
    "图网络更新网格节点的速度和压力，再将预测流场送入下一步。状态不断变化，三角网格保持固定。",
    "圖網路更新網格節點的速度和壓力，再將預測流場送入下一步。狀態不斷變化，三角網格保持固定。"
  ],
  "These saved simulation snapshots show vertical velocity, horizontal velocity and pressure over the same cylinder domain. Vertical velocity reveals the alternating wake above and below the centre line.": [
    "这些保存的模拟快照展示同一圆柱区域中的垂直速度、水平速度和压力。垂直速度揭示了中心线上下交替出现的尾流。",
    "這些保存的模擬快照展示同一圓柱區域中的垂直速度、水平速度和壓力。垂直速度揭示了中心線上下交替出現的尾流。"
  ],
  "Recorded GNN results: 20 autoregressive predictions and 30 simulation frames. The sequences start from different states. Colours rescale per field and frame, so colour alone cannot compare magnitudes across time; playback speed is a display setting.": [
    "记录的 GNN 结果包含 20 个自回归预测帧和 30 个模拟帧，两组序列从不同状态开始。颜色在每个流场和帧内独立缩放，不能仅凭颜色比较跨时间的数值大小；播放速度只是显示设置。",
    "記錄的 GNN 結果包含 20 個自迴歸預測影格和 30 個模擬影格，兩組序列從不同狀態開始。顏色在每個流場和影格內獨立縮放，不能僅憑顏色比較跨時間的數值大小；播放速度只是顯示設置。"
  ],
  "Reading the animation": [
    "理解动画",
    "理解動畫"
  ],
  "The slider moves through recorded fields on the original triangular mesh. Use the frame comparison to inspect the wake’s position and shape; the model is not being run again in the browser.": [
    "滑块在原始三角网格的记录流场间移动。使用帧比较检查尾流的位置和形状；浏览器不会重新运行模型。",
    "滑塊在原始三角網格的記錄流場間移動。使用影格比較檢查尾流的位置和形狀；瀏覽器不會重新執行模型。"
  ],
  "The architecture view explains message passing, and the results view gives the recorded relative L2 with its evaluation conditions. The rollout experiment shows how repeated prediction can amplify error.": [
    "架构视图解释消息传递，结果视图提供记录的相对 L2 误差及评估条件。递推实验展示重复预测如何放大误差。",
    "架構視圖解釋訊息傳遞，結果視圖提供記錄的相對 L2 誤差及評估條件。遞推實驗展示重複預測如何放大誤差。"
  ],
  "Forecast model": [
    "预测模型",
    "預測模型"
  ],
  "{0} saved horizontal velocity prediction around a cylinder": [
    "{0} 保存的圆柱周围水平速度预测",
    "{0} 保存的圓柱周圍水平速度預測"
  ],
  "These FNO and U-Net forecasts are recorded still figures. The motion tab plays GNN results. Use the architecture and results tabs to connect each picture with its model and evaluation conditions.": [
    "这些 FNO 和 U-Net 预测是保存的静态图。动态页播放 GNN 结果；结合架构和结果页，可了解每幅图对应的模型及评估条件。",
    "這些 FNO 和 U-Net 預測是保存的靜態圖。動態頁播放 GNN 結果；結合架構和結果頁，可瞭解每幅圖對應的模型及評估條件。"
  ],
  "Fields in frequency space": [
    "频域中的流场",
    "頻域中的流場"
  ],
  "Spectral blocks learn interactions between Fourier modes. A pointwise path and residual connections carry local information between blocks.": [
    "频谱模块学习傅里叶模式之间的交互，逐点路径与残差连接则在模块之间传递局部信息。",
    "頻譜模組學習傅里葉模式之間的交互，逐點路徑與殘差連接則在模組之間傳遞局部資訊。"
  ],
  "Messages on a mesh": [
    "网格上的消息",
    "網格上的訊息"
  ],
  "Node states combine with edge geometry. Message aggregation updates each node before the next velocity and pressure prediction.": [
    "节点状态与边的几何信息结合。消息聚合更新各节点，再预测下一时刻的速度和压力。",
    "節點狀態與邊的幾何資訊結合。訊息聚合更新各節點，再預測下一時刻的速度和壓力。"
  ],
  "Detail across scales": [
    "跨尺度细节",
    "跨尺度細節"
  ],
  "Downsampling collects wider spatial context. The decoder combines it with earlier feature maps through skip connections.": [
    "下采样收集更广的空间上下文，解码器通过跳跃连接将其与早期特征图结合。",
    "下采樣收集更廣的空間上下文，解碼器透過跳躍連接將其與早期特徵圖結合。"
  ],
  "Microrobot vision results": [
    "微型机器人视觉结果",
    "微型機器人視覺結果"
  ],
  "Microrobot Pose & Depth": [
    "微型机器人姿态与深度",
    "微型機器人姿態與深度"
  ],
  "Explore real microscope images and the regions a ResNet34 model responds to when estimating orientation and depth.": [
    "探索真实显微图像，以及 ResNet34 在估计方向与深度时响应的区域。",
    "探索真實顯微影像，以及 ResNet34 在估計方向與深度時響應的區域。"
  ],
  "Microrobot prediction task": [
    "微型机器人预测任务",
    "微型機器人預測任務"
  ],
  "Pose classification": [
    "姿态分类",
    "姿態分類"
  ],
  "Depth estimation": [
    "深度估计",
    "深度估計"
  ],
  "Compare tasks": [
    "比较任务",
    "比較任務"
  ],
  "Microrobot sample": [
    "微型机器人样本",
    "微型機器人樣本"
  ],
  "Sample {0}": [
    "样本 {0}",
    "樣本 {0}"
  ],
  "Heatmap blend": [
    "热图混合",
    "熱圖混合"
  ],
  "Same-input attribution comparison": [
    "同一输入的归因比较",
    "同一輸入的歸因比較"
  ],
  "One microscope image, two prediction targets": [
    "一张显微图像，两个预测目标",
    "一張顯微影像，兩個預測目標"
  ],
  "The same input is shown for both separately trained ResNet34 models. Move the shared blend slider to compare where their recorded positive Grad-CAM responses appear.": [
    "两种分别训练的 ResNet34 模型使用相同输入。移动共享混合滑块，比较已记录的正 Grad-CAM 响应出现的位置。",
    "兩種分別訓練的 ResNet34 模型使用相同輸入。移動共用混合滑桿，比較已記錄的正 Grad-CAM 回應出現的位置。"
  ],
  "两种分别训练的 ResNet34 模型使用相同输入。移动共享混合滑块，比较已记录的正 Grad-CAM 响应出现的位置。": [
    "两种分别训练的 ResNet34 模型使用相同输入。移动共享混合滑块，比较已记录的正 Grad-CAM 响应出现的位置。",
    "兩種分別訓練的 ResNet34 模型使用相同輸入。移動共用混合滑桿，比較已記錄的正 Grad-CAM 回應出現的位置。"
  ],
  "兩種分別訓練的 ResNet34 模型使用相同輸入。移動共用混合滑桿，比較已記錄的正 Grad-CAM 回應出現的位置。": [
    "两种分别训练的 ResNet34 模型使用相同输入。移动共享混合滑块，比较已记录的正 Grad-CAM 响应出现的位置。",
    "兩種分別訓練的 ResNet34 模型使用相同輸入。移動共用混合滑桿，比較已記錄的正 Grad-CAM 回應出現的位置。"
  ],
  "Shared microscope image, sample {0}": [
    "共同显微图像，样本 {0}",
    "共同顯微影像，樣本 {0}"
  ],
  "Shared input": [
    "共同输入",
    "共同輸入"
  ],
  "{0} attribution overlay, sample {1}": [
    "{0} 归因叠加，样本 {1}",
    "{0} 歸因疊加，樣本 {1}"
  ],
  "Pose-class response": [
    "姿态类别响应",
    "姿態類別回應"
  ],
  "Depth-output response": [
    "深度输出响应",
    "深度輸出回應"
  ],
  "POSE MODEL": [
    "姿态模型",
    "姿態模型"
  ],
  "Predicted class score": [
    "预测类别得分",
    "預測類別分數"
  ],
  "Gradients target the selected class output in the final residual block.": [
    "梯度针对最终残差块中所选类别的输出。",
    "梯度針對最終殘差區塊中所選類別的輸出。"
  ],
  "Label / prediction": [
    "标签／预测",
    "標籤／預測"
  ],
  "pitch": [
    "俯仰",
    "俯仰"
  ],
  "roll": [
    "横滚",
    "滾轉"
  ],
  "DEPTH MODEL": [
    "深度模型",
    "深度模型"
  ],
  "Scalar depth output": [
    "标量深度输出",
    "純量深度輸出"
  ],
  "Gradients target the regression output in the final residual block.": [
    "梯度针对最终残差块中的回归输出。",
    "梯度針對最終殘差區塊中的迴歸輸出。"
  ],
  "Recorded target": [
    "记录的目标值",
    "記錄的目標值"
  ],
  "Normalised depth; no numerical prediction in this saved panel.": [
    "归一化深度；保存的图中没有数值预测。",
    "正規化深度；已儲存的圖中沒有數值預測。"
  ],
  "Why is the depth map blue?": [
    "为什么深度图为蓝色？",
    "為什麼深度圖為藍色？"
  ],
  "Read location, not confidence": [
    "观察位置，而非置信度",
    "觀察位置，而非信心值"
  ],
  "The saved depth response is zero after positive clipping at this layer. This does not establish zero prediction error, zero gradients everywhere, or an unusable model.": [
    "该层保存的深度响应在截去负值后为零。这并不说明预测误差为零、所有梯度均为零或模型不可用。",
    "該層已儲存的深度回應在截去負值後為零。這並不表示預測誤差為零、所有梯度均為零或模型不可用。"
  ],
  "Each positive heatmap is divided by its own maximum. Equally warm colours across models do not represent equal confidence or equal attribution magnitude.": [
    "每张正响应热图都除以自身的最大值。不同模型中同样暖的颜色不代表相同置信度或相同归因幅度。",
    "每張正回應熱圖都除以自身的最大值。不同模型中同樣暖的顏色不代表相同信心值或相同歸因幅度。"
  ],
  "Both maps use the final ResNet34 residual block and the same microscope image, so you can compare which locations each task emphasises.": [
    "两张图使用 ResNet34 最后的残差块和同一张显微图像，可以比较两种任务强调的位置。",
    "兩張圖使用 ResNet34 最後的殘差區塊和同一張顯微影像，可以比較兩種任務強調的位置。"
  ],
  "两张图使用 ResNet34 最后的残差块和同一张显微图像，可以比较两种任务强调的位置。": [
    "两张图使用 ResNet34 最后的残差块和同一张显微图像，可以比较两种任务强调的位置。",
    "兩張圖使用 ResNet34 最後的殘差區塊和同一張顯微影像，可以比較兩種任務強調的位置。"
  ],
  "兩張圖使用 ResNet34 最後的殘差區塊和同一張顯微影像，可以比較兩種任務強調的位置。": [
    "两张图使用 ResNet34 最后的残差块和同一张显微图像，可以比较两种任务强调的位置。",
    "兩張圖使用 ResNet34 最後的殘差區塊和同一張顯微影像，可以比較兩種任務強調的位置。"
  ],
  "Microscopy image for sample {0}": [
    "样本 {0} 的显微图像",
    "樣本 {0} 的顯微影像"
  ],
  "Microscope image": [
    "显微图像",
    "顯微影像"
  ],
  "{0} Grad-CAM map for sample {1}": [
    "样本 {1} 的 {0} Grad-CAM 图",
    "樣本 {1} 的 {0} Grad-CAM 圖"
  ],
  "Model response · Grad-CAM": [
    "模型响应 · Grad-CAM",
    "模型響應 · Grad-CAM"
  ],
  "Sample {0} with adjustable model response overlay": [
    "样本 {0}，可调节模型响应叠加",
    "樣本 {0}，可調節模型響應疊加"
  ],
  "Adjustable overlay": [
    "可调节叠加",
    "可調節疊加"
  ],
  "Labelled orientation": [
    "标注方向",
    "標註方向"
  ],
  "° pitch ·": [
    "° 俯仰 ·",
    "° 俯仰 ·"
  ],
  "° roll": [
    "° 横滚",
    "° 滾轉"
  ],
  "Predicted orientation": [
    "预测方向",
    "預測方向"
  ],
  "POSE CLASS": [
    "姿态类别",
    "姿態類別"
  ],
  "Labelled depth": [
    "标注深度",
    "標註深度"
  ],
  "· normalised": [
    "· 归一化",
    "· 正規化"
  ],
  "The regression model uses image texture and diffraction rings to estimate depth. This view shows its response for the selected image.": [
    "回归模型利用图像纹理与衍射环估计深度。这个视图展示所选图像对应的模型响应。",
    "迴歸模型利用影像紋理與衍射環估計深度。這個視圖展示所選影像對應的模型響應。"
  ],
  "Warmer regions show stronger positive Grad-CAM response, scaled within each example.": [
    "暖色区域表示较强的正 Grad-CAM 响应；各样本独立缩放。",
    "暖色區域表示較強的正 Grad-CAM 響應；各樣本獨立縮放。"
  ],
  "This depth example has zero positive response in the selected layer.": [
    "这个深度样本在所选层中的正响应为零。",
    "這個深度樣本在所選層中的正響應為零。"
  ],
  "How to interpret the results": [
    "如何理解结果",
    "如何理解結果"
  ],
  "These are recorded ResNet34 microscope inputs and computed Grad-CAM outputs. The three pose examples have matching labelled and predicted classes. The saved depth panels provide target labels without numerical predictions, so this viewer does not infer a depth error from the heatmap.": [
    "这些是记录的 ResNet34 显微输入和计算得到的 Grad-CAM 输出。三个姿态样本的标注与预测类别一致。保存的深度图仅提供目标标签，没有数值预测，因此不能从热图推断深度误差。",
    "這些是記錄的 ResNet34 顯微輸入和計算得到的 Grad-CAM 輸出。三個姿態樣本的標註與預測類別一致。保存的深度圖僅提供目標標籤，沒有數值預測，因此不能從熱圖推斷深度誤差。"
  ],
  "The final-run accuracy used a random frame split and test-monitored epoch selection. Adjacent frames may cross the split. Open the visual benchmark for the recorded run comparison, or the sequence-split experiment to see how holding out whole recordings changes the unit of evaluation.": [
    "最终实验准确率使用随机帧划分，并根据测试表现选择训练轮次，相邻帧可能被分到不同集合。查看模型比较，或在序列划分实验中观察完整保留一段录制如何改变评估单位。",
    "最終實驗準確率使用隨機影格劃分，並根據測試表現選擇訓練輪次，相鄰影格可能被分到不同集合。查看模型比較，或在序列劃分實驗中觀察完整保留一段錄製如何改變評估單位。"
  ],
  "Explore more microscope images": [
    "探索更多显微图像",
    "探索更多顯微影像"
  ],
  "Microrobot at {0} degrees pitch and {1} degrees roll": [
    "微型机器人，俯仰 {0} 度，横滚 {1} 度",
    "微型機器人，俯仰 {0} 度，滾轉 {1} 度"
  ],
  "Autoregressive rollout experiment": [
    "自回归递推实验",
    "自迴歸遞推實驗"
  ],
  "CFD / Rollout mechanics": [
    "CFD / 递推原理",
    "CFD / 遞推原理"
  ],
  "One-step error can compound.": [
    "单步误差会逐渐累积。",
    "單步誤差會逐漸累積。"
  ],
  "Predicting many future flow fields means feeding each estimate into the next step. Change the feedback strength to see how small errors accumulate.": [
    "预测许多个未来流场时，每次估计都会成为下一步输入。改变反馈强度，观察小误差如何累积。",
    "預測許多個未來流場時，每次估計都會成為下一步輸入。改變反饋強度，觀察小誤差如何累積。"
  ],
  "Error amplification ·": [
    "误差放大系数 ·",
    "誤差放大係數 ·"
  ],
  "Rollout length ·": [
    "递推长度 ·",
    "遞推長度 ·"
  ],
  "steps": [
    "步",
    "步"
  ],
  "Feed predictions forward": [
    "将预测继续传入下一步",
    "將預測繼續傳入下一步"
  ],
  "Reset input error each step": [
    "每一步重置输入误差",
    "每一步重置輸入誤差"
  ],
  "Fresh error per step": [
    "每一步新增误差",
    "每一步新增誤差"
  ],
  "Final error": [
    "最终误差",
    "最終誤差"
  ],
  "Relative to one step": [
    "相对于单步",
    "相對於單步"
  ],
  "Error scale: 0–": [
    "误差范围：0–",
    "誤差範圍：0–"
  ],
  "Steps: 0–": [
    "步数：0–",
    "步數：0–"
  ],
  "Calculated error grows from 0 to {0} over {1} steps": [
    "计算误差在 {1} 步内从 0 增至 {0}",
    "計算誤差在 {1} 步內從 0 增至 {0}"
  ],
  "At 20 steps, gain 0.98 gives 0.1662, while 1.02 gives 0.2430. Both begin with the same 0.01 error.": [
    "经过 20 步，放大系数 0.98 得到 0.1662，1.02 则得到 0.2430；两者都从同样的 0.01 误差开始。",
    "經過 20 步，放大係數 0.98 得到 0.1662，1.02 則得到 0.2430；兩者都從同樣的 0.01 誤差開始。"
  ],
  "The graph network feeds each predicted field into the next step. This simplified recurrence shows how feedback changes error over time; field accuracy and physical consistency add further checks.": [
    "图网络将每个预测流场送入下一步。这个简化递推式展示反馈如何改变误差随时间的发展；流场准确性与物理一致性还需要进一步检查。",
    "圖網路將每個預測流場送入下一步。這個簡化遞推式展示反饋如何改變誤差隨時間的發展；流場準確性與物理一致性還需要進一步檢查。"
  ],
  "Frame and sequence split experiment": [
    "按帧与按序列划分实验",
    "按影格與按序列劃分實驗"
  ],
  "What is the independent observation?": [
    "什么才是独立观测？",
    "什麼才是獨立觀測？"
  ],
  "Split 24 fictional frames into equally sized training and test sets. Compare frame-level and sequence-level assignments.": [
    "将 24 个虚构帧分成等大的训练集和测试集，比较按单帧及按完整序列划分。",
    "將 24 個虛構影格分成等大的訓練集和測試集，比較按單影格及按完整序列劃分。"
  ],
  "Split individual frames": [
    "拆分单个帧",
    "拆分單個影格"
  ],
  "Hold out complete sequences": [
    "保留完整序列测试",
    "保留完整序列測試"
  ],
  "Training / test frames": [
    "训练 / 测试帧数",
    "訓練 / 測試影格數"
  ],
  "Sequences in both sets": [
    "两组共有的序列",
    "兩組共有的序列"
  ],
  "Held-out sequences": [
    "完整保留的测试序列",
    "完整保留的測試序列"
  ],
  "Each row is one fictional recording": [
    "每行代表一段虚构录制",
    "每行代表一段虛構錄製"
  ],
  "Sequence": [
    "序列",
    "序列"
  ],
  "Train": [
    "训练",
    "訓練"
  ],
  "Test": [
    "测试",
    "測試"
  ],
  "The test set contains three complete unseen sequences. Frame counts alone remain identical to the other split.": [
    "测试集包含三段完整、未见过的序列。仅看帧数，与另一种划分完全相同。",
    "測試集包含三段完整、未見過的序列。僅看影格數，與另一種劃分完全相同。"
  ],
  "Every test frame shares a source sequence with training frames. Correlated images can make a held-out frame easier than an unseen experimental sequence.": [
    "每个测试帧都与某些训练帧来自同一序列。图像相关性会使保留帧比一段全新实验序列更容易预测。",
    "每個測試影格都與某些訓練影格來自同一序列。影像相關性會使保留影格比一段全新實驗序列更容易預測。"
  ],
  "The microrobot models were evaluated with individual images split between training and testing. Nearby frames can look very similar. This fictional example shows why testing on complete unseen recordings would give a stronger check of performance in a new experiment.": [
    "微型机器人模型原本按单张图像划分训练和测试，相邻帧可能非常相似。这个虚构示例说明：在完整的新录制序列上测试，更能检验新实验中的表现。",
    "微型機器人模型原本按單張影像劃分訓練和測試，相鄰影格可能非常相似。這個虛構示例說明：在完整的新錄製序列上測試，更能檢驗新實驗中的表現。"
  ],
  "Spectral matching order experiment": [
    "谱线匹配顺序实验",
    "譜線匹配順序實驗"
  ],
  "Molecular recognition / matching assumptions": [
    "分子识别 / 匹配假设",
    "分子識別 / 匹配假設"
  ],
  "A lower residual can hide a missing line.": [
    "较低残差可能掩盖遗漏的谱线。",
    "較低殘差可能掩蓋遺漏的譜線。"
  ],
  "Assign each prediction to its nearest unused observation. Reverse the prediction order and inspect both coverage and residual.": [
    "将每个预测分配给最近且尚未使用的观测。反转预测顺序，同时检查覆盖率和残差。",
    "將每個預測分配給最近且尚未使用的觀測。反轉預測順序，同時檢查覆蓋率和殘差。"
  ],
  "Tolerance ·": [
    "容差 ·",
    "容差 ·"
  ],
  "kHz": [
    "kHz",
    "kHz"
  ],
  "Reverse prediction order": [
    "反转预测顺序",
    "反轉預測順序"
  ],
  "Assigned lines": [
    "已分配谱线",
    "已分配譜線"
  ],
  "Matched-line RMS": [
    "匹配谱线 RMS",
    "匹配譜線 RMS"
  ],
  "Unused observations": [
    "未使用观测",
    "未使用觀測"
  ],
  "Observed lines: 2000.000 and 2000.070 MHz": [
    "观测谱线：2000.000 和 2000.070 MHz",
    "觀測譜線：2000.000 和 2000.070 MHz"
  ],
  "Prediction order": [
    "预测顺序",
    "預測順序"
  ],
  "Assigned observation": [
    "分配的观测",
    "分配的觀測"
  ],
  "Observed − predicted": [
    "观测 − 预测",
    "觀測 − 預測"
  ],
  "Unassigned": [
    "未分配",
    "未分配"
  ],
  "{0} kHz": [
    "{0} kHz",
    "{0} kHz"
  ],
  "At 61 kHz, the first ordering keeps one match with 10 kHz RMS. Reversing it keeps both with 47.43 kHz RMS. An assignment assessment needs match coverage, tolerance and residual together.": [
    "在 61 kHz 容差下，第一种顺序保留一个匹配，RMS 为 10 kHz；反转后保留两个匹配，RMS 为 47.43 kHz。评估分配必须同时考虑匹配覆盖、容差和残差。",
    "在 61 kHz 容差下，第一種順序保留一個匹配，RMS 為 10 kHz；反轉後保留兩個匹配，RMS 為 47.43 kHz。評估分配必須同時考慮匹配覆蓋、容差和殘差。"
  ],
  "This two-line synthetic counterexample examines the ordered nearest-unused matching rule used in the workbench. A global assignment would consider all pairings together.": [
    "这个两谱线合成反例检验工作台使用的顺序式最近未用匹配规则。全局分配方法则会同时考虑所有配对。",
    "這個兩譜線合成反例檢驗工作臺使用的順序式最近未用匹配規則。全局分配方法則會同時考慮所有配對。"
  ],
  "Fourier Neural Operator": [
    "傅里叶神经算子",
    "傅里葉神經算子"
  ],
  "FNO": [
    "FNO",
    "FNO"
  ],
  "The width-36 baseline combines three spectral blocks with a local pointwise path.": [
    "宽度为 36 的基线模型结合三个频谱模块与局部逐点路径。",
    "寬度為 36 的基線模型結合三個頻譜模組與局部逐點路徑。"
  ],
  "GNN": [
    "GNN",
    "GNN"
  ],
  "Ten residual processors exchange information along the original mesh edges.": [
    "十个残差处理模块沿原始网格边交换信息。",
    "十個殘差處理模組沿原始網格邊交換資訊。"
  ],
  "U-Net baseline": [
    "U-Net 基线",
    "U-Net 基線"
  ],
  "This shifted set tests unfamiliar flow conditions, so its score cannot directly rank the model against the other runs.": [
    "这个分布变化数据集测试陌生流动条件，因此分数不能直接用于与其他实验排名比较。",
    "這個分佈變化資料集測試陌生流動條件，因此分數不能直接用於與其他實驗排名比較。"
  ],
  "Ground truth": [
    "真实图像",
    "真實影像"
  ],
  "Absolute error": [
    "绝对误差",
    "絕對誤差"
  ],
  "Snapshot 01": [
    "快照 01",
    "快照 01"
  ],
  "Snapshot 02": [
    "快照 02",
    "快照 02"
  ],
  "Snapshot 03": [
    "快照 03",
    "快照 03"
  ],
  "{0} {1} flow-field illustration with {2} overlay": [
    "{0} {1} 流场示意图，叠加 {2}",
    "{0} {1} 流場示意圖，疊加 {2}"
  ],
  "MAX": [
    "最大",
    "最大"
  ],
  "MIN": [
    "最小",
    "最小"
  ],
  "FlowBench 7": [
    "FlowBench 7",
    "FlowBench 7"
  ],
  "CFD Surrogate Model Workbench": [
    "CFD 替代模型工作台",
    "CFD 替代模型工作臺"
  ],
  "Illustrative result view": [
    "结果示意视图",
    "結果示意視圖"
  ],
  "Explore the recorded prediction errors and the flow representations used by three neural models.": [
    "探索三种神经模型记录的预测误差，以及它们使用的流场表示。",
    "探索三種神經模型記錄的預測誤差，以及它們使用的流場表示。"
  ],
  "Switch model, field view, frame and grid-or-mesh overlay.": [
    "切换模型、场视图、帧以及网格或网格化覆盖层。",
    "切換模型、場檢視、幀以及網格或網格化覆蓋層。"
  ],
  "The selected model changes the recorded metric and illustrative field view. The next tab contains actual saved flow frames.": [
    "所选模型会改变记录指标和示意流场。下一页包含实际保存的流场帧。",
    "所選模型會改變記錄指標和示意流場。下一頁包含實際保存的流場影格。"
  ],
  "Recorded relative L2 · evaluation splits differ": [
    "记录的相对 L2 误差 · 各评估集不同",
    "記錄的相對 L2 誤差 · 各評估集不同"
  ],
  "Recorded benchmark values": [
    "记录的评估数值",
    "記錄的評估數值"
  ],
  "The field drawing illustrates the view controls. The numerical results below are recorded evaluations; use flow playback to inspect the actual saved fields.": [
    "流场绘图用于说明视图控件。下方数值来自记录的评估；实际保存的流场可在播放页查看。",
    "流場繪圖用於說明視圖控件。下方數值來自記錄的評估；實際保存的流場可在播放頁查看。"
  ],
  "Separate runs and evaluation splits": [
    "各自的实验与评估划分",
    "各自的實驗與評估劃分"
  ],
  "FNO and MeshGraphNet report sets that were also checked during training. U-Net uses a separate 20-file set with different flow statistics. Read each score in those conditions rather than as a common ranking.": [
    "FNO 和 MeshGraphNet 报告的评估集在训练中也被检查。U-Net 使用单独的 20 文件数据集，其流动统计特征不同。请结合各自条件理解分数，不能视为共同排名。",
    "FNO 和 MeshGraphNet 報告的評估集在訓練中也被檢查。U-Net 使用單獨的 20 文件資料集，其流動統計特徵不同。請結合各自條件理解分數，不能視為共同排名。"
  ],
  "Surrogate model": [
    "替代模型",
    "替代模型"
  ],
  "MODEL FAMILY": [
    "模型系列",
    "模型系列"
  ],
  "03 candidates": [
    "03 个候选模型",
    "03 個候選模型"
  ],
  "Flow-field channel": [
    "流场通道",
    "流場通道"
  ],
  "Topology overlay": [
    "拓扑叠加",
    "拓撲疊加"
  ],
  "▦ Grid": [
    "▦ 栅格",
    "▦ 柵格"
  ],
  "△ Mesh": [
    "△ 网格",
    "△ 網格"
  ],
  "Illustrative field view": [
    "流场示意视图",
    "流場示意視圖"
  ],
  "Illustration step": [
    "示意步骤",
    "示意步驟"
  ],
  "of 03": [
    "，共 03 步",
    "，共 03 步"
  ],
  "Next snapshot →": [
    "下一快照 →",
    "下一快照 →"
  ],
  "{0} evaluation summary": [
    "{0} 评估概要",
    "{0} 評估概要"
  ],
  "Recorded relative L2": [
    "记录的相对 L2 误差",
    "記錄的相對 L2 誤差"
  ],
  "Architecture": [
    "架构",
    "架構"
  ],
  "Readout": [
    "读数",
    "讀數"
  ],
  "Recorded relative L2 values and their separate evaluation runs": [
    "记录的相对 L2 误差及各自的评估实验",
    "記錄的相對 L2 誤差及各自的評估實驗"
  ],
  "SimpleCNN + skips": [
    "SimpleCNN + 跳跃连接",
    "SimpleCNN + 跳躍連接"
  ],
  "Pose": [
    "姿态",
    "姿態"
  ],
  "Depth": [
    "深度",
    "深度"
  ],
  "Grad-CAM style": [
    "Grad-CAM 风格",
    "Grad-CAM 風格"
  ],
  "Frame A": [
    "帧 A",
    "影格 A"
  ],
  "Frame B": [
    "帧 B",
    "影格 B"
  ],
  "Frame C": [
    "帧 C",
    "影格 C"
  ],
  "Illustrative view": [
    "示意视图",
    "示意視圖"
  ],
  "Microrobot Pose & Depth Bench": [
    "微型机器人姿态与深度基准台",
    "微型機器人姿態與深度基準臺"
  ],
  "Compare how five image models estimate a microrobot’s orientation and depth.": [
    "比较五种图像模型如何估计微型机器人的方向与深度。",
    "比較五種影像模型如何估計微型機器人的方向與深度。"
  ],
  "Switch task and model, then move through the illustrative views to inspect the type of prediction.": [
    "切换任务和模型，再逐个查看示意视图，了解各类预测。",
    "切換任務和模型，再逐個查看示意視圖，瞭解各類預測。"
  ],
  "The metric, error treatment and output overlay change by task; the images are illustrative and no model runs in the browser.": [
    "指标、误差处理与输出叠加会随任务变化；图像仅作示意，浏览器中不会运行模型。",
    "指標、誤差處理與輸出疊加會隨任務變化；影像僅作示意，瀏覽器中不會執行模型。"
  ],
  "2,002 microscopy frames · 40 orientation classes": [
    "2,002 个显微图像帧 · 40 个方向类别",
    "2,002 個顯微影像影格 · 40 個方向類別"
  ],
  "Illustrative comparison · recorded images in the microscopy tab": [
    "示意比较 · 真实记录图像见显微图像页",
    "示意比較 · 真實記錄影像見顯微影像頁"
  ],
  "Important split limitation": [
    "重要的数据划分限制",
    "重要的資料劃分限制"
  ],
  "Related frames may appear in both training and testing, and the final run used test performance to select its training epoch. New recordings and microscope setups are still needed to check generalisation.": [
    "相关帧可能同时出现在训练和测试中；最终实验也使用测试表现选择训练轮次。仍需新的录制与显微镜设置，才能检查泛化表现。",
    "相關影格可能同時出現在訓練和測試中；最終實驗也使用測試表現選擇訓練輪次。仍需新的錄製與顯微鏡設置，才能檢查泛化表現。"
  ],
  "MODEL": [
    "模型",
    "模型"
  ],
  "BENCHMARK": [
    "基准任务",
    "基準任務"
  ],
  "Depth regression": [
    "深度回归",
    "深度迴歸"
  ],
  "Illustrative sample": [
    "示意样本",
    "示意樣本"
  ],
  "Microrobot analysis view": [
    "微型机器人分析视图",
    "微型機器人分析視圖"
  ],
  "ROBOT 8 /": [
    "机器人 8 /",
    "機器人 8 /"
  ],
  "POSE LABEL": [
    "姿态标签",
    "姿態標籤"
  ],
  "Pitch": [
    "俯仰",
    "俯仰"
  ],
  "· Roll": [
    "· 横滚",
    "· 滾轉"
  ],
  "Illustrative class overlay": [
    "示意性类别叠加层",
    "示意性類別疊加層"
  ],
  "Normalised depth": [
    "归一化深度",
    "正規化深度"
  ],
  "Illustrative depth overlay": [
    "示意性深度叠加层",
    "示意性深度疊加層"
  ],
  "Interpretability view": [
    "可解释性视图",
    "可解釋性視圖"
  ],
  "Body contours + edge fringes": [
    "主体轮廓与边缘响应",
    "主體輪廓與邊緣響應"
  ],
  "Grad-CAM-style illustration—not a computed activation map": [
    "Grad-CAM 风格示意图，并非实际计算的激活图",
    "Grad-CAM 風格示意圖，並非實際計算的啟用圖"
  ],
  "reported comparison result": [
    "报告中的比较结果",
    "報告中的比較結果"
  ],
  "normalised held-out error": [
    "归一化留出集误差",
    "歸一化留出集誤差"
  ],
  "Pose accuracy": [
    "姿态准确率",
    "姿態準確率"
  ],
  "Depth RMSE": [
    "深度 RMSE",
    "深度 RMSE"
  ],
  "Initialisation": [
    "初始化方式",
    "初始化方式"
  ],
  "The five-model comparison is shown here. A later final run reused test results for model selection, so it does not establish performance on new recordings.": [
    "这里展示五模型比较。后来的最终实验将测试结果用于模型选择，因此不能证明模型对新录制数据的表现。",
    "這裡展示五模型比較。後來的最終實驗將測試結果用於模型選擇，因此不能證明模型對新錄製資料的表現。"
  ],
  "Five-model benchmark comparison": [
    "五模型评估比较",
    "五模型評估比較"
  ],
  "ARCHITECTURE": [
    "架构",
    "架構"
  ],
  "POSE": [
    "姿态",
    "姿態"
  ],
  "DEPTH RMSE": [
    "深度 RMSE",
    "深度 RMSE"
  ],
  "PARAMS": [
    "参数量",
    "參數量"
  ],
  "Fifteen-bin reliability diagram {0} temperature scaling": [
    "温度缩放{0}的十五区间可靠性图",
    "溫度縮放{0}的十五區間可靠性圖"
  ],
  "Mean confidence": [
    "平均置信度",
    "平均信心值"
  ],
  "Observed rate": [
    "观测比例",
    "觀測比例"
  ],
  "ideal": [
    "理想值",
    "理想值"
  ],
  "bins": [
    "个区间",
    "個區間"
  ],
  "Reliability Laboratory": [
    "可靠性实验室",
    "可靠性實驗室"
  ],
  "Calibration & Conformal Explorer": [
    "校准与共形预测探索",
    "校準與共形預測探索"
  ],
  "Executed results": [
    "实验结果",
    "實驗結果"
  ],
  "Show why a confident scientific model can still be unreliable, and how calibration and conformal sets expose that gap.": [
    "展示为何高置信度的科学模型仍可能不可靠，以及校准与保形预测集如何揭示这一差距。",
    "展示為何高置信度的科學模型仍可能不可靠，以及校準與保形預測集如何揭示這一差距。"
  ],
  "Compare saved calibration results, then move the population in the synthetic coverage experiment.": [
    "比较记录的校准结果，再在合成覆盖率实验中移动总体分布。",
    "比較記錄的校準結果，再在合成覆蓋率實驗中移動總體分佈。"
  ],
  "The recorded calibration trade-off stays visible. The separate shift experiment recomputes interval membership for forty outcomes.": [
    "记录的校准取舍保持可见；独立的分布变化实验会重新计算四十个结果是否落在区间内。",
    "記錄的校準取捨保持可見；獨立的分佈變化實驗會重新計算四十個結果是否落在區間內。"
  ],
  "Temperature T = 0.9434 · 15 calibration bins": [
    "温度 T = 0.9434 · 15 个校准区间",
    "溫度 T = 0.9434 · 15 個校準區間"
  ],
  "Saved test outputs · lower is better for ECE, Brier, NLL": [
    "记录的测试输出 · ECE、Brier、NLL 越低越好",
    "記錄的測試輸出 · ECE、Brier、NLL 越低越好"
  ],
  "Results preserved with their trade-offs": [
    "理解结果与取舍",
    "理解結果與取捨"
  ],
  "The calibration panels read fixed results from the executed safety coursework. The separate synthetic shift experiment below recomputes interval membership in the browser. Split-conformal coverage relies on exchangeable calibration and test observations; population changes can reduce that coverage.": [
    "校准面板使用安全课程实验的固定结果。下方独立的合成分布变化实验会在浏览器中重新计算区间覆盖。分割共形预测的覆盖保证依赖校准与测试观测的可交换性；总体变化可能降低覆盖率。",
    "校準面板使用安全課程實驗的固定結果。下方獨立的合成分佈變化實驗會在瀏覽器中重新計算區間覆蓋。分割共形預測的覆蓋保證依賴校準與測試觀測的可交換性；總體變化可能降低覆蓋率。"
  ],
  "Probability quality": [
    "概率质量",
    "概率質量"
  ],
  "Reliability diagram": [
    "可靠性图",
    "可靠性圖"
  ],
  "Temperature scaling state": [
    "温度缩放状态",
    "溫度縮放狀態"
  ],
  "Before": [
    "之前",
    "之前"
  ],
  "After": [
    "之后",
    "之後"
  ],
  "ECE": [
    "ECE",
    "ECE"
  ],
  "improved ↓": [
    "改善 ↓",
    "改善 ↓"
  ],
  "baseline": [
    "基线",
    "基線"
  ],
  "BRIER": [
    "Brier 分数",
    "Brier 分數"
  ],
  "improved slightly ↓": [
    "略有改善 ↓",
    "略有改善 ↓"
  ],
  "NLL": [
    "NLL",
    "NLL"
  ],
  "worsened slightly ↑": [
    "略有变差 ↑",
    "略有變差 ↑"
  ],
  "Recorded result:": [
    "记录结果：",
    "記錄結果："
  ],
  "ECE and Brier improved marginally, while test NLL moved from 0.547396 to 0.547561 (+0.000165).": [
    "ECE 与 Brier 略有改善，而测试 NLL 从 0.547396 增至 0.547561（+0.000165）。",
    "ECE 與 Brier 略有改善，而測試 NLL 從 0.547396 增至 0.547561（+0.000165）。"
  ],
  "Uncertainty sets": [
    "不确定性集合",
    "不確定性集合"
  ],
  "Coverage vs. width": [
    "覆盖率与宽度",
    "覆蓋率與寬度"
  ],
  "Split conformal": [
    "分割共形预测",
    "分割共形預測"
  ],
  "Target coverage": [
    "目标覆盖率",
    "目標覆蓋率"
  ],
  "{0}% target coverage": [
    "{0}% 目标覆盖率",
    "{0}% 目標覆蓋率"
  ],
  "Empirical coverage": [
    "经验覆盖率",
    "經驗覆蓋率"
  ],
  "pp vs target": [
    "个百分点，相对于目标",
    "個百分點，相對於目標"
  ],
  "Average width": [
    "平均宽度",
    "平均寬度"
  ],
  "full interval width": [
    "完整区间宽度",
    "完整區間寬度"
  ],
  "Average conformal interval width {0} at {1}% target coverage": [
    "目标覆盖率 {1}% 时，共形区间平均宽度为 {0}",
    "目標覆蓋率 {1}% 時，共形區間平均寬度為 {0}"
  ],
  "narrower": [
    "较窄",
    "較窄"
  ],
  "wider": [
    "较宽",
    "較寬"
  ],
  "Higher requested coverage admits a wider band around each point prediction.": [
    "目标覆盖率越高，每个点预测周围所需的区间越宽。",
    "目標覆蓋率越高，每個點預測周圍所需的區間越寬。"
  ],
  "Saved coverage sweep": [
    "记录的覆盖率比较",
    "記錄的覆蓋率比較"
  ],
  "Target": [
    "目标",
    "目標"
  ],
  "Observed": [
    "观测值",
    "觀測值"
  ],
  "Width": [
    "宽度",
    "寬度"
  ],
  "Select {0}% target coverage": [
    "选择 {0}% 目标覆盖率",
    "選擇 {0}% 目標覆蓋率"
  ],
  "· test-set empirical estimate": [
    "· 测试集经验估计",
    "· 測試集經驗估計"
  ],
  "spatial ⇄ spectral": [
    "空间域 ⇄ 频谱域",
    "空間域 ⇄ 頻譜域"
  ],
  "native mesh messages": [
    "原始网格消息",
    "原始網格訊息"
  ],
  "raster encoder–decoder": [
    "栅格编码器—解码器",
    "柵格編碼器—解碼器"
  ],
  "Regular grid → Fourier modes → flow fields": [
    "规则网格 → 傅里叶模式 → 流场",
    "規則網格 → 傅里葉模式 → 流場"
  ],
  "Mix information across the grid with three spectral blocks": [
    "通过三个频谱模块混合网格中的信息",
    "透過三個頻譜模組混合網格中的資訊"
  ],
  "3 physical channels": [
    "3 个物理通道",
    "3 個物理通道"
  ],
  "3 spectral + pointwise blocks": [
    "3 个频谱与逐点模块",
    "3 個頻譜與逐點模組"
  ],
  "relative L2 0.0163": [
    "相对 L2 误差 0.0163",
    "相對 L2 誤差 0.0163"
  ],
  "Six input features with four spectral blocks": [
    "六个输入特征与四个频谱模块",
    "六個輸入特徵與四個頻譜模組"
  ],
  "Add input context, normalisation and a deeper output head": [
    "增加输入信息、归一化及更深的输出层",
    "增加輸入資訊、正規化及更深的輸出層"
  ],
  "6 input features": [
    "6 个输入特征",
    "6 個輸入特徵"
  ],
  "4 spectral + pointwise + LayerNorm blocks": [
    "4 个频谱、逐点与 LayerNorm 模块",
    "4 個頻譜、逐點與 LayerNorm 模組"
  ],
  "Evaluation result unavailable": [
    "暂无评估结果",
    "暫無評估結果"
  ],
  "Wider spectral blocks with residual connections": [
    "带残差连接的更宽频谱模块",
    "帶殘差連接的更寬頻譜模組"
  ],
  "Retain more Fourier modes and pass information through skip paths": [
    "保留更多傅里叶模式，通过跳跃路径传递信息",
    "保留更多傅里葉模式，透過跳躍路徑傳遞資訊"
  ],
  "6 = 3 physics + 3 auxiliary": [
    "6 = 3 个物理特征 + 3 个辅助特征",
    "6 = 3 個物理特徵 + 3 個輔助特徵"
  ],
  "5 spectral + pointwise + LayerNorm blocks": [
    "5 个频谱、逐点与 LayerNorm 模块",
    "5 個頻譜、逐點與 LayerNorm 模組"
  ],
  "relative L2 0.002549": [
    "相对 L2 误差 0.002549",
    "相對 L2 誤差 0.002549"
  ],
  "Three Fourier resolutions inside each block": [
    "每个模块使用三种傅里叶分辨率",
    "每個模組使用三種傅里葉解析度"
  ],
  "Combine broad flow structure with finer spatial detail": [
    "结合大范围流动结构与更精细的空间细节",
    "結合大範圍流動結構與更精細的空間細節"
  ],
  "3 fields + 3 grid coordinates": [
    "3 个流场 + 3 个网格坐标",
    "3 個流場 + 3 個網格座標"
  ],
  "4 multi-scale spectral + 1×1 skip blocks": [
    "4 个多尺度频谱与 1×1 跳跃模块",
    "4 個多尺度頻譜與 1×1 跳躍模組"
  ],
  "Design experiment · no recorded metric": [
    "设计实验 · 暂无记录指标",
    "設計實驗 · 暫無記錄指標"
  ],
  "Stem": [
    "初始层",
    "初始層"
  ],
  "Decoder 4": [
    "解码器 4",
    "解碼器 4"
  ],
  "Encoder 1": [
    "编码器 1",
    "編碼器 1"
  ],
  "Decoder 3": [
    "解码器 3",
    "解碼器 3"
  ],
  "Encoder 2": [
    "编码器 2",
    "編碼器 2"
  ],
  "Decoder 2": [
    "解码器 2",
    "解碼器 2"
  ],
  "Encoder 3": [
    "编码器 3",
    "編碼器 3"
  ],
  "Decoder 1": [
    "解码器 1",
    "解碼器 1"
  ],
  "Mix distant grid locations through frequency components; retained modes control the spatial and temporal detail.": [
    "通过频率分量混合远处网格位置的信息；保留的模式控制空间与时间细节。",
    "透過頻率分量混合遠處網格位置的資訊；保留的模式控制空間與時間細節。"
  ],
  "Keep the original mesh and pass information along its edges; processor depth expands the neighbourhood a node can use.": [
    "保留原始网格，沿边传递信息；处理模块越深，每个节点能使用的邻域越广。",
    "保留原始網格，沿邊傳遞資訊；處理模組越深，每個節點能使用的鄰域越廣。"
  ],
  "Combine a coarse view of the field with high-resolution features carried through skip connections.": [
    "通过跳跃连接，将粗尺度流场视图与高分辨率特征结合。",
    "透過跳躍連接，將粗尺度流場視圖與高解析度特徵結合。"
  ],
  "Check both single-step accuracy and repeated predictions, using flow conditions representative of the intended use.": [
    "使用符合实际用途的流动条件，同时检查单步准确性与重复预测。",
    "使用符合實際用途的流動條件，同時檢查單步準確性與重複預測。"
  ],
  "Lift": [
    "升维",
    "升維"
  ],
  "width {0}": [
    "宽度 {0}",
    "寬度 {0}"
  ],
  "Operator blocks": [
    "算子模块",
    "算子模組"
  ],
  "{0} · modes {1}": [
    "{0} · 模式 {1}",
    "{0} · 模式 {1}"
  ],
  "Projection": [
    "投影",
    "投影"
  ],
  "Model size": [
    "模型大小",
    "模型大小"
  ],
  "{0} parameters": [
    "{0} 个参数",
    "{0} 個參數"
  ],
  "Raw node": [
    "原始节点",
    "原始節點"
  ],
  "7 features per node": [
    "每个节点 7 个特征",
    "每個節點 7 個特徵"
  ],
  "Raw edge": [
    "原始边",
    "原始邊"
  ],
  "3 features per directed edge": [
    "每条有向边 3 个特征",
    "每條有向邊 3 個特徵"
  ],
  "Encoders": [
    "编码器",
    "編碼器"
  ],
  "node 7→10 · edge 3→10": [
    "节点 7→10 · 边 3→10",
    "節點 7→10 · 邊 3→10"
  ],
  "Processor {0}": [
    "处理模块 {0}",
    "處理模組 {0}"
  ],
  "latent width 10": [
    "隐藏特征宽度 10",
    "隱藏特徵寬度 10"
  ],
  "Processor stack": [
    "处理模块堆叠",
    "處理模組堆疊"
  ],
  "10 processors": [
    "10 个处理模块",
    "10 個處理模組"
  ],
  "Decoder": [
    "解码器",
    "解碼器"
  ],
  "Input + stem": [
    "输入与初始层",
    "輸入與初始層"
  ],
  "Encoder 4": [
    "编码器 4",
    "編碼器 4"
  ],
  "Bottleneck": [
    "瓶颈",
    "瓶頸"
  ],
  "Output": [
    "输出",
    "輸出"
  ],
  "40 classes": [
    "40 个类别",
    "40 個類別"
  ],
  "1 normalized depth": [
    "1 个归一化深度",
    "1 個正規化深度"
  ],
  "512 features": [
    "512 个特征",
    "512 個特徵"
  ],
  "1 depth value": [
    "1 个深度值",
    "1 個深度值"
  ],
  "1,024 features": [
    "1,024 个特征",
    "1,024 個特徵"
  ],
  "196 × 768 patches": [
    "196 × 768 图块",
    "196 × 768 圖塊"
  ],
  "197 × 768 tokens": [
    "197 × 768 标记",
    "197 × 768 標記"
  ],
  "768 features": [
    "768 个特征",
    "768 個特徵"
  ],
  "Five-block convolutional network": [
    "五模块卷积网络",
    "五模組卷積網路"
  ],
  "authored": [
    "自主构建",
    "自主構建"
  ],
  "CUSTOM MODEL · TRAINED FROM SCRATCH": [
    "自定义模型 · 从头训练",
    "自訂模型 · 從頭訓練"
  ],
  "Samuel’s custom CNN reduces 224→56→28→14→7, adds learned 1×1 skips where channels change, then combines the image into 512 features. The final layer changes for orientation or depth.": [
    "Samuel 的自定义 CNN 将分辨率逐步降低为 224→56→28→14→7，在通道变化处加入可学习的 1×1 跳跃连接，再将图像合成为 512 个特征。最后一层随方向或深度任务而改变。",
    "Samuel 的自訂 CNN 將解析度逐步降低為 224→56→28→14→7，在通道變化處加入可學習的 1×1 跳躍連接，再將影像合成為 512 個特徵。最後一層隨方向或深度任務而改變。"
  ],
  "18-layer residual network": [
    "18 层残差网络",
    "18 層殘差網路"
  ],
  "pretrained": [
    "预训练",
    "預訓練"
  ],
  "IMAGENET PRETRAINING · TASK ADAPTATION": [
    "ImageNet 预训练 · 任务适配",
    "ImageNet 預訓練 · 任務適配"
  ],
  "This adaptation starts from an ImageNet-pretrained ResNet18, replaces the colour-image input with a fresh grayscale stem, and learns a new orientation or depth head.": [
    "以 ImageNet 预训练的 ResNet18 为起点，用新的灰度初始层替换彩色图像输入，再学习新的方向或深度输出层。",
    "以 ImageNet 預訓練的 ResNet18 為起點，用新的灰度初始層替換彩色影像輸入，再學習新的方向或深度輸出層。"
  ],
  "34-layer residual network": [
    "34 层残差网络",
    "34 層殘差網路"
  ],
  "A deeper ImageNet-pretrained model combines residual stages [3,4,6,3] with a fresh grayscale stem and separate pose/depth heads. It was selected for precise estimation in the project.": [
    "更深的 ImageNet 预训练模型将 [3,4,6,3] 残差阶段与新的灰度初始层及独立姿态/深度输出层结合。项目将其选用于精确估计。",
    "更深的 ImageNet 預訓練模型將 [3,4,6,3] 殘差階段與新的灰度初始層及獨立姿態/深度輸出層結合。專案將其選用於精確估計。"
  ],
  "Inverted residual + squeeze/excitation": [
    "倒残差与压缩/激励",
    "倒殘差與壓縮/激勵"
  ],
  "The compact candidate uses inexpensive depthwise filters and channel attention. A fresh grayscale input layer and task-specific output adapt it to microscope images.": [
    "紧凑模型采用低成本逐通道滤波器和通道注意力，再通过新的灰度输入层及任务输出层适配显微图像。",
    "緊湊模型採用低成本逐通道濾波器和通道注意力，再透過新的灰度輸入層及任務輸出層適配顯微影像。"
  ],
  "16×16 patch transformer": [
    "16×16 图块 Transformer",
    "16×16 圖塊 Transformer"
  ],
  "The transformer compares information across 16×16 image patches. Averaging the pretrained colour-input weights adapts it to grayscale, and a new head estimates orientation or depth.": [
    "Transformer 比较 16×16 图像块之间的信息。将预训练彩色输入权重取平均以适配灰度图像，再由新的输出层估计方向或深度。",
    "Transformer 比較 16×16 影像塊之間的資訊。將預訓練彩色輸入權重取平均以適配灰度影像，再由新的輸出層估計方向或深度。"
  ],
  "ImageNet pretraining with a grayscale input and new pose head": [
    "ImageNet 预训练，配合灰度输入与新的姿态输出层",
    "ImageNet 預訓練，配合灰度輸入與新的姿態輸出層"
  ],
  "Compact inverted residual blocks and channel attention": [
    "紧凑倒残差模块与通道注意力",
    "緊湊倒殘差模組與通道注意力"
  ],
  "Custom CNN trained from scratch": [
    "从头训练的自定义 CNN",
    "從頭訓練的自訂 CNN"
  ],
  "Five convolutional blocks with four skip additions": [
    "五个卷积模块与四次跳跃相加",
    "五個卷積模組與四次跳躍相加"
  ],
  "Four residual stages with two basic blocks each": [
    "四个残差阶段，每阶段含两个基本模块",
    "四個殘差階段，每階段含兩個基本模組"
  ],
  "Deeper residual stages with block counts 3, 4, 6 and 3": [
    "更深的残差阶段，模块数量分别为 3、4、6、3",
    "更深的殘差階段，模組數量分別為 3、4、6、3"
  ],
  "ImageNet pretraining with averaged grayscale patch weights and a new head": [
    "ImageNet 预训练，采用平均灰度图块权重与新输出层",
    "ImageNet 預訓練，採用平均灰度圖塊權重與新輸出層"
  ],
  "Self-attention across 16×16 image patches": [
    "16×16 图像块之间的自注意力",
    "16×16 影像塊之間的自注意力"
  ],
  "Course model completed and adapted for flow prediction": [
    "完成课程模型，并适配流场预测",
    "完成課程模型，並適配流場預測"
  ],
  "Residual message passing on the original mesh": [
    "原始网格上的残差消息传递",
    "原始網格上的殘差訊息傳遞"
  ],
  "Course model completed with flow-processing and training work": [
    "完成课程模型、流场处理和训练工作",
    "完成課程模型、流場處理和訓練工作"
  ],
  "Global Fourier features combined with a local pointwise path": [
    "全局傅里叶特征与局部逐点路径结合",
    "全局傅里葉特徵與局部逐點路徑結合"
  ],
  "Custom feature and architecture adaptation": [
    "自定义特征与架构适配",
    "自訂特徵與架構適配"
  ],
  "Six input features and four width-36 spectral blocks": [
    "六个输入特征与四个宽度为 36 的频谱模块",
    "六個輸入特徵與四個寬度為 36 的頻譜模組"
  ],
  "Custom feature, normalisation and residual experiments": [
    "自定义特征、归一化与残差实验",
    "自訂特徵、正規化與殘差實驗"
  ],
  "Wider blocks and more retained Fourier modes": [
    "更宽的模块与更多保留的傅里叶模式",
    "更寬的模組與更多保留的傅里葉模式"
  ],
  "Coarse flow context joined to high-resolution skip features": [
    "将粗尺度流场上下文与高分辨率跳跃特征结合",
    "將粗尺度流場上下文與高解析度跳躍特徵結合"
  ],
  "Separate model used to evaluate reconstructed images": [
    "用于评估重建图像的独立模型",
    "用於評估重建影像的獨立模型"
  ],
  "Eight-class segmentation of the reconstructed anatomy": [
    "对重建解剖结构进行八类分割",
    "對重建解剖結構進行八類分割"
  ],
  "Custom reconstruction architecture trained from scratch": [
    "从头训练的自定义重建架构",
    "從頭訓練的自訂重建架構"
  ],
  "Residual reconstruction with three learnable consistency steps": [
    "残差重建与三个可学习一致性步骤",
    "殘差重建與三個可學習一致性步驟"
  ],
  "Spectral operator": [
    "频谱算子",
    "頻譜算子"
  ],
  "Structured grid": [
    "结构化网格",
    "結構化網格"
  ],
  "Recorded baseline evaluation": [
    "记录的基线评估",
    "記錄的基線評估"
  ],
  "Message passing": [
    "消息传递",
    "訊息傳遞"
  ],
  "Native mesh": [
    "原始网格",
    "原始網格"
  ],
  "Recorded 500-file evaluation": [
    "记录的 500 文件评估",
    "記錄的 500 文件評估"
  ],
  "Encoder–decoder": [
    "编码器—解码器",
    "編碼器—解碼器"
  ],
  "Rasterised grid": [
    "栅格化网格",
    "柵格化網格"
  ],
  "Shifted 20-file validation run": [
    "分布变化的 20 文件验证实验",
    "分佈變化的 20 文件驗證實驗"
  ],
  "Three SpectralConv3d scales → concatenate/fuse + Conv3d 1×1 skip → GroupNorm": [
    "三种 SpectralConv3d 尺度 → 拼接/融合 + Conv3d 1×1 跳跃连接 → GroupNorm",
    "三種 SpectralConv3d 尺度 → 拼接/融合 + Conv3d 1×1 跳躍連接 → GroupNorm"
  ],
  "SpectralConv3d + pointwise Conv1d → LayerNorm; GELU between blocks; residual every second block": [
    "SpectralConv3d + 逐点 Conv1d → LayerNorm；模块间使用 GELU；每隔一个模块添加残差",
    "SpectralConv3d + 逐點 Conv1d → LayerNorm；模組間使用 GELU；每隔一個模組添加殘差"
  ],
  "SpectralConv3d + pointwise Conv1d + LayerNorm": [
    "SpectralConv3d + 逐点 Conv1d + LayerNorm",
    "SpectralConv3d + 逐點 Conv1d + LayerNorm"
  ],
  "SpectralConv3d + pointwise Conv1d; ReLU after the first two blocks": [
    "SpectralConv3d + 逐点 Conv1d；前两个模块后使用 ReLU",
    "SpectralConv3d + 逐點 Conv1d；前兩個模組後使用 ReLU"
  ],
  "classification": [
    "姿态分类",
    "姿態分類"
  ],
  "depth": [
    "深度",
    "深度"
  ],
  "design": [
    "设计",
    "設計"
  ],
  "data": [
    "数据处理",
    "資料處理"
  ],
  "run": [
    "实验",
    "實驗"
  ],
  "selection": [
    "模型选择",
    "模型選擇"
  ],
  "release": [
    "交接",
    "交接"
  ],
  "all": [
    "全部",
    "全部"
  ],
  "DESIGN": [
    "设计",
    "設計"
  ],
  "DATA": [
    "数据",
    "資料"
  ],
  "EXPERIMENT": [
    "实验",
    "實驗"
  ],
  "SELECTION": [
    "模型选择",
    "模型選擇"
  ],
  "HANDOFF": [
    "交接",
    "交接"
  ],
  "DEVELOPMENT": [
    "设计演进",
    "設計演進"
  ],
  "RECONSTRUCTION": [
    "重建",
    "重建"
  ],
  "ground-truth": [
    "真值",
    "真值"
  ],
  "prediction": [
    "预测",
    "預測"
  ],
  "error": [
    "误差",
    "誤差"
  ],
  "grid": [
    "栅格",
    "柵格"
  ],
  "mesh": [
    "网格",
    "網格"
  ],
  "pose": [
    "姿态",
    "姿態"
  ],
  "before": [
    "之前",
    "之前"
  ],
  "after": [
    "之后",
    "之後"
  ],
  "predicted": [
    "预测",
    "預測"
  ],
  "simulation": [
    "模拟",
    "模擬"
  ],
  "· projection skip at entry": [
    " · 入口处使用投影跳跃连接",
    " · 入口處使用投影跳躍連接"
  ],
  "Selected tensor": [
    "所选张量",
    "所選張量"
  ],
  "{0} epochs · {1} · {2}": [
    "{0} 轮 · {1} · {2}",
    "{0} 輪 · {1} · {2}"
  ],
  "{0} params": [
    "{0} 个参数",
    "{0} 個參數"
  ],
  "{0} classification architecture": [
    "{0} 姿态分类架构",
    "{0} 姿態分類架構"
  ],
  "{0} depth architecture": [
    "{0} 深度架构",
    "{0} 深度架構"
  ],
  "{0} residual / skip stages": [
    "{0} 个残差 / 跳跃阶段",
    "{0} 個殘差 / 跳躍階段"
  ],
  "{0} aggregated stages": [
    "{0} 个汇总阶段",
    "{0} 個彙總階段"
  ],
  "Frame {0}": [
    "帧 {0}",
    "影格 {0}"
  ],
  "{0} nodes": [
    "{0} 个节点",
    "{0} 個節點"
  ],
  "first step": [
    "第一步",
    "第一步"
  ],
  "Custom experiments": [
    "自定义实验",
    "自訂實驗"
  ],
  "3 representations · velocity + pressure": [
    "3 种表示 · 速度与压力",
    "3 種表示 · 速度與壓力"
  ],
  "Representation guide": [
    "表示方式指南",
    "表示方式指南"
  ],
  "Design choices": [
    "设计选择",
    "設計選擇"
  ],
  "January — March 2026": [
    "2026年1—3月",
    "2026年1—3月"
  ],
  "224 × 224 grayscale input · 40 orientations or one depth value": [
    "224 × 224 灰度输入 · 40 种方向或一个深度值",
    "224 × 224 灰度輸入 · 40 種方向或一個深度值"
  ],
  "Parameter footprint · log scale": [
    "参数规模 · 对数坐标",
    "參數規模 · 對數座標"
  ],
  "Microrobot vision / evaluation design": [
    "微型机器人视觉 / 评估设计",
    "微型機器人視覺 / 評估設計"
  ],
  "Microscopy · pose & depth": [
    "显微图像 · 姿态与深度",
    "顯微影像 · 姿態與深度"
  ],
  "Interactive display · no browser inference": [
    "交互显示 · 浏览器不运行推理",
    "交互顯示 · 瀏覽器不執行推理"
  ],
  "The illustration explores the comparison controls; numbers come from the recorded project evaluation.": [
    "图形用于探索比较控件；数值来自项目记录的评估。",
    "圖形用於探索比較控件；數值來自專案記錄的評估。"
  ],
  "Illustrative microrobot {0} view for {1}": [
    "微型机器人 {0} 示意视图，{1}",
    "微型機器人 {0} 示意視圖，{1}"
  ],
  "MicroVision Lab": [
    "微型机器人视觉实验",
    "微型機器人視覺實驗"
  ],
  "Model comparison": [
    "模型比较",
    "模型比較"
  ],
  "Model results": [
    "模型结果",
    "模型結果"
  ],
  "Trained": [
    "已训练",
    "已訓練"
  ],
  "Experimental": [
    "实验性设计",
    "實驗性設計"
  ],
  "Fourier": [
    "傅里叶",
    "傅里葉"
  ],
  "Graph": [
    "图网络",
    "圖網路"
  ],
  "01 · Input": [
    "01 · 输入",
    "01 · 輸入"
  ],
  "02 · Lift": [
    "02 · 升维",
    "02 · 升維"
  ],
  "03 · Operator": [
    "03 · 算子",
    "03 · 算子"
  ],
  "04 · Head": [
    "04 · 输出层",
    "04 · 輸出層"
  ],
  "Node input": [
    "节点输入",
    "節點輸入"
  ],
  "Edge input": [
    "边输入",
    "邊輸入"
  ],
  "Processors": [
    "处理模块",
    "處理模組"
  ],
  "Example mesh": [
    "示例网格",
    "示例網格"
  ],
  "Edge + node": [
    "边 + 节点",
    "邊 + 節點"
  ],
  "Input grid": [
    "输入网格",
    "輸入網格"
  ],
  "Skips": [
    "跳跃连接",
    "跳躍連接"
  ],
  "Skip": [
    "跳跃连接",
    "跳躍連接"
  ],
  "View": [
    "视图",
    "視圖"
  ],
  "Custom model · trained from scratch": [
    "自定义模型 · 从头训练",
    "自訂模型 · 從頭訓練"
  ],
  "Imagenet pretraining · task adaptation": [
    "ImageNet 预训练 · 任务适配",
    "ImageNet 預訓練 · 任務適配"
  ],
  "Custom CNN": [
    "自定义 CNN",
    "自訂 CNN"
  ],
  "Pretrained": [
    "预训练",
    "預訓練"
  ],
  "40 Pose logits": [
    "40 个姿态类别分数",
    "40 個姿態類別分數"
  ],
  "Two tasks": [
    "两项任务",
    "兩項任務"
  ],
  "0 Matches": [
    "0 项匹配",
    "0 項匹配"
  ],
  "3 Applications": [
    "3 个应用领域",
    "3 個應用領域"
  ],
  "Pose model": [
    "姿态模型",
    "姿態模型"
  ],
  "Depth model": [
    "深度模型",
    "深度模型"
  ],
  "Pose class": [
    "姿态类别",
    "姿態類別"
  ],
  "Model family": [
    "模型系列",
    "模型系列"
  ],
  "Model": [
    "模型",
    "模型"
  ],
  "Benchmark": [
    "基准任务",
    "基準任務"
  ],
  "Robot 8 /": [
    "机器人 8 /",
    "機器人 8 /"
  ],
  "Pose label": [
    "姿态标签",
    "姿態標籤"
  ],
  "Params": [
    "参数量",
    "參數量"
  ],
  "Brier": [
    "Brier 分数",
    "Brier 分數"
  ],
  "· downsample on entry": [
    "· 入口处下采样",
    "· 入口處下採樣"
  ],
  "Microrobot scene": [
    "微型机器人场景",
    "微型機器人場景"
  ],
  "ImageNet": [
    "ImageNet",
    "ImageNet"
  ],
  "From scratch": [
    "从头训练",
    "從頭訓練"
  ],
  "From scratch · classification": [
    "从头训练 · 分类",
    "從頭訓練 · 分類"
  ],
  "Data": [
    "数据",
    "資料"
  ],
  "Experiment": [
    "实验",
    "實驗"
  ],
  "Selection": [
    "模型选择",
    "模型選擇"
  ],
  "Handoff": [
    "交接",
    "交接"
  ],
  "Reconstruction": [
    "重建",
    "重建"
  ],
  "Spatial field": [
    "空间流场",
    "空間流場"
  ],
  "Retained Fourier regions": [
    "保留的傅里叶区域",
    "保留的傅立葉區域"
  ],
  "Four x/y corners · low z slice": [
    "x/y 四角区 · 低 z 切片",
    "x/y 四角區 · 低 z 切片"
  ],
  "ImageNet pretraining · task adaptation": [
    "ImageNet 预训练 · 任务适配",
    "ImageNet 預訓練 · 任務適配"
  ],
  "Recorded test accuracy": [
    "记录的测试准确率",
    "記錄的測試準確率"
  ],
  "Recorded depth RMSE": [
    "记录的深度 RMSE",
    "記錄的深度 RMSE"
  ],
  "Scroll sideways to follow all stages. Select a tensor to inspect it.": [
    "横向滚动可查看全部阶段。选择张量即可查看详情。",
    "橫向捲動可查看全部階段。選擇張量即可查看詳情。"
  ],
  "Tensor graph; scroll horizontally to follow all stages": [
    "张量图；横向滚动可查看全部阶段",
    "張量圖；橫向捲動可查看全部階段"
  ]
} satisfies ProjectCopyTable;
