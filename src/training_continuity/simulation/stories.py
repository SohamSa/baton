"""Guided stories. Each one is a scenario executed by the simulation engine."""

from __future__ import annotations

from training_continuity.simulation.engine import ScenarioConfig, compare_policies, public_view, run_scenario

STORIES: dict[str, dict] = {
    "gradual_warning": {
        "title": "The heat creeps up before a machine stops",
        "summary": "One chip runs hotter than it should, the way an engine temperature gauge climbs before a car stalls. The page asks you to save the work, then restart from that save.",
        "primary_policy": "risk_aware",
        "comparison": ["reactive", "risk_aware"],
        "config": {
            "scenario_id": "story-gradual",
            "seed": 11,
            "steps": 80,
            "checkpoint_interval": 40,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "gradual-cooling",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 8,
                    "ramp": 8,
                    "severity": 0.8,
                    "hard_fail": 36,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Dynamic Thermal-Slope Micro-Checkpointing",
            "problem": "A chip heats up over several minutes before fatal thermal shutdown. Waiting for scheduled saves wipes out all work between the last save and the crash.",
            "solution": "Trigger an immediate micro-checkpoint when the temperature rate of rise (dT/dt) spikes, saving model weights right before the chip fails.",
            "hardware_takeaway": "Equip node BMC telemetry with sub-10s polling and direct interrupts to your cluster orchestrator to trigger saves before thermal trips.",
            "roi_impact": "Recovers up to 90% of in-flight progress that would otherwise require multi-hour full recomputation.",
        },
        "failure_level": {
            "tier": "Chip Level",
            "component": "Accelerator Silicon / Die Thermal Sensor",
            "blast_radius": "1 GPU directly -> Entire 32,768-GPU cluster stalled via all-reduce barrier",
            "redundancy_strategy": "Micro-checkpointing triggers and dynamic thermal fan-ramp curves",
        },
    },
    "abrupt_failure": {
        "title": "A machine stops with no warning",
        "summary": "The work stops the way a light bulb pops, with no flicker first. Any gain comes from a shorter restart the job is allowed to do, not from predicting the pop.",
        "primary_policy": "capability_aware",
        "comparison": ["reactive", "capability_aware"],
        "config": {
            "scenario_id": "story-abrupt",
            "seed": 12,
            "steps": 70,
            "checkpoint_interval": 20,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "abrupt-process",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "application",
                    "mechanism": "application_error",
                    "onset": 30,
                    "abrupt": True,
                    "hard_fail": 30,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Fast-Path Rank Eviction & Rapid Group Restart",
            "problem": "Unpredictable silicon or software crashes cannot be foreseen by sensor metrics. Cluster stall time is pure financial burn.",
            "solution": "Do not waste time attempting multi-stage diagnostics during active training. Execute automated fail-fast gang restarts immediately.",
            "hardware_takeaway": "Maintain 1-2% warm unassigned standby nodes per network spine and pre-stage container images for sub-minute restarts.",
            "roi_impact": "Cuts cluster idle stall time from 20-30 minutes down to under 2 minutes per crash event.",
        },
        "failure_level": {
            "tier": "Node Level",
            "component": "Host Motherboard / Compute Process Kernel",
            "blast_radius": "1 Server Host (8 GPUs) crashed -> Entire 32,768-GPU cluster stalled",
            "redundancy_strategy": "Warm standby nodes pre-enrolled with preloaded container images",
        },
    },
    "shared_infrastructure": {
        "title": "One power feed, one problem",
        "summary": "Several chips on the same power feed sag together, like every light on one circuit dimming at once. They are treated as one incident. Chips on the other feed stay out of it.",
        "primary_policy": "combined",
        "comparison": ["combined"],
        "config": {
            "scenario_id": "story-shared",
            "seed": 13,
            "steps": 30,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 20,
            "scripted_faults": [
                {
                    "fault_id": "shared-power",
                    "target_type": "power_domain",
                    "target_id": "power-r0-h0",
                    "cause": "physical_hardware",
                    "mechanism": "power_interruption",
                    "onset": 15,
                    "severity": 0.6,
                    "fail_mode": "none",
                }
            ],
        },
        "owner_playbook": {
            "title": "Power-Domain Topology Alignment & Alarm Correlation",
            "problem": "A single PDU breaker drop sags 16+ GPUs simultaneously, causing naive monitoring tools to fire 16 independent hardware failure tickets.",
            "solution": "Correlate telemetry by electrical circuit topology so one breaker event creates exactly one facility ticket.",
            "hardware_takeaway": "Ingest rack PDU and busbar sensor IDs directly into the cluster scheduler topology map.",
            "roi_impact": "Prevents dispatching technicians to replace healthy GPUs and focuses repairs on the root electrical feed.",
        },
        "failure_level": {
            "tier": "Rack Level",
            "component": "Rack PDU & Primary Busbar Power Feed",
            "blast_radius": "Entire Rack (16 hosts / 128 GPUs) sagged -> Entire 32,768-GPU cluster stalled",
            "redundancy_strategy": "A+B dual power feeds with automatic transfer switches (ATS) per rack",
        },
    },
    "healthy_workload_shift": {
        "title": "A busy spell is not a breakdown",
        "summary": "The job works harder and the chips get warmer, the way a kitchen heats up during the dinner rush. They stay inside the normal range, so the page leaves them in service.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-healthy",
            "seed": 14,
            "steps": 40,
            "checkpoint_interval": 50,
            "workload": [
                {"start": 0, "util": 0.4, "phase": "steady"},
                {"start": 12, "util": 0.95, "phase": "burst"},
            ],
        },
        "owner_playbook": {
            "title": "Workload-Aware Adaptive Thermal Baselines",
            "problem": "Heavy compute phases (such as forward-pass GEMM kernels) naturally drive up chip heat. Rigid alarm thresholds flag these as impending breakdowns.",
            "solution": "Differentiate healthy heavy computation from genuine cooling degradation by correlating SM activity and power limits with heat.",
            "hardware_takeaway": "Tune monitoring policies to evaluate thermal residuals relative to workload intensity rather than raw absolute degrees.",
            "roi_impact": "Eliminates false-alarm job halts that burn tens of thousands of dollars in wasted downtime.",
        },
        "failure_level": {
            "tier": "Workload Level",
            "component": "Forward/Backward GEMM Matrix Intensity",
            "blast_radius": "All placed ranks experiencing high compute load (Normal execution)",
            "redundancy_strategy": "Adaptive dynamic thresholds that account for instantaneous TDP draw",
        },
    },
    "incomplete_checkpoint": {
        "title": "A half-finished save is refused",
        "summary": "A save that is missing pieces is treated like a document with the last pages torn out. The restart uses the older complete save.",
        "primary_policy": "reactive",
        "comparison": ["reactive"],
        "config": {
            "scenario_id": "story-checkpoint",
            "seed": 15,
            "steps": 40,
            "checkpoint_interval": 10,
            "storage_fail_progress": [20],
            "scripted_faults": [
                {
                    "fault_id": "after-bad-checkpoint",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "application",
                    "mechanism": "application_error",
                    "onset": 28,
                    "abrupt": True,
                    "hard_fail": 28,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Atomic Two-Phase Commit Checkpointing",
            "problem": "Restoring an unverified or partially written checkpoint causes catastrophic crash loops and silent model weight corruption.",
            "solution": "Refuse unverified checkpoints; only advance active resume pointers once all rank shards and manifest checksums pass validation.",
            "hardware_takeaway": "Implement high-throughput local NVMe staging tiers to buffer checkpoint shards before committing to shared parallel filesystems.",
            "roi_impact": "Prevents catastrophic restarts into corrupted states that invalidate days of pre-training progress.",
        },
        "failure_level": {
            "tier": "Storage / Fabric Level",
            "component": "Parallel File System / Storage Shard Fabric",
            "blast_radius": "Checkpoint tier write drop -> Cluster unable to commit valid recovery point",
            "redundancy_strategy": "Local NVMe burst buffers with atomic 2-phase commit manifest verification",
        },
    },
    "unsupported_local_recovery": {
        "title": "You cannot drop one singer from this choir",
        "summary": "This job must move as one group. Removing a single chip and carrying on is refused. The allowed move is to restart the group together.",
        "primary_policy": "force_reconfigure",
        "comparison": ["force_reconfigure"],
        "config": {
            "scenario_id": "story-unsupported",
            "seed": 16,
            "steps": 20,
            "checkpoint_interval": 8,
            "capability": "strict_sync",
            "tp_size": 2,
            "scripted_faults": [
                {
                    "fault_id": "needs-restart",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "application",
                    "mechanism": "application_error",
                    "onset": 12,
                    "abrupt": True,
                    "hard_fail": 12,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Distributed Topology Contract Enforcement",
            "problem": "Attempting to drop a dead rank on a tensor-parallel model that lacks dynamic elasticity causes immediate collective communication deadlock.",
            "solution": "Enforce strict gang restarts if the runtime cannot dynamically reshard tensor dimensions.",
            "hardware_takeaway": "Audit your ML software framework (e.g. Megatron vs. Torch Elastic) before designing cluster recovery playbooks.",
            "roi_impact": "Avoids extended silent all-reduce hangs that burn cluster hours while waiting for uncoordinated ranks.",
        },
        "failure_level": {
            "tier": "Distributed Mesh Level",
            "component": "Tensor-Parallel Collective Communication Mesh",
            "blast_radius": "All-reduce ring broken -> Distributed deadlock if single rank dropped",
            "redundancy_strategy": "Strict gang restart enforcement or migration to dynamic elastic torch.distributed",
        },
    },
    "stale_telemetry": {
        "title": "Late sensors mean we do not guess",
        "summary": "The readings arrive late, like a thermometer from last week. The page says the evidence is not enough, instead of inventing a cause.",
        "primary_policy": "combined",
        "comparison": ["combined"],
        "config": {
            "scenario_id": "story-stale",
            "seed": 17,
            "steps": 24,
            "collector_lag_steps": 10,
            "checkpoint_interval": 20,
            "scripted_faults": [
                {
                    "fault_id": "hidden-cooling",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 6,
                    "ramp": 4,
                    "severity": 0.9,
                    "hard_fail": 80,
                    "fail_mode": "none",
                }
            ],
        },
        "owner_playbook": {
            "title": "Telemetry Staleness Guardrails (Epistemic Abstention)",
            "problem": "Lagging telemetry collectors deliver stale metrics. Automated systems that act on delayed metrics mistakenly quarantine healthy nodes.",
            "solution": "Incorporate telemetry freshness TTL checks; abstain from automated hardware intervention when metrics are older than 2-3 steps.",
            "hardware_takeaway": "Decouple high-frequency health heartbeats from heavy metric scraping pipelines to ensure real-time liveness.",
            "roi_impact": "Prevents spurious automated node cordons and unnecessary engineering on-call pages.",
        },
        "failure_level": {
            "tier": "Management Plane Level",
            "component": "Out-of-Band Telemetry Ingestion Network",
            "blast_radius": "Metrics lag by 10 steps -> Operator triage delayed",
            "redundancy_strategy": "Low-overhead in-band liveness heartbeats decoupled from heavy scraping",
        },
    },
    "harmful_preventive": {
        "title": "Shutting down a healthy rush can cost more",
        "summary": "A fixed temperature rule pulls a healthy busy chip out of service. The paired run that waits for a real fault keeps more of the work. The comparison shows the loss.",
        "primary_policy": "static_threshold",
        "comparison": ["reactive", "static_threshold"],
        "config": {
            "scenario_id": "story-harmful",
            "seed": 18,
            "steps": 40,
            "checkpoint_interval": 50,
            "workload": [
                {"start": 0, "util": 0.4, "phase": "steady"},
                {"start": 12, "util": 0.95, "phase": "burst"},
            ],
        },
        "owner_playbook": {
            "title": "Dynamic Residual Tracking vs. Static Alarms",
            "problem": "Static temperature limits (e.g. 70°C) quarantine working chips during burst phases, ironically causing the exact cluster downtime they aim to prevent.",
            "solution": "Adopt residual thermal models that account for ambient room temperature and current TDP to avoid premature quarantines.",
            "hardware_takeaway": "Configure facility chilled-water cooling loops to ramp dynamically with cluster power load spikes.",
            "roi_impact": "Directly preserves valuable pretraining compute that naive monitoring rules throw away.",
        },
        "failure_level": {
            "tier": "Policy / Threshold Level",
            "component": "Static Temperature Alarm Heuristic",
            "blast_radius": "Healthy operating accelerators erroneously cordoned -> Compute progress lost",
            "redundancy_strategy": "Residual anomaly detection models that compare against expected workload heat",
        },
    },
    "silent_straggler": {
        "title": "A slow die drags the whole choir",
        "summary": "One accelerator die throttles slightly without crashing. Because all chips synchronize every step, the entire hall slows to match the straggler, burning capital in silence.",
        "primary_policy": "risk_aware",
        "comparison": ["reactive", "risk_aware"],
        "config": {
            "scenario_id": "story-straggler",
            "seed": 19,
            "steps": 60,
            "checkpoint_interval": 20,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "straggler-die-degradation",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 8,
                    "ramp": 10,
                    "severity": 0.75,
                    "hard_fail": 40,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Cross-Die Straggler Detection & Fleet Wafer-Lot Cordoning",
            "problem": "A single die throttles by 8-15% due to process variation or HBM micro-bump degradation without throwing a hard crash. In a 32,768-GPU all-reduce group, all 32,767 other chips are forced to drag their pace to match the slowest die, burning $220,000/day in silent compute drag.",
            "solution": "Collect cross-die step-latency and memory error rate telemetry to identify straggler outliers before they trigger collective group stalls, gracefully draining the degraded node during scheduled checkpoint saves.",
            "hardware_takeaway": "Correlate accelerator silicon die serial numbers with foundry wafer lots and HBM stack IDs in your cluster management plane to spot batch-level thermal and leakage drift.",
            "roi_impact": "Recovers 5-10% of lost cluster-wide throughput ($1M-$3M/month on a 32k-GPU frontier cluster) that traditional crash-based monitoring completely misses.",
        },
        "failure_level": {
            "tier": "Silicon Die Level",
            "component": "Accelerator Compute Die & HBM3e Memory Stacks",
            "blast_radius": "1 Straggler Die (8% latency drag) -> Synchronous all-reduce forces all 32,768 GPUs to drag pace ($220k/day idle waste)",
            "redundancy_strategy": "Fleet-wide outlier die detection with automated rank descheduling at verified checkpoint boundaries",
        },
    },
    "revolving_door": {
        "title": "The revolving door trap",
        "summary": "A repaired node reboots and claims it is ready. A naive rule lets it back into the choir, where it crashes a second time and burns another full restart. The test-aware rule runs a canary trial first, keeping the cluster safe.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-revolving",
            "seed": 20,
            "steps": 60,
            "checkpoint_interval": 20,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "first-cooling-trip",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 8,
                    "ramp": 8,
                    "severity": 0.8,
                    "hard_fail": 24,
                    "fail_mode": "recoverable_process",
                },
                {
                    "fault_id": "relapse-fault",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 36,
                    "ramp": 6,
                    "severity": 0.85,
                    "hard_fail": 46,
                    "fail_mode": "recoverable_process",
                },
            ],
        },
        "owner_playbook": {
            "title": "Automated Canary Qualification & Quarantine Gates",
            "problem": "Rebooting a failed node and immediately returning it to an active 32k-GPU job often causes an immediate relapse crash, doubling the downtime and wiping out in-flight progress twice.",
            "solution": "Implement automated canary test gates where recovered nodes must pass a 5-minute isolated synthetic stress loop (thermal slope & all-reduce checks) before promotion back into the pretraining group.",
            "hardware_takeaway": "Integrate automated canary test harnesses into your cluster scheduler; never allow unvalidated node re-enrollment directly into synchronous gang jobs.",
            "roi_impact": "Eliminates repeated cluster restarts, saving $100k-$300k per unstable node event.",
        },
        "failure_level": {
            "tier": "Node Qualification / Test Level",
            "component": "Node Host & Motherboard Re-entry Gate",
            "blast_radius": "Premature node re-entry causes 2nd cluster-wide stall -> 32,768 GPUs stalled twice ($300k wasted restart burn)",
            "redundancy_strategy": "Canary stress isolation testing with automated warm-spare promotion",
        },
    },
    "power_cliff": {
        "title": "The substation power grid shockwave",
        "summary": "A simultaneous heavy compute rush across 32,768 chips causes an instantaneous 16-megawatt electrical surge, sagging feeds like thousands of air conditioners turning on simultaneously. The smart policy distinguishes power line dips from chip failures, protecting the facility breaker.",
        "primary_policy": "combined",
        "comparison": ["combined"],
        "config": {
            "scenario_id": "story-power-cliff",
            "seed": 21,
            "steps": 40,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 20,
            "workload": [
                {"start": 0, "util": 0.45, "phase": "steady"},
                {"start": 12, "util": 0.98, "phase": "surge_burst"},
            ],
            "scripted_faults": [
                {
                    "fault_id": "power-cliff-trip",
                    "target_type": "power_domain",
                    "target_id": "power-r0-h0",
                    "cause": "physical_hardware",
                    "mechanism": "power_interruption",
                    "onset": 15,
                    "severity": 0.65,
                    "fail_mode": "none",
                }
            ],
        },
        "owner_playbook": {
            "title": "Substation Surge Pacing & Breaker Trip Protection",
            "problem": "Thousands of chips launching heavy math kernels in the same microsecond cause an instantaneous 16-megawatt electrical shockwave, tripping substation master breakers and blacking out server rows.",
            "solution": "Micro-stagger math execution by 5-10 milliseconds across server rows to smooth power spikes and keep the building grid stable without sacrificing job speed.",
            "hardware_takeaway": "Equip rack power distribution units with sub-cycle high-speed voltage logging linked directly into the cluster job scheduler.",
            "roi_impact": "Prevents catastrophic facility blackouts that require 4+ hours of manual substation resets, saving millions of dollars per event.",
        },
        "failure_level": {
            "tier": "Facility Power & Substation Level",
            "component": "Substation Breaker & Rack Busbar Feed",
            "blast_radius": "Instantaneous 16MW surge sags voltage -> Multiple server rows brown-out -> Facility breaker trip risk",
            "redundancy_strategy": "Software power ramp pacing (micro-staggered launch) with rack-level peak shaving batteries (BBU)",
        },
    },
    "fractured_microbump": {
        "title": "The microscopic cracked solder wire",
        "summary": "A microscopic solder wire connecting chiplets cracks under heat expansion, dropping data. Naive restarts repeat the crash; automated testing isolates the bad wire and switches instantly to a built-in backup spare wire in 45 seconds.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-microbump",
            "seed": 22,
            "steps": 45,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 15,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "microbump-intermittent",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d1",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 10,
                    "ramp": 8,
                    "severity": 0.85,
                    "hard_fail": 26,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Automated Multi-Chip Module (MCM) Test Sequencing & Microbump BISR",
            "problem": "Thermal expansion causes a microscopic 35-micron solder wire inside the multi-chip package to crack intermittently at high heat. Simple software restarts fail repeatedly, wasting $150,000 in cluster idle stalls.",
            "solution": "Trigger automated package testing: scan boundaries, test signal margins, and dynamically remap the faulty connection to an on-package backup spare wire in 45 seconds.",
            "hardware_takeaway": "Require chip manufacturers to include redundant die-to-die spare wires (UCIe / NV-HBI) and live signal margin telemetry in your chip purchase contracts.",
            "roi_impact": "Saves $25,000+ per multi-chip package by repairing it in place instead of throwing it away, while slashing downtime from 4 hours to 45 seconds.",
        },
        "failure_level": {
            "tier": "Silicon Packaging & MCM Level",
            "component": "Silicon Interposer & Microbump Array",
            "blast_radius": "1 Fractured D2D Microbump -> Die-to-die bus parity drops -> Gang-scheduled all-reduce stalls all 32,768 GPUs",
            "redundancy_strategy": "Automated 5-phase test sequencing with on-package redundant spare microbump lane remapping (BISR)",
        },
    },
    "wafer_lot_contagion": {
        "title": "The bad factory baking batch recall",
        "summary": "A processor dies from a hidden manufacturing flaw from the outer edge of a factory baking batch. A naive rule replaces one machine and gets hit by rolling crashes; digital birth certificates trace sister chips across the facility and safely rotate them out during normal save breaks.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-wafer-contagion",
            "seed": 23,
            "steps": 50,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 15,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "gate-oxide-die-pop",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 12,
                    "ramp": 6,
                    "severity": 0.85,
                    "hard_fail": 28,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Feed-Forward Silicon Lineage & Wafer-Lot Cohort Cordoning",
            "problem": "A hidden manufacturing defect affects an entire batch of chips sliced from the edge of a silicon disc. Replacing failed chips one by one causes rolling crashes across the hall for weeks, costing over $1,200,000.",
            "solution": "Query the failed chip's digital birth certificate (wafer lot ID and coordinate). Automatically find all sister chips from the same flawed batch and safely swap them out during normal scheduled save intervals without crashing the active job.",
            "hardware_takeaway": "Mandate digital birth certificates (wafer lot ID, slice coordinates, factory voltage requirements, and leakage) stored in on-board memory for every accelerator.",
            "roi_impact": "Prevents 5 to 10 rolling cluster crashes ($1M-$2M saved) by eliminating the entire bad batch in one proactive rotation.",
        },
        "failure_level": {
            "tier": "Foundry Wafer Lot & Lineage Level",
            "component": "Wafer Lot Cohort & Die Genealogy",
            "blast_radius": "1 Gate-Oxide Die Failure -> 14 sibling dies from contaminated Wafer Lot #WL-9042 outer ring at risk -> Rolling multi-week 32k GPU stalls",
            "redundancy_strategy": "Feed-forward silicon lineage tracking with automated wafer-lot cohort cordoning during scheduled checkpoint saves",
        },
    },
    "innocent_chip_dying_board": {
        "title": "The healthy car engine on a faulty circuit board",
        "summary": "A processor suffers electrical pressure drops from a blown circuit board regulator. A naive policy scraps the good $30,000 chip and crashes again; board diagnostics confirm the chip is healthy, pinpoint the cheap board regulator, and redistribute electrical phases.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-dying-board",
            "seed": 24,
            "steps": 45,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 15,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "vrm-phase-droop",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d1",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 10,
                    "ramp": 8,
                    "severity": 0.85,
                    "hard_fail": 26,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Baseboard VRM Power Delivery & Chip-History Fault Discrimination",
            "problem": "A cheap $10 voltage regulator module on the circuit board fails, causing electrical pressure dips during heavy computing. Uninformed technicians mistakenly replace the healthy $30,000 chip, leading to rejected warranty claims and an immediate repeat crash on the new chip.",
            "solution": "Cross-reference the chip's flawless factory history with circuit board power sensors. Confirm the board power line is the true culprit, and dynamically redistribute electrical load across remaining board regulators to finish training.",
            "hardware_takeaway": "Instrument carrier boards with per-phase current sensors and strain gauges; enforce board-level diagnostics before approving expensive chip replacements.",
            "roi_impact": "Eliminates mistaken $30,000 chip replacements, prevents secondary crash loops, and eliminates warranty return rejections.",
        },
        "failure_level": {
            "tier": "Accelerator Baseboard & Motherboard Level",
            "component": "Carrier Baseboard VRM Phase & Retimer",
            "blast_radius": "1 Blown VRM Power Phase on Baseboard Socket 1 -> Voltage droop induces false GPU faults -> Naive chip swap crashes again ($180k wasted)",
            "redundancy_strategy": "Board-level power delivery network (PDN) diagnostics correlated with chip birth history to trigger dynamic VRM multi-phase redistribution",
        },
    },
    "rack_thermal_shadow": {
        "title": "The pinched high-rise cooling pipe",
        "summary": "A pinched cooling valve on a lower shelf starves the top four server shelves, like a pinched garden hose in a 16-story high-rise. 32 chips heat up together; rack elevation monitoring catches the heat gradient early and triggers a clean save and valve line flush.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-rack-thermal-shadow",
            "seed": 25,
            "steps": 45,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 15,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "manifold-pinch",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d0",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 10,
                    "ramp": 8,
                    "severity": 0.85,
                    "hard_fail": 28,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Rack-Scale Spatial Telemetry & Coolant Manifold Diagnostics",
            "problem": "A valve blockage in the rack liquid cooling supply manifold starves the upper shelves. Heat builds up into a thermal wave across 32 processors. Single-chip monitoring misses the rack-wide pattern until 32 chips overheat simultaneously, halting training across 32,768 accelerators.",
            "solution": "Aggregate temperature sensors into real-time vertical rack elevation maps. Detect spatial heat gradients (top vs bottom ΔT > 10°C) and pressure drops. Proactively trigger a clean save and execute an automated coolant manifold line flush before chips overheat.",
            "hardware_takeaway": "Install digital differential pressure sensors on rack cooling manifolds and map vertical shelf elevation directly into the cluster monitoring engine.",
            "roi_impact": "Prevents catastrophic 32-processor simultaneous overheating cascades, protecting $180,000 in lost computing time per manifold incident.",
        },
        "failure_level": {
            "tier": "Rack Scale & Cooling Loop Level",
            "component": "Rack Coolant Manifold & Vertical Busbar",
            "blast_radius": "Coolant Manifold Valve Pinch -> Upper 4 Shelves starved -> 32 GPUs overheat simultaneously -> Cluster-wide 32k GPU training job aborted",
            "redundancy_strategy": "Rack-scale spatial elevation monitoring with automated manifold differential pressure telemetry, preemptive checkpointing, and dynamic valve flushing",
        },
    },
    "cold_plate_torque_fracture": {
        "title": "The over-tightened cooling clamp screws",
        "summary": "A pristine processor abruptly dies from cracked microscopic pins caused by over-tightened cooling screws at the assembly plant. Digital passport history traces the faulty factory assembly bench and cordons 16 sister machines at the next save before rolling crashes occur.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-torque-fracture",
            "seed": 26,
            "steps": 45,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 15,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "torque-strain-pop",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d1",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 10,
                    "ramp": 8,
                    "severity": 0.85,
                    "hard_fail": 28,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Cradle-to-Grave Digital Passport & Assembly Batch Cordoning",
            "problem": "An uncalibrated power screwdriver at the contract assembly factory over-tightened cooling plate screws by 32%, bending the underlying circuit board. Under operating heat, solder joints crack under high-speed memory towers. Reactive policies blame random silicon, leaving 16 sister machines from the same assembly line to crash over weeks.",
            "solution": "Query the processor's unified digital passport (birth certificate -> packaging plant -> factory assembly bench and batch). Identify the screw torque violation, claim 100% manufacturer warranty credit, and safely cordon sister machines during the next scheduled save without crashing active training.",
            "hardware_takeaway": "Mandate automated screw torque telemetry logging and board strain sensors in all system assembly procurement contracts, recorded in the chip's digital passport.",
            "roi_impact": "Recovers $480,000 in automated factory warranty credits and prevents 3 to 6 secondary cluster stalls ($600,000+ saved) by eliminating assembly batch defects in one proactive sweep.",
        },
        "failure_level": {
            "tier": "ODM Assembly & System Integration Level",
            "component": "Cold Plate Mounting Torque & PCB Strain",
            "blast_radius": "Cold Plate Over-Torque -> 380 microstrain cracks HBM micro-bumps -> Sibling integration batch at risk -> Rolling multi-week 32k GPU stalls",
            "redundancy_strategy": "Cradle-to-grave digital passport correlation with automated assembly batch cordoning at scheduled checkpoint boundaries",
        },
    },
    "silent_subthreshold_cliff": {
        "title": "The subtle electrical pressure drop",
        "summary": "A processor running at normal temperature suffers a slight electrical pressure dip, causing silent math calculation errors. A blind policy lets errors corrupt training; AI early warning predicts the timing drop 60 seconds early and applies micro-pacing to restore safety without stopping the job.",
        "primary_policy": "combined",
        "comparison": ["reactive", "combined"],
        "config": {
            "scenario_id": "story-subthreshold-cliff",
            "seed": 27,
            "steps": 45,
            "hosts_per_rack": 2,
            "gpus_per_host": 2,
            "tp_size": 2,
            "checkpoint_interval": 15,
            "warmup_steps": 2,
            "scripted_faults": [
                {
                    "fault_id": "subthreshold-timing-droop",
                    "target_type": "accelerator",
                    "target_id": "gpu-r0-h0-d1",
                    "cause": "physical_hardware",
                    "mechanism": "cooling_degradation",
                    "onset": 10,
                    "ramp": 8,
                    "severity": 0.85,
                    "hard_fail": 28,
                    "fail_mode": "recoverable_process",
                }
            ],
        },
        "owner_playbook": {
            "title": "Silicon-Context AI Anomaly Detection & Dynamic Vmin Pacing",
            "problem": "Processors sliced from the outer edge of a silicon disc require tighter voltage cushions. During heavy sync bursts, transient electrical pressure dips push high-leakage chips over a timing cliff even at comfortable temperatures (71°C). Traditional tools miss this until silent math calculation errors corrupt training weights or crash the cluster.",
            "solution": "Deploy smart AI anomaly detection that combines real-time voltage and temperature with the chip's factory birth certificate. Detect safety cushion collapse (< 15 mV) 60 seconds early, trigger a proactive weights save, and apply a 50 MHz micro-pace to restore safe timing cushion without stopping the job.",
            "hardware_takeaway": "Incorporate per-chip factory minimum voltage requirements into your telemetry inference pipeline; configure sub-millisecond core voltage droop monitors on all accelerator power rails.",
            "roi_impact": "Prevents catastrophic multi-day rollbacks from silent math calculation errors ($500k-$1.5M saved per incident) and eliminates 98% of false-alarm cluster restarts.",
        },
        "failure_level": {
            "tier": "Silicon Physics & AI Telemetry Level",
            "component": "Sub-Threshold Dynamic Vmin Timing Cliff",
            "blast_radius": "Vmargin collapse -> Sub-threshold timing hazard -> Silent Data Corruption (SDC) -> Corrupted checkpoint rolls back 32,768 GPUs by 48 hours ($850k loss)",
            "redundancy_strategy": "Silicon-context AI margin modeling with automated preemptive checkpointing and dynamic micro-frequency pacing",
        },
    },
}


