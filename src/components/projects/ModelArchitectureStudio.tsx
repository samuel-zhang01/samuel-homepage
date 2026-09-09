"use client";
import { projectText } from "@/lib/projectCopy";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { type CSSProperties, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { DemoWindow } from "./DemoChrome";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";
import styles from "./ModelArchitectureStudio.module.css";

type Task = "classification" | "depth";
type ModelId = "simple" | "resnet18" | "resnet34" | "mobilenet" | "vit";

type Stage = {
  id: string;
  label: string;
  operation: string;
  shape: string;
  parameters: number;
  width: number;
  height: number;
  residual?: boolean;
  role: string;
};

type ModelRecord = {
  id: ModelId;
  name: string;
  shortName: string;
  family: string;
  origin: "authored" | "pretrained";
  originLabel: string;
  colour: string;
  parameters: Record<Task, number>;
  classification: {
    csvTestAccuracy: number;
    csvValidationAccuracy: number;
    reportAccuracy: number;
  };
  depth: {
    reportRmse: number;
    reportMae: number;
    reportR2: number;
  };
  training: Record<Task, { learningRate: string; optimiser: string; epochs: number }>;
  stages: (task: Task) => Stage[];
  architectureNote: string;
};

type TimelineEvent = {
  date: string;
  commit: string;
  title: string;
  detail: string;
  kind: "design" | "data" | "run" | "selection" | "release";
};


function headStage(task: Task, input: number, classificationParameters: number, depthParameters: number): Stage {
  return task === "classification"
    ? {
        id: "head",
        label: "Pose head",
        operation: `Linear(${input}, 40) · logits`,
        shape: "40 classes",
        parameters: classificationParameters,
        width: 30,
        height: 58,
        role: "Choose among 40 combinations of pitch and roll to estimate the robot’s orientation.",
      }
    : {
        id: "head",
        label: "Depth head",
        operation: `Linear(${input}, 256) → ReLU → Dropout(0.3) → Linear(256, 1) → Sigmoid`,
        shape: "1 normalized depth",
        parameters: depthParameters,
        width: 26,
        height: 52,
        role: "Estimate one normalised depth value; Sigmoid constrains the output to [0,1].",
      };
}

function simpleStages(task: Task): Stage[] {
  return [
    {
      id: "input",
      label: "Microscopy input",
      operation: "Single-channel tensor",
      shape: "1 × 224 × 224",
      parameters: 0,
      width: 60,
      height: 150,
      role: "Give every model the same-sized grayscale view of the microrobot.",
    },
    {
      id: "block1",
      label: "Block 1",
      operation: "Conv 3×3, 1→32 · ReLU · MaxPool 4×4",
      shape: "32 × 56 × 56",
      parameters: 320,
      width: 55,
      height: 130,
      role: "Detect local image patterns and reduce the spatial resolution by four.",
    },
    {
      id: "block2",
      label: "Block 2",
      operation: "Conv 3×3, 32→64 · Pool 2×2 · 1×1 skip add",
      shape: "64 × 28 × 28",
      parameters: 20_608,
      width: 51,
      height: 111,
      residual: true,
      role: "Build richer features while a learned skip aligns the change from 32 to 64 channels.",
    },
    {
      id: "block3",
      label: "Block 3",
      operation: "Conv 3×3, 64→128 · Pool 2×2 · 1×1 skip add",
      shape: "128 × 14 × 14",
      parameters: 82_176,
      width: 48,
      height: 94,
      residual: true,
      role: "Combine a wider field of view with a learned skip from 64 to 128 channels.",
    },
    {
      id: "block4",
      label: "Block 4",
      operation: "Conv 5×5, 128→128 · Pool 2×2 · identity add",
      shape: "128 × 7 × 7",
      parameters: 409_728,
      width: 44,
      height: 76,
      residual: true,
      role: "Use a wider convolution to gather context while an identity skip preserves earlier features.",
    },
    {
      id: "block5",
      label: "Block 5",
      operation: "Conv 5×5, 128→128 · identity add",
      shape: "128 × 7 × 7",
      parameters: 409_728,
      width: 44,
      height: 76,
      residual: true,
      role: "Refine the image features at the same resolution before the dense layers.",
    },
    {
      id: "dense",
      label: "Dense representation",
      operation: "Flatten 6,272 → Linear 512 · ReLU",
      shape: "512 features",
      parameters: 3_211_776,
      width: 34,
      height: 64,
      role: "Combine the 7×7 spatial feature map into one representation for the task head.",
    },
    task === "classification"
      ? {
          id: "head",
          label: "Pose head",
          operation: "Linear(512, 40) · CrossEntropy logits",
          shape: "40 classes",
          parameters: 20_520,
          width: 27,
          height: 52,
          role: "Produce 40 orientation scores, trained with cross-entropy.",
        }
      : {
          id: "head",
          label: "Depth head",
          operation: "Linear(512, 1) · MSE target",
          shape: "1 depth value",
          parameters: 513,
          width: 22,
          height: 45,
          role: "Predict depth directly with a linear output, trained with mean squared error.",
        },
  ];
}

function resnetStages(task: Task, depth: 18 | 34): Stage[] {
  const layerParameters = depth === 34
    ? [221_952, 1_116_416, 6_822_400, 13_114_368]
    : [147_968, 525_568, 2_099_712, 8_393_728];
  const repeats = depth === 34 ? [3, 4, 6, 3] : [2, 2, 2, 2];
  return [
    {
      id: "input",
      label: "Microscopy input",
      operation: "Single-channel tensor",
      shape: "1 × 224 × 224",
      parameters: 0,
      width: 60,
      height: 150,
      role: "Use microscope intensity directly as a single image channel.",
    },
    {
      id: "stem",
      label: "Grayscale stem",
      operation: "Conv 7×7, 1→64, stride 2 · BatchNorm · ReLU · MaxPool",
      shape: "64 × 56 × 56",
      parameters: 3_264,
      width: 54,
      height: 128,
      role: "Convert grayscale patterns into 64 feature channels and reduce image resolution",
    },
    ...[64, 128, 256, 512].map((channels, index): Stage => ({
      id: `layer${index + 1}`,
      label: `Residual stage ${index + 1}`,
      operation: `${repeats[index]} basic blocks · two 3×3 convolutions per block${index ? " · downsample on entry" : ""}`,
      shape: `${channels} × ${56 / (2 ** index)} × ${56 / (2 ** index)}`,
      parameters: layerParameters[index],
      width: 51 - index * 4,
      height: 112 - index * 17,
      residual: true,
      role: `Combine ${repeats[index]} residual blocks at this scale; skip paths help retain features through the deeper network.`,
    })),
    {
      id: "pool",
      label: "Global pool",
      operation: "Adaptive average pool",
      shape: "512 × 1 × 1",
      parameters: 0,
      width: 30,
      height: 45,
      role: "Average each feature channel over the image before making a single prediction.",
    },
    headStage(task, 512, 20_520, 131_585),
  ];
}

function mobileStages(task: Task): Stage[] {
  return [
    {
      id: "input",
      label: "Microscopy input",
      operation: "Single-channel tensor",
      shape: "1 × 224 × 224",
      parameters: 0,
      width: 60,
      height: 150,
      role: "Feed the same grayscale image into the compact model.",
    },
    {
      id: "early",
      label: "Stem + early IR",
      operation: "Conv 3×3 1→16 · inverted residual blocks 1–3",
      shape: "24 × 28 × 28",
      parameters: 10_200,
      width: 52,
      height: 118,
      residual: true,
      role: "Extract early patterns using inexpensive inverted residual blocks.",
    },
    {
      id: "middle",
      label: "SE bottlenecks",
      operation: "Inverted residual blocks 4–8 · 5×5 depthwise · squeeze/excitation",
      shape: "48 × 14 × 14",
      parameters: 180_032,
      width: 47,
      height: 93,
      residual: true,
      role: "Use depthwise filters for spatial detail and channel attention to emphasise useful features.",
    },
    {
      id: "late",
      label: "Late bottlenecks",
      operation: "Inverted residual blocks 9–11 · final 1×1 projection",
      shape: "576 × 7 × 7",
      parameters: 736_488,
      width: 42,
      height: 72,
      residual: true,
      role: "Build higher-level features and expand their channel representation before pooling.",
    },
    {
      id: "embedding",
      label: "Mobile embedding",
      operation: "Adaptive pool → Linear(576, 1024) · Hardswish · Dropout",
      shape: "1,024 features",
      parameters: 590_848,
      width: 34,
      height: 57,
      role: "Pool the image into a compact representation shared by either task head.",
    },
    task === "classification"
      ? {
          id: "head",
          label: "Pose head",
          operation: "Linear(1,024, 40)",
          shape: "40 classes",
          parameters: 41_000,
          width: 27,
          height: 50,
          role: "Map the compact image representation to 40 orientation classes.",
        }
      : {
          id: "head",
          label: "Depth head",
          operation: "Linear(1,024, 1)",
          shape: "1 depth value",
          parameters: 1_025,
          width: 22,
          height: 44,
          role: "Map the image representation directly to one depth value.",
        },
  ];
}

function vitStages(task: Task): Stage[] {
  return [
    {
      id: "input",
      label: "Microscopy input",
      operation: "Single-channel tensor",
      shape: "1 × 224 × 224",
      parameters: 0,
      width: 60,
      height: 150,
      role: "Use one grayscale channel, matching the other models’ inputs.",
    },
    {
      id: "patch",
      label: "Patch projection",
      operation: "Conv 16×16, stride 16, 1→768 · averaged RGB weights",
      shape: "196 × 768 patches",
      parameters: 196_608,
      width: 53,
      height: 124,
      role: "Divide the image into 16×16 patches and embed each patch in 768 features.",
    },
    {
      id: "tokens",
      label: "Token sequence",
      operation: "Prepend class token · add positional embedding",
      shape: "197 × 768 tokens",
      parameters: 152_064,
      width: 48,
      height: 106,
      role: "Keep track of patch position and add a token that will summarise the whole image.",
    },
    {
      id: "encoder",
      label: "Transformer encoder",
      operation: "12 encoder blocks · 12-head self-attention · MLP",
      shape: "197 × 768",
      parameters: 85_056_000,
      width: 42,
      height: 85,
      residual: true,
      role: "Let each patch attend to other patches, building relationships across the image.",
    },
    {
      id: "class-token",
      label: "Class token",
      operation: "Select encoded CLS representation",
      shape: "768 features",
      parameters: 0,
      width: 32,
      height: 56,
      role: "Read the whole-image summary for pose classification or depth estimation.",
    },
    headStage(task, 768, 30_760, 197_121),
  ];
}

const models: ModelRecord[] = [
  {
    id: "simple",
    name: "SimpleCNN with residual skips",
    shortName: "SimpleCNN",
    family: "Five-block convolutional network",
    origin: "authored",
    originLabel: "Custom model · trained from scratch",
    colour: "#b24b45",
    parameters: { classification: 4_154_856, depth: 4_134_849 },
    classification: { csvValidationAccuracy: 0.99, csvTestAccuracy: 0.9775, reportAccuracy: 0.9825 },
    depth: { reportRmse: 0.0478, reportMae: 0.0354, reportR2: 0.973 },
    training: {
      classification: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
    },
    stages: simpleStages,
    architectureNote: "Samuel’s custom CNN reduces 224→56→28→14→7, adds learned 1×1 skips where channels change, then combines the image into 512 features. The final layer changes for orientation or depth.",
  },
  {
    id: "resnet18",
    name: "ResNet18 grayscale adaptation",
    shortName: "ResNet18",
    family: "18-layer residual network",
    origin: "pretrained",
    originLabel: "ImageNet pretraining · task adaptation",
    colour: "#19818a",
    parameters: { classification: 11_190_760, depth: 11_301_825 },
    classification: { csvValidationAccuracy: 0.9925, csvTestAccuracy: 0.9875, reportAccuracy: 0.975 },
    depth: { reportRmse: 0.0256, reportMae: 0.0189, reportR2: 0.993 },
    training: {
      classification: { learningRate: "1e−4", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "5e−5", optimiser: "Adam", epochs: 100 },
    },
    stages: (task) => resnetStages(task, 18),
    architectureNote: "This adaptation starts from an ImageNet-pretrained ResNet18, replaces the colour-image input with a fresh grayscale stem, and learns a new orientation or depth head.",
  },
  {
    id: "resnet34",
    name: "ResNet34 grayscale adaptation",
    shortName: "ResNet34",
    family: "34-layer residual network",
    origin: "pretrained",
    originLabel: "ImageNet pretraining · task adaptation",
    colour: "#28498f",
    parameters: { classification: 21_298_920, depth: 21_409_985 },
    classification: { csvValidationAccuracy: 0.995, csvTestAccuracy: 0.985, reportAccuracy: 0.985 },
    depth: { reportRmse: 0.0256, reportMae: 0.0181, reportR2: 0.994 },
    training: {
      classification: { learningRate: "5e−5", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "5e−5", optimiser: "Adam", epochs: 100 },
    },
    stages: (task) => resnetStages(task, 34),
    architectureNote: "A deeper ImageNet-pretrained model combines residual stages [3,4,6,3] with a fresh grayscale stem and separate pose/depth heads. It was selected for precise estimation in the project.",
  },
  {
    id: "mobilenet",
    name: "MobileNetV3-Small grayscale adaptation",
    shortName: "MobileNetV3",
    family: "Inverted residual + squeeze/excitation",
    origin: "pretrained",
    originLabel: "ImageNet pretraining · task adaptation",
    colour: "#8a5d12",
    parameters: { classification: 1_558_568, depth: 1_518_593 },
    classification: { csvValidationAccuracy: 0.995, csvTestAccuracy: 0.9775, reportAccuracy: 0.975 },
    depth: { reportRmse: 0.0325, reportMae: 0.0241, reportR2: 0.989 },
    training: {
      classification: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
    },
    stages: mobileStages,
    architectureNote: "The compact candidate uses inexpensive depthwise filters and channel attention. A fresh grayscale input layer and task-specific output adapt it to microscope images.",
  },
  {
    id: "vit",
    name: "Vision Transformer B/16 grayscale adaptation",
    shortName: "ViT-B/16",
    family: "16×16 patch transformer",
    origin: "pretrained",
    originLabel: "ImageNet pretraining · task adaptation",
    colour: "#6a3a82",
    parameters: { classification: 85_435_432, depth: 85_601_793 },
    classification: { csvValidationAccuracy: 0.985, csvTestAccuracy: 0.985, reportAccuracy: 0.9825 },
    depth: { reportRmse: 0.0265, reportMae: 0.0198, reportR2: 0.992 },
    training: {
      classification: { learningRate: "1e−5", optimiser: "AdamW", epochs: 100 },
      depth: { learningRate: "1e−5", optimiser: "Adam", epochs: 100 },
    },
    stages: vitStages,
    architectureNote: "The transformer compares information across 16×16 image patches. Averaging the pretrained colour-input weights adapts it to grayscale, and a new head estimates orientation or depth.",
  },
];

const timeline: TimelineEvent[] = [
  {
    date: "04 DEC 2025",
    commit: "1af6d06",
    title: "Frame the pose and depth prediction tasks",
    detail: "Define the microscopy problem, review related work and plan the comparison of orientation classifiers and depth estimators.",
    kind: "design",
  },
  {
    date: "07 DEC 2025",
    commit: "63adb26",
    title: "Correct image orientation before training",
    detail: "Correct image orientation metadata so the microscope image and its pose label stay aligned. Follow-up work refines the preprocessing.",
    kind: "data",
  },
  {
    date: "08 DEC 2025",
    commit: "872620a",
    title: "Inspect prediction errors and image attention",
    detail: "Compare training progress and errors for both tasks, then use Grad-CAM to inspect the image regions associated with orientation and depth predictions.",
    kind: "run",
  },
  {
    date: "10 DEC 2025",
    commit: "53496b4",
    title: "Compare five model families",
    detail: "Bring together confusion matrices, depth residuals and learned-feature views for SimpleCNN, ResNet18, ResNet34, MobileNetV3 and ViT.",
    kind: "run",
  },
  {
    date: "13 DEC 2025",
    commit: "d59a4a5",
    title: "Select models and prepare a prediction workflow",
    detail: "Use the recorded comparisons to select models, then prepare the image-loading and prediction workflow for handoff.",
    kind: "selection",
  },
  {
    date: "20 DEC 2025",
    commit: "0133d9b",
    title: "Explain the final models and results",
    detail: "Present the final ResNet analysis, roll–pitch orientation grid, architecture explanations and instructions for using the trained models.",
    kind: "release",
  },
  {
    date: "20 DEC 2025",
    commit: "19dacbe",
    title: "Refine the image-loading workflow",
    detail: "Refine loading and preprocessing so new microscopy images can follow the same prediction workflow.",
    kind: "release",
  },
];

function formatParameters(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 2 : 3)}M`;
  return value.toLocaleString("en-GB");
}


export function ModelArchitectureStudio({ locale = "en-GB" }: { locale?: Locale }) {
  const [modelId, setModelId] = useState<ModelId>("simple");
  const [task, setTask] = useState<Task>("classification");
  const [selectedStageId, setSelectedStageId] = useState("block2");
  const [turn, setTurn] = useState(-18);
  const [tilt, setTilt] = useState(8);
  const [explode, setExplode] = useState(8);
  const [spinning, setSpinning] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<"all" | TimelineEvent["kind"]>("all");

  const selectedModel = models.find((model) => model.id === modelId) ?? models[0];
  const stages = useMemo(() => selectedModel.stages(task), [selectedModel, task]);
  const selectedStage = stages.find((stage) => stage.id === selectedStageId) ?? stages[0];
  const filteredTimeline = timelineFilter === "all"
    ? timeline
    : timeline.filter((event) => event.kind === timelineFilter);
  const visibleMetricLabel = task === "classification" ? "Recorded test accuracy" : "Recorded depth RMSE";
  const visibleMetric = task === "classification"
    ? `${(selectedModel.classification.csvTestAccuracy * 100).toFixed(2)}%`
    : selectedModel.depth.reportRmse.toFixed(4);

  function chooseModel(id: ModelId) {
    const model = models.find((candidate) => candidate.id === id) ?? models[0];
    const nextStages = model.stages(task);
    setModelId(id);
    setSelectedStageId(nextStages[Math.min(1, nextStages.length - 1)].id);
  }

  function chooseTask(nextTask: Task) {
    setTask(nextTask);
    const nextStages = selectedModel.stages(nextTask);
    setSelectedStageId(nextStages.find((stage) => stage.id === selectedStageId)?.id ?? nextStages[0].id);
  }

  const sceneStyle = {
    "--scene-turn": `${turn}deg`,
    "--scene-tilt": `${tilt}deg`,
  } as CSSProperties;

  return (
    <ProjectCopy copy={scientificCopy} locale={locale}><ProjectTranslationBoundary locale={locale}>
    <DemoWindow
      appName="Microrobot vision"
      title="Finding orientation and depth from microscope images"
      status="5 Models · 2 tasks"
      purpose="Guiding a microrobot requires knowing where it is and how it is tilted. This project uses microscope images to classify orientation and estimate depth."
      tryThis="Switch between pose and depth, select a model, then click a stage to follow the image features into its prediction head."
      watchFor="The same image-processing backbone can serve two tasks. Compare the output head, model size and recorded performance as you switch."
      statusTone="safe"
      className={styles.studio}
      footer={(
        <>
          <span>5 Architectures · pose classification + depth estimation</span>
          <span>Interactive architecture diagrams</span>
        </>
      )}
    >
      <section className={styles.provenance} aria-label="Project contribution">
        <span>Research context</span>
        <p>Samuel built a custom CNN, adapted four pretrained image models to grayscale microscopy, and trained separate orientation and depth predictors. Image-orientation corrections, error plots and Grad-CAM comparisons helped examine what the models learned.</p>
        <strong>224 × 224 grayscale input · 40 orientations or one depth value</strong>
      </section>

      <section className={styles.modelStrip} aria-label="Model selection">
        {models.map((model) => (
          <button
            key={model.id}
            type="button"
            aria-pressed={model.id === modelId}
            style={{ "--model-colour": model.colour } as CSSProperties}
            onClick={() => chooseModel(model.id)}
          >
            <span>{model.origin === "authored" ? "Custom CNN" : "Pretrained"}</span>
            <strong>{model.shortName}</strong>
            <small>{formatParameters(model.parameters[task])} params</small>
          </button>
        ))}
      </section>

      <section className={styles.workbench}>
        <aside className={styles.inspector}>
          <div className={styles.panelCap}><span>01</span><strong>Model inspector</strong></div>
          <div className={styles.taskSwitch} role="group" aria-label="Task head">
            <button type="button" aria-pressed={task === "classification"} onClick={() => chooseTask("classification")}>Pose · 40 class</button>
            <button type="button" aria-pressed={task === "depth"} onClick={() => chooseTask("depth")}>Depth · regression</button>
          </div>

          <div className={styles.modelIdentity}>
            <span>{selectedModel.family}</span>
            <h3>{selectedModel.name}</h3>
            <div>
              <b className={selectedModel.origin === "authored" ? styles.authored : styles.pretrained}>{selectedModel.originLabel}</b>
            </div>
            <p>{selectedModel.architectureNote}</p>
          </div>

          <dl className={styles.modelFacts}>
            <div><dt>Trainable parameters</dt><dd>{selectedModel.parameters[task].toLocaleString("en-GB")}</dd></div>
            <div><dt>{visibleMetricLabel}</dt><dd>{visibleMetric}</dd></div>
            <div><dt>Training recipe</dt><dd>{selectedModel.training[task].epochs} epochs · {selectedModel.training[task].optimiser} · {selectedModel.training[task].learningRate}</dd></div>
          </dl>

          <div className={styles.rotationControls}>
            <label>
              <span><b>Turn</b><output htmlFor="architecture-turn">{turn}°</output></span>
              <input id="architecture-turn" type="range" min="-42" max="42" step="1" value={turn} onChange={(event) => setTurn(Number(event.target.value))} />
            </label>
            <label>
              <span><b>Tilt</b><output htmlFor="architecture-tilt">{tilt}°</output></span>
              <input id="architecture-tilt" type="range" min="-18" max="24" step="1" value={tilt} onChange={(event) => setTilt(Number(event.target.value))} />
            </label>
            <label>
              <span><b>Explode</b><output htmlFor="architecture-explode">{explode}px</output></span>
              <input id="architecture-explode" type="range" min="0" max="22" step="1" value={explode} onChange={(event) => setExplode(Number(event.target.value))} />
            </label>
            <div>
              <button type="button" onClick={() => { setTurn(-18); setTilt(8); setExplode(8); setSpinning(false); }}>Reset view</button>
              <button type="button" aria-pressed={spinning} onClick={() => setSpinning((value) => !value)}>{spinning ? "Pause rotation" : "Auto rotate"}</button>
            </div>
          </div>

          <div className={styles.selectedStage}>
            <span>Selected tensor</span>
            <strong>{selectedStage.label}</strong>
            <code>{projectText(locale, scientificCopy, selectedStage.shape)}</code>
            <p>{selectedStage.operation}</p>
            <dl>
              <div><dt>Parameters</dt><dd>{selectedStage.parameters.toLocaleString("en-GB")}</dd></div>
              <div><dt>Role</dt><dd>{selectedStage.role}</dd></div>
            </dl>
          </div>
        </aside>

        <div className={styles.architecturePanel}>
          <div className={styles.panelCap}><span>02</span><strong>Rotatable tensor graph</strong><em>Select any stage</em></div>
          <div className={styles.sceneToolbar}>
            <span>INPUT</span><i /><span>{task === "classification" ? "40 Pose logits" : "Normalized depth"}</span>
            <strong>{stages.filter((stage) => stage.residual).length} Residual / skip stages</strong>
          </div>

          <p className={styles.sceneHint}>Scroll sideways to follow all stages. Select a tensor to inspect it.</p>
          <div className={styles.sceneViewport} role="region" aria-label="Tensor graph; scroll horizontally to follow all stages" tabIndex={0}>
            <div
              className={`${styles.network3d} ${spinning ? styles.spinning : ""}`}
              style={sceneStyle}
            >
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={styles.stageShell}
                  style={{ transform: `translateZ(${index * explode}px)` }}
                >
                  {index > 0 ? <span className={styles.connector}>›</span> : null}
                  <button
                    type="button"
                    aria-label={`Inspect ${stage.label}, output ${stage.shape}`}
                    aria-pressed={selectedStage.id === stage.id}
                    className={`${styles.tensorBlock} ${selectedStage.id === stage.id ? styles.selectedTensor : ""}`}
                    style={{
                      width: `${stage.width}px`,
                      height: `${stage.height}px`,
                      "--tensor-colour": selectedModel.colour,
                    } as CSSProperties}
                    onClick={() => setSelectedStageId(stage.id)}
                  >
                    <span>{index.toString().padStart(2, "0")}</span>
                    {stage.residual ? <b>↺</b> : null}
                  </button>
                  <div className={styles.tensorLabel}>
                    <strong>{stage.label}</strong>
                    <code>{projectText(locale, scientificCopy, stage.shape)}</code>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.sceneKey}>
              <span><i className={styles.keyPlane} /> tensor volume</span>
              <span><i className={styles.keyLoop}>↺</i> residual / skip stage</span>
              <span><i className={styles.keySelected} /> selected for inspection</span>
            </div>
          </div>

          <div className={styles.layerLedger}>
            <div className={styles.sectionHeading}>
              <div><span>Architecture table</span><h3>Follow each stage of the model</h3></div>
              <strong>{stages.length} Aggregated stages</strong>
            </div>
            <div className={styles.tableWrap} role="region" aria-label={`${selectedModel.name} architecture table; scroll horizontally for all columns`} tabIndex={0}>
              <table>
                <caption>{selectedModel.name} {task} architecture</caption>
                <thead><tr><th scope="col">Stage</th><th scope="col">Operation</th><th scope="col">Output shape</th><th scope="col">Parameters</th><th scope="col">Role</th></tr></thead>
                <tbody>
                  {stages.map((stage) => (
                    <tr key={stage.id} className={selectedStage.id === stage.id ? styles.selectedRow : ""}>
                      <th scope="row"><button type="button" aria-pressed={selectedStage.id === stage.id} onClick={() => setSelectedStageId(stage.id)}>{stage.label}</button></th>
                      <td>{stage.operation}</td>
                      <td><code>{projectText(locale, scientificCopy, stage.shape)}</code></td>
                      <td>{stage.parameters.toLocaleString("en-GB")}</td>
                      <td>{stage.role}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><th scope="row" colSpan={3}>Architecture total</th><td>{stages.reduce((sum, stage) => sum + stage.parameters, 0).toLocaleString("en-GB")}</td><td>{stages.reduce((sum, stage) => sum + stage.parameters, 0) === selectedModel.parameters[task] ? "all stages" : "grouped estimate"}</td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeading}>
          <div><span>Experiment comparison</span><h3>{task === "classification" ? "How accurately did the models estimate orientation?" : "How closely did they estimate depth?"}</h3></div>
          <strong>{task === "classification" ? "Pose accuracy · higher is better" : "Normalised depth RMSE · lower is better"}</strong>
        </div>
        <div className={styles.comparisonGrid}>
          <div className={styles.metricChart}>
            {models.map((model) => {
              const value = task === "classification" ? model.classification.csvTestAccuracy : model.depth.reportRmse;
              const width = task === "classification"
                ? Math.max(5, ((value - 0.96) / 0.04) * 100)
                : Math.max(5, ((0.052 - value) / 0.032) * 100);
              return (
                <button key={model.id} type="button" aria-pressed={model.id === modelId} onClick={() => chooseModel(model.id)}>
                  <span>{model.shortName}</span>
                  <i><b style={{ width: `${Math.min(100, width)}%`, background: model.colour }} /></i>
                  <strong>{task === "classification" ? `${(value * 100).toFixed(2)}%` : value.toFixed(4)}</strong>
                </button>
              );
            })}
            <p>{task === "classification" ? "Scale shown: 96–100% test accuracy; higher is better." : "Scale shown inversely over the reported 0.020–0.052 RMSE range; lower is better."}</p>
          </div>

          <div className={styles.parameterChart}>
            <span>Parameter footprint · log scale</span>
            {models.map((model) => {
              const parameters = model.parameters[task];
              const width = (Math.log10(parameters) / Math.log10(90_000_000)) * 100;
              return (
                <div key={model.id}>
                  <span>{model.shortName}</span>
                  <i><b style={{ width: `${width}%`, background: model.colour }} /></i>
                  <strong>{formatParameters(parameters)}</strong>
                </div>
              );
            })}
          </div>

          <div className={styles.artifactConflict}>
            <span>Reading the comparison</span>
            <h4>Accuracy, depth error and model size answer different questions</h4>
            <p>Pose accuracy measures the fraction of images assigned to the correct orientation. Depth RMSE measures the size of the depth errors in normalised units. The parameter chart shows how much model capacity each design uses.</p>
            <p>The bars use the recorded five-model comparison, before final retraining. Pose scores varied slightly between recorded evaluations; the depth results shown here use one comparison table consistently.</p>
            <p className={styles.exclusion}>SimpleCNN scores describe an earlier version without the two learned projection skips shown in the developed architecture. The original image-level split may place related video frames in training and testing; the sequence experiment explores why that matters.</p>
          </div>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.sectionHeading}>
          <div><span>Project development</span><h3>From data correction to deployment handoff</h3></div>
          <strong>04–20 DEC 2025</strong>
        </div>
        <div className={styles.timelineFilters} role="group" aria-label="Filter experiment timeline">
          {(["all", "design", "data", "run", "selection", "release"] as const).map((filter) => (
            <button key={filter} type="button" aria-pressed={timelineFilter === filter} onClick={() => setTimelineFilter(filter)}>{filter}</button>
          ))}
        </div>
        <ol className={styles.timeline}>
          {filteredTimeline.map((event) => (
            <li key={event.commit} data-kind={event.kind}>
              <div><time>{event.date}</time></div>
              <span aria-hidden="true" />
              <article><b>{event.kind}</b><h4>{event.title}</h4><p>{event.detail}</p></article>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.evidenceLedger}>
        <div className={styles.sectionHeading}>
          <div><span>Design choices</span><h3>What was built, adapted and tested</h3></div>
        </div>
        <ul>
          <li><span className={styles.authored}>Custom CNN</span><p>The five-block CNN and its residual skips were built for this project. It learns image features from scratch.</p></li>
          <li><span className={styles.pretrained}>Transfer learning</span><p>ResNet, MobileNet and ViT start from ImageNet-pretrained backbones. Grayscale inputs and new prediction heads adapt those existing architectures to microscopy.</p></li>
          <li><span className={styles.compared}>Two tasks</span><p>Pose classification selects one of 40 pitch–roll combinations. Depth regression estimates one continuous value from the same kind of image.</p></li>
          <li><span className={styles.outputOnly}>Evaluation</span><p>Recorded pose and depth results show the trade-off between model size and prediction quality. The browser diagrams explain the models; they do not run a new prediction.</p></li>
          <li><span className={styles.drift}>New recordings</span><p>The original 60/20/20 image split can mix correlated frames across sets. Testing on complete unseen recordings would better assess performance in a new experiment.</p></li>
        </ul>
      </section>
    </DemoWindow>
    </ProjectTranslationBoundary></ProjectCopy>
  );
}

export default ModelArchitectureStudio;
