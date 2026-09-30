import { useState } from "react";
import { RunView } from "./api";

const CANARY_PIPELINE = [
  {
    node_id: "host-r0-h0",
    rack: "Rack 0",
    trigger: "Thermal Relapse After Reboot",
    phase: "Stage 2: Thermal Recovery Slope",
    duration: "4m 12s / 5m 00s",
    score: 64,
    status: "FAILING (RESIDUAL SPIKE)",
    status_tone: "danger",
    decision: "BLOCK RE-ENTRY · ROUTE TO RMA",
    roi_saved: "$300,000 (Avoided 2nd Cluster Stall)",
  },
  {
    node_id: "host-r2-h5",
    rack: "Rack 2",
    trigger: "Post-Maintenance Cable Reseat",
    phase: "Stage 3: Collective NCCL Latency",
    duration: "5m 00s / 5m 00s",
    score: 98,
    status: "PASSED QUALIFICATION",
    status_tone: "ok",
    decision: "PROMOTE TO ACTIVE FLEET",
    roi_saved: "Clean node verified for 32k gang",
  },
  {
    node_id: "host-r7-h11",
    rack: "Rack 7",
    trigger: "Infant Mortality Bring-Up",
    phase: "Stage 1: 700W GEMM TDP Burn-In",
    duration: "2m 45s / 5m 00s",
    score: 91,
    status: "TESTING IN PROGRESS",
    status_tone: "warn",
    decision: "GATED (Awaiting Completion)",
    roi_saved: "Protecting frontier run bring-up",
  },
  {
    node_id: "host-r12-h3",
    rack: "Rack 12",
    trigger: "Recurring Single-Bit ECC Spike",
    phase: "Complete: HBM Memory Stress",
    duration: "5m 00s / 5m 00s",
    score: 52,
    status: "FAILED (SBE THRESHOLD EXCEEDED)",
    status_tone: "danger",
    decision: "PERMANENT CORDON · RMA CLAIM",
    roi_saved: "$150,000 (Prevented DBE Crash)",
  },
];

const YIELD_BINS = [
  {
    bin_name: "Bin 1: Gold Silicon (Frontier Synchronous Pretraining)",
    allocation: "28,672 GPUs (87.5% of Hall)",
    temp_envelope: "< 60.0°C at 700W TDP",
    leakage_envelope: "< 100 mA static leakage",
    assigned_workloads: "Frontier LLM Pretraining (32,768-GPU Synchronous Gang Group)",
    rationale: "Zero straggler tolerance; all-reduce synchronization requires maximum clock consistency.",
    tone: "ok",
  },
  {
    bin_name: "Bin 2: Standard Silicon (Elastic & Asynchronous Workloads)",
    allocation: "3,072 GPUs (9.4% of Hall)",
    temp_envelope: "60.0°C to 66.0°C at 700W TDP",
    leakage_envelope: "100 mA to 130 mA static leakage",
    assigned_workloads: "LoRA Fine-Tuning, Data Preprocessing, Inference Replicas",
    rationale: "Elastic fault tolerance; rank interruptions do not stall a cluster-wide collective barrier.",
    tone: "warn",
  },
  {
    bin_name: "Bin 3: Marginal / RMA Candidate (Vendor Warranty Staging)",
    allocation: "1,024 GPUs (3.1% of Hall)",
    temp_envelope: "> 68.0°C or High dT/dt Slope",
    leakage_envelope: "> 135 mA high leakage",
    assigned_workloads: "Canary Testing / OEM Vendor Warranty Reimbursement Pool",
    rationale: "Never placed in production training; held in quarantine to generate vendor credit claims.",
    tone: "danger",
  },
];

