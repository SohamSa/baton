"""Policies read an observed snapshot and nothing else."""

from __future__ import annotations

from baton.domain.enums import HIGH_IMPACT, ActionType


def _decision(action: str, scope: str, rationale: str, hypotheses: dict, **extra) -> dict:
    kind = ActionType(action)
    return {
        "action": action,
        "scope": scope,
        "rationale": rationale,
        "high_impact": kind in HIGH_IMPACT,
        "abstain": bool(hypotheses.get("abstain")),
        "hypotheses": hypotheses,
        **extra,
    }


class ReactivePolicy:
    name = "reactive"
    heartbeat_timeout = 5

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        if snap["heartbeat_missing_ranks"] and snap["eligible_checkpoint_id"]:
            return _decision(
                "restart",
                snap["job_id"],
                "A rank heartbeat exceeded the reactive timeout. Restart from the newest verified checkpoint.",
                hypotheses,
            )
        if snap["heartbeat_missing_ranks"]:
            return _decision(
                "investigate",
                snap["job_id"],
                "A rank heartbeat was lost and no verified checkpoint is eligible.",
                hypotheses,
            )
        return _decision("none", snap["job_id"], "No observed failure.", hypotheses)


class StaticThresholdPolicy:
    name = "static_threshold"
    heartbeat_timeout = 5
    temp_limit_c = 60.0

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        if snap["quality_ok"]:
            for gpu_id, row in snap["gpus"].items():
                temp = row.get("gpu_temp_c")
                if temp is not None and temp >= self.temp_limit_c:
                    return _decision(
                        "quarantine",
                        gpu_id,
                        f"Reported temperature {temp:.1f} C crossed a static limit of {self.temp_limit_c:.0f} C.",
                        hypotheses,
                        target_gpu=gpu_id,
                    )
        if snap["heartbeat_missing_ranks"] and snap["eligible_checkpoint_id"]:
            return _decision("restart", snap["job_id"], "Heartbeat lost after the static checks.", hypotheses)
        return _decision("none", snap["job_id"], "Static thresholds were not crossed.", hypotheses)


class AnomalyPolicy:
    name = "anomaly"
    heartbeat_timeout = 4

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        residual = snap.get("max_residual_ewma")
        if snap["quality_ok"] and residual is not None and residual > 14:
            gpu_id = snap["hottest_gpu"]
            return _decision("quarantine", gpu_id, "Residual exceeded the high anomaly band.", hypotheses, target_gpu=gpu_id)
        if snap["quality_ok"] and residual is not None and residual > 8 and (snap["checkpoint_age"] or 999) > 6:
            return _decision("request_checkpoint", snap["job_id"], "Residual exceeded the anomaly band.", hypotheses)
        if snap["heartbeat_missing_ranks"] and snap["eligible_checkpoint_id"]:
            return _decision("restart", snap["job_id"], "Heartbeat lost.", hypotheses)
        return _decision("none", snap["job_id"], "No anomaly action.", hypotheses)


class RiskAwarePolicy:
    name = "risk_aware"
    heartbeat_timeout = 5

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        residual = snap.get("max_residual_ewma")
        age = snap["checkpoint_age"] if snap["checkpoint_age"] is not None else 999
        if snap["quality_ok"] and residual is not None and residual > 6 and age >= 12 and not hypotheses.get("abstain"):
            if hypotheses.get("leading_mechanism") == "workload_shift":
                return _decision("none", snap["job_id"], "Power and temperature moved together. No checkpoint was added.", hypotheses)
            return _decision(
                "request_checkpoint",
                snap["job_id"],
                "Sustained thermal residual and checkpoint age justify an extra verified save.",
                hypotheses,
            )
        if snap["heartbeat_missing_ranks"] and snap["eligible_checkpoint_id"]:
            return _decision("restart", snap["job_id"], "Heartbeat lost. Restart from the newest verified checkpoint.", hypotheses)
        return _decision("none", snap["job_id"], "Risk gate did not request an intervention.", hypotheses)


