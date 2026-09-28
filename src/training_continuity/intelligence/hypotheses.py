"""Evidence-ranked hypotheses. Scores are not calibrated probabilities."""

from __future__ import annotations

from dataclasses import dataclass, asdict

from training_continuity.domain.enums import CAUSE_OF_MECHANISM, Mechanism


@dataclass
class EvidenceSummary:
    residual_ewma: float | None = None
    ecc_rate: float | None = None
    power_drop_correlated: bool = False
    link_error_rate: float | None = None
    util_jump: bool = False
    temp_tracks_power: bool = False
    freshness_steps: float = 0
    support_count: int = 0
    domain_peer_high_residual: int = 0
    telemetry_gap: bool = False
    progress_continuing: bool = True
    checkpoint_incomplete: bool = False
    firmware_changed: bool = False
    maintenance_window: bool = False
    collective_wait_s: float = 0
    heartbeat_missing: bool = False
    data_quality_ok: bool = True

    def to_dict(self) -> dict:
        return asdict(self)


def rank_hypotheses(summary: EvidenceSummary) -> dict:
    scores = {item.value: 0.0 for item in Mechanism}
    missing = []
    contradictions: dict[str, list[str]] = {item.value: [] for item in Mechanism}

    if not summary.data_quality_ok or summary.freshness_steps > 5 or summary.support_count < 3:
        missing.append("fresh telemetry")
        return _finish(scores, summary, missing, contradictions, force_unknown=True, reason="stale_or_insufficient_evidence")

    if summary.telemetry_gap and summary.progress_continuing:
        scores[Mechanism.collector_gap.value] += 2.0
        contradictions[Mechanism.cooling_degradation.value].append("progress continued during the telemetry gap")
        missing.append("independent thermal confirmation")

    residual = summary.residual_ewma or 0.0
    if summary.temp_tracks_power and summary.util_jump and residual < 4:
        scores[Mechanism.workload_shift.value] += 2.4
        contradictions[Mechanism.cooling_degradation.value].append("temperature moved with power inside the nominal envelope")
    elif residual > 6 and summary.domain_peer_high_residual >= 2:
        scores[Mechanism.cooling_degradation.value] += 2.4
        missing.append("loop flow confirmation")
    elif residual > 6:
        scores[Mechanism.cooling_degradation.value] += 2.2
        contradictions[Mechanism.workload_shift.value].append("residual remained high after accounting for observed power")

    if (summary.ecc_rate or 0) > 1.5:
        scores[Mechanism.memory_errors.value] += 2.3
    if summary.power_drop_correlated:
        scores[Mechanism.power_interruption.value] += 2.5
        contradictions[Mechanism.cooling_degradation.value].append("power limit fell across the shared domain")
    if (summary.link_error_rate or 0) > 1 or summary.collective_wait_s > 1.5:
        scores[Mechanism.link_degradation.value] += 1.2
        scores[Mechanism.collective_timeout.value] += 1.4
    if summary.firmware_changed and residual < 8:
        scores[Mechanism.driver_firmware.value] += 1.8
    if summary.maintenance_window:
        scores[Mechanism.planned_maintenance.value] += 2.0
    if summary.checkpoint_incomplete:
        scores[Mechanism.storage_fault.value] += 2.2
    if summary.heartbeat_missing and not summary.telemetry_gap and residual < 3 and (summary.ecc_rate or 0) < 1:
        scores[Mechanism.application_error.value] += 1.3
        scores[Mechanism.unknown.value] += 0.4
        missing.append("process exit code versus device reset evidence")

    return _finish(scores, summary, missing, contradictions, force_unknown=False, reason="")


def _finish(scores, summary, missing, contradictions, force_unknown: bool, reason: str) -> dict:
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_name, top_score = ranked[0]
    second_score = ranked[1][1]
    conflict = second_score > 0 and second_score >= 0.8 * top_score and top_score < 2.6
    abstain = force_unknown or top_score < 1.0 or (conflict and top_score < 2.2)
    mechanism = Mechanism.unknown.value if abstain else top_name
    alternatives = []
    for name, score in ranked:
        if score <= 0 and name != Mechanism.unknown.value:
            continue
        mech = Mechanism(name)
        alternatives.append(
            {
                "mechanism": name,
                "cause_family": CAUSE_OF_MECHANISM[mech].value,
                "support": round(score, 3),
                "support_is_probability": False,
                "contradictions": contradictions.get(name, []),
                "missing_evidence": missing,
            }
        )
    if abstain:
        reason = reason or ("conflicting_evidence" if conflict else "insufficient_support")
    return {
        "leading_mechanism": mechanism,
        "leading_cause_family": CAUSE_OF_MECHANISM[Mechanism(mechanism)].value,
        "abstain": abstain,
        "abstain_reason": reason if abstain else "",
        "conflict": conflict,
        "confidence_note": "Support scores are uncalibrated rankings, not failure probabilities.",
        "alternatives": alternatives[:6],
        "summary": summary.to_dict(),
    }
