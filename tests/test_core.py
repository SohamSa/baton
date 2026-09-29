"""Invariant tests for the synthetic world, accounting, and decision path."""

from __future__ import annotations

import copy

import pytest

from training_continuity.accounting.economics import assumption_estimate, evaluate_economics
from training_continuity.accounting.ledger import Ledger
from training_continuity.catalog.atlas import catalog_atlas
from training_continuity.catalog.dictionary import build_catalog, catalog_counts
from training_continuity.checkpoints import eligibility, select_restore_checkpoint
from training_continuity.domain.enums import CheckpointState
from training_continuity.domain.machines import TransitionError, transition_action, transition_checkpoint
from training_continuity.domain.enums import ActionState
from training_continuity.domain.workflow import ActionConflict, ActionService, MemoryActionRepo
from training_continuity.features.assess import assess_series
from training_continuity.features.compute import counter_rates, mean_skip_null
from training_continuity.intelligence.hypotheses import EvidenceSummary, rank_hypotheses
from training_continuity.policies.library import POLICIES, SERVING_POLICIES
from training_continuity.security import hash_password, verify_password
from training_continuity.simulation.engine import OBS_KEYS, ScenarioConfig, compare_policies, public_view, run_scenario
from training_continuity.simulation.stories import run_story


def _temps(result, gpu_id="gpu-r0-h0-d0"):
    return [point["gpu_temp_c"] for point in result["timeline"] if point["entity_id"] == gpu_id]


def test_catalog_counts_and_contracts():
    fields = build_catalog()
    counts = catalog_counts(fields)
    assert counts["unique_concepts"] >= 180
    assert counts["aliases"] >= 2
    assert counts["window_aggregations"] >= 50
    assert counts["unique_concepts"] + counts["aliases"] + counts["window_aggregations"] == counts["total_catalog_rows"]
    for field in fields:
        assert field.consumer
        assert field.role in {"observed", "derived", "training_label", "latent_truth", "control_input", "audit"}
        assert field.leakage in {"none", "decision_time_safe", "label", "forbidden"}


def test_catalog_atlas_maps_every_table_and_keeps_the_answer_key_out():
    fields = build_catalog()
    atlas = catalog_atlas(fields)
    assert {table["id"] for table in atlas["tables"]} == {field.entity for field in fields}
    assert atlas["table_count"] == len(atlas["tables"])
    assert atlas["column_count"] == len(fields)
    marked = {
        (table["id"], column["name"])
        for table in atlas["tables"]
        for column in table["columns"]
        if column["in_final"]
    }
    assert ("features", "residual_ewma") in marked
    assert ("checkpoints", "state") in marked
    assert ("training_jobs", "state") not in marked
    for field in fields:
        if field.leakage == "forbidden" or field.role in {"latent_truth", "training_label"}:
            assert (field.entity, field.name) not in marked
    for table in atlas["tables"]:
        assert table["plain"] and table["real_world"] and table["joins_on"] and table["columns"]
        for column in table["columns"]:
            assert column["brief"] and column["impact"]
    decision_names = {item["name"] for item in atlas["decision_columns"]}
    assert "power_limit_ratio" in decision_names
    assert "vulnerability" not in decision_names
    fan = next(field for field in fields if field.name == "fan_speed_ratio")
    assert "null" in fan.null_semantics
    latent = [field for field in fields if field.role == "latent_truth"]
    assert latent and all(field.leakage == "forbidden" for field in latent)


def test_generation_is_deterministic_and_faults_do_not_follow_policy_rng():
    cfg = ScenarioConfig(scenario_id="det", seed=7, steps=25, checkpoint_interval=30)
    first = run_scenario(cfg, "reactive")
    second = run_scenario(cfg, "reactive")
    assert _temps(first) == _temps(second)
    paired = compare_policies(cfg, ["reactive", "static_threshold"])
    assert paired["exogenous_faults_aligned"] is True
    assert paired["counterfactual"] is True


