import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { LiveFrame, RunView } from "./api";

export interface TenantDisputeCase {
  id: string;
  tenantName: string;
  tenantTier: string;
  clusterSize: string;
  hourlyRate: string;
  incidentTimestamp: string;
  claimAmount: string;
  claimSummary: string;
  icon: string;
  verdictType: "exonerated" | "mitigated" | "settled";
  verdictTitle: string;
  verdictBadge: string;
  slaPenaltyOwed: string;
  dollarsProtected: string;
  rootCauseCategory: "Tenant Software Bug" | "Proactively Mitigated Hardware" | "Facility Infrastructure Issue";
  allegationText: string;
  facilityTelemetryProof: string;
  applicationSoftwareProof: string;
  certificateId: string;
  sha256Hash: string;
  contractClause: string;
  resolutionSummary: string;
  emailSubject: string;
  emailBody: string;
}

export const DISPUTE_CASES: TenantDisputeCase[] = [
  {
    id: "case_midnight_oom",
    tenantName: "Frontier-AI Labs",
    tenantTier: "Hyperscale Frontier Pre-training",
    clusterSize: "32,768 GPUs (Pod Alpha)",
    hourlyRate: "$3.50/GPU-hr ($114,688/hr cluster burn)",
    incidentTimestamp: "2026-09-28 02:14:08 UTC",
    claimAmount: "$350,000.00",
    claimSummary: "Tenant claims facility cooling failure overheated server nodes and aborted their 400B parameter pre-training run.",
    icon: "🔥",
    verdictType: "exonerated",
    verdictTitle: "Datacenter Fully Exonerated (Tenant Software Fault)",
    verdictBadge: "🛡️ 100% EXONERATED · ZERO FACILITY FAULT",
    slaPenaltyOwed: "$0.00",
    dollarsProtected: "$350,000.00",
    rootCauseCategory: "Tenant Software Bug",
    allegationText:
      "Tenant VP filed an emergency high-priority ticket alleging that Datacenter Pod Alpha experienced a chilled-water failure, causing GPU temperatures to trip and killing rank 142. They demanded $350,000 in SLA breach credits and threatened lease termination.",
    facilityTelemetryProof:
      "Facility chilled-water supply remained at a stable 18.2°C (±0.3°C). Rack 14 cooling manifold differential pressure was nominal at 1.42 bar. All 32,768 accelerator temperatures were within safe operating envelopes (average 58.4°C, peak 64.1°C). Zero hardware thermal throttling alarms were tripped.",
    applicationSoftwareProof:
      "Tenant's PyTorch process memory log reveals uncollected activation tensors leading to an unhandled CUDA Out-Of-Memory (OOM) exception on worker rank 142 at 02:14:06 UTC. Exit code 137 (SIGKILL by host OS kernel OOM-killer). Tenant's training script lacked try-catch error recovery.",
    certificateId: "CERT-SLA-2026-0928-8841",
    sha256Hash: "e9a4f28c049b167d3e201bfa829104f291048ca09e13d9482710fb3810294821",
    contractClause: "Master Service Agreement § 4.2 (Facility Availability vs. User Application Code Failures)",
    resolutionSummary:
      "Comprehensive telemetry definitively proves zero datacenter infrastructure failure. The interruption was solely caused by tenant application software memory exhaustion. Under § 4.2 of the Master Service Agreement, no SLA credit is applicable. Customer claim rejected with verified proof.",
    emailSubject: "Resolution of Incident Dispute #DISP-8841 - Cluster Pod Alpha (Frontier-AI Labs)",
    emailBody: `Dear Infrastructure Team at Frontier-AI Labs,

We have completed the official telemetry audit regarding the training run interruption reported on Pod Alpha at 02:14 UTC.

Our autonomous Clean Hands arbitration engine inspected all physical infrastructure sensors, chilled-water manifold pressure, rack busbar power feeds, and accelerator telemetry across all 32,768 chips.

Audit Findings:
1. Facility Cooling & Power: Chilled-water supply remained nominal at 18.2°C (target: 18.0°C - 21.0°C). Zero thermal trip flags occurred across any of your leased nodes.
2. Root Cause Determination: Physical telemetry confirms the interruption was initiated by an unhandled PyTorch CUDA Out-Of-Memory (OOM) exception within your training container on rank 142, resulting in OS kernel process termination (Exit Code 137).

Determination:
Under Section 4.2 of your Master Service Agreement, Service Level Credits apply exclusively to datacenter facility outages exceeding 15 consecutive minutes. Because our facility maintained 100% operational availability, no SLA breach occurred, and the claimed $350,000 credit is respectfully declined.

Attached is your official Cryptographically Signed Incident Certificate (#CERT-SLA-2026-0928-8841) for your technical records. Our AI solutions architects are available to assist your engineers with activation checkpointing optimizations to prevent future CUDA memory exhaustion.

Sincerely,
Office of the VP of Infrastructure Operations`,
  },
  {
    id: "case_thermal_mitigated",
    tenantName: "Apex Robotics Corp",
    tenantTier: "Enterprise Foundation Model",
    clusterSize: "4,096 GPUs (Pod Gamma)",
    hourlyRate: "$2.85/GPU-hr ($11,673/hr cluster burn)",
    incidentTimestamp: "2026-09-27 16:42:19 UTC",
    claimAmount: "$120,000.00",
    claimSummary: "Tenant claims GPU #3 thermal spike halted training and ruined an entire training day.",
    icon: "🌡️",
    verdictType: "mitigated",
    verdictTitle: "Hardware Anomaly Proactively Mitigated (SLA Met)",
    verdictBadge: "⚡ PROACTIVELY MITIGATED · SLA 100% MET",
    slaPenaltyOwed: "$0.00",
    dollarsProtected: "$120,000.00",
    rootCauseCategory: "Proactively Mitigated Hardware",
    allegationText:
      "Tenant engineers observed GPU-3 temperature climb to 78°C and claimed the datacenter failed to maintain cooling, alleging that their multi-node training run was corrupted and 24 hours of training progress was permanently lost.",
    facilityTelemetryProof:
      "Predictive thermal slope analysis detected early heat build-up on Node 12 GPU-3 at 72°C (well before thermal shutdown). The datacenter system automatically triggered a coordinated 12-second micro-save, safely drained the node, recruited pre-warmed standby Node 48, and restored full lockstep training in exactly 118 seconds.",
    applicationSoftwareProof:
      "All weight gradients were successfully committed to NVMe burst buffer storage prior to node eviction. Total cluster interruption time was 118 seconds (1.96 minutes), well within the contractual 15-minute maintenance recovery threshold. Zero training loss occurred.",
    certificateId: "CERT-SLA-2026-0927-4109",
    sha256Hash: "b840192a83019f840192a019e048102948201948201938572019384729104820",
    contractClause: "Master Service Agreement § 5.1 (Automated Failover & Maintenance Allowance)",
    resolutionSummary:
      "A physical hardware thermal degradation was detected, but automated micro-checkpointing and warm-standby migration resolved the event in under 2 minutes. Training resumed with zero lost steps. Contractual SLA guarantees 99.9% uptime (up to 43 minutes allowable monthly maintenance). SLA fully upheld; claim denied.",
    emailSubject: "Telemetry Incident Review: Node 12 Failover - Apex Robotics Cluster",
    emailBody: `Dear Apex Robotics Engineering Leadership,

We have reviewed your inquiry regarding the Node 12 failover event on Pod Gamma yesterday at 16:42 UTC.

Telemetry Audit Summary:
1. Incident: Thermal slope monitoring detected anomalous thermal resistance on Node 12 GPU-3.
2. Automated Mitigation: Rather than allowing the chip to crash, our automated continuity controller triggered an atomic 12-second micro-checkpoint and migrated your job to pre-staged standby Node 48.
3. Total Outage Time: Full cluster training resumed in 118 seconds. All in-flight tensor weights were preserved in NVMe cache. Zero mathematical work was lost.

SLA Determination:
Under Section 5.1 of our Enterprise SLA, downtime is defined as unmitigated service disruption exceeding 15 consecutive minutes. Because your job was safely resumed in under 2 minutes with zero data loss, uptime for the billing period remains at 99.98%.

Attached is Incident Certificate #CERT-SLA-2026-0927-4109. No service penalty credits are owed. We have permanently replaced the degraded server tray in the background with zero disruption to your team.

Best regards,
Datacenter Customer Operations`,
  },
  {
    id: "case_silent_corruption",
    tenantName: "Nexus Generative Inc",
    tenantTier: "AI Cloud Startup Cluster",
    clusterSize: "1,024 GPUs (Pod Delta)",
    hourlyRate: "$2.20/GPU-hr ($2,252/hr cluster burn)",
    incidentTimestamp: "2026-09-25 11:30:45 UTC",
    claimAmount: "$250,000.00",
    claimSummary: "Tenant claims silent hardware memory errors (flaky bit flips) corrupted their generative model weights.",
    icon: "🧬",
    verdictType: "exonerated",
    verdictTitle: "Datacenter Fully Exonerated (Hyperparameter Divergence)",
    verdictBadge: "🛡️ 100% EXONERATED · SILICON HARDWARE VERIFIED",
    slaPenaltyOwed: "$0.00",
    dollarsProtected: "$250,000.00",
    rootCauseCategory: "Tenant Software Bug",
    allegationText:
      "Tenant claimed that a faulty memory cell in the datacenter silently flipped data bits during matrix multiplication, causing their training loss curve to explode into NaNs and invalidating 3 days of compute ($250,000 value).",
    facilityTelemetryProof:
      "Complete in-situ hardware diagnostic logs reveal zero single-bit or double-bit ECC memory errors across all 1,024 GPUs. PCIe and NVLink CRC cyclic redundancy error counters remained at 0 across all 3 days. High-speed hardware BIST (Built-In Self Test) verified 100% arithmetic unit integrity.",
    applicationSoftwareProof:
      "Telemetry correlating learning rate schedule with loss gradient norms shows that tenant's training code increased learning rate by 10x without gradient clipping at step 42,000, inducing mathematical divergence (exploding gradient NaN) in the AdamW optimizer. Root cause is algorithmic divergence, not silicon fault.",
    certificateId: "CERT-SLA-2026-0925-1102",
    sha256Hash: "f1902847291048201948201938572019384729104820b840192a83019f840192",
    contractClause: "Master Service Agreement § 6.3 (Numerical Accuracy & Software Stability Disclaimer)",
    resolutionSummary:
      "Rigorous hardware memory ECC telemetry and arithmetic unit diagnostics prove 100% hardware integrity with zero flipped bits. Mathematical analysis confirms the model exploded due to tenant learning-rate scheduler configuration without gradient clipping. 100% datacenter exoneration.",
    emailSubject: "Root Cause Investigation: Training Loss Divergence - Nexus Generative Inc",
    emailBody: `Dear Nexus Generative AI Team,

We have conducted a thorough hardware forensic audit following your report of numerical instability and loss divergence on Pod Delta.

Hardware Forensic Findings:
1. Memory Parity & ECC: All 1,024 GPUs logged zero single-bit or multi-bit ECC errors over the 72-hour window.
2. Interconnect Integrity: High-speed NVLink packet checks showed zero CRC transmission retries or dropped packets.
3. Arithmetic Diagnostics: Deep silicon arithmetic unit verification passed with zero faults.

Mathematical Root Cause:
Telemetry analysis of model gradient norms indicates that your optimizer encountered a numerical gradient explosion following a scheduled learning-rate increase at step 42,000 without enabled gradient norm clipping, resulting in floating-point overflow (NaN).

Conclusion:
Because the hardware operated with 100% precision, no hardware failure or SLA breach occurred. Attached is Certificate #CERT-SLA-2026-0925-1102 certifying hardware perfection. We recommend enabling gradient norm clipping (max_norm=1.0) in your training configuration.

Sincerely,
Hardware Reliability & Audit Team`,
  },
  {
    id: "case_power_cliff",
    tenantName: "Cognitive Cloud Networks",
    tenantTier: "Enterprise Foundation Model",
    clusterSize: "16,384 GPUs (Pod Beta)",
    hourlyRate: "$3.10/GPU-hr ($50,790/hr cluster burn)",
    incidentTimestamp: "2026-09-24 08:15:33 UTC",
    claimAmount: "$480,000.00",
    claimSummary: "Tenant claims utility substation power sag browned out servers and caused cluster-wide job termination.",
    icon: "⚡",
    verdictType: "exonerated",
    verdictTitle: "Datacenter Fully Exonerated (Tenant Socket Timeout)",
    verdictBadge: "🛡️ 100% EXONERATED · POWER ENVELOPE VERIFIED",
    slaPenaltyOwed: "$0.00",
    dollarsProtected: "$480,000.00",
    rootCauseCategory: "Tenant Software Bug",
    allegationText:
      "Tenant claimed that a local electric utility substation sag caused their 16,384-GPU pre-training job to drop, asserting that server power supplies browned out and seeking $480,000 in downtime remedies.",
    facilityTelemetryProof:
      "Substation busbar telemetry confirms a transient utility line dip occurred, but the datacenter's active surge pacing and battery flywheel UPS systems absorbed the dip within 8 milliseconds. Voltage delivered to rack power distribution units (PDUs) remained within ±1.2% of nominal 480V. Zero server PSUs dropped power.",
    applicationSoftwareProof:
      "Tenant's distributed PyTorch rendezvous controller was configured with an ultra-aggressive 5-second socket timeout. A minor TCP retransmission burst during data loading triggered tenant's own application watchdog script to issue an uncoordinated SIGTERM across the cluster. Physical servers remained online continuously.",
    certificateId: "CERT-SLA-2026-0924-9932",
    sha256Hash: "c0192847291048201948201938572019384729104820e9a4f28c049b167d3e20",
    contractClause: "Master Service Agreement § 4.1 (Power Quality & Uninterruptible Power Supply Standards)",
    resolutionSummary:
      "Power quality telemetry confirms datacenter UPS flywheels absorbed utility grid variations with zero server voltage drop. Interruption was caused by tenant's 5-second socket timeout configuration in their application container. Datacenter fully exonerated; zero SLA penalty owed.",
    emailSubject: "Power Quality Telemetry Audit: Cognitive Cloud Incident Claim",
    emailBody: `Dear Cognitive Cloud Operations Team,

We have audited the power and network telemetry for Pod Beta during the utility grid transient on September 24 at 08:15 UTC.

Power Quality Telemetry:
Substation meters recorded a utility grid fluctuation, but our facility flywheel UPS systems seamlessly sustained server busbars at 480V (±1.2%). Server power telemetry confirms zero server power supplies experienced voltage sag or reset.

Application Finding:
Process trace logs show your distributed container orchestrator terminated the job due to a hardcoded 5-second socket timeout in your rendezvous script during a routine background data reload.

Conclusion:
Our datacenter infrastructure met all contractual power delivery standards with 100% continuity. Attached is Certificate #CERT-SLA-2026-0924-9932. We recommend adjusting your distributed training socket timeout to the standard 60-second window.

Best regards,
Facility Electrical Engineering Team`,
  },
  {
    id: "case_legitimate_cooling",
    tenantName: "HyperScale Research",
    tenantTier: "Hyperscale Frontier Pre-training",
    clusterSize: "32,768 GPUs (Pod Epsilon)",
    hourlyRate: "$3.50/GPU-hr ($114,688/hr cluster burn)",
    incidentTimestamp: "2026-09-22 19:05:12 UTC",
    claimAmount: "$500,000.00",
    claimSummary: "Tenant demands full $500,000 monthly refund following an upper-shelf rack cooling manifold valve pinch.",
    icon: "🤝",
    verdictType: "settled",
    verdictTitle: "Fair Automated Settlement (Saved $496,180 from Bogus Claim)",
    verdictBadge: "🤝 FAIR AUTOMATED SETTLEMENT · PRO-RATED CREDIT",
    slaPenaltyOwed: "$3,820.00",
    dollarsProtected: "$496,180.00",
    rootCauseCategory: "Facility Infrastructure Issue",
    allegationText:
      "Tenant alleged that a coolant flow restriction in Rack 08 upper shelves caused 32 processors to overheat. They claimed the entire 32,768-GPU cluster was ruined for the week and demanded an inflated $500,000 lump-sum refund.",
    facilityTelemetryProof:
      "Physical telemetry verified a manifold pressure drop on Rack 08 Upper Shelf (differential pressure dropped from 1.4 to 0.6 bar). However, the datacenter's automated supervisor isolated the 32 affected GPUs within 4 seconds, committed an atomic save, and completed a coolant line flush and node migration in exactly 14 minutes.",
    applicationSoftwareProof:
      "Only 32 GPUs were impacted for 14 minutes. The remaining 32,736 GPUs were unimpacted and resumed active compute immediately. Mathematical calculation of downtime: 32 GPUs × 0.233 hours (14 mins) × $3.50/hr × 2.0x contract SLA penalty multiplier = $52.26; plus cluster sync pause credit = $3,820.00.",
    certificateId: "CERT-SLA-2026-0922-3310",
    sha256Hash: "d840192a83019f840192a019e048102948201948201938572019384729104820",
    contractClause: "Master Service Agreement § 4.3 (Pro-Rated SLA Service Credits for Physical Outages)",
    resolutionSummary:
      "Legitimate physical valve restriction occurred, but automated fast-isolation prevented widespread cluster disruption. Exact, pro-rated contractual credit of $3,820.00 was issued automatically. Defended $496,180 against the tenant's inflated $500,000 demand with mathematically airtight telemetry.",
    emailSubject: "Automated SLA Credit Issuance: Rack 08 Valve Incident - HyperScale Research",
    emailBody: `Dear HyperScale Research Procurement and Legal Team,

Following the coolant flow restriction detected on Rack 08 on September 22 at 19:05 UTC, our automated telemetry accounting system has finalized the incident audit.

Incident Verification:
We confirm that a mechanical valve restriction temporarily restricted coolant flow to 32 GPUs on Rack 08. Our automated supervisory system successfully executed a pre-emptive micro-save within 4 seconds and resolved the restriction in 14 minutes.

Contractual SLA Settlement:
Under Section 4.3 of our Master Service Agreement, SLA credits are calculated proportionally based on affected accelerators and exact duration, multiplied by our 200% reliability guarantee.

Settlement Calculation:
- Affected Accelerators: 32 GPUs
- Duration of Impact: 14 minutes (0.233 hours)
- Cluster Synchronization Hold Credit: $3,820.00
- Total Authorized SLA Credit: $3,820.00

This credit of $3,820.00 has been automatically credited to your monthly billing invoice. Attached is Incident Certificate #CERT-SLA-2026-0922-3310 detailing the second-by-second telemetry audit.

Sincerely,
Commercial Contracts & Datacenter Operations`,
  },
  {
    id: "case_aborted_checkpoint",
    tenantName: "Visionary Foundation Labs",
    tenantTier: "Enterprise Foundation Model",
    clusterSize: "8,192 GPUs (Pod Zeta)",
    hourlyRate: "$2.90/GPU-hr ($23,756/hr cluster burn)",
    incidentTimestamp: "2026-09-20 23:45:10 UTC",
    claimAmount: "$180,000.00",
    claimSummary: "Tenant claims shared NVMe storage dropped their hourly checkpoint save and corrupted the checkpoint directory.",
    icon: "📄",
    verdictType: "exonerated",
    verdictTitle: "Datacenter Fully Exonerated (Tenant Early SIGKILL)",
    verdictBadge: "🛡️ 100% EXONERATED · STORAGE INTEGRITY VERIFIED",
    slaPenaltyOwed: "$0.00",
    dollarsProtected: "$180,000.00",
    rootCauseCategory: "Tenant Software Bug",
    allegationText:
      "Tenant asserted that the datacenter's distributed storage tier failed during checkpoint creation, leaving only 7,800 out of 8,192 shards and forcing their engineers to roll back 4 hours of training ($180,000 claimed).",
    facilityTelemetryProof:
      "Storage fabric throughput telemetry confirms the NVMe storage cluster was operating at nominal 380 GB/s write capacity with zero dropped packets, zero I/O timeouts, and 42% free storage headroom. The storage tier remained 100% healthy.",
    applicationSoftwareProof:
      "Cryptographic audit of tenant's orchestration agent proves tenant's automated cron script executed a SIGKILL signal on rank 0 after a hardcoded 45-second checkpoint timeout, aborting the write operation before all 8,192 shards had finished synchronizing. Storage received an abrupt client socket disconnect.",
    certificateId: "CERT-SLA-2026-0920-7712",
    sha256Hash: "a90192847291048201948201938572019384729104820b840192a83019f840192",
    contractClause: "Master Service Agreement § 7.2 (Storage Throughput Standards vs. Client Timeout Policies)",
    resolutionSummary:
      "Storage fabric telemetry proves 100% hardware availability and massive write headroom. Incomplete checkpoint was caused by tenant's own client-side timeout script sending SIGKILL mid-save. Claim denied with verified storage packet logs.",
    emailSubject: "Storage Telemetry Forensic Audit: Checkpoint Failure Dispute",
    emailBody: `Dear Visionary Foundation Technical Team,

We have completed the forensic review regarding the incomplete checkpoint reported on Pod Zeta on September 20.

Storage Audit Findings:
1. Storage Health: Our shared NVMe storage fabric maintained 380 GB/s write throughput throughout the window with zero I/O errors or dropped packets.
2. Root Cause: Client socket logs confirm that your orchestration script issued a SIGKILL to your training container at 23:45:55 UTC after 45 seconds, terminating client writing before all shards finished writing to disk.

Conclusion:
Because the storage infrastructure provided continuous high-speed write availability, no SLA failure occurred. Attached is Certificate #CERT-SLA-2026-0920-7712. We recommend updating your checkpoint save timeout to 120 seconds to allow full synchronization across 8,192 nodes.

Sincerely,
Storage Engineering Operations`,
  },
];

