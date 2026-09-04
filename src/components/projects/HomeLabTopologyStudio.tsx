"use client";

import ClassicSelect from "../ClassicSelect";

import { type CSSProperties, useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./HomeLabTopologyStudio.module.css";

type ViewId = "topology" | "failure" | "capacity" | "audit";
type Representation = "map" | "table";
type NodeKind = "service" | "operation" | "resource";
type NodeGroup = "Edge" | "Data" | "Access" | "Operations" | "Security" | "Network";
type NodeId =
  | "proxy"
  | "database"
  | "portainer"
  | "guacamole"
  | "scheduler"
  | "fail2ban"
  | "backup"
  | "restore"
  | "network";
type ServiceNodeId = "proxy" | "database" | "portainer" | "guacamole" | "scheduler" | "fail2ban";
type EdgeKind = "dependency" | "membership" | "schedule" | "database-io";

type TopologyNode = {
  id: NodeId;
  alias: string;
  name: string;
  shortName: string;
  kind: NodeKind;
  group: NodeGroup;
  x: number;
  y: number;
  tone: string;
  summary: string;
  evidence: string;
  metrics: Array<[string, string]>;
};

type TopologyEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  kind: EdgeKind;
  label: string;
  evidence: string;
};

const AUDITED_COMMIT = "e3ef6ce";

const VIEWS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "topology", label: "Topology", hint: "trace declared paths" },
  { id: "failure", label: "Failure lab", hint: "review blast radius" },
  { id: "capacity", label: "Capacity", hint: "reconcile + model" },
  { id: "audit", label: "Evidence", hint: "source boundary" },
];

