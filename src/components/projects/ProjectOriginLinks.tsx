import { getProjectText } from "@/lib/projectNarrative";
import { getProfileText } from "@/lib/profileCopy";
import { getProfileProjectOrigins as getProjectOrigins } from "@/data/profileProjectOrigins";
import { localeSlug, type Locale } from "@/lib/i18n";
import styles from "./ProjectCaseBrief.module.css";

export function ProjectOriginLinks({ slug, locale }: { slug: string; locale: Locale }) {
  const origins = getProjectOrigins(slug);
  const t = (source: string): string => {
    const profile = getProfileText(locale, source);
    if (profile !== source) return profile;
    const project = getProjectText(locale, source);
    return project !== source ? project : source.split(" · ").map(part => getProfileText(locale, part)).join(" · ");
  };
  if (!origins.length) return null;
  return <aside className={styles.origin} lang={locale} aria-label={getProjectText(locale, "Career and education connections")}>
    {origins.map((origin) => <div key={origin.id}>
      <a href={`/${localeSlug(locale)}/${origin.section}#${origin.id}`}>{t(origin.label)} <b aria-hidden="true">↗</b></a>
      {origin.period ? <small>{t(origin.period)}</small> : null}
      <p>{t(origin.context)}</p>
    </div>)}
  </aside>;
}
