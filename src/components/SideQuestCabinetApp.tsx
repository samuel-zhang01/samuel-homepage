"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./SideQuestCabinetApp.module.css";
import { localizeSideQuestTree } from "./sideQuestI18n";

type PanelId = "day" | "rules" | "people" | "build";
type BuildView = "evidence" | "question" | "live";
type ReplayState = "idle" | "live" | "finished";
type ChallengeState = "draft" | "sent" | "accepted" | "declined";

const panels: Array<{ id: PanelId; label: string; index: string }> = [
  { id: "day", label: "The day", index: "01" },
  { id: "rules", label: "Rules & score", index: "02" },
  { id: "people", label: "People & atmosphere", index: "03" },
  { id: "build", label: "What we shipped", index: "04" },
];

const dayMoments = [
  ["MORNING", "A 5K before the hackathon", "Samuel finished a RunThrough 5K in Regent’s Park with Axel Ehrnrooth, Yasmin Akhmedova and Thiruvikraman Anand, then crossed London for a second start line."],
  ["10:30", "The track opened", "More than 100 runners and builders gathered at London Stadium Community Track. There was a DJ, live commentary, food, recovery space and a lot of weather moving in."],
  ["12:30", "Run and build", "The five-and-a-half-hour relay began. Only the teammate out on the 400-metre loop could direct the build; stop running and the event rules required the build to stop too."],
  ["15:00", "Mid-race checkpoint", "Ideas, context and sore legs changed hands. Samuel, Javiera Rubio and Andrés Daniel Godoy Ortiz kept SideQuest moving through phone dictation and repeated handovers."],
  ["17:54", "The last event-day commit", "The sixth hackathon commit landed at 17:54 London time—roughly six minutes before hands-in. The source history makes the deadline visible."],
  ["18:00", "Hands off", "The run/build window closed. Over the next hour, judges chose the final five; at 19:00 each finalist had five minutes and one screen."],
  ["RESULT", "Second place", "After 44 additional team kilometres in the rain, SideQuest placed second. The prize mattered; the people and the strange electricity of the day mattered more."],
] as const;

const teammates = [
  ["SZ", "Samuel Zhang", "Arrived after a morning 5K and kept building through the rain-soaked relay."],
  ["JR", "Javiera Rubio", "Flew in from Milan, supplied the owner-scoped Strava data and applied the necessary peer pressure to join."],
  ["AG", "Andrés Daniel Godoy Ortiz", "Joined without hesitation and became the namesake of SideQuest’s evidence-to-challenge agent."],
] as const;

const judgingCriteria = [
  ["problem", "Problem", "Problem & customer need", 5, "Was the need real, specific and worth solving?"],
  ["originality", "Originality ×2", "Fun, insight & originality", 10, "The only double-weighted criterion. A surprising rough build could beat a predictable polished dashboard."],
  ["solution", "Solution", "Solution, product & competition", 5, "Did the product make sense, and did the team understand what already existed?"],
  ["upside", "Potential", "Potential & upside", 5, "Could this idea grow into something people would keep using?"],
  ["execution", "Execution", "Execution & working demo", 5, "Did the thing actually work after five and a half hours on the move?"],
  ["pitch", "Pitch", "Pitch", 5, "Could the team make the product legible in a five-minute trackside presentation?"],
] as const;

const schedule = [
  ["10:30", "Doors & check-in"], ["11:30", "Briefing & warm-up"],
  ["12:30", "Run/build starts"], ["15:00", "Checkpoint"],
  ["17:30", "Thirty-minute warning"], ["18:00", "Hands-in"],
  ["19:00", "Final pitches"], ["≈20:00", "Winners"],
] as const;

const creditGroups = {
  team: ["Team SideQuest", "Three people, one moving keyboard", "Samuel Zhang, Javiera Rubio and Andrés Daniel Godoy Ortiz relayed both the running and the product context. The build only progressed while one of them was moving.", ["Samuel Zhang", "Javiera Rubio", "Andrés Daniel Godoy Ortiz"]],
  makers: ["Event makers", "An experiment turned into a community", "Tijs Nieuwboer first tried building while running the previous October. The London event was made on the move by Tijs, Siena Kinsale, Luke Balabanovic, Rachel Macnaghten, Abdelaziz ‘Zizou’ Brahmi and Aruzhan N., with Elliott Callender and the crew keeping the day moving.", ["Tijs", "Siena", "Luke", "Rachel", "Zizou", "Aruzhan", "Elliott + crew"]],
  community: ["Community", "The part worth remembering", "A loud DJ, constant laps, soaked clothes, founders swapping ideas and an unusually high concentration of people willing to try something unreasonable. Samuel left with more energy than he arrived with; his legs reported a different result.", ["100+ runners & builders", "London startup community", "Rain, music & handovers"]],
  backers: ["Backers", "Tools around the loop", "The event mixed voice, cloud agents, tracking, connectivity, wellness and go-to-market tools. Their role was to make an unusual format possible—not to become the main story.", ["Cognition", "Healf", "ElevenLabs", "Wispr Flow", "ROXFIT", "Deepline", "Tavily", "Thrad", "O2 + more"]],
} as const;

