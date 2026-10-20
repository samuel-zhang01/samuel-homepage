"use client";

import { useState } from "react";
import { DemoWindow, MacButton } from "./DemoChrome";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { projectText } from "@/lib/projectCopy";
import {
  checkDailyAnswer, checkGrammarSample, finishDailyMission, hintGrammarSample,
  matchesItalian, newDailyAttempt, newGrammarSample, nextDailyInterval,
  nextGrammarSample, planAcademySample, planDailySample,
  type AcademyBudget, type SampleProgramme,
} from "@/lib/parliamoDaily";
import { italianCopy } from "./copy/italianCopy";
import styles from "./ItalianLearningStudio.module.css";

// First study days in the reviewed 20 October grammar.json programmes.
const ACADEMY_PROGRAMMES = [
  { id: "supported", label: "Supported A1", days: 28, units: ["Noun gender"] },
  { id: "intensive", label: "Intensive A1 preparation", days: 14, units: ["Noun gender", "Noun plurals"] },
  { id: "repair", label: "Grammar repair", days: 10, units: ["Noun gender", "Definite articles"] },
] as const;

export function ItalianLearningStudio() {
  const locale = useProjectLocale();
  const t = (text: string, values?: Record<string, number>) => projectText(locale, italianCopy, text, values);
  const [budget, setBudget] = useState(10);
  const [active, setActive] = useState(true);
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(newDailyAttempt);
  const [review, setReview] = useState({ day: 1, due: 2, interval: 1, answer: "", result: null as boolean | null, count: 0 });
  const [programme, setProgramme] = useState<SampleProgramme>("supported");
  const [academyBudget, setAcademyBudget] = useState<AcademyBudget>(30);
  const [grammar, setGrammar] = useState(newGrammarSample);
  const plan = planDailySample(budget, 2, active);
  const selectedProgramme = ACADEMY_PROGRAMMES.find(item => item.id === programme)!;
  const recipe = planAcademySample(academyBudget, programme);
  const firstGrammar = grammar.attempts[0];
  const latestGrammar = grammar.attempts.at(-1);
  const currentGrammar = latestGrammar?.day === grammar.day ? latestGrammar : null;
  const grammarStatus = (entry: typeof latestGrammar) => !entry
    ? "Not yet tried"
    : !entry.correct ? "Needs a correction" : entry.assisted ? "Correct with support" : "Correct independently";
  const ready = attempt.checked.every(Boolean) && attempt.rubric.every(Boolean) && attempt.output.trim().split(/\s+/).length >= 3;
  function reset() {
    setBudget(10); setActive(true); setStep(0); setAttempt(newDailyAttempt());
    setReview({ day: 1, due: 2, interval: 1, answer: "", result: null, count: 0 });
    setProgramme("supported"); setAcademyBudget(30); setGrammar(newGrammarSample());
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
    purpose="Turn class material into a daily route: guided lessons, grammar practice and later recall."
    tryThis="Compare a supported and an intensive day at 30, 45 or 60 minutes. Then try the grammar gap with and without a hint."
    watchFor="Time blocks follow the selected programme. A supported correction counts as practice while the first attempt stays intact."
    footer={<span>48 sources · 36 missions · 28 grammar units · 224 exercises · 3 programmes</span>}
  >
    <div className={styles.studio}>
      <div className={styles.actions}>
        <a className="s7-button is-primary" href="https://italian.samuelzhang.co.uk" target="_blank" rel="noreferrer">Open the learning portal</a>
        <MacButton onClick={reset}>Reset demo</MacButton>
      </div>
      <p className={styles.note}>These are temporary illustrative samples of the live portal. This window does not save progress. The full app saves plans, drafts, vocabulary and practice in your browser, with a downloadable backup.</p>
      <section className={styles.paper} aria-labelledby="academy-plan-title">
        <h3 id="academy-plan-title">Choose a longer study day</h3>
        <p>Explore the first study day of each programme. The same budget makes different room for grammar when the day has one or two units.</p>
        <fieldset className={styles.choices}>
          <legend>Study programme</legend>
          {ACADEMY_PROGRAMMES.map(item => <label key={item.id}>
            <input type="radio" name="parliamo-programme" value={item.id} checked={programme === item.id} onChange={() => setProgramme(item.id)} />
            {t(item.label)}
          </label>)}
        </fieldset>
        <fieldset className={styles.choices}>
          <legend>Longer daily budget</legend>
          {([30, 45, 60] as const).map(minutes => <label key={minutes}>
            <input type="radio" name="parliamo-academy-budget" checked={academyBudget === minutes} onChange={() => setAcademyBudget(minutes)} />
            {t("{minutes} minutes", { minutes })}
          </label>)}
        </fieldset>
        <div className={styles.recipe} role="status" data-academy-recipe>
          <p><strong>{t("{days} study days · {minutes} minutes in this sample", { days: selectedProgramme.days, minutes: recipe.total })}</strong></p>
          <ol>
            <li><span>Guided session</span><strong>{t("{minutes} min", { minutes: recipe.guided })}</strong></li>
            {recipe.workshops.map((minutes, index) => <li key={index}>
              <span>{t("Grammar workshop")} · {t(selectedProgramme.units[index] ?? selectedProgramme.units[0])}</span>
              <strong>{t("{minutes} min", { minutes })}</strong>
            </li>)}
            {recipe.tense > 0 ? <li><span>Tense check</span><strong>{t("{minutes} min", { minutes: recipe.tense })}</strong></li> : null}
            {recipe.companion > 0 ? <li><span>Page companion</span><strong>{t("{minutes} min", { minutes: recipe.companion })}</strong></li> : null}
          </ol>
          {recipe.waitingUnits > 0 ? <p>{t("{count} grammar unit waits for another session.", { count: recipe.waitingUnits })}</p> : null}
        </div>
        <p className={styles.note}>These are estimated time allocations. A study day can span several sessions; finishing a programme does not certify A2 proficiency.</p>
      </section>
      <section className={styles.paper} aria-labelledby="academy-grammar-title">
        <h3 id="academy-grammar-title">Try one grammar workshop</h3>
        <p>Complete an original A1 past-tense task from the portal. Compare a first answer, an answer after help and a later recall.</p>
        <p className={styles.note}>{t("Grammar sample · simulated day {day}", { day: grammar.day })}</p>
        <form onSubmit={event => { event.preventDefault(); setGrammar(checkGrammarSample(grammar)); }}>
          <label htmlFor="academy-grammar-answer" lang="it" translate="no">Noi ___ lavorato ieri.</label>
          <p>We worked yesterday. Write only the missing auxiliary verb.</p>
          <div className={styles.actions}>
            <input id="academy-grammar-answer" lang="it" aria-label="Missing Italian auxiliary" maxLength={500} value={grammar.answer} autoComplete="off" onChange={event => setGrammar({ ...grammar, answer: event.target.value })} />
            <MacButton type="submit" primary disabled={!grammar.answer.trim()}>Check grammar</MacButton>
            <MacButton aria-expanded={grammar.hintDay === grammar.day} aria-controls="academy-grammar-hint" onClick={() => setGrammar(hintGrammarSample(grammar))}>Show a grammar hint</MacButton>
          </div>
        </form>
        {grammar.hintDay === grammar.day ? <p id="academy-grammar-hint" className={styles.feedback}>Use the present-tense form of avere for noi. Keep lavorato unchanged. This attempt will be recorded as supported.</p> : null}
        <div className={styles.feedback} role="status">
          <p>{!currentGrammar
            ? "Try once, or use the hint. Both count as practice."
            : !currentGrammar.correct
              ? "Use abbiamo: noi takes this form of avere; lavorato stays unchanged. A correction will be recorded as supported."
              : currentGrammar.assisted
                ? "Correct with support. Your first attempt stays unchanged."
                : "Correct independently on this attempt."}</p>
          <dl className={styles.attemptLedger}>
            <div><dt>First answer</dt><dd>{t(grammarStatus(firstGrammar))}</dd></div>
            <div><dt>Latest checked answer</dt><dd>{t(grammarStatus(latestGrammar))}</dd></div>
          </dl>
        </div>
        <div className={styles.actions}>
          <MacButton disabled={!currentGrammar} onClick={() => setGrammar(nextGrammarSample(grammar))}>Recall on a later simulated day</MacButton>
          <MacButton onClick={() => setGrammar(newGrammarSample())}>Restart grammar sample</MacButton>
        </div>
        <p className={styles.note}>A supported or incorrect answer returns after one simulated day; an independent success returns after three. The new recall hides the previous answer and hint. This small sample gives no proficiency grade.</p>
      </section>
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
        <p>The live portal links 48 source PDFs and presentations to 36 missions, 28 grammar units and 224 varied exercises. Three study programmes offer supported A1, intensive preparation and grammar repair.</p>
        <p>It also offers personal word banks, tense checks and 936 page or slide companions. Some companions are reference guidance rather than exercises. Personal writing is self-checked; the preparation check is not a language certificate.</p>
        <p>Class files and learner data stay private. These portfolio samples use a few original tasks; the full portal contains the complete practice paths. Earlier downloadable workbooks remain supplementary practice.</p>
      </aside>
    </div>
  </DemoWindow></ProjectCopy>;
}
export default ItalianLearningStudio;
