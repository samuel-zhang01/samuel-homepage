"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import Image from "next/image";
import ClassicSelect from "@/components/ClassicSelect";
import { useEffect, useState } from "react";
import styles from "./ScientificPlayback.module.css";
import { useProjectLocale } from "./ProjectTranslationBoundary";

function useScientificText() {
  const locale = useProjectLocale();
  return (en: string, simplified: string, traditional: string) => locale === "zh-CN" ? simplified : locale === "zh-TW" ? traditional : en;
}

type FlowSequence = "gnn-rollout" | "gnn-simulation";
const channels = [{ id: "velocity-y", label: "Vertical velocity · v" }, { id: "velocity-x", label: "Horizontal velocity · u" }, { id: "pressure", label: "Pressure · p" }] as const;
type FlowChannel = (typeof channels)[number]["id"] | "all";
const framePath = (sequence: FlowSequence, frame: number, channel: string) => `/projects/neural-cfd/media/${sequence}/frame-${String(frame).padStart(2, "0")}-${channel}.webp`;
const forecastModels = [
  { id: "fno-baseline", label: "Fourier operator", image: "fno-baseline-prediction.webp", note: "A Fourier neural operator processes a ten-frame input window and predicts the next ten frames. This image shows the horizontal-velocity forecast at index 9." },
  { id: "fno-residual", label: "Residual FNO", image: "fno-residual-prediction.webp", note: "Five residual Fourier blocks combine spectral interactions with a pointwise path. The saved image shows horizontal velocity at forecast index 9." },
  { id: "fno-multiscale", label: "Position-encoded FNO", image: "fno-multiscale-prediction.webp", note: "Spatial and temporal coordinates join the flow channels before Fourier processing. This image shows horizontal velocity at forecast index 9." },
  { id: "unet", label: "U-Net", image: "unet-prediction.webp", note: "An encoder–decoder predicts the next flow field on an 80 × 320 grid. Skip connections restore spatial detail as the decoder upsamples." },
];

