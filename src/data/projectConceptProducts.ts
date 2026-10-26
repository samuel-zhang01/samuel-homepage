export type ProductConceptMetadata = { title: string; steps: readonly { name: string; caption: string }[]; note?: string };

export const projectConceptProducts: Readonly<Record<string, ProductConceptMetadata>> = {

  "ultra-convert": {
    "title": "Files in, useful formats out",
    "steps": [
      {
        "name": "Choose files",
        "caption": "A mixed queue keeps the originals and creates separate results."
      },
      {
        "name": "Order rules",
        "caption": "The first matching folder rule decides what to do with an incoming file."
      },
      {
        "name": "Wait for a file",
        "caption": "A watched file must settle before conversion starts."
      },
      {
        "name": "Write a copy",
        "caption": "The result goes to its chosen destination; the source file remains."
      }
    ],
    "note": "Workflow example; conversion engines run in the Mac app."
  },
  "videomate": {
    "title": "A repair earns its place in the new collection",
    "steps": [
      {
        "name": "Inspect",
        "caption": "Readable picture and sound can survive a broken MP4 index."
      },
      {
        "name": "Rebuild",
        "caption": "Remuxing rebuilds the container around the existing streams."
      },
      {
        "name": "Verify",
        "caption": "Check decoding, streams and timing before accepting the candidate."
      },
      {
        "name": "Keep both",
        "caption": "Publish the checked copy and retain the original for review."
      }
    ],
    "note": "Generated index-repair example; missing recording data cannot be recreated."
  },
  "orbital-lab": {
    "title": "An orbital describes where an electron is likely to be",
    "steps": [
      {
        "name": "Choose 1s",
        "caption": "The hydrogen-like 1s model has a smooth radial probability distribution."
      },
      {
        "name": "Read the radius",
        "caption": "Inside one Bohr radius lies about 32% of this model’s probability."
      },
      {
        "name": "Widen the region",
        "caption": "Inside two Bohr radii, the probability rises to about 76%."
      },
      {
        "name": "Read probability",
        "caption": "Inside three Bohr radii is about 94%; this is not a fixed electron path."
      }
    ],
    "note": "Hydrogen-like educational model; the full lab also shows phase and 3D density."
  },
  "desk-note-pad": {
    "title": "A thought stays on the page where you left it",
    "steps": [
      {
        "name": "Write",
        "caption": "Capture a note on one of eight local pages."
      },
      {
        "name": "Add the date",
        "caption": "Insert today’s date without replacing the note."
      },
      {
        "name": "Turn the page",
        "caption": "A second page gives the next thought its own space."
      },
      {
        "name": "Return",
        "caption": "Return to the first page or export a text copy."
      }
    ],
    "note": "Example notes; saved in this browser, without cloud sync."
  },
  "desk-sketch-pad": {
    "title": "A quick drawing can become a PNG",
    "steps": [
      {
        "name": "Draw",
        "caption": "Pointer strokes work with a mouse, trackpad or touch."
      },
      {
        "name": "Add a stroke",
        "caption": "Change ink or width for the next stroke."
      },
      {
        "name": "Undo",
        "caption": "Remove the last stroke without clearing the drawing."
      },
      {
        "name": "Export",
        "caption": "Export the remaining drawing as a PNG file."
      }
    ],
    "note": "Generated strokes show the editing sequence; open the app to draw."
  },
  "desk-quick-list": {
    "title": "Keep the next jobs visible",
    "steps": [
      {
        "name": "Capture",
        "caption": "Add a task without setting up a project."
      },
      {
        "name": "Prioritise",
        "caption": "Mark the task that needs attention first."
      },
      {
        "name": "Complete",
        "caption": "Tick a finished task and keep its place in the list."
      },
      {
        "name": "Filter",
        "caption": "The active filter leaves unfinished tasks in view."
      }
    ],
    "note": "Example tasks; the actual list stays in this browser."
  },
  "desk-focus-clock": {
    "title": "A deadline keeps a focus sprint on time",
    "steps": [
      {
        "name": "Start",
        "caption": "Choose a 25-minute focus sprint."
      },
      {
        "name": "Pause",
        "caption": "Pause preserves the remaining time."
      },
      {
        "name": "Continue",
        "caption": "Continuing sets a new deadline from the remaining time."
      },
      {
        "name": "Finish",
        "caption": "A completed sprint adds one to the daily tally."
      }
    ],
    "note": "Time is compressed here; the real clock uses elapsed wall time."
  },
  "desk-pocket-calendar": {
    "title": "Put a short note on a particular day",
    "steps": [
      {
        "name": "Choose a day",
        "caption": "Select a local calendar date."
      },
      {
        "name": "Write a note",
        "caption": "Attach a reminder to that day."
      },
      {
        "name": "Browse",
        "caption": "Other dates keep their own notes."
      },
      {
        "name": "Return to today",
        "caption": "Today’s shortcut brings the selected date back."
      }
    ],
    "note": "A local day notebook; it does not book or sync external meetings."
  },
  "desk-calculator": {
    "title": "Keep the workings beside the answer",
    "steps": [
      {
        "name": "Enter",
        "caption": "Enter a quick four-function calculation."
      },
      {
        "name": "Calculate",
        "caption": "The display gives the result; the paper tape keeps the expression."
      },
      {
        "name": "Use memory",
        "caption": "Store the result while making the next calculation."
      },
      {
        "name": "Copy",
        "caption": "Copy the answer while recent workings remain available."
      }
    ],
    "note": "Example calculation; the app also accepts keyboard input."
  },
  "desk-unit-converter": {
    "title": "Change units without changing the quantity",
    "steps": [
      {
        "name": "Choose units",
        "caption": "Twenty degrees Celsius is sixty-eight degrees Fahrenheit."
      },
      {
        "name": "Swap",
        "caption": "Swap the direction to convert the same temperature back."
      },
      {
        "name": "Check the basis",
        "caption": "Data sizes use decimal factors: 1,000 kilobytes make one megabyte."
      },
      {
        "name": "Copy the answer",
        "caption": "Copy the converted value with its destination unit in view."
      }
    ],
    "note": "Worked conversions; length and mass are available in the full app."
  },
  "desk-colour-studio": {
    "title": "Check whether text stands out from its background",
    "steps": [
      {
        "name": "Compare",
        "caption": "A pale foreground has little contrast against white."
      },
      {
        "name": "Darken the text",
        "caption": "A darker foreground increases the contrast ratio."
      },
      {
        "name": "Read the ratio",
        "caption": "The ratio describes this colour pair, not the whole page."
      },
      {
        "name": "Save a swatch",
        "caption": "Save the chosen foreground for later use."
      }
    ],
    "note": "The displayed ratios are calculated from relative luminance."
  },
  "coverd-ai": {
    "title": "A recruiter can follow the reasons behind a review",
    "steps": [
      {
        "name": "Receive",
        "caption": "Start with an application in the existing applicant tracking system."
      },
      {
        "name": "Review six views",
        "caption": "Skills and experience sit beside domain, trajectory, communication and culture."
      },
      {
        "name": "Ask a follow-up",
        "caption": "A follow-up can clarify what the application leaves unexplained."
      },
      {
        "name": "Recruiter decides",
        "caption": "Supporting statements and remaining questions stay visible for human review."
      }
    ],
    "note": "Product workflow sketch with fictional statements, not an applicant assessment."
  },
  "growmat": {
    "title": "Move a job, then see which day needs capacity",
    "steps": [
      {
        "name": "See the workload",
        "caption": "One busy day exceeds the example team’s available capacity."
      },
      {
        "name": "Move a job",
        "caption": "A governed schedule edit moves one job to the following day."
      },
      {
        "name": "Recalculate",
        "caption": "The calculation updates job-level workload and due-date projections."
      },
      {
        "name": "Read capacity",
        "caption": "The view connects each day’s workload to the jobs that create it."
      }
    ],
    "note": "Fictional jobs; the real seven-component platform refreshes every two hours."
  },
  "ocean-depths-finance": {
    "title": "Understand a balance change before calling it spending",
    "steps": [
      {
        "name": "Combine accounts",
        "caption": "Bank cash, investments and credit debt contribute to net worth."
      },
      {
        "name": "Match a payment",
        "caption": "A £200 card payment moves cash and debt together; net worth stays unchanged."
      },
      {
        "name": "Notice a change",
        "caption": "A recurring charge rising from £20 to £24 is a 20% price change."
      },
      {
        "name": "Avoid duplicates",
        "caption": "Recognise repeated imported rows instead of adding the same history twice."
      }
    ],
    "note": "Fictional balances and payments; no bank connection is made here."
  },
  "coverd-yasa": {
    "title": "Shared availability becomes one confirmed time",
    "steps": [
      {
        "name": "Offer times",
        "caption": "Occupied times are unavailable before the guest chooses."
      },
      {
        "name": "Choose a time",
        "caption": "The guest selects an available slot and gives the booking details."
      },
      {
        "name": "Check again",
        "caption": "The final conflict check protects against another booking taking the slot."
      },
      {
        "name": "Confirm",
        "caption": "A confirmed appointment can be downloaded, rescheduled or cancelled."
      }
    ],
    "note": "Example availability; this scene sends no invitation."
  },
  "parliamo-italian-learning": {
    "title": "Understand a pattern, use it, recall it",
    "steps": [
        {
            "name": "Notice",
            "caption": "Read a worked example, then identify the subject and the auxiliary verb."
        },
        {
            "name": "Check",
            "caption": "Try the gap with a hint if needed. First answers and supported corrections remain distinct."
        },
        {
            "name": "Produce",
            "caption": "Write about your own day, then check the verb and meaning against the lesson."
        },
        {
            "name": "Revisit",
            "caption": "Grammar errors and supported answers return after one day; an independent correct recall waits three days."
        }
    ],
    "note": "Illustrated grammar loop. Personal writing is self-assessed; the A2 preparation check is a grammar snapshot."
},
  "innovation-models-reflection": {
    "title": "Who owns the idea, and who can fund it?",
    "steps": [
      {
        "name": "Opportunist",
        "caption": "An idea starts with distributed responsibility and negotiated resources."
      },
      {
        "name": "Enabler",
        "caption": "Give the idea a standing budget while responsibility stays distributed."
      },
      {
        "name": "Producer",
        "caption": "A named venture function now owns the work and dedicated budget."
      },
      {
        "name": "Advocate",
        "caption": "Keep a focused owner but negotiate resources instead of controlling a budget."
      }
    ],
    "note": "Four support arrangements, not a ranking from bad to good."
  },
  "pc-saft-thermodynamics": {
    "title": "Molecular attraction changes a fluid’s pressure",
    "steps": [
      {
        "name": "Set a fluid",
        "caption": "At 330 K, the example mixture starts with interaction kAB = 0.02."
      },
      {
        "name": "Reduce attraction",
        "caption": "Increasing kAB weakens the unlike-molecule attraction."
      },
      {
        "name": "Read pressure",
        "caption": "Less attraction raises pressure along the calculated density curve."
      },
      {
        "name": "Compare",
        "caption": "The reference curve makes the change visible at the same density."
      }
    ],
    "note": "Calculated example parameters; a homogeneous pressure curve is not a phase-equilibrium result."
  },
  "drug-solubility": {
    "title": "Warming the solvent changes how much solid dissolves",
    "steps": [
      {
        "name": "Set temperature",
        "caption": "At 298 K, the invented mixture dissolves about 72 mg per gram of solvent."
      },
      {
        "name": "Warm the mixture",
        "caption": "At 318 K, the same model gives about 145 mg per gram."
      },
      {
        "name": "Solve equilibrium",
        "caption": "The root finder balances the solid’s melting cost with liquid interactions."
      },
      {
        "name": "Read lab units",
        "caption": "Convert the dissolved mole fraction to mg per gram of solvent."
      }
    ],
    "note": "Values calculated by the browser solver with invented compounds, not measured drug data."
  },
  "molecular-recognition": {
    "title": "Several spectral lines can distinguish a molecular shape",
    "steps": [
      {
        "name": "Candidate shapes",
        "caption": "A conformer search supplies candidate molecular shapes."
      },
      {
        "name": "Predict lines",
        "caption": "Each candidate predicts a different rotational fingerprint."
      },
      {
        "name": "Compare lines",
        "caption": "Match several generated observed peaks with the candidate, not just one."
      },
      {
        "name": "Inspect residuals",
        "caption": "Small frequency differences support a plausible assignment; unexplained peaks remain."
      }
    ],
    "note": "Synthetic spectra from the browser; original measurements are not reproduced."
  },
  "cprot-spectroscopy-plotter": {
    "title": "Turn a dense trace into a legible spectrum",
    "steps": [
      {
        "name": "Load a trace",
        "caption": "A two-column frequency–intensity trace supplies the plot."
      },
      {
        "name": "Choose a window",
        "caption": "Centre on 5,175 MHz and narrow the visible frequency span."
      },
      {
        "name": "Label the figure",
        "caption": "Readable labels and a chosen colour make the figure useful."
      },
      {
        "name": "Export",
        "caption": "The MATLAB utility exports high-resolution figures, with 600 DPI as its default."
      }
    ],
    "note": "Generated trace; the real MATLAB controls use your own measurements."
  },
  "deep-learning-environment-resolver": {
    "title": "An installed package still needs a device check",
    "steps": [
      {
        "name": "Identify the host",
        "caption": "The platform selects an architecture-specific installation route."
      },
      {
        "name": "Build the plan",
        "caption": "Create the Python environment and choose framework routes."
      },
      {
        "name": "Check imports",
        "caption": "An import check can reveal a missing or incompatible framework."
      },
      {
        "name": "Check the device",
        "caption": "Runtime accelerator checks distinguish a GPU route from a CPU fallback."
      }
    ],
    "note": "Illustrated host and checks; no installer runs and no current compatibility is promised."
  },
  "gromacs-hpc": {
    "title": "Prepare a topology before a molecular simulation",
    "steps": [
      {
        "name": "Linux layer",
        "caption": "WSL 2 supplies the Linux environment on a Windows workstation."
      },
      {
        "name": "GPU container",
        "caption": "CUDA and the container toolkit connect the GPU to a scientific container."
      },
      {
        "name": "Prepare topology",
        "caption": "The completed pdb2gmx step prepares the molecular topology."
      },
      {
        "name": "Know the boundary",
        "caption": "This record reaches preprocessing; it does not show a completed dynamics run."
      }
    ],
    "note": "Source workflow notes; no trajectory or performance result is implied."
  },
  "home-automation-stack": {
    "title": "A backup matters when a dependency fails",
    "steps": [
      {
        "name": "Schedule a backup",
        "caption": "A scheduled dump creates a recovery point for the database."
      },
      {
        "name": "Detect failure",
        "caption": "A failed new dump must not replace the last verified backup."
      },
      {
        "name": "Keep a good copy",
        "caption": "Retain the known-good copy while affected services wait."
      },
      {
        "name": "Test restoration",
        "caption": "Restore into a separate target and check it before relying on it."
      }
    ],
    "note": "Recovery design example; no live database or service is changed."
  },
  "stock-market-engine": {
    "title": "Trade size and random impact move a toy price",
    "steps": [
      {
        "name": "Start a seeded day",
        "caption": "A fixed seed makes the generated sequence repeatable."
      },
      {
        "name": "Replay trades",
        "caption": "Each buy or sell changes price by quantity times a sampled impact."
      },
      {
        "name": "Follow the path",
        "caption": "Five traders across ten loops create fifty events in a day."
      },
      {
        "name": "Compare windows",
        "caption": "The full day and the original partial window produce different daily statistics."
      }
    ],
    "note": "Recorded seeded browser run, not a market prediction or a real trade."
  },
  "covid-decision-support": {
    "title": "Changing public information becomes a planning brief",
    "steps": [
      {
        "name": "Gather",
        "caption": "Public epidemiological information is the starting point."
      },
      {
        "name": "Review changes",
        "caption": "Analysis connects changing information with planning questions."
      },
      {
        "name": "Prepare the brief",
        "caption": "Workflow automation helps put the relevant context in one place."
      },
      {
        "name": "Human review",
        "caption": "People review the planning context before operational decisions."
      }
    ],
    "note": "Public contribution sketch only; operational and personnel details stay private."
  },
  "coding-series": {
    "title": "A sampler can reject a move and still make progress",
    "steps": [
      {
        "name": "Current state",
        "caption": "Start from one example energy in a Metropolis chain."
      },
      {
        "name": "Propose a move",
        "caption": "A higher-energy proposal is accepted only with a temperature-dependent probability."
      },
      {
        "name": "Compare the draw",
        "caption": "The random draw is larger than the acceptance probability, so this move is rejected."
      },
      {
        "name": "Keep the state",
        "caption": "A rejected proposal repeats the current state; it is not removed from the chain."
      }
    ],
    "note": "Worked reduced-unit example; the full labs add polymers, dynamics and quantum-energy comparisons."
  }
};

