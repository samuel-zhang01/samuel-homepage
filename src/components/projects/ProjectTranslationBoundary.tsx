"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ReactNode,
} from "react";

import { translateText, type Locale } from "@/lib/i18n";

const TRANSLATED_PROPS = ["aria-label", "title", "appName", "status", "placeholder", "purpose", "tryThis", "watchFor"] as const;

const ProjectLocaleContext = createContext<Locale>("en-GB");

export function useProjectLocale() {
  return useContext(ProjectLocaleContext);
}

function localiseNode(node: ReactNode, locale: Locale): ReactNode {
  if (typeof node === "string") return translateText(locale, node);
  if (Array.isArray(node)) {
    return Children.toArray(node).map((child) => localiseNode(child, locale));
  }
  if (!isValidElement<Record<string, unknown>>(node)) return node;

  const translatedProps: Record<string, unknown> = {};
  for (const prop of TRANSLATED_PROPS) {
    const value = node.props[prop];
    if (typeof value === "string") translatedProps[prop] = translateText(locale, value);
  }
  if ("children" in node.props) {
    translatedProps.children = localiseNode(node.props.children as ReactNode, locale);
  }

  return cloneElement(node, translatedProps);
}

export function ProjectTranslationBoundary({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <ProjectLocaleContext.Provider value={locale}>
      {localiseNode(children, locale)}
    </ProjectLocaleContext.Provider>
  );
}
