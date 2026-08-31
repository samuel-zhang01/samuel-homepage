"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./SideQuestCabinetApp.module.css";

type PanelId = "dispatch" | "strava" | "loop" | "live";
type ReplayState = "idle" | "live" | "finished";
type ChallengeState = "draft" | "sent" | "accepted" | "declined";

type RunObservation = {
  id: string;
  title: string;
  source: string;
  value: string;
  meta: string;
  note: string;
  tone: "lime" | "sky" | "coral" | "paper";
};

const panels: Array<{ id: PanelId; label: string; index: string }> = [
  { id: "dispatch", label: "Race dispatch", index: "01" },
  { id: "strava", label: "Strava reader", index: "02" },
  { id: "loop", label: "Challenge loop", index: "03" },
  { id: "live", label: "Live relay", index: "04" },
];

const relayMoments = [
  {
    time: "MORNING",
    title: "Regent’s Park 5K",
    text: "Samuel finished a RunThrough 5K with Axel Ehrnrooth, Yasmin Akhmedova and Thiruvikraman Anand before heading across London.",
  },
  {
    time: "12:30",
    title: "Runner takes the keyboard",
    text: "The relay began. Only the teammate currently running could build, so ideas and code moved by phone dictation while the others held the context at home base.",
  },
  {
    time: "17:54",
    title: "Final event-day commit",
    text: "Six minutes before the 18:00 deadline, a private Strava import, live GPS, structured running questions, social challenges and an ephemeral camera relay had become one working product.",
  },
  {
    time: "RESULT",
    title: "Second place",
    text: "After 44 additional team kilometres in the rain, SideQuest placed second at Running Hackathon and earned the team prize bundle.",
  },
];

const sourceObservations: RunObservation[] = [
  {
    id: "import",
    title: "Private source import",
    source: "strava-export-v1",
    value: "209 runs",
    meta: "Javi’s owner-scoped export",
    note: "The backend read aggregate activity records through a private, read-only mount. The CSV and raw routes were never browser assets.",
    tone: "lime",
  },
  {
    id: "heart-rate",
    title: "Heart-rate coverage",
    source: "source diagnostic",
    value: "188 / 209",
    meta: "90% of imported runs",
    note: "Coverage is evidence availability—not a health, safety or fitness score. SideQuest kept measurements separate from interpretation.",
    tone: "coral",
  },
  {
    id: "effort",
    title: "Perceived-effort gap",
    source: "source diagnostic",
    value: "10 / 209",
    meta: "5% of imported runs",
    note: "The sparse RPE field became a useful question: collect a little more context on subsequent runs instead of pretending the tracker already knows how they felt.",
    tone: "sky",
  },
  {
    id: "live-shape",
    title: "Subsequent live run",
    source: "live-gps-v1",
    value: "same shape",
    meta: "distance · time · pace · effort",
    note: "When a live session finished, validated GPS samples were normalised into the same neutral observation contract as an imported activity and became available for reassessment.",
    tone: "paper",
  },
];

const loopSteps = [
  { label: "Observe", detail: "Import aggregate Strava runs or finish a validated live GPS session." },
  { label: "Estimate", detail: "Compare recent and baseline windows while stating coverage and missing fields." },
  { label: "Ask", detail: "Turn uncertainty into a measurable question, not a diagnosis." },
  { label: "Intervene", detail: "Propose a bounded run with a success measure and an explicit safety stop." },
  { label: "Rally", detail: "Send the challenge to a friend; pledges are commitments and never charge money." },
  { label: "Reassess", detail: "Store the outcome as new evidence and run the loop again." },
];

const challengeOptions = {
  effort: {
    label: "Fill the effort gap",
    question: "Does an easy conversational run still feel easy when effort is recorded immediately afterwards?",
    task: "Run 30 minutes at conversational effort, then record RPE within five minutes.",
    success: "A completed run plus one fresh perceived-effort observation.",
  },
  pacing: {
    label: "Test pace stability",
    question: "Can the next controlled kilometre stay even without chasing a personal best?",
    task: "Run one controlled kilometre within a 10-second pace band.",
    success: "Finish inside the band without overriding the safety stop.",
  },
  consistency: {
    label: "Protect consistency",
    question: "Would a deliberately short run make the next week easier to sustain?",
    task: "Complete a 20-minute easy run and note whether another run feels realistic in 48 hours.",
    success: "The observation is recorded; speed is not scored.",
  },
} as const;

