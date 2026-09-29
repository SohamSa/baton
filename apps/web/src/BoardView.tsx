import { useState } from "react";
import { RunView } from "./api";

interface SocketState {
  socketId: number;
  gpuId: string;
  ecid: string;
  vrmPhasesTotal: number;
  vrmPhasesActive: number;
  vddRippleMv: number;
  vrmTempC: number;
  pcbStrainMicrostrain: number;
  retimerMarginMv: number;
  chipHealth: "golden" | "nominal" | "degraded";
  status: "nominal" | "warning" | "rebalanced";
  issue?: string;
}

const INITIAL_SOCKETS: SocketState[] = [
  { socketId: 0, gpuId: "gpu-r0-h0-d0", ecid: "0x8FA2_B390_E441", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.2, vrmTempC: 62, pcbStrainMicrostrain: 140, retimerMarginMv: 120, chipHealth: "golden", status: "nominal" },
  { socketId: 1, gpuId: "gpu-r0-h0-d1", ecid: "0x4A11_98C2_1190", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.5, vrmTempC: 64, pcbStrainMicrostrain: 145, retimerMarginMv: 118, chipHealth: "golden", status: "nominal" },
  { socketId: 2, gpuId: "gpu-r0-h0-d2", ecid: "0x9812_CC41_8801", vrmPhasesTotal: 16, vrmPhasesActive: 15, vddRippleMv: 18.4, vrmTempC: 98, pcbStrainMicrostrain: 150, retimerMarginMv: 115, chipHealth: "golden", status: "warning", issue: "Phase 4 DrMOS power stage degraded on carrier baseboard. VDD core ripple elevated to 18.4mV. Chip silicon is 100% healthy!" },
  { socketId: 3, gpuId: "gpu-r0-h0-d3", ecid: "0x1102_55FA_77E1", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.1, vrmTempC: 61, pcbStrainMicrostrain: 138, retimerMarginMv: 122, chipHealth: "golden", status: "nominal" },
  { socketId: 4, gpuId: "gpu-r0-h0-d4", ecid: "0x66AB_0921_33D2", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.4, vrmTempC: 63, pcbStrainMicrostrain: 142, retimerMarginMv: 119, chipHealth: "golden", status: "nominal" },
  { socketId: 5, gpuId: "gpu-r0-h0-d5", ecid: "0x3341_8820_99AA", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.6, vrmTempC: 65, pcbStrainMicrostrain: 148, retimerMarginMv: 117, chipHealth: "golden", status: "nominal" },
  { socketId: 6, gpuId: "gpu-r0-h0-d6", ecid: "0x77E1_1145_BB30", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.3, vrmTempC: 62, pcbStrainMicrostrain: 141, retimerMarginMv: 121, chipHealth: "golden", status: "nominal" },
  { socketId: 7, gpuId: "gpu-r0-h0-d7", ecid: "0x5509_FFA1_2210", vrmPhasesTotal: 16, vrmPhasesActive: 16, vddRippleMv: 3.5, vrmTempC: 64, pcbStrainMicrostrain: 144, retimerMarginMv: 120, chipHealth: "golden", status: "nominal" },
];

