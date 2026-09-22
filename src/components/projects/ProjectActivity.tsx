"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ProjectActivity = createContext(true);
export const useProjectActivity = () => useContext(ProjectActivity);

export function ProjectActivityProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return <ProjectActivity.Provider value={active && visible}>{children}</ProjectActivity.Provider>;
}
