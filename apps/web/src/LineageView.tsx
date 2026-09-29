import { useState } from "react";
import { RunView } from "./api";

interface ChipPassport {
  id: string;
  ecid: string;
  fab: string;
  waferLot: string;
  waferNum: number;
  coordX: number;
  coordY: number;
  ringZone: "Center (Pristine)" | "Mid-Ring (Nominal)" | "Outer Edge (Marginal)";
  radiusMm: number;
  factoryVminMv: number;
  factoryLeakageMa: number;
  physicalLocation: string;
  status: "nominal" | "flagged" | "cordoned";
  riskReason?: string;
}

const CHIP_PASSPORTS: Record<string, ChipPassport> = {
  "gpu-r0-h0-d0": {
    id: "gpu-r0-h0-d0",
    ecid: "0x8FA2_B390_E441_99D1",
    fab: "TSMC Fab 18A (Tainan), N3P 3nm FinFET",
    waferLot: "WL-9042",
    waferNum: 14,
    coordX: 14,
    coordY: 22,
    ringZone: "Outer Edge (Marginal)",
    radiusMm: 138,
    factoryVminMv: 815,
    factoryLeakageMa: 340,
    physicalLocation: "Datacenter Hall A · Row 0 · Rack 0 · Host 0 · Socket 0",
    status: "cordoned",
    riskReason: "Gate-oxide thickness thinning from wafer edge CMP chemical over-polish. Primary trigger die.",
  },
  "gpu-r0-h0-d1": {
    id: "gpu-r0-h0-d1",
    ecid: "0x4A11_98C2_1190_FA33",
    fab: "TSMC Fab 18A (Tainan), N3P 3nm FinFET",
    waferLot: "WL-7718",
    waferNum: 0o3,
    coordX: 0,
    coordY: 2,
    ringZone: "Center (Pristine)",
    radiusMm: 18,
    factoryVminMv: 770,
    factoryLeakageMa: 185,
    physicalLocation: "Datacenter Hall A · Row 0 · Rack 0 · Host 0 · Socket 1",
    status: "nominal",
  },
  "gpu-r1-h2-d3": {
    id: "gpu-r1-h2-d3",
    ecid: "0x7CE3_22B4_FF01_65AA",
    fab: "TSMC Fab 18A (Tainan), N3P 3nm FinFET",
    waferLot: "WL-8102",
    waferNum: 21,
    coordX: 8,
    coordY: 10,
    ringZone: "Mid-Ring (Nominal)",
    radiusMm: 74,
    factoryVminMv: 790,
    factoryLeakageMa: 220,
    physicalLocation: "Datacenter Hall A · Row 1 · Rack 2 · Host 2 · Socket 3",
    status: "nominal",
  },
  "gpu-r4-h0-d2": {
    id: "gpu-r4-h0-d2",
    ecid: "0x8FA2_B390_E441_99D8",
    fab: "TSMC Fab 18A (Tainan), N3P 3nm FinFET",
    waferLot: "WL-9042",
    waferNum: 14,
    coordX: 16,
    coordY: 24,
    ringZone: "Outer Edge (Marginal)",
    radiusMm: 142,
    factoryVminMv: 818,
    factoryLeakageMa: 355,
    physicalLocation: "Datacenter Hall A · Row 4 · Rack 0 · Host 0 · Socket 2",
    status: "cordoned",
    riskReason: "Sibling die from Wafer Lot #WL-9042 outer ring. Evacuated at Step 15 checkpoint.",
  },
};

const WAFER_LOT_SUMMARY = [
  { lot: "WL-7718", fab: "TSMC 18A", dies: "8,420 dies", avgVmin: "772 mV", avgLeakage: "190 mA", status: "Gold (Optimal)", tone: "ok" },
  { lot: "WL-8102", fab: "TSMC 18A", dies: "14,110 dies", avgVmin: "788 mV", avgLeakage: "225 mA", status: "Standard", tone: "info" },
  { lot: "WL-8904", fab: "TSMC 18A", dies: "7,980 dies", avgVmin: "794 mV", avgLeakage: "240 mA", status: "Standard", tone: "info" },
  { lot: "WL-9042", fab: "TSMC 18A", dies: "2,258 dies", avgVmin: "812 mV", avgLeakage: "335 mA", status: "Edge CMP Degradation (Cordoned)", tone: "danger" },
];