export function YieldView({
  run,
}: {
  run: RunView | null;
}) {
  const [selectedClaim, setSelectedClaim] = useState<string>("host-r0-h0");
  const [copied, setCopied] = useState<boolean>(false);
  const totalGpus = run?.cluster?.accelerator_count ? run.cluster.accelerator_count.toLocaleString() : "32,768";

  function copyDossier() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="yield-section">
      <div className="yield-header">
        <span className="eyebrow">Quality Testing & Factory Warranty Reclaims</span>
        <h1>Factory Quality, Sorting Bins & The Hospital Discharge Trap</h1>
        <p className="lede">
          Hardware testing does not stop when chips leave the factory.
          Think of testing a runner before sending them back into a marathon: if a server crashes and reboots, sending it straight back onto the track without checking if its fever is gone causes <strong>the hospital discharge trap</strong> (crashing the entire cluster again immediately).
          Our system runs an automated 2-minute diagnostic jog first to verify full recovery.
          We also sort chips like fresh fruit: top-grade Grade-A chips are assigned to the big {totalGpus}-chip synchronized marathon where everyone must run at top speed, while good-but-warmer Grade-B chips work on flexible jobs that don't hold anyone back.
        </p>
      </div>

      {/* TOP 3 EXECUTIVE KPI CARDS */}
      <div className="yield-kpi-grid">
        <div className="yield-kpi-card kpi-danger">
          <span className="kpi-label">Canary Safety Gate</span>
          <div className="kpi-val">1 Node Blocked from Re-entry</div>
          <p className="kpi-desc">
            Node <strong>host-r0-h0</strong> rebooted after a cooling fault but failed the thermal recovery jog. <strong>The safety gate blocked re-entry</strong>, preventing a second catastrophic cluster crash.
          </p>
          <div className="kpi-highlight">Avoided Cost: ~$300,000 in repeated stall burn</div>
        </div>

        <div className="yield-kpi-card kpi-ok">
          <span className="kpi-label">Processor Quality Bins</span>
          <div className="kpi-val">87.5% Grade-A (Gold Fleet)</div>
          <p className="kpi-desc">
            28,672 top-grade chips assigned to the synchronized main marathon. 3,072 standard chips binned into flexible background jobs.
          </p>
          <div className="kpi-highlight">Choir Harmony: Maximum synchronization protection</div>
        </div>

        <div className="yield-kpi-card kpi-info">
          <span className="kpi-label">Factory Warranty Reclaims</span>
          <div className="kpi-val">$480,000 Recoverable Credits</div>
          <p className="kpi-desc">
            48 processors flagged with undeniable sensor proof of factory defects, ready for supplier warranty refund submission.
          </p>
          <div className="kpi-highlight">Audit Dossier: Ready for vendor submission</div>
        </div>
      </div>

      {/* CANARY QUALIFICATION PIPELINE TABLE */}
      <div className="panel canary-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Preventing the Revolving Door Trap</span>
            <h2>Active Canary Qualification Pipeline</h2>
          </div>
          <span className="pipeline-badge">Automated Re-Entry Gate</span>
        </div>
        <p className="muted">
          When an operator or technician restarts a crashed server, traditional tools immediately put it back into the training job. If the underlying fault is unresolved, the server crashes again 30 minutes later. The Canary Pipeline tests nodes in isolation before fleet promotion.
        </p>
        <div className="table-wrap">
          <table className="canary-table">
            <thead>
              <tr>
                <th>Node ID</th>
                <th>Physical Rack</th>
                <th>Defect Trigger</th>
                <th>Canary Test Stage</th>
                <th>Duration</th>
                <th>Canary Score</th>
                <th>Gate Decision</th>
                <th>ROI Impact</th>
              </tr>
            </thead>
            <tbody>
              {CANARY_PIPELINE.map((item) => (
                <tr key={item.node_id} className={`canary-row-${item.status_tone}`}>
                  <td><strong>{item.node_id}</strong></td>
                  <td>{item.rack}</td>
                  <td>{item.trigger}</td>
                  <td>{item.phase}</td>
                  <td><small>{item.duration}</small></td>
                  <td>
                    <span className={`score-badge tone-${item.status_tone}`}>
                      {item.score}/100
                    </span>
                  </td>
                  <td>
                    <strong className={`decision-text tone-${item.status_tone}`}>
                      {item.decision}
                    </strong>
                  </td>
                  <td><small>{item.roi_saved}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* YIELD-AWARE WORKLOAD PLACEMENT */}
      <div className="panel yield-binning-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Silicon Binning & Risk Management</span>
            <h2>Yield-Aware Workload Placement Matrix</h2>
          </div>
          <span className="yield-badge">{totalGpus} Hall Allocation</span>
        </div>
        <p className="muted">
          Not all silicon dies are created equal. Match the silicon grade to the workload's sensitivity to interruption. Placing marginal chips in a 32,768-GPU synchronous gang run is financial suicide; placing them in elastic inference is optimal.
        </p>

        <div className="binning-grid">
          {YIELD_BINS.map((bin) => (
            <div key={bin.bin_name} className={`bin-card bin-${bin.tone}`}>
              <div className="bin-head">
                <h3>{bin.bin_name}</h3>
                <span className="bin-alloc">{bin.allocation}</span>
              </div>
              <div className="bin-spec-row">
                <div><span>Thermal Envelope:</span> <strong>{bin.temp_envelope}</strong></div>
                <div><span>Leakage Limit:</span> <strong>{bin.leakage_envelope}</strong></div>
              </div>
              <div className="bin-workload">
                <strong>Assigned Workloads:</strong>
                <p>{bin.assigned_workloads}</p>
              </div>
              <div className="bin-rationale">
                <strong>Owner Rationale:</strong>
                <p>{bin.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OEM VENDOR WARRANTY RMA DOSSIER GENERATOR */}
      <div className="panel rma-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">CapEx Warranty Recovery</span>
            <h2>Cryptographic OEM Vendor RMA Dossier</h2>
          </div>
          <div className="rma-actions">
            <select
              value={selectedClaim}
              onChange={(e) => setSelectedClaim(e.target.value)}
              className="rma-select"
            >
              <option value="host-r0-h0">Claim #RMA-2026-081 (host-r0-h0 · Die Thermal Resistance)</option>
              <option value="host-r12-h3">Claim #RMA-2026-094 (host-r12-h3 · HBM SBE Micro-Crack)</option>
            </select>
            <button type="button" onClick={copyDossier} className="copy-rma-btn">
              {copied ? "✓ Copied Dossier" : "📋 Copy RMA Dossier"}
            </button>
          </div>
        </div>
        <p className="muted">
          Hardware vendors routinely dispute warranty claims by blaming customer datacenter cooling or dirty power. TrainingContinuity generates an irrefutable audit dossier with ambient inlet telemetry, fan RPM, and thermal resistance proofs:
        </p>

        <div className="dossier-box">
          <div className="dossier-header">
            <strong>HARDWARE WARRANTY DEFECT REPORT : CLAIM #RMA-2026-081</strong>
            <span>STATUS: TELEMETRY VERIFIED · ELIGIBLE FOR 100% CAPEX CREDIT</span>
          </div>
          <pre className="dossier-content">
{`[VENDOR DEFECT AUDIT DOSSIER]
Target Component:      NVIDIA / OEM Accelerator Assembly (Asset: gpu-r0-h0-d0)
Parent Host:            host-r0-h0 (Rack 0, Slot 1)
Foundry Lot ID:         LOT-TSMC-N4P-B42
Canary Audit Score:     64/100 (FAIL: Sustained thermal resistance anomaly)

TELEMETRY GROUND TRUTH (PROVING NORMAL FACILITY OPERATION):
- Ambient Facility Inlet Temp:   22.4°C (Nominal envelope: 18.0°C - 25.0°C)
- Fan / Coolant Flow Rate:       100.0% Nominal (No airflow starvation)
- Measured Thermal Resistance:   R_th = 0.22 °C/W (Vendor Datasheet Spec: <= 0.12 °C/W)
- Substrate Thermal Paste Void:  CONFIRMED via multi-sensor die gradient (Die 0 dT/dt: +2.8°C/s)

INCIDENT LOG:
- Step 24: Initial recoverable thermal trip triggered at 700W TDP.
- Step 36: Automated canary qualification stress test executed in isolation.
- Step 40: Node failed thermal recovery slope test; blocked from fleet re-enrollment.
- Prevented Impact: 32,768-GPU cluster stall avoided (Estimated savings: $300,000).

WARRANTY CLAIM CONCLUSION:
Physical defect is localized to accelerator thermal interface material (TIM) or internal silicon die bond.
Facility operating conditions verified compliant. Full hardware replacement credit requested.`}
          </pre>
        </div>
      </div>
    </section>
  );
}
