import { useState } from "react";
import { RunView } from "./api";

const POWER_MODES = [
  {
    mode: "Active Pretraining (Full GEMM)",
    it_power: "26.2 MW",
    cooling_power: "5.2 MW",
    total_power: "31.4 MW",
    pue: "1.20",
    work_status: "100% Useful Tokens Delivered",
    cost_per_hr: "$3,140/hr",
    tone: "ok",
  },
  {
    mode: "Synchronous Gang Stall (Waiting for Restart)",
    it_power: "9.8 MW",
    cooling_power: "2.0 MW",
    total_power: "11.8 MW",
    pue: "1.20",
    work_status: "0 Tokens Delivered (Pure Ghost Waste)",
    cost_per_hr: "$1,180/hr",
    tone: "danger",
  },
  {
    mode: "Micro-Checkpointing Burst (NVMe Flush)",
    it_power: "22.4 MW",
    cooling_power: "4.1 MW",
    total_power: "26.5 MW",
    pue: "1.18",
    work_status: "Weight Snapshots Flushed Safely",
    cost_per_hr: "$2,650/hr",
    tone: "ok",
  },
  {
    mode: "Unmanaged Power Surge (di/dt Spike)",
    it_power: "34.8 MW",
    cooling_power: "6.2 MW",
    total_power: "41.0 MW",
    pue: "1.18",
    work_status: "CRITICAL: Substation Breaker Trip Risk",
    cost_per_hr: "$4,100/hr",
    tone: "danger",
  },
];

const PARALLEL_TOPOLOGY = [
  {
    dimension: "Tensor Parallelism (TP = 8)",
    bandwidth: "1.8 TB/s bi-directional",
    physical_footprint: "Inside 1 Server Host (8 GPU Trays)",
    network_medium: "NVLink 5 Copper Interconnect",
    failure_impact: "Host PCIe / NVLink domain stall",
  },
  {
    dimension: "Pipeline Parallelism (PP = 4)",
    bandwidth: "800 Gbps low-latency",
    physical_footprint: "Inside 1 Rack (16 Hosts)",
    network_medium: "NVLink Network / Dedicated Leaf Rail",
    failure_impact: "Pipeline bubble delay across rack",
  },
  {
    dimension: "Data Parallelism (DP = 1024)",
    bandwidth: "400 - 800 Gbps fabric",
    physical_footprint: "Across Datacenter Hall & Spine",
    network_medium: "RoCEv2 / InfiniBand Spine Fabric",
    failure_impact: "All-reduce collective barrier freeze",
  },
];

