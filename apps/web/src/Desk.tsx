import storyNotes from "../../../content/owner-journey.json";
import { ScenarioNotes } from "./ScenarioNotes";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FailureLevel,
  LiveFrame,
  OwnerPlaybook,
  RunView,
  StoryItem,
  stories,
} from "./api";
import { FinancialIllustration, RehearsalEvidence } from "./OwnerRooms";
import { EXECUTIVE_QUESTIONS } from "./ExecutivePortfolioView";

const HIGHLIGHTED_SCENARIOS = [
  "gradual_warning",
  "abrupt_failure",
  "power_cliff",
  "wafer_lot_contagion",
  "fractured_microbump",
  "innocent_chip_dying_board",
  "rack_thermal_shadow",
  "cold_plate_torque_fracture",
  "silent_subthreshold_cliff",
  "silent_straggler",
  "revolving_door",
  "healthy_workload_shift",
];

export function Desk({
  token,
  run,
  frames,
  playing,
  onPlay,
  onDecide,
}: {
  token: string;
  run: RunView | null;
  frames: LiveFrame[];
  playing: boolean;
  onPlay: (id: string, mode: "manual" | "automated", variant?: string) => void;
  onDecide: (decision: "approve" | "reject") => void;
}) {
  const location = useLocation();
  const requestedScenario = new URLSearchParams(location.search).get("scenario");
  const [items, setItems] = useState<StoryItem[]>([]);
  const [mode, setMode] = useState<"manual" | "automated">("manual");
  const [selected, setSelected] = useState("gradual_warning");
  const [variant, setVariant] = useState("standard");
  const requestedVariant = new URLSearchParams(location.search).get("variant");
  useEffect(() => { setVariant(requestedVariant === "challenge" && storyNotes.characters.find((c) => c.id === selected)?.challenge ? "challenge" : "standard"); }, [selected, requestedVariant]);
  const [activeTab, setActiveTab] = useState<"arena" | "battle" | "roi" | "cascade">("arena");

  useEffect(() => {
    if (requestedScenario && items.some((item) => item.id === requestedScenario)) setSelected(requestedScenario);
  }, [requestedScenario, items]);

  const live = frames[frames.length - 1];
  const cluster = live?.cluster ?? run?.cluster;
  const placed = (live?.accelerators ?? []).filter((item) => !item.spare);
  const maxUseful = Math.max(...frames.map((frame) => frame.useful_new), 1);
  const currentStory = items.find((item) => item.id === selected) ?? (run?.story as StoryItem | undefined);
  const currentQA = EXECUTIVE_QUESTIONS.find((q) => q.id === selected);

  useEffect(() => {
    stories(token)
      .then((payload) => setItems(payload.stories))
      .catch(() => setItems([]));
  }, [token]);

  const hasPendingAction = Boolean(run?.pending_action && !playing);
  const hasBattleResults = Boolean(run?.comparison?.branches && run.comparison.branches.length > 0);

  return (
    <section className="desk">
      <ScenarioNotes id={selected} variant={variant} onVariant={setVariant} disabled={playing} />
      <RehearsalEvidence run={run} frames={frames} />
      {/* Top Header & Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          🎮 Practice Floor: Detailed Synthetic Job Rehearsals
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <NavLink
            to="/fleet"
            className="hero-secondary-btn"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#60a5fa", borderColor: "rgba(96, 165, 250, 0.4)" }}
          >
            🌐 Global Fleet
          </NavLink>
          <NavLink
            to="/planner"
            className="hero-secondary-btn"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#34d399", borderColor: "rgba(52, 211, 153, 0.4)" }}
          >
            🏗️ DC Planner
          </NavLink>
          <NavLink
            to="/grid"
            className="hero-secondary-btn"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}
          >
            ⚡ Utility Grid & PPA
          </NavLink>
          <NavLink
            to="/dispatch"
            className="hero-secondary-btn"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.4)" }}
          >
            🔧 Boots-on-Ground Dispatch
          </NavLink>
          <NavLink
            to="/"
            className="hero-secondary-btn"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none" }}
          >
            🌟 Switch to Executive Portfolio & Q&A
          </NavLink>
        </div>
      </div>

      <h1>When one machine stops, the whole job waits.</h1>
      <p className="lede">
        Think of a relay team that cannot advance until every assigned runner finishes. A slow runner delays progress; a failed runner can stop it. Practice different synthetic incidents and compare how much new work each strategy preserves. The detailed job is separate from the larger counted inventory.
      </p>

      {/* 4 Inner Tabs for Layman Business Owners */}
      <div className="desk-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "arena"}
          className={`desk-tab-btn ${activeTab === "arena" ? "active" : ""}`}
          onClick={() => setActiveTab("arena")}
        >
          🎮 Silicon Arena & Console
          {hasPendingAction ? <span className="desk-tab-badge">🚨 Action Waiting!</span> : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "battle"}
          className={`desk-tab-btn ${activeTab === "battle" ? "active" : ""}`}
          onClick={() => setActiveTab("battle")}
        >
          ⚔️ Head-to-Head Battle (Two Strategies)
          {hasBattleResults ? <span className="desk-tab-badge" style={{ background: "rgba(52, 211, 153, 0.2)", color: "#34d399", borderColor: "#34d399" }}>✓ Duel Ready</span> : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "roi"}
          className={`desk-tab-btn ${activeTab === "roi" ? "active" : ""}`}
          onClick={() => setActiveTab("roi")}
        >
          📊 Financial ROI & Leak Calculator
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cascade"}
          className={`desk-tab-btn ${activeTab === "cascade" ? "active" : ""}`}
          onClick={() => setActiveTab("cascade")}
        >
          🛡️ Hardware Diagnostics & Cascade
        </button>
      </div>

      {/* TAB 1: SILICON ARENA & MISSION CONTROL CONSOLE */}
      {activeTab === "arena" ? (
        <div>
          {/* 1. LIVE CAPITAL BURN TICKER */}
          <BurnTicker live={live} run={run} frames={frames} />

          {/* 2. THE 32,768-RUNNER RELAY TRACK */}
          <RelayTrack live={live} frames={frames} />

          {/* 3. TACTICAL COMMANDER'S DECISION ALERT (High-priority interactive pop when pending) */}
          {hasPendingAction && run?.pending_action ? (
            <CommanderAlert
              action={run.pending_action}
              onApprove={() => onDecide("approve")}
              onReject={() => onDecide("reject")}
              playing={playing}
            />
          ) : null}

          {/* 4. MISSION CONTROL GAME DECK: SCENARIO LAB */}
          <div className="game-control-deck">
            <div>
              <span className="deck-section-title">
                <span>🎯 Step 1: Select Crisis Scenario to Test & Simulate</span>
              </span>
              <p className="muted" style={{ margin: "0.35rem 0 0.85rem", fontSize: "0.85rem" }}>
                Choose a character to explore its synthetic behavior in the detailed assigned job:
              </p>
              <div className="incident-cards-grid">
                {HIGHLIGHTED_SCENARIOS.map((scenarioId) => {
                  const qa = EXECUTIVE_QUESTIONS.find((q) => q.id === scenarioId);
                  const story = items.find((i) => i.id === scenarioId);
                  const isSelected = selected === scenarioId;
                  const icon = qa?.analogyIcon ?? "⚡";
                  const title = story?.title ?? qa?.analogyTitle ?? scenarioId;
                  const analogySnippet = qa?.analogyTitle ?? story?.summary ?? "";

                  return (
                    <button
                      key={scenarioId}
                      type="button"
                      className={`incident-card-btn ${isSelected ? "active" : ""}`}
                      onClick={() => setSelected(scenarioId)}
                      disabled={playing}
                    >
                      <div className="incident-card-top">
                        <span className="incident-icon">{icon}</span>
                        <span className="incident-title">{title}</span>
                      </div>
                      <span className="incident-analogy-snippet">{analogySnippet}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown for All 17+ Scenarios */}
              <div style={{ marginTop: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 600 }}>
                  Or browse full catalog:
                </span>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  disabled={playing || items.length === 0}
                  style={{ maxWidth: "340px", fontSize: "0.85rem", padding: "0.35rem 0.6rem" }}
                >
                  {items.length === 0 ? <option value="gradual_warning">Loading stories from engine…</option> : null}
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Story Analogy & Summary Box */}
            <div className="selected-story-detail">
              <div className="selected-story-detail-head">
                <strong style={{ fontSize: "0.95rem" }}>
                  {currentStory?.title ?? currentQA?.question ?? selected}
                </strong>
                {currentQA ? (
                  <span className="selected-story-analogy-badge">
                    {currentQA.analogyIcon} {currentQA.categoryLabel}: {currentQA.analogyTitle}
                  </span>
                ) : null}
              </div>
              <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.45, color: "var(--text)" }}>
                {currentQA?.plainEnglish ?? currentStory?.summary ?? "Select a crisis scenario to observe its ripple effect across the cluster."}
              </p>
              {currentQA?.financialImpact ? (
                <div style={{ fontSize: "0.82rem", color: "var(--ok)", fontWeight: 600 }}>
                  Owner lesson: {currentQA.financialImpact}
                </div>
              ) : null}
            </div>

            {/* Strategy Selection & Launch Button Row */}
            <div className="deck-row-controls">
              <div>
                <span className="deck-section-title" style={{ marginBottom: "0.4rem" }}>
                  <span>🛡️ Step 2: Choose Defense Strategy</span>
                </span>
                <div className="game-mode-toggle">
                  <button
                    type="button"
                    className={`mode-toggle-btn ${mode === "manual" ? "active" : ""}`}
                    onClick={() => setMode("manual")}
                    disabled={playing}
                  >
                    🎮 Interactive Command (You Decide)
                  </button>
                  <button
                    type="button"
                    className={`mode-toggle-btn ${mode === "automated" ? "active" : ""}`}
                    onClick={() => setMode("automated")}
                    disabled={playing}
                  >
                    ⚔️ Head-to-Head Duel (Compare Two Ways)
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="game-launch-btn"
                  onClick={() => onPlay(selected, mode, variant)}
                  disabled={playing}
                >
                  {playing ? (
                    <>
                      <span className="arena-led" style={{ width: 10, height: 10, background: "#38bdf8" }} />
                      Simulating 32,768-Chip Hall...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> SIMULATE SCENARIO NOW
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 5. LIVING SILICON ARENA FLOOR */}
          <div className="hall-wrap">
            <div className="arena-section-head">
              <div>
                <h2>Living Silicon Arena: Placed Accelerators in This Rehearsal Job</h2>
                <p>
                  {live
                    ? `Step ${live.step + 1} of ${live.steps}. Cluster Job Status: ${live.job_state.toUpperCase()}. ${
                        live.abstain
                          ? "Telemetry readings are insufficient to name a root cause (Abstaining safely)."
                          : `Active Diagnostics: ${live.hypothesis.replaceAll("_", " ")}.`
                      }`
                    : "Rehearsal standing by. Launch a scenario above to watch chips compute."}
                </p>
              </div>
            </div>

            <div className="arena-floor" role="img" aria-label="Placed accelerators in the simulated job">
              {placed.length === 0 ? (
                <p className="muted" style={{ gridColumn: "1 / -1", padding: "1.2rem", textAlign: "center" }}>
                  Waiting for the first rehearsal step. Click <strong>"🚀 SIMULATE SCENARIO NOW"</strong> above to begin!
                </p>
              ) : (
                placed.map((gpu) => {
                  const gpuTone = tone(gpu);
                  const devNum = gpu.id.includes("-d") ? gpu.id.split("-d")[1] : gpu.id.split("-").slice(-1)[0].replace("d", "");
                  return (
                    <div key={gpu.id} className={`arena-cell ${gpuTone}`} title={cellTitle(gpu)}>
                      <div className="arena-cell-top">
                        <span>Chip #{devNum} <small style={{ opacity: 0.75, fontSize: "0.7rem", fontWeight: 500 }}>(Slot d{devNum})</small></span>
                        <span className="arena-led" />
                      </div>
                      <div className="arena-cell-temp">
                        {gpu.temp === null ? "N/A" : `${gpu.temp.toFixed(0)}°C`}
                      </div>
                      <div className="arena-cell-status">
                        {!gpu.functional
                          ? "OFFLINE"
                          : gpu.quarantined
                          ? "QUARANTINED"
                          : gpu.temp !== null && gpu.temp >= 75
                          ? "CRITICAL HOT"
                          : gpu.temp !== null && gpu.temp >= 62
                          ? "WARMING"
                          : "COMPUTING"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="quiescent">
              <span />
              <p>
                {cluster
                  ? `${cluster.quiescent_accelerator_count.toLocaleString()} other chips in the same hall: ${cluster.rack_count.toLocaleString()} racks, ${cluster.host_count.toLocaleString()} machines, ${cluster.fabric_domain_count} network spines. Counted like inventory boxes in a massive warehouse; all waiting in lockstep for this job's sync barrier.`
                  : "Other inventory is counted separately. The live arena shows only the detailed assigned job and its synthetic observations."}
              </p>
            </div>

            <div className="spark" aria-label="Useful progress across the steps computed so far">
              {frames.slice(-48).map((frame, index) => (
                <i
                  key={`${frame.step}-${index}`}
                  style={{ height: `${Math.max(8, (frame.useful_new / maxUseful) * 100)}%` }}
                  title={`Step ${frame.step + 1}: useful ${frame.useful_new.toFixed(2)}`}
                />
              ))}
            </div>
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.4rem" }}>
              Progress bars show actual useful math completed so far. In a traditional uncoordinated crash, these bars wipe out back to the last complete save.
            </p>
          </div>

          {/* 6. CURRENT JOB STATE CARDS */}
          <div className="grid" style={{ marginTop: "1rem" }}>
            <article className="card">
              <h2>Current Job Activity</h2>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", textTransform: "capitalize", margin: "0.2rem 0" }}>
                {live?.job_state ?? Object.values(run?.jobs ?? {})[0]?.state ?? "Waiting to start"}
              </p>
              {live ? (
                <p className="muted">
                  Useful new progress: <strong>{live.useful_new.toFixed(2)} steps</strong>. Forced recomputation: <strong>{live.recomputation.toFixed(2)} steps</strong>.
                </p>
              ) : (
                <p className="muted">Launch a scenario above to observe live job computation.</p>
              )}
            </article>
            <article className="card">
              <h2>Last Verified Save</h2>
              <p style={{ margin: "0.2rem 0" }}>{checkpointLine(live, run)}</p>
              <p className="muted">
                A half-finished save cannot be reopened. The only defended progress is the last verified save file.
              </p>
            </article>
            <article className="card">
              <h2>Simulation Command State</h2>
              <p style={{ fontWeight: 700, margin: "0.2rem 0" }}>
                {run?.pending_action
                  ? "🚨 Awaiting Commander Decision (See Alert Box Above)"
                  : run?.status ?? (playing ? "Stepping Rehearsal..." : "Rehearsal Ready")}
              </p>
              {run?.narrative ? <p className="muted">{run.narrative}</p> : null}
            </article>
          </div>

          {/* 7. COLLAPSIBLE ACTIVITY TAPE */}
          <details style={{ marginTop: "1.25rem", border: "1px solid var(--line)", borderRadius: "10px", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", color: "var(--muted)" }}>
              📋 Rehearsal Telemetry Tape Log ({frames.length} steps recorded)
            </summary>
            <ol className="tape" style={{ marginTop: "0.75rem" }}>
              {frames.slice(-8).map((frame, index) => (
                <li key={`${frame.step}-${index}`}>
                  Step {frame.step + 1}: {frame.job_state}, {frame.abstain ? "abstaining (insufficient fresh telemetry)" : frame.hypothesis.replaceAll("_", " ")}
                  {frame.pending ? " : [Paused for Commander Decision]" : ""}
                  {frame.incident_scopes.length ? ` · Incident Scopes: ${frame.incident_scopes.join(", ")}` : ""}
                </li>
              ))}
            </ol>
          </details>
        </div>
      ) : null}

      {/* TAB 2: HEAD-TO-HEAD BATTLE (TWO WAYS, ONE BREAKDOWN) */}
      {activeTab === "battle" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Comparison run={run} onCompare={() => onPlay(selected, "automated", variant)} playing={playing} />
        </div>
      ) : null}

      {/* TAB 3: FINANCIAL ROI & LEAK CALCULATOR */}
      {activeTab === "roi" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <FinancialIllustration />
        </div>
      ) : null}

      {/* TAB 4: HARDWARE DIAGNOSTICS & CASCADE */}
      {activeTab === "cascade" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="panel" style={{ borderLeft: "4px solid #e2c07a" }}>
            <span className="eyebrow">🛡️ Hardware Diagnostics & Root-Cause Blast Radius</span>
            <h2>Physical Cascade: How a Component Glitch Can Halt Its Assigned Job</h2>
            <p className="muted" style={{ lineHeight: 1.5, margin: "0.3rem 0 0" }}>
              In distributed AI training, every single chip must finish calculating each step before any chip can advance. Watch below how a tiny microscopic flaw, whether a cracked micro-wire or pinched coolant hose, ripples outward through the host, rack, and facility grid.
            </p>
          </div>

          <PhysicalCascade live={live} cluster={cluster} failureLevel={currentStory?.failure_level} />

          {currentStory?.failure_level ? (
            <div className="failure-hierarchy-banner">
              <div className="fh-badge-row">
                <span className="fh-pill tier-pill">
                  Hierarchy Tier: <strong>{currentStory.failure_level.tier}</strong>
                </span>
                <span className="fh-pill comp-pill">
                  Scenario component: <strong>{currentStory.failure_level.component}</strong>
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

          <PlaybookCard playbook={currentStory?.owner_playbook} failureLevel={currentStory?.failure_level} />

          <div className="problems" style={{ marginTop: "0.5rem" }}>
            <article>
              <h2>The Stall Leak</h2>
              <p>A failed assigned rank can stall its synchronous job. Other jobs have separate membership. The electric and cooling meters keep spinning while the building waits.</p>
            </article>
            <article>
              <h2>The Unsaved Work Leak</h2>
              <p>Math that lives only in chip memory is lost the moment a node crashes. The gap since the last complete save is what you must pay to recompute.</p>
            </article>
            <article>
              <h2>The False Alarm Leak</h2>
              <p>Chips naturally run hotter during heavy math bursts. Naive static rules that shut down healthy working machines waste more money than the crashes they prevent.</p>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* =========================================================================
   1. LIVE CAPITAL BURN TICKER COMPONENT
   ========================================================================= */
function BurnTicker({ live, run, frames }: { live: LiveFrame | undefined; run: RunView | null; frames: LiveFrame[] }) {
  const jobSize=live?.cluster?.detailed_accelerator_count ?? run?.cluster?.detailed_accelerator_count;
  const stalledSeconds=frames.filter((f)=>f.job_state==="stalled").reduce((n,f)=>n+f.step_seconds,0);
  return <div className="burn-ticker"><div className="ticker-item"><span className="ticker-label">Detailed job state</span><span className="ticker-val">{live?.job_state ?? "Standby"}</span></div><div className="ticker-item"><span className="ticker-label">Detailed accelerators</span><span className="ticker-val">{jobSize ?? "Unknown"}</span></div><div className="ticker-item"><span className="ticker-label">Observed stalled time</span><span className="ticker-val">{stalledSeconds} simulation seconds</span></div><div className="ticker-item"><span className="ticker-label">Financial value</span><span className="ticker-val">Requires your assumptions</span></div></div>;
}

/* =========================================================================
   2. RELAY TRACK COMPONENT
   ========================================================================= */
function RelayTrack({ live, frames }: { live: LiveFrame | undefined; frames: LiveFrame[] }) {
  const isStalled = live?.job_state === "stalled";
  const currentStep = live ? live.step + 1 : 0;
  const totalSteps = live?.steps ?? frames[0]?.steps ?? 10;
  const progressPct = Math.min(100, Math.round((currentStep / Math.max(totalSteps, 1)) * 100));

  return (
    <div className="relay-track-container">
      <div className="relay-track-header">
        <div>
          <strong style={{ fontSize: "0.95rem" }}>
            {isStalled
              ? "🚨 BATON DROPPED: Sync barrier stalled: all assigned ranks waiting"
              : live
              ? "🏃 Detailed Job Runners Synchronized · Advancing with Baton"
              : "🏃 Detailed Job Relay Race Standing By"}
          </strong>
          <span style={{ marginLeft: "0.6rem", color: "var(--muted)", fontSize: "0.82rem" }}>
            {live ? `Step ${currentStep} of ${totalSteps} (${progressPct}%)` : "Ready to launch"}
          </span>
        </div>
        <span style={{ fontSize: "0.82rem", color: isStalled ? "#ef4444" : "#34d399", fontWeight: 700 }}>
          {isStalled ? "⚠️ ALL RUNNERS FROZEN" : live ? "✓ LOCKSTEP SYNC NOMINAL" : "STANDBY"}
        </span>
      </div>
      <div className="relay-track-bar">
        <div
          className={`relay-progress-fill ${isStalled ? "fill-stalled" : ""}`}
          style={{ width: `${Math.max(5, progressPct)}%` }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)" }}>
        <span>Start: Initial Training Weight Shards</span>
        <span>
          {live
            ? `Useful Work Completed: ${live.useful_new.toFixed(2)} steps · Recomputed: ${live.recomputation.toFixed(2)} steps`
            : "No active rehearsal"}
        </span>
        <span>Goal: Sync Step {totalSteps}</span>
      </div>
    </div>
  );
}

/* =========================================================================
   3. TACTICAL COMMANDER DECISION ALERT
   ========================================================================= */
function CommanderAlert({
  action,
  onApprove,
  onReject,
  playing,
}: {
  action: NonNullable<RunView["pending_action"]>;
  onApprove: () => void;
  onReject: () => void;
  playing: boolean;
}) {
  return (
    <div className="commander-alert">
      <div className="commander-alert-header">
        <span>🚨</span>
        <span>Tactical Commander Decision Required</span>
      </div>
      <h2 className="commander-question">
        Preemptive Micro-Save: Isolate Warning Node & Protect In-Flight Work?
      </h2>
      <div style={{ fontSize: "0.9rem", color: "var(--text)" }}>
        <strong>Proposed Action:</strong>{" "}
        <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
          {action.action_type?.replaceAll("_", " ")} on {action.scope}
        </code>
      </div>
      <div className="commander-analogy-callout">
        <strong>🚗 Real-World Analogy:</strong> Your car engine's heat gauge is climbing into the red zone on the highway.
        You can either pull over into the service bay for a 12-second oil top-up (Approve), or keep driving until the engine explodes and strands all 32,768 passengers (Reject).
      </div>
      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text)" }}>
        <strong>Hardware Reason:</strong> {action.reason}
      </p>
      <div className="commander-actions-row">
        <button
          type="button"
          className="cmd-btn-approve"
          onClick={onApprove}
          disabled={playing}
        >
          🟢 APPROVE PREEMPTIVE MICRO-SAVE (Save 12 Seconds, Protect $115k/hr Run)
        </button>
        <button
          type="button"
          className="cmd-btn-reject"
          onClick={onReject}
          disabled={playing}
        >
          🔴 REJECT (Let Dumb Runbook Crash Job & Recompute from Zero)
        </button>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: "0.78rem" }}>
        Safe sandbox rehearsal: no real hardware is impacted. Test what happens with each choice!
      </p>
    </div>
  );
}

/* =========================================================================
   4. PHYSICAL FAILURE CASCADE COMPONENT
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
  return <section className="panel cascade-panel"><h2>The component, the shared dependency, and the job</h2><p>The scenario names a possible origin. Its observations support an investigation; they do not prove a physical diagnosis. Only the detailed assigned ranks are instrumented in this rehearsal.</p><div className="cascade-flow"><article className="cascade-node"><h3>Counted inventory</h3><strong>{cluster?.accelerator_count?.toLocaleString() ?? "Unknown"} accelerators</strong><p>Other inventory is counted separately; its individual state is not traced.</p></article><article className="cascade-node"><h3>Detailed assigned job</h3><strong>{cluster?.detailed_accelerator_count ?? "Unknown"} accelerators</strong><p>Current state: {live?.job_state ?? "No frame available"}. A required rank can delay or halt this job.</p></article><article className="cascade-node"><h3>Scenario component</h3><strong>{failureLevel?.component ?? "Unknown"}</strong><p>{failureLevel?.blast_radius ?? "Select a rehearsal to inspect the clue."}</p></article></div><p><strong>Owner lesson:</strong> {failureLevel?.redundancy_strategy ?? "Inspect shared dependencies, save usability, and recovery capability."}</p></section>;
}

/* =========================================================================
   5. OWNER'S SOLUTION PLAYBOOK COMPONENT
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
          <strong>The lesson to carry forward</strong>
          <p>{playbook.solution}</p>
        </div>
        <div className="playbook-col">
          <strong>Question for your team</strong>
          <p>{playbook.hardware_takeaway}</p>
        </div>
        <div className="playbook-col highlight-col">
          <strong>Owner decision</strong>
          <p>{playbook.roi_impact}</p>
        </div>
      </div>
      {failureLevel ? (
        <div className="playbook-redundancy-footer">
          <strong>🛡️ Datacenter CapEx & Redundancy Strategy ({failureLevel.tier}):</strong>
          <span> {failureLevel.redundancy_strategy}. Observed clue: <em>{failureLevel.blast_radius}</em>.</span>
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================================
   6. COMPARISON (TWO WAYS, ONE BREAKDOWN)
   ========================================================================= */
function Comparison({ run, onCompare, playing }: { run: RunView | null; onCompare: () => void; playing: boolean }) {
  const branches = run?.comparison?.branches ?? [];
  if (branches.length === 0) {
    return (
      <div className="panel">
        <h2>Two ways, one breakdown</h2>
        <p>Choose “Compare two ways” to play the same situation twice, like giving two managers the same incident. The difference in finished work is what the return panel can price. The price uses the chips in this job. It does not put a price on every chip in the hall, and it does not put a price on the industry.</p>
        <button type="button" onClick={onCompare} disabled={playing || !run}>
          Compare two ways on this rehearsal
        </button>
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
            <em>{branch.useful_new.toFixed(2)} useful steps</em>
          </div>
        ))}
      </div>
      {delta !== undefined && delta !== null ? (
        <p>Useful-progress difference, second policy minus first: {delta.toFixed(2)} steps. A negative difference means the second policy preserved less work.</p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   7. RETURN PANEL WITH INDUSTRY PRESETS & 3-LEAK COST BREAKDOWN
   ========================================================================= */
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

function cellTitle(gpu: { id: string; temp: number | null; functional: boolean; quarantined: boolean }) {
  const state = !gpu.functional ? "not functional (offline)" : gpu.quarantined ? "quarantined" : "computing in the job";
  const devNum = gpu.id.includes("-d") ? gpu.id.split("-d")[1] : gpu.id.split("-").slice(-1)[0].replace("d", "");
  const tempStr = gpu.temp === null ? "no temperature reading" : `${gpu.temp.toFixed(1)}°C`;
  return `Chip #${devNum} (Physical Slot d${devNum} in Rack 0, Host Server 0) · Temp: ${tempStr} · State: ${state}`;
}

