"""Optional economics. Disabled unless the caller supplies a complete configuration.

ROI is undefined when investment cost is missing or zero. It is never treated as infinite.
"""

from __future__ import annotations

from typing import Any

REQUIRED = (
    "gpu_hour_rate",
    "currency",
    "cost_basis",
    "scope",
    "horizon",
    "investment_cost",
    "benefit_basis",
)


def evaluate_economics(config: dict[str, Any] | None, useful_delta_steps: float, wall_hours: float) -> dict:
    if not config or not config.get("enabled"):
        return {
            "currency_enabled": False,
            "roi": None,
            "net_benefit": None,
            "reason": "currency_disabled_until_complete_accounting_configuration",
            "label": None,
        }
    missing = [key for key in REQUIRED if config.get(key) in (None, "")]
    if missing:
        return {
            "currency_enabled": False,
            "roi": None,
            "net_benefit": None,
            "reason": "incomplete_accounting_configuration",
            "missing": missing,
            "label": None,
        }
    investment = float(config["investment_cost"])
    if investment == 0:
        return {
            "currency_enabled": True,
            "roi": None,
            "net_benefit": None,
            "reason": "roi_undefined_when_investment_cost_is_zero",
            "label": "assumption-based simulation estimate",
        }
    if config["benefit_basis"] != "gpu_hour_rate_times_useful_step_hours":
        return {
            "currency_enabled": True,
            "roi": None,
            "net_benefit": None,
            "reason": "incompatible_benefit_and_cost_basis",
            "label": "assumption-based simulation estimate",
        }
    # The caller must already have expressed useful_delta_steps in GPU-hours
    # of avoided lost work. We do not invent a rate or a step-to-hour factor.
    if config.get("useful_delta_gpu_hours") is None:
        return {
            "currency_enabled": True,
            "roi": None,
            "net_benefit": None,
            "reason": "missing_useful_delta_gpu_hours",
            "label": "assumption-based simulation estimate",
        }
    benefit = float(config["gpu_hour_rate"]) * float(config["useful_delta_gpu_hours"])
    incremental = float(config.get("incremental_cost", investment))
    net = benefit - incremental
    roi = net / investment
    return {
        "currency_enabled": True,
        "roi": roi,
        "net_benefit": net,
        "benefit": benefit,
        "incremental_cost": incremental,
        "investment_cost": investment,
        "reason": "computed_from_user_supplied_assumptions",
        "label": "assumption-based simulation estimate",
        "assumptions": {key: config[key] for key in REQUIRED},
        "wall_hours_context": wall_hours,
        "useful_delta_steps_context": useful_delta_steps,
    }