const challengeOptions = {
  effort: ["Fill the effort gap", "Does an easy conversational run still feel easy when effort is recorded straight afterwards?", "Run 30 minutes at conversational effort, then record RPE within five minutes.", "One completed run plus one fresh perceived-effort observation."],
  pacing: ["Test pace stability", "Can the next controlled kilometre stay even without chasing a personal best?", "Run one controlled kilometre inside a 10-second pace band.", "Finish inside the band without overriding the safety stop."],
  consistency: ["Protect consistency", "Would a deliberately short run make the next week easier to sustain?", "Complete a 20-minute easy run and note whether another feels realistic in 48 hours.", "The observation is recorded; speed is not scored."],
} as const;

const loopSteps = ["Observe", "Estimate", "Ask", "Intervene", "Rally", "Reassess"] as const;
const loopDetails = [
  "Import aggregate Strava evidence or finish a validated GPS session.",
  "Compare recent and baseline windows while stating coverage and missing fields.",
  "Turn uncertainty into a measurable question, never a diagnosis.",
  "Propose one bounded run with a success measure and explicit safety stop.",
  "Send the challenge to a friend; pledges are commitments, not payments.",
  "Store the outcome as new evidence and run the loop again.",
] as const;

const cheersByLocale: Record<Locale, readonly string[]> = {
  "en-GB": ["GO!", "NICE", "+", "!"],
  "en-US": ["GO!", "NICE", "+", "!"],
  "zh-CN": ["加油", "好棒", "+", "!"],
  "zh-TW": ["加油", "好棒", "+", "!"],
};
const routePoints = [[8,70],[13,62],[20,65],[25,54],[33,49],[39,53],[46,41],[53,44],[58,34],[66,28],[73,32],[79,22],[88,26],[92,16]] as const;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function formatPace(totalMinutes: number, distance: number) {
  if (!Number.isFinite(totalMinutes) || !Number.isFinite(distance) || distance <= 0) return "—";
  const paceSeconds = Math.round((totalMinutes * 60) / distance);
  return `${Math.floor(paceSeconds / 60)}:${String(paceSeconds % 60).padStart(2, "0")} /km`;
}

function ChapterHeading({ chapter, title, intro }: { chapter: string; title: string; intro: string }) {
  return <div className={styles.chapterHeading}><div><span>{chapter}</span><h2>{title}</h2></div><p>{intro}</p></div>;
}

function DayPanel({ locale }: { locale: Locale }) {
  const [dayMoment, setDayMoment] = useState(2);
  const moment = dayMoments[dayMoment];

  return <>{localizeSideQuestTree(locale, <>
    <ChapterHeading chapter="CHAPTER 01 · ON THE TRACK" title="One very long Saturday" intro="The product is the artefact. The relay, the constraint and the people are the story." />
    <div className={styles.dayGrid}>
      <article className={styles.timelineCard}>
        <div className={styles.cardLabel}><span>FIELD LOG</span><strong>{moment[0]}</strong></div>
        <div className={styles.timeline} aria-label="Running Hackathon timeline">
          {dayMoments.map((item, index) => <button key={`${item[0]}-${item[1]}`} type="button" className={dayMoment === index ? styles.isActive : ""} aria-pressed={dayMoment === index} aria-label={`${item[0]}: ${item[1]}`} onClick={() => setDayMoment(index)}><i aria-hidden="true" /><span>{item[0]}</span></button>)}
        </div>
        <div className={styles.momentDetail} aria-live="polite">
          <span>{String(dayMoment + 1).padStart(2, "0")} / {String(dayMoments.length).padStart(2, "0")}</span>
          <div><h3>{moment[1]}</h3><p>{moment[2]}</p></div>
        </div>
      </article>
      <figure className={styles.portraitCard}>
        <Image src="/hackathons/runhack/samuel-rain-lap.jpg" alt="Samuel smiling and making a peace sign while moving on the wet track beneath the ArcelorMittal Orbit." width={1024} height={1536} sizes="(max-width: 760px) 100vw, 34vw" />
        <figcaption><span>RAIN LAP · LONDON STADIUM</span><blockquote>“I left with far more energy than I arrived with, despite my legs strongly disagreeing.”</blockquote></figcaption>
      </figure>
    </div>
    <div className={styles.ruleBanner}><span>THE PREMISE</span><strong>At 12:30, the runner became the only builder.</strong><p>Teams of three relayed around the loop. One teammate ran; that runner directed the build. Handover the lap, handover the keyboard.</p></div>
    <div className={styles.fieldNotes}>
      <article><span>01 · BEFORE</span><h3>A race before a race</h3><p>The day started with 5K in Regent&apos;s Park, not a quiet breakfast and an open laptop.</p></article>
      <article><span>02 · DURING</span><h3>Voice became the interface</h3><p>The team dictated into phones, relayed context and kept moving while rain filled the track.</p></article>
      <article><span>03 · AROUND IT</span><h3>Music, founders, puddles</h3><p>A brilliant DJ and an improbable group of builders turned physical fatigue into communal momentum.</p></article>
      <article><span>04 · AFTER</span><h3>Something real by sundown</h3><p>Six event-day commits, one working social running app and a second-place finish.</p></article>
    </div>
  </>)}</>;
}

