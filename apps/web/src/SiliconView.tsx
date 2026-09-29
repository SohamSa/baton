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
}: {
  run: RunView | null;
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
        <span className="eyebrow">Processor Health & Batch Analytics</span>
        <h1>Processor Brains, Factory Batches & The Tired Runner Effect</h1>
        <p className="lede">
          Think of modern AI processors as multiple miniature computer rooms combined into a single chip — computing brains paired with high-speed memory blocks.
          Because chips are baked in large batches at the silicon factory, individual processors have subtle physical differences in how hot they run and how much electrical power they need.
          This view monitors every chip across the datacenter floor, identifies defective factory batches, and stops a single overheating "tired runner" from slowing down tens of thousands of chips.
        </p>
      </div>

      {/* TOP 3 EXECUTIVE KPI CARDS */}
      <div className="silicon-kpi-grid">
        <div className={`silicon-kpi-card ${isAnomalous ? "kpi-danger" : "kpi-ok"}`}>
          <span className="kpi-label">Active Lag Drag (The Choir Effect)</span>
          <div className="kpi-val">
            {isAnomalous ? "⚠️ 1 ACTIVE DIE THROTTLING" : "✓ 0 ACTIVE STRAGGLERS"}
          </div>
          <p className="kpi-desc">
            {isAnomalous
              ? `Brain Die 0 on ${selectedGpu} is overheating and lagging behind (+${die0StragglerDelta.toFixed(1)}ms). Because everyone must sing in unison, all 32k GPUs must drag pace to match.`
              : "All compute dies running in perfect unison within 1.2% clock synchronization envelope."}
          </p>
          <div className="kpi-highlight">
            {isAnomalous ? "Sync Stall Waste: ~$220,000 / day" : "Gang Efficiency: 100.0% Nominal"}
          </div>
        </div>

        <div className="silicon-kpi-card kpi-warn">
          <span className="kpi-label">Factory Wafer Batch Health</span>
          <div className="kpi-val">3 Factory Batches Active</div>
          <p className="kpi-desc">
            Batch <strong>LOT-TSMC-N4P-B42</strong> (25% of hall) exhibits elevated memory calculation hiccups, like a batch of cookies slightly underbaked in the factory oven.
          </p>
          <div className="kpi-highlight">Action: Proactively rotate out sister chips at normal save breaks</div>
        </div>

        <div className="silicon-kpi-card kpi-info">
          <span className="kpi-label">Memory Health Early Warning</span>
          <div className="kpi-val">24–48h Early Warning</div>
          <p className="kpi-desc">
            Microscopic solder connections develop tiny stress fractures that produce minor, auto-corrected memory hiccups days before a sudden catastrophic crash.
          </p>
          <div className="kpi-highlight">Safely swap during scheduled saves to avoid $50k crash restarts</div>
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
          Each processor package holds 2 computing brain dies and 8 high-speed memory blocks bonded together. Notice how heat throttling in one brain die forces its partner and the entire cluster to wait.
        </p>

        <div className="package-diagram">
          <div className="package-frame">
            <div className="package-top-bar">
              <strong>Processor Package: {selectedGpu} (Batch: LOT-TSMC-N4P-B42)</strong>
              <span>Base Temperature: {baseTemp.toFixed(1)}°C · 700W Power Rating</span>
            </div>

            {/* Compute Dies Row */}
            <div className="compute-dies-row">
              <div className={`die-box ${isAnomalous ? "die-throttled" : "die-nominal"}`}>
                <div className="die-header">
                  <strong>Compute Brain Die 0 (Main Math Engine)</strong>
                  <span className="die-badge">{isAnomalous ? "THROTTLED (RUNNING SLOW)" : "NOMINAL (HEALTHY)"}</span>
                </div>
                <div className="die-metrics">
                  <div><span>Die Temperature:</span> <strong>{die0Temp.toFixed(1)}°C</strong></div>
                  <div><span>Clock Speed:</span> <strong>{die0Freq} MHz</strong></div>
                  <div><span>Standby Heat Leakage:</span> <strong>{die0Leakage} mA</strong></div>
                  <div><span>Choir Lag Drag:</span> <strong className={isAnomalous ? "text-danger" : ""}>+{die0StragglerDelta.toFixed(1)} ms</strong></div>
                </div>
              </div>

              <div className="die-interconnect">
                <span>Internal Micro-Bridge</span>
                <strong>High-Speed Highway</strong>
                <small>Retries: 0</small>
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
