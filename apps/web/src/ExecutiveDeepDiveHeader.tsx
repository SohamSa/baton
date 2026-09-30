import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export interface DeepDiveTranslation {
  path: string;
  category: string;
  title: string;
  componentName: string;
  financialBadge: string;
  badgeTone: "danger" | "warn" | "ok" | "accent";
  whatIsIt: string;
  analogyTitle: string;
  analogyIcon: string;
  analogyDesc: string;
  financialImpact: string;
  continuityFix: string;
  relatedStoryId?: string;
}

export const DEEP_DIVE_TRANSLATIONS: Record<string, DeepDiveTranslation> = {
  "/silicon": {
    path: "/silicon",
    category: "Silicon & Batches",
    title: "Processor Health & Silicon Accelerators",
    componentName: "AI Processor Silicon (GPUs / Accelerators)",
    financialBadge: "Stops $220k/day Silent Straggler Drag",
    badgeTone: "danger",
    whatIsIt:
      "The central computing engine that performs mathematical calculations for large AI foundation models. Each server holds 8 processors drawing up to 800W of electricity each.",
    analogyTitle: "The Tired Runner in a 32,768-Athlete Formation",
    analogyIcon: "🐢",
    analogyDesc:
      "Modern AI models require all chips to advance in unison. If just one chip slows down by 8% due to heat or silicon fatigue, every single chip in the building must wait for it, dragging down cluster speed in total silence.",
    financialImpact:
      "A silent straggler chip burns $220,000/day ($1M–$3M/month on a 32k cluster) in wasted electric power and idle stall time across the building.",
    continuityFix:
      "Cross-chip latency tracking detects the slow runner outlier in real time, cordons the degraded node, and gracefully drains it during the next save without interrupting active training.",
    relatedStoryId: "silent_straggler",
  },
  "/lineage": {
    path: "/lineage",
    category: "Silicon & Batches",
    title: "Manufacturing Batches & Wafer Lineage",
    componentName: "Foundry Silicon Ingot & Wafer Discs",
    financialBadge: "Prevents $2M Cascading Outages",
    badgeTone: "warn",
    whatIsIt:
      "Silicon chips are sliced from round crystalline discs (wafers) in foundry production runs. Chips sliced from the outer rim of a disc naturally have different electrical leakage than center chips.",
    analogyTitle: "A Bakery Batch of Cookies & Fruit Sorting",
    analogyIcon: "🍪",
    analogyDesc:
      "Just like cookies baked near the edge of an oven tray can get crisper than cookies in the center, chips cut from the outer perimeter of a silicon wafer run hotter and need higher electrical voltage cushions.",
    financialImpact:
      "When one chip fails unexpectedly, knowing its factory wafer lot reveals whether 500 sister chips across the datacenter will die this week, preventing millions of dollars in uncoordinated crashes.",
    continuityFix:
      "Traces wafer coordinates to cordon marginal outer-edge die clusters and apply protective micro-voltage cushions before silent data corruption occurs.",
    relatedStoryId: "wafer_lot_contagion",
  },
  "/yield": {
    path: "/yield",
    category: "Silicon & Batches",
    title: "Factory Quality, Wafer Bins & Defect Curves",
    componentName: "Silicon Die Bins & Voltage Tolerances",
    financialBadge: "Shields $500k Rollback Disasters",
    badgeTone: "danger",
    whatIsIt:
      "Semiconductor factories test every chip and sort them into quality 'bins' based on maximum clock speed, thermal leakage, and minimum operating voltage (Vmin).",
    analogyTitle: "Sorting Apples by Grade at the Orchard",
    analogyIcon: "🍎",
    analogyDesc:
      "Not every apple picked from a tree is identical. Premium grade apples tolerate rough handling; lower-grade apples bruise easily. A chip placed on a hot top rack needs to be an 'A-grade' thermal performer.",
    financialImpact:
      "Placing high-leakage marginal chips in warm racks causes voltage dips during heavy compute bursts, silently corrupting training weights and forcing multi-day rollbacks.",
    continuityFix:
      "Workload-aware scheduling matches computing intensity and shelf airflow to each chip's factory electrical grade.",
    relatedStoryId: "silent_subthreshold_cliff",
  },
  "/mcm": {
    path: "/mcm",
    category: "Silicon & Batches",
    title: "Multi-Chip Module (MCM) & Packaging Assembly",
    componentName: "Compute Dies, HBM Memory Stacks & Microbumps",
    financialBadge: "Protects $35,000 Processor Modules",
    badgeTone: "accent",
    whatIsIt:
      "Modern AI accelerators are not single chips; they combine 2 computing dies and 8 High-Bandwidth Memory (HBM) stacks glued onto a silicon base using millions of microscopic solder beads.",
    analogyTitle: "A LEGO Block House Glued with Microscopic Solder",
    analogyIcon: "🧱",
    analogyDesc:
      "Think of multiple tiny silicon LEGO bricks joined together on a shared foundation. As the chip heats and cools repeatedly, thermal expansion can crack one microscopic solder bead.",
    financialImpact:
      "A single fractured microbump bricks a $35,000 processor module and immediately halts the $150M cluster if not caught before total electrical separation.",
    continuityFix:
      "Detects rising memory transfer retries and bus latency early, triggering an orderly job handoff before the solder connection completely shears.",
    relatedStoryId: "fractured_microbump",
  },
  "/boards": {
    path: "/boards",
    category: "Hardware & Racks",
    title: "Baseboard Power Delivery & Voltage Regulators",
    componentName: "Server Baseboard, VRM Rails & Copper Busbars",
    financialBadge: "Prevents $480k False Chip Swaps",
    badgeTone: "ok",
    whatIsIt:
      "The high-power motherboard that holds 8 accelerator processors and feeds them thousands of amps of DC electrical current from facility power supplies.",
    analogyTitle: "The Electrical Circuit Breaker Panel in a Kitchen",
    analogyIcon: "🔌",
    analogyDesc:
      "When one circuit breaker sags in a restaurant kitchen, all appliances on that counter shut off at once. Naive monitoring tools blame all 8 processors instead of identifying the single tripped power rail.",
    financialImpact:
      "Prevents mistakenly dispatching technicians to replace 8 to 16 healthy $35,000 processors ($280k–$560k) when the real issue was simply a $40 voltage regulator module.",
    continuityFix:
      "Power-domain topology correlation groups all chip alarms on the same circuit into a single facility baseboard ticket.",
    relatedStoryId: "innocent_chip_dying_board",
  },
  "/racks": {
    path: "/racks",
    category: "Hardware & Racks",
    title: "Rack Plumbing, Liquid Manifolds & Power Busways",
    componentName: "48U Liquid Server Racks & Coolant Distribution Units",
    financialBadge: "Averts $4.5M Thermal Meltdowns",
    badgeTone: "danger",
    whatIsIt:
      "The 7-foot steel cabinets housing 128 accelerators each, connected to pressurized liquid coolant hoses, drip-proof quick-disconnect manifolds, and 415V three-phase electric busways.",
    analogyTitle: "Plumbing & Radiators of a High-Rise Apartment",
    analogyIcon: "🏢",
    analogyDesc:
      "Just like an air bubble trapped in a high-rise heating pipe stops hot water from reaching top-floor apartments, a coolant pocket in a rack manifold can overheat 16 servers in under 45 seconds.",
    financialImpact:
      "A rack-level coolant flow failure risks burning out up to 128 accelerators ($4.5M in hardware) and stalling the entire 32k cluster.",
    continuityFix:
      "Monitors manifold pressure differentials (ΔP) and flow rates to trigger emergency checkpoints before temperatures breach safety trips.",
    relatedStoryId: "rack_thermal_shadow",
  },
  "/passport": {
    path: "/passport",
    category: "Intelligence & Provenance",
    title: "Digital Chip Passport & Cryptographic Identity",
    componentName: "Chip Electronic Chip ID (ECID) & Digital Twin",
    financialBadge: "Guarantees 100% Manufacturer Warranty Recourse",
    badgeTone: "accent",
    whatIsIt:
      "A cryptographic digital record tracking a processor's physical identity from raw silicon ingot to foundry, factory test, datacenter socket, and operating lifetime history.",
    analogyTitle: "A Vehicle VIN Number & Clean Carfax History",
    analogyIcon: "🛂",
    analogyDesc:
      "Just like a car's VIN number proves its manufacturing date, factory options, and accident history, a chip passport proves whether a failure was a manufacturer defect or a facility thermal incident.",
    financialImpact:
      "Eliminates warranty pushback from semiconductor manufacturers; ensures 100% of failed silicon gets replaced under factory warranty with zero financial friction.",
    continuityFix:
      "Links real-time telemetry directly with the chip's factory minimum operating voltage (Vmin) to prove fault provenance.",
    relatedStoryId: "innocent_chip_dying_board",
  },
  "/anomalies": {
    path: "/anomalies",
    category: "Intelligence & Provenance",
    title: "AI Predictive Early Warning & Slope Baselines",
    componentName: "Machine Learning Telemetry Inference Engine",
    financialBadge: "Recovers 90% of In-Flight Compute ($114k/hr)",
    badgeTone: "ok",
    whatIsIt:
      "Real-time algorithms that monitor the rate-of-change (thermal slopes) across sensor feeds to detect impending machine breakdowns 60 to 120 seconds before hardware trips.",
    analogyTitle: "The Car Engine Temperature Gauge Climbing on the Highway",
    analogyIcon: "🌡️",
    analogyDesc:
      "If you see your car's engine temperature gauge climbing steadily toward the red zone, you pull over safely before the radiator explodes. Traditional datacenters wait until the engine blows up.",
    financialImpact:
      "Saves up to 90% of computing progress that would otherwise evaporate during sudden hardware crashes, saving $114,688 for every crash avoided.",
    continuityFix:
      "Triggers an ultra-fast emergency micro-save to local solid-state storage right before the chip trips, then restarts training on a warm standby in 2 minutes.",
    relatedStoryId: "gradual_warning",
  },
  "/models": {
    path: "/models",
    category: "Intelligence & Provenance",
    title: "AI Helper Models & Operational Intelligence",
    componentName: "Workload-Aware Baseline Classifier Models",
    financialBadge: "Eliminates $40k False Alarm Hall Stalls",
    badgeTone: "warn",
    whatIsIt:
      "Specialized machine learning helper models that compare actual sensor readings against expected computing workload intensity.",
    analogyTitle: "A Busy Restaurant Dinner Rush vs A Kitchen Fire",
    analogyIcon: "🍳",
    analogyDesc:
      "When a restaurant kitchen gets busy on a Friday night, temperatures naturally rise. A smart chef knows the kitchen is just working hard; a dumb fire alarm panics and turns on the sprinklers.",
    financialImpact:
      "Prevents false alarms from shutting down healthy machines during heavy computational phases, eliminating $40,000+ in wasted downtime per incident.",
    continuityFix:
      "Evaluates temperature and power draw relative to active workload phase rather than rigid static alarm thresholds.",
    relatedStoryId: "healthy_workload_shift",
  },
  "/dependencies": {
    path: "/dependencies",
    category: "Operations & Telemetry",
    title: "Choir Ranks & Cross-Chip Mathematical Synchronization",
    componentName: "Distributed Tensor Parallel Topology Map",
    financialBadge: "Prevents Cluster Deadlock Freezes ($114k/hr)",
    badgeTone: "danger",
    whatIsIt:
      "The mathematical matrix mapping how 32,768 accelerators communicate across InfiniBand cables to synchronize equations during model pre-training.",
    analogyTitle: "A 32,768-Singer Choir in Perfect Harmony",
    analogyIcon: "🎵",
    analogyDesc:
      "Because large AI models split equations across thousands of chips, if one chip drops out without rebalancing the math, the remaining 32,767 chips will freeze waiting forever.",
    financialImpact:
      "Avoids silent distributed deadlocks where the entire $150M datacenter sits completely idle while electric power and facility bills burn $114,688 every hour.",
    continuityFix:
      "Enforces coordinated gang restarts and warm-standby swaps that preserve tensor-parallel geometry.",
    relatedStoryId: "unsupported_local_recovery",
  },
  "/devices": {
    path: "/devices",
    category: "Operations & Telemetry",
    title: "Sensor Telemetry & Health Heartbeats",
    componentName: "Physical Thermometers, Voltmeters & Fan Tachs",
    financialBadge: "Prevents Late-Night False Dispatches",
    badgeTone: "ok",
    whatIsIt:
      "The thousands of physical temperature, electrical current, and fan speed sensors embedded inside every processor, power supply, and server shelf.",
    analogyTitle: "Hospital Patient Vital Sign Monitors",
    analogyIcon: "💓",
    analogyDesc:
      "Like heart rate and blood pressure monitors in an intensive care unit, sensors provide real-time vital signs. If sensor readings arrive 10 minutes late, taking drastic actions can cause more harm than good.",
    financialImpact:
      "Prevents spurious automated machine quarantines and avoids waking up on-call technicians for machines that are already running normally.",
    continuityFix:
      "Epistemic abstention refuses to guess or take destructive actions when sensor readings are stale or missing.",
    relatedStoryId: "stale_telemetry",
  },
  "/incidents": {
    path: "/incidents",
    category: "Operations & Telemetry",
    title: "Downtime Incidents & Correlated Outage Log",
    componentName: "Root-Cause Topology Correlation Engine",
    financialBadge: "Cuts Diagnostic Time from 45m to 30s",
    badgeTone: "accent",
    whatIsIt:
      "An intelligent outage tracker that correlates dozens of simultaneous alarms into the single underlying physical failure.",
    analogyTitle: "Hospital Emergency Room Triage Board",
    analogyIcon: "🏥",
    analogyDesc:
      "When a patient has multiple symptoms from a single virus, treating every symptom as an independent disease wastes valuable medical resources. One cause = one treatment plan.",
    financialImpact:
      "Reduces Mean Time to Diagnose (MTTD) from 45 minutes of engineer meetings down to 30 seconds of automated topological analysis.",
    continuityFix:
      "Bundles related electrical, network, and thermal symptoms into a single root-cause incident ticket.",
    relatedStoryId: "shared_infrastructure",
  },
  "/checkpoints": {
    path: "/checkpoints",
    category: "Operations & Telemetry",
    title: "Saved Progress & NVMe Checkpoint Integrity",
    componentName: "Distributed Checkpoint Storage & NVMe Burst Buffers",
    financialBadge: "Averts $1.5M Corrupted Model Runs",
    badgeTone: "danger",
    whatIsIt:
      "The process of saving the AI model's mathematical brain weights from temporary chip memory onto permanent solid-state drives.",
    analogyTitle: "Saving a Word Document & Missing Pages Contract",
    analogyIcon: "💾",
    analogyDesc:
      "If your computer crashes while saving a document, you end up with a half-written file. Resuming an AI training run from an incomplete save file silently ruins the model's math.",
    financialImpact:
      "Prevents catastrophic restarts from corrupted save states that invalidate days or weeks of multi-million-dollar pretraining.",
    continuityFix:
      "Atomic two-phase verification gates inspect digital checksums across all 32k machines before advancing the resume pointer.",
    relatedStoryId: "incomplete_checkpoint",
  },
  "/recovery": {
    path: "/recovery",
    category: "Operations & Telemetry",
    title: "Operator Decisions & Automated Failover Actions",
    componentName: "Continuity Orchestrator & Action Approval Gate",
    financialBadge: "Cuts Downtime from 40m to 2m ($57k saved)",
    badgeTone: "ok",
    whatIsIt:
      "The command console where automated recovery playbooks execute fast-path node evictions or request human approval for high-impact actions.",
    analogyTitle: "The Flight Captain & Automatic Pilot System",
    analogyIcon: "🧑‍✈️",
    analogyDesc:
      "The autopilot handles routine turbulence instantly; when an engine issue occurs, it presents clear choices to the pilot so decisions happen in seconds rather than hours.",
    financialImpact:
      "Saves $57,000 every single crash by cutting cluster restart time from 40 minutes of manual technician triage down to 2 minutes of automated failover.",
    continuityFix:
      "Immediately recruits a warm standby machine already loaded with software containers and resumes from verified save.",
    relatedStoryId: "abrupt_failure",
  },
  "/audit": {
    path: "/audit",
    category: "Operations & Telemetry",
    title: "Compliance Audit Trail & Change Ledger",
    componentName: "Immutable Operational Event Ledger",
    financialBadge: "Unlocks Insurance & Vendor Warranty Recovery",
    badgeTone: "accent",
    whatIsIt:
      "A cryptographically verified event log recording every automated orchestrator decision, technician action, and telemetry alert.",
    analogyTitle: "The Black Box Flight Recorder of an Aircraft",
    analogyIcon: "📼",
    analogyDesc:
      "If an unexpected event happens, the black box proves exactly what altitude, speed, and pilot inputs occurred so there is zero debate about what happened.",
    financialImpact:
      "Provides forensic proof to chip vendors and insurers, guaranteeing full reimbursement for defective hardware.",
    continuityFix:
      "Immutable change ledger links physical sensor anomalies directly with recovery action timestamps.",
    relatedStoryId: "revolving_door",
  },
  "/experiments": {
    path: "/experiments",
    category: "Operations & Telemetry",
    title: "Continuity Strategy Comparison & A/B Benchmarks",
    componentName: "Empirical A/B Rehearsal Comparison Matrix",
    financialBadge: "Proves 14.2x ROI on Continuity Engineering",
    badgeTone: "ok",
    whatIsIt:
      "Side-by-side benchmark comparing traditional datacenter runbooks against automated continuity engineering under identical failure conditions.",
    analogyTitle: "Crash-Testing Two Cars Under Identical Conditions",
    analogyIcon: "🏎️",
    analogyDesc:
      "Put two identical cars in a crash test: one with standard airbags and emergency braking, one without. The data objectively proves the safety difference.",
    financialImpact:
      "Demonstrates the quantitative $41M/year capital preservation achieved by automated slope detection and warm standbys.",
    continuityFix:
      "Tracks useful training step yield and cluster stall burn across all 17 hardware crisis rehearsals.",
    relatedStoryId: "harmful_preventive",
  },
  "/data": {
    path: "/data",
    category: "Operations & Telemetry",
    title: "Telemetry Dictionary & Physical Signal Catalog",
    componentName: "Sensor Schema & Operational Dictionary",
    financialBadge: "Bridges Electrical, Facility & Boardroom Teams",
    badgeTone: "accent",
    whatIsIt:
      "A comprehensive dictionary defining every physical metric collected across processors, server baseboards, rack manifolds, and power substations.",
    analogyTitle: "The Medical Encyclopedia of Human Vital Signs",
    analogyIcon: "📖",
    analogyDesc:
      "A clear medical guide explaining what systolic blood pressure, oxygen saturation, and pulse mean in plain terms so doctors and patients understand each other.",
    financialImpact:
      "Prevents miscommunication between facility electricians, hardware technicians, and investment committees, avoiding costly false dispatches.",
    continuityFix:
      "Standardizes terms across electrical, thermal, and distributed AI engineering domains.",
    relatedStoryId: "stale_telemetry",
  },
  "/monitoring": {
    path: "/monitoring",
    category: "Operations & Telemetry",
    title: "Sensor Health & Collector Infrastructure",
    componentName: "High-Frequency Telemetry Collector Daemons",
    financialBadge: "Guarantees Real-Time Liveness for 32k Chips",
    badgeTone: "ok",
    whatIsIt:
      "The lightweight background network daemons that poll temperature and voltage sensors across all 32,768 accelerators every 100 milliseconds.",
    analogyTitle: "The Human Nervous System Carrying Pain Signals",
    analogyIcon: "⚡",
    analogyDesc:
      "If your hand touches a hot stove, your nervous system pulls your hand back in milliseconds. If your nerves were delayed, you would suffer severe burns.",
    financialImpact:
      "Ensures the datacenter is never flying blind; sub-second liveness detection stops minor heat rises from turning into full cluster freezes.",
    continuityFix:
      "Decouples lightweight health heartbeats from heavy metrics pipelines to guarantee real-time response.",
    relatedStoryId: "stale_telemetry",
  },
};

export function ExecutiveDeepDiveHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const translation = DEEP_DIVE_TRANSLATIONS[location.pathname];

  // If this route is not one of the 18 deep dives, do not render
  if (!translation) return null;

  return (
    <div className="deep-dive-exec-header">
      {/* Top Banner Row */}
      <div className="dd-exec-top-row">
        <div className="dd-exec-badge-wrap">
          <span className="dd-category-tag">{translation.category}</span>
          <span className="dd-component-tag">Physical Component: <strong>{translation.componentName}</strong></span>
          <span className={`dd-roi-badge tone-${translation.badgeTone}`}>
            {translation.financialBadge}
          </span>
        </div>

        <button
          type="button"
          className="dd-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
        >
          {collapsed ? "💡 Show Executive Translation ▾" : "▲ Minimize Executive Summary"}
        </button>
      </div>

      {/* Title & Analogy Headline */}
      <div className="dd-exec-title-row">
        <div className="dd-title-content">
          <h2 className="dd-exec-title">{translation.title}</h2>
          <div className="dd-analogy-headline">
            <span className="dd-analogy-icon">{translation.analogyIcon}</span>
            <span><strong>Everyday Analogy:</strong> {translation.analogyTitle}</span>
          </div>
        </div>
      </div>

      {/* Expanded 3-Column Executive Translation */}
      {!collapsed ? (
        <div className="dd-exec-body-grid">
          {/* Column 1: What is this? */}
          <div className="dd-exec-card">
            <div className="dd-card-header">
              <span className="dd-card-icon">❓</span>
              <h3>What is this physical part?</h3>
            </div>
            <p className="dd-card-text">{translation.whatIsIt}</p>
            <div className="dd-analogy-box">
              <strong>Analogous to:</strong> {translation.analogyDesc}
            </div>
          </div>

          {/* Column 2: Financial Impact */}
          <div className="dd-exec-card dd-card-danger">
            <div className="dd-card-header">
              <span className="dd-card-icon">💰</span>
              <h3>Why it matters to our $150M balance sheet</h3>
            </div>
            <p className="dd-card-text">{translation.financialImpact}</p>
            <div className="dd-stat-box">
              <span className="dd-stat-label">CLUSTER STALL RISK:</span>
              <strong className="text-danger">$114,688 / hr idle burn</strong>
            </div>
          </div>

          {/* Column 3: How Continuity Solves It */}
          <div className="dd-exec-card dd-card-ok">
            <div className="dd-card-header">
              <span className="dd-card-icon">🛡️</span>
              <h3>How Continuity Engineering Protects It</h3>
            </div>
            <p className="dd-card-text">{translation.continuityFix}</p>
            <div className="dd-action-box">
              <span className="dd-action-label">RECOVERY TIME (MTTR):</span>
              <strong className="text-ok">2 Minutes (Automated) vs 45m Manual</strong>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom Action & Cross-Navigation Bar */}
      <div className="dd-exec-actions-bar">
        <div className="dd-actions-left">
          {translation.relatedStoryId ? (
            <button
              type="button"
              className="hero-primary-btn"
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
              onClick={() => {
                navigate("/desk");
              }}
            >
              ⚡ Test This in 32k Live Simulator
            </button>
          ) : null}
          <NavLink
            to="/stories"
            className="hero-secondary-btn"
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem", textDecoration: "none" }}
          >
            💡 Related Executive Q&A Lounge
          </NavLink>
        </div>

        <div className="dd-actions-right">
          <NavLink
            to="/fleet"
            className="hero-secondary-btn"
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#60a5fa" }}
          >
            🌐 Global Fleet (131k)
          </NavLink>
          <NavLink
            to="/planner"
            className="hero-secondary-btn"
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem", textDecoration: "none", color: "#34d399" }}
          >
            🏗️ DC Planner
          </NavLink>
          <NavLink
            to="/"
            className="hero-secondary-btn"
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem", textDecoration: "none" }}
          >
            🌟 Portfolio Overview
          </NavLink>
        </div>
      </div>
    </div>
  );
}
