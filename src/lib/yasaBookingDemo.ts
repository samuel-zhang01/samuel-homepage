// Browser-only fixture model, independently adapted from COVERD-YASA af1673c:
// availability_service.py, booking_service.py, booking_questions.py and email_service.py.
// There is no calendar/API transport in this module.
export type YasaMode = "individual" | "round-robin" | "collective" | "first-available";
export type YasaTimezone = "Europe/London" | "America/New_York" | "Asia/Tokyo";
export type YasaConfig = { mode: YasaMode; duration: number; buffer: number; required: string[]; event: string };
export type YasaSlot = { start: string; end: string; hostIds: string[]; optionalIds: string[]; optionalAvailable: number; free: boolean; preferred: boolean };
export type YasaGuest = { name: string; email: string; company: string; topic: string; notes: string; reminder: boolean };
export type YasaBooking = { id: string; slot: YasaSlot; config: YasaConfig; guest: YasaGuest; timezone: YasaTimezone; status: "confirmed" | "cancelled" | "rescheduled"; previousId?: string };
export const YASA_HOSTS = [
  { id: "alex", name: "Alex", weight: 2, assigned: 3, priority: 2 },
  { id: "morgan", name: "Morgan", weight: 1, assigned: 2, priority: 1 },
  { id: "riley", name: "Riley", weight: 1, assigned: 1, priority: 3 },
] as const;
export const YASA_DAYS = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"];
const MINUTE = 60_000;
const occupied = [
  { hostId: "alex", start: "2026-11-16T14:00:00Z", end: "2026-11-16T15:00:00Z" },
  { hostId: "morgan", start: "2026-11-17T11:00:00Z", end: "2026-11-17T12:00:00Z" },
  { hostId: "riley", start: "2026-11-18T13:00:00Z", end: "2026-11-18T14:00:00Z" },
];
const instant = (value: string) => new Date(value).getTime();
const overlap = (start: number, end: number, otherStart: number, otherEnd: number) => start < otherEnd && otherStart < end;
function windowFor(hostId: string, day: string) {
  const weekday = YASA_DAYS.indexOf(day);
  const startHour = hostId === "riley" && weekday === 1 ? 12 : 9;
  const endHour = hostId === "riley" && weekday === 0 ? 13 : 17;
  return { start: instant(`${day}T${String(startHour).padStart(2, "0")}:00:00Z`), end: instant(`${day}T${endHour}:00:00Z`) };
}
function intervalFree(hostId: string, start: number, end: number, config: YasaConfig, bookings: YasaBooking[], ignoredId?: string) {
  const bufferedStart = start - config.buffer * MINUTE;
  const bufferedEnd = end + config.buffer * MINUTE;
  const day = new Date(start).toISOString().slice(0, 10);
  const hours = windowFor(hostId, day);
  if (bufferedStart < hours.start || bufferedEnd > hours.end) return false;
  if (occupied.some((busy) => busy.hostId === hostId && overlap(bufferedStart, bufferedEnd, instant(busy.start), instant(busy.end)))) return false;
  return !bookings.some((booking) => booking.id !== ignoredId && booking.status === "confirmed" && booking.slot.hostIds.includes(hostId)
    && overlap(bufferedStart, bufferedEnd, instant(booking.slot.start), instant(booking.slot.end)));
}
function generated(hostId: string, day: string, config: YasaConfig) {
  const hours = windowFor(hostId, day);
  const stride = (config.duration + config.buffer * 2) * MINUTE;
  const starts: number[] = [];
  for (let block = hours.start; block + stride <= hours.end; block += stride) starts.push(block + config.buffer * MINUTE);
  return starts;
}
// Like the real collective engine, merge the free slot intervals before checking
// a differently anchored required host. Optional availability instead checks the
// exact candidate and its buffers; it does not depend on the optional slot grid.
function covers(hostId: string, day: string, start: number, config: YasaConfig, bookings: YasaBooking[], ignoredId?: string) {
  const intervals: { start: number; end: number }[] = [];
  for (const candidate of generated(hostId, day, config)) {
    const end = candidate + config.duration * MINUTE;
    if (!intervalFree(hostId, candidate, end, config, bookings, ignoredId)) continue;
    const last = intervals.at(-1);
    if (last && candidate <= last.end) last.end = Math.max(last.end, end);
    else intervals.push({ start: candidate, end });
  }
  return intervals.some((range) => range.start <= start && range.end >= start + config.duration * MINUTE);
}
export function yasaDateKey(start: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(start));
}
export function yasaSlots(config: YasaConfig, bookings: YasaBooking[], timezone: string, ignoredId?: string): YasaSlot[] {
  const allIds = YASA_HOSTS.map((host) => host.id);
  const required = config.mode === "collective" ? allIds.filter((id) => config.required.includes(id)) : allIds;
  if (!required.length) return [];
  const candidates = config.mode === "collective" || config.mode === "individual" ? required.slice(0, 1) : required;
  const result: YasaSlot[] = [];
  for (const day of YASA_DAYS) {
    const starts = [...new Set(candidates.flatMap((id) => generated(id, day, config)))].sort((a, b) => a - b);
    for (const start of starts) {
      const end = start + config.duration * MINUTE;
      const collective = config.mode === "collective";
      const freeIds = required.filter((id) => collective
        ? covers(id, day, start, config, bookings, ignoredId)
        : generated(id, day, config).includes(start) && intervalFree(id, start, end, config, bookings, ignoredId));
      const free = collective ? freeIds.length === required.length : config.mode === "individual" ? freeIds.includes(required[0]) : freeIds.length > 0;
      const optionalIds = collective ? allIds.filter((id) => !required.includes(id)) : [];
      const ranked = YASA_HOSTS.filter((host) => freeIds.includes(host.id)).sort((a, b) => {
        if (config.mode === "first-available") return a.priority - b.priority || a.id.localeCompare(b.id);
        const load = (id: string, count: number, weight: number) => (count + bookings.filter((booking) => booking.slot.hostIds[0] === id && booking.status !== "rescheduled" && booking.status !== "cancelled").length) / weight;
        return load(a.id, a.assigned, a.weight) - load(b.id, b.assigned, b.weight) || a.id.localeCompare(b.id);
      });
      result.push({ start: new Date(start).toISOString(), end: new Date(end).toISOString(), hostIds: collective ? required : free ? [config.mode === "individual" ? required[0] : ranked[0].id] : [], optionalIds,
        optionalAvailable: optionalIds.filter((id) => intervalFree(id, start, end, config, bookings, ignoredId)).length, free, preferred: false });
    }
  }
  const dailyBest = new Map<string, number>();
  for (const slot of result.filter((slot) => slot.free)) {
    const day = yasaDateKey(slot.start, timezone);
    dailyBest.set(day, Math.max(dailyBest.get(day) ?? 0, slot.optionalAvailable));
  }
  return result.map((slot) => ({ ...slot, preferred: slot.free && slot.optionalAvailable > 0 && slot.optionalAvailable === dailyBest.get(yasaDateKey(slot.start, timezone)) }));
}
export function validateYasaGuest(guest: YasaGuest): "name" | "email" | "topic" | null {
  if (!guest.name.trim() || guest.name.length > 80 || /[\r\n]/.test(guest.name)) return "name";
  if (guest.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(guest.email)) return "email";
  if (!["Project feedback", "Technical walkthrough", "Collaboration"].includes(guest.topic)) return "topic";
  return null;
}
const icsText = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
const icsDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const icsName = (value: string) => value.replace(/\^/g, "^^").replace(/"/g, "^'").replace(/\r\n|\r|\n/g, "^n");
export function yasaCalendar(booking: YasaBooking, summary: string, cancelled = false) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Samuel Homepage//YASA Example//EN", `METHOD:${cancelled ? "CANCEL" : "REQUEST"}`, "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${booking.id}@example.invalid`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(booking.slot.start)}`, `DTEND:${icsDate(booking.slot.end)}`, `SUMMARY:${icsText(summary)}`,
    `ORGANIZER;CN="Example host":mailto:${booking.slot.hostIds[0]}@example.invalid`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${icsName(booking.guest.name)}":mailto:${booking.guest.email}`,
    ...[...booking.slot.hostIds.slice(1), ...booking.slot.optionalIds].map((id) => `ATTENDEE;ROLE=${booking.slot.optionalIds.includes(id) ? "OPT-PARTICIPANT" : "REQ-PARTICIPANT"};PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${id}":mailto:${id}@example.invalid`),
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`, `SEQUENCE:${cancelled ? 1 : 0}`, "LOCATION:Browser example", "DESCRIPTION:Local booking example. No invitation was sent."];
  if (booking.guest.reminder && !cancelled) lines.push("BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Meeting in 15 minutes", "END:VALARM");
  lines.push("END:VEVENT", "END:VCALENDAR");
  const encoder = new TextEncoder();
  return lines.flatMap((line) => {
    const folded: string[] = [];
    let current = "";
    for (const char of line) {
      if (encoder.encode(current + char).length > 75) { folded.push(current); current = " "; }
      current += char;
    }
    folded.push(current);
    return folded;
  }).join("\r\n") + "\r\n";
}