def test_cooling_raises_temperature_without_requiring_monotonic_samples():
    fault = {
        "fault_id": "cool",
        "target_type": "accelerator",
        "target_id": "gpu-r0-h0-d0",
        "cause": "physical_hardware",
        "mechanism": "cooling_degradation",
        "onset": 5,
        "ramp": 6,
        "severity": 0.9,
        "hard_fail": 80,
        "fail_mode": "none",
    }
    faulty = run_scenario(ScenarioConfig(scenario_id="cool", seed=3, steps=20, checkpoint_interval=100, scripted_faults=[fault]), "reactive")
    healthy = run_scenario(ScenarioConfig(scenario_id="base", seed=3, steps=20, checkpoint_interval=100), "reactive")
    assert _temps(faulty)[-1] > _temps(healthy)[-1] + 10
    series = _temps(faulty)
    assert any(series[index] < series[index - 1] for index in range(1, len(series)))
    assert faulty["timeline"][0]["fan_speed_ratio"] is None


def test_null_metrics_are_not_zeros():
    assert mean_skip_null([None, 10, 20]) == 15
    assert counter_rates([5, 8, 2, 4]) == [3, 2, 2]


def test_gradual_checkpoint_beats_reactive_and_abrupt_has_no_early_warning():
    gradual = run_story("gradual_warning")
    delta = gradual["comparison"]["delta_second_minus_first"]["useful_new"]
    assert delta > 5
    abrupt = run_story("abrupt_failure")
    branches = {item["policy"]: item for item in abrupt["comparison"]["branches"]}
    assert branches["capability_aware"]["interruption_seconds"] < branches["reactive"]["interruption_seconds"]
    assert branches["capability_aware"]["useful_new"] > branches["reactive"]["useful_new"]
    early = [action for action in branches["capability_aware"]["actions"] if action["action_type"] == "request_checkpoint" and action["step"] < 30]
    assert early == []


def test_healthy_shift_is_spared_and_static_policy_is_worse():
    healthy = run_story("healthy_workload_shift")
    assert healthy["hypotheses"]["leading_mechanism"] == "workload_shift"
    assert all(action["action_type"] != "quarantine" for action in healthy["actions"])
    harmful = run_story("harmful_preventive")
    delta = harmful["comparison"]["delta_second_minus_first"]["useful_new"]
    assert delta < 0


def test_shared_power_is_one_incident():
    result = run_story("shared_infrastructure")
    assert result["hypotheses"]["leading_mechanism"] == "power_interruption"
    assert len(result["incidents"]) == 1
    assert result["incidents"][0]["scope"] == "power-r0-h0"


def test_incomplete_checkpoint_falls_back_and_local_recovery_is_rejected():
    result = run_story("incomplete_checkpoint")
    states = {checkpoint["progress"]: checkpoint["state"] for checkpoint in result["checkpoints"]}
    assert states[20] == "failed"
    assert states[10] == "verified_usable"
    assert any(action["reason"].startswith("restored_cp-job-0-10") for action in result["actions"])
    unsupported = run_story("unsupported_local_recovery")
    failed = unsupported["actions"][0]
    assert failed["state"] == "failed"
    assert "coordinated restart" in failed["reason"]
    assert unsupported["jobs"]["job-0"]["dropped"] == []


def test_stale_telemetry_abstains():
    result = run_story("stale_telemetry")
    assert result["hypotheses"]["abstain"] is True
    assert result["hypotheses"]["leading_mechanism"] == "unknown"
    assert all(action["action_type"] != "quarantine" for action in result["actions"])


def test_silent_straggler_and_die_level_hierarchy():
    result = run_story("silent_straggler")
    assert result["status"] == "completed"
    assert result["story"]["failure_level"]["tier"] == "Silicon Die Level"
    assert "Straggler" in result["story"]["failure_level"]["blast_radius"]
    delta = result["comparison"]["delta_second_minus_first"]["useful_new"]
    assert delta > 0


def test_revolving_door_canary_qualification_story():
    result = run_story("revolving_door")
    assert result["status"] == "completed"
    assert result["story"]["failure_level"]["tier"] == "Node Qualification / Test Level"
    assert "Premature node re-entry" in result["story"]["failure_level"]["blast_radius"]
    delta = result["comparison"]["delta_second_minus_first"]["useful_new"]
    assert delta > 0


