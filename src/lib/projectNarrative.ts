import type { Locale } from "./i18n";
import { projectText } from "./projectCopy";
import { projectNarrativeCopy } from "@/components/projects/copy/projectNarrativeCopy";

/** Shared catalogue, project-story and career-context copy; English is the stable source key. */
export function getProjectText(locale: Locale, source: string): string {
  return projectText(locale, projectNarrativeCopy, source);
}
