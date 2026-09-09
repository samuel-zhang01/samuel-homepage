"use client";

import { ProjectCopy } from "./ProjectTranslationBoundary";
import { cliffLearningLabCopy } from "./copy/cliffLearningLabCopy";

import { useState } from "react";
import ClassicSelect from "../ClassicSelect";
import { createCliffAgent, trainCliff, evaluateCliff, greedyAction, type CliffSettings } from "@/lib/cliffLearning";
import { MathEquation } from "./MathEquation";
import styles from "./CliffLearningLab.module.css";

const defaults: CliffSettings = { method: "q-learning", alpha: .5, epsilon: .1, seed: 7 };
const arrows = ["↑", "→", "↓", "←"];
const actionTex = [String.raw`\uparrow`, String.raw`\rightarrow`, String.raw`\downarrow`, String.raw`\leftarrow`];

export function CliffLearningLab() {
  const [settings, setSettings] = useState(defaults);
  const [agent, setAgent] = useState(() => createCliffAgent(defaults));
  const [inspected, setInspected] = useState(36);
  const [view, setView] = useState<"training" | "policy">("training");
  const evaluation = evaluateCliff(agent);
  const recent = agent.history.slice(-50);
  const average = recent.length ? recent.reduce((sum, item) => sum + item.reward, 0) / recent.length : null;
  const path = new Set(evaluation.path);
  function configure(change: Partial<CliffSettings>) {
    const next = { ...settings, ...change }; setSettings(next); setAgent(createCliffAgent(next));
  }
  return <ProjectCopy copy={cliffLearningLabCopy}><section className={styles.lab} aria-label="Train a reinforcement-learning agent">
    <header><span>Week 04 / learning in your browser</span><h3>Learn the route above the cliff.</h3><p>Every move updates a Q table. Train Q-learning or SARSA, inspect a state, then test the learned policy with exploration switched off.</p></header>
    <div className={styles.body}>
      <div className={styles.controls}>
        <label>Update rule<ClassicSelect value={settings.method} onChange={(e) => configure({ method: e.target.value as CliffSettings["method"] })}><option value="q-learning">Q-learning · greedy next value</option><option value="sarsa">SARSA · sampled next action</option></ClassicSelect></label>
        <label><span>Exploration <MathEquation tex={String.raw`\varepsilon = ${settings.epsilon.toFixed(2)}`} display={false} /></span><input type="range" min="0" max=".5" step=".05" value={settings.epsilon} onChange={(e) => configure({ epsilon: Number(e.target.value) })} /></label>
        <label><span>Learning rate <MathEquation tex={String.raw`\alpha = ${settings.alpha.toFixed(2)}`} display={false} /></span><input type="range" min=".1" max="1" step=".1" value={settings.alpha} onChange={(e) => configure({ alpha: Number(e.target.value) })} /></label>
        <label>Repeatable seed<ClassicSelect value={String(settings.seed)} onChange={(e) => configure({ seed: Number(e.target.value) })}>{[1, 7, 42].map((seed) => <option key={seed} value={seed}>{seed}</option>)}</ClassicSelect></label>
      </div>
      <p className={styles.hint}>Changing a training setting starts a fresh run. Try 100 episodes, inspect the return and test the route; compare the same seed with SARSA.</p>
      <div className={styles.actions}><button type="button" onClick={() => setAgent((current) => trainCliff(current, settings, 1, "steps"))}>Take one learning step</button><button type="button" disabled={agent.episode >= 2000} onClick={() => setAgent((current) => trainCliff(current, settings, Math.min(100, 2000 - current.episode), "episodes"))}>Train 100 episodes</button><button type="button" onClick={() => setAgent(createCliffAgent(settings))}>Reset run</button></div>
      <div className={styles.readouts} aria-live="polite"><div><span>Completed episodes</span><strong>{agent.episode}</strong></div><div><span>Learning updates</span><strong>{agent.totalSteps.toLocaleString()}</strong></div><div><span>Last {recent.length || 50} · mean return</span><strong>{average === null ? "—" : average.toFixed(1)}</strong></div><div><span>Goals in that window</span><strong>{recent.filter((item) => item.goal).length}/{recent.length}</strong></div></div>
      <div className={styles.actions} role="group" aria-label="Inspect the learning state"><button type="button" aria-pressed={view === "training"} onClick={() => setView("training")}>Live agent &amp; Q values</button><button type="button" aria-pressed={view === "policy"} onClick={() => setView("policy")}>Test greedy route</button></div>
      <div className={styles.gridViewport}><div className={styles.grid} aria-label="CliffWalking states">
        {agent.q.map((values, state) => {
          const cliff = state > 36 && state < 47;
          const special = state === 36 ? "S" : state === 47 ? "G" : cliff ? "×" : arrows[greedyAction(values)];
          return <button type="button" key={state} disabled={cliff || state === 47} className={`${cliff ? styles.cliff : ""} ${view === "policy" && path.has(state) ? styles.path : ""} ${view === "training" && agent.state === state ? styles.agent : ""} ${inspected === state ? styles.selected : ""}`} aria-pressed={inspected === state} aria-label={`Row ${Math.floor(state / 12)}, column ${state % 12}${cliff ? ", cliff" : state === 47 ? ", goal" : `, greedy action ${arrows[greedyAction(values)]}`}`} onClick={() => setInspected(state)}>{special}</button>;
        })}
      </div></div>
      <p className={styles.hint}>S: start · G: goal · ×: cliff. Dark square: live agent. Shaded route: greedy evaluation. Select a safe cell to inspect its four learned values.</p>
      {view === "policy" ? <p className={styles.verdict} role="status">{evaluation.goal ? `Goal reached in ${evaluation.path.length - 1} moves, return ${evaluation.reward}, ${evaluation.falls} cliff falls.` : `Evaluation reached the 200-move cap, return ${evaluation.reward}, ${evaluation.falls} cliff falls. More training or different exploration may improve this policy.`}</p> : null}
      <div className={styles.inspector}><section><h4>State [{Math.floor(inspected / 12)}, {inspected % 12}]</h4><dl>{agent.q[inspected].map((value, action) => <div key={action}><dt>{arrows[action]} {['Up', 'Right', 'Down', 'Left'][action]}</dt><dd>{value.toFixed(3)}</dd></div>)}</dl></section><section><h4>Latest update</h4>{agent.last ? <><MathEquation tex={String.raw`\begin{aligned} Q(${agent.last.state}, ${actionTex[agent.last.action]}) &\leftarrow ${agent.last.old.toFixed(3)} + ${settings.alpha.toFixed(2)} \times \bigl(${agent.last.target.toFixed(3)} - (${agent.last.old.toFixed(3)})\bigr) \\ &= ${agent.last.updated.toFixed(3)} \end{aligned}`} label="Latest Q-value update" /><p>Reward {agent.last.reward}; next state {agent.last.next}. {agent.last.terminal ? "Goal reached: continuation value is zero." : settings.method === "sarsa" ? "Continuation uses the action sampled for the next move." : "Continuation uses the largest next-state Q value."}</p></> : <p>Take one learning step to inspect the reward, bootstrap target and updated value.</p>}</section></div>
      <section className={styles.receipt}><h4>How training works</h4><p>The 4 × 12 grid follows deterministic Gymnasium CliffWalking dynamics: ordinary moves cost −1; a cliff fall costs −100 and returns to start; reaching the goal ends the episode. Actions clamp at the grid edges.</p><p>Both methods start with zero Q values and use <MathEquation tex={String.raw`\gamma = 1`} display={false} />. This browser uses a seeded random stream, fixed <MathEquation tex={String.raw`\varepsilon`} display={false} /> and <MathEquation tex={String.raw`\alpha`} display={false} />, and a 200-move collection cap. Continuation remains in the target at the cap; only the goal has a zero continuation value. SARSA carries its sampled action into the next move.</p><p>Fixed exploration makes it easier to compare the two update rules with the same seed. Training returns include exploration; greedy evaluation measures the learned route separately.</p></section>
    </div>
  </section></ProjectCopy>;
}
