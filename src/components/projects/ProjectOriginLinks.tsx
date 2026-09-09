import { getProjectText } from "@/lib/projectNarrative";
import { getProjectOrigins } from "@/data/projectOrigins";
import { localeSlug, type Locale } from "@/lib/i18n";
import styles from "./ProjectCaseBrief.module.css";

export function ProjectOriginLinks({ slug, locale }: { slug: string; locale: Locale }) {
  const origins = getProjectOrigins(slug);
  if (!origins.length) return null;
  return <aside className={styles.origin} lang={locale} aria-label={getProjectText(locale, "Career and education connections")}>
    {origins.map((origin) => <div key={origin.id}>
      <a href={`/${localeSlug(locale)}/${origin.section}#${origin.id}`}>{getProjectText(locale, origin.label)} <b aria-hidden="true">↗</b></a>
      {origin.period ? <small>{getProjectText(locale, origin.period)}</small> : null}
      <p>{getProjectText(locale, origin.context)}</p>
    </div>)}
  </aside>;
}
