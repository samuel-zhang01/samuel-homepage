import type { ProjectCopyTable } from "@/lib/projectCopy";

/** Authored Simplified Mandarin with reviewed Taiwan wording; loaded with the MRI demo. */
export const mriCopy = {
  "Recorded images": ["已保存图像", "已儲存影像"],
  "Saved study figure": ["已保存的研究图", "已儲存的研究圖"],
  "From source slices to reconstructed images": ["从原始切片到重建图像", "從原始切片到重建影像"],
  "This exported figure compares the reference image, zero-filled inputs and U-Net reconstructions at R=4 and R=8, with absolute-error maps underneath.": ["这张导出图比较参考图像、零填充输入以及 R=4 和 R=8 下的 U-Net 重建结果，下方为绝对误差图。", "這張匯出圖比較參考影像、零填補輸入以及 R=4 和 R=8 下的 U-Net 重建結果，下方為絕對誤差圖。"],
  "Recorded MRI reconstruction comparison": ["已保存的 MRI 重建比较", "已儲存的 MRI 重建比較"],
  "Saved cardiac MRI comparison: reference, zero-filled and reconstructed images at two acceleration factors, with error maps below.": ["已保存的心脏 MRI 比较：参考图像、两种加速倍数下的零填充与重建图像，下方为误差图。", "已儲存的心臟 MRI 比較：參考影像、兩種加速倍數下的零填補與重建影像，下方為誤差圖。"],
  "These are saved images from the IX-Medical-Imaging repository. The PSNR values belong to the pictured examples, not the 236-slice averages in the reconstruction controls. Original figure labels are in English.": ["这些图像来自 IX-Medical-Imaging 仓库。PSNR 数值对应图中的示例，并非重建控件中 236 张切片的平均值。原图标签为英文。", "這些影像來自 IX-Medical-Imaging 儲存庫。PSNR 數值對應圖中的範例，並非重建控制項中 236 張切片的平均值。原圖標籤為英文。"],
  "Open full-size figure ↗": ["打开完整尺寸图像 ↗", "開啟完整尺寸影像 ↗"],
  "View original source ↗": ["查看原始来源 ↗", "查看原始來源 ↗"],
  "The browser displays the saved figure without rerunning inference. The interactive reconstruction and uncertainty views remain teaching tools, with separately identified synthetic phantoms.": ["浏览器显示已保存的图像，不重新运行推理。交互式重建与不确定性视图仍是教学工具，其中的合成示意已单独标明。", "瀏覽器顯示已儲存的影像，不重新執行推論。互動式重建與不確定性檢視仍是教學工具，其中的合成示意已另行標明。"],

  "/ 64 lines retained": [
    "/ 64 条采样线保留",
    "/ 64 條取樣線保留"
  ],
  "Uncertainty": [
    "不确定性",
    "不確定性"
  ],
  "Stage": [
    "阶段",
    "階段"
  ],
  "Uncertainty scale and ranking experiment": [
    "不确定性的尺度与排序实验",
    "不確定性的尺度與排序實驗"
  ],
  "CALCULATED HERE · EIGHT SYNTHETIC PIXELS": [
    "实时计算 · 八个合成像素",
    "即時計算 · 八個合成像素"
  ],
  "What does a low uncertainty score actually tell you?": [
    "较低的不确定性评分究竟说明了什么？",
    "較低的不確定性評分究竟說明了什麼？"
  ],
  "Metric source ↗": [
    "指标源码 ↗",
    "指標原始碼 ↗"
  ],
  "First increase the uncertainty scale: relative ECE barely changes because the notebook divides each map by its own maximum. Then reverse the ranking: removing the most uncertain pixels now leaves the largest errors behind. The reconstruction stays fixed throughout.": [
    "先调高不确定性数值的倍数：相对 ECE 几乎不变，因为 Notebook 将每张图中的数值除以该图的最大值。再反转排序：移除不确定性最高的像素后，留下的反而是误差最大的像素。整个过程中，重建结果始终不变。",
    "先調高不確定性數值的倍數：相對 ECE 幾乎不變，因為 Notebook 將每張圖中的數值除以該圖的最大值。再反轉排序：移除不確定性最高的像素後，留下的反而是誤差最大的像素。整個過程中，重建結果始終不變。"
  ],
  "UNCERTAINTY ORDER": [
    "不确定性排序",
    "不確定性排序"
  ],
  "Synthetic uncertainty ranking": [
    "合成不确定性的排序方式",
    "合成不確定性的排序方式"
  ],
  "Aligned with error": [
    "与误差同序",
    "與誤差同序"
  ],
  "Reversed": [
    "反向排序",
    "反向排序"
  ],
  "Multiply uncertainty": [
    "不确定性倍数",
    "不確定性倍數"
  ],
  "Remove highest uncertainty": [
    "移除不确定性最高的像素",
    "移除不確定性最高的像素"
  ],
  "Removal is only a way to evaluate error ranking. The oracle knows the true errors and removes the worst pixels first; a reconstruction system would not have that information.": [
    "移除像素仅用于评估误差排序。理想参照已知真实误差，优先移除误差最大的像素；实际重建系统并不掌握这些信息。",
    "移除像素僅用於評估誤差排序。理想參照已知真實誤差，優先移除誤差最大的像素；實際重建系統並不掌握這些資訊。"
  ],
  "Fixed residuals · uncertainty changes · shaded rows removed": [
    "残差固定 · 不确定性变化 · 灰底行表示已移除",
    "殘差固定 · 不確定性變化 · 灰底列表示已移除"
  ],
  "Pixel": [
    "像素",
    "像素"
  ],
  "|Error|": [
    "|误差|",
    "|誤差|"
  ],
  "Kept?": [
    "保留状态",
    "保留狀態"
  ],
  "Removed": [
    "已移除",
    "已移除"
  ],
  "Kept": [
    "已保留",
    "已保留"
  ],
  "RELATIVE ECE ↓": [
    "相对 ECE ↓",
    "相對 ECE ↓"
  ],
  "all 8 pixels · source formula": [
    "全部 8 个像素 · 源码公式",
    "全部 8 個像素 · 原始碼公式"
  ],
  "MEAN UNCERTAINTY": [
    "平均不确定性",
    "平均不確定性"
  ],
  "raw scale · all 8 pixels": [
    "原始尺度 · 全部 8 个像素",
    "原始尺度 · 全部 8 個像素"
  ],
  "RETAINED MSE ↓": [
    "保留像素 MSE ↓",
    "保留像素 MSE ↓"
  ],
  "pixels retained": [
    "个像素保留",
    "個像素保留"
  ],
  "ORACLE MSE ↓": [
    "理想参照 MSE ↓",
    "理想參照 MSE ↓"
  ],
  "same removal budget": [
    "移除相同数量的像素",
    "移除相同數量的像素"
  ],
  "Full-image MSE stays at": [
    "完整图像的 MSE 始终为",
    "完整影像的 MSE 始終為"
  ],
  "Relative map agreement, uncertainty magnitude and error ranking answer different questions. These toy calculations do not estimate model performance or establish an absolute calibration guarantee.": [
    "图像间的相对一致性、不确定性的大小和误差排序回答的是不同问题。这些教学计算不用于估计模型性能，也不能保证不确定性在绝对尺度上已得到校准。",
    "影像間的相對一致性、不確定性的大小和誤差排序回答的是不同問題。這些教學計算不用於估計模型效能，也不能保證不確定性在絕對尺度上已得到校準。"
  ],
  "REVIEW": [
    "复核",
    "複核"
  ],
  "Change acceleration and uncertainty settings, then inspect the trust gate and architecture path.": [
    "更改加速倍数与不确定性设置，再检查可信门槛与架构路径。",
    "更改加速倍數與不確定性設定，再檢查可信門檻與架構路徑。"
  ],
  "Quality, consistency, uncertainty and downstream checks can disagree. Recorded images show saved study outputs; interactive phantoms are synthetic.": ["质量、一致性、不确定性与下游检查可能相互冲突。已保存图像展示研究输出；交互示意为合成内容。", "品質、一致性、不確定性與下游檢查可能相互衝突。已儲存影像展示研究輸出；互動示意為合成內容。"],
  "MC Dropout": [
    "MC Dropout",
    "MC Dropout"
  ],
  "T = 30 passes": [
    "T = 30 次推理",
    "T = 30 次推理"
  ],
  "Pixel-level error ranking": [
    "像素级误差排序",
    "畫素級誤差排序"
  ],
  "Deep Ensemble": [
    "深度集成",
    "深度整合"
  ],
  "M = 3 models": [
    "M = 3 个模型",
    "M = 3 個模型"
  ],
  "Relative error-map agreement": [
    "相对误差图的一致性",
    "相對誤差圖的一致性"
  ],
  "Error experiments": [
    "误差实验",
    "誤差實驗"
  ],
  "Reconstruct": [
    "重建",
    "重建"
  ],
  "Architecture": [
    "模型架构",
    "模型架構"
  ],
  "Stress test": [
    "压力测试",
    "壓力測試"
  ],
  "Downstream": [
    "下游任务",
    "下游任務"
  ],
  "Study & limits": [
    "研究与局限",
    "研究與侷限"
  ],
  "IN": [
    "输入",
    "輸入"
  ],
  "Zero-filled input": [
    "零填充输入",
    "零填充輸入"
  ],
  "Magnitude-image tensor": [
    "幅值图像张量",
    "幅值影像張量"
  ],
  "The undersampled, zero-filled reconstruction enters the learned residual path and is also retained for the later residual addition.": [
    "欠采样后的零填充重建图像进入学习残差的路径，同时保留一份，供后续残差相加使用。",
    "欠取樣後的零填充重建影像進入學習殘差的路徑，同時保留一份，供後續殘差相加使用。"
  ],
  "Encoder level 1": [
    "编码器第 1 层",
    "編碼器第 1 層"
  ],
  "Double 3×3 convolution block": [
    "双层 3×3 卷积块",
    "雙層 3×3 卷積塊"
  ],
  "The first encoder block keeps full spatial resolution and supplies the highest-resolution skip tensor.": [
    "第一个编码块保留完整空间分辨率，并提供分辨率最高的跳跃连接张量。",
    "第一個編碼塊保留完整空間解析度，並提供解析度最高的跳躍連線張量。"
  ],
  "Encoder level 2": [
    "编码器第 2 层",
    "編碼器第 2 層"
  ],
  "2× pooling · double 3×3 block": [
    "2 倍池化 · 双层 3×3 卷积",
    "2 倍池化 · 雙層 3×3 卷積"
  ],
  "Max-pooling halves the spatial dimensions while the feature width doubles to 64 channels.": [
    "最大池化将空间尺寸减半，同时将特征通道数增至 64。",
    "最大池化將空間尺寸減半，同時將特徵通道數增至 64。"
  ],
  "Encoder level 3": [
    "编码器第 3 层",
    "編碼器第 3 層"
  ],
  "This scale carries a 128-channel representation and a matching-resolution skip route to the decoder.": [
    "这一尺度包含 128 通道的表示，并通过相同分辨率的跳跃连接传至解码器。",
    "這一尺度包含 128 通道的表示，並通過相同解析度的跳躍連線傳至解碼器。"
  ],
  "Encoder level 4": [
    "编码器第 4 层",
    "編碼器第 4 層"
  ],
  "The deepest encoder level feeds both the bottleneck and the first decoder concatenation.": [
    "最深的编码层同时连接瓶颈层和解码器的第一次特征拼接。",
    "最深的編碼層同時連線瓶頸層和解碼器的第一次特徵拼接。"
  ],
  "BN": [
    "瓶颈",
    "瓶頸"
  ],
  "Bottleneck": [
    "瓶颈层",
    "瓶頸層"
  ],
  "The committed final configuration reaches 512 channels at 16×16 before the symmetric learned upsampling path begins.": [
    "最终配置在 16×16 分辨率下达到 512 个通道，然后进入对称的可学习上采样路径。",
    "最終配置在 16×16 解析度下達到 512 個通道，然後進入對稱的可學習上取樣路徑。"
  ],
  "Decoder level 4": [
    "解码器第 4 层",
    "解碼器第 4 層"
  ],
  "2×2 transpose conv · E4 concat · double 3×3 block": [
    "2×2 转置卷积 · 拼接 E4 · 双层 3×3 卷积",
    "2×2 轉置卷積 · 拼接 E4 · 雙層 3×3 卷積"
  ],
  "Learned upsampling restores 32×32 resolution, then the E4 feature map is concatenated before the decoder block.": [
    "可学习上采样恢复 32×32 分辨率，随后在解码块之前拼接 E4 特征图。",
    "可學習上取樣恢復 32×32 解析度，隨後在解碼塊之前拼接 E4 特徵圖。"
  ],
  "Decoder level 3": [
    "解码器第 3 层",
    "解碼器第 3 層"
  ],
  "2×2 transpose conv · E3 concat · double 3×3 block": [
    "2×2 转置卷积 · 拼接 E3 · 双层 3×3 卷积",
    "2×2 轉置卷積 · 拼接 E3 · 雙層 3×3 卷積"
  ],
  "The decoder returns to 64×64 and concatenates the matching E3 encoder features.": [
    "解码器恢复到 64×64，并拼接对应的 E3 编码特征。",
    "解碼器恢復到 64×64，並拼接對應的 E3 編碼特徵。"
  ],
  "Decoder level 2": [
    "解码器第 2 层",
    "解碼器第 2 層"
  ],
  "2×2 transpose conv · E2 concat · double 3×3 block": [
    "2×2 转置卷积 · 拼接 E2 · 双层 3×3 卷积",
    "2×2 轉置卷積 · 拼接 E2 · 雙層 3×3 卷積"
  ],
  "The third learned upsampling stage restores 128×128 resolution and receives the E2 skip tensor.": [
    "第三次可学习上采样恢复 128×128 分辨率，并接收 E2 跳跃连接张量。",
    "第三次可學習上取樣恢復 128×128 解析度，並接收 E2 跳躍連線張量。"
  ],
  "Decoder level 1": [
    "解码器第 1 层",
    "解碼器第 1 層"
  ],
  "2×2 transpose conv · E1 concat · double 3×3 block": [
    "2×2 转置卷积 · 拼接 E1 · 双层 3×3 卷积",
    "2×2 轉置卷積 · 拼接 E1 · 雙層 3×3 卷積"
  ],
  "The final decoder stage returns to full resolution and recombines the high-resolution E1 features.": [
    "最后一个解码层恢复完整分辨率，并重新结合高分辨率的 E1 特征。",
    "最後一個解碼層恢復完整解析度，並重新結合高解析度的 E1 特徵。"
  ],
  "OUT": [
    "输出",
    "輸出"
  ],
  "Residual output": [
    "残差输出",
    "殘差輸出"
  ],
  "1×1 projection · residual add": [
    "1×1 投影 · 残差相加",
    "1×1 投影 · 殘差相加"
  ],
  "A 1×1 convolution projects to one correction channel. That correction is added to the original zero-filled input before soft data consistency.": [
    "1×1 卷积将特征投影为单通道修正量，再与原始零填充输入相加，随后执行软数据一致性约束。",
    "1×1 卷積將特徵投影為單通道修正量，再與原始零填充輸入相加，隨後執行軟資料一致性約束。"
  ],
  "{0}, generated synthetic schematic": [
    "{0}，生成的合成示意图",
    "{0}，生成的合成示意圖"
  ],
  "SYNTHETIC · NO PATIENT DATA": [
    "合成图像 · 不含患者数据",
    "合成影像 · 不含患者資料"
  ],
  "GENERATED ANATOMY-LIKE PHANTOM": [
    "生成的类解剖结构模型",
    "生成的類解剖結構模型"
  ],
  "CARTESIAN MASK · 64-COLUMN SCHEMATIC": [
    "笛卡尔采样掩码 · 64 列示意图",
    "笛卡爾取樣掩碼 · 64 列示意圖"
  ],
  "{0} times Cartesian undersampling mask schematic": [
    "{0} 倍笛卡尔欠采样掩码示意图",
    "{0} 倍笛卡爾欠取樣掩碼示意圖"
  ],
  "ACS": [
    "ACS",
    "ACS"
  ],
  "Generated mask follows the source algorithm: fixed central 8% ACS lines, then deterministic column placement to reach W/R. It is a schematic, not an experimental mask.": [
    "掩码遵循源码中的算法：固定保留中央 8% 的 ACS 校准线，再按确定性规则选择其他列，达到 W/R 条线。这是算法示意，并非实验使用的掩码。",
    "掩碼遵循原始碼中的演算法：固定保留中央 8% 的 ACS 校準線，再按確定性規則選擇其他列，達到 W/R 條線。這是演算法示意，並非實驗使用的掩碼。"
  ],
  "PHYSICS-INFORMED RECONSTRUCTION": [
    "融合物理约束的重建",
    "融合物理約束的重建"
  ],
  "What survives when k-space gets sparse?": [
    "k 空间变稀疏后，还能保留多少信息？",
    "k 空間變稀疏後，還能保留多少資訊？"
  ],
  "Compare final-report aggregates from 236 held-out MR slices. The visual phantom and mask are generated locally; they are not dataset examples or model outputs.": [
    "比较最终报告中 236 张独立测试 MR 切片的汇总结果。类解剖结构与掩码在浏览器中生成，并非数据集样本或模型输出。",
    "比較最終報告中 236 張獨立測試 MR 切片的彙總結果。類解剖結構與掩碼在瀏覽器中生成，並非資料集樣本或模型輸出。"
  ],
  "ACCELERATION": [
    "加速倍数",
    "加速倍數"
  ],
  "Acceleration factor": [
    "加速因子",
    "加速因子"
  ],
  "Reconstruction method": [
    "重建方法",
    "重建方法"
  ],
  "Zero-filled": [
    "零填充",
    "零填充"
  ],
  "IFFT baseline": [
    "IFFT 基线",
    "IFFT 基線"
  ],
  "U-Net only": [
    "仅 U-Net",
    "僅 U-Net"
  ],
  "R=4 reported": [
    "报告中的 R=4 结果",
    "報告中的 R=4 結果"
  ],
  "U-Net + DC": [
    "U-Net + DC",
    "U-Net + DC"
  ],
  "3 cascades": [
    "3 次级联",
    "3 次級聯"
  ],
  "Not reported at R=8": [
    "未报告 R=8 结果",
    "未報告 R=8 結果"
  ],
  "Zero-filled · R={0}×": [
    "零填充 · R={0}×",
    "零填充 · R={0}×"
  ],
  "U-Net without data consistency · R=4×": [
    "不含数据一致性约束的 U-Net · R=4×",
    "不含資料一致性約束的 U-Net · R=4×"
  ],
  "Residual U-Net + soft DC · R={0}×": [
    "残差 U-Net + 软数据一致性 · R={0}×",
    "殘差 U-Net + 軟資料一致性 · R={0}×"
  ],
  "PSNR ↑": [
    "PSNR ↑",
    "PSNR ↑"
  ],
  "final report": [
    "最终报告",
    "最終報告"
  ],
  "SSIM ↑": [
    "SSIM ↑",
    "SSIM ↑"
  ],
  "NMSE ↓": [
    "NMSE ↓",
    "NMSE ↓"
  ],
  "not reported": [
    "未报告",
    "未報告"
  ],
  "VS ZERO-FILL": [
    "与零填充比较",
    "與零填充比較"
  ],
  "DC ablation underperforms": [
    "移除数据一致性约束后表现下降",
    "移除資料一致性約束後表現下降"
  ],
  "reported comparison": [
    "报告中的比较",
    "報告中的比較"
  ],
  "selected baseline": [
    "所选基线",
    "所選基線"
  ],
  "SOFT DATA CONSISTENCY · TOY COEFFICIENT": [
    "软数据一致性 · 教学系数",
    "軟資料一致性 · 教學系數"
  ],
  "Measured data gets a vote": [
    "让实测数据参与重建",
    "讓實測資料參與重建"
  ],
  "Illustrative blend weight": [
    "示意性混合权重",
    "示意性混合權重"
  ],
  "Illustrative measured k-space blend": [
    "实测 k 空间数据的混合示例",
    "實測 k 空間資料的混合示例"
  ],
  "At measured locations, the source blends predicted and acquired k-space with a learned, sigmoid-gated λ; unmeasured locations retain the prediction. Values above are pedagogical— the trained λ was not reported.": [
    "在已采样位置，模型通过经过 sigmoid 限制的可学习权重 λ，混合预测值和实测 k 空间数据；未采样位置保留预测值。这里的数值用于教学，报告没有给出训练后的 λ。",
    "在已取樣位置，模型通過經過 sigmoid 限制的可學習權重 λ，混合預測值和實測 k 空間資料；未取樣位置保留預測值。這裡的數值用於教學，報告沒有給出訓練後的 λ。"
  ],
  "VERIFIED MODEL PATH": [
    "模型处理路径",
    "模型處理路徑"
  ],
  "Magnitude image": [
    "幅值图像",
    "幅值影像"
  ],
  "2-D FFT": [
    "二维 FFT",
    "二維 FFT"
  ],
  "Random 1-D mask": [
    "随机一维掩码",
    "隨機一維掩碼"
  ],
  "8% ACS retained": [
    "保留 8% ACS 校准线",
    "保留 8% ACS 校準線"
  ],
  "4-level U-Net": [
    "四层 U-Net",
    "四層 U-Net"
  ],
  "residual correction": [
    "残差修正",
    "殘差修正"
  ],
  "Soft DC × 3": [
    "软数据一致性 × 3",
    "軟資料一致性 × 3"
  ],
  "measured-line anchor": [
    "以实测采样线为约束",
    "以實測取樣線為約束"
  ],
  "R=4 DC ablation": [
    "R=4 数据一致性消融",
    "R=4 資料一致性消融"
  ],
  "31.9 → 23.8 dB": [
    "31.9 → 23.8 dB",
    "31.9 → 23.8 dB"
  ],
  "−8.1 dB reported": [
    "报告下降 8.1 dB",
    "報告下降 8.1 dB"
  ],
  "MODEL DESIGN": [
    "模型设计",
    "模型設計"
  ],
  "Follow every scale, skip and physics constraint.": [
    "跟随每个尺度、跳跃连接和物理约束。",
    "跟隨每個尺度、跳躍連線和物理約束。"
  ],
  "Select a tensor stage, a matching-resolution skip route or one of the three final soft data-consistency layers. Shapes and counts follow the committed final configuration; weights and inference outputs are not bundled here.": [
    "选择一个张量阶段、相同分辨率的跳跃连接，或三层最终软数据一致性中的任意一层。形状与数量依据最终配置；此页面不包含权重或推理输出。",
    "選擇一個張量階段、相同解析度的跳躍連線，或三層最終軟資料一致性中的任意一層。形狀與數量依據最終配置；此頁面不包含權重或推理輸出。"
  ],
  "FINAL RECONUNET": [
    "最终 ReconUNet",
    "最終 ReconUNet"
  ],
  "single-channel · 256²": [
    "单通道 · 256²",
    "單通道 · 256²"
  ],
  "Reconstruction model architecture facts": [
    "重建模型的架构参数",
    "重建模型的架構引數"
  ],
  "TRAINABLE PARAMETERS": [
    "可训练参数",
    "可訓練引數"
  ],
  "includes 3 soft-DC scalars": [
    "包含 3 个软数据一致性标量",
    "包含 3 個軟資料一致性標量"
  ],
  "BACKBONE CONVOLUTIONS": [
    "主干卷积",
    "主幹卷積"
  ],
  "nine double-convolution blocks": [
    "九个双卷积块",
    "九個雙卷積塊"
  ],
  "LEARNED UPSAMPLING": [
    "可学习上采样",
    "可學習上取樣"
  ],
  "transposed convolutions": [
    "转置卷积",
    "轉置卷積"
  ],
  "INITIALISATION": [
    "初始化",
    "初始化"
  ],
  "FROM SCRATCH": [
    "从零训练",
    "從零訓練"
  ],
  "no pretrained backbone": [
    "不使用预训练主干",
    "不使用預訓練主幹"
  ],
  "Interactive U-Net topology; scroll horizontally if needed": [
    "互动 U-Net 结构图；必要时可横向滚动",
    "互動 U-Net 結構圖；必要時可橫向滾動"
  ],
  "RESIDUAL PATH →": [
    "残差路径 →",
    "殘差路徑 →"
  ],
  "ENCODER · RESOLUTION ↓ · CONTEXT →": [
    "编码器 · 分辨率 ↓ · 上下文 →",
    "編碼器 · 解析度 ↓ · 上下文 →"
  ],
  "DECODER · DETAIL ← · RESOLUTION ↑": [
    "解码器 · 细节 ← · 分辨率 ↑",
    "解碼器 · 細節 ← · 解析度 ↑"
  ],
  "Four encoder and decoder scale pairs plus bottleneck": [
    "四对编码与解码尺度，以及瓶颈层",
    "四對編碼與解碼尺度，以及瓶頸層"
  ],
  "{0}: select matching-resolution concatenation carrying {1} from {2} to {3}": [
    "{0}：选择相同分辨率的拼接，将 {1} 从 {2} 传至 {3}",
    "{0}：選擇相同解析度的拼接，將 {1} 從 {2} 傳至 {3}"
  ],
  "· CONCAT": [
    "· 拼接",
    "· 拼接"
  ],
  "↓ TURN INTO DECODER": [
    "↓ 转入解码器",
    "↓ 轉入解碼器"
  ],
  "← 1×1 PROJECTION + INPUT RESIDUAL": [
    "← 1×1 投影 + 输入残差",
    "← 1×1 投影 + 輸入殘差"
  ],
  "Selected architecture stage details": [
    "所选架构阶段的详情",
    "所選架構階段的詳情"
  ],
  "SELECTED STAGE ·": [
    "所选阶段 ·",
    "所選階段 ·"
  ],
  "What this stage does": [
    "这个阶段做什么",
    "這個階段做什麼"
  ],
  "Why it is here": [
    "为什么需要它",
    "為什麼需要它"
  ],
  "Per-stage parameter totals are intentionally omitted: the repository defines the operations and total model count, but does not publish an audited stage-by-stage allocation.": [
    "源码给出了各操作和模型总参数量，但未提供逐阶段核对的参数分配，因此这里不列各阶段的参数总量。",
    "原始碼給出了各操作和模型總引數量，但未提供逐階段核對的引數分配，因此這裡不列各階段的引數總量。"
  ],
  "PHYSICS LAYER · SEQUENTIAL AFTER RESIDUAL U-NET": [
    "物理约束层 · 位于残差 U-Net 之后",
    "物理約束層 · 位於殘差 U-Net 之後"
  ],
  "Three learned soft-DC scalars": [
    "三个可学习的软数据一致性标量",
    "三個可學習的軟資料一致性標量"
  ],
  "Select data-consistency cascade": [
    "选择数据一致性级联层",
    "選擇資料一致性級聯層"
  ],
  "DC": [
    "DC",
    "DC"
  ],
  "CASCADE": [
    "级联",
    "級聯"
  ],
  "OF 3": [
    "／共 3 层",
    "／共 3 層"
  ],
  "Re-anchor acquired k-space lines": [
    "用实测 k 空间采样线重新约束重建",
    "用實測 k 空間取樣線重新約束重建"
  ],
  "measured:": [
    "已采样：",
    "已取樣："
  ],
  "Soft data consistency at measured locations": [
    "已采样位置的软数据一致性",
    "已取樣位置的軟資料一致性"
  ],
  "unmeasured:": [
    "未采样：",
    "未取樣："
  ],
  "Prediction retained at unmeasured locations": [
    "未采样位置保留预测值",
    "未取樣位置保留預測值"
  ],
  "The code applies DC 1 → 2 → 3 to the running reconstruction after one residual U-Net pass. Each layer contributes one scalar parameter; trained λ values are not reported here.": [
    "残差 U-Net 完成一次处理后，重建结果依次经过 DC 1 → 2 → 3。每层包含一个标量参数；这里未报告训练后的 λ 值。",
    "殘差 U-Net 完成一次處理後，重建結果依次經過 DC 1 → 2 → 3。每層包含一個標量引數；這裡未報告訓練後的 λ 值。"
  ],
  "MODEL ROLE SEPARATION": [
    "两个模型的不同职责",
    "兩個模型的不同職責"
  ],
  "Reconstructor ≠ evaluator": [
    "重建模型 ≠ 评估模型",
    "重建模型 ≠ 評估模型"
  ],
  "2 systems": [
    "两个系统",
    "兩個系統"
  ],
  "TRAINED RECONSTRUCTION SYSTEM": [
    "经训练的重建系统",
    "經訓練的重建系統"
  ],
  "parameters · 4-level U-Net + DC": [
    "个参数 · 四层 U-Net + DC",
    "個引數 · 四層 U-Net + DC"
  ],
  "Optimised from scratch to predict a residual correction, then constrained by three soft-DC layers.": [
    "从零训练以预测残差修正量，再由三层软数据一致性约束输出。",
    "從零訓練以預測殘差修正量，再由三層軟資料一致性約束輸出。"
  ],
  "FROZEN DOWNSTREAM EVALUATOR": [
    "冻结的下游评估模型",
    "凍結的下游評估模型"
  ],
  "parameters · separate 3-level U-Net": [
    "个参数 · 独立三层 U-Net",
    "個引數 · 獨立三層 U-Net"
  ],
  "Trained separately on ground-truth images for eight-class segmentation, then frozen while reconstructed inputs are assessed.": [
    "先用真实图像单独训练八类别分割模型，再冻结参数，用它评估重建图像。",
    "先用真實影像單獨訓練八類別分割模型，再凍結引數，用它評估重建影像。"
  ],
  "The segmentation network is an evaluation probe—not a decoder head, not part of the reconstruction parameter total, and not jointly optimised with ReconUNet.": [
    "分割网络是评估工具，并非重建模型的解码头；它不计入重建参数总量，也不与 ReconUNet 联合优化。",
    "分割網路是評估工具，並非重建模型的解碼頭；它不計入重建引數總量，也不與 ReconUNet 聯合最佳化。"
  ],
  "Architecture tensor ledger traced to source": [
    "依据源码整理的架构张量表",
    "依據原始碼整理的架構張量表"
  ],
  "Semantic tensor ledger · final base_features=32 configuration": [
    "各阶段张量 · 最终 base_features=32 配置",
    "各階段張量 · 最終 base_features=32 配置"
  ],
  "Output tensor": [
    "输出张量",
    "輸出張量"
  ],
  "Committed operation": [
    "模型操作",
    "模型操作"
  ],
  "CALIBRATION + ERROR RANKING": [
    "校准与误差排序",
    "校準與誤差排序"
  ],
  "Two uncertainty methods, different strengths.": [
    "两种不确定性方法，各有所长。",
    "兩種不確定性方法，各有所長。"
  ],
  "Switch between the exact final-report results. Heat-map placement is a generated boundary-focused schematic, mirroring the reported qualitative pattern—not a saved prediction.": [
    "切换查看最终报告的结果。热图是围绕边界生成的示意，呼应报告中的定性现象，并非保存的预测结果。",
    "切換檢視最終報告的結果。熱圖是圍繞邊界生成的示意，呼應報告中的定性現象，並非儲存的預測結果。"
  ],
  "ESTIMATOR": [
    "估计方法",
    "估計方法"
  ],
  "Uncertainty estimator": [
    "不确定性估计方法",
    "不確定性估計方法"
  ],
  "Ensemble": [
    "集成模型",
    "整合模型"
  ],
  "{0} mean reconstruction": [
    "{0} 平均重建结果",
    "{0} 平均重建結果"
  ],
  "{0} uncertainty schematic": [
    "{0} 不确定性示意图",
    "{0} 不確定性示意圖"
  ],
  "SELECTED METHOD": [
    "所选方法",
    "所選方法"
  ],
  "R=4 final report": [
    "最终报告 · R=4",
    "最終報告 · R=4"
  ],
  "Relative ECE ↓": [
    "相对 ECE ↓",
    "相對 ECE ↓"
  ],
  "normalised map agreement": [
    "归一化后的图像一致性",
    "歸一化後的影像一致性"
  ],
  "AUSE ↓": [
    "AUSE ↓",
    "AUSE ↓"
  ],
  "sparsification": [
    "像素剔除评估",
    "畫素剔除評估"
  ],
  "ERROR r ↑": [
    "误差相关系数 r ↑",
    "誤差相關係數 r ↑"
  ],
  "uncertainty vs |error|": [
    "不确定性与绝对误差",
    "不確定性與絕對誤差"
  ],
  "BEST FIT": [
    "相对优势",
    "相對優勢"
  ],
  "Segmentation-error correlation: r =": [
    "与分割误差的相关系数：r =",
    "與分割誤差的相關係數：r ="
  ],
  "RELATIVE MAP AGREEMENT · LOWER IS BETTER": [
    "相对图像一致性 · 越低越好",
    "相對影像一致性 · 越低越好"
  ],
  "Relative uncertainty–error agreement": [
    "不确定性与误差的相对一致性",
    "不確定性與誤差的相對一致性"
  ],
  "% lower": [
    "% 降幅",
    "% 降幅"
  ],
  "Uncertainty and absolute-error maps are each divided by their own maximum before binning. The ensemble has a smaller relative-map discrepancy; this score is insensitive to absolute uncertainty scale.": [
    "不确定性图和绝对误差图分别除以各自的最大值后，再按区间分组。集成模型的相对图像差异较小，但该指标对不确定性的绝对大小不敏感。",
    "不確定性圖和絕對誤差圖分別除以各自的最大值後，再按區間分組。整合模型的相對影像差異較小，但該指標對不確定性的絕對大小不敏感。"
  ],
  "SPARSIFICATION · LOWER IS BETTER": [
    "像素剔除评估 · 越低越好",
    "畫素剔除評估 · 越低越好"
  ],
  "Area under sparsification error": [
    "稀疏化误差曲线下面积",
    "稀疏化誤差曲線下面積"
  ],
  "Calculated from rounded table values. MC Dropout ranks unreliable pixels more tightly.": [
    "按表中舍入值计算。MC Dropout 对不可靠像素的排序更接近真实误差排序。",
    "按表中舍入值計算。MC Dropout 對不可靠畫素的排序更接近真實誤差排序。"
  ],
  "Clean": [
    "未受攻击",
    "未受攻擊"
  ],
  "FGSM": [
    "FGSM",
    "FGSM"
  ],
  "PGD-7": [
    "PGD-7",
    "PGD-7"
  ],
  "Reported PSNR under FGSM and PGD attacks": [
    "报告中的 FGSM 与 PGD 攻击下 PSNR",
    "報告中的 FGSM 與 PGD 攻擊下 PSNR"
  ],
  "dB at ε=": [
    "dB，ε=",
    "dB，ε="
  ],
  "attack budget ε": [
    "攻击预算 ε",
    "攻擊預算 ε"
  ],
  "PSNR dB": [
    "PSNR（dB）",
    "PSNR（dB）"
  ],
  "Aggregate values transcribed from the final report; no per-slice samples are plotted.": [
    "数据为最终报告中的汇总值，图中不含逐切片样本。",
    "資料為最終報告中的彙總值，圖中不含逐切片樣本。"
  ],
  "FAILURE-MODE LAB": [
    "失效模式实验",
    "失效模式實驗"
  ],
  "Does uncertainty rise when trust should fall?": [
    "可靠性下降时，不确定性会升高吗？",
    "可靠性下降時，不確定性會升高嗎？"
  ],
  "Explore exact adversarial and cross-domain aggregates. Degradation in the generated phantom is only a visual cue; it is not a recovered experimental sample.": [
    "探索对抗攻击和跨域测试的汇总结果。合成类解剖图像的变化仅用于提示退化，并非真实实验样本。",
    "探索對抗攻擊和跨域測試的彙總結果。合成類解剖影像的變化僅用於提示退化，並非真實實驗樣本。"
  ],
  "STRESSOR": [
    "压力来源",
    "壓力來源"
  ],
  "Robustness stressor": [
    "鲁棒性压力来源",
    "魯棒性壓力來源"
  ],
  "Image attack": [
    "图像攻击",
    "影像攻擊"
  ],
  "MR → CT shift": [
    "MR → CT 域迁移",
    "MR → CT 域遷移"
  ],
  "ATTACK": [
    "攻击方法",
    "攻擊方法"
  ],
  "Attack type": [
    "攻击类型",
    "攻擊型別"
  ],
  "PGD · 7 steps": [
    "PGD · 7 步",
    "PGD · 7 步"
  ],
  "BUDGET ε": [
    "预算 ε",
    "預算 ε"
  ],
  "Generated {0} stress schematic · ε={1}": [
    "生成的 {0} 压力测试示意图 · ε={1}",
    "生成的 {0} 壓力測試示意圖 · ε={1}"
  ],
  "CLEAN": [
    "未受攻击",
    "未受攻擊"
  ],
  "reported reference": [
    "报告中的参考值",
    "報告中的參考值"
  ],
  "{0} PSNR": [
    "{0} PSNR",
    "{0} PSNR"
  ],
  "QUALITY DROP": [
    "质量下降",
    "質量下降"
  ],
  "calculated difference": [
    "计算得到的差值",
    "計算得到的差值"
  ],
  "UNCERTAINTY": [
    "不确定性",
    "不確定性"
  ],
  "reported progression": [
    "报告中的变化",
    "報告中的變化"
  ],
  "ITERATIVE ATTACK": [
    "迭代攻击",
    "迭代攻擊"
  ],
  "SINGLE-STEP ATTACK": [
    "单步攻击",
    "單步攻擊"
  ],
  "PGD is more damaging at every tested budget.": [
    "在所有测试预算下，PGD 造成的损害都更大。",
    "在所有測試預算下，PGD 造成的損害都更大。"
  ],
  "FGSM degrades quality monotonically with budget.": [
    "FGSM 的预算越大，重建质量越低。",
    "FGSM 的預算越大，重建質量越低。"
  ],
  "Soft DC re-imposes the untouched acquired k-space at measured locations, a physics-grounded constraint described in the report.": [
    "软数据一致性会在已采样位置重新引入未经攻击的实测 k 空间数据，形成报告中描述的物理约束。",
    "軟資料一致性會在已取樣位置重新引入未經攻擊的實測 k 空間資料，形成報告中描述的物理約束。"
  ],
  "EVALUATION DOMAIN": [
    "评估数据域",
    "評估資料域"
  ],
  "MR": [
    "MR",
    "MR"
  ],
  "in-domain": [
    "同域",
    "同域"
  ],
  "CT": [
    "CT",
    "CT"
  ],
  "out-of-domain": [
    "域外",
    "域外"
  ],
  "PSNR": [
    "PSNR",
    "PSNR"
  ],
  "MR-trained / MR test": [
    "MR 训练／MR 测试",
    "MR 訓練／MR 測試"
  ],
  "MR-trained / CT test": [
    "MR 训练／CT 测试",
    "MR 訓練／CT 測試"
  ],
  "reported rounded mean": [
    "报告中的舍入均值",
    "報告中的舍入均值"
  ],
  "{0} domain · generated modality-shift schematic": [
    "{0} 域 · 生成的模态迁移示意图",
    "{0} 域 · 生成的模態遷移示意圖"
  ],
  "REPORTED DISTRIBUTION-SHIFT SIGNAL": [
    "报告中的分布迁移信号",
    "報告中的分佈遷移訊號"
  ],
  "uncertainty on CT": [
    "CT 上的不确定性",
    "CT 上的不確定性"
  ],
  "The report states +77% using unrounded experiment values, alongside a 0.9 dB PSNR drop. The displayed 0.004 and 0.007 means are rounded and imply 75%, so the reported percentage remains as reported in the source.": [
    "报告使用未舍入的实验值给出 +77%，同时 PSNR 下降 0.9 dB。显示的均值 0.004 和 0.007 已舍入，直接计算为 75%；因此这里保留报告原文中的百分比。",
    "報告使用未舍入的實驗值給出 +77%，同時 PSNR 下降 0.9 dB。顯示的均值 0.004 和 0.007 已舍入，直接計算為 75%；因此這裡保留報告原文中的百分比。"
  ],
  "DOWNSTREAM TASK CHECK": [
    "下游任务检查",
    "下游任務檢查"
  ],
  "Pixel fidelity is not the finish line.": [
    "像素保真度并不是终点。",
    "畫素保真度並不是終點。"
  ],
  "The source evaluates a segmentation network on ground-truth, reconstructed and zero-filled inputs. Select acceleration to calculate Dice preservation from the reported table.": [
    "研究用分割网络评估真实图像、重建图像和零填充图像。选择加速倍数，依据报告表格计算 Dice 保留率。",
    "研究用分割網路評估真實影像、重建影像和零填充影像。選擇加速倍數，依據報告表格計算 Dice 保留率。"
  ],
  "Segmentation acceleration factor": [
    "分割任务的加速因子",
    "分割任務的加速因子"
  ],
  "Generated segmentation-overlay schematic · R={0}×": [
    "生成的分割叠加示意图 · R={0}×",
    "生成的分割疊加示意圖 · R={0}×"
  ],
  "MEAN DICE · HIGHER IS BETTER": [
    "平均 Dice · 越高越好",
    "平均 Dice · 越高越好"
  ],
  "× comparison": [
    "倍比较",
    "倍比較"
  ],
  "% preserved": [
    "% 保留率",
    "% 保留率"
  ],
  "Ground truth": [
    "真实图像",
    "真實影像"
  ],
  "RECON PRESERVATION": [
    "重建图像保留率",
    "重建影像保留率"
  ],
  "ZERO-FILL PRESERVATION": [
    "零填充保留率",
    "零填充保留率"
  ],
  "RECON / ZERO RATIO": [
    "重建／零填充比值",
    "重建／零填充比值"
  ],
  "PORTFOLIO WHAT-IF · NOT A SOURCE THRESHOLD": [
    "互动假设 · 非研究给定阈值",
    "互動假設 · 非研究給定閾值"
  ],
  "Task-preservation review gate": [
    "下游任务质量复核门槛",
    "下游任務質量複核門檻"
  ],
  "PASS": [
    "通过",
    "通過"
  ],
  "Minimum Dice preservation:": [
    "最低 Dice 保留率：",
    "最低 Dice 保留率："
  ],
  "This interactive rule demonstrates how a downstream quality gate could operate. The report proposes uncertainty-guided flagging but does not prescribe this Dice threshold; it is not a clinical decision rule.": [
    "这个互动规则演示下游质量门槛的运作方式。报告提出按不确定性标记待复核图像，但没有规定这里的 Dice 阈值；它不是临床决策规则。",
    "這個互動規則演示下游質量門檻的運作方式。報告提出按不確定性標記待複核影像，但沒有規定這裡的 Dice 閾值；它不是臨床決策規則。"
  ],
  "TASK-LEVEL EVIDENCE": [
    "任务层面的证据",
    "任務層面的證據"
  ],
  "MC uncertainty ↔ segmentation error": [
    "MC 不确定性 ↔ 分割误差",
    "MC 不確定性 ↔ 分割誤差"
  ],
  "Positive but moderate spatial correlation in the final table. At R=8×, reported Dice is 0.477 versus 0.231 for zero-fill—more than double.": [
    "最终表格显示正向但中等程度的空间相关。在 R=8× 时，报告中的 Dice 为 0.477，而零填充为 0.231，前者超过后者两倍。",
    "最終表格顯示正向但中等程度的空間相關。在 R=8× 時，報告中的 Dice 為 0.477，而零填充為 0.231，前者超過後者兩倍。"
  ],
  "UNDERSTANDING THE STUDY": [
    "理解这项研究",
    "理解這項研究"
  ],
  "How was reconstruction quality evaluated?": [
    "如何评估重建质量？",
    "如何評估重建質量？"
  ],
  "The study combines image quality, uncertainty, adversarial stress and downstream segmentation. Explore the model configuration and evaluation population, then read what these results can support.": [
    "研究同时考察图像质量、不确定性、对抗压力和下游分割。探索模型配置与评估样本，再了解这些结果能够支持哪些结论。",
    "研究同時考察影像質量、不確定性、對抗壓力和下游分割。探索模型配置與評估樣本，再瞭解這些結果能夠支援哪些結論。"
  ],
  "Inspect public source ↗": [
    "查看公开源码 ↗",
    "檢視公開原始碼 ↗"
  ],
  "EXPLAINABILITY ADAPTED TO RECONSTRUCTION": [
    "面向重建任务的可解释性",
    "面向重建任務的可解釋性"
  ],
  "loss target": [
    "以损失为目标",
    "以損失為目標"
  ],
  "{0} boundary-focus schematic": [
    "{0} 边界关注示意图",
    "{0} 邊界關注示意圖"
  ],
  "Attribution method": [
    "归因方法",
    "歸因方法"
  ],
  "Saliency": [
    "显著性图",
    "顯著性圖"
  ],
  "Grad-CAM": [
    "Grad-CAM",
    "Grad-CAM"
  ],
  "Integrated gradients": [
    "积分梯度",
    "積分梯度"
  ],
  "The source replaces the classification logit with reconstruction loss. It reports positive correlation with error and boundary-focused attribution, but does not tabulate exact XAI correlations; this canvas is deliberately qualitative.": [
    "研究以重建损失替代分类 logit 作为归因目标。报告描述了与误差正相关、关注结构边界的现象，但未列出精确的 XAI 相关系数，因此这里展示定性示意。",
    "研究以重建損失替代分類 logit 作為歸因目標。報告描述了與誤差正相關、關注結構邊界的現象，但未列出精確的 XAI 相關係數，因此這裡展示定性示意。"
  ],
  "FINAL CONFIGURATION · REPORT": [
    "最终配置 · 研究报告",
    "最終配置 · 研究報告"
  ],
  "Backbone": [
    "主干网络",
    "主幹網路"
  ],
  "4-level residual U-Net": [
    "四层残差 U-Net",
    "四層殘差 U-Net"
  ],
  "Blocks": [
    "模块",
    "模組"
  ],
  "InstanceNorm · LeakyReLU · spatial dropout": [
    "InstanceNorm · LeakyReLU · 空间 Dropout",
    "InstanceNorm · LeakyReLU · 空間 Dropout"
  ],
  "Capacity": [
    "容量",
    "容量"
  ],
  "32 base features · p=0.11": [
    "32 个基础特征 · p=0.11",
    "32 個基礎特徵 · p=0.11"
  ],
  "Physics": [
    "物理约束",
    "物理約束"
  ],
  "3 learnable soft-DC cascades": [
    "3 层可学习软数据一致性级联",
    "3 層可學習軟資料一致性級聯"
  ],
  "Loss": [
    "损失函数",
    "損失函式"
  ],
  "0.51 SSIM + 0.49 L1": [
    "0.51 SSIM + 0.49 L1",
    "0.51 SSIM + 0.49 L1"
  ],
  "Optimisation": [
    "优化设置",
    "最佳化設定"
  ],
  "10 Optuna trials · 100 epochs · cosine schedule": [
    "10 次 Optuna 试验 · 100 轮训练 · 余弦调度",
    "10 次 Optuna 試驗 · 100 輪訓練 · 餘弦排程"
  ],
  "Selected LR": [
    "选定学习率",
    "選定學習率"
  ],
  "1.6e-3 · weight decay 3.4e-6": [
    "1.6e-3 · 权重衰减 3.4e-6",
    "1.6e-3 · 權重衰減 3.4e-6"
  ],
  "Images": [
    "图像",
    "影像"
  ],
  "256² magnitude · 8-class labels": [
    "256² 幅值图像 · 8 类标签",
    "256² 幅值影像 · 8 類標籤"
  ],
  "MM-WHS SLICE COUNTS · AS REPORTED": [
    "MM-WHS 切片数量 · 报告值",
    "MM-WHS 切片數量 · 報告值"
  ],
  "Images used for evaluation": [
    "用于评估的图像",
    "用於評估的影像"
  ],
  "Reported data split counts": [
    "报告中的数据划分数量",
    "報告中的資料劃分數量"
  ],
  "Modality": [
    "模态",
    "模態"
  ],
  "Train": [
    "训练",
    "訓練"
  ],
  "Validation": [
    "验证",
    "驗證"
  ],
  "Test": [
    "测试",
    "測試"
  ],
  "The Recorded images tab shows a saved reconstruction comparison. K-space was retrospectively simulated from magnitude images.": ["“已保存图像”标签页展示已保存的重建对比。K 空间由幅度图像回顾性模拟生成。", "「已儲存影像」分頁展示已儲存的重建比較。K 空間由幅度影像回顧性模擬產生。"],
  "Acquisition realism": [
    "采集真实性",
    "採集真實性"
  ],
  "Simulated single-coil Cartesian undersampling from magnitude images; no prospective raw acquisition.": [
    "由幅值图像模拟单线圈笛卡尔欠采样，并非前瞻性原始数据采集。",
    "由幅值影像模擬單線圈笛卡爾欠取樣，並非前瞻性原始資料採集。"
  ],
  "Uncertainty scale": [
    "不确定性尺度",
    "不確定性尺度"
  ],
  "Only three ensemble members, with moderate uncertainty-to-segmentation correlation.": [
    "集成仅含三个模型，且不确定性与分割误差的相关程度有限。",
    "整合僅含三個模型，且不確定性與分割誤差的相關程度有限。"
  ],
  "Use boundary": [
    "适用范围",
    "適用範圍"
  ],
  "Research evaluation, not clinical validation and not intended for diagnosis.": [
    "这是研究评估，未经临床验证，不用于诊断。",
    "這是研究評估，未經臨床驗證，不用於診斷。"
  ],
  "Reuse boundary": [
    "源码使用范围",
    "原始碼使用範圍"
  ],
  "The repository is publicly viewable but contains no explicit licence file; public access is not a reuse grant.": [
    "仓库可公开查看，但未提供明确许可证；公开访问并不等于获得复用授权。",
    "倉庫可公開檢視，但未提供明確許可證；公開訪問並不等於獲得複用授權。"
  ],
  "TRUST LAB 1.0": [
    "可信影像实验室 1.0",
    "可信影像實驗室 1.0"
  ],
  "Trustworthy MRI Reconstruction": [
    "可信 MRI 重建",
    "可信 MRI 重建"
  ],
  "REPORTED METRICS · SYNTHETIC VISUALS": [
    "研究报告指标 · 合成示意图",
    "研究報告指標 · 合成示意圖"
  ],
  "Test whether an accelerated MRI reconstruction is not only visually plausible but also data-consistent and useful for downstream evaluation.": [
    "探索加速 MRI 重建能否在视觉合理之外，同时满足数据一致性，并支持下游评估任务。",
    "探索加速 MRI 重建能否在視覺合理之外，同時滿足資料一致性，並支援下游評估任務。"
  ],
  "IMAGE QUALITY · UNCERTAINTY · DOWNSTREAM USE": [
    "图像质量 · 不确定性 · 下游应用",
    "影像質量 · 不確定性 · 下游應用"
  ],
  "STUDY RESULTS + INTERACTIVE EXPLANATIONS": [
    "研究结果与互动说明",
    "研究結果與互動說明"
  ],
  "RESEARCH SHOWCASE": [
    "研究展示",
    "研究展示"
  ],
  "Compare the study’s reported results and explore the calculations behind them. The Recorded images tab contains a saved source figure; the interactive phantoms are synthetic. This page does not run a trained MRI model.": ["比较研究报告的结果，并探索其背后的计算。“已保存图像”标签页包含原始研究图；交互模体是合成的。此页面不运行训练好的 MRI 模型。", "比較研究報告的結果，並探索其背後的計算。「已儲存影像」分頁包含原始研究圖；互動假體是合成的。此頁面不執行訓練好的 MRI 模型。"],
  "NOT FOR CLINICAL USE": [
    "不用于临床",
    "不用於臨床"
  ],
  "Trust analysis views": [
    "可信度分析视图",
    "可信度分析檢視"
  ],
  "MRI reconstruction lab": [
    "MRI 重建实验室",
    "MRI 重建實驗室"
  ],
  "Study results · recorded images · interactive phantoms": ["研究结果 · 已保存图像 · 交互示意", "研究結果 · 已儲存影像 · 互動示意"],
} as const satisfies ProjectCopyTable;
