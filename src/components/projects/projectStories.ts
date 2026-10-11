import type { Project, ProjectDemoId } from "@/data/projects";

export type ProjectStory = {
  problem: string;
  contribution: string;
  pipeline: string;
  walkthrough: string;
};

// Editorial records for every executable chapter. They stay separate from the
// catalogue card so the archive can explain the human problem before launching
// a dense workbench, while detailed method explanations remain reusable.
export const projectStories: Record<ProjectDemoId, ProjectStory> = {
  "ultra-convert": {
  "problem": "Converting a photo, a recording and a document usually sends me through three different apps. I wanted one place to review the whole batch before creating the new files.",
  "contribution": "I built a Mac app that turns a Finder selection into one conversion queue. It recognises each file category, explains the available output formats and shows where the new files will be saved. Try the example batch to see a photo, recording and document prepared together.",
  "pipeline": "Finder selection → recognise file categories → choose formats → review destinations → create separate converted files",
  "walkthrough": "Change the puzzle rule, save it and drop a new example file into the watched folder. Reorder Convert and Rename to see why action order matters. Try Finder actions, or convert and download an image in the image tab."
},
  "videomate": {
    problem: "A video can look like a normal file and still stop partway through. I wanted to find out what was readable, recover it where possible and keep uncertain results out of a finished collection.",
    contribution: "I built VideoMate to answer three questions about a video collection: what still plays, what can be recovered, and what should go into a new collection. It creates checked copies and leaves originals in place. The walkthrough lets you compare those choices on five example files.",
    pipeline: "local selection → full software decode → copy, remux or qualified encode → independent output verification → published result or review",
    walkthrough: "Select Broken MP4 index and play the repair. Step through inspection, the candidate and verification: the new collection stays empty until the copy passes. Try damaged frames with remux, or adjust the shortening limit for an incomplete recording.",
  },
  "insurance-matching": {
    problem: "Brokers must match a risk to suitable markets using placement history, market appetite and policy wording that can be incomplete or out of date.",
    contribution: "I studied insurer selection for my MSc thesis and built a broker-facing prototype. It brings together a ranking learned from past placements, each insurer’s lead history, and relevant policy wording. I keep the three views separate so a broker can understand why an insurer appears and decide what to investigate next.",
    pipeline: "risk and candidate markets → ranking, history and wording analysis → provenance, confidence and abstention → broker review",
    walkthrough: "Select a fictional market, compare its three signals, then raise the minimum-information requirement to see when the system asks for more review.",
  },
  "cv-keywords": {
    problem: "Adapting a CV to each role takes time, and important experience can be overlooked when the job description uses different language.",
    contribution: "I built a Python workflow that extracts job requirements, selects a pre-authored CV template and compiles a PDF with LaTeX. The browser demo uses fictional text to show which suggested changes the sample CV supports.",
    pipeline: "job description → role language → template and relevant experience → reviewed wording → application document",
    walkthrough: "Edit an example CV sentence, analyse the job description, and review a missing requirement before accepting a factual rewrite.",
  },
  "finance": {
    problem: "Different bank formats, overlapping exports and transfers between accounts make it difficult to see what was actually earned or spent.",
    contribution: "I built provider parsers, transaction deduplication, balance checks and analytical views using FastAPI, SQLite and React. The demo uses a fictional ledger and lets visitors examine how repeated imports and changed transaction details are handled.",
    pipeline: "statements → normalisation, duplicate and balance checks → recurring, transfer and anomaly analysis → spending and investment views",
    walkthrough: "Import an example statement twice to check that repeated rows are recognised, then explore recurring payments, transfers and the investment view.",
  },
  "scheduling": {
    problem: "A valid meeting time must work across time zones, busy calendars and allocation rules, even when two visitors try to book it together.",
    contribution: "I implemented individual, weighted round-robin, collective and first-available scheduling, with local working hours, buffers, UTC reservations and final conflict checks. The product also connects calendar events, email and booking-management links.",
    pipeline: "working hours and busy calendars → host allocation → UTC reservation with ten-minute expiry → database conflict check → calendar, email and ICS",
    walkthrough: "Choose a meeting time and guest time zone, answer the booking questions and confirm. Download the calendar invitation, then reschedule or cancel. Try a competing booking to see the final conflict check protect the time.",
  },
  "italian-learning": {
    problem: "Daily lessons, vocabulary review and writing practice become hard to sustain when they are scattered across separate materials.",
    contribution: "I organised 56 daily agendas and 28 lesson hubs, built adaptive practice and spaced repetition, and added progress tracking across five language-skill areas. Local caching and revision checks preserve learner work when synchronisation conflicts occur.",
    pipeline: "daily plan → adaptive practice and four-way recall → mastery and five language-skill evidence lanes → revision-safe synchronisation",
    walkthrough: "Answer a practice question, inspect the progress update, grade a vocabulary card and explore how the app recovers a conflicting saved revision.",
  },
  "course-recommender": {
    problem: "A course catalogue can offer many options without making it clear which ones suit a learner’s interests and constraints.",
    contribution: "I built a four-step course-discovery prototype with a React interface and supporting API services. Its initial ranking was random; the browser companion adds an illustrative weighted comparison so visitors can examine how preference choices affect the order.",
    pipeline: "learner preferences → browser filters and random ordering → separate API contract check → illustrative weighted comparison",
    walkthrough: "Choose preferences, compare two random orderings, then change one weight in the illustrative ranking and inspect which courses move.",
  },
  "rl-atlas": {
    problem: "An agent must learn from the consequences of its actions while balancing uncertain rewards, delayed outcomes and limited feedback.",
    contribution: "I wrote 25 modules that turn reinforcement-learning equations into experiments you can run. The browser lets you train a cliff-walking agent, compare its route with another algorithm, and explore how fine-tuning changes a small language model’s answers.",
    pipeline: "bandits and value updates → policy and deep RL → offline and model-based learning → language-model post-training → applied decision problems",
    walkthrough: "Train 100 CliffWalking episodes, inspect a value update and test the learned route. Then compare recorded answers before and after fine-tuning and try the LoRA and DPO controls.",
  },
  "bandits": {
    problem: "Trying an unfamiliar option may reveal a better reward, but spending too long exploring can sacrifice good choices already known.",
    contribution: "I built a browser companion to the first STUDY-RL module with epsilon-greedy, UCB1 and Thompson Sampling, seeded rewards and twelve paired runs for comparison.",
    pipeline: "available actions → policy choice → reward → updated estimates → regret and repeated-run comparison",
    walkthrough: "Step through the first observations, run 100 rounds and compare the policies. Inspect both expected reward gaps and the noisier realised reward trace.",
  },
  "microrobot-vision": {
    problem: "A tiny robot is hard to guide if I cannot tell how it is tilted or how far it sits below the microscope. I wanted an image model to estimate both from the same type of picture.",
    contribution: "I trained image models to read a microrobot’s orientation and depth from a grayscale microscope image. My coursework compared a network I designed with four adapted image models across 2,000 images and 40 orientations. Here you can inspect actual microscope images, see where the models focused, and compare their recorded errors.",
    pipeline: "orientation-corrected image → grayscale backbone → pose or depth head → checkpoint, error and split checks",
    walkthrough: "Start with the microscope image. Compare the two recorded attention maps to see where each model looked, then switch between pose and depth results. A good orientation score and a small depth error answer different parts of the tracking problem.",
  },
  "mri-trust": {
    problem: "Taking fewer MRI measurements could shorten a scan, but it leaves gaps in the image. I wanted to recover the heart’s structure while identifying places where the model might be wrong.",
    contribution: "I built a model that fills in a heart MRI when only part of its measurements are available. I kept the reconstruction tied to the measurements actually taken, then tested image quality, uncertainty and how well the heart could still be outlined. The saved images in the demo show what that looked like.",
    pipeline: "undersampled k-space → zero-filled image → residual U-Net → three soft data-consistency steps → uncertainty and segmentation checks",
    walkthrough: "Compare the fully measured image, the incomplete image and my reconstruction in the first saved figure. Look at the heart’s edges. Then change the measurement budget in the browser experiment to see why a shorter scan makes reconstruction harder.",
  },
  "cfd-surrogates": {
    problem: "Calculating a detailed fluid simulation takes time. I wanted to see how well a trained model could predict the next state, and where its predictions would start to fail.",
    contribution: "I trained three models to predict the next flow field around a cylinder. They learn the same physical problem in different ways: one works with waves, one with a mesh, and one with a grid of pixels. Here you can play their saved predictions and see how the wake behind the cylinder changes.",
    pipeline: "previous mesh or grid flow fields → spectral, graph or convolutional model → future velocity and pressure → single-step and rollout evaluation",
    walkthrough: "Press Play flow and follow the wake behind the cylinder. Switch between the saved model outputs to see the flows each network predicted. Then open How the models work to see why working with waves, a mesh or pixels changes what each network learns.",
  },
  "reliability": {
    problem: "A confident prediction can still be wrong, and a model that works on familiar data may become unreliable as the inputs change.",
    contribution: "I studied bootstrap and Bayesian uncertainty, temperature scaling and split-conformal prediction through computational exercises. The work records a small ECE improvement and 95.75% empirical coverage under exchangeability, alongside cases where calibration or shift worsens other measures.",
    pipeline: "model scores and labels → uncertainty and calibration → prediction sets → coverage and distribution-shift checks",
    walkthrough: "Change calibration and shift settings, compare the confidence curve and prediction-set size, then inspect how coverage changes when the calibration data no longer represent the new inputs.",
  },
  "air-quality": {
    problem: "Using every available sensor can be expensive, while a small or opaque model may miss important patterns in pollution measurements.",
    contribution: "I analysed 7,674 ambient observations, fitted training-only imputation and scaling, and compared OLS, Ridge, LASSO and two kernel models. A later exercise connects selected signals to assumed hardware prices; the random split does not establish future-time or new-site performance.",
    pipeline: "sensor and environmental observations → missing-value handling and scaling → five regression models → error and sensor-cost comparison",
    walkthrough: "Compare the five recorded models, inspect which measurements are missing, then adjust the sensor budget and interpretability preference in the illustrative decision view.",
  },
  "cyber-threshold": {
    problem: "A detection threshold controls which network flows trigger attention, balancing missed threats against the cost of investigating benign traffic.",
    contribution: "I compared logistic and kernel classifiers on 10,000 labelled network-flow rows. Later review found repeated rows across the split, preprocessing leakage and test-selected thresholds, so the historical curves are useful for learning the workflow but do not establish held-out detection performance.",
    pipeline: "network-flow features → classifier score → alert threshold → false alarms, missed attacks and expected cost",
    walkthrough: "Change the relative cost of a missed attack and a false alarm, observe how the preferred threshold moves, and read why these historical results require a cleaner evaluation.",
  },
  "regularisation": {
    problem: "Correlated or weak predictors can make a regression model unstable and encourage it to fit noise.",
    contribution: "I compared regularised regressions in the air-quality study and built a browser companion with an orthonormal synthetic example, where the shrinkage calculations can be followed exactly.",
    pipeline: "illustrative standardised coefficients → chosen penalty strength → shrinkage or soft threshold → coefficient paths and active features",
    walkthrough: "Raise the penalty until a LASSO coefficient reaches zero, compare it with Ridge, then open the air-quality project to see the recorded model comparison.",
  },
  "deferral-risk": {
    problem: "Automating too many uncertain cases can leave costly errors unreviewed, while sending everything to a person overwhelms the review process.",
    contribution: "I built a fraud-classification study that lets a model pass difficult cases to a human reviewer. I compared always deciding automatically with handing over the least reliable predictions. The useful question is how much review is needed to reduce costly mistakes, rather than simply making the accuracy number bigger.",
    pipeline: "claim features → calibrated score and uncertainty → deferral rule → automated decisions or human review → coverage and tail risk",
    walkthrough: "Increase the number of cases sent for review. Watch automatic coverage fall and the mistakes among accepted predictions change. Then increase the cost of a missed fraud to see why the same review policy may no longer make sense.",
  },
  "causal-ope": {
    problem: "Observed outcomes mix the effects of decisions with the circumstances that caused those decisions to be made.",
    contribution: "I built a synthetic causal example and adapted the STUDY-RL off-policy estimators into an interactive lab. It compares IPS, SNIPS, Direct, doubly robust and SWITCH-DR estimates while making overlap and sample-weight concentration visible.",
    pipeline: "observations or logged context, action, reward and propensity → adjustment or ridge reward model → effect and value estimates → overlap and effective sample size",
    walkthrough: "Explore a confounder and a collider in the causal graph, then switch to policy evaluation and reduce overlap to see the estimates become less stable.",
  },
  "innovation-models": {
    problem: "New ventures need resources and freedom to explore, but they also need a workable relationship with the existing organisation.",
    contribution: "I compared the Opportunist, Enabler, Advocate and Producer models in an Imperial reflection, using my Pfizer automation work to question what the two-axis framework leaves out. I built this matrix so you can see how responsibility and funding change the way a new idea is supported.",
    pipeline: "ownership and resource authority → organisational model → portfolio allocation, concentration and effective model count → transition questions",
    walkthrough: "Give an idea a dedicated budget, then give it a named owner. Watch the selected model change from Opportunist to Enabler to Producer. These are different ways to support an idea, not a league table of good and bad companies.",
  },
  "venture-reasoning": {
    problem: "A promising pitch still needs credible demand, a realistic route to customers and enough funding to reach the next useful milestone.",
    contribution: "I wrote and critiqued venture proposals, then built this calculator to test their assumptions. It connects the customers a business can realistically reach with its sales, monthly spending and funding needs.",
    pipeline: "potential customers → expected sales → monthly costs → available funding → months to the next milestone",
    walkthrough: "Strengthen a traction claim, lower the sales-conversion assumption and change the funding ask to see whether the next milestone remains achievable.",
  },
  "thermodynamics": {
    problem: "Predicting pressure and phase behaviour requires a model that connects temperature, density and composition with molecular size and attraction.",
    contribution: "I used Julia to study how molecular size and attraction change a fluid’s pressure. This browser exposes that part of the model with two example fluids: change their interaction and watch the pressure respond.",
    pipeline: "molecular parameters and state → effective diameters and Lorentz–Berthelot mixing → hard-chain and dispersion Helmholtz terms → compressibility and pressure",
    walkthrough: "Change density and mixture interaction strength, inspect the pressure curve, then follow the equations to see which energy contribution changes.",
  },
  "solubility-workflow": {
    problem: "Solubility depends on both the solid’s fusion thermodynamics and interactions in the liquid, and model outputs must be converted into laboratory reporting units.",
    contribution: "I built Julia solid–liquid equilibrium workflows using fusion-property and liquid-phase models in Clapeyron. The public companion uses invented compounds to demonstrate a log-space solver, mole-to-mass conversion and separate calibration and holdout rows.",
    pipeline: "fusion properties, liquid interactions and temperature → equilibrium concentration → reporting-unit conversion → calibration and holdout comparison",
    walkthrough: "Change temperature, inspect the solver residual, switch between mole fraction and mg per gram of solvent, then fit the fictional calibration rows and compare the holdout.",
  },
  "molecular-recognition": {
    problem: "Macrocyclic molecules can adopt many conformations whose spectral lines overlap, making a single peak insufficient to identify a structure.",
    contribution: "I analysed rotational spectra of Exaltenone and Muscone at King’s College London, comparing predicted molecular shapes with measured lines. I built this browser explanation to show why several matching lines are needed before I can assign a shape to a spectrum.",
    pipeline: "conformer search → predicted spectroscopic parameters → CP-FTMW measurements → multiple line matches → candidate structure",
    walkthrough: "Compare a candidate with a decoy, offset the synthetic spectrum and inspect several matched lines. Then rotate the conformer view and test how matching order changes coverage.",
  },
  "spectroscopy": {
    problem: "Inspecting narrow frequency windows and producing consistent plots can take repeated manual work in a general-purpose plotting tool.",
    contribution: "I built a MATLAB App Designer utility with titles, axis labels, colours, exact frequency panning and high-resolution export. The browser reproduces the plotting controls using a generated trace.",
    pipeline: "frequency and intensity columns → labels and plot settings → selected frequency window → exported figure",
    walkthrough: "Centre the trace on a frequency, pan by 0.1 and 100 MHz, change the visible range and inspect the export dimensions.",
  },
  "dl-environment": {
    problem: "Operating systems, processor architectures and accelerator drivers require different installation routes, and a completed install may still lack usable GPU support.",
    contribution: "I built a Bash installer for a Python 3.13 Conda environment, scientific packages, PyTorch, TensorFlow and the Hugging Face CLI. The browser planner explains those branches and lets visitors simulate failures without installing anything.",
    pipeline: "host and accelerator → platform and CUDA/MPS route → 19 core, four framework and one CLI target → fallbacks → import and device checks",
    walkthrough: "Choose an Apple Silicon or CUDA example, simulate a framework failure and compare the resulting package and verification route.",
  },
  "home-lab-topology": {
    problem: "Applications depend on networks, databases and scheduled jobs; a failure can affect several services and make recovery difficult.",
    contribution: "I built my home lab to host applications and automate recurring work. This small browser model lets you follow a request from scheduler to API to database and see why a failure in one service affects another.",
    pipeline: "Compose services, networks and mounts → declared dependency paths → simulated failure → backup capacity → recovery and health-check gaps",
    walkthrough: "Trace the scheduler-to-database connection, fail the database and inspect the affected paths, then change backup size and retention to estimate storage.",
  },
  "stock-market-engine": {
    problem: "Buy/sell direction, trade size and random impact can combine to produce price paths that are difficult to understand from a formula alone.",
    contribution: "I wrote a Julia single-stock simulation with sentiment-biased events and random, quantity-scaled price impact. The browser adds seeded replay and compares the original partial-day statistics with a corrected full-day window; it is a toy model rather than a market forecast.",
    pipeline: "sentiment and five traders × ten loops → quantity-scaled random price impact → 50-event ledger → original and full-day statistics",
    walkthrough: "Run a seeded day, change sentiment or the price-floor scenario, then compare the event trace and the two daily-statistic windows.",
  },
  "chemistry-coding": {
    problem: "Ideas such as thermal sampling, polymer shape and molecular motion become clearer when their update rules and numerical consequences can be explored.",
    contribution: "I completed and extended scientific-computing course exercises, then added Julia and React experiments. The browser combines seeded Lennard-Jones sampling, three polymer models, a four-particle velocity-Verlet trajectory and recorded basis-set and cation–π calculations.",
    pipeline: "molecular model and parameters → sampling, integration or energy calculation → configurations and readouts → physical interpretation",
    walkthrough: "Run the Metropolis sampler, compare polymer shapes, step through velocity Verlet and inspect energy drift, then calculate a basis-set or cation–π energy difference.",
  },
};