def test_power_cliff_substation_surge_story():
    result = run_story("power_cliff")
    assert result["status"] == "completed"
    assert result["story"]["failure_level"]["tier"] == "Facility Power & Substation Level"
    assert "Instantaneous 16MW surge" in result["story"]["failure_level"]["blast_radius"]
    assert result["hypotheses"]["leading_mechanism"] == "power_interruption"


def test_fractured_microbump_mcm_story():
    result = run_story("fractured_microbump")
    assert result["story"]["failure_level"]["tier"] == "Silicon Packaging & MCM Level"
    assert "Silicon Interposer" in result["story"]["failure_level"]["component"]
    assert "microbump" in result["story"]["failure_level"]["blast_radius"].lower()
    assert result["story"]["owner_playbook"]["title"].startswith("Automated Multi-Chip Module")


def test_wafer_lot_contagion_story():
    result = run_story("wafer_lot_contagion")
    assert result["story"]["failure_level"]["tier"] == "Foundry Wafer Lot & Lineage Level"
    assert "Wafer Lot Cohort" in result["story"]["failure_level"]["component"]
    assert "Wafer Lot" in result["story"]["failure_level"]["blast_radius"]
    assert result["story"]["owner_playbook"]["title"].startswith("Feed-Forward Silicon Lineage")


def test_innocent_chip_dying_board_story():
    result = run_story("innocent_chip_dying_board")
    assert result["story"]["failure_level"]["tier"] == "Accelerator Baseboard & Motherboard Level"
    assert "Carrier Baseboard" in result["story"]["failure_level"]["component"]
    assert "VRM Power Phase" in result["story"]["failure_level"]["blast_radius"]
    assert result["story"]["owner_playbook"]["title"].startswith("Baseboard VRM Power Delivery")


def test_rack_thermal_shadow_story():
    result = run_story("rack_thermal_shadow")
    assert result["status"] == "completed"
    assert result["story"]["failure_level"]["tier"] == "Rack Scale & Cooling Loop Level"
    assert "Coolant Manifold" in result["story"]["failure_level"]["component"]
    assert "32 GPUs" in result["story"]["failure_level"]["blast_radius"]
    assert result["story"]["owner_playbook"]["title"].startswith("Rack-Scale Spatial Telemetry")


def test_cold_plate_torque_fracture_story():
    result = run_story("cold_plate_torque_fracture")
    assert result["status"] == "completed"
    assert result["story"]["failure_level"]["tier"] == "ODM Assembly & System Integration Level"
    assert "Cold Plate" in result["story"]["failure_level"]["component"]
    assert "380 microstrain" in result["story"]["failure_level"]["blast_radius"]
    assert result["story"]["owner_playbook"]["title"].startswith("Cradle-to-Grave Digital Passport")


def test_job_isolation_and_elastic_restart():
    from training_continuity.simulation.engine import FaultConfig

    isolated = run_scenario(
        ScenarioConfig(
            scenario_id="isolated",
            seed=1,
            steps=30,
            n_jobs=2,
            hosts_per_rack=2,
            gpus_per_host=2,
            tp_size=2,
            checkpoint_interval=100,
            scripted_faults=[
                FaultConfig(
                    fault_id="iso",
                    target_type="accelerator",
                    target_id="gpu-r0-h0-d0",
                    cause="application",
                    mechanism="application_error",
                    onset=10,
                    abrupt=True,
                    hard_fail=10,
                    fail_mode="fatal_hardware",
                )
            ],
        ),
        "reactive",
    )
    assert isolated["jobs"]["job-0"]["state"] == "stalled"
    assert isolated["jobs"]["job-1"]["useful_new"] > isolated["jobs"]["job-0"]["useful_new"]
    elastic = run_scenario(
        ScenarioConfig(
            scenario_id="elastic",
            seed=1,
            steps=40,
            tp_size=1,
            capability="reconfigurable",
            checkpoint_interval=10,
            scripted_faults=[
                FaultConfig(
                    fault_id="elastic",
                    target_type="accelerator",
                    target_id="gpu-r0-h0-d0",
                    cause="physical_hardware",
                    mechanism="memory_errors",
                    onset=18,
                    abrupt=True,
                    hard_fail=18,
                    fail_mode="fatal_hardware",
                )
            ],
        ),
        "capability_aware",
    )
    assert elastic["jobs"]["job-0"]["dropped"] == [0]
    assert elastic["jobs"]["job-0"]["progress"] > 18
    assert elastic["actions"][0]["state"] == "succeeded"


