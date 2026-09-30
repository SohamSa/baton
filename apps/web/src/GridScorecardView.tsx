import { useState } from "react";
import { RunView } from "./api";

export interface PPAScenario {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: "ok" | "danger" | "warn" | "info";
  itPower: number; // MW
  coolingPower: number; // MW
  totalPower: number; // MW
  gridCap: number; // MW
  ratchetThreshold: number; // MW
  effectivePue: number;
  tariffKwh: number;
  hourlyCost: number;
  usefulTokensRate: string;
  financialImpact: string;
  gridStatus: string;
  analogy: string;
  howWeSolve: string;
}

export const PPA_SCENARIOS: PPAScenario[] = [
  {
    id: "normal_pretraining",
    title: "Scenario 1: Steady AI Pretraining (Baseline)",
    subtitle: "All 32,768 chips computing active matrix math in lockstep",
    badge: "100% PRODUCTIVE LOAD",
    badgeTone: "ok",
    itPower: 26.2,
    coolingPower: 5.2,
    totalPower: 31.4,
    gridCap: 40.0,
    ratchetThreshold: 36.0,
    effectivePue: 1.19,
    tariffKwh: 0.085,
    hourlyCost: 2669,
    usefulTokensRate: "100% Max Token Throughput",
    financialImpact: "Operating within contracted baseline. Zero penalties incurred.",
    gridStatus: "🟢 Normal Grid Load · 8.6 MW Headroom to Substation Cap",
    analogy: "A cruise ship cruising at full speed on calm seas—every passenger has a meal and every engine is producing propulsion.",
    howWeSolve: "Telemetry monitors baseline efficiency; direct-to-chip liquid cooling maintains 1.19 PUE.",
  },
  {
    id: "unmanaged_surge",
    title: "Scenario 2: The Power Cliff (Unmanaged Step-Spike)",
    subtitle: "32k chips wake up simultaneously, triggering a 16 MW surge in 50ms",
    badge: "RATCHET PENALTY BREACH",
    badgeTone: "danger",
    itPower: 34.8,
    coolingPower: 6.2,
    totalPower: 41.0,
    gridCap: 40.0,
    ratchetThreshold: 36.0,
    effectivePue: 1.18,
    tariffKwh: 0.12,
    hourlyCost: 4920,
    usefulTokensRate: "High Risk: Breaker Trip / Crash Pending",
    financialImpact: "CRITICAL: Tripped 36 MW utility ratchet ceiling. Utility locks billing at 41 MW baseline for next 11 months ($385,000 penalty).",
    gridStatus: "🔴 CRITICAL BREACH: 41.0 MW exceeds 40.0 MW substation breaker cap!",
    analogy: "Stomping the gas pedal on a 50-car semi-truck convoy at the exact same millisecond—snapping the driveshafts and blowing the highway bridge.",
    howWeSolve: "Our Software Ramp Pacing staggers kernel launches by 5 milliseconds across racks, smoothing the spike into a gentle wave well under the 36 MW line.",
  },
  {
    id: "ghost_bleed_stall",
    title: "Scenario 3: Synchronous Gang Stall (Ghost Standby Bleed)",
    subtitle: "1 chip stumbled; entire 32,768-chip cluster frozen waiting for debug",
    badge: "PURE GHOST WASTE",
    badgeTone: "danger",
    itPower: 9.8,
    coolingPower: 2.0,
    totalPower: 11.8,
    gridCap: 40.0,
    ratchetThreshold: 36.0,
    effectivePue: 1.20,
    tariffKwh: 0.085,
    hourlyCost: 1003,
    usefulTokensRate: "0 Tokens Delivered (Frozen Cluster)",
    financialImpact: "Burning $1,003/hr ($24,072/day) in electric utility bills for an empty building producing zero AI intelligence.",
    gridStatus: "🟠 Standby Draw: 11.8 MW keeping memory alive and water pumps circulating",
    analogy: "Leaving the stadium floodlights, scoreboards, and concessions running all night in an empty stadium while the game is postponed.",
    howWeSolve: "Preemptive micro-saves and 42-second instant restarts eliminate 85% of stall idle hours, saving hundreds of thousands in wasted power.",
  },
  {
    id: "demand_response",
    title: "Scenario 4: Grid Demand Response Event (Heatwave Curtailment)",
    subtitle: "City electric grid stresses; utility calls for voluntary 7 MW reduction",
    badge: "+$45,000 UTILITY REWARD",
    badgeTone: "info",
    itPower: 20.2,
    coolingPower: 4.0,
    totalPower: 24.2,
    gridCap: 40.0,
    ratchetThreshold: 36.0,
    effectivePue: 1.20,
    tariffKwh: 0.065,
    hourlyCost: 1573,
    usefulTokensRate: "78% Speed (Job Stays Alive Without Interruption)",
    financialImpact: "SUCCESS: Datacenter collects a $45,000 cash credit from the electric utility for shedding 7.2 MW during city peak.",
    gridStatus: "🔵 Active Demand-Response Shave: 24.2 MW facility draw",
    analogy: "The highway department paying your trucking fleet $1,000 per truck to drive 55 mph instead of 70 mph during evening rush hour.",
    howWeSolve: "Software dynamically adjusts GPU core voltage and clock frequencies across the fleet, shedding 7.2 MW in 3 seconds without dropping a single training parameter.",
  },
  {
    id: "battery_arbitrage",
    title: "Scenario 5: Battery Energy Storage (BESS) Peak Shaving",
    subtitle: "Afternoon peak tariff window ($0.26/kWh) mitigated by on-site battery",
    badge: "SAVING $2,350 / AFTERNOON",
    badgeTone: "ok",
    itPower: 26.2,
    coolingPower: 5.2,
    totalPower: 29.4, // Net draw from grid after battery injection
    gridCap: 40.0,
    ratchetThreshold: 36.0,
    effectivePue: 1.19,
    tariffKwh: 0.26,
    hourlyCost: 3120, // Net cost
    usefulTokensRate: "100% Max Token Throughput",
    financialImpact: "On-site 10 MWh battery injects 2.0 MW into the building busbar, shaving peak grid draw and saving $2,350 per afternoon cycle.",
    gridStatus: "🟢 Battery Assisting Grid: 2.0 MW discharged from on-site BESS",
    analogy: "Filling your gas tank at the cheap station at night so you never have to pay double at the airport gas pump in the afternoon.",
    howWeSolve: "System co-schedules workload bursts with battery state-of-charge, recharging batteries overnight at $0.04/kWh and shaving expensive daytime peaks.",
  },
];

