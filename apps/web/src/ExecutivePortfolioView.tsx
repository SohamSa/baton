import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { LiveFrame, RunView } from "./api";

export interface QAItem {
  id: string;
  category: "power" | "silicon" | "board" | "cooling" | "ai" | "sync";
  categoryLabel: string;
  question: string;
  analogyTitle: string;
  analogyIcon: string;
  plainEnglish: string;
  financialImpact: string;
  solution: string;
  hardwareTakeaway: string;
}

export const EXECUTIVE_QUESTIONS: QAItem[] = [
  {
    id: "gradual_warning",
    category: "cooling",
    categoryLabel: "High-Rise Cooling",
    question: "Why does our entire $150M cluster freeze when just one chip gets too warm?",
    analogyTitle: "The 32,768-Runner Baton Relay Race & Engine Temperature Gauge",
    analogyIcon: "🏃",
    plainEnglish:
      "Modern AI models require all chips to advance in lockstep. Think of a relay race where 32,768 runners must hand off their batons at the exact same second. If one chip heats up over several minutes like an engine temperature gauge climbing on the highway, standard datacenters wait until the chip crashes. That crash freezes the entire building, wiping out all progress made since the last hourly save.",
    financialImpact: "Recovers up to 90% of in-flight progress that would otherwise be lost ($114,688/hr cluster stall burn).",
    solution:
      "Dynamic thermal slope detection tracks the rate of temperature rise early. It triggers a lightweight micro-save right before failure, then seamlessly shifts the job to a warm standby machine in under 2 minutes.",
    hardwareTakeaway: "Equip server telemetry with sub-10s polling and direct interrupts to trigger saves before thermal trips.",
  },
  {
    id: "abrupt_failure",
    category: "sync",
    categoryLabel: "Cluster Continuity",
    question: "What happens when a machine dies instantly with zero warning?",
    analogyTitle: "The Light Bulb Pop & The 2-Minute Warm Standby",
    analogyIcon: "💡",
    plainEnglish:
      "Some hardware failures happen with zero warning, the way a light bulb suddenly pops. No sensor can predict it. Traditional datacenters waste 30 to 45 minutes having engineers diagnose the dead node, reboot the operating system, and manually reconstruct the cluster.",
    financialImpact: "Cuts cluster idle stall time from 30 minutes down to under 2 minutes ($57,000 saved per sudden crash).",
    solution:
      "Automated fast-path gang restart. The system doesn't waste time on diagnostics during live training; it immediately evicts the dead machine, recruits a warm standby node already loaded with software, and resumes training from the last verified save in 120 seconds.",
    hardwareTakeaway: "Maintain 1-2% warm unassigned standby nodes per network spine with pre-staged software containers.",
  },
  {
    id: "shared_infrastructure",
    category: "power",
    categoryLabel: "Facility Power",
    question: "If one power feed sags, why do monitoring tools report 16 separate broken chips?",
    analogyTitle: "Every Light on One Circuit Dimming at Once",
    analogyIcon: "🔌",
    plainEnglish:
      "When a circuit breaker or power feed sags in a rack, 16 processors lose electrical pressure at the exact same moment. Naive monitoring tools look at chips individually and file 16 separate emergency replacement tickets, causing technicians to mistakenly pull out and replace 16 perfectly healthy chips.",
    financialImpact: "Prevents dispatching technicians to replace 16 healthy $30,000 processors ($480k in false replacements).",
    solution:
      "Power-domain topology correlation. The system groups alarms by the underlying electrical circuit so that one tripped breaker generates exactly one facility ticket rather than 16 false chip failures.",
    hardwareTakeaway: "Ingest rack power distribution unit (PDU) and busbar IDs directly into the cluster scheduler topology map.",
  },
  {
    id: "healthy_workload_shift",
    category: "sync",
    categoryLabel: "Cluster Continuity",
    question: "Why do false alarms cost just as much as real crashes?",
    analogyTitle: "A Busy Kitchen Dinner Rush vs A Kitchen Fire",
    analogyIcon: "🍳",
    plainEnglish:
      "When an AI model enters a heavy calculation phase, processors naturally draw more wattage and heat up, like a restaurant kitchen heating up during the Friday night dinner rush. Traditional monitoring rules use rigid limits (e.g. 'alarm at 70°C'). They panic and shut down healthy machines that were simply working hard.",
    financialImpact: "Eliminates false-alarm job halts that waste tens of thousands of dollars in unneeded downtime.",
    solution:
      "Workload-aware adaptive thermal baselines. The system correlates computing intensity with temperature to recognize healthy hard work and leave machines running safely.",
    hardwareTakeaway: "Tune monitoring to evaluate temperature relative to workload intensity rather than raw absolute degrees.",
  },
  {
    id: "incomplete_checkpoint",
    category: "sync",
    categoryLabel: "Cluster Continuity",
    question: "Can we restart our AI job from a save file if the last pages were torn out?",
    analogyTitle: "The Contract with Missing Last Pages",
    analogyIcon: "📄",
    plainEnglish:
      "Saving a checkpoint across 32,768 chips takes massive storage bandwidth. If a network blip occurs mid-save, you end up with a half-baked save file—like a legal contract with the last three pages torn out. Trying to resume training from a corrupted save causes crash loops or silently corrupts the AI model's math.",
    financialImpact: "Prevents catastrophic restarts into corrupted states that invalidate days or weeks of pretraining.",
    solution:
      "Atomic two-phase verification gates. The system inspects digital checksums across all machines before advancing the resume pointer, refusing damaged saves and safely rolling back to the last complete save.",
    hardwareTakeaway: "Implement high-speed local NVMe burst buffers to stage save files before committing to shared storage.",
  },
  {
    id: "unsupported_local_recovery",
    category: "sync",
    categoryLabel: "Cluster Continuity",
    question: "Can we just unplug one broken chip and let the remaining 32,767 continue running?",
    analogyTitle: "The Choir Singing in Perfect Harmony",
    analogyIcon: "🎵",
    plainEnglish:
      "Because large AI models split their mathematical equations across chips in rigid dimensions, dropping one dead chip without reconfiguring the math breaks the entire equation. The remaining chips will freeze in a silent deadlock, waiting forever for a partner that is no longer there.",
    financialImpact: "Avoids silent deadlock hangs where tens of thousands of chips sit idle burning $114,688/hr.",
    solution:
      "Distributed topology contract enforcement. The platform enforces coordinated group restarts rather than attempting dangerous, uncoordinated individual chip dropouts.",
    hardwareTakeaway: "Audit whether your AI framework supports elastic reconfiguration before designing cluster recovery playbooks.",
  },
  {
    id: "stale_telemetry",
    category: "ai",
    categoryLabel: "AI Guardrails",
    question: "What should our automated system do if sensor readings arrive 10 minutes late?",
    analogyTitle: "The Thermometer from Last Week",
    analogyIcon: "🌡️",
    plainEnglish:
      "During heavy network traffic, sensor readings can queue up and arrive minutes late. Automated systems that act on 10-minute-old readings will mistakenly quarantine machines that already cooled down and are running normally.",
    financialImpact: "Prevents spurious automated machine quarantines and unnecessary late-night technician pages.",
    solution:
      "Epistemic abstention. When sensor readings are older than their freshness expiration, the platform refuses to guess or take destructive actions until fresh readings arrive.",
    hardwareTakeaway: "Decouple lightweight health heartbeats from heavy metrics pipelines to guarantee real-time liveness.",
  },
  {
    id: "harmful_preventive",
    category: "cooling",
    categoryLabel: "High-Rise Cooling",
    question: "Can being too cautious with temperature limits actually cost more money than letting the chip run?",
    analogyTitle: "Pulling a Healthy Marathon Runner Off the Course",
    analogyIcon: "🏃",
    plainEnglish:
      "A rigid safety rule pulls a chip out of service the moment it touches a preset temperature during a brief compute burst. Our side-by-side benchmark proves that stopping the entire cluster caused far more financial damage than letting the chip safely complete the burst.",
    financialImpact: "Directly preserves $40,000+ in compute progress that naive monitoring scripts routinely throw away.",
    solution:
      "Dynamic residual tracking. Evaluates the difference between expected workload heat and actual heat, avoiding unnecessary shutdowns during brief high-power bursts.",
    hardwareTakeaway: "Configure datacenter chilled-water loops to ramp dynamically with cluster power spikes.",
  },
  {
    id: "silent_straggler",
    category: "silicon",
    categoryLabel: "Silicon Health",
    question: "Why is our AI training taking weeks longer than projected even though no machines crashed?",
    analogyTitle: "The Tired Runner Slowing Down the Entire Formation",
    analogyIcon: "🐢",
    plainEnglish:
      "One single processor throttles by just 8% due to minor silicon degradation without ever crashing. Because all 32,768 chips must synchronize every mathematical step, every single chip is forced to wait for the slowest runner, dragging down cluster speed in total silence.",
    financialImpact: "Burns $220,000/day ($1M-$3M/month on a 32k cluster) in silent idle stall waste across the facility.",
    solution:
      "Cross-chip latency tracking. Detects the slow runner outlier in real time, cordons the degraded node, and gracefully drains it during the next scheduled save without interrupting active training.",
    hardwareTakeaway: "Correlate chip serial numbers with step latency to spot batch-level thermal and speed drift.",
  },
  {
    id: "revolving_door",
    category: "sync",
    categoryLabel: "Cluster Continuity",
    question: "Why do recently repaired machines crash again minutes after being plugged back in?",
    analogyTitle: "The Hospital Discharge Trap & Treadmill Stress Test",
    analogyIcon: "🏥",
    plainEnglish:
      "A technician reboots a crashed machine and sees it pass a quick idle check. They plug it back into the live 32,768-chip training job. As soon as full mathematical load hits, the machine relapses and crashes a second time, forcing another 40-minute cluster-wide outage.",
    financialImpact: "Eliminates repeat cluster restarts, saving $100,000 to $300,000 per unstable machine event.",
    solution:
      "Automated canary test gates. Recovered nodes must pass an isolated 5-minute synthetic stress test before being promoted back into the live production group.",
    hardwareTakeaway: "Never allow unvalidated node re-enrollment directly into synchronous pretraining jobs.",
  },
  {
    id: "power_cliff",
    category: "power",
    categoryLabel: "Facility Power",
    question: "Can launching an AI model across 32,768 chips blow the local power substation?",
    analogyTitle: "Turning on 10,000 Air Conditioners in the Exact Same Microsecond",
    analogyIcon: "⚡",
    plainEnglish:
      "When 32,768 processors launch heavy matrix calculations simultaneously, power demand spikes by 16 Megawatts in under 50 milliseconds. This instantaneous electrical shockwave trips substation master breakers and browns out entire server rows.",
    financialImpact: "Prevents facility-wide blackout events that take 4+ hours of manual utility reset and cost millions.",
    solution:
      "Substation surge pacing. Micro-staggers matrix launches by 5-10 milliseconds across server rows to smooth power spikes and keep the building grid stable without sacrificing job speed.",
    hardwareTakeaway: "Equip rack busbars with sub-cycle high-speed voltage logging linked directly into the cluster scheduler.",
  },
  {
    id: "fractured_microbump",
    category: "board",
    categoryLabel: "Circuit Board & Packaging",
    question: "How do we fix a microscopic cracked wire inside a chip without throwing away a $25,000 processor?",
    analogyTitle: "The Miniature City with Built-In Backup Spare Wires",
    analogyIcon: "🏙️",
    plainEnglish:
      "Inside modern processors, microscopic solder wires (thinner than a human hair) connect computing chiplets to memory. Under heat expansion, a wire cracks intermittently, causing data packet drops. Simple software restarts fail repeatedly, wasting hundreds of thousands of dollars.",
    financialImpact: "Saves $25,000+ per multi-chip package by repairing it in place, cutting repair time from 4 hours to 45 seconds.",
    solution:
      "Automated multi-chip package diagnostics. In-situ testing isolates the cracked microscopic wire and electronically remaps traffic to a built-in backup spare wire in 45 seconds.",
    hardwareTakeaway: "Require chip manufacturers to include redundant die-to-die spare wires (UCIe) in purchase contracts.",
  },
  {
    id: "wafer_lot_contagion",
    category: "silicon",
    categoryLabel: "Silicon Health",
    question: "If one chip dies of a factory manufacturing flaw, will other chips break too?",
    analogyTitle: "The Bad Bakery Batch & Automaker Airbag Recall",
    analogyIcon: "🍞",
    plainEnglish:
      "Chips sliced from the outer edge of a silicon disc share the same chemical impurities from the factory. When one dies, replacing it one by one leaves 14 sister chips waiting to fail over the next three weeks, causing cascading crashes across the facility.",
    financialImpact: "Prevents 5 to 10 rolling cluster crashes ($1M-$2M saved) by eliminating the bad batch in one clean rotation.",
    solution:
      "Digital birth certificate tracking. Traces the failed chip's wafer lot genealogy, automatically flags all 14 sister chips across the facility, and safely swaps them out during normal scheduled breaks.",
    hardwareTakeaway: "Mandate digital birth certificates (wafer lot ID and disc slice coordinates) recorded in on-board chip memory.",
  },
  {
    id: "innocent_chip_dying_board",
    category: "board",
    categoryLabel: "Circuit Board & Packaging",
    question: "Why throw away a healthy $30,000 processor when a $10 circuit board part failed?",
    analogyTitle: "Scrapping a $30,000 Car Engine Because the $10 Alternator Broke",
    analogyIcon: "🚗",
    plainEnglish:
      "A cheap $10 voltage regulator module on the circuit board fails, causing electrical pressure dips during heavy computing. Uninformed technicians mistakenly replace the healthy $30,000 chip. The manufacturer rejects the warranty claim, and the new chip crashes immediately on the same faulty board.",
    financialImpact: "Eliminates false $30,000 chip replacements, warranty claim rejections, and repeat cluster outages.",
    solution:
      "Baseboard power line diagnostics. Cross-references the chip's flawless factory history with circuit board power sensors, proving the board is at fault and redistributing power across remaining board phases.",
    hardwareTakeaway: "Instrument carrier boards with per-phase current sensors; enforce board diagnostics before approving chip RMAs.",
  },
  {
    id: "rack_thermal_shadow",
    category: "cooling",
    categoryLabel: "High-Rise Cooling",
    question: "Why are processors on our top shelves overheating while bottom shelves stay cool?",
    analogyTitle: "The Pinched Garden Hose in a 16-Story High-Rise",
    analogyIcon: "🏢",
    plainEnglish:
      "A valve blockage in the rack liquid cooling supply manifold starves the upper shelves, like a pinched garden hose in a 16-story building. Heat builds up into a rising thermal wave across 32 processors until all 32 trip their safety shut-offs simultaneously.",
    financialImpact: "Prevents simultaneous 32-processor overheating cascades, protecting $180,000 in lost computing time per incident.",
    solution:
      "Rack vertical elevation mapping. Detects spatial heat gradients (top vs bottom ΔT > 10°C) and pressure drops, proactively triggering a clean save and an automated coolant line flush before chips overheat.",
    hardwareTakeaway: "Install digital differential pressure sensors on rack cooling manifolds and map vertical shelf elevation.",
  },
  {
    id: "cold_plate_torque_fracture",
    category: "board",
    categoryLabel: "Circuit Board & Packaging",
    question: "How do we prove an assembly plant mistake was the manufacturer's fault and not ours?",
    analogyTitle: "The Unbroken Carfax Vehicle History Report",
    analogyIcon: "📋",
    plainEnglish:
      "An uncalibrated power screwdriver at the contract assembly factory over-tightened cooling clamp screws by 32%, bending the underlying circuit board. Under operating heat, solder joints crack under high-speed memory towers. Reactive policies blame random silicon, leaving 16 sister machines to crash over weeks.",
    financialImpact: "Recovers $480,000 in automated factory warranty credits and prevents 3 to 6 secondary cluster stalls ($600,000+ saved).",
    solution:
      "Cradle-to-grave digital passport. Correlates the chip's complete history from foundry to the assembly bench, proving factory screw over-torque, claiming 100% warranty credit, and cordoning sister machines.",
    hardwareTakeaway: "Mandate automated screw torque telemetry logging and board strain sensors in all system procurement contracts.",
  },
  {
    id: "silent_subthreshold_cliff",
    category: "ai",
    categoryLabel: "AI Guardrails",
    question: "Can processors make silent math errors even when running at comfortable temperatures?",
    analogyTitle: "The High-Rise Water Pressure Dip Causing Faucets to Sputter",
    analogyIcon: "💧",
    plainEnglish:
      "Processors sliced from the outer edge of a silicon disc need higher electrical voltage cushions. During heavy computing bursts, voltage dips push high-leakage chips over a timing cliff even at comfortable temperatures (71°C). Traditional tools miss this until silent math calculation errors corrupt training weights.",
    financialImpact: "Prevents catastrophic multi-day rollbacks from silent data corruption ($500k-$1.5M saved per incident).",
    solution:
      "Silicon-context AI early warning. Combines real-time voltage and temperature with the chip's factory birth certificate. Detects safety cushion collapse 60 seconds early and applies micro-pacing to restore safety without stopping training.",
    hardwareTakeaway: "Incorporate per-chip factory minimum voltage requirements into your telemetry inference pipeline.",
  },
];

