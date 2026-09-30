import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LiveFrame, RunView } from "./api";

export interface WorkOrderTicket {
  id: string;
  storyId: string;
  title: string;
  urgency: "critical" | "warning" | "routine";
  category: "cooling" | "power" | "board" | "packaging" | "silicon";
  categoryLabel: string;
  icon: string;
  aisle: string;
  rack: string;
  chassisRu: string;
  slot: string;
  estimatedMinutes: number;
  reportedProblem: string;
  rootCauseComponent: string;
  physicalActionSummary: string;
  locatorBeaconActive: boolean;
  partsBOM: {
    sku: string;
    name: string;
    qty: number;
    binLocation: string;
    inStock: number;
  }[];
  stepByStepInstructions: {
    stepNum: number;
    title: string;
    instruction: string;
    safetyCaution?: string;
  }[];
  canaryTestGate: {
    testName: string;
    durationSeconds: number;
    passCriteria: string;
    postRepairAction: string;
  };
}

export const WORK_ORDERS: WorkOrderTicket[] = [
  {
    id: "WO-2026-0811",
    storyId: "gradual_warning",
    title: "Creeping Thermal Degradation / Dry Cold-Plate TIM",
    urgency: "critical",
    category: "cooling",
    categoryLabel: "Liquid Cooling",
    icon: "🌡️",
    aisle: "Aisle 04 (Cold Row Alpha)",
    rack: "Rack 00 (Cabinet A-04)",
    chassisRu: "Host 0 (RU 20-24, Chassis Tray 0)",
    slot: "Slot d0 (Accelerator Chip 0)",
    estimatedMinutes: 12,
    reportedProblem: "Chip d0 thermal slope dT/dt exceeded 0.8°C/s; operating temperature climbed to 78°C under nominal matrix workload.",
    rootCauseComponent: "Thermal Interface Material (TIM) micro-void or cold-plate contact pressure loss",
    physicalActionSummary: "Reseat liquid cold plate, replace TIM pad, and verify manifold quick-disconnect coupling.",
    locatorBeaconActive: true,
    partsBOM: [
      {
        sku: "TIM-700-PAD",
        name: "Pre-Cut Phase-Change Thermal Interface Pad (75x75mm)",
        qty: 1,
        binLocation: "Warehouse Room B · Bin C-14",
        inStock: 18,
      },
      {
        sku: "QD-DRY-SEAL",
        name: "Quick-Disconnect Dual-Seal O-Ring Kit",
        qty: 1,
        binLocation: "Warehouse Room B · Bin A-08",
        inStock: 42,
      },
      {
        sku: "TOOL-TORX-T15",
        name: "Calibrated Torque Screwdriver (Preset to 0.60 Nm)",
        qty: 1,
        binLocation: "Tech Tool Crib · Shelf 02",
        inStock: 4,
      },
    ],
    stepByStepInstructions: [
      {
        stepNum: 1,
        title: "Locate Server & Verify Safety Beacon",
        instruction: "Navigate to Aisle 04, Rack 00. Confirm the Blue Flashing Locator Beacon is illuminated on Chassis Host-0 at RU 22.",
        safetyCaution: "Ensure server tray has been drained of training jobs before unlocking sliding rail latches.",
      },
      {
        stepNum: 2,
        title: "Isolate Liquid Cooling Quick-Disconnects",
        instruction: "Disengage the dual dry-break quick-disconnect couplings connecting Rack 00 manifold to Host 0. Verify zero coolant drip.",
        safetyCaution: "Do NOT use pliers. Squeeze textured collar by hand until positive mechanical click confirms shutoff.",
      },
      {
        stepNum: 3,
        title: "Remove Cold Plate & Replace Thermal Interface",
        instruction: "Loosen the 4 captive spring-screws on GPU-0 cold plate in diagonal cross pattern (1-4-2-3). Wipe old TIM with lint-free isopropyl wipe. Apply new TIM-700 pad.",
      },
      {
        stepNum: 4,
        title: "Re-Torque to Specification & Re-Connect Coolant",
        instruction: "Torque 4 spring screws to exactly 0.60 Nm using calibrated Tool T-102. Re-attach quick-disconnect hoses and verify 1.4 bar pressure.",
      },
    ],
    canaryTestGate: {
      testName: "5-Minute Synthetic Thermal Stress Gate (GEMM Benchmark)",
      durationSeconds: 300,
      passCriteria: "Core temperature must remain under 62°C at 100% TDP; delta between coolant inlet and die < 14°C.",
      postRepairAction: "Automated controller automatically re-promotes node to active training cluster.",
    },
  },
  {
    id: "WO-2026-0812",
    storyId: "rack_thermal_shadow",
    title: "Upper Shelf Cooling Manifold Valve Pinch",
    urgency: "critical",
    category: "cooling",
    categoryLabel: "Rack Infrastructure",
    icon: "🏢",
    aisle: "Aisle 04 (Cold Row Alpha)",
    rack: "Rack 08 (Cabinet A-08)",
    chassisRu: "Racks RU 34-42 (Top 4 Server Trays)",
    slot: "Upper Supply Manifold Riser",
    estimatedMinutes: 8,
    reportedProblem: "Top 4 server trays experiencing vertical thermal shadow (ΔT > 10°C top vs bottom). Coolant flow starved to upper shelves.",
    rootCauseComponent: "Manifold Quick-Disconnect Poppet Valve partially seated / pinched flow restriction",
    physicalActionSummary: "Inspect and reseat upper manifold branch valve; bleed air bubble from top riser vent port.",
    locatorBeaconActive: true,
    partsBOM: [
      {
        sku: "MAN-QD-VALVE",
        name: "High-Flow Dry-Break Manifold Return Coupler (12mm)",
        qty: 1,
        binLocation: "Warehouse Room B · Bin A-12",
        inStock: 14,
      },
      {
        sku: "AIR-BLEED-KIT",
        name: "Manual Top-Riser Degassing Syringe & Catch Bottle",
        qty: 1,
        binLocation: "Tech Tool Crib · Shelf 04",
        inStock: 6,
      },
    ],
    stepByStepInstructions: [
      {
        stepNum: 1,
        title: "Identify Upper Manifold Zone",
        instruction: "Open rear cabinet door of Rack 08. Look at upper liquid manifold riser (RU 34-42) where amber warning beacon is lit.",
      },
      {
        stepNum: 2,
        title: "Reseat Quick-Disconnect Return Valve",
        instruction: "Push the quick-disconnect sleeve firmly forward until collar snaps completely over detent balls. Audible double-click indicates full bore flow.",
        safetyCaution: "Wear safety goggles when handling pressurized liquid cooling manifolds (operating pressure: 1.8 bar).",
      },
      {
        stepNum: 3,
        title: "Bleed Trapped Vapor at Top Port",
        instruction: "Attach degassing syringe to Schraeder valve at topmost manifold elbow. Draw 50ml of coolant until zero microbubbles remain.",
      },
    ],
    canaryTestGate: {
      testName: "Differential Pressure (dP) & Flow Verification Gate",
      durationSeconds: 120,
      passCriteria: "Manifold differential pressure must restore to 1.45 bar (±0.05 bar); vertical temperature gradient < 2.5°C across all 16 shelves.",
      postRepairAction: "Scheduler unpauses cluster sync barrier.",
    },
  },
  {
    id: "WO-2026-0813",
    storyId: "innocent_chip_dying_board",
    title: "Carrier Board VRM Phase Degradation (Preserve Healthy $30k Chip!)",
    urgency: "warning",
    category: "board",
    categoryLabel: "Baseboard Power",
    icon: "🚗",
    aisle: "Aisle 02 (Row Beta)",
    rack: "Rack 01 (Cabinet B-02)",
    chassisRu: "Host 0 (RU 12-16)",
    slot: "Baseboard Voltage Regulator Module Phase 4",
    estimatedMinutes: 15,
    reportedProblem: "Electrical pressure droop under heavy matrix burst. Uninformed policy would replace healthy $30,000 GPU!",
    rootCauseComponent: "Faulty $12 DrMOS Power Stage on baseboard; GPU silicon is 100% healthy",
    physicalActionSummary: "DO NOT REPLACE THE GPU! Swap the carrier baseboard tray; transfer existing healthy GPU to replacement board.",
    locatorBeaconActive: true,
    partsBOM: [
      {
        sku: "BB-16PH-TRAY",
        name: "16-Phase High-Efficiency Accelerator Baseboard Carrier",
        qty: 1,
        binLocation: "Warehouse Room A · Bin E-02",
        inStock: 7,
      },
      {
        sku: "ESD-MAT-PORT",
        name: "Portable Anti-Static Mat & Grounding Cable",
        qty: 1,
        binLocation: "Tech Tool Crib · Shelf 01",
        inStock: 12,
      },
    ],
    stepByStepInstructions: [
      {
        stepNum: 1,
        title: "Extract Server Tray to Tech Cart",
        instruction: "Disconnect rear blind-mate power busbar and network blind-mates. Slide server tray onto rolling maintenance cart.",
        safetyCaution: "Heed ESD precautions: connect grounding strap to server chassis frame before touching internal components.",
      },
      {
        stepNum: 2,
        title: "Safely Transfer Healthy GPU",
        instruction: "Loosen GPU carrier latches. Lift healthy $30,000 GPU vertically out of degraded carrier board. Install into replacement board SKU BB-16PH-TRAY.",
        safetyCaution: "Inspect gold-plated high-density board-to-board connector pins. Ensure zero foreign object debris.",
      },
      {
        stepNum: 3,
        title: "Re-Insert Server Tray into Rack 01",
        instruction: "Slide tray back into RU 12 until busbar connectors engage firmly with 48V power shelf.",
      },
    ],
    canaryTestGate: {
      testName: "VRM Phase Balance & Vmin Stress Gate",
      durationSeconds: 240,
      passCriteria: "All 16 VRM phases balanced within 4% current sharing; GPU voltage droop < 18mV during 400W load steps.",
      postRepairAction: "RMA ticket filed automatically for faulty $12 board component; $30,000 GPU retained.",
    },
  },
  {
    id: "WO-2026-0814",
    storyId: "cold_plate_torque_fracture",
    title: "Factory Screw Over-Torque Correction",
    urgency: "routine",
    category: "packaging",
    categoryLabel: "Mechanical & Board",
    icon: "📋",
    aisle: "Aisle 01 (Row Alpha)",
    rack: "Rack 03 (Cabinet A-03)",
    chassisRu: "Host 2 (RU 24-28)",
    slot: "Chassis Retainer Screws #1-4",
    estimatedMinutes: 6,
    reportedProblem: "Assembly plant screwdriver over-tightened cold-plate screws by 32%, causing 380 microstrain board flexure and intermittent memory traces.",
    rootCauseComponent: "Uncalibrated contract manufacturer power screwdriver torque setting",
    physicalActionSummary: "Loosen over-tightened screws and re-torque to calibrated 0.60 Nm using precision click torque driver.",
    locatorBeaconActive: false,
    partsBOM: [
      {
        sku: "TOOL-TORX-T15-CAL",
        name: "Digitally Calibrated 0.60 Nm Precision Torque Driver",
        qty: 1,
        binLocation: "Tech Tool Crib · Shelf 02",
        inStock: 4,
      },
      {
        sku: "STRAIN-TEST-PROBE",
        name: "Handheld Strain Gauge Telemetry Reader",
        qty: 1,
        binLocation: "Diagnostics Lab · Bench 01",
        inStock: 2,
      },
    ],
    stepByStepInstructions: [
      {
        stepNum: 1,
        title: "Access Top Cover of Host 2",
        instruction: "Slide server tray 20cm forward on service rails without disconnecting live cables.",
      },
      {
        stepNum: 2,
        title: "Relieve Mechanical Strain",
        instruction: "Loosen all 4 cold-plate retention screws 2 full turns to relax board flexure.",
      },
      {
        stepNum: 3,
        title: "Re-Torque to Calibrated 0.60 Nm",
        instruction: "Tighten diagonally in 2 passes (0.30 Nm first pass, 0.60 Nm final pass) until driver clutch clicks. Confirm strain gauge reading < 80 microstrain.",
      },
    ],
    canaryTestGate: {
      testName: "High-Bandwidth Memory (HBM) Continuity Gate",
      durationSeconds: 180,
      passCriteria: "Zero PCIe/HBM link transmission retries over 100GB bidirectional memory transfer loop.",
      postRepairAction: "Mark ODM assembly warranty audit complete; clear cohort warning.",
    },
  },
  {
    id: "WO-2026-0815",
    storyId: "wafer_lot_contagion",
    title: "Sister Wafer Lot Cohort Replacement (Batch Quarantine)",
    urgency: "warning",
    category: "silicon",
    categoryLabel: "Silicon Health",
    icon: "🍞",
    aisle: "Aisle 03 & 04 (Multi-Rack Cohort)",
    rack: "Racks 02, 05, 09 (14 Sister Chips Across Hall)",
    chassisRu: "Hosts 0, 4, 8",
    slot: "Wafer Lot #TSMC-W-8841 Outer-Ring Dies",
    estimatedMinutes: 30,
    reportedProblem: "Silicon Disc 14 outer-edge ring flaw caused 1 chip to die; digital birth certificates flagged 14 identical sister chips waiting to fail.",
    rootCauseComponent: "Foundry wafer perimeter chemical impurity batch defect",
    physicalActionSummary: "Execute coordinated cohort rotation: swap all 14 sister chips during scheduled maintenance window.",
    locatorBeaconActive: true,
    partsBOM: [
      {
        sku: "GPU-B200-HOT-SPARE",
        name: "Pre-Tested Production Hot-Spare Accelerator Module",
        qty: 14,
        binLocation: "Warehouse Room A · Shelf S-01 (Spares Vault)",
        inStock: 24,
      },
    ],
    stepByStepInstructions: [
      {
        stepNum: 1,
        title: "Pick 14 Golden Hot-Spares from Vault",
        instruction: "Check out 14 pre-qualified hot spare modules from Spares Vault. Scan barcode to confirm center-wafer bin origin.",
      },
      {
        stepNum: 2,
        title: "Follow Blue Cohort Beacon Walk",
        instruction: "Walk Aisles 03 and 04 following the illuminated blue LEDs on flagged sister chassis. Replace 1 module per chassis.",
      },
      {
        stepNum: 3,
        title: "Package Degraded Cohort for Foundry Warranty Credit",
        instruction: "Place removed sister chips in protective anti-static ESD trays labeled 'Batch Lot W-8841 Warranty Return'.",
      },
    ],
    canaryTestGate: {
      testName: "Full Cluster Gang Synchronous Validation",
      durationSeconds: 300,
      passCriteria: "All 14 replaced modules pass 5-minute pre-flight gang barrier test with uniform thermal delta.",
      postRepairAction: "Submit $420,000 foundry wafer credit claim automatically.",
    },
  },
];