export const projectCaseStudies: Record<string, ProjectStory> = {

  "coverd-ai": {
    problem: "Application evidence and interview context arrive in separate systems, making a shortlist difficult to explain.",
    contribution: "I founded COVERD and led work on application review and company-aware voice interviews within recruiters’ existing applicant tracking systems.",
    pipeline: "ATS applications → specialist evidence review → voice enrichment → reasoned shortlist → recruiter decision",
    walkthrough: "Open the COVERD product file and trace one application through evidence review, voice enrichment and the human decision boundary.",
  },
  "gromacs-hpc": {
    problem: "Running GPU-assisted molecular simulation on a Windows workstation requires the Linux, driver and container layers to work together.",
    contribution: "I configured WSL 2, CUDA and Docker and completed a containerised GROMACS topology-preparation step. This work covers environment setup and preprocessing, not a full molecular-dynamics run.",
    pipeline: "WSL 2 and GPU configuration → container execution → GROMACS topology preparation",
    walkthrough: "Read how the environment layers fit together and what the completed topology-preparation step produces.",
  },
  "covid-decision-support": {
    problem: "Rapidly changing public epidemiological information needed to support operational decisions.",
    contribution: "I built public-data decision support and workflow automation during COVID-19 emergency operations in national service.",
    pipeline: "public epidemiological data → analysis and workflow support → human operational review",
    walkthrough: "Read the public account of the analysis and operational contribution.",
  },
};

export function getProjectStory(project: Project) {
  return project.demo ? projectStories[project.demo] : projectCaseStudies[project.slug] ?? null;
}
