import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";

const fixtureRoot = join(process.cwd(), "src", "data", "project-fixtures");
const reviewedFixtures = new Map([
  ["decision-ope-logs.csv", {
    bytes: 728,
    rows: 24,
    sha256: "10db7cb76101a9dfa7274c98ed3d4fdb4ceca5d3a85b756c0ecb950ad7047077",
    columns: ["log_id", "segment", "action", "reward", "behaviour_action_one", "q0", "q1"],
  }],
]);

function parseRows(source) {
  const lines = source.replace(/^\uFEFF/, "").trimEnd().split(/\r?\n/);
  if (lines.some((line) => line.includes('"'))) {
    throw new Error("Reviewed project fixtures must not require quoted or multiline CSV fields");
  }
  return lines.map((line) => line.split(","));
}

const names = (await readdir(fixtureRoot)).filter((name) => name.toLowerCase().endsWith(".csv")).sort();
const expectedNames = [...reviewedFixtures.keys()].sort();
if (names.join("\n") !== expectedNames.join("\n")) {
  throw new Error(`CSV fixture inventory changed. Reviewed: ${expectedNames.join(", ")}; found: ${names.join(", ")}`);
}

for (const [name, expected] of reviewedFixtures) {
  const path = join(fixtureRoot, name);
  const bytes = await readFile(path);
  if (bytes.byteLength !== expected.bytes) {
    throw new Error(`${name} is ${bytes.byteLength} bytes; reviewed size is ${expected.bytes}`);
  }
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== expected.sha256) throw new Error(`${name} changed; review its provenance and repin its SHA-256`);

  const [header, ...rows] = parseRows(bytes.toString("utf8"));
  if (header.join(",") !== expected.columns.join(",")) {
    throw new Error(`${name} schema changed; expected ${expected.columns.join(",")}`);
  }
  if (rows.length !== expected.rows) throw new Error(`${name} has ${rows.length} rows; expected ${expected.rows}`);

  const identifiers = new Set();
  const segmentCounts = new Map([[1, 0], [2, 0], [3, 0], [4, 0]]);
  for (const [index, row] of rows.entries()) {
    if (row.length !== expected.columns.length) throw new Error(`${name} row ${index + 2} has the wrong field count`);
    const [id, segmentText, actionText, rewardText, behaviourText, q0Text, q1Text] = row;
    if (id !== `L-${String(index + 1).padStart(2, "0")}` || identifiers.has(id)) {
      throw new Error(`${name} row ${index + 2} has an invalid or duplicate identifier`);
    }
    identifiers.add(id);
    const segment = Number(segmentText);
    if (!segmentCounts.has(segment)) throw new Error(`${name} ${id} has an invalid segment`);
    segmentCounts.set(segment, segmentCounts.get(segment) + 1);
    if (!/^[01]$/.test(actionText) || !/^[01]$/.test(rewardText)) {
      throw new Error(`${name} ${id} action and reward must be binary`);
    }
    for (const [column, value, open] of [
      ["behaviour_action_one", behaviourText, true],
      ["q0", q0Text, false],
      ["q1", q1Text, false],
    ]) {
      const numeric = Number(value);
      const valid = Number.isFinite(numeric) && (open ? numeric > 0 && numeric < 1 : numeric >= 0 && numeric <= 1);
      if (!valid) throw new Error(`${name} ${id} ${column} is outside its probability domain`);
    }
  }
  if ([...segmentCounts.values()].some((count) => count !== 6)) {
    throw new Error(`${name} must contain six rows for each of four synthetic context segments`);
  }

  const text = bytes.toString("utf8");
  const sensitiveMarker = /(?:https?:\/\/|www\.|@|(?:^|[,\s])(?:email|phone|name|address|account|client|company|employer|host(?:name)?|ip_address)(?:[,\s]|$))/i;
  if (sensitiveMarker.test(text)) {
    throw new Error(`${basename(path)} contains a forbidden identifier, endpoint, or sensitive-field marker`);
  }
}

console.log(`Project CSV gate: ${reviewedFixtures.size} hash-pinned fixture, 24 typed synthetic rows, no public raw-data endpoint.`);
