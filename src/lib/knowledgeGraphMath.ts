import type { KnowledgeGraphData, KnowledgeNode } from "../data/knowledgeGraph";

export type Point3 = { x: number; y: number; z: number };
export type GraphCamera = { yaw: number; pitch: number; zoom: number; panX: number; panY: number };
export type KnowledgeScene = { camera: GraphCamera; positions: Map<string, Point3>; opacity: Map<string, number> };
export type ProjectedNode = { node: KnowledgeNode; x: number; y: number; z: number; scale: number; radius: number; labelBounds?: { x: number; y: number; width: number; height: number } };
export const initialGraphCamera: GraphCamera = { yaw: -.16, pitch: .18, zoom: 1, panX: 0, panY: 0 };
export const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));


/** Inputs cover the same complete catalogue, including invisible nodes, and
 * use positive camera zooms. A displayed intermediate scene can become the
 * next transition's start without changing its coordinates or fading state. */
export function interpolateKnowledgeScene(from: KnowledgeScene, to: KnowledgeScene, progress: number): KnowledgeScene {
  const t = clamp(progress, 0, 1);
  if (t === 0) return from;
  if (t === 1) return to;
  const eased = t * t * (3 - 2 * t);
  const blend = (start: number, end: number) => start + (end - start) * eased;
  const positions = new Map<string, Point3>();
  const opacity = new Map<string, number>();
  for (const [id, start] of from.positions) {
    const end = to.positions.get(id)!;
    positions.set(id, { x: blend(start.x, end.x), y: blend(start.y, end.y), z: blend(start.z, end.z) });
    opacity.set(id, blend(from.opacity.get(id)!, to.opacity.get(id)!));
  }
  return {
    camera: {
      yaw: blend(from.camera.yaw, to.camera.yaw), pitch: blend(from.camera.pitch, to.camera.pitch),
      zoom: Math.exp(blend(Math.log(from.camera.zoom), Math.log(to.camera.zoom))),
      panX: blend(from.camera.panX, to.camera.panX), panY: blend(from.camera.panY, to.camera.panY),
    },
    positions,
    opacity,
  };
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
}

/** Stable, bounded clusters. Layout is linear in node count; it does not run an
 * unbounded force simulation when the catalogue grows. */
export function layoutKnowledgeGraph(graph: KnowledgeGraphData): Map<string, Point3> {
  const points = new Map<string, Point3>();
  const topics = graph.nodes.filter((node) => node.kind === "topic");
  const centres = new Map<string, Point3>();
  topics.forEach((topic, index) => {
    const angle = (index / topics.length) * Math.PI * 2 - Math.PI * .68;
    const centre = { x: Math.cos(angle) * 270, y: Math.sin(angle) * 215, z: Math.sin(angle * 2) * 70 };
    centres.set(topic.topic, centre); points.set(topic.id, centre);
  });
  const membersByTopic = new Map<string, KnowledgeNode[]>();
  const experiences: KnowledgeNode[] = [];
  for (const node of graph.nodes) {
    if (node.kind === "experience" || node.kind === "education") experiences.push(node);
    else if (node.kind !== "topic") {
      const members = membersByTopic.get(node.topic) ?? [];
      members.push(node); membersByTopic.set(node.topic, members);
    }
  }
  for (const topic of topics) {
    const centre = centres.get(topic.topic)!;
    const members = membersByTopic.get(topic.topic) ?? [];
    members.forEach((node, index) => {
      const angle = index * 2.399963229728653 + hash(topic.id) % 10;
      const radius = 54 + Math.sqrt(index + 1) * 21;
      points.set(node.id, { x: centre.x + Math.cos(angle) * radius, y: centre.y + Math.sin(angle) * radius * .82, z: centre.z + (hash(node.id) % 130) - 65 });
    });
  }
  experiences.forEach((node, index) => {
    const angle = index / experiences.length * Math.PI * 2;
    points.set(node.id, { x: Math.cos(angle) * 108, y: Math.sin(angle) * 92, z: 90 + Math.sin(angle) * 25 });
  });
  return points;
}

/** Gather direct connections around the selection so cross-topic links cannot
 * pull a few neighbours far away from the rest. Stable rings stay readable in
 * either view; shallow depth keeps the 3D view rotatable without flattening it. */
