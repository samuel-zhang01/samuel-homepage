/** Selected original figures and interfaces; provenance is in docs/VISUAL_SHOWCASE_SOURCES.md. */
export type ProjectShowcaseImage = Readonly<{
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  label?: string;
  source?: string;
}>;

export const projectShowcaseImages: Partial<Record<string, readonly ProjectShowcaseImage[]>> = {
  "air-quality-sensor-optimisation": [
    {
      "src": "/projects/project-showcases/air-quality-cost-frontier.webp",
      "alt": "Saved LASSO plot showing prediction error falling as the assumed sensor budget increases.",
      "caption": "My notebook compares sensor combinations by assumed purchase cost and five-fold prediction error. The stars mark cheaper and more accurate options; these are study costs, not current quotes.",
      "width": 1605,
      "height": 590,
      "label": "Sensor cost vs error"
    }
  ],
  "regularisation-lab": [
    {
      "src": "/projects/project-showcases/regularisation-ridge.webp",
      "alt": "Saved Ridge coefficient paths; stronger regularisation draws the coloured weights towards zero.",
      "caption": "Each line is one sensor coefficient in my saved fit. Move right to increase the penalty: Ridge reduces the weights without abruptly selecting a small subset. The red line marks the cross-validation choice.",
      "width": 895,
      "height": 590,
      "label": "Ridge: shrink the weights"
    },
    {
      "src": "/projects/project-showcases/regularisation-lasso.webp",
      "alt": "Saved LASSO coefficient paths; most coloured weights become exactly zero as the penalty increases.",
      "caption": "The same sensor data with LASSO. Increasing the penalty removes coefficients completely, creating smaller sensor sets. This is the calculation behind the cost-versus-error comparison.",
      "width": 894,
      "height": 590,
      "label": "LASSO: select a smaller set"
    }
  ],
  "cost-sensitive-cyber-detection": [
    {
      "src": "/projects/project-showcases/cyber-roc-comparison.webp",
      "alt": "Historical ROC curves for five classifiers, plotting caught attacks against false alarms.",
      "caption": "My saved comparison makes the false-alarm trade-off visible. Duplicate rows overlapped the original train/test split, so these curves explain the experiment and cannot establish deployment accuracy.",
      "width": 789,
      "height": 395,
      "label": "Detection trade-off"
    }
  ],
  "safety-critical-ai": [
    {
      "src": "/projects/project-showcases/safety-population-shift.webp",
      "alt": "Synthetic coursework histograms showing calibration values on one side of a split and test values on the other.",
      "caption": "In my synthetic coursework example, I split calibration and test cases by one feature. Their distributions visibly differ. That mismatch prompts a coverage check; it does not by itself prove the intervals failed.",
      "width": 500,
      "height": 392,
      "label": "A different test population"
    }
  ],
  "safe-learning-to-defer": [
    {
      "src": "/projects/project-showcases/deferral-coverage-accuracy.webp",
      "alt": "Saved accuracy-versus-coverage curves comparing Safe-L2D, L2D, confidence filtering and no deferral.",
      "caption": "Move right for more automated decisions and less review. My saved benchmark compares the resulting combined accuracy; the simpler confidence baseline can perform better. Reviewer answers were simulated.",
      "width": 696,
      "height": 527,
      "label": "Automation vs review",
      "source": "https://github.com/samuel-zhang01/IX-Safety-Latex/blob/00c5099469c98fb6271a1754d6cf565963df898a/figures/coverage_accuracy_tradeoff.pdf"
    }
  ],
  "causal-ope-lab": [
    {
      "src": "/projects/project-showcases/ope-synthetic-comparison.webp",
      "alt": "Five policy-value estimates from twelve synthetic experiments, with a dashed line for the known simulated value.",
      "caption": "My teaching experiment compares five ways to reuse logged decisions. The dashed line is the known simulated policy value; bars and whiskers show the mean and spread across twelve runs. No real claims are shown.",
      "width": 1100,
      "height": 677,
      "label": "Estimate a different policy",
      "source": "https://github.com/samuel-zhang01/STUDY-RL/blob/04936cf1cb694873e2857aa9a316ae520ad2c43a/week-11-contextual-bandits-ope/figs/fig_ope_bias.pdf"
    }
  ],
  "sequential-decisions-lab": [
    {
      "src": "/projects/project-showcases/bandit-regret-comparison.webp",
      "alt": "Four bandit strategies accumulate different amounts of regret over two thousand choices in a saved ten-arm simulation.",
      "caption": "My ten-arm simulation compares four exploration strategies over twenty seeded runs. Lower regret means fewer missed rewards. The shaded bands show variation between runs; the browser uses a smaller three-arm example.",
      "width": 1100,
      "height": 660,
      "label": "Learning which arm to choose",
      "source": "https://github.com/samuel-zhang01/STUDY-RL/blob/04936cf1cb694873e2857aa9a316ae520ad2c43a/week-01-mdps-bandits/figs/fig_bernoulli_bakeoff.pdf"
    }
  ],
  "study-rl": [
    {
      "src": "/projects/project-showcases/preference-objectives.webp",
      "alt": "Three loss functions from my reinforcement-learning notes, plotted against the margin between preferred and rejected answers.",
      "caption": "This original teaching figure shows how three objectives penalise the same answer preference. The horizontal axis is the preferred-minus-rejected margin. These are formula curves, not measured language-model scores.",
      "width": 1000,
      "height": 500,
      "label": "How preference penalties differ",
      "source": "https://github.com/samuel-zhang01/STUDY-RL/blob/04936cf1cb694873e2857aa9a316ae520ad2c43a/week-19-dpo-zoo/figs/fig_links.pdf"
    }
  ],
  "pc-saft-thermodynamics": [
    {
      "src": "/projects/project-showcases/co2-water-phase-equilibrium.webp",
      "alt": "Saved pressure–composition curves for carbon dioxide and water at 323.15 kelvin; the composition axis contains a break.",
      "caption": "Another saved Clapeyron calculation compares four models for CO₂–water equilibrium at 323.15 K. The broken horizontal axis shows both dilute and nearly pure compositions. This is vapour–liquid equilibrium, not a drug-solubility result.",
      "width": 599,
      "height": 448,
      "label": "CO₂ and water: two phases"
    },
    {
      "src": "/projects/project-showcases/methanol-phase-envelope.webp",
      "alt": "Saved methanol density–temperature phase envelope comparing seven equations of state with public NIST experimental points.",
      "caption": "My Clapeyron example compares seven fluid models with public methanol measurements. The two branches are vapour and liquid. Temperature is in kelvin; the original axis mistakenly prints K⁻¹. This is separate from private compound studies.",
      "width": 586,
      "height": 452,
      "label": "Methanol: liquid and vapour"
    }
  ],
  "cprot-spectroscopy-plotter": [
    {
      "src": "/projects/project-showcases/cprot-matlab-window.webp",
      "alt": "Original MATLAB spectroscopy plotting window with file-loading, frequency, title and export controls around an empty graph.",
      "caption": "The original window saved inside my MATLAB app: load a trace, choose a frequency window, label the axes and save a figure. The graph is empty here; unpublished experimental traces are not displayed.",
      "width": 1139,
      "height": 570,
      "label": "Original MATLAB app",
      "source": "https://github.com/samuel-zhang01/CPROT-Spec-Fast-Plotter/blob/9c6496d7b3c9f67dad163bf6f289de5e22ed3fd0/PlotterGUI.mlapp"
    },
    {
      "src": "/projects/project-showcases/cprot-frequency-controls.webp",
      "alt": "Original MATLAB controls for frequency centre, range, coarse and fine adjustment, and left/right panning.",
      "caption": "A closer view of the original controls I built for moving through a long spectrum. Centre and range select the visible MHz window; the arrow buttons pan it.",
      "width": 889,
      "height": 218,
      "label": "Frequency-window controls",
      "source": "https://github.com/samuel-zhang01/CPROT-Spec-Fast-Plotter/blob/9c6496d7b3c9f67dad163bf6f289de5e22ed3fd0/PlotterGUI.mlapp"
    }
  ],
  "coding-series": [
    {
      "src": "/projects/project-showcases/coding-self-avoiding-walk.webp",
      "alt": "Original saved three-dimensional self-avoiding walk with 150 steps, coloured from its start to its end.",
      "caption": "One of my Julia experiments: a 150-step path that cannot revisit an occupied lattice point. The colour follows progress from Start to End. This is a simulated chain, not a measured molecular structure.",
      "width": 1000,
      "height": 800,
      "label": "A self-avoiding walk"
    }
  ],
  "growmat": [
    {
      "src": "/projects/project-showcases/growmat-workload-manager.webp",
      "alt": "Original GROWMAT web scheduling interface from the public showcase, with operational fields already blurred.",
      "caption": "The GROWMAT web interface I built for viewing and editing the workload. Team filters, manual-job entry and spreadsheet export sit above the schedule. This is the already-redacted public showcase image.",
      "width": 687,
      "height": 448,
      "label": "The original workload manager",
      "source": "/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf#page=6"
    },
    {
      "src": "/projects/project-showcases/growmat-workload-visualiser.webp",
      "alt": "Original GROWMAT Spotfire dashboard showing scheduled work, project totals and team workload from the public showcase.",
      "caption": "My Spotfire view turns scheduled jobs into workload by date, project and team. Linked charts let an analyst narrow the view and inspect the matching schedule. Confidential fields were blurred in the published slide.",
      "width": 687,
      "height": 448,
      "label": "The original Spotfire dashboard",
      "source": "/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf#page=6"
    },
    {
      "src": "/projects/project-showcases/growmat-capacity-forecast.webp",
      "alt": "Original GROWMAT Spotfire capacity and workload charts from page eight of the public showcase.",
      "caption": "This public showcase view compares workload with available capacity and breaks it down over time. The original app also offered overdue, near-due and next-month views so an analyst could spot pressure before a deadline.",
      "width": 710,
      "height": 463,
      "label": "Capacity and upcoming work",
      "source": "/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf#page=8"
    }
  ],
  "innovation-models-reflection": [
    {
      "src": "/projects/project-showcases/innovation-four-models.webp",
      "alt": "My original four-model diagram places Enabler, Producer, Opportunist and Advocate by resource authority and organisational ownership.",
      "caption": "My original diagram separates who owns innovation from how firmly resources are assigned. It is the framework I used for the reflection; it describes organisational choices rather than ranking company performance.",
      "width": 819,
      "height": 502,
      "label": "Four ways to organise innovation",
      "source": "/projects/innovation/four-models.pdf"
    }
  ]
};
