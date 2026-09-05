export type OrbitalAngles = { yaw: number; pitch: number };

/** Same angular speed at 60/120/144 Hz; discard long suspended-frame gaps. */
export function advanceOrbitalRotation(angles: OrbitalAngles, elapsedMs: number): OrbitalAngles {
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, Math.min(100, elapsedMs)) : 0;
  return { yaw: (angles.yaw + elapsed * .0004375) % (2 * Math.PI), pitch: angles.pitch };
}

export function runOrbitalAnimation(
  paint: (elapsedMs: number) => void,
  request: (callback: FrameRequestCallback) => number = requestAnimationFrame,
  cancel: (id: number) => void = cancelAnimationFrame,
) {
  let previous: number | null = null;
  let stopped = false;
  let id: number;
  const frame: FrameRequestCallback = (timestamp) => {
    if (stopped) return;
    paint(previous === null ? 0 : timestamp - previous);
    previous = timestamp;
    if (!stopped) id = request(frame);
  };
  id = request(frame);
  return () => { stopped = true; cancel(id); };
}
