import { translateText, type Locale } from "@/lib/i18n";

export function ScheduleCallLink({ locale, className = "", compact = false }: { locale: Locale; className?: string; compact?: boolean }) {
  return <a
    className={`s7-button ${className}`.trim()}
    href="https://schedule.coverd.ai/book/samuel/30mins-chat"
    target="_blank"
    rel="noopener noreferrer"
    title={translateText(locale, "Book a 30-minute call (opens in a new tab)")}
  >{translateText(locale, compact ? "Schedule a call" : "Schedule a call with Samuel")}</a>;
}
