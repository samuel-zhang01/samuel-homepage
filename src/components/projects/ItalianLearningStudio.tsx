"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./ItalianLearningStudio.module.css";

type StudioView = "practice" | "recall" | "rubric" | "evidence" | "system";
type PracticeMode = "daily" | "weak";
type ExerciseType = "mcq" | "input" | "reorder" | "listen" | "reading";
type Skill = "grammar" | "vocabulary" | "reading" | "listening" | "writing" | "speaking" | "interaction";

type Exercise = {
  id: string;
  skill: Skill;
  type: ExerciseType;
  promptIt: string;
  promptEn: string;
  answer: string;
  alternatives?: string[];
  options?: string[];
  tiles?: string[];
  passage?: string;
  explanationIt: string;
  explanationEn: string;
};

type Mastery = Record<Skill, { attempts: number; correct: number; bestMs: number }>;

type Card = {
  id: string;
  italian: string;
  english: string;
  topic: string;
  example: string;
  exampleEn: string;
};

type CardState = { interval: number; ease: number; reviews: number };

const SKILLS: readonly Skill[] = [
  "grammar",
  "vocabulary",
  "reading",
  "listening",
  "writing",
  "speaking",
  "interaction",
];

const SKILL_LABELS: Record<Skill, { it: string; en: string }> = {
  grammar: { it: "Grammatica", en: "Grammar" },
  vocabulary: { it: "Lessico", en: "Vocabulary" },
  reading: { it: "Lettura", en: "Reading" },
  listening: { it: "Ascolto", en: "Listening" },
  writing: { it: "Scrittura", en: "Writing" },
  speaking: { it: "Parlato", en: "Speaking" },
  interaction: { it: "Interazione", en: "Interaction" },
};

const INITIAL_MASTERY: Mastery = {
  grammar: { attempts: 8, correct: 5, bestMs: 6100 },
  vocabulary: { attempts: 10, correct: 8, bestMs: 4300 },
  reading: { attempts: 6, correct: 5, bestMs: 9400 },
  listening: { attempts: 5, correct: 2, bestMs: 12800 },
  writing: { attempts: 4, correct: 3, bestMs: 18500 },
  speaking: { attempts: 2, correct: 1, bestMs: 32000 },
  interaction: { attempts: 3, correct: 2, bestMs: 22000 },
};

const EXERCISES: readonly Exercise[] = [
  {
    id: "listen-train",
    skill: "listening",
    type: "listen",
    promptIt: "Ascolta e trascrivi la frase.",
    promptEn: "Listen and transcribe the sentence.",
    answer: "Il treno parte alle otto e mezza",
    alternatives: ["Il treno parte alle otto e mezza."],
    explanationIt: "Ora + mezza indica trenta minuti dopo l’ora.",
    explanationEn: "Ora + mezza means thirty minutes past the hour.",
  },
  {
    id: "grammar-nationality",
    skill: "grammar",
    type: "mcq",
    promptIt: "Completa: Maria è…",
    promptEn: "Complete the sentence: Maria is…",
    answer: "italiana",
    options: ["italiano", "italiana", "italiane"],
    explanationIt: "L’aggettivo di nazionalità concorda con la persona descritta.",
    explanationEn: "The nationality adjective agrees with the person described.",
  },
  {
    id: "vocab-reservation",
    skill: "vocabulary",
    type: "input",
    promptIt: "Scrivi in italiano: reservation / booking",
    promptEn: "Write the Italian word for reservation / booking.",
    answer: "la prenotazione",
    alternatives: ["prenotazione"],
    explanationIt: "La prenotazione è il sostantivo; prenotare è il verbo.",
    explanationEn: "La prenotazione is the noun; prenotare is the verb.",
  },
  {
    id: "reorder-hotel",
    skill: "interaction",
    type: "reorder",
    promptIt: "Costruisci una richiesta cortese per l’albergo.",
    promptEn: "Build a polite request for a hotel.",
    answer: "Vorrei prenotare una camera",
    tiles: ["una", "Vorrei", "camera", "prenotare"],
    explanationIt: "Vorrei + infinito rende la richiesta cortese e naturale.",
    explanationEn: "Vorrei + infinitive makes the request polite and natural.",
  },
  {
    id: "reading-cafe",
    skill: "reading",
    type: "reading",
    passage: "Il bar apre alle sette. La colazione costa quattro euro e comprende un caffè e un cornetto. La domenica il bar è chiuso.",
    promptIt: "Quando è chiuso il bar?",
    promptEn: "When is the café closed?",
    answer: "La domenica",
    options: ["Alle sette", "La domenica", "Dopo colazione"],
    explanationIt: "L’ultima frase contiene l’informazione richiesta.",
    explanationEn: "The final sentence contains the requested information.",
  },
  {
    id: "verb-andare",
    skill: "speaking",
    type: "input",
    promptIt: "Produci la forma: noi · andare",
    promptEn: "Produce the verb form: noi · andare.",
    answer: "andiamo",
    alternatives: ["noi andiamo"],
    explanationIt: "Andare è irregolare: vado, vai, va, andiamo, andate, vanno.",
    explanationEn: "Andare is irregular: vado, vai, va, andiamo, andate, vanno.",
  },
  {
    id: "writing-preposition",
    skill: "writing",
    type: "mcq",
    promptIt: "Completa: Vado ___ cinema.",
    promptEn: "Complete the sentence: I am going to the cinema.",
    answer: "al",
    options: ["a", "al", "nel", "dal"],
    explanationIt: "A + il si uniscono: a + il = al.",
    explanationEn: "A + il contract to form al.",
  },
];