def test_observations_exclude_latent_fields_and_assessment_ignores_them():
    result = run_scenario(ScenarioConfig(scenario_id="obs", seed=1, steps=6, checkpoint_interval=20), "reactive")
    forbidden = {"r_multiplier", "wear", "vulnerability", "true_cause", "onset_step", "hard_fail"}
    for row in result["observations"]:
        assert forbidden.isdisjoint(row)
        if row.get("entity_kind") == "accelerator":
            assert set(row).issubset(OBS_KEYS)
    rows = [
        {"entity_kind": "accelerator", "event_step": index, "availability_step": index, "gpu_temp_c": 50, "power_draw_w": 200}
        for index in range(6)
    ]
    base = assess_series(rows, 5, nominal_r=0.12)
    mutated = [{**row, "r_multiplier": 4, "true_cause": "memory_errors", "onset_step": 1} for row in rows]
    assert assess_series(mutated, 5, nominal_r=0.12) == base
    late = [{**row, "availability_step": 12} for row in rows]
    hidden = assess_series(late, 5, nominal_r=0.12)
    shown = assess_series(late, 12, nominal_r=0.12)
    assert hidden["summary"]["support_count"] == 0
    assert shown["summary"]["support_count"] == 6
    assert "evaluator" not in public_view(result)
    presented = public_view(result, presentation=True)
    assert "metrics" not in presented
    assert presented["synthetic"] is True


def test_checkpoint_state_machine_and_eligibility():
    state = CheckpointState.requested
    for nxt in (CheckpointState.queued, CheckpointState.writing, CheckpointState.manifest_complete, CheckpointState.verification_pending, CheckpointState.verified_usable):
        state = transition_checkpoint(state, nxt)
    with pytest.raises(TransitionError):
        transition_checkpoint(CheckpointState.writing, CheckpointState.verified_usable)
    incomplete = {
        "state": "verified_usable",
        "shards_present": 1,
        "shards_expected": 4,
        "checksum_ok": True,
        "topology_signature": "abc",
        "reachable": True,
        "verified_at": 1,
        "progress": 10,
    }
    assert eligibility(incomplete, topology_signature="abc", allow_reshard=False, storage_reachable=True, decision_step=5)[1] == "incomplete"
    bad_topology = dict(incomplete, shards_present=4, topology_signature="other")
    assert eligibility(bad_topology, topology_signature="abc", allow_reshard=False, storage_reachable=True, decision_step=5)[1] == "incompatible_topology"
    unreachable = dict(incomplete, shards_present=4, reachable=False)
    assert eligibility(unreachable, topology_signature="abc", allow_reshard=False, storage_reachable=False, decision_step=5)[1] == "inaccessible"
    future = dict(incomplete, shards_present=4, verified_at=9)
    assert eligibility(future, topology_signature="abc", allow_reshard=False, storage_reachable=True, decision_step=5)[1] == "not_available_yet"
    older = dict(incomplete, shards_present=4, progress=4, checkpoint_id="old")
    newer = dict(incomplete, shards_present=4, progress=10, checkpoint_id="new")
    chosen, _rejected = select_restore_checkpoint([older, newer], topology_signature="abc", allow_reshard=False, storage_reachable=True, decision_step=5)
    assert chosen["checkpoint_id"] == "new"


def test_manual_approval_reject_and_stale_preconditions():
    pending = run_story("gradual_warning", mode="manual", approvals=[])
    assert pending["status"] == "awaiting_approval"
    action = pending["pending_action"]
    rejected = run_story(
        "gradual_warning",
        mode="manual",
        approvals=[{"action_id": action["action_id"], "decision": "reject", "precondition_hash": action["precondition_hash"], "actor": "approver"}],
    )
    assert any(item["state"] == "cancelled" for item in rejected["actions"])
    stale = run_story(
        "gradual_warning",
        mode="manual",
        approvals=[{"action_id": action["action_id"], "decision": "approve", "precondition_hash": "wrong", "actor": "approver"}],
    )
    assert any(item["reason"] == "stale_preconditions" for item in stale["actions"])
    approved = run_story(
        "gradual_warning",
        mode="manual",
        approvals=[{"action_id": action["action_id"], "decision": "approve", "precondition_hash": action["precondition_hash"], "actor": "approver"}],
    )
    assert any(item["state"] == "succeeded" and item["actor_kind"] == "human" for item in approved["actions"])