export function CfdFlowPlayer() {
  const t = useScientificText();
  const [view, setView] = useState<"motion" | "forecasts">("motion");
  const [sequence, setSequence] = useState<FlowSequence>("gnn-rollout");
  const [frame, setFrame] = useState(0);
  const [channelFilter, setChannelFilter] = useState<FlowChannel>("velocity-y");
  const [referenceFrame, setReferenceFrame] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(8);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [forecast, setForecast] = useState(2);
  const frames = sequence === "gnn-rollout" ? 20 : 30;
  const model = forecastModels[forecast];
  const visibleChannels = channels.filter((channel) => channelFilter === "all" || channel.id === channelFilter);
  const expectedFrames = frames * visibleChannels.length;
  useEffect(() => {
    let cancelled = false;
    let count = 0;
    setLoaded(0); setFailed(false);
    if (view !== "motion") return;
    for (let index = 0; index < frames; index++) for (const channel of channels.filter((item) => channelFilter === "all" || item.id === channelFilter)) {
      const image = new window.Image();
      image.onload = () => { if (!cancelled) setLoaded(++count); };
      image.onerror = () => { if (!cancelled) setFailed(true); };
      image.src = framePath(sequence, index, channel.id);
    }
    return () => { cancelled = true; };
  }, [frames, sequence, channelFilter, view]);
  useEffect(() => {
    if (!playing || view !== "motion" || loaded < expectedFrames) return;
    let timer: number | undefined;
    const syncPlayback = () => {
      window.clearInterval(timer);
      timer = undefined;
      if (!document.hidden) timer = window.setInterval(() => setFrame((value) => (value + 1) % frames), 1000 / fps);
    };
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", syncPlayback); };
  }, [playing, view, loaded, expectedFrames, frames, fps]);

  return <ProjectCopy copy={scientificCopy}><section className={styles.studio} aria-label="Neural CFD flow explorer">
    <header className={styles.header}><span>Fluid dynamics · neural field prediction</span><h2>Neural CFD Surrogates</h2><p>Follow the wake behind a cylinder, move through the predicted frames, and explore Fourier, graph and convolutional models.</p></header>
    <nav className={styles.tabs} aria-label="Explore CFD results"><button aria-pressed={view === "motion"} onClick={() => setView("motion")}>Flow in motion</button><button aria-pressed={view === "forecasts"} onClick={() => { setView("forecasts"); setPlaying(false); }}>FNO &amp; U-Net forecasts</button></nav>
    {view === "motion" ? <>
      <div className={styles.sequenceBar}><div><button aria-pressed={sequence === "gnn-rollout"} onClick={() => { setSequence("gnn-rollout"); setFrame(0); setReferenceFrame(null); setPlaying(false); }}>GNN prediction</button><button aria-pressed={sequence === "gnn-simulation"} onClick={() => { setSequence("gnn-simulation"); setFrame(0); setReferenceFrame(null); setPlaying(false); }}>Simulation sequence</button></div><span>{sequence === "gnn-rollout" ? "20 predicted frames" : "30 simulation frames"}</span></div>
      <nav className={styles.channelChoices} aria-label="Flow field channel">{channels.map((channel) => <button key={channel.id} type="button" aria-pressed={channelFilter === channel.id} onClick={() => { setChannelFilter(channel.id); setPlaying(false); }}>{channel.label}</button>)}<button type="button" aria-pressed={channelFilter === "all"} onClick={() => { setChannelFilter("all"); setPlaying(false); }}>All three fields</button></nav>
      <div className={styles.playback}><button className={styles.playButton} disabled={failed || loaded < expectedFrames} aria-label={playing ? "Pause flow" : "Play flow"} onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : loaded < expectedFrames ? "Loading frames…" : "Play flow"}<span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span></button><button onClick={() => { setFrame((value) => (value + frames - 1) % frames); setPlaying(false); }} aria-label="Previous frame">←</button><label className={styles.scrubber}><span>Frame {frame + 1} / {frames}</span><input aria-label="Flow frame" type="range" min={0} max={frames - 1} value={frame} onChange={(event) => { setFrame(Number(event.target.value)); setPlaying(false); }} /></label><button onClick={() => { setFrame((value) => (value + 1) % frames); setPlaying(false); }} aria-label="Next frame">→</button><label className={styles.speed}><span>Playback</span><ClassicSelect aria-label="Playback speed" value={fps} onChange={(event) => setFps(Number(event.target.value))}><option value={4}>4 fps</option><option value={8}>8 fps</option><option value={20}>20 fps</option></ClassicSelect></label></div>
      <div className={styles.referenceControls}>
        <div><button type="button" onClick={() => { setReferenceFrame(frame); setPlaying(false); }}>{t("Pin current frame", "固定当前帧", "固定目前影格")}</button><button type="button" disabled={referenceFrame === null} onClick={() => setReferenceFrame(null)}>{t("Clear reference", "清除参考帧", "清除參考影格")}</button></div>
        <p>{referenceFrame === null
          ? t("Pin a frame, then scrub or play to inspect how the wake changes within this sequence.", "固定一帧，然后拖动或播放，观察同一序列中尾流的变化。", "固定一個影格，然後拖動或播放，觀察同一序列中尾流的變化。")
          : <>{t("Reference frame", "参考帧", "參考影格")} {referenceFrame + 1} · {t("Offset", "帧间隔", "影格間隔")} {frame - referenceFrame > 0 ? "+" : ""}{frame - referenceFrame} {t("saved-frame intervals", "（保存帧）", "（已儲存影格）")}</>}</p>
      </div>
      <div className={styles.fieldStack}>{visibleChannels.map((channel) => <div className={referenceFrame === null ? styles.singleField : styles.fieldComparison} key={channel.id}>
        {referenceFrame !== null && <figure><figcaption><strong>{channel.label}</strong><span>{t("Reference", "参考", "參考")} · {referenceFrame + 1}</span></figcaption><Image unoptimized width={360} height={80} src={framePath(sequence, referenceFrame, channel.id)} alt={`${channel.label}, ${t("reference frame", "参考帧", "參考影格")} ${referenceFrame + 1}`} /></figure>}
        <figure><figcaption><strong>{channel.label}</strong><span>{t("Frame", "帧", "影格")} {String(frame + 1).padStart(2, "0")}</span></figcaption><Image unoptimized width={360} height={80} src={framePath(sequence, frame, channel.id)} alt={`${channel.label}, ${sequence === "gnn-rollout" ? "predicted" : "simulation"} frame ${frame + 1}, flow past a cylinder`} /></figure>
      </div>)}</div>
      <div className={styles.readingGuide}>
        <strong>{t("What to inspect", "观察重点", "觀察重點")}</strong>
        <p>{channelFilter === "velocity-y"
          ? t("Follow the alternating transverse-velocity pattern behind the cylinder. It describes motion across the main flow direction; it is not a vorticity map.", "观察圆柱后方交替出现的横向速度分布。它表示垂直于主流方向的运动，而不是涡量图。", "觀察圓柱後方交替出現的橫向速度分布。它表示垂直於主流方向的運動，而不是渦量圖。")
          : channelFilter === "velocity-x"
            ? t("Follow the downstream velocity pattern around and behind the cylinder. Compare the position and shape of the wake across saved frames.", "观察圆柱周围及后方的流向速度分布，比较各保存帧中尾流的位置与形状。", "觀察圓柱周圍及後方的流向速度分布，比較各已儲存影格中尾流的位置與形狀。")
            : channelFilter === "pressure"
              ? t("Inspect the pressure pattern around the obstacle and through the wake. Per-frame colour scaling does not preserve an absolute pressure comparison.", "观察障碍物周围与尾流中的压力分布。每帧独立缩放的颜色不能用于比较绝对压力。", "觀察障礙物周圍與尾流中的壓力分布。每個影格獨立縮放的顏色不能用於比較絕對壓力。")
              : t("The three channels show the same saved state. Compare where changes appear in transverse velocity, downstream velocity and pressure.", "三个通道显示同一个保存状态。比较横向速度、流向速度和压力中变化出现的位置。", "三個通道顯示同一個已儲存狀態。比較橫向速度、流向速度和壓力中變化出現的位置。")}</p>
        {referenceFrame !== null && <p>{t("Both panels belong to the selected sequence. This is a temporal comparison, not a prediction-versus-truth error measurement. Changing sequence clears the reference; colours are independently scaled in each saved frame.", "两幅图来自所选的同一序列。这是时间变化比较，不是预测与真值的误差测量。切换序列会清除参考帧；每个保存帧的颜色均独立缩放。", "兩幅圖來自所選的同一序列。這是時間變化比較，不是預測與真值的誤差測量。切換序列會清除參考影格；每個已儲存影格的顏色均獨立縮放。")}</p>}
      </div>
      {failed && <p className={styles.note} role="status">A frame could not load. Reload the project to try again.</p>}
      <div className={styles.explanation}><div><h3>{sequence === "gnn-rollout" ? "Each prediction becomes the next input." : "A wake moves across the mesh."}</h3><p>{sequence === "gnn-rollout" ? "The graph network updates velocity and pressure at mesh nodes, then feeds its predicted field into the next step. The triangular mesh stays fixed as the state evolves." : "These saved simulation snapshots show vertical velocity, horizontal velocity and pressure over the same cylinder domain. Vertical velocity reveals the alternating wake above and below the centre line."}</p></div><p className={styles.note}>Recorded GNN results: 20 autoregressive predictions and 30 simulation frames. The sequences start from different states. Colours rescale per field and frame, so colour alone cannot compare magnitudes across time; playback speed is a display setting.</p></div>
      <details className={styles.sourceDetails}><summary>Reading the animation</summary><p>The slider moves through recorded fields on the original triangular mesh. Use the frame comparison to inspect the wake’s position and shape; the model is not being run again in the browser.</p><p>The architecture view explains message passing, and the results view gives the recorded relative L2 with its evaluation conditions. The rollout experiment shows how repeated prediction can amplify error.</p></details>
    </> : <div className={styles.forecasts}><nav className={styles.modelChoices} aria-label="Forecast model">{forecastModels.map((item, index) => <button key={item.id} aria-pressed={forecast === index} onClick={() => setForecast(index)}>{item.label}</button>)}</nav><figure className={styles.forecastFigure}><Image unoptimized src={`/projects/neural-cfd/media/${model.image}`} alt={`${model.label} saved horizontal velocity prediction around a cylinder`} width={700} height={500} /><figcaption>{model.note}</figcaption></figure><p className={styles.note}>These FNO and U-Net forecasts are recorded still figures. The motion tab plays GNN results. Use the architecture and results tabs to connect each picture with its model and evaluation conditions.</p><div className={styles.modelCards}><article><span>Fourier</span><h3>Fields in frequency space</h3><p>Spectral blocks learn interactions between Fourier modes. A pointwise path and residual connections carry local information between blocks.</p></article><article><span>Graph</span><h3>Messages on a mesh</h3><p>Node states combine with edge geometry. Message aggregation updates each node before the next velocity and pressure prediction.</p></article><article><span>U-Net</span><h3>Detail across scales</h3><p>Downsampling collects wider spatial context. The decoder combines it with earlier feature maps through skip connections.</p></article></div></div>}
  </section></ProjectCopy>;
}

