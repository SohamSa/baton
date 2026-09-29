import { FormEvent, useEffect, useState } from "react";
import { EconomicsEstimate, FailureLevel, LiveFrame, OwnerPlaybook, RunView, StoryItem, estimateEconomics, stories } from "./api";

const REASONS: Record<string, string> = {
  currency_disabled_until_complete_accounting_configuration: "Currency stays off until the accounting configuration is complete.",
  incomplete_accounting_configuration: "Some accounting fields are still empty, so return on investment stays undefined.",
  roi_undefined_when_investment_cost_is_zero: "Return on investment is undefined when the investment is zero. It is not treated as infinite.",
  incompatible_benefit_and_cost_basis: "The benefit basis does not match this estimate.",
  missing_useful_delta_gpu_hours: "The useful-work delta is not available yet.",
  computed_from_user_supplied_assumptions: "Computed from the rates you entered and the useful-work difference of this simulation.",
};

const INDUSTRY_PRESETS = [
  {
    name: "Hyperscale Frontier (32k GPUs)",
    rate: "3.50",
    currency: "USD",
    cost_basis: "All-in: power, cooling, space & hardware depreciation",
    scope: "Active frontier pre-training cluster (placed accelerators)",
    horizon: "1-year pretraining campaign",
    investment: "50000",
    extra: "5000",
    desc: "Simulating massive multi-node training (e.g. Gemini-scale)",
  },
  {
    name: "Enterprise Cluster (4,096 GPUs)",
    rate: "2.85",
    currency: "USD",
    cost_basis: "Cloud reserved instances + dedicated networking",
    scope: "Enterprise foundation model training run",
    horizon: "90-day training run",
    investment: "15000",
    extra: "1200",
    desc: "Dedicated enterprise LLM training capacity",
  },
  {
    name: "AI Cloud Startup (1,024 GPUs)",
    rate: "2.20",
    currency: "USD",
    cost_basis: "Spot & on-demand accelerator rental",
    scope: "Startup model pre-training & fine-tuning",
    horizon: "30-day training sprint",
    investment: "5000",
    extra: "500",
    desc: "Fast-moving AI startup or Neocloud cluster",
  },
];