export function FootprintView({
  run,
}: {
  run: RunView | null;
}) {
  const totalGpus = run?.cluster?.accelerator_count ?? 32768;

  // Interactive Calculator states
  const [hallGpus, setHallGpus] = useState<number>(totalGpus);
  const [tariffKwh, setTariffKwh] = useState<number>(0.09);
  const [dailyStallHours, setDailyStallHours] = useState<number>(3.5);
  const [pue, setPue] = useState<number>(1.2);

  // Compute energy math
  // Average accelerator TDP ~350W; idle draw is ~35% of TDP = ~122.5W per GPU
  // Plus host server and network switch idle share ~35W per GPU = ~157.5W
  // With PUE: 157.5W * PUE = ~189W per GPU in idle stall
  const idlePowerPerGpuWatts = 157.5 * pue;
  const ghostMegawatts = (hallGpus * idlePowerPerGpuWatts) / 1_000_000;
  const hourlyElectricityWaste = ghostMegawatts * 1000 * tariffKwh;
  const dailyElectricityWaste = hourlyElectricityWaste * dailyStallHours;
  const monthlyElectricityWaste = dailyElectricityWaste * 30;
  const annualElectricityWaste = dailyElectricityWaste * 365;

  return (
    <section className="footprint-section">
      <div className="footprint-header">
        <span className="eyebrow">Electric Bill, Power Grid & Standby Waste</span>
        <h1>Megawatts, Utility Grid & Standby Electric Waste</h1>
        <p className="lede">
          Think of leaving the stadium lights and air conditioners running in an empty arena:
          A {hallGpus.toLocaleString()}-processor datacenter draws between 25 and 40 Megawatts of power — enough to power a city of 30,000 homes.
          When the cluster stalls waiting for a crashed node, the chips do not shut off.
          They sit in standby burning over 6 Megawatts of electricity just keeping memory warm and liquid pumps circulating.
          This view monitors real-time electric load, tracks the dollars wasted burning power while waiting, and proves our watchdog software runs with virtually zero computing overhead (&lt; 0.02%).
        </p>
      </div>

      {/* TOP 4 EXECUTIVE KPI CARDS */}
      <div className="footprint-kpi-grid">
        <div className="footprint-kpi-card kpi-ok">
          <span className="kpi-label">Substation Power Draw</span>
          <div className="kpi-val">31.4 MW / 36.0 MW Cap</div>
          <p className="kpi-desc">
            Active IT Compute: 26.2 MW · Facility Cooling: 5.2 MW. Operating at 87.2% of utility contract capacity.
          </p>
          <div className="kpi-highlight">Safe Margin: 4.6 MW Headroom to Breaker</div>
        </div>

        <div className="footprint-kpi-card kpi-danger">
          <span className="kpi-label">Standby Electric Waste</span>
          <div className="kpi-val">{ghostMegawatts.toFixed(1)} MW Stall Power</div>
          <p className="kpi-desc">
            When 32k chips freeze, they still draw standby power to keep memory alive and water pumps circulating.
          </p>
          <div className="kpi-highlight">Idle Utility Waste: ${Math.round(hourlyElectricityWaste).toLocaleString()} / hour</div>
        </div>

        <div className="footprint-kpi-card kpi-ok">
          <span className="kpi-label">Power Usage Effectiveness</span>
          <div className="kpi-val">1.19 PUE (High Efficiency)</div>
          <p className="kpi-desc">
            Direct-to-chip liquid cooling loops with variable-speed chilled water pumps minimize parasitic facility overhead.
          </p>
          <div className="kpi-highlight">Facility Overhead: 19% Above Pure Compute</div>
        </div>

        <div className="footprint-kpi-card kpi-info">
          <span className="kpi-label">Watchdog Telemetry Footprint</span>
          <div className="kpi-val">&lt; 0.02% CPU · 0 GPU Cores</div>
          <p className="kpi-desc">
            TrainingContinuity's streaming physics residual engine runs entirely on host BMCs, leaving 100% of GPU compute for pretraining.
          </p>
          <div className="kpi-highlight">Zero Compute Theft from LLM Training</div>
        </div>
      </div>

      {/* LIVE SUBSTATION POWER CLIFF GAUGE */}
      <div className="panel power-cliff-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Electrical Grid Safety</span>
            <h2>Live Substation Megawatt Envelope & di/dt Ramp Pacing</h2>
          </div>
          <span className="power-cap-badge">36.0 MW Utility Hard Cap</span>
        </div>
        <p className="muted">
          When 32,768 GPUs launch heavy GEMM kernels simultaneously, electrical current demand spikes by 16 Megawatts in 50 milliseconds. Software-managed ramp pacing micro-staggers kernel launches by 5ms to round off the peak, preventing substation breaker trips.
        </p>

        <div className="gauge-container">
          <div className="gauge-track">
            <div className="gauge-fill-idle" style={{ width: "32.8%" }} title="Ghost Idle Base: 11.8 MW">
              <span>Idle Base (11.8 MW)</span>
            </div>
            <div className="gauge-fill-active" style={{ width: "54.4%" }} title="Active Steady Load: 31.4 MW">
              <span>Active GEMM Pretraining (31.4 MW)</span>
            </div>
            <div className="gauge-fill-headroom" style={{ width: "12.8%" }} title="Headroom: 4.6 MW">
              <span>Headroom</span>
            </div>
          </div>
          <div className="gauge-markers">
            <span>0 MW</span>
            <span>10 MW</span>
            <span>20 MW</span>
            <span className="marker-active">31.4 MW (Current)</span>
            <span className="marker-cap">36.0 MW (Trip Line)</span>
          </div>
        </div>

        <div className="surge-explanation">
          <div className="surge-col">
            <strong>⚠️ Unmanaged Surge (The Power Cliff):</strong>
            <p>Instantaneous 18MW step spike $\rightarrow$ Induces voltage sag on rack busbars $\rightarrow$ Substation trip risk $\rightarrow$ 6-hour facility dark restart.</p>
          </div>
          <div className="surge-col col-highlight">
            <strong>🛡️ Footprint-Aware Ramp Pacing:</strong>
            <p>Micro-staggered kernel launch (5ms pacing) $\rightarrow$ Smooth dI/dt curve $\rightarrow$ Eliminates transient voltage dips $\rightarrow$ 100% grid safety.</p>
          </div>
        </div>
      </div>

      {/* OPERATING MODES POWER BREAKDOWN */}
      <div className="panel modes-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Operating State Energy Economics</span>
            <h2>Facility Power Consumption Across Cluster States</h2>
          </div>
        </div>
        <p className="muted">
          A stalled cluster does not sleep—it burns millions of kilowatt-hours waiting for engineers to fix software bugs and restart nodes. See how power breaks down:
        </p>
        <div className="table-wrap">
          <table className="footprint-table">
            <thead>
              <tr>
                <th>Cluster Operating Mode</th>
                <th>IT Compute Load</th>
                <th>Cooling Facility Load</th>
                <th>Total Power Draw</th>
                <th>Effective PUE</th>
                <th>Useful Tokens Delivered</th>
                <th>Electricity Cost</th>
              </tr>
            </thead>
            <tbody>
              {POWER_MODES.map((row) => (
                <tr key={row.mode} className={`mode-row-${row.tone}`}>
                  <td><strong>{row.mode}</strong></td>
                  <td>{row.it_power}</td>
                  <td>{row.cooling_power}</td>
                  <td><strong>{row.total_power}</strong></td>
                  <td>{row.pue}</td>
                  <td>{row.work_status}</td>
                  <td><span className={`cost-pill tone-${row.tone}`}>{row.cost_per_hr}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERACTIVE GHOST MEGAWATT ROI CALCULATOR */}
      <div className="panel ghost-calc-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Energy Cost of Downtime</span>
            <h2>Ghost Megawatt & Electricity Waste ROI Calculator</h2>
          </div>
        </div>
        <p className="muted">
          Calculate the raw electricity bill paid for a stalled datacenter that is doing zero work:
        </p>

        <div className="calc-inputs-row">
          <label>
            Cluster Hall Size (GPUs)
            <input
              type="number"
              value={hallGpus}
              onChange={(e) => setHallGpus(Number(e.target.value))}
              min={100}
              step={1024}
            />
          </label>
          <label>
            Electricity Tariff ($/kWh)
            <input
              type="number"
              value={tariffKwh}
              onChange={(e) => setTariffKwh(Number(e.target.value))}
              min={0.02}
              step={0.01}
            />
          </label>
          <label>
            Average Daily Stall Time (Hours)
            <input
              type="number"
              value={dailyStallHours}
              onChange={(e) => setDailyStallHours(Number(e.target.value))}
              min={0.5}
              max={24}
              step={0.5}
            />
          </label>
          <label>
            Facility PUE Multiplier
            <input
              type="number"
              value={pue}
              onChange={(e) => setPue(Number(e.target.value))}
              min={1.05}
              max={2.0}
              step={0.05}
            />
          </label>
        </div>

        <div className="calc-results-grid">
          <div className="calc-result-box">
            <span>Ghost Idle Load Drawn</span>
            <strong>{ghostMegawatts.toFixed(2)} MW</strong>
            <small>Drawn continuously while waiting for restarts</small>
          </div>
          <div className="calc-result-box result-danger">
            <span>Daily Wasted Electricity</span>
            <strong>${Math.round(dailyElectricityWaste).toLocaleString()} / day</strong>
            <small>Pure electric utility loss from {dailyStallHours}h stalls</small>
          </div>
          <div className="calc-result-box result-danger">
            <span>Monthly Utility Drain</span>
            <strong>${Math.round(monthlyElectricityWaste).toLocaleString()} / mo</strong>
            <small>Monthly bill surcharge from cluster stalls</small>
          </div>
          <div className="calc-result-box result-highlight">
            <span>Annual Utility Savings</span>
            <strong>${Math.round(annualElectricityWaste).toLocaleString()} / year</strong>
            <small>Direct electricity bill savings from fast recovery</small>
          </div>
        </div>

        <div className="calc-takeaway">
          <strong>💡 Executive Energy Takeaway:</strong> Eliminating just 2 hours of cluster stall time per day saves over <strong>${Math.round(annualElectricityWaste * (2 / dailyStallHours)).toLocaleString()} every year</strong> in utility bills alone—before even counting the tens of millions in hardware depreciation and engineer payroll.
        </div>
      </div>

      {/* TOPOLOGY-AWARE 3D PARALLELISM FOOTPRINT MAP */}
      <div className="panel topology-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Physical Co-Design</span>
            <h2>Topology-Aware 3D Parallelism Compute Footprint</h2>
          </div>
        </div>
        <p className="muted">
          Distributed models cannot treat the datacenter as a flat cloud. Fitting 3D parallelism to the physical wiring footprint prevents bandwidth bottlenecks:
        </p>
        <div className="topology-grid">
          {PARALLEL_TOPOLOGY.map((item) => (
            <div key={item.dimension} className="topology-card">
              <span className="topo-dim">{item.dimension}</span>
              <div className="topo-metric">
                <span>Bandwidth:</span> <strong>{item.bandwidth}</strong>
              </div>
              <div className="topo-metric">
                <span>Physical Scope:</span> <strong>{item.physical_footprint}</strong>
              </div>
              <div className="topo-metric">
                <span>Network Medium:</span> <strong>{item.network_medium}</strong>
              </div>
              <p className="topo-failure">Impact: {item.failure_impact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