const NODES: TopologyNode[] = [
  {
    id: "proxy",
    alias: "edge-a",
    name: "Nginx Proxy Manager",
    shortName: "Proxy",
    kind: "service",
    group: "Edge",
    x: 16,
    y: 18,
    tone: "#1f6a4d",
    summary: "A reverse-proxy service represented by the Compose service named Nginx.",
    evidence: "Compose declares one application-network membership, two mount entries, four published-port entries and restart: always.",
    metrics: [["Network memberships", "1"], ["Mount entries", "2"], ["Published-port entries", "4"], ["Image tag", "mutable latest"]],
  },
  {
    id: "portainer",
    alias: "ops-a",
    name: "Portainer CE",
    shortName: "Portainer",
    kind: "service",
    group: "Operations",
    x: 15,
    y: 52,
    tone: "#255b84",
    summary: "A container-operations surface declared as an independent Compose service.",
    evidence: "Compose declares one application-network membership, two mount entries, one published-port entry and no depends_on relationship.",
    metrics: [["Network memberships", "1"], ["Mount entries", "2"], ["Published-port entries", "1"], ["Declared dependencies", "0"]],
  },
  {
    id: "fail2ban",
    alias: "guard-a",
    name: "Fail2ban",
    shortName: "Fail2ban",
    kind: "service",
    group: "Security",
    x: 17,
    y: 84,
    tone: "#8e3b38",
    summary: "A log-driven security service with host-facing mounts, kept outside the declared application network.",
    evidence: "Compose declares three mount entries, four environment keys, no published ports, no application-network membership and restart: always.",
    metrics: [["Network memberships", "0"], ["Mount entries", "3"], ["Published-port entries", "0"], ["Environment keys", "4"]],
  },
  {
    id: "network",
    alias: "net-app",
    name: "Application bridge",
    shortName: "App network",
    kind: "resource",
    group: "Network",
    x: 46,
    y: 50,
    tone: "#3b4d77",
    summary: "The single named network declared at the top level of the Compose snapshot.",
    evidence: "Five of the six Compose services explicitly join this network. Membership is connectivity evidence, not a runtime dependency or reachability proof.",
    metrics: [["Declared networks", "1"], ["Explicit members", "5"], ["Service dependencies", "0"], ["Identifier", "synthetic"]],
  },
  {
    id: "guacamole",
    alias: "access-a",
    name: "Guacamole",
    shortName: "Guacamole",
    kind: "service",
    group: "Access",
    x: 64,
    y: 17,
    tone: "#734683",
    summary: "A browser-access service with PostgreSQL named as its direct Compose dependency.",
    evidence: "Compose declares depends_on: postgres, one application-network membership, one mount entry and one published-port entry.",
    metrics: [["Declared dependencies", "1"], ["Network memberships", "1"], ["Mount entries", "1"], ["Published-port entries", "1"]],
  },
  {
    id: "database",
    alias: "data-a",
    name: "PostgreSQL",
    shortName: "PostgreSQL",
    kind: "service",
    group: "Data",
    x: 82,
    y: 50,
    tone: "#285a87",
    summary: "The Compose data service and the target named by both declared service dependencies.",
    evidence: "Compose declares three bind-mount entries, three environment keys, one published-port entry and restart: always.",
    metrics: [["Direct consumers", "2"], ["Mount entries", "3"], ["Environment keys", "3"], ["Image tag", "mutable latest"]],
  },
  {
    id: "scheduler",
    alias: "schedule-a",
    name: "Ofelia",
    shortName: "Scheduler",
    kind: "service",
    group: "Operations",
    x: 64,
    y: 81,
    tone: "#a16419",
    summary: "The job scheduler that declares PostgreSQL as a Compose dependency and carries two job definitions.",
    evidence: "Six Compose labels define a daily database-backup job and a separate recurring log-trimmer job; the image uses a non-latest tag.",
    metrics: [["Declared dependencies", "1"], ["Job labels", "6"], ["Published-port entries", "0"], ["Image tag", "specific"]],
  },
  {
    id: "backup",
    alias: "job-backup",
    name: "Database backup",
    shortName: "Backup job",
    kind: "operation",
    group: "Data",
    x: 88,
    y: 85,
    tone: "#297151",
    summary: "A tracked shell operation referenced by the scheduler's daily job definition.",
    evidence: "The source script invokes pg_dump in PostgreSQL custom format and includes local file cleanup. No retained restore-test result is present.",
    metrics: [["Schedule", "daily"], ["Dump primitive", "pg_dump"], ["Dump format", "custom"], ["Validation result", "not retained"]],
  },
  {
    id: "restore",
    alias: "job-restore",
    name: "Database restore",
    shortName: "Restore drill",
    kind: "operation",
    group: "Data",
    x: 88,
    y: 17,
    tone: "#8c5438",
    summary: "A separately tracked shell operation for rebuilding and restoring PostgreSQL data.",
    evidence: "The source script invokes psql and pg_restore. Presence of a script is recovery intent, not evidence of a successful or timed restore drill.",
    metrics: [["Restore primitives", "2"], ["Automated test", "not found"], ["Recovery time", "not measured"], ["Result", "unverified"]],
  },
];

const EDGES: TopologyEdge[] = [
  { id: "proxy-network", from: "proxy", to: "network", kind: "membership", label: "network member", evidence: "Explicit service network entry in Compose." },
  { id: "portainer-network", from: "portainer", to: "network", kind: "membership", label: "network member", evidence: "Explicit service network entry in Compose." },
  { id: "database-network", from: "database", to: "network", kind: "membership", label: "network member", evidence: "Explicit service network entry in Compose." },
  { id: "guacamole-network", from: "guacamole", to: "network", kind: "membership", label: "network member", evidence: "Explicit service network entry in Compose." },
  { id: "scheduler-network", from: "scheduler", to: "network", kind: "membership", label: "network member", evidence: "Explicit service network entry in Compose." },
  { id: "guacamole-database", from: "guacamole", to: "database", kind: "dependency", label: "depends_on", evidence: "Direct Compose depends_on entry." },
  { id: "scheduler-database", from: "scheduler", to: "database", kind: "dependency", label: "depends_on", evidence: "Direct Compose depends_on entry." },
  { id: "scheduler-backup", from: "scheduler", to: "backup", kind: "schedule", label: "daily job", evidence: "Ofelia label references the tracked backup script on a daily schedule." },
  { id: "backup-database", from: "backup", to: "database", kind: "database-io", label: "pg_dump", evidence: "Tracked backup script invokes pg_dump." },
  { id: "restore-database", from: "restore", to: "database", kind: "database-io", label: "psql + pg_restore", evidence: "Tracked restore script invokes psql and pg_restore." },
];