function RulesPanel({ locale }: { locale: Locale }) {
  const [activeRunner, setActiveRunner] = useState(0);
  const [runnerMoving, setRunnerMoving] = useState(true);
  const [buildScore, setBuildScore] = useState(30);
  const [teamDistance, setTeamDistance] = useState(50);
  const [criterionId, setCriterionId] = useState<(typeof judgingCriteria)[number][0]>("originality");
  const criterion = useMemo(() => judgingCriteria.find((item) => item[0] === criterionId) ?? judgingCriteria[1], [criterionId]);
  const finalScore = buildScore + teamDistance / 2;
  const handOff = () => { setActiveRunner((current) => (current + 1) % teammates.length); setRunnerMoving(true); };

  return <>{localizeSideQuestTree(locale, <>
    <ChapterHeading chapter="CHAPTER 02 · THE MECHANIC" title="Your agents only run when you do" intro="Originality mattered twice. Distance was not decoration; it was part of the score." />
    <div className={styles.rulesGrid}>
      <article className={styles.relaySimulator}>
        <div className={styles.cardLabel}><span>INTERACTIVE RELAY</span><strong>{runnerMoving ? "LAP LIVE" : "LAP PAUSED"}</strong></div>
        <div className={styles.runnerRail}>
          {teammates.map((teammate, index) => <button key={teammate[1]} type="button" className={activeRunner === index ? styles.isActive : ""} aria-pressed={activeRunner === index} onClick={() => { setActiveRunner(index); setRunnerMoving(true); }}><span>{teammate[0]}</span><strong>{teammate[1].split(" ")[0]}</strong></button>)}
        </div>
        <div className={`${styles.agentConsole} ${runnerMoving ? styles.isRunning : styles.isPaused}`} aria-live="polite">
          <span className={styles.runnerDot} aria-hidden="true" /><div><small>CURRENT RUNNER / CURRENT BUILDER</small><strong>{teammates[activeRunner][1]}</strong><p>{runnerMoving ? "Runner moving · voice in · building allowed" : "Runner stopped · building paused under event rules"}</p></div>
        </div>
        <div className={styles.relayActions}><button type="button" onClick={() => setRunnerMoving((current) => !current)}>{runnerMoving ? "Pause the lap" : "Resume the lap"}</button><button type="button" onClick={handOff}>Hand over →</button></div>
        <p className={styles.demoNote}>Illustrative control: it demonstrates the event rule and does not start a real agent or track a location.</p>
      </article>
      <aside className={styles.ruleSheet}>
        <span className={styles.tape}>THE RULES</span>
        <ol>
          <li><span>1</span><div><strong>Teams of up to three</strong><p>One teammate on the loop at a time.</p></div></li>
          <li><span>2</span><div><strong>The runner is the builder</strong><p>Calls and screensharing could relay context; the moving teammate directed the build.</p></div></li>
          <li><span>3</span><div><strong>Switch whenever needed</strong><p>Unlimited handovers across the 5½-hour window.</p></div></li>
          <li><span>4</span><div><strong>Start from zero</strong><p>No reused product. First commits and session history could be inspected.</p></div></li>
          <li><span>5</span><div><strong>Keep it moving</strong><p>The published running threshold was under 7:00/km.</p></div></li>
        </ol>
      </aside>
    </div>
    <div className={styles.scoreLab}>
      <div className={styles.scoreControls}>
        <div className={styles.cardLabel}><span>OFFICIAL WORKED EXAMPLE</span><strong>NOT SIDEQUEST&apos;S SCORE</strong></div>
        <label htmlFor="build-score"><span><strong>BUILD score</strong><b>{buildScore} / 35</b></span><input id="build-score" type="range" min="0" max="35" step="1" value={buildScore} onChange={(event) => setBuildScore(Number(event.target.value))} /></label>
        <label htmlFor="team-km"><span><strong>Verified team distance</strong><b>{teamDistance} km</b></span><input id="team-km" type="range" min="0" max="80" step="1" value={teamDistance} onChange={(event) => setTeamDistance(Number(event.target.value))} /></label>
        <div className={styles.scoreFormula} aria-live="polite"><span><small>BUILD</small><strong>{buildScore}</strong></span><b>+</b><span><small>{teamDistance} KM ÷ 2</small><strong>{(teamDistance / 2).toFixed(1)}</strong></span><b>=</b><span className={styles.totalScore}><small>FINAL</small><strong>{finalScore.toFixed(1)}</strong></span></div>
        <p>The event pack illustrates the formula with BUILD 30 + 50 km ÷ 2 = 55. SideQuest&apos;s exact judge score is not documented. If the reported 44 km matched the verified score distance, it would have contributed 22 points.</p>
      </div>
      <div className={styles.criteriaPanel}>
        <div className={styles.criteriaGrid} aria-label="Published BUILD criteria">
          {judgingCriteria.map((item) => <button key={item[0]} type="button" className={criterionId === item[0] ? styles.isActive : ""} aria-pressed={criterionId === item[0]} onClick={() => setCriterionId(item[0])}><span>{item[1]}</span><strong>{item[3]}</strong><small>points</small></button>)}
        </div>
        <article className={styles.criterionDetail} aria-live="polite"><span>{criterion[3] === 10 ? "DOUBLE WEIGHT" : "BUILD CRITERION"}</span><h3>{criterion[2]}</h3><p>{criterion[4]}</p><small>Organiser copy says “seven criteria”, while the published table names these six and weights originality twice. Sponsor challenges were scored separately.</small></article>
      </div>
    </div>
    <div className={styles.scheduleStrip} aria-label="Event schedule">{schedule.map(([time, label]) => <div key={time}><strong>{time}</strong><span>{label}</span></div>)}</div>
  </>)}</>;
}

