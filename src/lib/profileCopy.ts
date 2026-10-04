import { profileCopy } from "@/components/profileCopy";
import type { Locale } from "./i18n";
import { projectText } from "./projectCopy";

export function getProfileText(locale: Locale, source: string) {
  return projectText(locale, profileCopy, source);
}