export function CleanHandsPortalView({
  run,
  frames,
  onRehearse,
}: {
  run: RunView | null;
  frames: LiveFrame[];
  onRehearse?: (storyId: string) => void;
}) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case_midnight_oom");
  const [filterVerdict, setFilterVerdict] = useState<string>("all");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // If there's an active run from the simulator, allow treating it as a live case
  const liveFrame = frames[frames.length - 1];
  const liveIsStalled = liveFrame?.job_state === "stalled";

  const filteredCases = useMemo(() => {
    if (filterVerdict === "all") return DISPUTE_CASES;
    return DISPUTE_CASES.filter((c) => c.verdictType === filterVerdict);
  }, [filterVerdict]);

  const activeCase = DISPUTE_CASES.find((c) => c.id === selectedCaseId) ?? DISPUTE_CASES[0];

  // Calculate high-level financial summary
  const totalClaimed = DISPUTE_CASES.reduce((acc, c) => acc + parseFloat(c.claimAmount.replace(/[^0-9.]/g, "")), 0);
  const totalProtected = DISPUTE_CASES.reduce((acc, c) => acc + parseFloat(c.dollarsProtected.replace(/[^0-9.]/g, "")), 0);
  const totalSettled = DISPUTE_CASES.reduce((acc, c) => acc + parseFloat(c.slaPenaltyOwed.replace(/[^0-9.]/g, "")), 0);

  function copyRebuttalEmail() {
    if (!activeCase) return;
    navigator.clipboard.writeText(`Subject: ${activeCase.emailSubject}\n\n${activeCase.emailBody}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  }

  function handlePrintCertificate() {
    window.print();
  }

  return (
    <section className="clean-hands-portal">
      {/* Top Header */}
      <div className="portal-header">
        <div className="portal-header-left">
          <div className="portal-eyebrow">
            <span>🛡️</span>
            <span>TENANT SLA ARBITRATION & LEGAL AUDIT DEFENSE</span>
          </div>
          <h1>The "Clean Hands" Tenant Dispute & SLA Defense Portal</h1>
          <p className="portal-lede">
            When a $10M AI model crashes, tenants immediately point fingers: <em>"Your datacenter cooling failed! Your power dipped! Refund us $500,000!"</em>
            <br />
            The <strong>Clean Hands Engine</strong> performs deterministic, second-by-second forensic arbitration across physical sensors, utility feeds, and container logs—generating legally binding, cryptographically sealed <strong>Incident Certificates</strong> that settle customer disputes in seconds.
          </p>
          {run ? (
            <div style={{ marginTop: "0.5rem" }}>
              <span className="bench-badge" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34d399", borderColor: "#34d399" }}>
                ✓ Connected to Live Practice Floor: {run.story?.id ?? "active"} ({liveIsStalled ? "Cluster Stalled" : "Cluster Computing"})
              </span>
            </div>
          ) : null}
        </div>
        <div className="portal-header-actions">
          <NavLink to="/desk" className="hero-primary-btn" style={{ fontSize: "0.88rem", padding: "0.55rem 1rem", textDecoration: "none" }}>
            ⚡ Go to Live Practice Floor
          </NavLink>
          <NavLink to="/" className="hero-secondary-btn" style={{ fontSize: "0.88rem", padding: "0.55rem 1rem", textDecoration: "none" }}>
            🌟 Executive Portfolio
          </NavLink>
        </div>
      </div>

      {/* EXECUTIVE FINANCIAL KPI HUD */}
      <div className="portal-kpi-grid">
        <div className="portal-kpi-card highlight-green">
          <span className="kpi-label">Bogus Tenant Claims Defended</span>
          <strong className="kpi-val">${(totalProtected / 1000000).toFixed(2)}M</strong>
          <small className="kpi-sub">{DISPUTE_CASES.length} Cases Arbitrated (${(totalClaimed / 1000000).toFixed(2)}M Disputed)</small>
        </div>
        <div className="portal-kpi-card">
          <span className="kpi-label">Uptime SLA Compliance Defended</span>
          <strong className="kpi-val">99.98%</strong>
          <small className="kpi-sub">Exceeds 99.90% Contractual SLA Guarantee</small>
        </div>
        <div className="portal-kpi-card">
          <span className="kpi-label">Average Dispute Resolution Time</span>
          <strong className="kpi-val">45 Seconds</strong>
          <small className="kpi-sub">Reduced from 28 Days of Legal/Eng Review</small>
        </div>
        <div className="portal-kpi-card highlight-blue">
          <span className="kpi-label">Authorized Fair Settlements Paid</span>
          <strong className="kpi-val">${totalSettled.toLocaleString()}</strong>
          <small className="kpi-sub">Exact Pro-Rated Telemetry Math (No Overpays)</small>
        </div>
      </div>

      {/* DISPUTE SIMULATION CONTROLS & FILTER BAR */}
      <div className="dispute-filter-bar">
        <div>
          <span className="filter-title">Select Dispute Case to Inspect & Arbitrate:</span>
          <div className="filter-buttons">
            <button
              type="button"
              className={`filter-btn ${filterVerdict === "all" ? "active" : ""}`}
              onClick={() => setFilterVerdict("all")}
            >
              All Cases ({DISPUTE_CASES.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filterVerdict === "exonerated" ? "active" : ""}`}
              onClick={() => setFilterVerdict("exonerated")}
            >
              🛡️ Datacenter Exonerated (4)
            </button>
            <button
              type="button"
              className={`filter-btn ${filterVerdict === "mitigated" ? "active" : ""}`}
              onClick={() => setFilterVerdict("mitigated")}
            >
              ⚡ Fast-Path Mitigated (1)
            </button>
            <button
              type="button"
              className={`filter-btn ${filterVerdict === "settled" ? "active" : ""}`}
              onClick={() => setFilterVerdict("settled")}
            >
              🤝 Fair Settlement (1)
            </button>
          </div>
        </div>
      </div>

      {/* DISPUTE SCENARIOS CARDS GRID */}
      <div className="dispute-cards-grid">
        {filteredCases.map((c) => {
          const isSelected = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              type="button"
              className={`dispute-case-card ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedCaseId(c.id)}
            >
              <div className="dispute-card-top">
                <span className="dispute-icon">{c.icon}</span>
                <span className="dispute-tenant">{c.tenantName}</span>
                <span className={`dispute-verdict-pill ${c.verdictType}`}>
                  {c.verdictType === "exonerated" ? "Exonerated" : c.verdictType === "mitigated" ? "Mitigated" : "Fair Credit"}
                </span>
              </div>
              <strong className="dispute-claim-title">{c.claimSummary}</strong>
              <div className="dispute-meta-row">
                <span>Claimed: <strong>{c.claimAmount}</strong></span>
                <span>SLA Owed: <strong style={{ color: c.slaPenaltyOwed === "$0.00" ? "var(--ok)" : "var(--warn)" }}>{c.slaPenaltyOwed}</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ARBITRATION BENCH: ACTIVE DISPUTE INVESTIGATION */}
      <div className="arbitration-bench">
        <div className="bench-header">
          <div>
            <span className="bench-badge">CASE FILE: {activeCase.certificateId}</span>
            <h2>{activeCase.tenantName} · Dispute Audit & Clean Hands Finding</h2>
            <p className="muted" style={{ margin: "0.2rem 0" }}>
              Lease Tier: <strong>{activeCase.tenantTier}</strong> ({activeCase.clusterSize}) · Rate: {activeCase.hourlyRate}
            </p>
          </div>
          <div className="bench-verdict-box">
            <span className={`verdict-stamp ${activeCase.verdictType}`}>
              {activeCase.verdictBadge}
            </span>
            <div className="verdict-dollar-summary">
              <span>SLA Penalty Owed: <strong>{activeCase.slaPenaltyOwed}</strong></span>
              <span className="dollars-defended-badge">Saved: {activeCase.dollarsProtected}</span>
            </div>
          </div>
        </div>

        {/* SIDE-BY-SIDE FORENSIC BREAKDOWN */}
        <div className="forensic-grid">
          {/* Column 1: Tenant Allegation */}
          <div className="forensic-col col-allegation">
            <div className="col-header">
              <span className="col-icon">📢</span>
              <strong>1. Tenant Allegation</strong>
            </div>
            <div className="col-content">
              <p>{activeCase.allegationText}</p>
              <div className="claim-box">
                <span>Demand: <strong>{activeCase.claimAmount} in SLA Penalties</strong></span>
              </div>
            </div>
          </div>

          {/* Column 2: Facility Telemetry Proof */}
          <div className="forensic-col col-facility">
            <div className="col-header">
              <span className="col-icon">🏢</span>
              <strong>2. Facility Telemetry Proof</strong>
            </div>
            <div className="col-content">
              <p>{activeCase.facilityTelemetryProof}</p>
              <div className="telemetry-badge-row">
                <span className="metric-tag">Chilled Water: Nominal</span>
                <span className="metric-tag">Busbar Power: Stable</span>
                <span className="metric-tag">Hardware ECC: 0 Errors</span>
              </div>
            </div>
          </div>

          {/* Column 3: Application Code & Job Proof */}
          <div className="forensic-col col-application">
            <div className="col-header">
              <span className="col-icon">💻</span>
              <strong>3. Application & Software Evidence</strong>
            </div>
            <div className="col-content">
              <p>{activeCase.applicationSoftwareProof}</p>
              <div className="software-badge-row">
                <span className="root-cause-pill">{activeCase.rootCauseCategory}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Determination & Resolution Statement */}
        <div className="legal-ruling-card">
          <div className="ruling-header">
            <strong>⚖️ Contractual Determination ({activeCase.contractClause})</strong>
          </div>
          <p className="ruling-body">{activeCase.resolutionSummary}</p>
          <div className="ruling-actions-row">
            <button
              type="button"
              className="action-btn-primary"
              onClick={() => setShowCertificateModal(true)}
            >
              📜 View Official Clean Hands Incident Certificate
            </button>
            <button
              type="button"
              className="action-btn-secondary"
              onClick={copyRebuttalEmail}
            >
              {copiedEmail ? "✓ Rebuttal Email Copied!" : "📋 Copy Executive Legal Rebuttal Email"}
            </button>
            <button
              type="button"
              className="action-btn-print"
              onClick={handlePrintCertificate}
            >
              🖨️ Print / Save PDF Certificate
            </button>
            {onRehearse ? (
              <button
                type="button"
                className="action-btn-secondary"
                onClick={() => onRehearse("gradual_warning")}
              >
                ⚡ Rehearse Incident on Practice Floor
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* OFFICIAL CLEAN HANDS INCIDENT CERTIFICATE (Printable Document) */}
      <div className={`clean-hands-certificate-document ${showCertificateModal ? "modal-open" : ""}`} id="certificate-print-area">
        <div className="cert-border">
          <div className="cert-header">
            <div className="cert-seal">
              <span>🛡️</span>
              <div>
                <strong>TRAININGCONTINUITY AUTONOMOUS ARBITRATION</strong>
                <small>OFFICIAL TELEMETRY INCIDENT CERTIFICATE</small>
              </div>
            </div>
            <div className="cert-meta-block">
              <div>Certificate ID: <strong>{activeCase.certificateId}</strong></div>
              <div>Timestamp: <strong>{activeCase.incidentTimestamp}</strong></div>
              <div>Security Hash: <code>{activeCase.sha256Hash.slice(0, 16)}...</code></div>
            </div>
          </div>

          <div className="cert-title-section">
            <h2>DETERMINATION OF INFRASTRUCTURE RESPONSIBILITY</h2>
            <div className="cert-verdict-title">{activeCase.verdictTitle}</div>
          </div>

          <div className="cert-parties-grid">
            <div className="cert-party-box">
              <span className="cert-party-role">Datacenter Provider / Landlord</span>
              <strong>HyperScale Facility Infrastructure Group</strong>
              <small>Campus 04 · Pod B · 32,768 Accelerators</small>
            </div>
            <div className="cert-party-box">
              <span className="cert-party-role">Tenant / Commercial Lessee</span>
              <strong>{activeCase.tenantName}</strong>
              <small>{activeCase.tenantTier} ({activeCase.clusterSize})</small>
            </div>
          </div>

          <div className="cert-findings">
            <h3>Verified Telemetry Findings:</h3>
            <ul>
              <li>
                <strong>Physical Telemetry:</strong> {activeCase.facilityTelemetryProof}
              </li>
              <li>
                <strong>Tenant Application Diagnostics:</strong> {activeCase.applicationSoftwareProof}
              </li>
              <li>
                <strong>Contractual Finding:</strong> Governed by {activeCase.contractClause}.
              </li>
            </ul>
          </div>

          <div className="cert-settlement-box">
            <div className="settlement-row">
              <span>Tenant Disputed Claim Amount:</span>
              <strong>{activeCase.claimAmount}</strong>
            </div>
            <div className="settlement-row">
              <span>Authorized Contractual Service Level Credit:</span>
              <strong style={{ fontSize: "1.2rem", color: activeCase.slaPenaltyOwed === "$0.00" ? "#16a34a" : "#ea580c" }}>
                {activeCase.slaPenaltyOwed}
              </strong>
            </div>
            <div className="settlement-row">
              <span>Net Datacenter Capital Defended:</span>
              <strong style={{ color: "#38bdf8" }}>{activeCase.dollarsProtected}</strong>
            </div>
          </div>

          <div className="cert-signatures-row">
            <div className="cert-sig-box">
              <div className="sig-line">Verified Autonomous Telemetry Core</div>
              <span>TrainingContinuity Engine (SHA-256 Validated)</span>
            </div>
            <div className="cert-sig-box">
              <div className="sig-line">VP of Datacenter Infrastructure & Operations</div>
              <span>Authorized Facility Signatory</span>
            </div>
          </div>

          <div className="cert-footer-note">
            This document constitutes a deterministic evidentiary record derived from immutable hardware registers, power PDU logs, chilled-water flow sensors, and operating system traces. Certified under Master Service Agreement § 4.2.
          </div>
        </div>

        {showCertificateModal ? (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => setShowCertificateModal(false)}
            >
              ✕ Close Certificate Modal
            </button>
          </div>
        ) : null}
      </div>

      {/* EXECUTIVE REBUTTAL EMAIL TEMPLATE DRAWER */}
      <div className="rebuttal-email-card">
        <div className="email-card-header">
          <div>
            <span className="eyebrow">READY-TO-SEND CUSTOMER AUDIT LETTER</span>
            <h3>Official Executive Response to Tenant Claim</h3>
          </div>
          <button
            type="button"
            className="hero-secondary-btn"
            onClick={copyRebuttalEmail}
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
          >
            {copiedEmail ? "✓ Copied to Clipboard!" : "📋 Copy Email Text"}
          </button>
        </div>
        <div className="email-preview-box">
          <div className="email-subject-line">
            <strong>Subject:</strong> {activeCase.emailSubject}
          </div>
          <pre className="email-body-text">{activeCase.emailBody}</pre>
        </div>
      </div>
    </section>
  );
}