class CapabilityPolicy:
    name = "capability_aware"
    heartbeat_timeout = 1

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        if snap["heartbeat_missing_ranks"]:
            if snap["reconfigure_supported"] and snap["eligible_checkpoint_id"]:
                return _decision(
                    "reconfigure",
                    snap["job_id"],
                    "The runtime declares resharding support, so the failed data-parallel replica can be removed by a checkpoint restart.",
                    hypotheses,
                )
            if snap["eligible_checkpoint_id"]:
                return _decision(
                    "restart",
                    snap["job_id"],
                    "Coordinated restart is the supported recovery. Membership cannot change for this capability.",
                    hypotheses,
                )
            return _decision("investigate", snap["job_id"], "Recovery is blocked because no verified checkpoint is eligible.", hypotheses)
        return _decision("none", snap["job_id"], "No failed rank is visible.", hypotheses)


class CombinedPolicy:
    name = "combined"
    heartbeat_timeout = 2

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        if snap["freshness_steps"] > 5 or not snap["quality_ok"]:
            return _decision(
                "investigate",
                snap["job_id"],
                "Evidence is stale or incomplete. No disruptive action was taken.",
                hypotheses,
            )
        if hypotheses.get("abstain") and not snap["heartbeat_missing_ranks"]:
            return _decision("none", snap["job_id"], "The evidence does not support a disruptive action.", hypotheses)
        if hypotheses.get("leading_mechanism") == "workload_shift":
            return _decision("none", snap["job_id"], "The shift matches the workload. Intervention was withheld.", hypotheses)
        residual = snap.get("max_residual_ewma")
        age = snap["checkpoint_age"] if snap["checkpoint_age"] is not None else 999
        if residual is not None and residual > 6 and age >= 12 and hypotheses.get("leading_mechanism") == "cooling_degradation":
            return _decision("request_checkpoint", snap["job_id"], "Cooling residual is sustained and the verified checkpoint is aging.", hypotheses)
        if snap["heartbeat_missing_ranks"] and snap["eligible_checkpoint_id"]:
            if snap["reconfigure_supported"]:
                return _decision("reconfigure", snap["job_id"], "Capability allows a smaller restart domain.", hypotheses)
            return _decision("restart", snap["job_id"], "Coordinated restart from the verified checkpoint.", hypotheses)
        return _decision("none", snap["job_id"], "Combined gates did not justify an intervention.", hypotheses)


class ForceReconfigurePolicy:
    """Asks for a local membership change even when the runtime cannot do it."""

    name = "force_reconfigure"
    heartbeat_timeout = 1

    def choose(self, snap: dict) -> dict:
        hypotheses = snap["hypotheses"]
        if snap["heartbeat_missing_ranks"]:
            return _decision(
                "reconfigure",
                snap["job_id"],
                "Requested a localized membership change.",
                hypotheses,
            )
        return _decision("none", snap["job_id"], "Waiting for a rank failure before the unsupported request.", hypotheses)


class OraclePolicy:
    """Evaluator-only upper bound. It reads latent onsets and is not a serving policy."""

    name = "evaluator_oracle"
    heartbeat_timeout = 1
    evaluator_only = True

    def choose(self, snap: dict) -> dict:
        raise RuntimeError("the oracle is not an operational policy")

    def choose_with_truth(self, snap: dict, truth: dict) -> dict:
        hypotheses = snap["hypotheses"]
        upcoming = [item for item in truth["faults"] if item.get("hard_fail") == snap["t"] + 1]
        if upcoming and snap["eligible_checkpoint_id"] is None or (upcoming and (snap["checkpoint_age"] or 999) > 0):
            if upcoming:
                return _decision("request_checkpoint", snap["job_id"], "Oracle saw a latent failure on the next step.", hypotheses)
        if snap["heartbeat_missing_ranks"] and snap["eligible_checkpoint_id"]:
            return _decision("restart", snap["job_id"], "Oracle restart.", hypotheses)
        return _decision("none", snap["job_id"], "Oracle idle.", hypotheses)


