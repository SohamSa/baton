"""Guided stories. Each one is a scenario executed by the simulation engine."""

from __future__ import annotations

from baton.simulation.engine import ScenarioConfig, compare_policies, public_view, run_scenario

STORIES = {'gradual_warning': {'primary_policy': 'risk_aware',
                     'comparison': ['reactive', 'risk_aware'],
                     'config': {'scenario_id': 'story-gradual',
                                'seed': 11,
                                'steps': 80,
                                'checkpoint_interval': 40,
                                'warmup_steps': 2,
                                'scripted_faults': [{'fault_id': 'gradual-cooling',
                                                     'target_type': 'accelerator',
                                                     'target_id': 'gpu-r0-h0-d0',
                                                     'cause': 'physical_hardware',
                                                     'mechanism': 'cooling_degradation',
                                                     'onset': 8,
                                                     'ramp': 8,
                                                     'severity': 0.8,
                                                     'hard_fail': 36,
                                                     'fail_mode': 'recoverable_process'}]},
                     'owner_playbook': {'title': 'Dynamic Thermal-Slope Micro-Checkpointing'},
                     'failure_level': {'tier': 'Chip Level',
                                       'component': 'Accelerator Silicon / Die Thermal Sensor'}},
 'abrupt_failure': {'primary_policy': 'capability_aware',
                    'comparison': ['reactive', 'capability_aware'],
                    'config': {'scenario_id': 'story-abrupt',
                               'seed': 12,
                               'steps': 70,
                               'checkpoint_interval': 20,
                               'warmup_steps': 2,
                               'scripted_faults': [{'fault_id': 'abrupt-process',
                                                    'target_type': 'accelerator',
                                                    'target_id': 'gpu-r0-h0-d0',
                                                    'cause': 'application',
                                                    'mechanism': 'application_error',
                                                    'onset': 30,
                                                    'abrupt': True,
                                                    'hard_fail': 30,
                                                    'fail_mode': 'recoverable_process'}]},
                    'owner_playbook': {'title': 'Fast-Path Rank Eviction & Rapid Group Restart'},
                    'failure_level': {'tier': 'Node Level',
                                      'component': 'Host Motherboard / Compute Process Kernel'}},
 'shared_infrastructure': {'primary_policy': 'combined',
                           'comparison': ['combined'],
                           'config': {'scenario_id': 'story-shared',
                                      'seed': 13,
                                      'steps': 30,
                                      'hosts_per_rack': 2,
                                      'gpus_per_host': 2,
                                      'tp_size': 2,
                                      'checkpoint_interval': 20,
                                      'scripted_faults': [{'fault_id': 'shared-power',
                                                           'target_type': 'power_domain',
                                                           'target_id': 'power-r0-h0',
                                                           'cause': 'physical_hardware',
                                                           'mechanism': 'power_interruption',
                                                           'onset': 15,
                                                           'severity': 0.6,
                                                           'fail_mode': 'none'}]},
                           'owner_playbook': {'title': 'Power-Domain Topology Alignment & Alarm Correlation'},
                           'failure_level': {'tier': 'Rack Level',
                                             'component': 'Rack PDU & Primary Busbar Power Feed'}},
 'healthy_workload_shift': {'primary_policy': 'combined',
                            'comparison': ['reactive', 'combined'],
                            'config': {'scenario_id': 'story-healthy',
                                       'seed': 14,
                                       'steps': 40,
                                       'checkpoint_interval': 50,
                                       'workload': [{'start': 0, 'util': 0.4, 'phase': 'steady'},
                                                    {'start': 12, 'util': 0.95, 'phase': 'burst'}]},
                            'owner_playbook': {'title': 'Workload-Aware Adaptive Thermal Baselines'},
                            'failure_level': {'tier': 'Workload Level',
                                              'component': 'Forward/Backward GEMM Matrix Intensity'}},
 'incomplete_checkpoint': {'primary_policy': 'reactive',
                           'comparison': ['reactive'],
                           'config': {'scenario_id': 'story-checkpoint',
                                      'seed': 15,
                                      'steps': 40,
                                      'checkpoint_interval': 10,
                                      'storage_fail_progress': [20],
                                      'scripted_faults': [{'fault_id': 'after-bad-checkpoint',
                                                           'target_type': 'accelerator',
                                                           'target_id': 'gpu-r0-h0-d0',
                                                           'cause': 'application',
                                                           'mechanism': 'application_error',
                                                           'onset': 28,
                                                           'abrupt': True,
                                                           'hard_fail': 28,
                                                           'fail_mode': 'recoverable_process'}]},
                           'owner_playbook': {'title': 'Atomic Two-Phase Commit Checkpointing'},
                           'failure_level': {'tier': 'Storage / Fabric Level',
                                             'component': 'Parallel File System / Storage Shard Fabric'}},
 'unsupported_local_recovery': {'primary_policy': 'force_reconfigure',
                                'comparison': ['force_reconfigure'],
                                'config': {'scenario_id': 'story-unsupported',
                                           'seed': 16,
                                           'steps': 20,
                                           'checkpoint_interval': 8,
                                           'capability': 'strict_sync',
                                           'tp_size': 2,
                                           'scripted_faults': [{'fault_id': 'needs-restart',
                                                                'target_type': 'accelerator',
                                                                'target_id': 'gpu-r0-h0-d0',
                                                                'cause': 'application',
                                                                'mechanism': 'application_error',
                                                                'onset': 12,
                                                                'abrupt': True,
                                                                'hard_fail': 12,
                                                                'fail_mode': 'recoverable_process'}]},
                                'owner_playbook': {'title': 'Distributed Topology Contract Enforcement'},
                                'failure_level': {'tier': 'Distributed Mesh Level',
                                                  'component': 'Tensor-Parallel Collective Communication '
                                                               'Mesh'}},
 'stale_telemetry': {'primary_policy': 'combined',
                     'comparison': ['combined'],
                     'config': {'scenario_id': 'story-stale',
                                'seed': 17,
                                'steps': 24,
                                'collector_lag_steps': 10,
                                'checkpoint_interval': 20,
                                'scripted_faults': [{'fault_id': 'hidden-cooling',
                                                     'target_type': 'accelerator',
                                                     'target_id': 'gpu-r0-h0-d0',
                                                     'cause': 'physical_hardware',
                                                     'mechanism': 'cooling_degradation',
                                                     'onset': 6,
                                                     'ramp': 4,
                                                     'severity': 0.9,
                                                     'hard_fail': 80,
                                                     'fail_mode': 'none'}]},
                     'owner_playbook': {'title': 'Telemetry Staleness Guardrails (Epistemic Abstention)'},
                     'failure_level': {'tier': 'Management Plane Level',
                                       'component': 'Out-of-Band Telemetry Ingestion Network'}},
 'harmful_preventive': {'primary_policy': 'static_threshold',
                        'comparison': ['reactive', 'static_threshold'],
                        'config': {'scenario_id': 'story-harmful',
                                   'seed': 18,
                                   'steps': 40,
                                   'checkpoint_interval': 50,
                                   'workload': [{'start': 0, 'util': 0.4, 'phase': 'steady'},
                                                {'start': 12, 'util': 0.95, 'phase': 'burst'}]},
                        'owner_playbook': {'title': 'Dynamic Residual Tracking vs. Static Alarms'},
                        'failure_level': {'tier': 'Policy / Threshold Level',
                                          'component': 'Static Temperature Alarm Heuristic'}},
 'silent_straggler': {'primary_policy': 'straggler_aware',
                      'comparison': ['reactive', 'straggler_aware'],
                      'config': {'scenario_id': 'story-straggler',
                                 'seed': 19,
                                 'steps': 60,
                                 'checkpoint_interval': 12,
                                 'warmup_steps': 2,
                                 'spare_count': 1,
                                 'scripted_faults': [{'fault_id': 'slow-rank',
                                                      'target_type': 'accelerator',
                                                      'target_id': 'gpu-r0-h0-d0',
                                                      'cause': 'physical_hardware',
                                                      'mechanism': 'straggler',
                                                      'onset': 8,
                                                      'ramp': 4,
                                                      'severity': 0.8}]},
                      'owner_playbook': {'title': 'Cross-Die Straggler Detection & Fleet Wafer-Lot '
                                                  'Cordoning'},
                      'failure_level': {'tier': 'Silicon Die Level',
                                        'component': 'Accelerator Compute Die & HBM3e Memory Stacks'}},
 'revolving_door': {'primary_policy': 'qualification_aware',
                    'comparison': ['reactive', 'qualification_aware'],
                    'config': {'scenario_id': 'story-revolving',
                               'seed': 20,
                               'steps': 60,
                               'checkpoint_interval': 8,
                               'warmup_steps': 2,
                               'qualification_steps': 3,
                               'capability': 'redundant',
                               'spare_count': 1,
                               'scripted_faults': [{'fault_id': 'unstable-repair',
                                                    'target_type': 'accelerator',
                                                    'target_id': 'gpu-r0-h0-d0',
                                                    'cause': 'physical_hardware',
                                                    'mechanism': 'repair_instability',
                                                    'onset': 18,
                                                    'hard_fail': 18,
                                                    'severity': 0.9,
                                                    'fail_mode': 'recoverable_process'}]},
                    'owner_playbook': {'title': 'Automated Canary Qualification & Quarantine Gates'},
                    'failure_level': {'tier': 'Node Qualification / Test Level',
                                      'component': 'Node Host & Motherboard Re-entry Gate'}},
 'power_cliff': {'primary_policy': 'combined',
                 'comparison': ['combined'],
                 'config': {'scenario_id': 'story-power-cliff',
                            'seed': 21,
                            'steps': 40,
                            'hosts_per_rack': 2,
                            'gpus_per_host': 2,
                            'tp_size': 2,
                            'checkpoint_interval': 20,
                            'workload': [{'start': 0, 'util': 0.45, 'phase': 'steady'},
                                         {'start': 12, 'util': 0.98, 'phase': 'surge_burst'}],
                            'scripted_faults': [{'fault_id': 'power-cliff-trip',
                                                 'target_type': 'power_domain',
                                                 'target_id': 'power-r0-h0',
                                                 'cause': 'physical_hardware',
                                                 'mechanism': 'power_interruption',
                                                 'onset': 15,
                                                 'severity': 0.65,
                                                 'fail_mode': 'none'}]},
                 'owner_playbook': {'title': 'Substation Surge Pacing & Breaker Trip Protection'},
                 'failure_level': {'tier': 'Facility Power & Substation Level',
                                   'component': 'Substation Breaker & Rack Busbar Feed'}},
 'fractured_microbump': {'primary_policy': 'combined',
                         'comparison': ['reactive', 'combined'],
                         'config': {'scenario_id': 'story-microbump',
                                    'seed': 22,
                                    'steps': 45,
                                    'hosts_per_rack': 2,
                                    'gpus_per_host': 2,
                                    'tp_size': 2,
                                    'checkpoint_interval': 15,
                                    'warmup_steps': 2,
                                    'scripted_faults': [{'fault_id': 'microbump-intermittent',
                                                         'target_type': 'accelerator',
                                                         'target_id': 'gpu-r0-h0-d1',
                                                         'cause': 'physical_hardware',
                                                         'mechanism': 'cooling_degradation',
                                                         'onset': 10,
                                                         'ramp': 8,
                                                         'severity': 0.85,
                                                         'hard_fail': 26,
                                                         'fail_mode': 'recoverable_process'}]},
                         'owner_playbook': {'title': 'Automated Multi-Chip Module (MCM) Test Sequencing & '
                                                     'Microbump BISR'},
                         'failure_level': {'tier': 'Silicon Packaging & MCM Level',
                                           'component': 'Silicon Interposer & Microbump Array'}},
 'wafer_lot_contagion': {'primary_policy': 'combined',
                         'comparison': ['reactive', 'combined'],
                         'config': {'scenario_id': 'story-wafer-contagion',
                                    'seed': 23,
                                    'steps': 50,
                                    'hosts_per_rack': 2,
                                    'gpus_per_host': 2,
                                    'tp_size': 2,
                                    'checkpoint_interval': 15,
                                    'warmup_steps': 2,
                                    'scripted_faults': [{'fault_id': 'gate-oxide-die-pop',
                                                         'target_type': 'accelerator',
                                                         'target_id': 'gpu-r0-h0-d0',
                                                         'cause': 'physical_hardware',
                                                         'mechanism': 'cooling_degradation',
                                                         'onset': 12,
                                                         'ramp': 6,
                                                         'severity': 0.85,
                                                         'hard_fail': 28,
                                                         'fail_mode': 'recoverable_process'}]},
                         'owner_playbook': {'title': 'Feed-Forward Silicon Lineage & Wafer-Lot Cohort '
                                                     'Cordoning'},
                         'failure_level': {'tier': 'Foundry Wafer Lot & Lineage Level',
                                           'component': 'Wafer Lot Cohort & Die Genealogy'}},
 'innocent_chip_dying_board': {'primary_policy': 'combined',
                               'comparison': ['reactive', 'combined'],
                               'config': {'scenario_id': 'story-dying-board',
                                          'seed': 24,
                                          'steps': 45,
                                          'hosts_per_rack': 2,
                                          'gpus_per_host': 2,
                                          'tp_size': 2,
                                          'checkpoint_interval': 15,
                                          'warmup_steps': 2,
                                          'scripted_faults': [{'fault_id': 'vrm-phase-droop',
                                                               'target_type': 'accelerator',
                                                               'target_id': 'gpu-r0-h0-d1',
                                                               'cause': 'physical_hardware',
                                                               'mechanism': 'cooling_degradation',
                                                               'onset': 10,
                                                               'ramp': 8,
                                                               'severity': 0.85,
                                                               'hard_fail': 26,
                                                               'fail_mode': 'recoverable_process'}]},
                               'owner_playbook': {'title': 'Baseboard VRM Power Delivery & Chip-History '
                                                           'Fault Discrimination'},
                               'failure_level': {'tier': 'Accelerator Baseboard & Motherboard Level',
                                                 'component': 'Carrier Baseboard VRM Phase & Retimer'}},
 'rack_thermal_shadow': {'primary_policy': 'cooling_aware',
                         'comparison': ['reactive', 'cooling_aware'],
                         'config': {'scenario_id': 'story-rack-thermal-shadow',
                                    'seed': 25,
                                    'steps': 60,
                                    'n_racks': 2,
                                    'hosts_per_rack': 4,
                                    'gpus_per_host': 2,
                                    'checkpoint_interval': 8,
                                    'warmup_steps': 2,
                                    'scripted_faults': [{'fault_id': 'upper-flow-restriction',
                                                         'target_type': 'rack',
                                                         'target_id': 'rack-0',
                                                         'cause': 'physical_hardware',
                                                         'mechanism': 'cooling_restriction',
                                                         'onset': 12,
                                                         'severity': 0.65}]},
                         'owner_playbook': {'title': 'Rack-Scale Spatial Telemetry & Coolant Manifold '
                                                     'Diagnostics'},
                         'failure_level': {'tier': 'Rack Scale & Cooling Loop Level',
                                           'component': 'Rack Coolant Manifold & Vertical Busbar'}},
 'cold_plate_torque_fracture': {'primary_policy': 'combined',
                                'comparison': ['reactive', 'combined'],
                                'config': {'scenario_id': 'story-torque-fracture',
                                           'seed': 26,
                                           'steps': 45,
                                           'hosts_per_rack': 2,
                                           'gpus_per_host': 2,
                                           'tp_size': 2,
                                           'checkpoint_interval': 15,
                                           'warmup_steps': 2,
                                           'scripted_faults': [{'fault_id': 'torque-strain-pop',
                                                                'target_type': 'accelerator',
                                                                'target_id': 'gpu-r0-h0-d1',
                                                                'cause': 'physical_hardware',
                                                                'mechanism': 'cooling_degradation',
                                                                'onset': 10,
                                                                'ramp': 8,
                                                                'severity': 0.85,
                                                                'hard_fail': 28,
                                                                'fail_mode': 'recoverable_process'}]},
                                'owner_playbook': {'title': 'Cradle-to-Grave Digital Passport & Assembly '
                                                            'Batch Cordoning'},
                                'failure_level': {'tier': 'ODM Assembly & System Integration Level',
                                                  'component': 'Cold Plate Mounting Torque & PCB Strain'}},
 'silent_subthreshold_cliff': {'primary_policy': 'combined',
                               'comparison': ['reactive', 'combined'],
                               'config': {'scenario_id': 'story-subthreshold-cliff',
                                          'seed': 27,
                                          'steps': 45,
                                          'hosts_per_rack': 2,
                                          'gpus_per_host': 2,
                                          'tp_size': 2,
                                          'checkpoint_interval': 15,
                                          'warmup_steps': 2,
                                          'scripted_faults': [{'fault_id': 'subthreshold-timing-droop',
                                                               'target_type': 'accelerator',
                                                               'target_id': 'gpu-r0-h0-d1',
                                                               'cause': 'physical_hardware',
                                                               'mechanism': 'cooling_degradation',
                                                               'onset': 10,
                                                               'ramp': 8,
                                                               'severity': 0.85,
                                                               'hard_fail': 28,
                                                               'fail_mode': 'recoverable_process'}]},
                               'owner_playbook': {'title': 'Silicon-Context AI Anomaly Detection & Dynamic '
                                                           'Vmin Pacing'},
                               'failure_level': {'tier': 'Silicon Physics & AI Telemetry Level',
                                                 'component': 'Sub-Threshold Dynamic Vmin Timing Cliff'}}}


