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


POLICIES = {
    ReactivePolicy.name: ReactivePolicy(),
    StaticThresholdPolicy.name: StaticThresholdPolicy(),
    AnomalyPolicy.name: AnomalyPolicy(),
    RiskAwarePolicy.name: RiskAwarePolicy(),
    CapabilityPolicy.name: CapabilityPolicy(),
    CombinedPolicy.name: CombinedPolicy(),
    ForceReconfigurePolicy.name: ForceReconfigurePolicy(),
}

SERVING_POLICIES = {name: policy for name, policy in POLICIES.items() if not getattr(policy, "evaluator_only", False)}
