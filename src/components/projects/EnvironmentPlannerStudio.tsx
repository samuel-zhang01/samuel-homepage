"use client";

import ClassicSelect from "../ClassicSelect";

import { useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./EnvironmentPlannerStudio.module.css";

type ViewId = "resolver" | "failure" | "manifest" | "audit";
type PlannerMode = "source" | "adapted";
type OsId = "linux" | "macos" | "windows";
type Architecture = "x86_64" | "arm64";
type Accelerator = "nvidia" | "apple" | "cpu";
type CudaVersion = "unknown" | "11.8" | "12.3" | "12.4" | "13.0" | "14.0";
type EnvironmentPolicy = "new" | "keep" | "recreate";
type RouteTone = "ready" | "warning" | "blocked" | "probe";
type CoreGroup = "Numerics" | "Visualisation" | "Notebook" | "Model tooling" | "API client";
type ManifestFilter = "All" | CoreGroup;
type FailureId = "core-package" | "torch-primary" | "tensorflow-runtime" | "hf-bootstrap";

type Profile = {
  os: OsId;
  architecture: Architecture;
  accelerator: Accelerator;
  cuda: CudaVersion;
  environmentPolicy: EnvironmentPolicy;
  allowNightly: boolean;
};

type Warning = {
  id: string;
  tone: Exclude<RouteTone, "ready" | "probe">;
  title: string;
  detail: string;
};

type FrameworkRoute = {
  name: string;
  target: string;
  lane: string;
  fallbacks: string[];
  verification: string;
  tone: RouteTone;
  note: string;
};

type PlanStep = {
  number: string;
  label: string;
  detail: string;
  tone: RouteTone;
  provenance: "SOURCE" | "ADAPTED";
};

type ResolvedPlan = {
  platformLabel: string;
  platformTone: RouteTone;
  installer: string;
  environmentAction: string;
  torch: FrameworkRoute;
  tensorflow: FrameworkRoute;
  warnings: Warning[];
  steps: PlanStep[];
};

type CorePackage = {
  name: string;
  install: string;
  module: string;
  group: CoreGroup;
  probe: "aligned" | "mismatch";
};

const SOURCE_COMMIT = "19dacbe";
const INSTALLER_COMMIT = "698be5d";

const VIEWS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "resolver", label: "Resolve", hint: "platform route" },
  { id: "failure", label: "Failure lab", hint: "inject faults" },
  { id: "manifest", label: "Manifest", hint: "targets + probes" },
  { id: "audit", label: "Source map", hint: "evidence boundary" },
];

const CORE_PACKAGES: CorePackage[] = [
  { name: "NumPy", install: "numpy", module: "numpy", group: "Numerics", probe: "aligned" },
  { name: "Pandas", install: "pandas", module: "pandas", group: "Numerics", probe: "aligned" },
  { name: "SciPy", install: "scipy", module: "scipy", group: "Numerics", probe: "aligned" },
  { name: "Matplotlib", install: "matplotlib", module: "matplotlib", group: "Visualisation", probe: "aligned" },
  { name: "Seaborn", install: "seaborn", module: "seaborn", group: "Visualisation", probe: "aligned" },
  { name: "Plotly", install: "plotly", module: "plotly", group: "Visualisation", probe: "aligned" },
  { name: "Scikit-learn", install: "scikit-learn", module: "sklearn", group: "Numerics", probe: "aligned" },
  { name: "IPyWidgets", install: "ipywidgets", module: "ipywidgets", group: "Notebook", probe: "aligned" },
  { name: "IPyKernel", install: "ipykernel", module: "ipykernel", group: "Notebook", probe: "aligned" },
  { name: "Anthropic", install: "anthropic", module: "anthropic", group: "API client", probe: "aligned" },
  { name: "XGBoost", install: "xgboost", module: "xgboost", group: "Numerics", probe: "aligned" },
  { name: "StatsModels", install: "statsmodels", module: "statsmodels", group: "Numerics", probe: "aligned" },
  { name: "NetworkX", install: "NetworkX", module: "networkx", group: "Model tooling", probe: "aligned" },
  { name: "nbconvert", install: "nbconvert", module: "nbconvert", group: "Notebook", probe: "aligned" },
  { name: "pandoc", install: "pandoc", module: "pandoc", group: "Notebook", probe: "aligned" },
  { name: "LightGBM", install: "lightgbm", module: "lightgbm", group: "Numerics", probe: "aligned" },
  { name: "Graphviz", install: "graphviz", module: "graphviz", group: "Visualisation", probe: "aligned" },
  { name: "Datasets", install: "datasets", module: "datasets", group: "Model tooling", probe: "aligned" },
  { name: "Grad-CAM", install: "grad-cam", module: "grad-cam", group: "Model tooling", probe: "mismatch" },
];

const MANIFEST_FILTERS: ManifestFilter[] = [
  "All",
  "Numerics",
  "Visualisation",
  "Notebook",
  "Model tooling",
  "API client",
];

const DEFAULT_PROFILE: Profile = {
  os: "linux",
  architecture: "x86_64",
  accelerator: "nvidia",
  cuda: "12.3",
  environmentPolicy: "new",
  allowNightly: false,
};

function cudaParts(cuda: CudaVersion) {
  if (cuda === "unknown") return { major: null, minor: null };
  const [major, minor] = cuda.split(".").map(Number);
  return { major, minor };
}

