"use client";

import { useReducer } from "react";
import { System7Icon } from "../System7Icon";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { browserViewCopy } from "./copy/browserViewCopy";
import { createSessionLab, createTransportLab, sessionStep, transportStep } from "./browserViewLab";
import styles from "./BrowserViewStudio.module.css";

export function BrowserViewStudio() {
  const [session, dispatch] = useReducer(sessionStep, undefined, createSessionLab);
  const [transport, send] = useReducer(transportStep, undefined, createTransportLab);
  return <ProjectCopy copy={browserViewCopy}><section className={styles.studio} data-browser-view-lab>
    <header className={styles.header}>
      <span className={styles.icon}><System7Icon kind="computer" /></span>
      <div><h2>One browser, two views</h2><p>Edit the note in the first viewer. Both views share the same page.</p></div>
    </header>
    <p className={styles.note}>Interactive model with example data. It does not start Chromium or connect to an agent.</p>
    <div className={styles.session}>
      <div><strong>Shared browser session</strong><p>Fixed desktop: 1440 × 1000 pixels</p></div>
      <div className={styles.actions}>
        <button className="s7-button is-primary" onClick={() => dispatch({ type: "review" })} data-agent-action>{session.page.reviewed ? "Agent: reopen task" : "Agent: mark reviewed"}</button>
        <button className="s7-button" onClick={() => dispatch({ type: "reset" })}>Reset session</button>
      </div>
      <p className={styles.status} role="status">{session.page.reviewed ? "Shared task: reviewed" : "Shared task: awaiting review"}</p>
    </div>
    <div className={styles.viewers}>
      {session.viewers.map((viewer, index) => {
        const id = index as 0 | 1;
        return <section className={styles.viewer} key={id} data-viewer={id} aria-label={id === 0 ? "Editor viewer" : "Second-screen viewer"}>
          <h3>{id === 0 ? "Editor viewer" : "Second-screen viewer"}</h3>
          <div className={styles.actions}>
            <button className="s7-button" aria-pressed={viewer.readOnly} onClick={() => dispatch({ type: "read-only", viewer: id })}>View only</button>
            <button className="s7-button" onClick={() => dispatch({ type: "connection", viewer: id })}>{viewer.connected ? "Disconnect viewer" : "Reconnect viewer"}</button>
          </div>
          <p className={styles.status}>{viewer.connected ? "Connected to the shared page" : "Disconnected · last visible state"}</p>
          <div className={styles.page} data-stale={!viewer.connected}>
            <h4>Example layout review</h4>
            <label><span>Shared note</span><textarea maxLength={120} rows={3} value={viewer.page.note} placeholder="Write a note for the other viewer" disabled={!viewer.connected || viewer.readOnly} onChange={event => dispatch({ type: "edit", viewer: id, note: event.target.value })} /></label>
            <label className={styles.check}><input type="checkbox" checked={viewer.page.reviewed} disabled={!viewer.connected || viewer.readOnly} onChange={() => dispatch({ type: "review", viewer: id })} />Layout reviewed</label>
          </div>
          <p>{viewer.readOnly ? "Input is blocked here. The agent and the other viewer can still make changes." : "Input from this viewer changes the shared page."}</p>
        </section>;
      })}
    </div>
    <p className={styles.hint}>Try disconnecting the second viewer, then let the agent change the task. Reconnect to recover the current page without clearing the note.</p>
    <details className={styles.transport}>
      <summary>Why a slow viewer does not grow an endless queue</summary>
      <p>The extension waits after four unacknowledged chunks. Acknowledging one frees a slot; a stall longer than 15 seconds disconnects that viewer.</p>
      <p>Each slot here holds a full 64 KiB example chunk. Real chunks can be smaller. This separate model uses a manual clock.</p>
      <div className={styles.slots} aria-label="Pending display chunks">{[0, 1, 2, 3].map(index => <div key={index} data-filled={index < transport.pending.length}><b>{index + 1}</b><span>{index < transport.pending.length ? "64 KiB pending" : "Empty slot"}</span></div>)}</div>
      <p role="status" data-transport-status>{!transport.connected ? "Stalled viewer disconnected · queue cleared" : transport.pending.length === 4 ? "256 KiB pending · reading paused" : "Capacity available · reading can continue"}</p>
      <div className={styles.actions}>
        <button className="s7-button" disabled={!transport.connected || transport.pending.length === 4} onClick={() => send("send")}>Send 64 KiB</button>
        <button className="s7-button" disabled={!transport.connected || !transport.pending.length} onClick={() => send("ack")}>Acknowledge oldest</button>
        <button className="s7-button" disabled={!transport.connected} onClick={() => send("expire")}>Advance 16 seconds</button>
        <button className="s7-button" onClick={() => send("reconnect")}>Reset connection</button>
      </div>
    </details>
    <footer className={styles.footer}>
      <p>The extension needs a Linux host. It streams one fixed virtual desktop; separate viewers are not separate monitors. The real canvas cannot expose the remote page to a local screen reader.</p>
      <a className="s7-button" href="https://github.com/samuel-zhang01/browser-view#install" target="_blank" rel="noreferrer">Install Browser View</a>
      <a className="s7-button" href="https://github.com/samuel-zhang01/browser-view/blob/v0.3.0/VALIDATION.md" target="_blank" rel="noreferrer">Read the tested scope</a>
    </footer>
  </section></ProjectCopy>;
}