class StragglerPolicy:
    name = "straggler_aware"
    heartbeat_timeout = 2

    def choose(self, snap: dict) -> dict:
        h = snap["hypotheses"]
        slow = [(gpu_id, row) for gpu_id, row in snap["gpus"].items() if (row.get("step_latency_ratio") or 0) > 1.2 and row.get("freshness_steps", 999) <= 5]
        if not snap["quality_ok"]:
            return _decision("investigate", snap["job_id"], "Fresh latency evidence is required.", h)
        if slow and snap["spare_available"]:
            target = max(slow, key=lambda pair: pair[1]["step_latency_ratio"])[0]
            if snap["eligible_checkpoint_id"] and snap["checkpoint_age"] == 0:
                return _decision("replace_rank", target, "A sustained observed latency outlier can be replaced through a coordinated restart at the verified save boundary.", h)
            return _decision("request_checkpoint", snap["job_id"], "Preserve progress before replacing the observed slow rank.", h)
        return ReactivePolicy().choose(snap)


class CoolingPolicy:
    name = "cooling_aware"
    heartbeat_timeout = 2

    def choose(self, snap: dict) -> dict:
        h = snap["hypotheses"]
        affected = [(gpu_id, row) for gpu_id, row in snap["gpus"].items() if row.get("cooling_flow_ratio") is not None and row["cooling_flow_ratio"] < 0.6 and (row.get("rack_gradient_c") or 0) > 8]
        if not snap["quality_ok"]:
            return _decision("investigate", snap["job_id"], "Fresh spatial and flow evidence is required.", h)
        if affected:
            if snap["eligible_checkpoint_id"] and snap["checkpoint_age"] is not None and snap["checkpoint_age"] <= 6:
                return _decision("restore_cooling", affected[0][1]["rack_id"], "Related upper positions are hot and report reduced flow. Pause for simulated cooling maintenance after a complete save.", h)
            return _decision("request_checkpoint", snap["job_id"], "Preserve progress before a shared cooling intervention.", h)
        return ReactivePolicy().choose(snap)


class QualificationPolicy:
    name = "qualification_aware"
    heartbeat_timeout = 2

    def choose(self, snap: dict) -> dict:
        h = snap["hypotheses"]
        if not snap["quality_ok"]:
            return _decision("investigate", snap["job_id"], "Qualification status is stale or incomplete.", h)
        if not snap["heartbeat_missing_ranks"]:
            return _decision("none", snap["job_id"], "No failed rank needs qualification.", h)
        if not snap["eligible_checkpoint_id"]:
            return _decision("investigate", snap["job_id"], "No usable save is available for recovery.", h)
        for rank in snap["heartbeat_missing_ranks"]:
            gpu_id = snap["rank_gpu"][rank]
            state = snap["gpus"][gpu_id].get("qualification_state", "not_tested")
            if state == "not_tested":
                return _decision("diagnose", gpu_id, "Run an isolated synthetic load test before allowing the repaired rank back into the job.", h)
            if state == "testing":
                return _decision("none", snap["job_id"], "Qualification is still running; return to service remains blocked.", h)
        return _decision("qualified_restart", snap["job_id"], "Use observed qualification results: a failed candidate stays quarantined and requires compatible spare capacity.", h)


POLICIES = {
    StragglerPolicy.name: StragglerPolicy(),
    CoolingPolicy.name: CoolingPolicy(),
    QualificationPolicy.name: QualificationPolicy(),
    ReactivePolicy.name: ReactivePolicy(),
    StaticThresholdPolicy.name: StaticThresholdPolicy(),
    AnomalyPolicy.name: AnomalyPolicy(),
    RiskAwarePolicy.name: RiskAwarePolicy(),
    CapabilityPolicy.name: CapabilityPolicy(),
    CombinedPolicy.name: CombinedPolicy(),
    ForceReconfigurePolicy.name: ForceReconfigurePolicy(),
}

SERVING_POLICIES = {name: policy for name, policy in POLICIES.items() if not getattr(policy, "evaluator_only", False)}

