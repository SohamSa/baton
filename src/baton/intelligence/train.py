"""Train a small tabular model and compare it with a residual baseline.

The operational policies stay rule-based unless a held-out report says the
model improves decision utility. This module records that comparison honestly.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss

from baton.features.compute import ewma, thermal_residual
from baton.simulation.engine import ScenarioConfig, run_scenario

FEATURE_NAMES = ["residual_ewma", "freshness_steps", "util", "power_limit_ratio", "support_count"]
HORIZON = 8


def split_name(scenario_id: str) -> str:
    bucket = int(hashlib.sha256(scenario_id.encode()).hexdigest(), 16) % 10
    if bucket < 6:
        return "train"
    if bucket < 8:
        return "val"
    return "test"


def _rows_for(seed: int, steps: int = 24) -> list[dict]:
    scenario_id = f"train-scenario-{seed}"
    cfg = ScenarioConfig(
        scenario_id=scenario_id,
        seed=seed,
        steps=steps,
        checkpoint_interval=100,
        random_faults=True,
        fault_rate_per_gpu=0.8,
        gpus_per_host=2,
    )
    result = run_scenario(cfg, "reactive")
    grouped: dict[str, list[dict]] = {}
    for row in result["observations"]:
        if row.get("entity_kind") != "accelerator":
            continue
        grouped.setdefault(row["entity_id"], []).append(row)
    examples = []
    faults = result["evaluator"]["faults"]
    for entity_id, series in grouped.items():
        for step in range(3, steps - 1):
            visible = [row for row in series if row["availability_step"] <= step]
            if len(visible) < 3:
                continue
            residuals = [
                thermal_residual(row.get("gpu_temp_c"), row.get("power_draw_w"), 25.0, 0.12) for row in visible
            ]
            last = visible[-1]
            limit = last.get("power_limit_w") or 0
            features = [
                ewma(residuals) or 0.0,
                float(step - last["event_step"]),
                float(last.get("sm_util_ratio") or 0),
                float(limit / 350.0),
                float(len(visible)),
            ]
            future = [
                fault
                for fault in faults
                if fault["target_id"] == entity_id and fault.get("hard_fail") is not None and step < fault["hard_fail"] <= step + HORIZON
            ]
            censored = step + HORIZON >= steps
            examples.append(
                {
                    "scenario_id": scenario_id,
                    "split": split_name(scenario_id),
                    "features": features,
                    "label": 0 if censored else int(bool(future)),
                    "censored": censored,
                }
            )
    return examples


def train(seeds: range | list[int], out_dir: Path) -> dict:
    examples = [row for seed in seeds for row in _rows_for(seed)]
    usable = [row for row in examples if not row["censored"]]
    splits = {name: [row for row in usable if row["split"] == name] for name in ("train", "val", "test")}
    if min(len(splits[name]) for name in splits) < 5:
        raise RuntimeError("not enough rows in a split; increase the seed range")
    medians = []
    train_matrix = np.array([row["features"] for row in splits["train"]], dtype=float)
    for column in range(train_matrix.shape[1]):
        medians.append(float(np.median(train_matrix[:, column])))

    def apply(rows: list[dict]) -> tuple[np.ndarray, np.ndarray]:
        matrix = np.array([row["features"] for row in rows], dtype=float)
        for column, median in enumerate(medians):
            missing = np.isnan(matrix[:, column])
            matrix[missing, column] = median
        labels = np.array([row["label"] for row in rows], dtype=int)
        return matrix, labels

    x_train, y_train = apply(splits["train"])
    x_val, y_val = apply(splits["val"])
    x_test, y_test = apply(splits["test"])
    model = LogisticRegression(max_iter=400, class_weight="balanced")
    model.fit(x_train, y_train)
    raw_val = model.predict_proba(x_val)[:, 1]
    raw_test = model.predict_proba(x_test)[:, 1]
    calibrator = IsotonicRegression(out_of_bounds="clip")
    if len(set(y_val.tolist())) > 1:
        calibrator.fit(raw_val, y_val)
        test_prob = calibrator.predict(raw_test)
    else:
        test_prob = raw_test
    baseline = np.clip(x_test[:, 0] / 10.0, 0, 1)
    model_ap = float(average_precision_score(y_test, test_prob)) if len(set(y_test.tolist())) > 1 else 0.0
    base_ap = float(average_precision_score(y_test, baseline)) if len(set(y_test.tolist())) > 1 else 0.0
    beats = bool(model_ap > base_ap + 0.02)
    report = {
        "synthetic": True,
        "feature_contract": FEATURE_NAMES,
        "horizon_steps": HORIZON,
        "split": "scenario_id hash, not row shuffle",
        "train_rows": len(splits["train"]),
        "val_rows": len(splits["val"]),
        "test_rows": len(splits["test"]),
        "model_average_precision": model_ap,
        "baseline_average_precision": base_ap,
        "brier": float(brier_score_loss(y_test, test_prob)) if len(set(y_test.tolist())) > 1 else None,
        "beats_baseline": beats,
        "default_operational_policy": "rule_based" if not beats else "trained_tabular",
        "note": "Average precision is not a calibrated failure time. The oracle is not a serving model.",
        "medians": medians,
        "coefficients": model.coef_[0].tolist(),
        "intercept": float(model.intercept_[0]),
        "censored_rows_excluded": sum(1 for row in examples if row["censored"]),
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "model_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    np.savez(
        out_dir / "model_weights.npz",
        coefficients=model.coef_[0],
        intercept=np.array([float(model.intercept_[0])]),
        medians=np.array(medians),
    )
    return report


def serve_scores(features: list[list[float]], artifact_dir: Path) -> list[float]:
    weights = np.load(artifact_dir / "model_weights.npz")
    matrix = np.array(features, dtype=float)
    for column, median in enumerate(weights["medians"]):
        missing = np.isnan(matrix[:, column])
        matrix[missing, column] = median
    intercept = float(np.array(weights["intercept"]).reshape(-1)[0])
    logits = matrix @ weights["coefficients"] + intercept
    return (1 / (1 + np.exp(-logits))).tolist()
