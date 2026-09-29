import { useState } from "react";
import { RunView } from "./api";

const WAFER_LOTS = [
  {
    lot_id: "LOT-TSMC-N4P-A18",
    foundry: "TSMC N4P CoWoS-L",
    dies_deployed: 16384,
    pct_fleet: "50%",
    mean_temp_c: 58.2,
    sbe_rate_khr: 0.4,
    straggler_rate: "0.2%",
    status: "NOMINAL",
    status_tone: "ok",
    action: "Standard production pretraining run",
  },
  {
    lot_id: "LOT-TSMC-N4P-B42",
    foundry: "TSMC N4P CoWoS-L",
    dies_deployed: 8192,
    pct_fleet: "25%",
    mean_temp_c: 66.8,
    sbe_rate_khr: 4.8,
    straggler_rate: "6.4%",
    status: "ELEVATED STRAGGLER DRAG",
    status_tone: "danger",
    action: "Proactively drain & RMA nodes in Racks 14-18 at checkpoint",
  },
  {
    lot_id: "LOT-TSMC-N4P-C09",
    foundry: "TSMC N4P CoWoS-L",
    dies_deployed: 8192,
    pct_fleet: "25%",
    mean_temp_c: 59.1,
    sbe_rate_khr: 0.6,
    straggler_rate: "0.4%",
    status: "NOMINAL",
    status_tone: "ok",
    action: "Standard production pretraining run",
  },
];

