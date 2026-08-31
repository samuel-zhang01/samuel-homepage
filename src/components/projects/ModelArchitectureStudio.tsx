"use client";

import { type CSSProperties, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { DemoWindow } from "./DemoChrome";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";
import styles from "./ModelArchitectureStudio.module.css";

type Task = "classification" | "depth";
type ModelId = "simple" | "resnet18" | "resnet34" | "mobilenet" | "vit";
type EvidenceState = "present" | "output-only" | "drift";

type Stage = {
  id: string;
  label: string;
  operation: string;
  shape: string;
  parameters: number;
  width: number;
  height: number;
  residual?: boolean;
  evidence: string;
};

type ModelRecord = {
  id: ModelId;
  name: string;
  shortName: string;
  family: string;
  origin: "authored" | "pretrained";
  originLabel: string;
  checkpoint: EvidenceState;
  checkpointLabel: string;
  colour: string;
  parameters: Record<Task, number>;
  checkpointParameters?: Partial<Record<Task, number>>;
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
  checkpointNote: string;
};

type TimelineEvent = {
  date: string;
  commit: string;
  title: string;
  evidence: string;
  kind: "design" | "data" | "run" | "selection" | "release";
};

const AUDITED_COMMIT = "19dacbe70dedb5700a30a51084f5c7e8fb91205a";
const NOTEBOOK_PATH = "Course Work/DL_coursework.ipynb";
const COMPARISON_PATH = "Course Work/Image/model_comparison.csv";
const REPORT_PATH = "Course Work/Report/DeepLearning_Report.tex";

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
        evidence: "Current notebook model definition; 40 pitch-roll classes.",
      }
    : {
        id: "head",
        label: "Depth head",
        operation: `Linear(${input}, 256) → ReLU → Dropout(0.3) → Linear(256, 1) → Sigmoid`,
        shape: "1 normalized depth",
        parameters: depthParameters,
        width: 26,
        height: 52,
        evidence: "Current notebook regressor definition; Sigmoid constrains normalized depth to [0,1].",
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
      evidence: "Notebook and report both specify 224×224 grayscale inputs.",
    },
    {
      id: "block1",
      label: "Block 1",
      operation: "Conv 3×3, 1→32 · ReLU · MaxPool 4×4",
      shape: "32 × 56 × 56",
      parameters: 320,
      width: 55,
      height: 130,
      evidence: "Exact Conv2d and pool2 definition in the current notebook.",
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
      evidence: "18,496 main-path + 2,112 projection parameters, derived from the declared layers.",
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
      evidence: "73,856 main-path + 8,320 projection parameters, derived from the declared layers.",
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
      evidence: "Exact current notebook layer dimensions; identity branch has no learned parameters.",
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
      evidence: "Exact current notebook layer dimensions; no further spatial pooling.",
    },
    {
      id: "dense",
      label: "Dense representation",
      operation: "Flatten 6,272 → Linear 512 · ReLU",
      shape: "512 features",
      parameters: 3_211_776,
      width: 34,
      height: 64,
      evidence: "6,272 = 7×7×128; parameter total includes the 512-unit bias.",
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
          evidence: "Current notebook classifier definition and report loss contract.",
        }
      : {
          id: "head",
          label: "Depth head",
          operation: "Linear(512, 1) · MSE target",
          shape: "1 depth value",
          parameters: 513,
          width: 22,
          height: 45,
          evidence: "Current SimpleCNNRegressor definition uses a direct linear output, without Sigmoid.",
        },
  ];
}