# Advanced scenarios have independent observed mechanisms and paired responses.
_records = {f"gpu-r0-h{host}-d{device}": {"lot_id": "LOT-A" if host == 0 else "LOT-B", "assembly_batch_id": "BUILD-A" if host == 0 else "BUILD-B", "mounting_torque_nm": 6.0 if host == 0 else 3.0} for host in range(2) for device in range(2)}
_advanced = {
    "power_cliff": ("power_aware", "power_capacity", "power_domain", "power-r0-h0", .8, 0),
    "fractured_microbump": ("link_aware", "package_link", "accelerator", "gpu-r0-h0-d1", .8, 1),
    "wafer_lot_contagion": ("cohort_aware", "wafer_cohort", "wafer_lot", "LOT-A", .8, 2),
    "innocent_chip_dying_board": ("board_aware", "board_vrm", "host", "host-r0-h0", .8, 2),
    "cold_plate_torque_fracture": ("strain_aware", "assembly_strain", "assembly_batch", "BUILD-A", 1., 2),
    "silent_subthreshold_cliff": ("margin_aware", "voltage_margin", "accelerator", "gpu-r0-h0-d1", .8, 0),
}
for _id, (_policy, _mechanism, _type, _target, _strength, _spares) in _advanced.items():
    STORIES[_id].update(primary_policy=_policy, comparison=["chip_swap" if _id == "innocent_chip_dying_board" else "reactive", _policy], config={
        "scenario_id": "story-" + _id, "seed": 30 + list(_advanced).index(_id), "steps": 64,
        "hosts_per_rack": 2, "gpus_per_host": 2, "checkpoint_interval": 8,
        "warmup_steps": 2, "spare_count": _spares, "capability": "redundant",
        "record_map": _records if _id in {"wafer_lot_contagion", "cold_plate_torque_fracture"} else {},
        "workload": [{"start": 0, "util": .55, "phase": "steady"}, {"start": 12, "util": .85 if _id != "power_cliff" else .98, "phase": "busy"}],
        "scripted_faults": [{"fault_id": "advanced-" + _id, "target_type": _type, "target_id": _target,
            "cause": "physical_hardware", "mechanism": _mechanism, "onset": 10, "severity": _strength}],
    })

