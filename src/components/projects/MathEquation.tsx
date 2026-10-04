"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
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
  const equationRef = useRef<HTMLSpanElement>(null);
  const [scrollable, setScrollable] = useState(false);
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

  useEffect(() => {
    const equation = equationRef.current;
    if (!display || !equation) { setScrollable(false); return; }
    let active = true;
    const measure = () => {
      if (active) setScrollable(equation.scrollWidth > equation.clientWidth + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(equation);
    // Math fonts can change the content width without resizing its container.
    void document.fonts.ready.then(measure);
    return () => { active = false; observer.disconnect(); };
  }, [display, rendered]);

  return (
    <span
      ref={equationRef}
      className={`${styles.equation} ${display ? styles.display : styles.inline} ${className}`}
      role={label ? "group" : undefined}
      aria-label={label}
      tabIndex={scrollable ? 0 : undefined}
      data-math-equation="true"
      data-math-error={rendered === null || undefined}
    >
      {rendered === null ? <code className={styles.fallback}>{tex}</code> : <span dangerouslySetInnerHTML={{ __html: rendered }} />}
    </span>
  );
});

export default MathEquation;
