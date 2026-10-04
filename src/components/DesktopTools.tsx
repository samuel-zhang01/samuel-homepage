"use client";

// A shared optional entry keeps Find and Settings out of the initial desktop
// bundle without creating a separate browser chunk for each utility.
export { default as DesktopFinder } from "./DesktopFinder";
export { default as DesktopSettings } from "./DesktopSettings";
