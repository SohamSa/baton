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