CHALLENGES = {
    "silent_straggler": {"spare_count": 0},
    "rack_thermal_shadow": {"collector_lag_steps": 10},
    "revolving_door": {"spare_count": 0},
    "power_cliff": {"fault_strength": 1.05},
    "fractured_microbump": {"spare_count": 0},
    "wafer_lot_contagion": {"fault_strength": .2, "affected_members": 1, "warmup_steps": 16},
    "innocent_chip_dying_board": {"collector_lag_steps": 10},
    "cold_plate_torque_fracture": {"fault_strength": .72, "affected_members": 1, "warmup_steps": 16},
    "silent_subthreshold_cliff": {"fault_strength": .55},
}


# One world combines delayed reports, an interrupted save, and two failed workers.
STORIES["recovery_crossroads"] = {
    "title": "The Recovery Crossroads", "summary": "A warning, delayed evidence, an unfinished save, and two failed workers meet in one job.",
    "primary_policy": "recovery_review", "comparison": ["force_reconfigure", "recovery_review"],
    "coverage": "One compound synthetic world; no physical diagnosis or facility control.",
    "owner_playbook": {"title": "An evidence-led recovery discussion"},
    "failure_level": {"tier": "Job and recovery dependencies", "component": "Observations, storage, membership, and compatible capacity"},
    "config": {"scenario_id": "story-recovery-crossroads", "seed": 41, "steps": 64, "hosts_per_rack": 2, "gpus_per_host": 2,
        "capability": "redundant", "checkpoint_interval": 8, "checkpoint_write_steps": 3, "collector_lag_steps": 3, "spare_count": 2,
        "scripted_faults": [
            {"fault_id": "rising-warning", "target_type": "accelerator", "target_id": "gpu-r0-h0-d0", "cause": "physical_hardware", "mechanism": "cooling_degradation", "onset": 12, "ramp": 8, "severity": .35},
            *[{"fault_id": "interrupted-worker-" + str(i), "target_type": "accelerator", "target_id": "gpu-r0-h0-d" + str(i), "cause": "physical_hardware", "mechanism": "unknown", "onset": 20, "hard_fail": 20, "severity": 1., "fail_mode": "permanent_hardware"} for i in range(2)],
        ]},
}
CHALLENGES["recovery_crossroads"] = {"spare_count": 1, "collector_lag_steps": 8}


