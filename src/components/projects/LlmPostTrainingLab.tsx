"use client";

import { ProjectCopy } from "./ProjectTranslationBoundary";
import { llmPostTrainingLabCopy } from "./copy/llmPostTrainingLabCopy";

import { useState } from "react";
import ClassicSelect from "../ClassicSelect";
import { llmAnswerEvidence } from "@/data/llmLabEvidence";
import { dpoPreference, initialLoraState, inspectLora, stepLora } from "@/lib/learningMechanics";
import { MathEquation } from "./MathEquation";
import styles from "./LlmPostTrainingLab.module.css";

type Chapter = "answers" | "lora" | "dpo";
type Outcome = "all" | "correct" | "incorrect" | "cutoff";

export function LlmPostTrainingLab() {
  const [chapter, setChapter] = useState<Chapter>("answers");
  const [outcome, setOutcome] = useState<Outcome>("all");
  const [selectedId, setSelectedId] = useState<string>("add-00-08");
  const [policy, setPolicy] = useState(.75);
  const [reference, setReference] = useState(.5);
  const [beta, setBeta] = useState(.5);
  const [lora, setLora] = useState(initialLoraState);
  const [rate, setRate] = useState(.1);
  const filtered = llmAnswerEvidence.filter((row) => outcome === "all" || (outcome === "correct" ? row.sft.exact_match : outcome === "incorrect" ? !row.sft.exact_match : !row.base.terminated));
  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0];
  const preference = dpoPreference(policy, reference, beta);
  const adapter = inspectLora(lora);
  const rowTex = (values: readonly number[]) => values.map((n) => n.toFixed(3)).join(" & ");
  return <ProjectCopy copy={llmPostTrainingLabCopy}><section className={styles.lab} aria-label="LLM post-training laboratory">
    <header className={styles.heading}><span>STUDY-RL / Practical lab</span><h3>What did the model actually learn?</h3><p>Inspect a real small-model run, then work through the updates behind it.</p></header>
    <div className={styles.chapters} role="group" aria-label="Post-training experiments">
      {([ ["answers", "01 · Inspect answers"], ["lora", "02 · Train an adapter"], ["dpo", "03 · Change a preference"] ] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={chapter === id} onClick={() => setChapter(id)}>{label}</button>)}
    </div>
    {chapter === "answers" ? <div className={styles.panel}>
      <div className={styles.question}><span>Recorded run / 32 held-out prompts</span><h4>A well-formatted answer can still be wrong.</h4><p>Start with 0 + 8. Compare the requested format with the expected answer, then inspect the other failures.</p></div>
      <div className={styles.metrics}>
        <article><span>Strict format</span><strong>0 → 32 / 32</strong><small>Starting model → SFT</small></article>
        <article><span>Strict exact answer</span><strong>0 → 19 / 32</strong><small>13 SFT answers still wrong</small></article>
        <article><span>Generation cutoffs</span><strong>10 → 0</strong><small>12-token generation limit</small></article>
      </div>
      <div className={styles.controls}>
        <label>Inspect an outcome<ClassicSelect value={outcome} onChange={(event) => setOutcome(event.target.value as Outcome)}><option value="all">All 32 prompts</option><option value="incorrect">13 incorrect SFT answers</option><option value="correct">19 correct SFT answers</option><option value="cutoff">10 starting-model cutoffs</option></ClassicSelect></label>
        <label>Recorded prompt<ClassicSelect value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>{filtered.map((row) => <option key={row.id} value={row.id} lang="en" translate="no">{row.prompt}</option>)}</ClassicSelect></label>
      </div>
      <div className={styles.prompt}><strong lang="en" translate="no">{selected.prompt}</strong><span>Expected: {selected.expected} · {filtered.length} matching records</span></div>
      <div className={styles.comparison} aria-live="polite">
        {([ ["base", "Starting instruction-tuned model"], ["sft", "Reloaded SFT adapter"] ] as const).map(([key, label]) => <article key={key}><h5>{label}</h5><pre>{selected[key].text}</pre><dl><div><dt>Requested format</dt><dd>{selected[key].valid_format ? "Pass" : "Fail"}</dd></div><div><dt>Strict exact match</dt><dd>{selected[key].exact_match ? "Pass" : "Fail"}</dd></div><div><dt>Termination</dt><dd>{selected[key].terminated ? "Stopped" : "Token cutoff"}</dd></div></dl></article>)}
      </div>
      <p className={styles.note}>These are recorded greedy outputs on synthetic addition. The starting model was already instruction-tuned. Strict matching requires correct arithmetic, the requested format and termination together. Use the next two tabs to train a small adapter and explore the preference objective.</p>
      <section className={styles.receipt}><h4>Training results</h4><p>SmolLM2-135M-Instruct · Apple Silicon/MPS · FP32 · rank-8 LoRA. 2,442,240 trainable parameters out of 136,957,248 including adapters (1.7832%). Addition splits: 192 train / 32 validation / 32 test; reversed operand pairs stay in the same split.</p><table><caption>Validation objectives before and after training</caption><thead><tr><th>Run</th><th>Updates</th><th>Before → after</th></tr></thead><tbody><tr><th>SFT completion-token NLL</th><td>30</td><td>2.814953 → 0.471547</td></tr><tr><th>DPO preference-pair loss</th><td>20</td><td>0.693147 → 0.556461</td></tr></tbody></table><p>The DPO result measures the preference-pair objective. Generated-answer quality after DPO remains unevaluated.</p></section>
    </div> : chapter === "lora" ? <div className={styles.panel}>
      <div className={styles.question}><span>Live calculation / lesson 02</span><h4>Train a small adapter. Keep the base frozen.</h4><p>Predict <MathEquation tex={String.raw`[3,0]`} display={false} /> from input <MathEquation tex={String.raw`[2,1]`} display={false} />. Step once: B learns immediately, while A’s first gradient is zero because B starts at zero.</p></div>
      <div className={styles.controls}><label>Learning rate · {rate.toFixed(2)}<input type="range" min=".01" max=".2" step=".01" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label><div className={styles.actions}><button type="button" disabled={lora.step >= 20} onClick={() => setLora((state) => stepLora(state, rate))}>Take one gradient step</button><button type="button" onClick={() => { setLora(initialLoraState); setRate(.1); }}>Reset adapter</button></div></div>
      <div className={styles.metrics} aria-live="polite"><article><span>Optimizer step</span><strong>{lora.step} / 20</strong></article><article><span>Prediction</span><strong><MathEquation tex={String.raw`\begin{bmatrix}${rowTex(adapter.output)}\end{bmatrix}`} display={false} label="Adapter prediction" /></strong></article><article><span><MathEquation tex={String.raw`\tfrac{1}{2}`} display={false} /> squared-error loss</span><strong>{adapter.loss.toFixed(6)}</strong></article></div>
      <div className={styles.comparison}><article><h5>Parameters now</h5><div className={styles.mathPanel}><MathEquation tex={String.raw`W_0 = \begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix} \quad\text{(frozen)}`} label="Frozen base matrix" /><MathEquation tex={String.raw`\begin{aligned}A &= \begin{bmatrix}${rowTex(lora.a)}\end{bmatrix}\\ B &= \begin{bmatrix}${rowTex(lora.b)}\end{bmatrix}^{\mathsf T}\end{aligned}`} label="Current low-rank adapter factors" /><MathEquation tex={String.raw`W = W_0 + BA`} label="LoRA weight update" /></div></article><article><h5>Gradients for the next step</h5><div className={styles.mathPanel}><MathEquation tex={String.raw`\nabla A = \begin{bmatrix}${rowTex(adapter.gradA)}\end{bmatrix}`} label="Next gradient for A" /><MathEquation tex={String.raw`\nabla B = \begin{bmatrix}${rowTex(adapter.gradB)}\end{bmatrix}^{\mathsf T}`} label="Next gradient for B" /><MathEquation tex={String.raw`\theta \leftarrow \theta - \text{learning rate}\times\nabla\theta`} label="Gradient-descent parameter update" /></div></article></div>
      <p className={styles.note}>This exact two-dimensional teaching example uses scale 1 and one training pair. At rate 0.10, the first step changes the loss from 1 to 0.81. It explains the update mechanics; it is separate from the measured language-model run.</p>
    </div> : <div className={styles.panel}>
      <div className={styles.question}><span>Live calculation / lesson 04</span><h4>A preference is relative to a frozen reference.</h4><p>Raise the chosen-answer probability, then move the reference above it. The same policy can now be penalised. Match the reference to recover the <MathEquation tex={String.raw`\log(2)`} display={false} /> baseline.</p></div>
      <div className={styles.controls}>
        <label>Policy chosen probability · {policy.toFixed(2)}<input type="range" min=".05" max=".95" step=".01" value={policy} onChange={(e) => setPolicy(Number(e.target.value))} /></label>
        <label>Reference chosen probability · {reference.toFixed(2)}<input type="range" min=".05" max=".95" step=".01" value={reference} onChange={(e) => setReference(Number(e.target.value))} /></label>
        <label><span>Preference strength <MathEquation tex={String.raw`\beta = ${beta.toFixed(2)}`} display={false} /></span><input type="range" min=".05" max="2" step=".05" value={beta} onChange={(e) => setBeta(Number(e.target.value))} /></label>
      </div>
      <div className={styles.actions}><button type="button" onClick={() => setPolicy(reference)}>Match the reference</button><button type="button" onClick={() => { setPolicy(.75); setReference(.5); setBeta(.5); }}>Reset preference</button></div>
      <div className={styles.metrics} aria-live="polite"><article><span>Preference probability</span><strong>{preference.probability.toFixed(6)}</strong></article><article><span>DPO pair loss</span><strong>{preference.loss.toFixed(6)}</strong></article><article><span>Gradient <MathEquation tex={String.raw`\partial L / \partial h`} display={false} /></span><strong>{preference.gradient.toFixed(6)}</strong></article></div>
      <div className={styles.derivation}><MathEquation tex={String.raw`\begin{aligned}h &= \log\!\left(\frac{p}{1-p}\right) - \log\!\left(\frac{q}{1-q}\right)\\ &= ${preference.margin.toFixed(4)}\end{aligned}`} label="Policy preference margin relative to the reference" /><MathEquation tex={String.raw`\begin{aligned}L &= -\log\sigma(\beta h)\\ \frac{\partial L}{\partial h} &= -\beta\sigma(-\beta h)\end{aligned}`} label="DPO pair loss and gradient" /><p>{Math.abs(policy - reference) < .001 ? <>Policy and reference agree: the preference probability is 0.5 and the loss is <MathEquation tex={String.raw`\log(2)`} display={false} />.</> : policy > reference ? <>The policy favours the chosen response more than the reference does; the loss falls below <MathEquation tex={String.raw`\log(2)`} display={false} />.</> : <>The reference favours the chosen response more strongly than the policy; the loss rises above <MathEquation tex={String.raw`\log(2)`} display={false} />.</>}</p></div>
      <p className={styles.note}>A two-response probability model for inspecting the DPO objective. Real training uses completion log-probabilities over preference pairs. Changing this reference slider chooses a new toy scenario; the reference stays frozen during each actual training run.</p>
    </div>}
  </section></ProjectCopy>;
}