export function LineageView({
  run,
}: {
  run: RunView | null;
}) {
  const totalGpus = run?.cluster?.accelerator_count ?? 32768;

  // Selected chip passport
  const [selectedChipId, setSelectedChipId] = useState<string>("gpu-r0-h0-d0");
  const passport = CHIP_PASSPORTS[selectedChipId] || CHIP_PASSPORTS["gpu-r0-h0-d0"];

  // Interactive Cohort Cordoning state
  const [cohortCordoned, setCohortCordoned] = useState<boolean>(true);
  const [cordonMessage, setCordonMessage] = useState<string>(
    "✓ COHORT CORDON ACTIVE: 14 sister dies from Wafer Lot #WL-9042 outer ring safely descheduled at verified checkpoint boundaries. Zero rolling crashes."
  );

  const toggleCordon = () => {
    if (cohortCordoned) {
      setCohortCordoned(false);
      setCordonMessage("⚠️ COHORT CORDON REMOVED: 14 sister dies re-enrolled into active training ranks. Cluster exposed to rolling wafer-lot contagion crashes.");
    } else {
      setCohortCordoned(true);
      setCordonMessage("✓ COHORT CORDON APPLIED: 14 sister dies flagged for graceful migration at the next scheduled checkpoint save (Step 30).");
    }
  };

  return (
    <section className="lineage-section">
      <div className="lineage-header">
        <span className="eyebrow">
          Silicon Birth Certificates & Batch Lineage
        </span>
        <h1>Factory Baking Batches & Digital Birth Certificates</h1>
        <p className="lede">
          Think of tracking an automaker recall: if an automaker discovers a batch of faulty airbags made on a specific factory Tuesday, they don't wait for every car on the highway to crash. They recall the sister cars with matching serial numbers.
          Silicon chips are baked in circular batches called wafers. If one chip has a hidden factory baking defect, its sister chips from the same batch will fail too.
          By attaching a Digital Birth Certificate to every processor, our system immediately identifies genetic sister chips across the entire {totalGpus.toLocaleString()}-GPU datacenter and safely rotates them out during normal save breaks — preventing weeks of rolling crashes.
        </p>
      </div>

      {/* 4 EXECUTIVE KPI CARDS */}
      <div className="lineage-kpi-grid">
        <div className="lineage-kpi-card kpi-ok">
          <span className="kpi-label">Fleet Silicon Lineage Coverage</span>
          <div className="kpi-val">100.0% ({totalGpus.toLocaleString()} GPUs)</div>
          <p className="kpi-desc">
            Every accelerator in the cluster is mapped to its exact foundry wafer coordinate, probe leakage, and packaging lot.
          </p>
          <div className="kpi-highlight">Full Cradle-to-Grave Silicon Traceability</div>
        </div>

        <div className="lineage-kpi-card kpi-info">
          <span className="kpi-label">Active Factory Production Batches</span>
          <div className="kpi-val">128 Wafer Lots Tracked</div>
          <p className="kpi-desc">
            Aggregated across 4 foundry production runs from TSMC Fab 18A (3nm process), tracking lot-by-lot leakage patterns.
          </p>
          <div className="kpi-highlight">4 Lots Monitored for Wear Drift</div>
        </div>

        <div className="lineage-kpi-card kpi-warn">
          <span className="kpi-label">Batch Defect Quarantine</span>
          <div className="kpi-val">14 Sister Chips Evacuated</div>
          <p className="kpi-desc">
            Identified all sister chips from baking batch #WL-9042 and safely rotated them out at normal save breaks without interrupting training.
          </p>
          <div className="kpi-highlight">Zero Unplanned Cluster Stalls</div>
        </div>

        <div className="lineage-kpi-card kpi-ok">
          <span className="kpi-label">Averted Downtime Value</span>
          <div className="kpi-val">$1,260,000 Saved</div>
          <p className="kpi-desc">
            Eliminated 7 sequential cluster-wide crashes that traditional isolated node replacements would have suffered over 3 weeks.
          </p>
          <div className="kpi-highlight">8.4x ROI on Lineage Integration</div>
        </div>
      </div>

      {/* DIGITAL BIRTH CERTIFICATE / PASSPORT INSPECTOR */}
      <div className="panel passport-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Silicon Passport</span>
            <h2>Digital Birth Certificate & Foundry Test Lineage</h2>
          </div>
          <div className="passport-selector">
            <label>
              Select Accelerator:
              <select
                value={selectedChipId}
                onChange={(e) => setSelectedChipId(e.target.value)}
              >
                <option value="gpu-r0-h0-d0">gpu-r0-h0-d0 (Lot WL-9042, Edge - Primary Fault Die)</option>
                <option value="gpu-r0-h0-d1">gpu-r0-h0-d1 (Lot WL-7718, Center - Gold Nominal)</option>
                <option value="gpu-r1-h2-d3">gpu-r1-h2-d3 (Lot WL-8102, Mid-Ring - Standard)</option>
                <option value="gpu-r4-h0-d2">gpu-r4-h0-d2 (Lot WL-9042, Edge - Sibling Die)</option>
              </select>
            </label>
          </div>
        </div>
        <p className="muted">
          Inspect the immutable factory test record programmed into the chip’s eFuse registers at wafer probe:
        </p>

        <div className="passport-card">
          <div className="passport-top-row">
            <div className="passport-id-badge">
              <span className="pass-label">Physical Device ID</span>
              <strong>{passport.id}</strong>
              <code>ECID: {passport.ecid}</code>
            </div>
            <div className={`passport-status-pill status-${passport.status}`}>
              {passport.status.toUpperCase()}
            </div>
          </div>

          <div className="passport-specs-grid">
            <div className="spec-col">
              <span className="spec-label">Foundry & Fabrication Process</span>
              <strong>{passport.fab}</strong>
              <small>Certified 3nm Advanced FinFET Architecture</small>
            </div>
            <div className="spec-col">
              <span className="spec-label">Wafer Lot & Wafer Index</span>
              <strong>Lot #{passport.waferLot} · Wafer #{passport.waferNum}</strong>
              <small>Batch tracking for chemical etch & CMP lots</small>
            </div>
            <div className="spec-col">
              <span className="spec-label">Wafer Spatial Coordinates</span>
              <strong>Die (X: {passport.coordX}, Y: {passport.coordY})</strong>
              <small>{passport.ringZone} · Radius: {passport.radiusMm}mm</small>
            </div>
            <div className="spec-col">
              <span className="spec-label">Factory Electrical Cushion & Standby Heat</span>
              <strong>{passport.factoryVminMv} mV Min Voltage · {passport.factoryLeakageMa} mA Heat Leakage</strong>
              <small>Certified at Factory Quality Inspection</small>
            </div>
          </div>

          <div className="passport-location-strip">
            <span>Datacenter Physical Placement:</span>
            <strong>{passport.physicalLocation}</strong>
          </div>

          {passport.riskReason && (
            <div className="passport-risk-alert">
              <strong>⚠️ Lineage Risk Telemetry:</strong> {passport.riskReason}
            </div>
          )}
        </div>
      </div>

      {/* WAFER LOT COHORT CONTAGION & CORDONING TOOL */}
      <div className="panel contagion-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Fleet-Wide Cohort Protection</span>
            <h2>Wafer-Lot Contagion Cordoning (Stopping Sequential Fleet Crashes)</h2>
          </div>
          <div className="cordon-controls">
            <button
              className={`cordon-toggle-btn ${cohortCordoned ? "btn-active" : "btn-warning"}`}
              onClick={toggleCordon}
            >
              {cohortCordoned ? "✓ Cohort Cordon Active" : "⚠️ Cordon Inactive (Click to Cordon)"}
            </button>
          </div>
        </div>
        <p className="muted">
          When Chip <code>gpu-r0-h0-d0</code> failed from a gate-oxide breakdown, feed-forward lineage traced the root cause to chemical CMP over-polish on the outer ring of Wafer Lot <strong>#WL-9042</strong>. See how the fleet responded:
        </p>

        <div className={`cordon-status-box ${cohortCordoned ? "box-ok" : "box-danger"}`}>
          {cordonMessage}
        </div>

        {/* Wafer Lot Table */}
        <div className="table-wrap">
          <table className="lineage-table">
            <thead>
              <tr>
                <th>Wafer Lot ID</th>
                <th>Foundry Fab</th>
                <th>Enrolled Dies in Fleet</th>
                <th>Average Factory Vmin</th>
                <th>Average IDDQ Leakage</th>
                <th>Genealogy Risk Assessment</th>
              </tr>
            </thead>
            <tbody>
              {WAFER_LOT_SUMMARY.map((row) => (
                <tr key={row.lot} className={`lot-row-${row.tone}`}>
                  <td><strong>{row.lot}</strong></td>
                  <td>{row.fab}</td>
                  <td>{row.dies}</td>
                  <td>{row.avgVmin}</td>
                  <td>{row.avgLeakage}</td>
                  <td>
                    <span className={`lot-badge tone-${row.tone}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIFETIME PARAMETRIC DRIFT TRACKER */}
      <div className="panel drift-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Aging & Degradation Telemetry</span>
            <h2>Lifetime Parametric Drift: Factory Day-0 Baseline vs. Live Datacenter</h2>
          </div>
        </div>
        <p className="muted">
          Tracking factory Day-0 measurements forward enables predictive wear-out monitoring. If operating parameters drift by more than 20% from birth values, hardware is flagged before causing runtime incidents:
        </p>

        <div className="drift-metrics-grid">
          <div className="drift-card">
            <span className="drift-title">Transistor Vmin Drift</span>
            <div className="drift-val-row">
              <div><span>Day-0 Factory:</span> <strong>785 mV</strong></div>
              <div><span>Month 6 Live:</span> <strong>798 mV (+1.6%)</strong></div>
            </div>
            <div className="drift-bar-wrap">
              <div className="drift-bar-fill" style={{ width: "22%" }} />
            </div>
            <small>Hot-carrier injection (HCI) aging within nominal 5% envelope.</small>
          </div>

          <div className="drift-card">
            <span className="drift-title">D2D Interposer Resistance</span>
            <div className="drift-val-row">
              <div><span>Day-0 Factory:</span> <strong>0.82 Ω</strong></div>
              <div><span>Month 6 Live:</span> <strong>0.89 Ω (+8.5%)</strong></div>
            </div>
            <div className="drift-bar-wrap">
              <div className="drift-bar-fill" style={{ width: "42%" }} />
            </div>
            <small>Thermal cycling expansion on microbumps; healthy margin to 1.5Ω trip limit.</small>
          </div>

          <div className="drift-card">
            <span className="drift-title">Thermal Interface (TIM) Resistance</span>
            <div className="drift-val-row">
              <div><span>Day-0 Factory:</span> <strong>0.045 °C/W</strong></div>
              <div><span>Month 6 Live:</span> <strong>0.048 °C/W (+6.7%)</strong></div>
            </div>
            <div className="drift-bar-wrap">
              <div className="drift-bar-fill" style={{ width: "33%" }} />
            </div>
            <small>Direct liquid cooling cold plate adhesion verified nominal.</small>
          </div>
        </div>

        <div className="lineage-takeaway">
          <strong>💡 Executive Lineage Takeaway:</strong> Treating silicon as anonymous hardware is the single biggest cause of unpredictable downtime in multi-billion-dollar AI clusters. Feed-forward digital birth certificates enable <strong>proactive cohort containment</strong>, saving over $1.2M in downtime per batch incident and providing irrefutable telemetry for 24-hour vendor warranty settlements.
        </div>
      </div>
    </section>
  );
}
