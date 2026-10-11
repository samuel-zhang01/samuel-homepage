"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { getApplicationIcon } from "@/lib/iconIdentity";
import { System7Icon } from "./System7Icon";
import SecretUniverseCanvas from "./SecretUniverseCanvas";
import { secretCopy, secretThoughts } from "./secretCopy";
import styles from "./SecretApp.module.css";

type Ritual = "idle" | "offering" | "listening" | "aligning" | "answered";
const ORACLE_DELAY = 2800;

export default function SecretApp({ locale, active }: { locale: Locale; active: boolean }) {
  const [curvature, setCurvature] = useState(68);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [thought, setThought] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [moment, setMoment] = useState(0);
  const [invocation, setInvocation] = useState(0);
  const [ritual, setRitual] = useState<Ritual>("idle");
  const asking = useRef(false);
  const oracleRef = useRef<HTMLDivElement>(null);
  const busy = ritual === "offering" || ritual === "listening" || ritual === "aligning";
  const t = (source: string) => projectText(locale, secretCopy, source);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches || document.documentElement.dataset.reduceEffects === "true");
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduce-effects"] });
    preference.addEventListener("change", update);
    update();
    return () => { observer.disconnect(); preference.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    if (!invocation) return;
    const scroll = requestAnimationFrame(() => oracleRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }));
    const timers = [
      window.setTimeout(() => setRitual("listening"), 900),
      window.setTimeout(() => setRitual("aligning"), 1800),
      window.setTimeout(() => {
        setThought(value => (value + 1 + Math.floor(Math.random() * (secretThoughts.length - 1))) % secretThoughts.length);
        setRitual("answered");
        asking.current = false;
      }, ORACLE_DELAY),
      window.setTimeout(() => setRitual("idle"), ORACLE_DELAY + 900),
    ];
    return () => { cancelAnimationFrame(scroll); timers.forEach(clearTimeout); };
  }, [invocation]);

  const ask = () => {
    if (asking.current) return;
    asking.current = true;
    setRitual("offering");
    setInvocation(value => value + 1);
  };

  return <section className={styles.app} lang={locale} data-secret-screen>
    <header className={styles.heading}>
      <div className={styles.identity} aria-hidden="true"><System7Icon kind={getApplicationIcon("secret")} /></div>
      <div>
        <p className={styles.eyebrow}>{t("INSTITUTE OF APPLIED NONSENSE")}</p>
        <h2>{t("You found a loophole in reality.")}</h2>
        <p className={styles.intro}>{t("Reality has entered debug mode. Leave your five-year plan in the fume cupboard.")}</p>
      </div>
    </header>

    <div className={styles.observatory}>
      <SecretUniverseCanvas curvature={curvature} seed={seed} moment={moment} running={active && !paused && !reducedMotion} invoking={busy}
        description={t("A continuous mathematical daydream: fractals, knots, higher-dimensional objects, strange attractors, interference patterns and orbital-inspired shapes.")} fallbackText={t("Hand-drawn universe. The orb is on annual leave.")} />
      <div className={styles.instrumentBar}><span>{t("PEER REVIEW PENDING. VIBES ACCEPTED.")}</span><span aria-hidden="true">#{String(seed).padStart(6, "0")}</span></div>
      <div className={styles.readout}>
        <span>{t(reducedMotion ? "A still universe. Equally mysterious." : paused ? "Time is taking a tea break." : "Reality is currently a suggestion.")}</span>
        <button type="button" className="s7-button" onClick={() => reducedMotion ? setMoment(value => value + 1) : setPaused(value => !value)}
          aria-pressed={reducedMotion ? undefined : paused}>
          {t(reducedMotion ? "Advance a moment" : paused ? "Resume time" : "Freeze time")}
        </button>
      </div>
    </div>

    <div className={styles.controls}>
      <div className={styles.journey}>
        <span>{t("One universe. Several unresolved dependencies.")}</span>
        <button type="button" className="s7-button" onClick={() => setSeed(value => (value + 1 + Math.floor(Math.random() * 999999)) % 1000000)}>{t("Restart the universe")}</button>
      </div>
      <label className={styles.curvature}>
        <span>{t("Bend the rules")}</span>
        <input type="range" min="0" max="100" value={curvature} aria-label={t("Curvature")} onChange={event => setCurvature(Number(event.target.value))} />
        <output>{curvature}%</output>
      </label>
    </div>

    <div ref={oracleRef} className={styles.oracle} data-ritual={ritual} data-still={reducedMotion || paused || !active}>
      <div className={styles.oracleHeading}><span>{t(busy ? "SMALL CEREMONY. BIG NONSENSE." : "THE ORB HAS A THOUGHT")}</span><span aria-hidden="true">{String(thought + 1).padStart(2, "0")} / ∞</span></div>
      <div className={styles.oracleBody}>
        {busy && <div className={styles.ritual}>
          <div className={styles.seal} aria-hidden="true"><i /><i /><i /><span /></div>
          <div className={styles.invocation}>
            <p role="status">{t(ritual === "offering" ? "Compiling one extremely unnecessary question…" : ritual === "listening" ? "Removing spectator ions from the group chat…" : "Waiting for the orb to pass peer review…")}</p>
            <small>{t("Breathe in. Breathe out. Your deadline is not a conserved quantity.")}</small>
          </div>
        </div>}
        <blockquote aria-live="polite" aria-atomic="true" aria-busy={busy} hidden={busy}>{t(secretThoughts[thought])}</blockquote>
      </div>
      <div className={styles.actions}>
        <button type="button" className="s7-button" onClick={ask} disabled={busy}>{t(busy ? "Awaiting unlicensed wisdom…" : "Ask the orb")}</button>
        <small>{t("Euclid has left the chat.")}</small>
      </div>
    </div>
    <footer className={styles.footer}>{t("Nothing here improves conversion. The nonsense is rigorously untested.")}</footer>
  </section>;
}
