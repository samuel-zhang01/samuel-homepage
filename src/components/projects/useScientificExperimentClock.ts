"use client";

import { useEffect, useState } from "react";
import { useProjectDemoActive } from "./ProjectDemoActivityContext";

/** Explicit playback only; pause on hidden/inactive demos and honour reduced motion. */
export function useScientificExperimentClock(playing: boolean, step: () => void, milliseconds = 250) {
  const active = useProjectDemoActive();
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    update();
    updateVisibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  useEffect(() => {
    if (!active || !playing || !motionAllowed || !visible) return;
    const timer = window.setTimeout(step, milliseconds);
    return () => window.clearTimeout(timer);
  }, [active, playing, motionAllowed, visible, step, milliseconds]);
  return motionAllowed;
}