def test_worker_restart_does_not_repeat_effects_and_conflicts():
    repo = MemoryActionRepo()
    calls = {"n": 0}

    def effect():
        calls["n"] += 1

    service = ActionService(repo)
    service.execute("act-1", "gpu-1", effect)
    ActionService(repo).execute("act-1", "gpu-1", effect)
    assert calls["n"] == 1
    repo.rows["act-2"] = {"key": "act-2", "scope": "gpu-2", "state": "executing", "effect_applied": False}
    repo.scopes["gpu-2"] = "act-2"
    with pytest.raises(ActionConflict):
        service.execute("act-3", "gpu-2", effect)


def test_ledger_conservation_and_no_double_counted_progress():
    ledger = Ledger(step_seconds=1)
    for _ in range(10):
        ledger.add_resource("gpu-a", {"compute": 0.8, "collective_wait": 0.2, "stalled": 0, "checkpoint": 0, "restart": 0, "recovery": 0, "unavailable": 0, "idle": 0})
        ledger.add_resource("gpu-b", {"compute": 0, "collective_wait": 0, "stalled": 1, "checkpoint": 0, "restart": 0, "recovery": 0, "unavailable": 0, "idle": 0})
        ledger.note_step(jobs_interrupted=1, checkpoint_fraction_sum=0)
    assert ledger.conservation_errors(10) == []
    assert ledger.job_interruption_seconds == 10
    assert sum(ledger.resource_seconds["gpu-a"].values()) == pytest.approx(10)
    run = run_scenario(ScenarioConfig(scenario_id="acct", seed=1, steps=12, checkpoint_interval=100), "reactive")
    assert run["ledger_errors"] == []
    assert run["metrics"]["useful_new"] == 12
    assert run["metrics"]["recomputation"] == 0
    assert "utilization" not in run["metrics"]["note"]


def test_stepwise_playback_matches_a_full_run():
    from training_continuity.simulation.engine import ScenarioRun
    from training_continuity.simulation.stories import story_config

    cfg = story_config("healthy_workload_shift")
    full = run_scenario(cfg, "combined", mode="manual")
    session = ScenarioRun(cfg, "combined", "manual", [])
    frames = []
    while not session.finished:
        frames.append(session.advance())
    stepped = session.result()
    assert frames[-1]["done"] is True
    assert len(frames) == cfg.steps
    assert frames[0]["cluster"]["accelerator_count"] == 32768
    assert frames[0]["cluster"]["attached"] is False
    assert stepped["metrics"]["useful_new"] == full["metrics"]["useful_new"]
    assert stepped["status"] == full["status"]
    assert stepped["hypotheses"]["leading_mechanism"] == full["hypotheses"]["leading_mechanism"]
    assert frames[-1]["useful_new"] == full["jobs"]["job-0"]["useful_new"]


def test_assumption_estimate_converts_useful_steps_and_stays_undefined_until_complete():
    partial = assumption_estimate({"gpu_hour_rate": 4}, 10, 5, 4)
    assert partial["roi"] is None
    assert partial["useful_delta_gpu_hours"] == pytest.approx(10 * 5 / 3600 * 4)
    full = assumption_estimate(
        {
            "gpu_hour_rate": 4,
            "currency": "USD",
            "cost_basis": "owner-supplied incremental",
            "scope": "this simulated job",
            "horizon": "this scenario",
            "investment_cost": 100,
        },
        10,
        5,
        4,
    )
    hours = 10 * 5 / 3600 * 4
    assert full["label"] == "assumption-based simulation estimate"
    assert full["benefit"] == pytest.approx(4 * hours)
    assert full["roi"] == pytest.approx((4 * hours - 100) / 100)


