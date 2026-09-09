/** Browser implementation of the STUDY-RL Week 04 CliffWalking experiment. */
export type ControlMethod = "q-learning" | "sarsa";
export type CliffSettings = { method: ControlMethod; alpha: number; epsilon: number; seed: number };
export type CliffAgent = { q: number[][]; rng: number; state: number; action: number; episode: number; steps: number; totalSteps: number; reward: number; falls: number; history: { reward: number; falls: number; goal: boolean }[]; last: null | { state: number; action: number; reward: number; next: number; old: number; target: number; updated: number; terminal: boolean } };
export const cliffStart = 36;
export const cliffGoal = 47;
export function cliffTransition(state: number, action: number) {
  const row = Math.max(0, Math.min(3, Math.floor(state / 12) + [-1, 0, 1, 0][action]));
  const col = Math.max(0, Math.min(11, state % 12 + [0, 1, 0, -1][action]));
  const cliff = row === 3 && col > 0 && col < 11;
  const next = cliff ? cliffStart : row * 12 + col;
  return { next, reward: cliff ? -100 : -1, terminal: next === cliffGoal, cliff };
}
function random(agent: CliffAgent) {
  agent.rng = (Math.imul(1664525, agent.rng) + 1013904223) >>> 0;
  return agent.rng / 4294967296;
}
export function greedyAction(values: number[]) { return values.indexOf(Math.max(...values)); }
function choose(agent: CliffAgent, epsilon: number) {
  return random(agent) < epsilon ? Math.floor(random(agent) * 4) : greedyAction(agent.q[agent.state]);
}
export function createCliffAgent(settings: CliffSettings): CliffAgent {
  const agent: CliffAgent = { q: Array.from({ length: 48 }, () => [0, 0, 0, 0]), rng: settings.seed >>> 0, state: cliffStart, action: 0, episode: 0, steps: 0, totalSteps: 0, reward: 0, falls: 0, history: [], last: null };
  agent.action = choose(agent, settings.epsilon);
  return agent;
}
/** Mutates a caller-owned clone. Collection caps preserve bootstrap; only the goal is terminal. */
function update(agent: CliffAgent, settings: CliffSettings) {
  const state = agent.state;
  const action = agent.action;
  const transition = cliffTransition(state, action);
  const old = agent.q[state][action];
  agent.state = transition.next;
  const nextAction = settings.method === "sarsa" ? choose(agent, settings.epsilon) : 0;
  const bootstrap = settings.method === "sarsa" ? agent.q[transition.next][nextAction] : Math.max(...agent.q[transition.next]);
  const target = transition.reward + (transition.terminal ? 0 : bootstrap); // gamma = 1
  const updated = old + settings.alpha * (target - old);
  agent.q[state][action] = updated;
  agent.last = { state, action, reward: transition.reward, next: transition.next, old, target, updated, terminal: transition.terminal };
  agent.steps++; agent.totalSteps++; agent.reward += transition.reward; agent.falls += Number(transition.cliff);
  agent.action = settings.method === "sarsa" ? nextAction : choose(agent, settings.epsilon);
  if (transition.terminal || agent.steps >= 200) {
    agent.history.push({ reward: agent.reward, falls: agent.falls, goal: transition.terminal });
    agent.episode++; agent.state = cliffStart; agent.steps = 0; agent.reward = 0; agent.falls = 0;
    agent.action = choose(agent, settings.epsilon);
  }
}
export function trainCliff(current: CliffAgent, settings: CliffSettings, count: number, unit: "steps" | "episodes") {
  const agent: CliffAgent = { ...current, q: current.q.map((row) => [...row]), history: [...current.history] };
  const end = (unit === "episodes" ? agent.episode : agent.totalSteps) + count;
  while ((unit === "episodes" ? agent.episode : agent.totalSteps) < end) update(agent, settings);
  return agent;
}
export function evaluateCliff(agent: CliffAgent) {
  const path = [cliffStart];
  let state = cliffStart, reward = 0, falls = 0;
  for (let step = 0; step < 200; step++) {
    const next = cliffTransition(state, greedyAction(agent.q[state]));
    reward += next.reward; falls += Number(next.cliff); state = next.next; path.push(state);
    if (next.terminal) return { path, reward, falls, goal: true };
  }
  return { path, reward, falls, goal: false };
}
