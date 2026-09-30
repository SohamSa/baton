import { useState } from "react";
import { RunView } from "./api";

interface GpuThermalState {
  id: string;
  tempC: number;
  powerW: number;
  throttleStatus: "none" | "thermal_pinch" | "recovered";
}

interface ShelfState {
  shelfIndex: number;
  uHeight: string;
  hostId: string;
  gpus: GpuThermalState[];
  flowLpm: number;
  inletTempC: number;
  returnTempC: number;
  busbarVoltageV: number;
  status: "nominal" | "warning" | "pinched" | "equalized";
  issue?: string;
}

const GENERATE_INITIAL_SHELVES = (): ShelfState[] => {
  const shelves: ShelfState[] = [];
  for (let s = 15; s >= 0; s--) {
    const isPinched = s >= 12;
    const isTransition = s === 10 || s === 11;

    let flowLpm = 18.2;
    let inletTempC = 28.5;
    let returnTempC = 35.8;
    let busbarVoltageV = Number((54.0 - (15 - s) * 0.04).toFixed(2));
    let status: "nominal" | "warning" | "pinched" | "equalized" = "nominal";
    let issue: string | undefined = undefined;

    if (isPinched) {
      flowLpm = 4.2;
      inletTempC = 35.5;
      returnTempC = 48.2;
      status = "pinched";
      issue = `Shelf ${s} Coolant Flow Starvation: Manifold debris pinch restricts supply to 4.2 L/min (vs 18.0 L/min nominal). +14.2°C thermal shadow across GPUs!`;
    } else if (isTransition) {
      flowLpm = 12.4;
      inletTempC = 31.0;
      returnTempC = 41.2;
      status = "warning";
      issue = `Shelf ${s} Developing Thermal Gradient: Upper manifold restriction beginning to affect return temperatures.`;
    }

    const gpus: GpuThermalState[] = [];
    for (let d = 0; d < 8; d++) {
      let baseTemp = 58 + Math.floor(Math.random() * 4);
      let power = 690 + Math.floor(Math.random() * 20);
      let throttle: "none" | "thermal_pinch" | "recovered" = "none";

      if (isPinched) {
        baseTemp = 83 + Math.floor(Math.random() * 6);
        power = 660; // beginning thermal throttle
        throttle = "thermal_pinch";
      } else if (isTransition) {
        baseTemp = 68 + Math.floor(Math.random() * 6);
        power = 700;
      }

      gpus.push({
        id: `gpu-r14-s${s}-d${d}`,
        tempC: baseTemp,
        powerW: power,
        throttleStatus: throttle,
      });
    }

    shelves.push({
      shelfIndex: s,
      uHeight: `U${s * 2 + 10}-U${s * 2 + 12}`,
      hostId: `node-rack14-sh${s}`,
      gpus,
      flowLpm,
      inletTempC,
      returnTempC,
      busbarVoltageV,
      status,
      issue,
    });
  }
  return shelves;
};

