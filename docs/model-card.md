# Model card

Artifact: `artifacts/model_report.json` and `artifacts/model_weights.npz`.

- Task: discrete-time risk that an accelerator becomes non-functional within 8 steps, using only rows that are not censored by the horizon.
- Features: `residual_ewma`, `freshness_steps`, `util`, `power_limit_ratio`, `support_count`. Scenario identifiers are not features.
- Split: hash of `scenario_id` into train, validation, and test. Rows from one scenario stay together.
- Preprocessing: medians fit on train rows and reused at serve time.
- Model: logistic regression. Isotonic calibration is fit when the validation fold contains both classes.
- Held-out average precision on the checked run: model 0.335, residual-EWMA baseline 0.415. Brier score is recorded in the report. Average precision is not a failure time.
- Decision: `beats_baseline` is false, so the operational default remains the rule policy.
- Abstention: stale or thin evidence yields an unknown hypothesis rather than a forced cause.
- Oracle: evaluator-only. `choose` raises if something tries to serve it.

Retrain with `python -m baton.cli train`. Replace the report only with the new measured file. Do not edit the metrics by hand.