const CARDS: readonly Card[] = [
  { id: "reservation", italian: "la prenotazione", english: "the booking", topic: "ALBERGO", example: "Vorrei confermare la prenotazione.", exampleEn: "I would like to confirm the booking." },
  { id: "wake", italian: "svegliarsi", english: "to wake up", topic: "ROUTINE", example: "Mi sveglio alle sette.", exampleEn: "I wake up at seven." },
  { id: "ticket", italian: "il biglietto", english: "the ticket", topic: "VIAGGIO", example: "Un biglietto per Firenze, per favore.", exampleEn: "A ticket to Florence, please." },
  { id: "near", italian: "vicino", english: "near / nearby", topic: "CITTÀ", example: "La stazione è vicino al museo.", exampleEn: "The station is near the museum." },
];

const INITIAL_CARD_STATE: Record<string, CardState> = {
  reservation: { interval: 3, ease: 2.4, reviews: 2 },
  wake: { interval: 0, ease: 2.5, reviews: 0 },
  ticket: { interval: 7, ease: 2.6, reviews: 4 },
  near: { interval: 1, ease: 2.3, reviews: 1 },
};

const EVIDENCE_LANES = [
  { id: "listening", it: "Ascolto", en: "Listening", target: "Gist + 3/4 details in two clear clips" },
  { id: "reading", it: "Lettura", en: "Reading", target: "Find 4/5 facts in a menu, timetable or notice" },
  { id: "interaction", it: "Interazione", en: "Spoken interaction", target: "Sustain a guided three-minute exchange" },
  { id: "production", it: "Produzione", en: "Spoken production", target: "Speak for 60–90 seconds without a script" },
  { id: "writing", it: "Scrittura", en: "Writing", target: "Write one clear message of 40–60 words" },
] as const;

const MAX_DEMO_EVIDENCE_ARTIFACTS = 2;

const INITIAL_RUBRIC_TEXT = "Mi chiamo Luca e abito a Torino. Studio italiano perché amo viaggiare.";
const RUBRIC_TARGET = "mi chiamo abito studio italiano perché viaggio viaggiare";

function normalise(value: string) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:“”’'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function accuracy(attempts: number, correct: number) {
  return attempts ? Math.round((correct / attempts) * 100) : 0;
}

function buildSession(mode: PracticeMode, mastery: Mastery, seed: number) {
  const rotated = [...EXERCISES.slice(seed % EXERCISES.length), ...EXERCISES.slice(0, seed % EXERCISES.length)];
  if (mode === "daily") return rotated.slice(0, 5).map((exercise) => exercise.id);
  return [...rotated]
    .sort((left, right) => {
      const leftScore = accuracy(mastery[left.skill].attempts, mastery[left.skill].correct);
      const rightScore = accuracy(mastery[right.skill].attempts, mastery[right.skill].correct);
      return leftScore - rightScore || left.id.localeCompare(right.id);
    })
    .slice(0, 5)
    .map((exercise) => exercise.id);
}

