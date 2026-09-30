import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { RunView } from "./api";

export interface GreenfieldBlueprint {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  chips: number;
  locationId: "virginia" | "texas" | "oregon" | "norway" | "custom";
  coolingId: "direct_liquid" | "immersion" | "rdhx" | "chilled_air";
  standbyRatio: "standby_0" | "standby_1" | "standby_2" | "standby_3";
  narrative: string;
}

export const BLUEPRINT_PRESETS: GreenfieldBlueprint[] = [
  {
    id: "virginia_hyperscale",
    name: "40 MW Virginia Hyperscale Workhorse",
    tagline: "The gold standard for frontier LLM 405B pretraining in Data Center Alley.",
    icon: "⚡",
    chips: 32768,
    locationId: "virginia",
    coolingId: "direct_liquid",
    standbyRatio: "standby_2",
    narrative:
      "Direct fiber adjacency to government and financial backbones. Liquid direct-to-chip cooling with 2% warm standbys and PPA ratchet-pacing shields against Dominion utility peak penalties.",
  },
  {
    id: "texas_desert",
    name: "80 MW Texas Wind/Solar AI Factory",
    tagline: "Ultra-low energy costs with active $75k/day ERCOT demand-response rewards.",
    icon: "🤠",
    chips: 65536,
    locationId: "texas",
    coolingId: "immersion",
    standbyRatio: "standby_2",
    narrative:
      "Submerged liquid immersion overcomes 102°F West Texas summer heat with zero water evaporation. Automated load shedding monetizes high-volatility grid peaks without interrupting training.",
  },
  {
    id: "oregon_hydro",
    name: "20 MW Clean Hydro Sanctuary",
    tagline: "100% renewable baseload hydro at $0.041/kWh with zero carbon tax exposure.",
    icon: "🌲",
    chips: 16384,
    locationId: "oregon",
    coolingId: "direct_liquid",
    standbyRatio: "standby_2",
    narrative:
      "Bonneville Power Administration hydro power with direct river cooling loop. Lowest electricity tariff in North America and zero carbon emissions intensity.",
  },
  {
    id: "norway_arctic",
    name: "20 MW Arctic Free-Cooling Exporter",
    tagline: "Year-round free-air cooling with municipal district heating export rebates.",
    icon: "❄️",
    chips: 16384,
    locationId: "norway",
    coolingId: "direct_liquid",
    standbyRatio: "standby_2",
    narrative:
      "Narvik Arctic fjord baseload hydro. Liquid heat exchangers capture datacenter waste heat and sell thermal energy to the local municipality, cutting effective energy costs to €0.040/kWh.",
  },
  {
    id: "modular_starter",
    name: "5 MW Fast-Track Modular Starter",
    tagline: "Rapid time-to-market modular pod for enterprise fine-tuning and inference.",
    icon: "🚀",
    chips: 4096,
    locationId: "virginia",
    coolingId: "rdhx",
    standbyRatio: "standby_1",
    narrative:
      "Prefabs and rear-door heat exchangers allow breaking ground and reaching full production in under 9 months with minimal upfront concrete civil works.",
  },
];

interface LocationConfig {
  id: "virginia" | "texas" | "oregon" | "norway" | "custom";
  name: string;
  flag: string;
  provider: string;
  tariffKwh: number;
  queueMonths: number;
  summerPeakTempC: number;
  pueDelta: number;
  carbonIntensity: number; // g CO2/kWh
  advantage: string;
  pavingWarning: string;
}

const LOCATION_OPTIONS: Record<string, LocationConfig> = {
  virginia: {
    id: "virginia",
    name: "Northern Virginia (Data Center Alley)",
    flag: "🇺🇸",
    provider: "Dominion Energy (PJM)",
    tariffKwh: 0.092,
    queueMonths: 36,
    summerPeakTempC: 32,
    pueDelta: 0.04,
    carbonIntensity: 240,
    advantage: "Lowest internet fiber latency to US East financial and enterprise clouds.",
    pavingWarning: "Strict 15-minute demand ratchet rules penalize un-paced cluster startups.",
  },
  texas: {
    id: "texas",
    name: "West Texas (Permian Basin)",
    flag: "🇺🇸",
    provider: "ERCOT West Grid",
    tariffKwh: 0.052,
    queueMonths: 14,
    summerPeakTempC: 39,
    pueDelta: 0.07,
    carbonIntensity: 190,
    advantage: "Abundant wind and solar; rapid 14-month substation interconnection queue.",
    pavingWarning: "Requires automated load shedding to avoid extreme $5,000/MWh summer spot price spikes.",
  },
  oregon: {
    id: "oregon",
    name: "Oregon Columbia River Basin",
    flag: "🇺🇸",
    provider: "Bonneville Power Admin (BPA)",
    tariffKwh: 0.041,
    queueMonths: 24,
    summerPeakTempC: 25,
    pueDelta: 0.01,
    carbonIntensity: 18,
    advantage: "100% renewable baseload run-of-river hydro; lowest electricity tariff in the US.",
    pavingWarning: "Requires water rights compliance for natural evaporative and river cooling loops.",
  },
  norway: {
    id: "norway",
    name: "Narvik, Northern Norway",
    flag: "🇳🇴",
    provider: "Statnett Arctic Hydro",
    tariffKwh: 0.052,
    queueMonths: 12,
    summerPeakTempC: 17,
    pueDelta: -0.02,
    carbonIntensity: 14,
    advantage: "Free-air cooling 330 days/year + Municipal district heating export rebates.",
    pavingWarning: "District heat export infrastructure requires dual-loop heat exchangers.",
  },
  custom: {
    id: "custom",
    name: "Custom / International Site",
    flag: "🌐",
    provider: "Independent Electric Utility",
    tariffKwh: 0.075,
    queueMonths: 20,
    summerPeakTempC: 30,
    pueDelta: 0.03,
    carbonIntensity: 150,
    advantage: "User-defined energy tariff and climate parameters for bespoke site evaluations.",
    pavingWarning: "Always verify local utility demand ratchet clauses and substation lead times.",
  },
};

