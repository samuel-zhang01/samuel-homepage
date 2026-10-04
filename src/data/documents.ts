import { localeCvAssets, localeSlug, type Locale } from "@/lib/i18n";
import { profileSources } from "./profile";

export type ProfileDocument = {
  id: string;
  title: string;
  meta: string;
  src: string;
  description: string;
  projectSlug?: string;
  originIds: string[];
  sourceIds: string[];
};

/** Public PDFs only; the library and graph share one record per document. */
export const supportingDocuments: ProfileDocument[] = [
  {
    id: "growmat-showcase", title: "GROWMAT — External Showcase", meta: "Enterprise product · English PDF",
    src: "/GROWMAT%20Showcase%20External%20Highest%20Quality.pdf",
    description: "The original external showcase explains GROWMAT’s seven-component architecture, governed data, workload modelling and capacity views.",
    projectSlug: "growmat", originIds: ["pfizer", "pfizer-placement", "kcl"], sourceIds: ["growmat-showcase"],
  },
  {
    id: "study-rl", title: "Reinforcement Learning Study Syllabus", meta: "Learning atlas · English PDF",
    src: "/projects/study-rl/syllabus.pdf",
    description: "A structured syllabus for reinforcement-learning study, connected to the archive’s learning atlas and browser experiments.",
    projectSlug: "study-rl", originIds: ["personal-projects"], sourceIds: ["archive:study-rl"],
  },
  {
    id: "italian-practice", title: "Italian Practice Workbook", meta: "Language learning · English / Italian PDF",
    src: "/projects/parliamo/practice-workbook.pdf",
    description: "Practice material from the Parliamo language-learning project, with exercises that complement the interactive learning studio.",
    projectSlug: "parliamo-italian-learning", originIds: ["personal-projects"], sourceIds: ["archive:parliamo-italian-learning"],
  },
  {
    id: "italian-reading", title: "Bilingual Italian Reading Workbook", meta: "Language learning · English / Italian PDF",
    src: "/projects/parliamo/reading-workbook.pdf",
    description: "Bilingual reading material from Parliamo, collected here alongside its practice workbook and interactive learning tools.",
    projectSlug: "parliamo-italian-learning", originIds: ["personal-projects"], sourceIds: ["archive:parliamo-italian-learning"],
  },
];

export function getDocumentLibrary(locale: Locale): ProfileDocument[] {
  return [
    { id: "ai-cv", ...localeCvAssets[locale], description: "The CV records experience, degree subjects, awards and languages; the profile windows connect those records to public work.", originIds: [], sourceIds: ["cv"] },
    ...supportingDocuments,
  ];
}

/** A project-page citation stays a project link. Only an exact PDF source (or
 * the translated CV edition) opens a document, rather than an arbitrary attachment. */
export function getProfileSourceHref(sourceId: string, locale: Locale): string | undefined {
  const source = profileSources.find(item => item.id === sourceId);
  if (!source) return undefined;
  const documents = getDocumentLibrary(locale);
  const sourceIdentity = (href: string) => {
    const url = new URL(href, "https://portfolio.invalid");
    url.hash = "";
    // Ignore only the known local cache revision. Other query parameters and
    // external domains still identify a different cited document.
    if (href.startsWith("/")) url.searchParams.delete("v");
    return url.href;
  };
  const document = source.kind === "cv"
    ? documents.find(item => item.id === "ai-cv" && item.sourceIds.includes(sourceId))
    : documents.find(item => item.sourceIds.includes(sourceId) && sourceIdentity(item.src) === sourceIdentity(source.href));
  if (document) return `/${localeSlug(locale)}/documents#${document.id}`;
  // Only portfolio routes have translated editions. External citations retain
  // their original path, query and fragment, even if they contain /en-gb/.
  return source.href.startsWith("/en-gb/")
    ? `/${localeSlug(locale)}/${source.href.slice("/en-gb/".length)}`
    : source.href;
}