function PeoplePanel({ locale }: { locale: Locale }) {
  const [creditGroup, setCreditGroup] = useState<keyof typeof creditGroups>("team");
  const activeCredits = creditGroups[creditGroup];

  return <>{localizeSideQuestTree(locale, <>
    <ChapterHeading chapter="CHAPTER 03 · THE CROWD" title="The best part was everybody else" intro="A hackathon can produce a product. This one also produced a temporary little city on a running track." />
    <figure className={styles.communityPhoto}>
      <Image src="/hackathons/runhack/community-track-group.jpg" alt="More than 100 runners and builders celebrating together on the London Stadium Community Track." width={800} height={533} sizes="100vw" />
      <figcaption><span>ONE LOOP · 100+ PEOPLE</span><strong>Together on the London Stadium Community Track.</strong><small>Photo shared by Samuel Zhang.</small></figcaption>
    </figure>
    <div className={styles.peopleGrid}>
      <article className={styles.creditBrowser}>
        <div className={styles.creditTabs} aria-label="Event credits">
          {(Object.keys(creditGroups) as Array<keyof typeof creditGroups>).map((key) => <button key={key} type="button" className={creditGroup === key ? styles.isActive : ""} aria-pressed={creditGroup === key} onClick={() => setCreditGroup(key)}>{creditGroups[key][0]}</button>)}
        </div>
        <div className={styles.creditDetail} aria-live="polite"><span>{activeCredits[0]}</span><h3>{activeCredits[1]}</h3><p>{activeCredits[2]}</p><div>{activeCredits[3].map((name) => <small key={name}>{name}</small>)}</div></div>
      </article>
      <aside className={styles.prizeCard}>
        <span>SECOND PLACE</span><strong>A lovely signal—not the point of the day.</strong>
        <ul><li>£500 cash prize</li><li>3 × WHOOP One 5.0</li><li>3 × Healf blood kits</li><li>$1,000 Thrad credits</li><li>4 months Devin Max per teammate*</li></ul>
        <p>*The Devin award is reported in Samuel&apos;s event post; it is not listed in the official prize table preserved in the source pack.</p>
      </aside>
    </div>
    <div className={styles.teamCards}>
      {teammates.map((teammate) => <article key={teammate[1]}><span>{teammate[0]}</span><div><strong>{teammate[1]}</strong><p>{teammate[2]}</p></div></article>)}
    </div>
    <details className={styles.supportLedger}>
      <summary>Open the event backers & community ledger</summary>
      <div>
        <section><span>EVENT BACKERS & TOOLS</span><p>ROXFIT / Traccar tracked movement; O2 kept the track connected; Wispr Flow and ElevenLabs supported voice; Cognition and Poke brought agents and messaging; Healf and Hyperice supported recovery; Deepline and Tavily covered traction and data. Additional backers: The Interaction Company · Thrad · algosoup · Delfa · Accelerate ME · PerfectTed.</p></section>
        <section><span>COMMUNITY SUPPORT</span><p>Unicorn Mafia · Pitchless Community / Poke.com · Security Builders Club</p></section>
        <section><span>TRACKSIDE CONNECTIONS</span><p>Anshul Yadav · Joseph Anthony · Samuel Klacman · Joakim Talling-Smith · Luke Balabanovic · Jack Rees · and many more</p></section>
      </div>
    </details>
  </>)}</>;
}