interface CoolingConfig {
  id: "direct_liquid" | "immersion" | "rdhx" | "chilled_air";
  name: string;
  icon: string;
  basePue: number;
  costPerMw: number; // in USD
  densityKwPerRack: number;
  pros: string;
  cons: string;
}

const COOLING_OPTIONS: Record<string, CoolingConfig> = {
  direct_liquid: {
    id: "direct_liquid",
    name: "Direct-to-Chip Liquid Cooling (CDU Loop)",
    icon: "💧",
    basePue: 1.14,
    costPerMw: 850000,
    densityKwPerRack: 130,
    pros: "Warm water (45°C) eliminates expensive chillers; handles 1,000W+ processors cleanly.",
    cons: "Requires quick-disconnect dripless manifolds and rack-level coolant distribution units.",
  },
  immersion: {
    id: "immersion",
    name: "Full Liquid Immersion (Dielectric Fluid)",
    icon: "🧊",
    basePue: 1.06,
    costPerMw: 1450000,
    densityKwPerRack: 180,
    pros: "Industry-leading PUE (1.06); zero fan noise; zero water consumption in desert climates.",
    cons: "Higher upfront fluid CapEx; requires specialized crane hoists for server maintenance.",
  },
  rdhx: {
    id: "rdhx",
    name: "Rear-Door Heat Exchangers (RDHx)",
    icon: "🚪",
    basePue: 1.23,
    costPerMw: 620000,
    densityKwPerRack: 65,
    pros: "Lower upfront capital; installs directly onto standard 19-inch/21-inch rack doors.",
    cons: "Lower density limit (65 kW/rack); internal server fans must still run at moderate speeds.",
  },
  chilled_air: {
    id: "chilled_air",
    name: "Traditional Chilled-Water Air (Legacy)",
    icon: "💨",
    basePue: 1.38,
    costPerMw: 500000,
    densityKwPerRack: 35,
    pros: "Standard HVAC components available from multiple commercial contractors.",
    cons: "Heavy electrical parasitic drain ($2M+/yr extra power); risk of silicon thermal throttling.",
  },
};

interface StandbyConfig {
  id: "standby_0" | "standby_1" | "standby_2" | "standby_3";
  label: string;
  pct: number;
  mttrMinutes: number;
  saveStrategy: string;
  description: string;
  annualDowntimeHrs: number;
}

const STANDBY_OPTIONS: Record<string, StandbyConfig> = {
  standby_0: {
    id: "standby_0",
    label: "0% Spares (Legacy Datacenter)",
    pct: 0,
    mttrMinutes: 45,
    saveStrategy: "Standard shared storage (10 min saves; lose up to 1 hr work per crash)",
    description: "Manual technician triage. Every chip crash freezes the entire 32k cluster for 45 minutes ($114k/hr burn).",
    annualDowntimeHrs: 110,
  },
  standby_1: {
    id: "standby_1",
    label: "1% Warm Standby",
    pct: 1,
    mttrMinutes: 3.5,
    saveStrategy: "Fast local storage with basic automated restart",
    description: "1 warm spare per 100 chips. Reboots into spare node in 3.5 minutes.",
    annualDowntimeHrs: 14,
  },
  standby_2: {
    id: "standby_2",
    label: "2% Warm Standby (Recommended Frontier Standard)",
    pct: 2,
    mttrMinutes: 2.0,
    saveStrategy: "High-speed NVMe burst buffers + Preemptive thermal slope detection",
    description: "Automated 2-minute gang restart. Saves work before thermal trips and evicts dead silicon instantly.",
    annualDowntimeHrs: 4.8,
  },
  standby_3: {
    id: "standby_3",
    label: "3% Defense / Mission-Critical",
    pct: 3,
    mttrMinutes: 1.5,
    saveStrategy: "Redundant cross-spine burst buffers with sub-minute failover",
    description: "3 warm spares per 100 chips. Maximum possible resilience for non-stop multi-billion-parameter training runs.",
    annualDowntimeHrs: 3.2,
  },
};

const LOCATION_KEYS: Array<"virginia" | "texas" | "oregon" | "norway" | "custom"> = [
  "virginia",
  "texas",
  "oregon",
  "norway",
  "custom",
];

const COOLING_KEYS: Array<"direct_liquid" | "immersion" | "rdhx" | "chilled_air"> = [
  "direct_liquid",
  "immersion",
  "rdhx",
  "chilled_air",
];

