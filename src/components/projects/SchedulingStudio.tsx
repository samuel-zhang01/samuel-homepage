"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./SchedulingStudio.module.css";

type DayId = "mon" | "tue" | "wed" | "thu" | "fri";
type Mode = "individual" | "round-robin" | "collective" | "first-available";
type Timezone = "Europe/London" | "America/New_York" | "Asia/Tokyo";

type Window = { day: DayId; start: number; end: number };
type Host = {
  id: string;
  name: string;
  role: string;
  weight: number;
  assigned: number;
  priority: number;
  windows: Window[];
};
type Hold = {
  id: number;
  hostIds: string[];
  day: DayId;
  start: number;
  duration: number;
};
type SlotResult = {
  state: "available" | "conflict" | "outside";
  hostIds: string[];
  reason: string;
};

const DAYS: { id: DayId; short: string; date: string; iso: string }[] = [
  { id: "mon", short: "Mon", date: "24 Aug", iso: "2026-08-24" },
  { id: "tue", short: "Tue", date: "25 Aug", iso: "2026-08-25" },
  { id: "wed", short: "Wed", date: "26 Aug", iso: "2026-08-26" },
  { id: "thu", short: "Thu", date: "27 Aug", iso: "2026-08-27" },
  { id: "fri", short: "Fri", date: "28 Aug", iso: "2026-08-28" },
];

const SOURCE_TIMEZONE: Timezone = "Europe/London";

const MODE_COPY: Record<Mode, { title: string; rule: string; detail: string }> = {
  individual: {
    title: "Individual",
    rule: "one host",
    detail: "Publish the selected host’s free windows after buffers and existing bookings are removed.",
  },
  "round-robin": {
    title: "Round Robin",
    rule: "weighted union",
    detail: "Expose the union of host availability, then assign an eligible host using current load and weight.",
  },
  collective: {
    title: "Collective",
    rule: "intersection",
    detail: "Only expose a slot when every selected host is free for the complete buffered interval.",
  },
  "first-available": {
    title: "First Available",
    rule: "priority union",
    detail: "Expose the union of free slots and resolve each choice to the highest-priority eligible host.",
  },
};

const HOSTS: Host[] = [
  {
    id: "host-a",
    name: "Alex",
    role: "Product",
    weight: 2,
    assigned: 3,
    priority: 2,
    windows: [
      { day: "mon", start: 540, end: 900 },
      { day: "tue", start: 660, end: 1020 },
      { day: "wed", start: 540, end: 840 },
      { day: "thu", start: 720, end: 1020 },
    ],
  },
  {
    id: "host-b",
    name: "Morgan",
    role: "Engineering",
    weight: 1,
    assigned: 2,
    priority: 1,
    windows: [
      { day: "mon", start: 660, end: 1020 },
      { day: "tue", start: 540, end: 840 },
      { day: "wed", start: 600, end: 960 },
      { day: "fri", start: 540, end: 900 },
    ],
  },
  {
    id: "host-c",
    name: "Riley",
    role: "Research",
    weight: 1,
    assigned: 1,
    priority: 3,
    windows: [
      { day: "mon", start: 600, end: 840 },
      { day: "wed", start: 720, end: 1020 },
      { day: "thu", start: 540, end: 900 },
      { day: "fri", start: 660, end: 1020 },
    ],
  },
];

const INITIAL_HOLDS: Hold[] = [
  { id: 1, hostIds: ["host-a"], day: "mon", start: 660, duration: 60 },
  { id: 2, hostIds: ["host-b"], day: "wed", start: 720, duration: 60 },
  { id: 3, hostIds: ["host-c"], day: "thu", start: 600, duration: 60 },
];

function zonedParts(instant: Date, timezone: Timezone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: read("year"), month: read("month"), day: read("day"), hour: read("hour"), minute: read("minute") };
}

function timezoneOffsetMs(instant: Date, timezone: Timezone) {
  const part = zonedParts(instant, timezone);
  return Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute) - instant.getTime();
}

