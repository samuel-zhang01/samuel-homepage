"use client";

import { useId, useReducer, useRef } from "react";
import { projectText } from "@/lib/projectCopy";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { browserViewCopy as copy } from "./copy/browserViewCopy";
import { browserStep, createBrowserWalkthrough, type BrowserAction } from "./browserViewLab";
import styles from "./BrowserViewStudio.module.css";

export function BrowserViewStudio() {
  const [state, dispatch] = useReducer(browserStep, undefined, createBrowserWalkthrough);
  const locale = useProjectLocale();
  const nameId = useId(), errorId = useId();
  const nameInput = useRef<HTMLInputElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const focusNext = () => requestAnimationFrame(() => {
    nextButtonRef.current?.focus({ preventScroll: true });
    guideRef.current?.scrollIntoView({ block: "center" });
  });
  const t = (source: string) => projectText(locale, copy, source);
  const { page, phase, panelOpen, observed } = state;
  const step = phase === "start" ? 1 : phase === "edit" ? 2 : 3;
  const editable = panelOpen && (phase === "edit" || phase === "return");
  const prompt = phase === "start" ? "Let the agent start this sample sign-up. Watch the name and reminder change."
    : phase === "edit" ? "Change the name or reminder below. Then let the agent read your version."
    : phase === "complete" ? "Your changes survived. You and the agent worked on one page, even with the panel closed."
    : panelOpen ? projectText(locale, copy, "The agent sees “{name}”. Reminder: {reminder}. Close the panel; the browser keeps running.", { name: observed?.name ?? page.name, reminder: t(page.reminder ? "On" : "Off") })
    : page.submitted ? "The agent finished in the background. Reopen the panel to see your result."
    : "The panel is closed; the browser is still running. Let the agent finish the sample sign-up.";
  const action: Exclude<BrowserAction["type"], "name" | "reminder"> = phase === "start" ? "agent-fill" : phase === "edit" ? "agent-read" : phase === "complete" ? "reset" : panelOpen ? "close" : page.submitted ? "open" : "agent-submit";
  const actionLabel = action === "agent-fill" ? "Let agent fill the form" : action === "agent-read" ? "Let agent read my changes"
    : action === "close" ? "Close browser panel" : action === "agent-submit" ? "Let agent finish" : action === "open" ? "Reopen browser panel" : "Start again";
  const activate = () => {
    dispatch({ type: action });
    if (action === "agent-read" && !page.name.trim()) nameInput.current?.focus();
    else if (action === "agent-fill") requestAnimationFrame(() => nameInput.current?.focus());
    else if (action === "agent-read") focusNext();
  };
  const nextButton = <button ref={nextButtonRef} type="button" className="s7-button is-primary" data-next-action={action} aria-describedby={`${nameId}-prompt`} onClick={activate}>{actionLabel}</button>;
  const restart = () => { dispatch({ type: "reset" }); focusNext(); };
  return <ProjectCopy copy={copy}><section className={styles.studio} data-browser-view-lab data-phase={phase}>
    <header className={styles.header}>
      <h2>Try a shared browser</h2>
      <p>Your agent starts. You take over on the same page.</p>
      <span className={styles.demoLabel}>Scripted walkthrough</span>
    </header>
    <ol className={styles.steps} aria-label="Walkthrough progress">
      {["Agent starts", "You take over", "Close and return"].map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} data-done={step > index + 1 || phase === "complete"}><span aria-hidden="true">{index + 1}</span>{label}</li>)}
    </ol>
    <div ref={guideRef} className={styles.guide}>
      <p id={`${nameId}-prompt`} data-instruction>{prompt}</p>
      {phase !== "edit" && nextButton}
    </div>
    <div className={styles.workspace}>
      <section className={styles.browser} aria-label="Browser View sample page" data-panel-open={panelOpen}>
        <div className={styles.browserBar}><strong>Browser View</strong><span>{panelOpen ? "Panel open" : "Panel closed"}</span></div>
        {panelOpen ? <>
          <div className={styles.address}><code>localhost:5173/signup</code><span>Example page</span></div>
          <div className={styles.page}>
            {page.submitted ? <div className={styles.confirmation} data-signup-result>
              <h3>Preview created</h3><p>These are the details you handed to the agent.</p>
              <dl><dt>Name</dt><dd data-saved-name data-copy-source>{page.name}</dd><dt>Reminder</dt><dd>{page.reminder ? "On" : "Off"}</dd></dl>
              <p>Example only. Nothing was sent or booked.</p>
              <button type="button" className="s7-button" data-edit-again onClick={() => { dispatch({ type: "edit-again" }); requestAnimationFrame(() => nameInput.current?.focus()); }}>Edit this form again</button>
            </div> : <>
              <h3>Workshop sign-up</h3>
              <label htmlFor={nameId}>Name for this demo</label>
              <input ref={nameInput} id={nameId} data-demo-name value={page.name} maxLength={40} disabled={!editable} autoComplete="off" aria-invalid={state.nameError || undefined} aria-describedby={state.nameError ? errorId : undefined} placeholder="The agent will fill this first" onChange={event => dispatch({ type: "name", value: event.target.value })} />
              {state.nameError && <p id={errorId} className={styles.error} role="alert">Enter a name so the agent can finish the example.</p>}
              <label className={styles.check}><input type="checkbox" data-demo-reminder checked={page.reminder} disabled={!editable} onChange={event => dispatch({ type: "reminder", value: event.target.checked })} />Send a reminder</label>
              {phase === "edit" && <div className={styles.formAction}>{nextButton}</div>}
              <p className={styles.exampleNote}>{phase === "start" ? "Start with the button above." : "Your edits are already on the shared page."}</p>
            </>}
          </div>
        </> : <div className={styles.closed}>
          <h3>Panel closed. Browser still running.</h3>
          <p>Your form stays open on the Linux host.</p>
          <dl><dt>Name retained</dt><dd data-copy-source>{page.name}</dd><dt>Browser task</dt><dd>{page.submitted ? "Finished by the agent" : "Waiting for the agent"}</dd></dl>
          {!page.submitted && <button type="button" className="s7-button" data-reopen-early onClick={() => { dispatch({ type: "open" }); focusNext(); }}>Reopen without finishing</button>}
        </div>}
      </section>
      <aside className={styles.agent} aria-label="Scripted agent">
        <h3>Scripted agent</h3>
        <div role="status" aria-live="polite" aria-atomic="true" data-agent-message>
          {phase === "start" ? <p>I can fill the page you are looking at. Start the walkthrough to see it happen.</p>
            : phase === "edit" ? <p>The form is ready for your edits. I will read the current page when you ask.</p>
            : observed && <><p>{projectText(locale, copy, "I can see “{name}”. Reminder: {reminder}.", { name: observed.name, reminder: t(observed.reminder ? "On" : "Off") })}</p><p>{page.submitted ? "I created the preview while your panel was closed. Your chosen details are still there." : "That is your current form, not a separate copy. I can carry on if you close the panel."}</p></>}
        </div>
      </aside>
    </div>
    <div className={styles.extras}>
      {phase !== "start" && phase !== "complete" && <button type="button" className="s7-button" data-restart onClick={restart}>Restart walkthrough</button>}
      <details>
        <summary>What would a second screen see?</summary>
        <p>Another viewer shows this same browser. This view is read-only; edits in the main panel appear here too.</p>
        <div className={styles.mirror} data-second-view>
          <strong>Second viewer · same session</strong>
          <dl><dt>Name</dt><dd data-mirror-name data-copy-source>{page.name || t("Not filled yet")}</dd><dt>Reminder</dt><dd data-mirror-reminder>{page.reminder ? "On" : "Off"}</dd><dt>Page</dt><dd data-mirror-result>{page.submitted ? "Preview created" : "Workshop sign-up"}</dd></dl>
          <p>The second viewer stays connected when you close the editor panel.</p>
        </div>
      </details>
      <details>
        <summary>How this relates to the real extension</summary>
        <p>Browser View puts a Chromium browser inside VS Code or code-server. You use its streamed desktop; your coding agent controls the same browser through automation.</p>
        <p>Tabs and form values belong to the browser session. Closing a viewer leaves it running. Each viewer can choose its own scaling and view-only mode.</p>
        <p>This local walkthrough uses a scripted agent and an example page. It starts no remote browser and sends no form data. The real extension needs a Linux host, and its canvas cannot expose the remote page to a local screen reader.</p>
      </details>
      <a className="s7-button" href="https://github.com/samuel-zhang01/browser-view#install" target="_blank" rel="noreferrer">Install Browser View on Linux</a>
    </div>
  </section></ProjectCopy>;
}