function resnetStages(task: Task, depth: 18 | 34): Stage[] {
  const layerParameters = depth === 34
    ? [221_952, 1_116_416, 6_822_400, 13_114_368]
    : [147_968, 525_568, 2_099_712, 8_393_728];
  const repeats = depth === 34 ? [3, 4, 6, 3] : [2, 2, 2, 2];
  const source = depth === 34
    ? "Exact aggregation of checkpoint parameter keys by layer prefix."
    : "Derived from the torchvision ResNet18 block pattern named by the executed notebook.";
  return [
    {
      id: "input",
      label: "Microscopy input",
      operation: "Single-channel tensor",
      shape: "1 × 224 × 224",
      parameters: 0,
      width: 60,
      height: 150,
      evidence: "Notebook replaces the RGB stem for one-channel input.",
    },
    {
      id: "stem",
      label: "Grayscale stem",
      operation: "Conv 7×7, 1→64, stride 2 · BatchNorm · ReLU · MaxPool",
      shape: "64 × 56 × 56",
      parameters: 3_264,
      width: 54,
      height: 128,
      evidence: depth === 34 ? "Exact conv1 + bn1 checkpoint aggregation." : "Exact declared grayscale stem dimensions.",
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
      evidence: source,
    })),
    {
      id: "pool",
      label: "Global pool",
      operation: "Adaptive average pool",
      shape: "512 × 1 × 1",
      parameters: 0,
      width: 30,
      height: 45,
      evidence: "ResNet family backbone contract; the notebook reads 512 fc input features.",
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
      evidence: "Notebook replaces the RGB input convolution with one channel.",
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
      evidence: "Exact checkpoint aggregation for features.0 through features.3.",
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
      evidence: "Exact checkpoint aggregation for features.4 through features.8.",
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
      evidence: "Exact checkpoint aggregation for features.9 through features.12.",
    },
    {
      id: "embedding",
      label: "Mobile embedding",
      operation: "Adaptive pool → Linear(576, 1024) · Hardswish · Dropout",
      shape: "1,024 features",
      parameters: 590_848,
      width: 34,
      height: 57,
      evidence: "Exact classifier.0 tensors in both saved MobileNet checkpoints.",
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
          evidence: "Exact classifier.3 tensors in model3_mobilenet.pth.",
        }
      : {
          id: "head",
          label: "Depth head",
          operation: "Linear(1,024, 1)",
          shape: "1 depth value",
          parameters: 1_025,
          width: 22,
          height: 44,
          evidence: "Exact classifier.3 tensors in depth_model3_mobilenet.pth; no added Sigmoid in source.",
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
      evidence: "Current notebook ViT adapter accepts one-channel images.",
    },
    {
      id: "patch",
      label: "Patch projection",
      operation: "Conv 16×16, stride 16, 1→768 · averaged RGB weights",
      shape: "196 × 768 patches",
      parameters: 196_608,
      width: 53,
      height: 124,
      evidence: "Exact declared conv_proj dimensions; bias=False in the notebook.",
    },
    {
      id: "tokens",
      label: "Token sequence",
      operation: "Prepend class token · add positional embedding",
      shape: "197 × 768 tokens",
      parameters: 152_064,
      width: 48,
      height: 106,
      evidence: "ViT-B/16 contract: 196 image patches plus one class token; parameter count includes class and position embeddings.",
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
      evidence: "Residual of the exact executed-notebook total after patch, token and task-head parameters; represents the inherited ViT-B/16 encoder and final norm.",
    },
    {
      id: "class-token",
      label: "Class token",
      operation: "Select encoded CLS representation",
      shape: "768 features",
      parameters: 0,
      width: 32,
      height: 56,
      evidence: "ViT classifier interface used by the replaced heads.head layer.",
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
    originLabel: "AUTHORED + TRAINED FROM SCRATCH",
    checkpoint: "drift",
    checkpointLabel: "LOCAL CHECKPOINT / DEFINITION DRIFT",
    colour: "#b24b45",
    parameters: { classification: 4_154_856, depth: 4_134_849 },
    checkpointParameters: { classification: 4_144_424, depth: 4_124_417 },
    classification: { csvValidationAccuracy: 0.99, csvTestAccuracy: 0.9775, reportAccuracy: 0.9825 },
    depth: { reportRmse: 0.0478, reportMae: 0.0354, reportR2: 0.973 },
    training: {
      classification: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
    },
    stages: simpleStages,
    architectureNote: "The authored model reduces 224→56→28→14→7, adds learned 1×1 projections where channels change, then flattens 6,272 features into a 512-unit representation.",
    checkpointNote: "The two locally present, ignored SimpleCNN state_dict files contain no skip2.* or skip3.* keys. Their exact parameter totals are 10,432 below the current definitions. No .pth file is tracked at the pinned HEAD, and this exhibit does not describe those local artifacts as the current residual architecture.",
  },
  {
    id: "resnet18",
    name: "ResNet18 grayscale adaptation",
    shortName: "ResNet18",
    family: "18-layer residual network",
    origin: "pretrained",
    originLabel: "IMAGENET BACKBONE + AUTHORED ADAPTATION",
    checkpoint: "output-only",
    checkpointLabel: "EXECUTED OUTPUT · FILE ABSENT",
    colour: "#19818a",
    parameters: { classification: 11_190_760, depth: 11_301_825 },
    classification: { csvValidationAccuracy: 0.9925, csvTestAccuracy: 0.9875, reportAccuracy: 0.975 },
    depth: { reportRmse: 0.0256, reportMae: 0.0189, reportR2: 0.993 },
    training: {
      classification: { learningRate: "1e−4", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "5e−5", optimiser: "Adam", epochs: 100 },
    },
    stages: (task) => resnetStages(task, 18),
    architectureNote: "The notebook loads torchvision ImageNet weights, replaces conv1 with a fresh 1→64 grayscale stem and replaces the task head. The executed output prints 11,190,760 classification parameters.",
    checkpointNote: "Training histories and evaluation outputs exist in the executed notebook, but model4_resnet18.pth and depth_model4_resnet18.pth are not present in the audited checkout.",
  },
  {
    id: "resnet34",
    name: "ResNet34 grayscale adaptation",
    shortName: "ResNet34",
    family: "34-layer residual network",
    origin: "pretrained",
    originLabel: "IMAGENET BACKBONE + AUTHORED ADAPTATION",
    checkpoint: "present",
    checkpointLabel: "LOCAL CHECKPOINT · UNTRACKED AT HEAD",
    colour: "#28498f",
    parameters: { classification: 21_298_920, depth: 21_409_985 },
    checkpointParameters: { classification: 21_298_920, depth: 21_409_985 },
    classification: { csvValidationAccuracy: 0.995, csvTestAccuracy: 0.985, reportAccuracy: 0.985 },
    depth: { reportRmse: 0.0256, reportMae: 0.0181, reportR2: 0.994 },
    training: {
      classification: { learningRate: "5e−5", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "5e−5", optimiser: "Adam", epochs: 100 },
    },
    stages: (task) => resnetStages(task, 34),
    architectureNote: "The selected precision model uses torchvision ImageNet weights, a fresh one-channel 7×7 stem, residual stages [3,4,6,3], and separate 40-logit or 256-dropout-1 heads.",
    checkpointNote: "Initial and final classification/regression state_dict files are locally present in the audited working copy but ignored and untracked at the pinned HEAD. Their parameter counts reconcile after excluding BatchNorm running buffers.",
  },
  {
    id: "mobilenet",
    name: "MobileNetV3-Small grayscale adaptation",
    shortName: "MobileNetV3",
    family: "Inverted residual + squeeze/excitation",
    origin: "pretrained",
    originLabel: "IMAGENET BACKBONE + AUTHORED ADAPTATION",
    checkpoint: "present",
    checkpointLabel: "LOCAL CHECKPOINT · UNTRACKED AT HEAD",
    colour: "#8a5d12",
    parameters: { classification: 1_558_568, depth: 1_518_593 },
    checkpointParameters: { classification: 1_558_568, depth: 1_518_593 },
    classification: { csvValidationAccuracy: 0.995, csvTestAccuracy: 0.9775, reportAccuracy: 0.975 },
    depth: { reportRmse: 0.0325, reportMae: 0.0241, reportR2: 0.989 },
    training: {
      classification: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
      depth: { learningRate: "1e−3", optimiser: "Adam", epochs: 100 },
    },
    stages: mobileStages,
    architectureNote: "The compact candidate retains MobileNetV3-Small inverted residual and squeeze/excitation blocks, replaces the stem with a fresh 1→16 convolution and swaps only the final task layer.",
    checkpointNote: "Both classification and depth state_dict files are locally present in the audited working copy but ignored and untracked at the pinned HEAD. Prefix-level tensor aggregation yields the exact totals shown here; no checkpoint bytes are shipped.",
  },
  {
    id: "vit",
    name: "Vision Transformer B/16 grayscale adaptation",
    shortName: "ViT-B/16",
    family: "16×16 patch transformer",
    origin: "pretrained",
    originLabel: "IMAGENET BACKBONE + AUTHORED ADAPTATION",
    checkpoint: "output-only",
    checkpointLabel: "EXECUTED OUTPUT · FILE ABSENT",
    colour: "#6a3a82",
    parameters: { classification: 85_435_432, depth: 85_601_793 },
    classification: { csvValidationAccuracy: 0.985, csvTestAccuracy: 0.985, reportAccuracy: 0.9825 },
    depth: { reportRmse: 0.0265, reportMae: 0.0198, reportR2: 0.992 },
    training: {
      classification: { learningRate: "1e−5", optimiser: "AdamW", epochs: 100 },
      depth: { learningRate: "1e−5", optimiser: "Adam", epochs: 100 },
    },
    stages: vitStages,
    architectureNote: "The adapter averages pretrained RGB patch-projection weights into one channel, retains 16×16 patches and the ViT-B/16 encoder, then replaces the classifier or depth head.",
    checkpointNote: "The executed notebook prints 85,435,432 classification parameters and contains training history, but model5_vit.pth and depth_model5_vit.pth are absent from the audited checkout.",
  },
];