const SERVICE_IDS: ServiceNodeId[] = ["proxy", "database", "portainer", "guacamole", "scheduler", "fail2ban"];

const INVENTORY = [
  { label: "Compose services", value: 6, note: "exact declarations" },
  { label: "Named networks", value: 1, note: "five explicit members" },
  { label: "Named volumes", value: 3, note: "top-level declarations" },
  { label: "Mount entries", value: 12, note: "across six services" },
  { label: "Published-port entries", value: 7, note: "values withheld" },
  { label: "Health checks", value: 0, note: "none declared" },
];

const MOUNT_ROWS = [
  { name: "Nginx Proxy Manager", mounts: 2, ports: 4, dependencies: 0 },
  { name: "PostgreSQL", mounts: 3, ports: 1, dependencies: 0 },
  { name: "Portainer CE", mounts: 2, ports: 1, dependencies: 0 },
  { name: "Guacamole", mounts: 1, ports: 1, dependencies: 1 },
  { name: "Ofelia", mounts: 1, ports: 0, dependencies: 1 },
  { name: "Fail2ban", mounts: 3, ports: 0, dependencies: 0 },
];

function nodeById(id: NodeId) {
  const node = NODES.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Unknown topology node: ${id}`);
  return node;
}

function findPath(start: NodeId, target: NodeId): TopologyEdge[] | null {
  if (start === target) return [];
  const queue: Array<{ node: NodeId; path: TopologyEdge[] }> = [{ node: start, path: [] }];
  const visited = new Set<NodeId>([start]);

  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    for (const edge of EDGES.filter((candidate) => candidate.from === current.node)) {
      if (visited.has(edge.to)) continue;
      const path = [...current.path, edge];
      if (edge.to === target) return path;
      visited.add(edge.to);
      queue.push({ node: edge.to, path });
    }
  }
  return null;
}

function dependencyConsumers(fault: ServiceNodeId) {
  const found = new Set<NodeId>();
  const queue: NodeId[] = [fault];

  while (queue.length) {
    const dependency = queue.shift();
    if (!dependency) break;
    for (const edge of EDGES.filter((candidate) => candidate.kind === "dependency" && candidate.to === dependency)) {
      if (found.has(edge.from)) continue;
      found.add(edge.from);
      queue.push(edge.from);
    }
  }

  if (fault === "database") {
    found.add("backup");
    found.add("restore");
  }
  if (fault === "scheduler") found.add("backup");
  return found;
}

function edgeCoordinates(edge: TopologyEdge) {
  const from = nodeById(edge.from);
  const to = nodeById(edge.to);
  return { x1: from.x * 10, y1: from.y * 5.2, x2: to.x * 10, y2: to.y * 5.2 };
}

function TopologyMap({
  selected,
  setSelected,
  highlightedEdges,
}: {
  selected: NodeId;
  setSelected: (id: NodeId) => void;
  highlightedEdges: Set<string>;
}) {
  return (
      <div className={styles.topologyMap} role="group" aria-label="Privacy-safe service topology">
      <svg className={styles.edgeLayer} viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
        {EDGES.map((edge) => {
          const coordinates = edgeCoordinates(edge);
          return (
            <line
              key={edge.id}
              {...coordinates}
              className={`${styles.edge} ${styles[`edge_${edge.kind}`]} ${highlightedEdges.has(edge.id) ? styles.edgeHighlighted : ""}`}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <span className={styles.zoneLabelEdge}>EDGE + OPERATIONS</span>
      <span className={styles.zoneLabelData}>DECLARED DATA PATHS</span>
      {NODES.map((node) => (
        <button
          type="button"
          key={node.id}
          aria-pressed={selected === node.id}
          className={`${styles.topologyNode} ${styles[`node_${node.kind}`]}`}
          style={{ "--node-x": `${node.x}%`, "--node-y": `${node.y}%`, "--node-tone": node.tone } as CSSProperties}
          onClick={() => setSelected(node.id)}
        >
          <span>{node.alias}</span>
          <strong>{node.shortName}</strong>
          <small>{node.kind}</small>
        </button>
      ))}
      <div className={styles.mapLegend} aria-hidden="true">
        <span><i className={styles.legendDependency} /> dependency</span>
        <span><i className={styles.legendMembership} /> membership</span>
        <span><i className={styles.legendOperation} /> operation</span>
      </div>
    </div>
  );
}

function DependencyTable({ highlightedEdges }: { highlightedEdges: Set<string> }) {
  return (
    <div className={styles.tableViewport} role="region" aria-label="Topology relationship table" tabIndex={0}>
      <table className={styles.relationshipTable}>
        <caption>Audited service, resource and operation relationships</caption>
        <thead><tr><th>From</th><th>Relationship</th><th>To</th><th>Evidence</th></tr></thead>
        <tbody>
          {EDGES.map((edge) => (
            <tr key={edge.id} className={highlightedEdges.has(edge.id) ? styles.rowHighlighted : undefined}>
              <th scope="row"><span>{nodeById(edge.from).alias}</span>{nodeById(edge.from).name}</th>
              <td><strong className={styles[`relation_${edge.kind}`]}>{edge.label}</strong></td>
              <td><span>{nodeById(edge.to).alias}</span>{nodeById(edge.to).name}</td>
              <td>{edge.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopologyView() {
  const [representation, setRepresentation] = useState<Representation>("map");
  const [selected, setSelected] = useState<NodeId>("database");
  const [start, setStart] = useState<NodeId>("guacamole");
  const [target, setTarget] = useState<NodeId>("database");
  const [traceActive, setTraceActive] = useState(true);
  const path = useMemo(() => findPath(start, target), [start, target]);
  const highlightedEdges = useMemo(
    () => new Set(traceActive && path ? path.map((edge) => edge.id) : []),
    [path, traceActive],
  );
  const selectedNode = nodeById(selected);
  const pathText = !traceActive
    ? "Path highlighting is clear."
    : path === null
      ? `No directed relationship path is declared from ${nodeById(start).name} to ${nodeById(target).name}.`
      : path.length === 0
        ? `${nodeById(start).name} is the selected target.`
        : [start, ...path.map((edge) => edge.to)].map((id) => nodeById(id).name).join(" → ");

  return (
    <div className={styles.topologyView}>
      <section className={styles.traceToolbar} aria-label="Dependency path tracer">
        <div>
          <span>PATH TRACER</span>
          <p>Follow only directed relationships retained in the audited snapshot.</p>
        </div>
        <label>From
          <ClassicSelect value={start} onChange={(event) => { setStart(event.target.value as NodeId); setTraceActive(false); }}>
            {NODES.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
          </ClassicSelect>
        </label>
        <label>To
          <ClassicSelect value={target} onChange={(event) => { setTarget(event.target.value as NodeId); setTraceActive(false); }}>
            {NODES.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
          </ClassicSelect>
        </label>
        <button type="button" onClick={() => setTraceActive(true)}>Trace path</button>
        <button type="button" className={styles.quietButton} onClick={() => setTraceActive(false)}>Clear</button>
      </section>

      <div className={styles.representationBar}>
        <div role="group" aria-label="Topology representation">
          <button type="button" aria-pressed={representation === "map"} onClick={() => setRepresentation("map")}>2D map</button>
          <button type="button" aria-pressed={representation === "table"} onClick={() => setRepresentation("table")}>Evidence table</button>
        </div>
        <p aria-live="polite"><span>{!traceActive ? "PATH CLEAR" : path === null ? "NO PATH" : "DECLARED PATH"}</span>{pathText}</p>
      </div>

      <div className={styles.topologyWorkspace}>
        <section className={styles.mapPanel}>
          <div className={styles.panelHeading}><span>MAP</span><strong>PRIVACY-SAFE LOGICAL TOPOLOGY</strong><em>HOST IDs SYNTHETIC</em></div>
          {representation === "map"
            ? <TopologyMap selected={selected} setSelected={setSelected} highlightedEdges={highlightedEdges} />
            : <DependencyTable highlightedEdges={highlightedEdges} />}
        </section>

        <aside className={styles.nodeInspector} aria-live="polite">
          <div className={styles.inspectorIdentity} style={{ "--node-tone": selectedNode.tone } as CSSProperties}>
            <span>{selectedNode.alias} · {selectedNode.kind}</span>
            <h3>{selectedNode.name}</h3>
            <strong>{selectedNode.group}</strong>
          </div>
          <p>{selectedNode.summary}</p>
          <dl>
            {selectedNode.metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <section>
            <span>EVIDENCE NOTE</span>
            <p>{selectedNode.evidence}</p>
          </section>
          <small>Alias is deliberately synthetic; live operational identity is not represented.</small>
        </aside>
      </div>
    </div>
  );
}

function FailureLab() {
  const [fault, setFault] = useState<ServiceNodeId>("database");
  const [step, setStep] = useState(0);
  const consumers = useMemo(() => dependencyConsumers(fault), [fault]);
  const selectedNode = nodeById(fault);
  const declaredConsumers = [...consumers].filter((id) => nodeById(id).kind === "service");
  const operationReviews = [...consumers].filter((id) => nodeById(id).kind === "operation");
  const recoveryNote = fault === "database"
    ? "A restore script exists, but the repository retains no checksum, restore-test result, recovery time or successful drill record."
    : "Compose declares restart: always, but no health check or retained recovery result proves successful service restoration.";

  function stateFor(node: TopologyNode) {
    if (step === 0) return { label: "NOT INJECTED", tone: "idle" };
    if (step === 3) return { label: "SCENARIO RESET", tone: "recovered" };
    if (node.id === fault) return { label: "FAULT MARKER", tone: "fault" };
    if (step >= 2 && consumers.has(node.id)) return { label: "REVIEW PATH", tone: "review" };
    return { label: "NO DECLARED PATH", tone: "neutral" };
  }

  return (
    <div className={styles.failureView}>
      <div className={styles.failureBanner} role="note">
        <span>SIMULATION ONLY</span>
        <p>This fault lab changes browser state only. It does not contact, probe, stop or restart any infrastructure.</p>
        <strong>NO UPTIME CLAIM</strong>
      </div>

      <div className={styles.failureLayout}>
        <aside className={styles.failureControls}>
          <div className={styles.panelHeading}><span>!</span><strong>FAULT CONTROL</strong><em>READ ONLY</em></div>
          <label>Compose service
            <ClassicSelect value={fault} onChange={(event) => { setFault(event.target.value as ServiceNodeId); setStep(0); }}>
              {SERVICE_IDS.map((id) => <option value={id} key={id}>{nodeById(id).name}</option>)}
            </ClassicSelect>
          </label>
          <div className={styles.faultTarget} style={{ "--node-tone": selectedNode.tone } as CSSProperties}>
            <span>{selectedNode.alias}</span><strong>{selectedNode.name}</strong><small>restart: always · healthcheck: absent</small>
          </div>
          <ol className={styles.drillSteps}>
            <li className={step >= 1 ? styles.stepActive : undefined}><span>1</span><div><strong>Inject marker</strong><small>Isolate one synthetic service state.</small></div></li>
            <li className={step >= 2 ? styles.stepActive : undefined}><span>2</span><div><strong>Review paths</strong><small>Surface declared consumers and operations.</small></div></li>
            <li className={step >= 3 ? styles.stepActive : undefined}><span>3</span><div><strong>Recovery drill</strong><small>Record evidence gaps; reset scenario.</small></div></li>
          </ol>
          <div className={styles.drillButtons}>
            <button type="button" disabled={step !== 0} onClick={() => setStep(1)}>Inject fault</button>
            <button type="button" disabled={step !== 1} onClick={() => setStep(2)}>Review graph</button>
            <button type="button" disabled={step !== 2} onClick={() => setStep(3)}>Simulate recovery</button>
            <button type="button" className={styles.quietButton} onClick={() => setStep(0)}>Reset</button>
          </div>
        </aside>

        <section className={styles.blastPanel} aria-live="polite">
          <div className={styles.panelHeading}><span>∆</span><strong>DECLARED BLAST-RADIUS REVIEW</strong><em>STEP {step} / 3</em></div>
          <div className={styles.failureSummary}>
            <div><span>Selected fault</span><strong>{step === 0 ? "—" : selectedNode.name}</strong><small>synthetic injection</small></div>
            <div><span>Service review paths</span><strong>{step >= 2 ? declaredConsumers.length : "—"}</strong><small>depends_on only</small></div>
            <div><span>Operation reviews</span><strong>{step >= 2 ? operationReviews.length : "—"}</strong><small>script/job links</small></div>
            <div className={styles.riskMetric}><span>Health checks</span><strong>0</strong><small>across all six services</small></div>
          </div>

          <div className={styles.stateGrid}>
            {NODES.filter((node) => node.kind !== "resource").map((node) => {
              const state = stateFor(node);
              return (
                <article key={node.id} className={styles[`state_${state.tone}`]}>
                  <span>{node.alias}</span><strong>{node.shortName}</strong><small>{state.label}</small>
                </article>
              );
            })}
          </div>

          <div className={styles.recoveryLedger}>
            <section>
              <span>WHAT THE GRAPH SUPPORTS</span>
              <p>{declaredConsumers.length
                ? `${selectedNode.name} has ${declaredConsumers.length} direct or transitive Compose consumer${declaredConsumers.length === 1 ? "" : "s"} to review.`
                : `${selectedNode.name} has no declared downstream service dependency in this Compose snapshot.`}</p>
            </section>
            <section>
              <span>WHAT IT DOES NOT PROVE</span>
              <p><code>depends_on</code> captures startup ordering here; without health checks it does not prove readiness, runtime propagation or recovery.</p>
            </section>
            <section className={styles.recoveryCaveat}>
              <span>RECOVERY EVIDENCE</span>
              <p>{recoveryNote}</p>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function CapacityView() {
  const [dumpSize, setDumpSize] = useState(12);
  const [retention, setRetention] = useState(14);
  const [headroom, setHeadroom] = useState(20);
  const retained = dumpSize * retention;
  const provisioned = retained * (1 + headroom / 100);
  const monthlyWrite = dumpSize * 30;

  return (
    <div className={styles.capacityView}>
      <section className={styles.inventoryStrip} aria-label="Audited Compose inventory">
        {INVENTORY.map((item) => (
          <div key={item.label} className={item.label === "Health checks" ? styles.inventoryRisk : undefined}>
            <span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small>
          </div>
        ))}
      </section>

      <div className={styles.capacityLayout}>
        <section className={styles.mountPanel}>
          <div className={styles.panelHeading}><span>Σ</span><strong>COMPOSE ENTRY RECONCILIATION</strong><em>EXACT COUNTS</em></div>
          <div className={styles.mountHeader}><span>Service</span><span>Mounts</span><span>Ports</span><span>Depends</span></div>
          {MOUNT_ROWS.map((row) => (
            <div className={styles.mountRow} key={row.name}>
              <strong>{row.name}</strong>
              <span><i style={{ "--bar-width": `${row.mounts * 25}%` } as CSSProperties} />{row.mounts}</span>
              <span><i style={{ "--bar-width": `${row.ports * 25}%` } as CSSProperties} />{row.ports}</span>
              <span><i style={{ "--bar-width": `${row.dependencies * 25}%` } as CSSProperties} />{row.dependencies}</span>
            </div>
          ))}
          <div className={styles.reconcileTotal}>
            <span>Mount reconciliation</span><strong>2 + 3 + 2 + 1 + 1 + 3 = 12</strong>
          </div>
          <div className={styles.tagRisk}>
            <div><span>MUTABLE IMAGE TAGS</span><strong>5 / 6</strong><small>five services use latest</small></div>
            <div><span>SPECIFIC IMAGE TAGS</span><strong>1 / 6</strong><small>scheduler only</small></div>
          </div>
        </section>

        <section className={styles.backupPlanner}>
          <div className={styles.panelHeading}><span>DB</span><strong>DAILY BACKUP CAPACITY MODEL</strong><em>SCENARIO, NOT TELEMETRY</em></div>
          <div className={styles.plannerIntro}>
            <span>SOURCE ANCHOR</span>
            <p>Ofelia declares a daily backup job and the tracked script uses PostgreSQL custom-format dump output. Dump size and retention are not recorded.</p>
          </div>
          <div className={styles.sliderGrid}>
            <label><span>Assumed post-dump size <strong>{dumpSize} GiB</strong></span>
              <input type="range" min="1" max="100" step="1" value={dumpSize} aria-valuetext={`${dumpSize} GiB`} onChange={(event) => setDumpSize(Number(event.target.value))} />
            </label>
            <label><span>Scenario retention <strong>{retention} days</strong></span>
              <input type="range" min="1" max="45" step="1" value={retention} aria-valuetext={`${retention} days`} onChange={(event) => setRetention(Number(event.target.value))} />
            </label>
            <label><span>Capacity headroom <strong>{headroom}%</strong></span>
              <input type="range" min="0" max="50" step="5" value={headroom} aria-valuetext={`${headroom}%`} onChange={(event) => setHeadroom(Number(event.target.value))} />
            </label>
          </div>
          <div className={styles.capacityEquation} aria-label="Backup capacity calculation">
            <span>required GiB</span>
            <strong>{dumpSize}</strong><i>×</i><strong>1/day</strong><i>×</i><strong>{retention} days</strong><i>×</i><strong>{(1 + headroom / 100).toFixed(2)}</strong><i>=</i><b>{provisioned.toFixed(1)} GiB</b>
          </div>
          <div className={styles.capacityResults}>
            <div><span>Retained payload</span><strong>{retained.toLocaleString("en-GB")} GiB</strong><small>before headroom</small></div>
            <div><span>Provisioning scenario</span><strong>{provisioned.toFixed(1)} GiB</strong><small>with {headroom}% headroom</small></div>
            <div><span>30-day write volume</span><strong>{monthlyWrite.toLocaleString("en-GB")} GiB</strong><small>one assumed dump per day</small></div>
          </div>
          <p className={styles.modelCaveat}>These are deterministic calculations over visitor-selected assumptions. They are not observed storage use, compression ratios, throughput, backup success or recovery-time measurements.</p>
        </section>
      </div>
    </div>
  );
}

function AuditView() {
  const ledger = [
    { state: "verified", label: "VERIFIED", title: "Compose inventory", detail: "Six services, one network, three volumes, twelve mount entries, seven published-port entries and six restart policies." },
    { state: "verified", label: "VERIFIED", title: "Dependency structure", detail: "Guacamole and Ofelia each name PostgreSQL in depends_on; five services explicitly join the declared application network." },
    { state: "verified", label: "VERIFIED", title: "Recovery intent", detail: "A daily scheduler label references the backup script; tracked scripts invoke pg_dump, psql and pg_restore." },
    { state: "caveat", label: "NOT VERIFIED", title: "Runtime health", detail: "No Compose health checks, retained monitoring export, uptime series, restore-test result or recovery-time measurement was found." },
    { state: "illustrative", label: "ILLUSTRATIVE", title: "Browser simulation", detail: "Synthetic node aliases, injected failures, selected retention and calculated capacity exist only in this exhibit." },
    { state: "excluded", label: "EXCLUDED", title: "Live configuration", detail: "Operational identity, runtime state and device-specific configuration never enter the exhibit." },
  ];

  return (
    <div className={styles.auditView}>
      <section className={styles.sourceSummary}>
        <div><span>AUDITED HEAD</span><strong>{AUDITED_COMMIT}</strong><small>private default branch snapshot</small></div>
        <div><span>TRACKED PATHS</span><strong>563</strong><small>inventory count only</small></div>
        <div><span>SOURCE VISIBILITY</span><strong>PRIVATE</strong><small>no repository action exposed</small></div>
        <div className={styles.sourceRisk}><span>DECLARED LICENCE</span><strong>NONE</strong><small>case study, not open source</small></div>
      </section>

      <div className={styles.auditLayout}>
        <section className={styles.evidenceLedger}>
          <div className={styles.panelHeading}><span>✓</span><strong>CLAIM-BY-CLAIM EVIDENCE LEDGER</strong><em>AS AUDITED</em></div>
          {ledger.map((item) => (
            <article key={item.title} className={styles[`ledger_${item.state}`]}>
              <span>{item.label}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div>
            </article>
          ))}
        </section>

        <aside className={styles.historyPanel}>
          <div className={styles.panelHeading}><span>GIT</span><strong>CONFIGURATION LINEAGE</strong><em>SELECTED EVENTS</em></div>
          <ol>
            <li><time dateTime="2024-10-09">09 OCT 2024</time><span>9ff7fe5</span><strong>Initial tracked stack snapshot</strong><p>Compose and supporting runtime configuration enter history.</p></li>
            <li><time dateTime="2025-05-03">03 MAY 2025</time><span>93dfd64</span><strong>Compose update</strong><p>The core orchestration file changes during the stack’s expansion.</p></li>
            <li><time dateTime="2025-06-03">03 JUN 2025</time><span>851b6d4</span><strong>Network and homepage configuration</strong><p>Remote-access and service-directory configuration are added to the tracked stack.</p></li>
            <li><time dateTime="2025-09-20">20 SEP 2025</time><span>90f77a4</span><strong>Configuration upload</strong><p>A later Compose snapshot is retained in main history.</p></li>
            <li><time dateTime="2026-02-12">12 FEB 2026</time><span>{AUDITED_COMMIT}</span><strong>Clean-main merge</strong><p>The full Docker configuration becomes HEAD.</p></li>
          </ol>
        </aside>
      </div>

      <section className={styles.boundaryGrid}>
        <div><span>REPOSITORY ≠ WHOLE LAB</span><p>The six-service Compose snapshot is not presented as a complete inventory of the broader home-lab narrative elsewhere on the site.</p></div>
        <div><span>PRIVATE SOURCE GATE</span><p>Live configuration and runtime state are excluded, source visibility remains restricted and no repository link is offered.</p></div>
        <div><span>LICENCE BOUNDARY</span><p>No LICENSE, COPYING or NOTICE file was found. This independently implemented exhibit is a case study, not a reusable source distribution.</p></div>
      </section>
    </div>
  );
}

export function HomeLabTopologyStudio() {
  const [view, setView] = useState<ViewId>("topology");

  return (
    <DemoWindow
      appName="Home Lab Topology — Private Case Study"
      title="Infrastructure Evidence Workbench"
      status="SYNTHETIC HOSTS · READ ONLY"
      purpose="Audit what a six-service Compose snapshot declares—and separate configuration intent from proven availability or recovery."
      tryThis="Trace a dependency path, fail PostgreSQL and size a backup-retention scenario."
      watchFor="Blast paths and capacity change, while absent health checks and unverified restore evidence remain explicit."
      statusTone="safe"
      className={styles.studio}
      footer={
        <>
          <span>Audited {AUDITED_COMMIT} · private source · no licence · no source link</span>
          <span>6 Compose services · 2 direct dependencies · 0 health checks</span>
        </>
      }
    >
      <div className={styles.provenanceBanner} role="note">
        <span>STRUCTURE, NOT SECRETS</span>
        <p>Reconstructed from one private Compose snapshot. Every visible host alias is synthetic; all operational identity and runtime state stay outside the browser.</p>
        <strong>NO NETWORK CALLS</strong>
      </div>

      <nav className={styles.viewTabs} aria-label="Infrastructure workbench views">
        {VIEWS.map((item) => (
          <button type="button" key={item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}>
            <strong>{item.label}</strong><span>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className={styles.canvas}>
        {view === "topology" ? <TopologyView /> : null}
        {view === "failure" ? <FailureLab /> : null}
        {view === "capacity" ? <CapacityView /> : null}
        {view === "audit" ? <AuditView /> : null}
      </div>
    </DemoWindow>
  );
}

export default HomeLabTopologyStudio;