const robotSamples = [
  { id: 1, pose: 12, pitch: 30, roll: 45, depth: .18 },
  { id: 2, pose: 27, pitch: 60, roll: 0, depth: .36 },
  { id: 3, pose: 39, pitch: 90, roll: 0, depth: .47 },
];
const microscopyPoses = [[60, 0], [85, 0], [65, 0], [15, 30], [70, 0]];

export function MicrorobotResults() {
  const t = useScientificText();
  const [task, setTask] = useState<"pose" | "depth" | "compare">("pose");
  const [sampleIndex, setSampleIndex] = useState(0);
  const [overlay, setOverlay] = useState(65);
  const sample = robotSamples[sampleIndex];
  const imagePath = (kind: string) => `/projects/microrobot/media/${task === "compare" ? "pose" : task}-sample-${sample.id}-${kind}.webp`;
  return <ProjectCopy copy={scientificCopy}><section className={styles.studio} aria-label="Microrobot vision results">
    <header className={styles.header}><span>Microscopy · pose &amp; depth</span><h2>Microrobot Pose &amp; Depth</h2><p>Explore real microscope images and the regions a ResNet34 model responds to when estimating orientation and depth.</p></header>
    <nav className={styles.tabs} aria-label="Microrobot prediction task"><button aria-pressed={task === "pose"} onClick={() => setTask("pose")}>{t("Pose classification", "姿态分类", "姿態分類")}</button><button aria-pressed={task === "depth"} onClick={() => setTask("depth")}>{t("Depth estimation", "深度估计", "深度估計")}</button><button aria-pressed={task === "compare"} onClick={() => setTask("compare")}>{t("Compare tasks", "比较任务", "比較任務")}</button></nav>
    <div className={styles.robotControls}><div role="group" aria-label="Microrobot sample">{robotSamples.map((item, index) => <button key={item.id} aria-pressed={sampleIndex === index} onClick={() => setSampleIndex(index)}>{t(`Sample ${item.id}`, `样本 ${item.id}`, `樣本 ${item.id}`)}</button>)}</div><label>{t("Heatmap blend", "热图混合", "熱圖混合")} <strong>{overlay}%</strong><input aria-label={t("Heatmap blend", "热图混合", "熱圖混合")} type="range" min={0} max={100} value={overlay} onChange={(event) => setOverlay(Number(event.target.value))} /></label></div>
    {task === "compare" ? <section className={styles.taskComparison} aria-label={t("Same-input attribution comparison", "同一输入的归因比较", "同一輸入的歸因比較")}>
      <div className={styles.readingGuide}><strong>{t("One microscope image, two prediction targets", "一张显微图像，两个预测目标", "一張顯微影像，兩個預測目標")}</strong><p>{t("The same input is shown for both separately trained ResNet34 models. Move the shared blend slider to compare where their recorded positive Grad-CAM responses appear.", "两种分别训练的 ResNet34 模型使用相同输入。移动共享混合滑块，比较已记录的正 Grad-CAM 响应出现的位置。", "兩種分別訓練的 ResNet34 模型使用相同輸入。移動共用混合滑桿，比較已記錄的正 Grad-CAM 回應出現的位置。")}</p></div>
      <div className={styles.robotPanels}>
        <figure><Image unoptimized src={imagePath("original")} width={214} height={213} alt={t(`Shared microscope image, sample ${sample.id}`, `共同显微图像，样本 ${sample.id}`, `共同顯微影像，樣本 ${sample.id}`)} /><figcaption>{t("Shared input", "共同输入", "共同輸入")}</figcaption></figure>
        {(["pose", "depth"] as const).map((comparedTask) => <figure key={comparedTask}>
          <div className={styles.robotBlend}><Image unoptimized src={imagePath("original")} width={214} height={213} alt={t(`${comparedTask === "pose" ? "Pose" : "Depth"} attribution overlay, sample ${sample.id}`, `${comparedTask === "pose" ? "姿态" : "深度"}归因叠加，样本 ${sample.id}`, `${comparedTask === "pose" ? "姿態" : "深度"}歸因疊加，樣本 ${sample.id}`)} /><Image className={styles.blendLayer} style={{ opacity: overlay / 100 }} unoptimized src={`/projects/microrobot/media/${comparedTask}-sample-${sample.id}-heatmap.webp`} width={214} height={213} alt="" /></div>
          <figcaption>{comparedTask === "pose" ? t("Pose-class response", "姿态类别响应", "姿態類別回應") : t("Depth-output response", "深度输出响应", "深度輸出回應")}</figcaption>
        </figure>)}
      </div>
      <div className={styles.attributionLedger}>
        <article><span>{t("Pose model", "姿态模型", "姿態模型")}</span><h3>{t("Predicted class score", "预测类别得分", "預測類別分數")}</h3><p>{t("Gradients target the selected class output in the final residual block.", "梯度针对最终残差块中所选类别的输出。", "梯度針對最終殘差區塊中所選類別的輸出。")}</p><strong>{t("Label / prediction", "标签／预测", "標籤／預測")} · {sample.pose} / {sample.pose}</strong><small>{sample.pitch}° {t("pitch", "俯仰", "俯仰")} · {sample.roll}° {t("roll", "横滚", "滾轉")}</small></article>
        <article><span>{t("Depth model", "深度模型", "深度模型")}</span><h3>{t("Scalar depth output", "标量深度输出", "純量深度輸出")}</h3><p>{t("Gradients target the regression output in the final residual block.", "梯度针对最终残差块中的回归输出。", "梯度針對最終殘差區塊中的迴歸輸出。")}</p><strong>{t("Recorded target", "记录的目标值", "記錄的目標值")} · {sample.depth.toFixed(2)}</strong><small>{t("Normalised depth; no numerical prediction in this saved panel.", "归一化深度；保存的图中没有数值预测。", "正規化深度；已儲存的圖中沒有數值預測。")}</small></article>
      </div>
      <div className={styles.readingGuide} aria-live="polite"><strong>{sample.id === 1 ? t("Why is the depth map blue?", "为什么深度图为蓝色？", "為什麼深度圖為藍色？") : t("Read location, not confidence", "观察位置，而非置信度", "觀察位置，而非信心值")}</strong><p>{sample.id === 1
        ? t("The saved depth response is zero after positive clipping at this layer. This does not establish zero prediction error, zero gradients everywhere, or an unusable model.", "该层保存的深度响应在截去负值后为零。这并不说明预测误差为零、所有梯度均为零或模型不可用。", "該層已儲存的深度回應在截去負值後為零。這並不表示預測誤差為零、所有梯度均為零或模型不可用。")
        : t("Each positive heatmap is divided by its own maximum. Equally warm colours across models do not represent equal confidence or equal attribution magnitude.", "每张正响应热图都除以自身的最大值。不同模型中同样暖的颜色不代表相同置信度或相同归因幅度。", "每張正回應熱圖都除以自身的最大值。不同模型中同樣暖的顏色不代表相同信心值或相同歸因幅度。")}</p><p>{t("Both maps use the final ResNet34 residual block and the same microscope image, so you can compare which locations each task emphasises.", "两张图使用 ResNet34 最后的残差块和同一张显微图像，可以比较两种任务强调的位置。", "兩張圖使用 ResNet34 最後的殘差區塊和同一張顯微影像，可以比較兩種任務強調的位置。")}</p></div>
    </section> : <>
    <div className={styles.robotPanels}>
      <figure><Image unoptimized src={imagePath("original")} width={214} height={213} alt={`Microscopy image for sample ${sample.id}`} priority /><figcaption>Microscope image</figcaption></figure>
      <figure><Image unoptimized src={imagePath("heatmap")} width={213} height={213} alt={`${task} Grad-CAM map for sample ${sample.id}`} /><figcaption>Model response · Grad-CAM</figcaption></figure>
      <figure><div className={styles.robotBlend}><Image unoptimized src={imagePath("original")} width={214} height={213} alt={`Sample ${sample.id} with adjustable model response overlay`} /><Image className={styles.blendLayer} style={{ opacity: overlay / 100 }} unoptimized src={imagePath("heatmap")} width={214} height={213} alt="" /></div><figcaption>Adjustable overlay</figcaption></figure>
    </div>
    <div className={styles.robotReading} aria-live="polite">
      {task === "pose" ? <><div><span>Labelled orientation</span><strong>{sample.pitch}° pitch · {sample.roll}° roll</strong></div><div><span>Predicted orientation</span><strong>{sample.pitch}° pitch · {sample.roll}° roll</strong></div><div><span>Pose class</span><strong>{sample.pose}</strong></div></> : <><div><span>Labelled depth</span><strong>{sample.depth.toFixed(2)} · normalised</strong></div><p>The regression model uses image texture and diffraction rings to estimate depth. This view shows its response for the selected image.</p></>}
    </div>
    </>}
    <p className={styles.robotNote}>Warmer regions show stronger positive Grad-CAM response, scaled within each example.{task === "depth" && sample.id === 1 ? " This depth example has zero positive response in the selected layer." : ""}</p>
    <details className={styles.sourceDetails}><summary>How to interpret the results</summary><p>These are recorded ResNet34 microscope inputs and computed Grad-CAM outputs. The three pose examples have matching labelled and predicted classes. The saved depth panels provide target labels without numerical predictions, so this viewer does not infer a depth error from the heatmap.</p><p>The final-run accuracy used a random frame split and test-monitored epoch selection. Adjacent frames may cross the split. Open the visual benchmark for the recorded run comparison, or the sequence-split experiment to see how holding out whole recordings changes the unit of evaluation.</p></details>
    <details className={styles.gallery}><summary>Explore more microscope images</summary><div>{microscopyPoses.map(([pitch, roll], index) => <figure key={index}><Image unoptimized src={`/projects/microrobot/media/microscopy-sample-${index + 1}.webp`} width={270} height={269} alt={`Microrobot at ${pitch} degrees pitch and ${roll} degrees roll`} /><figcaption>{pitch}° pitch · {roll}° roll</figcaption></figure>)}</div></details>
  </section></ProjectCopy>;
}
