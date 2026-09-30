import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RunView } from "./api";

export interface CampusData {
  id: string;
  name: string;
  location: string;
  flag: string;
  chips: number;
  racks: number;
  capex: number; // in millions
  gridCapacityMw: number;
  currentDrawMw: number;
  pue: number;
  tariffKwh: number;
  monthlyBill: number;
  monthlySavings: number;
  carbonIntensity: number; // g CO2/kWh
  cleanEnergyPct: number;
  workload: string;
  statusBadge: string;
  statusTone: "ok" | "warn" | "info";
  headline: string;
  keyAdvantage: string;
}

export const GLOBAL_CAMPUSES: CampusData[] = [
  {
    id: "campus_alpha",
    name: "Campus Alpha",
    location: "Northern Virginia, USA (Data Center Alley)",
    flag: "🇺🇸",
    chips: 32768,
    racks: 256,
    capex: 150,
    gridCapacityMw: 40.0,
    currentDrawMw: 31.4,
    pue: 1.19,
    tariffKwh: 0.092,
    monthlyBill: 2120000,
    monthlySavings: 860000,
    carbonIntensity: 240,
    cleanEnergyPct: 82.5,
    workload: "Flagship Frontier LLM 405B Pretraining",
    statusBadge: "🟢 OPTIMAL · RATCHET SAFE",
    statusTone: "ok",
    headline: "Low-latency financial & government corridor with high demand ratchet exposure",
    keyAdvantage: "Paved ramp pacing prevents 16 MW step-spikes, avoiding $385k annual utility ratchet penalties.",
  },
  {
    id: "campus_lonestar",
    name: "Campus Lone Star",
    location: "West Texas, USA (Permian Basin / ERCOT)",
    flag: "🇺🇸",
    chips: 65536,
    racks: 512,
    capex: 300,
    gridCapacityMw: 80.0,
    currentDrawMw: 62.8,
    pue: 1.15,
    tariffKwh: 0.052,
    monthlyBill: 2350000,
    monthlySavings: 1740000,
    carbonIntensity: 190,
    cleanEnergyPct: 88.0,
    workload: "Frontier Multimodal Video & Reasoning Model",
    statusBadge: "⚡ DEMAND RESPONSE ACTIVE",
    statusTone: "info",
    headline: "Massive scale powered by Texas wind & solar with active grid curtailment rewards",
    keyAdvantage: "Shed 12 MW in 3 seconds during 102°F heatwave without stopping training—earned $75,000 credit today.",
  },
  {
    id: "campus_cascade",
    name: "Campus Cascade",
    location: "Columbia River Basin, Oregon, USA",
    flag: "🇺🇸",
    chips: 16384,
    racks: 128,
    capex: 75,
    gridCapacityMw: 22.0,
    currentDrawMw: 15.8,
    pue: 1.12,
    tariffKwh: 0.041,
    monthlyBill: 466000,
    monthlySavings: 420000,
    carbonIntensity: 18,
    cleanEnergyPct: 100.0,
    workload: "Continuous Architecture Search & Distillation",
    statusBadge: "🟢 100% HYDRO · ZERO CARBON",
    statusTone: "ok",
    headline: "Baseload hydroelectric power with natural river cooling and ultra-low power rates",
    keyAdvantage: "100% clean hydroelectric power with zero carbon penalty tax and lowest electricity tariff in the fleet.",
  },
  {
    id: "campus_fjord",
    name: "Campus Fjord",
    location: "Narvik, Norway (Nordic Arctic Circle)",
    flag: "🇳🇴",
    chips: 16384,
    racks: 128,
    capex: 75,
    gridCapacityMw: 20.0,
    currentDrawMw: 14.5,
    pue: 1.08,
    tariffKwh: 0.048,
    monthlyBill: 501000,
    monthlySavings: 400000,
    carbonIntensity: 12,
    cleanEnergyPct: 100.0,
    workload: "Long-Context Agentic Training & Research",
    statusBadge: "🟢 HEAT EXPORT ACTIVE",
    statusTone: "ok",
    headline: "Sub-arctic ambient cooling with waste liquid heat exported to municipal district heating",
    keyAdvantage: "Liquid cooling loop exports 12 MW of 60°C warm water to heat 4,000 local homes, earning heat sale revenue.",
  },
];

