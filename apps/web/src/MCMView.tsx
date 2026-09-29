import { useState } from "react";
import { RunView } from "./api";

type MCMComponent = "interposer" | "die0" | "die1" | "hbm" | "microbumps";

interface TestPhase {
  phase: number;
  name: string;
  standard: string;
  duration: string;
  objective: string;
  status: "pending" | "running" | "passed" | "failed" | "repaired";
}

const INITIAL_PHASES: TestPhase[] = [
  {
    phase: 1,
    name: "Cold Boundary Scan",
    standard: "IEEE 1149.1 / IEEE 1838 (3D-IC)",
    duration: "2 sec",
    objective: "Verify power rails, C4 solder balls, and microbump open/short circuits prior to high-power boot.",
    status: "pending",
  },
  {
    phase: 2,
    name: "D2D Link Margin & Microbump Scan",
    standard: "UCIe 1.5 / NV-HBI PHY Margin",
    duration: "8 sec",
    objective: "Scan eye-diagram voltage margins across 10,240 interposer microbumps connecting Die 0 and Die 1.",
    status: "pending",
  },
  {
    phase: 3,
    name: "HBM3e Memory BIST & BISR",
    standard: "JEDEC JESD238 / Built-In Self-Repair",
    duration: "15 sec",
    objective: "Run pseudo-random algorithmic memory patterns across 8 HBM3e stacks; remap spare redundant columns.",
    status: "pending",
  },
  {
    phase: 4,
    name: "Dynamic Thermal Shock & di/dt Droop",
    standard: "High-Power Synthetic GEMM Pulse",
    duration: "30 sec",
    objective: "Cycle package from 35°C to 82°C at 400W/cm² to test thermal expansion mismatch (CTE) and substrate warpage.",
    status: "pending",
  },
  {
    phase: 5,
    name: "Mission-Mode LLM Canary Matrix",
    standard: "FP8 / BF16 Synchronous All-Reduce",
    duration: "60 sec",
    objective: "Execute multi-head attention kernels to certify zero silent data corruption (SDC) before cluster enrollment.",
    status: "pending",
  },
];