const timeline: TimelineEvent[] = [
  {
    date: "04 DEC 2025",
    commit: "1af6d06",
    title: "Report scaffold enters version history",
    evidence: "Added the report source, IEEE template and reference material. No trained-model claim is attached to this milestone.",
    kind: "design",
  },
  {
    date: "07 DEC 2025",
    commit: "63adb26",
    title: "EXIF orientation correction lands",
    evidence: "Notebook, comparison image, rotation summary and SimpleCNN checkpoint changed together; a follow-up commit refined the fix.",
    kind: "data",
  },
  {
    date: "08 DEC 2025",
    commit: "872620a",
    title: "Evaluation surface expands",
    evidence: "Added classification histories, depth histories, model comparison plots and both classification/regression Grad-CAM outputs.",
    kind: "run",
  },
  {
    date: "10 DEC 2025",
    commit: "53496b4",
    title: "Five run directories and analysis artifacts are consolidated",
    evidence: "Run 1–5 notebooks, confusion matrices, residual plots, t-SNE outputs and the model comparison CSV moved in one evidence-bearing revision.",
    kind: "run",
  },
  {
    date: "13 DEC 2025",
    commit: "d59a4a5",
    title: "Best-model selection and deployment pack",
    evidence: "Commit labelled “save the best model” refreshed the notebook, comparison CSV, report, final plots and deployment artifacts.",
    kind: "selection",
  },
  {
    date: "20 DEC 2025",
    commit: "0133d9b",
    title: "Final experiment/report revision",
    evidence: "Final ResNet outputs, Roll–Pitch grid, report images, deployment README and model-architecture documentation were updated together.",
    kind: "release",
  },
  {
    date: "20 DEC 2025",
    commit: "19dacbe",
    title: "Deployment loader receives the last audited change",
    evidence: "The repository head used by this exhibit changes deployment/test_loader.ipynb; architecture and metrics remain pinned to this checkout.",
    kind: "release",
  },
];

