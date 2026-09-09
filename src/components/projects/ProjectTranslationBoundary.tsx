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
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";

const TRANSLATED_PROPS = ["aria-label", "title", "appName", "status", "placeholder", "purpose", "tryThis", "watchFor"] as const;

const ProjectLocaleContext = createContext<Locale>("en-GB");

export function useProjectLocale() {
  return useContext(ProjectLocaleContext);
}

export function ProjectLocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <ProjectLocaleContext.Provider value={locale}>{children}</ProjectLocaleContext.Provider>;
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

const HOST_COPY_PROPS = ["aria-label", "aria-description", "aria-valuetext", "title", "alt", "placeholder"] as const;
const DEMO_COPY_PROPS = ["appName", "status", "purpose", "tryThis", "watchFor"] as const;
const SOURCE_TAGS = new Set(["pre", "code", "kbd", "samp", "script", "style", "math"]);

/** Each component scopes its OWN returned JSX here, including helper components. */
export function localiseProjectTree(node: ReactNode, locale: Locale, copy: ProjectCopyTable): ReactNode {
  if (typeof node === "string") return projectText(locale, copy, node);
  if (Array.isArray(node)) return node.map((child) => localiseProjectTree(child, locale, copy));
  if (!isValidElement<Record<string, unknown>>(node)) return node;
  const host = typeof node.type === "string";
  if (node.props.translate === "no" || node.props["data-copy-source"] || (host && SOURCE_TAGS.has(node.type as string))) return node;
  const updates: Record<string, unknown> = {};
  for (const name of HOST_COPY_PROPS) {
    if (typeof node.props[name] === "string") updates[name] = projectText(locale, copy, node.props[name]);
  }
  if (!host && "appName" in node.props && "purpose" in node.props) {
    for (const name of DEMO_COPY_PROPS) {
      if (typeof node.props[name] === "string") updates[name] = projectText(locale, copy, node.props[name]);
    }
    if ("footer" in node.props) updates.footer = localiseProjectTree(node.props.footer as ReactNode, locale, copy);
  }
  // MathEquation exposes an accessible label but its authored TeX is immutable.
  if (typeof node.props.tex === "string" && typeof node.props.label === "string") {
    updates.label = projectText(locale, copy, node.props.label);
  }
  if (host && typeof node.props.lang === "string" && /^en(?:-|$)/i.test(node.props.lang)) updates.lang = locale;
  if ("children" in node.props) {
    const children = Children.toArray(node.props.children as ReactNode);
    const translated: ReactNode[] = [];
    let fragments: Array<string | number> = [];
    const flush = () => {
      if (!fragments.length) return;
      const joined = fragments.join("");
      const result = projectText(locale, copy, joined);
      translated.push(result === joined ? fragments.map((value) => typeof value === "string" ? projectText(locale, copy, value) : value) : result);
      fragments = [];
    };
    for (const child of children) {
      if (typeof child === "string" || typeof child === "number") fragments.push(child);
      else { flush(); translated.push(localiseProjectTree(child, locale, copy)); }
    }
    flush();
    updates.children = translated;
  }
  return cloneElement(node, updates);
}

export function ProjectCopy({ children, copy, locale: selectedLocale }: { children: ReactNode; copy: ProjectCopyTable; locale?: Locale }) {
  const contextLocale = useProjectLocale();
  return <>{localiseProjectTree(children, selectedLocale ?? contextLocale, copy)}</>;
}

export function ProjectTranslationBoundary({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <ProjectLocaleProvider locale={locale}>
      {localiseNode(children, locale)}
    </ProjectLocaleProvider>
  );
}
