import { useState } from "react";
import { RunView } from "./api";

interface LifecycleStageData {
  stageNumber: number;
  stageName: string;
  tierLabel: string;
  facility: string;
  timestamp: string;
  status: "pass" | "fail" | "warning";
  parameters: {
    label: string;
    value: string;
    spec: string;
    isOutOfSpec?: boolean;
  }[];
  verdictNote: string;
}

interface ChipPassport {
  chipId: string;
  ecid: string;
  serialNumber: string;
  currentLocation: string;
  healthStatus: "flagged_assembly_defect" | "golden" | "cordoned_sibling" | "operational";
  liabilityTier: "ODM Baseboard Assembly" | "Foundry Fab" | "OSAT Packaging" | "Datacenter Ops" | "None (Golden)";
  stages: LifecycleStageData[];
}

const CHIP_PASSPORTS: Record<string, ChipPassport> = {
  "gpu-r0-h0-d1": {
    chipId: "gpu-r0-h0-d1",
    ecid: "0x8FA2_B390_E441_9901",
    serialNumber: "SN-H200-N3E-98042",
    currentLocation: "Rack #0, Host #0, Socket #1",
    healthStatus: "flagged_assembly_defect",
    liabilityTier: "ODM Baseboard Assembly",
    stages: [
      {
        stageNumber: 1,
        stageName: "Foundry Wafer Sort (WAT/CP)",
        tierLabel: "Tier 1: Silicon Fab",
        facility: "Fab 18 (N3E Gate-All-Around)",
        timestamp: "2025-11-12 04:22:10 UTC",
        status: "pass",
        parameters: [
          { label: "Wafer Lot ID", value: "TSMC-N3E-LOT-4419", spec: "Certified" },
          { label: "Wafer ID & Coordinates", value: "W-9042-07 (X: 112, Y: 184)", spec: "Radius 42mm (Core Ring 1)" },
          { label: "Factory Vmin", value: "680 mV", spec: "680 - 720 mV Nominal" },
          { label: "IDDQ Static Leakage", value: "14.2 mA", spec: "12.0 - 18.0 mA Nominal" },
        ],
        verdictNote: "Golden Silicon: Wafer probe electrical tests 100% nominal. Zero gate-oxide or transistor defects detected.",
      },
      {
        stageNumber: 2,
        stageName: "2.5D Packaging (CoWoS-S)",
        tierLabel: "Tier 2: OSAT Assembly",
        facility: "Advanced Packaging Facility #3",
        timestamp: "2025-11-28 16:45:00 UTC",
        status: "pass",
        parameters: [
          { label: "Interposer ID", value: "INT-2.5D-410-09", spec: "8x HBM3e Sites" },
          { label: "Microbump Pitch", value: "35 μm", spec: "Nominal" },
          { label: "Solder Void Ratio", value: "0.012%", spec: "< 0.050% Max Allowed" },
          { label: "Underfill Integrity", value: "Acoustic Scan 100% Void-Free", spec: "100% Coverage" },
        ],
        verdictNote: "Packaging Nominal: High-density microbump arrays and 8 HBM3e stacks verified via acoustic microscopy.",
      },
      {
        stageNumber: 3,
        stageName: "System-Level Test (SLT Class Test)",
        tierLabel: "Tier 3: Test House",
        facility: "Automated SLT Cell Alpha",
        timestamp: "2025-12-05 09:12:30 UTC",
        status: "pass",
        parameters: [
          { label: "Corner Stress Range", value: "-10°C to +105°C", spec: "Full AEC-Q100 Spec" },
          { label: "Maximum Clock Margin", value: "2,650 MHz", spec: "Bin 1 Gold Rating" },
          { label: "HBM3e Bandwidth", value: "4.8 TB/s", spec: "> 4.6 TB/s Floor" },
          { label: "Hardware Fuse Register", value: "0xFF12_4490 (Blown & Locked)", spec: "Immutable ECID" },
        ],
        verdictNote: "SLT Certified: Speed bin classified as Bin 1 Gold with full clock margins across both thermal corners.",
      },
      {
        stageNumber: 4,
        stageName: "ODM Baseboard SMT & Cold Plate Mount",
        tierLabel: "Tier 4: ODM Baseboard Integrator",
        facility: "ODM Precision SMT Line B (Batch #8810)",
        timestamp: "2025-12-18 14:02:18 UTC",
        status: "fail",
        parameters: [
          { label: "SMT Assembly Line", value: "Foxconn Line B, Shift 2", spec: "SMT Standard" },
          { label: "Cold Plate Screw Torque", value: "185 cN·m", spec: "140 ± 10 cN·m Spec", isOutOfSpec: true },
          { label: "Measured PCB Strain", value: "380 με", spec: "< 200 με Safe Threshold", isOutOfSpec: true },
          { label: "TIM Bondline Thickness", value: "21 μm", spec: "35 - 50 μm Nominal", isOutOfSpec: true },
        ],
        verdictNote: "CRITICAL ASSEMBLY DEFECT: Pneumatic torque driver out of calibration. 185 cN·m over-torque induced 380 microstrain flexure under Socket 2, pre-stressing HBM channel 3 solder balls!",
      },
      {
        stageNumber: 5,
        stageName: "System L10/L11 Rack Integration",
        tierLabel: "Tier 5: System Integrator",
        facility: "Hyperscale Rack Integration Center",
        timestamp: "2026-01-08 22:30:10 UTC",
        status: "pass",
        parameters: [
          { label: "Rack Shelf Slot", value: "Rack #0, Host #0 (U10-12)", spec: "54V Busbar Tap 1" },
          { label: "Blind-Mate QD Leak Test", value: "1.2 x 10⁻⁶ mbar·L/s", spec: "< 5.0 x 10⁻⁶ Pass" },
          { label: "Busbar Bolt Clamp Torque", value: "9.8 N·m", spec: "9.5 - 10.2 N·m" },
          { label: "48-Hour Burn-In Test", value: "Passed (at room ambient 25°C)", spec: "No faults at cold ambient" },
        ],
        verdictNote: "Rack Integration Verified: Note that at room ambient burn-in, flexure crack remained closed; only manifest under production thermal cycling.",
      },
      {
        stageNumber: 6,
        stageName: "Datacenter L12 Production Operations",
        tierLabel: "Tier 6: Datacenter Hall",
        facility: "Frontier 32k-GPU Hall (Cluster Alpha)",
        timestamp: "2026-02-14 11:15:00 UTC",
        status: "warning",
        parameters: [
          { label: "Operating Cumulative Hours", value: "1,420 Hours", spec: "Continuous" },
          { label: "Thermal Cycling Count", value: "18 Full Cycles (45°C - 85°C)", spec: "Expands Solder Joints" },
          { label: "Failure Symptom at Step 32", value: "HBM Channel 3 D2D Parity Drops", spec: "Zero Drops Allowed", isOutOfSpec: true },
          { label: "Mitigation Action", value: "Batch #8810 Proactively Cordoned", spec: "Checkpoint Synchronized" },
        ],
        verdictNote: "Proactive Cordoning: Under 85°C thermal expansion, the 380 microstrain pre-stressed joint fractured. Cordoned 16 sibling nodes at checkpoint save.",
      },
    ],
  },
  "gpu-r0-h0-d0": {
    chipId: "gpu-r0-h0-d0",
    ecid: "0x1102_55FA_77E1_0024",
    serialNumber: "SN-H200-N3E-98041",
    currentLocation: "Rack #0, Host #0, Socket #0",
    healthStatus: "golden",
    liabilityTier: "None (Golden)",
    stages: [
      {
        stageNumber: 1,
        stageName: "Foundry Wafer Sort (WAT/CP)",
        tierLabel: "Tier 1: Silicon Fab",
        facility: "Fab 18 (N3E GAA)",
        timestamp: "2025-11-12 04:18:00 UTC",
        status: "pass",
        parameters: [
          { label: "Wafer Lot ID", value: "TSMC-N3E-LOT-4419", spec: "Certified" },
          { label: "Wafer Coordinates", value: "W-9042-07 (X: 110, Y: 184)", spec: "Radius 40mm" },
          { label: "Factory Vmin", value: "682 mV", spec: "680 - 720 mV Nominal" },
          { label: "IDDQ Static Leakage", value: "13.9 mA", spec: "12.0 - 18.0 mA Nominal" },
        ],
        verdictNote: "Golden Silicon: Parametrics completely centered in wafer distribution.",
      },
      {
        stageNumber: 2,
        stageName: "2.5D Packaging (CoWoS-S)",
        tierLabel: "Tier 2: OSAT Assembly",
        facility: "Advanced Packaging Facility #3",
        timestamp: "2025-11-28 16:30:00 UTC",
        status: "pass",
        parameters: [
          { label: "Interposer ID", value: "INT-2.5D-410-08", spec: "8x HBM3e Sites" },
          { label: "Microbump Pitch", value: "35 μm", spec: "Nominal" },
          { label: "Solder Void Ratio", value: "0.009%", spec: "< 0.050% Max Allowed" },
          { label: "Underfill Integrity", value: "Acoustic Scan 100% Void-Free", spec: "100% Coverage" },
        ],
        verdictNote: "Packaging 100% nominal.",
      },
      {
        stageNumber: 3,
        stageName: "System-Level Test (SLT Class Test)",
        tierLabel: "Tier 3: Test House",
        facility: "Automated SLT Cell Alpha",
        timestamp: "2025-12-05 08:50:00 UTC",
        status: "pass",
        parameters: [
          { label: "Corner Stress Range", value: "-10°C to +105°C", spec: "Certified" },
          { label: "Clock Rating", value: "2,640 MHz", spec: "Bin 1 Gold Rating" },
          { label: "HBM3e Bandwidth", value: "4.82 TB/s", spec: "> 4.6 TB/s Floor" },
          { label: "Hardware Fuse Register", value: "0xFF12_4488 (Locked)", spec: "Immutable" },
        ],
        verdictNote: "Certified Bin 1 Gold.",
      },
      {
        stageNumber: 4,
        stageName: "ODM Baseboard SMT & Cold Plate Mount",
        tierLabel: "Tier 4: ODM Baseboard Integrator",
        facility: "ODM Precision SMT Line A (Batch #8790)",
        timestamp: "2025-12-17 10:14:00 UTC",
        status: "pass",
        parameters: [
          { label: "SMT Assembly Line", value: "Foxconn Line A, Shift 1", spec: "SMT Standard" },
          { label: "Cold Plate Screw Torque", value: "142 cN·m", spec: "140 ± 10 cN·m Spec" },
          { label: "Measured PCB Strain", value: "145 με", spec: "< 200 με Safe Threshold" },
          { label: "TIM Bondline Thickness", value: "38 μm", spec: "35 - 50 μm Nominal" },
        ],
        verdictNote: "Perfect Assembly: Calibrated torque driver applied 142 cN·m. Nominal 145 microstrain on PCB.",
      },
      {
        stageNumber: 5,
        stageName: "System L10/L11 Rack Integration",
        tierLabel: "Tier 5: System Integrator",
        facility: "Hyperscale Rack Integration Center",
        timestamp: "2026-01-08 22:15:00 UTC",
        status: "pass",
        parameters: [
          { label: "Rack Shelf Slot", value: "Rack #0, Host #0 (U10-12)", spec: "Nominal" },
          { label: "Blind-Mate QD Leak Test", value: "1.0 x 10⁻⁶ mbar·L/s", spec: "Pass" },
          { label: "Busbar Bolt Clamp Torque", value: "9.7 N·m", spec: "Pass" },
          { label: "48-Hour Burn-In Test", value: "Passed 100%", spec: "Pass" },
        ],
        verdictNote: "Rack Integration verified.",
      },
      {
        stageNumber: 6,
        stageName: "Datacenter L12 Production Operations",
        tierLabel: "Tier 6: Datacenter Hall",
        facility: "Frontier 32k-GPU Hall (Cluster Alpha)",
        timestamp: "2026-02-14 11:15:00 UTC",
        status: "pass",
        parameters: [
          { label: "Operating Cumulative Hours", value: "1,420 Hours", spec: "Continuous" },
          { label: "Thermal Cycling Count", value: "18 Full Cycles", spec: "Nominal" },
          { label: "Current Health Score", value: "99.8% Golden", spec: "> 95% Normal" },
          { label: "Active Pretraining Role", value: "Core DP Rank 0", spec: "In Service" },
        ],
        verdictNote: "Flawless in-service operational health.",
      },
    ],
  },
};

