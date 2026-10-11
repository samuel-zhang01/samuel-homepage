/** Generated, symbolic fixtures only. No file access, media decoding or FFmpeg. */
export type LabTask = "inspect" | "repair" | "migrate";
export type LabRoute = "remux" | "preserve" | "mp4";
export type LabBlock = "readable" | "damaged" | "missing" | "lost";
export type LabId = "healthy" | "index" | "frames" | "tail" | "notes";
export type LabOptions = {
  task: LabTask; depth: "quick" | "full"; route: LabRoute;
  unresolved: "exclude" | "copy" | "review";
  allowShorter: boolean; maxShorter: number; convertHealthy: boolean;
};
export type LabSample = { id: LabId; filename: string; duration: number; blocks: readonly LabBlock[] };
const repeat = (block: LabBlock, count: number) => Array<LabBlock>(count).fill(block);
export const labSamples: readonly LabSample[] = [
  { id: "healthy", filename: "01-healthy.mov", duration: 60, blocks: repeat("readable", 20) },
  { id: "index", filename: "02-index.mp4", duration: 60, blocks: repeat("readable", 20) },
  { id: "frames", filename: "03-damaged.mp4", duration: 60, blocks: [...repeat("readable", 8), ...repeat("damaged", 3), ...repeat("readable", 9)] },
  { id: "tail", filename: "04-truncated.mp4", duration: 60, blocks: [...repeat("readable", 13), ...repeat("missing", 7)] },
  { id: "notes", filename: "05-notes.txt", duration: 0, blocks: repeat("readable", 20) },
];
export type LabResult = {
  id: LabId; kind: "healthy" | "metadata" | "container" | "damaged" | "incomplete" | "untouched" | "copied" | "recovered" | "partial" | "withheld" | "omitted" | "unresolved_copy" | "review_copy";
  destination: "none" | "collection" | "review"; method: "none" | "copy" | "remux" | "preserve" | "mp4";
  filename: string; duration: number; blocks: readonly LabBlock[];
  decode: "passed" | "failed" | "not_run"; timing: "passed" | "failed" | "not_run"; bytes: "passed" | "not_run";
  reencoded: boolean; losses: boolean;
};

export function planLabSample(sample: LabSample, options: LabOptions): LabResult {
  const base: LabResult = { id: sample.id, kind: "untouched", destination: "none", method: "none", filename: "", duration: sample.duration,
    blocks: sample.blocks, decode: "not_run", timing: "not_run", bytes: "not_run", reencoded: false, losses: false };
  if (options.task === "inspect") {
    if (sample.id === "notes") return base;
    if (options.depth === "quick") return { ...base, kind: sample.id === "index" ? "container" : "metadata" };
    const kind = sample.id === "healthy" ? "healthy" : sample.id === "index" ? "container" : sample.id === "frames" ? "damaged" : "incomplete";
    return { ...base, kind, decode: kind === "healthy" ? "passed" : "failed" };
  }
  const filename = (suffix: string) => sample.filename.replace(/\.[^.]+$/, `.recovered.${suffix}`);
  const force = options.route === "mp4" && options.convertHealthy;
  if (sample.id === "notes" || (sample.id === "healthy" && !force)) return options.task === "migrate"
    ? { ...base, kind: "copied", destination: "collection", method: "copy", filename: sample.filename, bytes: "passed" }
    : { ...base, kind: sample.id === "healthy" ? "healthy" : "untouched", decode: sample.id === "healthy" ? "passed" : "not_run" };

  // The index fixture contains eligible H.264/AAC streams. Its remux can pass
  // without altering them. The healthy MOV needs AAC encoding for this MP4 plan.
  const method: LabResult["method"] = options.route === "remux" || (sample.id === "index" && options.route === "mp4") ? "remux" : options.route;
  const reencoded = method === "preserve" || method === "mp4";
  const shortening = sample.blocks.filter(block => block === "missing").length / sample.blocks.length * 100;
  const acceptedShorter = options.allowShorter && options.maxShorter >= shortening;
  const rejectDecode = sample.id === "frames" && method === "remux";
  const rejectTiming = sample.id === "tail" && !acceptedShorter;
  if (rejectDecode || rejectTiming) {
    const rejected = { ...base, kind: "withheld" as const, method, decode: rejectDecode ? "failed" as const : "passed" as const,
      timing: rejectTiming ? "failed" as const : "passed" as const };
    if (options.task !== "migrate" || options.unresolved === "exclude") return { ...rejected, kind: options.task === "migrate" ? "omitted" : "withheld" };
    return { ...rejected, kind: options.unresolved === "review" ? "review_copy" : "unresolved_copy", destination: options.unresolved === "review" ? "review" : "collection",
      method: "copy", filename: sample.filename, bytes: "passed", losses: true };
  }
  return { ...base, kind: sample.id === "tail" ? "partial" : "recovered", destination: "collection", method,
    filename: filename(options.route === "mp4" ? "mp4" : "mkv"), duration: sample.id === "tail" ? 39 : sample.duration,
    blocks: sample.blocks.map(block => block === "damaged" && reencoded ? "lost" : block), decode: "passed", timing: "passed",
    reencoded, losses: sample.id === "frames" || sample.id === "tail" || method === "mp4" };
}

export const LAB_PHASES = ["inspect", "prepare", "verify", "publish"] as const;
export type LabPhase = typeof LAB_PHASES[number];
export const TICKS_PER_PHASE = 8;
export type LabJob = { ids: readonly LabId[]; options: LabOptions; tick: number; mode: "running" | "paused" | "done" };
export function labSamplePhases(sample: LabSample, options: LabOptions): readonly LabPhase[] {
  return options.task === "inspect" || planLabSample(sample, options).method === "none" ? LAB_PHASES.slice(0, 1) : LAB_PHASES;
}
export function createLabJob(ids: readonly LabId[], options: LabOptions, mode: "running" | "paused" = "running"): LabJob {
  return { ids: [...ids], options: { ...options }, tick: 0, mode: ids.length ? mode : "done" };
}
export function labJobView(job: LabJob) {
  const lengths = job.ids.map(id => labSamplePhases(labSamples.find(sample => sample.id === id)!, job.options).length * TICKS_PER_PHASE);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let finished = 0;
  let elapsed = 0;
  while (finished < job.ids.length && job.tick >= elapsed + lengths[finished]) { elapsed += lengths[finished]; finished++; }
  const fileIndex = Math.min(Math.max(0, job.ids.length - 1), finished);
  const sample = labSamples.find(sample => sample.id === job.ids[fileIndex]) ?? labSamples[0];
  const phases = labSamplePhases(sample, job.options);
  const phase = phases[job.mode === "done" ? phases.length - 1 : Math.floor((job.tick - elapsed) / TICKS_PER_PHASE)];
  const progress = job.mode === "done" ? 1 : (job.tick - elapsed) % TICKS_PER_PHASE / TICKS_PER_PHASE;
  const results = job.ids.slice(0, finished).map(id => planLabSample(labSamples.find(sample => sample.id === id)!, job.options));
  return { phases, total, finished, fileIndex, phase, progress, currentId: job.ids[fileIndex], results };
}
export function advanceLabJob(job: LabJob, wholePhase = false): LabJob {
  if (job.mode === "done") return job;
  const total = labJobView(job).total;
  const tick = Math.min(total, wholePhase ? (Math.floor(job.tick / TICKS_PER_PHASE) + 1) * TICKS_PER_PHASE : job.tick + 1);
  return { ...job, tick, mode: tick === total ? "done" : job.mode };
}