function BuildPanel({ locale }: { locale: Locale }) {
  const [view, setView] = useState<BuildView>("live");
  const [sandboxDistance, setSandboxDistance] = useState("5.0");
  const [sandboxMinutes, setSandboxMinutes] = useState("30");
  const [sandboxEffort, setSandboxEffort] = useState("5");
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [loopStep, setLoopStep] = useState(0);
  const [challengeKey, setChallengeKey] = useState<keyof typeof challengeOptions>("effort");
  const [challengeState, setChallengeState] = useState<ChallengeState>("draft");
  const [replayState, setReplayState] = useState<ReplayState>("idle");
  const [replayTick, setReplayTick] = useState(0);
  const [cheerFeed, setCheerFeed] = useState<string[]>([]);
  const [liveChallenge, setLiveChallenge] = useState<ChallengeState>("draft");
  const activeChallenge = challengeOptions[challengeKey];

  useEffect(() => {
    if (replayState !== "live") return;
    const timer = window.setInterval(() => {
      setReplayTick((current) => {
        if (current >= routePoints.length - 1) { window.clearInterval(timer); setReplayState("finished"); return routePoints.length - 1; }
        return current + 1;
      });
    }, 780);
    return () => window.clearInterval(timer);
  }, [replayState]);

  const normaliseRun = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const distance = Number(sandboxDistance);
    const minutes = Number(sandboxMinutes);
    const effort = Number(sandboxEffort);
    if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(minutes) || minutes <= 0 || effort < 1 || effort > 10) {
      setSandboxResult("Enter a positive distance and time, with effort from 1 to 10."); return;
    }
    setSandboxResult(`${distance.toFixed(1)} km · ${formatPace(minutes, distance)} · RPE ${effort}/10`);
  };

  const startReplay = () => { setReplayTick(0); setCheerFeed([]); setLiveChallenge("draft"); setReplayState("live"); };
  const distance = replayTick * 0.11;
  const elapsed = replayTick * 38;
  const visibleRoute = routePoints.slice(0, Math.max(1, replayTick + 1));
  const routePolyline = visibleRoute.map(([x, y]) => `${x},${y}`).join(" ");
  const runnerPoint = visibleRoute[visibleRoute.length - 1];

  return <>{localizeSideQuestTree(locale, <>
    <ChapterHeading chapter="CHAPTER 04 · THE ARTEFACT" title="SideQuest, built between laps" intro="A social running app that turns private activity evidence into measurable friend challenges and a privacy-aware live run." />
    <div className={styles.buildSummary}>
      <article><span>01</span><div><strong>Read the evidence</strong><p>Owner-scoped Strava aggregates; raw routes never became portfolio assets.</p></div></article>
      <article><span>02</span><div><strong>Ask a better question</strong><p>Turn missing context into one bounded subsequent run—not a diagnosis.</p></div></article>
      <article><span>03</span><div><strong>Bring a friend live</strong><p>Ephemeral camera, coarsened route, cheers and an accept-or-decline challenge.</p></div></article>
    </div>
    <div className={styles.buildTabs} aria-label="SideQuest feature demos">
      <button type="button" className={view === "evidence" ? styles.isActive : ""} aria-pressed={view === "evidence"} onClick={() => setView("evidence")}>Strava evidence</button>
      <button type="button" className={view === "question" ? styles.isActive : ""} aria-pressed={view === "question"} onClick={() => setView("question")}>Subsequent run</button>
      <button type="button" className={view === "live" ? styles.isActive : ""} aria-pressed={view === "live"} onClick={() => setView("live")}>Live relay</button>
    </div>

    {view === "evidence" && <div className={styles.evidenceDemo}>
      <article className={styles.sourceCard}>
        <div className={styles.cardLabel}><span>PRIVATE STRAVA ADAPTER</span><strong>READ ONLY</strong></div>
        <div className={styles.sourceNumbers}><div><strong>209</strong><span>usable activities</span></div><div><strong>188</strong><span>with heart rate</span></div><div><strong>10</strong><span>with perceived effort</span></div></div>
        <p>These documented counts belong to Javi&apos;s owner-scoped export—not Samuel&apos;s running history. Coverage describes available evidence; it is not a health or fitness score.</p>
      </article>
      <form className={styles.runForm} onSubmit={normaliseRun}>
        <div className={styles.cardLabel}><span>TRY THE DATA SHAPE</span><strong>BROWSER ONLY</strong></div>
        <h3>Add a hypothetical subsequent run</h3><p>Nothing is uploaded or stored. This demonstrates how a new GPS run joined the same neutral observation contract.</p>
        <div className={styles.runFields}>
          <label>Distance <span><input type="number" min="0.1" step="0.1" value={sandboxDistance} onChange={(event) => setSandboxDistance(event.target.value)} /> km</span></label>
          <label>Moving time <span><input type="number" min="1" step="1" value={sandboxMinutes} onChange={(event) => setSandboxMinutes(event.target.value)} /> min</span></label>
          <label>Effort <span><input type="number" min="1" max="10" step="1" value={sandboxEffort} onChange={(event) => setSandboxEffort(event.target.value)} /> /10</span></label>
        </div>
        <button type="submit">Normalise this run</button><p className={styles.runResult} role="status">{sandboxResult ?? "No browser observation added yet."}</p>
      </form>
    </div>}

    {view === "question" && <div className={styles.questionDemo}>
      <article className={styles.loopCard}>
        <div className={styles.cardLabel}><span>AGENT GODOY</span><strong>NON-DIAGNOSTIC</strong></div>
        <div className={styles.loopSteps}>{loopSteps.map((step, index) => <button key={step} type="button" className={loopStep === index ? styles.isActive : ""} aria-pressed={loopStep === index} onClick={() => setLoopStep(index)}><span>0{index + 1}</span><strong>{step}</strong></button>)}</div>
        <div className={styles.loopReadout} aria-live="polite"><span>{loopSteps[loopStep]}</span><p>{loopDetails[loopStep]}</p></div>
      </article>
      <aside className={styles.challengeCard}>
        <div className={styles.cardLabel}><span>FRIEND CHALLENGE</span><strong>{challengeState.toUpperCase()}</strong></div>
        <label htmlFor="challenge-focus">Choose a question</label>
        <select id="challenge-focus" value={challengeKey} onChange={(event) => { setChallengeKey(event.target.value as keyof typeof challengeOptions); setChallengeState("draft"); }}>{Object.entries(challengeOptions).map(([key, challenge]) => <option key={key} value={key}>{challenge[0]}</option>)}</select>
        <dl><div><dt>Question</dt><dd>{activeChallenge[1]}</dd></div><div><dt>Bounded run</dt><dd>{activeChallenge[2]}</dd></div><div><dt>Success</dt><dd>{activeChallenge[3]}</dd></div><div><dt>Safety stop</dt><dd>Stop for chest discomfort, dizziness, faintness, unusual breathlessness or concerning pain. Stopping safely counts.</dd></div></dl>
        <div className={styles.challengeActions}>
          {challengeState === "draft" && <button type="button" onClick={() => setChallengeState("sent")}>Send to a friend</button>}
          {challengeState === "sent" && <><button type="button" onClick={() => setChallengeState("accepted")}>Accept</button><button type="button" onClick={() => setChallengeState("declined")}>Decline</button></>}
          {(challengeState === "accepted" || challengeState === "declined") && <button type="button" onClick={() => setChallengeState("draft")}>Reset challenge</button>}
        </div>
        <p className={styles.challengeStatus} role="status">{challengeState === "draft" && "Draft · nothing has been sent"}{challengeState === "sent" && "Sent · the runner decides"}{challengeState === "accepted" && "Accepted · ready to measure"}{challengeState === "declined" && "Declined · no penalty"}</p>
      </aside>
    </div>}

    {view === "live" && <div className={styles.liveDemo}>
      <figure className={styles.phoneProof}>
        <Image src="/hackathons/runhack/sidequest-live.jpg" alt="The SideQuest live prototype showing a runner’s camera, GPS distance, pace, time and privacy-safe abstract route." width={781} height={1532} sizes="(max-width: 700px) 80vw, 330px" />
        <figcaption><span>EVENT-DAY PROTOTYPE</span> Javi live on the track, with a camera, GPS metrics and an abstract route.</figcaption>
      </figure>
      <article className={styles.replayCard}>
        <div className={styles.cardLabel}><span>INTERACTIVE PORTFOLIO REPLAY</span><strong>{replayState === "live" ? "● LIVE" : replayState === "finished" ? "FINISHED" : "READY"}</strong></div>
        <p className={styles.replayDisclosure}>This reconstruction never requests camera, microphone or location. The original camera relay was ephemeral and the external event deployment may not always be online.</p>
        <div className={styles.replayMap}>
          <svg viewBox="0 0 100 86" role="img" aria-label={`Abstract replay route with ${visibleRoute.length} points`}><rect width="100" height="86" /><path d="M-5 21 C18 4 36 29 58 14 S82 8 108 25M-8 72 C17 54 37 82 60 65 S84 50 109 68" /><polyline points={routePolyline} /><circle cx={runnerPoint[0]} cy={runnerPoint[1]} r="4" /></svg>
          <span>ROTATED, COARSENED GEOMETRY</span>
          {cheerFeed.length > 0 && <b className={styles.reaction} key={`${cheerFeed.length}-${cheerFeed.at(-1)}`}>{cheerFeed.at(-1)}</b>}
          {liveChallenge !== "draft" && <div className={styles.liveOverlay}><span>NEXT-KILOMETRE CHALLENGE</span><strong>Hold an even pace · £9 pledge to Mind</strong><small>No payment is charged.</small>{liveChallenge === "sent" && <div><button type="button" onClick={() => setLiveChallenge("accepted")}>Accept</button><button type="button" onClick={() => setLiveChallenge("declined")}>Decline</button></div>}{liveChallenge === "accepted" && <b>ACCEPTED</b>}{liveChallenge === "declined" && <b>DECLINED</b>}</div>}
        </div>
        <dl className={styles.replayStats}><div><dt>Distance</dt><dd>{distance.toFixed(2)} km</dd></div><div><dt>Live pace</dt><dd>{replayTick ? `${5 + Math.floor(replayTick / 9)}:${String(42 + (replayTick % 9)).padStart(2, "0")}` : "—"}</dd></div><div><dt>Time</dt><dd>{formatTime(elapsed)}</dd></div></dl>
        <div className={styles.replayControls}>
          <button type="button" onClick={startReplay}>{replayState === "live" ? "Restart replay" : replayState === "finished" ? "Run replay again" : "Start live replay"}</button>
          <div><span>Send a cheer</span>{cheersByLocale[locale].map((cheer) => <button key={cheer} type="button" disabled={replayState !== "live"} onClick={() => setCheerFeed((current) => [...current.slice(-4), cheer])} aria-label={locale === "zh-CN" ? `发送助威：${cheer}` : locale === "zh-TW" ? `傳送加油訊息：${cheer}` : `Send ${cheer} cheer`}>{cheer}</button>)}</div>
          <button type="button" disabled={replayState !== "live" || liveChallenge !== "draft"} onClick={() => setLiveChallenge("sent")}>Send challenge</button>
        </div>
      </article>
    </div>}

    <details className={styles.technicalNotes}>
      <summary>Open technical field notes & prototype boundaries</summary>
      <div>
        <section><span>DATA</span><p>Private, owner-scoped Strava export; 209 aggregate runs belonged to Javi. Raw routes were never browser assets.</p></section>
        <section><span>SUBSEQUENT RUNS</span><p>Validated live GPS samples were normalised into the same distance, time, pace, effort and freshness contract, then reassessed.</p></section>
        <section><span>LIVE</span><p>Authenticated WebSocket sessions relayed ephemeral camera chunks. Spectators saw an abstracted route; cheers and challenge decisions persisted.</p></section>
        <section><span>HONEST LIMITS</span><p>The hackathon guest flow was not production authentication, pledge commitments did not charge money, and the live relay was designed for limited event concurrency.</p></section>
      </div>
    </details>
    <div className={styles.buildLinks}><a href="https://genesis.hiddenlayers.co.uk" target="_blank" rel="noreferrer">Original event deployment ↗</a><a href="https://github.com/samuel-zhang01/sidequest" target="_blank" rel="noreferrer">SideQuest source ↗</a></div>
  </>)}</>;
}