export function PassportView({
  run,
}: {
  run: RunView | null;
}) {
  const totalGpus = run?.cluster?.accelerator_count ?? 32768;

  const [selectedChipId, setSelectedChipId] = useState<string>("gpu-r0-h0-d1");
  const [claimIssued, setClaimIssued] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Executive ROI Calculator States
  const [fleetGpus, setFleetGpus] = useState<number>(totalGpus);
  const [annualIntegrationDefectsPct, setAnnualIntegrationDefectsPct] = useState<number>(1.8);
  const [chipReplacementCost, setChipReplacementCost] = useState<number>(30000);
  const [supplierRecoveryWithPassportPct, setSupplierRecoveryWithPassportPct] = useState<number>(94);
  const [supplierRecoveryWithoutPassportPct, setSupplierRecoveryWithoutPassportPct] = useState<number>(22);
  const [clusterHourlyDowntimeCost, setClusterHourlyDowntimeCost] = useState<number>(1850);

  // Derived ROI metrics
  const annualIntegrationDefects = Math.round(fleetGpus * (annualIntegrationDefectsPct / 100));
  const capitalRecoveredWithPassport =
    annualIntegrationDefects * chipReplacementCost * (supplierRecoveryWithPassportPct / 100);
  const capitalRecoveredWithoutPassport =
    annualIntegrationDefects * chipReplacementCost * (supplierRecoveryWithoutPassportPct / 100);
  const netWarrantyRecoveryGain = capitalRecoveredWithPassport - capitalRecoveredWithoutPassport;

  // Sibling cordoning avoids secondary cluster stalls
  const secondaryStallsAvoided = Math.round(annualIntegrationDefects * 0.35); // 35% of integration lots have sibling defects
  const downtimeSavings = secondaryStallsAvoided * 4.5 * clusterHourlyDowntimeCost;
  const totalSupplyChainValue = netWarrantyRecoveryGain + downtimeSavings;

  const activePassport = CHIP_PASSPORTS[selectedChipId] ?? CHIP_PASSPORTS["gpu-r0-h0-d1"];

  const handleIssueWarrantyClaim = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setClaimIssued(true);
    }, 750);
  };

  return (
    <section className="passport-section">
      <div className="passport-header">
        <span className="eyebrow">
          Digital Product Passport (Cradle to Grave)
        </span>
        <h1>Digital Chip Passport (From Factory Bakery to Server Rack)</h1>
        <p className="lede">
          Think of a verified Carfax report or Digital Birth Certificate for every processor:
          From the moment silicon is baked in the factory, packaged into multi-chip modules, mounted to circuit boards, clamped with liquid cooling plates, and slotted into server racks, every single machine has an unbroken digital history.
          If a factory robot over-tightened cooling plate clamp screws on machine #14, bending the circuit board under microscopic stress until it fails months later, we immediately look up the digital passport to find the other 15 machines built on the exact same assembly bench.
          We safely swap them during normal saves before rolling crashes can bring down the entire datacenter.
        </p>
      </div>

      {/* 4 EXECUTIVE KPI CARDS */}
      <div className="passport-kpi-grid">
        <div className="passport-kpi-card kpi-ok">
          <span className="kpi-label">Digital Passport Coverage</span>
          <div className="kpi-val">100% ({totalGpus.toLocaleString()} Passports Active)</div>
          <p className="kpi-desc">
            Immutable 6-stage cradle-to-grave manufacturing & integration history linked to every accelerator's ECID.
          </p>
          <div className="kpi-highlight">Full Traceability Verified</div>
        </div>

        <div className={`passport-kpi-card ${claimIssued ? "kpi-ok" : "kpi-warning"}`}>
          <span className="kpi-label">Integration Batch Defect Detected</span>
          <div className="kpi-val">Batch #ODM-8810 Flagged</div>
          <p className="kpi-desc">
            Cold plate over-torque (185 cN·m vs 140 cN·m spec) caused 380 microstrain flexure; HBM joint cracked under thermal expansion.
          </p>
          <div className="kpi-highlight">
            {claimIssued ? "✓ 16 Sibling Nodes Cordoned" : "⚠ 16 Sibling Nodes at Risk"}
          </div>
        </div>

        <div className="passport-kpi-card kpi-info">
          <span className="kpi-label">Liability Attribution Speed</span>
          <div className="kpi-val">&lt; 1.2s Deterministic Verdict</div>
          <p className="kpi-desc">
            Cryptographic proof traces fault to ODM Assembly Line B; bypasses 6-week vendor RMA finger-pointing disputes.
          </p>
          <div className="kpi-highlight">100% ODM Liability Assigned</div>
        </div>

        <div className="passport-kpi-card kpi-ok">
          <span className="kpi-label">Contagion Cordoning Benefit</span>
          <div className="kpi-val">3-6 Cluster Stalls Avoided</div>
          <p className="kpi-desc">
            Scheduled migration during regular checkpoint saves prevents rolling multi-week cluster crashes, saving $600k+ goodput.
          </p>
          <div className="kpi-highlight">Zero Unplanned Cluster Aborts</div>
        </div>
      </div>

      {/* CHIP SELECTOR & SEARCH BAR */}
      <div className="panel passport-selector-bar">
        <div className="selector-info">
          <strong>Select Accelerator to Inspect Digital Passport:</strong>
          <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "0.85rem" }}>
            Click an accelerator below to view its complete 6-stage manufacturing, packaging, and integration history.
          </p>
        </div>
        <div className="chip-selector-buttons">
          <button
            type="button"
            className={`btn-chip-select ${selectedChipId === "gpu-r0-h0-d1" ? "active danger" : ""}`}
            onClick={() => { setSelectedChipId("gpu-r0-h0-d1"); setClaimIssued(false); }}
          >
            <span>gpu-r0-h0-d1 (Flagged: Over-Torque Batch #8810)</span>
          </button>
          <button
            type="button"
            className={`btn-chip-select ${selectedChipId === "gpu-r0-h0-d0" ? "active ok" : ""}`}
            onClick={() => { setSelectedChipId("gpu-r0-h0-d0"); setClaimIssued(false); }}
          >
            <span>gpu-r0-h0-d0 (Golden Passport: 100% Nominal)</span>
          </button>
        </div>
      </div>

      {/* PASSPORT SUMMARY HEADER BANNER */}
      <div className={`panel passport-summary-banner ${activePassport.healthStatus === "flagged_assembly_defect" ? "banner-flagged" : "banner-golden"}`}>
        <div className="banner-top">
          <div className="banner-titles">
            <span className="passport-badge">DIGITAL PRODUCT PASSPORT</span>
            <h2>{activePassport.chipId} — {activePassport.serialNumber}</h2>
            <p className="muted">
              ECID: <code>{activePassport.ecid}</code> · Physical Slot: <strong>{activePassport.currentLocation}</strong>
            </p>
          </div>
          <div className="banner-verdict-box">
            <span className="verdict-label">Assigned Liability Tier</span>
            <strong className="verdict-tier">{activePassport.liabilityTier}</strong>
            <span className="verdict-status-tag">
              {activePassport.healthStatus === "flagged_assembly_defect" ? "ASSEMBLY TORQUE EXCEEDED" : "CERTIFIED GOLDEN"}
            </span>
          </div>
        </div>

        {activePassport.healthStatus === "flagged_assembly_defect" && (
          <div className="banner-alert-box">
            <strong>CRADLE-TO-GRAVE CORRELATION SUMMARY:</strong> Foundry wafer probe and OSAT packaging were 100% golden.
            Defect was introduced during Stage 4 (ODM Baseboard Assembly) where pneumatic torque driver #B2 applied <strong>185 cN·m (+32% above 140 cN·m spec)</strong>, generating <strong>380 microstrain</strong> of mechanical PCB flexure.
            Thermal expansion during Stage 6 operations opened the micro-cracked HBM3e solder joint.
          </div>
        )}
      </div>

      {/* 6-STAGE CRADLE-TO-GRAVE TIMELINE */}
      <div className="panel timeline-panel">
        <div className="timeline-panel-head">
          <div>
            <h2>Cradle-to-Grave Manufacturing & Integration Trail</h2>
            <p className="muted">
              Auditable stage-by-stage parametric telemetry recorded at every hand-off in the supply chain.
            </p>
          </div>
          <span className="timeline-step-count">6 Supply-Chain Verification Gates</span>
        </div>

        <div className="stages-flow-wrapper">
          {activePassport.stages.map((stage) => {
            const statusClass =
              stage.status === "fail" ? "stage-fail" : stage.status === "warning" ? "stage-warn" : "stage-pass";

            return (
              <div key={stage.stageNumber} className={`stage-card ${statusClass}`}>
                <div className="stage-top">
                  <div className="stage-num-badge">{stage.stageNumber}</div>
                  <div className="stage-meta">
                    <span className="stage-tier">{stage.tierLabel}</span>
                    <h3 className="stage-title">{stage.stageName}</h3>
                    <span className="stage-loc">{stage.facility} · {stage.timestamp}</span>
                  </div>
                  <span className={`status-pill ${statusClass}`}>
                    {stage.status.toUpperCase()}
                  </span>
                </div>

                <div className="stage-params-table">
                  {stage.parameters.map((param, pIdx) => (
                    <div key={pIdx} className={`param-row ${param.isOutOfSpec ? "param-defect" : ""}`}>
                      <span className="param-label">{param.label}</span>
                      <strong className="param-val">{param.value}</strong>
                      <span className="param-spec">Spec: {param.spec}</span>
                    </div>
                  ))}
                </div>

                <div className="stage-note">
                  <strong>Verification Note:</strong> {stage.verdictNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUTOMATED SUPPLIER LIABILITY & WARRANTY CLAIM ACTION */}
      <div className="panel warranty-claim-panel">
        <div className="warranty-header">
          <div>
            <h2>Automated Supplier SLA & Warranty Chargeback Matrix</h2>
            <p className="muted">
              Deterministic liability assignment eliminates supplier finger-pointing and recovers capital via automated warranty claims.
            </p>
          </div>
          <span className="warranty-total-claim">
            {activePassport.healthStatus === "flagged_assembly_defect" ? "Total Claim: $48,500" : "Zero Claims (Nominal)"}
          </span>
        </div>

        <div className="liability-breakdown-grid">
          <div className="liability-card">
            <span className="tier-name">Tier 1: Foundry Fab</span>
            <div className="tier-share">0% ($0)</div>
            <p className="tier-desc">Wafer probe Vmin & IDDQ leakage 100% within golden bin.</p>
            <span className="tier-tag tag-cleared">Cleared</span>
          </div>

          <div className="liability-card">
            <span className="tier-name">Tier 2: OSAT Packaging</span>
            <div className="tier-share">0% ($0)</div>
            <p className="tier-desc">Acoustic scan verified 100% void-free underfill & microbumps.</p>
            <span className="tier-tag tag-cleared">Cleared</span>
          </div>

          <div className="liability-card">
            <span className="tier-name">Tier 3: SLT Test House</span>
            <div className="tier-share">0% ($0)</div>
            <p className="tier-desc">Certified at both -10°C and +105°C thermal extremes.</p>
            <span className="tier-tag tag-cleared">Cleared</span>
          </div>

          <div className="liability-card card-responsible">
            <span className="tier-name">Tier 4: ODM Baseboard</span>
            <div className="tier-share text-danger">100% ($48,500)</div>
            <p className="tier-desc">
              185 cN·m torque driver exceedance caused 380 microstrain flexure and joint fracture.
            </p>
            <span className="tier-tag tag-liable">100% Liable</span>
          </div>

          <div className="liability-card">
            <span className="tier-name">Tier 5/6: Integrator & Ops</span>
            <div className="tier-share">0% ($0)</div>
            <p className="tier-desc">Cooling loop flow, busbar voltage, and environment nominal.</p>
            <span className="tier-tag tag-cleared">Cleared</span>
          </div>
        </div>

        <div className="warranty-action-box">
          <div>
            <strong>Automated Warranty Enforcement & Batch Cordoning:</strong>
            <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>
              Electronically file $48,500 warranty claim with ODM Foxconn Line B and schedule proactive cordon of all 16 sibling accelerators assembled in Batch #8810 during the next checkpoint boundary.
            </p>
          </div>
          <button
            type="button"
            className="btn-issue-claim"
            onClick={handleIssueWarrantyClaim}
            disabled={isSubmitting || claimIssued || activePassport.healthStatus !== "flagged_assembly_defect"}
          >
            {isSubmitting
              ? "Submitting Cryptographic Proof to ODM..."
              : claimIssued
              ? "✓ $48,500 Claim Filed & 16 Siblings Cordoned"
              : "Issue Automated ODM Warranty Claim & Cordon Siblings"}
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUPPLY CHAIN ROI CALCULATOR */}
      <div className="panel passport-roi-panel">
        <div className="roi-header">
          <div>
            <h2>Executive Supply Chain & Warranty Recovery ROI Calculator</h2>
            <p className="muted">
              Model annual capital recovered from automated warranty claims and downtime prevented by cordoning assembly batch defects.
            </p>
          </div>
          <div className="roi-total-badge">
            <span className="badge-sub">Total Annual Supply Chain Value</span>
            <strong className="badge-money">${Math.round(totalSupplyChainValue).toLocaleString()}</strong>
          </div>
        </div>

        <div className="roi-inputs-grid">
          <div className="roi-input-group">
            <label htmlFor="fleetGpusInput">Cluster Accelerators</label>
            <div className="input-with-val">
              <input
                id="fleetGpusInput"
                type="range"
                min="4096"
                max="65536"
                step="4096"
                value={fleetGpus}
                onChange={(e) => setFleetGpus(Number(e.target.value))}
              />
              <span className="slider-val">{fleetGpus.toLocaleString()} GPUs</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="integrationDefectRateInput">Annual Assembly / Integration Defect Rate (%)</label>
            <div className="input-with-val">
              <input
                id="integrationDefectRateInput"
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={annualIntegrationDefectsPct}
                onChange={(e) => setAnnualIntegrationDefectsPct(Number(e.target.value))}
              />
              <span className="slider-val">{annualIntegrationDefectsPct.toFixed(1)}% ({annualIntegrationDefects} chips/yr)</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="chipReplacementCostInput">Average Accelerator Replacement Cost ($)</label>
            <div className="input-with-val">
              <input
                id="chipReplacementCostInput"
                type="number"
                min="10000"
                max="50000"
                step="5000"
                value={chipReplacementCost}
                onChange={(e) => setChipReplacementCost(Number(e.target.value))}
              />
              <span className="slider-val">${chipReplacementCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="recoveryPassportInput">Warranty Recovery Rate with Digital Passport (%)</label>
            <div className="input-with-val">
              <input
                id="recoveryPassportInput"
                type="range"
                min="70"
                max="99"
                step="1"
                value={supplierRecoveryWithPassportPct}
                onChange={(e) => setSupplierRecoveryWithPassportPct(Number(e.target.value))}
              />
              <span className="slider-val">{supplierRecoveryWithPassportPct}% Recovered</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="recoveryBaselineInput">Baseline Recovery without Passport (Finger-Pointing) (%)</label>
            <div className="input-with-val">
              <input
                id="recoveryBaselineInput"
                type="range"
                min="5"
                max="50"
                step="1"
                value={supplierRecoveryWithoutPassportPct}
                onChange={(e) => setSupplierRecoveryWithoutPassportPct(Number(e.target.value))}
              />
              <span className="slider-val">{supplierRecoveryWithoutPassportPct}% Industry Avg</span>
            </div>
          </div>

          <div className="roi-input-group">
            <label htmlFor="downtimeCostInput">Cluster Hourly Downtime Cost ($/hr)</label>
            <div className="input-with-val">
              <input
                id="downtimeCostInput"
                type="number"
                min="500"
                max="10000"
                step="250"
                value={clusterHourlyDowntimeCost}
                onChange={(e) => setClusterHourlyDowntimeCost(Number(e.target.value))}
              />
              <span className="slider-val">${clusterHourlyDowntimeCost.toLocaleString()}/hr</span>
            </div>
          </div>
        </div>

        <div className="roi-summary-breakdown">
          <div className="breakdown-card">
            <span className="breakdown-title">Direct Warranty Claims Gained</span>
            <strong className="breakdown-metric text-ok">${Math.round(netWarrantyRecoveryGain).toLocaleString()}</strong>
            <p className="breakdown-detail">
              Deterministic digital audit trails eliminate finger-pointing disputes, recovering 94% of warranty claims vs 22% industry baseline.
            </p>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-title">Batch Defect Contagion Stalls Avoided</span>
            <strong className="breakdown-metric text-info">{secondaryStallsAvoided} Cluster Outages Prevented</strong>
            <p className="breakdown-detail">
              Cordoning sibling nodes during scheduled checkpoint saves prevents repeat crashes from contaminated assembly lots.
            </p>
          </div>

          <div className="breakdown-card">
            <span className="breakdown-title">Training Goodput Preserved</span>
            <strong className="breakdown-metric text-ok">${Math.round(downtimeSavings).toLocaleString()}</strong>
            <p className="breakdown-detail">
              Protects synchronous collective pretraining jobs from rolling restarts and redundant recovery burns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
