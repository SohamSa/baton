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
