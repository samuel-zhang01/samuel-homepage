/** Deterministic teaching model; no browser, VNC connection or wall clock. */
export type SharedPage = { note: string; reviewed: boolean };
export type Viewer = { connected: boolean; readOnly: boolean; page: SharedPage };
export type SessionLab = { page: SharedPage; viewers: [Viewer, Viewer] };
export type SessionAction =
  | { type: "edit"; viewer: 0 | 1; note: string }
  | { type: "review"; viewer?: 0 | 1 }
  | { type: "connection" | "read-only"; viewer: 0 | 1 }
  | { type: "reset" };

export function createSessionLab(): SessionLab {
  const page = { note: "", reviewed: false };
  return { page, viewers: [{ connected: true, readOnly: false, page }, { connected: true, readOnly: true, page }] };
}

export function sessionStep(state: SessionLab, action: SessionAction): SessionLab {
  if (action.type === "reset") return createSessionLab();
  if (action.type === "connection" || action.type === "read-only") {
    return { ...state, viewers: state.viewers.map((viewer, index) => index !== action.viewer ? viewer : action.type === "read-only"
      ? { ...viewer, readOnly: !viewer.readOnly }
      : { ...viewer, connected: !viewer.connected, page: viewer.connected ? viewer.page : state.page }) as [Viewer, Viewer] };
  }
  if (action.viewer !== undefined) {
    const viewer = state.viewers[action.viewer];
    if (!viewer.connected || viewer.readOnly) return state;
  }
  const page = action.type === "edit" ? { ...state.page, note: action.note.slice(0, 120) } : { ...state.page, reviewed: !state.page.reviewed };
  return { page, viewers: state.viewers.map(viewer => viewer.connected ? { ...viewer, page } : viewer) as [Viewer, Viewer] };
}

export type TransportLab = { pending: number[]; next: number; time: number; connected: boolean };
export function createTransportLab(): TransportLab { return { pending: [], next: 0, time: 0, connected: true }; }
export function transportStep(state: TransportLab, action: "send" | "ack" | "expire" | "reconnect"): TransportLab {
  if (action === "reconnect") return createTransportLab();
  if (!state.connected) return state;
  if (action === "send") return state.pending.length === 4 ? state : { ...state, pending: [...state.pending, state.time], next: state.next + 1 };
  if (action === "ack") return { ...state, pending: state.pending.slice(1) };
  const time = state.time + 16;
  return state.pending.length && time - state.pending[0] > 15 ? { ...state, time, pending: [], connected: false } : { ...state, time };
}
