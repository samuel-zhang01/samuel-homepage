"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import ClassicSelect from "../ClassicSelect";
import { MacButton } from "./DemoChrome";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { projectText } from "@/lib/projectCopy";
import { schedulingCopy } from "./copy/schedulingCopy";
import { YASA_HOSTS, yasaCalendar, yasaDateKey, yasaSlots, validateYasaGuest, type YasaBooking, type YasaConfig, type YasaGuest, type YasaMode, type YasaSlot, type YasaTimezone } from "@/lib/yasaBookingDemo";
import styles from "./SchedulingStudio.module.css";

const EVENTS = [
  { id: "chat", title: "Project chat", duration: 30, mode: "round-robin", required: ["alex", "morgan", "riley"] },
  { id: "review", title: "Team review", duration: 45, mode: "collective", required: ["alex", "morgan"] },
  { id: "deep", title: "Technical deep dive", duration: 60, mode: "first-available", required: ["alex", "morgan", "riley"] },
] as const;
const MODES: { id: YasaMode; title: string }[] = [
  { id: "individual", title: "One host" }, { id: "round-robin", title: "Round Robin" }, { id: "collective", title: "Collective" }, { id: "first-available", title: "First Available" },
];
const TOPICS = ["Project feedback", "Technical walkthrough", "Collaboration"];
const INITIAL_CONFIG: YasaConfig = { event: "chat", duration: 30, buffer: 15, mode: "round-robin", required: ["alex", "morgan", "riley"] };
const SAMPLE_GUEST: YasaGuest = { name: "Jamie Taylor", email: "jamie@example.invalid", company: "Example Studio", topic: "Project feedback", notes: "", reminder: true };

