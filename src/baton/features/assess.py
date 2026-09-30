"""Observation-only assessment. Hidden truth keys are ignored."""

from __future__ import annotations

from baton.features.compute import ewma, thermal_residual
from baton.intelligence.hypotheses import EvidenceSummary, rank_hypotheses

FORBIDDEN_INPUTS = {
    "r_multiplier",
    "wear",
    "vulnerability",
    "true_cause",
    "onset_step",
    "hard_fail",
    "latent",
    "fault_id",
    "severity",
}


def visible_rows(rows: list[dict], step: int) -> list[dict]:
    visible = []
    for row in rows:
        if row.get("availability_step", row.get("event_step", 0)) > step:
            continue
        visible.append({key: value for key, value in row.items() if key not in FORBIDDEN_INPUTS})
    return visible


def assess_series(rows: list[dict], step: int, nominal_r: float, coolant_c: float = 25.0) -> dict:
    usable = [row for row in visible_rows(rows, step) if row.get("entity_kind", "accelerator") == "accelerator" or "gpu_temp_c" in row]
    residuals = []
    for row in usable:
        residuals.append(thermal_residual(row.get("gpu_temp_c"), row.get("power_draw_w"), coolant_c, nominal_r))
    freshness = 999 if not usable else step - usable[-1].get("event_step", step)
    summary = EvidenceSummary(
        residual_ewma=ewma(residuals),
        freshness_steps=freshness,
        support_count=len(usable),
        data_quality_ok=freshness <= 5 and len(usable) >= 3,
        power_drop_correlated=bool(usable and usable[-1].get("power_drop_correlated")),
    )
    ranked = rank_hypotheses(summary)
    ranked["feature_contract"] = ["residual_ewma", "freshness_steps", "support_count"]
    return ranked