function sourceInstant(day: DayId, minutes: number) {
  const iso = DAYS.find((item) => item.id === day)?.iso ?? DAYS[0].iso;
  const [year, month, date] = iso.split("-").map(Number);
  const localWallClock = Date.UTC(year, month - 1, date, Math.floor(minutes / 60), minutes % 60);
  let guess = new Date(localWallClock);
  for (let iteration = 0; iteration < 2; iteration += 1) {
    guess = new Date(localWallClock - timezoneOffsetMs(guess, SOURCE_TIMEZONE));
  }
  return guess;
}

function zonedSlot(day: DayId, minutes: number, timezone: Timezone) {
  const instant = sourceInstant(day, minutes);
  const target = zonedParts(instant, timezone);
  const sourceIso = DAYS.find((item) => item.id === day)?.iso ?? DAYS[0].iso;
  const targetIso = `${target.year}-${String(target.month).padStart(2, "0")}-${String(target.day).padStart(2, "0")}`;
  const dayShift = targetIso === sourceIso ? "" : targetIso > sourceIso ? "+1d" : "−1d";
  return {
    time: `${String(target.hour).padStart(2, "0")}:${String(target.minute).padStart(2, "0")}`,
    dayShift,
    full: new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).format(instant),
  };
}

function timeLabel(day: DayId, minutes: number, timezone: Timezone) {
  return zonedSlot(day, minutes, timezone).time;
}

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