// Generated from the existing browser equation/seeded replay implementations.
// Invented scientific parameters and a deterministic teaching market; not private measurements.
export const productConceptNumbers = {
  "thermo": [
    {
      "k": 0.02,
      "pressure": 1.112592,
      "points": [
        [
          100,
          0.263504
        ],
        [
          145,
          0.375106
        ],
        [
          190,
          0.482475
        ],
        [
          235,
          0.585681
        ],
        [
          280,
          0.684792
        ],
        [
          325,
          0.779875
        ],
        [
          370,
          0.870996
        ],
        [
          415,
          0.958223
        ],
        [
          460,
          1.041622
        ],
        [
          505,
          1.121257
        ],
        [
          550,
          1.197193
        ],
        [
          595,
          1.269494
        ],
        [
          640,
          1.338223
        ],
        [
          685,
          1.403443
        ],
        [
          730,
          1.465216
        ],
        [
          775,
          1.523601
        ],
        [
          820,
          1.57866
        ],
        [
          865,
          1.630451
        ],
        [
          910,
          1.679033
        ],
        [
          955,
          1.724462
        ],
        [
          1000,
          1.766796
        ],
        [
          1045,
          1.80609
        ],
        [
          1090,
          1.842398
        ],
        [
          1135,
          1.875774
        ],
        [
          1180,
          1.906271
        ],
        [
          1225,
          1.933941
        ],
        [
          1270,
          1.958833
        ],
        [
          1315,
          1.980998
        ],
        [
          1360,
          2.000484
        ],
        [
          1405,
          2.017339
        ],
        [
          1450,
          2.031609
        ],
        [
          1495,
          2.04334
        ]
      ]
    },
    {
      "k": 0.08,
      "pressure": 1.123636,
      "points": [
        [
          100,
          0.263964
        ],
        [
          145,
          0.376068
        ],
        [
          190,
          0.484121
        ],
        [
          235,
          0.588187
        ],
        [
          280,
          0.688333
        ],
        [
          325,
          0.784624
        ],
        [
          370,
          0.877123
        ],
        [
          415,
          0.965897
        ],
        [
          460,
          1.051007
        ],
        [
          505,
          1.132517
        ],
        [
          550,
          1.210489
        ],
        [
          595,
          1.284985
        ],
        [
          640,
          1.356066
        ],
        [
          685,
          1.423792
        ],
        [
          730,
          1.488223
        ],
        [
          775,
          1.549417
        ],
        [
          820,
          1.607433
        ],
        [
          865,
          1.662328
        ],
        [
          910,
          1.714157
        ],
        [
          955,
          1.762978
        ],
        [
          1000,
          1.808844
        ],
        [
          1045,
          1.85181
        ],
        [
          1090,
          1.891927
        ],
        [
          1135,
          1.929249
        ],
        [
          1180,
          1.963826
        ],
        [
          1225,
          1.995709
        ],
        [
          1270,
          2.024947
        ],
        [
          1315,
          2.051587
        ],
        [
          1360,
          2.075678
        ],
        [
          1405,
          2.097266
        ],
        [
          1450,
          2.116396
        ],
        [
          1495,
          2.133112
        ]
      ]
    },
    {
      "k": 0.14,
      "pressure": 1.134423,
      "points": [
        [
          100,
          0.264412
        ],
        [
          145,
          0.377006
        ],
        [
          190,
          0.485725
        ],
        [
          235,
          0.59063
        ],
        [
          280,
          0.691787
        ],
        [
          325,
          0.789257
        ],
        [
          370,
          0.883103
        ],
        [
          415,
          0.973387
        ],
        [
          460,
          1.060171
        ],
        [
          505,
          1.143515
        ],
        [
          550,
          1.22348
        ],
        [
          595,
          1.300125
        ],
        [
          640,
          1.37351
        ],
        [
          685,
          1.443692
        ],
        [
          730,
          1.51073
        ],
        [
          775,
          1.57468
        ],
        [
          820,
          1.635598
        ],
        [
          865,
          1.693541
        ],
        [
          910,
          1.748563
        ],
        [
          955,
          1.800717
        ],
        [
          1000,
          1.850057
        ],
        [
          1045,
          1.896636
        ],
        [
          1090,
          1.940504
        ],
        [
          1135,
          1.981712
        ],
        [
          1180,
          2.02031
        ],
        [
          1225,
          2.056348
        ],
        [
          1270,
          2.089872
        ],
        [
          1315,
          2.12093
        ],
        [
          1360,
          2.149568
        ],
        [
          1405,
          2.175832
        ],
        [
          1450,
          2.199765
        ],
        [
          1495,
          2.221412
        ]
      ]
    },
    {
      "k": 0.2,
      "pressure": 1.144953,
      "points": [
        [
          100,
          0.264848
        ],
        [
          145,
          0.37792
        ],
        [
          190,
          0.487287
        ],
        [
          235,
          0.593011
        ],
        [
          280,
          0.695153
        ],
        [
          325,
          0.793774
        ],
        [
          370,
          0.888935
        ],
        [
          415,
          0.980695
        ],
        [
          460,
          1.069115
        ],
        [
          505,
          1.154252
        ],
        [
          550,
          1.236167
        ],
        [
          595,
          1.314915
        ],
        [
          640,
          1.390556
        ],
        [
          685,
          1.463144
        ],
        [
          730,
          1.532737
        ],
        [
          775,
          1.59939
        ],
        [
          820,
          1.663157
        ],
        [
          865,
          1.724092
        ],
        [
          910,
          1.782249
        ],
        [
          955,
          1.837679
        ],
        [
          1000,
          1.890435
        ],
        [
          1045,
          1.940568
        ],
        [
          1090,
          1.988128
        ],
        [
          1135,
          2.033163
        ],
        [
          1180,
          2.075724
        ],
        [
          1225,
          2.115856
        ],
        [
          1270,
          2.153608
        ],
        [
          1315,
          2.189026
        ],
        [
          1360,
          2.222154
        ],
        [
          1405,
          2.253036
        ],
        [
          1450,
          2.281718
        ],
        [
          1495,
          2.30824
        ]
      ]
    }
  ],
  "solubility": [
    {
      "temperature": 298,
      "fraction": 0.02493468,
      "mass": 72.269582,
      "residual": -1.6844747818822725e-11
    },
    {
      "temperature": 318,
      "fraction": 0.04879445,
      "mass": 144.971151,
      "residual": -4.440892098500626e-16
    },
    {
      "temperature": 338,
      "fraction": 0.090901,
      "mass": 282.581024,
      "residual": -6.661338147750939e-16
    },
    {
      "temperature": 358,
      "fraction": 0.16589001,
      "mass": 562.059677,
      "residual": -1.3458123504506148e-12
    }
  ],
  "market": {
    "history": [
      100,
      99.80178007,
      99.76337158,
      99.44960467,
      98.69602486,
      98.41945013,
      98.61633632,
      97.90506119,
      97.14743113,
      96.87396968,
      96.63308454,
      95.91198386,
      95.41515942,
      95.27356647,
      95.2623572,
      94.56997627,
      94.48384912,
      94.20094109,
      95.03480775,
      94.98873742,
      94.80664499,
      94.6151944,
      94.37362554,
      94.20194925,
      94.39428524,
      94.19851201,
      94.01004616,
      93.99025748,
      94.13259232,
      93.90587336,
      93.82383907,
      93.52160628,
      93.3084899,
      93.04587393,
      93.06522289,
      92.91655479,
      92.90742054,
      92.667644,
      92.65529822,
      92.55752736,
      92.39081988,
      92.04966699,
      91.52197773,
      91.35690325,
      91.16778107,
      90.87282986,
      90.73218697,
      90.57750784,
      90.3499816,
      90.27811562,
      90.24581001
    ],
    "events": [
      {
        "side": "SELL",
        "quantity": 64,
        "impact": 0.19822
      },
      {
        "side": "SELL",
        "quantity": 71,
        "impact": 0.240885
      },
      {
        "side": "SELL",
        "quantity": 21,
        "impact": 0.195773
      },
      {
        "side": "SELL",
        "quantity": 32,
        "impact": 0.032306
      }
    ],
    "fullReturn": -9.75419,
    "partialReturn": -1.959656
  }
} as const;