def story_config(story_id: str) -> ScenarioConfig:
    spec = STORIES[story_id]
    return ScenarioConfig(**spec["config"], story_id=story_id)


def run_story(story_id: str, mode: str = "automated", approvals: list[dict] | None = None, policy: str | None = None, presentation: bool = False) -> dict:
    spec = STORIES[story_id]
    cfg = story_config(story_id)
    name = policy or spec["primary_policy"]
    result = run_scenario(cfg, name, mode=mode, approvals=approvals or [])
    view = public_view(result, presentation=presentation)
    view["story"] = {
        "id": story_id,
        "title": spec["title"],
        "summary": spec["summary"],
        "owner_playbook": spec.get("owner_playbook"),
        "failure_level": spec.get("failure_level"),
    }
    view["approvals"] = list(approvals or [])
    if mode == "automated":
        view["comparison"] = compare_policies(cfg, spec["comparison"])
    view["operator_view"] = True
    view["_evaluator"] = result["evaluator"]
    return view


def list_stories() -> list[dict]:
    return [
        {
            "id": story_id,
            "title": spec["title"],
            "summary": spec["summary"],
            "primary_policy": spec["primary_policy"],
            "owner_playbook": spec.get("owner_playbook"),
            "failure_level": spec.get("failure_level"),
        }
        for story_id, spec in STORIES.items()
    ]