export function Desk({
  token,
  run,
  frames,
  playing,
  presentation,
  onPlay,
  onDecide,
}: {
  token: string;
  run: RunView | null;
  frames: LiveFrame[];
  playing: boolean;
  presentation: boolean;
  onPlay: (id: string, mode: "manual" | "automated") => void;
  onDecide: (decision: "approve" | "reject") => void;
}) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [mode, setMode] = useState<"manual" | "automated">("manual");
  const [selected, setSelected] = useState("gradual_warning");
  const [activeRate, setActiveRate] = useState<number>(3.5);
  const live = frames[frames.length - 1];
  const cluster = live?.cluster ?? run?.cluster;
  const placed = (live?.accelerators ?? []).filter((item) => !item.spare);
  const maxUseful = Math.max(...frames.map((frame) => frame.useful_new), 1);
  const currentStory = items.find((item) => item.id === selected) ?? (run?.story as StoryItem | undefined);

  useEffect(() => {
    stories(token).then((payload) => setItems(payload.stories)).catch(() => setItems([]));
  }, [token]);

  return (
    <section className="desk">
      <p className="eyebrow">A rehearsal for a data-center owner</p>
      <h1>When one machine stops, the whole job waits.</h1>
      <p className="lede">
        Think of a relay race where the baton cannot move until every runner finishes the same leg. The runners here are accelerator chips, the special processors that do the heavy math inside a data center. If one runner stops, the race stops, even while the rest of the building is still powered and cooled.
        This page rehearses that moment in a simulated hall of {cluster ? cluster.accelerator_count.toLocaleString() : "tens of thousands of"} chips. It is a practice floor. It is not connected to a building you own.
      </p>

      {/* 1. LIVE CAPITAL BURN TICKER */}
      <BurnTicker
        live={live}
        run={run}
        frames={frames}
        activeRate={activeRate}
        presentation={presentation}
      />

      <div className="problems">
        <article>
          <h2>The stall</h2>
          <p>One chip in the job stops, and the job stops with it. The other machines are still on. They are not producing the next piece of work. You are paying for a building that is waiting.</p>
        </article>
        <article>
          <h2>The unsaved work</h2>
          <p>Work that lives only in the machine’s memory is like a document you never saved. A half-finished save cannot be reopened. The only progress you can defend is the last complete save, and the gap since that save is what you stand to lose.</p>
        </article>
        <article>
          <h2>The false alarm</h2>
          <p>A busy spell makes chips warmer, the way a kitchen heats up during the dinner rush. A rule that shuts a machine down just because it is warm can throw away more work than the breakdown it was meant to prevent.</p>
        </article>
      </div>

      {/* 2. PHYSICAL FAILURE CASCADE */}
      <PhysicalCascade live={live} cluster={cluster} failureLevel={currentStory?.failure_level} />

      {/* 3. OWNER'S SOLUTION PLAYBOOK */}
      <PlaybookCard playbook={currentStory?.owner_playbook} failureLevel={currentStory?.failure_level} />

      {/* FAILURE HIERARCHY SUMMARY BANNER */}
      {currentStory?.failure_level ? (
        <div className="failure-hierarchy-banner">
          <div className="fh-badge-row">
            <span className="fh-pill tier-pill">
              Hierarchy Tier: <strong>{currentStory.failure_level.tier}</strong>
            </span>
            <span className="fh-pill comp-pill">
              Root Cause: <strong>{currentStory.failure_level.component}</strong>
            </span>
          </div>
          <div className="fh-grid">
            <div className="fh-col">
              <span className="fh-label">💥 Physical Blast Radius:</span>
              <p className="fh-text">{currentStory.failure_level.blast_radius}</p>
            </div>
            <div className="fh-col">
              <span className="fh-label">🛡️ Redundancy Architecture:</span>
              <p className="fh-text">{currentStory.failure_level.redundancy_strategy}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="panel controls">
        <div className="row">
          <label>
            Story
            <select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={playing || items.length === 0}>
              {items.length === 0 ? <option value="gradual_warning">Loading stories from the engine…</option> : null}
              {items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label>
            How the decision is taken
            <select value={mode} onChange={(event) => setMode(event.target.value as "manual" | "automated")}>
              <option value="manual">You approve the serious action</option>
              <option value="automated">Compare two ways on the same breakdown</option>
            </select>
          </label>
          <button type="button" onClick={() => onPlay(selected, mode)} disabled={playing}>
            {playing ? "The hall is moving" : "Run this story live"}
          </button>
        </div>
        <p className="muted">{items.find((item) => item.id === selected)?.summary ?? "The opening rehearsal is a chip that runs hotter and hotter before it stops, like an engine gauge climbing. The run will pause and ask you whether to save the work."}</p>
      </div>

      <div className="hall-wrap">
        <div className="hall-head">
          <h2>Chips in this job</h2>
          <p>
            {live ? `Step ${live.step + 1} of ${live.steps}. The job is ${live.job_state}. ${live.abstain ? "The readings are not enough to name a cause." : `Best reading: ${live.hypothesis.replaceAll("_", " ")}.`}` : "The opening rehearsal is about to start. The chips update as each step is computed."}
          </p>
        </div>
        <div className="floor" role="img" aria-label="Placed accelerators in the simulated job">
          {placed.length === 0 ? <p className="muted">Waiting for the first step.</p> : placed.map((gpu) => (
            <div key={gpu.id} className={`cell ${tone(gpu)}`} title={cellTitle(gpu, presentation)}>
              <span>{gpu.id.split("-").slice(-1)[0]}</span>
              <strong>{presentation || gpu.temp === null ? "·" : `${gpu.temp.toFixed(0)}°`}</strong>
            </div>
          ))}
        </div>
        <div className="quiescent">
          <span />
          <p>
            {cluster
              ? `${cluster.quiescent_accelerator_count.toLocaleString()} other chips in the same hall — ${cluster.rack_count.toLocaleString()} racks, ${cluster.host_count.toLocaleString()} machines, ${cluster.fabric_domain_count} network neighborhoods. Counted, the way a warehouse counts boxes on the back shelves. They are not drawn one by one, and this page is not plugged into them.`
              : "The rest of the hall is counted, the way a warehouse counts boxes on the back shelves. This page is not plugged into those machines."}
          </p>
        </div>
        <div className="spark" aria-label="Useful progress across the steps computed so far">
          {frames.slice(-48).map((frame, index) => (
            <i key={`${frame.step}-${index}`} style={{ height: `${Math.max(8, (frame.useful_new / maxUseful) * 100)}%` }} title={`Step ${frame.step + 1}: useful ${frame.useful_new.toFixed(2)}`} />
          ))}
        </div>
        <p className="muted">The bars are finished work in this practice job. They are a rehearsal score, not a reading from a building you operate, and they are not money saved.</p>
      </div>

      <div className="grid">
        <article className="card">
          <h2>What the job is doing</h2>
          <p>{live?.job_state ?? Object.values(run?.jobs ?? {})[0]?.state ?? "Waiting to start"}</p>
          {!presentation && live ? <p className="muted">Useful new progress {live.useful_new.toFixed(2)} steps. Recomputation {live.recomputation.toFixed(2)}.</p> : null}
        </article>
        <article className="card">
          <h2>Last verified save</h2>
          <p>{checkpointLine(live, run)}</p>
        </article>
        <article className="card">
          <h2>Decision</h2>
          <p>{run?.pending_action ? "A person has to answer before the action is applied." : run?.status ?? (playing ? "Stepping" : "Not started")}</p>
          {run?.narrative ? <p className="muted">{run.narrative}</p> : null}
        </article>
      </div>

      {run?.pending_action && !playing ? (
        <div className="panel decision">
          <h2>This action is waiting for you</h2>
          <p>{run.pending_action.action_type?.replaceAll("_", " ")} · {run.pending_action.scope}</p>
          <p>{run.pending_action.reason}</p>
          <div className="row">
            <button type="button" onClick={() => onDecide("approve")} disabled={playing}>Approve and continue the run</button>
            <button type="button" onClick={() => onDecide("reject")} disabled={playing}>Reject and continue the run</button>
          </div>
          <p className="muted">Approve, and the rehearsal continues from this moment. Reject, and the move is recorded as not taken. Neither button plugs into a machine in a real building.</p>
        </div>
      ) : null}

      <Comparison run={run} presentation={presentation} onCompare={() => onPlay(run?.story?.id ?? selected, "automated")} playing={playing} />
      
      {/* 4. ROI CALCULATOR WITH INDUSTRY PRESETS & 3-LEAK BREAKDOWN */}
      <ReturnPanel
        token={token}
        run={run}
        live={live}
        presentation={presentation}
        activeRate={activeRate}
        onRateChange={setActiveRate}
      />

      <ol className="tape">
        {frames.slice(-6).map((frame, index) => (
          <li key={`${frame.step}-${index}`}>
            Step {frame.step + 1}: {frame.job_state}, {frame.abstain ? "abstaining" : frame.hypothesis.replaceAll("_", " ")}
            {frame.pending ? ", waiting for a person" : ""}
            {frame.incident_scopes.length ? `, incident scope ${frame.incident_scopes.join(", ")}` : ""}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* =========================================================================
   1. LIVE CAPITAL BURN TICKER COMPONENT
   ========================================================================= */
function BurnTicker({
  live,
  run,
  frames,
  activeRate,
  presentation,
}: {
  live: LiveFrame | undefined;
  run: RunView | null;
  frames: LiveFrame[];
  activeRate: number;
  presentation: boolean;
}) {
  const isStalled = live?.job_state === "stalled";
  const acceleratorsInJob = live?.cluster?.detailed_accelerator_count ?? run?.cluster?.detailed_accelerator_count ?? 8;
  const stepSeconds = live?.step_seconds ?? run?.step_seconds ?? 12;
  const totalSteps = frames.length;
  const totalSeconds = totalSteps * stepSeconds;
  const stalledSteps = frames.filter((f) => f.job_state === "stalled").length;
  const stalledSeconds = stalledSteps * stepSeconds;

  const totalComputeCost = (totalSeconds / 3600) * acceleratorsInJob * activeRate;
  const stallWasteCost = (stalledSeconds / 3600) * acceleratorsInJob * activeRate;
  const fullHallPerHour = (run?.cluster?.accelerator_count ?? 32768) * activeRate;

  if (presentation) {
    return (
      <div className="burn-ticker">
        <div className="ticker-item">
          <span className="ticker-label">Cluster Status</span>
          <span className={`ticker-val ${isStalled ? "val-danger" : "val-ok"}`}>
            {isStalled ? "STALLED (RELAY RACE HALTED)" : live ? "COMPUTING IN LOCKSTEP" : "STANDBY"}
          </span>
        </div>
        <div className="ticker-item">
          <span className="ticker-label">Useful Steps Delivered</span>
          <span className="ticker-val">{live ? live.useful_new.toFixed(1) : "0.0"} steps</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`burn-ticker ${isStalled ? "burn-stalled" : ""}`}>
      <div className="ticker-item">
        <span className="ticker-label">Cluster Operation Status</span>
        <span className={`ticker-val ${isStalled ? "val-danger" : "val-ok"}`}>
          {isStalled ? "⚠️ STALLED: BATON DROPPED" : live ? "✓ ACTIVE PRETRAINING" : "STANDBY"}
        </span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">Total Compute Accrued ({acceleratorsInJob} Placed GPUs)</span>
        <span className="ticker-val">${totalComputeCost.toFixed(2)}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">Idle Stall Waste (Dollars Burned Waiting)</span>
        <span className={`ticker-val ${stallWasteCost > 0 ? "val-danger" : ""}`}>
          ${stallWasteCost.toFixed(2)}
        </span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">Scale Reference (Full 32k Hall Burn Rate)</span>
        <span className="ticker-val">${fullHallPerHour.toLocaleString()}/hr</span>
      </div>
    </div>
  );
}

/* =========================================================================
   2. PHYSICAL FAILURE CASCADE COMPONENT
   ========================================================================= */
function PhysicalCascade({
  live,
  cluster,
  failureLevel,
}: {
  live: LiveFrame | undefined;
  cluster: RunView["cluster"] | undefined;
  failureLevel?: FailureLevel;
}) {
  const faultyGpu = live?.accelerators?.find(
    (a) => !a.functional || a.quarantined || (a.temp !== null && a.temp >= 70)
  );
  const isStalled = live?.job_state === "stalled";
  const faultLevel = faultyGpu
    ? !faultyGpu.functional
      ? "down"
      : faultyGpu.quarantined
      ? "held"
      : "hot"
    : "ok";

  const tier = failureLevel?.tier ?? "Chip Level";
  const isHallOrigin = tier.includes("Datacenter");
  const isRackOrigin = tier.includes("Rack");
  const isNodeOrigin = tier.includes("Node");
  const isSubsystemOrigin = !isHallOrigin && !isRackOrigin && !isNodeOrigin;

  let subsystemTitle = "Accelerator Silicon";
  if (tier.includes("Silicon") || tier.includes("Die")) {
    subsystemTitle = "Silicon Die & Package";
  } else if (tier.includes("Storage") || tier.includes("Fabric")) {
    subsystemTitle = "Storage Fabric";
  } else if (tier.includes("Mesh")) {
    subsystemTitle = "Collective Mesh";
  } else if (tier.includes("Management")) {
    subsystemTitle = "Management Plane";
  } else if (tier.includes("Policy") || tier.includes("Threshold")) {
    subsystemTitle = "Monitoring Policy";
  } else if (tier.includes("Workload")) {
    subsystemTitle = "Compute Workload";
  }

  return (
    <div className="panel cascade-panel">
      <div className="cascade-head">
        <div>
          <span className="eyebrow">Physical Failure Cascade & Hierarchy</span>
          <h2>Where the Fire Started & How It Propagates</h2>
        </div>
        <div className="cascade-badges">
          {failureLevel ? (
            <span className="cascade-tier-badge">
              Origin Tier: <strong>{failureLevel.tier}</strong>
            </span>
          ) : null}
          <div className={`cascade-badge ${isStalled ? "stalled-badge" : "healthy-badge"}`}>
            {isStalled ? "⚠️ ALL-REDUCE BARRIER BLOCKED" : "✓ CLUSTER ADVANCING IN LOCKSTEP"}
          </div>
        </div>
      </div>
      <p className="muted">
        In distributed pretraining, every single chip must complete each calculation beat before any chip moves forward. Watch how an anomaly starting at the <strong>{failureLevel?.tier ?? "component level"}</strong> halts the entire datacenter hall.
      </p>
      <div className="cascade-flow">
        {/* Tier 1: Datacenter Hall */}
        <div className={`cascade-node ${isHallOrigin ? "origin-node" : ""}`}>
          <div className="node-head-row">
            <span className="node-level">Datacenter Hall</span>
            {isHallOrigin ? <span className="origin-badge">ROOT ORIGIN</span> : null}
          </div>
          <strong>{cluster?.accelerator_count ? cluster.accelerator_count.toLocaleString() : "32,768"} GPUs</strong>
          <small>{cluster?.rack_count ?? 256} Racks · 1 Facility Grid</small>
          <div className={`node-status ${isStalled ? "status-stalled" : "status-ok"}`}>
            {isStalled ? "HALTED (WAITING)" : "COMPUTING"}
          </div>
        </div>

        <div className="cascade-arrow">➔</div>

        {/* Tier 2: Rack Level */}
        <div className={`cascade-node ${isRackOrigin ? "origin-node" : ""}`}>
          <div className="node-head-row">
            <span className="node-level">Rack Level</span>
            {isRackOrigin ? <span className="origin-badge">ROOT ORIGIN</span> : null}
          </div>
          <strong>Rack 0</strong>
          <small>{isRackOrigin ? (failureLevel?.component ?? "Rack PDU / Busbar") : "128 GPUs · 16 Hosts · 1 Busbar"}</small>
          <div className={`node-status ${isRackOrigin || faultyGpu ? "status-warn" : "status-ok"}`}>
            {isRackOrigin ? "ELECTRICAL FAULT" : faultyGpu ? "IMPACTED BY FAULT" : "NOMINAL"}
          </div>
        </div>

        <div className="cascade-arrow">➔</div>

        {/* Tier 3: Host Node */}
        <div className={`cascade-node ${isNodeOrigin ? "origin-node" : ""}`}>
          <div className="node-head-row">
            <span className="node-level">Host Node</span>
            {isNodeOrigin ? <span className="origin-badge">ROOT ORIGIN</span> : null}
          </div>
          <strong>Host 0</strong>
          <small>{isNodeOrigin ? (failureLevel?.component ?? "Host Motherboard / OS") : "8 Accelerator Trays · NVLink"}</small>
          <div className={`node-status ${isNodeOrigin || faultyGpu ? "status-warn" : "status-ok"}`}>
            {isNodeOrigin ? "KERNEL/CRASH FAULT" : faultyGpu ? "HOST DEGRADED" : "NOMINAL"}
          </div>
        </div>

        <div className="cascade-arrow">➔</div>

        {/* Tier 4: Subsystem / Component */}
        <div className={`cascade-node culprit-node ${faultLevel} ${isSubsystemOrigin ? "origin-node" : ""}`}>
          <div className="node-head-row">
            <span className="node-level">{subsystemTitle}</span>
            {isSubsystemOrigin ? <span className="origin-badge">ROOT ORIGIN</span> : null}
          </div>
          <strong>{failureLevel?.component ?? (faultyGpu ? faultyGpu.id : "GPU #0")}</strong>
          <small>
            {faultyGpu?.temp !== null && faultyGpu?.temp !== undefined
              ? `${faultyGpu.temp.toFixed(1)}°C`
              : failureLevel?.tier ?? "Nominal"}
          </small>
          <div className="node-status status-culprit">
            {faultyGpu ? (faultyGpu.functional ? "ANOMALY DETECTED" : "HALTED") : "MONITORED"}
          </div>
        </div>
      </div>

      <div className="cascade-blast-explanation">
        <div className="blast-title">
          <strong>💥 Why a {failureLevel?.tier ?? "single-component"} failure halts the entire 32,768-GPU hall:</strong>
        </div>
        <p>
          Distributed LLM pretraining uses synchronous gang scheduling (all-reduce). {failureLevel ? failureLevel.blast_radius : "When one worker drops or stalls, all 32,768 accelerators freeze at the synchronization barrier."}
        </p>
        {failureLevel?.redundancy_strategy ? (
          <div className="cascade-redundancy-box">
            <span className="redundancy-tag">🛡️ Datacenter Redundancy Defense:</span>
            <span>{failureLevel.redundancy_strategy}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================================
   3. OWNER'S SOLUTION PLAYBOOK COMPONENT
   ========================================================================= */
function PlaybookCard({
  playbook,
  failureLevel,
}: {
  playbook: OwnerPlaybook | undefined;
  failureLevel?: FailureLevel;
}) {
  if (!playbook) return null;
  return (
    <div className="panel playbook-card">
      <div className="playbook-head">
        <div>
          <span className="eyebrow">Owner's Architecture Playbook</span>
          <h3>{playbook.title}</h3>
        </div>
        {failureLevel ? (
          <span className="playbook-tier-badge">
            Hierarchy Tier: <strong>{failureLevel.tier}</strong>
          </span>
        ) : null}
      </div>
      <div className="playbook-grid">
        <div className="playbook-col">
          <strong>The Underlying Problem</strong>
          <p>{playbook.problem}</p>
        </div>
        <div className="playbook-col">
          <strong>What to Build in Your Datacenter</strong>
          <p>{playbook.solution}</p>
        </div>
        <div className="playbook-col">
          <strong>Hardware & Telemetry Architecture</strong>
          <p>{playbook.hardware_takeaway}</p>
        </div>
        <div className="playbook-col highlight-col">
          <strong>Business & ROI Impact</strong>
          <p>{playbook.roi_impact}</p>
        </div>
      </div>
      {failureLevel ? (
        <div className="playbook-redundancy-footer">
          <strong>🛡️ Datacenter CapEx & Redundancy Strategy ({failureLevel.tier}):</strong>
          <span> {failureLevel.redundancy_strategy}. Resolves blast radius: <em>{failureLevel.blast_radius}</em>.</span>
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================================
   COMPARISON & 3-LEAK COST BREAKDOWN
   ========================================================================= */
function Comparison({ run, presentation, onCompare, playing }: { run: RunView | null; presentation: boolean; onCompare: () => void; playing: boolean }) {
  const branches = run?.comparison?.branches ?? [];
  if (branches.length === 0) {
    return (
      <div className="panel">
        <h2>Two ways, one breakdown</h2>
        <p>Choose “Compare two ways” to play the same situation twice, like giving two managers the same incident. The difference in finished work is what the return panel can price. The price uses the chips in this job. It does not put a price on every chip in the hall, and it does not put a price on the industry.</p>
        <button type="button" onClick={onCompare} disabled={playing || !run}>Compare two ways on this rehearsal</button>
      </div>
    );
  }
  const max = Math.max(...branches.map((branch) => branch.useful_new), 1);
  const delta = run?.comparison?.delta_second_minus_first?.useful_new;
  return (
    <div className="panel">
      <h2>Two ways, one breakdown</h2>
      <p>These two reactions faced the same scripted problem. The numbers are the score of this rehearsal.</p>
      <div className="compare">
        {branches.map((branch) => (
          <div key={branch.policy}>
            <span>{branch.policy.replaceAll("_", " ")}</span>
            <div className="bar" style={{ width: `${(branch.useful_new / max) * 100}%` }} />
            {presentation ? null : <em>{branch.useful_new.toFixed(2)} useful steps</em>}
          </div>
        ))}
      </div>
      {!presentation && delta !== undefined && delta !== null ? (
        <p>Useful-progress difference, second policy minus first: {delta.toFixed(2)} steps. A negative difference means the second policy preserved less work.</p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   4. RETURN PANEL WITH INDUSTRY PRESETS & 3-LEAK COST BREAKDOWN
   ========================================================================= */
function ReturnPanel({
  token,
  run,
  live,
  presentation,
  activeRate,
  onRateChange,
}: {
  token: string;
  run: RunView | null;
  live: LiveFrame | undefined;
  presentation: boolean;
  activeRate: number;
  onRateChange: (rate: number) => void;
}) {
  const [rate, setRate] = useState(String(activeRate));
  const [currency, setCurrency] = useState("USD");
  const [basis, setBasis] = useState("All-in: power, cooling, space & hardware depreciation");
  const [scope, setScope] = useState("Active frontier pre-training cluster (placed accelerators)");
  const [horizon, setHorizon] = useState("1-year pretraining campaign");
  const [investment, setInvestment] = useState("50000");
  const [extra, setExtra] = useState("5000");
  const [estimate, setEstimate] = useState<EconomicsEstimate | null>(null);
  const [error, setError] = useState("");
  const delta = run?.comparison?.delta_second_minus_first?.useful_new;
  const stepSeconds = run?.step_seconds ?? live?.step_seconds ?? 12;
  const accelerators = run?.cluster?.detailed_accelerator_count ?? live?.cluster?.detailed_accelerator_count ?? 8;

  async function executeEstimate(customConfig?: Record<string, string | number>) {
    if (delta === undefined || delta === null || stepSeconds === undefined || accelerators === undefined) return;
    setError("");
    const config = customConfig ?? {
      gpu_hour_rate: rate,
      currency,
      cost_basis: basis,
      scope,
      horizon,
      investment_cost: investment,
      ...(extra !== "" ? { incremental_cost: extra } : {}),
    };
    try {
      setEstimate(
        await estimateEconomics(token, {
          config,
          useful_delta_steps: delta,
          step_seconds: stepSeconds,
          accelerators_in_job: accelerators,
        })
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The estimate did not run.");
    }
  }

  function applyPreset(preset: (typeof INDUSTRY_PRESETS)[0]) {
    setRate(preset.rate);
    setCurrency(preset.currency);
    setBasis(preset.cost_basis);
    setScope(preset.scope);
    setHorizon(preset.horizon);
    setInvestment(preset.investment);
    setExtra(preset.extra);
    const numRate = parseFloat(preset.rate);
    if (!isNaN(numRate)) onRateChange(numRate);
    if (delta !== undefined && delta !== null) {
      void executeEstimate({
        gpu_hour_rate: preset.rate,
        currency: preset.currency,
        cost_basis: preset.cost_basis,
        scope: preset.scope,
        horizon: preset.horizon,
        investment_cost: preset.investment,
        incremental_cost: preset.extra,
      });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numRate = parseFloat(rate);
    if (!isNaN(numRate)) onRateChange(numRate);
    await executeEstimate();
  }

  const numRate = parseFloat(rate) || activeRate;
  const stallSeconds = run?.metrics?.job_interruption_seconds ?? 0;
  const recompSteps = run?.metrics?.recomputation ?? live?.recomputation ?? 0;
  const stallLossDollar = (stallSeconds / 3600) * accelerators * numRate;
  const recompLossDollar = ((recompSteps * stepSeconds) / 3600) * accelerators * numRate;
  const deltaSteps = delta ?? 0;
  const preservedSavingsDollar = ((Math.max(0, deltaSteps) * stepSeconds) / 3600) * accelerators * numRate;

  return (
    <form className="panel roi" onSubmit={submit}>
      <h2>What the saved work is worth in dollars</h2>
      <p>
        In synchronous training, stopping one chip halts the entire choir. Choose a pre-loaded industry benchmark profile below, or enter your own facility numbers:
      </p>

      {/* PRESETS BUTTONS */}
      <div className="presets-bar">
        <span className="presets-label">1-Click Industry Benchmark Profiles:</span>
        <div className="presets-buttons">
          {INDUSTRY_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className="preset-btn"
              onClick={() => applyPreset(p)}
              title={p.desc}
            >
              <strong>{p.name}</strong>
              <small>${p.rate}/GPU-hr</small>
            </button>
          ))}
        </div>
      </div>

      <div className="roi-grid">
        <label>
          Accelerator-hour rate
          <input
            name="gpu_hour_rate"
            inputMode="decimal"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              const n = parseFloat(e.target.value);
              if (!isNaN(n)) onRateChange(n);
            }}
            autoComplete="off"
          />
        </label>
        <label>Currency<input name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} autoComplete="off" /></label>
        <label>What the rate includes<input name="cost_basis" value={basis} onChange={(e) => setBasis(e.target.value)} autoComplete="off" /></label>
        <label>What this estimate covers<input name="scope" value={scope} onChange={(e) => setScope(e.target.value)} autoComplete="off" /></label>
        <label>Horizon<input name="horizon" value={horizon} onChange={(e) => setHorizon(e.target.value)} autoComplete="off" /></label>
        <label>Investment cost<input name="investment_cost" inputMode="decimal" value={investment} onChange={(e) => setInvestment(e.target.value)} autoComplete="off" /></label>
        <label>Operating cost beyond investment<input name="incremental_cost" inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} autoComplete="off" /></label>
      </div>

      <button type="submit" disabled={delta === undefined || delta === null}>
        Estimate ROI from this comparison
      </button>

      {delta === undefined || delta === null ? (
        <p className="muted">
          💡 <strong>Tip:</strong> Run <em>“Compare two ways”</em> above to produce the side-by-side delta. The presets will then immediately calculate your net dollar savings.
        </p>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}
      {estimate ? <EstimateView estimate={estimate} presentation={presentation} /> : null}

      {/* 3 LEAKS COST BREAKDOWN CARD */}
      {!presentation && (
        <div className="three-leaks-breakdown">
          <h3>The Three Operational Leaks Breakdown</h3>
          <div className="leaks-grid">
            <div className="leak-box leak-stall">
              <span className="leak-title">1. The Stall Leak</span>
              <strong className="leak-amount">${stallLossDollar.toFixed(2)}</strong>
              <small>{stallSeconds} seconds of idle cluster wait</small>
            </div>
            <div className="leak-box leak-unsaved">
              <span className="leak-title">2. Unsaved Work Leak</span>
              <strong className="leak-amount">${recompLossDollar.toFixed(2)}</strong>
              <small>{recompSteps.toFixed(1)} steps forced to recompute</small>
            </div>
            <div className="leak-box leak-savings">
              <span className="leak-title">3. Net Preserved Savings</span>
              <strong className="leak-amount">+${preservedSavingsDollar.toFixed(2)}</strong>
              <small>{Math.max(0, deltaSteps).toFixed(1)} useful steps preserved</small>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function EstimateView({ estimate, presentation }: { estimate: EconomicsEstimate; presentation: boolean }) {
  const reason = REASONS[estimate.reason] ?? estimate.reason.replaceAll("_", " ");
  return (
    <div className="estimate" role="status">
      <p><strong>{estimate.label ?? "No currency figure"}</strong></p>
      <p>{reason}</p>
      {estimate.useful_delta_gpu_hours !== undefined ? (
        <p>Useful-work difference expressed as accelerator-hours: <strong>{estimate.useful_delta_gpu_hours.toFixed(4)} GPU-hrs</strong>. Formula: {estimate.conversion}.</p>
      ) : null}
      {estimate.missing?.length ? <p>Still empty: {estimate.missing.join(", ").replaceAll("_", " ")}.</p> : null}
      {!presentation && estimate.roi !== null && estimate.benefit !== undefined && estimate.net_benefit !== null ? (
        <div className="estimate-highlight">
          <p>Gross Benefit: <strong>${estimate.benefit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Net Financial Return: <strong>${estimate.net_benefit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Estimated ROI: <strong>{(estimate.roi * 100).toFixed(1)}%</strong> of investment</p>
        </div>
      ) : null}
      {presentation && estimate.roi !== null ? <p>A return figure was computed from your inputs. Switch off presentation mode to read the figure.</p> : null}
    </div>
  );
}

function checkpointLine(live: LiveFrame | undefined, run: RunView | null) {
  const verified = run?.checkpoints?.some((item) => item.state === "verified_usable");
  if (live?.checkpoint) {
    const item = live.checkpoint;
    return `${item.state.replaceAll("_", " ")} at progress ${item.progress}. Shards ${item.shards_present}/${item.shards_expected}.`;
  }
  if (verified) return "A complete save is on the record.";
  return "No complete save yet. Anything since the last complete save is what you would have to do again.";
}

function tone(gpu: { functional: boolean; quarantined: boolean; temp: number | null }) {
  if (!gpu.functional) return "down";
  if (gpu.quarantined) return "held";
  if (gpu.temp !== null && gpu.temp >= 75) return "hot";
  if (gpu.temp !== null && gpu.temp >= 62) return "warm";
  return "cool";
}

function cellTitle(gpu: { id: string; temp: number | null; functional: boolean; quarantined: boolean }, presentation: boolean) {
  const state = !gpu.functional ? "not functional" : gpu.quarantined ? "quarantined" : "in the job";
  if (presentation || gpu.temp === null) return `${gpu.id}, ${state}`;
  return `${gpu.id}, ${gpu.temp.toFixed(1)} C, ${state}`;
}
