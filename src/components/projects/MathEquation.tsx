"use client";

import { memo, useMemo } from "react";
import { renderToString } from "katex";
import "./katex.generated.css";
import styles from "./MathEquation.module.css";

type MathEquationProps = {
  tex: string;
  display?: boolean;
  label?: string;
  className?: string;
};

/** Authored TeX only; surrounding prose remains available to the locale system. */
export const MathEquation = memo(function MathEquation({ tex, display = true, label, className = "" }: MathEquationProps) {
  const rendered = useMemo(() => {
    try {
      return renderToString(tex, {
        displayMode: display,
        output: "htmlAndMathml",
        throwOnError: true,
        strict: "error",
        trust: false,
        maxExpand: 500,
        maxSize: 20,
      });
    } catch {
      // Keep an unexpected expression readable without losing surrounding content.
      return null;
    }
  }, [tex, display]);

  return (
    <span
      className={`${styles.equation} ${display ? styles.display : styles.inline} ${className}`}
      role={label ? "group" : undefined}
      aria-label={label}
      data-math-equation="true"
      data-math-error={rendered === null || undefined}
    >
      {rendered === null ? <code className={styles.fallback}>{tex}</code> : <span dangerouslySetInnerHTML={{ __html: rendered }} />}
    </span>
  );
});

export default MathEquation;