from baton.catalog.owner_metadata import OWNER_CHARACTERS

for _story_id, _character in OWNER_CHARACTERS.items():
    _spec = STORIES[_story_id]
    _spec["title"] = _character["name"]
    _spec["summary"] = _character["scene"]
    _spec["coverage"] = _character["coverage"]
    _spec["owner_playbook"].update(problem=_character["scene"], solution=_character["lesson"], hardware_takeaway=_character["question"], roi_impact="Useful-work consequences depend on the synthetic scenario; no measured financial return is claimed.")
    _spec["failure_level"]["blast_radius"] = _character["clue"]
    _spec["failure_level"]["redundancy_strategy"] = _character["lesson"]


def story_config(story_id: str, variant: str = "standard", settings: dict | None = None) -> ScenarioConfig:
    from copy import deepcopy
    if variant not in {"standard", "challenge"} or (variant == "challenge" and story_id not in CHALLENGES):
        raise ValueError("unknown rehearsal variant")
    config = deepcopy(STORIES[story_id]["config"])
    if variant == "challenge":
        changes = dict(CHALLENGES[story_id])
        for key in ("fault_strength", "affected_members"):
            if key in changes:
                config["scripted_faults"][0]["severity" if key == "fault_strength" else key] = changes.pop(key)
        config.update(changes)
        config["scenario_id"] += "-challenge"
    from baton.simulation.rehearsal import apply_settings
    apply_settings(config, settings)
    return ScenarioConfig(**config, story_id=story_id)


