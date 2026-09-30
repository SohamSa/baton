import { FormEvent, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  EconomicsEstimate,
  FailureLevel,
  LiveFrame,
  OwnerPlaybook,
  RunView,
  StoryItem,
  estimateEconomics,
  stories,
} from "./api";
import { EXECUTIVE_QUESTIONS } from "./ExecutivePortfolioView";

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
  onPlay: (id: string, mode: "manual" | "automated") => void;
  onDecide: (decision: "approve" | "reject") => void;
}) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [mode, setMode] = useState<"manual" | "automated">("manual");
  const [selected, setSelected] = useState("gradual_warning");
  const [activeRate, setActiveRate] = useState<number>(3.5);
  const [activeTab, setActiveTab] = useState<"arena" | "battle" | "roi" | "cascade">("arena");

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
      {/* Top Header & Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          🎮 Practice Floor: 32,768-Chip Datacenter Crisis Simulator
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
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
        Think of a relay race where 32,768 athletes must hand off a fragile glass baton at the exact same millisecond. If one runner trips, overheats, or drops the baton, every single runner in the building must freeze in place while the electric meter burns $114,688 every hour.
        Test and try permutations of real-world datacenter crises below to practice how automated micro-saves protect millions of dollars in compute capital.
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
          <BurnTicker live={live} run={run} frames={frames} activeRate={activeRate} />

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
                Click any crisis card below to test how different physical failures impact your 32,768-chip datacenter cluster:
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
                  💰 Financial Exposure: {currentQA.financialImpact}
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
                  onClick={() => onPlay(selected, mode)}
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
                        {gpu.temp === null ? "—" : `${gpu.temp.toFixed(0)}°C`}
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
                  ? `${cluster.quiescent_accelerator_count.toLocaleString()} other chips in the same hall — ${cluster.rack_count.toLocaleString()} racks, ${cluster.host_count.toLocaleString()} machines, ${cluster.fabric_domain_count} network spines. Counted like inventory boxes in a massive warehouse; all waiting in lockstep for this job's sync barrier.`
                  : "The rest of the 32,768-chip hall is counted in lockstep. This rehearsal demonstrates the exact blast radius when one chip encounters trouble."}
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
                  {frame.pending ? " — [Paused for Commander Decision]" : ""}
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
          <div className="panel" style={{ borderLeft: "4px solid #38bdf8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
              <div>
                <span className="eyebrow">⚔️ Strategy Duel Benchmark</span>
                <h2>The Tale of Two Managers: Smart Micro-Save vs Traditional Crash</h2>
              </div>
              <button
                type="button"
                className="game-launch-btn"
                onClick={() => onPlay(run?.story?.id ?? selected, "automated")}
                disabled={playing}
                style={{ fontSize: "0.88rem", padding: "0.6rem 1.2rem" }}
              >
                {playing ? "⏳ Simulating Duel..." : "⚔️ Run Strategy Duel Now"}
              </button>
            </div>
            <p className="muted" style={{ lineHeight: 1.5, fontSize: "0.92rem", margin: 0 }}>
              <strong>The Business Owner's Dilemma:</strong> What happens when two different datacenter operations teams face the exact same physical crisis?
              <strong> Strategy A (Smart Preemptive Micro-Save)</strong> detects the anomaly early and saves work in 12 seconds before cordoning the node.
              <strong> Strategy B (Traditional Dumb Runbook)</strong> waits until the chip crashes, stalling all 32,768 accelerators and losing up to 45 minutes of training math.
            </p>
          </div>

          <Comparison
            run={run}
            onCompare={() => onPlay(run?.story?.id ?? selected, "automated")}
            playing={playing}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--panel)", borderRadius: "10px", border: "1px solid var(--line)" }}>
            <div>
              <strong>Ready to price the difference in dollars?</strong>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                Switch to the Financial ROI Calculator tab to see the exact cash return using industry presets.
              </p>
            </div>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => setActiveTab("roi")}
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.95rem" }}
            >
              ➔ Go to Financial ROI Tab
            </button>
          </div>
        </div>
      ) : null}

      {/* TAB 3: FINANCIAL ROI & LEAK CALCULATOR */}
      {activeTab === "roi" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="panel" style={{ borderLeft: "4px solid #34d399" }}>
            <span className="eyebrow">📊 Financial Return On Investment</span>
            <h2>Convert Saved Compute Steps into Cold, Hard Dollars</h2>
            <p className="muted" style={{ lineHeight: 1.5, margin: "0.3rem 0 0" }}>
              Every second a 32,768-GPU cluster sits idle at a sync barrier costs real cash in utility power, cooling towers, and facility depreciation ($114,688/hr). Calculate your net financial savings below using 1-click industry benchmark profiles or your own facility rates.
            </p>
          </div>

          <ReturnPanel
            token={token}
            run={run}
            live={live}
            activeRate={activeRate}
            onRateChange={setActiveRate}
          />
        </div>
      ) : null}

      {/* TAB 4: HARDWARE DIAGNOSTICS & CASCADE */}
      {activeTab === "cascade" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="panel" style={{ borderLeft: "4px solid #e2c07a" }}>
            <span className="eyebrow">🛡️ Hardware Diagnostics & Root-Cause Blast Radius</span>
            <h2>Physical Cascade: How a Component Glitch Halts All 32,768 Chips</h2>
            <p className="muted" style={{ lineHeight: 1.5, margin: "0.3rem 0 0" }}>
              In distributed AI training, every single chip must finish calculating each step before any chip can advance. Watch below how a tiny microscopic flaw—whether a cracked micro-wire or pinched coolant hose—ripples outward through the host, rack, and facility grid.
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

          <PlaybookCard playbook={currentStory?.owner_playbook} failureLevel={currentStory?.failure_level} />

          <div className="problems" style={{ marginTop: "0.5rem" }}>
            <article>
              <h2>The Stall Leak</h2>
              <p>One chip in the job stops, and the whole 32k cluster stops with it. The electric and cooling meters keep spinning while the building waits.</p>
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
function BurnTicker({
  live,
  run,
  frames,
  activeRate,
}: {
  live: LiveFrame | undefined;
  run: RunView | null;
  frames: LiveFrame[];
  activeRate: number;
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

  return (
    <div className={`burn-ticker ${isStalled ? "burn-stalled" : ""}`}>
      <div className="ticker-item">
        <span className="ticker-label">Cluster Operation Status</span>
        <span className={`ticker-val ${isStalled ? "val-danger" : "val-ok"}`}>
          {isStalled ? "⚠️ STALLED: BATON DROPPED (ALL CHIPS WAITING)" : live ? "✓ ACTIVE TRAINING (SINGING IN HARMONY)" : "STANDBY"}
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
              ? "🚨 BATON DROPPED: Sync barrier stalled — all 32,768 chips waiting"
              : live
              ? "🏃 32,768 Runners Synchronized · Advancing with Baton"
              : "🏃 32,768-Chip Relay Race Standing By"}
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
        Safe sandbox rehearsal — no real hardware is impacted. Test what happens with each choice!
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
  const isHallOrigin = tier.includes("Datacenter") || tier.includes("Facility") || tier.includes("Substation");
  const isRackOrigin = tier.includes("Rack");
  const isNodeOrigin = tier.includes("Node");
  const isSubsystemOrigin = !isHallOrigin && !isRackOrigin && !isNodeOrigin;

  let subsystemTitle = "Accelerator Silicon";
  if (tier.includes("Silicon Physics") || tier.includes("AI Telemetry") || tier.includes("Sub-Threshold")) {
    subsystemTitle = "Silicon Physics & AI Telemetry";
  } else if (tier.includes("Integration") || tier.includes("Assembly") || tier.includes("ODM")) {
    subsystemTitle = "ODM Assembly & Integration";
  } else if (tier.includes("Cooling Loop") || tier.includes("Manifold") || tier.includes("Rack Scale")) {
    subsystemTitle = "Rack Manifold & Busbar";
  } else if (tier.includes("Power") || tier.includes("Substation")) {
    subsystemTitle = "Substation Power Feed";
  } else if (tier.includes("Baseboard") || tier.includes("Motherboard")) {
    subsystemTitle = "Baseboard & VRM Power Delivery";
  } else if (tier.includes("Foundry") || tier.includes("Lineage") || tier.includes("Wafer")) {
    subsystemTitle = "Wafer Lot & Lineage Origin";
  } else if (tier.includes("MCM") || tier.includes("Packaging")) {
    subsystemTitle = "MCM & Interposer Assembly";
  } else if (tier.includes("Test") || tier.includes("Qualification")) {
    subsystemTitle = "Canary Test Gate";
  } else if (tier.includes("Silicon") || tier.includes("Die")) {
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
            {isStalled ? "⚠️ ALL 32,768 CHIPS FROZEN WAITING AT SYNC BARRIER" : "✓ ALL 32,768 CHIPS ADVANCING IN HARMONY"}
          </div>
        </div>
      </div>
      <p className="muted">
        In synchronized AI training, every single chip must complete each calculation step together before any chip moves forward. Watch how an anomaly starting at the <strong>{failureLevel?.tier ?? "component level"}</strong> halts the entire datacenter hall.
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
          Distributed AI training works like a giant synchronized choir or relay race: every single chip must finish singing its verse together before anyone can move to the next measure. {failureLevel ? failureLevel.blast_radius : "When one worker drops or stalls, all 32,768 accelerators freeze in place while the electric meter keeps spinning."}
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
function ReturnPanel({
  token,
  run,
  live,
  activeRate,
  onRateChange,
}: {
  token: string;
  run: RunView | null;
  live: LiveFrame | undefined;
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
          💡 <strong>Tip:</strong> Run <em>“Compare two ways”</em> in the Head-to-Head Battle tab to produce the side-by-side delta. The presets will then immediately calculate your net dollar savings.
        </p>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}
      {estimate ? <EstimateView estimate={estimate} /> : null}

      {/* 3 LEAKS COST BREAKDOWN CARD */}
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
    </form>
  );
}

function EstimateView({ estimate }: { estimate: EconomicsEstimate }) {
  const reason = REASONS[estimate.reason] ?? estimate.reason.replaceAll("_", " ");
  return (
    <div className="estimate" role="status">
      <p><strong>{estimate.label ?? "No currency figure"}</strong></p>
      <p>{reason}</p>
      {estimate.useful_delta_gpu_hours !== undefined ? (
        <p>Useful-work difference expressed as accelerator-hours: <strong>{estimate.useful_delta_gpu_hours.toFixed(4)} GPU-hrs</strong>. Formula: {estimate.conversion}.</p>
      ) : null}
      {estimate.missing?.length ? <p>Still empty: {estimate.missing.join(", ").replaceAll("_", " ")}.</p> : null}
      {estimate.roi !== null && estimate.benefit !== undefined && estimate.net_benefit !== null ? (
        <div className="estimate-highlight">
          <p>Gross Benefit: <strong>${estimate.benefit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Net Financial Return: <strong>${estimate.net_benefit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          <p>Estimated ROI: <strong>{(estimate.roi * 100).toFixed(1)}%</strong> of investment</p>
        </div>
      ) : null}
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

function cellTitle(gpu: { id: string; temp: number | null; functional: boolean; quarantined: boolean }) {
  const state = !gpu.functional ? "not functional (offline)" : gpu.quarantined ? "quarantined" : "computing in the job";
  const devNum = gpu.id.includes("-d") ? gpu.id.split("-d")[1] : gpu.id.split("-").slice(-1)[0].replace("d", "");
  const tempStr = gpu.temp === null ? "no temperature reading" : `${gpu.temp.toFixed(1)}°C`;
  return `Chip #${devNum} (Physical Slot d${devNum} in Rack 0, Host Server 0) · Temp: ${tempStr} · State: ${state}`;
}