export function MCMView({
  run,
  presentation,
}: {
  run: RunView | null;
  presentation: boolean;
}) {
  const totalGpus = run?.cluster?.accelerator_count ?? 32768;

  // Visual component inspection state
  const [selectedComp, setSelectedComp] = useState<MCMComponent>("interposer");

  // Sequencer interactive state
  const [phases, setPhases] = useState<TestPhase[]>(INITIAL_PHASES);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [faultInjected, setFaultInjected] = useState<boolean>(true);
  const [sequencerStatus, setSequencerStatus] = useState<"idle" | "running" | "fault" | "repaired" | "certified">("idle");
  const [logs, setLogs] = useState<string[]>([
    "MCM Diagnostics Daemon initialized on Host BMC.",
    "Awaiting test trigger for Accelerator MCM #0412 (Dual Compute Die + 8x HBM3e).",
  ]);

  // Executive ROI calculator states
  const [packageCost, setPackageCost] = useState<number>(28000);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(1200);
  const [defectRatePct, setDefectRatePct] = useState<number>(3.5);
  const [testerRateHourly, setTesterRateHourly] = useState<number>(450);

  // Economic math
  const monthlyDefectivePackages = (monthlyVolume * defectRatePct) / 100;
  // 45% of packaging defects are repairable via D2D spare lane BISR or HBM redundancy
  const monthlyRepairedPackages = Math.round(monthlyDefectivePackages * 0.45);
  const monthlyScrapSavings = monthlyRepairedPackages * packageCost;
  const annualScrapSavings = monthlyScrapSavings * 12;

  // Tester capacity savings: fail-fast stops dead modules in 2 min instead of 45 min
  const failFastHoursSavedPerMonth = Math.round((monthlyDefectivePackages * 0.55 * (43 / 60)));
  const monthlyTesterSavings = failFastHoursSavedPerMonth * testerRateHourly;

  // Run the automated test sequence
  const runSequence = () => {
    setIsRunning(true);
    setSequencerStatus("running");
    setActiveStep(1);
    setLogs([
      "▶ STARTING AUTOMATED TEST SEQUENCE [MCM-SN-88219-XCD]...",
      "Phase 1: Cold Boundary Scan initiated (IEEE 1838 JTAG tap active).",
    ]);

    // Simulate Phase 1
    setTimeout(() => {
      setPhases((prev) =>
        prev.map((p) => (p.phase === 1 ? { ...p, status: "passed" } : p))
      );
      setLogs((l) => [
        ...l,
        "✓ Phase 1 Passed: 4,096 C4 substrate bumps OK. Power rails nominal (0.85V VDD).",
        "Phase 2: D2D Link Margin Scan initiated across 10,240 interposer microbumps...",
      ]);
      setActiveStep(2);

      // Simulate Phase 2 (Branch on injected fault)
      setTimeout(() => {
        if (faultInjected) {
          setPhases((prev) =>
            prev.map((p) => (p.phase === 2 ? { ...p, status: "repaired" } : p))
          );
          setSequencerStatus("repaired");
          setLogs((l) => [
            ...l,
            "⚠️ ANOMALY in Phase 2: D2D Interposer Lane D2D_TX_14 contact resistance = 5.8Ω (Threshold 1.2Ω).",
            "🔍 DIAGNOSIS: Thermal expansion microbump fracture on silicon bridge between Die 0 and Die 1.",
            "⚡ ENGAGING BUILT-IN SELF-REPAIR (BISR): Rerouting transmission to redundant spare lane D2D_SPARE_02...",
            "✓ BISR SUCCESS: Redundant microbump engaged. Eye-diagram height restored to 125mV (BER < 10^-15).",
            "Phase 3: HBM3e Memory BIST initiated across Stacks 0-7...",
          ]);
          setActiveStep(3);
        } else {
          setPhases((prev) =>
            prev.map((p) => (p.phase === 2 ? { ...p, status: "passed" } : p))
          );
          setLogs((l) => [
            ...l,
            "✓ Phase 2 Passed: All 10,240 microbumps nominal. D2D bandwidth verified at 10.0 TB/s.",
            "Phase 3: HBM3e Memory BIST initiated across Stacks 0-7...",
          ]);
          setActiveStep(3);
        }

        // Simulate Phase 3
        setTimeout(() => {
          setPhases((prev) =>
            prev.map((p) => (p.phase === 3 ? { ...p, status: "passed" } : p))
          );
          setLogs((l) => [
            ...l,
            "✓ Phase 3 Passed: 192GB HBM3e memory retention validated. Zero uncorrectable DBE errors.",
            "Phase 4: Dynamic Thermal Shock & di/dt Droop initiated (400W pulse)...",
          ]);
          setActiveStep(4);

          // Simulate Phase 4
          setTimeout(() => {
            setPhases((prev) =>
              prev.map((p) => (p.phase === 4 ? { ...p, status: "passed" } : p))
            );
            setLogs((l) => [
              ...l,
              "✓ Phase 4 Passed: Package thermal gradient < 4.2°C across dies. No microbump CTE delamination under 82°C peak.",
              "Phase 5: Mission-Mode LLM GEMM Canary Matrix Validation initiated...",
            ]);
            setActiveStep(5);

            // Simulate Phase 5
            setTimeout(() => {
              setPhases((prev) =>
                prev.map((p) => (p.phase === 5 ? { ...p, status: "passed" } : p))
              );
              setIsRunning(false);
              setSequencerStatus("certified");
              setLogs((l) => [
                ...l,
                "✓ Phase 5 Passed: Multi-head attention FP8 all-reduce verified. Exact mathematical checksum match.",
                "🎉 CERTIFICATION COMPLETE: Module certified as Known Good Assembly (KGA) in 45.2 seconds.",
                faultInjected
                  ? "💰 OUTCOME: Module repaired in-field via BISR spare microbump remapping. $28,000 package saved from scrap!"
                  : "💰 OUTCOME: Clean bill of health certified for 32k GPU frontier cluster.",
              ]);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1200);
    }, 900);
  };

  const resetSequence = () => {
    setIsRunning(false);
    setActiveStep(0);
    setSequencerStatus("idle");
    setPhases(INITIAL_PHASES);
    setLogs(["Sequencer reset. Awaiting trigger."]);
  };

  return (
    <section className="mcm-section">
      <div className="mcm-header">
        <span className="eyebrow">
          {presentation ? "Executive Packaging & Test" : "2.5D/3D Chiplet Diagnostics & Self-Repair"}
        </span>
        <h1>Multi-Chip Module (MCM) Packaging & Automated Test Sequencing</h1>
        <p className="lede">
          At frontier scale, accelerators are no longer monolithic dies. Each processor is a <strong>Multi-Chip Module (MCM)</strong> bundling dual compute chiplets, up to 12 HBM3e memory stacks, and over 10,000 microscopic solder microbumps across a silicon interposer.
          Under 80°C thermal expansion, microbumps crack and die-to-die links degrade.
          Automated test sequencing runs a 5-phase diagnostic ladder in <strong>45 seconds</strong>, catches microbump faults before they crash 32k-GPU training, and dynamically remaps traffic to redundant spare lanes via <strong>Built-In Self-Repair (BISR)</strong>—saving $28,000 assemblies from scrap.
        </p>
      </div>

      {/* 4 HIGH-IMPACT EXECUTIVE KPI CARDS */}
      <div className="mcm-kpi-grid">
        <div className="mcm-kpi-card kpi-ok">
          <span className="kpi-label">MCM Packaging Assembly Yield</span>
          <div className="kpi-val">99.82% Healthy Packages</div>
          <p className="kpi-desc">
            Across {totalGpus.toLocaleString()} modules, 18 microbump links are operating on redundant spare lines via in-situ self-repair.
          </p>
          <div className="kpi-highlight">Zero Unplanned Cluster Drops</div>
        </div>

        <div className="mcm-kpi-card kpi-info">
          <span className="kpi-label">Automated Sequencing Speedup</span>
          <div className="kpi-val">45.2s In-Situ vs. 4.5h Manual</div>
          <p className="kpi-desc">
            Replaces multi-hour human node triage and swap cycles with a deterministic 5-phase hardware diagnostic ladder.
          </p>
          <div className="kpi-highlight">99.7% Reduction in Diagnostic MTTR</div>
        </div>

        <div className="mcm-kpi-card kpi-ok">
          <span className="kpi-label">Built-In Self-Repair (BISR) Value</span>
          <div className="kpi-val">${(monthlyRepairedPackages * packageCost).toLocaleString()} / month Saved</div>
          <p className="kpi-desc">
            Remapping fractured D2D microbumps to redundant on-interposer spare wires prevents scrapping full dual-die + HBM assemblies.
          </p>
          <div className="kpi-highlight">Saves ~{monthlyRepairedPackages} Ultra-High-End Superchips/Month</div>
        </div>

        <div className="mcm-kpi-card kpi-warn">
          <span className="kpi-label">Adaptive Fail-Fast Tester Savings</span>
          <div className="kpi-val">{failFastHoursSavedPerMonth} ATE Tester Hours / mo</div>
          <p className="kpi-desc">
            Terminating fatal defects in Phase 1 (2s) instead of running full 45-minute thermal burn-ins frees critical OSAT factory capacity.
          </p>
          <div className="kpi-highlight">${(monthlyTesterSavings).toLocaleString()} / month Direct ATE Savings</div>
        </div>
      </div>

      {/* MCM PHYSICAL ARCHITECTURE VISUALIZER */}
      <div className="panel mcm-arch-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Physical Hardware Co-Design</span>
            <h2>Multi-Chip Module (MCM) 2.5D Packaging Architecture</h2>
          </div>
          <div className="mcm-tag-row">
            <span className="mcm-pill">CoWoS-S / EMIB Interposer</span>
            <span className="mcm-pill">35μm Microbump Pitch</span>
            <span className="mcm-pill">10 TB/s D2D Bandwidth</span>
          </div>
        </div>
        <p className="muted">
          Click any component on the multi-chip package to inspect its thermal profile, physical microbump count, and automated test coverage:
        </p>

        <div className="mcm-interactive-stage">
          {/* Top HBM Stacks */}
          <div className="hbm-row">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`mcm-chiplet hbm-chiplet ${selectedComp === "hbm" ? "selected" : ""}`}
                onClick={() => setSelectedComp("hbm")}
              >
                <span>HBM3e #{idx}</span>
                <small>24GB · 8-Hi TSV</small>
              </div>
            ))}
          </div>

          {/* Middle: Compute Dies & Interposer Bridge */}
          <div className="compute-middle-row">
            <div
              className={`mcm-chiplet compute-chiplet ${selectedComp === "die0" ? "selected" : ""}`}
              onClick={() => setSelectedComp("die0")}
            >
              <div className="chiplet-badge">Primary Logic</div>
              <strong>Compute Die 0</strong>
              <small>72 Billion Transistors · 68°C</small>
              <span className="chiplet-sub">TSMC 3nm FinFET</span>
            </div>

            {/* Die-to-Die Interposer Bus */}
            <div
              className={`mcm-interposer-bridge ${selectedComp === "interposer" || selectedComp === "microbumps" ? "selected" : ""}`}
              onClick={() => setSelectedComp("interposer")}
            >
              <span className="bridge-title">2.5D Silicon Interposer (UCIe / NV-HBI)</span>
              <div className="microbump-lane-preview">
                <span className="lane-count">10,240 Microbumps</span>
                <span className="spare-count">128 Redundant Spares</span>
              </div>
              <div className="d2d-speed">10.0 TB/s D2D Bus · &lt; 0.5pJ/bit</div>
            </div>

            <div
              className={`mcm-chiplet compute-chiplet ${selectedComp === "die1" ? "selected" : ""}`}
              onClick={() => setSelectedComp("die1")}
            >
              <div className="chiplet-badge">Secondary Logic</div>
              <strong>Compute Die 1</strong>
              <small>72 Billion Transistors · 71°C</small>
              <span className="chiplet-sub">TSMC 3nm FinFET</span>
            </div>
          </div>

          {/* Bottom HBM Stacks */}
          <div className="hbm-row">
            {[4, 5, 6, 7].map((idx) => (
              <div
                key={idx}
                className={`mcm-chiplet hbm-chiplet ${selectedComp === "hbm" ? "selected" : ""}`}
                onClick={() => setSelectedComp("hbm")}
              >
                <span>HBM3e #{idx}</span>
                <small>24GB · 8-Hi TSV</small>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Component Detail Inspector */}
        <div className="mcm-component-detail">
          {selectedComp === "interposer" && (
            <div className="detail-box">
              <h3>Silicon Interposer & Die-to-Die (D2D) PHY Interconnect</h3>
              <p>
                The passive silicon interposer routes 10,240 microscopic copper microbumps at a 35-micron pitch between Compute Die 0 and Compute Die 1.
                This provides 10.0 TB/s of bi-directional memory-coherent bandwidth, making the dual dies behave as a single giant GPU to software.
              </p>
              <div className="detail-metrics">
                <div><span>Microbump Array:</span> <strong>10,240 Active + 128 Spare</strong></div>
                <div><span>Pitch:</span> <strong>35 μm Pitch</strong></div>
                <div><span>Contact Resistance:</span> <strong>0.82 Ω nominal</strong></div>
                <div><span>Self-Repair Support:</span> <strong>Hardware Lane Remapping (BISR)</strong></div>
              </div>
            </div>
          )}
          {(selectedComp === "die0" || selectedComp === "die1") && (
            <div className="detail-box">
              <h3>Compute Logic Chiplet ({selectedComp === "die0" ? "Die 0" : "Die 1"})</h3>
              <p>
                Houses the Tensor Cores, Matrix Engines, and L2 Cache. Operates at 850mV active VDD. Per-die thermal diodes report real-time junction temperature.
              </p>
              <div className="detail-metrics">
                <div><span>Transistor Count:</span> <strong>72 Billion</strong></div>
                <div><span>Process Node:</span> <strong>TSMC 3nm</strong></div>
                <div><span>Operating Temp:</span> <strong>{selectedComp === "die0" ? "68°C" : "71°C"}</strong></div>
                <div><span>Test Coverage:</span> <strong>Full Scan Chain & Logic BIST</strong></div>
              </div>
            </div>
          )}
          {selectedComp === "hbm" && (
            <div className="detail-box">
              <h3>High Bandwidth Memory (HBM3e) Subsystem</h3>
              <p>
                8 stacks of 24GB HBM3e (192GB total) connected via Through-Silicon Vias (TSVs). Provides 8.0 TB/s aggregate memory bandwidth.
              </p>
              <div className="detail-metrics">
                <div><span>Total Capacity:</span> <strong>192 GB (8 x 24GB)</strong></div>
                <div><span>TSV Count:</span> <strong>&gt; 8,000 TSVs per stack</strong></div>
                <div><span>Memory Clock:</span> <strong>9.6 Gbps per pin</strong></div>
                <div><span>Self-Repair:</span> <strong>Post-Package Soft & Hard Row Remapping</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE 5-PHASE AUTOMATED TEST SEQUENCER */}
      <div className="panel mcm-sequencer-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">In-Situ Diagnostic Automation</span>
            <h2>Automated 5-Phase Diagnostic Sequencer with Built-In Self-Repair</h2>
          </div>
          <div className="sequencer-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={faultInjected}
                onChange={(e) => setFaultInjected(e.target.checked)}
                disabled={isRunning}
              />
              Inject Thermally Degraded Microbump (Lane D2D_TX_14)
            </label>
            <button
              className="run-seq-btn"
              onClick={runSequence}
              disabled={isRunning}
            >
              {isRunning ? "Sequencing in Progress..." : "▶ Run Automated Test Sequence"}
            </button>
            <button
              className="reset-seq-btn"
              onClick={resetSequence}
              disabled={isRunning}
            >
              Reset
            </button>
          </div>
        </div>
        <p className="muted">
          Watch the automated ladder execute. When a thermally fractured microbump is detected in Phase 2, the sequencer halts link degradation and commands the on-die hardware register to remap the signal to an on-package spare microbump in under 50 milliseconds.
        </p>

        {/* Phase Ladder Cards */}
        <div className="phase-ladder-grid">
          {phases.map((p) => {
            const isCurrent = activeStep === p.phase && isRunning;
            return (
              <div
                key={p.phase}
                className={`phase-card status-${p.status} ${isCurrent ? "phase-active" : ""}`}
              >
                <div className="phase-card-top">
                  <span className="phase-num">Phase {p.phase}</span>
                  <span className={`phase-badge badge-${p.status}`}>{p.status.toUpperCase()}</span>
                </div>
                <h4>{p.name}</h4>
                <div className="phase-meta">
                  <span>Standard: {p.standard}</span>
                  <span>Duration: {p.duration}</span>
                </div>
                <p className="phase-obj">{p.objective}</p>
              </div>
            );
          })}
        </div>

        {/* Real-time Diagnostics Terminal */}
        <div className="mcm-terminal">
          <div className="terminal-header">
            <span>BMC In-Situ Hardware Diagnostics Console</span>
            <span className={`status-indicator status-${sequencerStatus}`}>
              {sequencerStatus.toUpperCase()}
            </span>
          </div>
          <pre className="terminal-body">
            {logs.map((line, i) => (
              <div key={i} className={`terminal-line ${line.includes("⚠️") ? "log-warn" : line.includes("✓") || line.includes("🎉") ? "log-ok" : line.includes("⚡") ? "log-repair" : ""}`}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* EXECUTIVE SCRAP & TESTER SAVINGS CALCULATOR */}
      <div className="panel mcm-calc-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Manufacturing & Fleet Economics</span>
            <h2>MCM Scrap Prevention & ATE Tester Capacity ROI Calculator</h2>
          </div>
        </div>
        <p className="muted">
          Calculate the concrete financial value of Built-In Self-Repair (BISR) microbump remapping and adaptive fail-fast tester scheduling:
        </p>

        <div className="mcm-calc-inputs">
          <label>
            Packaged MCM Value ($)
            <input
              type="number"
              value={packageCost}
              onChange={(e) => setPackageCost(Number(e.target.value))}
              min={5000}
              step={1000}
            />
          </label>
          <label>
            Monthly Assemblies Tested
            <input
              type="number"
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              min={100}
              step={100}
            />
          </label>
          <label>
            Packaging Defect Rate (%)
            <input
              type="number"
              value={defectRatePct}
              onChange={(e) => setDefectRatePct(Number(e.target.value))}
              min={0.5}
              max={20}
              step={0.5}
            />
          </label>
          <label>
            ATE Tester Cost ($/Hour)
            <input
              type="number"
              value={testerRateHourly}
              onChange={(e) => setTesterRateHourly(Number(e.target.value))}
              min={100}
              step={50}
            />
          </label>
        </div>

        <div className="mcm-calc-results">
          <div className="mcm-result-box result-highlight">
            <span>Monthly Scrap Avoidance</span>
            <strong>${monthlyScrapSavings.toLocaleString()} / mo</strong>
            <small>~{monthlyRepairedPackages} packages saved via D2D spare lane BISR</small>
          </div>
          <div className="mcm-result-box result-highlight">
            <span>Annual Hardware Savings</span>
            <strong>${annualScrapSavings.toLocaleString()} / year</strong>
            <small>Eliminates discarding good dies and HBM memory</small>
          </div>
          <div className="mcm-result-box result-info">
            <span>ATE Tester Hours Saved</span>
            <strong>{failFastHoursSavedPerMonth} hours / mo</strong>
            <small>Phase 1 fail-fast terminates unrepairable units in 2s</small>
          </div>
          <div className="mcm-result-box result-info">
            <span>Tester Capacity Value</span>
            <strong>${monthlyTesterSavings.toLocaleString()} / mo</strong>
            <small>Direct equipment cost recovery at ${testerRateHourly}/hr</small>
          </div>
        </div>

        <div className="mcm-takeaway">
          <strong>💡 Executive Packaging Takeaway:</strong> In advanced 2.5D/3D semiconductor packaging, the assembly is worth 50x more than individual raw silicon dies. Mandating redundant D2D microbumps and automated test sequencing saves over <strong>${annualScrapSavings.toLocaleString()} annually</strong> in scrapped hardware while protecting 32k-GPU training runs from intermittent interposer crashes.
        </div>
      </div>
    </section>
  );
}