export function SchedulingBookingFlow({ active }: { active: boolean }) {
  const locale = useProjectLocale();
  const [config, setConfig] = useState<YasaConfig>(INITIAL_CONFIG);
  const [timezone, setTimezone] = useState<YasaTimezone>("Europe/London");
  const [bookings, setBookings] = useState<YasaBooking[]>([]);
  const bookingsRef = useRef(bookings);
  const [day, setDay] = useState<string | null>(null);
  const [selection, setSelection] = useState<YasaSlot | null>(null);
  const [guest, setGuest] = useState<YasaGuest>({ ...SAMPLE_GUEST });
  const [phase, setPhase] = useState<"time" | "details" | "confirmation">("time");
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(600);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiresAt = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const slots = useMemo(() => yasaSlots(config, bookings, timezone, editingId ?? undefined), [config, bookings, timezone, editingId]);
  const days = [...new Set(slots.map((slot) => yasaDateKey(slot.start, timezone)))];
  const activeDay = day && days.includes(day) ? day : days.find((date) => slots.some((slot) => slot.free && yasaDateKey(slot.start, timezone) === date)) ?? days[0];
  const daySlots = slots.filter((slot) => yasaDateKey(slot.start, timezone) === activeDay);
  const current = bookings.find((booking) => booking.id === currentId);
  const previous = current?.previousId ? bookings.find((booking) => booking.id === current.previousId) : undefined;
  const names = (ids: string[]) => YASA_HOSTS.filter((host) => ids.includes(host.id)).map((host) => host.name).join(", ");
  const tx = (source: string) => projectText(locale, schedulingCopy, source);
  const time = (value: string, zone = timezone) => new Intl.DateTimeFormat(locale, { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
  const fullDate = (value: string, zone = timezone) => new Intl.DateTimeFormat(locale, { timeZone: zone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
  function updateBookings(next: YasaBooking[]) { bookingsRef.current = next; setBookings(next); }
  function check(action: () => void) {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    setChecking(true);
    checkTimer.current = setTimeout(() => { setChecking(false); checkTimer.current = null; action(); }, 500);
  }
  useEffect(() => () => { if (checkTimer.current) clearTimeout(checkTimer.current); }, []);
  useEffect(() => {
    if (!active || phase !== "details" || !selection) return;
    const timer = setInterval(() => setSeconds(Math.max(0, Math.ceil((expiresAt.current - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [active, phase, selection]);
  useEffect(() => {
    if (seconds || phase !== "details") return;
    setSelection(null); setPhase("time"); setMessage("Your example reservation expired. Pick a time again.");
  }, [seconds, phase]);
  useEffect(() => { stageRef.current?.focus({ preventScroll: true }); }, [phase]);

  function chooseEvent(id: string) {
    const item = EVENTS.find((candidate) => candidate.id === id)!;
    setConfig({ event: item.id, mode: item.mode, duration: item.duration, buffer: 15, required: [...item.required] });
    setSelection(null); setDay(null); setMessage("");
  }
  function changeTimezone(next: YasaTimezone) {
    setTimezone(next); setDay(null); setSelection(null); setPhase("time"); setMessage("");
  }
  function toggleRequired(id: string) {
    setConfig((previousConfig) => {
      const selected = previousConfig.required.includes(id);
      if (selected && previousConfig.required.length === 1) return previousConfig;
      return { ...previousConfig, required: selected ? previousConfig.required.filter((hostId) => hostId !== id) : [...previousConfig.required, id] };
    });
    setDay(null); setSelection(null); setMessage("");
  }
  function chooseSlot(slot: YasaSlot) {
    if (!slot.free || checking) return;
    setMessage("");
    check(() => { expiresAt.current = Date.now() + 600_000; setSelection(slot); setSeconds(600); setPhase("details"); });
  }
  function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection || checking) return;
    const invalid = validateYasaGuest(guest);
    if (invalid) { setMessage(invalid === "name" ? "Enter your name." : invalid === "email" ? "Enter a valid email address." : "Choose a discussion topic."); return; }
    const selected = selection;
    check(() => {
      const rechecked = yasaSlots(config, bookingsRef.current, timezone, editingId ?? undefined).find((slot) => slot.start === selected.start && slot.free);
      if (!rechecked || Date.now() >= expiresAt.current) { setSelection(null); setPhase("time"); setMessage("That time is no longer available. Your details are saved; choose another time."); return; }
      const id = crypto.randomUUID();
      const nextBooking: YasaBooking = { id, config: { ...config, required: [...config.required] }, slot: rechecked, guest: { ...guest, name: guest.name.trim(), email: guest.email.trim() }, timezone, status: "confirmed", ...(editingId ? { previousId: editingId } : {}) };
      updateBookings([...bookingsRef.current.map((booking) => booking.id === editingId ? { ...booking, status: "rescheduled" as const } : booking), nextBooking]);
      setCurrentId(id); setEditingId(null); setSelection(null); setPhase("confirmation"); setMessage("");
    });
  }
  function reschedule() {
    if (!current || current.status !== "confirmed") return;
    setConfig({ ...current.config, required: [...current.config.required] }); setTimezone(current.timezone); setGuest({ ...current.guest });
    setEditingId(current.id); setDay(null); setSelection(null); setPhase("time"); setMessage("Pick a new time. Your original booking stays in place until you confirm the change.");
  }
  function cancel() {
    if (!current || current.status !== "confirmed") return;
    updateBookings(bookingsRef.current.map((booking) => booking.id === current.id ? { ...booking, status: "cancelled" } : booking));
    setMessage("The example booking is cancelled. Its required hosts are available again.");
  }
  function download(booking: YasaBooking, cancellation = false) {
    const title = EVENTS.find((item) => item.id === booking.config.event)?.title ?? "Project chat";
    const blob = new Blob([yasaCalendar(booking, tx(title), cancellation)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = cancellation ? "yasa-example-cancellation.ics" : "yasa-example-invite.ics"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function simulateClash() {
    if (!selection) return;
    updateBookings([...bookingsRef.current, { id: crypto.randomUUID(), config, slot: { ...selection, hostIds: YASA_HOSTS.map((host) => host.id), optionalIds: [] }, guest: { ...SAMPLE_GUEST }, timezone, status: "confirmed" }]);
    setMessage("Another example guest took this time. Try confirming to see the final availability check.");
  }
  function reset() {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    setChecking(false); updateBookings([]); setConfig(INITIAL_CONFIG); setTimezone("Europe/London"); setDay(null); setSelection(null); setGuest({ ...SAMPLE_GUEST }); setPhase("time"); setCurrentId(null); setEditingId(null); setMessage("");
  }

  return <ProjectCopy copy={schedulingCopy}><div className={styles.guestApp}>
    <header className={styles.guestTop}><span>Example team · 16–20 November 2026</span><MacButton onClick={reset}>Reset example</MacButton></header>
    <ol className={styles.guestSteps} aria-label="Booking progress">
      {["Choose a time", "Your details", "Confirmation"].map((label, index) => <li key={label} aria-current={index === ["time", "details", "confirmation"].indexOf(phase) ? "step" : undefined}><span>{index + 1}</span><strong>{label}</strong></li>)}
    </ol>
    <div className={styles.guestLayout}>
      <aside className={styles.meetingDeck}>
        <h3>What would you like to book?</h3>
        <div className={styles.meetingChoices} role="group" aria-label="Meeting type">{EVENTS.map((item) => <button key={item.id} type="button" disabled={phase !== "time" || checking || Boolean(editingId)} aria-pressed={config.event === item.id} onClick={() => chooseEvent(item.id)}><strong>{item.title}</strong><span>{item.duration} minutes</span></button>)}</div>
        <label><span>Host allocation</span><ClassicSelect aria-label="Host allocation" value={config.mode} disabled={phase !== "time" || checking || Boolean(editingId)} onChange={(event) => { setConfig({ ...config, mode: event.target.value as YasaMode }); setDay(null); }}>
          {MODES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </ClassicSelect></label>

        {config.mode === "collective" ? <fieldset className={styles.attendance}><legend>Who needs to attend?</legend>{YASA_HOSTS.map((host) => <label key={host.id}><strong>{host.name}</strong><button type="button" disabled={phase !== "time" || checking || Boolean(editingId) || (config.required.includes(host.id) && config.required.length === 1)} aria-label={projectText(locale, schedulingCopy, "{0} attendance: {1}", { 0: host.name, 1: tx(config.required.includes(host.id) ? "Required" : "Optional") })} aria-pressed={config.required.includes(host.id)} onClick={() => toggleRequired(host.id)}>{config.required.includes(host.id) ? "Required" : "Optional"}</button></label>)}<small>At least one host stays required. Optional invitations do not reserve time.</small></fieldset> : null}
        <details className={styles.meetingDetails}><summary>Meeting details</summary>
        <p className={styles.allocationHint}>{config.mode === "collective" ? "Everyone required must be free. Optional hosts suggest better times." : config.mode === "round-robin" ? "An available host with the lowest weighted load takes the meeting." : config.mode === "first-available" ? "The highest-priority available host takes the meeting." : "Alex hosts this one-to-one meeting."}</p>
        <div className={styles.meetingFacts}><span>{config.duration} minutes</span><span>15-minute buffers</span><span>Example video call</span></div>
        <p className={styles.localNotice}>Use example details. Nothing is sent to a host, calendar or email service.</p>
        </details>
      </aside>
      <div className={styles.guestStage} ref={stageRef} tabIndex={-1} aria-busy={checking}>
        {checking ? <div className={styles.checkingLayer} role="status"><strong>Checking example calendars…</strong><div className={styles.checkingTrack}><i /></div><span>Working hours · busy time · host assignment</span></div> : null}
        {message ? <p role="status" className={styles.guestNotice}>{message}</p> : null}
        {phase === "time" ? <section key="time" className={styles.stageEnter}>
          <div className={styles.guestStageHeading}><div><h3>{editingId ? "Choose a new time" : "Choose a time"}</h3><span>{slots.filter((slot) => slot.free).length} available times this week</span></div><label><span>Your timezone</span><ClassicSelect value={timezone} aria-label="Your timezone" disabled={checking} onChange={(event) => changeTimezone(event.target.value as YasaTimezone)}><option value="Europe/London">London</option><option value="America/New_York">New York</option><option value="Asia/Tokyo">Tokyo</option></ClassicSelect></label></div>
          <div className={styles.datePicker} role="group" aria-label="Choose a date">{days.map((date) => {
            const representative = slots.find((slot) => yasaDateKey(slot.start, timezone) === date)!;
            const count = slots.filter((slot) => slot.free && yasaDateKey(slot.start, timezone) === date).length;
            return <button type="button" key={date} aria-pressed={activeDay === date} onClick={() => setDay(date)} disabled={checking}><span>{new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: timezone }).format(new Date(representative.start))}</span><strong>{new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: timezone }).format(new Date(representative.start))}</strong><small>{count} free</small></button>;
          })}</div>
          <p className={styles.dayHeading}>{activeDay ? fullDate(slots.find((slot) => yasaDateKey(slot.start, timezone) === activeDay)!.start) : "No available times"}<span>{timezone}</span></p>
          {config.mode === "collective" && config.required.length < YASA_HOSTS.length ? <p className={styles.suggestionHint}>Suggested times include the most available optional hosts for this day. Every other free time is still bookable.</p> : null}
          <div className={styles.timePicker} role="group" aria-label="Available meeting times">{daySlots.map((slot) => <button key={slot.start} type="button" disabled={!slot.free || checking} data-suggested={slot.preferred || undefined} onClick={() => chooseSlot(slot)} aria-label={projectText(locale, schedulingCopy, "{0}–{1}, {2}", { 0: time(slot.start), 1: time(slot.end), 2: tx(slot.free ? slot.preferred ? "Suggested" : "Available" : "Unavailable") })}><strong>{time(slot.start)}–{time(slot.end)}</strong><span>{slot.free ? slot.preferred ? "Suggested" : names(slot.hostIds) : "Unavailable"}</span>{config.mode === "collective" && slot.free && slot.optionalIds.length > 0 ? <small>{slot.optionalAvailable}/{slot.optionalIds.length} optional hosts free</small> : null}</button>)}</div>
          {editingId ? <MacButton onClick={() => { setEditingId(null); setPhase("confirmation"); setMessage(""); }}>Keep original booking</MacButton> : null}
          {bookings.filter((booking) => booking.status === "confirmed" && booking.id !== editingId).length > 0 ? <details className={styles.recentBookings}><summary>Manage example bookings</summary>{bookings.filter((booking) => booking.status === "confirmed" && booking.id !== editingId).map((booking) => <button type="button" key={booking.id} onClick={() => { setCurrentId(booking.id); setPhase("confirmation"); }}>{fullDate(booking.slot.start)} · {time(booking.slot.start)}</button>)}</details> : null}
        </section> : null}
        {phase === "details" && selection ? <section key="details" className={styles.stageEnter}>
          <div className={styles.guestStageHeading}><div><h3>Your details</h3><span>{fullDate(selection.start)} · {time(selection.start)}–{time(selection.end)}</span></div><span className={styles.reservationBadge}>Held for {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></div>
          <p className={styles.guestHostSummary}>Required: {names(selection.hostIds)}{selection.optionalIds.length > 0 ? <> · Optional: {names(selection.optionalIds)}</> : null}</p>
          <form className={styles.guestForm} onSubmit={confirm}>
            <label><span>Your name *</span><input required maxLength={80} autoComplete="off" value={guest.name} disabled={checking} onChange={(event) => setGuest({ ...guest, name: event.target.value })} /></label>
            <label><span>Email *</span><input type="email" required maxLength={254} autoComplete="off" value={guest.email} disabled={checking} onChange={(event) => setGuest({ ...guest, email: event.target.value })} /></label>
            <label><span>Company</span><input maxLength={80} value={guest.company} disabled={checking} onChange={(event) => setGuest({ ...guest, company: event.target.value })} /></label>
            <label><span>Discussion topic *</span><ClassicSelect aria-label="Discussion topic" value={guest.topic} disabled={checking} onChange={(event) => setGuest({ ...guest, topic: event.target.value })}><option value="">Choose a topic</option>{TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</ClassicSelect></label>
            <label className={styles.wideField}><span>What would you like to cover?</span><textarea rows={3} maxLength={400} value={guest.notes} disabled={checking} onChange={(event) => setGuest({ ...guest, notes: event.target.value })} /><small>{guest.notes.length}/400 characters</small></label>
            <label className={styles.reminderField}><input type="checkbox" checked={guest.reminder} disabled={checking} onChange={(event) => setGuest({ ...guest, reminder: event.target.checked })} /><span>Include a 15-minute reminder in the calendar file</span></label>
            <div className={styles.guestActions}><MacButton type="submit" primary disabled={checking}>{editingId ? "Confirm new time" : "Confirm example booking"}</MacButton><MacButton disabled={checking} onClick={() => { setSelection(null); setPhase("time"); }}>Back to times</MacButton></div>
          </form>
          <details className={styles.clashControl}><summary>Try the final availability check</summary><MacButton disabled={checking} onClick={simulateClash}>Simulate time being taken</MacButton></details>
        </section> : null}
        {phase === "confirmation" && current ? <section key={current.id + current.status} className={`${styles.stageEnter} ${styles.confirmationCard}`}>
          <div className={styles.confirmationMark} aria-hidden="true">{current.status === "cancelled" ? "×" : "✓"}</div><h3>{current.status === "cancelled" ? "Booking cancelled" : current.previousId ? "Your time has changed" : "You’re booked in this example"}</h3>
          <p className={styles.deliveryState}>Local confirmation · no invitation sent</p>
          <dl className={styles.invitePreview}><div><dt>Meeting</dt><dd>{EVENTS.find((item) => item.id === current.config.event)?.title}</dd></div><div><dt>When</dt><dd>{fullDate(current.slot.start, current.timezone)}<small>{time(current.slot.start, current.timezone)}–{time(current.slot.end, current.timezone)} · {current.timezone}</small></dd></div><div><dt>Required hosts</dt><dd>{names(current.slot.hostIds)}</dd></div>{current.slot.optionalIds.length > 0 ? <div><dt>Optional hosts</dt><dd>{names(current.slot.optionalIds)}</dd></div> : null}<div><dt>Guest</dt><dd translate="no">{current.guest.name}<small>{current.guest.email}</small></dd></div><div><dt>Discussion topic</dt><dd>{current.guest.topic}</dd></div>{current.guest.notes ? <div><dt>Your notes</dt><dd translate="no">{current.guest.notes}</dd></div> : null}</dl>
          {previous ? <p className={styles.replacedTime}>Original time released: {fullDate(previous.slot.start, previous.timezone)} · {time(previous.slot.start, previous.timezone)}</p> : null}
          <div className={styles.guestActions}><MacButton primary onClick={() => download(current, current.status === "cancelled")}>{current.status === "cancelled" ? "Download cancellation (.ics)" : "Download calendar invite (.ics)"}</MacButton>{current.status === "confirmed" ? <><MacButton onClick={reschedule}>Reschedule</MacButton><MacButton onClick={cancel}>Cancel booking</MacButton></> : null}{previous ? <MacButton onClick={() => download(previous, true)}>Download old cancellation (.ics)</MacButton> : null}<MacButton onClick={() => { setDay(null); setSelection(null); setPhase("time"); setMessage(""); }}>Back to availability</MacButton></div>
          <p className={styles.calendarFileHint}>The calendar file contains the displayed time in UTC and keeps optional attendance roles. Import it only if you want this example in your calendar.</p>
        </section> : null}
      </div>
    </div>
  </div></ProjectCopy>;
}