export function SiliconView({
  run,
  presentation,
}: {
  run: RunView | null;
  presentation: boolean;
}) {
  const gpus = run?.gpus ? Object.keys(run.gpus) : ["gpu-r0-h0-d0", "gpu-r0-h0-d1", "gpu-r0-h0-d2", "gpu-r0-h0-d3"];
  const [selectedGpu, setSelectedGpu] = useState(gpus[0]);
  
  // Calculator states
  const [hallSize, setHallSize] = useState<number>(32768);
  const [ratePerHour, setRatePerHour] = useState<number>(3.5);
  const [slowdownPct, setSlowdownPct] = useState<number>(8);

  const activeGpuData = run?.gpus ? run.gpus[selectedGpu] : null;
  const isAnomalous =
    (activeGpuData?.gpu_temp_c !== null && activeGpuData?.gpu_temp_c !== undefined && activeGpuData.gpu_temp_c >= 68) ||
    (activeGpuData?.residual_ewma !== null && activeGpuData?.residual_ewma !== undefined && activeGpuData.residual_ewma >= 5);

  const baseTemp = activeGpuData?.gpu_temp_c ?? 58.0;
  const die0Temp = isAnomalous ? baseTemp + 2.4 : baseTemp - 0.5;
  const die1Temp = isAnomalous ? baseTemp - 1.2 : baseTemp + 0.3;
  const die0Freq = isAnomalous ? 1820 : 1980;
  const die1Freq = 1980;
  const die0StragglerDelta = isAnomalous ? 38.5 : 0.8;
  const die0Leakage = isAnomalous ? 142 : 98;

  // Straggler math
  const hourlyBurn = hallSize * ratePerHour * (slowdownPct / 100);
  const dailyBurn = hourlyBurn * 24;
  const monthlyBurn = dailyBurn * 30;

  return (
    <section className="silicon-section">
      <div className="silicon-header">
        <span className="eyebrow">{presentation ? "Executive Silicon Overview" : "Hardware Telemetry & Yield Analytics"}</span>
        <h1>Silicon Dies, Wafer Batches & Straggler Analytics</h1>
        <p className="lede">
          Modern AI accelerators (like NVIDIA Blackwell B200 or AMD MI300X) are multi-die packages combining dual compute dies with 8 stacked High-Bandwidth Memory (HBM3e) dies on a silicon interposer.
          Due to process variation across manufacturing wafer lots, dies do not age or heat identically.
          This view tracks fleet-wide die patterns, isolates defective wafer batches, and stops "silent stragglers" from dragging down tens of thousands of GPUs.
        </p>
      </div>

      {/* TOP 3 EXECUTIVE KPI CARDS */}
      <div className="silicon-kpi-grid">
        <div className={`silicon-kpi-card ${isAnomalous ? "kpi-danger" : "kpi-ok"}`}>
          <span className="kpi-label">Active Straggler Drag (Collective Barrier)</span>
          <div className="kpi-val">
            {isAnomalous ? "⚠️ 1 ACTIVE DIE THROTTLING" : "✓ 0 ACTIVE STRAGGLERS"}
          </div>
          <p className="kpi-desc">
            {isAnomalous
              ? `Die 0 on ${selectedGpu} is thermal-throttling (+${die0StragglerDelta.toFixed(1)}ms). All 32k GPUs must drag pace to match.`
              : "All compute dies running within 1.2% clock synchronization envelope."}
          </p>
          <div className="kpi-highlight">
            {isAnomalous ? "Sync Stall Waste: ~$220,000 / day" : "Gang Efficiency: 100.0% Nominal"}
          </div>
        </div>

        <div className="silicon-kpi-card kpi-warn">
          <span className="kpi-label">Wafer Lot Batch Health</span>
          <div className="kpi-val">3 Foundry Batches Active</div>
          <p className="kpi-desc">
            Lot <strong>LOT-TSMC-N4P-B42</strong> (25% of hall) exhibits a 4.8x SBE memory error rate compared to baseline.
          </p>
          <div className="kpi-highlight">Action: Proactive Cordon & Evacuation Watch</div>
        </div>

        <div className="silicon-kpi-card kpi-info">
          <span className="kpi-label">HBM Predictive Degradation Horizon</span>
          <div className="kpi-val">24–48h Early Warning</div>
          <p className="kpi-desc">
            HBM micro-bump micro-cracks emit correctable Single-Bit Errors (SBE) days before catastrophic Double-Bit (DBE) crashes.
          </p>
          <div className="kpi-highlight">Drain at scheduled save to avoid $50k restarts</div>
        </div>
      </div>

      {/* WAFER LOT BATCH TABLE */}
      <div className="panel wafer-lot-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Supply Chain & Foundry Yield</span>
            <h2>Fleet Wafer Lot Batch Health Matrix</h2>
          </div>
          <span className="lot-count-badge">32,768 Accelerators Monitored</span>
        </div>
        <p className="muted">
          Hardware failures are rarely random. When silicon dies or substrate packaging have micro-defects, they cluster across specific wafer fabrication lots. Grouping telemetry by wafer batch prevents unexpected mass outages.
        </p>
        <div className="table-wrap">
          <table className="wafer-table">
            <thead>
              <tr>
                <th>Wafer Lot ID</th>
                <th>Fabrication Process</th>
                <th>Fleet Allocation</th>
                <th>Mean Die Temp</th>
                <th>SBE Rate (/1k hr)</th>
                <th>Straggler Outlier %</th>
                <th>Health Status</th>
                <th>Owner Action</th>
              </tr>
            </thead>
            <tbody>
              {WAFER_LOTS.map((lot) => (
                <tr key={lot.lot_id} className={`lot-row-${lot.status_tone}`}>
                  <td><strong>{lot.lot_id}</strong></td>
                  <td>{lot.foundry}</td>
                  <td>{lot.dies_deployed.toLocaleString()} dies ({lot.pct_fleet})</td>
                  <td>{lot.mean_temp_c}°C</td>
                  <td>{lot.sbe_rate_khr}</td>
                  <td>{lot.straggler_rate}</td>
                  <td>
                    <span className={`status-pill tone-${lot.status_tone}`}>
                      {lot.status}
                    </span>
                  </td>
                  <td><small>{lot.action}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-DIE PACKAGE EXPLORER */}
      <div className="panel package-explorer-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Physical Package Architecture</span>
            <h2>Multi-Die Accelerator Package Inspector</h2>
          </div>
          <label className="gpu-selector-label">
            Inspect Accelerator:
            <select
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="gpu-select"
            >
              {gpus.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="muted">
          Each accelerator package holds 2 Compute Core Dies and 8 High-Bandwidth Memory (HBM3e) stacks bonded on a CoWoS interposer. Notice how a single die's thermal throttle cascades delay across the NV-HBI die-to-die bridge.
        </p>

        <div className="package-diagram">
          <div className="package-frame">
            <div className="package-top-bar">
              <strong>Package: {selectedGpu} (Batch: LOT-TSMC-N4P-B42)</strong>
              <span>Substrate Temp: {baseTemp.toFixed(1)}°C · 700W TDP</span>
            </div>

            {/* Compute Dies Row */}
            <div className="compute-dies-row">
              <div className={`die-box ${isAnomalous ? "die-throttled" : "die-nominal"}`}>
                <div className="die-header">
                  <strong>Compute Die 0 (Primary SM Engine)</strong>
                  <span className="die-badge">{isAnomalous ? "THROTTLED" : "NOMINAL"}</span>
                </div>
                <div className="die-metrics">
                  <div><span>Die Temp:</span> <strong>{die0Temp.toFixed(1)}°C</strong></div>
                  <div><span>Clock Freq:</span> <strong>{die0Freq} MHz</strong></div>
                  <div><span>Leakage Current:</span> <strong>{die0Leakage} mA</strong></div>
                  <div><span>Straggler Drag:</span> <strong className={isAnomalous ? "text-danger" : ""}>+{die0StragglerDelta.toFixed(1)} ms</strong></div>
                </div>
              </div>

              <div className="die-interconnect">
                <span>NV-HBI Die-to-Die Bridge</span>
                <strong>10 TB/s · 1.1 ns</strong>
                <small>CRC Replays: 0</small>
              </div>

              <div className="die-box die-nominal">
                <div className="die-header">
                  <strong>Compute Die 1 (Secondary SM Engine)</strong>
                  <span className="die-badge">NOMINAL</span>
                </div>
                <div className="die-metrics">
                  <div><span>Die Temp:</span> <strong>{die1Temp.toFixed(1)}°C</strong></div>
                  <div><span>Clock Freq:</span> <strong>{die1Freq} MHz</strong></div>
                  <div><span>Leakage Current:</span> <strong>102 mA</strong></div>
                  <div><span>Straggler Drag:</span> <strong>+0.2 ms</strong></div>
                </div>
              </div>
            </div>

            {/* 8x HBM Stacks Grid */}
            <div className="hbm-section">
              <span className="hbm-title">8x High-Bandwidth Memory Stacks (HBM3e · 192GB Total)</span>
              <div className="hbm-grid">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const stackAnomalous = isAnomalous && idx === 2;
                  return (
                    <div key={idx} className={`hbm-stack ${stackAnomalous ? "hbm-warn" : ""}`}>
                      <div className="hbm-head">
                        <strong>HBM-{idx}</strong>
                        <span className={`hbm-dot ${stackAnomalous ? "dot-warn" : "dot-ok"}`} />
                      </div>
                      <small>24GB 12-Hi</small>
                      <div className="hbm-stat">{(baseTemp - 3 + (idx % 3) * 1.5).toFixed(1)}°C</div>
                      <div className="hbm-sbe">{stackAnomalous ? "SBE: 14/hr" : "SBE: 0"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STRAGGLER ROI CALCULATOR */}
      <div className="panel straggler-calculator-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">The Business Cost of a Slow Die</span>
            <h2>Straggler Drag Financial Waste Calculator</h2>
          </div>
        </div>
        <p className="muted">
          In synchronous pretraining (all-reduce), <strong>the entire cluster moves only as fast as its slowest chip</strong>. If a single die throttles by 8%, all 32,768 GPUs are dragged down. See how much that costs:
        </p>

        <div className="calc-inputs-row">
          <label>
            Hall Size (GPUs)
            <input
              type="number"
              value={hallSize}
              onChange={(e) => setHallSize(Number(e.target.value))}
              min={100}
              step={1024}
            />
          </label>
          <label>
            All-In Rate ($/GPU/hr)
            <input
              type="number"
              value={ratePerHour}
              onChange={(e) => setRatePerHour(Number(e.target.value))}
              min={1}
              step={0.25}
            />
          </label>
          <label>
            Straggler Slowdown Drag (%)
            <input
              type="number"
              value={slowdownPct}
              onChange={(e) => setSlowdownPct(Number(e.target.value))}
              min={1}
              max={50}
              step={1}
            />
          </label>
        </div>

        <div className="calc-results-grid">
          <div className="calc-result-box">
            <span>Hourly Capital Burn</span>
            <strong>${Math.round(hourlyBurn).toLocaleString()}/hr</strong>
            <small>Wasted idle time across {hallSize.toLocaleString()} GPUs</small>
          </div>
          <div className="calc-result-box result-danger">
            <span>Daily Capital Burn</span>
            <strong>${Math.round(dailyBurn).toLocaleString()}/day</strong>
            <small>Pure compute loss from 1 throttled die</small>
          </div>
          <div className="calc-result-box result-highlight">
            <span>Monthly Campaign Drain</span>
            <strong>${Math.round(monthlyBurn).toLocaleString()}/mo</strong>
            <small>Direct ROI generated by continuity culling</small>
          </div>
        </div>

        <div className="calc-takeaway">
          <strong>💡 Executive Takeaway:</strong> Traditional monitoring waits for a die to crash with an error code. But a silent thermal straggler never crashes—it just burns <strong>${Math.round(dailyBurn).toLocaleString()} every single day</strong> in hidden all-reduce synchronization wait. Detecting die-level patterns and cordoning the node at the next verified checkpoint saves millions.
        </div>
      </div>
    </section>
  );
}