function toneLabel(tone: RouteTone) {
  if (tone === "ready") return "ROUTED";
  if (tone === "warning") return "REVIEW";
  if (tone === "blocked") return "BLOCKED";
  return "PROBE";
}

function platformResolution(profile: Profile, mode: PlannerMode) {
  const { os, architecture } = profile;

  if (os === "macos") {
    if (architecture !== "arm64") {
      return {
        label: "macOS · Intel",
        tone: "blocked" as const,
        installer: "No source artifact — exits before installation",
        warning: "The source explicitly supports Apple silicon only.",
      };
    }
    return {
      label: "macOS · Apple silicon",
      tone: "ready" as const,
      installer: "Anaconda3-2025.06-0-MacOSX-arm64.sh",
      warning: null,
    };
  }

  if (os === "linux") {
    if (architecture === "arm64") {
      return {
        label: "Linux · ARM64",
        tone: mode === "source" ? ("warning" as const) : ("blocked" as const),
        installer: "Source still selects the Linux x86_64 artifact",
        warning:
          mode === "source"
            ? "The header promises Linux x86_64, but the branch does not reject ARM64 before selecting that artifact."
            : "The adapted planner blocks an architecture-mismatched installer before download.",
      };
    }
    return {
      label: "Linux · x86_64",
      tone: "ready" as const,
      installer: "Anaconda3-2025.06-0-Linux-x86_64.sh",
      warning: null,
    };
  }

  if (architecture === "arm64") {
    return {
      label: "Windows shell · ARM64",
      tone: "blocked" as const,
      installer: "No matching source artifact",
      warning: "The coded Windows path selects an x86_64 executable and is not advertised in the support header.",
    };
  }

  return {
    label: "Windows shell · x86_64",
    tone: "warning" as const,
    installer: "Anaconda3-2025.06-0-Windows-x86_64.exe · manual hand-off",
    warning: "A Windows branch exists, but the source support header lists only macOS ARM64 and Linux x86_64.",
  };
}

function resolveTorch(profile: Profile, blocked: boolean, mode: PlannerMode): FrameworkRoute {
  if (blocked) {
    return {
      name: "PyTorch",
      target: "Not planned",
      lane: "Platform gate",
      fallbacks: [],
      verification: "Not reached",
      tone: "blocked",
      note: "Resolve the platform artifact first.",
    };
  }

  if (profile.os === "macos") {
    return {
      name: "PyTorch",
      target: "torch + torchvision · default index",
      lane: "MPS-capable package",
      fallbacks: [],
      verification:
        mode === "source" ? "torch.backends.mps.is_available() at final verification" : "Require MPS availability probe before acceleration is claimed",
      tone: mode === "source" ? "probe" : "warning",
      note: "Package installation alone does not prove that MPS is available at runtime.",
    };
  }

  if (profile.accelerator !== "nvidia") {
    return {
      name: "PyTorch",
      target: "torch + torchvision · default index",
      lane: "CPU",
      fallbacks: [],
      verification: "Import plus CPU-only accelerator report",
      tone: "ready",
      note: "The source takes its no-NVIDIA branch.",
    };
  }

  const { major } = cudaParts(profile.cuda);
  const linuxCuda13 = profile.os === "linux" && major === 13;
  return {
    name: "PyTorch",
    target: linuxCuda13 ? "torch + torchvision · cu130 index" : "torch + torchvision · cu121 index",
    lane: linuxCuda13 ? "CUDA 13.0 wheel lane" : "CUDA 12.1 wheel lane",
    fallbacks: linuxCuda13 ? ["cu121 index", "default CPU package"] : ["cu118 index", "default CPU package"],
    verification:
      mode === "source" ? "Import, then torch.cuda.is_available()" : "Import + CUDA availability + selected device name",
    tone: profile.cuda === "unknown" || major === 14 ? "warning" : "ready",
    note:
      major === 14
        ? "The source special-cases exactly CUDA major 13; later majors fall through to the cu121 route."
        : profile.cuda === "unknown"
          ? "With no parsed driver version, the source still tries cu121 first."
          : "Fallback order mirrors the implemented shell branches.",
  };
}