function formatParameters(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 2 : 3)}M`;
  return value.toLocaleString("en-GB");
}

function statusClass(state: EvidenceState) {
  if (state === "present") return styles.present;
  if (state === "drift") return styles.drift;
  return styles.outputOnly;
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
  const visibleMetricLabel = task === "classification" ? "CSV test accuracy" : "Report RMSE";
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
    <ProjectTranslationBoundary locale={locale}>
    <DemoWindow
      appName="MODEL LINEAGE LAB 1.0"
      title="Microrobot Architecture & Experiment Atlas"
      status="SOURCE-AUDITED"
      statusTone="safe"
      className={styles.studio}
      footer={(
        <>
          <span>CHECKOUT {AUDITED_COMMIT.slice(0, 8)}</span>
          <span>5 ARCHITECTURES · 2 TASKS · 7 LINEAGE EVENTS</span>
          <span>ABSTRACT TENSORS ONLY · NO DATASET OR WEIGHTS</span>
        </>
      )}
    >
      <section className={styles.provenance} aria-label="Evidence boundary">
        <span>READ-ONLY SOURCE AUDIT</span>
        <p>
          Every layer, shape, parameter total, run status and revision below is tied to the executed notebook,
          locally present ignored state dictionaries, machine-readable comparison CSV, report source or Git history.
          Conflicting artifacts stay visibly separate.
        </p>
        <strong>PRIVATE REPOSITORY · NO EXPLICIT LICENCE</strong>
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
            <span>{model.origin === "authored" ? "AUTHORED" : "PRETRAINED"}</span>
            <strong>{model.shortName}</strong>
            <small>{formatParameters(model.parameters[task])} params</small>
          </button>
        ))}
      </section>

      <section className={styles.workbench}>
        <aside className={styles.inspector}>
          <div className={styles.panelCap}><span>01</span><strong>MODEL INSPECTOR</strong></div>
          <div className={styles.taskSwitch} role="group" aria-label="Task head">
            <button type="button" aria-pressed={task === "classification"} onClick={() => chooseTask("classification")}>POSE · 40 CLASS</button>
            <button type="button" aria-pressed={task === "depth"} onClick={() => chooseTask("depth")}>DEPTH · REGRESSION</button>
          </div>

          <div className={styles.modelIdentity}>
            <span>{selectedModel.family}</span>
            <h3>{selectedModel.name}</h3>
            <div>
              <b className={selectedModel.origin === "authored" ? styles.authored : styles.pretrained}>{selectedModel.originLabel}</b>
              <b className={statusClass(selectedModel.checkpoint)}>{selectedModel.checkpointLabel}</b>
            </div>
            <p>{selectedModel.architectureNote}</p>
          </div>

          <dl className={styles.modelFacts}>
            <div><dt>Current-definition parameters</dt><dd>{selectedModel.parameters[task].toLocaleString("en-GB")}</dd></div>
            <div><dt>Local checkpoint parameters</dt><dd>{selectedModel.checkpointParameters?.[task]?.toLocaleString("en-GB") ?? "not available"}</dd></div>
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
            <span>SELECTED TENSOR · {selectedStage.id.toUpperCase()}</span>
            <strong>{selectedStage.label}</strong>
            <code>{selectedStage.shape}</code>
            <p>{selectedStage.operation}</p>
            <dl>
              <div><dt>Parameters</dt><dd>{selectedStage.parameters.toLocaleString("en-GB")}</dd></div>
              <div><dt>Evidence</dt><dd>{selectedStage.evidence}</dd></div>
            </dl>
          </div>
        </aside>

        <div className={styles.architecturePanel}>
          <div className={styles.panelCap}><span>02</span><strong>ROTATABLE TENSOR GRAPH</strong><em>SELECT ANY STAGE</em></div>
          <div className={styles.sceneToolbar}>
            <span>INPUT</span><i /><span>{task === "classification" ? "40 POSE LOGITS" : "NORMALIZED DEPTH"}</span>
            <strong>{stages.filter((stage) => stage.residual).length} RESIDUAL / SKIP STAGES</strong>
          </div>

          <div className={styles.sceneViewport}>
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
                    <code>{stage.shape}</code>
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
              <div><span>ACCESSIBLE 2D FALLBACK</span><h3>Exact layer and tensor ledger</h3></div>
              <strong>{stages.length} AGGREGATED STAGES</strong>
            </div>
            <div className={styles.tableWrap} role="region" aria-label={`${selectedModel.name} layer ledger; scroll horizontally for all columns`} tabIndex={0}>
              <table>
                <caption>{selectedModel.name} {task} architecture</caption>
                <thead><tr><th scope="col">Stage</th><th scope="col">Operation</th><th scope="col">Output shape</th><th scope="col">Parameters</th><th scope="col">Trace</th></tr></thead>
                <tbody>
                  {stages.map((stage) => (
                    <tr key={stage.id} className={selectedStage.id === stage.id ? styles.selectedRow : ""}>
                      <th scope="row"><button type="button" aria-pressed={selectedStage.id === stage.id} onClick={() => setSelectedStageId(stage.id)}>{stage.label}</button></th>
                      <td>{stage.operation}</td>
                      <td><code>{stage.shape}</code></td>
                      <td>{stage.parameters.toLocaleString("en-GB")}</td>
                      <td>{stage.residual ? "residual" : "direct"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><th scope="row" colSpan={3}>Current-definition total</th><td>{stages.reduce((sum, stage) => sum + stage.parameters, 0).toLocaleString("en-GB")}</td><td>{stages.reduce((sum, stage) => sum + stage.parameters, 0) === selectedModel.parameters[task] ? "reconciled" : "grouped estimate"}</td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.checkpointNotice} data-state={selectedModel.checkpoint}>
        <span>{selectedModel.checkpoint === "present" ? "✓" : selectedModel.checkpoint === "drift" ? "!" : "i"}</span>
        <div><strong>{selectedModel.checkpointLabel}</strong><p>{selectedModel.checkpointNote}</p></div>
      </section>

      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeading}>
          <div><span>EXPERIMENT COMPARISON</span><h3>{task === "classification" ? "Machine-readable model comparison" : "Report-sourced depth comparison"}</h3></div>
          <strong>{task === "classification" ? COMPARISON_PATH : REPORT_PATH}</strong>
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
            <span>PARAMETER FOOTPRINT · LOG SCALE</span>
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
            <span>ARTIFACT RECONCILIATION</span>
            <h4>CSV and report are not silently merged</h4>
            <p>The classification CSV and report agree exactly only for ResNet34. Other rows differ by 0.25–1.25 percentage points, consistent with distinct saved evaluation snapshots. Both values remain labelled below.</p>
            <p className={styles.exclusion}><strong>Excluded final-retrain claim:</strong> the report gives ResNet34 regression RMSE as 0.204 in its abstract, 0.0141 in prose, and 0.0204 in its final table/conclusion. None is substituted into the five-model depth bars, which remain pinned to the separately labelled 0.0256 comparison-table result.</p>
            <table>
              <thead><tr><th scope="col">Model</th><th scope="col">CSV test</th><th scope="col">Report test</th><th scope="col">Δ</th></tr></thead>
              <tbody>{models.map((model) => {
                const delta = model.classification.csvTestAccuracy - model.classification.reportAccuracy;
                return <tr key={model.id}><th scope="row">{model.shortName}</th><td>{(model.classification.csvTestAccuracy * 100).toFixed(2)}%</td><td>{(model.classification.reportAccuracy * 100).toFixed(2)}%</td><td>{delta === 0 ? "0.00 pp" : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(2)} pp`}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.sectionHeading}>
          <div><span>GIT + EXPERIMENT LINEAGE</span><h3>From data correction to deployment handoff</h3></div>
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
              <div><time>{event.date}</time><code>{event.commit}</code></div>
              <span aria-hidden="true" />
              <article><b>{event.kind}</b><h4>{event.title}</h4><p>{event.evidence}</p></article>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.evidenceLedger}>
        <div className={styles.sectionHeading}>
          <div><span>CLAIM PROVENANCE</span><h3>What “designed”, “pretrained”, “trained” and “compared” mean here</h3></div>
          <code>{AUDITED_COMMIT.slice(0, 12)}</code>
        </div>
        <ul>
          <li><span className={styles.authored}>DESIGNED</span><p>SimpleCNN layer graph is authored locally. Adaptation heads and grayscale input replacements are also authored; ResNet, MobileNet and ViT backbones are not.</p></li>
          <li><span className={styles.pretrained}>PRETRAINED</span><p>The current notebook explicitly requests torchvision ImageNet defaults for ResNet18/34, MobileNetV3-Small and ViT-B/16. SimpleCNN requests no pretrained weights.</p></li>
          <li><span className={styles.present}>LOCAL FILE ONLY</span><p>SimpleCNN, ResNet34 and MobileNet state_dict files exist only as ignored local working-copy artifacts. No .pth file is tracked at the pinned HEAD.</p></li>
          <li><span className={styles.outputOnly}>TRAINED OUTPUT</span><p>ResNet18 and ViT have executed training/evaluation output, but their named checkpoint files are not locally present; no .pth file is tracked at the pinned HEAD.</p></li>
          <li><span className={styles.drift}>DRIFT FOUND</span><p>The current SimpleCNN code declares learned skip projections; saved SimpleCNN state_dict keys do not. The exhibit shows both totals and does not imply compatibility.</p></li>
          <li><span className={styles.compared}>COMPARED</span><p>Classification bars read the CSV snapshot. Depth bars read the report table. Final retraining claims are not substituted into the earlier five-model comparison.</p></li>
          <li><span className={styles.drift}>SPLIT CAVEAT</span><p>The notebook uses a stratified image-row 60/20/20 split with random state 42, not a recording-group split. Adjacent or correlated video frames may cross partitions, so these scores do not establish group-held-out generalisation.</p></li>
        </ul>
        <div className={styles.sourcePaths}>
          <span><b>Notebook</b><code>{NOTEBOOK_PATH}</code></span>
          <span><b>Comparison</b><code>{COMPARISON_PATH}</code></span>
          <span><b>Report</b><code>{REPORT_PATH}</code></span>
        </div>
      </section>
    </DemoWindow>
    </ProjectTranslationBoundary>
  );
}

export default ModelArchitectureStudio;
