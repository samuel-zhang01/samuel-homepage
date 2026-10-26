/** Scripted browser-sharing walkthrough. No Chromium, agent or network request. */
export type SignupPage = { name: string; reminder: boolean; submitted: boolean };
export type BrowserWalkthrough = {
  page: SignupPage;
  phase: "start" | "edit" | "return" | "complete";
  panelOpen: boolean;
  observed: SignupPage | null;
  nameError: boolean;
};
export type BrowserAction =
  | { type: "name"; value: string }
  | { type: "reminder"; value: boolean }
  | { type: "agent-fill" | "agent-read" | "close" | "agent-submit" | "open" | "edit-again" | "reset" };

export function createBrowserWalkthrough(): BrowserWalkthrough {
  return { page: { name: "", reminder: false, submitted: false }, phase: "start", panelOpen: true, observed: null, nameError: false };
}

export function browserStep(state: BrowserWalkthrough, action: BrowserAction): BrowserWalkthrough {
  if (action.type === "reset") return createBrowserWalkthrough();
  if (action.type === "agent-fill" && state.phase === "start") {
    return { ...state, page: { name: "Alex", reminder: true, submitted: false }, phase: "edit" };
  }
  if ((action.type === "name" || action.type === "reminder") && state.panelOpen && (state.phase === "edit" || state.phase === "return")) {
    const page = action.type === "name" ? { ...state.page, name: action.value.slice(0, 40) } : { ...state.page, reminder: action.value };
    return { ...state, page, phase: "edit", observed: null, nameError: false };
  }
  if (action.type === "agent-read" && state.phase === "edit") {
    if (!state.page.name.trim()) return { ...state, nameError: true };
    return { ...state, phase: "return", observed: { ...state.page }, nameError: false };
  }
  if (action.type === "close" && state.phase === "return" && state.panelOpen) return { ...state, panelOpen: false };
  if (action.type === "agent-submit" && state.phase === "return" && !state.panelOpen && state.observed && !state.page.submitted) {
    return { ...state, page: { ...state.page, submitted: true } };
  }
  if (action.type === "open" && !state.panelOpen) return { ...state, panelOpen: true, phase: state.page.submitted ? "complete" : "return" };
  if (action.type === "edit-again" && state.phase === "complete") return { ...state, page: { ...state.page, submitted: false }, phase: "edit", observed: null };
  return state;
}