const routePoints = [
  [8, 70], [13, 62], [20, 65], [25, 54], [33, 49], [39, 53], [46, 41],
  [53, 44], [58, 34], [66, 28], [73, 32], [79, 22], [88, 26], [92, 16],
] as const;

const cheers = ["🔥", "👏", "⚡", "💚"] as const;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatPace(totalMinutes: number, distance: number) {
  if (!Number.isFinite(totalMinutes) || !Number.isFinite(distance) || distance <= 0) return "—";
  const paceSeconds = Math.round((totalMinutes * 60) / distance);
  return `${Math.floor(paceSeconds / 60)}:${String(paceSeconds % 60).padStart(2, "0")} /km`;
}

export default function SideQuestCabinetApp({ locale }: { locale: Locale }) {
  const [panel, setPanel] = useState<PanelId>("dispatch");
  const [relayMoment, setRelayMoment] = useState(0);
  const [selectedObservation, setSelectedObservation] = useState("import");
  const [sandboxObservation, setSandboxObservation] = useState<RunObservation | null>(null);
  const [sandboxDistance, setSandboxDistance] = useState("5.0");
  const [sandboxMinutes, setSandboxMinutes] = useState("30");
  const [sandboxEffort, setSandboxEffort] = useState("5");
  const [sandboxNotice, setSandboxNotice] = useState("No browser data has been added.");
  const [loopStep, setLoopStep] = useState(0);
  const [challengeKey, setChallengeKey] = useState<keyof typeof challengeOptions>("effort");
  const [challengeState, setChallengeState] = useState<ChallengeState>("draft");
  const [replayState, setReplayState] = useState<ReplayState>("idle");
  const [replayTick, setReplayTick] = useState(0);
  const [cheerFeed, setCheerFeed] = useState<string[]>([]);
  const [liveChallenge, setLiveChallenge] = useState<ChallengeState>("draft");

  const observations = useMemo(
    () => sandboxObservation ? [...sourceObservations, sandboxObservation] : sourceObservations,
    [sandboxObservation],
  );
  const activeObservation = observations.find((item) => item.id === selectedObservation) ?? observations[0];
  const activeChallenge = challengeOptions[challengeKey];

  useEffect(() => {
    const syncPanelFromHash = () => {
      const requestedPanel = window.location.hash.slice(1);
      if (panels.some((item) => item.id === requestedPanel)) {
        setPanel(requestedPanel as PanelId);
      }
    };
    syncPanelFromHash();
    window.addEventListener("hashchange", syncPanelFromHash);
    return () => window.removeEventListener("hashchange", syncPanelFromHash);
  }, []);

  useEffect(() => {
    if (replayState !== "live") return;
    const timer = window.setInterval(() => {
      setReplayTick((current) => {
        if (current >= routePoints.length - 1) {
          window.clearInterval(timer);
          setReplayState("finished");
          return routePoints.length - 1;
        }
        return current + 1;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [replayState]);

  const addSandboxObservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const distance = Number(sandboxDistance);
    const minutes = Number(sandboxMinutes);
    const effort = Number(sandboxEffort);
    if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(minutes) || minutes <= 0 || effort < 1 || effort > 10) {
      setSandboxNotice("Enter a positive distance and time, with effort from 1 to 10.");
      return;
    }
    const observation: RunObservation = {
      id: "sandbox",
      title: "Browser-only observation",
      source: "portfolio-sandbox",
      value: `${distance.toFixed(1)} km`,
      meta: `${formatPace(minutes, distance)} · RPE ${effort}/10`,
      note: "This hypothetical record demonstrates the normalised observation shape. It stays in this window, is not sent anywhere and is not part of the hackathon dataset.",
      tone: "sky",
    };
    setSandboxObservation(observation);
    setSelectedObservation("sandbox");
    setSandboxNotice("Hypothetical observation added locally. Refreshing clears it.");
  };

  const startReplay = () => {
    setReplayTick(0);
    setCheerFeed([]);
    setLiveChallenge("draft");
    setReplayState("live");
  };

  const selectPanel = (nextPanel: PanelId, reveal = false) => {
    setPanel(nextPanel);
    if (window.location.pathname.split("/").includes("sidequest")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${nextPanel}`);
    }
    if (reveal) {
      window.requestAnimationFrame(() => {
        document.getElementById("sidequest-navigation")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  const distance = replayTick * 0.11;
  const elapsed = replayTick * 38;
  const visibleRoute = routePoints.slice(0, Math.max(1, replayTick + 1));
  const routePolyline = visibleRoute.map(([x, y]) => `${x},${y}`).join(" ");
  const runnerPoint = visibleRoute[visibleRoute.length - 1];

  return (
    <div className={styles.app} data-locale={locale} lang="en-GB">
      <header className={styles.masthead}>
        <div className={styles.identity}>
          <span className={styles.mark} aria-hidden="true">SQ</span>
          <div>
            <span>Sam&apos;s Cabinet of Curiosities · Object 01</span>
            <strong>RUN/HACK → SIDEQUEST</strong>
          </div>
        </div>
        <div className={styles.releaseStamp}>
          <span>29 AUG 2026</span>
          <strong>2ND PLACE</strong>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="sidequest-title">
        <div>
          <p className={styles.kicker}>Built by voice, in motion, through London rain.</p>
          <h1 id="sidequest-title">The teammate running was the only teammate allowed to build.</h1>
          <p>
            Samuel, Javiera Rubio and Andrés Daniel Godoy Ortiz used that constraint to ship
            SideQuest: a social running loop that reads private activity evidence, learns from
            subsequent runs and lets friends join a privacy-safe live session.
          </p>
          <div className={styles.heroActions}>
            <button type="button" onClick={() => selectPanel("live", true)}>Open the live replay</button>
            <a href="https://genesis.hiddenlayers.co.uk" target="_blank" rel="noreferrer">Visit the original deployment URL ↗</a>
          </div>
        </div>
        <dl className={styles.heroStats}>
          <div><dt>Morning race</dt><dd>5K</dd><small>Regent&apos;s Park</small></div>
          <div><dt>Team relay</dt><dd>+44K</dd><small>run + build</small></div>
          <div><dt>Source proof</dt><dd>209</dd><small>usable runs</small></div>
          <div><dt>Result</dt><dd>2ND</dd><small>overall</small></div>
        </dl>
      </section>

      <nav id="sidequest-navigation" className={styles.tabs} aria-label="SideQuest exhibit" role="tablist">
        {panels.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`sidequest-tab-${item.id}`}
            aria-controls={`sidequest-panel-${item.id}`}
            aria-selected={panel === item.id}
            tabIndex={panel === item.id ? 0 : -1}
            onClick={() => selectPanel(item.id)}
          >
            <span>{item.index}</span>{item.label}
          </button>
        ))}
      </nav>

      <main className={styles.workspace}>
        <section
          className={styles.panel}
          id="sidequest-panel-dispatch"
          role="tabpanel"
          aria-labelledby="sidequest-tab-dispatch"
          hidden={panel !== "dispatch"}
        >
          <div className={styles.dispatchGrid}>
            <article className={styles.dispatchCard}>
              <div className={styles.sectionHeading}>
                <div><span>FIELD LOG · LONDON</span><h2>One very long Saturday</h2></div>
                <strong>{relayMoments[relayMoment].time}</strong>
              </div>
              <div className={styles.relayTimeline} aria-label="Hackathon timeline">
                {relayMoments.map((moment, index) => (
                  <button
                    key={moment.time}
                    type="button"
                    className={relayMoment === index ? styles.isActive : ""}
                    aria-pressed={relayMoment === index}
                    onClick={() => setRelayMoment(index)}
                  >
                    <span>{moment.time}</span><i aria-hidden="true" /><strong>{moment.title}</strong>
                  </button>
                ))}
              </div>
              <div className={styles.momentDetail} aria-live="polite">
                <span>0{relayMoment + 1} / 04</span>
                <div><h3>{relayMoments[relayMoment].title}</h3><p>{relayMoments[relayMoment].text}</p></div>
              </div>
            </article>

            <aside className={styles.ruleCard}>
              <span className={styles.tape}>THE RULE</span>
              <blockquote>“Your agents only run when you do.”</blockquote>
              <ol>
                <li><span>1</span>One teammate runs.</li>
                <li><span>2</span>They dictate into a phone.</li>
                <li><span>3</span>The team relays context.</li>
                <li><span>4</span>Swap runner. Keep shipping.</li>
              </ol>
              <p>Five and a half hours. Three builders. One moving keyboard.</p>
            </aside>
          </div>

          <div className={styles.storyStrip}>
            <article><span>TEAM</span><strong>Samuel Zhang</strong><p>Product, engineering and one rain-soaked relay leg.</p></article>
            <article><span>TEAM</span><strong>Javiera Rubio</strong><p>Hackmate, Strava source owner and Milan-to-London instigator.</p></article>
            <article><span>TEAM</span><strong>Andrés Daniel Godoy Ortiz</strong><p>Hackmate and namesake of the evidence agent.</p></article>
            <article className={styles.prizeCard}><span>SECOND PLACE</span><strong>People found it useful—and amusing.</strong><p>£500 cash, a WHOOP, three Healf blood kits, $1,000 in Thrad credits and four months of Devin Max per person.</p></article>
          </div>
        </section>

        <section
          className={styles.panel}
          id="sidequest-panel-strava"
          role="tabpanel"
          aria-labelledby="sidequest-tab-strava"
          hidden={panel !== "strava"}
        >
          <div className={styles.dataGrid}>
            <aside className={styles.sourceRail}>
              <div className={styles.sectionHeading}>
                <div><span>PRIVATE ADAPTER</span><h2>Read the evidence</h2></div>
              </div>
              <div className={styles.coverageSummary}>
                <div className={styles.coverageDial} style={{ "--coverage": "90%" } as CSSProperties}>
                  <strong>90%</strong><span>heart-rate coverage</span>
                </div>
                <dl>
                  <div><dt>Usable activities</dt><dd>209</dd></div>
                  <div><dt>With heart rate</dt><dd>188</dd></div>
                  <div><dt>With perceived effort</dt><dd>10</dd></div>
                </dl>
              </div>
              <p className={styles.boundaryNote}>
                These documented counts belong to Javi&apos;s owner-scoped Strava export, not
                Samuel&apos;s personal running history. Raw activity files stay private.
              </p>
            </aside>

            <div className={styles.observationBrowser}>
              <div className={styles.observationList} role="listbox" aria-label="Evidence records">
                {observations.map((observation) => (
                  <button
                    key={observation.id}
                    type="button"
                    role="option"
                    aria-selected={activeObservation.id === observation.id}
                    className={activeObservation.id === observation.id ? styles.isSelected : ""}
                    onClick={() => setSelectedObservation(observation.id)}
                  >
                    <i className={styles[`tone${observation.tone[0].toUpperCase()}${observation.tone.slice(1)}`]} />
                    <span><strong>{observation.title}</strong><small>{observation.source}</small></span>
                    <b>{observation.value}</b>
                  </button>
                ))}
              </div>
              <article className={styles.observationDetail} aria-live="polite">
                <span>{activeObservation.source}</span>
                <h3>{activeObservation.title}</h3>
                <strong>{activeObservation.value}</strong>
                <small>{activeObservation.meta}</small>
                <p>{activeObservation.note}</p>
                <div className={styles.contractRow} aria-label="Normalised observation fields">
                  {['distance', 'moving time', 'pace', 'effort', 'freshness'].map((field) => <span key={field}>{field}</span>)}
                </div>
              </article>
            </div>
          </div>

          <form className={styles.sandbox} onSubmit={addSandboxObservation}>
            <div><span>TRY THE CONTRACT</span><h3>Add a hypothetical subsequent run</h3><p>This portfolio sandbox is browser-only and never touches the hackathon data.</p></div>
            <label>Distance <span><input type="number" min="0.1" step="0.1" value={sandboxDistance} onChange={(event) => setSandboxDistance(event.target.value)} /> km</span></label>
            <label>Moving time <span><input type="number" min="1" step="1" value={sandboxMinutes} onChange={(event) => setSandboxMinutes(event.target.value)} /> min</span></label>
            <label>Effort <span><input type="number" min="1" max="10" step="1" value={sandboxEffort} onChange={(event) => setSandboxEffort(event.target.value)} /> / 10</span></label>
            <button type="submit">Normalise run</button>
            <p className={styles.sandboxStatus} role="status">{sandboxNotice}</p>
          </form>
        </section>

        <section
          className={styles.panel}
          id="sidequest-panel-loop"
          role="tabpanel"
          aria-labelledby="sidequest-tab-loop"
          hidden={panel !== "loop"}
        >
          <div className={styles.loopLayout}>
            <div className={styles.loopCanvas}>
              <div className={styles.sectionHeading}>
                <div><span>AGENT GODOY</span><h2>Turn a tracker into a question</h2></div>
                <strong>NON-DIAGNOSTIC</strong>
              </div>
              <div className={styles.loopRing}>
                {loopSteps.map((step, index) => (
                  <button
                    key={step.label}
                    type="button"
                    className={loopStep === index ? styles.isActive : ""}
                    aria-pressed={loopStep === index}
                    onClick={() => setLoopStep(index)}
                  >
                    <span>0{index + 1}</span><strong>{step.label}</strong>
                  </button>
                ))}
                <div className={styles.loopCore} aria-live="polite">
                  <span>{loopSteps[loopStep].label}</span>
                  <p>{loopSteps[loopStep].detail}</p>
                </div>
              </div>
              <p className={styles.safetyCopy}>Evidence → uncertainty → one safe measurement → new evidence. Never “tracker says go harder”.</p>
            </div>

            <aside className={styles.challengeBuilder}>
              <div className={styles.sectionHeading}><div><span>CHALLENGE OBJECT</span><h2>Make it measurable</h2></div></div>
              <label htmlFor="challenge-focus">Choose a question</label>
              <select
                id="challenge-focus"
                value={challengeKey}
                onChange={(event) => {
                  setChallengeKey(event.target.value as keyof typeof challengeOptions);
                  setChallengeState("draft");
                }}
              >
                {Object.entries(challengeOptions).map(([key, challenge]) => <option key={key} value={key}>{challenge.label}</option>)}
              </select>
              <div className={styles.challengeObject}>
                <span>QUESTION</span><p>{activeChallenge.question}</p>
                <span>BOUNDED RUN</span><p>{activeChallenge.task}</p>
                <span>SUCCESS MEASURE</span><p>{activeChallenge.success}</p>
                <span>SAFETY STOP</span><p>Stop for chest discomfort, dizziness, faintness, unusual breathlessness or concerning pain. Stopping safely counts.</p>
              </div>
              <div className={styles.challengeActions}>
                <button type="button" onClick={() => setChallengeState("sent")} disabled={challengeState !== "draft"}>Send to a friend</button>
                {challengeState === "sent" && <><button type="button" onClick={() => setChallengeState("accepted")}>Accept</button><button type="button" onClick={() => setChallengeState("declined")}>Decline</button></>}
              </div>
              <p className={styles.challengeStatus} role="status">
                {challengeState === "draft" && "Draft · nothing has been sent"}
                {challengeState === "sent" && "Sent · the runner decides"}
                {challengeState === "accepted" && "Accepted · ready to measure"}
                {challengeState === "declined" && "Declined · no penalty"}
              </p>
            </aside>
          </div>
        </section>

        <section
          className={styles.panel}
          id="sidequest-panel-live"
          role="tabpanel"
          aria-labelledby="sidequest-tab-live"
          hidden={panel !== "live"}
        >
          <div className={styles.liveDisclosure}>
            <span>INTERACTIVE PORTFOLIO REPLAY</span>
            <p>No camera, microphone or location is accessed here. The original prototype used an authenticated WebSocket relay for ephemeral video; its external hackathon deployment may not always be online.</p>
            <a href="https://genesis.hiddenlayers.co.uk/live" target="_blank" rel="noreferrer">Visit the original Live URL ↗</a>
          </div>
          <div className={styles.liveGrid}>
            <article className={`${styles.broadcastStage} ${replayState === "live" ? styles.isLive : ""}`}>
              <div className={styles.stageScene} aria-label="Stylised replay of a rainy running livestream">
                <div className={styles.rain} aria-hidden="true" />
                <div className={styles.runner} aria-hidden="true"><i /><b /><span /><em /></div>
                <span className={styles.cameraLabel}>EPHEMERAL CAMERA · NOT RECORDED</span>
              </div>
              <div className={styles.stageTop}>
                <span className={styles.livePill}>{replayState === "live" ? "● LIVE REPLAY" : replayState === "finished" ? "■ RUN FINISHED" : "REPLAY READY"}</span>
                <span>{2 + cheerFeed.length} demo viewers</span>
              </div>
              <div className={styles.routeMiniMap}>
                <svg viewBox="0 0 100 86" role="img" aria-label={`Abstract replay route with ${visibleRoute.length} points`}>
                  <rect width="100" height="86" />
                  <path d="M-5 21 C18 4 36 29 58 14 S82 8 108 25M-8 72 C17 54 37 82 60 65 S84 50 109 68" />
                  <polyline points={routePolyline} />
                  <circle cx={runnerPoint[0]} cy={runnerPoint[1]} r="4" />
                </svg>
                <span>privacy-safe doodle map</span>
              </div>
              {liveChallenge !== "draft" && (
                <div className={styles.challengeOverlay}>
                  <span>NEXT-KILOMETRE CHALLENGE</span>
                  <strong>Hold an even pace · £9 to Mind</strong>
                  <p>Safety stop always wins.</p>
                  {liveChallenge === "sent" && <div><button type="button" onClick={() => setLiveChallenge("accepted")}>Accept</button><button type="button" onClick={() => setLiveChallenge("declined")}>Decline</button></div>}
                  {liveChallenge === "accepted" && <b>ACCEPTED</b>}
                  {liveChallenge === "declined" && <b>DECLINED</b>}
                </div>
              )}
              {cheerFeed.length > 0 && <div className={styles.reaction} key={`${cheerFeed.length}-${cheerFeed.at(-1)}`}>{cheerFeed.at(-1)}</div>}
              <dl className={styles.stageStats}>
                <div><dt>Distance</dt><dd>{distance.toFixed(2)} km</dd></div>
                <div><dt>Pace</dt><dd>{replayTick ? `${5 + Math.floor(replayTick / 9)}:${String(42 + (replayTick % 9)).padStart(2, "0")}` : "—"}</dd></div>
                <div><dt>Time</dt><dd>{formatTime(elapsed)}</dd></div>
              </dl>
            </article>

            <aside className={styles.liveControls}>
              <div className={styles.sectionHeading}><div><span>WATCH OTHERS</span><h2>Join the squiggle</h2></div></div>
              <div className={styles.runnerIdentity}><span>JR</span><div><strong>Javi&apos;s demo run</strong><small>{replayState === "live" ? "Route updating now" : replayState === "finished" ? "Replay complete" : "Waiting at the start"}</small></div></div>
              <button type="button" className={styles.replayButton} onClick={startReplay}>{replayState === "live" ? "Restart replay" : replayState === "finished" ? "Run replay again" : "Start live replay"}</button>
              <div className={styles.cheerControls}>
                <span>SEND A CHEER</span>
                <div>{cheers.map((cheer) => <button key={cheer} type="button" onClick={() => setCheerFeed((current) => [...current.slice(-4), cheer])} disabled={replayState !== "live"} aria-label={`Send ${cheer} cheer`}>{cheer}</button>)}</div>
              </div>
              <div className={styles.liveChallengeControl}>
                <span>FRIEND CHALLENGE</span>
                <strong>One controlled kilometre</strong>
                <p>£9 pledge commitment to Mind. No payment is charged.</p>
                <button type="button" onClick={() => setLiveChallenge("sent")} disabled={replayState !== "live" || liveChallenge !== "draft"}>Send to runner</button>
              </div>
              <ul className={styles.liveProof}>
                <li><i />Camera chunks stayed ephemeral.</li>
                <li><i />GPS became a private run observation.</li>
                <li><i />Spectators saw only rotated, coarsened geometry.</li>
                <li><i />Cheers and challenge decisions persisted.</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Source-grounded portfolio reconstruction · private activity files excluded</span>
        <a href="https://github.com/samuel-zhang01/sidequest" target="_blank" rel="noreferrer">View SideQuest source ↗</a>
      </footer>
    </div>
  );
}
