"""Bounded owner-authored teaching inputs, shared by API and browser engine."""
import math
from baton.simulation.engine import config_hash

CONTROLS = [
    {"key": "spare_count", "label": "Compatible replacement machines", "min": 0, "max": 4, "step": 1, "unit": "machines", "why": "Capacity can block a recovery even when a save is usable."},
    {"key": "checkpoint_interval", "label": "Work between scheduled saves", "min": 4, "max": 40, "step": 1, "unit": "progress units", "why": "Frequent saves cost time; wider spacing exposes more work to repetition."},
    {"key": "collector_lag_steps", "label": "Observation delivery delay", "min": 0, "max": 12, "step": 1, "unit": "simulation ticks", "why": "Older evidence can delay or undermine a decision. Ticks are invented model time."},
    {"key": "fault_strength", "label": "Modeled warning strength", "min": 0, "max": 1.2, "step": .05, "unit": "relative strength", "why": "Changes the first modeled warning mechanism, not its authored failure time. This is not a physical limit."},
]
STRENGTH_MECHANISMS = {"cooling_degradation", "straggler", "cooling_restriction", "package_link", "wafer_cohort", "board_vrm", "assembly_strain", "voltage_margin", "power_capacity", "power_interruption"}


def controls_for(config):
    first = (config.get("scripted_faults") or [{}])[0]
    controls = [dict(c) for c in CONTROLS if c["key"] != "fault_strength" or first.get("mechanism") in STRENGTH_MECHANISMS]
    for control in controls:
        if control["key"] == "checkpoint_interval":
            control["max"] = max(control["max"], config.get("checkpoint_interval", 20))
    return controls


def apply_settings(config, settings):
    if settings is None:
        return {}
    if not isinstance(settings, dict):
        raise ValueError("rehearsal settings must be an object")
    allowed = {c["key"]: c for c in controls_for(config)}
    normalized = {}
    for key, value in settings.items():
        c = allowed.get(key)
        if c is None:
            raise ValueError("unsupported rehearsal setting: " + str(key))
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not c["min"] <= value <= c["max"]:
            raise ValueError("out-of-range rehearsal setting: " + key)
        if c["step"] == 1 and int(value) != value:
            raise ValueError("rehearsal setting must be an integer: " + key)
        value = int(value) if c["step"] == 1 else float(value)
        normalized[key] = value
        if key == "fault_strength":
            config["scripted_faults"][0]["severity"] = value
        else:
            config[key] = value
    return normalized


def effective_settings(cfg):
    config = cfg.model_dump()
    return {c["key"]: config["scripted_faults"][0]["severity"] if c["key"] == "fault_strength" else config.get(c["key"], 0) for c in controls_for(config)}


def run_conditions(cfg, settings):
    return {"settings": dict(settings or {}), "effective": effective_settings(cfg), "config_hash": config_hash(cfg), "synthetic": True}
