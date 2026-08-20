import source from "./project-fixtures/decision-ope-logs.csv";
import { parseCsv } from "@/lib/projectCsv";

export type DecisionOpeLog = Readonly<{
  id: string;
  segment: 0 | 1 | 2 | 3;
  action: 0 | 1;
  reward: 0 | 1;
  behaviourActionOne: number;
  q0: number;
  q1: number;
}>;

const EXPECTED_COLUMNS = [
  "log_id",
  "segment",
  "action",
  "reward",
  "behaviour_action_one",
  "q0",
  "q1",
] as const;

function binary(value: string, name: string, id: string): 0 | 1 {
  if (value === "0") return 0;
  if (value === "1") return 1;
  throw new Error(`${id}: ${name} must be 0 or 1`);
}

function probability(value: string, name: string, id: string, open = false) {
  const parsed = Number(value);
  const valid = Number.isFinite(parsed) && (open ? parsed > 0 && parsed < 1 : parsed >= 0 && parsed <= 1);
  if (!valid) throw new Error(`${id}: ${name} must be ${open ? "between" : "from"} 0 ${open ? "and" : "to"} 1`);
  return parsed;
}

const records = parseCsv(source);

export const DECISION_OPE_LOGS: readonly DecisionOpeLog[] = Object.freeze(records.map((record, index) => {
  const columns = Object.keys(record);
  if (columns.length !== EXPECTED_COLUMNS.length || EXPECTED_COLUMNS.some((name, column) => columns[column] !== name)) {
    throw new Error("Decision OPE CSV schema changed without a reviewed parser update");
  }

  const expectedId = `L-${String(index + 1).padStart(2, "0")}`;
  if (record.log_id !== expectedId) throw new Error(`Decision OPE CSV expected ${expectedId}; received ${record.log_id}`);
  const segment = Number(record.segment);
  if (!Number.isInteger(segment) || segment < 1 || segment > 4) {
    throw new Error(`${record.log_id}: segment must be an integer from 1 to 4`);
  }

  return Object.freeze({
    id: record.log_id,
    segment: (segment - 1) as 0 | 1 | 2 | 3,
    action: binary(record.action, "action", record.log_id),
    reward: binary(record.reward, "reward", record.log_id),
    behaviourActionOne: probability(record.behaviour_action_one, "behaviour_action_one", record.log_id, true),
    q0: probability(record.q0, "q0", record.log_id),
    q1: probability(record.q1, "q1", record.log_id),
  });
}));

if (DECISION_OPE_LOGS.length !== 24 || new Set(DECISION_OPE_LOGS.map((row) => row.id)).size !== 24) {
  throw new Error("Decision OPE CSV must contain exactly 24 unique synthetic log rows");
}