export function FieldDispatchView({
  run,
  frames,
  onRehearse,
}: {
  run: RunView | null;
  frames: LiveFrame[];
  onRehearse?: (storyId: string) => void;
}) {
  const [selectedTicketId, setSelectedTicketId] = useState<string>("WO-2026-0811");
  const [beaconStates, setBeaconStates] = useState<Record<string, boolean>>({
    "WO-2026-0811": true,
    "WO-2026-0812": true,
    "WO-2026-0813": true,
    "WO-2026-0814": false,
    "WO-2026-0815": true,
  });
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [canaryRunning, setCanaryRunning] = useState(false);
  const [canaryPassed, setCanaryPassed] = useState(false);

  const activeTicket = WORK_ORDERS.find((w) => w.id === selectedTicketId) ?? WORK_ORDERS[0];
  const isBeaconOn = beaconStates[activeTicket.id] ?? false;

  function toggleBeacon() {
    setBeaconStates((prev) => ({
      ...prev,
      [activeTicket.id]: !prev[activeTicket.id],
    }));
  }

  function toggleStep(stepNum: number) {
    const key = `${activeTicket.id}-step-${stepNum}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function runCanaryStressTest() {
    setCanaryRunning(true);
    setCanaryPassed(false);
    setTimeout(() => {
      setCanaryRunning(false);
      setCanaryPassed(true);
    }, 2500);
  }

  function handlePrintTicket() {
    window.print();
  }

  // Calculate live simulator connection
  const liveFrame = frames[frames.length - 1];
  const liveIsStalled = liveFrame?.job_state === "stalled";

  return (
    <section className="field-dispatch-portal">
      {/* Top Header */}
      <div className="dispatch-header">
        <div className="dispatch-header-left">
          <div className="dispatch-eyebrow">
            <span>🔧</span>
            <span>PHYSICAL OPERATIONS & BOOTS-ON-THE-GROUND DISPATCH</span>
          </div>
          <h1>Datacenter Field Operations & Work-Order Dispatch</h1>
          <p className="dispatch-lede">
            Bridging software intelligence and physical datacenter reality. When silicon sensors detect a problem, this console instantly translates digital telemetry into actionable work-orders for your on-site facility technicians—complete with physical rack coordinates, blinking locator LEDs, warehouse part numbers, safety lockout steps, and post-repair canary stress tests.
          </p>
          {run ? (
            <div style={{ marginTop: "0.5rem" }}>
              <span className="dispatch-live-tag">
                ✓ Connected to Live Practice Floor: {run.story?.id ?? "active"} ({liveIsStalled ? "⚠️ Hardware Halted at Barrier" : "✓ Cluster Computing"})
              </span>
            </div>
          ) : null}
        </div>
        <div className="dispatch-header-actions">
          <NavLink to="/desk" className="hero-primary-btn" style={{ fontSize: "0.88rem", padding: "0.55rem 1rem", textDecoration: "none" }}>
            ⚡ Go to Live Practice Floor
          </NavLink>
          <NavLink to="/" className="hero-secondary-btn" style={{ fontSize: "0.88rem", padding: "0.55rem 1rem", textDecoration: "none" }}>
            🌟 Executive Portfolio
          </NavLink>
        </div>
      </div>

      {/* OPERATIONS HUD: PHYSICAL FACILITY METRICS */}
      <div className="dispatch-kpi-grid">
        <div className="dispatch-kpi-card highlight-amber">
          <span className="kpi-label">Active Field Work-Orders</span>
          <strong className="kpi-val">{WORK_ORDERS.length} Open</strong>
          <small className="kpi-sub">Priority Dispatched to On-Site Technicians</small>
        </div>
        <div className="dispatch-kpi-card highlight-green">
          <span className="kpi-label">Mean Time To Repair (MTTR)</span>
          <strong className="kpi-val">9.5 Mins</strong>
          <small className="kpi-sub">Targeted Part Swaps vs 4 Hours Blind Troubleshooting</small>
        </div>
        <div className="dispatch-kpi-card">
          <span className="kpi-label">Warehouse Spare Parts Availability</span>
          <strong className="kpi-val">98.4%</strong>
          <small className="kpi-sub">All High-Turnover Parts in On-Site Storage Bins</small>
        </div>
        <div className="dispatch-kpi-card highlight-blue">
          <span className="kpi-label">Post-Repair Canary Pass Rate</span>
          <strong className="kpi-val">100%</strong>
          <small className="kpi-sub">Zero Repeat Outages (Hospital Relapse Trap Eliminated)</small>
        </div>
      </div>

      {/* WORK-ORDER TICKET SELECTOR */}
      <div className="work-order-selector-section">
        <div className="section-head-row">
          <span className="filter-title">Select Physical Work-Order Ticket to Inspect:</span>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Click any ticket below to view physical location, locator beacon, parts BOM, and step-by-step guidance:
          </span>
        </div>

        <div className="work-order-cards-grid">
          {WORK_ORDERS.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            const beaconOn = beaconStates[ticket.id] ?? false;
            return (
              <button
                key={ticket.id}
                type="button"
                className={`work-order-card-btn ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  setSelectedTicketId(ticket.id);
                  setCanaryPassed(false);
                }}
              >
                <div className="ticket-card-top">
                  <span className="ticket-icon">{ticket.icon}</span>
                  <strong className="ticket-id">{ticket.id}</strong>
                  <span className={`urgency-pill ${ticket.urgency}`}>{ticket.urgency}</span>
                </div>
                <div className="ticket-title">{ticket.title}</div>
                <div className="ticket-location-row">
                  <span>📍 {ticket.rack}</span>
                  <span>⏱️ {ticket.estimatedMinutes} mins</span>
                </div>
                <div className="ticket-beacon-status">
                  <span className={`beacon-dot ${beaconOn ? "active" : ""}`} />
                  <span>{beaconOn ? "Locator Beacon: BLINKING BLUE" : "Locator Beacon: OFF"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE WORK-ORDER DISPATCH DESK */}
      <div className="ticket-detail-deck">
        <div className="ticket-detail-head">
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
              <span className="ticket-badge">{activeTicket.id}</span>
              <span className={`urgency-pill ${activeTicket.urgency}`}>{activeTicket.urgency.toUpperCase()} PRIORITY</span>
              <span className="category-pill">{activeTicket.categoryLabel}</span>
            </div>
            <h2>{activeTicket.title}</h2>
            <div className="ticket-physical-address">
              <span>🏢 {activeTicket.aisle}</span>
              <span>·</span>
              <span>🗄️ {activeTicket.rack}</span>
              <span>·</span>
              <span>🖥️ {activeTicket.chassisRu}</span>
              <span>·</span>
              <span>🎯 {activeTicket.slot}</span>
            </div>
          </div>

          {/* Interactive Locator Beacon Control Box */}
          <div className="beacon-control-box">
            <div className="beacon-indicator-display">
              <span className={`physical-beacon-lamp ${isBeaconOn ? "lamp-blinking" : ""}`} />
              <div>
                <strong>Physical Chassis Locator Beacon</strong>
                <small>{isBeaconOn ? "Flashing Ultra-Bright Blue LED on Chassis Faceplate" : "Beacon Inactive (Click button to illuminate)"}</small>
              </div>
            </div>
            <button
              type="button"
              className={`beacon-toggle-btn ${isBeaconOn ? "btn-beacon-on" : ""}`}
              onClick={toggleBeacon}
            >
              {isBeaconOn ? "🔵 Turn Locator Beacon OFF" : "💡 Turn ON Blinking Blue Beacon on Server"}
            </button>
          </div>
        </div>

        {/* PROBLEM & ROOT CAUSE CALLOUT */}
        <div className="dispatch-problem-box">
          <div className="problem-col">
            <span className="problem-label">Reported Telemetry Problem:</span>
            <p>{activeTicket.reportedProblem}</p>
          </div>
          <div className="problem-col highlight-col">
            <span className="problem-label">Physical Root Cause Component:</span>
            <p><strong>{activeTicket.rootCauseComponent}</strong></p>
            <span className="action-hint">🎯 Action: {activeTicket.physicalActionSummary}</span>
          </div>
        </div>

        {/* WAREHOUSE SPARE PARTS BILL OF MATERIALS (BOM) */}
        <div className="parts-bom-section">
          <h3>📦 Warehouse Spare Parts & Tooling Bill of Materials (BOM)</h3>
          <p className="muted" style={{ margin: "0 0 0.8rem", fontSize: "0.85rem" }}>
            Technician must retrieve the following items from the facility warehouse before walking to the rack:
          </p>
          <div className="bom-table-wrap">
            <table className="bom-table">
              <thead>
                <tr>
                  <th>Part SKU</th>
                  <th>Part / Tool Description</th>
                  <th>Qty</th>
                  <th>Warehouse Bin Location</th>
                  <th>On-Site Stock</th>
                </tr>
              </thead>
              <tbody>
                {activeTicket.partsBOM.map((part) => (
                  <tr key={part.sku}>
                    <td><code>{part.sku}</code></td>
                    <td><strong>{part.name}</strong></td>
                    <td>{part.qty}</td>
                    <td><span className="bin-tag">{part.binLocation}</span></td>
                    <td>
                      <span className="stock-tag in-stock">✓ {part.inStock} In Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* STEP-BY-STEP BOOTS-ON-THE-GROUND REPAIR GUIDE */}
        <div className="procedure-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3>🛠️ Step-by-Step Field Technician Procedure</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                Estimated completion time: <strong>{activeTicket.estimatedMinutes} minutes</strong>. Check off each step as you perform it:
              </p>
            </div>
            <button
              type="button"
              className="action-btn-print"
              onClick={handlePrintTicket}
            >
              🖨️ Print Work-Order for Tech Clipboard
            </button>
          </div>

          <div className="procedure-steps-list">
            {activeTicket.stepByStepInstructions.map((step) => {
              const isChecked = completedSteps[`${activeTicket.id}-step-${step.stepNum}`] ?? false;
              return (
                <div
                  key={step.stepNum}
                  className={`procedure-step-card ${isChecked ? "step-completed" : ""}`}
                  onClick={() => toggleStep(step.stepNum)}
                >
                  <div className="step-check-box">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ cursor: "pointer", width: 18, height: 18 }}
                    />
                  </div>
                  <div className="step-content">
                    <div className="step-title-row">
                      <span className="step-number">Step {step.stepNum}</span>
                      <strong>{step.title}</strong>
                      {isChecked ? <span className="step-done-badge">✓ Done</span> : null}
                    </div>
                    <p className="step-text">{step.instruction}</p>
                    {step.safetyCaution ? (
                      <div className="step-safety-alert">
                        <span>⚠️ SAFETY CAUTION:</span> {step.safetyCaution}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POST-REPAIR CANARY TEST GATE */}
        <div className="canary-gate-section">
          <div className="canary-gate-head">
            <div>
              <span className="eyebrow" style={{ color: "#34d399" }}>POST-REPAIR VALIDATION GATE</span>
              <h3>🏃 Automated Treadmill Stress Test (Prevents Hospital Relapse)</h3>
              <p className="muted" style={{ margin: "0.2rem 0", fontSize: "0.88rem" }}>
                Never allow an unvalidated server directly back into a 32,768-chip training job. Recovered nodes must pass this isolated synthetic stress gate before re-enrollment.
              </p>
            </div>
            <button
              type="button"
              className="canary-run-btn"
              onClick={runCanaryStressTest}
              disabled={canaryRunning}
            >
              {canaryRunning ? "⏳ Running 5-Min Synthetic Stress Test..." : "▶ Run Automated Canary Stress Test"}
            </button>
          </div>

          <div className="canary-details-grid">
            <div className="canary-metric-box">
              <span className="canary-label">Test Protocol</span>
              <strong>{activeTicket.canaryTestGate.testName}</strong>
              <small>Duration: {activeTicket.canaryTestGate.durationSeconds} seconds</small>
            </div>
            <div className="canary-metric-box">
              <span className="canary-label">Pass Criteria</span>
              <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.4 }}>{activeTicket.canaryTestGate.passCriteria}</p>
            </div>
            <div className="canary-metric-box highlight-box">
              <span className="canary-label">Validation Result</span>
              {canaryRunning ? (
                <div style={{ color: "var(--accent)", fontWeight: 700 }}>
                  <span className="beacon-dot active" /> Stepping synthetic GEMM matrices across all 8 tensor cores...
                </div>
              ) : canaryPassed ? (
                <div style={{ color: "var(--ok)", fontWeight: 800 }}>
                  ✓ 100% CANARY PASSED: Thermals 58°C, zero memory retries. Node safely re-promoted to live pool!
                </div>
              ) : (
                <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  Awaiting technician repair completion. Click button to execute post-repair gate.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS ROW */}
        <div className="ticket-footer-actions">
          {onRehearse ? (
            <button
              type="button"
              className="action-btn-primary"
              onClick={() => onRehearse(activeTicket.storyId)}
            >
              ⚡ Rehearse This Scenario Live on Practice Floor
            </button>
          ) : (
            <NavLink
              to="/desk"
              className="hero-primary-btn"
              style={{ fontSize: "0.85rem", padding: "0.55rem 1rem", textDecoration: "none" }}
            >
              ⚡ Open Live Practice Floor
            </NavLink>
          )}

          <button
            type="button"
            className="action-btn-print"
            onClick={handlePrintTicket}
          >
            🖨️ Print Dispatch Work-Order
          </button>
        </div>
      </div>
    </section>
  );
}