export function GridScorecardView({
  run: _run,
}: {
  run: RunView | null;
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("normal_pretraining");
  const selectedScenario = PPA_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? PPA_SCENARIOS[0];

  const defaultMw = _run?.cluster?.accelerator_count
    ? Math.max(10, Math.round((_run.cluster.accelerator_count * 350 * 1.19) / 1_000_000))
    : 32;

  // Interactive PPA Calculator State
  const [facilityMw, setFacilityMw] = useState<number>(defaultMw);
  const [tariffKwh, setTariffKwh] = useState<number>(0.085);
  const [ratchetRate, setRatchetRate] = useState<number>(22); // $ per kW per month
  const [dailyStallHours, setDailyStallHours] = useState<number>(2.5);
  const [facilityPue, setFacilityPue] = useState<number>(1.19);

  // Derived Financial Calculations
  const standbyPowerRatio = 0.38; // 38% of total power is drawn in idle standby
  const ghostStallMw = facilityMw * standbyPowerRatio * facilityPue;
  const hourlyStallElectricWaste = ghostStallMw * 1000 * tariffKwh;
  const dailyStallElectricWaste = hourlyStallElectricWaste * dailyStallHours;
  const annualGhostElectricWaste = dailyStallElectricWaste * 365;

  // Unmanaged surge risk calculation
  // 15% surge above contracted baseline
  const potentialSurgeKw = facilityMw * 1000 * 0.18;
  const annualRatchetRisk = potentialSurgeKw * ratchetRate * 11; // 11-month ratchet penalty window

  // Total Annual Electric Bill (Base Load)
  const annualBaseKwh = facilityMw * 1000 * facilityPue * 24 * 365;
  const annualBaseElectricBill = annualBaseKwh * tariffKwh;

  // Total Capital Protected by Continuity System
  const annualPowerProtected = annualGhostElectricWaste * 0.85 + annualRatchetRisk;

  // Gauge bar math for Substation Envelope
  const maxScaleMw = 45.0;
  const ratchetPct = (selectedScenario.ratchetThreshold / maxScaleMw) * 100;
  const gridCapPct = (selectedScenario.gridCap / maxScaleMw) * 100;
  const isBreached = selectedScenario.totalPower > selectedScenario.ratchetThreshold;
  const isCapExceeded = selectedScenario.totalPower > selectedScenario.gridCap;

  return (
    <section className="grid-scorecard-section">
      {/* 1. EXECUTIVE HEADER */}
      <header className="grid-scorecard-header">
        <div className="header-meta-row">
          <span className="eyebrow">⚡ 40.0 MW Regional Interconnect · Power Purchase Agreement #PPA-2026-X89</span>
          <span className={`ppa-status-badge badge-${selectedScenario.badgeTone}`}>
            {selectedScenario.badge}
          </span>
        </div>
        <h1>Utility Grid & Power Purchase Agreement (PPA) Scorecard</h1>
        <p className="lede">
          A 32,768-chip datacenter draws between 25 and 40 Megawatts of power—enough electricity to run a city of 30,000 homes.
          In commercial datacenter agreements, electric bills aren't simple utility meters: they contain <strong>11-month peak ratchet penalties</strong>, <strong>ghost standby power leaks</strong>, and <strong>summer peak afternoon tariff surcharges</strong>.
          This scorecard monitors your substation contract in real time, models operational scenarios, and protects millions of dollars in power capital.
        </p>
      </header>

      {/* 2. TOP EXECUTIVE PPA CONTRACT HUD (6 TILES) */}
      <div className="grid-hud-grid">
        <div className="grid-hud-card hud-ok">
          <span className="hud-label">Contract Grid Capacity</span>
          <strong className="hud-val">{selectedScenario.gridCap.toFixed(1)} MW Limit</strong>
          <p className="hud-desc">
            Regional electric utility interconnect capacity. Current total draw: <strong>{selectedScenario.totalPower.toFixed(1)} MW</strong>.
          </p>
          <div className="hud-sub">
            {isCapExceeded ? (
              <span className="text-danger">⚠️ OVERLOAD: Exceeds substation breaker!</span>
            ) : (
              <span className="text-ok">✓ Headroom: {(selectedScenario.gridCap - selectedScenario.totalPower).toFixed(1)} MW</span>
            )}
          </div>
        </div>

        <div className={`grid-hud-card ${isBreached ? "hud-danger" : "hud-ok"}`}>
          <span className="hud-label">Monthly Demand Ratchet</span>
          <strong className={`hud-val ${isBreached ? "text-danger" : "text-ok"}`}>
            {isBreached ? "🚨 RATCHET TRIPPED" : "✓ PROTECTED"}
          </strong>
          <p className="hud-desc">
            15-minute peak ceiling is <strong>{selectedScenario.ratchetThreshold.toFixed(1)} MW</strong>. Draw: <strong>{selectedScenario.totalPower.toFixed(1)} MW</strong>.
          </p>
          <div className="hud-sub">
            {isBreached ? (
              <span className="text-danger">+$35,000/mo penalty for next 11 months</span>
            ) : (
              <span className="text-ok">Safe: Paved ramp pacing prevents micro-spikes</span>
            )}
          </div>
        </div>

        <div className="grid-hud-card hud-warn">
          <span className="hud-label">Hourly Electricity Bill</span>
          <strong className="hud-val">${selectedScenario.hourlyCost.toLocaleString()} / hr</strong>
          <p className="hud-desc">
            Blended rate: ${(selectedScenario.tariffKwh).toFixed(3)}/kWh. Total daily burn: ${(selectedScenario.hourlyCost * 24).toLocaleString()}/day.
          </p>
          <div className="hud-sub">
            <span>Effective PUE: <strong>{selectedScenario.effectivePue.toFixed(2)}</strong></span>
          </div>
        </div>

        <div className="grid-hud-card hud-info">
          <span className="hud-label">Useful Work Status</span>
          <strong className="hud-val">{selectedScenario.usefulTokensRate}</strong>
          <p className="hud-desc">
            Relationship between electrical power consumed and useful LLM training tokens delivered.
          </p>
          <div className="hud-sub">
            <span>{selectedScenario.financialImpact}</span>
          </div>
        </div>

        <div className="grid-hud-card hud-ok">
          <span className="hud-label">Demand Response Earnings</span>
          <strong className="hud-val text-ok">+$184,200 YTD</strong>
          <p className="hud-desc">
            Incentive credits paid by the utility for voluntary 15-minute load shedding during city heatwaves.
          </p>
          <div className="hud-sub">
            <span className="text-ok">✓ 4 successful curtailment events completed</span>
          </div>
        </div>

        <div className="grid-hud-card hud-ok">
          <span className="hud-label">24/7 Hourly Clean Energy</span>
          <strong className="hud-val text-ok">88.4% Renewable</strong>
          <p className="hud-desc">
            Real-time hydro-electric + on-site 10 MWh Battery Energy Storage System (BESS) matching.
          </p>
          <div className="hud-sub">
            <span>Carbon Intensity: <strong>184 g CO₂ / kWh</strong></span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE PPA SCENARIO SIMULATOR (GAME-LIKE EXPERIENCE) */}
      <div className="panel ppa-scenario-simulator">
        <div className="panel-head">
          <div>
            <span className="eyebrow">🎮 Practice Floor: Datacenter Power Simulator</span>
            <h2>Test & Try Permutations of Real Power Scenarios</h2>
          </div>
          <span className="simulator-active-pill">
            Simulating: <strong>{selectedScenario.title.split(":")[0]}</strong>
          </span>
        </div>
        <p className="muted">
          Click any real-world utility scenario below to watch how electric power draw, substation breaker headroom, and electricity costs react instantly:
        </p>

        {/* Scenario Selection Tabs */}
        <div className="scenario-buttons-grid">
          {PPA_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            return (
              <button
                key={scenario.id}
                type="button"
                className={`scenario-card-btn ${isSelected ? "selected" : ""} tone-${scenario.badgeTone}`}
                onClick={() => setSelectedScenarioId(scenario.id)}
              >
                <div className="scenario-btn-top">
                  <span className="scenario-number">{scenario.title.split(":")[0]}</span>
                  <span className={`scenario-badge-pill pill-${scenario.badgeTone}`}>{scenario.badge}</span>
                </div>
                <strong className="scenario-btn-title">{scenario.title.split(":")[1]?.trim() ?? scenario.title}</strong>
                <p className="scenario-btn-desc">{scenario.subtitle}</p>
                <div className="scenario-btn-metrics">
                  <span>Draw: <strong>{scenario.totalPower.toFixed(1)} MW</strong></span>
                  <span>Cost: <strong>${scenario.hourlyCost.toLocaleString()}/hr</strong></span>
                </div>
              </button>
            );
          })}
        </div>

        {/* LIVE SUBSTATION POWER METER & ENVELOPE */}
        <div className="substation-live-meter">
          <div className="meter-header">
            <div>
              <span className="meter-eyebrow">Substation Primary Transformer Feeder</span>
              <h3>Live Facility Megawatt Draw vs Utility Contract Limits</h3>
            </div>
            <div className="meter-current-readout">
              <span className="readout-label">CURRENT DRAW:</span>
              <strong className={`readout-number ${isBreached ? "text-danger" : "text-ok"}`}>
                {selectedScenario.totalPower.toFixed(1)} MW
              </strong>
            </div>
          </div>

          {/* Interactive Graphical Bar */}
          <div className="meter-track-container">
            <div className="meter-track">
              {/* IT Compute Portion */}
              <div
                className="meter-fill meter-fill-it"
                style={{ width: `${(selectedScenario.itPower / maxScaleMw) * 100}%` }}
                title={`Active IT Compute: ${selectedScenario.itPower.toFixed(1)} MW`}
              >
                <span>IT Compute ({selectedScenario.itPower.toFixed(1)} MW)</span>
              </div>
              {/* Cooling Portion */}
              <div
                className="meter-fill meter-fill-cooling"
                style={{ width: `${(selectedScenario.coolingPower / maxScaleMw) * 100}%` }}
                title={`Facility Cooling: ${selectedScenario.coolingPower.toFixed(1)} MW`}
              >
                <span>Cooling ({selectedScenario.coolingPower.toFixed(1)} MW)</span>
              </div>
              {/* Ratchet Threshold Marker Line */}
              <div
                className="meter-marker-line marker-ratchet"
                style={{ left: `${ratchetPct}%` }}
              >
                <span className="marker-tag">36.0 MW Ratchet Line</span>
              </div>
              {/* Grid Hard Cap Marker Line */}
              <div
                className="meter-marker-line marker-cap"
                style={{ left: `${gridCapPct}%` }}
              >
                <span className="marker-tag">40.0 MW Hard Cap</span>
              </div>
            </div>

            <div className="meter-scale-labels">
              <span>0 MW</span>
              <span>10 MW</span>
              <span>20 MW</span>
              <span className="label-ratchet">36 MW (Demand Ratchet Ceiling)</span>
              <span className="label-cap">40 MW (Utility Breaker Cap)</span>
              <span>45 MW</span>
            </div>
          </div>

          {/* Scenario Details & Plain-English Explanation */}
          <div className={`scenario-breakdown-card tone-${selectedScenario.badgeTone}`}>
            <div className="breakdown-grid">
              <div className="breakdown-col">
                <span className="col-label">📖 SIMPLE EVERYDAY ANALOGY</span>
                <p className="col-text">{selectedScenario.analogy}</p>
              </div>
              <div className="breakdown-col">
                <span className="col-label">💰 FINANCIAL & CONTRACT IMPACT</span>
                <p className="col-text"><strong>{selectedScenario.financialImpact}</strong></p>
                <p className="col-sub">Grid Status: {selectedScenario.gridStatus}</p>
              </div>
              <div className="breakdown-col">
                <span className="col-label">🛡️ HOW TRAININGCONTINUITY PROTECTS YOU</span>
                <p className="col-text">{selectedScenario.howWeSolve}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. THE 4 REAL FINANCIAL TRAPS IN DATACENTER POWER CONTRACTS */}
      <div className="panel ppa-traps-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Executive Power Economics</span>
            <h2>The 4 Hidden Traps in Datacenter Power Contracts (Explained Simply)</h2>
          </div>
        </div>
        <p className="muted">
          Unlike ordinary residential electricity, industrial power contracts have strict terms designed by utilities.
          Here is how they work and how software safeguards your investment:
        </p>

        <div className="traps-grid">
          <div className="trap-card">
            <div className="trap-icon">🪤</div>
            <span className="trap-tag">TRAP #1</span>
            <h3>The Peak Demand Ratchet Trap</h3>
            <p className="trap-analogy">
              <strong>Analogy:</strong> Buying a massive dump truck based on the single heaviest rock you ever hauled, and paying the monthly truck loan for 11 months even when hauling feathers.
            </p>
            <p className="trap-desc">
              If 32k chips wake up simultaneously, electricity spikes for 50 milliseconds. The utility bills you for that entire peak for the next 11 months.
            </p>
            <div className="trap-solution">
              <strong>How We Fix It:</strong> Software Ramp Pacing staggers chip activations by 5ms, smoothing the spike into a gentle wave well under the penalty line.
            </div>
          </div>

          <div className="trap-card">
            <div className="trap-icon">👻</div>
            <span className="trap-tag">TRAP #2</span>
            <h3>The Ghost Standby Bleed Trap</h3>
            <p className="trap-analogy">
              <strong>Analogy:</strong> Leaving all hotel air conditioning, swimming pool heaters, and elevators running full blast when the hotel is completely empty.
            </p>
            <p className="trap-desc">
              When a training job freezes, chips don't turn off. They draw 11.8 Megawatts continuously just keeping memory alive while engineers investigate.
            </p>
            <div className="trap-solution">
              <strong>How We Fix It:</strong> Preemptive micro-saves and 42-second instant restarts eliminate 85% of stall hours, saving up to $1.2M/yr in raw electricity.
            </div>
          </div>

          <div className="trap-card">
            <div className="trap-icon">📈</div>
            <span className="trap-tag">TRAP #3</span>
            <h3>The Afternoon Peak Tariff Surcharge</h3>
            <p className="trap-analogy">
              <strong>Analogy:</strong> Uber surge pricing during a rainstorm at rush hour—charging 400% more for the exact same ride.
            </p>
            <p className="trap-desc">
              Electricity costs $0.045/kWh overnight, but jumps to $0.26/kWh between 2:00 PM and 7:00 PM on hot summer afternoons.
            </p>
            <div className="trap-solution">
              <strong>How We Fix It:</strong> We coordinate with on-site Battery Storage (BESS) to inject 2.0 MW into the building during peak hours, saving $2,350 every single afternoon.
            </div>
          </div>

          <div className="trap-card">
            <div className="trap-icon">🚨</div>
            <span className="trap-tag">TRAP #4</span>
            <h3>The Unplanned Grid Curtailment Panic</h3>
            <p className="trap-analogy">
              <strong>Analogy:</strong> An air traffic controller ordering airplanes to hold in the air during a lightning storm instead of crashing on the runway.
            </p>
            <p className="trap-desc">
              During heatwaves, the utility orders large users to cut power by 20%. Unprepared datacenters crash their training jobs.
            </p>
            <div className="trap-solution">
              <strong>How We Fix It:</strong> Software reduces clock speeds dynamically, shedding 7.2 MW in 3 seconds without losing training progress—and collects a $45,000 utility reward!
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE PPA CONTRACT & ELECTRIC BILL CALCULATOR */}
      <div className="panel ppa-calc-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Executive ROI Calculator</span>
            <h2>Interactive Power Purchase Agreement & Electric Bill Modeler</h2>
          </div>
          <span className="calc-badge">Customize Your Facility Numbers</span>
        </div>
        <p className="muted">
          Adjust the sliders below to match your planned or existing datacenter facility, electricity contract rates, and expected stall downtime:
        </p>

        {/* Input Sliders */}
        <div className="calc-inputs-grid">
          <div className="calc-input-group">
            <div className="input-header">
              <label htmlFor="facility-mw">Datacenter IT Capacity</label>
              <strong>{facilityMw} Megawatts</strong>
            </div>
            <input
              id="facility-mw"
              type="range"
              min={10}
              max={100}
              step={2}
              value={facilityMw}
              onChange={(e) => setFacilityMw(Number(e.target.value))}
            />
            <small>Approx. {(facilityMw * 1024).toLocaleString()} AI accelerator chips</small>
          </div>

          <div className="calc-input-group">
            <div className="input-header">
              <label htmlFor="tariff-kwh">Base Electricity Tariff</label>
              <strong>${tariffKwh.toFixed(3)} / kWh</strong>
            </div>
            <input
              id="tariff-kwh"
              type="range"
              min={0.04}
              max={0.20}
              step={0.005}
              value={tariffKwh}
              onChange={(e) => setTariffKwh(Number(e.target.value))}
            />
            <small>Regional industrial power rate</small>
          </div>

          <div className="calc-input-group">
            <div className="input-header">
              <label htmlFor="ratchet-rate">Demand Ratchet Penalty Rate</label>
              <strong>${ratchetRate} / kW-month</strong>
            </div>
            <input
              id="ratchet-rate"
              type="range"
              min={10}
              max={40}
              step={1}
              value={ratchetRate}
              onChange={(e) => setRatchetRate(Number(e.target.value))}
            />
            <small>11-month utility peak penalty charge</small>
          </div>

          <div className="calc-input-group">
            <div className="input-header">
              <label htmlFor="stall-hours">Average Daily Stall Downtime</label>
              <strong>{dailyStallHours.toFixed(1)} Hours / day</strong>
            </div>
            <input
              id="stall-hours"
              type="range"
              min={0.5}
              max={8.0}
              step={0.5}
              value={dailyStallHours}
              onChange={(e) => setDailyStallHours(Number(e.target.value))}
            />
            <small>Time cluster freezes waiting for node reboots</small>
          </div>

          <div className="calc-input-group">
            <div className="input-header">
              <label htmlFor="facility-pue">Facility PUE Overhead</label>
              <strong>{facilityPue.toFixed(2)} PUE</strong>
            </div>
            <input
              id="facility-pue"
              type="range"
              min={1.10}
              max={1.50}
              step={0.01}
              value={facilityPue}
              onChange={(e) => setFacilityPue(Number(e.target.value))}
            />
            <small>Cooling & electrical distribution efficiency</small>
          </div>
        </div>

        {/* Output Results Cards */}
        <div className="calc-outputs-grid">
          <div className="output-card output-base">
            <span className="output-label">TOTAL ANNUAL ELECTRIC BILL</span>
            <strong className="output-val">${(annualBaseElectricBill / 1_000_000).toFixed(2)} Million</strong>
            <p className="output-desc">Baseline annual utility expenditure at continuous full-throttle training.</p>
          </div>

          <div className="output-card output-danger">
            <span className="output-label">GHOST STALL ELECTRIC WASTE</span>
            <strong className="output-val text-danger">${Math.round(annualGhostElectricWaste).toLocaleString()} / yr</strong>
            <p className="output-desc">
              Raw cash paid to the utility for {ghostStallMw.toFixed(1)} MW of standby electricity burned while the cluster is stalled.
            </p>
          </div>

          <div className="output-card output-danger">
            <span className="output-label">UNMANAGED RATCHET RISK</span>
            <strong className="output-val text-danger">${Math.round(annualRatchetRisk).toLocaleString()} / yr</strong>
            <p className="output-desc">
              Potential 11-month billing penalty if simultaneous chip step-spikes trigger the utility demand ratchet.
            </p>
          </div>

          <div className="output-card output-highlight">
            <span className="output-label">ANNUAL POWER CAPITAL PROTECTED</span>
            <strong className="output-val text-ok">${Math.round(annualPowerProtected).toLocaleString()} / yr</strong>
            <p className="output-desc">
              Direct electricity savings and penalty avoidance delivered by TrainingContinuity's energy management.
            </p>
          </div>
        </div>

        <div className="calc-summary-takeaway">
          <strong>💡 Executive Financial Conclusion:</strong> For a {facilityMw} MW facility, eliminating ghost standby stalls and smoothing step-spikes protects over <strong>${Math.round(annualPowerProtected).toLocaleString()} every single year</strong> in utility cash flow—paying for continuity software in the first 45 days of operation.
        </div>
      </div>

      {/* 6. 24/7 HOURLY CARBON & ESG SCORECARD */}
      <div className="panel ppa-carbon-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Sustainability & ESG Compliance</span>
            <h2>24/7 Carbon Intensity & Clean Energy Matching Scorecard</h2>
          </div>
          <span className="carbon-badge">Scope 2 Market-Based Accounting</span>
        </div>
        <p className="muted">
          Enterprise AI tenants (such as Fortune 500 banks and healthcare providers) require verified carbon compliance.
          Here is how our facility energy mix scores:
        </p>

        <div className="carbon-grid">
          <div className="carbon-metric-card">
            <span className="c-label">Real-Time Carbon Intensity</span>
            <strong className="c-val">184 g CO₂ / kWh</strong>
            <p className="c-desc">Regional grid average: 412 g CO₂ / kWh. Our facility operates at <strong>55% below regional grid average</strong>.</p>
          </div>

          <div className="carbon-metric-card">
            <span className="c-label">Hourly Clean Energy Match (24/7 CFE)</span>
            <strong className="c-val text-ok">88.4% Matched</strong>
            <p className="c-desc">Direct matching of every megawatt consumed with local hydro, wind, and on-site solar storage.</p>
          </div>

          <div className="carbon-metric-card">
            <span className="c-label">Avoided Emissions from Fast Restarts</span>
            <strong className="c-val text-ok">1,420 Tons CO₂ / yr</strong>
            <p className="c-desc">Eliminating 2.5 hours of daily ghost stall power prevents burning 1,420 metric tons of carbon annually.</p>
          </div>
        </div>

        {/* Clean Energy Mix Breakdown Bar */}
        <div className="energy-mix-section">
          <h4>Facility Hourly Energy Generation Mix:</h4>
          <div className="energy-mix-bar">
            <div className="mix-segment mix-hydro" style={{ width: "42%" }} title="Hydroelectric: 42%">
              <span>Hydro (42%)</span>
            </div>
            <div className="mix-segment mix-nuclear" style={{ width: "31%" }} title="Zero-Carbon Nuclear: 31%">
              <span>Nuclear (31%)</span>
            </div>
            <div className="mix-segment mix-solar" style={{ width: "15.4%" }} title="Solar & BESS: 15.4%">
              <span>Solar/BESS (15.4%)</span>
            </div>
            <div className="mix-segment mix-gas" style={{ width: "11.6%" }} title="Natural Gas Peaker: 11.6%">
              <span>Gas (11.6%)</span>
            </div>
          </div>
          <div className="energy-mix-legend">
            <span>🔵 Hydroelectric: 42%</span>
            <span>🟣 Zero-Carbon Nuclear: 31%</span>
            <span>🟡 Solar & Battery Storage: 15.4%</span>
            <span>⚪ Regional Gas Peaker: 11.6%</span>
          </div>
        </div>
      </div>

      {/* 7. PRINTABLE PPA EXECUTIVE COMPLIANCE REPORT */}
      <div className="panel ppa-report-footer">
        <div className="report-footer-left">
          <strong>🖨️ Need a Monthly Power Report for Board Members or Utility Regulators?</strong>
          <p>
            Generate a clean, one-page executive power brief summarizing monthly megawatt draw, ratchet headroom, ghost stall waste, and carbon compliance.
          </p>
        </div>
        <button
          type="button"
          className="hero-primary-btn"
          onClick={() => window.print()}
        >
          🖨️ Print Executive PPA Scorecard
        </button>
      </div>
    </section>
  );
}