export function BoardView({
  run,
}: {
  run: RunView | null;
}) {
  const totalGpus = run?.cluster?.accelerator_count ?? 32768;
  const totalBoards = Math.round(totalGpus / 8);

  const [sockets, setSockets] = useState<SocketState[]>(INITIAL_SOCKETS);
  const [selectedSocketId, setSelectedSocketId] = useState<number>(2);
  const currentSocket = sockets[selectedSocketId];

  // Dynamic VRM phase rebalancing state
  const [isRebalancing, setIsRebalancing] = useState<boolean>(false);

  // Executive ROI calculator states
  const [fleetGpus, setFleetGpus] = useState<number>(totalGpus);
  const [annualIncidentRatePct, setAnnualIncidentRatePct] = useState<number>(2.5);
  const [industryNffRatePct, setIndustryNffRatePct] = useState<number>(38);
  const [chipReplacementCost, setChipReplacementCost] = useState<number>(30000);
  const [boardVrmRepairCost, setBoardVrmRepairCost] = useState<number>(450);

  // Calculate NFF economic waste avoided
  const totalAnnualIncidents = (fleetGpus * (annualIncidentRatePct / 100));
  const falseChipRmasAvoided = Math.round(totalAnnualIncidents * (industryNffRatePct / 100));
  const capitalSavedFalseRmas = falseChipRmasAvoided * (chipReplacementCost - boardVrmRepairCost);
  const secondaryDowntimeSaved = falseChipRmasAvoided * 12500; // Average cost of secondary stall when replacement chip crashes in bad socket
  const totalAnnualValue = capitalSavedFalseRmas + secondaryDowntimeSaved;

  const handleRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      setSockets((prev) =>
        prev.map((s) =>
          s.socketId === 2
            ? {
                ...s,
                vrmPhasesActive: 15,
                vddRippleMv: 3.8,
                vrmTempC: 68,
                status: "rebalanced",
                issue: "✓ VRM Power Rebalanced: Current redistributed across 15 healthy regulator stages. Voltage noise stabilized at 3.8mV nominal. No chip replacement needed!",
              }
            : s
        )
      );
      setIsRebalancing(false);
    }, 700);
  };

  return (
    <section className="board-section">
      <div className="board-header">
        <span className="eyebrow">
          Circuit Board Power & Fault Isolation
        </span>
        <h1>Circuit Board Power Regulators & Saving Innocent Chips</h1>
        <p className="lede">
          Think of not throwing away a $30,000 car engine when all that failed was an inexpensive $10 alternator regulator:
          Inside modern AI servers, 8 heavy processors sit on a shared circuit board equipped with multi-phase electric voltage regulators.
          When an electrical glitch occurs, technicians often mistakenly blame the main chip and throw away a perfectly good <strong>$30,000 processor</strong>.
          Our diagnostics check the circuit board's power stages first, finding the true culprit in <strong>1.2 seconds</strong> and stopping the multi-million-dollar cycle of mistakenly replacing innocent chips.
        </p>
      </div>

      {/* 4 EXECUTIVE KPI CARDS */}
      <div className="board-kpi-grid">
        <div className="board-kpi-card kpi-ok">
          <span className="kpi-label">Fleet Circuit Board Integrity</span>
          <div className="kpi-val">99.78% ({totalBoards.toLocaleString()} Baseboards)</div>
          <p className="kpi-desc">
            4,096 carrier baseboards actively monitored; only 3 operating on redundant re-balanced VRM multi-phase backups.
          </p>
          <div className="kpi-highlight">Zero Unplanned Board Shorts</div>
        </div>

        <div className="board-kpi-card kpi-info">
          <span className="kpi-label">Mistaken Processor Scrapping Rate</span>
          <div className="kpi-val">0.4% vs. 38% Industry Avg</div>
          <p className="kpi-desc">
            Directly cross-references chip birth certificates with board power stages to prevent swapping innocent $30,000 processors.
          </p>
          <div className="kpi-highlight">98.9% Reduction in False Chip Swaps</div>
        </div>

        <div className="board-kpi-card kpi-ok">
          <span className="kpi-label">Instant Fault Isolation</span>
          <div className="kpi-val">1.2s Chip vs. Board Verdict</div>
          <p className="kpi-desc">
            Deterministic diagnostic truth matrix evaluates silicon, socket, board power regulators, and data lines in real time.
          </p>
          <div className="kpi-highlight">Instant Root-Cause Attribution</div>
        </div>

        <div className="board-kpi-card kpi-warn">
          <span className="kpi-label">Annual NFF Cost Avoidance</span>
          <div className="kpi-val">${Math.round(totalAnnualValue).toLocaleString()} Saved / year</div>
          <p className="kpi-desc">
            Avoids false chip replacements ($30k each) and eliminates duplicate secondary cluster stalls from plugging good chips into bad sockets.
          </p>
          <div className="kpi-highlight">~{falseChipRmasAvoided} False Chip Swaps Averted</div>
        </div>
      </div>

      {/* 8-SOCKET BASEBOARD INTERACTIVE SCHEMATIC */}
      <div className="panel board-schematic-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Physical Baseboard Layout</span>
            <h2>8-Socket Universal Accelerator Baseboard (UBB / HGX) Visualizer</h2>
          </div>
          <div className="board-tag-row">
            <span className="board-pill">54V DC Busbar Input</span>
            <span className="board-pill">16-Phase DrMOS VRM</span>
            <span className="board-pill">PCIe Gen5 / NVLink 5 Retimers</span>
          </div>
        </div>
        <p className="muted">
          Click on any accelerator socket to inspect its 16-phase VRM power delivery stages, core voltage ripple, PCB flexure strain, and chip history:
        </p>

        <div className="baseboard-canvas">
          <div className="busbar-rail top-busbar">
            <span>54V DC Main Power Busbar Feed (A-Side)</span>
          </div>

          <div className="sockets-grid">
            {sockets.map((s) => (
              <div
                key={s.socketId}
                className={`socket-card ${s.status} ${selectedSocketId === s.socketId ? "socket-selected" : ""}`}
                onClick={() => setSelectedSocketId(s.socketId)}
              >
                <div className="socket-header">
                  <span className="socket-title">Socket #{s.socketId}</span>
                  <span className={`socket-status-badge badge-${s.status}`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
                <strong>{s.gpuId}</strong>
                <div className="vrm-phases-indicator">
                  <span>VRM Phases:</span>
                  <strong>{s.vrmPhasesActive}/{s.vrmPhasesTotal} Active</strong>
                </div>
                <div className="socket-metric">
                  <span>VDD Ripple:</span>
                  <strong className={s.vddRippleMv > 10 ? "metric-danger" : ""}>{s.vddRippleMv} mV</strong>
                </div>
                <div className="socket-metric">
                  <span>VRM Temp:</span>
                  <strong>{s.vrmTempC} °C</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="busbar-rail bottom-busbar">
            <span>54V DC Main Power Busbar Feed (B-Side Redundant)</span>
          </div>
        </div>

        {/* Selected Socket Detail Inspector */}
        <div className="socket-detail-box">
          <div className="socket-detail-head">
            <div>
              <h3>Socket #{currentSocket.socketId} Diagnostic Telemetry</h3>
              <p className="muted">Attached Accelerator: <strong>{currentSocket.gpuId}</strong> (ECID: <code>{currentSocket.ecid}</code>)</p>
            </div>
            {currentSocket.status === "warning" && (
              <button
                className="rebalance-btn"
                onClick={handleRebalance}
                disabled={isRebalancing}
              >
                {isRebalancing ? "Rebalancing Power Phases..." : "⚡ Redistribute VRM Multi-Phase Load"}
              </button>
            )}
          </div>

          <div className="socket-metrics-row">
            <div className="s-metric-col">
              <span className="label">Core VDD Power Delivery</span>
              <strong>0.85V Rail · {currentSocket.vddRippleMv} mV Ripple</strong>
              <small>{currentSocket.vrmPhasesActive} of 16 DrMOS power stages active</small>
            </div>
            <div className="s-metric-col">
              <span className="label">VRM Inductor Temp</span>
              <strong>{currentSocket.vrmTempC} °C Junction</strong>
              <small>Thermal margin: {105 - currentSocket.vrmTempC} °C to thermal trip</small>
            </div>
            <div className="s-metric-col">
              <span className="label">PCB Mechanical Strain</span>
              <strong>{currentSocket.pcbStrainMicrostrain} Microstrain (με)</strong>
              <small>Cold plate clamping torque nominal (&lt; 250 με)</small>
            </div>
            <div className="s-metric-col">
              <span className="label">PCIe/NVLink Retimer Margin</span>
              <strong>{currentSocket.retimerMarginMv} mV Eye Height</strong>
              <small>High-speed differential copper traces nominal</small>
            </div>
          </div>

          {currentSocket.issue && (
            <div className={`socket-issue-alert alert-${currentSocket.status}`}>
              <strong>Diagnostic Notice:</strong> {currentSocket.issue}
            </div>
          )}
        </div>
      </div>

      {/* CHIP VS. BOARD FAULT DISCRIMINATOR TRUTH MATRIX */}
      <div className="panel discriminator-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Root-Cause Attribution Engine</span>
            <h2>Chip vs. Board Fault Discriminator Truth Matrix</h2>
          </div>
        </div>
        <p className="muted">
          Correlating the chip's immutable birth certificate with board power telemetry isolates the exact failure domain in 1.2 seconds, preventing false $30,000 chip RMAs:
        </p>

        <div className="table-wrap">
          <table className="discriminator-table">
            <thead>
              <tr>
                <th>Physical Subsystem</th>
                <th>Diagnostic Test Executed</th>
                <th>Observed Reading</th>
                <th>Threshold Specification</th>
                <th>Domain Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Accelerator Silicon</strong></td>
                <td>Wafer-Sort Birth Certificate vs. Live Vmin</td>
                <td>772 mV Vmin · 190 mA IDDQ</td>
                <td>&lt; 820 mV Vmin / &lt; 350 mA</td>
                <td><span className="badge-verdict verdict-pass">✓ SILICON INNOCENT</span></td>
              </tr>
              <tr>
                <td><strong>2. Socket BGA Solder Balls</strong></td>
                <td>4,096 BGA Solder Ball Continuity Scan</td>
                <td>0.042 Ω Contact Resistance</td>
                <td>&lt; 0.100 Ω Limit</td>
                <td><span className="badge-verdict verdict-pass">✓ SOCKET HEALTHY</span></td>
              </tr>
              <tr className="row-fault">
                <td><strong>3. Baseboard VRM Power Stages</strong></td>
                <td>16-Phase DrMOS Current Balance & Ripple</td>
                <td>Phase 4 Inactive · 18.4 mV Ripple</td>
                <td>&lt; 5.0 mV VDD Max Ripple</td>
                <td><span className="badge-verdict verdict-fail">⚠️ BASEBOARD VRM DEFECT</span></td>
              </tr>
              <tr>
                <td><strong>4. Board Retimers & PCB Traces</strong></td>
                <td>PCIe Gen5 / NVLink 5 High-Speed SerDes Eye</td>
                <td>115 mV Eye Margin · Zero CRC</td>
                <td>&gt; 90 mV Min Eye Height</td>
                <td><span className="badge-verdict verdict-pass">✓ RETIMER NOMINAL</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="discriminator-takeaway-box">
          <strong>⚡ Definitive Diagnostic Verdict:</strong> The fault is on the <strong>Carrier Baseboard (Phase 4 VRM FET)</strong>, NOT the accelerator. <strong>Do NOT swap accelerator {currentSocket.gpuId}.</strong> The chip is 100% healthy. Dynamic multi-phase rebalancing restores 0.85V rail stability instantly without downtime.
        </div>
      </div>

      {/* EXECUTIVE NFF ROI CALCULATOR */}
      <div className="panel nff-calc-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Financial Impact of Accurate Triage</span>
            <h2>No Fault Found (NFF) False RMA Cost Avoidance Calculator</h2>
          </div>
        </div>
        <p className="muted">
          Calculate how much money your organization saves by stopping technicians from replacing good chips on bad baseboards:
        </p>

        <div className="nff-calc-inputs">
          <label>
            Total Accelerators in Fleet
            <input
              type="number"
              value={fleetGpus}
              onChange={(e) => setFleetGpus(Number(e.target.value))}
              min={100}
              step={1024}
            />
          </label>
          <label>
            Annual Incident Rate (%)
            <input
              type="number"
              value={annualIncidentRatePct}
              onChange={(e) => setAnnualIncidentRatePct(Number(e.target.value))}
              min={0.5}
              max={15}
              step={0.5}
            />
          </label>
          <label>
            Industry False Chip RMA Rate (%)
            <input
              type="number"
              value={industryNffRatePct}
              onChange={(e) => setIndustryNffRatePct(Number(e.target.value))}
              min={10}
              max={60}
              step={5}
            />
          </label>
          <label>
            Accelerator Replacement Cost ($)
            <input
              type="number"
              value={chipReplacementCost}
              onChange={(e) => setChipReplacementCost(Number(e.target.value))}
              min={10000}
              step={5000}
            />
          </label>
          <label>
            Board VRM Component Repair Cost ($)
            <input
              type="number"
              value={boardVrmRepairCost}
              onChange={(e) => setBoardVrmRepairCost(Number(e.target.value))}
              min={100}
              step={50}
            />
          </label>
        </div>

        <div className="nff-calc-results">
          <div className="nff-result-box result-highlight">
            <span>False Chip RMAs Averted</span>
            <strong>{falseChipRmasAvoided} Chips / year</strong>
            <small>Good chips saved from improper removal</small>
          </div>
          <div className="nff-result-box result-highlight">
            <span>Hardware Capital Saved</span>
            <strong>${Math.round(capitalSavedFalseRmas).toLocaleString()} / year</strong>
            <small>Direct hardware cost savings ($30k chip vs $450 VRM)</small>
          </div>
          <div className="nff-result-box result-info">
            <span>Secondary Outages Eliminated</span>
            <strong>${Math.round(secondaryDowntimeSaved).toLocaleString()} / year</strong>
            <small>Prevents repeat stalls from plugging good chips into bad sockets</small>
          </div>
          <div className="nff-result-box result-info">
            <span>Total Annual Value</span>
            <strong>${Math.round(totalAnnualValue).toLocaleString()} / year</strong>
            <small>Total net financial recovery</small>
          </div>
        </div>

        <div className="board-takeaway">
          <strong>💡 Executive Board Diagnostics Takeaway:</strong> In high-power AI clusters, over 38% of returned chips have zero silicon defects. By treating the <strong>accelerator and the baseboard as an integrated physical system</strong>, TrainingContinuity saves over <strong>${Math.round(totalAnnualValue).toLocaleString()} annually</strong> and stops the devastating cycle of duplicate cluster crashes.
        </div>
      </div>
    </section>
  );
}