export function RackView({
  run,
}: {
  run: RunView | null;
}) {
  const totalGpus = run?.cluster?.accelerator_count ?? 32768;
  const totalRacks = run?.cluster?.rack_count ?? 256;

  const [shelves, setShelves] = useState<ShelfState[]>(GENERATE_INITIAL_SHELVES);
  const [selectedShelfIndex, setSelectedShelfIndex] = useState<number>(14);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [flushSuccess, setFlushSuccess] = useState<boolean>(false);

  // Manifold aggregate metrics state
  const [manifoldPressurePsi, setManifoldPressurePsi] = useState<number>(14.8);
  const [manifoldFlowLpm, setManifoldFlowLpm] = useState<number>(112);
  const [manifoldReturnTempC, setManifoldReturnTempC] = useState<number>(44.8);
  const [thermalGradientC, setThermalGradientC] = useState<number>(14.2);

  // Executive ROI Calculator states
  const [fleetRacks, setFleetRacks] = useState<number>(totalRacks);
  const [coolingIncidentsPerYear, setCoolingIncidentsPerYear] = useState<number>(4);
  const [gpusPerIncident, setGpusPerIncident] = useState<number>(32);
  const [meanRecoveryHoursWithoutSpatial, setMeanRecoveryHoursWithoutSpatial] = useState<number>(4.5);
  const [clusterHourlyBurn, setClusterHourlyBurn] = useState<number>(1850);

  // ROI computations
  const totalClusterStallHoursSaved = coolingIncidentsPerYear * meanRecoveryHoursWithoutSpatial;
  const goodputPreservedValue = totalClusterStallHoursSaved * clusterHourlyBurn * (totalGpus / 128);
  const hardwareDamageAvoided = coolingIncidentsPerYear * gpusPerIncident * 1200; // prevents silicon degradation / solder fatigue from 90°C thermal trip cycling
  const totalAnnualValue = goodputPreservedValue + hardwareDamageAvoided;

  const currentShelf = shelves.find((s) => s.shelfIndex === selectedShelfIndex) ?? shelves[0];

  const handleFlushManifold = () => {
    setIsFlushing(true);
    setTimeout(() => {
      setShelves((prev) =>
        prev.map((shelf) => {
          const recoveredGpus = shelf.gpus.map((gpu) => ({
            ...gpu,
            tempC: 59 + Math.floor(Math.random() * 4),
            powerW: 700,
            throttleStatus: "recovered" as const,
          }));
          return {
            ...shelf,
            flowLpm: 18.0,
            inletTempC: 28.5,
            returnTempC: 36.2,
            status: "equalized",
            issue:
              shelf.shelfIndex >= 12
                ? "✓ Cooling Line Flushed: Blockage cleared. Water flow restored to 18.0 L/min nominal. Thermal shadow dissipated across all 32 GPUs."
                : shelf.issue,
            gpus: recoveredGpus,
          };
        })
      );
      setManifoldPressurePsi(6.2);
      setManifoldFlowLpm(145);
      setManifoldReturnTempC(36.2);
      setThermalGradientC(2.1);
      setIsFlushing(false);
      setFlushSuccess(true);
    }, 850);
  };

  return (
    <section className="rack-section">
      <div className="rack-header">
        <span className="eyebrow">
          Rack Plumbing & Power Feeders
        </span>
        <h1>Server Rack Elevation & The Pinched Pipe Heat Shadow</h1>
        <p className="lede">
          Think of a pinched garden hose in a 16-story high-rise building:
          Inside a high-density server rack, 128 processors stacked across 16 shelves all drink from a single vertical water cooling pipe and power feeder.
          When a water valve pinches on the upper shelves, 32 processors suddenly heat up together like a silent thermal shadow.
          Watching each chip in isolation blinds you to the plumbing problem until 32 chips overheat simultaneously and abort the whole {totalGpus.toLocaleString()}-chip training job.
          Our rack-wide elevation monitoring watches cooling water pressure across all 16 shelves, saves everyone's progress, and flushes the line before any chips overheat.
        </p>
      </div>

      {/* 4 EXECUTIVE KPI CARDS */}
      <div className="rack-kpi-grid">
        <div className="rack-kpi-card kpi-ok">
          <span className="kpi-label">Rack Elevation Coverage</span>
          <div className="kpi-val">100% ({totalRacks.toLocaleString()} Racks / {totalGpus.toLocaleString()} GPUs)</div>
          <p className="kpi-desc">
            Continuous 10Hz Out-of-Band (OOB) BMC elevation telemetry across all 16 shelves with zero host OS CPU overhead.
          </p>
          <div className="kpi-highlight">0.00% Collective Jitter</div>
        </div>

        <div className={`rack-kpi-card ${flushSuccess ? "kpi-ok" : "kpi-warning"}`}>
          <span className="kpi-label">Spatial Thermal Shadow Gradient</span>
          <div className="kpi-val">
            {flushSuccess ? `+${thermalGradientC.toFixed(1)}°C (Equalized)` : `+${thermalGradientC.toFixed(1)}°C Delta Detected`}
          </div>
          <p className="kpi-desc">
            {flushSuccess
              ? "Manifold reverse-flush successful. Flow balanced across all 16 shelves; thermal wave extinguished."
              : "Elevation gradient anomaly flagged on Rack #14: Shelves 12-15 starved by manifold debris valve pinch."}
          </p>
          <div className="kpi-highlight">
            {flushSuccess ? "✓ Coolant Loop Balanced" : "⚠ 32 GPUs at Thermal Trip Risk"}
          </div>
        </div>

        <div className="rack-kpi-card kpi-info">
          <span className="kpi-label">Vertical 54V DC Busbar Droop</span>
          <div className="kpi-val">53.4V (0.6V Max Droop)</div>
          <p className="kpi-desc">
            Live voltage drop monitored across all 16 shelf taps under 120kW peak matrix workload (54.0V feed to 53.4V top shelf).
          </p>
          <div className="kpi-highlight">Busbar Impedance: 3.2 mΩ Nominal</div>
        </div>

        <div className="rack-kpi-card kpi-ok">
          <span className="kpi-label">Simultaneous Cascade Avoidance</span>
          <div className="kpi-val">32 GPUs Protected per Pinch</div>
          <p className="kpi-desc">
            Preemptive checkpoint save + automated manifold flush saves $180k+ in wasted goodput stall hours per occurrence.
          </p>
          <div className="kpi-highlight">Zero Unplanned Cluster Aborts</div>
        </div>
      </div>

      {/* MAIN SPATIAL GRID: RACK ELEVATION + MANIFOLD CONTROLS */}
      <div className="rack-main-layout">
        {/* LEFT COLUMN: 16-SHELF PHYSICAL ELEVATION VISUALIZER */}
        <div className="panel rack-elevation-panel">
          <div className="elevation-header">
            <div>
              <h2>Physical Rack Elevation (Rack #14 · 128 GPUs)</h2>
              <p className="muted">
                16 Server Shelves (1U-3U Form Factor) stacked vertically. Click any shelf to inspect cold plate & busbar telemetry.
              </p>
            </div>
            <div className="elevation-legend">
              <span className="legend-item"><i className="dot dot-nominal" /> 58-64°C Nominal</span>
              <span className="legend-item"><i className="dot dot-warning" /> 65-75°C Gradient</span>
              <span className="legend-item"><i className="dot dot-critical" /> 80-88°C Thermal Shadow</span>
              <span className="legend-item"><i className="dot dot-equalized" /> 60-63°C Equalized</span>
            </div>
          </div>

          <div className="rack-frame-wrapper">
            {/* VERTICAL BUSBAR VISUALIZER STRIP */}
            <div className="busbar-strip" title="Vertical 54V DC Solid Copper Busbar supplying 120kW across 16 shelves">
              <span className="busbar-label">54V DC BUSBAR</span>
              <div className="busbar-line">
                <span className="busbar-marker top">53.4V</span>
                <span className="busbar-flow-arrow">▲</span>
                <span className="busbar-marker btm">54.0V FEED</span>
              </div>
            </div>

            {/* 16 SHELVES LIST */}
            <div className="shelves-container">
              {shelves.map((shelf) => {
                const isSelected = shelf.shelfIndex === selectedShelfIndex;
                const statusClass =
                  shelf.status === "pinched"
                    ? "shelf-pinched"
                    : shelf.status === "warning"
                    ? "shelf-warning"
                    : shelf.status === "equalized"
                    ? "shelf-equalized"
                    : "shelf-nominal";

                return (
                  <div
                    key={shelf.shelfIndex}
                    className={`shelf-row ${statusClass} ${isSelected ? "shelf-selected" : ""}`}
                    onClick={() => setSelectedShelfIndex(shelf.shelfIndex)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedShelfIndex(shelf.shelfIndex);
                      }
                    }}
                  >
                    <div className="shelf-info">
                      <span className="shelf-index">Shelf {shelf.shelfIndex}</span>
                      <span className="shelf-u">{shelf.uHeight}</span>
                      <span className="shelf-busbar">{shelf.busbarVoltageV}V</span>
                    </div>

                    <div className="shelf-gpus">
                      {shelf.gpus.map((gpu) => (
                        <div
                          key={gpu.id}
                          className={`gpu-chip-pill ${
                            gpu.tempC >= 80
                              ? "gpu-hot"
                              : gpu.tempC >= 68
                              ? "gpu-warm"
                              : shelf.status === "equalized"
                              ? "gpu-equalized"
                              : "gpu-cool"
                          }`}
                          title={`${gpu.id}: ${gpu.tempC}°C, ${gpu.powerW}W`}
                        >
                          <span className="gpu-d-id">{gpu.id.split("-").slice(-1)[0]}</span>
                          <span className="gpu-temp-val">{gpu.tempC}°C</span>
                        </div>
                      ))}
                    </div>

                    <div className="shelf-metrics">
                      <span className="shelf-flow" title="Coolant Flow Rate">
                        💧 {shelf.flowLpm.toFixed(1)} L/min
                      </span>
                      <span className="shelf-ret-temp" title="Coolant Return Temperature">
                        🌡 {shelf.returnTempC.toFixed(1)}°C
                      </span>
                      {shelf.status === "pinched" && (
                        <span className="badge-pinched">SHADOW PINCH</span>
                      )}
                      {shelf.status === "warning" && (
                        <span className="badge-warning">GRADIENT</span>
                      )}
                      {shelf.status === "equalized" && (
                        <span className="badge-equalized">FLUSHED</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE SHELF TELEMETRY & COOLANT MANIFOLD CONTROLS */}
        <div className="rack-side-column">
          {/* PANEL A: SELECTED SHELF DEEP-DIVE */}
          <div className="panel shelf-detail-panel">
            <div className="shelf-detail-header">
              <div>
                <h2>Shelf {currentShelf.shelfIndex} Telemetry Inspection</h2>
                <p className="muted">
                  Elevation {currentShelf.uHeight} · Host: <code>{currentShelf.hostId}</code>
                </p>
              </div>
              <span
                className={`shelf-status-tag ${
                  currentShelf.status === "pinched"
                    ? "tag-pinched"
                    : currentShelf.status === "warning"
                    ? "tag-warning"
                    : currentShelf.status === "equalized"
                    ? "tag-equalized"
                    : "tag-nominal"
                }`}
              >
                {currentShelf.status.toUpperCase()}
              </span>
            </div>

            {currentShelf.issue && (
              <div
                className={`shelf-issue-banner ${
                  currentShelf.status === "pinched"
                    ? "issue-critical"
                    : currentShelf.status === "equalized"
                    ? "issue-resolved"
                    : "issue-warn"
                }`}
              >
                <strong>{currentShelf.status === "equalized" ? "Resolution Confirmed" : "Elevation Waveform Alert"}:</strong>{" "}
                {currentShelf.issue}
              </div>
            )}

            <div className="shelf-stats-grid">
              <div className="stat-card">
                <span className="stat-label">Shelf Coolant Flow</span>
                <strong className={`stat-val ${currentShelf.flowLpm < 10 ? "text-danger" : "text-ok"}`}>
                  {currentShelf.flowLpm.toFixed(1)} L/min
                </strong>
                <span className="stat-sub">Nominal: 18.0 L/min</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Coolant Return Temp</span>
                <strong className={`stat-val ${currentShelf.returnTempC > 45 ? "text-danger" : "text-ok"}`}>
                  {currentShelf.returnTempC.toFixed(1)}°C
                </strong>
                <span className="stat-sub">Inlet: {currentShelf.inletTempC.toFixed(1)}°C</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Vertical Busbar Tap</span>
                <strong className="stat-val text-info">{currentShelf.busbarVoltageV}V</strong>
                <span className="stat-sub">Feed: 54.0V (0.6V Droop)</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Cold Plate ΔP Drop</span>
                <strong className={`stat-val ${currentShelf.flowLpm < 10 ? "text-danger" : "text-ok"}`}>
                  {currentShelf.flowLpm < 10 ? "1.8 psi" : "4.4 psi"}
                </strong>
                <span className="stat-sub">Fluid Resistance Safe</span>
              </div>
            </div>

            {/* 8 GPU CARDS IN CURRENT SHELF */}
            <h3 className="section-subtitle">Installed Accelerators on Shelf {currentShelf.shelfIndex}</h3>
            <div className="shelf-gpus-grid">
              {currentShelf.gpus.map((gpu) => (
                <div
                  key={gpu.id}
                  className={`shelf-gpu-card ${
                    gpu.tempC >= 80 ? "card-hot" : gpu.tempC >= 68 ? "card-warm" : "card-nominal"
                  }`}
                >
                  <div className="gpu-card-head">
                    <strong>{gpu.id}</strong>
                    <span className="gpu-stat-pill">
                      {gpu.tempC >= 80 ? "THROTTLED" : "ACTIVE"}
                    </span>
                  </div>
                  <div className="gpu-card-body">
                    <div>
                      <span className="label">Die Temp:</span>{" "}
                      <strong className={gpu.tempC >= 80 ? "text-danger" : "text-ok"}>
                        {gpu.tempC}°C
                      </strong>
                    </div>
                    <div>
                      <span className="label">Power Draw:</span> <strong>{gpu.powerW}W</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL B: RACK LIQUID COOLING MANIFOLD & VALVE FLUSH CONTROL */}
          <div className="panel manifold-control-panel">
            <div className="manifold-header">
              <div>
                <h2>Rack Liquid Cooling Manifold Telemetry & Automated Purge</h2>
                <p className="muted">
                  Differential Pressure (ΔP) transmitter & reverse-pulse automated valve flushing controls.
                </p>
              </div>
              <div className="manifold-badge">
                {flushSuccess ? (
                  <span className="badge-ok">✓ MANIFOLD EQUALIZED</span>
                ) : (
                  <span className="badge-danger">⚠ VALVE RESTRICTION</span>
                )}
              </div>
            </div>

            <div className="manifold-schematic-box">
              <div className="schematic-col">
                <span className="schematic-label">SUPPLY MANIFOLD</span>
                <span className="schematic-val text-info">28.5°C</span>
                <span className="schematic-sub">Inlet Loop</span>
              </div>
              <div className="schematic-arrow">⟶</div>
              <div className="schematic-col core-flow">
                <span className="schematic-label">MANIFOLD ΔP</span>
                <strong className={`schematic-dp ${manifoldPressurePsi > 10 ? "text-danger" : "text-ok"}`}>
                  {manifoldPressurePsi.toFixed(1)} psi
                </strong>
                <span className="schematic-sub">Nominal: 6.2 psi</span>
              </div>
              <div className="schematic-arrow">⟶</div>
              <div className="schematic-col">
                <span className="schematic-label">RETURN MANIFOLD</span>
                <span className={`schematic-val ${manifoldReturnTempC > 40 ? "text-danger" : "text-ok"}`}>
                  {manifoldReturnTempC.toFixed(1)}°C
                </span>
                <span className="schematic-sub">Total Flow: {manifoldFlowLpm} L/min</span>
              </div>
            </div>

            <div className="manifold-action-bar">
              <div>
                <strong>Automated Manifold Reverse-Pulse Flush:</strong>
                <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>
                  Applies a 3-cycle reverse-pulse pressure flush through rack manifold solenoids to clear particulate debris and equalize coolant flow across upper shelves without shutting down the rack.
                </p>
              </div>
              <button
                type="button"
                className="btn-flush-manifold"
                onClick={handleFlushManifold}
                disabled={isFlushing || flushSuccess}
              >
                {isFlushing
                  ? "Flushing Manifold Valves..."
                  : flushSuccess
                  ? "✓ Manifold Flushed & Equalized"
                  : "Trigger Automated Manifold Flush"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OUT-OF-BAND (OOB) BMC ARCHITECTURE CARD */}
      <div className="panel oob-architecture-panel">
        <h2>Zero-Overhead Out-of-Band (OOB) BMC Spatial Monitoring Architecture</h2>
        <p>
          Traditional monitoring agents run in-band inside the Linux host OS, querying GPU metrics via kernel drivers.
          Under massive collective all-reduce operations, in-band polling causes kernel interrupts that introduce collective jitter, stalling 32,768 GPUs.
          Baton connects directly to dedicated Baseboard Management Controllers (BMCs) over an isolated 1GbE Out-of-Band network.
        </p>
        <div className="oob-pillars-grid">
          <div className="oob-pillar">
            <div className="pillar-num">01</div>
            <h3>Zero Host OS Interference</h3>
            <p>
              Telemetry streams via Redfish / PLDM directly from chassis BMCs. Zero CPU cycles stolen from PyTorch workers, ensuring 0.00% throughput degradation.
            </p>
          </div>
          <div className="oob-pillar">
            <div className="pillar-num">02</div>
            <h3>Spatial Waveform Correlation</h3>
            <p>
              Correlates vertical rack elevations (U-slots) with physical manifold schematics. Distinguishes single-chip thermal throttling from macro-level coolant starvation waves.
            </p>
          </div>
          <div className="oob-pillar">
            <div className="pillar-num">03</div>
            <h3>Sub-Cycle Busbar Transient Logging</h3>
            <p>
              Monitors vertical 54V DC busbars for inductive voltage sags and droop. Prevents false accelerator RMAs when high-current GEMM bursts sag upper-shelf voltages.
            </p>
          </div>
          <div className="oob-pillar">
            <div className="pillar-num">04</div>
            <h3>Coordinated Preemptive Checkpoint</h3>
            <p>
              When a spatial thermal wave is detected, triggers a coordinated in-flight weights checkpoint before initiating automated valve flush cycling, preserving 100% of progress.
            </p>
          </div>
        </div>
      </div>

      {/* EXECUTIVE OUTAGE AVOIDANCE & GOODPUT ROI CALCULATOR */}
      <div className="panel rack-roi-panel">
        <div className="roi-header">
          <div>
            <h2>Rack-Scale Spatial Telemetry ROI Calculator</h2>
            <p className="muted">
              Model the financial goodput and hardware protection value of automated rack-scale spatial monitoring and manifold diagnostics across your cluster.
            </p>
          </div>
          <div className="roi-total-badge">
            <span className="badge-sub">Total Annual Goodput Preserved</span>
            <strong className="badge-money">${Math.round(totalAnnualValue).toLocaleString()}</strong>
          </div>
        </div>

        <div className="roi-inputs-grid">
          <div className="roi-input-group">
            <label htmlFor="fleetRacksInput">Total Racks in Cluster</label>
            <div className="input-with-val">
              <input
                id="fleetRacksInput"
                type="range"
                min="16"
                max="512"
                step="16"
                value={fleetRacks}
                onChange={(e) => setFleetRacks(Number(e.target.value))}
              />
              <span className="slider-val">{fleetRacks} Racks ({fleetRacks * 128} GPUs)</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="coolingIncidentsInput">Cooling Manifold Incidents / Year</label>
            <div className="input-with-val">
              <input
                id="coolingIncidentsInput"
                type="range"
                min="1"
                max="12"
                step="1"
                value={coolingIncidentsPerYear}
                onChange={(e) => setCoolingIncidentsPerYear(Number(e.target.value))}
              />
              <span className="slider-val">{coolingIncidentsPerYear} Incidents / yr</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="gpusPerIncidentInput">GPUs Starved per Manifold Pinch</label>
            <div className="input-with-val">
              <input
                id="gpusPerIncidentInput"
                type="range"
                min="8"
                max="64"
                step="8"
                value={gpusPerIncident}
                onChange={(e) => setGpusPerIncident(Number(e.target.value))}
              />
              <span className="slider-val">{gpusPerIncident} GPUs</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="recoveryHoursInput">Mean Recovery Time without Spatial Telemetry (hrs)</label>
            <div className="input-with-val">
              <input
                id="recoveryHoursInput"
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={meanRecoveryHoursWithoutSpatial}
                onChange={(e) => setMeanRecoveryHoursWithoutSpatial(Number(e.target.value))}
              />
              <span className="slider-val">{meanRecoveryHoursWithoutSpatial.toFixed(1)} Hours</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="hourlyBurnInput">Cluster Hourly Downtime Cost ($/hr)</label>
            <div className="input-with-val">
              <input
                id="hourlyBurnInput"
                type="number"
                min="500"
                max="10000"
                step="250"
                value={clusterHourlyBurn}
                onChange={(e) => setClusterHourlyBurn(Number(e.target.value))}
              />
              <span className="slider-val">${clusterHourlyBurn.toLocaleString()}/hr</span>
            </div>
          </div>
        </div>

        <div className="roi-summary-breakdown">
          <div className="breakdown-card">
            <span className="breakdown-title">Cluster Stall Hours Avoided</span>
            <strong className="breakdown-metric">{totalClusterStallHoursSaved.toFixed(1)} hrs/yr</strong>
            <p className="breakdown-detail">
              Preemptive checkpoints and automated manifold flushes resolve cooling pinches in under 2 minutes rather than 4+ hours of manual technician triage.
            </p>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-title">Lost Training Goodput Preserved</span>
            <strong className="breakdown-metric text-ok">${Math.round(goodputPreservedValue).toLocaleString()}</strong>
            <p className="breakdown-detail">
              Prevents synchronous gang-scheduled collective aborts across {totalGpus.toLocaleString()} accelerators.
            </p>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-title">Hardware Thermal Degradation Avoided</span>
            <strong className="breakdown-metric text-info">${Math.round(hardwareDamageAvoided).toLocaleString()}</strong>
            <p className="breakdown-detail">
              Protects {coolingIncidentsPerYear * gpusPerIncident} accelerators from high-temperature silicon wearout, BGA solder micro-cracks, and cold plate dry-out.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
