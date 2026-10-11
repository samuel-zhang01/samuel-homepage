"use client";

import { useEffect, useState } from "react";
import { useProjectDemoActive } from "./ProjectDemoActivityContext";

/** Explicit playback only; pause on hidden/inactive demos and honour reduced motion. */
export function useScientificExperimentClock(playing: boolean, step: () => void, milliseconds = 250) {
  const active = useProjectDemoActive();
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!active || !playing || !motionAllowed || document.hidden) return;
    const timer = window.setTimeout(step, milliseconds);
    return () => window.clearTimeout(timer);
  }, [active, playing, motionAllowed, step, milliseconds]);
  return motionAllowed;
}
