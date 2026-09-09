"use client";

import { createContext } from "react";
import type { ProjectActivityRequest } from "@/lib/projectActivity";

/** The desktop owns project activity windows and their navigation history. */
export const ProjectWindowContext = createContext<((request: ProjectActivityRequest) => void) | null>(null);