function resolveTensorFlow(profile: Profile, blocked: boolean, mode: PlannerMode): FrameworkRoute {
  if (blocked) {
    return {
      name: "TensorFlow",
      target: "Not planned",
      lane: "Platform gate",
      fallbacks: [],
      verification: "Not reached",
      tone: "blocked",
      note: "Resolve the platform artifact first.",
    };
  }

  if (profile.os === "macos") {
    return {
      name: "TensorFlow",
      target: "tensorflow · default index",
      lane: "Source labels this Metal-enabled",
      fallbacks: [],
      verification:
        mode === "source" ? "Import and list physical GPU devices" : "Treat Metal acceleration as unproven until a physical-device probe passes",
      tone: "warning",
      note: "The source does not install a separate tensorflow-metal package, so the acceleration claim needs runtime evidence.",
    };
  }

  if (profile.accelerator !== "nvidia") {
    return {
      name: "TensorFlow",
      target: "tensorflow · default index",
      lane: "CPU",
      fallbacks: [],
      verification: "Import and confirm zero GPU devices is expected",
      tone: "ready",
      note: "The source selects its CPU package when NVIDIA is absent.",
    };
  }

  const { major, minor } = cudaParts(profile.cuda);
  const stableRejected = major !== null && major >= 13;
  const limited = major === 12 && minor !== null && minor > 3;

  if (stableRejected) {
    const nightly = major === 13 && profile.allowNightly;
    return {
      name: "TensorFlow",
      target: nightly ? "tf-nightly[and-cuda]" : "tensorflow · default index",
      lane: nightly ? "Nightly CUDA attempt" : "CPU fallback",
      fallbacks: nightly ? ["tensorflow · CPU"] : [],
      verification:
        mode === "source" ? "Command exit status after listing GPU devices" : "Require a non-empty GPU device list",
      tone: nightly ? "warning" : "ready",
      note:
        major === 13
          ? nightly
            ? "Nightly is an explicit opt-in in the source. It still requires a real accelerator probe."
            : "The source offers nightly for CUDA 13; declining it selects CPU TensorFlow."
          : "CUDA majors later than 13 take the source's CPU-only branch.",
    };
  }

  return {
    name: "TensorFlow",
    target: "tensorflow[and-cuda]",
    lane: limited ? "GPU attempt · source warns" : "GPU attempt",
    fallbacks: ["tensorflow · CPU"],
    verification:
      mode === "source" ? "Command exit status after listing GPU devices" : "Require a non-empty GPU device list",
    tone: profile.cuda === "unknown" || limited ? "warning" : "ready",
    note: limited
      ? "The source warns above CUDA 12.3 but still marks the route compatible and attempts the GPU extra."
      : profile.cuda === "unknown"
        ? "A detected NVIDIA device with an unparsed version still enters the GPU-attempt branch."
        : "Compatibility wording is a dated source rule, not current vendor guidance.",
  };
}

function resolvePlan(profile: Profile, mode: PlannerMode): ResolvedPlan {
  const platform = platformResolution(profile, mode);
  const blocked = platform.tone === "blocked";
  const torch = resolveTorch(profile, blocked, mode);
  const tensorflow = resolveTensorFlow(profile, blocked, mode);
  const warnings: Warning[] = [];

  if (platform.warning) {
    warnings.push({
      id: "platform",
      tone: platform.tone === "blocked" ? "blocked" : "warning",
      title: "Platform boundary",
      detail: platform.warning,
    });
  }

  if (profile.environmentPolicy === "keep") {
    warnings.push({
      id: "existing-environment",
      tone: "warning",
      title: "Existing environment retained",
      detail: "The source returns early and then installs into the retained DL environment without proving its Python version or prior package state.",
    });
  }

  if (profile.environmentPolicy === "recreate") {
    warnings.push({
      id: "destructive-environment",
      tone: "warning",
      title: "Destructive branch",
      detail:
        mode === "source"
          ? "The source prompts, then removes the existing named environment before rebuilding it."
          : "The adaptation records this as an approval gate; the browser never removes anything.",
    });
  }

  if (mode === "source") {
    warnings.push(
      {
        id: "unpinned",
        tone: "warning",
        title: "Unpinned package layer",
        detail: "The Anaconda artifact is versioned, but the pip package specifications and Hugging Face bootstrap are not locked to versions or hashes.",
      },
      {
        id: "runtime-evidence",
        tone: "warning",
        title: "Runtime not evidenced",
        detail: "The repository contains implementation logic, but no CI job or retained installation log that demonstrates all platform branches.",
      },
    );
  } else {
    warnings.push({
      id: "dry-run",
      tone: "warning",
      title: "Planning only",
      detail: "The adapted mode adds architecture, checksum, lockfile and runtime-device gates. It intentionally emits no executable installer.",
    });
  }

  const environmentAction =
    profile.environmentPolicy === "new"
      ? "Create DL with Python 3.13"
      : profile.environmentPolicy === "keep"
        ? "Reuse existing DL environment"
        : "Remove, then recreate DL after approval";

  const downstreamTone = blocked ? "blocked" : "probe";
  const steps: PlanStep[] = [
    {
      number: "01",
      label: "Detect host",
      detail: `${platform.label}; ${profile.accelerator === "nvidia" ? `NVIDIA · CUDA ${profile.cuda}` : profile.accelerator === "apple" ? "Apple integrated GPU" : "CPU only"}`,
      tone: platform.tone,
      provenance: "SOURCE",
    },
    {
      number: "02",
      label: mode === "source" ? "Fetch Anaconda" : "Verify artifact",
      detail: blocked ? "No compatible artifact" : platform.installer,
      tone: blocked ? "blocked" : mode === "source" ? "probe" : "warning",
      provenance: mode === "source" ? "SOURCE" : "ADAPTED",
    },
    {
      number: "03",
      label: "Resolve environment",
      detail: blocked ? "Not reached" : environmentAction,
      tone: blocked ? "blocked" : profile.environmentPolicy === "new" ? "ready" : "warning",
      provenance: "SOURCE",
    },
    {
      number: "04",
      label: "Install core layer",
      detail: blocked ? "Not reached" : "19 sequential package calls",
      tone: blocked ? "blocked" : mode === "source" ? "probe" : "warning",
      provenance: "SOURCE",
    },
    {
      number: "05",
      label: "Route frameworks",
      detail: blocked ? "Not reached" : `${torch.lane} · ${tensorflow.lane}`,
      tone: blocked ? "blocked" : torch.tone === "warning" || tensorflow.tone === "warning" ? "warning" : downstreamTone,
      provenance: "SOURCE",
    },
    {
      number: "06",
      label: mode === "source" ? "Bootstrap HF CLI" : "Gate remote bootstrap",
      detail: blocked ? "Not reached" : mode === "source" ? "Remote curl-to-shell path" : "Require reviewed, pinned artifact",
      tone: blocked ? "blocked" : "warning",
      provenance: mode === "source" ? "SOURCE" : "ADAPTED",
    },
    {
      number: "07",
      label: "Verify runtime",
      detail: blocked ? "Not reached" : mode === "source" ? "23 module imports + accelerator reports" : "Imports + non-empty device checks + manifest reconciliation",
      tone: blocked ? "blocked" : "probe",
      provenance: mode === "source" ? "SOURCE" : "ADAPTED",
    },
  ];

  return {
    platformLabel: platform.label,
    platformTone: platform.tone,
    installer: platform.installer,
    environmentAction,
    torch,
    tensorflow,
    warnings,
    steps,
  };
}