def run_story(story_id: str, mode: str = "automated", approvals: list[dict] | None = None, policy: str | None = None, presentation: bool = False, variant: str = "standard", settings: dict | None = None) -> dict:
    spec = STORIES[story_id]
    cfg = story_config(story_id, variant, settings)
    name = policy or spec["primary_policy"]
    result = run_scenario(cfg, name, mode=mode, approvals=approvals or [])
    view = public_view(result, presentation=presentation)
    view["story"] = {
        "id": story_id,
        "variant": variant,
        "settings": dict(settings or {}),
        "title": spec["title"],
        "summary": spec["summary"],
        "owner_playbook": spec.get("owner_playbook"),
        "failure_level": spec.get("failure_level"),
        "coverage": spec.get("coverage"),
    }
    from baton.simulation.rehearsal import run_conditions
    view["rehearsal"] = run_conditions(cfg, settings)
    view["approvals"] = list(approvals or [])
    if mode == "automated":
        view["comparison"] = compare_policies(cfg, spec["comparison"])
    view["operator_view"] = True
    view["_evaluator"] = result["evaluator"]
    return view


def rehearsal_controls(story_id):
    from baton.simulation.rehearsal import controls_for, effective_settings
    variants = ["standard"] + (["challenge"] if story_id in CHALLENGES else [])
    return {"controls": controls_for(STORIES[story_id]["config"]), "presets": {v: effective_settings(story_config(story_id, v)) for v in variants}}


def list_stories() -> list[dict]:
    return [
        {
            "id": story_id,
            "title": spec["title"],
            "summary": spec["summary"],
            "primary_policy": spec["primary_policy"],
            "rehearsal_controls": rehearsal_controls(story_id),
            "owner_playbook": spec.get("owner_playbook"),
            "failure_level": spec.get("failure_level"),
            "coverage": spec.get("coverage"),
        }
        for story_id, spec in STORIES.items()
    ]

