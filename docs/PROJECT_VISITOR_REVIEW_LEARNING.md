# Independent visitor review: learning and document tools

Reviewed by the source-projects agent, separately from the implementation owner. I treated the rendered interface as a first visit: what Samuel built, why it helps, which action to take first and how the resulting state should be read. The pass threshold is 9/10. Grades assess explanation, useful interaction and responsive presentation, not research performance.

Browser: Edge; desktop 1466×854, phone 390×844 and 320×844, with actual viewport dimensions checked. Routes use the `view=demo` project entry on localhost:3000. Final compiled-page confirmation is recorded below when the frozen build is available. No personal CVs, learner data or external model services were used.

## Changed-state journeys

### STUDY-RL: curriculum and cliff learning

The default page opens the runnable cliff exercise. Its first action is concrete: train 100 episodes, save the run, switch the learning rule and compare greedy routes. Ordinary moves cost −1 and a cliff fall costs −100. The Q table, grid and summary actually change.

- Q-learning, seed 7, ε=0.10, α=0.50, 100 episodes: 3,390 learning updates, last-50 mean return −36.0, 50/50 training goals. Greedy evaluation reaches the goal in 13 moves with return −13 and no falls.
- SARSA with the same settings and 100 episodes: 3,860 updates, mean return −29.2, 50/50 training goals. Its greedy evaluation initially loops to the 200-move cap, return −200 and no falls. An initial visitor-review failure was the unexplained apparent contradiction. The owner repaired this with a visible explanation: exploratory training can reach the goal while the greedy test loops; train again, retest and compare equal episode counts. The repaired 390px state was directly verified. Another 100 SARSA episodes produces a 17-move route, but that is deliberately not treated as an equal-training algorithm win.
- The curriculum workspace clearly distinguishes saved September course-review results from browser training. At 320px, selecting Week 19 changed the question to direct preference objectives, the methods to DPO/IPO/KTO/ORPO/SimPO and the project to a preference-optimisation comparison. The selected module reports its own 25-page lecture and 16-test saved run; the syllabus remains a secondary action.

The grid intentionally pans inside its marked region on narrow screens. The failed greedy result is explained near the route, rather than hidden inside optional mathematics. No live reinforcement-learning run is represented as one of the saved coursework results.

### Language-model post-training: real answers, explicit toy updates

The recorded-answer inspector separates formatting from correct arithmetic. In the saved 32-example synthetic addition set, SFT produces the required format for 32/32 answers but exact correctness for only 19/32. For 0+8, the saved SFT answer 16 is visibly wrong; expected output is 8. The purpose is understandable before any equation is opened.

Adapter journey: one gradient step changes the prediction from `[2,1]` to `[2.1,0.9]` and squared-error loss from 1 to 0.81. Ten further animated steps finish at step 11, prediction `[2.998,0.002]`, loss 0.000003. A and B update while the base identity matrix stays frozen. These same completed values and readable matrices were verified at 390px.

Preference journey: ten animated updates change the chosen-policy probability from 0.75 to approximately 0.82 and pair loss from 0.455746 to 0.382407, while the reference remains 0.50. At 320px, starting another ten updates and immediately pausing leaves the count at 10; one manual step advances to 11 and policy probability approximately 0.83. The reference and toy-model limitation remain beside the controls. The graph changes with the actual numerical update; it is not an animation of the measured language-model run.

Both labs are useful teaching calculations. The interface states their small dimensions and separates them from the measured saved answers. Long equations pan within designated regions on phones.

### Sequential decisions: inspect why an arm was selected

Selected UCB1, started Watch 100 rounds and paused at round 33. The run showed reward 20 and estimate leader C; the explanation correctly picked C because its pre-reward upper bound 1.406 exceeded A 1.383 and B 1.336. Replay seed cleared the run. Switching to Thompson sampling and advancing 25 rounds produced reward 16 and a different explained decision: C had the largest sampled success rate, 0.654.

At 320px, the animated Thompson run paused at round 50. B was selected because its sampled rate 0.738 narrowly exceeded C 0.733, even though C led the empirical estimates. The nearby explanation makes that apparently surprising choice understandable. At 390px, one manual step advanced to round 51 and selected C; the sampled-rate card and reward changed. Pause, continue, manual step and replay are all real controls. The seed and generated-reward boundary are plainly stated.

