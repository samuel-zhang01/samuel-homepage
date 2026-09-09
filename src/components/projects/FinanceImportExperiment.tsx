"use client";

import { useState } from "react";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { projectText } from "@/lib/projectCopy";
import { financeImportCopy } from "./copy/financeImportCopy";
import { applyStatement, emptyImportState, financeImportBatches, financeImportScenarios, type ImportScenarioId } from "@/lib/financeImport";
import styles from "./LlmPostTrainingLab.module.css";

const pounds = (pennies: number) => (pennies / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

export function FinanceImportExperiment() {
  const locale = useProjectLocale();
  const [scenarioId, setScenarioId] = useState<ImportScenarioId>("occurrence");
  const [state, setState] = useState(emptyImportState);
  const [step, setStep] = useState(0);
  const scenario = financeImportScenarios.find((item) => item.id === scenarioId)!;
  const batches = financeImportBatches(scenarioId);
  const staged = batches[Math.min(step, batches.length - 1)];
  const receipt = state.history.at(-1);
  const ledgerClosing = staged.opening + state.ledger.reduce((sum, row) => sum + row.amount, 0);
  const reset = () => { setState(emptyImportState()); setStep(0); };
  const run = () => { setState((current) => applyStatement(current, staged)); setStep((current) => Math.min(current + 1, batches.length)); };

  return <ProjectCopy copy={financeImportCopy}><section className={styles.lab} aria-labelledby="finance-import-question">
    <header className={styles.heading}>
      <span>IMPORT IDENTITY · EXECUTED IN YOUR BROWSER</span>
      <h3 id="finance-import-question">Follow each row into the ledger</h3>
      <p>Run overlapping exports against an initially empty ledger. Every click computes row identities, attempts insertion and records the resulting balance.</p>
    </header>
    <nav className={styles.chapters} aria-label="Import edge cases">
      {financeImportScenarios.map((item) => <button key={item.id} aria-pressed={scenarioId === item.id} onClick={() => { setScenarioId(item.id); reset(); }}>{item.label}</button>)}
    </nav>
    <div className={styles.panel}>
      <div className={styles.question}><h4>{scenario.question}</h4><p>{scenario.note}</p></div>
      <div className={styles.prompt}>
        <strong>{step < batches.length ? "Staged export" : "Ready to replay"}: {staged.name}</strong>
        <span>{`${staged.rows.length} parsed rows · opening ${pounds(staged.opening)} · declared closing ${pounds(staged.closing)}`}</span>
        <span>{staged.rows.length ? staged.rows.map((row) => `${row.date} · ${projectText(locale, financeImportCopy, row.description)} · ${pounds(row.amount)}${row.providerId ? ` · ${row.providerId}` : ""}`).join(" / ") : "The parsed transaction list is empty."}</span>
      </div>
      <div className={styles.actions}>
        <button onClick={run}>{step < batches.length ? `Import export ${step + 1} of ${batches.length}` : "Replay final export"}</button>
        <button onClick={reset}>Reset ledger</button>
      </div>
      <div className={styles.metrics} aria-live="polite">
        <article><span>Stored rows</span><strong>{state.ledger.length}</strong><small>{state.history.length} import attempts</small></article>
        <article><span>Retained ledger closing</span><strong>{pounds(ledgerClosing)}</strong><small>£100 opening + stored movements</small></article>
        <article><span>Latest insertion result</span><strong>{receipt ? `${receipt.inserted} added` : "Ready"}</strong><small>{receipt ? `${receipt.ignored} existing identities ignored` : "Import the staged export to begin"}</small></article>
      </div>
      {receipt && <>
        <div className={styles.comparison} aria-live="polite">
          <article><h5>Parsed statement reconciliation</h5><dl>
            <div><dt>Calculated closing</dt><dd>{pounds(receipt.parsedClosing)}</dd></div>
            <div><dt>Declared closing</dt><dd>{pounds(receipt.declaredClosing)}</dd></div>
            <div><dt>Residual</dt><dd>{pounds(receipt.difference)}</dd></div>
            <div><dt>Reconciliation</dt><dd>{receipt.reconciled ? "Pass" : "Failed · rows still stored"}</dd></div>
          </dl></article>
          <article><h5>Retained ledger check</h5><dl>
            <div><dt>Opening + stored rows</dt><dd>{pounds(ledgerClosing)}</dd></div>
            <div><dt>Declared − retained</dt><dd>{pounds(receipt.declaredClosing - ledgerClosing)}</dd></div>
            <div><dt>Changed existing identities</dt><dd>{receipt.decisions.filter((row) => row.changedContent).length}</dd></div>
          </dl></article>
        </div>
        <div className={styles.receipt} tabIndex={0} role="region" aria-label="Import row decisions">
          <table><caption>Latest import: {receipt.name}</caption><thead><tr><th>Identity choice</th><th>Incoming</th><th>Decision</th><th>Retained</th></tr></thead>
            <tbody>{receipt.decisions.map((row, index) => <tr key={index}>
              <td>{row.providerId ? `Provider ${row.providerId}` : `Content · occurrence ${row.occurrence}`}</td>
              <td>{pounds(row.amount)}</td><td>{row.inserted ? "Inserted" : row.changedContent ? "Ignored · changed content" : "Ignored · existing key"}</td><td>{pounds(row.retainedAmount)}</td>
            </tr>)}</tbody></table>
          {receipt.decisions.length === 0 && <p>Zero rows reached the insertion loop.</p>}
        </div>
      </>}
      <details className={styles.receipt}><summary>Inspect the stored identities and import history</summary>
        <p>Each identity combines the fields used to recognise an existing transaction. Compare the incoming record with the retained ledger entry.</p>
        {state.ledger.map((row) => <p key={row.identity}><code style={{ overflowWrap: "anywhere" }}>{row.identity}</code> · {pounds(row.amount)}</p>)}
        <ol>{state.history.map((item, index) => <li key={index}>{`${item.name}: ${item.inserted} added, ${item.ignored} ignored, reconciliation ${item.reconciled ? "passed" : "failed"}.`}</li>)}</ol>
      </details>
      <p className={styles.note}>Amounts use whole pennies. A repeated identity retains the first stored row, while reconciliation flags stay visible for review. The other finance views use a separate 51-row example ledger.</p>
    </div>
  </section></ProjectCopy>;
}
