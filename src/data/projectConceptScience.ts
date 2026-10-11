export type ScienceConcept = { title: string; steps: readonly { name: string; caption: string }[]; note?: string };

export const projectConceptScience: Readonly<Record<string, ScienceConcept>> = {
  "study-rl": {
    "title": "Learn from a costly choice",
    "steps": [
      {
        "name": "Start at the cliff",
        "caption": "An agent chooses a move, observes a reward and updates its estimate."
      },
      {
        "name": "Try the risky move",
        "caption": "Moving right from the start hits the cliff: reward −100 and a return to the start."
      },
      {
        "name": "Update the action value",
        "caption": "With learning rate 0.1 and initial values zero, this one Q-learning update gives −10."
      },
      {
        "name": "Compare a safer route",
        "caption": "The displayed detour avoids the cliff in nine moves. Learning a policy still needs repeated trials."
      }
    ],
    "note": "A smaller teaching grid, using the same update rule as my reinforcement-learning code."
  },
  "sequential-decisions-lab": {
    "title": "Choose, observe, revise",
    "steps": [
      {
        "name": "Observe three options",
        "caption": "Each option starts with two observed rewards. The means alone favour B."
      },
      {
        "name": "Allow for uncertainty",
        "caption": "UCB1 adds an exploration bonus to each observed mean."
      },
      {
        "name": "Choose the upper bound",
        "caption": "B has the largest upper-bound score, so this round tries B."
      },
      {
        "name": "Update after a miss",
        "caption": "B returns zero. Its mean becomes 2/3; on the next round A has the larger upper bound."
      }
    ],
    "note": "A six-observation binary-reward example; these are calculated choices, not measured project performance."
  },
  "microrobot-vision": {
    "title": "One microscope image, two questions",
    "steps": [
      {
        "name": "Read the shared image",
        "caption": "I used the same type of microscope image to estimate tilt and depth."
      },
      {
        "name": "Estimate orientation",
        "caption": "This saved pose example has label and prediction 27: 60° pitch, 0° roll."
      },
      {
        "name": "Inspect the depth response",
        "caption": "The depth model emphasises different regions. The recorded target is 0.36 on a normalised scale."
      },
      {
        "name": "Compare model size",
        "caption": "MobileNetV3 uses 7.0% of the depth-model parameters, with 0.0069 more RMSE than ResNet34."
      }
    ],
    "note": "Saved study images and results. Response-map colour is independently scaled; it is not confidence."
  },
  "trustworthy-mri-reconstruction": {
    "title": "Recover structure from fewer measurements",
    "steps": [
      {
        "name": "Start with the reference",
        "caption": "The reference shows the heart when all measurements are available."
      },
      {
        "name": "Keep one in four lines",
        "caption": "Keeping about one in four measurement lines leaves visible aliasing in this saved slice."
      },
      {
        "name": "Recover the heart",
        "caption": "My saved reconstruction improves this example from 27.0 to 29.6 dB PSNR."
      },
      {
        "name": "Inspect what is still wrong",
        "caption": "Both error maps use 0–0.15 intensity units. Bright tissue boundaries still need attention."
      }
    ],
    "note": "Crops of my unchanged report figure; example-slice values, not new browser inference."
  },
  "neural-cfd-surrogates": {
    "title": "Predict the changing wake",
    "steps": [
      {
        "name": "Start from a flow field",
        "caption": "The graph network stores velocity and pressure at nodes of a fixed mesh."
      },
      {
        "name": "Predict the next fields",
        "caption": "The saved prediction changes the transverse-velocity pattern behind the cylinder."
      },
      {
        "name": "Feed predictions forward",
        "caption": "Each predicted field becomes an input for the next prediction. Errors can travel with it."
      },
      {
        "name": "Compare the final wake",
        "caption": "Compare saved frames 1 and 20 within the same sequence. The wake changes as the rollout continues."
      }
    ],
    "note": "Actual saved predictions. Each frame has its own colour scaling; this is a time comparison, not an error score."
  },
  "air-quality-sensor-optimisation": {
    "title": "What if a sensor goes offline?",
    "steps": [
      {
        "name": "Use both signals",
        "caption": "The balanced design uses benzene and the CO sensor: cross-validation RMSE 0.8286."
      },
      {
        "name": "Lose the CO sensor",
        "caption": "Without the CO signal, only the benzene-only design remains: RMSE 0.9211."
      },
      {
        "name": "Restore the signal",
        "caption": "Restoring CO makes the balanced design available again."
      },
      {
        "name": "Lose the shared input",
        "caption": "Both designs need benzene. If it is absent, I show no available prediction rather than invent a score."
      }
    ],
    "note": "Coursework validation scores; sensor prices and the outage are a hypothetical planning example."
  },
  "cost-sensitive-cyber-detection": {
    "title": "The same detector, a different day",
    "steps": [
      {
        "name": "Start with frequent attacks",
        "caption": "In 2,000 fictional flows with 50% attacks, threshold 0.20 produces 1,250 alerts."
      },
      {
        "name": "Make attacks rare",
        "caption": "At 1% attacks, the same threshold produces 514 alerts, but only 3.9% are real attacks."
      },
      {
        "name": "Raise the threshold",
        "caption": "A higher threshold reduces the review queue and can miss more attacks."
      },
      {
        "name": "Inspect the missed attacks",
        "caption": "At threshold 0.99, there are 25 alerts and six missed attacks. Fewer alerts alone is not success."
      }
    ],
    "note": "Calculated teaching rates, not measured detection performance from my contaminated original split."
  },
  "regularisation-lab": {
    "title": "Remove a noisy input",
    "steps": [
      {
        "name": "Give every input a weight",
        "caption": "A prediction adds each input multiplied by its coefficient. The noise coefficient begins at −0.19."
      },
      {
        "name": "Shrink all weights",
        "caption": "Ridge divides each coefficient by 1 + λ. Every input still contributes."
      },
      {
        "name": "Remove weak inputs",
        "caption": "With λ = 0.45, LASSO sets the noise coefficient to zero."
      },
      {
        "name": "Change the noise",
        "caption": "Change the noise input from zero to three. The LASSO prediction stays 0.830 because that input is unused."
      }
    ],
    "note": "Exact shrinkage on an orthonormal teaching design; separate from my fitted air-quality models."
  },
  "safety-critical-ai": {
    "title": "Keep the interval. Move the cases.",
    "steps": [
      {
        "name": "Calibrate an interval",
        "caption": "A radius of 0.90 contains 36 of these 40 synthetic residuals."
      },
      {
        "name": "Add systematic error",
        "caption": "The new population shifts by +0.50, while the calibrated interval stays fixed."
      },
      {
        "name": "Count what falls outside",
        "caption": "At shift +1.00, only 18 of 40 outcomes are covered by the same interval."
      },
      {
        "name": "Shift further",
        "caption": "At shift +2.00, none are covered. Calibration does not guarantee coverage after population change."
      }
    ],
    "note": "A generated residual experiment; my saved coursework coverage results are a separate evaluation."
  },
  "safe-learning-to-defer": {
    "title": "Uncertain claims need a review queue",
    "steps": [
      {
        "name": "Score 200 example claims",
        "caption": "The model supplies predictions and uncertainty; it has not decided which claims to automate."
      },
      {
        "name": "Apply the OR gate",
        "caption": "High entropy OR low calibrated confidence sends 72 claims to review; 128 remain automated."
      },
      {
        "name": "Review twenty cases",
        "caption": "Twenty reviews leave 52 pending. Unreviewed claims stay pending; they do not return to automation."
      },
      {
        "name": "Add ten review slots",
        "caption": "Thirty completed reviews leave 42 pending. Capacity changes the queue, not the rejection rule."
      }
    ],
    "note": "The same generated 200-claim baseline as the live demo; no real insurance decisions are made."
  },
  "causal-ope-lab": {
    "title": "Why the pooled answer can reverse",
    "steps": [
      {
        "name": "Pool both groups",
        "caption": "The pooled comparison says treatment is worse by 32 percentage points."
      },
      {
        "name": "Inspect who was treated",
        "caption": "85% of treated people are less experienced; only 15% of the controls are. The groups differ before treatment."
      },
      {
        "name": "Compare within groups",
        "caption": "Within each experience group, the constructed treatment effect is +10 percentage points."
      },
      {
        "name": "Use equal group weights",
        "caption": "Equal weighting recovers +10 points. The graph in the full demo states the assumptions required."
      }
    ],
    "note": "A constructed 200-person cohort illustrating confounding, not a measured treatment effect."
  },
  "ai-venture-reasoning": {
    "title": "Can the cash reach the pilot?",
    "steps": [
      {
        "name": "Start with the ask",
        "caption": "The fictional plan raises £1.2 million for an operational pilot."
      },
      {
        "name": "Protect the reserve",
        "caption": "A 15% reserve protects £180,000, leaving £1.02 million available."
      },
      {
        "name": "Fund seven months",
        "caption": "A £120,000 pilot cost and seven £82,000 monthly burns leave £326,000."
      },
      {
        "name": "Stress the burn",
        "caption": "Increasing monthly burn by 60% leaves −£18,400 at month seven. The protected reserve is not spent."
      }
    ],
    "note": "Deterministic fictional budget arithmetic; it does not establish market demand or financing prospects."
  },
  "insurance-lead-matching": {
    "title": "Complete the checks before broker review",
    "steps": [
      {
        "name": "Inspect the candidate",
        "caption": "This candidate starts with only trading assessed. Unassessed checks are not zero scores."
      },
      {
        "name": "Check lead history",
        "caption": "Adding example lead history completes a second, independent check."
      },
      {
        "name": "Compare policy wording",
        "caption": "The wording check completes three assessments, but authority is still unverified."
      },
      {
        "name": "Confirm authority",
        "caption": "Verified authority permits broker review. The checks do not automatically choose an insurer."
      }
    ],
    "note": "Market 06 uses synthetic descriptors 69, 64 and 72; no composite recommendation is calculated."
  },
  "cv-keyword-automator": {
    "title": "Match the job to work I can describe",
    "steps": [
      {
        "name": "Read the requirement",
        "caption": "The example job asks for Python, SQL and cloud experience."
      },
      {
        "name": "Find the matching sentence",
        "caption": "The example sentence describes Python and SQL pipelines: two of the three terms match."
      },
      {
        "name": "Keep the gap visible",
        "caption": "Cloud remains a question. A keyword cannot create experience that was never described."
      },
      {
        "name": "Prepare a truthful draft",
        "caption": "Use the matching work in the draft and ask for a real example before adding the missing term."
      }
    ],
    "note": "A literal three-term browser example. My native workflow extracts keywords and prepares LaTeX; this scene makes no model call."
  },
  "course-recommender-audit": {
    "title": "A ranking needs a reason",
    "steps": [
      {
        "name": "Start with six examples",
        "caption": "The prototype catalog contains six mock courses, not a live course directory."
      },
      {
        "name": "Filter by interest and level",
        "caption": "Programming or AI interests at intermediate level leave two eligible examples."
      },
      {
        "name": "Inspect the prototype order",
        "caption": "The source frontend assigns random scores after filtering. Order alone does not explain fit."
      },
      {
        "name": "Declare the ranking rule",
        "caption": "My browser rubric declares its weights: the two example scores are 99.8 and 91.9."
      }
    ],
    "note": "The weighted teaching rubric is a browser addition, separate from the original random-order prototype."
  }
};
