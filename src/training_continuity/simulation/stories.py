"""Guided stories. Each one is a scenario executed by the simulation engine."""

from __future__ import annotations

from training_continuity.simulation.engine import ScenarioConfig, compare_policies, public_view, run_scenario

STORIES: dict[str, dict] = {
    "gradual_warning": {
        "title": "Gradual warning, then a controlled recovery",
        "summary": "Cooling degradation is visible in the thermal residual before the accelerator stops. An extra verified checkpoint is requested. Recovery uses that save.",
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
    },
    "abrupt_failure": {
        "title": "Abrupt failure without a predictive warning",
        "summary": "The process stops without a thermal precursor. The gain, when there is one, comes from a shorter supported recovery, not from foresight.",
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
    },
    "shared_infrastructure": {
        "title": "Shared power domain, one incident",
        "summary": "Several accelerators on one feed show the same power-limit drop. They are grouped as one incident. Accelerators on the other feed are not pulled in.",
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
    },
    "healthy_workload_shift": {
        "title": "A healthy workload shift is not a fault",
        "summary": "Utilization and temperature rise together inside the nominal envelope. The combined policy does not quarantine the accelerator.",
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
    },
    "incomplete_checkpoint": {
        "title": "An incomplete checkpoint is refused",
        "summary": "A save that loses shards is not usable. Recovery falls back to the older verified checkpoint.",
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
    },
    "unsupported_local_recovery": {
        "title": "Localized recovery is unsupported",
        "summary": "Dropping one rank from a strictly synchronized job is rejected. Coordinated restart is the supported alternative.",
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
    },
    "stale_telemetry": {
        "title": "Stale telemetry lowers confidence",
        "summary": "Collector lag hides the recent samples. The system abstains instead of inventing a diagnosis.",
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
    },
    "harmful_preventive": {
        "title": "A preventive policy can do worse",
        "summary": "A static temperature limit quarantines a healthy burst. The paired reactive run keeps making progress. The comparison shows the loss.",
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
    view["story"] = {"id": story_id, "title": spec["title"], "summary": spec["summary"]}
    view["approvals"] = list(approvals or [])
    if mode == "automated":
        view["comparison"] = compare_policies(cfg, spec["comparison"])
    view["operator_view"] = True
    view["_evaluator"] = result["evaluator"]
    return view


def list_stories() -> list[dict]:
    return [
        {"id": story_id, "title": spec["title"], "summary": spec["summary"], "primary_policy": spec["primary_policy"]}
        for story_id, spec in STORIES.items()
    ]