function inWindow(host: Host, day: DayId, start: number, end: number) {
  return host.windows.some((window) => window.day === day && start >= window.start && end <= window.end);
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function calendarCellKey(day: DayId, start: number) {
  return `${day}:${start}`;
}

export function SchedulingStudio() {
  const [mode, setMode] = useState<Mode>("round-robin");
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>(HOSTS.map((host) => host.id));
  const [duration, setDuration] = useState(60);
  const [buffer, setBuffer] = useState(15);
  const [timezone, setTimezone] = useState<Timezone>("Europe/London");
  const [holds, setHolds] = useState<Hold[]>(INITIAL_HOLDS);
  const [selection, setSelection] = useState<{ day: DayId; start: number; hostIds: string[] } | null>(null);
  const [reservationSeconds, setReservationSeconds] = useState(600);
  const [message, setMessage] = useState("");
  const [rovingSlotKey, setRovingSlotKey] = useState<string | null>(null);
  const slotButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  const selectedHosts = useMemo(
    () => HOSTS.filter((host) => selectedHostIds.includes(host.id)),
    [selectedHostIds],
  );
  const generatedStartsByHostDay = useMemo(() => {
    const generated = new Map<string, Set<number>>();
    const totalBlock = buffer + duration + buffer;
    selectedHosts.forEach((host) => {
      host.windows.forEach((availabilityWindow) => {
        const key = `${host.id}:${availabilityWindow.day}`;
        const starts = generated.get(key) ?? new Set<number>();
        for (
          let blockStart = availabilityWindow.start;
          blockStart + totalBlock <= availabilityWindow.end;
          blockStart += totalBlock
        ) {
          starts.add(blockStart + buffer);
        }
        generated.set(key, starts);
      });
    });
    return generated;
  }, [buffer, duration, selectedHosts]);
  const candidateStartsByDay = useMemo(() => {
    const candidateHosts = mode === "collective" || mode === "individual"
      ? selectedHosts.slice(0, 1)
      : selectedHosts;
    return Object.fromEntries(DAYS.map((day) => {
      const starts = new Set<number>();
      candidateHosts.forEach((host) => {
        generatedStartsByHostDay.get(`${host.id}:${day.id}`)?.forEach((start) => starts.add(start));
      });
      return [day.id, [...starts].sort((left, right) => left - right)];
    })) as Record<DayId, number[]>;
  }, [generatedStartsByHostDay, mode, selectedHosts]);
  const candidateStarts = useMemo(() => {
    const starts = new Set(DAYS.flatMap((day) => candidateStartsByDay[day.id]));
    return [...starts].sort((left, right) => left - right);
  }, [candidateStartsByDay]);

  useEffect(() => {
    if (!selection) return;
    const timer = window.setInterval(() => {
      setReservationSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [selection]);

  useEffect(() => {
    if (!selection || reservationSeconds > 0) return;
    setSelection(null);
    setReservationSeconds(600);
    setMessage("The temporary reservation expired. Choose the slot again to revalidate it.");
  }, [reservationSeconds, selection]);

  function generatedSlotIsFree(host: Host, day: DayId, start: number, ignoreReservation: boolean) {
    if (!generatedStartsByHostDay.get(`${host.id}:${day}`)?.has(start)) return false;
    const bufferedStart = start - buffer;
    const bufferedEnd = start + duration + buffer;
    if (!inWindow(host, day, bufferedStart, bufferedEnd)) return false;
    const bookingConflict = holds.some((hold) => (
      hold.day === day
      && hold.hostIds.includes(host.id)
      && overlaps(bufferedStart, bufferedEnd, hold.start, hold.start + hold.duration)
    ));
    const reservationConflict = !ignoreReservation
      && selection?.day === day
      && selection.hostIds.includes(host.id)
      && selection.start === start;
    return !bookingConflict && !reservationConflict;
  }

  function generatedIntervalsCover(host: Host, day: DayId, start: number, ignoreReservation: boolean) {
    const starts = [...(generatedStartsByHostDay.get(`${host.id}:${day}`) ?? [])]
      .filter((candidateStart) => generatedSlotIsFree(host, day, candidateStart, ignoreReservation))
      .sort((left, right) => left - right);
    const merged = starts.reduce<Array<{ start: number; end: number }>>((intervals, candidateStart) => {
      const candidateEnd = candidateStart + duration;
      const previous = intervals.at(-1);
      if (previous && candidateStart <= previous.end) previous.end = Math.max(previous.end, candidateEnd);
      else intervals.push({ start: candidateStart, end: candidateEnd });
      return intervals;
    }, []);
    return merged.some((interval) => interval.start <= start && interval.end >= start + duration);
  }

  function eligibleHosts(day: DayId, start: number, ignoreReservation = false) {
    const anchorId = selectedHosts[0]?.id;
    return selectedHosts.filter((host) => (
      mode === "collective" && host.id !== anchorId
        ? generatedIntervalsCover(host, day, start, ignoreReservation)
        : generatedSlotIsFree(host, day, start, ignoreReservation)
    ));
  }

  function allocationScore(host: Host) {
    const newAssignments = holds.filter((hold) => hold.id > 3 && hold.hostIds.includes(host.id)).length;
    return (host.assigned + newAssignments) / host.weight;
  }

  function hostsForSlot(day: DayId, start: number): SlotResult {
    if (!selectedHosts.length) return { state: "outside", hostIds: [], reason: "Choose at least one host" };
    const eligible = eligibleHosts(day, start);

    if (mode === "collective") {
      if (eligible.length === selectedHosts.length) {
        return { state: "available", hostIds: selectedHosts.map((host) => host.id), reason: "Every selected host is free" };
      }
      const blocked = selectedHosts.filter((host) => !eligible.includes(host));
      const outsideWindow = blocked.filter((host) => (
        !inWindow(host, day, start - buffer, start + duration + buffer)
      ));
      return {
        state: outsideWindow.length ? "outside" : "conflict",
        hostIds: [],
        reason: outsideWindow.length
          ? `${outsideWindow.map((host) => host.name).join(", ")} outside buffered working window`
          : `${blocked.map((host) => host.name).join(", ")} generated free intervals do not cover the anchor slot`,
      };
    }

    if (!eligible.length) {
      const rawWindow = selectedHosts.some((host) => inWindow(host, day, start, start + duration));
      const bufferedWindow = selectedHosts.some((host) => inWindow(host, day, start - buffer, start + duration + buffer));
      if (!rawWindow) return { state: "outside", hostIds: [], reason: "Outside working windows" };
      if (!bufferedWindow) return { state: "outside", hostIds: [], reason: "Buffer crosses the working-window boundary" };
      return { state: "conflict", hostIds: [], reason: "Busy booking or temporary reservation" };
    }

    if (mode === "individual") {
      const host = selectedHosts[0];
      return eligible.includes(host)
        ? { state: "available", hostIds: [host.id], reason: `${host.name} is free` }
        : { state: "conflict", hostIds: [], reason: `${host.name} is busy` };
    }

    const ranked = [...eligible].sort((a, b) => {
      if (mode === "first-available") return a.priority - b.priority;
      const scoreDifference = allocationScore(a) - allocationScore(b);
      return scoreDifference || a.name.localeCompare(b.name);
    });
    return {
      state: "available",
      hostIds: [ranked[0].id],
      reason: mode === "round-robin"
        ? `${ranked[0].name} has the lowest weighted load`
        : `${ranked[0].name} is the highest-priority free host`,
    };
  }

  const slotResults = DAYS.flatMap((day) => (
    candidateStarts.map((start) => ({
      day: day.id,
      start,
      ...(!candidateStartsByDay[day.id].includes(start)
        ? { state: "outside" as const, hostIds: [], reason: "No source-generated candidate at this time" }
        : selection?.day === day.id && selection.start === start
        ? { state: "available" as const, hostIds: selection.hostIds, reason: "Reserved for this browser session" }
        : hostsForSlot(day.id, start)),
    }))
  ));

  const generatedCalendarCells = useMemo(() => candidateStarts.flatMap((start) => (
    DAYS
      .filter((day) => candidateStartsByDay[day.id].includes(start))
      .map((day) => ({ day: day.id, start, key: calendarCellKey(day.id, start) }))
  )), [candidateStarts, candidateStartsByDay]);
  const generatedCalendarCellKeys = useMemo(
    () => new Set(generatedCalendarCells.map((cell) => cell.key)),
    [generatedCalendarCells],
  );
  const preferredRovingSlotKey = generatedCalendarCells.find((cell) => (
    slotResults.find((slot) => slot.day === cell.day && slot.start === cell.start)?.state === "available"
  ))?.key ?? generatedCalendarCells[0]?.key ?? null;
  const activeRovingSlotKey = rovingSlotKey && generatedCalendarCellKeys.has(rovingSlotKey)
    ? rovingSlotKey
    : preferredRovingSlotKey;

  useEffect(() => {
    if (rovingSlotKey !== activeRovingSlotKey) setRovingSlotKey(activeRovingSlotKey);
  }, [activeRovingSlotKey, rovingSlotKey]);

  const evaluatedSlots = slotResults.filter((slot) => candidateStartsByDay[slot.day].includes(slot.start));
  const availabilityCount = evaluatedSlots.filter((slot) => slot.state === "available").length;
  const candidateSlots = DAYS.reduce((total, day) => total + candidateStartsByDay[day.id].length, 0);
  const constraintsRemoved = candidateSlots - availabilityCount;
  const removalReasons = [...evaluatedSlots
    .filter((slot) => slot.state !== "available")
    .reduce((counts, slot) => counts.set(slot.reason, (counts.get(slot.reason) ?? 0) + 1), new Map<string, number>())]
    .sort((left, right) => right[1] - left[1]);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setSelection(null);
    setMessage("");
    if (nextMode === "individual") setSelectedHostIds((current) => [current[0] ?? HOSTS[0].id]);
    else if (selectedHostIds.length < 2) setSelectedHostIds(HOSTS.map((host) => host.id));
  }

  function toggleHost(hostId: string) {
    setSelection(null);
    setMessage("");
    if (mode === "individual") {
      setSelectedHostIds([hostId]);
      return;
    }
    setSelectedHostIds((current) => (
      current.includes(hostId)
        ? current.length === 1 ? current : current.filter((id) => id !== hostId)
        : [...current, hostId]
    ));
  }

  function selectSlot(day: DayId, start: number) {
    const result = hostsForSlot(day, start);
    if (result.state !== "available") return;
    setSelection({ day, start, hostIds: result.hostIds });
    setReservationSeconds(600);
    setMessage("");
  }

  function moveRovingFocus(target: { key: string } | undefined) {
    if (!target) return;
    setRovingSlotKey(target.key);
    const button = slotButtonRefs.current.get(target.key);
    button?.focus();
    button?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function handleSlotKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, day: DayId, start: number) {
    const row = generatedCalendarCells.filter((cell) => cell.start === start);
    const column = generatedCalendarCells.filter((cell) => cell.day === day);
    const rowIndex = row.findIndex((cell) => cell.day === day);
    const columnIndex = column.findIndex((cell) => cell.start === start);
    const firstOrLast = event.ctrlKey || event.metaKey ? generatedCalendarCells : row;
    let target: { key: string } | undefined;

    switch (event.key) {
      case "ArrowLeft":
        target = row[rowIndex - 1];
        break;
      case "ArrowRight":
        target = row[rowIndex + 1];
        break;
      case "ArrowUp":
        target = column[columnIndex - 1];
        break;
      case "ArrowDown":
        target = column[columnIndex + 1];
        break;
      case "Home":
        target = firstOrLast[0];
        break;
      case "End":
        target = firstOrLast.at(-1);
        break;
      default:
        return;
    }

    event.preventDefault();
    moveRovingFocus(target);
  }

  function confirmBooking() {
    if (!selection) return;
    const revalidatedHosts = eligibleHosts(selection.day, selection.start, true);
    const reservedHostsStillFree = selection.hostIds.every((hostId) => (
      revalidatedHosts.some((host) => host.id === hostId)
    ));
    if (!reservedHostsStillFree) {
      setSelection(null);
      setMessage("Availability changed during revalidation. No booking was created.");
      return;
    }
    const hostIds = selection.hostIds;
    setHolds((current) => [
      ...current,
      { id: Math.max(...current.map((hold) => hold.id), 0) + 1, hostIds, day: selection.day, start: selection.start, duration },
    ]);
    const day = DAYS.find((item) => item.id === selection.day)!;
    const names = HOSTS.filter((host) => hostIds.includes(host.id)).map((host) => host.name).join(" + ");
    setMessage(`Confirmed ${day.short} ${day.date}, ${timeLabel(selection.day, selection.start, timezone)} with ${names}. The temporary reservation became a booking.`);
    setSelection(null);
  }

  function testCompetingRequest() {
    if (!selection) return;
    const blocked = selection.hostIds.every((hostId) => (
      !eligibleHosts(selection.day, selection.start).some((host) => host.id === hostId)
    ));
    setMessage(blocked
      ? "Competing request rejected: the temporary reservation already owns this host/slot key."
      : "Competing request reached an unreserved host. Recheck the selected allocation before committing.");
  }

  const selectedDay = selection ? DAYS.find((day) => day.id === selection.day) : null;
  const selectedNames = selection
    ? HOSTS.filter((host) => selection.hostIds.includes(host.id)).map((host) => host.name).join(" + ")
    : "";

  return (
    <DemoWindow
      appName="YASA · AVAILABILITY ENGINE"
      title="Multi-host Scheduling Lab"
      status="SOURCE-GROUNDED SANDBOX"
      statusTone="safe"
      footer={
        <>
          <span>{availabilityCount} bookable of {candidateSlots} evaluated slots</span>
          <span>All records synthetic · no Graph, email or database connection</span>
        </>
      }
    >
      <div className={styles.disclosure} role="note">
        <span aria-hidden="true">i</span>
        <p><strong>Real scheduling rules, fictional calendars.</strong> This browser port mirrors the repository’s four scheduling modes, buffered working-window constraints, weighted allocation, IANA timezone display, temporary reservations and final revalidation.</p>
      </div>

      <div className={styles.modeTabs} aria-label="Scheduling mode">
        {(Object.keys(MODE_COPY) as Mode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={mode === item ? styles.modeActive : ""}
            onClick={() => changeMode(item)}
            aria-pressed={mode === item}
          >
            <strong>{MODE_COPY[item].title}</strong>
            <span>{MODE_COPY[item].rule}</span>
          </button>
        ))}
      </div>

      <div className={styles.ruleStrip}>
        <span>ALGORITHM</span>
        <p>{MODE_COPY[mode].detail}</p>
        <code>{mode === "collective" ? "A ∩ B ∩ C" : mode === "individual" ? "A − busy" : "A ∪ B ∪ C"}</code>
      </div>

      <div className={styles.controlDeck}>
        <section aria-labelledby="host-heading">
          <div className={styles.sectionTitle}><span>01</span><strong id="host-heading">Hosts in rotation</strong></div>
          <div className={styles.hostGrid}>
            {HOSTS.map((host) => {
              const selected = selectedHostIds.includes(host.id);
              return (
                <button
                  key={host.id}
                  type="button"
                  className={selected ? styles.hostSelected : ""}
                  onClick={() => toggleHost(host.id)}
                  aria-pressed={selected}
                >
                  <span className={styles.avatar} aria-hidden="true">{host.name[0]}</span>
                  <span><strong>{host.name}</strong><small>{host.role}</small></span>
                  <span className={styles.load}><b>{host.assigned}</b><small>load</small></span>
                  <span className={styles.weight}><b>{mode === "first-available" ? `P${host.priority}` : `${host.weight}×`}</b><small>{mode === "first-available" ? "priority" : "weight"}</small></span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="constraint-heading">
          <div className={styles.sectionTitle}><span>02</span><strong id="constraint-heading">Booking constraints</strong></div>
          <div className={styles.constraintGrid}>
            <label><span>Duration</span><select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setSelection(null); }}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option></select></label>
            <label><span>Buffer each side</span><select value={buffer} onChange={(event) => { setBuffer(Number(event.target.value)); setSelection(null); }}><option value={0}>None</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option></select></label>
            <label><span>Display timezone</span><select value={timezone} onChange={(event) => setTimezone(event.target.value as Timezone)}><option value="Europe/London">London</option><option value="America/New_York">New York</option><option value="Asia/Tokyo">Tokyo</option></select></label>
          </div>
        </section>
      </div>

      <div className={styles.metrics} aria-label="Availability calculation summary">
        <div><strong>{candidateSlots}</strong><span>candidate slots</span></div>
        <div><strong>{constraintsRemoved}</strong><span>constraints removed</span></div>
        <div><strong>{availabilityCount}</strong><span>published slots</span></div>
        <div><strong>{buffer * 2 + duration}m</strong><span>reserved interval</span></div>
      </div>

      <div className={styles.workspace}>
        <section className={styles.calendarPanel} aria-labelledby="slot-heading">
          <div className={styles.panelHeader}>
            <div><span>03 · AVAILABILITY RESULT</span><h3 id="slot-heading">24–28 August · London source dates</h3></div>
            <div className={styles.legend}><span data-state="available">Bookable</span><span data-state="conflict">Busy</span><span data-state="outside">Outside</span></div>
          </div>
          <p className={styles.keyboardHelp} id="scheduling-slot-navigation-help">
            <strong>Keyboard:</strong> Tab enters the calendar once. Use <kbd>←</kbd><kbd>→</kbd> across a time row, <kbd>↑</kbd><kbd>↓</kbd> within a day, and <kbd>Home</kbd>/<kbd>End</kbd> for row edges. <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Home</kbd>/<kbd>End</kbd> moves to the first or last generated slot. Busy and outside cells remain readable; only bookable cells activate.
          </p>
          <div
            className={styles.calendarScroll}
            role="group"
            aria-label="Generated scheduling slots"
            aria-describedby="scheduling-slot-navigation-help"
          >
            <div className={styles.calendar}>
              <span className={styles.timeCorner}>{timezone === "Europe/London" ? "LON" : timezone === "America/New_York" ? "NYC" : "TYO"}</span>
              {DAYS.map((day) => <strong className={styles.day} key={day.id}>{day.short}<small>{day.date}</small></strong>)}
              {candidateStarts.map((start) => {
                const rowTime = zonedSlot("mon", start, timezone);
                return (
                <div className={styles.calendarRow} key={start}>
                  <span className={styles.time}>{rowTime.time}{rowTime.dayShift && <small>{rowTime.dayShift}</small>}</span>
                  {DAYS.map((day) => {
                    const slot = slotResults.find((item) => item.day === day.id && item.start === start)!;
                    if (!candidateStartsByDay[day.id].includes(start)) {
                      return <span className={styles.emptyCell} aria-hidden="true" key={day.id}>·</span>;
                    }
                    const isSelected = selection?.day === day.id && selection.start === start;
                    const hostInitials = HOSTS.filter((host) => slot.hostIds.includes(host.id)).map((host) => host.name[0]).join("+");
                    const displaySlot = zonedSlot(day.id, start, timezone);
                    const cellKey = calendarCellKey(day.id, start);
                    return (
                      <button
                        key={day.id}
                        ref={(element) => {
                          if (element) slotButtonRefs.current.set(cellKey, element);
                          else slotButtonRefs.current.delete(cellKey);
                        }}
                        type="button"
                        data-state={slot.state}
                        className={isSelected ? styles.slotSelected : ""}
                        aria-disabled={slot.state !== "available"}
                        onClick={() => selectSlot(day.id, start)}
                        onFocus={() => setRovingSlotKey(cellKey)}
                        onKeyDown={(event) => handleSlotKeyDown(event, day.id, start)}
                        tabIndex={cellKey === activeRovingSlotKey ? 0 : -1}
                        title={slot.reason}
                        aria-label={`${displaySlot.full}: ${slot.reason}`}
                        aria-pressed={isSelected}
                      >
                        <span>{slot.state === "available" ? hostInitials : slot.state === "conflict" ? "×" : "·"}</span>
                        {slot.state === "available" && <small>{slot.reason}</small>}
                      </button>
                    );
                  })}
                </div>
                );
              })}
            </div>
          </div>
          {removalReasons.length > 0 && (
            <details className={styles.slotAudit}>
              <summary>{constraintsRemoved} generated candidates removed — inspect reasons</summary>
              <ul>
                {removalReasons.map(([reason, count]) => <li key={reason}><strong>{count}</strong><span>{reason}</span></li>)}
              </ul>
            </details>
          )}
        </section>

        <aside className={styles.reservationPanel} aria-labelledby="reservation-heading">
          <div className={styles.panelHeader}><div><span>04 · ATOMIC BOOKING</span><h3 id="reservation-heading">Reserve & recheck</h3></div></div>
          {selection && selectedDay ? (
            <>
              <div className={styles.holdClock}>
                <span>TEMPORARY RESERVATION</span>
                <strong>{formatCountdown(reservationSeconds)}</strong>
                <small>owns the host + slot key while this clock runs</small>
              </div>
              <dl className={styles.review}>
                <div><dt>When</dt><dd>{selectedDay.short} {selectedDay.date}<small>{timeLabel(selection.day, selection.start, timezone)}–{timeLabel(selection.day, selection.start + duration, timezone)}</small></dd></div>
                <div><dt>Hosts</dt><dd>{selectedNames}</dd></div>
                <div><dt>Blocked</dt><dd>{buffer}m before + {buffer}m after</dd></div>
              </dl>
              <MacButton primary onClick={confirmBooking}>Revalidate & confirm</MacButton>
              <MacButton onClick={testCompetingRequest}>Try competing request</MacButton>
              <MacButton onClick={() => setSelection(null)}>Release hold</MacButton>
            </>
          ) : (
            <div className={styles.emptyReservation}>
              <span aria-hidden="true">↖</span>
              <strong>Choose a bookable cell</strong>
              <p>The engine will resolve hosts, claim a ten-minute reservation key and check the underlying calendars again before confirmation.</p>
            </div>
          )}
          {message && <p className={styles.message} role="status">{message}</p>}
          <ol className={styles.pipeline} aria-label="Booking transaction stages">
            <li><span>1</span>Generate local windows</li>
            <li><span>2</span>Subtract busy + buffers</li>
            <li><span>3</span>Union/intersect hosts</li>
            <li><span>4</span>Reserve, reverify, commit</li>
          </ol>
        </aside>
      </div>
    </DemoWindow>
  );
}

export default SchedulingStudio;
