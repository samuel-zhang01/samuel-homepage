"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ProjectDemoActivityContext = createContext(true);

/** Pause background playback without discarding an open demo's working state. */
export function ProjectDemoActivityProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);
  return <ProjectDemoActivityContext.Provider value={active && visible}>{children}</ProjectDemoActivityContext.Provider>;
}

export function useProjectDemoActive() {
  return useContext(ProjectDemoActivityContext);
}