export default function SideQuestCabinetApp({ locale }: { locale: Locale }) {
  const [panel, setPanel] = useState<PanelId>("day");

  useEffect(() => {
    const syncPanelFromHash = () => {
      const requestedPanel = window.location.hash.slice(1);
      if (panels.some((item) => item.id === requestedPanel)) setPanel(requestedPanel as PanelId);
    };
    syncPanelFromHash();
    window.addEventListener("hashchange", syncPanelFromHash);
    return () => window.removeEventListener("hashchange", syncPanelFromHash);
  }, []);

  const selectPanel = (nextPanel: PanelId, reveal = false) => {
    setPanel(nextPanel);
    if (window.location.pathname.split("/").includes("sidequest")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${nextPanel}`);
    }
    if (reveal) window.requestAnimationFrame(() => document.getElementById("runhack-navigation")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, currentPanel: PanelId) => {
    const current = panels.findIndex((item) => item.id === currentPanel);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % panels.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + panels.length) % panels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = panels.length - 1;
    else return;
    event.preventDefault();
    selectPanel(panels[next].id);
    document.getElementById(`runhack-tab-${panels[next].id}`)?.focus();
  };

  return <>{localizeSideQuestTree(locale, (
    <div className={styles.app} data-locale={locale} lang={locale}>
      <header className={styles.masthead}>
        <div className={styles.identity}><span className={styles.mark} aria-hidden="true">RH</span><div><span>Sam&apos;s Cabinet of Curiosities · Latest field note</span><strong>RUN/HACK FIELD JOURNAL</strong></div></div>
        <div className={styles.releaseStamp}><span>29 AUG 2026</span><strong>2ND PLACE</strong></div>
      </header>

      <section className={styles.hero} aria-labelledby="runhack-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>London Stadium · 400 m loop · 5½ hours</p>
          <h1 id="runhack-title">Running wasn&apos;t the break. It was the only time we could build.</h1>
          <p>After a morning 5K, Samuel joined Javiera Rubio and Andrés Daniel Godoy Ortiz at an event billed as Europe&apos;s first running hackathon. Only the teammate on the track could direct the build. Through rain, phone dictation and 44 additional team kilometres, they shipped SideQuest.</p>
          <div className={styles.heroActions}>
            <button type="button" onClick={() => selectPanel("rules", true)}>See how the hack worked</button>
            <button type="button" className={styles.secondaryAction} onClick={() => selectPanel("build", true)}>Replay what we shipped</button>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>Morning prelude</dt><dd>5K</dd><dd className={styles.factNote}>RunThrough, Regent&apos;s Park</dd></div>
            <div><dt>Team relay</dt><dd>44 km</dd><dd className={styles.factNote}>run + build in the rain</dd></div>
            <div><dt>Community</dt><dd>100+</dd><dd className={styles.factNote}>runners and builders</dd></div>
            <div><dt>Result</dt><dd>2nd</dd><dd className={styles.factNote}>SideQuest</dd></div>
          </dl>
        </div>
        <figure className={styles.heroPhoto}>
          <Image src="/hackathons/runhack/building-in-motion.jpg" alt="Samuel and another participant using their phones while moving around the London Stadium Community Track." width={800} height={533} sizes="(max-width: 800px) 100vw, 48vw" priority />
          <figcaption><span>BUILDING IN MOTION</span> The track was the workstation. Photo shared by Samuel Zhang.</figcaption>
        </figure>
      </section>

      <nav id="runhack-navigation" className={styles.tabs} aria-label="RUN/HACK field journal" role="tablist">
        {panels.map((item) => <button key={item.id} type="button" role="tab" id={`runhack-tab-${item.id}`} aria-controls={`runhack-panel-${item.id}`} aria-selected={panel === item.id} tabIndex={panel === item.id ? 0 : -1} onClick={() => selectPanel(item.id)} onKeyDown={(event) => handleTabKey(event, item.id)}><span>{item.index}</span>{item.label}</button>)}
      </nav>

      <div className={styles.workspace}>
        <section className={styles.panel} id="runhack-panel-day" role="tabpanel" aria-labelledby="runhack-tab-day" hidden={panel !== "day"}><DayPanel locale={locale} /></section>
        <section className={styles.panel} id="runhack-panel-rules" role="tabpanel" aria-labelledby="runhack-tab-rules" hidden={panel !== "rules"}><RulesPanel locale={locale} /></section>
        <section className={styles.panel} id="runhack-panel-people" role="tabpanel" aria-labelledby="runhack-tab-people" hidden={panel !== "people"}><PeoplePanel locale={locale} /></section>
        <section className={styles.panel} id="runhack-panel-build" role="tabpanel" aria-labelledby="runhack-tab-build" hidden={panel !== "build"}><BuildPanel locale={locale} /></section>
      </div>

      <footer className={styles.footer}>
        <span>Source-grounded RUN/HACK field journal · documentary photos shared by Samuel Zhang</span>
        <div><a href="https://www.therunninghackathon.com/" target="_blank" rel="noreferrer">Official event ↗</a><a href="https://www.linkedin.com/feed/update/urn:li:activity:7500232962580353024/" target="_blank" rel="noreferrer">Samuel&apos;s field note ↗</a></div>
      </footer>
    </div>
  ))}</>;
}