export function ExecutivePortfolioView({
  run,
  frames,
  playing,
  onPlayRehearsal,
  onOpenPracticeFloor,
  onOpenTour,
}: {
  run: RunView | null;
  frames: LiveFrame[];
  playing: boolean;
  onPlayRehearsal: (storyId: string) => void;
  onOpenPracticeFloor: () => void;
  onOpenTour: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string>("gradual_warning");

  const live = frames[frames.length - 1];
  const cluster = live?.cluster ?? run?.cluster;

  const filteredQuestions = useMemo(() => {
    return EXECUTIVE_QUESTIONS.filter((item) => {
      const matchesCat = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.analogyTitle.toLowerCase().includes(q) ||
        item.plainEnglish.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="portfolio-container">
      {/* 1. EXECUTIVE HERO BANNER */}
      <header className="portfolio-hero">
        <div className="portfolio-hero-left">
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="executive-badge">EXECUTIVE CONTINUITY PORTFOLIO</span>
            <div className="portfolio-live-chip-status">
              <span>Cluster Scope: <strong>{cluster ? cluster.accelerator_count.toLocaleString() : "32,768"} Accelerators</strong></span>
              <span>· Status: <strong className={run?.pending_action ? "text-warn" : playing ? "text-accent" : "text-ok"}>{run?.pending_action ? "Awaiting Decision" : playing ? "Simulating Live" : "Ready"}</strong></span>
            </div>
          </div>
          <h1 className="portfolio-title">
            When 1 Chip Stumbles, Why Does a $150 Million Datacenter Freeze?
          </h1>
          <p className="portfolio-subtitle">
            In modern AI pre-training, 32,768 processors advance in lockstep like runners in a relay race or singers in a choir.
            If just 1 chip overheats or drops, the baton stops and the entire facility freezes while electric power, cooling, and staff burn $114,688 every hour.
            Here is how continuity engineering protects your capital, eliminates idle stall waste, and keeps the choir singing.
          </p>
          <div className="portfolio-hero-actions">
            <button type="button" className="hero-primary-btn" onClick={onOpenPracticeFloor}>
              ⚡ Open Live Practice Floor (32k GPU Simulator)
            </button>
            <NavLink to="/clean-hands" className="hero-secondary-btn" style={{ textDecoration: "none" }}>
              🛡️ Tenant Dispute & Clean Hands Portal
            </NavLink>
            <button type="button" className="hero-secondary-btn" onClick={onOpenTour}>
              ✦ Take the 2-Minute Executive Tour
            </button>
          </div>
        </div>
      </header>

      {/* 2. THE FOUR EXECUTIVE FINANCIAL PILLARS */}
      <section className="portfolio-metrics-grid">
        <div className="exec-stat-card">
          <span className="stat-label">CLUSTER CAPITAL VALUE</span>
          <strong className="stat-value text-accent">$150 Million</strong>
          <p className="stat-desc">32,768 Synchronous AI Accelerators across 256 liquid-cooled server racks.</p>
        </div>
        <div className="exec-stat-card">
          <span className="stat-label">CLUSTER STALL BURN RATE</span>
          <strong className="stat-value text-danger">$114,688 / hr</strong>
          <p className="stat-desc">Cash lost every hour all 32,768 chips sit idle waiting for 1 crashed node.</p>
        </div>
        <div className="exec-stat-card">
          <span className="stat-label">PREEMPTIVE WORK PRESERVED</span>
          <strong className="stat-value text-ok">Up to 90%</strong>
          <p className="stat-desc">In-flight computing progress saved before thermal or electrical shutdown.</p>
        </div>
        <div className="exec-stat-card">
          <span className="stat-label">RECOVERY TIME (MTTR)</span>
          <strong className="stat-value text-accent">2 Minutes</strong>
          <p className="stat-desc">Automated fast-path gang restart vs 40+ minutes of manual technician triage.</p>
        </div>
      </section>

      {/* 3. THE THREE FATAL OPERATIONAL LEAKS */}
      <section className="leaks-section">
        <div className="section-head">
          <h2>The Three Fatal Operational Leaks</h2>
          <p className="muted">Why conventional datacenter runbooks lose millions of dollars during AI pretraining campaigns.</p>
        </div>
        <div className="leaks-grid">
          <article className="leak-card leak-stall">
            <div className="leak-header">
              <span className="leak-num">LEAK 01</span>
              <h3>The Cluster Stall</h3>
            </div>
            <p className="leak-body">
              One chip in the placed job stops, and the whole job stops with it. The other 32,767 machines remain powered and cooled, but produce zero progress.
              You pay full electric and facility bills for a building that is waiting.
            </p>
            <div className="leak-footer">
              <span>Financial Impact:</span>
              <strong>$114,688 / hour idle waste</strong>
            </div>
          </article>

          <article className="leak-card leak-unsaved">
            <div className="leak-header">
              <span className="leak-num">LEAK 02</span>
              <h3>The Unsaved Work</h3>
            </div>
            <p className="leak-body">
              Work that lives only in machine memory is like an unsaved document. When a crash occurs between hourly checkpoints or an unverified save fails,
              days of progress evaporate and must be recomputed from scratch.
            </p>
            <div className="leak-footer">
              <span>Financial Impact:</span>
              <strong>$500k – $1.5M per corrupted run</strong>
            </div>
          </article>

          <article className="leak-card leak-alarm">
            <div className="leak-header">
              <span className="leak-num">LEAK 03</span>
              <h3>The Costly False Alarm</h3>
            </div>
            <p className="leak-body">
              A busy computing burst heats chips up like a kitchen dinner rush. Rigid alarm rules panic and shut down healthy machines,
              throwing away more valuable progress than the breakdown they were trying to prevent.
            </p>
            <div className="leak-footer">
              <span>Financial Impact:</span>
              <strong>$40,000+ thrown away per false alarm</strong>
            </div>
          </article>
        </div>
      </section>

      {/* 4. THE 17 EXECUTIVE QUESTIONS & ANSWERS (WITH ANALOGIES) */}
      <section className="qa-section">
        <div className="section-head">
          <div className="qa-head-row">
            <div>
              <h2>17 Business Questions Every Datacenter Owner Must Know</h2>
              <p className="muted">
                Explore every hardware challenge through simple real-world analogies, financial stakes, and 1-click interactive rehearsals.
              </p>
            </div>
            <div className="qa-search-box">
              <input
                type="search"
                placeholder="Search by question or analogy (e.g. cooling, car engine, bakery, screws, grid)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search questions"
              />
            </div>
          </div>

          <div className="category-pills">
            {[
              { id: "all", label: "All Questions (17)" },
              { id: "cooling", label: "❄️ High-Rise Cooling (3)" },
              { id: "power", label: "⚡ Facility Power & Grid (2)" },
              { id: "board", label: "🔌 Circuit Boards & Wires (3)" },
              { id: "silicon", label: "🏭 Silicon Batches & Health (2)" },
              { id: "ai", label: "🤖 AI Guardrails & Glitches (2)" },
              { id: "sync", label: "🏃 Cluster Sync & Recovery (5)" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${activeCategory === cat.id ? "pill-active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="qa-accordion-list">
          {filteredQuestions.length === 0 ? (
            <p className="panel muted">No questions match your search filter.</p>
          ) : (
            filteredQuestions.map((qa, index) => {
              const isExpanded = expandedId === qa.id;
              return (
                <article key={qa.id} className={`qa-card ${isExpanded ? "qa-expanded" : ""}`}>
                  <header
                    className="qa-card-header"
                    onClick={() => setExpandedId(isExpanded ? "" : qa.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedId(isExpanded ? "" : qa.id);
                      }
                    }}
                  >
                    <div className="qa-title-left">
                      <span className="qa-counter">Q{index + 1}</span>
                      <div className="qa-text-wrap">
                        <span className="qa-category-tag">{qa.categoryLabel}</span>
                        <h3 className="qa-question">{qa.question}</h3>
                        <div className="qa-analogy-badge">
                          <span>{qa.analogyIcon}</span>
                          <strong>Analogy:</strong> {qa.analogyTitle}
                        </div>
                      </div>
                    </div>
                    <div className="qa-toggle-icon">{isExpanded ? "▲" : "▼"}</div>
                  </header>

                  {isExpanded ? (
                    <div className="qa-content-body">
                      <div className="qa-grid-details">
                        <div className="qa-col">
                          <h4>💡 In Simple Words</h4>
                          <p>{qa.plainEnglish}</p>
                        </div>
                        <div className="qa-col">
                          <h4>🛡️ How Continuity Engineering Solves It</h4>
                          <p>{qa.solution}</p>
                          <div className="qa-hardware-box">
                            <strong>Hardware Takeaway:</strong> {qa.hardwareTakeaway}
                          </div>
                        </div>
                      </div>

                      <div className="qa-action-footer">
                        <div className="qa-roi-tag">
                          <span>Bottom-Line Impact:</span>
                          <strong>{qa.financialImpact}</strong>
                        </div>
                        <button
                          type="button"
                          className="qa-run-btn"
                          onClick={() => onPlayRehearsal(qa.id)}
                          disabled={playing}
                        >
                          {playing ? "Simulation In Progress…" : "▶️ Test This in Live Simulator"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* 5. BOTTOM CTA TO PRACTICE FLOOR */}
      <section className="portfolio-bottom-cta panel">
        <div>
          <h2>Ready to See Continuity Engineering in Action?</h2>
          <p>
            Switch to the Live Practice Floor to simulate how all 32,768 chips behave in real time across all 17 rehearsals.
          </p>
        </div>
        <button type="button" className="hero-primary-btn" onClick={onOpenPracticeFloor}>
          ⚡ Open Live Practice Floor Now
        </button>
      </section>
    </div>
  );
}
