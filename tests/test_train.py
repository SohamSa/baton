"""Training split discipline and serving parity."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from training_continuity.intelligence.train import FEATURE_NAMES, serve_scores, split_name, train


def test_splits_follow_scenario_identity_not_rows():
    groups = {split_name(f"scenario-{index}") for index in range(40)}
    assert groups == {"train", "val", "test"}
    assert split_name("scenario-3") == split_name("scenario-3")
    assert "scenario_id" not in FEATURE_NAMES


def test_train_and_serve_share_medians(tmp_path: Path):
    report = train(range(8), tmp_path)
    assert report["default_operational_policy"] in {"rule_based", "trained_tabular"}
    assert report["beats_baseline"] in {True, False}
    assert report["synthetic"] is True
    features = [[np.nan, 0, 0.5, 1, 6]]
    scores = serve_scores(features, tmp_path)
    assert len(scores) == 1
    weights = np.load(tmp_path / "model_weights.npz")
    assert list(weights["medians"]) == report["medians"]
