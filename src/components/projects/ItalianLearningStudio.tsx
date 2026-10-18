"use client";

import { useState } from "react";
import { DemoWindow, MacButton } from "./DemoChrome";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { projectText } from "@/lib/projectCopy";
import { checkDailyAnswer, finishDailyMission, matchesItalian, newDailyAttempt, nextDailyInterval, planDailySample } from "@/lib/parliamoDaily";
import { italianCopy } from "./copy/italianCopy";
import styles from "./ItalianLearningStudio.module.css";

export function ItalianLearningStudio() {
  const locale = useProjectLocale();
  const t = (text: string, values?: Record<string, number>) => projectText(locale, italianCopy, text, values);
  const [budget, setBudget] = useState(10);
  const [active, setActive] = useState(true);
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(newDailyAttempt);
  const [review, setReview] = useState({ day: 1, due: 2, interval: 1, answer: "", result: null as boolean | null, count: 0 });
  const plan = planDailySample(budget, 2, active);
  const ready = attempt.checked.every(Boolean) && attempt.rubric.every(Boolean) && attempt.output.trim().split(/\s+/).length >= 3;
  function reset() {
    setBudget(10); setActive(true); setStep(0); setAttempt(newDailyAttempt());
    setReview({ day: 1, due: 2, interval: 1, answer: "", result: null, count: 0 });
  }
  function checkReview() {
    if (!review.answer.trim() || review.result !== null || review.day < review.due) return;
    const correct = matchesItalian(review.answer, "si");
    const interval = nextDailyInterval(review.interval, correct);
    setReview({ ...review, result: correct, interval, due: review.day + interval, count: review.count + 1 });
  }
  return <ProjectCopy copy={italianCopy}><DemoWindow
    appName="Parliamo!"
    title="A small Italian learning day"
    status="Disposable practice"
    purpose="Turn a lesson PDF into a small task: notice a pattern, recall it, then use it in your own sentence."
    tryThis="Compare a 5-minute and a 10-minute day. Then try the greeting mission and its next-day review."
    watchFor="Reviews use two minutes and missions use five. A retry helps you learn, but never replaces your first-attempt score."
    footer={<span>36 original missions · English and Italian in the live portal</span>}
  >
    <div className={styles.studio}>
      <div className={styles.actions}>
        <a className="s7-button is-primary" href="https://italian.samuelzhang.co.uk" target="_blank" rel="noreferrer">Open the learning portal</a>
        <MacButton onClick={reset}>Reset demo</MacButton>
      </div>
      <p className={styles.note}>This demo keeps temporary practice in this window. The live portal saves your plan, drafts and progress in your browser, with a downloadable backup.</p>
      <section className={styles.paper} aria-labelledby="daily-plan-title">
        <h3 id="daily-plan-title">1. Make room for learning</h3>
        <p>Example queue: two reviews are due. Review first, then fit in new five-minute missions.</p>
        <fieldset className={styles.choices}><legend>Daily budget</legend>{[5, 10, 15].map(minutes =>
          <label key={minutes}><input type="radio" name="parliamo-budget" checked={budget === minutes} onChange={() => setBudget(minutes)} />{t("{minutes} minutes", { minutes })}</label>
        )}</fieldset>
        <label className={styles.check}><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Study on this day</label>
        <div className={styles.metrics} aria-live="polite">
          <div><strong>{plan.reviews}</strong><span>Reviews</span></div>
          <div><strong>{plan.missions}</strong><span>New missions</span></div>
          <div><strong>{t("{minutes} min", { minutes: plan.used })}</strong><span>Planned time</span></div>
        </div>
        <p className={styles.note}>{!active ? "Rest day: both reviews wait for your next study day. No penalty." : plan.missions === 0 ? "The reviews fit. The next mission waits until a five-minute slot is available." : "A small gap is fine. The plan never squeezes a five-minute mission into less time."}</p>
      </section>
      <section className={styles.paper} aria-labelledby="daily-mission-title">
        <h3 id="daily-mission-title">2. A first conversation</h3>
        <p>Practice one mission independently of the example queue above.</p>
        <ol className={styles.stages} aria-label="Mission steps">{["Notice", "Recall", "Use it"].map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined}>{t(label)}</li>)}</ol>
        {step === 0 ? <>
          <p>Use mi chiamo to give your name. Use ti with an informal tu question and si with formal Lei.</p>
          <blockquote lang="it" translate="no">Ciao, mi chiamo Elena. E tu?<br />Buongiorno, come si chiama?</blockquote>
          <p>Hello, my name is Elena. And you? / Good morning, what is your name?</p>
          <MacButton primary onClick={() => setStep(1)}>Try without the example</MacButton>
        </> : null}
        {step === 1 ? <>
          <p>Fill each gap. Capitalisation and final punctuation are accepted; Italian accents still matter.</p>
          {[0, 1].map(index => <div className={styles.question} key={index}>
            <label htmlFor={`daily-answer-${index}`} lang="it" translate="no">{index === 0 ? "Mi ___ Nora." : "Come ___ chiami?"}</label>
            <p>{index === 0 ? "Give your name." : "Ask a friend’s name."}</p>
            <div className={styles.actions}>
              <input id={`daily-answer-${index}`} lang="it" autoComplete="off" value={attempt.answers[index]} disabled={attempt.checked[index]} onChange={e => setAttempt({ ...attempt, answers: attempt.answers.map((a, i) => i === index ? e.target.value : a) })} />
              <MacButton disabled={attempt.checked[index] || !attempt.answers[index].trim()} onClick={() => setAttempt(checkDailyAnswer(attempt, index))}>Check answer</MacButton>
            </div>
            <p role="status">{attempt.checked[index] ? "Correct. Your first attempt is kept." : attempt.first[index] !== null ? index === 0 ? "Try chiamo: mi chiamo gives your name." : "Try ti: use tu when speaking to a friend." : "Try before looking at feedback."}</p>
          </div>)}
          <MacButton primary disabled={!attempt.checked.every(Boolean)} onClick={() => setStep(2)}>Use it yourself</MacButton>
        </> : null}
        {step === 2 ? <>
          <label htmlFor="daily-output">Introduce an invented person in two sentences, then ask my name.</label>
          <textarea id="daily-output" lang="it" maxLength={2000} rows={4} value={attempt.output} disabled={attempt.completed} onChange={e => setAttempt({ ...attempt, output: e.target.value })} />
          <p>Check your own work. This checklist does not grade the meaning or grammar of your writing.</p>
          {["I gave a name using mi chiamo.", "I used a consistent formal or informal question."].map((label, index) => <label className={styles.check} key={label}>
            <input type="checkbox" checked={attempt.rubric[index]} disabled={attempt.completed} onChange={e => setAttempt({ ...attempt, rubric: attempt.rubric.map((v, i) => i === index ? e.target.checked : v) })} />{t(label)}
          </label>)}
          <p className={styles.note}>Write at least three words and check both points to complete the mission.</p>
          <MacButton primary disabled={!ready || attempt.completed} onClick={() => setAttempt(finishDailyMission(attempt))}>{attempt.completed ? "Mission completed" : "Complete mission"}</MacButton>
          <p role="status">{t("First attempts: {correct} / 2", { correct: attempt.first.filter(Boolean).length })}</p>
        </> : null}
      </section>
      {attempt.completed ? <section className={styles.paper} aria-labelledby="daily-review-title">
        <h3 id="daily-review-title">3. Remember it another day</h3>
        <p>{t("Simulated day {day}. Next review: day {due}.", { day: review.day, due: review.due })}</p>
        {review.day < review.due ? <MacButton onClick={() => setReview({ ...review, day: review.due, answer: "", result: null })}>Go to the next review day</MacButton> : null}
        {review.day >= review.due && review.result === null ? <>
          <label htmlFor="daily-review" lang="it" translate="no">Come ___ chiama?</label>
          <p>Ask someone’s name formally.</p>
          <div className={styles.actions}><input id="daily-review" lang="it" value={review.answer} autoComplete="off" onChange={e => setReview({ ...review, answer: e.target.value })} /><MacButton disabled={!review.answer.trim()} onClick={checkReview}>Check review</MacButton></div>
        </> : null}
        <p role="status">{review.result === null ? "The first review is due one day after completion." : review.result ? "Correct. Successful reviews wait 3, then 7, then 14 days." : "The answer is si. A missed review returns the next day."}</p>
        <p className={styles.note}>One credited review per day. Extra practice never adds duplicate credit.</p>
      </section> : null}
      <aside className={styles.paper}>
        <h3>Practice alongside your materials</h3>
        <p>The live path has 36 original missions based on a review of 47 lesson PDFs and presentations. Each mission points back to physical pages or slides. Your local PDF stays on your device.</p>
        <p>These are selected learning outcomes, not a complete course or a language certificate. The earlier downloadable workbooks remain supplementary practice.</p>
      </aside>
    </div>
  </DemoWindow></ProjectCopy>;
}
export default ItalianLearningStudio;