def test_economics_stays_undefined_without_a_complete_configuration():
    assert evaluate_economics(None, 1, 1)["roi"] is None
    assert evaluate_economics({"enabled": True, "gpu_hour_rate": 1}, 1, 1)["reason"] == "incomplete_accounting_configuration"
    zero = evaluate_economics(
        {
            "enabled": True,
            "gpu_hour_rate": 2,
            "currency": "USD",
            "cost_basis": "incremental",
            "scope": "this-run",
            "horizon": "scenario",
            "investment_cost": 0,
            "benefit_basis": "gpu_hour_rate_times_useful_step_hours",
            "useful_delta_gpu_hours": 3,
        },
        1,
        1,
    )
    assert zero["roi"] is None
    negative = evaluate_economics(
        {
            "enabled": True,
            "gpu_hour_rate": 1,
            "currency": "USD",
            "cost_basis": "incremental",
            "scope": "this-run",
            "horizon": "scenario",
            "investment_cost": 10,
            "incremental_cost": 10,
            "benefit_basis": "gpu_hour_rate_times_useful_step_hours",
            "useful_delta_gpu_hours": 1,
        },
        1,
        1,
    )
    assert negative["net_benefit"] < 0
    assert negative["label"] == "assumption-based simulation estimate"


def test_hypotheses_are_not_hard_coded_and_passwords_are_hashed():
    cooling = rank_hypotheses(EvidenceSummary(residual_ewma=12, freshness_steps=0, support_count=8, data_quality_ok=True))
    workload = rank_hypotheses(EvidenceSummary(residual_ewma=1, util_jump=True, temp_tracks_power=True, freshness_steps=0, support_count=8, data_quality_ok=True))
    stale = rank_hypotheses(EvidenceSummary(residual_ewma=12, freshness_steps=12, support_count=8, data_quality_ok=False))
    assert cooling["leading_mechanism"] == "cooling_degradation"
    assert workload["leading_mechanism"] == "workload_shift"
    assert stale["abstain"] is True
    stored = hash_password("not-a-default-admin-password")
    assert verify_password("not-a-default-admin-password", stored)
    assert not verify_password("other", stored)
    assert "evaluator_oracle" not in SERVING_POLICIES
    transition_action(ActionState.proposed, ActionState.awaiting_approval)
    with pytest.raises(TransitionError):
        transition_action(ActionState.proposed, ActionState.succeeded)


def test_research_world_is_a_gpu_cluster_of_tens_of_thousands():
    cfg = ScenarioConfig(scenario_id="cluster-scale", seed=1, steps=4, checkpoint_interval=100)
    assert cfg.cluster_gpu_count == 32768
    run = run_scenario(cfg, "reactive")
    cluster = run["cluster"]
    assert cluster["accelerator_count"] >= 10_000
    assert cluster["accelerator_count"] == 32768
    assert cluster["attached"] is False
    assert cluster["detailed_accelerator_count"] + cluster["quiescent_accelerator_count"] == 32768
    assert cluster["detailed_accelerator_count"] < 100
    assert cluster["host_count"] == 4096
    assert cluster["rack_count"] == 256
    assert run["ledger_errors"] == []
    assert run["metrics"]["useful_new"] == 4
    expected_quiescent = cluster["quiescent_accelerator_count"] * cfg.step_seconds * cfg.steps
    assert run["metrics"]["quiescent_accelerator_seconds"] == pytest.approx(expected_quiescent)
    shared = run_story("shared_infrastructure")
    assert shared["cluster"]["accelerator_count"] == 32768
    assert {item["scope"] for item in shared["incidents"]} == {"power-r0-h0"}


def test_queue_backpressure_is_visible():
    from training_continuity.generation.queue import BoundedQueue

    queue = BoundedQueue(2)
    assert queue.put(1) and queue.put(2)
    assert queue.put(3) is False
    assert queue.dropped == 1
    assert queue.degraded is True


def test_policy_choice_ignores_injected_truth_keys():
    result = run_scenario(ScenarioConfig(scenario_id="snap", seed=2, steps=8, checkpoint_interval=30), "combined")
    snap = copy.deepcopy(result["snapshot"])
    snap["gpus"] = result["gpus"]
    first = POLICIES["combined"].choose(snap)
    snap["r_multiplier"] = 9
    snap["true_cause"] = "memory_errors"
    second = POLICIES["combined"].choose(snap)
    assert first == second