function setOperatingSystem(profile: Profile, os: OsId): Profile {
  if (os === "macos") return { ...profile, os, architecture: "arm64", accelerator: "apple" };
  return { ...profile, os, architecture: "x86_64", accelerator: "nvidia" };
}

function ModeSwitch({ mode, setMode }: { mode: PlannerMode; setMode: (mode: PlannerMode) => void }) {
  return (
    <div className={styles.modeSwitch} aria-label="Planner interpretation">
      <div>
        <span>INTERPRETATION</span>
        <p>Compare the implemented shell route with a non-executing, safety-improved planning layer.</p>
      </div>
      <div className={styles.segmented}>
        <button type="button" aria-pressed={mode === "source"} onClick={() => setMode("source")}>
          <strong>SOURCE ROUTE</strong>
          <span>2025 shell logic</span>
        </button>
        <button type="button" aria-pressed={mode === "adapted"} onClick={() => setMode("adapted")}>
          <strong>GUARDED PLAN</strong>
          <span>browser-only adaptation</span>
        </button>
      </div>
    </div>
  );
}

function ProfileControls({ profile, setProfile }: { profile: Profile; setProfile: (profile: Profile) => void }) {
  const acceleratorOptions: Array<{ value: Accelerator; label: string }> =
    profile.os === "macos"
      ? [
          { value: "apple", label: "Apple GPU" },
          { value: "cpu", label: "CPU only" },
        ]
      : [
          { value: "nvidia", label: "NVIDIA" },
          { value: "cpu", label: "CPU only" },
        ];

  return (
    <aside className={styles.controls} aria-label="Synthetic host profile">
      <div className={styles.panelHeading}>
        <span>01</span>
        <strong>SYNTHETIC HOST</strong>
        <em>NO SYSTEM PROBE</em>
      </div>

      <fieldset className={styles.choiceGroup}>
        <legend>Operating system</legend>
        <div className={styles.cardChoices}>
          {([
            ["linux", "Linux", "terminal"],
            ["macos", "macOS", "apple"],
            ["windows", "Windows", "manual"],
          ] as const).map(([value, label, note]) => (
            <button
              type="button"
              key={value}
              className={profile.os === value ? styles.selectedChoice : ""}
              aria-pressed={profile.os === value}
              onClick={() => setProfile(setOperatingSystem(profile, value))}
            >
              <strong>{label}</strong>
              <span>{note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.choiceGroup}>
        <legend>Architecture</legend>
        <div className={styles.twoChoices}>
          {(["x86_64", "arm64"] as Architecture[]).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={profile.architecture === value}
              className={profile.architecture === value ? styles.selectedChoice : ""}
              onClick={() => setProfile({ ...profile, architecture: value })}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.field}>
        <span>Accelerator</span>
        <ClassicSelect
          value={profile.accelerator}
          onChange={(event) => setProfile({ ...profile, accelerator: event.target.value as Accelerator })}
        >
          {acceleratorOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </ClassicSelect>
      </label>

      <label className={styles.field}>
        <span>Driver-reported CUDA</span>
        <ClassicSelect
          value={profile.cuda}
          disabled={profile.accelerator !== "nvidia"}
          onChange={(event) => setProfile({ ...profile, cuda: event.target.value as CudaVersion })}
        >
          <option value="unknown">Not parsed</option>
          <option value="11.8">11.8</option>
          <option value="12.3">12.3</option>
          <option value="12.4">12.4</option>
          <option value="13.0">13.0</option>
          <option value="14.0">14.0 counterfactual</option>
        </ClassicSelect>
      </label>

      <label className={styles.field}>
        <span>Existing “DL” environment</span>
        <ClassicSelect
          value={profile.environmentPolicy}
          onChange={(event) => setProfile({ ...profile, environmentPolicy: event.target.value as EnvironmentPolicy })}
        >
          <option value="new">Not found — create</option>
          <option value="keep">Found — keep</option>
          <option value="recreate">Found — recreate</option>
        </ClassicSelect>
      </label>

      {profile.accelerator === "nvidia" && profile.cuda === "13.0" ? (
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={profile.allowNightly}
            onChange={(event) => setProfile({ ...profile, allowNightly: event.target.checked })}
          />
          <span><strong>Try TensorFlow nightly</strong><small>Mirrors the source’s explicit CUDA 13 prompt.</small></span>
        </label>
      ) : null}

      <button type="button" className={styles.resetButton} onClick={() => setProfile(DEFAULT_PROFILE)}>
        RESET PROFILE
      </button>
    </aside>
  );
}

function FrameworkCard({ route }: { route: FrameworkRoute }) {
  return (
    <article className={`${styles.frameworkCard} ${styles[route.tone]}`}>
      <header>
        <div><span>{route.name === "PyTorch" ? "PT" : "TF"}</span><strong>{route.name}</strong></div>
        <em>{toneLabel(route.tone)}</em>
      </header>
      <dl>
        <div><dt>PRIMARY</dt><dd>{route.target}</dd></div>
        <div><dt>LANE</dt><dd>{route.lane}</dd></div>
        <div><dt>FALLBACKS</dt><dd>{route.fallbacks.length ? route.fallbacks.join(" → ") : "None declared"}</dd></div>
        <div><dt>CHECK</dt><dd>{route.verification}</dd></div>
      </dl>
      <p>{route.note}</p>
    </article>
  );
}

function ResolverView({ profile, setProfile, mode, plan }: { profile: Profile; setProfile: (profile: Profile) => void; mode: PlannerMode; plan: ResolvedPlan }) {
  const fallbackCount = plan.torch.fallbacks.length + plan.tensorflow.fallbacks.length;
  return (
    <div className={styles.resolverLayout}>
      <ProfileControls profile={profile} setProfile={setProfile} />
      <section className={styles.workspace} aria-label="Resolved installation route">
        <div className={styles.metricStrip}>
          <div><span>DECLARED TARGETS</span><strong>24</strong><small>19 core + 4 framework + 1 CLI</small></div>
          <div><span>IMPORT PROBES</span><strong>23</strong><small>one source-name mismatch</small></div>
          <div><span>ACTIVE FALLBACKS</span><strong>{fallbackCount}</strong><small>for this profile</small></div>
          <div className={styles[plan.platformTone]}><span>PLATFORM</span><strong>{toneLabel(plan.platformTone)}</strong><small>{plan.platformLabel}</small></div>
        </div>

        <div className={styles.routePanel}>
          <div className={styles.panelHeading}>
            <span>02</span>
            <strong>RESOLUTION PIPELINE</strong>
            <em>{mode === "source" ? "IMPLEMENTED ORDER" : "GUARDED DRY RUN"}</em>
          </div>
          <ol className={styles.pipeline}>
            {plan.steps.map((step, index) => (
              <li key={step.number} className={styles[step.tone]}>
                <div className={styles.stepRail}>
                  <span>{step.number}</span>
                  {index < plan.steps.length - 1 ? <i aria-hidden="true" /> : null}
                </div>
                <div>
                  <header><strong>{step.label}</strong><em>{step.provenance}</em></header>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.frameworkGrid}>
          <FrameworkCard route={plan.torch} />
          <FrameworkCard route={plan.tensorflow} />
        </div>

        <section className={styles.warningPanel} aria-label="Route review notes">
          <div className={styles.panelHeading}>
            <span>!</span>
            <strong>REVIEW QUEUE</strong>
            <em>{plan.warnings.length} ITEMS</em>
          </div>
          <div className={styles.warningList}>
            {plan.warnings.map((warning) => (
              <article key={warning.id} className={styles[warning.tone]}>
                <span aria-hidden="true">{warning.tone === "blocked" ? "×" : "!"}</span>
                <div><strong>{warning.title}</strong><p>{warning.detail}</p></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function failureNarrative(failure: FailureId, failedPackage: CorePackage, plan: ResolvedPlan) {
  const index = CORE_PACKAGES.findIndex((item) => item.install === failedPackage.install);

  if (failure === "core-package") {
    return {
      source: {
        outcome: "EARLY EXIT RISK",
        tone: "blocked" as const,
        headline: `${index} of 19 core calls finish before ${failedPackage.name} fails`,
        detail: `${CORE_PACKAGES.length - index - 1} later core calls and all downstream framework, CLI and verification stages become unreachable under the shell's set -e semantics. The helper prints “continuing” but returns status 1.`,
        trace: ["package command → non-zero", "helper warning → return 1", "set -e → script terminates"],
      },
      adapted: {
        outcome: "QUARANTINED",
        tone: "warning" as const,
        headline: `18 of 19 core targets remain independently reviewable`,
        detail: "The browser adaptation records the failed target, continues the dry-run ledger and blocks release until the missing dependency is explicitly accepted or repaired.",
        trace: ["target → failed", "ledger → unresolved", "downstream plan → visible, not executed"],
      },
    };
  }

  if (failure === "torch-primary") {
    const fallback = plan.torch.fallbacks[0] ?? "no source fallback";
    return {
      source: {
        outcome: plan.torch.fallbacks.length ? "FALLBACK ENTERED" : "SKIPPED",
        tone: plan.torch.fallbacks.length ? ("warning" as const) : ("blocked" as const),
        headline: plan.torch.fallbacks.length ? `Primary fails; next attempt is ${fallback}` : "This route has no alternate accelerator wheel",
        detail: plan.torch.fallbacks.length
          ? `The framework branch catches its own failure and follows the explicit ${plan.torch.fallbacks.join(" → ")} chain.`
          : "The guarded command prints a warning and the remaining installer stages continue without PyTorch.",
        trace: ["primary wheel → non-zero", plan.torch.fallbacks.length ? `fallback → ${fallback}` : "warning → framework skipped", "later stages → continue"],
      },
      adapted: {
        outcome: "CAPABILITY DOWNGRADE",
        tone: "warning" as const,
        headline: "The selected wheel and observed device are reconciled separately",
        detail: "A fallback may import successfully yet provide no acceleration. The adapted check records actual CUDA/MPS capability alongside package availability.",
        trace: ["artifact → resolved", "import → required", "accelerator probe → required"],
      },
    };
  }

  if (failure === "tensorflow-runtime") {
    return {
      source: {
        outcome: "FALSE-PASS RISK",
        tone: "blocked" as const,
        headline: "An empty GPU list can still produce exit status 0",
        detail: "The source test evaluates list_physical_devices('GPU') but does not assert that the returned list contains a device. A successful import can therefore print the source's CUDA-test-passed message.",
        trace: ["TensorFlow import → succeeds", "GPU list → []", "process exit → 0 / source labels pass"],
      },
      adapted: {
        outcome: "FALLBACK REQUIRED",
        tone: "warning" as const,
        headline: "Acceleration is claimed only when device count is greater than zero",
        detail: "The safer rule separates import health from accelerator health and routes an empty device list to a CPU-labelled outcome.",
        trace: ["import → pass", "GPU count → 0", "capability → CPU / review GPU route"],
      },
    };
  }

  return {
    source: {
      outcome: "CONTINUES WITH WARNING",
      tone: "warning" as const,
      headline: "The remote bootstrap failure is caught",
      detail: "The source logs the failed Hugging Face CLI bootstrap and continues to package verification. It downloads and executes a remote script without a source-pinned checksum.",
      trace: ["curl-to-shell → fails", "bootstrap warning → emitted", "verification → continues"],
    },
    adapted: {
      outcome: "SUPPLY-CHAIN GATE",
      tone: "blocked" as const,
      headline: "Unreviewed remote execution is blocked before launch",
      detail: "The adaptation requires a versioned artifact that can be reviewed, plus integrity evidence. It intentionally does not generate or execute a replacement command.",
      trace: ["artifact provenance → missing", "checksum → missing", "execution → blocked"],
    },
  };
}

function OutcomeCard({ title, result }: { title: string; result: ReturnType<typeof failureNarrative>["source"] }) {
  return (
    <article className={`${styles.outcomeCard} ${styles[result.tone]}`}>
      <header><span>{title}</span><strong>{result.outcome}</strong></header>
      <h3>{result.headline}</h3>
      <p>{result.detail}</p>
      <ol>
        {result.trace.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
      </ol>
    </article>
  );
}

function FailureLab({ plan }: { plan: ResolvedPlan }) {
  const [failure, setFailure] = useState<FailureId>("tensorflow-runtime");
  const [failedInstall, setFailedInstall] = useState("lightgbm");
  const failedPackage = CORE_PACKAGES.find((item) => item.install === failedInstall) ?? CORE_PACKAGES[15];
  const comparison = failureNarrative(failure, failedPackage, plan);

  return (
    <div className={styles.failureLab}>
      <section className={styles.faultControls}>
        <div className={styles.panelHeading}>
          <span>FX</span>
          <strong>DETERMINISTIC FAULT INJECTION</strong>
          <em>SIMULATION ONLY</em>
        </div>
        <p>Choose one failure boundary. No command runs; the state trace is derived from the audited control flow.</p>
        <div className={styles.faultButtons}>
          {([
            ["core-package", "Core package", "set -e boundary"],
            ["torch-primary", "PyTorch wheel", "fallback chain"],
            ["tensorflow-runtime", "TensorFlow device", "empty GPU list"],
            ["hf-bootstrap", "HF bootstrap", "remote script"],
          ] as const).map(([id, label, hint]) => (
            <button key={id} type="button" aria-pressed={failure === id} onClick={() => setFailure(id)}>
              <strong>{label}</strong><span>{hint}</span>
            </button>
          ))}
        </div>
        {failure === "core-package" ? (
          <label className={styles.field}>
            <span>Fail at core call</span>
            <ClassicSelect value={failedInstall} onChange={(event) => setFailedInstall(event.target.value)}>
              {CORE_PACKAGES.map((item, index) => <option key={item.install} value={item.install}>{String(index + 1).padStart(2, "0")} · {item.name}</option>)}
            </ClassicSelect>
          </label>
        ) : null}
      </section>

      <div className={styles.outcomeGrid}>
        <OutcomeCard title="SOURCE SHELL" result={comparison.source} />
        <OutcomeCard title="GUARDED BROWSER PLAN" result={comparison.adapted} />
      </div>

      <section className={styles.checkpointMatrix}>
        <div className={styles.panelHeading}>
          <span>QA</span>
          <strong>CHECKPOINT SEPARATION</strong>
          <em>INSTALL ≠ IMPORT ≠ ACCELERATION</em>
        </div>
        <div className={styles.checkpointHeader}><span>Checkpoint</span><span>Source</span><span>Guarded plan</span></div>
        {[
          ["Artifact integrity", "Not checked", "Required before execution"],
          ["Package command", "Exit status", "Exit status + ledger"],
          ["Module import", "23 import attempts", "Import name reconciled"],
          ["GPU capability", "Reports availability; TF fallback test is weak", "Non-empty device assertion"],
          ["Whole manifest", "No retained run manifest", "All 24 targets reconciled"],
        ].map(([label, source, adapted]) => (
          <div className={styles.checkpointRow} key={label}><strong>{label}</strong><span>{source}</span><span>{adapted}</span></div>
        ))}
      </section>
    </div>
  );
}

function ManifestView({ plan }: { plan: ResolvedPlan }) {
  const [filter, setFilter] = useState<ManifestFilter>("All");
  const visiblePackages = filter === "All" ? CORE_PACKAGES : CORE_PACKAGES.filter((item) => item.group === filter);
  const tensorflowInstall = plan.tensorflow.target.split(" · ")[0];
  const frameworkTargets = ["torch", "torchvision", tensorflowInstall, "keras"];

  return (
    <div className={styles.manifestView}>
      <section className={styles.manifestSummary}>
        <div><span>CORE CALLS</span><strong>19</strong><small>sequential pip installs</small></div>
        <div><span>FRAMEWORK TARGETS</span><strong>4</strong><small>{frameworkTargets.join(" · ")}</small></div>
        <div><span>CLI TARGET</span><strong>1</strong><small>Hugging Face CLI</small></div>
        <div className={styles.warning}><span>KNOWN PROBE DRIFT</span><strong>1</strong><small>grad-cam distribution ≠ import token</small></div>
      </section>

      <section className={styles.packagePanel}>
        <div className={styles.panelHeading}>
          <span>PKG</span>
          <strong>CORE PACKAGE LEDGER</strong>
          <em>{visiblePackages.length} OF 19 SHOWN</em>
        </div>
        <div className={styles.filterBar} aria-label="Filter package groups">
          {MANIFEST_FILTERS.map((item) => (
            <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <div className={styles.packageHeader}><span>#</span><span>Distribution</span><span>Import probe</span><span>Group</span><span>Alignment</span></div>
        <div className={styles.packageRows}>
          {visiblePackages.map((item) => {
            const sourceIndex = CORE_PACKAGES.indexOf(item) + 1;
            return (
              <div className={styles.packageRow} key={item.install}>
                <span>{String(sourceIndex).padStart(2, "0")}</span>
                <strong>{item.install}</strong>
                <code>{item.module}</code>
                <span>{item.group}</span>
                <em className={styles[item.probe === "aligned" ? "ready" : "warning"]}>{item.probe === "aligned" ? "MATCH" : "MISMATCH"}</em>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.manifestBottom}>
        <section className={styles.commandPanel}>
          <div className={styles.panelHeading}>
            <span>&gt;_</span>
            <strong>SELECTED ROUTE MANIFEST</strong>
            <em>READ ONLY</em>
          </div>
          <div className={styles.commandLines} aria-label="Resolved dry-run manifest">
            <p><span>01</span><code>platform</code><strong>{plan.platformLabel}</strong></p>
            <p><span>02</span><code>artifact</code><strong>{plan.installer}</strong></p>
            <p><span>03</span><code>environment</code><strong>{plan.environmentAction}</strong></p>
            <p><span>04</span><code>pytorch</code><strong>{plan.torch.target}</strong></p>
            <p><span>05</span><code>tensorflow</code><strong>{plan.tensorflow.target}</strong></p>
            <p><span>06</span><code>verification</code><strong>23 imports · accelerator capability probes</strong></p>
          </div>
        </section>
        <section className={styles.reconciliationCard}>
          <span>MANIFEST RECONCILIATION</span>
          <div className={styles.reconcileEquation}>
            <strong>19</strong><i>+</i><strong>4</strong><i>+</i><strong>1</strong><i>=</i><strong>24</strong>
          </div>
          <p>Core package targets + framework distributions + external CLI.</p>
          <div><span>23 Python import probes</span><span>+ 1 CLI presence probe</span></div>
          <small>The source’s Grad-CAM verifier uses a hyphenated import token; the exhibit flags the invalid check and withholds a result.</small>
        </section>
      </div>
    </div>
  );
}

function AuditView() {
  return (
    <div className={styles.auditView}>
      <section className={styles.evidenceHero}>
        <div><span>SOURCE SNAPSHOT</span><strong>{SOURCE_COMMIT}</strong><small>repository HEAD audited read-only</small></div>
        <div><span>INSTALLER LAST CHANGE</span><strong>{INSTALLER_COMMIT}</strong><small>08 Dec 2025</small></div>
        <div><span>SHELL FUNCTIONS</span><strong>22</strong><small>968 source lines</small></div>
        <div><span>INSTALLER COMMITS</span><strong>13</strong><small>tracked evolution</small></div>
      </section>

      <div className={styles.auditGrid}>
        <section className={styles.auditCard}>
          <div className={styles.panelHeading}><span>✓</span><strong>EXECUTED EVIDENCE</strong><em>VERIFIED</em></div>
          <ul>
            <li><strong>Shell syntax</strong><span><code>bash -n</code> passes at the audited working-tree snapshot.</span></li>
            <li><strong>Notebook boundary</strong><span>Coursework notebooks contain executed outputs, but their microrobot task duplicates an existing exhibit and is excluded here.</span></li>
            <li><strong>Repository state</strong><span>The IX-DeepLearning source tree was inspected read-only; this exhibit uses no model files, image rows or report prose.</span></li>
          </ul>
        </section>

        <section className={styles.auditCard}>
          <div className={styles.panelHeading}><span>?</span><strong>NOT DEMONSTRATED</strong><em>DO NOT CLAIM</em></div>
          <ul>
            <li><strong>Cross-platform success</strong><span>No CI matrix or retained installation logs prove every OS, wheel and CUDA branch.</span></li>
            <li><strong>Current compatibility</strong><span>CUDA and framework comments are a December 2025 source snapshot, not current vendor guidance.</span></li>
            <li><strong>Reproducibility</strong><span>Pip targets are unpinned; remote artifacts are not accompanied by checksums or a resolved lockfile.</span></li>
          </ul>
        </section>
      </div>

      <section className={styles.diffPanel}>
        <div className={styles.panelHeading}><span>Δ</span><strong>SOURCE / ADAPTATION DIFF</strong><em>VISIBLE BOUNDARY</em></div>
        <div className={styles.diffHeader}><span>Concern</span><span>Implemented source</span><span>Browser adaptation</span></div>
        {[
          ["Architecture", "macOS Intel exits; Linux always selects x86_64 artifact", "Blocks every artifact/architecture mismatch"],
          ["Package policy", "19 sequential unpinned installs", "Shows targets and requires a future lockfile"],
          ["Failure semantics", "Core helper returns 1 under set -e", "Records an unresolved target without pretending success"],
          ["TensorFlow GPU", "Process exit after listing devices", "Requires a non-empty device list"],
          ["Remote bootstrap", "curl response is piped to bash", "Execution withheld pending provenance and integrity"],
          ["Grad-CAM probe", "Attempts import token “grad-cam”", "Flags expected module-name reconciliation"],
        ].map(([concern, source, adapted]) => (
          <div className={styles.diffRow} key={concern}><strong>{concern}</strong><span>{source}</span><span>{adapted}</span></div>
        ))}
      </section>

      <div className={styles.boundaryGrid}>
        <section>
          <span>PRIVACY + ASSESSMENT BOUNDARY</span>
          <p>No assessed solution text, dataset rows, microscopy images, report figures, trained weights, system paths or credentials are published. Every host profile is synthetic and no browser data leaves the page.</p>
        </section>
        <section>
          <span>LICENCE BOUNDARY</span>
          <p>The audited private repository has no LICENSE, COPYING or NOTICE file. This is an independently implemented case study, not reusable source.</p>
        </section>
        <section className={styles.sourceBoundary}>
          <span>PRIVATE SOURCE AUDIT</span>
          <strong>Installer inspected at {SOURCE_COMMIT}</strong>
          <small>No public repository action · exact local checkout</small>
        </section>
      </div>
    </div>
  );
}

export function EnvironmentPlannerStudio() {
  const [view, setView] = useState<ViewId>("resolver");
  const [mode, setMode] = useState<PlannerMode>("adapted");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const plan = useMemo(() => resolvePlan(profile, mode), [mode, profile]);

  return (
    <DemoWindow
      appName="DL Environment Resolver — Case Study"
      title="Accelerator Environment Planner"
      status="SYNTHETIC · DRY RUN"
      purpose="Turn host, architecture and accelerator facts into an explainable deep-learning installation route before commands are run."
      tryThis="Choose a host, inject a framework failure and compare the source route with the guarded plan."
      watchFor="Compatibility branches, fallbacks and validation probes change; this is a dry-run planner and executes nothing."
      statusTone="safe"
      className={styles.studio}
      footer={
        <>
          <span>Source {SOURCE_COMMIT} · installer {INSTALLER_COMMIT} · no commands executed</span>
          <span>{plan.platformLabel} · {mode === "source" ? "source route" : "guarded plan"}</span>
        </>
      }
    >
      <div className={styles.provenanceBanner} role="note">
        <span>SOURCE-FAITHFUL AUDIT</span>
        <p>A read-only reconstruction of a 968-line Bash installer’s OS, accelerator, fallback and verification branches. Compatibility labels describe the 2025 source snapshot—not present-day package guidance.</p>
        <strong>NO INSTALL · NO DEVICE ACCESS</strong>
      </div>

      <ModeSwitch mode={mode} setMode={setMode} />

      <nav className={styles.viewTabs} aria-label="Environment planner views">
        {VIEWS.map((item) => (
          <button type="button" key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}>
            <strong>{item.label}</strong><span>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className={styles.canvas}>
        {view === "resolver" ? <ResolverView profile={profile} setProfile={setProfile} mode={mode} plan={plan} /> : null}
        {view === "failure" ? <FailureLab plan={plan} /> : null}
        {view === "manifest" ? <ManifestView plan={plan} /> : null}
        {view === "audit" ? <AuditView /> : null}
      </div>
    </DemoWindow>
  );
}

export default EnvironmentPlannerStudio;