export function GlobalFleetView({
  run: _run,
}: {
  run: RunView | null;
}) {
  const navigate = useNavigate();
  const [selectedCampusId, setSelectedCampusId] = useState<string>("all");
  const [simulatedEvent, setSimulatedEvent] = useState<string>("idle");

  // Global fleet totals
  const totalChips = GLOBAL_CAMPUSES.reduce((sum, c) => sum + c.chips, 0); // 131,072
  const totalCapex = GLOBAL_CAMPUSES.reduce((sum, c) => sum + c.capex, 0); // $600M
  const totalGridCap = GLOBAL_CAMPUSES.reduce((sum, c) => sum + c.gridCapacityMw, 0); // 162.0 MW
  const totalCurrentDraw = GLOBAL_CAMPUSES.reduce((sum, c) => sum + c.currentDrawMw, 0); // 124.5 MW
  const totalMonthlyBill = GLOBAL_CAMPUSES.reduce((sum, c) => sum + c.monthlyBill, 0); // $5.44M
  const totalMonthlySavings = GLOBAL_CAMPUSES.reduce((sum, c) => sum + c.monthlySavings, 0); // $3.42M
  const blendedPue = 1.15;
  const fleetUptime = 99.91;

  const activeCampus = GLOBAL_CAMPUSES.find((c) => c.id === selectedCampusId);

  return (
    <section className="fleet-container">
      {/* 1. EXECUTIVE HEADER */}
      <header className="fleet-header">
        <div className="fleet-meta-row">
          <span className="eyebrow">🌐 Global Infrastructure Portfolio · 4 Hyperscale Campuses</span>
          <span className="fleet-badge-live">131,072 Synchronous AI Accelerators</span>
        </div>
        <h1>Global Multi-Campus Fleet & Portfolio Command</h1>
        <p className="lede">
          Enterprise datacenter owners don't operate a single server room—they manage a global fleet of campuses spanning different electric utility grids, local climate zones, and power purchase agreements.
          This console provides high-level capital visibility across all <strong>131,072 accelerators</strong>, balances power tariffs across regions, and enables cross-campus workload resilience.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginTop: "1rem" }}>
          <NavLink to="/planner" className="hero-secondary-btn" style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#34d399", borderColor: "rgba(52, 211, 153, 0.4)", background: "rgba(6, 78, 59, 0.25)" }}>
            🏗️ Greenfield DC Planner
          </NavLink>
          <NavLink to="/grid" className="hero-secondary-btn" style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}>
            ⚡ Utility Grid & PPA Scorecard
          </NavLink>
          <NavLink to="/desk" className="hero-secondary-btn" style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", textDecoration: "none" }}>
            ⚡ Live Practice Floor
          </NavLink>
        </div>
      </header>

      {/* 2. GLOBAL FLEET AGGREGATION HUD (5 PILLARS) */}
      <div className="fleet-hud-grid">
        <div className="fleet-hud-card hud-accent">
          <span className="f-label">TOTAL ACCELERATORS</span>
          <strong className="f-val">{totalChips.toLocaleString()} Chips</strong>
          <p className="f-desc">1,024 liquid-cooled server racks distributed across 4 global sites.</p>
          <div className="f-sub">
            <span>Global Fleet Availability: <strong className="text-ok">{fleetUptime}%</strong></span>
          </div>
        </div>

        <div className="fleet-hud-card hud-ok">
          <span className="f-label">TOTAL CAPITAL UNDER MANAGEMENT</span>
          <strong className="f-val">${totalCapex} Million</strong>
          <p className="f-desc">Physical hardware, electrical switchgear, and liquid cooling infrastructure.</p>
          <div className="f-sub">
            <span>Blended Facility Efficiency: <strong>{blendedPue} PUE</strong></span>
          </div>
        </div>

        <div className="fleet-hud-card hud-info">
          <span className="f-label">AGGREGATE GRID INTERCONNECT</span>
          <strong className="f-val">{totalGridCap.toFixed(1)} MW Line</strong>
          <p className="f-desc">Active draw: <strong>{totalCurrentDraw.toFixed(1)} MW</strong> ({((totalCurrentDraw / totalGridCap) * 100).toFixed(0)}% capacity utilization).</p>
          <div className="f-sub">
            <span className="text-ok">✓ Headroom: {(totalGridCap - totalCurrentDraw).toFixed(1)} MW available</span>
          </div>
        </div>

        <div className="fleet-hud-card hud-warn">
          <span className="f-label">MONTHLY POWER EXPENDITURE</span>
          <strong className="f-val">${(totalMonthlyBill / 1_000_000).toFixed(2)}M / mo</strong>
          <p className="f-desc">Blended electricity cost across all 4 regional utility contracts.</p>
          <div className="f-sub">
            <span>Clean Energy Match: <strong className="text-ok">94.2% Renewable</strong></span>
          </div>
        </div>

        <div className="fleet-hud-card hud-highlight">
          <span className="f-label">ANNUAL CAPITAL PROTECTED</span>
          <strong className="f-val text-ok">+${((totalMonthlySavings * 12) / 1_000_000).toFixed(2)}M / yr</strong>
          <p className="f-desc">Direct power waste avoided, ratchet penalties stopped, and MTTR reduced from 42m to 2m.</p>
          <div className="f-sub">
            <span className="text-ok"><strong>14.2x ROI Multiple</strong> on Continuity Software</span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CAMPUS SELECTOR BAR */}
      <div className="campus-filter-bar panel">
        <span className="filter-title">Filter by Campus:</span>
        <div className="campus-pills-row">
          <button
            type="button"
            className={`campus-pill ${selectedCampusId === "all" ? "active" : ""}`}
            onClick={() => setSelectedCampusId("all")}
          >
            <span>🌐</span>
            <span>All Global Campuses (4)</span>
            <small>131k Chips</small>
          </button>
          {GLOBAL_CAMPUSES.map((campus) => (
            <button
              key={campus.id}
              type="button"
              className={`campus-pill ${selectedCampusId === campus.id ? "active" : ""}`}
              onClick={() => setSelectedCampusId(campus.id)}
            >
              <span>{campus.flag}</span>
              <span>{campus.name}</span>
              <small>{campus.chips.toLocaleString()} Chips</small>
            </button>
          ))}
        </div>
      </div>

      {/* 4. CAMPUS CARDS DECK */}
      <div className="campus-cards-grid">
        {(activeCampus ? [activeCampus] : GLOBAL_CAMPUSES).map((campus) => (
          <article key={campus.id} className="campus-card">
            <div className="campus-card-header">
              <div className="campus-title-wrap">
                <span className="campus-flag">{campus.flag}</span>
                <div>
                  <h3 className="campus-name">{campus.name}</h3>
                  <span className="campus-location">{campus.location}</span>
                </div>
              </div>
              <span className={`campus-status-pill status-${campus.statusTone}`}>
                {campus.statusBadge}
              </span>
            </div>

            <p className="campus-headline">{campus.headline}</p>

            {/* Core Metrics Grid */}
            <div className="campus-metrics-grid">
              <div className="c-metric">
                <span className="c-meta-label">Accelerators:</span>
                <strong>{campus.chips.toLocaleString()} Chips</strong>
                <small>{campus.racks} Liquid Racks</small>
              </div>
              <div className="c-metric">
                <span className="c-meta-label">Substation Power:</span>
                <strong>{campus.currentDrawMw} MW / {campus.gridCapacityMw} MW</strong>
                <small>PUE: {campus.pue.toFixed(2)}</small>
              </div>
              <div className="c-metric">
                <span className="c-meta-label">Power Tariff:</span>
                <strong>${campus.tariffKwh.toFixed(3)} / kWh</strong>
                <small>Carbon: {campus.carbonIntensity} g/kWh</small>
              </div>
              <div className="c-metric metric-savings">
                <span className="c-meta-label">Monthly Value Protected:</span>
                <strong className="text-ok">+${Math.round(campus.monthlySavings).toLocaleString()} / mo</strong>
                <small>Protected from Stalls & Spikes</small>
              </div>
            </div>

            {/* Active Training Workload */}
            <div className="campus-workload-box">
              <span className="workload-tag">ACTIVE AI CAMPAIGN:</span>
              <p className="workload-name">{campus.workload}</p>
            </div>

            {/* Key Business Advantage */}
            <div className="campus-advantage-box">
              <strong>💡 Operational Advantage:</strong> {campus.keyAdvantage}
            </div>

            {/* Action Buttons */}
            <div className="campus-card-footer">
              <NavLink
                to="/grid"
                className="campus-action-btn"
                style={{ textDecoration: "none" }}
              >
                ⚡ View Substation PPA
              </NavLink>
              <button
                type="button"
                className="campus-action-btn btn-simulator"
                onClick={() => navigate("/desk")}
              >
                🎮 Simulate Campus
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* 5. GLOBAL POWER & GRID ARBITRAGE MATRIX (TABLE) */}
      <div className="panel fleet-matrix-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Cross-Regional Financial Optimization</span>
            <h2>Global Power Arbitrage & Carbon Scorecard Matrix</h2>
          </div>
          <span className="matrix-badge">Real-Time Tariff Benchmarking</span>
        </div>
        <p className="muted">
          Compare electricity costs, cooling efficiencies, and clean energy compliance across all 4 operational sites to balance training workloads where power is cheapest and greenest:
        </p>

        <div className="table-wrap">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Campus & Location</th>
                <th>Accelerators</th>
                <th>Substation Draw</th>
                <th>Facility PUE</th>
                <th>Power Tariff</th>
                <th>Carbon Intensity</th>
                <th>Clean Match</th>
                <th>Monthly Electric Bill</th>
                <th>Continuity Savings</th>
              </tr>
            </thead>
            <tbody>
              {GLOBAL_CAMPUSES.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.flag} {c.name}</strong>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>{c.location.split(",")[0]}</div>
                  </td>
                  <td><strong>{c.chips.toLocaleString()}</strong></td>
                  <td>{c.currentDrawMw.toFixed(1)} MW / {c.gridCapacityMw.toFixed(1)} MW</td>
                  <td><span className="pue-badge">{c.pue.toFixed(2)}</span></td>
                  <td><strong>${c.tariffKwh.toFixed(3)}</strong>/kWh</td>
                  <td>{c.carbonIntensity} g CO₂</td>
                  <td><span className="text-ok">{c.cleanEnergyPct.toFixed(0)}%</span></td>
                  <td>${Math.round(c.monthlyBill).toLocaleString()}</td>
                  <td><strong className="text-ok">+${Math.round(c.monthlySavings).toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="matrix-total-row">
                <td><strong>GLOBAL FLEET TOTALS</strong></td>
                <td><strong>{totalChips.toLocaleString()} Chips</strong></td>
                <td><strong>{totalCurrentDraw.toFixed(1)} MW / {totalGridCap.toFixed(1)} MW</strong></td>
                <td><strong>{blendedPue} Blended</strong></td>
                <td><strong>$0.065 Avg</strong></td>
                <td><strong>115 g Avg</strong></td>
                <td><strong className="text-ok">94.2%</strong></td>
                <td><strong>${(totalMonthlyBill / 1_000_000).toFixed(2)}M / mo</strong></td>
                <td><strong className="text-ok">+${(totalMonthlySavings / 1_000_000).toFixed(2)}M / mo</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 6. CROSS-CAMPUS DISASTER RECOVERY & LOAD-SHIFT SIMULATOR */}
      <div className="panel fleet-dr-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">🎮 Practice Floor: Fleet-Wide Disaster Recovery</span>
            <h2>Simulate Cross-Campus Workload Migration & Grid Emergencies</h2>
          </div>
          <span className="dr-badge">Multi-Region Failover</span>
        </div>
        <p className="muted">
          Test what happens when a regional climate crisis or substation transformer issue threatens a datacenter:
        </p>

        <div className="dr-scenarios-grid">
          <button
            type="button"
            className={`dr-btn ${simulatedEvent === "heatwave" ? "active" : ""}`}
            onClick={() => setSimulatedEvent("heatwave")}
          >
            <strong>☀️ 1. Texas 104°F Grid Heatwave Curtailment</strong>
            <p>ERCOT issues emergency notice. Software trims 12 MW in Texas; shifts auxiliary weights to Oregon hydro without stalling model.</p>
          </button>

          <button
            type="button"
            className={`dr-btn ${simulatedEvent === "substation" ? "active" : ""}`}
            onClick={() => setSimulatedEvent("substation")}
          >
            <strong>🔌 2. Virginia Planned Substation Line Maintenance</strong>
            <p>Utility maintenance in Ashburn. Automated micro-checkpoints flush to global fabric; workload runs at 80% pace with zero lost tokens.</p>
          </button>

          <button
            type="button"
            className={`dr-btn ${simulatedEvent === "norway" ? "active" : ""}`}
            onClick={() => setSimulatedEvent("norway")}
          >
            <strong>❄️ 3. Norway Municipal District Heat Spike</strong>
            <p>City requires 14 MW heating during snowstorm. System increases coolant delta-T to 62°C, maximizing municipal heating revenue.</p>
          </button>
        </div>

        {/* Dynamic Simulation Result Card */}
        {simulatedEvent !== "idle" ? (
          <div className="dr-result-card panel">
            <div className="dr-result-header">
              <span className="result-icon">🛡️</span>
              <div>
                <strong>Simulation Result: Fleet-Wide Resilience Confirmed</strong>
                <span className="result-sub">Cross-Campus Continuity Protocol Executed in 4.2 Seconds</span>
              </div>
            </div>
            <div className="dr-result-details">
              {simulatedEvent === "heatwave" && (
                <p>
                  <strong>West Texas (Lone Star)</strong> voltage safely governed to 24.0 MW. Zero parameters dropped.
                  Utility credit earned: <strong>+$75,000</strong>. Model speed maintained at 98.4% across fleet.
                </p>
              )}
              {simulatedEvent === "substation" && (
                <p>
                  <strong>Virginia (Alpha)</strong> flushed 100% of GPU cache to NVMe in 8 seconds. Substation maintenance executed with zero dirty crashes.
                  Total stall time avoided: <strong>4.5 Hours ($516,000 saved)</strong>.
                </p>
              )}
              {simulatedEvent === "norway" && (
                <p>
                  <strong>Norway (Fjord)</strong> heat pump exchangers diverted 14 MW of rejected heat into Narvik municipal district heating.
                  Municipal heat export revenue credited: <strong>€18,400 / month</strong>.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* 7. PRINTABLE 1-PAGE GLOBAL FLEET BOARD MEMO */}
      <footer className="panel fleet-footer-actions">
        <div>
          <h3>🖨️ Need a 1-Page Global Fleet Report for Investors or Board Members?</h3>
          <p className="muted">
            Export a high-level executive briefing summarizing all 131,072 chips, $600M CapEx, 162 MW power capacity, and $41M annual protected capital.
          </p>
        </div>
        <button
          type="button"
          className="hero-primary-btn"
          onClick={() => window.print()}
        >
          🖨️ Print Global Fleet Executive Memo
        </button>
      </footer>
    </section>
  );
}