const STANDBY_KEYS: Array<"standby_0" | "standby_1" | "standby_2" | "standby_3"> = [
  "standby_0",
  "standby_1",
  "standby_2",
  "standby_3",
];

export function GreenfieldPlannerView({ run }: { run: RunView | null }) {
  // Config state
  const [chips, setChips] = useState<number>(32768);
  const [locationId, setLocationId] = useState<"virginia" | "texas" | "oregon" | "norway" | "custom">("virginia");
  const [coolingId, setCoolingId] = useState<"direct_liquid" | "immersion" | "rdhx" | "chilled_air">("direct_liquid");
  const [standbyRatio, setStandbyRatio] = useState<"standby_0" | "standby_1" | "standby_2" | "standby_3">("standby_2");

  // Custom location overrides
  const [customTariff, setCustomTariff] = useState<number>(0.075);
  const [customTemp, setCustomTemp] = useState<number>(30);
  const [customQueue, setCustomQueue] = useState<number>(20);

  // Active Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("virginia_hyperscale");

  // Memoized calculations
  const location = useMemo(() => {
    if (locationId === "custom") {
      return {
        ...LOCATION_OPTIONS.custom,
        tariffKwh: customTariff,
        summerPeakTempC: customTemp,
        queueMonths: customQueue,
      };
    }
    return LOCATION_OPTIONS[locationId];
  }, [locationId, customTariff, customTemp, customQueue]);

  const cooling = useMemo(() => COOLING_OPTIONS[coolingId], [coolingId]);
  const standby = useMemo(() => STANDBY_OPTIONS[standbyRatio], [standbyRatio]);

  const financialModel = useMemo(() => {
    // 1. Hardware & Physical Sizing
    const rackCount = Math.ceil(chips / 128); // 128 accelerators per 48U rack
    const warmSparesCount = Math.round((chips * standby.pct) / 100);
    const totalChips = chips + warmSparesCount;

    // 2. Power Metrics
    // 800W chip + memory + PCIe/OAM + motherboard = ~1,150W IT load per accelerator slice
    const itLoadKw = totalChips * 1.15;
    const itLoadMw = itLoadKw / 1000;
    const effectivePue = Math.max(1.04, Number((cooling.basePue + location.pueDelta).toFixed(2)));
    const totalFacilityPowerMw = Number((itLoadMw * effectivePue).toFixed(1));

    // 3. Upfront CapEx Breakdown ($)
    const siliconCapEx = chips * 35000; // $35k per top-tier AI accelerator
    const standbySiliconCapEx = warmSparesCount * 35000;
    const serversAndNetworkingCapEx = rackCount * 125000; // InfiniBand switches, optical cabling, chassis
    const coolingPlantCapEx = totalFacilityPowerMw * cooling.costPerMw;
    const electricalSubstationCapEx = totalFacilityPowerMw * 980000; // Transformers, switchgear, 2N UPS
    const buildingShellAndLandCapEx = rackCount * 68000; // Land, physical shell, fire suppression, security

    const totalCapEx =
      siliconCapEx +
      standbySiliconCapEx +
      serversAndNetworkingCapEx +
      coolingPlantCapEx +
      electricalSubstationCapEx +
      buildingShellAndLandCapEx;

    const capexPerMw = totalFacilityPowerMw > 0 ? totalCapEx / totalFacilityPowerMw : 0;

    // 4. Monthly OpEx & Energy ($/mo)
    const monthlyHours = 730;
    const monthlyKwh = totalFacilityPowerMw * 1000 * monthlyHours;
    // Norway discount for district heating export rebate
    const effectiveTariff = location.id === "norway" ? Math.max(0.01, location.tariffKwh - 0.008) : location.tariffKwh;
    const monthlyPowerBill = monthlyKwh * effectiveTariff;
    const monthlyCoolingOverheadCost = (monthlyKwh * (effectivePue - 1.0) / effectivePue) * effectiveTariff;
    const monthlyMaintenance = (totalCapEx * 0.038) / 12; // 3.8% annual hardware & facility maintenance
    const monthlyStaffingAndSecurity = 75000 + rackCount * 320; // 24/7 site operations staff

    const totalMonthlyOpEx = monthlyPowerBill + monthlyMaintenance + monthlyStaffingAndSecurity;
    const costPerGpuHour = totalMonthlyOpEx / (chips * monthlyHours);

    // 5. Continuity Shield ROI
    // Modern accelerator FIT rates: ~4.5 hardware incidents per 1,000 chips per year
    const annualHardwareIncidents = Math.max(1, Math.round(chips * 0.0045));
    // Hourly cluster stall burn rate: capital amortization + active power bill + opportunity cost
    const clusterCapitalDeprecPerHour = totalCapEx / (3 * 8760); // 3-year depreciation
    const clusterStallBurnPerHour = clusterCapitalDeprecPerHour + monthlyPowerBill / monthlyHours + 25000;

    // Legacy without continuity (0% spares, 45 min MTTR, unverified checkpoints)
    const legacyDowntimeHours = annualHardwareIncidents * (45 / 60);
    const legacyStallBurnLoss = legacyDowntimeHours * clusterStallBurnPerHour;
    // ~15% of uncoordinated crashes cause rollback of unsaved progress (~1.5 hours of work lost)
    const legacyUnsavedWorkLoss = annualHardwareIncidents * 0.15 * (1.5 * clusterStallBurnPerHour);
    const totalLegacyAnnualLoss = legacyStallBurnLoss + legacyUnsavedWorkLoss;

    // With Continuity Shield (warm standbys, 2 min MTTR, micro-saves before thermal trip)
    const continuityDowntimeHours = annualHardwareIncidents * (standby.mttrMinutes / 60);
    const continuityStallLoss = continuityDowntimeHours * clusterStallBurnPerHour;
    const continuityUnsavedWorkLoss = 0; // Preemptive save prevents work loss
    const totalContinuityAnnualLoss = continuityStallLoss + continuityUnsavedWorkLoss;

    const netAnnualCapitalSaved = Math.max(0, totalLegacyAnnualLoss - totalContinuityAnnualLoss);
    const continuityInvestment = standbySiliconCapEx + totalFacilityPowerMw * 45000;
    const paybackMonths = netAnnualCapitalSaved > 0 ? (continuityInvestment / netAnnualCapitalSaved) * 12 : 0;

    return {
      rackCount,
      warmSparesCount,
      totalChips,
      itLoadMw,
      effectivePue,
      totalFacilityPowerMw,
      siliconCapEx,
      standbySiliconCapEx,
      serversAndNetworkingCapEx,
      coolingPlantCapEx,
      electricalSubstationCapEx,
      buildingShellAndLandCapEx,
      totalCapEx,
      capexPerMw,
      monthlyKwh,
      effectiveTariff,
      monthlyPowerBill,
      monthlyCoolingOverheadCost,
      monthlyMaintenance,
      monthlyStaffingAndSecurity,
      totalMonthlyOpEx,
      costPerGpuHour,
      annualHardwareIncidents,
      clusterStallBurnPerHour,
      legacyDowntimeHours,
      totalLegacyAnnualLoss,
      continuityDowntimeHours,
      totalContinuityAnnualLoss,
      netAnnualCapitalSaved,
      continuityInvestment,
      paybackMonths,
    };
  }, [chips, location, cooling, standby]);

  function applyBlueprint(bp: GreenfieldBlueprint) {
    setSelectedBlueprintId(bp.id);
    setChips(bp.chips);
    setLocationId(bp.locationId);
    setCoolingId(bp.coolingId);
    setStandbyRatio(bp.standbyRatio);
  }

  function handlePrintProForma() {
    window.print();
  }

  return (
    <div className="planner-container">
      {/* 1. EXECUTIVE HERO BANNER */}
      <header className="portfolio-hero">
        <div className="portfolio-hero-left">
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="executive-badge">GREENFIELD ARCHITECTURE WIZARD</span>
            <div className="portfolio-live-chip-status">
              <span>Target Sizing: <strong>{chips.toLocaleString()} Accelerators ({financialModel.totalFacilityPowerMw} MW)</strong></span>
              <span>· Grid: <strong>{location.name}</strong></span>
              <span>· Status: <strong className="text-ok">Ready to Size</strong></span>
            </div>
          </div>
          <h1 className="portfolio-title">
            Build-Your-Own Datacenter: Capital & Infrastructure Planner
          </h1>
          <p className="portfolio-subtitle">
            Planning a new hyperscale AI datacenter from bare earth? Model your total upfront CapEx, monthly utility power bills,
            cooling efficiency (PUE), warm standby spares, and multi-million-dollar Baton return on investment before pouring concrete.
          </p>

          <div className="portfolio-hero-actions">
            <button type="button" className="hero-primary-btn" onClick={handlePrintProForma}>
              🖨️ Print / Save Pro-Forma Term Sheet (PDF)
            </button>
            <NavLink to="/fleet" className="hero-secondary-btn" style={{ textDecoration: "none" }}>
              🌐 Global Fleet Console (131k)
            </NavLink>
            <NavLink to="/grid" className="hero-secondary-btn" style={{ textDecoration: "none" }}>
              ⚡ Utility Grid & PPA Scorecard
            </NavLink>
            <NavLink to="/desk" className="hero-secondary-btn" style={{ textDecoration: "none" }}>
              ⚡ Live Practice Floor (32k Simulator)
            </NavLink>
          </div>
        </div>
      </header>

      {/* 2. TOP BLUEPRINT PRESETS */}
      <section className="planner-blueprints-section">
        <div className="section-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="eyebrow">Instant Architecture Blueprints</span>
              <h2>Select a Proven Industry Archetype</h2>
              <p className="muted">
                Pre-configured capital and power architectures matched to real-world utility grids, tariffs, and climate profiles.
              </p>
            </div>
            <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              Or configure custom parameters below ↓
            </span>
          </div>
        </div>

        <div className="blueprints-grid">
          {BLUEPRINT_PRESETS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <div
                key={bp.id}
                className={`blueprint-card ${isSelected ? "selected" : ""}`}
                onClick={() => applyBlueprint(bp)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    applyBlueprint(bp);
                  }
                }}
              >
                <div className="blueprint-top">
                  <span className="bp-icon">{bp.icon}</span>
                  {isSelected ? <span className="bp-active-tag">ACTIVE BLUEPRINT</span> : null}
                </div>
                <h3 className="bp-name">{bp.name}</h3>
                <p className="bp-tagline">{bp.tagline}</p>
                <div className="bp-spec-row">
                  <span><strong>{bp.chips.toLocaleString()}</strong> Chips</span>
                  <span>·</span>
                  <span>{LOCATION_OPTIONS[bp.locationId].provider.split(" ")[0]}</span>
                  <span>·</span>
                  <span>{COOLING_OPTIONS[bp.coolingId].name.split(" ")[0]}</span>
                </div>
                <p className="bp-narrative">{bp.narrative}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE 4-STEP CONFIGURATOR */}
      <section className="planner-config-section">
        <div className="section-head">
          <span className="eyebrow">Interactive Sizing Controls</span>
          <h2>Customize Your Physical & Financial Parameters</h2>
          <p className="muted">Adjust scale, electric grid, thermal cooling, and Baton standby redundancy in real time.</p>
        </div>

        <div className="planner-steps-grid">
          {/* Step 1: Compute Target Scale */}
          <div className="planner-step-box">
            <div className="step-badge">STEP 1</div>
            <h3>Compute Target Scale & Accelerators</h3>
            <p className="step-desc">Select target accelerator scale or use the slider for custom capacity.</p>

            <div className="chips-preset-buttons">
              {[
                { count: 4096, label: "4,096 Chips (5 MW)" },
                { count: 16384, label: "16,384 Chips (20 MW)" },
                { count: 32768, label: "32,768 Chips (40 MW)" },
                { count: 65536, label: "65,536 Chips (80 MW)" },
                { count: 131072, label: "131,072 Chips (160 MW)" },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  className={`scale-preset-btn ${chips === item.count ? "active" : ""}`}
                  onClick={() => {
                    setChips(item.count);
                    setSelectedBlueprintId("");
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="slider-wrapper" style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                <span>Custom Accelerator Sizing:</span>
                <strong style={{ color: "#38bdf8" }}>{chips.toLocaleString()} Chips ({financialModel.rackCount} Racks)</strong>
              </div>
              <input
                type="range"
                min={1024}
                max={131072}
                step={1024}
                value={chips}
                onChange={(e) => {
                  setChips(Number(e.target.value));
                  setSelectedBlueprintId("");
                }}
                className="planner-range-slider"
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                <span>1,024 (1 MW)</span>
                <span>32,768 (40 MW Workhorse)</span>
                <span>131,072 (160 MW Megasite)</span>
              </div>
            </div>

            <div className="step-insight-callout">
              <strong>💡 Hardware Geometry:</strong> {chips.toLocaleString()} compute accelerators require{" "}
              <strong>{financialModel.rackCount.toLocaleString()} liquid-cooled 48U server racks</strong>, drawing{" "}
              <strong>{financialModel.itLoadMw.toFixed(1)} MW</strong> of pure compute power before facility cooling overhead.
            </div>
          </div>

          {/* Step 2: Utility Grid Location */}
          <div className="planner-step-box">
            <div className="step-badge">STEP 2</div>
            <h3>Electric Utility Grid & Climate Zone</h3>
            <p className="step-desc">Electric tariffs, queue timelines, and ambient summer temperatures dictate OpEx.</p>

            <div className="location-options-list">
              {LOCATION_KEYS.map((key) => {
                const loc = LOCATION_OPTIONS[key];
                const isSelected = locationId === key;
                return (
                  <div
                    key={key}
                    className={`loc-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setLocationId(key);
                      setSelectedBlueprintId("");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLocationId(key);
                        setSelectedBlueprintId("");
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>
                        {loc.flag} {loc.name}
                      </strong>
                      <span className="loc-tariff">
                        ${loc.id === "custom" ? customTariff.toFixed(3) : loc.tariffKwh.toFixed(3)} / kWh
                      </span>
                    </div>
                    <div className="loc-meta">
                      <span>{loc.provider}</span> · <span>Interconnect: {loc.id === "custom" ? customQueue : loc.queueMonths} mo</span> ·{" "}
                      <span>Summer Peak: {loc.id === "custom" ? customTemp : loc.summerPeakTempC}°C</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {locationId === "custom" ? (
              <div className="custom-sliders-box">
                <label>
                  <span>Custom Tariff: <strong>${customTariff.toFixed(3)}/kWh</strong></span>
                  <input
                    type="range"
                    min={0.02}
                    max={0.2}
                    step={0.005}
                    value={customTariff}
                    onChange={(e) => setCustomTariff(Number(e.target.value))}
                  />
                </label>
                <label>
                  <span>Summer Peak Temp: <strong>{customTemp}°C</strong></span>
                  <input
                    type="range"
                    min={15}
                    max={48}
                    step={1}
                    value={customTemp}
                    onChange={(e) => setCustomTemp(Number(e.target.value))}
                  />
                </label>
                <label>
                  <span>Substation Interconnect Queue: <strong>{customQueue} months</strong></span>
                  <input
                    type="range"
                    min={6}
                    max={48}
                    step={1}
                    value={customQueue}
                    onChange={(e) => setCustomQueue(Number(e.target.value))}
                  />
                </label>
              </div>
            ) : null}

            <div className="step-insight-callout">
              <strong>⚡ Grid Reality:</strong> {location.advantage} {location.pavingWarning}
            </div>
          </div>

          {/* Step 3: Cooling Technology */}
          <div className="planner-step-box">
            <div className="step-badge">STEP 3</div>
            <h3>Cooling Technology & Efficiency (PUE)</h3>
            <p className="step-desc">Determines how many extra megawatts of electric power are consumed just to reject heat.</p>

            <div className="cooling-options-list">
              {COOLING_KEYS.map((key) => {
                const cool = COOLING_OPTIONS[key];
                const isSelected = coolingId === key;
                return (
                  <div
                    key={key}
                    className={`cooling-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setCoolingId(key);
                      setSelectedBlueprintId("");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCoolingId(key);
                        setSelectedBlueprintId("");
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>
                        {cool.icon} {cool.name}
                      </strong>
                      <span className="cooling-pue-badge">
                        Base PUE {(cool.basePue + location.pueDelta).toFixed(2)}
                      </span>
                    </div>
                    <div className="cooling-meta">
                      <span>CapEx: ${(cool.costPerMw / 1000).toLocaleString()}k/MW</span> ·{" "}
                      <span>Rack Density: up to {cool.densityKwPerRack} kW</span>
                    </div>
                    <p className="cooling-desc">{cool.pros}</p>
                  </div>
                );
              })}
            </div>

            <div className="step-insight-callout">
              <strong>💧 Thermal Reality:</strong> At <strong>{financialModel.effectivePue} PUE</strong>, the cooling system consumes{" "}
              <strong>{(financialModel.totalFacilityPowerMw - financialModel.itLoadMw).toFixed(1)} MW</strong> of electrical power ($
              {(financialModel.monthlyCoolingOverheadCost / 1000).toFixed(0)}k/mo) just to pump and chill water.
            </div>
          </div>

          {/* Step 4: Baton Redundancy */}
          <div className="planner-step-box">
            <div className="step-badge">STEP 4</div>
            <h3>Baton Redundancy & Warm Standby Ratio</h3>
            <p className="step-desc">
              When 1 processor crashes, does the $150M datacenter wait 45 minutes for a technician, or failover in 2 minutes?
            </p>

            <div className="standby-options-list">
              {STANDBY_KEYS.map((key) => {
                const st = STANDBY_OPTIONS[key];
                const isSelected = standbyRatio === key;
                return (
                  <div
                    key={key}
                    className={`standby-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setStandbyRatio(key);
                      setSelectedBlueprintId("");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setStandbyRatio(key);
                        setSelectedBlueprintId("");
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{st.label}</strong>
                      <span className={`standby-mttr-badge ${st.pct > 0 ? "fast" : "slow"}`}>
                        {st.mttrMinutes} min MTTR
                      </span>
                    </div>
                    <p className="standby-desc">{st.description}</p>
                    <div className="standby-save-tag">
                      <span>Checkpointing:</span> {st.saveStrategy}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="step-insight-callout">
              <strong>🛡️ Baton Shield:</strong> Reserving{" "}
              <strong>{financialModel.warmSparesCount.toLocaleString()} warm spares</strong> ({standby.pct}%) cuts annual downtime from{" "}
              <strong>{financialModel.legacyDowntimeHours.toFixed(0)} hours</strong> down to{" "}
              <strong>{financialModel.continuityDowntimeHours.toFixed(1)} hours</strong>.
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME PRO-FORMA FINANCIAL HUD */}
      <section className="proforma-hud-section">
        <div className="section-head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="eyebrow">Real-Time Economic Engine</span>
              <h2>Projected Financial Pro-Forma & ROI Summary</h2>
              <p className="muted">
                Calculated dynamically from physical bills of materials, utility tariffs, and hardware failure rates.
              </p>
            </div>
            <button type="button" className="hero-secondary-btn" onClick={handlePrintProForma}>
              🖨️ Export PDF Term Sheet
            </button>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="proforma-kpi-grid">
          <div className="proforma-kpi-card">
            <span className="kpi-label">TOTAL UPFRONT CAPEX</span>
            <strong className="kpi-val text-accent">
              ${(financialModel.totalCapEx / 1000000).toFixed(1)} Million
            </strong>
            <span className="kpi-sub">
              ${(financialModel.capexPerMw / 1000000).toFixed(2)}M / MW ({financialModel.totalFacilityPowerMw} MW Substation)
            </span>
          </div>

          <div className="proforma-kpi-card">
            <span className="kpi-label">MONTHLY OPEX & POWER</span>
            <strong className="kpi-val text-warn">
              ${(financialModel.totalMonthlyOpEx / 1000000).toFixed(2)} Million / mo
            </strong>
            <span className="kpi-sub">
              ${financialModel.costPerGpuHour.toFixed(2)} / GPU Hour (All-in TCO)
            </span>
          </div>

          <div className="proforma-kpi-card">
            <span className="kpi-label">HOURLY STALL BURN RISK</span>
            <strong className="kpi-val text-danger">
              ${Math.round(financialModel.clusterStallBurnPerHour).toLocaleString()} / hr
            </strong>
            <span className="kpi-sub">
              Cash lost every hour all {chips.toLocaleString()} chips sit idle waiting
            </span>
          </div>

          <div className="proforma-kpi-card">
            <span className="kpi-label">ANNUAL BATON SAVINGS</span>
            <strong className="kpi-val text-ok">
              +${(financialModel.netAnnualCapitalSaved / 1000000).toFixed(2)} Million / yr
            </strong>
            <span className="kpi-sub">
              Payback period: {financialModel.paybackMonths < 1 ? "< 1 month" : `${financialModel.paybackMonths.toFixed(1)} months`}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown Columns */}
        <div className="proforma-details-grid">
          {/* Column A: Upfront CapEx Schedule */}
          <div className="proforma-col-box">
            <h3>🏗️ Upfront CapEx Sources & Uses</h3>
            <table className="proforma-table">
              <tbody>
                <tr>
                  <td>Primary Silicon ({chips.toLocaleString()} Accelerators)</td>
                  <td className="text-right">${(financialModel.siliconCapEx / 1000000).toFixed(1)}M</td>
                </tr>
                <tr>
                  <td>Warm Standby Silicon ({financialModel.warmSparesCount.toLocaleString()} Spares)</td>
                  <td className="text-right">${(financialModel.standbySiliconCapEx / 1000000).toFixed(1)}M</td>
                </tr>
                <tr>
                  <td>Server Chassis, InfiniBand & Optics ({financialModel.rackCount} Racks)</td>
                  <td className="text-right">${(financialModel.serversAndNetworkingCapEx / 1000000).toFixed(1)}M</td>
                </tr>
                <tr>
                  <td>Liquid Cooling Infrastructure ({cooling.name.split(" ")[0]})</td>
                  <td className="text-right">${(financialModel.coolingPlantCapEx / 1000000).toFixed(1)}M</td>
                </tr>
                <tr>
                  <td>Electrical Substation & Switchgear ({financialModel.totalFacilityPowerMw} MW)</td>
                  <td className="text-right">${(financialModel.electricalSubstationCapEx / 1000000).toFixed(1)}M</td>
                </tr>
                <tr>
                  <td>Building Shell, Security & Land Civil Works</td>
                  <td className="text-right">${(financialModel.buildingShellAndLandCapEx / 1000000).toFixed(1)}M</td>
                </tr>
                <tr className="proforma-total-row">
                  <td><strong>TOTAL ESTIMATED CAPITAL EXPENDITURE</strong></td>
                  <td className="text-right"><strong>${(financialModel.totalCapEx / 1000000).toFixed(1)}M</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column B: Monthly OpEx Schedule */}
          <div className="proforma-col-box">
            <h3>⚡ Monthly Recurring OpEx Schedule</h3>
            <table className="proforma-table">
              <tbody>
                <tr>
                  <td>Active Compute Electricity ({financialModel.itLoadMw.toFixed(1)} MW IT Draw)</td>
                  <td className="text-right">
                    ${((financialModel.monthlyPowerBill - financialModel.monthlyCoolingOverheadCost) / 1000000).toFixed(2)}M
                  </td>
                </tr>
                <tr>
                  <td>Cooling Plant Electricity Overhead (PUE {financialModel.effectivePue})</td>
                  <td className="text-right">${(financialModel.monthlyCoolingOverheadCost / 1000000).toFixed(2)}M</td>
                </tr>
                <tr>
                  <td>Hardware Maintenance & Spares Replenishment</td>
                  <td className="text-right">${(financialModel.monthlyMaintenance / 1000000).toFixed(2)}M</td>
                </tr>
                <tr>
                  <td>Site Engineering, Security & Facility Operations</td>
                  <td className="text-right">${(financialModel.monthlyStaffingAndSecurity / 1000).toFixed(0)}k</td>
                </tr>
                <tr className="proforma-total-row">
                  <td><strong>TOTAL MONTHLY OPERATING EXPENSE</strong></td>
                  <td className="text-right"><strong>${(financialModel.totalMonthlyOpEx / 1000000).toFixed(2)}M / mo</strong></td>
                </tr>
                <tr>
                  <td><strong>Blended Cost per GPU Hour</strong></td>
                  <td className="text-right text-accent"><strong>${financialModel.costPerGpuHour.toFixed(2)} / hr</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column C: Baton Shield ROI */}
          <div className="proforma-col-box highlight-shield">
            <h3>🛡️ Baton Shield Financial ROI</h3>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
              Projected based on {financialModel.annualHardwareIncidents} expected annual hardware incidents across {chips.toLocaleString()} accelerators.
            </p>
            <table className="proforma-table">
              <tbody>
                <tr>
                  <td>Status Quo Annual Stall Loss (0% Spares, 45m MTTR)</td>
                  <td className="text-right text-danger">-${(financialModel.totalLegacyAnnualLoss / 1000000).toFixed(2)}M / yr</td>
                </tr>
                <tr>
                  <td>With Baton Shield ({standby.pct}% Spares, 2m MTTR)</td>
                  <td className="text-right text-accent">-${(financialModel.totalContinuityAnnualLoss / 1000000).toFixed(2)}M / yr</td>
                </tr>
                <tr>
                  <td>Preemptive Save Progress Rescued</td>
                  <td className="text-right text-ok">Up to 90% Protected</td>
                </tr>
                <tr className="proforma-total-row">
                  <td><strong>NET CAPITAL PROTECTED PER YEAR</strong></td>
                  <td className="text-right text-ok"><strong>+${(financialModel.netAnnualCapitalSaved / 1000000).toFixed(2)}M / yr</strong></td>
                </tr>
                <tr>
                  <td><strong>Baton Investment Payback</strong></td>
                  <td className="text-right text-ok">
                    <strong>{financialModel.paybackMonths < 1 ? "< 30 Days" : `${financialModel.paybackMonths.toFixed(1)} Months`}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. PRINTABLE 1-PAGE TERM SHEET FOR BANKS & INVESTORS */}
      <section className="printable-term-sheet panel" id="printable-memo">
        <div className="term-sheet-header">
          <div>
            <span className="memo-tag">CONFIDENTIAL · FOR INVESTMENT COMMITTEE / BANK SYNDICATION</span>
            <h2>HYPERSCALE AI DATACENTER CAPITAL & BATON TERM SHEET</h2>
            <p className="muted">
              Project Specification: <strong>{chips.toLocaleString()} Accelerators</strong> ·{" "}
              <strong>{financialModel.totalFacilityPowerMw} MW Grid Interconnect</strong> ·{" "}
              <strong>{location.name}</strong>
            </p>
          </div>
          <button type="button" className="hero-primary-btn no-print" onClick={handlePrintProForma}>
            🖨️ Print Term Sheet
          </button>
        </div>

        <div className="term-sheet-body">
          <div className="term-sheet-summary-row">
            <div>
              <span className="ts-label">Total Upfront CapEx</span>
              <strong className="ts-val">${(financialModel.totalCapEx / 1000000).toFixed(1)}M</strong>
            </div>
            <div>
              <span className="ts-label">Substation Power</span>
              <strong className="ts-val">{financialModel.totalFacilityPowerMw} MW</strong>
            </div>
            <div>
              <span className="ts-label">Cooling Design PUE</span>
              <strong className="ts-val">{financialModel.effectivePue}</strong>
            </div>
            <div>
              <span className="ts-label">Base Electric Tariff</span>
              <strong className="ts-val">${financialModel.effectiveTariff.toFixed(3)} / kWh</strong>
            </div>
            <div>
              <span className="ts-label">Monthly Power Bill</span>
              <strong className="ts-val">${(financialModel.monthlyPowerBill / 1000000).toFixed(2)}M / mo</strong>
            </div>
            <div>
              <span className="ts-label">Baton Net ROI</span>
              <strong className="ts-val text-ok">+${(financialModel.netAnnualCapitalSaved / 1000000).toFixed(1)}M / yr</strong>
            </div>
          </div>

          <div className="term-sheet-narrative">
            <h4>Executive Investment Recommendation</h4>
            <p>
              The proposed <strong>{chips.toLocaleString()}-accelerator datacenter project</strong> in{" "}
              <strong>{location.name}</strong> achieves full capital deployment at an estimated{" "}
              <strong>${(financialModel.totalCapEx / 1000000).toFixed(1)} Million</strong> ($
              {(financialModel.capexPerMw / 1000000).toFixed(2)}M per MW). Incorporating{" "}
              <strong>{cooling.name}</strong> maintains a high-efficiency <strong>{financialModel.effectivePue} PUE</strong>, yielding an
              all-in electricity cost of <strong>${financialModel.effectiveTariff.toFixed(3)} / kWh</strong>.
            </p>
            <p>
              Crucially, by allocating <strong>{standby.pct}% warm unassigned standby accelerators</strong> (
              {financialModel.warmSparesCount} nodes) with preemptive thermal slope micro-saving, the facility mitigates the catastrophic{" "}
              <strong>${Math.round(financialModel.clusterStallBurnPerHour).toLocaleString()}/hr</strong> cluster stall burn that plagues legacy datacenters.
              This Baton architecture preserves an estimated{" "}
              <strong>${(financialModel.netAnnualCapitalSaved / 1000000).toFixed(2)} Million per year</strong> in eliminated idle waste,
              delivering a full software and standby capital payback in{" "}
              <strong>{financialModel.paybackMonths < 1 ? "< 1 month" : `${financialModel.paybackMonths.toFixed(1)} months`}</strong>.
            </p>
          </div>
        </div>

        <div className="term-sheet-footer">
          <span>Prepared by Baton Greenfield Architecture Engine</span>
          <span>Simulation Status: {run?.status ?? "Verified Pro-Forma"} · 100% Non-Dispute Infrastructure Ops</span>
        </div>
      </section>

      {/* 6. BOTTOM NAVIGATION CTA */}
      <section className="portfolio-bottom-cta panel">
        <div>
          <h2>Test Your Architecture Against Live Hardware Crises</h2>
          <p>
            Now that you have sized your datacenter, verify how your 32,768-chip cluster responds to real-time thermal spikes, power sags,
            and gang restarts on the Live Practice Floor.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <NavLink to="/desk" className="hero-primary-btn" style={{ textDecoration: "none" }}>
            ⚡ Launch Live 32k Practice Floor
          </NavLink>
          <NavLink to="/fleet" className="hero-secondary-btn" style={{ textDecoration: "none" }}>
            🌐 Inspect 4-Campus Global Fleet
          </NavLink>
        </div>
      </section>
    </div>
  );
}