export function layoutKnowledgeFocus(graph: KnowledgeGraphData, selectedId: string, visible: Set<string>, flat = false): Map<string, Point3> {
  const points = new Map<string, Point3>([[selectedId, { x: 0, y: 0, z: 0 }]]);
  const neighbours = graph.nodes.filter((node) => visible.has(node.id) && node.id !== selectedId)
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
  neighbours.forEach((node, index) => {
    const ring = Math.floor(index / 14);
    const ringCount = Math.min(14, neighbours.length - ring * 14);
    const angle = (index % 14) / ringCount * Math.PI * 2 - Math.PI / 2 + ring * .17;
    const radius = 260 + ring * 115;
    points.set(node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * .84, z: flat ? 0 : Math.sin(angle * 2 + .6) * 65 });
  });
  return points;
}

/** Fit the projected bounds while preserving the chosen viewing angle. */
export function fitKnowledgeCamera(points: Point3[], width: number, height: number, flat: boolean, camera = initialGraphCamera): GraphCamera {
  const base = { ...camera, zoom: 1, panX: 0, panY: 0 };
  if (!points.length) return base;
  const projected = points.map((point) => projectKnowledgePoint(point, base, width, height, flat));
  const xs = projected.map((point) => point.x), ys = projected.map((point) => point.y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  const paddingX = Math.min(90, width * .16), paddingY = Math.min(65, height * .16);
  const zoom = clamp(Math.min((width - paddingX * 2) / Math.max(120, right - left), (height - paddingY * 2) / Math.max(100, bottom - top)), .2, 2.5);
  return { ...base, zoom, panX: -(left + right - width) / 2 * zoom, panY: -(top + bottom - height) / 2 * zoom };
}

/** Pointer deltas are measured against the camera captured at pointer-down. */
export function dragKnowledgeCamera(camera: GraphCamera, dx: number, dy: number, pan: boolean): GraphCamera {
  return pan
    ? { ...camera, panX: camera.panX + dx, panY: camera.panY + dy }
    : { ...camera, yaw: camera.yaw + dx * .006, pitch: clamp(camera.pitch + dy * .006, -1.2, 1.2) };
}

export function projectKnowledgePoint(point: Point3, camera: GraphCamera, width: number, height: number, flat = false): { x: number; y: number; z: number; scale: number } {
  const yaw = flat ? 0 : camera.yaw;
  const pitch = flat ? 0 : camera.pitch;
  const rx = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const rz = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  const ry = point.y * Math.cos(pitch) - rz * Math.sin(pitch);
  const depth = flat ? 0 : point.y * Math.sin(pitch) + rz * Math.cos(pitch);
  const perspective = 1000 / Math.max(350, 1000 + depth);
  const fit = Math.min(width / 930, height / 760);
  const scale = perspective * fit * camera.zoom;
  return { x: width / 2 + rx * scale + camera.panX, y: height / 2 + ry * scale + camera.panY, z: depth, scale };
}

export function pickKnowledgeNode(nodes: ProjectedNode[], x: number, y: number): ProjectedNode | undefined {
  const frontFirst = [...nodes].sort((a, b) => a.z - b.z);
  return frontFirst.find((node) => Math.hypot(node.x - x, node.y - y) <= Math.max(node.radius + 7, 14))
    ?? frontFirst.find(({ labelBounds: box }) => box && x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
}

export function visibleKnowledgeNodes(graph: KnowledgeGraphData, selectedId: string | null, showMethods: boolean, local: boolean, limit = 120): Set<string> {
  const candidates = graph.nodes.filter((node) => showMethods || node.kind !== "method" || node.id === selectedId);
  let ids = new Set(candidates.map((node) => node.id));
  if (local && selectedId) {
    ids = new Set([selectedId]);
    for (const edge of graph.edges) {
      if (edge.source === selectedId) ids.add(edge.target);
      if (edge.target === selectedId) ids.add(edge.source);
    }
  }
  const selected: string[] = [], topics: string[] = [], others: string[] = [];
  for (const node of candidates) if (ids.has(node.id)) {
    if (node.id === selectedId) selected.push(node.id);
    else if (node.kind === "topic") topics.push(node.id);
    else others.push(node.id);
  }
  return new Set([...selected, ...topics, ...others].slice(0, limit));
}
