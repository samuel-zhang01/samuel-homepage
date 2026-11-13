"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SYSTEM7_ICONS, type System7IconKind } from "@/lib/system7Icons";
import { SYSTEM7_ICON_BOUNDS } from "@/lib/system7IconBounds";
import styles from "./System7Icon.module.css";

export type { System7IconKind } from "@/lib/system7Icons";

const pendingFrames = new Map<Element, () => void>();
let frameObserver: IntersectionObserver | null = null;

function observeFrame(frame: Element, show: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    show();
    return;
  }
  frameObserver ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const reveal = pendingFrames.get(entry.target);
      pendingFrames.delete(entry.target);
      frameObserver?.unobserve(entry.target);
      reveal?.();
    }
  }, { rootMargin: "64px", threshold: 0 });
  pendingFrames.set(frame, show);
  frameObserver.observe(frame);
  return () => {
    pendingFrames.delete(frame);
    frameObserver?.unobserve(frame);
    if (!pendingFrames.size) {
      frameObserver?.disconnect();
      frameObserver = null;
    }
  };
}

function DeferredIcon({ kind, children }: { kind: System7IconKind; children: ReactNode }) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (visible || !frameRef.current) return;
    return observeFrame(frameRef.current, () => setVisible(true));
  }, [visible]);
  return <span ref={frameRef} className={styles.frame} data-system7-frame={kind} data-system7-pending={!visible || undefined} data-brand={kind === "coverd" || undefined} aria-hidden="true">{visible && children}</span>;
}

// The optional miniature flag is a sizing hint for existing callers, never a
// different drawing. Adjacent translated text names these decorative symbols.
// Eager is reserved for artwork needed before hydration, such as the boot icon.
export function System7Icon({ kind, eager = false }: { kind: System7IconKind; miniature?: boolean; eager?: boolean }) {
  const [left, top, right, bottom, canvas] = SYSTEM7_ICON_BOUNDS[kind];
  const scale = .9 * canvas / Math.max(right - left + 1, bottom - top + 1);
  const x = 50 - (left + right + 1) / (2 * canvas) * scale * 100;
  const y = 50 - (top + bottom + 1) / (2 * canvas) * scale * 100;
  const image = <Image
    className={styles.icon}
    style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, left: `${x}%`, top: `${y}%` }}
    src={SYSTEM7_ICONS[kind]}
    data-system7-icon={kind}
    alt=""
    width={canvas}
    height={canvas}
    loading="eager"
    unoptimized
    aria-hidden="true"
  />;
  return eager
    ? <span className={styles.frame} data-system7-frame={kind} data-brand={kind === "coverd" || undefined} aria-hidden="true">{image}</span>
    : <DeferredIcon key={kind} kind={kind}>{image}</DeferredIcon>;
}
