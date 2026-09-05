import { buildOrbitalSurface, type OrbitalSurface } from "./orbitalSurface";

// Keep field evaluation and meshing off the UI thread; bound the cache to three.
const cache = new Map<string, OrbitalSurface>();
self.onmessage = (event: MessageEvent<{ id: number; n: number; l: number; m: number }>) => {
  const { id, n, l, m } = event.data;
  try {
    const key = `${n}:${l}:${m}`;
    let surface = cache.get(key);
    if (!surface) {
      surface = buildOrbitalSurface(n, l, m);
      if (cache.size >= 3) cache.delete(cache.keys().next().value!);
      cache.set(key, surface);
    }
    const vertices = surface.vertices.slice();
    postMessage({ id, vertices, level: surface.level }, { transfer: [vertices.buffer] });
  } catch {
    postMessage({ id, error: true });
  }
};