### CV: change a sentence and inspect what changed

Opened Brief and changed the fictional sentence from Python/SQL feature pipelines to Python APIs with model monitoring. The live panel highlighted the matching words, listed new matches APIs and Model monitoring, and lost matches SQL and Data pipelines. Weighted coverage moved from 62% to 63%, while the matched count stayed 10/18. Run analysis saved the version and showed the previous/current comparison; it did not silently invent additional experience.

The same edit was tested at 390px and at 320px in Taiwan Mandarin. The English source sample stays English, while instructions, new/lost terms and save action are translated. Final copy removes the earlier generic evidence labels in favour of sentence checks, matching sentences and clarity. The final refreshed 320px screenshot shows readable highlighting and a reachable Run analysis action.

This demonstrates a local 18-term rule; it does not pretend to run the original external language-model/LaTeX workflow in the browser. The original workflow and local adaptation are separately explained. The editing score is explicitly document feedback.

### Course finder: a saved rank and an inspectable reason

Saved the default ranking, then unticked AI/ML. Machine Learning Fundamentals moved from #1 to #3 and 99.8 to 64.8 points; Data Structures & Algorithms moved #2→#1, Advanced Python #3→#2. The other three positions stayed fixed. Restore saved preferences returned every course to its earlier rank. Explain decomposes the restored 99.8 points into category 35, level 25, duration 15, budget 15 and mock-rating 9.8.

The changed rank comparison was directly verified at both 390px and 320px. Preferences and movement cards wrap inside the phone window. The original hard-filter/random-rank baseline remains distinct from the browser's illustrative weighted rubric. Six example rows, mock ratings and the lack of outcome data are clear; no course-quality claim is inferred from the score.

## Grades after the blocker repair

| Experience | Desktop | 390px | 320px | Visitor can explain |
| --- | --- | --- | --- | --- |
| STUDY-RL curriculum | 9.2 | 9.1 | 9.1 | I wrote a curriculum connecting decision theory to runnable exercises; choose a week to inspect its question and project. |
| Cliff learning | 9.3 | 9.2 | 9.1 | Train a real small agent, then test its learned route without exploration; a training success does not guarantee a successful greedy route. |
| Adapter / preference labs | 9.3 | 9.2 | 9.1 | Inspect real saved answer failures, then see what an adapter or frozen-reference preference update actually changes in a small teaching model. |
| Bandit decisions | 9.3 | 9.2 | 9.1 | Watch a learning policy try options, pause and read the numerical reason for its last choice. |
| CV matching | 9.3 | 9.2 | 9.1 | Edit a truthful sample sentence, inspect gained/lost requirement matches and save a comparison. |
| Course ranking | 9.3 | 9.2 | 9.1 | Change an interest, compare rank movement and inspect the points behind each course. |

## Limits and release follow-through

The first cliff review scored below threshold until the greedy-loop explanation was added. This document records the repaired result rather than averaging away that failure.

Development hot reload temporarily dropped a lazy stylesheet once and reset an in-memory post-training journey during another agent's copy edit. Fresh page loads restored the stylesheet and retained the full uninterrupted numerical journey. These were development-session observations, not persistent product defects.

The frozen production checkpoint `148f7e5` on localhost:3108 passed the final desktop and 320px confirmation. Desktop Q-learning reached the 13-move greedy route; the adapter completed ten updates with prediction `[2.996,0.004]`, loss 0.000020 and native chart/matrix styling. At 320px, a reset adapter completed the same uninterrupted ten-step run. DPO completed ten updates with policy probability approximately 0.82, reference 0.50 and loss 0.382407; explicit pause retained ten updates. The repaired SARSA loop explanation appeared beside the failed route. UCB1 advanced 25 rounds and explained Arm A's upper bound 1.465 against C 1.464. CV saved the 62%→63% comparison with final sentence-check labels. Course movement repeated #1→#3/#2→#1/#3→#2. All lazy demo styles remained loaded; no automatic remount or state loss reproduced. The first-visit phone guide was dismissed normally before the remaining controls were used. Viewport reset to 1466×854.

The review did not assess pedagogical completion across all 25 notebooks or measure real learner outcomes. It checked the specific first-visit journeys above and their visible changed states.