function words(value: string) {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFKD")
    .replace(/[^a-z0-9à-ü' ]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function localRubric(value: string) {
  const responseWords = words(value);
  const distinctResponseWords = [...new Set(responseWords)];
  const targetWords = new Set(words(RUBRIC_TARGET));
  const matches = distinctResponseWords.filter((word) => targetWords.has(word)).length;
  const lengthScore = Math.min(45, distinctResponseWords.length * 3);
  const overlapScore = Math.min(45, matches * 9);
  const punctuationScore = /[.!?]$/.test(value.trim()) ? 10 : 5;
  const score = Math.max(10, Math.min(95, lengthScore + overlapScore + punctuationScore));
  return {
    score,
    responseWords: responseWords.length,
    scoredWords: distinctResponseWords.length,
    matches,
    lengthScore,
    overlapScore,
    punctuationScore,
  };
}

function labelFor(skill: Skill, bilingual: boolean) {
  const label = SKILL_LABELS[skill];
  return bilingual ? `${label.it} · ${label.en}` : label.it;
}

function AppMenu({ active, setActive, bilingual }: { active: StudioView; setActive: (view: StudioView) => void; bilingual: boolean }) {
  const views: { id: StudioView; it: string; en: string; icon: string }[] = [
    { id: "practice", it: "Oggi", en: "Today", icon: "✎" },
    { id: "recall", it: "Richiamo", en: "Recall", icon: "▱" },
    { id: "rubric", it: "Rubrica", en: "Rubric", icon: "✓" },
    { id: "evidence", it: "Prove", en: "Evidence", icon: "▥" },
    { id: "system", it: "Sistema", en: "System", icon: "⌘" },
  ];

  return (
    <nav className={styles.appMenu} aria-label="Parliamo demonstration sections">
      {views.map((view) => (
        <button
          type="button"
          key={view.id}
          className={active === view.id ? styles.activeMenu : ""}
          aria-current={active === view.id ? "page" : undefined}
          onClick={() => setActive(view.id)}
        >
          <span aria-hidden="true">{view.icon}</span>
          <strong>{view.it}</strong>
          {bilingual ? <small lang="en-GB">{view.en}</small> : null}
        </button>
      ))}
    </nav>
  );
}

function PracticeLab({
  bilingual,
  mastery,
  setMastery,
  xp,
  setXp,
}: {
  bilingual: boolean;
  mastery: Mastery;
  setMastery: React.Dispatch<React.SetStateAction<Mastery>>;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [mode, setMode] = useState<PracticeMode>("daily");
  const [seed, setSeed] = useState(0);
  const [sessionIds, setSessionIds] = useState(() => buildSession("daily", INITIAL_MASTERY, 0));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [tiles, setTiles] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [score, setScore] = useState(0);
  const [lastMs, setLastMs] = useState(0);
  const started = useRef(Date.now());

  useEffect(() => {
    setSpeechAvailable(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);
  const session = sessionIds.map((id) => EXERCISES.find((exercise) => exercise.id === id)!).filter(Boolean);
  const finished = index >= session.length;
  const item = finished ? null : session[index];
  const weakest = [...SKILLS].sort((left, right) => {
    const a = mastery[left];
    const b = mastery[right];
    return accuracy(a.attempts, a.correct) - accuracy(b.attempts, b.correct);
  })[0];

  function begin(nextMode = mode) {
    const nextSeed = seed + 1;
    setMode(nextMode);
    setSeed(nextSeed);
    setSessionIds(buildSession(nextMode, mastery, nextSeed));
    setIndex(0);
    setAnswer("");
    setTiles([]);
    setResult(null);
    setScore(0);
    setLastMs(0);
    started.current = Date.now();
  }

  function selectMode(nextMode: PracticeMode) {
    setMode(nextMode);
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setSessionIds(buildSession(nextMode, mastery, nextSeed));
    setIndex(0);
    setAnswer("");
    setTiles([]);
    setResult(null);
    setScore(0);
    started.current = Date.now();
  }

  function submit() {
    if (!item || result !== null) return;
    const response = item.type === "reorder" ? tiles.join(" ") : answer;
    if (!response.trim()) return;
    const accepted = [item.answer, ...(item.alternatives ?? [])];
    const correct = accepted.some((candidate) => normalise(candidate) === normalise(response));
    const responseMs = Math.max(450, Date.now() - started.current);
    setLastMs(responseMs);
    setResult(correct);
    if (correct) setScore((value) => value + 1);
    setXp((value) => value + (correct ? 8 : 2));
    setMastery((current) => {
      const skill = current[item.skill];
      return {
        ...current,
        [item.skill]: {
          attempts: skill.attempts + 1,
          correct: skill.correct + (correct ? 1 : 0),
          bestMs: skill.bestMs ? Math.min(skill.bestMs, responseMs) : responseMs,
        },
      };
    });
  }

  function next() {
    setIndex((value) => value + 1);
    setAnswer("");
    setTiles([]);
    setResult(null);
    setLastMs(0);
    started.current = Date.now();
  }

  function listen() {
    if (!item || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.answer);
    utterance.lang = "it-IT";
    utterance.rate = 0.72;
    window.speechSynthesis.speak(utterance);
  }

  if (finished) {
    const sessionAccuracy = Math.round((score / Math.max(1, session.length)) * 100);
    return (
      <section className={styles.finishPanel} aria-live="polite">
        <div className={styles.finishDial} style={{ "--score": `${sessionAccuracy}%` } as React.CSSProperties}>
          <strong>{score}/{session.length}</strong>
          <span>{sessionAccuracy}%</span>
        </div>
        <div>
          <span className={styles.kicker}>SESSIONE COMPLETATA {bilingual ? "· SESSION COMPLETE" : ""}</span>
          <h3>{sessionAccuracy >= 80 ? "Ottimo lavoro." : "Gli errori preparano il prossimo ripasso."}</h3>
          {bilingual ? <p lang="en-GB">{sessionAccuracy >= 80 ? "Strong work—the learner map has been updated." : "Mistakes now shape the next adaptive review."}</p> : null}
          <div className={styles.nextSignal}>
            <span>{bilingual ? "NEXT ADAPTIVE SIGNAL" : "PROSSIMO SEGNALE"}</span>
            <strong>{labelFor(weakest, bilingual)} · {accuracy(mastery[weakest].attempts, mastery[weakest].correct)}%</strong>
          </div>
          <MacButton primary onClick={() => begin("weak")}>Nuova sessione adattiva {bilingual ? "· New adaptive session" : ""} →</MacButton>
        </div>
      </section>
    );
  }

  if (!item) return null;
  const response = item.type === "reorder" ? tiles.join(" ") : answer;
  const canSubmit = Boolean(response.trim());
  const currentStats = mastery[item.skill];

  return (
    <section className={styles.practiceLab}>
      <header className={styles.sectionIntro}>
        <div>
          <span className={styles.kicker}>OGGI / ADAPTIVE PRACTICE · {EXERCISES.length} REPRESENTATIVE VARIATIONS / 211 SOURCE EXERCISES</span>
          <h3>{bilingual ? "Misura con una prova, non con una sensazione." : "Misura con una prova."}</h3>
          <p lang={bilingual ? "en-GB" : "it"}>{bilingual ? "Each answer updates skill accuracy, response time and the next weak-area queue." : "Ogni risposta aggiorna abilità, tempo e prossima coda."}</p>
        </div>
        <div className={styles.xpBadge}><span>XP</span><strong>{xp}</strong></div>
      </header>

      <div className={styles.practiceControls}>
        <div role="group" aria-label="Session selection">
          <button type="button" aria-pressed={mode === "daily"} className={mode === "daily" ? styles.selected : ""} onClick={() => selectMode("daily")}>Mix quotidiano {bilingual ? "· Daily" : ""}</button>
          <button type="button" aria-pressed={mode === "weak"} className={mode === "weak" ? styles.selected : ""} onClick={() => selectMode("weak")}>Punti deboli {bilingual ? "· Weak areas" : ""}</button>
        </div>
        <span>{mode === "weak" ? `${labelFor(weakest, bilingual)} first` : "7 skills balanced"}</span>
      </div>

      <div className={styles.sessionProgress} aria-label={`Question ${index + 1} of ${session.length}`}>
        <strong>{String(index + 1).padStart(2, "0")} / {String(session.length).padStart(2, "0")}</strong>
        <span><i style={{ width: `${(index / session.length) * 100}%` }} /></span>
        <em>{score} {bilingual ? "correct" : "corrette"}</em>
      </div>

      <article className={styles.exerciseCard}>
        <div className={styles.exerciseMeta}>
          <span>{labelFor(item.skill, bilingual)}</span>
          <span>{item.type.toUpperCase()}</span>
          <span>{currentStats.attempts} attempts · {accuracy(currentStats.attempts, currentStats.correct)}%</span>
        </div>
        {item.passage ? <blockquote className={styles.passage}>{item.passage}</blockquote> : null}
        <span className={styles.taskLabel}>CONSEGNA {bilingual ? "· TASK" : ""}</span>
        <h4>{item.promptIt}</h4>
        {bilingual ? <p className={styles.translation} lang="en-GB">{item.promptEn}</p> : null}

        {item.type === "listen" ? (
          <button type="button" className={styles.listenButton} onClick={listen} disabled={!speechAvailable} aria-describedby={!speechAvailable ? "parliamo-speech-unavailable" : undefined}>
            <span aria-hidden="true">▶</span> Ascolta lentamente {bilingual ? "· Listen slowly" : ""}
          </button>
        ) : null}
        {item.type === "listen" && !speechAvailable ? <p id="parliamo-speech-unavailable" className={styles.speechUnavailable} role="status">Sintesi vocale non disponibile in questo browser. <span lang="en-GB">Speech synthesis is unavailable; type from the visible learning context or skip to another exercise.</span></p> : null}

        {item.type === "mcq" || item.type === "reading" ? (
          <div className={styles.options} role="group" aria-label={item.promptIt}>
            {item.options?.map((option) => {
              const correctOption = result !== null && normalise(option) === normalise(item.answer);
              const wrongOption = result === false && answer === option;
              return (
                <button
                  type="button"
                  aria-pressed={answer === option}
                  disabled={result !== null}
                  className={`${answer === option ? styles.optionSelected : ""} ${correctOption ? styles.optionCorrect : ""} ${wrongOption ? styles.optionWrong : ""}`}
                  key={option}
                  onClick={() => setAnswer(option)}
                >
                  <span aria-hidden="true">{answer === option ? "●" : "○"}</span>{option}
                </button>
              );
            })}
          </div>
        ) : null}

        {item.type === "input" || item.type === "listen" ? (
          <label className={styles.answerField}>
            <span className={styles.srOnly}>Your answer</span>
            <input
              value={answer}
              disabled={result !== null}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
              placeholder={bilingual ? "Scrivi qui · Type here" : "Scrivi qui…"}
              autoComplete="off"
            />
          </label>
        ) : null}

        {item.type === "reorder" ? (
          <div className={styles.reorderBoard}>
            <div className={styles.builtSentence} aria-label="Constructed sentence">
              {tiles.length ? tiles.map((tile, tileIndex) => (
                <button type="button" key={`${tile}-${tileIndex}`} disabled={result !== null} onClick={() => setTiles(tiles.filter((_, indexToKeep) => indexToKeep !== tileIndex))}>{tile}</button>
              )) : <span>{bilingual ? "Tap the tiles to build the sentence." : "Tocca le tessere per costruire la frase."}</span>}
            </div>
            <div className={styles.wordTiles}>
              {item.tiles?.map((tile, tileIndex) => {
                const used = tiles.filter((value) => value === tile).length >= (item.tiles?.filter((value) => value === tile).length ?? 0);
                return <button type="button" key={`${tile}-${tileIndex}`} disabled={used || result !== null} onClick={() => setTiles([...tiles, tile])}>{tile}</button>;
              })}
            </div>
          </div>
        ) : null}

        {result === null ? (
          <MacButton primary disabled={!canSubmit} onClick={submit}>Controlla {bilingual ? "· Check" : ""} →</MacButton>
        ) : (
          <div className={`${styles.practiceFeedback} ${result ? styles.feedbackGood : styles.feedbackBad}`} role="status" aria-live="polite">
            <div>
              <strong>{result ? `✓ Esatto${bilingual ? " · Correct" : ""}` : `× Non ancora${bilingual ? " · Not yet" : ""}`}</strong>
              <span>+{result ? 8 : 2} XP · {(lastMs / 1000).toFixed(1)}s</span>
            </div>
            <p>{item.explanationIt}</p>
            {bilingual ? <small lang="en-GB">{item.explanationEn}</small> : null}
            {!result ? <code>{item.answer}</code> : null}
            <MacButton primary onClick={next}>{index === session.length - 1 ? (bilingual ? "Risultato · Result" : "Risultato") : (bilingual ? "Prossimo · Next" : "Prossimo")} →</MacButton>
          </div>
        )}
      </article>
    </section>
  );
}

function RecallLab({ bilingual, xp, setXp }: { bilingual: boolean; xp: number; setXp: React.Dispatch<React.SetStateAction<number>> }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardState, setCardState] = useState<Record<string, CardState>>(INITIAL_CARD_STATE);
  const [lastCalculation, setLastCalculation] = useState<{ label: string; oldInterval: number; interval: number; oldEase: number; ease: number; xp: number } | null>(null);
  const card = CARDS[cardIndex % CARDS.length];
  const state = cardState[card.id];
  const ratings = [
    { it: "Di nuovo", en: "Again", quality: 0 },
    { it: "Difficile", en: "Hard", quality: 1 },
    { it: "Bene", en: "Good", quality: 2 },
    { it: "Facile", en: "Easy", quality: 3 },
  ] as const;

  function rate(label: string, quality: number) {
    const intervals = [
      0,
      1,
      Math.max(3, Math.round(state.interval * 1.8)),
      Math.max(7, Math.round(state.interval * 2.5)),
    ];
    const interval = intervals[quality];
    const ease = Math.max(1.3, Number((state.ease + (quality - 1.5) * 0.1).toFixed(2)));
    const awardedXp = [1, 2, 4, 6][quality];
    setCardState((current) => ({ ...current, [card.id]: { interval, ease, reviews: state.reviews + 1 } }));
    setLastCalculation({ label, oldInterval: state.interval, interval, oldEase: state.ease, ease, xp: awardedXp });
    setXp((value) => value + awardedXp);
    setFlipped(false);
    setCardIndex((value) => (value + 1) % CARDS.length);
  }

  return (
    <section className={styles.recallLab}>
      <header className={styles.sectionIntro}>
        <div>
          <span className={styles.kicker}>RICHIAMO DISTANZIATO · DUE QUEUE</span>
          <h3>Richiama prima di girare.</h3>
          <p>{bilingual ? "Ratings schedule the next review; misses return immediately and successful cards wait longer." : "La valutazione calcola la prossima scadenza."}</p>
        </div>
        <div className={styles.deckCount}><strong>{CARDS.length}</strong><span>{bilingual ? "synthetic cards" : "carte sintetiche"}</span></div>
      </header>

      <div className={styles.recallGrid}>
        <aside className={styles.deckStats}>
          <div><span>{bilingual ? "QUEUE" : "CODA"}</span><strong>{cardIndex + 1}/{CARDS.length}</strong></div>
          <div><span>{bilingual ? "INTERVAL" : "INTERVALLO"}</span><strong>{state.interval}d</strong></div>
          <div><span>EASE</span><strong>{state.ease.toFixed(2)}</strong></div>
          <div><span>{bilingual ? "REVIEWS" : "RIPASSI"}</span><strong>{state.reviews}</strong></div>
          <small>{bilingual ? "The demo uses the source project’s exact four-way interval update." : "Il demo usa l’algoritmo originale a quattro esiti."}</small>
        </aside>

        <div className={styles.cardWorkbench}>
          <button type="button" className={`${styles.flashcard} ${flipped ? styles.cardFlipped : ""}`} onClick={() => setFlipped((value) => !value)} aria-pressed={flipped}>
            <span>{card.topic}</span>
            {!flipped ? (
              <><small>ITALIANO</small><strong lang="it">{card.italian}</strong><em>{bilingual ? "Click to reveal · Clicca per girare" : "Clicca per girare"}</em></>
            ) : (
              <><small lang="en-GB">ENGLISH</small><strong lang="en-GB">{card.english}</strong><span className={styles.cardExample}><b lang="it">{card.example}</b>{bilingual ? <span lang="en-GB">{card.exampleEn}</span> : null}</span></>
            )}
          </button>
          <div className={styles.ratings}>
            {ratings.map((rating) => (
              <button type="button" key={rating.it} disabled={!flipped} onClick={() => rate(`${rating.it}${bilingual ? ` · ${rating.en}` : ""}`, rating.quality)}>
                <strong>{rating.it}</strong>{bilingual ? <small lang="en-GB">{rating.en}</small> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.algorithmTrace} aria-live="polite">
        <div className={styles.traceIcon} aria-hidden="true">ƒ</div>
        {lastCalculation ? (
          <div>
            <span>LAST SCHEDULER TRACE · {lastCalculation.label}</span>
            <strong>{lastCalculation.oldInterval}d → {lastCalculation.interval}d <i>·</i> ease {lastCalculation.oldEase.toFixed(2)} → {lastCalculation.ease.toFixed(2)} <i>·</i> +{lastCalculation.xp} XP</strong>
            <code>interval[q] = [0, 1, max(3, round(i×1.8)), max(7, round(i×2.5))]</code>
          </div>
        ) : (
          <div><span>SCHEDULER READY</span><strong>{bilingual ? "Reveal the answer, then choose an honest recall quality." : "Gira la carta, poi valuta il richiamo."}</strong><code>ease′ = max(1.3, ease + (quality − 1.5) × 0.1)</code></div>
        )}
        <span className={styles.traceXp}>{xp} XP</span>
      </div>
    </section>
  );
}

function RubricLab({ bilingual }: { bilingual: boolean }) {
  const [draft, setDraft] = useState(INITIAL_RUBRIC_TEXT);
  const [assessed, setAssessed] = useState(INITIAL_RUBRIC_TEXT);
  const report = useMemo(() => localRubric(assessed), [assessed]);
  const dirty = draft !== assessed;
  const summary = report.score >= 70
    ? "Buona copertura del compito: sono presenti più segnali distinti."
    : "Hai iniziato bene; aggiungi più segnali distinti del compito.";

  return (
    <section className={styles.rubricLab}>
      <header className={styles.sectionIntro}>
        <div>
          <span className={styles.kicker}>RUBRICA LOCALE · ZERO API CALLS</span>
          <h3>Feedback spiegabile, parola per parola.</h3>
          <p>{bilingual ? "This browser-safe refinement of the source fallback scores distinct useful words, one contribution per task signal and sentence completion—so repetition cannot inflate the result." : "Questa versione sicura della rubrica conta parole distinte, ogni segnale una sola volta e il completamento: le ripetizioni non alzano il risultato."}</p>
        </div>
        <span className={styles.localBadge}>● LOCAL-ONLY</span>
      </header>

      <div className={styles.rubricGrid}>
        <div className={styles.writingPanel}>
          <div className={styles.promptCard}>
            <span>COMPITO {bilingual ? "· TASK" : ""}</span>
            <strong>Presentati in almeno due frasi. Spiega dove vivi, cosa studi e perché impari l’italiano.</strong>
            {bilingual ? <small>Introduce yourself in at least two sentences. Say where you live, what you study and why you learn Italian.</small> : null}
          </div>
          <label>
            <span><strong>RISPOSTA</strong><em>{words(draft).length} words · {draft.length} chars</em></span>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck="true" />
          </label>
          <div className={styles.sampleActions}>
            <MacButton onClick={() => setDraft("Studio italiano")}>Short sample</MacButton>
            <MacButton onClick={() => setDraft(INITIAL_RUBRIC_TEXT)}>Strong sample</MacButton>
            <MacButton primary disabled={!dirty || !draft.trim()} onClick={() => setAssessed(draft)}>Valuta localmente {bilingual ? "· Review" : ""}</MacButton>
          </div>
        </div>

        <div className={styles.rubricReport} aria-live="polite">
          <div className={styles.rubricScore} style={{ "--score": `${report.score}%` } as React.CSSProperties} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={report.score} aria-label="Local rubric score">
            <strong>{report.score}</strong><span>/100</span>
          </div>
          <div className={styles.breakdown}>
            <div><span>Distinct useful words</span><strong>{report.lengthScore}/45</strong><i><b style={{ width: `${(report.lengthScore / 45) * 100}%` }} /></i><small>min(45, {report.scoredWords} unique tokens × 3)</small></div>
            <div><span>Distinct task overlap</span><strong>{report.overlapScore}/45</strong><i><b style={{ width: `${(report.overlapScore / 45) * 100}%` }} /></i><small>min(45, {report.matches} unique signals × 9)</small></div>
            <div><span>Completion</span><strong>{report.punctuationScore}/10</strong><i><b style={{ width: `${report.punctuationScore * 10}%` }} /></i><small>{report.punctuationScore === 10 ? "Terminal punctuation found" : "Add a finished sentence"}</small></div>
          </div>
          <div className={`${styles.tutorNote} ${report.score >= 70 ? styles.tutorGood : ""}`}>
            <span>FEEDBACK RUBRICA LOCALE</span>
            <strong>{summary}</strong>
            {bilingual ? <p>{report.score >= 70 ? "This heuristic found distinct task signals; it does not judge grammar, clarity or language level." : "Add distinct task signals, then revise for grammar and clarity separately."}</p> : null}
            <small>Next: riscrivi una volta senza guardare, poi leggila ad alta voce.</small>
          </div>
        </div>
      </div>

      <aside className={styles.rubricCaveat} role="note">
        <span aria-hidden="true">i</span>
        <p><strong>Transparent fallback, not a language certificate.</strong> This public reconstruction hardens the source heuristic by capping every repeated token and target signal at one scoring contribution. The production portal can optionally request richer feedback, while local mode works without a key or metered service.</p>
      </aside>
    </section>
  );
}

function EvidenceLab({ bilingual, mastery }: { bilingual: boolean; mastery: Mastery }) {
  const [laneIndex, setLaneIndex] = useState(2);
  const [artifacts, setArtifacts] = useState(MAX_DEMO_EVIDENCE_ARTIFACTS);
  const [gap, setGap] = useState(4);
  const lane = EVIDENCE_LANES[laneIndex];
  const independentReady = artifacts >= 2 && gap >= 7;
  const status = artifacts === 0 ? "NOT YET" : independentReady ? "INDEPENDENT" : "SUPPORTED";
  const meanAccuracy = Math.round(SKILLS.reduce((total, skill) => total + accuracy(mastery[skill].attempts, mastery[skill].correct), 0) / SKILLS.length);

  return (
    <section className={styles.evidenceLab}>
      <header className={styles.sectionIntro}>
        <div>
          <span className={styles.kicker}>PROVE, NON SOLO PERCENTUALI · FIVE SEPARATE LANES</span>
          <h3>A1 dimostrato; A2 solo come ponte.</h3>
          <p>{bilingual ? "Plan completion, practice accuracy and dated CEFR artifacts stay separate. No single number pretends to be a level." : "Piano, precisione e prove CEFR restano separati."}</p>
        </div>
        <div className={styles.meanBadge}><span>PRACTICE MEAN</span><strong>{meanAccuracy}%</strong><small>not a CEFR score</small></div>
      </header>

      <div className={styles.evidenceGrid}>
        <nav className={styles.laneList} aria-label="CEFR evidence lanes">
          {EVIDENCE_LANES.map((item, index) => (
            <button type="button" key={item.id} aria-pressed={laneIndex === index} className={laneIndex === index ? styles.activeLane : ""} onClick={() => setLaneIndex(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.it}</strong>
              {bilingual ? <small lang="en-GB">{item.en}</small> : null}
              <i style={{ width: `${[58, 74, 62, 47, 81][index]}%` }} />
            </button>
          ))}
        </nav>

        <article className={styles.evidenceWorkbench}>
          <div className={styles.laneHeading}>
            <div><span lang="en-GB">A1 EXIT TARGET</span><h4>{lane.it}{bilingual ? <small lang="en-GB"> · {lane.en}</small> : null}</h4><p lang="en-GB">{lane.target}</p></div>
            <span className={`${styles.evidenceStatus} ${independentReady ? styles.independent : ""}`}>{status}</span>
          </div>

          <div className={styles.artifactControls}>
            <fieldset>
              <legend>DATED ARTIFACTS · MAX {MAX_DEMO_EVIDENCE_ARTIFACTS}</legend>
              {Array.from({ length: MAX_DEMO_EVIDENCE_ARTIFACTS + 1 }, (_, count) => count).map((count) => <button type="button" key={count} aria-pressed={artifacts === count} className={artifacts === count ? styles.selected : ""} onClick={() => setArtifacts(count)}>{count}</button>)}
            </fieldset>
            <label>
              <span><strong>SPACING</strong><em>{gap} days</em></span>
              <input type="range" min="0" max="14" value={gap} onChange={(event) => setGap(Number(event.target.value))} disabled={artifacts < 2} />
              <small>0 <i>required ≥ 7 days</i> 14</small>
            </label>
          </div>

          <div className={styles.evidenceTimeline} aria-label={`${artifacts} evidence artifacts spaced ${gap} days apart`}>
            <span className={artifacts >= 1 ? styles.timelineActive : ""}><b>01</b><i /><small>Unscripted sample</small></span>
            <div><i style={{ width: `${artifacts >= 2 ? Math.min(100, (gap / 7) * 100) : 0}%` }} /><strong>{artifacts < 2 ? "add second artifact" : `${gap} day gap`}</strong></div>
            <span className={artifacts >= 2 ? styles.timelineActive : ""}><b>02</b><i /><small>Delayed evidence</small></span>
          </div>

          <div className={`${styles.unlockNote} ${independentReady ? styles.unlocked : ""}`} role="status" aria-live="polite">
            <span aria-hidden="true">{independentReady ? "✓" : "⌛"}</span>
            <div>
              <strong>{independentReady ? "Independent unlocked" : "Independent remains locked"}</strong>
              <p>{independentReady ? "Two artifacts are separated by at least seven days." : artifacts < 2 ? "Add a second dated artifact." : `${7 - gap} more day${7 - gap === 1 ? "" : "s"} of spacing required.`}</p>
            </div>
          </div>
        </article>
      </div>

      <div className={styles.skillTelemetry}>
        {SKILLS.map((skill) => {
          const stats = mastery[skill];
          const percentage = accuracy(stats.attempts, stats.correct);
          return <div key={skill}><span>{SKILL_LABELS[skill].it}</span><i><b style={{ width: `${percentage}%` }} /></i><strong>{percentage}%</strong><small>{stats.attempts} checks</small></div>;
        })}
      </div>
    </section>
  );
}

function SystemLab({ bilingual }: { bilingual: boolean }) {
  const [injectConflict, setInjectConflict] = useState(true);
  const [stage, setStage] = useState<"idle" | "conflict" | "synced">("idle");
  const [localRevision, setLocalRevision] = useState(12);
  const [serverRevision, setServerRevision] = useState(12);
  const [log, setLog] = useState<string[]>(["Offline cache hydrated · revision 12", "D1 snapshot received · revision 12"]);

  function runSync() {
    if (stage === "idle" && injectConflict) {
      setServerRevision(13);
      setStage("conflict");
      setLog((current) => [...current, "PUT expected=12 → 409 revision_conflict", "Server state returned · revision 13"]);
      return;
    }
    if (stage === "idle") {
      setLocalRevision(13);
      setServerRevision(13);
      setStage("synced");
      setLog((current) => [...current, "PUT expected=12 → 200", "Snapshot committed · revision 13"]);
      return;
    }
    if (stage === "conflict") {
      setLocalRevision(14);
      setServerRevision(14);
      setStage("synced");
      setLog((current) => [...current, "Rebase local mutation onto revision 13", "Retry expected=13 → 200 · revision 14"]);
    }
  }

  function resetSync() {
    setStage("idle");
    setLocalRevision(12);
    setServerRevision(12);
    setLog(["Offline cache hydrated · revision 12", "D1 snapshot received · revision 12"]);
  }

  return (
    <section className={styles.systemLab}>
      <header className={styles.sectionIntro}>
        <div>
          <span className={styles.kicker}>LOCAL-FIRST APPLICATION · OPTIMISTIC REVISION CONTROL</span>
          <h3>A real curriculum engine, not a static lesson page.</h3>
          <p>{bilingual ? "The source application keeps structured content, learner state, practice events and rubric submissions in Cloudflare D1, with a browser cache for offline continuity." : "Contenuti, stato, eventi e feedback sono strutturati in D1 con cache locale."}</p>
        </div>
        <span className={styles.localBadge}>753 SEEDED ROWS</span>
      </header>

      <div className={styles.architecture} aria-label="Application architecture">
        <div><span className={styles.archIcon}>▣</span><strong>React 19 client</strong><small>tour · practice · analytics</small></div>
        <i aria-hidden="true">⇄</i>
        <div><span className={styles.archIcon}>↯</span><strong>Vinext worker</strong><small>RSC · API routes · assets</small></div>
        <i aria-hidden="true">⇄</i>
        <div><span className={styles.archIcon}>▤</span><strong>Cloudflare D1</strong><small>4 relational tables</small></div>
        <i aria-hidden="true">↕</i>
        <div><span className={styles.archIcon}>⌂</span><strong>Offline cache</strong><small>dirty flag · local snapshot</small></div>
      </div>

      <div className={styles.systemMetrics}>
        <div><strong>56</strong><span>dated plan days</span></div>
        <div><strong>28</strong><span>lesson hubs</span></div>
        <div><strong>211</strong><span>seed exercises</span></div>
        <div><strong>360</strong><span>vocabulary records</span></div>
        <div><strong>5,070</strong><span>planned minutes</span></div>
      </div>

      <div className={styles.syncWorkbench}>
        <div className={styles.revisionDiagram}>
          <div><span>LOCAL</span><strong>r{localRevision}</strong><small>{stage === "conflict" ? "mutation waiting" : stage === "synced" ? "confirmed" : "one mutation queued"}</small></div>
          <div className={`${styles.syncArrow} ${stage === "conflict" ? styles.arrowConflict : stage === "synced" ? styles.arrowDone : ""}`}><span>{stage === "conflict" ? "409" : stage === "synced" ? "200" : "PUT"}</span><i>→</i></div>
          <div><span>SERVER</span><strong>r{serverRevision}</strong><small>D1 learner_state</small></div>
        </div>

        <div className={styles.syncControls}>
          <label><input type="checkbox" checked={injectConflict} disabled={stage !== "idle"} onChange={(event) => setInjectConflict(event.target.checked)} /><span><strong>Inject concurrent write</strong><small>Simulate another tab reaching revision 13 first</small></span></label>
          <div>
            <MacButton primary disabled={stage === "synced"} onClick={runSync}>{stage === "conflict" ? "Rebase & retry" : stage === "synced" ? "Synchronised" : "Run offline sync"} →</MacButton>
            <MacButton onClick={resetSync}>Reset trace</MacButton>
          </div>
        </div>

        <ol className={styles.syncLog} aria-live="polite">
          {log.map((entry, index) => <li key={`${entry}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><code>{entry}</code></li>)}
        </ol>
      </div>

      <aside className={styles.privacyNote} role="note">
        <span aria-hidden="true">⌾</span><div><strong>Portfolio-safe reconstruction</strong><p>All learner answers and state shown here are synthetic. The original private archive, local backups and personal study history are not shipped with this demonstration.</p></div>
      </aside>
    </section>
  );
}

export function ItalianLearningStudio() {
  const [view, setView] = useState<StudioView>("practice");
  const [bilingual, setBilingual] = useState(true);
  const [mastery, setMastery] = useState<Mastery>(INITIAL_MASTERY);
  const [xp, setXp] = useState(184);
  const [resetVersion, setResetVersion] = useState(0);

  function resetDemo() {
    setMastery(INITIAL_MASTERY);
    setXp(184);
    setView("practice");
    setResetVersion((value) => value + 1);
  }

  return (
    <DemoWindow
      appName="Parliamo! 7"
      title="Local-first Italian Learning Studio"
      status="SYNTHETIC LEARNER · LOCAL"
      statusTone="safe"
      className={styles.studioWindow}
      footer={
        <>
          <span>56 DAYS · 28 HUBS · 7 SKILLS · 753 CONTENT ROWS</span>
          <span>PRIVATE SOURCE DATA EXCLUDED</span>
        </>
      }
    >
      <div className={styles.studio} lang="it">
        <div className={styles.utilityBar}>
          <div><span className={styles.flagMark} aria-hidden="true"><i /><i /><i /></span><strong>PARLIAMO!</strong><small lang="en-GB">A1 CONSOLIDATION ENGINE</small></div>
          <div>
            <button type="button" className={styles.languageToggle} aria-pressed={bilingual} onClick={() => setBilingual((value) => !value)}>
              <span>{bilingual ? "IT + EN" : "IT"}</span>
              <strong>{bilingual ? "Bilingual" : "Immersion"}</strong>
            </button>
            <button type="button" className={styles.resetButton} onClick={resetDemo}>↺ Reset</button>
          </div>
        </div>
        <AppMenu active={view} setActive={setView} bilingual={bilingual} />
        <div className={styles.viewPanel} key={resetVersion}>
          {view === "practice" ? <PracticeLab bilingual={bilingual} mastery={mastery} setMastery={setMastery} xp={xp} setXp={setXp} /> : null}
          {view === "recall" ? <RecallLab bilingual={bilingual} xp={xp} setXp={setXp} /> : null}
          {view === "rubric" ? <RubricLab bilingual={bilingual} /> : null}
          {view === "evidence" ? <EvidenceLab bilingual={bilingual} mastery={mastery} /> : null}
          {view === "system" ? <SystemLab bilingual={bilingual} /> : null}
        </div>
      </div>
    </DemoWindow>
  );
}

export default ItalianLearningStudio;
